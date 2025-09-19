/**
 * 通用頁面生成器
 * 根據API定義自動生成CRUD頁面
 *
 * @author AI Assistant
 * @since 2025-09-17
 */

import type { RouteRecordRaw } from "vue-router";

/**
 * API端點定義介面
 */
export interface ApiEndpoint {
  name: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  description?: string;
  params?: Record<string, any>;
  response?: any;
}

/**
 * 欄位定義介面
 */
export interface FieldDefinition {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "date" | "select" | "textarea";
  required?: boolean;
  options?: { label: string; value: any }[];
  placeholder?: string;
  validation?: Record<string, any>;
}

/**
 * 頁面配置介面
 */
export interface PageConfig {
  title: string;
  apiBaseUrl: string;
  endpoints: {
    list: ApiEndpoint;
    create: ApiEndpoint;
    update: ApiEndpoint;
    delete: ApiEndpoint;
  };
  fields: FieldDefinition[];
  tableColumns: {
    prop: string;
    label: string;
    width?: number;
    align?: "left" | "center" | "right";
    showOverflowTooltip?: boolean;
  }[];
  searchFields?: string[];
  formLayout?: "inline" | "block";
}

/**
 * 頁面生成器類
 */
export class PageGenerator {
  private config: PageConfig;

  constructor(config: PageConfig) {
    this.config = config;
  }

  /**
   * 生成完整的Vue頁面組件
   */
  generateVueComponent(): string {
    const { config } = this;
    const componentName = this.getComponentName();

    return `<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        ${this.generateSearchFields()}
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">
            {{ $t("common.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">
            {{ $t("common.reset") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 數據表格 -->
    <el-card shadow="hover" class="data-table">
      <el-table
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        class="data-table__content"
      >
        ${this.generateTableColumns()}
        <el-table-column :label="$t('common.operation')" fixed="right" width="180">
          <template #default="scope">
            <el-button
              type="primary"
              icon="edit"
              link
              size="small"
              @click="handleEditClick(scope.row)"
            >
              {{ $t("common.edit") }}
            </el-button>
            <el-button
              type="danger"
              icon="delete"
              link
              size="small"
              @click="handleDelete(scope.row)"
            >
              {{ $t("common.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁組件 -->
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum!"
        v-model:limit="queryParams.pageSize!"
        @pagination="fetchData"
      />
    </el-card>

    <!-- 表單抽屜 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      size="600px"
      @close="handleCloseDialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        ${this.generateFormFields()}
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="handleCloseDialog">{{ $t("common.cancel") }}</el-button>
          <el-button type="primary" :loading="dialog.loading" @click="handleSubmit">
            {{ $t("common.confirm") }}
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import request from "@/utils/request";

defineOptions({
  name: "${componentName}",
  inheritAttrs: false,
});

/**
 * API 端點配置
 */
const API_ENDPOINTS = {
  list: "${config.endpoints.list.url}",
  create: "${config.endpoints.create.url}",
  update: "${config.endpoints.update.url}",
  delete: "${config.endpoints.delete.url}",
};

/**
 * 表單驗證規則
 */
const rules = computed(() => ({
  ${this.generateValidationRules()}
}));

/**
 * 響應式狀態
 */
const loading = ref(false);
const total = ref(0);
const dialog = reactive({
  visible: false,
  title: "",
  loading: false,
});

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  ${this.generateQueryParams()}
});

const formData = reactive({
  ${this.generateFormData()}
});

const pageData = ref<${this.getVOTypeName()}[]>([]);

/**
 * 表單引用
 */
const queryFormRef = ref();
const formRef = ref();

/**
 * 數據獲取
 */
function fetchData() {
  loading.value = true;
  request({
    url: API_ENDPOINTS.list,
    method: "get",
    params: queryParams,
  })
    .then((data: any) => {
      if (Array.isArray(data)) {
        pageData.value = data;
        total.value = data.length;
      } else if (data && typeof data === "object") {
        pageData.value = data.list || data.data || [];
        total.value = data.total || data.count || 0;
      } else {
        pageData.value = [];
        total.value = 0;
      }
    })
    .catch((error) => {
      console.error("獲取數據失敗:", error);
      ElMessage.error("獲取數據失敗");
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 搜尋處理
 */
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * 重置搜尋
 */
function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  ${this.generateResetFields()}
  fetchData();
}

/**
 * 編輯按鈕點擊
 */
function handleEditClick(row: ${this.getVOTypeName()}) {
  dialog.title = "編輯";
  Object.assign(formData, row);
  dialog.visible = true;
}

/**
 * 刪除處理
 */
async function handleDelete(row: ${this.getVOTypeName()}) {
  try {
    await ElMessageBox.confirm("確定要刪除此項目嗎？", "警告", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await request({
      url: \`\${API_ENDPOINTS.delete}/\${row.${this.getPrimaryKey()}}\`,
      method: "delete",
    });

    ElMessage.success("刪除成功");
    fetchData();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("刪除失敗:", error);
      ElMessage.error("刪除失敗");
    }
  }
}

/**
 * 表單提交
 */
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    const valid = await formRef.value.validate();
    if (!valid) return;

    dialog.loading = true;

    if (formData.${this.getPrimaryKey()}) {
      // 更新
      await request({
        url: \`\${API_ENDPOINTS.update}/\${formData.${this.getPrimaryKey()}}\`,
        method: "put",
        data: formData,
      });
      ElMessage.success("更新成功");
    } else {
      // 新增
      await request({
        url: API_ENDPOINTS.create,
        method: "post",
        data: formData,
      });
      ElMessage.success("新增成功");
    }

    handleCloseDialog();
    fetchData();
  } catch (error) {
    console.error("保存失敗:", error);
    ElMessage.error("保存失敗");
  } finally {
    dialog.loading = false;
  }
}

/**
 * 關閉對話框
 */
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

/**
 * 重置表單
 */
function resetForm() {
  Object.assign(formData, {
    ${this.generateResetFormData()}
  });
  formRef.value?.resetFields();
}

/**
 * 組件掛載時獲取數據
 */
onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.search-container {
  padding: 20px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;

  .search-buttons {
    margin-left: auto;
  }
}

.data-table {
  &__content {
    width: 100%;
  }
}

.drawer-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>`;
  }

