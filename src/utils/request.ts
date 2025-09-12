import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { useUserStoreHook } from "@/store/modules/user-store";
import { ResultEnum } from "@/enums/api/result.enum";
import { AuthStorage } from "@/utils/auth";
import router from "@/router";

/**
 * 建立 HTTP 請求例項
 */
const httpRequest = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params),
});

/**
 * 請求攔截器 - 新增 Authorization 頭
 */
httpRequest.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = AuthStorage.getAccessToken();

    // 如果 Authorization 設定為 no-auth，則不攜帶 Token
    if (config.headers.Authorization !== "no-auth" && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * 響應攔截器 - 統一處理響應和錯誤
 */
httpRequest.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 如果響應是二進位制流，則直接返回（用於檔案下載、Excel 匯出等）
    if (response.config.responseType === "blob") {
      return response;
    }

    const { code, data, msg } = response.data;

    // 請求成功
    if (code === ResultEnum.SUCCESS) {
      return data;
    }

    // 業務錯誤
    ElMessage.error(msg || "系統出錯");
    return Promise.reject(new Error(msg || "Business Error"));
  },
  async (error) => {
    console.error("Response interceptor error:", error);

    const { config, response } = error;

    // 網路錯誤或伺服器無響應
    if (!response) {
      ElMessage.error("網路連線失敗，請檢查網路設定");
      return Promise.reject(error);
    }

    const { code, msg } = response.data as ApiResponse;

    switch (code) {
      case ResultEnum.ACCESS_TOKEN_INVALID:
        // Access Token 過期，嘗試重新整理
        return refreshTokenAndRetry(config);

      case ResultEnum.REFRESH_TOKEN_INVALID:
        // Refresh Token 過期，跳轉登入頁
        await redirectToLogin("登入已過期，請重新登入");
        return Promise.reject(new Error(msg || "Refresh Token Invalid"));

      default:
        ElMessage.error(msg || "請求失敗");
        return Promise.reject(new Error(msg || "Request Error"));
    }
  }
);

/**
 * 重試請求的回撥函式型別
 */
type RetryCallback = () => void;

// Token 重新整理相關狀態
let isRefreshingToken = false;
const pendingRequests: RetryCallback[] = [];

/**
 * 重新整理 Token 並重試請求
 */
async function refreshTokenAndRetry(config: InternalAxiosRequestConfig): Promise<any> {
  return new Promise((resolve, reject) => {
    // 封裝需要重試的請求
    const retryRequest = () => {
      const newToken = AuthStorage.getAccessToken();
      if (newToken && config.headers) {
        config.headers.Authorization = `Bearer ${newToken}`;
      }
      httpRequest(config).then(resolve).catch(reject);
    };

    // 將請求加入等待佇列
    pendingRequests.push(retryRequest);

    // 如果沒有正在重新整理，則開始重新整理流程
    if (!isRefreshingToken) {
      isRefreshingToken = true;

      useUserStoreHook()
        .refreshToken()
        .then(() => {
          // 重新整理成功，重試所有等待的請求
          pendingRequests.forEach((callback) => {
            try {
              callback();
            } catch (error) {
              console.error("Retry request error:", error);
            }
          });
          // 清空佇列
          pendingRequests.length = 0;
        })
        .catch(async (error) => {
          console.error("Token refresh failed:", error);
          // 重新整理失敗，清空佇列並跳轉登入頁
          pendingRequests.length = 0;
          await redirectToLogin("登入狀態已失效，請重新登入");
          // 拒絕所有等待的請求
          pendingRequests.forEach(() => {
            reject(new Error("Token refresh failed"));
          });
        })
        .finally(() => {
          isRefreshingToken = false;
        });
    }
  });
}

/**
 * 重定向到登入頁面
 */
async function redirectToLogin(message: string = "請重新登入"): Promise<void> {
  try {
    ElNotification({
      title: "提示",
      message,
      type: "warning",
      duration: 3000,
    });

    await useUserStoreHook().resetAllState();

    // 跳轉到登入頁，保留當前路由用於登入後跳轉
    const currentPath = router.currentRoute.value.fullPath;
    await router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  } catch (error) {
    console.error("Redirect to login error:", error);
  }
}

export default httpRequest;
