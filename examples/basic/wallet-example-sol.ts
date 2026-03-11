import * as path from "path";
import {
  generateWallet,
  saveWallet,
  loadWallet,
} from "overheat-sdk";

const OUT_PATH = path.join(process.cwd(), "example-sol-key.key");

async function main(): Promise<void> {
  console.log("1. Generating new wallet...");
  const { solWallet } = generateWallet();
  const pubkeyBefore = solWallet.publicKey.toBase58();
  console.log("   Public key:", pubkeyBefore);

  console.log("\n2. Saving wallet to file:", OUT_PATH);
  saveWallet(solWallet, OUT_PATH);

  console.log("\n3. Loading wallet from file...");
  const loaded = loadWallet(OUT_PATH);
  const pubkeyAfter = loaded.solWallet.payer.publicKey.toBase58();
  console.log("   Loaded public key:", pubkeyAfter);

  const match = pubkeyBefore === pubkeyAfter;
  console.log("\n4. Round-trip check:", match ? "PASS" : "FAIL");
}

void main();

