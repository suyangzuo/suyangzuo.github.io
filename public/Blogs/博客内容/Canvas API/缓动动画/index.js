class 缓动动画 {
  constructor() {
    this.canvas = document.getElementById("canvas-缓动动画");
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.布局 = { 左: 50, 右: 45, 顶: 28, 底: 150 };
    this.初始化尺寸();

    this.控制点最大归一 = 1; // 0-1 归一化的时间轴

    this.光标样式 = {
      默认: 'url("/Images/Common/鼠标-默认.cur"), auto',
      悬停: 'url("/Images/Common/鼠标-指向.cur"), pointer',
      拖拽: 'url("/Images/Common/鼠标-拖拽.cur"), grab',
    };

    const 默认样式 = {
      背景: "#0b1220",
      网格: "rgba(255,255,255,0.06)",
      轴线: "#40444a",
      区域框: "#1f2937",
      曲线: "#6ac69d",
      辅助线: "#5e7eb1",
      文字: "#e5e7eb",
      控制点: {
        填充: "#0f172a",
        描边: "#c2c2c2",
        线宽: 1.6,
        悬停填充: "#f59e0b",
        悬停描边: "#fbbf24",
        悬停线宽: 2.6,
      },
      锚点: {
        填充: "#111827",
        描边: "#7dd3fc",
        线宽: 2,
        悬停填充: "#0ea5e9",
        悬停描边: "#67e8f9",
        悬停线宽: 2.8,
      },
    };

    this.样式 = 默认样式;

    this.地面 = {
      x: 0,
      y: this.cssHeight,
      width: this.cssWidth,
      height: 2,
    };
    this.汽车 = {
      时长: 5000,
      x: 10,
      y: this.cssHeight - 80 / this.dpr,
      width: 120 / this.dpr,
      height: 80 / this.dpr,
      src: "/Images/Blogs/Canvas API/缓动动画/汽车.png",
      img: new Image(),
      已加载: false,
      朝向: 1,
    };

    // 透明幽灵车：同路线，匀速往返，放在原车上方
    this.幽灵 = {
      已用时: 0,
      总时长: this.汽车.时长,
      朝向: 1,
      透明度: 0.35,
      y偏移: this.汽车.height + 12,
    };

    this.轴最大时间 = this.汽车.时长;

    // 单条三次贝塞尔曲线：x 为距离(0-1)，y 为时间归一(0-1)
    this.曲线 = {
      p0: { x: 0, y: 0 },
      p1: { x: 0.22, y: 0.08 },
      p2: { x: 0.78, y: 0.92 },
      p3: { x: 1, y: 1 },
    };

    this.读取控制点();

    this.状态 = {
      悬停: null,
      拖拽: null,
      初始半径: null,
      拖拽偏移: null,
      拖拽已移动: false,
      暂停前动画时间: null,
      暂停前幽灵时间: null,
    };

    this.动画 = { 方向: 1, 已用时: 0, 上次时间: null, 总时长: 0 };
    this.路径 = { 起点: 10, 终点: this.cssWidth - 10 - this.汽车.width, 长度: 0 };

    this.绑定事件();
    this.加载汽车图片();
    this.更新行程();
    this.重建时间表();
    this.开始动画();
    this.绘制();
  }

  绘制地面() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.fillStyle = "#444";
    this.ctx.fillRect(this.地面.x, this.地面.y, this.地面.width, this.地面.height);
    this.ctx.restore();
  }

  初始化尺寸() {
    this.cssWidth = this.canvas.clientWidth;
    this.cssHeight = this.canvas.clientHeight;
    this.canvas.width = this.cssWidth * this.dpr;
    this.canvas.height = this.cssHeight * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const { 左, 右, 顶, 底 } = this.布局;
    const w = Math.max(200, this.cssWidth - 左 - 右);
    const h = Math.max(200, this.cssHeight - 顶 - 底);
    this.区域 = { 左, 顶, 右: 左 + w, 底: 顶 + h, 宽: w, 高: h };

    this.地面 = {
      x: 0,
      y: this.cssHeight - 25,
      width: this.cssWidth,
      height: 2,
    };
    if (this.汽车) {
      this.更新行程();
    } else {
      const 起点 = 10;
      const 终点 = Math.max(起点 + 20, this.cssWidth - 10 - 120 / this.dpr);
      this.路径 = { 起点, 终点, 长度: 终点 - 起点 };
    }
  }

  加载汽车图片() {
    this.汽车.img.onload = () => {
      this.汽车.已加载 = true;
      this.绘制();
    };
    this.汽车.img.src = this.汽车.src;
  }

  绑定事件() {
    const debouncedResize = this.防抖(() => {
      this.初始化尺寸();
      this.重建时间表(this.当前进度());
      this.绘制();
    }, 80);
    window.addEventListener("resize", debouncedResize);

    const 坐标 = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top, ctrl: e.ctrlKey };
    };

    this.canvas.addEventListener("mousemove", (e) => {
      const p = 坐标(e);
      this.状态.悬停 = this.命中控制点(p.x, p.y) || this.状态.拖拽;
      if (this.状态.悬停) {
        this.canvas.style.cursor = this.光标样式.拖拽;
      } else {
        this.canvas.style.cursor = this.光标样式.默认;
      }
      if (this.状态.拖拽) {
        if (!this.状态.拖拽已移动) {
          this.动画.已用时 = 0;
          this.动画.方向 = 1;
          this.幽灵.已用时 = 0;
          this.幽灵.x = this.路径.起点;
          this.幽灵.y = Math.max(0, this.汽车.y - this.幽灵.y偏移);
          this.汽车.x = this.路径.起点;
          this.汽车.朝向 = 1;
          this.幽灵.朝向 = 1;
          this.状态.拖拽已移动 = true;
          // 同步重置幽灵圆环归一进度
          this.幽灵.归一 = 0;
        }
        const offset = this.状态.拖拽偏移 || { dx: 0, dy: 0 };
        const px = p.x + offset.dx;
        const py = p.y + offset.dy;
        this.更新控制点(px, py, this.状态.拖拽);
      }
      this.绘制();
    });

    this.canvas.addEventListener("mousedown", (e) => {
      const p = 坐标(e);
      const hit = this.命中控制点(p.x, p.y);
      if (hit) {
        this.状态.拖拽 = hit;
        // 记录鼠标与控制点圆心的偏移
        const c = this.坐标转屏幕(this.曲线[hit.key]);
        this.状态.拖拽偏移 = { dx: c.x - p.x, dy: c.y - p.y };
        this.状态.拖拽已移动 = false;
        // 暂停动画推进
        this.状态.暂停前动画时间 = this.动画.上次时间;
        this.状态.暂停前幽灵时间 = this.幽灵.上次时间;
        this.动画.暂停 = true;
        this.幽灵.暂停 = true;
        this.绘制();
      }
    });

    const 结束 = () => {
      // 松开鼠标时恢复动画推进
      if (this.状态.拖拽) {
        this.动画.暂停 = false;
        this.幽灵.暂停 = false;
        // 重新校准动画基准时间，防止时间跳变
        this.动画.上次时间 = performance.now();
        this.幽灵.上次时间 = performance.now();
      }
      this.状态.拖拽 = null;
      this.状态.拖拽偏移 = null;
      this.状态.拖拽已移动 = false;
      this.状态.暂停前动画时间 = null;
      this.状态.暂停前幽灵时间 = null;
      this.状态.初始半径 = null;
    };
    this.canvas.addEventListener("mouseup", 结束);
    this.canvas.addEventListener("mouseleave", 结束);
  }

  命中控制点(x, y) {
    const r = 10;
    for (const key of ["p1", "p2"]) {
      const p = this.坐标转屏幕(this.曲线[key]);
      if (this.点在圆内(x, y, p.x, p.y, r)) return { key };
    }
    return null;
  }

  更新控制点(x, y, target) {
    const { key } = target;
    if (key !== "p1" && key !== "p2") return;
    const n = this.屏幕转坐标(x, y);
    n.y = this.夹取(n.y, 0, this.控制点最大归一);
    n.x = this.夹取(n.x, 0, 1);

    this.曲线[key] = n;
    // 始终保持起点/终点固定在 (0,0) 与 (1,1)
    this.曲线.p0 = { x: 0, y: 0 };
    this.曲线.p3 = { x: 1, y: 1 };
    this.保存控制点();
    // 拖动后重置进度与方向
    this.动画.方向 = 1;
    this.动画.已用时 = 0;
    this.幽灵.已用时 = 0;
    this.汽车.朝向 = 1;
    this.幽灵.朝向 = 1;
    this.重建时间表(0);
  }

  更新行程() {
    const 起点 = 10;
    const 终点 = Math.max(起点 + 20, this.cssWidth - 10 - this.汽车.width);
    this.路径 = { 起点, 终点, 长度: 终点 - 起点 };
    this.汽车.y = this.cssHeight - this.汽车.height;
    this.幽灵.y = Math.max(0, this.汽车.y - this.幽灵.y偏移);
    this.幽灵.x = 起点;
    this.幽灵.朝向 = 1;
    if (!Number.isFinite(this.汽车.x)) this.汽车.x = 起点;
  }

  方向(origin, target) {
    const vx = target.x - origin.x;
    const vy = target.y - origin.y;
    const len = Math.hypot(vx, vy) || 1;
    return { x: vx / len, y: vy / len };
  }

  距离(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  点积(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  限制到域(p, maxY, isHandle = false) {
    return {
      x: this.夹取(p.x, 0, 1),
      y: this.夹取(p.y, 0, isHandle ? maxY : maxY),
    };
  }

  投影到直线(p, a, b, maxY) {
    const ab = { x: b.x - a.x, y: b.y - a.y };
    const ap = { x: p.x - a.x, y: p.y - a.y };
    const abLen2 = ab.x * ab.x + ab.y * ab.y || 1;
    let t = (ap.x * ab.x + ap.y * ab.y) / abLen2;
    t = this.夹取(t, 0, 1);
    return {
      x: this.夹取(a.x + ab.x * t, 0, 1),
      y: this.夹取(a.y + ab.y * t, 0, maxY),
    };
  }

  点在圆内(px, py, cx, cy, r) {
    const dx = px - cx;
    const dy = py - cy;
    return dx * dx + dy * dy <= r * r;
  }

  坐标转屏幕(p) {
    const { 左, 顶, 宽, 高 } = this.区域;
    return { x: 左 + p.x * 宽, y: 顶 + (1 - p.y) * 高 };
  }

  屏幕转坐标(x, y) {
    const { 左, 顶, 宽, 高 } = this.区域;
    return { x: (x - 左) / 宽, y: 1 - (y - 顶) / 高 };
  }

  夹取(v, min = 0, max = 1) {
    return Math.min(max, Math.max(min, v));
  }

  采样时间曲线(总样本 = 400) {
    const 点集 = [];
    const { p0, p1, p2, p3 } = this.曲线;
    for (let j = 0; j <= 总样本; j++) {
      const t = j / 总样本;
      const mt = 1 - t;
      const mt2 = mt * mt;
      const t2 = t * t;
      const x = p0.x * mt2 * mt + 3 * p1.x * mt2 * t + 3 * p2.x * mt * t2 + p3.x * t2 * t;
      const y = p0.y * mt2 * mt + 3 * p1.y * mt2 * t + 3 * p2.y * mt * t2 + p3.y * t2 * t;
      点集.push({ x, y });
    }

    点集.sort((a, b) => a.x - b.x);
    const 合并 = [];
    for (let i = 0; i < 点集.length; i++) {
      const last = 合并[合并.length - 1];
      if (!last || Math.abs(last.x - 点集[i].x) > 1e-4) {
        合并.push(点集[i]);
      }
    }
    return 合并;
  }

  评估贝塞尔(t) {
    const { p0, p1, p2, p3 } = this.曲线;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    return {
      x: p0.x * mt2 * mt + 3 * p1.x * mt2 * t + 3 * p2.x * mt * t2 + p3.x * t2 * t,
      y: p0.y * mt2 * mt + 3 * p1.y * mt2 * t + 3 * p2.y * mt * t2 + p3.y * t2 * t,
    };
  }

  根据x求t(x目标, 迭代 = 24) {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 迭代; i++) {
      const mid = (lo + hi) / 2;
      const x = this.评估贝塞尔(mid).x;
      if (x < x目标) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return (lo + hi) / 2;
  }

  重建时间表(锁定进度 = null) {
    if (!this.canvas) return;
    const 目标进度 = 锁定进度 == null ? this.当前进度() : this.夹取(锁定进度, 0, 1);
    const 样本 = this.采样时间曲线();
    const 表 = [];
    let 最近时间 = 0;

    for (let i = 0; i < 样本.length; i++) {
      const s = this.夹取(样本[i].x, 0, 1);
      const tNorm = this.夹取(样本[i].y, 0, this.控制点最大归一);
      const time = tNorm * this.汽车.时长;
      最近时间 = Math.max(最近时间, time);
      表.push({ s, time: 最近时间 });
    }

    if (表.length === 0 || 表[0].s > 0) {
      表.unshift({ s: 0, time: 0 });
    } else {
      表[0].time = 0;
    }

    const 最后 = 表[表.length - 1];
    if (!最后 || 最后.s < 1) {
      表.push({ s: 1, time: this.汽车.时长 });
    } else {
      最后.s = 1;
      最后.time = this.汽车.时长;
    }

    this.动画表 = 表;
    this.动画.总时长 = this.汽车.时长;
    this.动画.已用时 = this.动画.总时长 * 目标进度;
    this.动画.上次时间 = performance.now();
    this.更新汽车位置();
  }

  时间转进度(t) {
    if (!this.动画表 || this.动画表.length === 0) return 0;
    const 表 = this.动画表;
    if (t <= 0) return 表[0].s;
    if (t >= 表[表.length - 1].time) return 表[表.length - 1].s;
    let low = 0;
    let high = 表.length - 1;
    while (high - low > 1) {
      const mid = (low + high) >> 1;
      if (表[mid].time >= t) {
        high = mid;
      } else {
        low = mid;
      }
    }
    const a = 表[low];
    const b = 表[high];
    const ratio = (t - a.time) / Math.max(1e-6, b.time - a.time);
    return a.s + (b.s - a.s) * ratio;
  }

  当前进度() {
    if (!this.动画表 || !this.动画 || this.动画.总时长 === 0) return 0;
    return this.时间转进度(this.动画.已用时);
  }

  更新汽车位置() {
    const s = this.当前进度();
    const x = this.路径.起点 + s * this.路径.长度;
    this.汽车.x = x;
  }

  开始动画() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    const 循环 = (ts) => {
      this.更新动画(ts);
      this._rafId = requestAnimationFrame(循环);
    };
    this._rafId = requestAnimationFrame(循环);
  }

  更新动画(timestamp) {
    if (this.动画.暂停) return;
    if (!this.动画表 || this.动画表.length < 2 || this.状态.拖拽) return;
    if (this.动画.上次时间 == null) this.动画.上次时间 = timestamp;
    const delta = Math.max(0, timestamp - this.动画.上次时间);
    this.动画.上次时间 = timestamp;

    let time = this.动画.已用时 + delta * this.动画.方向;
    const 总 = this.动画.总时长 || 0.001;
    if (time >= 总) {
      const 循环次数 = Math.floor(time / 总);
      time = time % 总;
      if (循环次数 % 2 === 1) {
        this.动画.方向 *= -1;
        time = 总 - time;
      }
    } else if (time < 0) {
      const 循环次数 = Math.floor(-time / 总) + 1;
      time = 总 - (-time % 总);
      if (循环次数 % 2 === 1) {
        this.动画.方向 *= -1;
        time = 总 - time;
      }
    }
    this.动画.已用时 = time;

    // 直接用当前时间查表得到s
    const s = this.时间转进度(time);
    this.汽车.朝向 = this.动画.方向;
    this.汽车.x = this.路径.起点 + s * this.路径.长度;

    // 幽灵车：匀速往返，线性 0→1→0
    const ghost总 = this.幽灵.总时长;
    this.幽灵.已用时 = (this.幽灵.已用时 + delta) % (ghost总 * 2);
    const ghostPhase = this.幽灵.已用时 / ghost总; // [0, 2)
    const ghostS = ghostPhase <= 1 ? ghostPhase : 2 - ghostPhase;
    this.幽灵.朝向 = ghostPhase <= 1 ? 1 : -1;
    this.幽灵.x = this.路径.起点 + ghostS * this.路径.长度;
    this.幽灵.归一 = ghostS;
    this.绘制();
  }

  绘制() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.绘制背景与区域();
    this.绘制网格坐标轴();
    this.绘制曲线();
    this.绘制进度标记();
    this.绘制控制点();
    this.绘制幽灵汽车();
    this.绘制汽车();
  }

  绘制背景与区域() {
    const ctx = this.ctx;
    const area = this.区域;
    ctx.save();
    ctx.fillStyle = this.样式.背景;
    ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);

    ctx.strokeStyle = this.样式.区域框;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(area.左, area.顶, area.宽, area.高);
    ctx.restore();
  }

  绘制网格坐标轴() {
    const ctx = this.ctx;
    const area = this.区域;
    ctx.save();
    ctx.strokeStyle = this.样式.网格;
    ctx.lineWidth = 1;
    const 刻度数字颜色 = "#59d";

    const xLines = 5;
    for (let i = 1; i < xLines; i++) {
      const x = area.左 + (area.宽 / xLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, area.顶);
      ctx.lineTo(x, area.底);
      ctx.stroke();
    }

    const yLines = 5;
    const yStep = this.轴最大时间 / yLines;
    for (let i = 1; i < yLines; i++) {
      const v = yStep * i;
      const ny = v / this.轴最大时间;
      const y = area.顶 + (1 - ny) * area.高;
      ctx.beginPath();
      ctx.moveTo(area.左, y);
      ctx.lineTo(area.右, y);
      ctx.stroke();

      ctx.fillStyle = 刻度数字颜色;
      ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(String(Math.round(v)), area.左 - 6, y);
    }

    // 顶部刻度标签（总时长）
    ctx.fillStyle = 刻度数字颜色;
    ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(String(this.轴最大时间), area.左 - 6, area.顶);

    ctx.strokeStyle = this.样式.轴线;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(area.左, area.底);
    ctx.lineTo(area.右, area.底);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(area.左, area.顶);
    ctx.lineTo(area.左, area.底);
    ctx.stroke();

    ctx.fillStyle = this.样式.文字;
    ctx.font = "13px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("时间", area.左 + 6, area.顶);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("距离", area.右 + 8, area.底);

    // 原点和 x=1 标签
    ctx.fillStyle = 刻度数字颜色;
    ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("0", area.左 - 4, area.底 + 15);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("1", area.右, area.底 + 15);
    // 新增X轴0.2、0.4、0.6、0.8刻度
    for (let i = 1; i < 5; i++) {
      const frac = i * 0.2;
      const x = area.左 + frac * area.宽;
      ctx.strokeStyle = this.样式.轴线;
      ctx.beginPath();
      ctx.moveTo(x, area.底);
      ctx.lineTo(x, area.底 + 6);
      ctx.stroke();
      ctx.fillStyle = 刻度数字颜色;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(frac.toFixed(1), x, area.底 + 15);
    }

    ctx.restore();
  }

  绘制曲线() {
    const ctx = this.ctx;
    ctx.save();
    const { p0, p1, p2, p3 } = this.曲线;
    const sp0 = this.坐标转屏幕(p0);
    const sp1 = this.坐标转屏幕(p1);
    const sp2 = this.坐标转屏幕(p2);
    const sp3 = this.坐标转屏幕(p3);

    ctx.strokeStyle = "#68a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sp0.x, sp0.y);
    ctx.lineTo(sp1.x, sp1.y);
    ctx.moveTo(sp2.x, sp2.y);
    ctx.lineTo(sp3.x, sp3.y);
    ctx.stroke();

    ctx.strokeStyle = this.样式.曲线;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(sp0.x, sp0.y);
    ctx.bezierCurveTo(sp1.x, sp1.y, sp2.x, sp2.y, sp3.x, sp3.y);
    ctx.stroke();
    ctx.restore();
  }

  绘制进度标记() {
    if (!this.动画表 || this.动画表.length === 0) return;
    const ctx = this.ctx;
    const area = this.区域;
    const s = this.当前进度();
    const t = this.根据x求t(s);
    const p曲线 = this.评估贝塞尔(t);
    const sp曲线 = this.坐标转屏幕(p曲线);

    // 匀速点：y=x 的线性运动，使用幽灵归一进度
    const linS = this.幽灵?.归一 ?? s;
    const p线性 = { x: linS, y: linS };
    const sp线性 = this.坐标转屏幕(p线性);

    ctx.save();
    // 先画匀速圆
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = "darkgoldenrod";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sp线性.x, sp线性.y, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 再画曲线对应的虚线和圆
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = this.样式.辅助线;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sp曲线.x, sp曲线.y);
    ctx.lineTo(sp曲线.x, area.底);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sp曲线.x, sp曲线.y);
    ctx.lineTo(area.左, sp曲线.y);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sp曲线.x, sp曲线.y, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  绘制控制点() {
    const ctx = this.ctx;
    ctx.save();
    this.绘制锚点(this.曲线.p0, { key: "p0" });
    this.绘制锚点(this.曲线.p3, { key: "p3" });
    this.绘制单点(this.曲线.p1, { key: "p1" });
    this.绘制单点(this.曲线.p2, { key: "p2" });
    ctx.restore();
  }

  绘制单点(p, id) {
    const ctx = this.ctx;
    const pos = this.坐标转屏幕(p);
    const hot = this.状态.悬停 && this.状态.悬停.key === id.key;
    const style = this.样式.控制点;
    ctx.save();
    ctx.strokeStyle = hot ? style.悬停描边 : style.描边;
    ctx.fillStyle = hot ? style.悬停填充 : style.填充;
    ctx.lineWidth = hot ? style.悬停线宽 : style.线宽;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  绘制锚点(p, id) {
    const ctx = this.ctx;
    const pos = this.坐标转屏幕(p);
    const hot = this.状态.悬停 && this.状态.悬停.key === id.key;
    const style = this.样式.锚点;
    ctx.save();
    // ctx.strokeStyle = hot ? style.悬停描边 : "orange";
    ctx.fillStyle = hot ? style.悬停填充 : style.填充;
    // ctx.lineWidth = hot ? style.悬停线宽 : style.线宽;
    // ctx.beginPath();
    // ctx.arc(pos.x, pos.y, 9, 0, Math.PI * 2);
    // ctx.fill();
    // ctx.stroke();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "silver";
    ctx.fill();
    ctx.restore();
  }

  绘制幽灵汽车() {
    if (!this.汽车.已加载) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = this.幽灵.透明度;
    const flip = this.幽灵.朝向 === -1;
    const drawX = this.幽灵.x;
    const drawY = this.幽灵.y;
    if (flip) {
      ctx.translate(drawX + this.汽车.width / 2, drawY + this.汽车.height / 2);
      ctx.scale(-1, 1);
      ctx.translate(-(drawX + this.汽车.width / 2), -(drawY + this.汽车.height / 2));
    }
    ctx.drawImage(this.汽车.img, drawX, drawY, this.汽车.width, this.汽车.height);
    ctx.restore();
  }

  读取控制点() {
    try {
      const raw = sessionStorage.getItem("缓动动画-控制点");
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== "object") return;
      const { p1, p2 } = obj;
      const clampPoint = (p) => {
        if (!p || typeof p.x !== "number" || typeof p.y !== "number") return null;
        return { x: this.夹取(p.x, 0, 1), y: this.夹取(p.y, 0, this.控制点最大归一) };
      };
      const cp1 = clampPoint(p1);
      const cp2 = clampPoint(p2);
      if (cp1) this.曲线.p1 = cp1;
      if (cp2) this.曲线.p2 = cp2;
    } catch (e) {
      console.warn("读取控制点失败", e);
    }
  }

  保存控制点() {
    try {
      const payload = {
        p1: this.曲线.p1,
        p2: this.曲线.p2,
      };
      sessionStorage.setItem("缓动动画-控制点", JSON.stringify(payload));
    } catch (e) {
      console.warn("保存控制点失败", e);
    }
  }

  绘制汽车() {
    if (!this.汽车.已加载) return;
    const ctx = this.ctx;
    ctx.save();
    const flip = this.汽车.朝向 === -1;
    if (flip) {
      ctx.translate(this.汽车.x + this.汽车.width / 2, this.汽车.y + this.汽车.height / 2);
      ctx.scale(-1, 1);
      ctx.translate(-(this.汽车.x + this.汽车.width / 2), -(this.汽车.y + this.汽车.height / 2));
    }
    ctx.drawImage(this.汽车.img, this.汽车.x, this.汽车.y, this.汽车.width, this.汽车.height);
    ctx.restore();
  }

  防抖(fn, delay = 60) {
    let timer = null;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
}

