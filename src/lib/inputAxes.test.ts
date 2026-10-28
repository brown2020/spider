import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { axesFromKeys, isShiftHeld } from "./inputAxes";

describe("axesFromKeys", () => {
  it("maps vertical keys as well as horizontal keys", () => {
    const keys = new Set(["w", "d"]);
    assert.deepEqual(axesFromKeys(keys, 6), { x: 6, y: -6 });
  });

  it("cancels opposite keys so the remaining direction is restored on release", () => {
    const both = new Set(["a", "d"]);
    assert.deepEqual(axesFromKeys(both, 6), { x: 0, y: 0 });
    both.delete("d");
    assert.deepEqual(axesFromKeys(both, 6), { x: -6, y: 0 });
  });

  it("uses the speed it is given so Shift can change run speed", () => {
    const keys = new Set(["Shift", "ArrowRight"]);
    assert.equal(isShiftHeld(keys), true);
    assert.deepEqual(axesFromKeys(keys, 10), { x: 10, y: 0 });
  });
});
