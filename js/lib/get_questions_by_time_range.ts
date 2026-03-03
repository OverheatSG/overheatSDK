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
 * Time range filter for querying questions by creation time
 */
export interface TimeRangeFilter {
  /** Start time as Unix timestamp (seconds), inclusive */
  startTime?: number;
  /** End time as Unix timestamp (seconds), inclusive */
  endTime?: number;
}

/**
 * Get all questions filtered by creation time range
 * 
 * Uses the `created_at` field stored in the Question account for efficient filtering.
 * Reads the creation time directly from account data, no need to query transaction history.
 * 
 * @param timeRange - Optional time range filter
 * @returns Array of QuestionInfo matching the time range, sorted by creation time (oldest first)
 */
export async function getQuestionsByTimeRange(
  timeRange?: TimeRangeFilter
): Promise<QuestionInfo[]> {
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

  // Get all question accounts
  // Note: memcmp only supports equality, so we can't use it for range queries directly
  // We'll fetch all accounts and filter in memory for simplicity
  const accounts = await program.account.question.all();
  const questions: QuestionInfo[] = [];

  for (const account of accounts) {
    const questionData = account.account;
    const createdAt = questionData.createdAt.toNumber();
    
    // Apply time filter if provided (in-memory filtering for range queries)
    if (timeRange) {
      if (timeRange.startTime !== undefined) {
        if (createdAt < timeRange.startTime) {
          continue; // Skip questions created before start time
        }
      }
      if (timeRange.endTime !== undefined) {
        if (createdAt > timeRange.endTime) {
          continue; // Skip questions created after end time
        }
      }
    }

    const arweaveId = decodeArweaveId(questionData.arweaveId);
    
    // Fetch rules from Arweave
    let rules = "";
    try {
      if (arweaveId && arweaveId.trim().length > 0) {
        const arweaveData = await fetchQuestionFromArweave(arweaveId.trim());
        rules = arweaveData.rules;
      }
    } catch (error) {
      // If fetching from Arweave fails, rules will remain empty string
    }
    
    questions.push({
      address: account.publicKey.toString(),
      authority: questionData.authority.toString(),
      createdAt: createdAt,
      expectedExpirationTime: questionData.expectedExpirationTime.toNumber(),
      latestExpirationTime: questionData.latestExpirationTime.toNumber(),
      questionText: decodeBytesToString(questionData.questionText),
      category: decodeBytesToString(questionData.category),
      explanation: decodeBytesToString(questionData.explanation),
      rules: rules,
      answer: questionData.answer === null ? null : questionData.answer ? "Yes" : "No",
    });
  }

  // Sort by creation time (oldest first)
  questions.sort((a, b) => {
    return a.createdAt - b.createdAt;
  });

  return questions;
}

/**
 * Get questions created after a specific time
 * @param startTime - Unix timestamp (seconds)
 * @returns Array of QuestionInfo created after startTime
 */
export async function getQuestionsAfterTime(
  startTime: number
): Promise<QuestionInfo[]> {
  return getQuestionsByTimeRange({ startTime });
}

/**
 * Get questions created before a specific time
 * @param endTime - Unix timestamp (seconds)
 * @returns Array of QuestionInfo created before endTime
 */
export async function getQuestionsBeforeTime(
  endTime: number
): Promise<QuestionInfo[]> {
  return getQuestionsByTimeRange({ endTime });
}
