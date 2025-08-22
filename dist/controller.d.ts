import { Request, Response } from 'express';
export declare class ClientConversationsController {
    private apiService;
    private cacheService;
    constructor(authToken: string);
    /**
     * Main endpoint to get all conversations and related data for a client
     */
    getClientConversationsDetails(req: Request, res: Response): Promise<void>;
    /**
     * Get conversations with caching
     */
    private getConversationsWithCache;
    /**
     * Get messages with caching
     */
    private getMessagesWithCache;
    /**
     * Get message detail with caching
     */
    private getMessageDetailWithCache;
    /**
     * Get user with caching
     */
    private getUserWithCache;
    /**
     * Get cache statistics (for debugging/monitoring)
     */
    getCacheStats(req: Request, res: Response): void;
    /**
     * Clear cache (for debugging/maintenance)
     */
    clearCache(req: Request, res: Response): void;
    /**
     * Update auth token
     */
    updateAuthToken(req: Request, res: Response): void;
}
//# sourceMappingURL=controller.d.ts.map