import * as PIXI from 'pixi.js';

/**
 * Base class for all game objects (towers, enemies, projectiles)
 */
export class GameObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = null;
    this.active = true;
  }

  /**
   * Create the sprite for this object (override in subclasses)
   */
  createSprite() {
    // Default: create a simple colored rectangle
    const graphics = new PIXI.Graphics();
    graphics.fill(0xffffff);
    graphics.rect(0, 0, 32, 32);
    graphics.fill();
    return graphics;
  }

  /**
   * Update logic (called each frame)
   */
  update(delta) {
    if (this.sprite) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
    }
  }

  /**
   * Draw the object
   */
  render(container) {
    if (!this.sprite) {
      this.sprite = this.createSprite();
    }
    container.addChild(this.sprite);
  }

  /**
   * Remove from the game
   */
  destroy() {
    this.active = false;
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
