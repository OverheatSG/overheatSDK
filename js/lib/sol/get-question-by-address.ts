import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import type { QuestionInfo } from "../types";
import type { NetworkConfig } from "../config";
import {
  decodeBytesToString,
  decodeArweaveId,
  getIdl,
} from "./types";
import { fetchQuestionFromArweave } from "../arweave/arweave";

export async function get_question_by_address(
  questionId: string,
  config: NetworkConfig
): Promise<QuestionInfo | null> {
  const idl = getIdl(config);
  const questionPubkey = new PublicKey(questionId);

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

  const questionData = await program.account.question.fetch(questionPubkey);
  const arweaveId = decodeArweaveId(questionData.arweaveId);

  let rules = "";
  if (arweaveId && arweaveId.trim().length > 0) {
    const arweaveData = await fetchQuestionFromArweave(arweaveId.trim(), config);
    rules = arweaveData.rules;
  }

  return {
    address: questionPubkey.toString(),
    authority: questionData.authority.toString(),
    createdAt: BigInt(questionData.createdAt.toString()),
    expectedExpirationTime: BigInt(questionData.expectedExpirationTime.toString()),
    latestExpirationTime: BigInt(questionData.latestExpirationTime.toString()),
    questionText: decodeBytesToString(questionData.questionText),
    category: decodeBytesToString(questionData.category),
    explanation: decodeBytesToString(questionData.explanation),
    rules,
    answer:
      questionData.answer === null
        ? null
        : questionData.answer
          ? "Yes"
          : "No",
    earlyResolutionThreshold: questionData.earlyResolutionThreshold ?? 0,
  };
}
