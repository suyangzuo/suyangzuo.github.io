function 新建棋盘() {
  let 棋盘 = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  let 初始数字位置1 = {
    x: Math.floor(Math.random() * 4),
    y: Math.floor(Math.random() * 4),
  };

  let 初始数字位置2 = {
    x: Math.floor(Math.random() * 4),
    y: Math.floor(Math.random() * 4),
  };

  while (初始数字位置1.x === 初始数字位置2.x && 初始数字位置1.y === 初始数字位置2.y) {
    初始数字位置2 = {
      x: Math.floor(Math.random() * 4),
      y: Math.floor(Math.random() * 4),
    };
  }

  棋盘[初始数字位置1.x][初始数字位置1.y] = 2;
  棋盘[初始数字位置2.x][初始数字位置2.y] = 2;

  return 棋盘;
}

let 棋盘 = 新建棋盘();
let 前一个棋盘 = null;

function 棋盘已满(棋盘) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (棋盘[i][j] === 0) {
        return false;
      }
    }
  }
  return true;
}

function 每次移动后随机生成一个数字(棋盘) {
  let 生成数字位置 = {
    x: Math.floor(Math.random() * 4),
    y: Math.floor(Math.random() * 4),
  };

  if (棋盘已满(棋盘)) {
    return 棋盘;
  } else {
    while (棋盘[生成数字位置.x][生成数字位置.y] != 0) {
      生成数字位置 = {
        x: Math.floor(Math.random() * 4),
        y: Math.floor(Math.random() * 4),
      };
    }
    棋盘[生成数字位置.x][生成数字位置.y] = 2;
  }
}

function 已胜利(棋盘) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (棋盘[i][j] === 2048) {
        return true;
      }
    }
  }
  return false;
}

function 已失败(棋盘) {
  if (!棋盘已满(棋盘)) {
    return false;
  }

  for (let 行 = 0; 行 < 4; 行++) {
    for (let 列 = 0; 列 < 3; 列++) {
      if (棋盘[行][列] === 棋盘[行][列 + 1]) {
        return false;
      }
    }
  }

  for (let 列 = 0; 列 < 4; 列++) {
    for (let 行 = 0; 行 < 3; 行++) {
      if (棋盘[行][列] === 棋盘[行 + 1][列]) {
        return false;
      }
    }
  }

  return true;
}

function 处理序列(序列) {
  const 非零 = 序列.filter(v => v !== 0);
  const 结果 = [];
  for (let i = 0; i < 非零.length; i++) {
    if (i + 1 < 非零.length && 非零[i] === 非零[i + 1]) {
      const 合并值 = 非零[i] * 2;
      分数 += 合并值;
      结果.push(合并值);
      i++;
    } else {
      结果.push(非零[i]);
    }
  }
  while (结果.length < 4) 结果.push(0);
  return 结果;
}

