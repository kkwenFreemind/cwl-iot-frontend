import type { App } from "vue";
import { createI18n } from "vue-i18n";
import { useAppStoreHook } from "@/store/modules/app-store";
// 本地語言包
import enLocale from "./package/en";
import zhTwLocale from "./package/zh-tw";

const appStore = useAppStoreHook();

const messages = {
  "zh-tw": {
    ...zhTwLocale,
  },
  en: {
    ...enLocale,
  },
};

const i18n = createI18n({
  legacy: false,
  locale: appStore.language,
  messages,
  globalInjection: true,
});

// 全局註冊 i18n
export function setupI18n(app: App<Element>) {
  app.use(i18n);
}

export default i18n;
