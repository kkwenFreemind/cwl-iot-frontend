<!-- 
  @author youlaitech
  @since 2024-08-27 10:31
 
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025/09/12

  User Management Component
  使用者管理組件
  
  This component provides comprehensive user management functionality including:
  - User listing with pagination and filtering
  - User CRUD operations (Create, Read, Update, Delete)
  - Password reset functionality
  - Department-based filtering with tree structure
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
            <el-form-item :label="$t('user.keywords')" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                :placeholder="$t('user.keywordsPlaceholder')"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <!-- User Status Filter / 使用者狀態篩選 -->
            <el-form-item :label="$t('user.status')" prop="status">
              <el-select
                v-model="queryParams.status"
                :placeholder="$t('user.statusAll')"
                clearable
                style="width: 100px"
              >
                <el-option :label="$t('user.statusNormal')" :value="1" />
                <el-option :label="$t('user.statusDisabled')" :value="0" />
              </el-select>
            </el-form-item>

            <!-- Search Action Buttons / 搜尋操作按鈕 -->
            <el-form-item class="search-buttons">
              <el-button type="primary" icon="search" @click="handleQuery">
                {{ $t("user.search") }}
              </el-button>
              <el-button icon="refresh" @click="handleResetQuery">{{ $t("user.reset") }}</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Data Table Card / 資料表格卡片 -->
        <el-card shadow="hover" class="data-table">
          <!-- Table Toolbar / 表格工具列 -->
          <div class="data-table__toolbar">
            <div class="data-table__toolbar--actions">
              <!-- Add User Button / 新增使用者按鈕 -->
              <el-button type="success" icon="plus" @click="handleOpenDialog()">
                {{ $t("user.add") }}
              </el-button>
              <!-- Batch Delete Button / 批次刪除按鈕 -->
              <el-button
                type="danger"
                icon="delete"
                :disabled="selectIds.length === 0"
                @click="handleDelete()"
              >
                {{ $t("user.delete") }}
              </el-button>
            </div>
          </div>

          <!-- User Data Table / 使用者資料表格 -->
          <el-table
            v-loading="loading"
            :data="pageData"
            border
            stripe
            highlight-current-row
            class="data-table__content"
            @selection-change="handleSelectionChange"
          >
            <!-- Selection Column / 選擇欄位 -->
            <el-table-column type="selection" width="50" align="center" />
            <!-- Username Column / 使用者名稱欄位 -->
            <el-table-column :label="$t('user.username')" prop="username" />
            <!-- Nickname Column / 暱稱欄位 -->
            <el-table-column
              :label="$t('user.nickname')"
              width="150"
              align="center"
              prop="nickname"
            />
            <!-- Department Column / 部門欄位 -->
            <el-table-column
              :label="$t('user.department')"
              width="120"
              align="center"
              prop="deptName"
            />
            <!-- Status Column with Tag Display / 狀態欄位帶標籤顯示 -->
            <el-table-column :label="$t('user.status')" align="center" prop="status" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status == 1 ? 'success' : 'info'">
                  {{ scope.row.status == 1 ? $t("user.statusNormal") : $t("user.statusDisabled") }}
                </el-tag>
              </template>
            </el-table-column>
            <!-- Create Time Column / 建立時間欄位 -->
            <el-table-column
              :label="$t('user.createTime')"
              align="center"
              prop="createTime"
              width="150"
            />
            <!-- Operation Column with Action Buttons / 操作欄位帶操作按鈕 -->
            <el-table-column :label="$t('user.operation')" fixed="right" width="220">
              <template #default="scope">
                <!-- Reset Password Button / 重置密碼按鈕 -->
                <el-button
                  type="primary"
                  icon="RefreshLeft"
                  size="small"
                  link
                  @click="handleResetPassword(scope.row)"
                >
                  {{ $t("user.resetPassword") }}
                </el-button>
                <!-- Edit User Button / 編輯使用者按鈕 -->
                <el-button
                  type="primary"
                  icon="edit"
                  link
                  size="small"
                  @click="handleOpenDialog(scope.row.id)"
                >
                  {{ $t("user.edit") }}
                </el-button>
                <!-- Delete User Button / 刪除使用者按鈕 -->
                <el-button
                  type="danger"
                  icon="delete"
                  link
                  size="small"
                  @click="handleDelete(scope.row.id)"
                >
                  {{ $t("user.delete") }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- Pagination Component / 分頁組件 -->
          <pagination
            v-if="total > 0"
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="fetchData"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- User Form Drawer / 使用者表單抽屜 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <!-- User Form / 使用者表單 -->
      <el-form ref="userFormRef" :model="formData" :rules="rules" label-width="80px">
        <!-- Username Field (readonly when editing) / 使用者名稱欄位（編輯時唯讀） -->
        <el-form-item :label="$t('user.userForm.username')" prop="username">
          <el-input
            v-model="formData.username"
            :readonly="!!formData.id"
            :placeholder="$t('user.userForm.usernamePlaceholder')"
          />
        </el-form-item>

        <!-- Nickname Field / 暱稱欄位 -->
        <el-form-item :label="$t('user.userForm.nickname')" prop="nickname">
          <el-input
            v-model="formData.nickname"
            :placeholder="$t('user.userForm.nicknamePlaceholder')"
          />
        </el-form-item>

        <!-- Department Tree Select / 部門樹狀選擇器 -->
        <el-form-item :label="$t('user.userForm.department')" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            :placeholder="$t('user.userForm.departmentPlaceholder')"
            :data="deptOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <!-- Role Multi-Select / 角色多選器 -->
        <el-form-item :label="$t('user.userForm.role')" prop="roleIds">
          <el-select
            v-model="formData.roleIds"
            multiple
            :placeholder="$t('user.userForm.rolePlaceholder')"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!-- Status Switch / 狀態開關 -->
        <el-form-item :label="$t('user.userForm.status')" prop="status">
          <el-switch
            v-model="formData.status"
            inline-prompt
            :active-text="$t('user.statusNormal')"
            :inactive-text="$t('user.statusDisabled')"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>

      <!-- Drawer Footer with Action Buttons / 抽屜底部操作按鈕 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">
            {{ $t("user.userForm.confirm") }}
          </el-button>
          <el-button @click="handleCloseDialog">{{ $t("user.userForm.cancel") }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<!--
/**
 * User Management Page Component
 * 
 * @description Comprehensive user management interface with CRUD operations
 * @features
 * - User listing with pagination and filters
 * - Department-based tree filtering
 * - User creation, editing, and deletion
 * - Password reset functionality
 * - Responsive design with drawer forms
 * - Internationalization support
 * 
 * @author Frontend Team
 * @version 1.0.0
 */
-->

<script setup lang="ts">
// Store and Enum Imports / 儲存與枚舉匯入
import { useAppStore } from "@/store/modules/app-store";
import { DeviceEnum } from "@/enums/settings/device.enum";

// API Layer Imports / API 層匯入
import UserAPI, { UserForm, UserPageQuery, UserPageVO } from "@/api/system/user-api";
import DeptAPI from "@/api/system/dept-api";
import RoleAPI from "@/api/system/role-api";

// Component Imports / 組件匯入
import DeptTree from "./components/DeptTree.vue";

// Component Configuration / 組件配置
defineOptions({
  name: "User",
  inheritAttrs: false,
});

// Reactive Dependencies / 響應式依賴
const appStore = useAppStore();
const { t } = useI18n();

// Template References / 模板引用
const queryFormRef = ref();
const userFormRef = ref();

// Query Parameters for User List / 使用者列表查詢參數
const queryParams = reactive<UserPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// Data State Management / 資料狀態管理
const pageData = ref<UserPageVO[]>();
const total = ref(0);
const loading = ref(false);

// Dialog State Management / 對話框狀態管理
const dialog = reactive({
  visible: false,
  title: "",
});

// Responsive Drawer Size / 響應式抽屜尺寸
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

// Form Data for User Creation/Editing / 使用者建立/編輯表單資料
const formData = reactive<UserForm>({
  status: 1,
});

// Form Validation Rules / 表單驗證規則
const rules = reactive({
  username: [
    {
      required: true,
      message: computed(() => t("user.validation.usernameRequired")),
      trigger: "blur",
    },
  ],
  nickname: [
    {
      required: true,
      message: computed(() => t("user.validation.nicknameRequired")),
      trigger: "blur",
    },
  ],
  deptId: [
    { required: true, message: computed(() => t("user.validation.deptRequired")), trigger: "blur" },
  ],
  roleIds: [
    { required: true, message: computed(() => t("user.validation.roleRequired")), trigger: "blur" },
  ],
});

// Selection State for Batch Operations / 批次操作選擇狀態
const selectIds = ref<number[]>([]);

// Options for Form Selects / 表單選擇器選項
const deptOptions = ref<OptionType[]>();
const roleOptions = ref<OptionType[]>();

/**
 * Fetch user data from API with current query parameters
 * 根據當前查詢參數從 API 獲取使用者資料
 */
async function fetchData() {
  loading.value = true;
  try {
    const data = await UserAPI.getPage(queryParams);
    pageData.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
}

/**
 * Handle search query with reset to first page
 * 處理搜尋查詢並重置到第一頁
 */
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * Reset search form and query parameters
 * 重置搜尋表單和查詢參數
 */
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  queryParams.deptId = undefined;
  queryParams.createTime = undefined;
  fetchData();
}

/**
 * Handle table selection change for batch operations
 * 處理表格選擇變更以供批次操作使用
 *
 * @param selection - Array of selected row objects
 */
function handleSelectionChange(selection: any[]) {
  selectIds.value = selection.map((item) => item.id);
}

/**
 * Handle password reset for specific user
 * 處理特定使用者的密碼重置
 *
 * @param row - User row data object
 */
function handleResetPassword(row: UserPageVO) {
  ElMessageBox.prompt(
    t("user.resetPasswordDialog.prompt", { username: row.username }),
    t("user.resetPasswordDialog.title"),
    {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
    }
  ).then(
    ({ value }) => {
      if (!value || value.length < 6) {
        ElMessage.warning(t("user.resetPasswordDialog.minLengthWarning"));
        return false;
      }
      UserAPI.resetPassword(row.id, value).then(() => {
        ElMessage.success(t("user.resetPasswordDialog.successMessage", { password: value }));
      });
    },
    () => {
      ElMessage.info(t("user.resetPasswordDialog.cancelMessage"));
    }
  );
}

/**
 * Open user form drawer for create or edit operations
 * 開啟使用者表單抽屜進行建立或編輯操作
 *
 * @param id - Optional user ID for edit mode
 */
async function handleOpenDialog(id?: string) {
  dialog.visible = true;
  // Load form options data / 載入表單選項資料
  roleOptions.value = await RoleAPI.getOptions();
  deptOptions.value = await DeptAPI.getOptions();

  if (id) {
    // Edit mode: Load existing user data / 編輯模式：載入現有使用者資料
    dialog.title = t("user.userForm.title.edit");
    UserAPI.getFormData(id).then((data) => {
      Object.assign(formData, { ...data });
    });
  } else {
    // Create mode: Set default title / 建立模式：設定預設標題
    dialog.title = t("user.userForm.title.add");
  }
}

/**
 * Close user form drawer and reset form state
 * 關閉使用者表單抽屜並重置表單狀態
 */
function handleCloseDialog() {
  dialog.visible = false;
  userFormRef.value.resetFields();
  userFormRef.value.clearValidate();

  // Reset form data to initial state / 重置表單資料到初始狀態
  formData.id = undefined;
  formData.status = 1;
}

/**
 * Handle form submission with debounce to prevent multiple submissions
 * 處理表單提交並使用防抖以防止多次提交
 */
const handleSubmit = useDebounceFn(() => {
  userFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const userId = formData.id;
      loading.value = true;

      if (userId) {
        // Update existing user / 更新現有使用者
        UserAPI.update(userId, formData)
          .then(() => {
            ElMessage.success(t("user.updateSuccessMessage"));
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        // Create new user / 建立新使用者
        UserAPI.create(formData)
          .then(() => {
            ElMessage.success(t("user.createSuccessMessage"));
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}, 1000);

/**
 * Delete user(s) with confirmation dialog
 * 刪除使用者並顯示確認對話框
 *
 * @param id - Optional single user ID for individual deletion
 */
function handleDelete(id?: number) {
  // Prepare user IDs for deletion (single or batch) / 準備刪除的使用者ID（單個或批次）
  const userIds = [id || selectIds.value].join(",");
  if (!userIds) {
    ElMessage.warning(t("user.deleteDialog.noSelectionWarning"));
    return;
  }

  // Show confirmation dialog / 顯示確認對話框
  ElMessageBox.confirm(t("user.deleteDialog.confirmMessage"), t("user.deleteDialog.title"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning",
  }).then(
    function () {
      // Execute deletion / 執行刪除
      loading.value = true;
      UserAPI.deleteByIds(userIds)
        .then(() => {
          ElMessage.success(t("user.deleteDialog.successMessage"));
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    function () {
      // Handle cancellation / 處理取消操作
      ElMessage.info(t("user.deleteDialog.cancelMessage"));
    }
  );
}

// Component Lifecycle: Initialize data on mount / 組件生命週期：掛載時初始化資料
onMounted(() => {
  handleQuery();
});
</script>
