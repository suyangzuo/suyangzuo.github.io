// 扫雷游戏主逻辑
class 扫雷游戏 {
  constructor() {
    this.游戏配置 = {
      简单: { 行数: 9, 列数: 9, 雷数: 10 },
      中等: { 行数: 16, 列数: 16, 雷数: 40 },
      困难: { 行数: 16, 列数: 30, 雷数: 99 },
    };

    this.当前难度 = "中等";
    this.游戏状态 = "ready"; // 准备开始, 游戏进行中, 游戏胜利, 游戏失败
    this.雷区 = [];
    this.已揭示格子 = [];
    this.已标记格子 = [];
    this.剩余雷数 = 0;
    this.游戏时间 = 0;
    this.点击次数 = 0;
    this.计时器 = null;
    this.首次点击 = true;

    this.初始化元素();
    this.绑定事件();
    this.重置游戏();
  }

  初始化元素() {
    this.雷区容器 = document.getElementById("雷区");
    this.难度选择器 = document.getElementById("难度");
    this.剩余雷数显示 = document.getElementById("剩余雷数");
    this.游戏时间显示 = document.getElementById("游戏时间");
    this.点击次数显示 = document.getElementById("点击次数");
    this.游戏状态显示 = document.getElementById("游戏状态");
    this.重置按钮 = document.querySelector(".重置游戏");
    this.音效复选框 = document.getElementById("音效");

    // 确保重置按钮存在
    if (!this.重置按钮) {
      console.error("重置按钮未找到");
    }
  }

  绑定事件() {
    this.难度选择器.addEventListener("change", () => {
      this.当前难度 = this.难度选择器.value;
      this.重置游戏();
    });

    if (this.重置按钮) {
      this.重置按钮.addEventListener("click", () => {
        console.log("重置按钮被点击");
        this.重置游戏();
      });
    } else {
      console.error("重置按钮未找到，无法绑定事件");
    }
  }

  重置游戏() {
    console.log("重置游戏开始");
    this.游戏状态 = "ready";
    this.首次点击 = true;
    this.游戏时间 = 0;
    this.点击次数 = 0;
    this.已揭示格子 = [];
    this.已标记格子 = [];

    const 配置 = this.游戏配置[this.当前难度];
    this.剩余雷数 = 配置.雷数;

    this.创建雷区(配置.行数, 配置.列数);
    this.更新显示();
    this.停止计时器();
    this.更新游戏状态显示();

    // 关闭胜利提示覆盖层
    const overlay = document.getElementById("胜利提示");
    if (overlay) {
      overlay.style.display = "none";
      overlay.style.opacity = "1";
    }

    console.log("重置游戏完成");
  }

  创建雷区(行数, 列数) {
    this.雷区容器.innerHTML = "";
    this.雷区容器.style.gridTemplateColumns = `repeat(${列数}, 1fr)`;
    this.雷区容器.style.gridTemplateRows = `repeat(${行数}, 1fr)`;

    this.雷区 = Array(行数)
      .fill()
      .map(() => Array(列数).fill(0));

    for (let 行 = 0; 行 < 行数; 行++) {
      for (let 列 = 0; 列 < 列数; 列++) {
        const 格子 = document.createElement("div");
        格子.className = "格子";
        格子.dataset.行 = 行;
        格子.dataset.列 = 列;

        格子.addEventListener("click", (e) => this.左键点击(行, 列, e));
        格子.addEventListener("contextmenu", (e) => this.右键点击(行, 列, e));

        this.雷区容器.appendChild(格子);
      }
    }
  }

  左键点击(行, 列, 事件) {
    if (this.游戏状态 === "won" || this.游戏状态 === "lost") return;

    事件.preventDefault();
    this.点击次数++;

    if (this.首次点击) {
      this.首次点击 = false;
      this.游戏状态 = "playing";
      this.更新游戏状态显示();
      this.放置地雷(行, 列);
      this.开始计时器();
    }

    if (this.已标记格子.includes(`${行}-${列}`)) return;

    this.揭示格子(行, 列);
    // 如果这一步已经导致失败，直接返回，避免错误触发胜利判断
    if (this.游戏状态 === "lost") {
      this.更新显示();
      return;
    }
    this.更新显示();
    this.检查游戏结束();
  }

