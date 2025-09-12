<template>
  <div class="dashboard-container">
    <!-- 資料統計 -->
    <el-row :gutter="10" class="mt-5">
      <!-- 線上使用者數量 -->
      <el-col :span="8" :xs="24" class="mb-xs-3">
        <el-card shadow="never" class="h-full flex flex-col">
          <template #header>
            <div class="flex-x-between">
              <span class="text-gray">線上使用者</span>
              <el-tag type="danger" size="small">實時</el-tag>
            </div>
          </template>

          <div class="flex-x-between mt-2 flex-1">
            <div class="flex-y-center">
              <span class="text-lg transition-all duration-300 hover:scale-110">
                {{ onlineUserCount }}
              </span>
              <span v-if="isConnected" class="ml-2 text-xs text-[#67c23a]">
                <el-icon><Connection /></el-icon>
                已連線
              </span>
              <span v-else class="ml-2 text-xs text-[#f56c6c]">
                <el-icon><Failed /></el-icon>
                未連線
              </span>
            </div>
            <div class="i-svg:people w-8 h-8 animate-[pulse_2s_infinite]" />
          </div>

          <div class="flex-x-between mt-2 text-sm text-gray">
            <span>更新時間</span>
            <span>{{ formattedTime }}</span>
          </div>
        </el-card>
      </el-col>

      <!-- 訪客數(UV) -->
      <el-col :span="8" :xs="24" class="mb-xs-3">
        <el-skeleton :loading="visitStatsLoading" :rows="5" animated>
          <template #template>
            <el-card>
              <template #header>
                <div>
                  <el-skeleton-item variant="h3" style="width: 40%" />
                  <el-skeleton-item variant="rect" style="float: right; width: 1em; height: 1em" />
                </div>
              </template>

              <div class="flex-x-between">
                <el-skeleton-item variant="text" style="width: 30%" />
                <el-skeleton-item variant="circle" style="width: 2em; height: 2em" />
              </div>
              <div class="mt-5 flex-x-between">
                <el-skeleton-item variant="text" style="width: 50%" />
                <el-skeleton-item variant="text" style="width: 1em" />
              </div>
            </el-card>
          </template>
          <template v-if="!visitStatsLoading">
            <el-card shadow="never" class="h-full flex flex-col">
              <template #header>
                <div class="flex-x-between">
                  <span class="text-gray">訪客數(UV)</span>
                  <el-tag type="success" size="small">日</el-tag>
                </div>
              </template>

              <div class="flex-x-between mt-2 flex-1">
                <div class="flex-y-center">
                  <span class="text-lg">{{ Math.round(transitionUvCount) }}</span>
                  <span
                    :class="[
                      'text-xs',
                      'ml-2',
                      computeGrowthRateClass(visitStatsData.uvGrowthRate),
                    ]"
                  >
                    <el-icon>
                      <Top v-if="visitStatsData.uvGrowthRate > 0" />
                      <Bottom v-else-if="visitStatsData.uvGrowthRate < 0" />
                    </el-icon>
                    {{ formatGrowthRate(visitStatsData.uvGrowthRate) }}
                  </span>
                </div>
                <div class="i-svg:visitor w-8 h-8" />
              </div>

              <div class="flex-x-between mt-2 text-sm text-gray">
                <span>總訪客數</span>
                <span>{{ Math.round(transitionTotalUvCount) }}</span>
              </div>
            </el-card>
          </template>
        </el-skeleton>
      </el-col>

      <!-- 瀏覽量(PV) -->
      <el-col :span="8" :xs="24">
        <el-skeleton :loading="visitStatsLoading" :rows="5" animated>
          <template #template>
            <el-card>
              <template #header>
                <div>
                  <el-skeleton-item variant="h3" style="width: 40%" />
                  <el-skeleton-item variant="rect" style="float: right; width: 1em; height: 1em" />
                </div>
              </template>

              <div class="flex-x-between">
                <el-skeleton-item variant="text" style="width: 30%" />
                <el-skeleton-item variant="circle" style="width: 2em; height: 2em" />
              </div>
              <div class="mt-5 flex-x-between">
                <el-skeleton-item variant="text" style="width: 50%" />
                <el-skeleton-item variant="text" style="width: 1em" />
              </div>
            </el-card>
          </template>
          <template v-if="!visitStatsLoading">
            <el-card shadow="never" class="h-full flex flex-col">
              <template #header>
                <div class="flex-x-between">
                  <span class="text-gray">瀏覽量(PV)</span>
                  <el-tag type="primary" size="small">日</el-tag>
                </div>
              </template>

              <div class="flex-x-between mt-2 flex-1">
                <div class="flex-y-center">
                  <span class="text-lg">{{ Math.round(transitionPvCount) }}</span>
                  <span
                    :class="[
                      'text-xs',
                      'ml-2',
                      computeGrowthRateClass(visitStatsData.pvGrowthRate),
                    ]"
                  >
                    <el-icon>
                      <Top v-if="visitStatsData.pvGrowthRate > 0" />
                      <Bottom v-else-if="visitStatsData.pvGrowthRate < 0" />
                    </el-icon>
                    {{ formatGrowthRate(visitStatsData.pvGrowthRate) }}
                  </span>
                </div>
                <div class="i-svg:browser w-8 h-8" />
              </div>

              <div class="flex-x-between mt-2 text-sm text-gray">
                <span>總瀏覽量</span>
                <span>{{ Math.round(transitionTotalPvCount) }}</span>
              </div>
            </el-card>
          </template>
        </el-skeleton>
      </el-col>
    </el-row>

    <el-row :gutter="10" class="mt-5">
      <!-- 訪問趨勢統計圖 -->
      <el-col :xs="24" :span="16">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <span>訪問趨勢</span>
              <el-radio-group v-model="visitTrendDateRange" size="small">
                <el-radio-button :value="7">近7天</el-radio-button>
                <el-radio-button :value="30">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <ECharts :options="visitTrendChartOptions" height="400px" />
        </el-card>
      </el-col>
      <!-- 最新動態 -->
      <el-col :xs="24" :span="8">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <span class="header-title">最新動態</span>
              <el-link
                type="primary"
                underline="never"
                href="https://gitee.com/youlaiorg/vue3-element-admin/releases"
                target="_blank"
              >
                完整記錄
                <el-icon class="link-icon"><TopRight /></el-icon>
              </el-link>
            </div>
          </template>

          <el-scrollbar height="400px">
            <el-timeline class="p-3">
              <el-timeline-item
                v-for="(item, index) in vesionList"
                :key="index"
                :timestamp="item.date"
                placement="top"
                :color="index === 0 ? '#67C23A' : '#909399'"
                :hollow="index !== 0"
                size="large"
              >
                <div class="version-item" :class="{ 'latest-item': index === 0 }">
                  <div>
                    <el-text tag="strong">{{ item.title }}</el-text>
                    <el-tag v-if="item.tag" :type="index === 0 ? 'success' : 'info'" size="small">
                      {{ item.tag }}
                    </el-tag>
                  </div>

                  <el-text class="version-content">{{ item.content }}</el-text>

                  <div v-if="item.link">
                    <el-link
                      :type="index === 0 ? 'primary' : 'info'"
                      :href="item.link"
                      target="_blank"
                      underline="never"
                    >
                      詳情
                      <el-icon class="link-icon"><TopRight /></el-icon>
                    </el-link>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

