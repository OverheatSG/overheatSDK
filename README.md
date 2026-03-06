# overheatSDK

TypeScript SDK for interacting with the Overheat Solana oracle program.

## Overview

The Overheat SDK provides a complete interface for interacting with the Overheat oracle program on Solana, including:

- **Question Registration**: Register new questions on-chain with rules stored on Arweave
- **Answer Updates**: Update question answers with explanations
- **Data Retrieval**: Query questions by address, time range, or get all questions
- **Network Support**: Works with both devnet and mainnet
- **Wallet Utilities**: Load/save wallet from JSON keypair file, generate new keypair

## Installation

### Using npm

```bash
npm install overheat-sdk
```

## Quick Start

```typescript
import { getAllQuestions, setNetwork } from 'overheat-sdk';

// Set network: devnet(default), staging and main
setNetwork('devnet');

// Get all questions
const questions = await getAllQuestions();
console.log(`Found ${questions.length} questions`);
```

### Wallet utilities

- **`loadWallet(walletPath)`** – Load a Solana wallet from a JSON keypair file (64-byte secret key as JSON array). Returns `{ keypair, wallet }`.
- **`saveWallet(wallet, walletPath)`** – Save an Anchor wallet to a JSON keypair file (writes the full 64-byte secret key so it can be loaded later with `loadWallet`).
- **`generateWallet()`** – Generate a new Solana keypair and return `{ keypair, wallet }`.

For complete API documentation, see the [package README](./js/README.md).

## Project Structure

```
overheatSDK/
├── js/                    # npm package source code
│   ├── lib/              # Core SDK functions
│   ├── utils/            # Utility functions (Arweave, wallet)
│   ├── index.ts          # Package entry point
│   └── package.json      # npm package configuration
├── example/              # Example scripts (use overheat-sdk package)
│   ├── get_all_questions.ts
│   ├── get_question_by_address.ts
│   ├── get_questions_by_created_time.ts
│   ├── register_question.ts
│   ├── update_answer.ts
│   └── wallet_example.ts
├── package.json          # Root package.json for running examples
└── README.md             # This file
```

## Running Examples

The example scripts demonstrate how to use the SDK. They are located in the `example/` directory and use the published `overheat-sdk` npm package.

### Setup

```bash
# Install dependencies (including overheat-sdk)
npm install
```

### Example Commands

**Get all questions:**
```bash
npx ts-node example/get_all_questions.ts
```

**Get a specific question:**
```bash
npx ts-node example/get_question_by_address.ts <question_address>
```

**Get questions created after a specific time:**
```bash
npx ts-node example/get_questions_by_created_time.ts 1704067200
```

**Test wallet utilities (generateWallet, saveWallet, loadWallet):**
```bash
npx ts-node example/wallet_example.ts [output_path]
# Default output: ./example-wallet.json
```

**Register a question:**
```bash
# Command format:
# npx ts-node example/register_question.ts <question_text> <expected_expiration_time> <latest_expiration_time> <category> <rules> <early_resolution_threshold> [wallet_path]
#
# Parameters:
#   question_text: The question text
#   expected_expiration_time: Unix timestamp (seconds)
#   latest_expiration_time: Unix timestamp (seconds)
#   category: Category string (max 100 bytes)
#   rules: Rules description string
#   early_resolution_threshold: Floating point number (f64) for early resolution threshold
#   wallet_path: Optional wallet path (defaults to ~/.config/solana/id.json)

# Example:
npx ts-node example/register_question.ts \
  "Will Bitcoin reach $100,000 by the end of 2025?" \
  1735689600 \
  1735776000 \
  "Crypto" \
  "Price must be confirmed by at least 3 major cryptocurrency exchanges. The price must be sustained for at least 24 consecutive hours." \
  0.75
```

**Update answer:**
```bash
npx ts-node example/update_answer.ts \
  <question_address> \
  true \
  "Explanation of the answer"

# Example
npx ts-node example/update_answer.ts \
  ALMfPWmvhwre6iDV77ABxAb1JmFMvg3uMDFNXYpKz3Nt \
  true \
  "Bitcoin reached $100,000 on December 15, 2024, confirmed by Coinbase, Binance, and Kraken exchanges."
```

## Documentation

- **API Documentation**: See [js/README.md](./js/README.md) for complete API reference and usage examples
- **GitHub Repository**: https://github.com/OverheatSG/overheatSDK
- **Issues**: https://github.com/OverheatSG/overheatSDK/issues

## License

MIT
