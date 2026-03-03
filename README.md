# overheatSDK

Solana SDK for interacting with the Overheat program.

## Overview

This repository contains the TypeScript SDK for the Overheat Solana program. The SDK provides a complete interface for interacting with the Overheat oracle program, including question registration, answer updates, and data retrieval.

## Project Structure

```
overheatSDK/
├── js/                    # npm package source code
│   ├── lib/              # Core SDK functions
│   ├── utils/            # Utility functions
│   ├── example/          # Example scripts
│   ├── index.ts          # Package entry point
│   └── package.json      # npm package configuration
└── README.md             # This file
```

## Installation

### Using the npm Package

The SDK is published as `overheat-sdk` on npm:

```bash
npm install overheat-sdk
```

For detailed installation and usage instructions, see the [package README](./js/README.md).

### From Source

If you want to develop or contribute:

```bash
# Clone the repository
git clone https://github.com/OverheatSG/overheatSDK.git
cd overheatSDK

# Install dependencies
cd js
npm install

# Build the package
npm run build
```

## Development

### Running Example Scripts

The example scripts are located in `example/` and demonstrate how to use the SDK.

To run the examples:

```bash
# Install dependencies (including overheat-sdk)
npm install

# Then run the examples:

```bash
# Get all questions
npx ts-node example/get_all_questions.ts

# Get a specific question
npx ts-node example/get_question_by_address.ts <question_address>

# Get questions created after a specific time
npx ts-node example/get_questions_by_created_time.ts <start_time>

npx ts-node example/get_questions_by_created_time.ts 1704067200

# Register a question
npx ts-node example/register_question.ts <question_text> <expected_expiration_time> <latest_expiration_time> <category> <rule> [wallet_path]

npx ts-node example/register_question.ts \
  "Will aliens visit Earth in 2026?" \
  1735689600 \
  1735776000 \
  "Science" \
  "Must be confirmed by at least 3 major news outlets. UFO sightings alone do not count. The aliens must actually land or make contact."

# Update answer
npx ts-node example/update_answer.ts <question_address> <answer> <explanation> [wallet_path]
```

**Note:** The example scripts use the `overheat-sdk` npm package. Make sure you have installed it with `npm install overheat-sdk` before running the examples.

npx ts-node example/update_answer.ts \
  CJF2c5gbWhwykmijZb6Keqp8Bj1wkFi3B77WDrCRUXAq \
  true \
  "The Los Angeles Lakers won the NBA Finals 4-2 against their opponent. The championship was officially confirmed by the NBA on June 15, 2025."

```

See the [package README](./js/README.md) for detailed command examples.

### Building

```bash
cd js
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Publishing

See the package's `package.json` for publishing scripts. The package is published to npm as `overheat-sdk`.

## Documentation

- **Package Documentation**: See [js/README.md](./js/README.md) for complete API documentation and usage examples
- **GitHub Repository**: https://github.com/OverheatSG/overheatSDK
- **Issues**: https://github.com/OverheatSG/overheatSDK/issues

## License

MIT
