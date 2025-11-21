// components/game/GameContainer.tsx
"use client";

import React, { useState } from "react";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";
import Spider from "./Spider";
import Environment from "./Environment";
import Prey from "./Prey";
import Menu from "../ui/Menu";
import Controls from "../ui/Controls";
import ScoreDisplay from "../ui/ScoreDisplay";
import Webs from "./Webs";
import Particles from "./Particles";
import DebugInfo from "./DebugInfo";
import { useGame } from "@/hooks/useGame";
import { useControls } from "@/hooks/useControls";

const GameContainer: React.FC = () => {
  const {
    gameState,
    setGameState,
    isPaused,
    setIsPaused,
    webs,
    setWebs,
    preyList,
    zipTo,
  } = useGame();

  const { mousePosition } = useControls({
    gameState,
    setGameState,
    setWebs,
    isPaused,
    setIsPaused,
    zipTo,
  });

  const [showDebug] = useState(true);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
      <Environment
        dimensions={{
          width: typeof window !== "undefined" ? window.innerWidth : 1000,
          height: typeof window !== "undefined" ? window.innerHeight : 500,
        }}
      />

      {/* Render webs */}
      <Webs webs={webs} />

      <Particles gameState={gameState} />
      <Spider gameState={gameState} />
      <Prey preyList={preyList} />
      <ScoreDisplay score={gameState.score} webEnergy={gameState.webEnergy} />
      <Controls />

      {/* Web aiming line when mouse is moved */}
      {!isPaused && gameState.webEnergy >= GAME_CONFIG.web.energy.shootCost && (
        <div
          className="absolute bg-white opacity-30"
          style={{
            left: gameState.position.x,
            top: gameState.position.y,
            width: Math.hypot(
              mousePosition.x - gameState.position.x,
              mousePosition.y - gameState.position.y
            ),
            height: 1,
            transformOrigin: "left center",
            transform: `rotate(${Math.atan2(
              mousePosition.y - gameState.position.y,
              mousePosition.x - gameState.position.x
            )}rad)`,
            zIndex: 999,
          }}
        />
      )}

      {isPaused && <Menu onResume={() => setIsPaused(false)} />}

      {/* Use the memoized debug info component */}
      {showDebug && <DebugInfo gameState={gameState} websCount={webs.length} />}
    </div>
  );
};

export default GameContainer;