function 计算移动映射(旧盘, 方向) {
  const 结果 = [];
  if (方向 === '上' || 方向 === '下') {
    for (let 列 = 0; 列 < 4; 列++) {
      const 非零 = [];
      if (方向 === '上') {
        for (let 行 = 0; 行 < 4; 行++) {
          const 值 = 旧盘[行][列];
          if (值 !== 0) 非零.push({行, 列, 值});
        }
        let 目标行 = 0;
        for (let i = 0; i < 非零.length; i++) {
          if (i + 1 < 非零.length && 非零[i].值 === 非零[i + 1].值) {
            const 合并值 = 非零[i].值 * 2;
            结果.push({行: 目标行, 列, 值: 合并值, 源: [非零[i], 非零[i + 1]]});
            i++;
            目标行++;
          } else {
            结果.push({行: 目标行, 列, 值: 非零[i].值, 源: [非零[i]]});
            目标行++;
          }
        }
      } else {
        for (let 行 = 3; 行 >= 0; 行--) {
          const 值 = 旧盘[行][列];
          if (值 !== 0) 非零.push({行, 列, 值});
        }
        let 目标行 = 3;
        for (let i = 0; i < 非零.length; i++) {
          if (i + 1 < 非零.length && 非零[i].值 === 非零[i + 1].值) {
            const 合并值 = 非零[i].值 * 2;
            结果.push({行: 目标行, 列, 值: 合并值, 源: [非零[i], 非零[i + 1]]});
            i++;
            目标行--;
          } else {
            结果.push({行: 目标行, 列, 值: 非零[i].值, 源: [非零[i]]});
            目标行--;
          }
        }
      }
    }
  } else {
    for (let 行 = 0; 行 < 4; 行++) {
      const 非零 = [];
      if (方向 === '左') {
        for (let 列 = 0; 列 < 4; 列++) {
          const 值 = 旧盘[行][列];
          if (值 !== 0) 非零.push({行, 列, 值});
        }
        let 目标列 = 0;
        for (let i = 0; i < 非零.length; i++) {
          if (i + 1 < 非零.length && 非零[i].值 === 非零[i + 1].值) {
            const 合并值 = 非零[i].值 * 2;
            结果.push({行, 列: 目标列, 值: 合并值, 源: [非零[i], 非零[i + 1]]});
            i++;
            目标列++;
          } else {
            结果.push({行, 列: 目标列, 值: 非零[i].值, 源: [非零[i]]});
            目标列++;
          }
        }
      } else {
        for (let 列 = 3; 列 >= 0; 列--) {
          const 值 = 旧盘[行][列];
          if (值 !== 0) 非零.push({行, 列, 值});
        }
        let 目标列 = 3;
        for (let i = 0; i < 非零.length; i++) {
          if (i + 1 < 非零.length && 非零[i].值 === 非零[i + 1].值) {
            const 合并值 = 非零[i].值 * 2;
            结果.push({行, 列: 目标列, 值: 合并值, 源: [非零[i], 非零[i + 1]]});
            i++;
            目标列--;
          } else {
            结果.push({行, 列: 目标列, 值: 非零[i].值, 源: [非零[i]]});
            目标列--;
          }
        }
      }
    }
  }
  return 结果;
}

function 上移动(棋盘) {
  let 原始棋盘 = JSON.parse(JSON.stringify(棋盘));
  let 移动发生 = false;
  for (let 列 = 0; 列 < 4; 列++) {
    const 序列 = [棋盘[0][列], 棋盘[1][列], 棋盘[2][列], 棋盘[3][列]];
    const 新序列 = 处理序列(序列);
    for (let 行 = 0; 行 < 4; 行++) 棋盘[行][列] = 新序列[行];
  }
  for (let 行 = 0; 行 < 4; 行++) {
    for (let 列 = 0; 列 < 4; 列++) {
      if (棋盘[行][列] !== 原始棋盘[行][列]) { 移动发生 = true; break; }
    }
    if (移动发生) break;
  }
  return 移动发生;
}

function 下移动(棋盘) {
  let 原始棋盘 = JSON.parse(JSON.stringify(棋盘));
  let 移动发生 = false;
  for (let 列 = 0; 列 < 4; 列++) {
    const 序列 = [棋盘[0][列], 棋盘[1][列], 棋盘[2][列], 棋盘[3][列]].reverse();
    const 新序列 = 处理序列(序列).reverse();
    for (let 行 = 0; 行 < 4; 行++) 棋盘[行][列] = 新序列[行];
  }
  for (let 行 = 0; 行 < 4; 行++) {
    for (let 列 = 0; 列 < 4; 列++) {
      if (棋盘[行][列] !== 原始棋盘[行][列]) { 移动发生 = true; break; }
    }
    if (移动发生) break;
  }
  return 移动发生;
}

function 左移动(棋盘) {
  let 原始棋盘 = JSON.parse(JSON.stringify(棋盘));
  let 移动发生 = false;
  for (let 行 = 0; 行 < 4; 行++) {
    const 序列 = [棋盘[行][0], 棋盘[行][1], 棋盘[行][2], 棋盘[行][3]];
    const 新序列 = 处理序列(序列);
    for (let 列 = 0; 列 < 4; 列++) 棋盘[行][列] = 新序列[列];
  }
  for (let 行 = 0; 行 < 4; 行++) {
    for (let 列 = 0; 列 < 4; 列++) {
      if (棋盘[行][列] !== 原始棋盘[行][列]) { 移动发生 = true; break; }
    }
    if (移动发生) break;
  }
  return 移动发生;
}

