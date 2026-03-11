import * as anchor from "@coral-xyz/anchor";
import * as crypto from "crypto";
import { getProgramId, getIdl, encodeArweaveId } from "./types";
import type { NetworkConfig } from "../config";
import type { RegisterQuestionParams } from "../types";

export async function register_question(
  params: RegisterQuestionParams,
  wallet: anchor.Wallet,
  arweaveId: string,
  config: NetworkConfig
): Promise<{ questionId: string; transaction: string; arweaveId: string }> {
  const idl = getIdl(config);
  const programId = getProgramId(config);

  const connection = new anchor.web3.Connection(config.rpcUrl, {
    commitment: "confirmed",
    wsEndpoint: config.wsUrl,
  });
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = new anchor.Program(idl as anchor.Idl, provider) as anchor.Program;
  const arweaveIdForAnchor = encodeArweaveId(arweaveId.trim());
  const earlyThreshold = parseFloat(params.earlyResolutionThreshold) || 0;

  const questionTextBytes = Buffer.from(params.questionText, "utf8");
  const questionHash = crypto
    .createHash("sha256")
    .update(questionTextBytes)
    .digest();
  const questionHashPrefix = questionHash.slice(0, 8);

  const [questionPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("question"),
      wallet.publicKey.toBuffer(),
      questionHashPrefix,
    ],
    programId
  );

  const tx = await program.methods
    .registerQuestion(
      params.questionText,
      new anchor.BN(params.expectedExpirationTime),
      new anchor.BN(params.latestExpirationTime),
      params.category,
      arweaveIdForAnchor,
      earlyThreshold
    )
    .accounts({
      question: questionPda,
      authority: wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  return {
    questionId: questionPda.toString(),
    transaction: tx,
    arweaveId: arweaveId.trim(),
  };
}
