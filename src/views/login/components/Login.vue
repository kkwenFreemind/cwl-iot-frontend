<template>
  <div>
    <!-- <h3 text-center m-0 mb-20px>{{ t("login.login") }}</h3> -->
    <h1></h1>
    <el-form
      ref="loginFormRef"
      :model="loginFormData"
      :rules="loginRules"
      size="large"
      :validate-on-rule-change="false"
    >
      <!-- 使用者名稱 -->
      <el-form-item prop="username">
        <el-input v-model.trim="loginFormData.username" :placeholder="t('login.username')">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 密碼 -->
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

      <!-- 驗證碼 -->
      <el-form-item prop="captchaCode">
        <div flex>
          <el-input
            v-model.trim="loginFormData.captchaCode"
            :placeholder="t('login.captchaCode')"
            @keyup.enter="handleLoginSubmit"
          >
            <template #prefix>
              <div class="i-svg:captcha" />
            </template>
          </el-input>
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

      <div class="flex-x-between w-full">
        <el-checkbox v-model="loginFormData.rememberMe">{{ t("login.rememberMe") }}</el-checkbox>
        <el-link type="primary" underline="never" @click="toOtherForm('resetPwd')">
          {{ t("login.forgetPassword") }}
        </el-link>
      </div>

      <!-- 登入按鈕 -->
      <el-form-item>
        <el-button :loading="loading" type="primary" class="w-full" @click="handleLoginSubmit">
          {{ t("login.login") }}
        </el-button>
      </el-form-item>
    </el-form>

    <div flex-center gap-10px>
      <el-text size="default">{{ t("login.noAccount") }}</el-text>
      <el-link type="primary" underline="never" @click="toOtherForm('register')">
        {{ t("login.reg") }}
      </el-link>
    </div>

    <!-- 第三方登入 -->
    <!-- <div class="third-party-login">
      <div class="divider-container">
        <div class="divider-line"></div>
        <span class="divider-text">{{ t("login.otherLoginMethods") }}</span>
        <div class="divider-line"></div>
      </div>
      <div class="flex-center gap-x-5 w-full text-[var(--el-text-color-secondary)]">
        <CommonWrapper>
          <div text-20px class="i-svg:wechat" />
        </CommonWrapper>
        <CommonWrapper>
          <div text-20px cursor-pointer class="i-svg:qq" />
        </CommonWrapper>
        <CommonWrapper>
          <div text-20px cursor-pointer class="i-svg:github" />
        </CommonWrapper>
        <CommonWrapper>
          <div text-20px cursor-pointer class="i-svg:gitee" />
        </CommonWrapper>
      </div>
    </div> -->
  </div>
</template>
<script setup lang="ts">
import type { FormInstance } from "element-plus";
import AuthAPI, { type LoginFormData } from "@/api/auth-api";
import router from "@/router";
import { useUserStore } from "@/store";
import { AuthStorage } from "@/utils/auth";

const { t } = useI18n();
const userStore = useUserStore();
const route = useRoute();

onMounted(() => getCaptcha());

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
// 是否大寫鎖定
const isCapsLock = ref(false);
// 驗證碼圖片Base64字串
const captchaBase64 = ref();
// 記住我
const rememberMe = AuthStorage.getRememberMe();

const loginFormData = ref<LoginFormData>({
  username: "admin",
  password: "123456",
  captchaKey: "",
  captchaCode: "",
  rememberMe,
});

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

// 獲取驗證碼
const codeLoading = ref(false);
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
 * 登入提交
 */
async function handleLoginSubmit() {
  try {
    // 1. 表單驗證
    const valid = await loginFormRef.value?.validate();
    if (!valid) return;

    loading.value = true;

    // 2. 執行登入
    await userStore.login(loginFormData.value);

    const redirectPath = (route.query.redirect as string) || "/";

    await router.push(decodeURIComponent(redirectPath));
  } catch (error) {
    // 4. 統一錯誤處理
    getCaptcha(); // 重新整理驗證碼
    console.error("登入失敗:", error);
  } finally {
    loading.value = false;
  }
}

// 檢查輸入大小寫
function checkCapsLock(event: KeyboardEvent) {
  // 防止瀏覽器密碼自動填充時報錯
  if (event instanceof KeyboardEvent) {
    isCapsLock.value = event.getModifierState("CapsLock");
  }
}

const emit = defineEmits(["update:modelValue"]);
function toOtherForm(type: "register" | "resetPwd") {
  emit("update:modelValue", type);
}
</script>

<style lang="scss" scoped>
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
