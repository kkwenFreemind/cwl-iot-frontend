<!-- 系統配置 -->
<!-- 
  @author youlaitech
  @since 2024-08-27
 
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025-09-12

  System Configuration Management Component
  
  This component provides comprehensive system configuration management functionality including:
  - Configuration parameter creation, editing, and deletion (CRUD operations)
  - Real-time configuration search and filtering by config key or name
  - System configuration cache refresh with debounced API calls
  - Form validation with internationalized error messages
  - Responsive data table with pagination support
  - Modal dialog forms for configuration management
  - Multilingual support (Traditional Chinese / English) with dynamic language switching
-->
<template>
  <div class="app-container">
    <!-- Search Area -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="$t('config.keywords')" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('config.keywordsPlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">
            {{ $t("config.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">
            {{ $t("config.reset") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenDialog()">
            {{ $t("config.addConfig") }}
          </el-button>
          <el-button color="#626aef" icon="RefreshLeft" @click="handleRefreshCache">
            {{ $t("config.refreshCache") }}
          </el-button>
        </div>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        class="data-table__content"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="index" :label="$t('config.table.index')" width="70" />
        <el-table-column
          key="configName"
          :label="$t('config.table.configName')"
          prop="configName"
          width="180"
          show-overflow-tooltip
        />
        <el-table-column
          key="configKey"
          :label="$t('config.table.configKey')"
          prop="configKey"
          width="200"
          show-overflow-tooltip
        />
        <el-table-column
          key="configValue"
          :label="$t('config.table.configValue')"
          prop="configValue"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          key="remark"
          :label="$t('config.table.remark')"
          prop="remark"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column fixed="right" :label="$t('config.table.operation')" width="180">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              icon="edit"
              @click="handleOpenDialog(scope.row.id)"
            >
              {{ $t("config.table.edit") }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              icon="delete"
              @click="handleDelete(scope.row.id)"
            >
              {{ $t("config.table.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchData"
      />
    </el-card>

    <!-- System Configuration Form Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-suffix=":"
        label-width="100px"
      >
        <el-form-item :label="$t('config.form.configName')" prop="configName">
          <el-input
            v-model="formData.configName"
            :placeholder="$t('config.form.configNamePlaceholder')"
            :maxlength="50"
          />
        </el-form-item>
        <el-form-item :label="$t('config.form.configKey')" prop="configKey">
          <el-input
            v-model="formData.configKey"
            :placeholder="$t('config.form.configKeyPlaceholder')"
            :maxlength="50"
          />
        </el-form-item>
        <el-form-item :label="$t('config.form.configValue')" prop="configValue">
          <el-input
            v-model="formData.configValue"
            :placeholder="$t('config.form.configValuePlaceholder')"
            :maxlength="100"
          />
        </el-form-item>
        <el-form-item :label="$t('config.form.remark')" prop="remark">
          <el-input
            v-model="formData.remark"
            :rows="4"
            :maxlength="100"
            show-word-limit
            type="textarea"
            :placeholder="$t('config.form.remarkPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">
            {{ $t("config.form.confirm") }}
          </el-button>
          <el-button @click="handleCloseDialog">
            {{ $t("config.form.cancel") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * @fileoverview System Configuration Management Component
 * @description Provides comprehensive system configuration management with CRUD operations and cache refresh functionality
 * @author System Administrator
 * @created 2024-01-15
 * @updated 2024-01-15
 */

defineOptions({
  name: "Config",
  inheritAttrs: false,
});

import ConfigAPI, { ConfigPageVO, ConfigForm, ConfigPageQuery } from "@/api/system/config-api";
import { ElMessage, ElMessageBox } from "element-plus";
import { useDebounceFn } from "@vueuse/core";

const { t } = useI18n();

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<ConfigPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

// System configuration table data
const pageData = ref<ConfigPageVO[]>([]);

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<ConfigForm>({
  id: undefined,
  configName: "",
  configKey: "",
  configValue: "",
  remark: "",
});

const rules = computed(() => ({
  configName: [
    {
      required: true,
      message: t("config.validation.configNameRequired"),
      trigger: "blur",
    },
  ],
  configKey: [
    {
      required: true,
      message: t("config.validation.configKeyRequired"),
      trigger: "blur",
    },
  ],
  configValue: [
    {
      required: true,
      message: t("config.validation.configValueRequired"),
      trigger: "blur",
    },
  ],
}));

/**
 * Fetch system configuration data from API
 * @description Retrieves paginated configuration data based on current query parameters
 * @returns {Promise<void>} Promise that resolves when data is fetched
 */
function fetchData() {
  loading.value = true;
  ConfigAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * Handle search query execution
 * @description Resets pagination to first page and executes data fetch with current filters
 * @returns {void}
 */
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * Reset query form and parameters
 * @description Clears all search filters, resets form validation, and fetches fresh data
 * @returns {void}
 */
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * Handle table row selection change
 * @description Updates selected configuration IDs for batch operations
 * @param {any} selection - Array of selected table rows
 * @returns {void}
 */
function handleSelectionChange(selection: any) {
  selectIds.value = selection.map((item: any) => item.id);
}

/**
 * Open configuration dialog for create or edit
 * @description Opens modal dialog for configuration management, loads existing data for edit mode
 * @param {string} [id] - Configuration ID for edit mode, omit for create mode
 * @returns {void}
 */
function handleOpenDialog(id?: string) {
  dialog.visible = true;
  if (id) {
    dialog.title = t("config.form.title.edit");
    ConfigAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = t("config.form.title.add");
    formData.id = undefined;
  }
}

/**
 * Refresh system configuration cache (debounced)
 * @description Refreshes system configuration cache with debounce to prevent excessive API calls
 * @returns {void}
 */
const handleRefreshCache = useDebounceFn(() => {
  ConfigAPI.refreshCache().then(() => {
    ElMessage.success(t("config.messages.refreshCacheSuccess"));
  });
}, 1000);

/**
 * Submit configuration form data
 * @description Validates and submits configuration form for create or update operations
 * @returns {void}
 */
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        ConfigAPI.update(id, formData)
          .then(() => {
            ElMessage.success(t("config.messages.updateSuccess"));
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        ConfigAPI.create(formData)
          .then(() => {
            ElMessage.success(t("config.messages.createSuccess"));
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/**
 * Reset configuration form
 * @description Clears form data, validation errors, and resets form state
 * @returns {void}
 */
function resetForm() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
}

/**
 * Close configuration dialog
 * @description Closes modal dialog and resets form state
 * @returns {void}
 */
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

/**
 * Delete configuration item
 * @description Shows confirmation dialog and deletes configuration item if confirmed
 * @param {string} id - Configuration ID to delete
 * @returns {void}
 */
function handleDelete(id: string) {
  ElMessageBox.confirm(
    t("config.messages.confirmDelete"),
    t("config.messages.deleteConfirmTitle"),
    {
      confirmButtonText: t("config.form.confirm"),
      cancelButtonText: t("config.form.cancel"),
      type: "warning",
    }
  ).then(() => {
    loading.value = true;
    ConfigAPI.deleteById(id)
      .then(() => {
        ElMessage.success(t("config.messages.deleteSuccess"));
        handleResetQuery();
      })
      .finally(() => (loading.value = false));
  });
}

onMounted(() => {
  handleQuery();
});
</script>
