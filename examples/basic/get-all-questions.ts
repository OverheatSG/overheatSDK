import {
  OverheatSDK,
  EVM_BASE_SEPOLIA_CONFIG,
  SOL_STAGING_CONFIG,
  SOL_DEVNET_CONFIG,
} from "overheat-sdk";

const ENV = {
  ...SOL_DEVNET_CONFIG,
  rpcUrl: process.env.OVERHEAT_RPC_URL ?? "",
  wsUrl: process.env.OVERHEAT_WS_URL ?? "",
};

async function main(): Promise<void> {
  if (!ENV.rpcUrl) {
    throw new Error("Please set OVERHEAT_RPC_URL for the selected network config.");
  }
  if (ENV.network.startsWith("sol") && !ENV.wsUrl) {
    throw new Error("Please set OVERHEAT_WS_URL when using a Solana network config.");
  }

  // config: EVM_BASE_SEPOLIA_CONFIG, SOL_STAGING_CONFIG, SOL_DEVNET_CONFIG
  const sdk = new OverheatSDK({ config: ENV });
  const questions = await sdk.getAllQuestions();
  console.log(
    JSON.stringify(
      questions,
      (_, v) => (typeof v === "bigint" ? v.toString() : v),
      2,
    ),
  );
}

void main();
