"use client";

import { memo, useEffect, useState } from "react";
import { GameState } from "@/lib/types/game";
import { FloatingParticles } from "./MenuFloatingParticles";
import { MenuWebBackdrop } from "./MenuWebBackdrop";
import { MenuDecorSpider } from "./MenuDecorSpider";
import { MenuPanels } from "./MenuPanels";

interface MenuProps {
  gameState: GameState;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}

const Menu = memo(function Menu({
  gameState,
  onStart,
  onResume,
  onRestart,
}: MenuProps) {
  const { gamePhase } = gameState;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [spiderPos, setSpiderPos] = useState({ x: 50, y: 30 });

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

  if (gamePhase === "playing") return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center overflow-hidden">
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
      <FloatingParticles />
      <MenuWebBackdrop mousePos={mousePos} />
      <MenuDecorSpider spiderPos={spiderPos} visible={gamePhase === "menu"} />
      <MenuPanels
        gameState={gameState}
        onStart={onStart}
        onResume={onResume}
        onRestart={onRestart}
      />
    </div>
  );
});

export default Menu;
