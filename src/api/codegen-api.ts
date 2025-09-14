import request from "@/utils/request";

const GENERATOR_BASE_URL = "/api/v1/codegen";

const GeneratorAPI = {
  /** 獲取資料表分頁列表 */
  getTablePage(params: TablePageQuery) {
    return request<any, PageResult<TablePageVO>>({
      url: `${GENERATOR_BASE_URL}/table/page`,
      method: "get",
      params,
    });
  },

  /** 獲取程式碼生成配置 */
  getGenConfig(tableName: string) {
    return request<any, GenConfigForm>({
      url: `${GENERATOR_BASE_URL}/${tableName}/config`,
      method: "get",
    });
  },

  /** 獲取程式碼生成配置 */
  saveGenConfig(tableName: string, data: GenConfigForm) {
    return request({
      url: `${GENERATOR_BASE_URL}/${tableName}/config`,
      method: "post",
      data,
    });
  },

  /** 獲取程式碼生成預覽資料 */
  getPreviewData(tableName: string, pageType?: "classic" | "curd") {
    return request<any, GeneratorPreviewVO[]>({
      url: `${GENERATOR_BASE_URL}/${tableName}/preview`,
      method: "get",
      params: pageType ? { pageType } : undefined,
    });
  },

  /** 重置程式碼生成配置 */
  resetGenConfig(tableName: string) {
    return request({
      url: `${GENERATOR_BASE_URL}/${tableName}/config`,
      method: "delete",
    });
  },

  /**
   * 下載 ZIP 檔案
   * @param url
   * @param fileName
   */
  download(tableName: string, pageType?: "classic" | "curd") {
    return request({
      url: `${GENERATOR_BASE_URL}/${tableName}/download`,
      method: "get",
      params: pageType ? { pageType } : undefined,
      responseType: "blob",
    }).then((response) => {
      const fileName = decodeURI(
        response.headers["content-disposition"].split(";")[1].split("=")[1]
      );

      const blob = new Blob([response.data], { type: "application/zip" });
      const a = document.createElement("a");
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  },
};

export default GeneratorAPI;

/** 程式碼生成預覽物件 */
export interface GeneratorPreviewVO {
  /** 檔案生成路徑 */
  path: string;
  /** 檔名稱 */
  fileName: string;
  /** 檔案內容 */
  content: string;
}

/**  資料表分頁查詢引數 */
export interface TablePageQuery extends PageQuery {
  /** 關鍵字(表名) */
  keywords?: string;
}

/** 資料表分頁物件 */
export interface TablePageVO {
  /** 表名稱 */
  tableName: string;

  /** 表描述 */
  tableComment: string;

  /** 儲存引擎 */
  engine: string;

  /** 字符集排序規則 */
  tableCollation: string;

  /** 建立時間 */
  createTime: string;
}

/** 程式碼生成配置表單 */
export interface GenConfigForm {
  /** 主鍵 */
  id?: string;

  /** 表名 */
  tableName?: string;

  /** 業務名 */
  businessName?: string;

  /** 模組名 */
  moduleName?: string;

  /** 包名 */
  packageName?: string;

  /** 實體名 */
  entityName?: string;

  /** 作者 */
  author?: string;

  /** 上級選單 */
  parentMenuId?: string;

  /** 後端應用名 */
  backendAppName?: string;
  /** 前端應用名 */
  frontendAppName?: string;

  /** 欄位配置列表 */
  fieldConfigs?: FieldConfig[];

  /** 頁面型別 classic|curd */
  pageType?: "classic" | "curd";

  /** 要移除的表字首，如 sys_ */
  removeTablePrefix?: string;
}

/** 欄位配置 */
export interface FieldConfig {
  /** 主鍵 */
  id?: string;

  /** 列名 */
  columnName?: string;

  /** 列型別 */
  columnType?: string;

  /** 欄位名 */
  fieldName?: string;

  /** 欄位型別 */
  fieldType?: string;

  /** 欄位描述 */
  fieldComment?: string;

  /** 是否在列表顯示 */
  isShowInList?: number;

  /** 是否在表單顯示 */
  isShowInForm?: number;

  /** 是否在查詢條件顯示 */
  isShowInQuery?: number;

  /** 是否必填 */
  isRequired?: number;

  /** 表單型別 */
  formType?: number;

  /** 查詢型別 */
  queryType?: number;

  /** 欄位長度 */
  maxLength?: number;

  /** 欄位排序 */
  fieldSort?: number;

  /** 字典型別 */
  dictType?: string;
}
