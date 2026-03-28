import * as PIXI from 'pixi.js';
import { GameManager } from './GameManager.js';

// Create PIXI application
const app = new PIXI.Application();

async function init() {
  console.log('Initializing game...');
  
  const startMenu = document.getElementById('startMenu');
  const startBtn = document.getElementById('startBtn');
  const ui = document.getElementById('ui');

  if (startBtn) {
    console.log('Start button found, adding listener');
    startBtn.addEventListener('click', () => {
      console.log('Start button clicked!');
      startMenu.style.display = 'none';
      ui.style.display = 'flex';
      
      // Initialize PIXI if not already initialized
      if (window.gameManager) {
        console.log('Spawning first wave...');
        setTimeout(() => {
          window.gameManager.spawnWave();
        }, 2000);
      }
    });
  } else {
    console.error('Start button NOT found in DOM');
  }

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
  window.gameManager = gameManager;

  // Draw terrain, grid and path
  gameManager.drawTerrain();
  gameManager.drawGrid();
  gameManager.drawPath();
  gameManager.renderLandmarks();

  // Game loop
  app.ticker.add((delta) => {
    gameManager.update(delta.deltaTime);
    
    // Update UI
    document.getElementById('gold').textContent = Math.floor(gameManager.gold);
    document.getElementById('lives').textContent = gameManager.lives;
    document.getElementById('score').textContent = gameManager.score;
    document.getElementById('wave').textContent = gameManager.wave;
  });

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
