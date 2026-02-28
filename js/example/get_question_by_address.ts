#!/usr/bin/env node

import { getQuestionByAddress } from "../lib/get_question_by_address";

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
        console.log("Question Details:");
        console.log("=".repeat(80));
        console.log(`Address: ${question.address}`);
        console.log(`Authority: ${question.authority}`);
        console.log(`Category: ${question.category || "N/A"}`);
        console.log(`Question: ${question.questionText}`);
        console.log(`Answer: ${question.answer || "Not answered"}`);
        if (question.expectedExpirationTime) {
          console.log(`Expected Expiration Time: ${new Date(question.expectedExpirationTime * 1000).toISOString()}`);
        }
        if (question.latestExpirationTime) {
          console.log(`Latest Expiration Time: ${new Date(question.latestExpirationTime * 1000).toISOString()}`);
        }
        if (question.extension) {
          console.log(`Extension: ${question.extension}`);
        }
        if (question.arweaveId) {
          console.log(`Arweave ID: ${question.arweaveId}`);
        }
        console.log("=".repeat(80));
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
