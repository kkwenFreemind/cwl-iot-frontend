<!-- 字典 -->
<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="關鍵字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="字典名稱/編碼"
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
          <el-button type="success" icon="plus" @click="handleAddClick()">新增</el-button>
          <el-button
            type="danger"
            :disabled="ids.length === 0"
            icon="delete"
            @click="handleDelete()"
          >
            刪除
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
        <el-table-column label="字典名稱" prop="name" />
        <el-table-column label="字典編碼" prop="dictCode" />
        <el-table-column label="狀態" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? "啟用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center" width="220">
          <template #default="scope">
            <el-button type="primary" link size="small" @click.stop="handleOpenDictData(scope.row)">
              <template #icon>
                <Collection />
              </template>
              字典資料
            </el-button>

            <el-button
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleEditClick(scope.row.id)"
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
        <el-form-item label="字典名稱" prop="name">
          <el-input v-model="formData.name" placeholder="請輸入字典名稱" />
        </el-form-item>

        <el-form-item label="字典編碼" prop="dictCode">
          <el-input v-model="formData.dictCode" placeholder="請輸入字典編碼" />
        </el-form-item>

        <el-form-item label="狀態">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">啟用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="備註">
          <el-input v-model="formData.remark" type="textarea" placeholder="請輸入備註" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmitClick">確 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
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
    name: [{ required: true, message: "請輸入字典名稱", trigger: "blur" }],
    dictCode: [{ required: true, message: "請輸入字典編碼", trigger: "blur" }],
  };
  return rules;
});

// 獲取資料
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

// 行選擇
function handleSelectionChange(selection: any) {
  ids.value = selection.map((item: any) => item.id);
}

// 新增字典
function handleAddClick() {
  dialog.visible = true;
  dialog.title = "新增字典";
}

/**
 * 編輯字典
 *
 * @param id 字典ID
 */
function handleEditClick(id: string) {
  dialog.visible = true;
  dialog.title = "修改字典";
  DictAPI.getFormData(id).then((data) => {
    Object.assign(formData, data);
  });
}

// 提交字典表單
function handleSubmitClick() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        DictAPI.update(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DictAPI.create(formData)
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

// 關閉字典彈窗
function handleCloseDialog() {
  dialog.visible = false;

  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();

  formData.id = undefined;
}
/**
 * 刪除字典
 *
 * @param id 字典ID
 */
function handleDelete(id?: number) {
  const attrGroupIds = [id || ids.value].join(",");
  if (!attrGroupIds) {
    ElMessage.warning("請勾選刪除項");
    return;
  }
  ElMessageBox.confirm("確認刪除已選中的資料項?", "警告", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      DictAPI.deleteByIds(attrGroupIds).then(() => {
        ElMessage.success("刪除成功");
        handleResetQuery();
      });
    },
    () => {
      ElMessage.info("已取消刪除");
    }
  );
}

// 開啟字典項
function handleOpenDictData(row: DictPageVO) {
  router.push({
    path: "/system/dict-item",
    query: { dictCode: row.dictCode, title: "【" + row.name + "】字典資料" },
  });
}

onMounted(() => {
  handleQuery();
});
</script>
