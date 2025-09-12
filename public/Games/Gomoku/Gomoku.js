// 五子棋游戏 - 基于参考项目的算法实现
class GomokuGame {
  constructor() {
    this.boardSize = 15; // 15x15棋盘
    this.board = []; // 棋盘状态
    this.currentPlayer = 1; // 1为黑棋，2为白棋
    this.gameOver = false;
    this.moveHistory = []; // 移动历史，用于悔棋
    this.aiMode = false; // AI模式
    this.aiPlayer = 2; // AI玩家（白棋）
    
    this.canvas = null;
    this.ctx = null;
    this.cellSize = 0;
    this.padding = 30;
    
    // 音效
    this.clickSound = new Audio('./Audio/click.wav');
    this.selectSound = new Audio('./Audio/select.wav');
    
    this.init();
  }
  
  init() {
    this.canvas = document.getElementById('gameBoard');
    this.ctx = this.canvas.getContext('2d');
    this.cellSize = (this.canvas.width - 2 * this.padding) / (this.boardSize - 1);
    
    // 初始化棋盘
    this.resetBoard();
    
    // 绑定事件
    this.bindEvents();
    
    // 绘制棋盘
    this.drawBoard();
    
    console.log('五子棋游戏初始化完成');
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
    
    // 隐藏游戏结果
    const gameResult = document.getElementById('gameResult');
    if (gameResult) {
      gameResult.style.display = 'none';
    }
    
    this.updateUI();
  }
  
