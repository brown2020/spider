'use client';

import { memo } from "react";
import { GameState, PowerUpType } from "@/lib/types/game";
import { GAME_CONFIG, POWER_UP_CONFIG } from "@/lib/constants/gameConfig";
import { SpiderLeg } from "./SpiderLeg";

interface SpiderVisualProps {
  gameState: GameState;
  backgroundPosition: string;
  rotation: number;
  scale: { x: number; y: number };
  shadowOpacity: number;
  shadowScale: number;
  eyeDirection: { x: number; y: number };
  activePowerUpTypes: PowerUpType[];
  isMoving: boolean;
  frameTime: number;
  spriteSize: number;
}

export const SpiderVisual = memo(function SpiderVisual({
  gameState,
  backgroundPosition,
  rotation,
  scale,
  shadowOpacity,
  shadowScale,
  eyeDirection,
  activePowerUpTypes,
  isMoving,
  frameTime,
  spriteSize,
}: SpiderVisualProps) {
  return (
    <>
      {/* Power-up auras */}
      {activePowerUpTypes.map((type, i) => {
        const config = POWER_UP_CONFIG[type];
        return (
          <div
            key={type}
            className="absolute rounded-full pointer-events-none power-up-aura"
            style={{
              left: gameState.position.x,
              top: gameState.position.y,
              width: spriteSize * GAME_CONFIG.spider.scale * (1.8 + i * 0.3),
              height: spriteSize * GAME_CONFIG.spider.scale * (1.8 + i * 0.3),
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${config.color}40 0%, ${config.color}20 50%, transparent 70%)`,
              border: `2px solid ${config.color}60`,
              animationDelay: `${i * 0.2}s`,
              zIndex: 999,
            }}
          />
        );
      })}

      {/* Glow effect when zipping */}
      {gameState.isZipping && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: gameState.position.x,
            top: gameState.position.y,
            width: spriteSize * GAME_CONFIG.spider.scale * 1.5,
            height: spriteSize * GAME_CONFIG.spider.scale * 1.5,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(100, 200, 255, 0.4) 0%, transparent 70%)',
            filter: 'blur(8px)',
            zIndex: 1000,
          }}
        />
      )}
      
      {/* Procedural spider legs */}
      <svg
        className="absolute pointer-events-none"
        style={{
          left: gameState.position.x,
          top: gameState.position.y,
          width: 80,
          height: 80,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          zIndex: 1000,
          overflow: 'visible',
        }}
        viewBox="-40 -40 80 80"
      >
        <g transform="translate(0, 0)">
          {/* Left legs */}
          {[0, 1, 2, 3].map((i) => (
            <SpiderLeg
              key={`left-${i}`}
              index={i}
              side="left"

              isMoving={isMoving}
              time={frameTime}
            />
          ))}
          {/* Right legs */}
          {[0, 1, 2, 3].map((i) => (
            <SpiderLeg
              key={`right-${i}`}
              index={i}
              side="right"

              isMoving={isMoving}
              time={frameTime}
            />
          ))}
        </g>
      </svg>

      {/* Main spider sprite */}
      <div
        className="absolute spider"
        style={{
          left: gameState.position.x,
          top: gameState.position.y,
          width: spriteSize,
          height: spriteSize,
          backgroundImage: "url('/spider-sprite.png')",
          backgroundPosition,
          transform: `
            translate(-50%, -50%)
            scaleX(${scale.x})
            scaleY(${scale.y})
            rotate(${rotation}deg)
          `,
          filter: `brightness(6) contrast(2) ${gameState.isZipping ? 'drop-shadow(0 0 8px rgba(100, 200, 255, 0.8))' : ''}`,
          zIndex: 1001,
        }}
      />

      {/* Spider eyes that track prey/mouse */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: gameState.position.x,
          top: gameState.position.y - 4,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          zIndex: 1002,
        }}
      >
        {/* Left eye */}
        <div
          className="absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            left: -5,
            top: -2,
            backgroundColor: 'rgba(20, 20, 20, 0.9)',
            boxShadow: 'inset 0 0 2px rgba(255, 255, 255, 0.3)',
          }}
        >
          <div
            className="absolute rounded-full bg-red-500"
            style={{
              width: 3,
              height: 3,
              left: 1.5 + eyeDirection.x * 0.5,
              top: 1.5 + eyeDirection.y * 0.5,
              boxShadow: '0 0 4px rgba(255, 0, 0, 0.8)',
            }}
          />
        </div>
        {/* Right eye */}
        <div
          className="absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            left: 1,
            top: -2,
            backgroundColor: 'rgba(20, 20, 20, 0.9)',
            boxShadow: 'inset 0 0 2px rgba(255, 255, 255, 0.3)',
          }}
        >
          <div
            className="absolute rounded-full bg-red-500"
            style={{
              width: 3,
              height: 3,
              left: 1.5 + eyeDirection.x * 0.5,
              top: 1.5 + eyeDirection.y * 0.5,
              boxShadow: '0 0 4px rgba(255, 0, 0, 0.8)',
            }}
          />
        </div>
      </div>

      {/* Shadow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: gameState.position.x,
          bottom: GAME_CONFIG.physics.groundHeight - 8,
          width: spriteSize * GAME_CONFIG.spider.scale * 0.8 * shadowScale,
          height: spriteSize * GAME_CONFIG.spider.scale * 0.2 * shadowScale,
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.5) 0%, transparent 70%)',
          opacity: shadowOpacity,
          filter: 'blur(4px)',
          zIndex: 999,
        }}
      />

      {/* Motion blur trail when moving fast */}
      {(gameState.isZipping || Math.abs(gameState.velocity.x) > 10) && (
        <>
          {[0.3, 0.5, 0.7].map((offset, i) => (
            <div
              key={i}
              className="absolute spider"
              style={{
                left: gameState.position.x - gameState.velocity.x * offset,
                top: gameState.position.y - gameState.velocity.y * offset,
                width: spriteSize,
                height: spriteSize,
                backgroundImage: "url('/spider-sprite.png')",
                backgroundPosition,
                transform: `
                  translate(-50%, -50%) 
                  scaleX(${scale.x * (1 - offset * 0.3)})
                  scaleY(${scale.y * (1 - offset * 0.3)})
                  rotate(${rotation}deg)
                `,
                filter: 'brightness(6) contrast(2)',
                opacity: 0.2 - offset * 0.15,
                zIndex: 1000 - i,
              }}
            />
          ))}
        </>
      )}
    </>
  );

});
