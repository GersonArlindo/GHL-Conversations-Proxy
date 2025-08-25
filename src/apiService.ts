import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ConversationsResponse, MessagesResponse, MessageDetail, User } from './types';

export class ApiService {
  private axiosInstance: AxiosInstance;
  private baseURL = 'https://services.leadconnectorhq.com';
  private currentAuthToken: string | undefined;

  constructor(initialAuthToken?: string, private version: string = '2021-04-15') {
    this.currentAuthToken = initialAuthToken;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Version': this.version,
        'Accept': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    this.setAuthorizationHeader(this.currentAuthToken);
  }

  private setAuthorizationHeader(token?: string): void {
    if (token) {
      this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers['Authorization'];
    }
  }

  /**
   * Update auth token for the instance
   */
  updateAuthToken(newToken: string): void {
    this.currentAuthToken = newToken;
    this.setAuthorizationHeader(newToken);
  }

  /**
   * Search conversations by contact ID
   */
  async getConversations(contactId: string, locationId?: string): Promise<ConversationsResponse> {
    try {
      const params: any = { contactId };
      if (locationId) {
        params.locationId = locationId;
      }

      const response: AxiosResponse<ConversationsResponse> = await this.axiosInstance.get(
        '/conversations/search',
        { params }
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching conversations for contactId ${contactId}:`, error);
      throw new Error(`Failed to fetch conversations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get messages for a specific conversation
   */
  async getMessages(conversationId: string): Promise<MessagesResponse> {
    try {
      const params: any = { limit: '50' };
      const response: AxiosResponse<MessagesResponse> = await this.axiosInstance.get(
        `/conversations/${conversationId}/messages`,
        { params }
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching messages for conversationId ${conversationId}:`, error);
      throw new Error(`Failed to fetch messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get detailed information for a specific message
   */
  async getMessageDetail(messageId: string): Promise<MessageDetail> {
    try {
      const response: AxiosResponse<MessageDetail> = await this.axiosInstance.get(
        `/conversations/messages/${messageId}`
      );

      return response.data;
    } catch (error) {
      console.error(`Error fetching message detail for messageId ${messageId}:`, error);
      throw new Error(`Failed to fetch message detail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user information by user ID
   */
  async getUser(userId: string): Promise<User> {
    try {
      // User endpoint uses a different version
      const response: AxiosResponse<User> = await this.axiosInstance.get(
        `/users/${userId}`,
        {
          headers: {
            'Version': '2021-07-28' // Different version for user endpoint
          }
        }
      );

      return response.data;
    } catch (error) {
      //console.error(`Error fetching user for userId ${userId}:`, error);
      throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
 * Get recording for a specific message
 */
  async getRecording(messageId: string, locationId: string): Promise<string> {
    try {
      const url = `/conversations/messages/${messageId}/locations/${locationId}/recording`;

      const response = await this.axiosInstance.get(url, {
        headers: {
          'Accept': 'audio/wav'
        },
        responseType: 'arraybuffer'
      });

      // Convertir a base64 para el frontend
      const base64 = Buffer.from(response.data, 'binary').toString('base64');
      return `data:audio/wav;base64,${base64}`;
    } catch (error) {
      //console.error(`Error fetching recording for messageId ${messageId}:`, error);
      throw new Error(`Failed to fetch recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current auth token (for debugging purposes)
   */
  getAuthToken(): string | undefined {
    return this.currentAuthToken;
  }
}

