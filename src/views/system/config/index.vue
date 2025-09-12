<!-- 系統配置 -->
<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="關鍵字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="請輸入配置鍵\配置名稱"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">搜尋</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenDialog()">新增</el-button>
          <el-button color="#626aef" icon="RefreshLeft" @click="handleRefreshCache">
            重新整理快取
          </el-button>
        </div>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        class="data-table__content"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="index" label="序號" width="60" />
        <el-table-column key="configName" label="配置名稱" prop="configName" min-width="100" />
        <el-table-column key="configKey" label="配置鍵" prop="configKey" min-width="100" />
        <el-table-column key="configValue" label="配置值" prop="configValue" min-width="100" />
        <el-table-column key="remark" label="描述" prop="remark" min-width="100" />
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              icon="edit"
              @click="handleOpenDialog(scope.row.id)"
            >
              編輯
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              icon="delete"
              @click="handleDelete(scope.row.id)"
            >
              刪除
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

    <!-- 系統配置表單彈窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-suffix=":"
        label-width="100px"
      >
        <el-form-item label="配置名稱" prop="configName">
          <el-input v-model="formData.configName" placeholder="請輸入配置名稱" :maxlength="50" />
        </el-form-item>
        <el-form-item label="配置鍵" prop="configKey">
          <el-input v-model="formData.configKey" placeholder="請輸入配置鍵" :maxlength="50" />
        </el-form-item>
        <el-form-item label="配置值" prop="configValue">
          <el-input v-model="formData.configValue" placeholder="請輸入配置值" :maxlength="100" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input
            v-model="formData.remark"
            :rows="4"
            :maxlength="100"
            show-word-limit
            type="textarea"
            placeholder="請輸入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">確定</el-button>
          <el-button @click="handleCloseDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Config",
  inheritAttrs: false,
});

import ConfigAPI, { ConfigPageVO, ConfigForm, ConfigPageQuery } from "@/api/system/config-api";
import { ElMessage, ElMessageBox } from "element-plus";
import { useDebounceFn } from "@vueuse/core";

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<ConfigPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

// 系統配置表格資料
const pageData = ref<ConfigPageVO[]>([]);

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<ConfigForm>({
  id: undefined,
  configName: "",
  configKey: "",
  configValue: "",
  remark: "",
});

const rules = reactive({
  configName: [{ required: true, message: "請輸入系統配置名稱", trigger: "blur" }],
  configKey: [{ required: true, message: "請輸入系統配置編碼", trigger: "blur" }],
  configValue: [{ required: true, message: "請輸入系統配置值", trigger: "blur" }],
});

// 獲取資料
function fetchData() {
  loading.value = true;
  ConfigAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
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

// 行復選框選中項變化
function handleSelectionChange(selection: any) {
  selectIds.value = selection.map((item: any) => item.id);
}

// 開啟系統配置彈窗
function handleOpenDialog(id?: string) {
  dialog.visible = true;
  if (id) {
    dialog.title = "修改系統配置";
    ConfigAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增系統配置";
    formData.id = undefined;
  }
}

// 重新整理快取(防抖)
const handleRefreshCache = useDebounceFn(() => {
  ConfigAPI.refreshCache().then(() => {
    ElMessage.success("重新整理成功");
  });
}, 1000);

// 系統配置表單提交
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        ConfigAPI.update(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        ConfigAPI.create(formData)
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

// 重置表單
function resetForm() {
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
}

// 關閉系統配置彈窗
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

// 刪除系統配置
function handleDelete(id: string) {
  ElMessageBox.confirm("確認刪除該項配置?", "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    loading.value = true;
    ConfigAPI.deleteById(id)
      .then(() => {
        ElMessage.success("刪除成功");
        handleResetQuery();
      })
      .finally(() => (loading.value = false));
  });
}

onMounted(() => {
  handleQuery();
});
</script>
