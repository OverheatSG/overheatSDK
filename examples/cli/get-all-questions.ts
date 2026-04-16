#!/usr/bin/env node

import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG } from "overheat-sdk";

const sdk = new OverheatSDK({ config: EVM_BASE_SEPOLIA_CONFIG });

if (require.main === module) {
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
