import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG } from "overheat-sdk";

// Hard-coded example question address
const QUESTION_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main(): Promise<void> {

    // config: EVM_BASE_SEPOLIA_CONFIG, SOL_STAGING_CONFIG, SOL_DEVNET_CONFIG
  const sdk = new OverheatSDK({ config: EVM_BASE_SEPOLIA_CONFIG });
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

