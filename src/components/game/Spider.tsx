'use client';

import { memo, useMemo } from 'react';
import { GameState } from '@/lib/types/game';
import { GAME_CONFIG } from '@/lib/constants/gameConfig';
import { useSpriteAnimation } from '@/hooks/useSpriteAnimation';

interface SpiderProps {
  gameState: GameState;
}

const Spider = memo(function Spider({ gameState }: SpiderProps) {
  const isAnimating = gameState.isCrawling || gameState.isZipping;
  
  const currentFrame = useSpriteAnimation(
    GAME_CONFIG.spider.animationFrames,
    GAME_CONFIG.spider.animationSpeed,
    isAnimating
  );

  const backgroundPosition = useMemo(() => {
    const frameWidth = GAME_CONFIG.spider.spriteSize;
    const frameHeight = GAME_CONFIG.spider.spriteSize;
    const xOffset = currentFrame * frameWidth;
    const yOffset = {
      down: 0,
      left: frameHeight,
      right: 2 * frameHeight,
      up: 3 * frameHeight,
    }[gameState.direction];
    
    return `-${xOffset}px -${yOffset}px`;
  }, [currentFrame, gameState.direction]);

  const rotation = useMemo(() => {
    if (!gameState.isJumping && !gameState.isZipping) return 0;
    
    // Dynamic rotation based on velocity
    const rotationFromVelocity = gameState.velocity.x * 2;
    const maxRotation = 25;
    return Math.max(-maxRotation, Math.min(maxRotation, rotationFromVelocity));
  }, [gameState.isJumping, gameState.isZipping, gameState.velocity.x]);

  const scale = useMemo(() => {
    let baseScale = GAME_CONFIG.spider.scale;
    
    // Squash and stretch during jump
    if (gameState.isJumping) {
      const stretchFactor = 1 + Math.abs(gameState.velocity.y) * 0.01;
      const squashFactor = 1 - Math.abs(gameState.velocity.y) * 0.005;
      return {
        x: baseScale * squashFactor,
        y: baseScale * stretchFactor,
      };
    }
    
    // Zip stretch
    if (gameState.isZipping) {
      const speed = Math.hypot(gameState.velocity.x, gameState.velocity.y);
      const stretchFactor = 1 + speed * 0.02;
      return {
        x: baseScale * stretchFactor,
        y: baseScale * (1 / stretchFactor),
      };
    }
    
    return { x: baseScale, y: baseScale };
  }, [gameState.isJumping, gameState.isZipping, gameState.velocity]);

  // Calculate shadow properties
  const shadowOpacity = useMemo(() => {
    const groundY = typeof window !== 'undefined' 
      ? window.innerHeight - GAME_CONFIG.physics.groundHeight 
      : 500;
    const distanceFromGround = groundY - gameState.position.y;
    const maxDistance = 300;
    return Math.max(0.05, 0.25 * (1 - distanceFromGround / maxDistance));
  }, [gameState.position.y]);

  const shadowScale = useMemo(() => {
    const groundY = typeof window !== 'undefined' 
      ? window.innerHeight - GAME_CONFIG.physics.groundHeight 
      : 500;
    const distanceFromGround = groundY - gameState.position.y;
    const maxDistance = 300;
    return Math.max(0.4, 1 - (distanceFromGround / maxDistance) * 0.6);
  }, [gameState.position.y]);

  const spriteSize = GAME_CONFIG.spider.spriteSize;

  return (
    <>
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

export default Spider;
