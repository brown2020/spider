import React, { memo } from "react";
import { GameState } from "@/lib/types/game";

// Format position for consistent display
const formatPosition = (pos: { x: number; y: number }): string => {
    return `(${Math.round(pos.x).toString().padStart(4, " ")}, ${Math.round(pos.y)
        .toString()
        .padStart(4, " ")})`;
};

// Format velocity for consistent display
const formatVelocity = (vel: { x: number; y: number }): string => {
    return `(${vel.x.toFixed(1).padStart(5, " ")}, ${vel.y
        .toFixed(1)
        .padStart(5, " ")})`;
};

interface DebugInfoProps {
    gameState: GameState;
    websCount: number;
}

const DebugInfo: React.FC<DebugInfoProps> = memo(
    ({ gameState, websCount }) => {
        return (
            <div className="fixed top-4 right-4 text-white bg-black bg-opacity-75 p-2 rounded-sm z-50 w-64 font-mono text-sm">
                <div className="grid grid-cols-2 gap-1">
                    <div className="text-gray-400">Position:</div>
                    <div className="text-right tabular-nums">
                        {formatPosition(gameState.position)}
                    </div>

                    <div className="text-gray-400">Velocity:</div>
                    <div className="text-right tabular-nums">
                        {formatVelocity(gameState.velocity)}
                    </div>

                    <div className="text-gray-400">Direction:</div>
                    <div className="text-right">{gameState.direction.padEnd(6, " ")}</div>

                    <div className="text-gray-400">Jumping:</div>
                    <div className="text-right">
                        {gameState.isJumping ? "Yes" : "No "}
                    </div>

                    <div className="text-gray-400">Crawling:</div>
                    <div className="text-right">
                        {gameState.isCrawling ? "Yes" : "No "}
                    </div>

                    <div className="text-gray-400">Web Energy:</div>
                    <div className="text-right tabular-nums">
                        {Math.floor(gameState.webEnergy).toString().padStart(3, " ")}%
                    </div>

                    <div className="text-gray-400">Active Webs:</div>
                    <div className="text-right tabular-nums">
                        {websCount.toString().padStart(2, " ")}
                    </div>
                </div>
            </div>
        );
    }
);

DebugInfo.displayName = "DebugInfo";

export default DebugInfo;
