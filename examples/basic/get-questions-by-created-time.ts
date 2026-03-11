import {
  OverheatSDK,
  EVM_BASE_SEPOLIA_CONFIG,
  type TimeRangeFilter,
} from "overheat-sdk";

// Example: last 24 hours
const NOW = Math.floor(Date.now() / 1000);
const ONE_DAY = 24 * 60 * 60;
const START_TIME = NOW - ONE_DAY;
const END_TIME = NOW;

async function main(): Promise<void> {

    // config: EVM_BASE_SEPOLIA_CONFIG, SOL_STAGING_CONFIG, SOL_DEVNET_CONFIG
  const sdk = new OverheatSDK({ config: EVM_BASE_SEPOLIA_CONFIG });
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

