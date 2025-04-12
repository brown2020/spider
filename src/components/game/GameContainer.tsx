// components/game/GameContainer.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { GameState, Web } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";
import Spider from "./Spider";
import Environment from "./Environment";

import Prey from "./Prey";
import Menu from "../ui/Menu";
import Controls from "../ui/Controls";
import ScoreDisplay from "../ui/ScoreDisplay";

// Helper function to generate unique IDs
const generateUniqueId = (): string => {
  return (
    Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9)
  );
};

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
  const [webs, setWebs] = useState<Web[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const lastWebUpdateTime = useRef<number>(0);

  // Force clean web state at startup
  useEffect(() => {
    // Initialize with empty webs array
    setWebs([]);
  }, []);

  const setGameStateCallback = useCallback<
    React.Dispatch<React.SetStateAction<GameState>>
  >((newState) => {
    setGameState(newState);
  }, []);

  // Track mouse position
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  // Handle mouse click for web shooting
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (isPaused) return;

      setGameState((prev) => {
        // Only shoot if we have enough energy
        if (prev.webEnergy < GAME_CONFIG.web.energy.shootCost) return prev;

        const newWeb: Web = {
          id: generateUniqueId(),
          startPos: { x: prev.position.x, y: prev.position.y },
          endPos: { x: e.clientX, y: e.clientY },
          lifetime: GAME_CONFIG.web.duration,
          createdAt: Date.now(),
        };

        // Add the new web to the webs array
        setWebs((prevWebs) => [...prevWebs]);

        // Use setTimeout to ensure the state update happens
        setTimeout(() => {
          setWebs((prevWebs) => [...prevWebs, newWeb]);
        }, 0);

        return {
          ...prev,
          isWebShooting: true,
          webEnergy: prev.webEnergy - GAME_CONFIG.web.energy.shootCost,
        };
      });
    },
    [isPaused]
  );

  const handleMouseUp = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isWebShooting: false,
    }));
  }, []);

  // Set up mouse controls
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseDown, handleMouseUp]);

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

      // Only update webs every 100ms to prevent too frequent updates
      const now = Date.now();
      if (now - lastWebUpdateTime.current > 100) {
        lastWebUpdateTime.current = now;

        // Update webs - remove expired webs
        setWebs((prevWebs) => {
          // If no webs, just return empty array
          if (!prevWebs || prevWebs.length === 0) return [];

          // Filter out expired webs
          const activeWebs = prevWebs.filter((web) => {
            const timeRemaining = web.lifetime - (now - web.createdAt);
            return timeRemaining > 0;
          });

          return activeWebs;
        });
      }
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

  // Clean up old webs periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setWebs((prevWebs) => {
        // If no webs, just return empty array
        if (!prevWebs || prevWebs.length === 0) return [];

        // Filter out expired webs
        return prevWebs.filter((web) => {
          const timeRemaining = web.lifetime - (now - web.createdAt);
          return timeRemaining > 0;
        });
      });
    }, 1000); // Check every second

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
      <Environment
        dimensions={{
          width: window.innerWidth,
          height: window.innerHeight,
        }}
      />

      {/* Render webs */}
      {webs.length > 0 &&
        webs.map((web) => {
          const now = Date.now();
          const timeElapsed = now - web.createdAt;
          const timeRemaining = web.lifetime - timeElapsed;

          // Skip rendering if web is expired
          if (timeRemaining <= 0) return null;

          const opacity = Math.max(0.2, 1 - timeElapsed / web.lifetime);

          return (
            <div
              key={web.id}
              className="absolute bg-white"
              style={{
                left: web.startPos.x,
                top: web.startPos.y,
                width: Math.hypot(
                  web.endPos.x - web.startPos.x,
                  web.endPos.y - web.startPos.y
                ),
                height: GAME_CONFIG.web.thickness,
                transformOrigin: "left center",
                transform: `rotate(${Math.atan2(
                  web.endPos.y - web.startPos.y,
                  web.endPos.x - web.startPos.x
                )}rad)`,
                opacity: opacity,
                zIndex: 1000,
              }}
            />
          );
        })}

      <Spider gameState={gameState} />
      <Prey
        gameState={gameState}
        setGameState={setGameStateCallback}
        webs={webs}
      />
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

      {showDebug && (
        <div className="fixed top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-sm z-50">
          <div>Position: {JSON.stringify(gameState.position)}</div>
          <div>Velocity: {JSON.stringify(gameState.velocity)}</div>
          <div>Direction: {gameState.direction}</div>
          <div>Jumping: {gameState.isJumping.toString()}</div>
          <div>Crawling: {gameState.isCrawling.toString()}</div>
          <div>Web Energy: {Math.floor(gameState.webEnergy)}%</div>
          <div>Active Webs: {webs.length}</div>
        </div>
      )}
    </div>
  );
};

export default GameContainer;
