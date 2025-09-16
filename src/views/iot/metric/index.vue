<!--
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025/09/16

  IoT Metric Definition Management Component
  IoT指標定義管理組件

  This component provides comprehensive IoT metric definition management functionality including:
  - Metric definition listing with filtering and search
  - Metric CRUD operations (Create, Read, Update, Delete)
  - Physical quantity and data type filtering
  - Department-based filtering
  - Responsive design with drawer-based forms
-->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- Department Tree Sidebar / 部門樹側邊欄 -->
      <el-col :lg="4" :xs="24" class="mb-[12px]">
        <DeptTree v-model="queryParams.deptId" @node-click="handleQuery" />
      </el-col>

      <!-- Main Content Area / 主要內容區域 -->
      <el-col :lg="20" :xs="24">
        <!-- Search Form Container / 搜尋表單容器 -->
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <!-- Keywords Search Input / 關鍵字搜尋輸入框 -->
            <el-form-item :label="$t('metric.keywords')" prop="keyword">
              <el-input
                v-model="queryParams.keyword"
                :placeholder="$t('metric.keywordsPlaceholder')"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <!-- Physical Quantity Filter / 物理量篩選 -->
            <el-form-item :label="$t('metric.physicalQuantity')" prop="physicalQuantity">
              <el-select
                v-model="queryParams.physicalQuantity"
                :placeholder="$t('metric.physicalQuantityAll')"
                clearable
                style="width: 140px"
              >
                <el-option :label="$t('metric.length')" value="LENGTH" />
                <el-option :label="$t('metric.mass')" value="MASS" />
                <el-option :label="$t('metric.temperature')" value="TEMPERATURE" />
                <el-option :label="$t('metric.pressure')" value="PRESSURE" />
                <el-option :label="$t('metric.volume')" value="VOLUME" />
                <el-option :label="$t('metric.flow')" value="FLOW" />
                <el-option :label="$t('metric.velocity')" value="VELOCITY" />
                <el-option :label="$t('metric.power')" value="POWER" />
                <el-option :label="$t('metric.energy')" value="ENERGY" />
                <el-option :label="$t('metric.time')" value="TIME" />
                <el-option :label="$t('metric.frequency')" value="FREQUENCY" />
                <el-option :label="$t('metric.electricCurrent')" value="ELECTRIC_CURRENT" />
                <el-option :label="$t('metric.voltage')" value="VOLTAGE" />
                <el-option :label="$t('metric.resistance')" value="RESISTANCE" />
                <el-option :label="$t('metric.conductance')" value="CONDUCTANCE" />
                <el-option :label="$t('metric.capacitance')" value="CAPACITANCE" />
                <el-option :label="$t('metric.inductance')" value="INDUCTANCE" />
                <el-option :label="$t('metric.magneticFlux')" value="MAGNETIC_FLUX" />
                <el-option :label="$t('metric.luminousIntensity')" value="LUMINOUS_INTENSITY" />
                <el-option :label="$t('metric.illuminance')" value="ILLUMINANCE" />
                <el-option :label="$t('metric.radioactivity')" value="RADIOACTIVITY" />
                <el-option :label="$t('metric.angle')" value="ANGLE" />
                <el-option :label="$t('metric.area')" value="AREA" />
                <el-option :label="$t('metric.dimensionless')" value="DIMENSIONLESS" />
              </el-select>
            </el-form-item>

            <!-- Data Type Filter / 數據類型篩選 -->
            <el-form-item :label="$t('metric.dataType')" prop="dataType">
              <el-select
                v-model="queryParams.dataType"
                :placeholder="$t('metric.dataTypeAll')"
                clearable
                style="width: 120px"
              >
                <el-option :label="$t('metric.integer')" value="INTEGER" />
                <el-option :label="$t('metric.float')" value="FLOAT" />
                <el-option :label="$t('metric.double')" value="DOUBLE" />
                <el-option :label="$t('metric.boolean')" value="BOOLEAN" />
                <el-option :label="$t('metric.string')" value="STRING" />
                <el-option :label="$t('metric.timestamp')" value="TIMESTAMP" />
              </el-select>
            </el-form-item>

            <!-- Search Action Buttons / 搜尋操作按鈕 -->
            <el-form-item class="search-buttons">
              <el-button type="primary" icon="search" @click="handleQuery">
                {{ $t("metric.search") }}
              </el-button>
              <el-button icon="refresh" @click="handleResetQuery">
                {{ $t("metric.reset") }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Data Table Card / 資料表格卡片 -->
        <el-card shadow="hover" class="data-table">
          <!-- Table Toolbar / 表格工具列 -->
          <div class="data-table__toolbar">
            <div class="data-table__toolbar--actions">
              <!-- Add Metric Button / 新增指標按鈕 -->
              <el-button type="success" icon="plus" @click="handleOpenDialog()">
                {{ $t("metric.add") }}
              </el-button>
              <!-- Batch Delete Button / 批次刪除按鈕 -->
              <el-button
                type="danger"
                icon="delete"
                :disabled="selectIds.length === 0"
                @click="handleDelete()"
              >
                {{ $t("metric.delete") }}
              </el-button>
            </div>
          </div>

          <!-- Metric Data Table / 指標資料表格 -->
          <el-table
            v-loading="loading"
            :data="pageData.list"
            stripe
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <!-- Selection Column / 選擇欄位 -->
            <el-table-column type="selection" width="55" />

            <!-- Metric Name Column / 指標名稱欄位 -->
            <el-table-column :label="$t('metric.metricName')" prop="metricName" min-width="150">
              <template #default="scope">
                <div class="metric-name-cell">
                  <span class="metric-name">{{ scope.row.metricName }}</span>
                  <span v-if="scope.row.alias" class="metric-alias">({{ scope.row.alias }})</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column
              :label="$t('metric.physicalQuantity')"
              prop="physicalQuantity"
              width="120"
            >
              <template #default="scope">
                <el-tag size="small">
                  {{ getPhysicalQuantityText(scope.row.physicalQuantity) }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- Unit Column / 單位欄位 -->
            <el-table-column :label="$t('metric.unit')" prop="unit" width="100">
              <template #default="scope">
                <span class="unit-text">{{ getUnitText(scope.row.unit) }}</span>
              </template>
            </el-table-column>

            <!-- Data Type Column / 數據類型欄位 -->
            <el-table-column :label="$t('metric.dataType')" prop="dataType" width="100">
              <template #default="scope">
                <el-tag :type="getDataTypeTagType(scope.row.dataType)" size="small">
                  {{ getDataTypeText(scope.row.dataType) }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- Range Column / 數值範圍欄位 -->
            <el-table-column :label="$t('metric.range')" width="120">
              <template #default="scope">
                <span v-if="scope.row.minValue !== undefined && scope.row.maxValue !== undefined">
                  {{ scope.row.minValue }} - {{ scope.row.maxValue }}
                </span>
                <span v-else class="no-range">{{ $t("metric.noRange") }}</span>
              </template>
            </el-table-column>

            <!-- Department Column / 部門欄位 -->
            <el-table-column :label="$t('metric.deptName')" prop="deptName" width="120" />

            <!-- Status Column / 狀態欄位 -->
            <el-table-column :label="$t('metric.status')" align="center" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.isActive ? 'success' : 'danger'" size="small">
                  {{ scope.row.isActive ? $t("metric.active") : $t("metric.inactive") }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- Actions Column / 操作欄位 -->
            <el-table-column :label="$t('metric.actions')" align="center" width="150" fixed="right">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  icon="edit"
                  @click="handleOpenDialog(scope.row)"
                >
                  {{ $t("metric.edit") }}
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  icon="delete"
                  @click="handleDelete(scope.row)"
                >
                  {{ $t("metric.delete") }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- Pagination / 分頁 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="queryParams.page"
              v-model:page-size="queryParams.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="pageData.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Metric Form Dialog / 指標表單對話框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      :width="dialogSize"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" :inline="false">
        <!-- Metric Name / 指標名稱 -->
        <el-form-item :label="$t('metric.metricForm.metricName')" prop="metricName">
          <el-input
            v-model="formData.metricName"
            :placeholder="$t('metric.metricForm.metricNamePlaceholder')"
          />
        </el-form-item>

        <!-- Alias / 別名 -->
        <el-form-item :label="$t('metric.metricForm.alias')" prop="alias">
          <el-input
            v-model="formData.alias"
            :placeholder="$t('metric.metricForm.aliasPlaceholder')"
          />
        </el-form-item>

        <!-- Physical Quantity / 物理量 -->
        <el-form-item :label="$t('metric.metricForm.physicalQuantity')" prop="physicalQuantity">
          <el-select
            v-model="formData.physicalQuantity"
            :placeholder="$t('metric.metricForm.physicalQuantityPlaceholder')"
            style="width: 100%"
          >
            <el-option :label="$t('metric.length')" value="LENGTH" />
            <el-option :label="$t('metric.mass')" value="MASS" />
            <el-option :label="$t('metric.temperature')" value="TEMPERATURE" />
            <el-option :label="$t('metric.pressure')" value="PRESSURE" />
            <el-option :label="$t('metric.volume')" value="VOLUME" />
            <el-option :label="$t('metric.flow')" value="FLOW" />
            <el-option :label="$t('metric.velocity')" value="VELOCITY" />
            <el-option :label="$t('metric.power')" value="POWER" />
            <el-option :label="$t('metric.energy')" value="ENERGY" />
            <el-option :label="$t('metric.time')" value="TIME" />
            <el-option :label="$t('metric.frequency')" value="FREQUENCY" />
            <el-option :label="$t('metric.electricCurrent')" value="ELECTRIC_CURRENT" />
            <el-option :label="$t('metric.voltage')" value="VOLTAGE" />
            <el-option :label="$t('metric.resistance')" value="RESISTANCE" />
            <el-option :label="$t('metric.conductance')" value="CONDUCTANCE" />
            <el-option :label="$t('metric.capacitance')" value="CAPACITANCE" />
            <el-option :label="$t('metric.inductance')" value="INDUCTANCE" />
            <el-option :label="$t('metric.magneticFlux')" value="MAGNETIC_FLUX" />
            <el-option :label="$t('metric.luminousIntensity')" value="LUMINOUS_INTENSITY" />
            <el-option :label="$t('metric.illuminance')" value="ILLUMINANCE" />
            <el-option :label="$t('metric.radioactivity')" value="RADIOACTIVITY" />
            <el-option :label="$t('metric.angle')" value="ANGLE" />
            <el-option :label="$t('metric.area')" value="AREA" />
            <el-option :label="$t('metric.dimensionless')" value="DIMENSIONLESS" />
          </el-select>
        </el-form-item>

        <!-- Unit / 單位 -->
        <el-form-item :label="$t('metric.metricForm.unit')" prop="unit">
          <el-select
            v-model="formData.unit"
            :placeholder="$t('metric.metricForm.unitPlaceholder')"
            style="width: 100%"
          >
            <!-- Length Units -->
            <el-option-group :label="$t('metric.length')">
              <el-option :label="$t('metric.meter')" value="METER" />
              <el-option :label="$t('metric.kilometer')" value="KILOMETER" />
              <el-option :label="$t('metric.centimeter')" value="CENTIMETER" />
              <el-option :label="$t('metric.millimeter')" value="MILLIMETER" />
            </el-option-group>
            <!-- Mass Units -->
            <el-option-group :label="$t('metric.mass')">
              <el-option :label="$t('metric.kilogram')" value="KILOGRAM" />
              <el-option :label="$t('metric.gram')" value="GRAM" />
              <el-option :label="$t('metric.ton')" value="TON" />
            </el-option-group>
            <!-- Temperature Units -->
            <el-option-group :label="$t('metric.temperature')">
              <el-option :label="$t('metric.celsius')" value="CELSIUS" />
              <el-option :label="$t('metric.fahrenheit')" value="FAHRENHEIT" />
              <el-option :label="$t('metric.kelvin')" value="KELVIN" />
            </el-option-group>
            <!-- Time Units -->
            <el-option-group :label="$t('metric.time')">
              <el-option :label="$t('metric.second')" value="SECOND" />
              <el-option :label="$t('metric.minute')" value="MINUTE" />
              <el-option :label="$t('metric.hour')" value="HOUR" />
              <el-option :label="$t('metric.day')" value="DAY" />
            </el-option-group>
            <!-- Other Units -->
            <el-option :label="$t('metric.percent')" value="PERCENT" />
            <el-option :label="$t('metric.dimensionless')" value="DIMENSIONLESS" />
          </el-select>
        </el-form-item>

        <!-- Data Type / 數據類型 -->
        <el-form-item :label="$t('metric.metricForm.dataType')" prop="dataType">
          <el-select
            v-model="formData.dataType"
            :placeholder="$t('metric.metricForm.dataTypePlaceholder')"
            style="width: 100%"
          >
            <el-option :label="$t('metric.integer')" value="INTEGER" />
            <el-option :label="$t('metric.float')" value="FLOAT" />
            <el-option :label="$t('metric.double')" value="DOUBLE" />
            <el-option :label="$t('metric.boolean')" value="BOOLEAN" />
            <el-option :label="$t('metric.string')" value="STRING" />
            <el-option :label="$t('metric.timestamp')" value="TIMESTAMP" />
          </el-select>
        </el-form-item>

        <!-- Value Range / 數值範圍 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('metric.metricForm.minValue')" prop="minValue">
              <el-input-number
                v-model="formData.minValue"
                :placeholder="$t('metric.metricForm.minValuePlaceholder')"
                :precision="formData.precision || 2"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('metric.metricForm.maxValue')" prop="maxValue">
              <el-input-number
                v-model="formData.maxValue"
                :placeholder="$t('metric.metricForm.maxValuePlaceholder')"
                :precision="formData.precision || 2"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Precision / 精度 -->
        <el-form-item :label="$t('metric.metricForm.precision')" prop="precision">
          <el-input-number
            v-model="formData.precision"
            :min="0"
            :max="10"
            :placeholder="$t('metric.metricForm.precisionPlaceholder')"
            style="width: 100%"
          />
        </el-form-item>

        <!-- Description / 描述 -->
        <el-form-item :label="$t('metric.metricForm.description')" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('metric.metricForm.descriptionPlaceholder')"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCancel">{{ $t("metric.cancel") }}</el-button>
        <el-button type="primary" :loading="dialog.loading" @click="handleSubmit">
          {{ $t("metric.confirm") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRefs, watch } from "vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/store/modules/app-store";
import DeptTree from "@/views/system/user/components/DeptTree.vue";
import MetricAPI, {
  type MetricQuery,
  type MetricCreateForm,
  type MetricUpdateForm,
  type IotMetricDefinition,
  type PageResult,
} from "@/api/iot/metric-api";

const { t } = useI18n();
const appStore = useAppStore();

// Reactive data state
const state = reactive({
  loading: false,
  // Metric list data
  pageData: { list: [], total: 0 } as PageResult<IotMetricDefinition>,
  // Query parameters
  queryParams: {
    deptId: undefined as string | undefined,
    page: 0,
    size: 10,
    keyword: "",
    physicalQuantity: "",
    dataType: "",
  } as MetricQuery,
  // Selection management
  selectIds: [] as string[],
  // Dialog state
  dialog: {
    visible: false,
    title: "",
    loading: false,
  },
  // Form data
  formData: {
    metricName: "",
    alias: "",
    description: "",
    physicalQuantity: "",
    unit: "",
    dataType: "",
    minValue: undefined,
    maxValue: undefined,
    precision: 2,
    deptId: "0",
  } as MetricCreateForm,
});

// Destructure reactive state
const { loading, pageData, queryParams, selectIds, dialog, formData } = toRefs(state);

// Template refs
const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();

// Computed properties
const dialogSize = computed(() => (appStore.device === "desktop" ? "800px" : "90%"));

// Form validation rules
const rules = computed<FormRules>(() => ({
  metricName: [
    {
      required: true,
      message: t("metric.validation.metricNameRequired"),
      trigger: "blur",
    },
  ],
  physicalQuantity: [
    {
      required: true,
      message: t("metric.validation.physicalQuantityRequired"),
      trigger: "change",
    },
  ],
  unit: [
    {
      required: true,
      message: t("metric.validation.unitRequired"),
      trigger: "change",
    },
  ],
  dataType: [
    {
      required: true,
      message: t("metric.validation.dataTypeRequired"),
      trigger: "change",
    },
  ],
}));

// Utility functions
function getPhysicalQuantityText(physicalQuantity: string): string {
  const keyMap: Record<string, string> = {
    WATER_LEVEL: "waterLevel", // 新增對應實際 API 的值
    LENGTH: "length",
    MASS: "mass",
    TEMPERATURE: "temperature",
    PRESSURE: "pressure",
    VOLUME: "volume",
    FLOW: "flow",
    FLOW_RATE: "flow", // 新增對應 FLOW_RATE
    VELOCITY: "velocity",
    POWER: "power",
    ENERGY: "energy",
    TIME: "time",
    FREQUENCY: "frequency",
    ELECTRIC_CURRENT: "electricCurrent",
    VOLTAGE: "voltage",
    SIGNAL_STRENGTH: "signalStrength", // 新增對應 SIGNAL_STRENGTH
    RESISTANCE: "resistance",
    CONDUCTANCE: "conductance",
    CAPACITANCE: "capacitance",
    INDUCTANCE: "inductance",
    MAGNETIC_FLUX: "magneticFlux",
    LUMINOUS_INTENSITY: "luminousIntensity",
    ILLUMINANCE: "illuminance",
    RADIOACTIVITY: "radioactivity",
    ANGLE: "angle",
    AREA: "area",
    DIMENSIONLESS: "dimensionless",
  };
  return t(`metric.${keyMap[physicalQuantity] || physicalQuantity.toLowerCase()}`);
}

function getUnitText(unit: string): string {
  const keyMap: Record<string, string> = {
    METER: "meter",
    KILOMETER: "kilometer",
    CENTIMETER: "centimeter",
    MILLIMETER: "millimeter",
    KILOGRAM: "kilogram",
    GRAM: "gram",
    TON: "ton",
    CELSIUS: "celsius",
    FAHRENHEIT: "fahrenheit",
    KELVIN: "kelvin",
    SECOND: "second",
    MINUTE: "minute",
    HOUR: "hour",
    DAY: "day",
    PERCENT: "percent",
    VOLT: "volt", // 新增對應 VOLT
    DBM: "dbm", // 新增對應 DBM
    LITERS_PER_MINUTE: "litersPerMinute", // 新增對應 LITERS_PER_MINUTE
    DIMENSIONLESS: "dimensionless",
  };
  return t(`metric.${keyMap[unit] || unit.toLowerCase()}`);
}

function getDataTypeText(dataType: string): string {
  const keyMap: Record<string, string> = {
    INTEGER: "integer",
    FLOAT: "float",
    Float: "float", // 新增對應 Float (首字母大寫)
    Int32: "integer", // 新增對應 Int32
    DOUBLE: "double",
    BOOLEAN: "boolean",
    STRING: "string",
    TIMESTAMP: "timestamp",
  };
  return t(`metric.${keyMap[dataType] || dataType.toLowerCase()}`);
}

function getDataTypeTagType(dataType: string): "success" | "info" | "warning" | "danger" {
  const typeMap: Record<string, "success" | "info" | "warning" | "danger"> = {
    INTEGER: "success",
    FLOAT: "info",
    DOUBLE: "warning",
    BOOLEAN: "danger",
    STRING: "info",
    TIMESTAMP: "warning",
  };
  return typeMap[dataType] || "info";
}

// Event handlers
function handleSelectionChange(selection: IotMetricDefinition[]) {
  selectIds.value = selection.map((item) => item.id);
}

function handleQuery() {
  queryParams.value.page = 1; // Reset to first page
  fetchData();
}

function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.value.page = 1;
  fetchData();
}

function handleSizeChange(size: number) {
  queryParams.value.size = size;
  queryParams.value.page = 1;
  fetchData();
}

function handleCurrentChange(page: number) {
  queryParams.value.page = page;
  fetchData();
}

function handleOpenDialog(row?: IotMetricDefinition) {
  if (row) {
    // Edit mode
    dialog.value.title = t("metric.editMetric");
    Object.assign(formData.value, {
      id: row.id,
      metricName: row.metricName,
      alias: row.alias || "",
      description: row.description || "",
      physicalQuantity: row.physicalQuantity,
      unit: row.unit,
      dataType: row.dataType,
      minValue: row.minValue,
      maxValue: row.maxValue,
      precision: row.precision || 2,
      deptId: row.deptId,
    });
  } else {
    // Create mode
    dialog.value.title = t("metric.addMetric");
    Object.assign(formData.value, {
      metricName: "",
      alias: "",
      description: "",
      physicalQuantity: "",
      unit: "",
      dataType: "",
      minValue: undefined,
      maxValue: undefined,
      precision: 2,
      deptId: queryParams.value.deptId || "0",
    });
  }
  dialog.value.visible = true;
}

function handleCancel() {
  dialog.value.visible = false;
  formRef.value?.resetFields();
}

async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    dialog.value.loading = true;

    if ((formData.value as any).id) {
      // Update
      const updateData: MetricUpdateForm = {
        metricName: formData.value.metricName,
        alias: formData.value.alias,
        description: formData.value.description,
        physicalQuantity: formData.value.physicalQuantity,
        unit: formData.value.unit,
        dataType: formData.value.dataType,
        minValue: formData.value.minValue,
        maxValue: formData.value.maxValue,
        precision: formData.value.precision,
      };
      await MetricAPI.updateMetricDefinition((formData.value as any).id, updateData);
      ElMessage.success(t("metric.updateSuccess"));
    } else {
      // Create
      await MetricAPI.createMetricDefinition(formData.value);
      ElMessage.success(t("metric.createSuccess"));
    }

    dialog.value.visible = false;
    formRef.value.resetFields();
    fetchData();
  } catch (error) {
    console.error("Error submitting metric:", error);
    ElMessage.error(t("metric.submitError"));
  } finally {
    dialog.value.loading = false;
  }
}

async function handleDelete(row?: IotMetricDefinition) {
  const ids = row ? [row.id] : selectIds.value;
  if (ids.length === 0) return;

  try {
    await ElMessageBox.confirm(t("metric.confirmDelete"), t("metric.confirmDeleteTitle"), {
      confirmButtonText: t("metric.confirm"),
      cancelButtonText: t("metric.cancel"),
      type: "warning",
    });

    for (const id of ids) {
      await MetricAPI.deleteMetricDefinition(id, queryParams.value.deptId || "0");
    }

    ElMessage.success(t("metric.deleteSuccess"));
    selectIds.value = [];
    fetchData();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Error deleting metrics:", error);
      ElMessage.error(t("metric.deleteError"));
    }
  }
}

// Data fetching methods
async function fetchData() {
  if (!queryParams.value.deptId) {
    ElMessage.warning(t("metric.selectDeptFirst"));
    return;
  }

  try {
    loading.value = true;
    const response = await MetricAPI.getMetricDefinitionsPage(queryParams.value);

    console.log("API Response:", response);

    // Handle different possible response structures
    if (response && response.data && response.data.list) {
      // Nested structure: response.data.data.list
      pageData.value = response.data;
    } else if (response && response.list) {
      // Direct structure: response.list
      pageData.value = response;
    } else {
      console.warn("Unexpected response structure:", response);
      pageData.value = { list: [], total: 0 };
    }

    console.log("Processed pageData:", pageData.value);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    ElMessage.error(t("metric.fetchError"));
  } finally {
    loading.value = false;
  }
}

// Lifecycle hooks
onMounted(() => {
  // Set default department ID (based on database data showing dept_id = 2)
  if (!queryParams.value.deptId) {
    queryParams.value.deptId = "2";
  }
  // Data will be fetched automatically by the watcher
});

// Watch for department ID changes and fetch data automatically
watch(
  () => queryParams.value.deptId,
  (newDeptId) => {
    if (newDeptId) {
      fetchData();
    }
  }
);
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
  .data-table__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .data-table__toolbar--actions {
      display: flex;
      gap: 12px;
    }
  }

  .metric-name-cell {
    .metric-name {
      font-weight: 500;
    }

    .metric-alias {
      margin-left: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .unit-text {
    font-family: monospace;
    font-size: 12px;
  }

  .no-range {
    font-style: italic;
    color: var(--el-text-color-secondary);
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
