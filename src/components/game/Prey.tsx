"use client";

import { memo } from "react";
import { Prey as PreyType } from "@/lib/types/game";
import { PREY_TYPES } from "@/lib/constants/gameConfig";

interface PreyProps {
  preyList: PreyType[];
}

// Individual prey item component - memoized for performance
interface PreyItemProps {
  prey: PreyType;
}

const PreyItem = memo(function PreyItem({ prey }: PreyItemProps) {
  const config = PREY_TYPES[prey.type];
  const isTrapped = prey.isTrapped;
  const wingPhase = prey.wingPhase;
  const wingScale = 0.8 + Math.sin(wingPhase) * 0.2;

  return (
    <div
      className={`absolute ${isTrapped ? "trapped-struggle" : ""}`}
      style={{
        left: prey.position.x,
        top: prey.position.y,
        transform: "translate(-50%, -50%)",
        zIndex: 800,
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute rounded-full"
        style={{
          width: config.size * 2.5,
          height: config.size * 2.5,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
          opacity: isTrapped ? 0.3 : 0.6,
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
    </div>
  );
});

const PreyComponent = memo(function PreyComponent({ preyList }: PreyProps) {
  return (
    <>
      {preyList.map((prey) => (
        <PreyItem key={prey.id} prey={prey} />
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

export default PreyComponent;
