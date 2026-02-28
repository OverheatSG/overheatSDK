import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import { getConfig } from "./config";

export function getIdlPath(): string {
  const config = getConfig();
  return path.join(__dirname, config.idlFileName);
}

export function getIdl(): any {
  return JSON.parse(fs.readFileSync(getIdlPath(), "utf8"));
}

export function getProgramId(): PublicKey {
  const config = getConfig();
  if (config.programId) {
    return new PublicKey(config.programId);
  }
  const idl = getIdl();
  return new PublicKey(idl.address);
}

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
