<template>
  <div
    class="rounded bg-[var(--el-bg-color)] border border-[var(--el-border-color)] p-5 h-full md:flex flex-1 flex-col md:overflow-auto"
  >
    <!-- 表格工具欄 -->
    <div class="flex flex-col md:flex-row justify-between gap-y-2.5 mb-2.5">
      <!-- 左側工具欄 -->
      <div class="toolbar-left flex gap-y-2.5 gap-x-2 md:gap-x-3 flex-wrap">
        <template v-for="(btn, index) in toolbarLeftBtn" :key="index">
          <el-button
            v-hasPerm="btn.perm ?? '*:*:*'"
            v-bind="btn.attrs"
            :disabled="btn.name === 'delete' && removeIds.length === 0"
            @click="handleToolbar(btn.name)"
          >
            {{ btn.text }}
          </el-button>
        </template>
      </div>
      <!-- 右側工具欄 -->
      <div class="toolbar-right flex gap-y-2.5 gap-x-2 md:gap-x-3 flex-wrap">
        <template v-for="(btn, index) in toolbarRightBtn" :key="index">
          <el-popover v-if="btn.name === 'filter'" placement="bottom" trigger="click">
            <template #reference>
              <el-button v-bind="btn.attrs"></el-button>
            </template>
            <el-scrollbar max-height="350px">
              <template v-for="col in cols" :key="col.prop">
                <el-checkbox v-if="col.prop" v-model="col.show" :label="col.label" />
              </template>
            </el-scrollbar>
          </el-popover>
          <el-button
            v-else
            v-hasPerm="btn.perm ?? '*:*:*'"
            v-bind="btn.attrs"
            @click="handleToolbar(btn.name)"
          ></el-button>
        </template>
      </div>
    </div>

    <!-- 列表 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      v-bind="contentConfig.table"
      :data="pageData"
      :row-key="pk"
      class="flex-1"
      @selection-change="handleSelectionChange"
      @filter-change="handleFilterChange"
    >
      <template v-for="col in cols" :key="col.prop">
        <el-table-column v-if="col.show" v-bind="col">
          <template #default="scope">
            <!-- 顯示圖片 -->
            <template v-if="col.templet === 'image'">
              <template v-if="col.prop">
                <template v-if="Array.isArray(scope.row[col.prop])">
                  <template v-for="(item, index) in scope.row[col.prop]" :key="item">
                    <el-image
                      :src="item"
                      :preview-src-list="scope.row[col.prop]"
                      :initial-index="index"
                      :preview-teleported="true"
                      :style="`width: ${col.imageWidth ?? 40}px; height: ${col.imageHeight ?? 40}px`"
                    />
                  </template>
                </template>
                <template v-else>
                  <el-image
                    :src="scope.row[col.prop]"
                    :preview-src-list="[scope.row[col.prop]]"
                    :preview-teleported="true"
                    :style="`width: ${col.imageWidth ?? 40}px; height: ${col.imageHeight ?? 40}px`"
                  />
                </template>
              </template>
            </template>
            <!-- 根據行的selectList屬性返回對應列表值 -->
            <template v-else-if="col.templet === 'list'">
              <template v-if="col.prop">
                {{ (col.selectList ?? {})[scope.row[col.prop]] }}
              </template>
            </template>
            <!-- 格式化顯示連結 -->
            <template v-else-if="col.templet === 'url'">
              <template v-if="col.prop">
                <el-link type="primary" :href="scope.row[col.prop]" target="_blank">
                  {{ scope.row[col.prop] }}
                </el-link>
              </template>
            </template>
            <!-- 生成開關元件 -->
            <template v-else-if="col.templet === 'switch'">
              <template v-if="col.prop">
                <!-- pageData.length>0: 解決el-switch元件會在表格初始化的時候觸發一次change事件 -->
                <el-switch
                  v-model="scope.row[col.prop]"
                  :active-value="col.activeValue ?? 1"
                  :inactive-value="col.inactiveValue ?? 0"
                  :inline-prompt="true"
                  :active-text="col.activeText ?? ''"
                  :inactive-text="col.inactiveText ?? ''"
                  :validate-event="false"
                  :disabled="!hasButtonPerm(col.prop)"
                  @change="
                    pageData.length > 0 && handleModify(col.prop, scope.row[col.prop], scope.row)
                  "
                />
              </template>
            </template>
            <!-- 生成輸入框元件 -->
            <template v-else-if="col.templet === 'input'">
              <template v-if="col.prop">
                <el-input
                  v-model="scope.row[col.prop]"
                  :type="col.inputType ?? 'text'"
                  :disabled="!hasButtonPerm(col.prop)"
                  @blur="handleModify(col.prop, scope.row[col.prop], scope.row)"
                />
              </template>
            </template>
            <!-- 格式化為價格 -->
            <template v-else-if="col.templet === 'price'">
              <template v-if="col.prop">
                {{ `${col.priceFormat ?? "￥"}${scope.row[col.prop]}` }}
              </template>
            </template>
            <!-- 格式化為百分比 -->
            <template v-else-if="col.templet === 'percent'">
              <template v-if="col.prop">{{ scope.row[col.prop] }}%</template>
            </template>
            <!-- 顯示圖示 -->
            <template v-else-if="col.templet === 'icon'">
              <template v-if="col.prop">
                <template v-if="scope.row[col.prop].startsWith('el-icon-')">
                  <el-icon>
                    <component :is="scope.row[col.prop].replace('el-icon-', '')" />
                  </el-icon>
                </template>
                <template v-else>
                  <div class="i-svg:{{ scope.row[col.prop] }}" />
                </template>
              </template>
            </template>
            <!-- 格式化時間 -->
            <template v-else-if="col.templet === 'date'">
              <template v-if="col.prop">
                {{
                  scope.row[col.prop]
                    ? useDateFormat(scope.row[col.prop], col.dateFormat ?? "YYYY-MM-DD HH:mm:ss")
                        .value
                    : ""
                }}
              </template>
            </template>
            <!-- 列操作欄 -->
            <template v-else-if="col.templet === 'tool'">
              <template v-for="(btn, index) in tableToolbarBtn" :key="index">
                <el-button
                  v-if="btn.render === undefined || btn.render(scope.row)"
                  v-hasPerm="btn.perm ?? '*:*:*'"
                  v-bind="btn.attrs"
                  @click="
                    handleOperate({
                      name: btn.name,
                      row: scope.row,
                      column: scope.column,
                      $index: scope.$index,
                    })
                  "
                >
                  {{ btn.text }}
                </el-button>
              </template>
            </template>
            <!-- 自定義 -->
            <template v-else-if="col.templet === 'custom'">
              <slot :name="col.slotName ?? col.prop" :prop="col.prop" v-bind="scope" />
            </template>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- 分頁 -->
    <div v-if="showPagination" class="mt-4">
      <el-scrollbar :class="['h-8!', { 'flex-x-end': contentConfig?.pagePosition === 'right' }]">
        <el-pagination
          v-bind="pagination"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-scrollbar>
    </div>

    <!-- 匯出彈窗 -->
    <el-dialog
      v-model="exportsModalVisible"
      :align-center="true"
      title="匯出資料"
      width="600px"
      style="padding-right: 0"
      @close="handleCloseExportsModal"
    >
      <!-- 滾動 -->
      <el-scrollbar max-height="60vh">
        <!-- 表單 -->
        <el-form
          ref="exportsFormRef"
          style="padding-right: var(--el-dialog-padding-primary)"
          :model="exportsFormData"
          :rules="exportsFormRules"
        >
          <el-form-item label="檔名" prop="filename">
            <el-input v-model="exportsFormData.filename" clearable />
          </el-form-item>
          <el-form-item label="工作表名" prop="sheetname">
            <el-input v-model="exportsFormData.sheetname" clearable />
          </el-form-item>
          <el-form-item label="資料來源" prop="origin">
            <el-select v-model="exportsFormData.origin">
              <el-option label="當前資料 (當前頁的資料)" :value="ExportsOriginEnum.CURRENT" />
              <el-option
                label="選中資料 (所有選中的資料)"
                :value="ExportsOriginEnum.SELECTED"
                :disabled="selectionData.length <= 0"
              />
              <el-option
                label="全量資料 (所有分頁的資料)"
                :value="ExportsOriginEnum.REMOTE"
                :disabled="contentConfig.exportsAction === undefined"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="欄位" prop="fields">
            <el-checkbox-group v-model="exportsFormData.fields">
              <template v-for="col in cols" :key="col.prop">
                <el-checkbox v-if="col.prop" :value="col.prop" :label="col.label" />
              </template>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <!-- 彈窗底部操作按鈕 -->
      <template #footer>
        <div style="padding-right: var(--el-dialog-padding-primary)">
          <el-button type="primary" @click="handleExportsSubmit">確 定</el-button>
          <el-button @click="handleCloseExportsModal">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 匯入彈窗 -->
    <el-dialog
      v-model="importModalVisible"
      :align-center="true"
      title="匯入資料"
      width="600px"
      style="padding-right: 0"
      @close="handleCloseImportModal"
    >
      <!-- 滾動 -->
      <el-scrollbar max-height="60vh">
        <!-- 表單 -->
        <el-form
          ref="importFormRef"
          style="padding-right: var(--el-dialog-padding-primary)"
          :model="importFormData"
          :rules="importFormRules"
        >
          <el-form-item label="檔名" prop="files">
            <el-upload
              ref="uploadRef"
              v-model:file-list="importFormData.files"
              class="w-full"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              :drag="true"
              :limit="1"
              :auto-upload="false"
              :on-exceed="handleFileExceed"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                <span>將檔案拖到此處，或</span>
                <em>點選上傳</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  *.xlsx / *.xls
                  <el-link
                    v-if="contentConfig.importTemplate"
                    type="primary"
                    icon="download"
                    underline="never"
                    @click="handleDownloadTemplate"
                  >
                    下載模板
                  </el-link>
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <!-- 彈窗底部操作按鈕 -->
      <template #footer>
        <div style="padding-right: var(--el-dialog-padding-primary)">
          <el-button
            type="primary"
            :disabled="importFormData.files.length === 0"
            @click="handleImportSubmit"
          >
            確 定
          </el-button>
          <el-button @click="handleCloseImportModal">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { hasAuth } from "@/plugins/permission";
