// components/game/Particles.tsx
import React, { useState, useEffect } from "react";
import { GameState, Vector2D } from "@/lib/types/game";

interface Particle {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  size: number;
  lifetime: number;
  createdAt: number;
}

interface ParticlesProps {
  gameState: GameState;
}

const Particles: React.FC<ParticlesProps> = ({ gameState }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Create particles when spider is moving
  useEffect(() => {
    if (gameState.isCrawling || gameState.isJumping) {
      const createParticle = () => {
        const particle: Particle = {
          id: Math.random().toString(),
          position: { ...gameState.position },
          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
          },
          size: Math.random() * 3 + 1,
          lifetime: 500,
          createdAt: Date.now(),
        };
        setParticles((prev) => [...prev, particle]);
      };

      createParticle();
    }
  }, [gameState.position, gameState.isCrawling, gameState.isJumping]);

  // Clean up expired particles
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setParticles((prev) =>
        prev.filter((particle) => now - particle.createdAt < particle.lifetime)
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: particle.position.x,
            top: particle.position.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            borderRadius: "50%",
          }}
        />
      ))}
    </>
  );
};

export default Particles;
