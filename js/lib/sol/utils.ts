import { PublicKey } from "@solana/web3.js";
import type { NetworkConfig } from "../config";
import type { QuestionInfo } from "../types";
import { MAX_OUTCOMES } from "../utils/outcomes";
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
    try {
      const arweaveData = await fetchQuestionFromArweave(
        rulesId.trim(),
        config
      );
      rules = arweaveData.rules;
    } catch {
      // Arweave fetch is best-effort; keep default rules on failure.
    }
  }

  if (explanationId && explanationId.trim().length > 0) {
    try {
      const data = await fetchExplanationFromArweave(
        explanationId.trim(),
        config
      );
      explanation = data.explanation;
    } catch {
      // Arweave fetch is best-effort; keep default explanation on failure.
    }
  }

  const outcomesStr = decodeBytesToString(accountData.outcomes);
  const outcomes: string[] = outcomesStr
    ? outcomesStr.split("|").slice(0, MAX_OUTCOMES)
    : [];

  // answers: Array<Option<bool>> with fixed length (MAX_OUTCOMES).
  const rawAnswers: unknown[] = Array.isArray(accountData.answers)
    ? accountData.answers
    : [];
  const answers: (boolean | null)[] = [];
  for (let i = 0; i < outcomes.length && i < rawAnswers.length; i++) {
    const v = rawAnswers[i];
    const isTrue =
      typeof v === "boolean"
        ? v
        : v && typeof v === "object" && "some" in (v as any)
        ? Boolean((v as any).some)
        : false;
    const isSome =
      v != null &&
      (typeof v === "boolean" ||
        (typeof v === "object" && "some" in (v as any)));
    answers.push(isSome ? (isTrue ? true : false) : null);
  }

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
    answers,
    earlyResolutionThreshold:
      Number(accountData.earlyResolutionThresholdBps ?? 0) / 10_000,
  };
}
