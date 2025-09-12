import request from "@/utils/request";

const CONFIG_BASE_URL = "/api/v1/config";

const ConfigAPI = {
  /** 獲取配置分頁資料 */
  getPage(queryParams?: ConfigPageQuery) {
    return request<any, PageResult<ConfigPageVO[]>>({
      url: `${CONFIG_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /** 獲取配置表單資料 */
  getFormData(id: string) {
    return request<any, ConfigForm>({
      url: `${CONFIG_BASE_URL}/${id}/form`,
      method: "get",
    });
  },
  /** 新增配置 */
  create(data: ConfigForm) {
    return request({ url: `${CONFIG_BASE_URL}`, method: "post", data });
  },
  /** 修改配置 */
  update(id: string, data: ConfigForm) {
    return request({ url: `${CONFIG_BASE_URL}/${id}`, method: "put", data });
  },
  /** 刪除配置 */
  deleteById(id: string) {
    return request({ url: `${CONFIG_BASE_URL}/${id}`, method: "delete" });
  },
  /** 重新整理配置快取 */
  refreshCache() {
    return request({ url: `${CONFIG_BASE_URL}/refresh`, method: "PUT" });
  },
};

export default ConfigAPI;

export interface ConfigPageQuery extends PageQuery {
  /** 搜尋關鍵字 */
  keywords?: string;
}

export interface ConfigForm {
  /** 主鍵 */
  id?: string;
  /** 配置名稱 */
  configName?: string;
  /** 配置鍵 */
  configKey?: string;
  /** 配置值 */
  configValue?: string;
  /** 描述、備註 */
  remark?: string;
}

export interface ConfigPageVO {
  /** 主鍵 */
  id?: string;
  /** 配置名稱 */
  configName?: string;
  /** 配置鍵 */
  configKey?: string;
  /** 配置值 */
  configValue?: string;
  /** 描述、備註 */
  remark?: string;
}
