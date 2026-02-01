"use client";

import { memo, useState, useEffect, useCallback, useRef } from "react";
import { GameState, ActivePowerUp } from "@/lib/types/game";
import { GAME_CONFIG, POWER_UP_CONFIG } from "@/lib/constants/gameConfig";
import { soundManager, playSound } from "@/lib/utils/sound";
import { useGameStore } from "@/stores/gameStore";

// Animated score counter hook
function useAnimatedScore(targetScore: number, duration: number = 300) {
  const [displayScore, setDisplayScore] = useState(targetScore);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startScoreRef = useRef<number>(targetScore);

  useEffect(() => {
    if (targetScore === displayScore) return;

    startTimeRef.current = performance.now();
    startScoreRef.current = displayScore;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.floor(
        startScoreRef.current + (targetScore - startScoreRef.current) * easeProgress
      );

      setDisplayScore(currentScore);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetScore, duration, displayScore]);

  return displayScore;
}

interface HUDProps {
  gameState: GameState;
}

const HUD = memo(function HUD({ gameState }: HUDProps) {
  const { score, highScore, webEnergy, combo, difficulty, activePowerUps } =
    gameState;
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scoreFlash, setScoreFlash] = useState(false);
  const prevScoreRef = useRef(score);

  // Animated score display
  const displayScore = useAnimatedScore(score);

  // Initialize sound state
  useEffect(() => {
    setSoundEnabled(soundManager.isEnabled());
  }, []);

  // Flash effect when score increases
  useEffect(() => {
    if (score > prevScoreRef.current) {
      setScoreFlash(true);
      const timer = setTimeout(() => setScoreFlash(false), 200);
      prevScoreRef.current = score;
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = score;
  }, [score]);

  const toggleSound = useCallback(() => {
    const newState = soundManager.toggle();
    setSoundEnabled(newState);
    if (newState) {
      playSound("menuClick");
    }
  }, []);

  const energyPercent = (webEnergy / GAME_CONFIG.web.energy.max) * 100;
  const isLowEnergy = energyPercent < 25;
  const canShoot = webEnergy >= GAME_CONFIG.web.energy.shootCost;

  // Format large numbers
  const formatScore = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="fixed top-0 left-0 right-0 p-4 z-50 game-ui pointer-events-none">
      <div className="flex justify-between items-start max-w-screen-xl mx-auto">
        {/* Left side - Score and Energy */}
        <div className="flex flex-col gap-3">
          {/* Score Display */}
          <div className="glass-panel rounded-lg px-4 py-3 pointer-events-auto">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Score
            </div>
            <div
              className={`text-3xl font-bold score-value text-white transition-all duration-100 ${
                scoreFlash ? "scale-110 text-yellow-300" : ""
              }`}
              style={{
                textShadow: scoreFlash
                  ? "0 0 20px rgba(255, 215, 0, 0.8)"
                  : undefined,
              }}
            >
              {formatScore(displayScore)}
            </div>
            {score > 0 && score === highScore && (
              <div className="text-xs text-yellow-400 mt-1 high-score-new">
                ★ NEW HIGH SCORE
              </div>
            )}
            {score > 0 && score < highScore && (
              <div className="text-xs text-gray-500 mt-1">
                Best: {formatScore(highScore)}
              </div>
            )}
          </div>

          {/* Web Energy */}
          <div className="glass-panel rounded-lg px-4 py-3 pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">
                Web Energy
              </span>
              <span
                className={`text-xs font-mono ${
                  isLowEnergy ? "text-red-400" : "text-blue-400"
                }`}
              >
                {Math.floor(energyPercent)}%
              </span>
            </div>
            <div className="w-36 h-2.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  isLowEnergy ? "energy-bar-low" : "energy-bar"
                }`}
                style={{ width: `${energyPercent}%` }}
              />
            </div>
            {!canShoot && (
              <div className="text-xs text-red-400 mt-1 animate-pulse">
                Recharging...
              </div>
            )}
          </div>

          {/* Active Power-ups */}
          {activePowerUps.length > 0 && (
            <div className="glass-panel rounded-lg px-4 py-3 pointer-events-auto">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                Active
              </div>
              <div className="flex gap-2">
                {activePowerUps.map((powerUp) => (
                  <PowerUpIndicator key={powerUp.type} powerUp={powerUp} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center - Combo Display */}
        {combo > 1 && (
          <div className="absolute left-1/2 top-6 -translate-x-1/2">
            <div
              className="combo-display text-center"
              style={{ color: `hsl(${40 + combo * 5}, 100%, 55%)` }}
            >
              <div className="text-4xl font-black">x{combo}</div>
              <div className="text-sm uppercase tracking-widest">Combo</div>
            </div>
          </div>
        )}

        {/* Right side - Difficulty and Sound */}
        <div className="flex flex-col gap-3">
          <div className="glass-panel rounded-lg px-4 py-3 pointer-events-auto">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Difficulty
            </div>
            <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full difficulty-bar rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    ((difficulty - 1) /
                      (GAME_CONFIG.difficulty.maxMultiplier - 1)) *
                      100
                  )}%`,
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right font-mono">
              {difficulty.toFixed(2)}x
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSound();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="glass-panel rounded-lg px-4 py-2 pointer-events-auto flex items-center justify-between gap-3 transition-all hover:bg-white/5"
          >
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              Sound
            </span>
            <span className="text-lg">{soundEnabled ? "🔊" : "🔇"}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

interface PowerUpIndicatorProps {
  powerUp: ActivePowerUp;
}

function PowerUpIndicator({ powerUp }: PowerUpIndicatorProps) {
  const config = POWER_UP_CONFIG[powerUp.type];
  const frameTime = useGameStore((state) => state.frameTime);
  const remaining = Math.max(0, powerUp.expiresAt - frameTime);
  const progress = remaining / GAME_CONFIG.powerUp.duration;

  return (
    <div
      className="relative w-10 h-10 rounded-lg flex items-center justify-center"
      style={{
        backgroundColor: `${config.color}30`,
        border: `2px solid ${config.color}`,
        boxShadow: `0 0 10px ${config.color}50`,
      }}
    >
      <span className="text-lg">{config.icon}</span>

      {/* Timer ring */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 36 36"
      >
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke={config.color}
          strokeWidth="2"
          strokeDasharray={`${progress * 100} 100`}
          className="transition-all duration-100"
        />
      </svg>
    </div>
  );
}

export default HUD;
