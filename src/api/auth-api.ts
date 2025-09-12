import request from "@/utils/request";

const AUTH_BASE_URL = "/api/v1/auth";

const AuthAPI = {
  /** 登入介面*/
  login(data: LoginFormData) {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("captchaKey", data.captchaKey);
    formData.append("captchaCode", data.captchaCode);
    return request<any, LoginResult>({
      url: `${AUTH_BASE_URL}/login`,
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /** 重新整理 token 介面*/
  refreshToken(refreshToken: string) {
    return request<any, LoginResult>({
      url: `${AUTH_BASE_URL}/refresh-token`,
      method: "post",
      params: { refreshToken },
      headers: {
        Authorization: "no-auth",
      },
    });
  },

  /** 退出登入介面 */
  logout() {
    return request({
      url: `${AUTH_BASE_URL}/logout`,
      method: "delete",
    });
  },

  /** 獲取驗證碼介面*/
  getCaptcha() {
    return request<any, CaptchaInfo>({
      url: `${AUTH_BASE_URL}/captcha`,
      method: "get",
    });
  },
};

export default AuthAPI;

/** 登入表單資料 */
export interface LoginFormData {
  /** 使用者名稱 */
  username: string;
  /** 密碼 */
  password: string;
  /** 驗證碼快取key */
  captchaKey: string;
  /** 驗證碼 */
  captchaCode: string;
  /** 記住我 */
  rememberMe: boolean;
}

/** 登入響應 */
export interface LoginResult {
  /** 訪問令牌 */
  accessToken: string;
  /** 重新整理令牌 */
  refreshToken: string;
  /** 令牌型別 */
  tokenType: string;
  /** 過期時間(秒) */
  expiresIn: number;
}

/** 驗證碼資訊 */
export interface CaptchaInfo {
  /** 驗證碼快取key */
  captchaKey: string;
  /** 驗證碼圖片Base64字串 */
  captchaBase64: string;
}
