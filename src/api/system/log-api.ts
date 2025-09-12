import request from "@/utils/request";

const LOG_BASE_URL = "/api/v1/logs";

const LogAPI = {
  /** 獲取日誌分頁列表 */
  getPage(queryParams: LogPageQuery) {
    return request<any, PageResult<LogPageVO[]>>({
      url: `${LOG_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /** 獲取訪問趨勢 */
  getVisitTrend(queryParams: VisitTrendQuery) {
    return request<any, VisitTrendVO>({
      url: `${LOG_BASE_URL}/visit-trend`,
      method: "get",
      params: queryParams,
    });
  },
  /** 獲取訪問統計 */
  getVisitStats() {
    return request<any, VisitStatsVO>({ url: `${LOG_BASE_URL}/visit-stats`, method: "get" });
  },
};

export default LogAPI;

export interface LogPageQuery extends PageQuery {
  /** 搜尋關鍵字 */
  keywords?: string;
  /** 操作時間 */
  createTime?: [string, string];
}
export interface LogPageVO {
  /** 主鍵 */
  id: string;
  /** 日誌模組 */
  module: string;
  /** 日誌內容 */
  content: string;
  /** 請求路徑 */
  requestUri: string;
  /** 請求方法 */
  method: string;
  /** IP 地址 */
  ip: string;
  /** 地區 */
  region: string;
  /** 瀏覽器 */
  browser: string;
  /** 終端系統 */
  os: string;
  /** 執行時間(毫秒) */
  executionTime: number;
  /** 操作人 */
  operator: string;
}
export interface VisitTrendVO {
  /** 日期列表 */
  dates: string[];
  /** 瀏覽量(PV) */
  pvList: number[];
  /** 訪客數(UV) */
  uvList: number[];
  /** IP數 */
  ipList: number[];
}
export interface VisitTrendQuery {
  /** 開始日期 */
  startDate: string;
  /** 結束日期 */
  endDate: string;
}
export interface VisitStatsVO {
  /** 今日訪客數(UV) */
  todayUvCount: number;
  /** 總訪客數 */
  totalUvCount: number;
  /** 訪客數同比增長率（相對於昨天同一時間段的增長率） */
  uvGrowthRate: number;
  /** 今日瀏覽量(PV) */
  todayPvCount: number;
  /** 總瀏覽量 */
  totalPvCount: number;
  /** 同比增長率（相對於昨天同一時間段的增長率） */
  pvGrowthRate: number;
}
