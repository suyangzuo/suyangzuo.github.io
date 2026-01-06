class 绘图器 {
  constructor() {
    this.画布 = document.getElementById("画布");
    this.上下文 = this.画布.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.上下文.scale(this.dpr, this.dpr);

    this.控制点 = [];
    this.当前拖拽点 = null;
    this.当前悬停点 = null;
    this.点半径 = 8;
    this.点样式 = {
      正常: "rgba(70, 80, 90, 1)",
      悬停: "#937a15ff",
      拖拽: "#ff6600",
      边框: "#c8c8c8ff",
    };
    this.动画时长 = 2000;
    this.动画时长范围 = { 最小: 500, 最大: 20000 };
    this.动画时长滑块布局 = null;
    this.端点停留 = 1000;
    this.端点停留范围 = { 最小: 0, 最大: 2000 };
    this.端点停留滑块布局 = null;
    this.拖拽滑块 = false;
    this.悬停滑块 = false;
    this.悬停thumb = false;
    this.按下thumb = false;
    this.拖拽停留滑块 = false;
    this.悬停停留滑块 = false;
    this.悬停停留thumb = false;
    this.按下停留thumb = false;
    this.显示实时控制点 = true;
    this.悬停实时控制点开关 = false;
    this.实时控制点开关布局 = null;
    this.实时控制点开关动画 = { 当前: 0, 目标: 0 };
    this.显示其它算法点 = false;
    this.悬停其它算法点开关 = false;
    this.其它算法点开关布局 = null;
    this.其它算法点开关动画 = { 当前: 0, 目标: 0 };
    this.显示t = true;
    this.悬停显示t开关 = false;
    this.显示t开关布局 = null;
    this.显示t开关动画 = { 当前: 1, 目标: 1 };
    this.播放 = true;
    this.悬停播放开关 = false;
    this.播放开关布局 = null;
    this.播放开关动画 = { 当前: 1, 目标: 1 };
    this.t滑块布局 = null;
    this.拖拽t滑块 = false;
    this.悬停t滑块 = false;
    this.悬停tThumb = false;
    this.按下tThumb = false;
    this.其它算法点 = [];
    this.当前悬停其它点 = null;
    this.手动t = null;
    this.当前t = 0;
    this.上次时间戳 = null;
    this.控制点变化回调 = null;
    this.控制点已变 = false;
    this.滑块样式 = {
      轨道: {
        正常: "rgba(255, 255, 255, 0.12)",
        悬停: "rgba(255, 255, 255, 0.25)",
        拖拽: "rgba(255, 255, 255, 0.25)",
      },
      进度: {
        正常: "#4c90b5ff",
        悬停: "#5fc5ffff",
        拖拽: "#5fc5ffff",
      },
      thumb填充: {
        正常: "#23495eff",
        悬停: "#3286c7ff",
        拖拽: "#3286c7ff",
      },
      thumb描边: {
        正常: "rgba(255, 255, 255, 0.6)",
        悬停: "rgba(255, 255, 255, 0.75)",
        拖拽: "rgba(255, 255, 255, 0.8)",
      },
      热区容差: {
        轨道: { 水平: 10, 垂直: 16 },
        thumb: { 水平: 16, 垂直: 16 },
      },
      文本: {
        标题: {
          字体: "18px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
          颜色: "rgba(230, 238, 255, 0.75)",
        },
        值: {
          字体: "18px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
          颜色: "#def",
        },
        单位: {
          字体: "18px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
          颜色: "#7f95a9ff",
        },
        值与单位间距: 6,
      },
    };
    this.存储键 = {
      动画时长: "bezier_anim_duration",
      显示实时控制点: "bezier_show_rt_points",
      显示其它算法点: "bezier_show_other_points",
      显示t: "bezier_show_t",
      播放: "bezier_playing",
      控制点: "bezier_ctrl_points",
    };
    this.加载状态();
    this.实时控制点开关动画.当前 = this.显示实时控制点 ? 1 : 0;
    this.实时控制点开关动画.目标 = this.实时控制点开关动画.当前;
    this.其它算法点开关动画.当前 = this.显示其它算法点 ? 1 : 0;
    this.其它算法点开关动画.目标 = this.其它算法点开关动画.当前;
    this.显示t开关动画.当前 = this.显示t ? 1 : 0;
    this.显示t开关动画.目标 = this.显示t开关动画.当前;
    this.播放开关动画.当前 = this.播放 ? 1 : 0;
    this.播放开关动画.目标 = this.播放开关动画.当前;
    this.初始化();
    this.绑定事件();
    this.添加尺寸观察器();
  }

  保存状态() {
    sessionStorage.setItem(this.存储键.动画时长, String(this.动画时长));
    sessionStorage.setItem(this.存储键.显示实时控制点, this.显示实时控制点 ? "1" : "0");
    sessionStorage.setItem(this.存储键.显示其它算法点, this.显示其它算法点 ? "1" : "0");
    sessionStorage.setItem(this.存储键.显示t, this.显示t ? "1" : "0");
    sessionStorage.setItem(this.存储键.播放, this.播放 ? "1" : "0");
    sessionStorage.setItem("bezier_endpoint_hold", String(this.端点停留));
  }

  加载状态() {
    const 时长 = sessionStorage.getItem(this.存储键.动画时长);
    if (时长 !== null) {
      const 数值 = Number(时长);
      if (!Number.isNaN(数值)) {
        this.设置动画时长(数值);
      }
    }
    const 显示 = sessionStorage.getItem(this.存储键.显示实时控制点);
    if (显示 !== null) {
      this.显示实时控制点 = 显示 === "1";
    }
    const 显示其它 = sessionStorage.getItem(this.存储键.显示其它算法点);
    if (显示其它 !== null) {
      this.显示其它算法点 = 显示其它 === "1";
    }
    const 显示t值 = sessionStorage.getItem(this.存储键.显示t);
    if (显示t值 !== null) {
      this.显示t = 显示t值 === "1";
    }
    const 播放值 = sessionStorage.getItem(this.存储键.播放);
    if (播放值 !== null) {
      this.播放 = 播放值 === "1";
    }
    const 停留值 = sessionStorage.getItem("bezier_endpoint_hold");
    if (停留值 !== null) {
      const 数值 = Number(停留值);
      if (!Number.isNaN(数值)) {
        this.设置端点停留(数值);
      }
    }
  }

  添加尺寸观察器() {
    const 防抖初始化 = (() => {
      let 定时器 = null;
      return () => {
        if (定时器) {
          clearTimeout(定时器);
        }
        定时器 = setTimeout(() => {
          this.初始化();
        }, 100);
      };
    })();

    this.resizeObserver = new ResizeObserver(() => {
      防抖初始化();
    });

    this.resizeObserver.observe(this.画布);
  }

  销毁尺寸观察器() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  初始化() {
    this.画布.width = this.画布.offsetWidth * this.dpr;
    this.画布.height = this.画布.offsetHeight * this.dpr;
  }

  绑定事件() {
    const 转换坐标 = (event) => {
      const 矩形 = this.画布.getBoundingClientRect();
      // 先减去画布左上角偏移，再按 dpr 放大，避免混用物理像素与 CSS 像素导致的偏移
      return {
        x: (event.clientX - 矩形.left) * this.dpr,
        y: (event.clientY - 矩形.top) * this.dpr,
      };
    };

    const 检测点 = (坐标, 点) => {
      const dx = 坐标.x - 点.x;
      const dy = 坐标.y - 点.y;
      return Math.sqrt(dx * dx + dy * dy) <= this.点半径 + 5;
    };

    this.画布.addEventListener("mousedown", (event) => {
      const 坐标 = 转换坐标(event);

      if (this.命中播放开关(坐标)) {
        this.播放 = !this.播放;
        this.播放开关动画.目标 = this.播放 ? 1 : 0;
        if (this.播放) {
          this.手动t = null;
        }
        this.保存状态();
        this.画布.style.cursor = "pointer";
        return;
      }

      if (!this.播放 && this.命中t滑块(坐标)) {
        const 命中tThumb = this.命中tThumb(坐标);
        this.按下tThumb = 命中tThumb;
        this.拖拽t滑块 = !命中tThumb && this.命中t滑块轨道(坐标);
        if (this.拖拽t滑块) {
          this.更新t通过坐标(坐标.x);
          this.画布.style.cursor = "grabbing";
          return;
        }
        if (this.按下tThumb) {
          this.画布.style.cursor = "grab";
          return;
        }
      }

      if (this.命中显示t开关(坐标)) {
        this.显示t = !this.显示t;
        this.显示t开关动画.目标 = this.显示t ? 1 : 0;
        this.保存状态();
        this.画布.style.cursor = "pointer";
        return;
      }

      if (this.命中实时控制点开关(坐标)) {
        this.显示实时控制点 = !this.显示实时控制点;
        this.实时控制点开关动画.目标 = this.显示实时控制点 ? 1 : 0;
        this.保存状态();
        this.画布.style.cursor = "pointer";
        return;
      }

      if (this.命中其它算法点开关(坐标)) {
        this.显示其它算法点 = !this.显示其它算法点;
        this.其它算法点开关动画.目标 = this.显示其它算法点 ? 1 : 0;
        this.保存状态();
        this.画布.style.cursor = "pointer";
        return;
      }

      const 命中停留thumb = this.命中端点停留thumb(坐标);
      const 命中停留滑块 = this.命中端点停留滑块(坐标);
      const 命中thumb = this.命中动画时长thumb(坐标);
      const 命中滑块 = this.命中动画时长滑块(坐标);

      if (命中停留thumb) {
        this.按下停留thumb = true;
        this.画布.style.cursor = "grab";
        return;
      }

      if (命中停留滑块) {
        this.拖拽停留滑块 = true;
        this.更新端点停留通过坐标(坐标.x);
        this.画布.style.cursor = "grabbing";
        return;
      }

      if (命中thumb) {
        this.按下thumb = true;
        this.画布.style.cursor = "grab";
        return;
      }

      if (命中滑块) {
        this.拖拽滑块 = true;
        this.更新动画时长通过坐标(坐标.x);
        this.画布.style.cursor = "grabbing";
        return;
      }

      for (let i = 0; i < this.控制点.length; i++) {
        if (检测点(坐标, this.控制点[i])) {
          this.当前拖拽点 = this.控制点[i];
          this.画布.style.cursor = "grabbing";
          break;
        }
      }
    });

    this.画布.addEventListener("mousemove", (event) => {
      const 坐标 = 转换坐标(event);

      const 命中播放 = this.命中播放开关(坐标);
      const 命中显示t = this.命中显示t开关(坐标);
      const 命中开关 = this.命中实时控制点开关(坐标);
      const 命中其它 = this.命中其它算法点开关(坐标);
      const 命中t区 = this.命中t滑块(坐标);
      const 命中tThumb = this.命中tThumb(坐标);

      if (this.拖拽停留滑块) {
        this.更新端点停留通过坐标(坐标.x);
        this.保存状态();
        this.画布.style.cursor = "grabbing";
        return;
      }

      if (this.拖拽滑块) {
        this.更新动画时长通过坐标(坐标.x);
        this.保存状态();
        this.画布.style.cursor = "grabbing";
        return;
      }

      if (this.拖拽t滑块) {
        this.更新t通过坐标(坐标.x);
        this.画布.style.cursor = "grabbing";
        return;
      }

      if (this.按下tThumb) {
        if ((event.buttons & 1) === 1) {
          this.拖拽t滑块 = true;
          this.更新t通过坐标(坐标.x);
          this.画布.style.cursor = "grabbing";
          return;
        }
      }

      if (this.按下停留thumb) {
        if ((event.buttons & 1) === 1) {
          this.拖拽停留滑块 = true;
          this.更新端点停留通过坐标(坐标.x);
          this.保存状态();
          this.画布.style.cursor = "grabbing";
          return;
        }
      }

      if (this.按下thumb) {
        if ((event.buttons & 1) === 1) {
          this.拖拽滑块 = true;
          this.更新动画时长通过坐标(坐标.x);
          this.保存状态();
          this.画布.style.cursor = "grabbing";
          return;
        }
      }

      const 命中停留thumb = this.命中端点停留thumb(坐标);
      const 命中停留滑块 = !命中停留thumb && this.命中端点停留滑块(坐标);
      const 命中thumb = this.命中动画时长thumb(坐标);
      const 命中滑块 = !命中thumb && this.命中动画时长滑块(坐标);

      this.悬停thumb = !!命中thumb;
      this.悬停滑块 = !!(命中滑块 || 命中thumb);
      this.悬停停留thumb = !!命中停留thumb;
      this.悬停停留滑块 = !!(命中停留滑块 || 命中停留thumb);
      this.悬停实时控制点开关 = !!命中开关;
      this.悬停显示t开关 = !!命中显示t;
      this.悬停其它算法点开关 = !!命中其它;
      this.悬停播放开关 = !!命中播放;
      this.悬停t滑块 = !!(命中t区 || 命中tThumb);
      this.悬停tThumb = !!命中tThumb;

      let 新悬停点 = null;
      for (let i = 0; i < this.控制点.length; i++) {
        if (检测点(坐标, this.控制点[i])) {
          新悬停点 = this.控制点[i];
          break;
        }
      }

      if (!命中滑块 && !命中thumb) {
        this.当前悬停点 = 新悬停点;
      }

      // 其它算法点悬停检测（仅在有数据时）
      let 新悬停其它 = null;
      if (this.显示其它算法点 && this.其它算法点 && this.其它算法点.length) {
        for (const 项 of this.其它算法点) {
          const dx = 坐标.x - 项.点.x;
          const dy = 坐标.y - 项.点.y;
          if (Math.sqrt(dx * dx + dy * dy) <= this.点半径 + 5) {
            新悬停其它 = 项;
            break;
          }
        }
      }
      this.当前悬停其它点 = 新悬停其它;

      if (this.当前拖拽点) {
        this.当前拖拽点.x = 坐标.x;
        this.当前拖拽点.y = 坐标.y;
        this.控制点已变 = true;
        this.画布.style.cursor = "grabbing";
        return;
      }

      if (命中播放 || 命中显示t || 命中开关 || 命中其它) {
        this.画布.style.cursor = "pointer";
      } else if (命中thumb || 命中停留thumb || (this.悬停tThumb && !this.播放)) {
        this.画布.style.cursor = "grab";
      } else if (命中滑块 || 命中停留滑块 || (this.悬停t滑块 && !this.播放)) {
        this.画布.style.cursor = "grab";
      } else if (this.当前悬停点 || (this.当前悬停其它点 && !this.播放)) {
        this.画布.style.cursor = "grab";
      } else {
        this.画布.style.cursor = "auto";
      }
    });

    this.画布.addEventListener("mouseup", () => {
      this.当前拖拽点 = null;
      this.拖拽滑块 = false;
      this.拖拽停留滑块 = false;
      this.拖拽t滑块 = false;
      this.按下thumb = false;
      this.按下停留thumb = false;
      this.按下tThumb = false;
      if (this.控制点已变 && this.控制点变化回调) {
        this.控制点变化回调(this.控制点);
      }
      this.控制点已变 = false;
      this.画布.style.cursor = "auto";
    });

    this.画布.addEventListener("mouseleave", () => {
      this.当前悬停点 = null;
      this.当前拖拽点 = null;
      this.拖拽滑块 = false;
      this.拖拽停留滑块 = false;
      this.拖拽t滑块 = false;
      this.按下thumb = false;
      this.按下停留thumb = false;
      this.按下tThumb = false;
      this.悬停滑块 = false;
      this.悬停thumb = false;
      this.悬停停留滑块 = false;
      this.悬停停留thumb = false;
      this.悬停t滑块 = false;
      this.悬停tThumb = false;
      this.悬停实时控制点开关 = false;
      this.悬停其它算法点开关 = false;
      this.悬停显示t开关 = false;
      this.悬停播放开关 = false;
      this.当前悬停其它点 = null;
      if (this.控制点已变 && this.控制点变化回调) {
        this.控制点变化回调(this.控制点);
      }
      this.控制点已变 = false;
      this.画布.style.cursor = "auto";
    });
  }

  绘制贝塞尔曲线进度(p0, p1, p2, p3, t, 样式 = {}) {
    t = Math.max(0, Math.min(1, t));

    this.上下文.strokeStyle = 样式.颜色 || "#000000";
    this.上下文.lineWidth = 样式.线宽 || 2;
    this.上下文.lineCap = "round";
    this.上下文.lineJoin = "round";

    if (t === 0) return;

    if (t === 1) {
      this.上下文.beginPath();
      this.上下文.moveTo(p0.x, p0.y);
      this.上下文.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      this.上下文.stroke();
      return;
    }

    const 计算中间点 = (a, b, 比例) => {
      return {
        x: a.x + (b.x - a.x) * 比例,
        y: a.y + (b.y - a.y) * 比例,
      };
    };

    const p1_t = 计算中间点(p0, p1, t);
    const p12 = 计算中间点(p1, p2, t);
    const p23 = 计算中间点(p2, p3, t);
    const p2_t = 计算中间点(p1_t, p12, t);
    const p123 = 计算中间点(p12, p23, t);
    const p3_t = 计算中间点(p2_t, p123, t);

    this.上下文.beginPath();
    this.上下文.moveTo(p0.x, p0.y);
    this.上下文.bezierCurveTo(p1_t.x, p1_t.y, p2_t.x, p2_t.y, p3_t.x, p3_t.y);
    this.上下文.stroke();
  }

  清空画布() {
    this.上下文.clearRect(0, 0, this.画布.width, this.画布.height);
  }

  设置动画时长(数值) {
    const 限制值 = Math.max(this.动画时长范围.最小, Math.min(this.动画时长范围.最大, 数值));
    const 步长 = 500;
    const 量化值 = Math.round(限制值 / 步长) * 步长;
    this.动画时长 = Math.max(this.动画时长范围.最小, Math.min(this.动画时长范围.最大, 量化值));
  }

  设置端点停留(数值) {
    const 限制值 = Math.max(this.端点停留范围.最小, Math.min(this.端点停留范围.最大, 数值));
    const 步长 = 100;
    const 量化值 = Math.round(限制值 / 步长) * 步长;
    this.端点停留 = Math.max(this.端点停留范围.最小, Math.min(this.端点停留范围.最大, 量化值));
  }

  设置t值(数值) {
    const 限制值 = Math.max(0, Math.min(1, 数值));
    const 步长 = 0.01;
    const 量化值 = Math.round(限制值 / 步长) * 步长;
    this.手动t = 量化值;
    this.当前t = 量化值;
  }

  更新t通过坐标(x) {
    if (!this.t滑块布局) return;
    const { 轨道起点, 轨道终点 } = this.t滑块布局;
    const 轨道长度 = 轨道终点 - 轨道起点;
    if (轨道长度 <= 0) return;
    const 比例 = Math.max(0, Math.min(1, (x - 轨道起点) / 轨道长度));
    this.设置t值(比例);
  }

  更新动画时长通过坐标(x) {
    if (!this.动画时长滑块布局) return;
    const { 轨道起点, 轨道终点 } = this.动画时长滑块布局;
    const 轨道长度 = 轨道终点 - 轨道起点;
    if (轨道长度 <= 0) return;
    const 比例 = Math.max(0, Math.min(1, (x - 轨道起点) / 轨道长度));
    const 新值 = this.动画时长范围.最小 + 比例 * (this.动画时长范围.最大 - this.动画时长范围.最小);
    this.设置动画时长(新值);
    this.保存状态();
  }

  更新端点停留通过坐标(x) {
    if (!this.端点停留滑块布局) return;
    const { 轨道起点, 轨道终点 } = this.端点停留滑块布局;
    const 轨道长度 = 轨道终点 - 轨道起点;
    if (轨道长度 <= 0) return;
    const 比例 = Math.max(0, Math.min(1, (x - 轨道起点) / 轨道长度));
    const 新值 = this.端点停留范围.最小 + 比例 * (this.端点停留范围.最大 - this.端点停留范围.最小);
    this.设置端点停留(新值);
    this.保存状态();
  }

  命中动画时长滑块(坐标) {
    if (!this.动画时长滑块布局) return false;
    const { 热区 } = this.动画时长滑块布局;
    if (!热区) return false;
    return 坐标.x >= 热区.x && 坐标.x <= 热区.x + 热区.w && 坐标.y >= 热区.y && 坐标.y <= 热区.y + 热区.h;
  }

  命中t滑块(坐标) {
    if (!this.t滑块布局) return false;
    const { 热区 } = this.t滑块布局;
    if (!热区) return false;
    return 坐标.x >= 热区.x && 坐标.x <= 热区.x + 热区.w && 坐标.y >= 热区.y && 坐标.y <= 热区.y + 热区.h;
  }

  命中t滑块轨道(坐标) {
    return this.命中t滑块(坐标);
  }

  命中tThumb(坐标) {
    if (!this.t滑块布局) return false;
    const { thumb热区 } = this.t滑块布局;
    if (!thumb热区) return false;
    return (
      坐标.x >= thumb热区.x &&
      坐标.x <= thumb热区.x + thumb热区.w &&
      坐标.y >= thumb热区.y &&
      坐标.y <= thumb热区.y + thumb热区.h
    );
  }

  命中动画时长thumb(坐标) {
    if (!this.动画时长滑块布局) return false;
    const { thumb热区 } = this.动画时长滑块布局;
    if (!thumb热区) return false;
    return (
      坐标.x >= thumb热区.x &&
      坐标.x <= thumb热区.x + thumb热区.w &&
      坐标.y >= thumb热区.y &&
      坐标.y <= thumb热区.y + thumb热区.h
    );
  }

  命中端点停留滑块(坐标) {
    if (!this.端点停留滑块布局) return false;
    const { 热区 } = this.端点停留滑块布局;
    if (!热区) return false;
    return 坐标.x >= 热区.x && 坐标.x <= 热区.x + 热区.w && 坐标.y >= 热区.y && 坐标.y <= 热区.y + 热区.h;
  }

  命中端点停留thumb(坐标) {
    if (!this.端点停留滑块布局) return false;
    const { thumb热区 } = this.端点停留滑块布局;
    if (!thumb热区) return false;
    return (
      坐标.x >= thumb热区.x &&
      坐标.x <= thumb热区.x + thumb热区.w &&
      坐标.y >= thumb热区.y &&
      坐标.y <= thumb热区.y + thumb热区.h
    );
  }

  命中实时控制点开关(坐标) {
    if (!this.实时控制点开关布局) return false;
    const { x, y, w, h } = this.实时控制点开关布局;
    return 坐标.x >= x && 坐标.x <= x + w && 坐标.y >= y && 坐标.y <= y + h;
  }

  命中其它算法点开关(坐标) {
    if (!this.其它算法点开关布局) return false;
    const { x, y, w, h } = this.其它算法点开关布局;
    return 坐标.x >= x && 坐标.x <= x + w && 坐标.y >= y && 坐标.y <= y + h;
  }

  命中显示t开关(坐标) {
    if (!this.显示t开关布局) return false;
    const { x, y, w, h } = this.显示t开关布局;
    return 坐标.x >= x && 坐标.x <= x + w && 坐标.y >= y && 坐标.y <= y + h;
  }

  命中播放开关(坐标) {
    if (!this.播放开关布局) return false;
    const { x, y, w, h } = this.播放开关布局;
    return 坐标.x >= x && 坐标.x <= x + w && 坐标.y >= y && 坐标.y <= y + h;
  }

  获取滑块状态(类型) {
    if (类型 === "端点") {
      if (this.拖拽停留滑块) return "拖拽";
      if (this.悬停停留thumb || this.悬停停留滑块) return "悬停";
      return "正常";
    }
    if (类型 === "t") {
      if (this.拖拽t滑块) return "拖拽";
      if (this.悬停t滑块) return "悬停";
      return "正常";
    }
    if (this.拖拽滑块) return "拖拽";
    if (this.悬停滑块) return "悬停";
    return "正常";
  }

  获取滑块thumb状态(类型) {
    if (类型 === "端点") {
      if (this.拖拽停留滑块) return "拖拽";
      if (this.悬停停留thumb) return "悬停";
      return "正常";
    }
    if (类型 === "t") {
      if (this.拖拽t滑块) return "拖拽";
      if (this.悬停tThumb) return "悬停";
      return "正常";
    }
    if (this.拖拽滑块) return "拖拽";
    if (this.悬停thumb) return "悬停";
    return "正常";
  }

  更新实时开关动画(deltaMs) {
    const 更新 = (动画对象) => {
      const 目标 = 动画对象.目标;
      const 当前 = 动画对象.当前;
      if (当前 === 目标) return;
      const 速度 = deltaMs / 250;
      const 差 = 目标 - 当前;
      const 更新值 = 当前 + Math.sign(差) * Math.min(Math.abs(差), 速度);
      动画对象.当前 = Math.max(0, Math.min(1, 更新值));
    };

    更新(this.实时控制点开关动画);
    更新(this.其它算法点开关动画);
    更新(this.显示t开关动画);
    更新(this.播放开关动画);
  }

  绘制控制点连线(p0, p1, p2, p3) {
    this.上下文.save();
    this.上下文.strokeStyle = "#48a";
    this.上下文.lineWidth = 1;
    this.上下文.setLineDash([7, 7]);

    this.上下文.beginPath();
    this.上下文.moveTo(p0.x, p0.y);
    this.上下文.lineTo(p1.x, p1.y);
    this.上下文.moveTo(p2.x, p2.y);
    this.上下文.lineTo(p3.x, p3.y);
    this.上下文.stroke();
    this.上下文.restore();
  }

  绘制控制点(p0, p1, p2, p3) {
    this.控制点 = [p0, p1, p2, p3];

    this.控制点.forEach((点, 索引) => {
      let 填充颜色 = this.点样式.正常;
      if (点 === this.当前拖拽点) {
        填充颜色 = this.点样式.拖拽;
      } else if (点 === this.当前悬停点) {
        填充颜色 = this.点样式.悬停;
      }

      // 绘制点
      this.上下文.beginPath();
      this.上下文.arc(点.x, 点.y, this.点半径, 0, Math.PI * 2);
      this.上下文.fillStyle = 填充颜色;
      this.上下文.fill();
      this.上下文.strokeStyle = this.点样式.边框;
      this.上下文.lineWidth = 2;
      this.上下文.stroke();

      // 绘制点的标签
      this.上下文.font = "18px Google Sans Code, Consolas, Noto Sans SC, 微软雅黑, sans-serif";
      const 单字符宽度 = this.上下文.measureText("P").width;
      this.上下文.fillStyle = "rgba(142, 159, 175, 1)";
      this.上下文.textAlign = "center";
      this.上下文.textBaseline = "middle";
      this.上下文.fillText("P", 点.x - 32, 点.y - 22);
      this.上下文.fillStyle = "rgba(172, 211, 243, 1)";
      this.上下文.fillText(`${索引}`, 点.x - 32 + 单字符宽度 + 2, 点.y - 22);
    });
  }

  绘制参数区() {
    const ctx = this.上下文;
    const 区宽度 = 460;
    const 行间距 = 20;
    const 内边距 = 20;
    const 开关高 = 28;
    const 滑块行高 = 42;
    const 开关行数 = 3;
    const 滑块行数 = 3;
    const 行总数 = 开关行数 + 滑块行数;
    const 内容高度 = 开关高 * 开关行数 + 滑块行高 * 滑块行数 + 行间距 * (行总数 - 1);
    const 区高度 = 内容高度 + 内边距 * 2;
    const 左 = 24;
    const 下边距 = 24;
    const 顶 = this.画布.height - 区高度 - 下边距;
    const 标题 = "动画时长";
    const t标题文本 = "t";
    const 停留标题文本 = "端点停留";

    ctx.font = this.滑块样式.文本.标题.字体;
    const 滑块标题最大宽 = Math.max(
      ctx.measureText(t标题文本).width,
      ctx.measureText(标题).width,
      ctx.measureText(停留标题文本).width
    );

    ctx.save();
    const 绘制圆角矩形 = (x, y, w, h, r) => {
      const 半径 = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 半径);
    };

    绘制圆角矩形(左, 顶, 区宽度, 区高度, 14);
    ctx.fillStyle = "rgba(12, 16, 24, 0.82)";
    ctx.fill();

    const 开关宽 = 52;
    const 行起点x = 左 + 内边距;
    const 行1y = 顶 + 内边距 + 6;
    const 标签间隙 = 12;
    const 行2文字间隙 = 4;

    ctx.font = "18px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    const 行t文字前 = "显示";
    const 行t文字t = "t";
    const 行t宽前 = ctx.measureText(行t文字前).width;
    const 行t宽t = ctx.measureText(行t文字t).width;
    const 行t宽 = 行t宽前 + 行2文字间隙 + 行t宽t;
    const 行实时文字 = "显示实时控制点";
    const 行实时宽 = ctx.measureText(行实时文字).width;
    const 行其它文字 = "显示其它算法点";
    const 行其它宽 = ctx.measureText(行其它文字).width;
    const 标签宽 = Math.max(行t宽, 行实时宽, 行其它宽);

    // 行1：显示t
    ctx.font = "18px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const 行1文本起点 = 行起点x + (标签宽 - 行t宽);
    ctx.fillStyle = "rgba(210, 220, 235, 0.82)";
    ctx.fillText(行t文字前, 行1文本起点, 行1y + 开关高 / 2);
    ctx.fillStyle = "#5fc5ff";
    ctx.fillText(行t文字t, 行1文本起点 + 行t宽前 + 行2文字间隙, 行1y + 开关高 / 2);
    const 行1开关x = 行起点x + 标签宽 + 标签间隙;

    this.绘制开关({
      x: 行1开关x,
      y: 行1y,
      宽: 开关宽,
      高: 开关高,
      开: this.显示t,
      悬停: this.悬停显示t开关,
      进度: this.显示t开关动画.当前,
    });

    // 行2：显示实时控制点
    const 行2y = 行1y + 开关高 + 行间距;
    ctx.font = "18px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const 行2文本起点 = 行起点x + (标签宽 - 行实时宽);
    ctx.fillStyle = "rgba(210, 220, 235, 0.82)";
    ctx.fillText(行实时文字, 行2文本起点, 行2y + 开关高 / 2);
    const 行2开关x = 行起点x + 标签宽 + 标签间隙;

    this.绘制开关({
      x: 行2开关x,
      y: 行2y,
      宽: 开关宽,
      高: 开关高,
      开: this.显示实时控制点,
      悬停: this.悬停实时控制点开关,
      进度: this.实时控制点开关动画.当前,
    });

    // 行3：显示其它算法点
    const 行3y = 行2y + 开关高 + 行间距;
    ctx.font = "18px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const 行3文本起点 = 行起点x + (标签宽 - 行其它宽);
    ctx.fillStyle = "rgba(210, 220, 235, 0.82)";
    ctx.fillText(行其它文字, 行3文本起点, 行3y + 开关高 / 2);
    const 行3开关x = 行起点x + 标签宽 + 标签间隙;

    this.绘制开关({
      x: 行3开关x,
      y: 行3y,
      宽: 开关宽,
      高: 开关高,
      开: this.显示其它算法点,
      悬停: this.悬停其它算法点开关,
      进度: this.其它算法点开关动画.当前,
    });

    const t滑块顶 = 行3y + 开关高 + 行间距;
    const t基线 = t滑块顶 + 滑块行高 / 2 - 4;
    ctx.font = this.滑块样式.文本.标题.字体;
    ctx.fillStyle = this.滑块样式.文本.标题.颜色;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(t标题文本, 左 + 内边距 + 滑块标题最大宽, t基线);

    const t轨道起点 = 左 + 内边距 + 滑块标题最大宽 + 18;
    const t轨道终点 = 左 + 区宽度 - 内边距 - 110;
    const t轨道长度 = Math.max(40, t轨道终点 - t轨道起点);
    const t轨道Y = t基线 - 2;

    const t滑块状态 = this.获取滑块状态("t");
    const tthumb状态 = this.获取滑块thumb状态("t");

    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.strokeStyle = this.滑块样式.轨道[t滑块状态];
    ctx.beginPath();
    ctx.moveTo(t轨道起点, t轨道Y);
    ctx.lineTo(t轨道起点 + t轨道长度, t轨道Y);
    ctx.stroke();

    const t比例 = Math.max(0, Math.min(1, this.当前t));
    const t滑块x = t轨道起点 + t比例 * t轨道长度;

    ctx.strokeStyle = this.滑块样式.进度[t滑块状态];
    ctx.beginPath();
    ctx.moveTo(t轨道起点, t轨道Y);
    ctx.lineTo(t滑块x, t轨道Y);
    ctx.stroke();

    this.绘制滑块thumb({
      x: t滑块x,
      y: t轨道Y,
      状态: tthumb状态,
    });

    const t值文本 = this.当前t.toFixed(2);

    ctx.font = this.滑块样式.文本.值.字体;
    ctx.textAlign = "left";
    const t值起点 = t轨道起点 + t轨道长度 + 22;
    let t当前x = t值起点;
    for (let i = 0; i < t值文本.length; i++) {
      const 字符 = t值文本[i];
      ctx.fillStyle = 字符 === "." ? "#888" : this.滑块样式.文本.值.颜色;
      ctx.fillText(字符, t当前x, t基线);
      t当前x += ctx.measureText(字符).width;
    }

    this.t滑块布局 = {
      轨道起点: t轨道起点,
      轨道终点: t轨道起点 + t轨道长度,
      轨道Y: t轨道Y,
      半径: 12,
      热区: {
        x: t轨道起点 - this.滑块样式.热区容差.轨道.水平,
        y: t轨道Y + ctx.lineWidth / 2 - this.滑块样式.热区容差.轨道.垂直,
        w: t轨道长度 + this.滑块样式.热区容差.轨道.水平 * 2,
        h: this.滑块样式.热区容差.轨道.垂直 * 2,
      },
      thumb热区: {
        x: t滑块x - this.滑块样式.热区容差.thumb.水平,
        y: t轨道Y + ctx.lineWidth / 2 - this.滑块样式.热区容差.thumb.垂直,
        w: this.滑块样式.热区容差.thumb.水平 * 2,
        h: this.滑块样式.热区容差.thumb.垂直 * 2,
      },
    };

    const 动画滑块顶 = t滑块顶 + 滑块行高 + 行间距;
    const 动画基线 = 动画滑块顶 + 滑块行高 / 2 - 10;
    ctx.font = this.滑块样式.文本.标题.字体;
    ctx.fillStyle = this.滑块样式.文本.标题.颜色;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(标题, 左 + 内边距 + 滑块标题最大宽, 动画基线);

    const 轨道起点 = 左 + 内边距 + 滑块标题最大宽 + 18;
    const 轨道终点 = 左 + 区宽度 - 内边距 - 110;
    const 轨道长度 = Math.max(40, 轨道终点 - 轨道起点);
    const 轨道Y = 动画基线 - 2;

    const 滑块状态 = this.获取滑块状态("动画");
    const thumb状态 = this.获取滑块thumb状态("动画");

    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.strokeStyle = this.滑块样式.轨道[滑块状态];
    ctx.beginPath();
    ctx.moveTo(轨道起点, 轨道Y);
    ctx.lineTo(轨道起点 + 轨道长度, 轨道Y);
    ctx.stroke();

    const 比例 = (this.动画时长 - this.动画时长范围.最小) / (this.动画时长范围.最大 - this.动画时长范围.最小);
    const 规范化比例 = Math.max(0, Math.min(1, 比例));
    const 滑块x = 轨道起点 + 规范化比例 * 轨道长度;

    ctx.strokeStyle = this.滑块样式.进度[滑块状态];
    ctx.beginPath();
    ctx.moveTo(轨道起点, 轨道Y);
    ctx.lineTo(滑块x, 轨道Y);
    ctx.stroke();

    this.绘制滑块thumb({
      x: 滑块x,
      y: 轨道Y,
      状态: thumb状态,
    });

    const 数值文本 = `${this.动画时长}`;
    const 单位文本 = "ms";
    const 数值单位间距 = this.滑块样式.文本.值与单位间距;

    ctx.font = this.滑块样式.文本.值.字体;
    ctx.fillStyle = this.滑块样式.文本.值.颜色;
    ctx.textAlign = "left";
    const 数值起点 = 轨道起点 + 轨道长度 + 22;
    ctx.fillText(数值文本, 数值起点, 动画基线);
    const 数值宽度 = ctx.measureText(数值文本).width;

    ctx.font = this.滑块样式.文本.单位.字体;
    ctx.fillStyle = this.滑块样式.文本.单位.颜色;
    ctx.fillText(单位文本, 数值起点 + 数值宽度 + 数值单位间距, 动画基线);

    this.动画时长滑块布局 = {
      轨道起点,
      轨道终点: 轨道起点 + 轨道长度,
      轨道Y,
      半径: 12,
      热区: {
        x: 轨道起点 - this.滑块样式.热区容差.轨道.水平,
        y: 轨道Y + ctx.lineWidth / 2 - this.滑块样式.热区容差.轨道.垂直,
        w: 轨道长度 + this.滑块样式.热区容差.轨道.水平 * 2,
        h: this.滑块样式.热区容差.轨道.垂直 * 2,
      },
      thumb热区: {
        x: 滑块x - this.滑块样式.热区容差.thumb.水平,
        y: 轨道Y + ctx.lineWidth / 2 - this.滑块样式.热区容差.thumb.垂直,
        w: this.滑块样式.热区容差.thumb.水平 * 2,
        h: this.滑块样式.热区容差.thumb.垂直 * 2,
      },
    };

    this.实时控制点开关布局 = {
      x: 行2开关x,
      y: 行2y,
      w: 开关宽,
      h: 开关高,
    };

    this.显示t开关布局 = {
      x: 行1开关x,
      y: 行1y,
      w: 开关宽,
      h: 开关高,
    };

    this.其它算法点开关布局 = {
      x: 行3开关x,
      y: 行3y,
      w: 开关宽,
      h: 开关高,
    };

    // 端点停留滑块
    const 停留滑块顶 = 动画滑块顶 + 滑块行高 + 行间距 - 10;
    const 停留基线 = 停留滑块顶 + 滑块行高 / 2 - 4;
    ctx.font = this.滑块样式.文本.标题.字体;
    ctx.fillStyle = this.滑块样式.文本.标题.颜色;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(停留标题文本, 左 + 内边距 + 滑块标题最大宽, 停留基线);

    const 停留轨道起点 = 左 + 内边距 + 滑块标题最大宽 + 18;
    const 停留轨道终点 = 左 + 区宽度 - 内边距 - 110;
    const 停留轨道长度 = Math.max(40, 停留轨道终点 - 停留轨道起点);
    const 停留轨道Y = 停留基线 - 2;

    const 停留状态 = this.获取滑块状态("端点");
    const 停留thumb状态 = this.获取滑块thumb状态("端点");

    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.strokeStyle = this.滑块样式.轨道[停留状态];
    ctx.beginPath();
    ctx.moveTo(停留轨道起点, 停留轨道Y);
    ctx.lineTo(停留轨道起点 + 停留轨道长度, 停留轨道Y);
    ctx.stroke();

    const 停留比例 = (this.端点停留 - this.端点停留范围.最小) / (this.端点停留范围.最大 - this.端点停留范围.最小);
    const 停留规范化 = Math.max(0, Math.min(1, 停留比例));
    const 停留x = 停留轨道起点 + 停留规范化 * 停留轨道长度;

    ctx.strokeStyle = this.滑块样式.进度[停留状态];
    ctx.beginPath();
    ctx.moveTo(停留轨道起点, 停留轨道Y);
    ctx.lineTo(停留x, 停留轨道Y);
    ctx.stroke();

    this.绘制滑块thumb({
      x: 停留x,
      y: 停留轨道Y,
      状态: 停留thumb状态,
    });

    const 停留值文本 = `${this.端点停留}`;
    const 停留单位文本 = "ms";

    ctx.font = this.滑块样式.文本.值.字体;
    ctx.fillStyle = this.滑块样式.文本.值.颜色;
    ctx.textAlign = "left";
    const 停留值起点 = 停留轨道起点 + 停留轨道长度 + 22;
    ctx.fillText(停留值文本, 停留值起点, 停留基线);
    const 停留值宽 = ctx.measureText(停留值文本).width;

    ctx.font = this.滑块样式.文本.单位.字体;
    ctx.fillStyle = this.滑块样式.文本.单位.颜色;
    ctx.fillText(停留单位文本, 停留值起点 + 停留值宽 + 数值单位间距, 停留基线);

    this.端点停留滑块布局 = {
      轨道起点: 停留轨道起点,
      轨道终点: 停留轨道起点 + 停留轨道长度,
      轨道Y: 停留轨道Y,
      半径: 12,
      热区: {
        x: 停留轨道起点 - this.滑块样式.热区容差.轨道.水平,
        y: 停留轨道Y + ctx.lineWidth / 2 - this.滑块样式.热区容差.轨道.垂直,
        w: 停留轨道长度 + this.滑块样式.热区容差.轨道.水平 * 2,
        h: this.滑块样式.热区容差.轨道.垂直 * 2,
      },
      thumb热区: {
        x: 停留x - this.滑块样式.热区容差.thumb.水平,
        y: 停留轨道Y + ctx.lineWidth / 2 - this.滑块样式.热区容差.thumb.垂直,
        w: this.滑块样式.热区容差.thumb.水平 * 2,
        h: this.滑块样式.热区容差.thumb.垂直 * 2,
      },
    };

    ctx.restore();
  }

  绘制滑块thumb({ x, y, 状态 }) {
    const ctx = this.上下文;
    const 填充色 = this.滑块样式.thumb填充[状态];
    const 边框色 = this.滑块样式.thumb描边[状态];
    ctx.fillStyle = 填充色;
    ctx.strokeStyle = 边框色;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  绘制开关({ x, y, 宽, 高, 开, 悬停, 进度 }) {
    y -= 2;
    const ctx = this.上下文;
    const 半径 = 高 / 2;
    const 动画进度 = typeof 进度 === "number" ? Math.max(0, Math.min(1, 进度)) : 开 ? 1 : 0;
    const 混合 = (a, b) => a + (b - a) * 动画进度;
    const 拇指半径 = 高 / 2 - 3;
    const 拇指x = x + 半径 + 动画进度 * (宽 - 半径 * 2);

    const 轨道透明 = Math.min(0.9, 混合(0.1, 0.4) + (悬停 ? 0.05 : 0));
    const 边透明 = Math.min(1, 混合(0.45, 0.7) + (悬停 ? 0.05 : 0));
    const 拇指r = Math.round(混合(17, 255));
    const 拇指g = Math.round(混合(24, 255));
    const 拇指b = Math.round(混合(34, 255));
    const 拇指边透明 = Math.min(1, 混合(0.7, 0.9) + (悬停 ? 0.05 : 0));

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, 宽, 高, 半径);
    ctx.fillStyle = `rgba(255, 255, 255, ${轨道透明})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${边透明})`;
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(拇指x, y + 高 / 2, 拇指半径, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${拇指r}, ${拇指g}, ${拇指b})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${拇指边透明})`;
    ctx.lineWidth = 1.5;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  绘制播放按钮({ x, y, 半径 = 18, 悬停 = false, 播放 = true, 进度 = 1 }) {
    const ctx = this.上下文;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const 动画进度 = clamp(进度 ?? (播放 ? 1 : 0), 0, 1);
    const 混合 = (a, b) => a + (b - a) * 动画进度;

    const 关闭色 = { r: 50, g: 102, b: 68 };
    const 开启色 = 播放 ? { r: 122, g: 40, b: 38 } : { r: 70, g: 140, b: 100 };
    const r = Math.round(混合(关闭色.r, 开启色.r) + (悬停 ? 10 : 0));
    const g = Math.round(混合(关闭色.g, 开启色.g) + (悬停 ? 10 : 0));
    const b = Math.round(混合(关闭色.b, 开启色.b) + (悬停 ? 10 : 0));
    const 外描边透明 = 悬停 ? 0.9 : 0.7;
    const 内晕染透明 = 0.15 + 动画进度 * 0.15 + (悬停 ? 0.05 : 0);

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 半径, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${外描边透明})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = "transparent";
    ctx.beginPath();
    ctx.arc(x, y, 半径 - 4, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, 0)`;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#fefefe";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = 1;

    if (播放) {
      const 条宽 = 半径 * 0.24;
      const 条高 = 半径 * 0.9;
      const 间隙 = 半径 * 0.18;
      const 顶 = y - 条高 / 2;
      ctx.beginPath();
      ctx.roundRect(x - 间隙 - 条宽, 顶, 条宽, 条高, 3);
      ctx.roundRect(x + 间隙, 顶, 条宽, 条高, 3);
      ctx.fill();
      ctx.stroke();
    } else {
      const 边 = 半径 * 0.95;
      ctx.beginPath();
      ctx.moveTo(x - 边 * 0.3, y - 边 / 2);
      ctx.lineTo(x - 边 * 0.3, y + 边 / 2);
      ctx.lineTo(x + 边 * 0.45, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  绘制t文本({ p0, p1, p2, p3 }) {
    const ctx = this.上下文;
    const 计算点 = (u) => {
      const iu = 1 - u;
      const iu2 = iu * iu;
      const iu3 = iu2 * iu;
      const u2 = u * u;
      const u3 = u2 * u;
      return {
        x: iu3 * p0.x + 3 * iu2 * u * p1.x + 3 * iu * u2 * p2.x + u3 * p3.x,
        y: iu3 * p0.y + 3 * iu2 * u * p1.y + 3 * iu * u2 * p2.y + u3 * p3.y,
      };
    };

    let 最大y = -Infinity;
    const 采样数 = 160;
    for (let i = 0; i <= 采样数; i++) {
      const 比例 = i / 采样数;
      const 点 = 计算点(比例);
      if (点.y > 最大y) 最大y = 点.y;
    }

    const 文本y = Math.min(window.innerHeight * this.dpr * 0.9, 最大y + 50);
    const 文本x中心 = (p0.x + p3.x) / 2;

    const t值 = Math.max(0, Math.min(1, this.当前t || 0));
    const t字符串 = t值.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    const 颜色表 = {
      t: "#5fc5ff",
      等号: "#9fb4c8",
      数字: "#ffd166",
      点: "gray",
    };

    ctx.save();
    ctx.font = "24px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    const 获取颜色 = (字符) => {
      if (字符 === "t") return 颜色表.t;
      if (字符 === "=") return 颜色表.等号;
      if (字符 === ".") return 颜色表.点;
      return 颜色表.数字;
    };

    const 间隔固定 = 8;
    const t宽 = ctx.measureText("t").width;
    const 等号宽 = ctx.measureText("=").width;
    const 模板数字 = "0.05";
    const 模板数字宽 = ctx.measureText(模板数字).width;
    const 模板宽 = t宽 + 等号宽 + 模板数字宽 + 间隔固定 * 2;
    const 文本起点 = 文本x中心 - 模板宽 / 2;
    const 按钮半径 = 24;
    const 按钮间距 = 18;
    const 按钮中心x = 文本起点 - 按钮间距 - 按钮半径 - 20;
    const 按钮中心y = 文本y;

    this.绘制播放按钮({
      x: 按钮中心x,
      y: 按钮中心y,
      半径: 按钮半径,
      悬停: this.悬停播放开关,
      播放: this.播放,
      进度: this.播放开关动画.当前,
    });

    this.播放开关布局 = {
      x: 按钮中心x - 按钮半径,
      y: 按钮中心y - 按钮半径,
      w: 按钮半径 * 2,
      h: 按钮半径 * 2,
    };

    if (!this.显示t) {
      ctx.restore();
      return;
    }

    let 当前x = 文本起点;

    // t
    ctx.fillStyle = 获取颜色("t");
    ctx.fillText("t", 当前x, 文本y);
    当前x += t宽 + 间隔固定;

    // =
    ctx.fillStyle = 获取颜色("=");
    ctx.fillText("=", 当前x, 文本y);
    当前x += 等号宽 + 间隔固定;

    // 数字部分（含小数点逐字符着色）
    const 数字串 = t字符串;
    for (let i = 0; i < 数字串.length; i++) {
      const 字符 = 数字串[i];
      ctx.fillStyle = 获取颜色(字符);
      ctx.fillText(字符, 当前x, 文本y);
      当前x += ctx.measureText(字符).width;
    }

    ctx.restore();
  }

  绘制实时控制点({ p0, p1, p2, p3, p01, p012, p0123, p12, p23, p123 }) {
    if (!this.显示实时控制点) return;
    const ctx = this.上下文;
    ctx.save();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#aaa";
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p01.x, p01.y);
    ctx.moveTo(p012.x, p012.y);
    ctx.lineTo(p0123.x, p0123.y);
    ctx.stroke();

    const 画点 = (点) => {
      ctx.beginPath();
      ctx.arc(点.x, 点.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    };

    const 标签颜色 = {
      p: "#5fc5ff",
      t: "#7ed0ff",
      数字: "#ffd166",
      下划线: "#9fb4c8",
    };

    const 绘制标签 = (点, 文本) => {
      ctx.font = "18px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      const 总宽 = ctx.measureText(文本).width;
      let x = 点.x - 12 - 总宽; // 文本整体放在点左侧
      const y = 点.y + 20;
      for (let i = 0; i < 文本.length; i++) {
        const 字符 = 文本[i];
        let 颜色 = 标签颜色.数字;
        if (字符 === "p") 颜色 = 标签颜色.p;
        else if (字符 === "t") 颜色 = 标签颜色.t;
        else if (字符 === "_") 颜色 = 标签颜色.下划线;
        ctx.fillStyle = 颜色;
        ctx.fillText(字符, x, y);
        x += ctx.measureText(字符).width;
      }
    };

    const 实时点列表 = [
      { 点: p01, 文本: "p1_t" },
      { 点: p012, 文本: "p2_t" },
      { 点: p0123, 文本: "p3_t" },
    ];

    实时点列表.forEach(({ 点, 文本 }) => {
      if (!点) return;
      画点(点);
      绘制标签(点, 文本);
    });

    if (this.显示其它算法点) {
      this.其它算法点 = [];
      const 其它点颜色 = {
        填充: "#ffb347",
        描边: "#b36b00",
        标签p: "#d8973cff",
        标签数字: "#ffd166",
        标签下划线: "#9fb4c8",
      };

      const 画其它点 = (点) => {
        ctx.beginPath();
        ctx.arc(点.x, 点.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 其它点颜色.填充;
        ctx.strokeStyle = 其它点颜色.描边;
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();
      };

      const 绘制其它标签 = (点, 文本) => {
        ctx.font = "18px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "left";
        const 总宽 = ctx.measureText(文本).width;
        let x = 点.x - 12 - 总宽;
        const y = 点.y - 12; // 左下方
        for (let i = 0; i < 文本.length; i++) {
          const 字符 = 文本[i];
          let 颜色 = 其它点颜色.标签数字;
          if (字符 === "p") 颜色 = 其它点颜色.标签p;
          else if (字符 === "_") 颜色 = 其它点颜色.标签下划线;
          ctx.fillStyle = 颜色;
          ctx.fillText(字符, x, y);
          x += ctx.measureText(字符).width;
        }
      };

      const 其它列表 = [
        { 名称: "p12", 点: p12, 文本: "p12", 源: [p1, p2] },
        { 名称: "p23", 点: p23, 文本: "p23", 源: [p2, p3] },
        { 名称: "p123", 点: p123, 文本: "p12_23", 源: [p12, p23] },
      ];

      其它列表.forEach(({ 名称, 点, 文本, 源 }) => {
        if (!点) return;
        this.其它算法点.push({ 名称, 点, 源 });
        画其它点(点);
        绘制其它标签(点, 文本);
      });

      // 悬停时高亮对应的源线段，仅在暂停状态下提示来源
      if (
        !this.播放 &&
        this.当前悬停其它点 &&
        this.当前悬停其它点.源?.length === 2 &&
        this.当前悬停其它点.名称 !== "p23"
      ) {
        const [源起, 源终] = this.当前悬停其它点.源;
        if (源起 && 源终) {
          ctx.save();
          ctx.lineWidth = 3;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(源起.x, 源起.y);
          ctx.lineTo(源终.x, 源终.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    } else {
      this.其它算法点 = [];
      this.当前悬停其它点 = null;
    }

    ctx.restore();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const 绘图演示 = new 绘图器();

  const 控制点存储键 = 绘图演示.存储键.控制点;

  const 读取控制点存储 = () => {
    const 原始 = sessionStorage.getItem(控制点存储键);
    if (!原始) return null;
    try {
      const 数据 = JSON.parse(原始);
      if (
        Array.isArray(数据) &&
        数据.length === 4 &&
        数据.every((项) => 项 && typeof 项.x === "number" && typeof 项.y === "number")
      ) {
        return 数据.map((项) => ({ x: 项.x, y: 项.y }));
      }
    } catch (e) {
      // ignore parse error
    }
    return null;
  };

  const 保存控制点到存储 = () => {
    if (!p0 || !p1 || !p2 || !p3) return;
    const 数据 = [p0, p1, p2, p3].map((点) => ({ x: 点.x, y: 点.y }));
    sessionStorage.setItem(控制点存储键, JSON.stringify(数据));
  };

  // 初始化控制点
  let p0, p1, p2, p3;

  const 应用默认控制点 = () => {
    const 宽度 = 绘图演示.画布.width;
    const 高度 = 绘图演示.画布.height;

    p0 = { x: 宽度 * 0.1, y: 高度 / 3 * 2 };
    p1 = { x: 宽度 / 4, y: 高度 * 0.15 };
    p2 = { x: (宽度 * 3) / 4, y: 高度 * 0.85 };
    p3 = { x: 宽度 * 0.9, y: 高度 / 3 };
  };

  const 更新控制点 = () => {
    const 存储控制点 = 读取控制点存储();
    if (存储控制点) {
      [p0, p1, p2, p3] = 存储控制点;
    } else {
      应用默认控制点();
    }
    保存控制点到存储();
  };

  // 初始更新控制点
  更新控制点();

  // 保存原始初始化方法
  const 原始初始化 = 绘图演示.初始化;

  // 重写初始化方法，加入更新控制点逻辑
  绘图演示.初始化 = function () {
    原始初始化.call(this);
    更新控制点();
  };

  绘图演示.控制点变化回调 = (点列表) => {
    if (!Array.isArray(点列表) || 点列表.length !== 4) return;
    const 新点 = 点列表.map((点) => ({ x: 点.x, y: 点.y }));
    [p0, p1, p2, p3] = 新点;
    保存控制点到存储();
  };

  let 上一帧时间 = null;
  let 累计时间 = 0;

  const 重置按钮 = document.querySelector(".重置按钮");
  if (重置按钮) {
    重置按钮.addEventListener("click", () => {
      // 保留当前参数，仅把进度重置到起点并立即播放
      累计时间 = 0;
      上一帧时间 = null;
      绘图演示.当前t = 0;
      绘图演示.手动t = null;
      绘图演示.播放 = true;
      绘图演示.播放开关动画.目标 = 1;
      绘图演示.播放开关动画.当前 = 1;
      绘图演示.保存状态();
    });
  }

  function 动画(当前时间) {
    if (上一帧时间 === null) {
      上一帧时间 = 当前时间;
    }

    const deltaMs = 当前时间 - 上一帧时间;
    上一帧时间 = 当前时间;

    绘图演示.上次时间戳 = 当前时间;
    绘图演示.更新实时开关动画(deltaMs);

    if (绘图演示.播放) {
      累计时间 += deltaMs;
    }

    let t;
    if (绘图演示.播放) {
      const 周期 = 绘图演示.动画时长 * 2 + 绘图演示.端点停留 * 2;
      const 周期位置 = 周期 === 0 ? 0 : 累计时间 % 周期;

      if (周期位置 < 绘图演示.端点停留) {
        t = 0;
      } else if (周期位置 < 绘图演示.端点停留 + 绘图演示.动画时长) {
        const 进程 = 周期位置 - 绘图演示.端点停留;
        t = 进程 / 绘图演示.动画时长;
      } else if (周期位置 < 绘图演示.端点停留 + 绘图演示.动画时长 + 绘图演示.端点停留) {
        t = 1;
      } else {
        const 回程 = 周期位置 - (绘图演示.端点停留 + 绘图演示.动画时长 + 绘图演示.端点停留);
        t = 1 - 回程 / 绘图演示.动画时长;
      }

      绘图演示.手动t = null;
    } else {
      t = 绘图演示.手动t ?? 绘图演示.当前t ?? 0;
    }

    绘图演示.当前t = t;

    绘图演示.清空画布();

    绘图演示.上下文.strokeStyle = "#052";
    绘图演示.上下文.lineWidth = 2;
    绘图演示.上下文.beginPath();
    绘图演示.上下文.moveTo(p0.x, p0.y);
    绘图演示.上下文.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    绘图演示.上下文.stroke();

    绘图演示.绘制贝塞尔曲线进度(p0, p1, p2, p3, t, { 颜色: "#00ff00", 线宽: 4 });

    const 计算中间点 = (a, b, 比例) => ({ x: a.x + (b.x - a.x) * 比例, y: a.y + (b.y - a.y) * 比例 });
    const p01 = 计算中间点(p0, p1, t);
    const p12 = 计算中间点(p1, p2, t);
    const p23 = 计算中间点(p2, p3, t);
    const p012 = 计算中间点(p01, p12, t);
    const p123 = 计算中间点(p12, p23, t);
    const p0123 = 计算中间点(p012, p123, t);

    绘图演示.绘制控制点连线(p0, p1, p2, p3);
    绘图演示.绘制实时控制点({ p0, p1, p2, p3, p01, p012, p0123, p12, p23, p123 });
    绘图演示.绘制t文本({ p0, p1, p2, p3 });
    绘图演示.绘制控制点(p0, p1, p2, p3);
    绘图演示.绘制参数区();

    requestAnimationFrame(动画);
  }

  requestAnimationFrame(动画);
});
