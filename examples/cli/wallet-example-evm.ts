#!/usr/bin/env node

/**
 * Example: test EVM generateWallet(), saveWallet(), loadWallet().
 * Generates a new wallet, saves the private key to a file, then loads it back and verifies the round-trip.
 *
 * Usage:
 *   wallet-example-evm.ts [output_path]
 *
 * If output_path is omitted, the wallet will be saved as ./example-evm-key.key.
 * Private key files are conventionally saved as .key (raw hex) or .json (encrypted keystore).
 * For production, prefer password-encrypted JSON keystore (Ethereum standard).
 */

import * as fs from "fs";
import * as path from "path";
import { Wallet } from "ethers";
import {
  OverheatSDK,
  EVM_BASE_SEPOLIA_CONFIG,
  evm,
} from "@overheat-oracle/sdk";

const ENV = {
  ...EVM_BASE_SEPOLIA_CONFIG,
  rpcUrl: process.env.OVERHEAT_RPC_URL ?? "",
  wsUrl: process.env.OVERHEAT_WS_URL ?? "",
};

const sdk = new OverheatSDK({ config: ENV });

async function main(): Promise<void> {
  if (!ENV.rpcUrl) {
    throw new Error("Please set OVERHEAT_RPC_URL for the selected network config.");
  }
  const args = process.argv.slice(2);
  if (args.length > 1) {
    console.error("Usage: wallet-example-evm.ts [output_path]");
    console.error(
      "  output_path: Optional. Where to save the private key file (one line, hex)."
    );
    console.error("               Default is ./example-evm-key.key");
    process.exit(1);
  }

  const outPath = args[0] || path.join(process.cwd(), "example-evm-key.key");

  console.log("1. Generating new wallet...");
  const { privateKey } = evm.generateWallet();
  const addressBefore = new Wallet(privateKey).address;
  console.log("   Address:", addressBefore);

  console.log("\n2. Saving private key to file:", outPath);
  evm.saveWallet(privateKey, outPath);
  if (!fs.existsSync(outPath)) {
    console.error("Error: file was not created");
    process.exit(1);
  }
  const raw = fs.readFileSync(outPath, "utf8").trim();
  console.log("   File contains", raw.length, "chars (hex with optional 0x)");

  console.log("\n3. Loading wallet from file...");
  const loaded = evm.loadWallet(outPath);
  const signer = new Wallet(
    loaded.privateKey,
    new (require("ethers").JsonRpcProvider)(sdk.config.rpcUrl),
  );
  const addressAfter = await signer.getAddress();
  console.log("   Loaded address:", addressAfter);

  const match = addressBefore === addressAfter;
  console.log("\n4. Round-trip check:", match ? "PASS" : "FAIL");
  if (!match) {
    console.error("   Expected:", addressBefore);
    console.error("   Got:     ", addressAfter);
    process.exit(1);
  }

  console.log("\nDone. Key file:", outPath);
  process.exit(0);
}

if (require.main === module) {
  main();
}
