'use client';

import { memo } from "react";

interface LegProps {
  index: number;
  side: "left" | "right";
  isMoving: boolean;
  time: number;
}

export const SpiderLeg = memo(function SpiderLeg({
  index,
  side,
  isMoving,
  time,
}: LegProps) {
  const baseAngles = [25, 60, 120, 155];
  const baseAngle = side === "left" ? 180 + baseAngles[index] : -baseAngles[index];
  const phaseOffset = index * 0.8 + (side === "left" ? 0 : Math.PI);
  const waveAmount = isMoving ? 15 : 5;
  const waveSpeed = isMoving ? 0.015 : 0.005;
  const wave = Math.sin(time * waveSpeed + phaseOffset) * waveAmount;
  const segment1Length = 12;
  const segment2Length = 14;
  const angle1 = baseAngle + wave;
  const angle2 = wave * 0.6;

  return (
    <g style={{ transform: `rotate(${angle1}deg)`, transformOrigin: "center" }}>
      <line
        x1="0"
        y1="0"
        x2={segment1Length}
        y2="0"
        stroke="rgba(60, 60, 60, 0.9)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <g style={{ transform: `translate(${segment1Length}px, 0) rotate(${angle2}deg)` }}>
        <line
          x1="0"
          y1="0"
          x2={segment2Length}
          y2="0"
          stroke="rgba(40, 40, 40, 0.9)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={segment2Length} cy="0" r="1.5" fill="rgba(30, 30, 30, 0.8)" />
      </g>
    </g>
  );
});
