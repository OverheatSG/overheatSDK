export type { QuestionInfo } from "../types";

export interface EvmRegisterQuestionParams {
  questionText: string;
  expectedExpirationTime: bigint;
  latestExpirationTime: bigint;
  category: string;
  arweaveId: string;
  earlyResolutionThreshold: string;
}
