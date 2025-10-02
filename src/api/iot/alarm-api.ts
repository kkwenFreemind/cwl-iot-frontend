/**
 * IoT Alarm Rule & Monitoring API Module
 * =======================================
 *
 * Comprehensive API client for IoT alarm rule management operations and real-time monitoring.
 * Provides RESTful endpoints for alarm rule configuration, condition management,
 * real-time monitoring, and notification management functionality.
 *
 * Features:
 * - Alarm rule CRUD operations (Create, Read, Update, Delete)
 * - Condition management for complex alarm scenarios
 * - Device-based alarm rule filtering
 * - Rule status control (active/inactive)
 * - Severity level management
 * - Real-time alarm monitoring and dashboard
 * - Alarm event management (acknowledge, resolve)
 * - Notification channel management
 * - Analytics and historical data
 *
 * @author Chang Xiu-Wen, AI-Enhanced
 * @since 2025/10/01
 * @updated 2025/10/02
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

/**
 * Alarm Monitoring API
 * ====================
 *
 * Real-time alarm monitoring and dashboard functionality
 */
export interface AlarmEventPageVO {
  id: string;
  ruleId: string;
  ruleName: string;
  deviceId: string;
  deviceName: string;
  metricId: string;
  metricName: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  triggerValue: number;
  threshold: number;
  message: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  deptId: string;
  deptName: string;
}

export interface AlarmDashboardVO {
  totalActiveAlarms: number;
  criticalAlarms: number;
  highAlarms: number;
  mediumAlarms: number;
  lowAlarms: number;
  totalAlarmsToday: number;
  resolvedAlarmsToday: number;
  avgResolutionTime: string;
  topAffectedDevices: AffectedDevice[];
  recentAlarms: AlarmEventPageVO[];
}

export interface AffectedDevice {
  deviceId: string;
  deviceName: string;
  alarmCount: number;
}

export interface AlarmAcknowledgeRequest {
  note?: string;
}

export interface AlarmResolveRequest {
  note?: string;
}

const ALARM_MONITORING_BASE_URL = "/api/v1/alarm/monitoring";

export const AlarmMonitoringAPI = {
  /**
   * Get active alarms for real-time monitoring
   *
   * @param params - Filter parameters
   * @returns Promise resolving to active alarms list
   */
  getActiveAlarms(params?: { deptId?: string; severity?: string; limit?: number }) {
    // 設定默認參數，確保 deptId 預設為 "2"
    const defaultParams = { deptId: "2", ...params };
    
    return request<any, AlarmEventPageVO[]>({
      url: `${ALARM_MONITORING_BASE_URL}/active`,
      method: "get",
      params: defaultParams,
    });
  },

  /**
   * Get dashboard summary data
   *
   * @param deptId - Department ID filter
   * @returns Promise resolving to dashboard data
   */
  getDashboard(deptId?: string) {
    return request<any, AlarmDashboardVO>({
      url: `${ALARM_MONITORING_BASE_URL}/dashboard`,
      method: "get",
      params: { deptId },
    });
  },

  /**
   * Get alarm trends data
   *
   * @param params - Trend parameters
   * @returns Promise resolving to trend data
   */
  getTrends(params?: { period?: string; deptId?: string }) {
    return request<any, any>({
      url: `${ALARM_MONITORING_BASE_URL}/trends`,
      method: "get",
      params,
    });
  },

  /**
   * Acknowledge an alarm
   *
   * @param alarmId - ID of the alarm to acknowledge
   * @param data - Acknowledgment data
   * @returns Promise resolving to acknowledgment result
   */
  acknowledgeAlarm(alarmId: string, data?: AlarmAcknowledgeRequest) {
    return request<any, void>({
      url: `${ALARM_MONITORING_BASE_URL}/${alarmId}/acknowledge`,
      method: "post",
      data,
    });
  },

  /**
   * Resolve an alarm
   *
   * @param alarmId - ID of the alarm to resolve
   * @param data - Resolution data
   * @returns Promise resolving to resolution result
   */
  resolveAlarm(alarmId: string, data?: AlarmResolveRequest) {
    return request<any, void>({
      url: `${ALARM_MONITORING_BASE_URL}/${alarmId}/resolve`,
      method: "post",
      data,
    });
  },

  /**
   * Get alarm timeline/history
   *
   * @param alarmId - ID of the alarm
   * @returns Promise resolving to alarm timeline
   */
  getAlarmTimeline(alarmId: string) {
    return request<any, any[]>({
      url: `${ALARM_MONITORING_BASE_URL}/${alarmId}/timeline`,
      method: "get",
    });
  },
};

