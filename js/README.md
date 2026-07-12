# @overheat-oracle/sdk (JS package)

TypeScript SDK for the Overheat oracle on **Solana** and **EVM**. This package exposes a class‑based, network‑aware API with no global state.

## Installation

```bash
npm install @overheat-oracle/sdk
```

## Core Exports

From `@overheat-oracle/sdk`:

- **Class**
  - `OverheatSDK`
- **Built‑in network configs**
  - `SOL_DEVNET_CONFIG`
  - `SOL_STAGING_CONFIG`
  - `SOL_MAINNET_CONFIG`
  - `EVM_BASE_SEPOLIA_CONFIG`
  - `EVM_BASE_MAINNET_CONFIG`
- **Types**
  - `ChainSigner`
  - `QuestionInfo`
  - `RegisterQuestionParams`
  - `RegisterQuestionResult`
  - `UpdateAnswerOptions`
  - `TimeRangeFilter`
  - `NetworkConfig`
  - `QuestionInterpretationRequest`, `QuestionInterpretationItem`, `QuestionInterpretationOptions`
- **HTTP helper**
  - `question_interpretation` — POST `/question_interpretation` on the Overheat API host
- **Low‑level modules**
  - `sol` namespace (from `js/lib/sol`)
  - `evm` namespace (from `js/lib/evm`)
  - Arweave helpers (from `js/lib/arweave/arweave`)

## `OverheatSDK` Overview

```ts
import type {
  ChainSigner,
  QuestionInfo,
  RegisterQuestionParams,
  RegisterQuestionResult,
  TimeRangeFilter,
  UpdateAnswerOptions,
  NetworkConfig,
} from "@overheat-oracle/sdk";

class OverheatSDK {
  readonly config: NetworkConfig;

  constructor(opts: { config: NetworkConfig });

  getAllQuestions(): Promise<QuestionInfo[]>;
  getQuestionByAddress(address: string): Promise<QuestionInfo | null>;
  getQuestionsByTimeRange(opts?: {
    timeRange?: TimeRangeFilter;
  }): Promise<QuestionInfo[]>;

  registerQuestion(
    signer: ChainSigner,
    params: RegisterQuestionParams,
  ): Promise<RegisterQuestionResult>;

  updateAnswer(
    signer: ChainSigner,
    options: UpdateAnswerOptions,
  ): Promise<string>; // returns tx hash

  questionInterpretation(
    payload: QuestionInterpretationRequest,
    options?: QuestionInterpretationOptions,
  ): Promise<QuestionInterpretationItem[]>;
}
```

### Networks

Use one of the built‑in configs or your own `NetworkConfig`:

- Solana:
  - `SOL_DEVNET_CONFIG`
  - `SOL_STAGING_CONFIG`
  - `SOL_MAINNET_CONFIG`
- EVM:
  - `EVM_BASE_SEPOLIA_CONFIG`
  - `EVM_BASE_MAINNET_CONFIG`

Current default deployment addresses:

- `SOL_DEVNET_CONFIG` / `SOL_STAGING_CONFIG`
  - Solana devnet program: `EAidGGxkVhCW7RryYv9vfUwRhyPpNCf7LWzfKfRJBAnG`
- `SOL_MAINNET_CONFIG`
  - Solana mainnet program: `BsciazohjvW5gg6MQdSpxYeoakh7bVWya7EA3WgQLj6r`
- `EVM_BASE_SEPOLIA_CONFIG`
  - Base Sepolia contract: `0x41AB5B380C351801901C2415ba549dEac43D3E16`
- `EVM_BASE_MAINNET_CONFIG`
  - Base mainnet contract: `0xdE0955a06cC72dc84d84d171BAEC09d3c209944B`

You can also construct a custom `NetworkConfig`:

```ts
interface NetworkConfig {
  network: string;
  rpcUrl: string;
  wsUrl: string;
  irysNode: string;
  irysGateway: string;
  idlFileName: string;
  explorerCluster: string;
  explorerUrl: string;
  contractAddress?: string;
}
```

### Signers (`ChainSigner`)

```ts
type ChainSigner =
  | { chain: "solana"; wallet: AnchorWallet }
  | { chain: "evm"; privateKeyHex: string };
```

- For **Solana**, pass an Anchor `Wallet`.
- For **EVM**, pass a private key (hex); the SDK creates a signer internally.

## Quick Start – EVM

```ts
import {
  OverheatSDK,
  EVM_BASE_SEPOLIA_CONFIG,
  evm,
  type ChainSigner,
  type RegisterQuestionParams,
} from "@overheat-oracle/sdk";

async function main() {
  const sdk = new OverheatSDK({ config: EVM_BASE_SEPOLIA_CONFIG });

  // Load private key from file
  const { privateKey } = evm.loadWallet("./example-evm-key.key");
  const signer: ChainSigner = { chain: "evm", privateKeyHex: privateKey };

  const params: RegisterQuestionParams = {
    questionText: "Will BTC trade above $100k by 2030‑01‑01?",
    rules: "Resolution according to CoinGecko BTC/USD daily close.",
    expectedExpirationTime: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    latestExpirationTime: Math.floor(Date.now() / 1000) + 8 * 24 * 60 * 60,
    category: "Crypto",
    earlyResolutionThreshold: "0.75",
  };

  const result = await sdk.registerQuestion(signer, params);
  console.log("Question address:", result.questionAddress);
  console.log("Tx hash:", result.txHash);
}

void main();
```

