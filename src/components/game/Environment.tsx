// components/game/Environment.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";

interface EnvironmentProps {
  dimensions: {
    width: number;
    height: number;
  };
}

interface Star {
  id: number;
  width: number;
  height: number;
  left: number;
  top: number;
  duration: number;
}

const Environment: React.FC<EnvironmentProps> = ({ dimensions }) => {
  const [stars, setStars] = useState<Star[]>([]);

  const generateStars = useCallback(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      width: Math.random() * 2 + 1,
      height: Math.random() * 2 + 1,
      left: Math.random() * dimensions.width,
      top: Math.random() * dimensions.height,
      duration: Math.random() * 3 + 2,
    }));
  }, [dimensions.width, dimensions.height]);

  useEffect(() => {
    setStars(generateStars());
  }, [generateStars]);

  return (
    <div className="absolute inset-0">
      {/* Background with gradient */}
      <div
        className="absolute inset-0 bg-linear-to-b from-gray-900 to-gray-800"
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
      />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full opacity-60"
          style={{
            width: `${star.width}px`,
            height: `${star.height}px`,
            left: `${star.left}px`,
            top: `${star.top}px`,
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Ground shadow */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent"
        style={{
          height: "150px",
          opacity: 0.3,
        }}
      />
    </div>
  );
};

export default Environment;
