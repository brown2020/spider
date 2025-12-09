'use client';

import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { GAME_CONFIG } from '@/lib/constants/gameConfig';

const Controls = memo(function Controls() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickCenter = useRef({ x: 0, y: 0 });
  
  const setVelocity = useGameStore((state) => state.setVelocity);
  const setDirection = useGameStore((state) => state.setDirection);
  const setCrawling = useGameStore((state) => state.setCrawling);
  const jump = useGameStore((state) => state.jump);
  const shootWeb = useGameStore((state) => state.shootWeb);
  const zipTo = useGameStore((state) => state.zipTo);
  const gameState = useGameStore((state) => state.gameState);
  
  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsTouchDevice(hasTouch && isMobile);
    };
    
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);
  
  // Calculate joystick center on mount/resize
  useEffect(() => {
    if (!joystickRef.current) return;
    
    const updateCenter = () => {
      const rect = joystickRef.current?.getBoundingClientRect();
      if (rect) {
        joystickCenter.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    };
    
    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, [isTouchDevice]);
  
  // Joystick touch handlers
  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setJoystickActive(true);
    
    const touch = e.touches[0];
    const rect = joystickRef.current?.getBoundingClientRect();
    if (rect) {
      joystickCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  }, []);
  
  const handleJoystickMove = useCallback((e: React.TouchEvent) => {
    if (!joystickActive) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const dx = touch.clientX - joystickCenter.current.x;
    const dy = touch.clientY - joystickCenter.current.y;
    
    const maxRadius = 40;
    const distance = Math.hypot(dx, dy);
    const clampedDistance = Math.min(distance, maxRadius);
    const angle = Math.atan2(dy, dx);
    
    const x = Math.cos(angle) * clampedDistance;
    const y = Math.sin(angle) * clampedDistance;
    
    setJoystickPos({ x, y });
    
    // Convert to velocity
    const normalizedX = x / maxRadius;
    const normalizedY = y / maxRadius;
    const speed = GAME_CONFIG.spider.baseSpeed;
    
    if (Math.abs(normalizedX) > 0.1 || Math.abs(normalizedY) > 0.1) {
      setVelocity({ x: normalizedX * speed, y: normalizedY * speed });
      setCrawling(true);
      
      // Set direction based on dominant axis
      if (Math.abs(normalizedX) > Math.abs(normalizedY)) {
        setDirection(normalizedX > 0 ? 'right' : 'left');
      } else {
        setDirection(normalizedY > 0 ? 'down' : 'up');
      }
    }
  }, [joystickActive, setVelocity, setCrawling, setDirection]);
  
  const handleJoystickEnd = useCallback(() => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    setVelocity({ x: 0, y: 0 });
    setCrawling(false);
  }, [setVelocity, setCrawling]);
  
  // Action button handlers
  const handleJump = useCallback(() => {
    jump();
  }, [jump]);
  
  const handleShootWeb = useCallback((e: React.TouchEvent) => {
    // Shoot web toward center-right of screen
    const screenCenter = {
      x: window.innerWidth * 0.7,
      y: window.innerHeight * 0.4,
    };
    shootWeb(screenCenter);
  }, [shootWeb]);
  
  const handleZip = useCallback(() => {
    // Zip toward where spider is facing
    const { position, direction } = gameState;
    const zipDistance = 200;
    
    let target = { ...position };
    switch (direction) {
      case 'right': target.x += zipDistance; break;
      case 'left': target.x -= zipDistance; break;
      case 'up': target.y -= zipDistance; break;
      case 'down': target.y += zipDistance; break;
    }
    
    zipTo(target);
  }, [gameState, zipTo]);
  
  // Render touch controls for mobile
  if (isTouchDevice) {
    return (
      <div className="fixed inset-0 pointer-events-none z-[100]">
        {/* Virtual Joystick - Left side */}
        <div
          ref={joystickRef}
          className="absolute bottom-8 left-8 w-32 h-32 pointer-events-auto"
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
        >
          {/* Joystick base */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(50, 70, 100, 0.6) 0%, rgba(30, 50, 80, 0.4) 100%)',
              border: '2px solid rgba(100, 140, 200, 0.3)',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
            }}
          />
          
          {/* Joystick thumb */}
          <div 
            className="absolute w-14 h-14 rounded-full transition-transform"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
              background: joystickActive 
                ? 'radial-gradient(circle, rgba(100, 160, 255, 0.9) 0%, rgba(60, 120, 220, 0.8) 100%)'
                : 'radial-gradient(circle, rgba(80, 120, 180, 0.8) 0%, rgba(50, 90, 150, 0.7) 100%)',
              border: '2px solid rgba(150, 190, 255, 0.5)',
              boxShadow: joystickActive 
                ? '0 0 20px rgba(100, 160, 255, 0.5)' 
                : '0 4px 10px rgba(0,0,0,0.3)',
            }}
          />
          
          {/* Direction indicators */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M50 15 L55 25 L45 25 Z" fill="rgba(200,220,255,0.5)" />
              <path d="M85 50 L75 55 L75 45 Z" fill="rgba(200,220,255,0.5)" />
              <path d="M50 85 L45 75 L55 75 Z" fill="rgba(200,220,255,0.5)" />
              <path d="M15 50 L25 45 L25 55 Z" fill="rgba(200,220,255,0.5)" />
            </svg>
          </div>
        </div>
        
        {/* Action Buttons - Right side */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-3 pointer-events-auto">
          {/* Jump button */}
          <button
            onTouchStart={handleJump}
            className="touch-control w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(80, 200, 120, 0.7) 0%, rgba(50, 160, 90, 0.6) 100%)',
              border: '2px solid rgba(120, 230, 160, 0.4)',
              boxShadow: '0 4px 15px rgba(80, 200, 120, 0.3)',
            }}
          >
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          
          {/* Shoot Web button */}
          <button
            onTouchStart={handleShootWeb}
            className="touch-control w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(100, 160, 255, 0.7) 0%, rgba(60, 120, 220, 0.6) 100%)',
              border: '2px solid rgba(140, 190, 255, 0.4)',
              boxShadow: '0 4px 15px rgba(100, 160, 255, 0.3)',
            }}
          >
            <span className="text-2xl">🕸️</span>
          </button>
          
          {/* Zip button */}
          <button
            onTouchStart={handleZip}
            className="touch-control w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(200, 100, 255, 0.7) 0%, rgba(160, 60, 220, 0.6) 100%)',
              border: '2px solid rgba(220, 140, 255, 0.4)',
              boxShadow: '0 4px 15px rgba(200, 100, 255, 0.3)',
            }}
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        
        {/* Touch hint overlay (first few seconds) */}
        <TouchHint />
      </div>
    );
  }
  
  // Stop propagation helper to prevent web shooting when clicking UI
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Desktop controls help
  return (
    <div 
      className="fixed bottom-4 right-4 z-50 game-ui"
      data-ui="true"
      onMouseDown={stopPropagation}
      onClick={stopPropagation}
    >
      {!isExpanded ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
          onMouseDown={stopPropagation}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: 'rgba(30, 50, 80, 0.8)',
            border: '1px solid rgba(100, 140, 200, 0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span className="text-gray-400 text-lg">?</span>
        </button>
      ) : (
        <div 
          className="rounded-xl p-4 w-56"
          onMouseDown={stopPropagation}
          onClick={stopPropagation}
          style={{
            background: 'linear-gradient(135deg, rgba(20, 35, 60, 0.95) 0%, rgba(15, 25, 45, 0.98) 100%)',
            border: '1px solid rgba(100, 140, 200, 0.2)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-gray-300 font-semibold text-sm">Controls</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              onMouseDown={stopPropagation}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <span className="text-gray-500 hover:text-white">×</span>
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            {[
              { key: 'WASD / ↑↓←→', action: 'Move' },
              { key: 'Space', action: 'Jump' },
              { key: 'Shift', action: 'Run' },
              { key: 'L-Click', action: 'Shoot Web' },
              { key: 'R-Click', action: 'Zip' },
              { key: 'Esc', action: 'Pause' },
            ].map((control, i) => (
              <div key={i} className="flex justify-between items-center">
                <span style={{ color: 'rgba(148, 163, 184, 0.7)' }}>{control.action}</span>
                <kbd 
                  className="px-2 py-0.5 rounded text-[10px] font-mono"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(200, 220, 255, 0.8)',
                  }}
                >
                  {control.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// Touch hint component for new mobile players
function TouchHint() {
  const [visible, setVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  useEffect(() => {
    // Check if user has played before
    const hasPlayed = localStorage.getItem('spiderTouchHintShown');
    if (hasPlayed) {
      setVisible(false);
      return;
    }
    
    const handleTouch = () => {
      setHasInteracted(true);
      setTimeout(() => setVisible(false), 500);
      localStorage.setItem('spiderTouchHintShown', 'true');
    };
    
    window.addEventListener('touchstart', handleTouch);
    
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      localStorage.setItem('spiderTouchHintShown', 'true');
    }, 5000);
    
    return () => {
      window.removeEventListener('touchstart', handleTouch);
      clearTimeout(timer);
    };
  }, []);
  
  if (!visible) return null;
  
  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${hasInteracted ? 'opacity-0' : 'opacity-100'}`}
    >
      <div 
        className="text-center p-6 rounded-2xl max-w-xs mx-4"
        style={{
          background: 'rgba(10, 20, 40, 0.9)',
          border: '1px solid rgba(100, 140, 200, 0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        <div className="text-3xl mb-3">🕷️</div>
        <div className="text-white font-semibold mb-2">Touch Controls</div>
        <div className="text-gray-400 text-sm space-y-1">
          <p>⬅️ Left joystick to move</p>
          <p>➡️ Right buttons for actions</p>
        </div>
        <div className="mt-4 text-gray-500 text-xs animate-pulse">
          Tap anywhere to start
        </div>
      </div>
    </div>
  );
}

export default Controls;
