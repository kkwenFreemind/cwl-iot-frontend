declare global {
  /**
   * 響應資料
   */
  interface ApiResponse<T = any> {
    code: string;
    data: T;
    msg: string;
  }

  /**
   * 分頁查詢引數
   */
  interface PageQuery {
    pageNum: number;
    pageSize: number;
  }

  /**
   * 分頁響應物件
   */
  interface PageResult<T> {
    /** 資料列表 */
    list: T;
    /** 總數 */
    total: number;
  }

  /**
   * 頁籤物件
   */
  interface TagView {
    /** 頁簽名稱 */
    name: string;
    /** 頁籤標題 */
    title: string;
    /** 頁籤路由路徑 */
    path: string;
    /** 頁籤路由完整路徑 */
    fullPath: string;
    /** 頁籤圖示 */
    icon?: string;
    /** 是否固定頁籤 */
    affix?: boolean;
    /** 是否開啟快取 */
    keepAlive?: boolean;
    /** 路由查詢引數 */
    query?: any;
  }

  /**
   * 系統設定
   */
  interface AppSettings {
    /** 系統標題 */
    title: string;
    /** 系統版本 */
    version: string;
    /** 是否顯示設定 */
    showSettings: boolean;
    /** 是否顯示多標籤導航 */
    showTagsView: boolean;
    /** 是否顯示應用Logo */
    showAppLogo: boolean;
    /** 導航欄佈局(left|top|mix) */
    layout: "left" | "top" | "mix";
    /** 主題顏色 */
    themeColor: string;
    /** 主題模式(dark|light) */
    theme: import("@/enums/settings/theme.enum").ThemeMode;
    /** 佈局大小(default |large |small) */
    size: string;
    /** 語言( zh-cn| en) */
    language: string;
    /** 是否顯示水印 */
    showWatermark: boolean;
    /** 水印內容 */
    watermarkContent: string;
    /** 側邊欄配色方案 */
    sidebarColorScheme: "classic-blue" | "minimal-white";
  }

  /**
   * 下拉選項資料型別
   */
  interface OptionType {
    /** 值 */
    value: string | number;
    /** 文字 */
    label: string;
    /** 子列表  */
    children?: OptionType[];
  }

  /**
   * 匯入結果
   */
  interface ExcelResult {
    /** 狀態碼 */
    code: string;
    /** 無效資料條數 */
    invalidCount: number;
    /** 有效資料條數 */
    validCount: number;
    /** 錯誤資訊 */
    messageList: Array<string>;
  }
}
export {};
