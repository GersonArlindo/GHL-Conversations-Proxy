import { Router } from 'express';
import { ClientConversationsController } from './controller';

export function createRoutes(): Router {
  const router = Router();
  const controller = new ClientConversationsController();

  // Main endpoint to get client conversations with all details
  router.get('/client/:clientId/conversations-details',
    controller.getClientConversationsDetails.bind(controller)
  );

  // Utility endpoints for cache management and debugging
  router.get('/cache/stats',
    controller.getCacheStats.bind(controller)
  );

  router.delete('/cache',
    controller.clearCache.bind(controller)
  );

  // Endpoint to update auth token
  router.put('/api/auth/token',
    controller.updateAuthToken.bind(controller)
  );

  return router;
}