function 右移动(棋盘) {
  let 原始棋盘 = JSON.parse(JSON.stringify(棋盘));
  let 移动发生 = false;
  for (let 行 = 0; 行 < 4; 行++) {
    const 序列 = [棋盘[行][0], 棋盘[行][1], 棋盘[行][2], 棋盘[行][3]].reverse();
    const 新序列 = 处理序列(序列).reverse();
    for (let 列 = 0; 列 < 4; 列++) 棋盘[行][列] = 新序列[列];
  }
  for (let 行 = 0; 行 < 4; 行++) {
    for (let 列 = 0; 列 < 4; 列++) {
      if (棋盘[行][列] !== 原始棋盘[行][列]) { 移动发生 = true; break; }
    }
    if (移动发生) break;
  }
  return 移动发生;
}

// 添加游戏状态变量
let 分数 = 0;
let 游戏结束 = false;
let 游戏胜利 = false;
 
let 最近移动方向 = null;
let 延迟生成计时器 = null;
let 动画进行中 = false;

// 渲染棋盘到页面
function 渲染棋盘(棋盘) {
  const main = document.querySelector('.main');
  const 棋盘容器 = document.querySelector('.game-board') || document.createElement('div');
  
  // 保存当前棋盘状态，用于下次渲染时比较位置变化
  const 当前棋盘状态 = JSON.parse(JSON.stringify(棋盘));
  
  if (!棋盘容器.classList.contains('game-board')) {
    // 创建棋盘容器和分数显示（首次渲染）
    棋盘容器.className = 'game-board';
    
    // 创建分数显示
    const 分数容器 = document.querySelector('.score-container') || document.createElement('div');
    if (!分数容器.classList.contains('score-container')) {
      分数容器.className = 'score-container';
      main.appendChild(分数容器);
    }
    分数容器.innerHTML = `<div class="score-label">分数</div><div class="score-value">${分数}</div>`;
    
    // 创建棋盘格子
    棋盘容器.innerHTML = '';
    for (let 行 = 0; 行 < 4; 行++) {
      for (let 列 = 0; 列 < 4; 列++) {
        const 格子 = document.createElement('div');
        格子.className = 'grid-cell';
        格子.dataset.row = 行;
        格子.dataset.col = 列;
        棋盘容器.appendChild(格子);
      }
    }
    
    main.appendChild(棋盘容器);
  }
  
  const 现有数字方块 = Array.from(棋盘容器.querySelectorAll('.number-cell'));

  if (!前一个棋盘 || 最近移动方向 === null) {
    棋盘容器.querySelectorAll('.number-cell').forEach(n => n.remove());
    for (let 行 = 0; 行 < 4; 行++) {
      for (let 列 = 0; 列 < 4; 列++) {
        const 值 = 棋盘[行][列];
        if (值 === 0) continue;
        const 数字方块 = document.createElement('div');
        数字方块.className = `number-cell value-${值}`;
        数字方块.textContent = 值;
        数字方块.style.top = `${行 * 25}%`;
        数字方块.style.left = `${列 * 25}%`;
        数字方块.dataset.row = String(行);
        数字方块.dataset.col = String(列);
        棋盘容器.appendChild(数字方块);
      }
    }
  } else {
    const 节点映射 = new Map();
    现有数字方块.forEach(n => {
      节点映射.set(`${n.dataset.row}-${n.dataset.col}`, n);
    });
    const 已使用 = new Set();

    const 移动列表 = 计算移动映射(前一个棋盘, 最近移动方向);
    移动列表.forEach(m => {
      const 主源 = m.源[0];
      let 节点A = 节点映射.get(`${主源.行}-${主源.列}`);
      if (!节点A) {
        节点A = document.createElement('div');
        节点A.className = `number-cell value-${主源.值}`;
        节点A.textContent = 主源.值;
        节点A.style.top = `${主源.行 * 25}%`;
        节点A.style.left = `${主源.列 * 25}%`;
        节点A.dataset.row = String(主源.行);
        节点A.dataset.col = String(主源.列);
        棋盘容器.appendChild(节点A);
      }
      已使用.add(节点A);
      节点A.classList.add('moving');
      节点A.style.top = `${m.行 * 25}%`;
      节点A.style.left = `${m.列 * 25}%`;
      节点A.textContent = m.值;
      节点A.className = `number-cell value-${m.值} moving`;
      节点A.dataset.row = String(m.行);
      节点A.dataset.col = String(m.列);
      setTimeout(() => {
        节点A.className = `number-cell value-${m.值}`;
      }, 300);

      if (m.源.length === 2) {
        const 次源 = m.源[1];
        const 节点B = 节点映射.get(`${次源.行}-${次源.列}`);
        if (节点B) {
          已使用.add(节点B);
          节点B.classList.add('moving');
          节点B.style.top = `${m.行 * 25}%`;
          节点B.style.left = `${m.列 * 25}%`;
          setTimeout(() => {
            if (节点B.parentElement) 节点B.remove();
          }, 300);
        }
      }
    });

    现有数字方块.forEach(n => {
      if (!已使用.has(n)) {
        if (n.parentElement) n.remove();
      }
    });
  }
  
  // 更新分数显示
  const 分数值元素 = document.querySelector('.score-value');
  if (分数值元素) {
    分数值元素.textContent = 分数;
  }
  
  // 保存当前棋盘状态
  前一个棋盘 = 当前棋盘状态;
  
  // 检查游戏状态
  if (已胜利(棋盘) && !游戏胜利) {
    游戏胜利 = true;
    显示游戏状态('恭喜，你赢了！', '胜利');
  } else if (已失败(棋盘) && !游戏结束) {
    游戏结束 = true;
    显示游戏状态('游戏结束', '失败');
  }
}

