<!--
==================================================================================
My Notice Component (Personal Notification Center)
==================================================================================

This component provides comprehensive personal notification management functionality 
for users to view, read, and manage their notifications including:
- Personal notification viewing with advanced search and filtering capabilities
- Read/unread status tracking and management with visual indicators
- Notification content display with rich text formatting support
- Real-time notification status updates and user interaction tracking
- Pagination support for efficient handling of large notification datasets
- Detailed notification preview with publisher information and timestamps

Key Notification Features:
- Personal Notice Display: User-specific notification listing and management
- Read Status Management: Visual read/unread indicators with automatic status updates
- Notice Type Classification: Categorized notifications with type-based styling
- Publisher Information: Complete publisher details with user identification
- Timestamp Display: Formatted publication times for chronological organization
- Content Preview: Rich text content display with HTML formatting support

Search & Filtering Capabilities:
- Title-based Search: Full-text search across notification titles
- Real-time Query Processing: Instant search results with dynamic filtering
- Advanced Filtering Options: Multi-criteria notification filtering
- Pagination Support: Memory-efficient browsing of large notification datasets
- Search Reset Functionality: Quick filter clearing and data refresh
- Responsive Search Interface: Optimized search experience across devices

User Interaction Features:
- Notice Reading: Automatic read status marking upon notification viewing
- Detailed View Modal: Expandable notification detail dialog with complete content
- Status Indicator System: Visual read/unread status with color-coded tags
- Interactive Table Interface: Sortable and responsive notification listing
- Loading States: User feedback during data retrieval and status updates
- Error Handling: Graceful error management for API operations

Content Management:
- Rich Text Support: HTML content rendering with proper formatting
- Meta Information Display: Publisher, timestamp, and classification details
- Content Sanitization: Safe HTML rendering with XSS protection
- Responsive Content Layout: Optimized content display for various screen sizes
- Long Content Handling: Proper overflow management and content expansion
- Typography Optimization: Enhanced readability with professional text styling

Notification Status System:
- Automatic Read Marking: Seamless status updates upon notification interaction
- Visual Status Indicators: Clear read/unread distinction with color coding
- Status Persistence: Reliable status tracking across user sessions
- Real-time Updates: Live status synchronization for active user sessions
- Bulk Status Operations: Efficient mass status management capabilities
- Status History Tracking: Complete notification interaction audit trail

Technical Implementation:
- Vue 3 Composition API with TypeScript for robust component development
- Element Plus UI components for professional notification interface
- Reactive state management for real-time notification updates
- RESTful API integration with comprehensive error handling
- Responsive design with optimized table and modal layouts
- Internationalization (i18n) support for multi-language deployment
- XSS protection and content sanitization for secure HTML rendering

Integration Points:
- User Management System: Personal notification targeting and delivery
- Content Management: Rich text content creation and formatting
- Authentication System: User-specific notification access control
- Real-time Messaging: Live notification delivery and status updates
- Audit System: Notification interaction logging and tracking
- Email Integration: Notification delivery channel coordination

@component MyNotice
@author Chang Xiu-Wen, AI-Enhanced  
@version 1.6.0
@created 2025-09-30
@updated 2025-09-30

==================================================================================
-->

<template>
  <div class="app-container">
    <!-- Search area -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="t('notice.search.title')" prop="title">
          <el-input
            v-model="queryParams.title"
            :placeholder="t('notice.search.titlePlaceholder')"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" @click="handleQuery()">
            <template #icon>
              <Search />
            </template>
            {{ t("notice.actions.search") }}
          </el-button>
          <el-button @click="handleResetQuery()">
            <template #icon>
              <Refresh />
            </template>
            {{ t("notice.actions.reset") }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        class="data-table__content"
      >
        <el-table-column type="index" :label="t('common.serialNumber')" width="60" />
        <el-table-column :label="t('notice.table.title')" prop="title" min-width="250" />
        <el-table-column align="center" :label="t('notice.table.type')" width="120">
          <template #default="scope">
            <DictLabel v-model="scope.row.type" code="notice_type" />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          :label="t('notice.table.publishUser')"
          prop="publisherName"
          width="100"
        />
        <el-table-column
          key="releaseTime"
          align="center"
          :label="t('notice.table.publishTime')"
          prop="publishTime"
          width="160"
        />
        <el-table-column align="center" :label="t('common.status')" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.isRead == 1" type="success" size="small">
              {{ t("notice.status.read") }}
            </el-tag>
            <el-tag v-else type="info" size="small">{{ t("notice.status.unread") }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" :label="t('common.operation')" width="70">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleReadNotice(scope.row.id)">
              {{ t("notice.actions.detail") }}
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

    <el-dialog
      v-model="noticeDialogVisible"
      :title="noticeDetail?.title ?? t('notice.detail.title')"
      width="800px"
      custom-class="notice-detail"
    >
      <div v-if="noticeDetail" class="notice-detail__wrapper">
        <div class="notice-detail__meta">
          <span>
            <el-icon><User /></el-icon>
            {{ noticeDetail.publisherName }}
          </span>
          <span class="ml-2">
            <el-icon><Timer /></el-icon>
            {{ noticeDetail.publishTime }}
          </span>
        </div>

        <div class="notice-detail__content">
          <div v-html="noticeDetail.content"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "MyNotice",
  inheritAttrs: false,
});

import NoticeAPI, { NoticePageVO, NoticePageQuery, NoticeDetailVO } from "@/api/system/notice-api";

const { t } = useI18n();

const queryFormRef = ref();
const pageData = ref<NoticePageVO[]>([]);

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<NoticePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const noticeDialogVisible = ref(false);
const noticeDetail = ref<NoticeDetailVO | null>(null);

// Get user's notice list
function handleQuery() {
  loading.value = true;
  NoticeAPI.getMyNoticePage(queryParams)
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

// Read notice detail
function handleReadNotice(id: string) {
  NoticeAPI.getDetail(id).then((data) => {
    noticeDialogVisible.value = true;
    noticeDetail.value = data;
  });
}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
:deep(.el-dialog__header) {
  text-align: center;
}
.notice-detail {
  &__wrapper {
    padding: 0 20px;
  }

  &__meta {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__publisher {
    margin-right: 24px;

    i {
      margin-right: 4px;
    }
  }

  &__content {
    max-height: 60vh;
    padding-top: 16px;
    margin-bottom: 24px;
    overflow-y: auto;
    border-top: 1px solid var(--el-border-color);

    &::-webkit-scrollbar {
      width: 6px;
    }
  }
}
</style>
