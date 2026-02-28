import * as anchor from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import {
  QuestionInfo,
  decodeBytesToString,
  getIdl,
} from "./types";
import { getConfig } from "./config";

export async function getAllQuestions(): Promise<QuestionInfo[]> {
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

  const accounts = await program.account.question.all();
  const questions: QuestionInfo[] = [];

  for (const account of accounts) {
    const questionData = account.account;
    questions.push({
      address: account.publicKey.toString(),
      authority: questionData.authority.toString(),
      expectedExpirationTime: questionData.expectedExpirationTime.toNumber(),
      latestExpirationTime: questionData.latestExpirationTime.toNumber(),
      questionText: decodeBytesToString(questionData.questionText),
      category: decodeBytesToString(questionData.category),
      extension: decodeBytesToString(questionData.extension),
      arweaveId: decodeBytesToString(questionData.arweaveId),
      answer: questionData.answer === null ? null : questionData.answer ? "Yes" : "No",
    });
  }

  return questions;
}
