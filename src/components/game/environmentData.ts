// Deterministic environment star/particle data (no React)

export interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  type: "normal" | "bright" | "distant";
}

export interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  speed: number;
  length: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateStars(): Star[] {
  const rng = seededRandom(42);
  const starArray: Star[] = [];
  for (let i = 0; i < 100; i++) {
    starArray.push({
      id: i, x: rng() * 100, y: rng() * 70, size: rng() * 1 + 0.5,
      opacity: rng() * 0.3 + 0.1, duration: rng() * 6 + 4, delay: rng() * 5, type: "distant",
    });
  }
  for (let i = 100; i < 180; i++) {
    starArray.push({
      id: i, x: rng() * 100, y: rng() * 60, size: rng() * 1.5 + 1,
      opacity: rng() * 0.4 + 0.3, duration: rng() * 4 + 2, delay: rng() * 3, type: "normal",
    });
  }
  for (let i = 180; i < 200; i++) {
    starArray.push({
      id: i, x: rng() * 100, y: rng() * 50, size: rng() * 2 + 2,
      opacity: rng() * 0.3 + 0.7, duration: rng() * 3 + 2, delay: rng() * 2, type: "bright",
    });
  }
  return starArray;
}

function generateAmbientParticles() {
  const rng = seededRandom(99);
  return Array.from({ length: 20 }, (_, i) => ({
    id: i, x: rng() * 100, y: 50 + rng() * 50, size: rng() * 3 + 1,
    duration: 10 + rng() * 15, delay: rng() * 10,
  }));
}

export const STATIC_STARS = generateStars();
export const STATIC_AMBIENT_PARTICLES = generateAmbientParticles();
