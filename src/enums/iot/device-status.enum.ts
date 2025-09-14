/**
 * IoT Device Status Enum
 * IoT設備狀態列舉
 *
 * This enum defines the possible status values for IoT devices
 * that match the backend DeviceStatus enum constants.
 */
export const enum DeviceStatusEnum {
  /**
   * Device is active and operational
   * 設備處於活躍運行狀態
   */
  ACTIVE = "ACTIVE",

  /**
   * Device is inactive or offline
   * 設備處於離線狀態
   */
  INACTIVE = "INACTIVE",

  /**
   * Device is disabled
   * 設備已被停用
   */
  DISABLED = "DISABLED",
}

/**
 * Device Status Options for UI components
 * 用於UI組件的設備狀態選項
 */
export const DEVICE_STATUS_OPTIONS = [
  { label: "device.active", value: DeviceStatusEnum.ACTIVE },
  { label: "device.inactive", value: DeviceStatusEnum.INACTIVE },
  { label: "device.disabled", value: DeviceStatusEnum.DISABLED },
] as const;
