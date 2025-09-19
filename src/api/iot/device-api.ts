/**
 *
 * @author Chang Xiu-Wen, AI-Enhanced
 * @since 2025/09/15
 *
 * Device API Module
 * =================
 *
 * Comprehensive API client for IoT device management operations.
 * Provides RESTful endpoints for CRUD operations, spatial queries,
 * and real-time device monitoring functionality.
 *
 * Features:
 * - Device CRUD operations (Create, Read, Update, Delete)
 * - Advanced filtering by department, status, and keywords
 * - Spatial queries for location-based device discovery
 * - Real-time heartbeat monitoring and connectivity status
 * - Batch operations for efficient data management
 */

import request from "@/utils/request";

/**
 * Base URL for device-related API endpoints
 * Centralizes API path configuration for maintainability
 */
const DEVICE_BASE_URL = "/api/v1/devices";

/**
 * Device API Client Object
 * ========================
 *
 * Collection of HTTP methods for device management operations.
 * Each method corresponds to a specific REST API endpoint with
 * proper TypeScript typing for request/response data.
 */
const DeviceAPI = {
  /**
   * Retrieve paginated list of devices with optional filtering
   * Supports keyword search, status filtering, and department-based queries
   *
   * @param queryParams - Optional query parameters for filtering devices
   * @returns Promise resolving to array of device view objects
   */
  listDevices(queryParams?: DeviceQuery) {
    return request<any, DeviceVO[]>({
      url: `${DEVICE_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * Fetch devices belonging to a specific department
   * Useful for organizational hierarchy-based device management
   *
   * @param deptId - Department identifier for filtering
   * @returns Promise resolving to array of department-specific devices
   */
  getDevicesByDepartment(deptId: number) {
    return request<any, DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/department/${deptId}`,
      method: "get",
    });
  },

  /**
   * Retrieve devices filtered by operational status
   * Enables monitoring of device health and operational state
   *
   * @param status - Device status filter (ACTIVE, INACTIVE, DISABLED)
   * @returns Promise resolving to array of devices with specified status
   */
  getDevicesByStatus(status: string) {
    return request<any, DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/status/${status}`,
      method: "get",
    });
  },

  /**
   * Create a new IoT device in the system
   * Registers device with initial configuration and metadata
   *
   * @param data - Device form data containing device specifications
   * @returns Promise resolving to creation response
   */
  addDevice(data: DeviceForm) {
    return request({
      url: `${DEVICE_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * Update existing device information and configuration
   * Modifies device properties while preserving device identity
   *
   * @param deviceId - Unique identifier of the device to update
   * @param data - Updated device form data
   * @returns Promise resolving to update response
   */
  updateDevice(deviceId: string, data: DeviceForm) {
    return request({
      url: `${DEVICE_BASE_URL}/${deviceId}`,
      method: "put",
      data,
    });
  },

  /**
   * Remove one or multiple devices from the system
   * Supports both single device deletion and bulk operations
   *
   * @param ids - Comma-separated string of device IDs to delete
   * @returns Promise resolving to deletion response
   */
  deleteDevices(ids: string) {
    return request({
      url: `${DEVICE_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * Update device operational status
   * Changes device state (ACTIVE, INACTIVE) for operational control
   *
   * @param deviceId - Unique identifier of the target device
   * @param status - New operational status to apply (ACTIVE or INACTIVE only)
   * @returns Promise resolving to status update response
   */
  updateDeviceStatus(deviceId: string, status: string) {
    return request({
      url: `${DEVICE_BASE_URL}/${deviceId}/status`,
      method: "patch",
      params: { status },
    });
  },

  /**
   * Discover devices within a specified geographic radius
   * Enables location-based device discovery and proximity queries
   *
   * @param centerLat - Latitude of the search center point
   * @param centerLng - Longitude of the search center point
   * @param radiusKm - Search radius in kilometers
   * @returns Promise resolving to array of devices within radius
   */
  getDevicesWithinRadius(centerLat: number, centerLng: number, radiusKm: number) {
    return request<any, DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/spatial/within-radius`,
      method: "get",
      params: { centerLat, centerLng, radiusKm },
    });
  },

  /**
   * Find nearest devices to a geographic point
   * Returns devices sorted by proximity to specified coordinates
   *
   * @param centerLat - Latitude of the reference point
   * @param centerLng - Longitude of the reference point
   * @param limit - Maximum number of devices to return (default: 10)
   * @returns Promise resolving to array of nearest devices
   */
  getNearestDevices(centerLat: number, centerLng: number, limit = 10) {
    return request<any, DeviceVO[]>({
      url: `${DEVICE_BASE_URL}/spatial/nearest`,
      method: "get",
      params: { centerLat, centerLng, limit },
    });
  },

  /**
   * Retrieve detailed information for a specific device
   * Provides comprehensive device data including metadata and status
   *
   * @param deviceId - Unique identifier of the device to retrieve
   * @returns Promise resolving to detailed device information
   */
  getDevice(deviceId: string) {
    return request<any, DeviceVO>({
      url: `${DEVICE_BASE_URL}/${deviceId}`,
      method: "get",
    });
  },

  /**
   * Get EMQX configuration for a specific device
   * Retrieves MQTT broker configuration and connection details
   *
   * @param deviceId - Unique identifier of the device
   * @returns Promise resolving to EMQX device configuration
   */
  getDeviceEmqxConfig(deviceId: string) {
    return request<any, EmqxDeviceConfigVO>({
      url: `${DEVICE_BASE_URL}/${deviceId}/emqx-config`,
      method: "get",
    });
  },

  /**
   * Create EMQX configuration for a specific device
   * Generates MQTT broker account, password, and dedicated topics
   *
   * @param deviceId - Unique identifier of the device
   * @returns Promise resolving to EMQX device configuration
   */
  createDeviceEmqxConfig(deviceId: string) {
    return request<any, EmqxDeviceConfigVO>({
      url: `${DEVICE_BASE_URL}/${deviceId}/emqx-config`,
      method: "post",
    });
  },

  /**
   * Delete EMQX configuration for a specific device
   * Removes MQTT broker account, password, and dedicated topics
   *
   * @param deviceId - Unique identifier of the device
   * @returns Promise resolving to deletion response
   */
  deleteDeviceEmqxConfig(deviceId: string) {
    return request({
      url: `${DEVICE_BASE_URL}/${deviceId}/emqx-config`,
      method: "delete",
    });
  },
};

/**
 * Export the DeviceAPI object as the default export
 * Enables clean import syntax: import DeviceAPI from '@/api/iot/device-api'
 */
export default DeviceAPI;

/**
 * Device Status Enum Values
 * =========================
 *
 * Type-safe status values matching the backend DeviceStatus enum.
 * Only ACTIVE and INACTIVE statuses are supported.
 */
export type DeviceStatus = "ACTIVE" | "INACTIVE";

/**
 * Device Type Enum Values
 * =======================
 *
 * Type-safe device type values matching the backend DeviceTypeEnum.
 * Supports WATER_LEVEL_SENSOR and OTHER device types for IoT device classification.
 */
export type DeviceType = "WATER_LEVEL_SENSOR" | "OTHER";

/**
 * TypeScript Type Definitions
 * ===========================
 *
 * Comprehensive type definitions for device-related data structures.
 * Ensures type safety across the application and provides clear contracts
 * for API interactions and component props.
 */

/**
 * Query parameters interface for device filtering and search
 * Supports multiple filter criteria for flexible device discovery
 */
export interface DeviceQuery {
  /** Optional keyword search across device names and models */
  keywords?: string;
  /** Filter by device operational status (ACTIVE or INACTIVE only) */
  status?: DeviceStatus;
  /** Filter by device type (WATER_LEVEL_SENSOR or OTHER) */
  deviceType?: DeviceType;
  /** Filter by department affiliation */
  deptId?: number;
  /** Date range filter for device creation timestamps */
  createTime?: [string, string];
}

/**
 * Form data interface for device creation and updates
 * Represents the data structure used in device management forms
 */
export interface DeviceForm {
  /** Unique device identifier (optional for new devices) */
  deviceId?: string;
  /** Human-readable device name */
  deviceName: string;
  /** Device model or type specification */
  deviceModel: string;
  /** Device type classification (WATER_LEVEL_SENSOR or OTHER) */
  deviceType?: DeviceType;
  /** Department affiliation identifier */
  deptId: string | number;
  /** Optional geographic location description */
  location?: string;
  /** Optional latitude coordinate for spatial queries */
  latitude?: number;
  /** Optional longitude coordinate for spatial queries */
  longitude?: number;
  /** Operational status (ACTIVE or INACTIVE only) */
  status?: DeviceStatus;
}

/**
 * Device View Object interface for API responses
 * Comprehensive data structure representing device information
 * Used for displaying device details in UI components
 */
export interface DeviceVO {
  /** Unique device identifier (primary key) */
  deviceId: string;
  /** Human-readable device name */
  deviceName: string;
  /** Device model or type specification */
  deviceModel: string;
  /** Device type classification (WATER_LEVEL_SENSOR or OTHER) */
  deviceType?: DeviceType;
  /** Optional localized device type text for UI display */
  deviceTypeText?: string;
  /** Department affiliation identifier */
  deptId: string | number;
  /** Optional department name for display purposes */
  deptName?: string;
  /** Optional geographic location description */
  location?: string;
  /** Optional latitude coordinate */
  latitude?: number;
  /** Optional longitude coordinate */
  longitude?: number;
  /** Current operational status (ACTIVE or INACTIVE only) */
  status: DeviceStatus;
  /** Optional localized status text for UI display */
  statusText?: string;
  /** Optional timestamp of last device communication */
  lastSeen?: string;
  /** Optional device creation timestamp */
  createdAt?: string;
  /** Optional real-time connectivity status indicator */
  isOnline?: boolean;
}

/**
 * EMQX Device Configuration View Object
 * Represents EMQX MQTT broker configuration for a device
 */
export interface EmqxDeviceConfigVO {
  /** Response code */
  code: string;
  /** Response message */
  msg: string;
  /** Actual EMQX configuration data */
  data: {
    /** Unique device identifier */
    deviceId: string;
    /** EMQX username for authentication */
    emqxUsername: string;
    /** EMQX password for authentication */
    emqxPassword: string;
    /** MQTT client ID for device connection */
    mqttClientId: string;
    /** MQTT telemetry topic for publishing sensor data */
    telemetryTopic: string;
    /** MQTT command topic for subscribing to commands */
    commandTopic: string;
  };
}
