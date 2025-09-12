import type { App } from "vue";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

// 註冊所有圖示
export function setupElIcons(app: App<Element>) {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
}
