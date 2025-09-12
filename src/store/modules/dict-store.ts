import { store } from "@/store";
import DictAPI, { type DictItemOption } from "@/api/system/dict-api";

export const useDictStore = defineStore("dict", () => {
  // 字典資料快取
  const dictCache = useStorage<Record<string, DictItemOption[]>>("dict_cache", {});

  // 請求佇列（防止重複請求）
  const requestQueue: Record<string, Promise<void>> = {};

  /**
   * 快取字典資料
   * @param dictCode 字典編碼
   * @param data 字典項列表
   */
  const cacheDictItems = (dictCode: string, data: DictItemOption[]) => {
    dictCache.value[dictCode] = data;
  };

  /**
   * 載入字典資料（如果快取中沒有則請求）
   * @param dictCode 字典編碼
   */
  const loadDictItems = async (dictCode: string) => {
    if (dictCache.value[dictCode]) return;
    // 防止重複請求
    if (!requestQueue[dictCode]) {
      requestQueue[dictCode] = DictAPI.getDictItems(dictCode).then((data) => {
        cacheDictItems(dictCode, data);
        Reflect.deleteProperty(requestQueue, dictCode);
      });
    }
    await requestQueue[dictCode];
  };

  /**
   * 獲取字典項列表
   * @param dictCode 字典編碼
   * @returns 字典項列表
   */
  const getDictItems = (dictCode: string): DictItemOption[] => {
    return dictCache.value[dictCode] || [];
  };

  /**
   * 移除指定字典項
   * @param dictCode 字典編碼
   */
  const removeDictItem = (dictCode: string) => {
    if (dictCache.value[dictCode]) {
      Reflect.deleteProperty(dictCache.value, dictCode);
    }
  };

  /**
   * 清空字典快取
   */
  const clearDictCache = () => {
    dictCache.value = {};
  };

  return {
    loadDictItems,
    getDictItems,
    removeDictItem,
    clearDictCache,
  };
});

export function useDictStoreHook() {
  return useDictStore(store);
}
