<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" label="關鍵字">
          <el-input
            v-model="queryParams.keywords"
            placeholder="日誌內容"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="createTime" label="操作時間">
          <el-date-picker
            v-model="queryParams.createTime"
            :editable="false"
            type="daterange"
            range-separator="~"
            start-placeholder="開始時間"
            end-placeholder="截止時間"
            value-format="YYYY-MM-DD"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">搜尋</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <el-table
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        class="data-table__content"
      >
        <el-table-column label="操作時間" prop="createTime" width="180" />
        <el-table-column label="操作人" prop="operator" width="120" />
        <el-table-column label="日誌模組" prop="module" width="100" />
        <el-table-column label="日誌內容" prop="content" min-width="200" />
        <el-table-column label="IP 地址" prop="ip" width="150" />
        <el-table-column label="地區" prop="region" width="150" />
        <el-table-column label="瀏覽器" prop="browser" width="150" />
        <el-table-column label="終端系統" prop="os" width="200" show-overflow-tooltip />
        <el-table-column label="執行時間(ms)" prop="executionTime" width="150" />
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Log",
  inheritAttrs: false,
});

import LogAPI, { LogPageVO, LogPageQuery } from "@/api/system/log-api";

const queryFormRef = ref();

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<LogPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
  createTime: ["", ""],
});

// 日誌表格資料
const pageData = ref<LogPageVO[]>();

/** 獲取資料 */
function fetchData() {
  loading.value = true;
  LogAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 查詢（重置頁碼後獲取資料） */
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

/** 重置查詢 */
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  queryParams.createTime = undefined;
  fetchData();
}

onMounted(() => {
  handleQuery();
});
</script>
