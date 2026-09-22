'use client';

import { memo, useMemo } from "react";

function generateWebStrands(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const x2 = 50 + Math.cos(angle) * 45;
    const y2 = 50 + Math.sin(angle) * 45;
    return { angle, x2, y2, delay: i * 0.1 };
  });
}

function generateWebRings(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    radius: 8 + i * 8,
    delay: i * 0.15,
    opacity: 0.3 - i * 0.03,
  }));
}

interface MenuWebBackdropProps {
  mousePos: { x: number; y: number };
}

export const MenuWebBackdrop = memo(function MenuWebBackdrop({ mousePos }: MenuWebBackdropProps) {
  const webStrands = useMemo(() => generateWebStrands(16), []);
  const webRings = useMemo(() => generateWebRings(6), []);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
        transition: "transform 0.3s ease-out",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-[120vmin] h-[120vmin] opacity-20"
        style={{ filter: "drop-shadow(0 0 10px rgba(200, 220, 255, 0.3))" }}
      >
        {webStrands.map((strand) => (
          <line
            key={`strand-${strand.delay}`}
            x1="50"
            y1="50"
            x2={strand.x2}
            y2={strand.y2}
            stroke="url(#webGradient)"
            strokeWidth="0.15"
            className="web-strand-anim"
            style={{ animationDelay: `${strand.delay}s`, opacity: 0.6 }}
          />
        ))}
        {webRings.map((ring) => (
          <circle
            key={`ring-${ring.radius}`}
            cx="50"
            cy="50"
            r={ring.radius}
            fill="none"
            stroke="rgba(200, 220, 255, 0.4)"
            strokeWidth="0.1"
            className="web-ring-anim"
            style={{ animationDelay: `${ring.delay}s`, opacity: ring.opacity }}
          />
        ))}
        <defs>
          <linearGradient id="webGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(200, 220, 255, 0.8)" />
            <stop offset="100%" stopColor="rgba(200, 220, 255, 0.1)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
});
