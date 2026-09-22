"use client";

import { memo, useState, useEffect } from "react";
import { TouchControls } from "./TouchControls";
import { DesktopControlsHelp } from "./DesktopControlsHelp";

const Controls = memo(function Controls() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsTouchDevice(hasTouch && isMobile);
    };
    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);
    return () => window.removeEventListener("resize", checkTouchDevice);
  }, []);

  if (isTouchDevice) return <TouchControls />;
  return <DesktopControlsHelp />;
});

export default Controls;