class 映射关系 {
  读取设置() {
    try {
      const raw = sessionStorage.getItem("映射关系-设置");
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== "object") return;
      const { p1, p2, 分布数量 } = obj;
      const clampPoint = (p) => {
        if (!p || typeof p.x !== "number" || typeof p.y !== "number") return null;
        return {
          x: Math.max(0, Math.min(1, p.x)),
          y: Math.max(0, Math.min(1, p.y)),
        };
      };
      const cp1 = clampPoint(p1);
      const cp2 = clampPoint(p2);
      if (cp1) this.曲线.p1 = cp1;
      if (cp2) this.曲线.p2 = cp2;
      if (typeof 分布数量 === "number" && 分布数量 >= 2 && 分布数量 <= 10) this.分布数量 = 分布数量;
    } catch (e) {
      console.warn("读取映射关系设置失败", e);
    }
  }

  保存设置() {
    try {
      const payload = {
        p1: this.曲线.p1,
        p2: this.曲线.p2,
        分布数量: this.分布数量,
      };
      sessionStorage.setItem("映射关系-设置", JSON.stringify(payload));
    } catch (e) {
      console.warn("保存映射关系设置失败", e);
    }
  }
  // 三次贝塞尔评估函数，返回 {x, y}
  评估贝塞尔(t) {
    const { p0, p1, p2, p3 } = this.曲线;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    return {
      x: p0.x * mt2 * mt + 3 * p1.x * mt2 * t + 3 * p2.x * mt * t2 + p3.x * t2 * t,
      y: p0.y * mt2 * mt + 3 * p1.y * mt2 * t + 3 * p2.y * mt * t2 + p3.y * t2 * t,
    };
  }

  // 采样y均匀分布的查表（y->x），返回数组，采样点数为count
  生成Y查表(count = 200) {
    const table = [];
    for (let i = 0; i <= count; i++) {
      const y = i / count;
      // 二分法反解t
      let lo = 0,
        hi = 1,
        t = 0.5;
      for (let j = 0; j < 24; j++) {
        t = (lo + hi) / 2;
        const by = this.评估贝塞尔(t).y;
        if (by < y) {
          lo = t;
        } else {
          hi = t;
        }
      }
      t = (lo + hi) / 2;
      const bx = this.评估贝塞尔(t).x;
      table.push({ y, x: bx, t });
    }
    return table;
  }

  // y查表查找x，y∈[0,1]，table为查表数组
  查表查x(y, table) {
    if (y <= 0) return table[0].x;
    if (y >= 1) return table[table.length - 1].x;
    const idx = y * (table.length - 1);
    const i = Math.floor(idx);
    const frac = idx - i;
    const x0 = table[i].x,
      x1 = table[i + 1].x;
    return x0 + (x1 - x0) * frac;
  }
  constructor() {
    this.canvas = document.getElementById("canvas-映射关系");
    this.dpr = window.devicePixelRatio || 1;
    this.ctx = this.canvas.getContext("2d");
    this.cssWidth = this.canvas.clientWidth;
    this.cssHeight = this.canvas.clientHeight;
    this.canvas.width = this.cssWidth * this.dpr;
    this.canvas.height = this.cssHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.边界矩形 = this.canvas.getBoundingClientRect();
    this.鼠标坐标 = { x: 0, y: 0 };
    this.鼠标已按下 = false;
    this.光标样式 = {
      默认: 'url("/Images/Common/鼠标-默认.cur"), auto',
      悬停: 'url("/Images/Common/鼠标-指向.cur"), pointer',
      拖拽: 'url("/Images/Common/鼠标-拖拽.cur"), grab',
    };

    // 区域布局与样式，保持与缓动动画一致
    this.布局 = { 左: 50, 右: 45, 顶: 28, 底: this.cssHeight / 2 };
    this.样式 = {
      背景: "#0b1220",
      网格: "rgba(255,255,255,0.06)",
      轴线: "#40444a",
      区域框: "#1f2937",
      曲线: "#6ac69d",
      辅助线: "#5e7eb1",
      文字: "#e5e7eb",
      控制点: {
        填充: "#0f172a",
        描边: "#c2c2c2",
        线宽: 1.6,
        悬停填充: "#f59e0b",
        悬停描边: "#fbbf24",
        悬停线宽: 2.6,
      },
      锚点: {
        填充: "#111827",
        描边: "#7dd3fc",
        线宽: 2,
        悬停填充: "#0ea5e9",
        悬停描边: "#67e8f9",
        悬停线宽: 2.8,
      },
    };

    this.初始化尺寸();
    this.曲线 = {
      p0: { x: 0, y: 0 },
      p1: { x: 0.22, y: 0.08 },
      p2: { x: 0.78, y: 0.92 },
      p3: { x: 1, y: 1 },
    };

    this.分布数量 = 4;
    // 多边形颜色缓存结构: { [key]: [color, ...] }, key = `${isCurve}_${n}`
    this.多边形颜色缓存 = {};
    // 分布点缓存结构预留: { [key]: {tPoints, dPoints} }
    this.分布点缓存 = {};

    this.读取设置();
    this.绑定事件();
    this.状态 = {
      悬停: null,
      拖拽: null,
      拖拽偏移: null,
      滑块拖拽: false,
      滑块悬停: false,
    };
    this.绘制();
  }

  初始化尺寸() {
    const { 左, 右, 顶, 底 } = this.布局;
    const w = Math.max(200, this.cssWidth - 左 - 右);
    const h = Math.max(200, this.cssHeight - 顶 - 底);
    this.区域 = { 左, 顶, 右: 左 + w, 底: 顶 + h, 宽: w, 高: h };
  }

  绘制() {
    this.绘制背景与区域();
    this.绘制网格坐标轴();
    this.绘制曲线();
    this.绘制控制点();
    // --- 新增映射关系图和滑块 ---
    const ctx = this.ctx;
    const margin = 90;
    let yBase = this.区域.底 + margin;
    this.绘制映射关系图(yBase, false); // 匀速
    yBase += 120;
    this.绘制映射关系图(yBase, true); // 曲线
    yBase += 100;
    this.绘制滑块(yBase);
  }

  // 绘制映射关系图，isCurve: true为曲线，false为匀速
  绘制映射关系图(yBase, isCurve) {
    const ctx = this.ctx;
    const left = this.区域.左;
    const right = this.区域.右;
    const width = right - left;
    const tY = yBase;
    const dY = yBase + 50;
    ctx.save();
    ctx.strokeStyle = this.样式.轴线;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(left, tY);
    ctx.lineTo(right, tY);
    ctx.moveTo(left, dY);
    ctx.lineTo(right, dY);
    ctx.stroke();
    // 点分布
    const n = this.分布数量;
    const key = `${isCurve}_${n}`;
    // 颜色缓存
    if (!this.多边形颜色缓存[key] || this.多边形颜色缓存[key].length !== n - 1) {
      this.多边形颜色缓存[key] = Array.from({ length: n - 1 }, () => this.随机深色());
    }
    // 查表缓存（仅对曲线分布）
    if (isCurve) {
      if (!this._y查表 || this._y查表曲线版本 !== JSON.stringify(this.曲线)) {
        this._y查表 = this.生成Y查表(200);
        this._y查表曲线版本 = JSON.stringify(this.曲线);
      }
    }
    // 计算分布点
    const tPoints = [];
    const dPoints = [];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      tPoints.push({ x: left + t * width, y: tY });
      let d;
      if (isCurve) {
        // 用查表法获得d（y均匀分布，查x）
        d = this.查表查x(t, this._y查表);
      } else {
        d = t;
      }
      dPoints.push({ x: left + d * width, y: dY });
    }
    // 多边形填充
    for (let i = 0; i < n - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(tPoints[i].x, tPoints[i].y);
      ctx.lineTo(tPoints[i + 1].x, tPoints[i + 1].y);
      ctx.lineTo(dPoints[i + 1].x, dPoints[i + 1].y);
      ctx.lineTo(dPoints[i].x, dPoints[i].y);
      ctx.closePath();
      ctx.fillStyle = this.多边形颜色缓存[key][i];
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // 点
    ctx.fillStyle = "#222";
    ctx.strokeStyle = "silver";
    ctx.lineWidth = 1;
    for (let i = 0; i < tPoints.length; i++) {
      const p = tPoints[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // 曲线映射图：时间点上方绘制两位小数（首尾不绘制）
      if (isCurve && i !== 0 && i !== tPoints.length - 1) {
        ctx.save();
        ctx.fillStyle = this.样式.文字;
        ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        // t为归一化时间
        const t = tPoints.length === 1 ? 0.5 : i / (tPoints.length - 1);
        ctx.fillText(t.toFixed(2), p.x, p.y - 8);
        ctx.restore();
      }
    }

    // 曲线映射图：在三次贝塞尔曲线上绘制分布点（首尾不绘制，y均分，反解t）
    if (isCurve) {
      for (let i = 1; i < n - 1; i++) {
        // y轴均分，目标y
        const yTarget = i / (n - 1);
        let t = 0.5;
        if (this._y查表) {
          // _y查表为[{y, x, t}]，找到最接近yTarget的t
          let minDiff = Infinity;
          let bestEntry = null;
          for (let j = 0; j < this._y查表.length; j++) {
            const entry = this._y查表[j];
            const diff = Math.abs(entry.y - yTarget);
            if (diff < minDiff) {
              minDiff = diff;
              bestEntry = entry;
            }
          }
          if (bestEntry) t = bestEntry.t;
        }
        const bezier = this.评估贝塞尔(t);
        const pos = this.坐标转屏幕(bezier);
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#9d461b";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
    for (let i = 0; i < dPoints.length; i++) {
      const 是偶数 = i % 2 === 0;
      const p = dPoints[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // 绘制数值（首尾不绘制）
      if (isCurve && i !== 0 && i !== dPoints.length - 1) {
        ctx.save();
        ctx.fillStyle = this.样式.文字;
        ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        // 反算归一化路程值
        let dVal;
        if (isCurve) {
          dVal = this.查表查x(i / (dPoints.length - 1), this._y查表);
        } else {
          dVal = dPoints.length === 1 ? 0.5 : i / (dPoints.length - 1);
        }
        ctx.fillText(dVal.toFixed(2), p.x, p.y + 8);
        ctx.restore();
      }
    }
    ctx.restore();
    ctx.textAlign = "right";
    ctx.fillStyle = "lightskyblue";
    ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.fillText("时间", left - 8, tY);
    ctx.fillText("路程", left - 8, dY + 8);
    ctx.restore();
  }

  // 绘制滑块
  绘制滑块(yBase) {
    const ctx = this.ctx;
    const left = this.区域.左;
    const right = this.区域.右;
    const width = right - left;
    const sliderW = 260,
      sliderH = 16;
    const sliderX = left + 240;
    const sliderY = yBase + 10;
    ctx.save();
    // 滑块轨道：左侧高亮，右侧原色
    const trackY = sliderY + sliderH / 2 - 2;
    const trackH = 4;
    const highlightColor = "#6ac69d"; // 高亮色（金色）
    const min = 2,
      max = 10;
    const val = this.分布数量;
    const t = (val - min) / (max - min);
    const knobX = sliderX + t * sliderW;
    // 左侧高亮
    ctx.fillStyle = highlightColor;
    ctx.fillRect(sliderX, trackY, knobX - sliderX, trackH);
    // 右侧原色
    ctx.fillStyle = "#444";
    ctx.fillRect(knobX, trackY, sliderX + sliderW - knobX, trackH);
    // 滑块按钮
    // thumb 悬停/拖拽高亮
    let isHot = this.状态.滑块拖拽 || this.状态.滑块悬停;
    ctx.beginPath();
    ctx.arc(knobX, sliderY + sliderH / 2, isHot ? 12 : 10, 0, Math.PI * 2);
    ctx.fillStyle = isHot ? "#8fffc0" : "#6ac69d";
    ctx.shadowColor = isHot ? "#3f6" : "#222";
    ctx.shadowBlur = isHot ? 12 : 6;
    ctx.fill();
    ctx.shadowBlur = 0;
    // 标题
    ctx.fillStyle = this.样式.文字;
    ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("分布数量", sliderX - 18, sliderY + sliderH / 2 + 6);
    // 数字
    ctx.textAlign = "left";
    ctx.fillText(val, sliderX + sliderW + 20, sliderY + sliderH / 2 + 6);
    ctx.restore();
    // 记录滑块区域用于交互
    this.滑块区域 = {
      x: sliderX,
      y: sliderY,
      w: sliderW,
      h: sliderH,
      min,
      max,
      knobX,
      knobY: sliderY + sliderH / 2,
      knobR: isHot ? 15 : 12,
    };
  }

  // 生成深色随机色
  随机深色() {
    const h = Math.floor(Math.random() * 360);
    const s = 30 + Math.random() * 30;
    const l = 25 + Math.random() * 70;
    return `hsl(${h},${s}%,${l}%)`;
  }

  绘制背景与区域() {
    const ctx = this.ctx;
    const area = this.区域;
    ctx.save();
    ctx.fillStyle = this.样式.背景;
    ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
    ctx.strokeStyle = this.样式.区域框;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(area.左, area.顶, area.宽, area.高);
    ctx.restore();
  }

  绘制网格坐标轴() {
    const ctx = this.ctx;
    const area = this.区域;
    ctx.save();
    ctx.strokeStyle = this.样式.网格;
    ctx.lineWidth = 1;
    const 刻度数字颜色 = "#59d";
    const xLines = 5;
    for (let i = 1; i < xLines; i++) {
      const x = area.左 + (area.宽 / xLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, area.顶);
      ctx.lineTo(x, area.底);
      ctx.stroke();
    }
    const yLines = 5;
    const yStep = 1 / yLines;
    for (let i = 1; i < yLines; i++) {
      const ny = yStep * i;
      const y = area.顶 + (1 - ny) * area.高;
      ctx.beginPath();
      ctx.moveTo(area.左, y);
      ctx.lineTo(area.右, y);
      ctx.stroke();
      ctx.fillStyle = 刻度数字颜色;
      ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(ny.toFixed(1), area.左 - 6, y);
    }
    ctx.strokeStyle = this.样式.轴线;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(area.左, area.底);
    ctx.lineTo(area.右, area.底);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(area.左, area.顶);
    ctx.lineTo(area.左, area.底);
    ctx.stroke();
    ctx.fillStyle = this.样式.文字;
    ctx.font = "13px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("时间", area.左 + 6, area.顶);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("距离", area.右 + 8, area.底);
    ctx.fillStyle = 刻度数字颜色;
    ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("0", area.左 - 4, area.底 + 15);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("1", area.右, area.底 + 15);
    for (let i = 1; i < 5; i++) {
      const frac = i * 0.2;
      const x = area.左 + frac * area.宽;
      ctx.strokeStyle = this.样式.轴线;
      ctx.beginPath();
      ctx.moveTo(x, area.底);
      ctx.lineTo(x, area.底 + 6);
      ctx.stroke();
      ctx.fillStyle = 刻度数字颜色;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(frac.toFixed(1), x, area.底 + 15);
    }
    ctx.restore();
  }

  坐标转屏幕(p) {
    const area = this.区域;
    return {
      x: area.左 + p.x * area.宽,
      y: area.顶 + (1 - p.y) * area.高,
    };
  }

  绘制曲线() {
    const ctx = this.ctx;
    ctx.save();
    const { p0, p1, p2, p3 } = this.曲线;
    const sp0 = this.坐标转屏幕(p0);
    const sp1 = this.坐标转屏幕(p1);
    const sp2 = this.坐标转屏幕(p2);
    const sp3 = this.坐标转屏幕(p3);
    ctx.strokeStyle = "#68a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sp0.x, sp0.y);
    ctx.lineTo(sp1.x, sp1.y);
    ctx.moveTo(sp2.x, sp2.y);
    ctx.lineTo(sp3.x, sp3.y);
    ctx.stroke();
    ctx.strokeStyle = this.样式.曲线;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(sp0.x, sp0.y);
    ctx.bezierCurveTo(sp1.x, sp1.y, sp2.x, sp2.y, sp3.x, sp3.y);
    ctx.stroke();
    ctx.restore();
  }

  绘制控制点() {
    const ctx = this.ctx;
    ctx.save();
    this.绘制锚点(this.曲线.p0);
    this.绘制锚点(this.曲线.p3);
    this.绘制单点(this.曲线.p1);
    this.绘制单点(this.曲线.p2);
    ctx.restore();
  }

  绘制单点(p) {
    const ctx = this.ctx;
    const pos = this.坐标转屏幕(p);
    const style = this.样式.控制点;
    // 拖拽时，始终高亮被拖拽的点
    const isHot = (this.状态.悬停 && this.状态.悬停.p === p) || (this.状态.拖拽 && this.状态.拖拽.p === p);
    ctx.save();
    ctx.strokeStyle = isHot ? style.悬停描边 : style.描边;
    ctx.fillStyle = isHot ? style.悬停填充 : style.填充;
    ctx.lineWidth = isHot ? style.悬停线宽 : style.线宽;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  绘制锚点(p) {
    const ctx = this.ctx;
    const pos = this.坐标转屏幕(p);
    ctx.save();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "silver";
    ctx.fill();
    ctx.restore();
  }

  // 防抖函数
  防抖(回调, 防抖延时) {
    let 延时ID;
    return (...args) => {
      clearTimeout(延时ID);
      延时ID = setTimeout(() => 回调.apply(this, args), 防抖延时);
    };
  }

  绑定事件() {
    // 对resize和scroll事件添加防抖，延迟100ms
    window.addEventListener("resize", this.防抖(this.刷新边界矩形.bind(this), 50));
    window.addEventListener("scroll", this.防抖(this.刷新边界矩形.bind(this), 50));
    this.canvas.addEventListener("mousemove", (e) => {
      this.获取鼠标坐标(e);
      const { x, y } = this.鼠标坐标;
      // 判断是否悬停在p1/p2
      let found = null;
      if (this.状态.拖拽) {
        found = this.状态.拖拽;
      } else {
        for (const key of ["p1", "p2"]) {
          const p = this.曲线[key];
          const pos = this.坐标转屏幕(p);
          const dx = x - pos.x,
            dy = y - pos.y;
          if (dx * dx + dy * dy <= 8 * 8) {
            found = { key, p };
            break;
          }
        }
      }
      // 滑块thumb悬停检测
      let sliderHot = false;
      if (this.滑块区域) {
        const s = this.滑块区域;
        const dx = x - s.knobX,
          dy = y - s.knobY;
        if (dx * dx + dy * dy <= s.knobR * s.knobR) {
          sliderHot = true;
        }
      }
      this.状态.滑块悬停 = sliderHot;
      // 优先滑块thumb悬停样式
      if (sliderHot || this.状态.滑块拖拽) {
        this.canvas.style.cursor = "pointer";
      } else {
        this.canvas.style.cursor = found ? this.光标样式.拖拽 : this.光标样式.默认;
      }
      this.状态.悬停 = found;
      if (this.状态.拖拽) {
        // 拖拽中，更新控制点
        const offset = this.状态.拖拽偏移 || { dx: 0, dy: 0 };
        const px = x + offset.dx;
        const py = y + offset.dy;
        this.更新控制点(px, py, this.状态.拖拽.key);
      }
      if (this.状态.滑块拖拽 && this.滑块区域) {
        this.滑块更新(x);
      }
      this.绘制();
    });
    this.canvas.addEventListener("mousedown", (e) => {
      this.获取鼠标坐标(e);
      const { x, y } = this.鼠标坐标;
      // 优先滑块thumb
      if (this.滑块区域) {
        const s = this.滑块区域;
        const dx = x - s.knobX,
          dy = y - s.knobY;
        if (dx * dx + dy * dy <= s.knobR * s.knobR) {
          this.状态.滑块拖拽 = true;
          this.滑块更新(x);
          return;
        }
      }
      for (const key of ["p1", "p2"]) {
        const p = this.曲线[key];
        const pos = this.坐标转屏幕(p);
        const dx = x - pos.x,
          dy = y - pos.y;
        if (dx * dx + dy * dy <= 8 * 8) {
          this.状态.拖拽 = { key, p };
          this.状态.拖拽偏移 = { dx: pos.x - x, dy: pos.y - y };
          break;
        }
      }
    });
    window.addEventListener("mouseup", (e) => {
      if (this.状态.滑块拖拽) {
        this.状态.滑块拖拽 = false;
      }
      this.状态.拖拽 = null;
      this.状态.拖拽偏移 = null;
    });
  }

  滑块更新(x) {
    const s = this.滑块区域;
    let t = (x - s.x) / s.w;
    t = Math.max(0, Math.min(1, t));
    const val = Math.round(s.min + t * (s.max - s.min));
    if (this.分布数量 !== val) {
      this.分布数量 = val;
      // 清除颜色缓存（只清除与分布数量相关的key）
      for (const k in this.多边形颜色缓存) {
        if (k.endsWith(`_${val}`)) continue;
        delete this.多边形颜色缓存[k];
      }
      this.保存设置();
    }
    this.绘制();
  }

  更新控制点(x, y, key) {
    // 反算归一化坐标
    const area = this.区域;
    let nx = (x - area.左) / area.宽;
    let ny = 1 - (y - area.顶) / area.高;
    nx = Math.max(0, Math.min(1, nx));
    ny = Math.max(0, Math.min(1, ny));
    this.曲线[key].x = nx;
    this.曲线[key].y = ny;
    this.保存设置();
  }

  刷新边界矩形() {
    this.边界矩形 = this.canvas.getBoundingClientRect();
  }

  获取鼠标坐标(e) {
    const x = e.clientX - this.边界矩形.left;
    const y = e.clientY - this.边界矩形.top;
    this.鼠标坐标.x = x;
    this.鼠标坐标.y = y;
    return { x, y };
  }
}

const 启动 = () => {
  new 缓动动画();
  new 映射关系();
};

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", 启动);
} else {
  启动();
}
