import { ethers } from "ethers";
import type { NetworkConfig } from "../config";
import { getContract, normalizeQuestion, toBytes32Hex } from "./contract";
import type { QuestionInfo } from "../types";
import {
  fetchQuestionFromArweave,
  decodeArweaveId,
} from "../arweave/arweave";

export async function get_question_by_address(
  questionId: string,
  config: NetworkConfig
): Promise<QuestionInfo | null> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const contract = getContract(config.contractAddress!, provider);
  const address = toBytes32Hex(questionId);
  const raw = await contract.getQuestion(address);
  const q = normalizeQuestion(raw, address);
  if (!q) return null;
  const arweaveIdBytes = ethers.getBytes((raw as { arweave_id: string }).arweave_id);
  const arweaveIdStr = decodeArweaveId(arweaveIdBytes);
  if (arweaveIdStr) {
    const desc = await fetchQuestionFromArweave(arweaveIdStr, config);
    q.rules = desc.rules;
  }
  return q;
}
