import { Keypair } from "@solana/web3.js";
import Irys from "@irys/sdk";
import { getConfig } from "../lib/config";

/**
 * Question description structure stored on Arweave
 */
export interface QuestionDescription {
  /** The question text */
  questionText: string;
  /** The rules description */
  rules: string;
}

/**
 * Result of uploading data to Arweave via Irys
 */
export interface ArweaveUploadResult {
  /** Arweave transaction ID (43-44 characters) */
  transactionId: string;
  /** Gateway URL to access the uploaded data */
  url: string;
  /** Full transaction ID (padded to 44 characters if needed) */
  fullId: string;
}

/**
 * Fetch question data from Arweave using transaction ID
 * @param transactionId - Arweave transaction ID (44 characters)
 * @returns QuestionDescription object with questionText and rules
 */
export async function fetchQuestionFromArweave(
  transactionId: string
): Promise<QuestionDescription> {
  const config = getConfig();
  const irysUrl = `${config.irysGateway}/${transactionId}`;
  const response = await fetch(irysUrl, {
    signal: AbortSignal.timeout(10000),
  });
  
  if (response.ok) {
    const data = (await response.json()) as any;
    if (
      data &&
      typeof data.questionText === "string" &&
      typeof data.rules === "string"
    ) {
      return {
        questionText: data.questionText,
        rules: data.rules,
      };
    }
  }

  throw new Error(`Failed to fetch data from Arweave for ID: ${transactionId}`);
}

/**
 * Upload question description to Arweave using Irys Bundler
 * @param questionData - Object containing question text and rules
 * @param walletKeypair - Solana wallet keypair for payment
 * @returns Arweave transaction ID (44 characters) and gateway URL
 */
export async function uploadQuestionToArweave(
  questionData: {
    questionText: string;
    rules: string;
  },
  walletKeypair: Keypair
): Promise<ArweaveUploadResult> {
  const config = getConfig();
  const description: QuestionDescription = {
    questionText: questionData.questionText,
    rules: questionData.rules,
  };

  const data = JSON.stringify(description, null, 2);
  const dataBuffer = Buffer.from(data, "utf8");

  const irys = new Irys({
    url: config.irysNode,
    token: "solana",
    key: walletKeypair.secretKey,
    config: {
      providerUrl: config.rpcUrl,
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

  const gatewayUrl = `${config.irysGateway}/${fullId}`;

  return {
    transactionId: fullId,
    url: gatewayUrl,
    fullId,
  };
}
