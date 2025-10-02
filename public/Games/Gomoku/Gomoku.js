// 五子棋游戏 - 高级AI算法实现
class GomokuGame {
  constructor() {
    this.boardSize = 15; // 15x15棋盘
    this.board = []; // 棋盘状态
    this.currentPlayer = 1; // 1为黑棋，2为白棋
    this.gameOver = false;
    this.moveHistory = []; // 移动历史，用于悔棋
    this.aiMode = true; // AI模式
    this.aiPlayer = 2; // AI玩家（白棋）
    this.aiFirst = false; // AI是否先手
    this.difficulty = 4; // AI难度 (1-6)

    // AI算法相关
    this.cache = new Map(); // 缓存
    this.zobristTable = []; // Zobrist哈希表
    this.aiThinkingTimer = null; // AI思考定时器
    this.mouseMoveHandler = null; // 鼠标移动事件处理器
    // 记录AI提示原父节点
    this.aiThinkingOriginalParent = null;
    this.aiThinkingPlaceholder = null;
    this.initZobristTable();

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
    const ai先手单选框 = document.getElementById("AI先手");
    const 人类先手单选框 = document.getElementById("人类先手");
    const 难度滑块 = document.getElementById("难度");
    const 难度数值 = document.getElementById("难度数值");

    ai模式单选框.addEventListener("change", () => {
      this.toggleAIMode();
    });
    人类模式单选框.addEventListener("change", () => {
      this.toggleAIMode();
    });

    ai先手单选框.addEventListener("change", () => {
      this.setAIFirst(true);
      this.updateFirstMoveButtons();
    });
    人类先手单选框.addEventListener("change", () => {
      this.setAIFirst(false);
      this.updateFirstMoveButtons();
    });

    难度滑块.addEventListener("input", (e) => {
      this.difficulty = parseInt(e.target.value);
      难度数值.textContent = this.difficulty;
      this.updateSliderTrack(e.target); // << 新增：实时更新滑块样式
    });

    // 初始化棋盘
    this.resetBoard();

    // 绑定事件
    this.bindEvents();

    // 绘制棋盘
    this.drawBoard();

    // 初始化AI设置区显示状态
    this.updateAISettingsVisibility();

    this.updateSliderTrack(难度滑块); // << 新增：页面加载时设置初始样式
  }

  /**
   * 更新滑块轨道的填充颜色
   * @param {HTMLInputElement} slider - a range input element
   */
  updateSliderTrack(slider) {
    const min = slider.min;
    const max = slider.max;
    const value = slider.value;
    const progress = ((value - min) / (max - min)) * 100;
    slider.style.setProperty("--slider-progress", `${progress}%`);
  }

  // 初始化Zobrist哈希表
  initZobristTable() {
    this.zobristTable = [];
    for (let i = 0; i < this.boardSize; i++) {
      this.zobristTable[i] = [];
      for (let j = 0; j < this.boardSize; j++) {
        this.zobristTable[i][j] = [];
        this.zobristTable[i][j][0] = Math.floor(Math.random() * 4294967296);
        this.zobristTable[i][j][1] = Math.floor(Math.random() * 4294967296);
      }
    }
  }

  // 设置AI先手
  setAIFirst(isFirst) {
    this.aiFirst = isFirst;
    this.aiPlayer = isFirst ? 1 : 2;
    this.resetBoard();
  }

  // 更新先手选择按钮样式
  updateFirstMoveButtons() {
    const ai先手标签 = document.querySelector('label[for="AI先手"]');
    const 人类先手标签 = document.querySelector('label[for="人类先手"]');

    if (this.aiFirst) {
      ai先手标签.classList.add("选中");
      人类先手标签.classList.remove("选中");
    } else {
      ai先手标签.classList.remove("选中");
      人类先手标签.classList.add("选中");
    }
  }

  // 更新AI设置区显示状态
  updateAISettingsVisibility() {
    const ai设置区 = document.querySelector(".AI设置区");
    if (this.aiMode) {
      ai设置区.classList.add("显示");
    } else {
      ai设置区.classList.remove("显示");
    }
  }

