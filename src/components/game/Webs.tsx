"use client";

import { memo, useMemo } from "react";
import { Web } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";
import { useGameStore } from "@/stores/gameStore";

interface WebsProps {
  webs: Web[];
}

const Webs = memo(function Webs({ webs }: WebsProps) {
  if (!webs?.length) return null;

  return (
    <>
      {webs.map((web) => (
        <WebLine key={web.id} web={web} />
      ))}
    </>
  );
});

interface WebLineProps {
  web: Web;
}

function WebLine({ web }: WebLineProps) {
  const frameTime = useGameStore((state) => state.frameTime);
  const timeElapsed = frameTime - web.createdAt;
  const timeRemaining = web.lifetime - timeElapsed;

  // Don't render expired webs
  if (timeRemaining <= 0) return null;

  const progress = timeElapsed / web.lifetime;
  const opacity = Math.max(0.2, 1 - progress * 0.8);
  const fadeStart = web.lifetime * 0.7;
  const isFading = timeRemaining < web.lifetime - fadeStart;

  const dx = web.endPos.x - web.startPos.x;
  const dy = web.endPos.y - web.startPos.y;
  const length = Math.hypot(dx, dy);

  // Calculate glow intensity based on age
  const glowIntensity = GAME_CONFIG.web.glowIntensity * (1 - progress * 0.5);

  // Calculate curve for web sway effect
  const swayAmount = 8 * (1 - progress * 0.5);
  const swayPhase = frameTime * 0.002 + web.createdAt * 0.001;
  const sway = Math.sin(swayPhase) * swayAmount;

  // Control point for quadratic bezier curve (creates the sway)
  const midX = (web.startPos.x + web.endPos.x) / 2;
  const midY = (web.startPos.y + web.endPos.y) / 2;

  // Perpendicular offset for the sway
  const perpX = -dy / length * sway;
  const perpY = dx / length * sway;

  const controlX = midX + perpX;
  const controlY = midY + perpY + sway * 0.5; // Slight gravity sag

  // SVG path for curved web
  const pathD = `M ${web.startPos.x} ${web.startPos.y} Q ${controlX} ${controlY} ${web.endPos.x} ${web.endPos.y}`;

  return (
    <>
      {/* SVG curved web line with physics */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 900, overflow: 'visible' }}
      >
        <defs>
          <filter id={`web-glow-${web.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={glowIntensity * 0.5} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`web-gradient-${web.id}`} gradientUnits="userSpaceOnUse"
            x1={web.startPos.x} y1={web.startPos.y} x2={web.endPos.x} y2={web.endPos.y}>
            <stop offset="0%" stopColor="rgba(200, 220, 255, 0.3)" />
            <stop offset="50%" stopColor="rgba(220, 235, 255, 0.9)" />
            <stop offset="100%" stopColor="rgba(200, 220, 255, 0.3)" />
          </linearGradient>
        </defs>

        {/* Main web strand */}
        <path
          d={pathD}
          fill="none"
          stroke={`url(#web-gradient-${web.id})`}
          strokeWidth={GAME_CONFIG.web.thickness}
          opacity={opacity}
          filter={`url(#web-glow-${web.id})`}
          strokeLinecap="round"
        />

        {/* Secondary thinner strand for detail */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth={1}
          opacity={opacity * 0.6}
          strokeLinecap="round"
        />
      </svg>

      {/* Web anchor points with glow */}
      <WebAnchor
        position={web.startPos}
        opacity={opacity}
        isFading={isFading}
      />
      <WebAnchor position={web.endPos} opacity={opacity} isFading={isFading} />

      {/* Dew drops along the web */}
      <DewDrops
        startPos={web.startPos}
        controlPos={{ x: controlX, y: controlY }}
        endPos={web.endPos}
        opacity={opacity}
        length={length}
        time={frameTime}
      />
    </>
  );
}

interface WebAnchorProps {
  position: { x: number; y: number };
  opacity: number;
  isFading: boolean;
}

function WebAnchor({ position, opacity, isFading }: WebAnchorProps) {
  return (
    <div
      className={`absolute rounded-full ${!isFading ? "web-anchor" : ""}`}
      style={{
        left: position.x,
        top: position.y,
        width: 6,
        height: 6,
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgba(220, 235, 255, 0.9)",
        opacity: opacity,
        boxShadow: "0 0 8px rgba(200, 220, 255, 0.8)",
        zIndex: 901,
      }}
    />
  );
}

interface DewDropsProps {
  startPos: { x: number; y: number };
  controlPos: { x: number; y: number };
  endPos: { x: number; y: number };
  opacity: number;
  length: number;
  time: number;
}

// Calculate point on quadratic bezier curve
function getPointOnCurve(
  start: { x: number; y: number },
  control: { x: number; y: number },
  end: { x: number; y: number },
  t: number
) {
  const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
  const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y;
  return { x, y };
}

function DewDrops({ startPos, controlPos, endPos, opacity, length, time }: DewDropsProps) {
  const dropCount = Math.floor(length / 60);

  const drops = useMemo(() => {
    if (dropCount < 1) return [];
    return Array.from({ length: dropCount }, (_, i) => {
      const t = (i + 1) / (dropCount + 1);
      const pos = getPointOnCurve(startPos, controlPos, endPos, t);
      // Vary size based on position
      const baseSize = 3 + Math.sin(i * 2.5) * 1.5;
      return {
        x: pos.x,
        y: pos.y,
        size: baseSize,
        shimmerOffset: i * 0.7,
      };
    });
  }, [startPos.x, startPos.y, controlPos.x, controlPos.y, endPos.x, endPos.y, dropCount]);

  if (drops.length === 0) return null;

  return (
    <>
      {drops.map((drop, i) => {
        // Shimmer effect - each drop shimmers at different times
        const shimmerPhase = (time * 0.003 + drop.shimmerOffset) % (Math.PI * 2);
        const shimmer = 0.5 + Math.sin(shimmerPhase) * 0.5;

        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: drop.x,
              top: drop.y,
              width: drop.size,
              height: drop.size * 1.2, // Slightly elongated like a real water drop
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(ellipse at 30% 30%,
                rgba(255, 255, 255, ${0.9 * shimmer}) 0%,
                rgba(200, 230, 255, 0.7) 40%,
                rgba(150, 200, 255, 0.4) 100%
              )`,
              opacity: opacity * 0.9,
              boxShadow: `
                0 0 ${4 + shimmer * 4}px rgba(200, 230, 255, ${0.5 + shimmer * 0.3}),
                inset 0 0 2px rgba(255, 255, 255, 0.8)
              `,
              zIndex: 901,
            }}
          />
        );
      })}
    </>
  );
}

export default Webs;
