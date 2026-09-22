'use client';

import { useState, useEffect, useRef } from "react";

export function TouchHint() {
  const [visible, setVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const hasPlayed = localStorage.getItem("spiderTouchHintShown");
    if (hasPlayed) {
      const id = requestAnimationFrame(() => setVisible(false));
      return () => cancelAnimationFrame(id);
    }

    const handleTouch = () => {
      setHasInteracted(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setVisible(false), 500);
      localStorage.setItem("spiderTouchHintShown", "true");
    };

    window.addEventListener("touchstart", handleTouch, { passive: true });

    const timer = setTimeout(() => {
      setVisible(false);
      localStorage.setItem("spiderTouchHintShown", "true");
    }, 5000);

    return () => {
      window.removeEventListener("touchstart", handleTouch);
      clearTimeout(timer);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
        hasInteracted ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="text-center p-6 rounded-2xl max-w-xs mx-4"
        style={{
          background: "rgba(10, 20, 40, 0.9)",
          border: "1px solid rgba(100, 140, 200, 0.3)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div className="text-3xl mb-3">🕷️</div>
        <div className="text-white font-semibold mb-2">Touch Controls</div>
        <div className="text-gray-400 text-sm space-y-1">
          <p>Left joystick to move</p>
          <p>Right buttons for actions</p>
        </div>
        <div className="mt-4 text-gray-500 text-xs animate-pulse">
          Tap anywhere to start
        </div>
      </div>
    </div>
  );
}
