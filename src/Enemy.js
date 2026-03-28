import { GameObject } from './GameObject.js';
import * as PIXI from 'pixi.js';

/**
 * Enemy class - enemies that move along the path
 */
export class Enemy extends GameObject {
  constructor(x, y, config = {}) {
    super(x, y);
    this.health = config.health || 50;
    this.maxHealth = this.health;
    this.speed = config.speed || 1; // pixels per frame
    this.enemyType = config.type || 'basic';
    this.pathIndex = 0;
    this.path = config.path || []; // array of {x, y} waypoints
    this.bounty = config.bounty || 10; // gold reward
    this.armor = config.armor || 0; // damage reduction
    this.texture = config.texture || null;
    this.healthBar = null;
  }

  /**
   * Create enemy sprite
   */
  createSprite() {
    const container = new PIXI.Container();
    
    // Draw a red enemy unit
    const body = new PIXI.Graphics();
    body.fill(0xff4444);
    body.rect(-12, -12, 24, 24);
    body.fill();
    
    // Add a border
    body.stroke({ color: 0xff0000, width: 2 });
    body.rect(-12, -12, 24, 24);
    
    // Draw a health bar background
    const healthBarBg = new PIXI.Graphics();
    healthBarBg.fill(0x333333);
    healthBarBg.rect(-12, -22, 24, 4);
    healthBarBg.fill();
    
    // Draw health bar (will be updated in updateHealthBar)
    this.healthBar = new PIXI.Graphics();
    this.updateHealthBar();
    
    container.addChild(body);
    container.addChild(healthBarBg);
    container.addChild(this.healthBar);
    
    return container;
  }

  /**
   * Update the health bar visualization
   */
  updateHealthBar() {
    if (!this.healthBar) return;
    
    this.healthBar.clear();
    const healthPercent = this.getHealthPercent();
    this.healthBar.fill(healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000);
    this.healthBar.rect(-12, -22, 24 * healthPercent, 4);
    this.healthBar.fill();
  }

  /**
   * Move enemy along the path
   */
  update(delta) {
    if (this.path.length === 0) {
      super.update(delta);
      return;
    }

    // Get current waypoint
    const currentWaypoint = this.path[this.pathIndex];
    
    if (!currentWaypoint) {
      this.active = false; // Reached the end
      return;
    }

    // Calculate direction to waypoint
    const dx = currentWaypoint.x - this.x;
    const dy = currentWaypoint.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Move towards waypoint
    if (distance > this.speed) {
      const moveX = (dx / distance) * this.speed;
      const moveY = (dy / distance) * this.speed;
      this.x += moveX;
      this.y += moveY;
    } else {
      // Reached waypoint, move to next one
      this.pathIndex += 1;
      if (this.pathIndex >= this.path.length) {
        this.active = false; // Reached the end
      }
    }

    super.update(delta);
  }

  /**
   * Take damage
   */
  takeDamage(damage) {
    const actualDamage = Math.max(1, damage - this.armor);
    this.health -= actualDamage;
    this.updateHealthBar();
    return this.health <= 0;
  }

  /**
   * Get health percentage (0-1)
   */
  getHealthPercent() {
    return Math.max(0, this.health / this.maxHealth);
  }

  /**
   * Check if enemy is alive
   */
  isAlive() {
    return this.health > 0 && this.active;
  }
}
