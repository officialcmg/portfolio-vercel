import { NextRequest, NextResponse } from 'next/server';
import { fetchProcessedPortfolio } from '../lib/portfolio-service';
import { PortfolioRequest, PortfolioResponse } from '../lib/types';
import { DEFAULT_CHAIN_ID, isSupportedChain, getChainName } from '../lib/config';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return NextResponse.json(
      { success: false, error: 'Method not allowed. Use POST.' },
      { 
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }

  try {
    // Parse the request body
    const body: PortfolioRequest = await req.json();
    
    // Validate the address parameter
    if (!body.address || typeof body.address !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing address parameter' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Validate Ethereum address format (basic validation)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(body.address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address format' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Validate chain ID if provided
    const chainId = body.chainId || DEFAULT_CHAIN_ID;
    if (body.chainId && !isSupportedChain(body.chainId)) {
      return NextResponse.json(
        { success: false, error: `Unsupported chain ID: ${body.chainId}. Chain ${getChainName(body.chainId)} is not supported by 1inch API.` },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    console.log(`🚀 Processing portfolio request for address: ${body.address} on ${getChainName(chainId)}`);

    // Fetch and process the portfolio
    const portfolioTokens = await fetchProcessedPortfolio(body.address, chainId);

    const response: PortfolioResponse = {
      success: true,
      data: portfolioTokens
    };

    console.log(`✅ Successfully processed portfolio for ${body.address}. Found ${portfolioTokens.length} tokens.`);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('❌ Error processing portfolio request:', error);
    
    const errorResponse: PortfolioResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };

    return NextResponse.json(errorResponse, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}
