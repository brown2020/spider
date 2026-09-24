# Spider

A fast-paced browser arcade game: control a spider in a night scene, shoot webs to trap prey, zip around the screen, chain combos, and grab power-ups. Fully client-side — no accounts, APIs, or env secrets required.

**Live demo:** [https://spiderdemo.vercel.app](https://spiderdemo.vercel.app/)

## Features

- **Web hunting** — left-click to shoot webs; trap moths, fireflies, beetles, butterflies, dragonflies, and rare golden moths
- **Movement** — WASD / arrows, jump (Space), run (Shift), right-click zip-to-cursor; touch joystick + buttons on mobile
- **Combos & scoring** — chain catches for multipliers; high score saved in `localStorage` (`spiderHighScore`)
- **Power-ups** — Speed Boost, Web Refill, Prey Magnet, Multi Web, Slow Motion
- **Progressive difficulty** — spawn and pacing scale with score (see `GAME_CONFIG`)
- **Atmosphere** — night sky, aurora, particles, screen shake, sprite animation
- **Audio** — procedural SFX via the Web Audio API (toggle in-game); no audio asset downloads
- **Tutorial & menus** — onboarding, pause, and game-over flows
- **About page** — `/about`

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js `^16.3.6` (App Router) |
| UI | React `^19.3.0`, Tailwind CSS `^4.3.3`, Geist fonts |
| Language | TypeScript `^6` |
| State | Zustand `^5` (`subscribeWithSelector`) |
| Tests | Node.js test runner via `tsx` |
| Lint | ESLint `^10` + `eslint-config-next` |

No Firebase, Stripe, or AI dependencies.

## Project structure

```
src/
  app/                 # /, /about
  components/
    game/              # GameContainer, spider, prey, webs, environment, particles, power-ups
    ui/                # HUD, menus, controls, tutorial, touch UI
  hooks/               # useGameLoop, useSpriteAnimation
  stores/              # gameStore (tick loop + entities)
  lib/
    constants/         # GAME_CONFIG, PREY_TYPES, POWER_UP_CONFIG, sprites
    types/             # game entity types
    utils/             # particles, sound
    scoring.ts         # scoring helpers (+ tests)
public/                # sprites / assets
docs/                  # architecture / budget notes
.github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22+
- npm

### Clone and install

```bash
git clone https://github.com/brown2020/spider.git
cd spider
npm install
```

### Environment variables

None required for local or production builds.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Controls (desktop)

| Input | Action |
| --- | --- |
| `W` `A` `S` `D` / arrows | Move |
| `Space` | Jump |
| `Shift` (hold) | Run |
| Left click | Shoot web |
| Right click | Zip to location |

Touch controls appear on smaller viewports.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Node tests under `src/**/*.test.ts` |
| `npm run doctor` | `react-doctor` check |

## Testing and CI

CI on `dev` / `main` and PRs: install → lint → typecheck → test → build. No secrets. Tests cover scoring helpers and route utilities.

## Deployment

Hosted on Vercel at [spiderdemo.vercel.app](https://spiderdemo.vercel.app/). Client-only; no host env vars required.

## Contributing

1. Work on `dev`.
2. Run `npm run lint`, `npm run typecheck`, and `npm test` before pushing.
3. Keep balance tweaks in `src/lib/constants/gameConfig.ts` when possible.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
