"use client";

import { memo } from "react";

const CONTROLS = [
  { keys: ["W", "A", "S", "D"], label: "Move" },
  { keys: ["Space"], label: "Jump" },
  { keys: ["Click"], label: "Shoot Web" },
  { keys: ["Right Click"], label: "Zip" },
  { keys: ["Shift"], label: "Run" },
  { keys: ["Esc"], label: "Pause" },
] as const;

export const MenuControlsHint = memo(function MenuControlsHint() {
  return (
    <div className="mt-8 pt-6 border-t border-white/5">
      <p
        className="text-center text-sm font-semibold mb-4"
        style={{ color: "rgba(148, 180, 220, 0.7)" }}
      >
        Controls
      </p>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {CONTROLS.map((control) => (
          <div key={control.label} className="flex items-center gap-2">
            <div className="flex gap-1">
              {control.keys.map((key) => (
                <kbd
                  key={key}
                  className="px-2 py-1 rounded text-[10px] font-mono"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(200, 220, 255, 0.8)",
                  }}
                >
                  {key}
                </kbd>
              ))}
            </div>
            <span style={{ color: "rgba(148, 163, 184, 0.6)" }}>
              {control.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
