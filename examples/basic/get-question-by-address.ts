import {
  OverheatSDK,
  EVM_BASE_SEPOLIA_CONFIG,
  SOL_STAGING_CONFIG,
  SOL_DEVNET_CONFIG,
} from "@overheat-oracle/sdk";

const ENV = {
  ...EVM_BASE_SEPOLIA_CONFIG,
  rpcUrl: process.env.OVERHEAT_RPC_URL ?? "",
  wsUrl: process.env.OVERHEAT_WS_URL ?? "",
};
// Hard-coded example question address
const QUESTION_ADDRESS = "0x80a0445c8400ff38637a35b3cfeeb019d1afd1177714d31752b420dc6af6cd9b";

async function main(): Promise<void> {
  if (!ENV.rpcUrl) {
    throw new Error("Please set OVERHEAT_RPC_URL for the selected network config.");
  }
  if (ENV.network.startsWith("sol") && !ENV.wsUrl) {
    throw new Error("Please set OVERHEAT_WS_URL when using a Solana network config.");
  }

  // config: EVM_BASE_SEPOLIA_CONFIG, SOL_STAGING_CONFIG, SOL_DEVNET_CONFIG
  const sdk = new OverheatSDK({ config: ENV });
  const question = await sdk.getQuestionByAddress(QUESTION_ADDRESS);
  console.log(
    JSON.stringify(
      question,
      (_, v) => (typeof v === "bigint" ? v.toString() : v),
      2,
    ),
  );
}

void main();
