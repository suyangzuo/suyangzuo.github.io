const 绘图区 = document.getElementById("绘图区");
const 上下文 = 绘图区.getContext("2d");
const dpr = window.devicePixelRatio || 1;
let 画布宽度 = 绘图区.offsetWidth;
let 画布高度 = 绘图区.offsetHeight;
初始化绘图区();

let 蓄力按钮 = null;
const 蓄力按钮描边宽度 = 2;

const 抛射物图 = new Image();
抛射物图.src = "./Images/抛射物.png";
const 击中效果 = new Image();
击中效果.src = "./Images/击中效果.png";

const 图像宽度 = 75;
const 图像高度 = 75;

const 动画配置 = {
  默认抛掷距离: { x: 0.8, y: 2 / 3 },
  p1默认坐标: { x: 0.35, y: 0.2 },
  p2默认坐标: { x: 0.65, y: 0.2 },
  动画时长: 1000,
  旋转速度: 1080,
};

let 动画开始时间 = null;
let 旋转角度 = 0;

const p0 = {
  x: 画布宽度 / 5,
  y: (画布高度 / 3) * 2,
};

const p3 = {
  x: (画布宽度 / 5) * 4,
  y: (画布高度 / 3) * 2,
};

const p1 = {
  x: (画布宽度 / 100) * 35,
  y: 画布高度 / 5,
};

const p2 = {
  x: (画布宽度 / 100) * 65,
  y: 画布高度 / 5,
};

绘制蓄力按钮("#234", "gray", 蓄力按钮描边宽度);
初始化贝塞尔曲线参数();
绘制贝塞尔曲线参数点();
绘制贝塞尔曲线();

window.addEventListener("resize", () => {
  初始化绘图区();
  绘制蓄力按钮("#234", "gray", 蓄力按钮描边宽度);
  初始化贝塞尔曲线参数();
  绘制贝塞尔曲线参数点();
  绘制贝塞尔曲线();
});

function 初始化绘图区() {
  画布宽度 = 绘图区.offsetWidth;
  画布高度 = 绘图区.offsetHeight;
  绘图区.width = 绘图区.offsetWidth * dpr;
  绘图区.height = 绘图区.offsetHeight * dpr;
  上下文.scale(dpr, dpr);
}

function 初始化贝塞尔曲线参数() {
  p0.x = Math.max(画布宽度 * (1 - 动画配置.默认抛掷距离.x), 25);
  p0.y = (画布高度 / 3) * 2;
  p1.x = 画布宽度 * 动画配置.p1默认坐标.x;
  p1.y = 画布高度 * 动画配置.p1默认坐标.y;
  p2.x = 画布宽度 * 动画配置.p2默认坐标.x;
  p2.y = 画布高度 * 动画配置.p2默认坐标.y;
  p3.x = Math.min(画布宽度 * 动画配置.默认抛掷距离.x, 画布宽度 - 25);
  p3.y = 画布高度 * 动画配置.默认抛掷距离.y;
}

function 绘制贝塞尔曲线参数点() {
  const 点集合 = [p0, p3, p1, p2];
  const 半径 = 10;
  for (const 点 of 点集合) {
    上下文.beginPath();
    上下文.arc(点.x, 点.y, 半径, 0, Math.PI * 2);
    上下文.fillStyle = "white";
    上下文.fill();
    上下文.closePath();
  }
}

function 绘制贝塞尔曲线() {
  上下文.beginPath();
  上下文.moveTo(p0.x, p0.y);
  上下文.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  上下文.strokeStyle = "lightskyblue";
  上下文.lineWidth = 2;
  上下文.stroke();
  上下文.closePath();
}

function 绘制抛射物(x, y) {
  上下文.save();
  上下文.translate(x, y);
  上下文.rotate((旋转角度 * Math.PI) / 180);
  上下文.drawImage(抛射物图, -图像宽度 / 2, -图像高度 / 2, 图像宽度, 图像高度);
  上下文.restore();
}

function 绘制击中效果(x, y) {
  上下文.drawImage(击中效果, x - 图像宽度, y - 图像高度, 图像宽度 * 2, 图像高度 * 2);
}

function 绘制抛射动画(当前时间戳) {
  if (动画开始时间 === null) {
    动画开始时间 = 当前时间戳 || performance.now();
  }

  const 当前时间 = 当前时间戳 || performance.now();
  const 经过时间 = 当前时间 - 动画开始时间;
  const t = Math.min(经过时间 / 动画配置.动画时长, 1);

  const 当前点 = 获取当前贝塞尔坐标(t);
  上下文.clearRect(p0.x - 图像宽度, 0, p3.x + 图像宽度, p3.y + 图像宽度);
  绘制贝塞尔曲线();
  绘制贝塞尔曲线参数点();
  绘制抛射物(当前点.x, 当前点.y);

  旋转角度 = (经过时间 / 1000) * 动画配置.旋转速度;

  if (t >= 1) {
    绘制击中效果(当前点.x, 当前点.y);
    动画开始时间 = null;
    旋转角度 = 0;
    绘图区.addEventListener("click", 点击蓄力按钮);
  } else {
    requestAnimationFrame(绘制抛射动画);
  }
}

