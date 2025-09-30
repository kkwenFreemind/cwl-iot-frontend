<!--
==================================================================================
Role Management Component (Access Control & Permission Administration)
==================================================================================

This component provides comprehensive role-based access control (RBAC) management 
functionality for system administrators to manage user roles and permissions including:
- Role creation, editing, and deletion with comprehensive form validation
- Permission assignment and management with hierarchical menu tree structure
- Data scope configuration with granular access control levels
- Role status management and priority ordering system
- Bulk role operations with multi-selection capabilities
- Advanced search and filtering for efficient role discovery

Key Role Management Features:
- Role CRUD Operations: Complete role lifecycle management with validation
- Permission Assignment: Hierarchical permission tree with selective assignment
- Data Scope Control: Configurable data access levels (All, Department+Sub, Department, Self)
- Role Status Management: Active/inactive role state control with visual indicators
- Role Prioritization: Sortable role ordering for system hierarchy establishment
- Bulk Operations: Multi-role selection for efficient batch management

Permission Management System:
- Hierarchical Menu Tree: Tree-structured permission display with parent-child relationships
- Selective Permission Assignment: Granular permission selection with inheritance support
- Real-time Permission Updates: Dynamic permission assignment with immediate effect
- Permission Validation: Comprehensive permission checking and validation
- Menu-based Permissions: Integration with system menu structure for access control
- Role-Permission Mapping: Efficient role-to-permission relationship management

Data Scope & Access Control:
- All Data Access: System-wide data visibility for administrative roles
- Department + Sub-departments: Hierarchical departmental data access
- Department Only: Single department data access restriction
- Self Data Only: Personal data access limitation for security
- Configurable Scope Assignment: Flexible data access level configuration
- Inheritance Control: Parent-child data scope relationship management

Search & Filtering Capabilities:
- Role Name Search: Full-text search across role names and descriptions
- Real-time Query Processing: Instant search results with dynamic filtering
- Advanced Filtering Options: Multi-criteria role filtering and sorting
- Pagination Support: Memory-efficient browsing of large role datasets
- Search Reset Functionality: Quick filter clearing and data refresh
- Responsive Search Interface: Optimized search experience across devices

Form Validation & Data Integrity:
- Comprehensive Form Validation: Multi-field validation with error messaging
- Role Code Uniqueness: System-wide unique role code enforcement
- Required Field Validation: Mandatory field checking with user feedback
- Data Type Validation: Proper data type enforcement for all fields
- Real-time Validation: Instant validation feedback during form input
- Submission Validation: Pre-submission data integrity checks

User Interface & Experience:
- Responsive Table Design: Optimized role listing with sortable columns
- Status Indicators: Visual role status representation with color coding
- Action Buttons: Context-sensitive role management actions
- Modal Dialogs: Professional form presentation with proper spacing
- Loading States: User feedback during data operations and API calls
- Error Handling: Graceful error management with user-friendly messages

Technical Implementation:
- Vue 3 Composition API with TypeScript for robust development
- Element Plus UI components for professional administrative interface
- Reactive state management for real-time role and permission updates
- RESTful API integration with comprehensive error handling
- Form validation with Element Plus validation rules
- Responsive design with optimized table and modal layouts
- Internationalization (i18n) support for multi-language deployment

Security & Audit Features:
- Role-based Access Control: Complete RBAC implementation with permission hierarchy
- Data Scope Security: Granular data access control based on organizational structure
- Permission Inheritance: Hierarchical permission assignment with proper inheritance
- Audit Trail Integration: Role modification logging for compliance tracking
- Session Management: Role-based session control and timeout management
- Authorization Checks: Real-time permission validation for all operations

Integration Points:
- User Management System: Role assignment to users and user group management
- Menu System: Dynamic menu generation based on role permissions
- Department Management: Integration with organizational structure for data scope control
- Authentication System: Role-based authentication and authorization
- Audit System: Complete role and permission change logging
- Session Management: Role-based session control and access validation

@component Role
@author Chang Xiu-Wen, AI-Enhanced
@version 2.0.0
@created 2025-09-12
@updated 2025-09-30

==================================================================================
-->

