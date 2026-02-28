import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import {
  QuestionInfo,
  decodeBytesToString,
  getIdl,
} from "./types";
import { getConfig } from "./config";

export async function getQuestionByAddress(address: string): Promise<QuestionInfo | null> {
  const config = getConfig();
  const idl = getIdl();
  const questionAddress = new PublicKey(address);
  
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

  try {
    const questionData = await program.account.question.fetch(questionAddress);
    
    return {
      address: questionAddress.toString(),
      authority: questionData.authority.toString(),
      expectedExpirationTime: questionData.expectedExpirationTime.toNumber(),
      latestExpirationTime: questionData.latestExpirationTime.toNumber(),
      questionText: decodeBytesToString(questionData.questionText),
      category: decodeBytesToString(questionData.category),
      extension: decodeBytesToString(questionData.extension),
      arweaveId: decodeBytesToString(questionData.arweaveId),
      answer: questionData.answer === null ? null : questionData.answer ? "Yes" : "No",
    };
  } catch (error) {
    return null;
  }
}
