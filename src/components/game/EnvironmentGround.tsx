'use client';

import { memo } from "react";
import { STATIC_AMBIENT_PARTICLES } from "./environmentData";

interface EnvironmentGroundProps {
  dimensions: { width: number; height: number };
  parallaxOffset: { x: number; y: number };
}

export const EnvironmentGround = memo(function EnvironmentGround({
  dimensions: _dimensions,
  parallaxOffset: _parallaxOffset,
}: EnvironmentGroundProps) {
  void _dimensions;
  void _parallaxOffset;
  const ambientParticles = STATIC_AMBIENT_PARTICLES;
  return (
    <>
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
    </>
  );
});
