<!--
 * 基於 wangEditor-next 的富文字編輯器元件二次封裝
 * 版權所有 © 2021-present 有來開源組織
 *
 * 開源協議：https://opensource.org/licenses/MIT
 * 專案地址：https://gitee.com/youlaiorg/vue3-element-admin
 *
 * 在使用時，請保留此註釋，感謝您對開源的支援！
-->

<template>
  <div style="z-index: 999; border: 1px solid var(--el-border-color)">
    <!-- 工具欄 -->
    <Toolbar
      :editor="editorRef"
      mode="simple"
      :default-config="toolbarConfig"
      style="border-bottom: 1px solid var(--el-border-color)"
    />
    <!-- 編輯器 -->
    <Editor
      v-model="modelValue"
      :style="{ height: height, overflowY: 'hidden' }"
      :default-config="editorConfig"
      mode="simple"
      @on-created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import "@wangeditor-next/editor/dist/css/style.css";
import { Toolbar, Editor } from "@wangeditor-next/editor-for-vue";
import { IToolbarConfig, IEditorConfig } from "@wangeditor-next/editor";

// 檔案上傳 API
import FileAPI from "@/api/file-api";

// 上傳圖片回撥函式型別
type InsertFnType = (_url: string, _alt: string, _href: string) => void;

defineProps({
  height: {
    type: String,
    default: "500px",
  },
});
// 雙向繫結
const modelValue = defineModel("modelValue", {
  type: String,
  required: false,
});

// 編輯器例項，必須用 shallowRef，重要！
const editorRef = shallowRef();

// 工具欄配置
const toolbarConfig = ref<Partial<IToolbarConfig>>({});

// 編輯器配置
const editorConfig = ref<Partial<IEditorConfig>>({
  placeholder: "請輸入內容...",
  MENU_CONF: {
    uploadImage: {
      customUpload(file: File, insertFn: InsertFnType) {
        // 上傳圖片
        FileAPI.uploadFile(file).then((res) => {
          // 插入圖片
          insertFn(res.url, res.name, res.url);
        });
      },
    } as any,
  },
});

// 記錄 editor 例項，重要！
const handleCreated = (editor: any) => {
  editorRef.value = editor;
};

// 元件銷燬時，也及時銷燬編輯器，重要！
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>
