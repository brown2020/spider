// components/game/WebShooter.tsx
import React, { useState, useEffect, useCallback } from "react";
import { GameState, Web, Vector2D } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";

interface WebShooterProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

const WebShooter: React.FC<WebShooterProps> = ({ gameState, setGameState }) => {
  const [webs, setWebs] = useState<Web[]>([]);
  const [isAiming, setIsAiming] = useState(false);
  const [aimPoint, setAimPoint] = useState<Vector2D>({ x: 0, y: 0 });

  const updateAimPoint = useCallback((e: MouseEvent) => {
    setAimPoint({
      x: e.clientX + window.scrollX,
      y: e.clientY + window.scrollY,
    });
  }, []);

  const shootWeb = useCallback(() => {
    const newWeb: Web = {
      id: Date.now().toString(),
      startPos: { ...gameState.position },
      endPos: { ...aimPoint },
      lifetime: GAME_CONFIG.web.duration,
      createdAt: Date.now(),
    };

    setWebs((prev) => [...prev, newWeb]);
  }, [gameState.position, aimPoint]);

  // Handle mouse events for web shooting
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (gameState.webEnergy >= 20) {
        setIsAiming(true);
        updateAimPoint(e);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isAiming) {
        updateAimPoint(e);
      }
    };

    const handleMouseUp = () => {
      if (isAiming && gameState.webEnergy >= 20) {
        shootWeb();
        setIsAiming(false);
        setGameState({
          ...gameState,
          webEnergy: gameState.webEnergy - 20,
        });
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isAiming, gameState, setGameState, shootWeb, updateAimPoint]);

  // Clean up expired webs
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setWebs((prev) =>
        prev.filter((web) => now - web.createdAt < web.lifetime)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate web length and angle
  const calculateWebProperties = useCallback(
    (startPos: Vector2D, endPos: Vector2D) => {
      const length = Math.hypot(endPos.x - startPos.x, endPos.y - startPos.y);
      const angle = Math.atan2(endPos.y - startPos.y, endPos.x - startPos.x);
      return { length, angle };
    },
    []
  );

  return (
    <>
      {/* Render active webs */}
      {webs.map((web) => {
        const { length, angle } = calculateWebProperties(
          web.startPos,
          web.endPos
        );
        return (
          <div
            key={web.id}
            className="absolute web"
            style={{
              left: `${web.startPos.x}px`,
              top: `${web.startPos.y}px`,
              width: `${length}px`,
              height: `${GAME_CONFIG.web.thickness}px`,
              transform: `rotate(${angle}rad)`,
            }}
          />
        );
      })}

      {/* Render aim line while shooting */}
      {isAiming && (
        <div
          className="absolute web opacity-30"
          style={{
            left: `${gameState.position.x}px`,
            top: `${gameState.position.y}px`,
            width: `${
              calculateWebProperties(gameState.position, aimPoint).length
            }px`,
            height: "1px",
            transform: `rotate(${
              calculateWebProperties(gameState.position, aimPoint).angle
            }rad)`,
          }}
        />
      )}
    </>
  );
};

export default WebShooter;
