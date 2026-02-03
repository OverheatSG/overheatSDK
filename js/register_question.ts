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
  category: string,
  expectedExpirationTime: number,
  latestExpirationTime: number,
  question: string,
  walletPath: string
): Promise<RegisterQuestionResult> {
  const expectedExpirationTimeStr = new Date(expectedExpirationTime * 1000).toISOString();
  const latestExpirationTimeStr = new Date(latestExpirationTime * 1000).toISOString();
  const questionText = `${category} | ${expectedExpirationTimeStr} | ${latestExpirationTimeStr} | ${question}`;
  
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
  if (args.length < 4) {
    console.error("Usage: register_question.ts <category> <expected_expiration_timestamp> <latest_expiration_timestamp> <question> [wallet_path]");
    console.error("Example: register_question.ts 'Crypto' 1704583500 1704063000 'SOL Up or Down - 15 minutes - Jan 30 - 6:30PM EST to 6:45PM EST'");
    process.exit(1);
  }

  const category = args[0];
  const expectedExpirationTime = parseInt(args[1], 10);
  const latestExpirationTime = parseInt(args[2], 10);
  const question = args[3];
  const walletPath = expandPath(
    args[4] || process.env.ANCHOR_WALLET || "~/.config/solana/id.json"
  );

  if (isNaN(expectedExpirationTime) || isNaN(latestExpirationTime)) {
    console.error("Error: expected_expiration_timestamp and latest_expiration_timestamp must be valid numbers (Unix timestamps)");
    process.exit(1);
  }

  registerQuestion(category, expectedExpirationTime, latestExpirationTime, question, walletPath)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
