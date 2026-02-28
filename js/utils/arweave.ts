import { Keypair } from "@solana/web3.js";
import Irys from "@irys/sdk";
import { RPC_URL, IRYS_NODE, IRYS_GATEWAY } from "../lib/config";

export interface QuestionDescription {
  questionText: string;
  rule: string;
}

export interface ArweaveUploadResult {
  transactionId: string;
  url: string;
  fullId: string;
}

/**
 * Fetch question data from Arweave using transaction ID
 * @param transactionId - Arweave transaction ID (44 characters)
 * @returns QuestionDescription object with questionText and rule
 */
export async function fetchQuestionFromArweave(
  transactionId: string
): Promise<QuestionDescription> {
  const irysUrl = `${IRYS_GATEWAY}/${transactionId}`;
  const response = await fetch(irysUrl, {
    signal: AbortSignal.timeout(10000),
  });
  
  if (response.ok) {
    const data = await response.json() as any;
    if (data && typeof data.questionText === "string" && typeof data.rule === "string") {
      return {
        questionText: data.questionText,
        rule: data.rule,
      };
    }
  }

  throw new Error(`Failed to fetch data from Arweave for ID: ${transactionId}`);
}

/**
 * Upload question description to Arweave using Irys Bundler
 * @param questionData - Object containing question text and rule
 * @param walletKeypair - Solana wallet keypair for payment
 * @returns Arweave transaction ID (44 characters) and gateway URL
 */
export async function uploadQuestionToArweave(
  questionData: {
    questionText: string;
    rule: string;
  },
  walletKeypair: Keypair
): Promise<ArweaveUploadResult> {
  const description: QuestionDescription = {
    questionText: questionData.questionText,
    rule: questionData.rule,
  };

  const data = JSON.stringify(description, null, 2);
  const dataBuffer = Buffer.from(data, "utf8");

  const irys = new Irys({
    url: IRYS_NODE,
    token: "solana",
    key: walletKeypair.secretKey,
    config: {
      providerUrl: RPC_URL,
    },
  });

  const receipt = await irys.upload(dataBuffer, {
    tags: [
      { name: "Content-Type", value: "application/json" },
      { name: "App-Name", value: "Overheat" },
      { name: "App-Version", value: "1.0.0" },
    ],
  });

  let fullId = receipt.id.trim();
  
  if (fullId.length === 43) {
    fullId = fullId + " ";
  } 
  if (fullId.length !== 44) {
    throw new Error(`Invalid Arweave ID length: ${fullId.length} (expected 43 or 44). ID: "${fullId}"`);
  }

  const gatewayUrl = `${IRYS_GATEWAY}/${fullId}`;

  return {
    transactionId: fullId,
    url: gatewayUrl,
    fullId,
  };
}
