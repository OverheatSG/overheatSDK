import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import * as crypto from "crypto";
import { getProgramId, getIdl } from "./types";
import { getConfig } from "./config";
import { uploadQuestionToArweave, fetchQuestionFromArweave } from "../utils/arweave";

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
    programId
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
  const explorerUrl = config.explorerCluster 
    ? `https://explorer.solana.com/tx/${tx}?cluster=${config.explorerCluster}`
    : `https://explorer.solana.com/tx/${tx}`;
  console.log(`Explorer: ${explorerUrl}`);
  console.log(`Question address: ${questionPda.toString()}`);

  return {
    success: true,
    questionAddress: questionPda.toString(),
    transaction: tx,
    arweaveId: uploadResult.transactionId,
  };
}
