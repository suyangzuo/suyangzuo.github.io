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

    this.已选中基础形状 = null;
    this.填充色 = "transparent";
    this.描边色 = "transparent";
    this.当前描边宽度 = 2;

    this.左键已按下 = false;
    this.拖拽中 = false;
    this.鼠标坐标 = null;
    this.点击坐标 = null;
    this.左键按下时间 = null;
    this.拖拽时间 = null;
    this.鼠标与点击坐标位置关系 = {
      上: null,
      左: null,
    };
    this.当前形状对象 = {
      形状: "矩形",
      坐标: { x: 0, y: 0 },
      尺寸: { 宽: 0, 高: 0 },
      描边色: "transparent",
      填充色: "transparent",
    };
    this.基础形状对象组 = [];

    this.添加canvas鼠标移动事件();
    this.添加canvas点击事件();
    this.添加canvas鼠标抬起事件();
    this.添加基础形状分区点击事件();
  }

  添加基础形状分区点击事件() {
    for (const 基础形状分区 of this.基础形状分区组) {
      基础形状分区.addEventListener("click", () => {
        this.已选中基础形状 = 基础形状分区.getAttribute("形状");
      });
    }
  }

  添加canvas鼠标移动事件() {
    this.canvas.addEventListener("mousemove", (e) => {
      this.鼠标坐标 = this.获取鼠标坐标(e);
      if (!this.左键已按下) return;
      this.清空画布();
      this.判断鼠标与点击坐标位置关系();
      if (this.已选中基础形状 === "矩形") {
        this.当前形状对象.形状 = "矩形";
        this.当前形状对象.描边色 = this.描边色;
        this.当前形状对象.填充色 = this.填充色;
        if (this.鼠标与点击坐标位置关系.左 && this.鼠标与点击坐标位置关系.上) {
          this.当前形状对象.坐标 = { x: this.鼠标坐标.x, y: this.鼠标坐标.y };
          this.当前形状对象.尺寸 = { 宽: this.点击坐标.x - this.鼠标坐标.x, 高: this.点击坐标.y - this.鼠标坐标.y };
        } else if (this.鼠标与点击坐标位置关系.左 && !this.鼠标与点击坐标位置关系.上) {
          this.当前形状对象.坐标 = { x: this.鼠标坐标.x, y: this.点击坐标.y };
          this.当前形状对象.尺寸 = { 宽: this.点击坐标.x - this.鼠标坐标.x, 高: this.鼠标坐标.y - this.点击坐标.y };
        } else if (!this.鼠标与点击坐标位置关系.左 && this.鼠标与点击坐标位置关系.上) {
          this.当前形状对象.坐标 = { x: this.点击坐标.x, y: this.鼠标坐标.y };
          this.当前形状对象.尺寸 = { 宽: this.鼠标坐标.x - this.点击坐标.x, 高: this.点击坐标.y - this.鼠标坐标.y };
        } else if (!this.鼠标与点击坐标位置关系.左 && !this.鼠标与点击坐标位置关系.上) {
          this.当前形状对象.坐标 = { x: this.点击坐标.x, y: this.点击坐标.y };
          this.当前形状对象.尺寸 = { 宽: this.鼠标坐标.x - this.点击坐标.x, 高: this.鼠标坐标.y - this.点击坐标.y };
        }
      }
      this.描边色 = "#aaa";
      this.描边矩形(
        this.当前形状对象.坐标.x,
        this.当前形状对象.坐标.y,
        this.当前形状对象.尺寸.宽,
        this.当前形状对象.尺寸.高
      );
      this.绘制基础形状对象组();
    });
  }

  添加canvas点击事件() {
    this.canvas.addEventListener("mousedown", () => {
      this.左键已按下 = true;
      this.点击坐标 = this.鼠标坐标;
    });
  }

  添加canvas鼠标抬起事件() {
    this.canvas.addEventListener("mouseup", () => {
      this.左键已按下 = false;
      this.拖拽中 = false;
      this.点击坐标 = null;
      this.左键按下时间 = null;
      this.拖拽时间 = null;
      if (this.已选中基础形状) {
        this.基础形状对象组.push(structuredClone(this.当前形状对象));
      }
      console.log(this.基础形状对象组);
    });
  }

  判断鼠标与点击坐标位置关系() {
    if (this.鼠标坐标.x === this.点击坐标.x) {
      this.鼠标与点击坐标位置关系.左 = null;
    } else {
      this.鼠标与点击坐标位置关系.左 = this.鼠标坐标.x < this.点击坐标.x;
    }
    if (this.鼠标坐标.y === this.点击坐标.y) {
      this.鼠标与点击坐标位置关系.上 = null;
    } else {
      this.鼠标与点击坐标位置关系.上 = this.鼠标坐标.y < this.点击坐标.y;
    }
  }

  获取鼠标坐标(e) {
    return {
      x: e.clientX - this.画布边界矩形.left,
      y: e.clientY - this.画布边界矩形.top,
    };
  }

  描边矩形(x, y, 宽, 高) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, 宽, 高);
    this.ctx.strokeStyle = this.描边色;
    this.ctx.lineWidth = this.当前描边宽度;
    this.ctx.stroke();
    this.ctx.restore();
  }

  描边正圆(x, y, 半径) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, 半径, 0, 2 * Math.PI);
    this.ctx.strokeStyle = this.描边色;
    this.ctx.stroke();
    this.ctx.restore();
    return {
      坐标: { x: x, y: y },
      半径: 半径,
    };
  }

  填充正圆(x, y, 半径) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, 半径, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.填充色;
    this.ctx.fill();
    this.ctx.restore();
    return {
      坐标: { x: x, y: y },
      半径: 半径,
    };
  }

  清空画布() {
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
  }

  绘制基础形状对象组() {
    for (const 形状对象 of this.基础形状对象组) {
      if (形状对象.形状 === "矩形") {
        this.描边矩形(形状对象.坐标.x, 形状对象.坐标.y, 形状对象.尺寸.宽, 形状对象.尺寸.高);
      } else if (形状对象.形状 === "圆") {
        this.描边正圆(形状对象.坐标.x, 形状对象.坐标.y, 形状对象.尺寸.半径);
      }
    }
  }
}

new 随心绘();
