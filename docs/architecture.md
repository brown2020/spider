# Architecture

## Map

```
Browser
  └─ Next.js App Router (static /, /about)
       └─ page.tsx → ClientWrapper → GameContainer (client)
            ├─ Environment / Spider / Prey / Webs / Particles / PowerUps
            ├─ HUD / Menu / Controls / Tutorial
            ├─ useGameLoop + gameStore.tick()
            └─ localStorage: spiderHighScore
```

## Authority per write

| Path | Fact | Writer | Cache / durability |
| --- | --- | --- | --- |
| start_game | gamePhase, score, entities | `startGame` / `resetGame` | in-memory |
| move_spider | position, velocity | `updatePosition` / `setVelocity` / input | in-memory |
| shoot_web | webs[], webEnergy | `shootWeb` | in-memory |
| catch_prey | score, combo, preyList | `catchPrey` | in-memory (+ high score) |
| pause_game | gamePhase playing↔paused | `pauseGame` / `resumeGame` | in-memory |
| persist_high_score | highScore | `endGame` / catch path | localStorage only |

No server cache. Reload restores high score from localStorage; live board state is discarded.

## Server / client

All interactive gameplay is client (`"use client"`). `/about` is a Server Component page.
No route handlers or server actions. Unauthorized `/api/*` returns Next 404 — there is no
privileged mutation surface.

## Change exercises

1. **Data:** change `PREY_TYPES` point values in `src/lib/constants/gameConfig.ts` —
   scoring and unit tests update; UI unchanged.
2. **Access:** adding a future `/api/scores` would require a new route file and explicit
   auth; today access is "everyone mutates local state; nobody mutates server state"
   proven by absent routes + 404.
