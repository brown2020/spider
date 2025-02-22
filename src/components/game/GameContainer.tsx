// components/game/GameContainer.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GameState } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";
import Spider from "./Spider";
import Environment from "./Environment";

import Prey from "./Prey";
import Menu from "../ui/Menu";
import Controls from "../ui/Controls";
import ScoreDisplay from "../ui/ScoreDisplay";

const getInitialState = (): GameState => ({
  position: {
    x: (typeof window !== "undefined" ? window.innerWidth : 1000) / 2,
    y: (typeof window !== "undefined" ? window.innerHeight : 500) / 2,
  },
  velocity: { x: 0, y: 0 },
  direction: "right",
  isJumping: false,
  isRunning: false,
  isCrawling: false,
  isWebShooting: false,
  score: 0,
  webEnergy: GAME_CONFIG.web.energy.max,
});

const GameContainer: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialState());
  const [isPaused, setIsPaused] = useState(false);
  const [showDebug] = useState(true);

  const setGameStateCallback = useCallback<
    React.Dispatch<React.SetStateAction<GameState>>
  >((newState) => {
    setGameState(newState);
  }, []);

  // Handle keyboard controls
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isPaused) return;

      const speed = event.shiftKey
        ? GAME_CONFIG.spider.runSpeed
        : GAME_CONFIG.spider.baseSpeed;

      setGameState((prev) => {
        const newState = { ...prev };

        switch (event.key) {
          case "ArrowUp":
            newState.velocity.y = -speed;
            newState.direction = "up";
            newState.isCrawling = true;
            break;
          case "ArrowDown":
            newState.velocity.y = speed;
            newState.direction = "down";
            newState.isCrawling = true;
            break;
          case "ArrowLeft":
            newState.velocity.x = -speed;
            newState.direction = "left";
            newState.isCrawling = true;
            break;
          case "ArrowRight":
            newState.velocity.x = speed;
            newState.direction = "right";
            newState.isCrawling = true;
            break;
          case " ": // Spacebar
            if (!newState.isJumping) {
              newState.velocity.y = -GAME_CONFIG.spider.jumpForce;
              newState.isJumping = true;
            }
            break;
          case "Escape":
            setIsPaused((p) => !p);
            break;
        }

        return newState;
      });
    },
    [isPaused]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (isPaused) return;

      setGameState((prev) => {
        const newState = { ...prev };

        switch (event.key) {
          case "ArrowUp":
          case "ArrowDown":
            newState.velocity.y = 0;
            break;
          case "ArrowLeft":
          case "ArrowRight":
            newState.velocity.x = 0;
            break;
        }

        if (!Object.values(newState.velocity).some((v) => v !== 0)) {
          newState.isCrawling = false;
        }

        return newState;
      });
    },
    [isPaused]
  );

  // Set up keyboard controls
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Game loop
  useEffect(() => {
    if (isPaused) return;

    const gameLoop = setInterval(() => {
      setGameState((prev) => {
        const newState = { ...prev };

        // Update position based on velocity
        newState.position.x += newState.velocity.x;
        newState.position.y += newState.velocity.y;

        // Apply gravity if jumping
        if (
          newState.isJumping ||
          newState.position.y <
            window.innerHeight - GAME_CONFIG.physics.groundHeight
        ) {
          newState.velocity.y += GAME_CONFIG.physics.gravity;

          // Apply terminal velocity
          newState.velocity.y = Math.min(
            newState.velocity.y,
            GAME_CONFIG.physics.maxFallSpeed
          );
        }

        // Constrain to window bounds
        const spiderRadius =
          (GAME_CONFIG.spider.spriteSize * GAME_CONFIG.spider.scale) / 2;

        newState.position.x = Math.max(
          spiderRadius,
          Math.min(newState.position.x, window.innerWidth - spiderRadius)
        );

        newState.position.y = Math.max(
          spiderRadius,
          Math.min(
            newState.position.y,
            window.innerHeight - GAME_CONFIG.physics.groundHeight
          )
        );

        // Ground collision
        if (
          newState.position.y >=
          window.innerHeight - GAME_CONFIG.physics.groundHeight
        ) {
          newState.position.y =
            window.innerHeight - GAME_CONFIG.physics.groundHeight;
          newState.velocity.y = 0;
          newState.isJumping = false;
        }

        // Regenerate web energy
        if (newState.webEnergy < GAME_CONFIG.web.energy.max) {
          newState.webEnergy = Math.min(
            newState.webEnergy + GAME_CONFIG.web.energy.regenRate,
            GAME_CONFIG.web.energy.max
          );
        }

        return newState;
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [isPaused]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      // Keep spider in bounds when window is resized
      setGameState((prev) => ({
        ...prev,
        position: {
          x: Math.min(prev.position.x, window.innerWidth),
          y: Math.min(prev.position.y, window.innerHeight),
        },
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
      <Environment
        dimensions={{
          width: window.innerWidth,
          height: window.innerHeight,
        }}
      />
      <Spider gameState={gameState} />
      <Prey gameState={gameState} setGameState={setGameStateCallback} />
      <ScoreDisplay score={gameState.score} webEnergy={gameState.webEnergy} />
      <Controls />

      {isPaused && <Menu onResume={() => setIsPaused(false)} />}

      {showDebug && (
        <div className="fixed top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-sm z-50">
          <div>Position: {JSON.stringify(gameState.position)}</div>
          <div>Velocity: {JSON.stringify(gameState.velocity)}</div>
          <div>Direction: {gameState.direction}</div>
          <div>Jumping: {gameState.isJumping.toString()}</div>
          <div>Crawling: {gameState.isCrawling.toString()}</div>
        </div>
      )}
    </div>
  );
};

export default GameContainer;