/**
 * Notification Channel Management API
 * ===================================
 */
export interface NotificationChannelVO {
  channelId: string;
  channelName: string;
  channelType: "EMAIL" | "SMS" | "WEBHOOK";
  description?: string;
  isActive: boolean;
  configuration: Record<string, any>;
  recipients: string;
  successRate: number;
  healthStatus: "HEALTHY" | "WARNING" | "UNHEALTHY";
  createdBy: string;
  createdTime: string;
}

export interface NotificationTestVO {
  success: boolean;
  message: string;
  deliveryTime?: number;
}

export interface CreateNotificationChannelRequest {
  channelName: string;
  channelType: "EMAIL" | "SMS" | "WEBHOOK";
  description?: string;
  configuration: Record<string, any>;
  recipients: string;
}

const NOTIFICATION_BASE_URL = "/api/v1/notification/channels";

export const NotificationAPI = {
  /**
   * Get notification channels list
   *
   * @param params - Query parameters
   * @returns Promise resolving to channels list
   */
  getChannels(params?: { page?: number; size?: number; channelType?: string; isActive?: boolean }) {
    return request<any, any>({
      url: NOTIFICATION_BASE_URL,
      method: "get",
      params,
    });
  },

  /**
   * Create notification channel
   *
   * @param data - Channel creation data
   * @returns Promise resolving to created channel
   */
  createChannel(data: CreateNotificationChannelRequest) {
    return request<any, NotificationChannelVO>({
      url: NOTIFICATION_BASE_URL,
      method: "post",
      data,
    });
  },

  /**
   * Update notification channel
   *
   * @param channelId - Channel ID
   * @param data - Channel update data
   * @returns Promise resolving to updated channel
   */
  updateChannel(channelId: string, data: Partial<CreateNotificationChannelRequest>) {
    return request<any, NotificationChannelVO>({
      url: `${NOTIFICATION_BASE_URL}/${channelId}`,
      method: "put",
      data,
    });
  },

  /**
   * Delete notification channel
   *
   * @param channelId - Channel ID
   * @returns Promise resolving to deletion result
   */
  deleteChannel(channelId: string) {
    return request<any, void>({
      url: `${NOTIFICATION_BASE_URL}/${channelId}`,
      method: "delete",
    });
  },

  /**
   * Test notification channel
   *
   * @param channelId - Channel ID
   * @param testMessage - Test message
   * @returns Promise resolving to test result
   */
  testChannel(channelId: string, testMessage?: string) {
    return request<any, NotificationTestVO>({
      url: `${NOTIFICATION_BASE_URL}/${channelId}/test`,
      method: "post",
      data: { testMessage },
    });
  },

  /**
   * Get channels health status
   *
   * @returns Promise resolving to health status
   */
  getChannelsHealth() {
    return request<any, any>({
      url: `${NOTIFICATION_BASE_URL}/health`,
      method: "get",
    });
  },
};

/**
 * Alarm Metadata API
 * ==================
 */
const ALARM_METADATA_BASE_URL = "/api/v1/alarm/metadata";

export const AlarmMetadataAPI = {
  /**
   * Get available metrics
   *
   * @returns Promise resolving to metrics list
   */
  getMetrics() {
    return request<any, any[]>({
      url: `${ALARM_METADATA_BASE_URL}/metrics`,
      method: "get",
    });
  },

  /**
   * Get comparison operators
   *
   * @returns Promise resolving to operators list
   */
  getOperators() {
    return request<any, any[]>({
      url: `${ALARM_METADATA_BASE_URL}/operators`,
      method: "get",
    });
  },

  /**
   * Get severity levels
   *
   * @returns Promise resolving to severity levels
   */
  getSeverityLevels() {
    return request<any, any[]>({
      url: `${ALARM_METADATA_BASE_URL}/severity-levels`,
      method: "get",
    });
  },

  /**
   * Get notification channel options
   *
   * @returns Promise resolving to channel options
   */
  getNotificationChannels() {
    return request<any, any[]>({
      url: `${ALARM_METADATA_BASE_URL}/notification-channels`,
      method: "get",
    });
  },
};

export default AlarmRuleAPI;
