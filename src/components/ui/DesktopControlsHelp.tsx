"use client";

import { memo, useRef, useCallback } from "react";

const CONTROL_ROWS = [
  { key: "WASD / ↑↓←→", action: "Move" },
  { key: "Space", action: "Jump" },
  { key: "Shift", action: "Run" },
  { key: "L-Click", action: "Shoot Web" },
  { key: "R-Click", action: "Zip" },
  { key: "Esc", action: "Pause" },
] as const;

export const DesktopControlsHelp = memo(function DesktopControlsHelp() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dialogRef.current?.showModal();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 game-ui" data-ui="true">
      <button
        type="button"
        aria-label="Show controls help"
        onClick={open}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
        style={{
          background: "rgba(30, 50, 80, 0.8)",
          border: "1px solid rgba(100, 140, 200, 0.3)",
          backdropFilter: "blur(8px)",
        }}
      >
        <span className="text-gray-400 text-lg" aria-hidden="true">
          ?
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Keyboard controls"
        className="rounded-xl p-4 w-56 backdrop:bg-black/40 m-auto"
        style={{
          background:
            "linear-gradient(135deg, rgba(20, 35, 60, 0.95) 0%, rgba(15, 25, 45, 0.98) 100%)",
          border: "1px solid rgba(100, 140, 200, 0.2)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
          color: "#e2e8f0",
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <p className="text-gray-300 font-semibold text-sm">Controls</p>
          <form method="dialog">
            <button
              type="submit"
              aria-label="Close controls help"
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <span className="text-gray-500 hover:text-white" aria-hidden="true">
                ×
              </span>
            </button>
          </form>
        </div>
        <div className="space-y-2 text-xs">
          {CONTROL_ROWS.map((control) => (
            <div
              key={control.action}
              className="flex justify-between items-center"
            >
              <span style={{ color: "rgba(148, 163, 184, 0.7)" }}>
                {control.action}
              </span>
              <kbd
                className="px-2 py-0.5 rounded text-[10px] font-mono"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "rgba(200, 220, 255, 0.8)",
                }}
              >
                {control.key}
              </kbd>
            </div>
          ))}
        </div>
      </dialog>
    </div>
  );
});
