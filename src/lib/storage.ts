/** Parse a persisted high score. Missing, non-numeric, and negative values are 0. */
export function parseStoredHighScore(raw: string | null | undefined): number {
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/** Best of the stored high score and the current score, ignoring non-finite values. */
export function bestScore(highScore: number, score: number): number {
  const high = Number.isFinite(highScore) && highScore > 0 ? Math.floor(highScore) : 0;
  const current = Number.isFinite(score) && score > 0 ? Math.floor(score) : 0;
  return Math.max(high, current);
}

export function readStorageItem(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorageItem(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Private mode and blocked storage throw; gameplay continues either way.
  }
}

export function readStoredHighScore(): number {
  return parseStoredHighScore(readStorageItem("spiderHighScore"));
}

export function writeStoredHighScore(score: number): void {
  if (!Number.isFinite(score) || score < 0) return;
  writeStorageItem("spiderHighScore", String(Math.floor(score)));
}
