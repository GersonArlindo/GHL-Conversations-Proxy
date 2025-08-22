import { createApp } from './app';
import dotenv from "dotenv";


dotenv.config();
// Configuration
const PORT = parseInt(process.env.PORT || '3003', 10);

// Create and start the server
const app = createApp();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Client Conversations Controller started successfully!');
  console.log(`📡 Server running on http://0.0.0.0:${PORT}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/client/:clientId/conversations-details`);
  console.log(`   GET  http://localhost:${PORT}/api/cache/stats`);
  console.log(`   DELETE http://localhost:${PORT}/api/cache`);
  console.log(`   PUT  http://localhost:${PORT}/api/auth/token`);
  console.log('');
  console.log('💡 Example usage:');
  console.log(`   curl "http://localhost:${PORT}/api/client/cW8PJ6DbLadKiQs0k1fZ/conversations-details?locationId=s6gFxBTDdMZIOvO141T8"`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;