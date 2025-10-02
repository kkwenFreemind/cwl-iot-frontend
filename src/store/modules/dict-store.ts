/**
 * Dictionary Store Module
 *
 * @fileoverview This module provides centralized dictionary data management for the Vue application.
 * It implements caching mechanisms to optimize performance and reduce redundant API calls.
 *
 * @features
 * - Dictionary data caching with persistent storage
 * - Request deduplication to prevent concurrent API calls
 * - Lazy loading of dictionary items
 * - Cache management and cleanup utilities
 *
 * @since 2024
 */

import { store } from "@/store";
import DictAPI, { type DictItemOption } from "@/api/system/dict-api";

/**
 * Dictionary Store - Pinia store for managing dictionary data
 *
 * This store provides a centralized way to manage dictionary data across the application.
 * It implements caching strategies to minimize API calls and improve performance.
 */
export const useDictStore = defineStore("dict", () => {
  /* ========================================
   * State Management
   * ======================================== */

  /**
   * Dictionary data cache with persistent storage
   * Stores dictionary items by their code for quick access
   */
  const dictCache = useStorage<Record<string, DictItemOption[]>>("dict_cache", {});

  /**
   * Request queue to prevent duplicate API calls
   * Maintains ongoing requests to avoid redundant network calls
   */
  const requestQueue: Record<string, Promise<void>> = {};

  /* ========================================
   * Cache Management Methods
   * ======================================== */

  /**
   * Cache dictionary items for future use
   *
   * Stores dictionary data in the persistent cache to avoid repeated API calls.
   * The cached data persists across browser sessions.
   *
   * @param dictCode - The unique dictionary code identifier
   * @param data - Array of dictionary item options to cache
   */
  const cacheDictItems = (dictCode: string, data: DictItemOption[]) => {
    dictCache.value[dictCode] = data;
  };

  /**
   * Load dictionary items with intelligent caching
   *
   * Loads dictionary data from API if not already cached. Implements request
   * deduplication to prevent multiple concurrent requests for the same dictionary.
   * If data exists in cache, returns immediately without making API call.
   *
   * @param dictCode - The unique dictionary code to load
   * @returns Promise that resolves when dictionary items are loaded and cached
   *
   * @example
   * ```typescript
   * await loadDictItems('user_status');
   * const items = getDictItems('user_status');
   * ```
   */
  const loadDictItems = async (dictCode: string) => {
    if (dictCache.value[dictCode]) return;

    // Prevent duplicate requests using request queue
    if (!requestQueue[dictCode]) {
      requestQueue[dictCode] = DictAPI.getDictItems(dictCode).then((data) => {
        cacheDictItems(dictCode, data);
        Reflect.deleteProperty(requestQueue, dictCode);
      });
    }
    await requestQueue[dictCode];
  };

  /* ========================================
   * Data Access Methods
   * ======================================== */

  /**
   * Get dictionary items from cache
   *
   * Retrieves cached dictionary items for the specified code. Returns empty
   * array if dictionary is not found in cache. This method is synchronous
   * and should be used after ensuring data is loaded via loadDictItems.
   *
   * @param dictCode - The dictionary code to retrieve
   * @returns Array of dictionary item options, empty array if not found
   *
   * @example
   * ```typescript
   * // Ensure data is loaded first
   * await loadDictItems('user_status');
   * const statusOptions = getDictItems('user_status');
   * ```
   */
  const getDictItems = (dictCode: string): DictItemOption[] => {
    return dictCache.value[dictCode] || [];
  };

  /* ========================================
   * Cache Maintenance Methods
   * ======================================== */

  /**
   * Remove specific dictionary items from cache
   *
   * Removes cached dictionary data for the specified code. Useful when
   * dictionary data has been updated and needs to be refreshed from API.
   *
   * @param dictCode - The dictionary code to remove from cache
   *
   * @example
   * ```typescript
   * // Remove cached data to force refresh on next access
   * removeDictItem('user_status');
   * await loadDictItems('user_status'); // Will fetch fresh data
   * ```
   */
  const removeDictItem = (dictCode: string) => {
    if (dictCache.value[dictCode]) {
      Reflect.deleteProperty(dictCache.value, dictCode);
    }
  };

  /**
   * Clear entire dictionary cache
   *
   * Removes all cached dictionary data. This will force all subsequent
   * dictionary requests to fetch fresh data from the API. Use sparingly
   * as it defeats the caching optimization.
   *
   * @example
   * ```typescript
   * // Clear all cached dictionaries (e.g., on user logout)
   * clearDictCache();
   * ```
   */
  const clearDictCache = () => {
    dictCache.value = {};
  };

  /* ========================================
   * Public API
   * ======================================== */

  return {
    loadDictItems,
    getDictItems,
    removeDictItem,
    clearDictCache,
  };
});

/**
 * Dictionary Store Hook
 *
 * Provides access to the dictionary store with proper store instance binding.
 * This hook should be used in components and composables to access dictionary
 * functionality while ensuring proper reactivity and store context.
 *
 * @returns Dictionary store instance with all methods and reactive state
 *
 * @example
 * ```typescript
 * // In a Vue component or composable
 * const dictStore = useDictStoreHook();
 * await dictStore.loadDictItems('user_status');
 * const options = dictStore.getDictItems('user_status');
 * ```
 */
export function useDictStoreHook() {
  return useDictStore(store);
}
