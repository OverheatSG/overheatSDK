import { Contract, Interface, ethers, type Provider, type Signer } from "ethers";
import type { QuestionInfo } from "../types";

import OverheatAbi from "./abi.json";

const ABI = OverheatAbi as readonly unknown[];

export { ABI };

const INTERFACE = new Interface(ABI as ethers.InterfaceAbi);

const ERROR_HINTS: Record<string, string> = {
  QuestionAlreadyExists:
    "Same authority + question_text already registered. Use a different question or wallet.",
  QuestionTooLong:
    "question_text (max 500), category (max 100), or explanation (max 200) exceeded.",
  InvalidArweaveId: "arweave_id must be exactly 44 bytes.",
  QuestionDoesNotExist: "No question with this questionId.",
  Unauthorized: "Only the question authority can call this.",
  IndexOutOfBounds: "Index out of range.",
};

interface RawQuestion {
  authority: string;
  created_at: bigint;
  expected_expiration_time: bigint;
  latest_expiration_time: bigint;
  answer: number;
  question_text: string;
  category: string;
  explanation: string;
  arweave_id: string;
  early_resolution_threshold: bigint;
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
  if (!raw || raw.authority === ethers.ZeroAddress) {
    return null;
  }
  const answerNum = Number(raw.answer ?? 0);
  const hasAnswer = answerNum !== 0;
  const answerBool = answerNum === 2;
  const earlyStr =
    raw.early_resolution_threshold != null
      ? ethers.formatEther(raw.early_resolution_threshold)
      : "0";
  return {
    address,
    authority: raw.authority,
    createdAt: raw.created_at ?? 0n,
    expectedExpirationTime: raw.expected_expiration_time ?? 0n,
    latestExpirationTime: raw.latest_expiration_time ?? 0n,
    questionText: raw.question_text ?? "",
    category: raw.category ?? "",
    explanation: raw.explanation ?? "",
    rules: "",
    answer: hasAnswer ? (answerBool ? "Yes" : "No") : null,
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
