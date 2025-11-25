'use client';

import { memo, useMemo } from 'react';
import { Web } from '@/lib/types/game';
import { GAME_CONFIG } from '@/lib/constants/gameConfig';

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
  const now = Date.now();
  const timeElapsed = now - web.createdAt;
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
  const angle = Math.atan2(dy, dx);
  
  // Calculate glow intensity based on age
  const glowIntensity = GAME_CONFIG.web.glowIntensity * (1 - progress * 0.5);
  
  return (
    <>
      {/* Main web line with glow */}
      <div
        className="absolute web-line"
        style={{
          left: web.startPos.x,
          top: web.startPos.y,
          width: length,
          height: GAME_CONFIG.web.thickness,
          transformOrigin: 'left center',
          transform: `rotate(${angle}rad)`,
          opacity: opacity,
          boxShadow: `
            0 0 ${glowIntensity}px rgba(200, 220, 255, 0.8),
            0 0 ${glowIntensity * 2}px rgba(150, 180, 220, 0.5),
            0 0 ${glowIntensity * 3}px rgba(100, 150, 200, 0.3)
          `,
          zIndex: 900,
        }}
      />
      
      {/* Web anchor points with glow */}
      <WebAnchor 
        position={web.startPos} 
        opacity={opacity} 
        isFading={isFading}
      />
      <WebAnchor 
        position={web.endPos} 
        opacity={opacity} 
        isFading={isFading}
      />
      
      {/* Decorative nodes along the web */}
      <WebNodes 
        startPos={web.startPos}
        endPos={web.endPos}
        opacity={opacity}
        length={length}
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
      className={`absolute rounded-full ${!isFading ? 'web-anchor' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: 6,
        height: 6,
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(220, 235, 255, 0.9)',
        opacity: opacity,
        boxShadow: '0 0 8px rgba(200, 220, 255, 0.8)',
        zIndex: 901,
      }}
    />
  );
}

interface WebNodesProps {
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  opacity: number;
  length: number;
}

function WebNodes({ startPos, endPos, opacity, length }: WebNodesProps) {
  // Add decorative nodes for longer webs
  const nodeCount = Math.floor(length / 80);
  
  if (nodeCount < 1) return null;
  
  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }, (_, i) => {
      const t = (i + 1) / (nodeCount + 1);
      return {
        x: startPos.x + (endPos.x - startPos.x) * t,
        y: startPos.y + (endPos.y - startPos.y) * t,
        size: 3 + Math.sin(i * 1.5) * 1,
      };
    });
  }, [startPos, endPos, nodeCount]);
  
  return (
    <>
      {nodes.map((node, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: node.x,
            top: node.y,
            width: node.size,
            height: node.size,
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(200, 220, 255, 0.7)',
            opacity: opacity * 0.8,
            boxShadow: '0 0 4px rgba(200, 220, 255, 0.5)',
            zIndex: 900,
          }}
        />
      ))}
    </>
  );
}

export default Webs;
