export * from "./lib/types";
export * from "./lib/config";
export * from "./lib/register_question";
export * from "./lib/update_answer";
export * from "./lib/get_all_questions";
export * from "./lib/get_question_by_address";
export * from "./lib/get_questions_by_time_range";
export * from "./utils/arweave";
export * from "./utils/wallet";

// Export configuration management functions
export { setNetwork, getNetwork, getConfig, type Network, type NetworkConfig } from "./lib/config";
