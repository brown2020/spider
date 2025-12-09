'use client';

import { memo, useMemo, useState, useEffect } from 'react';

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

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  speed: number;
  length: number;
}

interface EnvironmentProps {
  dimensions: { width: number; height: number };
}

const Environment = memo(function Environment({ dimensions }: EnvironmentProps) {
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  
  // Generate stars with depth layers
  const stars = useMemo(() => {
    const starArray: Star[] = [];
    
    // Distant stars (small, subtle)
    for (let i = 0; i < 100; i++) {
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
    for (let i = 100; i < 180; i++) {
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
    for (let i = 180; i < 200; i++) {
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
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 50 + Math.random() * 50,
      size: Math.random() * 3 + 1,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 10,
    })),
  []);

  // Spawn shooting stars periodically
  useEffect(() => {
    const spawnShootingStar = () => {
      const id = Date.now();
      const newStar: ShootingStar = {
        id,
        startX: Math.random() * 60 + 10, // Start in upper portion
        startY: Math.random() * 30 + 5,
        angle: Math.random() * 30 + 30, // Angle between 30-60 degrees
        speed: Math.random() * 2 + 3,
        length: Math.random() * 80 + 60,
      };
      
      setShootingStars(prev => [...prev, newStar]);
      
      // Remove after animation completes
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== id));
      }, 2000);
    };
    
    // Initial delay, then spawn randomly
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 3 seconds
        spawnShootingStar();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient background with richer colors */}
      <div 
        className="absolute inset-0"
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          background: `
            radial-gradient(ellipse 120% 80% at 50% 120%, rgba(20, 50, 80, 0.6) 0%, transparent 50%),
            radial-gradient(ellipse 100% 80% at 20% 0%, rgba(40, 60, 100, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 85% 15%, rgba(60, 30, 80, 0.3) 0%, transparent 40%),
            linear-gradient(to bottom, 
              #030508 0%, 
              #050a12 20%, 
              #081020 40%, 
              #0a1528 60%, 
              #0c1830 80%,
              #101830 100%
            )
          `,
        }}
      />
      
      {/* Aurora borealis effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute aurora"
          style={{
            width: '200%',
            height: '40%',
            top: '5%',
            left: '-50%',
            background: `
              linear-gradient(180deg,
                transparent 0%,
                rgba(100, 200, 150, 0.03) 20%,
                rgba(50, 150, 200, 0.05) 40%,
                rgba(100, 100, 200, 0.03) 60%,
                transparent 100%
              )
            `,
            filter: 'blur(30px)',
            transform: 'skewX(-10deg)',
          }}
        />
        <div 
          className="absolute aurora"
          style={{
            width: '150%',
            height: '30%',
            top: '8%',
            left: '-25%',
            background: `
              linear-gradient(180deg,
                transparent 0%,
                rgba(100, 180, 255, 0.04) 30%,
                rgba(150, 100, 200, 0.03) 70%,
                transparent 100%
              )
            `,
            filter: 'blur(40px)',
            transform: 'skewX(5deg)',
            animationDelay: '2s',
          }}
        />
      </div>
      
      {/* Moon with enhanced glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 90,
          height: 90,
          top: '6%',
          right: '10%',
          background: `
            radial-gradient(circle at 35% 35%,
              rgba(255, 255, 255, 0.98) 0%,
              rgba(230, 240, 255, 0.95) 20%,
              rgba(200, 220, 245, 0.85) 40%,
              rgba(150, 180, 220, 0.4) 70%,
              transparent 100%
            )
          `,
          boxShadow: `
            0 0 60px rgba(200, 220, 255, 0.4),
            0 0 100px rgba(150, 180, 220, 0.25),
            0 0 150px rgba(100, 140, 180, 0.15),
            inset -10px -10px 30px rgba(150, 170, 200, 0.3)
          `,
        }}
      >
        {/* Moon craters */}
        <div 
          className="absolute rounded-full"
          style={{
            width: 12,
            height: 12,
            top: '25%',
            left: '30%',
            background: 'rgba(180, 200, 220, 0.3)',
            boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.2)',
          }}
        />
        <div 
          className="absolute rounded-full"
          style={{
            width: 8,
            height: 8,
            top: '50%',
            left: '55%',
            background: 'rgba(180, 200, 220, 0.25)',
            boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.15)',
          }}
        />
        <div 
          className="absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            top: '65%',
            left: '35%',
            background: 'rgba(180, 200, 220, 0.2)',
          }}
        />
      </div>
      
      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute pointer-events-none shooting-star"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            width: star.length,
            height: 2,
            background: `linear-gradient(90deg, 
              transparent 0%,
              rgba(255, 255, 255, 0.1) 30%,
              rgba(200, 220, 255, 0.8) 70%,
              rgba(255, 255, 255, 1) 100%
            )`,
            transform: `rotate(${star.angle}deg)`,
            transformOrigin: 'right center',
            boxShadow: '0 0 6px rgba(200, 220, 255, 0.8)',
            animation: `shooting-star-move ${star.speed}s ease-out forwards`,
          }}
        />
      ))}
      
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
                ? '#f0f8ff' 
                : star.type === 'normal' 
                  ? '#d0e0f0' 
                  : '#90a8c8',
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              boxShadow: star.type === 'bright' 
                ? `0 0 ${star.size * 3}px rgba(220, 240, 255, 0.7), 0 0 ${star.size * 6}px rgba(180, 210, 255, 0.3)` 
                : star.type === 'normal'
                  ? `0 0 ${star.size}px rgba(200, 220, 255, 0.3)`
                  : 'none',
            }}
          />
        ))}
      </div>
      
      {/* Nebula/cloud layers */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '70%',
          height: '45%',
          left: '0%',
          top: '8%',
          background: 'radial-gradient(ellipse at 40% 50%, rgba(60, 40, 100, 0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '55%',
          height: '40%',
          right: '-5%',
          top: '20%',
          background: 'radial-gradient(ellipse at 60% 50%, rgba(30, 60, 100, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '40%',
          height: '30%',
          left: '30%',
          top: '15%',
          background: 'radial-gradient(ellipse, rgba(80, 50, 120, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
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
            backgroundColor: 'rgba(200, 220, 255, 0.4)',
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            boxShadow: '0 0 4px rgba(200, 220, 255, 0.3)',
          }}
        />
      ))}
      
      {/* Distant treeline silhouette with more detail */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '18%',
          background: `
            linear-gradient(to right,
              transparent 0%,
              rgba(6, 12, 20, 0.95) 8%,
              rgba(8, 15, 25, 1) 25%,
              rgba(6, 12, 20, 0.98) 45%,
              rgba(8, 15, 25, 1) 65%,
              rgba(6, 12, 20, 0.95) 85%,
              transparent 100%
            )
          `,
          clipPath: `polygon(
            0% 100%,
            0% 85%,
            3% 75%,
            5% 78%,
            8% 65%,
            10% 70%,
            13% 55%,
            15% 60%,
            17% 48%,
            20% 55%,
            22% 42%,
            25% 50%,
            27% 38%,
            30% 45%,
            32% 32%,
            35% 42%,
            37% 35%,
            40% 28%,
            42% 38%,
            45% 25%,
            47% 35%,
            50% 22%,
            52% 32%,
            55% 28%,
            57% 38%,
            60% 25%,
            62% 35%,
            65% 30%,
            68% 40%,
            70% 32%,
            73% 45%,
            75% 35%,
            78% 48%,
            80% 38%,
            83% 52%,
            85% 42%,
            88% 58%,
            90% 48%,
            93% 62%,
            95% 52%,
            97% 70%,
            100% 58%,
            100% 100%
          )`,
        }}
      />
      
      {/* Secondary treeline (closer, darker) */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '12%',
          background: 'rgba(4, 8, 15, 0.98)',
          clipPath: `polygon(
            0% 100%,
            0% 70%,
            5% 55%,
            10% 65%,
            15% 45%,
            20% 55%,
            25% 40%,
            30% 52%,
            35% 35%,
            40% 48%,
            45% 30%,
            50% 45%,
            55% 32%,
            60% 48%,
            65% 38%,
            70% 52%,
            75% 42%,
            80% 58%,
            85% 48%,
            90% 62%,
            95% 52%,
            100% 68%,
            100% 100%
          )`,
        }}
      />
      
      {/* Ground fog layer with gradient */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ 
          height: '25%',
          background: `
            linear-gradient(to top,
              rgba(20, 40, 70, 0.5) 0%,
              rgba(25, 45, 75, 0.35) 30%,
              rgba(30, 50, 80, 0.15) 60%,
              transparent 100%
            )
          `,
        }}
      />
      
      {/* Animated fog wisps */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
        style={{ height: '20%' }}
      >
        <div 
          className="absolute w-[200%] h-full"
          style={{
            background: `
              radial-gradient(ellipse 30% 60% at 20% 80%, rgba(40, 60, 100, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse 25% 50% at 50% 70%, rgba(35, 55, 90, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 35% 70% at 80% 85%, rgba(45, 65, 105, 0.18) 0%, transparent 50%)
            `,
            animation: 'fog-drift 30s ease-in-out infinite',
          }}
        />
      </div>
      
      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.5) 100%)
          `,
        }}
      />
      
      {/* Subtle grain/noise texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
});

export default Environment;
