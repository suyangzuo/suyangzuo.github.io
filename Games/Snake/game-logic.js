const gameBoard = document.querySelector("#game-board");
const canvasContext = gameBoard.getContext("2d");
const scoreElement = document.querySelector("#score > span");
const speedElement = document.querySelector("#speed > p");
const speedSlider = document.querySelector(".slider");
const resetButton = document.querySelector(".reset-game");
const boardWidth = gameBoard.width;
const boardHeight = gameBoard.height;
const boardBackgroundColor = "rgba(0,0,0,0)";
const snakeColor = "gold";
const snakeBorder = "black";
const foodColor = "red";
const unitSize = 20;
/* const canvasBackgroundImage = new Image();
canvasBackgroundImage.src = "./Images/Snake-01.jpg"; */
let speed = 75;
speedElement.textContent = "情绪稳定";
let failText = "";

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

/* window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();
  }
}); */

window.addEventListener("keydown", changeDirection);
resetButton.addEventListener("click", resetGame);
speedSlider.oninput = changeSpeed;

resetGame();

function changeSpeed() {
  speed = 150 - parseInt(speedSlider.value, 10);
  switch (speed) {
    case 25:
      speedElement.textContent = "手指抽搐";
      break;
    case 50:
      speedElement.textContent = "笑容凝固";
      break;
    case 75:
      speedElement.textContent = "情绪稳定";
      break;
    case 100:
      speedElement.textContent = "喝杯咖啡";
      break;
    case 125:
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
  let overlapped = false;
  do {
    foodX = randomFood(0, boardWidth - unitSize);
    foodY = randomFood(0, boardWidth - unitSize);
    snake.every((part) => {
      if (part.x === foodX && part.y === foodY) {
        overlapped = true;
        return false;
      }
    });
  } while (overlapped);
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
  failText = "";
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
  canvasContext.clearRect(0, 0, boardWidth, boardHeight);
  canvasContext.fillStyle = boardBackgroundColor;
  canvasContext.fillRect(0, 0, boardWidth, boardHeight);
  // canvasContext.drawImage(canvasBackgroundImage, 0, 0);
}

function moveSnake() {
  const head = {
    x: snake[0].x + xSpan,
    y: snake[0].y + ySpan,
  };
  snake.unshift(head);
  if (snake[0].x === foodX && snake[0].y === foodY) {
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
  const key = event.key;
  const keyIsLeft = key === "ArrowLeft";
  const keyIsRight = key === "ArrowRight";
  const keyIsUp = key === "ArrowUp";
  const keyIsDown = key === "ArrowDown";
  const keyIsW = key === "w";
  const keyIsS = key === "s";
  const keyIsA = key === "a";
  const keyIsD = key === "d";
  const keyIsEnter = key === "Enter";

  if (keyIsEnter) {
    resetGame();
    return;
  }

  const gameKeyPressed =
    keyIsW ||
    keyIsS ||
    keyIsA ||
    keyIsD ||
    keyIsLeft ||
    keyIsRight ||
    keyIsUp ||
    keyIsDown;
  if (!gameIsRunning && !gameFailed && gameKeyPressed) startGame();

  const goRight = xSpan === unitSize;
  const goLeft = xSpan === -unitSize;
  const goUp = ySpan === -unitSize;
  const goDown = ySpan === unitSize;

  switch (true) {
    case (key === "ArrowLeft" || key === "a") && !goRight:
      xSpan = -unitSize;
      ySpan = 0;
      break;
    case (key === "ArrowRight" || key === "d") && !goLeft:
      xSpan = unitSize;
      ySpan = 0;
      break;
    case (key === "ArrowUp" || key === "w") && !goDown:
      xSpan = 0;
      ySpan = -unitSize;
      break;
    case (key === "ArrowDown" || key === "s") && !goUp:
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
      failText = "触碰边界";
      break;
    default:
      gameFailed = false;
      break;
  }

  if (gameFailed) return;

  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      gameFailed = true;
      gameIsRunning = false;
      failText = "撞击自身";
    }
  }
}

function displayGameOver() {
  canvasContext.font = "400% HarmonyOS Sans SC";
  canvasContext.fillStyle = "white";
  canvasContext.textAlign = "center";
  if (gameFailed) {
    canvasContext.fillText(
      `${failText}\n游戏结束`,
      boardWidth / 2,
      boardHeight / 2
    );
  }
  gameIsRunning = false;
}
