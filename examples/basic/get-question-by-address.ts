import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG,SOL_STAGING_CONFIG,SOL_DEVNET_CONFIG } from "overheat-sdk";

const ENV = {
  ...SOL_DEVNET_CONFIG,
  rpcUrl: process.env.OVERHEAT_RPC_URL ?? "",
  wsUrl: process.env.OVERHEAT_WS_URL ?? "",
};
// Hard-coded example question address
const QUESTION_ADDRESS = "0x0619146fc7b4038792929041835c309fa352b74ccdf81664a6b946d44444157f";

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

