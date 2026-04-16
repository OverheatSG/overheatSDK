import * as anchor from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import type { QuestionInfo, TimeRangeFilter } from "../types";
import type { NetworkConfig } from "../config";
import { decodeBytesToString, decodeArweaveId, getIdl } from "./types";
import { buildQuestionInfoFromAccount } from "./utils";

export async function get_questions_by_time_range(
  config: NetworkConfig,
  timeRange?: TimeRangeFilter
): Promise<QuestionInfo[]> {
  const idl = getIdl(config);

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
    const createdAt = BigInt(questionData.createdAt.toString());

    if (timeRange) {
      if (
        timeRange.startTime !== undefined &&
        createdAt < timeRange.startTime
      ) {
        continue;
      }
      if (
        timeRange.endTime !== undefined &&
        createdAt > timeRange.endTime
      ) {
        continue;
      }
    }

    const info = await buildQuestionInfoFromAccount(
      account.publicKey,
      questionData,
      config
    );
    questions.push({
      ...info,
      createdAt,
    });
  }

  questions.sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
  return questions;
}
