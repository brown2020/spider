"use client";

import { memo } from "react";

interface FloatingParticleData {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

const FLOATING_PARTICLES: FloatingParticleData[] = Array.from(
  { length: 30 },
  (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: 5 + Math.random() * 10,
    delay: Math.random() * 5,
  })
);

export const FloatingParticles = memo(function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {FLOATING_PARTICLES.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: "rgba(200, 220, 255, 0.3)",
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
});
