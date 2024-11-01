// lib/utils/physics.ts
import { Vector2D } from "@/lib/types/game";
import { GAME_CONFIG } from "@/lib/constants/gameConfig";

export class PhysicsSystem {
  static applyGravity(velocity: Vector2D): Vector2D {
    return {
      x: velocity.x,
      y: Math.min(
        velocity.y + GAME_CONFIG.physics.gravity,
        GAME_CONFIG.physics.maxFallSpeed
      ),
    };
  }

  static applyFriction(velocity: Vector2D): Vector2D {
    return {
      x: velocity.x * GAME_CONFIG.physics.friction,
      y: velocity.y * GAME_CONFIG.physics.airResistance,
    };
  }

  static checkBounds(
    position: Vector2D,
    velocity: Vector2D,
    dimensions: { width: number; height: number }
  ): {
    position: Vector2D;
    velocity: Vector2D;
    isGrounded: boolean;
  } {
    const groundLevel = dimensions.height - GAME_CONFIG.physics.groundHeight;
    let isGrounded = false;

    // Ground collision
    if (position.y >= groundLevel) {
      position.y = groundLevel;
      velocity.y = 0;
      isGrounded = true;
    }

    // Left and right bounds
    if (position.x < 0) {
      position.x = 0;
      velocity.x = 0;
    } else if (position.x > dimensions.width) {
      position.x = dimensions.width;
      velocity.x = 0;
    }

    // Ceiling collision
    if (position.y < 0) {
      position.y = 0;
      velocity.y = 0;
    }

    return { position, velocity, isGrounded };
  }
}
