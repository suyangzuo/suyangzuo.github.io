class 矩形鼠标位置关系演示器 {
  constructor() {
    this.canvas = document.getElementById("矩形鼠标位置关系");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.画布中心 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
    };
    this.演示矩形 = {
      宽度: 250,
      高度: 150,
      坐标: {
        x: this.画布中心.x - 250 / 2,
        y: this.画布中心.y - 150 / 2,
      },
    };
    this.鼠标在演示矩形内部 = false;
    this.绘制全部();
    this.添加鼠标事件();
  }

  渲染Canvas背景() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(35, 35, 35, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  绘制矩形(矩形) {
    this.ctx.save();
    this.ctx.fillStyle = this.鼠标在演示矩形内部 ? "#fff3" : "#fff2";
    this.ctx.fillRect(矩形.坐标.x, 矩形.坐标.y, 矩形.宽度, 矩形.高度);
    this.ctx.restore();
  }

  绘制文本() {
    this.ctx.save();
    this.ctx.font = "20px sans-serif";
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "center";
    if (this.鼠标在演示矩形内部) {
      this.ctx.fillStyle = "lightgreen";
      this.ctx.fillText("鼠标在矩形内部", this.画布中心.x, this.画布中心.y);
    } else {
      this.ctx.fillStyle = "gold";
      this.ctx.fillText("鼠标在矩形外侧", this.画布中心.x, this.画布中心.y);
    }
    this.ctx.restore();
  }

  绘制全部() {
    this.渲染Canvas背景();
    this.绘制矩形(this.演示矩形);
    this.绘制文本();
  }

  鼠标位于矩形内部(鼠标相对坐标, 矩形) {
    return (
      鼠标相对坐标.x >= 矩形.坐标.x &&
      鼠标相对坐标.x <= 矩形.坐标.x + 矩形.宽度 &&
      鼠标相对坐标.y >= 矩形.坐标.y &&
      鼠标相对坐标.y <= 矩形.坐标.y + 矩形.高度
    );
  }

  获取鼠标相对坐标(e) {
    const 鼠标视口坐标 = {
      x: e.clientX,
      y: e.clientY,
    };

    const 边界矩形 = this.canvas.getBoundingClientRect();

    return {
      x: Math.round(鼠标视口坐标.x - 边界矩形.left),
      y: Math.round(鼠标视口坐标.y - 边界矩形.top),
    };
  }

  添加鼠标事件() {
    this.canvas.addEventListener("mousemove", (e) => {
      const 鼠标相对坐标 = this.获取鼠标相对坐标(e);
      this.鼠标在演示矩形内部 = this.鼠标位于矩形内部(鼠标相对坐标, this.演示矩形);
      this.绘制全部();
    });
  }
}

new 矩形鼠标位置关系演示器();

class 正圆鼠标位置关系演示器 {
  constructor() {
    this.canvas = document.getElementById("正圆鼠标位置关系");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.画布中心 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
    };
    this.演示正圆 = {
      半径: 150,
      圆心: {
        x: this.画布中心.x,
        y: this.画布中心.y,
      },
    };
    this.鼠标在演示正圆内部 = false;
    this.绘制全部();
    this.添加鼠标事件();
  }

  渲染Canvas背景() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(35, 35, 35, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  绘制正圆(正圆) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(正圆.圆心.x, 正圆.圆心.y, 正圆.半径, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.鼠标在演示正圆内部 ? "#fff3" : "#fff2";
    this.ctx.fill();
    this.ctx.restore();
  }

  绘制文本() {
    this.ctx.save();
    this.ctx.font = "20px sans-serif";
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "center";
    if (this.鼠标在演示正圆内部) {
      this.ctx.fillStyle = "lightgreen";
      this.ctx.fillText("鼠标在正圆内部", this.画布中心.x, this.画布中心.y);
    } else {
      this.ctx.fillStyle = "gold";
      this.ctx.fillText("鼠标在正圆外侧", this.画布中心.x, this.画布中心.y);
    }
    this.ctx.restore();
  }

  绘制全部() {
    this.渲染Canvas背景();
    this.绘制正圆(this.演示正圆);
    this.绘制文本();
  }

  鼠标位于正圆内部(鼠标相对坐标, 正圆) {
    const 距离平方 = Math.pow(鼠标相对坐标.x - 正圆.圆心.x, 2) + Math.pow(鼠标相对坐标.y - 正圆.圆心.y, 2);
    return 距离平方 <= Math.pow(正圆.半径, 2);
  }

  获取鼠标相对坐标(e) {
    const 鼠标视口坐标 = {
      x: e.clientX,
      y: e.clientY,
    };

    const 边界矩形 = this.canvas.getBoundingClientRect();

    return {
      x: Math.round(鼠标视口坐标.x - 边界矩形.left),
      y: Math.round(鼠标视口坐标.y - 边界矩形.top),
    };
  }

  添加鼠标事件() {
    this.canvas.addEventListener("mousemove", (e) => {
      const 鼠标相对坐标 = this.获取鼠标相对坐标(e);
      this.鼠标在演示正圆内部 = this.鼠标位于正圆内部(鼠标相对坐标, this.演示正圆);
      this.绘制全部();
    });
  }
}

new 正圆鼠标位置关系演示器();

