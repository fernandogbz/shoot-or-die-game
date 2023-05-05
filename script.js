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
    // to specify the color
    ctx.fillStyle = this.color;
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

const x = canvas.width / 2;
const y = canvas.height /2;

const player = new Player(x, y, 30, 'blue'); // x, y, radius, color

//Player calls draw function
player.draw();

const projectile = new Projectile(
  canvas.width / 2, // event.clientYX captures where the event happened (the position in the canvas)
  canvas.height / 2, 
  5, 
  "red", 
  {
    x:1,
    y:1
  }
); 

const projectiles = [projectile];

function animate() {
  requestAnimationFrame(animate);
  // For each projectile within the projectiles array we call the projectile update function
  projectiles.forEach(projectile => {
    projectile.update();
  }) 
}
window.addEventListener("click", (event) => {
});

animate()