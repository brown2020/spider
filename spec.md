# Spider specification

This describes the game as it is built on `dev`. Balance numbers live in `src/lib/constants/gameConfig.ts`.

## Product

Spider is a single-player, client-only arcade game. The player controls a spider, catches prey for points, and tries to beat the best score stored in the browser. There is no server scoreboard, account, or payment flow.

## Routes

| Path | What it is |
| --- | --- |
| `/` | The game. Rendered on the client. The server sends a loading shell. |
| `/about` | A short static description and a link back to the game. |
| `/api/*` | Not implemented. Next.js returns 404. |

## Session

- **Menu** — Start Hunting. Shows the stored best score when it is greater than 0.
- **Playing** — the simulation runs.
- **Paused** — Resume, Restart, or End Hunt. Restart keeps the best score and starts a new run. End Hunt opens game over.
- **Game over** — shows the final score and Play Again.
- The first time a run starts, a tutorial pauses the game until the player finishes or skips it.

There is no health, timer, or prey attack. A run continues until the player ends it or restarts.

## World

The play field is the browser viewport. The spider falls under gravity and lands on a ground line. Holding up flies against gravity. Holding down pushes toward the ground. Left and right crawl, with momentum. Jump and double-jump spend a little web energy on the second jump. Zip spends more energy and dashes toward a point, then slows. Walk input does not steer during a zip.

Web shots are straight lines from the spider to the cursor (or, on the touch web button, toward the nearest prey, otherwise ahead of the facing direction). A web lasts several seconds and traps prey that cross it. Up to eight webs stay active.

## Prey

Prey spawn from the edges. Spawn pace and speed increase with score until the difficulty cap. Types:

| Type | Behavior | Points |
| --- | --- | --- |
| Moth | Straight flight, then bounce | 100 |
| Firefly | Hovering | 150 |
| Beetle | Straight flight, then bounce | 200 |
| Butterfly | Erratic | 250 |
| Dragonfly | Holds a fast cruise speed | 300 |
| Golden moth | Erratic, rare | 500 |

Prey flee when the spider is close. Touching a prey catches it. Webs are not required.

## Score

Catch points are `base × combo + (combo − 1) × 50`. The combo increases when catches fall inside the combo window and stops at 10. The HUD shows a new-best banner when the live score is at least the best, and shows the best when the live score is lower.

The best score is the greater of the stored value and the current score. Non-numeric or negative stored values are treated as 0. It is written to `localStorage` when it changes, on restart, and when the hunt ends.

## Power-ups

A catch can drop one of: Speed Boost, Web Refill, Prey Magnet, Multi Web, or Slow Motion.

| Power-up | Effect |
| --- | --- |
| Speed Boost | Horizontal movement is 1.5× for 8 seconds. Applied once. |
| Web Refill | Adds 50 energy immediately, capped at 100. |
| Prey Magnet | Pulls nearby prey toward the spider for 6 seconds, including prey that are fleeing. |
| Multi Web | One shot fires three webs for 10 seconds. |
| Slow Motion | Prey displacement is halved and new prey spawn less often for 5 seconds. |

Web energy regenerates over time. Shooting and zipping spend energy. A shot is refused when energy is below the shoot cost.

## Input

Desktop listeners are on the window. Opposite keys cancel. Shift changes run speed even if it is pressed after movement starts. Releasing a vertical key does not cancel a jump. Pausing clears held keys so the spider does not keep moving after resume.

Touch controls appear when the browser reports touch and the user agent looks like a phone or tablet. The joystick sets the move target. Releasing it does not zero jump velocity.

## Audio and effects

Sounds are synthesized with the Web Audio API. A bad stored volume is ignored. Screen shake and screen flash each keep a single timer so a new effect is not cleared by the previous one.

## Persistence

| Key | Meaning |
| --- | --- |
| `spiderHighScore` | Best score |
| `spiderTutorialComplete` | Tutorial finished or skipped |
| `spiderSoundEnabled` | `"false"` mutes |
| `spiderSoundVolume` | Number from 0 to 1 |

Storage failures are ignored so a blocked `localStorage` does not stop the round.

## Security

The app has no secrets and no authenticated routes. `next.config.mjs` sends a Content-Security-Policy (including `frame-ancestors 'none'`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a referrer policy, and a locked-down permissions policy. `script-src` allows inline scripts because Next.js inlines its flight payload.

## Build

`npm run build` must succeed with no environment variables set. CI installs with `npm ci`, then lints, typechecks, tests, and builds.
