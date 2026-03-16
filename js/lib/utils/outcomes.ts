export function normalizeOutcomes(outcomes: string[] | undefined | null): string[] {
  const src = Array.isArray(outcomes) ? outcomes : [];
  return src.slice(0, 30);
}

/**
 * Resolve a human-readable answer label to an index into outcomes.
 * Returns -1 when answer is empty (clear/unanswer).
 * Throws if non-empty answer does not match any outcome.
 */
export function resolveAnswerIndex(answer: string, outcomes: string[]): number {
  const trimmed = (answer ?? "").trim();
  if (!trimmed) return -1;
  const idx = outcomes.findIndex((o) => o === trimmed);
  if (idx < 0) {
    throw new Error(
      `Answer '${answer}' does not match any outcome. Available outcomes: ${outcomes.join(
        ", "
      )}`
    );
  }
  return idx;
}

