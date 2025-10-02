<!--
  Alarm Monitoring Page
  ====================
  
  Real-time alarm monitoring with filtering, search, and bulk operations.
  Provides comprehensive alarm management interface for operators.
  
  Features:
  - Real-time alarm list with WebSocket updates
  - Advanced filtering by severity, status, device, time range
  - Search functionality for quick alarm lookup
  - Bulk operations (acknowledge, resolve, export)
  - Alarm detail view and history
  - Auto-refresh and manual refresh controls
  
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025-10-02
  @version 1.0.0
-->

<template>
  <div class="alarm-monitoring">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">{{ $t("alarm.monitoring.title") }}</h2>
        <div class="connection-status">
          <el-tag :type="isConnected ? 'success' : 'danger'" size="small" effect="light">
            <i :class="isConnected ? 'i-ep-connection' : 'i-ep-warning'"></i>
            {{
              isConnected ? $t("alarm.monitoring.connected") : $t("alarm.monitoring.disconnected")
            }}
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
              autoRefresh
                ? $t("alarm.monitoring.pauseRefresh")
                : $t("alarm.monitoring.startRefresh")
            }}
          </el-button>
          <el-button type="success" :disabled="selectedAlarms.length === 0" @click="exportAlarms">
            <i class="i-ep-download"></i>
            {{ $t("alarm.monitoring.export") }}
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <el-card>
        <div class="filter-content">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-input
                v-model="searchQuery"
                :placeholder="$t('alarm.monitoring.searchPlaceholder')"
                clearable
                @input="handleSearch"
              >
                <template #prefix>
                  <i class="i-ep-search"></i>
                </template>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="filterForm.severity"
                :placeholder="$t('alarm.monitoring.severityFilter')"
                multiple
                clearable
                collapse-tags
                @change="handleFilterChange"
              >
                <el-option
                  v-for="severity in severityOptions"
                  :key="severity.value"
                  :label="severity.label"
                  :value="severity.value"
                />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="filterForm.status"
                :placeholder="$t('alarm.monitoring.statusFilter')"
                multiple
                clearable
                collapse-tags
                @change="handleFilterChange"
              >
                <el-option
                  v-for="status in statusOptions"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="filterForm.deviceIds"
                :placeholder="$t('alarm.monitoring.deviceFilter')"
                multiple
                clearable
                collapse-tags
                filterable
                @change="handleFilterChange"
              >
                <el-option
                  v-for="device in deviceOptions"
                  :key="device.value"
                  :label="device.label"
                  :value="device.value"
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-date-picker
                v-model="dateRange"
                type="datetimerange"
                :range-separator="$t('common.to')"
                :start-placeholder="$t('common.startDate')"
                :end-placeholder="$t('common.endDate')"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="handleDateRangeChange"
              />
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- Statistics Bar -->
    <div class="stats-bar">
      <div class="stats-items">
        <div class="stat-item">
          <span class="stat-label">{{ $t("alarm.monitoring.totalAlarms") }}:</span>
          <span class="stat-value total">{{ alarmSummary.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ $t("alarm.monitoring.criticalAlarms") }}:</span>
          <span class="stat-value critical">{{ alarmSummary.critical }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ $t("alarm.monitoring.highAlarms") }}:</span>
          <span class="stat-value high">{{ alarmSummary.high }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">{{ $t("alarm.monitoring.unacknowledged") }}:</span>
          <span class="stat-value unacknowledged">{{ alarmSummary.unacknowledged }}</span>
        </div>
      </div>
      <div v-if="selectedAlarms.length > 0" class="stats-actions">
        <el-button-group size="small">
          <el-button type="primary" @click="bulkAcknowledge">
            <i class="i-ep-check"></i>
            {{ $t("alarm.monitoring.bulkAcknowledge") }} ({{ selectedAlarms.length }})
          </el-button>
          <el-button type="success" @click="bulkResolve">
            <i class="i-ep-circle-check"></i>
            {{ $t("alarm.monitoring.bulkResolve") }} ({{ selectedAlarms.length }})
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- Alarm Table -->
    <div class="table-section">
      <el-card>
        <el-table
          ref="alarmTableRef"
          v-loading="loading"
          :data="filteredAlarms"
          row-key="id"
          default-expand-all
          :height="tableHeight"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column
            prop="severity"
            :label="$t('alarm.monitoring.severity')"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <el-tag :type="getSeverityTagType(row.severity)" size="small">
                {{ $t(`alarm.severity.${row.severity.toLowerCase()}`) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="ruleName" :label="$t('alarm.monitoring.ruleName')" min-width="200">
            <template #default="{ row }">
              <div class="rule-name">
                <span class="rule-title">{{ row.ruleName }}</span>
                <div class="rule-meta">
                  <span class="device-name">{{ row.deviceName }}</span>
                  <span class="metric-name">{{ row.metricName }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="message" :label="$t('alarm.monitoring.message')" min-width="300">
            <template #default="{ row }">
              <div class="alarm-message">
                {{ row.message }}
                <div class="threshold-info">
                  {{ $t("alarm.monitoring.threshold") }}: {{ row.threshold }} |
                  {{ $t("alarm.monitoring.currentValue") }}: {{ row.triggerValue }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            :label="$t('alarm.monitoring.status')"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)" size="small">
                {{ $t(`alarm.status.${row.status.toLowerCase()}`) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" :label="$t('alarm.monitoring.createdAt')" width="180">
            <template #default="{ row }">
              <div class="time-info">
                <div class="created-time">{{ formatDateTime(row.createdAt) }}</div>
                <div class="relative-time">{{ getRelativeTime(row.createdAt) }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.actions')" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button-group size="small">
                <el-button
                  v-if="row.status === 'ACTIVE'"
                  type="primary"
                  @click.stop="acknowledgeAlarm(row.id)"
                >
                  {{ $t("alarm.actions.acknowledge") }}
                </el-button>
                <el-button
                  v-if="row.status === 'ACKNOWLEDGED'"
                  type="success"
                  @click.stop="resolveAlarm(row.id)"
                >
                  {{ $t("alarm.actions.resolve") }}
                </el-button>
                <el-button @click.stop="viewAlarmDetail(row)">
                  {{ $t("common.detail") }}
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalFilteredAlarms.length"
            :page-sizes="[20, 50, 100, 200]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- Alarm Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="$t('alarm.monitoring.alarmDetail')"
      width="800px"
      :before-close="handleDetailDialogClose"
    >
      <div v-if="selectedAlarmDetail" class="alarm-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('alarm.monitoring.ruleId')">
            {{ selectedAlarmDetail.ruleId }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('alarm.monitoring.ruleName')">
            {{ selectedAlarmDetail.ruleName }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('alarm.monitoring.deviceName')">
            {{ selectedAlarmDetail.deviceName }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('alarm.monitoring.metricName')">
            {{ selectedAlarmDetail.metricName }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('alarm.monitoring.severity')">
            <el-tag :type="getSeverityTagType(selectedAlarmDetail.severity)">
              {{ $t(`alarm.severity.${selectedAlarmDetail.severity.toLowerCase()}`) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('alarm.monitoring.status')">
            <el-tag :type="getStatusTagType(selectedAlarmDetail.status)">
              {{ $t(`alarm.status.${selectedAlarmDetail.status.toLowerCase()}`) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('alarm.monitoring.threshold')">
            {{ selectedAlarmDetail.threshold }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('alarm.monitoring.triggerValue')">
            {{ selectedAlarmDetail.triggerValue }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('alarm.monitoring.createdAt')" :span="2">
            {{ formatDateTime(selectedAlarmDetail.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="selectedAlarmDetail.acknowledgedAt"
            :label="$t('alarm.monitoring.acknowledgedAt')"
            :span="2"
          >
            {{ formatDateTime(selectedAlarmDetail.acknowledgedAt) }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="selectedAlarmDetail.resolvedAt"
            :label="$t('alarm.monitoring.resolvedAt')"
            :span="2"
          >
            {{ formatDateTime(selectedAlarmDetail.resolvedAt) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('alarm.monitoring.message')" :span="2">
            {{ selectedAlarmDetail.message }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDetailDialogClose">{{ $t("common.close") }}</el-button>
          <el-button
            v-if="selectedAlarmDetail && selectedAlarmDetail.status === 'ACTIVE'"
            type="primary"
            @click="acknowledgeAlarmFromDetail"
          >
            {{ $t("alarm.actions.acknowledge") }}
          </el-button>
          <el-button
            v-if="selectedAlarmDetail && selectedAlarmDetail.status === 'ACKNOWLEDGED'"
            type="success"
            @click="resolveAlarmFromDetail"
          >
            {{ $t("alarm.actions.resolve") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAlarmStore } from "@/store/modules/alarm-store";
import type { AlarmEventPageVO } from "@/api/iot/alarm-api";

// Composables
const { t } = useI18n();
const alarmStore = useAlarmStore();

// Reactive state
const loading = ref(false);
const autoRefresh = ref(true);
const searchQuery = ref("");
const dateRange = ref<[string, string] | null>(null);
const selectedAlarms = ref<AlarmEventPageVO[]>([]);
const detailDialogVisible = ref(false);
const selectedAlarmDetail = ref<AlarmEventPageVO | null>(null);
const alarmTableRef = ref();

// Pagination
const currentPage = ref(1);
const pageSize = ref(20);
const tableHeight = ref(600);

// Total count computed from filtered results
const totalFilteredAlarms = computed(() => {
  let alarms = [...alarmStore.activeAlarms];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    alarms = alarms.filter(
      (alarm) =>
        alarm.ruleName.toLowerCase().includes(query) ||
        alarm.deviceName.toLowerCase().includes(query) ||
        alarm.message.toLowerCase().includes(query)
    );
  }

  // Apply filters
  if (filterForm.value.severity.length > 0) {
    alarms = alarms.filter((alarm) => filterForm.value.severity.includes(alarm.severity));
  }

  if (filterForm.value.status.length > 0) {
    alarms = alarms.filter((alarm) => filterForm.value.status.includes(alarm.status));
  }

  if (filterForm.value.deviceIds.length > 0) {
    alarms = alarms.filter((alarm) => filterForm.value.deviceIds.includes(alarm.deviceId));
  }

  // Apply date range filter
  if (dateRange.value) {
    const [startDate, endDate] = dateRange.value;
    alarms = alarms.filter((alarm) => {
      const createdAt = new Date(alarm.createdAt);
      return createdAt >= new Date(startDate) && createdAt <= new Date(endDate);
    });
  }

  return alarms;
});

// Filter form
const filterForm = ref({
  severity: [] as string[],
  status: [] as string[],
  deviceIds: [] as string[],
});

// Connection status
const isConnected = computed(() => alarmStore.isConnected);

// Alarm summary
const alarmSummary = computed(() => alarmStore.alarmSummary);

// Filtered alarms
const filteredAlarms = computed(() => {
  const allFiltered = totalFilteredAlarms.value;

  // Apply pagination
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return allFiltered.slice(start, end);
});

// Options for filters
const severityOptions = computed(() => [
  { label: t("alarm.severity.critical"), value: "CRITICAL" },
  { label: t("alarm.severity.high"), value: "HIGH" },
  { label: t("alarm.severity.medium"), value: "MEDIUM" },
  { label: t("alarm.severity.low"), value: "LOW" },
]);

const statusOptions = computed(() => [
  { label: t("alarm.status.active"), value: "ACTIVE" },
  { label: t("alarm.status.acknowledged"), value: "ACKNOWLEDGED" },
  { label: t("alarm.status.resolved"), value: "RESOLVED" },
]);

const deviceOptions = computed(() => {
  // Get unique devices from alarms
  const devices = new Map();
  alarmStore.activeAlarms.forEach((alarm) => {
    if (!devices.has(alarm.deviceId)) {
      devices.set(alarm.deviceId, {
        value: alarm.deviceId,
        label: alarm.deviceName,
      });
    }
  });
  return Array.from(devices.values());
});

// Utility functions
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

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString();
};

const getRelativeTime = (dateTime: string) => {
  const now = new Date();
  const time = new Date(dateTime);
  const diff = now.getTime() - time.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return t("alarm.monitoring.justNow");
  if (minutes < 60) return t("alarm.monitoring.minutesAgo", { minutes });
  if (minutes < 1440) return t("alarm.monitoring.hoursAgo", { hours: Math.floor(minutes / 60) });
  return t("alarm.monitoring.daysAgo", { days: Math.floor(minutes / 1440) });
};

// Event handlers
const refreshData = async () => {
  loading.value = true;
  try {
    await alarmStore.loadActiveAlarms();
    ElMessage.success(t("alarm.success.dataLoaded"));
  } catch {
    ElMessage.error(t("alarm.errors.loadFailed"));
  } finally {
    loading.value = false;
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

const handleSearch = () => {
  currentPage.value = 1;
};

const handleFilterChange = () => {
  currentPage.value = 1;
};

const handleDateRangeChange = () => {
  currentPage.value = 1;
};

const handleSelectionChange = (selection: AlarmEventPageVO[]) => {
  selectedAlarms.value = selection;
};

const handleRowClick = (row: AlarmEventPageVO) => {
  viewAlarmDetail(row);
};

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
};

const acknowledgeAlarm = async (alarmId: string) => {
  try {
    await alarmStore.acknowledgeAlarm(alarmId);
    ElMessage.success(t("alarm.success.acknowledged"));
    await refreshData();
  } catch {
    ElMessage.error(t("alarm.errors.acknowledgeFailed"));
  }
};

const resolveAlarm = async (alarmId: string) => {
  try {
    await alarmStore.resolveAlarm(alarmId);
    ElMessage.success(t("alarm.success.resolved"));
    await refreshData();
  } catch {
    ElMessage.error(t("alarm.errors.resolveFailed"));
  }
};

const bulkAcknowledge = async () => {
  if (selectedAlarms.value.length === 0) return;

  try {
    await ElMessageBox.confirm(
      t("alarm.monitoring.bulkAcknowledgeConfirm", { count: selectedAlarms.value.length }),
      t("common.confirm"),
      {
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
        type: "warning",
      }
    );

    const alarmIds = selectedAlarms.value.map((alarm) => alarm.id);
    await Promise.all(alarmIds.map((id) => alarmStore.acknowledgeAlarm(id)));
    ElMessage.success(t("alarm.success.bulkAcknowledged"));
    await refreshData();
    selectedAlarms.value = [];
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(t("alarm.errors.bulkAcknowledgeFailed"));
    }
  }
};

const bulkResolve = async () => {
  if (selectedAlarms.value.length === 0) return;

  try {
    await ElMessageBox.confirm(
      t("alarm.monitoring.bulkResolveConfirm", { count: selectedAlarms.value.length }),
      t("common.confirm"),
      {
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
        type: "warning",
      }
    );

    const alarmIds = selectedAlarms.value.map((alarm) => alarm.id);
    await Promise.all(alarmIds.map((id) => alarmStore.resolveAlarm(id)));
    ElMessage.success(t("alarm.success.bulkResolved"));
    await refreshData();
    selectedAlarms.value = [];
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(t("alarm.errors.bulkResolveFailed"));
    }
  }
};

const exportAlarms = async () => {
  if (selectedAlarms.value.length === 0) {
    ElMessage.warning(t("alarm.monitoring.selectAlarmsToExport"));
    return;
  }

  try {
    // Implementation for export functionality - mock for now
    const data = JSON.stringify(selectedAlarms.value, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alarms_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ElMessage.success(t("alarm.success.exported"));
  } catch {
    ElMessage.error(t("alarm.errors.exportFailed"));
  }
};

const viewAlarmDetail = (alarm: AlarmEventPageVO) => {
  selectedAlarmDetail.value = alarm;
  detailDialogVisible.value = true;
};

const handleDetailDialogClose = () => {
  detailDialogVisible.value = false;
  selectedAlarmDetail.value = null;
};

const acknowledgeAlarmFromDetail = async () => {
  if (!selectedAlarmDetail.value) return;

  try {
    await acknowledgeAlarm(selectedAlarmDetail.value.id);
    handleDetailDialogClose();
  } catch {
    // Error handled in acknowledgeAlarm function
  }
};

const resolveAlarmFromDetail = async () => {
  if (!selectedAlarmDetail.value) return;

  try {
    await resolveAlarm(selectedAlarmDetail.value.id);
    handleDetailDialogClose();
  } catch {
    // Error handled in resolveAlarm function
  }
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

// Calculate table height based on window size
const calculateTableHeight = () => {
  const windowHeight = window.innerHeight;
  // Reserve space for header, filters, stats bar, pagination
  const reservedHeight = 400;
  tableHeight.value = Math.max(400, windowHeight - reservedHeight);
};

// Lifecycle hooks
onMounted(async () => {
  await refreshData();
  if (autoRefresh.value) {
    startAutoRefresh();
  }

  // Calculate initial table height
  await nextTick();
  calculateTableHeight();

  // Listen for window resize
  window.addEventListener("resize", calculateTableHeight);
});

onUnmounted(() => {
  stopAutoRefresh();
  window.removeEventListener("resize", calculateTableHeight);
});
</script>

<style lang="scss" scoped>
.alarm-monitoring {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 120px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

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

  .filter-section {
    margin-bottom: 16px;

    .filter-content {
      .el-row {
        align-items: center;
      }
    }
  }

  .stats-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: var(--el-color-white);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    margin-bottom: 16px;

    .stats-items {
      display: flex;
      gap: 32px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .stat-label {
          font-size: 14px;
          color: var(--el-text-color-regular);
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;

          &.total {
            color: var(--el-color-primary);
          }

          &.critical {
            color: var(--el-color-danger);
          }

          &.high {
            color: var(--el-color-warning);
          }

          &.unacknowledged {
            color: var(--el-color-info);
          }
        }
      }
    }

    .stats-actions {
      .el-button-group {
        .el-button {
          i {
            margin-right: 4px;
          }
        }
      }
    }
  }

  .table-section {
    .el-table {
      .rule-name {
        .rule-title {
          font-weight: 600;
          color: var(--el-text-color-primary);
          display: block;
          margin-bottom: 4px;
        }

        .rule-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--el-text-color-secondary);

          .device-name {
            &::before {
              content: "📍 ";
            }
          }

          .metric-name {
            &::before {
              content: "📊 ";
            }
          }
        }
      }

      .alarm-message {
        .threshold-info {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-top: 4px;
        }
      }

      .time-info {
        .created-time {
          font-size: 14px;
          color: var(--el-text-color-primary);
        }

        .relative-time {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-top: 2px;
        }
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }

  .alarm-detail {
    .el-descriptions {
      margin-top: 20px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

// Responsive design
@media (max-width: 1200px) {
  .alarm-monitoring {
    padding: 16px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-left,
      .header-right {
        width: 100%;
      }

      .header-right {
        .el-button-group {
          width: 100%;

          .el-button {
            flex: 1;
          }
        }
      }
    }

    .stats-bar {
      flex-direction: column;
      gap: 16px;

      .stats-items {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  }
}

@media (max-width: 768px) {
  .alarm-monitoring {
    .filter-section {
      .filter-content {
        .el-row {
          .el-col {
            margin-bottom: 12px;
          }
        }
      }
    }

    .stats-bar {
      .stats-items {
        flex-direction: column;
        gap: 12px;
      }
    }
  }
}

// Dark mode support
html.dark {
  .alarm-monitoring {
    .stats-bar {
      background: var(--el-bg-color-overlay);
      border-color: var(--el-border-color);
    }
  }
}
</style>
