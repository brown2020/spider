const LEFT_KEYS = ["ArrowLeft", "a", "A"] as const;
const RIGHT_KEYS = ["ArrowRight", "d", "D"] as const;
const UP_KEYS = ["ArrowUp", "w", "W"] as const;
const DOWN_KEYS = ["ArrowDown", "s", "S"] as const;

function held(keys: ReadonlySet<string>, names: readonly string[]): boolean {
  return names.some((name) => keys.has(name));
}

/** Walk/run target from the keys that are currently down. Opposites cancel. */
export function axesFromKeys(
  keys: ReadonlySet<string>,
  speed: number
): { x: number; y: number } {
  let x = 0;
  let y = 0;
  if (held(keys, LEFT_KEYS)) x -= speed;
  if (held(keys, RIGHT_KEYS)) x += speed;
  if (held(keys, UP_KEYS)) y -= speed;
  if (held(keys, DOWN_KEYS)) y += speed;
  return { x, y };
}

export function isShiftHeld(keys: ReadonlySet<string>): boolean {
  return keys.has("Shift");
}
