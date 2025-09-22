// Test script to check which chains are supported by 1inch API
const axios = require('axios');

async function testChainSupport() {
  const testAddress = "0xe7995A5b1B41779DeA900E2204dc08110de363d5";
  const baseUrl = "https://1inch-proxy-prtfl.vercel.app/portfolio/portfolio/v5.0/tokens/snapshot";
  
  const chainsToTest = [
    { name: "Base", id: "8453" },
    { name: "Scroll", id: "534352" },
    { name: "Ethereum", id: "1" },
    { name: "Polygon", id: "137" },
    { name: "Arbitrum", id: "42161" }
  ];
  
  console.log('🧪 Testing 1inch API Chain Support');
  console.log('📍 Test Address:', testAddress);
  console.log('');
  
  for (const chain of chainsToTest) {
    try {
      console.log(`🔍 Testing ${chain.name} (${chain.id})...`);
      
      const config = {
        params: {
          addresses: [testAddress],
          chain_id: chain.id,
        },
        paramsSerializer: {
          indexes: null,
        },
      };
      
      const response = await axios.get(baseUrl, config);
      const tokenCount = response.data.result?.length || 0;
      
      console.log(`✅ ${chain.name}: SUPPORTED - Found ${tokenCount} tokens`);
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`❌ ${chain.name}: NOT SUPPORTED - ${error.response.data?.error || 'API Error'}`);
      } else {
        console.log(`⚠️ ${chain.name}: ERROR - ${error.message}`);
      }
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

testChainSupport()
  .then(() => {
    console.log('\n🎉 Chain support test completed!');
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error.message);
  });
