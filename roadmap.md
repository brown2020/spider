# Roadmap

Punchlist for Spider after the current `dev` build. There are no open GitHub issues or pull requests.

## Next

1. **A real fail state.** Runs only end from End Hunt or Restart. Prey never threaten the spider, so “survive” in the tutorial is not enforced. Add a lose condition (for example a life pool or a hazard) that calls `endGame`.
2. **Wander movement.** Moth and beetle are tagged `wander` but fly in a straight line until they bounce or flee. Give them a real wander step.
3. **Delta time.** `tick` assumes a fixed frame. On a slow refresh rate the spider, prey, and energy regen all slow down. Step physics with the frame delta and cap the step.
4. **Touch detection.** The joystick appears only when the device has touch and the user agent matches a phone or tablet. Touch laptops and tablets that report a desktop user agent stay on keyboard controls. Choose controls from input capability, not the user agent.
5. **TypeScript 7 API.** `npm run typecheck` already uses TypeScript 7. ESLint and `next build` still import TypeScript 6 because 7.0 has no compiler API. When TypeScript 7.1 ships an API and `typescript-eslint` supports it, drop the side-by-side package and depend on TypeScript 7 only.
6. **Tighter CSP.** `script-src` includes `'unsafe-inline'` so Next.js can inline its flight payload. Replace that with hashes or nonces if the framework can emit them without a custom server.

## Known gaps

- Coyote time, wall slide, and wall jump are configured and unused.
- `isOnWall` and `isWebShooting` are stored and never read.
- The home page always cancels the browser context menu, including while the menu is open.
- The best score lives only in `localStorage`. The player can edit it. There is no server record.
- Physics and rendering share one React tree updated every tick, so large prey and particle counts cost a full render per frame.
- Slow Motion does not slow the spider, gravity, or web timers. Only prey motion and spawns change.

## Not planned unless the product changes

- Accounts, Firebase, Stripe, or an AI provider.
- A public leaderboard. That would be the first server route and would need its own auth design.
- New environment variables. The build must keep working when none are set.

## Done recently

- High score persistence, End Hunt, and game over.
- Web Refill, magnet, slow motion, difficulty scaling, and combo scoring.
- Vertical movement, zip that is not cancelled by walking, and a single speed-boost multiplier.
- Safe storage and sound volume handling.
- Security headers and pinned CI actions.
