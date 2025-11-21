import { useEffect, useCallback, useState } from "react";
import { GameState, Web } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";

// Helper function to generate unique IDs
const generateUniqueId = (): string => {
    return (
        Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9)
    );
};

interface UseControlsProps {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    setWebs: React.Dispatch<React.SetStateAction<Web[]>>;
    isPaused: boolean;
    setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useControls = ({
    gameState,
    setGameState,
    setWebs,
    isPaused,
    setIsPaused,
}: UseControlsProps) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Track mouse position
    const handleMouseMove = useCallback((e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    }, []);

    // Handle mouse click for web shooting
    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            if (isPaused) return;

            setGameState((prev) => {
                // Only shoot if we have enough energy
                if (prev.webEnergy < GAME_CONFIG.web.energy.shootCost) return prev;

                const newWeb: Web = {
                    id: generateUniqueId(),
                    startPos: { x: prev.position.x, y: prev.position.y },
                    endPos: { x: e.clientX, y: e.clientY },
                    lifetime: GAME_CONFIG.web.duration,
                    createdAt: Date.now(),
                };

                // Add the new web to the webs array
                setWebs((prevWebs) => [...prevWebs]);

                // Use setTimeout to ensure the state update happens
                setTimeout(() => {
                    setWebs((prevWebs) => [...prevWebs, newWeb]);
                }, 0);

                return {
                    ...prev,
                    isWebShooting: true,
                    webEnergy: prev.webEnergy - GAME_CONFIG.web.energy.shootCost,
                };
            });
        },
        [isPaused, setGameState, setWebs]
    );

    const handleMouseUp = useCallback(() => {
        setGameState((prev) => ({
            ...prev,
            isWebShooting: false,
        }));
    }, [setGameState]);

    // Set up mouse controls
    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [handleMouseMove, handleMouseDown, handleMouseUp]);

    // Handle keyboard controls
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (isPaused) return;

            const speed = event.shiftKey
                ? GAME_CONFIG.spider.runSpeed
                : GAME_CONFIG.spider.baseSpeed;

            setGameState((prev) => {
                const newState = { ...prev };

                switch (event.key) {
                    case "ArrowUp":
                        newState.velocity.y = -speed;
                        newState.direction = "up";
                        newState.isCrawling = true;
                        break;
                    case "ArrowDown":
                        newState.velocity.y = speed;
                        newState.direction = "down";
                        newState.isCrawling = true;
                        break;
                    case "ArrowLeft":
                        newState.velocity.x = -speed;
                        newState.direction = "left";
                        newState.isCrawling = true;
                        break;
                    case "ArrowRight":
                        newState.velocity.x = speed;
                        newState.direction = "right";
                        newState.isCrawling = true;
                        break;
                    case " ": // Spacebar
                        if (!newState.isJumping) {
                            newState.velocity.y = -GAME_CONFIG.spider.jumpForce;
                            newState.isJumping = true;
                        }
                        break;
                    case "Escape":
                        setIsPaused((p) => !p);
                        break;
                }

                return newState;
            });
        },
        [isPaused, setGameState, setIsPaused]
    );

    const handleKeyUp = useCallback(
        (event: KeyboardEvent) => {
            if (isPaused) return;

            setGameState((prev) => {
                const newState = { ...prev };

                switch (event.key) {
                    case "ArrowUp":
                    case "ArrowDown":
                        newState.velocity.y = 0;
                        break;
                    case "ArrowLeft":
                    case "ArrowRight":
                        newState.velocity.x = 0;
                        break;
                }

                if (!Object.values(newState.velocity).some((v) => v !== 0)) {
                    newState.isCrawling = false;
                }

                return newState;
            });
        },
        [isPaused, setGameState]
    );

    // Set up keyboard controls
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    return { mousePosition };
};
