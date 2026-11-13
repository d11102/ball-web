// Breakout game converted from Processing (dowon.pde) to p5.js
const W = 600;
const H = 600;

let ball;
let paddle;
let bricks = [];
let score = 0;
let gameState = "playing"; // playing | gameOver | gameClear

const COLS = 8;
const ROWS = 5;
const BRICK_W = 65;
const BRICK_H = 20;
const BRICK_GAP_X = 8;
const BRICK_START_X = 10;
const BRICK_START_Y = 60;
const BALL_R = 10;

function setup() {
  const canvas = createCanvas(W, H);
  canvas.parent("game-container");
  textFont("Arial");
  resetGame();
}

function resetGame() {
  score = 0;
  gameState = "playing";
  ball = { x: 300, y: 350, vx: 4, vy: -4, r: BALL_R };
  paddle = { x: 250, y: 550, w: 100, h: 15 };
  bricks = [];

  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      bricks.push({
        x: BRICK_START_X + col * (BRICK_W + BRICK_GAP_X),
        y: BRICK_START_Y + row * 30,
        w: BRICK_W,
        h: BRICK_H,
        col,
        row,
        alive: true
      });
    }
  }
}

function draw() {
  background(20, 20, 40);

  if (gameState !== "playing") {
    drawEndScreen();
    return;
  }

  movePaddle();
  moveBall();
  handlePaddleCollision();
  handleBrickCollisions();

  drawHud();
  drawBricks();
  drawPaddle();
  drawBall();

  if (ball.y - ball.r > height) {
    gameState = "gameOver";
  } else if (score === COLS * ROWS * 10) {
    gameState = "gameClear";
  }
}

function movePaddle() {
  paddle.x = constrain(mouseX - paddle.w / 2, 0, width - paddle.w);
}

function moveBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x - ball.r <= 0) {
    ball.x = ball.r;
    ball.vx = abs(ball.vx);
  } else if (ball.x + ball.r >= width) {
    ball.x = width - ball.r;
    ball.vx = -abs(ball.vx);
  }

  if (ball.y - ball.r <= 0) {
    ball.y = ball.r;
    ball.vy = abs(ball.vy);
  }
}

function handlePaddleCollision() {
  const overlapsX = ball.x + ball.r >= paddle.x &&
                    ball.x - ball.r <= paddle.x + paddle.w;
  const overlapsY = ball.y + ball.r >= paddle.y &&
                    ball.y - ball.r <= paddle.y + paddle.h;

  if (ball.vy > 0 && overlapsX && overlapsY) {
    ball.y = paddle.y - ball.r;
    ball.vy = -abs(ball.vy);

    // Add a little angle control based on where the ball hits the paddle.
    const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
    ball.vx = constrain(hit * 5, -5, 5);
  }
}

function handleBrickCollisions() {
  for (const brick of bricks) {
    if (!brick.alive) continue;

    const hit = ball.x + ball.r > brick.x &&
                ball.x - ball.r < brick.x + brick.w &&
                ball.y + ball.r > brick.y &&
                ball.y - ball.r < brick.y + brick.h;

    if (hit) {
      brick.alive = false;
      ball.vy *= -1;
      score += 10;
      break; // Prevent multiple bricks being removed in one frame.
    }
  }
}

function drawHud() {
  noStroke();
  fill(255);
  textAlign(LEFT, BASELINE);
  textSize(20);
  text("SCORE : " + score, 20, 30);
}

function drawBricks() {
  noStroke();
  for (const brick of bricks) {
    if (!brick.alive) continue;
    fill(255 - brick.row * 25, 100 + brick.col * 15, 180);
    rect(brick.x, brick.y, brick.w, brick.h);
  }
}

function drawPaddle() {
  noStroke();
  fill(0, 200, 255);
  rect(paddle.x, paddle.y, paddle.w, paddle.h);
}

function drawBall() {
  noStroke();
  fill(255, 255, 0);
  circle(ball.x, ball.y, ball.r * 2);
}

function drawEndScreen() {
  background(20, 20, 40);
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(40);
  text(gameState === "gameClear" ? "YOU WIN!" : "GAME OVER", width / 2, 250);
  textSize(25);
  text("SCORE : " + score, width / 2, 310);
  textSize(18);
  text("Press SPACE to restart", width / 2, 380);
}

function keyPressed() {
  if (key === " " && gameState !== "playing") {
    resetGame();
  }
}

// Touch support for phones/tablets.
function touchMoved() {
  if (touches.length > 0) {
    paddle.x = constrain(touches[0].x - paddle.w / 2, 0, width - paddle.w);
    return false;
  }
}

function windowResized() {
  // Keep the game's internal 600x600 coordinate system unchanged.
}
