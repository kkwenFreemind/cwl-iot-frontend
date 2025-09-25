/**
 * IoT Sparkplug B Telemetry API Module
 * ====================================
 *
 * @author Chang Xiu-Wen, AI-Enhanced
 * @since 2025/09/25
 *
 * Comprehensive API client for IoT telemetry data operations.
 * Provides RESTful endpoints for accessing Sparkplug B protocol
 * telemetry data with department-based filtering and time-range queries.
 *
 * Features:
 * - Department-based telemetry data retrieval
 * - Time-range filtering for historical data analysis
 * - Paginated and list-based response formats
 * - Real-time telemetry monitoring capabilities
 * - Support for multiple metric types (water level, battery, signal)
 */

import request from "@/utils/request";

/**
 * Base URL for telemetry-related API endpoints
 * Centralizes API path configuration for maintainability
 */
const TELEMETRY_BASE_URL = "/api/v1/telemetry";

/**
 * Telemetry API Client Object
 * ===========================
 *
 * Collection of HTTP methods for telemetry data operations.
 * Each method corresponds to a specific REST API endpoint with
 * proper TypeScript typing for request/response data.
 */
const TelemetryAPI = {
  /**
   * Retrieve paginated telemetry data by department with optional time filtering
   *
   * This method fetches telemetry data for devices belonging to a specific department,
   * with support for time-range filtering and pagination for large datasets.
   * Results are ordered chronologically for time-series analysis.
   *
   * @param deptId - Department identifier (required)
   * @param startTime - Optional start time for filtering (ISO 8601 format)
   * @param endTime - Optional end time for filtering (ISO 8601 format)
   * @param pageNum - Page number for pagination (default: 1)
   * @param pageSize - Number of records per page (default: 10)
   * @returns Promise resolving to paginated telemetry data
   */
  getTelemetryByDepartment(
    deptId: number,
    startTime?: string,
    endTime?: string,
    pageNum: number = 1,
    pageSize: number = 10
  ) {
    return request<any, PageResult<any>>({
      url: `${TELEMETRY_BASE_URL}/department/${deptId}`,
      method: "get",
      params: {
        startTime,
        endTime,
        pageNum,
        pageSize,
      },
    });
  },

  /**
   * Retrieve telemetry data list by department with optional time filtering
   *
   * This method provides a simplified list response for telemetry data,
   * suitable for frontend components that need to display data in lists
   * or tables without pagination overhead. All matching records are returned.
   *
   * @param deptId - Department identifier (required)
   * @param startTime - Optional start time for filtering (ISO 8601 format)
   * @param endTime - Optional end time for filtering (ISO 8601 format)
   * @returns Promise resolving to array of telemetry data
   */
  getTelemetryListByDepartment(deptId: number, startTime?: string, endTime?: string) {
    return request<any, any[]>({
      url: `${TELEMETRY_BASE_URL}/department/${deptId}/list`,
      method: "get",
      params: {
        startTime,
        endTime,
      },
    });
  },
};

export default TelemetryAPI;
