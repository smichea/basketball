const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let cw, ch;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cw = canvas.width;
  ch = canvas.height;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game Variables
let ball, backboard, rim, supportBeam;
let isDragging = false;
let dragStart = {};
let ballThrown = false; // Ball is only thrown when released
let currentScore = 0;
let bestScore = localStorage.getItem('bestScore') || 0;

document.getElementById('bestScore').textContent = bestScore;

// Constants
const gravity = 0.5;
const airResistance = 0.99;
const maxInitialVelocity = 20;

// Initialize Game Objects
function init() {
    ball = new Ball(cw / 2, ch / 2, 30); // Increased radius to 30, positioned 100px from the bottom
    backboard = new Backboard(cw / 2, 50, cw * 0.4, 10);
    rim = new Rim(cw / 2, backboard.y + backboard.height + 10, backboard.width * 0.3, 10);
    supportBeam = new SupportBeam(rim.x, rim.y + rim.height, 10, 100);
}

class Ball {
  constructor(x, y, radius) {
    this.originalRadius = radius;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
  }

  update() {
    // Ball only moves if it has been thrown
    if (!isDragging && ballThrown) {
      this.vy += gravity;
      this.vy *= airResistance;
      this.vx *= airResistance;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.vx * 0.05;
    }

    // Size Perspective
    this.radius = this.originalRadius * (1 - (this.y / ch) * 0.5);

    // Collision with edges
    if (this.x - this.radius < 0 || this.x + this.radius > cw) {
      this.vx *= -0.8;
      this.x = this.x - this.radius < 0 ? this.radius : cw - this.radius;
    }
    if (this.y - this.radius < 0) {
      this.vy *= -0.8;
      this.y = this.radius;
    }
    if (this.y - this.radius > ch) {
      // Ball touched bottom without scoring
      resetGame();
    }

    // Rim Collision
    rim.checkCollision(this);

    // Scoring
    if (this.vy > 0 && this.x > rim.x - rim.width / 2 && this.x < rim.x + rim.width / 2 && this.y - this.radius > rim.y && this.y - this.radius < rim.y + rim.height) {
      currentScore += 1;
      updateScore();
      resetBall();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FF8C00';
    ctx.fill();
    // Basketball seams
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.moveTo(-this.radius, 0);
    ctx.lineTo(this.radius, 0);
    ctx.moveTo(0, -this.radius);
    ctx.lineTo(0, this.radius);
    ctx.stroke();
    ctx.restore();
  }
}

class Backboard {
  constructor(x, y, width, height) {
    this.x = x - width / 2;
    this.y = y;
    this.width = width;
    this.height = height;
    this.innerSquare = {
      x: x - width * 0.2,
      y: y + height + 10,
      width: width * 0.4,
      height: width * 0.4,
    };
  }

  draw() {
    // Backboard
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Inner Square
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.innerSquare.x, this.innerSquare.y, this.innerSquare.width, this.innerSquare.height);
  }
}

class Rim {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.leftZone = {
      x: x - width / 2,
      y: y,
      width: 5,
      height: height,
    };
    this.rightZone = {
      x: x + width / 2 - 5,
      y: y,
      width: 5,
      height: height,
    };
  }

  checkCollision(ball) {
    // Left Zone
    if (ball.vy > 0 && isColliding(ball, this.leftZone)) {
      ball.vx *= -0.5;
      ball.vy *= -0.8;
      ball.x = this.leftZone.x - ball.radius;
    }
    // Right Zone
    if (ball.vy > 0 && isColliding(ball, this.rightZone)) {
      ball.vx *= -0.5;
      ball.vy *= -0.8;
      ball.x = this.rightZone.x + this.rightZone.width + ball.radius;
    }
  }

  draw() {
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
  }
}

class SupportBeam {
  constructor(x, y, width, height) {
    this.x = x - width / 2;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw() {
    ctx.fillStyle = '#A9A9A9';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// Utility Functions
function isColliding(ball, rect) {
  return (
    ball.x + ball.radius > rect.x &&
    ball.x - ball.radius < rect.x + rect.width &&
    ball.y + ball.radius > rect.y &&
    ball.y - ball.radius < rect.y + rect.height
  );
}

function resetBall() {
  ball.x = cw / 2;
  ball.y = ch /2;
  ball.vx = 0;
  ball.vy = 0;
  ballThrown = false; // Ball is stationary again
}

function resetGame() {
  if (currentScore > bestScore) {
    bestScore = currentScore;
    localStorage.setItem('bestScore', bestScore);
    document.getElementById('bestScore').textContent = bestScore;
  }
  currentScore = 0;
  updateScore();
  resetBall();
}

function updateScore() {
  document.getElementById('currentScore').textContent = currentScore;
}

// Event Handlers
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('touchstart', startDrag);

function startDrag(e) {
  e.preventDefault();
  const pos = getMousePos(e);
  if (isInsideBall(pos)) {
    isDragging = true;
    dragStart = pos;
  }
}

canvas.addEventListener('mousemove', drag);
canvas.addEventListener('touchmove', drag);

function drag(e) {
  if (isDragging) {
    e.preventDefault();
    const pos = getMousePos(e);
    // Optionally, draw an arrow here to show the aiming direction
  }
}

canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('touchend', endDrag);

function endDrag(e) {
  if (isDragging) {
    e.preventDefault();
    const pos = getMousePos(e);
    const dx = dragStart.x - pos.x;
    const dy = dragStart.y - pos.y;
    ball.vx = Math.max(-maxInitialVelocity, Math.min(maxInitialVelocity, dx / 10));
    ball.vy = Math.max(-maxInitialVelocity, Math.min(maxInitialVelocity, dy / 10));
    isDragging = false;
    ballThrown = true; // The ball has been thrown
  }
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  const event = e.touches ? e.touches[0] : e;
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function isInsideBall(pos) {
  const dx = pos.x - ball.x;
  const dy = pos.y - ball.y;
  return dx * dx + dy * dy <= ball.radius * ball.radius;
}

// Game Loop
function update() {
  ctx.clearRect(0, 0, cw, ch);
  backboard.draw();
  rim.draw();
  supportBeam.draw();
  ball.update();
  ball.draw();
  requestAnimationFrame(update);
}

init();
update();
