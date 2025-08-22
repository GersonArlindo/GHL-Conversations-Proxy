"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const axios_1 = __importDefault(require("axios"));
class ApiService {
    constructor(authToken, version = '2021-04-15') {
        this.authToken = authToken;
        this.version = version;
        this.baseURL = 'https://services.leadconnectorhq.com';
        this.axiosInstance = axios_1.default.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Version': this.version,
                'Accept': 'application/json'
            },
            timeout: 30000 // 30 seconds timeout
        });
    }
    /**
     * Search conversations by contact ID
     */
    async getConversations(contactId, locationId) {
        try {
            const params = { contactId };
            if (locationId) {
                params.locationId = locationId;
            }
            const response = await this.axiosInstance.get('/conversations/search', { params });
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching conversations for contactId ${contactId}:`, error);
            throw new Error(`Failed to fetch conversations: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get messages for a specific conversation
     */
    async getMessages(conversationId) {
        try {
            const response = await this.axiosInstance.get(`/conversations/${conversationId}/messages`);
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching messages for conversationId ${conversationId}:`, error);
            throw new Error(`Failed to fetch messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get detailed information for a specific message
     */
    async getMessageDetail(messageId) {
        try {
            const response = await this.axiosInstance.get(`/conversations/messages/${messageId}`);
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching message detail for messageId ${messageId}:`, error);
            throw new Error(`Failed to fetch message detail: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get user information by user ID
     */
    async getUser(userId) {
        try {
            // User endpoint uses a different version
            const response = await this.axiosInstance.get(`/users/${userId}`, {
                headers: {
                    'Version': '2021-07-28' // Different version for user endpoint
                }
            });
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching user for userId ${userId}:`, error);
            throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Update auth token
     */
    updateAuthToken(newToken) {
        this.authToken = newToken;
        this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${newToken}`;
    }
    /**
     * Get current auth token (for debugging purposes)
     */
    getAuthToken() {
        return this.authToken;
    }
}
exports.ApiService = ApiService;
//# sourceMappingURL=apiService.js.map