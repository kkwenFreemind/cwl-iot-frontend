import request from "@/utils/request";

const DEVICE_BASE_URL = "/api/v1/devices";

const DeviceAPI = {
  /**
   * 獲取設備列表（不分頁）
   * Get device list (without pagination)
   *
   * @param queryParams 查詢參數
   * @returns 設備列表
   */
  listDevices(queryParams?: DeviceQuery) {
    return request<any, DeviceVO[]>({
      url: `${DEVICE_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 根據部門獲取設備列表
   * Get devices by department
   *
   * @param deptId 部門ID
   * @returns 設備列表
   */
  getDevicesByDepartment(deptId: number) {
    return request<any, DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/department/${deptId}`,
      method: "get",
    });
  },

  /**
   * 根據狀態獲取設備列表
   * Get devices by status
   *
   * @param status 設備狀態
   * @returns 設備列表
   */
  getDevicesByStatus(status: string) {
    return request<any, DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/status/${status}`,
      method: "get",
    });
  },

  /**
   * 新增設備
   * Create new device
   *
   * @param data 設備表單數據
   * @returns 創建結果
   */
  addDevice(data: DeviceForm) {
    return request({
      url: `${DEVICE_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 更新設備
   * Update device
   *
   * @param deviceId 設備ID
   * @param data 設備表單數據
   * @returns 更新結果
   */
  updateDevice(deviceId: string, data: DeviceForm) {
    return request({
      url: `${DEVICE_BASE_URL}/${deviceId}`,
      method: "put",
      data,
    });
  },

  /**
   * 刪除設備
   * Delete devices
   *
   * @param ids 設備ID，多個用逗號分隔
   * @returns 刪除結果
   */
  deleteDevices(ids: string) {
    return request({
      url: `${DEVICE_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 更新設備狀態
   * Update device status
   *
   * @param deviceId 設備ID
   * @param status 新狀態
   * @returns 更新結果
   */
  updateDeviceStatus(deviceId: string, status: string) {
    return request({
      url: `${DEVICE_BASE_URL}/${deviceId}/status`,
      method: "patch",
      params: { status },
    });
  },

  /**
   * 更新設備心跳
   * Update device heartbeat
   *
   * @param deviceId 設備ID
   * @returns 更新結果
   */
  updateDeviceHeartbeat(deviceId: string) {
    return request({
      url: `${DEVICE_BASE_URL}/${deviceId}/heartbeat`,
      method: "patch",
    });
  },

  /**
   * 獲取指定範圍內的設備
   * Get devices within radius
   *
   * @param centerLat 中心緯度
   * @param centerLng 中心經度
   * @param radiusKm 半徑(公里)
   * @returns 設備列表
   */
  getDevicesWithinRadius(centerLat: number, centerLng: number, radiusKm: number) {
    return request<any, DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/spatial/within-radius`,
      method: "get",
      params: { centerLat, centerLng, radiusKm },
    });
  },

  /**
   * 獲取最近的設備
   * Get nearest devices
   *
   * @param centerLat 中心緯度
   * @param centerLng 中心經度
   * @param limit 返回數量限制
   * @returns 設備列表
   */
  getNearestDevices(centerLat: number, centerLng: number, limit = 10) {
    return request<any, DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/spatial/nearest`,
      method: "get",
      params: { centerLat, centerLng, limit },
    });
  },

  /**
   * 獲取設備詳情
   * Get device details
   *
   * @param deviceId 設備ID
   * @returns 設備詳情
   */
  getDevice(deviceId: string) {
    return request<any, DeviceVO>({
      url: `${DEVICE_BASE_URL}/${deviceId}`,
      method: "get",
    });
  },
};

export default DeviceAPI;

// TypeScript 類型定義
export interface DeviceQuery {
  keywords?: string;
  status?: string;
  deptId?: number;
  createTime?: [string, string];
}

export interface DeviceForm {
  deviceId?: string;
  deviceName: string;
  deviceModel: string;
  deptId: string | number;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: string; // Keep status for form functionality
}

export interface DeviceVO {
  deviceId: string;
  deviceName: string;
  deviceModel: string;
  deptId: string | number;
  deptName?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  statusText?: string;
  lastSeen?: string;
  createdAt?: string;
  isOnline?: boolean;
}
