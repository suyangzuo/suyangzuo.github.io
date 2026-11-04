class 拉取演示动画 {
  constructor(canvasId, 画布高度 = 300) {
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
      远程渐变上: "#223a72ff",
      远程渐变下: "#20377cff",
      远程描边: "rgba(158,190,255,0.85)",
      远程文字: "#CFDCFF",
      按钮文字: "#98A2B7",
      按钮文字悬停: "#E9EDF8",
      按钮中文: "#6C768E",
      按钮中文悬停: "#96A1BA",
      加号: "#5A6478",
      加号悬停: "#6B768D",
      按钮选中文字: "#FFFFFF",
      按钮选中中文: "rgba(255,255,255,0.72)",
      加号选中: "rgba(255,255,255,0.42)",
      箭头: "#F5C542",
      箭头次要: "#6EC1E4",
    };

    // figure 无显式高度，这里固定画布 CSS 高度，避免 height:100% 塌陷
    this.canvas.style.height = `${画布高度}px`;

    // 动画状态
    this.模式 = "pull"; // "pull" | "fetchMerge"
    this.阶段 = 0; // pull: 0=绘制 1=停留; fetchMerge: 0=fetch绘制 1=等待 2=merge绘制 3=等待
    this.阶段开始时间 = 0;
    this.绘制时长 = 1000; // 1秒
    this.停顿时长 = 2000; // 2秒
    this.运行中 = true;
    this.鼠标X = -1;
    this.鼠标Y = -1;

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

  // 计算节点与按钮布局
  计算布局() {
    const 宽 = this.宽;
    const 高 = this.高;

    // 选项按钮：先量出英文文本宽度，再按可用宽度整体缩放
    this.ctx.font = `600 15px ${this.字体}`;
    const 英文1宽 = this.ctx.measureText("git pull").width;
    const 英文2宽 = this.ctx.measureText("git fetch + git merge").width;
    const 内边距 = 26;
    const 间距 = 14;
    const 原始总宽 = 英文1宽 + 内边距 * 2 + 间距 + 英文2宽 + 内边距 * 2;
    const 缩放 = Math.min(1, (宽 - 24) / 原始总宽);

    const 按钮高 = 60 * 缩放;
    const 按钮1宽 = (英文1宽 + 内边距 * 2) * 缩放;
    const 按钮2宽 = (英文2宽 + 内边距 * 2) * 缩放;
    const 按钮间距 = 间距 * 缩放;
    const 按钮起始X = (宽 - (按钮1宽 + 按钮间距 + 按钮2宽)) / 2;
    const 按钮Y = 14 + 15; // 整体下移 15px

    this.按钮字号 = 15 * 缩放;
    this.按钮中文号 = 12.5 * 缩放;
    this.按钮列表 = [
      {
        模式: "pull",
        英文: [{ 文本: "git pull" }],
        中文: [{ 文本: "拉取" }],
        x: 按钮起始X,
        y: 按钮Y,
        宽: 按钮1宽,
        高: 按钮高,
      },
      {
        模式: "fetchMerge",
        英文: [
          { 文本: "git fetch" },
          { 文本: " " },
          { 文本: "+", 加号: true },
          { 文本: " " },
          { 文本: "git merge" },
        ],
        中文: [{ 文本: "提取" }, { 文本: " " }, { 文本: "+", 加号: true }, { 文本: " " }, { 文本: "合并" }],
        x: 按钮起始X + 按钮1宽 + 按钮间距,
        y: 按钮Y,
        宽: 按钮2宽,
        高: 按钮高,
      },
    ];

    // 4 个节点：从左到右依次为 工作区、暂存区、本地仓库、远程仓库
    // 前三个为本地节点，彼此间距为远程间距的一半；四节点整体水平居中
    const 远程间距 = 宽 / 4;
    const 本地间距 = 远程间距 / 2;
    const 总跨度 = 本地间距 * 2 + 远程间距;
    const 首中心X = (宽 - 总跨度) / 2;
    const 节点中心列表 = [首中心X, 首中心X + 本地间距, 首中心X + 本地间距 * 2, 首中心X + 总跨度];
    const 节点宽 = Math.min(110, 宽 / 5, 本地间距 - 16);
    this.节点列表 = ["工作区", "暂存区", "本地仓库", "远程仓库"].map((名称, i) => ({
      名称,
      中心X: 节点中心列表[i],
      中心Y: 高 * 0.6 + 15, // 整体下移 15px
      宽: 节点宽,
      高: 84,
    }));
    this.节点 = {};
    for (const 节点 of this.节点列表) this.节点[节点.名称] = 节点;
  }

  // 求过四点的三次贝塞尔曲线控制点（点A在 t=1/3 处，点B在 t=2/3 处）
  求解四点控制点(P0, A, B, P3) {
    const ax = 27 * A.x - 8 * P0.x - P3.x;
    const ay = 27 * A.y - 8 * P0.y - P3.y;
    const bx = 27 * B.x - P0.x - 8 * P3.x;
    const by = 27 * B.y - P0.y - 8 * P3.y;
    return {
      P1: { x: (2 * ax - bx) / 18, y: (2 * ay - by) / 18 },
      P2: { x: (2 * bx - ax) / 18, y: (2 * by - ay) / 18 },
    };
  }

  贝塞尔点(P0, P1, P2, P3, t) {
    const u = 1 - t;
    return {
      x: u * u * u * P0.x + 3 * u * u * t * P1.x + 3 * u * t * t * P2.x + t * t * t * P3.x,
      y: u * u * u * P0.y + 3 * u * u * t * P1.y + 3 * u * t * t * P2.y + t * t * t * P3.y,
    };
  }

  // 获取当前模式各阶段所需的曲线
  获取曲线() {
    const 远程 = { x: this.节点["远程仓库"].中心X, y: this.节点["远程仓库"].中心Y };
    const 本地 = { x: this.节点["本地仓库"].中心X, y: this.节点["本地仓库"].中心Y };
    const 暂存 = { x: this.节点["暂存区"].中心X, y: this.节点["暂存区"].中心Y };
    const 工作 = { x: this.节点["工作区"].中心X, y: this.节点["工作区"].中心Y };

    if (this.模式 === "pull") {
      // 远程仓库 → 本地仓库 → 暂存区 → 工作区
      const { P1, P2 } = this.求解四点控制点(远程, 本地, 暂存, 工作);
      return { fetch曲线: null, merge曲线: null, pull曲线: { P0: 远程, P1, P2, P3: 工作 } };
    }

    // fetch：远程仓库 → 本地仓库（共线，取三等分点作为控制点）
    const fetch曲线 = {
      P0: 远程,
      P1: { x: 远程.x + (本地.x - 远程.x) / 3, y: 远程.y + (本地.y - 远程.y) / 3 },
      P2: { x: 远程.x + ((本地.x - 远程.x) * 2) / 3, y: 远程.y + ((本地.y - 远程.y) * 2) / 3 },
      P3: 本地,
    };
    // merge：本地仓库 → 暂存区 → 工作区
    const merge曲线 = {
      P0: 本地,
      P1: { x: 本地.x + (工作.x - 本地.x) / 3, y: 本地.y + (工作.y - 本地.y) / 3 },
      P2: { x: 本地.x + ((工作.x - 本地.x) * 2) / 3, y: 本地.y + ((工作.y - 本地.y) * 2) / 3 },
      P3: 工作,
    };
    return { fetch曲线, merge曲线, pull曲线: null };
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
      case "远程仓库": {
        // 云（实心剪影）
        const r = 尺寸 * 0.26;
        ctx.beginPath();
        ctx.arc(中心X - r * 1.05, 中心Y + r * 0.3, r * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(中心X, 中心Y - r * 0.5, r * 1.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(中心X + r * 1.05, 中心Y + r * 0.2, r * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(中心X - r * 1.75, 中心Y + r * 0.25, r * 3.4, r * 0.95, r * 0.35);
        ctx.fill();
        break;
      }
    }
    ctx.restore();
  }

  绘制节点() {
    for (const 节点 of this.节点列表) {
      const 是远程 = 节点.名称 === "远程仓库";
      const x = 节点.中心X - 节点.宽 / 2;
      const y = 节点.中心Y - 节点.高 / 2;
      const 圆角 = 14;

      if (是远程) {
        // 远程仓库：实心渐变，与本地节点区分
        const 渐变 = this.ctx.createLinearGradient(x, y, x, y + 节点.高);
        渐变.addColorStop(0, this.配色.远程渐变上);
        渐变.addColorStop(1, this.配色.远程渐变下);
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, 节点.宽, 节点.高, 圆角);
        this.ctx.fillStyle = 渐变;
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.roundRect(x, y, 节点.宽, 节点.高, 圆角);
        this.ctx.strokeStyle = this.配色.远程描边;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      } else {
        // 本地节点：幽灵样式
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, 节点.宽, 节点.高, 圆角);
        this.ctx.fillStyle = this.配色.节点填充;
        this.ctx.fill();
        this.ctx.strokeStyle = this.配色.节点描边;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      }

      // 图标
      this.绘制图标(
        节点.名称,
        节点.中心X,
        节点.中心Y,
        Math.min(节点.宽, 节点.高) * 0.44,
        this.配色.节点图标,
      );

      // 节点文本绘制在节点下方，水平居中
      this.ctx.font = `${是远程 ? "600 " : "500 "}14px ${this.字体}`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = 是远程 ? this.配色.远程文字 : this.配色.节点文字;
      this.ctx.fillText(节点.名称, 节点.中心X, 节点.中心Y + 节点.高 / 2 + 20);
    }
  }

  // 在同一基线上居中绘制多色片段文本
  绘制多色文本(片段, 中心X, 中心Y, 字体, 默认颜色) {
    const ctx = this.ctx;
    ctx.font = 字体;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const 宽度列表 = 片段.map((段) => ctx.measureText(段.文本).width);
    const 总宽 = 宽度列表.reduce((合计, 宽) => 合计 + 宽, 0);
    let x = 中心X - 总宽 / 2;
    for (let i = 0; i < 片段.length; i++) {
      ctx.fillStyle = 片段[i].颜色 || 默认颜色;
      ctx.fillText(片段[i].文本, x, 中心Y);
      x += 宽度列表[i];
    }
  }

  绘制选项按钮() {
    for (const 按钮 of this.按钮列表) {
      const 悬停 =
        this.鼠标X >= 按钮.x &&
        this.鼠标X <= 按钮.x + 按钮.宽 &&
        this.鼠标Y >= 按钮.y &&
        this.鼠标Y <= 按钮.y + 按钮.高;
      const 选中 = this.模式 === 按钮.模式;
      const 圆角 = 10;

      if (选中) {
        // 选中：主色渐变
        const 渐变 = this.ctx.createLinearGradient(按钮.x, 按钮.y, 按钮.x, 按钮.y + 按钮.高);
        渐变.addColorStop(0, "#2a4e89ff");
        渐变.addColorStop(1, "#244384ff");
        this.ctx.beginPath();
        this.ctx.roundRect(按钮.x, 按钮.y, 按钮.宽, 按钮.高, 圆角);
        this.ctx.fillStyle = 渐变;
        this.ctx.fill();

        /* this.ctx.beginPath();
        this.ctx.roundRect(按钮.x, 按钮.y, 按钮.宽, 按钮.高, 圆角);
        this.ctx.strokeStyle = "rgba(147,180,255,0.55)";
        this.ctx.lineWidth = 1;
        this.ctx.stroke(); */
      } else {
        // 普通 / 悬停：轻量幽灵按钮
        this.ctx.beginPath();
        this.ctx.roundRect(按钮.x, 按钮.y, 按钮.宽, 按钮.高, 圆角);
        this.ctx.fillStyle = 悬停 ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)";
        this.ctx.fill();
        /* this.ctx.strokeStyle = 悬停 ? "rgba(120,160,255,0.38)" : "rgba(255,255,255,0.12)";
        this.ctx.lineWidth = 1;
        this.ctx.stroke(); */
      }

      // 英文文本
      const 英文颜色 = 选中 ? this.配色.按钮选中文字 : 悬停 ? this.配色.按钮文字悬停 : this.配色.按钮文字;
      const 加号颜色 = 选中 ? this.配色.加号选中 : 悬停 ? this.配色.加号悬停 : this.配色.加号;
      this.绘制多色文本(
        按钮.英文.map((段) => ({ 文本: 段.文本, 颜色: 段.加号 ? 加号颜色 : 英文颜色 })),
        按钮.x + 按钮.宽 / 2,
        按钮.y + 按钮.高 * 0.36,
        `600 ${this.按钮字号}px ${this.字体}`,
        英文颜色,
      );

      // 中文文本（英文正下方，水平中点对齐）
      const 中文颜色 = 选中 ? this.配色.按钮选中中文 : 悬停 ? this.配色.按钮中文悬停 : this.配色.按钮中文;
      this.绘制多色文本(
        按钮.中文.map((段) => ({ 文本: 段.文本, 颜色: 段.加号 ? 加号颜色 : 中文颜色 })),
        按钮.x + 按钮.宽 / 2,
        按钮.y + 按钮.高 * 0.7,
        `400 ${this.按钮中文号}px ${this.字体}`,
        中文颜色,
      );
    }
  }

  // 动画循环
  动画循环(当前时间) {
    if (!this.运行中) return;
    if (this.阶段开始时间 === 0) this.阶段开始时间 = 当前时间;
    const 已过时间 = 当前时间 - this.阶段开始时间;

    // 状态机（阶段切换后会重置阶段开始时间，因此需在状态机结束后重算已过时间）
    if (this.模式 === "pull") {
      if (this.阶段 === 0 && 已过时间 >= this.绘制时长) {
        this.阶段 = 1;
        this.阶段开始时间 = 当前时间;
      } else if (this.阶段 === 1 && 已过时间 >= this.停顿时长) {
        this.阶段 = 0;
        this.阶段开始时间 = 当前时间;
      }
    } else {
      if (this.阶段 === 0 && 已过时间 >= this.绘制时长) {
        this.阶段 = 1;
        this.阶段开始时间 = 当前时间;
      } else if (this.阶段 === 1 && 已过时间 >= this.停顿时长) {
        this.阶段 = 2;
        this.阶段开始时间 = 当前时间;
      } else if (this.阶段 === 2 && 已过时间 >= this.绘制时长) {
        this.阶段 = 3;
        this.阶段开始时间 = 当前时间;
      } else if (this.阶段 === 3 && 已过时间 >= this.停顿时长) {
        this.阶段 = 0;
        this.阶段开始时间 = 当前时间;
      }
    }

    // 阶段可能刚发生切换，重算进度时间，避免新阶段首帧使用旧阶段的累计时长
    const 阶段已过时间 = 当前时间 - this.阶段开始时间;

    // 绘制
    this.绘制背景();
    this.绘制选项按钮();
    this.绘制节点();

    const { fetch曲线, merge曲线, pull曲线 } = this.获取曲线();

    if (this.模式 === "pull") {
      const 进度 = this.阶段 === 0 ? 阶段已过时间 / this.绘制时长 : 1;
      this.绘制曲线(pull曲线, 进度, this.配色.箭头);
      // 文本始终固定在画布水平中点
      this.绘制阶段标签("git pull", this.宽 / 2, this.配色.箭头, 进度);
    } else {
      // fetch 阶段绘制完成后保持显示（merge 阶段同样保留）
      const fetch进度 = this.阶段 === 0 ? 阶段已过时间 / this.绘制时长 : 1;
      this.绘制曲线(fetch曲线, fetch进度, this.配色.箭头次要);
      const 远程X = this.节点["远程仓库"].中心X;
      const 本地X = this.节点["本地仓库"].中心X;
      const 工作X = this.节点["工作区"].中心X;
      this.绘制阶段标签("git fetch", (本地X + 远程X) / 2, this.配色.箭头次要, fetch进度);
      // merge 阶段
      if (this.阶段 >= 2) {
        const merge进度 = this.阶段 === 2 ? 阶段已过时间 / this.绘制时长 : 1;
        this.绘制曲线(merge曲线, merge进度, this.配色.箭头);
        this.绘制阶段标签("git merge", (工作X + 本地X) / 2, this.配色.箭头, merge进度);
      }
    }

    requestAnimationFrame(this.动画循环.bind(this));
  }

  绑定事件() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.鼠标X = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
      this.鼠标Y = ((e.clientY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

      const 悬停按钮 = this.按钮列表.some(
        (按钮) =>
          this.鼠标X >= 按钮.x &&
          this.鼠标X <= 按钮.x + 按钮.宽 &&
          this.鼠标Y >= 按钮.y &&
          this.鼠标Y <= 按钮.y + 按钮.高,
      );
      this.canvas.style.cursor = 悬停按钮 ? 'url("/Images/Common/鼠标-指向.cur"), pointer' : "default";
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.canvas.style.cursor = "default";
      this.鼠标X = -1;
      this.鼠标Y = -1;
    });

    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
      const y = ((e.clientY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;
      for (const 按钮 of this.按钮列表) {
        if (x >= 按钮.x && x <= 按钮.x + 按钮.宽 && y >= 按钮.y && y <= 按钮.y + 按钮.高) {
          if (this.模式 !== 按钮.模式) {
            this.模式 = 按钮.模式;
            this.阶段 = 0;
            this.阶段开始时间 = 0;
          }
          break;
        }
      }
    });

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

