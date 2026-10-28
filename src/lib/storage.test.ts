import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bestScore,
  parseStoredHighScore,
  readStorageItem,
  writeStorageItem,
} from "./storage";

describe("parseStoredHighScore", () => {
  it("rejects non-numeric and negative values", () => {
    assert.equal(parseStoredHighScore("nope"), 0);
    assert.equal(parseStoredHighScore("-4"), 0);
    assert.equal(parseStoredHighScore(null), 0);
    assert.equal(parseStoredHighScore("250"), 250);
  });
});

describe("bestScore", () => {
  it("ignores NaN and keeps the greater finite score", () => {
    assert.equal(bestScore(Number.NaN, 40), 40);
    assert.equal(bestScore(80, 40), 80);
  });
});

describe("storage access", () => {
  it("survives a storage implementation that throws", () => {
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem() {
          throw new Error("blocked");
        },
        setItem() {
          throw new Error("blocked");
        },
      },
    });
    try {
      assert.equal(readStorageItem("spiderTutorialComplete"), null);
      writeStorageItem("spiderTutorialComplete", "true");
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: original,
      });
    }
  });
});
