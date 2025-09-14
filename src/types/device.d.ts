declare global {
  namespace Device {
    /**
     * 設備表單數據
     */
    interface DeviceForm {
      id?: number;
      deviceCode: string;
      deviceName: string;
      deviceType: string;
      deviceModel: string;
      manufacturer: string;
      serialNumber: string;
      firmwareVersion: string;
      hardwareVersion: string;
      installDate: string;
      location: string;
      latitude?: number;
      longitude?: number;
      altitude?: number;
      status: number;
      isOnline: number;
      lastHeartbeat?: string;
      configParams?: string;
      description?: string;
    }

    /**
     * 設備查詢條件
     */
    interface DeviceQuery extends PageQuery {
      deviceCode?: string;
      deviceName?: string;
      deviceType?: string;
      manufacturer?: string;
      status?: number;
      isOnline?: number;
      installDateStart?: string;
      installDateEnd?: string;
    }

    /**
     * 設備數據項
     */
    interface DeviceInfo {
      id: number;
      deviceCode: string;
      deviceName: string;
      deviceType: string;
      deviceModel: string;
      manufacturer: string;
      serialNumber: string;
      firmwareVersion: string;
      hardwareVersion: string;
      installDate: string;
      location: string;
      latitude?: number;
      longitude?: number;
      altitude?: number;
      status: number;
      isOnline: number;
      lastHeartbeat?: string;
      configParams?: string;
      description?: string;
      createTime: string;
      updateTime: string;
      createBy?: string;
      updateBy?: string;
    }

    /**
     * 設備統計數據
     */
    interface DeviceStats {
      totalDevices: number;
      onlineDevices: number;
      offlineDevices: number;
      maintenanceDevices: number;
      faultDevices: number;
      newDevicesThisMonth: number;
      avgUptime: number;
      criticalAlerts: number;
    }

    /**
     * 設備狀態分佈
     */
    interface DeviceStatusDistribution {
      status: number;
      statusName: string;
      count: number;
      percentage: number;
    }

    /**
     * 設備類型分佈
     */
    interface DeviceTypeDistribution {
      deviceType: string;
      count: number;
      percentage: number;
    }

    /**
     * 設備地理位置信息
     */
    interface DeviceLocation {
      id: number;
      deviceCode: string;
      deviceName: string;
      latitude: number;
      longitude: number;
      altitude?: number;
      location: string;
      status: number;
      isOnline: number;
    }

    /**
     * 設備配置參數
     */
    interface DeviceConfig {
      deviceId: number;
      configKey: string;
      configValue: string;
      configDesc?: string;
      isRequired: number;
      dataType: string;
      validationRule?: string;
    }

    /**
     * 設備批量導入數據
     */
    interface DeviceBatchImport {
      deviceCode: string;
      deviceName: string;
      deviceType: string;
      deviceModel: string;
      manufacturer: string;
      serialNumber: string;
      location: string;
      latitude?: number;
      longitude?: number;
      description?: string;
    }

    /**
     * 設備批量導入結果
     */
    interface DeviceBatchImportResult {
      total: number;
      success: number;
      failed: number;
      errors: Array<{
        row: number;
        deviceCode: string;
        error: string;
      }>;
    }

    /**
     * 設備狀態選項
     */
    interface DeviceStatusOption {
      value: number;
      label: string;
      color: string;
      icon: string;
    }

    /**
     * 設備類型選項
     */
    interface DeviceTypeOption {
      value: string;
      label: string;
      icon: string;
      description?: string;
    }
  }
}

export {};
