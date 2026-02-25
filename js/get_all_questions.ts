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

export async function getAllQuestions(): Promise<QuestionInfo[]> {
  const connection = new Connection(RPC_URL, "confirmed");
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(anchor.web3.Keypair.generate()),
    { commitment: "confirmed" }
  );
  const program = new anchor.Program(idl as anchor.Idl, provider);

  const QUESTION_ACCOUNT_SIZE = 8 + 32 + 4 + 500 + 1 + 1 + 8 + 8;
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ dataSize: QUESTION_ACCOUNT_SIZE }],
  });

  const questions: QuestionInfo[] = [];

  for (const accountInfo of accounts) {
    try {
      const questionData = decodeQuestionAccount(accountInfo.account.data);
      questions.push({
        address: accountInfo.pubkey.toString(),
        authority: questionData.authority.toString(),
        questionText: questionData.questionText,
        answer: questionData.answer === null ? null : questionData.answer ? "Yes" : "No",
        createdAt: new Date(questionData.createdAt.toNumber() * 1000).toISOString(),
        updatedAt: new Date(questionData.updatedAt.toNumber() * 1000).toISOString(),
      });
    } catch (error) {
      // Skip invalid accounts
    }
  }

  return questions;
}

if (require.main === module) {
  getAllQuestions()
    .then((questions) => {
      if (questions.length === 0) {
        console.log("No questions found.");
      } else {
        questions.forEach((q, index) => {
          console.log(`[${index + 1}]`);
          console.log(`  Address: ${q.address}`);
          console.log(`  Question: ${q.questionText}`);
          console.log(`  Answer: ${q.answer || "Not answered"}`);
        });
        console.log(`\nTotal: ${questions.length} question(s)`);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
