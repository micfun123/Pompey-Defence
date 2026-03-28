import { GameObject } from './GameObject.js';
import * as PIXI from 'pixi.js';
import shippic from './assets/ship.png';
import frenchmanpic from './assets/french_man.png';
import frenchtankpic from './assets/french_tank.png';

/**
 * Enemy class - enemies that move along the path
 */
export class Enemy extends GameObject {
  static minWave = 1;

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
    
    // Draw an enemy unit (can be sprite or graphics)
    const body = this.createBody();
    
    // Draw a health bar background
    const healthBarBg = new PIXI.Graphics();
    const barWidth = this.getBarWidth();
    const barY = this.getBarY();
    healthBarBg.rect(-barWidth/2, -barY, barWidth, 4);
    healthBarBg.fill({ color: 0x333333 });
    
    // Draw health bar (will be updated in updateHealthBar)
    this.healthBar = new PIXI.Graphics();
    this.updateHealthBar();
    
    container.addChild(body);
    container.addChild(healthBarBg);
    container.addChild(this.healthBar);
    
    return container;
  }

  /**
   * Create the enemy's body visual
   */
  createBody() {
    const body = new PIXI.Sprite();
    body.anchor.set(0.5);
    
    // Asynchronously load the texture
    PIXI.Assets.load(frenchmanpic).then((texture) => {
      body.texture = texture;
      body.width = 50;
      body.height = 50;
    }).catch((err) => console.error('Failed to load french_man texture:', err));
    
    return body;
  }

  getBarWidth() { return 40; }
  getBarY() { return 35; }

  /**
   * Draw the enemy's body (legacy/fallback)
   */
  drawBody(graphics) {
    graphics.rect(-12, -12, 24, 24);
    graphics.fill({ color: 0xff4444 });
    graphics.stroke({ color: 0xff0000, width: 2 });
  }

  /**
   * Update the health bar visualization
   */
  updateHealthBar() {
    if (!this.healthBar) return;
    
    this.healthBar.clear();
    const healthPercent = this.getHealthPercent();
    const color = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    
    const barWidth = this.getBarWidth();
    const barY = this.getBarY();
    this.healthBar.rect(-barWidth/2, -barY, barWidth * healthPercent, 4);
    this.healthBar.fill({ color });
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
    
    if (this.health <= 0) {
      this.active = false;
      return true;
    }
    
    return false;
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

/**
 * FastEnemy - Quicker but lower health
 */
export class FastEnemy extends Enemy {
  static minWave = 2;
  
  constructor(x, y, config = {}) {
    super(x, y, {
      health: config.health || 30,
      speed: config.speed || 2,
      bounty: config.bounty || 15,
      type: 'fast',
      ...config
    });
  }

  createBody() {
    const graphics = new PIXI.Graphics();
    // Triangular shape for speed
    graphics.poly([-20, 20, 20, 20, 0, -20]);
    graphics.fill({ color: 0x44ff44 });
    graphics.stroke({ color: 0x00ff00, width: 2 });
    return graphics;
  }
}

/**
 * TankEnemy - Slower but high health and armor
 */
export class TankEnemy extends Enemy {
  static minWave = 4;
  
  constructor(x, y, config = {}) {
    super(x, y, {
      health: config.health || 150,
      speed: config.speed || 0.6,
      bounty: config.bounty || 40,
      armor: config.armor || 2,
      type: 'tank',
      ...config
    });
  }

  createBody() {
    const body = new PIXI.Sprite();
    body.anchor.set(0.5);
    
    // Asynchronously load the texture
    PIXI.Assets.load(frenchtankpic).then((texture) => {
      body.texture = texture;
      body.width = 70;
      body.height = 50;
    }).catch((err) => console.error('Failed to load french_tank texture:', err));
    
    return body;
  }

  getBarWidth() { return 60; }
  getBarY() { return 40; }
}

/**
 * FrenchTankEnemy - Slower, high health, and features the Frenchman
 */
export class FrenchTankEnemy extends TankEnemy {
  static minWave = 3;

  constructor(x, y, config = {}) {
    super(x, y, {
      health: config.health || 120,
      speed: config.speed || 0.7,
      bounty: config.bounty || 35,
      armor: config.armor || 1,
      type: 'french_tank',
      ...config
    });
  }

  createBody() {
    const container = new PIXI.Container();
    
    // Tank base
    const base = new PIXI.Sprite();
    base.anchor.set(0.5);
    
    PIXI.Assets.load(frenchtankpic).then((texture) => {
      base.texture = texture;
      base.width = 80;
      base.height = 60;
    }).catch((err) => console.error('Failed to load french_tank texture:', err));
    
    // Frenchman commander
    const commander = new PIXI.Sprite();
    commander.anchor.set(0.5);
    commander.y = -18;
    
    PIXI.Assets.load(frenchmanpic).then((texture) => {
      commander.texture = texture;
      commander.width = 45;
      commander.height = 45;
    }).catch((err) => console.error('Failed to load french_man texture:', err));
    
    container.addChild(base);
    container.addChild(commander);
    
    return container;
  }

  getBarWidth() { return 70; }
  getBarY() { return 55; }
}

/**
 * BossEnemy - Uses an external asset
 */
export class BossEnemy extends Enemy {
  static minWave = 5;
  
  constructor(x, y, config = {}) {
    super(x, y, {
      health: config.health || 500,
      speed: config.speed || 0.4,
      bounty: config.bounty || 100,
      armor: config.armor || 5,
      type: 'boss',
      ...config
    });
  }

  createSprite() {
    const container = new PIXI.Container();
    
    // Use an asset for the boss enemy, loaded via Assets to work in PIXI v8
    const body = new PIXI.Sprite();
    body.anchor.set(0.5);
    
    // Asynchronously load the texture
    PIXI.Assets.load(shippic).then((texture) => {
      body.texture = texture;
      body.width = 70;
      body.height = 70;
    }).catch((err) => console.error('Failed to load boss texture:', err));
    
    // Draw a health bar background
    const healthBarBg = new PIXI.Graphics();
    healthBarBg.rect(-35, -50, 70, 8);
    healthBarBg.fill({ color: 0x333333 });
    
    // Draw health bar
    this.healthBar = new PIXI.Graphics();
    this.updateHealthBar();
    
    container.addChild(body);
    container.addChild(healthBarBg);
    container.addChild(this.healthBar);
    
    return container;
  }

  updateHealthBar() {
    if (!this.healthBar) return;
    
    this.healthBar.clear();
    const healthPercent = this.getHealthPercent();
    const color = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.healthBar.rect(-35, -50, 70 * healthPercent, 8);
    this.healthBar.fill({ color });
  }
}
