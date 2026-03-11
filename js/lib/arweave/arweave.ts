import { Keypair } from "@solana/web3.js";
import Irys from "@irys/sdk";
import { Uploader } from "@irys/upload";
import { BaseEth } from "@irys/upload-ethereum";
import type { NetworkConfig } from "../config";

export interface QuestionDescription {
  questionText: string;
  rules: string;
}

export interface ArweaveUploadResult {
  transactionId: string;
  url: string;
  fullId: string;
}

export function decodeBytesToString(bytes: number[] | Uint8Array): string {
  const buffer = Buffer.from(bytes);
  const nullIndex = buffer.indexOf(0);
  if (nullIndex === -1) {
    return buffer.toString("utf8");
  }
  return buffer.slice(0, nullIndex).toString("utf8");
}

export function encodeArweaveId(arweaveId: string): Buffer {
  const arweaveIdString = arweaveId.trim();
  const arweaveIdBuffer = Buffer.alloc(44, 0);
  const utf8Bytes = Buffer.from(arweaveIdString, "utf8");
  const copyLength = Math.min(44, utf8Bytes.length);
  utf8Bytes.copy(arweaveIdBuffer, 0, 0, copyLength);
  return Buffer.from(arweaveIdBuffer);
}

export function decodeArweaveId(bytes: number[] | Uint8Array): string {
  const buffer = Buffer.from(bytes);
  const nullIndex = buffer.indexOf(0);
  const data = nullIndex === -1 ? buffer : buffer.slice(0, nullIndex);
  const decoded = data.toString("utf8").trim();
  if (decoded.length >= 43 && decoded.length <= 44 && /^[A-Za-z0-9_-]+$/.test(decoded)) {
    return decoded;
  }
  return "";
}

export async function fetchQuestionFromArweave(
  transactionId: string,
  config: NetworkConfig
): Promise<QuestionDescription> {
  const base = config.irysGateway?.trim();
  if (!base) {
    throw new Error(
      "irysGateway is not configured. Set it in the SDK config for the current network."
    );
  }
  const irysUrl = `${base.replace(/\/$/, "")}/${transactionId}`;
  const response = await fetch(irysUrl, {
    signal: AbortSignal.timeout(10000),
  });

  if (response.ok) {
    const data = (await response.json()) as Record<string, unknown>;
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

export async function uploadQuestionToArweaveWithSol(
  questionData: {
    questionText: string;
    rules: string;
  },
  walletKeypair: Keypair,
  config: NetworkConfig
): Promise<ArweaveUploadResult> {
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

export async function uploadQuestionToArweaveWithEvm(
  questionData: {
    questionText: string;
    rules: string;
  },
  evmPrivateKeyHex: string,
  config: NetworkConfig,
  network: string
): Promise<ArweaveUploadResult> {
  const description: QuestionDescription = {
    questionText: questionData.questionText,
    rules: questionData.rules,
  };

  const data = JSON.stringify(description, null, 2);

  const key = evmPrivateKeyHex.startsWith("0x")
    ? evmPrivateKeyHex
    : "0x" + evmPrivateKeyHex;

  const useDevnet = network === "evm-base-sepolia";
  const rpcUrl = config.rpcUrl;

  let uploader = Uploader(BaseEth).withWallet(key);
  if (useDevnet && rpcUrl) {
    uploader = uploader.withRpc(rpcUrl).devnet();
  }
  const irysUploader = await uploader;

  const receipt = await irysUploader.upload(data, {
    tags: [
      { name: "Content-Type", value: "application/json" },
      { name: "App-Name", value: "Overheat" },
      { name: "App-Version", value: "1.0.0" },
    ],
  });

  let fullId = (receipt?.id ?? receipt).toString().trim();
  if (fullId.length === 43) {
    fullId = fullId + " ";
  }
  if (fullId.length !== 44) {
    throw new Error(
      `Invalid Arweave ID length: ${fullId.length} (expected 43 or 44). ID: "${fullId}"`
    );
  }

  const gatewayUrl = `${config.irysGateway}/${fullId}`;

  return {
    transactionId: fullId,
    url: gatewayUrl,
    fullId,
  };
}
