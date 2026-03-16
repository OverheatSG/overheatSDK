import { PublicKey } from "@solana/web3.js";
import type { NetworkConfig } from "../config";
import type { QuestionInfo } from "../types";
import { decodeBytesToString, decodeArweaveId } from "./types";
import {
  fetchQuestionFromArweave,
  fetchExplanationFromArweave,
} from "../arweave/arweave";

/**
 * Build a normalized QuestionInfo from a Solana Question account + pubkey,
 * including off-chain rules/explanation from Arweave.
 */
export async function buildQuestionInfoFromAccount(
  pubkey: PublicKey,
  accountData: any,
  config: NetworkConfig
): Promise<QuestionInfo> {
  const rulesId = decodeArweaveId(accountData.rulesArweaveId as Uint8Array);
  const explanationId = decodeArweaveId(
    accountData.explanationArweaveId as Uint8Array
  );

  let rules = "";
  let explanation = "";

  if (rulesId && rulesId.trim().length > 0) {
    const arweaveData = await fetchQuestionFromArweave(rulesId.trim(), config);
    rules = arweaveData.rules;
  }

  if (explanationId && explanationId.trim().length > 0) {
    const data = await fetchExplanationFromArweave(
      explanationId.trim(),
      config
    );
    explanation = data.explanation;
  }

  const outcomesStr = decodeBytesToString(accountData.outcomes);
  const outcomes: string[] = outcomesStr
    ? outcomesStr.split("|").slice(0, 30)
    : [];

  const answerIndexRaw =
    accountData.answer != null
      ? Number(BigInt(accountData.answer.toString()))
      : -1;
  const answerIndex = answerIndexRaw >= 0 ? answerIndexRaw : null;
  const aggregatedAnswer =
    answerIndex != null &&
    answerIndex >= 0 &&
    answerIndex < outcomes.length
      ? outcomes[answerIndex]
      : null;

  return {
    address: pubkey.toString(),
    authority: accountData.authority.toString(),
    createdAt: BigInt(accountData.createdAt.toString()),
    expectedExpirationTime: BigInt(
      accountData.expectedExpirationTime.toString()
    ),
    latestExpirationTime: BigInt(accountData.latestExpirationTime.toString()),
    questionText: decodeBytesToString(accountData.questionText),
    category: decodeBytesToString(accountData.category),
    explanation,
    outcomes,
    rules,
    aggregatedAnswer,
    earlyResolutionThreshold: accountData.earlyResolutionThreshold ?? 0,
  };
}

