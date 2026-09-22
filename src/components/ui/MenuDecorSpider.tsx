"use client";

import { memo } from "react";

interface MenuDecorSpiderProps {
  spiderPos: { x: number; y: number };
  visible: boolean;
}

export const MenuDecorSpider = memo(function MenuDecorSpider({
  spiderPos,
  visible,
}: MenuDecorSpiderProps) {
  if (!visible) return null;

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: `${spiderPos.x}%`,
        top: `${spiderPos.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="absolute left-1/2 bottom-full w-px h-[200px] -translate-x-1/2"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(200, 220, 255, 0.6))",
        }}
      />
      <div className="relative spider-menu-bob">
        {([-1, 1] as const).map((side) => (
          <div
            key={side}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: side === -1 ? "-20px" : "20px" }}
          >
            {[0, 1, 2, 3].map((leg) => (
              <div
                key={leg}
                className="absolute h-px"
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
                  animation: "spider-leg-wave 0.8s ease-in-out infinite",
                  animationDelay: `${leg * 0.1}s`,
                }}
              />
            ))}
          </div>
        ))}
        <div
          className="w-8 h-10 rounded-full relative"
          style={{
            background:
              "radial-gradient(ellipse at 30% 30%, #3a3a5a 0%, #1a1a2e 60%, #0a0a1e 100%)",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.5), inset 0 -2px 10px rgba(0,0,0,0.3)",
          }}
        >
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
  );
});
