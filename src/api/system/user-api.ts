import request from "@/utils/request";

const USER_BASE_URL = "/api/v1/users";

const UserAPI = {
  /**
   * 獲取當前登入使用者資訊
   * Get current logged-in user information
   *
   * @returns 登入使用者暱稱、頭像資訊，包括角色和許可權
   * @returns Current user's nickname, avatar, roles and permissions
   */
  getInfo() {
    return request<any, UserInfo>({
      url: `${USER_BASE_URL}/me`,
      method: "get",
    });
  },

  /**
   * 獲取使用者分頁列表
   * Get paginated user list
   *
   * @param queryParams 查詢引數
   * @param queryParams Query parameters for pagination and filtering
   */
  getPage(queryParams: UserPageQuery) {
    return request<any, PageResult<UserPageVO[]>>({
      url: `${USER_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 獲取使用者表單詳情
   * Get user form details
   *
   * @param userId 使用者ID
   * @param userId User ID
   * @returns 使用者表單詳情
   * @returns User form details
   */
  getFormData(userId: string) {
    return request<any, UserForm>({
      url: `${USER_BASE_URL}/${userId}/form`,
      method: "get",
    });
  },

  /**
   * 新增使用者
   * Create new user
   *
   * @param data 使用者表單資料
   * @param data User form data
   */
  create(data: UserForm) {
    return request({
      url: `${USER_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改使用者
   * Update user
   *
   * @param id 使用者ID
   * @param id User ID
   * @param data 使用者表單資料
   * @param data User form data
   */
  update(id: string, data: UserForm) {
    return request({
      url: `${USER_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 修改使用者密碼
   * Reset user password
   *
   * @param id 使用者ID
   * @param id User ID
   * @param password 新密碼
   * @param password New password
   */
  resetPassword(id: string, password: string) {
    return request({
      url: `${USER_BASE_URL}/${id}/password/reset`,
      method: "put",
      params: { password },
    });
  },

  /**
   * 批次刪除使用者，多個以英文逗號(,)分割
   * Batch delete users, multiple IDs separated by comma (,)
   *
   * @param ids 使用者ID字串，多個以英文逗號(,)分割
   * @param ids User ID string, multiple IDs separated by comma (,)
   */
  deleteByIds(ids: string) {
    return request({
      url: `${USER_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * Export users
   * 匯出使用者資料
   *
   * @param queryParams 查詢引數
   * @param queryParams Query parameters for filtering export data
   */
  export(queryParams: UserPageQuery) {
    return request({
      url: `${USER_BASE_URL}/export`,
      method: "get",
      params: queryParams,
      responseType: "blob",
    });
  },

  /**
   * Get user profile
   * 獲取使用者個人資訊
   */
  getProfile() {
    return request<any, UserProfileVO>({
      url: `${USER_BASE_URL}/profile`,
      method: "get",
    });
  },

  /**
   * 修改個人中心使用者資訊
   * Update user profile information
   */
  updateProfile(data: UserProfileForm) {
    return request({
      url: `${USER_BASE_URL}/profile`,
      method: "put",
      data,
    });
  },

  /**
   * 修改個人中心使用者密碼
   * Change user password in profile center
   */
  changePassword(data: PasswordChangeForm) {
    return request({
      url: `${USER_BASE_URL}/password`,
      method: "put",
      data,
    });
  },

  /**
   * 獲取使用者下拉選單
   * Get user dropdown options
   */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${USER_BASE_URL}/options`,
      method: "get",
    });
  },
};

export default UserAPI;

/**
 * 登入使用者資訊
 * Logged-in user information
 */
export interface UserInfo {
  /** 使用者ID */
  /** User ID */
  userId?: string;

  /** 使用者名稱 */
  /** Username */
  username?: string;

  /** 暱稱 */
  /** Nickname */
  nickname?: string;

  /** 頭像URL */
  /** Avatar URL */
  avatar?: string;

  /** 角色 */
  /** Roles */
  roles: string[];

  /** 許可權 */
  /** Permissions */
  perms: string[];
}

/**
 * 使用者分頁查詢物件
 * User page query object
 */
export interface UserPageQuery extends PageQuery {
  /** 搜尋關鍵字 */
  /** Search keywords */
  keywords?: string;

  /** 使用者狀態 */
  /** User status */
  status?: number;

  /** 部門ID */
  /** Department ID */
  deptId?: string;

  /** 開始時間 */
  /** Start time */
  createTime?: [string, string];
}

/**
 * 使用者分頁物件
 * User page object
 */
export interface UserPageVO {
  /** 使用者ID */
  /** User ID */
  id: string;
  /** 使用者頭像URL */
  /** User avatar URL */
  avatar?: string;
  /** 建立時間 */
  /** Create time */
  createTime?: Date;
  /** 部門名稱 */
  /** Department name */
  deptName?: string;
  /** 使用者郵箱 */
  /** User email */
  email?: string;
  /** 性別 */
  /** Gender */
  gender?: number;
  /** 手機號 */
  /** Mobile number */
  mobile?: string;
  /** 使用者暱稱 */
  /** User nickname */
  nickname?: string;
  /** 角色名稱，多個使用英文逗號(,)分割 */
  /** Role names, multiple roles separated by comma (,) */
  roleNames?: string;
  /** 使用者狀態(1:啟用;0:禁用) */
  /** User status (1: enabled; 0: disabled) */
  status?: number;
  /** 使用者名稱 */
  /** Username */
  username?: string;
}

/**
 * 使用者表單型別
 * User form type
 */
export interface UserForm {
  /** 使用者ID */
  /** User ID */
  id?: string;
  /** 使用者頭像 */
  /** User avatar */
  avatar?: string;
  /** 部門ID */
  /** Department ID */
  deptId?: string;
  /** 郵箱 */
  /** Email */
  email?: string;
  /** 性別 */
  /** Gender */
  gender?: number;
  /** 手機號 */
  /** Mobile number */
  mobile?: string;
  /** 暱稱 */
  /** Nickname */
  nickname?: string;
  /** 角色ID集合 */
  /** Role ID collection */
  roleIds?: number[];
  /** 使用者狀態(1:正常;0:禁用) */
  /** User status (1: normal; 0: disabled) */
  status?: number;
  /** 使用者名稱 */
  /** Username */
  username?: string;
}

/**
 * 個人中心使用者資訊
 * User profile information
 */
export interface UserProfileVO {
  /** 使用者ID */
  /** User ID */
  id?: string;

  /** 使用者名稱 */
  /** Username */
  username?: string;

  /** 暱稱 */
  /** Nickname */
  nickname?: string;

  /** 頭像URL */
  /** Avatar URL */
  avatar?: string;

  /** 性別 */
  /** Gender */
  gender?: number;

  /** 手機號 */
  /** Mobile number */
  mobile?: string;

  /** 郵箱 */
  /** Email */
  email?: string;

  /** 部門名稱 */
  /** Department name */
  deptName?: string;

  /** 角色名稱，多個使用英文逗號(,)分割 */
  /** Role names, multiple roles separated by comma (,) */
  roleNames?: string;

  /** 建立時間 */
  /** Create time */
  createTime?: Date;
}

/**
 * 個人中心使用者資訊表單
 * User profile form
 */
export interface UserProfileForm {
  /** 使用者ID */
  /** User ID */
  id?: string;

  /** 使用者名稱 */
  /** Username */
  username?: string;

  /** 暱稱 */
  /** Nickname */
  nickname?: string;

  /** 頭像URL */
  /** Avatar URL */
  avatar?: string;

  /** 性別 */
  /** Gender */
  gender?: number;

  /** 手機號 */
  /** Mobile number */
  mobile?: string;

  /** 郵箱 */
  /** Email */
  email?: string;
}

/**
 * 修改密碼錶單
 * Password change form
 */
export interface PasswordChangeForm {
  /** 原密碼 */
  /** Old password */
  oldPassword?: string;
  /** 新密碼 */
  /** New password */
  newPassword?: string;
  /** 確認新密碼 */
  /** Confirm new password */
  confirmPassword?: string;
}
