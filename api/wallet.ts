import { NextRequest, NextResponse } from 'next/server';
import { fetchProcessedPortfolio } from '../lib/portfolio-service';
import { PortfolioRequest, PortfolioResponse } from '../lib/types';
import { DEFAULT_CHAIN_ID, isSupportedChain, getChainName } from '../lib/config';

export const config = {
  runtime: 'edge',
};

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Route: /api/wallet/portfolio
    if (pathname.endsWith('/portfolio')) {
      return await handlePortfolio(req);
    }
    
    // Route: /api/wallet/balance
    if (pathname.endsWith('/balance')) {
      return await handleBalance(req);
    }
    
    // Route: /api/wallet/info
    if (pathname.endsWith('/info')) {
      return await handleWalletInfo(req);
    }
    
    // Route: /api/wallet/health
    if (pathname.endsWith('/health')) {
      return await handleHealth(req);
    }
    
    // Default: List available endpoints
    return NextResponse.json({
      success: true,
      message: 'Wallet API',
      endpoints: [
        'POST /api/wallet/portfolio - Get portfolio tokens',
        'POST /api/wallet/balance - Get total portfolio balance',
        'POST /api/wallet/info - Get wallet information',
        'GET /api/wallet/health - Health check'
      ]
    }, { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Wallet API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

// Handle portfolio endpoint
async function handlePortfolio(req: NextRequest): Promise<NextResponse> {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { success: false, error: 'Method not allowed. Use POST.' },
      { status: 405, headers: corsHeaders }
    );
  }

  const body: PortfolioRequest = await req.json();
  
  // Validate address
  if (!body.address || typeof body.address !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Invalid or missing address parameter' },
      { status: 400, headers: corsHeaders }
    );
  }

  // Validate Ethereum address format
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(body.address)) {
    return NextResponse.json(
      { success: false, error: 'Invalid Ethereum address format' },
      { status: 400, headers: corsHeaders }
    );
  }

  // Validate chain ID
  const chainId = body.chainId || DEFAULT_CHAIN_ID;
  if (body.chainId && !isSupportedChain(body.chainId)) {
    return NextResponse.json(
      { success: false, error: `Unsupported chain ID: ${body.chainId}. Chain ${getChainName(body.chainId)} is not supported by 1inch API.` },
      { status: 400, headers: corsHeaders }
    );
  }

  console.log(`🚀 Processing portfolio request for address: ${body.address} on ${getChainName(chainId)}`);

  const portfolioTokens = await fetchProcessedPortfolio(body.address, chainId);

  const response: PortfolioResponse = {
    success: true,
    data: portfolioTokens
  };

  console.log(`✅ Successfully processed portfolio for ${body.address}. Found ${portfolioTokens.length} tokens.`);

  return NextResponse.json(response, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
  });
}

// Handle balance endpoint
async function handleBalance(req: NextRequest): Promise<NextResponse> {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { success: false, error: 'Method not allowed. Use POST.' },
      { status: 405, headers: corsHeaders }
    );
  }

  const body: PortfolioRequest = await req.json();
  
  if (!body.address || typeof body.address !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Invalid or missing address parameter' },
      { status: 400, headers: corsHeaders }
    );
  }

  const chainId = body.chainId || DEFAULT_CHAIN_ID;
  console.log(`💰 Processing balance request for address: ${body.address} on ${getChainName(chainId)}`);

  const portfolioTokens = await fetchProcessedPortfolio(body.address, chainId);
  const totalBalance = portfolioTokens.reduce((sum, token) => sum + token.value_usd, 0);

  return NextResponse.json({
    success: true,
    data: {
      address: body.address,
      chainId: chainId,
      chainName: getChainName(chainId),
      totalBalanceUSD: totalBalance,
      tokenCount: portfolioTokens.length
    }
  }, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
  });
}

// Handle wallet info endpoint
async function handleWalletInfo(req: NextRequest): Promise<NextResponse> {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { success: false, error: 'Method not allowed. Use POST.' },
      { status: 405, headers: corsHeaders }
    );
  }

  const body: PortfolioRequest = await req.json();
  
  if (!body.address || typeof body.address !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Invalid or missing address parameter' },
      { status: 400, headers: corsHeaders }
    );
  }

  const chainId = body.chainId || DEFAULT_CHAIN_ID;
  console.log(`ℹ️ Processing wallet info request for address: ${body.address} on ${getChainName(chainId)}`);

  const portfolioTokens = await fetchProcessedPortfolio(body.address, chainId);
  const totalBalance = portfolioTokens.reduce((sum, token) => sum + token.value_usd, 0);
  
  // Calculate some basic stats
  const topToken = portfolioTokens.reduce((prev, current) => 
    (prev.value_usd > current.value_usd) ? prev : current, portfolioTokens[0]
  );

  return NextResponse.json({
    success: true,
    data: {
      address: body.address,
      chainId: chainId,
      chainName: getChainName(chainId),
      summary: {
        totalBalanceUSD: totalBalance,
        tokenCount: portfolioTokens.length,
        topToken: topToken ? {
          symbol: topToken.symbol,
          name: topToken.name,
          valueUSD: topToken.value_usd,
          percentage: ((topToken.value_usd / totalBalance) * 100).toFixed(2)
        } : null
      },
      tokens: portfolioTokens.map(token => ({
        symbol: token.symbol,
        name: token.name,
        valueUSD: token.value_usd,
        percentage: ((token.value_usd / totalBalance) * 100).toFixed(2)
      }))
    }
  }, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
  });
}

// Handle health check endpoint
async function handleHealth(req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    supportedChains: [
      'Ethereum (1)', 'BNB Chain (56)', 'Polygon (137)', 'Arbitrum (42161)',
      'Optimism (10)', 'Avalanche (43114)', 'Base (8453)', 'Gnosis (100)',
      'zkSync Era (324)', 'Linea (59144)', 'Sonic (146)'
    ]
  }, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
