import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createRoutes } from './routes';

export function createApp(): Application {
  const app: Application = express();

  // Middleware
  app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Version']
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
  });

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Client Conversations Controller',
      version: '1.0.0'
    });
  });

  // API routes
  app.use('/api', createRoutes());

  // Root endpoint with API documentation
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      service: 'Client Conversations Controller',
      version: '1.0.0',
      description: 'API to fetch client conversations with messages and user details',
      endpoints: {
        'GET /health': 'Health check endpoint',
        'GET /api/client/:clientId/conversations-details': 'Get all conversations and details for a client',
        'GET /api/cache/stats': 'Get cache statistics',
        'DELETE /api/cache': 'Clear all cache',
        'PUT /api/auth/token': 'Update authentication token'
      },
      usage: {
        'Main endpoint': 'GET /api/client/{clientId}/conversations-details?locationId={optional}',
        'Example': 'GET /api/client/cW8PJ6DbLadKiQs0k1fZ/conversations-details?locationId=s6gFxBTDdMZIOvO141T8'
      },
      caching: {
        'Conversations': '5 minutes TTL',
        'Messages': '5 minutes TTL',
        'Message Details': '5 minutes TTL',
        'Users': '10 minutes TTL'
      }
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      availableEndpoints: [
        'GET /health',
        'GET /api/client/:clientId/conversations-details',
        'GET /api/cache/stats',
        'DELETE /api/cache',
        'PUT /api/auth/token'
      ]
    });
  });

  
  // Global error handler
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    });
  });

  return app;
}