class 椭圆鼠标位置关系演示器 {
  constructor() {
    this.canvas = document.getElementById("椭圆鼠标位置关系");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.画布中心 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
    };
    this.演示椭圆 = {
      横向半径: 200,
      纵向半径: 150,
      圆心: {
        x: this.画布中心.x,
        y: this.画布中心.y,
      },
    };
    this.鼠标在演示椭圆内部 = false;
    this.绘制全部();
    this.添加鼠标事件();
  }

  渲染Canvas背景() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(35, 35, 35, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  绘制椭圆(椭圆) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(椭圆.圆心.x, 椭圆.圆心.y, 椭圆.横向半径, 椭圆.纵向半径, 0, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.鼠标在演示椭圆内部 ? "#fff3" : "#fff2";
    this.ctx.fill();
    this.ctx.restore();
  }

  绘制文本() {
    this.ctx.save();
    this.ctx.font = "20px sans-serif";
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "center";
    if (this.鼠标在演示椭圆内部) {
      this.ctx.fillStyle = "lightgreen";
      this.ctx.fillText("鼠标在椭圆内部", this.画布中心.x, this.画布中心.y);
    } else {
      this.ctx.fillStyle = "gold";
      this.ctx.fillText("鼠标在椭圆外侧", this.画布中心.x, this.画布中心.y);
    }
    this.ctx.restore();
  }

  绘制全部() {
    this.渲染Canvas背景();
    this.绘制椭圆(this.演示椭圆);
    this.绘制文本();
  }

  鼠标位于椭圆内部(鼠标相对坐标, 椭圆) {
    const 鼠标与圆心水平距离 = 鼠标相对坐标.x - 椭圆.圆心.x;
    const 鼠标与圆心垂直距离 = 鼠标相对坐标.y - 椭圆.圆心.y;

    const 椭圆方程值 =
      Math.pow(鼠标与圆心水平距离, 2) / Math.pow(椭圆.横向半径, 2) +
      Math.pow(鼠标与圆心垂直距离, 2) / Math.pow(椭圆.纵向半径, 2);

    return 椭圆方程值 <= 1;
  }

  获取鼠标相对坐标(e) {
    const 鼠标视口坐标 = {
      x: e.clientX,
      y: e.clientY,
    };

    const 边界矩形 = this.canvas.getBoundingClientRect();

    return {
      x: Math.round(鼠标视口坐标.x - 边界矩形.left),
      y: Math.round(鼠标视口坐标.y - 边界矩形.top),
    };
  }

  添加鼠标事件() {
    this.canvas.addEventListener("mousemove", (e) => {
      const 鼠标相对坐标 = this.获取鼠标相对坐标(e);
      this.鼠标在演示椭圆内部 = this.鼠标位于椭圆内部(鼠标相对坐标, this.演示椭圆);
      this.绘制全部();
    });
  }
}

new 椭圆鼠标位置关系演示器();

class 多边形鼠标位置关系演示器 {
  constructor() {
    this.canvas = document.getElementById("多边形鼠标位置关系");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.画布中心 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
    };
    this.演示多边形 = {
      顶点数组: [
        { x: this.画布中心.x - 100, y: this.画布中心.y - 80 },
        { x: this.画布中心.x + 120, y: this.画布中心.y - 60 },
        { x: this.画布中心.x + 80, y: this.画布中心.y + 100 },
        { x: this.画布中心.x - 60, y: this.画布中心.y + 120 },
        { x: this.画布中心.x - 120, y: this.画布中心.y + 20 },
      ],
    };
    this.演示多边形路径 = new Path2D();
    this.鼠标在演示多边形内部 = false;
    this.绘制全部();
    this.添加鼠标事件();
  }

  渲染Canvas背景() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(35, 35, 35, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  绘制多边形(多边形) {
    this.ctx.save();
    this.演示多边形路径 = new Path2D();
    this.演示多边形路径.moveTo(多边形.顶点数组[0].x, 多边形.顶点数组[0].y);

    for (let i = 1; i < 多边形.顶点数组.length; i++) {
      this.演示多边形路径.lineTo(多边形.顶点数组[i].x, 多边形.顶点数组[i].y);
    }

    this.演示多边形路径.closePath();

    this.ctx.fillStyle = this.鼠标在演示多边形内部 ? "#fff3" : "#fff2";
    this.ctx.fill(this.演示多边形路径);
    this.ctx.restore();
  }

  绘制文本() {
    this.ctx.save();
    this.ctx.font = "20px sans-serif";
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "center";
    if (this.鼠标在演示多边形内部) {
      this.ctx.fillStyle = "lightgreen";
      this.ctx.fillText("鼠标在多边形内部", this.画布中心.x, this.画布中心.y);
    } else {
      this.ctx.fillStyle = "gold";
      this.ctx.fillText("鼠标在多边形外侧", this.画布中心.x, this.画布中心.y);
    }
    this.ctx.restore();
  }

  绘制全部() {
    this.渲染Canvas背景();
    this.绘制多边形(this.演示多边形);
    this.绘制文本();
  }

  鼠标位于多边形内部(鼠标相对坐标, 多边形路径对象) {
    return this.ctx.isPointInPath(多边形路径对象, 鼠标相对坐标.x * this.dpr, 鼠标相对坐标.y * this.dpr);
  }

  获取鼠标相对坐标(e) {
    const 鼠标视口坐标 = {
      x: e.clientX,
      y: e.clientY,
    };

    const 边界矩形 = this.canvas.getBoundingClientRect();

    return {
      x: Math.round(鼠标视口坐标.x - 边界矩形.left),
      y: Math.round(鼠标视口坐标.y - 边界矩形.top),
    };
  }

  添加鼠标事件() {
    this.canvas.addEventListener("mousemove", (e) => {
      const 鼠标相对坐标 = this.获取鼠标相对坐标(e);
      this.鼠标在演示多边形内部 = this.鼠标位于多边形内部(鼠标相对坐标, this.演示多边形路径);
      this.绘制全部();
    });
  }
}

new 多边形鼠标位置关系演示器();

class 拖放图形演示器 {
  constructor() {
    this.canvas = document.getElementById("拖放图形");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.矩形 = {
      路径: new Path2D(),
      参数: {
        左上角: { x: 100, y: (this.canvas.offsetHeight - 200) / 2 },
        宽度: 150,
        高度: 200,
        鼠标差值: { x: 0, y: 0 },
      },
      鼠标位于内部: false,
      拖拽中: false,
    };
    this.正圆 = {
      路径: new Path2D(),
      参数: {
        圆心: { x: this.canvas.offsetWidth - 200, y: this.canvas.offsetHeight / 2 },
        半径: 100,
        鼠标差值: { x: 0, y: 0 },
      },
      鼠标位于内部: false,
      拖拽中: false,
    };
    this.矩形.路径.rect(this.矩形.参数.左上角.x, this.矩形.参数.左上角.y, this.矩形.参数.宽度, this.矩形.参数.高度);
    this.正圆.路径.arc(this.正圆.参数.圆心.x, this.正圆.参数.圆心.y, this.正圆.参数.半径, 0, 2 * Math.PI);

    this.绘制全部();
    this.添加鼠标移动事件();
    this.添加鼠标按下事件();
    this.添加鼠标抬起事件();
  }

  刷新矩形坐标与路径(矩形, 鼠标相对坐标) {
    矩形.参数.左上角.x = 鼠标相对坐标.x - 矩形.参数.鼠标差值.x;
    矩形.参数.左上角.y = 鼠标相对坐标.y - 矩形.参数.鼠标差值.y;

    矩形.路径 = new Path2D();
    矩形.路径.rect(矩形.参数.左上角.x, 矩形.参数.左上角.y, 矩形.参数.宽度, 矩形.参数.高度);
  }

