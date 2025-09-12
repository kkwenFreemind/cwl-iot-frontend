import { ThemeMode } from "@/enums";

// 輔助函式：將十六進位制顏色轉換為 RGB
function hexToRgb(hex: string): [number, number, number] {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

// 輔助函式：將 RGB 轉換為十六進位制顏色
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// 輔助函式：調整顏色亮度
/** function adjustBrightness(hex: string, factor: number, theme: string): string {
  const rgb = hexToRgb(hex);
  // 是否是暗黑模式
  const isDarkMode = theme === "dark" ? 0 : 255;
  const newRgb = rgb.map((val) =>
    Math.max(0, Math.min(255, Math.round(val + (isDarkMode - val) * factor)))
  ) as [number, number, number];
  return rgbToHex(...newRgb);
} */

/**
 * 加深顏色值
 * @param {String} color 顏色值字串
 * @param {Number} level 加深的程度，限0-1之間
 * @returns {String} 返回處理後的顏色值
 */
export function getDarkColor(color: string, level: number): string {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) rgb[i] = Math.round(20.5 * level + rgb[i] * (1 - level));
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

/**
 * 變淺顏色值
 * @param {String} color 顏色值字串
 * @param {Number} level 加深的程度，限0-1之間
 * @returns {String} 返回處理後的顏色值
 */
export const getLightColor = (color: string, level: number): string => {
  const rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) rgb[i] = Math.round(255 * level + rgb[i] * (1 - level));
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

/**
 * 生成主題色
 * @param primary 主題色
 * @param theme 主題型別
 */
export function generateThemeColors(primary: string, theme: ThemeMode) {
  const colors: Record<string, string> = {
    primary,
  };

  // 生成淺色變體
  for (let i = 1; i <= 9; i++) {
    colors[`primary-light-${i}`] =
      theme === ThemeMode.LIGHT
        ? `${getLightColor(primary, i / 10)}`
        : `${getDarkColor(primary, i / 10)}`;
  }

  // 生成深色變體
  colors["primary-dark-2"] =
    theme === ThemeMode.LIGHT ? `${getLightColor(primary, 0.2)}` : `${getDarkColor(primary, 0.3)}`;

  return colors;
}

export function applyTheme(colors: Record<string, string>) {
  const el = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    el.style.setProperty(`--el-color-${key}`, value);
  });

  // 確保主題色立即生效，強制重新渲染
  requestAnimationFrame(() => {
    // 觸發樣式重新計算
    el.style.setProperty("--theme-update-trigger", Date.now().toString());
  });
}

/**
 * 切換暗黑模式
 *
 * @param isDark 是否啟用暗黑模式
 */
export function toggleDarkMode(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add(ThemeMode.DARK);
  } else {
    document.documentElement.classList.remove(ThemeMode.DARK);
  }
}

/**
 * 切換淺色主題下的側邊欄顏色方案
 *
 * @param isBlue 布林值，表示是否開啟深藍色側邊欄顏色方案
 */
export function toggleSidebarColor(isBuleSidebar: boolean) {
  if (isBuleSidebar) {
    document.documentElement.classList.add("sidebar-color-blue");
  } else {
    document.documentElement.classList.remove("sidebar-color-blue");
  }
}
