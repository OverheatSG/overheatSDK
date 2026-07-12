import {
  OverheatSDK,
  EVM_BASE_SEPOLIA_CONFIG,SOL_STAGING_CONFIG,SOL_DEVNET_CONFIG,
  type TimeRangeFilter,
} from "@overheat-oracle/sdk";

const ENV = {
  ...SOL_DEVNET_CONFIG,
  rpcUrl: process.env.OVERHEAT_RPC_URL ?? "",
  wsUrl: process.env.OVERHEAT_WS_URL ?? "",
};
// Example: last 24 hours
const NOW = Math.floor(Date.now() / 1000);
const ONE_DAY = 24 * 60 * 60;
const START_TIME = NOW - ONE_DAY;
const END_TIME = NOW;

async function main(): Promise<void> {
  if (!ENV.rpcUrl) {
    throw new Error("Please set OVERHEAT_RPC_URL for the selected network config.");
  }
  if (ENV.network.startsWith("sol") && !ENV.wsUrl) {
    throw new Error("Please set OVERHEAT_WS_URL when using a Solana network config.");
  }

    // config: EVM_BASE_SEPOLIA_CONFIG, SOL_STAGING_CONFIG, SOL_DEVNET_CONFIG
  const sdk = new OverheatSDK({ config: ENV });
  const timeRange: TimeRangeFilter = {
    startTime: BigInt(START_TIME),
    endTime: BigInt(END_TIME),
  };
  const questions = await sdk.getQuestionsByTimeRange({ timeRange });
  console.log(
    JSON.stringify(
      questions,
      (_, v) => (typeof v === "bigint" ? v.toString() : v),
      2,
    ),
  );
}

void main();

