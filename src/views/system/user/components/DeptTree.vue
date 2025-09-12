<!-- 部門樹 -->
<template>
  <el-card shadow="never">
    <el-input v-model="deptName" placeholder="部門名稱" clearable>
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

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

<script setup lang="ts">
import DeptAPI from "@/api/system/dept-api";
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: undefined,
  },
});

const deptList = ref<OptionType[]>(); // 部門列表
const deptTreeRef = ref(); // 部門樹
const deptName = ref(); // 部門名稱

const emits = defineEmits(["node-click"]);

const deptId = useVModel(props, "modelValue", emits);

watchEffect(
  () => {
    deptTreeRef.value.filter(deptName.value);
  },
  {
    flush: "post", // watchEffect會在DOM掛載或者更新之前就會觸發，此屬性控制在DOM元素更新後執行
  }
);

/**
 * 部門篩選
 */
function handleFilter(value: string, data: any) {
  if (!value) {
    return true;
  }
  return data.label.indexOf(value) !== -1;
}

/** 部門樹節點 Click */
function handleNodeClick(data: { [key: string]: any }) {
  deptId.value = data.value;
  emits("node-click");
}

onBeforeMount(() => {
  DeptAPI.getOptions().then((data) => {
    deptList.value = data;
  });
});
</script>
