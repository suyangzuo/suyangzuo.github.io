class 多阶段矩形动画 {
  constructor() {
    this.画布 = document.getElementById("canvas-phase");
    this.上下文 = this.画布.getContext("2d");

    this.初始化画布();

    this.配置 = {
      点: {
        移动前等待: 1000,
        移动: 1000,
        移动后等待: 1000,
      },
      矩形: {
        宽: 150,
        高: 250,
        第一段线: 1000,
        第二段线: 1000,
        描边后等待: 500,
        填充: 1000,
        填充后等待: 3000,
      },
      高亮时长: 125,
      等待偏移量: 60,
      滑块: {
        x: 30,
        y: this.css高 - 80,
        宽度: 120,
        高度: 8,
        拇指: 20,
        最小: 1,
        最大: 5,
        数值: 1,
      },
    };

    this.状态 = {
      速度: 1,
      点: {
        阶段: "waitingBeforeMove",
        开始时间: null,
        起点: { x: 0, y: 0 },
        目标: { x: 0, y: 0 },
        位置: { x: 0, y: 0 },
      },
      矩形: {
        阶段: "waiting",
        开始时间: null,
        第一段: 0,
        第二段: 0,
        填充: 0,
      },
      高亮: {
        点: { 当前: 1, 目标: 1, 进度: 0, 起始时间: null },
        矩形: { 当前: 1, 目标: 1, 进度: 0, 起始时间: null },
      },
      等待移动开始: null,
      等待y偏移: 0,
      时间轴开始: null,
      滑块: { 拖拽中: false, 悬停: false },
    };

    this.目标置中();
    this.绑定事件();
    this.重置动画(true);
    requestAnimationFrame(this.循环.bind(this));
  }

  初始化画布() {
    this.dpr = window.devicePixelRatio || 1;
    this.画布.width = this.画布.clientWidth * this.dpr;
    this.画布.height = this.画布.clientHeight * this.dpr;
    this.上下文.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.css宽 = this.画布.clientWidth;
    this.css高 = this.画布.clientHeight;
    this.边界矩形 = this.画布.getBoundingClientRect();
    this.刷新边界矩形 = this.防抖(() => {
      this.边界矩形 = this.画布.getBoundingClientRect();
    }, 50);
  }

  目标置中() {
    const 宽度 = this.配置.矩形.宽;
    const 高度 = this.配置.矩形.高;
    this.状态.点.目标.x = (this.css宽 - 宽度) / 2;
    this.状态.点.目标.y = (this.css高 - 高度) / 2;
  }

  绑定事件() {
    window.addEventListener("resize", () => {
      this.初始化画布();
      this.目标置中();
      this.配置.滑块.y = this.css高 - 80;
      this.重置动画(true);
      this.刷新边界矩形();
    });

    window.addEventListener("scroll", () => {
      this.刷新边界矩形();
    });

    this.画布.addEventListener("mousedown", (e) => this.按下处理(e));
    this.画布.addEventListener("mousemove", (e) => this.移动处理(e));
    this.画布.addEventListener("mouseup", () => this.松开处理());
    this.画布.addEventListener("mouseleave", () => this.离开处理());
  }

  循环(时间戳) {
    if (!this.状态.时间轴开始) {
      this.状态.时间轴开始 = 时间戳;
      this.状态.等待移动开始 = 时间戳;
      this.更新坐标();
    }

    this.更新(时间戳);
    this.绘制();
    requestAnimationFrame(this.循环.bind(this));
  }

  重置动画(重新播种 = false, 保留滑块状态 = false) {
    this.状态.点.阶段 = "waitingBeforeMove";
    this.状态.点.开始时间 = null;
    this.状态.点.位置 = { x: 0, y: 0 };
    if (重新播种) {
      this.状态.点.起点 = { x: 0, y: 0 };
    } else {
      this.状态.点.起点 = { x: this.状态.点.位置.x, y: this.状态.点.位置.y };
    }

    this.状态.矩形.阶段 = "waiting";
    this.状态.矩形.开始时间 = null;
    this.状态.矩形.第一段 = 0;
    this.状态.矩形.第二段 = 0;
    this.状态.矩形.填充 = 0;

    this.状态.高亮.点 = { 当前: 1, 目标: 1, 进度: 0, 起始时间: null };
    this.状态.高亮.矩形 = { 当前: 1, 目标: 1, 进度: 0, 起始时间: null };

    this.状态.等待移动开始 = null;
    this.状态.等待y偏移 = 0;
    this.状态.时间轴开始 = null;
    if (!保留滑块状态) {
      this.状态.滑块.拖拽中 = false;
      this.状态.滑块.悬停 = false;
    }
    // 保持当前速度，滑块的数值已外部同步
    this.更新坐标();
  }

  更新(时间戳) {
    this.更新点(时间戳);
    this.更新矩形(时间戳);
    this.更新高亮组(时间戳);
    this.更新等待偏移(时间戳);
    this.更新坐标();
  }

  更新点(时间戳) {
    const 时长 = this.获取点时长();
    const 点 = this.状态.点;

    if (!点.开始时间) 点.开始时间 = 时间戳;
    if (!this.状态.等待移动开始) this.状态.等待移动开始 = 时间戳;

    const 已过时间 = 时间戳 - 点.开始时间;

    switch (点.阶段) {
      case "waitingBeforeMove":
        if (已过时间 >= 时长.移动前等待) {
          点.阶段 = "moving";
          点.开始时间 = 时间戳;
        }
        break;
      case "moving":
        {
          const 进度 = Math.min(已过时间 / 时长.移动, 1);
          点.位置.x = 点.起点.x + (点.目标.x - 点.起点.x) * 进度;
          点.位置.y = 点.起点.y + (点.目标.y - 点.起点.y) * 进度;
          if (进度 === 1) {
            点.阶段 = "waitingAfterMove";
            点.开始时间 = 时间戳;
          }
        }
        break;
      case "waitingAfterMove":
        if (已过时间 >= 时长.移动后等待) {
          点.阶段 = "completed";
          点.开始时间 = 时间戳;
          this.开始绘制矩形(时间戳);
        }
        break;
      default:
        break;
    }
  }

  开始绘制矩形(时间戳) {
    const 矩形 = this.状态.矩形;
    if (矩形.阶段 !== "waiting") return;
    矩形.阶段 = "drawingFirstLines";
    矩形.开始时间 = 时间戳;
    矩形.第一段 = 0;
    矩形.第二段 = 0;
    矩形.填充 = 0;
  }

  更新矩形(时间戳) {
    const 矩形 = this.状态.矩形;
    if (!矩形.开始时间) return;
    const 时长 = this.获取矩形时长();
    const 已过时间 = 时间戳 - 矩形.开始时间;

    switch (矩形.阶段) {
      case "drawingFirstLines":
        矩形.第一段 = Math.min(已过时间 / 时长.第一段线, 1);
        if (矩形.第一段 === 1) {
          矩形.阶段 = "drawingSecondLines";
          矩形.开始时间 = 时间戳;
        }
        break;
      case "drawingSecondLines":
        矩形.第二段 = Math.min(已过时间 / 时长.第二段线, 1);
        if (矩形.第二段 === 1) {
          矩形.阶段 = "waitingAfterOutline";
          矩形.开始时间 = 时间戳;
        }
        break;
      case "waitingAfterOutline":
        if (已过时间 >= 时长.描边后等待) {
          矩形.阶段 = "filling";
          矩形.开始时间 = 时间戳;
        }
        break;
      case "filling":
        矩形.填充 = Math.min(已过时间 / 时长.填充, 1);
        if (矩形.填充 === 1) {
          矩形.阶段 = "waitingAfterFill";
          矩形.开始时间 = 时间戳;
        }
        break;
      case "waitingAfterFill":
        if (已过时间 >= 时长.填充后等待) {
          this.重置动画();
        }
        break;
      default:
        break;
    }
  }

  更新等待偏移(时间戳) {
    if (!this.状态.等待移动开始) {
      this.状态.等待y偏移 = 0;
      return;
    }
    const 点时长 = this.获取点时长();
    const 总时长 = 点时长.移动前等待 + 点时长.移动 + 点时长.移动后等待;
    const 已过时间 = 时间戳 - this.状态.等待移动开始;
    const 进度 = Math.min(Math.max(已过时间 / 总时长, 0), 1);
    this.状态.等待y偏移 = this.配置.等待偏移量 * 进度;
  }

  更新高亮组(时间戳) {
    this.更新单个高亮块(时间戳, this.状态.高亮.点, this.获取点状态索引());
    this.更新单个高亮块(时间戳, this.状态.高亮.矩形, this.获取矩形状态索引());
  }

  更新单个高亮块(时间戳, 高亮块, 目标索引) {
    if (高亮块.目标 !== 目标索引) {
      高亮块.目标 = 目标索引;
      高亮块.起始时间 = 时间戳;
      高亮块.进度 = 0;
    }
    if (高亮块.起始时间 && 高亮块.当前 !== 高亮块.目标) {
      const 已过时间 = 时间戳 - 高亮块.起始时间;
      高亮块.进度 = Math.min(已过时间 / this.配置.高亮时长, 1);
      if (高亮块.进度 === 1) {
        高亮块.当前 = 高亮块.目标;
        高亮块.起始时间 = null;
        高亮块.进度 = 0;
      }
    }
  }

  获取点状态索引() {
    switch (this.状态.点.阶段) {
      case "waitingBeforeMove":
        return 1;
      case "moving":
        return 2;
      case "waitingAfterMove":
        return 3;
      case "completed":
        return 4;
      default:
        return 1;
    }
  }

  获取矩形状态索引() {
    switch (this.状态.矩形.阶段) {
      case "waiting":
        return 1;
      case "drawingFirstLines":
        return 2;
      case "drawingSecondLines":
        return 3;
      case "waitingAfterOutline":
        return 4;
      case "filling":
        return 5;
      case "waitingAfterFill":
        return 6;
      default:
        return 1;
    }
  }

  绘制() {
    const 上下文 = this.上下文;
    上下文.clearRect(0, 0, this.画布.width, this.画布.height);

    this.绘制虚线();
    if (this.状态.点.阶段 === "waitingAfterMove" || this.状态.矩形.阶段 !== "waiting") {
      this.绘制矩形();
    }
    this.绘制点();
    this.绘制状态显示();
    this.绘制速度滑块();
  }

  绘制点() {
    const 上下文 = this.上下文;
    上下文.beginPath();
    上下文.arc(this.状态.点.位置.x, this.状态.点.位置.y, 5, 0, Math.PI * 2);
    上下文.fillStyle = "orange";
    上下文.fill();
  }

  绘制矩形() {
    const 上下文 = this.上下文;
    const 矩形 = this.状态.矩形;
    const 宽度 = this.配置.矩形.宽;
    const 高度 = this.配置.矩形.高;
    const 起点x = (this.css宽 - 宽度) / 2;
    const 起点y = (this.css高 - 高度) / 2;

    上下文.strokeStyle = "lightskyblue";
    上下文.lineWidth = 2;

    if (矩形.阶段 !== "waiting") {
      上下文.beginPath();
      上下文.moveTo(起点x, 起点y);
      上下文.lineTo(起点x + 宽度 * 矩形.第一段, 起点y);
      上下文.stroke();

      上下文.beginPath();
      上下文.moveTo(起点x, 起点y);
      上下文.lineTo(起点x, 起点y + 高度 * 矩形.第一段);
      上下文.stroke();
    }

    if (["drawingSecondLines", "waitingAfterOutline", "filling", "waitingAfterFill"].includes(矩形.阶段)) {
      上下文.beginPath();
      上下文.moveTo(起点x + 宽度, 起点y);
      上下文.lineTo(起点x + 宽度, 起点y + 高度 * 矩形.第二段);
      上下文.stroke();

      上下文.beginPath();
      上下文.moveTo(起点x, 起点y + 高度);
      上下文.lineTo(起点x + 宽度 * 矩形.第二段, 起点y + 高度);
      上下文.stroke();
    }

    if (["filling", "waitingAfterFill"].includes(矩形.阶段)) {
      上下文.fillStyle = "rgba(0, 100, 255, 0.5)";
      const 填充高度 = 高度 * 矩形.填充;
      上下文.fillRect(起点x, 起点y, 宽度, 填充高度);
    }
  }

  绘制状态显示() {
    const 显示配置 = {
      左列x: this.css宽 - 210,
      右列x: this.css宽 - 100,
      起始y: 50,
      行高: 30,
      高亮高度: 25,
      内边距: 5,
    };

    const 点状态文本 = ["点状态", "移动前等待", "移动", "移动后等待", "完成"];
    const 矩形状态文本 = ["矩形状态", "等待", "绘制左上线", "绘制右下线", "填充前等待", "填充", "填充后等待"];

    this.上下文.font = "14px 'Noto Sans SC', 微软雅黑, sans-serif";
    this.上下文.textAlign = "left";
    this.上下文.textBaseline = "middle";

    this.绘制状态列(显示配置.左列x, 显示配置.起始y, 点状态文本, this.状态.高亮.点, "left", 显示配置);
    this.绘制状态列(显示配置.右列x, 显示配置.起始y, 矩形状态文本, this.状态.高亮.矩形, "right", 显示配置);
  }

  绘制状态列(x坐标, 起始y, 文本组, 高亮数据, 列方向, 显示配置) {
    const 上下文 = this.上下文;
    文本组.forEach((文本, 索引) => {
      let y坐标 = 起始y + 索引 * 显示配置.行高;

      if (列方向 === "right") {
        if (索引 === 1) {
          y坐标 += this.状态.等待y偏移;
        } else if (索引 >= 2) {
          y坐标 += 60;
        }
      }

      if (索引 !== 0) {
        let 透明度 = 0;
        if (高亮数据.当前 === 索引) 透明度 = 0.5;
        else if (高亮数据.目标 === 索引 && 高亮数据.进度 > 0) 透明度 = 0.5 * 高亮数据.进度;
        else if (高亮数据.当前 !== 0 && 高亮数据.进度 > 0 && 高亮数据.当前 === 索引) 透明度 = 0.5 * (1 - 高亮数据.进度);
        if (透明度 > 0) {
          上下文.fillStyle = `rgba(50, 150, 255, ${透明度})`;
          上下文.fillRect(
            x坐标 - 显示配置.内边距,
            y坐标 - 显示配置.高亮高度 / 2,
            上下文.measureText(文本).width + 显示配置.内边距 * 2,
            显示配置.高亮高度,
          );
        }
      }

      if (索引 === 0) {
        上下文.font = "bold 16px 'Noto Sans SC', 微软雅黑, sans-serif";
        上下文.fillStyle = "Gold";
      } else {
        上下文.font = "14px 'Noto Sans SC', 微软雅黑, sans-serif";
        const 已激活 =
          高亮数据.当前 === 索引 ||
          (高亮数据.目标 === 索引 && 高亮数据.进度 > 0) ||
          (高亮数据.当前 !== 0 && 高亮数据.进度 > 0 && 高亮数据.当前 === 索引);
        上下文.fillStyle = 已激活 ? "white" : "silver";
      }
      上下文.fillText(文本, x坐标, y坐标 + 1);
    });
  }

  绘制速度滑块() {
    const 滑块配置 = this.配置.滑块;
    const 滑块状态 = this.状态.滑块;
    const 上下文 = this.上下文;

    上下文.font = "14px 'Noto Sans SC', 微软雅黑, sans-serif";
    上下文.fillStyle = "white";
    上下文.textAlign = "center";
    上下文.textBaseline = "middle";
    上下文.fillText("动画时长倍率", 滑块配置.x + 滑块配置.宽度 / 2, 滑块配置.y - 25);

    上下文.fillStyle = "#444";
    上下文.fillRect(滑块配置.x, 滑块配置.y, 滑块配置.宽度, 滑块配置.高度);

    const 比率 = (this.状态.速度 - 滑块配置.最小) / (滑块配置.最大 - 滑块配置.最小);
    const 填充宽度 = 比率 * 滑块配置.宽度;
    if (填充宽度 > 0) {
      上下文.fillStyle = "rgba(76, 175, 80, 0.75)";
      上下文.fillRect(滑块配置.x, 滑块配置.y, 填充宽度, 滑块配置.高度);
    }

    上下文.strokeStyle = "#666";
    上下文.lineWidth = 1;
    上下文.strokeRect(滑块配置.x, 滑块配置.y, 滑块配置.宽度, 滑块配置.高度);

    const 拇指x = 滑块配置.x + 比率 * 滑块配置.宽度;
    上下文.fillStyle = 滑块状态.悬停 || 滑块状态.拖拽中 ? "#66BB6A" : "#2C8F30";
    上下文.beginPath();
    上下文.arc(拇指x, 滑块配置.y + 滑块配置.高度 / 2, 滑块配置.拇指 / 2, 0, Math.PI * 2);
    上下文.fill();
    上下文.strokeStyle = "#fff";
    上下文.lineWidth = 2;
    上下文.stroke();

    上下文.textAlign = "center";
    for (let 数值 = 滑块配置.最小; 数值 <= 滑块配置.最大; 数值++) {
      const 刻度x = 滑块配置.x + ((数值 - 滑块配置.最小) / (滑块配置.最大 - 滑块配置.最小)) * 滑块配置.宽度;
      const 刻度y = 滑块配置.y + 滑块配置.高度 + 20;
      if (数值 === this.状态.速度) {
        上下文.font = "bold 14px 'Google Sans Code', 'JetBrains Mono', Consolas, monospace";
        上下文.fillStyle = "#4CAF50";
      } else {
        上下文.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, monospace";
        上下文.fillStyle = "#888";
      }
      上下文.fillText(数值.toString(), 刻度x, 刻度y);
    }
  }

  绘制虚线() {
    const 上下文 = this.上下文;
    上下文.setLineDash([7, 7]);
    上下文.strokeStyle = "rgba(255, 255, 255, 0.5)";
    上下文.beginPath();
    上下文.moveTo(0, this.状态.点.位置.y);
    上下文.lineTo(this.状态.点.位置.x, this.状态.点.位置.y);
    上下文.stroke();

    上下文.beginPath();
    上下文.moveTo(this.状态.点.位置.x, 0);
    上下文.lineTo(this.状态.点.位置.x, this.状态.点.位置.y);
    上下文.stroke();
    上下文.setLineDash([]);
  }

  按下处理(e) {
    const { x, y } = this.获取鼠标位置(e);
    if (this.点在滑块内(x, y)) {
      this.状态.滑块.拖拽中 = true;
      this.更新滑块数值(x);
    }
  }

  移动处理(e) {
    const { x, y } = this.获取鼠标位置(e);
    this.状态.滑块.悬停 = this.点在滑块内(x, y);
    if (this.状态.滑块.拖拽中) {
      this.更新滑块数值(x);
    }
  }

  松开处理() {
    this.状态.滑块.拖拽中 = false;
  }

  离开处理() {
    this.状态.滑块.拖拽中 = false;
    this.状态.滑块.悬停 = false;
  }

  获取鼠标位置(e) {
    return { x: e.clientX - this.边界矩形.left, y: e.clientY - this.边界矩形.top };
  }

  点在滑块内(x坐标, y坐标) {
    const 滑块配置 = this.配置.滑块;
    const 半拇指 = 滑块配置.拇指 / 2;
    return (
      x坐标 >= 滑块配置.x - 半拇指 &&
      x坐标 <= 滑块配置.x + 滑块配置.宽度 + 半拇指 &&
      y坐标 >= 滑块配置.y - 半拇指 &&
      y坐标 <= 滑块配置.y + 滑块配置.高度 + 半拇指
    );
  }

  更新滑块数值(x坐标) {
    const 滑块配置 = this.配置.滑块;
    const 限制值 = Math.max(0, Math.min(滑块配置.宽度, x坐标 - 滑块配置.x));
    const 比率 = 限制值 / 滑块配置.宽度;
    const 新数值 = Math.round(滑块配置.最小 + 比率 * (滑块配置.最大 - 滑块配置.最小));
    if (新数值 !== this.状态.速度) {
      this.状态.速度 = 新数值;
      this.配置.滑块.数值 = 新数值;
      this.重置动画(true, true);
    }
  }

  获取点时长() {
    return {
      移动前等待: this.配置.点.移动前等待 * this.状态.速度,
      移动: this.配置.点.移动 * this.状态.速度,
      移动后等待: this.配置.点.移动后等待 * this.状态.速度,
    };
  }

  获取矩形时长() {
    return {
      第一段线: this.配置.矩形.第一段线 * this.状态.速度,
      第二段线: this.配置.矩形.第二段线 * this.状态.速度,
      描边后等待: this.配置.矩形.描边后等待 * this.状态.速度,
      填充: this.配置.矩形.填充 * this.状态.速度,
      填充后等待: this.配置.矩形.填充后等待 * this.状态.速度,
    };
  }

  防抖(函数体, 延迟 = 50) {
    let 定时器 = null;
    return (...参数) => {
      if (定时器) clearTimeout(定时器);
      定时器 = setTimeout(() => 函数体.apply(this, 参数), 延迟);
    };
  }

  更新坐标() {
    const x坐标元素 = document.getElementById("x-coord");
    const y坐标元素 = document.getElementById("y-coord");
    if (!x坐标元素 || !y坐标元素) return;
    x坐标元素.innerHTML = `X<span class="coord-colon">:</span><span class="coord-value">${Math.round(this.状态.点.位置.x)}</span>`;
    x坐标元素.style.left = `${this.状态.点.位置.x}px`;
    y坐标元素.innerHTML = `Y<span class="coord-colon">:</span><span class="coord-value">${Math.round(this.状态.点.位置.y)}</span>`;
    y坐标元素.style.top = `${this.状态.点.位置.y}px`;
  }
}

new 多阶段矩形动画();
