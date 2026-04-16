import type { NetworkConfig } from "../config";
import { get_all_questions } from "./get-all-questions";
import type { QuestionInfo, TimeRangeFilter } from "../types";

export async function get_questions_by_time_range(
  config: NetworkConfig,
  timeRange?: TimeRangeFilter
): Promise<QuestionInfo[]> {
  const list = await get_all_questions(config);
  if (!timeRange) {
    list.sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
    return list;
  }
  const { startTime, endTime } = timeRange;
  const filtered = list.filter((q) => {
    const t = q.createdAt;
    if (startTime !== undefined && t < startTime) return false;
    if (endTime !== undefined && t > endTime) return false;
    return true;
  });
  filtered.sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
  return filtered;
}
