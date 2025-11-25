'use client';

import { useState, useEffect, useRef } from 'react';

export function useSpriteAnimation(
  frames: number,
  speed: number,
  isPlaying: boolean
) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      setCurrentFrame(0);
      accumulatedTimeRef.current = 0;
      return;
    }

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      accumulatedTimeRef.current += deltaTime;

      if (accumulatedTimeRef.current >= speed) {
        setCurrentFrame((prev) => (prev + 1) % frames);
        accumulatedTimeRef.current = accumulatedTimeRef.current % speed;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      lastTimeRef.current = 0;
    };
  }, [isPlaying, frames, speed]);

  return currentFrame;
}
