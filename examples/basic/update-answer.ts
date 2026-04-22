import {
  OverheatSDK,
  EVM_BASE_SEPOLIA_CONFIG,
  SOL_STAGING_CONFIG,
  SOL_DEVNET_CONFIG,
} from "overheat-sdk";

// Example constants
const ENV = {
  ...SOL_DEVNET_CONFIG,
  rpcUrl: process.env.OVERHEAT_RPC_URL ?? "",
  wsUrl: process.env.OVERHEAT_WS_URL ?? "",
};
const WALLET_PATH = "./example-sol-key.key";
const QUESTION_ADDRESS = "5PytEcnnvvGM8kfhkhbBfR4rKWXuQhL7i1xzUHUFqwsE";
/** One entry per outcome you set; SDK pads to on-chain length. E.g. Yes/No: first false, second true. */
const ANSWERS: (boolean | null)[] = [false, true];
const EXPLANATION = "According to reputable data sources, the condition was met.";

async function main(): Promise<void> {
  if (!ENV.rpcUrl) {
    throw new Error("Please set OVERHEAT_RPC_URL for the selected network config.");
  }
  if (ENV.network.startsWith("sol") && !ENV.wsUrl) {
    throw new Error("Please set OVERHEAT_WS_URL when using a Solana network config.");
  }

    // config: EVM_BASE_SEPOLIA_CONFIG, SOL_STAGING_CONFIG, SOL_DEVNET_CONFIG
  const sdk = new OverheatSDK({ config: ENV });
  const signer = await sdk.loadWallet(WALLET_PATH); // or await sdk.loadWalletFromEnvValue(process.env.WALLET_PRIVATE_KEY);

  const txHash = await sdk.updateAnswer(signer, {
    questionAddress: QUESTION_ADDRESS,
    answers: ANSWERS,
    explanation: EXPLANATION,
  });

  console.log("✅ Answer updated successfully.");
  console.log("Tx hash:", txHash);
}

void main();

