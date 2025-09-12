import type { RouteRecordRaw } from "vue-router";
import NProgress from "@/utils/nprogress";
import router from "@/router";
import { usePermissionStore, useUserStore } from "@/store";
import { ROLE_ROOT } from "@/constants";

export function setupPermission() {
  const whiteList = ["/login"]; // 无需登录的页面

  router.beforeEach(async (to, from, next) => {
    NProgress.start();

    console.log(`🚦 [Router Guard] Navigating from '${from.path}' to '${to.path}'`);

    try {
      // 使用 store 暴露的登录态，便于后续扩展（如基于过期时间等）
      const isLoggedIn = useUserStore().isLoggedIn();
      console.log(`🔐 [Router Guard] User logged in: ${isLoggedIn}`);

      // 未登录处理
      if (!isLoggedIn) {
        console.log(`🚫 [Router Guard] User not logged in, checking whitelist...`);
        if (whiteList.includes(to.path)) {
          console.log(`✅ [Router Guard] Path '${to.path}' is in whitelist, allowing access`);
          next();
        } else {
          console.log(`🔄 [Router Guard] Redirecting to login with redirect=${to.fullPath}`);
          next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
          NProgress.done();
        }
        return;
      }

      // 已登录且访问登录页，重定向到首页
      if (to.path === "/login") {
        console.log(`🏠 [Router Guard] Already logged in, redirecting to home`);
        next({ path: "/" });
        return;
      }

      // 已登录用户的正常访问
      const permissionStore = usePermissionStore();
      const userStore = useUserStore();

      console.log(
        `📋 [Router Guard] Dynamic routes generated: ${permissionStore.isDynamicRoutesGenerated}`
      );

      // 路由未生成则生成
      if (!permissionStore.isDynamicRoutesGenerated) {
        console.log(`🔄 [Router Guard] Generating dynamic routes...`);

        if (!userStore.userInfo?.roles?.length) {
          console.log(`👤 [Router Guard] Fetching user info...`);
          await userStore.getUserInfo();
          console.log(`✅ [Router Guard] User info loaded:`, {
            username: userStore.userInfo.username,
            roles: userStore.userInfo.roles,
          });
        }

        console.log(`🛠️ [Router Guard] Generating routes...`);
        const dynamicRoutes = await permissionStore.generateRoutes();
        console.log(`✅ [Router Guard] Generated ${dynamicRoutes.length} dynamic routes`);

        dynamicRoutes.forEach((route: RouteRecordRaw) => {
          console.log(`➕ [Router Guard] Adding route: ${route.path}`);
          router.addRoute(route);
        });

        console.log(`🔄 [Router Guard] Re-navigating to '${to.path}' with replace=true`);
        next({ ...to, replace: true });
        return;
      }

      // 检查路由是否存在
      console.log(
        `🔍 [Router Guard] Checking if route exists, matched routes: ${to.matched.length}`
      );
      if (to.matched.length === 0) {
        console.log(`❌ [Router Guard] Route not found, redirecting to 404`);
        console.log(
          `📊 [Router Guard] Current routes:`,
          router.getRoutes().map((r) => r.path)
        );
        next("/404");
        return;
      }

      // 设置页面标题
      const title = (to.params.title as string) || (to.query.title as string);
      if (title) {
        to.meta.title = title;
        console.log(`📝 [Router Guard] Set page title: ${title}`);
      }

      console.log(`✅ [Router Guard] Navigation approved to '${to.path}'`);
      next();
    } catch (error) {
      console.error("❌ [Router Guard] Route guard error:", error);
      // 出错时清理状态并重定向到登录页
      try {
        console.log(`🧹 [Router Guard] Resetting user state...`);
        await useUserStore().resetAllState();
        console.log(`✅ [Router Guard] User state reset completed`);
      } catch (resetError) {
        console.error("❌ [Router Guard] Failed to reset user state:", resetError);
      }
      next("/login");
      NProgress.done();
    }
  });

  router.afterEach(() => {
    NProgress.done();
  });
}

/** 判断是否有权限 */
export function hasAuth(value: string | string[], type: "button" | "role" = "button") {
  const { roles, perms } = useUserStore().userInfo;

  // 超级管理员 拥有所有权限
  if (type === "button" && roles.includes(ROLE_ROOT)) {
    return true;
  }

  const auths = type === "button" ? perms : roles;
  return typeof value === "string"
    ? auths.includes(value)
    : value.some((perm) => auths.includes(perm));
}
