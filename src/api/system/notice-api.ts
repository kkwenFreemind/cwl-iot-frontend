import request from "@/utils/request";

const NOTICE_BASE_URL = "/api/v1/notices";

const NoticeAPI = {
  /** 獲取通知公告分頁資料 */
  getPage(queryParams?: NoticePageQuery) {
    return request<any, PageResult<NoticePageVO[]>>({
      url: `${NOTICE_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /** 獲取通知公告表單資料 */
  getFormData(id: string) {
    return request<any, NoticeForm>({ url: `${NOTICE_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 新增通知公告 */
  create(data: NoticeForm) {
    return request({ url: `${NOTICE_BASE_URL}`, method: "post", data });
  },
  /** 更新通知公告 */
  update(id: string, data: NoticeForm) {
    return request({ url: `${NOTICE_BASE_URL}/${id}`, method: "put", data });
  },
  /** 批次刪除通知公告，多個以英文逗號(,)分割 */
  deleteByIds(ids: string) {
    return request({ url: `${NOTICE_BASE_URL}/${ids}`, method: "delete" });
  },
  /** 釋出通知 */
  publish(id: string) {
    return request({ url: `${NOTICE_BASE_URL}/${id}/publish`, method: "put" });
  },
  /** 撤回通知 */
  revoke(id: string) {
    return request({ url: `${NOTICE_BASE_URL}/${id}/revoke`, method: "put" });
  },
  /** 檢視通知 */
  getDetail(id: string) {
    return request<any, NoticeDetailVO>({ url: `${NOTICE_BASE_URL}/${id}/detail`, method: "get" });
  },
  /** 全部已讀 */
  readAll() {
    return request({ url: `${NOTICE_BASE_URL}/read-all`, method: "put" });
  },
  /** 獲取我的通知分頁列表 */
  getMyNoticePage(queryParams?: NoticePageQuery) {
    return request<any, PageResult<NoticePageVO[]>>({
      url: `${NOTICE_BASE_URL}/my-page`,
      method: "get",
      params: queryParams,
    });
  },
};

export default NoticeAPI;

export interface NoticePageQuery extends PageQuery {
  /** 標題 */
  title?: string;
  /** 釋出狀態(0:草稿;1:已釋出;2:已撤回) */
  publishStatus?: number;
  /** 是否已讀(1:是;0:否) */
  isRead?: number;
}
export interface NoticeForm {
  /** 通知ID(新增不填) */
  id?: string;
  /** 標題 */
  title?: string;
  /** 內容 */
  content?: string;
  /** 型別 */
  type?: number;
  /** 優先順序/級別 */
  level?: string;
  /** 目標型別 */
  targetType?: number;
  /** 目標使用者ID(多個以英文逗號(,)分割) */
  targetUserIds?: string;
}
export interface NoticePageVO {
  /** 通知ID */
  id: string;
  /** 標題 */
  title?: string;
  /** 內容 */
  content?: string;
  /** 型別 */
  type?: number;
  /** 釋出人ID */
  publisherId?: bigint;
  /** 優先順序 */
  priority?: number;
  /** 目標型別 */
  targetType?: number;
  /** 釋出狀態 */
  publishStatus?: number;
  /** 釋出時間 */
  publishTime?: Date;
  /** 撤回時間 */
  revokeTime?: Date;
}
export interface NoticeDetailVO {
  /** 通知ID */
  id?: string;
  /** 標題 */
  title?: string;
  /** 內容 */
  content?: string;
  /** 型別 */
  type?: number;
  /** 釋出人名稱 */
  publisherName?: string;
  /** 優先順序/級別 */
  level?: string;
  /** 釋出時間 */
  publishTime?: Date;
  /** 釋出狀態 */
  publishStatus?: number;
}
