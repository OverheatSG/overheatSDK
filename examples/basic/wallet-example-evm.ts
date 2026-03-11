import * as path from "path";
import { Wallet } from "ethers";
import {
  evm,
} from "overheat-sdk";

const OUT_PATH = path.join(process.cwd(), "example-evm-key.key");

async function main(): Promise<void> {
  console.log("1. Generating new wallet...");
  const { privateKey } = evm.generateWallet();
  const addressBefore = new Wallet(privateKey).address;
  console.log("   Address:", addressBefore);

  console.log("\n2. Saving private key to file:", OUT_PATH);
  evm.saveWallet(privateKey, OUT_PATH);

  console.log("\n3. Loading wallet from file...");
  const loaded = evm.loadWallet(OUT_PATH);
  const signer = new Wallet(loaded.privateKey);
  const addressAfter = await signer.getAddress();
  console.log("   Loaded address:", addressAfter);

  const match = addressBefore === addressAfter;
  console.log("\n4. Round-trip check:", match ? "PASS" : "FAIL");
}

void main();