import { useDateFormat, useThrottleFn } from "@vueuse/core";
import {
  genFileId,
  type FormInstance,
  type FormRules,
  type UploadInstance,
  type UploadRawFile,
  type UploadUserFile,
  type TableInstance,
} from "element-plus";
import ExcelJS from "exceljs";
import { reactive, ref, computed } from "vue";
import type { IContentConfig, IObject, IOperateData } from "./types";
import type { IToolsButton } from "./types";

// 定義接收的屬性
const props = defineProps<{ contentConfig: IContentConfig }>();
// 定義自定義事件
const emit = defineEmits<{
  addClick: [];
  exportClick: [];
  searchClick: [];
  toolbarClick: [name: string];
  editClick: [row: IObject];
  filterChange: [data: IObject];
  operateClick: [data: IOperateData];
}>();

// 表格工具欄按鈕配置
const config = computed(() => props.contentConfig);
const buttonConfig = reactive<Record<string, IObject>>({
  add: { text: "新增", attrs: { icon: "plus", type: "success" }, perm: "add" },
  delete: { text: "刪除", attrs: { icon: "delete", type: "danger" }, perm: "delete" },
  import: { text: "匯入", attrs: { icon: "upload", type: "" }, perm: "import" },
  export: { text: "匯出", attrs: { icon: "download", type: "" }, perm: "export" },
  refresh: { text: "重新整理", attrs: { icon: "refresh", type: "" }, perm: "*:*:*" },
  filter: { text: "篩選列", attrs: { icon: "operation", type: "" }, perm: "*:*:*" },
  search: { text: "搜尋", attrs: { icon: "search", type: "" }, perm: "search" },
  imports: { text: "批次匯入", attrs: { icon: "upload", type: "" }, perm: "imports" },
  exports: { text: "批次匯出", attrs: { icon: "download", type: "" }, perm: "exports" },
  view: { text: "檢視", attrs: { icon: "view", type: "primary" }, perm: "view" },
  edit: { text: "編輯", attrs: { icon: "edit", type: "primary" }, perm: "edit" },
});

