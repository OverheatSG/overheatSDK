#!/usr/bin/env node

import { expandPath, loadWallet, updateAnswer, getConfig } from "overheat-sdk";

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.error("Usage: update_answer.ts <question_address> <answer> <explanation> <early_resolution_threshold> [wallet_path]");
    console.error("  answer: true for Yes, false for No (can also use 'yes'/'no' or '1'/'0')");
    console.error("  explanation: Explanation string (max 200 bytes)");
    console.error("  early_resolution_threshold: Floating point number (f64 on-chain) for early resolution threshold");
    console.error("Example: update_answer.ts 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU true 'Additional info' 0.75");
    process.exit(1);
  }

  const questionAddress = args[0];
  const answerStr = args[1].toLowerCase();
  const answer = answerStr === "true" || answerStr === "yes" || answerStr === "1";
  const explanation = args[2];
  const earlyResolutionThreshold = parseFloat(args[3]);
  if (Number.isNaN(earlyResolutionThreshold)) {
    console.error("Invalid early_resolution_threshold: must be a number");
    process.exit(1);
  }
  const walletPath = expandPath(
    args[4] || process.env.ANCHOR_WALLET || "~/.config/solana/id.json"
  );

  const { wallet } = loadWallet(walletPath);
  updateAnswer(questionAddress, answer, explanation, earlyResolutionThreshold, wallet)
    .then((result) => {
      console.log(`\n✅ Answer updated successfully!`);
      console.log(`Transaction: ${result.transaction}`);
      const config = getConfig();
      const explorerUrl = config.explorerCluster 
        ? `https://explorer.solana.com/tx/${result.transaction}?cluster=${config.explorerCluster}`
        : `https://explorer.solana.com/tx/${result.transaction}`;
      console.log(`Explorer: ${explorerUrl}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
