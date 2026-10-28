import assert from "node:assert/strict";
import { before, describe, it, mock } from "node:test";
import { GAME_CONFIG, POWER_UP_CONFIG } from "../lib/constants/gameConfig";
import { preyCatchPoints } from "../lib/scoring";

const memory = new Map<string, string>();
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

let useGameStore!: typeof import("./gameStore").useGameStore;

before(async () => {
  ({ useGameStore } = await import("./gameStore"));
});

function reset(highScore = 0) {
  memory.set("spiderHighScore", String(highScore));
  const groundY = 600 - GAME_CONFIG.physics.groundHeight;
  useGameStore.getState().resetGame();
  useGameStore.getState().setDimensions({ width: 1000, height: 600 });
  useGameStore.setState((state) => ({
    inputAxes: { x: 0, y: 0 },
    gameState: {
      ...state.gameState,
      gamePhase: "playing",
      position: { x: 200, y: groundY },
      velocity: { x: 0, y: 0 },
      isJumping: false,
      isZipping: false,
      score: 0,
      highScore,
      webEnergy: 10,
      difficulty: 1,
      activePowerUps: [],
      combo: 0,
      lastCatchTime: 0,
    },
    preyList: [],
    powerUps: [],
    webs: [],
  }));
  return groundY;
}

