import {
  OverheatSDK,
  EVM_BASE_SEPOLIA_CONFIG,
  SOL_STAGING_CONFIG,
  SOL_DEVNET_CONFIG,
} from "overheat-sdk";

// Example constants
const ENV =SOL_DEVNET_CONFIG
const WALLET_PATH = "./example-sol-key.key";
const QUESTION_ADDRESS = "5PytEcnnvvGM8kfhkhbBfR4rKWXuQhL7i1xzUHUFqwsE";
/** One entry per outcome you set; SDK pads to on-chain length. E.g. Yes/No: first false, second true. */
const ANSWERS: (boolean | null)[] = [false, true];
const EXPLANATION = "According to reputable data sources, the condition was met.";

async function main(): Promise<void> {

    // config: EVM_BASE_SEPOLIA_CONFIG, SOL_STAGING_CONFIG, SOL_DEVNET_CONFIG
  const sdk = new OverheatSDK({ config: ENV });
  const signer = await sdk.loadWallet(WALLET_PATH);

  const txHash = await sdk.updateAnswer(signer, {
    questionAddress: QUESTION_ADDRESS,
    answers: ANSWERS,
    explanation: EXPLANATION,
  });

  console.log("✅ Answer updated successfully.");
  console.log("Tx hash:", txHash);
}

void main();