// 主鍵
const pk = props.contentConfig.pk ?? "id";
// 許可權名稱字首
const authPrefix = computed(() => props.contentConfig.permPrefix);

// 獲取按鈕許可權標識
function getButtonPerm(action: string): string | null {
  // 如果action已經包含完整路徑(包含冒號)，則直接使用
  if (action.includes(":")) {
    return action;
  }
  // 否則使用許可權字首組合
  return authPrefix.value ? `${authPrefix.value}:${action}` : null;
}

// 檢查是否有許可權
function hasButtonPerm(action: string): boolean {
  const perm = getButtonPerm(action);
  // 如果沒有設定許可權標識，則預設具有許可權
  if (!perm) return true;
  return hasAuth(perm);
}

// 建立工具欄按鈕
function createToolbar(toolbar: Array<string | IToolsButton>, attr = {}) {
  return toolbar.map((item) => {
    const isString = typeof item === "string";
    return {
      name: isString ? item : item?.name || "",
      text: isString ? buttonConfig[item].text : item?.text,
      attrs: {
        ...attr,
        ...(isString ? buttonConfig[item].attrs : item?.attrs),
      },
      render: isString ? undefined : (item?.render ?? undefined),
      perm: isString
        ? getButtonPerm(buttonConfig[item].perm)
        : item?.perm
          ? getButtonPerm(item.perm as string)
          : "*:*:*",
    };
  });
}

