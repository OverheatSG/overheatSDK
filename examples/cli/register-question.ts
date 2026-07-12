#!/usr/bin/env node

import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG, MAX_OUTCOMES } from "@overheat-oracle/sdk";

const ENV = {
  ...EVM_BASE_SEPOLIA_CONFIG,
  rpcUrl: process.env.OVERHEAT_RPC_URL ?? "",
  wsUrl: process.env.OVERHEAT_WS_URL ?? "",
};

const sdk = new OverheatSDK({ config: ENV });

async function main() {
  if (!ENV.rpcUrl) {
    throw new Error("Please set OVERHEAT_RPC_URL for the selected network config.");
  }
  const args = process.argv.slice(2);
  if (args.length < 7) {
    console.error(
      "Usage: register-question.ts <question_text> <expected_expiration_time> <latest_expiration_time> <category> <rules> <early_resolution_threshold> <outcomes_json> [credential_path]"
    );
    console.error("  expected_expiration_time: Unix timestamp (seconds)");
    console.error("  latest_expiration_time: Unix timestamp (seconds)");
    console.error("  category: Category string (max 100 bytes)");
    console.error("  rules: Rules description string");
    console.error(
      "  early_resolution_threshold: Number as string (e.g. 0.75)"
    );
    console.error(
      `  outcomes_json: JSON array of up to ${MAX_OUTCOMES} outcome strings, e.g. ["Yes","No","Tie",...].`
    );
    console.error(
      "  credential_path: Optional. Overridden by env SOLANA_KEYPAIR_PATH or EVM_KEY_PATH."
    );
    console.error(
      "\nEnvironment: OVERHEAT_NETWORK, SOLANA_KEYPAIR_PATH (Solana), EVM_KEY_PATH (EVM: path to file with private key hex)."
    );
    console.error("\nNote: Question data is uploaded to Arweave automatically.");
    console.error("\nExample (Solana):");
    console.error(
      "  OVERHEAT_NETWORK=sol-devnet SOLANA_KEYPAIR_PATH=/path/to/keypair.json register-question.ts 'Will Bitcoin reach $100k?' 1704063000 1704063500 'Crypto' 'Rule description here' 0.75"
    );
    console.error("\nExample (EVM):");
    console.error(
      "  OVERHEAT_NETWORK=evm-base-sepolia EVM_KEY_PATH=/path/to/evm-key.txt register-question.ts 'Will X happen?' 1704063000 1704063500 'Crypto' 'Rules' 0.75"
    );
    process.exit(1);
  }

  const questionText = args[0];
  const expectedExpirationTime = parseInt(args[1], 10);
  const latestExpirationTime = parseInt(args[2], 10);
  const category = args[3];
  const rules = args[4];
  const earlyResolutionThresholdRaw = args[5];
  const outcomesRaw = args[6];

  if (isNaN(expectedExpirationTime) || isNaN(latestExpirationTime)) {
    console.error(
      "Error: expected_expiration_time and latest_expiration_time must be valid numbers (Unix timestamps)"
    );
    process.exit(1);
  }

  const earlyResolutionThreshold = parseFloat(earlyResolutionThresholdRaw);
  if (
    Number.isNaN(earlyResolutionThreshold) ||
    earlyResolutionThreshold < 0 ||
    earlyResolutionThreshold > 1
  ) {
    console.error("Error: early_resolution_threshold must be a valid number");
    process.exit(1);
  }

  let outcomes: string[];
  try {
    const parsed = JSON.parse(outcomesRaw);
    if (!Array.isArray(parsed)) {
      throw new Error("outcomes_json must be a JSON array");
    }
    outcomes = parsed.map((v) => String(v)).slice(0, MAX_OUTCOMES);
  } catch (e) {
    console.error("Error: outcomes_json must be a valid JSON array of strings");
    process.exit(1);
  }

  const signer = await sdk.loadWallet("./example-evm-key.key");

  sdk
    .registerQuestion(signer, {
      questionText,
      expectedExpirationTime,
      latestExpirationTime,
      category,
      rules,
      earlyResolutionThreshold,
      outcomes,
    })
    .then((result) => {
      console.log("\n✅ Question registered successfully!");
      console.log(`Transaction: ${result.txHash}`);
      const { config } = sdk;
      const explorerUrl = `${config.explorerUrl}/tx/${result.txHash}${config.explorerCluster ? "?cluster=" + config.explorerCluster : ""}`;
      console.log(`Explorer: ${explorerUrl}`);
      console.log(`Question address: ${result.questionAddress}`);
      process.exit(0);
    })
    .catch((error: Error & { logs?: string[] }) => {
      console.error("Error:", error);
      if (error.logs) {
        console.error("Program logs:");
        error.logs.forEach((log: string) => console.error("  ", log));
      }
      process.exit(1);
    });
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}
