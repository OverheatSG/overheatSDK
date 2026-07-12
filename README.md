# overheatSDK

TypeScript SDK for interacting with the Overheat oracle program on Solana & EVM.

## Overview

The Overheat SDK provides a complete interface for interacting with the Overheat oracle, including:

- **Question Registration**: Register new questions on-chain with rules stored on Arweave
- **Answer Updates**: Update question answers with explanations
- **Data Retrieval**: Query questions by address, time range, or get all questions
- **Question interpretation**: Call the Overheat HTTP API to analyze ambiguity in a market spec (requires gateway credentials)
- **Multi-network Support**: Works with Solana devnet/staging/mainnet and EVM Base Sepolia/mainnet
- **Wallet Utilities**: Simple helpers to generate, load, and save wallets

## Current Default Deployments

The built-in configs in this package point to the following deployments:

- `SOL_DEVNET_CONFIG` / `SOL_STAGING_CONFIG`
  - Solana devnet program: `EAidGGxkVhCW7RryYv9vfUwRhyPpNCf7LWzfKfRJBAnG`
- `SOL_MAINNET_CONFIG`
  - Solana mainnet program: `BsciazohjvW5gg6MQdSpxYeoakh7bVWya7EA3WgQLj6r`
- `EVM_BASE_SEPOLIA_CONFIG`
  - Base Sepolia contract: `0x41AB5B380C351801901C2415ba549dEac43D3E16`
- `EVM_BASE_MAINNET_CONFIG`
  - Base mainnet contract: `0xdE0955a06cC72dc84d84d171BAEC09d3c209944B`

## Installation

### Using npm

```bash
npm install @overheat-oracle/sdk
```

## Quick Start

```typescript
import {
  OverheatSDK,
  EVM_BASE_SEPOLIA_CONFIG,
} from "@overheat-oracle/sdk";

async function main() {
  // 1. Create SDK with a built-in network config
  const sdk = new OverheatSDK({ config: EVM_BASE_SEPOLIA_CONFIG });

  // 2. Query all questions
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

### Wallet utilities (high level)

- **Solana (`sol-devnet` / `sol-staging` / `sol-mainnet`)**
  - `generateWallet()` – Generate a new keypair and return `{ solWallet, solKeypair }`.
  - `loadWallet(walletPath)` – Load a keypair from file and return `{ solWallet, solKeypair }`. Accepts either a JSON byte array (`[12,34,...]`, the Solana CLI format) or a base58-encoded secret key (the Phantom "export private key" format).
  - `loadWalletFromEnvValue(value)` – Same as `loadWallet` but reads the key from a string (e.g. an env var) instead of a file; accepts both formats.
  - `saveWallet(wallet, walletPath)` – Save an Anchor wallet to a JSON keypair file.

- **EVM (`evm-base-sepolia` / `evm-base-mainnet`)**
  - `evm.generateWallet()` – Generate a new EVM wallet and return `{ privateKey }`.
  - `evm.loadWallet(walletPath)` – Load a private key from file and return `{ privateKey }`.
  - `evm.saveWallet(privateKey, walletPath)` – Save a private key (hex) to file.

For complete API documentation, see the [package README](./js/README.md).

## Project Structure

```
overheatSDK/
├── js/                      # npm package source code
│   ├── lib/                 # Core SDK implementation
│   ├── index.ts             # Package entry point
│   └── package.json         # npm package configuration
├── examples/
│   ├── basic/               # Easiest-to-read scripts (const parameters)
│   │   ├── get-all-questions.ts
│   │   ├── get-question-by-address.ts
│   │   ├── get-questions-by-created-time.ts
│   │   ├── register-question.ts
│   │   ├── update-answer.ts
│   │   ├── question-interpretation.ts
│   │   ├── wallet-example-sol.ts
│   │   └── wallet-example-evm.ts
│   └── cli/                 # CLI-oriented scripts using process.argv
│       ├── get-all-questions.ts
│       ├── get-question-by-address.ts
│       ├── get-questions-by-created-time.ts
│       ├── register-question.ts
│       ├── update-answer.ts
│       ├── wallet-example-sol.ts
│       └── wallet-example-evm.ts
├── package.json             # Root package.json for running examples
├── .env.example             # Template for example env vars (copy to `.env`)
└── README.md                # This file
```

## Running Examples

The example scripts demonstrate how to use the SDK in two styles:

- `examples/basic/`: All parameters are hard-coded `const` values, suitable for reading & copy-paste.
- `examples/cli/`: Command-line tools that parse `process.argv`.

### Setup

```bash
# Install dependencies (the examples depend on the published npm package `@overheat-oracle/sdk`)
npm install
```

For `question-interpretation`, create a `.env` file in the repo root (see `.env.example`) with your gateway API credentials:

- `OVERHEAT_API_SECRET_ID`
- `OVERHEAT_API_SECRET_KEY`

The gateway expects `Authorization: Bearer <secretId>:<secretKey>`. The example loads these via `dotenv`.

### Basic examples

Run them directly with `ts-node` (or your own build tooling):

```bash
npx ts-node examples/basic/get-all-questions.ts
npx ts-node examples/basic/register-question.ts
npx ts-node examples/basic/update-answer.ts
npm run example:basic:question-interpretation
```

These scripts hard-code the network, question content, and times, so they are easier to read and copy into your own code.

### CLI examples

If you prefer passing parameters from the command line, use `examples/cli`:

```bash
# Get all questions
npx ts-node examples/cli/get-all-questions.ts

# Get question by address
npx ts-node examples/cli/get-question-by-address.ts <question_address>

# Get questions by created time
npx ts-node examples/cli/get-questions-by-created-time.ts 1704067200 1704153600

# Register question (see script for exact parameter order)
npx ts-node examples/cli/register-question.ts \
  "Will BTC trade above $100k by 2030-01-01?" \
  1735689600 \
  1735776000 \
  "Crypto" \
  "Resolution according to CoinGecko BTC/USD daily close." \
  0.75

# Update answer
npx ts-node examples/cli/update-answer.ts \
  <question_address> \
  true \
  "Explanation of the answer"
```

## Documentation

- **API Documentation**: See [js/README.md](./js/README.md) for complete API reference and usage examples
- **GitHub Repository**: https://github.com/OverheatSG/overheatSDK
- **Issues**: https://github.com/OverheatSG/overheatSDK/issues

## License

MIT
