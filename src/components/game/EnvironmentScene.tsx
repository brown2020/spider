'use client';

import { memo } from "react";
import { ShootingStar } from "./environmentData";
import { EnvironmentSky } from "./EnvironmentSky";
import { EnvironmentGround } from "./EnvironmentGround";

interface EnvironmentSceneProps {
  dimensions: { width: number; height: number };
  parallaxOffset: { x: number; y: number };
  shootingStars: ShootingStar[];
  combo: number;
}

export const EnvironmentScene = memo(function EnvironmentScene({
  dimensions,
  parallaxOffset,
  shootingStars,
}: EnvironmentSceneProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <EnvironmentSky
        dimensions={dimensions}
        parallaxOffset={parallaxOffset}
        shootingStars={shootingStars}
      />
      <EnvironmentGround
        dimensions={dimensions}
        parallaxOffset={parallaxOffset}
      />
    </div>
  );
});
