<!-- 使用者管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 部門樹 -->
      <el-col :lg="4" :xs="24" class="mb-[12px]">
        <DeptTree v-model="queryParams.deptId" @node-click="handleQuery" />
      </el-col>

      <!-- 使用者列表 -->
      <el-col :lg="20" :xs="24">
        <!-- 搜尋區域 -->
        <div class="search-container">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <el-form-item :label="$t('user.keywords')" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                :placeholder="$t('user.keywordsPlaceholder')"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

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

            <el-form-item :label="$t('user.createTime')">
              <el-date-picker
                v-model="queryParams.createTime"
                :editable="false"
                type="daterange"
                range-separator="~"
                :start-placeholder="$t('user.startTime')"
                :end-placeholder="$t('user.endTime')"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item class="search-buttons">
              <el-button type="primary" icon="search" @click="handleQuery">
                {{ $t("user.search") }}
              </el-button>
              <el-button icon="refresh" @click="handleResetQuery">{{ $t("user.reset") }}</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="hover" class="data-table">
          <div class="data-table__toolbar">
            <div class="data-table__toolbar--actions">
              <el-button type="success" icon="plus" @click="handleOpenDialog()">
                {{ $t("user.add") }}
              </el-button>
              <el-button
                type="danger"
                icon="delete"
                :disabled="selectIds.length === 0"
                @click="handleDelete()"
              >
                {{ $t("user.delete") }}
              </el-button>
            </div>
            <div class="data-table__toolbar--tools">
              <!-- 调试按钮 -->
              <el-button
                :type="debugMode ? 'danger' : 'info'"
                size="small"
                @click="debugMode = !debugMode"
              >
                {{ debugMode ? $t("user.debug.disable") : $t("user.debug.enable") }}
              </el-button>

              <el-button icon="upload" @click="handleOpenImportDialog">
                {{ $t("user.import") }}
              </el-button>

              <el-button icon="download" @click="handleExport">{{ $t("user.export") }}</el-button>
            </div>
          </div>

          <el-table
            v-loading="loading"
            :data="pageData"
            border
            stripe
            highlight-current-row
            class="data-table__content"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column :label="$t('user.username')" prop="username" />
            <el-table-column
              :label="$t('user.nickname')"
              width="150"
              align="center"
              prop="nickname"
            />
            <el-table-column :label="$t('user.gender')" width="100" align="center">
              <template #default="scope">
                <DictLabel v-model="scope.row.gender" code="gender" />
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('user.department')"
              width="120"
              align="center"
              prop="deptName"
            />
            <el-table-column :label="$t('user.mobile')" align="center" prop="mobile" width="120" />
            <el-table-column :label="$t('user.email')" align="center" prop="email" width="160" />
            <el-table-column :label="$t('user.status')" align="center" prop="status" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status == 1 ? 'success' : 'info'">
                  {{ scope.row.status == 1 ? $t("user.statusNormal") : $t("user.statusDisabled") }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('user.createTime')"
              align="center"
              prop="createTime"
              width="150"
            />
            <el-table-column :label="$t('user.operation')" fixed="right" width="220">
              <template #default="scope">
                <!-- 调试信息：显示当前用户权限 -->
                <div v-if="debugMode" style=" margin-bottom: 5px;font-size: 12px; color: #666">
                  {{ $t("user.debug.role") }}:
                  {{ userStore.userInfo.roles?.join(", ") || $t("user.debug.none") }}
                  <br />
                  {{ $t("user.debug.permission") }}: {{ userStore.userInfo.perms?.length || 0
                  }}{{ $t("user.debug.permissions") }}
                </div>

                <el-button
                  type="primary"
                  icon="RefreshLeft"
                  size="small"
                  link
                  @click="hancleResetPassword(scope.row)"
                >
                  {{ $t("user.resetPassword") }}
                </el-button>
                <el-button
                  type="primary"
                  icon="edit"
                  link
                  size="small"
                  @click="handleOpenDialog(scope.row.id)"
                >
                  {{ $t("user.edit") }}
                </el-button>
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

    <!-- 使用者表單 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="userFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item :label="$t('user.userForm.username')" prop="username">
          <el-input
            v-model="formData.username"
            :readonly="!!formData.id"
            :placeholder="$t('user.userForm.usernamePlaceholder')"
          />
        </el-form-item>

        <el-form-item :label="$t('user.userForm.nickname')" prop="nickname">
          <el-input
            v-model="formData.nickname"
            :placeholder="$t('user.userForm.nicknamePlaceholder')"
          />
        </el-form-item>

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

        <el-form-item :label="$t('user.userForm.gender')" prop="gender">
          <Dict v-model="formData.gender" code="gender" />
        </el-form-item>

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

        <el-form-item :label="$t('user.userForm.mobile')" prop="mobile">
          <el-input
            v-model="formData.mobile"
            :placeholder="$t('user.userForm.mobilePlaceholder')"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item :label="$t('user.userForm.email')" prop="email">
          <el-input
            v-model="formData.email"
            :placeholder="$t('user.userForm.emailPlaceholder')"
            maxlength="50"
          />
        </el-form-item>

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

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">
            {{ $t("user.userForm.confirm") }}
          </el-button>
          <el-button @click="handleCloseDialog">{{ $t("user.userForm.cancel") }}</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 使用者匯入 -->
    <UserImport v-model="importDialogVisible" @import-success="handleQuery()" />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app-store";
import { useUserStore } from "@/store/modules/user-store";
import { DeviceEnum } from "@/enums/settings/device.enum";

import UserAPI, { UserForm, UserPageQuery, UserPageVO } from "@/api/system/user-api";
import DeptAPI from "@/api/system/dept-api";
import RoleAPI from "@/api/system/role-api";

import DeptTree from "./components/DeptTree.vue";
import UserImport from "./components/UserImport.vue";

defineOptions({
  name: "User",
  inheritAttrs: false,
});

const appStore = useAppStore();
const userStore = useUserStore();
const { t } = useI18n();

// 调试模式 - 用于查看权限状态
const debugMode = ref(false);

const queryFormRef = ref();
const userFormRef = ref();

const queryParams = reactive<UserPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const pageData = ref<UserPageVO[]>();
const total = ref(0);
const loading = ref(false);

const dialog = reactive({
  visible: false,
  title: "",
});
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const formData = reactive<UserForm>({
  status: 1,
});

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
  email: [
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: computed(() => t("user.validation.emailInvalid")),
      trigger: "blur",
    },
  ],
  mobile: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: computed(() => t("user.validation.mobileInvalid")),
      trigger: "blur",
    },
  ],
});

