/**
 * Device Management API
 * 設備管理 API
 *
 * @author Chang Xiu-Wen, AI-Enhanced
 * @since 2025/09/14
 */

import request from "@/utils/request";

const DEVICE_BASE_URL = "/api/v1/devices";

/**
 * Device Status Enum
 * 設備狀態枚舉
 */
export enum DeviceStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISABLED = "disabled",
}

/**
 * Device Page Query Parameters
 * 設備分頁查詢參數
 */
export interface DevicePageQuery {
  pageNum: number;
  pageSize: number;
  keywords?: string;
  status?: DeviceStatus;
  deptId?: number;
  model?: string;
  location?: string;
  createTime?: [string, string];
  // Spatial query parameters
  centerLat?: number;
  centerLng?: number;
  radiusKm?: number;
}

/**
 * Device Form Data
 * 設備表單數據
 */
export interface DeviceForm {
  id?: string;
  deviceName: string;
  deviceModel: string;
  serialNumber: string;
  description?: string;
  status: DeviceStatus;
  deptId: number;
  location: string;
  latitude?: number;
  longitude?: number;
  installDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  firmwareVersion?: string;
  hardwareVersion?: string;
  manufacturer?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  specifications?: Record<string, any>;
}

/**
 * Device View Object
 * 設備視圖對象
 */
export interface DeviceVO {
  id: string;
  deviceName: string;
  deviceModel: string;
  serialNumber: string;
  description?: string;
  status: DeviceStatus;
  statusText: string;
  deptId: number;
  deptName: string;
  location: string;
  latitude?: number;
  longitude?: number;
  installDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  firmwareVersion?: string;
  hardwareVersion?: string;
  manufacturer?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  lastSeenAt?: string;
  isOnline: boolean;
  createTime: string;
  updateTime?: string;
  specifications?: Record<string, any>;
}

/**
 * Device Statistics
 * 設備統計
 */
export interface DeviceStatsVO {
  totalDevices: number;
  activeDevices: number;
  inactiveDevices: number;
  disabledDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  maintenanceDueDevices: number;
  warrantyExpiringDevices: number;
}

/**
 * Device API Class
 * 設備 API 類
 */
class DeviceAPI {
  /**
   * Get paginated device list
   * 獲取設備分頁列表
   */
  static getPage(params: DevicePageQuery) {
    return request<PageResult<DeviceVO>>({
      url: `${DEVICE_BASE_URL}/page`,
      method: "get",
      params,
    });
  }

  /**
   * Get device form data
   * 獲取設備表單數據
   */
  static getFormData(deviceId: string) {
    return request<DeviceForm>({
      url: `${DEVICE_BASE_URL}/${deviceId}/form`,
      method: "get",
    });
  }

  /**
   * Create new device
   * 創建新設備
   */
  static create(data: DeviceForm) {
    return request({
      url: DEVICE_BASE_URL,
      method: "post",
      data,
    });
  }

  /**
   * Update device
   * 更新設備
   */
  static update(deviceId: string, data: DeviceForm) {
    return request({
      url: `${DEVICE_BASE_URL}/${deviceId}`,
      method: "put",
      data,
    });
  }

  /**
   * Delete devices by IDs
   * 根據ID刪除設備
   */
  static deleteByIds(ids: string) {
    return request({
      url: `${DEVICE_BASE_URL}/${ids}`,
      method: "delete",
    });
  }

  /**
   * Update device status
   * 更新設備狀態
   */
  static updateStatus(deviceId: string, status: DeviceStatus) {
    return request({
      url: `${DEVICE_BASE_URL}/${deviceId}/status`,
      method: "patch",
      params: { status },
    });
  }

  /**
   * Update device heartbeat
   * 更新設備心跳
   */
  static updateHeartbeat(deviceId: string) {
    return request({
      url: `${DEVICE_BASE_URL}/${deviceId}/heartbeat`,
      method: "patch",
    });
  }

  /**
   * Get devices by department
   * 根據部門獲取設備
   */
  static getByDepartment(deptId: number) {
    return request<DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/department/${deptId}`,
      method: "get",
    });
  }

  /**
   * Get devices by status
   * 根據狀態獲取設備
   */
  static getByStatus(status: DeviceStatus) {
    return request<DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/status/${status}`,
      method: "get",
    });
  }

  /**
   * Get online devices
   * 獲取在線設備
   */
  static getOnlineDevices(minutesThreshold: number = 30) {
    return request<DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/online`,
      method: "get",
      params: { minutesThreshold },
    });
  }

  /**
   * Get offline devices in department
   * 獲取部門內離線設備
   */
  static getOfflineDevicesInDept(deptId: number, minutesThreshold: number = 30) {
    return request<DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/department/${deptId}/offline`,
      method: "get",
      params: { minutesThreshold },
    });
  }

  /**
   * Spatial query: devices within radius
   * 空間查詢：半徑內設備
   */
  static getDevicesWithinRadius(centerLat: number, centerLng: number, radiusKm: number) {
    return request<DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/spatial/within-radius`,
      method: "get",
      params: { centerLat, centerLng, radiusKm },
    });
  }

  /**
   * Spatial query: nearest devices
   * 空間查詢：最近設備
   */
  static getNearestDevices(centerLat: number, centerLng: number, limit: number = 10) {
    return request<DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/spatial/nearest`,
      method: "get",
      params: { centerLat, centerLng, limit },
    });
  }

  /**
   * Get device statistics
   * 獲取設備統計
   */
  static getDeviceStats(deptId: number) {
    return request<DeviceStatsVO>({
      url: `${DEVICE_BASE_URL}/department/${deptId}/stats`,
      method: "get",
    });
  }
}

export default DeviceAPI;
