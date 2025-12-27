"use client";

import { memo } from "react";
import { PowerUp } from "@/lib/types/game";
import { POWER_UP_CONFIG } from "@/lib/constants/gameConfig";
import { useGameStore } from "@/stores/gameStore";

interface PowerUpsProps {
  powerUps: PowerUp[];
}

const PowerUps = memo(function PowerUps({ powerUps }: PowerUpsProps) {
  const frameTime = useGameStore((state) => state.frameTime);

  return (
    <>
      {powerUps.map((powerUp) => {
        const config = POWER_UP_CONFIG[powerUp.type];
        const age = frameTime - powerUp.createdAt;
        const progress = age / powerUp.lifetime;

        // Fade out in last 20% of lifetime
        const opacity = progress > 0.8 ? (1 - progress) * 5 : 1;

        // Pulsing size
        const pulse = 1 + Math.sin(age * 0.01) * 0.1;

        return (
          <div
            key={powerUp.id}
            className="absolute power-up"
            style={{
              left: powerUp.position.x,
              top: powerUp.position.y,
              transform: "translate(-50%, -50%)",
              opacity,
              zIndex: 850,
              color: config.color,
            }}
          >
            {/* Outer glow ring */}
            <div
              className="absolute rounded-full"
              style={{
                width: 50 * pulse,
                height: 50 * pulse,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                border: `2px solid ${config.color}`,
                boxShadow: `
                  0 0 15px ${config.color}80,
                  inset 0 0 15px ${config.color}40
                `,
                animation: "spin-slow 4s linear infinite",
              }}
            />

            {/* Inner circle */}
            <div
              className="absolute rounded-full"
              style={{
                width: 35,
                height: 35,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(circle, ${config.color}60 0%, ${config.color}20 70%, transparent 100%)`,
                boxShadow: `0 0 20px ${config.color}80`,
              }}
            />

            {/* Icon */}
            <div
              className="absolute text-2xl"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) scale(${pulse})`,
                filter: `drop-shadow(0 0 4px ${config.color})`,
              }}
            >
              {config.icon}
            </div>

            {/* Orbiting particles */}
            {[0, 120, 240].map((angle, i) => {
              const orbitAngle =
                (age * 0.002 + (angle * Math.PI) / 180) % (Math.PI * 2);
              const orbitRadius = 30;
              const x = Math.cos(orbitAngle) * orbitRadius;
              const y = Math.sin(orbitAngle) * orbitRadius;

              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 4,
                    height: 4,
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: "translate(-50%, -50%)",
                    backgroundColor: config.color,
                    boxShadow: `0 0 6px ${config.color}`,
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
});

export default PowerUps;




