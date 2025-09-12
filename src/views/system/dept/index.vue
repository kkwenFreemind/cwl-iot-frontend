<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="關鍵字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="部門名稱"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="部門狀態" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 100px">
            <el-option :value="1" label="正常" />
            <el-option :value="0" label="禁用" />
          </el-select>
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button class="filter-item" type="primary" icon="search" @click="handleQuery">
            搜尋
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenDialog()">新增</el-button>
          <el-button
            type="danger"
            :disabled="selectIds.length === 0"
            icon="delete"
            @click="handleDelete()"
          >
            刪除
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="deptList"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        class="data-table__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="name" label="部門名稱" min-width="200" />
        <el-table-column prop="code" label="部門編號" width="200" />
        <el-table-column prop="status" label="狀態" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status == 1" type="success">正常</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sort" label="排序" width="100" />

        <el-table-column label="操作" fixed="right" align="left" width="200">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              icon="plus"
              @click.stop="handleOpenDialog(scope.row.id, undefined)"
            >
              新增
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleOpenDialog(scope.row.parentId, scope.row.id)"
            >
              編輯
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              icon="delete"
              @click.stop="handleDelete(scope.row.id)"
            >
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      @closed="handleCloseDialog"
    >
      <el-form ref="deptFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="上級部門" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            placeholder="選擇上級部門"
            :data="deptOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>
        <el-form-item label="部門名稱" prop="name">
          <el-input v-model="formData.name" placeholder="請輸入部門名稱" />
        </el-form-item>
        <el-form-item label="部門編號" prop="code">
          <el-input v-model="formData.code" placeholder="請輸入部門編號" />
        </el-form-item>
        <el-form-item label="顯示排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            style="width: 100px"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="部門狀態">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">確 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Dept",
  inheritAttrs: false,
});

import DeptAPI, { DeptVO, DeptForm, DeptQuery } from "@/api/system/dept-api";

const queryFormRef = ref();
const deptFormRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const queryParams = reactive<DeptQuery>({});

const dialog = reactive({
  title: "",
  visible: false,
});

const deptList = ref<DeptVO[]>();
const deptOptions = ref<OptionType[]>();
const formData = reactive<DeptForm>({
  status: 1,
  parentId: "0",
  sort: 1,
});

const rules = reactive({
  parentId: [{ required: true, message: "上級部門不能為空", trigger: "change" }],
  name: [{ required: true, message: "部門名稱不能為空", trigger: "blur" }],
  code: [{ required: true, message: "部門編號不能為空", trigger: "blur" }],
  sort: [{ required: true, message: "顯示排序不能為空", trigger: "blur" }],
});

// 查詢部門
function handleQuery() {
  loading.value = true;
  DeptAPI.getList(queryParams).then((data) => {
    deptList.value = data;
    loading.value = false;
  });
}

// 重置查詢
function handleResetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

// 處理選中項變化
function handleSelectionChange(selection: any) {
  selectIds.value = selection.map((item: any) => item.id);
}

/**
 * 開啟部門彈窗
 *
 * @param parentId 父部門ID
 * @param deptId 部門ID
 */
async function handleOpenDialog(parentId?: string, deptId?: string) {
  // 載入部門下拉資料
  const data = await DeptAPI.getOptions();
  deptOptions.value = [
    {
      value: "0",
      label: "頂級部門",
      children: data,
    },
  ];

  dialog.visible = true;
  if (deptId) {
    dialog.title = "修改部門";
    DeptAPI.getFormData(deptId).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增部門";
    formData.parentId = parentId || "0";
  }
}

// 提交部門表單
function handleSubmit() {
  deptFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const deptId = formData.id;
      if (deptId) {
        DeptAPI.update(deptId, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DeptAPI.create(formData)
          .then(() => {
            ElMessage.success("新增成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

// 刪除部門
function handleDelete(deptId?: number) {
  const deptIds = [deptId || selectIds.value].join(",");

  if (!deptIds) {
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
      DeptAPI.deleteByIds(deptIds)
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

// 重置表單
function resetForm() {
  deptFormRef.value.resetFields();
  deptFormRef.value.clearValidate();

  formData.id = undefined;
  formData.parentId = "0";
  formData.status = 1;
  formData.sort = 1;
}

// 關閉彈窗
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

onMounted(() => {
  handleQuery();
});
</script>