function 绘制圆角矩形(起点x, 起点y, 宽, 高, 圆角弧度) {
  上下文.beginPath();
  上下文.moveTo(起点x + 圆角弧度, 起点y);
  上下文.lineTo(起点x + 宽 - 圆角弧度, 起点y); // 上
  上下文.arcTo(起点x + 宽, 起点y, 起点x + 宽, 起点y + 圆角弧度, 圆角弧度); // 右上
  上下文.lineTo(起点x + 宽, 起点y + 高 - 圆角弧度); // Right side
  上下文.arcTo(起点x + 宽, 起点y + 高, 起点x + 宽 - 圆角弧度, 起点y + 高, 圆角弧度); // 右下
  上下文.lineTo(起点x + 圆角弧度, 起点y + 高); // 下
  上下文.arcTo(起点x, 起点y + 高, 起点x, 起点y + 高 - 圆角弧度, 圆角弧度); // 左下
  上下文.lineTo(起点x, 起点y + 圆角弧度); // 左
  上下文.arcTo(起点x, 起点y, 起点x + 圆角弧度, 起点y, 圆角弧度); // 左上
  上下文.closePath();
}

function 绘制蓄力按钮(填充色, 描边色, 描边宽度) {
  const 宽 = 120;
  const 高 = 50;
  const x = (画布宽度 - 宽) / 2;
  const y = 画布高度 - 100;
  const 向外延伸清除距离 = 10;
  上下文.clearRect(x - 向外延伸清除距离, y - 向外延伸清除距离, 宽 + 向外延伸清除距离 * 2, 高 + 向外延伸清除距离 * 2);
  const 弧度 = 10;
  绘制圆角矩形(x, y, 宽, 高, 弧度);
  蓄力按钮 = {
    x: x,
    y: y,
    width: 宽,
    height: 高,
  };
  上下文.fillStyle = 填充色;
  上下文.fill();
  上下文.strokeStyle = 描边色;
  上下文.lineWidth = 描边宽度;
  上下文.stroke();

  const fontSize = 16;
  上下文.font = `${fontSize}px sans-serif`;
  上下文.fillStyle = "white";
  上下文.fillText("蓄力", x + (宽 / 2 - fontSize), y + (高 - fontSize - 4));
}

function 获取当前贝塞尔坐标(t) {
  const x =
    Math.pow(1 - t, 3) * p0.x +
    3 * Math.pow(1 - t, 2) * t * p1.x +
    3 * (1 - t) * Math.pow(t, 2) * p2.x +
    Math.pow(t, 3) * p3.x;
  const y =
    Math.pow(1 - t, 3) * p0.y +
    3 * Math.pow(1 - t, 2) * t * p1.y +
    3 * (1 - t) * Math.pow(t, 2) * p2.y +
    Math.pow(t, 3) * p3.y;
  return { x, y };
}

function 点击区域位于蓄力按钮内(e) {
  return (
    e.offsetX >= 蓄力按钮.x &&
    e.offsetX <= 蓄力按钮.x + 蓄力按钮.width &&
    e.offsetY >= 蓄力按钮.y &&
    e.offsetY <= 蓄力按钮.y + 蓄力按钮.height
  );
}

绘图区.addEventListener("mousedown", (e) => {
  绘图区.removeEventListener("mousemove", 蓄力按钮鼠标悬停);
  if (点击区域位于蓄力按钮内(e)) {
    绘制蓄力按钮("#456", "white", 蓄力按钮描边宽度);
  }
});

绘图区.addEventListener("mousemove", 蓄力按钮鼠标悬停);

function 蓄力按钮鼠标悬停(e) {
  if (点击区域位于蓄力按钮内(e)) {
    绘图区.style.cursor = "pointer";
    绘制蓄力按钮("#345", "silver", 蓄力按钮描边宽度);
  } else {
    绘图区.style.cursor = "auto";
    绘制蓄力按钮("#234", "gray", 蓄力按钮描边宽度);
  }
}

绘图区.addEventListener("mouseup", (e) => {
  绘图区.addEventListener("mousemove", 蓄力按钮鼠标悬停);
  if (点击区域位于蓄力按钮内(e)) {
    绘制蓄力按钮("#345", "silver", 蓄力按钮描边宽度);
  } else {
    绘制蓄力按钮("#234", "gray", 蓄力按钮描边宽度);
  }
});

绘图区.addEventListener("click", 点击蓄力按钮);

function 点击蓄力按钮(e) {
  if (点击区域位于蓄力按钮内(e)) {
    绘图区.removeEventListener("click", 点击蓄力按钮);
    绘制抛射动画();
  }
}

const 重置按钮 = document.querySelector(".reset-game");

重置按钮.addEventListener("click", 重置参数);

function 重置参数() {}
