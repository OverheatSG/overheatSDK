import * as fs from "fs";
import type { Signer as EvmSigner } from "ethers";
import { Wallet, JsonRpcProvider } from "ethers";
import type { NetworkConfig } from "../config";

export function loadWallet(walletPath: string): { privateKey: string } {
  const raw = fs.readFileSync(walletPath, "utf8").trim();
  const privateKey = raw.startsWith("0x") ? raw : "0x" + raw;
  return { privateKey };
}

export function generateWallet(): { privateKey: string } {
  const wallet = Wallet.createRandom();
  return { privateKey: wallet.privateKey };
}

export function saveWallet(privateKey: string, walletPath: string): void {
  const hex = privateKey.startsWith("0x") ? privateKey : "0x" + privateKey;
  fs.writeFileSync(walletPath, hex);
}

export function createSigner(
  privateKey: string,
  config: NetworkConfig
): EvmSigner {
  const hex = privateKey.startsWith("0x") ? privateKey : "0x" + privateKey;
  const provider = new JsonRpcProvider(config.rpcUrl);
  return new Wallet(hex, provider);
}
