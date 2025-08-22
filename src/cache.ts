import { CacheEntry } from './types';

export class CacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Get data from cache if it exists and is not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry has expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, entry);

    // Set timeout to automatically remove expired entry
    setTimeout(() => {
      const currentEntry = this.cache.get(key);
      if (currentEntry && currentEntry.timestamp === entry.timestamp) {
        this.cache.delete(key);
      }
    }, entry.ttl);
  }

  /**
   * Check if key exists in cache and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Generate cache key for conversations by contact ID
   */
  static getConversationsKey(contactId: string, locationId?: string): string {
    return `conversations:${contactId}${locationId ? `:${locationId}` : ''}`;
  }

  /**
   * Generate cache key for messages by conversation ID
   */
  static getMessagesKey(conversationId: string): string {
    return `messages:${conversationId}`;
  }

  /**
   * Generate cache key for message detail by message ID
   */
  static getMessageDetailKey(messageId: string): string {
    return `message_detail:${messageId}`;
  }

  /**
   * Generate cache key for user by user ID
   */
  static getUserKey(userId: string): string {
    return `user:${userId}`;
  }
}

