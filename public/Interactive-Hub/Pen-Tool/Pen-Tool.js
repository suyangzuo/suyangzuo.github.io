const 根元素 = document.querySelector(":root");
const 根样式 = window.getComputedStyle(根元素);
const 光标样式 = {
  默认: 根样式.getPropertyValue("--光标-默认"),
  指向: 根样式.getPropertyValue("--光标-指向"),
  抓取: 根样式.getPropertyValue("--光标-拖拽"),
  抓住: "grabbing",
  移动: 根样式.getPropertyValue("--光标-移动"),
};

const 创建点 = (x, y) => ({ x, y });
const 拷贝点 = (p) => (p ? 创建点(p.x, p.y) : null);
const 点距离 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const 插值 = (a, b, t) => 创建点(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
const 确保柄 = (锚数据) => {
  if (!锚数据) return;
  if (!锚数据.入柄) 锚数据.入柄 = 创建点(锚数据.锚.x, 锚数据.锚.y);
  if (!锚数据.出柄) 锚数据.出柄 = 创建点(锚数据.锚.x, 锚数据.锚.y);
};

function 三次贝塞尔点(p0, p1, p2, p3, t) {
  const a = 插值(p0, p1, t);
  const b = 插值(p1, p2, t);
  const c = 插值(p2, p3, t);
  const d = 插值(a, b, t);
  const e = 插值(b, c, t);
  return 插值(d, e, t);
}

function 分割三次贝塞尔(p0, p1, p2, p3, t) {
  const a = 插值(p0, p1, t);
  const b = 插值(p1, p2, t);
  const c = 插值(p2, p3, t);
  const d = 插值(a, b, t);
  const e = 插值(b, c, t);
  const f = 插值(d, e, t);
  return {
    左: [p0, a, d, f],
    右: [f, e, c, p3],
    点: f,
  };
}

function 近似最近点和参数(p0, p1, p2, p3, 目标点, 采样数 = 48) {
  let 最短距离 = Infinity;
  let 最佳t = 0;
  for (let i = 0; i <=采样数; i++) {
    const t = i / 采样数;
    const pt = 三次贝塞尔点(p0, p1, p2, p3, t);
    const d = 点距离(pt, 目标点);
    if (d < 最短距离) {
      最短距离 = d;
      最佳t = t;
    }
  }
  const 最佳点 = 三次贝塞尔点(p0, p1, p2, p3, 最佳t);
  return { 距离: 最短距离, t: 最佳t, 点: 最佳点 };
}

class 钢笔工具 {
  constructor() {
    this.画布 = document.getElementById("canvas");
    this.上下文 = this.画布.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.曲线数据 = [];
    this.当前端点 = null;
    this.悬停 = { 点: null, 段索引: -1, 预览: null };
    this.拖拽 = null;
    this.ctrl按下 = false;
    this.最后鼠标 = null;
    this.容差 = 10;
    this.预览显示容差 = 9999; // 预览点绘制时使用较密采样实现几乎任意位置可添加
    this.样式 = {
      曲线: {
        默认: { 颜色: "rgb(114, 114, 114)", 线宽: 1.5 },
        悬停: { 颜色: "rgb(84, 135, 174)", 线宽: 2 },
        选中: { 颜色: "lightblue", 线宽: 2.5 },
      },
      锚点: {
        默认: "#88a",
        悬停: "#fff",
        选中: "#f66",
      },
    };
    this.重置画布();
    this.重置边界矩形();
    this.绑定事件();
    this.刷新();
  }

  绑定事件() {
    window.addEventListener("resize", () => {
      this.重置画布();
      this.重置边界矩形();
      this.刷新();
    });
    window.addEventListener("scroll", this.重置边界矩形.bind(this));

    window.addEventListener("keydown", (e) => {
      if (e.key === "Control") {
        this.ctrl按下 = true;
        if (this.悬停.预览) {
          this.悬停.预览 = null;
          this.刷新();
        }
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "Control") {
        this.ctrl按下 = false;
        if (this.最后鼠标) {
          this.更新悬停状态(this.最后鼠标, false);
        } else {
          this.刷新();
        }
      }
    });

    this.画布.addEventListener("mousedown", (e) => this.按下(e));
    this.画布.addEventListener("mousemove", (e) => this.移动(e));
    window.addEventListener("mouseup", (e) => this.抬起(e));
    this.画布.addEventListener("mouseleave", () => {
      if (!this.拖拽) this.悬停 = { 点: null, 段索引: -1, 预览: null };
      this.刷新();
    });
  }

  重置画布() {
    const { offsetWidth, offsetHeight } = this.画布;
    this.画布.width = offsetWidth * this.dpr;
    this.画布.height = offsetHeight * this.dpr;
    this.上下文.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  重置边界矩形() {
    this.边界矩形 = this.画布.getBoundingClientRect();
  }

  获取鼠标坐标(e) {
    return {
      x: (e.clientX - this.边界矩形.left) / (this.边界矩形.width / this.画布.offsetWidth),
      y: (e.clientY - this.边界矩形.top) / (this.边界矩形.height / this.画布.offsetHeight),
    };
  }

  刷新() {
    const ctx = this.上下文;
    ctx.clearRect(0, 0, this.画布.offsetWidth, this.画布.offsetHeight);

    const 正在创建 = !!this.准备段 || (this.拖拽 && this.拖拽.类型 === "新锚点");

    this.曲线数据.forEach((段, idx) => {
      if (this.段完整(段)) {
        ctx.save();
        const 悬停曲线 = this.悬停.段索引 === idx && this.悬停.点 === null && (this.悬停.预览 || this.ctrl按下);
        if (段.选中) {
          ctx.lineWidth = this.样式.曲线.选中.线宽;
          ctx.strokeStyle = this.样式.曲线.选中.颜色;
        } else if (悬停曲线) {
          ctx.lineWidth = this.样式.曲线.悬停.线宽;
          ctx.strokeStyle = this.样式.曲线.悬停.颜色;
        } else {
          ctx.lineWidth = this.样式.曲线.默认.线宽;
          ctx.strokeStyle = this.样式.曲线.默认.颜色;
        }
        ctx.beginPath();
        ctx.moveTo(段.p0.x, 段.p0.y);
        ctx.bezierCurveTo(段.p1.x, 段.p1.y, 段.p2.x, 段.p2.y, 段.p3.x, 段.p3.y);
        ctx.stroke();
        ctx.restore();
      }
      // 所有线段都绘制控制点与连线（非选中也显示）
      const 显示柄 = 正在创建 ? false : 段.选中;
      this.绘制控制线(段, 段.选中, 显示柄);
      this.绘制控制点(段, idx, 段.选中, 显示柄);
    });

    if (this.悬停.预览) {
      ctx.save();
      ctx.fillStyle = "#ff0";
      ctx.strokeStyle = "#ff0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.悬停.预览.x, this.悬停.预览.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 绘制正在编辑但尚未形成段的锚点及其控制柄/连线
    const 绘制锚数据 = (锚数据) => {
      if (!锚数据 || !锚数据.锚) return;
      // 连线
      ctx.save();
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1;
      if (锚数据.入柄) {
        ctx.beginPath();
        ctx.moveTo(锚数据.锚.x, 锚数据.锚.y);
        ctx.lineTo(锚数据.入柄.x, 锚数据.入柄.y);
        ctx.stroke();
      }
      if (锚数据.出柄) {
        ctx.beginPath();
        ctx.moveTo(锚数据.锚.x, 锚数据.锚.y);
        ctx.lineTo(锚数据.出柄.x, 锚数据.出柄.y);
        ctx.stroke();
      }
      ctx.restore();

      // 控制点（锚使用选中色，柄为蓝）
      const 画点 = (点, 颜色) => {
        if (!点) return;
        ctx.save();
        ctx.fillStyle = 颜色;
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(点.x, 点.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };
      画点(锚数据.锚, this.样式.锚点.选中);
      画点(锚数据.入柄, "#6cf");
      画点(锚数据.出柄, "#6cf");
    };

    // 若有正在准备的段，绘制两端的锚/柄；否则绘制当前端点
    if (this.准备段) {
      const 起 = this.准备段.起;
      const 止 = this.准备段.止;
      if (起?.锚 && 止?.锚) {
        const 起出 = 起.出柄 || 起.锚;
        const 止入 = 止.入柄 || 止.锚;
        // 先绘制预览曲线，避免遮挡锚点
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "#8cf";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(起.锚.x, 起.锚.y);
        ctx.bezierCurveTo(起出.x, 起出.y, 止入.x, 止入.y, 止.锚.x, 止.锚.y);
        ctx.stroke();
        ctx.restore();
      }
      绘制锚数据(起);
      绘制锚数据(止);
    } else if (this.当前端点) {
      绘制锚数据(this.当前端点);
    }
  }

  段完整(段) {
    return 段 && 段.p0 && 段.p1 && 段.p2 && 段.p3;
  }

  绘制控制线(段, 高亮, 显示柄 = true) {
    if (!显示柄) return;
    const ctx = this.上下文;
    ctx.save();
    ctx.strokeStyle = 高亮 ? "#777" : "#444";
    ctx.lineWidth = 高亮 ? 1.5 : 1;
    if (段.p0 && 段.p1) {
      ctx.beginPath();
      ctx.moveTo(段.p0.x, 段.p0.y);
      ctx.lineTo(段.p1.x, 段.p1.y);
      ctx.stroke();
    }
    if (段.p3 && 段.p2) {
      ctx.beginPath();
      ctx.moveTo(段.p3.x, 段.p3.y);
      ctx.lineTo(段.p2.x, 段.p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  绘制控制点(段, 段索引, 高亮, 显示柄 = true) {
    const 绘制 = (点, 类型, 悬停) => {
      if (!点) return;
      const ctx = this.上下文;
      ctx.save();
      if (类型 === "锚") {
        const anchorFill = 悬停
          ? this.样式.锚点.悬停
          : 高亮
          ? this.样式.锚点.选中
          : this.样式.锚点.默认;
        ctx.fillStyle = anchorFill;
      } else {
        const 基色 = "#6cf";
        ctx.fillStyle = 悬停 ? "#fff" : 高亮 ? 基色 : "#88a";
      }
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(点.x, 点.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    const hoverKey = this.悬停.点?.键;
    绘制(段.p0, "锚", this.悬停.点 && this.悬停.点.段索引 === 段索引 && hoverKey === "p0");
    绘制(段.p3, "锚", this.悬停.点 && this.悬停.点.段索引 === 段索引 && hoverKey === "p3");
    if (显示柄) {
      绘制(段.p1, "柄", this.悬停.点 && this.悬停.点.段索引 === 段索引 && hoverKey === "p1");
      绘制(段.p2, "柄", this.悬停.点 && this.悬停.点.段索引 === 段索引 && hoverKey === "p2");
    }
  }

  命中控制点(pos) {
    const 半径 = 8;
    for (let i = 0; i < this.曲线数据.length; i++) {
      const 段 = this.曲线数据[i];
      for (const 键 of ["p0", "p1", "p2", "p3"]) {
        const 点 = 段[键];
        if (!点) continue;
        if (点距离(pos, 点) <= 半径) return { 段索引: i, 键, 点 };
      }
    }
    return null;
  }

  命中曲线(pos, 采样数 = 48) {
    let 结果 = null;
    for (let i = 0; i < this.曲线数据.length; i++) {
      const 段 = this.曲线数据[i];
      if (!this.段完整(段)) continue;
      const { 距离, t, 点 } = 近似最近点和参数(段.p0,段.p1,段.p2,段.p3,pos, 采样数);
      if (距离 <= this.容差) {
        结果 = { 段索引: i, 距离, t, 点 };
        break;
      }
    }
    return 结果;
  }

  新建锚点(pos) {
    return { 锚: 创建点(pos.x, pos.y), 入柄: null, 出柄: null };
  }

  创建段(起锚, 止锚) {
    const 段 = {
      p0: 起锚.锚,
      p1: 起锚.出柄 ? 起锚.出柄 : 创建点(起锚.锚.x, 起锚.锚.y),
      p2: 止锚.入柄 ? 止锚.入柄 : 创建点(止锚.锚.x, 止锚.锚.y),
      p3: 止锚.锚,
      选中: true,
    };
    return 段;
  }

  设置端点柄(锚数据, 拖拽向量) {
    const 长度 = Math.hypot(拖拽向量.x, 拖拽向量.y);
    if (长度 < 1) {
      锚数据.入柄 = 创建点(锚数据.锚.x, 锚数据.锚.y);
      锚数据.出柄 = 创建点(锚数据.锚.x, 锚数据.锚.y);
      return;
    }
    const 入 = 创建点(锚数据.锚.x - 拖拽向量.x, 锚数据.锚.y - 拖拽向量.y);
    const 出 = 创建点(锚数据.锚.x + 拖拽向量.x, 锚数据.锚.y + 拖拽向量.y);
    锚数据.入柄 = 入;
    锚数据.出柄 = 出;
  }

  选中唯一(索引) {
    this.曲线数据.forEach((段, i) => {
      段.选中 = i === 索引;
    });
  }

  按下(e) {
    const pos = this.获取鼠标坐标(e);
    const hit点 = this.命中控制点(pos);
    const hit曲线 = this.命中曲线(pos);

    if (e.ctrlKey && hit曲线) {
      this.选中唯一(hit曲线.段索引);
      this.悬停 = { 点: null, 段索引: hit曲线.段索引, 预览: null };
      this.刷新();
      return;
    }

    if (hit点) {
      this.拖拽 = {
        类型: "控制点",
        段索引: hit点.段索引,
        键: hit点.键,
        起点: pos,
        初始: 拷贝点(hit点.点),
        移动量: { x: 0, y: 0 },
        点击删除候选: (hit点.键 === "p0" || hit点.键 === "p3") && !e.ctrlKey,
      };
      return;
    }

    if (hit曲线 && !e.ctrlKey) {
      // 点击曲线添加控制点（分割）
      this.分割曲线(hit曲线.段索引, hit曲线.t, hit曲线.点);
      this.刷新();
      return;
    }

    // 创建新的锚点/线段
    const 新锚 = this.新建锚点(pos);
    确保柄(新锚);
    this.拖拽 = {
      类型: "新锚点",
      锚数据: 新锚,
      is第一: !this.当前端点,
      起点: pos,
      移动量: { x: 0, y: 0 },
    };

    if (!this.当前端点) {
      this.当前端点 = 新锚;
    } else {
      确保柄(this.当前端点);
      // 预先创建段，柄待定
      this.准备段 = { 起: this.当前端点, 止: 新锚 };
    }
    // 立即刷新以显示首个控制点和连线
    this.刷新();
  }

  移动(e) {
    const pos = this.获取鼠标坐标(e);
    this.最后鼠标 = pos;
    this.ctrl按下 = e.ctrlKey;

    if (this.拖拽) {
      this.拖拽.移动量 = { x: pos.x - this.拖拽.起点.x, y: pos.y - this.拖拽.起点.y };
      if (this.拖拽.类型 === "控制点") {
        this.更新控制点位置(pos, e);
      }
      if (this.拖拽.类型 === "新锚点") {
        this.设置端点柄(this.拖拽.锚数据, this.拖拽.移动量);
        if (this.准备段) {
          // 对新终点设置柄，同时让起点柄保持原值
          this.准备段.止 = this.拖拽.锚数据;
        }
      }
      this.悬停 = { 点: null, 段索引: -1, 预览: null };
      this.刷新();
      return;
    }

    this.更新悬停状态(pos, e.ctrlKey);
  }

  更新悬停状态(pos, ctrlHeld) {
    // 先检测控制点，再检测曲线
    const hit点 = this.命中控制点(pos);
    if (hit点) {
      this.悬停 = { 点: hit点, 段索引: hit点.段索引, 预览: null };
      this.画布.style.cursor = 光标样式.指向;
    } else {
      const hit曲线 = this.命中曲线(pos, this.预览显示容差);
      if (hit曲线) {
        this.悬停 = { 点: null, 段索引: hit曲线.段索引, 预览: ctrlHeld ? null : hit曲线.点 };
        this.画布.style.cursor = 光标样式.指向;
      } else {
        this.悬停 = { 点: null, 段索引: -1, 预览: null };
        this.画布.style.cursor = 光标样式.默认;
      }
    }
    this.刷新();
  }

  抬起(e) {
    if (!this.拖拽) return;

    if (this.拖拽.类型 === "控制点") {
      if (Math.abs(this.拖拽.移动量.x) < 3 && Math.abs(this.拖拽.移动量.y) < 3 && this.拖拽.点击删除候选) {
        this.删除锚点(this.拖拽.段索引, this.拖拽.键);
      }
    }

    if (this.拖拽.类型 === "新锚点") {
      if (this.准备段) {
        const 段 = this.创建段(this.准备段.起, this.准备段.止);
        this.曲线数据.push(段);
        this.当前端点 = this.准备段.止;
        this.选中唯一(this.曲线数据.length - 1);
        this.准备段 = null;
      } else {
        // 第一锚点单独拖拽
        this.当前端点 = this.拖拽.锚数据;
      }
    }

    this.拖拽 = null;
    this.刷新();
  }

  更新控制点位置(pos, e) {
    const { 段索引, 键 } = this.拖拽;
    const 段 = this.曲线数据[段索引];
    if (!段) return;

    const 移动控制柄 = (锚, 目标点, 对侧柄, 镜像) => {
      if (!锚 || !目标点) return;
      目标点.x = pos.x;
      目标点.y = pos.y;
      if (镜像 && 对侧柄) {
        const 向量 = { x: 目标点.x - 锚.x, y: 目标点.y - 锚.y };
        const 长度 = Math.hypot(对侧柄.x - 锚.x, 对侧柄.y - 锚.y);
        if (长度 === 0) return;
        const 单位 = { x: 向量.x / Math.hypot(向量.x, 向量.y), y: 向量.y / Math.hypot(向量.x, 向量.y) };
        对侧柄.x = 锚.x - 单位.x * 长度;
        对侧柄.y = 锚.y - 单位.y * 长度;
      }
    };

    const 移动锚点 = (锚, 关联柄列表, 同步柄) => {
      const dx = pos.x - this.拖拽.起点.x;
      const dy = pos.y - this.拖拽.起点.y;
      锚.x = this.拖拽.初始.x + dx;
      锚.y = this.拖拽.初始.y + dy;
      if (同步柄) {
        关联柄列表.forEach((柄) => {
          if (!柄) return;
          柄.x += dx;
          柄.y += dy;
        });
      }
    };

    const ctrl = e.ctrlKey;
    const alt = e.altKey;

    if (键 === "p1") {
      const 前段 = this.曲线数据[段索引 - 1];
      const 共享锚 = 段.p0;
      const 对侧柄 = 前段 && 前段.p3 === 共享锚 ? 前段.p2 : null;
      移动控制柄(共享锚, 段.p1, 对侧柄, ctrl);
    } else if (键 === "p2") {
      const 后段 = this.曲线数据[段索引 + 1];
      const 共享锚 = 段.p3;
      const 对侧柄 = 后段 && 后段.p0 === 共享锚 ? 后段.p1 : null;
      移动控制柄(共享锚, 段.p2, 对侧柄, ctrl);
    } else if (键 === "p0") {
      const 关联柄 = [段.p1];
      // 同步相邻段的 p2（共享锚点的入柄）
      const 前段 = this.曲线数据[段索引 - 1];
      if (前段 && 前段.p3 ===段.p0) 关联柄.push(前段.p2);
      移动锚点(段.p0, 关联柄, !alt);
    } else if (键 === "p3") {
      const 关联柄 = [段.p2];
      const 后段 = this.曲线数据[段索引 + 1];
      if (后段 && 后段.p0 ===段.p3) 关联柄.push(后段.p1);
      移动锚点(段.p3, 关联柄, !alt);
    }
    this.拖拽.起点 = pos;
  }

  分割曲线(段索引, t, 点) {
    const 段 = this.曲线数据[段索引];
    if (!段 || !this.段完整(段)) return;
    const { 左, 右 } = 分割三次贝塞尔(段.p0, 段.p1,段.p2,段.p3, t);
    const 新锚 = 点;
    // 保证共享
    左[3] = 新锚;
    右[0] = 新锚;

    const 左段 = { p0: 左[0], p1: 左[1], p2: 左[2], p3: 左[3], 选中: true };
    const 右段 = { p0: 右[0], p1: 右[1], p2: 右[2], p3: 右[3], 选中: true };

    this.曲线数据.splice(段索引, 1, 左段, 右段);
    this.当前端点 = { 锚: 右段.p3, 入柄: 右段.p2, 出柄: 右段.p1 };
    this.选中唯一(段索引 + 1);
  }

  删除锚点(段索引, 键) {
    const 段 = this.曲线数据[段索引];
    if (!段) return;

    const 是开头 = 段索引 === 0 && 键 === "p0";
    const 是结尾 = 段索引 === this.曲线数据.length - 1 && 键 === "p3";
    if (是开头) {
      this.曲线数据.splice(0, 1);
      this.当前端点 = this.曲线数据.length ? { 锚: this.曲线数据[this.曲线数据.length - 1].p3 } : null;
      this.刷新();
      return;
    }
    if (是结尾) {
      this.曲线数据.pop();
      this.当前端点 = this.曲线数据.length ? { 锚: this.曲线数据[this.曲线数据.length - 1].p3 } : null;
      this.刷新();
      return;
    }

    // 中间锚点：合并前后段
    const 前段 = this.曲线数据[段索引 - 1];
    const 后段 = this.曲线数据[段索引 + 1];
    if (!前段 || !后段) return;
    const 合并段 = {
      p0: 前段.p0,
      p1: 前段.p1,
      p2: 后段.p2,
      p3: 后段.p3,
      选中: true,
    };
    this.曲线数据.splice(段索引 - 1, 3, 合并段);
    this.选中唯一(段索引 - 1);
    this.当前端点 = { 锚: 合并段.p3 };
    this.刷新();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new 钢笔工具();
});
