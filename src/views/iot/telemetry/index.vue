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
      <template #header>
        <div class="card-header">
          <span>{{ $t("iot.telemetry.results") }}</span>
          <div class="header-actions">
            <el-button
              type="primary"
              size="small"
              :disabled="!tableData.length"
              @click="handleExport"
            >
              {{ $t("common.export") }}
            </el-button>
          </div>
        </div>
      </template>

      <!-- Debug info -->
      <div
        style="
          padding: 15px;
          margin-bottom: 20px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
        "
      >
        <h4 style="margin: 0 0 10px 0; color: #0369a1">調試信息</h4>
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            font-size: 14px;
          "
        >
          <div>
            <strong>DeptId:</strong>
            {{ queryForm.deptId || "未設置" }}
          </div>
          <div>
            <strong>數據數量:</strong>
            {{ tableData.length }}
          </div>
          <div>
            <strong>總數:</strong>
            {{ total }}
          </div>
          <div>
            <strong>當前頁碼:</strong>
            {{ pagination.current }}
          </div>
          <div>
            <strong>頁大小:</strong>
            {{ pagination.size }}
          </div>
          <div>
            <strong>API狀態:</strong>
            {{ loading ? "載入中..." : "完成" }}
          </div>
        </div>
        <div style="margin-top: 10px">
          <el-button type="info" size="small" @click="testDirectAPI">測試API調用</el-button>
          <el-button type="warning" size="small" @click="forceLoadData">強制載入數據</el-button>
        </div>
      </div>

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
        <el-table-column prop="value" :label="$t('iot.telemetry.value')" width="100">
          <template #default="scope">
            <span>{{ scope.row.value }} {{ scope.row.unit || "" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" :label="$t('iot.telemetry.timestamp')" min-width="160">
          <template #default="scope">
            <span>{{ formatDateTime(scope.row.timestamp) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deptName" :label="$t('iot.telemetry.department')" width="120" />
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
const loading = ref(false);

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

    const response = await TelemetryAPI.getTelemetryByDepartment(
      queryForm.deptId!,
      queryForm.startTime,
      queryForm.endTime,
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

const handleExport = async () => {
  try {
    // Get all data without pagination for export
    await TelemetryAPI.getTelemetryListByDepartment(
      queryForm.deptId!,
      queryForm.startTime,
      queryForm.endTime
    );

    // Export logic here - could use a library like exceljs
    ElMessage.success(t("common.exportSuccess"));
  } catch (error) {
    console.error("Export failed:", error);
    ElMessage.error(t("common.exportFailed"));
  }
};

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString();
};

/**
 * Test direct API call with hardcoded deptId
 */
const testDirectAPI = async () => {
  try {
    loading.value = true;
    console.log("Testing direct API call with deptId: 2");

    const response = await TelemetryAPI.getTelemetryByDepartment(2, undefined, undefined, 1, 10);
    console.log("Direct API test response:", response);

    // Handle API response structure: response.data contains list and total
    if (response && (response as any).data && Array.isArray((response as any).data.list)) {
      const apiData = (response as any).data;
      tableData.value = apiData.list.map((item: any) => ({
        deviceCode: item.deviceId,
        deviceName: item.deviceName || item.deviceId,
        metricDisplayName: item.metricName || item.metricIdentifier,
        value: item.metricValue,
        unit: "",
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
    }

    ElMessage.success("API測試成功，已載入數據");
  } catch (error) {
    console.error("Direct API test failed:", error);
    ElMessage.error("API測試失敗");
  } finally {
    loading.value = false;
  }
};

/**
 * Force load data with current deptId
 */
const forceLoadData = async () => {
  if (!queryForm.deptId) {
    queryForm.deptId = 2; // Force set to 2 for testing
  }
  await handleQuery();
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
