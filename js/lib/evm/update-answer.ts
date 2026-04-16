import type { NetworkConfig } from "../config";
import { MAX_OUTCOMES } from "../utils/outcomes";
import { getContract, wrapContractError, toBytes32Hex } from "./contract";
import { createSigner } from "./wallet";

export async function update_answer(
  privateKey: string,
  questionId: string,
  answers: (boolean | null)[],
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
    // Normalize to fixed-length int8[]:
    // null -> -1, false -> 0, true -> 1
    const intAnswers: number[] = [];
    for (let i = 0; i < MAX_OUTCOMES; i++) {
      const v = i < answers.length ? answers[i] : null;
      if (v === null || v === undefined) {
        intAnswers.push(-1);
      } else if (v === true) {
        intAnswers.push(1);
      } else {
        intAnswers.push(0);
      }
    }
    tx = await contract.updateAnswer(id, intAnswers, explanationHex);
  } catch (err) {
    wrapContractError(err);
    throw err;
  }
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}