  // 显示AI思考提示
  showAIThinking() {
    const ai思考提示 = document.getElementById("aiThinking");
    const 游戏状态 = document.getElementById("gameStatus");
    if (ai思考提示 && 游戏状态) {
      // 保持游戏状态显示，不隐藏
      // 游戏状态.style.display = 'none';
      ai思考提示.style.display = "flex";

      // 将提示移到body，避免受父元素影响
      if (!this.aiThinkingOriginalParent) {
        this.aiThinkingOriginalParent = ai思考提示.parentElement;
        this.aiThinkingPlaceholder = document.createElement("span");
        this.aiThinkingPlaceholder.style.display = "none";
        this.aiThinkingOriginalParent.insertBefore(this.aiThinkingPlaceholder, ai思考提示);
      }
      document.body.appendChild(ai思考提示);

      // 将提示定位到棋盘中心，浮于上方
      const canvasRect = this.canvas.getBoundingClientRect();
      const centerX = canvasRect.left + canvasRect.width / 2;
      const centerY = canvasRect.top + canvasRect.height / 2;

      // 使用CSS transform居中，直接设置中心点坐标
      ai思考提示.style.position = "fixed";
      ai思考提示.style.left = centerX + "px";
      ai思考提示.style.top = centerY + "px";
      ai思考提示.style.transform = "translate(-50%, -50%)";
      ai思考提示.style.zIndex = "10000";

      // 隐藏鼠标箭头
      document.body.style.cursor = "none";
    }
  }

  // 隐藏AI思考提示
  hideAIThinking() {
    const ai思考提示 = document.getElementById("aiThinking");
    const 游戏状态 = document.getElementById("gameStatus");
    if (ai思考提示 && 游戏状态) {
      ai思考提示.style.display = "none";
      // 游戏状态保持原有显示状态，不需要重新设置
      // 游戏状态.style.display = this.moveHistory.length > 0 ? 'block' : 'none';

      // 复位到原父节点
      if (this.aiThinkingOriginalParent && this.aiThinkingPlaceholder) {
        this.aiThinkingOriginalParent.insertBefore(ai思考提示, this.aiThinkingPlaceholder);
      }

      // 重置样式
      ai思考提示.style.position = "";
      ai思考提示.style.left = "";
      ai思考提示.style.top = "";
      ai思考提示.style.transform = "";
      ai思考提示.style.zIndex = "";

      // 恢复鼠标箭头
      document.body.style.cursor = "default";
    }
  }

  resetBoard() {
    // 彻底清除所有定时器
    if (this.aiThinkingTimer) {
      clearTimeout(this.aiThinkingTimer);
      this.aiThinkingTimer = null;
    }

    // 清除所有可能的定时器（包括延迟的AI移动）
    for (let i = 1; i < 10000; i++) {
      clearTimeout(i);
    }

    // 隐藏AI思考提示
    this.hideAIThinking();

    // 恢复棋盘点击
    this.canvas.style.pointerEvents = "auto";

    // 完全重置游戏状态
    this.board = [];
    for (let i = 0; i < this.boardSize; i++) {
      this.board[i] = [];
      for (let j = 0; j < this.boardSize; j++) {
        this.board[i][j] = 0; // 0为空，1为黑棋，2为白棋
      }
    }
    this.currentPlayer = 1;
    this.gameOver = true; // 先设置为游戏结束状态
    this.moveHistory = [];
    this.cache.clear(); // 清空缓存

    // 清除预览棋子
    this.预览行 = undefined;
    this.预览列 = undefined;

    // 隐藏游戏结果
    const gameResult = document.getElementById("gameResult");
    if (gameResult) {
      gameResult.style.display = "none";
    }

    // 重新绘制棋盘
    this.drawBoard();

    // 延迟重置游戏状态，确保所有异步操作完成
    setTimeout(() => {
      this.gameOver = false; // 重新开始游戏
      this.updateUI();
      this.updateFirstMoveButtons();

      // 如果AI先手，自动下第一步
      if (this.aiMode && this.aiFirst && this.currentPlayer === this.aiPlayer) {
        setTimeout(() => {
          if (!this.gameOver && this.aiMode && this.currentPlayer === this.aiPlayer) {
            // 再次检查游戏状态
            this.aiMove();
          }
        }, 500);
      }
    }, 100);
  }

