import * as fs from "fs";
import * as anchor from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";

export function loadWallet(walletPath: string): {
  solWallet: anchor.Wallet;
  solKeypair: Keypair;
} {
  const solKeypair = anchor.web3.Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(walletPath, "utf8")) as number[])
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
