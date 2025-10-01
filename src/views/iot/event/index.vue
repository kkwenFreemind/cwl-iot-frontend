<!--
==================================================================================
IoT Event Configuration Management Component
==================================================================================

This component provides comprehensive IoT event (alarm rule) management functionality including:
- Event rule listing by device with search and pagination
- Event rule creation, editing, and deletion
- Multi-condition support for complex event scenarios
- Device-specific metric configuration
- Real-time event status control (active/inactive)
- Severity level management

@component EventManagement
@author Chang Xiu-Wen, AI-Enhanced
@version 1.0.0
@created 2025-10-01
@updated 2025-10-01

==================================================================================
-->

<template>
  <div class="app-container">
    <!-- 
      Search and Filter Section
      Provides comprehensive filtering options for IoT event rules including:
      - Device selection with autocomplete search
      - Severity level filtering (Critical, Major, Minor, Warning)
      - Active/inactive status filtering
      - Rule name keyword search with real-time filtering
    -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="deviceId" :label="$t('event.device')">
          <el-select
            v-model="queryParams.deviceId"
            :placeholder="$t('event.selectDevice')"
            clearable
            filterable
            style="width: 240px"
            @change="handleQuery"
          >
            <el-option
              v-for="device in deviceOptions"
              :key="device.deviceId"
              :label="`${device.deviceName} (${device.deviceModel})`"
              :value="device.deviceId"
            />
          </el-select>
        </el-form-item>

        <el-form-item prop="severity" :label="$t('event.severity')">
          <el-select
            v-model="queryParams.severity"
            :placeholder="$t('event.selectSeverity')"
            clearable
            style="width: 150px"
            @change="handleQuery"
          >
            <el-option
              v-for="severity in severityOptions"
              :key="severity.value"
              :label="$t(`event.severity.${severity.value}`)"
              :value="severity.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item prop="isActive" :label="$t('event.status')">
          <el-select
            v-model="queryParams.isActive"
            :placeholder="$t('event.selectStatus')"
            clearable
            style="width: 120px"
            @change="handleQuery"
          >
            <el-option :label="$t('event.active')" :value="true" />
            <el-option :label="$t('event.inactive')" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item prop="keywords" :label="$t('event.ruleName')">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('event.ruleNamePlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button
            type="success"
            icon="plus"
            :disabled="!queryParams.deviceId"
            @click="handleAddClick"
          >
            {{ $t("event.add") }}
          </el-button>
          <el-button type="primary" icon="search" @click="handleQuery">
            {{ $t("event.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">
            {{ $t("event.reset") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 
      Information Alert Section
      Displays helpful guidance when no device is selected
      Improves user experience with contextual prompts
    -->
    <el-alert
      v-if="!queryParams.deviceId"
      type="info"
      :title="$t('event.selectDeviceFirst')"
      :closable="false"
      show-icon
      class="mb-4"
    />

    <!-- 
      Data Table Section
      Comprehensive IoT event rules management table featuring:
      - Device information with name and model display
      - Severity level indicators with color coding
      - Multi-condition rule details with expandable descriptions
      - Real-time status toggle (Active/Inactive)
      - Creation timestamp with formatted display
      - Action buttons for Edit/Delete operations
      - Responsive design with proper column sizing
    -->
    <el-card shadow="hover" class="data-table">
      <el-table
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        class="data-table__content"
      >
        <el-table-column
          :label="$t('event.ruleName')"
          prop="ruleName"
          min-width="180"
          sortable
          show-overflow-tooltip
        />

        <el-table-column :label="$t('event.device')" prop="deviceId" width="200" align="center">
          <template #default="scope">
            <span>{{ getDeviceName(scope.row.deviceId) }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('event.severity')" prop="severity" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getSeverityTagType(scope.row.severity)" size="small">
              {{ $t(`event.severity.${scope.row.severity}`) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('event.conditions')"
          prop="conditions"
          min-width="300"
          align="center"
        >
          <template #default="scope">
            <div class="conditions-display">
              <el-tag
                v-for="(condition, index) in scope.row.conditions"
                :key="condition.conditionId"
                size="small"
                type="info"
                class="condition-tag"
              >
                {{ condition.metricName }} {{ condition.operator }} {{ condition.thresholdValue }}
                <span v-if="index < scope.row.conditions.length - 1" class="condition-and">
                  AND
                </span>
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('event.status')" align="center" prop="isActive" width="80">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isActive"
              :loading="scope.row.statusLoading"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('event.createdAt')"
          prop="createdAt"
          width="180"
          align="center"
          sortable
        >
          <template #default="scope">
            <span>{{ formatDateTime(scope.row.createdAt) }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('common.action')" width="200" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" icon="edit" @click="handleEditClick(scope.row)">
              {{ $t("common.edit") }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              icon="delete"
              @click="handleDeleteClick(scope.row)"
            >
              {{ $t("common.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁組件 -->
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>

    <!-- 
      Event Rule Form Dialog Section
      Modal dialog for creating and editing IoT event rules featuring:
      - Dynamic dialog title based on operation type (Create/Edit)
      - EventForm component integration with proper prop binding
      - Device context passing for metric loading
      - Form validation and error handling
      - Responsive dialog sizing for optimal user experience
    -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="800px"
      @close="handleCloseDialog"
    >
      <EventForm
        ref="eventFormRef"
        :form-data="formData"
        :device-id="queryParams.deviceId"
        :is-edit="dialog.type === 'edit'"
      />

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">
            {{ $t("common.cancel") }}
          </el-button>
          <el-button type="primary" :loading="dialog.submitLoading" @click="handleSubmit">
            {{ $t("common.confirm") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<!-- 
  Component Script Section
  Vue 3 Composition API implementation with comprehensive IoT event management logic including:
  - Reactive state management for table data, pagination, and form dialogs
  - Device selection integration with backend API
  - Alarm rule CRUD operations with proper error handling
  - Real-time status updates and user feedback
  - Internationalization support for multi-language interface
  - Component lifecycle management and cleanup
-->
<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";

import AlarmRuleAPI, {
  type AlarmRuleResponse,
  type AlarmRuleQuery,
  type CreateAlarmRuleRequest,
  type UpdateAlarmRuleRequest,
  AlarmSeverity,
} from "@/api/iot/alarm-api";

import DeviceAPI, { type DeviceVO } from "@/api/iot/device-api";
import UserAPI from "@/api/system/user-api";
import EventForm from "./components/EventForm.vue";

defineOptions({
  name: "EventManagement",
  inheritAttrs: false,
});

/**
 * Internationalization Support
 * Vue I18n instance for multi-language interface support
 * Handles dynamic translation of UI elements and messages
 */
const { t } = useI18n();

/**
 * Reactive Data State Management
 * Core reactive references for component state management including:
 * - loading: Controls loading spinner visibility during API operations
 * - pageData: Current page alarm rule data with proper TypeScript typing
 * - total: Total record count for pagination calculations
 * - deviceOptions: Available IoT devices for selection dropdown
 */
const loading = ref(false);
const pageData = ref<AlarmRuleResponse[]>([]);
const total = ref(0);
const deviceOptions = ref<DeviceVO[]>([]);

/**
 * Query Parameters Management
 * Reactive search and filtering parameters with pagination support:
 * - deviceId: Selected device identifier for rule filtering
 * - severity: Alarm severity level filter (Critical/Major/Minor/Warning)
 * - isActive: Active/inactive status filter for rule management
 * - keywords: Text search for rule name matching
 * - pageNum/pageSize: Pagination controls for table display
 */
const queryParams = reactive<AlarmRuleQuery & { pageNum: number; pageSize: number }>({
  deviceId: "",
  severity: undefined,
  isActive: undefined,
  keywords: "",
  pageNum: 1,
  pageSize: 10,
});

/**
 * Severity Level Options
 * Computed property providing internationalized severity level options for selection:
 * - INFO: Informational notifications for general system events
 * - WARNING: Warning level for potential issues requiring attention
 * - CRITICAL: Critical level for serious problems affecting system operation
 * - EMERGENCY: Emergency level for immediate intervention required
 * Uses reactive i18n translations for multi-language support
 */
const severityOptions = computed(() => [
  { value: AlarmSeverity.INFO, label: t("event.severity.info") },
  { value: AlarmSeverity.WARNING, label: t("event.severity.warning") },
  { value: AlarmSeverity.CRITICAL, label: t("event.severity.critical") },
  { value: AlarmSeverity.EMERGENCY, label: t("event.severity.emergency") },
]);

/**
 * Dialog Management State
 * Reactive object controlling modal dialog behavior including:
 * - visible: Controls dialog visibility state
 * - type: Operation type ('add' | 'edit') for contextual behavior
 * - title: Dynamic dialog title based on operation type
 * - submitLoading: Loading state for form submission button
 */
const dialog = reactive({
  visible: false,
  type: "add" as "add" | "edit",
  title: "",
  submitLoading: false,
});

/**
 * Form Data Management
 * Reactive form data structure for alarm rule creation/editing:
 * - ruleName: User-defined name for the alarm rule
 * - deviceId: Target IoT device identifier
 * - description: Optional rule description for documentation
 * - isActive: Rule activation status (true/false)
 * - severity: Alarm severity level (Critical/Major/Minor/Warning)
 * - conditions: Array of alarm conditions with metrics and thresholds
 */
const formData = ref<CreateAlarmRuleRequest | UpdateAlarmRuleRequest>({
  ruleName: "",
  deviceId: "",
  description: "",
  isActive: true,
  severity: AlarmSeverity.WARNING,
  conditions: [],
});

/**
 * Component Template References
 * Vue template refs for accessing DOM elements and child components
 */
const queryFormRef = ref();
const eventFormRef = ref();

/**
 * 获取设备名称
 */
const getDeviceName = (deviceId: string) => {
  const device = deviceOptions.value.find((d) => d.deviceId === deviceId);
  return device ? `${device.deviceName} (${device.deviceModel})` : deviceId;
};

/**
 * 获取严重级别标签类型
 */
const getSeverityTagType = (severity: AlarmSeverity): "success" | "info" | "warning" | "danger" => {
  const typeMap: Record<AlarmSeverity, "success" | "info" | "warning" | "danger"> = {
    [AlarmSeverity.INFO]: "info",
    [AlarmSeverity.WARNING]: "warning",
    [AlarmSeverity.CRITICAL]: "danger",
    [AlarmSeverity.EMERGENCY]: "danger",
  };
  return typeMap[severity] || "info";
};

/**
 * 格式化日期时间
 */
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return "";
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateTime));
};

/**
 * 初始化用户部门ID并加载设备选项
 */
const initializeUserDeptAndDevices = async () => {
  try {
    const userProfile = await UserAPI.getProfile();
    if (userProfile?.deptId) {
      const devices = await DeviceAPI.listDevices({ deptId: Number(userProfile.deptId) });
      deviceOptions.value = devices || [];
    }
  } catch (error) {
    console.error("Failed to load devices:", error);
    ElMessage.error(t("event.loadDevicesFailed"));
  }
};

/**
 * Query Event Rules Data Handler
 * Asynchronous function for fetching and filtering IoT alarm rules including:
 * - Device-specific rule retrieval from backend API
 * - Client-side filtering by severity level and active status
 * - Keyword-based search for rule names
 * - Pagination calculations and data slicing
 * - Loading state management with error handling
 * - Empty state handling when no device is selected
 */
const handleQuery = async () => {
  if (!queryParams.deviceId) {
    pageData.value = [];
    total.value = 0;
    return;
  }

  loading.value = true;
  try {
    const response = await AlarmRuleAPI.getAlarmRulesByDevice(queryParams.deviceId);

    // Apply client-side filtering based on query parameters
    let filteredData = response || [];

    if (queryParams.severity) {
      filteredData = filteredData.filter((rule) => rule.severity === queryParams.severity);
    }

    if (queryParams.isActive !== undefined) {
      filteredData = filteredData.filter((rule) => rule.isActive === queryParams.isActive);
    }

    if (queryParams.keywords) {
      filteredData = filteredData.filter((rule) =>
        rule.ruleName.toLowerCase().includes(queryParams.keywords!.toLowerCase())
      );
    }

    // 添加状态加载标志
    filteredData.forEach((rule) => {
      rule.statusLoading = false;
    });

    total.value = filteredData.length;
    const startIndex = (queryParams.pageNum - 1) * queryParams.pageSize;
    const endIndex = startIndex + queryParams.pageSize;
    pageData.value = filteredData.slice(startIndex, endIndex);
  } catch (error) {
    console.error("Failed to load alarm rules:", error);
    ElMessage.error(t("event.loadFailed"));
  } finally {
    loading.value = false;
  }
};

/**
 * 重置查询
 */
const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
};

/**
 * Handle Add Button Click Event
 * Initiates the creation of a new IoT alarm rule including:
 * - Device selection validation with user feedback
 * - Dialog configuration for 'add' operation mode
 * - Form data initialization with default values
 * - Device context binding for metric loading
 * - Warning severity as default for new rules
 */
const handleAddClick = () => {
  if (!queryParams.deviceId) {
    ElMessage.warning(t("event.selectDeviceFirst"));
    return;
  }

  dialog.type = "add";
  dialog.title = t("event.addTitle");
  dialog.visible = true;

  formData.value = {
    ruleName: "",
    deviceId: queryParams.deviceId,
    description: "",
    isActive: true,
    severity: AlarmSeverity.WARNING,
    conditions: [],
  };
};

/**
 * Handle Edit Button Click Event
 * Initiates editing of an existing IoT alarm rule including:
 * - Dialog configuration for 'edit' operation mode
 * - Form data population from selected rule
 * - Condition mapping with proper data transformation
 * - Preserving existing rule configuration and metadata
 */
const handleEditClick = (row: AlarmRuleResponse) => {
  dialog.type = "edit";
  dialog.title = t("event.editTitle");
  dialog.visible = true;

  formData.value = {
    ruleName: row.ruleName,
    description: row.description,
    isActive: row.isActive,
    severity: row.severity,
    conditions: row.conditions.map((condition) => ({
      metricName: condition.metricName,
      operator: condition.operator,
      thresholdValue: condition.thresholdValue,
      dataType: condition.dataType,
    })),
  };

  // 保存当前编辑的规则ID
  (formData.value as any).ruleId = row.ruleId;
};

/**
 * 处理删除按钮点击
 */
const handleDeleteClick = async (row: AlarmRuleResponse) => {
  try {
    await ElMessageBox.confirm(
      t("event.deleteConfirm", { name: row.ruleName }),
      t("common.warning"),
      {
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
        type: "warning",
      }
    );

    await AlarmRuleAPI.deleteAlarmRule(row.ruleId);
    ElMessage.success(t("event.deleteSuccess"));
    handleQuery();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to delete alarm rule:", error);
      ElMessage.error(t("event.deleteFailed"));
    }
  }
};

/**
 * 处理状态切换
 */
const handleStatusChange = async (row: AlarmRuleResponse) => {
  row.statusLoading = true;
  try {
    await AlarmRuleAPI.toggleAlarmRuleStatus(row.ruleId, row.isActive);
    ElMessage.success(t("event.statusUpdateSuccess"));
  } catch (error) {
    // 恢复状态
    row.isActive = !row.isActive;
    console.error("Failed to toggle alarm rule status:", error);
    ElMessage.error(t("event.statusUpdateFailed"));
  } finally {
    row.statusLoading = false;
  }
};

/**
 * 处理表单提交
 */
const handleSubmit = async () => {
  const valid = await eventFormRef.value?.validate();
  if (!valid) return;

  // 從子組件獲取當前表單數據
  const currentFormData = eventFormRef.value?.getFormData();
  if (!currentFormData) {
    ElMessage.error(t("event.submitFailed"));
    return;
  }

  dialog.submitLoading = true;
  try {
    if (dialog.type === "add") {
      await AlarmRuleAPI.createAlarmRule(currentFormData as CreateAlarmRuleRequest);
      ElMessage.success(t("event.createSuccess"));
    } else {
      const ruleId = (formData.value as any).ruleId;
      await AlarmRuleAPI.updateAlarmRule(ruleId, currentFormData as UpdateAlarmRuleRequest);
      ElMessage.success(t("event.updateSuccess"));
    }

    handleCloseDialog();
    handleQuery();
  } catch (error) {
    console.error("Failed to submit alarm rule:", error);
    ElMessage.error(t("event.submitFailed"));
  } finally {
    dialog.submitLoading = false;
  }
};

/**
 * 关闭对话框
 */
const handleCloseDialog = () => {
  dialog.visible = false;
  dialog.submitLoading = false;
  eventFormRef.value?.resetForm();
};

/**
 * 组件挂载时初始化
 */
onMounted(async () => {
  await initializeUserDeptAndDevices();
  // 如果URL中有deviceId参数，自动选择
  const urlParams = new URLSearchParams(window.location.search);
  const deviceId = urlParams.get("deviceId");
  if (deviceId && deviceOptions.value.some((d) => d.deviceId === deviceId)) {
    queryParams.deviceId = deviceId;
    await nextTick();
    handleQuery();
  }
});
</script>

<!-- 
  Component Styling Section
  SCSS with scoped styling for IoT event management interface including:
  - Responsive table layout with proper column sizing
  - Condition display styling with tag-based visualization
  - Search container styling with inline form elements
  - Dialog and card styling for consistent UI appearance
  - Color coding for severity levels and status indicators
  - Hover effects and interactive element styling
-->
<style lang="scss" scoped>
.conditions-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.condition-tag {
  margin: 2px;
}

.condition-and {
  margin: 0 4px;
  font-weight: bold;
  color: #909399;
}

.search-buttons {
  margin-left: auto;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
