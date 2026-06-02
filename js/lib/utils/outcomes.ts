/** Logical outcome slots on-chain (matches Question::MAX_OUTCOMES). */
export const MAX_OUTCOMES = 32;

export function normalizeOutcomes(outcomes: string[] | undefined | null): string[] {
  const src = Array.isArray(outcomes) ? outcomes : [];
  return src.slice(0, MAX_OUTCOMES);
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

/**
 * Normalize values to boolean | null without changing length.
 * New contracts require answers.length === outcome_count.
 */
export function normalizeAnswers(
  answers: (boolean | null)[],
  maxOutcomes = MAX_OUTCOMES
): (boolean | null)[] {
  if (answers.length > maxOutcomes) {
    throw new Error(
      `answers length must be at most ${maxOutcomes} (got ${answers.length})`
    );
  }
  const out: (boolean | null)[] = answers.map((v) =>
    v === true || v === false ? v : null
  );
  return out;
}

/** @deprecated Use normalizeAnswers. */
export const padAnswersToMaxOutcomes = normalizeAnswers;

export function buildPerOutcomeAnswers(
  answerIndex: number,
  outcomesCount: number,
  maxOutcomes = MAX_OUTCOMES
): (boolean | null)[] {
  const result: (boolean | null)[] = [];
  const hasAnswer = answerIndex >= 0 && answerIndex < outcomesCount;
  if (outcomesCount > maxOutcomes) {
    throw new Error(
      `outcomesCount must be at most ${maxOutcomes} (got ${outcomesCount})`
    );
  }
  for (let i = 0; i < outcomesCount; i++) {
    if (!hasAnswer) {
      result.push(null);
      continue;
    }
    result.push(i === answerIndex ? true : false);
  }
  return result;
}

