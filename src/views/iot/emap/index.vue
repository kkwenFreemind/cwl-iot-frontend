<template>
  <div class="emap-container">
    <!-- 搜尋區域 -->
    <!-- <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" :label="$t('device.deviceName')">
       // 創建地圖實例
    mapInstance.value = L.map(mapContainer.value, {
      center: [centerLat, centerLng],
      zoom: 5, // 進一步縮小初始縮放等級以查看更大區域
      zoomControl: false, // 禁用默認縮放控制
    }); <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('device.deviceNamePlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item prop="status" :label="$t('device.status')">
          <el-select
            v-model="queryParams.status"
            :placeholder="$t('device.deviceForm.statusPlaceholder')"
            clearable
          >
            <el-option :label="$t('device.active')" value="ACTIVE" />
            <el-option :label="$t('device.inactive')" value="INACTIVE" />
          </el-select>
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">
            {{ $t("device.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">
            {{ $t("device.reset") }}
          </el-button>
          <el-button type="info" icon="location" @click="centerMapOnDevices">
            {{ $t("emap.centerOnDevices") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div> -->

    <!-- 全螢幕地圖容器 -->
    <div ref="mapContainer" class="leaflet-map-container"></div>

    <!-- 地圖控制面板 -->
    <div class="map-controls">
      <el-button-group>
        <el-button type="primary" size="small" icon="plus" @click="zoomIn">
          {{ $t("emap.zoomIn") }}
        </el-button>
        <el-button type="primary" size="small" icon="minus" @click="zoomOut">
          {{ $t("emap.zoomOut") }}
        </el-button>
        <el-button type="info" size="small" icon="location" @click="locateUser">
          {{ $t("emap.myLocation") }}
        </el-button>
      </el-button-group>

      <div class="device-legend">
        <div class="legend-item">
          <div class="legend-marker active"></div>
          <span>{{ $t("device.active") }}</span>
        </div>
        <div class="legend-item">
          <div class="legend-marker inactive"></div>
          <span>{{ $t("device.inactive") }}</span>
        </div>
      </div>
    </div>

    <!-- 設備詳情抽屜 -->
    <el-drawer
      v-model="deviceDrawer.visible"
      :title="deviceDrawer.title"
      append-to-body
      size="500px"
      @close="closeDeviceDrawer"
    >
      <div v-if="selectedDevice" class="device-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item :label="$t('device.deviceName')">
            {{ selectedDevice.deviceName }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.deviceId')">
            {{ selectedDevice.deviceId }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.deviceModel')">
            {{ getDeviceModelText(selectedDevice.deviceModel) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.status')">
            <el-tag :type="getStatusTagType(selectedDevice.status)">
              {{ getStatusText(selectedDevice.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.location')">
            {{ selectedDevice.location }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.deviceForm.latitude')">
            {{ selectedDevice.latitude }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.deviceForm.longitude')">
            {{ selectedDevice.longitude }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('device.createTime')">
            {{ selectedDevice.createdAt }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="device-actions">
          <el-button type="primary" icon="edit" @click="editDevice(selectedDevice)">
            {{ $t("device.edit") }}
          </el-button>
          <el-button type="info" icon="view" @click="viewDeviceEmqx(selectedDevice)">
            {{ $t("device.detail") }}
          </el-button>
          <el-button type="danger" icon="delete" @click="deleteDevice(selectedDevice)">
            {{ $t("device.delete") }}
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useUserStoreHook } from "@/store/modules/user-store";
import DeviceAPI, { DeviceVO } from "@/api/iot/device-api";
import UserAPI from "@/api/system/user-api";
import DeptAPI from "@/api/system/dept-api";
import { useI18n } from "vue-i18n";

defineOptions({
  name: "ElectronicMap",
  inheritAttrs: false,
});

/**
 * i18n 實例
 */
const { t } = useI18n();

/**
 * 響應式狀態
 */
const loading = ref(false);
const mapContainer = ref<HTMLElement>();
const mapInstance = ref<L.Map>();
const deviceMarkers = ref<L.Marker[]>([]);
const selectedDevice = ref<DeviceVO | null>(null);

const queryParams = reactive({
  keywords: "",
  status: "",
});

const deviceDrawer = reactive({
  visible: false,
  title: "",
});

/**
 * 用戶 store
 */
const userStore = useUserStoreHook();

/**
 * 表單引用
 */
// const queryFormRef = ref();

/**
 * 計算屬性
 */
// const mapHeight = computed(() => {
//   return window.innerHeight - 280 + "px";
// });

/**
 * 數據獲取
 */
async function fetchDevices() {
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

    console.log("Fetching devices for map:", params);

    const devices = await DeviceAPI.listDevices(params);
    updateMapMarkers(devices || []);
  } catch (error) {
    console.error("獲取設備數據失敗:", error);
    ElMessage.error(t("device.errors.fetchDataFailed"));
  } finally {
    loading.value = false;
  }
}

/**
 * 初始化地圖
 */
async function initMap() {
  if (!mapContainer.value) return;

  try {
    // 獲取用戶個人資料以獲取部門ID
    const profile = await UserAPI.getProfile();
    const deptId = profile.deptId;

    // 獲取部門資訊以設置地圖中心點
    let centerLat = 25.033; // 預設中心點 (台北)
    let centerLng = 121.5654;

    if (deptId) {
      try {
        const deptData = await DeptAPI.getFormData(deptId);
        if (deptData.centerLatitude && deptData.centerLongitude) {
          centerLat = deptData.centerLatitude;
          centerLng = deptData.centerLongitude;
          console.log(`使用部門中心點座標: [${centerLat}, ${centerLng}]`);
        }
      } catch (error) {
        console.warn("獲取部門資訊失敗，使用預設中心點:", error);
      }
    }

    // 創建地圖實例
    mapInstance.value = L.map(mapContainer.value, {
      center: [centerLat, centerLng],
      zoom: 6, // 縮小初始縮放等級
      zoomControl: false, // 禁用默認縮放控制
    });

    // 添加 OpenStreetMap 圖層
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstance.value);

    // 添加縮放控制
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(mapInstance.value);

    // 載入設備數據
    fetchDevices();
  } catch (error) {
    console.error("初始化地圖失敗:", error);
    ElMessage.error(t("emap.initMapFailed"));
  }
}

/**
 * 更新地圖標記
 */
function updateMapMarkers(devices: DeviceVO[]) {
  if (!mapInstance.value) return;

  // 清除現有標記
  deviceMarkers.value.forEach((marker) => {
    mapInstance.value!.removeLayer(marker as unknown as L.Layer);
  });
  deviceMarkers.value = [];

  // 創建新標記
  devices.forEach((device) => {
    if (device.latitude && device.longitude) {
      const marker = createDeviceMarker(device);
      deviceMarkers.value.push(marker);
      marker.addTo(mapInstance.value!);
    }
  });

  // 如果有設備，調整地圖視圖以顯示所有設備
  if (devices.length > 0 && deviceMarkers.value.length > 0) {
    centerMapOnDevices();
  }
}

/**
 * 創建設備標記
 */
function createDeviceMarker(device: DeviceVO): L.Marker {
  // 根據設備狀態選擇圖標顏色
  const iconColor = device.status === "ACTIVE" ? "#67C23A" : "#F56C6C";

  // 自定義圖標
  const customIcon = L.divIcon({
    className: "custom-device-marker",
    html: `
      <div style="
        background-color: ${iconColor};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">
        📍
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const marker = L.marker([device.latitude!, device.longitude!], {
    icon: customIcon,
  });

  // 添加彈出窗口
  marker.bindPopup(createDevicePopupContent(device));

  // 添加點擊事件
  marker.on("click", () => {
    showDeviceDetail(device);
  });

  return marker;
}

/**
 * 創建設備彈出窗口內容
 */
function createDevicePopupContent(device: DeviceVO): string {
  return `
    <div style="min-width: 200px;">
      <h4 style="margin: 0 0 8px 0; color: #409EFF;">${device.deviceName}</h4>
      <p style="margin: 4px 0;"><strong>${t("device.deviceId")}:</strong> ${device.deviceId}</p>
      <p style="margin: 4px 0;"><strong>${t("device.deviceModel")}:</strong> ${getDeviceModelText(device.deviceModel)}</p>
      <p style="margin: 4px 0;"><strong>${t("device.status")}:</strong>
        <span style="color: ${device.status === "ACTIVE" ? "#67C23A" : "#F56C6C"}; font-weight: bold;">
          ${getStatusText(device.status)}
        </span>
      </p>
      <p style="margin: 4px 0;"><strong>${t("device.location")}:</strong> ${device.location}</p>
      <div style="margin-top: 8px;">
        <button onclick="window.showDeviceDetail('${device.deviceId}')" style="
          background: #409EFF;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">
          ${t("device.detail")}
        </button>
      </div>
    </div>
  `;
}

/**
 * 顯示設備詳情
 */
function showDeviceDetail(device: DeviceVO) {
  selectedDevice.value = device;
  deviceDrawer.title = `${t("device.deviceDetail")}: ${device.deviceName}`;
  deviceDrawer.visible = true;
}

/**
 * 關閉設備詳情抽屜
 */
function closeDeviceDrawer() {
  deviceDrawer.visible = false;
  selectedDevice.value = null;
}

/**
 * 編輯設備
 */
function editDevice(device: DeviceVO) {
  // 這裡可以導航到設備編輯頁面或打開編輯模態框
  ElMessage.info(`${t("device.edit")}: ${device.deviceName}`);
}

/**
 * 查看設備EMQX配置
 */
async function viewDeviceEmqx(device: DeviceVO) {
  try {
    const response: any = await DeviceAPI.getDeviceEmqxConfig(device.deviceId);

    if (response.deviceId && response.emqxUsername) {
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
    } else if (response.data) {
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
    }
  } catch (error) {
    console.error("獲取EMQX配置失敗:", error);
    ElMessage.error(t("device.emqx.getConfigError"));
  }
}

/**
 * 刪除設備
 */
async function deleteDevice(device: DeviceVO) {
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
      await DeviceAPI.deleteDeviceEmqxConfig(device.deviceId);
    } catch {
      ElMessage.warning(t("device.emqx.deleteConfigWarning"));
    }

    // 再刪除設備
    await DeviceAPI.deleteDevices(device.deviceId);

    ElMessage.success(t("device.deleteSuccess"));
    fetchDevices(); // 重新載入地圖數據
    closeDeviceDrawer();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(t("device.errors.deleteFailed"));
    }
  }
}

/**
 * 搜尋處理
 */
// function handleQuery() {
//   fetchDevices();
// }

/**
 * 重置搜尋
 */
// function handleResetQuery() {
//   queryFormRef.value?.resetFields();
//   queryParams.keywords = "";
//   queryParams.status = "";
//   fetchDevices();
// }

/**
 * 放大地圖
 */
function zoomIn() {
  if (mapInstance.value) {
    mapInstance.value.zoomIn();
  }
}

/**
 * 縮小地圖
 */
function zoomOut() {
  if (mapInstance.value) {
    mapInstance.value.zoomOut();
  }
}

/**
 * 定位用戶位置
 */
function locateUser() {
  if (navigator.geolocation && mapInstance.value) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapInstance.value!.setView([latitude, longitude], 15);
        ElMessage.success(t("emap.locationSuccess"));
      },
      (error) => {
        console.error("獲取位置失敗:", error);
        ElMessage.warning(t("emap.locationFailed"));
      }
    );
  } else {
    ElMessage.warning(t("emap.geolocationNotSupported"));
  }
}

/**
 * 將地圖中心定位到設備位置
 */
function centerMapOnDevices() {
  if (!mapInstance.value || deviceMarkers.value.length === 0) return;

  // 創建包含所有標記的邊界
  const group = L.featureGroup(deviceMarkers.value as unknown as L.Layer[]);
  mapInstance.value.fitBounds(group.getBounds().pad(0.1));
}

/**
 * 工具函數
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
 * 組件掛載時初始化
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

  // 等待DOM更新後初始化地圖
  await nextTick();
  initMap();

  // 監聽窗口大小變化
  window.addEventListener("resize", handleResize);
});

/**
 * 組件卸載時清理
 */
onUnmounted(() => {
  if (mapInstance.value) {
    mapInstance.value.remove();
    mapInstance.value = undefined;
  }
  window.removeEventListener("resize", handleResize);
});

/**
 * 處理窗口大小變化
 */
function handleResize() {
  if (mapInstance.value) {
    mapInstance.value.invalidateSize();
  }
}

// 全局函數供彈出窗口使用
(window as any).showDeviceDetail = () => {
  // 簡化實現，實際應該實現設備查找邏輯
  ElMessage.info(t("device.detail"));
};
</script>

<style lang="scss" scoped>
.emap-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 84px); // 減去頂部導航欄的高度
  padding: 0;
  margin: 0;

  .leaflet-map-container {
    width: 100%;
    height: 100%;
    border-radius: 0;
    box-shadow: none;
  }

  .map-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .device-legend {
      padding: 12px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);

      .legend-item {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 6px;

        &:last-child {
          margin-bottom: 0;
        }

        .legend-marker {
          width: 14px;
          height: 14px;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

          &.active {
            background-color: #67c23a;
          }

          &.inactive {
            background-color: #f56c6c;
          }
        }

        span {
          font-size: 13px;
          font-weight: 500;
          color: #303133;
        }
      }
    }
  }
}

// 覆蓋全局樣式，確保地圖容器填滿整個內容區域
:deep(.app-main) {
  padding: 0 !important;
}

:deep(.app-container) {
  height: 100%;
  padding: 0 !important;
  margin: 0 !important;
}

.device-detail {
  .device-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 20px;
  }
}

// Leaflet 自定義樣式
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-popup-tip) {
  background-color: white;
}

:deep(.custom-device-marker) {
  background: none !important;
  border: none !important;
}
</style>