// 左側工具欄按鈕
const toolbarLeftBtn = computed(() => {
  if (!config.value.toolbar || config.value.toolbar.length === 0) return [];
  return createToolbar(config.value.toolbar, {});
});

// 右側工具欄按鈕
const toolbarRightBtn = computed(() => {
  if (!config.value.defaultToolbar || config.value.defaultToolbar.length === 0) return [];
  return createToolbar(config.value.defaultToolbar, { circle: true });
});

// 表格操作工具欄
const tableToolbar = config.value.cols[config.value.cols.length - 1].operat ?? ["edit", "delete"];
const tableToolbarBtn = createToolbar(tableToolbar, { link: true, size: "small" });

// 表格列
const cols = ref(
  props.contentConfig.cols.map((col) => {
    if (col.initFn) {
      col.initFn(col);
    }
    if (col.show === undefined) {
      col.show = true;
    }
    if (col.prop !== undefined && col.columnKey === undefined && col["column-key"] === undefined) {
      col.columnKey = col.prop;
    }
    if (
      col.type === "selection" &&
      col.reserveSelection === undefined &&
      col["reserve-selection"] === undefined
    ) {
      // 配合表格row-key實現跨頁多選
      col.reserveSelection = true;
    }
    return col;
  })
);
// 載入狀態
const loading = ref(false);
// 列表資料
const pageData = ref<IObject[]>([]);
// 顯示分頁
const showPagination = props.contentConfig.pagination !== false;
// 分頁配置
const defaultPagination = {
  background: true,
  layout: "total, sizes, prev, pager, next, jumper",
  pageSize: 20,
  pageSizes: [10, 20, 30, 50],
  total: 0,
  currentPage: 1,
};
const pagination = reactive(
  typeof props.contentConfig.pagination === "object"
    ? { ...defaultPagination, ...props.contentConfig.pagination }
    : defaultPagination
);
// 分頁相關的請求引數
const request = props.contentConfig.request ?? {
  pageName: "pageNum",
  limitName: "pageSize",
};

