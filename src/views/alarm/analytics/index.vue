<!--
  Alarm Analytics Page
  ====================
  
  Analytics and reporting for alarm system performance and trends.
  Provides comprehensive insights into alarm patterns, response times,
  and system effectiveness.
  
  Features:
  - Alarm trend analysis
  - Performance metrics
  - Response time analysis
  - Device reliability metrics
  - Custom report generation
  - Data visualization
  
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025-10-02
  @version 1.0.0
-->

<template>
  <div class="alarm-analytics">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">{{ $t("alarm.analytics.title") }}</h2>
        <div class="description">
          {{ $t("alarm.analytics.description") }}
        </div>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button @click="exportReport">
            <i class="i-ep-download"></i>
            {{ $t("alarm.analytics.exportReport") }}
          </el-button>
          <el-button type="primary" @click="generateReport">
            <i class="i-ep-document"></i>
            {{ $t("alarm.analytics.generateReport") }}
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- Time Range Selector -->
    <div class="time-range-section">
      <el-card>
        <div class="time-range-controls">
          <div class="quick-ranges">
            <span class="label">{{ $t("alarm.analytics.quickRanges") }}:</span>
            <el-button-group size="small">
              <el-button
                v-for="range in quickRanges"
                :key="range.value"
                :type="selectedRange === range.value ? 'primary' : 'default'"
                @click="selectTimeRange(range.value)"
              >
                {{ $t(range.label) }}
              </el-button>
            </el-button-group>
          </div>
          <div class="custom-range">
            <el-date-picker
              v-model="customDateRange"
              type="datetimerange"
              :shortcuts="datePickerShortcuts"
              range-separator="→"
              :start-placeholder="$t('common.startTime')"
              :end-placeholder="$t('common.endTime')"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              @change="handleCustomRangeChange"
            />
          </div>
          <div class="refresh-controls">
            <el-button :loading="loading" @click="refreshData">
              <i class="i-ep-refresh"></i>
              {{ $t("common.refresh") }}
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Overview Metrics -->
    <div class="overview-section">
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-icon total">
              <i class="i-ep-warning"></i>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ overviewMetrics.totalAlarms }}</div>
              <div class="metric-label">{{ $t("alarm.analytics.totalAlarms") }}</div>
              <div class="metric-change" :class="{ positive: overviewMetrics.alarmTrend > 0 }">
                <i :class="overviewMetrics.alarmTrend > 0 ? 'i-ep-top' : 'i-ep-bottom'"></i>
                {{ Math.abs(overviewMetrics.alarmTrend) }}%
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-icon avg-response">
              <i class="i-ep-timer"></i>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ overviewMetrics.avgResponseTime }}s</div>
              <div class="metric-label">{{ $t("alarm.analytics.avgResponseTime") }}</div>
              <div class="metric-change" :class="{ negative: overviewMetrics.responseTrend > 0 }">
                <i :class="overviewMetrics.responseTrend > 0 ? 'i-ep-top' : 'i-ep-bottom'"></i>
                {{ Math.abs(overviewMetrics.responseTrend) }}%
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-icon resolution-rate">
              <i class="i-ep-circle-check"></i>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ overviewMetrics.resolutionRate }}%</div>
              <div class="metric-label">{{ $t("alarm.analytics.resolutionRate") }}</div>
              <div class="metric-change" :class="{ positive: overviewMetrics.resolutionTrend > 0 }">
                <i :class="overviewMetrics.resolutionTrend > 0 ? 'i-ep-top' : 'i-ep-bottom'"></i>
                {{ Math.abs(overviewMetrics.resolutionTrend) }}%
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-icon false-positive">
              <i class="i-ep-close"></i>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ overviewMetrics.falsePositiveRate }}%</div>
              <div class="metric-label">{{ $t("alarm.analytics.falsePositiveRate") }}</div>
              <div
                class="metric-change"
                :class="{ negative: overviewMetrics.falsePositiveTrend > 0 }"
              >
                <i :class="overviewMetrics.falsePositiveTrend > 0 ? 'i-ep-top' : 'i-ep-bottom'"></i>
                {{ Math.abs(overviewMetrics.falsePositiveTrend) }}%
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <el-row :gutter="24">
        <!-- Alarm Trend Chart -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>{{ $t("alarm.analytics.alarmTrend") }}</span>
                <el-select v-model="trendChartType" size="small" style="width: 120px">
                  <el-option :label="$t('alarm.analytics.hourly')" value="hourly" />
                  <el-option :label="$t('alarm.analytics.daily')" value="daily" />
                  <el-option :label="$t('alarm.analytics.weekly')" value="weekly" />
                </el-select>
              </div>
            </template>
            <div v-loading="loading" class="chart-container">
              <ECharts :options="alarmTrendChartOption" height="350px" />
            </div>
          </el-card>
        </el-col>

        <!-- Severity Distribution Chart -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>{{ $t("alarm.analytics.severityDistribution") }}</span>
            </template>
            <div v-loading="loading" class="chart-container">
              <ECharts :options="severityDistributionChartOption" height="350px" />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="24" style="margin-top: 24px">
        <!-- Response Time Chart -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>{{ $t("alarm.analytics.responseTimeAnalysis") }}</span>
            </template>
            <div v-loading="loading" class="chart-container">
              <ECharts :options="responseTimeChartOption" height="350px" />
            </div>
          </el-card>
        </el-col>

        <!-- Device Reliability Chart -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>{{ $t("alarm.analytics.deviceReliability") }}</span>
            </template>
            <div v-loading="loading" class="chart-container">
              <ECharts :options="deviceReliabilityChartOption" height="350px" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Detailed Analytics Tables -->
    <div class="tables-section">
      <el-row :gutter="24">
        <!-- Top Alarm Sources -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>{{ $t("alarm.analytics.topAlarmSources") }}</span>
            </template>
            <el-table :data="topAlarmSources" style="width: 100%" max-height="400">
              <el-table-column
                prop="deviceName"
                :label="$t('alarm.analytics.device')"
                min-width="150"
              />
              <el-table-column
                prop="alarmCount"
                :label="$t('alarm.analytics.alarmCount')"
                width="100"
                align="center"
              />
              <el-table-column
                prop="avgResponseTime"
                :label="$t('alarm.analytics.avgResponseTime')"
                width="120"
                align="center"
              >
                <template #default="{ row }">{{ row.avgResponseTime }}s</template>
              </el-table-column>
              <el-table-column
                prop="resolutionRate"
                :label="$t('alarm.analytics.resolutionRate')"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  <el-tag :type="getResolutionRateType(row.resolutionRate)">
                    {{ row.resolutionRate }}%
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <!-- Alarm Categories -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>{{ $t("alarm.analytics.alarmCategories") }}</span>
            </template>
            <el-table :data="alarmCategories" style="width: 100%" max-height="400">
              <el-table-column
                prop="category"
                :label="$t('alarm.analytics.category')"
                min-width="150"
              />
              <el-table-column
                prop="count"
                :label="$t('alarm.analytics.count')"
                width="80"
                align="center"
              />
              <el-table-column
                prop="percentage"
                :label="$t('alarm.analytics.percentage')"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  <div class="percentage-bar">
                    <div class="percentage-fill" :style="{ width: row.percentage + '%' }"></div>
                    <span class="percentage-text">{{ row.percentage }}%</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="trend"
                :label="$t('alarm.analytics.trend')"
                width="80"
                align="center"
              >
                <template #default="{ row }">
                  <i
                    :class="[
                      row.trend > 0 ? 'i-ep-top' : 'i-ep-bottom',
                      row.trend > 0 ? 'trend-up' : 'trend-down',
                    ]"
                  ></i>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Custom Report Builder -->
    <div class="report-builder-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>{{ $t("alarm.analytics.customReportBuilder") }}</span>
            <el-button type="primary" size="small" @click="showReportBuilder = !showReportBuilder">
              <i :class="showReportBuilder ? 'i-ep-arrow-up' : 'i-ep-arrow-down'"></i>
              {{ showReportBuilder ? $t("common.collapse") : $t("common.expand") }}
            </el-button>
          </div>
        </template>

        <div v-show="showReportBuilder" class="report-builder">
          <el-row :gutter="24">
            <el-col :span="8">
              <div class="builder-section">
                <h4>{{ $t("alarm.analytics.metrics") }}</h4>
                <el-checkbox-group v-model="reportConfig.metrics">
                  <el-checkbox
                    v-for="metric in availableMetrics"
                    :key="metric.value"
                    :label="metric.value"
                    :value="metric.value"
                  >
                    {{ $t(metric.label) }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="builder-section">
                <h4>{{ $t("alarm.analytics.dimensions") }}</h4>
                <el-checkbox-group v-model="reportConfig.dimensions">
                  <el-checkbox
                    v-for="dimension in availableDimensions"
                    :key="dimension.value"
                    :label="dimension.value"
                    :value="dimension.value"
                  >
                    {{ $t(dimension.label) }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="builder-section">
                <h4>{{ $t("alarm.analytics.filters") }}</h4>
                <div class="filter-group">
                  <label>{{ $t("alarm.analytics.severity") }}:</label>
                  <el-select
                    v-model="reportConfig.filters.severity"
                    multiple
                    collapse-tags
                    :placeholder="$t('common.selectAll')"
                  >
                    <el-option
                      v-for="severity in severityOptions"
                      :key="severity.value"
                      :label="$t(severity.label)"
                      :value="severity.value"
                    />
                  </el-select>
                </div>
                <div class="filter-group">
                  <label>{{ $t("alarm.analytics.devices") }}:</label>
                  <el-select
                    v-model="reportConfig.filters.devices"
                    multiple
                    collapse-tags
                    :placeholder="$t('common.selectAll')"
                  >
                    <el-option
                      v-for="device in deviceOptions"
                      :key="device.value"
                      :label="device.label"
                      :value="device.value"
                    />
                  </el-select>
                </div>
              </div>
            </el-col>
          </el-row>

          <div class="builder-actions">
            <el-button :loading="generatingPreview" @click="previewReport">
              <i class="i-ep-view"></i>
              {{ $t("alarm.analytics.preview") }}
            </el-button>
            <el-button type="primary" :loading="generatingReport" @click="generateCustomReport">
              <i class="i-ep-document"></i>
              {{ $t("alarm.analytics.generate") }}
            </el-button>
            <el-button @click="saveReportTemplate">
              <i class="i-ep-folder"></i>
              {{ $t("alarm.analytics.saveTemplate") }}
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import ECharts from "@/components/ECharts/index.vue";

// Composables
const { t } = useI18n();

// Reactive state
const loading = ref(false);
const selectedRange = ref("last7days");
const customDateRange = ref<[string, string]>();
const trendChartType = ref("daily");
const showReportBuilder = ref(false);
const generatingPreview = ref(false);
const generatingReport = ref(false);

// Report configuration
const reportConfig = ref({
  metrics: ["alarmCount", "responseTime"],
  dimensions: ["severity", "deviceType"],
  filters: {
    severity: [],
    devices: [],
  },
});

// Quick time ranges
const quickRanges = [
  { value: "last24hours", label: "alarm.analytics.last24Hours" },
  { value: "last7days", label: "alarm.analytics.last7Days" },
  { value: "last30days", label: "alarm.analytics.last30Days" },
  { value: "last3months", label: "alarm.analytics.last3Months" },
];

// Date picker shortcuts
const datePickerShortcuts = [
  {
    text: t("alarm.analytics.last7Days"),
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: t("alarm.analytics.last30Days"),
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
];

// Mock data for analytics
const overviewMetrics = ref({
  totalAlarms: 1847,
  alarmTrend: 12.5,
  avgResponseTime: 3.2,
  responseTrend: -8.3,
  resolutionRate: 89.4,
  resolutionTrend: 5.1,
  falsePositiveRate: 7.2,
  falsePositiveTrend: -2.8,
});

const topAlarmSources = ref([
  {
    deviceName: "Water Level Sensor #001",
    alarmCount: 45,
    avgResponseTime: 2.1,
    resolutionRate: 95,
  },
  { deviceName: "Pressure Monitor #003", alarmCount: 38, avgResponseTime: 3.5, resolutionRate: 87 },
  { deviceName: "Flow Meter #007", alarmCount: 32, avgResponseTime: 4.2, resolutionRate: 82 },
  {
    deviceName: "Temperature Sensor #012",
    alarmCount: 28,
    avgResponseTime: 1.8,
    resolutionRate: 93,
  },
  { deviceName: "pH Sensor #018", alarmCount: 25, avgResponseTime: 2.9, resolutionRate: 89 },
]);

const alarmCategories = ref([
  { category: "Sensor Malfunction", count: 156, percentage: 42, trend: -5.2 },
  { category: "Communication Error", count: 89, percentage: 24, trend: 3.1 },
  { category: "Threshold Exceeded", count: 67, percentage: 18, trend: 8.7 },
  { category: "Power Issue", count: 34, percentage: 9, trend: -1.5 },
  { category: "Calibration Required", count: 25, percentage: 7, trend: 2.3 },
]);

// Chart options
const availableMetrics = [
  { value: "alarmCount", label: "alarm.analytics.alarmCount" },
  { value: "responseTime", label: "alarm.analytics.responseTime" },
  { value: "resolutionRate", label: "alarm.analytics.resolutionRate" },
  { value: "falsePositiveRate", label: "alarm.analytics.falsePositiveRate" },
];

const availableDimensions = [
  { value: "severity", label: "alarm.analytics.severity" },
  { value: "deviceType", label: "alarm.analytics.deviceType" },
  { value: "location", label: "alarm.analytics.location" },
  { value: "timeOfDay", label: "alarm.analytics.timeOfDay" },
];

const severityOptions = [
  { value: "CRITICAL", label: "alarm.severity.critical" },
  { value: "HIGH", label: "alarm.severity.high" },
  { value: "MEDIUM", label: "alarm.severity.medium" },
  { value: "LOW", label: "alarm.severity.low" },
];

const deviceOptions = ref([
  { value: "water-level-001", label: "Water Level Sensor #001" },
  { value: "pressure-003", label: "Pressure Monitor #003" },
  { value: "flow-007", label: "Flow Meter #007" },
]);

const alarmTrendChartOption = computed(() => ({
  title: {
    text: t("alarm.analytics.alarmTrendOverTime"),
    textStyle: {
      fontSize: 14,
      fontWeight: "normal",
    },
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
    },
  },
  legend: {
    data: [
      t("alarm.severity.critical"),
      t("alarm.severity.high"),
      t("alarm.severity.medium"),
      t("alarm.severity.low"),
    ],
    bottom: 0,
  },
  xAxis: {
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  yAxis: {
    type: "value",
    name: t("alarm.analytics.alarmCount"),
  },
  series: [
    {
      name: t("alarm.severity.critical"),
      type: "line",
      data: [12, 8, 15, 10, 18, 6, 14],
      itemStyle: { color: "#f56c6c" },
    },
    {
      name: t("alarm.severity.high"),
      type: "line",
      data: [25, 20, 32, 28, 35, 18, 28],
      itemStyle: { color: "#e6a23c" },
    },
    {
      name: t("alarm.severity.medium"),
      type: "line",
      data: [45, 38, 52, 48, 58, 35, 48],
      itemStyle: { color: "#409eff" },
    },
    {
      name: t("alarm.severity.low"),
      type: "line",
      data: [68, 58, 75, 72, 85, 52, 72],
      itemStyle: { color: "#67c23a" },
    },
  ],
}));

const severityDistributionChartOption = computed(() => ({
  title: {
    text: t("alarm.analytics.alarmBySeverity"),
    left: "center",
    textStyle: {
      fontSize: 14,
      fontWeight: "normal",
    },
  },
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b}: {c} ({d}%)",
  },
  legend: {
    orient: "vertical",
    left: "left",
    data: [
      t("alarm.severity.critical"),
      t("alarm.severity.high"),
      t("alarm.severity.medium"),
      t("alarm.severity.low"),
    ],
  },
  series: [
    {
      name: t("alarm.analytics.alarmDistribution"),
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: "18",
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 83, name: t("alarm.severity.critical"), itemStyle: { color: "#f56c6c" } },
        { value: 156, name: t("alarm.severity.high"), itemStyle: { color: "#e6a23c" } },
        { value: 298, name: t("alarm.severity.medium"), itemStyle: { color: "#409eff" } },
        { value: 425, name: t("alarm.severity.low"), itemStyle: { color: "#67c23a" } },
      ],
    },
  ],
}));

