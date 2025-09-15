class SpaceWar {
  constructor() {
    this.canvas = document.getElementById("画板");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.css宽度 = this.canvas.offsetWidth;
    this.css高度 = this.canvas.offsetHeight;
    this.canvas.width = this.css宽度 * this.dpr;
    this.canvas.height = this.css高度 * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.中心点 = { x: this.canvas.offsetWidth / 2, y: this.canvas.offsetHeight / 2 };
    this.玩家配置 = {
      坐标: {
        x: this.中心点.x,
        y: this.css高度 - 150,
      },
      尺寸: {
        宽度: this.css宽度 * 0.1,
        高度: null,
      },
      图像路径: "./Images/玩家-1.png",
      图像: null,
      图像宽高比: null,
    };

    this.绘制全部();
  }

  绘制全部() {
    this.绘制玩家();
  }

  绘制玩家() {
    this.玩家配置.图像 = new Image();
    this.玩家配置.图像.src = this.玩家配置.图像路径;
    this.玩家配置.图像.onload = () => {
      this.玩家配置.图像宽高比 = this.玩家配置.图像.naturalWidth / this.玩家配置.图像.naturalHeight;
      this.玩家配置.尺寸.高度 = this.玩家配置.尺寸.宽度 / this.玩家配置.图像宽高比;
      this.ctx.drawImage(
        this.玩家配置.图像,
        this.玩家配置.坐标.x - this.玩家配置.尺寸.宽度 / 2,
        this.玩家配置.坐标.y,
        this.玩家配置.尺寸.宽度,
        this.玩家配置.尺寸.高度
      );
    };
  }
}

const 游戏实例 = new SpaceWar();
