import { defaultSettings } from "@/settings";
import { SidebarColor, ThemeMode } from "@/enums/settings/theme.enum";
import type { LayoutMode } from "@/enums/settings/layout.enum";
import { applyTheme, generateThemeColors, toggleDarkMode, toggleSidebarColor } from "@/utils/theme";
import { SETTINGS_KEYS } from "@/constants";

// 🎯 設定項型別定義
interface SettingsState {
  // 介面顯示設定
  settingsVisible: boolean;
  showTagsView: boolean;
  showAppLogo: boolean;
  showWatermark: boolean;

  // 佈局設定
  layout: LayoutMode;
  sidebarColorScheme: string;

  // 主題設定
  theme: ThemeMode;
  themeColor: string;
}

// 🎯 可變更的設定項型別
type MutableSetting = Exclude<keyof SettingsState, "settingsVisible">;
type SettingValue<K extends MutableSetting> = SettingsState[K];

export const useSettingsStore = defineStore("setting", () => {
  // 🎯 基礎設定 - 非持久化
  const settingsVisible = ref<boolean>(false);

  // 🎯 持久化設定 - 使用分組常量
  const showTagsView = useStorage<boolean>(
    SETTINGS_KEYS.SHOW_TAGS_VIEW,
    defaultSettings.showTagsView
  );

  const showAppLogo = useStorage<boolean>(SETTINGS_KEYS.SHOW_APP_LOGO, defaultSettings.showAppLogo);

  const showWatermark = useStorage<boolean>(
    SETTINGS_KEYS.SHOW_WATERMARK,
    defaultSettings.showWatermark
  );

  const sidebarColorScheme = useStorage<string>(
    SETTINGS_KEYS.SIDEBAR_COLOR_SCHEME,
    defaultSettings.sidebarColorScheme
  );

  const layout = useStorage<LayoutMode>(SETTINGS_KEYS.LAYOUT, defaultSettings.layout as LayoutMode);

  const themeColor = useStorage<string>(SETTINGS_KEYS.THEME_COLOR, defaultSettings.themeColor);

  const theme = useStorage<ThemeMode>(SETTINGS_KEYS.THEME, defaultSettings.theme);

  // 🎯 設定項對映
  const settingsMap = {
    showTagsView,
    showAppLogo,
    showWatermark,
    sidebarColorScheme,
    layout,
  } as const;

  // 🎯 監聽器 - 主題變化
  watch(
    [theme, themeColor],
    ([newTheme, newThemeColor]) => {
      toggleDarkMode(newTheme === ThemeMode.DARK);
      const colors = generateThemeColors(newThemeColor, newTheme);
      applyTheme(colors);
    },
    { immediate: true }
  );

  // 🎯 監聽器 - 側邊欄配色方案變化
  watch(
    [sidebarColorScheme],
    ([newSidebarColorScheme]) => {
      toggleSidebarColor(newSidebarColorScheme === SidebarColor.CLASSIC_BLUE);
    },
    { immediate: true }
  );

  // 🎯 統一的設定更新方法 - 型別安全
  function updateSetting<K extends keyof typeof settingsMap>(key: K, value: SettingValue<K>): void {
    const setting = settingsMap[key];
    if (setting) {
      (setting as Ref<any>).value = value;
    }
  }

  // 🎯 主題相關的專用更新方法
  function updateTheme(newTheme: ThemeMode): void {
    theme.value = newTheme;
  }

  function updateThemeColor(newColor: string): void {
    themeColor.value = newColor;
  }

  function updateSidebarColorScheme(newScheme: string): void {
    sidebarColorScheme.value = newScheme;
  }

  function updateLayout(newLayout: LayoutMode): void {
    layout.value = newLayout;
  }

  // 🎯 設定面板顯示控制
  function toggleSettingsPanel(): void {
    settingsVisible.value = !settingsVisible.value;
  }

  function showSettingsPanel(): void {
    settingsVisible.value = true;
  }

  function hideSettingsPanel(): void {
    settingsVisible.value = false;
  }

  // 🎯 批次重置設定
  function resetSettings(): void {
    showTagsView.value = defaultSettings.showTagsView;
    showAppLogo.value = defaultSettings.showAppLogo;
    showWatermark.value = defaultSettings.showWatermark;
    sidebarColorScheme.value = defaultSettings.sidebarColorScheme;
    layout.value = defaultSettings.layout as LayoutMode;
    themeColor.value = defaultSettings.themeColor;
    theme.value = defaultSettings.theme;
  }

  return {
    // 狀態
    settingsVisible,
    showTagsView,
    showAppLogo,
    showWatermark,
    sidebarColorScheme,
    layout,
    themeColor,
    theme,

    // 更新方法
    updateSetting,
    updateTheme,
    updateThemeColor,
    updateSidebarColorScheme,
    updateLayout,

    // 面板控制
    toggleSettingsPanel,
    showSettingsPanel,
    hideSettingsPanel,

    // 重置功能
    resetSettings,
  };
});
