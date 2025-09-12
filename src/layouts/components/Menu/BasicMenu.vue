<!-- 選單元件 -->
<template>
  <el-menu
    ref="menuRef"
    :default-active="activeMenuPath"
    :collapse="!appStore.sidebar.opened"
    :background-color="menuThemeProps.backgroundColor"
    :text-color="menuThemeProps.textColor"
    :active-text-color="menuThemeProps.activeTextColor"
    :popper-effect="theme"
    :unique-opened="false"
    :collapse-transition="false"
    :mode="menuMode"
    @open="onMenuOpen"
    @close="onMenuClose"
  >
    <!-- 選單項 -->
    <MenuItem
      v-for="route in data"
      :key="route.path"
      :item="route"
      :base-path="resolveFullPath(route.path)"
    />
  </el-menu>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import path from "path-browserify";
import type { MenuInstance } from "element-plus";
import type { RouteRecordRaw } from "vue-router";
import { SidebarColor } from "@/enums/settings/theme.enum";
import { useSettingsStore, useAppStore } from "@/store";
import { isExternal } from "@/utils/index";
import MenuItem from "./components/MenuItem.vue";
import variables from "@/styles/variables.module.scss";

const props = defineProps({
  data: {
    type: Array as PropType<RouteRecordRaw[]>,
    default: () => [],
  },
  basePath: {
    type: String,
    required: true,
    example: "/system",
  },
  menuMode: {
    type: String as PropType<"vertical" | "horizontal">,
    default: "vertical",
    validator: (value: string) => ["vertical", "horizontal"].includes(value),
  },
});

const menuRef = ref<MenuInstance>();
const settingsStore = useSettingsStore();
const appStore = useAppStore();
const currentRoute = useRoute();

// 儲存已展開的選單項索引
const expandedMenuIndexes = ref<string[]>([]);

// 獲取主題
const theme = computed(() => settingsStore.theme);

// 獲取淺色主題下的側邊欄配色方案
const sidebarColorScheme = computed(() => settingsStore.sidebarColorScheme);

// 選單主題屬性
const menuThemeProps = computed(() => {
  const isDarkOrClassicBlue =
    theme.value === "dark" || sidebarColorScheme.value === SidebarColor.CLASSIC_BLUE;

  return {
    backgroundColor: isDarkOrClassicBlue ? variables["menu-background"] : undefined,
    textColor: isDarkOrClassicBlue ? variables["menu-text"] : undefined,
    activeTextColor: isDarkOrClassicBlue ? variables["menu-active-text"] : undefined,
  };
});

// 計算當前啟用的選單項
const activeMenuPath = computed((): string => {
  const { meta, path } = currentRoute;

  // 如果路由meta中設定了activeMenu，則使用它（用於處理一些特殊情況，如詳情頁）
  if (meta?.activeMenu && typeof meta.activeMenu === "string") {
    return meta.activeMenu;
  }

  // 否則使用當前路由路徑
  return path;
});

/**
 * 獲取完整路徑
 *
 * @param routePath 當前路由的相對路徑  /user
 * @returns 完整的絕對路徑 D://vue3-element-admin/system/user
 */
function resolveFullPath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }

  // 如果 basePath 為空（頂部佈局），直接返回 routePath
  if (!props.basePath || props.basePath === "") {
    return routePath;
  }

  // 解析路徑，生成完整的絕對路徑
  return path.resolve(props.basePath, routePath);
}

/**
 * 開啟選單
 *
 * @param index 當前展開的選單項索引
 */
const onMenuOpen = (index: string) => {
  expandedMenuIndexes.value.push(index);
};

/**
 * 關閉選單
 *
 * @param index 當前收起的選單項索引
 */
const onMenuClose = (index: string) => {
  expandedMenuIndexes.value = expandedMenuIndexes.value.filter((item) => item !== index);
};

/**
 * 監聽展開的選單項變化，更新父選單樣式
 */
watch(
  () => expandedMenuIndexes.value,
  () => {
    updateParentMenuStyles();
  }
);

/**
 * 監聽選單模式變化：當選單模式切換為水平模式時，關閉所有展開的選單項，
 * 避免在水平模式下選單項顯示錯位。
 */
watch(
  () => props.menuMode,
  (newMode) => {
    if (newMode === "horizontal" && menuRef.value) {
      expandedMenuIndexes.value.forEach((item) => menuRef.value!.close(item));
    }
  }
);

/**
 * 監聽啟用選單變化，為包含啟用子選單的父選單新增樣式類
 */
watch(
  () => activeMenuPath.value,
  () => {
    nextTick(() => {
      updateParentMenuStyles();
    });
  },
  { immediate: true }
);

/**
 * 監聽路由變化，確保選單能隨TagsView切換而正確啟用
 */
watch(
  () => currentRoute.path,
  () => {
    nextTick(() => {
      updateParentMenuStyles();
    });
  }
);

/**
 * 更新父選單樣式 - 為包含啟用子選單的父選單新增 has-active-child 類
 */
function updateParentMenuStyles() {
  if (!menuRef.value?.$el) return;

  nextTick(() => {
    try {
      const menuEl = menuRef.value?.$el as HTMLElement;
      if (!menuEl) return;

      // 移除所有現有的 has-active-child 類
      const allSubMenus = menuEl.querySelectorAll(".el-sub-menu");
      allSubMenus.forEach((subMenu) => {
        subMenu.classList.remove("has-active-child");
      });

      // 查詢當前啟用的選單項
      const activeMenuItem = menuEl.querySelector(".el-menu-item.is-active");

      if (activeMenuItem) {
        // 向上查詢父級 el-sub-menu 元素
        let parent = activeMenuItem.parentElement;
        while (parent && parent !== menuEl) {
          if (parent.classList.contains("el-sub-menu")) {
            parent.classList.add("has-active-child");
          }
          parent = parent.parentElement;
        }
      } else {
        // 水平模式下可能需要特殊處理
        if (props.menuMode === "horizontal") {
          // 對於水平選單，使用路徑匹配來找到父選單
          const currentPath = activeMenuPath.value;

          // 查詢所有父選單項，檢查哪個包含當前路徑
          allSubMenus.forEach((subMenu) => {
            const subMenuEl = subMenu as HTMLElement;
            const subMenuPath =
              subMenuEl.getAttribute("data-path") ||
              subMenuEl.querySelector(".el-sub-menu__title")?.getAttribute("data-path");

            // 如果找到包含當前路徑的父選單，則新增啟用類
            if (subMenuPath && currentPath.startsWith(subMenuPath)) {
              subMenuEl.classList.add("has-active-child");
            }
          });
        }
      }
    } catch (error) {
      console.error("Error updating parent menu styles:", error);
    }
  });
}

/**
 * 元件掛載後立即更新父選單樣式
 */
onMounted(() => {
  // 確保在元件掛載後更新樣式，不依賴於非同步操作
  updateParentMenuStyles();
});
</script>
