#!/usr/bin/env node

import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG } from "overheat-sdk";

const sdk = new OverheatSDK({ config: EVM_BASE_SEPOLIA_CONFIG });

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: get-question-by-address.ts <question_address>");
    console.error(
      "Example: get-question-by-address.ts 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
    );
    process.exit(1);
  }

  const address = args[0];

  sdk
    .getQuestionByAddress(address)
    .then((question) => {
      if (!question) {
        console.log("Question not found at the given address.");
        process.exit(1);
      } else {
        console.log(
          JSON.stringify(
            question,
            (_, v) => (typeof v === "bigint" ? v.toString() : v),
            2
          )
        );
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
