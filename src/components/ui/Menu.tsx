"use client";

import { memo, useEffect, useState, useMemo } from "react";
import { GameState } from "@/lib/types/game";

// Pre-generated floating particles data for stable rendering
interface FloatingParticleData {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

const FLOATING_PARTICLES: FloatingParticleData[] = Array.from(
  { length: 30 },
  (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: 5 + Math.random() * 10,
    delay: Math.random() * 5,
  })
);

const FloatingParticles = memo(function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {FLOATING_PARTICLES.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: "rgba(200, 220, 255, 0.3)",
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
});

interface MenuProps {
  gameState: GameState;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}

// Generate web strand SVG paths
function generateWebStrands(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const x2 = 50 + Math.cos(angle) * 45;
    const y2 = 50 + Math.sin(angle) * 45;
    return { angle, x2, y2, delay: i * 0.1 };
  });
}

// Generate spiral web rings
function generateWebRings(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    radius: 8 + i * 8,
    delay: i * 0.15,
    opacity: 0.3 - i * 0.03,
  }));
}

const Menu = memo(function Menu({
  gameState,
  onStart,
  onResume,
  onRestart,
}: MenuProps) {
  const { gamePhase, score, highScore } = gameState;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [spiderPos, setSpiderPos] = useState({ x: 50, y: 30 });

  // Animated spider following a gentle path
  useEffect(() => {
    if (gamePhase !== "menu") return;

    let frame: number;
    let time = 0;

    const animate = () => {
      time += 0.02;
      setSpiderPos({
        x: 50 + Math.sin(time * 0.5) * 15,
        y: 25 + Math.sin(time * 0.7) * 8,
      });
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [gamePhase]);

  // Track mouse for subtle parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const webStrands = useMemo(() => generateWebStrands(16), []);
  const webRings = useMemo(() => generateWebRings(6), []);

  if (gamePhase === "playing") return null;

  const isNewHighScore =
    gamePhase === "gameOver" && score === highScore && score > 0;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center overflow-hidden">
      {/* Animated background with depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(20, 40, 80, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(60, 20, 60, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at center, rgba(5, 10, 20, 0.85) 0%, rgba(0, 0, 0, 0.98) 100%)
          `,
        }}
      />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Main web pattern with parallax */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-[120vmin] h-[120vmin] opacity-20"
          style={{ filter: "drop-shadow(0 0 10px rgba(200, 220, 255, 0.3))" }}
        >
          {/* Radial strands */}
          {webStrands.map((strand, i) => (
            <line
              key={`strand-${i}`}
              x1="50"
              y1="50"
              x2={strand.x2}
              y2={strand.y2}
              stroke="url(#webGradient)"
              strokeWidth="0.15"
              className="web-strand-anim"
              style={{
                animationDelay: `${strand.delay}s`,
                opacity: 0.6,
              }}
            />
          ))}

          {/* Spiral rings */}
          {webRings.map((ring, i) => (
            <circle
              key={`ring-${i}`}
              cx="50"
              cy="50"
              r={ring.radius}
              fill="none"
              stroke="rgba(200, 220, 255, 0.4)"
              strokeWidth="0.1"
              className="web-ring-anim"
              style={{
                animationDelay: `${ring.delay}s`,
                opacity: ring.opacity,
              }}
            />
          ))}

          <defs>
            <linearGradient id="webGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(200, 220, 255, 0.8)" />
              <stop offset="100%" stopColor="rgba(200, 220, 255, 0.1)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Animated spider on web (menu only) */}
      {gamePhase === "menu" && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            left: `${spiderPos.x}%`,
            top: `${spiderPos.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Silk thread from top */}
          <div
            className="absolute left-1/2 bottom-full w-px h-[200px] -translate-x-1/2"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(200, 220, 255, 0.6))",
            }}
          />

          {/* Spider body */}
          <div className="relative spider-menu-bob">
            {/* Legs */}
            {[-1, 1].map((side) => (
              <div
                key={side}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: side === -1 ? "-20px" : "20px" }}
              >
                {[0, 1, 2, 3].map((leg) => (
                  <div
                    key={leg}
                    className="absolute h-px bg-gradient-to-r"
                    style={{
                      width: 16 + leg * 2,
                      top: (leg - 1.5) * 6,
                      left: side === -1 ? "auto" : 0,
                      right: side === -1 ? 0 : "auto",
                      background:
                        side === -1
                          ? "linear-gradient(to left, #1a1a2e, #4a4a6a)"
                          : "linear-gradient(to right, #1a1a2e, #4a4a6a)",
                      transform: `rotate(${(leg - 1.5) * 15 * side}deg)`,
                      transformOrigin: side === -1 ? "right" : "left",
                      animation: `spider-leg-wave 0.8s ease-in-out infinite`,
                      animationDelay: `${leg * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            ))}

            {/* Body */}
            <div
              className="w-8 h-10 rounded-full relative"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 30%, #3a3a5a 0%, #1a1a2e 60%, #0a0a1e 100%)",
                boxShadow:
                  "0 4px 20px rgba(0,0,0,0.5), inset 0 -2px 10px rgba(0,0,0,0.3)",
              }}
            >
              {/* Eyes */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
                {[0, 1].map((eye) => (
                  <div
                    key={eye}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, #88ccff 0%, #4488cc 50%, #224466 100%)",
                      boxShadow: "0 0 8px rgba(100, 180, 255, 0.6)",
                    }}
                  />
                ))}
              </div>
              {/* Smaller eyes row */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-0.5">
                {[0, 1, 2, 3].map((eye) => (
                  <div
                    key={eye}
                    className="w-1 h-1 rounded-full bg-blue-400/50"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content card */}
      <div
        className="relative z-20 max-w-md w-full mx-4"
        style={{ animation: "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Decorative corner webs */}
        <svg
          className="absolute -top-8 -left-8 w-16 h-16 opacity-40"
          viewBox="0 0 40 40"
        >
          <path
            d="M0,40 Q20,20 40,0"
            fill="none"
            stroke="rgba(200,220,255,0.6)"
            strokeWidth="0.5"
          />
          <path
            d="M0,30 Q15,15 30,0"
            fill="none"
            stroke="rgba(200,220,255,0.4)"
            strokeWidth="0.3"
          />
          <path
            d="M0,20 Q10,10 20,0"
            fill="none"
            stroke="rgba(200,220,255,0.3)"
            strokeWidth="0.2"
          />
        </svg>
        <svg
          className="absolute -top-8 -right-8 w-16 h-16 opacity-40 scale-x-[-1]"
          viewBox="0 0 40 40"
        >
          <path
            d="M0,40 Q20,20 40,0"
            fill="none"
            stroke="rgba(200,220,255,0.6)"
            strokeWidth="0.5"
          />
          <path
            d="M0,30 Q15,15 30,0"
            fill="none"
            stroke="rgba(200,220,255,0.4)"
            strokeWidth="0.3"
          />
          <path
            d="M0,20 Q10,10 20,0"
            fill="none"
            stroke="rgba(200,220,255,0.3)"
            strokeWidth="0.2"
          />
        </svg>

        {/* Glass card */}
        <div
          className="rounded-2xl p-8 backdrop-blur-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 25, 45, 0.9) 0%, rgba(10, 18, 35, 0.95) 100%)",
            border: "1px solid rgba(100, 140, 200, 0.15)",
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.5),
              0 0 100px rgba(100, 140, 200, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
          }}
        >
          {/* Title - Menu */}
          {gamePhase === "menu" && (
            <div className="text-center mb-8">
              <h1
                className="text-6xl font-black tracking-tighter mb-2"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  background:
                    "linear-gradient(135deg, #e8f0ff 0%, #8eb8ff 50%, #c8d8f0 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 4px 20px rgba(100, 140, 200, 0.3))",
                  letterSpacing: "-0.05em",
                }}
              >
                SPIDER
              </h1>
              <p
                className="text-sm tracking-[0.3em] uppercase"
                style={{ color: "rgba(148, 180, 220, 0.7)" }}
              >
                Hunt • Weave • Survive
              </p>
            </div>
          )}

          {/* Title - Paused */}
          {gamePhase === "paused" && (
            <div className="text-center mb-6">
              <h2
                className="text-4xl font-bold"
                style={{ color: "rgba(200, 220, 255, 0.9)" }}
              >
                Paused
              </h2>
              <div className="mt-2 flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: "rgba(100, 140, 200, 0.6)",
                      animation: "pulse 1.5s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Title - Game Over */}
          {gamePhase === "gameOver" && (
            <div className="text-center mb-6">
              <h2
                className="text-4xl font-bold mb-4"
                style={{ color: "rgba(200, 220, 255, 0.9)" }}
              >
                Game Over
              </h2>

              <div className="relative inline-block">
                <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                  Final Score
                </div>
                <div
                  className={`text-6xl font-black tabular-nums ${
                    isNewHighScore ? "animate-pulse" : ""
                  }`}
                  style={{
                    color: isNewHighScore ? "#fbbf24" : "#fff",
                    textShadow: isNewHighScore
                      ? "0 0 30px rgba(251, 191, 36, 0.5), 0 0 60px rgba(251, 191, 36, 0.3)"
                      : "0 4px 20px rgba(0,0,0,0.5)",
                  }}
                >
                  {score.toLocaleString()}
                </div>

                {isNewHighScore && (
                  <div
                    className="mt-3 inline-flex items-center gap-2 px-4 py-1 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)",
                      border: "1px solid rgba(251, 191, 36, 0.3)",
                    }}
                  >
                    <span className="text-yellow-400">★</span>
                    <span className="text-yellow-400 text-sm font-semibold">
                      New High Score!
                    </span>
                    <span className="text-yellow-400">★</span>
                  </div>
                )}

                {!isNewHighScore && highScore > 0 && (
                  <div className="mt-2 text-gray-500 text-sm">
                    Best:{" "}
                    <span className="text-yellow-400/70">
                      {highScore.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            {gamePhase === "menu" && (
              <button
                onClick={onStart}
                className="group relative w-full py-4 px-6 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.9) 100%)",
                  border: "1px solid rgba(147, 197, 253, 0.3)",
                  boxShadow:
                    "0 8px 30px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>Start Hunting</span>
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(96, 165, 250, 0.9) 0%, rgba(59, 130, 246, 1) 100%)",
                  }}
                />
              </button>
            )}

            {gamePhase === "paused" && (
              <>
                <button
                  onClick={onResume}
                  className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.9) 100%)",
                    border: "1px solid rgba(147, 197, 253, 0.3)",
                    boxShadow: "0 8px 30px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  Resume
                </button>
                <button
                  onClick={onRestart}
                  className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:bg-white/10"
                  style={{
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    color: "rgba(200, 220, 255, 0.8)",
                  }}
                >
                  Restart
                </button>
              </>
            )}

            {gamePhase === "gameOver" && (
              <button
                onClick={onRestart}
                className="group relative w-full py-4 px-6 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.9) 100%)",
                  border: "1px solid rgba(147, 197, 253, 0.3)",
                  boxShadow: "0 8px 30px rgba(59, 130, 246, 0.3)",
                }}
              >
                <span className="relative z-10">Play Again</span>
              </button>
            )}
          </div>

          {/* Controls hint */}
          {(gamePhase === "menu" || gamePhase === "paused") && (
            <div className="mt-8 pt-6 border-t border-white/5">
              <h3
                className="text-center text-sm font-semibold mb-4"
                style={{ color: "rgba(148, 180, 220, 0.7)" }}
              >
                Controls
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { keys: ["W", "A", "S", "D"], label: "Move" },
                  { keys: ["Space"], label: "Jump" },
                  { keys: ["Click"], label: "Shoot Web" },
                  { keys: ["Right Click"], label: "Zip" },
                  { keys: ["Shift"], label: "Run" },
                  { keys: ["Esc"], label: "Pause" },
                ].map((control, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {control.keys.map((key, j) => (
                        <kbd
                          key={j}
                          className="px-2 py-1 rounded text-[10px] font-mono"
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "rgba(200, 220, 255, 0.8)",
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                    <span style={{ color: "rgba(148, 163, 184, 0.6)" }}>
                      {control.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tip for game over */}
          {gamePhase === "gameOver" && (
            <div className="mt-6 text-center">
              <p
                className="text-xs"
                style={{ color: "rgba(148, 163, 184, 0.5)" }}
              >
                💡 Chain catches quickly for combo multipliers!
              </p>
            </div>
          )}

          {/* High score display on menu */}
          {gamePhase === "menu" && highScore > 0 && (
            <div className="mt-6 text-center">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: "rgba(251, 191, 36, 0.1)",
                  border: "1px solid rgba(251, 191, 36, 0.2)",
                }}
              >
                <span className="text-yellow-500">🏆</span>
                <span
                  className="text-sm"
                  style={{ color: "rgba(251, 191, 36, 0.8)" }}
                >
                  High Score:{" "}
                  <span className="font-bold">
                    {highScore.toLocaleString()}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Menu;
