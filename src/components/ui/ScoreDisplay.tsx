// components/ui/ScoreDisplay.tsx
"use client";

import React from "react";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";

interface ScoreDisplayProps {
  score: number;
  webEnergy: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, webEnergy }) => {
  return (
    <div className="fixed top-4 left-4 z-50">
      {/* Score */}
      <div className="bg-gray-800 bg-opacity-75 text-white px-4 py-2 rounded-sm mb-2">
        <div className="text-sm opacity-75">Score</div>
        <div className="text-2xl font-bold">{score}</div>
      </div>

      {/* Web Energy Bar */}
      <div className="bg-gray-800 bg-opacity-75 p-2 rounded-sm">
        <div className="text-sm text-white opacity-75 mb-1">Web Energy</div>
        <div className="w-32 h-2 bg-gray-700 rounded-sm overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-200"
            style={{
              width: `${(webEnergy / GAME_CONFIG.web.energy.max) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;
