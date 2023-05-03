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
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
  }
}

const player = new Player()