import { dayjs } from "element-plus";
import LogAPI, { VisitStatsVO, VisitTrendVO } from "@/api/system/log-api";
// useUserStore import removed — not used after cleaning greeting logic
import { formatGrowthRate } from "@/utils";
import { useTransition, useDateFormat } from "@vueuse/core";
import { Connection, Failed } from "@element-plus/icons-vue";
import { useOnlineCount } from "@/composables/useOnlineCount";

// 線上使用者數量元件相關
const { onlineUserCount, lastUpdateTime, isConnected } = useOnlineCount();

// 記錄上一次的使用者數量用於計算趨勢
const previousCount = ref(0);

// 監聽使用者數量變化，計算趨勢
watch(onlineUserCount, (newCount, oldCount) => {
  if (oldCount > 0) {
    previousCount.value = oldCount;
  }
});

// 格式化時間戳
const formattedTime = computed(() => {
  if (!lastUpdateTime.value) return "--";
  return useDateFormat(lastUpdateTime, "HH:mm:ss").value;
});

interface VersionItem {
  id: string;
  title: string; // 版本標題（如：v2.4.0）
  date: string; // 釋出時間
  content: string; // 版本描述
  link: string; // 詳情連結
  tag?: string; // 版本標籤（可選）
}

// 當前通知公告列表
const vesionList = ref<VersionItem[]>([
  {
    id: "1",
    title: "v3.0.0",
    date: "2025-06-06 00:00:00",
    content: "佈局重寫，程式碼規範重構。",
    link: "https://gitee.com/youlaiorg/vue3-element-admin/releases",
    tag: "里程碑",
  },
  {
    id: "2",
    title: "v2.4.0",
    date: "2021-09-01 00:00:00",
    content: "實現基礎框架搭建，包含許可權管理、路由系統等核心功能。",
    link: "https://gitee.com/youlaiorg/vue3-element-admin/releases",
    tag: "里程碑",
  },
  {
    id: "3",
    title: "v2.4.0",
    date: "2021-09-01 00:00:00",
    content: "實現基礎框架搭建，包含許可權管理、路由系統等核心功能。",
    link: "https://gitee.com/youlaiorg/vue3-element-admin/releases",
    tag: "里程碑",
  },
]);

