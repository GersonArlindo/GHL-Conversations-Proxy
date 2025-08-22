"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
class CacheService {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
    }
    /**
     * Get data from cache if it exists and is not expired
     */
    get(key) {
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
        return entry.data;
    }
    /**
     * Set data in cache with optional TTL
     */
    set(key, data, ttl) {
        const entry = {
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
    has(key) {
        return this.get(key) !== null;
    }
    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
    /**
     * Generate cache key for conversations by contact ID
     */
    static getConversationsKey(contactId, locationId) {
        return `conversations:${contactId}${locationId ? `:${locationId}` : ''}`;
    }
    /**
     * Generate cache key for messages by conversation ID
     */
    static getMessagesKey(conversationId) {
        return `messages:${conversationId}`;
    }
    /**
     * Generate cache key for message detail by message ID
     */
    static getMessageDetailKey(messageId) {
        return `message_detail:${messageId}`;
    }
    /**
     * Generate cache key for user by user ID
     */
    static getUserKey(userId) {
        return `user:${userId}`;
    }
}
exports.CacheService = CacheService;
//# sourceMappingURL=cache.js.map