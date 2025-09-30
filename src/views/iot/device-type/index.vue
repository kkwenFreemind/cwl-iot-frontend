<!--
==================================================================================
Device Type Management Component
==================================================================================

This component provides comprehensive IoT device type management functionality including:
- Device type listing with search and pagination
- Device type creation, editing, and deletion
- Device type status management (active/inactive)
- Associated metrics configuration and management
- Device count tracking per type
- Multi-language support with internationalization
- Department-based data filtering and access control

Key Features:
- CRUD operations for IoT device types
- Metrics assignment and configuration per device type
- Real-time device count statistics
- Advanced search and filtering capabilities
- Responsive data table with sorting and pagination
- Form validation with comprehensive error handling
- Status management with visual indicators

Technical Stack:
- Vue 3 Composition API with TypeScript
- Element Plus UI components
- Reactive state management
- RESTful API integration
- Internationalization (i18n) support

@component DeviceTypeManagement
@author Chang Xiu-Wen, AI-Enhanced
@version 1.2.0
@created 2025-09-30
@updated 2025-09-30

==================================================================================
-->

<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" :label="$t('deviceType.typeName')">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('deviceType.keywordsPlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="success" icon="plus" @click="handleAddClick">
            {{ $t("deviceType.add") }}
          </el-button>
          <el-button type="primary" icon="search" @click="handleQuery">
            {{ $t("deviceType.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">
            {{ $t("deviceType.reset") }}
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
        <el-table-column :label="$t('deviceType.typeName')" prop="name" min-width="150" />
        <el-table-column
          :label="$t('deviceType.description')"
          prop="description"
          min-width="250"
          align="left"
          show-overflow-tooltip
        />
        <el-table-column
          :label="$t('deviceType.status')"
          align="center"
          prop="isActive"
          width="100"
        >
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'warning'" size="small">
              {{ scope.row.isActive ? $t("deviceType.active") : $t("deviceType.inactive") }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('deviceType.metrics')"
          prop="metrics"
          width="100"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.metrics?.length || 0 }} {{ $t("deviceType.metricsCount") }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('deviceType.deviceCount')"
          prop="deviceCount"
          width="100"
          align="center"
        >
          <template #default="scope">
            <span>{{ scope.row.deviceCount || 0 }} {{ $t("deviceType.devicesCount") }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('deviceType.createTime')"
          align="center"
          prop="createdAt"
          width="160"
        />
        <el-table-column :label="$t('deviceType.operation')" fixed="right" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              icon="edit"
              link
              size="small"
              @click="handleEditClick(scope.row)"
            >
              {{ $t("deviceType.edit") }}
            </el-button>
            <el-button
              type="info"
              icon="view"
              link
              size="small"
              @click="handleMetricsClick(scope.row)"
            >
              {{ $t("deviceType.metrics") }}
            </el-button>
            <el-button
              type="danger"
              icon="delete"
              link
              size="small"
              @click="handleDelete(scope.row)"
            >
              {{ $t("deviceType.delete") }}
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
        <el-form-item :label="$t('deviceType.deviceTypeForm.typeName')" prop="name">
          <el-input
            v-model="formData.name"
            :placeholder="$t('deviceType.deviceTypeForm.typeNamePlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('deviceType.deviceTypeForm.description')" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('deviceType.deviceTypeForm.descriptionPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('deviceType.deviceTypeForm.status')" prop="isActive">
          <el-switch
            v-model="formData.isActive"
            :active-text="$t('deviceType.active')"
            :inactive-text="$t('deviceType.inactive')"
          />
        </el-form-item>
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

    <!-- 指標關聯抽屜 -->
    <el-drawer
      v-model="metricsDialog.visible"
      :title="metricsDialog.title"
      append-to-body
      size="900px"
      @close="handleCloseMetricsDialog"
    >
      <div class="metrics-container">
        <!-- 設備類型信息卡片 -->
        <el-card class="device-type-info" shadow="never">
          <div class="info-header">
            <el-icon class="info-icon"><List /></el-icon>
            <div class="info-content">
              <h3 class="device-type-name">{{ currentDeviceType?.name }}</h3>
              <p class="device-type-desc">
                {{ currentDeviceType?.description || $t("deviceType.noDescription") }}
              </p>
            </div>
            <div class="info-status">
              <el-tag :type="currentDeviceType?.isActive ? 'success' : 'warning'" size="large">
                {{
                  currentDeviceType?.isActive ? $t("deviceType.active") : $t("deviceType.inactive")
                }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 指標選擇區域 -->
        <el-card class="metrics-selection-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon class="header-icon"><DataAnalysis /></el-icon>
              <span class="header-title">{{ $t("deviceType.selectMetrics") }}</span>
              <div class="metrics-summary">
                <el-tag type="primary" size="small">
                  {{ $t("deviceType.selectedCount", { count: selectedMetricIds.length }) }}
                </el-tag>
              </div>
            </div>
          </template>

          <div class="transfer-wrapper">
            <el-transfer
              v-model="selectedMetricIds"
              :data="availableMetrics"
              :titles="[$t('deviceType.availableMetrics'), $t('deviceType.selectedMetrics')]"
              filterable
              :filter-placeholder="$t('deviceType.searchMetrics')"
              class="enhanced-transfer"
            />
          </div>
        </el-card>

        <!-- 操作提示 -->
        <div class="operation-tips">
          <el-icon class="tip-icon"><InfoFilled /></el-icon>
          <span class="tip-text">{{ $t("deviceType.operationTips") }}</span>
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer enhanced-footer">
          <div class="footer-info">
            <el-icon class="footer-icon"><Warning /></el-icon>
            <span class="footer-text">{{ $t("deviceType.saveWarning") }}</span>
          </div>
          <div class="footer-actions">
            <el-button size="large" @click="handleCloseMetricsDialog">
              {{ $t("common.cancel") }}
            </el-button>
            <el-button
              type="primary"
              size="large"
              :disabled="selectedMetricIds.length === 0"
              :loading="metricsDialog.loading"
              @click="handleSaveMetrics"
            >
              <el-icon class="button-icon"><Check /></el-icon>
              {{ $t("common.confirm") }}
            </el-button>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { List, DataAnalysis, InfoFilled, Warning, Check } from "@element-plus/icons-vue";
import { useUserStoreHook } from "@/store/modules/user-store";
import DeviceTypeAPI, {
  IotDeviceTypeVO,
  IotDeviceTypeForm,
  IotDeviceTypeMetricsForm,
} from "@/api/iot/device-type-api";
import MetricAPI from "@/api/iot/metric-api";
import UserAPI from "@/api/system/user-api";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "DeviceTypeManagement",
  inheritAttrs: false,
});

/**
 * i18n 實例
 */
const { t } = useI18n();

/**
 * 表單驗證規則
 */
const rules = computed(() => ({
  name: [
    {
      required: true,
      message: t("deviceType.validation.typeNameRequired"),
      trigger: "blur",
    },
  ],
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

const metricsDialog = reactive({
  visible: false,
  title: "",
  loading: false,
});

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
  deptId: undefined as number | undefined,
});

const formData = reactive({
  id: undefined as number | undefined,
  name: "",
  description: "",
  deptId: 0,
  isActive: true,
});

const pageData = ref<IotDeviceTypeVO[]>([]);
const availableMetrics = ref<{ key: number; label: string; disabled?: boolean }[]>([]);
const selectedMetricIds = ref<number[]>([]);
const currentDeviceType = ref<IotDeviceTypeVO | null>(null);

/**
 * 用戶 store
 */
const userStore = useUserStoreHook();

/**
 * 表單引用
 */
const queryFormRef = ref();
const formRef = ref();

/**
 * 數據獲取
 */
async function fetchData() {
  loading.value = true;

  try {
    // Get user profile to get deptId
    const profile = await UserAPI.getProfile();
    const deptId = profile.deptId ? Number(profile.deptId) : undefined;

    // Filter out empty query parameters
    const params: any = {
      ...queryParams,
    };

    // Remove empty parameters
    Object.keys(params).forEach((key) => {
      if (params[key] === "" || params[key] === undefined) {
        delete params[key];
      }
    });

    // Add department ID if available
    if (deptId) {
      params.deptId = deptId;
    }

    console.log("Fetching device types with params:", params);

    const data = await DeviceTypeAPI.listDeviceTypes(params);
    pageData.value = data || [];
    total.value = data?.length || 0;
  } catch (error) {
    console.error("獲取數據失敗:", error);
    ElMessage.error(t("deviceType.errors.fetchDataFailed"));
  } finally {
    loading.value = false;
  }
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
  queryParams.keywords = "";
  fetchData();
}

/**
 * 新增按鈕點擊
 */
async function handleAddClick() {
  dialog.title = t("deviceType.deviceTypeForm.title.add");
  await resetForm();
  dialog.visible = true;
}

/**
 * 編輯按鈕點擊
 */
async function handleEditClick(row: IotDeviceTypeVO) {
  dialog.title = t("deviceType.deviceTypeForm.title.edit");
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    description: row.description || "",
    deptId: row.deptId,
    isActive: row.isActive,
  });
  dialog.visible = true;
}

/**
 * 指標管理按鈕點擊
 */
async function handleMetricsClick(row: IotDeviceTypeVO) {
  try {
    currentDeviceType.value = row;
    metricsDialog.title = `${t("deviceType.manageMetrics")} - ${row.name}`;

    // Get available metrics for the department
    const profile = await UserAPI.getProfile();
    const deptId = profile.deptId ? Number(profile.deptId) : undefined;

    if (deptId) {
      const metrics = await MetricAPI.getMetricDefinitions({ deptId: deptId.toString() });
      availableMetrics.value = metrics.map((metric: any) => ({
        key: metric.id!,
        label: `${metric.metricName} (${metric.alias || metric.unit})`,
        disabled: false,
      }));
      console.log("Available Metrics:", availableMetrics.value);
    }

    // Get current metric associations
    const deviceTypeDetail = await DeviceTypeAPI.getDeviceTypeDetail(row.id!);
    console.log("Device Type Detail:", deviceTypeDetail);

    // Try to get metric IDs from metricIds field first, then from metrics array
    let currentMetricIds: number[] = [];
    if (deviceTypeDetail.metricIds && deviceTypeDetail.metricIds.length > 0) {
      currentMetricIds = deviceTypeDetail.metricIds;
    } else if (deviceTypeDetail.metrics && deviceTypeDetail.metrics.length > 0) {
      currentMetricIds = deviceTypeDetail.metrics.map((metric) => metric.metricId);
    }

    console.log("Current Metric IDs:", currentMetricIds);

    // Open dialog first, then set selected IDs to ensure proper reactivity
    metricsDialog.visible = true;

    // Use nextTick to ensure the dialog is fully rendered before setting values
    await nextTick();
    selectedMetricIds.value = currentMetricIds;
    console.log("Set Selected Metric IDs:", selectedMetricIds.value);
  } catch (error) {
    console.error("獲取指標數據失敗:", error);
    ElMessage.error(t("deviceType.errors.fetchMetricsFailed"));
  }
}

/**
 * 保存指標關聯
 */
async function handleSaveMetrics() {
  if (!currentDeviceType.value?.id) return;

  metricsDialog.loading = true;
  try {
    const metricsForm: IotDeviceTypeMetricsForm = {
      metrics: selectedMetricIds.value.map((metricId) => ({
        metricId,
        isEnabled: true,
      })),
    };

    await DeviceTypeAPI.updateDeviceTypeMetrics(currentDeviceType.value.id, metricsForm);
    ElMessage.success(t("deviceType.updateMetricsSuccess"));
    handleCloseMetricsDialog();
    fetchData();
  } catch (error) {
    console.error("保存指標關聯失敗:", error);
    ElMessage.error(t("deviceType.errors.saveFailed"));
  } finally {
    metricsDialog.loading = false;
  }
}

/**
 * 刪除處理
 */
async function handleDelete(row: IotDeviceTypeVO) {
  try {
    await ElMessageBox.confirm(
      t("deviceType.deleteDialog.confirmMessage"),
      t("deviceType.deleteDialog.title"),
      {
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
        type: "warning",
      }
    );

    await DeviceTypeAPI.deleteDeviceType(row.id!);
    ElMessage.success(t("deviceType.deleteSuccess"));
    fetchData();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("刪除失敗:", error);
      ElMessage.error(t("deviceType.errors.deleteFailed"));
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

    // Get user profile to get deptId
    const profile = await UserAPI.getProfile();
    const deptId = profile.deptId ? Number(profile.deptId) : 0;

    // Prepare form data
    const submitData: IotDeviceTypeForm = {
      name: formData.name,
      description: formData.description,
      deptId,
      isActive: formData.isActive,
    };

    if (formData.id) {
      // Update
      await DeviceTypeAPI.updateDeviceType(formData.id, submitData);
      ElMessage.success(t("deviceType.updateSuccess"));
    } else {
      // Create
      await DeviceTypeAPI.createDeviceType(submitData);
      ElMessage.success(t("deviceType.addSuccess"));
    }

    handleCloseDialog();
    fetchData();
  } catch (error) {
    console.error("保存失敗:", error);
    ElMessage.error(t("deviceType.errors.saveFailed"));
  } finally {
    dialog.loading = false;
  }
}

/**
 * 關閉對話框
 */
async function handleCloseDialog() {
  dialog.visible = false;
  await resetForm();
}

/**
 * 關閉指標對話框
 */
function handleCloseMetricsDialog() {
  metricsDialog.visible = false;
  selectedMetricIds.value = [];
  currentDeviceType.value = null;
}

/**
 * 重置表單
 */
async function resetForm() {
  let deptId = 0;

  try {
    const profile = await UserAPI.getProfile();
    deptId = profile.deptId ? parseInt(profile.deptId) : 0;
  } catch (error) {
    console.error("獲取用戶個人資料失敗:", error);
    deptId = 0;
  }

  Object.assign(formData, {
    id: undefined,
    name: "",
    description: "",
    deptId,
    isActive: true,
  });
  formRef.value?.resetFields();
}

/**
 * 組件掛載時獲取數據
 */
onMounted(async () => {
  // 確保用戶資訊已載入
  if (!userStore.userInfo.userId) {
    try {
      await userStore.getUserInfo();
    } catch (error) {
      console.error("獲取用戶資訊失敗:", error);
    }
  }

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

.metrics-container {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .device-type-info {
    color: white;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;

    :deep(.el-card__body) {
      padding: 24px;
    }

    .info-header {
      display: flex;
      gap: 16px;
      align-items: center;

      .info-icon {
        font-size: 32px;
        opacity: 0.9;
      }

      .info-content {
        flex: 1;

        .device-type-name {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
        }

        .device-type-desc {
          margin: 0;
          font-size: 14px;
          opacity: 0.8;
        }
      }

      .info-status {
        .el-tag {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }
      }
    }
  }

  .metrics-selection-card {
    border-radius: 12px;

    .card-header {
      display: flex;
      gap: 8px;
      align-items: center;

      .header-icon {
        font-size: 18px;
        color: var(--el-color-primary);
      }

      .header-title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
      }

      .metrics-summary {
        .el-tag {
          border-radius: 12px;
        }
      }
    }

    .transfer-wrapper {
      .enhanced-transfer {
        :deep(.el-transfer) {
          .el-transfer-panel {
            border: 2px solid var(--el-border-color-light);
            border-radius: 8px;
            transition: all 0.3s ease;

            &:hover {
              border-color: var(--el-color-primary);
              box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
            }
          }

          .el-transfer-panel__header {
            font-weight: 600;
            background: var(--el-color-primary-light-9);
            border-bottom: 1px solid var(--el-color-primary-light-8);
            border-radius: 6px 6px 0 0;
          }

          .el-transfer-panel__item {
            margin: 2px 0;
            border-radius: 4px;
            transition: all 0.2s ease;

            &:hover {
              background: var(--el-color-primary-light-9);
              transform: translateX(2px);
            }
          }

          .el-transfer__buttons {
            padding: 0 20px;
          }
        }
      }
    }
  }

  .operation-tips {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 16px;
    background: rgba(255, 193, 7, 0.1);
    border-left: 4px solid var(--el-color-warning);
    border-radius: 6px;

    .tip-icon {
      font-size: 16px;
      color: var(--el-color-warning);
    }

    .tip-text {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}

// Transfer button styles
.metrics-container .enhanced-transfer :deep(.el-transfer__buttons .el-button) {
  width: 40px;
  height: 40px;
  margin: 4px 0;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: scale(1.1);
  }
}

.enhanced-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-top: 1px solid var(--el-border-color-light);

  .footer-info {
    display: flex;
    gap: 8px;
    align-items: center;

    .footer-icon {
      font-size: 16px;
      color: var(--el-color-warning);
    }

    .footer-text {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }

  .footer-actions {
    display: flex;
    gap: 12px;
  }

  .footer-actions .el-button {
    padding: 12px 24px;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }

    .button-icon {
      margin-right: 4px;
    }
  }

  .footer-actions .el-button--primary {
    background: linear-gradient(135deg, #409eff 0%, #1890ff 100%);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #66b1ff 0%, #40a9ff 100%);
    }

    &:disabled {
      background: var(--el-color-info-light-7);
      box-shadow: none;
      transform: none;
    }
  }
}
</style>
