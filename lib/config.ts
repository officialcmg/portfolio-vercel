// Configuration for supported chains
export const SUPPORTED_CHAINS = {
  ETHEREUM: "1",
  BNB_CHAIN: "56", 
  POLYGON: "137",
  ARBITRUM: "42161",
  OPTIMISM: "10",
  AVALANCHE: "43114",
  BASE: "8453",
  GNOSIS: "100",
  ZKSYNC_ERA: "324",
  LINEA: "59144",
  SONIC: "146"
} as const;

// Default chain to use
export const DEFAULT_CHAIN_ID = SUPPORTED_CHAINS.BASE;

// Chain names for logging
export const CHAIN_NAMES: Record<string, string> = {
  "1": "Ethereum",
  "56": "BNB Chain",
  "137": "Polygon", 
  "42161": "Arbitrum",
  "10": "Optimism",
  "43114": "Avalanche",
  "8453": "Base",
  "100": "Gnosis",
  "324": "zkSync Era",
  "59144": "Linea",
  "146": "Sonic"
};

// Validate if a chain ID is supported
export function isSupportedChain(chainId: string): boolean {
  return Object.values(SUPPORTED_CHAINS).includes(chainId as any);
}

// Get chain name from ID
export function getChainName(chainId: string): string {
  return CHAIN_NAMES[chainId] || `Unknown Chain (${chainId})`;
}
