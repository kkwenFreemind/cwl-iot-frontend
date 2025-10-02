/**
 * Application Store Module
 * ========================
 *
 * Central store for managing global application state including:
 * - User interface settings (theme, layout, device type)
 * - Internationalization (language and locale management)
 * - Sidebar state and navigation
 * - Layout configuration and responsiveness
 *
 * This store uses Pinia for state management with persistent storage
 * via VueUse's useStorage composable for maintaining user preferences
 * across browser sessions.
 *
 * Features:
 * - Persistent device detection (desktop/mobile)
 * - Dynamic sidebar state management
 * - Multi-language support with Element Plus integration
 * - Layout size customization
 * - Top menu active path tracking for mixed layout mode
 *
 * @author Chang Xiu-Wen, AI-Enhanced
 * @since 2025-10-02
 * @version 1.0.0
 */

import { defaultSettings } from "@/settings";

// Import Element Plus locale packages
import zhTw from "element-plus/es/locale/lang/zh-tw";
import en from "element-plus/es/locale/lang/en";
import { store } from "@/store";
import { DeviceEnum } from "@/enums/settings/device.enum";
import { SidebarStatus } from "@/enums/settings/layout.enum";

/**
 * Application Store Definition
 * Uses Pinia's composition API style for better TypeScript support
 */
export const useAppStore = defineStore("app", () => {
  // ========================================
  // State Management with Persistent Storage
  // ========================================

  /** Device type detection (desktop/mobile) */
  const device = useStorage("device", DeviceEnum.DESKTOP);

  /** Layout size configuration (default/small/large) */
  const size = useStorage("size", defaultSettings.size);

  /** Current application language (en/zh-tw) */
  const language = useStorage("language", defaultSettings.language);

  /** Sidebar open/closed status */
  const sidebarStatus = useStorage("sidebarStatus", SidebarStatus.CLOSED);

  /** Reactive sidebar state object */
  const sidebar = reactive({
    opened: sidebarStatus.value === SidebarStatus.OPENED,
    withoutAnimation: false,
  });

  /** Active top menu path for mixed layout mode */
  const activeTopMenuPath = useStorage("activeTopMenuPath", "");

  // ========================================
  // Computed Properties
  // ========================================

  /**
   * Element Plus locale configuration based on current language
   * @returns Element Plus locale object for UI components
   */
  const locale = computed(() => {
    if (language?.value == "en") {
      return en;
    } else {
      return zhTw;
    }
  });

  // ========================================
  // Sidebar Management Actions
  // ========================================

  /**
   * Toggle sidebar open/closed state
   * Updates both reactive state and persistent storage
   */
  function toggleSidebar() {
    sidebar.opened = !sidebar.opened;
    sidebarStatus.value = sidebar.opened ? SidebarStatus.OPENED : SidebarStatus.CLOSED;
  }

  /**
   * Close sidebar and update persistent state
   */
  function closeSideBar() {
    sidebar.opened = false;
    sidebarStatus.value = SidebarStatus.CLOSED;
  }

  /**
   * Open sidebar and update persistent state
   */
  function openSideBar() {
    sidebar.opened = true;
    sidebarStatus.value = SidebarStatus.OPENED;
  }

  // ========================================
  // Device and Layout Management
  // ========================================

  /**
   * Update device type (desktop/mobile)
   * @param val - Device type string
   */
  function toggleDevice(val: string) {
    device.value = val;
  }

  /**
   * Change layout size configuration
   * @param val - Layout size: 'default' | 'small' | 'large'
   */
  function changeSize(val: string) {
    size.value = val;
  }

  /**
   * Switch application language
   * @param val - Language code: 'en' | 'zh-tw'
   */
  function changeLanguage(val: string) {
    language.value = val;
  }

  /**
   * Set active top menu path for mixed layout mode
   * @param val - Menu path string
   */
  function activeTopMenu(val: string) {
    activeTopMenuPath.value = val;
  }
  // ========================================
  // Store API Export
  // ========================================

  return {
    // State
    device,
    sidebar,
    language,
    locale,
    size,
    activeTopMenuPath,

    // Actions
    activeTopMenu,
    toggleDevice,
    changeSize,
    changeLanguage,
    toggleSidebar,
    closeSideBar,
    openSideBar,
  };
});

/**
 * Hook for using app store outside of Vue components
 *
 * This hook provides access to the app store instance when used outside
 * of Vue components (e.g., in other Pinia stores, utility functions, etc.).
 *
 * According to Pinia documentation, when using stores outside of components,
 * you need to pass the pinia instance to the store function.
 *
 * @see {@link https://pinia.vuejs.org/core-concepts/outside-component-usage.html}
 * @returns App store instance with injected pinia context
 */
export function useAppStoreHook() {
  return useAppStore(store);
}
