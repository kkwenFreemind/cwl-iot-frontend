<template>
  <div v-show="visible">
    <el-card v-bind="cardAttrs">
      <el-form ref="queryFormRef" :model="queryParams" v-bind="formAttrs" :class="isGrid">
        <template v-for="(item, index) in formItems" :key="item.prop">
          <el-form-item
            v-show="isExpand ? true : index < showNumber"
            :label="item?.label"
            :prop="item.prop"
          >
            <!-- Label -->
            <template #label>
              <span class="flex-y-center">
                {{ item?.label || "" }}
                <el-tooltip v-if="item?.tips" v-bind="getTooltipProps(item.tips)">
                  <QuestionFilled class="w-4 h-4 mx-1" />
                </el-tooltip>
                <span v-if="searchConfig.colon" class="ml-0.5">:</span>
              </span>
            </template>

            <el-cascader
              v-if="item.type === 'cascader'"
              v-model.trim="queryParams[item.prop]"
              v-bind="{ style: { width: '100%' }, ...item.attrs }"
              v-on="item.events || {}"
            />
            <component
              :is="componentMap.get(item.type)"
              v-else
              v-model.trim="queryParams[item.prop]"
              v-bind="{ style: { width: '100%' }, ...item.attrs }"
              v-on="item.events || {}"
            >
              <template v-if="item.type === 'select'">
                <template v-for="opt in item.options" :key="opt.value">
                  <el-option :label="opt.label" :value="opt.value" />
                </template>
              </template>
            </component>
          </el-form-item>
        </template>

        <el-form-item :class="{ 'col-[auto/-1] justify-self-end': searchConfig?.grid === 'right' }">
          <el-button icon="search" type="primary" @click="handleQuery">搜尋</el-button>
          <el-button icon="refresh" @click="handleReset">重置</el-button>
          <!-- 展開/收起 -->
          <template v-if="isExpandable && formItems.length > showNumber">
            <el-link class="ml-3" type="primary" underline="never" @click="isExpand = !isExpand">
              {{ isExpand ? "收起" : "展開" }}
              <component :is="isExpand ? ArrowUp : ArrowDown" class="w-4 h-4 ml-2" />
            </el-link>
          </template>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { IObject, IForm, ISearchConfig, ISearchComponent } from "./types";
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";
import InputTag from "@/components/InputTag/index.vue";

// 定義接收的屬性
const props = defineProps<{ searchConfig: ISearchConfig }>();
// 自定義事件
const emit = defineEmits<{
  queryClick: [queryParams: IObject];
  resetClick: [queryParams: IObject];
}>();
// 元件對映表
const componentMap = new Map<ISearchComponent, any>([
  // @ts-ignore
  ["input", markRaw(ElInput)], // @ts-ignore
  ["select", markRaw(ElSelect)], // @ts-ignore
  ["cascader", markRaw(ElCascader)], // @ts-ignore
  ["input-number", markRaw(ElInputNumber)], // @ts-ignore
  ["date-picker", markRaw(ElDatePicker)], // @ts-ignore
  ["time-picker", markRaw(ElTimePicker)], // @ts-ignore
  ["time-select", markRaw(ElTimeSelect)], // @ts-ignore
  ["tree-select", markRaw(ElTreeSelect)], // @ts-ignore
  ["input-tag", markRaw(ElInputTag)], // @ts-ignore
  ["custom-tag", markRaw(InputTag)],
]);

// 儲存表單例項
const queryFormRef = ref<FormInstance>();
// 儲存查詢引數
const queryParams = reactive<IObject>({});
// 是否顯示
const visible = ref(true);
// 響應式的formItems
const formItems = reactive(props.searchConfig?.formItems ?? []);
// 是否可展開/收縮
const isExpandable = ref(props.searchConfig?.isExpandable ?? true);
// 是否已展開
const isExpand = ref(false);
// 表單項展示數量，若可展開，超出展示數量的表單項隱藏
const showNumber = computed(() =>
  isExpandable.value ? (props.searchConfig?.showNumber ?? 3) : formItems.length
);
// 卡片元件自定義屬性（陰影、自定義邊距樣式等）
const cardAttrs = computed<IObject>(() => {
  return { shadow: "never", style: { "margin-bottom": "12px" }, ...props.searchConfig?.cardAttrs };
});
// 表單元件自定義屬性（label位置、寬度、對齊方式等）
const formAttrs = computed<IForm>(() => {
  return { inline: true, ...props.searchConfig?.form };
});
// 是否使用自適應網格佈局
const isGrid = computed(() =>
  props.searchConfig?.grid
    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-5"
    : "flex flex-wrap gap-x-8 gap-y-4"
);

// 獲取tooltip提示框屬性
const getTooltipProps = (tips: string | IObject) => {
  return typeof tips === "string" ? { content: tips } : tips;
};
// 查詢/重置操作
const handleQuery = () => emit("queryClick", queryParams);
const handleReset = () => {
  queryFormRef.value?.resetFields();
  emit("resetClick", queryParams);
};

onMounted(() => {
  formItems.forEach((item) => {
    if (item?.initFn) {
      item.initFn(item);
    }
    if (["input-tag", "custom-tag", "cascader"].includes(item?.type ?? "")) {
      queryParams[item.prop] = Array.isArray(item.initialValue) ? item.initialValue : [];
    } else if (item.type === "input-number") {
      queryParams[item.prop] = item.initialValue ?? null;
    } else {
      queryParams[item.prop] = item.initialValue ?? "";
    }
  });
});
// 暴露的屬性和方法
defineExpose({
  // 獲取分頁資料
  getQueryParams: () => queryParams,
  // 顯示/隱藏 SearchForm
  toggleVisible: () => (visible.value = !visible.value),
});
</script>

<style lang="scss" scoped>
:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
.el-form-item {
  margin-right: 0;
  margin-bottom: 0;
}
</style>
