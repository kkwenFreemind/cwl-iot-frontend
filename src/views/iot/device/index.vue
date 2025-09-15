<!-- 
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025/09/14

  IoT Device Management Component
  IoT設備管理組件
  
  This component provides comprehensive IoT device management functionality including:
  - Device listing with filtering and search
  - Device CRUD operations (Create, Read, Update, Delete)
  - Status management and heartbeat updates
  - Department-based filtering
  - Location and spatial information management
  - Responsive design with drawer-based forms
-->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- Department Tree S    console.log("First device id (deviceId):", data[0].deviceId);
    console.log("First device keys:", Object.keys(data[0]));ebar / 部門樹側邊欄 -->
      <el-col :lg="4" :xs="24" class="mb-[12px]">
        <DeptTree v-model="queryParams.deptId" @node-click="handleQuery" />
      </el-col>

      <!-- Main Content Area / 主要內容區域 -->
      <el-col :lg="20" :xs="24">
        <!-- Search Form Container / 搜尋表單容器 -->
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <!-- Keywords Search Input / 關鍵字搜尋輸入框 -->
            <el-form-item :label="$t('device.keywords')" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                :placeholder="$t('device.keywordsPlaceholder')"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <!-- Device Status Filter / 設備狀態篩選 -->
            <el-form-item :label="$t('device.status')" prop="status">
              <el-select
                v-model="queryParams.status"
                :placeholder="$t('device.statusAll')"
                clearable
                style="width: 120px"
              >
                <el-option :label="$t('device.active')" value="ACTIVE" />
                <el-option :label="$t('device.inactive')" value="INACTIVE" />
                <el-option :label="$t('device.disabled')" value="DISABLED" />
              </el-select>
            </el-form-item>

            <!-- Search Action Buttons / 搜尋操作按鈕 -->
            <el-form-item class="search-buttons">
              <el-button type="primary" icon="search" @click="handleQuery">
                {{ $t("device.search") }}
              </el-button>
              <el-button icon="refresh" @click="handleResetQuery">
                {{ $t("device.reset") }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Data Table Card / 資料表格卡片 -->
        <el-card shadow="hover" class="data-table">
          <!-- Table Toolbar / 表格工具列 -->
          <div class="data-table__toolbar">
            <div class="data-table__toolbar--actions">
              <!-- Add Device Button / 新增設備按鈕 -->
              <el-button type="success" icon="plus" @click="handleOpenDialog()">
                {{ $t("device.add") }}
              </el-button>
              <!-- Batch Delete Button / 批次刪除按鈕 -->
              <el-button
                type="danger"
                icon="delete"
                :disabled="selectIds.length === 0"
                @click="handleDelete()"
              >
                {{ $t("device.delete") }}
              </el-button>
            </div>
          </div>

          <!-- Device Data Table / 設備資料表格 -->
          <el-table
            v-loading="loading"
            :data="pageData"
            border
            stripe
            highlight-current-row
            class="data-table__content"
            @selection-change="handleSelectionChange"
          >
            <!-- Selection Column / 選擇欄位 -->
            <el-table-column type="selection" width="50" align="center" />
            <!-- Device Name Column / 設備名稱欄位 -->
            <el-table-column :label="$t('device.deviceName')" prop="deviceName" min-width="120" />
            <!-- Device Model Column / 設備型號欄位 -->
            <el-table-column
              :label="$t('device.deviceModel')"
              prop="deviceModel"
              width="120"
              align="center"
            />
            <!-- Serial Number Column / 序號欄位 -->
            <el-table-column
              :label="$t('device.deviceId')"
              prop="deviceId"
              width="140"
              align="center"
            />
            <!-- Department Column / 部門欄位 -->
            <el-table-column
              :label="$t('device.department')"
              width="120"
              align="center"
              prop="deptName"
            />
            <!-- Status Column with Tag Display / 狀態欄位帶標籤顯示 -->
            <el-table-column :label="$t('device.status')" align="center" prop="status" width="80">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <!-- Online Status Column / 在線狀態欄位 -->
            <el-table-column :label="$t('device.online')" align="center" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.isOnline ? 'success' : 'info'" size="small">
                  {{ scope.row.isOnline ? $t("device.online") : $t("device.offline") }}
                </el-tag>
              </template>
            </el-table-column>
            <!-- Location Column / 位置欄位 -->
            <el-table-column
              :label="$t('device.location')"
              prop="location"
              width="150"
              align="center"
              show-overflow-tooltip
            />
            <!-- Create Time Column / 建立時間欄位 -->
            <el-table-column
              :label="$t('device.createTime')"
              align="center"
              prop="createdAt"
              width="150"
            />
            <!-- Operation Column with Action Buttons / 操作欄位帶操作按鈕 -->
            <el-table-column :label="$t('device.operation')" fixed="right" width="220">
              <template #default="scope">
                <!-- Update Heartbeat Button / 更新心跳按鈕 -->
                <el-button
                  type="warning"
                  icon="Refresh"
                  size="small"
                  link
                  @click="handleUpdateHeartbeat(scope.row)"
                >
                  {{ $t("device.heartbeat") }}
                </el-button>
                <!-- Edit Device Button / 編輯設備按鈕 -->
                <el-button
                  type="primary"
                  icon="edit"
                  link
                  size="small"
                  @click="handleEditClick(scope.row)"
                >
                  {{ $t("device.edit") }}
                </el-button>
                <!-- Delete Device Button / 刪除設備按鈕 -->
                <el-button
                  type="danger"
                  icon="delete"
                  link
                  size="small"
                  @click="handleDelete(scope.row.deviceId)"
                >
                  {{ $t("device.delete") }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- Simple List Display (when no pagination data) / 簡單列表顯示（無分頁數據時） -->
          <div v-if="pageData.length === 0 && !loading" class="empty-data">
            <el-empty :description="$t('device.noData')" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Device Form Drawer / 設備表單抽屜 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <!-- Device Form / 設備表單 -->
      <el-form ref="deviceFormRef" :model="formData" :rules="rules" label-width="100px">
        <!-- Device Name Field / 設備名稱欄位 -->
        <el-form-item :label="$t('device.deviceForm.deviceName')" prop="deviceName">
          <el-input
            v-model="formData.deviceName"
            :placeholder="$t('device.deviceForm.deviceNamePlaceholder')"
          />
        </el-form-item>

        <!-- Device Model Field / 設備型號欄位 -->
        <el-form-item :label="$t('device.deviceForm.deviceModel')" prop="deviceModel">
          <el-input
            v-model="formData.deviceModel"
            :placeholder="$t('device.deviceForm.deviceModelPlaceholder')"
          />
        </el-form-item>

        <!-- Device ID Field (Read-only when editing) / 設備ID欄位（編輯時唯讀） -->
        <el-form-item v-if="formData.deviceId" :label="$t('device.deviceId')" prop="deviceId">
          <el-input v-model="formData.deviceId" readonly :placeholder="$t('device.deviceId')" />
        </el-form-item>

        <!-- Department Field / 部門欄位 -->
        <el-form-item :label="$t('device.deviceForm.department')" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            :data="deptOptions"
            :placeholder="$t('device.deviceForm.deptPlaceholder')"
            :props="{ value: 'value', label: 'label', children: 'children' }"
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <!-- Status Field / 狀態欄位 -->
        <el-form-item :label="$t('device.deviceForm.status')" prop="status">
          <el-select
            v-model="formData.status"
            :placeholder="$t('device.deviceForm.statusPlaceholder')"
          >
            <el-option :label="$t('device.active')" value="ACTIVE" />
            <el-option :label="$t('device.inactive')" value="INACTIVE" />
            <el-option :label="$t('device.disabled')" value="DISABLED" />
          </el-select>
        </el-form-item>

        <!-- Location Field / 位置欄位 -->
        <el-form-item :label="$t('device.deviceForm.location')" prop="location">
          <el-input
            v-model="formData.location"
            :placeholder="$t('device.deviceForm.locationPlaceholder')"
          />
        </el-form-item>

        <!-- Coordinates Fields / 座標欄位 -->
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('device.deviceForm.latitude')" prop="latitude">
              <el-input-number
                v-model="formData.latitude"
                :placeholder="$t('device.deviceForm.latitudePlaceholder')"
                :precision="6"
                :step="0.000001"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('device.deviceForm.longitude')" prop="longitude">
              <el-input-number
                v-model="formData.longitude"
                :placeholder="$t('device.deviceForm.longitudePlaceholder')"
                :precision="6"
                :step="0.000001"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- Form Actions / 表單操作 -->
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
// Vue Composition API imports
import { computed, onMounted, reactive, ref, toRefs } from "vue";
// Element Plus components and utilities
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
// Internationalization
import { useI18n } from "vue-i18n";
// Store and utilities
import { useAppStore } from "@/store/modules/app-store";

// API and Type imports
import DeviceAPI, { type DeviceForm, type DeviceQuery, type DeviceVO } from "@/api/iot/device-api";
import DeptAPI from "@/api/system/dept-api";

// Component imports
import DeptTree from "@/views/system/user/components/DeptTree.vue";

// Component setup
defineOptions({
  name: "DeviceManagement",
  inheritAttrs: false,
});

// Internationalization setup
const { t } = useI18n();

// Store access
const appStore = useAppStore();

// Reactive data state
const state = reactive({
  loading: false,
  // Device list data
  pageData: [] as DeviceVO[],
  // Query parameters
  queryParams: {
    keywords: "",
    status: "",
    deptId: undefined as number | undefined,
    createTime: undefined as [string, string] | undefined,
  } as DeviceQuery,
  // Selection management
  selectIds: [] as string[],
  // Dialog state
  dialog: {
    visible: false,
    title: "",
    loading: false,
  },
  // Form data
  formData: {
    deviceId: undefined,
    deviceName: "",
    deviceModel: "",
    status: "ACTIVE",
    deptId: 0 as number,
    location: "",
    latitude: undefined,
    longitude: undefined,
  } as DeviceForm,
  // Department options for form
  deptOptions: [] as OptionType[],
});

// Destructure reactive state
const { loading, pageData, queryParams, selectIds, dialog, formData, deptOptions } = toRefs(state);

// Template refs
const queryFormRef = ref<FormInstance>();
const deviceFormRef = ref<FormInstance>();

// Computed properties
const drawerSize = computed(() => (appStore.device === "desktop" ? "600px" : "90%"));

// Form validation rules
const rules = computed<FormRules>(() => ({
  deviceName: [
    {
      required: true,
      message: t("device.validation.deviceNameRequired"),
      trigger: "blur",
    },
  ],
  deviceModel: [
    {
      required: true,
      message: t("device.validation.deviceModelRequired"),
      trigger: "blur",
    },
  ],
  deptId: [
    {
      required: true,
      message: t("device.validation.deptRequired"),
      trigger: "change",
    },
  ],
  status: [
    {
      required: true,
      message: t("device.validation.statusRequired"),
      trigger: "change",
    },
  ],
  location: [
    {
      required: true,
      message: t("device.validation.locationRequired"),
      trigger: "blur",
    },
  ],
}));

// Utility functions

/**
 * Get status tag type for display
 * 獲取狀態標籤類型用於顯示
 */
function getStatusTagType(status: string): "success" | "warning" | "danger" | "info" | "primary" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "INACTIVE":
      return "warning";
    case "DISABLED":
      return "danger";
    default:
      return "info";
  }
}