// 選中的使用者ID
const selectIds = ref<number[]>([]);
// 部門下拉資料來源
const deptOptions = ref<OptionType[]>();
// 角色下拉資料來源
const roleOptions = ref<OptionType[]>();
// 匯入彈窗顯示狀態
const importDialogVisible = ref(false);

// 獲取資料
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

// 查詢（重置頁碼後獲取資料）
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

// 重置查詢
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  queryParams.deptId = undefined;
  queryParams.createTime = undefined;
  fetchData();
}

// 選中項發生變化
function handleSelectionChange(selection: any[]) {
  selectIds.value = selection.map((item) => item.id);
}

// 重置密碼
function hancleResetPassword(row: UserPageVO) {
  ElMessageBox.prompt("請輸入使用者【" + row.username + "】的新密碼", "重置密碼", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
  }).then(
    ({ value }) => {
      if (!value || value.length < 6) {
        ElMessage.warning("密碼至少需要6位字元，請重新輸入");
        return false;
      }
      UserAPI.resetPassword(row.id, value).then(() => {
        ElMessage.success("密碼重置成功，新密碼是：" + value);
      });
    },
    () => {
      ElMessage.info("已取消重置密碼");
    }
  );
}

/**
 * 開啟彈窗
 *
 * @param id 使用者ID
 */
async function handleOpenDialog(id?: string) {
  dialog.visible = true;
  // 載入角色下拉資料來源
  roleOptions.value = await RoleAPI.getOptions();
  // 載入部門下拉資料來源
  deptOptions.value = await DeptAPI.getOptions();

  if (id) {
    dialog.title = t("user.userForm.title.edit");
    UserAPI.getFormData(id).then((data) => {
      Object.assign(formData, { ...data });
    });
  } else {
    dialog.title = t("user.userForm.title.add");
  }
}

// 關閉彈窗
function handleCloseDialog() {
  dialog.visible = false;
  userFormRef.value.resetFields();
  userFormRef.value.clearValidate();

  formData.id = undefined;
  formData.status = 1;
}

// 提交使用者表單（防抖）
const handleSubmit = useDebounceFn(() => {
  userFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const userId = formData.id;
      loading.value = true;
      if (userId) {
        UserAPI.update(userId, formData)
          .then(() => {
            ElMessage.success("修改使用者成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        UserAPI.create(formData)
          .then(() => {
            ElMessage.success("新增使用者成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}, 1000);

/**
 * 刪除使用者
 *
 * @param id  使用者ID
 */
function handleDelete(id?: number) {
  const userIds = [id || selectIds.value].join(",");
  if (!userIds) {
    ElMessage.warning("請勾選刪除項");
    return;
  }

  ElMessageBox.confirm("確認刪除使用者?", "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    function () {
      loading.value = true;
      UserAPI.deleteByIds(userIds)
        .then(() => {
          ElMessage.success("刪除成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    function () {
      ElMessage.info("已取消刪除");
    }
  );
}

// 開啟匯入彈窗
function handleOpenImportDialog() {
  importDialogVisible.value = true;
}

// 匯出使用者
function handleExport() {
  UserAPI.export(queryParams).then((response: any) => {
    const fileData = response.data;
    const fileName = decodeURI(response.headers["content-disposition"].split(";")[1].split("=")[1]);
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

    const blob = new Blob([fileData], { type: fileType });
    const downloadUrl = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);
  });
}

onMounted(() => {
  handleQuery();

  // 调试信息：输出当前用户权限
  console.log("🔍 用户管理页面 - 权限调试信息:");
  console.log("用户信息:", userStore.userInfo);
  console.log("角色列表:", userStore.userInfo.roles);
  console.log("权限列表:", userStore.userInfo.perms);
  console.log("是否包含 sys:user:edit 权限:", userStore.userInfo.perms?.includes("sys:user:edit"));
  console.log(
    "是否包含 sys:user:delete 权限:",
    userStore.userInfo.perms?.includes("sys:user:delete")
  );
  console.log(
    "是否包含 sys:user:reset-password 权限:",
    userStore.userInfo.perms?.includes("sys:user:reset-password")
  );

  // 詳細檢查用戶信息結構
  console.log("🔍 詳細用戶信息檢查:");
  console.log("用戶信息原始數據:", JSON.stringify(userStore.userInfo, null, 2));
  console.log("角色數組:", Array.from(userStore.userInfo.roles || []));
  console.log("權限數組:", Array.from(userStore.userInfo.perms || []));
});
</script>
