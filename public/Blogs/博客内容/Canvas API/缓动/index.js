const 对象集合 = [];

class 缓动动画 {
  constructor() {
    this.canvas = document.getElementById("canvas-缓动动画");
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.布局 = { 左: 50, 右: 45, 顶: 28, 底: 150 };
    this.边界矩形 = this.canvas.getBoundingClientRect();
    this.初始化尺寸();
    this.在视口内 = false;

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

    this.归一化刻度 = false; // 默认不使用归一化刻度
    // this.复选框区域 = null; // 复选框区域 - 移除，因为初始化尺寸时已计算
    this.悬停的复选框 = false; // 跟踪复选框悬停状态
    this.鼠标坐标 = { x: 0, y: 0 }; // 鼠标坐标

    this.绑定事件();
    this.加载汽车图片();
    this.更新行程();
    this.重建时间表();
    this.读取设置();
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

  刷新边界矩形() {
    if (!this.在视口内) return;
    this.边界矩形 = this.canvas.getBoundingClientRect();
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

    // 计算复选框区域
    this.计算复选框区域();

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

  计算复选框区域() {
    const 复选框宽度 = 20; // 实际绘制的复选框宽度
    const 复选框高度 = 20; // 实际绘制的复选框高度
    const 文本宽度 = 40; // 文本区域宽度
    const 总宽度 = 复选框宽度 + 文本宽度;
    const 绘制区域 = this.区域;

    // 复选框位置：垂直靠上，水平居中
    this.复选框区域 = {
      复选框: {
        左: 绘制区域.左 + (绘制区域.宽 - 总宽度) / 2,
        右: 绘制区域.左 + (绘制区域.宽 - 总宽度) / 2 + 复选框宽度,
        顶: 绘制区域.顶 + 10,
        底: 绘制区域.顶 + 10 + 复选框高度,
      },
      文本: {
        左: 绘制区域.左 + (绘制区域.宽 - 总宽度) / 2 + 复选框宽度,
        右: 绘制区域.左 + (绘制区域.宽 - 总宽度) / 2 + 总宽度,
        顶: 绘制区域.顶 + 10,
        底: 绘制区域.顶 + 10 + 复选框高度,
      },
      整体: {
        左: 绘制区域.左 + (绘制区域.宽 - 总宽度) / 2,
        右: 绘制区域.左 + (绘制区域.宽 - 总宽度) / 2 + 总宽度,
        顶: 绘制区域.顶 + 10,
        底: 绘制区域.顶 + 10 + 复选框高度,
      },
    };
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
      this.刷新边界矩形();
      this.初始化尺寸();
      this.重建时间表(this.当前进度());
      this.绘制();
    }, 80);
    window.addEventListener("resize", debouncedResize);
    window.addEventListener("scroll", this.刷新边界矩形.bind(this));

    const 坐标 = (e) => {
      return { x: e.clientX - this.边界矩形.left, y: e.clientY - this.边界矩形.top, ctrl: e.ctrlKey };
    };

    this.canvas.addEventListener("mousemove", (e) => {
      const p = 坐标(e);
      // 获取鼠标坐标用于复选框检测
      this.获取鼠标坐标(e);

      // 检测复选框悬停
      const 复选框区域 = this.复选框区域;
      const 复选框悬停 =
        复选框区域 &&
        this.鼠标坐标.x >= 复选框区域.整体.左 &&
        this.鼠标坐标.x <= 复选框区域.整体.右 &&
        this.鼠标坐标.y >= 复选框区域.整体.顶 &&
        this.鼠标坐标.y <= 复选框区域.整体.底;

      // 更新复选框悬停状态
      if (复选框悬停 !== this.悬停的复选框) {
        this.悬停的复选框 = 复选框悬停;
      }

      // 检测控制点悬停
      this.状态.悬停 = this.命中控制点(p.x, p.y) || this.状态.拖拽;

      // 设置光标样式 - 复选框悬停优先
      if (复选框悬停) {
        this.canvas.style.cursor = this.光标样式.悬停;
      } else if (this.状态.悬停) {
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

    // 复选框事件处理
    this.canvas.addEventListener("click", (e) => {
      this.获取鼠标坐标(e);
      this.检测复选框点击(this.鼠标坐标.x, this.鼠标坐标.y);
    });
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

  获取鼠标坐标(e) {
    const x = e.clientX - this.边界矩形.left;
    const y = e.clientY - this.边界矩形.top;
    this.鼠标坐标 = { x, y };
    return { x, y };
  }

  绘制复选框() {
    const ctx = this.ctx;
    const 复选框区域 = this.复选框区域;
    if (!复选框区域) return;

    const { 复选框, 文本 } = 复选框区域;
    const 选中 = this.归一化刻度;
    const 悬停 = this.悬停的复选框;

    // 绘制复选框背景
    if (选中) {
      ctx.fillStyle = "#263446ff";
    } else if (悬停) {
      ctx.fillStyle = "#263446ff";
    } else {
      ctx.fillStyle = "#192330ff";
    }
    ctx.beginPath();
    ctx.roundRect(复选框.左, 复选框.顶, 20, 20, 3);
    ctx.fill();

    // 绘制复选框边框
    ctx.strokeStyle = 选中 ? "#41785fff" : 悬停 ? "#aaa" : "#374151";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(复选框.左, 复选框.顶, 20, 20, 3);
    ctx.stroke();

    // 绘制复选框内的勾选标记
    if (选中) {
      ctx.strokeStyle = "#6ac69d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(复选框.左 + 4, 复选框.顶 + 10);
      ctx.lineTo(复选框.左 + 9, 复选框.顶 + 14);
      ctx.lineTo(复选框.左 + 16, 复选框.顶 + 5);
      ctx.stroke();
    }

    // 绘制文本
    ctx.fillStyle = 悬停 || 选中 ? "white" : "silver";
    ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("归一", 复选框.左 + 26, 复选框.顶 + 10);
  }

  检测复选框点击(x, y) {
    const 复选框区域 = this.复选框区域;
    if (!复选框区域) return;

    if (x >= 复选框区域.整体.左 && x <= 复选框区域.整体.右 && y >= 复选框区域.整体.顶 && y <= 复选框区域.整体.底) {
      this.归一化刻度 = !this.归一化刻度;
      this.保存设置();
      this.绘制();
    }
  }

  检测复选框悬停(x, y) {
    const 复选框区域 = this.复选框区域;
    if (!复选框区域) return;

    const isHovering =
      x >= 复选框区域.整体.左 && x <= 复选框区域.整体.右 && y >= 复选框区域.整体.顶 && y <= 复选框区域.整体.底;

    if (isHovering !== this.悬停的复选框) {
      this.悬停的复选框 = isHovering;
      this.canvas.style.cursor = isHovering
        ? 'url("/Images/Common/鼠标-指向.cur"), pointer'
        : 'url("/Images/Common/鼠标-默认.cur"), auto';
      this.绘制();
    }
  }

  读取设置() {
    try {
      const raw = sessionStorage.getItem("缓动动画-设置");
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== "object") return;
      const { p1, p2, 归一化刻度 } = obj;
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
      if (typeof 归一化刻度 === "boolean") this.归一化刻度 = 归一化刻度;
    } catch (e) {
      console.warn("读取缓动动画设置失败", e);
    }
  }

  保存设置() {
    try {
      const payload = {
        p1: this.曲线.p1,
        p2: this.曲线.p2,
        归一化刻度: this.归一化刻度,
      };
      sessionStorage.setItem("缓动动画-设置", JSON.stringify(payload));
    } catch (e) {
      console.warn("保存缓动动画设置失败", e);
    }
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
    const mt3 = mt ** 3;
    const t2 = t * t;
    const t3 = t ** 3;
    return {
      x: p0.x * mt3 + 3 * p1.x * mt2 * t + 3 * p2.x * mt * t2 + p3.x * t3,
      y: p0.y * mt3 + 3 * p1.y * mt2 * t + 3 * p2.y * mt * t2 + p3.y * t3,
    };
  }

  根据x求t(x目标, 迭代 = 24) {
    let floor = 0;
    let ceil = 1;
    for (let i = 0; i < 迭代; i++) {
      const mid = (floor + ceil) / 2;
      const x = this.评估贝塞尔(mid).x;
      if (x < x目标) {
        floor = mid;
      } else {
        ceil = mid;
      }
    }
    return (floor + ceil) / 2;
  }

  重建时间表(锁定进度 = null) {
    if (!this.canvas) return;
    const 目标进度 = 锁定进度 == null ? this.当前进度() : this.夹取(锁定进度, 0, 1);
    const 样本 = this.采样时间曲线();
    const 表 = [];
    let 最近时间 = 0;

    for (let i = 0; i < 样本.length; i++) {
      const 归一化距离 = this.夹取(样本[i].x, 0, 1);
      const 归一化时间 = this.夹取(样本[i].y, 0, this.控制点最大归一);
      const time = 归一化时间 * this.汽车.时长;
      最近时间 = Math.max(最近时间, time); //确保时间单调递增
      表.push({ s: 归一化距离, time: 最近时间 });
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
    if (this.rafId) cancelAnimationFrame(this.rafId);
    const 循环 = (ts) => {
      this.更新动画(ts);
      this.rafId = requestAnimationFrame(循环);
    };
    this.rafId = requestAnimationFrame(循环);
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
    this.绘制复选框();
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
      let text;
      if (this.归一化刻度) {
        text = ny.toFixed(1);
        if (text === "1.0") text = "1";
      } else {
        text = String(Math.round(v));
      }
      ctx.fillText(text, area.左 - 10, y);
    }

    // 顶部刻度标签（总时长）
    ctx.fillStyle = 刻度数字颜色;
    ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    let topText;
    if (this.归一化刻度) {
      topText = "1";
    } else {
      topText = String(this.轴最大时间);
    }
    ctx.fillText(topText, area.左 - 10, area.顶);

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

    // 原点和 x 标签
    ctx.fillStyle = 刻度数字颜色;
    ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    // X轴原点标签（显示路径起点）
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const x原点值 = this.归一化刻度 ? "0" : String(Math.round(this.路径.起点));
    ctx.fillText(x原点值, area.左, area.底 + 12);
    // X轴终点标签
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const x终点值 = this.归一化刻度 ? "1" : String(Math.round(this.路径.终点));
    ctx.fillText(x终点值, area.右, area.底 + 12);
    // 新增X轴刻度
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
      let label;
      if (this.归一化刻度) {
        label = frac.toFixed(1);
      } else {
        const 实际值 = this.路径.起点 + frac * this.路径.长度;
        label = String(Math.round(实际值));
      }
      ctx.fillText(label, x, area.底 + 12);
    }

    // Y轴原点标签（始终显示0）
    ctx.fillStyle = 刻度数字颜色;
    ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("0", area.左 - 10, area.底);

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
      const { p1, p2, 分布数量, 归一化刻度 } = obj;
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
      if (typeof 归一化刻度 === "boolean") this.归一化刻度 = 归一化刻度;
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
        归一化刻度: this.归一化刻度,
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
    const mt2 = mt ** 2;
    const mt3 = mt ** 3;
    const t2 = t * t;
    const t3 = t ** 3;
    return {
      x: p0.x * mt3 + 3 * p1.x * mt2 * t + 3 * p2.x * mt * t2 + p3.x * t3,
      y: p0.y * mt3 + 3 * p1.y * mt2 * t + 3 * p2.y * mt * t2 + p3.y * t3,
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
    this.在视口内 = false;
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

    this.归一化刻度 = false; // 默认不使用归一化刻度
    // this.复选框区域 = null; // 复选框区域 - 移除，因为初始化尺寸时已计算
    this.悬停的复选框 = false; // 跟踪复选框悬停状态

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
    // 计算复选框区域
    this.计算复选框区域();
  }

  计算复选框区域() {
    const 复选框宽度 = 20; // 实际绘制的复选框宽度
    const 复选框高度 = 20; // 实际绘制的复选框高度
    const 文本宽度 = 40; // 文本区域宽度
    const 总宽度 = 复选框宽度 + 文本宽度;
    const 绘制区域 = this.区域;

    // 复选框位置：垂直靠上，水平居中
    this.复选框区域 = {
      复选框: {
        左: 绘制区域.左 + (绘制区域.宽 - 总宽度) / 2,
        右: 绘制区域.左 + (绘制区域.宽 - 总宽度) / 2 + 复选框宽度,
        顶: 绘制区域.顶 + 10,
        底: 绘制区域.顶 + 10 + 复选框高度,
      },
      文本: {
        左: 绘制区域.左 + (绘制区域.宽 - 总宽度) / 2 + 复选框宽度,
        右: 绘制区域.左 + (绘制区域.宽 - 总宽度) / 2 + 总宽度,
        顶: 绘制区域.顶 + 10,
        底: 绘制区域.顶 + 10 + 复选框高度,
      },
      整体: {
        左: 绘制区域.左 + (绘制区域.宽 - 总宽度) / 2,
        右: 绘制区域.左 + (绘制区域.宽 - 总宽度) / 2 + 总宽度,
        顶: 绘制区域.顶 + 10,
        底: 绘制区域.顶 + 10 + 复选框高度,
      },
    };
  }

  绘制() {
    this.绘制背景与区域();
    this.绘制网格坐标轴();
    this.绘制曲线();
    this.绘制控制点();
    // 绘制复选框
    this.绘制复选框();
    // --- 新增映射关系图和滑块 ---
    const margin = 70;
    let yBase = this.区域.底 + margin;
    this.绘制映射关系图(yBase, false); // 匀速
    yBase += 140;
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
    const dY = yBase + 75;
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
        const t = tPoints.length === 1 ? 0.5 : i / (tPoints.length - 1);
        let tStr = t.toFixed(2);
        // 如果小数部分最后一位是0，则去掉
        if (tStr.endsWith("0")) tStr = tStr.slice(0, -1);
        ctx.save();
        ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        const dotIdx = tStr.indexOf(".");
        if (dotIdx !== -1) {
          // 先绘制整数部分
          const intPart = tStr.slice(0, dotIdx);
          const dot = ".";
          const fracPart = tStr.slice(dotIdx + 1);
          // 计算整体宽度，左起点
          const wAll = ctx.measureText(tStr).width;
          const wInt = ctx.measureText(intPart).width;
          const wDot = ctx.measureText(dot).width;
          const wFrac = ctx.measureText(fracPart).width;
          let xStart = p.x - wAll / 2;
          ctx.fillStyle = this.样式.文字;
          ctx.fillText(intPart, xStart, p.y - 8);
          xStart += wInt;
          ctx.fillStyle = "#888";
          ctx.fillText(dot, xStart, p.y - 8);
          xStart += wDot + ((fracPart.length - 1) * wDot) / 2;
          ctx.fillStyle = this.样式.文字;
          ctx.fillText(fracPart, xStart, p.y - 8);
        } else {
          ctx.fillStyle = this.样式.文字;
          ctx.fillText(tStr, p.x, p.y - 8);
        }
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
      const p = dPoints[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // 绘制数值（首尾不绘制）
      if (isCurve && i !== 0 && i !== dPoints.length - 1) {
        let dVal;
        if (isCurve) {
          dVal = this.查表查x(i / (dPoints.length - 1), this._y查表);
        } else {
          dVal = dPoints.length === 1 ? 0.5 : i / (dPoints.length - 1);
        }
        let dStr = dVal.toFixed(2);
        if (dStr.endsWith("0")) dStr = dStr.slice(0, -1);
        ctx.save();
        ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const dotIdx = dStr.indexOf(".");
        if (dotIdx !== -1) {
          const intPart = dStr.slice(0, dotIdx);
          const dot = ".";
          const fracPart = dStr.slice(dotIdx + 1);
          const wAll = ctx.measureText(dStr).width;
          const wInt = ctx.measureText(intPart).width;
          const wDot = ctx.measureText(dot).width;
          let xStart = p.x - wAll / 2;
          ctx.fillStyle = this.样式.文字;
          ctx.fillText(intPart, xStart, p.y + 8);
          xStart += wInt;
          ctx.fillStyle = "#888";
          ctx.fillText(dot, xStart, p.y + 8);
          xStart += wDot + ((fracPart.length - 1) * wDot) / 2;
          ctx.fillStyle = this.样式.文字;
          ctx.fillText(fracPart, xStart, p.y + 8);
        } else {
          ctx.fillStyle = this.样式.文字;
          ctx.fillText(dStr, p.x, p.y + 8);
        }
        ctx.restore();
      }
    }
    ctx.restore();
    ctx.textAlign = "right";
    ctx.fillStyle = "lightskyblue";
    ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.fillText("时间", left - 8, tY);
    ctx.fillText("距离", left - 8, dY + 8);
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
    const sliderY = yBase + 30;
    ctx.save();
    // 滑块轨道：左侧高亮，右侧原色
    const trackY = sliderY + sliderH / 2 - 2;
    const trackH = 4;
    const highlightColor = "#6ac69d"; // 高亮色（金色）
    const min = 2,
      max = 20;
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
    ctx.fillStyle = "lightslategray";
    ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("采样数量", sliderX - 18, sliderY + sliderH / 2 + 6);
    // 数字
    ctx.fillStyle = "lightsteelblue";
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
    const yLines = 6;
    const yStep = 1 / (yLines - 1);
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
      let text;
      if (this.归一化刻度) {
        text = ny.toFixed(1);
        if (text === "1.0") text = "1";
      } else {
        // 非归一化时显示实际值（0-100）
        const actualValue = ny * 100;
        text = actualValue.toFixed(0);
      }
      ctx.fillText(text, area.左 - 6, y);
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
    ctx.fillText("变化", area.右 + 8, area.底);
    ctx.fillStyle = 刻度数字颜色;
    ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("0", area.左 - 4, area.底 + 15);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    let endText;
    if (this.归一化刻度) {
      endText = "1";
    } else {
      endText = "100";
    }
    ctx.fillText(endText, area.右, area.底 + 15);
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
      let text;
      if (this.归一化刻度) {
        text = frac.toFixed(1);
      } else {
        // 非归一化时显示实际值（0-100）
        const actualValue = frac * 100;
        text = actualValue.toFixed(0);
      }
      ctx.fillText(text, x, area.底 + 15);
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
      // 复选框悬停检测
      const 复选框区域 = this.复选框区域;
      const 复选框悬停 =
        复选框区域 &&
        x >= 复选框区域.整体.左 &&
        x <= 复选框区域.整体.右 &&
        y >= 复选框区域.整体.顶 &&
        y <= 复选框区域.整体.底;

      // 更新状态
      this.状态.滑块悬停 = sliderHot;
      this.状态.悬停 = found;

      // 更新复选框悬停状态
      if (复选框悬停 !== this.悬停的复选框) {
        this.悬停的复选框 = 复选框悬停;
      }

      // 优先设置光标样式
      if (复选框悬停) {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
      } else if (sliderHot || this.状态.滑块拖拽) {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
      } else {
        this.canvas.style.cursor = found ? this.光标样式.拖拽 : this.光标样式.默认;
      }

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

    // 复选框事件处理
    this.canvas.addEventListener("click", (e) => {
      this.获取鼠标坐标(e);
      this.检测复选框点击(this.鼠标坐标.x, this.鼠标坐标.y);
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

  获取鼠标坐标(e) {
    const x = e.clientX - this.边界矩形.left;
    const y = e.clientY - this.边界矩形.top;
    this.鼠标坐标 = { x, y };
    return { x, y };
  }

  绘制复选框() {
    const ctx = this.ctx;
    const 复选框区域 = this.复选框区域;
    if (!复选框区域) return;

    const { 复选框, 文本 } = 复选框区域;
    const 选中 = this.归一化刻度;
    const 悬停 = this.悬停的复选框;

    // 绘制复选框背景
    if (选中) {
      ctx.fillStyle = "#263446ff";
    } else if (悬停) {
      ctx.fillStyle = "#263446ff";
    } else {
      ctx.fillStyle = "#192330ff";
    }
    ctx.beginPath();
    ctx.roundRect(复选框.左, 复选框.顶, 20, 20, 3);
    ctx.fill();

    // 绘制复选框边框
    ctx.strokeStyle = 选中 ? "#41785fff" : 悬停 ? "#aaa" : "#374151";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(复选框.左, 复选框.顶, 20, 20, 3);
    ctx.stroke();

    // 绘制复选框内的勾选标记
    if (选中) {
      ctx.strokeStyle = "#6ac69d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(复选框.左 + 4, 复选框.顶 + 10);
      ctx.lineTo(复选框.左 + 9, 复选框.顶 + 14);
      ctx.lineTo(复选框.左 + 16, 复选框.顶 + 5);
      ctx.stroke();
    }

    // 绘制文本
    ctx.fillStyle = 悬停 || 选中 ? "white" : "silver";
    ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("归一", 复选框.左 + 26, 复选框.顶 + 10);
  }

  检测复选框点击(x, y) {
    const 复选框区域 = this.复选框区域;
    if (!复选框区域) return;

    if (x >= 复选框区域.整体.左 && x <= 复选框区域.整体.右 && y >= 复选框区域.整体.顶 && y <= 复选框区域.整体.底) {
      this.归一化刻度 = !this.归一化刻度;
      this.保存设置();
      this.绘制();
    }
  }

  检测复选框悬停(x, y) {
    const 复选框区域 = this.复选框区域;
    if (!复选框区域) return;

    const isHovering =
      x >= 复选框区域.整体.左 && x <= 复选框区域.整体.右 && y >= 复选框区域.整体.顶 && y <= 复选框区域.整体.底;

    if (isHovering !== this.悬停的复选框) {
      this.悬停的复选框 = isHovering;
      this.canvas.style.cursor = isHovering
        ? 'url("/Images/Common/鼠标-指向.cur"), pointer'
        : 'url("/Images/Common/鼠标-默认.cur"), auto';
      this.绘制();
    }
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
    if (!this.在视口内) return;
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

class 匀加速 {
  constructor() {
    this.canvas = document.querySelector("#canvas-匀加速");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.cssWidth = this.canvas.clientWidth;
    this.cssHeight = this.canvas.clientHeight;
    this.canvas.width = this.cssWidth * this.dpr;
    this.canvas.height = this.cssHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.在视口内 = false;
    this.边界矩形 = this.canvas.getBoundingClientRect();
    this.鼠标坐标 = { x: 0, y: 0 };
    this.鼠标已按下 = false;
    this.拖拽中 = false;
    this.状态 = {
      悬停: null,
      拖拽: null,
      拖拽偏移: null,
    };
    this.按键状态 = {
      a: false,
      d: false,
    };
    this.按键 = null;
    this.方向 = 1;
    this.加速度 = 50;
    this.加速用时 = 1000;
    this.速度 = 0;
    this.最高速度 = 250;
    this.位置 = 0;
    this.累积时间差 = 0;
    this.速度映射表 = null;
    this.rafId = null;
    this.加速开始时间 = null;
    this.上次时间 = performance.now();
    this.显示模式 = "映射表"; // 默认显示映射表
    this.单选按钮区域 = [];
    this.悬停的按钮 = null; // 跟踪当前悬停的按钮
    this.归一化刻度 = false; // 默认不使用归一化刻度
    this.复选框区域 = null; // 复选框区域
    this.悬停的复选框 = false; // 跟踪复选框悬停状态

    this.滑块配置 = {
      左边距: 20,
      顶边距: 20,
      滑块高度: 25,
      滑块间距: 5,
      数值宽度: 60,
      滑块轨道高度: 8,
      滑块thumb宽度: 6,
      滑块thumb高度: 20,
      滑块thumb圆角: 4,
    };

    this.滑块数据 = [
      {
        id: "最高速度",
        标题: "最高速度",
        最小值: 100,
        最大值: 500,
        当前值: 250,
        单位: "px/s",
        类型: "滑块",
        步长: 5,
      },
      {
        id: "加速用时",
        标题: "加速用时",
        最小值: 500,
        最大值: 5000,
        当前值: 2000,
        单位: "ms",
        类型: "滑块",
        步长: 50,
      },
      {
        id: "加速度",
        标题: "加速度",
        当前值: 0,
        单位: "px/s²",
        类型: "计算",
      },
      {
        id: "当前速度",
        标题: "当前速度",
        当前值: 0,
        单位: "px/s",
        类型: "计算",
      },
      {
        id: "采样数量",
        标题: "采样数量",
        最小值: 2,
        最大值: 60,
        当前值: 30,
        单位: "",
        类型: "滑块",
        步长: 1,
      },
    ];

    this.汽车 = {
      x: 0,
      y: this.cssHeight - 56 / this.dpr,
      width: 84 / this.dpr,
      height: 56 / this.dpr,
      src: "/Images/Blogs/Canvas API/缓动动画/汽车-精灵图.png",
      img: new Image(),
      已加载: false,
    };
    this.汽车.img.src = this.汽车.src;
    this.汽车.img.onload = () => {
      this.汽车.已加载 = true;
      this.绘制汽车();
    };

    this.滑块区域 = [];
    this.读取设置();
    this.计算滑块区域();
    this.生成速度映射表();

    this.绑定事件();
    this.绘制();
    this.开始动画();
  }

  绑定事件() {
    this.canvas.addEventListener("mousemove", (e) => {
      const 坐标 = this.获取鼠标坐标(e);
      this.鼠标坐标.x = 坐标.x;
      this.鼠标坐标.y = 坐标.y;

      if (this.状态.拖拽) {
        this.更新滑块值(this.状态.拖拽, 坐标.x);
        this.绘制();
      } else {
        const 悬停结果 = this.检测滑块悬停(坐标.x, 坐标.y);
        if (悬停结果 !== this.状态.悬停) {
          this.状态.悬停 = 悬停结果;
          this.绘制();
        }
      }
    });

    this.canvas.addEventListener("mousedown", (e) => {
      this.鼠标已按下 = true;
      const 坐标 = this.获取鼠标坐标(e);
      const 悬停结果 = this.检测滑块悬停(坐标.x, 坐标.y);

      if (悬停结果) {
        const { 类型, 滑块id, 滑块区域 } = 悬停结果;

        if (类型 === "轨道") {
          // 当鼠标悬停在轨道上按下时，thumb圆心跳到鼠标坐标位置
          this.更新滑块值(滑块id, 坐标.x);
          // 重新获取更新后的滑块区域
          const 更新后的滑块区域 = this.滑块区域.find((s) => s.滑块.id === 滑块id);
          if (更新后的滑块区域) {
            this.状态.拖拽 = 滑块id;
            // 基于新的thumb位置计算拖拽偏移量
            this.状态.拖拽偏移 = {
              x: 坐标.x - 更新后的滑块区域.thumb.中心x,
              y: 坐标.y - 更新后的滑块区域.thumb.中心y,
            };
            this.绘制();
          }
        } else if (类型 === "thumb") {
          // 当鼠标悬停在thumb上按下时，正常拖拽
          this.状态.拖拽 = 滑块id;
          this.状态.拖拽偏移 = {
            x: 坐标.x - 滑块区域.thumb.中心x,
            y: 坐标.y - 滑块区域.thumb.中心y,
          };
          this.绘制();
        }
      }
    });

    window.addEventListener("mouseup", (e) => {
      if (this.状态.拖拽) {
        this.状态.拖拽 = null;
        this.状态.拖拽偏移 = null;
        this.绘制();
      }
      this.鼠标已按下 = false;
    });

    const debouncedResize = this.防抖(() => {
      this.刷新边界矩形();
      this.初始化尺寸();
      this.计算滑块区域();
      this.绘制();
    }, 50);
    window.addEventListener("resize", debouncedResize);
    window.addEventListener("scroll", this.刷新边界矩形.bind(this));
    window.addEventListener("keydown", (e) => {
      if (e.key === "a") {
        this.按键状态.a = true;
      } else if (e.key === "d") {
        this.按键状态.d = true;
      }
      // 根据按键状态更新this.按键
      this.按键 = e.key;
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "a") {
        this.按键状态.a = false;
      } else if (e.key === "d") {
        this.按键状态.d = false;
      }
      // 根据按键状态更新this.按键
      if (this.按键状态.a && !this.按键状态.d) {
        this.按键 = "a";
      } else if (!this.按键状态.a && this.按键状态.d) {
        this.按键 = "d";
      } else {
        this.按键 = null;
      }
    });

    this.canvas.addEventListener("click", (e) => {
      const 坐标 = this.获取鼠标坐标(e);
      this.检测单选按钮点击(坐标.x, 坐标.y);
      this.检测复选框点击(坐标.x, 坐标.y);
    });

    this.canvas.addEventListener("mousemove", (e) => {
      const 坐标 = this.获取鼠标坐标(e);
      this.检测单选按钮悬停(坐标.x, 坐标.y);
      this.检测复选框悬停(坐标.x, 坐标.y);
    });
  }

  防抖(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  刷新边界矩形() {
    if (!this.在视口内) return;
    this.边界矩形 = this.canvas.getBoundingClientRect();
  }

  保存设置() {
    try {
      const 设置 = {
        加速度: this.加速度,
        最高速度: this.最高速度,
        加速用时: this.加速用时,
        显示模式: this.显示模式,
        归一化刻度: this.归一化刻度,
        滑块数据: this.滑块数据.map((滑块) => ({
          id: 滑块.id,
          当前值: 滑块.当前值,
        })),
      };
      sessionStorage.setItem("匀加速-设置", JSON.stringify(设置));
    } catch (e) {
      console.warn("保存匀加速设置失败", e);
    }
  }

  读取设置() {
    try {
      const raw = sessionStorage.getItem("匀加速-设置");
      if (!raw) return;
      const 设置 = JSON.parse(raw);
      if (!设置 || typeof 设置 !== "object") return;

      if (typeof 设置.加速度 === "number") {
        this.加速度 = 设置.加速度;
        this.滑块数据[0].当前值 = 设置.加速度;
      }
      if (typeof 设置.最高速度 === "number") {
        this.最高速度 = 设置.最高速度;
        this.滑块数据[1].当前值 = 设置.最高速度;
      }
      if (typeof 设置.加速用时 === "number") {
        this.加速用时 = 设置.加速用时;
        this.滑块数据[2].当前值 = 设置.加速用时;
      }

      if (Array.isArray(设置.滑块数据)) {
        设置.滑块数据.forEach((保存的滑块) => {
          const 滑块 = this.滑块数据.find((s) => s.id === 保存的滑块.id);
          if (滑块 && typeof 保存的滑块.当前值 === "number") {
            滑块.当前值 = 保存的滑块.当前值;
          }
        });
      }

      if (设置.显示模式 === "映射表" || 设置.显示模式 === "坐标轴") {
        this.显示模式 = 设置.显示模式;
      }

      if (typeof 设置.归一化刻度 === "boolean") {
        this.归一化刻度 = 设置.归一化刻度;
      }
    } catch (e) {
      console.warn("读取匀加速设置失败", e);
    }
  }

  初始化尺寸() {
    this.cssWidth = this.canvas.clientWidth;
    this.cssHeight = this.canvas.clientHeight;
    this.canvas.width = this.cssWidth * this.dpr;
    this.canvas.height = this.cssHeight * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.计算滑块区域();
  }

  计算标题宽度() {
    const ctx = this.ctx;
    ctx.font = "13px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    const 测量结果 = ctx.measureText("最高速度");
    return 测量结果.width;
  }

  计算滑块区域() {
    this.滑块区域 = [];
    const { 左边距, 顶边距, 滑块高度, 滑块间距, 数值宽度 } = this.滑块配置;
    const 标题宽度 = this.计算标题宽度();
    const 滑块轨道左 = 左边距 + 标题宽度 + 16;
    const 滑块轨道宽度 = 200;

    // 计算"最高速度"滑块的整体宽度
    // 包括：标题宽度 + 16px间距 + 滑块轨道宽度(200) + 16px间距 + 数值宽度(60)
    const 主滑块整体宽度 = 标题宽度 + 16 + 滑块轨道宽度 + 16 + 数值宽度;

    this.滑块数据.forEach((滑块, index) => {
      let 滑块顶 = 顶边距;
      let 滑块轨道顶;
      let 滑块轨道左调整 = 滑块轨道左;
      let 标题位置x = 左边距 + 标题宽度;

      // 根据滑块ID设置不同的位置
      if (滑块.id === "最高速度") {
        滑块顶 = 顶边距;
      } else if (滑块.id === "加速用时") {
        滑块顶 = 顶边距 + (滑块高度 + 滑块间距);
      } else if (滑块.id === "采样数量") {
        滑块顶 = 顶边距 + 2 * (滑块高度 + 滑块间距);
      } else if (滑块.id === "加速度") {
        // 加速度整体放到最高速度滑块整体的右方，加上主滑块整体宽度
        滑块顶 = 顶边距;
        滑块轨道左调整 = 滑块轨道左 + 主滑块整体宽度 + 75;
        标题位置x = 滑块轨道左调整 - 16;
      } else if (滑块.id === "当前速度") {
        // 当前速度整体放到加速用时滑块整体的右方，加上主滑块整体宽度
        滑块顶 = 顶边距 + (滑块高度 + 滑块间距);
        滑块轨道左调整 = 滑块轨道左 + 主滑块整体宽度 + 75;
        标题位置x = 滑块轨道左调整 - 16;
      }

      滑块轨道顶 = 滑块顶 + (滑块高度 - this.滑块配置.滑块轨道高度) / 2;
      let thumb中心x = 滑块轨道左调整;
      let thumb中心y = 滑块轨道顶 + this.滑块配置.滑块轨道高度 / 2;

      // 只对滑块类型计算进度和thumb位置
      if (滑块.类型 === "滑块") {
        const 进度 = (滑块.当前值 - 滑块.最小值) / (滑块.最大值 - 滑块.最小值);
        thumb中心x = 滑块轨道左调整 + 进度 * 滑块轨道宽度;
      }

      // 为计算类型的滑块设置不同的数值位置
      const 数值位置x = 滑块.类型 === "计算" ? 滑块轨道左调整 : 滑块轨道左调整 + 滑块轨道宽度 + 16;

      this.滑块区域.push({
        滑块,
        区域: {
          左: 滑块轨道左调整,
          右: 滑块轨道左调整 + 滑块轨道宽度,
          顶: 滑块顶,
          底: 滑块顶 + 滑块高度,
        },
        轨道: {
          左: 滑块轨道左调整,
          右: 滑块轨道左调整 + 滑块轨道宽度,
          顶: 滑块轨道顶,
          高: this.滑块配置.滑块轨道高度,
        },
        thumb: {
          中心x: thumb中心x,
          中心y: thumb中心y,
          宽: this.滑块配置.滑块thumb宽度,
          高: this.滑块配置.滑块thumb高度,
          圆角: this.滑块配置.滑块thumb圆角,
        },
        标题位置: {
          x: 标题位置x,
          y: 滑块顶 + 滑块高度 / 2,
        },
        数值位置: {
          x: 数值位置x,
          y: 滑块顶 + 滑块高度 / 2,
        },
      });
    });

    // 计算单选按钮区域
    this.计算单选按钮区域();
    // 计算复选框区域
    this.计算复选框区域();
  }

  计算复选框区域() {
    const 复选框宽度 = 20;
    const 复选框高度 = 20;
    const 文本宽度 = 40;
    const 总宽度 = 复选框宽度 + 文本宽度;
    const 绘制区域 = {
      x: 45,
      y: 140,
      width: this.cssWidth - 90,
      height: this.cssHeight - 240,
    };

    // 复选框位置：垂直靠上，水平居中
    this.复选框区域 = {
      复选框: {
        左: 绘制区域.x + (绘制区域.width - 总宽度) / 2,
        右: 绘制区域.x + (绘制区域.width - 总宽度) / 2 + 复选框宽度,
        顶: 绘制区域.y + 10,
        底: 绘制区域.y + 10 + 复选框高度,
      },
      文本: {
        左: 绘制区域.x + (绘制区域.width - 总宽度) / 2 + 复选框宽度,
        右: 绘制区域.x + (绘制区域.width - 总宽度) / 2 + 总宽度,
        顶: 绘制区域.y + 10,
        底: 绘制区域.y + 10 + 复选框高度,
      },
      整体: {
        左: 绘制区域.x + (绘制区域.width - 总宽度) / 2,
        右: 绘制区域.x + (绘制区域.width - 总宽度) / 2 + 总宽度,
        顶: 绘制区域.y + 10,
        底: 绘制区域.y + 10 + 复选框高度,
      },
    };
  }

  计算单选按钮区域() {
    this.单选按钮区域 = [];
    const 右边距 = 20;
    const 顶边距 = 20;
    const 按钮宽度 = 80;
    const 按钮高度 = 25;
    const 按钮间距 = 10;

    // 映射表按钮
    this.单选按钮区域.push({
      id: "映射表",
      区域: {
        左: this.cssWidth - 右边距 - 按钮宽度,
        右: this.cssWidth - 右边距,
        顶: 顶边距,
        底: 顶边距 + 按钮高度,
      },
    });

    // 坐标轴按钮
    this.单选按钮区域.push({
      id: "坐标轴",
      区域: {
        左: this.cssWidth - 右边距 - 按钮宽度,
        右: this.cssWidth - 右边距,
        顶: 顶边距 + 按钮高度 + 1.5,
        底: 顶边距 + 按钮高度 * 2 + 1.5,
      },
    });
  }

  检测单选按钮点击(x, y) {
    for (const 按钮 of this.单选按钮区域) {
      const { 区域, id } = 按钮;
      if (x >= 区域.左 && x <= 区域.右 && y >= 区域.顶 && y <= 区域.底) {
        if (this.显示模式 !== id) {
          this.显示模式 = id;
          this.保存设置();
          this.绘制();
        }
        break;
      }
    }
  }

  检测单选按钮悬停(x, y) {
    let 新的悬停按钮 = null;

    for (const 按钮 of this.单选按钮区域) {
      const { 区域, id } = 按钮;
      if (x >= 区域.左 && x <= 区域.右 && y >= 区域.顶 && y <= 区域.底) {
        新的悬停按钮 = id;
        break;
      }
    }

    // 如果悬停状态发生变化，重新绘制
    if (this.悬停的按钮 !== 新的悬停按钮) {
      this.悬停的按钮 = 新的悬停按钮;
      this.绘制();
    }

    if (新的悬停按钮) {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
    } else {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
    }
  }

  检测复选框点击(x, y) {
    if (!this.复选框区域) return;
    const { 整体 } = this.复选框区域;
    if (x >= 整体.左 && x <= 整体.右 && y >= 整体.顶 && y <= 整体.底) {
      this.归一化刻度 = !this.归一化刻度;
      this.保存设置();
      this.绘制();
    }
  }

  检测复选框悬停(x, y) {
    if (!this.复选框区域) return;
    const { 整体 } = this.复选框区域;
    const 新的悬停状态 = x >= 整体.左 && x <= 整体.右 && y >= 整体.顶 && y <= 整体.底;

    if (this.悬停的复选框 !== 新的悬停状态) {
      this.悬停的复选框 = 新的悬停状态;
      this.绘制();
    }

    if (新的悬停状态) {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
    }
  }

  检测滑块悬停(x, y) {
    for (const 滑块区域 of this.滑块区域) {
      const { 区域, thumb, 轨道, 滑块 } = 滑块区域;

      // 只对滑块类型进行悬停检测
      if (滑块.类型 !== "滑块") continue;

      // 首先检测是否悬停在thumb上（左右各加入5的容差）
      const 容差 = 5;
      const thumb左 = thumb.中心x - thumb.宽 / 2 - 容差;
      const thumb右 = thumb.中心x + thumb.宽 / 2 + 容差;
      const thumb顶 = thumb.中心y - thumb.高 / 2;
      const thumb底 = thumb.中心y + thumb.高 / 2;

      if (x >= thumb左 && x <= thumb右 && y >= thumb顶 && y <= thumb底) {
        return { 类型: "thumb", 滑块id: 滑块.id, 滑块区域 };
      }

      // 然后检测是否悬停在轨道上（增加上下容差各5像素）
      const 轨道容差 = 5;
      if (x >= 轨道.左 && x <= 轨道.右 && y >= 轨道.顶 - 轨道容差 && y <= 轨道.顶 + 轨道.高 + 轨道容差) {
        return { 类型: "轨道", 滑块id: 滑块.id, 滑块区域 };
      }
    }
    return null;
  }

  更新滑块值(滑块id, 鼠标x) {
    const 滑块区域 = this.滑块区域.find((s) => s.滑块.id === 滑块id);
    if (!滑块区域) return;
    const { 轨道, 滑块 } = 滑块区域;
    if (滑块.类型 !== "滑块") return;
    let 实际鼠标x = 鼠标x;
    if (this.状态.拖拽偏移) {
      实际鼠标x = 鼠标x - this.状态.拖拽偏移.x;
    }

    const 相对位置 = Math.max(0, Math.min(1, (实际鼠标x - 轨道.左) / (轨道.右 - 轨道.左)));
    let 新值 = 滑块.最小值 + 相对位置 * (滑块.最大值 - 滑块.最小值);

    if (滑块.步长) {
      新值 = Math.round(新值 / 滑块.步长) * 滑块.步长;
      新值 = Math.max(滑块.最小值, Math.min(滑块.最大值, 新值));
    }

    滑块.当前值 = 新值;
    this.最高速度 = this.滑块数据[0].当前值;
    this.加速用时 = this.滑块数据[1].当前值;
    const 加速用时秒 = this.加速用时 / 1000;
    const 计算加速度 = this.最高速度 / 加速用时秒;
    this.加速度 = 计算加速度;
    this.滑块数据[2].当前值 = 计算加速度;
    this.滑块数据[3].当前值 = this.速度;

    this.保存设置();
    this.生成速度映射表();
    this.计算滑块区域();
  }

  生成速度映射表() {
    const 采样数量 = this.滑块数据[4].当前值;
    this.速度映射表 = [];
    for (let i = 0; i < 采样数量; i++) {
      const 进度 = i / (采样数量 - 1);
      const 时间 = 进度 * this.加速用时;
      const 速度 = Math.min(进度 * this.最高速度, this.最高速度);
      this.速度映射表.push({
        时间: 时间,
        速度: 速度,
      });
    }
    this.速度映射表索引 = 0;
    this.绘制(); // 速度映射表修改后重新绘制
  }

  开始动画(当前时间) {
    if (!当前时间) 当前时间 = performance.now();
    if (!this.上次时间) this.上次时间 = 当前时间;

    if (!this.速度映射表 || this.速度映射表.length === 0) {
      this.生成速度映射表();
    }

    const 当前运动方向 = this.速度 >= 0 ? 1 : -1;

    let 需要减速 = false;
    if (this.按键 === "a" && 当前运动方向 === 1 && this.速度 > 0) {
      需要减速 = true;
    } else if (this.按键 === "d" && 当前运动方向 === -1 && this.速度 < 0) {
      需要减速 = true;
    }

    // 记录当前方向是否改变
    const 方向改变 = (this.按键 === "a" && this.方向 !== -1) || (this.按键 === "d" && this.方向 !== 1);

    if (this.按键 === "a") {
      if (需要减速) {
        this.加速开始时间 = null;
      } else {
        this.方向 = -1;
        // 只有在方向改变或首次加速时重置加速开始时间
        if (!this.加速开始时间 || 方向改变) {
          // 计算当前累积时间差对应的时间点，作为新的加速开始时间
          // 这样可以保持加速进度的连续性
          this.加速开始时间 = 当前时间 - this.累积时间差;
        }
      }
    } else if (this.按键 === "d") {
      if (需要减速) {
        this.加速开始时间 = null;
      } else {
        this.方向 = 1;
        // 只有在方向改变或首次加速时重置加速开始时间
        if (!this.加速开始时间 || 方向改变) {
          // 计算当前累积时间差对应的时间点，作为新的加速开始时间
          // 这样可以保持加速进度的连续性
          this.加速开始时间 = 当前时间 - this.累积时间差;
        }
      }
    } else {
      // 当松开按键时，重置加速开始时间，停止加速
      // 这样可以确保只有在按键按下时才加速
      this.加速开始时间 = null;
    }

    if (this.加速开始时间) {
      // 计算累积时间差，确保不超过加速用时
      this.累积时间差 = Math.min(当前时间 - this.加速开始时间, this.加速用时);
    } else {
      const 单次时间差 = 当前时间 - this.上次时间;
      this.累积时间差 = Math.max(0, this.累积时间差 - 单次时间差);
    }

    if (需要减速 || !this.按键) {
      if (this.速度映射表索引 > 0 && this.累积时间差 <= this.速度映射表[this.速度映射表索引 - 1].时间) {
        this.速度映射表索引--;
      }
      this.速度映射表索引 = Math.max(0, this.速度映射表索引);
      const 速度大小 = this.速度映射表[this.速度映射表索引].速度;
      this.速度 = 速度大小 * 当前运动方向;
    } else {
      if (this.累积时间差 > this.速度映射表[this.速度映射表索引].时间) {
        this.速度映射表索引++;
      }
      this.速度映射表索引 = Math.min(this.速度映射表索引, this.速度映射表.length - 1);
      const 速度大小 = this.速度映射表[this.速度映射表索引].速度;
      this.速度 = 速度大小 * this.方向;
    }
    if (this.速度 !== 0) {
      const 新位置 = this.汽车.x + (this.速度 * (当前时间 - this.上次时间)) / 1000;
      const 左边界 = 0;
      const 右边界 = this.cssWidth - this.汽车.width;

      this.汽车.x = Math.max(左边界, Math.min(新位置, 右边界));

      if (this.汽车.x === 左边界 || this.汽车.x === 右边界) {
        this.速度 = 0;
        this.累积时间差 = 0;
        this.速度映射表索引 = 0;
      }
    }

    if (this.滑块数据[3]) {
      this.滑块数据[3].当前值 = this.速度;
      this.绘制();
    }

    this.擦除动画区域();
    this.绘制汽车();
    this.上次时间 = 当前时间;
    this.rafId = requestAnimationFrame(this.开始动画.bind(this));
  }

  擦除动画区域() {
    this.ctx.clearRect(0, this.汽车.y, this.cssWidth, this.汽车.y + this.汽车.height);
  }

  绘制汽车() {
    if (!this.汽车.已加载) return;
    const 图像实际宽度 = this.汽车.img.naturalWidth;
    const 图像实际高度 = this.汽车.img.naturalHeight;
    this.ctx.drawImage(
      this.汽车.img,
      0,
      this.方向 === 1 ? 0 : 图像实际高度 / 2,
      图像实际宽度,
      图像实际高度 / 2,
      this.汽车.x,
      this.汽车.y,
      this.汽车.width,
      this.汽车.height,
    );
  }

  绘制滑块() {
    const ctx = this.ctx;
    const { 滑块轨道高度, 滑块thumb宽度, 滑块thumb高度, 滑块thumb圆角 } = this.滑块配置;

    this.滑块区域.forEach((滑块区域, index) => {
      const { 滑块, 轨道, thumb, 标题位置, 数值位置, 区域 } = 滑块区域;
      const 悬停中 = this.状态.悬停 === 滑块.id;
      const 拖拽中 = this.状态.拖拽 === 滑块.id;

      ctx.save();

      ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "rgba(159, 225, 255, 1)";
      ctx.textAlign = "right";
      ctx.fillText(滑块.标题, 标题位置.x, 标题位置.y);

      if (滑块.类型 === "滑块") {
        ctx.fillStyle = "#374151";
        ctx.fillRect(轨道.左, 轨道.顶, 轨道.右 - 轨道.左, 轨道.高);

        const 进度 = (滑块.当前值 - 滑块.最小值) / (滑块.最大值 - 滑块.最小值);
        ctx.fillStyle = "#589f7fff";
        ctx.fillRect(轨道.左, 轨道.顶, 进度 * (轨道.右 - 轨道.左), 轨道.高);

        const 悬停在thumb上 = this.状态.悬停 && this.状态.悬停.类型 === "thumb" && this.状态.悬停.滑块id === 滑块.id;
        const 悬停在轨道上 = this.状态.悬停 && this.状态.悬停.类型 === "轨道" && this.状态.悬停.滑块id === 滑块.id;
        const 拖拽当前滑块 = this.状态.拖拽 === 滑块.id;

        if (悬停在thumb上 || 悬停在轨道上 || 拖拽当前滑块) {
          if (悬停在thumb上 || 拖拽当前滑块) {
            ctx.fillStyle = "#f59e0b";
          } else {
            ctx.fillStyle = "#6ac69d";
          }
          ctx.beginPath();
          ctx.roundRect(thumb.中心x - thumb.宽 / 2, thumb.中心y - thumb.高 / 2, thumb.宽, thumb.高, 滑块thumb圆角);
          ctx.fill();
        }
      }

      ctx.textAlign = "left";
      let 当前值文本;
      let 整数部分,
        小数部分,
        有小数点 = false;

      if (滑块.类型 === "计算") {
        const 两位小数 = 滑块.当前值.toFixed(2);
        if (两位小数.endsWith(".00")) {
          当前值文本 = Math.round(滑块.当前值).toString();
        } else if (两位小数.endsWith("0")) {
          当前值文本 = 滑块.当前值.toFixed(1);
        } else {
          当前值文本 = 两位小数;
        }

        if (当前值文本.includes(".")) {
          [整数部分, 小数部分] = 当前值文本.split(".");
          有小数点 = true;
        } else {
          整数部分 = 当前值文本;
          小数部分 = "";
        }
      } else {
        当前值文本 = `${Math.round(滑块.当前值)}`;
        整数部分 = 当前值文本;
        小数部分 = "";
      }

      const 单位文本 = 滑块.单位;
      let 总宽度;

      // 处理负号的颜色
      let 负号 = "";
      let 整数部分无符号 = 整数部分;
      if (整数部分.startsWith("-")) {
        负号 = "-";
        整数部分无符号 = 整数部分.slice(1);
      }

      // 绘制负号（如果有）
      if (负号) {
        ctx.fillStyle = "lightslategray";
        ctx.fillText(负号, 数值位置.x, 数值位置.y);
        总宽度 = ctx.measureText(负号).width + 1;

        // 绘制整数部分（无符号）
        ctx.fillStyle = "#cde";
        ctx.fillText(整数部分无符号, 数值位置.x + 总宽度, 数值位置.y);
        总宽度 += ctx.measureText(整数部分无符号).width;
      } else {
        ctx.fillStyle = "#cde";
        ctx.fillText(整数部分, 数值位置.x, 数值位置.y);
        总宽度 = ctx.measureText(整数部分).width;
      }
      if (有小数点) {
        ctx.fillStyle = "gray";
        ctx.fillText(".", 数值位置.x + 总宽度, 数值位置.y);
        总宽度 += ctx.measureText(".").width;

        ctx.fillStyle = "#cde";
        ctx.fillText(小数部分, 数值位置.x + 总宽度, 数值位置.y);
        总宽度 += ctx.measureText(小数部分).width;
      }

      const 单位位置x = 数值位置.x + 总宽度 + 4;
      let 单位绘制位置x = 单位位置x;

      for (const char of 单位文本) {
        if (char === "/") {
          ctx.fillStyle = "#789";
        } else {
          ctx.fillStyle = "darkgoldenrod";
        }
        ctx.fillText(char, 单位绘制位置x, 数值位置.y);
        单位绘制位置x += ctx.measureText(char).width;
      }

      ctx.restore();
    });
  }

  绘制() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.ctx.fillStyle = "#0b1220";
    this.ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);

    this.绘制滑块();
    this.绘制单选按钮();

    if (this.显示模式 === "映射表") {
      this.绘制速度映射表();
    } else if (this.显示模式 === "坐标轴") {
      this.绘制坐标轴();
    }

    this.绘制汽车();
    this.绘制提示文本();
  }

  绘制提示文本() {
    if (this.速度 === 0 && !this.按键) {
      const ctx = this.ctx;
      ctx.save();
      ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";

      const 文本 = "按住 A 或 D 移动汽车";
      const 文本宽度 = ctx.measureText(文本).width;
      const 理想绘制X = this.汽车.x + this.汽车.width / 2;
      const 绘制Y = this.汽车.y - 10;

      // 计算边界调整后的绘制位置
      const 左边界 = 0;
      const 右边界 = this.cssWidth;
      let 实际绘制X = 理想绘制X;

      // 计算圆角矩形的位置和大小
      const 矩形边距 = 8;
      const 矩形高度 = 20;
      const 矩形顶 = 绘制Y - 矩形高度 + 3;
      const 矩形宽度 = 文本宽度 + 矩形边距 * 2;

      // 检查是否超出左边界
      if (理想绘制X - 文本宽度 / 2 < 左边界) {
        实际绘制X = 左边界 + 文本宽度 / 2 + 矩形边距;
      }
      // 检查是否超出右边界
      if (理想绘制X + 文本宽度 / 2 > 右边界) {
        实际绘制X = 右边界 - 文本宽度 / 2 - 矩形边距;
      }

      const 矩形左 = 实际绘制X - 文本宽度 / 2 - 矩形边距;

      // 绘制圆角矩形底色
      ctx.fillStyle = "rgba(22, 30, 46, 0.8)";
      ctx.strokeStyle = "#fff2";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(矩形左, 矩形顶, 矩形宽度, 矩形高度, 0);
      ctx.fill();
      ctx.stroke();

      // 分段绘制文本
      const 第一部分 = "按住 ";
      const 第二部分 = "A";
      const 第三部分 = " 或 ";
      const 第四部分 = "D";
      const 第五部分 = " 移动汽车";

      let 当前X = 实际绘制X - 文本宽度 / 2;

      // 绘制第一部分
      ctx.fillStyle = "#e5e7eb";
      ctx.fillText(第一部分, 当前X + ctx.measureText(第一部分).width / 2, 绘制Y);
      当前X += ctx.measureText(第一部分).width;

      // 绘制第二部分（A）
      ctx.fillStyle = "#60a5fa";
      ctx.fillText(第二部分, 当前X + ctx.measureText(第二部分).width / 2, 绘制Y);
      当前X += ctx.measureText(第二部分).width;

      // 绘制第三部分
      ctx.fillStyle = "#e5e7eb";
      ctx.fillText(第三部分, 当前X + ctx.measureText(第三部分).width / 2, 绘制Y);
      当前X += ctx.measureText(第三部分).width;

      // 绘制第四部分（D）
      ctx.fillStyle = "#60a5fa";
      ctx.fillText(第四部分, 当前X + ctx.measureText(第四部分).width / 2, 绘制Y);
      当前X += ctx.measureText(第四部分).width;

      // 绘制第五部分
      ctx.fillStyle = "#e5e7eb";
      ctx.fillText(第五部分, 当前X + ctx.measureText(第五部分).width / 2, 绘制Y);

      ctx.restore();
    }
  }

  绘制单选按钮() {
    const ctx = this.ctx;

    this.单选按钮区域.forEach((按钮) => {
      const { id, 区域 } = 按钮;
      const 选中 = this.显示模式 === id;
      const 悬停 = this.悬停的按钮 === id;

      // 绘制按钮背景
      if (选中) {
        ctx.fillStyle = "#263446ff";
      } else if (悬停) {
        ctx.fillStyle = "#263446ff";
      } else {
        ctx.fillStyle = "#192330ff";
      }
      ctx.beginPath();
      ctx.roundRect(区域.左, 区域.顶, 区域.右 - 区域.左, 区域.底 - 区域.顶, 0);
      ctx.fill();

      // 绘制按钮边框
      if (选中) {
        ctx.strokeStyle = "#6ac69d";
      } else {
        ctx.strokeStyle = "#374151";
      }
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(区域.左, 区域.顶, 区域.右 - 区域.左, 区域.底 - 区域.顶, 0);
      ctx.stroke();

      // 绘制按钮文本
      if (选中) {
        ctx.fillStyle = "#9ff9d0ff";
      } else if (悬停) {
        ctx.fillStyle = "white";
      } else {
        ctx.fillStyle = "silver";
      }
      ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(id, (区域.左 + 区域.右) / 2, (区域.顶 + 区域.底) / 2 + 1);
    });
  }

  绘制复选框() {
    if (!this.复选框区域 || this.显示模式 !== "坐标轴") return;

    const ctx = this.ctx;
    const { 复选框, 文本 } = this.复选框区域;
    const 选中 = this.归一化刻度;
    const 悬停 = this.悬停的复选框;

    // 绘制复选框背景
    if (选中) {
      ctx.fillStyle = "#263446ff";
    } else if (悬停) {
      ctx.fillStyle = "#263446ff";
    } else {
      ctx.fillStyle = "#192330ff";
    }
    ctx.beginPath();
    ctx.roundRect(复选框.左, 复选框.顶, 复选框.右 - 复选框.左, 复选框.底 - 复选框.顶, 3);
    ctx.fill();

    // 绘制复选框边框
    ctx.strokeStyle = 选中 ? "#41785fff" : 悬停 ? "#aaa" : "#374151";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(复选框.左, 复选框.顶, 复选框.右 - 复选框.左, 复选框.底 - 复选框.顶, 3);
    ctx.stroke();

    // 绘制复选框内的勾选标记
    if (选中) {
      ctx.strokeStyle = "#6ac69d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(复选框.左 + 4, 复选框.顶 + 10);
      ctx.lineTo(复选框.左 + 9, 复选框.顶 + 14);
      ctx.lineTo(复选框.左 + 16, 复选框.顶 + 5);
      ctx.stroke();
    }

    // 绘制文本
    ctx.fillStyle = 悬停 || 选中 ? "white" : "silver";
    ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("归一", 文本.左 + 8, (文本.顶 + 文本.底) / 2);
  }

  绘制坐标轴() {
    if (!this.速度映射表 || this.速度映射表.length === 0) return;

    const ctx = this.ctx;
    const 绘制区域 = {
      x: 45,
      y: 140,
      width: this.cssWidth - 90,
      height: this.cssHeight - 240,
    };

    // 绘制复选框
    this.绘制复选框();

    // 计算坐标轴范围（避免为 0 导致除零、路径 NaN；采样数为 2 时速度曲线为阶跃：先竖再横）
    const 最大时间 = this.速度映射表[this.速度映射表.length - 1].时间;
    const 最大速度 = this.最高速度;
    const 最大时间分母 = 最大时间 || 1;
    const 最大速度分母 = 最大速度 || 1;

    // 计算坐标轴刻度
    const 时间刻度数量 = 5;
    const 速度刻度数量 = 5;

    // 绘制坐标轴
    ctx.strokeStyle = "#4b5563";
    ctx.lineWidth = 2;

    // X轴
    ctx.beginPath();
    ctx.moveTo(绘制区域.x, 绘制区域.y + 绘制区域.height);
    ctx.lineTo(绘制区域.x + 绘制区域.width, 绘制区域.y + 绘制区域.height);
    ctx.stroke();

    // Y轴
    ctx.beginPath();
    ctx.moveTo(绘制区域.x, 绘制区域.y);
    ctx.lineTo(绘制区域.x, 绘制区域.y + 绘制区域.height);
    ctx.stroke();

    // 绘制经纬线（网格线）
    ctx.strokeStyle = "#ffffff15";
    ctx.lineWidth = 1;

    // 绘制垂直网格线（Y轴方向）
    for (let i = 0; i <= 时间刻度数量 * 2; i++) {
      const x = 绘制区域.x + (i / (时间刻度数量 * 2)) * 绘制区域.width;
      ctx.beginPath();
      ctx.moveTo(x, 绘制区域.y);
      ctx.lineTo(x, 绘制区域.y + 绘制区域.height);
      ctx.stroke();
    }

    // 绘制水平网格线（X轴方向）
    for (let i = 0; i <= 速度刻度数量 * 2; i++) {
      const y = 绘制区域.y + 绘制区域.height - (i / (速度刻度数量 * 2)) * 绘制区域.height;
      ctx.beginPath();
      ctx.moveTo(绘制区域.x, y);
      ctx.lineTo(绘制区域.x + 绘制区域.width, y);
      ctx.stroke();
    }

    // 绘制X轴刻度和标签
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "center";

    for (let i = 0; i <= 时间刻度数量; i++) {
      const 时间 = (i / 时间刻度数量) * 最大时间;
      const x = 绘制区域.x + (i / 时间刻度数量) * 绘制区域.width;

      // 绘制刻度线
      ctx.beginPath();
      ctx.moveTo(x, 绘制区域.y + 绘制区域.height);
      ctx.lineTo(x, 绘制区域.y + 绘制区域.height + 5);
      ctx.stroke();

      // 绘制标签，根据复选框状态显示归一化或实际数值
      let 标签文本;
      if (this.归一化刻度) {
        标签文本 = (时间 / 最大时间分母).toFixed(1);
        if (标签文本.endsWith(".0")) {
          标签文本 = 标签文本.slice(0, -2);
        }
      } else {
        标签文本 = 时间.toFixed(0);
      }
      ctx.fillText(标签文本, x, 绘制区域.y + 绘制区域.height + 16);
    }

    // 绘制Y轴刻度和标签
    ctx.textAlign = "right";

    for (let i = 0; i <= 速度刻度数量; i++) {
      const 速度 = (i / 速度刻度数量) * 最大速度;
      const y = 绘制区域.y + 绘制区域.height - (i / 速度刻度数量) * 绘制区域.height;

      // 绘制刻度线
      ctx.beginPath();
      ctx.moveTo(绘制区域.x - 5, y);
      ctx.lineTo(绘制区域.x, y);
      ctx.stroke();

      // 绘制标签，根据复选框状态显示归一化或实际数值
      let 标签文本;
      if (this.归一化刻度) {
        标签文本 = (速度 / 最大速度分母).toFixed(1);
        if (标签文本.endsWith(".0")) {
          标签文本 = 标签文本.slice(0, -2);
        }
      } else {
        标签文本 = 速度.toFixed(0);
      }
      ctx.fillText(标签文本, 绘制区域.x - 10, y);
    }

    // 计算行驶距离
    const 距离映射表 = [];
    let 累计距离 = 0;
    let 上次时间 = 0;

    this.速度映射表.forEach((项, index) => {
      if (index > 0) {
        const 时间差 = 项.时间 - 上次时间;
        const 平均速度 = (项.速度 + this.速度映射表[index - 1].速度) / 2;
        const 距离增量 = (平均速度 * 时间差) / 1000; // 转换为像素
        累计距离 += 距离增量;
      }
      距离映射表.push({ ...项, 距离: 累计距离 });
      上次时间 = 项.时间;
    });

    // 计算最大距离（2 个采样点时可能为 0，用分母避免除零）
    const 最大距离 = 距离映射表[距离映射表.length - 1].距离;
    const 最大距离分母 = 最大距离 || 1;

    // 绘制速度折线（阶跃：从原点先垂直到 Y=1，再水平到时间=1；与映射表阶跃语义一致）
    ctx.strokeStyle = "#61afef";
    ctx.lineWidth = 1;
    ctx.beginPath();

    this.速度映射表.forEach((项, index) => {
      const x = 绘制区域.x + (项.时间 / 最大时间分母) * 绘制区域.width;
      const y = 绘制区域.y + 绘制区域.height - (项.速度 / 最大速度分母) * 绘制区域.height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        const 上一项 = this.速度映射表[index - 1];
        const x上一 = 绘制区域.x + (上一项.时间 / 最大时间分母) * 绘制区域.width;
        ctx.lineTo(x上一, y); // 先竖线到当前速度
        ctx.lineTo(x, y);     // 再横线到当前时间
      }
    });

    ctx.stroke();

    // 绘制速度折线节点小圆
    ctx.fillStyle = "#61afef";
    this.速度映射表.forEach((项) => {
      const x = 绘制区域.x + (项.时间 / 最大时间分母) * 绘制区域.width;
      const y = 绘制区域.y + 绘制区域.height - (项.速度 / 最大速度分母) * 绘制区域.height;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 绘制距离折线
    ctx.strokeStyle = "#98c379";
    ctx.lineWidth = 1;
    ctx.beginPath();

    距离映射表.forEach((项, index) => {
      const x = 绘制区域.x + (项.时间 / 最大时间分母) * 绘制区域.width;
      const y = 绘制区域.y + 绘制区域.height - (项.距离 / 最大距离分母) * 绘制区域.height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // 绘制距离折线节点小圆
    距离映射表.forEach((项) => {
      const x = 绘制区域.x + (项.时间 / 最大时间分母) * 绘制区域.width;
      const y = 绘制区域.y + 绘制区域.height - (项.距离 / 最大距离分母) * 绘制区域.height;

      ctx.fillStyle = "#98c379";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 绘制实时位置指示器（根据当前时间进度）
    const 当前时间 = this.累积时间差;
    if (当前时间 >= 0 && 当前时间 <= 最大时间分母) {
      // 速度按阶跃：阶跃线在段 [t_i,t_{i+1}) 的高度是右端 v_{i+1}，黄圈用该高度才与曲线一致
      let 速度段左索引 = 0;
      for (let j = 0; j < this.速度映射表.length; j++) {
        if (this.速度映射表[j].时间 <= 当前时间) 速度段左索引 = j;
      }
      const 段速度 = this.速度映射表[Math.min(速度段左索引 + 1, this.速度映射表.length - 1)].速度;

      let 当前距离 = 0;
      for (let i = 1; i < 距离映射表.length; i++) {
        const 前一个 = 距离映射表[i - 1];
        const 当前 = 距离映射表[i];

        if (当前时间 >= 前一个.时间 && 当前时间 <= 当前.时间) {
          const 比例 = (当前.时间 - 前一个.时间) ? (当前时间 - 前一个.时间) / (当前.时间 - 前一个.时间) : 0;
          当前距离 = 前一个.距离 + (当前.距离 - 前一个.距离) * 比例;
          break;
        }
      }

      // 速度黄圈：初始在坐标轴原点；之后沿阶跃线移动
      const 速度X = 当前时间 === 0 ? 绘制区域.x : 绘制区域.x + (当前时间 / 最大时间分母) * 绘制区域.width;
      const 速度Y = 当前时间 === 0 ? 绘制区域.y + 绘制区域.height : 绘制区域.y + 绘制区域.height - (段速度 / 最大速度分母) * 绘制区域.height;

      // 计算距离指示器位置
      const 距离X = 绘制区域.x + (当前时间 / 最大时间分母) * 绘制区域.width;
      const 距离Y = 绘制区域.y + 绘制区域.height - (当前距离 / 最大距离分母) * 绘制区域.height;

      // 绘制速度指示器圆圈
      ctx.beginPath();
      ctx.arc(速度X, 速度Y, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "gold";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制距离指示器圆圈
      ctx.beginPath();
      ctx.arc(距离X, 距离Y, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "gold";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 绘制坐标轴标题
    ctx.fillStyle = "#d6b";
    ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "center";

    // X轴标题
    ctx.fillText("时间", 绘制区域.x + 绘制区域.width, 绘制区域.y + 绘制区域.height - 15);

    // Y轴标题
    ctx.textAlign = "left";
    ctx.fillText("变化", 绘制区域.x + 10, 绘制区域.y + 1);

    // 绘制图例
    ctx.textAlign = "left";
    ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";

    // 图例位置
    const 图例X = 绘制区域.x + 绘制区域.width - 120;
    const 图例Y = 绘制区域.y + 绘制区域.height - 280;
    const 图例间距 = 25;

    // 速度图例
    ctx.fillStyle = "#61afef";
    ctx.fillRect(图例X, 图例Y, 15, 15);
    ctx.fillStyle = "#d1d5db";
    ctx.fillText("速度", 图例X + 25, 图例Y + 9);

    // 距离图例
    ctx.fillStyle = "#98c379";
    ctx.fillRect(图例X, 图例Y + 图例间距, 15, 15);
    ctx.fillStyle = "#d1d5db";
    ctx.fillText("距离", 图例X + 25, 图例Y + 图例间距 + 9);
  }

  绘制速度映射表() {
    if (!this.速度映射表 || this.速度映射表.length === 0) return;

    const ctx = this.ctx;
    const 绘制区域 = {
      x: 15,
      y: 120,
      width: this.cssWidth - 30,
      height: this.cssHeight - 220,
    };

    // 计算每一项的宽度，以"999.99: 999.99"为准
    ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    const 时间宽度 = ctx.measureText("999.99").width;
    const 冒号宽度 = ctx.measureText(":").width;
    const 速度宽度 = ctx.measureText("999.99").width;
    const 列间距 = 100;
    const 项宽度 = 时间宽度 + 2 + 冒号宽度 + 4 + 速度宽度 + 列间距; // 100是额外间距
    const 项高度 = 20; // 每项高度

    // 计算列数和行数
    const 行数 = 20;
    const 列数 = Math.max(1, Math.ceil(this.速度映射表.length / 行数));

    // 计算起始位置，使整体居中
    const 总宽度 = 列数 * 项宽度;
    const 总高度 = 行数 * 项高度;
    const 起始X = 绘制区域.x + (绘制区域.width - 总宽度) / 2;
    const 起始Y = 绘制区域.y + (绘制区域.height - 总高度) / 2;

    // 绘制每一列的标题
    for (let 列 = 0; 列 < 列数; 列++) {
      const 列X = 起始X + 列 * 项宽度 + 列间距 / 2;
      const 列Y = 起始Y;

      // 绘制"时间"和"速度"标题，对准各自列的中间
      ctx.fillStyle = "#d6B";
      ctx.textAlign = "center";
      ctx.fillText("时间", 列X + 时间宽度 / 2, 列Y);
      ctx.fillText("速度", 列X + 时间宽度 + 2 + 冒号宽度 + 4 + 速度宽度 / 2, 列Y);
    }

    // 绘制数据
    for (let i = 0; i < this.速度映射表.length; i++) {
      const 数据 = this.速度映射表[i];
      const 列 = Math.floor(i / 行数);
      const 行 = i % 行数;

      const X = 起始X + 列 * 项宽度 + 列间距 / 2;
      const Y = 起始Y + (行 + 1) * 项高度; // +1 是为了跳过标题行

      // 格式化时间和速度，最多保留2位小数，最后一位为0不绘制
      const 时间文本 = 数据.时间.toFixed(2).replace(/\.?0+$/, "");
      const 速度文本 = 数据.速度.toFixed(2).replace(/\.?0+$/, "");

      // 如果当前索引是速度映射表索引，绘制下方的矩形
      if (i === this.速度映射表索引) {
        ctx.fillStyle = "#def2";
        ctx.strokeStyle = "#defa";
        ctx.lineWidth = 1;
        const 矩形宽度 = 时间宽度 + 冒号宽度 + 30 + 速度宽度;
        const 矩形高度 = 20;
        ctx.fillRect(X - 12, Y - 12, 矩形宽度, 矩形高度);
        ctx.strokeRect(X - 12, Y - 12, 矩形宽度, 矩形高度);
      }

      // 绘制时间数值（蓝色），右对齐
      ctx.fillStyle = "#61afef";
      ctx.textAlign = "right";
      ctx.fillText(时间文本, X + 时间宽度, Y);

      // 绘制冒号（灰色），在时间数字右边+2px
      ctx.fillStyle = "#787c99";
      ctx.textAlign = "left";
      const 冒号X = X + 时间宽度 + 2;
      ctx.fillText(":", 冒号X, Y);

      // 绘制速度数值（绿色），在冒号右边+4px
      ctx.fillStyle = "#98c379";
      ctx.textAlign = "left";
      const 速度X = 冒号X + 冒号宽度 + 4;
      ctx.fillText(速度文本, 速度X, Y);
    }
  }

  获取鼠标坐标(e) {
    return {
      x: e.clientX - this.边界矩形.left,
      y: e.clientY - this.边界矩形.top,
    };
  }
}

const 启动 = () => {
  const 缓动动画对象 = new 缓动动画();
  const 映射关系对象 = new 映射关系();
  const 匀加速对象 = new 匀加速();
  对象集合.push(
    {
      对象: 缓动动画对象,
      canvas: 缓动动画对象.canvas,
    },
    {
      对象: 映射关系对象,
      canvas: 映射关系对象.canvas,
    },
    {
      对象: 匀加速对象,
      canvas: 匀加速对象.canvas,
    },
  );
};

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", 启动);
} else {
  启动();
}

const 观察器设置 = {
  threshold: 0.01,
};

const 观察器回调 = (entries) => {
  entries.forEach((entry) => {
    const canvas = entry.target;
    const obj = 对象集合.find((o) => o.canvas === canvas).对象;
    if (entry.isIntersecting) {
      obj.在视口内 = true;
      if ("开始动画" in obj) {
        obj.开始动画();
      }
    } else {
      obj.在视口内 = false;
      if (Object.hasOwn(obj, "rafId")) {
        cancelAnimationFrame(obj.rafId);
      }
    }
  });
};

const 观察器 = new IntersectionObserver(观察器回调, 观察器设置);
for (const 对象 of 对象集合) {
  观察器.observe(对象.canvas);
}
