# 🕷️ Spider

A simple demo project that illustrates how to use a sprite sheet to create animations and handle controls in a web application. This project uses a spider sprite sheet to animate the spider's movement in four directions, allowing users to control the spider using keyboard arrow keys.

## Demo

You can view a live demo of the project [here](#).

## Purpose

The purpose of this project is to demonstrate:

- How to use a sprite sheet for character animation in a web application.
- How to control animations using keyboard input.
- How to dynamically adjust sprite positions and prevent the sprite from moving off-screen.

## Features

- **Sprite Animation**: Uses a sprite sheet to animate a spider character in four different directions (up, down, left, right).
- **Keyboard Controls**: Allows user control of the spider's movement with arrow keys.
- **Responsive Movement**: Dynamically calculates boundaries to prevent the spider from moving off-screen, while maintaining a smooth animation experience.

## Technologies Used

- **React**: For building the interactive UI components.
- **TypeScript**: For type safety and clarity.
- **Tailwind CSS**: For styling and responsive design.
- **HTML/CSS**: For layout and animation control.

## Installation

To run this project locally, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/brown2020/spider.git
   cd spider
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to see the project in action.

## Usage

- Use the **Arrow Keys** (`↑`, `↓`, `←`, `→`) to control the spider's movement.
- The spider will animate in the direction of movement based on the sprite sheet.

## Components

### 1. `Spider.tsx`

This component renders the animated spider and handles the dynamic sprite positioning.

```tsx
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
    const frameWidth = 32;
    const frameHeight = 32;

    const xOffset = movementState * frameWidth;

    const yOffset = {
      down: 0,
      left: -frameHeight,
      right: -2 * frameHeight,
      up: -3 * frameHeight,
    }[direction];

    return `-${xOffset}px ${yOffset}px`;
  };

  return (
    <div
      className="absolute spider"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        transform: "translate(-50%, -50%) scale(5)",
        backgroundPosition: getBackgroundPosition(),
        filter: "brightness(6) contrast(2)",
      }}
    />
  );
};

export default Spider;
```

````

### 2. `SpiderCrawl.tsx`

This component handles the logic for the spider's movement and keyboard controls.

```tsx
"use client";
import { useEffect, useState } from "react";
import Spider from "./Spider";

export default function SpiderCrawl() {
  const [position, setPosition] = useState({ top: 50, left: 50 });
  const [crawling, setCrawling] = useState(false);
  const [direction, setDirection] = useState<"up" | "down" | "left" | "right">(
    "up"
  );

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
  };

  useEffect(() => {
    if (!crawling) return;

    const spiderSize = 32; // Original size of the spider in pixels
    const scale = 5; // Scale factor
    const scaledSpiderSize = spiderSize * scale; // Scaled size of the spider

    // Allow spider to get closer to the edge by using a fraction of the scaled size
    const marginFraction = 0.25; // Adjust this value to allow closer edges (0.25 means 25%)
    const minMargin =
      ((scaledSpiderSize * marginFraction) / window.innerHeight) * 100; // Convert to percentage
    const maxMargin = 100 - minMargin; // Maximum position accounting for the spider size

    const crawl = setInterval(() => {
      setPosition((prev) => {
        const newPosition = { ...prev };

        // Update position based on direction with adjusted constraints
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
      <Spider
        top={position.top}
        left={position.left}
        crawling={crawling}
        direction={direction}
      />
    </div>
  );
}
```

## Credits

### Sprite Sheet

- The spider sprite sheet used in this demo was created by **Tuomo Untinen** and can be found at [OpenGameArt.org](https://opengameart.org/content/giant-spider-32x32).
- **License**: [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/)
- **Attribution**: Spider made by Tuomo Untinen

### Project

- Created by [brown2020](https://github.com/brown2020)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```

### Key Points

- **Demo**: Add a link to your live demo if you deploy the project.
- **Installation and Usage**: Clear instructions are provided for cloning the repo, installing dependencies, and running the project locally.
- **Credits**: Proper attribution to the sprite sheet creator.
- **License**: MIT License information (if you use it).

````
