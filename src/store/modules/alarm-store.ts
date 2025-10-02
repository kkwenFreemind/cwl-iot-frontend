/**
 * Alarm Store
 * ===========
 *
 * Centralized state management for alarm system using Pinia.
 * Manages active alarms, alarm statistics, real-time updates, and user interactions.
 *
 * Features:
 * - Active alarms list with real-time updates
 * - Alarm statistics and dashboard data
 * - WebSocket integration for live notifications
 * - Alarm acknowledgment and resolution actions
 * - Filtering and sorting capabilities
 * - Local storage persistence for user preferences
 *
 * @author Chang Xiu-Wen, AI-Enhanced
 * @since 2025/10/02
 */

import { defineStore } from "pinia";
import { computed, reactive, toRefs } from "vue";
import type { AlarmEventPageVO, AlarmDashboardVO } from "@/api/iot/alarm-api";
import { AlarmMonitoringAPI } from "@/api/iot/alarm-api";
import { alarmWebSocketService } from "@/utils/alarm/websocket";
import { alarmSoundService } from "@/utils/alarm/sound";
import { useUserStoreHook } from "@/store/modules/user-store";

// Additional type definitions for store
interface AlarmFilter {
  severity: string[];
  status: string[];
  deviceIds: string[];
  startTime: Date | null;
  endTime: Date | null;
}

interface AlarmStatistics {
  totalActive: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  acknowledged: number;
  unacknowledged: number;
}

// Type aliases for better readability
type AlarmEvent = AlarmEventPageVO;
type DashboardData = AlarmDashboardVO;

interface AlarmState {
  // Core data
  activeAlarms: AlarmEvent[];
  statistics: AlarmStatistics | null;
  dashboardData: DashboardData | null;

  // UI state
  loading: boolean;
  error: string | null;
  selectedAlarmIds: string[];

  // Filters and pagination
  currentFilter: AlarmFilter;
  currentPage: number;
  pageSize: number;
  total: number;

  // Real-time state
  isConnected: boolean;
  lastUpdateTime: Date | null;
  soundEnabled: boolean;
}

