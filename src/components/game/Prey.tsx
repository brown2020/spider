"use client";

import React from "react";
import { Prey as PreyType } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";

interface PreyProps {
  preyList: PreyType[];
}

const Prey: React.FC<PreyProps> = ({ preyList }) => {
  return (
    <>
      {preyList.map((prey) => (
        <div
          key={prey.id}
          className={`absolute transition-all ${prey.isTrapped ? "scale-75 opacity-75" : "scale-100 opacity-100"
            }`}
          style={{
            left: prey.position.x,
            top: prey.position.y,
            transform: "translate(-50%, -50%)",
            width: `${GAME_CONFIG.prey.size}px`,
            height: `${GAME_CONFIG.prey.size}px`,
            transition: "opacity 0.2s, transform 0.2s",
          }}
        >
          <div
            className={`w-full h-full rounded-full ${prey.isTrapped ? "bg-gray-400" : "bg-white"
              } ${prey.isTrapped ? "" : "animate-pulse"}`}
            style={{
              boxShadow: prey.isTrapped
                ? "0 0 4px rgba(200, 200, 200, 0.5)"
                : "0 0 8px rgba(255, 255, 255, 0.8)",
            }}
          />
        </div>
      ))}

      {/* Debug info to show web count */}
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-70 text-white text-xs p-1 z-50">
        Prey: {preyList.length} | Trapped:{" "}
        {preyList.filter((p) => p.isTrapped).length}
      </div>
    </>
  );
};

export default Prey;
