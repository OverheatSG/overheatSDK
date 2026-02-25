#!/usr/bin/env node

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

const idlPath = path.join(__dirname, "overheat.json");
const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
const PROGRAM_ID = new PublicKey(idl.address);
const RPC_URL = "https://api.zan.top/node/v1/solana/devnet/85f8917431284c59abfeaeb2e32a0d87";

export interface QuestionData {
  authority: PublicKey;
  questionText: string;
  answer: boolean | null;
  createdAt: anchor.BN;
  updatedAt: anchor.BN;
}

export interface QuestionInfo {
  address: string;
  authority: string;
  questionText: string;
  answer: string | null;
  createdAt: string;
  updatedAt: string;
}

function decodeQuestionAccount(data: Buffer | Uint8Array): QuestionData {
  const coder = new anchor.BorshAccountsCoder(idl);
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const question = coder.decode("Question", buffer);
  
  return {
    authority: new PublicKey(question.authority),
    questionText: question.question_text,
    answer: question.answer,
    createdAt: question.created_at,
    updatedAt: question.updated_at,
  };
}

export async function getQuestionByAddress(address: string): Promise<QuestionInfo | null> {
  try {
    const questionAddress = new PublicKey(address);
    const connection = new Connection(RPC_URL, "confirmed");
    const provider = new anchor.AnchorProvider(
      connection,
      new anchor.Wallet(anchor.web3.Keypair.generate()),
      { commitment: "confirmed" }
    );
    const program = new anchor.Program(idl as anchor.Idl, provider);

    const accountInfo = await connection.getAccountInfo(questionAddress);
    
    if (!accountInfo) {
      return null;
    }

    const questionData = decodeQuestionAccount(accountInfo.data);
    
    return {
      address: questionAddress.toString(),
      authority: questionData.authority.toString(),
      questionText: questionData.questionText,
      answer: questionData.answer === null ? null : questionData.answer ? "Yes" : "No",
      createdAt: new Date(questionData.createdAt.toNumber() * 1000).toISOString(),
      updatedAt: new Date(questionData.updatedAt.toNumber() * 1000).toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to get question: ${(error as Error).message}`);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: get_question_by_address.ts <question_address>");
    console.error("Example: get_question_by_address.ts 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");
    process.exit(1);
  }

  const address = args[0];
  
  getQuestionByAddress(address)
    .then((question) => {
      if (!question) {
        console.log("Question not found at the given address.");
        process.exit(1);
      } else {
        console.log("Question Details:");
        console.log("=".repeat(80));
        console.log(`Address: ${question.address}`);
        console.log(`Authority: ${question.authority}`);
        console.log(`Question: ${question.questionText}`);
        console.log(`Answer: ${question.answer || "Not answered"}`);
        console.log(`Created: ${question.createdAt}`);
        console.log(`Updated: ${question.updatedAt}`);
        console.log("=".repeat(80));
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
