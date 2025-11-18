class 二进制截断 {
  constructor() {
    this.canvas = document.getElementById("canvas-二进制截断");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.画布中心 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
    };

    this.数字组 = [
      {
        数字: 1.65,
        二进制: (1.65).toString(2),
      },
      {
        数字: 4.65,
        二进制: (4.65).toString(2),
      },
    ];

    this.绘制();
  }

  设置字体() {
    this.ctx.font = "18px 'Google Sans Code', 'Consolas', sans-serif";
    this.ctx.fillStyle = "silver";
    this.ctx.textBaseline = "top";
  }

  绘制165() {
    this.ctx.save();
    this.设置字体();
    const 全文本测量宽度 = this.ctx.measureText(this.数字组[0].二进制).width;
    const 单字符宽度 = 全文本测量宽度 / this.数字组[0].二进制.length;
    const 文本坐标 = {
      x: 25,
      y: this.画布中心.y - 75,
    };

    for (let i = 4; i < this.数字组[0].二进制.length; i += 1) {
      const 索引奇偶 = Math.floor((i - 4) / 4) % 2;
      this.ctx.fillStyle = 索引奇偶 === 0 ? "#740" : "darkgreen";
      this.ctx.fillRect(文本坐标.x + i * 单字符宽度, 文本坐标.y - 2, 单字符宽度, 20);
    }

    this.ctx.font = "20px 'Google Sans Code', 'Consolas', sans-serif";
    this.ctx.fillStyle = "lightcyan";
    this.ctx.fillText("1.65 二进制截断", 文本坐标.x, 文本坐标.y - 65);

    this.设置字体();
    this.ctx.fillText(this.数字组[0].二进制, 文本坐标.x, 文本坐标.y);
    this.ctx.fillStyle = "#f346";
    this.ctx.fillRect(文本坐标.x + 全文本测量宽度, 文本坐标.y - 27, 单字符宽度, 20);
    this.ctx.fillStyle = "gray";
    this.ctx.fillText(`${this.数字组[0].二进制}00110011001 ……`, 文本坐标.x, 文本坐标.y - 25);
    this.ctx.restore();
  }

  绘制465() {
    this.ctx.save();
    this.设置字体();
    const 全文本测量宽度 = this.ctx.measureText(this.数字组[1].二进制).width;
    const 单字符宽度 = 全文本测量宽度 / this.数字组[1].二进制.length;
    const 文本坐标 = {
      x: 25,
      y: this.画布中心.y + 75,
    };

    for (let i = 6; i < this.数字组[1].二进制.length; i += 1) {
      const 索引奇偶 = Math.floor((i - 6) / 4) % 2;
      this.ctx.fillStyle = 索引奇偶 === 0 ? "#740" : "darkgreen";
      this.ctx.fillRect(文本坐标.x + i * 单字符宽度, 文本坐标.y - 2, 单字符宽度, 20);
    }

    this.ctx.font = "20px 'Google Sans Code', 'Consolas', sans-serif";
    this.ctx.fillStyle = "lightcyan";
    this.ctx.fillText("4.65 二进制截断", 文本坐标.x, 文本坐标.y - 65);

    this.设置字体();
    this.ctx.fillText(this.数字组[1].二进制, 文本坐标.x, 文本坐标.y);
    this.ctx.fillStyle = "#f346";
    this.ctx.fillRect(文本坐标.x + 全文本测量宽度, 文本坐标.y - 27, 单字符宽度, 20);
    this.ctx.fillStyle = "gray";
    this.ctx.fillText(`${this.数字组[1].二进制.slice(0, -1)}01100110011001 ……`, 文本坐标.x, 文本坐标.y - 25);
    this.ctx.restore();
  }

  绘制() {
    this.绘制165();
    this.绘制465();
    this.绘制截断线();
  }

  绘制截断线() {
    this.ctx.save();
    this.设置字体();
    const 全文本测量宽度 = this.ctx.measureText(this.数字组[1].二进制).width;
    const 截断线起点 = {
      x: 25 + 全文本测量宽度,
      y: this.画布中心.y - 150,
    };

    this.ctx.moveTo(截断线起点.x, 截断线起点.y);
    this.ctx.lineTo(截断线起点.x, this.画布中心.y + 150);
    this.ctx.strokeStyle = "#4af7";
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    this.ctx.restore();
  }
}

new 二进制截断();
