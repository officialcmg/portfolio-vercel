// Simple test script to validate the portfolio service
const axios = require('axios');

// Mock the portfolio service functions for testing
async function testPortfolioService() {
  const testAddress = "0xe7995A5b1B41779DeA900E2204dc08110de363d5";
  
  console.log('🧪 Testing Portfolio Service');
  console.log('📍 Test Address:', testAddress);
  
  try {
    // Test the portfolio API endpoint
    console.log('\n🔍 Testing portfolio tokens fetch...');
    const portfolioUrl = "https://1inch-proxy-prtfl.vercel.app/portfolio/portfolio/v5.0/tokens/snapshot";
    
    const portfolioConfig = {
      params: {
        addresses: [testAddress],
        chain_id: "8453",
      },
      paramsSerializer: {
        indexes: null,
      },
    };
    
    const portfolioResponse = await axios.get(portfolioUrl, portfolioConfig);
    console.log('✅ Portfolio API Response Status:', portfolioResponse.status);
    console.log('📊 Total tokens found:', portfolioResponse.data.result?.length || 0);
    
    // Extract contract addresses for metadata
    const contractAddresses = portfolioResponse.data.result
      .filter(token => token.underlying_tokens && token.underlying_tokens.length > 0)
      .map(token => token.contract_address);
    
    console.log('🏷️ Contract addresses for metadata:', contractAddresses.length);
    
    if (contractAddresses.length > 0) {
      // Test the metadata API endpoint
      console.log('\n🖼️ Testing token metadata fetch...');
      const metadataUrl = "https://1inch-proxy-prtfl.vercel.app/token/v1.3/8453/custom";
      
      const metadataConfig = {
        params: {
          addresses: contractAddresses,
        },
        paramsSerializer: {
          indexes: null,
        },
      };
      
      const metadataResponse = await axios.get(metadataUrl, metadataConfig);
      console.log('✅ Metadata API Response Status:', metadataResponse.status);
      console.log('🏷️ Metadata received for tokens:', Object.keys(metadataResponse.data).length);
      
      // Process tokens (simplified version)
      const processedTokens = [];
      
      portfolioResponse.data.result.forEach(token => {
        if (!token.underlying_tokens || token.underlying_tokens.length === 0) {
          return;
        }
        
        const underlyingToken = token.underlying_tokens[0];
        const metadata = metadataResponse.data[token.contract_address.toLowerCase()];
        
        const processedToken = {
          name: token.contract_name,
          address: token.contract_address,
          symbol: token.contract_symbol,
          decimals: underlyingToken.decimals,
          value_usd: underlyingToken.value_usd,
          amount: parseFloat(underlyingToken.amount),
          logoURI: metadata?.logoURI || null
        };
        
        if (processedToken.value_usd > 0) {
          processedTokens.push(processedToken);
        }
      });
      
      console.log('\n✅ Processing complete!');
      console.log('📈 Filtered tokens (value > 0):', processedTokens.length);
      console.log('💰 Total portfolio value:', processedTokens.reduce((sum, token) => sum + token.value_usd, 0).toFixed(2), 'USD');
      
      if (processedTokens.length > 0) {
        console.log('\n🎯 All Portfolio Tokens:');
        processedTokens.forEach((token, index) => {
          console.log(`\n--- Token ${index + 1} ---`);
          console.log(`Name: ${token.name}`);
          console.log(`Symbol: ${token.symbol}`);
          console.log(`Address: ${token.address}`);
          console.log(`Decimals: ${token.decimals}`);
          console.log(`Amount: ${token.amount.toFixed(6)}`);
          console.log(`Value USD: $${token.value_usd.toFixed(2)}`);
          console.log(`Logo URI: ${token.logoURI || 'N/A'}`);
        });
        
        console.log('\n📋 Full JSON Array:');
        console.log(JSON.stringify(processedTokens, null, 2));
      }
      
      return processedTokens;
    } else {
      console.log('⚠️ No tokens with underlying_tokens found');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📄 Response status:', error.response.status);
      console.error('📄 Response data:', error.response.data);
    }
    throw error;
  }
}

// Run the test
testPortfolioService()
  .then((tokens) => {
    console.log('\n🎉 Test completed successfully!');
    console.log('📊 Final result: Found', tokens.length, 'valid tokens');
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  });
