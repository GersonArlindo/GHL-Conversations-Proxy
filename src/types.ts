// Types for API responses

export interface Conversation {
  id: string;
  locationId: string;
  dateAdded: number;
  dateUpdated: number;
  lastMessageDate: number;
  lastMessageType: string;
  lastMessageBody: string;
  lastOutboundMessageAction: string;
  lastMessageDirection: string;
  inbox: boolean;
  unreadCount: number;
  assignedTo: string;
  lastManualMessageDate: number;
  followers: string[];
  isLastMessageInternalComment: boolean;
  contactId: string;
  fullName: string;
  contactName: string;
  companyName: string | null;
  phone: string;
  tags: string[];
  type: string;
  scoring: any[];
  attributed: boolean;
  email: string | null;
  sort: number[];
}

export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
  traceId: string;
}

export interface Message {
  id: string;
  direction: string;
  type: number;
  locationId: string;
  body?: string;
  contactId: string;
  conversationId: string;
  dateAdded: string;
  source: string;
  messageType: string;
  status?: string;
  userId?: string;
  meta?: {
    call?: {
      duration: number;
      status: string;
    };
  };
  altId?: string;
}

export interface MessagesResponse {
  messages: {
    lastMessageId: string;
    nextPage: boolean;
    messages: Message[];
  };
}

export interface MessageDetail {
  id: string;
  type: number;
  messageType: string;
  locationId: string;
  contactId: string;
  conversationId: string;
  dateAdded: string;
  body?: string;
  direction: string;
  status?: string;
  contentType?: string;
  attachments?: string[];
  meta?: {
    callDuration?: number;
    callStatus?: string;
    email?: {
      email?: {
        messageIds?: string[];
      };
    };
  };
  source?: string;
  userId?: string;
  conversationProviderId?: string;
}

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  extension: string;
  permissions: {
    [key: string]: boolean;
  };
  scopes: string;
  roles: {
    type: string;
    role: string;
    locationIds: string[];
    restrictSubAccount: string;
  };
  lcPhone: {
    locationId: string;
  };
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface ClientConversationsResponse {
  clientId: string;
  conversations: Array<{
    conversation: Conversation;
    messages: Array<{
      message: Message;
      messageDetail?: MessageDetail;
      user?: User;
    }>;
  }>;
  totalConversations: number;
  fetchedAt: string;
}

