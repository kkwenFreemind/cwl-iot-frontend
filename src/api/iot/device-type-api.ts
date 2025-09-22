import http from "@/utils/request";

/**
 * IoT Device Type Data Transfer Objects
 */

// Device Type Base Interface
export interface IotDeviceTypeVO {
  id?: number;
  name: string;
  description?: string;
  deptId: number;
  deptName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  metricIds?: number[];
  metrics?: IotDeviceTypeMetricVO[];
  deviceCount?: number;
}

// Device Type Form Interface
export interface IotDeviceTypeForm {
  name: string;
  description?: string;
  deptId: number;
  isActive: boolean;
}

// Device Type Metrics Form Interface
export interface IotDeviceTypeMetricsForm {
  metrics: MetricAssociation[];
}

// Metric Association Interface for device type metrics form
export interface MetricAssociation {
  metricId: number;
  isEnabled?: boolean;
  aliasOverride?: string;
}

// Device Type Metric Association Interface
export interface IotDeviceTypeMetricVO {
  id: number;
  deviceTypeId: number;
  metricId: number;
  metricName?: string;
  metricAlias?: string;
  unit?: string;
  physicalQuantity?: string;
  dataType?: string;
}

// Query Parameters Interface
export interface IotDeviceTypeQuery {
  keywords?: string;
  deptId?: number;
  isActive?: boolean;
}

/**
 * IoT Device Type API Client
 */
class DeviceTypeAPI {
  /**
   * Get device types by department
   */
  static getDeviceTypesByDepartment(deptId: number): Promise<IotDeviceTypeVO[]> {
    return http.get(`/api/v1/device-types/department/${deptId}`);
  }

  /**
   * Get active device types by department
   */
  static getActiveDeviceTypesByDepartment(deptId: number): Promise<IotDeviceTypeVO[]> {
    return http.get(`/api/v1/device-types/department/${deptId}/active`);
  }

  /**
   * Get device type details with metrics
   */
  static getDeviceTypeDetail(id: number): Promise<IotDeviceTypeVO> {
    return http.get(`/api/v1/device-types/${id}`);
  }

  /**
   * Create new device type
   */
  static createDeviceType(data: IotDeviceTypeForm): Promise<void> {
    return http.post("/api/v1/device-types", data);
  }

  /**
   * Update device type
   */
  static updateDeviceType(id: number, data: IotDeviceTypeForm): Promise<void> {
    return http.put(`/api/v1/device-types/${id}`, data);
  }

  /**
   * Update device type metric associations
   */
  static updateDeviceTypeMetrics(id: number, data: IotDeviceTypeMetricsForm): Promise<void> {
    return http.post(`/api/v1/device-types/${id}/metrics`, data);
  }

  /**
   * Delete device type
   */
  static deleteDeviceType(id: number): Promise<void> {
    return http.delete(`/api/v1/device-types/${id}`);
  }

  /**
   * List device types with query parameters
   */
  static listDeviceTypes(params?: IotDeviceTypeQuery): Promise<IotDeviceTypeVO[]> {
    return http.get("/api/v1/device-types", { params });
  }
}

export default DeviceTypeAPI;