const tableRef = ref<TableInstance>();

// 行選中
const selectionData = ref<IObject[]>([]);
// 刪除ID集合 用於批次刪除
const removeIds = ref<(number | string)[]>([]);
function handleSelectionChange(selection: any[]) {
  selectionData.value = selection;
  removeIds.value = selection.map((item) => item[pk]);
}

// 獲取行選中
function getSelectionData() {
  return selectionData.value;
}

// 重新整理
function handleRefresh(isRestart = false) {
  fetchPageData(lastFormData, isRestart);
}

// 刪除
function handleDelete(id?: number | string) {
  const ids = [id || removeIds.value].join(",");
  if (!ids) {
    ElMessage.warning("請勾選刪除項");
    return;
  }

  ElMessageBox.confirm("確認刪除?", "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(function () {
      if (props.contentConfig.deleteAction) {
        props.contentConfig
          .deleteAction(ids)
          .then(() => {
            ElMessage.success("刪除成功");
            removeIds.value = [];
            //清空選中項
            tableRef.value?.clearSelection();
            handleRefresh(true);
          })
          .catch(() => {});
      } else {
        ElMessage.error("未配置deleteAction");
      }
    })
    .catch(() => {});
}

// 匯出表單
const fields: string[] = [];
cols.value.forEach((item) => {
  if (item.prop !== undefined) {
    fields.push(item.prop);
  }
});
const enum ExportsOriginEnum {
  CURRENT = "current",
  SELECTED = "selected",
  REMOTE = "remote",
}
const exportsModalVisible = ref(false);
const exportsFormRef = ref<FormInstance>();
const exportsFormData = reactive({
  filename: "",
  sheetname: "",
  fields,
  origin: ExportsOriginEnum.CURRENT,
});
const exportsFormRules: FormRules = {
  fields: [{ required: true, message: "請選擇欄位" }],
  origin: [{ required: true, message: "請選擇資料來源" }],
};
// 開啟匯出彈窗
function handleOpenExportsModal() {
  exportsModalVisible.value = true;
}
// 匯出確認
const handleExportsSubmit = useThrottleFn(() => {
  exportsFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      handleExports();
      handleCloseExportsModal();
    }
  });
}, 3000);
// 關閉匯出彈窗
function handleCloseExportsModal() {
  exportsModalVisible.value = false;
  exportsFormRef.value?.resetFields();
  nextTick(() => {
    exportsFormRef.value?.clearValidate();
  });
}
// 匯出
function handleExports() {
  const filename = exportsFormData.filename
    ? exportsFormData.filename
    : props.contentConfig.permPrefix || "export";
  const sheetname = exportsFormData.sheetname ? exportsFormData.sheetname : "sheet";
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetname);
  const columns: Partial<ExcelJS.Column>[] = [];
  cols.value.forEach((col) => {
    if (col.label && col.prop && exportsFormData.fields.includes(col.prop)) {
      columns.push({ header: col.label, key: col.prop });
    }
  });
  worksheet.columns = columns;
  if (exportsFormData.origin === ExportsOriginEnum.REMOTE) {
    if (props.contentConfig.exportsAction) {
      props.contentConfig.exportsAction(lastFormData).then((res) => {
        worksheet.addRows(res);
        workbook.xlsx
          .writeBuffer()
          .then((buffer) => {
            saveXlsx(buffer, filename as string);
          })
          .catch((error) => console.log(error));
      });
    } else {
      ElMessage.error("未配置exportsAction");
    }
  } else {
    worksheet.addRows(
      exportsFormData.origin === ExportsOriginEnum.SELECTED ? selectionData.value : pageData.value
    );
    workbook.xlsx
      .writeBuffer()
      .then((buffer) => {
        saveXlsx(buffer, filename as string);
      })
      .catch((error) => console.log(error));
  }
}

