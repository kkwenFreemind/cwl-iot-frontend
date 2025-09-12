<!-- 
  @author youlaitech
  @since 2024-08-27
 
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025-09-12

  Notice Management Component
  
  This component provides comprehensive notice management functionality including:
  - Notice creation, editing, and deletion with rich text editor support
  - Real-time notice publishing and revocation capabilities
  - Advanced search and filtering by title and publish status
  - Target audience management (All users or specific users)
  - Notice level and type categorization with dictionary support
  - Detailed notice viewing with formatted content display
  - Multilingual support (Traditional Chinese / English) with dynamic language switching
-->
<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-suffix=":">
        <el-form-item :label="$t('notice.noticeTitle')" prop="title">
          <el-input
            v-model="queryParams.title"
            :placeholder="$t('notice.noticeTitlePlaceholder')"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>

        <el-form-item :label="$t('notice.publishStatus')" prop="publishStatus">
          <el-select
            v-model="queryParams.publishStatus"
            clearable
            :placeholder="$t('notice.publishStatusAll')"
            style="width: 100px"
          >
            <el-option :value="0" :label="$t('notice.publishStatusUnpublished')" />
            <el-option :value="1" :label="$t('notice.publishStatusPublished')" />
            <el-option :value="-1" :label="$t('notice.publishStatusWithdrawn')" />
          </el-select>
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery()">
            {{ $t("common.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery()">{{ $t("common.reset") }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenDialog()">
            {{ $t("notice.addNotice") }}
          </el-button>
          <el-button
            type="danger"
            :disabled="selectIds.length === 0"
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
        :data="pageData"
        highlight-current-row
        class="data-table__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column type="index" :label="$t('notice.table.index')" width="60" />
        <el-table-column
          :label="$t('notice.table.noticeTitle')"
          prop="title"
          min-width="300"
          show-overflow-tooltip
        />
        <el-table-column align="center" :label="$t('notice.table.noticeType')" width="120">
          <template #default="scope">
            <DictLabel v-model="scope.row.type" :code="'notice_type'" />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$t('notice.table.publisher')"
          prop="publisherName"
          width="100"
        />
        <el-table-column align="center" :label="$t('notice.table.noticeLevel')" width="90">
          <template #default="scope">
            <DictLabel v-model="scope.row.level" code="notice_level" />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="$t('notice.table.targetType')"
          prop="targetType"
          width="100"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.targetType == 1" type="warning">
              {{ $t("notice.table.targetTypeAll") }}
            </el-tag>
            <el-tag v-if="scope.row.targetType == 2" type="success">
              {{ $t("notice.table.targetTypeSpecific") }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('notice.table.publishStatus')" width="90">
          <template #default="scope">
            <el-tag v-if="scope.row.publishStatus == 0" type="info" size="small">
              {{ $t("notice.publishStatusUnpublished") }}
            </el-tag>
            <el-tag v-if="scope.row.publishStatus == 1" type="success" size="small">
              {{ $t("notice.publishStatusPublished") }}
            </el-tag>
            <el-tag v-if="scope.row.publishStatus == -1" type="warning" size="small">
              {{ $t("notice.publishStatusWithdrawn") }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('notice.table.operationTime')" width="300">
          <template #default="scope">
            <div class="text-xs space-y-1">
              <div class="flex items-center flex-nowrap">
                <span class="text-gray-500 w-20 flex-shrink-0">
                  {{ $t("notice.table.createLabel") }}：
                </span>
                <span class="whitespace-nowrap">{{ scope.row.createTime || "-" }}</span>
              </div>
              <div v-if="scope.row.publishStatus === 1" class="flex items-center flex-nowrap">
                <span class="text-gray-500 w-20 flex-shrink-0">
                  {{ $t("notice.table.publishLabel") }}：
                </span>
                <span class="whitespace-nowrap">{{ scope.row.publishTime || "-" }}</span>
              </div>
              <div v-else-if="scope.row.publishStatus === -1" class="flex items-center flex-nowrap">
                <span class="text-gray-500 w-20 flex-shrink-0">
                  {{ $t("notice.table.revokeLabel") }}：
                </span>
                <span class="whitespace-nowrap">{{ scope.row.revokeTime || "-" }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          fixed="right"
          :label="$t('notice.table.operation')"
          width="180"
        >
          <template #default="scope">
            <el-button type="primary" size="small" link @click="openDetailDialog(scope.row.id)">
              {{ $t("notice.table.view") }}
            </el-button>
            <el-button
              v-if="scope.row.publishStatus != 1"
              type="primary"
              size="small"
              link
              @click="handlePublish(scope.row.id)"
            >
              {{ $t("notice.table.publish") }}
            </el-button>
            <el-button
              v-if="scope.row.publishStatus == 1"
              type="primary"
              size="small"
              link
              @click="handleRevoke(scope.row.id)"
            >
              {{ $t("notice.table.revoke") }}
            </el-button>
            <el-button
              v-if="scope.row.publishStatus != 1"
              type="primary"
              size="small"
              link
              @click="handleOpenDialog(scope.row.id)"
            >
              {{ $t("notice.table.edit") }}
            </el-button>
            <el-button
              v-if="scope.row.publishStatus != 1"
              type="danger"
              size="small"
              link
              @click="handleDelete(scope.row.id)"
            >
              {{ $t("notice.table.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery()"
      />
    </el-card>

    <!-- Notice Form Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      top="3vh"
      width="80%"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item :label="$t('notice.form.noticeTitle')" prop="title">
          <el-input
            v-model="formData.title"
            :placeholder="$t('notice.form.titlePlaceholder')"
            clearable
          />
        </el-form-item>

        <el-form-item :label="$t('notice.form.type')" prop="type">
          <Dict v-model="formData.type" code="notice_type" />
        </el-form-item>
        <el-form-item :label="$t('notice.form.level')" prop="level">
          <Dict v-model="formData.level" code="notice_level" />
        </el-form-item>
        <el-form-item :label="$t('notice.form.targetType')" prop="targetType">
          <el-radio-group v-model="formData.targetType">
            <el-radio :value="1">{{ $t("notice.form.targetTypeAll") }}</el-radio>
            <el-radio :value="2">{{ $t("notice.form.targetTypeSpecific") }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="formData.targetType == 2"
          :label="$t('notice.form.targetUsers')"
          prop="targetUserIds"
        >
          <el-select
            v-model="formData.targetUserIds"
            multiple
            search
            :placeholder="$t('notice.form.targetUsersPlaceholder')"
          >
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('notice.form.content')" prop="content">
          <WangEditor v-model="formData.content" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit()">
            {{ $t("notice.form.confirm") }}
          </el-button>
          <el-button @click="handleCloseDialog()">{{ $t("notice.form.cancel") }}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Notice Details Dialog -->
    <el-dialog
      v-model="detailDialog.visible"
      :show-close="false"
      width="50%"
      append-to-body
      @close="closeDetailDialog"
    >
      <template #header>
        <div class="flex-x-between">
          <span>{{ $t("notice.detail.title") }}</span>
          <div class="dialog-toolbar">
            <el-button circle @click="closeDetailDialog">
              <template #icon>
                <Close />
              </template>
            </el-button>
          </div>
        </div>
      </template>
      <el-descriptions :column="1">
        <el-descriptions-item :label="$t('notice.detail.noticeTitle')">
          {{ currentNotice.title }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('notice.detail.publishStatus')">
          <el-tag v-if="currentNotice.publishStatus == 0" type="info">
            {{ $t("notice.publishStatusUnpublished") }}
          </el-tag>
          <el-tag v-else-if="currentNotice.publishStatus == 1" type="success">
            {{ $t("notice.publishStatusPublished") }}
          </el-tag>
          <el-tag v-else-if="currentNotice.publishStatus == -1" type="warning">
            {{ $t("notice.publishStatusWithdrawn") }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('notice.detail.publisher')">
          {{ currentNotice.publisherName }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('notice.detail.publishTime')">
          {{ currentNotice.publishTime }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('notice.detail.content')">
          <div class="notice-content" v-html="currentNotice.content" />
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * @fileoverview Notice Management Component
 * @description Provides comprehensive notice management functionality with rich text editing and publishing capabilities
 * @author System Administrator
 * @created 2024-01-15
 * @updated 2024-01-15
 */

defineOptions({
  name: "Notice",
  inheritAttrs: false,
});

import NoticeAPI, {
  NoticePageVO,
  NoticeForm,
  NoticePageQuery,
  NoticeDetailVO,
} from "@/api/system/notice-api";
import UserAPI from "@/api/system/user-api";

const { t } = useI18n();

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<NoticePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const userOptions = ref<OptionType[]>([]);
// Notice management table data
const pageData = ref<NoticePageVO[]>([]);

// Dialog state
const dialog = reactive({
  title: "",
  visible: false,
});

// Notice form data
const formData = reactive<NoticeForm>({
  level: "L", // Default priority is low
  targetType: 1, // Default target type is all
});

// Notice form validation rules
const rules = computed(() => ({
  title: [{ required: true, message: t("notice.validation.titleRequired"), trigger: "blur" }],
  content: [
    {
      required: true,
      message: t("notice.validation.contentRequired"),
      trigger: "blur",
      validator: (rule: any, value: string, callback: any) => {
        if (!value.replace(/<[^>]+>/g, "").trim()) {
          callback(new Error(t("notice.validation.contentRequired")));
        } else {
          callback();
        }
      },
    },
  ],
  type: [{ required: true, message: t("notice.validation.typeRequired"), trigger: "change" }],
}));

const detailDialog = reactive({
  visible: false,
});
const currentNotice = ref<NoticeDetailVO>({});

// Get notice list
function handleQuery() {
  loading.value = true;
  queryParams.pageNum = 1;
  NoticeAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

// Reset query form
function handleResetQuery() {
  queryFormRef.value!.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

// Handle table row selection change
function handleSelectionChange(selection: any) {
  selectIds.value = selection.map((item: any) => item.id);
}

// Open notice form dialog
function handleOpenDialog(id?: string) {
  UserAPI.getOptions().then((data) => {
    userOptions.value = data;
  });

  dialog.visible = true;
  if (id) {
    dialog.title = t("notice.form.editTitle");
    NoticeAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    Object.assign(formData, { level: 0, targetType: 0 });
    dialog.title = t("notice.form.createTitle");
  }
}

// Publish notice
function handlePublish(id: string) {
  NoticeAPI.publish(id).then(() => {
    ElMessage.success(t("notice.messages.publishSuccess"));
    handleQuery();
  });
}

// Revoke notice
function handleRevoke(id: string) {
  NoticeAPI.revoke(id).then(() => {
    ElMessage.success(t("notice.messages.revokeSuccess"));
    handleQuery();
  });
}

// Submit notice form
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        NoticeAPI.update(id, formData)
          .then(() => {
            ElMessage.success(t("notice.messages.updateSuccess"));
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        NoticeAPI.create(formData)
          .then(() => {
            ElMessage.success(t("notice.messages.createSuccess"));
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

// Reset form data
function resetForm() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
  formData.targetType = 1;
}

// Close notice form dialog
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

// Delete notice
function handleDelete(id?: number) {
  const deleteIds = [id || selectIds.value].join(",");
  if (!deleteIds) {
    ElMessage.warning(t("notice.messages.selectDeleteItems"));
    return;
  }

  ElMessageBox.confirm(t("notice.messages.confirmDelete"), t("notice.messages.warning"), {
    confirmButtonText: t("notice.form.confirm"),
    cancelButtonText: t("notice.form.cancel"),
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      NoticeAPI.deleteByIds(deleteIds)
        .then(() => {
          ElMessage.success(t("notice.messages.deleteSuccess"));
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    () => {
      ElMessage.info(t("notice.messages.cancelDelete"));
    }
  );
}

const closeDetailDialog = () => {
  detailDialog.visible = false;
};

const openDetailDialog = async (id: string) => {
  const noticeDetail = await NoticeAPI.getDetail(id);
  currentNotice.value = noticeDetail;
  detailDialog.visible = true;
};

onMounted(() => {
  handleQuery();
});
</script>
