<!-- 
  @author youlaitech
  @since 2024-08-27
 
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025/09/12

  Login Form Component
  
  This component provides secure user authentication functionality including:
  - Username and password input validation with internationalized error messages
  - Interactive captcha verification system with click-to-refresh capability
  - Caps lock detection during password input with visual feedback
  - Remember me option for persistent authentication
  - Loading states and error handling for smooth user experience
  - Responsive form layout with Element Plus styling
  - Automatic redirect handling after successful authentication
-->
<template>
  <div>
    <!-- Login form container -->
    <!-- <h3 text-center m-0 mb-20px>{{ t("login.login") }}</h3> -->
    <h1></h1>
    <!-- Main login form with validation rules and large size styling -->
    <el-form
      ref="loginFormRef"
      :model="loginFormData"
      :rules="loginRules"
      size="large"
      :validate-on-rule-change="false"
    >
      <!-- Username input field with user icon prefix -->
      <el-form-item prop="username">
        <el-input v-model.trim="loginFormData.username" :placeholder="t('login.username')">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- Password input field with caps lock detection and lock icon prefix -->
      <el-tooltip :visible="isCapsLock" :content="t('login.capsLock')" placement="right">
        <el-form-item prop="password">
          <el-input
            v-model.trim="loginFormData.password"
            :placeholder="t('login.password')"
            type="password"
            show-password
            @keyup="checkCapsLock"
            @keyup.enter="handleLoginSubmit"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-tooltip>

      <!-- Captcha verification field with image display and refresh functionality -->
      <el-form-item prop="captchaCode">
        <div flex>
          <!-- Captcha input field -->
          <el-input
            v-model.trim="loginFormData.captchaCode"
            :placeholder="t('login.captchaCode')"
            @keyup.enter="handleLoginSubmit"
          >
            <template #prefix>
              <div class="i-svg:captcha" />
            </template>
          </el-input>
          <!-- Captcha image with click-to-refresh functionality -->
          <div cursor-pointer h="[40px]" w="[120px]" flex-center ml-10px @click="getCaptcha">
            <el-icon v-if="codeLoading" class="is-loading"><Loading /></el-icon>

            <img
              v-else
              object-cover
              border-rd-4px
              p-1px
              shadow="[0_0_0_1px_var(--el-border-color)_inset]"
              :src="captchaBase64"
              alt="code"
            />
          </div>
        </div>
      </el-form-item>

      <!-- Login options: Remember me checkbox -->
      <div class="flex-x-between w-full">
        <el-checkbox v-model="loginFormData.rememberMe">{{ t("login.rememberMe") }}</el-checkbox>
      </div>

      <!-- Login submit button with loading state -->
      <el-form-item>
        <el-button :loading="loading" type="primary" class="w-full" @click="handleLoginSubmit">
          {{ t("login.login") }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
// Import required types and APIs
import type { FormInstance } from "element-plus";
import AuthAPI, { type LoginFormData } from "@/api/auth-api";
import router from "@/router";
import { useUserStore } from "@/store";
import { AuthStorage } from "@/utils/auth";

// Initialize composables and stores
const { t } = useI18n(); // Internationalization function
const userStore = useUserStore(); // User state management
const route = useRoute(); // Current route information

// Load captcha on component mount
onMounted(() => getCaptcha());

// Reactive references for form and UI state
const loginFormRef = ref<FormInstance>(); // Form instance reference for validation
const loading = ref(false); // Loading state for login button
const isCapsLock = ref(false); // Caps lock detection state
const captchaBase64 = ref(); // Base64 encoded captcha image
const rememberMe = AuthStorage.getRememberMe(); // Remember me preference from storage

// Login form data with default values for development
const loginFormData = ref<LoginFormData>({
  username: "admin", // Default username for testing
  password: "123456", // Default password for testing
  captchaKey: "", // Captcha key from server
  captchaCode: "", // User input captcha code
  rememberMe, // Remember me checkbox state
});

// Form validation rules with internationalized error messages
const loginRules = computed(() => {
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.username.required"),
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.password.required"),
      },
      {
        min: 6,
        message: t("login.message.password.min"),
        trigger: "blur",
      },
    ],
    captchaCode: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.captchaCode.required"),
      },
    ],
  };
});

// Captcha loading state and fetch function
const codeLoading = ref(false);
/**
 * Fetch new captcha image from server
 * Updates both captcha key and base64 image data
 */
function getCaptcha() {
  codeLoading.value = true;
  AuthAPI.getCaptcha()
    .then((data) => {
      loginFormData.value.captchaKey = data.captchaKey;
      captchaBase64.value = data.captchaBase64;
    })
    .finally(() => (codeLoading.value = false));
}

/**
 * Handle login form submission
 * Performs validation, authentication, and navigation
 */
async function handleLoginSubmit() {
  try {
    // 1. Validate form fields
    const valid = await loginFormRef.value?.validate();
    if (!valid) return;

    loading.value = true;

    console.log("🔑 [Login] Starting login process...");

    // 2. Execute login authentication
    await userStore.login(loginFormData.value);
    console.log("✅ [Login] Authentication successful");

    // 3. Handle redirect after successful login
    const redirectPath = (route.query.redirect as string) || "/";
    console.log(`🔄 [Login] Attempting to redirect to: ${redirectPath}`);

    await router.push(decodeURIComponent(redirectPath));
    console.log("✅ [Login] Navigation completed successfully");
  } catch (error) {
    // 4. Handle login errors
    getCaptcha(); // Refresh captcha on error
    console.error("❌ [Login] Login failed:", error);
  } finally {
    loading.value = false;
  }
}

/**
 * Check for caps lock state during password input
 * Provides visual feedback to user when caps lock is active
 * @param event - Keyboard event from password input
 */
function checkCapsLock(event: KeyboardEvent) {
  // Prevent errors when browser auto-fills password
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}
</script>

<style lang="scss" scoped>
// Styles for third-party login section (currently unused but preserved for future use)
.third-party-login {
  .divider-container {
    display: flex;
    align-items: center;
    margin: 20px 0;

    .divider-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, transparent, var(--el-border-color-light), transparent);
    }

    .divider-text {
      padding: 0 16px;
      font-size: 12px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }
  }
}
</style>
