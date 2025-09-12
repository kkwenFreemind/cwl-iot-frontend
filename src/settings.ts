import { LayoutMode, ComponentSize, SidebarColor, ThemeMode, LanguageEnum } from "./enums";

const { pkg } = __APP_INFO__;

// Check if the user's operating system uses dark mode
const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

export const defaultSettings: AppSettings = {
  // System title
  title: pkg.name,
  // System version
  version: pkg.version,
  // Whether to show settings
  showSettings: true,
  // Whether to show tags view
  showTagsView: true,
  // Whether to show app logo
  showAppLogo: true,
  // Layout mode, default is left layout
  layout: LayoutMode.LEFT,
  // Theme, automatically selected based on the operating system's color scheme
  theme: mediaQueryList.matches ? ThemeMode.DARK : ThemeMode.LIGHT,
  // Component size: default | medium | small | large
  size: ComponentSize.DEFAULT,
  // Language
  language: LanguageEnum.ZH_CN,
  // Theme color - when modifying this value, need to sync with src/styles/variables.scss
  themeColor: "#4080FF",
  // Whether to show watermark
  showWatermark: false,
  // Watermark content
  watermarkContent: pkg.name,
  // Sidebar color scheme
  sidebarColorScheme: SidebarColor.CLASSIC_BLUE,
};

// Theme color presets - classic color schemes
// Note: When modifying the default theme color, need to sync the primary.base value in src/styles/variables.scss
export const themeColorPresets = [
  "#4080FF", // Arco Design Blue - Modern
  "#1890FF", // Ant Design Blue - Classic Business
  "#409EFF", // Element Plus Blue - Fresh and Natural
  "#FA8C16", // Vibrant Orange - Warm and Friendly
  "#722ED1", // Elegant Purple - High-end and Elegant
  "#13C2C2", // Cyan - Tech-savvy
  "#52C41A", // Success Green - Vibrant and Fresh
  "#F5222D", // Warning Red - Eye-catching and Strong
  "#2F54EB", // Deep Blue - Stable and Professional
  "#EB2F96", // Magenta - Fashionable and Unique
];
