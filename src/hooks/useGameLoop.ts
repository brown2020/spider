'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { GAME_CONFIG } from '@/lib/constants/gameConfig';
import { axesFromKeys, isShiftHeld } from '@/lib/inputAxes';

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
        
        // Spawn prey at intervals based on difficulty. Slow-mo lengthens the interval.
        const slowScale = useGameStore
          .getState()
          .gameState.activePowerUps.some((powerUp) => powerUp.type === 'slowTime')
          ? GAME_CONFIG.powerUp.effects.slowTime
          : 1;
        const spawnInterval =
          Math.max(
            GAME_CONFIG.prey.minSpawnRate,
            GAME_CONFIG.prey.baseSpawnRate / (1 + (difficulty - 1) * GAME_CONFIG.difficulty.spawnRateBonus)
          ) / (slowScale > 0 ? slowScale : 1);
        
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
  const setDirection = useGameStore((state) => state.setDirection);
  const setCrawling = useGameStore((state) => state.setCrawling);
  const jump = useGameStore((state) => state.jump);
  const doubleJump = useGameStore((state) => state.doubleJump);
  const shootWeb = useGameStore((state) => state.shootWeb);
  const zipTo = useGameStore((state) => state.zipTo);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const setMousePosition = useGameStore((state) => state.setMousePosition);
  const setInputAxes = useGameStore((state) => state.setInputAxes);

  const keysPressed = useRef<Set<string>>(new Set());

  const publishAxes = useCallback((running: boolean) => {
    const speed = running ? GAME_CONFIG.spider.runSpeed : GAME_CONFIG.spider.baseSpeed;
    const axes = axesFromKeys(keysPressed.current, speed);
    setInputAxes(axes);
    if (axes.x === 0 && axes.y === 0) {
      setCrawling(false);
      return;
    }
    setCrawling(true);
    if (Math.abs(axes.x) >= Math.abs(axes.y)) {
      setDirection(axes.x >= 0 ? 'right' : 'left');
    } else {
      setDirection(axes.y > 0 ? 'down' : 'up');
    }
  }, [setCrawling, setDirection, setInputAxes]);

  // Drop held keys when the round is no longer live so resume does not keep moving.
  useEffect(() => {
    if (gamePhase === 'playing') return;
    keysPressed.current.clear();
    setInputAxes({ x: 0, y: 0 });
    setCrawling(false);
  }, [gamePhase, setCrawling, setInputAxes]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gamePhase === 'playing') pauseGame();
        else if (gamePhase === 'paused') resumeGame();
        return;
      }
      if (gamePhase !== 'playing') return;

      const wasPressed = keysPressed.current.has(e.key);
      keysPressed.current.add(e.key);

      if (e.key === ' ') {
        e.preventDefault();
        if (!wasPressed) {
          const state = useGameStore.getState().gameState;
          if (state.isJumping && state.canDoubleJump) {
            doubleJump();
          } else if (!state.isJumping) {
            jump();
          }
        }
        return;
      }

      publishAxes(isShiftHeld(keysPressed.current));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
      if (gamePhase !== 'playing') return;
      publishAxes(isShiftHeld(keysPressed.current));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gamePhase, publishAxes, jump, doubleJump, pauseGame, resumeGame]);
  
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


