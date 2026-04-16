import "dotenv/config";
import { question_interpretation } from "overheat-sdk";

const question = "Will BTC trade above $100k by 2030-02-01?";
const outcomes = ["Yes", "No"];
const resolve_rules = "Resolution according to CoinGecko BTC/USD daily close.";
const expected_expiration_time = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
const latest_expiration_time = expected_expiration_time + 24 * 60 * 60;

async function main(): Promise<void> {
  const secretId = process.env.OVERHEAT_API_SECRET_ID;
  const secretKey = process.env.OVERHEAT_API_SECRET_KEY;
  if (!secretId || !secretKey) {
    throw new Error(
      "Add OVERHEAT_API_SECRET_ID and OVERHEAT_API_SECRET_KEY to a .env file in the repo root (or export them). Gateway auth: Bearer secretId:secretKey."
    );
  }

  const result = await question_interpretation(
    {
      question,
      outcomes,
      resolve_rules,
      expected_expiration_time,
      latest_expiration_time,
    },
    { apiSecret: { secretId, secretKey } }
  );

  console.log(JSON.stringify(result, null, 2));
}

void main();
