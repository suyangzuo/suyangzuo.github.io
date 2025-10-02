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
    });
    document.addEventListener("scroll", () => {
      this.画布边界矩形 = this.canvas.getBoundingClientRect();
    });

    this.辅助 = {
      视觉效果复选框: document.getElementById("辅助视觉效果"),
    };

    this.全局标志 = {
      左键已按下: false,
      拖拽中: false,
      正多边形边数可增减: true,
      正多边形可旋转: true,
      手动调整内半径: false,
    };

    this.全局属性 = {
      辅助视觉效果: this.辅助.视觉效果复选框.checked,
      已选中基础形状: null,
      填充色: "transparent",
      描边色: "#aaa",
      辅助外框描边色: "#aaccee12",
      辅助线段描边色: "#a81",
      当前描边宽度: 2,
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
        尺寸: null,
        描边色: "transparent",
        填充色: "transparent",
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
      Escape: false,
      "[": false,
      "]": false,
    };

    this.处理辅助效果选项();
    this.添加键盘事件();
    this.添加canvas点击事件();
    this.添加canvas鼠标抬起事件();
    this.添加canvas鼠标移动事件();
    this.添加基础形状分区点击事件();
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
      if (!this.全局标志.左键已按下) return;
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
        this.绘制矩形(
          this.全局属性.当前形状对象.坐标.x,
          this.全局属性.当前形状对象.坐标.y,
          this.全局属性.当前形状对象.尺寸.宽,
          this.全局属性.当前形状对象.尺寸.高
        );
        if (this.全局属性.辅助视觉效果) {
          const 辅助半径 = 5;
          this.ctx.save();
          this.ctx.beginPath();
          if (!this.全局属性.鼠标与点击坐标位置关系.左 && !this.全局属性.鼠标与点击坐标位置关系.上) {
            this.ctx.arc(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, 辅助半径, 0, 2 * Math.PI);
          } else if (this.全局属性.鼠标与点击坐标位置关系.左 && this.全局属性.鼠标与点击坐标位置关系.上) {
            this.ctx.arc(this.全局属性.鼠标坐标.x, this.全局属性.鼠标坐标.y, 辅助半径, 0, 2 * Math.PI);
          } else if (this.全局属性.鼠标与点击坐标位置关系.左 && !this.全局属性.鼠标与点击坐标位置关系.上) {
            this.ctx.arc(this.全局属性.鼠标坐标.x, this.全局属性.点击坐标.y, 辅助半径, 0, 2 * Math.PI);
          } else if (!this.全局属性.鼠标与点击坐标位置关系.左 && this.全局属性.鼠标与点击坐标位置关系.上) {
            this.ctx.arc(this.全局属性.点击坐标.x, this.全局属性.鼠标坐标.y, 辅助半径, 0, 2 * Math.PI);
          }
          this.ctx.closePath();
          this.ctx.fillStyle = "yellowgreen";
          this.ctx.fill();
          this.ctx.restore();
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
          this.绘制椭圆(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.全局属性.当前形状对象.尺寸.水平半径,
            this.全局属性.当前形状对象.尺寸.垂直半径,
            this.全局属性.当前形状对象.旋转弧度
          );
          if (this.全局属性.辅助视觉效果) {
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
          this.绘制正圆(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, this.全局属性.当前形状对象.尺寸.半径);
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
        this.绘制正多边形(this.全局属性.当前形状对象.顶点坐标组);
        if (this.全局属性.辅助视觉效果) {
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
          边数 % 2 === 0
            ? this.全局属性.当前形状对象.起始弧度 + Math.PI - Math.PI / 边数
            : this.全局属性.当前形状对象.起始弧度 + Math.PI
        );
        this.绘制正多角星(this.全局属性.当前形状对象.外顶点坐标组, this.全局属性.当前形状对象.内顶点坐标组);
        if (this.全局属性.辅助视觉效果) {
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.全局属性.当前形状对象.外顶点坐标组[0].x,
            this.全局属性.当前形状对象.外顶点坐标组[0].y
          );
          this.描边辅助正圆(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, this.全局属性.当前形状对象.尺寸.外半径);
          this.描边辅助正圆(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, this.全局属性.当前形状对象.尺寸.内半径);
        }
      }
      if (this.全局属性.辅助视觉效果 && this.全局属性.已选中基础形状 && this.全局属性.已选中基础形状 !== "矩形") {
        this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
      }
    });
  }

  添加canvas点击事件() {
    this.canvas.addEventListener("mousedown", () => {
      this.全局标志.左键已按下 = true;
      this.全局标志.手动调整内半径 = false;
      this.全局属性.点击坐标 = this.全局属性.鼠标坐标;
      if (this.全局属性.已选中基础形状 === "正多边形" || this.全局属性.已选中基础形状 === "正多角星") {
        this.全局属性.当前形状对象.起始弧度 = -Math.PI / 2;
      } else if (this.全局属性.已选中基础形状 === "圆" && !this.键盘状态.Shift) {
        this.全局属性.当前形状对象.旋转弧度 = 0;
      }
    });
  }

  添加canvas鼠标抬起事件() {
    this.canvas.addEventListener("mouseup", () => {
      this.全局标志.左键已按下 = false;
      this.全局属性.拖拽中 = false;
      this.全局属性.点击坐标 = null;
      this.全局属性.左键按下时间 = null;
      this.全局属性.拖拽时间 = null;
      this.全局标志.手动调整内半径 = false;
      if (this.全局属性.已选中基础形状) {
        this.数据集.基础形状对象组.push(structuredClone(this.全局属性.当前形状对象));
      }
      this.清空画布();
      this.绘制基础形状对象组();
    });
  }

  判断鼠标与点击坐标位置关系() {
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
      if (e.key === "Escape" && this.全局标志.左键已按下) {
        this.全局标志.左键已按下 = false;
        this.全局属性.拖拽中 = false;
        this.全局属性.点击坐标 = null;
        this.全局属性.左键按下时间 = null;
        this.全局属性.拖拽时间 = null;
        this.全局属性.当前形状对象 = {
          形状: null,
          坐标: { x: null, y: null },
          尺寸: null,
          描边色: "transparent",
          填充色: "transparent",
        };
        this.清空画布();
        this.绘制基础形状对象组();
        return;
      }
      if (this.全局标志.左键已按下 && !this.键盘状态.Shift && this.全局属性.已选中基础形状 === "圆") {
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
        this.绘制基础形状对象组();
        this.绘制椭圆(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.当前形状对象.尺寸.水平半径,
          this.全局属性.当前形状对象.尺寸.垂直半径,
          this.全局属性.当前形状对象.旋转弧度
        );
        if (this.全局属性.辅助视觉效果) {
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
        this.绘制基础形状对象组();
        this.绘制正多边形(this.全局属性.当前形状对象.顶点坐标组);
        if (this.全局属性.辅助视觉效果) {
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
          this.全局属性.当前形状对象.边数 % 2 === 0
            ? this.全局属性.当前形状对象.起始弧度 + Math.PI - Math.PI / this.全局属性.当前形状对象.边数
            : this.全局属性.当前形状对象.起始弧度 + Math.PI
        );
        this.绘制基础形状对象组();
        this.绘制正多角星(this.全局属性.当前形状对象.外顶点坐标组, this.全局属性.当前形状对象.内顶点坐标组);
        if (this.全局属性.辅助视觉效果) {
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
      this.全局属性.辅助视觉效果 = this.辅助.视觉效果复选框.checked;
    });
  }

  绘制矩形(x, y, 宽, 高) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, 宽, 高);
    this.ctx.strokeStyle = this.全局属性.描边色;
    this.ctx.fillStyle = this.全局属性.填充色;
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
    return {
      坐标: { x: x, y: y },
      尺寸: { 宽: 宽, 高: 高 },
    };
  }

  绘制正圆(x, y, 半径) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, 半径, 0, 2 * Math.PI);
    this.ctx.strokeStyle = this.全局属性.描边色;
    this.ctx.fillStyle = this.全局属性.填充色;
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
    return {
      坐标: { x: x, y: y },
      尺寸: { 半径: 半径 },
    };
  }

  绘制椭圆(x, y, 水平半径, 垂直半径, 旋转弧度) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, 水平半径, 垂直半径, 旋转弧度, 0, 2 * Math.PI);
    this.ctx.strokeStyle = this.全局属性.描边色;
    this.ctx.fillStyle = this.全局属性.填充色;
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
    return {
      坐标: { x: x, y: y },
      尺寸: { 水平半径: 水平半径, 垂直半径: 垂直半径 },
      旋转弧度: 旋转弧度,
    };
  }

  绘制正多边形(顶点坐标组) {
    if (顶点坐标组.length < 3) return;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(顶点坐标组[0].x, 顶点坐标组[0].y);
    for (let i = 1; i < 顶点坐标组.length; i++) {
      this.ctx.lineTo(顶点坐标组[i].x, 顶点坐标组[i].y);
    }
    this.ctx.closePath();
    this.ctx.strokeStyle = this.全局属性.描边色;
    this.ctx.fillStyle = this.全局属性.填充色;
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
    return {
      顶点坐标组: 顶点坐标组,
    };
  }

  绘制正多角星(外顶点坐标组, 内顶点坐标组) {
    if (外顶点坐标组.length < 3 || 内顶点坐标组.length < 3) return;
    const 边数 = 外顶点坐标组.length;
    this.ctx.save();
    this.ctx.beginPath();
    for (let i = 0; i < 边数; i++) {
      const 内索引 = i <= Math.floor(边数 / 2) ? Math.floor(边数 / 2) - i : 边数 - (i - Math.floor(边数 / 2));
      if (i === 0) {
        this.ctx.moveTo(外顶点坐标组[i].x, 外顶点坐标组[i].y);
      } else {
        this.ctx.lineTo(外顶点坐标组[边数 - i].x, 外顶点坐标组[边数 - i].y);
      }
      this.ctx.lineTo(内顶点坐标组[内索引].x, 内顶点坐标组[内索引].y);
    }
    this.ctx.closePath();
    this.ctx.strokeStyle = this.全局属性.描边色;
    this.ctx.fillStyle = this.全局属性.填充色;
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
    return {
      外顶点坐标组: 外顶点坐标组,
      内顶点坐标组: 内顶点坐标组,
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

  绘制基础形状对象组() {
    if (this.数据集.基础形状对象组.length <= 0) return;
    for (const 形状对象 of this.数据集.基础形状对象组) {
      if (形状对象.形状 === "矩形") {
        this.绘制矩形(形状对象.坐标.x, 形状对象.坐标.y, 形状对象.尺寸.宽, 形状对象.尺寸.高);
      } else if (形状对象.形状 === "正圆") {
        this.绘制正圆(形状对象.坐标.x, 形状对象.坐标.y, 形状对象.尺寸.半径);
      } else if (形状对象.形状 === "椭圆") {
        this.绘制椭圆(
          形状对象.坐标.x,
          形状对象.坐标.y,
          形状对象.尺寸.水平半径,
          形状对象.尺寸.垂直半径,
          形状对象.旋转弧度
        );
      } else if (形状对象.形状 === "正多边形") {
        this.绘制正多边形(形状对象.顶点坐标组);
      }
    }
  }
}

new 随心绘();
