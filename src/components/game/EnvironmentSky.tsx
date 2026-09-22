'use client';

import { memo } from "react";
import { STATIC_STARS, ShootingStar } from "./environmentData";

interface EnvironmentSkyProps {
  dimensions: { width: number; height: number };
  parallaxOffset: { x: number; y: number };
  shootingStars: ShootingStar[];
}

export const EnvironmentSky = memo(function EnvironmentSky({
  dimensions,
  parallaxOffset,
  shootingStars,
}: EnvironmentSkyProps) {
  const stars = STATIC_STARS;
  return (
    <>
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
      
      {/* Moon with enhanced glow and parallax */}
      <div
        className="absolute rounded-full transition-transform duration-300 ease-out"
        style={{
          width: 90,
          height: 90,
          top: `calc(6% + ${parallaxOffset.y * -15}px)`,
          right: `calc(10% + ${parallaxOffset.x * 15}px)`,
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
      
      {/* Stars layer with parallax - different layers move at different speeds */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${parallaxOffset.x * -5}px, ${parallaxOffset.y * -5}px)`,
        }}
      >
        {stars.filter(s => s.type === 'distant').map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: '#90a8c8',
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>
      <div
        className="absolute inset-0 transition-transform duration-400 ease-out"
        style={{
          transform: `translate(${parallaxOffset.x * -10}px, ${parallaxOffset.y * -8}px)`,
        }}
      >
        {stars.filter(s => s.type === 'normal').map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: '#d0e0f0',
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              boxShadow: `0 0 ${star.size}px rgba(200, 220, 255, 0.3)`,
            }}
          />
        ))}
      </div>
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${parallaxOffset.x * -18}px, ${parallaxOffset.y * -12}px)`,
        }}
      >
        {stars.filter(s => s.type === 'bright').map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: '#f0f8ff',
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              boxShadow: `0 0 ${star.size * 3}px rgba(220, 240, 255, 0.7), 0 0 ${star.size * 6}px rgba(180, 210, 255, 0.3)`,
            }}
          />
        ))}
      </div>
      
    </>
  );
});
