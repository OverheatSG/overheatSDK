import * as fs from "fs";
import * as anchor from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";

const bs58 = anchor.utils.bytes.bs58;

/**
 * Parse a Solana secret key from either supported representation:
 *  - a JSON byte array, e.g. `"[12,34,...]"` (Solana CLI / file keypair), or
 *  - a base58-encoded secret key string, e.g. `"5Jd..."` (Phantom "export private key").
 *
 * The two are distinguished by the leading `[` of the JSON form.
 */
function parseSecretKey(value: string): Uint8Array {
  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    return Uint8Array.from(JSON.parse(trimmed) as number[]);
  }
  try {
    return bs58.decode(trimmed);
  } catch {
    throw new Error(
      'Invalid Solana secret key: expected a JSON byte array (e.g. "[12,34,...]") or a base58-encoded key.'
    );
  }
}

export function loadWallet(walletPath: string): {
  solWallet: anchor.Wallet;
  solKeypair: Keypair;
} {
  const solKeypair = anchor.web3.Keypair.fromSecretKey(
    parseSecretKey(fs.readFileSync(walletPath, "utf8"))
  );
  const solWallet = new anchor.Wallet(solKeypair);
  return { solWallet, solKeypair };
}

export function loadWalletFromEnvValue(envValue: string): {
  solWallet: anchor.Wallet;
  solKeypair: Keypair;
} {
  const solKeypair = anchor.web3.Keypair.fromSecretKey(
    parseSecretKey(envValue)
  );
  const solWallet = new anchor.Wallet(solKeypair);
  return { solWallet, solKeypair };
}

export function generateWallet(): {
  solWallet: anchor.Wallet;
  solKeypair: Keypair;
} {
  const solKeypair = anchor.web3.Keypair.generate();
  const solWallet = new anchor.Wallet(solKeypair);
  return { solWallet, solKeypair };
}

export function saveWallet(wallet: anchor.Wallet, walletPath: string): void {
  const secretKey = Array.from(wallet.payer.secretKey);
  fs.writeFileSync(walletPath, JSON.stringify(secretKey));
}
