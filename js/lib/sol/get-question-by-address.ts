import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import type { QuestionInfo } from "../types";
import type { NetworkConfig } from "../config";
import { decodeBytesToString, getIdl } from "./types";
import { buildQuestionInfoFromAccount } from "./utils";

export async function get_question_by_address(
  questionId: string,
  config: NetworkConfig
): Promise<QuestionInfo | null> {
  const idl = getIdl(config);
  const questionPubkey = new PublicKey(questionId);

  const connection = new Connection(config.rpcUrl, {
    commitment: "confirmed",
    wsEndpoint: config.wsUrl,
  });
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(anchor.web3.Keypair.generate()),
    { commitment: "confirmed" }
  );
  const program = new anchor.Program(idl as anchor.Idl, provider) as any;

  const questionData = await program.account.question.fetch(questionPubkey);
  return buildQuestionInfoFromAccount(questionPubkey, questionData, config);
}
