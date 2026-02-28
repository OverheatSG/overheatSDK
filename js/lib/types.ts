import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

export const idlPath = path.join(__dirname, "overheat.json");
export const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
export const PROGRAM_ID = new PublicKey(idl.address);

export interface QuestionInfo {
  address: string;
  authority: string;
  expectedExpirationTime: number;
  latestExpirationTime: number;
  questionText: string;
  category: string;
  extension: string;
  arweaveId: string;
  answer: string | null;
}

export function decodeBytesToString(bytes: number[] | Uint8Array): string {
  const buffer = Buffer.from(bytes);
  const nullIndex = buffer.indexOf(0);
  if (nullIndex === -1) {
    return buffer.toString("utf8");
  }
  return buffer.slice(0, nullIndex).toString("utf8");
}
