# Repository Guidance

## Project Snapshot

Spider is a Next.js App Router browser arcade game (web hunting). Gameplay is
client-side: `src/components/game/GameContainer.tsx` orchestrates the loop.
State lives in `src/stores/gameStore.ts` (Zustand). High score persists in
`localStorage` (`spiderHighScore`) only. There is no auth and no server mutation API.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm test
npm run doctor
```

## Architecture Notes

- `src/app/layout.tsx` owns metadata and viewport (zoom unlocked).
- `src/stores/gameStore.ts` is the central mutation boundary (`tick`, `startGame`, etc.).
- Keep pure helpers in `src/lib/` for unit tests.
- Never inline `NEXT_PUBLIC_*` or API keys in `.github/workflows/*` — use
  `${{ secrets.* }}` only; gate jobs must tolerate missing secrets.
- Do not name non-hooks `use*`.

## Auth

Not applicable — no email/password surfaces.
