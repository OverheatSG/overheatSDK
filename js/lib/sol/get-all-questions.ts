import * as anchor from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import type { QuestionInfo } from "../types";
import type { NetworkConfig } from "../config";
import { getIdl } from "./types";
import { buildQuestionInfoFromAccount } from "./utils";

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
    accounts.map((account: any) =>
      buildQuestionInfoFromAccount(
        account.publicKey,
        account.account,
        config
      )
    )
  );
}