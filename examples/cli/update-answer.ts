#!/usr/bin/env node

import { OverheatSDK, EVM_BASE_SEPOLIA_CONFIG, MAX_OUTCOMES } from "overheat-sdk";

const sdk = new OverheatSDK({ config: EVM_BASE_SEPOLIA_CONFIG });

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error(
      "Usage: update-answer.ts <question_address> <answers_json> <explanation>"
    );
    console.error(
      `  answers_json: JSON array, true | false | null per outcome (max ${MAX_OUTCOMES} entries; SDK pads with null).`
    );
    console.error("  explanation: uploaded to Arweave");
    console.error(
      'Example: update-answer.ts 0x... "[false,true]" "Resolution text"'
    );
    process.exit(1);
  }

  const questionAddress = args[0];
  const answersRaw = args[1];
  const explanation = args[2];

  let answers: (boolean | null)[];
  try {
    const parsed = JSON.parse(answersRaw) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error("answers must be a JSON array");
    }
    answers = parsed.map((v) =>
      v === true ? true : v === false ? false : null
    ) as (boolean | null)[];
    if (answers.length > MAX_OUTCOMES) {
      console.error(
        `Error: answers_json must have at most ${MAX_OUTCOMES} elements`
      );
      process.exit(1);
    }
  } catch {
    console.error("Error: answers_json must be valid JSON array of true/false/null");
    process.exit(1);
  }

  const signer = await sdk.loadWallet("./example-evm-key.key");

  const txHash = await sdk.updateAnswer(signer, {
    questionAddress,
    answers,
    explanation,
  });

  console.log(`\n✅ Answer updated successfully!`);
  console.log(`Transaction: ${txHash}`);
  const { config } = sdk;
  const explorerUrl = `${config.explorerUrl}/tx/${txHash}${
    config.explorerCluster ? "?cluster=" + config.explorerCluster : ""
  }`;
  console.log(`Explorer: ${explorerUrl}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}