const responseTimeChartOption = computed(() => ({
  title: {
    text: t("alarm.analytics.responseTimeDistribution"),
    textStyle: {
      fontSize: 14,
      fontWeight: "normal",
    },
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  xAxis: {
    type: "category",
    data: ["0-1s", "1-3s", "3-5s", "5-10s", "10-30s", ">30s"],
  },
  yAxis: {
    type: "value",
    name: t("alarm.analytics.count"),
  },
  series: [
    {
      name: t("alarm.analytics.responseTime"),
      type: "bar",
      data: [245, 189, 123, 87, 45, 23],
      itemStyle: {
        color: new (window as any).echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "#409eff" },
          { offset: 1, color: "#67c23a" },
        ]),
      },
    },
  ],
}));

const deviceReliabilityChartOption = computed(() => ({
  title: {
    text: t("alarm.analytics.deviceReliabilityScore"),
    textStyle: {
      fontSize: 14,
      fontWeight: "normal",
    },
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  xAxis: {
    type: "value",
    max: 100,
  },
  yAxis: {
    type: "category",
    data: ["Water Level #001", "Pressure #003", "Flow #007", "Temp #012", "pH #018"],
  },
  series: [
    {
      name: t("alarm.analytics.reliabilityScore"),
      type: "bar",
      data: [95, 87, 82, 93, 89],
      itemStyle: {
        color: (params: any) => {
          const score = params.value;
          if (score >= 90) return "#67c23a";
          if (score >= 80) return "#e6a23c";
          return "#f56c6c";
        },
      },
    },
  ],
}));

// Utility functions
const getResolutionRateType = (rate: number) => {
  if (rate >= 90) return "success";
  if (rate >= 70) return "warning";
  return "danger";
};

// Event handlers
const selectTimeRange = (range: string) => {
  selectedRange.value = range;
  refreshData();
};

const handleCustomRangeChange = () => {
  selectedRange.value = "custom";
  refreshData();
};

const refreshData = async () => {
  loading.value = true;
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    ElMessage.success(t("alarm.success.dataLoaded"));
  } catch {
    ElMessage.error(t("alarm.errors.loadFailed"));
  } finally {
    loading.value = false;
  }
};

