import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG,SOL_STAGING_CONFIG,SOL_DEVNET_CONFIG } from "overheat-sdk";

// Hard-coded example question address
const QUESTION_ADDRESS = "0x0619146fc7b4038792929041835c309fa352b74ccdf81664a6b946d44444157f";

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

