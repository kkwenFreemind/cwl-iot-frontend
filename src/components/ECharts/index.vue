<!--
 * 基於 ECharts 的 Vue3 圖表元件
 * 版權所有 © 2021-present 有來開源組織
 *
 * 開源協議：https://opensource.org/licenses/MIT
 * 專案地址：https://gitee.com/youlaiorg/vue3-element-admin
 * 參考：https://echarts.apache.org/handbook/zh/basics/import/#%E6%8C%89%E9%9C%80%E5%BC%95%E5%85%A5-echarts-%E5%9B%BE%E8%A1%A8%E5%92%8C%E7%BB%84%E4%BB%B6
 *
 * 在使用時，請保留此註釋，感謝您對開源的支援！
 -->

<template>
  <div ref="chartRef" :style="{ width, height }"></div>
</template>

<script setup lang="ts">
// 引入 echarts 核心模組，核心模組提供了 echarts 使用必須要的介面。
import * as echarts from "echarts/core";
// 引入柱狀、折線和餅圖常用圖表
import { BarChart, LineChart, PieChart } from "echarts/charts";
// 引入標題，提示框，直角座標系，資料集，內建資料轉換器元件，
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必須的一步
import { CanvasRenderer } from "echarts/renderers";

import { useResizeObserver } from "@vueuse/core";

// 按需註冊元件
echarts.use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
]);

const props = defineProps<{
  options: echarts.EChartsCoreOption;
  width?: string;
  height?: string;
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// 初始化圖表
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    if (props.options) {
      chartInstance.setOption(props.options);
    }
  }
};

// 監聽尺寸變化，自動調整
useResizeObserver(chartRef, () => {
  chartInstance?.resize();
});

// 監聽 options 變化，更新圖表
watch(
  () => props.options,
  (newOptions) => {
    if (chartInstance && newOptions) {
      chartInstance.setOption(newOptions);
    }
  },
  { deep: true }
);

onMounted(() => {
  nextTick(() => initChart());
});

onBeforeUnmount(() => {
  chartInstance?.dispose();
});
</script>