  右键点击(行, 列, 事件) {
    事件.preventDefault();
    if (this.游戏状态 === "won" || this.游戏状态 === "lost") return;

    const 格子标识 = `${行}-${列}`;
    const 格子元素 = this.雷区容器.children[行 * this.游戏配置[this.当前难度].列数 + 列];

    if (this.已标记格子.includes(格子标识)) {
      // 取消标记
      this.已标记格子 = this.已标记格子.filter((id) => id !== 格子标识);
      格子元素.classList.remove("已标记");
      格子元素.textContent = "";
      this.剩余雷数++;
    } else if (!this.已揭示格子.includes(格子标识)) {
      // 添加标记
      this.已标记格子.push(格子标识);
      格子元素.classList.add("已标记");
      格子元素.textContent = "🚩";
      this.剩余雷数--;
    }

    this.更新显示();
    // 经典规则下，旗子不直接决定胜负，但如果所有非雷格子都已打开，则此处也能触发胜利
    if (this.游戏状态 === "playing") {
      this.检查游戏结束();
    }
  }

  放置地雷(首次点击行, 首次点击列) {
    const 配置 = this.游戏配置[this.当前难度];
    let 已放置雷数 = 0;

    while (已放置雷数 < 配置.雷数) {
      const 随机行 = Math.floor(Math.random() * 配置.行数);
      const 随机列 = Math.floor(Math.random() * 配置.列数);

      // 确保首次点击的位置和周围8个位置不放置地雷
      if (Math.abs(随机行 - 首次点击行) <= 1 && Math.abs(随机列 - 首次点击列) <= 1) {
        continue;
      }

      if (this.雷区[随机行][随机列] !== -1) {
        this.雷区[随机行][随机列] = -1; // -1 表示地雷
        已放置雷数++;
      }
    }

    this.计算数字();
  }

  计算数字() {
    const 配置 = this.游戏配置[this.当前难度];

    for (let 行 = 0; 行 < 配置.行数; 行++) {
      for (let 列 = 0; 列 < 配置.列数; 列++) {
        if (this.雷区[行][列] !== -1) {
          let 周围雷数 = 0;

          for (let 行偏移 = -1; 行偏移 <= 1; 行偏移++) {
            for (let 列偏移 = -1; 列偏移 <= 1; 列偏移++) {
              const 新行 = 行 + 行偏移;
              const 新列 = 列 + 列偏移;

              if (新行 >= 0 && 新行 < 配置.行数 && 新列 >= 0 && 新列 < 配置.列数 && this.雷区[新行][新列] === -1) {
                周围雷数++;
              }
            }
          }

          this.雷区[行][列] = 周围雷数;
        }
      }
    }
  }

  揭示格子(行, 列) {
    const 配置 = this.游戏配置[this.当前难度];
    const 格子标识 = `${行}-${列}`;

    if (行 < 0 || 行 >= 配置.行数 || 列 < 0 || 列 >= 配置.列数) return;
    if (this.已揭示格子.includes(格子标识)) return;
    if (this.已标记格子.includes(格子标识)) return; // 标记旗子的格子不可揭示（经典规则）

    this.已揭示格子.push(格子标识);
    const 格子元素 = this.雷区容器.children[行 * 配置.列数 + 列];
    格子元素.classList.add("已揭示");

    if (this.雷区[行][列] === -1) {
      // 踩到地雷
      格子元素.classList.add("地雷爆炸");
      格子元素.textContent = "💣";
      this.游戏失败();
      return; // 失败后立即停止后续逻辑
    } else if (this.雷区[行][列] === 0) {
      // 空白格子，递归揭示周围
      格子元素.textContent = "";
      for (let 行偏移 = -1; 行偏移 <= 1; 行偏移++) {
        for (let 列偏移 = -1; 列偏移 <= 1; 列偏移++) {
          this.揭示格子(行 + 行偏移, 列 + 列偏移);
        }
      }
    } else {
      // 数字格子
      格子元素.textContent = this.雷区[行][列];
      格子元素.classList.add(`数字${this.雷区[行][列]}`);
    }
  }