// 避免重复初始化（动态加载脚本可能多次执行）
if (window.拉取演示实例) {
  window.拉取演示实例.停止动画();
}
window.拉取演示实例 = new 拉取演示动画("拉取演示");

// 交叉观察器：画布离开视口时暂停动画
const 拉取演示观察器 = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        window.拉取演示实例.开始动画();
      } else {
        window.拉取演示实例.停止动画();
      }
    });
  },
  { root: null, rootMargin: "0px", threshold: 0.01 },
);

const 拉取演示画布 = document.getElementById("拉取演示");
if (拉取演示画布) {
  拉取演示观察器.observe(拉取演示画布);
}

// ========== 推送演示（无选项按钮，本地仓库 → 远程仓库） ==========
class 推送演示动画 extends 拉取演示动画 {
  constructor(canvasId) {
    // 没有按钮，画布不需要那么高
    super(canvasId, 200);
  }

  计算布局() {
    const 宽 = this.宽;
    const 高 = this.高;
    // 推送不需要选项按钮
    this.按钮列表 = [];

    // 节点水平分布与拉取演示一致；无按钮时按整体内容垂直居中
    const 远程间距 = 宽 / 4;
    const 本地间距 = 远程间距 / 2;
    const 总跨度 = 本地间距 * 2 + 远程间距;
    const 首中心X = (宽 - 总跨度) / 2;
    const 节点中心列表 = [首中心X, 首中心X + 本地间距, 首中心X + 本地间距 * 2, 首中心X + 总跨度];
    const 节点宽 = Math.min(110, 宽 / 5, 本地间距 - 16);
    this.节点列表 = ["工作区", "暂存区", "本地仓库", "远程仓库"].map((名称, i) => ({
      名称,
      中心X: 节点中心列表[i],
      中心Y: 高 * 0.5, // 整体上移 10px
      宽: 节点宽,
      高: 84,
    }));
    this.节点 = {};
    for (const 节点 of this.节点列表) this.节点[节点.名称] = 节点;
  }