  刷新正圆坐标与路径(正圆, 鼠标相对坐标) {
    正圆.参数.圆心.x = 鼠标相对坐标.x - 正圆.参数.鼠标差值.x;
    正圆.参数.圆心.y = 鼠标相对坐标.y - 正圆.参数.鼠标差值.y;

    正圆.路径 = new Path2D();
    正圆.路径.arc(正圆.参数.圆心.x, 正圆.参数.圆心.y, 正圆.参数.半径, 0, 2 * Math.PI);
  }

  刷新鼠标与矩形差值(鼠标相对坐标) {
    const 矩形左上角 = this.矩形.参数.左上角;
    this.矩形.参数.鼠标差值.x = 鼠标相对坐标.x - 矩形左上角.x;
    this.矩形.参数.鼠标差值.y = 鼠标相对坐标.y - 矩形左上角.y;
  }

  刷新鼠标与正圆差值(鼠标相对坐标) {
    const 圆心 = this.正圆.参数.圆心;
    this.正圆.参数.鼠标差值.x = 鼠标相对坐标.x - 圆心.x;
    this.正圆.参数.鼠标差值.y = 鼠标相对坐标.y - 圆心.y;
  }

  获取鼠标与Canvas相对坐标(e) {
    const 鼠标视口坐标 = {
      x: e.clientX,
      y: e.clientY,
    };

    const 边界矩形 = this.canvas.getBoundingClientRect();

    return {
      x: Math.round(鼠标视口坐标.x - 边界矩形.left),
      y: Math.round(鼠标视口坐标.y - 边界矩形.top),
    };
  }

  绘制提示文本() {
    this.ctx.save();
    this.ctx.font = "20px sans-serif";
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "right";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("请尝试拖放图形", this.canvas.offsetWidth - 25, 25);
    this.ctx.restore();
  }

  绘制矩形(矩形) {
    this.ctx.save();
    if (this.矩形.鼠标位于内部 && 矩形.拖拽中) {
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#adff2f30";
      this.ctx.fillStyle = "#fa51";
    } else if (this.矩形.鼠标位于内部) {
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "greenyellow";
      this.ctx.fillStyle = "#fa55";
    } else {
      this.ctx.lineWidth = 0;
      this.ctx.strokeStyle = "transparent";
      this.ctx.fillStyle = "#fa5";
    }
    this.ctx.stroke(矩形.路径);
    this.ctx.fill(矩形.路径);

    if (this.矩形.鼠标位于内部 && 矩形.拖拽中) {
      this.ctx.beginPath();
      this.ctx.arc(矩形.参数.左上角.x, 矩形.参数.左上角.y, 6, 0, 2 * Math.PI);
      this.ctx.fillStyle = "lightseagreen";
      this.ctx.fill();
      this.ctx.closePath();
    }

    this.ctx.restore();
  }

  绘制正圆(正圆) {
    this.ctx.save();
    if (this.正圆.鼠标位于内部 && 正圆.拖拽中) {
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#ffd70030";
      this.ctx.fillStyle = "#5af1";
    } else if (this.正圆.鼠标位于内部) {
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "gold";
      this.ctx.fillStyle = "#5af5";
    } else {
      this.ctx.lineWidth = 0;
      this.ctx.strokeStyle = "transparent";
      this.ctx.fillStyle = "#5af";
    }
    this.ctx.stroke(正圆.路径);
    this.ctx.fill(正圆.路径);

    // 绘制圆之后，再绘制圆心
    if (this.正圆.鼠标位于内部 && 正圆.拖拽中) {
      this.ctx.beginPath();
      this.ctx.arc(正圆.参数.圆心.x, 正圆.参数.圆心.y, 6, 0, 2 * Math.PI);
      this.ctx.fillStyle = "yellowgreen";
      this.ctx.fill();
      this.ctx.closePath();
    }

    this.ctx.restore();
  }

  绘制全部() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.绘制矩形(this.矩形);
    this.绘制正圆(this.正圆);
    this.绘制提示文本();
    this.ctx.restore();
  }

  鼠标位于矩形内部(鼠标相对坐标, 矩形) {
    return (
      鼠标相对坐标.x >= 矩形.参数.左上角.x &&
      鼠标相对坐标.x <= 矩形.参数.左上角.x + 矩形.参数.宽度 &&
      鼠标相对坐标.y >= 矩形.参数.左上角.y &&
      鼠标相对坐标.y <= 矩形.参数.左上角.y + 矩形.参数.高度
    );
  }

  鼠标位于正圆内部(鼠标相对坐标, 正圆) {
    const 距离平方 = Math.pow(鼠标相对坐标.x - 正圆.参数.圆心.x, 2) + Math.pow(鼠标相对坐标.y - 正圆.参数.圆心.y, 2);
    return 距离平方 <= Math.pow(正圆.参数.半径, 2);
  }

  添加鼠标移动事件() {
    this.canvas.onmousemove = (e) => {
      const 鼠标相对坐标 = this.获取鼠标与Canvas相对坐标(e);
      this.正圆.鼠标位于内部 = this.鼠标位于正圆内部(鼠标相对坐标, this.正圆);
      this.矩形.鼠标位于内部 = this.鼠标位于矩形内部(鼠标相对坐标, this.矩形);

      if (this.正圆.拖拽中 && this.正圆.鼠标位于内部) {
        this.刷新正圆坐标与路径(this.正圆, 鼠标相对坐标);
      } else if (this.矩形.拖拽中 && this.矩形.鼠标位于内部) {
        this.刷新矩形坐标与路径(this.矩形, 鼠标相对坐标);
      }

      this.绘制全部();
    };
  }

  添加鼠标按下事件() {
    this.canvas.onmousedown = (e) => {
      const 鼠标相对坐标 = this.获取鼠标与Canvas相对坐标(e);
      this.正圆.鼠标位于内部 = this.鼠标位于正圆内部(鼠标相对坐标, this.正圆);
      this.矩形.鼠标位于内部 = this.鼠标位于矩形内部(鼠标相对坐标, this.矩形);

      if (this.正圆.鼠标位于内部) {
        this.正圆.拖拽中 = true;
        this.刷新鼠标与正圆差值(鼠标相对坐标);
      } else if (this.矩形.鼠标位于内部) {
        this.矩形.拖拽中 = true;
        this.刷新鼠标与矩形差值(鼠标相对坐标);
      }
    };
  }

  添加鼠标抬起事件() {
    this.canvas.onmouseup = () => {
      this.矩形.拖拽中 = false;
      this.正圆.拖拽中 = false;
      this.绘制全部();
    };
  }
}

