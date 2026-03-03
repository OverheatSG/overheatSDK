import { QuestionInfo } from "./types";

/**
 * Print a single question in detailed format
 * Used for displaying a single question's full information
 * @param question - QuestionInfo object to display
 */
export function printQuestionDetail(question: QuestionInfo): void {
  console.log("Question Details:");
  console.log("=".repeat(80));
  console.log(`Address: ${question.address}`);
  console.log(`Authority: ${question.authority}`);
  console.log(`Category: ${question.category || "N/A"}`);
  console.log(`Question: ${question.questionText}`);
  console.log(`Rules: ${question.rules}`);
  console.log(`Answer: ${question.answer || "Not answered"}`);
  console.log(`Explanation: ${question.explanation}`);
  if (question.expectedExpirationTime) {
    console.log(`Expected Expiration Time: ${new Date(question.expectedExpirationTime * 1000).toISOString()}`);
  }
  if (question.latestExpirationTime) {
    console.log(`Latest Expiration Time: ${new Date(question.latestExpirationTime * 1000).toISOString()}`);
  }
  if (question.createdAt) {
    console.log(`Created At: ${new Date(question.createdAt * 1000).toISOString()}`);
  }
  console.log("=".repeat(80));
}

/**
 * Print a question in summary format (for lists)
 * Used for displaying questions in a list format
 * @param question - QuestionInfo object to display
 * @param index - Optional index number for the question in the list
 */
export function printQuestionSummary(question: QuestionInfo, index?: number): void {
  if (index !== undefined) {
    console.log(`[${index + 1}]`);
  }
  console.log(`  Address: ${question.address}`);
  console.log(`  Category: ${question.category || "N/A"}`);
  console.log(`  Question: ${question.questionText}`);
  console.log(`  Rules: ${question.rules}`);
  console.log(`  Answer: ${question.answer || "Not answered"}`);
  console.log(`  Explanation: ${question.explanation}`);
  if (question.expectedExpirationTime) {
    console.log(`  Expected Expiration: ${new Date(question.expectedExpirationTime * 1000).toISOString()}`);
  }
  if (question.latestExpirationTime) {
    console.log(`  Latest Expiration: ${new Date(question.latestExpirationTime * 1000).toISOString()}`);
  }
  if (question.createdAt) {
    console.log(`  Created At: ${new Date(question.createdAt * 1000).toISOString()}`);
  }
}

/**
 * Print multiple questions in a list format
 * @param questions - Array of QuestionInfo objects to display
 * @param header - Optional header message to display before the list
 */
export function printQuestionsList(questions: QuestionInfo[], header?: string): void {
  if (header) {
    console.log(header);
    console.log("=".repeat(80));
  }
  
  if (questions.length === 0) {
    console.log("No questions found.");
    return;
  }
  
  questions.forEach((q, index) => {
    printQuestionSummary(q, index);
  });
  
  if (header) {
    console.log("=".repeat(80));
  }
  
  console.log(`\nTotal: ${questions.length} question(s)`);
}
