#!/usr/bin/env node

import { getAllQuestions, type QuestionInfo } from "overheat-sdk";

function printQuestionsList(questions: QuestionInfo[]): void {
  if (questions.length === 0) {
    console.log("No questions found.");
    return;
  }

  questions.forEach((q, index) => {
    console.log(`[${index + 1}]`);
    console.log(`  Address: ${q.address}`);
    console.log(`  Category: ${q.category || "N/A"}`);
    console.log(`  Question: ${q.questionText}`);
    console.log(`  Rules: ${q.rules}`);
    console.log(`  Answer: ${q.answer || "Not answered"}`);
    console.log(`  Explanation: ${q.explanation}`);
    if (q.expectedExpirationTime) {
      console.log(
        `  Expected Expiration: ${new Date(
          q.expectedExpirationTime * 1000
        ).toISOString()}`
      );
    }
    if (q.latestExpirationTime) {
      console.log(
        `  Latest Expiration: ${new Date(
          q.latestExpirationTime * 1000
        ).toISOString()}`
      );
    }
    if (q.createdAt) {
      console.log(
        `  Created At: ${new Date(q.createdAt * 1000).toISOString()}`
      );
    }
  });

  console.log(`\nTotal: ${questions.length} question(s)`);
}

if (require.main === module) {
  getAllQuestions()
    .then((questions) => {
      printQuestionsList(questions);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
