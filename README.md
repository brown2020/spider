# Spider

A browser arcade game. You play a spider in a night scene: move and jump, shoot webs to slow prey, zip across the screen, chain combos, and pick up power-ups. The game is entirely client-side. There is no account system, no API, and no environment variables.

**Live demo:** [https://spiderdemo.vercel.app](https://spiderdemo.vercel.app/)

## Features

- **Web hunting** — left-click shoots a web. Trapped prey move slower and are easier to catch. Prey types: moth, firefly, beetle, butterfly, dragonfly, and a rare golden moth.
- **Movement** — WASD or arrows move, including up and down. Space jumps (and double-jumps). Hold Shift to run. Right-click zips toward the cursor.
- **Touch** — on mobile browsers, a joystick plus jump, web, and zip buttons. The web button aims at the nearest prey.
- **Combos and score** — quick catches raise a combo multiplier. The best score is stored in the browser under `spiderHighScore`.
- **Power-ups** — Speed Boost, Web Refill, Prey Magnet, Multi Web, and Slow Motion. Each timed power-up uses its own duration.
- **Difficulty** — prey speed and spawn rate rise with score, up to a cap in `GAME_CONFIG`.
- **Round flow** — first-run tutorial, pause, and **End Hunt**, which opens the game-over screen and saves the best score.
- **Presentation** — night sky, particles, screen shake, and procedural sound through the Web Audio API. Sound can be muted in the HUD.
- **About** — `/about`.

## Tech stack

| Layer | Package |
| --- | --- |
| Framework | Next.js `^16.4.3` (App Router) |
| UI | React `^19.3.1`, React DOM `^19.3.1`, Tailwind CSS `^4.3.3` |
| Language | TypeScript `^6.0.3` for the compiler API (ESLint and `next build`). `npm run typecheck` runs TypeScript `^7.0.2` via `@typescript/native`. |
| State | Zustand `^5.0.16` |
| Tests | Node.js test runner via `tsx` `^4.23.15` |
| Lint | ESLint `^10.13.0` and `eslint-config-next` `^16.4.3` |

TypeScript 7.0 does not ship a compiler API. `typescript-eslint` and Next.js still import the `typescript` package, which stays on 6.0.3. The `tsc` binary used by `npm run typecheck` is TypeScript 7.

No Firebase, Stripe, or AI dependencies.

## Project structure

```
src/
  app/                 # /, /about
  components/
    game/              # GameContainer, spider, prey, webs, environment, particles, power-ups
    ui/                # HUD, menus, controls, tutorial, touch UI
  hooks/               # useGameLoop, useSpriteAnimation
  stores/              # gameStore (tick loop and entities)
  lib/
    constants/         # GAME_CONFIG, PREY_TYPES, POWER_UP_CONFIG, sprites
    types/             # game entity types
    utils/             # particles, sound
    scoring.ts         # catch points and HUD score labels
    storage.ts         # safe localStorage helpers
    inputAxes.ts       # keyboard axis resolution
public/                # spider sprite
docs/                  # architecture and budget notes
spec.md                # behavior as built
roadmap.md             # next steps and known gaps
.github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22
- npm

### Install

```bash
git clone https://github.com/brown2020/spider.git
cd spider
npm install
```

### Environment variables

None. Local and production builds do not read environment variables. Do not add secret values to the repo. If a future client variable is introduced, it must be optional at build time and documented here by name only.

Browser keys, not environment variables:

| Key | Purpose |
| --- | --- |
| `spiderHighScore` | Best score |
| `spiderTutorialComplete` | Tutorial dismissed |
| `spiderSoundEnabled` | Mute flag |
| `spiderSoundVolume` | Volume from 0 to 1 |

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Desktop controls

| Input | Action |
| --- | --- |
| `W` `A` `S` `D` / arrows | Move |
| `Space` | Jump, or double-jump while airborne |
| `Shift` (hold) | Run |
| Left click | Shoot web |
| Right click | Zip to the cursor |
| `Esc` | Pause or resume |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` (TypeScript 7) |
| `npm test` | Node tests under `src/**/*.test.ts` |
| `npm run doctor` | `react-doctor` check |

## Testing and CI

GitHub Actions on `dev`, `main`, and pull requests runs install, lint, typecheck, test, and build. The build does not need secrets. Tests cover scoring, storage, input axes, the game store, sound safety, response headers, and the absence of API routes.

## Deployment

Hosted on Vercel at [spiderdemo.vercel.app](https://spiderdemo.vercel.app/). No host environment variables are required. Response headers (CSP, `X-Frame-Options`, `nosniff`) are set in `next.config.mjs`.

## Contributing

1. Work on `dev`.
2. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` before pushing.
3. Keep balance numbers in `src/lib/constants/gameConfig.ts`.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
