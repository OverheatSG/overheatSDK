import { Contract, Interface, ethers, type Provider, type Signer } from "ethers";
import type { QuestionInfo } from "../types";
import { MAX_OUTCOMES } from "../utils/outcomes";

import OverheatAbi from "./abi.json";

const ABI = OverheatAbi as readonly unknown[];

export { ABI };

const INTERFACE = new Interface(ABI as ethers.InterfaceAbi);

const ERROR_HINTS: Record<string, string> = {
  QuestionAlreadyExists:
    "Same authority + question_text already registered. Use a different question or wallet.",
  QuestionTooLong:
    "question_text (max 500), category (max 100), outcome labels (max 20 chars), or array lengths exceeded.",
  InvalidArweaveId: "Arweave id bytes must be exactly 44.",
  QuestionDoesNotExist: "No question with this questionId.",
  Unauthorized: "Only the question authority can call this.",
  IndexOutOfBounds: "Index out of range.",
};

interface RawQuestion {
  authority: string;
  outcome_count?: bigint;
  created_at: bigint;
  createdAt?: bigint;
  expected_expiration_time: bigint;
  expectedExpirationTime?: bigint;
  latest_expiration_time: bigint;
  latestExpirationTime?: bigint;
  answers: readonly bigint[];
  outcomes: string;
  question_text: string;
  questionText?: string;
  category: string;
  explanation_arweave_id: string;
  explanationArweaveId?: string;
  rules_arweave_id: string;
  rulesArweaveId?: string;
  early_resolution_threshold: bigint;
  earlyResolutionThreshold?: bigint;
}

export function parseContractError(
  data: string | undefined
): { name: string; hint?: string } | null {
  if (!data || typeof data !== "string" || !data.startsWith("0x")) return null;
  try {
    const parsed = INTERFACE.parseError(data);
    if (!parsed) return null;
    return { name: parsed.name, hint: ERROR_HINTS[parsed.name] };
  } catch {
    return null;
  }
}

export function wrapContractError(
  err: unknown,
  _context?: string
): void {
  const e = err as { code?: string; data?: string; info?: { error?: { data?: string } } };
  if (e.code !== "CALL_EXCEPTION") return;
  const data = e.data ?? e.info?.error?.data;
  const parsed = parseContractError(data);
  if (parsed) {
    const msg = `Contract reverted: ${parsed.name}. ${parsed.hint ?? ""}`.trim();
    throw new Error(msg);
  }
}

export function normalizeQuestion(
  raw: RawQuestion | null | undefined,
  address: string
): QuestionInfo | null {
  const value = (name: keyof RawQuestion, index: number) =>
    (raw as any)?.[name] ?? (raw as any)?.[index];

  const authority = value("authority", 0) as string | undefined;
  if (!raw || !authority || authority === ethers.ZeroAddress) {
    return null;
  }
  const outcomesStr = (value("outcomes", 6) as string | undefined) ?? "";
  const outcomesArray = outcomesStr
    ? outcomesStr.split("|").slice(0, MAX_OUTCOMES)
    : [];
  const rawAnswers = Array.isArray(value("answers", 5))
    ? (value("answers", 5) as readonly bigint[])
    : [];
  const answers: (boolean | null)[] = [];
  for (let i = 0; i < outcomesArray.length && i < rawAnswers.length; i++) {
    const v = Number(rawAnswers[i] ?? -1n);
    if (v === 1) {
      answers.push(true);
    } else if (v === 0) {
      answers.push(false);
    } else {
      answers.push(null);
    }
  }
  const earlyStr =
    value("early_resolution_threshold", 11) != null
      ? ethers.formatEther(value("early_resolution_threshold", 11) as bigint)
      : "0";
  return {
    address,
    authority,
    createdAt: (value("created_at", 2) as bigint | undefined) ?? 0n,
    expectedExpirationTime:
      (value("expected_expiration_time", 3) as bigint | undefined) ?? 0n,
    latestExpirationTime:
      (value("latest_expiration_time", 4) as bigint | undefined) ?? 0n,
    questionText: (value("question_text", 7) as string | undefined) ?? "",
    category: (value("category", 8) as string | undefined) ?? "",
    explanation: "",
    outcomes: outcomesArray,
    rules: "",
    answers,
    earlyResolutionThreshold: parseFloat(earlyStr) || 0,
  };
}

const BYTES32_HEX = /^0x[0-9a-fA-F]{64}$/;

export function toBytes32Hex(value: string): string {
  if (typeof value !== "string" || !value) {
    throw new Error(
      "questionId must be a non-empty string (bytes32 hex: 0x + 64 hex characters)."
    );
  }
  const hex = value.startsWith("0x") ? value : "0x" + value;
  if (!BYTES32_HEX.test(hex)) {
    throw new Error(
      "questionId must be a bytes32 hex string (0x followed by 64 hex characters). " +
        "On EVM use the value returned by register_question or from get_all_questions. " +
        `You passed: '${value}' (not valid hex; if this is a Solana/Base58 id, use the EVM questionId instead).`
    );
  }
  return hex;
}

export function getContract(
  contractAddress: string | undefined,
  providerOrSigner: Provider | Signer
): Contract {
  if (!contractAddress) {
    throw new Error(
      "EVM contractAddress is not configured. Please set it in the SDK config."
    );
  }
  return new Contract(contractAddress, ABI as ethers.InterfaceAbi, providerOrSigner);
}
