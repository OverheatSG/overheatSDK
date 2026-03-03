#!/usr/bin/env node

import { getAllQuestions, printQuestionsList } from "overheat-sdk";

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
