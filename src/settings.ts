import { LayoutMode, ComponentSize, SidebarColor, ThemeMode, LanguageEnum } from "./enums";

const { pkg } = __APP_INFO__;

// 檢查使用者的作業系統是否使用深色模式
const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

export const defaultSettings: AppSettings = {
  // 系統Title
  title: "CWL IOT",
  // 系統版本
  version: pkg.version,
  // 是否顯示設定
  showSettings: true,
  // 是否顯示標籤檢視
  showTagsView: true,
  // 是否顯示應用Logo
  showAppLogo: true,
  // 佈局方式，預設為左側佈局
  layout: LayoutMode.LEFT,
  // 主題，根據作業系統的色彩方案自動選擇
  theme: mediaQueryList.matches ? ThemeMode.DARK : ThemeMode.LIGHT,
  // 元件大小 default | medium | small | large
  size: ComponentSize.DEFAULT,
  // 語言
  language: LanguageEnum.ZH_TW,
  // 主題顏色 - 修改此值時需同步修改 src/styles/variables.scss
  themeColor: "#4080FF",
  // 是否顯示水印
  showWatermark: false,
  // 水印內容
  watermarkContent: "社區水位監測系統",
  // 側邊欄配色方案
  sidebarColorScheme: SidebarColor.CLASSIC_BLUE,
};

// 主題色預設 - 經典配色方案
// 注意：修改預設主題色時，需要同步修改 src/styles/variables.scss 中的 primary.base 值
export const themeColorPresets = [
  "#4080FF", // Arco Design 藍 - 現代感強
  "#1890FF", // Ant Design 藍 - 經典商務
  "#409EFF", // Element Plus 藍 - 清新自然
  "#FA8C16", // 活力橙 - 溫暖友好
  "#722ED1", // 優雅紫 - 高階大氣
  "#13C2C2", // 青色 - 科技感
  "#52C41A", // 成功綠 - 活力清新
  "#F5222D", // 警示紅 - 醒目強烈
  "#2F54EB", // 深藍 - 穩重專業
  "#EB2F96", // 品紅 - 時尚個性
];
