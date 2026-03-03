#!/usr/bin/env node

import { getQuestionsAfterTime } from "../lib/get_questions_by_time_range";
import { printQuestionsList } from "../lib/display";

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error("Usage: get_questions_by_created_time.ts <start_time>");
    console.error("\nArguments:");
    console.error("  start_time: Unix timestamp (seconds), inclusive");
    console.error("\nExample:");
    console.error("  get_questions_by_created_time.ts 1704067200");
    console.error("\nNote: Uses the 'created_at' field stored in the Question account for efficient filtering.");
    process.exit(1);
  }

  const startTime = parseInt(args[0], 10);
  if (isNaN(startTime)) {
    console.error("Error: start_time must be a valid number (Unix timestamp)");
    process.exit(1);
  }

  getQuestionsAfterTime(startTime)
    .then((questions) => {
      const header = `\nFound ${questions.length} questions created after ${new Date(startTime * 1000).toISOString()}:`;
      printQuestionsList(questions, header);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
