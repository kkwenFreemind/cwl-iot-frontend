<template>
  <div class="app-container">
    <!-- Search Area -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" :label="$t('device.keywords')">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('device.keywordsPlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

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

    <el-card shadow="hover" class="data-table">
      <el-table
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        class="data-table__content"
      >
        <el-table-column :label="$t('device.deviceName')" prop="deviceName" min-width="120" />
        <el-table-column
          :label="$t('device.deviceModel')"
          prop="deviceModel"
          width="120"
          align="center"
        >
          <template #default="scope">
            <span>{{ getDeviceModelText(scope.row.deviceModel) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('device.deviceId')"
          prop="deviceId"
          width="140"
          align="center"
        />
        <el-table-column :label="$t('device.status')" align="center" prop="status" width="80">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('device.location')"
          prop="location"
          width="150"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          :label="$t('device.createTime')"
          align="center"
          prop="createdAt"
          width="150"
        />

        <!-- Operations column with action buttons -->
        <el-table-column :label="$t('device.operation')" fixed="right" width="220">
          <template #default="scope">
            <!-- Edit device button -->
            <el-button
              type="primary"
              icon="edit"
              link
              size="small"
              @click="handleEditClick(scope.row)"
            >
              {{ $t("device.edit") }}
            </el-button>
            <!-- Delete device button -->
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

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum!"
        v-model:limit="queryParams.pageSize!"
        @pagination="fetchData"
      />
    </el-card>

    <!-- Device form drawer (modal-like overlay) -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <!-- Device form with validation rules -->
      <el-form ref="deviceFormRef" :model="formData" :rules="rules" label-width="140px">
        <!-- Device name input field -->
        <el-form-item :label="$t('device.deviceForm.deviceName')" prop="deviceName">
          <el-input
            v-model="formData.deviceName"
            :placeholder="$t('device.deviceForm.deviceNamePlaceholder')"
          />
        </el-form-item>

        <!-- Device type selection -->
        <el-form-item :label="$t('device.deviceForm.deviceModel')" prop="deviceType">
          <el-select
            v-model="formData.deviceType"
            :placeholder="$t('device.deviceForm.deviceModelPlaceholder')"
          >
            <el-option :label="$t('device.waterLevelSensor')" value="WATER_LEVEL_SENSOR" />
            <el-option :label="$t('device.otherDevice')" value="OTHER" />
          </el-select>
        </el-form-item>

        <!-- Device ID field (read-only in edit mode) -->
        <el-form-item v-if="formData.deviceId" :label="$t('device.deviceId')" prop="deviceId">
          <el-input v-model="formData.deviceId" readonly :placeholder="$t('device.deviceId')" />
        </el-form-item>

        <!-- Device status selection -->
        <el-form-item :label="$t('device.deviceForm.status')" prop="status">
          <el-select
            v-model="formData.status"
            :placeholder="$t('device.deviceForm.statusPlaceholder')"
          >
            <el-option :label="$t('device.active')" value="ACTIVE" />
            <el-option :label="$t('device.inactive')" value="INACTIVE" />
          </el-select>
        </el-form-item>

        <!-- Device location input -->
        <el-form-item :label="$t('device.deviceForm.location')" prop="location">
          <el-input
            v-model="formData.location"
            :placeholder="$t('device.deviceForm.locationPlaceholder')"
          />
        </el-form-item>

        <!-- Geographic coordinates section -->
        <el-row :gutter="16">
          <!-- Latitude input -->
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
          <!-- Longitude input -->
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

      <!-- Drawer footer with action buttons -->
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
/**
 * @fileoverview Device Management Component
 * @description Simple and stable device management with basic CRUD operations
 * @author System Administrator
 * @created 2024-01-15
 * @updated 2024-01-15
 */

defineOptions({
  name: "DeviceManagement",
  inheritAttrs: false,
});

import DeviceAPI from "@/api/iot/device-api";
import type { DeviceVO, DeviceQuery, DeviceForm } from "@/api/iot/device-api";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/store/modules/app-store";
import type { FormInstance, FormRules } from "element-plus";

/**
 * Extended query parameters interface with pagination for device filtering and search
 */
interface DeviceQueryWithPagination extends DeviceQuery {
  pageNum?: number;
  pageSize?: number;
}

const { t } = useI18n();
const appStore = useAppStore();

const queryFormRef = ref<FormInstance>();
const deviceFormRef = ref<FormInstance>();

const loading = ref(false);
const total = ref(0);

// Selected device IDs for bulk operations
const selectIds = ref<string[]>([]);

// Dialog/modal state management
const dialog = reactive({
  visible: false,
  title: "",
  loading: false,
});

// Device form data for create/edit operations
const formData = reactive<DeviceForm>({
  deviceId: undefined,
  deviceName: "",
  deviceModel: "",
  deviceType: "WATER_LEVEL_SENSOR",
  deptId: 0,
  status: "ACTIVE",
  location: "",
  latitude: undefined,
  longitude: undefined,
});

const queryParams = reactive<DeviceQueryWithPagination>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

// Device table data
const pageData = ref<DeviceVO[]>([]);

/**
 * Computed Properties
 * Reactive computed values that automatically update when dependencies change
 */

/**
 * Dynamic drawer size based on device type
 * Responsive design: larger drawer on desktop, full-width on mobile
 */
const drawerSize = computed(() => (appStore.device === "desktop" ? "600px" : "90%"));

/**
 * Form Validation Rules
 * Comprehensive validation rules for device form fields
 * Uses computed property for reactive translation support
 */
const rules = computed<FormRules>(() => ({
  deviceName: [
    {
      required: true,
      message: t("device.validation.deviceNameRequired"),
      trigger: "blur",
    },
  ],
  deviceType: [
    {
      required: true,
      message: t("device.validation.deviceTypeRequired"),
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

/**
 * Fetch device data from API
 * @description Retrieves paginated device data based on current query parameters
 * @returns {Promise<void>} Promise that resolves when data is fetched
 */
function fetchData() {
  loading.value = true;
  DeviceAPI.listDevices(queryParams)
    .then((data: any) => {
      // Handle different response formats
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
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  queryParams.keywords = "";
  fetchData();
}

/**
 * Get status tag type for Element Plus tags
 * @param status - Device status string
 * @returns Element Plus tag type
 */
function getStatusTagType(status: string): "success" | "warning" | "danger" | "info" | "primary" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "INACTIVE":
      return "warning";
    default:
      return "info";
  }
}

/**
 * Get localized status text
 * @param status - Device status string
 * @returns Localized status text
 */
function getStatusText(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    default:
      return status;
  }
}

/**
 * Get localized device model text
 * @param deviceModel - Device model string
 * @returns Localized device model text
 */
function getDeviceModelText(deviceModel: string): string {
  switch (deviceModel) {
    case "WATER_LEVEL_SENSOR":
      return t("device.waterLevelSensor");
    case "OTHER":
      return t("device.otherDevice");
    default:
      return deviceModel;
  }
}

/**
 * Handle edit button click in table
 * @param row - Device data object from table row
 */
function handleEditClick(row: DeviceVO) {
  console.log("Edit button clicked, deviceId:", row.deviceId);
  handleOpenDialog(row.deviceId);
}

/**
 * Handle device deletion
 * @param deviceId - Device ID to delete
 */
async function handleDelete(deviceId?: string) {
  const ids = deviceId ? [deviceId] : selectIds.value;
  if (ids.length === 0) {
    ElMessage.warning(t("device.selectDevicesToDelete"));
    return;
  }

  try {
    // Show confirmation dialog
    await ElMessageBox.confirm(t("device.deleteConfirmation"), t("device.deleteTitle"), {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      type: "warning",
    });

    // Execute deletion
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
 * Handle dialog opening for device creation/editing
 * Manages dialog state and form data population
 * @param deviceId - Optional device ID for edit mode
 */
async function handleOpenDialog(deviceId?: string) {
  dialog.visible = true;

  if (deviceId) {
    // Edit mode: Populate form with existing device data
    dialog.title = t("device.edit");
    try {
      // Find device in current page data (optimization to avoid extra API call)
      const device = pageData.value.find((d) => d.deviceId === deviceId);
      if (device) {
        Object.assign(formData, {
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          deviceModel: device.deviceModel,
          deviceType: device.deviceType,
          deptId: device.deptId,
          status: device.status,
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
    // Create mode: Initialize empty form
    dialog.title = t("device.add");
    resetForm();
  }
}

/**
 * Handle dialog closing
 * Resets dialog state and form data
 */
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

/**
 * Reset device form to initial state
 * Clears all form fields and validation states
 */
function resetForm() {
  Object.assign(formData, {
    deviceId: undefined,
    deviceName: "",
    deviceModel: "",
    deviceType: "WATER_LEVEL_SENSOR",
    deptId: 0,
    status: "ACTIVE",
    location: "",
    latitude: undefined,
    longitude: undefined,
  });
  deviceFormRef.value?.resetFields();
}

/**
 * Handle form submission for device creation/updates
 * Validates form data and executes appropriate API operation
 * Provides user feedback through success/error messages
 */
async function handleSubmit() {
  if (!deviceFormRef.value) return;

  try {
    // Validate form before submission
    const valid = await deviceFormRef.value.validate();
    if (!valid) return;

    dialog.loading = true;

    if (formData.deviceId) {
      // Update existing device
      await DeviceAPI.updateDevice(formData.deviceId, formData);
      ElMessage.success(t("device.updateSuccess"));
    } else {
      // Create new device
      await DeviceAPI.addDevice(formData);
      ElMessage.success(t("device.addSuccess"));
    }

    // Close dialog and refresh data
    handleCloseDialog();
    fetchData();
  } catch (error) {
    console.error("Error saving device:", error);
    ElMessage.error(t("device.saveError"));
  } finally {
    dialog.loading = false;
  }
}

onMounted(() => {
  handleQuery();
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

/**
 * Drawer footer styling
 * Provides consistent button layout in modal drawer footer
 */
.drawer-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>
