import { useState, useEffect, useRef } from "react";
import { AnimationController } from "@/lib/utils/animation";

export const useSpriteAnimation = (
    frames: number,
    speed: number,
    isPlaying: boolean
) => {
    const [currentFrame, setCurrentFrame] = useState(0);
    const animationController = useRef<AnimationController>(
        new AnimationController(frames, speed)
    );
    const frameInterval = useRef<number>(0);

    useEffect(() => {
        let lastTimestamp = 0;

        const animate = (timestamp: number) => {
            if (isPlaying) {
                if (lastTimestamp === 0) lastTimestamp = timestamp;
                const frame = animationController.current.update(timestamp);
                setCurrentFrame(frame);
            } else {
                animationController.current.reset();
                setCurrentFrame(0);
            }

            frameInterval.current = requestAnimationFrame(animate);
        };

        frameInterval.current = requestAnimationFrame(animate);

        return () => {
            if (frameInterval.current) {
                cancelAnimationFrame(frameInterval.current);
            }
        };
    }, [isPlaying]);

    return currentFrame;
};
