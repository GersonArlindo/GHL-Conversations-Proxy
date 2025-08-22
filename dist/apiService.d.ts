import { ConversationsResponse, MessagesResponse, MessageDetail, User } from './types';
export declare class ApiService {
    private authToken;
    private version;
    private axiosInstance;
    private baseURL;
    constructor(authToken: string, version?: string);
    /**
     * Search conversations by contact ID
     */
    getConversations(contactId: string, locationId?: string): Promise<ConversationsResponse>;
    /**
     * Get messages for a specific conversation
     */
    getMessages(conversationId: string): Promise<MessagesResponse>;
    /**
     * Get detailed information for a specific message
     */
    getMessageDetail(messageId: string): Promise<MessageDetail>;
    /**
     * Get user information by user ID
     */
    getUser(userId: string): Promise<User>;
    /**
     * Update auth token
     */
    updateAuthToken(newToken: string): void;
    /**
     * Get current auth token (for debugging purposes)
     */
    getAuthToken(): string;
}
//# sourceMappingURL=apiService.d.ts.map