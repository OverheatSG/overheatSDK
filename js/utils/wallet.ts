import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as anchor from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";

/**
 * Expand a file path, replacing ~ with the user's home directory
 * @param filePath - File path that may start with ~
 * @returns Expanded absolute file path
 */
export function expandPath(filePath: string): string {
  return filePath.startsWith("~")
    ? path.join(process.env.HOME || os.homedir(), filePath.slice(1))
    : filePath;
}

/**
 * Load a Solana wallet from a JSON keypair file
 * @param walletPath - Path to the wallet JSON file (supports ~ for home directory)
 * @returns Object containing both Keypair and Anchor Wallet instances
 * @throws Error if the file cannot be read or parsed
 */
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
