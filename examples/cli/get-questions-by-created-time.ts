#!/usr/bin/env node

import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG, type TimeRangeFilter } from "overheat-sdk";

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
    console.error("Usage: get-questions-by-created-time.ts <start_time> [end_time]");
    console.error("\nArguments:");
    console.error("  start_time: Unix timestamp (seconds), inclusive");
    console.error(
      "  end_time:   Optional. Unix timestamp (seconds), inclusive. Default: now"
    );
    console.error("\nExamples:");
    console.error("  get-questions-by-created-time.ts 1704067200");
    console.error("  get-questions-by-created-time.ts 1704067200 1704153600");
    console.error(
      "\nNote: Uses the 'created_at' field; only questions with startTime <= created_at <= endTime are returned."
    );
    process.exit(1);
  }

  const startTime = parseInt(args[0], 10);
  if (isNaN(startTime)) {
    console.error("Error: start_time must be a valid number (Unix timestamp)");
    process.exit(1);
  }
  const endTime =
    args.length >= 2 ? parseInt(args[1], 10) : Math.floor(Date.now() / 1000);
  if (args.length >= 2 && isNaN(endTime)) {
    console.error("Error: end_time must be a valid number (Unix timestamp)");
    process.exit(1);
  }

  const timeRange: TimeRangeFilter = {
    startTime: BigInt(startTime),
    endTime: BigInt(endTime),
  };
  sdk
    .getQuestionsByTimeRange({ timeRange })
    .then((questions) => {
      const header =
        startTime === endTime
          ? `\nFound ${questions.length} questions created at ${new Date(startTime * 1000).toISOString()}:`
          : `\nFound ${questions.length} questions created between ${new Date(startTime * 1000).toISOString()} and ${new Date(endTime * 1000).toISOString()}:`;
      console.log(header);
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
