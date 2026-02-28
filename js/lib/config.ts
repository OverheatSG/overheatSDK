export type Network = "devnet" | "mainnet";

export interface NetworkConfig {
  rpcUrl: string;
  wsUrl: string;
  irysNode: string;
  irysGateway: string;
  programId: string;
  idlFileName: string;
  explorerCluster: string;
}

export const NETWORK_CONFIGS: Record<Network, NetworkConfig> = {
  devnet: {
    rpcUrl: "https://api.zan.top/node/v1/solana/devnet/85f8917431284c59abfeaeb2e32a0d87",
    wsUrl: "wss://api.zan.top/node/ws/v1/solana/devnet/85f8917431284c59abfeaeb2e32a0d87",
    irysNode: "https://devnet.irys.xyz",
    irysGateway: "https://devnet.irys.xyz",
    programId: "9WB2rbUAVmxdnXJY4abE588LuHnqWibZYVpx5LwgN8wo",
    idlFileName: "overheat-devnet.json",
    explorerCluster: "devnet",
  },
  mainnet: {
    rpcUrl: "",
    wsUrl: "",
    irysNode: "https://node1.irys.xyz",
    irysGateway: "https://gateway.irys.xyz",
    programId: "", 
    idlFileName: "overheat-mainnet.json", 
    explorerCluster: "",
  },
};

let currentNetwork: Network = (process.env.OVERHEAT_NETWORK as Network) || "devnet";

export function setNetwork(network: Network): void {
  if (!NETWORK_CONFIGS[network]) {
    throw new Error(`Invalid network: ${network}. Must be "devnet" or "mainnet"`);
  }
  currentNetwork = network;
}

export function getNetwork(): Network {
  return currentNetwork;
}

export function getConfig(): NetworkConfig {
  return NETWORK_CONFIGS[currentNetwork];
}
