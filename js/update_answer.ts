#!/usr/bin/env node

import { expandPath } from "./utils/wallet";
import { updateAnswer } from "./lib/update_answer";

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error("Usage: update_answer.ts <question_address> <answer> <extension> [wallet_path]");
    console.error("  answer: true for Yes, false for No (can also use 'yes'/'no' or '1'/'0')");
    console.error("  extension: Extension string (max 200 bytes)");
    console.error("Example: update_answer.ts 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU true 'Additional info'");
    process.exit(1);
  }

  const questionAddress = args[0];
  const answerStr = args[1].toLowerCase();
  const answer = answerStr === "true" || answerStr === "yes" || answerStr === "1";
  const extension = args[2];
  const walletPath = expandPath(
    args[3] || process.env.ANCHOR_WALLET || "~/.config/solana/id.json"
  );

  updateAnswer(questionAddress, answer, extension, walletPath)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
