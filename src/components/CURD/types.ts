import type { DialogProps, DrawerProps, FormItemRule, PaginationProps } from "element-plus";
import type { FormProps, TableProps, ColProps, ButtonProps, CardProps } from "element-plus";
import type PageContent from "./PageContent.vue";
import type PageModal from "./PageModal.vue";
import type PageSearch from "./PageSearch.vue";
import type { CSSProperties } from "vue";

export type PageSearchInstance = InstanceType<typeof PageSearch>;
export type PageContentInstance = InstanceType<typeof PageContent>;
export type PageModalInstance = InstanceType<typeof PageModal>;

export type IObject = Record<string, any>;

type DateComponent = "date-picker" | "time-picker" | "time-select" | "custom-tag" | "input-tag";
type InputComponent = "input" | "select" | "input-number" | "cascader" | "tree-select";
type OtherComponent = "text" | "radio" | "checkbox" | "switch" | "icon-select" | "custom";
export type ISearchComponent = DateComponent | InputComponent;
export type IComponentType = DateComponent | InputComponent | OtherComponent;

type ToolbarLeft = "add" | "delete" | "import" | "export";
type ToolbarRight = "refresh" | "filter" | "imports" | "exports" | "search";
type ToolbarTable = "edit" | "view" | "delete";
export type IToolsButton = {
  name: string; // 按鈕名稱
  text?: string; // 按鈕文字
  perm?: Array<string> | string; // 許可權標識(可以是完整許可權字串如'sys:user:add'或操作許可權如'add')
  attrs?: Partial<ButtonProps> & { style?: CSSProperties }; // 按鈕屬性
  render?: (row: IObject) => boolean; // 條件渲染
};
export type IToolsDefault = ToolbarLeft | ToolbarRight | ToolbarTable | IToolsButton;

export interface IOperateData {
  name: string;
  row: IObject;
  column: IObject;
  $index: number;
}

export interface ISearchConfig {
  // 許可權字首(如sys:user，用於組成許可權標識)，不提供則不進行許可權校驗
  permPrefix?: string;
  // 標籤冒號(預設：false)
  colon?: boolean;
  // 表單項(預設：[])
  formItems?: IFormItems<ISearchComponent>;
  // 是否開啟展開和收縮(預設：true)
  isExpandable?: boolean;
  // 預設展示的表單項數量(預設：3)
  showNumber?: number;
  // 卡片屬性
  cardAttrs?: Partial<CardProps> & { style?: CSSProperties };
  // form元件屬性
  form?: IForm;
  // 自適應網格佈局(使用時表單不要新增 style: { width: "200px" })
  grid?: boolean | "left" | "right";
}

