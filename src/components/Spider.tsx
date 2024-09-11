import React, { useEffect, useState } from "react";

interface SpiderProps {
  top: number;
  left: number;
  crawling: boolean;
  direction: "up" | "down" | "left" | "right";
}

const Spider: React.FC<SpiderProps> = ({ top, left, crawling, direction }) => {
  const [movementState, setMovementState] = useState(0);

  useEffect(() => {
    if (crawling) {
      const interval = setInterval(() => {
        setMovementState((prev) => (prev + 1) % 3); // 3 frames for walking animation
      }, 150);

      return () => clearInterval(interval);
    }
  }, [crawling, direction]);

  const getBackgroundPosition = () => {
    const frameWidth = 32; // Width of each frame
    const frameHeight = 32; // Height of each frame

    // Calculate X offset for walking animation (first 3 columns)
    const xOffset = movementState * frameWidth;

    // Correct Y offset based on the direction order provided
    const yOffset = {
      down: 0, // Row 0 for down direction
      left: -frameHeight, // Row 1 for left direction
      right: -2 * frameHeight, // Row 2 for right direction
      up: -3 * frameHeight, // Row 3 for up direction
    }[direction];

    return `-${xOffset}px ${yOffset}px`; // Dynamic background position
  };

  return (
    <div
      className="absolute spider"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        transform: "translate(-50%, -50%) scale(5)", // Scale up by 5x
        backgroundPosition: getBackgroundPosition(), // Apply the dynamic background position
        filter: "brightness(6) contrast(2)", // Adjust brightness and contrast
      }}
    />
  );
};

export default Spider;
