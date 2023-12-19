let cueBall;// mustafa
let cueBallVelocity;
let balls = [];
let isDragging = false;
let dragStart;

function setup() {
  createCanvas(windowWidth, windowHeight);
  cueBall = createVector(width / 4, height / 2);
  cueBallVelocity = createVector(0, 0);
  setupBalls();
}

function draw() {
  background(51, 105, 30);
  drawTable();

  if (isDragging && p5.Vector.dist(dragStart, cueBall) > 10) {
    drawAimingLine(cueBall, createVector(mouseX, mouseY));
  }

  handleBallCollisions();
  updateBallPositions();

  drawBallsWithShadows();
  applyFriction();
}

function mousePressed() {
  if (p5.Vector.dist(createVector(mouseX, mouseY), cueBall) < 10) {
    isDragging = true;
    dragStart = createVector(mouseX, mouseY);
  }
}

function mouseReleased() {
  if (isDragging) {
    let dragEnd = createVector(mouseX, mouseY);
    let force = p5.Vector.sub(dragStart, dragEnd);
    force.setMag(force.mag() / 100);
    cueBallVelocity.add(force);
  }
  isDragging = false;
}

function drawAimingLine(start, end) {
  stroke(255, 200, 0);
  strokeWeight(2);
  line(start.x, start.y, end.x, end.y);
}

function applyFriction() {
  let friction = 0.98; // Adjust this value to change the friction level
  cueBallVelocity.mult(friction);
  for (let ball of balls) {
    ball.velocity.mult(friction);
  }
}

function setupBalls() {
  let startX = width * 0.75;
  let startY = height / 2;
  let rows = 5;
  let ballDiameter = 20;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < i + 1; j++) {
      let x = startX + (i * (ballDiameter + 2));
      let y = startY - (i * (ballDiameter + 2) / 2) + (j * (ballDiameter + 2));
      balls.push({ position: createVector(x, y), color: [random(255), random(255), random(255)], velocity: createVector(0, 0) });
    }
  }
}

function drawTable() {
  fill('#3C1F01');
  rect(0, 0, width, height);
  
  fill('#0A4B00');
  stroke('#3C1F01');
  strokeWeight(20);
  rect(10, 10, width - 20, height - 20);
  
  noStroke();
  fill('#333333');
  let pocketDiameter = 35;
  ellipse(20, 20, pocketDiameter, pocketDiameter);
  ellipse(width - 20, 20, pocketDiameter, pocketDiameter);
  ellipse(20, height - 20, pocketDiameter, pocketDiameter);
  ellipse(width - 20, height - 20, pocketDiameter, pocketDiameter);
  ellipse(width / 2, 20, pocketDiameter, pocketDiameter);
  ellipse(width / 2, height - 20, pocketDiameter, pocketDiameter);
}

function drawBallsWithShadows() {
  for (let ball of balls.concat([{ position: cueBall, color: [255, 255, 255], velocity: cueBallVelocity }])) {
    let shadowOffset = 3;
    fill(0, 0, 0, 50);
    ellipse(ball.position.x + shadowOffset, ball.position.y + shadowOffset, 20, 20);
    
    fill(ball.color);
    ellipse(ball.position.x, ball.position.y, 20, 20);
  }
}

function handleBallCollisions() {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      let ballA = balls[i];
      let ballB = balls[j];
      let distSq = (ballA.position.x - ballB.position.x) ** 2 + (ballA.position.y - ballB.position.y) ** 2;
      let radiusSum = 20; // Since all balls have a diameter of 20

      if (distSq <= radiusSum * radiusSum) {
        let vA = createVector(ballA.velocity.x, ballA.velocity.y);
        let vB = createVector(ballB.velocity.x, ballB.velocity.y);
        let normal = p5.Vector.sub(ballB.position, ballA.position);
        normal.normalize();

        let a1 = p5.Vector.dot(vA, normal);
        let a2 = p5.Vector.dot(vB, normal);

        let optimizedP = (2.0 * (a1 - a2)) / 2.0;

        ballA.velocity.x -= optimizedP * normal.x;
        ballA.velocity.y -= optimizedP * normal.y;
        ballB.velocity.x += optimizedP * normal.x;
        ballB.velocity.y += optimizedP * normal.y;
      }
    }
  }
}

function updateBallPositions() {
  for (let ball of balls) {
    ball.position.add(ball.velocity);
    handleWallCollisions(ball);
  }
  cueBall.add(cueBallVelocity);
  handleWallCollisions({ position: cueBall, velocity: cueBallVelocity });
}

function handleWallCollisions(ball) {
  if (ball.position.x <= 20 || ball.position.x >= width - 20) {
    ball.velocity.x *= -1;
    ball.position.x = constrain(ball.position.x, 20, width - 20);
  }
  if (ball.position.y <= 20 || ball.position.y >= height - 20) {
    ball.velocity.y *= -1;
    ball.position.y = constrain(ball.position.y, 20, height - 20);
  }
}