new 拖放图形演示器();

class 图形重叠演示器 {
  constructor() {
    this.canvas = document.getElementById("图形重叠");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.画布中心 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
    };

    // 定义三个图形，让它们彼此重叠
    this.矩形 = {
      路径: new Path2D(),
      参数: {
        左上角: { x: this.画布中心.x - 180, y: this.画布中心.y - 120 },
        宽度: 300,
        高度: 180,
      },
      鼠标位于内部: false,
      颜色: "#c54b6b", // 红色
      正在拖拽: false,
      拖拽偏移: { x: 0, y: 0 },
    };

    this.正圆 = {
      路径: new Path2D(),
      参数: {
        圆心: { x: this.画布中心.x + 60, y: this.画布中心.y - 40 },
        半径: 120,
      },
      鼠标位于内部: false,
      颜色: "#edd700", // 青色
      正在拖拽: false,
      拖拽偏移: { x: 0, y: 0 },
    };

    this.五边形 = {
      路径: new Path2D(),
      参数: {
        圆心: { x: this.画布中心.x, y: this.画布中心.y + (40 / 3) * 4 },
        半径: 120,
      },
      鼠标位于内部: false,
      颜色: "#4587d1", // 蓝色
      正在拖拽: false,
      拖拽偏移: { x: 0, y: 0 },
    };

    // 拖拽状态
    this.拖拽状态 = {
      正在拖拽: false,
      拖拽开始位置: { x: 0, y: 0 },
    };

    // 构建路径
    this.构建矩形路径();
    this.构建正圆路径();
    this.构建五边形路径();

    this.绘制全部();
    this.添加鼠标事件();
  }

  构建矩形路径() {
    this.矩形.路径 = new Path2D();
    this.矩形.路径.rect(this.矩形.参数.左上角.x, this.矩形.参数.左上角.y, this.矩形.参数.宽度, this.矩形.参数.高度);
  }

  构建正圆路径() {
    this.正圆.路径 = new Path2D();
    this.正圆.路径.arc(this.正圆.参数.圆心.x, this.正圆.参数.圆心.y, this.正圆.参数.半径, 0, 2 * Math.PI);
  }

  构建五边形路径() {
    this.五边形.路径 = new Path2D();

    // 正五边形的顶点计算
    const 圆心 = this.五边形.参数.圆心;
    const 半径 = this.五边形.参数.半径;
    const 顶点数量 = 5;

    // 从顶部开始，顺时针绘制正五边形
    for (let i = 0; i < 顶点数量; i++) {
      const 角度 = (i * 2 * Math.PI) / 顶点数量 - Math.PI / 2; // 从顶部开始
      const x = 圆心.x + 半径 * Math.cos(角度);
      const y = 圆心.y + 半径 * Math.sin(角度);

      if (i === 0) {
        this.五边形.路径.moveTo(x, y);
      } else {
        this.五边形.路径.lineTo(x, y);
      }
    }

    this.五边形.路径.closePath();
  }

  渲染Canvas背景() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(35, 35, 35, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  绘制矩形() {
    this.ctx.save();

    // 根据鼠标位置和拖拽状态决定填充色透明度
    if (this.矩形.正在拖拽) {
      this.ctx.fillStyle = this.矩形.颜色 + "50"; // 拖拽时半透明
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = "#00ff00"; // 拖拽时绿色边框
    } else if (this.矩形.鼠标位于内部) {
      this.ctx.fillStyle = this.矩形.颜色 + "a0"; // 悬停时半透明
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#ffffff";
    } else {
      this.ctx.fillStyle = this.矩形.颜色;
      this.ctx.lineWidth = 0;
      this.ctx.strokeStyle = "transparent";
    }

    this.ctx.fill(this.矩形.路径);
    this.ctx.stroke(this.矩形.路径);

    this.ctx.restore();
  }

  绘制正圆() {
    this.ctx.save();

    // 根据鼠标位置和拖拽状态决定填充色透明度
    if (this.正圆.正在拖拽) {
      this.ctx.fillStyle = this.正圆.颜色 + "50"; // 拖拽时半透明
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = "#00ff00"; // 拖拽时绿色边框
    } else if (this.正圆.鼠标位于内部) {
      this.ctx.fillStyle = this.正圆.颜色 + "a0"; // 悬停时半透明
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#ffffff";
    } else {
      this.ctx.fillStyle = this.正圆.颜色;
      this.ctx.lineWidth = 0;
      this.ctx.strokeStyle = "transparent";
    }

    this.ctx.fill(this.正圆.路径);
    this.ctx.stroke(this.正圆.路径);

    this.ctx.restore();
  }

  绘制五边形() {
    this.ctx.save();

    // 根据鼠标位置和拖拽状态决定填充色透明度
    if (this.五边形.正在拖拽) {
      this.ctx.fillStyle = this.五边形.颜色 + "50"; // 拖拽时半透明
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = "#00ff00"; // 拖拽时绿色边框
    } else if (this.五边形.鼠标位于内部) {
      this.ctx.fillStyle = this.五边形.颜色 + "a0"; // 悬停时半透明
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#ffffff";
    } else {
      this.ctx.fillStyle = this.五边形.颜色;
      this.ctx.lineWidth = 0;
      this.ctx.strokeStyle = "transparent";
    }

    this.ctx.fill(this.五边形.路径);
    this.ctx.stroke(this.五边形.路径);

    this.ctx.restore();
  }

  绘制全部() {
    this.渲染Canvas背景();
    // 按顺序绘制，后面的会覆盖前面的
    this.绘制矩形();
    this.绘制正圆();
    this.绘制五边形();
  }

  鼠标位于矩形内部(鼠标相对坐标) {
    return (
      鼠标相对坐标.x >= this.矩形.参数.左上角.x &&
      鼠标相对坐标.x <= this.矩形.参数.左上角.x + this.矩形.参数.宽度 &&
      鼠标相对坐标.y >= this.矩形.参数.左上角.y &&
      鼠标相对坐标.y <= this.矩形.参数.左上角.y + this.矩形.参数.高度
    );
  }

  鼠标位于正圆内部(鼠标相对坐标) {
    const 距离平方 =
      Math.pow(鼠标相对坐标.x - this.正圆.参数.圆心.x, 2) + Math.pow(鼠标相对坐标.y - this.正圆.参数.圆心.y, 2);
    return 距离平方 <= Math.pow(this.正圆.参数.半径, 2);
  }

  鼠标位于五边形内部(鼠标相对坐标) {
    return this.ctx.isPointInPath(this.五边形.路径, 鼠标相对坐标.x * this.dpr, 鼠标相对坐标.y * this.dpr);
  }

  获取鼠标相对坐标(e) {
    const 鼠标视口坐标 = {
      x: e.clientX,
      y: e.clientY,
    };

    const 边界矩形 = this.canvas.getBoundingClientRect();

    return {
      x: Math.round(鼠标视口坐标.x - 边界矩形.left),
      y: Math.round(鼠标视口坐标.y - 边界矩形.top),
    };
  }

  添加鼠标事件() {
    // 鼠标移动事件
    this.canvas.addEventListener("mousemove", (e) => {
      const 鼠标相对坐标 = this.获取鼠标相对坐标(e);

      if (this.拖拽状态.正在拖拽) {
        // 正在拖拽时，更新所有被拖拽的图形位置
        this.更新拖拽图形位置(鼠标相对坐标);
      }

      // 检测鼠标是否在各个图形内部（拖拽时也要检测，用于视觉反馈）
      this.矩形.鼠标位于内部 = this.鼠标位于矩形内部(鼠标相对坐标);
      this.正圆.鼠标位于内部 = this.鼠标位于正圆内部(鼠标相对坐标);
      this.五边形.鼠标位于内部 = this.鼠标位于五边形内部(鼠标相对坐标);

      // 重新绘制
      this.绘制全部();
    });

    // 鼠标按下事件
    this.canvas.addEventListener("mousedown", (e) => {
      const 鼠标相对坐标 = this.获取鼠标相对坐标(e);
      this.开始拖拽(鼠标相对坐标);
    });

    // 鼠标松开事件
    this.canvas.addEventListener("mouseup", (e) => {
      this.结束拖拽();
      this.绘制全部();
    });

    // 鼠标离开画布事件
    this.canvas.addEventListener("mouseleave", (e) => {
      this.结束拖拽();
    });
  }

  开始拖拽(鼠标相对坐标) {
    // 检测所有被点击的图形，允许多个图形同时拖拽
    if (this.鼠标位于五边形内部(鼠标相对坐标)) {
      this.拖拽状态.正在拖拽 = true;
      this.拖拽状态.拖拽开始位置 = { ...鼠标相对坐标 };
      this.五边形.拖拽偏移 = {
        x: 鼠标相对坐标.x - this.五边形.参数.圆心.x,
        y: 鼠标相对坐标.y - this.五边形.参数.圆心.y,
      };
      this.五边形.正在拖拽 = true;
    }

    if (this.鼠标位于正圆内部(鼠标相对坐标)) {
      this.拖拽状态.正在拖拽 = true;
      this.拖拽状态.拖拽开始位置 = { ...鼠标相对坐标 };
      this.正圆.拖拽偏移 = {
        x: 鼠标相对坐标.x - this.正圆.参数.圆心.x,
        y: 鼠标相对坐标.y - this.正圆.参数.圆心.y,
      };
      this.正圆.正在拖拽 = true;
    }

    if (this.鼠标位于矩形内部(鼠标相对坐标)) {
      this.拖拽状态.正在拖拽 = true;
      this.拖拽状态.拖拽开始位置 = { ...鼠标相对坐标 };
      this.矩形.拖拽偏移 = {
        x: 鼠标相对坐标.x - this.矩形.参数.左上角.x,
        y: 鼠标相对坐标.y - this.矩形.参数.左上角.y,
      };
      this.矩形.正在拖拽 = true;
    }
  }

  更新拖拽图形位置(鼠标相对坐标) {
    // 更新所有正在拖拽的图形位置
    if (this.五边形.正在拖拽) {
      // 更新五边形圆心位置
      this.五边形.参数.圆心.x = 鼠标相对坐标.x - this.五边形.拖拽偏移.x;
      this.五边形.参数.圆心.y = 鼠标相对坐标.y - this.五边形.拖拽偏移.y;
      this.构建五边形路径();
    }

    if (this.正圆.正在拖拽) {
      // 更新正圆圆心位置
      this.正圆.参数.圆心.x = 鼠标相对坐标.x - this.正圆.拖拽偏移.x;
      this.正圆.参数.圆心.y = 鼠标相对坐标.y - this.正圆.拖拽偏移.y;
      this.构建正圆路径();
    }

    if (this.矩形.正在拖拽) {
      // 更新矩形左上角位置
      this.矩形.参数.左上角.x = 鼠标相对坐标.x - this.矩形.拖拽偏移.x;
      this.矩形.参数.左上角.y = 鼠标相对坐标.y - this.矩形.拖拽偏移.y;
      this.构建矩形路径();
    }
  }

  结束拖拽() {
    // 结束所有图形的拖拽状态
    this.五边形.正在拖拽 = false;
    this.正圆.正在拖拽 = false;
    this.矩形.正在拖拽 = false;
    this.拖拽状态.正在拖拽 = false;
  }
}

