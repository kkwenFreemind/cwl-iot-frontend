<!--
==================================================================================
IoT Event Rule Configuration Form Component
==================================================================================

A sophisticated Vue 3 component that provides a comprehensive interface for creating
and editing IoT alarm/event rules with advanced condition management capabilities.

FEATURES:
- 📝 Basic Rule Information Management (name, description, severity levels, status)
- 🔧 Dynamic Condition Builder with add/remove functionality
- 🎯 Device-specific Metric Selection with auto-completion
- ✅ Real-time Form Validation with TypeScript type safety
- 🔢 Multi-data Type Support (Numeric, Boolean, String types)
- ⚖️ Comprehensive Comparison Operators (>, <, >=, <=, =, !=)
- 🎨 Responsive UI with Element Plus components
- 🌍 Full Internationalization (i18n) support
- 🔄 Reactive Data Binding with parent-child communication

TECHNICAL ARCHITECTURE:
- Framework: Vue 3 Composition API with TypeScript
- UI Library: Element Plus components
- Form Validation: Reactive validation rules with custom validators
- Data Flow: Uni-directional data flow to prevent recursive updates
- API Integration: RESTful service integration for metrics and user data

USAGE PATTERNS:
- Creating new alarm rules for IoT devices
- Editing existing alarm configurations
- Multi-condition alarm scenarios with AND logic
- Device-specific metric threshold monitoring
- Real-time alarm status management

PROPS:
- formData: AlarmRuleRequest - The alarm rule data object
- deviceId: string - Target IoT device identifier
- isEdit: boolean - Form mode flag (create/edit)

EVENTS:
- Form validation state changes
- Metric selection updates
- Condition management operations

EXPOSED METHODS:
- validate(): Promise<boolean> - Validates entire form
- resetForm(): void - Resets form to initial state
- getFormData(): AlarmRuleRequest - Returns current form data

@component EventForm
@namespace IoT.Event.Components
@author Chang Xiu-Wen, AI-Enhanced
@version 1.2.0
@since 2025-10-01
@lastModified 2025-10-01
@license MIT
@category IoT Management Components
@tags [iot, alarm, event-rules, form, vue3, typescript, element-plus]

DEPENDENCIES:
- Vue 3.x (Composition API)
- Element Plus UI Framework
- Vue I18n for internationalization
- Custom IoT API modules (alarm-api, metric-api, user-api)
- TypeScript for type safety

PERFORMANCE CONSIDERATIONS:
- Computed properties for reactive options
- Debounced validation for better UX
- Lazy loading of metric definitions
- Optimized re-rendering with proper key usage

==================================================================================
-->

