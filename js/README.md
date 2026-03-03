# overheat-sdk

TypeScript SDK for interacting with the Overheat Solana oracle program.

## Installation

```bash
npm install overheat-sdk
```

## Quick Start

```typescript
import { getAllQuestions, setNetwork } from 'overheat-sdk';

// Set network (defaults to devnet)
setNetwork('devnet');

// Get all questions
const questions = await getAllQuestions();
console.log(`Found ${questions.length} questions`);
```

## Environment Configuration

The SDK supports **devnet**, **staging**, and **mainnet** environments. By default, it uses **devnet**.

```typescript
import { setNetwork } from 'overheat-sdk';

// Switch network
setNetwork('mainnet'); // or 'devnet', 'staging'

// Or use environment variable
process.env.OVERHEAT_NETWORK = 'mainnet';
```

## API Reference

### Configuration

#### `setNetwork(network: 'devnet' | 'staging' | 'mainnet')`

Set the active network environment.

```typescript
import { setNetwork } from 'overheat-sdk';
setNetwork('mainnet');
```

#### `getNetwork(): 'devnet' | 'staging' | 'mainnet'`

Get the current network.

```typescript
import { getNetwork } from 'overheat-sdk';
const network = getNetwork();
```

#### `getConfig(): NetworkConfig`

Get the current network configuration.

```typescript
import { getConfig } from 'overheat-sdk';
const config = getConfig();
console.log(config.rpcUrl);
```

### Question Operations

#### `getAllQuestions(): Promise<QuestionInfo[]>`

Get all registered questions from the current network.

```typescript
import { getAllQuestions } from 'overheat-sdk';

const questions = await getAllQuestions();
questions.forEach(q => {
  console.log(q.address, q.questionText, q.answer);
});
```

#### `getQuestionByAddress(address: string): Promise<QuestionInfo | null>`

Get a specific question by its address.

```typescript
import { getQuestionByAddress } from 'overheat-sdk';

const question = await getQuestionByAddress('3W7ST5htXbXZtDpTaYuNZQ1Fe3bU9reffTvV4NGqE7J7');
if (question) {
  console.log(question.questionText, question.answer);
}
```

#### `getQuestionsByTimeRange(timeRange?: TimeRangeFilter): Promise<QuestionInfo[]>`

Get questions filtered by creation time range. Uses the `created_at` field stored in the Question account for efficient filtering.

```typescript
import { getQuestionsByTimeRange } from 'overheat-sdk';

// Get questions created between two timestamps
const questions = await getQuestionsByTimeRange({
  startTime: 1704067200, // Unix timestamp (seconds)
  endTime: 1704153600
});

// Get all questions (no filter)
const allQuestions = await getQuestionsByTimeRange();
```

#### `getQuestionsAfterTime(startTime: number): Promise<QuestionInfo[]>`

Get questions created after a specific time.

```typescript
import { getQuestionsAfterTime } from 'overheat-sdk';

const questions = await getQuestionsAfterTime(1704067200);
```

#### `getQuestionsBeforeTime(endTime: number): Promise<QuestionInfo[]>`

Get questions created before a specific time.

```typescript
import { getQuestionsBeforeTime } from 'overheat-sdk';

const questions = await getQuestionsBeforeTime(1704153600);
```

#### `registerQuestion(params, wallet, walletKeypair): Promise<RegisterQuestionResult>`

Register a new question on the blockchain. The question rules are automatically uploaded to Arweave.

```typescript
import { registerQuestion, loadWallet } from 'overheat-sdk';
import * as anchor from '@coral-xyz/anchor';

const { wallet, keypair } = loadWallet('~/.config/solana/id.json');

const result = await registerQuestion(
  {
    questionText: 'Will Bitcoin reach $100,000 by the end of 2025?',
    expectedExpirationTime: 1735689600, // Unix timestamp (seconds)
    latestExpirationTime: 1735776000,   // Unix timestamp (seconds)
    category: 'Crypto',
    rules: 'Price must be confirmed by at least 3 major cryptocurrency exchanges.'
  },
  wallet,
  keypair
);

console.log('Question address:', result.questionAddress);
console.log('Transaction:', result.transaction);
console.log('Arweave ID:', result.arweaveId);
```

**Parameters:**
- `params.questionText`: The question text (max 500 bytes)
- `params.expectedExpirationTime`: Unix timestamp in seconds
- `params.latestExpirationTime`: Unix timestamp in seconds
- `params.category`: Category string (max 100 bytes)
- `params.rules`: Rules description string (stored on Arweave)
- `wallet`: Anchor wallet instance
- `walletKeypair`: Solana keypair for signing transactions and Arweave upload payment

#### `updateAnswer(questionAddress, answer, explanation, wallet): Promise<UpdateAnswerResult>`

Update the answer and explanation for a question. Only the question authority can update the answer.

```typescript
import { updateAnswer, loadWallet } from 'overheat-sdk';

const { wallet } = loadWallet('~/.config/solana/id.json');

const result = await updateAnswer(
  '3W7ST5htXbXZtDpTaYuNZQ1Fe3bU9reffTvV4NGqE7J7',
  false, // true for Yes, false for No
  'Additional information',
  wallet
);

console.log('Transaction:', result.transaction);
```

