import request from "@/utils/request";

const METRIC_BASE_URL = "/api/v1/iot-metric-definitions";

const MetricAPI = {
  /**
   * 獲取指標定義列表（分頁）
   * Get metric definitions with pagination
   *
   * @param queryParams 查詢參數
   * @returns 分頁結果
   */
  getMetricDefinitionsPage(queryParams?: MetricQuery) {
    return request<any, any>({
      url: `${METRIC_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 獲取指標定義列表（不分頁）
   * Get metric definitions without pagination
   *
   * @param queryParams 查詢參數
   * @returns 指標定義列表
   */
  getMetricDefinitions(queryParams?: MetricQuery) {
    return request<any, IotMetricDefinition[]>({
      url: `${METRIC_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 根據ID獲取指標定義
   * Get metric definition by ID
   *
   * @param id 指標定義ID
   * @param deptId 部門ID
   * @returns 指標定義詳情
   */
  getMetricDefinitionById(id: string, deptId: string) {
    return request<any, IotMetricDefinition>({
      url: `${METRIC_BASE_URL}/${id}`,
      method: "get",
      params: { deptId },
    });
  },

  /**
   * 新增指標定義
   * Create new metric definition
   *
   * @param data 指標定義表單數據
   * @returns 創建結果
   */
  createMetricDefinition(data: MetricCreateForm) {
    return request({
      url: `${METRIC_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 更新指標定義
   * Update metric definition
   *
   * @param id 指標定義ID
   * @param data 指標定義表單數據
   * @returns 更新結果
   */
  updateMetricDefinition(id: string, data: MetricUpdateForm) {
    return request({
      url: `${METRIC_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 刪除指標定義
   * Delete metric definition (soft delete)
   *
   * @param id 指標定義ID
   * @param deptId 部門ID
   * @returns 刪除結果
   */
  deleteMetricDefinition(id: string, deptId: string) {
    return request({
      url: `${METRIC_BASE_URL}/${id}`,
      method: "delete",
      params: { deptId },
    });
  },

  /**
   * 根據關鍵字搜索指標定義
   * Search metric definitions by keyword
   *
   * @param keyword 搜索關鍵字
   * @param deptId 部門ID
   * @param page 頁碼
   * @param size 每頁大小
   * @returns 搜索結果
   */
  searchMetricDefinitions(keyword: string, deptId: string, page = 0, size = 10) {
    return request<any, PageResult<IotMetricDefinition>>({
      url: `${METRIC_BASE_URL}/search`,
      method: "get",
      params: { keyword, deptId, page, size },
    });
  },

  /**
   * 根據物理量獲取指標定義
   * Get metric definitions by physical quantity
   *
   * @param physicalQuantity 物理量
   * @param deptId 部門ID
   * @returns 指標定義列表
   */
  getMetricDefinitionsByPhysicalQuantity(physicalQuantity: string, deptId: string) {
    return request<any, IotMetricDefinition[]>({
      url: `${METRIC_BASE_URL}/by-physical-quantity`,
      method: "get",
      params: { physicalQuantity, deptId },
    });
  },

  /**
   * 根據數據類型獲取指標定義
   * Get metric definitions by data type
   *
   * @param dataType 數據類型
   * @param deptId 部門ID
   * @returns 指標定義列表
   */
  getMetricDefinitionsByDataType(dataType: string, deptId: string) {
    return request<any, IotMetricDefinition[]>({
      url: `${METRIC_BASE_URL}/by-data-type`,
      method: "get",
      params: { dataType, deptId },
    });
  },
};

export default MetricAPI;

// TypeScript 類型定義
export interface MetricQuery {
  deptId?: string;
  page?: number;
  size?: number;
  keyword?: string;
  physicalQuantity?: string;
  dataType?: string;
}

export interface MetricCreateForm {
  metricName: string;
  alias?: string;
  description?: string;
  physicalQuantity: string;
  unit: string;
  dataType: string;
  minValue?: number;
  maxValue?: number;
  precision?: number;
  deptId: string;
}

export interface MetricUpdateForm {
  metricName?: string;
  alias?: string;
  description?: string;
  physicalQuantity?: string;
  unit?: string;
  dataType?: string;
  minValue?: number;
  maxValue?: number;
  precision?: number;
}

export interface IotMetricDefinition {
  id: string;
  deptId: string;
  metricName: string;
  alias?: string;
  description?: string;
  physicalQuantity: string;
  unit: string;
  dataType: string;
  minValue?: number;
  maxValue?: number;
  precision?: number;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  unitCompatible: boolean;
  numericType: boolean;
  deptName?: string;
  createBy?: string;
  updateBy?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}
