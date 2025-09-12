import request from "@/utils/request";
const MENU_BASE_URL = "/api/v1/menus";

const MenuAPI = {
  /** 獲取當前使用者的路由列表 */
  getRoutes() {
    return request<any, RouteVO[]>({ url: `${MENU_BASE_URL}/routes`, method: "get" });
  },
  /** 獲取選單樹形列表 */
  getList(queryParams: MenuQuery) {
    return request<any, MenuVO[]>({ url: `${MENU_BASE_URL}`, method: "get", params: queryParams });
  },
  /** 獲取選單下拉資料來源 */
  getOptions(onlyParent?: boolean) {
    return request<any, OptionType[]>({
      url: `${MENU_BASE_URL}/options`,
      method: "get",
      params: { onlyParent },
    });
  },
  /** 獲取選單表單資料 */
  getFormData(id: string) {
    return request<any, MenuForm>({ url: `${MENU_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 新增選單 */
  create(data: MenuForm) {
    return request({ url: `${MENU_BASE_URL}`, method: "post", data });
  },
  /** 修改選單 */
  update(id: string, data: MenuForm) {
    return request({ url: `${MENU_BASE_URL}/${id}`, method: "put", data });
  },
  /** 刪除選單 */
  deleteById(id: string) {
    return request({ url: `${MENU_BASE_URL}/${id}`, method: "delete" });
  },
};

export default MenuAPI;

export interface MenuQuery {
  /** 搜尋關鍵字 */
  keywords?: string;
}
export type MenuTypeEnum = 0 | 1 | 2;
export interface MenuVO {
  /** 子選單 */
  children?: MenuVO[];
  /** 元件路徑 */
  component?: string;
  /** ICON */
  icon?: string;
  /** 選單ID */
  id?: string;
  /** 選單名稱 */
  name?: string;
  /** 父選單ID */
  parentId?: string;
  /** 按鈕許可權標識 */
  perm?: string;
  /** 跳轉路徑 */
  redirect?: string;
  /** 路由名稱 */
  routeName?: string;
  /** 路由相對路徑 */
  routePath?: string;
  /** 選單排序(數字越小排名越靠前) */
  sort?: number;
  /** 選單型別 */
  type?: MenuTypeEnum;
  /** 是否可見(1:顯示;0:隱藏) */
  visible?: number;
}
export interface MenuForm {
  /** 選單ID */
  id?: string;
  /** 父選單ID */
  parentId?: string;
  /** 選單名稱 */
  name?: string;
  /** 是否可見(1-是 0-否) */
  visible: number;
  /** ICON */
  icon?: string;
  /** 排序 */
  sort?: number;
  /** 路由名稱 */
  routeName?: string;
  /** 路由路徑 */
  routePath?: string;
  /** 元件路徑 */
  component?: string;
  /** 跳轉路由路徑 */
  redirect?: string;
  /** 選單型別 */
  type?: MenuTypeEnum;
  /** 許可權標識 */
  perm?: string;
  /** 【選單】是否開啟頁面快取 */
  keepAlive?: number;
  /** 【目錄】只有一個子路由是否始終顯示 */
  alwaysShow?: number;
  /** 其他引數 */
  params?: KeyValue[];
}
interface KeyValue {
  key: string;
  value: string;
}
export interface RouteVO {
  /** 子路由列表 */
  children: RouteVO[];
  /** 元件路徑 */
  component?: string;
  /** 路由屬性 */
  meta?: Meta;
  /** 路由名稱 */
  name?: string;
  /** 路由路徑 */
  path?: string;
  /** 跳轉連結 */
  redirect?: string;
}
export interface Meta {
  /** 【目錄】只有一個子路由是否始終顯示 */
  alwaysShow?: boolean;
  /** 是否隱藏(true-是 false-否) */
  hidden?: boolean;
  /** ICON */
  icon?: string;
  /** 【選單】是否開啟頁面快取 */
  keepAlive?: boolean;
  /** 路由title */
  title?: string;
}
