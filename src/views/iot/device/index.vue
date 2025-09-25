<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" :label="$t('device.deviceName')">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('device.deviceNamePlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="success" icon="plus" @click="handleAddClick">
            {{ $t("device.add") }}
          </el-button>
          <el-button type="primary" icon="search" @click="handleQuery">
            {{ $t("device.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">
            {{ $t("device.reset") }}
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
        <el-table-column
          :label="$t('device.deviceName')"
          prop="deviceName"
          min-width="100"
          sortable
        />
        <el-table-column
          :label="$t('device.deviceModel')"
          prop="deviceModel"
          width="180"
          align="center"
        >
          <template #default="scope">
            <span>{{ getDeviceModelText(scope.row.deviceModel) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('device.deviceType')"
          prop="deviceTypeId"
          width="180"
          align="center"
        >
          <template #default="scope">
            <span
              :title="`ID: ${scope.row.deviceTypeId}, Name: ${getDeviceTypeName(Number(scope.row.deviceTypeId))}`"
            >
              {{ getDeviceTypeName(Number(scope.row.deviceTypeId)) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('device.location')"
          prop="location"
          width="250"
          align="center"
          show-overflow-tooltip
          sortable
        />

        <el-table-column :label="$t('device.status')" align="center" prop="status" width="80">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('device.createTime')"
          align="center"
          prop="createdAt"
          width="200"
          sortable
        />
        <el-table-column :label="$t('device.operation')" fixed="right" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              icon="edit"
              link
              size="small"
              @click="handleEditClick(scope.row)"
            >
              {{ $t("device.edit") }}
            </el-button>
            <el-button
              type="info"
              icon="view"
              link
              size="small"
              @click="handleDetailClick(scope.row)"
            >
              {{ $t("device.detailButton") }}
            </el-button>
            <el-button
              type="danger"
              icon="delete"
              link
              size="small"
              @click="handleDelete(scope.row)"
            >
              {{ $t("device.delete") }}
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
        <el-form-item :label="$t('device.deviceForm.deviceName')" prop="deviceName">
          <el-input
            v-model="formData.deviceName"
            :placeholder="$t('device.deviceForm.deviceNamePlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('device.deviceForm.deviceModel')" prop="deviceModel">
          <el-select
            v-model="formData.deviceModel"
            :placeholder="$t('device.deviceForm.deviceModelPlaceholder')"
          >
            <el-option :label="$t('device.waterLevelSensor')" value="WATER_LEVEL_SENSOR" />
            <el-option :label="$t('device.otherDevice')" value="OTHER" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('device.deviceForm.deviceType')" prop="deviceTypeId">
          <el-select
            v-model="formData.deviceTypeId"
            :placeholder="$t('device.deviceForm.deviceTypePlaceholder')"
            filterable
            clearable
            @change="onDeviceTypeChange"
            @visible-change="onDropdownVisibleChange"
          >
            <el-option
              v-for="option in deviceTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <!-- Debug info -->
          <div style="margin-top: 5px; font-size: 12px; color: #666">
            當前選擇: {{ currentDeviceTypeName }} (ID: {{ formData.deviceTypeId }})
            <br />
            設備類型數量: {{ deviceTypes.length }}
            <br />
            可用選項: {{ deviceTypes.map((t) => `${t.id}: ${t.name}`).join(", ") }}
          </div>
        </el-form-item>

        <el-form-item v-if="formData.deviceId" :label="$t('device.deviceId')" prop="deviceId">
          <el-input v-model="formData.deviceId" readonly :placeholder="$t('device.deviceId')" />
        </el-form-item>
        <el-form-item :label="$t('device.deviceForm.status')" prop="status">
          <el-select
            v-model="formData.status"
            :placeholder="$t('device.deviceForm.statusPlaceholder')"
          >
            <el-option :label="$t('device.active')" value="ACTIVE" />
            <el-option :label="$t('device.inactive')" value="INACTIVE" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('device.deviceForm.location')" prop="location">
          <el-input
            v-model="formData.location"
            :placeholder="$t('device.deviceForm.locationPlaceholder')"
          />
        </el-form-item>
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
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user-store";
import DeviceAPI, { DeviceVO } from "@/api/iot/device-api";
import DeviceTypeAPI, { IotDeviceTypeVO } from "@/api/iot/device-type-api";
import UserAPI from "@/api/system/user-api";
import { useI18n } from "vue-i18n";

/**
 * Device Management Component
 *
 * This component provides comprehensive IoT device management functionality including:
 * - Device listing with search and pagination
 * - Device creation, editing, and deletion
 * - EMQX MQTT broker configuration management
 * - Geographic location tracking with latitude/longitude
 * - Multi-protocol support (Sparkplug B, Modbus TCP, HTTP JSON, Custom MQTT)
 *
 * @component DeviceManagement
 * @author Chang Xiu-Wen, AI-Enhanced
 * @version 1.0.0
 */
defineOptions({
  name: "DeviceManagement",
  inheritAttrs: false,
});

/**
 * Internationalization instance for multi-language support
 * @type {ReturnType<typeof useI18n>}
 */
const { t } = useI18n();

/**
 * Form validation rules for device management form
 * Defines validation constraints for all form fields including required fields,
 * data types, and custom validation messages
 * @type {ComputedRef<Record<string, Array<Record<string, any>>>>}
 */
const rules = computed(() => ({
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
      message: t("device.validation.deviceTypeRequired"),
      trigger: "change",
    },
  ],
  deviceTypeId: [
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
 * Reactive state variables for component data management
 */

/**
 * Loading state for data table and async operations
 * @type {Ref<boolean>}
 */
const loading = ref(false);

/**
 * Total number of devices for pagination
 * @type {Ref<number>}
 */
const total = ref(0);

/**
 * Dialog state management for form drawer
 * @type {UnwrapNestedRefs<{visible: boolean, title: string, loading: boolean}>}
 */
const dialog = reactive({
  visible: false,
  title: "",
  loading: false,
});

/**
 * Query parameters for device search and pagination
 * @type {UnwrapNestedRefs<{pageNum: number, pageSize: number, keywords: string, location: string}>}
 */
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keywords: "", // Changed from deviceName to keywords to match backend expectation
  location: "",
});

/**
 * Form data for device creation and editing
 * Contains all device properties including geographic coordinates
 * @type {UnwrapNestedRefs<{deviceId: string | undefined, deviceName: string, deviceModel: "WATER_LEVEL_SENSOR" | "OTHER" | undefined, deptId: number, deptName: string, status: "ACTIVE" | "INACTIVE" | undefined, location: string, latitude: number | undefined, longitude: number | undefined}>}
 */
const formData = reactive<{
  deviceId: string | undefined;
  deviceName: string;
  deviceModel: "WATER_LEVEL_SENSOR" | "OTHER" | undefined;
  deviceTypeId: number | undefined;
  deptId: number;
  deptName: string;
  status: "ACTIVE" | "INACTIVE" | undefined;
  location: string;
  latitude: number | undefined;
  longitude: number | undefined;
}>({
  deviceId: undefined,
  deviceName: "",
  deviceModel: undefined,
  deviceTypeId: undefined,
  deptId: 0,
  deptName: "",
  status: undefined,
  location: "",
  latitude: undefined,
  longitude: undefined,
});

/**
 * Device list data array for table display and pagination
 * @type {Ref<DeviceVO[]>}
 */
const pageData = ref<DeviceVO[]>([]);
const deviceTypes = ref<IotDeviceTypeVO[]>([]);

/**
 * Computed property to get the current selected device type name
 * @type {ComputedRef<string>}
 */
const currentDeviceTypeName = computed(() => {
  if (!formData.deviceTypeId) return "未選擇";
  return getDeviceTypeName(formData.deviceTypeId);
});

/**
 * Computed property to generate device type options with proper labels
 * @type {ComputedRef<Array<{label: string, value: number}>>}
 */
const deviceTypeOptions = computed(() => {
  return deviceTypes.value.map((deviceType) => ({
    label: deviceType.name || `Device Type ${deviceType.id}`,
    value: typeof deviceType.id === "string" ? parseInt(deviceType.id, 10) : deviceType.id!,
  }));
});

/**
 * User store instance for accessing user information and authentication state
 * @type {ReturnType<typeof useUserStoreHook>}
 */
const userStore = useUserStoreHook();

/**
 * Form references for validation and form manipulation
 */

/**
 * Reference to the search form for query operations
 * @type {Ref<any>}
 */
const queryFormRef = ref();

/**
 * Reference to the device form for validation and submission
 * @type {Ref<any>}
 */
const formRef = ref();

/**
 * Fetches device data from the API with current query parameters
 * Handles loading states, error handling, and data transformation
 * Automatically includes department ID from user profile for data filtering
 *
 * @async
 * @function fetchData
 * @returns {Promise<void>} Promise that resolves when data fetching is complete
 * @throws {Error} Throws error if API call fails, displays user-friendly error message
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

    console.log("Fetching devices with params:", params);

    const data = await DeviceAPI.listDevices(params);
    console.log("🔍 Raw API response data:", data);
    console.log(
      "📊 First device sample:",
      data?.[0]
        ? {
            deviceId: data[0].deviceId,
            deviceName: data[0].deviceName,
            deviceModel: data[0].deviceModel,
            deviceType: data[0].deviceType,
            hasDeviceType: Object.prototype.hasOwnProperty.call(data[0], "deviceType"),
            allKeys: Object.keys(data[0]),
          }
        : "No devices returned"
    );

    pageData.value = data || [];
    total.value = data?.length || 0;
  } catch (error) {
    console.error("獲取數據失敗:", error);
    ElMessage.error(t("device.errors.fetchDataFailed"));
  } finally {
    loading.value = false;
  }
}

/**
 * Load device types for the user's department
 */
async function loadDeviceTypes() {
  try {
    const profile = await UserAPI.getProfile();
    const deptId = profile.deptId ? Number(profile.deptId) : undefined;

    if (deptId) {
      console.log("🔍 Loading device types for department:", deptId);
      const types = await DeviceTypeAPI.getActiveDeviceTypesByDepartment(deptId);
      deviceTypes.value = types || [];
      console.log("✅ Loaded device types:", deviceTypes.value);
      console.log(
        "📋 Device types structure:",
        deviceTypes.value.map((type) => ({
          id: type.id,
          name: type.name,
        }))
      );
      console.log(
        "🔍 Detailed device types:",
        deviceTypes.value.map((type) => ({
          id: type.id,
          name: type.name,
          description: type.description,
          fullObject: type,
        }))
      );
    } else {
      console.warn("⚠️ No department ID found for loading device types");
    }
  } catch (error) {
    console.error("❌ Failed to load device types:", error);
    deviceTypes.value = [];
  }
}

/**
 * Returns the device type name for a given device type ID
 * Looks up the device type name from the loaded device types array
 *
 * @function getDeviceTypeName
 * @param {number} deviceTypeId - The device type ID to look up
 * @returns {string} The device type name, or a fallback string if not found
 */
function getDeviceTypeName(deviceTypeId: number): string {
  console.log(
    "🔍 getDeviceTypeName called with deviceTypeId:",
    deviceTypeId,
    "type:",
    typeof deviceTypeId
  );
  console.log("  deviceTypes.value length:", deviceTypes.value.length);
  console.log("  deviceTypes.value:", deviceTypes.value);

  // 詳細檢查每個設備類型的 ID
  deviceTypes.value.forEach((type, index) => {
    console.log(`  Type ${index}: id=${type.id} (type: ${typeof type.id}), name=${type.name}`);
    console.log(
      `    Comparison: type.id === deviceTypeId -> ${type.id} === ${deviceTypeId} -> ${type.id === deviceTypeId}`
    );
  });

  // 使用更靈活的比較方式，處理數字和字符串類型不匹配的問題
  const deviceType = deviceTypes.value.find((type) => {
    // 嘗試多種比較方式
    const typeId = type.id;
    const searchId = deviceTypeId;

    // 直接比較
    if (typeId === searchId) return true;

    // 字符串和數字互轉比較
    if (typeof typeId === "string" && typeof searchId === "number") {
      return typeId === searchId.toString();
    }
    if (typeof typeId === "number" && typeof searchId === "string") {
      return typeId.toString() === searchId;
    }

    return false;
  });
  console.log("  Found deviceType:", deviceType);

  const result = deviceType?.name || `Device Type ${deviceTypeId}`;
  console.log("  Returning result:", result);

  return result;
}

/**
 * Handles device type selection change for debugging
 * @function onDeviceTypeChange
 * @param {number} value - The selected device type ID
 */
function onDeviceTypeChange(value: number) {
  console.log("🔄 Device type changed to:", value);
  console.log("  Selected device type name:", getDeviceTypeName(value));
  console.log("  Current formData.deviceTypeId:", formData.deviceTypeId);
}

/**
 * Handles dropdown visibility change for debugging
 * @function onDropdownVisibleChange
 * @param {boolean} visible - Whether dropdown is visible
 */
function onDropdownVisibleChange(visible: boolean) {
  console.log("📂 Dropdown visibility changed:", visible);
  if (visible) {
    console.log("  Current deviceTypes:", deviceTypes.value);
    console.log("  Current formData.deviceTypeId:", formData.deviceTypeId);
    console.log("  Current selected name:", getDeviceTypeName(formData.deviceTypeId || 0));
  }
}

/**
 * Handles search query execution
 * Resets pagination to first page and fetches data with current search parameters
 *
 * @function handleQuery
 * @returns {void}
 */
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * Handles search form reset
 * Clears all search fields, resets pagination, and refreshes data
 *
 * @function handleResetQuery
 * @returns {void}
 */
function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  queryParams.keywords = ""; // Changed from deviceName to keywords
  queryParams.location = "";
  fetchData();
}

/**
 * Handles add device button click
 * Opens the device creation dialog with reset form and appropriate title
 *
 * @async
 * @function handleAddClick
 * @returns {Promise<void>} Promise that resolves when dialog is opened
 */
async function handleAddClick() {
  dialog.title = t("device.deviceForm.title.add");
  await resetForm();
  await loadDeviceTypes();
  dialog.visible = true;
}

/**
 * Handles edit device button click
 * Populates form with selected device data and opens edit dialog
 *
 * @async
 * @function handleEditClick
 * @param {DeviceVO} row - The device data to edit
 * @returns {Promise<void>} Promise that resolves when dialog is opened
 */
async function handleEditClick(row: DeviceVO) {
  console.log("📝 Starting handleEditClick for device:", row.deviceId);
  console.log("  Device data:", {
    deviceId: row.deviceId,
    deviceName: row.deviceName,
    deviceModel: row.deviceModel,
    deviceTypeId: row.deviceTypeId, // API returns deviceTypeId, not deviceType
    allKeys: Object.keys(row),
  });

  dialog.title = t("device.deviceForm.title.edit");
  // 過濾掉不需要的字段並直接使用 deviceModel 和 deviceTypeId
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { lastSeen, createdAt, deviceModel, deviceTypeId, ...editData } = row;
  Object.assign(formData, editData);
  // 直接將 API 的 deviceModel 賦值給表單的 deviceModel 字段
  formData.deviceModel = deviceModel as "WATER_LEVEL_SENSOR" | "OTHER";
  console.log("  Set deviceModel:", formData.deviceModel);

  // 直接使用 API 返回的 deviceTypeId（字符串），轉換為數字
  console.log("  About to load device types and set deviceTypeId...");
  await loadDeviceTypes();

  // Convert string deviceTypeId to number for form binding
  if (deviceTypeId) {
    const numericId = parseInt(deviceTypeId.toString(), 10);
    formData.deviceTypeId = numericId;
    console.log(
      "  Set deviceTypeId from API:",
      formData.deviceTypeId,
      typeof formData.deviceTypeId
    );
    console.log("  Device type name for this ID:", getDeviceTypeName(formData.deviceTypeId));

    // 確保 deviceTypes 中有對應的選項
    const matchingType = deviceTypes.value.find((type) => type.id === numericId);
    console.log("  Matching device type in array:", matchingType);
    if (!matchingType) {
      console.warn("⚠️ No matching device type found for ID:", numericId);
      console.log(
        "  Available device types:",
        deviceTypes.value.map((t) => ({ id: t.id, type: typeof t.id }))
      );
    }
  } else {
    console.warn("⚠️ No deviceTypeId in API response, setting to undefined");
    formData.deviceTypeId = undefined;
  }

  console.log("  Final deviceTypeId set to:", formData.deviceTypeId, typeof formData.deviceTypeId);
  console.log("  Final device type name:", getDeviceTypeName(formData.deviceTypeId || 0));

  // 使用 nextTick 確保數據更新完成
  await nextTick();
  console.log("  After nextTick - formData.deviceTypeId:", formData.deviceTypeId);
  console.log(
    "  After nextTick - current device type name:",
    getDeviceTypeName(formData.deviceTypeId || 0)
  );

  dialog.visible = true;
  console.log("✅ Edit dialog opened");
}

/**
 * Handles device detail button click - retrieves and displays EMQX configuration
 * Fetches EMQX MQTT broker configuration for the selected device and displays
 * connection details in a modal dialog. Handles different API response formats.
 *
 * @async
 * @function handleDetailClick
 * @param {DeviceVO} row - The device data containing deviceId for EMQX config lookup
 * @returns {Promise<void>} Promise that resolves when EMQX config is displayed or error is handled
 * @throws {Error} Throws error if EMQX config retrieval fails, displays user-friendly error message
 */
async function handleDetailClick(row: DeviceVO) {
  try {
    console.log("開始獲取設備EMQX配置，設備ID:", row.deviceId);
    const response: any = await DeviceAPI.getDeviceEmqxConfig(row.deviceId);
    console.log("EMQX配置API原始響應:", response);
    console.log("EMQX配置類型:", typeof response);

    // 檢查響應結構 - 直接檢查是否包含data屬性
    if (!response || typeof response !== "object") {
      throw new Error(t("device.emqx.invalidResponse"));
    }

    // 如果響應直接是data對象（被攔截器處理過）
    if (response.deviceId && response.emqxUsername) {
      console.log("響應是直接的data對象");
      // 顯示EMQX配置詳情
      ElMessageBox.alert(
        `<div>
          <h4>${t("device.emqx.configTitle")}</h4>
          <p><strong>${t("device.emqx.deviceId")}:</strong> ${response.deviceId}</p>
          <p><strong>${t("device.emqx.mqttClientId")}:</strong> ${response.mqttClientId}</p>
          <p><strong>${t("device.emqx.emqxUsername")}:</strong> ${response.emqxUsername}</p>
          <p><strong>${t("device.emqx.emqxPassword")}:</strong> ${response.emqxPassword}</p>
          <p><strong>${t("device.emqx.telemetryTopic")}:</strong> ${response.telemetryTopic}</p>
          <p><strong>${t("device.emqx.commandTopic")}:</strong> ${response.commandTopic}</p>
        </div>`,
        t("device.emqx.modalTitle"),
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: t("common.confirm"),
          type: "info",
        }
      );
    }
    // 如果響應包含data屬性（原始API響應）
    else if (response.data) {
      console.log("響應包含data屬性");
      // 檢查是否有錯誤代碼
      if (response.code && response.code !== "00000") {
        throw new Error(`API錯誤: ${response.msg || "未知錯誤"}`);
      }

      // 顯示EMQX配置詳情
      ElMessageBox.alert(
        `<div>
          <h4>${t("device.emqx.configTitle")}</h4>
          <p><strong>${t("device.emqx.deviceId")}:</strong> ${response.data.deviceId}</p>
          <p><strong>${t("device.emqx.mqttClientId")}:</strong> ${response.data.mqttClientId}</p>
          <p><strong>${t("device.emqx.emqxUsername")}:</strong> ${response.data.emqxUsername}</p>
          <p><strong>${t("device.emqx.emqxPassword")}:</strong> ${response.data.emqxPassword}</p>
          <p><strong>${t("device.emqx.telemetryTopic")}:</strong> ${response.data.telemetryTopic}</p>
          <p><strong>${t("device.emqx.commandTopic")}:</strong> ${response.data.commandTopic}</p>
        </div>`,
        t("device.emqx.modalTitle"),
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: t("common.confirm"),
          type: "info",
        }
      );
    } else {
      console.error("無法識別的響應結構:", response);
      throw new Error(t("device.emqx.unrecognizedFormat"));
    }
  } catch (error) {
    console.error("獲取EMQX配置失敗:", error);
    const errorMessage = error instanceof Error ? error.message : t("device.emqx.unknownError");
    ElMessage.error(`${t("device.emqx.getConfigError")}: ${errorMessage}`);
  }
}

/**
 * Handles device deletion with confirmation dialog
 * First attempts to delete EMQX configuration, then deletes the device itself.
 * Shows confirmation dialog and handles partial deletion scenarios gracefully.
 *
 * @async
 * @function handleDelete
 * @param {DeviceVO} row - The device data to delete
 * @returns {Promise<void>} Promise that resolves when deletion is complete or cancelled
 * @throws {Error} Throws error if device deletion fails (EMQX deletion failure is handled gracefully)
 */
async function handleDelete(row: DeviceVO) {
  try {
    await ElMessageBox.confirm(
      t("device.deleteDialog.confirmMessage"),
      t("device.deleteDialog.title"),
      {
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
        type: "warning",
      }
    );

    // 先刪除 EMQX 配置
    try {
      console.log("開始刪除 EMQX 配置，設備ID:", row.deviceId);
      await DeviceAPI.deleteDeviceEmqxConfig(row.deviceId);
      console.log("EMQX 配置刪除成功");
    } catch (emqxError) {
      console.error("EMQX 配置刪除失敗:", emqxError);
      ElMessage.warning(t("device.emqx.deleteConfigWarning"));
      // 不阻擋設備刪除，但提示用戶 EMQX 配置刪除失敗
    }

    // 再刪除設備
    await DeviceAPI.deleteDevices(row.deviceId);

    ElMessage.success(t("device.deleteSuccess"));
    fetchData();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("刪除失敗:", error);
      ElMessage.error(t("device.errors.deleteFailed"));
    }
  }
}

/**
 * Handles form submission for device creation and updates
 * Validates form data, prepares submission payload, and calls appropriate API
 * based on whether it's a new device creation or existing device update.
 *
 * @async
 * @function handleSubmit
 * @returns {Promise<void>} Promise that resolves when form submission is complete
 * @throws {Error} Throws error if form validation or API call fails
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

    // Prepare form data with correct types
    const submitData: any = {
      deviceName: formData.deviceName,
      deviceModel: formData.deviceModel!, // 表單驗證確保不會為 undefined
      deviceTypeId: formData.deviceTypeId?.toString(), // 直接使用 deviceTypeId，轉換為字符串發送給後端
      deptId,
      location: formData.location,
      latitude: formData.latitude,
      longitude: formData.longitude,
      status: formData.status!, // 表單驗證確保不會為 undefined
    };

    console.log("📤 Submitting device data:");
    console.log("  Form deviceTypeId:", formData.deviceTypeId);
    console.log("  Submit deviceTypeId:", submitData.deviceTypeId);
    console.log("  Complete submitData:", submitData);

    if (formData.deviceId) {
      // Update
      submitData.deviceId = formData.deviceId;
      await DeviceAPI.updateDevice(formData.deviceId, submitData);
      ElMessage.success(t("device.updateSuccess"));
    } else {
      // Create
      await DeviceAPI.addDevice(submitData);
      ElMessage.success(t("device.addSuccess"));
    }

    handleCloseDialog();
    fetchData();
  } catch (error) {
    console.error("保存失敗:", error);
    ElMessage.error(t("device.errors.saveFailed"));
  } finally {
    dialog.loading = false;
  }
}

/**
 * Handles dialog close event
 * Closes the form dialog and resets the form to initial state
 *
 * @async
 * @function handleCloseDialog
 * @returns {Promise<void>} Promise that resolves when dialog is closed and form is reset
 */
async function handleCloseDialog() {
  dialog.visible = false;
  await resetForm();
}

/**
 * Resets the device form to initial state
 * Fetches current user profile to populate department information
 * and resets all form fields to default values
 *
 * @async
 * @function resetForm
 * @returns {Promise<void>} Promise that resolves when form reset is complete
 */
async function resetForm() {
  let deptId = 0;
  let deptName = "";

  try {
    const profile = await UserAPI.getProfile();
    deptId = profile.deptId ? parseInt(profile.deptId) : 0;
    deptName = profile.deptName || "";
    console.log(
      "從 API 獲取的用戶個人資料 deptId:",
      deptId,
      "deptName:",
      deptName,
      "完整資料:",
      profile
    );
  } catch (error) {
    console.error("獲取用戶個人資料失敗:", error);
    // 如果 API 調用失敗，使用預設值
    deptId = 0;
    deptName = "";
  }

  Object.assign(formData, {
    deviceId: undefined,
    deviceName: "",
    deviceModel: undefined,
    deviceTypeId: undefined,
    deptId,
    deptName,
    status: undefined,
    location: "",
    latitude: undefined,
    longitude: undefined,
  });
  formRef.value?.resetFields();
}

/**
 * Utility functions for data formatting and display
 */

/**
 * Returns the appropriate Element Plus tag type for device status display
 * Maps device status values to corresponding tag colors for UI consistency
 *
 * @function getStatusTagType
 * @param {string} status - The device status string ("ACTIVE" or "INACTIVE")
 * @returns {"success" | "warning" | "danger" | "info" | "primary"} The tag type for Element Plus ElTag component
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
 * Returns the localized text for device status
 * Translates status enum values to user-friendly display text
 *
 * @function getStatusText
 * @param {string} status - The device status string ("ACTIVE" or "INACTIVE")
 * @returns {string} The localized status text for display
 */
function getStatusText(status: string): string {
  switch (status) {
    case "ACTIVE":
      return t("device.active");
    case "INACTIVE":
      return t("device.inactive");
    default:
      return status;
  }
}

/**
 * Returns the localized text for device model/type
 * Translates device model enum values to user-friendly display names
 *
 * @function getDeviceModelText
 * @param {string} deviceModel - The device model string ("WATER_LEVEL_SENSOR" or "OTHER")
 * @returns {string} The localized device model text for display
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
 * Component lifecycle hook - executed when component is mounted
 * Initializes user information and form data, then fetches initial device data
 * Ensures user authentication state is loaded before data operations
 *
 * @function onMounted
 * @returns {Promise<void>} Promise that resolves when initialization is complete
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

  // 初始化 formData 的 deptId 和 deptName
  try {
    const profile = await UserAPI.getProfile();
    formData.deptId = profile.deptId ? parseInt(profile.deptId) : 0;
    formData.deptName = profile.deptName || "";
    console.log(
      "初始化時從 API 獲取的用戶個人資料 deptId:",
      formData.deptId,
      "deptName:",
      formData.deptName,
      "完整資料:",
      profile
    );
  } catch (error) {
    console.error("初始化時獲取用戶個人資料失敗:", error);
    formData.deptId = 0;
    formData.deptName = "";
  }

  // 同時加載設備類型和設備數據，確保表格能正確顯示設備類型名稱
  await loadDeviceTypes();
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
</style>
