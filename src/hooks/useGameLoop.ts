'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { GAME_CONFIG } from '@/lib/constants/gameConfig';

export function useGameLoop() {
  const gamePhase = useGameStore((state) => state.gameState.gamePhase);
  const difficulty = useGameStore((state) => state.gameState.difficulty);
  const tick = useGameStore((state) => state.tick);
  const spawnPrey = useGameStore((state) => state.spawnPrey);
  const setDimensions = useGameStore((state) => state.setDimensions);
  
  const frameRef = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setDimensions]);
  
  // Main game loop
  useEffect(() => {
    if (gamePhase !== 'playing') {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      return;
    }
    
    let lastTime = performance.now();
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;
    
    const loop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameTime) {
        // Run game tick
        tick();
        
        // Spawn prey at intervals based on difficulty
        const spawnInterval = Math.max(
          GAME_CONFIG.prey.minSpawnRate,
          GAME_CONFIG.prey.baseSpawnRate / (1 + (difficulty - 1) * GAME_CONFIG.difficulty.spawnRateBonus)
        );
        
        if (currentTime - lastSpawnTime.current >= spawnInterval) {
          spawnPrey();
          lastSpawnTime.current = currentTime;
        }
        
        lastTime = currentTime - (deltaTime % frameTime);
      }
      
      frameRef.current = requestAnimationFrame(loop);
    };
    
    frameRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [gamePhase, difficulty, tick, spawnPrey]);
}

export function useControls() {
  const gamePhase = useGameStore((state) => state.gameState.gamePhase);
  const gameState = useGameStore((state) => state.gameState);
  const setVelocity = useGameStore((state) => state.setVelocity);
  const setDirection = useGameStore((state) => state.setDirection);
  const setCrawling = useGameStore((state) => state.setCrawling);
  const jump = useGameStore((state) => state.jump);
  const doubleJump = useGameStore((state) => state.doubleJump);
  const shootWeb = useGameStore((state) => state.shootWeb);
  const zipTo = useGameStore((state) => state.zipTo);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const setMousePosition = useGameStore((state) => state.setMousePosition);
  const activePowerUps = useGameStore((state) => state.gameState.activePowerUps);

  const keysPressed = useRef<Set<string>>(new Set());
  const targetVelocity = useRef({ x: 0, y: 0 });

  // Calculate speed with power-up bonus
  const getSpeed = useCallback((isRunning: boolean) => {
    const hasSpeedBoost = activePowerUps.some((p) => p.type === 'speed');
    const baseSpeed = isRunning ? GAME_CONFIG.spider.runSpeed : GAME_CONFIG.spider.baseSpeed;
    return hasSpeedBoost ? baseSpeed * GAME_CONFIG.powerUp.effects.speed : baseSpeed;
  }, [activePowerUps]);

  // Momentum-based movement - smoothly interpolate toward target velocity
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const updateMovement = () => {
      const currentVelocity = useGameStore.getState().gameState.velocity;
      const isJumping = useGameStore.getState().gameState.isJumping;
      const acceleration = GAME_CONFIG.movement.acceleration;
      const deceleration = GAME_CONFIG.movement.deceleration;
      const airControl = isJumping ? GAME_CONFIG.movement.airControl : 1;

      // Smoothly interpolate X velocity (momentum-based)
      let newVelX = currentVelocity.x;
      if (targetVelocity.current.x !== 0) {
        // Accelerate toward target
        const diff = targetVelocity.current.x - currentVelocity.x;
        newVelX += diff * acceleration * airControl;
      } else {
        // Decelerate when no input
        newVelX *= deceleration;
        if (Math.abs(newVelX) < 0.1) newVelX = 0;
      }

      // Only update if changed significantly
      if (Math.abs(newVelX - currentVelocity.x) > 0.01) {
        setVelocity({ x: newVelX });
      }
    };

    const interval = setInterval(updateMovement, 16);
    return () => clearInterval(interval);
  }, [gamePhase, setVelocity]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gamePhase !== 'playing' && e.key !== 'Escape') return;

      const wasPressed = keysPressed.current.has(e.key);
      keysPressed.current.add(e.key);
      const speed = getSpeed(e.shiftKey);

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          targetVelocity.current.y = -speed;
          setDirection('up');
          setCrawling(true);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          targetVelocity.current.y = speed;
          setDirection('down');
          setCrawling(true);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          targetVelocity.current.x = -speed;
          setDirection('left');
          setCrawling(true);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          targetVelocity.current.x = speed;
          setDirection('right');
          setCrawling(true);
          break;
        case ' ':
          e.preventDefault();
          // Double jump if already jumping and can double jump
          if (!wasPressed) {
            const state = useGameStore.getState().gameState;
            if (state.isJumping && state.canDoubleJump) {
              doubleJump();
            } else if (!state.isJumping) {
              jump();
            }
          }
          break;
        case 'Escape':
          if (gamePhase === 'playing') {
            pauseGame();
          } else if (gamePhase === 'paused') {
            resumeGame();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gamePhase !== 'playing') return;

      keysPressed.current.delete(e.key);

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'w':
        case 'W':
        case 's':
        case 'S':
          if (!keysPressed.current.has('ArrowUp') &&
              !keysPressed.current.has('ArrowDown') &&
              !keysPressed.current.has('w') &&
              !keysPressed.current.has('W') &&
              !keysPressed.current.has('s') &&
              !keysPressed.current.has('S')) {
            targetVelocity.current.y = 0;
            setVelocity({ y: 0 });
          }
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'a':
        case 'A':
        case 'd':
        case 'D':
          if (!keysPressed.current.has('ArrowLeft') &&
              !keysPressed.current.has('ArrowRight') &&
              !keysPressed.current.has('a') &&
              !keysPressed.current.has('A') &&
              !keysPressed.current.has('d') &&
              !keysPressed.current.has('D')) {
            targetVelocity.current.x = 0;
          }
          break;
      }

      if (keysPressed.current.size === 0) {
        setCrawling(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gamePhase, getSpeed, setVelocity, setDirection, setCrawling, jump, doubleJump, pauseGame, resumeGame]);
  
  // Mouse controls
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    // Check if click is on a UI element that should block web shooting
    const isUIElement = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;
      
      // Check if the target or any parent is a UI element
      let element: HTMLElement | null = target;
      while (element) {
        // Check for common UI indicators
        const tagName = element.tagName.toLowerCase();
        if (
          tagName === 'button' ||
          tagName === 'input' ||
          tagName === 'select' ||
          tagName === 'textarea' ||
          element.hasAttribute('data-ui') ||
          element.classList.contains('pointer-events-auto') ||
          element.classList.contains('game-ui') ||
          element.classList.contains('glass-panel') ||
          element.classList.contains('glass-panel-light') ||
          element.getAttribute('role') === 'button' ||
          element.getAttribute('role') === 'dialog' ||
          // Check if clickable (has click handler indicator)
          element.style.cursor === 'pointer' ||
          window.getComputedStyle(element).cursor === 'pointer'
        ) {
          return true;
        }
        element = element.parentElement;
      }
      return false;
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      if (gamePhase !== 'playing') return;
      
      // Skip if clicking on UI elements
      if (isUIElement(e.target)) return;
      
      // Right click or Shift+Click for Zip
      if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
        e.preventDefault();
        zipTo({ x: e.clientX, y: e.clientY });
        return;
      }
      
      // Left click for Web Shot
      if (e.button === 0) {
        shootWeb({ x: e.clientX, y: e.clientY });
      }
    };
    
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gamePhase, setMousePosition, shootWeb, zipTo]);
}


