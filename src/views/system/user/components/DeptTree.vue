<!--

  @author youlaitech
  @since 2024-08-27 10:31
 
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025/09/12
  
  Department/Community Tree Component
  部門/社區樹狀組件
  
  @description A filterable tree component for selecting departments/communities
  @features
  - Hierarchical department/community structure display
  - Real-time search filtering
  - Node selection with v-model support
  - Auto-expand all nodes on load
  - Event emission for parent component communication

-->
<template>
  <!-- Department Tree Card Container / 部門樹卡片容器 -->
  <el-card shadow="never">
    <!-- Search Input with Icon / 帶圖示的搜尋輸入框 -->
    <el-input
      v-model="deptName"
      :placeholder="$t('user.userForm.departmentSearchPlaceholder')"
      clearable
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <!-- Hierarchical Department Tree / 階層式部門樹 -->
    <el-tree
      ref="deptTreeRef"
      class="mt-2"
      :data="deptList"
      :props="{ children: 'children', label: 'label', disabled: '' }"
      :expand-on-click-node="false"
      :filter-node-method="handleFilter"
      default-expand-all
      @node-click="handleNodeClick"
    />
  </el-card>
</template>

<!--
/**
 * Department Tree Component Script
 * 部門樹組件腳本
 * 
 * @description Manages department tree state and interactions
 */
-->

<script setup lang="ts">
// API Import / API 匯入
import DeptAPI from "@/api/system/dept-api";

/**
 * Component Props Definition
 * 組件屬性定義
 */
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: undefined,
  },
});

// Component State / 組件狀態
const deptList = ref<OptionType[]>(); // Department/Community list data / 部門/社區列表資料
const deptTreeRef = ref(); // Tree component reference / 樹組件引用
const deptName = ref(); // Search filter value / 搜尋過濾值

/**
 * Component Events Definition
 * 組件事件定義
 */
const emits = defineEmits(["node-click"]);

/**
 * Two-way binding for selected department ID
 * 選中部門ID的雙向綁定
 */
const deptId = useVModel(props, "modelValue", emits);

/**
 * Watch for search input changes and apply filter
 * 監聽搜尋輸入變化並應用過濾器
 */
watchEffect(
  () => {
    deptTreeRef.value.filter(deptName.value);
  },
  {
    flush: "post", // Execute after DOM update / 在DOM更新後執行
  }
);

/**
 * Filter tree nodes based on search input
 * 根據搜尋輸入過濾樹節點
 *
 * @param value - Search string from input / 來自輸入框的搜尋字串
 * @param data - Tree node data object / 樹節點資料物件
 * @returns Boolean indicating if node should be visible / 指示節點是否應該可見的布林值
 */
function handleFilter(value: string, data: any) {
  if (!value) {
    return true; // Show all nodes when search is empty / 搜尋為空時顯示所有節點
  }
  return data.label.indexOf(value) !== -1; // Match nodes containing search term / 匹配包含搜尋詞的節點
}

/**
 * Handle tree node click event
 * 處理樹節點點擊事件
 *
 * @param data - Clicked node data object / 被點擊節點的資料物件
 */
function handleNodeClick(data: { [key: string]: any }) {
  deptId.value = data.value; // Update selected department ID / 更新選中的部門ID
  emits("node-click"); // Emit event to parent component / 向父組件發出事件
}

/**
 * Component Lifecycle: Load department data before mount
 * 組件生命週期：掛載前載入部門資料
 */
onBeforeMount(() => {
  DeptAPI.getOptions().then((data) => {
    deptList.value = data;
  });
});
</script>
