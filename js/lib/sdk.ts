import type { Wallet as AnchorWallet } from "@coral-xyz/anchor";
import type { Signer as EvmSigner } from "ethers";
import type { NetworkConfig } from "./config";
import * as sol from "./sol";
import * as evm from "./evm";
import {
  uploadQuestionToArweaveWithSol,
  uploadQuestionToArweaveWithEvm,
  uploadExplanationToArweaveWithSol,
  uploadExplanationToArweaveWithEvm,
} from "./arweave/arweave";
import { resolveAnswerIndex } from "./utils/outcomes";
import type {
  ChainSigner,
  QuestionInfo,
  RegisterQuestionParams,
  RegisterQuestionResult,
  TimeRangeFilter,
  UpdateAnswerOptions,
} from "./types";

export type {
  ChainSigner,
  QuestionInfo,
  RegisterQuestionParams,
  RegisterQuestionResult,
  TimeRangeFilter,
  UpdateAnswerOptions,
} from "./types";

export const SOL_DEVNET_CONFIG: NetworkConfig = {
  network: "sol-devnet",
  rpcUrl: "https://api.zan.top/node/v1/solana/devnet/85f8917431284c59abfeaeb2e32a0d87",
  wsUrl: "wss://api.zan.top/node/ws/v1/solana/devnet/85f8917431284c59abfeaeb2e32a0d87",
  irysNode: "https://devnet.irys.xyz",
  irysGateway: "https://devnet.irys.xyz",
  idlFileName: "overheat-devnet.json",
  explorerCluster: "devnet",
  explorerUrl: "https://explorer.solana.com",
};

export const SOL_STAGING_CONFIG: NetworkConfig = {
  network: "sol-staging",
  rpcUrl: "https://api.zan.top/node/v1/solana/devnet/85f8917431284c59abfeaeb2e32a0d87",
  wsUrl: "wss://api.zan.top/node/ws/v1/solana/devnet/85f8917431284c59abfeaeb2e32a0d87",
  irysNode: "https://devnet.irys.xyz",
  irysGateway: "https://devnet.irys.xyz",
  idlFileName: "overheat-staging.json",
  explorerCluster: "devnet",
  explorerUrl: "https://explorer.solana.com",
};

export const EVM_BASE_SEPOLIA_CONFIG: NetworkConfig = {
  network: "evm-base-sepolia",
  rpcUrl: "https://sepolia.base.org",
  wsUrl: "",
  irysNode: "https://devnet.irys.xyz",
  irysGateway: "https://devnet.irys.xyz",
  idlFileName: "",
  explorerCluster: "",
  explorerUrl: "https://sepolia.basescan.org",
  contractAddress: "0x219DE4261878b5B0d4F37F489B2759748A9F1F5A",
};

export class OverheatSDK {
  readonly config: NetworkConfig;

  constructor(opts: { config: NetworkConfig }) {
    this.config = opts.config;
  }

  async loadWallet(walletPath: string): Promise<ChainSigner> {
    switch (this.config.network) {
      case "sol-devnet":
      case "sol-staging":
        const { solWallet } = sol.loadWallet(walletPath);
        return { chain: "solana" as const, wallet: solWallet };
      case "evm-base-sepolia":
        const { privateKey } = evm.loadWallet(walletPath);
        return { chain: "evm" as const, privateKeyHex: privateKey };
      default:
        throw new Error(`Unsupported network: ${this.config.network}`);
    }
  }

  async getAllQuestions(): Promise<QuestionInfo[]> {
    switch (this.config.network) {
      case "sol-devnet":
      case "sol-staging":
        return sol.get_all_questions(this.config);
      case "evm-base-sepolia":
        return evm.get_all_questions(this.config);
      default:
        throw new Error(`Unsupported network: ${this.config.network}`);
    }
  }

  async getQuestionByAddress(questionId: string): Promise<QuestionInfo | null> {
    switch (this.config.network) {
      case "sol-devnet":
      case "sol-staging":
        return sol.get_question_by_address(questionId, this.config);
      case "evm-base-sepolia":
        return evm.get_question_by_address(questionId, this.config);
      default:
        throw new Error(`Unsupported network: ${this.config.network}`);
    }
  }

