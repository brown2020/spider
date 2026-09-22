import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { preyCatchPoints, formatScore } from "./scoring";

describe("preyCatchPoints", () => {
  it("scores moth at combo 1 as base points", () => {
    assert.equal(preyCatchPoints("moth", 1, 50), 100);
  });

  it("applies combo multiplier and bonus", () => {
    assert.equal(preyCatchPoints("moth", 3, 50), 100 * 3 + 2 * 50);
  });

  it("dragonfly base is 300", () => {
    assert.equal(preyCatchPoints("dragonfly", 1, 50), 300);
  });
});

describe("formatScore", () => {
  it("formats thousands", () => {
    assert.equal(formatScore(1500), "1.5K");
  });
});
