"use client";

import { memo, useMemo, useState, useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import { ShootingStar } from "./environmentData";
import { EnvironmentScene } from "./EnvironmentScene";

interface EnvironmentProps {
  dimensions: { width: number; height: number };
}

type TimedStar = ShootingStar & { expiresAt: number };

const Environment = memo(function Environment({ dimensions }: EnvironmentProps) {
  const [shootingStars, setShootingStars] = useState<TimedStar[]>([]);

  const spiderPosition = useGameStore((state) => state.gameState.position);
  const combo = useGameStore((state) => state.gameState.combo);

  const parallaxOffset = useMemo(() => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const offsetX = (spiderPosition.x - centerX) / centerX;
    const offsetY = (spiderPosition.y - centerY) / centerY;
    return { x: offsetX, y: offsetY };
  }, [spiderPosition.x, spiderPosition.y, dimensions.width, dimensions.height]);

  useEffect(() => {
    const spawnShootingStar = () => {
      const id = Date.now() + Math.random();
      const newStar: TimedStar = {
        id,
        startX: Math.random() * 60 + 10,
        startY: Math.random() * 30 + 5,
        angle: Math.random() * 30 + 30,
        speed: Math.random() * 2 + 3,
        length: Math.random() * 80 + 60,
        expiresAt: Date.now() + 2000,
      };
      setShootingStars((prev) => [
        ...prev.filter((s) => s.expiresAt > Date.now()),
        newStar,
      ]);
    };

    const baseChance = 0.3;
    const comboBonus = Math.min(combo * 0.05, 0.4);
    const spawnChance = baseChance + comboBonus;

    const interval = setInterval(() => {
      if (Math.random() < spawnChance) {
        spawnShootingStar();
        if (combo >= 5 && Math.random() < 0.5) {
          spawnShootingStar();
        }
      }
      setShootingStars((prev) => prev.filter((s) => s.expiresAt > Date.now()));
    }, combo >= 5 ? 2000 : 3000);

    return () => clearInterval(interval);
  }, [combo]);

  const visibleStars = useMemo(
    () => shootingStars.map(({ expiresAt: _e, ...star }) => star),
    [shootingStars]
  );

  return (
    <EnvironmentScene
      dimensions={dimensions}
      parallaxOffset={parallaxOffset}
      shootingStars={visibleStars}
      combo={combo}
    />
  );
});

export default Environment;
