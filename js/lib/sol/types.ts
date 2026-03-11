import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import type { NetworkConfig } from "../config";
import {
  decodeBytesToString,
  encodeArweaveId,
  decodeArweaveId,
} from "../arweave/arweave";

export function getIdlPath(config: NetworkConfig): string {
  return path.join(__dirname, config.idlFileName);
}

export function getIdl(config: NetworkConfig): unknown {
  return JSON.parse(fs.readFileSync(getIdlPath(config), "utf8"));
}

export function getProgramId(config: NetworkConfig): PublicKey {
  const idl = getIdl(config) as { address: string };
  return new PublicKey(idl.address);
}

export type { QuestionInfo, TimeRangeFilter } from "../types";

export { decodeBytesToString, encodeArweaveId, decodeArweaveId };
