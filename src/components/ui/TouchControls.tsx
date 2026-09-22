"use client";

import { memo, useState, useRef, useCallback, useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";
import { TouchHint } from "./TouchHint";

export const TouchControls = memo(function TouchControls() {
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
    window.addEventListener("resize", updateCenter);
    return () => window.removeEventListener("resize", updateCenter);
  }, []);

  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setJoystickActive(true);
    const rect = joystickRef.current?.getBoundingClientRect();
    if (rect) {
      joystickCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  }, []);

  const handleJoystickMove = useCallback(
    (e: React.TouchEvent) => {
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
      const normalizedX = x / maxRadius;
      const normalizedY = y / maxRadius;
      const speed = GAME_CONFIG.spider.baseSpeed;
      if (Math.abs(normalizedX) > 0.1 || Math.abs(normalizedY) > 0.1) {
        setVelocity({ x: normalizedX * speed, y: normalizedY * speed });
        setCrawling(true);
        if (Math.abs(normalizedX) > Math.abs(normalizedY)) {
          setDirection(normalizedX > 0 ? "right" : "left");
        } else {
          setDirection(normalizedY > 0 ? "down" : "up");
        }
      }
    },
    [joystickActive, setVelocity, setCrawling, setDirection]
  );

  const handleJoystickEnd = useCallback(() => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    setVelocity({ x: 0, y: 0 });
    setCrawling(false);
  }, [setVelocity, setCrawling]);

  const handleJump = useCallback(() => {
    jump();
  }, [jump]);

  const handleShootWeb = useCallback(() => {
    shootWeb({
      x: window.innerWidth * 0.7,
      y: window.innerHeight * 0.4,
    });
  }, [shootWeb]);

  const handleZip = useCallback(() => {
    const { position, direction } = gameState;
    const zipDistance = 200;
    const offsets: Record<string, { x: number; y: number }> = {
      right: { x: zipDistance, y: 0 },
      left: { x: -zipDistance, y: 0 },
      up: { x: 0, y: -zipDistance },
      down: { x: 0, y: zipDistance },
    };
    const offset = offsets[direction] ?? { x: 0, y: 0 };
    zipTo({ x: position.x + offset.x, y: position.y + offset.y });
  }, [gameState, zipTo]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <div
        ref={joystickRef}
        className="absolute bottom-8 left-8 w-32 h-32 pointer-events-auto"
        role="application"
        aria-label="Movement joystick"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(50, 70, 100, 0.6) 0%, rgba(30, 50, 80, 0.4) 100%)",
            border: "2px solid rgba(100, 140, 200, 0.3)",
            boxShadow: "inset 0 2px 10px rgba(0,0,0,0.3)",
          }}
        />
        <div
          className="absolute w-14 h-14 rounded-full transition-transform"
          style={{
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
            background: joystickActive
              ? "radial-gradient(circle, rgba(100, 160, 255, 0.9) 0%, rgba(60, 120, 220, 0.8) 100%)"
              : "radial-gradient(circle, rgba(80, 120, 180, 0.8) 0%, rgba(50, 90, 150, 0.7) 100%)",
            border: "2px solid rgba(150, 190, 255, 0.5)",
            boxShadow: joystickActive
              ? "0 0 20px rgba(100, 160, 255, 0.5)"
              : "0 4px 10px rgba(0,0,0,0.3)",
          }}
        />
      </div>

      <div className="absolute bottom-8 right-8 flex flex-col gap-3 pointer-events-auto">
        <button
          type="button"
          aria-label="Jump"
          onTouchStart={handleJump}
          className="touch-control w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle, rgba(80, 200, 120, 0.7) 0%, rgba(50, 160, 90, 0.6) 100%)",
            border: "2px solid rgba(120, 230, 160, 0.4)",
            boxShadow: "0 4px 15px rgba(80, 200, 120, 0.3)",
          }}
        >
          <svg
            className="w-8 h-8 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              d="M12 19V5M5 12l7-7 7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Shoot web"
          onTouchStart={handleShootWeb}
          className="touch-control w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle, rgba(100, 160, 255, 0.7) 0%, rgba(60, 120, 220, 0.6) 100%)",
            border: "2px solid rgba(140, 190, 255, 0.4)",
            boxShadow: "0 4px 15px rgba(100, 160, 255, 0.3)",
          }}
        >
          <span className="text-2xl" aria-hidden="true">
            🕸️
          </span>
        </button>
        <button
          type="button"
          aria-label="Zip"
          onTouchStart={handleZip}
          className="touch-control w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle, rgba(200, 100, 255, 0.7) 0%, rgba(160, 60, 220, 0.6) 100%)",
            border: "2px solid rgba(220, 140, 255, 0.4)",
            boxShadow: "0 4px 15px rgba(200, 100, 255, 0.3)",
          }}
        >
          <svg
            className="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <TouchHint />
    </div>
  );
});
