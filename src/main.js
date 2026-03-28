<<<<<<< HEAD
import * as PIXI from 'pixi.js';
import { GameManager } from './GameManager.js';

// Create PIXI application
const app = new PIXI.Application({
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
  gameManager.update(delta);
  
  // Update UI
  document.getElementById('gold').textContent = gameManager.gold;
  document.getElementById('lives').textContent = gameManager.lives;
  document.getElementById('score').textContent = gameManager.score;
  document.getElementById('wave').textContent = gameManager.wave;
});

// Expose gameManager to console for debugging
window.gameManager = gameManager;
=======
// description: This example demonstrates how to use a Container to group and manipulate multiple sprites
import { Application, Assets, Container, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Create and add a container to the stage
  const container = new Container();

  app.stage.addChild(container);

  // Load the bunny texture
  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

  // Create a 5x5 grid of bunnies in the container
  for (let i = 0; i < 25; i++) {
    const bunny = new Sprite(texture);

    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
  }

  // Move the container to the center
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  // Center the bunny sprites in local container coordinates
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;

  // Listen for animate update
  app.ticker.add((time) => {
    // Continuously rotate the container!
    // * use delta to create frame-independent transform *
    container.rotation -= 0.01 * time.deltaTime;
  });
})();
>>>>>>> d6f28d18984e4d6e40e96438b6acc35a09697eb8
