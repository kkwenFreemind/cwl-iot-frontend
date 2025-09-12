import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import router from "@/router";

import MenuAPI, { type RouteVO } from "@/api/system/menu-api";
const modules = import.meta.glob("../../views/**/**.vue");
const Layout = () => import("@/layouts/index.vue");

export const usePermissionStore = defineStore("permission", () => {
  // 所有路由（靜態路由 + 動態路由）
  const routes = ref<RouteRecordRaw[]>([]);
  // 混合佈局的左側選單路由
  const mixLayoutSideMenus = ref<RouteRecordRaw[]>([]);
  // 動態路由是否已生成
  const isDynamicRoutesGenerated = ref(false);

  const allCacheRoutes = ref<string[][]>([]);

  /**
   * 生成動態路由
   */
  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    try {
      const data = await MenuAPI.getRoutes(); // 獲取當前登入人擁有的選單路由
      const dynamicRoutes = parseDynamicRoutes(data);

      routes.value = [...constantRoutes, ...dynamicRoutes];

      setAllCacheRoutes(routes.value);
      isDynamicRoutesGenerated.value = true;

      return dynamicRoutes;
    } catch (error) {
      console.error("❌ Failed to generate routes:", error);
      isDynamicRoutesGenerated.value = false;
      throw error;
    }
  }

  /**
   * 設定混合佈局的左側選單
   */
  const setMixLayoutSideMenus = (parentPath: string) => {
    const parentMenu = routes.value.find((item) => item.path === parentPath);
    mixLayoutSideMenus.value = parentMenu?.children || [];
  };

  /**
   * 重置路由狀態
   */
  const resetRouter = () => {
    // 移除動態路由
    const constantRouteNames = new Set(constantRoutes.map((route) => route.name).filter(Boolean));
    routes.value.forEach((route) => {
      if (route.name && !constantRouteNames.has(route.name)) {
        router.removeRoute(route.name);
      }
    });

    // 重置狀態
    routes.value = [...constantRoutes];
    mixLayoutSideMenus.value = [];
    isDynamicRoutesGenerated.value = false;
  };

  /**
   * 獲取所有的快取路由
   * @param userRoutes 使用者路由配置
   */
  const setAllCacheRoutes = (userRoutes: RouteRecordRaw[]) => {
    if (!userRoutes?.length) {
      allCacheRoutes.value = [];

      return;
    }

    const result: string[][] = [];

    userRoutes.forEach((route) => {
      if (route.children?.length) {
        traverseRoutes(route.children, [], result);
      }
    });

    allCacheRoutes.value = result;
  };

  return {
    routes,
    mixLayoutSideMenus,
    isDynamicRoutesGenerated,
    allCacheRoutes,
    generateRoutes,
    setMixLayoutSideMenus,
    resetRouter,
  };
});

/**
 * 解析後端返回的路由資料並轉換為 Vue Router 相容的路由配置
 *
 * @param rawRoutes 後端返回的原始路由資料
 * @returns 解析後的路由集合
 */
const parseDynamicRoutes = (rawRoutes: RouteVO[]): RouteRecordRaw[] => {
  const parsedRoutes: RouteRecordRaw[] = [];

  rawRoutes.forEach((route) => {
    // Note: demo routes removed from project; no special filtering required

    const normalizedRoute = { ...route } as RouteRecordRaw;

    // 處理元件路徑
    normalizedRoute.component =
      normalizedRoute.component?.toString() === "Layout"
        ? Layout
        : modules[`../../views/${normalizedRoute.component}.vue`] ||
          modules["../../views/error-page/404.vue"];

    // 遞迴解析子路由，同時過濾掉demo相關的子路由
    if (normalizedRoute.children) {
      normalizedRoute.children = parseDynamicRoutes(route.children);
    }

    parsedRoutes.push(normalizedRoute);
  });

  return parsedRoutes;
};

/**
 * 遍歷路由樹收集快取路由
 * @param nodes 路由節點
 * @param path 當前路徑
 * @param result 結果陣列
 */
const traverseRoutes = (nodes: RouteRecordRaw[], path: string[], result: string[][]) => {
  nodes.forEach((node) => {
    const newPath: string[] = node.name ? [...path, String(node.name)] : [...path];

    // 葉子節點且需要快取
    if (!node.children?.length && node.meta?.keepAlive) {
      result.push(newPath);
    }

    // 遞迴處理子節點
    if (node.children?.length) {
      traverseRoutes(node.children, newPath, result);
    }
  });
};

/**
 * 匯出此hook函式用於在非元件環境(如其他store、工具函式等)中獲取許可權store例項
 *
 * 在元件中可直接使用usePermissionStore()，但在元件外部需要傳入store例項
 * 此函式簡化了這個過程，避免每次都手動傳入store引數
 */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
