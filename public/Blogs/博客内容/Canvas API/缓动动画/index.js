class 缓动动画 {
  constructor() {
    this.canvas = document.getElementById("canvas-缓动动画");
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.布局 = { 左: 50, 右: 45, 顶: 28, 底: 200 };
    this.初始化尺寸();

    this.轴最大速度 = 500;
    this.控制点最大归一 = 3; // 控制点允许的归一化高度（可超出速度上限）

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
      y: this.cssHeight - 25,
      width: this.cssWidth,
      height: 2,
    };
    this.汽车 = {
      最高速度: 500,
      x: 10,
      y: this.cssHeight - 25 - 80 / this.dpr,
      width: 120 / this.dpr,
      height: 80 / this.dpr,
      src: "/Images/Blogs/Canvas API/缓动动画/汽车.png",
      img: new Image(),
      已加载: false,
      朝向: 1,
    };

    const 峰值归一 = Math.min(1, this.汽车.最高速度 / this.轴最大速度);
    // 初始时保证 p2、共享点、p1 共线且水平
    const 共享 = { x: 0.5, y: 峰值归一 };
    this.片段 = [
      {
        p0: { x: 0, y: 0 },
        p1: { x: 0.18, y: 峰值归一 * 0.05 },
        p2: { x: 0.32, y: 峰值归一 },
        p3: 共享,
      },
      {
        p0: 共享,
        p1: { x: 0.68, y: 峰值归一 },
        p2: { x: 0.82, y: 峰值归一 * 0.05 },
        p3: { x: 1, y: 0 },
      },
    ];

    this.同步最高速度();

    this.状态 = { 悬停: null, 拖拽: null, 初始半径: null };

    this.动画 = { 方向: 1, 已用时: 0, 上次时间: null, 总时长: 0 };
    this.路径 = { 起点: 10, 终点: this.cssWidth - 10 - this.汽车.width, 长度: 0 };

    this.绑定事件();
    this.加载汽车图片();
    this.更新行程();
    this.重建速度表();
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
      this.重建速度表();
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
        if (p.ctrl && this.状态.初始半径 == null) {
          this.状态.初始半径 = this.获取对侧半径(this.状态.拖拽);
        }
        if (!p.ctrl) this.状态.初始半径 = null;
        this.更新控制点(p.x, p.y, this.状态.拖拽, p.ctrl);
      }
      this.绘制();
    });

    this.canvas.addEventListener("mousedown", (e) => {
      const p = 坐标(e);
      const hit = this.命中控制点(p.x, p.y);
      if (hit) {
        this.状态.拖拽 = hit;
        this.状态.初始半径 = p.ctrl ? this.获取对侧半径(hit) : null;
        this.更新控制点(p.x, p.y, hit, p.ctrl);
        this.绘制();
      }
    });

    const 结束 = () => {
      this.状态.拖拽 = null;
      this.状态.初始半径 = null;
    };
    this.canvas.addEventListener("mouseup", 结束);
    this.canvas.addEventListener("mouseleave", 结束);
  }

  命中控制点(x, y) {
    const r = 10;
    for (let i = 0; i < this.片段.length; i++) {
      const seg = this.片段[i];
      for (const key of ["p1", "p2"]) {
        const p = this.坐标转屏幕(seg[key]);
        if (this.点在圆内(x, y, p.x, p.y, r)) return { segIndex: i, key };
      }
    }
    // 共享锚点 p3/p0
    const shared = this.坐标转屏幕(this.片段[0].p3);
    if (this.点在圆内(x, y, shared.x, shared.y, r + 2)) return { segIndex: 0, key: "p3" };
    return null;
  }

  更新控制点(x, y, target, ctrlKey) {
    const { segIndex, key } = target;
    const seg = this.片段[segIndex];
    const n = this.屏幕转坐标(x, y);
    const maxNorm = Math.min(1, this.汽车.最高速度 / this.轴最大速度);
    const isHandle = key === "p1" || key === "p2";
    const isAnchor = key === "p3";
    const yCap = isHandle ? this.控制点最大归一 : maxNorm;
    const yAnchorCap = this.控制点最大归一;
    n.y = this.夹取(n.y, 0, isAnchor ? yAnchorCap : yCap);
    n.x = this.夹取(n.x, 0, 1);

    const 镜像屏幕 = (锚屏幕, 指向屏幕, 固定半径) => {
      const vx = 指向屏幕.x - 锚屏幕.x;
      const vy = 指向屏幕.y - 锚屏幕.y;
      const 长度 = Math.hypot(vx, vy) || 1;
      const ux = vx / 长度;
      const uy = vy / 长度;
      const r = 固定半径 ?? 长度;
      return { x: 锚屏幕.x - ux * r, y: 锚屏幕.y - uy * r };
    };

    const 同步锚点 = () => {
      this.片段[0].p0 = { x: 0, y: 0 };
      this.片段[1].p3 = { x: 1, y: 0 };
      const shared = this.片段[0].p3;
      this.片段[1].p0 = shared;
      this.片段[0].p3 = shared;
    };

    if (ctrlKey) {
      const anchor = this.片段[0].p3;
      const anchorScr = this.坐标转屏幕(anchor);
      if (segIndex === 0 && key === "p2") {
        const radius = this.状态.初始半径 ?? this.获取对侧半径({ segIndex, key });
        const primary = this.限制到域(n, this.控制点最大归一, true);
        this.片段[0].p2 = primary;
        const primaryScr = this.坐标转屏幕(primary);
        const mirrorScr = 镜像屏幕(anchorScr, primaryScr, radius);
        const mirror = this.屏幕转坐标(mirrorScr.x, mirrorScr.y);
        this.片段[1].p1 = this.限制到域(mirror, this.控制点最大归一, true);
        同步锚点();
        this.重建速度表();
        return;
      }
      if (segIndex === 1 && key === "p1") {
        const radius = this.状态.初始半径 ?? this.获取对侧半径({ segIndex, key });
        const primary = this.限制到域(n, this.控制点最大归一, true);
        this.片段[1].p1 = primary;
        const primaryScr = this.坐标转屏幕(primary);
        const mirrorScr = 镜像屏幕(anchorScr, primaryScr, radius);
        const mirror = this.屏幕转坐标(mirrorScr.x, mirrorScr.y);
        this.片段[0].p2 = this.限制到域(mirror, this.控制点最大归一, true);
        同步锚点();
        this.重建速度表();
        return;
      }
    }

    seg[key] = n;
    同步锚点();
    if (key === "p3") this.同步最高速度();
    this.重建速度表();
  }

  同步最高速度() {
    const 共享 = this.片段[0].p3;
    this.汽车.最高速度 = this.夹取(共享.y * this.轴最大速度, 0, 500);
  }

  更新行程() {
    const 起点 = 10;
    const 终点 = Math.max(起点 + 20, this.cssWidth - 10 - this.汽车.width);
    this.路径 = { 起点, 终点, 长度: 终点 - 起点 };
    this.汽车.y = this.cssHeight - 25 - this.汽车.height;
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

  获取对侧半径(target) {
    const anchorScr = this.坐标转屏幕(this.片段[0].p3);
    if (target.segIndex === 0 && target.key === "p2") {
      const otherScr = this.坐标转屏幕(this.片段[1].p1);
      return Math.hypot(otherScr.x - anchorScr.x, otherScr.y - anchorScr.y);
    }
    if (target.segIndex === 1 && target.key === "p1") {
      const otherScr = this.坐标转屏幕(this.片段[0].p2);
      return Math.hypot(otherScr.x - anchorScr.x, otherScr.y - anchorScr.y);
    }
    return null;
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

  采样速度曲线(总样本 = 400) {
    const perSeg = Math.max(2, Math.floor(总样本 / this.片段.length));
    const 点集 = [];
    const evalSeg = (seg, t) => {
      const { p0, p1, p2, p3 } = seg;
      const mt = 1 - t;
      const mt2 = mt * mt;
      const t2 = t * t;
      const x =
        p0.x * mt2 * mt +
        3 * p1.x * mt2 * t +
        3 * p2.x * mt * t2 +
        p3.x * t2 * t;
      const y =
        p0.y * mt2 * mt +
        3 * p1.y * mt2 * t +
        3 * p2.y * mt * t2 +
        p3.y * t2 * t;
      return { x, y };
    };

    for (let i = 0; i < this.片段.length; i++) {
      const seg = this.片段[i];
      for (let j = 0; j <= perSeg; j++) {
        const t = j / perSeg;
        点集.push(evalSeg(seg, t));
      }
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

  归一到速度(n) {
    const 归一 = this.夹取(n, 0, this.控制点最大归一);
    const 物理 = 归一 * this.轴最大速度;
    return this.夹取(物理, 0, this.汽车.最高速度);
  }

  重建速度表() {
    if (!this.canvas) return;
    const 当前进度 = this.当前进度();
    const 样本 = this.采样速度曲线();
    const 行程像素 = Math.max(1, this.路径.长度);
    const 表 = [{ s: 0, time: 0 }];
    let 累计时间 = 0;

    for (let i = 1; i < 样本.length; i++) {
      const a = 样本[i - 1];
      const b = 样本[i];
      const ds = Math.max(0, b.x - a.x);
      if (ds <= 0) continue;
      const va = this.归一到速度(a.y);
      const vb = this.归一到速度(b.y);
      const v = Math.max(1e-6, (va + vb) / 2);
      const dt = (ds * 行程像素) / v;
      累计时间 += dt;
      表.push({ s: b.x, time: 累计时间 });
    }

    this.动画表 = 表;
    this.动画.总时长 = Math.max(累计时间, 0.001);
    this.动画.已用时 = this.动画.总时长 * this.夹取(当前进度, 0, 1);
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
    const s = this.时间转进度(this.动画.已用时);
    return this.动画.方向 === 1 ? s : 1 - s;
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
    if (!this.动画表 || this.动画表.length < 2) return;
    if (this.动画.上次时间 == null) this.动画.上次时间 = timestamp;
    const delta = Math.max(0, (timestamp - this.动画.上次时间) / 1000);
    this.动画.上次时间 = timestamp;

    let time = this.动画.已用时 + delta;
    const 总 = this.动画.总时长 || 0.001;
    if (time >= 总) {
      const 循环次数 = Math.floor(time / 总);
      time = time % 总;
      if (循环次数 % 2 === 1) {
        this.动画.方向 *= -1;
      }
    }
    this.动画.已用时 = time;

    const s前进 = this.时间转进度(time);
    const 归一 = this.动画.方向 === 1 ? s前进 : 1 - s前进;
    this.汽车.朝向 = this.动画.方向;
    this.汽车.x = this.路径.起点 + 归一 * this.路径.长度;
    this.绘制();
  }

  绘制() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.绘制背景与区域();
    this.绘制网格坐标轴();
    this.绘制曲线();
    this.绘制控制点();
    this.绘制地面();
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

    const xLines = 5;
    for (let i = 1; i < xLines; i++) {
      const x = area.左 + (area.宽 / xLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, area.顶);
      ctx.lineTo(x, area.底);
      ctx.stroke();
    }

    const yStep = 100;
    for (let v = yStep; v < this.轴最大速度; v += yStep) {
      const ny = v / this.轴最大速度;
      const y = area.顶 + (1 - ny) * area.高;
      ctx.beginPath();
      ctx.moveTo(area.左, y);
      ctx.lineTo(area.右, y);
      ctx.stroke();

      ctx.fillStyle = "lightblue";
      ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(String(v), area.左 - 6, y);
    }

    // 顶部 500 刻度标签
    ctx.fillStyle = "lightblue";
    ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(String(this.轴最大速度), area.左 - 6, area.顶);

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
    ctx.fillText("速度", area.左 + 6, area.顶);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("距离", area.右 + 8, area.底);

    // 原点和 x=1 标签
    ctx.fillStyle = "lightblue";
    ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("0", area.左 - 4, area.底 + 10);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("1", area.右, area.底 + 10);

    ctx.restore();
  }

  绘制曲线() {
    const ctx = this.ctx;
    ctx.save();
    for (let i = 0; i < this.片段.length; i++) {
      const seg = this.片段[i];
      const p0 = this.坐标转屏幕(seg.p0);
      const p1 = this.坐标转屏幕(seg.p1);
      const p2 = this.坐标转屏幕(seg.p2);
      const p3 = this.坐标转屏幕(seg.p3);

      ctx.strokeStyle = this.样式.辅助线;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.stroke();

      ctx.strokeStyle = this.样式.曲线;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  绘制控制点() {
    const ctx = this.ctx;
    ctx.save();
    // 共享锚点 p3/p0
    this.绘制锚点(this.片段[0].p3, { segIndex: 0, key: "p3" });
    for (let i = 0; i < this.片段.length; i++) {
      const seg = this.片段[i];
      this.绘制单点(seg.p1, { segIndex: i, key: "p1" });
      this.绘制单点(seg.p2, { segIndex: i, key: "p2" });
    }
    ctx.restore();
  }

  绘制单点(p, id) {
    const ctx = this.ctx;
    const pos = this.坐标转屏幕(p);
    const hot = this.状态.悬停 && this.状态.悬停.segIndex === id.segIndex && this.状态.悬停.key === id.key;
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
    const hot = this.状态.悬停 && this.状态.悬停.segIndex === id.segIndex && this.状态.悬停.key === id.key;
    const style = this.样式.锚点;
    ctx.save();
    ctx.strokeStyle = hot ? style.悬停描边 : "orange";
    ctx.fillStyle = hot ? style.悬停填充 : style.填充;
    ctx.lineWidth = hot ? style.悬停线宽 : style.线宽;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "silver";
    ctx.fill();
    ctx.restore();
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

const 启动 = () => {
  const canvas = document.getElementById("canvas-缓动动画");
  if (!canvas) return;
  new 缓动动画();
};

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", 启动);
} else {
  启动();
}
