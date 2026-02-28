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

The example scripts are located in `js/example/` and demonstrate how to use the SDK:

```bash
cd js
npm install

# Get all questions
npx ts-node example/get_all_questions.ts

# Get a specific question
npx ts-node example/get_question_by_address.ts <question_address>

# Register a question
npx ts-node example/register_question.ts <question_text> <expected_expiration_time> <latest_expiration_time> <category> <rule> [wallet_path]

# Update answer
npx ts-node example/update_answer.ts <question_address> <answer> <extension> [wallet_path]
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