  游戏失败() {
    this.游戏状态 = "lost";
    this.停止计时器();
    this.显示所有地雷();
    this.更新游戏状态显示();
    播放爆炸音效();
  }

  游戏胜利() {
    this.游戏状态 = "won";
    this.停止计时器();
    this.更新游戏状态显示();
    播放胜利音效();

    // 显示明显的胜利提示覆盖层
    const overlay = document.getElementById("胜利提示");
    if (overlay) {
      overlay.style.display = "block";
      overlay.style.opacity = "1";
      overlay.style.transition = "opacity 600ms ease";
      setTimeout(() => {
        overlay.style.opacity = "0";
        setTimeout(() => {
          overlay.style.display = "none";
          overlay.style.opacity = "1";
        }, 700);
      }, 1800);
    }
  }

  显示所有地雷() {
    const 配置 = this.游戏配置[this.当前难度];

    for (let 行 = 0; 行 < 配置.行数; 行++) {
      for (let 列 = 0; 列 < 配置.列数; 列++) {
        if (this.雷区[行][列] === -1) {
          const 格子元素 = this.雷区容器.children[行 * 配置.列数 + 列];
          if (!this.已标记格子.includes(`${行}-${列}`)) {
            格子元素.classList.add("地雷");
            格子元素.textContent = "💣";
          }
        }
      }
    }
  }

  检查游戏结束() {
    const 配置 = this.游戏配置[this.当前难度];
    const 总需要揭示的非雷格子数 = 配置.行数 * 配置.列数 - 配置.雷数;

    // 统计已揭示的非雷格子数（旗子不参与胜负判断，踩雷不计入）
    let 已揭示非雷格子数 = 0;
    for (const 标识 of this.已揭示格子) {
      const [rStr, cStr] = 标识.split("-");
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (this.雷区[r] && this.雷区[r][c] !== -1) 已揭示非雷格子数++;
    }

    if (已揭示非雷格子数 === 总需要揭示的非雷格子数) {
      this.游戏胜利();
    }
  }

  开始计时器() {
    this.计时器 = setInterval(() => {
      this.游戏时间++;
      this.更新显示();
    }, 1000);
  }

  停止计时器() {
    if (this.计时器) {
      clearInterval(this.计时器);
      this.计时器 = null;
    }
  }

  更新显示() {
    this.剩余雷数显示.textContent = this.剩余雷数;
    this.游戏时间显示.textContent = this.游戏时间;
    this.点击次数显示.textContent = this.点击次数;
  }

  // 更新游戏状态显示
  更新游戏状态显示() {
    switch (this.游戏状态) {
      case "ready":
        this.游戏状态显示.textContent = "准备开始";
        this.游戏状态显示.style.color = "#ffffff";
        break;
      case "playing":
        this.游戏状态显示.textContent = "游戏进行中";
        this.游戏状态显示.style.color = "#FFD700";
        break;
      case "won":
        this.游戏状态显示.textContent = "游戏胜利";
        this.游戏状态显示.style.color = "#44FF44";
        break;
      case "lost":
        this.游戏状态显示.textContent = "游戏失败";
        this.游戏状态显示.style.color = "#FF4444";
        break;
      default:
        this.游戏状态显示.textContent = "未知状态";
        this.游戏状态显示.style.color = "#ffffff";
    }
  }
}

// 初始化一下
let 扫雷游戏实例 = null;

//如果输了
document.addEventListener("DOMContentLoaded", () => {
  扫雷游戏实例 = new 扫雷游戏();
});

// 地雷爆炸的声音
const 爆炸音效 = new Audio("./Audios/bomb.wav");

// 预加载音频文件
爆炸音效.preload = "auto";

// 在游戏失败时播放音效
function 播放爆炸音效() {
  爆炸音效.currentTime = 0; // 重置音频进度
  // 获取音效复选框元素
  const 音效复选框 = document.getElementById("音效");
  if (音效复选框 && 音效复选框.checked) {
    爆炸音效.play().catch((error) => {
      console.log("爆炸音效播放失败:", error);
    });
  }
}
