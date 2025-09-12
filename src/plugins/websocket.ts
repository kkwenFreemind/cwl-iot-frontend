import { useDictSync } from "@/composables/useDictSync";
import { AuthStorage } from "@/utils/auth";
// 不直接匯入 store 或 userStore

// 全域性 WebSocket 例項管理
const websocketInstances = new Map<string, any>();

// 用於防止重複初始化的狀態標記
let isInitialized = false;
let dictWebSocketInstance: ReturnType<typeof useDictSync> | null = null;

/**
 * 註冊 WebSocket 例項
 */
export function registerWebSocketInstance(key: string, instance: any) {
  websocketInstances.set(key, instance);
  console.log(`[WebSocketPlugin] Registered WebSocket instance: ${key}`);
}

/**
 * 獲取 WebSocket 例項
 */
export function getWebSocketInstance(key: string) {
  return websocketInstances.get(key);
}

/**
 * 初始化WebSocket服務
 */
export function setupWebSocket() {
  console.log("[WebSocketPlugin] 開始初始化WebSocket服務...");

  // 檢查是否已經初始化
  if (isInitialized) {
    console.log("[WebSocketPlugin] WebSocket服務已經初始化,跳過重複初始化");
    return;
  }

  // 檢查環境變數是否配置
  const wsEndpoint = import.meta.env.VITE_APP_WS_ENDPOINT;
  if (!wsEndpoint) {
    console.log("[WebSocketPlugin] 未配置WebSocket端點,跳過WebSocket初始化");
    return;
  }

  // 檢查是否已登入（基於是否存在訪問令牌）
  if (!AuthStorage.getAccessToken()) {
    console.warn(
      "[WebSocketPlugin] 未找到訪問令牌，WebSocket初始化已跳過。使用者登入後將自動重新連線。"
    );
    return;
  }

  try {
    // 延遲初始化，確保應用完全啟動
    setTimeout(() => {
      // 儲存例項引用
      dictWebSocketInstance = useDictSync();
      registerWebSocketInstance("dictSync", dictWebSocketInstance);

      // 初始化字典WebSocket服務
      dictWebSocketInstance.initWebSocket();
      console.log("[WebSocketPlugin] 字典WebSocket初始化完成");

      // 初始化線上使用者計數WebSocket
      import("@/composables/useOnlineCount").then(({ useOnlineCount }) => {
        const onlineCountInstance = useOnlineCount({ autoInit: false });
        onlineCountInstance.initWebSocket();
        console.log("[WebSocketPlugin] 線上使用者計數WebSocket初始化完成");
      });

      // 在視窗關閉前斷開WebSocket連線
      window.addEventListener("beforeunload", handleWindowClose);

      console.log("[WebSocketPlugin] WebSocket服務初始化完成");
      isInitialized = true;
    }, 1000); // 延遲1秒初始化
  } catch (error) {
    console.error("[WebSocketPlugin] 初始化WebSocket服務失敗:", error);
  }
}

/**
 * 處理視窗關閉
 */
function handleWindowClose() {
  console.log("[WebSocketPlugin] 視窗即將關閉，斷開WebSocket連線");
  cleanupWebSocket();
}

/**
 * 清理WebSocket連線
 */
export function cleanupWebSocket() {
  // 清理字典 WebSocket
  if (dictWebSocketInstance) {
    try {
      dictWebSocketInstance.closeWebSocket();
      console.log("[WebSocketPlugin] 字典WebSocket連線已斷開");
    } catch (error) {
      console.error("[WebSocketPlugin] 斷開字典WebSocket連線失敗:", error);
    }
  }

  // 清理所有註冊的 WebSocket 例項
  websocketInstances.forEach((instance, key) => {
    try {
      if (instance && typeof instance.disconnect === "function") {
        instance.disconnect();
        console.log(`[WebSocketPlugin] ${key} WebSocket連線已斷開`);
      } else if (instance && typeof instance.closeWebSocket === "function") {
        instance.closeWebSocket();
        console.log(`[WebSocketPlugin] ${key} WebSocket連線已斷開`);
      }
    } catch (error) {
      console.error(`[WebSocketPlugin] 斷開 ${key} WebSocket連線失敗:`, error);
    }
  });

  // 清空例項對映
  websocketInstances.clear();

  // 移除事件監聽器
  window.removeEventListener("beforeunload", handleWindowClose);

  // 重置狀態
  dictWebSocketInstance = null;
  isInitialized = false;
}

/**
 * 重新初始化WebSocket（用於登入後重連）
 */
export function reinitializeWebSocket() {
  // 先清理現有連線
  cleanupWebSocket();

  // 延遲後重新初始化
  setTimeout(() => {
    setupWebSocket();
  }, 500);
}
