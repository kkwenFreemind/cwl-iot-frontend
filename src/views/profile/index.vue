<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <!-- 左側個人資訊卡片 -->
      <el-col :span="8">
        <el-card class="user-card">
          <div class="user-info">
            <div class="avatar-wrapper">
              <el-avatar :src="userStore.userInfo.avatar" :size="100" />
              <el-button
                type="info"
                class="avatar-edit-btn"
                circle
                :icon="Camera"
                size="small"
                @click="triggerFileUpload"
              />
              <input
                ref="fileInput"
                type="file"
                style="display: none"
                accept="image/*"
                @change="handleFileChange"
              />
            </div>
            <div class="user-name">
              <span class="nickname">{{ userProfile.nickname }}</span>
              <el-icon class="edit-icon" @click="handleOpenDialog(DialogType.ACCOUNT)">
                <Edit />
              </el-icon>
            </div>
            <div class="user-role">{{ userProfile.roleNames }}</div>
          </div>
          <el-divider />
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">{{ t("profile.stats.todos") }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">{{ t("profile.stats.messages") }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">{{ t("profile.stats.notifications") }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右側資訊卡片 -->
      <el-col :span="16">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>{{ t("profile.accountInfo") }}</span>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="t('profile.username')">
              {{ userProfile.username }}
              <el-icon v-if="userProfile.gender === 1" class="gender-icon male">
                <Male />
              </el-icon>
              <el-icon v-else class="gender-icon female">
                <Female />
              </el-icon>
            </el-descriptions-item>
            <el-descriptions-item :label="t('profile.mobile')">
              {{ userProfile.mobile || t("profile.status.unbound") }}
              <el-button
                v-if="userProfile.mobile"
                type="primary"
                link
                @click="() => handleOpenDialog(DialogType.MOBILE)"
              >
                {{ t("profile.actions.change") }}
              </el-button>
              <el-button
                v-else
                type="primary"
                link
                @click="() => handleOpenDialog(DialogType.MOBILE)"
              >
                {{ t("profile.actions.bind") }}
              </el-button>
            </el-descriptions-item>
            <el-descriptions-item :label="t('profile.email')">
              {{ userProfile.email || t("profile.status.unbound") }}
              <el-button
                v-if="userProfile.email"
                type="primary"
                link
                @click="() => handleOpenDialog(DialogType.EMAIL)"
              >
                {{ t("profile.actions.change") }}
              </el-button>
              <el-button
                v-else
                type="primary"
                link
                @click="() => handleOpenDialog(DialogType.EMAIL)"
              >
                {{ t("profile.actions.bind") }}
              </el-button>
            </el-descriptions-item>
            <el-descriptions-item :label="t('profile.department')">
              {{ userProfile.deptName }}
            </el-descriptions-item>
            <el-descriptions-item :label="t('profile.createTime')">
              {{ userProfile.createTime }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card class="security-card">
          <template #header>
            <div class="card-header">
              <span>{{ t("profile.securitySettings") }}</span>
            </div>
          </template>
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">{{ t("profile.security.accountPassword") }}</div>
              <div class="security-desc">{{ t("profile.security.passwordDesc") }}</div>
            </div>
            <el-button type="primary" link @click="() => handleOpenDialog(DialogType.PASSWORD)">
              {{ t("profile.actions.modify") }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 彈窗 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" :width="500">
      <!-- 賬號資料 -->
      <el-form
        v-if="dialog.type === DialogType.ACCOUNT"
        ref="userProfileFormRef"
        :model="userProfileForm"
        :label-width="100"
      >
        <el-form-item :label="t('profile.nickname')">
          <el-input v-model="userProfileForm.nickname" />
        </el-form-item>
        <el-form-item :label="t('profile.gender')">
          <Dict v-model="userProfileForm.gender" code="gender" />
        </el-form-item>
      </el-form>

      <!-- 修改密碼 -->
      <el-form
        v-if="dialog.type === DialogType.PASSWORD"
        ref="passwordChangeFormRef"
        :model="passwordChangeForm"
        :rules="passwordChangeRules"
        :label-width="100"
      >
        <el-form-item :label="t('profile.forms.oldPassword')" prop="oldPassword">
          <el-input v-model="passwordChangeForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item :label="t('profile.forms.newPassword')" prop="newPassword">
          <el-input v-model="passwordChangeForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item :label="t('profile.forms.confirmPassword')" prop="confirmPassword">
          <el-input v-model="passwordChangeForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>

      <!-- 繫結手機 -->
      <el-form
        v-else-if="dialog.type === DialogType.MOBILE"
        ref="mobileBindingFormRef"
        :model="mobileUpdateForm"
        :rules="mobileBindingRules"
        :label-width="100"
      >
        <el-form-item :label="t('profile.mobile')" prop="mobile">
          <el-input v-model="mobileUpdateForm.mobile" style="width: 250px" />
        </el-form-item>
        <el-form-item :label="t('profile.forms.verificationCode')" prop="code">
          <el-input v-model="mobileUpdateForm.code" style="width: 250px">
            <template #append>
              <el-button :disabled="mobileCountdown > 0" @click="handleSendMobileCode">
                {{
                  mobileCountdown > 0
                    ? `${mobileCountdown}${t("profile.forms.resendAfter")}`
                    : t("profile.forms.sendCode")
                }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <!-- 繫結郵箱 -->
      <el-form
        v-else-if="dialog.type === DialogType.EMAIL"
        ref="emailBindingFormRef"
        :model="emailUpdateForm"
        :rules="emailBindingRules"
        :label-width="100"
      >
        <el-form-item :label="t('profile.email')" prop="email">
          <el-input v-model="emailUpdateForm.email" style="width: 250px" />
        </el-form-item>
        <el-form-item :label="t('profile.forms.verificationCode')" prop="code">
          <el-input v-model="emailUpdateForm.code" style="width: 250px">
            <template #append>
              <el-button :disabled="emailCountdown > 0" @click="handleSendEmailCode">
                {{
                  emailCountdown > 0
                    ? `${emailCountdown}${t("profile.forms.resendAfter")}`
                    : t("profile.forms.sendCode")
                }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">{{ t("profile.actions.cancel") }}</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ t("profile.actions.confirm") }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import UserAPI, {
  UserProfileVO,
  PasswordChangeForm,
  MobileUpdateForm,
  EmailUpdateForm,
  UserProfileForm,
} from "@/api/system/user-api";

import FileAPI from "@/api/file-api";
import { useUserStoreHook } from "@/store";

import { Camera } from "@element-plus/icons-vue";

const { t } = useI18n();
const userStore = useUserStoreHook();

const userProfile = ref<UserProfileVO>({});

const enum DialogType {
  ACCOUNT = "account",
  PASSWORD = "password",
  MOBILE = "mobile",
  EMAIL = "email",
}

const dialog = reactive({
  visible: false,
  title: "",
  type: "" as DialogType, // 修改賬號資料,修改密碼、繫結手機、繫結郵箱
});
const userProfileFormRef = ref();
const passwordChangeFormRef = ref();
const mobileBindingFormRef = ref();
const emailBindingFormRef = ref();

const userProfileForm = reactive<UserProfileForm>({});
const passwordChangeForm = reactive<PasswordChangeForm>({});
const mobileUpdateForm = reactive<MobileUpdateForm>({});
const emailUpdateForm = reactive<EmailUpdateForm>({});

const mobileCountdown = ref(0);
const mobileTimer = ref();

const emailCountdown = ref(0);
const emailTimer = ref();

// 修改密碼校驗規則
const passwordChangeRules = computed(() => ({
  oldPassword: [
    { required: true, message: t("profile.validation.oldPasswordRequired"), trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: t("profile.validation.newPasswordRequired"), trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: t("profile.validation.confirmPasswordRequired"), trigger: "blur" },
  ],
}));

// 手機號校驗規則
const mobileBindingRules = computed(() => ({
  mobile: [
    { required: true, message: t("profile.validation.mobileRequired"), trigger: "blur" },
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: t("profile.validation.mobileInvalid"),
      trigger: "blur",
    },
  ],
  code: [
    { required: true, message: t("profile.validation.verificationCodeRequired"), trigger: "blur" },
  ],
}));

// 郵箱校驗規則
const emailBindingRules = computed(() => ({
  email: [
    { required: true, message: t("profile.validation.emailRequired"), trigger: "blur" },
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: t("profile.validation.emailInvalid"),
      trigger: "blur",
    },
  ],
  code: [
    { required: true, message: t("profile.validation.verificationCodeRequired"), trigger: "blur" },
  ],
}));

/**
 * 開啟彈窗
 * @param type 彈窗型別 ACCOUNT: 賬號資料 PASSWORD: 修改密碼 MOBILE: 繫結手機 EMAIL: 繫結郵箱
 */
const handleOpenDialog = (type: DialogType) => {
  dialog.type = type;
  dialog.visible = true;
  switch (type) {
    case DialogType.ACCOUNT:
      dialog.title = t("profile.dialogs.accountData");
      // 初始化表單資料
      userProfileForm.id = userProfile.value.id;
      userProfileForm.nickname = userProfile.value.nickname;
      userProfileForm.gender = userProfile.value.gender;
      break;
    case DialogType.PASSWORD:
      dialog.title = t("profile.dialogs.changePassword");
      break;
    case DialogType.MOBILE:
      dialog.title = t("profile.dialogs.bindMobile");
      break;
    case DialogType.EMAIL:
      dialog.title = t("profile.dialogs.bindEmail");
      break;
  }
};

/**
 * 傳送手機驗證碼
 */
function handleSendMobileCode() {
  if (!mobileUpdateForm.mobile) {
    ElMessage.error(t("profile.validation.mobileRequired"));
    return;
  }
  // 驗證手機號格式
  const reg = /^1[3-9]\d{9}$/;
  if (!reg.test(mobileUpdateForm.mobile)) {
    ElMessage.error(t("profile.validation.mobileInvalid"));
    return;
  }
  // 傳送簡訊驗證碼
  UserAPI.sendMobileCode(mobileUpdateForm.mobile).then(() => {
    ElMessage.success(t("profile.messages.codeSuccess"));

    // 倒計時 60s 重新傳送
    mobileCountdown.value = 60;
    mobileTimer.value = setInterval(() => {
      if (mobileCountdown.value > 0) {
        mobileCountdown.value -= 1;
      } else {
        clearInterval(mobileTimer.value!);
      }
    }, 1000);
  });
}

/**
 * 傳送郵箱驗證碼
 */
function handleSendEmailCode() {
  if (!emailUpdateForm.email) {
    ElMessage.error(t("profile.validation.emailRequired"));
    return;
  }
  // 驗證郵箱格式
  const reg = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
  if (!reg.test(emailUpdateForm.email)) {
    ElMessage.error(t("profile.validation.emailInvalid"));
    return;
  }

  // 傳送郵箱驗證碼
  UserAPI.sendEmailCode(emailUpdateForm.email).then(() => {
    ElMessage.success(t("profile.messages.codeSuccess"));
    // 倒計時 60s 重新傳送
    emailCountdown.value = 60;
    emailTimer.value = setInterval(() => {
      if (emailCountdown.value > 0) {
        emailCountdown.value -= 1;
      } else {
        clearInterval(emailTimer.value!);
      }
    }, 1000);
  });
}

/**
 * 提交表單
 */
const handleSubmit = async () => {
  if (dialog.type === DialogType.ACCOUNT) {
    UserAPI.updateProfile(userProfileForm).then(() => {
      ElMessage.success(t("profile.messages.profileUpdateSuccess"));
      dialog.visible = false;
      loadUserProfile();
    });
  } else if (dialog.type === DialogType.PASSWORD) {
    if (passwordChangeForm.newPassword !== passwordChangeForm.confirmPassword) {
      ElMessage.error(t("profile.validation.passwordMismatch"));
      return;
    }
    UserAPI.changePassword(passwordChangeForm).then(() => {
      ElMessage.success(t("profile.messages.passwordChangeSuccess"));
      dialog.visible = false;
    });
  } else if (dialog.type === DialogType.MOBILE) {
    UserAPI.bindOrChangeMobile(mobileUpdateForm).then(() => {
      ElMessage.success(t("profile.messages.mobileBindSuccess"));
      dialog.visible = false;
      loadUserProfile();
    });
  } else if (dialog.type === DialogType.EMAIL) {
    UserAPI.bindOrChangeEmail(emailUpdateForm).then(() => {
      ElMessage.success(t("profile.messages.emailBindSuccess"));
      dialog.visible = false;
      loadUserProfile();
    });
  }
};

/**
 * 取消
 */
const handleCancel = () => {
  dialog.visible = false;
  if (dialog.type === DialogType.ACCOUNT) {
    userProfileFormRef.value?.resetFields();
  } else if (dialog.type === DialogType.PASSWORD) {
    passwordChangeFormRef.value?.resetFields();
  } else if (dialog.type === DialogType.MOBILE) {
    mobileBindingFormRef.value?.resetFields();
  } else if (dialog.type === DialogType.EMAIL) {
    emailBindingFormRef.value?.resetFields();
  }
};

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;
  if (file) {
    // 呼叫檔案上傳API
    try {
      const data = await FileAPI.uploadFile(file);
      // 更新使用者資訊
      await UserAPI.updateProfile({
        avatar: data.url,
      });
      // 更新使用者頭像
      userStore.userInfo.avatar = data.url;
      ElMessage.success(t("profile.messages.avatarUploadSuccess"));
    } catch (error) {
      console.error("頭像上傳失敗：" + error);
      ElMessage.error(t("profile.messages.avatarUploadFailed"));
    }
  }
};

/** 載入使用者資訊 */
const loadUserProfile = async () => {
  const data = await UserAPI.getProfile();
  userProfile.value = data;
};

onMounted(async () => {
  if (mobileTimer.value) {
    clearInterval(mobileTimer.value);
  }
  if (emailTimer.value) {
    clearInterval(emailTimer.value);
  }
  await loadUserProfile();
});
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: calc(100vh - 84px);
  padding: 20px;
  background: var(--el-fill-color-blank);
}

