# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this codebase.

## Project Overview

Spider Game is a fast-paced web hunting arcade game built with Next.js 16, React 19, TypeScript, and Zustand for state management. Players control a spider in an atmospheric night environment, spinning webs to trap prey, zipping across the screen, building combos, and collecting power-ups.

**Live Demo:** https://spiderdemo.vercel.app/

## Key Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Production
npm run build        # Create production build
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture

### State Management (Zustand)

All game state is centralized in `src/stores/gameStore.ts` using Zustand with `subscribeWithSelector` middleware:

- **Core State:** `gameState` (position, velocity, score, phase), `webs`, `preyList`, `particles`, `powerUps`
- **Game Loop:** The `tick()` method is the main game loop, updating physics, collisions, and all systems each frame
- **Actions:** Movement (`updatePosition`, `jump`, `zipTo`), combat (`shootWeb`, `catchPrey`), effects (`addParticles`, `triggerScreenShake`)

### Component Structure

```
src/components/
├── ClientWrapper.tsx      # Client-side hydration boundary
├── game/
│   ├── GameContainer.tsx  # Main orchestrator, input handling, game loop
│   ├── Spider.tsx         # Player character with sprite animation
│   ├── Prey.tsx           # Enemy entities (moth, firefly, beetle, etc.)
│   ├── Webs.tsx           # Web projectile rendering
│   ├── Particles.tsx      # Particle effect system
│   ├── PowerUps.tsx       # Collectible power-ups
│   └── Environment.tsx    # Background, stars, moon, aurora
└── ui/
    ├── HUD.tsx            # Score, energy bar, combo display
    ├── Menu.tsx           # Main/pause/game over screens
    ├── Controls.tsx       # Touch controls & help overlay
    └── Tutorial.tsx       # New player onboarding
```

### Custom Hooks

- `useGameLoop.ts` - Handles `requestAnimationFrame` loop, keyboard/mouse input, touch controls
- `useSpriteAnimation.ts` - Manages sprite sheet frame cycling

### Configuration

All game balance values are centralized in `src/lib/constants/gameConfig.ts`:

- `GAME_CONFIG` - Spider physics, web mechanics, prey behavior, combo timing, difficulty scaling, power-up effects, particle counts
- `PREY_TYPES` - Per-prey-type speed, size, point value, color, behavior pattern, spawn weight
- `POWER_UP_CONFIG` - Power-up names, colors, icons, durations

### Type System

Core TypeScript interfaces in `src/lib/types/game.ts`:

- `GameState` - Player position, velocity, score, phase, active power-ups
- `Web`, `Prey`, `Particle`, `PowerUp`, `ScorePopup` - Entity interfaces
- `PreyType`, `PowerUpType` - Union types for prey/power-up variants
- `Vector2D` - Common 2D coordinate interface

## Common Development Tasks

### Adding a New Prey Type

1. Add to `PreyType` union in `src/lib/types/game.ts`
2. Add configuration object to `PREY_TYPES` in `src/lib/constants/gameConfig.ts`
3. Add visual rendering in `src/components/game/Prey.tsx`

### Adding a New Power-Up

1. Add to `PowerUpType` union in `src/lib/types/game.ts`
2. Add configuration to `POWER_UP_CONFIG` in `src/lib/constants/gameConfig.ts`
3. Handle effect logic in `collectPowerUp` action in `src/stores/gameStore.ts`
4. Update visual in `src/components/game/PowerUps.tsx`

### Modifying Game Physics/Balance

All tuning values are in `GAME_CONFIG` (`src/lib/constants/gameConfig.ts`). Key sections:
- `spider` - movement speeds, jump force, catch radius
- `physics` - gravity, friction, zip mechanics
- `web` - duration, energy costs, collision radius
- `combo` - timing window, multiplier cap
- `difficulty` - scaling rates

### Adding Sound Effects

Sounds are procedurally generated using Web Audio API in `src/lib/utils/sound.ts`. Add new sounds to `SOUND_CONFIGS` with frequency, duration, waveform parameters.

## Code Conventions

- **TypeScript:** Strict mode enabled, avoid `any` types
- **Components:** Functional components with hooks
- **Styling:** Tailwind CSS utility classes, global animations in `globals.css`
- **State:** All game state through Zustand store, no local component state for game logic
- **Constants:** No magic numbers - add to `GAME_CONFIG`
- **IDs:** Generate with `generateId()` pattern: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

## Tech Stack

| Package        | Version  | Purpose                         |
|----------------|----------|----------------------------------|
| Next.js        | 16.0.3   | React framework with App Router  |
| React          | 19.0.0   | UI library                       |
| TypeScript     | 5.x      | Type safety                      |
| Zustand        | 5.0.8    | State management                 |
| Framer Motion  | 12.23.24 | Animation library                |
| Tailwind CSS   | 4.0.8    | Utility-first CSS                |
| ESLint         | 9.15.0   | Code linting                     |

## Key Files Quick Reference

| File | Purpose |
|------|---------|
| `src/stores/gameStore.ts` | Central game state and all game logic |
| `src/lib/constants/gameConfig.ts` | All tuning values and configurations |
| `src/lib/types/game.ts` | TypeScript interfaces |
| `src/components/game/GameContainer.tsx` | Main game orchestrator |
| `src/hooks/useGameLoop.ts` | Game loop and input handling |
| `src/lib/utils/sound.ts` | Procedural audio generation |
| `src/lib/utils/particles.ts` | Particle factory functions |
