<template>
  <BaseLayout>
    <!-- 頂部選單欄 -->
    <div class="layout__header">
      <div class="layout__header-content">
        <!-- Logo區域 -->
        <div v-if="isShowLogo" class="layout__header-logo">
          <AppLogo :collapse="isLogoCollapsed" />
        </div>

        <!-- 頂部選單區域 -->
        <div class="layout__header-menu">
          <MixTopMenu />
        </div>

        <!-- 右側操作區域 -->
        <div class="layout__header-actions">
          <NavbarActions />
        </div>
      </div>
    </div>

    <!-- 主內容區容器 -->
    <div class="layout__container">
      <!-- 左側選單欄 -->
      <div class="layout__sidebar--left" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
        <el-scrollbar>
          <el-menu
            :default-active="activeLeftMenuPath"
            :collapse="!isSidebarOpen"
            :collapse-transition="false"
            :unique-opened="false"
            :background-color="variables['menu-background']"
            :text-color="variables['menu-text']"
            :active-text-color="variables['menu-active-text']"
          >
            <MenuItem
              v-for="item in sideMenuRoutes"
              :key="item.path"
              :item="item"
              :base-path="resolvePath(item.path)"
            />
          </el-menu>
        </el-scrollbar>
        <!-- 側邊欄切換按鈕 -->
        <div class="layout__sidebar-toggle">
          <Hamburger :is-active="isSidebarOpen" @toggle-click="toggleSidebar" />
        </div>
      </div>

      <!-- 主內容區 -->
      <div :class="{ hasTagsView: isShowTagsView }" class="layout__main">
        <TagsView v-if="isShowTagsView" />
        <AppMain />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useWindowSize } from "@vueuse/core";
import { useLayout } from "../composables/useLayout";
import { useLayoutMenu } from "../composables/useLayoutMenu";
import BaseLayout from "./BaseLayout.vue";
import AppLogo from "../components/AppLogo/index.vue";
import MixTopMenu from "../components/Menu/MixTopMenu.vue";
import NavbarActions from "../components/NavBar/components/NavbarActions.vue";
import TagsView from "../components/TagsView/index.vue";
import AppMain from "../components/AppMain/index.vue";
import MenuItem from "../components/Menu/components/MenuItem.vue";
import Hamburger from "@/components/Hamburger/index.vue";
import variables from "@/styles/variables.module.scss";
import { isExternal } from "@/utils/index";
import { computed, watch } from "vue";
import { useAppStore, usePermissionStore } from "@/store";

const route = useRoute();

// 佈局相關引數
const { isShowTagsView, isShowLogo, isSidebarOpen, toggleSidebar } = useLayout();

// 選單相關
const { sideMenuRoutes, activeTopMenuPath } = useLayoutMenu();

// 響應式視窗尺寸
const { width } = useWindowSize();

// 只有在小屏裝置（移動裝置）時才摺疊Logo（只顯示圖示，隱藏文字）
const isLogoCollapsed = computed(() => width.value < 768);

// 當前啟用的選單
const activeLeftMenuPath = computed(() => {
  const { meta, path } = route;
  // 如果設定了activeMenu，則使用
  if (meta?.activeMenu && typeof meta.activeMenu === "string") {
    return meta.activeMenu;
  }
  return path;
});

/**
 * 解析路徑 - 混合模式下，左側選單是從頂級選單下的子選單開始的
 * 所以需要拼接頂級選單路徑
 */
function resolvePath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }

  if (routePath.startsWith("/")) {
    return activeTopMenuPath.value + routePath;
  }
  return `${activeTopMenuPath.value}/${routePath}`;
}

// 監聽路由變化，確保左側選單能隨TagsView切換而正確啟用
watch(
  () => route.path,
  (newPath) => {
    console.log("📍 Route changed in MixLayout:", newPath);

    // 獲取頂級路徑
    const topMenuPath =
      newPath.split("/").filter(Boolean).length > 1 ? newPath.match(/^\/[^/]+/)?.[0] || "/" : "/";

    // 如果當前路徑屬於當前啟用的頂部選單
    if (newPath.startsWith(activeTopMenuPath.value)) {
      console.log("📍 Route is under active top menu, ensuring menu item is activated");
    }
    // 如果路徑改變了頂級選單，確保頂部選單和左側選單都更新
    else if (topMenuPath !== activeTopMenuPath.value) {
      console.log(
        "📍 Top menu changed, updating active menu from:",
        activeTopMenuPath.value,
        "to:",
        topMenuPath
      );

      // 主動更新頂部選單和左側選單
      const appStore = useAppStore();
      const permissionStore = usePermissionStore();

      appStore.activeTopMenu(topMenuPath);
      permissionStore.setMixLayoutSideMenus(topMenuPath);
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.layout {
  &__header {
    position: sticky;
    top: 0;
    z-index: 999;
    width: 100%;
    height: $navbar-height;
    background-color: var(--menu-background);
    border-bottom: 1px solid var(--el-border-color-lighter);

    &-content {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0;
    }

    &-logo {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    &-menu {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0;
      height: 100%;
      overflow: hidden;

      :deep(.el-menu) {
        height: 100%;
        background-color: transparent;
        border: none;
      }

      :deep(.el-menu--horizontal) {
        display: flex;
        align-items: center;
        height: 100%;

        .el-menu-item {
          height: 100%;
          line-height: $navbar-height;
          border-bottom: none;

          &.is-active {
            background-color: rgba(255, 255, 255, 0.12);
            border-bottom: 2px solid var(--el-color-primary);
          }
        }
      }
    }

    &-actions {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      height: 100%;
      padding: 0 16px;
    }
  }

  &__container {
    display: flex;
    height: calc(100vh - $navbar-height);
    padding-top: 0;

    .layout__sidebar--left {
      position: relative;
      width: $sidebar-width;
      height: 100%;
      background-color: var(--menu-background);
      transition: width 0.28s;

      &.layout__sidebar--collapsed {
        width: $sidebar-width-collapsed !important;
      }

      :deep(.el-scrollbar) {
        height: calc(100vh - $navbar-height - 50px);
      }

      :deep(.el-menu) {
        height: 100%;
        border: none;
      }

      .layout__sidebar-toggle {
        position: absolute;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 50px;
        line-height: 50px;
        background-color: var(--menu-background);
        box-shadow: 0 0 6px -2px var(--el-color-primary);
      }
    }

    .layout__main {
      flex: 1;
      min-width: 0;
      height: 100%;
      margin-left: 0;
      overflow-y: auto;
    }
  }
}

/* 移動端樣式 */
:deep(.mobile) {
  .layout__container {
    .layout__sidebar--left {
      position: fixed;
      top: $navbar-height;
      bottom: 0;
      left: 0;
      z-index: 1000;
      transition: transform 0.28s;
    }
  }

  &.hideSidebar {
    .layout__sidebar--left {
      width: $sidebar-width !important;
      transform: translateX(-$sidebar-width);
    }
  }
}

:deep(.hasTagsView) {
  .app-main {
    height: calc(100vh - $navbar-height - $tags-view-height) !important;
  }
}
</style>