## Quick Start – Solana

```ts
import {
  OverheatSDK,
  SOL_DEVNET_CONFIG,
  loadWallet,
  type ChainSigner,
} from "@overheat-oracle/sdk";

async function main() {
  const sdk = new OverheatSDK({ config: SOL_DEVNET_CONFIG });

  const { solWallet } = loadWallet("./example-sol-key.key");
  const signer: ChainSigner = { chain: "solana", wallet: solWallet };

  const questions = await sdk.getAllQuestions();
  console.log(
    JSON.stringify(
      questions,
      (_, v) => (typeof v === "bigint" ? v.toString() : v),
      2,
    ),
  );
}

void main();
```

## Question interpretation (HTTP API)

This calls the hosted Overheat gateway (`https://api.overheat.app` by default). Request fields use the **same snake_case names as the HTTP API** (`resolve_rules`, `expected_expiration_time`, `latest_expiration_time`, etc.). The response is a JSON array of `{ ambiguity, interpretations }`; the SDK returns that as `QuestionInterpretationItem[]`.

Server-side or API-key access: pass `apiSecret: { secretId, secretKey }` so the client sends `Authorization: Bearer <secretId>:<secretKey>` (the gateway’s combined auth also accepts a Privy token in the same header or as a `privy-token` header or cookie, but the SDK only wires the secret pair helper today).

```ts
import {
  question_interpretation,
  type QuestionInterpretationRequest,
} from "@overheat-oracle/sdk";

const payload: QuestionInterpretationRequest = {
  question: "Will BTC trade above $100k by 2030-02-01?",
  outcomes: ["Yes", "No"],
  resolve_rules: "Resolution according to CoinGecko BTC/USD daily close.",
  expected_expiration_time: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  latest_expiration_time: Math.floor(Date.now() / 1000) + 8 * 24 * 60 * 60,
};

const items = await question_interpretation(payload, {
  apiSecret: { secretId: process.env.OVERHEAT_API_SECRET_ID!, secretKey: process.env.OVERHEAT_API_SECRET_KEY! },
  // host: "https://api.overheat.app", // optional override
});

console.log(items);
```

With `OverheatSDK`, the same payload and options are passed to `sdk.questionInterpretation(payload, options)`.

## Types (summary)

All core types live in `js/lib/types.ts` and are re‑exported from `@overheat-oracle/sdk`:

- `QuestionInfo`
- `RegisterQuestionParams`
- `RegisterQuestionResult`
- `UpdateAnswerOptions`
- `TimeRangeFilter`

They are already used in the method signatures of `OverheatSDK`.

## Low‑level Modules

If you need more control, you can use the low‑level sol/evm modules:

```ts
import { sol, evm } from "@overheat-oracle/sdk"; // via index.ts exports
// or
import * as solMod from "@overheat-oracle/sdk/lib/sol";
import * as evmMod from "@overheat-oracle/sdk/lib/evm";
```

Examples:

- Solana:
  - `sol.get_all_questions(config)`
  - `sol.get_question_by_address(id, config)`
  - `sol.register_question(params, wallet, arweaveId, config)`
  - `sol.update_answer(id, answer, explanation, wallet, config)`
- EVM:
  - `evm.get_all_questions(config)`
  - `evm.get_question_by_address(id, config)`
  - `evm.register_question(params, arweaveId, privateKey, config)`
  - `evm.update_answer(privateKey, id, answer, explanation, config)`

## Wallet Helpers

### Solana (`sol/wallet.ts`)

- `loadWallet(path)` → `{ solWallet, solKeypair }` — file may hold a JSON byte array (`[12,34,...]`) or a base58-encoded secret key
- `loadWalletFromEnvValue(value)` → `{ solWallet, solKeypair }` — same, from a string (e.g. env var) instead of a file
- `generateWallet()` → `{ solWallet, solKeypair }`
- `saveWallet(wallet, path)` → void

### EVM (`evm/wallet.ts`)

- `evm.loadWallet(path)` → `{ privateKey }`
- `evm.generateWallet()` → `{ privateKey }`
- `evm.saveWallet(privateKey, path)` → void
- `evm.createSigner(privateKey, config)` → `Signer`

## Arweave Helpers

From `js/lib/arweave/arweave.ts`:

- `uploadQuestionToArweaveWithSol(questionData, keypair, config)`
- `uploadQuestionToArweaveWithEvm(questionData, privateKey, config, network)`
- `fetchQuestionFromArweave(transactionId)`

`OverheatSDK.registerQuestion` already uses these under the hood; you only need them for advanced use cases.

## Examples

See the root `examples/` folder:

- `examples/basic/` – Small scripts with hard‑coded params.
- `examples/cli/` – CLI tools using `process.argv`.

They are the best reference for real‑world usage patterns of this SDK.