/**
 * Get localized status text
 * 獲取本地化狀態文本
 */
function getStatusText(status: string): string {
  // Map canonical status codes to the i18n keys used in language files.
  // Some language files use `device.statusActive` etc., while others
  // may provide short keys like `device.active`. Prefer the explicit
  // `statusXxx` keys first and fall back to the short key and finally
  // to the raw status code.
  switch (status) {
    case "ACTIVE":
      return t("device.statusActive");
    case "INACTIVE":
      return t("device.statusInactive");
    case "DISABLED":
      return t("device.statusDisabled");
    default: {
      const shortKey = status ? status.toLowerCase() : "";
      const short = shortKey ? t(`device.${shortKey}`) : "";
      // If translation returns the key itself (no translation), fall back to status
      if (short === `device.${shortKey}` || short === "") return status;
      return short;
    }
  }
}

// Data fetching methods

/**
 * Fetch device data from API
 * 從 API 獲取設備數據
 */
async function fetchData() {
  try {
    loading.value = true;
    const data = await DeviceAPI.listDevices(queryParams.value);
    pageData.value = data;
  } catch (error) {
    console.error("Error fetching devices:", error);
    ElMessage.error(t("device.fetchError"));
  } finally {
    loading.value = false;
  }
}

/**
 * Load department tree options
 * 載入部門樹選項
 */
