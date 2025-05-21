let score = 0; // 玩家得分
let timeLeft = 30; // 剩余时间（秒）
let gameActive = false; // 游戏是否进行中
let timer; // 游戏倒计时定时器
let moleTimer; // 出现定时器
let difficulty = "easy"; // 当前难度级别
let lastHole = -1; // 上次出现的洞索引

// 难度配置
const difficultySettings = {
  easy: { showTime: 1000, frequency: 1000 },
  medium: { showTime: 500, frequency: 500 },
  hard: { showTime: 80, frequency: 100 },
};

const holes = document.querySelectorAll(".hole"); // 所有洞
const moles = document.querySelectorAll(".mole"); // 所有宝藏元素
const scoreDisplay = document.querySelector(".score"); // 得分显示元素
const timeDisplay = document.querySelector(".time"); // 时间显示元素
const startButton = document.getElementById("start"); // 开始游戏按钮
const easyButton = document.getElementById("easy"); // 简单难度按钮
const mediumButton = document.getElementById("medium"); // 中等难度按钮
const hardButton = document.getElementById("hard"); // 困难难度按钮
const difficultyButtons = [easyButton, mediumButton, hardButton]; // 难度按钮数组
const rulesButton = document.querySelector(".规则按钮"); // 规则按钮
const modal = document.querySelector(".modal"); // 规则弹窗
const closeButton = document.querySelector(".close-btn"); // 关闭按钮

// 事件监听器
startButton.addEventListener("click", startGame); // 开始游戏事件
easyButton.addEventListener("click", () => setDifficulty("easy")); // 设置简单难度
mediumButton.addEventListener("click", () => setDifficulty("medium")); // 设置中等难度
hardButton.addEventListener("click", () => setDifficulty("hard")); // 设置困难难度
rulesButton.addEventListener("click", showRules); // 显示规则弹窗
closeButton.addEventListener("click", hideRules); // 隐藏规则弹窗

// 添加点击事件
moles.forEach((mole) => {
  mole.addEventListener("click", (e) => {
    // 隐藏
    e.target.classList.remove("up");

    // 更新得分显示
    score++;
    scoreDisplay.textContent = score;
  });
});

// 开始游戏函数
function startGame() {
  if (gameActive) return; // 防止重复开始

  // 初始化游戏状态
  score = 0;
  timeLeft = 30;
  gameActive = true;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  startButton.textContent = "游戏中...";

  // 禁用难度按钮
  difficultyButtons.forEach((btn) => {
    btn.disabled = true;
  });

  // 隐藏
  moles.forEach((mole) => mole.classList.remove("up"));

  // 启动倒计时
  timer = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;

    // 时间结束
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  // 出现定时器
  moleTimer = setInterval(
    showRandomMole,
    difficultySettings[difficulty].frequency
  );
}

// 结束游戏函数
function endGame() {
  gameActive = false;
  // 清除定时器
  clearInterval(timer);
  clearInterval(moleTimer);
  startButton.textContent = "开始游戏";

  // 启用难度按钮
  difficultyButtons.forEach((btn) => {
    btn.disabled = false;
  });

  // 显示最终得分
  alert(`游戏结束！你的得分是: ${score}`);
}

// 随机显示
function showRandomMole() {
  if (!gameActive) return; // 游戏未激活时不执行

  const index = getRandomHole(); // 获取随机洞索引
  const mole = moles[index]; // 获取对应元素

  mole.classList.add("up"); // 显示

  // 定时隐藏
  setTimeout(() => {
    mole.classList.remove("up");
  }, difficultySettings[difficulty].showTime);
}

// 获取不重复的随机洞索引
function getRandomHole() {
  let index;
  do {
    index = Math.floor(Math.random() * holes.length); // 生成随机索引
  } while (index === lastHole); // 确保不与上次相同
  lastHole = index; // 记录本次索引
  return index;
}

// 设置难度级别
function setDifficulty(level) {
  // 移除所有按钮的激活状态
  easyButton.classList.remove("active");
  mediumButton.classList.remove("active");
  hardButton.classList.remove("active");

  // 为当前难度按钮添加激活状态
  if (level === "easy") easyButton.classList.add("active");
  if (level === "medium") mediumButton.classList.add("active");
  if (level === "hard") hardButton.classList.add("active");
}

// 显示规则弹窗
function showRules() {
  modal.style.display = "flex"; // 使用flex布局居中显示
}

// 隐藏规则弹窗
function hideRules() {
  modal.style.display = "none";
}
