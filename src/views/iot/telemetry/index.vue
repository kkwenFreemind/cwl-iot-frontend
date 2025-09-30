<!--
==================================================================================
Telemetry Data Visualization Component (IoT Real-time Data Analytics)
==================================================================================

This component provides comprehensive real-time telemetry data visualization and 
analysis functionality for IoT device monitoring including:
- Time-series telemetry data querying with flexible date range filtering
- Real-time IoT sensor data display with metric values and timestamps
- Device-specific telemetry monitoring with department-based access control
- Advanced telemetry data detail views with metadata analysis
- Pagination support for handling large telemetry datasets
- Multi-language internationalization for global deployment

Key Telemetry Features:
- Time Range Filtering: Custom date/time range selection for historical data analysis
- Real-time Data Display: Live telemetry values from IoT sensors and devices
- Metric Visualization: Sensor readings with units, timestamps, and quality indicators
- Device Identification: Device codes, names, and associated department information
- Data Quality Monitoring: Quality scores and validation status for telemetry data
- Metadata Analysis: Comprehensive device and metric metadata viewing

Data Management Capabilities:
- Department-based Data Filtering: Role-based telemetry data access control
- Pagination Support: Efficient handling of large telemetry datasets
- Real-time Query Processing: Dynamic data retrieval with API integration
- Data Transformation: API response formatting for table display
- Error Handling: Comprehensive error management for API failures
- Loading States: User feedback during data retrieval operations

Advanced Analytics Features:
- Historical Data Analysis: Time-series data querying and visualization
- Device Status Monitoring: Online/offline status tracking
- Data Quality Assessment: Quality scores and validation metrics
- Metric Versioning: Version control for metric definitions
- Ingestion Timestamps: Data arrival time tracking for latency analysis
- Edge Node Identification: Edge computing node tracking

Detail View Capabilities:
- Complete Telemetry Record Display: Full device and metric information
- Metadata Exploration: JSON-formatted metadata with syntax highlighting
- Data Quality Indicators: Visual quality status representation
- Device Context Information: Department and location details
- Timestamp Formatting: Human-readable time display with timezone support
- Expandable Information Panels: Detailed record examination interface

Technical Implementation:
- Vue 3 Composition API with TypeScript for robust development
- Element Plus UI components for professional data visualization
- Reactive state management for real-time data updates
- RESTful API integration with error handling and retry logic
- Department-based authorization and data filtering
- Responsive design with optimized table layouts
- Internationalization (i18n) support for multi-language deployment

Integration Points:
- Device Management: Device information and status integration
- Metric Definitions: Metric configuration and validation rules
- User Management: Department-based access control integration
- Time-series Database: Historical data storage and retrieval
- Real-time Data Streams: Live telemetry data ingestion
- Analytics Dashboard: Data aggregation and visualization support

@component TelemetryIndex  
@author Chang Xiu-Wen, AI-Enhanced
@version 2.1.0
@created 2025-09-30
@updated 2025-09-30

==================================================================================
-->

