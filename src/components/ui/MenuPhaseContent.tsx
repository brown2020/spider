"use client";

import { memo } from "react";
import { GameState } from "@/lib/types/game";
import { MenuControlsHint } from "./MenuControlsHint";

const btnPrimary =
  "group relative w-full py-4 px-6 rounded-xl font-bold text-lg overflow-hidden transition-[transform,opacity] duration-300 hover:scale-[1.02] active:scale-[0.98]";
const btnPrimaryStyle = {
  background:
    "linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.9) 100%)",
  border: "1px solid rgba(147, 197, 253, 0.3)",
  boxShadow: "0 8px 30px rgba(59, 130, 246, 0.3)",
} as const;

export const MenuTitle = memo(function MenuTitle({
  gamePhase,
  score,
  highScore,
}: {
  gamePhase: GameState["gamePhase"];
  score: number;
  highScore: number;
}) {
  if (gamePhase === "menu") {
    return (
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
    );
  }
  if (gamePhase === "paused") {
    return (
      <div className="text-center mb-6">
        <h2
          className="text-4xl font-bold"
          style={{ color: "rgba(200, 220, 255, 0.9)" }}
        >
          Paused
        </h2>
      </div>
    );
  }
  if (gamePhase === "gameOver") {
    const isNewHighScore = score === highScore && score > 0;
    return (
      <div className="text-center mb-6">
        <h2
          className="text-4xl font-bold mb-4"
          style={{ color: "rgba(200, 220, 255, 0.9)" }}
        >
          Game Over
        </h2>
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
              ? "0 0 30px rgba(251, 191, 36, 0.5)"
              : "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {score.toLocaleString()}
        </div>
        {isNewHighScore && (
          <div className="mt-3 text-yellow-400 text-sm font-semibold">
            ★ New High Score!
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
    );
  }
  return null;
});

export const MenuActions = memo(function MenuActions({
  gamePhase,
  onStart,
  onResume,
  onRestart,
}: {
  gamePhase: GameState["gamePhase"];
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="space-y-3">
      {gamePhase === "menu" && (
        <button
          type="button"
          onClick={onStart}
          className={btnPrimary}
          style={btnPrimaryStyle}
        >
          Start Hunting
        </button>
      )}
      {gamePhase === "paused" && (
        <>
          <button
            type="button"
            onClick={onResume}
            className={btnPrimary}
            style={btnPrimaryStyle}
          >
            Resume
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 px-6 rounded-xl font-semibold transition-colors duration-300 hover:bg-white/10"
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
          type="button"
          onClick={onRestart}
          className={btnPrimary}
          style={btnPrimaryStyle}
        >
          Play Again
        </button>
      )}
    </div>
  );
});

export const MenuFooter = memo(function MenuFooter({
  gamePhase,
  highScore,
}: {
  gamePhase: GameState["gamePhase"];
  highScore: number;
}) {
  return (
    <>
      {(gamePhase === "menu" || gamePhase === "paused") && <MenuControlsHint />}
      {gamePhase === "gameOver" && (
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: "rgba(148, 163, 184, 0.5)" }}>
            Chain catches quickly for combo multipliers!
          </p>
        </div>
      )}
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
              <span className="font-bold">{highScore.toLocaleString()}</span>
            </span>
          </div>
        </div>
      )}
    </>
  );
});
