import { Request, Response } from 'express';
import { ApiService } from './apiService';
import { CacheService } from './cache';
import {
  ConversationsResponse,
  MessagesResponse,
  MessageDetail,
  User,
  ClientConversationsResponse,
  Message
} from './types';

export class ClientConversationsController {
  private apiService: ApiService;
  private cacheService: CacheService;

  constructor() {
    this.apiService = new ApiService(); // No token here
    this.cacheService = new CacheService();
  }

  /**
   * Main endpoint to get all conversations and related data for a client
   */
  async getClientConversationsDetails(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const { locationId } = req.query;
      const authToken = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

      if (!authToken) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authorization token is required in the header'
        });
        return;
      }

      // Update the API service with the new token for this request
      this.apiService.updateAuthToken(authToken);

      if (!clientId) {
        res.status(400).json({
          error: 'Client ID is required',
          message: 'Please provide a valid clientId parameter'
        });
        return;
      }

      console.log(`Processing request for clientId: ${clientId}`);

      // Step 1: Get conversations for the client
      const conversations = await this.getConversationsWithCache(
        clientId,
        locationId as string
      );

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
      const conversationsWithDetails = await Promise.all(
        conversations.conversations.map(async (conversation) => {
          try {
            // Get messages for this conversation
            const messages = await this.getMessagesWithCache(conversation.id);

            // Process each message to get details and user info
            const messagesWithDetails = await Promise.all(
              messages.messages.messages.map(async (message) => {
                try {
                  // Get message detail
                  const messageDetail: any = await this.getMessageDetailWithCache(message.id);

                  // Get user info if userId exists in message detail
                  let user: User | undefined;
                  if (messageDetail?.message?.userId) {
                    user = await this.getUserWithCache(messageDetail.message.userId);
                  }

                  // Get recording if it's a call
                  let recording: string | undefined;
                  if (message.messageType === 'TYPE_CALL') {
                    try {
                      recording = await this.getRecordingWithCache(message.id, message.locationId);
                    } catch (error) {
                      //console.warn(`No recording available for message ${message.id}:`, error);
                    }
                  }

                  return {
                    message,
                    messageDetail,
                    user,
                    recording
                  };
                } catch (error) {
                  console.error(`Error processing message ${message.id}:`, error);
                  // Return message without details if there's an error
                  return {
                    message,
                    messageDetail: undefined,
                    user: undefined,
                    recording: undefined
                  };
                }
              })
            );

            return {
              conversation,
              messages: messagesWithDetails
            };
          } catch (error) {
            console.error(`Error processing conversation ${conversation.id}:`, error);
            // Return conversation without messages if there's an error
            return {
              conversation,
              messages: []
            };
          }
        })
      );

      // Step 3: Build response
      const response: ClientConversationsResponse = {
        clientId,
        conversations: conversationsWithDetails,
        totalConversations: conversations.total,
        fetchedAt: new Date().toISOString()
      };

      console.log(`Successfully processed ${response.conversations.length} conversations for clientId: ${clientId}`);

      res.status(200).json(response);

    } catch (error) {
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
  private async getConversationsWithCache(
    contactId: string,
    locationId?: string
  ): Promise<ConversationsResponse> {
    const cacheKey = CacheService.getConversationsKey(contactId, locationId);

    // Try to get from cache first
    let conversations = this.cacheService.get<ConversationsResponse>(cacheKey);

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
  private async getMessagesWithCache(conversationId: string): Promise<MessagesResponse> {
    const cacheKey = CacheService.getMessagesKey(conversationId);

    // Try to get from cache first
    let messages = this.cacheService.get<MessagesResponse>(cacheKey);

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
  private async getMessageDetailWithCache(messageId: string): Promise<MessageDetail> {
    const cacheKey = CacheService.getMessageDetailKey(messageId);

    // Try to get from cache first
    let messageDetail = this.cacheService.get<MessageDetail>(cacheKey);

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
  private async getUserWithCache(userId: string): Promise<any> {
    const cacheKey = CacheService.getUserKey(userId);

    // Try to get from cache first
    let user = this.cacheService.get<User>(cacheKey);

    if (user) {
      console.log(`Cache hit for user: ${cacheKey}`);
      return user;
    }

    try {
      console.log(`Cache miss for user: ${cacheKey}, fetching from API`);
      user = await this.apiService.getUser(userId);
      this.cacheService.set(cacheKey, user, 10 * 60 * 1000);
      return user;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`User ${userId} not found (404). Skipping.`);
      } else if (error.response?.status === 401) {
        console.warn(`Unauthorized to fetch user ${userId}. Skipping.`);
      } else {
        console.error(`Unexpected error fetching user ${userId}:`, error.message || error);
      }
      return undefined;
    }
  }

  /**
 * Get recording with caching
 */
  private async getRecordingWithCache(messageId: string, locationId: string): Promise<string> {
    const cacheKey = `recording:${messageId}:${locationId}`;

    // Try to get from cache first
    let recording = this.cacheService.get<string>(cacheKey);

    if (recording) {
      console.log(`Cache hit for recording: ${cacheKey}`);
      return recording;
    }

    // Cache miss, fetch from API
    console.log(`Cache miss for recording: ${cacheKey}, fetching from API`);
    recording = await this.apiService.getRecording(messageId, locationId);

    // Store in cache (las grabaciones pueden ser grandes, considera un TTL más corto)
    this.cacheService.set(cacheKey, recording, 30 * 60 * 1000); // 30 minutos

    return recording;
  }

  /**
   * Get cache statistics (for debugging/monitoring)
   */
  getCacheStats(req: Request, res: Response): void {
    const stats = this.cacheService.getStats();
    res.status(200).json({
      cache: stats,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Clear cache (for debugging/maintenance)
   */
  clearCache(req: Request, res: Response): void {
    this.cacheService.clear();
    res.status(200).json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Update auth token
   */
  updateAuthToken(req: Request, res: Response): void {
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