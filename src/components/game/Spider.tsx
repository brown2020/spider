// components/game/Spider.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { GameState } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";
import { AnimationController } from "@/lib/utils/animation";

interface SpiderProps {
  gameState: GameState;
}

const Spider: React.FC<SpiderProps> = ({ gameState }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationController = useRef<AnimationController>(
    new AnimationController(
      GAME_CONFIG.spider.animationFrames,
      GAME_CONFIG.spider.animationSpeed
    )
  );
  const frameInterval = useRef<number>(0);

  useEffect(() => {
    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      if (gameState.isCrawling) {
        if (lastTimestamp === 0) lastTimestamp = timestamp;
        const frame = animationController.current.update(timestamp);
        setCurrentFrame(frame);
      } else {
        animationController.current.reset();
        setCurrentFrame(0);
      }

      frameInterval.current = requestAnimationFrame(animate);
    };

    frameInterval.current = requestAnimationFrame(animate);

    return () => {
      if (frameInterval.current) {
        cancelAnimationFrame(frameInterval.current);
      }
    };
  }, [gameState.isCrawling]);

  const getBackgroundPosition = () => {
    const frameWidth = GAME_CONFIG.spider.spriteSize;
    const frameHeight = GAME_CONFIG.spider.spriteSize;

    // X offset based on current animation frame
    const xOffset = currentFrame * frameWidth;

    // Y offset based on direction
    const yOffset = {
      down: 0,
      left: frameHeight,
      right: 2 * frameHeight,
      up: 3 * frameHeight,
    }[gameState.direction];

    return `-${xOffset}px -${yOffset}px`;
  };

  const getRotation = () => {
    if (!gameState.isJumping) return 0;

    // Add rotation based on horizontal velocity
    const rotationFromVelocity = gameState.velocity.x * 2;
    return rotationFromVelocity;
  };

  return (
    <>
      <div
        className="absolute spider"
        style={{
          top: `${gameState.position.y}px`,
          left: `${gameState.position.x}px`,
          width: `${GAME_CONFIG.spider.spriteSize}px`,
          height: `${GAME_CONFIG.spider.spriteSize}px`,
          backgroundImage: "url('/spider-sprite.png')",
          backgroundPosition: getBackgroundPosition(),
          transform: `
            translate(-50%, -50%) 
            scale(${GAME_CONFIG.spider.scale})
            rotate(${getRotation()}deg)
          `,
          filter: "brightness(6) contrast(2)",
          transition: "rotate 0.2s ease-out",
          zIndex: 1001,
        }}
      />

      {/* Shadow */}
      <div
        className="absolute rounded-full bg-black opacity-20"
        style={{
          bottom: `${GAME_CONFIG.physics.groundHeight - 5}px`,
          left: `${gameState.position.x}px`,
          width: `${
            GAME_CONFIG.spider.spriteSize * GAME_CONFIG.spider.scale * 0.8
          }px`,
          height: `${
            GAME_CONFIG.spider.spriteSize * GAME_CONFIG.spider.scale * 0.2
          }px`,
          transform: "translate(-50%, 0)",
          filter: "blur(2px)",
          zIndex: 1000,
        }}
      />
    </>
  );
};

export default Spider;
