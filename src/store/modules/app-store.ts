import { defaultSettings } from "@/settings";

// 匯入 Element Plus 語言包
import zhTw from "element-plus/es/locale/lang/zh-tw";
import en from "element-plus/es/locale/lang/en";
import { store } from "@/store";
import { DeviceEnum } from "@/enums/settings/device.enum";
import { SidebarStatus } from "@/enums/settings/layout.enum";

export const useAppStore = defineStore("app", () => {
  // 裝置型別
  const device = useStorage("device", DeviceEnum.DESKTOP);
  // 佈局大小
  const size = useStorage("size", defaultSettings.size);
  // 語言
  const language = useStorage("language", defaultSettings.language);
  // 側邊欄狀態
  const sidebarStatus = useStorage("sidebarStatus", SidebarStatus.CLOSED);
  const sidebar = reactive({
    opened: sidebarStatus.value === SidebarStatus.OPENED,
    withoutAnimation: false,
  });

  // 頂部選單啟用路徑
  const activeTopMenuPath = useStorage("activeTopMenuPath", "");

  /**
   * 根據語言標識讀取對應的語言包
   */
  const locale = computed(() => {
    if (language?.value == "en") {
      return en;
    } else {
      return zhTw;
    }
  });

  // 切換側邊欄
  function toggleSidebar() {
    sidebar.opened = !sidebar.opened;
    sidebarStatus.value = sidebar.opened ? SidebarStatus.OPENED : SidebarStatus.CLOSED;
  }

  // 關閉側邊欄
  function closeSideBar() {
    sidebar.opened = false;
    sidebarStatus.value = SidebarStatus.CLOSED;
  }

  // 開啟側邊欄
  function openSideBar() {
    sidebar.opened = true;
    sidebarStatus.value = SidebarStatus.OPENED;
  }

  // 切換裝置
  function toggleDevice(val: string) {
    device.value = val;
  }

  /**
   * 改變佈局大小
   *
   * @param val 佈局大小 default | small | large
   */
  function changeSize(val: string) {
    size.value = val;
  }
  /**
   * 切換語言
   *
   * @param val
   */
  function changeLanguage(val: string) {
    language.value = val;
  }
  /**
   * 混合模式頂部切換
   */
  function activeTopMenu(val: string) {
    activeTopMenuPath.value = val;
  }
  return {
    device,
    sidebar,
    language,
    locale,
    size,
    activeTopMenu,
    toggleDevice,
    changeSize,
    changeLanguage,
    toggleSidebar,
    closeSideBar,
    openSideBar,
    activeTopMenuPath,
  };
});

/**
 * 用於在元件外部（如在Pinia Store 中）使用 Pinia 提供的 store 例項。
 * 官方文件解釋瞭如何在元件外部使用 Pinia Store：
 * https://pinia.vuejs.org/core-concepts/outside-component-usage.html#using-a-store-outside-of-a-component
 */
export function useAppStoreHook() {
  return useAppStore(store);
}
