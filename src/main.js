import * as PIXI from 'pixi.js';
import { GameManager } from './GameManager.js';

// Create PIXI application
const app = new PIXI.Application();

async function init() {
  // Initialize PIXI (Required in v8)
  await app.init({
    resizeTo: window,
    backgroundColor: 0x1a1a2e,
    antialias: true,
  });

  // Append to #app div instead of body
  document.getElementById('app').appendChild(app.canvas);

  // Initialize game manager
  const gameManager = new GameManager(app);

  // Draw terrain, grid and path
  gameManager.drawTerrain();
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

  // Tower selection logic
  const basicBtn = document.getElementById('basicTowerBtn');
  const strongerBtn = document.getElementById('strongerTowerBtn');
  const dogBtn = document.getElementById('dogTowerBtn');

  basicBtn.addEventListener('click', () => {
    gameManager.selectedTowerType = 'basic';
    basicBtn.classList.add('selected');
    strongerBtn.classList.remove('selected');
    dogBtn.classList.remove('selected');
  });

  strongerBtn.addEventListener('click', () => {
    gameManager.selectedTowerType = 'stronger';
    strongerBtn.classList.add('selected');
    basicBtn.classList.remove('selected');
    dogBtn.classList.remove('selected');
  });

  dogBtn.addEventListener('click', () => {
    gameManager.selectedTowerType = 'dog';
    dogBtn.classList.add('selected');
    basicBtn.classList.remove('selected');
    strongerBtn.classList.remove('selected');
  });
}

init();
