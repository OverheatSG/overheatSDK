# overheatSDK

npx ts-node get_all_questions.ts

npx ts-node get_question_by_address.ts <question_address>

Examples:
    npx ts-node get_question_by_address.ts Gf6MnhYAcBCioeqC9nqoDXASzgUESDNZvAPdNdbAV85j

npx ts-node register_question.ts <category> <expected_expiration_timestamp> <latest_expiration_timestamp> <question> [wallet_path]

Examples:
    npx ts-node register_question.ts 'Crypto' 1704583500 1704063000 'SOL Up or Down - 15 minutes - Jan 30 - 6:30PM EST to 6:45PM EST'
    