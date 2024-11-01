# Spider Game 🕷️

A web-based spider platformer game built with Next.js 15, React, and TypeScript. Control a spider as it moves around the screen, catches prey, and navigates a starlit environment.

🎮 **[Play Now](https://spiderdemo.vercel.app/)**

## Features

- Smooth spider movement with pixel-perfect sprite animations
- Physics-based jumping and movement mechanics
- Dynamic prey spawning and catching system
- Responsive design that adapts to window size
- Particle effects and ambient star animations
- Score tracking and web energy system
- Starlit background with dynamic animations

## 🎮 Controls

- **Arrow Keys**: Move the spider
- **Spacebar**: Jump
- **Shift + Arrow Keys**: Run faster
- **ESC**: Pause game

## 🛠️ Technologies Used

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- React Hooks for game logic
- CSS Animations

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/brown2020/spider.git
cd spider
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── app/
│   └── page.tsx            # Main game page
├── components/
│   ├── game/
│   │   ├── Spider.tsx      # Spider character component
│   │   ├── GameContainer.tsx # Main game logic container
│   │   ├── Environment.tsx # Background and effects
│   │   └── Prey.tsx       # Prey spawning and behavior
│   └── ui/
│       ├── Menu.tsx       # Pause menu
│       ├── Controls.tsx   # Controls overlay
│       └── ScoreDisplay.tsx # Score and energy UI
├── lib/
│   ├── constants/
│   │   ├── gameConfig.ts  # Game configuration
│   │   └── sprites.ts     # Sprite animations config
│   ├── hooks/
│   │   ├── useGameLoop.ts # Game loop logic
│   │   ├── useCollision.ts # Collision detection
│   │   └── useControls.ts # Input handling
│   ├── types/
│   │   └── game.ts       # TypeScript definitions
│   └── utils/
│       ├── physics.ts    # Physics calculations
│       ├── animation.ts  # Animation utilities
│       └── sound.ts      # Sound management
└── styles/
    └── game.css          # Game-specific styles
```

## 🗺️ Roadmap

- [ ] Add web shooting mechanics
- [ ] Implement touch controls for mobile
- [ ] Add sound effects and background music
- [ ] Create level system
- [ ] Add more prey types
- [ ] Implement multiplayer support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 📧 Contact

info@ignitechannel.com

Project Link: [https://github.com/brown2020/spider](https://github.com/brown2020/spider)  
Live Demo: [https://spiderdemo.vercel.app/](https://spiderdemo.vercel.app/)
