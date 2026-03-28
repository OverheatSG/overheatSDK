import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG,SOL_STAGING_CONFIG,SOL_DEVNET_CONFIG } from "overheat-sdk";

// Example constants
const ENV =SOL_DEVNET_CONFIG
const WALLET_PATH = "./example-sol-key.key";
const QUESTION_TEXT = "Will BTC trade above $100k by 2030-02-01?";
const EXPECTED_EXPIRATION_TIME = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
const LATEST_EXPIRATION_TIME = EXPECTED_EXPIRATION_TIME + 24 * 60 * 60;
const CATEGORY = "Crypto";
const RULES = "Resolution according to CoinGecko BTC/USD daily close.";
const EARLY_RESOLUTION_THRESHOLD = 0.75;
const OUTCOMES = [
  "Yes",
  "No",
  "Tie",
];

async function main(): Promise<void> {

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

