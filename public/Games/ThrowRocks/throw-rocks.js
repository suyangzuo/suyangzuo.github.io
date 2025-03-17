const 绘图区 = document.getElementById("绘图区");
const 上下文 = 绘图区.getContext("2d");
let 蓄力按钮 = null;

const 起点 = {
  x: 绘图区.width / 5,
  y: (绘图区.height / 3) * 2,
};

const 终点 = {
  x: (绘图区.width / 5) * 4,
  y: (绘图区.height / 3) * 2,
};

const 控制点_1 = {
  x: (绘图区.width / 100) * 35,
  y: 绘图区.height / 5,
};

const 控制点_2 = {
  x: (绘图区.width / 100) * 65,
  y: 绘图区.height / 5,
};

初始化绘图区();
绘制蓄力按钮("#234", "gray", 2);
初始化贝塞尔曲线参数();
绘制贝塞尔曲线参数点();
绘制贝塞尔曲线();

function 初始化绘图区() {
  绘图区.width = window.innerWidth * devicePixelRatio;
  绘图区.height = (window.innerHeight - 150) * devicePixelRatio;
  上下文.fillStyle = "#000a";
  上下文.fillRect(0, 0, 绘图区.width, 绘图区.height);
}

function 初始化贝塞尔曲线参数() {
  起点.x = 绘图区.width / 5;
  起点.y = (绘图区.height / 3) * 2;
  终点.x = (绘图区.width / 5) * 4;
  终点.y = (绘图区.height / 3) * 2;
  控制点_1.x = (绘图区.width / 100) * 35;
  控制点_1.y = 绘图区.height / 5;
  控制点_2.x = (绘图区.width / 100) * 65;
  控制点_2.y = 绘图区.height / 5;
}

function 绘制贝塞尔曲线参数点() {
  const 点集合 = [起点, 终点, 控制点_1, 控制点_2];
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
  上下文.moveTo(起点.x, 起点.y);
  上下文.bezierCurveTo(控制点_1.x, 控制点_1.y, 控制点_2.x, 控制点_2.y, 终点.x, 终点.y);
  上下文.strokeStyle = "lightskyblue";
  上下文.lineWidth = 2 * devicePixelRatio;
  上下文.stroke();
  上下文.closePath();
}

window.addEventListener("resize", () => {
  初始化绘图区();
  绘制蓄力按钮();
  初始化贝塞尔曲线参数();
  绘制贝塞尔曲线参数点();
  绘制贝塞尔曲线();
});

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
  const x = (绘图区.width - 宽 * devicePixelRatio) / 2;
  const y = 绘图区.height - 100 * devicePixelRatio;
  const 弧度 = 10;
  绘制圆角矩形(x, y, 宽 * devicePixelRatio, 高 * devicePixelRatio, 弧度);
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

  const fontSize = 16 * devicePixelRatio;
  上下文.font = `${fontSize}px sans-serif`;
  上下文.fillStyle = "white";
  上下文.fillText("蓄力", x + ((宽 * devicePixelRatio) / 2 - fontSize), y + 高 - 5);
}

绘图区.addEventListener("mousedown", (e) => {
  绘图区.removeEventListener("mousemove", 蓄力按钮鼠标悬停);
  if (
    e.offsetX * devicePixelRatio >= 蓄力按钮.x &&
    e.offsetX * devicePixelRatio <= 蓄力按钮.x + 蓄力按钮.width * devicePixelRatio &&
    e.offsetY * devicePixelRatio >= 蓄力按钮.y &&
    e.offsetY * devicePixelRatio <= 蓄力按钮.y + 蓄力按钮.height * devicePixelRatio
  ) {
    绘制蓄力按钮("#456", "white", 2);
  }
});

绘图区.addEventListener("mousemove", 蓄力按钮鼠标悬停);

function 蓄力按钮鼠标悬停(e) {
  if (
    e.offsetX * devicePixelRatio >= 蓄力按钮.x &&
    e.offsetX * devicePixelRatio <= 蓄力按钮.x + 蓄力按钮.width * devicePixelRatio &&
    e.offsetY * devicePixelRatio >= 蓄力按钮.y &&
    e.offsetY * devicePixelRatio <= 蓄力按钮.y + 蓄力按钮.height * devicePixelRatio
  ) {
    绘图区.style.cursor = "pointer";
    绘制蓄力按钮("#345", "silver", 2);
  } else {
    绘图区.style.cursor = "auto";
    绘制蓄力按钮("#234", "gray", 2);
  }
}

绘图区.addEventListener("mouseup", (e) => {
  绘图区.addEventListener("mousemove", 蓄力按钮鼠标悬停);
  if (
    e.offsetX * devicePixelRatio >= 蓄力按钮.x &&
    e.offsetX * devicePixelRatio <= 蓄力按钮.x + 蓄力按钮.width * devicePixelRatio &&
    e.offsetY * devicePixelRatio >= 蓄力按钮.y &&
    e.offsetY * devicePixelRatio <= 蓄力按钮.y + 蓄力按钮.height * devicePixelRatio
  ) {
    绘制蓄力按钮("#345", "silver", 2);
  } else {
    绘制蓄力按钮("#234", "gray", 2);
  }
});

const 重置按钮 = document.querySelector(".reset-game");

重置按钮.addEventListener("click", 重置参数);

function 重置参数() {}
