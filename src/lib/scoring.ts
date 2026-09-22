import { PREY_TYPES } from "./constants/gameConfig";
import type { PreyType } from "./types/game";

/** Points for catching prey at a given combo (1-based multiplier). */
export function preyCatchPoints(
  preyType: PreyType,
  combo: number,
  bonusPerLevel: number
): number {
  const base = PREY_TYPES[preyType]?.value ?? 100;
  const multiplier = Math.max(1, combo);
  return base * multiplier + Math.max(0, combo - 1) * bonusPerLevel;
}

export function formatScore(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
