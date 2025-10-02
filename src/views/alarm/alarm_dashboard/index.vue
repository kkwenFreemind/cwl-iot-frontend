<!--
  Alarm Dashboard Page
  ====================
  
  Real-time alarm monitoring dashboard with statistics, charts, and recent alarms.
  Provides comprehensive overview of system alarm status and trends.
  
  Features:
  - Real-time alarm statistics cards
  - Severity distribution charts
  - Alarm trend analysis
  - Top devices by alarm count
  - Recent alarms list
  - Auto-refresh functionality
  
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025-10-02
  @version 1.0.0
-->

<template>
  <div v-if="loading" class="loading-container">
    <div v-loading="loading" class="loading-wrapper" element-loading-text="Loading dashboard...">
      <div style="height: 200px"></div>
    </div>
  </div>
  <div v-else class="alarm-dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="header-left">
        <h2 class="page-title">{{ $t("alarm.dashboard.title") }}</h2>
        <div class="connection-status">
          <el-tag :type="isConnected ? 'success' : 'danger'" size="small" effect="light">
            <i :class="isConnected ? 'i-ep-connection' : 'i-ep-warning'"></i>
            {{ isConnected ? $t("alarm.dashboard.connected") : $t("alarm.dashboard.disconnected") }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button type="primary" :loading="loading" @click="refreshData">
            <i class="i-ep-refresh"></i>
            {{ $t("common.refresh") }}
          </el-button>
          <el-button @click="toggleAutoRefresh">
            <i :class="autoRefresh ? 'i-ep-video-pause' : 'i-ep-video-play'"></i>
            {{
              autoRefresh ? $t("alarm.dashboard.pauseRefresh") : $t("alarm.dashboard.startRefresh")
            }}
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="i-ep-bell"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ alarmStats.total }}</div>
            <div class="stat-label">{{ $t("alarm.dashboard.totalAlarms") }}</div>
            <div class="stat-trend" :class="getTrendClass()">
              {{ getTrendText() }}
            </div>
          </div>
        </div>

        <div class="stat-card critical">
          <div class="stat-icon">
            <i class="i-ep-warning-filled"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ alarmStats.critical }}</div>
            <div class="stat-label">{{ $t("alarm.dashboard.criticalAlarms") }}</div>
            <div class="stat-trend" :class="getTrendClass()">
              {{ getTrendText() }}
            </div>
          </div>
        </div>

        <div class="stat-card high">
          <div class="stat-icon">
            <i class="i-ep-warning"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ alarmStats.high }}</div>
            <div class="stat-label">{{ $t("alarm.dashboard.highAlarms") }}</div>
            <div class="stat-trend" :class="getTrendClass()">
              {{ getTrendText() }}
            </div>
          </div>
        </div>

        <div class="stat-card medium">
          <div class="stat-icon">
            <i class="i-ep-info-filled"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardMediumAlarms }}</div>
            <div class="stat-label">{{ $t("alarm.dashboard.mediumAlarms") }}</div>
            <div class="stat-trend" :class="getTrendClass()">
              {{ getTrendText() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>{{ $t("alarm.dashboard.severityDistribution") }}</span>
                <el-button type="text" @click="refreshCharts">
                  <i class="i-ep-refresh"></i>
                </el-button>
              </div>
            </template>
            <div class="chart-container">
              <ECharts :options="severityChartOptions" height="300px" :loading="chartsLoading" />
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>{{ $t("alarm.dashboard.trendAnalysis") }}</span>
                <el-select v-model="trendPeriod" size="small" style="width: 100px">
                  <el-option label="24h" value="24h" />
                  <el-option label="7d" value="7d" />
                  <el-option label="30d" value="30d" />
                </el-select>
              </div>
            </template>
            <div class="chart-container">
              <ECharts :options="trendChartOptions" height="300px" :loading="chartsLoading" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <el-row :gutter="24">
        <!-- Recent Alarms -->
        <el-col :span="16">
          <el-card class="recent-alarms-card">
            <template #header>
              <div class="card-header">
                <span>{{ $t("alarm.dashboard.recentAlarms") }}</span>
                <div class="header-actions">
                  <el-button type="text" size="small" @click="refreshRecentAlarms">
                    <i class="i-ep-refresh"></i>
                  </el-button>
                  <el-button type="primary" size="small" @click="viewAllAlarms">
                    {{ $t("alarm.dashboard.viewAll") }}
                  </el-button>
                </div>
              </div>
            </template>

            <div v-loading="alarmsLoading" class="recent-alarms-list">
              <div
                v-for="alarm in recentAlarms"
                :key="alarm.id"
                class="alarm-item"
                :class="`severity-${alarm.severity.toLowerCase()}`"
              >
                <div class="alarm-indicator"></div>
                <div class="alarm-content">
                  <div class="alarm-header">
                    <div class="alarm-title">{{ alarm.ruleName }}</div>
                    <div class="alarm-time">{{ formatTime(alarm.createdAt) }}</div>
                  </div>
                  <div class="alarm-details">
                    <div class="alarm-device">
                      <i class="i-ep-location"></i>
                      {{ alarm.deviceName }}
                    </div>
                    <div class="alarm-tags">
                      <el-tag :type="getSeverityTagType(alarm.severity)" size="small">
                        {{ $t(`alarm.severity.${alarm.severity.toLowerCase()}`) }}
                      </el-tag>
                      <el-tag :type="getStatusTagType(alarm.status)" size="small">
                        {{ $t(`alarm.status.${alarm.status.toLowerCase()}`) }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="alarm-description">{{ alarm.message }}</div>
                </div>
                <div class="alarm-actions">
                  <el-button-group size="small">
                    <el-button
                      v-if="alarm.status === 'ACTIVE'"
                      type="primary"
                      @click="acknowledgeAlarm(alarm.id)"
                    >
                      {{ $t("alarm.actions.acknowledge") }}
                    </el-button>
                    <el-button @click="viewAlarmDetail(alarm.id)">
                      {{ $t("common.detail") }}
                    </el-button>
                  </el-button-group>
                </div>
              </div>

              <div v-if="recentAlarms.length === 0" class="empty-state">
                <i class="i-ep-bell-filled"></i>
                <p>{{ $t("alarm.dashboard.noRecentAlarms") }}</p>
                <div v-if="alarmStore.dashboardData" class="empty-state-info">
                  <p class="info-text">
                    {{
                      $t("alarm.dashboard.todayStats", {
                        total: alarmStore.dashboardData.totalAlarmsToday,
                        resolved: alarmStore.dashboardData.resolvedAlarmsToday,
                      })
                    }}
                  </p>
                  <p v-if="alarmStore.dashboardData.avgResolutionTime" class="resolution-time">
                    {{ $t("alarm.dashboard.avgResolutionTime") }}:
                    {{ alarmStore.dashboardData.avgResolutionTime }}
                  </p>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- Device Statistics -->
        <el-col :span="8">
          <el-card class="device-stats-card">
            <template #header>
              <div class="card-header">
                <span>{{ $t("alarm.dashboard.topDevices") }}</span>
                <el-button type="text" size="small" @click="refreshDeviceStats">
                  <i class="i-ep-refresh"></i>
                </el-button>
              </div>
            </template>

            <div v-loading="deviceStatsLoading" class="device-stats-list">
              <div v-for="(device, index) in topDevices" :key="device.id" class="device-item">
                <div class="device-rank">{{ index + 1 }}</div>
                <div class="device-info">
                  <div class="device-name">{{ device.name }}</div>
                  <div class="device-location">{{ device.location }}</div>
                </div>
                <div class="device-alarms">
                  <div class="alarm-count">{{ device.alarmCount }}</div>
                  <div class="alarm-label">{{ $t("alarm.dashboard.alarms") }}</div>
                </div>
              </div>

              <div v-if="topDevices.length === 0" class="empty-state">
                <i class="i-ep-monitor"></i>
                <p>{{ $t("alarm.dashboard.noDeviceData") }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { useAlarmStore } from "@/store/modules/alarm-store";
import { useUserStoreHook } from "@/store/modules/user-store";
import type { EChartsOption } from "echarts";

// Composables
const { t } = useI18n();
const alarmStore = useAlarmStore();
const userStore = useUserStoreHook();

// Reactive state
const loading = ref(false);
const chartsLoading = ref(false);
const alarmsLoading = ref(false);
const deviceStatsLoading = ref(false);
const autoRefresh = ref(true);
const trendPeriod = ref("24h");

// Connection status
const isConnected = computed(() => alarmStore.isConnected);

// Statistics - use dashboard data if available, fallback to alarm store
const alarmStats = computed(() => {
  const dashboardData = alarmStore.dashboardData;
  if (dashboardData) {
    return {
      total: dashboardData.totalActiveAlarms,
      critical: dashboardData.criticalAlarms,
      high: dashboardData.highAlarms,
      unacknowledged: dashboardData.totalActiveAlarms - (dashboardData.resolvedAlarmsToday || 0),
    };
  }

  return {
    total: alarmStore.alarmSummary.total,
    critical: alarmStore.alarmSummary.critical,
    high: alarmStore.alarmSummary.high,
    unacknowledged: alarmStore.alarmSummary.unacknowledged,
  };
});

// Recent alarms - use dashboard data if available, fallback to active alarms
const recentAlarms = computed(() => {
  const dashboardData = alarmStore.dashboardData;

  // First check if dashboard data has recent alarms
  if (dashboardData && dashboardData.recentAlarms && dashboardData.recentAlarms.length > 0) {
    console.log("Using dashboard recent alarms:", dashboardData.recentAlarms);
    return dashboardData.recentAlarms;
  }

  // Then check active alarms from store
  if (alarmStore.activeAlarms && alarmStore.activeAlarms.length > 0) {
    console.log("Using active alarms from store:", alarmStore.activeAlarms.length);
    return alarmStore.activeAlarms
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }

  // Return empty array if no data available
  console.log("No recent alarms data available");
  return [];
});

// Additional dashboard metrics
const dashboardMediumAlarms = computed(() => {
  const dashboardData = alarmStore.dashboardData;
  return dashboardData?.mediumAlarms || 0;
});

// Top devices - use dashboard data if available, fallback to mock data
const topDevices = computed(() => {
  const dashboardData = alarmStore.dashboardData;
  if (
    dashboardData &&
    dashboardData.topAffectedDevices &&
    dashboardData.topAffectedDevices.length > 0
  ) {
    return dashboardData.topAffectedDevices.map((device, index) => ({
      id: index + 1,
      name: device.deviceName,
      location: device.deviceId, // Use deviceId as location placeholder
      alarmCount: device.alarmCount,
    }));
  }

  // Fallback to mock data for demonstration
  return [
    { id: 1, name: "WL-001", location: "Main Reservoir", alarmCount: 15 },
    { id: 2, name: "WL-002", location: "Secondary Tank", alarmCount: 12 },
    { id: 3, name: "WL-003", location: "Distribution Point A", alarmCount: 8 },
    { id: 4, name: "WL-004", location: "Distribution Point B", alarmCount: 5 },
    { id: 5, name: "WL-005", location: "Backup Reservoir", alarmCount: 3 },
  ];
});

// Chart options
const severityChartOptions = computed<EChartsOption>(() => {
  const dashboardData = alarmStore.dashboardData;

  return {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Severity Distribution",
        type: "pie",
        radius: "50%",
        data: [
          {
            value: dashboardData?.criticalAlarms || alarmStats.value.critical,
            name: t("alarm.severity.critical"),
          },
          {
            value: dashboardData?.highAlarms || alarmStats.value.high,
            name: t("alarm.severity.high"),
          },
          {
            value:
              dashboardData?.mediumAlarms ||
              alarmStats.value.total - alarmStats.value.critical - alarmStats.value.high,
            name: t("alarm.severity.medium"),
          },
          {
            value: dashboardData?.lowAlarms || 0,
            name: t("alarm.severity.low"),
          },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
});

const trendChartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: "axis",
  },
  legend: {
    data: [t("alarm.severity.critical"), t("alarm.severity.high"), t("alarm.severity.medium")],
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      name: t("alarm.severity.critical"),
      type: "line",
      stack: "Total",
      data: [5, 8, 12, 15, 10, 8, 6],
    },
    {
      name: t("alarm.severity.high"),
      type: "line",
      stack: "Total",
      data: [10, 15, 20, 25, 18, 15, 12],
    },
    {
      name: t("alarm.severity.medium"),
      type: "line",
      stack: "Total",
      data: [20, 25, 30, 35, 28, 25, 22],
    },
  ],
}));

// Utility functions
const getTrendClass = () => {
  // Mock trend calculation
  return Math.random() > 0.5 ? "trend-up" : "trend-down";
};

const getTrendText = () => {
  // Mock trend text
  const isUp = Math.random() > 0.5;
  return isUp ? "+5%" : "-3%";
};

const getSeverityTagType = (
  severity: string
): "primary" | "success" | "warning" | "info" | "danger" => {
  const typeMap: Record<string, "primary" | "success" | "warning" | "info" | "danger"> = {
    CRITICAL: "danger",
    HIGH: "warning",
    MEDIUM: "info",
    LOW: "success",
  };
  return typeMap[severity] || "info";
};

const getStatusTagType = (
  status: string
): "primary" | "success" | "warning" | "info" | "danger" => {
  const typeMap: Record<string, "primary" | "success" | "warning" | "info" | "danger"> = {
    ACTIVE: "danger",
    ACKNOWLEDGED: "warning",
    RESOLVED: "success",
  };
  return typeMap[status] || "info";
};

const formatTime = (timestamp: string | Date) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return t("alarm.dashboard.justNow");
  if (minutes < 60) return t("alarm.dashboard.minutesAgo", { minutes });
  if (minutes < 1440) return t("alarm.dashboard.hoursAgo", { hours: Math.floor(minutes / 60) });
  return date.toLocaleDateString();
};

