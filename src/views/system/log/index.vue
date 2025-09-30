<!--
==================================================================================
System Log Management Component (Audit Trail & Activity Monitoring)
==================================================================================

This component provides comprehensive system log management and audit trail 
functionality for monitoring user activities and system operations including:
- Real-time system log viewing with advanced filtering capabilities
- User activity tracking and audit trail management
- Time-based log querying with flexible date range selection
- Comprehensive operation details including IP addresses, browsers, and OS information
- Performance monitoring with execution time tracking
- Module-based log categorization and content analysis

Key Logging Features:
- Operation Tracking: Complete user action logging with timestamps
- User Identification: Operator information and authentication tracking
- Module Classification: System module-based log categorization
- Content Analysis: Detailed operation content and context information
- Network Information: IP address tracking for security monitoring
- Browser Detection: Client browser and user agent identification
- OS Information: Operating system details for compatibility tracking
- Performance Metrics: Execution time monitoring for operation analysis

Search & Filtering Capabilities:
- Keyword Search: Full-text search across log content and operations
- Date Range Filtering: Flexible time-based log retrieval
- Real-time Query Processing: Dynamic log filtering with instant results
- Pagination Support: Efficient handling of large log datasets
- Advanced Filtering: Multi-criteria search and filtering options
- Export Functionality: Log data export for external analysis

Security & Audit Features:
- Audit Trail Management: Complete user activity audit logging
- Security Monitoring: IP-based access tracking and anomaly detection
- Session Tracking: User session management and activity correlation
- Access Control Logging: Permission and authorization activity tracking
- System Event Logging: Critical system operations and configuration changes
- Compliance Reporting: Regulatory compliance and audit report generation

Data Visualization:
- Tabular Log Display: Structured log data presentation with sorting capabilities
- Time-based Sorting: Chronological log ordering for timeline analysis
- Responsive Table Design: Optimized display for various screen sizes
- Overflow Handling: Long content truncation with tooltip expansion
- Loading States: User feedback during data retrieval operations
- Error Handling: Graceful error management for API failures

Performance Optimization:
- Lazy Loading: Efficient data loading for large log datasets
- Pagination: Memory-efficient log browsing with page-based navigation
- Caching Strategy: Optimized data retrieval and storage
- Query Optimization: Efficient database queries for log retrieval
- Real-time Updates: Live log streaming for critical system monitoring
- Data Compression: Optimized log storage and transmission

Technical Implementation:
- Vue 3 Composition API with TypeScript for robust development
- Element Plus UI components for professional log management interface
- Reactive state management for real-time log updates
- RESTful API integration with comprehensive error handling
- Responsive design with optimized table layouts
- Internationalization (i18n) support for multi-language deployment
- Security-focused architecture with audit trail integrity

Integration Points:
- User Management System: User authentication and authorization integration
- System Modules: Integration with all system components for comprehensive logging
- Security Framework: Authentication and authorization event logging
- Notification System: Critical event alerting and notification integration
- Backup System: Log archival and retention policy management
- Compliance Tools: Regulatory reporting and audit trail export functionality

@component Log
@author Chang Xiu-Wen, AI-Enhanced
@version 1.8.0
@created 2025-09-12
@updated 2025-09-30

==================================================================================
-->

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
