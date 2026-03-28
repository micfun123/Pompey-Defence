import { GameObject } from './GameObject.js';
import * as PIXI from 'pixi.js';

/**
 * Landmark - points of interest to defend in Portsmouth
 */
export class Landmark extends GameObject {
  constructor(x, y, name, texturePath = null) {
    super(x, y);
    this.name = name;
    this.texturePath = texturePath;
  }

  createSprite() {
    const container = new PIXI.Container();

    // Add a simple marker background
    const marker = new PIXI.Graphics();
    marker.circle(0, 0, 15);
    marker.fill({ color: 0xffd700, alpha: 0.5 }); // Golden indicator
    marker.stroke({ color: 0xffffff, width: 2, alpha: 0.8 });
    container.addChild(marker);

    // Load sprite if texturePath is provided
    if (this.texturePath) {
      const body = new PIXI.Sprite();
      PIXI.Assets.load(this.texturePath).then((texture) => {
        body.texture = texture;
        body.width = 48;
        body.height = 48;
        body.anchor.set(0.5);
        body.y = -25; // Move sprite up above marker
      }).catch((err) => console.error(`Failed to load landmark texture for ${this.name}:`, err));
      container.addChild(body);
    }

    // Add name label
    const label = new PIXI.Text({
      text: this.name,
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffffff,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 2 },
        align: 'center'
      }
    });
    label.anchor.set(0.5, 0);
    label.y = 15; // Label below marker
    container.addChild(label);

    return container;
  }

  update(delta) {
    super.update(delta);
    // Landmarks are static, but maybe some animation later
  }
}
