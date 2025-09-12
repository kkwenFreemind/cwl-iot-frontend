import request from "@/utils/request";

const USER_BASE_URL = "/api/v1/users";

const UserAPI = {
  /**
   * 獲取當前登入使用者資訊
   *
   * @returns 登入使用者暱稱、頭像資訊，包括角色和許可權
   */
  getInfo() {
    return request<any, UserInfo>({
      url: `${USER_BASE_URL}/me`,
      method: "get",
    });
  },

  /**
   * 獲取使用者分頁列表
   *
   * @param queryParams 查詢引數
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
   *
   * @param userId 使用者ID
   * @returns 使用者表單詳情
   */
  getFormData(userId: string) {
    return request<any, UserForm>({
      url: `${USER_BASE_URL}/${userId}/form`,
      method: "get",
    });
  },

  /**
   * 新增使用者
   *
   * @param data 使用者表單資料
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
   *
   * @param id 使用者ID
   * @param data 使用者表單資料
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
   *
   * @param id 使用者ID
   * @param password 新密碼
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
   *
   * @param ids 使用者ID字串，多個以英文逗號(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${USER_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /** 下載使用者匯入模板 */
  downloadTemplate() {
    return request({
      url: `${USER_BASE_URL}/template`,
      method: "get",
      responseType: "blob",
    });
  },

  /**
   * 匯出使用者
   *
   * @param queryParams 查詢引數
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
   * 匯入使用者
   *
   * @param deptId 部門ID
   * @param file 匯入檔案
   */
  import(deptId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<any, ExcelResult>({
      url: `${USER_BASE_URL}/import`,
      method: "post",
      params: { deptId },
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /** 獲取個人中心使用者資訊 */
  getProfile() {
    return request<any, UserProfileVO>({
      url: `${USER_BASE_URL}/profile`,
      method: "get",
    });
  },

  /** 修改個人中心使用者資訊 */
  updateProfile(data: UserProfileForm) {
    return request({
      url: `${USER_BASE_URL}/profile`,
      method: "put",
      data,
    });
  },

  /** 修改個人中心使用者密碼 */
  changePassword(data: PasswordChangeForm) {
    return request({
      url: `${USER_BASE_URL}/password`,
      method: "put",
      data,
    });
  },

  /**
   *  獲取使用者下拉選單
   */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${USER_BASE_URL}/options`,
      method: "get",
    });
  },
};

export default UserAPI;

/** 登入使用者資訊 */
export interface UserInfo {
  /** 使用者ID */
  userId?: string;

  /** 使用者名稱 */
  username?: string;

  /** 暱稱 */
  nickname?: string;

  /** 頭像URL */
  avatar?: string;

  /** 角色 */
  roles: string[];

  /** 許可權 */
  perms: string[];
}

/**
 * 使用者分頁查詢物件
 */
export interface UserPageQuery extends PageQuery {
  /** 搜尋關鍵字 */
  keywords?: string;

  /** 使用者狀態 */
  status?: number;

  /** 部門ID */
  deptId?: string;

  /** 開始時間 */
  createTime?: [string, string];
}

/** 使用者分頁物件 */
export interface UserPageVO {
  /** 使用者ID */
  id: string;
  /** 使用者頭像URL */
  avatar?: string;
  /** 建立時間 */
  createTime?: Date;
  /** 部門名稱 */
  deptName?: string;
  /** 使用者郵箱 */
  email?: string;
  /** 性別 */
  gender?: number;
  /** 手機號 */
  mobile?: string;
  /** 使用者暱稱 */
  nickname?: string;
  /** 角色名稱，多個使用英文逗號(,)分割 */
  roleNames?: string;
  /** 使用者狀態(1:啟用;0:禁用) */
  status?: number;
  /** 使用者名稱 */
  username?: string;
}

/** 使用者表單型別 */
export interface UserForm {
  /** 使用者ID */
  id?: string;
  /** 使用者頭像 */
  avatar?: string;
  /** 部門ID */
  deptId?: string;
  /** 郵箱 */
  email?: string;
  /** 性別 */
  gender?: number;
  /** 手機號 */
  mobile?: string;
  /** 暱稱 */
  nickname?: string;
  /** 角色ID集合 */
  roleIds?: number[];
  /** 使用者狀態(1:正常;0:禁用) */
  status?: number;
  /** 使用者名稱 */
  username?: string;
}

/** 個人中心使用者資訊 */
export interface UserProfileVO {
  /** 使用者ID */
  id?: string;

  /** 使用者名稱 */
  username?: string;

  /** 暱稱 */
  nickname?: string;

  /** 頭像URL */
  avatar?: string;

  /** 性別 */
  gender?: number;

  /** 手機號 */
  mobile?: string;

  /** 郵箱 */
  email?: string;

  /** 部門名稱 */
  deptName?: string;

  /** 角色名稱，多個使用英文逗號(,)分割 */
  roleNames?: string;

  /** 建立時間 */
  createTime?: Date;
}

/** 個人中心使用者資訊表單 */
export interface UserProfileForm {
  /** 使用者ID */
  id?: string;

  /** 使用者名稱 */
  username?: string;

  /** 暱稱 */
  nickname?: string;

  /** 頭像URL */
  avatar?: string;

  /** 性別 */
  gender?: number;

  /** 手機號 */
  mobile?: string;

  /** 郵箱 */
  email?: string;
}

/** 修改密碼錶單 */
export interface PasswordChangeForm {
  /** 原密碼 */
  oldPassword?: string;
  /** 新密碼 */
  newPassword?: string;
  /** 確認新密碼 */
  confirmPassword?: string;
}
