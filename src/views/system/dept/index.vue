<!-- 
  @author youlaitech
  @since 2024-08-27
 
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025-09-12

  Department Management Component
  
  This component provides comprehensive department/community management functionality for the IoT water level monitoring system including:
  - Hierarchical community structure management with parent-child relationships
  - Advanced search and filtering capabilities by name and status
  - CRUD operations (Create, Read, Update, Delete) for community records
  - Internationalization support with reactive validation and responsive UI design
  - Batch operations for efficient community management
  - Real-time data synchronization with backend API
  - Professional form validation with multilingual error messages
-->

<template>
  <div class="app-container">
    <!-- Search and Filter Section -->
    <!-- Provides advanced search capabilities for community/department filtering -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="$t('dept.keywords')" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('dept.deptNamePlaceholder')"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item :label="$t('dept.status')" prop="status">
          <el-select
            v-model="queryParams.status"
            :placeholder="$t('dept.statusAll')"
            clearable
            style="width: 100px"
          >
            <el-option :value="1" :label="$t('dept.statusNormal')" />
            <el-option :value="0" :label="$t('dept.statusDisabled')" />
          </el-select>
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button class="filter-item" type="primary" icon="search" @click="handleQuery">
            {{ $t("common.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">{{ $t("common.reset") }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenDialog()">
            {{ $t("common.add") }}
          </el-button>
          <el-button
            type="danger"
            :disabled="selectIds.length === 0"
            icon="delete"
            @click="handleDelete()"
          >
            {{ $t("common.delete") }}
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="deptList"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        class="data-table__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="name" :label="$t('dept.deptName')" min-width="200" />
        <el-table-column prop="code" :label="$t('dept.deptCode')" width="180" />
        <el-table-column prop="status" :label="$t('common.status')" width="90" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status == 1" type="success" size="small">
              {{ $t("dept.statusNormal") }}
            </el-tag>
            <el-tag v-else type="info" size="small">{{ $t("dept.statusDisabled") }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('dept.coordinates')" width="180" align="center">
          <template #default="scope">
            <div
              v-if="scope.row.centerLatitude && scope.row.centerLongitude"
              class="coordinates-cell"
            >
              <div class="coordinate-item">
                <span class="coordinate-label">{{ $t("dept.centerLatitude") }}:</span>
                <span class="coordinate-value">{{ scope.row.centerLatitude }}</span>
              </div>
              <div class="coordinate-item">
                <span class="coordinate-label">{{ $t("dept.centerLongitude") }}:</span>
                <span class="coordinate-value">{{ scope.row.centerLongitude }}</span>
              </div>
            </div>
            <el-tag v-else type="info" size="small">{{ $t("common.notSet") }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sort" :label="$t('dept.sort')" width="80" align="center" />

        <el-table-column :label="$t('common.operation')" fixed="right" align="left" width="200">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              icon="plus"
              @click.stop="handleOpenDialog(scope.row.id, undefined)"
            >
              {{ $t("common.add") }}
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleOpenDialog(scope.row.parentId, scope.row.id)"
            >
              {{ $t("common.edit") }}
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              icon="delete"
              @click.stop="handleDelete(scope.row.id)"
            >
              {{ $t("common.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="700px"
      @closed="handleCloseDialog"
    >
      <el-form ref="deptFormRef" :model="formData" :rules="rules" label-width="140px">
        <el-form-item :label="$t('dept.form.parentDept')" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :placeholder="$t('dept.parentDeptPlaceholder')"
            :data="deptOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>
        <el-form-item :label="$t('dept.form.deptName')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('dept.form.deptNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('dept.form.deptCode')" prop="code">
          <el-input v-model="formData.code" :placeholder="$t('dept.form.deptCodePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('dept.form.sort')" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            style="width: 100px"
            :min="0"
          />
        </el-form-item>
        <el-form-item :label="$t('dept.form.status')">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">{{ $t("dept.form.statusNormal") }}</el-radio>
            <el-radio :value="0">{{ $t("dept.form.statusDisabled") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- Geographic Coordinates Section -->
        <el-divider content-position="left">
          <span style="font-size: 14px; color: var(--el-text-color-regular)">
            {{ $t("dept.form.coordinatesHint") }}
          </span>
        </el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('dept.form.centerLatitude')" prop="centerLatitude">
              <el-input-number
                v-model="formData.centerLatitude"
                :placeholder="$t('dept.form.centerLatitudePlaceholder')"
                :precision="6"
                :step="0.000001"
                :min="-90"
                :max="90"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('dept.form.centerLongitude')" prop="centerLongitude">
              <el-input-number
                v-model="formData.centerLongitude"
                :placeholder="$t('dept.form.centerLongitudePlaceholder')"
                :precision="6"
                :step="0.000001"
                :min="-180"
                :max="180"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">{{ $t("common.confirm") }}</el-button>
          <el-button @click="handleCloseDialog">{{ $t("common.cancel") }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Dept",
  inheritAttrs: false,
});

import DeptAPI, { DeptVO, DeptForm, DeptQuery } from "@/api/system/dept-api";

const { t } = useI18n();

const queryFormRef = ref();
const deptFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const queryParams = reactive<DeptQuery>({});

const dialog = reactive({
  title: "",
  visible: false,
});

const deptList = ref<DeptVO[]>();
const deptOptions = ref<OptionType[]>();
const formData = reactive<DeptForm>({
  status: 1,
  parentId: "0",
  sort: 1,
});

const rules = computed(() => ({
  parentId: [
    { required: true, message: t("dept.validation.parentDeptRequired"), trigger: "change" },
  ],
  name: [{ required: true, message: t("dept.validation.deptNameRequired"), trigger: "blur" }],
  code: [{ required: true, message: t("dept.validation.deptCodeRequired"), trigger: "blur" }],
  sort: [{ required: true, message: t("dept.validation.sortRequired"), trigger: "blur" }],
  centerLatitude: [
    {
      validator: (rule: any, value: number, callback: any) => {
        if (value !== undefined && value !== null && (value < -90 || value > 90)) {
          callback(new Error(t("dept.validation.centerLatitudeInvalid")));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  centerLongitude: [
    {
      validator: (rule: any, value: number, callback: any) => {
        if (value !== undefined && value !== null && (value < -180 || value > 180)) {
          callback(new Error(t("dept.validation.centerLongitudeInvalid")));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
}));

/**
 * Query department/community list
 * Fetches data based on current query parameters
 */
function handleQuery() {
  loading.value = true;
  DeptAPI.getList(queryParams).then((data) => {
    deptList.value = data;
    loading.value = false;
  });
}

/**
 * Reset query form and refresh data
 */
function handleResetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

/**
 * Handle table selection change
 * Updates selected IDs for batch operations
 */
function handleSelectionChange(selection: any) {
  selectIds.value = selection.map((item: any) => item.id);
}

/**
 * Open department/community dialog for create or edit
 * Loads department options and populates form data for editing
 *
 * @param parentId Parent department ID for new departments
 * @param deptId Department ID for editing existing departments
 */
async function handleOpenDialog(parentId?: string, deptId?: string) {
  // Load department dropdown options
  const data = await DeptAPI.getOptions();
  deptOptions.value = [
    {
      value: "0",
      label: t("dept.topLevel"),
      children: data,
    },
  ];

  dialog.visible = true;
  if (deptId) {
    dialog.title = t("dept.form.title.edit");
    DeptAPI.getFormData(deptId).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = t("dept.form.title.add");
    formData.parentId = parentId || "0";
  }
}

/**
 * Submit department/community form
 * Handles both create and update operations
 */
function handleSubmit() {
  deptFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const deptId = formData.id;
      if (deptId) {
        DeptAPI.update(deptId, formData)
          .then(() => {
            ElMessage.success(t("dept.messages.updateSuccess"));
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DeptAPI.create(formData)
          .then(() => {
            ElMessage.success(t("dept.messages.createSuccess"));
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/**
 * Delete department/community
 * Supports both single and batch deletion
 */
function handleDelete(deptId?: number) {
  const deptIds = [deptId || selectIds.value].join(",");

  if (!deptIds) {
    ElMessage.warning(t("dept.messages.selectDeleteItems"));
    return;
  }

  ElMessageBox.confirm(t("dept.messages.confirmDelete"), t("dept.messages.deleteConfirmTitle"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      DeptAPI.deleteByIds(deptIds)
        .then(() => {
          ElMessage.success(t("dept.messages.deleteSuccess"));
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    () => {
      ElMessage.info(t("dept.messages.deleteCancelled"));
    }
  );
}

/**
 * Reset form fields and validation state
 * Clears all form data and error states
 */
function resetForm() {
  deptFormRef.value.resetFields();
  deptFormRef.value.clearValidate();

  formData.id = undefined;
  formData.parentId = "0";
  formData.status = 1;
  formData.sort = 1;
  formData.centerLatitude = undefined;
  formData.centerLongitude = undefined;
}

/**
 * Close dialog and reset form
 * Handles dialog cleanup and form reset
 */
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
/**
 * Department Management Component Styles
 *
 * Responsive design for department/community management interface
 * Prevents text wrapping and ensures optimal layout across devices
 */

/* Dialog responsive adjustments */
:deep(.el-dialog) {
  @media (max-width: 768px) {
    width: 95% !important;
    margin: 5vh auto;
  }
}

/* Form responsive layout */
:deep(.el-form) {
  @media (max-width: 768px) {
    .el-form-item__label {
      width: 100% !important;
      margin-bottom: 5px;
      text-align: left !important;
    }

    .el-form-item__content {
      margin-left: 0 !important;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .el-form-item__label {
      width: 120px !important;
    }
  }
}

/* Prevent text wrapping in table cells */
:deep(.el-table) {
  .el-table__cell {
    .cell {
      padding: 8px 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  /* Status column specific styling */
  .el-table__header th:nth-child(4),
  .el-table__body td:nth-child(4) {
    .cell {
      padding: 6px 2px;
      text-align: center;
    }
  }

  /* Sort column styling */
  .el-table__header th:nth-child(6),
  .el-table__body td:nth-child(6) {
    .cell {
      font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
      font-size: 13px;
      text-align: center;
    }
  }
}

/* Coordinates display styling */
.coordinates-cell {
  padding: 2px 0;

  .coordinate-item {
    display: flex;
    align-items: center;
    margin-bottom: 1px;
    font-size: 11px;
    line-height: 1.2;

    &:last-child {
      margin-bottom: 0;
    }

    .coordinate-label {
      min-width: 24px;
      margin-right: 2px;
      font-size: 10px;
      font-weight: 500;
      color: var(--el-text-color-secondary);
    }

    .coordinate-value {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
      font-size: 10px;
      color: var(--el-text-color-primary);
    }
  }
}

/* Button text wrapping prevention */
:deep(.el-button) {
  white-space: nowrap;
}

/* Input and select width adjustments */
:deep(.el-input),
:deep(.el-select),
:deep(.el-tree-select) {
  width: 100%;
}

/* Radio group responsive layout */
:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .el-radio {
    margin-right: 0;
  }
}
</style>