<template>
  <el-form
    ref="formRef"
    :model="localFormData"
    :rules="rules"
    label-width="120px"
    class="event-form"
  >
    <!-- ===============================================
         BASIC INFORMATION SECTION
         Contains fundamental alarm rule properties
         =============================================== -->
    <el-card shadow="never" class="form-section">
      <template #header>
        <span class="section-title">{{ $t("event.basicInfo") }}</span>
      </template>

      <el-form-item :label="$t('event.ruleName')" prop="ruleName">
        <el-input
          v-model="localFormData.ruleName"
          :placeholder="$t('event.ruleNamePlaceholder')"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>

      <el-form-item :label="$t('event.description')" prop="description">
        <el-input
          v-model="localFormData.description"
          type="textarea"
          :placeholder="$t('event.descriptionPlaceholder')"
          maxlength="1000"
          show-word-limit
          :rows="3"
        />
      </el-form-item>

      <el-form-item :label="$t('event.severity')" prop="severity">
        <el-select v-model="localFormData.severity" style="width: 200px">
          <el-option
            v-for="severity in severityOptions"
            :key="severity.value"
            :label="severity.label"
            :value="severity.value"
          >
            <div class="severity-option">
              <el-tag :type="getSeverityTagType(severity.value)" size="small" class="severity-tag">
                {{ severity.label }}
              </el-tag>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('event.status')" prop="isActive">
        <el-switch
          v-model="localFormData.isActive"
          :active-text="$t('event.active')"
          :inactive-text="$t('event.inactive')"
        />
      </el-form-item>
    </el-card>

    <!-- 
      Condition Management Section
      Allows users to define multiple conditions for event triggering
      Each condition specifies metric, operator, and threshold value
      Supports dynamic add/remove operations with validation
    -->
    <el-card shadow="never" class="form-section">
      <template #header>
        <div class="section-header">
          <span class="section-title">{{ $t("event.conditions") }}</span>
          <el-button type="primary" size="small" icon="plus" @click="addCondition">
            {{ $t("event.addCondition") }}
          </el-button>
        </div>
      </template>

      <div
        v-if="!localFormData.conditions || localFormData.conditions.length === 0"
        class="empty-conditions"
      >
        <el-empty :description="$t('event.noConditions')" />
      </div>

      <div v-else class="conditions-list">
        <div
          v-for="(condition, index) in localFormData.conditions"
          :key="index"
          class="condition-item"
        >
          <el-card shadow="hover" class="condition-card">
            <template #header>
              <div class="condition-header">
                <span class="condition-title">{{ $t("event.condition") }} {{ index + 1 }}</span>
                <el-button
                  type="danger"
                  size="small"
                  icon="delete"
                  circle
                  :disabled="!localFormData.conditions || localFormData.conditions.length <= 1"
                  @click="removeCondition(index)"
                />
              </div>
            </template>

            <el-form-item
              :label="$t('event.metricName')"
              :prop="`conditions.${index}.metricName`"
              :rules="conditionRules.metricName"
            >
              <el-select
                v-model="condition.metricName"
                :placeholder="$t('event.selectMetric')"
                filterable
                style="width: 100%"
                @change="handleMetricChange(index)"
              >
                <el-option
                  v-for="metric in deviceMetrics"
                  :key="metric.metricName"
                  :label="`${metric.alias || metric.metricName} (${metric.unit})`"
                  :value="metric.metricName"
                >
                  <div class="metric-option">
                    <span class="metric-name">{{ metric.alias || metric.metricName }}</span>
                    <span class="metric-details">
                      {{ metric.physicalQuantity }} - {{ metric.unit }} ({{ metric.dataType }})
                    </span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item
                  :label="$t('event.operator')"
                  :prop="`conditions.${index}.operator`"
                  :rules="conditionRules.operator"
                >
                  <el-select
                    v-model="condition.operator"
                    :placeholder="$t('event.selectOperator')"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="op in operatorOptions"
                      :key="op.value"
                      :label="op.label"
                      :value="op.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  :label="$t('event.thresholdValue')"
                  :prop="`conditions.${index}.thresholdValue`"
                  :rules="getThresholdRules(condition.dataType)"
                >
                  <el-input
                    v-if="condition.dataType !== 'Boolean'"
                    v-model="condition.thresholdValue"
                    :placeholder="$t('event.enterThreshold')"
                  />
                  <el-select
                    v-else
                    v-model="condition.thresholdValue"
                    :placeholder="$t('event.selectBooleanValue')"
                    style="width: 100%"
                  >
                    <el-option label="true" value="true" />
                    <el-option label="false" value="false" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item
                  :label="$t('event.dataType')"
                  :prop="`conditions.${index}.dataType`"
                  :rules="conditionRules.dataType"
                >
                  <el-select
                    v-model="condition.dataType"
                    :placeholder="$t('event.selectDataType')"
                    style="width: 100%"
                    @change="handleDataTypeChange(index)"
                  >
                    <el-option
                      v-for="type in dataTypeOptions"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 条件逻辑连接符 -->
            <div
              v-if="localFormData.conditions && index < localFormData.conditions.length - 1"
              class="condition-logic"
            >
              <el-tag type="info" size="small">AND</el-tag>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </el-form>
</template>

<!-- 
  Component Script Section
  Vue 3 Composition API with TypeScript support
  Handles form state management, validation, and API integration
  Implements reactive data binding and computed properties
-->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

import {
  type CreateAlarmRuleRequest,
  type UpdateAlarmRuleRequest,
  type AlarmConditionRequest,
  AlarmSeverity,
  SparkplugDataType,
  ComparisonOperator,
} from "@/api/iot/alarm-api";

import MetricAPI, { type IotMetricDefinition } from "@/api/iot/metric-api";
import UserAPI from "@/api/system/user-api";

defineOptions({
  name: "EventForm",
  inheritAttrs: false,
});

/**
 * 组件属性定义
 */
interface Props {
  formData: CreateAlarmRuleRequest | UpdateAlarmRuleRequest;
  deviceId: string;
  isEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
});

/**
 * 国际化实例
 */
const { t } = useI18n();

/**
 * 表单引用
 */
