/**
 * 響應碼列舉
 */
export const enum ResultEnum {
  /**
   * 成功
   */
  SUCCESS = "00000",
  /**
   * 錯誤
   */
  ERROR = "B0001",

  /**
   * 訪問令牌無效或過期
   */
  ACCESS_TOKEN_INVALID = "A0230",

  /**
   * 重新整理令牌無效或過期
   */
  REFRESH_TOKEN_INVALID = "A0231",
}
