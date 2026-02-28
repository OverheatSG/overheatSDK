import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getIdl } from "./types";
import { getConfig } from "./config";

export interface UpdateAnswerResult {
  success: boolean;
  transaction: string;
}

export async function updateAnswer(
  questionAddress: string,
  answer: boolean,
  extension: string,
  wallet: anchor.Wallet
): Promise<UpdateAnswerResult> {
  const config = getConfig();
  const idl = getIdl();
  
  const connection = new anchor.web3.Connection(config.rpcUrl, {
    commitment: "confirmed",
    wsEndpoint: config.wsUrl,
  });
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = new anchor.Program(idl as anchor.Idl, provider);
  const questionPubkey = new PublicKey(questionAddress);

  const tx = await program.methods
    .updateAnswer(answer, extension)
    .accounts({
      question: questionPubkey,
      authority: wallet.publicKey,
    })
    .rpc();

  console.log(`Transaction: ${tx}`);
  const explorerUrl = config.explorerCluster 
    ? `https://explorer.solana.com/tx/${tx}?cluster=${config.explorerCluster}`
    : `https://explorer.solana.com/tx/${tx}`;
  console.log(`Explorer: ${explorerUrl}`);

  return {
    success: true,
    transaction: tx,
  };
}
