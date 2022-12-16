const gameBoard = document.querySelector("#game-board");
const canvasContext = gameBoard.getContext("2d");
const scoreElement = document.querySelector("#score > span");
const speedElement = document.querySelector("#speed > p");
const speedSlider = document.querySelector(".slider");
const resetButton = document.querySelector(".reset-game");
const boardWidth = gameBoard.width;
const boardHeight = gameBoard.height;
const boardBackgroundColor = "gold";
const snakeColor = "gold";
const snakeBorder = "black";
const foodColor = "red";
const unitSize = 20;
const canvasBackgroundImage = new Image();
canvasBackgroundImage.src = "./Images/Snake-01.jpg";
let speed = 75;
speedElement.textContent = "一般";

let gameIsRunning = false;
let gameFailed = true;
let xSpan = unitSize;
let ySpan = 0;
let foodX;
let foodY;
let score = 0;
let snake = [
  { x: unitSize * 4, y: 0 },
  { x: unitSize * 3, y: 0 },
  { x: unitSize * 2, y: 0 },
  { x: unitSize * 1, y: 0 },
  { x: 0, y: 0 },
];

window.addEventListener("keydown", changeDirection);
resetButton.addEventListener("click", resetGame);
speedSlider.oninput = changeSpeed;

function changeSpeed() {
  speed = speedSlider.value;
  switch (speed) {
    case "25":
      speedElement.textContent = "瘫倒在地";
      break;
    case "50":
      speedElement.textContent = "心惊肉跳";
      break;
    case "75":
      speedElement.textContent = "情绪稳定";
      break;
    case "100":
      speedElement.textContent = "喝杯咖啡";
      break;
    case "125":
      speedElement.textContent = "差点睡着";
      break;
  }
}

function createFood() {
  function randomFood(min, max) {
    const randomNumber =
      Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
    return randomNumber;
  }
  foodX = randomFood(0, boardWidth - unitSize);
  foodY = randomFood(0, boardWidth - unitSize);
}

function drawFood() {
  canvasContext.fillStyle = foodColor;
  canvasContext.fillRect(foodX, foodY, unitSize, unitSize);
}

function startGame() {
  gameIsRunning = true;
  gameFailed = false;
  nextTick();
}

function resetGame() {
  gameIsRunning = false;
  gameFailed = false;
  score = 0;
  xSpan = unitSize;
  ySpan = 0;
  snake = [
    { x: unitSize * 4, y: 0 },
    { x: unitSize * 3, y: 0 },
    { x: unitSize * 2, y: 0 },
    { x: unitSize * 1, y: 0 },
    { x: 0, y: 0 },
  ];
  scoreElement.textContent = score;
  clearBoard();
  createFood();
  drawFood();
  drawSnake();
}

function nextTick() {
  if (gameIsRunning && !gameFailed) {
    setTimeout(() => {
      clearBoard();
      drawFood();
      moveSnake();
      drawSnake();
      checkGameState();
      nextTick();
    }, speed);
  } else {
    displayGameOver();
  }
}

function clearBoard() {
  // canvasContext.fillStyle = boardBackgroundColor;
  // canvasContext.fillRect(0, 0, boardWidth, boardHeight);
  canvasContext.drawImage(canvasBackgroundImage, 0, 0);
}

function moveSnake() {
  const head = {
    x: snake[0].x + xSpan,
    y: snake[0].y + ySpan,
  };
  snake.unshift(head);
  if (snake[0].x == foodX && snake[0].y == foodY) {
    score++;
    scoreElement.textContent = score;
    createFood();
  } else {
    snake.pop();
  }
}

function drawSnake() {
  canvasContext.fillStyle = snakeColor;
  canvasContext.strokeStyle = snakeBorder;
  snake.forEach((part) => {
    canvasContext.fillRect(part.x, part.y, unitSize, unitSize);
    canvasContext.strokeRect(part.x, part.y, unitSize, unitSize);
  });
}

function changeDirection(event) {
  if (!gameIsRunning && !gameFailed) startGame();
  const key = event.keyCode;
  const left = 37;
  const up = 38;
  const right = 39;
  const down = 40;
  const w = 87;
  const s = 83;
  const a = 65;
  const d = 68;

  const goRight = xSpan == unitSize;
  const goLeft = xSpan == -unitSize;
  const goUp = ySpan == -unitSize;
  const goDown = ySpan == unitSize;

  switch (true) {
    case (key == left || key == a) && !goRight:
      xSpan = -unitSize;
      ySpan = 0;
      break;
    case (key == right || key == d) && !goLeft:
      xSpan = unitSize;
      ySpan = 0;
      break;
    case (key == up || key == w) && !goDown:
      xSpan = 0;
      ySpan = -unitSize;
      break;
    case (key == down || key == s) && !goUp:
      xSpan = 0;
      ySpan = unitSize;
      break;
  }
}

function checkGameState() {
  switch (true) {
    case snake[0].x < 0:
    case snake[0].x >= boardWidth:
    case snake[0].y < 0:
    case snake[0].y >= boardHeight:
      gameFailed = true;
      gameIsRunning = false;
      break;
    default:
      gameFailed = false;
      break;
  }

  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      gameIsRunning = false;
    }
  }
}

function displayGameOver() {
  canvasContext.font = "5em HarmonyOS Sans SC";
  canvasContext.fillStyle = "white";
  canvasContext.textAlign = "center";
  if (gameFailed) {
    canvasContext.fillText("游戏结束", boardWidth / 2, boardHeight / 2);
  }
  gameIsRunning = false;
}
