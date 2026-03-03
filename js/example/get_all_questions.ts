#!/usr/bin/env node

import { getAllQuestions } from "../lib/get_all_questions";
import { printQuestionsList } from "../lib/display";

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
