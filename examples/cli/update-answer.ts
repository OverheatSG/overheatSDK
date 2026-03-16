#!/usr/bin/env node

import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG } from "overheat-sdk";

const sdk = new OverheatSDK({ config: EVM_BASE_SEPOLIA_CONFIG });

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error(
      "Usage: update-answer.ts <question_address> <answer> <explanation> [credential_path]"
    );
    console.error(
      '  answer: must match one of the outcomes; use empty string "" to clear/unanswer'
    );
    console.error("  explanation: Explanation string (uploaded to Arweave)");
    console.error(
      "Example: update-answer.ts 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU true 'Additional info'"
    );
    process.exit(1);
  }

  const questionAddress = args[0];
  const answer = args[1];
  const explanation = args[2];

  const signer = await sdk.loadWallet("./example-evm-key.key");

  const txHash = await sdk.updateAnswer(signer, {
    questionAddress,
    answer,
    explanation,
  });

  console.log(`\n✅ Answer updated successfully!`);
  console.log(`Transaction: ${txHash}`);
  const { config } = sdk;
  const explorerUrl = `${config.explorerUrl}/tx/${txHash}${
    config.explorerCluster ? "?cluster=" + config.explorerCluster : ""
  }`;
  console.log(`Explorer: ${explorerUrl}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}
