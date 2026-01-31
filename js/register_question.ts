#!/usr/bin/env node

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const idlPath = path.join(__dirname, "overheat.json");
const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
const PROGRAM_ID = new PublicKey(idl.address);
const RPC_URL = "https://api.zan.top/node/v1/solana/devnet/85f8917431284c59abfeaeb2e32a0d87";

function expandPath(filePath: string): string {
  return filePath.startsWith("~")
    ? path.join(process.env.HOME || os.homedir(), filePath.slice(1))
    : filePath;
}

export interface RegisterQuestionResult {
  success: boolean;
  questionAddress: string;
  transaction: string;
}

export async function registerQuestion(
  questionText: string,
  walletPath: string
): Promise<RegisterQuestionResult> {
  const connection = new anchor.web3.Connection(RPC_URL, "confirmed");
  const walletKeypair = anchor.web3.Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(walletPath, "utf8")) as number[])
  );
  const wallet = new anchor.Wallet(walletKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const questionHash = crypto.createHash("sha256").update(questionText).digest();
  const [questionPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("question"), wallet.publicKey.toBuffer(), questionHash.slice(0, 8)],
    PROGRAM_ID
  );

  const instructionDiscriminator = crypto
    .createHash("sha256")
    .update("global:register_question")
    .digest()
    .slice(0, 8);

  const questionTextBuffer = Buffer.from(questionText, "utf8");
  const questionTextLength = Buffer.alloc(4);
  questionTextLength.writeUInt32LE(questionTextBuffer.length, 0);

  const instruction = new anchor.web3.TransactionInstruction({
    keys: [
      { pubkey: questionPda, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: Buffer.concat([instructionDiscriminator, questionTextLength, questionTextBuffer]),
  });

  const transaction = new anchor.web3.Transaction().add(instruction);
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  transaction.sign(walletKeypair);

  const txSignature = await connection.sendRawTransaction(transaction.serialize(), {
    skipPreflight: false,
    maxRetries: 3,
  });

  console.log(`Transaction: ${txSignature}`);
  console.log(`Explorer: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);
  console.log(`Question address: ${questionPda.toString()}`);

  return {
    success: true,
    questionAddress: questionPda.toString(),
    transaction: txSignature,
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: register_question.ts <question_text> [wallet_path]");
    process.exit(1);
  }

  const questionText = args[0];
  const walletPath = expandPath(
    args[1] || process.env.ANCHOR_WALLET || "~/.config/solana/id.json"
  );

  registerQuestion(questionText, walletPath)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