new 图形重叠演示器();

class 图形重叠互斥演示器 {
  constructor() {
    this.canvas = document.getElementById("图形重叠互斥");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.画布中心 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
    };

    // 定义三个图形，让它们彼此重叠
    this.矩形 = {
      路径: new Path2D(),
      参数: {
        左上角: { x: this.画布中心.x - 180, y: this.画布中心.y - 120 },
        宽度: 300,
        高度: 180,
      },
      鼠标位于内部: false,
      颜色: "#c54b6b", // 红色
      正在拖拽: false,
      拖拽偏移: { x: 0, y: 0 },
    };

    this.正圆 = {
      路径: new Path2D(),
      参数: {
        圆心: { x: this.画布中心.x + 60, y: this.画布中心.y - 40 },
        半径: 120,
      },
      鼠标位于内部: false,
      颜色: "#edd700", // 青色
      正在拖拽: false,
      拖拽偏移: { x: 0, y: 0 },
    };

    this.五边形 = {
      路径: new Path2D(),
      参数: {
        圆心: { x: this.画布中心.x, y: this.画布中心.y + (40 / 3) * 4 },
        半径: 120,
      },
      鼠标位于内部: false,
      颜色: "#4587d1", // 蓝色
      正在拖拽: false,
      拖拽偏移: { x: 0, y: 0 },
    };

    // 拖拽状态
    this.拖拽状态 = {
      正在拖拽: false,
      拖拽开始位置: { x: 0, y: 0 },
    };

    // 构建路径
    this.构建矩形路径();
    this.构建正圆路径();
    this.构建五边形路径();

