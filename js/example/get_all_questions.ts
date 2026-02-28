#!/usr/bin/env node

import { getAllQuestions } from "../lib/get_all_questions";

if (require.main === module) {
  getAllQuestions()
    .then((questions) => {
      if (questions.length === 0) {
        console.log("No questions found.");
      } else {
        questions.forEach((q, index) => {
          console.log(`[${index + 1}]`);
          console.log(`  Address: ${q.address}`);
          console.log(`  Category: ${q.category || "N/A"}`);
          console.log(`  Question: ${q.questionText}`);
          console.log(`  Answer: ${q.answer || "Not answered"}`);
          if (q.expectedExpirationTime) {
            console.log(`  Expected Expiration: ${new Date(q.expectedExpirationTime * 1000).toISOString()}`);
          }
          if (q.latestExpirationTime) {
            console.log(`  Latest Expiration: ${new Date(q.latestExpirationTime * 1000).toISOString()}`);
          }
        });
        console.log(`\nTotal: ${questions.length} question(s)`);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
