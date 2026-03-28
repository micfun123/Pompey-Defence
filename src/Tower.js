import { GameObject } from './GameObject.js';
import * as PIXI from 'pixi.js';

/**
 * Tower class - base tower for the defence game
 */
export class Tower extends GameObject {
  constructor(x, y, config = {}) {
    super(x, y);
    this.cost = config.cost || 100;
    this.damage = config.damage || 10;
    this.range = config.range || 100;
    this.fireRate = config.fireRate || 1; // shots per second
    this.timeSinceLastShot = 0;
    this.level = 1;
    this.towerType = config.type || 'basic';
  }

  /**
   * Create tower sprite
   */
  createSprite() {
    const container = new PIXI.Container();
    
    // Range indicator (at bottom)
    const rangeCircle = new PIXI.Graphics();
    rangeCircle.circle(0, 0, this.range);
    rangeCircle.stroke({ color: 0x00ff00, width: 1, alpha: 0.1 });
    
    // Base circle
    const base = new PIXI.Graphics();
    base.circle(0, 0, 16);
    base.fill({ color: 0x00aa00 });
    
    // Top circle (more saturated)
    const top = new PIXI.Graphics();
    top.circle(0, 0, 12);
    top.fill({ color: 0x00ff00 });
    
    container.addChild(rangeCircle);
    container.addChild(base);
    container.addChild(top);
    
    return container;
  }

  /**
   * Check if tower can shoot
   */
  canShoot(delta) {
    this.timeSinceLastShot += delta;
    const shootInterval = 1 / this.fireRate;
    return this.timeSinceLastShot >= shootInterval;
  }

  /**
   * Reset shot timer after shooting
   */
  resetShotTimer() {
    this.timeSinceLastShot = 0;
  }

  /**
   * Get the distance to a target
   */
  getDistanceTo(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if a target is in range
   */
  isInRange(x, y) {
    return this.getDistanceTo(x, y) <= this.range;
  }

  /**
   * Upgrade tower (increase level)
   */
  upgrade() {
    this.level += 1;
    this.damage *= 1.2; // 20% damage increase per level
    this.fireRate *= 1.1; // 10% fire rate increase
  }

  /**
   * Update tower state
   */
  update(delta) {
    super.update(delta);
    // Add tower-specific logic here (animation, effects, etc.)
  }
}
