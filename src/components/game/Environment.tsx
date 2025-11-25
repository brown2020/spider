'use client';

import { memo, useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  type: 'normal' | 'bright' | 'distant';
}

interface EnvironmentProps {
  dimensions: { width: number; height: number };
}

const Environment = memo(function Environment({ dimensions }: EnvironmentProps) {
  // Generate stars with depth layers
  const stars = useMemo(() => {
    const starArray: Star[] = [];
    
    // Distant stars (small, subtle)
    for (let i = 0; i < 80; i++) {
      starArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 70,
        size: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        duration: Math.random() * 6 + 4,
        delay: Math.random() * 5,
        type: 'distant',
      });
    }
    
    // Normal stars
    for (let i = 80; i < 150; i++) {
      starArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 60,
        size: Math.random() * 1.5 + 1,
        opacity: Math.random() * 0.4 + 0.3,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 3,
        type: 'normal',
      });
    }
    
    // Bright stars (fewer, more prominent)
    for (let i = 150; i < 170; i++) {
      starArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 50,
        size: Math.random() * 2 + 2,
        opacity: Math.random() * 0.3 + 0.7,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
        type: 'bright',
      });
    }
    
    return starArray;
  }, []);

  // Ambient floating particles
  const ambientParticles = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 50 + Math.random() * 50,
      size: Math.random() * 3 + 1,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 10,
    })),
  []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient background */}
      <div 
        className="absolute inset-0 game-background"
        style={{ width: dimensions.width, height: dimensions.height }}
      />
      
      {/* Moon */}
      <div
        className="absolute moon rounded-full"
        style={{
          width: 80,
          height: 80,
          top: '8%',
          right: '12%',
        }}
      />
      
      {/* Stars layer */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: star.type === 'bright' 
                ? '#e8f4ff' 
                : star.type === 'normal' 
                  ? '#c8daf0' 
                  : '#8098b8',
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              boxShadow: star.type === 'bright' 
                ? `0 0 ${star.size * 2}px rgba(200, 220, 255, 0.6)` 
                : 'none',
            }}
          />
        ))}
      </div>
      
      {/* Nebula/cloud layers */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '60%',
          height: '40%',
          left: '5%',
          top: '10%',
          background: 'radial-gradient(ellipse, rgba(60, 40, 100, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '50%',
          height: '35%',
          right: '0%',
          top: '25%',
          background: 'radial-gradient(ellipse, rgba(30, 60, 100, 0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      
      {/* Ambient floating particles (dust/pollen) */}
      {ambientParticles.map((particle) => (
        <div
          key={`ambient-${particle.id}`}
          className="absolute rounded-full ambient-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: 'rgba(200, 220, 255, 0.3)',
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
      
      {/* Distant treeline silhouette */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '15%',
          background: `
            linear-gradient(to right,
              transparent 0%,
              rgba(8, 15, 25, 0.9) 10%,
              rgba(8, 15, 25, 0.95) 30%,
              rgba(8, 15, 25, 0.9) 50%,
              rgba(8, 15, 25, 0.95) 70%,
              rgba(8, 15, 25, 0.9) 90%,
              transparent 100%
            )
          `,
          clipPath: `polygon(
            0% 100%,
            0% 80%,
            5% 70%,
            8% 75%,
            12% 60%,
            15% 65%,
            18% 50%,
            22% 55%,
            25% 45%,
            28% 50%,
            32% 40%,
            35% 45%,
            38% 35%,
            42% 40%,
            45% 30%,
            48% 38%,
            52% 28%,
            55% 35%,
            58% 25%,
            62% 32%,
            65% 38%,
            68% 30%,
            72% 42%,
            75% 35%,
            78% 45%,
            82% 38%,
            85% 50%,
            88% 42%,
            92% 55%,
            95% 48%,
            98% 60%,
            100% 50%,
            100% 100%
          )`,
        }}
      />
      
      {/* Ground fog layer */}
      <div 
        className="absolute bottom-0 left-0 right-0 ground-fog pointer-events-none"
        style={{ height: '20%' }}
      />
      
      {/* Vignette overlay */}
      <div className="absolute inset-0 vignette pointer-events-none" />
      
      {/* Subtle scan lines effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)',
        }}
      />
    </div>
  );
});

export default Environment;
