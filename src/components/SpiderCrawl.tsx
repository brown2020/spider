"use client";
import { useEffect, useState } from "react";
import Spider from "./Spider"; // Import the Spider component

export default function SpiderCrawl() {
  const [position, setPosition] = useState({ top: 50, left: 50 });
  const [crawling, setCrawling] = useState(false);
  const [direction, setDirection] = useState<"up" | "down" | "left" | "right">(
    "up"
  );
  const [showInstructions, setShowInstructions] = useState(true);

  const handleKeyPress = (event: KeyboardEvent) => {
    if (crawling) return; // Prevent movement if already crawling

    switch (event.key) {
      case "ArrowUp":
        setDirection("up");
        break;
      case "ArrowDown":
        setDirection("down");
        break;
      case "ArrowLeft":
        setDirection("left");
        break;
      case "ArrowRight":
        setDirection("right");
        break;
      default:
        return;
    }
    setCrawling(true);
    setShowInstructions(false); // Hide instructions once movement starts
  };

  useEffect(() => {
    if (!crawling) return;

    const spiderSize = 32; // Original size of the spider in pixels
    const scale = 5; // Scale factor
    const scaledSpiderSize = spiderSize * scale; // Scaled size of the spider

    const marginFraction = 0.25; // Allow closer edges
    const minMargin =
      ((scaledSpiderSize * marginFraction) / window.innerHeight) * 100; // Convert to percentage
    const maxMargin = 100 - minMargin; // Maximum position accounting for the spider size

    const crawl = setInterval(() => {
      setPosition((prev) => {
        const newPosition = { ...prev };

        if (direction === "up")
          newPosition.top = Math.max(minMargin, prev.top - 1);
        if (direction === "down")
          newPosition.top = Math.min(maxMargin, prev.top + 1);
        if (direction === "left")
          newPosition.left = Math.max(minMargin, prev.left - 1);
        if (direction === "right")
          newPosition.left = Math.min(maxMargin, prev.left + 1);

        return newPosition;
      });
    }, 50); // Faster interval for smoother movement

    const stopCrawl = setTimeout(() => {
      setCrawling(false);
      clearInterval(crawl);
    }, 600); // Duration of the crawl

    return () => {
      clearInterval(crawl);
      clearTimeout(stopCrawl);
    };
  }, [crawling, direction]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {showInstructions && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-lg bg-gray-800 p-2 rounded">
          Use the arrow keys to move the spider!
        </div>
      )}
      <Spider
        top={position.top}
        left={position.left}
        crawling={crawling}
        direction={direction}
      />
    </div>
  );
}