// 匯入表單
let isFileImport = false;
const uploadRef = ref<UploadInstance>();
const importModalVisible = ref(false);
const importFormRef = ref<FormInstance>();
const importFormData = reactive<{
  files: UploadUserFile[];
}>({
  files: [],
});
const importFormRules: FormRules = {
  files: [{ required: true, message: "請選擇檔案" }],
};
// 開啟匯入彈窗
function handleOpenImportModal(isFile: boolean = false) {
  importModalVisible.value = true;
  isFileImport = isFile;
}
// 覆蓋前一個檔案
function handleFileExceed(files: File[]) {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
}
// 下載匯入模板
function handleDownloadTemplate() {
  const importTemplate = props.contentConfig.importTemplate;
  if (typeof importTemplate === "string") {
    window.open(importTemplate);
  } else if (typeof importTemplate === "function") {
    importTemplate().then((response) => {
      const fileData = response.data;
      const fileName = decodeURI(
        response.headers["content-disposition"].split(";")[1].split("=")[1]
      );
      saveXlsx(fileData, fileName);
    });
  } else {
    ElMessage.error("未配置importTemplate");
  }
}
// 匯入確認
const handleImportSubmit = useThrottleFn(() => {
  importFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (isFileImport) {
        handleImport();
      } else {
        handleImports();
      }
    }
  });
}, 3000);
// 關閉匯入彈窗
function handleCloseImportModal() {
  importModalVisible.value = false;
  importFormRef.value?.resetFields();
  nextTick(() => {
    importFormRef.value?.clearValidate();
  });
}
// 檔案匯入
function handleImport() {
  const importAction = props.contentConfig.importAction;
  if (importAction === undefined) {
    ElMessage.error("未配置importAction");
    return;
  }
  importAction(importFormData.files[0].raw as File).then(() => {
    ElMessage.success("匯入資料成功");
    handleCloseImportModal();
    handleRefresh(true);
  });
}
// 匯入
function handleImports() {
  const importsAction = props.contentConfig.importsAction;
  if (importsAction === undefined) {
    ElMessage.error("未配置importsAction");
    return;
  }
  // 獲取選擇的檔案
  const file = importFormData.files[0].raw as File;
  // 建立Workbook例項
  const workbook = new ExcelJS.Workbook();
  // 使用FileReader物件來讀取檔案內容
  const fileReader = new FileReader();
  // 二進位制字串的形式載入檔案
  fileReader.readAsArrayBuffer(file);
  fileReader.onload = (ev) => {
    if (ev.target !== null && ev.target.result !== null) {
      const result = ev.target.result as ArrayBuffer;
      // 從 buffer中載入資料解析
      workbook.xlsx
        .load(result)
        .then((workbook) => {
          // 解析後的資料
          const data = [];
          // 獲取第一個worksheet內容
          const worksheet = workbook.getWorksheet(1);
          if (worksheet) {
            // 獲取第一行的標題
            const fields: any[] = [];
            worksheet.getRow(1).eachCell((cell) => {
              fields.push(cell.value);
            });
            // 遍歷工作表的每一行（從第二行開始，因為第一行通常是標題行）
            for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
              const rowData: IObject = {};
              const row = worksheet.getRow(rowNumber);
              // 遍歷當前行的每個單元格
              row.eachCell((cell, colNumber) => {
                // 獲取標題對應的鍵，並將當前單元格的值儲存到相應的屬性名中
                rowData[fields[colNumber - 1]] = cell.value;
              });
              // 將當前行的資料物件新增到陣列中
              data.push(rowData);
            }
          }
          if (data.length === 0) {
            ElMessage.error("未解析到資料");
            return;
          }
          importsAction(data).then(() => {
            ElMessage.success("匯入資料成功");
            handleCloseImportModal();
            handleRefresh(true);
          });
        })
        .catch((error) => console.log(error));
    } else {
      ElMessage.error("讀取檔案失敗");
    }
  };
}

