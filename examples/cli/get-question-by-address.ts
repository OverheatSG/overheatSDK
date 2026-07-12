#!/usr/bin/env node

import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG } from "@overheat-oracle/sdk";

const ENV = {
  ...EVM_BASE_SEPOLIA_CONFIG,
  rpcUrl: process.env.OVERHEAT_RPC_URL ?? "",
  wsUrl: process.env.OVERHEAT_WS_URL ?? "",
};

const sdk = new OverheatSDK({ config: ENV });

if (require.main === module) {
  if (!ENV.rpcUrl) {
    console.error("Please set OVERHEAT_RPC_URL for the selected network config.");
    process.exit(1);
  }
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
