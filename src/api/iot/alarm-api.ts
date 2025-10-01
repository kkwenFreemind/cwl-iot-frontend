/**
 * IoT Alarm Rule API Module
 * =========================
 *
 * Comprehensive API client for IoT alarm rule management operations.
 * Provides RESTful endpoints for alarm rule configuration, condition management,
 * and real-time alarm monitoring functionality.
 *
 * Features:
 * - Alarm rule CRUD operations (Create, Read, Update, Delete)
 * - Condition management for complex alarm scenarios
 * - Device-based alarm rule filtering
 * - Rule status control (active/inactive)
 * - Severity level management
 *
 * @author Chang Xiu-Wen, AI-Enhanced
 * @since 2025/10/01
 */

import request from "@/utils/request";

/**
 * Base URL for alarm rule-related API endpoints
 */
const ALARM_RULE_BASE_URL = "/api/v1/alarm-rules";

/**
 * Alarm severity levels enum
 */
export enum AlarmSeverity {
  INFO = "info",
  WARNING = "warning",
  CRITICAL = "critical",
  EMERGENCY = "emergency",
}

/**
 * Sparkplug B data types for condition validation
 */
export enum SparkplugDataType {
  INT8 = "Int8",
  INT16 = "Int16",
  INT32 = "Int32",
  INT64 = "Int64",
  UINT8 = "UInt8",
  UINT16 = "UInt16",
  UINT32 = "UInt32",
  UINT64 = "UInt64",
  FLOAT = "Float",
  DOUBLE = "Double",
  BOOLEAN = "Boolean",
  STRING = "String",
}

/**
 * Comparison operators for alarm conditions
 */
export enum ComparisonOperator {
  GREATER_THAN = ">",
  LESS_THAN = "<",
  GREATER_EQUAL = ">=",
  LESS_EQUAL = "<=",
  EQUAL = "=",
  NOT_EQUAL = "!=",
}

/**
 * Interface for alarm condition configuration
 */
export interface AlarmCondition {
  conditionId?: number;
  metricName: string;
  operator: ComparisonOperator;
  thresholdValue: string;
  dataType: SparkplugDataType;
  conditionDescription?: string;
  createdAt?: string;
}

/**
 * Interface for creating new alarm conditions
 */
export interface AlarmConditionRequest {
  metricName: string;
  operator: ComparisonOperator;
  thresholdValue: string;
  dataType: SparkplugDataType;
}

/**
 * Interface for alarm rule creation
 */
export interface CreateAlarmRuleRequest {
  ruleName: string;
  deviceId: string;
  description?: string;
  isActive?: boolean;
  severity?: AlarmSeverity;
  conditions: AlarmConditionRequest[];
}

/**
 * Interface for alarm rule updates
 */
export interface UpdateAlarmRuleRequest {
  ruleName?: string;
  description?: string;
  isActive?: boolean;
  severity?: AlarmSeverity;
  conditions?: AlarmConditionRequest[];
}

/**
 * Interface for alarm rule response data
 */
export interface AlarmRuleResponse {
  ruleId: number;
  ruleName: string;
  deviceId: string;
  description?: string;
  isActive: boolean;
  severity: AlarmSeverity;
  createdBy?: number;
  createdAt: string;
  updatedAt?: string;
  conditions: AlarmCondition[];
  // UI状态属性
  statusLoading?: boolean;
}

/**
 * Query parameters for filtering alarm rules
 */
export interface AlarmRuleQuery {
  deviceId?: string;
  isActive?: boolean;
  severity?: AlarmSeverity;
  keywords?: string;
}

/**
 * Alarm Rule API Client
 * =====================
 *
 * Collection of HTTP methods for alarm rule management operations.
 * Each method corresponds to a specific REST API endpoint with
 * proper TypeScript typing for request/response data.
 */
const AlarmRuleAPI = {
  /**
   * Create a new alarm rule with conditions
   *
   * @param data - Alarm rule creation request data
   * @returns Promise resolving to created alarm rule response
   */
  createAlarmRule(data: CreateAlarmRuleRequest) {
    return request<any, AlarmRuleResponse>({
      url: ALARM_RULE_BASE_URL,
      method: "post",
      data,
    });
  },

  /**
   * Update an existing alarm rule
   *
   * @param ruleId - ID of the alarm rule to update
   * @param data - Updated alarm rule data
   * @returns Promise resolving to updated alarm rule response
   */
  updateAlarmRule(ruleId: number, data: UpdateAlarmRuleRequest) {
    return request<any, AlarmRuleResponse>({
      url: `${ALARM_RULE_BASE_URL}/${ruleId}`,
      method: "put",
      data,
    });
  },

  /**
   * Get alarm rule details by ID
   *
   * @param ruleId - ID of the alarm rule to retrieve
   * @returns Promise resolving to alarm rule response
   */
  getAlarmRule(ruleId: number) {
    return request<any, AlarmRuleResponse>({
      url: `${ALARM_RULE_BASE_URL}/${ruleId}`,
      method: "get",
    });
  },

  /**
   * Get all alarm rules for a specific device
   *
   * @param deviceId - UUID of the target device
   * @returns Promise resolving to array of alarm rule responses
   */
  getAlarmRulesByDevice(deviceId: string) {
    return request<any, AlarmRuleResponse[]>({
      url: `${ALARM_RULE_BASE_URL}/device/${deviceId}`,
      method: "get",
    });
  },

  /**
   * Get only active alarm rules for a specific device
   *
   * @param deviceId - UUID of the target device
   * @returns Promise resolving to array of active alarm rule responses
   */
  getActiveAlarmRulesByDevice(deviceId: string) {
    return request<any, AlarmRuleResponse[]>({
      url: `${ALARM_RULE_BASE_URL}/device/${deviceId}/active`,
      method: "get",
    });
  },

  /**
   * Toggle alarm rule active status
   *
   * @param ruleId - ID of the alarm rule to toggle
   * @param isActive - New active status
   * @returns Promise resolving to updated alarm rule response
   */
  toggleAlarmRuleStatus(ruleId: number, isActive: boolean) {
    return request<any, AlarmRuleResponse>({
      url: `${ALARM_RULE_BASE_URL}/${ruleId}/status`,
      method: "patch",
      params: { isActive },
    });
  },

  /**
   * Delete an alarm rule and all its conditions
   *
   * @param ruleId - ID of the alarm rule to delete
   * @returns Promise resolving to deletion confirmation
   */
  deleteAlarmRule(ruleId: number) {
    return request<any, void>({
      url: `${ALARM_RULE_BASE_URL}/${ruleId}`,
      method: "delete",
    });
  },
};

export default AlarmRuleAPI;
