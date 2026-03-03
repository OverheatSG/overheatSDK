/**
 * Supported network types
 */
export type Network = "devnet" | "mainnet";

/**
 * Network configuration interface
 * Contains all necessary endpoints and settings for a specific network
 */
export interface NetworkConfig {
  /** RPC endpoint URL for Solana network */
  rpcUrl: string;
  /** WebSocket endpoint URL for Solana network */
  wsUrl: string;
  /** Irys node URL for Arweave uploads */
  irysNode: string;
  /** Irys gateway URL for Arweave data retrieval */
  irysGateway: string;
  /** IDL file name for the network */
  idlFileName: string;
  /** Solana Explorer cluster parameter */
  explorerCluster: string;
}

export const NETWORK_CONFIGS: Record<Network, NetworkConfig> = {
  devnet: {
    rpcUrl: "https://api.zan.top/node/v1/solana/devnet/85f8917431284c59abfeaeb2e32a0d87",
    wsUrl: "wss://api.zan.top/node/ws/v1/solana/devnet/85f8917431284c59abfeaeb2e32a0d87",
    irysNode: "https://devnet.irys.xyz",
    irysGateway: "https://devnet.irys.xyz",
    idlFileName: "overheat-devnet.json",
    explorerCluster: "devnet",
  },
  mainnet: {
    rpcUrl: "",
    wsUrl: "",
    irysNode: "https://node1.irys.xyz",
    irysGateway: "https://gateway.irys.xyz",
    idlFileName: "overheat-mainnet.json", 
    explorerCluster: "",
  },
};

let currentNetwork: Network = (process.env.OVERHEAT_NETWORK as Network) || "devnet";

/**
 * Set the current network (devnet or mainnet)
 * @param network - Network to switch to
 * @throws Error if network is invalid
 */
export function setNetwork(network: Network): void {
  if (!NETWORK_CONFIGS[network]) {
    throw new Error(`Invalid network: ${network}. Must be "devnet" or "mainnet"`);
  }
  currentNetwork = network;
}

/**
 * Get the current network setting
 * @returns Current network ("devnet" or "mainnet")
 */
export function getNetwork(): Network {
  return currentNetwork;
}

/**
 * Get the configuration for the current network
 * @returns NetworkConfig object for the current network
 */
export function getConfig(): NetworkConfig {
  return NETWORK_CONFIGS[currentNetwork];
}
