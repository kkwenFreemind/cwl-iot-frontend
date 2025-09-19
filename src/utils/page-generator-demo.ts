/**
 * 頁面生成器演示
 * 展示如何使用通用頁面生成器創建CRUD頁面
 */

import { generateDevicePage, PageGenerator, createDevicePageConfig } from "@/utils/page-generator";

/**
 * 演示：生成設備管理頁面
 */
export function demoGenerateDevicePage() {
  console.log("=== 設備管理頁面生成演示 ===");

  // 方法1：使用預定義配置
  const generatedCode1 = generateDevicePage();
  console.log("方法1生成的代碼長度:", generatedCode1.length);
  console.log("前200個字符:", generatedCode1.substring(0, 200));

  // 方法2：自定義配置
  const customConfig = createDevicePageConfig();
  // 可以修改配置
  customConfig.title = "自定義設備管理";
  customConfig.searchFields = ["deviceName", "location"];

  const generator = new PageGenerator(customConfig);
  const generatedCode2 = generator.generateVueComponent();
  console.log("方法2生成的代碼長度:", generatedCode2.length);

  return {
    method1: generatedCode1,
    method2: generatedCode2,
  };
}

/**
 * 演示：從API文件解析生成頁面
 */
export function demoApiParsing() {
  console.log("=== API文件解析演示 ===");

  // 模擬API文件內容
  const mockApiContent = `
    interface UserAPI {
      listUsers(params: { pageNum: number; pageSize: number; keywords?: string }): Promise<UserVO[]>;
      createUser(data: UserForm): Promise<void>;
      updateUser(id: string, data: UserForm): Promise<void>;
      deleteUser(id: string): Promise<void>;
    }

    interface UserVO {
      userId: string;
      username: string;
      nickname: string;
      email: string;
      status: 'ACTIVE' | 'INACTIVE';
      createdAt: string;
    }

    interface UserForm {
      username: string;
      nickname: string;
      email: string;
      status: string;
    }
  `;

  console.log("解析API內容:", mockApiContent.substring(0, 100) + "...");

  // 在實際實現中，這裡會解析API內容並生成配置
  // 現在只是返回模擬結果
  return {
    parsed: true,
    apiContent: mockApiContent,
    message: "API解析功能需要在後端實現",
  };
}

/**
 * 演示：批量生成多個頁面
 */
export function demoBatchGeneration() {
  console.log("=== 批量生成演示 ===");

  const apiFiles = ["device-api.ts", "user-api.ts", "role-api.ts", "menu-api.ts"];

  console.log("需要生成的API文件:", apiFiles);

  // 模擬批量生成結果
  const results = apiFiles.map((apiFile) => ({
    apiFile,
    success: Math.random() > 0.2, // 80% 成功率
    codeLength: Math.floor(Math.random() * 10000) + 5000,
    message: Math.random() > 0.2 ? "生成成功" : "解析失敗",
  }));

  console.log("批量生成結果:", results);

  return results;
}

/**
 * 運行所有演示
 */
export function runAllDemos() {
  console.log("🚀 開始運行頁面生成器演示\n");

  // 演示1：生成設備頁面
  const deviceResults = demoGenerateDevicePage();
  console.log("✅ 設備頁面生成演示完成\n");

  // 演示2：API解析
  const apiResults = demoApiParsing();
  console.log("✅ API解析演示完成\n");

  // 演示3：批量生成
  const batchResults = demoBatchGeneration();
  console.log("✅ 批量生成演示完成\n");

  console.log("🎉 所有演示完成！");

  return {
    deviceResults,
    apiResults,
    batchResults,
  };
}

// 在開發環境中運行演示
if (import.meta.env.DEV) {
  // 可以取消註釋來運行演示
  // runAllDemos();
}
