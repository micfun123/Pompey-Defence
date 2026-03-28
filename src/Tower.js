import { GameObject } from './GameObject.js';
import * as PIXI from 'pixi.js';
import portlander_head from "./assets/portlander_head.png";
import spiniker from "./assets/spiniker.png";
import doggy from "./assets/doggy.png";

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
    this.minPathDist = config.minPathDist || 25; // Minimum distance from path
    this.maxPathDist = config.maxPathDist || 100; // Maximum distance from path (must be "next to" it)
    this.timeSinceLastShot = 0;
    this.level = 1;
    this.towerType = config.type || 'basic';
  }

  /**
   * Create tower sprite
   */
  createSprite() {
    const container = new PIXI.Container();

    const body = new PIXI.Sprite();

    PIXI.Assets.load(portlander_head).then((texture) => {
      body.texture = texture;
      body.width = 32;
      body.height = 32;
      body.anchor.set(0.5);
    }).catch((err) => console.error('Failed to load tower texture:', err));

    // Range indicator (at bottom)
    const rangeCircle = new PIXI.Graphics();
    rangeCircle.circle(0, 0, this.range);
    rangeCircle.stroke({ color: 0x00ff00, width: 1, alpha: 0.1 });
    
    container.addChild(rangeCircle);
    container.addChild(body);
    
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

/**
 * StrongerTower class - higher damage, cost, and different look
 */
export class StrongerTower extends Tower {
  constructor(x, y, config = {}) {
    const strongerConfig = {
      cost: 250,
      damage: 50,
      range: 300,
      fireRate: 0.5, // slower but more powerful
      minPathDist: 50, // Must be further from the path than basic
      maxPathDist: 300, // Can be placed much further away
      type: 'stronger',
      ...config
    };
    super(x, y, strongerConfig);
  }

  /**
   * Create stronger tower sprite
   */
  createSprite() {
    const container = new PIXI.Container();
    
    const body = new PIXI.Sprite();

    PIXI.Assets.load(spiniker).then((texture) => {
      body.texture = texture;
      body.width = 64;
      body.height = 64;
      body.anchor.set(0.5);
    }).catch((err) => console.error('Failed to load spiniker texture:', err));

    // Range indicator (at bottom)
    const rangeCircle = new PIXI.Graphics();
    rangeCircle.circle(0, 0, this.range);
    rangeCircle.stroke({ color: 0xff0000, width: 1, alpha: 0.1 });
    
    container.addChild(rangeCircle);
    container.addChild(body);
    
    return container;
  }
}

/**
 * DogTower class - cheaper, weaker, but faster firing
 */
export class DogTower extends Tower {
  constructor(x, y, config = {}) {
    const dogConfig = {
      cost: 50,
      damage: 5,
      range: 80,
      fireRate: 2, // fast firing
      minPathDist: 20,
      maxPathDist: 120,
      type: 'dog',
      ...config
    };
    super(x, y, dogConfig);
  }

  /**
   * Create dog tower sprite
   */
  createSprite() {
    const container = new PIXI.Container();
    
    const body = new PIXI.Sprite();

    PIXI.Assets.load(doggy).then((texture) => {
      body.texture = texture;
      body.width = 24;
      body.height = 24;
      body.anchor.set(0.5);
    }).catch((err) => console.error('Failed to load doggy texture:', err));

    // Range indicator (at bottom)
    const rangeCircle = new PIXI.Graphics();
    rangeCircle.circle(0, 0, this.range);
    rangeCircle.stroke({ color: 0xffff00, width: 1, alpha: 0.1 });
    
    container.addChild(rangeCircle);
    container.addChild(body);
    
    return container;
  }
}
