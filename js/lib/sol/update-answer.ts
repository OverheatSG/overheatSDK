import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getIdl, encodeArweaveId } from "./types";
import type { NetworkConfig } from "../config";

export async function update_answer(
  questionId: string,
  answerIndex: number,
  explanationArweaveId: string,
  wallet: anchor.Wallet,
  config: NetworkConfig
): Promise<{ transaction: string }> {
  const idl = getIdl(config);

  const connection = new anchor.web3.Connection(config.rpcUrl, {
    commitment: "confirmed",
    wsEndpoint: config.wsUrl,
  });
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = new anchor.Program(idl as anchor.Idl, provider);
  const questionPubkey = new PublicKey(questionId);

  const explanationIdForAnchor = encodeArweaveId(explanationArweaveId.trim());

  const tx = await program.methods
    .updateAnswer(new anchor.BN(answerIndex), explanationIdForAnchor)
    .accounts({
      question: questionPubkey,
      authority: wallet.publicKey,
    })
    .rpc();

  return { transaction: tx };
}
