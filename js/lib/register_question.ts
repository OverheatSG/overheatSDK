import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import * as crypto from "crypto";
import { getProgramId, getIdl, encodeArweaveId } from "./types";
import { getConfig } from "./config";
import { uploadQuestionToArweave, fetchQuestionFromArweave } from "../utils/arweave";

/**
 * Parameters for registering a new question
 */
export interface RegisterQuestionParams {
  /** The question text (max 500 bytes) */
  questionText: string;
  /** Expected expiration time as Unix timestamp (seconds) */
  expectedExpirationTime: number;
  /** Latest expiration time as Unix timestamp (seconds) */
  latestExpirationTime: number;
  /** Category string (max 100 bytes) */
  category: string;
  /** Rules description string (stored on Arweave) */
  rules: string;
}

/**
 * Result of registering a question
 */
export interface RegisterQuestionResult {
  /** Whether the registration was successful */
  success: boolean;
  /** Public key address of the created question account */
  questionAddress: string;
  /** Transaction signature */
  transaction: string;
  /** Arweave transaction ID where the rules are stored */
  arweaveId: string;
}

/**
 * Register a new question on the blockchain
 * 
 * This function:
 * 1. Uploads the question rules to Arweave
 * 2. Calculates the PDA (Program Derived Address) for the question
 * 3. Calls the register_question instruction on the Solana program
 * 
 * @param params - Question registration parameters
 * @param wallet - Anchor wallet instance for signing transactions
 * @param walletKeypair - Keypair for Arweave upload payment
 * @returns RegisterQuestionResult with question address and transaction info
 * @throws Error if registration fails
 */
export async function registerQuestion(
  params: RegisterQuestionParams,
  wallet: anchor.Wallet,
  walletKeypair: Keypair
): Promise<RegisterQuestionResult> {
  const config = getConfig();
  const idl = getIdl();
  const programId = getProgramId();
  
  const connection = new anchor.web3.Connection(config.rpcUrl, {
    commitment: "confirmed",
    wsEndpoint: config.wsUrl,
  });
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = new anchor.Program(idl as anchor.Idl, provider);

  const uploadResult = await uploadQuestionToArweave(
    {
      questionText: params.questionText,
      rules: params.rules,
    },
    walletKeypair
  );
  
  // Convert Arweave transaction ID to exactly 44 bytes Buffer for contract storage
  const arweaveIdForAnchor = encodeArweaveId(uploadResult.transactionId);

  // Calculate PDA for the question account
  // Use SHA256 hash to match Rust's Sha256::digest
  // IMPORTANT: The question_text used here must EXACTLY match what's passed to the instruction
  const questionTextBytes = Buffer.from(params.questionText, "utf8");
  const questionHash = crypto.createHash("sha256").update(questionTextBytes).digest();
  const questionHashPrefix = questionHash.slice(0, 8);
  
  const [questionPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("question"),
      wallet.publicKey.toBuffer(),
      questionHashPrefix, // First 8 bytes of SHA256 hash
    ],
    programId
  );

  // Use Anchor SDK - it will automatically verify the PDA matches the seeds
  // Anchor extracts question_text from instruction parameters and recalculates seeds
  // The seeds are: ["question", authority, Sha256(question_text.as_bytes())[0..8]]
  try {
    const tx = await program.methods
      .registerQuestion(
        params.questionText, // Must match exactly what we used for PDA calculation
        new anchor.BN(params.expectedExpirationTime),
        new anchor.BN(params.latestExpirationTime),
        params.category,
        arweaveIdForAnchor // Pass Buffer directly - Anchor expects Buffer for bytes type
      )
      .accounts({
        question: questionPda, // Anchor will verify this matches the seeds derived from instruction params
        authority: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    return {
      success: true,
      questionAddress: questionPda.toString(),
      transaction: tx,
      arweaveId: uploadResult.transactionId,
    };
  } catch (error: any) {
    throw error;
  }
}
