import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import { PROGRAM_ID } from "./types";
import { RPC_URL, WS_URL } from "./config";
import { loadWallet } from "../utils/wallet";

const idlPath = path.join(__dirname, "overheat.json");
const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));

export interface UpdateAnswerResult {
  success: boolean;
  transaction: string;
}

export async function updateAnswer(
  questionAddress: string,
  answer: boolean,
  extension: string,
  walletPath: string
): Promise<UpdateAnswerResult> {
  const connection = new anchor.web3.Connection(RPC_URL, {
    commitment: "confirmed",
    wsEndpoint: WS_URL,
  });
  const { wallet } = loadWallet(walletPath);
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
  console.log(`Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

  return {
    success: true,
    transaction: tx,
  };
}
