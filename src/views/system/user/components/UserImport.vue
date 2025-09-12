<template>
  <div>
    <el-dialog
      v-model="visible"
      :align-center="true"
      title="匯入資料"
      width="600px"
      @close="handleClose"
    >
      <el-scrollbar max-height="60vh">
        <el-form
          ref="importFormRef"
          style="padding-right: var(--el-dialog-padding-primary)"
          :model="importFormData"
          :rules="importFormRules"
        >
          <el-form-item label="檔名" prop="files">
            <el-upload
              ref="uploadRef"
              v-model:file-list="importFormData.files"
              class="w-full"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              :drag="true"
              :limit="1"
              :auto-upload="false"
              :on-exceed="handleFileExceed"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                將檔案拖到此處，或
                <em>點選上傳</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  格式為*.xlsx / *.xls，檔案不超過一個
                  <el-link
                    type="primary"
                    icon="download"
                    underline="never"
                    @click="handleDownloadTemplate"
                  >
                    下載模板
                  </el-link>
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <div style="padding-right: var(--el-dialog-padding-primary)">
          <el-button v-if="resultData.length > 0" type="primary" @click="handleShowResult">
            錯誤資訊
          </el-button>
          <el-button
            type="primary"
            :disabled="importFormData.files.length === 0"
            @click="handleUpload"
          >
            確 定
          </el-button>
          <el-button @click="handleClose">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="resultVisible" title="匯入結果" width="600px">
      <el-alert
        :title="`匯入結果：${invalidCount}條無效資料，${validCount}條有效資料`"
        type="warning"
        :closable="false"
      />
      <el-table :data="resultData" style="width: 100%; max-height: 400px">
        <el-table-column prop="index" align="center" width="100" type="index" label="序號" />
        <el-table-column prop="message" label="錯誤資訊" width="400">
          <template #default="scope">
            {{ scope.row }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseResult">關閉</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage, type UploadUserFile } from "element-plus";
import UserAPI from "@/api/system/user-api";
import { ResultEnum } from "@/enums/api/result.enum";

const emit = defineEmits(["import-success"]);
const visible = defineModel("modelValue", {
  type: Boolean,
  required: true,
  default: false,
});

const resultVisible = ref(false);
const resultData = ref<string[]>([]);
const invalidCount = ref(0);
const validCount = ref(0);

const importFormRef = ref(null);
const uploadRef = ref(null);

const importFormData = reactive<{
  files: UploadUserFile[];
}>({
  files: [],
});

watch(visible, (newValue) => {
  if (newValue) {
    resultData.value = [];
    resultVisible.value = false;
    invalidCount.value = 0;
    validCount.value = 0;
  }
});

const importFormRules = {
  files: [{ required: true, message: "檔案不能為空", trigger: "blur" }],
};

// 檔案超出個數限制
const handleFileExceed = () => {
  ElMessage.warning("只能上傳一個檔案");
};

// 下載匯入模板
const handleDownloadTemplate = () => {
  UserAPI.downloadTemplate().then((response: any) => {
    const fileData = response.data;
    const fileName = decodeURI(response.headers["content-disposition"].split(";")[1].split("=")[1]);
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8";

    const blob = new Blob([fileData], { type: fileType });
    const downloadUrl = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);
  });
};

// 上傳檔案
const handleUpload = async () => {
  if (!importFormData.files.length) {
    ElMessage.warning("請選擇檔案");
    return;
  }

  try {
    const result = await UserAPI.import("1", importFormData.files[0].raw as File);
    if (result.code === ResultEnum.SUCCESS && result.invalidCount === 0) {
      ElMessage.success("匯入成功，匯入資料：" + result.validCount + "條");
      emit("import-success");
      handleClose();
    } else {
      ElMessage.error("上傳失敗");
      resultVisible.value = true;
      resultData.value = result.messageList;
      invalidCount.value = result.invalidCount;
      validCount.value = result.validCount;
    }
  } catch (error: any) {
    console.error(error);
    ElMessage.error("上傳失敗：" + error);
  }
};

// 顯示錯誤資訊
const handleShowResult = () => {
  resultVisible.value = true;
};

// 關閉錯誤資訊彈窗
const handleCloseResult = () => {
  resultVisible.value = false;
};

// 關閉彈窗
const handleClose = () => {
  importFormData.files.length = 0;
  visible.value = false;
};
</script>
