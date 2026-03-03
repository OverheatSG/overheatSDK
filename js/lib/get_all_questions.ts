import * as anchor from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import {
  QuestionInfo,
  decodeBytesToString,
  decodeArweaveId,
  getIdl,
} from "./types";
import { getConfig } from "./config";
import { fetchQuestionFromArweave } from "../utils/arweave";

/**
 * Get all registered questions from the blockchain
 * Fetches question data from on-chain accounts and retrieves rules from Arweave
 * @returns Array of QuestionInfo objects for all registered questions
 */
export async function getAllQuestions(): Promise<QuestionInfo[]> {
  const config = getConfig();
  const idl = getIdl();
  
  const connection = new Connection(config.rpcUrl, {
    commitment: "confirmed",
    wsEndpoint: config.wsUrl,
  });
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(anchor.web3.Keypair.generate()),
    { commitment: "confirmed" }
  );
  const program = new anchor.Program(idl as anchor.Idl, provider) as any;

  const accounts = await program.account.question.all();
  const questions: QuestionInfo[] = [];

  for (const account of accounts) {
    const questionData = account.account;
    const arweaveId = decodeArweaveId(questionData.arweaveId);
    
    // Fetch rule from Arweave
    let rule = "";
    try {
      if (arweaveId && arweaveId.trim().length > 0) {
        const arweaveData = await fetchQuestionFromArweave(arweaveId.trim());
        rule = arweaveData.rule;
      }
    } catch (error) {
      // If fetching from Arweave fails, rule will remain empty string
    }
    
    questions.push({
      address: account.publicKey.toString(),
      authority: questionData.authority.toString(),
      createdAt: questionData.createdAt.toNumber(),
      expectedExpirationTime: questionData.expectedExpirationTime.toNumber(),
      latestExpirationTime: questionData.latestExpirationTime.toNumber(),
      questionText: decodeBytesToString(questionData.questionText),
      category: decodeBytesToString(questionData.category),
      explanation: decodeBytesToString(questionData.explanation),
      rule: rule,
      answer: questionData.answer === null ? null : questionData.answer ? "Yes" : "No",
    });
  }

  return questions;
}
