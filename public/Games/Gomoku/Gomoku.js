// 五子棋游戏 - 基于参考项目的算法实现
class GomokuGame {
  constructor() {
    this.boardSize = 15; // 15x15棋盘
    this.board = []; // 棋盘状态
    this.currentPlayer = 1; // 1为黑棋，2为白棋
    this.gameOver = false;
    this.moveHistory = []; // 移动历史，用于悔棋
    this.aiMode = true; // AI模式
    this.aiPlayer = 2; // AI玩家（白棋）

    this.canvas = null;
    this.ctx = null;
    this.cellSize = 0;
    this.padding = 30;

    // 预览棋子相关
    this.预览行 = undefined;
    this.预览列 = undefined;

    // 音效
    this.clickSound = new Audio("./Audio/click.wav");
    this.selectSound = new Audio("./Audio/select.wav");

    this.init();
  }

  init() {
    this.canvas = document.getElementById("gameBoard");
    this.ctx = this.canvas.getContext("2d");
    const dpr = window.devicePixelRatio;
    this.canvas.width = this.canvas.offsetWidth * dpr;
    this.canvas.height = this.canvas.offsetHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.css宽度 = this.canvas.offsetWidth;
    this.css高度 = this.canvas.offsetHeight;
    this.cellSize = (this.css宽度 - 2 * this.padding) / (this.boardSize - 1);
    this.音效复选框 = document.getElementById("音效");
    const ai模式单选框 = document.getElementById("AI");
    const 人类模式单选框 = document.getElementById("人类");
    ai模式单选框.addEventListener("change", () => {
      this.toggleAIMode();
    });
    人类模式单选框.addEventListener("change", () => {
      this.toggleAIMode();
    });

    // 初始化棋盘
    this.resetBoard();

    // 绑定事件
    this.bindEvents();

    // 绘制棋盘
    this.drawBoard();
  }

  resetBoard() {
    this.board = [];
    for (let i = 0; i < this.boardSize; i++) {
      this.board[i] = [];
      for (let j = 0; j < this.boardSize; j++) {
        this.board[i][j] = 0; // 0为空，1为黑棋，2为白棋
      }
    }
    this.currentPlayer = 1;
    this.gameOver = false;
    this.moveHistory = [];

    // 清除预览棋子
    this.预览行 = undefined;
    this.预览列 = undefined;

    // 隐藏游戏结果
    const gameResult = document.getElementById("gameResult");
    if (gameResult) {
      gameResult.style.display = "none";
    }

    this.updateUI();
  }

  bindEvents() {
    // 棋盘点击事件
    this.canvas.addEventListener("click", (e) => {
      if (this.gameOver) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const col = Math.round((x - this.padding) / this.cellSize);
      const row = Math.round((y - this.padding) / this.cellSize);

      if (this.isValidMove(row, col)) {
        this.makeMove(row, col);
      }
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.gameOver) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.round((x - this.padding) / this.cellSize);
      const row = Math.round((y - this.padding) / this.cellSize);

      // 检查是否在棋盘范围内且位置有效
      if (this.isValidMove(row, col)) {
        this.绘制预览棋子(row, col);
      }
    });

    // 鼠标离开棋盘时清除预览
    this.canvas.addEventListener("mouseleave", () => {
      this.清空预览();
    });

    // 按钮事件
    document.getElementById("resetGame").addEventListener("click", () => {
      this.resetBoard();
      this.drawBoard();
    });

    document.getElementById("undoMove").addEventListener("click", () => {
      this.undoMove();
    });

    // 重置按钮事件
    document.querySelector(".重置游戏").addEventListener("click", () => {
      this.resetBoard();
      this.drawBoard();
      const currentPlayerElement = document.getElementById("currentPlayer");
      currentPlayerElement.classList.add("黑棋");
      currentPlayerElement.classList.remove("白棋");
    });

    // 说明按钮事件
    document.getElementById("toggleInstructions").addEventListener("click", () => {
      this.toggleInstructions();
    });

    // 关闭按钮事件
    document.getElementById("closeInstructions").addEventListener("click", () => {
      this.closeInstructions();
    });