    this.绘制全部();
    this.添加鼠标事件();
  }

  构建矩形路径() {
    this.矩形.路径 = new Path2D();
    this.矩形.路径.rect(this.矩形.参数.左上角.x, this.矩形.参数.左上角.y, this.矩形.参数.宽度, this.矩形.参数.高度);
  }

  构建正圆路径() {
    this.正圆.路径 = new Path2D();
    this.正圆.路径.arc(this.正圆.参数.圆心.x, this.正圆.参数.圆心.y, this.正圆.参数.半径, 0, 2 * Math.PI);
  }

  构建五边形路径() {
    this.五边形.路径 = new Path2D();

    // 正五边形的顶点计算
    const 圆心 = this.五边形.参数.圆心;
    const 半径 = this.五边形.参数.半径;
    const 顶点数量 = 5;

    // 从顶部开始，顺时针绘制正五边形
    for (let i = 0; i < 顶点数量; i++) {
      const 角度 = (i * 2 * Math.PI) / 顶点数量 - Math.PI / 2; // 从顶部开始
      const x = 圆心.x + 半径 * Math.cos(角度);
      const y = 圆心.y + 半径 * Math.sin(角度);

      if (i === 0) {
        this.五边形.路径.moveTo(x, y);
      } else {
        this.五边形.路径.lineTo(x, y);
      }
    }

    this.五边形.路径.closePath();
  }

  渲染Canvas背景() {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(35, 35, 35, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  绘制矩形() {
    this.ctx.save();

    // 根据鼠标位置和拖拽状态决定填充色透明度
    if (this.矩形.正在拖拽) {
      this.ctx.fillStyle = this.矩形.颜色 + "50"; // 拖拽时半透明
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = "#00ff00"; // 拖拽时绿色边框
    } else if (this.矩形.鼠标位于内部) {
      this.ctx.fillStyle = this.矩形.颜色 + "a0"; // 悬停时半透明
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#ffffff";
    } else {
      this.ctx.fillStyle = this.矩形.颜色;
      this.ctx.lineWidth = 0;
      this.ctx.strokeStyle = "transparent";
    }

    this.ctx.fill(this.矩形.路径);
    this.ctx.stroke(this.矩形.路径);

    this.ctx.restore();
  }

  绘制正圆() {
    this.ctx.save();

    // 根据鼠标位置和拖拽状态决定填充色透明度
    if (this.正圆.正在拖拽) {
      this.ctx.fillStyle = this.正圆.颜色 + "50"; // 拖拽时半透明
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = "#00ff00"; // 拖拽时绿色边框
    } else if (this.正圆.鼠标位于内部) {
      this.ctx.fillStyle = this.正圆.颜色 + "a0"; // 悬停时半透明
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#ffffff";
    } else {
      this.ctx.fillStyle = this.正圆.颜色;
      this.ctx.lineWidth = 0;
      this.ctx.strokeStyle = "transparent";
    }

    this.ctx.fill(this.正圆.路径);
    this.ctx.stroke(this.正圆.路径);

    this.ctx.restore();
  }

  绘制五边形() {
    this.ctx.save();

    // 根据鼠标位置和拖拽状态决定填充色透明度
    if (this.五边形.正在拖拽) {
      this.ctx.fillStyle = this.五边形.颜色 + "50"; // 拖拽时半透明
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = "#00ff00"; // 拖拽时绿色边框
    } else if (this.五边形.鼠标位于内部) {
      this.ctx.fillStyle = this.五边形.颜色 + "a0"; // 悬停时半透明
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#ffffff";
    } else {
      this.ctx.fillStyle = this.五边形.颜色;
      this.ctx.lineWidth = 0;
      this.ctx.strokeStyle = "transparent";
    }

    this.ctx.fill(this.五边形.路径);
    this.ctx.stroke(this.五边形.路径);

    this.ctx.restore();
  }

  绘制全部() {
    this.渲染Canvas背景();
    // 按顺序绘制，后面的会覆盖前面的
    this.绘制矩形();
    this.绘制正圆();
    this.绘制五边形();
  }

  鼠标位于矩形内部(鼠标相对坐标) {
    return (
      鼠标相对坐标.x >= this.矩形.参数.左上角.x &&
      鼠标相对坐标.x <= this.矩形.参数.左上角.x + this.矩形.参数.宽度 &&
      鼠标相对坐标.y >= this.矩形.参数.左上角.y &&
      鼠标相对坐标.y <= this.矩形.参数.左上角.y + this.矩形.参数.高度
    );
  }

  鼠标位于正圆内部(鼠标相对坐标) {
    const 距离平方 =
      Math.pow(鼠标相对坐标.x - this.正圆.参数.圆心.x, 2) + Math.pow(鼠标相对坐标.y - this.正圆.参数.圆心.y, 2);
    return 距离平方 <= Math.pow(this.正圆.参数.半径, 2);
  }

  鼠标位于五边形内部(鼠标相对坐标) {
    return this.ctx.isPointInPath(this.五边形.路径, 鼠标相对坐标.x * this.dpr, 鼠标相对坐标.y * this.dpr);
  }

  获取鼠标相对坐标(e) {
    const 鼠标视口坐标 = {
      x: e.clientX,
      y: e.clientY,
    };

    const 边界矩形 = this.canvas.getBoundingClientRect();

    return {
      x: Math.round(鼠标视口坐标.x - 边界矩形.left),
      y: Math.round(鼠标视口坐标.y - 边界矩形.top),
    };
  }

  添加鼠标事件() {
    // 鼠标移动事件
    this.canvas.addEventListener("mousemove", (e) => {
      const 鼠标相对坐标 = this.获取鼠标相对坐标(e);

      if (this.拖拽状态.正在拖拽) {
        // 正在拖拽时，更新所有被拖拽的图形位置
        this.更新拖拽图形位置(鼠标相对坐标);
      }

      // 检测鼠标是否在各个图形内部（拖拽时也要检测，用于视觉反馈）
      this.矩形.鼠标位于内部 = this.鼠标位于矩形内部(鼠标相对坐标);
      this.正圆.鼠标位于内部 = this.鼠标位于正圆内部(鼠标相对坐标);
      this.五边形.鼠标位于内部 = this.鼠标位于五边形内部(鼠标相对坐标);

      // 重新绘制
      this.绘制全部();
    });

    // 鼠标按下事件
    this.canvas.addEventListener("mousedown", (e) => {
      const 鼠标相对坐标 = this.获取鼠标相对坐标(e);
      this.开始拖拽(鼠标相对坐标);
    });

    // 鼠标松开事件
    this.canvas.addEventListener("mouseup", (e) => {
      this.结束拖拽();
      this.绘制全部();
    });

    // 鼠标离开画布事件
    this.canvas.addEventListener("mouseleave", (e) => {
      this.结束拖拽();
    });
  }

  开始拖拽(鼠标相对坐标) {
    // 检测所有被点击的图形，允许多个图形同时拖拽
    if (this.鼠标位于五边形内部(鼠标相对坐标)) {
      this.拖拽状态.正在拖拽 = true;
      this.拖拽状态.拖拽开始位置 = { ...鼠标相对坐标 };
      this.五边形.拖拽偏移 = {
        x: 鼠标相对坐标.x - this.五边形.参数.圆心.x,
        y: 鼠标相对坐标.y - this.五边形.参数.圆心.y,
      };
      this.五边形.正在拖拽 = true;
    } else if (this.鼠标位于正圆内部(鼠标相对坐标)) {
      this.拖拽状态.正在拖拽 = true;
      this.拖拽状态.拖拽开始位置 = { ...鼠标相对坐标 };
      this.正圆.拖拽偏移 = {
        x: 鼠标相对坐标.x - this.正圆.参数.圆心.x,
        y: 鼠标相对坐标.y - this.正圆.参数.圆心.y,
      };
      this.正圆.正在拖拽 = true;
    } else if (this.鼠标位于矩形内部(鼠标相对坐标)) {
      this.拖拽状态.正在拖拽 = true;
      this.拖拽状态.拖拽开始位置 = { ...鼠标相对坐标 };
      this.矩形.拖拽偏移 = {
        x: 鼠标相对坐标.x - this.矩形.参数.左上角.x,
        y: 鼠标相对坐标.y - this.矩形.参数.左上角.y,
      };
      this.矩形.正在拖拽 = true;
    }
  }

  更新拖拽图形位置(鼠标相对坐标) {
    // 更新所有正在拖拽的图形位置
    if (this.五边形.正在拖拽) {
      // 更新五边形圆心位置
      this.五边形.参数.圆心.x = 鼠标相对坐标.x - this.五边形.拖拽偏移.x;
      this.五边形.参数.圆心.y = 鼠标相对坐标.y - this.五边形.拖拽偏移.y;
      this.构建五边形路径();
    }

    if (this.正圆.正在拖拽) {
      // 更新正圆圆心位置
      this.正圆.参数.圆心.x = 鼠标相对坐标.x - this.正圆.拖拽偏移.x;
      this.正圆.参数.圆心.y = 鼠标相对坐标.y - this.正圆.拖拽偏移.y;
      this.构建正圆路径();
    }

    if (this.矩形.正在拖拽) {
      // 更新矩形左上角位置
      this.矩形.参数.左上角.x = 鼠标相对坐标.x - this.矩形.拖拽偏移.x;
      this.矩形.参数.左上角.y = 鼠标相对坐标.y - this.矩形.拖拽偏移.y;
      this.构建矩形路径();
    }
  }

  结束拖拽() {
    // 结束所有图形的拖拽状态
    this.五边形.正在拖拽 = false;
    this.正圆.正在拖拽 = false;
    this.矩形.正在拖拽 = false;
    this.拖拽状态.正在拖拽 = false;
  }
}

new 图形重叠互斥演示器();

class 图形重叠正确处理演示器 {
  constructor() {
    this.canvas = document.getElementById("图形重叠正确处理演示器");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.画布中心 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
    };

    // 拖拽状态
    this.拖拽状态 = {
      正在拖拽: false,
      拖拽开始位置: { x: 0, y: 0 },
    };

    // 图形栈：按照绘制顺序，越靠后的图形越在上方
    this.图形栈 = [
      {
        路径: new Path2D(),
        参数: {
          左上角: { x: this.画布中心.x - 180, y: this.画布中心.y - 120 },
          宽度: 300,
          高度: 180,
        },
        鼠标位于内部: false,
        颜色: "#c54b6b", // 红色
        正在拖拽: false,
        拖拽偏移: { x: 0, y: 0 },
        形状: "矩形",
      },
      {
        路径: new Path2D(),
        参数: {
          圆心: { x: this.画布中心.x + 60, y: this.画布中心.y - 40 },
          半径: 120,
        },
        鼠标位于内部: false,
        颜色: "#edd700", // 青色
        正在拖拽: false,
        拖拽偏移: { x: 0, y: 0 },
        形状: "正圆",
      },
      {
        路径: new Path2D(),
        参数: {
          中心点: { x: this.画布中心.x, y: this.画布中心.y + (40 / 3) * 4 },
          半径: 120,
        },
        鼠标位于内部: false,
        颜色: "#4587d1", // 蓝色
        正在拖拽: false,
        拖拽偏移: { x: 0, y: 0 },
        形状: "五边形",
      },
    ];

    // 构建路径
    for (const 图形 of this.图形栈) {
      this.构建图形路径(图形);
    }

    this.绘制全部();
    this.添加鼠标事件();
  }

  构建图形路径(图形对象) {
    图形对象.路径 = new Path2D();

    switch (图形对象.形状) {
      case "矩形":
        this.构建矩形路径(图形对象);
        break;
      case "正圆":
        this.构建正圆路径(图形对象);
        break;
      case "五边形":
        this.构建五边形路径(图形对象);
        break;
      default:
        console.warn(`未知的图形形状: ${图形对象.形状}`);
    }
  }

  构建矩形路径(矩形对象) {
    矩形对象.路径 = new Path2D();
    矩形对象.路径.rect(矩形对象.参数.左上角.x, 矩形对象.参数.左上角.y, 矩形对象.参数.宽度, 矩形对象.参数.高度);
  }

  构建正圆路径(正圆对象) {
    正圆对象.路径 = new Path2D();
    正圆对象.路径.arc(正圆对象.参数.圆心.x, 正圆对象.参数.圆心.y, 正圆对象.参数.半径, 0, 2 * Math.PI);
  }

  构建五边形路径(五边形对象) {
    五边形对象.路径 = new Path2D();

    // 正五边形的顶点计算
    const 中心点 = 五边形对象.参数.中心点;
    const 半径 = 五边形对象.参数.半径;
    const 顶点数量 = 5;

    // 从顶部开始，顺时针绘制正五边形
    for (let i = 0; i < 顶点数量; i++) {
      const 角度 = (i * 2 * Math.PI) / 顶点数量 - Math.PI / 2; // 从顶部开始
      const x = 中心点.x + 半径 * Math.cos(角度);
      const y = 中心点.y + 半径 * Math.sin(角度);

      if (i === 0) {
        五边形对象.路径.moveTo(x, y);
      } else {
        五边形对象.路径.lineTo(x, y);
      }
    }

    五边形对象.路径.closePath();
  }

  绘制图形(图形对象) {
    this.ctx.save();

    // 根据鼠标位置和拖拽状态决定填充色透明度
    if (图形对象.正在拖拽) {
      this.ctx.fillStyle = 图形对象.颜色 + "50"; // 拖拽时半透明
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = "#00ff00"; // 拖拽时绿色边框
    } else if (!this.拖拽状态.正在拖拽 && 图形对象.鼠标位于内部) {
      this.ctx.fillStyle = 图形对象.颜色 + "a0"; // 降低透明度
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#ffffff";
    } else {
      this.ctx.fillStyle = 图形对象.颜色;
      this.ctx.lineWidth = 0;
      this.ctx.strokeStyle = "transparent";
    }

    this.ctx.fill(图形对象.路径);
    this.ctx.stroke(图形对象.路径);

    this.ctx.restore();
  }

  绘制全部() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // 按顺序绘制，后面的会覆盖前面的
    for (const 图形 of this.图形栈) {
      this.绘制图形(图形);
    }
  }

  鼠标位于图形内部(鼠标相对坐标, 路径) {
    return this.ctx.isPointInPath(路径, 鼠标相对坐标.x * this.dpr, 鼠标相对坐标.y * this.dpr);
  }

  // 检测鼠标位于哪个图形内部（考虑层叠顺序）
  获取鼠标位于其内部的最上方图形(鼠标相对坐标) {
    // 重置所有图形的鼠标状态
    for (const 图形 of this.图形栈) {
      图形.鼠标位于内部 = false;
    }

    // 从后往前检测（从最上方的图形开始）
    for (let i = this.图形栈.length - 1; i >= 0; i--) {
      const 图形 = this.图形栈[i];

      if (this.鼠标位于图形内部(鼠标相对坐标, 图形.路径)) {
        图形.鼠标位于内部 = true;
        return 图形; // 找到第一个符合条件的图形，立即返回
      }
    }

    return null; // 没有找到任何图形
  }

  获取鼠标相对坐标(e) {
    const 鼠标视口坐标 = {
      x: e.clientX,
      y: e.clientY,
    };

    const 边界矩形 = this.canvas.getBoundingClientRect();

    return {
      x: Math.round(鼠标视口坐标.x - 边界矩形.left),
      y: Math.round(鼠标视口坐标.y - 边界矩形.top),
    };
  }

  添加鼠标事件() {
    // 鼠标移动事件
    this.canvas.addEventListener("mousemove", (e) => {
      const 鼠标相对坐标 = this.获取鼠标相对坐标(e);

      if (this.拖拽状态.正在拖拽) {
        // 正在拖拽时，更新所有被拖拽的图形位置
        this.更新拖拽图形位置(鼠标相对坐标);
      }

      // 这一句仅用于鼠标悬停的视觉反馈，即将图形对象的鼠标位于内部状态设置为 true
      this.获取鼠标位于其内部的最上方图形(鼠标相对坐标);

      // 重新绘制
      this.绘制全部();
    });

    // 鼠标按下事件
    this.canvas.addEventListener("mousedown", (e) => {
      const 鼠标相对坐标 = this.获取鼠标相对坐标(e);
      this.开始拖拽(鼠标相对坐标);
    });

    // 鼠标松开事件
    this.canvas.addEventListener("mouseup", (e) => {
      this.结束拖拽();
      this.绘制全部();
    });

    this.canvas.addEventListener("mouseleave", (e) => {
      this.结束拖拽();
    });
  }

  开始拖拽(鼠标相对坐标) {
    // 使用栈结构从后往前检测，确保只有最上方的图形能被拖拽
    const 被点击的图形 = this.获取鼠标位于其内部的最上方图形(鼠标相对坐标);

    if (被点击的图形) {
      this.拖拽状态.正在拖拽 = true;
      this.拖拽状态.拖拽开始位置 = { ...鼠标相对坐标 };

      if (被点击的图形.形状 === "五边形") {
        被点击的图形.拖拽偏移 = {
          x: 鼠标相对坐标.x - 被点击的图形.参数.中心点.x,
          y: 鼠标相对坐标.y - 被点击的图形.参数.中心点.y,
        };
        被点击的图形.正在拖拽 = true;
      } else if (被点击的图形.形状 === "正圆") {
        被点击的图形.拖拽偏移 = {
          x: 鼠标相对坐标.x - 被点击的图形.参数.圆心.x,
          y: 鼠标相对坐标.y - 被点击的图形.参数.圆心.y,
        };
        被点击的图形.正在拖拽 = true;
      } else if (被点击的图形.形状 === "矩形") {
        被点击的图形.拖拽偏移 = {
          x: 鼠标相对坐标.x - 被点击的图形.参数.左上角.x,
          y: 鼠标相对坐标.y - 被点击的图形.参数.左上角.y,
        };
        被点击的图形.正在拖拽 = true;
      }
    }
  }

  更新拖拽图形位置(鼠标相对坐标) {
    // 更新所有正在拖拽的图形位置
    for (const 图形 of this.图形栈) {
      if (图形.正在拖拽) {
        if (图形.形状 === "五边形") {
          // 更新五边形圆心位置
          图形.参数.中心点.x = 鼠标相对坐标.x - 图形.拖拽偏移.x;
          图形.参数.中心点.y = 鼠标相对坐标.y - 图形.拖拽偏移.y;
          this.构建五边形路径(图形);
        } else if (图形.形状 === "正圆") {
          // 更新正圆圆心位置
          图形.参数.圆心.x = 鼠标相对坐标.x - 图形.拖拽偏移.x;
          图形.参数.圆心.y = 鼠标相对坐标.y - 图形.拖拽偏移.y;
          this.构建正圆路径(图形);
        } else if (图形.形状 === "矩形") {
          // 更新矩形左上角位置
          图形.参数.左上角.x = 鼠标相对坐标.x - 图形.拖拽偏移.x;
          图形.参数.左上角.y = 鼠标相对坐标.y - 图形.拖拽偏移.y;
          this.构建矩形路径(图形);
        }
      }
    }
  }

  结束拖拽() {
    // 结束所有图形的拖拽状态
    for (const 图形 of this.图形栈) {
      图形.正在拖拽 = false;
    }
    this.拖拽状态.正在拖拽 = false;
  }
}

new 图形重叠正确处理演示器();
