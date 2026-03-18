import * as anchor from "@coral-xyz/anchor";
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
  const earlyThreshold = params.earlyResolutionThreshold ?? 0;

  const normalizedOutcomes = normalizeOutcomes(params.outcomes).join("|");

  const [questionPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("question"),
      wallet.publicKey.toBuffer(),
      // Same seeds as on-chain program: sha256(question_text).prefix(8)
      Buffer.from(
        // use Node crypto here to match on-chain sha256
        require("crypto")
          .createHash("sha256")
          .update(Buffer.from(params.questionText, "utf8"))
          .digest()
      ).subarray(0, 8),
    ],
    programId
  );

  const tx = await program.methods
    .registerQuestion(
      params.questionText,
      new anchor.BN(params.expectedExpirationTime),
      new anchor.BN(params.latestExpirationTime),
      params.category,
      normalizedOutcomes,
      rulesArweaveIdForAnchor,
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
