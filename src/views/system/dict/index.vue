<!-- 
  @author youlaitech
  @since 2024-08-27
 
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025-09-12

  Dictionary Management Component
  
  This component provides comprehensive dictionary management functionality for the IoT water level monitoring system including:
  - Dictionary CRUD operations (Create, Read, Update, Delete) with data validati  console    // Debug: List all available routes
  const allRoutes = router.getRoutes();
  console.log("📋 [Dict] All available routes with details:");
  allRoutes.forEach((route, index) => {
    console.log(`  ${index + 1}. Name: "${route.name}" | Path: "${route.path}" | Component: ${route.component ? 'loaded' : 'null'}`);
  });
  
  // Look specifically for any dict-related routes
  const dictRoutes = allRoutes.filter(r => 
    r.path.includes('dict') || 
    String(r.name || '').toLowerCase().includes('dict')
  );
  console.log("🔍 [Dict] Dict-related routes found:", dictRoutes.map(r => ({
    name: r.name,
    path: r.path
  })));

  // Look for the specific route
  const dictItemRoute = allRoutes.find((r) => r.name === "DictItem");
  const dictItemByPath = allRoutes.find(
    (r) => r.path === "/system/dict-item" || r.path.endsWith("dict-item")
  );[Dict] All available routes:", allRoutes.map((r) => ({
    name: String(r.name || "unnamed"),
    path: r.path,
    hasComponents: !!r.components,
  })));sole.log("📋 [Dict] All available routes:", allRoutes.map((r) => ({log("🔍 [Dict] Router state debug:", {n
  - Advanced search and filtering capabilities by dictionary name and code
  - Dictionary status management with enabled/disabled states
  - Navigation to dictionary items management for detailed configuration
  - Batch operations for efficient dictionary management
  - Internationalization support with reactive validation and responsive UI design
  - Professional form validation with multilingual error messages
-->

<!-- 字典 -->
<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="$t('dict.keywords')" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('dict.dictNamePlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">
            {{ $t("common.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">
            {{ $t("common.reset") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleAddClick()">
            {{ $t("dict.addDict") }}
          </el-button>
          <el-button
            type="danger"
            :disabled="ids.length === 0"
            icon="delete"
            @click="handleDelete()"
          >
            {{ $t("common.delete") }}
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        highlight-current-row
        :data="tableData"
        border
        class="data-table__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="$t('dict.dictName')" prop="name" />
        <el-table-column :label="$t('dict.dictCode')" prop="dictCode" />
        <el-table-column :label="$t('dict.status')" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? $t("dict.statusNormal") : $t("dict.statusDisabled") }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" :label="$t('dict.operation')" align="center" width="220">
          <template #default="scope">
            <el-button type="primary" link size="small" @click.stop="handleOpenDictData(scope.row)">
              <template #icon>
                <Collection />
              </template>
              {{ $t("dict.dictData") }}
            </el-button>

            <el-button
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleEditClick(scope.row.id)"
            >
              {{ $t("dict.edit") }}
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              icon="delete"
              @click.stop="handleDelete(scope.row.id)"
            >
              {{ $t("dict.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchData"
      />
    </el-card>

    <!--字典彈窗-->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="computedRules" label-width="80px">
        <el-form-item :label="$t('dict.form.dictName')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('dict.form.dictNamePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('dict.form.dictCode')" prop="dictCode">
          <el-input
            v-model="formData.dictCode"
            :placeholder="$t('dict.form.dictCodePlaceholder')"
          />
        </el-form-item>

        <el-form-item :label="$t('dict.form.status')">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">{{ $t("dict.form.statusNormal") }}</el-radio>
            <el-radio :value="0">{{ $t("dict.form.statusDisabled") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('dict.form.remark')">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :placeholder="$t('dict.form.remarkPlaceholder')"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmitClick">
            {{ $t("common.confirm") }}
          </el-button>
          <el-button @click="handleCloseDialog">
            {{ $t("common.cancel") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Dict",
  inherititems: false,
});

import DictAPI, { DictPageQuery, DictPageVO, DictForm } from "@/api/system/dict-api";

import router from "@/router";

const { t } = useI18n();

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<DictPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const tableData = ref<DictPageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<DictForm>({});

const computedRules = computed(() => {
  const rules: Partial<Record<string, any>> = {
    name: [{ required: true, message: t("dict.validation.dictNameRequired"), trigger: "blur" }],
    dictCode: [{ required: true, message: t("dict.validation.dictCodeRequired"), trigger: "blur" }],
  };
  return rules;
});

/**
 * Fetch dictionary data based on query parameters
 * Updates loading state and table data
 */
function fetchData() {
  loading.value = true;
  DictAPI.getPage(queryParams)
    .then((data) => {
      tableData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * Query dictionaries with reset page number
 * Resets to first page and fetches data
 */
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * Reset query form and refresh data
 * Clears all form fields and fetches data
 */
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * Handle table row selection change
 * Updates selected IDs for batch operations
 */
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

/**
 * Open add dictionary dialog
 * Sets dialog title and shows form
 */
function handleAddClick() {
  dialog.visible = true;
  dialog.title = t("dict.form.title.add");
}

/**
 * Open edit dictionary dialog
 * Loads existing dictionary data for editing
 *
 * @param id Dictionary ID to edit
 */
function handleEditClick(id: string) {
  dialog.visible = true;
  dialog.title = t("dict.form.title.edit");
  DictAPI.getFormData(id).then((data) => {
    Object.assign(formData, data);
  });
}

/**
 * Submit dictionary form
 * Handles both create and update operations
 */
function handleSubmitClick() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        DictAPI.update(id, formData)
          .then(() => {
            ElMessage.success(t("dict.messages.updateSuccess"));
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DictAPI.create(formData)
          .then(() => {
            ElMessage.success(t("dict.messages.createSuccess"));
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/**
 * Close dictionary dialog and reset form
 * Hides dialog and clears all form data
 */
function handleCloseDialog() {
  dialog.visible = false;

  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();

  formData.id = undefined;
}

/**
 * Delete dictionary entries
 * Supports both single and batch deletion with confirmation
 *
 * @param id Optional dictionary ID for single deletion
 */
function handleDelete(id?: number) {
  const attrGroupIds = [id || ids.value].join(",");
  if (!attrGroupIds) {
    ElMessage.warning(t("dict.messages.selectDeleteItems"));
    return;
  }
  ElMessageBox.confirm(t("dict.messages.confirmDelete"), t("dict.messages.deleteConfirmTitle"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning",
  }).then(
    () => {
      DictAPI.deleteByIds(attrGroupIds).then(() => {
        ElMessage.success(t("dict.messages.deleteSuccess"));
        handleResetQuery();
      });
    },
    () => {
      ElMessage.info(t("dict.messages.deleteCancelled"));
    }
  );
}

/**
 * Navigate to dictionary items management
 * Opens dictionary data page with context parameters
 *
 * @param row Dictionary row data containing code and name
 */
function handleOpenDictData(row: DictPageVO) {
  // Debug: Check current route and router state
  console.log("� [Dict] Router state debug:", {
    currentRoute: router.currentRoute.value.path,
    currentName: router.currentRoute.value.name,
    hasRouteByName: router.hasRoute("DictItem"),
    totalRoutes: router.getRoutes().length,
  });

  // Debug: List all available routes
  const allRoutes = router.getRoutes();
  console.log(
    "� [Dict] All available routes:",
    allRoutes.map((r) => ({
      name: r.name,
      path: r.path,
      component: r.component?.name || "component_unknown",
    }))
  );

  // Look for the specific route
  const dictItemRoute = allRoutes.find((r) => r.name === "DictItem");
  const dictItemByPath = allRoutes.find(
    (r) => r.path === "/system/dict-item" || r.path.endsWith("dict-item")
  );

  console.log("🎯 [Dict] Route resolution:", {
    byName: dictItemRoute ? `Found: ${dictItemRoute.path}` : "NOT FOUND",
    byPath: dictItemByPath
      ? `Found: ${dictItemByPath.name || "unnamed"} at ${dictItemByPath.path}`
      : "NOT FOUND",
  });

  // Try navigation by name first, then by path, then fallback to direct path
  const targetRoute = dictItemRoute || dictItemByPath;
  if (!targetRoute) {
    console.warn("⚠️ [Dict] Route not found in router, trying direct navigation");
    // Fallback: try direct path navigation as the route should exist
    router
      .push({
        path: "/system/dict-item",
        query: {
          dictCode: row.dictCode,
          title: "【" + row.name + "】字典資料",
        },
      })
      .then(() => {
        console.log("✅ [Dict] Direct path navigation successful");
      })
      .catch((error) => {
        console.error("❌ [Dict] Direct path navigation also failed:", error);
        ElMessage.error(`導航失敗: ${error.message}`);
      });
    return;
  }

  const navigationOptions = {
    ...(dictItemRoute ? { name: "DictItem" } : { path: targetRoute.path }),
    query: {
      dictCode: row.dictCode,
      title: "【" + row.name + "】字典資料",
    },
  };

  console.log("🚀 [Dict] Attempting navigation with:", navigationOptions);

  router
    .push(navigationOptions)
    .then(() => {
      console.log("✅ [Dict] Navigation successful");
    })
    .catch((error) => {
      console.error("❌ [Dict] Navigation failed:", error);
      ElMessage.error(`導航失敗: ${error.message}`);
    });
}

onMounted(() => {
  handleQuery();
});
</script>