  bindEvents() {
    // 棋盘点击事件
    this.canvas.addEventListener('click', (e) => {
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
    
    // 按钮事件
    document.getElementById('resetGame').addEventListener('click', () => {
      this.resetBoard();
      this.drawBoard();
    });
    
    document.getElementById('undoMove').addEventListener('click', () => {
      this.undoMove();
    });
    
    document.getElementById('aiMode').addEventListener('click', () => {
      this.toggleAIMode();
    });
    
    // 重置按钮事件
    document.querySelector('.重置游戏').addEventListener('click', () => {
      this.resetBoard();
      this.drawBoard();
    });
    
    // 说明按钮事件
    document.getElementById('toggleInstructions').addEventListener('click', () => {
      this.toggleInstructions();
    });
    
    // 关闭按钮事件
    document.getElementById('closeInstructions').addEventListener('click', () => {
      this.closeInstructions();
    });
    
    // 点击遮罩层关闭窗口
    document.getElementById('instructionsContent').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.closeInstructions();
      }
    });
  }
  
  isValidMove(row, col) {
    return row >= 0 && row < this.boardSize && 
           col >= 0 && col < this.boardSize && 
           this.board[row][col] === 0;
  }
  
  makeMove(row, col) {
    if (!this.isValidMove(row, col) || this.gameOver) return false;
    
    // 记录移动历史
    this.moveHistory.push({
      row: row,
      col: col,
      player: this.currentPlayer
    });
    
    // 放置棋子
    this.board[row][col] = this.currentPlayer;
    
    // 播放棋子下落音效
    this.playClickSound();
    
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
      setTimeout(() => {
        this.aiMove();
      }, 500); // 延迟500ms让玩家看到自己的移动
    }
    
    return true;
  }
  
  drawBoard() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制棋盘背景
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制网格线
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i < this.boardSize; i++) {
      const pos = this.padding + i * this.cellSize;
      
      // 垂直线
      this.ctx.beginPath();
      this.ctx.moveTo(pos, this.padding);
      this.ctx.lineTo(pos, this.canvas.height - this.padding);
      this.ctx.stroke();
      
      // 水平线
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, pos);
      this.ctx.lineTo(this.canvas.width - this.padding, pos);
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
      [3, 3], [3, 11], [7, 7], [11, 3], [11, 11]
    ];
    
    this.ctx.fillStyle = '#000';
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
      this.ctx.fillStyle = '#000';
      this.ctx.fill();
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    } else {
      // 白棋
      this.ctx.fillStyle = '#fff';
      this.ctx.fill();
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }
  
  checkWin(row, col, player) {
    const directions = [
      [0, 1],   // 水平
      [1, 0],   // 垂直
      [1, 1],   // 对角线
      [1, -1]   // 反对角线
    ];
    
    for (let [dx, dy] of directions) {
      let count = 1; // 包含当前棋子
      
      // 向一个方向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        if (newRow >= 0 && newRow < this.boardSize && 
            newCol >= 0 && newCol < this.boardSize && 
            this.board[newRow][newCol] === player) {
          count++;
        } else {
          break;
        }
      }
      
      // 向相反方向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row - i * dx;
        const newCol = col - i * dy;
        if (newRow >= 0 && newRow < this.boardSize && 
            newCol >= 0 && newCol < this.boardSize && 
            this.board[newRow][newCol] === player) {
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
    this.playSelectSound();
    
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
    const button = document.getElementById('aiMode');
    button.textContent = this.aiMode ? '人机模式' : 'AI模式';
    button.style.background = this.aiMode ? 
      'linear-gradient(135deg, #4CAF50, #45a049)' : 
      'linear-gradient(135deg, #ffd700, #ffed4e)';
    
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
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    
    for (let [dx, dy] of directions) {
      let aiCount = 0;
      let playerCount = 0;
      let emptyCount = 0;
      
      // 检查这个方向上的棋子
      for (let i = -4; i <= 4; i++) {
        if (i === 0) continue;
        
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        
        if (newRow >= 0 && newRow < this.boardSize && 
            newCol >= 0 && newCol < this.boardSize) {
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
    const currentPlayerElement = document.getElementById('currentPlayer');
    const gameStatusElement = document.getElementById('gameStatus');
    
    if (this.gameOver) {
      gameStatusElement.textContent = '游戏结束';
    } else {
      gameStatusElement.textContent = '游戏进行中';
    }
    
    if (this.currentPlayer === 1) {
      currentPlayerElement.textContent = '黑棋';
      currentPlayerElement.style.color = '#000';
    } else {
      currentPlayerElement.textContent = '白棋';
      currentPlayerElement.style.color = '#fff';
    }
  }
  
  showGameResult(winner) {
    let message = '';
    if (winner === 0) {
      message = '平局！';
    } else if (winner === 1) {
      message = '黑棋获胜！';
    } else {
      message = '白棋获胜！';
    }
    
    const gameResult = document.getElementById('gameResult');
    const resultContent = document.getElementById('resultContent');
    
    resultContent.textContent = message;
    gameResult.style.display = 'block';
  }
  
  // 音效播放方法
  playClickSound() {
    try {
      this.clickSound.currentTime = 0; // 重置音频到开始位置
      this.clickSound.play().catch(e => {
        console.log('音效播放失败:', e);
      });
    } catch (e) {
      console.log('音效加载失败:', e);
    }
  }
  
  playSelectSound() {
    try {
      this.selectSound.currentTime = 0; // 重置音频到开始位置
      this.selectSound.play().catch(e => {
        console.log('音效播放失败:', e);
      });
    } catch (e) {
      console.log('音效加载失败:', e);
    }
  }
  
  // 切换说明显示/隐藏
  toggleInstructions() {
    const button = document.getElementById('toggleInstructions');
    const content = document.getElementById('instructionsContent');
    
    if (content.style.display === 'none') {
      content.style.display = 'block';
      button.classList.add('展开');
    } else {
      this.closeInstructions();
    }
  }
  
  // 关闭说明窗口
  closeInstructions() {
    const button = document.getElementById('toggleInstructions');
    const content = document.getElementById('instructionsContent');
    
    content.style.display = 'none';
    button.classList.remove('展开');
  }
}

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('五子棋游戏加载完成');
  
  // 创建游戏实例
  window.gomokuGame = new GomokuGame();
});
