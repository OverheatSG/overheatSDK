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
  sdk
    .getAllQuestions()
    .then((questions) => {
      console.log(
        JSON.stringify(
          questions,
          (_, v) => (typeof v === "bigint" ? v.toString() : v),
          2
        )
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
