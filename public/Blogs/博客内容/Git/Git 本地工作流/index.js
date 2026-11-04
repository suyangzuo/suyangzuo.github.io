class 本地演示动画 {
  constructor(canvasId, 画布高度 = 200) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    // 字体栈
    this.字体 = '"Jetbrains Mono", "Google Sans Code", Consolas, "Noto Sans SC", 微软雅黑, sans-serif';

    // 统一配色
    this.配色 = {
      面板上: "#1C2131",
      面板下: "#12141B",
      节点填充: "rgba(255,255,255,0.05)",
      节点描边: "rgba(255,255,255,0.16)",
      节点图标: "#C6CEE3",
      节点文字: "#AFB8CC",
      箭头: "#F5C542",
    };

    // 没有选项按钮，画布不需要那么高
    this.canvas.style.height = `${画布高度}px`;

    // 动画状态
    this.阶段 = 0; // 0=绘制 1=停留
    this.阶段开始时间 = 0;
    this.绘制时长 = 1000; // 1秒
    this.停顿时长 = 2000; // 2秒
    this.运行中 = true;

    this.初始化尺寸();
    this.计算布局();
    this.绑定事件();
    this.开始动画();
  }

  // 处理 DPI 缩放
  初始化尺寸() {
    this.dpr = window.devicePixelRatio || 1;
    this.宽 = this.canvas.offsetWidth;
    this.高 = this.canvas.offsetHeight;
    this.canvas.width = Math.round(this.宽 * this.dpr);
    this.canvas.height = Math.round(this.高 * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  // 计算节点布局（本地工作流只有 工作区、暂存区、本地仓库 三个节点）
  计算布局() {
    const 宽 = this.宽;
    const 高 = this.高;
    const 节点宽 = Math.min(110, 宽 / 5);
    this.节点列表 = ["工作区", "暂存区", "本地仓库"].map((名称, i) => ({
      名称,
      中心X: (宽 * (i + 0.5)) / 3,
      中心Y: 高 * 0.55 - 10, // 整体上移 10px
      宽: 节点宽,
      高: 84,
    }));
    this.节点 = {};
    for (const 节点 of this.节点列表) this.节点[节点.名称] = 节点;
  }

  // 两个节点之间的直线曲线（共线，取三等分点作为控制点）
  构造直线曲线(起点名称, 终点名称) {
    const 起点 = { x: this.节点[起点名称].中心X, y: this.节点[起点名称].中心Y };
    const 终点 = { x: this.节点[终点名称].中心X, y: this.节点[终点名称].中心Y };
    return {
      P0: 起点,
      P1: { x: 起点.x + (终点.x - 起点.x) / 3, y: 起点.y + (终点.y - 起点.y) / 3 },
      P2: { x: 起点.x + ((终点.x - 起点.x) * 2) / 3, y: 起点.y + ((终点.y - 起点.y) * 2) / 3 },
      P3: 终点,
    };
  }

  贝塞尔点(P0, P1, P2, P3, t) {
    const u = 1 - t;
    return {
      x: u * u * u * P0.x + 3 * u * u * t * P1.x + 3 * u * t * t * P2.x + t * t * t * P3.x,
      y: u * u * u * P0.y + 3 * u * u * t * P1.y + 3 * u * t * t * P2.y + t * t * t * P3.y,
    };
  }

  // 绘制三次贝塞尔曲线（按进度生长），末端带箭头
  绘制曲线(曲线, 进度, 颜色) {
    const p = Math.max(0, Math.min(1, 进度));
    if (p <= 0) return;
    const { P0, P1, P2, P3 } = 曲线;
    const 箭头长 = 16;
    const 箭头夹角 = Math.PI / 7;
    const 线宽 = 2;

    // 按进度生长：t 在 [0, p] 上均匀取样，保证线尾与箭头始终一致
    const 分段数 = 160;
    const 实际段数 = Math.max(1, Math.ceil(分段数 * p));
    const 点集 = [];
    for (let i = 0; i <= 实际段数; i++) {
      点集.push(this.贝塞尔点(P0, P1, P2, P3, (i / 实际段数) * p));
    }

    // 计算各小段长度，用于把线尾回缩到箭头内部
    const 段长列表 = [];
    let 总长 = 0;
    for (let i = 1; i < 点集.length; i++) {
      const 段长 = Math.hypot(点集[i].x - 点集[i - 1].x, 点集[i].y - 点集[i - 1].y);
      段长列表.push(段长);
      总长 += 段长;
    }

    // 线尾回缩量：让线头完全藏在箭头三角形内，避免线头从箭头尖露出
    const 线尾回缩 = 箭头长 * 0.8;
    const 目标长度 = 总长 - 线尾回缩;

    if (目标长度 > 0) {
      this.ctx.save();
      this.ctx.strokeStyle = 颜色;
      this.ctx.lineWidth = 线宽;
      this.ctx.lineCap = "butt";
      this.ctx.lineJoin = "round";
      this.ctx.beginPath();
      this.ctx.moveTo(点集[0].x, 点集[0].y);
      let 已绘长 = 0;
      for (let i = 1; i < 点集.length; i++) {
        if (已绘长 + 段长列表[i - 1] <= 目标长度) {
          this.ctx.lineTo(点集[i].x, 点集[i].y);
          已绘长 += 段长列表[i - 1];
        } else {
          // 在最后一段内插值，精确停在目标长度处
          const 比例 = (目标长度 - 已绘长) / 段长列表[i - 1];
          this.ctx.lineTo(
            点集[i - 1].x + (点集[i].x - 点集[i - 1].x) * 比例,
            点集[i - 1].y + (点集[i].y - 点集[i - 1].y) * 比例,
          );
          break;
        }
      }
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 箭头：位置取曲线末端，方向取解析导数（与进度无关，始终指向前进方向）
    const 末端 = this.贝塞尔点(P0, P1, P2, P3, p);
    const u = 1 - p;
    const 切线 = {
      x: 3 * u * u * (P1.x - P0.x) + 6 * u * p * (P2.x - P1.x) + 3 * p * p * (P3.x - P2.x),
      y: 3 * u * u * (P1.y - P0.y) + 6 * u * p * (P2.y - P1.y) + 3 * p * p * (P3.y - P2.y),
    };
    const 角度 = Math.atan2(切线.y, 切线.x);
    this.ctx.fillStyle = 颜色;
    this.ctx.beginPath();
    this.ctx.moveTo(末端.x, 末端.y);
    this.ctx.lineTo(末端.x - 箭头长 * Math.cos(角度 - 箭头夹角), 末端.y - 箭头长 * Math.sin(角度 - 箭头夹角));
    this.ctx.lineTo(末端.x - 箭头长 * Math.cos(角度 + 箭头夹角), 末端.y - 箭头长 * Math.sin(角度 + 箭头夹角));
    this.ctx.closePath();
    this.ctx.fill();
  }

  // 绘制阶段标签（水平位置固定，不随曲线顶头移动；动画进行至 75% 时从全透明渐变为全不透明）
  绘制阶段标签(文本, 中心X, 颜色, 进度) {
    const 中心Y = this.节点["工作区"].中心Y - 55;
    this.ctx.font = `600 17px ${this.字体}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "bottom";
    const 文本宽 = this.ctx.measureText(文本).width;
    const x = Math.max(文本宽 / 2 + 8, Math.min(this.宽 - 文本宽 / 2 - 8, 中心X));
    this.ctx.save();
    this.ctx.globalAlpha = Math.max(0, Math.min(1, Math.min(进度, 1) / 0.75));
    this.ctx.fillStyle = 颜色;
    this.ctx.fillText(文本, x, 中心Y);
    this.ctx.restore();
  }

  绘制背景() {
    const 渐变 = this.ctx.createLinearGradient(0, 0, 0, this.高);
    渐变.addColorStop(0, this.配色.面板上);
    渐变.addColorStop(1, this.配色.面板下);
    this.ctx.fillStyle = 渐变;
    this.ctx.fillRect(0, 0, this.宽, this.高);
  }

  // 节点图标（线性图标风格）
  绘制图标(名称, 中心X, 中心Y, 尺寸, 颜色) {
    const ctx = this.ctx;
    ctx.save();
    // 图标整体不透明度 25%
    ctx.globalAlpha = 0.075;
    ctx.strokeStyle = 颜色;
    ctx.fillStyle = 颜色;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    switch (名称) {
      case "工作区": {
        // 文档
        const 宽 = 尺寸 * 0.62;
        const 高 = 尺寸 * 0.8;
        ctx.beginPath();
        ctx.roundRect(中心X - 宽 / 2, 中心Y - 高 / 2, 宽, 高, 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(中心X - 宽 / 2 + 6, 中心Y - 高 * 0.1);
        ctx.lineTo(中心X + 宽 / 2 - 6, 中心Y - 高 * 0.1);
        ctx.moveTo(中心X - 宽 / 2 + 6, 中心Y + 高 * 0.18);
        ctx.lineTo(中心X + 宽 / 2 - 6, 中心Y + 高 * 0.18);
        ctx.stroke();
        break;
      }
      case "暂存区": {
        // 层叠
        const 宽 = 尺寸 * 0.72;
        const 高 = 尺寸 * 0.16;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.roundRect(中心X - 宽 / 2, 中心Y + i * (高 + 4) - 高 / 2, 宽, 高, 高 / 2);
          ctx.stroke();
        }
        break;
      }
      case "本地仓库": {
        // 数据库圆柱
        const 宽 = 尺寸 * 0.66;
        const 半径 = 宽 / 2;
        const 椭圆高 = 尺寸 * 0.12;
        const 高 = 尺寸 * 0.44;
        ctx.beginPath();
        ctx.ellipse(中心X, 中心Y - 高 / 2, 半径, 椭圆高, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(中心X - 半径, 中心Y - 高 / 2);
        ctx.lineTo(中心X - 半径, 中心Y + 高 / 2);
        ctx.moveTo(中心X + 半径, 中心Y - 高 / 2);
        ctx.lineTo(中心X + 半径, 中心Y + 高 / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(中心X, 中心Y + 高 / 2, 半径, 椭圆高, 0, 0, Math.PI);
        ctx.stroke();
        break;
      }
    }
    ctx.restore();
  }

  绘制节点() {
    for (const 节点 of this.节点列表) {
      const x = 节点.中心X - 节点.宽 / 2;
      const y = 节点.中心Y - 节点.高 / 2;
      const 圆角 = 14;

      // 幽灵样式
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, 节点.宽, 节点.高, 圆角);
      this.ctx.fillStyle = this.配色.节点填充;
      this.ctx.fill();
      this.ctx.strokeStyle = this.配色.节点描边;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      // 图标
      this.绘制图标(
        节点.名称,
        节点.中心X,
        节点.中心Y,
        Math.min(节点.宽, 节点.高) * 0.44,
        this.配色.节点图标,
      );

      // 节点文本绘制在节点下方，水平居中
      this.ctx.font = `500 14px ${this.字体}`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = this.配色.节点文字;
      this.ctx.fillText(节点.名称, 节点.中心X, 节点.中心Y + 节点.高 / 2 + 20);
    }
  }

  // 动画循环
  动画循环(当前时间) {
    if (!this.运行中) return;
    if (this.阶段开始时间 === 0) this.阶段开始时间 = 当前时间;
    const 已过时间 = 当前时间 - this.阶段开始时间;

    // 0=绘制 1=停留
    if (this.阶段 === 0 && 已过时间 >= this.绘制时长) {
      this.阶段 = 1;
      this.阶段开始时间 = 当前时间;
    } else if (this.阶段 === 1 && 已过时间 >= this.停顿时长) {
      this.阶段 = 0;
      this.阶段开始时间 = 当前时间;
    }

    // 阶段可能刚发生切换，重算进度时间，避免新阶段首帧使用旧阶段的累计时长
    const 阶段已过时间 = 当前时间 - this.阶段开始时间;

    this.绘制背景();
    this.绘制节点();

    const 曲线 = this.获取曲线();
    const 进度 = this.阶段 === 0 ? 阶段已过时间 / this.绘制时长 : 1;
    this.绘制曲线(曲线, 进度, this.配色.箭头);

    const 起点X = this.节点[this.获取起点名称()].中心X;
    const 终点X = this.节点[this.获取终点名称()].中心X;
    this.绘制阶段标签(this.获取阶段文本(), (起点X + 终点X) / 2, this.配色.箭头, 进度);

    requestAnimationFrame(this.动画循环.bind(this));
  }

  获取曲线() {
    return this.构造直线曲线(this.获取起点名称(), this.获取终点名称());
  }

  获取起点名称() {
    return "工作区";
  }

  获取终点名称() {
    return "暂存区";
  }

  获取阶段文本() {
    return "git add";
  }

  绑定事件() {
    // 窗口尺寸变化时重新计算 DPI 与布局
    window.addEventListener("resize", () => {
      this.初始化尺寸();
      this.计算布局();
    });
  }

  开始动画() {
    this.运行中 = true;
    requestAnimationFrame(this.动画循环.bind(this));
  }

  停止动画() {
    this.运行中 = false;
  }
}

// ========== 暂存动画（工作区 → 暂存区） ==========
class 暂存演示动画 extends 本地演示动画 {
  constructor(canvasId) {
    super(canvasId);
  }

  获取起点名称() {
    return "工作区";
  }

  获取终点名称() {
    return "暂存区";
  }

  获取阶段文本() {
    return "git add";
  }
}

// ========== 提交动画（暂存区 → 本地仓库） ==========
class 提交演示动画 extends 本地演示动画 {
  constructor(canvasId) {
    super(canvasId);
  }

  获取起点名称() {
    return "暂存区";
  }

  获取终点名称() {
    return "本地仓库";
  }

  获取阶段文本() {
    return "git commit";
  }
}

// 避免重复初始化（动态加载脚本可能多次执行）
if (window.暂存演示实例) {
  window.暂存演示实例.停止动画();
}
window.暂存演示实例 = new 暂存演示动画("暂存演示");

if (window.提交演示实例) {
  window.提交演示实例.停止动画();
}
window.提交演示实例 = new 提交演示动画("提交演示");

// 交叉观察器：画布离开视口时暂停动画
const 暂存演示观察器 = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        window.暂存演示实例.开始动画();
      } else {
        window.暂存演示实例.停止动画();
      }
    });
  },
  { root: null, rootMargin: "0px", threshold: 0.01 },
);

const 提交演示观察器 = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        window.提交演示实例.开始动画();
      } else {
        window.提交演示实例.停止动画();
      }
    });
  },
  { root: null, rootMargin: "0px", threshold: 0.01 },
);

const 暂存演示画布 = document.getElementById("暂存演示");
if (暂存演示画布) {
  暂存演示观察器.observe(暂存演示画布);
}

const 提交演示画布 = document.getElementById("提交演示");
if (提交演示画布) {
  提交演示观察器.observe(提交演示画布);
}
