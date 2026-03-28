import * as PIXI from 'pixi.js';
import { GameManager } from './GameManager.js';

// Create PIXI application
const app = new PIXI.Application();

async function init() {
  // Initialize PIXI (Required in v8)
  await app.init({
    width: 800,
    height: 600,
    backgroundColor: 0x1a1a2e,
  });

  // Append to #app div instead of body
  document.getElementById('app').appendChild(app.canvas);

  // Initialize game manager
  const gameManager = new GameManager(app);

  // Draw grid and path
  gameManager.drawGrid();
  gameManager.drawPath();

  // Spawn first wave after 2 seconds
  setTimeout(() => {
    gameManager.spawnWave();
  }, 2000);

  // Game loop
  app.ticker.add((delta) => {
    gameManager.update(delta.deltaTime);
    
    // Update UI
    document.getElementById('gold').textContent = Math.floor(gameManager.gold);
    document.getElementById('lives').textContent = gameManager.lives;
    document.getElementById('score').textContent = gameManager.score;
    document.getElementById('wave').textContent = gameManager.wave;
  });

  // Expose gameManager to console for debugging
  window.gameManager = gameManager;
}

init();
