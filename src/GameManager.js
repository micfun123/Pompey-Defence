import * as PIXI from 'pixi.js';
import { Tower } from './Tower.js';
import { Enemy, FastEnemy, TankEnemy, BossEnemy } from './Enemy.js';
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
    this.waveSpawning = false;

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
    
    graphics.stroke({ color: 0x444444, width: 1, alpha: 0.3 });
    
    this.container.addChildAt(graphics, 0);
  }

  /**
   * Draw the enemy path on the canvas
   */
  drawPath() {
    const graphics = new PIXI.Graphics();
    
    // Draw the path line
    if (this.path.length > 0) {
      graphics.moveTo(this.path[0].x, this.path[0].y);
      for (let i = 1; i < this.path.length; i++) {
        graphics.lineTo(this.path[i].x, this.path[i].y);
      }
    }
    
    graphics.stroke({ color: 0x00ff00, width: 20, alpha: 0.2, cap: 'round', join: 'round' });
    
    // Draw thin center line
    const centerLine = new PIXI.Graphics();
    if (this.path.length > 0) {
      centerLine.moveTo(this.path[0].x, this.path[0].y);
      for (let i = 1; i < this.path.length; i++) {
        centerLine.lineTo(this.path[i].x, this.path[i].y);
      }
    }
    centerLine.stroke({ color: 0x00ff00, width: 2, alpha: 0.8 });
    
    this.container.addChildAt(graphics, 1); // Add above grid
    this.container.addChildAt(centerLine, 2);
  }

  /**
   * Handle canvas clicks (for tower placement)
   */
  onCanvasClick(x, y) {
    // Snap to grid (center of grid cell)
    const gridSize = 50;
    const snappedX = Math.floor(x / gridSize) * gridSize + gridSize / 2;
    const snappedY = Math.floor(y / gridSize) * gridSize + gridSize / 2;
    
    if (this.canPlaceTower(snappedX, snappedY)) {
      this.placeTower(snappedX, snappedY);
    }
  }

  /**
   * Check if tower can be placed at position
   */
  canPlaceTower(x, y) {
    // Check if on path (very simple check: too close to path points)
    // In a real game, you would check distance to all segments
    for (let i = 0; i < this.path.length - 1; i++) {
      const p1 = this.path[i];
      const p2 = this.path[i+1];
      
      // Distance from point to line segment

      //const distance = this.distToSegment({x, y}, p1, p2);
      //if (distance < 25) return false;
    }


    // Check if too close to other towers
    return !this.towers.some(tower => {
      const dx = tower.x - x;
      const dy = tower.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 40;
    });
  }

  distToSegment(p, v, w) {
    const l2 = (v.x - w.x)**2 + (v.y - w.y)**2;
    if (l2 === 0) return Math.sqrt((p.x - v.x)**2 + (p.y - v.y)**2);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.sqrt((p.x - (v.x + t * (w.x - v.x)))**2 + (p.y - (v.y + t * (w.y - v.y)))**2);
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
    
    // Determine available enemy types for this wave
    const availableTypes = [Enemy, FastEnemy, TankEnemy, BossEnemy].filter(type => type.minWave <= this.wave);

    for (let i = 0; i < enemyCount; i++) {
      setTimeout(() => {
        // Randomly pick an enemy type from available types
        const EnemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        
        const enemyConfig = {
          health: (50 + this.wave * 10) * (EnemyType === BossEnemy ? 10 : EnemyType === TankEnemy ? 2 : EnemyType === FastEnemy ? 0.6 : 1),
          speed: (1 + this.wave * 0.1) * (EnemyType === BossEnemy ? 0.5 : EnemyType === FastEnemy ? 1.5 : EnemyType === TankEnemy ? 0.5 : 1),
          bounty: (10 + this.wave * 5) * (EnemyType === BossEnemy ? 10 : EnemyType === TankEnemy ? 2.5 : EnemyType === FastEnemy ? 1.2 : 1),
          path: this.path,
        };

        const enemy = new EnemyType(this.path[0].x, this.path[0].y, enemyConfig);
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
    });

    // Update projectiles
    this.projectiles.forEach(projectile => {
      projectile.update(delta);

      if (projectile.hasHitTarget()) {
        // Check collision with enemies
        this.enemies.forEach(enemy => {
          if (enemy.isAlive() && 
              Math.abs(projectile.x - enemy.x) < 20 && 
              Math.abs(projectile.y - enemy.y) < 20) {
            const isDead = enemy.takeDamage(projectile.damage);
            if (isDead) {
              this.gold += enemy.bounty;
              this.score += enemy.bounty;
            }
          }
        });
      }
    });

    // Check for lost lives and reward gold BEFORE filtering
    this.enemies.forEach(enemy => {
      if (!enemy.active && enemy.health > 0 && enemy.pathIndex >= this.path.length) {
        this.lives -= 1;
        if (this.lives <= 0) {
          this.lives = 0;
          this.gameOver = true;
          this.showGameOver();
        }
      }
    });

    // Remove inactive objects
    this.towers.forEach(t => { if (!t.active) t.destroy(); });
    this.enemies.forEach(e => { if (!e.active) e.destroy(); });
    this.projectiles.forEach(p => { if (!p.active) p.destroy(); });
    
    this.towers = this.towers.filter(t => t.active);
    this.enemies = this.enemies.filter(e => e.active);
    this.projectiles = this.projectiles.filter(p => p.active);

    // Auto-spawn next wave if all enemies are gone
    if (this.enemies.length === 0 && !this.gameOver) {
      if (!this.waveSpawning) {
        this.waveSpawning = true;
        setTimeout(() => {
          this.wave += 1;
          this.spawnWave();
          this.waveSpawning = false;
        }, 3000);
      }
    }
  }

  showGameOver() {
    const text = new PIXI.Text({
      text: 'GAME OVER',
      style: {
        fontFamily: 'Arial',
        fontSize: 64,
        fill: 0xff0000,
        align: 'center',
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 }
      }
    });
    text.anchor.set(0.5);
    text.x = 400;
    text.y = 300;
    this.app.stage.addChild(text);
  }
}
