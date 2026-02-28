# overheatSDK

Solana SDK for interacting with the Overheat program.

## Installation

```bash
cd js
npm install
```

## Usage

### Get All Questions

```bash
npx ts-node get_all_questions.ts
```

### Get Question by Address

```bash
npx ts-node get_question_by_address.ts <question_address>
```

Example:
```bash
npx ts-node get_question_by_address.ts 3W7ST5htXbXZtDpTaYuNZQ1Fe3bU9reffTvV4NGqE7J7
```

### Register a Question

```bash
npx ts-node register_question.ts <question_text> <expected_expiration_time> <latest_expiration_time> <category> <rule> [wallet_path]
```

Parameters:
- `question_text`: The question text (max 500 bytes)
- `expected_expiration_time`: Unix timestamp in seconds
- `latest_expiration_time`: Unix timestamp in seconds
- `category`: Category string (max 100 bytes)
- `rule`: Rule description string
- `wallet_path`: Optional wallet path (defaults to `~/.config/solana/id.json`)

Note: 
- The `answer` field is automatically set to `None` when registering a question. Use `update_answer` to set the answer and extension later.
- Question data (questionText and rule) will be automatically uploaded to Arweave using Irys Bundler (paid with SOL).

Examples:
```bash
# Will aliens visit Earth in 2026?
npx ts-node register_question.ts 'Will aliens visit Earth in 2026?' 1767225600 1767302400 'Science' 'Must be confirmed by at least 3 major news outlets. UFO sightings alone do not count. The aliens must actually land or make contact.'

npx ts-node register_question.ts 'Will an AI win a Nobel Prize by 2027?' 1811808000 1813103999 'Science' 'The AI must be credited as a co-author or primary contributor. The prize must be awarded for work primarily done by the AI, not just assisted by it.'

```

### Update Answer

```bash
npx ts-node update_answer.ts <question_address> <answer> <extension> [wallet_path]
```

Update the answer and extension for a question. Only the question authority can update the answer.

Parameters:
- `question_address`: The address of the question account
- `answer`: `true` for Yes, `false` for No (can also use "yes"/"no" or "1"/"0")
- `extension`: Extension string (max 200 bytes)
- `wallet_path`: Optional wallet path (defaults to `~/.config/solana/id.json`)

Example:
```bash

npx ts-node update_answer.ts 3W7ST5htXbXZtDpTaYuNZQ1Fe3bU9reffTvV4NGqE7J7 false 'Additional information'

```
