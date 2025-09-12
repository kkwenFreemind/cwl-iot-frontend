/**
 * 儲存工具類
 * 提供localStorage和sessionStorage操作方法
 */
export class Storage {
  /**
   * localStorage 儲存
   */
  static set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static get<T>(key: string, defaultValue?: T): T {
    const value = localStorage.getItem(key);
    if (!value) return defaultValue as T;

    try {
      return JSON.parse(value);
    } catch {
      // 如果解析失敗，返回原始字串
      return value as unknown as T;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * sessionStorage 儲存
   */
  static sessionSet(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  static sessionGet<T>(key: string, defaultValue?: T): T {
    const value = sessionStorage.getItem(key);
    if (!value) return defaultValue as T;

    try {
      return JSON.parse(value);
    } catch {
      // 如果解析失敗，返回原始字串
      return value as unknown as T;
    }
  }

  static sessionRemove(key: string): void {
    sessionStorage.removeItem(key);
  }
}
