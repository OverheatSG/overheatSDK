import { ethers } from "ethers";
import type { NetworkConfig } from "../config";
import { getContract, wrapContractError } from "./contract";
import { createSigner } from "./wallet";
import type { RegisterQuestionParams } from "../types";
import { normalizeOutcomes } from "../utils/outcomes";

export async function register_question(
  params: RegisterQuestionParams,
  arweaveId: string,
  privateKey: string,
  config: NetworkConfig
): Promise<{ questionId: string; txHash: string }> {
  const signer = createSigner(privateKey, config);
  const contract = getContract(config.contractAddress!, signer);
  const rulesArweaveIdHex = arweaveId.startsWith("0x")
    ? arweaveId
    : "0x" + Buffer.from(arweaveId, "utf8").toString("hex");
  if (ethers.getBytes(rulesArweaveIdHex).length !== 44) {
    throw new Error(
      "arweaveId must be exactly 44 bytes (got " +
        ethers.getBytes(rulesArweaveIdHex).length +
        ")"
    );
  }
  const early = ethers.parseEther(params.earlyResolutionThreshold);

  const normalizedOutcomes = normalizeOutcomes(params.outcomes).join("|");

  let tx;
  try {
    tx = await contract.registerQuestion(
      params.questionText,
      BigInt(params.expectedExpirationTime),
      BigInt(params.latestExpirationTime),
      params.category,
      normalizedOutcomes,
      rulesArweaveIdHex,
      early
    );
  } catch (err) {
    wrapContractError(err);
    throw err;
  }
  const receipt = await tx.wait();
  if (receipt.status === 0) {
    throw new Error(
      "Transaction reverted. Possible causes: QuestionAlreadyExists, QuestionTooLong, InvalidArweaveId. txHash: " +
        receipt.hash
    );
  }

  // wait for 10 blocks
  await new Promise(resolve => setTimeout(resolve, 1000));

  const count = await contract.getQuestionCount();
  if (count === 0n) {
    throw new Error(
      "Transaction succeeded but no questions found (race?). txHash: " +
        receipt.hash
    );
  }
  const questionId = await contract.getQuestionIdByIndex(count - 1n);
  return {
    questionId:
      typeof questionId === "string" ? questionId : ethers.hexlify(questionId),
    txHash: receipt.hash,
  };
}