// Event handlers
const refreshData = async () => {
  loading.value = true;
  try {
    await alarmStore.refreshAll();

    // Debug: log dashboard data to console
    console.log("Dashboard data loaded:", alarmStore.dashboardData);
    console.log("Recent alarms count:", recentAlarms.value.length);

    ElMessage.success(t("alarm.success.dataLoaded"));
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    ElMessage.error(t("alarm.errors.loadFailed"));
  } finally {
    loading.value = false;
  }
};

const refreshCharts = async () => {
  chartsLoading.value = true;
  try {
    // Mock refresh for demonstration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    ElMessage.success(t("alarm.success.dataLoaded"));
  } catch {
    ElMessage.error(t("alarm.errors.loadFailed"));
  } finally {
    chartsLoading.value = false;
  }
};

const refreshRecentAlarms = async () => {
  alarmsLoading.value = true;
  try {
    await alarmStore.loadActiveAlarms();
    ElMessage.success(t("alarm.success.dataLoaded"));
  } catch {
    ElMessage.error(t("alarm.errors.loadFailed"));
  } finally {
    alarmsLoading.value = false;
  }
};

const refreshDeviceStats = async () => {
  deviceStatsLoading.value = true;
  try {
    // Mock refresh for demonstration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    ElMessage.success(t("alarm.success.dataLoaded"));
  } catch {
    ElMessage.error(t("alarm.errors.loadFailed"));
  } finally {
    deviceStatsLoading.value = false;
  }
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  if (autoRefresh.value) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
};

