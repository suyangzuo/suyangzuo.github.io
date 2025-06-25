// 俄罗斯方块游戏 - 现代版
class TetrisGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.nextCanvas = document.getElementById("nextCanvas");
    this.nextCtx = this.nextCanvas.getContext("2d");

    // 游戏配置
    this.BOARD_WIDTH = 10;
    this.BOARD_HEIGHT = 20;
    this.BLOCK_SIZE = 45; // 方块尺寸

    // 设置Canvas尺寸
    this.canvas.width = this.BOARD_WIDTH * this.BLOCK_SIZE;
    this.canvas.height = this.BOARD_HEIGHT * this.BLOCK_SIZE;

    // 游戏状态
    this.gameState = "waiting"; // waiting, playing, paused, gameOver, levelComplete, clearing
    this.board = [];
    this.currentPiece = null;
    this.nextPiece = null;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.targetScore = 1000;

    // 游戏控制
    this.dropTime = 0;
    this.dropInterval = 1000; // 初始下落间隔1秒
    this.lastTime = 0;
    this.keys = {};
    this.animationId = null; // 添加动画ID跟踪

    // 消除动画相关
    this.clearingLines = []; // 正在消除的行
    this.clearAnimationTime = 0;
    this.clearAnimationDuration = 1000; // 消除动画持续1秒
    this.clearAnimationState = "none"; // none, fading, dropping

    // 碎片系统
    this.fragments = []; // 存储所有碎片
    this.fragmentAnimationTime = 0;
    this.fragmentAnimationDuration = 1500; // 碎片动画持续时间

    // 光影扫过动画系统
    this.lightSweepAnimation = {
      active: false,
      startTime: 0,
      duration: 800, // 加快光影扫过速度
      sweepPosition: 0, // 光影当前位置
      sweepSpeed: 0, // 光影移动速度
      breakingBlocks: [], // 正在破碎的方块
      brokenBlocks: [], // 已破碎的方块
      clearingRows: [], // 需要消除的行
    };

    // 方块类型定义
    this.pieces = {
      I: {
        shape: [[1, 1, 1, 1]],
        color: "#00f5ff",
      },
      O: {
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: "#ffff00",
      },
      T: {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
        ],
        color: "#a000f0",
      },
      S: {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
        ],
        color: "#00f000",
      },
      Z: {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
        ],
        color: "#f00000",
      },
      J: {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
        ],
        color: "#0000f0",
      },
      L: {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
        ],
        color: "#f0a000",
      },
    };

    this.init();
  }

  init() {
    this.initBoard();
    this.bindEvents();
    this.updateUI();
    this.showOverlay("游戏开始", "按空格键开始游戏");
  }

  initBoard() {
    this.board = Array(this.BOARD_HEIGHT)
      .fill()
      .map(() => Array(this.BOARD_WIDTH).fill(0));
  }

  bindEvents() {
    // 键盘事件
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      this.handleKeyPress(e);
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // 按钮事件
    document.getElementById("startBtn").addEventListener("click", () => {
      this.startGame();
    });

    document.getElementById("pauseBtn").addEventListener("click", () => {
      this.togglePause();
    });

    document.getElementById("resetGame").addEventListener("click", () => {
      this.resetGame();
    });
  }

  handleKeyPress(e) {
    // 处理空格键开始游戏
    if (e.code === "Space" && this.gameState === "waiting") {
      e.preventDefault();
      this.startGame();
      return;
    }

    // 处理暂停/恢复
    if (e.code === "KeyP") {
      e.preventDefault();
      if (this.gameState === "playing") {
        this.togglePause();
      } else if (this.gameState === "paused") {
        this.togglePause();
      }
      return;
    }

    // 游戏进行中的操作
    if (this.gameState !== "playing") return;

    switch (e.code) {
      case "KeyA":
      case "ArrowLeft":
        this.movePiece(-1, 0);
        break;
      case "KeyD":
      case "ArrowRight":
        this.movePiece(1, 0);
        break;
      case "KeyS":
      case "ArrowDown":
        this.movePiece(0, 1);
        break;
      case "KeyW":
      case "ArrowUp":
      case "Space":
        this.rotatePiece();
        break;
    }
  }

  startGame() {
    this.gameState = "playing";
    this.hideOverlay();
    this.spawnPiece();
    this.gameLoop();
  }

  togglePause() {
    if (this.gameState === "playing") {
      this.gameState = "paused";
      this.showOverlay("游戏暂停", "按P键或点击继续按钮恢复游戏");
      document.getElementById("pauseBtn").style.display = "inline-block";
      document.getElementById("startBtn").style.display = "none";
      // 停止游戏循环
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    } else if (this.gameState === "paused") {
      this.gameState = "playing";
      this.hideOverlay();
      document.getElementById("pauseBtn").style.display = "none";
      document.getElementById("startBtn").style.display = "inline-block";
      // 重新启动游戏循环，重置时间
      this.lastTime = 0;
      this.gameLoop();
    }
  }

  resetGame() {
    // 停止当前游戏循环
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.gameState = "waiting";
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.targetScore = 1000;
    this.dropInterval = 1000;
    this.initBoard();
    this.currentPiece = null;
    this.nextPiece = null;
    this.updateUI();
    this.showOverlay("游戏开始", "按空格键开始游戏");
    document.getElementById("pauseBtn").style.display = "none";
    document.getElementById("startBtn").style.display = "inline-block";

    // 清空画布
    this.draw();
  }

  spawnPiece() {
    if (!this.nextPiece) {
      this.nextPiece = this.createRandomPiece();
    }

    this.currentPiece = this.nextPiece;
    this.nextPiece = this.createRandomPiece();

    // 检查游戏是否结束
    if (this.isCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
      this.gameOver();
    }

    this.drawNextPiece();
  }

  createRandomPiece() {
    const pieceTypes = Object.keys(this.pieces);
    const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
    const piece = this.pieces[randomType];

    return {
      type: randomType,
      shape: piece.shape,
      color: piece.color,
      x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
      y: 0,
    };
  }

  movePiece(dx, dy) {
    if (!this.currentPiece || this.gameState === "clearing") return;

    const newX = this.currentPiece.x + dx;
    const newY = this.currentPiece.y + dy;

    if (!this.isCollision(newX, newY, this.currentPiece.shape)) {
      this.currentPiece.x = newX;
      this.currentPiece.y = newY;

      // 如果是向下移动，重置下落时间
      if (dy > 0) {
        this.dropTime = 0;
      }

      return true;
    }

    // 如果是向下移动且发生碰撞，则固定方块
    if (dy > 0) {
      this.placePiece();
      this.clearLines();
      // 注意：clearLines方法会根据是否有行需要消除来决定是否调用spawnPiece
    }

    return false;
  }

  rotatePiece() {
    if (!this.currentPiece) return;

    const rotated = this.rotateMatrix(this.currentPiece.shape);

    if (!this.isCollision(this.currentPiece.x, this.currentPiece.y, rotated)) {
      this.currentPiece.shape = rotated;
    }
  }

  rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = Array(cols)
      .fill()
      .map(() => Array(rows).fill(0));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = matrix[i][j];
      }
    }

    return rotated;
  }

  isCollision(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const boardX = x + col;
          const boardY = y + row;

          if (
            boardX < 0 ||
            boardX >= this.BOARD_WIDTH ||
            boardY >= this.BOARD_HEIGHT ||
            (boardY >= 0 && this.board[boardY][boardX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  placePiece() {
    if (!this.currentPiece) return;

    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          const boardX = this.currentPiece.x + col;
          const boardY = this.currentPiece.y + row;

          if (boardY >= 0) {
            this.board[boardY][boardX] = this.currentPiece.color;
          }
        }
      }
    }
  }

  clearLines() {
    let linesToClear = [];

    // 找出需要消除的行
    for (let row = this.BOARD_HEIGHT - 1; row >= 0; row--) {
      if (this.board[row].every((cell) => cell !== 0)) {
        linesToClear.push(row);
      }
    }

    if (linesToClear.length > 0) {
      // 开始消除动画
      this.startClearAnimation(linesToClear);
    } else {
      // 没有行需要消除，直接生成下一个方块
      this.spawnPiece();
    }
  }

  startClearAnimation(linesToClear) {
    this.clearingLines = linesToClear;
    this.fragments = []; // 清空碎片
    this.fragmentAnimationTime = 0;
    this.gameState = "clearing";

    // 初始化光影扫过动画
    this.lightSweepAnimation.active = true;
    this.lightSweepAnimation.startTime = 0;
    this.lightSweepAnimation.sweepPosition = -50; // 从左侧开始
    this.lightSweepAnimation.sweepSpeed = (this.canvas.width + 100) / (this.lightSweepAnimation.duration / 16); // 计算速度
    this.lightSweepAnimation.breakingBlocks = [];
    this.lightSweepAnimation.brokenBlocks = [];
    this.lightSweepAnimation.clearingRows = linesToClear;

    // 收集所有需要消除的方块
    this.clearingLines.forEach((row) => {
      for (let col = 0; col < this.BOARD_WIDTH; col++) {
        if (this.board[row][col]) {
          this.lightSweepAnimation.breakingBlocks.push({
            row: row,
            col: col,
            color: this.board[row][col],
            broken: false,
            fragments: [],
          });
        }
      }
    });

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.lightSweepAnimationLoop();
  }

  lightSweepAnimationLoop(currentTime = 0) {
    if (this.gameState !== "clearing" || !this.lightSweepAnimation.active) return;

    if (this.lightSweepAnimation.startTime === 0) {
      this.lightSweepAnimation.startTime = currentTime;
    }

    const elapsed = currentTime - this.lightSweepAnimation.startTime;
    const progress = Math.min(elapsed / this.lightSweepAnimation.duration, 1);

    // 更新光影位置 - 只在满行上扫过
    this.lightSweepAnimation.sweepPosition = -30 + (this.canvas.width + 60) * progress;

    // 检查哪些方块应该破碎
    this.checkBreakingBlocks();

    // 更新碎片
    this.updateSweepFragments();

    // 绘制
    this.drawLightSweepAnimation();

    if (progress >= 1) {
      // 动画结束，执行消除
      this.performLineClear();

      // 检查是否还有满行需要消除
      const remainingLinesToClear = this.checkForFullLines();
      if (remainingLinesToClear.length > 0) {
        // 还有满行，继续消除动画
        this.startClearAnimation(remainingLinesToClear);
      } else {
        // 没有满行了，生成新方块并继续游戏
        this.gameState = "playing";
        this.spawnPiece();

        // 重置游戏循环相关的时间变量
        this.lastTime = 0;
        this.dropTime = 0;

        // 重新启动游戏循环
        this.gameLoop();
      }
      return;
    }

    this.animationId = requestAnimationFrame((time) => this.lightSweepAnimationLoop(time));
  }

  checkBreakingBlocks() {
    const sweepX = this.lightSweepAnimation.sweepPosition;
    const sweepWidth = 80; // 增加光影宽度

    this.lightSweepAnimation.breakingBlocks.forEach((block) => {
      if (!block.broken) {
        const blockX = block.col * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;

        // 检查方块是否在光影范围内
        if (blockX >= sweepX - sweepWidth / 2 && blockX <= sweepX + sweepWidth / 2) {
          block.broken = true;
          this.createSweepFragments(block);
        }
      }
    });
  }

  createSweepFragments(block) {
    const centerX = block.col * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
    const centerY = block.row * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
    const fragmentCount = 6;

    for (let i = 0; i < fragmentCount; i++) {
      const angle = (i / fragmentCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      const fragment = {
        x: centerX + (Math.random() - 0.5) * 10,
        y: centerY + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // 向上飞溅
        size: 4 + Math.random() * 8,
        color: block.color,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.6,
        gravity: 0.2 + Math.random() * 0.1,
        life: 1,
        originalColor: block.color,
        colorShift: Math.random() * 0.4,
      };
      block.fragments.push(fragment);
    }
  }

  updateSweepFragments() {
    this.lightSweepAnimation.breakingBlocks.forEach((block) => {
      if (block.broken) {
        block.fragments.forEach((fragment) => {
          // 更新位置
          fragment.x += fragment.vx;
          fragment.y += fragment.vy;
          fragment.vy += fragment.gravity;

          // 空气阻力
          fragment.vx *= 0.94; // 增加阻力
          fragment.vy *= 0.94;

          // 更新旋转
          fragment.rotation += fragment.rotationSpeed;
          fragment.rotationSpeed *= 0.96; // 更快减速

          // 更新透明度 - 更快消失
          fragment.alpha = Math.max(0, fragment.alpha - 0.04);

          // 颜色变化
          const colorShift = (1 - fragment.alpha) * fragment.colorShift;
          fragment.color = this.shiftColor(fragment.originalColor, colorShift);
        });
      }
    });
  }

  drawLightSweepAnimation() {
    this.drawBoard();

    // 绘制光影效果
    this.drawLightSweep();

    // 绘制碎片
    this.drawSweepFragments();

    this.drawCurrentPiece();
    this.drawGrid();
  }

  drawLightSweep() {
    const sweepX = this.lightSweepAnimation.sweepPosition;
    const sweepWidth = 120; // 增加光效宽度，不限制于block尺寸

    // 只在满行上绘制光影
    this.lightSweepAnimation.clearingRows.forEach((row) => {
      const rowY = row * this.BLOCK_SIZE;
      const rowHeight = this.BLOCK_SIZE;

      // 创建梦幻光效

      // 1. 主光束 - 柔和的白色光柱，带有朦胧感
      const mainGradient = this.ctx.createLinearGradient(sweepX - sweepWidth / 3, rowY, sweepX + sweepWidth / 3, rowY);
      mainGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      mainGradient.addColorStop(0.2, "rgba(255, 255, 255, 0.3)");
      mainGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.7)");
      mainGradient.addColorStop(0.8, "rgba(255, 255, 255, 0.3)");
      mainGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      this.ctx.fillStyle = mainGradient;
      this.ctx.fillRect(sweepX - sweepWidth / 3, rowY - 10, (sweepWidth * 2) / 3, rowHeight + 20);

      // 2. 外光晕 - 梦幻的紫色光晕
      const outerGradient = this.ctx.createRadialGradient(
        sweepX,
        rowY + rowHeight / 2,
        0,
        sweepX,
        rowY + rowHeight / 2,
        sweepWidth / 1.5
      );
      outerGradient.addColorStop(0, "rgba(147, 112, 219, 0.4)");
      outerGradient.addColorStop(0.3, "rgba(138, 43, 226, 0.3)");
      outerGradient.addColorStop(0.6, "rgba(75, 0, 130, 0.2)");
      outerGradient.addColorStop(1, "rgba(75, 0, 130, 0)");

      this.ctx.fillStyle = outerGradient;
      this.ctx.fillRect(sweepX - sweepWidth / 1.5, rowY - 20, (sweepWidth * 3) / 1.5, rowHeight + 40);

      // 3. 内光晕 - 温暖的橙色光晕
      const innerGradient = this.ctx.createRadialGradient(
        sweepX,
        rowY + rowHeight / 2,
        0,
        sweepX,
        rowY + rowHeight / 2,
        sweepWidth / 2
      );
      innerGradient.addColorStop(0, "rgba(255, 182, 193, 0.5)");
      innerGradient.addColorStop(0.4, "rgba(255, 140, 0, 0.3)");
      innerGradient.addColorStop(0.8, "rgba(255, 69, 0, 0.1)");
      innerGradient.addColorStop(1, "rgba(255, 69, 0, 0)");

      this.ctx.fillStyle = innerGradient;
      this.ctx.fillRect(sweepX - sweepWidth / 2, rowY - 15, sweepWidth, rowHeight + 30);

      // 4. 中心亮点 - 梦幻的白色光点
      const centerGradient = this.ctx.createRadialGradient(
        sweepX,
        rowY + rowHeight / 2,
        0,
        sweepX,
        rowY + rowHeight / 2,
        15
      );
      centerGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      centerGradient.addColorStop(0.4, "rgba(255, 255, 255, 0.6)");
      centerGradient.addColorStop(0.8, "rgba(255, 255, 255, 0.2)");
      centerGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      this.ctx.fillStyle = centerGradient;
      this.ctx.fillRect(sweepX - 15, rowY + rowHeight / 2 - 15, 30, 30);

      // 5. 光粒子效果 - 随机的小光点
      for (let i = 0; i < 5; i++) {
        const particleX = sweepX + ((Math.random() - 0.5) * sweepWidth) / 2;
        const particleY = rowY + Math.random() * rowHeight;
        const particleSize = 2 + Math.random() * 4;

        const particleGradient = this.ctx.createRadialGradient(
          particleX,
          particleY,
          0,
          particleX,
          particleY,
          particleSize
        );
        particleGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        particleGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        this.ctx.fillStyle = particleGradient;
        this.ctx.fillRect(particleX - particleSize, particleY - particleSize, particleSize * 2, particleSize * 2);
      }

      // 6. 光带效果 - 水平的光带
      const bandGradient = this.ctx.createLinearGradient(
        sweepX - sweepWidth / 2,
        rowY + rowHeight / 2,
        sweepX + sweepWidth / 2,
        rowY + rowHeight / 2
      );
      bandGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      bandGradient.addColorStop(0.3, "rgba(255, 255, 255, 0.4)");
      bandGradient.addColorStop(0.7, "rgba(255, 255, 255, 0.4)");
      bandGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      this.ctx.fillStyle = bandGradient;
      this.ctx.fillRect(sweepX - sweepWidth / 2, rowY + rowHeight / 2 - 2, sweepWidth, 4);
    });
  }

  drawSweepFragments() {
    this.lightSweepAnimation.breakingBlocks.forEach((block) => {
      if (block.broken) {
        block.fragments.forEach((fragment) => {
          this.drawFragment(fragment);
        });
      }
    });
  }

  drawFragment(fragment) {
    this.ctx.save();
    this.ctx.globalAlpha = fragment.alpha;
    this.ctx.translate(fragment.x, fragment.y);
    this.ctx.rotate(fragment.rotation);

    // 绘制碎片（不规则形状）
    this.ctx.fillStyle = fragment.color;

    // 随机形状：有时是方块，有时是圆形
    if (Math.random() > 0.5) {
      // 方块碎片
      this.ctx.fillRect(-fragment.size / 2, -fragment.size / 2, fragment.size, fragment.size);

      // 高光
      this.ctx.fillStyle = this.lightenColor(fragment.color, 0.4);
      this.ctx.fillRect(-fragment.size / 2, -fragment.size / 2, fragment.size, 2);
      this.ctx.fillRect(-fragment.size / 2, -fragment.size / 2, 2, fragment.size);
    } else {
      // 圆形碎片
      this.ctx.beginPath();
      this.ctx.arc(0, 0, fragment.size / 2, 0, Math.PI * 2);
      this.ctx.fill();

      // 高光
      this.ctx.fillStyle = this.lightenColor(fragment.color, 0.4);
      this.ctx.beginPath();
      this.ctx.arc(-fragment.size / 4, -fragment.size / 4, fragment.size / 6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  performLineClear() {
    // 实际执行行消除
    this.clearingLines.sort((a, b) => b - a); // 从下往上排序

    this.clearingLines.forEach((row) => {
      this.board.splice(row, 1);
      this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
    });

    // 更新分数和行数
    this.lines += this.clearingLines.length;
    this.addScore(this.clearingLines.length);
    this.checkLevelUp();

    // 清空消除行数组
    this.clearingLines = [];
  }

  addScore(linesCleared) {
    const lineScores = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4行
    const score = lineScores[linesCleared] * this.level;
    this.score += score;
    this.updateUI();
  }

  checkLevelUp() {
    if (this.score >= this.targetScore && this.level < 10) {
      this.level++;
      this.targetScore = this.level * 1000; // 每关递增1000分
      this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100); // 每关加快100ms
      this.showLevelUp();
    }
  }

  showLevelUp() {
    this.gameState = "levelComplete";
    this.showOverlay(`第 ${this.level} 关！`, `目标分数: ${this.targetScore}`);

    // 停止当前方块的下落
    this.currentPiece = null;

    // 暂停游戏循环
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    setTimeout(() => {
      if (this.gameState === "levelComplete") {
        // 清除所有方块
        this.clearAllBlocks();
        this.gameState = "playing";
        this.hideOverlay();
        // 重新启动游戏循环
        this.lastTime = 0;
        this.gameLoop();
      }
    }, 2000);
  }

  clearAllBlocks() {
    // 清除游戏板上的所有方块
    this.board = Array(this.BOARD_HEIGHT)
      .fill()
      .map(() => Array(this.BOARD_WIDTH).fill(0));
    // 重置当前方块和下一个方块
    this.currentPiece = null;
    this.nextPiece = null;
  }

  gameOver() {
    this.gameState = "gameOver";
    this.showOverlay("游戏结束", `最终分数: ${this.score}`);
    document.getElementById("pauseBtn").style.display = "none";
    document.getElementById("startBtn").style.display = "inline-block";

    // 停止游戏循环
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  gameLoop(currentTime = 0) {
    if (this.gameState !== "playing") return;

    // 如果是第一次运行，初始化lastTime
    if (this.lastTime === 0) {
      this.lastTime = currentTime;
    }

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.dropTime += deltaTime;

    if (this.dropTime >= this.dropInterval) {
      this.movePiece(0, 1);
      this.dropTime = 0;
    }

    this.draw();
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  draw() {
    this.drawBoard();
    this.drawCurrentPiece();
    this.drawGrid();
  }

  drawBoard() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let row = 0; row < this.BOARD_HEIGHT; row++) {
      for (let col = 0; col < this.BOARD_WIDTH; col++) {
        if (this.board[row][col]) {
          this.drawBlock(col, row, this.board[row][col]);
        }
      }
    }
  }

  drawCurrentPiece() {
    if (!this.currentPiece) return;

    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          this.drawBlock(this.currentPiece.x + col, this.currentPiece.y + row, this.currentPiece.color);
        }
      }
    }
  }

  drawBlock(x, y, color) {
    const pixelX = x * this.BLOCK_SIZE;
    const pixelY = y * this.BLOCK_SIZE;

    // 主方块
    this.ctx.fillStyle = color;
    this.ctx.fillRect(pixelX + 1, pixelY + 1, this.BLOCK_SIZE - 2, this.BLOCK_SIZE - 2);

    // 高光效果
    this.ctx.fillStyle = this.lightenColor(color, 0.3);
    this.ctx.fillRect(pixelX + 1, pixelY + 1, this.BLOCK_SIZE - 2, 3);
    this.ctx.fillRect(pixelX + 1, pixelY + 1, 3, this.BLOCK_SIZE - 2);

    // 阴影效果
    this.ctx.fillStyle = this.darkenColor(color, 0.3);
    this.ctx.fillRect(pixelX + this.BLOCK_SIZE - 4, pixelY + 1, 3, this.BLOCK_SIZE - 2);
    this.ctx.fillRect(pixelX + 1, pixelY + this.BLOCK_SIZE - 4, this.BLOCK_SIZE - 2, 3);
  }

  drawGrid() {
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= this.BOARD_WIDTH; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.BLOCK_SIZE, 0);
      this.ctx.lineTo(x * this.BLOCK_SIZE, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.BLOCK_SIZE);
      this.ctx.lineTo(this.canvas.width, y * this.BLOCK_SIZE);
      this.ctx.stroke();
    }
  }

  drawNextPiece() {
    // 完全清空画布，使用不透明的黑色背景
    this.nextCtx.fillStyle = "rgba(0, 0, 0, 1)";
    this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

    if (!this.nextPiece) return;

    const blockSize = 20;
    const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
    const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;

    for (let row = 0; row < this.nextPiece.shape.length; row++) {
      for (let col = 0; col < this.nextPiece.shape[row].length; col++) {
        // 只绘制值为1的方块，值为0的部分保持透明
        if (this.nextPiece.shape[row][col] === 1) {
          const x = offsetX + col * blockSize;
          const y = offsetY + row * blockSize;

          this.nextCtx.fillStyle = this.nextPiece.color;
          this.nextCtx.fillRect(x + 1, y + 1, blockSize - 2, blockSize - 2);

          // 高光
          this.nextCtx.fillStyle = this.lightenColor(this.nextPiece.color, 0.3);
          this.nextCtx.fillRect(x + 1, y + 1, blockSize - 2, 2);
          this.nextCtx.fillRect(x + 1, y + 1, 2, blockSize - 2);

          // 阴影
          this.nextCtx.fillStyle = this.darkenColor(this.nextPiece.color, 0.3);
          this.nextCtx.fillRect(x + blockSize - 3, y + 1, 2, blockSize - 2);
          this.nextCtx.fillRect(x + 1, y + blockSize - 3, blockSize - 2, 2);
        }
      }
    }
  }

  lightenColor(color, amount) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  darkenColor(color, amount) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;
    return (
      "#" +
      (
        0x1000000 +
        (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
        (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
        (B > 255 ? 255 : B < 0 ? 0 : B)
      )
        .toString(16)
        .slice(1)
    );
  }

  showOverlay(title, message) {
    const overlay = document.getElementById("gameOverlay");
    const titleEl = document.getElementById("overlayTitle");
    const messageEl = document.getElementById("overlayMessage");

    titleEl.textContent = title;
    messageEl.textContent = message;
    overlay.style.display = "flex";
  }

  hideOverlay() {
    const overlay = document.getElementById("gameOverlay");
    overlay.style.display = "none";
  }

  updateUI() {
    document.getElementById("level").textContent = this.level;
    document.getElementById("score").textContent = this.score;
    document.getElementById("target").textContent = this.targetScore;
    document.getElementById("lines").textContent = this.lines;
  }

  shiftColor(color, amount) {
    const num = parseInt(color.replace("#", ""), 16);
    const R = num >> 16;
    const G = (num >> 8) & 0x00ff;
    const B = num & 0x0000ff;

    // 向白色偏移
    const shiftR = Math.min(255, R + (255 - R) * amount);
    const shiftG = Math.min(255, G + (255 - G) * amount);
    const shiftB = Math.min(255, B + (255 - B) * amount);

    return (
      "#" +
      (0x1000000 + Math.round(shiftR) * 0x10000 + Math.round(shiftG) * 0x100 + Math.round(shiftB)).toString(16).slice(1)
    );
  }

  checkForFullLines() {
    let linesToClear = [];

    // 找出需要消除的行
    for (let row = this.BOARD_HEIGHT - 1; row >= 0; row--) {
      if (this.board[row].every((cell) => cell !== 0)) {
        linesToClear.push(row);
      }
    }

    return linesToClear;
  }
}

// 初始化游戏
document.addEventListener("DOMContentLoaded", () => {
  new TetrisGame();
});