  // 完全重新初始化游戏（最彻底的解决方案）
  fullReset() {
    // 清除所有定时器
    if (this.aiThinkingTimer) {
      clearTimeout(this.aiThinkingTimer);
      this.aiThinkingTimer = null;
    }

    // 清除所有可能的定时器
    for (let i = 1; i < 10000; i++) {
      clearTimeout(i);
    }

    // 隐藏AI思考提示
    this.hideAIThinking();

    // 恢复棋盘点击
    this.canvas.style.pointerEvents = "auto";

    // 保存当前设置
    const currentAIMode = this.aiMode;
    const currentAIFirst = this.aiFirst;
    const currentDifficulty = this.difficulty;

    // 完全重新初始化游戏对象
    this.board = [];
    for (let i = 0; i < this.boardSize; i++) {
      this.board[i] = [];
      for (let j = 0; j < this.boardSize; j++) {
        this.board[i][j] = 0;
      }
    }
    this.currentPlayer = 1;
    this.gameOver = false;
    this.moveHistory = [];
    this.cache.clear();
    this.预览行 = undefined;
    this.预览列 = undefined;

    // 恢复设置
    this.aiMode = currentAIMode;
    this.aiFirst = currentAIFirst;
    this.difficulty = currentDifficulty;

    // 隐藏游戏结果
    const gameResult = document.getElementById("gameResult");
    if (gameResult) {
      gameResult.style.display = "none";
    }

    // 重新绘制棋盘
    this.drawBoard();
    this.updateUI();
    this.updateFirstMoveButtons();

    // 如果AI先手，自动下第一步
    if (this.aiMode && this.aiFirst && this.currentPlayer === this.aiPlayer) {
      setTimeout(() => {
        if (!this.gameOver && this.aiMode && this.currentPlayer === this.aiPlayer) {
          this.aiMove();
        }
      }, 500);
    }
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
      this.fullReset(); // 使用完全重置方法
    });

    document.getElementById("undoMove").addEventListener("click", () => {
      this.undoMove();
    });

    // 重置按钮事件
    document.querySelector(".重置游戏").addEventListener("click", () => {
      this.fullReset(); // 使用完全重置方法
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
      // 游戏结束时恢复棋盘点击
      this.canvas.style.pointerEvents = "auto";
      return true;
    }

    // 检查平局
    if (this.isBoardFull()) {
      this.gameOver = true;
      this.updateUI();
      this.showGameResult(0); // 0表示平局
      // 游戏结束时恢复棋盘点击
      this.canvas.style.pointerEvents = "auto";
      return true;
    }

    // 切换玩家
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.updateUI();

    // AI模式下的AI移动
    if (this.aiMode && this.currentPlayer === this.aiPlayer && !this.gameOver) {
      // 立即禁用棋盘点击，防止人类玩家在AI思考时继续下棋
      this.canvas.style.pointerEvents = "none";

      setTimeout(() => {
        // 多重检查游戏状态，确保游戏还在进行中
        if (!this.gameOver && this.aiMode && this.currentPlayer === this.aiPlayer) {
          this.aiMove();
        }
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
    // 如果从AI模式切换到人类模式，清除AI思考定时器
    if (this.aiMode) {
      if (this.aiThinkingTimer) {
        clearTimeout(this.aiThinkingTimer);
        this.aiThinkingTimer = null;
      }
      this.hideAIThinking();
      // 恢复棋盘点击
      this.canvas.style.pointerEvents = "auto";
    }

    this.aiMode = !this.aiMode;

    // 控制AI设置区的显示/隐藏
    this.updateAISettingsVisibility();

    if (this.aiMode && this.currentPlayer === this.aiPlayer && !this.gameOver) {
      this.aiMove();
    }
  }

  // AI算法 - 高级Minimax算法
  aiMove() {
    // 多重检查确保游戏状态正确
    if (this.gameOver || !this.aiMode || this.currentPlayer !== this.aiPlayer) {
      return;
    }

    // 禁用棋盘点击，防止人类玩家在AI思考时下棋
    this.canvas.style.pointerEvents = "none";

    // 显示AI思考提示
    this.showAIThinking();

    // 使用setTimeout模拟AI思考时间，让用户看到思考过程
    this.aiThinkingTimer = setTimeout(() => {
      // 再次检查游戏状态
      if (this.gameOver || !this.aiMode || this.currentPlayer !== this.aiPlayer) {
        this.hideAIThinking();
        this.canvas.style.pointerEvents = "auto"; // 恢复棋盘点击
        this.aiThinkingTimer = null;
        return;
      }

      const bestMove = this.getBestMoveAdvanced();
      if (bestMove && !this.gameOver && this.aiMode && this.currentPlayer === this.aiPlayer) {
        this.makeMove(bestMove[0], bestMove[1]);
        // AI下完棋后，如果游戏还在进行且轮到人类玩家，恢复棋盘点击
        if (!this.gameOver && this.currentPlayer !== this.aiPlayer) {
          this.canvas.style.pointerEvents = "auto";
        }
      } else {
        // 如果AI没有下棋（游戏结束等），也要恢复棋盘点击
        this.canvas.style.pointerEvents = "auto";
      }
      // 隐藏AI思考提示
      this.hideAIThinking();
      this.aiThinkingTimer = null;
    }, 300 + this.difficulty * 200); // 根据难度调整思考时间
  }

  // 高级AI算法 - 获取最佳移动
  getBestMoveAdvanced() {
    // 首先检查AI是否能直接获胜
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j] === 0) {
          this.board[i][j] = this.aiPlayer;
          if (this.checkWin(i, j, this.aiPlayer)) {
            this.board[i][j] = 0;
            return [i, j];
          }
          this.board[i][j] = 0;
        }
      }
    }

    // 检查是否需要阻止玩家获胜
    const humanPlayer = this.aiPlayer === 1 ? 2 : 1;
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (this.board[i][j] === 0) {
          this.board[i][j] = humanPlayer;
          if (this.checkWin(i, j, humanPlayer)) {
            this.board[i][j] = 0;
            return [i, j];
          }
          this.board[i][j] = 0;
        }
      }
    }

    // 使用Minimax算法
    const [score, move] = this.minimax(this.board, this.aiPlayer, this.difficulty);
    return move;
  }

  // Minimax算法实现
  minimax(board, role, depth, alpha = -Infinity, beta = Infinity, isMaximizing = true) {
    if (depth === 0) {
      return [this.evaluateBoard(board, role), null];
    }

    // 检查游戏结束
    const winner = this.checkWinner(board);
    if (winner !== 0) {
      return [winner === role ? 1000000 : -1000000, null];
    }

    const moves = this.getValuableMoves(board, isMaximizing ? role : role === 1 ? 2 : 1);

    if (moves.length === 0) {
      return [this.evaluateBoard(board, role), null];
    }

    let bestMove = null;
    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (let [i, j, score] of moves) {
      // 模拟落子
      board[i][j] = isMaximizing ? role : role === 1 ? 2 : 1;

      const [currentScore] = this.minimax(board, role, depth - 1, alpha, beta, !isMaximizing);

      // 撤销落子
      board[i][j] = 0;

      if (isMaximizing) {
        if (currentScore > bestScore) {
          bestScore = currentScore;
          bestMove = [i, j];
        }
        alpha = Math.max(alpha, currentScore);
      } else {
        if (currentScore < bestScore) {
          bestScore = currentScore;
          bestMove = [i, j];
        }
        beta = Math.min(beta, currentScore);
      }

      // Alpha-Beta剪枝
      if (beta <= alpha) {
        break;
      }
    }

    return [bestScore, bestMove];
  }

  // 获取有价值的落点
  getValuableMoves(board, role) {
    const moves = [];
    const opponent = role === 1 ? 2 : 1;

    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (board[i][j] === 0) {
          // 检查周围是否有棋子
          let hasNeighbor = false;
          for (let di = -2; di <= 2; di++) {
            for (let dj = -2; dj <= 2; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < this.boardSize && nj >= 0 && nj < this.boardSize && board[ni][nj] !== 0) {
                hasNeighbor = true;
                break;
              }
            }
            if (hasNeighbor) break;
          }

          if (hasNeighbor || this.moveHistory.length < 3) {
            // 前几步考虑中心位置
            const score = this.evaluatePosition(board, i, j, role);
            moves.push([i, j, score]);
          }
        }
      }
    }

    // 按分数排序
    moves.sort((a, b) => b[2] - a[2]);
    return moves.slice(0, 20); // 限制搜索节点数
  }

  // 评估棋盘状态
  evaluateBoard(board, role) {
    let score = 0;
    const opponent = role === 1 ? 2 : 1;

    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (board[i][j] === role) {
          score += this.evaluatePosition(board, i, j, role);
        } else if (board[i][j] === opponent) {
          score -= this.evaluatePosition(board, i, j, opponent);
        }
      }
    }

    return score;
  }

  // 评估单个位置
  evaluatePosition(board, row, col, role) {
    let score = 0;
    const opponent = role === 1 ? 2 : 1;

    // 中心位置加分
    const centerRow = Math.floor(this.boardSize / 2);
    const centerCol = Math.floor(this.boardSize / 2);
    const distanceFromCenter = Math.abs(row - centerRow) + Math.abs(col - centerCol);
    score += (this.boardSize - distanceFromCenter) * 2;

    // 检查四个方向的棋型
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ];

    for (let [dx, dy] of directions) {
      const shape = this.getShape(board, row, col, dx, dy, role);
      score += this.getShapeScore(shape);
    }

    return score;
  }

  // 获取棋型
  getShape(board, x, y, offsetX, offsetY, role) {
    const opponent = role === 1 ? 2 : 1;
    let emptyCount = 0;
    let selfCount = 1;
    let opponentCount = 0;

    // 检查四个方向
    for (let i = 1; i <= 4; i++) {
      const newX = x + i * offsetX;
      const newY = y + i * offsetY;

      if (newX >= 0 && newX < this.boardSize && newY >= 0 && newY < this.boardSize) {
        if (board[newX][newY] === role) {
          selfCount++;
        } else if (board[newX][newY] === opponent) {
          opponentCount++;
          break;
        } else {
          emptyCount++;
        }
      } else {
        opponentCount++;
        break;
      }
    }

    for (let i = 1; i <= 4; i++) {
      const newX = x - i * offsetX;
      const newY = y - i * offsetY;

      if (newX >= 0 && newX < this.boardSize && newY >= 0 && newY < this.boardSize) {
        if (board[newX][newY] === role) {
          selfCount++;
        } else if (board[newX][newY] === opponent) {
          opponentCount++;
          break;
        } else {
          emptyCount++;
        }
      } else {
        opponentCount++;
        break;
      }
    }

    // 根据棋型给分
    if (selfCount >= 5) {
      return 1000000; // 连五
    } else if (selfCount === 4 && emptyCount > 0) {
      return opponentCount === 0 ? 100000 : 1500; // 活四 : 冲四
    } else if (selfCount === 3 && emptyCount >= 2) {
      return opponentCount === 0 ? 1000 : 150; // 活三 : 眠三
    } else if (selfCount === 2 && emptyCount >= 3) {
      return opponentCount === 0 ? 100 : 15; // 活二 : 眠二
    }

    return 0;
  }

  // 获取棋型分数
  getShapeScore(shape) {
    return shape;
  }

  // 检查获胜者
  checkWinner(board) {
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ];

    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (board[i][j] !== 0) {
          for (let [dx, dy] of directions) {
            let count = 1;
            let x = i + dx;
            let y = j + dy;

            while (x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize && board[x][y] === board[i][j]) {
              count++;
              x += dx;
              y += dy;
            }

            if (count >= 5) {
              return board[i][j];
            }
          }
        }
      }
    }

    return 0;
  }

  updateUI() {
    const currentPlayerElement = document.getElementById("currentPlayer");
    const gameStatusElement = document.getElementById("gameStatus");

    // 第一颗落子前不显示；进行中固定文案；结束时显示结束
    if (this.moveHistory.length === 0 && !this.gameOver) {
      gameStatusElement.style.display = "none";
      gameStatusElement.textContent = "";
      gameStatusElement.classList.remove("游戏进行中状态");
    } else if (this.gameOver) {
      gameStatusElement.style.display = "block";
      gameStatusElement.textContent = "游戏结束";
      gameStatusElement.classList.remove("游戏进行中状态");
    } else {
      gameStatusElement.style.display = "block";
      gameStatusElement.textContent = "游戏进行中";
      gameStatusElement.classList.add("游戏进行中状态");
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
