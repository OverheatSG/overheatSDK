#!/usr/bin/env node

import { getQuestionByAddress } from "../lib/get_question_by_address";
import { printQuestionDetail } from "../lib/display";

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: get_question_by_address.ts <question_address>");
    console.error("Example: get_question_by_address.ts 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");
    process.exit(1);
  }

  const address = args[0];
  
  getQuestionByAddress(address)
    .then((question) => {
      if (!question) {
        console.log("Question not found at the given address.");
        process.exit(1);
      } else {
        printQuestionDetail(question);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
