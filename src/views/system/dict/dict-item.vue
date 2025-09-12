<!-- 
  @author youlaitech
  @since 2024-08-27
 
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025-09-12

  Dictionary Item Management Component
  
  This component provides comprehensive dictionary item management functionality for the IoT water level monitoring system including:
  - Dictionary item CRUD operations with label and value management
  - Advanced search and filtering capabilities for dictionary items
  - Tag type configuration with visual preview for display styling
  - Sort order management for dictionary item organization
  - Status control with enabled/disabled states for items
  - Batch operations for efficient dictionary item management
  - Internationalization support with reactive validation and responsive UI design
  - Professional form validation with multilingual error messages and tooltips
-->

<!-- 字典項 -->
<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="$t('dict.item.keywords')" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('dict.item.dictItemPlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

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

    <el-card shadow="never" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenDialog()">
            {{ $t("dict.item.addDictItem") }}
          </el-button>
          <el-button
            type="danger"
            :disabled="ids.length === 0"
            icon="delete"
            @click="handleDelete()"
          >
            {{ $t("common.delete") }}
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        highlight-current-row
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="$t('dict.item.dictItemLabel')" prop="label" />
        <el-table-column :label="$t('dict.item.dictItemValue')" prop="value" />
        <el-table-column :label="$t('dict.item.sort')" prop="sort" />
        <el-table-column :label="$t('dict.item.status')">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{
                scope.row.status === 1
                  ? $t("dict.item.statusNormal")
                  : $t("dict.item.statusDisabled")
              }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column fixed="right" :label="$t('dict.operation')" align="center" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleOpenDialog(scope.row)"
            >
              {{ $t("dict.edit") }}
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              icon="delete"
              @click.stop="handleDelete(scope.row.id)"
            >
              {{ $t("dict.delete") }}
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

    <!--字典項彈窗-->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="computedRules" label-width="100px">
        <el-form-item :label="$t('dict.item.form.dictItemLabel')" prop="label">
          <el-input
            v-model="formData.label"
            :placeholder="$t('dict.item.form.dictItemLabelPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('dict.item.form.dictItemValue')" prop="value">
          <el-input
            v-model="formData.value"
            :placeholder="$t('dict.item.form.dictItemValuePlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('dict.item.form.status')">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">{{ $t("dict.item.form.statusNormal") }}</el-radio>
            <el-radio :value="0">{{ $t("dict.item.form.statusDisabled") }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('dict.item.form.sort')">
          <el-input-number v-model="formData.sort" controls-position="right" />
        </el-form-item>
        <el-form-item>
          <template #label>
            <div class="flex-y-center">
              {{ $t("dict.item.tagType") }}
              <el-tooltip>
                <template #content>{{ $t("dict.item.tagTypeTooltip") }}</template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-select
            v-model="formData.tagType"
            :placeholder="$t('dict.item.form.tagTypePlaceholder')"
            clearable
            @clear="formData.tagType = ''"
          >
            <template #label="{ value }">
              <el-tag v-if="value" :type="value">
                {{ formData.label ? formData.label : $t("dict.item.dictItemLabel") }}
              </el-tag>
            </template>
            <!-- <el-option label="預設文字" value="" /> -->
            <el-option v-for="type in tagType" :key="type" :label="type" :value="type">
              <div flex-y-center gap-10px>
                <el-tag :type="type">{{ formData.label ?? $t("dict.item.dictItemLabel") }}</el-tag>
                <span>{{ type }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmitClick">
            {{ $t("common.confirm") }}
          </el-button>
          <el-button @click="handleCloseDialog">
            {{ $t("common.cancel") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { TagProps } from "element-plus";
import DictAPI, { DictItemPageQuery, DictItemPageVO, DictItemForm } from "@/api/system/dict-api";

const route = useRoute();
const { t } = useI18n();

const dictCode = ref(route.query.dictCode as string);

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<DictItemPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const tableData = ref<DictItemPageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<DictItemForm>({});

// 標籤型別
const tagType: TagProps["type"][] = ["primary", "success", "info", "warning", "danger"];

const computedRules = computed(() => {
  const rules: Partial<Record<string, any>> = {
    value: [
      { required: true, message: t("dict.validation.dictItemValueRequired"), trigger: "blur" },
    ],
    label: [
      { required: true, message: t("dict.validation.dictItemLabelRequired"), trigger: "blur" },
    ],
  };

  return rules;
});

/**
 * Fetch dictionary item data based on query parameters
 * Updates loading state and table data for specific dictionary
 */
function fetchData() {
  loading.value = true;
  DictAPI.getDictItemPage(dictCode.value, queryParams)
    .then((data) => {
      tableData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * Query dictionary items with reset page number
 * Resets to first page and fetches data
 */
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * Reset query form and refresh data
 * Clears all form fields and fetches data
 */
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * Handle table row selection change
 * Updates selected IDs for batch operations
 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

/**
 * Open dictionary item dialog for create or edit
 * Loads existing data for editing or shows empty form for creation
 *
 * @param row Optional dictionary item data for editing
 */
function handleOpenDialog(row?: DictItemPageVO) {
  dialog.visible = true;
  dialog.title = row ? t("dict.item.form.title.edit") : t("dict.item.form.title.add");

  if (row?.id) {
    DictAPI.getDictItemFormData(dictCode.value, row.id).then((data) => {
      Object.assign(formData, data);
    });
  }
}

/**
 * Submit dictionary item form
 * Handles both create and update operations with validation
 */
function handleSubmitClick() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = true;
      const id = formData.id;

      formData.dictCode = dictCode.value;
      if (id) {
        DictAPI.updateDictItem(dictCode.value, id, formData)
          .then(() => {
            ElMessage.success(t("dict.messages.updateSuccess"));
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DictAPI.createDictItem(dictCode.value, formData)
          .then(() => {
            ElMessage.success(t("dict.messages.createSuccess"));
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/**
 * Close dialog and reset form
 * Hides dialog and clears all form data and validation
 */
function handleCloseDialog() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();

  formData.id = undefined;
  formData.sort = 1;
  formData.status = 1;
  formData.tagType = "";

  dialog.visible = false;
}

/**
 * Delete dictionary items
 * Supports both single and batch deletion with confirmation
 *
 * @param id Optional dictionary item ID for single deletion
 */
function handleDelete(id?: number) {
  const itemIds = [id || ids.value].join(",");

  if (!itemIds) {
    ElMessage.warning(t("dict.messages.selectDeleteItems"));

    return;
  }
  ElMessageBox.confirm(t("dict.messages.confirmDelete"), t("dict.messages.deleteConfirmTitle"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning",
  }).then(
    () => {
      DictAPI.deleteDictItems(dictCode.value, itemIds).then(() => {
        ElMessage.success(t("dict.messages.deleteSuccess"));
        handleResetQuery();
      });
    },
    () => {
      ElMessage.info(t("dict.messages.deleteCancelled"));
    }
  );
}

onMounted(() => {
  handleQuery();
});
</script>