    // 点击遮罩层关闭窗口
    document.getElementById("instructionsContent").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) {
        this.closeInstructions();
      }
    });
  }

  isValidMove(row, col) {
    return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize && this.board[row][col] === 0;
  }

  makeMove(row, col) {
    if (!this.isValidMove(row, col) || this.gameOver) return false;

    // 记录移动历史
    this.moveHistory.push({
      row: row,
      col: col,
      player: this.currentPlayer,
    });

    // 放置棋子
    this.board[row][col] = this.currentPlayer;

    // 播放棋子下落音效
    if (this.音效复选框.checked) {
      this.playClickSound();
    }

    // 绘制棋子
    this.drawPiece(row, col, this.currentPlayer);

    // 检查胜负
    if (this.checkWin(row, col, this.currentPlayer)) {
      this.gameOver = true;
      this.updateUI();
      this.showGameResult(this.currentPlayer);
      return true;
    }

    // 检查平局
    if (this.isBoardFull()) {
      this.gameOver = true;
      this.updateUI();
      this.showGameResult(0); // 0表示平局
      return true;
    }

    // 切换玩家
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.updateUI();

    // AI模式下的AI移动
    if (this.aiMode && this.currentPlayer === this.aiPlayer && !this.gameOver) {
      this.canvas.style.pointerEvents = "none";
      setTimeout(() => {
        this.aiMove();
        this.canvas.style.pointerEvents = "auto";
      }, 500); // 延迟500ms让玩家看到自己的移动
    }

    return true;
  }

  drawBoard() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制棋盘背景
    this.ctx.fillStyle = "#8B4513";
    this.ctx.fillRect(0, 0, this.css宽度, this.css高度);

    // 绘制网格线
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;

    for (let i = 0; i < this.boardSize; i++) {
      const pos = this.padding + i * this.cellSize;

      // 垂直线
      this.ctx.beginPath();
      this.ctx.moveTo(pos, this.padding);
      this.ctx.lineTo(pos, this.css高度 - this.padding);
      this.ctx.stroke();

      // 水平线
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, pos);
      this.ctx.lineTo(this.css宽度 - this.padding, pos);
      this.ctx.stroke();
    }

    // 绘制星位点
    this.drawStarPoints();

    // 重绘所有棋子
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j] !== 0) {
          this.drawPiece(i, j, this.board[i][j]);
        }
      }
    }
  }

  drawStarPoints() {
    const starPoints = [
      [3, 3],
      [3, 11],
      [7, 7],
      [11, 3],
      [11, 11],
    ];

    this.ctx.fillStyle = "#000";
    starPoints.forEach(([row, col]) => {
      const x = this.padding + col * this.cellSize;
      const y = this.padding + row * this.cellSize;

      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
      this.ctx.fill();
    });
  }

  drawPiece(row, col, player) {
    const x = this.padding + col * this.cellSize;
    const y = this.padding + row * this.cellSize;
    const radius = this.cellSize * 0.4;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);

    if (player === 1) {
      // 黑棋
      this.ctx.fillStyle = "#000";
      this.ctx.fill();
    } else {
      // 白棋
      this.ctx.fillStyle = "#fff";
      this.ctx.fill();
    }
  }

  绘制预览棋子(row, col) {
    // 如果位置没有变化，不需要重绘
    if (this.previewRow === row && this.previewCol === col) {
      return;
    }

    // 清除之前的预览
    this.清空预览();

    const x = this.padding + col * this.cellSize;
    const y = this.padding + row * this.cellSize;
    const radius = this.cellSize * 0.4;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);

    if (this.currentPlayer === 1) {
      // 黑棋预览
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      this.ctx.fill();
    } else {
      // 白棋预览
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      this.ctx.fill();
    }

    // 记录当前预览位置
    this.previewRow = row;
    this.previewCol = col;
  }

  清空预览() {
    if (this.previewRow !== undefined && this.previewCol !== undefined) {
      // 只清除预览区域，而不是重绘整个棋盘
      const x = this.padding + this.previewCol * this.cellSize;
      const y = this.padding + this.previewRow * this.cellSize;
      const radius = this.cellSize * 0.4;

      // 清除预览区域
      this.ctx.clearRect(x - radius - 2, y - radius - 2, radius * 2 + 4, radius * 2 + 4);

      // 重绘该位置的背景和网格线
      this.重绘单元(this.previewRow, this.previewCol);

      this.previewRow = undefined;
      this.previewCol = undefined;
    }
  }

  重绘单元(row, col) {
    const x = this.padding + col * this.cellSize;
    const y = this.padding + row * this.cellSize;

    // 计算背景绘制区域，确保不超出棋盘边界
    const bgLeft = Math.max(x - this.cellSize / 2, this.padding);
    const bgTop = Math.max(y - this.cellSize / 2, this.padding);
    const bgRight = Math.min(x + this.cellSize / 2, this.css宽度 - this.padding);
    const bgBottom = Math.min(y + this.cellSize / 2, this.css高度 - this.padding);

    // 重绘背景
    this.ctx.fillStyle = "#8B4513";
    this.ctx.fillRect(bgLeft, bgTop, bgRight - bgLeft, bgBottom - bgTop);

    // 重绘网格线
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;

    // 垂直线 - 只在棋盘范围内绘制
    if (col >= 0 && col < this.boardSize) {
      this.ctx.beginPath();
      const lineTop = Math.max(y - this.cellSize / 2, this.padding);
      const lineBottom = Math.min(y + this.cellSize / 2, this.css高度 - this.padding);
      this.ctx.moveTo(x, lineTop);
      this.ctx.lineTo(x, lineBottom);
      this.ctx.stroke();
    }

    // 水平线 - 只在棋盘范围内绘制
    if (row >= 0 && row < this.boardSize) {
      this.ctx.beginPath();
      const lineLeft = Math.max(x - this.cellSize / 2, this.padding);
      const lineRight = Math.min(x + this.cellSize / 2, this.css宽度 - this.padding);
      this.ctx.moveTo(lineLeft, y);
      this.ctx.lineTo(lineRight, y);
      this.ctx.stroke();
    }

    // 重绘星位点（如果需要）
    const starPoints = [
      [3, 3],
      [3, 11],
      [7, 7],
      [11, 3],
      [11, 11],
    ];
    if (starPoints.some(([sr, sc]) => sr === row && sc === col)) {
      this.ctx.fillStyle = "#000";
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
      this.ctx.fill();
    }

    // 重绘棋子（如果有）
    if (this.board[row][col] !== 0) {
      this.drawPiece(row, col, this.board[row][col]);
    }
  }

  checkWin(row, col, player) {
    const directions = [
      [0, 1], // 水平
      [1, 0], // 垂直
      [1, 1], // 对角线
      [1, -1], // 反对角线
    ];

    for (let [dx, dy] of directions) {
      let count = 1; // 包含当前棋子

      // 向一个方向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        if (
          newRow >= 0 &&
          newRow < this.boardSize &&
          newCol >= 0 &&
          newCol < this.boardSize &&
          this.board[newRow][newCol] === player
        ) {
          count++;
        } else {
          break;
        }
      }

      // 向相反方向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row - i * dx;
        const newCol = col - i * dy;
        if (
          newRow >= 0 &&
          newRow < this.boardSize &&
          newCol >= 0 &&
          newCol < this.boardSize &&
          this.board[newRow][newCol] === player
        ) {
          count++;
        } else {
          break;
        }
      }

      if (count >= 5) {
        return true;
      }
    }

    return false;
  }

  isBoardFull() {
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  undoMove() {
    if (this.moveHistory.length === 0 || this.gameOver) return;

    // 播放悔棋音效
    if (this.音效复选框.checked) {
      this.playSelectSound();
    }

    const lastMove = this.moveHistory.pop();
    this.board[lastMove.row][lastMove.col] = 0;
    this.currentPlayer = lastMove.player;

    // 如果是AI模式，需要撤销两步
    if (this.aiMode && this.moveHistory.length > 0) {
      const aiMove = this.moveHistory.pop();
      this.board[aiMove.row][aiMove.col] = 0;
    }

    this.drawBoard();
    this.updateUI();
  }

  toggleAIMode() {
    this.aiMode = !this.aiMode;
    if (this.aiMode && this.currentPlayer === this.aiPlayer && !this.gameOver) {
      this.aiMove();
    }
  }

  // AI算法 - 基于参考项目的简化版本
  aiMove() {
    if (this.gameOver) return;

    let bestMove = this.getBestMove();
    if (bestMove) {
      this.makeMove(bestMove.row, bestMove.col);
    }
  }

  getBestMove() {
    // 首先检查AI是否能直接获胜
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j] === 0) {
          this.board[i][j] = this.aiPlayer;
          if (this.checkWin(i, j, this.aiPlayer)) {
            this.board[i][j] = 0;
            return { row: i, col: j };
          }
          this.board[i][j] = 0;
        }
      }
    }

    // 检查是否需要阻止玩家获胜
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j] === 0) {
          this.board[i][j] = this.currentPlayer;
          if (this.checkWin(i, j, this.currentPlayer)) {
            this.board[i][j] = 0;
            return { row: i, col: j };
          }
          this.board[i][j] = 0;
        }
      }
    }

    // 使用评估函数选择最佳位置
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j] === 0) {
          const score = this.evaluatePosition(i, j);
          if (score > bestScore) {
            bestScore = score;
            bestMove = { row: i, col: j };
          }
        }
      }
    }

    return bestMove;
  }

  evaluatePosition(row, col) {
    let score = 0;

    // 中心位置加分
    const centerRow = Math.floor(this.boardSize / 2);
    const centerCol = Math.floor(this.boardSize / 2);
    const distanceFromCenter = Math.abs(row - centerRow) + Math.abs(col - centerCol);
    score += (this.boardSize - distanceFromCenter) * 2;

    // 检查周围棋子的影响
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (let [dx, dy] of directions) {
      let aiCount = 0;
      let playerCount = 0;
      let emptyCount = 0;

      // 检查这个方向上的棋子
      for (let i = -4; i <= 4; i++) {
        if (i === 0) continue;

        const newRow = row + i * dx;
        const newCol = col + i * dy;

        if (newRow >= 0 && newRow < this.boardSize && newCol >= 0 && newCol < this.boardSize) {
          if (this.board[newRow][newCol] === this.aiPlayer) {
            aiCount++;
          } else if (this.board[newRow][newCol] === (this.aiPlayer === 1 ? 2 : 1)) {
            playerCount++;
          } else {
            emptyCount++;
          }
        }
      }

      // 根据棋子数量给分
      if (aiCount > 0) {
        score += aiCount * 10;
      }
      if (playerCount > 0) {
        score += playerCount * 8;
      }
    }

    return score;
  }

  updateUI() {
    const currentPlayerElement = document.getElementById("currentPlayer");
    const gameStatusElement = document.getElementById("gameStatus");

    if (this.gameOver) {
      gameStatusElement.textContent = "游戏结束";
    } else {
      gameStatusElement.textContent = "游戏进行中";
    }

    currentPlayerElement.classList.toggle("黑棋");
    currentPlayerElement.classList.toggle("白棋");

    if (this.currentPlayer === 1) {
      // currentPlayerElement.classList.add("黑棋");
      currentPlayerElement.textContent = "黑棋";
    } else {
      // currentPlayerElement.classList.add("白棋");
      currentPlayerElement.textContent = "白棋";
    }
  }

  showGameResult(winner) {
    let message = "";
    if (winner === 0) {
      message = "平局！";
    } else if (winner === 1) {
      message = "黑棋获胜！";
    } else {
      message = "白棋获胜！";
    }

    const gameResult = document.getElementById("gameResult");
    const resultContent = document.getElementById("resultContent");

    resultContent.textContent = message;
    gameResult.style.display = "block";
  }

  // 音效播放方法
  playClickSound() {
    try {
      this.clickSound.currentTime = 0; // 重置音频到开始位置
      this.clickSound.play().catch((e) => {
        console.log("音效播放失败:", e);
      });
    } catch (e) {
      console.log("音效加载失败:", e);
    }
  }

  playSelectSound() {
    try {
      this.selectSound.currentTime = 0; // 重置音频到开始位置
      this.selectSound.play().catch((e) => {
        console.log("音效播放失败:", e);
      });
    } catch (e) {
      console.log("音效加载失败:", e);
    }
  }

  // 切换说明显示/隐藏
  toggleInstructions() {
    const button = document.getElementById("toggleInstructions");
    const content = document.getElementById("instructionsContent");

    if (content.style.display === "none") {
      content.style.display = "block";
      button.classList.add("展开");
    } else {
      this.closeInstructions();
    }
  }

  // 关闭说明窗口
  closeInstructions() {
    const button = document.getElementById("toggleInstructions");
    const content = document.getElementById("instructionsContent");

    content.style.display = "none";
    button.classList.remove("展开");
  }
}

// 游戏初始化
document.addEventListener("DOMContentLoaded", () => {
  // 创建游戏实例
  window.gomokuGame = new GomokuGame();
});
