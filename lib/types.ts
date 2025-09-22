// API Response Types
export interface UnderlyingToken {
  decimals: number;
  value_usd: number;
  amount: string;
}

export interface PortfolioTokenResponse {
  contract_name: string;
  contract_address: string;
  contract_symbol: string;
  underlying_tokens: UnderlyingToken[];
}

export interface PortfolioApiResponse {
  result: PortfolioTokenResponse[];
}

export interface TokenMetadata {
  logoURI?: string;
}

export type TokenMetadataResponse = Record<string, TokenMetadata>;

// Export Types
export interface PortfolioToken {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  value_usd: number;
  amount: number;
  logoURI: string | null;
}

// Request/Response types for the API
export interface PortfolioRequest {
  address: string;
}

export interface PortfolioResponse {
  success: boolean;
  data?: PortfolioToken[];
  error?: string;
}
