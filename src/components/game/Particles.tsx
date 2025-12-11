"use client";

import { memo, useMemo } from "react";
import { Particle, ScorePopup } from "@/lib/types/game";
import { useGameStore } from "@/stores/gameStore";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";

interface ParticlesProps {
  particles: Particle[];
}

const Particles = memo(function Particles({ particles }: ParticlesProps) {
  const frameTime = useGameStore((state) => state.frameTime);

  return (
    <>
      {particles.map((particle) => {
        const age = frameTime - particle.createdAt;
        const progress = age / particle.lifetime;
        const opacity = Math.max(0, 1 - progress);

        // Enhanced scale based on particle type
        let scale = 1;
        let blur = 0;
        let shape: "circle" | "star" | "diamond" = "circle";
        let extraGlow = false;

        switch (particle.type) {
          case "catch":
            scale = 1 + progress * 0.8;
            blur = progress * 2;
            extraGlow = true;
            break;
          case "combo":
            scale = 1 + Math.sin(progress * Math.PI) * 0.5;
            shape = "star";
            extraGlow = true;
            break;
          case "sparkle":
            scale = (1 - progress) * 1.8;
            shape = "diamond";
            extraGlow = true;
            break;
          case "web":
            scale = 1 - progress * 0.3;
            blur = 1;
            break;
          case "trail":
            scale = 1 - progress * 0.5;
            blur = progress * 3;
            break;
        }

        // Star shape for combo particles
        if (shape === "star") {
          return (
            <svg
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                left: particle.position.x,
                top: particle.position.y,
                width: particle.size * scale * 2,
                height: particle.size * scale * 2,
                transform: `translate(-50%, -50%) rotate(${progress * 360}deg)`,
                opacity,
                filter: `blur(${blur}px) drop-shadow(0 0 ${particle.size}px ${particle.color})`,
                zIndex: 850,
              }}
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={particle.color}
              />
            </svg>
          );
        }

        // Diamond shape for sparkle particles
        if (shape === "diamond") {
          return (
            <div
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                left: particle.position.x,
                top: particle.position.y,
                width: particle.size * scale,
                height: particle.size * scale,
                transform: `translate(-50%, -50%) rotate(45deg)`,
                backgroundColor: particle.color,
                opacity,
                boxShadow: `0 0 ${particle.size * 3}px ${particle.color}, 0 0 ${
                  particle.size * 6
                }px ${particle.color}`,
                filter: `blur(${blur}px)`,
                zIndex: 850,
              }}
            />
          );
        }

        // Default circle
        return (
          <div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: particle.position.x,
              top: particle.position.y,
              width: particle.size * scale,
              height: particle.size * scale,
              transform: `translate(-50%, -50%)`,
              backgroundColor: particle.color,
              opacity,
              boxShadow: extraGlow
                ? `0 0 ${particle.size * 2}px ${particle.color}, 0 0 ${
                    particle.size * 4
                  }px ${particle.color}`
                : particle.type === "web"
                ? `0 0 ${particle.size}px rgba(200, 220, 255, 0.5)`
                : "none",
              filter: `blur(${blur}px)`,
              zIndex: 850,
            }}
          />
        );
      })}
    </>
  );
});

interface ScorePopupsProps {
  popups: ScorePopup[];
}

export const ScorePopups = memo(function ScorePopups({
  popups,
}: ScorePopupsProps) {
  const frameTime = useGameStore((state) => state.frameTime);

  return (
    <>
      {popups.map((popup) => {
        const age = frameTime - popup.createdAt;
        const progress = age / GAME_CONFIG.effects.scorePopupDuration;
        const y = popup.position.y - progress * 80;
        const opacity = Math.max(0, 1 - progress * progress); // Ease out
        const scale = 1 + Math.sin(progress * Math.PI * 0.5) * 0.4;

        // Horizontal drift for visual interest
        const xDrift = Math.sin(progress * Math.PI * 2) * 10;

        const isCombo = popup.combo && popup.combo > 1;
        const comboColor = isCombo
          ? `hsl(${40 + popup.combo! * 8}, 100%, 55%)`
          : "#fff";

        return (
          <div
            key={popup.id}
            className="absolute pointer-events-none"
            style={{
              left: popup.position.x + xDrift,
              top: y,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
              zIndex: 1100,
            }}
          >
            {/* Glow background */}
            <div
              className="absolute inset-0 rounded-full blur-xl"
              style={{
                background: isCombo
                  ? `radial-gradient(circle, ${comboColor}40 0%, transparent 70%)`
                  : "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
                transform: "scale(3)",
              }}
            />

            {/* Score value */}
            <div
              className="text-2xl font-black text-center relative"
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                color: isCombo ? comboColor : "#fff",
                textShadow: isCombo
                  ? `0 0 20px ${comboColor}, 0 0 40px ${comboColor}80, 0 2px 4px rgba(0, 0, 0, 0.5)`
                  : "0 0 15px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)",
                letterSpacing: "-0.02em",
              }}
            >
              +{popup.value}
            </div>

            {/* Combo indicator with animation */}
            {isCombo && (
              <div
                className="text-xs font-bold text-center tracking-wider uppercase mt-1"
                style={{
                  color: comboColor,
                  textShadow: `0 0 10px ${comboColor}`,
                  animation: "combo-pulse 0.3s ease-out",
                }}
              >
                <span className="inline-flex items-center gap-1">
                  <span>×{popup.combo}</span>
                  <span className="text-yellow-400">🔥</span>
                  <span>COMBO</span>
                </span>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
});

// Separate component for near-miss indicators
interface NearMissProps {
  position: { x: number; y: number };
  onComplete: () => void;
}

export const NearMissIndicator = memo(function NearMissIndicator({
  position,
  onComplete,
}: NearMissProps) {
  return (
    <div
      className="absolute pointer-events-none near-miss-indicator"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
        zIndex: 1050,
      }}
      onAnimationEnd={onComplete}
    >
      <div
        className="text-sm font-bold text-yellow-400"
        style={{
          textShadow: "0 0 10px rgba(250, 204, 21, 0.8)",
        }}
      >
        CLOSE!
      </div>
    </div>
  );
});

// Ring burst effect for catches
interface RingBurstProps {
  position: { x: number; y: number };
  color: string;
  size: number;
}

export const RingBurst = memo(function RingBurst({
  position,
  color,
  size,
}: RingBurstProps) {
  const rings = useMemo(
    () => [
      { delay: 0, scale: 1 },
      { delay: 0.1, scale: 1.5 },
      { delay: 0.2, scale: 2 },
    ],
    []
  );

  return (
    <>
      {rings.map((ring, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none pulse-ring"
          style={{
            left: position.x,
            top: position.y,
            width: size * ring.scale,
            height: size * ring.scale,
            transform: "translate(-50%, -50%)",
            border: `2px solid ${color}`,
            opacity: 0.6,
            animationDelay: `${ring.delay}s`,
            zIndex: 840,
          }}
        />
      ))}
    </>
  );
});

export default Particles;