// 操作欄
function handleToolbar(name: string) {
  switch (name) {
    case "refresh":
      handleRefresh();
      break;
    case "exports":
      handleOpenExportsModal();
      break;
    case "imports":
      handleOpenImportModal();
      break;
    case "search":
      emit("searchClick");
      break;
    case "add":
      emit("addClick");
      break;
    case "delete":
      handleDelete();
      break;
    case "import":
      handleOpenImportModal(true);
      break;
    case "export":
      emit("exportClick");
      break;
    default:
      emit("toolbarClick", name);
      break;
  }
}

// 操作列
function handleOperate(data: IOperateData) {
  switch (data.name) {
    case "delete":
      if (props.contentConfig?.deleteAction) {
        handleDelete(data.row[pk]);
      } else {
        emit("operateClick", data);
      }
      break;
    default:
      emit("operateClick", data);
      break;
  }
}

// 屬性修改
function handleModify(field: string, value: boolean | string | number, row: Record<string, any>) {
  if (props.contentConfig.modifyAction) {
    props.contentConfig.modifyAction({
      [pk]: row[pk],
      field,
      value,
    });
  } else {
    ElMessage.error("未配置modifyAction");
  }
}

// 分頁切換
function handleSizeChange(value: number) {
  pagination.pageSize = value;
  handleRefresh();
}
function handleCurrentChange(value: number) {
  pagination.currentPage = value;
  handleRefresh();
}

// 遠端資料篩選
let filterParams: IObject = {};
function handleFilterChange(newFilters: any) {
  const filters: IObject = {};
  for (const key in newFilters) {
    const col = cols.value.find((col) => {
      return col.columnKey === key || col["column-key"] === key;
    });
    if (col && col.filterJoin !== undefined) {
      filters[key] = newFilters[key].join(col.filterJoin);
    } else {
      filters[key] = newFilters[key];
    }
  }
  filterParams = { ...filterParams, ...filters };
  emit("filterChange", filterParams);
}

// 獲取篩選條件
function getFilterParams() {
  return filterParams;
}

// 獲取分頁資料
let lastFormData = {};
function fetchPageData(formData: IObject = {}, isRestart = false) {
  loading.value = true;
  // 上一次搜尋條件
  lastFormData = formData;
  // 重置頁碼
  if (isRestart) {
    pagination.currentPage = 1;
  }
  props.contentConfig
    .indexAction(
      showPagination
        ? {
            [request.pageName]: pagination.currentPage,
            [request.limitName]: pagination.pageSize,
            ...formData,
          }
        : formData
    )
    .then((data) => {
      if (showPagination) {
        if (props.contentConfig.parseData) {
          data = props.contentConfig.parseData(data);
        }
        pagination.total = data.total;
        pageData.value = data.list;
      } else {
        pageData.value = data;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
fetchPageData();

// 匯出Excel
function exportPageData(formData: IObject = {}) {
  if (props.contentConfig.exportAction) {
    props.contentConfig.exportAction(formData).then((response) => {
      const fileData = response.data;
      const fileName = decodeURI(
        response.headers["content-disposition"].split(";")[1].split("=")[1]
      );
      saveXlsx(fileData, fileName);
    });
  } else {
    ElMessage.error("未配置exportAction");
  }
}

// 瀏覽器儲存檔案
function saveXlsx(fileData: any, fileName: string) {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

  const blob = new Blob([fileData], { type: fileType });
  const downloadUrl = window.URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = fileName;

  document.body.appendChild(downloadLink);
  downloadLink.click();

  document.body.removeChild(downloadLink);
  window.URL.revokeObjectURL(downloadUrl);
}

// 暴露的屬性和方法
defineExpose({ fetchPageData, exportPageData, getFilterParams, getSelectionData, handleRefresh });
</script>

<style lang="scss" scoped>
.toolbar-left,
.toolbar-right {
  .el-button {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
}
</style>
