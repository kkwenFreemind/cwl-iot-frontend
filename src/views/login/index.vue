<!-- 
  @author youlaitech
  @since 2024-08-27
 
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025/09/12

  Login Page Component
  
  This component provides comprehensive user authentication functionality including:
  - Responsive login interface with glass-morphism design
  - Dynamic theme switching (dark/light/auto mode)
  - Multi-language support with language selector
  - Application branding with version display
  - Dynamic logo switching based on theme
  - Smooth transitions between form components
  - Mobile-responsive layout design
-->
<template>
  <!-- Login page container with responsive background and centered layout -->
  <div class="login-container">
    <!-- Action bar with theme toggle and language selector positioned on top-right -->
    <div class="action-bar">
      <!-- Dark/Light mode toggle with tooltip -->
      <el-tooltip :content="t('login.themeToggle')" placement="bottom">
        <CommonWrapper>
          <DarkModeSwitch />
        </CommonWrapper>
      </el-tooltip>
      <!-- Language selector with tooltip -->
      <el-tooltip :content="t('login.languageToggle')" placement="bottom">
        <CommonWrapper>
          <LangSelect size="text-20px" />
        </CommonWrapper>
      </el-tooltip>
    </div>
    <!-- Main login content area with centered layout -->
    <div flex-1 flex-center>
      <!-- Login form card with responsive design and glass-morphism effect -->
      <div
        class="p-4xl w-full h-auto sm:w-450px border-rd-10px sm:h-680px shadow-[var(--el-box-shadow-light)] backdrop-blur-3px"
      >
        <div w-full flex flex-col items-center>
          <!-- Application logo with dynamic theme-based switching -->
          <el-image :src="currentLogo" style="width: 84px" />

          <!-- Application title with version badge -->
          <h2>
            <el-badge :value="`v ${defaultSettings.version}`" type="success">
              {{ defaultSettings.title }}
            </el-badge>
          </h2>

          <!-- Dynamic component switching between login and reset password forms -->
          <transition name="fade-slide" mode="out-in">
            <component :is="formComponents[component]" v-model="component" class="w-90%" />
          </transition>
        </div>
      </div>
      <!-- Footer copyright notice -->
      <el-text size="small" class="py-2.5! fixed bottom-0 text-center">
        Copyright © 2021 - 2025 All Rights Reserved.
      </el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from "@/assets/logo.png";
import logoDark from "@/assets/logo-dark.png";
import logoWhite from "@/assets/logo-white.png";
import CommonWrapper from "@/components/CommonWrapper/index.vue";
import DarkModeSwitch from "@/components/DarkModeSwitch/index.vue";
import { ThemeMode } from "@/enums/settings/theme.enum";
import { useSettingsStore } from "@/store/modules/settings-store";
import { defaultSettings } from "@/settings";

// Define layout component types for type safety
type LayoutMap = "login";

// Initialize composables for i18n and settings store
const t = useI18n().t;
const settingsStore = useSettingsStore();

// Reactive state for current component and form component mapping
const component = ref<LayoutMap>("login"); // Current active component (always login now)
const formComponents = {
  login: defineAsyncComponent(() => import("./components/Login.vue")),
};

// Computed property for dynamic logo selection based on current theme
const currentLogo = computed(() => {
  const currentTheme = settingsStore.theme;

  switch (currentTheme) {
    case ThemeMode.DARK:
      return logoWhite; // White logo for dark mode for better contrast
    case ThemeMode.LIGHT:
      return logoDark; // Dark logo for light mode for better contrast
    case ThemeMode.AUTO: {
      // Auto mode: detect system theme preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? logoWhite : logoDark;
    }
    default:
      return logo; // Fallback to default logo
  }
});
</script>

<style lang="scss" scoped>
// Main login container with full viewport dimensions
.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

// Background layer using pseudo-element for better performance
.login-container::before {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  content: "";
  background: url("@/assets/images/login-bg.svg");
  background-position: center center;
  background-size: cover;
}

// Action bar positioning with responsive design
.action-bar {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;

  // Mobile responsive adjustments
  @media (max-width: 480px) {
    top: 10px;
    right: auto;
    left: 10px;
  }

  // Desktop responsive adjustments
  @media (min-width: 640px) {
    top: 40px;
    right: 40px;
  }
}

// Smooth fade-slide transition animations for component switching
.fade-slide-leave-active,
.fade-slide-enter-active {
  transition: all 0.3s;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
