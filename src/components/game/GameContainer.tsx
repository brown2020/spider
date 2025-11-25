'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useGameLoop, useControls } from '@/hooks/useGameLoop';
import { GAME_CONFIG } from '@/lib/constants/gameConfig';

import Environment from './Environment';
import Spider from './Spider';
import Prey from './Prey';
import Webs from './Webs';
import Particles, { ScorePopups } from './Particles';
import PowerUps from './PowerUps';
import HUD from '../ui/HUD';
import Menu from '../ui/Menu';
import Controls from '../ui/Controls';

export default function GameContainer() {
  // Use Zustand store
  const gameState = useGameStore((state) => state.gameState);
  const webs = useGameStore((state) => state.webs);
  const preyList = useGameStore((state) => state.preyList);
  const particles = useGameStore((state) => state.particles);
  const scorePopups = useGameStore((state) => state.scorePopups);
  const powerUps = useGameStore((state) => state.powerUps);
  const mousePosition = useGameStore((state) => state.mousePosition);
  const dimensions = useGameStore((state) => state.dimensions);
  
  const startGame = useGameStore((state) => state.startGame);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const resetGame = useGameStore((state) => state.resetGame);
  
  // Initialize game loops and controls
  useGameLoop();
  useControls();
  
  // Initialize dimensions on mount
  useEffect(() => {
    useGameStore.getState().setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);
  
  const canShoot = gameState.webEnergy >= GAME_CONFIG.web.energy.shootCost;
  const isPlaying = gameState.gamePhase === 'playing';
  
  return (
    <div 
      className={`fixed inset-0 w-screen h-screen overflow-hidden ${
        gameState.screenShake > 0 ? 'screen-shake' : ''
      }`}
      style={{
        cursor: isPlaying ? (canShoot ? 'crosshair' : 'not-allowed') : 'default',
      }}
    >
      {/* Background layer */}
      <Environment dimensions={dimensions} />
      
      {/* Game elements layer */}
      <div className="absolute inset-0">
        {/* Webs */}
        <Webs webs={webs} />
        
        {/* Power-ups */}
        <PowerUps powerUps={powerUps} />
        
        {/* Prey */}
        <Prey preyList={preyList} />
        
        {/* Particles */}
        <Particles particles={particles} />
        <ScorePopups popups={scorePopups} />
        
        {/* Spider */}
        <Spider gameState={gameState} />
        
        {/* Web aiming line */}
        {isPlaying && canShoot && (
          <AimLine 
            from={gameState.position}
            to={mousePosition}
          />
        )}
      </div>
      
      {/* UI layer */}
      {isPlaying && <HUD gameState={gameState} />}
      {isPlaying && <Controls />}
      
      {/* Menu overlay */}
      <Menu
        gameState={gameState}
        onStart={startGame}
        onResume={resumeGame}
        onRestart={() => {
          resetGame();
          startGame();
        }}
      />
    </div>
  );
}

interface AimLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

function AimLine({ from, to }: AimLineProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  
  // Don't show for very short distances
  if (length < 20) return null;
  
  return (
    <div
      className="absolute aim-line pointer-events-none"
      style={{
        left: from.x,
        top: from.y,
        width: Math.min(length, 300),
        height: 2,
        transformOrigin: 'left center',
        transform: `rotate(${angle}rad)`,
        zIndex: 998,
      }}
    />
  );
}
