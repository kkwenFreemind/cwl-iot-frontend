<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" :label="$t('metric.keywords')">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('metric.keywordsPlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <!-- Unit Filter / 單位篩選 -->
        <el-form-item :label="$t('metric.unit')" prop="unit">
          <el-input
            v-model="queryParams.unit"
            :placeholder="$t('metric.unitPlaceholder')"
            clearable
            style="width: 120px"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="success" icon="plus" @click="handleAddClick">
            {{ $t("metric.add") }}
          </el-button>
          <el-button type="primary" icon="search" @click="handleQuery">
            {{ $t("metric.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">
            {{ $t("metric.reset") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 數據表格 -->
    <el-card shadow="hover" class="data-table">
      <el-table
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        class="data-table__content"
      >
        <el-table-column :label="$t('metric.metricName')" prop="metricName" min-width="150" />
        <el-table-column :label="$t('metric.alias')" prop="alias" min-width="120" />
        <el-table-column
          :label="$t('metric.physicalQuantity')"
          prop="physicalQuantity"
          min-width="130"
          align="center"
        >
          <template #default="scope">
            <span>{{ getPhysicalQuantityText(scope.row.physicalQuantity) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('metric.unit')" prop="unit" min-width="100" align="center" />
        <el-table-column
          :label="$t('metric.dataType')"
          prop="dataType"
          min-width="120"
          align="center"
        >
          <template #default="scope">
            <span>{{ getDataTypeText(scope.row.dataType) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('metric.isActive')"
          align="center"
          prop="isActive"
          min-width="100"
        >
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'danger'" size="small">
              {{ scope.row.isActive ? $t("metric.active") : $t("metric.inactive") }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('metric.createdAt')"
          align="center"
          prop="createdAt"
          min-width="170"
        />
        <el-table-column :label="$t('metric.operation')" fixed="right" min-width="200">
          <template #default="scope">
            <el-button
              type="primary"
              icon="edit"
              link
              size="small"
              @click="handleEditClick(scope.row)"
            >
              {{ $t("metric.edit") }}
            </el-button>
            <el-button
              type="danger"
              icon="delete"
              link
              size="small"
              @click="handleDelete(scope.row)"
            >
              {{ $t("metric.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁組件 -->
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.page!"
        v-model:limit="queryParams.size!"
        @pagination="fetchData"
      />
    </el-card>

    <!-- 表單抽屜 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      size="700px"
      @close="handleCloseDialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <el-form-item :label="$t('metric.metricName')" prop="metricName">
          <el-input
            v-model="formData.metricName"
            :placeholder="$t('metric.metricNamePlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('metric.alias')" prop="alias">
          <el-input v-model="formData.alias" :placeholder="$t('metric.aliasPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('metric.physicalQuantity')" prop="physicalQuantity">
          <el-select
            v-model="formData.physicalQuantity"
            :placeholder="$t('metric.physicalQuantityPlaceholder')"
          >
            <el-option label="水位" value="WATER_LEVEL" />
            <el-option label="溫度" value="TEMPERATURE" />
            <el-option label="濕度" value="HUMIDITY" />
            <el-option label="壓力" value="PRESSURE" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="$t('metric.unit')" prop="unit">
              <el-input v-model="formData.unit" :placeholder="$t('metric.unitPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('metric.dataType')" prop="dataType">
              <el-select
                v-model="formData.dataType"
                :placeholder="$t('metric.dataTypePlaceholder')"
              >
                <el-option label="整數" value="INTEGER" />
                <el-option label="浮點數" value="FLOAT" />
                <el-option label="布林值" value="BOOLEAN" />
                <el-option label="字符串" value="STRING" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('metric.isActive')" prop="isActive">
          <el-switch v-model="formData.isActive" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="handleCloseDialog">{{ $t("common.cancel") }}</el-button>
          <el-button type="primary" :loading="dialog.loading" @click="handleSubmit">
            {{ $t("common.confirm") }}
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user-store";
import MetricAPI, { IotMetricDefinition } from "@/api/iot/metric-api";
import UserAPI from "@/api/system/user-api";

defineOptions({
  name: "MetricManagement",
  inheritAttrs: false,
});

/**
 * 表單驗證規則
 */
const rules = computed(() => ({
  metricName: [
    {
      required: true,
      message: "請輸入指標名稱",
      trigger: "blur",
    },
  ],
  physicalQuantity: [
    {
      required: true,
      message: "請選擇物理量",
      trigger: "change",
    },
  ],
  unit: [
    {
      required: true,
      message: "請輸入單位",
      trigger: "blur",
    },
  ],
  dataType: [
    {
      required: true,
      message: "請選擇數據類型",
      trigger: "change",
    },
  ],
}));

/**
 * 響應式狀態
 */
const loading = ref(false);
const total = ref(0);
const dialog = reactive({
  visible: false,
  title: "",
  loading: false,
});

const queryParams = reactive({
  page: 1, // Frontend uses 1-based, backend converts to 0-based
  size: 10,
  keywords: "", // Changed from 'keyword' to 'keywords' to match backend
  physicalQuantity: "",
  unit: "", // Added unit field to match backend
  dataType: "",
  deptId: undefined as number | undefined,
});

const formData = reactive({
  id: "",
  metricName: "",
  alias: "",
  physicalQuantity: "WATER_LEVEL",
  unit: "",
  dataType: "FLOAT",
  isActive: true,
});

const pageData = ref<IotMetricDefinition[]>([]);

/**
 * 用戶 store
 */
const userStore = useUserStoreHook();

/**
 * 表單引用
 */
const queryFormRef = ref();
const formRef = ref();

/**
 * 數據獲取
 */
async function fetchData() {
  loading.value = true;

  try {
    // 獲取用戶個人資料以獲取 deptId
    const profile = await UserAPI.getProfile();
    const deptId = profile.deptId ? Number(profile.deptId) : 1;

    // 過濾空的查詢參數
    const params: any = {
      ...queryParams,
    };
    Object.keys(params).forEach((key) => {
      if (params[key] === "" || params[key] === undefined) {
        delete params[key];
      }
    });

    // 添加部門ID
    params.deptId = deptId;

    console.log("獲取指標數據，deptId:", deptId, "完整參數:", params);

    const data = await MetricAPI.getMetricDefinitionsPage(params);

    if (data && typeof data === "object") {
      // API 返回的數據結構是嵌套的：data.data.list 和 data.data.total
      const actualData = data.data || data;
      pageData.value = actualData.list || actualData.data || [];
      total.value = actualData.total || actualData.count || 0;
    } else {
      pageData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error("獲取數據失敗:", error);
    ElMessage.error("獲取數據失敗");
  } finally {
    loading.value = false;
  }
}

/**
 * 搜尋處理
 */
function handleQuery() {
  queryParams.page = 1;
  fetchData();
}

/**
 * 重置搜尋
 */
function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.page = 1;
  queryParams.keywords = "";
  queryParams.physicalQuantity = "";
  queryParams.unit = "";
  queryParams.dataType = "";
  fetchData();
}

/**
 * 新增按鈕點擊
 */
async function handleAddClick() {
  dialog.title = "新增指標定義";
  await resetForm();
  dialog.visible = true;
}

/**
 * 編輯按鈕點擊
 */
async function handleEditClick(row: IotMetricDefinition) {
  dialog.title = "編輯指標定義";
  Object.assign(formData, row);
  dialog.visible = true;
}

/**
 * 刪除處理
 */
async function handleDelete(row: IotMetricDefinition) {
  try {
    await ElMessageBox.confirm("確定要刪除此指標定義嗎？", "警告", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      type: "warning",
    });

    // 獲取用戶個人資料以獲取 deptId
    const profile = await UserAPI.getProfile();
    const deptId = profile.deptId ? String(profile.deptId) : "1";

    await MetricAPI.deleteMetricDefinition(row.id, deptId);

    ElMessage.success("刪除成功");
    fetchData();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("刪除失敗:", error);
      ElMessage.error("刪除失敗");
    }
  }
}

/**
 * 表單提交
 */
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    const valid = await formRef.value.validate();
    if (!valid) return;

    dialog.loading = true;

    // 獲取用戶個人資料以獲取 deptId
    const profile = await UserAPI.getProfile();
    const deptId = profile.deptId ? Number(profile.deptId) : 1;

    const submitData: any = {
      metricName: formData.metricName,
      alias: formData.alias,
      physicalQuantity: formData.physicalQuantity,
      unit: formData.unit,
      dataType: formData.dataType,
      isActive: formData.isActive,
    };

    console.log("提交指標數據，deptId:", deptId, "提交數據:", submitData);

    if (formData.id) {
      // 更新
      await MetricAPI.updateMetricDefinition(formData.id, submitData, deptId.toString());
      ElMessage.success("更新成功");
    } else {
      // 新增
      await MetricAPI.createMetricDefinition(submitData, deptId.toString());
      ElMessage.success("新增成功");
    }

    handleCloseDialog();
    fetchData();
  } catch (error) {
    console.error("保存失敗:", error);
    ElMessage.error("保存失敗");
  } finally {
    dialog.loading = false;
  }
}

/**
 * 關閉對話框
 */
async function handleCloseDialog() {
  dialog.visible = false;
  await resetForm();
}

/**
 * 重置表單
 */
async function resetForm() {
  Object.assign(formData, {
    id: "",
    metricName: "",
    alias: "",
    physicalQuantity: "WATER_LEVEL",
    unit: "",
    dataType: "FLOAT",
    isActive: true,
  });
  formRef.value?.resetFields();
}

/**
 * 工具函數
 */
function getPhysicalQuantityText(physicalQuantity: string): string {
  const map: Record<string, string> = {
    WATER_LEVEL: "Water Level",
    TEMPERATURE: "Temperature",
    VOLTAGE: "Voltage",
    SIGNAL_STRENGTH: "Singnal Strength",
    OTHER: "Other",
  };
  return map[physicalQuantity] || physicalQuantity;
}

function getDataTypeText(dataType: string): string {
  const map: Record<string, string> = {
    INTEGER: "整數",
    FLOAT: "浮點數",
    BOOLEAN: "布林值",
    STRING: "字符串",
  };
  return map[dataType] || dataType;
}

/**
 * 組件掛載時獲取數據
 */
onMounted(async () => {
  // 確保用戶資訊已載入
  if (!userStore.userInfo.userId) {
    try {
      await userStore.getUserInfo();
    } catch (error) {
      console.error("獲取用戶資訊失敗:", error);
    }
  }

  fetchData();
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

.drawer-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>