  /**
   * 生成搜尋欄位
   */
  private generateSearchFields(): string {
    const { searchFields = [] } = this.config;
    return searchFields
      .map((fieldName) => {
        const field = this.config.fields.find((f) => f.name === fieldName);
        if (!field) return "";

        return `<el-form-item prop="${field.name}" :label="$t('${this.config.title.toLowerCase()}.${field.name}')">
          <el-input
            v-model="queryParams.${field.name}"
            :placeholder="$t('${this.config.title.toLowerCase()}.${field.name}Placeholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>`;
      })
      .join("\n        ");
  }

  /**
   * 生成表格欄位
   */
  private generateTableColumns(): string {
    return this.config.tableColumns
      .map((col) => {
        return `<el-table-column
          :label="$t('${this.config.title.toLowerCase()}.${col.prop}')"
          prop="${col.prop}"
          ${col.width ? `width="${col.width}"` : ""}
          ${col.align ? `align="${col.align}"` : ""}
          ${col.showOverflowTooltip ? "show-overflow-tooltip" : ""}
        />`;
      })
      .join("\n        ");
  }

  /**
   * 生成表單欄位
   */
  private generateFormFields(): string {
    return this.config.fields
      .map((field) => {
        let inputComponent = "";

        switch (field.type) {
          case "select":
            inputComponent = `<el-select
              v-model="formData.${field.name}"
              :placeholder="$t('${this.config.title.toLowerCase()}.${field.name}Placeholder')"
            >
              ${field.options
                ?.map(
                  (option) => `<el-option :label="$t('${option.label}')" value="${option.value}" />`
                )
                .join("\n              ")}
            </el-select>`;
            break;
          case "textarea":
            inputComponent = `<el-input
              v-model="formData.${field.name}"
              type="textarea"
              :placeholder="$t('${this.config.title.toLowerCase()}.${field.name}Placeholder')"
            />`;
            break;
          case "number":
            inputComponent = `<el-input-number
              v-model="formData.${field.name}"
              :placeholder="$t('${this.config.title.toLowerCase()}.${field.name}Placeholder')"
              style="width: 100%"
            />`;
            break;
          default:
            inputComponent = `<el-input
              v-model="formData.${field.name}"
              :placeholder="$t('${this.config.title.toLowerCase()}.${field.name}Placeholder')"
            />`;
        }

        return `<el-form-item
          :label="$t('${this.config.title.toLowerCase()}.${field.name}')"
          prop="${field.name}"
        >
          ${inputComponent}
        </el-form-item>`;
      })
      .join("\n        ");
  }

  /**
   * 生成驗證規則
   */
  private generateValidationRules(): string {
    return this.config.fields
      .filter((field) => field.required)
      .map(
        (field) => `${field.name}: [
        {
          required: true,
          message: $t('${this.config.title.toLowerCase()}.validation.${field.name}Required'),
          trigger: 'blur'
        }
      ]`
      )
      .join(",\n  ");
  }

