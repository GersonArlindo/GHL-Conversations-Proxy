// Example usage of the Client Conversations Controller
// This file demonstrates how to use the controller API

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const CLIENT_ID = 'cW8PJ6DbLadKiQs0k1fZ'; // Example client ID from documentation
const LOCATION_ID = 's6gFxBTDdMZIOvO141T8'; // Example location ID from documentation

async function testController() {
  try {
    console.log('🧪 Testing Client Conversations Controller...\n');

    // 1. Health check
    console.log('1. Health Check:');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Status:', healthResponse.data.status);
    console.log('📊 Service:', healthResponse.data.service);
    console.log('');

    // 2. Get client conversations details
    console.log('2. Fetching Client Conversations:');
    const conversationsUrl = `${BASE_URL}/api/client/${CLIENT_ID}/conversations-details?locationId=${LOCATION_ID}`;
    console.log('🔗 URL:', conversationsUrl);
    
    const conversationsResponse = await axios.get(conversationsUrl);
    console.log('✅ Success! Found', conversationsResponse.data.totalConversations, 'conversations');
    console.log('📝 Response structure:');
    console.log('   - Client ID:', conversationsResponse.data.clientId);
    console.log('   - Total Conversations:', conversationsResponse.data.totalConversations);
    console.log('   - Fetched At:', conversationsResponse.data.fetchedAt);
    
    if (conversationsResponse.data.conversations.length > 0) {
      const firstConv = conversationsResponse.data.conversations[0];
      console.log('   - First Conversation ID:', firstConv.conversation.id);
      console.log('   - Contact Name:', firstConv.conversation.fullName);
      console.log('   - Messages Count:', firstConv.messages.length);
      
      if (firstConv.messages.length > 0) {
        const firstMsg = firstConv.messages[0];
        console.log('   - First Message Type:', firstMsg.message.messageType);
        console.log('   - Has Message Detail:', !!firstMsg.messageDetail);
        console.log('   - Has User Info:', !!firstMsg.user);
      }
    }
    console.log('');

    // 3. Cache statistics
    console.log('3. Cache Statistics:');
    const cacheStatsResponse = await axios.get(`${BASE_URL}/api/cache/stats`);
    console.log('📊 Cache Size:', cacheStatsResponse.data.cache.size);
    console.log('🔑 Cache Keys:', cacheStatsResponse.data.cache.keys.length);
    if (cacheStatsResponse.data.cache.keys.length > 0) {
      console.log('   Sample keys:', cacheStatsResponse.data.cache.keys.slice(0, 3));
    }
    console.log('');

    // 4. Test cache hit (second request should be faster)
    console.log('4. Testing Cache Hit (second request):');
    const startTime = Date.now();
    await axios.get(conversationsUrl);
    const endTime = Date.now();
    console.log('⚡ Second request completed in:', endTime - startTime, 'ms (should be faster due to cache)');
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing controller:', error.message);
    
    if (error.response) {
      console.error('📄 Response status:', error.response.status);
      console.error('📄 Response data:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the server is running with: npm run dev');
    }
  }
}

// Additional utility functions for testing

async function testAuthTokenUpdate() {
  try {
    console.log('🔑 Testing Auth Token Update...');
    
    const response = await axios.put(`${BASE_URL}/api/auth/token`, {
      token: 'new-test-token-123'
    });
    
    console.log('✅ Token updated:', response.data.message);
  } catch (error) {
    console.error('❌ Error updating token:', error.message);
  }
}

async function testCacheClear() {
  try {
    console.log('🧹 Testing Cache Clear...');
    
    const response = await axios.delete(`${BASE_URL}/api/cache`);
    console.log('✅ Cache cleared:', response.data.message);
  } catch (error) {
    console.error('❌ Error clearing cache:', error.message);
  }
}

// Run the main test
if (require.main === module) {
  testController();
}

module.exports = {
  testController,
  testAuthTokenUpdate,
  testCacheClear
};

