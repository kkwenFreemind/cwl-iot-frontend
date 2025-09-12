import request from "@/utils/request";

const ROLE_BASE_URL = "/api/v1/roles";

const RoleAPI = {
  /** 獲取角色分頁資料 */
  getPage(queryParams?: RolePageQuery) {
    return request<any, PageResult<RolePageVO[]>>({
      url: `${ROLE_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /** 獲取角色下拉資料來源 */
  getOptions() {
    return request<any, OptionType[]>({ url: `${ROLE_BASE_URL}/options`, method: "get" });
  },
  /** 獲取角色的選單ID集合 */
  getRoleMenuIds(roleId: string) {
    return request<any, string[]>({ url: `${ROLE_BASE_URL}/${roleId}/menuIds`, method: "get" });
  },
  /** 分配選單許可權 */
  updateRoleMenus(roleId: string, data: number[]) {
    return request({ url: `${ROLE_BASE_URL}/${roleId}/menus`, method: "put", data });
  },
  /** 獲取角色表單資料 */
  getFormData(id: string) {
    return request<any, RoleForm>({ url: `${ROLE_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 新增角色 */
  create(data: RoleForm) {
    return request({ url: `${ROLE_BASE_URL}`, method: "post", data });
  },
  /** 更新角色 */
  update(id: string, data: RoleForm) {
    return request({ url: `${ROLE_BASE_URL}/${id}`, method: "put", data });
  },
  /** 批次刪除角色，多個以英文逗號(,)分割 */
  deleteByIds(ids: string) {
    return request({ url: `${ROLE_BASE_URL}/${ids}`, method: "delete" });
  },
};

export default RoleAPI;

export interface RolePageQuery extends PageQuery {
  /** 搜尋關鍵字 */
  keywords?: string;
}
export interface RolePageVO {
  /** 角色ID */
  id?: string;
  /** 角色編碼 */
  code?: string;
  /** 角色名稱 */
  name?: string;
  /** 排序 */
  sort?: number;
  /** 角色狀態 */
  status?: number;
  /** 建立時間 */
  createTime?: Date;
  /** 修改時間 */
  updateTime?: Date;
}
export interface RoleForm {
  /** 角色ID */
  id?: string;
  /** 角色編碼 */
  code?: string;
  /** 資料許可權 */
  dataScope?: number;
  /** 角色名稱 */
  name?: string;
  /** 排序 */
  sort?: number;
  /** 角色狀態(1-正常；0-停用) */
  status?: number;
}
