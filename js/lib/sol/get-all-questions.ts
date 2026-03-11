import * as anchor from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import type { QuestionInfo } from "../types";
import type { NetworkConfig } from "../config";
import { decodeBytesToString, decodeArweaveId, getIdl } from "./types";
import { fetchQuestionFromArweave } from "../arweave/arweave";

export async function get_all_questions(config: NetworkConfig): Promise<QuestionInfo[]> {
  const connection = new Connection(config.rpcUrl, {
    commitment: "confirmed",
    wsEndpoint: config.wsUrl,
  });
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(anchor.web3.Keypair.generate()),
    { commitment: "confirmed" }
  );
  const program = new anchor.Program(getIdl(config) as anchor.Idl, provider);
  const accounts = await (program as any).account.question.all();
  return Promise.all(
    accounts.map(async (account: any) => {
      const arweaveId = decodeArweaveId(account.account.arweaveId as Uint8Array);
      let rules = "";
      if (arweaveId?.trim()) {
        rules = (await fetchQuestionFromArweave(arweaveId.trim(), config)).rules;
      }
      return accountToQuestionInfo(account, rules);
    })
  );
}


function accountToQuestionInfo(
  account: { publicKey: { toString(): string }; account: any },
  rules: string
): QuestionInfo {
  const d = account.account;
  return {
    address: account.publicKey.toString(),
    authority: d.authority.toString(),
    createdAt: BigInt(d.createdAt.toString()),
    expectedExpirationTime: BigInt(d.expectedExpirationTime.toString()),
    latestExpirationTime: BigInt(d.latestExpirationTime.toString()),
    questionText: decodeBytesToString(d.questionText),
    category: decodeBytesToString(d.category),
    explanation: decodeBytesToString(d.explanation),
    rules,
    answer:
      d.answer === null ? null : d.answer ? "Yes" : "No",
    earlyResolutionThreshold: d.earlyResolutionThreshold ?? 0,
  };
}