  /**
   * 生成查詢參數
   */
  private generateQueryParams(): string {
    const { searchFields = [] } = this.config;
    return searchFields.map((field) => `${field}: ""`).join(",\n  ");
  }

  /**
   * 生成表單數據
   */
  private generateFormData(): string {
    return this.config.fields
      .map((field) => {
        const defaultValue = field.type === "number" ? "undefined" : '""';
        return `${field.name}: ${defaultValue}`;
      })
      .join(",\n  ");
  }

  /**
   * 生成重置欄位
   */
  private generateResetFields(): string {
    const { searchFields = [] } = this.config;
    return searchFields.map((field) => `queryParams.${field} = "";`).join("\n  ");
  }

  /**
   * 生成重置表單數據
   */
  private generateResetFormData(): string {
    return this.config.fields
      .map((field) => {
        const defaultValue = field.type === "number" ? "undefined" : '""';
        return `${field.name}: ${defaultValue}`;
      })
      .join(",\n    ");
  }

  /**
   * 獲取組件名稱
   */
  private getComponentName(): string {
    return this.config.title.replace(/\s+/g, "") + "Management";
  }

  /**
   * 獲取VO類型名稱
   */
  private getVOTypeName(): string {
    return this.config.title.replace(/\s+/g, "") + "VO";
  }

  /**
   * 獲取主鍵欄位
   */
  private getPrimaryKey(): string {
    // 預設使用第一個欄位作為主鍵
    return this.config.fields[0]?.name || "id";
  }
}

/**
 * 創建設備管理頁面配置
 */
export function createDevicePageConfig(): PageConfig {
  return {
    title: "Device",
    apiBaseUrl: "/api/v1/devices",
    endpoints: {
      list: {
        name: "listDevices",
        url: "/api/v1/devices",
        method: "GET",
        description: "獲取設備列表",
      },
      create: {
        name: "createDevice",
        url: "/api/v1/devices",
        method: "POST",
        description: "創建設備",
      },
      update: {
        name: "updateDevice",
        url: "/api/v1/devices/{id}",
        method: "PUT",
        description: "更新設備",
      },
      delete: {
        name: "deleteDevice",
        url: "/api/v1/devices/{id}",
        method: "DELETE",
        description: "刪除設備",
      },
    },
    fields: [
      {
        name: "deviceId",
        label: "設備ID",
        type: "string",
        required: false,
      },
      {
        name: "deviceName",
        label: "設備名稱",
        type: "string",
        required: true,
        placeholder: "請輸入設備名稱",
      },
      {
        name: "deviceModel",
        label: "設備型號",
        type: "string",
        required: true,
        placeholder: "請輸入設備型號",
      },
      {
        name: "deviceType",
        label: "設備類型",
        type: "select",
        required: true,
        options: [
          { label: "水位感測器", value: "WATER_LEVEL_SENSOR" },
          { label: "其他設備", value: "OTHER" },
        ],
        placeholder: "請選擇設備類型",
      },
      {
        name: "status",
        label: "狀態",
        type: "select",
        required: true,
        options: [
          { label: "運行中", value: "ACTIVE" },
          { label: "離線", value: "INACTIVE" },
        ],
        placeholder: "請選擇狀態",
      },
      {
        name: "location",
        label: "安裝位置",
        type: "string",
        required: true,
        placeholder: "請輸入安裝位置",
      },
      {
        name: "latitude",
        label: "緯度",
        type: "number",
        required: false,
        placeholder: "請輸入緯度",
      },
      {
        name: "longitude",
        label: "經度",
        type: "number",
        required: false,
        placeholder: "請輸入經度",
      },
    ],
    tableColumns: [
      { prop: "deviceName", label: "設備名稱", width: 120 },
      { prop: "deviceModel", label: "設備型號", width: 120, align: "center" },
      { prop: "deviceId", label: "設備ID", width: 140, align: "center" },
      { prop: "status", label: "狀態", width: 80, align: "center" },
      {
        prop: "location",
        label: "安裝位置",
        width: 150,
        align: "center",
        showOverflowTooltip: true,
      },
      { prop: "createdAt", label: "建立時間", width: 150, align: "center" },
    ],
    searchFields: ["deviceName", "deviceModel"],
  };
}

/**
 * 生成設備管理頁面
 */
export function generateDevicePage(): string {
  const config = createDevicePageConfig();
  const generator = new PageGenerator(config);
  return generator.generateVueComponent();
}
