import type { Wallet as AnchorWallet } from "@coral-xyz/anchor";

/** Unified signer: pass this to registerQuestion / updateAnswer instead of chain-specific wallet/signer. */
export type ChainSigner =
  | { chain: "solana"; wallet: AnchorWallet }
  | { chain: "evm"; privateKeyHex: string };

export interface QuestionInfo {
  address: string;
  authority: string;
  /** Chain timestamp (seconds), use bigint to avoid number precision loss. */
  createdAt: bigint;
  /** Chain timestamp (seconds). */
  expectedExpirationTime: bigint;
  /** Chain timestamp (seconds). */
  latestExpirationTime: bigint;
  questionText: string;
  category: string;
  /** Human-readable explanation text (if available). Currently not populated by the new contracts, kept for backwards compatibility. */
  explanation: string;
  /** Outcome labels for the question (decoded from '|' separated string). */
  outcomes: string[];
  rules: string;
  /** Per-outcome answers: null / false / true, length = outcomes.length (up to MAX_OUTCOMES). */
  answers: (boolean | null)[];
  earlyResolutionThreshold: number;
}

export interface TimeRangeFilter {
  startTime?: bigint;
  endTime?: bigint;
}

export interface RegisterQuestionParams {
  questionText: string;
  rules: string;
  /** Outcome labels, up to 32 entries; SDK will trim to 32 and encode as '|' separated string on-chain. */
  outcomes: string[];
  expectedExpirationTime: number;
  latestExpirationTime: number;
  category: string;
  /**
   * Early resolution threshold, as a floating-point fraction (e.g. 0.5).
   *
   * On Solana this is passed directly as f64.
   * On EVM this is converted via ethers.parseEther for fixed-point precision.
   */
  earlyResolutionThreshold: number;
}

export interface RegisterQuestionResult {
  questionAddress: string;
  txHash: string;
}

export interface UpdateAnswerOptions {
  questionAddress: string;
  /**
   * Per-outcome resolution (same semantics as {@link QuestionInfo.answers}).
   * Pass only the slots you need (length ≤ MAX_OUTCOMES); SDK pads with null to full on-chain length.
   */
  answers: (boolean | null)[];
  /** Human-readable explanation text; will be uploaded to Arweave and only the ID is stored on-chain. */
  explanation: string;
}
