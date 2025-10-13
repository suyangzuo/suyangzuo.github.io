class 随心绘 {
  constructor() {
    this.canvas = document.getElementById("画布");
    this.基础形状分区组 = document.getElementsByClassName("基础形状分区");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.画布边界矩形 = this.canvas.getBoundingClientRect();
    window.addEventListener("resize", () => {
      this.画布边界矩形 = this.canvas.getBoundingClientRect();
      this.canvas.width = this.canvas.offsetWidth * this.dpr;
      this.canvas.height = this.canvas.offsetHeight * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);
      this.绘制基础形状对象组();
    });
    document.addEventListener("scroll", () => {
      this.画布边界矩形 = this.canvas.getBoundingClientRect();
    });

    this.本地存储池 = {
      播放音效:
        JSON.parse(localStorage.getItem("播放音效")) === null ? true : JSON.parse(localStorage.getItem("播放音效")),
      辅助视觉效果:
        JSON.parse(localStorage.getItem("辅助视觉效果")) === null
          ? true
          : JSON.parse(localStorage.getItem("辅助视觉效果")),
    };

    this.辅助 = {
      视觉效果复选框: document.getElementById("辅助视觉效果"),
      按钮音效复选框: document.getElementById("按钮音效"),
      点击音效对象: new Audio("/Audios/Click.mp3"),
      清空音效: new Audio("/Audios/Clear.mp3"),
    };

    this.辅助.视觉效果复选框.checked = this.本地存储池.辅助视觉效果;
    this.辅助.按钮音效复选框.checked = this.本地存储池.播放音效;

    this.形状处理按钮组 = {
      向上一层: document.getElementById("向上一层"),
      向下一层: document.getElementById("向下一层"),
      置于顶层: document.getElementById("置于顶层"),
      置于底层: document.getElementById("置于底层"),
    };

    this.基础形状单选框组 = {
      矩形: document.getElementById("矩形"),
      圆: document.getElementById("圆"),
      多边形: document.getElementById("多边形"),
      多角星: document.getElementById("多角星"),
      直线: document.getElementById("直线"),
      自由: document.getElementById("自由"),
      选择路径: document.getElementById("选择路径"),
      选框: document.getElementById("选框"),
      当前基础形状单选框: null,
    };

    this.操作说明 = {
      矩形: ["按住 Shift 绘制正方形", "按 ↑ 或 ↓ 调整圆角"],
      圆: ["按住 Shift 绘制正圆", "按 ← 或 → 精细调整旋转弧度", "按 ↑ 或 ↓ 快速调整旋转弧度"],
      多边形: ["按 ↑ 或 ↓ 调整边数", "按 ← 或 → 精细调整起始弧度", "按住 Shift 同时按 ← 或 → 快速调整起始弧度"],
      多角星: [
        "按 ↑ 或 ↓ 调整角数",
        "按 ← 或 → 精细调整起始弧度",
        "按住 Shift 同时按 ← 或 → 快速调整起始弧度",
        "按 [ 或 ] 调整内半径",
      ],
      直线: ["按 Enter 确认", "按 ESC 取消"],
    };

    this.交互框 = null;

    this.全局标志 = {
      左键已按下: false,
      拖拽中: false,
      多边形边数可增减: true,
      多边形可旋转: true,
      手动调整内半径: false,
      辅助视觉效果: this.辅助.视觉效果复选框.checked,
      按钮音效: this.辅助.按钮音效复选框.checked,
    };

    this.全局属性 = {
      已选中基础形状: null,
      填充色: "transparent",
      描边色: "rgba(128, 128, 128, 1)",
      辅助外框描边色: "#aaccee12",
      辅助线段描边色: "#a81",
      选框描边色: "#555",
      选框描边宽度: 1,
      描边宽度: 2,
      悬停描边色: "darkgoldenrod",
      悬停描边宽度: 4,
      多边形边数: 5,
      鼠标坐标: null,
      点击坐标: null,
      初始坐标组: [],
      偏移量: null,
      左键按下时间: null,
      拖拽时间: null,
      鼠标与点击坐标位置关系: {
        上: null,
        左: null,
      },
      悬停形状: null,
      选中形状: null,
    };

    this.当前形状对象 = {
      形状: null,
      坐标: { x: null, y: null },
      顶点坐标组: [],
      外顶点坐标组: [],
      内顶点坐标组: [],
      尺寸: null,
      圆角: 0,
      描边色: "transparent",
      填充色: "transparent",
      描边宽度: 2,
      路径: null,
      已选中: false,
      已悬停: false,
      极值坐标: null,
    };

    this.数据集 = {
      操作记录: [],
      基础形状对象组: [],
    };

    this.键盘状态 = {
      Shift: false,
      Control: false,
      Alt: false,
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      Enter: false,
      Escape: false,
      "[": false,
      "]": false,
      z: false,
      r: false,
      c: false,
      p: false,
      w: false,
      l: false,
      b: false,
      a: false,
      s: false,
    };

    this.快捷键映射 = {
      r: "矩形",
      c: "圆",
      p: "多边形",
      w: "多角星",
      l: "直线",
      b: "自由",
      a: "选择路径",
      s: "选框",
    };

    this.添加颜色拾取器();
    this.添加颜色拾取器事件();
    this.添加描边宽度滑块事件();
    this.添加清空画布按钮点击事件();
    this.添加撤销按钮点击事件();
    this.处理辅助效果选项();
    this.添加键盘事件();
    this.添加canvas按下左键事件();
    this.添加canvas鼠标抬起事件();
    this.添加canvas鼠标移动事件();
    this.添加基础形状分区点击事件();
    this.添加修改形状图层按钮点击事件();
  }

  添加颜色拾取器() {
    this.描边颜色拾取器 = Pickr.create({
      el: ".颜色框",
      theme: "monolith", // or 'monolith', or 'nano'
      default: "rgba(128, 128, 128, 1)",

      swatches: [
        "rgba(128, 128, 128, 1)",
        "white",
        "black",
        "rgba(244, 67, 54, 1)",
        "rgba(233, 30, 99, 1)",
        "rgba(156, 39, 176, 1)",
        "rgba(103, 58, 183, 1)",
        "rgba(63, 81, 181, 1)",
        "rgba(33, 150, 243, 1)",
        "rgba(0, 188, 212, 1)",
        "rgba(0, 150, 136, 1)",
        "rgba(76, 175, 80, 1)",
        "rgba(139, 195, 74, 1)",
        "rgba(255, 235, 59, 1)",
        "rgba(255, 193, 7, 1)",
        "transparent",
      ],

      components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
          hex: true,
          rgba: true,
          input: true,
          clear: true,
          save: true,
        },
      },
    });

    this.填充颜色拾取器 = Pickr.create({
      el: ".颜色框",
      theme: "monolith", // or 'monolith', or 'nano'
      default: "rgba(0, 0, 0, 0)",

      swatches: [
        "transparent",
        "white",
        "black",
        "gray",
        "rgba(244, 67, 54, 1)",
        "rgba(233, 30, 99, 1)",
        "rgba(156, 39, 176, 1)",
        "rgba(103, 58, 183, 1)",
        "rgba(63, 81, 181, 1)",
        "rgba(33, 150, 243, 1)",
        "rgba(0, 188, 212, 1)",
        "rgba(0, 150, 136, 1)",
        "rgba(76, 175, 80, 1)",
        "rgba(139, 195, 74, 1)",
        "rgba(255, 235, 59, 1)",
        "rgba(255, 193, 7, 1)",
      ],

      components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
          hex: true,
          rgba: true,
          input: true,
          clear: true,
          save: true,
        },
      },
    });
  }

  添加颜色拾取器事件() {
    this.描边颜色拾取器.on("changestop", () => {
      this.描边颜色拾取器.applyColor(true);
    });

    this.填充颜色拾取器.on("changestop", () => {
      this.填充颜色拾取器.applyColor(true);
    });

    this.描边颜色拾取器.on("change", (color) => {
      if (this.全局属性.选中形状) {
        this.全局属性.选中形状.描边色 = color.toRGBA().toString();
        this.清空画布();
        this.绘制基础形状对象组();
      } else {
        this.全局属性.描边色 = color.toRGBA().toString();
      }
    });

    this.填充颜色拾取器.on("change", (color) => {
      if (this.全局属性.选中形状) {
        this.全局属性.选中形状.填充色 = color.toRGBA().toString();
        this.清空画布();
        this.绘制基础形状对象组();
      } else {
        this.全局属性.填充色 = color.toRGBA().toString();
      }
    });

    this.描边颜色拾取器.on("swatchselect", (color) => {
      this.描边颜色拾取器.applyColor(true);
      this.全局属性.描边色 = color.toRGBA().toString();
    });

    this.填充颜色拾取器.on("swatchselect", (color) => {
      this.填充颜色拾取器.applyColor(true);
      this.全局属性.填充色 = color.toRGBA().toString();
    });
  }

  添加描边宽度滑块事件() {
    const 描边宽度滑块 = document.getElementById("描边宽度");
    描边宽度滑块.addEventListener("input", () => {
      const 宽度 = parseInt(描边宽度滑块.value, 10);
      描边宽度滑块.nextElementSibling.textContent = 描边宽度滑块.value;
      if (this.全局属性.选中形状) {
        this.全局属性.选中形状.描边宽度 = 宽度;
        this.清空画布();
        this.绘制基础形状对象组();
      } else {
        this.全局属性.描边宽度 = 宽度;
      }
    });
  }

  添加修改形状图层按钮点击事件() {
    const 向上一层按钮 = document.getElementById("向上一层");
    const 向下一层按钮 = document.getElementById("向下一层");
    const 置于顶层按钮 = document.getElementById("置于顶层");
    const 置于底层按钮 = document.getElementById("置于底层");
    向上一层按钮.addEventListener("click", () => {
      if (!this.全局属性.选中形状 || this.数据集.基础形状对象组.length <= 1) return;
      const 选中索引 = this.数据集.基础形状对象组.indexOf(this.全局属性.选中形状);
      if (选中索引 === this.数据集.基础形状对象组.length - 1) return;
      [this.数据集.基础形状对象组[选中索引], this.数据集.基础形状对象组[选中索引 + 1]] = [
        this.数据集.基础形状对象组[选中索引 + 1],
        this.数据集.基础形状对象组[选中索引],
      ];
      this.数据集.操作记录.push({
        操作类型: "交换图层",
        操作数据: [选中索引, 选中索引 + 1],
      });
      this.根据选中形状索引修改处理按钮状态();
      this.清空画布();
      this.绘制基础形状对象组();
    });

    向下一层按钮.addEventListener("click", () => {
      if (!this.全局属性.选中形状 || this.数据集.基础形状对象组.length <= 1) return;
      const 选中索引 = this.数据集.基础形状对象组.indexOf(this.全局属性.选中形状);
      if (选中索引 === 0) return;
      [this.数据集.基础形状对象组[选中索引], this.数据集.基础形状对象组[选中索引 - 1]] = [
        this.数据集.基础形状对象组[选中索引 - 1],
        this.数据集.基础形状对象组[选中索引],
      ];
      this.数据集.操作记录.push({
        操作类型: "交换图层",
        操作数据: [选中索引, 选中索引 - 1],
      });
      this.根据选中形状索引修改处理按钮状态();
      this.清空画布();
      this.绘制基础形状对象组();
    });

    置于顶层按钮.addEventListener("click", () => {
      if (!this.全局属性.选中形状 || this.数据集.基础形状对象组.length <= 1) return;
      const 选中索引 = this.数据集.基础形状对象组.indexOf(this.全局属性.选中形状);
      if (选中索引 === this.数据集.基础形状对象组.length - 1) return;
      [this.数据集.基础形状对象组[选中索引], this.数据集.基础形状对象组[this.数据集.基础形状对象组.length - 1]] = [
        this.数据集.基础形状对象组[this.数据集.基础形状对象组.length - 1],
        this.数据集.基础形状对象组[选中索引],
      ];
      this.数据集.操作记录.push({
        操作类型: "交换图层",
        操作数据: [选中索引, this.数据集.基础形状对象组.length - 1],
      });
      this.根据选中形状索引修改处理按钮状态();
      this.清空画布();
      this.绘制基础形状对象组();
    });

    置于底层按钮.addEventListener("click", () => {
      if (!this.全局属性.选中形状 || this.数据集.基础形状对象组.length <= 1) return;
      const 选中索引 = this.数据集.基础形状对象组.indexOf(this.全局属性.选中形状);
      if (选中索引 === 0) return;
      [this.数据集.基础形状对象组[选中索引], this.数据集.基础形状对象组[0]] = [
        this.数据集.基础形状对象组[0],
        this.数据集.基础形状对象组[选中索引],
      ];
      this.数据集.操作记录.push({
        操作类型: "交换图层",
        操作数据: [选中索引, 0],
      });
      this.根据选中形状索引修改处理按钮状态();
      this.清空画布();
      this.绘制基础形状对象组();
    });
  }

  根据选中形状索引修改处理按钮状态() {
    const 选中索引 = this.数据集.基础形状对象组.indexOf(this.全局属性.选中形状);
    if (选中索引 <= 0) {
      this.形状处理按钮组.向下一层.parentElement.classList.add("禁用");
      this.形状处理按钮组.置于底层.parentElement.classList.add("禁用");
      this.形状处理按钮组.向上一层.parentElement.classList.remove("禁用");
      this.形状处理按钮组.置于顶层.parentElement.classList.remove("禁用");
    } else if (选中索引 >= this.数据集.基础形状对象组.length - 1) {
      this.形状处理按钮组.向上一层.parentElement.classList.add("禁用");
      this.形状处理按钮组.置于顶层.parentElement.classList.add("禁用");
      this.形状处理按钮组.向下一层.parentElement.classList.remove("禁用");
      this.形状处理按钮组.置于底层.parentElement.classList.remove("禁用");
    } else {
      this.形状处理按钮组.向上一层.parentElement.classList.remove("禁用");
      this.形状处理按钮组.向下一层.parentElement.classList.remove("禁用");
      this.形状处理按钮组.置于底层.parentElement.classList.remove("禁用");
      this.形状处理按钮组.置于顶层.parentElement.classList.remove("禁用");
    }
  }

  添加基础形状分区点击事件() {
    for (const 基础形状分区 of this.基础形状分区组) {
      基础形状分区.addEventListener("click", () => {
        this.全局属性.已选中基础形状 = 基础形状分区.getAttribute("形状");
      });
    }
  }

  鼠标位于形状内() {
    if (this.数据集.基础形状对象组.length <= 0) return null;
    for (let i = this.数据集.基础形状对象组.length - 1; i >= 0; i--) {
      const 形状 = this.数据集.基础形状对象组[i];
      if (!形状.路径) continue;
      if (this.交互框) {
        const 鼠标位于交互框内 = this.鼠标位于交互框内();
        this.全局属性.选中形状.已悬停 = 鼠标位于交互框内;
        if (鼠标位于交互框内) {
          if (this.全局属性.悬停形状 && this.全局属性.悬停形状 !== this.全局属性.选中形状) {
            this.全局属性.悬停形状.已悬停 = false;
          }
          return this.全局属性.选中形状;
        }
      }
      if (形状.形状 === "直线" || 形状.形状 === "自由") {
        const 容差 = 8;
        for (let i = 0; i < 形状.顶点坐标组.length; i++) {
          const 采样点坐标 = 形状.顶点坐标组[i];
          if (
            Math.abs(this.全局属性.鼠标坐标.x - 采样点坐标.x) > 容差 ||
            Math.abs(this.全局属性.鼠标坐标.y - 采样点坐标.y) > 容差
          ) {
            形状.已悬停 = false;
            continue;
          }
          if (!形状.已悬停) {
            const 鼠标与采样点距离平方 =
              (this.全局属性.鼠标坐标.x - 采样点坐标.x) ** 2 + (this.全局属性.鼠标坐标.y - 采样点坐标.y) ** 2;
            形状.已悬停 = 鼠标与采样点距离平方 < 容差 ** 2;
          }
          this.ctx.strokeStyle = 形状.已悬停 ? this.全局属性.悬停描边色 : 形状.描边色;
          if (形状.已悬停) {
            return 形状;
          }
        }
      } else {
        形状.已悬停 = this.ctx.isPointInPath(
          形状.路径,
          this.全局属性.鼠标坐标.x * this.dpr,
          this.全局属性.鼠标坐标.y * this.dpr,
        );
        if (形状.已悬停) {
          if (this.全局属性.悬停形状 && this.全局属性.悬停形状 !== 形状) {
            this.全局属性.悬停形状.已悬停 = false;
          }
          this.全局属性.悬停形状 = 形状;
          return 形状;
        }
      }
    }
    return null;
  }

  鼠标位于交互框内() {
    if (!this.交互框) return null;
    const 容差 = 10;
    return (
      this.全局属性.鼠标坐标.x >= this.交互框.坐标.x + 容差 &&
      this.全局属性.鼠标坐标.x <= this.交互框.坐标.x + this.交互框.尺寸.width - 容差 &&
      this.全局属性.鼠标坐标.y >= this.交互框.坐标.y + 容差 &&
      this.全局属性.鼠标坐标.y <= this.交互框.坐标.y + this.交互框.尺寸.height - 容差
    );
  }

  鼠标位于交互框边界() {
    if (!this.交互框) return null;
    const 容差 = 10;
    const 边界位置 = {
      上:
        this.全局属性.鼠标坐标.y >= this.交互框.坐标.y - 容差 && this.全局属性.鼠标坐标.y <= this.交互框.坐标.y + 容差,
      下:
        this.全局属性.鼠标坐标.y >= this.交互框.坐标.y + this.交互框.尺寸.height - 容差 &&
        this.全局属性.鼠标坐标.y <= this.交互框.坐标.y + this.交互框.尺寸.height + 容差,
      左:
        this.全局属性.鼠标坐标.x >= this.交互框.坐标.x - 容差 && this.全局属性.鼠标坐标.x <= this.交互框.坐标.x + 容差,
      右:
        this.全局属性.鼠标坐标.x >= this.交互框.坐标.x + this.交互框.尺寸.width - 容差 &&
        this.全局属性.鼠标坐标.x <= this.交互框.坐标.x + this.交互框.尺寸.width + 容差,
    };
    return 边界位置;
  }

  添加canvas鼠标移动事件() {
    this.canvas.addEventListener("mousemove", (e) => {
      this.全局属性.鼠标坐标 = this.获取鼠标坐标(e);
      if (
        !this.全局标志.左键已按下 &&
        this.全局属性.已选中基础形状 !== "直线" &&
        this.全局属性.已选中基础形状 !== "选择路径"
      )
        return;
      if (this.全局属性.已选中基础形状 === "选择路径") {
        let 鼠标位于交互框内 = false;
        let 鼠标位于交互框边界 = null;
        if (this.交互框) {
          鼠标位于交互框内 = this.鼠标位于交互框内();
          鼠标位于交互框边界 = this.鼠标位于交互框边界();
        }
        this.全局属性.悬停形状 = this.鼠标位于形状内();
        if (this.全局属性.拖拽中) {
          this.canvas.style.cursor = 'url("/Images/Common/鼠标-移动.cur"), pointer';
          if (
            this.全局属性.选中形状.形状 !== "直线" &&
            this.全局属性.选中形状.形状 !== "自由" &&
            this.全局属性.偏移量
          ) {
            this.全局属性.选中形状.坐标.x = this.全局属性.鼠标坐标.x + this.全局属性.偏移量.x;
            this.全局属性.选中形状.坐标.y = this.全局属性.鼠标坐标.y + this.全局属性.偏移量.y;
          } else {
            const 偏移量 = {
              x: this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x,
              y: this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y,
            };
            for (let i = 0; i < this.全局属性.选中形状.顶点坐标组.length; i++) {
              this.全局属性.选中形状.顶点坐标组[i].x = this.初始坐标组[i].x + 偏移量.x;
              this.全局属性.选中形状.顶点坐标组[i].y = this.初始坐标组[i].y + 偏移量.y;
            }
          }
          if (this.全局属性.选中形状.形状 === "多边形" || this.全局属性.选中形状.形状 === "多角星") {
            this.全局属性.选中形状.极值坐标 = this.获取极值坐标(this.全局属性.选中形状);
          }
          this.更新路径(this.全局属性.选中形状);
        } else if (鼠标位于交互框边界) {
          if ((鼠标位于交互框边界.上 && 鼠标位于交互框边界.左) || (鼠标位于交互框边界.下 && 鼠标位于交互框边界.右)) {
            this.canvas.style.cursor = 'url("/Images/Common/鼠标-西北-东南.cur"), pointer';
          } else if (
            (鼠标位于交互框边界.上 && 鼠标位于交互框边界.右) ||
            (鼠标位于交互框边界.下 && 鼠标位于交互框边界.左)
          ) {
            this.canvas.style.cursor = 'url("/Images/Common/鼠标-东北-西南.cur"), pointer';
          } else if (鼠标位于交互框边界.上 || 鼠标位于交互框边界.下) {
            this.canvas.style.cursor = 'url("/Images/Common/鼠标-南北.cur"), pointer';
          } else if (鼠标位于交互框边界.左 || 鼠标位于交互框边界.右) {
            this.canvas.style.cursor = 'url("/Images/Common/鼠标-东西.cur"), pointer';
          } else {
            this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), pointer';
          }
        }
        this.清空画布();
        this.绘制基础形状对象组();
        return;
      }

      this.清空画布();
      this.判断鼠标与点击坐标位置关系();
      this.绘制基础形状对象组();

      if (this.全局属性.已选中基础形状) {
        this.当前形状对象.描边色 = this.全局属性.描边色;
        this.当前形状对象.填充色 = this.全局属性.填充色;
      }

      if (this.全局属性.已选中基础形状 === "矩形" || this.全局属性.已选中基础形状 === "选框") {
        this.当前形状对象.形状 = this.全局属性.已选中基础形状;
        if (!this.键盘状态.Shift) {
          this.当前形状对象.尺寸 = {
            宽: Math.abs(this.全局属性.点击坐标.x - this.全局属性.鼠标坐标.x),
            高: Math.abs(this.全局属性.点击坐标.y - this.全局属性.鼠标坐标.y),
          };
          this.当前形状对象.坐标.x = this.全局属性.鼠标与点击坐标位置关系.左
            ? this.全局属性.鼠标坐标.x
            : this.全局属性.点击坐标.x;
          this.当前形状对象.坐标.y = this.全局属性.鼠标与点击坐标位置关系.上
            ? this.全局属性.鼠标坐标.y
            : this.全局属性.点击坐标.y;
        } else {
          const 水平偏移 = Math.abs(this.全局属性.点击坐标.x - this.全局属性.鼠标坐标.x);
          const 垂直偏移 = Math.abs(this.全局属性.点击坐标.y - this.全局属性.鼠标坐标.y);
          const 更大偏移 = Math.max(水平偏移, 垂直偏移);
          this.当前形状对象.尺寸 = {
            宽: 更大偏移,
            高: 更大偏移,
          };
          this.当前形状对象.坐标.x =
            this.全局属性.点击坐标.x + 更大偏移 * (this.全局属性.鼠标与点击坐标位置关系.左 ? -1 : 0);
          this.当前形状对象.坐标.y =
            this.全局属性.点击坐标.y + 更大偏移 * (this.全局属性.鼠标与点击坐标位置关系.上 ? -1 : 0);
        }
        if (this.全局标志.辅助视觉效果 && this.当前形状对象.形状 === "矩形") {
          this.绘制操作说明();
        }
        this.当前形状对象.路径 =
          this.当前形状对象.形状 === "矩形"
            ? this.绘制矩形(
                this.当前形状对象.坐标.x,
                this.当前形状对象.坐标.y,
                this.当前形状对象.尺寸.宽,
                this.当前形状对象.尺寸.高,
                this.当前形状对象.圆角,
                this.全局属性.描边色,
                this.全局属性.填充色,
                this.全局属性.描边宽度,
              ).路径
            : this.绘制选框(
                this.当前形状对象.坐标.x,
                this.当前形状对象.坐标.y,
                this.当前形状对象.尺寸.宽,
                this.当前形状对象.尺寸.高,
              ).路径;
        if (this.全局标志.辅助视觉效果 && this.当前形状对象.形状 === "矩形") {
          this.绘制辅助点(this.当前形状对象.坐标.x, this.当前形状对象.坐标.y);
        }
      } else if (this.全局属性.已选中基础形状 === "圆") {
        this.当前形状对象.形状 = "圆";
        const 理论水平半径 = Math.abs(this.全局属性.点击坐标.x - this.全局属性.鼠标坐标.x);
        const 理论垂直半径 = Math.abs(this.全局属性.点击坐标.y - this.全局属性.鼠标坐标.y);
        const 更大理论半径 = Math.max(理论水平半径, 理论垂直半径);
        this.当前形状对象.尺寸 = {
          水平半径: this.键盘状态.Shift ? 更大理论半径 : 理论水平半径,
          垂直半径: this.键盘状态.Shift ? 更大理论半径 : 理论垂直半径,
        };
        this.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.当前形状对象.路径 = this.绘制椭圆(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.水平半径,
          this.当前形状对象.尺寸.垂直半径,
          this.当前形状对象.旋转弧度,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度,
        ).路径;
        if (this.全局标志.辅助视觉效果 && !this.键盘状态.Shift) {
          const 偏移x = Math.cos(this.当前形状对象.旋转弧度) * this.当前形状对象.尺寸.水平半径;
          const 偏移y = Math.sin(this.当前形状对象.旋转弧度) * this.当前形状对象.尺寸.水平半径;
          const 终点坐标 = {
            x: this.全局属性.点击坐标.x + 偏移x,
            y: this.全局属性.点击坐标.y + 偏移y,
          };
          this.绘制辅助虚线(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, 终点坐标.x, 终点坐标.y);
          this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
        }
      } else if (this.全局属性.已选中基础形状 === "多边形") {
        this.当前形状对象.形状 = "多边形";
        this.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        const 半径 = this.获取绘制半径(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.鼠标坐标.x,
          this.全局属性.鼠标坐标.y,
        );
        this.当前形状对象.尺寸 = {
          水平半径: 半径.水平,
          垂直半径: 半径.垂直,
        };
        const 更大半径 = Math.max(半径.水平, 半径.垂直);
        this.当前形状对象.尺寸.水平半径 = 更大半径;
        this.当前形状对象.尺寸.垂直半径 = 更大半径;
        this.当前形状对象.边数 = this.全局属性.多边形边数;
        this.当前形状对象.顶点坐标组 = this.获取多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.水平半径,
          this.当前形状对象.尺寸.垂直半径,
          this.当前形状对象.边数,
          this.当前形状对象.起始弧度,
        );
        this.当前形状对象.极值坐标 = this.获取极值坐标(this.当前形状对象);
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.当前形状对象.路径 = this.绘制多边形(
          this.当前形状对象.顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度,
        ).路径;
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.顶点坐标组[0].x,
            this.当前形状对象.顶点坐标组[0].y,
          );
          this.描边辅助圆(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, 更大半径, 更大半径);
        }
      } else if (this.全局属性.已选中基础形状 === "多角星") {
        this.当前形状对象.形状 = "多角星";
        this.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        const 外半径 = this.获取绘制半径(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.鼠标坐标.x,
          this.全局属性.鼠标坐标.y,
        );
        if (!this.当前形状对象.尺寸 || !this.当前形状对象.尺寸.外半径 || !this.当前形状对象.尺寸.内半径) {
          this.当前形状对象.尺寸 = {
            外半径: {
              水平: 0,
              垂直: 0,
            },
            内半径: {
              水平: 0,
              垂直: 0,
            },
          };
        }
        const 更大外半径 = Math.max(外半径.水平, 外半径.垂直);
        const 更大内半径 = 更大外半径 * 0.5;
        this.当前形状对象.尺寸.外半径.水平 = 更大外半径;
        this.当前形状对象.尺寸.外半径.垂直 = 更大外半径;
        if (!this.全局标志.手动调整内半径) {
          this.当前形状对象.尺寸.内半径.水平 = 更大内半径;
          this.当前形状对象.尺寸.内半径.垂直 = 更大内半径;
        }
        const 边数 = this.全局属性.多边形边数;
        this.当前形状对象.边数 = this.全局属性.多边形边数;
        this.当前形状对象.外顶点坐标组 = this.获取多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.外半径.水平,
          this.当前形状对象.尺寸.外半径.垂直,
          this.当前形状对象.边数,
          this.当前形状对象.起始弧度,
        );
        this.当前形状对象.内顶点坐标组 = this.获取多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.内半径.水平,
          this.当前形状对象.尺寸.内半径.垂直,
          this.当前形状对象.边数,
          this.当前形状对象.起始弧度 + Math.PI / 边数,
        );
        this.当前形状对象.极值坐标 = this.获取极值坐标(this.当前形状对象);
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.当前形状对象.路径 = this.绘制多角星(
          this.当前形状对象.外顶点坐标组,
          this.当前形状对象.内顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度,
        ).路径;
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.外顶点坐标组[0].x,
            this.当前形状对象.外顶点坐标组[0].y,
          );
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.内顶点坐标组[0].x,
            this.当前形状对象.内顶点坐标组[0].y,
          );
          this.绘制多边形顶点索引(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.外半径.水平,
            this.当前形状对象.尺寸.外半径.垂直,
            20,
            this.当前形状对象.边数,
            this.当前形状对象.起始弧度,
            "lightskyblue",
          );
          this.绘制多边形顶点索引(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.内半径.水平,
            this.当前形状对象.尺寸.内半径.垂直,
            -20,
            this.当前形状对象.边数,
            this.当前形状对象.起始弧度 + Math.PI / this.当前形状对象.边数,
            "yellowgreen",
          );
          this.描边辅助圆(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.外半径.水平,
            this.当前形状对象.尺寸.外半径.垂直,
          );
          this.描边辅助圆(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.内半径.水平,
            this.当前形状对象.尺寸.内半径.垂直,
          );
        }
      } else if (this.全局属性.已选中基础形状 === "直线") {
        this.当前形状对象.形状 = "直线";
        if (this.全局标志.辅助视觉效果 && this.当前形状对象.顶点坐标组.length > 0) {
          this.绘制操作说明();
        }
        if (this.当前形状对象.顶点坐标组.length >= 2) {
          this.当前形状对象.路径 = this.绘制直线(
            this.当前形状对象.顶点坐标组,
            this.全局属性.描边色,
            this.全局属性.描边宽度,
          ).路径;
        }
        if (this.当前形状对象.顶点坐标组.length >= 1) {
          const 最后坐标 = this.当前形状对象.顶点坐标组[this.当前形状对象.顶点坐标组.length - 1];
          if (this.全局标志.辅助视觉效果) {
            this.绘制辅助虚线(最后坐标.x, 最后坐标.y, this.全局属性.鼠标坐标.x, this.全局属性.鼠标坐标.y);
          }
        }
        if (this.全局标志.辅助视觉效果) {
          for (const 坐标 of this.当前形状对象.顶点坐标组) {
            this.绘制辅助点(坐标.x, 坐标.y);
          }
        }
      } else if (this.全局属性.已选中基础形状 === "自由") {
        this.当前形状对象.形状 = "自由";
        this.当前形状对象.顶点坐标组.push(this.全局属性.鼠标坐标);
        this.当前形状对象.路径 = this.绘制自由路径(
          this.当前形状对象.顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.描边宽度,
        ).路径;
      }
      if (
        this.全局标志.辅助视觉效果 &&
        this.全局属性.已选中基础形状 &&
        this.全局属性.已选中基础形状 !== "矩形" &&
        this.全局属性.已选中基础形状 !== "选框" &&
        this.全局属性.已选中基础形状 !== "直线" &&
        this.全局属性.已选中基础形状 !== "选择路径"
      ) {
        this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
      }
    });
  }

  添加canvas按下左键事件() {
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      this.全局标志.左键已按下 = true;
      this.全局标志.手动调整内半径 = false;
      this.全局属性.点击坐标 = this.全局属性.鼠标坐标;
      this.当前形状对象.描边宽度 = this.全局属性.描边宽度;
      if (this.全局属性.选中形状) {
        const 鼠标位于交互框内 = this.鼠标位于交互框内();
        if (!鼠标位于交互框内) {
          this.全局属性.选中形状.已选中 = false;
          if (!this.全局属性.悬停形状) {
            this.全局属性.选中形状 = null;
            this.交互框 = null;
          } else if (this.全局属性.选中形状 !== this.全局属性.悬停形状) {
            this.全局属性.选中形状 = this.全局属性.悬停形状;
            this.全局属性.选中形状.已选中 = true;
          }
          this.清空画布();
          this.绘制基础形状对象组();
        } else {
          this.全局属性.拖拽中 = true;
          if (this.全局属性.选中形状.形状 !== "直线" && this.全局属性.选中形状.形状 !== "自由") {
            this.全局属性.偏移量 = {
              x: this.全局属性.选中形状.坐标.x - this.全局属性.点击坐标.x,
              y: this.全局属性.选中形状.坐标.y - this.全局属性.点击坐标.y,
            };
          } else {
            this.初始坐标组 = this.全局属性.选中形状.顶点坐标组.map((坐标) => ({ ...坐标 }));
          }
        }
      }

      if (this.全局属性.已选中基础形状 !== "选择路径" && this.全局属性.选中形状) {
        this.全局属性.选中形状.已悬停 = false;
        this.全局属性.选中形状.已选中 = false;
        this.全局属性.选中形状 = null;
        this.全局属性.悬停形状 = null;
        this.清空画布();
        this.绘制基础形状对象组();
      }

      if (this.全局属性.已选中基础形状 === "矩形") {
        this.当前形状对象.圆角 = 0;
      } else if (this.全局属性.已选中基础形状 === "多边形" || this.全局属性.已选中基础形状 === "多角星") {
        this.当前形状对象.起始弧度 = -Math.PI / 2;
      } else if (this.全局属性.已选中基础形状 === "圆" && !this.键盘状态.Shift) {
        this.当前形状对象.旋转弧度 = 0;
      } else if (this.全局属性.已选中基础形状 === "直线") {
        this.清空画布();
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.当前形状对象.形状 = "直线";
        if (this.当前形状对象.顶点坐标组.length === 0) {
          this.ctx.moveTo(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
        } else {
          this.ctx.lineTo(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
        }
        this.当前形状对象.顶点坐标组.push(this.全局属性.点击坐标);
        this.当前形状对象.路径 = this.绘制直线(
          this.当前形状对象.顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.描边宽度,
        )?.路径;
        if (this.全局标志.辅助视觉效果) {
          for (const 坐标 of this.当前形状对象.顶点坐标组) {
            this.绘制辅助点(坐标.x, 坐标.y);
          }
        }
      } else if (this.全局属性.已选中基础形状 === "自由") {
        this.当前形状对象.顶点坐标组.push(this.全局属性.点击坐标);
      } else if (this.全局属性.已选中基础形状 === "选框") {
        this.当前形状对象.描边宽度 = 1;
      } else if (this.全局属性.已选中基础形状 === "选择路径") {
        if (this.全局属性.选中形状) {
          this.全局属性.选中形状.已选中 = false;
          this.全局属性.选中形状 = null;
        }
        this.全局属性.选中形状 = this.全局属性.悬停形状;
        if (this.全局属性.选中形状) {
          this.全局属性.选中形状.已选中 = !!this.全局属性.选中形状; //将null或者非null转换为布尔类型
          this.清空画布();
          this.绘制基础形状对象组();
        }
        this.根据选中形状索引修改处理按钮状态();
      }
    });
  }

  添加canvas鼠标抬起事件() {
    this.canvas.addEventListener("mouseup", () => {
      this.全局属性.拖拽中 = false;
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), pointer';
      if (!this.全局属性.点击坐标) return;
      const 移动距离 = Math.sqrt(
        Math.abs(this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x) ** 2 +
          Math.abs(this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y) ** 2,
      );
      this.全局标志.左键已按下 = false;
      this.全局属性.拖拽中 = false;
      this.全局属性.左键按下时间 = null;
      this.全局属性.拖拽时间 = null;
      this.全局标志.手动调整内半径 = false;
      this.全局属性.多边形边数 = 5;
      if (this.全局属性.已选中基础形状 && this.全局属性.已选中基础形状 !== "直线" && 移动距离 > 0) {
        if (this.全局属性.已选中基础形状 !== "选框" && this.全局属性.已选中基础形状 !== "选择路径") {
          const path = this.当前形状对象.路径;
          this.当前形状对象.路径 = null;
          const 克隆 = structuredClone(this.当前形状对象);
          克隆.路径 = path;
          this.数据集.基础形状对象组.push(克隆);
          this.数据集.操作记录.push({
            操作类型: "添加基础形状",
          });
        }
        this.清空画布();
        this.绘制基础形状对象组();
        this.全局属性.点击坐标 = null;
        this.当前形状对象.顶点坐标组 = [];
      }
    });
  }

  判断鼠标与点击坐标位置关系() {
    if (!this.全局属性.点击坐标 || !this.全局属性.鼠标坐标) return;
    if (this.全局属性.鼠标坐标.x === this.全局属性.点击坐标.x) {
      this.全局属性.鼠标与点击坐标位置关系.左 = null;
    } else {
      this.全局属性.鼠标与点击坐标位置关系.左 = this.全局属性.鼠标坐标.x < this.全局属性.点击坐标.x;
    }
    if (this.全局属性.鼠标坐标.y === this.全局属性.点击坐标.y) {
      this.全局属性.鼠标与点击坐标位置关系.上 = null;
    } else {
      this.全局属性.鼠标与点击坐标位置关系.上 = this.全局属性.鼠标坐标.y < this.全局属性.点击坐标.y;
    }
  }

  获取鼠标坐标(e) {
    return {
      x: e.clientX - this.画布边界矩形.left,
      y: e.clientY - this.画布边界矩形.top,
    };
  }

  添加键盘事件() {
    document.addEventListener("keydown", (e) => {
      if (!Object.hasOwn(this.键盘状态, e.key)) return;
      this.键盘状态[e.key] = true;
      if (e.key === "z" && this.键盘状态.Control) {
        if (this.全局标志.按钮音效) {
          this.辅助.点击音效对象.currentTime = 0;
          this.辅助.点击音效对象.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.撤销();
        return;
      }
      if (e.key === "Enter") {
        if (this.全局属性.已选中基础形状 === "直线") {
          if (this.当前形状对象.顶点坐标组.length >= 2) {
            const path = this.当前形状对象.路径;
            this.当前形状对象.路径 = null;
            const 克隆 = structuredClone(this.当前形状对象);
            克隆.路径 = path;
            this.数据集.基础形状对象组.push(克隆);
            this.数据集.操作记录.push({
              操作类型: "添加基础形状",
            });
          }
        }
      }
      if (e.key === "Escape" || (e.key === "Enter" && this.全局属性.已选中基础形状 === "直线")) {
        this.全局标志.左键已按下 = false;
        this.全局属性.拖拽中 = false;
        this.全局属性.点击坐标 = null;
        this.全局属性.左键按下时间 = null;
        this.全局属性.拖拽时间 = null;
        this.全局属性.多边形边数 = 5;
        this.重置当前形状对象();
        this.清空画布();
        this.绘制基础形状对象组();
      }
      if (e.key === "Escape") {
        return;
      }
      if (!this.全局标志.左键已按下 && Object.hasOwn(this.快捷键映射, e.key)) {
        if (this.基础形状单选框组.当前基础形状单选框) {
          this.基础形状单选框组.当前基础形状单选框.checked = false;
        }
        this.基础形状单选框组[this.快捷键映射[e.key]].checked = true;
        this.基础形状单选框组.当前基础形状单选框 = this.基础形状单选框组[this.快捷键映射[e.key]];
        this.全局属性.已选中基础形状 = this.快捷键映射[e.key];
        if (this.基础形状单选框组["选择路径"].checked) {
          const 悬停形状 = this.鼠标位于形状内();
          if (悬停形状) {
            悬停形状.已悬停 = true;
            this.清空画布();
            this.绘制基础形状对象组();
          }
        } else {
          if (this.全局属性.悬停形状) {
            this.全局属性.悬停形状.已悬停 = false;
            this.全局属性.悬停形状 = null;
            this.清空画布();
            this.绘制基础形状对象组();
          }
        }
      }
      if (this.全局标志.左键已按下 && this.全局属性.已选中基础形状 === "矩形") {
        const 短边 = Math.min(this.当前形状对象.尺寸.宽, this.当前形状对象.尺寸.高);
        if (this.键盘状态.ArrowUp && this.当前形状对象.圆角 < 短边 / 2) {
          this.当前形状对象.圆角 += 1;
        }
        if (this.键盘状态.ArrowDown && this.当前形状对象.圆角 >= 1) {
          this.当前形状对象.圆角 -= 1;
        }
        this.清空画布();
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.当前形状对象.路径 = this.绘制矩形(
          this.当前形状对象.坐标.x,
          this.当前形状对象.坐标.y,
          this.当前形状对象.尺寸.宽,
          this.当前形状对象.尺寸.高,
          this.当前形状对象.圆角,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度,
        ).路径;
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助点(this.当前形状对象.坐标.x, this.当前形状对象.坐标.y);
        }
      } else if (this.全局标志.左键已按下 && !this.键盘状态.Shift && this.全局属性.已选中基础形状 === "圆") {
        if (this.键盘状态.ArrowLeft) {
          this.当前形状对象.旋转弧度 -= 0.01;
        }
        if (this.键盘状态.ArrowRight) {
          this.当前形状对象.旋转弧度 += 0.01;
        }
        if (this.键盘状态.ArrowUp) {
          this.当前形状对象.旋转弧度 -= 0.05;
        }
        if (this.键盘状态.ArrowDown) {
          this.当前形状对象.旋转弧度 += 0.05;
        }
        this.清空画布();
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.当前形状对象.路径 = this.绘制椭圆(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.水平半径,
          this.当前形状对象.尺寸.垂直半径,
          this.当前形状对象.旋转弧度,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度,
        ).路径;
        if (this.全局标志.辅助视觉效果) {
          const 偏移x = Math.cos(this.当前形状对象.旋转弧度) * this.当前形状对象.尺寸.水平半径;
          const 偏移y = Math.sin(this.当前形状对象.旋转弧度) * this.当前形状对象.尺寸.水平半径;
          const 终点坐标 = {
            x: this.全局属性.点击坐标.x + 偏移x,
            y: this.全局属性.点击坐标.y + 偏移y,
          };
          this.绘制辅助虚线(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, 终点坐标.x, 终点坐标.y);
          this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
        }
      } else if (
        this.全局标志.左键已按下 &&
        this.全局标志.多边形边数可增减 &&
        this.全局标志.多边形可旋转 &&
        this.全局属性.已选中基础形状 === "多边形"
      ) {
        if (this.键盘状态.ArrowUp) {
          if (this.全局属性.多边形边数 < 50) {
            this.全局属性.多边形边数++;
          }
        }
        if (this.键盘状态.ArrowDown) {
          if (this.全局属性.多边形边数 > 3) {
            this.全局属性.多边形边数--;
          }
        }
        if (this.键盘状态.ArrowLeft) {
          this.当前形状对象.起始弧度 -= this.键盘状态.Shift ? 0.05 : 0.01;
        }
        if (this.键盘状态.ArrowRight) {
          this.当前形状对象.起始弧度 += this.键盘状态.Shift ? 0.05 : 0.01;
        }
        this.清空画布();
        this.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        const 半径 = this.获取绘制半径(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.鼠标坐标.x,
          this.全局属性.鼠标坐标.y,
        );
        const 更大半径 = Math.max(半径.水平, 半径.垂直);
        this.当前形状对象.尺寸 = {
          水平半径: 更大半径,
          垂直半径: 更大半径,
        };
        this.当前形状对象.边数 = this.全局属性.多边形边数;
        this.当前形状对象.顶点坐标组 = this.获取多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.水平半径,
          this.当前形状对象.尺寸.垂直半径,
          this.当前形状对象.边数,
          this.当前形状对象.起始弧度,
        );
        this.当前形状对象.极值坐标 = this.获取极值坐标(this.当前形状对象);
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.当前形状对象.路径 = this.绘制多边形(
          this.当前形状对象.顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度,
        ).路径;
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.顶点坐标组[0].x,
            this.当前形状对象.顶点坐标组[0].y,
          );
          this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
          this.描边辅助圆(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.水平半径,
            this.当前形状对象.尺寸.垂直半径,
          );
        }
      } else if (
        this.全局标志.左键已按下 &&
        this.全局标志.多边形边数可增减 &&
        this.全局标志.多边形可旋转 &&
        this.全局属性.已选中基础形状 === "多角星"
      ) {
        if (this.键盘状态.ArrowUp) {
          if (this.全局属性.多边形边数 < 100) {
            this.全局属性.多边形边数++;
          }
        }
        if (this.键盘状态.ArrowDown) {
          if (this.全局属性.多边形边数 > 3) {
            this.全局属性.多边形边数--;
          }
        }
        if (this.键盘状态.ArrowLeft) {
          this.当前形状对象.起始弧度 -= this.键盘状态.Shift ? 0.05 : 0.01;
        }
        if (this.键盘状态.ArrowRight) {
          this.当前形状对象.起始弧度 += this.键盘状态.Shift ? 0.05 : 0.01;
        }
        if (e.key === "[") {
          this.全局标志.手动调整内半径 = true;
          if (this.当前形状对象.尺寸.内半径.水平 >= 2) {
            this.当前形状对象.尺寸.内半径.水平 -= 2;
          }
          if (this.当前形状对象.尺寸.内半径.垂直 >= 2) {
            this.当前形状对象.尺寸.内半径.垂直 -= 2;
          }
        }
        if (e.key === "]") {
          this.全局标志.手动调整内半径 = true;
          this.当前形状对象.尺寸.内半径.水平 += 2;
          this.当前形状对象.尺寸.内半径.垂直 += 2;
        }
        this.清空画布();
        this.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        this.当前形状对象.尺寸.外半径 = this.获取绘制半径(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.鼠标坐标.x,
          this.全局属性.鼠标坐标.y,
        );
        const 更大半径 = Math.max(this.当前形状对象.尺寸.外半径.水平, this.当前形状对象.尺寸.外半径.垂直);
        this.当前形状对象.尺寸.外半径.水平 = 更大半径;
        this.当前形状对象.尺寸.外半径.垂直 = 更大半径;
        this.当前形状对象.边数 = this.全局属性.多边形边数;
        this.当前形状对象.外顶点坐标组 = this.获取多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.外半径.水平,
          this.当前形状对象.尺寸.外半径.垂直,
          this.当前形状对象.边数,
          this.当前形状对象.起始弧度,
        );
        this.当前形状对象.极值坐标 = this.获取极值坐标(this.当前形状对象);
        this.当前形状对象.内顶点坐标组 = this.获取多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.内半径.水平,
          this.当前形状对象.尺寸.内半径.垂直,
          this.当前形状对象.边数,
          this.当前形状对象.起始弧度 + Math.PI / this.当前形状对象.边数,
        );
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.当前形状对象.路径 = this.绘制多角星(
          this.当前形状对象.外顶点坐标组,
          this.当前形状对象.内顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度,
        ).路径;
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.外顶点坐标组[0].x,
            this.当前形状对象.外顶点坐标组[0].y,
          );
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.内顶点坐标组[0].x,
            this.当前形状对象.内顶点坐标组[0].y,
          );
          this.绘制多边形顶点索引(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.外半径.水平,
            this.当前形状对象.尺寸.外半径.垂直,
            20,
            this.当前形状对象.边数,
            this.当前形状对象.起始弧度,
            "lightskyblue",
          );
          this.绘制多边形顶点索引(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.内半径.水平,
            this.当前形状对象.尺寸.内半径.垂直,
            -20,
            this.当前形状对象.边数,
            this.当前形状对象.起始弧度 + Math.PI / this.当前形状对象.边数,
            "yellowgreen",
          );
          this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
          this.描边辅助圆(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.外半径.水平,
            this.当前形状对象.尺寸.外半径.垂直,
          );
          this.描边辅助圆(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.内半径.水平,
            this.当前形状对象.尺寸.内半径.垂直,
          );
        }
      }
    });

    document.addEventListener("keyup", (e) => {
      if (!Object.hasOwn(this.键盘状态, e.key)) return;
      this.键盘状态[e.key] = false;
      this.全局标志.多边形边数可增减 = true;
      this.全局标志.多边形可旋转 = true;
    });
  }

  处理辅助效果选项() {
    this.辅助.视觉效果复选框.addEventListener("change", () => {
      this.全局标志.辅助视觉效果 = this.辅助.视觉效果复选框.checked;
      localStorage.setItem("辅助视觉效果", this.辅助.视觉效果复选框.checked);
    });
    this.辅助.按钮音效复选框.addEventListener("change", () => {
      this.全局标志.按钮音效 = this.辅助.按钮音效复选框.checked;
      localStorage.setItem("播放音效", this.辅助.按钮音效复选框.checked);
    });
  }

  更新矩形路径(矩形对象) {
    矩形对象.路径 = new Path2D();
    矩形对象.路径.rect(矩形对象.坐标.x, 矩形对象.坐标.y, 矩形对象.尺寸.宽, 矩形对象.尺寸.高);
  }

  更新椭圆路径(椭圆对象) {
    椭圆对象.路径 = new Path2D();
    椭圆对象.路径.ellipse(
      椭圆对象.坐标.x,
      椭圆对象.坐标.y,
      椭圆对象.尺寸.水平半径,
      椭圆对象.尺寸.垂直半径,
      椭圆对象.旋转弧度,
      0,
      2 * Math.PI,
    );
  }

  更新多边形路径(多边形对象) {
    if (多边形对象.顶点坐标组.length < 3) return;
    多边形对象.路径 = new Path2D();
    多边形对象.顶点坐标组 = this.获取多边形顶点坐标组(
      多边形对象.坐标.x,
      多边形对象.坐标.y,
      多边形对象.尺寸.水平半径,
      多边形对象.尺寸.垂直半径,
      多边形对象.边数,
      多边形对象.起始弧度,
    );
    多边形对象.路径.moveTo(多边形对象.顶点坐标组[0].x, 多边形对象.顶点坐标组[0].y);
    for (let i = 1; i < 多边形对象.顶点坐标组.length; i++) {
      多边形对象.路径.lineTo(多边形对象.顶点坐标组[i].x, 多边形对象.顶点坐标组[i].y);
    }
    多边形对象.路径.closePath();
  }

  更新多角星路径(多角星对象) {
    if (多角星对象.外顶点坐标组.length < 3 || 多角星对象.内顶点坐标组.length < 3) return;
    多角星对象.路径 = new Path2D();
    const 边数 = 多角星对象.外顶点坐标组.length;
    多角星对象.外顶点坐标组 = this.获取多边形顶点坐标组(
      多角星对象.坐标.x,
      多角星对象.坐标.y,
      多角星对象.尺寸.外半径.水平,
      多角星对象.尺寸.外半径.垂直,
      边数,
      多角星对象.起始弧度,
    );
    多角星对象.内顶点坐标组 = this.获取多边形顶点坐标组(
      多角星对象.坐标.x,
      多角星对象.坐标.y,
      多角星对象.尺寸.内半径.水平,
      多角星对象.尺寸.内半径.垂直,
      边数,
      多角星对象.起始弧度 + Math.PI / 边数,
    );
    for (let i = 0; i < 边数; i++) {
      if (i === 0) {
        多角星对象.路径.moveTo(多角星对象.外顶点坐标组[i].x, 多角星对象.外顶点坐标组[i].y);
      } else {
        多角星对象.路径.lineTo(多角星对象.外顶点坐标组[i].x, 多角星对象.外顶点坐标组[i].y);
      }
      多角星对象.路径.lineTo(多角星对象.内顶点坐标组[i].x, 多角星对象.内顶点坐标组[i].y);
    }
    多角星对象.路径.closePath();
  }

  更新直线路径(直线对象) {
    if (直线对象.顶点坐标组.length < 2) return;
    直线对象.路径 = new Path2D();
    for (let i = 0; i < 直线对象.顶点坐标组.length; i++) {
      if (i === 0) {
        直线对象.路径.moveTo(直线对象.顶点坐标组[i].x, 直线对象.顶点坐标组[i].y);
      } else {
        直线对象.路径.lineTo(直线对象.顶点坐标组[i].x, 直线对象.顶点坐标组[i].y);
      }
    }
  }

  更新自由路径对象(自由路径对象) {
    if (自由路径对象.顶点坐标组.length < 2) return;
    自由路径对象.路径 = new Path2D();

    if (自由路径对象.顶点坐标组.length === 2) {
      自由路径对象.路径.moveTo(自由路径对象.顶点坐标组[0].x, 自由路径对象.顶点坐标组[0].y);
      自由路径对象.路径.lineTo(自由路径对象.顶点坐标组[1].x, 自由路径对象.顶点坐标组[1].y);
    } else {
      自由路径对象.路径.moveTo(自由路径对象.顶点坐标组[0].x, 自由路径对象.顶点坐标组[0].y);

      for (let i = 1; i < 自由路径对象.顶点坐标组.length - 1; i++) {
        const 中间点x = (自由路径对象.顶点坐标组[i].x + 自由路径对象.顶点坐标组[i + 1].x) / 2;
        const 中间点y = (自由路径对象.顶点坐标组[i].y + 自由路径对象.顶点坐标组[i + 1].y) / 2;
        自由路径对象.路径.quadraticCurveTo(
          自由路径对象.顶点坐标组[i].x,
          自由路径对象.顶点坐标组[i].y,
          中间点x,
          中间点y,
        );
      }

      const lastIndex = 自由路径对象.顶点坐标组.length - 1;
      自由路径对象.路径.quadraticCurveTo(
        自由路径对象.顶点坐标组[lastIndex - 1].x,
        自由路径对象.顶点坐标组[lastIndex - 1].y,
        自由路径对象.顶点坐标组[lastIndex].x,
        自由路径对象.顶点坐标组[lastIndex].y,
      );
    }
  }

  更新路径(路径对象) {
    if (路径对象.形状 === "矩形") {
      this.更新矩形路径(路径对象);
    } else if (路径对象.形状 === "圆") {
      this.更新椭圆路径(路径对象);
    } else if (路径对象.形状 === "多边形") {
      this.更新多边形路径(路径对象);
    } else if (路径对象.形状 === "多角星") {
      this.更新多角星路径(路径对象);
    } else if (路径对象.形状 === "直线") {
      this.更新直线路径(路径对象);
    } else if (路径对象.形状 === "自由") {
      this.更新自由路径对象(路径对象);
    }
  }

  绘制选框(x, y, 宽, 高) {
    const path = new Path2D();
    this.ctx.save();
    path.rect(x, y, 宽, 高);
    this.ctx.strokeStyle = "#888";
    this.ctx.fillStyle = "transparent";
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([10, 10]);
    this.ctx.stroke(path);
    this.ctx.fill(path);
    this.ctx.restore();
    return {
      坐标: { x: x, y: y },
      尺寸: { 宽: 宽, 高: 高 },
      路径: path,
    };
  }

  绘制矩形(x, y, 宽, 高, 圆角, 描边色, 填充色, 描边宽度) {
    const path = new Path2D();
    this.ctx.save();
    path.roundRect(x, y, 宽, 高, [圆角]);
    this.ctx.strokeStyle = 描边色;
    this.ctx.fillStyle = 填充色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.stroke(path);
    this.ctx.fill(path);
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      填充色: 填充色,
      坐标: { x: x, y: y },
      尺寸: { 宽: 宽, 高: 高 },
      圆角: 圆角,
      路径: path,
      已悬停: false,
      已选中: false,
    };
  }

  绘制椭圆(x, y, 水平半径, 垂直半径, 旋转弧度, 描边色, 填充色, 描边宽度) {
    const path = new Path2D();
    this.ctx.save();
    path.ellipse(x, y, 水平半径, 垂直半径, 旋转弧度, 0, 2 * Math.PI);
    this.ctx.strokeStyle = 描边色;
    this.ctx.fillStyle = 填充色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.stroke(path);
    this.ctx.fill(path);
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      填充色: 填充色,
      坐标: { x: x, y: y },
      尺寸: { 水平半径: 水平半径, 垂直半径: 垂直半径 },
      旋转弧度: 旋转弧度,
      路径: path,
      已悬停: false,
      已选中: false,
    };
  }

  绘制多边形(顶点坐标组, 描边色, 填充色, 描边宽度) {
    const path = new Path2D();
    if (顶点坐标组.length < 3) return;
    this.ctx.save();
    path.moveTo(顶点坐标组[0].x, 顶点坐标组[0].y);
    for (let i = 1; i < 顶点坐标组.length; i++) {
      path.lineTo(顶点坐标组[i].x, 顶点坐标组[i].y);
    }
    path.closePath();
    this.ctx.strokeStyle = 描边色;
    this.ctx.fillStyle = 填充色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.stroke(path);
    this.ctx.fill(path);
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      填充色: 填充色,
      顶点坐标组: 顶点坐标组,
      路径: path,
      已悬停: false,
      已选中: false,
    };
  }

  绘制多角星(外顶点坐标组, 内顶点坐标组, 描边色, 填充色, 描边宽度) {
    if (外顶点坐标组.length < 3 || 内顶点坐标组.length < 3) return;
    const path = new Path2D();
    const 边数 = 外顶点坐标组.length;
    this.ctx.save();
    for (let i = 0; i < 边数; i++) {
      if (i === 0) {
        path.moveTo(外顶点坐标组[i].x, 外顶点坐标组[i].y);
      } else {
        path.lineTo(外顶点坐标组[i].x, 外顶点坐标组[i].y);
      }
      path.lineTo(内顶点坐标组[i].x, 内顶点坐标组[i].y);
    }
    path.closePath();
    this.ctx.strokeStyle = 描边色;
    this.ctx.fillStyle = 填充色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.stroke(path);
    this.ctx.fill(path);
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      填充色: 填充色,
      外顶点坐标组: 外顶点坐标组,
      内顶点坐标组: 内顶点坐标组,
      路径: path,
      已悬停: false,
      已选中: false,
    };
  }

  绘制直线(顶点坐标组, 描边色, 描边宽度) {
    if (顶点坐标组.length < 2) return;
    const path = new Path2D();
    this.ctx.save();
    this.ctx.strokeStyle = 描边色;
    this.ctx.lineWidth = 描边宽度;
    for (let i = 0; i < 顶点坐标组.length; i++) {
      if (i === 0) {
        path.moveTo(顶点坐标组[i].x, 顶点坐标组[i].y);
      } else {
        path.lineTo(顶点坐标组[i].x, 顶点坐标组[i].y);
      }
    }
    this.ctx.stroke(path);
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      顶点坐标组: 顶点坐标组,
      路径: path,
      已悬停: false,
      已选中: false,
    };
  }

  绘制自由路径(顶点坐标组, 描边色, 描边宽度) {
    if (顶点坐标组.length < 2) return;
    const path = new Path2D();
    this.ctx.save();
    this.ctx.strokeStyle = 描边色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    if (顶点坐标组.length === 2) {
      path.moveTo(顶点坐标组[0].x, 顶点坐标组[0].y);
      path.lineTo(顶点坐标组[1].x, 顶点坐标组[1].y);
    } else {
      path.moveTo(顶点坐标组[0].x, 顶点坐标组[0].y);

      for (let i = 1; i < 顶点坐标组.length - 1; i++) {
        const 中间点x = (顶点坐标组[i].x + 顶点坐标组[i + 1].x) / 2;
        const 中间点y = (顶点坐标组[i].y + 顶点坐标组[i + 1].y) / 2;
        path.quadraticCurveTo(顶点坐标组[i].x, 顶点坐标组[i].y, 中间点x, 中间点y);
      }

      const lastIndex = 顶点坐标组.length - 1;
      path.quadraticCurveTo(
        顶点坐标组[lastIndex - 1].x,
        顶点坐标组[lastIndex - 1].y,
        顶点坐标组[lastIndex].x,
        顶点坐标组[lastIndex].y,
      );
    }

    this.ctx.stroke(path);
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      顶点坐标组: 顶点坐标组,
      路径: path,
      已悬停: false,
      已选中: false,
    };
  }

  绘制辅助点(x, y) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
    this.ctx.closePath();
    this.ctx.fillStyle = "yellowgreen";
    this.ctx.fill();
    this.ctx.restore();
  }

  绘制辅助虚线(起点x, 起点y, 终点x, 终点y) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(起点x, 起点y);
    this.ctx.lineTo(终点x, 终点y);
    this.ctx.setLineDash([10, 10]);
    this.ctx.strokeStyle = this.全局属性.辅助线段描边色;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    this.ctx.restore();
  }

  描边辅助圆(x, y, 水平半径, 垂直半径) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, 水平半径, 垂直半径, 0, 0, 2 * Math.PI);
    this.ctx.closePath();
    this.ctx.strokeStyle = this.全局属性.辅助外框描边色;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    this.ctx.restore();
  }

  绘制多边形顶点索引(x, y, 水平半径, 垂直半径, 索引偏移, 边数, 起始弧度, 填充色) {
    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = "13px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    const 弧度偏移 = (2 * Math.PI) / 边数;
    for (let i = 0; i < 边数; i++) {
      const 顶点弧度 = 起始弧度 + i * 弧度偏移;
      const 顶点半径 = this.获取椭圆弧度半径(水平半径, 垂直半径, 顶点弧度) + 索引偏移;
      const 顶点水平偏移 = 顶点半径 * Math.cos(顶点弧度);
      const 顶点垂直偏移 = 顶点半径 * Math.sin(顶点弧度);
      const 索引x = x + 顶点水平偏移;
      const 索引y = y + 顶点垂直偏移;
      this.ctx.fillStyle = "#0007";
      this.ctx.strokeStyle = "transparent";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(索引x, 索引y, 15, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.fillStyle = 填充色;
      this.ctx.fillText(i.toString(), 索引x, 索引y);
    }
    this.ctx.restore();
  }

  获取椭圆弧度半径(水平半径, 垂直半径, 弧度) {
    const x = 水平半径 * Math.cos(弧度);
    const y = 垂直半径 * Math.sin(弧度);
    return Math.sqrt(x * x + y * y);
  }

  获取多边形顶点坐标组(x, y, 水平半径, 垂直半径, 边数, 起始弧度) {
    const 弧度偏移 = (2 * Math.PI) / 边数;
    const 顶点坐标组 = [];
    for (let i = 0; i < 边数; i++) {
      const 顶点弧度 = 起始弧度 + i * 弧度偏移;
      const 顶点水平偏移 = 水平半径 * Math.cos(顶点弧度);
      const 顶点垂直偏移 = 垂直半径 * Math.sin(顶点弧度);
      顶点坐标组.push({
        x: x + 顶点水平偏移,
        y: y + 顶点垂直偏移,
      });
    }
    return 顶点坐标组;
  }

  获取极值坐标(形状对象) {
    if (!形状对象) return;
    const 极值坐标 = {
      上: null,
      下: null,
      左: null,
      右: null,
    };
    if (形状对象.形状 === "多边形") {
      极值坐标.上 = Math.min(...形状对象.顶点坐标组.map((item) => item.y));
      极值坐标.下 = Math.max(...形状对象.顶点坐标组.map((item) => item.y));
      极值坐标.左 = Math.min(...形状对象.顶点坐标组.map((item) => item.x));
      极值坐标.右 = Math.max(...形状对象.顶点坐标组.map((item) => item.x));
    } else if (形状对象.形状 === "多角星") {
      极值坐标.上 = Math.min(...形状对象.外顶点坐标组.map((item) => item.y));
      极值坐标.下 = Math.max(...形状对象.外顶点坐标组.map((item) => item.y));
      极值坐标.左 = Math.min(...形状对象.外顶点坐标组.map((item) => item.x));
      极值坐标.右 = Math.max(...形状对象.外顶点坐标组.map((item) => item.x));
    }
    return 极值坐标;
  }

  获取绘制半径(起点x, 起点y, 终点x, 终点y) {
    const 水平偏移 = Math.abs(起点x - 终点x);
    const 垂直偏移 = Math.abs(起点y - 终点y);
    return {
      水平: 水平偏移,
      垂直: 垂直偏移,
    };
  }

  清空画布() {
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
    this.交互框 = null;
  }

  添加清空画布按钮点击事件() {
    const 清空画布按钮 = document.getElementById("清空画布按钮");
    清空画布按钮.addEventListener("click", () => {
      if (this.全局标志.按钮音效) {
        this.辅助.清空音效.currentTime = 0;
        this.辅助.清空音效.play().catch((e) => {
          console.log("按钮音效播放失败:", e);
        });
      }
      this.清空画布();
      this.数据集.基础形状对象组 = [];
      this.当前形状对象.顶点坐标组 = [];
      this.当前形状对象.外顶点坐标组 = [];
      this.当前形状对象.内顶点坐标组 = [];
      this.数据集.操作记录 = [];
    });
  }

  添加撤销按钮点击事件() {
    const 撤销按钮 = document.getElementById("撤销");
    撤销按钮.addEventListener("click", () => {
      if (this.全局标志.按钮音效) {
        this.辅助.点击音效对象.currentTime = 0;
        this.辅助.点击音效对象.play().catch((e) => {
          console.log("按钮音效播放失败:", e);
        });
      }
      this.撤销();
    });
  }

  撤销() {
    if (
      this.数据集.操作记录.length <= 0 &&
      this.当前形状对象.形状 === "直线" &&
      this.当前形状对象.顶点坐标组.length <= 0
    )
      return;
    if (
      this.数据集.基础形状对象组.length <= 0 &&
      !(this.当前形状对象.形状 === "直线" && this.当前形状对象.顶点坐标组.length > 0)
    ) {
      return;
    }

    if (this.当前形状对象.形状 === "直线" && this.当前形状对象.顶点坐标组.length >= 1) {
      this.当前形状对象.顶点坐标组.pop();
      this.清空画布();
      this.绘制基础形状对象组();
      if (this.当前形状对象.顶点坐标组.length >= 2) {
        this.绘制直线(this.当前形状对象.顶点坐标组, this.全局属性.描边色, this.全局属性.描边宽度);
      }
      if (this.当前形状对象.顶点坐标组.length >= 1) {
        if (this.全局标志.辅助视觉效果) {
          const 最后坐标 = this.当前形状对象.顶点坐标组[this.当前形状对象.顶点坐标组.length - 1];
          if (this.全局标志.辅助视觉效果) {
            this.绘制辅助虚线(最后坐标.x, 最后坐标.y, this.全局属性.鼠标坐标.x, this.全局属性.鼠标坐标.y);
          }
          for (const 坐标 of this.当前形状对象.顶点坐标组) {
            this.绘制辅助点(坐标.x, 坐标.y);
          }
        }
      }
      return;
    }

    const 最后操作 = this.数据集.操作记录[this.数据集.操作记录.length - 1];
    const 最后形状 = this.数据集.基础形状对象组[this.数据集.基础形状对象组.length - 1];
    if (最后操作.操作类型 === "添加基础形状") {
      if (!this.当前形状对象.形状 || this.当前形状对象.顶点坐标组.length <= 0) {
        if (最后形状.形状 === "直线") {
          最后形状.顶点坐标组.pop();
          if (最后形状.顶点坐标组.length <= 1) {
            this.数据集.基础形状对象组.pop();
            this.数据集.操作记录.pop();
          }
          this.更新路径(最后形状);
          this.清空画布();
          this.绘制基础形状对象组();
          return;
        } else {
          this.数据集.基础形状对象组.pop();
        }
      }
    } else if (最后操作.操作类型 === "交换图层") {
      [this.数据集.基础形状对象组[最后操作.操作数据[0]], this.数据集.基础形状对象组[最后操作.操作数据[1]]] = [
        this.数据集.基础形状对象组[最后操作.操作数据[1]],
        this.数据集.基础形状对象组[最后操作.操作数据[0]],
      ];
    }
    this.数据集.操作记录.pop();
    this.清空画布();
    this.绘制基础形状对象组();
  }

  重置当前形状对象() {
    this.当前形状对象 = {
      形状: null,
      坐标: { x: null, y: null },
      顶点坐标组: [],
      尺寸: null,
      圆角: 0,
      描边色: "transparent",
      填充色: "transparent",
      描边宽度: this.全局属性.描边宽度,
      路径: null,
    };
  }

  绘制基础形状对象组() {
    if (this.数据集.基础形状对象组.length <= 0) return;
    for (const 形状对象 of this.数据集.基础形状对象组) {
      if (!形状对象.路径) continue;
      this.ctx.strokeStyle = 形状对象.已悬停 && !形状对象.已选中 ? this.全局属性.悬停描边色 : 形状对象.描边色;
      this.ctx.fillStyle = 形状对象.填充色;
      this.ctx.lineWidth = 形状对象.已悬停 && !形状对象.已选中 ? this.全局属性.悬停描边宽度 : 形状对象.描边宽度;
      this.ctx.stroke(形状对象.路径);
      if (形状对象.形状 !== "直线" && 形状对象.形状 !== "自由") {
        this.ctx.fill(形状对象.路径);
      }
      if (形状对象.已选中) {
        this.绘制交互框(形状对象);
      }
    }
  }

  绘制交互框(形状对象) {
    if (!形状对象) return;
    this.ctx.save();
    this.ctx.beginPath();
    let 旋转弧度 = 0;
    const 外边距 = 10 + 形状对象.描边宽度 * (形状对象.形状 === "多边形" || 形状对象.形状 === "多角星" ? 1 : 0.5);
    const 坐标 = {
      x: 0,
      y: 0,
    };
    const 尺寸 = {
      width: 0,
      height: 0,
    };
    if (形状对象.形状 === "矩形") {
      坐标.x = 形状对象.坐标.x - 外边距;
      坐标.y = 形状对象.坐标.y - 外边距;
      尺寸.width = 形状对象.尺寸.宽 + 外边距 * 2;
      尺寸.height = 形状对象.尺寸.高 + 外边距 * 2;
    } else if (形状对象.形状 === "圆") {
      坐标.x = 形状对象.坐标.x - 形状对象.尺寸.水平半径 - 外边距;
      坐标.y = 形状对象.坐标.y - 形状对象.尺寸.垂直半径 - 外边距;
      尺寸.width = 形状对象.尺寸.水平半径 * 2 + 外边距 * 2;
      尺寸.height = 形状对象.尺寸.垂直半径 * 2 + 外边距 * 2;
      旋转弧度 = 形状对象.旋转弧度;
    } else if (形状对象.形状 === "多边形" || 形状对象.形状 === "多角星") {
      坐标.x = 形状对象.极值坐标.左 - 外边距;
      坐标.y = 形状对象.极值坐标.上 - 外边距;
      尺寸.width = 形状对象.极值坐标.右 - 形状对象.极值坐标.左 + 外边距 * 2;
      尺寸.height = 形状对象.极值坐标.下 - 形状对象.极值坐标.上 + 外边距 * 2;
    } else if (形状对象.形状 === "直线" || 形状对象.形状 === "自由") {
      let 最左 = 形状对象.顶点坐标组[0].x;
      let 最右 = 形状对象.顶点坐标组[0].x;
      let 最上 = 形状对象.顶点坐标组[0].y;
      let 最下 = 形状对象.顶点坐标组[0].y;
      for (const 坐标 of 形状对象.顶点坐标组) {
        if (坐标.x < 最左) {
          最左 = 坐标.x;
        }
        if (坐标.x > 最右) {
          最右 = 坐标.x;
        }
        if (坐标.y < 最上) {
          最上 = 坐标.y;
        }
        if (坐标.y > 最下) {
          最下 = 坐标.y;
        }
      }
      const 宽度 = 最右 - 最左;
      const 高度 = 最下 - 最上;
      坐标.x = 最左 - 外边距;
      坐标.y = 最上 - 外边距;
      尺寸.width = 宽度 + 外边距 * 2;
      尺寸.height = 高度 + 外边距 * 2;
    }
    this.交互框 = {
      坐标: 坐标,
      尺寸: 尺寸,
      交互形状: 形状对象,
      容差: 10,
      外边距: 外边距,
      旋转弧度: 旋转弧度,
    };
    const 虚线长度 = 10;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([虚线长度, 虚线长度]);
    if (形状对象.形状 === "圆") {
      this.ctx.translate(形状对象.坐标.x, 形状对象.坐标.y);
      this.ctx.rotate(this.交互框.旋转弧度);
    }
    this.ctx.rect(
      形状对象.形状 === "圆" ? -this.交互框.尺寸.width / 2 : this.交互框.坐标.x,
      形状对象.形状 === "圆" ? -this.交互框.尺寸.height / 2 : this.交互框.坐标.y,
      this.交互框.尺寸.width,
      this.交互框.尺寸.height,
    );
    this.ctx.strokeStyle = "greenyellow";
    this.ctx.stroke();
    this.ctx.lineDashOffset = 虚线长度;
    this.ctx.strokeStyle = "#234";
    this.ctx.stroke();
    const 句柄半径 = 8;
    this.ctx.strokeStyle = "#aaa";
    this.ctx.lineWidth = 4;
    this.ctx.fillStyle = "#333";
    this.ctx.setLineDash([]);
    const 句柄总路径 = new Path2D();
    const 句柄路径组 = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
    for (let i = 0; i < 句柄路径组.length; i++) {
      if (i === 0) {
        句柄路径组[i].arc(
          形状对象.形状 === "圆" ? -this.交互框.尺寸.width / 2 : this.交互框.坐标.x,
          形状对象.形状 === "圆" ? -this.交互框.尺寸.height / 2 : this.交互框.坐标.y,
          句柄半径,
          0,
          2 * Math.PI,
        );
      } else if (i === 1) {
        句柄路径组[i].arc(
          this.交互框.尺寸.width + (形状对象.形状 === "圆" ? -this.交互框.尺寸.width / 2 : this.交互框.坐标.x),
          形状对象.形状 === "圆" ? -this.交互框.尺寸.height / 2 : this.交互框.坐标.y,
          句柄半径,
          0,
          2 * Math.PI,
        );
      } else if (i === 2) {
        句柄路径组[i].arc(
          this.交互框.尺寸.width + (形状对象.形状 === "圆" ? -this.交互框.尺寸.width / 2 : this.交互框.坐标.x),
          this.交互框.尺寸.height + (形状对象.形状 === "圆" ? -this.交互框.尺寸.height / 2 : this.交互框.坐标.y),
          句柄半径,
          0,
          2 * Math.PI,
        );
      } else {
        句柄路径组[i].arc(
          形状对象.形状 === "圆" ? -this.交互框.尺寸.width / 2 : this.交互框.坐标.x,
          this.交互框.尺寸.height + (形状对象.形状 === "圆" ? -this.交互框.尺寸.height / 2 : this.交互框.坐标.y),
          句柄半径,
          0,
          2 * Math.PI,
        );
      }

      句柄总路径.addPath(句柄路径组[i]);
    }
    this.ctx.stroke(句柄总路径);
    this.ctx.fill(句柄总路径);
    this.ctx.restore();
  }

  绘制操作说明() {
    if (this.当前形状对象.形状 === null) return;
    const 特殊名词组 = ["↑", "↓", "←", "→", "[", "]", "Shift", "Enter", "ESC"];
    const 上距离 = 20;
    const 右距离 = 20;
    const 起始坐标 = {
      x: this.canvas.offsetWidth - 右距离,
      y: 上距离,
    };
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "top";
    this.ctx.font = "14px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    const 段间距 = 5;
    const 操作说明组 = this.操作说明[this.当前形状对象.形状];
    for (const 操作说明 of 操作说明组) {
      const 说明分段集合 = 操作说明.split(" ");
      起始坐标.x = this.canvas.offsetWidth - 右距离;
      for (let i = 说明分段集合.length - 1; i >= 0; i--) {
        const 本段宽度 = this.ctx.measureText(说明分段集合[i]).width;
        if (特殊名词组.includes(说明分段集合[i])) {
          this.ctx.fillStyle = "lightskyblue";
        } else {
          this.ctx.fillStyle = "#fffa";
        }
        this.ctx.fillText(说明分段集合[i], 起始坐标.x, 起始坐标.y);
        起始坐标.x -= 本段宽度 + 段间距;
      }
      起始坐标.y += 25;
    }
    this.ctx.closePath();
    this.ctx.restore();
  }
}

new 随心绘();
