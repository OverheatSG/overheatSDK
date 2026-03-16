import { ethers } from "ethers";
import type { NetworkConfig } from "../config";
import { getContract, normalizeQuestion, toBytes32Hex } from "./contract";
import type { QuestionInfo } from "../types";
import { attachOffchainMetadata } from "./utils";

export async function get_question_by_address(
  questionId: string,
  config: NetworkConfig
): Promise<QuestionInfo | null> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const contract = getContract(config.contractAddress!, provider);
  const address = toBytes32Hex(questionId);
  const raw = await contract.getQuestion(address);
  const base = normalizeQuestion(raw, address);
  if (!base) return null;
  return attachOffchainMetadata(raw, base, config);
}
