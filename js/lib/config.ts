export interface NetworkConfig {
  network: string;
  rpcUrl: string;
  wsUrl: string;
  irysNode: string;
  irysGateway: string;
  idlFileName: string;
  explorerCluster: string;
  explorerUrl: string;
  contractAddress?: string;
}