.user-card {
  .user-info {
    padding: 20px 0;
    text-align: center;

    .avatar-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 16px;

      .avatar-edit-btn {
        position: absolute;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        border: none;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(0, 0, 0, 0.7);
        }
      }
    }

    .user-name {
      margin-bottom: 8px;

      .nickname {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .edit-icon {
        margin-left: 8px;
        color: var(--el-text-color-secondary);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    .user-role {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  .user-stats {
    display: flex;
    justify-content: space-around;
    padding: 16px 0;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .stat-label {
        margin-top: 4px;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.info-card,
.security-card {
  margin-bottom: 20px;

  .card-header {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;

  .security-info {
    .security-title {
      margin-bottom: 4px;
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .security-desc {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}

.el-descriptions {
  .el-descriptions__label {
    font-weight: 500;
    color: var(--el-text-color-regular);
  }

  .el-descriptions__content {
    color: var(--el-text-color-primary);
  }

  .gender-icon {
    margin-left: 8px;
    font-size: 16px;

    &.male {
      color: #409eff;
    }

    &.female {
      color: #f56c6c;
    }
  }
}

.el-dialog {
  .el-dialog__header {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .el-dialog__body {
    padding: 30px 20px;
  }

  .el-dialog__footer {
    padding: 20px;
    border-top: 1px solid var(--el-border-color-light);
  }
}

// 響應式適配
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }

  .el-col {
    width: 100%;
  }
}
</style>