async function loadDeptOptions() {
  try {
    const data = await DeptAPI.getOptions();
    deptOptions.value = data;
  } catch (error) {
    console.error("Error loading departments:", error);
  }
}

// Event handlers

/**
 * Handle edit button click
 * 處理編輯按鈕點擊
 */
function handleEditClick(row: DeviceVO) {
  console.log("Edit button clicked, deviceId:", row.deviceId);
  handleOpenDialog(row.deviceId);
}

/**
 * Handle search query
 * 處理搜尋查詢
 */
function handleQuery() {
  fetchData();
}

/**
 * Reset search query
 * 重置搜尋查詢
 */
function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.value = {
    keywords: "",
    status: "",
    deptId: undefined,
    createTime: undefined,
  };
  fetchData();
}

/**
 * Handle table selection change
 * 處理表格選擇變更
 */
function handleSelectionChange(selection: DeviceVO[]) {
  selectIds.value = selection.map((item) => item.deviceId);
}

/**
 * Open device form dialog
 * 打開設備表單對話框
 */
async function handleOpenDialog(deviceId?: string) {
  dialog.value.visible = true;

  if (deviceId) {
    dialog.value.title = t("device.edit");
    try {
      // Find device from current page data instead of API call
      const device = pageData.value.find((d) => d.deviceId === deviceId);
      if (device) {
        Object.assign(formData.value, {
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          deviceModel: device.deviceModel,
          status: device.status,
          deptId: device.deptId,
          location: device.location,
          latitude: device.latitude,
          longitude: device.longitude,
        });
      } else {
        console.warn("Device not found in current page data");
        ElMessage.error(t("device.deviceNotFound"));
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error loading device details:", error);
      ElMessage.error(t("device.loadError"));
      handleCloseDialog();
    }
  } else {
    dialog.value.title = t("device.add");
    resetForm();
  }
}

/**
 * Close device form dialog
 * 關閉設備表單對話框
 */
function handleCloseDialog() {
  dialog.value.visible = false;
  resetForm();
}

/**
 * Reset form data
 * 重置表單數據
 */
function resetForm() {
  Object.assign(formData.value, {
    deviceId: undefined,
    deviceName: "",
    deviceModel: "",
    status: "ACTIVE",
    deptId: 0,
    location: "",
    latitude: undefined,
    longitude: undefined,
  });
  deviceFormRef.value?.resetFields();
}

/**
 * Handle form submission
 * 處理表單提交
 */
async function handleSubmit() {
  if (!deviceFormRef.value) return;

  try {
    const valid = await deviceFormRef.value.validate();
    if (!valid) return;

    dialog.value.loading = true;

    if (formData.value.deviceId) {
      // Update existing device
      await DeviceAPI.updateDevice(formData.value.deviceId, formData.value);
      ElMessage.success(t("device.updateSuccess"));
    } else {
      // Create new device
      await DeviceAPI.addDevice(formData.value);
      ElMessage.success(t("device.addSuccess"));
    }

    handleCloseDialog();
    fetchData();
  } catch (error) {
    console.error("Error saving device:", error);
    ElMessage.error(t("device.saveError"));
  } finally {
    dialog.value.loading = false;
  }
}

/**
 * Handle device deletion
 * 處理設備刪除
 */
async function handleDelete(deviceId?: string) {
  const ids = deviceId ? [deviceId] : selectIds.value;
  if (ids.length === 0) {
    ElMessage.warning(t("device.selectDevicesToDelete"));
    return;
  }

  try {
    await ElMessageBox.confirm(t("device.deleteConfirmation"), t("device.deleteTitle"), {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      type: "warning",
    });

    await DeviceAPI.deleteDevices(ids.join(","));
    ElMessage.success(t("device.deleteSuccess"));
    fetchData();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("Error deleting devices:", error);
      ElMessage.error(t("device.deleteError"));
    }
  }
}

/**
 * Handle device heartbeat update
 * 處理設備心跳更新
 */
async function handleUpdateHeartbeat(device: DeviceVO) {
  try {
    await DeviceAPI.updateDeviceHeartbeat(device.deviceId);
    ElMessage.success(t("device.heartbeatUpdateSuccess"));
    fetchData();
  } catch (error) {
    console.error("Error updating heartbeat:", error);
    ElMessage.error(t("device.heartbeatUpdateError"));
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchData();
  loadDeptOptions();
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
  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    &--actions {
      display: flex;
      gap: 8px;
    }
  }

  &__content {
    width: 100%;
  }
}

.empty-data {
  padding: 40px 0;
  text-align: center;
}

.drawer-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 0;
}

// Responsive design
@media (max-width: 768px) {
  .app-container {
    padding: 12px;
  }

  .search-container {
    padding: 16px;
  }

  :deep(.el-form--inline .el-form-item) {
    display: block;
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>
