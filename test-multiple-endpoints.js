// Test script for multiple wallet API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/wallet';
const TEST_ADDRESS = "0xe7995A5b1B41779DeA900E2204dc08110de363d5";

async function testMultipleEndpoints() {
  console.log('🧪 Testing Multiple Wallet API Endpoints');
  console.log('📍 Test Address:', TEST_ADDRESS);
  console.log('🌐 Base URL:', BASE_URL);
  console.log('');

  const endpoints = [
    {
      name: 'Health Check',
      method: 'GET',
      url: `${BASE_URL}/health`,
      data: null
    },
    {
      name: 'Portfolio',
      method: 'POST',
      url: `${BASE_URL}/portfolio`,
      data: { address: TEST_ADDRESS }
    },
    {
      name: 'Balance',
      method: 'POST',
      url: `${BASE_URL}/balance`,
      data: { address: TEST_ADDRESS }
    },
    {
      name: 'Wallet Info',
      method: 'POST',
      url: `${BASE_URL}/info`,
      data: { address: TEST_ADDRESS }
    },
    {
      name: 'Root Endpoint',
      method: 'GET',
      url: `${BASE_URL}`,
      data: null
    }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing ${endpoint.name}...`);
      
      const config = {
        method: endpoint.method.toLowerCase(),
        url: endpoint.url,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (endpoint.data) {
        config.data = endpoint.data;
      }
      
      const response = await axios(config);
      
      console.log(`✅ ${endpoint.name}: SUCCESS (${response.status})`);
      
      // Show relevant data based on endpoint
      if (endpoint.name === 'Health Check') {
        console.log(`   Status: ${response.data.status}`);
        console.log(`   Supported Chains: ${response.data.supportedChains.length}`);
      } else if (endpoint.name === 'Portfolio') {
        console.log(`   Tokens Found: ${response.data.data?.length || 0}`);
      } else if (endpoint.name === 'Balance') {
        console.log(`   Total Balance: $${response.data.data?.totalBalanceUSD?.toFixed(2) || '0.00'}`);
        console.log(`   Token Count: ${response.data.data?.tokenCount || 0}`);
      } else if (endpoint.name === 'Wallet Info') {
        console.log(`   Total Balance: $${response.data.data?.summary?.totalBalanceUSD?.toFixed(2) || '0.00'}`);
        console.log(`   Top Token: ${response.data.data?.summary?.topToken?.symbol || 'None'}`);
      } else if (endpoint.name === 'Root Endpoint') {
        console.log(`   Available Endpoints: ${response.data.endpoints?.length || 0}`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.name}: FAILED`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data?.error || 'Unknown error'}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    
    console.log('');
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Run the test
testMultipleEndpoints()
  .then(() => {
    console.log('🎉 Multiple endpoints test completed!');
  })
  .catch((error) => {
    console.error('💥 Test failed:', error.message);
  });
