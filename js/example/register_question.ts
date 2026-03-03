#!/usr/bin/env node

import * as os from "os";
import { expandPath, loadWallet } from "../utils/wallet";
import { registerQuestion, RegisterQuestionParams } from "../lib/register_question";

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 5) {
    console.error("Usage: register_question.ts <question_text> <expected_expiration_time> <latest_expiration_time> <category> <rule> [wallet_path]");
    console.error("  expected_expiration_time: Unix timestamp (seconds)");
    console.error("  latest_expiration_time: Unix timestamp (seconds)");
    console.error("  category: Category string (max 100 bytes)");
    console.error("  rule: Rule description string");
    console.error("  wallet_path: Optional wallet path (defaults to ~/.config/solana/id.json)");
    console.error("\nNote: Question data will be automatically uploaded to Arweave");
    console.error("\nExample:");
    console.error("  register_question.ts 'Will Bitcoin reach $100k?' 1704063000 1704063500 'Crypto' 'Rule description here'");
    process.exit(1);
  }

  const questionText = args[0];
  const expectedExpirationTime = parseInt(args[1], 10);
  const latestExpirationTime = parseInt(args[2], 10);
  const category = args[3];
  const rule = args[4];
  const walletPath = expandPath(
    args[5] || process.env.ANCHOR_WALLET || "~/.config/solana/id.json"
  );

  if (isNaN(expectedExpirationTime) || isNaN(latestExpirationTime)) {
    console.error("Error: expected_expiration_time and latest_expiration_time must be valid numbers (Unix timestamps)");
    process.exit(1);
  }

  const { keypair: walletKeypair, wallet } = loadWallet(walletPath);

  registerQuestion(
    {
      questionText,
      expectedExpirationTime,
      latestExpirationTime,
      category,
      rule,
    },
    wallet,
    walletKeypair
  )
    .then((result) => {
      console.log(`\n✅ Question registered successfully!`);
      console.log(`Transaction: ${result.transaction}`);
      const config = require("../lib/config").getConfig();
      const explorerUrl = config.explorerCluster 
        ? `https://explorer.solana.com/tx/${result.transaction}?cluster=${config.explorerCluster}`
        : `https://explorer.solana.com/tx/${result.transaction}`;
      console.log(`Explorer: ${explorerUrl}`);
      console.log(`Question address: ${result.questionAddress}`);
      console.log(`Arweave ID: ${result.arweaveId}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
