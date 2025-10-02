/**
 * Notification Store
 * ==================
 *
 * Centralized state management for notification channels and preferences.
 * Manages notification configuration, channel testing, and delivery preferences.
 *
 * Features:
 * - Notification channel management (Email, SMS, WebHook, WebSocket)
 * - Channel configuration and status tracking
 * - Notification preference management per user/department
 * - Real-time notification delivery
 * - Channel testing and validation
 * - Notification history and statistics
 *
 * @author Chang Xiu-Wen, AI-Enhanced
 * @since 2025/10/02
 */

import { defineStore } from "pinia";
import { reactive, computed, toRefs } from "vue";
import type { NotificationChannelVO } from "@/api/iot/alarm-api";
import { NotificationAPI } from "@/api/iot/alarm-api";

// Additional interfaces for notification store
interface NotificationPreferenceVO {
  userId: string;
  deptId: string;
  channelId: string;
  severity: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  // Channel management
  channels: NotificationChannelVO[];
  preferences: NotificationPreferenceVO[];

  // UI state
  loading: boolean;
  error: string | null;

  // Channel testing
  testingChannels: Set<string>;
  testResults: Map<string, { success: boolean; message: string; timestamp: Date }>;

  // Statistics
  deliveryStats: {
    totalSent: number;
    totalFailed: number;
    successRate: number;
    lastUpdated: Date | null;
  };

  // Real-time notifications
  recentNotifications: RecentNotification[];
  unreadCount: number;
}

interface RecentNotification {
  id: string;
  type: "alarm" | "system" | "test";
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  timestamp: Date;
  read: boolean;
  channelId?: string;
  channelType?: string;
}