export interface IContentConfig<T = any> {
  // 許可權字首(如sys:user，用於組成許可權標識)，不提供則不進行許可權校驗
  permPrefix?: string;
  // table元件屬性
  table?: Omit<TableProps<any>, "data">;
  // 分頁元件位置(預設：left)
  pagePosition?: "left" | "right";
  // pagination元件屬性
  pagination?:
    | boolean
    | Partial<
        Omit<
          PaginationProps,
          "v-model:page-size" | "v-model:current-page" | "total" | "currentPage"
        >
      >;
  // 列表的網路請求函式(需返回promise)
  indexAction: (queryParams: T) => Promise<any>;
  // 預設的分頁相關的請求引數
  request?: {
    pageName: string;
    limitName: string;
  };
  // 資料格式解析的回撥函式
  parseData?: (res: any) => {
    total: number;
    list: IObject[];
    [key: string]: any;
  };
  // 修改屬性的網路請求函式(需返回promise)
  modifyAction?: (data: {
    [key: string]: any;
    field: string;
    value: boolean | string | number;
  }) => Promise<any>;
  // 刪除的網路請求函式(需返回promise)
  deleteAction?: (ids: string) => Promise<any>;
  // 後端匯出的網路請求函式(需返回promise)
  exportAction?: (queryParams: T) => Promise<any>;
  // 前端全量匯出的網路請求函式(需返回promise)
  exportsAction?: (queryParams: T) => Promise<IObject[]>;
  // 匯入模板
  importTemplate?: string | (() => Promise<any>);
  // 後端匯入的網路請求函式(需返回promise)
  importAction?: (file: File) => Promise<any>;
  // 前端匯入的網路請求函式(需返回promise)
  importsAction?: (data: IObject[]) => Promise<any>;
  // 主鍵名(預設為id)
  pk?: string;
  // 表格工具欄(預設:add,delete,export,也可自定義)
  toolbar?: Array<ToolbarLeft | IToolsButton>;
  // 表格工具欄右側圖示(預設:refresh,filter,imports,exports,search)
  defaultToolbar?: Array<ToolbarRight | IToolsButton>;
  // table元件列屬性(額外的屬性templet,operat,slotName)
  cols: Array<{
    type?: "default" | "selection" | "index" | "expand";
    label?: string;
    prop?: string;
    width?: string | number;
    align?: "left" | "center" | "right";
    columnKey?: string;
    reserveSelection?: boolean;
    // 列是否顯示
    show?: boolean;
    // 模板
    templet?:
      | "image"
      | "list"
      | "url"
      | "switch"
      | "input"
      | "price"
      | "percent"
      | "icon"
      | "date"
      | "tool"
      | "custom";
    // image模板相關引數
    imageWidth?: number;
    imageHeight?: number;
    // list模板相關引數
    selectList?: IObject;
    // switch模板相關引數
    activeValue?: boolean | string | number;
    inactiveValue?: boolean | string | number;
    activeText?: string;
    inactiveText?: string;
    // input模板相關引數
    inputType?: string;
    // price模板相關引數
    priceFormat?: string;
    // date模板相關引數
    dateFormat?: string;
    // tool模板相關引數
    operat?: Array<ToolbarTable | IToolsButton>;
    // filter值拼接符
    filterJoin?: string;
    [key: string]: any;
    // 初始化資料函式
    initFn?: (item: IObject) => void;
  }>;
}

export interface IModalConfig<T = any> {
  // 許可權字首(如sys:user，用於組成許可權標識)，不提供則不進行許可權校驗
  permPrefix?: string;
  // 標籤冒號(預設：false)
  colon?: boolean;
  // 主鍵名(主要用於編輯資料,預設為id)
  pk?: string;
  // 元件型別(預設：dialog)
  component?: "dialog" | "drawer";
  // dialog元件屬性
  dialog?: Partial<Omit<DialogProps, "modelValue">>;
  // drawer元件屬性
  drawer?: Partial<Omit<DrawerProps, "modelValue">>;
  // form元件屬性
  form?: IForm;
  // 表單項
  formItems: IFormItems<IComponentType>;
  // 提交之前處理
  beforeSubmit?: (data: T) => void;
  // 提交的網路請求函式(需返回promise)
  formAction?: (data: T) => Promise<any>;
}

export type IForm = Partial<Omit<FormProps, "model" | "rules">>;

// 表單項
export type IFormItems<T = IComponentType> = Array<{
  // 元件型別(如input,select,radio,custom等)
  type: T;
  // 標籤提示
  tips?: string | IObject;
  // 標籤文字
  label: string;
  // 鍵名
  prop: string;
  // 元件屬性
  attrs?: IObject;
  // 元件可選項(只適用於select,radio,checkbox元件)
  options?: Array<{ label: string; value: any; [key: string]: any }> | Ref<any[]>;
  // 驗證規則
  rules?: FormItemRule[];
  // 初始值
  initialValue?: any;
  // 插槽名(適用於自定義元件，設定型別為custom)
  slotName?: string;
  // 是否隱藏
  hidden?: boolean;
  // layout元件Col屬性
  col?: Partial<ColProps>;
  // 元件事件
  events?: Record<string, (...args: any) => void>;
  // 初始化資料函式擴充套件
  initFn?: (item: IObject) => void;
}>;

export interface IPageForm {
  // 主鍵名(主要用於編輯資料,預設為id)
  pk?: string;
  // form元件屬性
  form?: IForm;
  // 表單項
  formItems: IFormItems<IComponentType>;
}
