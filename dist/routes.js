"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = createRoutes;
const express_1 = require("express");
const controller_1 = require("./controller");
function createRoutes(authToken) {
    const router = (0, express_1.Router)();
    const controller = new controller_1.ClientConversationsController(authToken);
    // Main endpoint to get client conversations with all details
    router.get('/client/:clientId/conversations-details', controller.getClientConversationsDetails.bind(controller));
    // Utility endpoints for cache management and debugging
    router.get('/cache/stats', controller.getCacheStats.bind(controller));
    router.delete('/cache', controller.clearCache.bind(controller));
    // Endpoint to update auth token
    router.put('/auth/token', controller.updateAuthToken.bind(controller));
    return router;
}
//# sourceMappingURL=routes.js.map