import type { NetworkConfig } from "../config";
import { getContract, wrapContractError, toBytes32Hex } from "./contract";
import { createSigner } from "./wallet";

export async function update_answer(
  privateKey: string,
  questionId: string,
  answerIndex: number,
  explanationArweaveId: string,
  config: NetworkConfig
): Promise<{ txHash: string }> {
  const signer = createSigner(privateKey, config);
  const contract = getContract(config.contractAddress!, signer);
  const id = toBytes32Hex(questionId);
  const explanationHex = explanationArweaveId.startsWith("0x")
    ? explanationArweaveId
    : "0x" + Buffer.from(explanationArweaveId, "utf8").toString("hex");
  let tx;
  try {
    tx = await contract.updateAnswer(id, BigInt(answerIndex), explanationHex);
  } catch (err) {
    wrapContractError(err);
    throw err;
  }
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}
