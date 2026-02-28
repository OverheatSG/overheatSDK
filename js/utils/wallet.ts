import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as anchor from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";

export function expandPath(filePath: string): string {
  return filePath.startsWith("~")
    ? path.join(process.env.HOME || os.homedir(), filePath.slice(1))
    : filePath;
}

export function loadWallet(walletPath: string): {
  keypair: Keypair;
  wallet: anchor.Wallet;
} {
  const keypair = anchor.web3.Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(walletPath, "utf8")) as number[])
  );
  const wallet = new anchor.Wallet(keypair);
  return { keypair, wallet };
}