  获取曲线() {
    const 远程 = { x: this.节点["远程仓库"].中心X, y: this.节点["远程仓库"].中心Y };
    const 本地 = { x: this.节点["本地仓库"].中心X, y: this.节点["本地仓库"].中心Y };
    // push：本地仓库 → 远程仓库（共线，取三等分点作为控制点）
    const push曲线 = {
      P0: 本地,
      P1: { x: 本地.x + (远程.x - 本地.x) / 3, y: 本地.y + (远程.y - 本地.y) / 3 },
      P2: { x: 本地.x + ((远程.x - 本地.x) * 2) / 3, y: 本地.y + ((远程.y - 本地.y) * 2) / 3 },
      P3: 远程,
    };
    return { push曲线 };
  }

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
    const 阶段已过时间 = 当前时间 - this.阶段开始时间;

    this.绘制背景();
    this.绘制节点();

    const { push曲线 } = this.获取曲线();
    const 进度 = this.阶段 === 0 ? 阶段已过时间 / this.绘制时长 : 1;
    this.绘制曲线(push曲线, 进度, this.配色.箭头);

    const 本地X = this.节点["本地仓库"].中心X;
    const 远程X = this.节点["远程仓库"].中心X;
    this.绘制阶段标签("git push", (本地X + 远程X) / 2, this.配色.箭头, 进度);

    requestAnimationFrame(this.动画循环.bind(this));
  }
}

// 避免重复初始化（动态加载脚本可能多次执行）
if (window.推送演示实例) {
  window.推送演示实例.停止动画();
}
window.推送演示实例 = new 推送演示动画("推送演示");

// 交叉观察器：画布离开视口时暂停动画
const 推送演示观察器 = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        window.推送演示实例.开始动画();
      } else {
        window.推送演示实例.停止动画();
      }
    });
  },
  { root: null, rootMargin: "0px", threshold: 0.01 },
);

const 推送演示画布 = document.getElementById("推送演示");
if (推送演示画布) {
  推送演示观察器.observe(推送演示画布);
}
