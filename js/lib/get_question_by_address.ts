import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import {
  QuestionInfo,
  decodeBytesToString,
  decodeArweaveId,
  getIdl,
} from "./types";
import { getConfig } from "./config";
import { fetchQuestionFromArweave } from "../utils/arweave";

/**
 * Get a specific question by its address (public key)
 * Fetches question data from on-chain account and retrieves rule from Arweave
 * @param address - Public key address of the question account
 * @returns QuestionInfo object if found, null otherwise
 */
export async function getQuestionByAddress(address: string): Promise<QuestionInfo | null> {
  const config = getConfig();
  const idl = getIdl();
  const questionAddress = new PublicKey(address);
  
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

  try {
    // Fetch account data
    const questionData = await program.account.question.fetch(questionAddress);
    
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
    
    return {
      address: questionAddress.toString(),
      authority: questionData.authority.toString(),
      createdAt: questionData.createdAt.toNumber(),
      expectedExpirationTime: questionData.expectedExpirationTime.toNumber(),
      latestExpirationTime: questionData.latestExpirationTime.toNumber(),
      questionText: decodeBytesToString(questionData.questionText),
      category: decodeBytesToString(questionData.category),
      explanation: decodeBytesToString(questionData.explanation),
      rules: rules,
      answer: questionData.answer === null ? null : questionData.answer ? "Yes" : "No",
    };
  } catch (error) {
    return null;
  }
}
