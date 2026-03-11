#!/usr/bin/env node

import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG, evm } from "overheat-sdk";

const sdk = new OverheatSDK({ config: EVM_BASE_SEPOLIA_CONFIG });
const signer = { chain: "evm" as const, privateKeyHex: evm.loadWallet("./example-evm-key.key").privateKey };

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error(
      "Usage: update-answer.ts <question_address> <answer> <explanation> [credential_path]"
    );
    console.error(
      "  answer: true for Yes, false for No (can also use 'yes'/'no' or '1'/'0')"
    );
    console.error("  explanation: Explanation string (max 200 bytes)");
    console.error(
      "Example: update-answer.ts 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU true 'Additional info'"
    );
    process.exit(1);
  }

  const questionAddress = args[0];
  const answerStr = args[1].toLowerCase();
  const answer =
    answerStr === "true" || answerStr === "yes" || answerStr === "1";
  const explanation = args[2];


  sdk
    .updateAnswer(signer, { questionAddress, answer, explanation })
    .then((txHash) => {
      console.log(`\n✅ Answer updated successfully!`);
      console.log(`Transaction: ${txHash}`);
      const { config } = sdk;
      const explorerUrl = `${config.explorerUrl}/tx/${txHash}${config.explorerCluster ? "?cluster=" + config.explorerCluster : ""}`;
      console.log(`Explorer: ${explorerUrl}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