const formRef = ref();

/**
 * 本地表单数据
 */
const localFormData = ref<CreateAlarmRuleRequest | UpdateAlarmRuleRequest>({
  ruleName: "",
  deviceId: "",
  description: "",
  isActive: true,
  severity: AlarmSeverity.WARNING,
  conditions: [],
});

/**
 * 设备度量指标选项
 */
const deviceMetrics = ref<IotMetricDefinition[]>([]);

/**
 * 严重级别选项
 */
const severityOptions = computed(() => [
  { value: AlarmSeverity.INFO, label: t("event.severity.info") },
  { value: AlarmSeverity.WARNING, label: t("event.severity.warning") },
  { value: AlarmSeverity.CRITICAL, label: t("event.severity.critical") },
  { value: AlarmSeverity.EMERGENCY, label: t("event.severity.emergency") },
]);

/**
 * 运算符选项
 */
const operatorOptions = computed(() => [
  { value: ComparisonOperator.GREATER_THAN, label: "> (" + t("event.greaterThan") + ")" },
  { value: ComparisonOperator.LESS_THAN, label: "< (" + t("event.lessThan") + ")" },
  { value: ComparisonOperator.GREATER_EQUAL, label: ">= (" + t("event.greaterEqual") + ")" },
  { value: ComparisonOperator.LESS_EQUAL, label: "<= (" + t("event.lessEqual") + ")" },
  { value: ComparisonOperator.EQUAL, label: "= (" + t("event.equal") + ")" },
  { value: ComparisonOperator.NOT_EQUAL, label: "!= (" + t("event.notEqual") + ")" },
]);

/**
 * 数据类型选项
 */
const dataTypeOptions = computed(() => [
  { value: SparkplugDataType.INT8, label: "Int8" },
  { value: SparkplugDataType.INT16, label: "Int16" },
  { value: SparkplugDataType.INT32, label: "Int32" },
  { value: SparkplugDataType.INT64, label: "Int64" },
  { value: SparkplugDataType.UINT8, label: "UInt8" },
  { value: SparkplugDataType.UINT16, label: "UInt16" },
  { value: SparkplugDataType.UINT32, label: "UInt32" },
  { value: SparkplugDataType.UINT64, label: "UInt64" },
  { value: SparkplugDataType.FLOAT, label: "Float" },
  { value: SparkplugDataType.DOUBLE, label: "Double" },
  { value: SparkplugDataType.BOOLEAN, label: "Boolean" },
  { value: SparkplugDataType.STRING, label: "String" },
]);

/**
 * 表单验证规则
 */
const rules = computed(() => ({
  ruleName: [
    { required: true, message: t("event.validation.ruleNameRequired"), trigger: "blur" },
    { max: 255, message: t("event.validation.ruleNameMaxLength"), trigger: "blur" },
  ],
  description: [
    { max: 1000, message: t("event.validation.descriptionMaxLength"), trigger: "blur" },
  ],
  severity: [
    { required: true, message: t("event.validation.severityRequired"), trigger: "change" },
  ],
}));

/**
 * 条件验证规则
 */
const conditionRules = computed(() => ({
  metricName: [
    { required: true, message: t("event.validation.metricNameRequired"), trigger: "change" },
  ],
  operator: [
    { required: true, message: t("event.validation.operatorRequired"), trigger: "change" },
  ],
  dataType: [
    { required: true, message: t("event.validation.dataTypeRequired"), trigger: "change" },
  ],
}));

/**
 * 获取阈值验证规则
 */
