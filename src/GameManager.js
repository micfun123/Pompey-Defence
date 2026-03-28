import * as PIXI from 'pixi.js';
import { Tower, StrongerTower, DogTower } from './Tower.js';
import { Enemy, FastEnemy, TankEnemy, BossEnemy, FrenchTankEnemy } from './Enemy.js';
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
    this.selectedTowerType = 'basic'; // Track selected tower
    this.previewTower = null; // Tower preview for range visualization

    // Game path setup - A large winding route
    this.path = [
      { x: 0, y: 200 },
      { x: 300, y: 200 },
      { x: 300, y: 500 },
      { x: 150, y: 500 },
      { x: 150, y: 800 },
      { x: 600, y: 800 },
      { x: 600, y: 300 },
      { x: 1000, y: 300 },
      { x: 1000, y: 700 },
      { x: 1400, y: 700 },
      { x: 1400, y: 400 },
      { x: 1800, y: 400 },
      { x: 2000, y: 400 },
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

    this.container.on('pointermove', (event) => {
      const pos = event.global;
      this.updatePreview(pos.x, pos.y);
    });

    this.container.on('pointerout', () => {
      if (this.previewTower) {
        this.previewTower.visible = false;
      }
    });
  }

  /**
   * Update tower preview position and range
   */
  updatePreview(x, y) {
    const gridSize = 80;
    const snappedX = Math.floor(x / gridSize) * gridSize + gridSize / 2;
    const snappedY = Math.floor(y / gridSize) * gridSize + gridSize / 2;

    if (!this.previewTower) {
      this.previewTower = new PIXI.Graphics();
      this.container.addChild(this.previewTower);
    }

    this.previewTower.clear();
    this.previewTower.visible = true;
    this.previewTower.x = snappedX;
    this.previewTower.y = snappedY;

    const info = this.getTowerPlacementInfo(this.selectedTowerType);
    const canPlace = this.canPlaceTower(snappedX, snappedY);
    const color = canPlace ? 0x00ff00 : 0xff0000;

    // Range circle
    this.previewTower.circle(0, 0, info.range);
    this.previewTower.stroke({ color: color, width: 2, alpha: 0.3 });
    this.previewTower.fill({ color: color, alpha: 0.1 });

    // Placement constraint indicators
    // Min distance (red-ish)
    this.previewTower.circle(0, 0, info.minPathDist);
    this.previewTower.stroke({ color: 0xff0000, width: 1, alpha: 0.2 });
    
    // Max distance (blue-ish)
    this.previewTower.circle(0, 0, info.maxPathDist);
    this.previewTower.stroke({ color: 0x0000ff, width: 1, alpha: 0.2 });

    // Tower placeholder
    this.previewTower.circle(0, 0, 25);
    this.previewTower.fill({ color: color, alpha: 0.5 });
  }

  /**
   * Draw the island terrain
   */
  drawTerrain() {
    const width = this.app.screen.width;
    const height = this.app.screen.height;

    const water = new PIXI.Graphics();
    water.rect(0, 0, width, height);
    water.fill({ color: 0x1e90ff }); // Dodger Blue
    
    const island = new PIXI.Graphics();
    // Large green area for the island
    island.rect(50, 50, width - 100, height - 100);
    island.fill({ color: 0x228b22, alpha: 0.8 }); // Forest Green
    island.stroke({ color: 0xdeb887, width: 10 }); // Burlywood beach
    
    this.container.addChildAt(water, 0);
    this.container.addChildAt(island, 1);
  }

  /**
   * Draw the map grid
   */
  drawGrid() {
    const graphics = new PIXI.Graphics();
    const gridSize = 80;
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, height);
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      graphics.moveTo(0, y);
      graphics.lineTo(width, y);
    }
    
    graphics.stroke({ color: 0x444444, width: 1, alpha: 0.3 });
    
    this.container.addChildAt(graphics, 2); // Above island(1), below path(3)
  }

  /**
   * Draw the enemy path on the canvas
   */
  drawPath() {
    const graphics = new PIXI.Graphics();
    
    // Draw the path line (Sand/Dirt road)
    if (this.path.length > 0) {
      graphics.moveTo(this.path[0].x, this.path[0].y);
      for (let i = 1; i < this.path.length; i++) {
        graphics.lineTo(this.path[i].x, this.path[i].y);
      }
    }
    
    graphics.stroke({ color: 0xf4a460, width: 60, alpha: 0.8, cap: 'round', join: 'round' }); // Sandy brown
    
    // Draw thin center line
    const centerLine = new PIXI.Graphics();
    if (this.path.length > 0) {
      centerLine.moveTo(this.path[0].x, this.path[0].y);
      for (let i = 1; i < this.path.length; i++) {
        centerLine.lineTo(this.path[i].x, this.path[i].y);
      }
    }
    centerLine.stroke({ color: 0xd2b48c, width: 2, alpha: 0.5 }); // Tan
    
    this.container.addChildAt(graphics, 3); // Above water(0), island(1), grid(2)
    this.container.addChildAt(centerLine, 4);
  }

  /**
   * Handle canvas clicks (for tower placement)
   */
  onCanvasClick(x, y) {
    // Snap to grid (center of grid cell)
    const gridSize = 80;
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
    const info = this.getTowerPlacementInfo(this.selectedTowerType);
    
    let minDistanceToPath = Infinity;

    // Check distance to all path segments to find the closest point on the path
    for (let i = 0; i < this.path.length - 1; i++) {
      const p1 = this.path[i];
      const p2 = this.path[i+1];
      const distance = this.distToSegment({x, y}, p1, p2);
      if (distance < minDistanceToPath) {
        minDistanceToPath = distance;
      }
    }

    // Constraint 1: Must NOT be too close (min distance)
    if (minDistanceToPath < info.minPathDist) return false;

    // Constraint 2: Must be within "next to" range (max distance)
    if (minDistanceToPath > info.maxPathDist) return false;

    // Check if too close to other towers
    return !this.towers.some(tower => {
      const dx = tower.x - x;
      const dy = tower.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 60;
    });
  }

  /**
   * Get placement constraints for tower type
   */
  getTowerPlacementInfo(type) {
    if (type === 'stronger') {
      return { minPathDist: 50, maxPathDist: 300, range: 300 };
    }
    if (type === 'dog') {
      return { minPathDist: 20, maxPathDist: 120, range: 80 };
    }
    return { minPathDist: 25, maxPathDist: 100, range: 100 };
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
  placeTower(x, y) {
    let tower;
    let cost = 100;

    if (this.selectedTowerType === 'stronger') {
      cost = 250;
      if (this.gold < cost) {
        console.log('Not enough gold for Stronger Tower!');
        return false;
      }
      tower = new StrongerTower(x, y);
    } else if (this.selectedTowerType === 'dog') {
      cost = 50;
      if (this.gold < cost) {
        console.log('Not enough gold for Dog Tower!');
        return false;
      }
      tower = new DogTower(x, y);
    } else {
      if (this.gold < cost) {
        console.log('Not enough gold for Basic Tower!');
        return false;
      }
      tower = new Tower(x, y);
    }

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
    const availableTypes = [Enemy, FastEnemy, FrenchTankEnemy, TankEnemy, BossEnemy].filter(type => type.minWave <= this.wave);

    for (let i = 0; i < enemyCount; i++) {
      setTimeout(() => {
        // Randomly pick an enemy type from available types
        const EnemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        
        const enemyConfig = {
          health: (50 + this.wave * 10) * (
            EnemyType === BossEnemy ? 10 : 
            EnemyType === TankEnemy ? 2 : 
            EnemyType === FrenchTankEnemy ? 1.5 : 
            EnemyType === FastEnemy ? 0.6 : 1
          ),
          speed: (1 + this.wave * 0.1) * (
            EnemyType === BossEnemy ? 0.5 : 
            EnemyType === FastEnemy ? 1.5 : 
            (EnemyType === TankEnemy || EnemyType === FrenchTankEnemy) ? 0.5 : 1
          ),
          bounty: (10 + this.wave * 5) * (
            EnemyType === BossEnemy ? 10 : 
            EnemyType === TankEnemy ? 2.5 : 
            EnemyType === FrenchTankEnemy ? 1.8 : 
            EnemyType === FastEnemy ? 1.2 : 1
          ),
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
        // Check collision with enemies - increased radius for larger sprites
        this.enemies.forEach(enemy => {
          if (enemy.isAlive() && 
              Math.abs(projectile.x - enemy.x) < 50 && 
              Math.abs(projectile.y - enemy.y) < 50) {
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
    text.x = this.app.screen.width / 2;
    text.y = this.app.screen.height / 2;
    this.app.stage.addChild(text);
  }
}