export const useNotificationStore = defineStore("notification", () => {
  // ==================== State ====================
  const state = reactive<NotificationState>({
    // Channel management
    channels: [],
    preferences: [],

    // UI state
    loading: false,
    error: null,

    // Channel testing
    testingChannels: new Set(),
    testResults: new Map(),

    // Statistics
    deliveryStats: {
      totalSent: 0,
      totalFailed: 0,
      successRate: 0,
      lastUpdated: null,
    },

    // Real-time notifications
    recentNotifications: [],
    unreadCount: 0,
  });

  // API instance
  const notificationAPI = NotificationAPI;

  // ==================== Computed Properties ====================
  const enabledChannels = computed(() => state.channels.filter((channel) => channel.isActive));

  const channelsByType = computed(() => {
    const grouped: Record<string, NotificationChannelVO[]> = {};
    state.channels.forEach((channel) => {
      if (!grouped[channel.channelType]) {
        grouped[channel.channelType] = [];
      }
      grouped[channel.channelType].push(channel);
    });
    return grouped;
  });

  const notificationsByType = computed(() => {
    const grouped: Record<string, RecentNotification[]> = {};
    state.recentNotifications.forEach((notification) => {
      if (!grouped[notification.type]) {
        grouped[notification.type] = [];
      }
      grouped[notification.type].push(notification);
    });
    return grouped;
  });

  const unreadNotifications = computed(() => state.recentNotifications.filter((n) => !n.read));

  // ==================== Actions ====================

  /**
   * Initialize notification store
   */
  async function initialize(): Promise<void> {
    try {
      await Promise.all([loadChannels(), loadPreferences(), loadDeliveryStats()]);
      console.log("Notification store initialized successfully");
    } catch (error) {
      console.error("Failed to initialize notification store:", error);
      state.error = "Failed to initialize notification system";
    }
  }

  /**
   * Load all notification channels
   */
  async function loadChannels(): Promise<void> {
    state.loading = true;
    state.error = null;

    try {
      const response = await notificationAPI.getChannels();
      state.channels = response;
    } catch (error) {
      console.error("Failed to load notification channels:", error);
      state.error = "Failed to load notification channels";
    } finally {
      state.loading = false;
    }
  }

  /**
   * Load notification preferences
   */
  async function loadPreferences(): Promise<void> {
    try {
      // Mock implementation since API doesn't have this endpoint yet
      state.preferences = [];
    } catch (error) {
      console.error("Failed to load notification preferences:", error);
    }
  }

  /**
   * Load delivery statistics
   */
  async function loadDeliveryStats(): Promise<void> {
    try {
      // Mock implementation since API doesn't have this endpoint
      state.deliveryStats = {
        totalSent: Math.floor(Math.random() * 1000),
        totalFailed: Math.floor(Math.random() * 50),
        successRate: 0.95,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("Failed to load delivery statistics:", error);
    }
  }

  /**
   * Create new notification channel
   */
  async function createChannel(channel: Omit<NotificationChannelVO, "channelId">): Promise<void> {
    try {
      const response = await notificationAPI.createChannel(channel);
      state.channels.push(response);

      // Add success notification
      addNotification({
        type: "system",
        title: "Channel Created",
        message: `Notification channel "${channel.channelName}" created successfully`,
        severity: "SUCCESS",
      });
    } catch (error) {
      console.error("Failed to create notification channel:", error);
      throw error;
    }
  }

  /**
   * Update notification channel
   */
  async function updateChannel(
    channelId: string,
    updates: Partial<NotificationChannelVO>
  ): Promise<void> {
    try {
      const response = await notificationAPI.updateChannel(channelId, updates);

      const index = state.channels.findIndex((c) => c.channelId === channelId);
      if (index > -1) {
        state.channels[index] = response;
      }

      // Add success notification
      addNotification({
        type: "system",
        title: "Channel Updated",
        message: `Notification channel updated successfully`,
        severity: "SUCCESS",
      });
    } catch (error) {
      console.error("Failed to update notification channel:", error);
      throw error;
    }
  }

  /**
   * Delete notification channel
   */
  async function deleteChannel(channelId: string): Promise<void> {
    try {
      await notificationAPI.deleteChannel(channelId);

      state.channels = state.channels.filter((c) => c.channelId !== channelId);

      // Add success notification
      addNotification({
        type: "system",
        title: "Channel Deleted",
        message: "Notification channel deleted successfully",
        severity: "SUCCESS",
      });
    } catch (error) {
      console.error("Failed to delete notification channel:", error);
      throw error;
    }
  }

  /**
   * Toggle channel enabled status
   */
  async function toggleChannel(channelId: string, enabled: boolean): Promise<void> {
    try {
      await updateChannel(channelId, { isActive: enabled });

      const channel = state.channels.find((c) => c.channelId === channelId);
      const action = enabled ? "enabled" : "disabled";

      addNotification({
        type: "system",
        title: "Channel Status Changed",
        message: `Channel "${channel?.channelName}" has been ${action}`,
        severity: "INFO",
      });
    } catch (error) {
      console.error("Failed to toggle channel status:", error);
      throw error;
    }
  }

  /**
   * Test notification channel
   */
  async function testChannel(channelId: string): Promise<void> {
    if (state.testingChannels.has(channelId)) {
      return; // Already testing this channel
    }

    state.testingChannels.add(channelId);

    try {
      await notificationAPI.testChannel(channelId);

      // Record successful test
      state.testResults.set(channelId, {
        success: true,
        message: "Test notification sent successfully",
        timestamp: new Date(),
      });

      const channel = state.channels.find((c) => c.channelId === channelId);
      addNotification({
        type: "test",
        title: "Test Notification Sent",
        message: `Test notification sent via ${channel?.channelName}`,
        severity: "SUCCESS",
        channelId,
        channelType: channel?.channelType,
      });
    } catch (error) {
      console.error("Failed to test notification channel:", error);

      // Record failed test
      state.testResults.set(channelId, {
        success: false,
        message: error instanceof Error ? error.message : "Test failed",
        timestamp: new Date(),
      });

      addNotification({
        type: "test",
        title: "Test Notification Failed",
        message: `Failed to send test notification: ${error instanceof Error ? error.message : "Unknown error"}`,
        severity: "ERROR",
        channelId,
      });
    } finally {
      state.testingChannels.delete(channelId);
    }
  }

  /**
   * Update notification preferences
   */
  async function updatePreferences(preferences: NotificationPreferenceVO[]): Promise<void> {
    try {
      // Mock implementation since API doesn't have this endpoint yet
      state.preferences = preferences;

      addNotification({
        type: "system",
        title: "Preferences Updated",
        message: "Notification preferences updated successfully",
        severity: "SUCCESS",
      });
    } catch (error) {
      console.error("Failed to update notification preferences:", error);
      throw error;
    }
  }

  /**
   * Add notification to recent list
   */
  function addNotification(
    notification: Omit<RecentNotification, "id" | "timestamp" | "read">
  ): void {
    const newNotification: RecentNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    state.recentNotifications.unshift(newNotification);
    state.unreadCount++;

    // Keep only last 100 notifications
    if (state.recentNotifications.length > 100) {
      state.recentNotifications = state.recentNotifications.slice(0, 100);
    }
  }

  /**
   * Mark notification as read
   */
  function markAsRead(notificationId: string): void {
    const notification = state.recentNotifications.find((n) => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    }
  }

  /**
   * Mark all notifications as read
   */
  function markAllAsRead(): void {
    state.recentNotifications.forEach((notification) => {
      notification.read = true;
    });
    state.unreadCount = 0;
  }

  /**
   * Clear all notifications
   */
  function clearNotifications(): void {
    state.recentNotifications = [];
    state.unreadCount = 0;
  }

  /**
   * Clear notifications of specific type
   */
  function clearNotificationsByType(type: string): void {
    const unreadRemoved = state.recentNotifications.filter(
      (n) => !n.read && n.type === type
    ).length;
    state.recentNotifications = state.recentNotifications.filter((n) => n.type !== type);
    state.unreadCount = Math.max(0, state.unreadCount - unreadRemoved);
  }

  /**
   * Get channel test result
   */
  function getTestResult(channelId: string) {
    return state.testResults.get(channelId);
  }

  /**
   * Check if channel is being tested
   */
  function isChannelTesting(channelId: string): boolean {
    return state.testingChannels.has(channelId);
  }

  /**
   * Refresh all data
   */
  async function refreshAll(): Promise<void> {
    await Promise.all([loadChannels(), loadPreferences(), loadDeliveryStats()]);
  }

  /**
   * Get notification summary
   */
  const notificationSummary = computed(() => ({
    totalChannels: state.channels.length,
    enabledChannels: enabledChannels.value.length,
    totalNotifications: state.recentNotifications.length,
    unreadCount: state.unreadCount,
    successRate: state.deliveryStats.successRate,
    lastUpdated: state.deliveryStats.lastUpdated,
  }));

  // ==================== Return Store API ====================
  return {
    // State
    ...toRefs(state),

    // Computed
    enabledChannels,
    channelsByType,
    notificationsByType,
    unreadNotifications,
    notificationSummary,

    // Actions
    initialize,
    loadChannels,
    loadPreferences,
    loadDeliveryStats,
    createChannel,
    updateChannel,
    deleteChannel,
    toggleChannel,
    testChannel,
    updatePreferences,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    clearNotificationsByType,
    getTestResult,
    isChannelTesting,
    refreshAll,
  };
});