**Parameters:**
- `questionAddress`: The address of the question account
- `answer`: `true` for Yes, `false` for No
- `explanation`: Explanation string (max 200 bytes)
- `wallet`: Anchor wallet instance (must be the question authority)

### Display Utilities

#### `printQuestionDetail(question: QuestionInfo): void`

Print a single question in detailed format.

```typescript
import { getQuestionByAddress, printQuestionDetail } from 'overheat-sdk';

const question = await getQuestionByAddress('...');
if (question) {
  printQuestionDetail(question);
}
```

#### `printQuestionsList(questions: QuestionInfo[], header?: string): void`

Print multiple questions in a list format.

```typescript
import { getAllQuestions, printQuestionsList } from 'overheat-sdk';

const questions = await getAllQuestions();
printQuestionsList(questions);
```

### Wallet Utilities

#### `loadWallet(walletPath: string): { wallet: anchor.Wallet, keypair: Keypair }`

Load a Solana wallet from a file path.

```typescript
import { loadWallet } from 'overheat-sdk';

const { wallet, keypair } = loadWallet('~/.config/solana/id.json');
```

### Arweave Integration

#### `uploadQuestionToArweave(questionData, walletKeypair): Promise<ArweaveUploadResult>`

Upload question data to Arweave using Irys Bundler.

```typescript
import { uploadQuestionToArweave } from 'overheat-sdk';
import { Keypair } from '@solana/web3.js';

const result = await uploadQuestionToArweave(
  {
    questionText: 'Will aliens visit Earth in 2026?',
    rules: 'Must be confirmed by at least 3 major news outlets.'
  },
  walletKeypair
);

console.log('Arweave ID:', result.transactionId);
```

#### `fetchQuestionFromArweave(transactionId: string): Promise<QuestionDescription>`

Fetch question data from Arweave.

```typescript
import { fetchQuestionFromArweave } from 'overheat-sdk';

const data = await fetchQuestionFromArweave('7abE51MLDEmmH13RGALPghJBBqiqiJ5LJZvQrApPL3i5');
console.log(data.questionText, data.rules);
```

## Types

### `QuestionInfo`

```typescript
interface QuestionInfo {
  address: string;                    // Public key address of the question account
  authority: string;                   // Public key of the question's authority (creator)
  createdAt: number;                   // Unix timestamp (seconds) when the question was created
  expectedExpirationTime: number;      // Expected expiration time as Unix timestamp (seconds)
  latestExpirationTime: number;        // Latest expiration time as Unix timestamp (seconds)
  questionText: string;                // The question text
  category: string;                    // Category string
  explanation: string;                 // Explanation string (provided when answer is updated)
  rules: string;                       // Rules description (fetched from Arweave)
  answer: string | null;               // 'Yes', 'No', or null if not answered yet
}
```

### `RegisterQuestionParams`

```typescript
interface RegisterQuestionParams {
  questionText: string;
  expectedExpirationTime: number;
  latestExpirationTime: number;
  category: string;
  rules: string;
}
```

### `RegisterQuestionResult`

```typescript
interface RegisterQuestionResult {
  success: boolean;
  questionAddress: string;
  transaction: string;
  arweaveId: string;
}
```

### `UpdateAnswerResult`

```typescript
interface UpdateAnswerResult {
  success: boolean;
  transaction: string;
}
```

### `TimeRangeFilter`

```typescript
interface TimeRangeFilter {
  startTime?: number;  // Start time as Unix timestamp (seconds), inclusive
  endTime?: number;    // End time as Unix timestamp (seconds), inclusive
}
```

## Complete Example

```typescript
import {
  registerQuestion,
  getAllQuestions,
  getQuestionByAddress,
  getQuestionsByTimeRange,
  updateAnswer,
  loadWallet,
  setNetwork
} from 'overheat-sdk';

async function main() {
  // Set network
  setNetwork('devnet');

  // Load wallet
  const { wallet, keypair } = loadWallet('~/.config/solana/id.json');

  // Register a question
  const registerResult = await registerQuestion(
    {
      questionText: 'Will Bitcoin reach $100,000 by the end of 2025?',
      expectedExpirationTime: 1735689600,
      latestExpirationTime: 1735776000,
      category: 'Crypto',
      rules: 'Price must be confirmed by at least 3 major cryptocurrency exchanges.'
    },
    wallet,
    keypair
  );
  console.log('Registered:', registerResult.questionAddress);

  // Get all questions
  const questions = await getAllQuestions();
  console.log('Total questions:', questions.length);

  // Get specific question
  const question = await getQuestionByAddress(registerResult.questionAddress);
  if (question) {
    console.log('Question:', question.questionText);
  }

  // Get questions by time range
  const recentQuestions = await getQuestionsByTimeRange({
    startTime: 1704067200
  });
  console.log('Recent questions:', recentQuestions.length);

  // Update answer
  await updateAnswer(
    registerResult.questionAddress,
    false,
    'Additional information',
    wallet
  );
}

main().catch(console.error);
```

## License

MIT
