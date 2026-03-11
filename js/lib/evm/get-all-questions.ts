import { ethers } from "ethers";
import type { NetworkConfig } from "../config";
import { getContract, normalizeQuestion } from "./contract";
import type { QuestionInfo } from "../types";
import {
  fetchQuestionFromArweave,
  decodeArweaveId,
} from "../arweave/arweave";

export async function get_all_questions(config: NetworkConfig): Promise<QuestionInfo[]> {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const contract = getContract(config.contractAddress!, provider);
  const count = await contract.getQuestionCount();
  const n = Number(count);

  const ids = await Promise.all(
    [...Array(n)].map((_, i) => contract.getQuestionIdByIndex(i))
  );
  const raws = await Promise.all(ids.map((id) => contract.getQuestion(id)));

  const list = await Promise.all(
    ids.map(async (idRaw, i) => {
      const address =
        typeof idRaw === "string" ? idRaw : ethers.hexlify(idRaw);
      const raw = raws[i];
      const q = normalizeQuestion(raw, address);
      if (!q) return null;
      const arweaveIdBytes = raw
        ? ethers.getBytes((raw as { arweave_id: string }).arweave_id)
        : new Uint8Array(0);
      const arweaveIdStr = decodeArweaveId(arweaveIdBytes);
      if (arweaveIdStr) {
        q.rules = (await fetchQuestionFromArweave(arweaveIdStr, config)).rules;
      }
      return q;
    })
  );
  return list.filter((q): q is QuestionInfo => q != null);
}
