import * as anchor from "@coral-xyz/anchor";
import { createHash } from "crypto";
import { getProgramId, getIdl, encodeArweaveId } from "./types";
import type { NetworkConfig } from "../config";
import type { RegisterQuestionParams } from "../types";
import { normalizeOutcomes } from "../utils/outcomes";

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
  const rulesArweaveIdForAnchor = encodeArweaveId(arweaveId.trim());

  const normalizedOutcomes = normalizeOutcomes(params.outcomes).join("|");
  const questionId = createHash("sha256")
    .update(Buffer.from(params.questionText, "utf8"))
    .digest();
  const earlyThresholdBps = Math.round(
    (params.earlyResolutionThreshold ?? 0) * 10_000
  );

  const [questionPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("question"),
      wallet.publicKey.toBuffer(),
      questionId,
    ],
    programId
  );
  const [adminPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("admin")],
    programId
  );

  const tx = await program.methods
    .registerQuestion(
      questionId,
      params.questionText,
      new anchor.BN(params.expectedExpirationTime),
      new anchor.BN(params.latestExpirationTime),
      params.category,
      normalizedOutcomes,
      rulesArweaveIdForAnchor,
      earlyThresholdBps
    )
    .accounts({
      question: questionPda,
      admin: adminPda,
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
