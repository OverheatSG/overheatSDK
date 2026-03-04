import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getIdl } from "./types";
import { getConfig } from "./config";

/**
 * Result of updating an answer
 */
export interface UpdateAnswerResult {
  /** Whether the update was successful */
  success: boolean;
  /** Transaction signature */
  transaction: string;
}

/**
 * Update the answer for an existing question
 * 
 * Only the question's authority can update the answer.
 * 
 * @param questionAddress - Public key address of the question account
 * @param answer - Boolean answer (true for Yes, false for No)
 * @param explanation - Explanation string (max 200 bytes)
 * @param earlyResolutionThreshold - Early resolution threshold as a floating point number (f64 on-chain)
 * @param wallet - Anchor wallet instance for signing transactions (must be the question authority)
 * @returns UpdateAnswerResult with transaction signature
 * @throws Error if update fails (e.g., unauthorized, invalid address)
 */
export async function updateAnswer(
  questionAddress: string,
  answer: boolean,
  explanation: string,
  earlyResolutionThreshold: number,
  wallet: anchor.Wallet
): Promise<UpdateAnswerResult> {
  const config = getConfig();
  const idl = getIdl();
  
  const connection = new anchor.web3.Connection(config.rpcUrl, {
    commitment: "confirmed",
    wsEndpoint: config.wsUrl,
  });
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = new anchor.Program(idl as anchor.Idl, provider);
  const questionPubkey = new PublicKey(questionAddress);

  const tx = await program.methods
    .updateAnswer(answer, explanation, earlyResolutionThreshold)
    .accounts({
      question: questionPubkey,
      authority: wallet.publicKey,
    })
    .rpc();

  return {
    success: true,
    transaction: tx,
  };
}
