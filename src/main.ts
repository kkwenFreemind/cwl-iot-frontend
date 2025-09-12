import { createApp } from "vue";
import App from "./App.vue";
import setupPlugins from "@/plugins";

// 暗黑主題樣式
import "element-plus/theme-chalk/dark/css-vars.css";
import "vxe-table/lib/style.css";
// 暗黑模式自定義變數
import "@/styles/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";

// 過渡動畫
import "animate.css";

// 自動為某些預設事件（如 touchstart、wheel 等）新增 { passive: true },提升滾動效能並消除控制檯的非被動事件監聽警告
import "default-passive-events";

const app = createApp(App);
// 註冊外掛
app.use(setupPlugins);
app.mount("#app");