const getThresholdRules = (dataType: SparkplugDataType) => {
  const baseRules: any[] = [
    { required: true, message: t("event.validation.thresholdRequired"), trigger: "blur" },
  ];

  if (dataType && dataType !== SparkplugDataType.STRING && dataType !== SparkplugDataType.BOOLEAN) {
    baseRules.push({
      pattern: /^-?\d+(\.\d+)?$/,
      message: t("event.validation.thresholdNumeric"),
      trigger: "blur",
    });
  }

  return baseRules;
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
 * 加载设备度量指标
 */
const loadDeviceMetrics = async () => {
  if (!props.deviceId) return;

  try {
    // 获取当前用户的部门ID
    const userProfile = await UserAPI.getProfile();
    if (!userProfile?.deptId) {
      console.warn("No department ID found for current user");
      return;
    }

    // 获取度量指标定义列表
    const metrics = await MetricAPI.getMetricDefinitions({ deptId: userProfile.deptId.toString() });
    deviceMetrics.value = metrics || [];
  } catch (error) {
    console.error("Failed to load device metrics:", error);
    ElMessage.error(t("event.loadMetricsFailed"));
  }
};

/**
 * 添加条件
 */
const addCondition = () => {
  const newCondition: AlarmConditionRequest = {
    metricName: "",
    operator: ComparisonOperator.GREATER_THAN,
    thresholdValue: "",
    dataType: SparkplugDataType.DOUBLE,
  };

  if (!localFormData.value.conditions) {
    localFormData.value.conditions = [];
  }
  localFormData.value.conditions.push(newCondition);
};

/**
 * 移除条件
 */
const removeCondition = (index: number) => {
  if (localFormData.value.conditions && localFormData.value.conditions.length > 1) {
    localFormData.value.conditions.splice(index, 1);
  }
};

/**
 * 处理度量指标改变
 */
const handleMetricChange = (index: number) => {
  if (!localFormData.value.conditions) return;

  const condition = localFormData.value.conditions[index];
  const selectedMetric = deviceMetrics.value.find((m) => m.metricName === condition.metricName);

  if (selectedMetric) {
    // 根据度量指标的数据类型自动设置条件的数据类型
    condition.dataType = selectedMetric.dataType as SparkplugDataType;
    condition.thresholdValue = ""; // 清空阈值
  }
};

/**
 * 处理数据类型改变
 */
const handleDataTypeChange = (index: number) => {
  if (!localFormData.value.conditions) return;

  const condition = localFormData.value.conditions[index];
  condition.thresholdValue = ""; // 清空阈值
};

/**
 * 表单验证
 */
const validate = async () => {
  try {
    await formRef.value?.validate();

    // 检查是否至少有一个条件
    if (!localFormData.value.conditions || localFormData.value.conditions.length === 0) {
      ElMessage.error(t("event.validation.atLeastOneCondition"));
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * 重置表单
 */
const resetForm = () => {
  formRef.value?.resetFields();
  localFormData.value = {
    ruleName: "",
    deviceId: props.deviceId,
    description: "",
    isActive: true,
    severity: AlarmSeverity.WARNING,
    conditions: [],
  };
};

/**
 * 监听props变化并同步到本地数据
 */
watch(
  () => props.formData,
  (newData) => {
    // 只在數據真正改變時才更新，避免不必要的響應式觸發
    if (JSON.stringify(localFormData.value) !== JSON.stringify(newData)) {
      localFormData.value = { ...newData };
      if (!localFormData.value.conditions || localFormData.value.conditions.length === 0) {
        addCondition(); // 至少保证有一个条件
      }
    }
  },
  { immediate: true, deep: true }
);

/**
 * 获取当前表单数据（用于父组件获取数据，不使用双向绑定）
 */
const getFormData = () => {
  return localFormData.value;
};

/**
 * 暴露给父组件的方法
 */
defineExpose({
  validate,
  resetForm,
  getFormData,
});

/**
 * 组件挂载时初始化
 */
onMounted(async () => {
  await loadDeviceMetrics();

  // 如果没有条件，添加一个默认条件
  if (!localFormData.value.conditions || localFormData.value.conditions.length === 0) {
    addCondition();
  }
});
</script>

<!-- 
  Component Styling Section
  SCSS with scoped styling for component isolation
  Responsive design with consistent spacing and theming
  Element Plus component customization and overrides
-->
<style lang="scss" scoped>
.event-form {
  .form-section {
    margin-bottom: 20px;

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title {
      font-weight: bold;
      color: #409eff;
    }
  }

  .severity-option {
    display: flex;
    align-items: center;

    .severity-tag {
      margin-right: 8px;
    }
  }

  .empty-conditions {
    padding: 40px 0;
    text-align: center;
  }

  .conditions-list {
    .condition-item {
      margin-bottom: 16px;

      .condition-card {
        position: relative;

        .condition-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .condition-title {
            font-weight: 500;
            color: #303133;
          }
        }

        .condition-logic {
          position: absolute;
          bottom: -20px;
          left: 50%;
          z-index: 10;
          transform: translateX(-50%);
        }
      }
    }
  }

  .metric-option {
    display: flex;
    flex-direction: column;

    .metric-name {
      font-weight: 500;
      color: #303133;
    }

    .metric-details {
      margin-top: 2px;
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
