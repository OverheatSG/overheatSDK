import {
  OverheatSDK,
  EVM_BASE_SEPOLIA_CONFIG,
  SOL_STAGING_CONFIG,
  SOL_DEVNET_CONFIG,
} from "@overheat-oracle/sdk";

// Example constants
const ENV = {
  ...EVM_BASE_SEPOLIA_CONFIG,
  rpcUrl: process.env.OVERHEAT_RPC_URL ?? "",
  wsUrl: process.env.OVERHEAT_WS_URL ?? "",
};
const WALLET_PATH = "./example-evm-key.key";
const QUESTION_TEXT = "Will BTC trade above $100k by 2031-02-04?";
const EXPECTED_EXPIRATION_TIME =
  Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
const LATEST_EXPIRATION_TIME = EXPECTED_EXPIRATION_TIME + 24 * 60 * 60;
const CATEGORY = "Crypto";
const RULES = "Resolution according to CoinGecko BTC/USD daily close.";
const EARLY_RESOLUTION_THRESHOLD = 0.75;
const OUTCOMES = ["Yes", "No", "Tie"];

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

  const result = await sdk.registerQuestion(signer, {
    questionText: QUESTION_TEXT,
    outcomes: OUTCOMES,
    expectedExpirationTime: EXPECTED_EXPIRATION_TIME,
    latestExpirationTime: LATEST_EXPIRATION_TIME,
    category: CATEGORY,
    rules: RULES,
    earlyResolutionThreshold: EARLY_RESOLUTION_THRESHOLD,
  });

  console.log("✅ Question registered successfully.");
  console.log("Question address:", result.questionAddress);
  console.log("Tx hash:", result.txHash);
}

void main();
