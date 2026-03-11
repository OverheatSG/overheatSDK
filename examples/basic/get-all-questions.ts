import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG,SOL_STAGING_CONFIG,SOL_DEVNET_CONFIG } from "overheat-sdk";

async function main(): Promise<void> {

  // config: EVM_BASE_SEPOLIA_CONFIG, SOL_STAGING_CONFIG, SOL_DEVNET_CONFIG
  const sdk = new OverheatSDK({ config: EVM_BASE_SEPOLIA_CONFIG });
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

