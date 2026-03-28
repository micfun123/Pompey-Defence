import * as PIXI from 'pixi.js';
import { Tower } from './Tower.js';
import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';

/**
 * GameManager - handles game state, updates, and interactions
 */
export class GameManager {
  constructor(app) {
    this.app = app;
    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.wave = 1;
    this.gold = 500;
    this.lives = 20;
    this.score = 0;
    this.gameOver = false;

    // Game path setup (example)
    this.path = [
      { x: 0, y: 300 },
      { x: 200, y: 300 },
      { x: 200, y: 100 },
      { x: 400, y: 100 },
      { x: 400, y: 500 },
      { x: 600, y: 500 },
      { x: 600, y: 200 },
      { x: 800, y: 200 },
    ];

    this.setupEventListeners();
  }

  /**
   * Setup click listeners for tower placement
   */
  setupEventListeners() {
    this.container.interactive = true;
    this.container.on('pointerdown', (event) => {
      const pos = event.global;
      this.onCanvasClick(pos.x, pos.y);
    });
  }

  /**
   * Draw the map grid
   */
  drawGrid() {
    const graphics = new PIXI.Graphics();
    graphics.stroke({ color: 0x444444, width: 1, alpha: 0.3 });
    
    const gridSize = 50;
    
    // Vertical lines
    for (let x = 0; x <= 800; x += gridSize) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 600);
    }
    
    // Horizontal lines
    for (let y = 0; y <= 600; y += gridSize) {
      graphics.moveTo(0, y);
      graphics.lineTo(800, y);
    }
    
    this.container.addChildAt(graphics, 0);
  }

  /**
   * Draw the enemy path on the canvas
   */
  drawPath() {
    const graphics = new PIXI.Graphics();
    graphics.stroke({ color: 0x00ff00, width: 4, alpha: 0.7 });
    
    // Draw the path line
    if (this.path.length > 0) {
      graphics.moveTo(this.path[0].x, this.path[0].y);
      for (let i = 1; i < this.path.length; i++) {
        graphics.lineTo(this.path[i].x, this.path[i].y);
      }
    }
    
    this.container.addChildAt(graphics, 1); // Add above grid
  }

  /**
   * Handle canvas clicks (for tower placement)
   */
  onCanvasClick(x, y) {
    if (this.canPlaceTower(x, y)) {
      this.placeTower(x, y);
    }
  }

  /**
   * Check if tower can be placed at position
   */
  canPlaceTower(x, y) {
    // Check if too close to other towers
    return !this.towers.some(tower => {
      const dx = tower.x - x;
      const dy = tower.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 40;
    });
  }

  /**
   * Place a new tower
   */
  placeTower(x, y, towerConfig = {}) {
    const cost = towerConfig.cost || 100;
    if (this.gold < cost) {
      console.log('Not enough gold!');
      return false;
    }

    const tower = new Tower(x, y, towerConfig);
    this.towers.push(tower);
    this.gold -= cost;
    tower.render(this.container);
    return true;
  }

  /**
   * Spawn a wave of enemies
   */
  spawnWave(waveConfig = {}) {
    const enemyCount = waveConfig.count || (5 + this.wave * 2);
    const enemyConfigBase = {
      health: 50 + this.wave * 10,
      speed: 1 + this.wave * 0.1,
      bounty: 10 + this.wave * 5,
      path: this.path,
    };

    for (let i = 0; i < enemyCount; i++) {
      setTimeout(() => {
        const enemy = new Enemy(this.path[0].x, this.path[0].y, enemyConfigBase);
        this.enemies.push(enemy);
        enemy.render(this.container);
      }, i * 500); // Spawn enemies with delay
    }
  }

  /**
   * Fire a projectile from tower to enemy
   */
  createProjectile(tower, enemy) {
    const projectile = new Projectile(
      tower.x,
      tower.y,
      enemy.x,
      enemy.y,
      { damage: tower.damage }
    );
    this.projectiles.push(projectile);
    projectile.render(this.container);
  }

  /**
   * Main update loop
   */
  update(delta) {
    if (this.gameOver) return;

    // Update towers
    this.towers.forEach(tower => {
      tower.update(delta);

      // Find nearest enemy in range
      let targetEnemy = null;
      let closestDistance = tower.range + 1;

      this.enemies.forEach(enemy => {
        if (!enemy.isAlive()) return;
        const distance = tower.getDistanceTo(enemy.x, enemy.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          targetEnemy = enemy;
        }
      });

      // Shoot at target
      if (targetEnemy && tower.canShoot(delta)) {
        this.createProjectile(tower, targetEnemy);
        tower.resetShotTimer();
      }
    });

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(delta);
      if (!enemy.isAlive() && enemy.health <= 0) {
        this.gold += enemy.bounty;
        this.score += enemy.bounty;
      }
    });

    // Update projectiles
    this.projectiles.forEach(projectile => {
      projectile.update(delta);

      if (projectile.hasHitTarget()) {
        // Check collision with enemies
        this.enemies.forEach(enemy => {
          if (
            Math.abs(projectile.x - enemy.x) < 10 &&
            Math.abs(projectile.y - enemy.y) < 10
          ) {
            const isDead = enemy.takeDamage(projectile.damage);
            if (isDead) {
              this.gold += enemy.bounty;
              this.score += enemy.bounty;
            }
          }
        });
      }
    });

    // Remove inactive objects
    this.towers = this.towers.filter(t => t.active);
    this.enemies = this.enemies.filter(e => e.active);
    this.projectiles = this.projectiles.filter(p => p.active);

    // Check for lost lives
    this.enemies.forEach(enemy => {
      if (!enemy.active && enemy.pathIndex >= enemy.path.length) {
        this.lives -= 1;
        if (this.lives <= 0) {
          this.gameOver = true;
          console.log('Game Over!');
        }
      }
    });
  }
}
