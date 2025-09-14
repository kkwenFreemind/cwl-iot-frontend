import request from "@/utils/request";

const DEPT_BASE_URL = "/api/v1/dept";

const DeptAPI = {
  /** 獲取部門樹形列表 */
  getList(queryParams?: DeptQuery) {
    return request<any, DeptVO[]>({ url: `${DEPT_BASE_URL}`, method: "get", params: queryParams });
  },
  /** 獲取部門下拉資料來源 */
  getOptions() {
    return request<any, OptionType[]>({ url: `${DEPT_BASE_URL}/options`, method: "get" });
  },
  /** 獲取部門表單資料 */
  getFormData(id: string) {
    return request<any, DeptForm>({ url: `${DEPT_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 新增部門 */
  create(data: DeptForm) {
    return request({ url: `${DEPT_BASE_URL}`, method: "post", data });
  },
  /** 修改部門 */
  update(id: string, data: DeptForm) {
    return request({ url: `${DEPT_BASE_URL}/${id}`, method: "put", data });
  },
  /** 批次刪除部門，多個以英文逗號(,)分割 */
  deleteByIds(ids: string) {
    return request({ url: `${DEPT_BASE_URL}/${ids}`, method: "delete" });
  },
};

export default DeptAPI;

export interface DeptQuery {
  /** 搜尋關鍵字 */
  keywords?: string;
  /** 狀態 */
  status?: number;
}

export interface DeptVO {
  /** 子部門 */
  children?: DeptVO[];
  /** 建立時間 */
  createTime?: Date;
  /** 部門ID */
  id?: string;
  /** 部門名稱 */
  name?: string;
  /** 部門編號 */
  code?: string;
  /** 父部門ID */
  parentid?: string;
  /** 排序 */
  sort?: number;
  /** 狀態(1:啟用；0:禁用) */
  status?: number;
  /** 修改時間 */
  updateTime?: Date;
  /** 中心緯度 */
  centerLatitude?: number;
  /** 中心經度 */
  centerLongitude?: number;
}

export interface DeptForm {
  /** 部門ID(新增不填) */
  id?: string;
  /** 部門名稱 */
  name?: string;
  /** 部門編號 */
  code?: string;
  /** 父部門ID */
  parentId: string;
  /** 排序 */
  sort?: number;
  /** 狀態(1:啟用；0：禁用) */
  status?: number;
  /** 中心緯度 */
  centerLatitude?: number;
  /** 中心經度 */
  centerLongitude?: number;
}
