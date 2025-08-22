export declare class CacheService {
    private cache;
    private defaultTTL;
    /**
     * Get data from cache if it exists and is not expired
     */
    get<T>(key: string): T | null;
    /**
     * Set data in cache with optional TTL
     */
    set<T>(key: string, data: T, ttl?: number): void;
    /**
     * Check if key exists in cache and is not expired
     */
    has(key: string): boolean;
    /**
     * Clear all cache entries
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        keys: string[];
    };
    /**
     * Generate cache key for conversations by contact ID
     */
    static getConversationsKey(contactId: string, locationId?: string): string;
    /**
     * Generate cache key for messages by conversation ID
     */
    static getMessagesKey(conversationId: string): string;
    /**
     * Generate cache key for message detail by message ID
     */
    static getMessageDetailKey(messageId: string): string;
    /**
     * Generate cache key for user by user ID
     */
    static getUserKey(userId: string): string;
}
//# sourceMappingURL=cache.d.ts.map