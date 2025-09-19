/**
 * 頁面生成器使用示例
 * 展示如何使用 PageGenerator 自動生成CRUD頁面
 */

import { generateDevicePage } from "@/utils/page-generator";

/**
 * 生成設備管理頁面
 */
export function generateDeviceManagementPage() {
  const generatedCode = generateDevicePage();
  console.log("生成的頁面代碼：", generatedCode);

  // 在瀏覽器環境中，我們不能直接寫文件
  // 這裡只是演示如何生成代碼
  console.log("頁面代碼已生成，可以複製到對應的文件中");

  return generatedCode;
}

/**
 * 自定義頁面生成示例
 */
export async function generateCustomPage() {
  const customConfig = {
    title: "User",
    apiBaseUrl: "/api/v1/users",
    endpoints: {
      list: {
        name: "listUsers",
        url: "/api/v1/users",
        method: "GET" as const,
        description: "獲取用戶列表",
      },
      create: {
        name: "createUser",
        url: "/api/v1/users",
        method: "POST" as const,
        description: "創建用戶",
      },
      update: {
        name: "updateUser",
        url: "/api/v1/users/{id}",
        method: "PUT" as const,
        description: "更新用戶",
      },
      delete: {
        name: "deleteUser",
        url: "/api/v1/users/{id}",
        method: "DELETE" as const,
        description: "刪除用戶",
      },
    },
    fields: [
      {
        name: "userId",
        label: "用戶ID",
        type: "string" as const,
        required: false,
      },
      {
        name: "username",
        label: "用戶名",
        type: "string" as const,
        required: true,
        placeholder: "請輸入用戶名",
      },
      {
        name: "nickname",
        label: "暱稱",
        type: "string" as const,
        required: true,
        placeholder: "請輸入暱稱",
      },
      {
        name: "email",
        label: "郵箱",
        type: "string" as const,
        required: true,
        placeholder: "請輸入郵箱",
      },
      {
        name: "status",
        label: "狀態",
        type: "select" as const,
        required: true,
        options: [
          { label: "正常", value: "ACTIVE" },
          { label: "禁用", value: "INACTIVE" },
        ],
        placeholder: "請選擇狀態",
      },
    ],
    tableColumns: [
      { prop: "username", label: "用戶名", width: 120 },
      { prop: "nickname", label: "暱稱", width: 120 },
      { prop: "email", label: "郵箱", width: 200 },
      { prop: "status", label: "狀態", width: 80, align: "center" as const },
      { prop: "createdAt", label: "建立時間", width: 150, align: "center" as const },
    ],
    searchFields: ["username", "nickname", "email"],
  };

  // 使用 PageGenerator 生成頁面
  const { PageGenerator } = await import("@/utils/page-generator");
  const generator = new PageGenerator(customConfig);
  const generatedCode = generator.generateVueComponent();

  console.log("生成的自定義頁面代碼：", generatedCode);
  return generatedCode;
}

/**
 * 從API文件自動解析並生成頁面
 */
export function generatePageFromApi(apiFilePath: string) {
  // 這裡可以實現從API文件自動解析的邏輯
  // 讀取API文件，解析接口定義，自動生成頁面配置

  console.log(`從API文件生成頁面: ${apiFilePath}`);

  // 示例：解析設備API文件
  if (apiFilePath.includes("device-api")) {
    return generateDevicePage();
  }

  return "";
}

/**
 * 批量生成頁面
 */
export function generateMultiplePages(apiFiles: string[]) {
  const results = [];

  for (const apiFile of apiFiles) {
    try {
      const generatedCode = generatePageFromApi(apiFile);
      results.push({
        apiFile,
        success: true,
        code: generatedCode,
      });
    } catch (error) {
      results.push({
        apiFile,
        success: false,
        error: (error as Error).message,
      });
    }
  }

  return results;
}

// 如果直接運行此文件，生成設備管理頁面
if (require.main === module) {
  console.log("開始生成頁面...");
  generateDeviceManagementPage();
  console.log("頁面生成完成！");
}
