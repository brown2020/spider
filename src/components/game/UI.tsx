// components/game/UI.tsx
import React from "react";
import { GameState } from "@/lib/types/game";

interface UIProps {
  gameState: GameState;
}

const UI: React.FC<UIProps> = ({ gameState }) => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Score Display */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 p-2 rounded-sm text-white">
        <div>Score: {gameState.score}</div>
        <div>Web Energy: {gameState.webEnergy}%</div>
      </div>

      {/* Controls Help */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 p-2 rounded-sm text-white text-sm">
        <div>Arrow Keys: Move</div>
        <div>Shift: Run</div>
        <div>Space: Jump</div>
        <div>Mouse: Shoot Web</div>
      </div>

      {/* Direction Indicator */}
      <div
        className="absolute top-1/2 left-1/2 w-4 h-4 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: gameState.isWebShooting ? 0.8 : 0,
        }}
      />
    </div>
  );
};

export default UI;