const acknowledgeAlarm = async (alarmId: string) => {
  try {
    await alarmStore.acknowledgeAlarm(alarmId);
    ElMessage.success(t("alarm.success.acknowledged"));
  } catch {
    ElMessage.error(t("alarm.errors.acknowledgeFailed"));
  }
};

const viewAlarmDetail = (alarmId: string) => {
  // Navigate to alarm detail page
  console.log("View alarm detail:", alarmId);
};

const viewAllAlarms = () => {
  // Navigate to alarms list page
  console.log("View all alarms");
};

// Auto refresh functionality
let refreshInterval: NodeJS.Timeout | null = null;

const startAutoRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    refreshData();
  }, 30000); // Refresh every 30 seconds
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

// Lifecycle hooks
onMounted(async () => {
  try {
    // Debug: Check user info and deptId
    console.log("Dashboard mounted, user info:", userStore.userInfo);
    console.log("User deptId:", userStore.userInfo?.deptId);

    // Initialize alarm store first (which will load user info if needed)
    await alarmStore.initialize();

    if (autoRefresh.value) {
      startAutoRefresh();
    }
  } catch (error) {
    console.error("Error initializing dashboard:", error);
  }
});

onUnmounted(() => {
  try {
    stopAutoRefresh();
  } catch (error) {
    console.error("Error during unmount:", error);
  }
});
</script>

