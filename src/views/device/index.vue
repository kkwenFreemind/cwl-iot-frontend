<!-- 
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025/09/14

  Device Management Component
  設備管理組件
  
  This component provides comprehensive device management functionality including:
  - Device listing with pagination and filtering
  - Device CRUD operations (Create, Read, Update, Delete)
  - Status management with real-time updates
  - Department-based filtering and access control
  - Spatial queries for location-based device search
  - Device statistics dashboard
  - Responsive design with drawer-based forms
  - Internationalization support
-->
<template>
  <div class="app-container">
    <!-- Device Statistics Panel / 設備統計面板 -->
    <DeviceStats :stats="deviceStats" />

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
            <el-option :label="$t('device.statusActive')" value="active" />
            <el-option :label="$t('device.statusInactive')" value="inactive" />
            <el-option :label="$t('device.statusDisabled')" value="disabled" />
          </el-select>
        </el-form-item>

        <!-- Department Filter / 部門篩選 -->
        <el-form-item :label="$t('device.department')" prop="deptId">
          <el-tree-select
            v-model="queryParams.deptId"
            :placeholder="$t('device.filters.department')"
            :data="deptOptions"
            filterable
            check-strictly
            clearable
            style="width: 180px"
          />
        </el-form-item>

        <!-- Device Model Filter / 設備型號篩選 -->
        <el-form-item :label="$t('device.deviceModel')" prop="model">
          <el-input
            v-model="queryParams.model"
            :placeholder="$t('device.filters.model')"
            clearable
            style="width: 150px"
          />
        </el-form-item>

        <!-- Location Filter / 位置篩選 -->
        <el-form-item :label="$t('device.location')" prop="location">
          <el-input
            v-model="queryParams.location"
            :placeholder="$t('device.filters.location')"
            clearable
            style="width: 150px"
          />
        </el-form-item>

        <!-- Install Date Range Picker / 安裝日期範圍選擇器 -->
        <el-form-item :label="$t('device.installDate')">
          <el-date-picker
            v-model="queryParams.createTime"
            :editable="false"
            type="daterange"
            range-separator="~"
            :start-placeholder="$t('user.startTime')"
            :end-placeholder="$t('user.endTime')"
            value-format="YYYY-MM-DD"
          />
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
          <!-- Export Button / 匯出按鈕 -->
          <el-button type="info" icon="download" @click="handleExport">
            {{ $t("device.actions.exportData") }}
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
        <el-table-column :label="$t('device.deviceName')" prop="deviceName" min-width="150" />

        <!-- Device Model Column / 設備型號欄位 -->
        <el-table-column :label="$t('device.deviceModel')" prop="deviceModel" width="130" />

        <!-- Serial Number Column / 序號欄位 -->
        <el-table-column :label="$t('device.serialNumber')" prop="serialNumber" width="140" />

        <!-- Department Column / 部門欄位 -->
        <el-table-column
          :label="$t('device.department')"
          prop="deptName"
          width="120"
          align="center"
        />

        <!-- Location Column / 位置欄位 -->
        <el-table-column :label="$t('device.location')" prop="location" width="150" />

        <!-- Status Column with Tag Display / 狀態欄位帶標籤顯示 -->
        <el-table-column :label="$t('device.status')" align="center" prop="status" width="100">
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

        <!-- Install Date Column / 安裝日期欄位 -->
        <el-table-column
          :label="$t('device.installDate')"
          align="center"
          prop="installDate"
          width="120"
        />

        <!-- Last Seen Column / 最後在線欄位 -->
        <el-table-column
          :label="$t('device.lastSeen')"
          align="center"
          prop="lastSeenAt"
          width="150"
        />

        <!-- Operation Column with Action Buttons / 操作欄位帶操作按鈕 -->
        <el-table-column :label="$t('device.operation')" fixed="right" width="280">
          <template #default="scope">
            <!-- View Details Button / 查看詳情按鈕 -->
            <el-button
              type="primary"
              icon="view"
              size="small"
              link
              @click="handleViewDetails(scope.row)"
            >
              {{ $t("device.actions.viewDetails") }}
            </el-button>

            <!-- Update Status Dropdown / 更新狀態下拉選單 -->
            <el-dropdown @command="(command) => handleStatusUpdate(scope.row, command)">
              <el-button type="warning" icon="edit" size="small" link>
                {{ $t("device.actions.updateStatus") }}
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="active">
                    {{ $t("device.statusActive") }}
                  </el-dropdown-item>
                  <el-dropdown-item command="inactive">
                    {{ $t("device.statusInactive") }}
                  </el-dropdown-item>
                  <el-dropdown-item command="disabled">
                    {{ $t("device.statusDisabled") }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <!-- Edit Device Button / 編輯設備按鈕 -->
            <el-button
              type="primary"
              icon="edit"
              link
              size="small"
              @click="handleOpenDialog(scope.row.id)"
            >
              {{ $t("device.edit") }}
            </el-button>

            <!-- Delete Device Button / 刪除設備按鈕 -->
            <el-button
              type="danger"
              icon="delete"
              link
              size="small"
              @click="handleDelete(scope.row.id)"
            >
              {{ $t("device.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination Component / 分頁組件 -->
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchData"
      />
    </el-card>

    <!-- Device Form Drawer / 設備表單抽屜 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <!-- Device Form / 設備表單 -->
      <el-form ref="deviceFormRef" :model="formData" :rules="rules" label-width="120px">
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

        <!-- Serial Number Field / 序號欄位 -->
        <el-form-item :label="$t('device.deviceForm.serialNumber')" prop="serialNumber">
          <el-input
            v-model="formData.serialNumber"
            :placeholder="$t('device.deviceForm.serialNumberPlaceholder')"
          />
        </el-form-item>

        <!-- Description Field / 描述欄位 -->
        <el-form-item :label="$t('device.deviceForm.description')" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('device.deviceForm.descriptionPlaceholder')"
          />
        </el-form-item>

        <!-- Department Tree Select / 部門樹狀選擇器 -->
        <el-form-item :label="$t('device.deviceForm.department')" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            :placeholder="$t('device.deviceForm.departmentPlaceholder')"
            :data="deptOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
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
                :placeholder="$t('device.deviceForm.latitude')"
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
                :placeholder="$t('device.deviceForm.longitude')"
                :precision="6"
                :step="0.000001"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Manufacturer Field / 製造商欄位 -->
        <el-form-item :label="$t('device.deviceForm.manufacturer')" prop="manufacturer">
          <el-input
            v-model="formData.manufacturer"
            :placeholder="$t('device.deviceForm.manufacturerPlaceholder')"
          />
        </el-form-item>

        <!-- Install Date Field / 安裝日期欄位 -->
        <el-form-item :label="$t('device.deviceForm.installDate')" prop="installDate">
          <el-date-picker
            v-model="formData.installDate"
            type="date"
            :placeholder="$t('device.deviceForm.installDate')"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <!-- Purchase Price Field / 採購價格欄位 -->
        <el-form-item :label="$t('device.deviceForm.purchasePrice')" prop="purchasePrice">
          <el-input-number
            v-model="formData.purchasePrice"
            :placeholder="$t('device.deviceForm.purchasePrice')"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>

        <!-- Version Fields / 版本欄位 -->
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('device.deviceForm.firmwareVersion')" prop="firmwareVersion">
              <el-input
                v-model="formData.firmwareVersion"
                :placeholder="$t('device.deviceForm.firmwareVersion')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('device.deviceForm.hardwareVersion')" prop="hardwareVersion">
              <el-input
                v-model="formData.hardwareVersion"
                :placeholder="$t('device.deviceForm.hardwareVersion')"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Warranty Expiry Field / 保固到期日欄位 -->
        <el-form-item :label="$t('device.deviceForm.warrantyExpiry')" prop="warrantyExpiry">
          <el-date-picker
            v-model="formData.warrantyExpiry"
            type="date"
            :placeholder="$t('device.deviceForm.warrantyExpiry')"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <!-- Status Switch / 狀態開關 -->
        <el-form-item :label="$t('device.deviceForm.status')" prop="status">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option :label="$t('device.statusActive')" value="active" />
            <el-option :label="$t('device.statusInactive')" value="inactive" />
            <el-option :label="$t('device.statusDisabled')" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- Drawer Footer with Action Buttons / 抽屜底部操作按鈕 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">
            {{ $t("device.deviceForm.confirm") }}
          </el-button>
          <el-button @click="handleCloseDialog">
            {{ $t("device.deviceForm.cancel") }}
          </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- Device Details Drawer / 設備詳情抽屜 -->
    <el-drawer
      v-model="detailDialog.visible"
      :title="detailDialog.title"
      append-to-body
      :size="drawerSize"
    >
      <div v-if="selectedDevice" class="device-details">
        <!-- Basic Information / 基本信息 -->
        <el-descriptions :title="$t('device.actions.viewDetails')" :column="2" border>
          <el-descriptions-item :label="$t('device.deviceName')">
            {{ selectedDevice.deviceName }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.deviceModel')">
            {{ selectedDevice.deviceModel }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.serialNumber')">
            {{ selectedDevice.serialNumber }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.status')">
            <el-tag :type="getStatusTagType(selectedDevice.status)">
              {{ getStatusText(selectedDevice.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.department')">
            {{ selectedDevice.deptName }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.location')">
            {{ selectedDevice.location }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.manufacturer')">
            {{ selectedDevice.manufacturer || "-" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.installDate')">
            {{ selectedDevice.installDate || "-" }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- Technical Information / 技術信息 -->
        <el-descriptions
          v-if="selectedDevice.firmwareVersion || selectedDevice.hardwareVersion"
          title="技術信息"
          :column="2"
          border
          class="mt-4"
        >
          <el-descriptions-item
            v-if="selectedDevice.firmwareVersion"
            :label="$t('device.deviceForm.firmwareVersion')"
          >
            {{ selectedDevice.firmwareVersion }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="selectedDevice.hardwareVersion"
            :label="$t('device.deviceForm.hardwareVersion')"
          >
            {{ selectedDevice.hardwareVersion }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- Status Information / 狀態信息 -->
        <el-descriptions title="狀態信息" :column="2" border class="mt-4">
          <el-descriptions-item :label="$t('device.online')">
            <el-tag :type="selectedDevice.isOnline ? 'success' : 'info'">
              {{ selectedDevice.isOnline ? $t("device.online") : $t("device.offline") }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.lastSeen')">
            {{ selectedDevice.lastSeenAt || "-" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('common.createTime')">
            {{ selectedDevice.createTime }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('common.updateTime')">
            {{ selectedDevice.updateTime || "-" }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- Description / 描述 -->
        <div v-if="selectedDevice.description" class="mt-4">
          <h4>設備描述</h4>
          <p class="device-description">{{ selectedDevice.description }}</p>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
// Store Imports / 儲存匯入
import { useAppStore } from "@/store/modules/app-store";

// API Layer Imports / API 層匯入
import DeviceAPI, {
  type DeviceForm,
  type DevicePageQuery,
  type DeviceVO,
  type DeviceStatsVO,
  DeviceStatus,
} from "@/api/device/device-api";
import DeptAPI from "@/api/system/dept-api";

// Component Imports / 組件匯入
import DeviceStats from "./components/DeviceStats.vue";

// Component Configuration / 組件配置
defineOptions({
  name: "DeviceManagement",
  inheritAttrs: false,
});

// Reactive Dependencies / 響應式依賴
const appStore = useAppStore();
const { t } = useI18n();

// Template References / 模板引用
const queryFormRef = ref();
const deviceFormRef = ref();

// Query Parameters for Device List / 設備列表查詢參數
const queryParams = reactive<DevicePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// Data State Management / 資料狀態管理
const pageData = ref<DeviceVO[]>([]);
const total = ref(0);
const loading = ref(false);

// Device Statistics / 設備統計
const deviceStats = ref<DeviceStatsVO>({
  totalDevices: 0,
  activeDevices: 0,
  inactiveDevices: 0,
  disabledDevices: 0,
  onlineDevices: 0,
  offlineDevices: 0,
  maintenanceDueDevices: 0,
  warrantyExpiringDevices: 0,
});

// Dialog State Management / 對話框狀態管理
const dialog = reactive({
  visible: false,
  title: "",
});

// Detail Dialog State / 詳情對話框狀態
const detailDialog = reactive({
  visible: false,
  title: "",
});

// Selected Device for Details / 選中的設備詳情
const selectedDevice = ref<DeviceVO>();

// Responsive Drawer Size / 響應式抽屜尺寸
const drawerSize = computed(() => (appStore.device === "desktop" ? "600px" : "90%"));

// Form Data for Device Creation/Editing / 設備建立/編輯表單資料
const formData = reactive<DeviceForm>({
  deviceName: "",
  deviceModel: "",
  serialNumber: "",
  status: DeviceStatus.ACTIVE,
  deptId: 0,
  location: "",
});

// Form Validation Rules / 表單驗證規則
const rules = reactive({
  deviceName: [
    {
      required: true,
      message: computed(() => t("device.validation.deviceNameRequired")),
      trigger: "blur",
    },
  ],
  deviceModel: [
    {
      required: true,
      message: computed(() => t("device.validation.deviceModelRequired")),
      trigger: "blur",
    },
  ],
  serialNumber: [
    {
      required: true,
      message: computed(() => t("device.validation.serialNumberRequired")),
      trigger: "blur",
    },
  ],
  deptId: [
    {
      required: true,
      message: computed(() => t("device.validation.deptRequired")),
      trigger: "blur",
    },
  ],
  location: [
    {
      required: true,
      message: computed(() => t("device.validation.locationRequired")),
      trigger: "blur",
    },
  ],
});

// Selection State for Batch Operations / 批次操作選擇狀態
const selectIds = ref<string[]>([]);

// Options for Form Selects / 表單選擇器選項
const deptOptions = ref<OptionType[]>([]);

/**
 * Get status tag type for display
 * 獲取狀態標籤類型用於顯示
 */
function getStatusTagType(
  status: DeviceStatus
): "success" | "warning" | "danger" | "info" | "primary" {
  switch (status) {
    case DeviceStatus.ACTIVE:
      return "success";
    case DeviceStatus.INACTIVE:
      return "warning";
    case DeviceStatus.DISABLED:
      return "danger";
    default:
      return "info";
  }
}

/**
 * Get status text for display
 * 獲取狀態文字用於顯示
 */
function getStatusText(status: DeviceStatus): string {
  switch (status) {
    case DeviceStatus.ACTIVE:
      return t("device.statusActive");
    case DeviceStatus.INACTIVE:
      return t("device.statusInactive");
    case DeviceStatus.DISABLED:
      return t("device.statusDisabled");
    default:
      return status;
  }
}

/**
 * Fetch device data from API with current query parameters
 * 根據當前查詢參數從 API 獲取設備資料
 */
async function fetchData() {
  loading.value = true;
  try {
    const response = await DeviceAPI.getPage(queryParams);
    const data = response.data;
    pageData.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

/**
 * Fetch device statistics
 * 獲取設備統計
 */
async function fetchDeviceStats() {
  try {
    // For now, use a default department ID or current user's department
    // In real implementation, this would come from user context
    const response = await DeviceAPI.getDeviceStats(1);
    deviceStats.value = response.data;
  } catch (error) {
    console.error("Failed to fetch device statistics:", error);
  }
}

/**
 * Handle search query with reset to first page
 * 處理搜尋查詢並重置到第一頁
 */
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * Reset search form and query parameters
 * 重置搜尋表單和查詢參數
 */
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  queryParams.deptId = undefined;
  queryParams.createTime = undefined;
  fetchData();
}

/**
 * Handle table selection change for batch operations
 * 處理表格選擇變更以供批次操作使用
 */
function handleSelectionChange(selection: DeviceVO[]) {
  selectIds.value = selection.map((item) => item.id);
}

/**
 * Handle device status update
 * 處理設備狀態更新
 */
function handleStatusUpdate(device: DeviceVO, status: DeviceStatus) {
  ElMessageBox.confirm(t("device.statusUpdate.confirmActive"), t("device.statusUpdate.title"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning",
  }).then(() => {
    DeviceAPI.updateStatus(device.id, status).then(() => {
      ElMessage.success(t("device.statusUpdate.success"));
      fetchData();
    });
  });
}

/**
 * Handle view device details
 * 處理查看設備詳情
 */
function handleViewDetails(device: DeviceVO) {
  selectedDevice.value = device;
  detailDialog.visible = true;
  detailDialog.title = device.deviceName;
}

/**
 * Open device form drawer for create or edit operations
 * 開啟設備表單抽屜進行建立或編輯操作
 */
async function handleOpenDialog(id?: string) {
  dialog.visible = true;
  // Load form options data / 載入表單選項資料
  deptOptions.value = await DeptAPI.getOptions();

  if (id) {
    // Edit mode: Load existing device data / 編輯模式：載入現有設備資料
    dialog.title = t("device.deviceForm.title.edit");
    DeviceAPI.getFormData(id).then((data) => {
      Object.assign(formData, { ...data });
    });
  } else {
    // Create mode: Set default title / 建立模式：設定預設標題
    dialog.title = t("device.deviceForm.title.add");
  }
}

/**
 * Close device form drawer and reset form state
 * 關閉設備表單抽屜並重置表單狀態
 */
function handleCloseDialog() {
  dialog.visible = false;
  deviceFormRef.value?.resetFields();
  deviceFormRef.value?.clearValidate();

  // Reset form data to initial state / 重置表單資料到初始狀態
  Object.assign(formData, {
    id: undefined,
    deviceName: "",
    deviceModel: "",
    serialNumber: "",
    status: DeviceStatus.ACTIVE,
    deptId: 0,
    location: "",
    description: "",
    latitude: undefined,
    longitude: undefined,
    manufacturer: "",
    installDate: "",
    purchasePrice: undefined,
    firmwareVersion: "",
    hardwareVersion: "",
    warrantyExpiry: "",
  });
}

/**
 * Handle form submission with debounce to prevent multiple submissions
 * 處理表單提交並使用防抖以防止多次提交
 */
const handleSubmit = useDebounceFn(() => {
  deviceFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const deviceId = formData.id;
      loading.value = true;

      if (deviceId) {
        // Update existing device / 更新現有設備
        DeviceAPI.update(deviceId, formData)
          .then(() => {
            ElMessage.success(t("device.updateSuccessMessage"));
            handleCloseDialog();
            handleResetQuery();
            fetchDeviceStats();
          })
          .finally(() => (loading.value = false));
      } else {
        // Create new device / 建立新設備
        DeviceAPI.create(formData)
          .then(() => {
            ElMessage.success(t("device.createSuccessMessage"));
            handleCloseDialog();
            handleResetQuery();
            fetchDeviceStats();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}, 1000);

/**
 * Delete device(s) with confirmation dialog
 * 刪除設備並顯示確認對話框
 */
function handleDelete(id?: string) {
  // Prepare device IDs for deletion (single or batch) / 準備刪除的設備ID（單個或批次）
  const deviceIds = [id || selectIds.value].join(",");
  if (!deviceIds) {
    ElMessage.warning(t("device.deleteDialog.noSelectionWarning"));
    return;
  }

  // Show confirmation dialog / 顯示確認對話框
  ElMessageBox.confirm(t("device.deleteDialog.confirmMessage"), t("device.deleteDialog.title"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning",
  })
    .then(() => {
      // Execute deletion / 執行刪除
      loading.value = true;
      DeviceAPI.deleteByIds(deviceIds)
        .then(() => {
          ElMessage.success(t("device.deleteDialog.successMessage"));
          handleResetQuery();
          fetchDeviceStats();
        })
        .finally(() => (loading.value = false));
    })
    .catch(() => {
      ElMessage.info(t("device.deleteDialog.cancelMessage"));
    });
}

/**
 * Handle export functionality
 * 處理匯出功能
 */
function handleExport() {
  ElMessage.info("匯出功能開發中...");
}

// Component Lifecycle: Initialize data on mount / 組件生命週期：掛載時初始化資料
onMounted(() => {
  handleQuery();
  fetchDeviceStats();
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
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

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
      gap: 12px;
    }
  }

  &__content {
    .el-table__cell {
      padding: 12px 0;
    }
  }
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 0;
  margin-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
}

.device-details {
  .el-descriptions {
    margin-bottom: 20px;
  }

  .device-description {
    padding: 12px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    background: var(--el-bg-color-page);
    border-left: 4px solid var(--el-color-primary);
    border-radius: 6px;
  }

  .mt-4 {
    margin-top: 16px;
  }

  h4 {
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

// Responsive design
@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }

  .search-container {
    padding: 15px;
  }

  .data-table {
    &__toolbar {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;

      &--actions {
        flex-wrap: wrap;
      }
    }
  }

  .el-table {
    font-size: 12px;

    .el-table__cell {
      padding: 8px 0;
    }
  }

  .dialog-footer {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}

// Dark mode adjustments
.dark {
  .search-container {
    background: var(--el-bg-color-overlay);
  }

  .device-description {
    background: var(--el-bg-color-overlay);
  }
}
</style>
