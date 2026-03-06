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
 * @param walletPath - Path to the wallet JSON file (64-byte secret key as JSON array)
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

/**
 * Generate a new Solana wallet
 * @returns Object containing both Keypair and Anchor Wallet instances
 */
export function generateWallet(): {
  keypair: anchor.web3.Keypair;
  wallet: anchor.Wallet;
} {
  const keypair = anchor.web3.Keypair.generate();
  const wallet = new anchor.Wallet(keypair);

  return { keypair, wallet };
}

/**
 * Save a Solana wallet to a JSON keypair file
 * @param wallet - Anchor Wallet instance to save
 * @param walletPath - Path to the wallet JSON file
 * @throws Error if the file cannot be written
 */
export function saveWallet(wallet: anchor.Wallet, walletPath: string): void {
  const secretKey = Array.from(wallet.payer.secretKey);
  fs.writeFileSync(walletPath, JSON.stringify(secretKey));
}