const exportReport = () => {
  // Export current report as PDF/Excel
  const reportData = {
    overviewMetrics: overviewMetrics.value,
    topAlarmSources: topAlarmSources.value,
    alarmCategories: alarmCategories.value,
    timeRange: selectedRange.value,
    generatedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(reportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `alarm-analytics-report-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  ElMessage.success(t("alarm.success.reportExported"));
};

const generateReport = async () => {
  generatingReport.value = true;
  try {
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    ElMessage.success(t("alarm.success.reportGenerated"));
  } catch {
    ElMessage.error(t("alarm.errors.reportGenerationFailed"));
  } finally {
    generatingReport.value = false;
  }
};

const previewReport = async () => {
  generatingPreview.value = true;
  try {
    // Simulate preview generation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    ElMessage.success(t("alarm.success.previewGenerated"));
  } catch {
    ElMessage.error(t("alarm.errors.previewFailed"));
  } finally {
    generatingPreview.value = false;
  }
};

const generateCustomReport = async () => {
  generatingReport.value = true;
  try {
    // Simulate custom report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    ElMessage.success(t("alarm.success.customReportGenerated"));
  } catch {
    ElMessage.error(t("alarm.errors.reportGenerationFailed"));
  } finally {
    generatingReport.value = false;
  }
};

const saveReportTemplate = () => {
  // Save current report configuration as template
  localStorage.setItem("alarm-report-template", JSON.stringify(reportConfig.value));
  ElMessage.success(t("alarm.success.templateSaved"));
};

// Lifecycle hooks
onMounted(async () => {
  await refreshData();
});
</script>

<style lang="scss" scoped>
.alarm-analytics {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 120px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .header-left {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .description {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }

    .header-right {
      .el-button {
        i {
          margin-right: 4px;
        }
      }
    }
  }

  .time-range-section {
    margin-bottom: 24px;

    .time-range-controls {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;

      .quick-ranges {
        display: flex;
        align-items: center;
        gap: 12px;

        .label {
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }

      .custom-range {
        .el-date-editor {
          width: 350px;
        }
      }
    }
  }

  .overview-section {
    margin-bottom: 24px;

    .metric-card {
      background: var(--el-color-white);
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

      .metric-icon {
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

        &.total {
          background: linear-gradient(
            135deg,
            var(--el-color-primary) 0%,
            var(--el-color-primary-light-3) 100%
          );
        }

        &.avg-response {
          background: linear-gradient(
            135deg,
            var(--el-color-success) 0%,
            var(--el-color-success-light-3) 100%
          );
        }

        &.resolution-rate {
          background: linear-gradient(
            135deg,
            var(--el-color-warning) 0%,
            var(--el-color-warning-light-3) 100%
          );
        }

        &.false-positive {
          background: linear-gradient(
            135deg,
            var(--el-color-info) 0%,
            var(--el-color-info-light-3) 100%
          );
        }
      }

      .metric-content {
        flex: 1;

        .metric-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--el-text-color-primary);
          line-height: 1;
          margin-bottom: 4px;
        }

        .metric-label {
          font-size: 14px;
          color: var(--el-text-color-regular);
          margin-bottom: 8px;
        }

        .metric-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;

          &.positive {
            color: var(--el-color-success);
          }

          &.negative {
            color: var(--el-color-danger);
          }
        }
      }
    }
  }

  .charts-section {
    margin-bottom: 24px;

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
      height: 350px;
    }
  }

  .tables-section {
    margin-bottom: 24px;

    .percentage-bar {
      position: relative;
      width: 100%;
      height: 20px;
      background-color: var(--el-bg-color);
      border-radius: 10px;
      overflow: hidden;

      .percentage-fill {
        height: 100%;
        background: linear-gradient(
          90deg,
          var(--el-color-primary-light-7) 0%,
          var(--el-color-primary) 100%
        );
        transition: width 0.3s ease;
      }

      .percentage-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 12px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }

    .trend-up {
      color: var(--el-color-success);
    }

    .trend-down {
      color: var(--el-color-danger);
    }
  }

  .report-builder-section {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .report-builder {
      .builder-section {
        h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .el-checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .el-checkbox {
            margin-right: 0;
          }
        }

        .filter-group {
          margin-bottom: 16px;

          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .el-select {
            width: 100%;
          }
        }
      }

      .builder-actions {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--el-border-color-lighter);
        display: flex;
        gap: 12px;

        .el-button {
          i {
            margin-right: 4px;
          }
        }
      }
    }
  }
}

// Responsive design
@media (max-width: 1200px) {
  .alarm-analytics {
    padding: 16px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-left,
      .header-right {
        width: 100%;
      }
    }

    .time-range-controls {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .custom-range .el-date-editor {
        width: 100%;
      }
    }

    .overview-section {
      .el-col {
        margin-bottom: 16px;
      }
    }

    .charts-section,
    .tables-section {
      .el-col {
        margin-bottom: 16px;
      }
    }
  }
}

@media (max-width: 768px) {
  .alarm-analytics {
    .metric-card {
      flex-direction: column;
      text-align: center;

      .metric-icon {
        margin-right: 0;
        margin-bottom: 16px;
      }
    }

    .time-range-controls {
      .quick-ranges {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;

        .el-button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .el-button {
            margin: 0;
          }
        }
      }
    }

    .report-builder {
      .el-row {
        .el-col {
          margin-bottom: 24px;
        }
      }

      .builder-actions {
        flex-direction: column;

        .el-button {
          width: 100%;
        }
      }
    }
  }
}

// Dark mode support
html.dark {
  .alarm-analytics {
    .metric-card {
      background: var(--el-bg-color-overlay);
      border-color: var(--el-border-color);
    }

    .percentage-bar {
      background-color: var(--el-border-color);
    }
  }
}
</style>
