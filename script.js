const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreSpan = document.querySelector("#scoreNumber");
const startGameBtn = document.querySelector("#startGameBtn");
const modalElement = document.querySelector("#modalElement");
const bigScore = document.querySelector("#bigScore");
const startModal = document.getElementById("startModal");
const endModal = document.getElementById("endModal");
const restartGameBtn = document.getElementById("restartGameBtn");

let events = ["click", "touchstart"];

function isTouchDevice() {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
}

// class for the player
class Player {
  // The constructor is called each time you instiate a new version of the player class, and we're gonna give it these individual properties to differentiate it from other players we might create
  constructor(x, y, radius, color) {
    // Properties the player has
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  // to draw the player
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false); //x, y, radius, start angle, end angle and drawCounterClockwise
    ctx.fillStyle = this.color; // to specify the color
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

// Every time there are multiple instances of something create a new class
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player;
let projectiles;
let enemies;
let particles;
let score;
let spawnEnemiesIntervalId;
let isPaused = false;
let gameStartTime;
let timerIntervalId;
let pausedTime = 0;
let totalPausedTime = 0;
let enemiesKilled = 0;
let projectilesShot = 0;
let maxSpeed = 1.0;

function init() {
  // clear canvas background color
  ctx.fillStyle = "black"; // background color
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // initialize all game state here
  player = new Player(x, y, 15, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreSpan.innerHTML = score;
  bigScore.innerHTML = score;

  // clear any existing spawn interval
  if (spawnEnemiesIntervalId) {
    clearInterval(spawnEnemiesIntervalId);
  }

  // Initialize timer
  gameStartTime = Date.now();
  totalPausedTime = 0;
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
  }
  updateTimer();
  timerIntervalId = setInterval(updateTimer, 1000);

  // Reset stats
  enemiesKilled = 0;
  projectilesShot = 0;
  maxSpeed = 1.0;
}

function updateTimer() {
  const currentTime = Date.now();
  const elapsedSeconds = Math.floor(
    (currentTime - gameStartTime - totalPausedTime) / 1000
  );

  // Format time as minutes:seconds
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  // Format with leading zeros and show minutes only when needed
  const timeDisplay =
    minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, "0")}m`
      : `${seconds}s`;

  document.getElementById("timer").textContent = timeDisplay;
}

function spawnEnemies() {
  // clear any existing interval before starting a new one
  if (spawnEnemiesIntervalId) {
    clearInterval(spawnEnemiesIntervalId);
  }

  spawnEnemiesIntervalId = setInterval(() => {
    // Don't spawn enemies if the game is paused
    if (isPaused) return;

    const radius = Math.random() * (30 - 5) + 5; // generate a random number up to 30, and to to create enemies from different sizes between 5 and 30 of radius, subtract the minimum to the maximum, and add the minimum to the whole math.random

    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius; // if the value for math.random is less than .5 assign the value 0 - radius(this is 0 in the canvas minus the radius of the enemy to spawn it outside the canvas on the left), but if it's greater execute the second value (which spawns enemies on the right hand of the screen)
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`; // hsl stands for hue, saturation and lightness, template literal math.random will pick a random number between 0 and 360 and generate random enemies with those colors every time an enemy is created

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    // The velocityMultiplier increases enemy speed as the score increases:
    // - Starts at 1 when score is 0
    // - Increases linearly, reaching x1.5 at 20,000 score
    // - Reaches a maximum of x2 at 40,000 score
    const velocityMultiplier = Math.min(1 + score / 40000, 2);
    // Update max speed if current speed is higher
    maxSpeed = Math.max(maxSpeed, velocityMultiplier);
    // Update the velocity multiplier display
    document.getElementById("velocityMultiplier").textContent =
      velocityMultiplier.toFixed(1);

    const velocity = {
      x: Math.cos(angle) * velocityMultiplier,
      y: Math.sin(angle) * velocityMultiplier,
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
    console.log(enemies);
  }, 1000);
}

