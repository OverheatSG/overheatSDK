import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import { getConfig } from "./config";

/**
 * Get the path to the IDL file based on current network configuration
 * @returns Absolute path to the IDL file
 */
export function getIdlPath(): string {
  const config = getConfig();
  return path.join(__dirname, config.idlFileName);
}

/**
 * Load and parse the IDL (Interface Definition Language) file
 * @returns The parsed IDL object
 */
export function getIdl(): any {
  return JSON.parse(fs.readFileSync(getIdlPath(), "utf8"));
}

/**
 * Get the program ID (public key) from the IDL file
 * Always reads from the IDL file to ensure consistency
 * @returns The program's public key
 */
export function getProgramId(): PublicKey {
  const idl = getIdl();
  return new PublicKey(idl.address);
}

/**
 * Complete question information structure
 * Contains all data about a question from both on-chain and Arweave storage
 */
export interface QuestionInfo {
  /** Public key address of the question account */
  address: string;
  /** Public key of the question's authority (creator) */
  authority: string;
  /** Unix timestamp (seconds) when the question was created */
  createdAt: number;
  /** Expected expiration time as Unix timestamp (seconds) */
  expectedExpirationTime: number;
  /** Latest expiration time as Unix timestamp (seconds) */
  latestExpirationTime: number;
  /** The question text */
  questionText: string;
  /** Category string */
  category: string;
  /** Explanation string (provided when answer is updated) */
  explanation: string;
  /** Rules description (fetched from Arweave) */
  rules: string;
  /** Answer: "Yes", "No", or null if not answered yet */
  answer: string | null;
}

/**
 * Decode a byte array to a UTF-8 string, stopping at the first null byte
 * Used for decoding fixed-size byte arrays from Solana account data
 * @param bytes - Byte array or Uint8Array to decode
 * @returns Decoded UTF-8 string (up to the first null byte)
 */
export function decodeBytesToString(bytes: number[] | Uint8Array): string {
  const buffer = Buffer.from(bytes);
  const nullIndex = buffer.indexOf(0);
  if (nullIndex === -1) {
    return buffer.toString("utf8");
  }
  return buffer.slice(0, nullIndex).toString("utf8");
}

/**
 * Encode Arweave transaction ID to a 44-byte Buffer for storage in the contract
 * Arweave transaction IDs are base64url encoded strings (typically 43 characters)
 * The contract requires exactly 44 bytes, so we pad with zeros if needed
 */
export function encodeArweaveId(transactionId: string): Buffer {
  const arweaveIdString = transactionId.trim();
  const arweaveIdBuffer = Buffer.alloc(44, 0); // Allocate 44 bytes, filled with zeros
  const utf8Bytes = Buffer.from(arweaveIdString, "utf8");
  
  // Copy UTF-8 bytes, ensuring we don't exceed 44 bytes
  const copyLength = Math.min(44, utf8Bytes.length);
  utf8Bytes.copy(arweaveIdBuffer, 0, 0, copyLength);
  
  return Buffer.from(arweaveIdBuffer);
}

/**
 * Decode arweave_id from account data
 * Arweave transaction IDs are stored as UTF-8 strings (base64url format, 43-44 characters)
 * This function validates the decoded string to ensure it's a valid Arweave transaction ID
 */
export function decodeArweaveId(bytes: number[] | Uint8Array): string {
  const buffer = Buffer.from(bytes);
  const nullIndex = buffer.indexOf(0);
  const data = nullIndex === -1 ? buffer : buffer.slice(0, nullIndex);
  
  // Decode as UTF-8 string
  const decoded = data.toString("utf8").trim();
  
  // Validate: Arweave transaction IDs are base64url encoded (43-44 characters, alphanumeric + _ -)
  // If it doesn't match this pattern, return empty string to skip Arweave fetch
  if (decoded.length >= 43 && decoded.length <= 44 && /^[A-Za-z0-9_-]+$/.test(decoded)) {
    return decoded;
  }
  
  // Invalid format, return empty string
  return "";
}
