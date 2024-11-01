// components/game/Prey.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GameState, Prey as PreyType } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";

interface PreyProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const Prey: React.FC<PreyProps> = ({ gameState, setGameState }) => {
  const [preyList, setPreyList] = useState<PreyType[]>([]);

  // Handle prey collision with spider
  const handlePreyCollision = useCallback(
    (prey: PreyType) => {
      setGameState((prevState: GameState) => ({
        ...prevState,
        score: prevState.score + GAME_CONFIG.prey.value,
      }));

      setPreyList((prevList) => prevList.filter((p) => p.id !== prey.id));
    },
    [setGameState]
  );

  // Spawn new prey periodically
  useEffect(() => {
    const spawnPrey = () => {
      if (typeof window === "undefined") return;

      const newPrey: PreyType = {
        id: Date.now().toString(),
        position: {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        },
        velocity: {
          x: (Math.random() - 0.5) * GAME_CONFIG.prey.speed,
          y: (Math.random() - 0.5) * GAME_CONFIG.prey.speed,
        },
        isTrapped: false,
      };
      setPreyList((prev) => [...prev, newPrey]);
    };

    const interval = setInterval(spawnPrey, GAME_CONFIG.prey.spawnRate);
    return () => clearInterval(interval);
  }, []);

  // Update prey positions
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updatePrey = () => {
      setPreyList((prev) =>
        prev.map((prey) => {
          if (prey.isTrapped) return prey;

          // Calculate new position
          const newPos = {
            x: prey.position.x + prey.velocity.x,
            y: prey.position.y + prey.velocity.y,
          };

          // Bounce off walls
          let newVelX = prey.velocity.x;
          let newVelY = prey.velocity.y;

          if (newPos.x < 0 || newPos.x > window.innerWidth) {
            newVelX *= -1;
            newPos.x = Math.max(0, Math.min(newPos.x, window.innerWidth));
          }
          if (newPos.y < 0 || newPos.y > window.innerHeight) {
            newVelY *= -1;
            newPos.y = Math.max(0, Math.min(newPos.y, window.innerHeight));
          }

          // Check collision with spider
          const distance = Math.hypot(
            newPos.x - gameState.position.x,
            newPos.y - gameState.position.y
          );

          if (
            distance <
            GAME_CONFIG.spider.spriteSize * GAME_CONFIG.spider.scale
          ) {
            setTimeout(() => handlePreyCollision(prey), 0);
            return { ...prey, isTrapped: true };
          }

          return {
            ...prey,
            position: newPos,
            velocity: { x: newVelX, y: newVelY },
          };
        })
      );
    };

    const interval = setInterval(updatePrey, 16);
    return () => clearInterval(interval);
  }, [gameState.position, handlePreyCollision]);

  return (
    <>
      {preyList.map((prey) => (
        <div
          key={prey.id}
          className={`absolute transition-all duration-100 ${
            prey.isTrapped ? "scale-0 opacity-0" : "scale-100 opacity-100"
          }`}
          style={{
            left: prey.position.x,
            top: prey.position.y,
            transform: "translate(-50%, -50%)",
            width: `${GAME_CONFIG.prey.size}px`,
            height: `${GAME_CONFIG.prey.size}px`,
          }}
        >
          <div
            className="w-full h-full bg-white rounded-full animate-pulse"
            style={{
              boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
            }}
          />
        </div>
      ))}
    </>
  );
};

export default Prey;
