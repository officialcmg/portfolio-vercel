# PayLinx Vercel Edge Function

A Vercel Edge Function that fetches portfolio tokens for a given Ethereum address using the 1inch API.

## API Endpoint

### POST `/api/portfolio`

Fetches portfolio tokens for a given Ethereum address.

#### Request Body
```json
{
  "address": "0xe7995A5b1B41779DeA900E2204dc08110de363d5",
  "chainId": "8453"
}
```

**Parameters:**
- `address` (required): Ethereum address to fetch portfolio for
- `chainId` (optional): Chain ID to use. Defaults to Base (8453) if not provided.

**Supported Chain IDs:**
- `1` - Ethereum
- `56` - BNB Chain  
- `137` - Polygon
- `42161` - Arbitrum
- `10` - Optimism
- `43114` - Avalanche
- `8453` - Base (default)
- `100` - Gnosis
- `324` - zkSync Era
- `59144` - Linea
- `146` - Sonic

**Note:** Scroll mainnet (534352) is **not supported** by the 1inch API.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "name": "Token Name",
      "address": "0x...",
      "symbol": "TOKEN",
      "decimals": 18,
      "value_usd": 100.50,
      "amount": 1.234567,
      "logoURI": "https://..."
    }
  ]
}
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Test the endpoint:
```bash
# Test with default chain (Base)
curl -X POST http://localhost:3000/api/portfolio \
  -H "Content-Type: application/json" \
  -d '{"address": "0xe7995A5b1B41779DeA900E2204dc08110de363d5"}'

# Test with specific chain (Ethereum)
curl -X POST http://localhost:3000/api/portfolio \
  -H "Content-Type: application/json" \
  -d '{"address": "0xe7995A5b1B41779DeA900E2204dc08110de363d5", "chainId": "1"}'
```

## Deployment

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

### Deploy to GitHub
1. Initialize git: `git init`
2. Add files: `git add .`
3. Commit: `git commit -m "Initial commit"`
4. Create GitHub repo: `gh repo create paylinx-vercel --public`
5. Push: `git push -u origin main`

## Features

- ✅ Vercel Edge Function for fast global response times
- ✅ TypeScript support with proper type definitions
- ✅ Error handling and validation
- ✅ CORS headers for cross-origin requests
- ✅ Response caching (1 minute)
- ✅ Ethereum address validation
- ✅ Comprehensive logging
