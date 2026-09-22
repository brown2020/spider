"use client";

import { memo } from "react";
import { GameState } from "@/lib/types/game";
import { MenuTitle, MenuActions, MenuFooter } from "./MenuPhaseContent";

interface MenuPanelsProps {
  gameState: GameState;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}

export const MenuPanels = memo(function MenuPanels({
  gameState,
  onStart,
  onResume,
  onRestart,
}: MenuPanelsProps) {
  const { gamePhase, score, highScore } = gameState;

  return (
    <div
      className="relative z-20 max-w-md w-full mx-4"
      style={{ animation: "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <div
        className="rounded-2xl p-8 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(15, 25, 45, 0.9) 0%, rgba(10, 18, 35, 0.95) 100%)",
          border: "1px solid rgba(100, 140, 200, 0.15)",
          boxShadow:
            "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(100, 140, 200, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        <MenuTitle
          gamePhase={gamePhase}
          score={score}
          highScore={highScore}
        />
        <MenuActions
          gamePhase={gamePhase}
          onStart={onStart}
          onResume={onResume}
          onRestart={onRestart}
        />
        <MenuFooter gamePhase={gamePhase} highScore={highScore} />
      </div>
    </div>
  );
});
