"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientConversationsController = void 0;
const apiService_1 = require("./apiService");
const cache_1 = require("./cache");
class ClientConversationsController {
    constructor(authToken) {
        this.apiService = new apiService_1.ApiService(authToken);
        this.cacheService = new cache_1.CacheService();
    }
    /**
     * Main endpoint to get all conversations and related data for a client
     */
    async getClientConversationsDetails(req, res) {
        try {
            const { clientId } = req.params;
            const { locationId } = req.query;
            if (!clientId) {
                res.status(400).json({
                    error: 'Client ID is required',
                    message: 'Please provide a valid clientId parameter'
                });
                return;
            }
            console.log(`Processing request for clientId: ${clientId}`);
            // Step 1: Get conversations for the client
            const conversations = await this.getConversationsWithCache(clientId, locationId);
            if (!conversations || conversations.conversations.length === 0) {
                res.status(404).json({
                    error: 'No conversations found',
                    message: `No conversations found for clientId: ${clientId}`,
                    clientId,
                    totalConversations: 0
                });
                return;
            }
            // Step 2: Process each conversation to get messages and details
            const conversationsWithDetails = await Promise.all(conversations.conversations.map(async (conversation) => {
                try {
                    // Get messages for this conversation
                    const messages = await this.getMessagesWithCache(conversation.id);
                    // Process each message to get details and user info
                    const messagesWithDetails = await Promise.all(messages.messages.messages.map(async (message) => {
                        try {
                            // Get message detail
                            const messageDetail = await this.getMessageDetailWithCache(message.id);
                            // Get user info if userId exists in message detail
                            let user;
                            if (messageDetail.userId) {
                                user = await this.getUserWithCache(messageDetail.userId);
                            }
                            return {
                                message,
                                messageDetail,
                                user
                            };
                        }
                        catch (error) {
                            console.error(`Error processing message ${message.id}:`, error);
                            // Return message without details if there's an error
                            return {
                                message,
                                messageDetail: undefined,
                                user: undefined
                            };
                        }
                    }));
                    return {
                        conversation,
                        messages: messagesWithDetails
                    };
                }
                catch (error) {
                    console.error(`Error processing conversation ${conversation.id}:`, error);
                    // Return conversation without messages if there's an error
                    return {
                        conversation,
                        messages: []
                    };
                }
            }));
            // Step 3: Build response
            const response = {
                clientId,
                conversations: conversationsWithDetails,
                totalConversations: conversations.total,
                fetchedAt: new Date().toISOString()
            };
            console.log(`Successfully processed ${response.conversations.length} conversations for clientId: ${clientId}`);
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error in getClientConversationsDetails:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                clientId: req.params.clientId
            });
        }
    }
    /**
     * Get conversations with caching
     */
    async getConversationsWithCache(contactId, locationId) {
        const cacheKey = cache_1.CacheService.getConversationsKey(contactId, locationId);
        // Try to get from cache first
        let conversations = this.cacheService.get(cacheKey);
        if (conversations) {
            console.log(`Cache hit for conversations: ${cacheKey}`);
            return conversations;
        }
        // Cache miss, fetch from API
        console.log(`Cache miss for conversations: ${cacheKey}, fetching from API`);
        conversations = await this.apiService.getConversations(contactId, locationId);
        // Store in cache
        this.cacheService.set(cacheKey, conversations);
        return conversations;
    }
    /**
     * Get messages with caching
     */
    async getMessagesWithCache(conversationId) {
        const cacheKey = cache_1.CacheService.getMessagesKey(conversationId);
        // Try to get from cache first
        let messages = this.cacheService.get(cacheKey);
        if (messages) {
            console.log(`Cache hit for messages: ${cacheKey}`);
            return messages;
        }
        // Cache miss, fetch from API
        console.log(`Cache miss for messages: ${cacheKey}, fetching from API`);
        messages = await this.apiService.getMessages(conversationId);
        // Store in cache
        this.cacheService.set(cacheKey, messages);
        return messages;
    }
    /**
     * Get message detail with caching
     */
    async getMessageDetailWithCache(messageId) {
        const cacheKey = cache_1.CacheService.getMessageDetailKey(messageId);
        // Try to get from cache first
        let messageDetail = this.cacheService.get(cacheKey);
        if (messageDetail) {
            console.log(`Cache hit for message detail: ${cacheKey}`);
            return messageDetail;
        }
        // Cache miss, fetch from API
        console.log(`Cache miss for message detail: ${cacheKey}, fetching from API`);
        messageDetail = await this.apiService.getMessageDetail(messageId);
        // Store in cache
        this.cacheService.set(cacheKey, messageDetail);
        return messageDetail;
    }
    /**
     * Get user with caching
     */
    async getUserWithCache(userId) {
        const cacheKey = cache_1.CacheService.getUserKey(userId);
        // Try to get from cache first
        let user = this.cacheService.get(cacheKey);
        if (user) {
            console.log(`Cache hit for user: ${cacheKey}`);
            return user;
        }
        // Cache miss, fetch from API
        console.log(`Cache miss for user: ${cacheKey}, fetching from API`);
        user = await this.apiService.getUser(userId);
        // Store in cache with longer TTL for user data (10 minutes)
        this.cacheService.set(cacheKey, user, 10 * 60 * 1000);
        return user;
    }
    /**
     * Get cache statistics (for debugging/monitoring)
     */
    getCacheStats(req, res) {
        const stats = this.cacheService.getStats();
        res.status(200).json({
            cache: stats,
            timestamp: new Date().toISOString()
        });
    }
    /**
     * Clear cache (for debugging/maintenance)
     */
    clearCache(req, res) {
        this.cacheService.clear();
        res.status(200).json({
            message: 'Cache cleared successfully',
            timestamp: new Date().toISOString()
        });
    }
    /**
     * Update auth token
     */
    updateAuthToken(req, res) {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({
                error: 'Token is required',
                message: 'Please provide a valid token in the request body'
            });
            return;
        }
        this.apiService.updateAuthToken(token);
        res.status(200).json({
            message: 'Auth token updated successfully',
            timestamp: new Date().toISOString()
        });
    }
}
exports.ClientConversationsController = ClientConversationsController;
//# sourceMappingURL=controller.js.map