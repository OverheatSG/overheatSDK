export * from "./lib/types";
export * from "./lib/config";
export * from "./lib/register_question";
export * from "./lib/update_answer";
export * from "./lib/get_all_questions";
export * from "./lib/get_question_by_address";
export * from "./utils/arweave";
export * from "./utils/wallet";

// 导出配置管理函数
export { setNetwork, getNetwork, getConfig, type Network, type NetworkConfig } from "./lib/config";
