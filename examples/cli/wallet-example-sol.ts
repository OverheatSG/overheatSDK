#!/usr/bin/env node

/**
 * Example: test generateWallet() and saveWallet().
 * Generates a new wallet, saves it to a key file (JSON array of 64 bytes), then loads it back and verifies the round-trip.
 *
 * Usage:
 *   wallet-example-sol.ts [output_path]
 *
 * If output_path is omitted, the wallet will be saved as ./example-sol-key.key.
 * Content is Solana keypair format (JSON array); .key extension is conventional for key files (same as EVM example).
 */

import * as fs from "fs";
import * as path from "path";
import {
  OverheatSDK,
  SOL_DEVNET_CONFIG,
  generateWallet,
  saveWallet,
  loadWallet,
} from "overheat-sdk";

const sdk = new OverheatSDK({ config: SOL_DEVNET_CONFIG });

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length > 1) {
    console.error("Usage: wallet-example-sol.ts [output_path]");
    console.error(
      "  output_path: Optional. Where to save the wallet key file (JSON array format)."
    );
    console.error("               Default is ./example-sol-key.key");
    process.exit(1);
  }

  const outPath = args[0] || path.join(process.cwd(), "example-sol-key.key");

  console.log("1. Generating new wallet...");
  const { solWallet } = generateWallet();
  const pubkeyBefore = solWallet.publicKey.toBase58();
  console.log("   Public key:", pubkeyBefore);

  console.log("\n2. Saving wallet to file:", outPath);
  saveWallet(solWallet, outPath);
  if (!fs.existsSync(outPath)) {
    console.error("Error: file was not created");
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(outPath, "utf8"));
  console.log(
    "   File contains",
    Array.isArray(raw) ? raw.length : 0,
    "bytes (keypair, expected 64)"
  );

  console.log("\n3. Loading wallet from file...");
  const loaded = loadWallet(outPath);
  const pubkeyAfter = loaded.solWallet.payer.publicKey.toBase58();
  console.log("   Loaded public key:", pubkeyAfter);

  const match = pubkeyBefore === pubkeyAfter;
  console.log("\n4. Round-trip check:", match ? "PASS" : "FAIL");
  if (!match) {
    console.error("   Expected:", pubkeyBefore);
    console.error("   Got:     ", pubkeyAfter);
    process.exit(1);
  }

  console.log("\nDone. Wallet file:", outPath);
  process.exit(0);
}
