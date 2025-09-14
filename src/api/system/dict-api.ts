import request from "@/utils/request";

const DICT_BASE_URL = "/api/v1/dicts";

const DictAPI = {
  /** 字典分頁列表 */
  getPage(queryParams: DictPageQuery) {
    return request<any, PageResult<DictPageVO>>({
      url: `${DICT_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /** 字典列表 */
  getList() {
    return request<any, OptionType[]>({ url: `${DICT_BASE_URL}`, method: "get" });
  },
  /** 字典表單資料 */
  getFormData(id: string) {
    return request<any, DictForm>({ url: `${DICT_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 新增字典 */
  create(data: DictForm) {
    return request({ url: `${DICT_BASE_URL}`, method: "post", data });
  },
  /** 修改字典 */
  update(id: string, data: DictForm) {
    return request({ url: `${DICT_BASE_URL}/${id}`, method: "put", data });
  },
  /** 刪除字典 */
  deleteByIds(ids: string) {
    return request({ url: `${DICT_BASE_URL}/${ids}`, method: "delete" });
  },

  /** 獲取字典項分頁列表 */
  getDictItemPage(dictCode: string, queryParams: DictItemPageQuery) {
    return request<any, PageResult<DictItemPageVO>>({
      url: `${DICT_BASE_URL}/${dictCode}/items/page`,
      method: "get",
      params: queryParams,
    });
  },
  /** 獲取字典項列表 */
  getDictItems(dictCode: string) {
    return request<any, DictItemOption[]>({
      url: `${DICT_BASE_URL}/${dictCode}/items`,
      method: "get",
    });
  },
  /** 新增字典項 */
  createDictItem(dictCode: string, data: DictItemForm) {
    return request({ url: `${DICT_BASE_URL}/${dictCode}/items`, method: "post", data });
  },
  /** 獲取字典項表單資料 */
  getDictItemFormData(dictCode: string, id: string) {
    return request<any, DictItemForm>({
      url: `${DICT_BASE_URL}/${dictCode}/items/${id}/form`,
      method: "get",
    });
  },
  /** 修改字典項 */
  updateDictItem(dictCode: string, id: string, data: DictItemForm) {
    return request({ url: `${DICT_BASE_URL}/${dictCode}/items/${id}`, method: "put", data });
  },
  /** 刪除字典項 */
  deleteDictItems(dictCode: string, ids: string) {
    return request({ url: `${DICT_BASE_URL}/${dictCode}/items/${ids}`, method: "delete" });
  },
};

export default DictAPI;

export interface DictPageQuery extends PageQuery {
  /** 搜尋關鍵字 */
  keywords?: string;
  /** 狀態(1:啟用;0:禁用) */
  status?: number;
}
export interface DictPageVO {
  /** 字典ID */
  id: string;
  /** 字典名稱 */
  name: string;
  /** 字典編碼 */
  dictCode: string;
  /** 狀態(1:啟用;0:禁用) */
  status: number;
}
export interface DictForm {
  /** 字典ID(新增不填) */
  id?: string;
  /** 字典名稱 */
  name?: string;
  /** 字典編碼 */
  dictCode?: string;
  /** 狀態(1:啟用;0:禁用) */
  status?: number;
  /** 備註 */
  remark?: string;
}
export interface DictItemPageQuery extends PageQuery {
  /** 搜尋關鍵字 */
  keywords?: string;
  /** 字典編碼 */
  dictCode?: string;
}
export interface DictItemPageVO {
  /** 字典項ID */
  id: string;
  /** 字典編碼 */
  dictCode: string;
  /** 字典項值 */
  value: string;
  /** 字典項標籤 */
  label: string;
  /** 狀態(1:啟用;0:禁用) */
  status: number;
  /** 排序 */
  sort?: number;
}
export interface DictItemForm {
  /** 字典項ID(新增不填) */
  id?: string;
  /** 字典編碼 */
  dictCode?: string;
  /** 字典項值 */
  value?: string;
  /** 字典項標籤 */
  label?: string;
  /** 狀態(1:啟用;0:禁用) */
  status?: number;
  /** 排序 */
  sort?: number;
  /** 標籤型別 */
  tagType?: "success" | "warning" | "info" | "primary" | "danger" | "";
}
export interface DictItemOption {
  /** 值 */
  value: number | string;
  /** 標籤 */
  label: string;
  /** 標籤型別 */
  tagType?: "" | "success" | "info" | "warning" | "danger";
  [key: string]: any;
}
