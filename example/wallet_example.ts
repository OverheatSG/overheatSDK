#!/usr/bin/env node

/**
 * Example: test generateWallet() and saveWallet().
 * Generates a new wallet, saves it to a JSON file, then loads it back and verifies the round-trip.
 */

import * as fs from "fs";
import * as path from "path";
import { generateWallet, saveWallet, loadWallet } from "overheat-sdk";

if (require.main === module) {
  const outPath = process.argv[2] || path.join(process.cwd(), "example-wallet.json");

  console.log("1. Generating new wallet...");
  const { keypair, wallet } = generateWallet();
  const pubkeyBefore = keypair.publicKey.toBase58();
  console.log("   Public key:", pubkeyBefore);

  console.log("\n2. Saving wallet to file:", outPath);
  saveWallet(wallet, outPath);
  if (!fs.existsSync(outPath)) {
    console.error("Error: file was not created");
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(outPath, "utf8"));
  console.log("   File contains", Array.isArray(raw) ? raw.length : 0, "bytes (expected 64)");

  console.log("\n3. Loading wallet from file...");
  const { keypair: loadedKeypair, wallet: loadedWallet } = loadWallet(outPath);
  const pubkeyAfter = loadedWallet.payer.publicKey.toBase58();
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
