import { GameObject } from './GameObject.js';
import * as PIXI from 'pixi.js';

/**
 * Projectile class - bullets/shots fired by towers
 */
export class Projectile extends GameObject {
  constructor(x, y, targetX, targetY, config = {}) {
    super(x, y);
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = config.speed || 3;
    this.damage = config.damage || 10;
    this.projectileType = config.type || 'bullet';
  }

  /**
   * Create projectile sprite
   */
  createSprite() {
    const container = new PIXI.Container();
    
    // Main projectile body
    const body = new PIXI.Graphics();
    body.fill(0xffff00);
    body.circle(0, 0, 5);
    body.fill();
    
    // Glow effect
    const glow = new PIXI.Graphics();
    glow.stroke({ color: 0xffff00, width: 2, alpha: 0.4 });
    glow.circle(0, 0, 8);
    
    container.addChild(glow);
    container.addChild(body);
    
    return container;
  }

  /**
   * Move projectile towards target
   */
  update(delta) {
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= this.speed) {
      // Hit the target
      this.active = false;
    } else {
      // Move towards target
      const moveX = (dx / distance) * this.speed;
      const moveY = (dy / distance) * this.speed;
      this.x += moveX;
      this.y += moveY;
    }

    super.update(delta);
  }

  /**
   * Check if projectile has reached its target
   */
  hasHitTarget() {
    return !this.active;
  }
}
