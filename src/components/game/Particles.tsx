'use client';

import { memo } from 'react';
import { Particle, ScorePopup } from '@/lib/types/game';

interface ParticlesProps {
  particles: Particle[];
}

const Particles = memo(function Particles({ particles }: ParticlesProps) {
  const now = Date.now();
  
  return (
    <>
      {particles.map((particle) => {
        const age = now - particle.createdAt;
        const progress = age / particle.lifetime;
        const opacity = 1 - progress;
        
        // Scale based on particle type
        let scale = 1;
        if (particle.type === 'catch') {
          scale = 1 + progress * 0.5;
        } else if (particle.type === 'combo') {
          scale = 1 + Math.sin(progress * Math.PI) * 0.3;
        } else if (particle.type === 'sparkle') {
          scale = (1 - progress) * 1.5;
        }
        
        return (
          <div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: particle.position.x,
              top: particle.position.y,
              width: particle.size * scale,
              height: particle.size * scale,
              transform: `translate(-50%, -50%) ${particle.rotation ? `rotate(${particle.rotation}deg)` : ''}`,
              backgroundColor: particle.color,
              opacity: Math.max(0, opacity),
              boxShadow: particle.type === 'sparkle' || particle.type === 'combo'
                ? `0 0 ${particle.size * 2}px ${particle.color}`
                : particle.type === 'catch'
                  ? `0 0 ${particle.size}px ${particle.color}`
                  : 'none',
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

export const ScorePopups = memo(function ScorePopups({ popups }: ScorePopupsProps) {
  const now = Date.now();
  
  return (
    <>
      {popups.map((popup) => {
        const age = now - popup.createdAt;
        const progress = age / 1500; // 1.5s duration
        const y = popup.position.y - progress * 60;
        const opacity = 1 - progress;
        const scale = 1 + Math.sin(progress * Math.PI * 0.5) * 0.3;
        
        return (
          <div
            key={popup.id}
            className="absolute pointer-events-none font-bold"
            style={{
              left: popup.position.x,
              top: y,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: Math.max(0, opacity),
              zIndex: 1100,
              fontFamily: "'GameFont', monospace",
            }}
          >
            {/* Score value */}
            <div
              className="text-xl text-center"
              style={{
                color: popup.combo && popup.combo > 1 ? '#ffd700' : '#fff',
                textShadow: popup.combo && popup.combo > 1
                  ? '0 0 10px rgba(255, 215, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)'
                  : '0 0 8px rgba(255, 255, 255, 0.6), 0 2px 4px rgba(0, 0, 0, 0.5)',
              }}
            >
              +{popup.value}
            </div>
            
            {/* Combo indicator */}
            {popup.combo && popup.combo > 1 && (
              <div
                className="text-sm text-center combo-display"
                style={{
                  color: `hsl(${40 + popup.combo * 5}, 100%, 55%)`,
                  textShadow: '0 0 8px currentColor',
                }}
              >
                x{popup.combo} COMBO!
              </div>
            )}
          </div>
        );
      })}
    </>
  );
});

export default Particles;
