/**
 * Image Cache Service
 * Handles image caching, preloading, and optimization using FastImage
 */

import FastImage, { Source, Priority, ResizeMode } from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TYPES
// ============================================

export interface ImageCacheConfig {
  maxAge?: number; // Max cache age in milliseconds
  priority?: Priority;
}

export interface CachedImageInfo {
  uri: string;
  cachedAt: number;
  size?: { width: number; height: number };
}

export type ImagePriority = 'low' | 'normal' | 'high';

// ============================================
// CONSTANTS
// ============================================

const CACHE_INDEX_KEY = '@carebow/image_cache_index';
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_SIZE = 100; // Maximum number of cached image entries

// ============================================
// IMAGE CACHE SERVICE
// ============================================

class ImageCacheServiceClass {
  private cacheIndex: Map<string, CachedImageInfo> = new Map();
  private initialized = false;

  /**
   * Initialize the cache service
   * Loads cache index from storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const indexData = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (indexData) {
        const entries: [string, CachedImageInfo][] = JSON.parse(indexData);
        this.cacheIndex = new Map(entries);

        // Clean up expired entries
        await this.cleanupExpired();
      }

      this.initialized = true;

      if (__DEV__) {
        console.log('[ImageCache] Initialized with', this.cacheIndex.size, 'cached entries');
      }
    } catch (error) {
      console.error('[ImageCache] Initialization failed:', error);
      this.cacheIndex = new Map();
      this.initialized = true;
    }
  }

  /**
   * Get FastImage source with caching configuration
   */
  getSource(
    uri: string,
    options: ImageCacheConfig = {}
  ): Source {
    const { priority = FastImage.priority.normal } = options;

    return {
      uri,
      priority,
      cache: FastImage.cacheControl.immutable,
    };
  }

  /**
   * Preload images for faster display
   */
  async preload(uris: string[], priority: ImagePriority = 'normal'): Promise<void> {
    if (uris.length === 0) return;

    const fastImagePriority = this.mapPriority(priority);
    const sources: Source[] = uris.map((uri) => ({
      uri,
      priority: fastImagePriority,
    }));

    try {
      await FastImage.preload(sources);

      // Update cache index
      const now = Date.now();
      uris.forEach((uri) => {
        this.cacheIndex.set(uri, { uri, cachedAt: now });
      });
      await this.persistIndex();

      if (__DEV__) {
        console.log('[ImageCache] Preloaded', uris.length, 'images');
      }
    } catch (error) {
      console.error('[ImageCache] Preload failed:', error);
    }
  }

  /**
   * Preload a single image
   */
  async preloadOne(uri: string, priority: ImagePriority = 'normal'): Promise<void> {
    return this.preload([uri], priority);
  }

  /**
   * Check if an image is cached
   */
  isCached(uri: string, maxAge: number = DEFAULT_MAX_AGE): boolean {
    const entry = this.cacheIndex.get(uri);
    if (!entry) return false;

    const age = Date.now() - entry.cachedAt;
    return age < maxAge;
  }

  /**
   * Clear a specific image from cache
   */
  async clearImage(uri: string): Promise<void> {
    this.cacheIndex.delete(uri);
    await this.persistIndex();
  }

  /**
   * Clear all cached images
   */
  async clearAll(): Promise<void> {
    try {
      await FastImage.clearMemoryCache();
      await FastImage.clearDiskCache();
      this.cacheIndex.clear();
      await this.persistIndex();

      if (__DEV__) {
        console.log('[ImageCache] Cache cleared');
      }
    } catch (error) {
      console.error('[ImageCache] Clear failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { count: number; oldestEntry: number | null } {
    let oldestEntry: number | null = null;

    this.cacheIndex.forEach((entry) => {
      if (oldestEntry === null || entry.cachedAt < oldestEntry) {
        oldestEntry = entry.cachedAt;
      }
    });

    return {
      count: this.cacheIndex.size,
      oldestEntry,
    };
  }

  /**
   * Clean up expired cache entries
   */
  private async cleanupExpired(maxAge: number = DEFAULT_MAX_AGE): Promise<void> {
    const now = Date.now();
    let removed = 0;

    this.cacheIndex.forEach((entry, key) => {
      if (now - entry.cachedAt > maxAge) {
        this.cacheIndex.delete(key);
        removed++;
      }
    });

    // Enforce max cache size (LRU eviction)
    if (this.cacheIndex.size > MAX_CACHE_SIZE) {
      const entries = Array.from(this.cacheIndex.entries())
        .sort((a, b) => a[1].cachedAt - b[1].cachedAt);

      const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => {
        this.cacheIndex.delete(key);
        removed++;
      });
    }

    if (removed > 0) {
      await this.persistIndex();
      if (__DEV__) {
        console.log('[ImageCache] Cleaned up', removed, 'expired entries');
      }
    }
  }

  /**
   * Persist cache index to storage
   */
  private async persistIndex(): Promise<void> {
    try {
      const entries = Array.from(this.cacheIndex.entries());
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('[ImageCache] Failed to persist index:', error);
    }
  }

  /**
   * Map priority string to FastImage priority
   */
  private mapPriority(priority: ImagePriority): Priority {
    switch (priority) {
      case 'high':
        return FastImage.priority.high;
      case 'low':
        return FastImage.priority.low;
      default:
        return FastImage.priority.normal;
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const ImageCacheService = new ImageCacheServiceClass();

// ============================================
// CONVENIENCE EXPORTS
// ============================================

export const preloadImages = (uris: string[], priority?: ImagePriority) =>
  ImageCacheService.preload(uris, priority);

export const preloadImage = (uri: string, priority?: ImagePriority) =>
  ImageCacheService.preloadOne(uri, priority);

export const clearImageCache = () => ImageCacheService.clearAll();

export default ImageCacheService;
