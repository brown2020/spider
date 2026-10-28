import assert from "node:assert/strict";
import { before, describe, it, mock } from "node:test";

const memory = new Map<string, string>([["spiderSoundVolume", "nope"]]);
const ramps: number[] = [];

class FakeParam {
  setValueAtTime(value: number) {
    if (!Number.isFinite(value)) throw new TypeError("non-finite");
  }
  linearRampToValueAtTime(value: number) {
    if (!Number.isFinite(value)) throw new TypeError("non-finite");
    ramps.push(value);
  }
}
class FakeNode {
  gain = new FakeParam();
  frequency = new FakeParam();
  type = "sine";
  connect() {
    return this;
  }
  start() {}
  stop() {}
}
class FakeContext {
  currentTime = 0;
  state = "running";
  destination = {};
  createOscillator() {
    return new FakeNode();
  }
  createGain() {
    return new FakeNode();
  }
  resume() {
    return Promise.resolve();
  }
}

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, String(value));
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  },
});
Object.assign(globalThis, { window: globalThis, AudioContext: FakeContext });

let soundManager!: typeof import("./utils/sound").soundManager;

before(async () => {
  ({ soundManager } = await import("./utils/sound"));
});

describe("sound safety", () => {
  it("replaces a non-numeric stored volume instead of throwing", () => {
    assert.equal(soundManager.getVolume(), 0.5);
    assert.doesNotThrow(() => soundManager.play("jump"));
    assert.ok(ramps.every((value) => Number.isFinite(value)));
  });

  it("applies master volume to combo arpeggios only once", () => {
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      ramps.length = 0;
      soundManager.playComboArpeggio(10);
      mock.timers.tick(0);
      assert.ok(ramps.includes(0.25 * soundManager.getVolume()));
      assert.equal(ramps.includes(0.25 * soundManager.getVolume() ** 2), false);
    } finally {
      mock.timers.reset();
    }
  });
});
