const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

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
    ctx.beginPath()
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
    ctx.beginPath()
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
    ctx.beginPath()
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

const x = canvas.width / 2;
const y = canvas.height /2;

const player = new Player(x, y, 30, 'blue'); // x, y, radius, color
const projectiles = [];
const enemies = [];

function spawnEnemies(){
  // The first parameter of setInterval is the callback function (the code that is actually called for each specific interval specified) and the second is the time that it's going to go by between iteration of this call in miliseconds
  // setInterval(()=> {
    const radius = Math.random() * (30 - 5) + 5; // generate a random number up to 30, and to to create enemies from different sizes between 5 and 30 of radius, subtract the minimum to the maximum, and add the minimum to the whole math.random

    let x;
    let y;

    if(Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius; // if the value for math.random is less than .5 assign the value 0 - radius(this is 0 in the canvas minus the radius of the enemy to spawn it outside the canvas on the left), but if it's greater execute the second value (which spawns enemies on the right hand of the screen) 
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = "green"; 
    
    const angle = Math.atan2(canvas.height / 2 - y , canvas.width / 2 - x);

  const velocity = {
    x: Math.cos(angle),
    y:Math.sin(angle)
  }

    enemies.push(new Enemy(x, y, radius, color, velocity))
    console.log(enemies)
  // }, 1000)
};

function animate() {
  requestAnimationFrame(animate);
  // For each projectile within the projectiles array we call the projectile update function
  ctx.clearRect(0, 0, canvas.width, canvas.height);
//Player calls draw function
player.draw();
  projectiles.forEach(projectile => {
    projectile.update();
  }) 

  enemies.forEach(enemy => {
    enemy.update();

    projectiles.forEach(projectile => {
      const distance = Math.hypot(projectiles.x - enemy.x, projectile.y - enemy.y) // hypot stands for hypotenuse, which is fancy speak for the distance between two points
      console.log(distance)
    })
  });
}

window.addEventListener("click", (event) => {
  // To get the distance of the mouse from the center of the screen, we take the direction, which is event(wherever the mouse is clicking) and the center of the screen

  //atan2 produces the angle based on the y and x (in that order idk why) distance of the mouse from a particular coordinate
  const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);

  const velocity = {
    x: Math.cos(angle), // to get the x velocity reference math.cos, cause cosine is always for the x adjacent axis. This is gonna return any number negative one to one
    y:Math.sin(angle) // same than above, returns any number negative. But cosine and sine together are going to produce two different results to have a perfect ratio to start pushing the projectile to wherever the player clicks on the screen
  }

  projectiles.push(new Projectile(
    canvas.width / 2,
    canvas.height / 2,
    5,
    'red',
    velocity
    ))
});

animate()
spawnEnemies()