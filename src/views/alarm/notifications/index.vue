<!--
  Alarm Notifications Page
  ========================
  
  Notification channel management and configuration for alarm system.
  Allows users to configure various notification methods and test them.
  
  Features:
  - Email notification configuration
  - SMS notification setup
  - Webhook configuration
  - Slack/Teams integration
  - Notification testing
  - Channel status monitoring
  - Notification history
  
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025-10-02
  @version 1.0.0
-->

<template>
  <div class="alarm-notifications">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">{{ $t("alarm.notifications.title") }}</h2>
        <div class="description">
          {{ $t("alarm.notifications.description") }}
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showAddChannelDialog">
          <i class="i-ep-plus"></i>
          {{ $t("alarm.notifications.addChannel") }}
        </el-button>
      </div>
    </div>

    <!-- Channel Statistics -->
    <div class="stats-section">
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon email">
              <i class="i-ep-message"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ channelStats.email }}</div>
              <div class="stat-label">{{ $t("alarm.notifications.emailChannels") }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon sms">
              <i class="i-ep-chat-line-square"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ channelStats.sms }}</div>
              <div class="stat-label">{{ $t("alarm.notifications.smsChannels") }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon webhook">
              <i class="i-ep-link"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ channelStats.webhook }}</div>
              <div class="stat-label">{{ $t("alarm.notifications.webhookChannels") }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon active">
              <i class="i-ep-check"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ channelStats.active }}</div>
              <div class="stat-label">{{ $t("alarm.notifications.activeChannels") }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Notification Channels -->
    <div class="channels-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>{{ $t("alarm.notifications.channels") }}</span>
            <div class="header-actions">
              <el-button type="text" @click="refreshChannels">
                <i class="i-ep-refresh"></i>
              </el-button>
            </div>
          </div>
        </template>

        <div v-loading="loading" class="channels-list">
          <div
            v-for="channel in notificationChannels"
            :key="channel.channelId"
            class="channel-item"
            :class="{ disabled: !channel.isActive }"
          >
            <div class="channel-icon">
              <i :class="getChannelIcon(channel.channelType)"></i>
            </div>
            <div class="channel-info">
              <div class="channel-name">{{ channel.channelName }}</div>
              <div class="channel-details">
                <span class="channel-type">{{ getChannelTypeLabel(channel.channelType) }}</span>
                <span class="channel-config">{{ getChannelConfig(channel) }}</span>
              </div>
            </div>
            <div class="channel-status">
              <el-tag :type="channel.isActive ? 'success' : 'info'" size="small">
                {{ channel.isActive ? $t("common.enabled") : $t("common.disabled") }}
              </el-tag>
              <div class="last-test">
                {{
                  notificationStore.getTestResult?.(channel.channelId)?.timestamp
                    ? formatTime(
                        notificationStore.getTestResult(channel.channelId)!.timestamp.toISOString()
                      )
                    : $t("common.never")
                }}
              </div>
            </div>
            <div class="channel-actions">
              <el-button-group size="small">
                <el-button @click="testChannel(channel)">
                  <i class="i-ep-promotion"></i>
                  {{ $t("alarm.notifications.test") }}
                </el-button>
                <el-button @click="editChannel(channel)">
                  <i class="i-ep-edit"></i>
                  {{ $t("common.edit") }}
                </el-button>
                <el-button type="danger" @click="deleteChannel(channel.channelId)">
                  <i class="i-ep-delete"></i>
                  {{ $t("common.delete") }}
                </el-button>
              </el-button-group>
            </div>
          </div>

          <div v-if="notificationChannels.length === 0" class="empty-state">
            <i class="i-ep-bell"></i>
            <p>{{ $t("alarm.notifications.noChannels") }}</p>
            <el-button type="primary" @click="showAddChannelDialog">
              {{ $t("alarm.notifications.addFirstChannel") }}
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Notification History -->
    <div class="history-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>{{ $t("alarm.notifications.recentNotifications") }}</span>
            <div class="header-actions">
              <el-select v-model="historyFilter" size="small" style="width: 120px">
                <el-option :label="$t('common.all')" value="all" />
                <el-option :label="$t('common.success')" value="success" />
                <el-option :label="$t('common.failed')" value="failed" />
              </el-select>
            </div>
          </div>
        </template>

        <el-table :data="notificationHistory" style="width: 100%">
          <el-table-column prop="timestamp" :label="$t('common.time')" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="channelName"
            :label="$t('alarm.notifications.channel')"
            width="150"
          />
          <el-table-column
            prop="alarmTitle"
            :label="$t('alarm.notifications.alarm')"
            min-width="200"
          />
          <el-table-column
            prop="recipient"
            :label="$t('alarm.notifications.recipient')"
            width="200"
          />
          <el-table-column prop="status" :label="$t('common.status')" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                {{ row.status === "success" ? $t("common.success") : $t("common.failed") }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.actions')" width="100" align="center">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="viewNotificationDetail(row)">
                {{ $t("common.detail") }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- Add/Edit Channel Dialog -->
    <el-dialog
      v-model="channelDialogVisible"
      :title="
        editingChannel
          ? $t('alarm.notifications.editChannel')
          : $t('alarm.notifications.addChannel')
      "
      width="600px"
      :before-close="handleChannelDialogClose"
    >
      <el-form
        ref="channelFormRef"
        :model="channelForm"
        :rules="channelFormRules"
        label-width="120px"
      >
        <el-form-item :label="$t('alarm.notifications.channelName')" prop="name">
          <el-input
            v-model="channelForm.name"
            :placeholder="$t('alarm.notifications.channelNamePlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('alarm.notifications.channelType')" prop="type">
          <el-select
            v-model="channelForm.type"
            :placeholder="$t('alarm.notifications.selectChannelType')"
            @change="handleChannelTypeChange"
          >
            <el-option :label="$t('alarm.notifications.email')" value="email" />
            <el-option :label="$t('alarm.notifications.sms')" value="sms" />
            <el-option :label="$t('alarm.notifications.webhook')" value="webhook" />
            <el-option :label="$t('alarm.notifications.slack')" value="slack" />
          </el-select>
        </el-form-item>

        <!-- Email Configuration -->
        <template v-if="channelForm.type === 'email'">
          <el-form-item :label="$t('alarm.notifications.emailAddresses')" prop="config.emails">
            <el-input
              v-model="channelForm.config.emails"
              type="textarea"
              :rows="3"
              :placeholder="$t('alarm.notifications.emailAddressesPlaceholder')"
            />
          </el-form-item>
          <el-form-item :label="$t('alarm.notifications.emailSubject')" prop="config.subject">
            <el-input
              v-model="channelForm.config.subject"
              :placeholder="$t('alarm.notifications.emailSubjectPlaceholder')"
            />
          </el-form-item>
        </template>

        <!-- SMS Configuration -->
        <template v-if="channelForm.type === 'sms'">
          <el-form-item :label="$t('alarm.notifications.phoneNumbers')" prop="config.phones">
            <el-input
              v-model="channelForm.config.phones"
              type="textarea"
              :rows="3"
              :placeholder="$t('alarm.notifications.phoneNumbersPlaceholder')"
            />
          </el-form-item>
        </template>

        <!-- Webhook Configuration -->
        <template v-if="channelForm.type === 'webhook'">
          <el-form-item :label="$t('alarm.notifications.webhookUrl')" prop="config.url">
            <el-input
              v-model="channelForm.config.url"
              :placeholder="$t('alarm.notifications.webhookUrlPlaceholder')"
            />
          </el-form-item>
          <el-form-item :label="$t('alarm.notifications.httpMethod')" prop="config.method">
            <el-select v-model="channelForm.config.method">
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('alarm.notifications.headers')">
            <el-input
              v-model="channelForm.config.headers"
              type="textarea"
              :rows="3"
              :placeholder="$t('alarm.notifications.headersPlaceholder')"
            />
          </el-form-item>
        </template>

        <!-- Slack Configuration -->
        <template v-if="channelForm.type === 'slack'">
          <el-form-item :label="$t('alarm.notifications.slackWebhookUrl')" prop="config.webhookUrl">
            <el-input
              v-model="channelForm.config.webhookUrl"
              :placeholder="$t('alarm.notifications.slackWebhookUrlPlaceholder')"
            />
          </el-form-item>
          <el-form-item :label="$t('alarm.notifications.slackChannel')" prop="config.channel">
            <el-input
              v-model="channelForm.config.channel"
              :placeholder="$t('alarm.notifications.slackChannelPlaceholder')"
            />
          </el-form-item>
        </template>

        <el-form-item :label="$t('common.enabled')">
          <el-switch v-model="channelForm.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleChannelDialogClose">{{ $t("common.cancel") }}</el-button>
          <el-button type="primary" @click="saveChannel">
            {{ editingChannel ? $t("common.update") : $t("common.create") }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Test Result Dialog -->
    <el-dialog
      v-model="testResultDialogVisible"
      :title="$t('alarm.notifications.testResult')"
      width="500px"
    >
      <div class="test-result">
        <div class="result-status" :class="testResult?.success ? 'success' : 'error'">
          <i :class="testResult?.success ? 'i-ep-circle-check' : 'i-ep-circle-close'"></i>
          <span>{{ testResult?.success ? $t("common.success") : $t("common.failed") }}</span>
        </div>
        <div v-if="testResult?.message" class="result-message">
          {{ testResult.message }}
        </div>
        <div v-if="testResult?.details" class="result-details">
          <pre>{{ testResult.details }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="testResultDialogVisible = false">
          {{ $t("common.close") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import { useNotificationStore } from "@/store/modules/notification-store";

// Composables
const { t } = useI18n();
const notificationStore = useNotificationStore();

// Reactive state
const loading = ref(false);
const channelDialogVisible = ref(false);
const testResultDialogVisible = ref(false);
const editingChannel = ref(false);
const historyFilter = ref("all");
const channelFormRef = ref<FormInstance>();

// Channel form
const channelForm = ref({
  id: "",
  name: "",
  type: "",
  enabled: true,
  config: {} as any,
});

// Test result
const testResult = ref<{
  success: boolean;
  message: string;
  details?: string;
} | null>(null);

// Form validation rules
const channelFormRules = computed(() => ({
  name: [
    { required: true, message: t("alarm.notifications.channelNameRequired"), trigger: "blur" },
  ],
  type: [
    { required: true, message: t("alarm.notifications.channelTypeRequired"), trigger: "change" },
  ],
  "config.emails":
    channelForm.value.type === "email"
      ? [
          {
            required: true,
            message: t("alarm.notifications.emailAddressesRequired"),
            trigger: "blur",
          },
        ]
      : [],
  "config.phones":
    channelForm.value.type === "sms"
      ? [
          {
            required: true,
            message: t("alarm.notifications.phoneNumbersRequired"),
            trigger: "blur",
          },
        ]
      : [],
  "config.url":
    channelForm.value.type === "webhook"
      ? [{ required: true, message: t("alarm.notifications.webhookUrlRequired"), trigger: "blur" }]
      : [],
  "config.webhookUrl":
    channelForm.value.type === "slack"
      ? [
          {
            required: true,
            message: t("alarm.notifications.slackWebhookUrlRequired"),
            trigger: "blur",
          },
        ]
      : [],
}));

// Computed properties
const notificationChannels = computed(() => notificationStore.channels);
const notificationHistory = computed(() => {
  let history = notificationStore.recentNotifications;
  if (historyFilter.value === "success") {
    history = history.filter((item: any) => item.severity === "SUCCESS");
  } else if (historyFilter.value === "failed") {
    history = history.filter((item: any) => item.severity === "ERROR");
  }
  return history.slice(0, 50); // Show latest 50
});

const channelStats = computed(() => ({
  email: notificationChannels.value.filter((c) => c.channelType === "EMAIL").length,
  sms: notificationChannels.value.filter((c) => c.channelType === "SMS").length,
  webhook: notificationChannels.value.filter((c) => c.channelType === "WEBHOOK").length,
  active: notificationChannels.value.filter((c) => c.isActive).length,
}));

// Utility functions
const getChannelIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    email: "i-ep-message",
    sms: "i-ep-chat-line-square",
    webhook: "i-ep-link",
    slack: "i-ep-chat-dot-square",
  };
  return iconMap[type] || "i-ep-bell";
};

const getChannelTypeLabel = (type: string) => {
  return t(`alarm.notifications.${type}`);
};

const getChannelConfig = (channel: any) => {
  switch (channel.type) {
    case "email":
      return channel.config.emails?.split(",").length + " " + t("alarm.notifications.recipients");
    case "sms":
      return channel.config.phones?.split(",").length + " " + t("alarm.notifications.recipients");
    case "webhook":
      return channel.config.url;
    case "slack":
      return channel.config.channel || "#general";
    default:
      return "";
  }
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

const formatDateTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

// Event handlers
const refreshChannels = async () => {
  loading.value = true;
  try {
    await notificationStore.loadChannels();
    ElMessage.success(t("alarm.success.dataLoaded"));
  } catch {
    ElMessage.error(t("alarm.errors.loadFailed"));
  } finally {
    loading.value = false;
  }
};

const showAddChannelDialog = () => {
  editingChannel.value = false;
  channelForm.value = {
    id: "",
    name: "",
    type: "",
    enabled: true,
    config: {},
  };
  channelDialogVisible.value = true;
};

const editChannel = (channel: any) => {
  editingChannel.value = true;
  channelForm.value = { ...channel };
  channelDialogVisible.value = true;
};

const handleChannelTypeChange = () => {
  // Reset config when type changes
  channelForm.value.config = {};

  // Set default values based on type
  switch (channelForm.value.type) {
    case "email":
      channelForm.value.config = {
        emails: "",
        subject: "Alarm Notification - {{alarmTitle}}",
      };
      break;
    case "sms":
      channelForm.value.config = {
        phones: "",
      };
      break;
    case "webhook":
      channelForm.value.config = {
        url: "",
        method: "POST",
        headers: "",
      };
      break;
    case "slack":
      channelForm.value.config = {
        webhookUrl: "",
        channel: "#general",
      };
      break;
  }
};

const saveChannel = async () => {
  if (!channelFormRef.value) return;

  try {
    await channelFormRef.value.validate();

    const channelData = {
      channelName: channelForm.value.name,
      channelType: channelForm.value.type.toUpperCase() as "EMAIL" | "SMS" | "WEBHOOK",
      isActive: channelForm.value.enabled,
      configuration: channelForm.value.config,
      description: channelForm.value.name,
      recipients: channelForm.value.config.emails || channelForm.value.config.phones || "",
      successRate: 1.0,
      healthStatus: "HEALTHY" as "HEALTHY" | "WARNING" | "UNHEALTHY",
      createdBy: "current_user",
      createdTime: new Date().toISOString(),
      updatedBy: "current_user",
    };

    if (editingChannel.value) {
      await notificationStore.updateChannel(channelForm.value.id, channelData);
      ElMessage.success(t("alarm.success.channelUpdated"));
    } else {
      await notificationStore.createChannel(channelData);
      ElMessage.success(t("alarm.success.channelCreated"));
    }

    channelDialogVisible.value = false;
    await refreshChannels();
  } catch (error) {
    console.error("Save channel error:", error);
    ElMessage.error(t("alarm.errors.channelSaveFailed"));
  }
};

const deleteChannel = async (channelId: string) => {
  try {
    await ElMessageBox.confirm(t("alarm.notifications.deleteChannelConfirm"), t("common.confirm"), {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      type: "warning",
    });

    await notificationStore.deleteChannel(channelId);
    ElMessage.success(t("alarm.success.channelDeleted"));
    await refreshChannels();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(t("alarm.errors.channelDeleteFailed"));
    }
  }
};

const testChannel = async (channel: any) => {
  try {
    await notificationStore.testChannel(channel.channelId);

    // Get test result from store
    const result = notificationStore.getTestResult(channel.channelId);
    if (result) {
      testResult.value = {
        success: result.success,
        message: result.message,
        details: result.timestamp.toISOString(),
      };
      testResultDialogVisible.value = true;
    }

    ElMessage.success(t("alarm.success.channelTested"));
    await refreshChannels();
  } catch {
    ElMessage.error(t("alarm.errors.channelTestFailed"));
    testResult.value = {
      success: false,
      message: t("alarm.errors.channelTestFailed"),
    };
    testResultDialogVisible.value = true;
  }
};

const handleChannelDialogClose = () => {
  channelDialogVisible.value = false;
  channelForm.value = {
    id: "",
    name: "",
    type: "",
    enabled: true,
    config: {},
  };
};

const viewNotificationDetail = (notification: any) => {
  // Implementation for viewing notification details
  console.log("View notification detail:", notification);
};

// Lifecycle hooks
onMounted(async () => {
  await refreshChannels();
});
</script>

<style lang="scss" scoped>
.alarm-notifications {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 120px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .header-left {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .description {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }

    .header-right {
      .el-button {
        i {
          margin-right: 4px;
        }
      }
    }
  }

  .stats-section {
    margin-bottom: 24px;

    .stat-card {
      background: var(--el-color-white);
      border: 1px solid var(--el-border-color-light);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;

        i {
          font-size: 24px;
          color: var(--el-color-white);
        }

        &.email {
          background: linear-gradient(
            135deg,
            var(--el-color-primary) 0%,
            var(--el-color-primary-light-3) 100%
          );
        }

        &.sms {
          background: linear-gradient(
            135deg,
            var(--el-color-success) 0%,
            var(--el-color-success-light-3) 100%
          );
        }

        &.webhook {
          background: linear-gradient(
            135deg,
            var(--el-color-warning) 0%,
            var(--el-color-warning-light-3) 100%
          );
        }

        &.active {
          background: linear-gradient(
            135deg,
            var(--el-color-info) 0%,
            var(--el-color-info-light-3) 100%
          );
        }
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--el-text-color-primary);
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }

  .channels-section {
    margin-bottom: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .channels-list {
      .channel-item {
        display: flex;
        align-items: center;
        padding: 20px 0;
        border-bottom: 1px solid var(--el-border-color-lighter);
        transition: all 0.2s ease;

        &:hover {
          background-color: var(--el-bg-color);
        }

        &:last-child {
          border-bottom: none;
        }

        &.disabled {
          opacity: 0.6;
        }

        .channel-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: var(--el-color-primary-light-9);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;

          i {
            font-size: 20px;
            color: var(--el-color-primary);
          }
        }

        .channel-info {
          flex: 1;

          .channel-name {
            font-size: 16px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
          }

          .channel-details {
            display: flex;
            gap: 12px;
            font-size: 14px;
            color: var(--el-text-color-regular);

            .channel-type {
              font-weight: 500;
            }

            .channel-config {
              opacity: 0.8;
            }
          }
        }

        .channel-status {
          margin-right: 16px;
          text-align: center;

          .last-test {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-top: 4px;
          }
        }

        .channel-actions {
          .el-button-group {
            .el-button {
              i {
                margin-right: 4px;
              }
            }
          }
        }
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--el-text-color-secondary);

        i {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        p {
          margin: 0 0 20px 0;
          font-size: 16px;
        }
      }
    }
  }

  .history-section {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }

  .test-result {
    .result-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;

      &.success {
        color: var(--el-color-success);
      }

      &.error {
        color: var(--el-color-danger);
      }

      i {
        font-size: 20px;
      }
    }

    .result-message {
      margin-bottom: 16px;
      color: var(--el-text-color-regular);
    }

    .result-details {
      background: var(--el-bg-color);
      border-radius: 4px;
      padding: 12px;

      pre {
        margin: 0;
        font-size: 12px;
        color: var(--el-text-color-regular);
        white-space: pre-wrap;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

// Responsive design
@media (max-width: 1200px) {
  .alarm-notifications {
    padding: 16px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-left,
      .header-right {
        width: 100%;
      }
    }

    .stats-section {
      .el-col {
        margin-bottom: 16px;
      }
    }
  }
}

@media (max-width: 768px) {
  .alarm-notifications {
    .channels-list {
      .channel-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;

        .channel-info,
        .channel-status,
        .channel-actions {
          width: 100%;
        }

        .channel-actions {
          .el-button-group {
            width: 100%;

            .el-button {
              flex: 1;
            }
          }
        }
      }
    }
  }
}

// Dark mode support
html.dark {
  .alarm-notifications {
    .stat-card {
      background: var(--el-bg-color-overlay);
      border-color: var(--el-border-color);
    }
  }
}
</style>
