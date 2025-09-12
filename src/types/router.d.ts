import "vue-router";

declare module "vue-router" {
  // https://router.vuejs.org/zh/guide/advanced/meta.html#typescript
  // 可以透過擴充套件 RouteMeta 介面來輸入 meta 欄位
  interface RouteMeta {
    /**
     * 選單名稱
     * @example 'Dashboard'
     */
    title?: string;

    /**
     * 選單圖示
     * @example 'el-icon-edit'
     */
    icon?: string;

    /**
     * 是否隱藏選單
     * true 隱藏, false 顯示
     * @default false
     */
    hidden?: boolean;

    /**
     * 始終顯示父級選單，即使只有一個子選單
     * true 顯示父級選單, false 隱藏父級選單，顯示唯一子節點
     * @default false
     */
    alwaysShow?: boolean;

    /**
     * 是否固定在頁簽上
     * true 固定, false 不固定
     * @default false
     */
    affix?: boolean;

    /**
     * 是否快取頁面
     * true 快取, false 不快取
     * @default false
     */
    keepAlive?: boolean;

    /**
     * 是否在麵包屑導航中隱藏
     * true 隱藏, false 顯示
     * @default false
     */
    breadcrumb?: boolean;
  }
}
