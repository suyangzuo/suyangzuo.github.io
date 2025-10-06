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

    this.辅助 = {
      视觉效果复选框: document.getElementById("辅助视觉效果"),
    };

    this.操作说明 = {
      矩形: ["按住 Shift 绘制正方形", "按 ↑ 或 ↓ 调整圆角"],
      椭圆: ["按住 Shift 绘制正圆", "按 ← 或 → 精细调整旋转弧度", "按 ↑ 或 ↓ 快速调整旋转弧度"],
      正圆: [],
      正多边形: ["按 ↑ 或 ↓ 调整边数", "按 ← 或 → 精细调整起始弧度", "按住 Shift 同时按 ← 或 → 快速调整起始弧度"],
      正多角星: [
        "按 ↑ 或 ↓ 调整角数",
        "按 ← 或 → 精细调整起始弧度",
        "按住 Shift 同时按 ← 或 → 快速调整起始弧度",
        "按 [ 或 ] 调整内半径",
      ],
      直线: ["按 Enter 确认", "按 ESC 取消"],
    };

    this.全局标志 = {
      左键已按下: false,
      拖拽中: false,
      正多边形边数可增减: true,
      正多边形可旋转: true,
      手动调整内半径: false,
      辅助视觉效果: this.辅助.视觉效果复选框.checked,
    };

    this.全局属性 = {
      已选中基础形状: null,
      填充色: "transparent",
      描边色: "rgba(128, 128, 128, 1)",
      辅助外框描边色: "#aaccee12",
      辅助线段描边色: "#a81",
      描边宽度: 2,
      正多边形边数: 5,
      鼠标坐标: null,
      点击坐标: null,
      左键按下时间: null,
      拖拽时间: null,
      鼠标与点击坐标位置关系: {
        上: null,
        左: null,
      },
      当前形状对象: {
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
      },
    };

    this.数据集 = {
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
    };

    this.添加颜色拾取器();
    this.添加颜色拾取器事件();
    this.添加描边宽度滑块事件();
    this.添加清空画布按钮点击事件();
    this.添加撤销按钮点击事件();
    this.处理辅助效果选项();
    this.添加键盘事件();
    this.添加canvas点击事件();
    this.添加canvas鼠标抬起事件();
    this.添加canvas鼠标移动事件();
    this.添加基础形状分区点击事件();
  }

  添加颜色拾取器() {
    this.描边颜色拾取器 = Pickr.create({
      el: ".颜色框",
      theme: "monolith", // or 'monolith', or 'nano'
      default: "rgba(128, 128, 128, 1)",

      swatches: [
        "rgba(128, 128, 128, 1)",
        "rgba(244, 67, 54, 1)",
        "rgba(233, 30, 99, 0.95)",
        "rgba(156, 39, 176, 0.9)",
        "rgba(103, 58, 183, 0.85)",
        "rgba(63, 81, 181, 0.8)",
        "rgba(33, 150, 243, 0.75)",
        "rgba(0, 188, 212, 0.7)",
        "rgba(0, 150, 136, 0.75)",
        "rgba(76, 175, 80, 0.8)",
        "rgba(139, 195, 74, 0.85)",
        "rgba(255, 235, 59, 0.95)",
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

    this.填充颜色拾取器 = Pickr.create({
      el: ".颜色框",
      theme: "monolith", // or 'monolith', or 'nano'
      default: "rgba(0, 0, 0, 0)",

      swatches: [
        "rgba(0, 0, 0, 0)",
        "rgba(244, 67, 54, 1)",
        "rgba(233, 30, 99, 0.95)",
        "rgba(156, 39, 176, 0.9)",
        "rgba(103, 58, 183, 0.85)",
        "rgba(63, 81, 181, 0.8)",
        "rgba(33, 150, 243, 0.75)",
        "rgba(0, 188, 212, 0.7)",
        "rgba(0, 150, 136, 0.75)",
        "rgba(76, 175, 80, 0.8)",
        "rgba(139, 195, 74, 0.85)",
        "rgba(255, 235, 59, 0.95)",
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
      this.全局属性.描边色 = color.toRGBA().toString();
    });

    this.填充颜色拾取器.on("change", (color) => {
      this.全局属性.填充色 = color.toRGBA().toString();
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
      this.全局属性.描边宽度 = parseInt(描边宽度滑块.value, 10);
      描边宽度滑块.nextElementSibling.textContent = 描边宽度滑块.value;
    });
  }

  添加基础形状分区点击事件() {
    for (const 基础形状分区 of this.基础形状分区组) {
      基础形状分区.addEventListener("click", () => {
        this.全局属性.已选中基础形状 = 基础形状分区.getAttribute("形状");
      });
    }
  }

  添加canvas鼠标移动事件() {
    this.canvas.addEventListener("mousemove", (e) => {
      this.全局属性.鼠标坐标 = this.获取鼠标坐标(e);
      if (!this.全局标志.左键已按下 && this.全局属性.已选中基础形状 !== "直线") return;
      this.清空画布();
      this.判断鼠标与点击坐标位置关系();
      this.绘制基础形状对象组();

      if (this.全局属性.已选中基础形状) {
        this.全局属性.当前形状对象.描边色 = this.全局属性.描边色;
        this.全局属性.当前形状对象.填充色 = this.全局属性.填充色;
      }
      if (this.全局属性.已选中基础形状 === "矩形") {
        this.全局属性.当前形状对象.形状 = "矩形";
        if (!this.键盘状态.Shift) {
          this.全局属性.当前形状对象.尺寸 = {
            宽: Math.abs(this.全局属性.点击坐标.x - this.全局属性.鼠标坐标.x),
            高: Math.abs(this.全局属性.点击坐标.y - this.全局属性.鼠标坐标.y),
          };
          this.全局属性.当前形状对象.坐标.x = this.全局属性.鼠标与点击坐标位置关系.左
            ? this.全局属性.鼠标坐标.x
            : this.全局属性.点击坐标.x;
          this.全局属性.当前形状对象.坐标.y = this.全局属性.鼠标与点击坐标位置关系.上
            ? this.全局属性.鼠标坐标.y
            : this.全局属性.点击坐标.y;
        } else {
          const 水平偏移 = Math.abs(this.全局属性.点击坐标.x - this.全局属性.鼠标坐标.x);
          const 垂直偏移 = Math.abs(this.全局属性.点击坐标.y - this.全局属性.鼠标坐标.y);
          const 更大偏移 = Math.max(水平偏移, 垂直偏移);
          this.全局属性.当前形状对象.尺寸 = {
            宽: 更大偏移,
            高: 更大偏移,
          };
          this.全局属性.当前形状对象.坐标.x =
            this.全局属性.点击坐标.x + 更大偏移 * (this.全局属性.鼠标与点击坐标位置关系.左 ? -1 : 0);
          this.全局属性.当前形状对象.坐标.y =
            this.全局属性.点击坐标.y + 更大偏移 * (this.全局属性.鼠标与点击坐标位置关系.上 ? -1 : 0);
        }
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制矩形(
          this.全局属性.当前形状对象.坐标.x,
          this.全局属性.当前形状对象.坐标.y,
          this.全局属性.当前形状对象.尺寸.宽,
          this.全局属性.当前形状对象.尺寸.高,
          this.全局属性.当前形状对象.圆角,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        );
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助点(this.全局属性.当前形状对象.坐标.x, this.全局属性.当前形状对象.坐标.y);
        }
      } else if (this.全局属性.已选中基础形状 === "圆") {
        if (!this.键盘状态.Shift) {
          this.全局属性.当前形状对象.形状 = "椭圆";
          this.全局属性.当前形状对象.尺寸 = {
            水平半径: Math.abs(this.全局属性.点击坐标.x - this.全局属性.鼠标坐标.x),
            垂直半径: Math.abs(this.全局属性.点击坐标.y - this.全局属性.鼠标坐标.y),
          };
          this.全局属性.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
          this.全局属性.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
          if (this.全局标志.辅助视觉效果) {
            this.绘制操作说明();
          }
          this.绘制椭圆(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.全局属性.当前形状对象.尺寸.水平半径,
            this.全局属性.当前形状对象.尺寸.垂直半径,
            this.全局属性.当前形状对象.旋转弧度,
            this.全局属性.描边色,
            this.全局属性.填充色,
            this.全局属性.描边宽度
          );
          if (this.全局标志.辅助视觉效果) {
            const 偏移x = Math.cos(this.全局属性.当前形状对象.旋转弧度) * this.全局属性.当前形状对象.尺寸.水平半径;
            const 偏移y = Math.sin(this.全局属性.当前形状对象.旋转弧度) * this.全局属性.当前形状对象.尺寸.水平半径;
            const 终点坐标 = {
              x: this.全局属性.点击坐标.x + 偏移x,
              y: this.全局属性.点击坐标.y + 偏移y,
            };
            this.绘制辅助虚线(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, 终点坐标.x, 终点坐标.y);
            this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
          }
        } else {
          this.全局属性.当前形状对象.形状 = "正圆";
          const 水平偏移 = Math.abs(this.全局属性.点击坐标.x - this.全局属性.鼠标坐标.x);
          const 垂直偏移 = Math.abs(this.全局属性.点击坐标.y - this.全局属性.鼠标坐标.y);
          const 更大偏移 = Math.max(水平偏移, 垂直偏移);
          this.全局属性.当前形状对象.尺寸 = {
            半径: 更大偏移,
          };
          this.全局属性.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
          this.全局属性.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
          if (this.全局标志.辅助视觉效果) {
            this.绘制操作说明();
          }
          this.绘制正圆(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.全局属性.当前形状对象.尺寸.半径,
            this.全局属性.描边色,
            this.全局属性.填充色,
            this.全局属性.描边宽度
          );
        }
      } else if (this.全局属性.已选中基础形状 === "正多边形") {
        this.全局属性.当前形状对象.形状 = "正多边形";
        this.全局属性.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.全局属性.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        const 半径 = this.获取绘制半径(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.鼠标坐标.x,
          this.全局属性.鼠标坐标.y
        );
        this.全局属性.当前形状对象.尺寸 = {
          半径: 半径,
        };
        this.全局属性.当前形状对象.边数 = this.全局属性.正多边形边数;
        this.全局属性.当前形状对象.顶点坐标组 = this.获取正多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          半径,
          this.全局属性.当前形状对象.边数,
          this.全局属性.当前形状对象.起始弧度
        );
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制正多边形(
          this.全局属性.当前形状对象.顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        );
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.全局属性.当前形状对象.顶点坐标组[0].x,
            this.全局属性.当前形状对象.顶点坐标组[0].y
          );
          this.描边辅助正圆(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, this.全局属性.当前形状对象.尺寸.半径);
        }
      } else if (this.全局属性.已选中基础形状 === "正多角星") {
        this.全局属性.当前形状对象.形状 = "正多角星";
        this.全局属性.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.全局属性.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        const 外半径 = this.获取绘制半径(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.鼠标坐标.x,
          this.全局属性.鼠标坐标.y
        );
        if (!this.全局属性.当前形状对象.尺寸) {
          this.全局属性.当前形状对象.尺寸 = {
            外半径: 0,
            内半径: 0,
          };
        }
        this.全局属性.当前形状对象.尺寸.外半径 = 外半径;
        if (!this.全局标志.手动调整内半径) {
          this.全局属性.当前形状对象.尺寸.内半径 = 外半径 * 0.5;
        }
        const 边数 = this.全局属性.正多边形边数;
        this.全局属性.当前形状对象.边数 = this.全局属性.正多边形边数;
        this.全局属性.当前形状对象.外顶点坐标组 = this.获取正多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.当前形状对象.尺寸.外半径,
          this.全局属性.当前形状对象.边数,
          this.全局属性.当前形状对象.起始弧度
        );
        this.全局属性.当前形状对象.内顶点坐标组 = this.获取正多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.当前形状对象.尺寸.内半径,
          this.全局属性.当前形状对象.边数,
          this.全局属性.当前形状对象.起始弧度 + Math.PI / 边数
        );
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制正多角星(
          this.全局属性.当前形状对象.外顶点坐标组,
          this.全局属性.当前形状对象.内顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        );
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.全局属性.当前形状对象.外顶点坐标组[0].x,
            this.全局属性.当前形状对象.外顶点坐标组[0].y
          );
          this.描边辅助正圆(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, this.全局属性.当前形状对象.尺寸.外半径);
          this.描边辅助正圆(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, this.全局属性.当前形状对象.尺寸.内半径);
        }
      } else if (this.全局属性.已选中基础形状 === "直线") {
        this.全局属性.当前形状对象.形状 = "直线";
        if (this.全局标志.辅助视觉效果 && this.全局属性.当前形状对象.顶点坐标组.length > 0) {
          this.绘制操作说明();
        }
        if (this.全局属性.当前形状对象.顶点坐标组.length >= 2) {
          this.绘制直线(this.全局属性.当前形状对象.顶点坐标组, this.全局属性.描边色, this.全局属性.描边宽度);
        }
        if (this.全局属性.当前形状对象.顶点坐标组.length >= 1) {
          const 最后坐标 = this.全局属性.当前形状对象.顶点坐标组[this.全局属性.当前形状对象.顶点坐标组.length - 1];
          if (this.全局标志.辅助视觉效果) {
            this.绘制辅助虚线(最后坐标.x, 最后坐标.y, this.全局属性.鼠标坐标.x, this.全局属性.鼠标坐标.y);
          }
        }
        if (this.全局标志.辅助视觉效果) {
          for (const 坐标 of this.全局属性.当前形状对象.顶点坐标组) {
            this.绘制辅助点(坐标.x, 坐标.y);
          }
        }
      }
      if (
        this.全局标志.辅助视觉效果 &&
        this.全局属性.已选中基础形状 &&
        this.全局属性.已选中基础形状 !== "矩形" &&
        this.全局属性.已选中基础形状 !== "直线"
      ) {
        this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
      }
    });
  }

  添加canvas点击事件() {
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      this.全局标志.左键已按下 = true;
      this.全局标志.手动调整内半径 = false;
      this.全局属性.点击坐标 = this.全局属性.鼠标坐标;
      this.全局属性.当前形状对象.描边宽度 = this.全局属性.描边宽度;
      if (this.全局属性.已选中基础形状 === "矩形") {
        this.全局属性.当前形状对象.圆角 = 0;
      } else if (this.全局属性.已选中基础形状 === "正多边形" || this.全局属性.已选中基础形状 === "正多角星") {
        this.全局属性.当前形状对象.起始弧度 = -Math.PI / 2;
      } else if (this.全局属性.已选中基础形状 === "圆" && !this.键盘状态.Shift) {
        this.全局属性.当前形状对象.旋转弧度 = 0;
      } else if (this.全局属性.已选中基础形状 === "直线") {
        this.清空画布();
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.全局属性.当前形状对象.形状 === "直线";
        if (this.全局属性.当前形状对象.顶点坐标组.length === 0) {
          this.ctx.moveTo(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
        } else {
          this.ctx.lineTo(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
        }
        this.全局属性.当前形状对象.顶点坐标组.push(this.全局属性.点击坐标);
        this.绘制直线(this.全局属性.当前形状对象.顶点坐标组, this.全局属性.描边色, this.全局属性.描边宽度);
        if (this.全局标志.辅助视觉效果) {
          for (const 坐标 of this.全局属性.当前形状对象.顶点坐标组) {
            this.绘制辅助点(坐标.x, 坐标.y);
          }
        }
      }
    });
  }

  添加canvas鼠标抬起事件() {
    this.canvas.addEventListener("mouseup", () => {
      if (!this.全局属性.点击坐标) return;
      const 移动距离 = Math.sqrt(
        Math.abs(this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x) ** 2 +
          Math.abs(this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y) ** 2
      );
      this.全局标志.左键已按下 = false;
      this.全局属性.拖拽中 = false;
      this.全局属性.左键按下时间 = null;
      this.全局属性.拖拽时间 = null;
      this.全局标志.手动调整内半径 = false;
      this.全局属性.正多边形边数 = 5;
      if (this.全局属性.已选中基础形状 && this.全局属性.已选中基础形状 !== "直线" && 移动距离 > 0) {
        this.数据集.基础形状对象组.push(structuredClone(this.全局属性.当前形状对象));
        this.清空画布();
        this.绘制基础形状对象组();
        this.全局属性.点击坐标 = null;
        this.全局属性.当前形状对象.顶点坐标组 = [];
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
        this.撤销();
        return;
      }
      if (e.key === "Enter") {
        if (this.全局属性.已选中基础形状 === "直线") {
          this.数据集.基础形状对象组.push(structuredClone(this.全局属性.当前形状对象));
        }
      }
      if (e.key === "Escape" || e.key === "Enter") {
        this.全局标志.左键已按下 = false;
        this.全局属性.拖拽中 = false;
        this.全局属性.点击坐标 = null;
        this.全局属性.左键按下时间 = null;
        this.全局属性.拖拽时间 = null;
        this.全局属性.正多边形边数 = 5;
        this.重置当前形状对象();
        this.清空画布();
        this.绘制基础形状对象组();
      }
      if (e.key === "Escape") {
        return;
      }
      if (this.全局标志.左键已按下 && this.全局属性.已选中基础形状 === "矩形") {
        const 短边 = Math.min(this.全局属性.当前形状对象.尺寸.宽, this.全局属性.当前形状对象.尺寸.高);
        if (this.键盘状态.ArrowUp && this.全局属性.当前形状对象.圆角 < 短边 / 2) {
          this.全局属性.当前形状对象.圆角 += 1;
        }
        if (this.键盘状态.ArrowDown && this.全局属性.当前形状对象.圆角 >= 1) {
          this.全局属性.当前形状对象.圆角 -= 1;
        }
        this.清空画布();
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.绘制矩形(
          this.全局属性.当前形状对象.坐标.x,
          this.全局属性.当前形状对象.坐标.y,
          this.全局属性.当前形状对象.尺寸.宽,
          this.全局属性.当前形状对象.尺寸.高,
          this.全局属性.当前形状对象.圆角,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        );
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助点(this.全局属性.当前形状对象.坐标.x, this.全局属性.当前形状对象.坐标.y);
        }
      } else if (this.全局标志.左键已按下 && !this.键盘状态.Shift && this.全局属性.已选中基础形状 === "圆") {
        if (this.键盘状态.ArrowLeft) {
          this.全局属性.当前形状对象.旋转弧度 -= 0.01;
        }
        if (this.键盘状态.ArrowRight) {
          this.全局属性.当前形状对象.旋转弧度 += 0.01;
        }
        if (this.键盘状态.ArrowUp) {
          this.全局属性.当前形状对象.旋转弧度 -= 0.05;
        }
        if (this.键盘状态.ArrowDown) {
          this.全局属性.当前形状对象.旋转弧度 += 0.05;
        }
        this.清空画布();
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.绘制椭圆(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.当前形状对象.尺寸.水平半径,
          this.全局属性.当前形状对象.尺寸.垂直半径,
          this.全局属性.当前形状对象.旋转弧度,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        );
        if (this.全局标志.辅助视觉效果) {
          const 偏移x = Math.cos(this.全局属性.当前形状对象.旋转弧度) * this.全局属性.当前形状对象.尺寸.水平半径;
          const 偏移y = Math.sin(this.全局属性.当前形状对象.旋转弧度) * this.全局属性.当前形状对象.尺寸.水平半径;
          const 终点坐标 = {
            x: this.全局属性.点击坐标.x + 偏移x,
            y: this.全局属性.点击坐标.y + 偏移y,
          };
          this.绘制辅助虚线(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, 终点坐标.x, 终点坐标.y);
          this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
        }
      } else if (
        this.全局标志.左键已按下 &&
        this.全局标志.正多边形边数可增减 &&
        this.全局标志.正多边形可旋转 &&
        this.全局属性.已选中基础形状 === "正多边形"
      ) {
        if (this.键盘状态.ArrowUp) {
          if (this.全局属性.正多边形边数 < 50) {
            this.全局属性.正多边形边数++;
          }
        }
        if (this.键盘状态.ArrowDown) {
          if (this.全局属性.正多边形边数 > 3) {
            this.全局属性.正多边形边数--;
          }
        }
        if (this.键盘状态.ArrowLeft) {
          this.全局属性.当前形状对象.起始弧度 -= this.键盘状态.Shift ? 0.05 : 0.01;
        }
        if (this.键盘状态.ArrowRight) {
          this.全局属性.当前形状对象.起始弧度 += this.键盘状态.Shift ? 0.05 : 0.01;
        }
        this.清空画布();
        this.全局属性.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.全局属性.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        const 半径 = this.获取绘制半径(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.鼠标坐标.x,
          this.全局属性.鼠标坐标.y
        );
        this.全局属性.当前形状对象.尺寸 = {
          半径: 半径,
        };
        this.全局属性.当前形状对象.边数 = this.全局属性.正多边形边数;
        this.全局属性.当前形状对象.顶点坐标组 = this.获取正多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          半径,
          this.全局属性.当前形状对象.边数,
          this.全局属性.当前形状对象.起始弧度
        );
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.绘制正多边形(
          this.全局属性.当前形状对象.顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        );
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.全局属性.当前形状对象.顶点坐标组[0].x,
            this.全局属性.当前形状对象.顶点坐标组[0].y
          );
          this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
          this.描边辅助正圆(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, this.全局属性.当前形状对象.尺寸.半径);
        }
      } else if (
        this.全局标志.左键已按下 &&
        this.全局标志.正多边形边数可增减 &&
        this.全局标志.正多边形可旋转 &&
        this.全局属性.已选中基础形状 === "正多角星"
      ) {
        if (this.键盘状态.ArrowUp) {
          if (this.全局属性.正多边形边数 < 100) {
            this.全局属性.正多边形边数++;
          }
        }
        if (this.键盘状态.ArrowDown) {
          if (this.全局属性.正多边形边数 > 3) {
            this.全局属性.正多边形边数--;
          }
        }
        if (this.键盘状态.ArrowLeft) {
          this.全局属性.当前形状对象.起始弧度 -= this.键盘状态.Shift ? 0.05 : 0.01;
        }
        if (this.键盘状态.ArrowRight) {
          this.全局属性.当前形状对象.起始弧度 += this.键盘状态.Shift ? 0.05 : 0.01;
        }
        if (e.key === "[") {
          this.全局标志.手动调整内半径 = true;
          if (this.全局属性.当前形状对象.尺寸.内半径 >= 2) {
            this.全局属性.当前形状对象.尺寸.内半径 -= 2;
          }
        }
        if (e.key === "]") {
          this.全局标志.手动调整内半径 = true;
          this.全局属性.当前形状对象.尺寸.内半径 += 2;
        }
        this.清空画布();
        this.全局属性.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.全局属性.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        this.全局属性.当前形状对象.尺寸.外半径 = this.获取绘制半径(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.鼠标坐标.x,
          this.全局属性.鼠标坐标.y
        );
        this.全局属性.当前形状对象.边数 = this.全局属性.正多边形边数;
        this.全局属性.当前形状对象.外顶点坐标组 = this.获取正多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.当前形状对象.尺寸.外半径,
          this.全局属性.当前形状对象.边数,
          this.全局属性.当前形状对象.起始弧度
        );
        this.全局属性.当前形状对象.内顶点坐标组 = this.获取正多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.当前形状对象.尺寸.内半径,
          this.全局属性.当前形状对象.边数,
          this.全局属性.当前形状对象.起始弧度 + Math.PI / this.全局属性.当前形状对象.边数
        );
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.绘制正多角星(
          this.全局属性.当前形状对象.外顶点坐标组,
          this.全局属性.当前形状对象.内顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        );
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.全局属性.当前形状对象.外顶点坐标组[0].x,
            this.全局属性.当前形状对象.外顶点坐标组[0].y
          );
          this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
          this.描边辅助正圆(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, this.全局属性.当前形状对象.尺寸.外半径);
          this.描边辅助正圆(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, this.全局属性.当前形状对象.尺寸.内半径);
        }
      }
    });

    document.addEventListener("keyup", (e) => {
      if (!Object.hasOwn(this.键盘状态, e.key)) return;
      this.键盘状态[e.key] = false;
      this.全局标志.正多边形边数可增减 = true;
      this.全局标志.正多边形可旋转 = true;
    });
  }

  处理辅助效果选项() {
    this.辅助.视觉效果复选框.addEventListener("change", () => {
      this.全局标志.辅助视觉效果 = this.辅助.视觉效果复选框.checked;
    });
  }

  绘制矩形(x, y, 宽, 高, 圆角, 描边色, 填充色, 描边宽度) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, 宽, 高, [圆角]);
    this.ctx.strokeStyle = 描边色;
    this.ctx.fillStyle = 填充色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      填充色: 填充色,
      坐标: { x: x, y: y },
      尺寸: { 宽: 宽, 高: 高 },
      圆角: 圆角,
    };
  }

  绘制正圆(x, y, 半径, 描边色, 填充色, 描边宽度) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, 半径, 0, 2 * Math.PI);
    this.ctx.strokeStyle = 描边色;
    this.ctx.fillStyle = 填充色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      填充色: 填充色,
      坐标: { x: x, y: y },
      尺寸: { 半径: 半径 },
    };
  }

  绘制椭圆(x, y, 水平半径, 垂直半径, 旋转弧度, 描边色, 填充色, 描边宽度) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, 水平半径, 垂直半径, 旋转弧度, 0, 2 * Math.PI);
    this.ctx.strokeStyle = 描边色;
    this.ctx.fillStyle = 填充色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      填充色: 填充色,
      坐标: { x: x, y: y },
      尺寸: { 水平半径: 水平半径, 垂直半径: 垂直半径 },
      旋转弧度: 旋转弧度,
    };
  }

  绘制正多边形(顶点坐标组, 描边色, 填充色, 描边宽度) {
    if (顶点坐标组.length < 3) return;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(顶点坐标组[0].x, 顶点坐标组[0].y);
    for (let i = 1; i < 顶点坐标组.length; i++) {
      this.ctx.lineTo(顶点坐标组[i].x, 顶点坐标组[i].y);
    }
    this.ctx.closePath();
    this.ctx.strokeStyle = 描边色;
    this.ctx.fillStyle = 填充色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      填充色: 填充色,
      顶点坐标组: 顶点坐标组,
    };
  }

  绘制正多角星(外顶点坐标组, 内顶点坐标组, 描边色, 填充色, 描边宽度) {
    if (外顶点坐标组.length < 3 || 内顶点坐标组.length < 3) return;
    const 边数 = 外顶点坐标组.length;
    this.ctx.save();
    this.ctx.beginPath();
    for (let i = 0; i < 边数; i++) {
      if (i === 0) {
        this.ctx.moveTo(外顶点坐标组[i].x, 外顶点坐标组[i].y);
      } else {
        this.ctx.lineTo(外顶点坐标组[i].x, 外顶点坐标组[i].y);
      }
      this.ctx.lineTo(内顶点坐标组[i].x, 内顶点坐标组[i].y);
    }
    this.ctx.closePath();
    this.ctx.strokeStyle = 描边色;
    this.ctx.fillStyle = 填充色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      填充色: 填充色,
      外顶点坐标组: 外顶点坐标组,
      内顶点坐标组: 内顶点坐标组,
    };
  }

  绘制直线(顶点坐标组, 描边色, 描边宽度) {
    if (顶点坐标组.length < 2) return;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = 描边色;
    this.ctx.lineWidth = 描边宽度;
    for (let i = 0; i < 顶点坐标组.length; i++) {
      if (i === 0) {
        this.ctx.moveTo(顶点坐标组[i].x, 顶点坐标组[i].y);
      } else {
        this.ctx.lineTo(顶点坐标组[i].x, 顶点坐标组[i].y);
      }
    }
    this.ctx.stroke();
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      顶点坐标组: 顶点坐标组,
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

  描边辅助正圆(x, y, 半径) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, 半径, 0, 2 * Math.PI);
    this.ctx.closePath();
    this.ctx.strokeStyle = this.全局属性.辅助外框描边色;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    this.ctx.restore();
  }

  获取正多边形顶点坐标组(x, y, 半径, 边数, 起始弧度) {
    const 弧度偏移 = (2 * Math.PI) / 边数;
    const 顶点坐标组 = [];
    for (let i = 0; i < 边数; i++) {
      const 顶点弧度 = 起始弧度 + i * 弧度偏移;
      const 顶点水平偏移 = 半径 * Math.cos(顶点弧度);
      const 顶点垂直偏移 = 半径 * Math.sin(顶点弧度);
      顶点坐标组.push({
        x: x + 顶点水平偏移,
        y: y + 顶点垂直偏移,
      });
    }
    return 顶点坐标组;
  }

  获取绘制半径(起点x, 起点y, 终点x, 终点y) {
    const 水平偏移 = Math.abs(起点x - 终点x);
    const 垂直偏移 = Math.abs(起点y - 终点y);
    const 半径 = Math.sqrt(水平偏移 ** 2 + 垂直偏移 ** 2);
    return 半径;
  }

  清空画布() {
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
  }

  添加清空画布按钮点击事件() {
    const 清空画布按钮 = document.getElementById("清空画布按钮");
    清空画布按钮.addEventListener("click", () => {
      this.清空画布();
      this.数据集.基础形状对象组 = [];
      this.全局属性.当前形状对象.顶点坐标组 = [];
      this.全局属性.当前形状对象.外顶点坐标组 = [];
      this.全局属性.当前形状对象.内顶点坐标组 = [];
    });
  }

  添加撤销按钮点击事件() {
    const 撤销按钮 = document.getElementById("撤销");
    撤销按钮.addEventListener("click", this.撤销.bind(this));
  }

  撤销() {
    if (
      this.数据集.基础形状对象组.length <= 0 &&
      !(this.全局属性.当前形状对象.形状 === "直线" && this.全局属性.当前形状对象.顶点坐标组.length > 0)
    ) {
      return;
    }
    const 最后记录 = this.数据集.基础形状对象组[this.数据集.基础形状对象组.length - 1];
    if (this.全局属性.当前形状对象.形状 === "直线" && this.全局属性.当前形状对象.顶点坐标组.length >= 1) {
      this.全局属性.当前形状对象.顶点坐标组.pop();
      this.清空画布();
      this.绘制基础形状对象组();
      if (this.全局属性.当前形状对象.顶点坐标组.length >= 2) {
        this.绘制直线(this.全局属性.当前形状对象.顶点坐标组, this.全局属性.描边色, this.全局属性.描边宽度);
      }
      if (this.全局属性.当前形状对象.顶点坐标组.length >= 1) {
        if (this.全局标志.辅助视觉效果) {
          const 最后坐标 = this.全局属性.当前形状对象.顶点坐标组[this.全局属性.当前形状对象.顶点坐标组.length - 1];
          if (this.全局标志.辅助视觉效果) {
            this.绘制辅助虚线(最后坐标.x, 最后坐标.y, this.全局属性.鼠标坐标.x, this.全局属性.鼠标坐标.y);
          }
          for (const 坐标 of this.全局属性.当前形状对象.顶点坐标组) {
            this.绘制辅助点(坐标.x, 坐标.y);
          }
        }
      }
      return;
    } else if (!this.全局属性.当前形状对象.形状 || this.全局属性.当前形状对象.顶点坐标组.length <= 0) {
      if (最后记录.形状 === "直线") {
        最后记录.顶点坐标组.pop();
        if (最后记录.顶点坐标组.length <= 1) {
          this.数据集.基础形状对象组.pop();
        }
      } else {
        this.数据集.基础形状对象组.pop();
      }
    }
    this.清空画布();
    this.绘制基础形状对象组();
  }

  重置当前形状对象() {
    this.全局属性.当前形状对象 = {
      形状: null,
      坐标: { x: null, y: null },
      顶点坐标组: [],
      尺寸: null,
      圆角: 0,
      描边色: "transparent",
      填充色: "transparent",
      描边宽度: this.全局属性.描边宽度,
    };
  }

  绘制基础形状对象组() {
    if (this.数据集.基础形状对象组.length <= 0) return;
    for (const 形状对象 of this.数据集.基础形状对象组) {
      if (形状对象.形状 === "矩形") {
        this.绘制矩形(
          形状对象.坐标.x,
          形状对象.坐标.y,
          形状对象.尺寸.宽,
          形状对象.尺寸.高,
          形状对象.圆角,
          形状对象.描边色,
          形状对象.填充色,
          形状对象.描边宽度
        );
      } else if (形状对象.形状 === "正圆") {
        this.绘制正圆(
          形状对象.坐标.x,
          形状对象.坐标.y,
          形状对象.尺寸.半径,
          形状对象.描边色,
          形状对象.填充色,
          形状对象.描边宽度
        );
      } else if (形状对象.形状 === "椭圆") {
        this.绘制椭圆(
          形状对象.坐标.x,
          形状对象.坐标.y,
          形状对象.尺寸.水平半径,
          形状对象.尺寸.垂直半径,
          形状对象.旋转弧度,
          形状对象.描边色,
          形状对象.填充色,
          形状对象.描边宽度
        );
      } else if (形状对象.形状 === "正多边形") {
        this.绘制正多边形(形状对象.顶点坐标组, 形状对象.描边色, 形状对象.填充色, 形状对象.描边宽度);
      } else if (形状对象.形状 === "正多角星") {
        this.绘制正多角星(
          形状对象.外顶点坐标组,
          形状对象.内顶点坐标组,
          形状对象.描边色,
          形状对象.填充色,
          形状对象.描边宽度
        );
      } else if (形状对象.形状 === "直线") {
        this.绘制直线(形状对象.顶点坐标组, 形状对象.描边色, 形状对象.描边宽度);
      }
    }
  }

  绘制操作说明() {
    if (this.全局属性.当前形状对象.形状 === null) return;
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
    const 操作说明组 = this.操作说明[this.全局属性.当前形状对象.形状];
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