  async getQuestionsByTimeRange(options?: {
    timeRange?: TimeRangeFilter;
  }): Promise<QuestionInfo[]> {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const timeRange: TimeRangeFilter = {
      startTime: options?.timeRange?.startTime ?? 0n,
      endTime: options?.timeRange?.endTime ?? now,
    };
    switch (this.config.network) {
      case "sol-devnet":
      case "sol-staging":
        return sol.get_questions_by_time_range(this.config, timeRange);
      case "evm-base-sepolia":
        return evm.get_questions_by_time_range(this.config, timeRange);
      default:
        throw new Error(`Unsupported network: ${this.config.network}`);
    }
  }

  async registerQuestion(
    signer: ChainSigner,
    params: RegisterQuestionParams
  ): Promise<RegisterQuestionResult> {
    switch (this.config.network) {
      case "sol-devnet":
      case "sol-staging": {
        if (signer.chain !== "solana") {
          throw new Error(
            `Network is ${this.config.network} but signer is ${signer.chain}. Use a Solana wallet.`
          );
        }
        const wallet = signer.wallet;
        const uploadResult = await uploadQuestionToArweaveWithSol(
          { questionText: params.questionText, rules: params.rules },
          wallet.payer,
          this.config
        );
        const r = await sol.register_question(
          params,
          wallet,
          uploadResult.transactionId,
          this.config
        );
        return { questionAddress: r.questionId, txHash: r.transaction };
      }
      case "evm-base-sepolia": {
        if (signer.chain !== "evm") {
          throw new Error(
            `Network is ${this.config.network} but signer is ${signer.chain}. Use an EVM signer.`
          );
        }
        const uploadResult = await uploadQuestionToArweaveWithEvm(
          { questionText: params.questionText, rules: params.rules },
          signer.privateKeyHex,
          this.config,
          this.config.network
        );
        const result = await evm.register_question(
          params,
          uploadResult.transactionId,
          signer.privateKeyHex,
          this.config
        );
        return {
          questionAddress: result.questionId,
          txHash: result.txHash,
        };
      }
      default:
        throw new Error(`Unsupported network: ${this.config.network}`);
    }
  }

  async updateAnswer(
    signer: ChainSigner,
    options: UpdateAnswerOptions
  ): Promise<string> {
    const { questionAddress, answer, explanation } = options;
    // Resolve answer label to index using current on-chain outcomes.
    const current = await this.getQuestionByAddress(questionAddress);
    if (!current) {
      throw new Error(`Question not found at address ${questionAddress}`);
    }
    const answerIndex = resolveAnswerIndex(answer, current.outcomes);
    switch (this.config.network) {
      case "sol-devnet":
      case "sol-staging": {
        if (signer.chain !== "solana") {
          throw new Error(
            `Network is ${this.config.network} but signer is ${signer.chain}. Use a Solana wallet.`
          );
        }
        const wallet = signer.wallet as AnchorWallet;
        const uploadResult = await uploadExplanationToArweaveWithSol(
          explanation,
          wallet.payer,
          this.config
        );
        const r = await sol.update_answer(
          questionAddress,
          answerIndex,
          uploadResult.transactionId,
          wallet,
          this.config
        );
        return r.transaction;
      }
      case "evm-base-sepolia": {
        if (signer.chain !== "evm") {
          throw new Error(
            `Network is ${this.config.network} but signer is ${signer.chain}. Use an EVM signer.`
          );
        }
        const uploadResult = await uploadExplanationToArweaveWithEvm(
          explanation,
          signer.privateKeyHex,
          this.config,
          this.config.network
        );
        const result = await evm.update_answer(
          signer.privateKeyHex,
          questionAddress,
          answerIndex,
          uploadResult.transactionId,
          this.config
        );
        return result.txHash;
      }
      default:
        throw new Error(`Unsupported network: ${this.config.network}`);
    }
  }
}