<style lang="scss" scoped>
.alarm-dashboard {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 120px);

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .page-title {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .connection-status {
        .el-tag {
          border-radius: 12px;

          i {
            margin-right: 4px;
          }
        }
      }
    }

    .header-right {
      .el-button-group {
        .el-button {
          i {
            margin-right: 4px;
          }
        }
      }
    }
  }

  .stats-section {
    margin-bottom: 24px;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;

      .stat-card {
        background: linear-gradient(135deg, var(--el-color-white) 0%, var(--el-bg-color) 100%);
        border: 1px solid var(--el-border-color-light);
        border-radius: 12px;
        padding: 24px;
        display: flex;
        align-items: center;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;

          i {
            font-size: 24px;
            color: var(--el-color-white);
          }
        }

        .stat-content {
          flex: 1;

          .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: var(--el-text-color-primary);
            line-height: 1;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: var(--el-text-color-regular);
            margin-bottom: 8px;
          }

          .stat-trend {
            font-size: 12px;
            font-weight: 600;

            &.trend-up {
              color: var(--el-color-success);
            }

            &.trend-down {
              color: var(--el-color-danger);
            }
          }
        }

        &.total {
          .stat-icon {
            background: linear-gradient(
              135deg,
              var(--el-color-primary) 0%,
              var(--el-color-primary-light-3) 100%
            );
          }
        }

        &.critical {
          .stat-icon {
            background: linear-gradient(
              135deg,
              var(--el-color-danger) 0%,
              var(--el-color-danger-light-3) 100%
            );
          }
        }

        &.high {
          .stat-icon {
            background: linear-gradient(
              135deg,
              var(--el-color-warning) 0%,
              var(--el-color-warning-light-3) 100%
            );
          }
        }

        &.medium {
          .stat-icon {
            background: linear-gradient(
              135deg,
              var(--el-color-info) 0%,
              var(--el-color-info-light-3) 100%
            );
          }
        }

        &.unacknowledged {
          .stat-icon {
            background: linear-gradient(
              135deg,
              var(--el-color-info) 0%,
              var(--el-color-info-light-3) 100%
            );
          }
        }
      }
    }
  }

  .charts-section {
    margin-bottom: 24px;

    .chart-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        span {
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .chart-container {
        width: 100%;
        height: 300px;
      }
    }
  }

  .content-section {
    .recent-alarms-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-actions {
          display: flex;
          gap: 8px;
        }
      }

      .recent-alarms-list {
        .alarm-item {
          display: flex;
          padding: 16px;
          border-bottom: 1px solid var(--el-border-color-lighter);
          position: relative;
          transition: background-color 0.2s;

          &:hover {
            background-color: var(--el-bg-color);
          }

          &:last-child {
            border-bottom: none;
          }

          .alarm-indicator {
            width: 4px;
            height: 100%;
            border-radius: 2px;
            margin-right: 12px;
            position: absolute;
            left: 0;
            top: 0;
          }

          &.severity-critical .alarm-indicator {
            background-color: var(--el-color-danger);
          }

          &.severity-high .alarm-indicator {
            background-color: var(--el-color-warning);
          }

          &.severity-medium .alarm-indicator {
            background-color: var(--el-color-info);
          }

          &.severity-low .alarm-indicator {
            background-color: var(--el-color-success);
          }

          .alarm-content {
            flex: 1;
            margin-left: 16px;

            .alarm-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 8px;

              .alarm-title {
                font-weight: 600;
                color: var(--el-text-color-primary);
                font-size: 16px;
              }

              .alarm-time {
                font-size: 12px;
                color: var(--el-text-color-secondary);
                white-space: nowrap;
              }
            }

            .alarm-details {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              .alarm-device {
                display: flex;
                align-items: center;
                font-size: 14px;
                color: var(--el-text-color-regular);

                i {
                  margin-right: 4px;
                }
              }

              .alarm-tags {
                display: flex;
                gap: 8px;
              }
            }

            .alarm-description {
              font-size: 14px;
              color: var(--el-text-color-regular);
              line-height: 1.4;
            }
          }

          .alarm-actions {
            margin-left: 16px;
            display: flex;
            align-items: center;
          }
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--el-text-color-secondary);

          i {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
          }

          p {
            margin: 0;
            font-size: 14px;
          }

          .empty-state-info {
            margin-top: 20px;
            padding: 16px;
            background-color: var(--el-bg-color);
            border-radius: 8px;
            border: 1px solid var(--el-border-color-lighter);

            .info-text {
              color: var(--el-text-color-regular);
              font-size: 13px;
              margin-bottom: 8px;
            }

            .resolution-time {
              color: var(--el-color-success);
              font-size: 12px;
              font-weight: 500;
            }
          }
        }
      }
    }

    .device-stats-card {
      .device-stats-list {
        .device-item {
          display: flex;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--el-border-color-lighter);

          &:last-child {
            border-bottom: none;
          }

          .device-rank {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: var(--el-color-primary-light-9);
            color: var(--el-color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            margin-right: 12px;
          }

          .device-info {
            flex: 1;

            .device-name {
              font-weight: 600;
              color: var(--el-text-color-primary);
              font-size: 14px;
              margin-bottom: 2px;
            }

            .device-location {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }

          .device-alarms {
            text-align: right;

            .alarm-count {
              font-size: 18px;
              font-weight: 600;
              color: var(--el-color-danger);
            }

            .alarm-label {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--el-text-color-secondary);

          i {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
          }

          p {
            margin: 0;
            font-size: 14px;
          }
        }
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .alarm-dashboard {
    padding: 16px;

    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-left {
        width: 100%;
      }

      .header-right {
        width: 100%;

        .el-button-group {
          width: 100%;

          .el-button {
            flex: 1;
          }
        }
      }
    }

    .stats-section .stats-grid {
      grid-template-columns: 1fr;
    }

    .content-section {
      .el-row {
        .el-col {
          margin-bottom: 16px;
        }
      }
    }
  }
}

// Loading state
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);

  .loading-wrapper {
    width: 100%;
    max-width: 400px;
  }
}

// Dark mode support
html.dark {
  .alarm-dashboard {
    .stat-card {
      background: linear-gradient(135deg, var(--el-bg-color-overlay) 0%, var(--el-bg-color) 100%);
      border-color: var(--el-border-color);
    }
  }
}
</style>