let animationId;
function animate() {
  if (isPaused) return;
  animationId = requestAnimationFrame(animate);
  // For each projectile within the projectiles array we call the projectile update function
  ctx.fillStyle = "rgba(0, 0, 0 , 0.1)"; // background color
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //Player calls draw function
  player.draw();

  // Particles appear and disappear
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });

  projectiles.forEach((projectile, index) => {
    projectile.update();

    // Remove projectile if it's off the screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, index) => {
    enemy.update();
    // Distance between the player and the enemy
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    // End game
    if (distance - enemy.radius - player.radius < 1) {
      console.log("Game Over");
      cancelAnimationFrame(animationId);
      clearInterval(spawnEnemiesIntervalId);
      clearInterval(timerIntervalId);

      // Update final stats
      document.getElementById("finalTime").textContent =
        document.getElementById("timer").textContent;
      document.getElementById("maxSpeed").textContent =
        maxSpeed.toFixed(1) + "x";
      document.getElementById("enemiesKilled").textContent = enemiesKilled;
      document.getElementById("projectilesShot").textContent = projectilesShot;

      endModal.style.display = "flex";
      bigScore.innerHTML = score;
    }

    projectiles.forEach((projectile, projectileIndex) => {
      // Distance between the projectile and the enemy
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      ); // hypot stands for hypotenuse, which is fancy speak for the distance between two points

      // Detect if the projectile hits the enemy
      if (distance - enemy.radius - projectile.radius < 1) {
        //Create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }

        if (enemy.radius - 10 > 5) {
          // enemy radius alone will create very small enemies and makes it difficult to see (might be a next level of difficulty to create later) but for now when the enemy is less than 10px will be removed

          //Increase the score if enemy shrinks
          score += 50;
          scoreSpan.innerHTML = score;

          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          //remove from scene altogether

          //Increase the score if enemy is killed
          score += 100;
          scoreSpan.innerHTML = score;
          enemiesKilled++; // Track kills

          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
}

events.forEach((eventType) => {
  window.addEventListener(eventType, (event) => {
    console.log(projectiles);
    //atan2 produces the angle based on the y and x (in that order idk why) distance of the mouse from a particular coordinate
    const angle = !isTouchDevice()
      ? Math.atan2(
          event.clientY - canvas.height / 2,
          event.clientX - canvas.width / 2
        )
      : Math.atan2(
          event.touches[0].clientY - canvas.height / 2,
          event.touches[0].clientX - canvas.width / 2
        ); // To get the distance of the mouse from the center of the screen, we take the direction, which is event(wherever the mouse is clicking) and the center of the screen

    const velocity = {
      x: Math.cos(angle) * 5, // to get the x velocity reference math.cos, cause cosine is always for the x adjacent axis. This is gonna return any number negative one to one
      y: Math.sin(angle) * 5, // same than above, returns any number negative. But cosine and sine together are going to produce two different results to have a perfect ratio to start pushing the projectile to wherever the player clicks on the screen
    };

    //Creates projectiles
    projectiles.push(
      new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
    );
    projectilesShot++;
  });
});

startGameBtn.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  startModal.style.display = "none";
});

const pauseBtn = document.getElementById("pauseBtn");
const pauseIcon = document.getElementById("pauseIcon");
pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseIcon.innerHTML = isPaused ? "&#9654;" : "&#10073;&#10073;"; // ▶ or ||

  if (isPaused) {
    // Store the time when paused
    pausedTime = Date.now();
    // Clear the timer interval
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  } else {
    // Calculate total paused time
    totalPausedTime += Date.now() - pausedTime;
    // Resume animation
    animate();
    // Start a new timer interval
    timerIntervalId = setInterval(updateTimer, 1000);
  }
});

// Add event listener for restart button
restartGameBtn.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  endModal.style.display = "none";
});
