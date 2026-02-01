'use client';

import { memo, useMemo } from 'react';
import { GameState, Vector2D } from '@/lib/types/game';
import { GAME_CONFIG, POWER_UP_CONFIG } from '@/lib/constants/gameConfig';
import { useSpriteAnimation } from '@/hooks/useSpriteAnimation';
import { useGameStore } from '@/stores/gameStore';

interface SpiderProps {
  gameState: GameState;
}

// Procedural leg component
interface LegProps {
  index: number;
  side: 'left' | 'right';
  velocity: Vector2D;
  isMoving: boolean;
  time: number;
}

const SpiderLeg = memo(function SpiderLeg({ index, side, velocity, isMoving, time }: LegProps) {
  // Base angles for 4 legs per side (front to back)
  const baseAngles = [25, 60, 120, 155];
  const baseAngle = side === 'left' ? 180 + baseAngles[index] : -baseAngles[index];

  // Movement animation - legs wave based on velocity and time
  const phaseOffset = index * 0.8 + (side === 'left' ? 0 : Math.PI);
  const waveAmount = isMoving ? 15 : 5;
  const waveSpeed = isMoving ? 0.015 : 0.005;
  const wave = Math.sin(time * waveSpeed + phaseOffset) * waveAmount;

  // Leg segments
  const segment1Length = 12;
  const segment2Length = 14;

  const angle1 = baseAngle + wave;
  const angle2 = wave * 0.6; // Second segment bends relative to first

  return (
    <g
      style={{
        transform: `rotate(${angle1}deg)`,
        transformOrigin: 'center',
      }}
    >
      {/* First segment */}
      <line
        x1="0"
        y1="0"
        x2={segment1Length}
        y2="0"
        stroke="rgba(60, 60, 60, 0.9)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Second segment */}
      <g style={{ transform: `translate(${segment1Length}px, 0) rotate(${angle2}deg)` }}>
        <line
          x1="0"
          y1="0"
          x2={segment2Length}
          y2="0"
          stroke="rgba(40, 40, 40, 0.9)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Foot */}
        <circle
          cx={segment2Length}
          cy="0"
          r="1.5"
          fill="rgba(30, 30, 30, 0.8)"
        />
      </g>
    </g>
  );
});

const Spider = memo(function Spider({ gameState }: SpiderProps) {
  const isAnimating = gameState.isCrawling || gameState.isZipping;
  const frameTime = useGameStore((state) => state.frameTime);
  const mousePosition = useGameStore((state) => state.mousePosition);
  const preyList = useGameStore((state) => state.preyList);
  
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

  // Calculate eye direction - track nearest prey or mouse
  const eyeDirection = useMemo(() => {
    let targetX = mousePosition.x;
    let targetY = mousePosition.y;

    // Find nearest prey to track
    if (preyList.length > 0) {
      let nearestDist = Infinity;
      for (const prey of preyList) {
        const dist = Math.hypot(
          prey.position.x - gameState.position.x,
          prey.position.y - gameState.position.y
        );
        if (dist < nearestDist && dist < 200) {
          nearestDist = dist;
          targetX = prey.position.x;
          targetY = prey.position.y;
        }
      }
    }

    const dx = targetX - gameState.position.x;
    const dy = targetY - gameState.position.y;
    const angle = Math.atan2(dy, dx);
    const maxOffset = 2;

    return {
      x: Math.cos(angle) * maxOffset,
      y: Math.sin(angle) * maxOffset,
    };
  }, [mousePosition.x, mousePosition.y, preyList, gameState.position.x, gameState.position.y]);

  // Check for active power-ups for aura effects
  const activePowerUpTypes = useMemo(() => {
    return gameState.activePowerUps.map(p => p.type);
  }, [gameState.activePowerUps]);

  const isMoving = gameState.isCrawling || gameState.isZipping || Math.abs(gameState.velocity.x) > 1 || Math.abs(gameState.velocity.y) > 1;

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
              velocity={gameState.velocity}
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
              velocity={gameState.velocity}
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

export default Spider;
