import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG, evm } from "overheat-sdk";

// Example constants
const WALLET_PATH = "./example-evm-key.key";
const QUESTION_ADDRESS = "0xd74fbf2b908d4dafcbac336f8d1f603e021d606d8b5dfbd779b799e6399d16a6";
const ANSWER = true;
const EXPLANATION = "According to reputable data sources, the condition was met.";

async function main(): Promise<void> {

    // config: EVM_BASE_SEPOLIA_CONFIG, SOL_STAGING_CONFIG, SOL_DEVNET_CONFIG
  const sdk = new OverheatSDK({ config: EVM_BASE_SEPOLIA_CONFIG });
  const { privateKey } = evm.loadWallet(WALLET_PATH);
  const signer = { chain: "evm" as const, privateKeyHex: privateKey };

  const txHash = await sdk.updateAnswer(signer, {
    questionAddress: QUESTION_ADDRESS,
    answer: ANSWER,
    explanation: EXPLANATION,
  });

  console.log("✅ Answer updated successfully.");
  console.log("Tx hash:", txHash);
}

void main();

