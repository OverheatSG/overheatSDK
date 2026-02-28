import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { PROGRAM_ID } from "./types";
import { RPC_URL, WS_URL } from "./config";
import { uploadQuestionToArweave, fetchQuestionFromArweave } from "../utils/arweave";

const idlPath = path.join(__dirname, "overheat.json");
const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));

export interface RegisterQuestionParams {
  questionText: string;
  expectedExpirationTime: number;
  latestExpirationTime: number;
  category: string;
  rule: string;
}

export interface RegisterQuestionResult {
  success: boolean;
  questionAddress: string;
  transaction: string;
  arweaveId: string;
}

export async function registerQuestion(
  params: RegisterQuestionParams,
  wallet: anchor.Wallet,
  walletKeypair: Keypair
): Promise<RegisterQuestionResult> {
  const connection = new anchor.web3.Connection(RPC_URL, {
    commitment: "confirmed",
    wsEndpoint: WS_URL,
  });
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = new anchor.Program(idl as anchor.Idl, provider);

  const uploadResult = await uploadQuestionToArweave(
    {
      questionText: params.questionText,
      rule: params.rule,
    },
    walletKeypair
  );
  
  const fetchedData = await fetchQuestionFromArweave(uploadResult.transactionId);
  console.log("Arweave upload verification:");
  console.log(`  Question Text: ${fetchedData.questionText}`);
  console.log(`  Rule: ${fetchedData.rule}`);
  console.log(`  Match: ${fetchedData.questionText === params.questionText && fetchedData.rule === params.rule ? "✓" : "✗"}`);
  
  const arweaveIdBuffer = Buffer.from(uploadResult.transactionId, "utf8");

  const questionHash = crypto.createHash("sha256").update(params.questionText).digest();
  const [questionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("question"), wallet.publicKey.toBuffer(), Buffer.from(questionHash.slice(0, 8))],
    PROGRAM_ID
  );

  const tx = await program.methods
    .registerQuestion(
      params.questionText,
      new anchor.BN(params.expectedExpirationTime),
      new anchor.BN(params.latestExpirationTime),
      params.category,
      arweaveIdBuffer
    )
    .accounts({
      question: questionPda,
      authority: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log(`Transaction: ${tx}`);
  console.log(`Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  console.log(`Question address: ${questionPda.toString()}`);

  return {
    success: true,
    questionAddress: questionPda.toString(),
    transaction: tx,
    arweaveId: uploadResult.transactionId,
  };
}
