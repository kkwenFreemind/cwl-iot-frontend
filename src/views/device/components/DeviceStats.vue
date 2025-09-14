<!--
  Device Statistics Panel Component
  設備統計面板組件
  
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025/09/14
-->
<template>
  <el-row :gutter="20" class="device-stats">
    <el-col :xl="3" :lg="6" :md="6" :sm="12" :xs="24">
      <div class="stats-card stats-card--primary">
        <div class="stats-card__icon">
          <div class="i-ep:monitor" />
        </div>
        <div class="stats-card__content">
          <div class="stats-card__number">{{ stats.totalDevices }}</div>
          <div class="stats-card__label">{{ $t("device.stats.totalDevices") }}</div>
        </div>
      </div>
    </el-col>

    <el-col :xl="3" :lg="6" :md="6" :sm="12" :xs="24">
      <div class="stats-card stats-card--success">
        <div class="stats-card__icon">
          <div class="i-ep:circle-check" />
        </div>
        <div class="stats-card__content">
          <div class="stats-card__number">{{ stats.activeDevices }}</div>
          <div class="stats-card__label">{{ $t("device.stats.activeDevices") }}</div>
        </div>
      </div>
    </el-col>

    <el-col :xl="3" :lg="6" :md="6" :sm="12" :xs="24">
      <div class="stats-card stats-card--warning">
        <div class="stats-card__icon">
          <div class="i-ep:warning" />
        </div>
        <div class="stats-card__content">
          <div class="stats-card__number">{{ stats.inactiveDevices }}</div>
          <div class="stats-card__label">{{ $t("device.stats.inactiveDevices") }}</div>
        </div>
      </div>
    </el-col>

    <el-col :xl="3" :lg="6" :md="6" :sm="12" :xs="24">
      <div class="stats-card stats-card--danger">
        <div class="stats-card__icon">
          <div class="i-ep:circle-close" />
        </div>
        <div class="stats-card__content">
          <div class="stats-card__number">{{ stats.disabledDevices }}</div>
          <div class="stats-card__label">{{ $t("device.stats.disabledDevices") }}</div>
        </div>
      </div>
    </el-col>

    <el-col :xl="3" :lg="6" :md="6" :sm="12" :xs="24">
      <div class="stats-card stats-card--info">
        <div class="stats-card__icon">
          <div class="i-ep:connection" />
        </div>
        <div class="stats-card__content">
          <div class="stats-card__number">{{ stats.onlineDevices }}</div>
          <div class="stats-card__label">{{ $t("device.stats.onlineDevices") }}</div>
        </div>
      </div>
    </el-col>

    <el-col :xl="3" :lg="6" :md="6" :sm="12" :xs="24">
      <div class="stats-card stats-card--secondary">
        <div class="stats-card__icon">
          <div class="i-ep:tools" />
        </div>
        <div class="stats-card__content">
          <div class="stats-card__number">{{ stats.maintenanceDueDevices }}</div>
          <div class="stats-card__label">{{ $t("device.stats.maintenanceDue") }}</div>
        </div>
      </div>
    </el-col>

    <el-col :xl="3" :lg="6" :md="6" :sm="12" :xs="24">
      <div class="stats-card stats-card--purple">
        <div class="stats-card__icon">
          <div class="i-ep:calendar" />
        </div>
        <div class="stats-card__content">
          <div class="stats-card__number">{{ stats.warrantyExpiringDevices }}</div>
          <div class="stats-card__label">{{ $t("device.stats.warrantyExpiring") }}</div>
        </div>
      </div>
    </el-col>

    <el-col :xl="3" :lg="6" :md="6" :sm="12" :xs="24">
      <div class="stats-card stats-card--cyan">
        <div class="stats-card__icon">
          <div class="i-ep:connection" />
        </div>
        <div class="stats-card__content">
          <div class="stats-card__number">{{ stats.offlineDevices }}</div>
          <div class="stats-card__label">{{ $t("device.stats.offlineDevices") }}</div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import type { DeviceStatsVO } from "@/api/device/device-api";

/**
 * Component Props
 * 組件屬性
 */
interface Props {
  stats: DeviceStatsVO;
}

defineProps<Props>();

defineOptions({
  name: "DeviceStats",
  inheritAttrs: false,
});
</script>

<style lang="scss" scoped>
.device-stats {
  margin-bottom: 20px;
}

.stats-card {
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    margin-right: 16px;
    border-radius: 50%;

    [class^="i-ep:"] {
      font-size: 28px;
      color: white;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__number {
    margin-bottom: 4px;
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__label {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
  }

  // Theme variations
  &--primary &__icon {
    background: var(--el-color-primary);
  }

  &--success &__icon {
    background: var(--el-color-success);
  }

  &--warning &__icon {
    background: var(--el-color-warning);
  }

  &--danger &__icon {
    background: var(--el-color-danger);
  }

  &--info &__icon {
    background: var(--el-color-info);
  }

  &--secondary &__icon {
    background: #6c757d;
  }

  &--purple &__icon {
    background: #6f42c1;
  }

  &--cyan &__icon {
    background: #20c997;
  }
}

// Responsive design
@media (max-width: 768px) {
  .stats-card {
    padding: 16px;

    &__icon {
      width: 50px;
      height: 50px;
      margin-right: 12px;

      [class^="i-ep:"] {
        font-size: 24px;
      }
    }

    &__number {
      font-size: 20px;
    }

    &__label {
      font-size: 12px;
    }
  }
}
</style>