// userStore and currentDate removed — they were unused after cleaning up greeting logic

// Greeting computed was removed because it's unused in the template

// 訪客統計資料載入狀態
const visitStatsLoading = ref(true);
// 訪客統計資料
const visitStatsData = ref<VisitStatsVO>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

// 數字過渡動畫
const transitionUvCount = useTransition(
  computed(() => visitStatsData.value.todayUvCount),
  {
    duration: 1000,
    transition: [0.25, 0.1, 0.25, 1.0], // CSS cubic-bezier
  }
);

const transitionTotalUvCount = useTransition(
  computed(() => visitStatsData.value.totalUvCount),
  {
    duration: 1200,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);

const transitionPvCount = useTransition(
  computed(() => visitStatsData.value.todayPvCount),
  {
    duration: 1000,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);

const transitionTotalPvCount = useTransition(
  computed(() => visitStatsData.value.totalPvCount),
  {
    duration: 1200,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);

// 訪問趨勢日期範圍（單位：天）
const visitTrendDateRange = ref(7);
// 訪問趨勢圖表配置
const visitTrendChartOptions = ref();

/**
 * 獲取訪客統計資料
 */
const fetchVisitStatsData = () => {
  LogAPI.getVisitStats()
    .then((data) => {
      visitStatsData.value = data;
    })
    .finally(() => {
      visitStatsLoading.value = false;
    });
};

/**
 * 獲取訪問趨勢資料，並更新圖表配置
 */
const fetchVisitTrendData = () => {
  const startDate = dayjs()
    .subtract(visitTrendDateRange.value - 1, "day")
    .toDate();
  const endDate = new Date();

  LogAPI.getVisitTrend({
    startDate: dayjs(startDate).format("YYYY-MM-DD"),
    endDate: dayjs(endDate).format("YYYY-MM-DD"),
  }).then((data) => {
    updateVisitTrendChartOptions(data);
  });
};

/**
 * 更新訪問趨勢圖表的配置項
 *
 * @param data - 訪問趨勢資料
 */
const updateVisitTrendChartOptions = (data: VisitTrendVO) => {
  visitTrendChartOptions.value = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["瀏覽量(PV)", "訪客數(UV)"],
      bottom: 0,
    },
    grid: {
      left: "1%",
      right: "5%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.dates,
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "瀏覽量(PV)",
        type: "line",
        data: data.pvList,
        areaStyle: {
          color: "rgba(64, 158, 255, 0.1)",
        },
        smooth: true,
        itemStyle: {
          color: "#4080FF",
        },
        lineStyle: {
          color: "#4080FF",
        },
      },
      {
        name: "訪客數(UV)",
        type: "line",
        data: data.ipList,
        areaStyle: {
          color: "rgba(103, 194, 58, 0.1)",
        },
        smooth: true,
        itemStyle: {
          color: "#67C23A",
        },
        lineStyle: {
          color: "#67C23A",
        },
      },
    ],
  };
};

/**
 * 根據增長率計算對應的 CSS 類名
 *
 * @param growthRate - 增長率數值
 */
const computeGrowthRateClass = (growthRate?: number): string => {
  if (!growthRate) {
    return "text-[--el-color-info]";
  }
  if (growthRate > 0) {
    return "text-[--el-color-danger]";
  } else if (growthRate < 0) {
    return "text-[--el-color-success]";
  } else {
    return "text-[--el-color-info]";
  }
};

// 監聽訪問趨勢日期範圍的變化，重新獲取趨勢資料
watch(
  () => visitTrendDateRange.value,
  () => {
    fetchVisitTrendData();
  },
  { immediate: true }
);

// 元件掛載後載入訪客統計資料和通知公告資料
onMounted(() => {
  fetchVisitStatsData();
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 24px;

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }

  .version-item {
    padding: 16px;
    margin-bottom: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    transition: all 0.2s;

    &.latest-item {
      background: var(--el-color-primary-light-9);
      border: 1px solid var(--el-color-primary-light-5);
    }
    &:hover {
      transform: translateX(5px);
    }
    .version-content {
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 1.5;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
