import { ethers } from "ethers";
import type { NetworkConfig } from "../config";
import type { QuestionInfo } from "../types";
import {
  fetchQuestionFromArweave,
  fetchExplanationFromArweave,
  decodeArweaveId,
} from "../arweave/arweave";

/**
 * Attach off-chain metadata (rules, explanation) to a normalized QuestionInfo
 * using the raw contract question tuple and current network config.
 */
export async function attachOffchainMetadata(
  raw: unknown,
  q: QuestionInfo,
  config: NetworkConfig
): Promise<QuestionInfo> {
  const rawValue = (name: string, index: number) =>
    raw ? (raw as any)[name] ?? (raw as any)[index] : undefined;
  const rulesIdBytes = raw
    ? ethers.getBytes(rawValue("rules_arweave_id", 10) as string)
    : new Uint8Array(0);
  const explanationIdBytes = raw
    ? ethers.getBytes(rawValue("explanation_arweave_id", 9) as string)
    : new Uint8Array(0);

  const rulesIdStr = decodeArweaveId(rulesIdBytes);
  const explanationIdStr = decodeArweaveId(explanationIdBytes);

  let rules = q.rules;
  let explanation = q.explanation;

  if (rulesIdStr) {
    try {
      rules = (await fetchQuestionFromArweave(rulesIdStr, config)).rules;
    } catch {
      // Arweave fetch is best-effort; keep on-chain/default rules on failure.
    }
  }
  if (explanationIdStr) {
    try {
      explanation = (
        await fetchExplanationFromArweave(explanationIdStr, config)
      ).explanation;
    } catch {
      // Arweave fetch is best-effort; keep on-chain/default explanation on failure.
    }
  }

  return { ...q, rules, explanation };
}
