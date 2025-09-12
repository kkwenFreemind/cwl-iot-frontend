import { store } from "@/store";

import AuthAPI, { type LoginFormData } from "@/api/auth-api";
import UserAPI, { type UserInfo } from "@/api/system/user-api";

import { AuthStorage } from "@/utils/auth";
import { usePermissionStoreHook } from "@/store/modules/permission-store";
import { useDictStoreHook } from "@/store/modules/dict-store";
import { useTagsViewStore } from "@/store";
import { cleanupWebSocket } from "@/plugins/websocket";

export const useUserStore = defineStore("user", () => {
  // 使用者資訊
  const userInfo = ref<UserInfo>({} as UserInfo);
  // 記住我狀態
  const rememberMe = ref(AuthStorage.getRememberMe());

  /**
   * 登入
   *
   * @param {LoginFormData}
   * @returns
   */
  function login(LoginFormData: LoginFormData) {
    return new Promise<void>((resolve, reject) => {
      AuthAPI.login(LoginFormData)
        .then((data) => {
          const { accessToken, refreshToken } = data;
          // 儲存記住我狀態和token
          rememberMe.value = LoginFormData.rememberMe;
          AuthStorage.setTokens(accessToken, refreshToken, rememberMe.value);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 獲取使用者資訊
   *
   * @returns {UserInfo} 使用者資訊
   */
  function getUserInfo() {
    return new Promise<UserInfo>((resolve, reject) => {
      UserAPI.getInfo()
        .then((data) => {
          if (!data) {
            reject("Verification failed, please Login again.");
            return;
          }
          Object.assign(userInfo.value, { ...data });
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 登出
   */
  function logout() {
    return new Promise<void>((resolve, reject) => {
      AuthAPI.logout()
        .then(() => {
          // 重置所有系統狀態
          resetAllState();
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 重置所有系統狀態
   * 統一處理所有清理工作，包括使用者憑證、路由、快取等
   */
  function resetAllState() {
    // 1. 重置使用者狀態
    resetUserState();

    // 2. 重置其他模組狀態
    // 重置路由
    usePermissionStoreHook().resetRouter();
    // 清除字典快取
    useDictStoreHook().clearDictCache();
    // 清除標籤檢視
    useTagsViewStore().delAllViews();

    // 3. 清理 WebSocket 連線
    cleanupWebSocket();
    console.log("[UserStore] WebSocket connections cleaned up");

    return Promise.resolve();
  }

  /**
   * 重置使用者狀態
   * 僅處理使用者模組內的狀態
   */
  function resetUserState() {
    // 清除使用者憑證
    AuthStorage.clearAuth();
    // 重置使用者資訊
    userInfo.value = {} as UserInfo;
  }

  /**
   * 重新整理 token
   */
  function refreshToken() {
    const refreshToken = AuthStorage.getRefreshToken();

    if (!refreshToken) {
      return Promise.reject(new Error("沒有有效的重新整理令牌"));
    }

    return new Promise<void>((resolve, reject) => {
      AuthAPI.refreshToken(refreshToken)
        .then((data) => {
          const { accessToken, refreshToken: newRefreshToken } = data;
          // 更新令牌，保持當前記住我狀態
          AuthStorage.setTokens(accessToken, newRefreshToken, AuthStorage.getRememberMe());
          resolve();
        })
        .catch((error) => {
          console.log(" refreshToken  重新整理失敗", error);
          reject(error);
        });
    });
  }

  return {
    userInfo,
    rememberMe,
    isLoggedIn: () => !!AuthStorage.getAccessToken(),
    getUserInfo,
    login,
    logout,
    resetAllState,
    resetUserState,
    refreshToken,
  };
});

/**
 * 在元件外部使用UserStore的鉤子函式
 * @see https://pinia.vuejs.org/core-concepts/outside-component-usage.html
 */
export function useUserStoreHook() {
  return useUserStore(store);
}
