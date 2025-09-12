<template>
  <div class="app-container">
    <!-- Search Area -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" :label="$t('log.keywords')">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('log.keywordsPlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="createTime" :label="$t('log.operationTime')">
          <el-date-picker
            v-model="queryParams.createTime"
            :editable="false"
            type="daterange"
            range-separator="~"
            :start-placeholder="$t('log.startTime')"
            :end-placeholder="$t('log.endTime')"
            value-format="YYYY-MM-DD"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">
            {{ $t("log.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">
            {{ $t("log.reset") }}
          </el-button>
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
        <el-table-column :label="$t('log.table.operationTime')" prop="createTime" width="180" />
        <el-table-column :label="$t('log.table.operator')" prop="operator" width="120" />
        <el-table-column :label="$t('log.table.module')" prop="module" width="100" />
        <el-table-column :label="$t('log.logContent')" prop="content" min-width="200" />
        <el-table-column :label="$t('log.table.ipAddress')" prop="ip" width="150" />
        <el-table-column :label="$t('log.table.region')" prop="region" width="150" />
        <el-table-column :label="$t('log.table.browser')" prop="browser" width="150" />
        <el-table-column :label="$t('log.table.os')" prop="os" width="200" show-overflow-tooltip />
        <el-table-column :label="$t('log.table.executionTime')" prop="executionTime" width="150" />
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
/**
 * @fileoverview System Log Management Component
 * @description Provides comprehensive system log viewing and filtering functionality with internationalization support
 * @author System Administrator
 * @created 2024-01-15
 * @updated 2024-01-15
 */

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

// System log table data
const pageData = ref<LogPageVO[]>();

/**
 * Fetch system log data from API
 * @description Retrieves paginated system log data based on current query parameters
 * @returns {Promise<void>} Promise that resolves when data is fetched
 */
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

/**
 * Handle search query execution
 * @description Resets pagination to first page and executes data fetch with current filters
 * @returns {void}
 */
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * Reset query form and parameters
 * @description Clears all search filters, resets form validation, and fetches fresh data
 * @returns {void}
 */
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