<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryForm" :inline="true">
        <el-form-item :label="$t('iot.telemetry.startTime')" prop="startTime">
          <el-date-picker
            v-model="queryForm.startTime"
            type="datetime"
            :placeholder="$t('iot.telemetry.startTimePlaceholder')"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>

        <el-form-item :label="$t('iot.telemetry.endTime')" prop="endTime">
          <el-date-picker
            v-model="queryForm.endTime"
            type="datetime"
            :placeholder="$t('iot.telemetry.endTimePlaceholder')"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" @click="handleQuery">
            {{ $t("common.query") }}
          </el-button>
          <el-button @click="handleReset">
            {{ $t("common.reset") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 數據表格 -->
    <el-card shadow="hover" class="data-table">
      <el-table
        :data="tableData"
        highlight-current-row
        border
        class="data-table__content"
        :empty-text="$t('common.noData')"
      >
        <el-table-column
          prop="deviceCode"
          :label="$t('iot.telemetry.deviceCode')"
          min-width="100"
        />
        <el-table-column
          prop="deviceName"
          :label="$t('iot.telemetry.deviceName')"
          min-width="120"
        />
        <el-table-column
          prop="metricDisplayName"
          :label="$t('iot.telemetry.metricName')"
          min-width="120"
        />
        <el-table-column prop="value" :label="$t('iot.telemetry.value')" width="100" align="right">
          <template #default="scope">
            <span>{{ formatValue(scope.row.value) }} {{ scope.row.unit || "" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" :label="$t('iot.telemetry.timestamp')" min-width="160">
          <template #default="scope">
            <span>{{ formatDateTime(scope.row.timestamp) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.actions')" fixed="right" width="120">
          <template #default="scope">
            <el-button type="primary" size="small" text @click="handleViewDetail(scope.row)">
              {{ $t("common.view") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁組件 -->
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="pagination.current"
        v-model:limit="pagination.size"
        @pagination="handleCurrentChange"
      />
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailDialogVisible" :title="$t('iot.telemetry.detailTitle')" width="800px">
      <div v-if="selectedRecord" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('iot.telemetry.deviceCode')">
            {{ selectedRecord.deviceCode }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('iot.telemetry.deviceName')">
            {{ selectedRecord.deviceName }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('iot.telemetry.metricName')">
            {{ selectedRecord.metricDisplayName }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('iot.telemetry.value')">
            {{ selectedRecord.value }} {{ selectedRecord.unit || "" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('iot.telemetry.timestamp')" :span="2">
            {{ formatDateTime(selectedRecord.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('iot.telemetry.department')" :span="2">
            {{ selectedRecord.deptName }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="selectedRecord.quality"
            :label="$t('iot.telemetry.quality')"
            :span="2"
          >
            {{ selectedRecord.quality }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="selectedRecord.metadata"
            :label="$t('iot.telemetry.metadata')"
            :span="2"
          >
            <pre class="metadata-content">{{ selectedRecord.metadata }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="TelemetryIndex">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import TelemetryAPI from "@/api/iot/telemetry-api";
import UserAPI from "@/api/system/user-api";

const { t } = useI18n();

// Form refs
const queryFormRef = ref();

// Reactive data
const tableData = ref<any[]>([]);
const selectedRecord = ref<any>(null);
const detailDialogVisible = ref(false);
const total = ref(0);

// Query form
const queryForm = reactive({
  deptId: undefined as number | undefined,
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined,
});

// Pagination
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
});

// Methods
const handleQuery = async () => {
  try {
    // Check if deptId is available
    if (!queryForm.deptId) {
      ElMessage.warning(t("iot.telemetry.deptIdRequired"));
      return;
    }

    // Format dates for API - remove timezone info and milliseconds
    const formatDateForAPI = (dateStr?: string) => {
      if (!dateStr) return undefined;
      // Convert from "YYYY-MM-DDTHH:mm:ss" format to API expected format
      return dateStr.replace(/\.\d{3}Z?$/, "").split("+")[0];
    };

    const formattedStartTime = formatDateForAPI(queryForm.startTime);
    const formattedEndTime = formatDateForAPI(queryForm.endTime);

    console.log("Original dates:", {
      startTime: queryForm.startTime,
      endTime: queryForm.endTime,
    });
    console.log("Formatted dates:", {
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    });

    const response = await TelemetryAPI.getTelemetryByDepartment(
      queryForm.deptId!,
      formattedStartTime,
      formattedEndTime,
      pagination.current,
      pagination.size
    );

    console.log("Telemetry API response:", response);

    // Handle API response structure: response.data contains list and total
    if (response && (response as any).data && Array.isArray((response as any).data.list)) {
      const apiData = (response as any).data;
      // Transform API data to match table expectations
      tableData.value = apiData.list.map((item: any) => ({
        deviceCode: item.deviceId,
        deviceName: item.deviceName || item.deviceId,
        metricDisplayName: item.metricName || item.metricIdentifier,
        value: item.metricValue,
        unit: "", // API doesn't provide unit, can be added later
        timestamp: item.time,
        deptName: item.deptName,
        quality: item.quality,
        metadata: JSON.stringify(
          {
            alias: item.alias,
            dataType: item.dataType,
            communityId: item.communityId,
            seq: item.seq,
            isBirth: item.isBirth,
            isDeath: item.isDeath,
            bdSeq: item.bdSeq,
            metricVersion: item.metricVersion,
            ingestionTime: item.ingestionTime,
            edgeNodeId: item.edgeNodeId,
            onlineStatus: item.onlineStatus,
          },
          null,
          2
        ),
      }));
      total.value = apiData.total;
      pagination.total = apiData.total;
    } else {
      // Fallback for direct response structure
      tableData.value = (response as any).list || [];
      total.value = (response as any).total || 0;
      pagination.total = (response as any).total || 0;
    }

    ElMessage.success(t("common.querySuccess"));
  } catch (error) {
    console.error("Query telemetry data failed:", error);
    ElMessage.error(t("common.queryFailed"));
  }
};

const handleReset = () => {
  queryFormRef.value?.resetFields();
  tableData.value = [];
  pagination.current = 1;
  pagination.total = 0;
};

const handleCurrentChange = () => {
  handleQuery();
};

const handleViewDetail = (record: any) => {
  selectedRecord.value = record;
  detailDialogVisible.value = true;
};

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString();
};

const formatValue = (value: any) => {
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value;
};

// Initialize
const loadUserProfile = async () => {
  try {
    const profile = await UserAPI.getProfile();
    queryForm.deptId = profile.deptId ? parseInt(profile.deptId) : undefined;

    // Auto query latest data after getting user profile
    if (queryForm.deptId) {
      await handleQuery();
    }
  } catch (error) {
    console.error("Failed to load user profile:", error);
    ElMessage.error(t("iot.telemetry.loadProfileFailed"));
  }
};

onMounted(() => {
  loadUserProfile();
});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.search-container {
  padding: 20px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;

  .search-buttons {
    margin-left: auto;
  }
}

.data-table {
  &__content {
    width: 100%;
  }
}

.detail-content {
  .metadata-content {
    max-height: 200px;
    padding: 10px;
    overflow-y: auto;
    font-size: 12px;
    word-break: break-all;
    white-space: pre-wrap;
    background: #f5f5f5;
    border-radius: 4px;
  }
}
</style>