// 显示游戏状态
function 显示游戏状态(消息, 类型) {
  const 状态层 = document.createElement('div');
  状态层.className = `game-status ${类型}`;
  状态层.innerHTML = `
    <div class="status-message">${消息}</div>
    ${类型 === '失败' ? '<button class="restart-button">重新开始</button>' : '<button class="continue-button">继续游戏</button>'}
  `;
  const 容器 = document.querySelector('.game-board') || document.querySelector('.main');
  容器.appendChild(状态层);
  
  // 添加按钮事件
  if (类型 === '失败') {
    状态层.querySelector('.restart-button').addEventListener('click', () => {
      if (状态层 && 状态层.parentElement) 状态层.remove();
      重置游戏();
    });
  } else {
    状态层.querySelector('.continue-button').addEventListener('click', () => {
      状态层.remove();
    });
  }
}

// 重置游戏
function 重置游戏() {
  棋盘 = 新建棋盘();
  分数 = 0;
  游戏结束 = false;
  游戏胜利 = false;
  前一个棋盘 = null;
  最近移动方向 = null;
  document.querySelectorAll('.game-status').forEach(el => el.remove());
  渲染棋盘(棋盘);
}

// 处理键盘事件
function 处理键盘事件(event) {
  if (游戏结束 || 动画进行中) return;
  
  let 移动发生 = false;
  const k = (event.key || '').toLowerCase();
  switch (k) {
    case 'arrowup':
    case 'w':
      最近移动方向 = '上';
      移动发生 = 上移动(棋盘);
      break;
    case 'arrowdown':
    case 's':
      最近移动方向 = '下';
      移动发生 = 下移动(棋盘);
      break;
    case 'arrowleft':
    case 'a':
      最近移动方向 = '左';
      移动发生 = 左移动(棋盘);
      break;
    case 'arrowright':
    case 'd':
      最近移动方向 = '右';
      移动发生 = 右移动(棋盘);
      break;
    default:
      return;
  }
  
  if (移动发生) {
    动画进行中 = true;
    // 先渲染移动动画
    渲染棋盘(棋盘);
    
    // 移动动画完成后（350ms）延迟50ms再生成新数字并重新渲染
    if (延迟生成计时器) clearTimeout(延迟生成计时器);
    延迟生成计时器 = setTimeout(() => {
      每次移动后随机生成一个数字(棋盘);
      最近移动方向 = null;
      渲染棋盘(棋盘);
      动画进行中 = false;
    }, 400); // 350ms动画时间 + 50ms延迟
  }
  
  event.preventDefault();
}

// 移除了所有特殊效果，保持简洁的游戏体验

// 初始化游戏
function 初始化游戏() {
  // 找到重置按钮并添加事件
  const 重置按钮 = document.querySelector('.reset-game img[alt="重置游戏"]');
  if (重置按钮) {
    重置按钮.addEventListener('click', 重置游戏);
    重置按钮.style.cursor = 'pointer';
  }
  
  // 添加键盘事件监听
  document.addEventListener('keydown', 处理键盘事件);
  
  // 初始渲染棋盘
  渲染棋盘(棋盘);
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', 初始化游戏);