export const useAlarmStore = defineStore("alarm", () => {
  // ==================== State ====================
  const state = reactive<AlarmState>({
    // Core data
    activeAlarms: [],
    statistics: null,
    dashboardData: null,

    // UI state
    loading: false,
    error: null,
    selectedAlarmIds: [],

    // Filters and pagination
    currentFilter: {
      severity: [],
      status: [],
      deviceIds: [],
      startTime: null,
      endTime: null,
    },
    currentPage: 1,
    pageSize: 20,
    total: 0,

    // Real-time state
    isConnected: false,
    lastUpdateTime: null,
    soundEnabled: true,
  });

  // API instance
  const alarmAPI = AlarmMonitoringAPI;

  // Get user store for deptId
  const userStore = useUserStoreHook();

  // Helper function to get current user's deptId
  const getCurrentDeptId = (): string | undefined => {
    const deptId = userStore.userInfo?.deptId;
    console.log("getCurrentDeptId called, userInfo:", userStore.userInfo);
    console.log("getCurrentDeptId returning:", deptId);
    return deptId;
  };

  // ==================== Computed Properties ====================
  const criticalAlarms = computed(() =>
    state.activeAlarms.filter((alarm) => alarm.severity === "CRITICAL")
  );

  const highPriorityAlarms = computed(() =>
    state.activeAlarms.filter((alarm) => ["CRITICAL", "HIGH"].includes(alarm.severity))
  );

  const unacknowledgedAlarms = computed(() =>
    state.activeAlarms.filter((alarm) => alarm.status === "ACTIVE")
  );

  const filteredAlarms = computed(() => {
    let filtered = [...state.activeAlarms];

    // Apply severity filter
    if (state.currentFilter.severity.length > 0) {
      filtered = filtered.filter((alarm) => state.currentFilter.severity.includes(alarm.severity));
    }

    // Apply status filter
    if (state.currentFilter.status.length > 0) {
      filtered = filtered.filter((alarm) => state.currentFilter.status.includes(alarm.status));
    }

    // Apply device filter
    if (state.currentFilter.deviceIds.length > 0) {
      filtered = filtered.filter((alarm) => state.currentFilter.deviceIds.includes(alarm.deviceId));
    }

    // Apply time range filter
    if (state.currentFilter.startTime) {
      filtered = filtered.filter(
        (alarm) => new Date(alarm.createdAt) >= state.currentFilter.startTime!
      );
    }

    if (state.currentFilter.endTime) {
      filtered = filtered.filter(
        (alarm) => new Date(alarm.createdAt) <= state.currentFilter.endTime!
      );
    }

    return filtered;
  });

  const alarmSummary = computed(() => ({
    total: state.activeAlarms.length,
    critical: criticalAlarms.value.length,
    high: state.activeAlarms.filter((alarm) => alarm.severity === "HIGH").length,
    medium: state.activeAlarms.filter((alarm) => alarm.severity === "MEDIUM").length,
    low: state.activeAlarms.filter((alarm) => alarm.severity === "LOW").length,
    unacknowledged: unacknowledgedAlarms.value.length,
  }));

  // ==================== Actions ====================

  /**
   * Initialize alarm store and WebSocket connection
   */
  async function initialize(): Promise<void> {
    try {
      // Ensure user info is loaded first
      console.log("Initialize called, current userInfo:", userStore.userInfo);

      if (!userStore.userInfo?.deptId) {
        console.log("User info not loaded, loading user info first...");
        const userInfoResult = await userStore.getUserInfo();
        console.log("User info loaded:", userInfoResult);
      }

      const currentDeptId = getCurrentDeptId();
      console.log("Initializing alarm store with user deptId:", currentDeptId);

      // deptId might be optional for some users (e.g., admin users)
      if (!currentDeptId) {
        console.warn("No deptId available, proceeding with user-level data access");
      }

      // Load initial data
      await Promise.all([loadActiveAlarms(), loadStatistics(), loadDashboardData()]);

      // Initialize WebSocket connection
      await initializeWebSocket();

      // Initialize sound service
      await alarmSoundService.initialize();
      alarmSoundService.setEnabled(state.soundEnabled);

      console.log("Alarm store initialized successfully");
    } catch (error) {
      console.error("Failed to initialize alarm store:", error);
      state.error = "Failed to initialize alarm system";
    }
  }

  /**
   * Load active alarms with pagination
   */
  async function loadActiveAlarms(page = 1, size = state.pageSize): Promise<void> {
    state.loading = true;
    state.error = null;

    try {
      const deptId = getCurrentDeptId();
      const params: any = {
        limit: size,
        severity: state.currentFilter.severity.join(","),
      };

      // Add deptId if available
      if (deptId) {
        params.deptId = deptId;
      }

      console.log("Loading active alarms with params:", params);
      console.log(
        "Active alarms API call: /api/v1/alarm/monitoring/active?" +
          Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join("&")
      );
      const response = await alarmAPI.getActiveAlarms(params);

      state.activeAlarms = response;
      state.total = response.length;
      state.currentPage = page;
      state.lastUpdateTime = new Date();
    } catch (error) {
      console.error("Failed to load active alarms:", error);
      state.error = "Failed to load active alarms";
    } finally {
      state.loading = false;
    }
  }

  /**
   * Load alarm statistics
   */
  async function loadStatistics(): Promise<void> {
    try {
      // Mock statistics since API doesn't have this endpoint yet
      state.statistics = {
        totalActive: state.activeAlarms.length,
        critical: state.activeAlarms.filter((a) => a.severity === "CRITICAL").length,
        high: state.activeAlarms.filter((a) => a.severity === "HIGH").length,
        medium: state.activeAlarms.filter((a) => a.severity === "MEDIUM").length,
        low: state.activeAlarms.filter((a) => a.severity === "LOW").length,
        acknowledged: state.activeAlarms.filter((a) => a.status === "ACKNOWLEDGED").length,
        unacknowledged: state.activeAlarms.filter((a) => a.status === "ACTIVE").length,
      };
    } catch (error) {
      console.error("Failed to load alarm statistics:", error);
    }
  }

  /**
   * Load dashboard data
   */
  async function loadDashboardData(): Promise<void> {
    try {
      const deptId = getCurrentDeptId();
      console.log("Loading dashboard data with deptId:", deptId);
      console.log(
        "Dashboard API call: /api/v1/alarm/monitoring/dashboard" +
          (deptId ? `?deptId=${deptId}` : "")
      );

      const response = await alarmAPI.getDashboard(deptId);
      state.dashboardData = response;
      console.log("Dashboard data loaded successfully:", response);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  }

  /**
   * Refresh all data
   */
  async function refreshAll(): Promise<void> {
    // Ensure user info is loaded before refreshing data
    if (!userStore.userInfo?.deptId) {
      console.log("User info not loaded in refreshAll, loading user info first...");
      await userStore.getUserInfo();
    }

    const currentDeptId = getCurrentDeptId();
    console.log("Refreshing all data with user deptId:", currentDeptId);

    if (!currentDeptId) {
      console.error("No deptId available, cannot refresh alarm data");
      return;
    }

    await Promise.all([
      loadActiveAlarms(state.currentPage, state.pageSize),
      loadStatistics(),
      loadDashboardData(),
    ]);
  }

  /**
   * Acknowledge single alarm
   */
  async function acknowledgeAlarm(alarmId: string, comment?: string): Promise<void> {
    try {
      const data = comment ? { note: comment } : undefined;
      await alarmAPI.acknowledgeAlarm(alarmId, data);

      // Update local state
      const alarm = state.activeAlarms.find((a) => a.id === alarmId);
      if (alarm) {
        alarm.status = "ACKNOWLEDGED";
        alarm.acknowledgedAt = new Date().toISOString();
      }

      // Refresh statistics
      await loadStatistics();
    } catch (error) {
      console.error("Failed to acknowledge alarm:", error);
      throw error;
    }
  }

  /**
   * Acknowledge multiple alarms
   */
  async function acknowledgeAlarms(alarmIds: string[], comment?: string): Promise<void> {
    try {
      await Promise.all(alarmIds.map((id) => acknowledgeAlarm(id, comment)));
      state.selectedAlarmIds = [];
    } catch (error) {
      console.error("Failed to acknowledge alarms:", error);
      throw error;
    }
  }

  /**
   * Resolve single alarm
   */
  async function resolveAlarm(alarmId: string, comment?: string): Promise<void> {
    try {
      const data = comment ? { note: comment } : undefined;
      await alarmAPI.resolveAlarm(alarmId, data);

      // Remove from active alarms
      state.activeAlarms = state.activeAlarms.filter((alarm) => alarm.id !== alarmId);

      // Refresh statistics
      await loadStatistics();
    } catch (error) {
      console.error("Failed to resolve alarm:", error);
      throw error;
    }
  }

  /**
   * Resolve multiple alarms
   */
  async function resolveAlarms(alarmIds: string[], comment?: string): Promise<void> {
    try {
      await Promise.all(alarmIds.map((id) => resolveAlarm(id, comment)));
      state.selectedAlarmIds = [];
    } catch (error) {
      console.error("Failed to resolve alarms:", error);
      throw error;
    }
  }

  /**
   * Update alarm filter
   */
  function updateFilter(filter: Partial<AlarmFilter>): void {
    state.currentFilter = { ...state.currentFilter, ...filter };
    loadActiveAlarms(1, state.pageSize); // Reset to first page
  }

  /**
   * Clear all filters
   */
  function clearFilters(): void {
    state.currentFilter = {
      severity: [],
      status: [],
      deviceIds: [],
      startTime: null,
      endTime: null,
    };
    loadActiveAlarms(1, state.pageSize);
  }

  /**
   * Toggle alarm selection
   */
  function toggleAlarmSelection(alarmId: string): void {
    const index = state.selectedAlarmIds.indexOf(alarmId);
    if (index > -1) {
      state.selectedAlarmIds.splice(index, 1);
    } else {
      state.selectedAlarmIds.push(alarmId);
    }
  }

  /**
   * Select all visible alarms
   */
  function selectAllAlarms(): void {
    state.selectedAlarmIds = filteredAlarms.value.map((alarm) => alarm.id);
  }

  /**
   * Clear alarm selection
   */
  function clearSelection(): void {
    state.selectedAlarmIds = [];
  }

  /**
   * Toggle sound notifications
   */
  function toggleSound(enabled: boolean): void {
    state.soundEnabled = enabled;
    alarmSoundService.setEnabled(enabled);

    // Save to localStorage
    localStorage.setItem("alarm-sound-enabled", JSON.stringify(enabled));
  }

  /**
   * Initialize WebSocket connection
   */
  async function initializeWebSocket(): Promise<void> {
    try {
      await alarmWebSocketService.connect();

      // Subscribe to alarm events
      alarmWebSocketService.subscribe("alarm.new", handleNewAlarm);
      alarmWebSocketService.subscribe("alarm.updated", handleAlarmUpdate);
      alarmWebSocketService.subscribe("alarm.resolved", handleAlarmResolved);
      alarmWebSocketService.subscribe("statistics.updated", handleStatisticsUpdate);

      // Update connection status
      alarmWebSocketService.subscribe("connected", () => {
        state.isConnected = true;
      });

      alarmWebSocketService.subscribe("disconnected", () => {
        state.isConnected = false;
      });
    } catch (error) {
      console.error("Failed to initialize WebSocket:", error);
    }
  }

  /**
   * Handle new alarm event
   */
  function handleNewAlarm(alarm: AlarmEvent): void {
    // Add to active alarms if not already present
    if (!state.activeAlarms.find((a) => a.id === alarm.id)) {
      state.activeAlarms.unshift(alarm);

      // Play sound notification
      if (state.soundEnabled) {
        alarmSoundService.playAlarmSound(alarm.severity);
      }

      // Update last update time
      state.lastUpdateTime = new Date();
    }
  }

  /**
   * Handle alarm update event
   */
  function handleAlarmUpdate(updatedAlarm: AlarmEvent): void {
    const index = state.activeAlarms.findIndex((alarm) => alarm.id === updatedAlarm.id);
    if (index > -1) {
      state.activeAlarms[index] = updatedAlarm;
      state.lastUpdateTime = new Date();
    }
  }

  /**
   * Handle alarm resolved event
   */
  function handleAlarmResolved(alarmId: string): void {
    state.activeAlarms = state.activeAlarms.filter((alarm) => alarm.id !== alarmId);
    state.lastUpdateTime = new Date();
  }

  /**
   * Handle statistics update event
   */
  function handleStatisticsUpdate(statistics: AlarmStatistics): void {
    state.statistics = statistics;
  }

  /**
   * Cleanup resources
   */
  function destroy(): void {
    alarmWebSocketService.disconnect();
    alarmSoundService.destroy();
  }

  // ==================== Return Store API ====================
  return {
    // State
    ...toRefs(state),

    // Computed
    criticalAlarms,
    highPriorityAlarms,
    unacknowledgedAlarms,
    filteredAlarms,
    alarmSummary,

    // Actions
    initialize,
    loadActiveAlarms,
    loadStatistics,
    loadDashboardData,
    refreshAll,
    acknowledgeAlarm,
    acknowledgeAlarms,
    resolveAlarm,
    resolveAlarms,
    updateFilter,
    clearFilters,
    toggleAlarmSelection,
    selectAllAlarms,
    clearSelection,
    toggleSound,
    destroy,
  };
});
