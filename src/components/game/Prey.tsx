"use client";

import { memo, useMemo } from "react";
import { Prey as PreyType, Vector2D } from "@/lib/types/game";
import { PREY_TYPES, GAME_CONFIG } from "@/lib/constants/gameConfig";
import { useGameStore } from "@/stores/gameStore";

interface PreyProps {
  preyList: PreyType[];
}

// Individual prey item component - memoized for performance
interface PreyItemProps {
  prey: PreyType;
  spiderPosition: Vector2D;
}

const PreyItem = memo(function PreyItem({ prey, spiderPosition }: PreyItemProps) {
  const config = PREY_TYPES[prey.type];
  const isTrapped = prey.isTrapped;
  const wingPhase = prey.wingPhase;
  const wingScale = 0.8 + Math.sin(wingPhase) * 0.2;

  // Calculate distance to spider for anticipation glow
  const distanceToSpider = useMemo(() => {
    return Math.hypot(
      prey.position.x - spiderPosition.x,
      prey.position.y - spiderPosition.y
    );
  }, [prey.position.x, prey.position.y, spiderPosition.x, spiderPosition.y]);

  // Anticipation glow intensity (stronger when spider is closer)
  const anticipationRadius = GAME_CONFIG.effects.catchAnticipationRadius;
  const isInAnticipationRange = distanceToSpider < anticipationRadius && !isTrapped;
  const anticipationIntensity = isInAnticipationRange
    ? 1 - distanceToSpider / anticipationRadius
    : 0;

  return (
    <div
      className={`absolute ${isTrapped ? "trapped-struggle" : ""} ${
        isInAnticipationRange ? "prey-anticipation" : ""
      }`}
      style={{
        left: prey.position.x,
        top: prey.position.y,
        transform: "translate(-50%, -50%)",
        zIndex: 800,
      }}
    >
      {/* Anticipation glow - pulses when spider is near */}
      {isInAnticipationRange && (
        <div
          className="absolute rounded-full animate-pulse"
          style={{
            width: config.size * 3.5,
            height: config.size * 3.5,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, rgba(255, 255, 100, ${anticipationIntensity * 0.6}) 0%, transparent 70%)`,
            filter: "blur(6px)",
            animation: `pulse ${0.3 + (1 - anticipationIntensity) * 0.4}s ease-in-out infinite`,
          }}
        />
      )}

      {/* Regular glow effect */}
      <div
        className="absolute rounded-full"
        style={{
          width: config.size * 2.5,
          height: config.size * 2.5,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
          opacity: isTrapped ? 0.3 : isInAnticipationRange ? 0.8 : 0.6,
          filter: "blur(4px)",
        }}
      />

      {/* Main body */}
      {prey.type === "moth" && (
        <MothSprite
          config={config}
          wingScale={wingScale}
          isTrapped={isTrapped}
          angle={prey.angle}
        />
      )}

      {prey.type === "firefly" && (
        <FireflySprite
          config={config}
          isTrapped={isTrapped}
          wingPhase={wingPhase}
        />
      )}

      {prey.type === "beetle" && (
        <BeetleSprite
          config={config}
          isTrapped={isTrapped}
          angle={prey.angle}
        />
      )}

      {prey.type === "dragonfly" && (
        <DragonflySprite
          config={config}
          wingScale={wingScale}
          isTrapped={isTrapped}
        />
      )}

      {prey.type === "butterfly" && (
        <ButterflySprite
          config={config}
          wingScale={wingScale}
          isTrapped={isTrapped}
          angle={prey.angle}
        />
      )}

      {prey.type === "goldenMoth" && (
        <GoldenMothSprite
          config={config}
          wingScale={wingScale}
          isTrapped={isTrapped}
          angle={prey.angle}
          wingPhase={wingPhase}
        />
      )}
    </div>
  );
});

const PreyComponent = memo(function PreyComponent({ preyList }: PreyProps) {
  const spiderPosition = useGameStore((state) => state.gameState.position);

  return (
    <>
      {preyList.map((prey) => (
        <PreyItem key={prey.id} prey={prey} spiderPosition={spiderPosition} />
      ))}
    </>
  );
});

// Individual prey sprites
interface SpriteProps {
  config: typeof PREY_TYPES.moth;
  isTrapped: boolean;
  wingScale?: number;
  wingPhase?: number;
  angle?: number;
}

function MothSprite({
  config,
  wingScale = 1,
  isTrapped,
  angle = 0,
}: SpriteProps) {
  return (
    <div
      className="relative"
      style={{
        transform: `rotate(${angle * 2}deg)`,
        opacity: isTrapped ? 0.7 : 1,
      }}
    >
      {/* Wings */}
      <div
        className="absolute"
        style={{
          width: config.size * 1.8,
          height: config.size * 0.8,
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scaleY(${wingScale})`,
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${config.color}88 20%, 
            ${config.color} 50%, 
            ${config.color}88 80%, 
            transparent 100%
          )`,
          borderRadius: "50%",
          filter: "blur(1px)",
        }}
      />
      {/* Body */}
      <div
        className="absolute rounded-full"
        style={{
          width: config.size * 0.4,
          height: config.size * 0.8,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: config.color,
          boxShadow: `0 0 6px ${config.glowColor}`,
        }}
      />
    </div>
  );
}

function FireflySprite({ config, isTrapped, wingPhase = 0 }: SpriteProps) {
  const glowIntensity = 0.5 + Math.sin(wingPhase * 0.5) * 0.5;

  return (
    <div className="relative" style={{ opacity: isTrapped ? 0.7 : 1 }}>
      {/* Pulsing glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: config.size * 2,
          height: config.size * 2,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
          opacity: glowIntensity,
          filter: "blur(3px)",
        }}
      />
      {/* Body */}
      <div
        className="absolute rounded-full"
        style={{
          width: config.size,
          height: config.size,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: config.color,
          boxShadow: `0 0 ${8 + glowIntensity * 8}px ${config.color}`,
        }}
      />
    </div>
  );
}

function BeetleSprite({ config, isTrapped, angle = 0 }: SpriteProps) {
  return (
    <div
      className="relative"
      style={{
        transform: `rotate(${angle}deg)`,
        opacity: isTrapped ? 0.7 : 1,
      }}
    >
      {/* Shell */}
      <div
        className="absolute"
        style={{
          width: config.size,
          height: config.size * 1.2,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: `linear-gradient(135deg, 
            ${config.color} 0%, 
            #5c2e0a 50%, 
            ${config.color} 100%
          )`,
          borderRadius: "50% 50% 40% 40%",
          boxShadow: `
            inset 2px 2px 4px rgba(255, 255, 255, 0.2),
            inset -2px -2px 4px rgba(0, 0, 0, 0.3),
            0 0 4px ${config.glowColor}
          `,
        }}
      />
      {/* Shell line */}
      <div
        className="absolute"
        style={{
          width: 2,
          height: config.size * 0.8,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
      />
    </div>
  );
}

function DragonflySprite({ config, wingScale = 1, isTrapped }: SpriteProps) {
  return (
    <div className="relative" style={{ opacity: isTrapped ? 0.7 : 1 }}>
      {/* Wings (transparent, iridescent) */}
      <div
        className="absolute"
        style={{
          width: config.size * 2.5,
          height: config.size * 0.6,
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scaleY(${wingScale})`,
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(0, 206, 209, 0.3) 20%, 
            rgba(100, 200, 255, 0.4) 50%, 
            rgba(0, 206, 209, 0.3) 80%, 
            transparent 100%
          )`,
          borderRadius: "50%",
          filter: "blur(0.5px)",
        }}
      />
      {/* Body */}
      <div
        className="absolute"
        style={{
          width: config.size * 0.25,
          height: config.size * 1.5,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: `linear-gradient(to bottom, 
            ${config.color} 0%, 
            #006666 100%
          )`,
          borderRadius: "20%",
          boxShadow: `0 0 8px ${config.glowColor}`,
        }}
      />
      {/* Head */}
      <div
        className="absolute rounded-full"
        style={{
          width: config.size * 0.4,
          height: config.size * 0.4,
          left: "50%",
          top: "30%",
          transform: "translate(-50%, -50%)",
          backgroundColor: config.color,
        }}
      />
    </div>
  );
}

function ButterflySprite({
  config,
  wingScale = 1,
  isTrapped,
  angle = 0,
}: SpriteProps) {
  return (
    <div
      className="relative butterfly-dance"
      style={{
        animationPlayState: isTrapped ? "paused" : "running",
        opacity: isTrapped ? 0.7 : 1,
      }}
    >
      {/* Upper wings */}
      <div
        className="absolute"
        style={{
          width: config.size * 1.8,
          height: config.size * 1.2,
          left: "50%",
          top: "40%",
          transform: `translate(-50%, -50%) scaleY(${wingScale * 0.8})`,
          background: `radial-gradient(ellipse at 30% 50%, 
            ${config.color} 0%, 
            #ff1493 40%, 
            transparent 70%
          ), radial-gradient(ellipse at 70% 50%, 
            ${config.color} 0%, 
            #ff1493 40%, 
            transparent 70%
          )`,
          filter: "blur(0.5px)",
        }}
      />
      {/* Lower wings */}
      <div
        className="absolute"
        style={{
          width: config.size * 1.4,
          height: config.size * 0.8,
          left: "50%",
          top: "65%",
          transform: `translate(-50%, -50%) scaleY(${wingScale})`,
          background: `radial-gradient(ellipse at 30% 50%, 
            #da70d6 0%, 
            ${config.color}88 50%, 
            transparent 70%
          ), radial-gradient(ellipse at 70% 50%, 
            #da70d6 0%, 
            ${config.color}88 50%, 
            transparent 70%
          )`,
          filter: "blur(0.5px)",
        }}
      />
      {/* Body */}
      <div
        className="absolute"
        style={{
          width: config.size * 0.2,
          height: config.size * 0.8,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#2d1f3d",
          borderRadius: "40%",
          boxShadow: `0 0 4px ${config.glowColor}`,
        }}
      />
    </div>
  );
}

// Golden Moth - rare, high value, with golden sparkle trail
function GoldenMothSprite({
  config,
  wingScale = 1,
  isTrapped,
  angle = 0,
  wingPhase = 0,
}: SpriteProps) {
  const shimmer = 0.7 + Math.sin(wingPhase * 0.8) * 0.3;

  return (
    <div
      className="relative"
      style={{
        transform: `rotate(${angle * 2}deg)`,
        opacity: isTrapped ? 0.7 : 1,
      }}
    >
      {/* Magical golden aura */}
      <div
        className="absolute rounded-full"
        style={{
          width: config.size * 3,
          height: config.size * 3,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, rgba(255, 215, 0, ${shimmer * 0.5}) 0%, rgba(255, 180, 0, 0.2) 50%, transparent 70%)`,
          filter: "blur(4px)",
          animation: "pulse 1s ease-in-out infinite",
        }}
      />

      {/* Sparkle particles around the moth */}
      {[0, 1, 2, 3].map((i) => {
        const sparkleAngle = (wingPhase * 2 + i * (Math.PI / 2)) % (Math.PI * 2);
        const sparkleRadius = config.size * 0.8;
        const sparkleX = Math.cos(sparkleAngle) * sparkleRadius;
        const sparkleY = Math.sin(sparkleAngle) * sparkleRadius;

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              left: `calc(50% + ${sparkleX}px)`,
              top: `calc(50% + ${sparkleY}px)`,
              transform: "translate(-50%, -50%)",
              backgroundColor: "#FFD700",
              boxShadow: "0 0 6px #FFD700, 0 0 12px #FFA500",
              opacity: shimmer,
            }}
          />
        );
      })}

      {/* Wings with golden gradient */}
      <div
        className="absolute"
        style={{
          width: config.size * 2,
          height: config.size * 0.9,
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scaleY(${wingScale})`,
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(255, 200, 0, 0.7) 15%,
            #FFD700 35%,
            #FFF8DC 50%,
            #FFD700 65%,
            rgba(255, 200, 0, 0.7) 85%,
            transparent 100%
          )`,
          borderRadius: "50%",
          filter: `blur(1px) brightness(${1 + shimmer * 0.3})`,
          boxShadow: `0 0 ${10 * shimmer}px rgba(255, 215, 0, 0.6)`,
        }}
      />

      {/* Body with golden sheen */}
      <div
        className="absolute rounded-full"
        style={{
          width: config.size * 0.4,
          height: config.size * 0.8,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: "linear-gradient(to right, #B8860B, #FFD700, #B8860B)",
          boxShadow: `0 0 8px ${config.glowColor}, 0 0 16px rgba(255, 215, 0, 0.5)`,
        }}
      />
    </div>
  );
}

export default PreyComponent;