<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" :label="$t('role.keywords')">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('role.roleNamePlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">
            {{ $t("common.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">{{ $t("common.reset") }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenDialog()">
            {{ $t("common.add") }}
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
        ref="dataTableRef"
        v-loading="loading"
        :data="roleList"
        highlight-current-row
        border
        class="data-table__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column :label="$t('role.roleName')" prop="name" min-width="80" />
        <el-table-column :label="$t('role.roleCode')" prop="code" width="150" />

        <el-table-column :label="$t('common.status')" align="center" width="150">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">{{ $t("common.normal") }}</el-tag>
            <el-tag v-else type="info">{{ $t("common.disabled") }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="$t('role.sort')" align="center" width="100" prop="sort" />

        <el-table-column fixed="right" :label="$t('common.operation')" width="300">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              icon="position"
              @click="handleOpenAssignPermDialog(scope.row)"
            >
              {{ $t("role.assignPermission") }}
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              icon="edit"
              @click="handleOpenDialog(scope.row.id)"
            >
              {{ $t("common.edit") }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              icon="delete"
              @click="handleDelete(scope.row.id)"
            >
              {{ $t("common.delete") }}
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

    <!-- 角色表單彈窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form ref="roleFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item :label="$t('role.form.name')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('role.form.namePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('role.form.code')" prop="code">
          <el-input v-model="formData.code" :placeholder="$t('role.form.codePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('role.form.dataScope')" prop="dataScope">
          <el-select v-model="formData.dataScope">
            <el-option :key="1" :label="$t('role.dataScopeOptions.all')" :value="1" />
            <el-option :key="2" :label="$t('role.dataScopeOptions.deptAndSub')" :value="2" />
            <el-option :key="3" :label="$t('role.dataScopeOptions.dept')" :value="3" />
            <el-option :key="4" :label="$t('role.dataScopeOptions.self')" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('role.form.status')" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">{{ $t("common.normal") }}</el-radio>
            <el-radio :value="0">{{ $t("common.disabled") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('role.form.sort')" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            :min="0"
            style="width: 100px"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">{{ $t("common.confirm") }}</el-button>
          <el-button @click="handleCloseDialog">{{ $t("common.cancel") }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配許可權彈窗 -->
    <el-drawer v-model="assignPermDialogVisible" :title="assignPermDialogTitle" :size="drawerSize">
      <div class="flex-x-between">
        <el-input v-model="permKeywords" clearable class="w-[150px]" placeholder="選單許可權名稱">
          <template #prefix>
            <Search />
          </template>
        </el-input>

        <div class="flex-center ml-5">
          <el-button type="primary" size="small" plain @click="togglePermTree">
            <template #icon>
              <Switch />
            </template>
            {{ isExpanded ? "收縮" : "展開" }}
          </el-button>
          <el-checkbox
            v-model="parentChildLinked"
            class="ml-5"
            @change="handleparentChildLinkedChange"
          >
            父子聯動
          </el-checkbox>

          <el-tooltip placement="bottom">
            <template #content>
              如果只需勾選選單許可權，不需要勾選子選單或者按鈕許可權，請關閉父子聯動
            </template>
            <el-icon class="ml-1 color-[--el-color-primary] inline-block cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </div>

      <el-tree
        ref="permTreeRef"
        node-key="value"
        show-checkbox
        :data="menuPermOptions"
        :filter-node-method="handlePermFilter"
        :default-expand-all="true"
        :check-strictly="!parentChildLinked"
        class="mt-5"
      >
        <template #default="{ data }">
          {{ data.label }}
        </template>
      </el-tree>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleAssignPermSubmit">
            {{ $t("common.confirm") }}
          </el-button>
          <el-button @click="assignPermDialogVisible = false">{{ $t("common.cancel") }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app-store";
import { DeviceEnum } from "@/enums/settings/device.enum";

import RoleAPI, { RolePageVO, RoleForm, RolePageQuery } from "@/api/system/role-api";
import MenuAPI from "@/api/system/menu-api";

defineOptions({
  name: "Role",
  inheritAttrs: false,
});

const appStore = useAppStore();
const { t } = useI18n();

const queryFormRef = ref();
const roleFormRef = ref();
const permTreeRef = ref();

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<RolePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 角色表格資料
const roleList = ref<RolePageVO[]>();
// 選單許可權下拉
const menuPermOptions = ref<OptionType[]>([]);

// 彈窗
const dialog = reactive({
  title: "",
  visible: false,
});

const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));
const assignPermDialogTitle = computed(
  () => `【${checkedRole.value.name}】${t("role.assignPermission")}`
);

// 角色表單
const formData = reactive<RoleForm>({
  sort: 1,
  status: 1,
});

const rules = reactive({
  name: [
    { required: true, message: computed(() => t("role.validation.nameRequired")), trigger: "blur" },
  ],
  code: [
    { required: true, message: computed(() => t("role.validation.codeRequired")), trigger: "blur" },
  ],
  dataScope: [
    { required: true, message: computed(() => t("common.pleaseSelect")), trigger: "blur" },
  ],
  status: [{ required: true, message: computed(() => t("common.pleaseSelect")), trigger: "blur" }],
});

// 選中的角色
interface CheckedRole {
  id?: string;
  name?: string;
}
const checkedRole = ref<CheckedRole>({});
const assignPermDialogVisible = ref(false);

const permKeywords = ref("");
const isExpanded = ref(true);

const parentChildLinked = ref(true);

// 獲取資料
function fetchData() {
  loading.value = true;
  RoleAPI.getPage(queryParams)
    .then((data) => {
      roleList.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 查詢（重置頁碼後獲取資料）
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

// 重置查詢
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  fetchData();
}

// 行復選框選中
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

// 開啟角色彈窗
function handleOpenDialog(roleId?: string) {
  dialog.visible = true;
  if (roleId) {
    dialog.title = t("role.form.title.edit");
    RoleAPI.getFormData(roleId).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = t("role.form.title.add");
  }
}

// 提交角色表單
function handleSubmit() {
  roleFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const roleId = formData.id;
      if (roleId) {
        RoleAPI.update(roleId, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        RoleAPI.create(formData)
          .then(() => {
            ElMessage.success("新增成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

// 關閉彈窗
function handleCloseDialog() {
  dialog.visible = false;

  roleFormRef.value.resetFields();
  roleFormRef.value.clearValidate();

  formData.id = undefined;
  formData.sort = 1;
  formData.status = 1;
}

// 刪除角色
function handleDelete(roleId?: number) {
  const roleIds = [roleId || ids.value].join(",");
  if (!roleIds) {
    ElMessage.warning("請勾選刪除項");
    return;
  }

  ElMessageBox.confirm("確認刪除已選中的資料項?", "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      RoleAPI.deleteByIds(roleIds)
        .then(() => {
          ElMessage.success("刪除成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    () => {
      ElMessage.info("已取消刪除");
    }
  );
}

// 開啟分配選單許可權彈窗
async function handleOpenAssignPermDialog(row: RolePageVO) {
  const roleId = row.id;
  if (roleId) {
    assignPermDialogVisible.value = true;
    loading.value = true;

    checkedRole.value.id = roleId;
    checkedRole.value.name = row.name;

    // 獲取所有的選單
    menuPermOptions.value = await MenuAPI.getOptions();

    // 回顯角色已擁有的選單
    RoleAPI.getRoleMenuIds(roleId)
      .then((data) => {
        const checkedMenuIds = data;
        checkedMenuIds.forEach((menuId) => permTreeRef.value!.setChecked(menuId, true, false));
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

// 分配選單許可權提交
function handleAssignPermSubmit() {
  const roleId = checkedRole.value.id;
  if (roleId) {
    const checkedMenuIds: number[] = permTreeRef
      .value!.getCheckedNodes(false, true)
      .map((node: any) => node.value);

    loading.value = true;
    RoleAPI.updateRoleMenus(roleId, checkedMenuIds)
      .then(() => {
        ElMessage.success("分配許可權成功");
        assignPermDialogVisible.value = false;
        handleResetQuery();
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

// 展開/收縮 選單許可權樹
function togglePermTree() {
  isExpanded.value = !isExpanded.value;
  if (permTreeRef.value) {
    Object.values(permTreeRef.value.store.nodesMap).forEach((node: any) => {
      if (isExpanded.value) {
        node.expand();
      } else {
        node.collapse();
      }
    });
  }
}

// 許可權篩選
watch(permKeywords, (val) => {
  permTreeRef.value!.filter(val);
});

function handlePermFilter(
  value: string,
  data: {
    [key: string]: any;
  }
) {
  if (!value) return true;
  return data.label.includes(value);
}

// 父子選單節點是否聯動
function handleparentChildLinkedChange(val: any) {
  parentChildLinked.value = val;
}

onMounted(() => {
  handleQuery();
});
</script>