describe("game store fixes", () => {
  it("keeps web energy granted by a refill pickup", () => {
    const groundY = reset();
    useGameStore.setState({
      powerUps: [
        {
          id: "refill",
          type: "webEnergy",
          position: { x: 200, y: groundY },
          createdAt: 0,
          lifetime: 10000,
        },
      ],
    });
    useGameStore.getState().tick();
    const after = useGameStore.getState();
    assert.equal(after.powerUps.length, 0);
    assert.ok(after.gameState.webEnergy >= 10 + GAME_CONFIG.powerUp.effects.webEnergy);
  });

  it("pulls fleeing prey when the magnet is active", () => {
    const groundY = reset();
    const place = (magnet: boolean) => {
      useGameStore.setState((state) => ({
        gameState: {
          ...state.gameState,
          position: { x: 100, y: groundY },
          activePowerUps: magnet
            ? [{ type: "magnet", expiresAt: Date.now() + 10000 }]
            : [],
        },
        preyList: [
          {
            id: "moth-1",
            type: "moth",
            position: { x: 220, y: groundY },
            velocity: { x: 0, y: 0 },
            isTrapped: false,
            angle: 0,
            wingPhase: 0,
          },
        ],
      }));
      useGameStore.getState().updatePrey();
      return useGameStore.getState().preyList[0].velocity.x;
    };
    assert.ok(place(true) < place(false));
  });

  it("slows prey movement while slow time is active", () => {
    reset();
    const step = (slow: boolean) => {
      useGameStore.setState((state) => ({
        gameState: {
          ...state.gameState,
          position: { x: 0, y: 0 },
          activePowerUps: slow
            ? [{ type: "slowTime", expiresAt: Date.now() + 10000 }]
            : [],
        },
        preyList: [
          {
            id: "fly",
            type: "dragonfly",
            position: { x: 400, y: 200 },
            velocity: { x: 5, y: 0 },
            isTrapped: false,
            angle: 0,
            wingPhase: 0,
          },
        ],
      }));
      useGameStore.getState().updatePrey();
      return useGameStore.getState().preyList[0].position.x;
    };
    const normal = step(false);
    const slowed = step(true);
    assert.ok(slowed - 400 < normal - 400);
    assert.equal(slowed, 400 + 5 * GAME_CONFIG.powerUp.effects.slowTime);
  });

  it("scales flee and fast prey by difficulty", () => {
    reset();
    useGameStore.setState((state) => ({
      gameState: {
        ...state.gameState,
        difficulty: 3,
        position: { x: -1000, y: -1000 },
      },
      preyList: [
        {
          id: "fast",
          type: "dragonfly",
          position: { x: 100, y: 100 },
          velocity: { x: 0, y: 0 },
          isTrapped: false,
          angle: 0,
          wingPhase: 0,
        },
      ],
    }));
    useGameStore.getState().updatePrey();
    const scale = 1 + 2 * GAME_CONFIG.difficulty.preySpeedBonus;
    assert.equal(useGameStore.getState().preyList[0].velocity.x, 5 * scale);
  });

  it("scores catches with preyCatchPoints and stores a new best", () => {
    reset(10);
    useGameStore.setState({
      frameTime: 1000,
      preyList: [
        {
          id: "moth",
          type: "moth",
          position: { x: 1, y: 1 },
          velocity: { x: 0, y: 0 },
          isTrapped: false,
          angle: 0,
          wingPhase: 0,
        },
      ],
    });
    useGameStore.getState().catchPrey("moth");
    const points = preyCatchPoints("moth", 1, GAME_CONFIG.combo.bonusPerLevel);
    assert.equal(useGameStore.getState().gameState.score, points);
    assert.equal(useGameStore.getState().gameState.highScore, points);
    assert.equal(memory.get("spiderHighScore"), String(points));
  });

  it("ends the hunt on the game-over path and saves the score", () => {
    reset(5);
    useGameStore.setState((state) => ({
      gameState: { ...state.gameState, score: 80, highScore: 5 },
    }));
    useGameStore.getState().endGame();
    assert.equal(useGameStore.getState().gameState.gamePhase, "gameOver");
    assert.equal(useGameStore.getState().gameState.highScore, 80);
    assert.equal(memory.get("spiderHighScore"), "80");
  });

  it("does not let a corrupt high score become NaN", () => {
    reset();
    useGameStore.setState((state) => ({
      gameState: { ...state.gameState, score: 30, highScore: Number.NaN },
    }));
    useGameStore.getState().commitHighScore();
    assert.equal(useGameStore.getState().gameState.highScore, 30);
    assert.equal(memory.get("spiderHighScore"), "30");
  });

  it("uses each power-up's own duration", () => {
    reset();
    useGameStore.setState({
      frameTime: 1000,
      powerUps: [
        {
          id: "slow",
          type: "slowTime",
          position: { x: 200, y: 600 - GAME_CONFIG.physics.groundHeight },
          createdAt: 0,
          lifetime: 10000,
        },
      ],
    });
    useGameStore.getState().collectPowerUp("slow");
    const active = useGameStore.getState().gameState.activePowerUps[0];
    assert.equal(active.expiresAt, 1000 + POWER_UP_CONFIG.slowTime.duration);
  });

  it("does not let an earlier screen shake clear a later one", () => {
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      reset();
      useGameStore.getState().triggerScreenShake(4);
      mock.timers.tick(100);
      useGameStore.getState().triggerScreenShake(9);
      mock.timers.tick(100);
      assert.equal(useGameStore.getState().gameState.screenShake, 9);
      mock.timers.tick(100);
      assert.equal(useGameStore.getState().gameState.screenShake, 0);
    } finally {
      mock.timers.reset();
    }
  });

  it("steers vertically from input and leaves jump velocity alone", () => {
    const groundY = reset();
    useGameStore.setState((state) => ({
      inputAxes: { x: 0, y: -GAME_CONFIG.spider.baseSpeed },
      gameState: {
        ...state.gameState,
        position: { x: 200, y: groundY },
        velocity: { x: 0, y: 0 },
      },
    }));
    useGameStore.getState().tick();
    assert.ok(useGameStore.getState().gameState.velocity.y < 0);

    useGameStore.setState((state) => ({
      inputAxes: { x: 0, y: 0 },
      gameState: {
        ...state.gameState,
        isJumping: true,
        velocity: { x: 0, y: -GAME_CONFIG.spider.jumpForce },
        position: { x: 200, y: groundY },
      },
    }));
    useGameStore.getState().tick();
    assert.ok(useGameStore.getState().gameState.velocity.y < -1);
  });

  it("does not crush zip speed with walk input", () => {
    const groundY = reset();
    useGameStore.setState((state) => ({
      inputAxes: { x: GAME_CONFIG.spider.baseSpeed, y: 0 },
      gameState: {
        ...state.gameState,
        isZipping: true,
        isJumping: true,
        position: { x: 200, y: groundY - 100 },
        velocity: { x: GAME_CONFIG.physics.zipSpeed, y: 0 },
      },
    }));
    useGameStore.getState().tick();
    const vx = useGameStore.getState().gameState.velocity.x;
    assert.ok(vx > GAME_CONFIG.physics.zipSpeed * 0.9);
  });

  it("applies the speed boost once", () => {
    const groundY = reset();
    useGameStore.setState((state) => ({
      inputAxes: { x: GAME_CONFIG.spider.baseSpeed, y: 0 },
      gameState: {
        ...state.gameState,
        position: { x: 200, y: groundY },
        velocity: { x: GAME_CONFIG.spider.baseSpeed, y: 0 },
        activePowerUps: [{ type: "speed", expiresAt: Date.now() + 10000 }],
      },
    }));
    useGameStore.getState().tick();
    const moved = useGameStore.getState().gameState.position.x - 200;
    assert.equal(
      moved,
      GAME_CONFIG.spider.baseSpeed * GAME_CONFIG.powerUp.effects.speed
    );
  });
});
