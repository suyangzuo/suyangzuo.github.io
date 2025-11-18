class CanvasDrawer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.setupCanvas();
    this.drawLine(100, 100, 400, 200);
  }

  setupCanvas() {
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  drawLine(startX, startY, endX, endY, strokeStyle = "lightskyblue", lineWidth = 2) {
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
  }
}

// 创建Canvas绘制器实例并绘制直线
new CanvasDrawer("canvas-直线");

const canvas_矩形说明 = document.getElementById("canvas-矩形说明");
const widthNum = document.querySelector(".canvas-width .num");
const heightNum = document.querySelector(".canvas-height .num");
if (widthNum) widthNum.textContent = canvas_矩形说明.offsetWidth;
if (heightNum) heightNum.textContent = canvas_矩形说明.offsetHeight;
const rectXIndicator = document.querySelector(".rect-x-indicator");
const rectYIndicator = document.querySelector(".rect-y-indicator");
const dpr_1 = window.devicePixelRatio || 1;
canvas_矩形说明.width = canvas_矩形说明.offsetWidth * dpr_1;
canvas_矩形说明.height = canvas_矩形说明.offsetHeight * dpr_1;
const ctx_1 = canvas_矩形说明.getContext("2d");
ctx_1.setTransform(1, 0, 0, 1, 0, 0); // 重置变换
ctx_1.scale(dpr_1, dpr_1);

const canvas_矩形说明_W = canvas_矩形说明.offsetWidth;
const canvas_矩形说明_H = canvas_矩形说明.offsetHeight;
const RECT_W = 150;
const RECT_H = 100;

let rectX = Math.random() * (canvas_矩形说明_W - RECT_W);
let rectY = Math.random() * (canvas_矩形说明_H - RECT_H);
let vx = (((Math.random() - 0.5) * 4) / 3) * 2;
let vy = (((Math.random() - 0.5) * 4) / 3) * 2;

function drawDashedLine(x1, y1, x2, y2) {
  ctx_1.save();
  ctx_1.strokeStyle = "rgba(255,255,255,0.5)";
  ctx_1.setLineDash([8, 6]);
  ctx_1.lineWidth = 2;
  ctx_1.beginPath();
  ctx_1.moveTo(x1, y1);
  ctx_1.lineTo(x2, y2);
  ctx_1.stroke();
  ctx_1.restore();
}

function draw() {
  ctx_1.clearRect(0, 0, canvas_矩形说明_W, canvas_矩形说明_H);
  // 绘制虚线：矩形左上角到上边界
  drawDashedLine(rectX, rectY, rectX, 0);
  // 绘制虚线：矩形左上角到左边界
  drawDashedLine(rectX, rectY, 0, rectY);
  // 绘制矩形
  ctx_1.save();
  ctx_1.fillStyle = "#365";
  ctx_1.fillRect(rectX, rectY, RECT_W, RECT_H);
  ctx_1.restore();

  // 在矩形内部靠下方、水平居中绘制"我是矩形"
  ctx_1.save();
  ctx_1.font = "14px 'Noto Sans SC', sans-serif";
  ctx_1.fillStyle = "#ffa";
  ctx_1.textAlign = "center";
  ctx_1.textBaseline = "bottom";
  ctx_1.fillText("我是矩形", rectX + RECT_W / 2, rectY + RECT_H - 5);
  ctx_1.restore();

  // 在矩形内部绘制宽度和高度数字
  ctx_1.save();
  ctx_1.font = "14px 'Google Sans Code', monospace";
  ctx_1.fillStyle = "white";
  ctx_1.textAlign = "center";
  ctx_1.textBaseline = "top";
  // 宽度数字，顶部居中，距离顶部5px
  ctx_1.fillText(RECT_W, rectX + RECT_W / 2, rectY + 5);
  // 高度数字，左侧居中，距离左边5px
  ctx_1.textAlign = "left";
  ctx_1.textBaseline = "middle";
  ctx_1.fillText(RECT_H, rectX + 5, rectY + RECT_H / 2);
  ctx_1.restore();

  // 更新外部坐标指示器
  if (rectXIndicator) {
    rectXIndicator.style.left = `${rectX + canvas_矩形说明.offsetLeft}px`;
    rectXIndicator.style.top = `${canvas_矩形说明.offsetTop - 10}px`;
    rectXIndicator.textContent = Math.round(rectX);
  }
  if (rectYIndicator) {
    rectYIndicator.style.left = `${canvas_矩形说明.offsetLeft - 10}px`;
    rectYIndicator.style.top = `${rectY + canvas_矩形说明.offsetTop}px`;
    rectYIndicator.textContent = Math.round(rectY);
  }
}

function update() {
  rectX += vx;
  rectY += vy;
  // 碰到边界反弹
  if (rectX < 0) {
    rectX = 0;
    vx = -vx;
  }
  if (rectY < 0) {
    rectY = 0;
    vy = -vy;
  }
  if (rectX > canvas_矩形说明_W - RECT_W) {
    rectX = canvas_矩形说明_W - RECT_W;
    vx = -vx;
  }
  if (rectY > canvas_矩形说明_H - RECT_H) {
    rectY = canvas_矩形说明_H - RECT_H;
    vy = -vy;
  }
}

function animate() {
  update();
  draw();
  requestAnimationFrame(animate);
}

animate();

const canvas_2 = document.getElementById("canvas-2");
const ctx_2 = canvas_2.getContext("2d");
const dpr_2 = window.devicePixelRatio || 1;
canvas_2.width = canvas_2.offsetWidth * dpr_2;
canvas_2.height = canvas_2.offsetHeight * dpr_2;
ctx_2.scale(dpr_2, dpr_2);
ctx_2.fillStyle = "#006400a0";
ctx_2.strokeStyle = "gold";
ctx_2.fillRect(265, 100, 250, 200);
ctx_2.strokeRect(265, 100, 250, 200);

ctx_2.arc(265, 100, 5, 0, 2 * Math.PI);
ctx_2.fillStyle = "black";
ctx_2.strokeStyle = "white";
ctx_2.fill();
ctx_2.stroke();

ctx_2.font = "16px 'Google Sans Code', 'Consolas', sans-serif";
ctx_2.textAlign = "center";
ctx_2.textBaseline = "bottom";
ctx_2.fillStyle = "silver";
ctx_2.fillText("坐标：(265, 100)", 265, 85);

const canvas_round_rect = document.getElementById("canvas-round-rect");
const ctx_round_rect = canvas_round_rect.getContext("2d");
const dpr_round_rect = window.devicePixelRatio || 1;
canvas_round_rect.width = canvas_round_rect.offsetWidth * dpr_round_rect;
canvas_round_rect.height = canvas_round_rect.offsetHeight * dpr_round_rect;
ctx_round_rect.scale(dpr_round_rect, dpr_round_rect);
ctx_round_rect.roundRect(
  (canvas_round_rect.offsetWidth - 300) / 2,
  (canvas_round_rect.offsetHeight - 200) / 2,
  300,
  200,
  [20, 40, 80],
);
ctx_round_rect.fillStyle = "darkgreen";
ctx_round_rect.strokeStyle = "gold";
ctx_round_rect.fill();
ctx_round_rect.stroke();

ctx_round_rect.font = "16px 'Google Sans Code', monospace";
ctx_round_rect.fillStyle = "#ccc";
ctx_round_rect.fillText(
  "20",
  (canvas_round_rect.offsetWidth - 300) / 2 - 30,
  (canvas_round_rect.offsetHeight - 200) / 2 - 15,
);
ctx_round_rect.fillText(
  "40",
  (canvas_round_rect.offsetWidth - 300) / 2 + 300 + 10,
  (canvas_round_rect.offsetHeight - 200) / 2 - 15,
);
ctx_round_rect.fillText(
  "80",
  (canvas_round_rect.offsetWidth - 300) / 2 + 300 + 10,
  (canvas_round_rect.offsetHeight - 200) / 2 + 200 + 15,
);
ctx_round_rect.fillText(
  "40",
  (canvas_round_rect.offsetWidth - 300) / 2 - 30,
  (canvas_round_rect.offsetHeight - 200) / 2 + 200 + 15,
);

class CircleDemo {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;

    // 滑块相关属性
    this.sliderX = 20;
    this.sliderY = 40;
    this.sliderWidth = 200;
    this.sliderHeight = 6;
    this.thumbSize = 16;
    this.endAngle = 2 * Math.PI; // 默认值
    this.minValue = 0;
    this.maxValue = 2 * Math.PI;
    this.step = 0.01;
    this.isDragging = false;
    this.isHovered = false;

    this.initCanvas();
    this.bindEvents();
    this.draw();
  }

  initCanvas() {
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  bindEvents() {
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.handleMouseUp());
    this.canvas.addEventListener("mouseleave", () => this.handleMouseLeave());
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
    const y = ((e.clientY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

    const thumbX = this.getThumbPosition();
    const thumbY = this.sliderY + this.sliderHeight / 2;

    // 检查是否点击在thumb上
    if (Math.abs(x - thumbX) <= this.thumbSize / 2 && Math.abs(y - thumbY) <= this.thumbSize / 2) {
      this.isDragging = true;
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
    const y = ((e.clientY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

    if (this.isDragging) {
      // 更新滑块值
      const newValue = ((x - this.sliderX) / this.sliderWidth) * (this.maxValue - this.minValue) + this.minValue;
      this.endAngle = Math.max(this.minValue, Math.min(this.maxValue, newValue));
      this.draw();
    } else {
      // 检查悬停状态
      const thumbX = this.getThumbPosition();
      const thumbY = this.sliderY + this.sliderHeight / 2;
      const wasHovered = this.isHovered;
      this.isHovered = Math.abs(x - thumbX) <= this.thumbSize / 2 && Math.abs(y - thumbY) <= this.thumbSize / 2;

      if (wasHovered !== this.isHovered) {
        this.draw();
      }
    }
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  handleMouseLeave() {
    this.isDragging = false;
    if (this.isHovered) {
      this.isHovered = false;
      this.draw();
    }
  }

  getThumbPosition() {
    const ratio = (this.endAngle - this.minValue) / (this.maxValue - this.minValue);
    return this.sliderX + ratio * this.sliderWidth;
  }

  formatAngle(angle) {
    const pi = Math.PI;
    if (Math.abs(angle - pi / 2) < 0.01) return { text: "0.5π", number: "0.5" };
    if (Math.abs(angle - pi) < 0.01) return { text: "π", number: "1" };
    if (Math.abs(angle - 1.5 * pi) < 0.01) return { text: "1.5π", number: "1.5" };
    if (Math.abs(angle - 2 * pi) < 0.01) return { text: "2π", number: "2" };

    // 格式化普通数字，去掉不必要的尾随零
    const formatted = parseFloat(angle.toFixed(2)).toString();
    return { text: formatted, number: formatted };
  }

  draw() {
    // 清除画布
    this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);

    // 绘制滑块
    this.drawSlider();

    // 绘制圆形
    this.ctx.beginPath();
    this.ctx.arc(390, 200, 100, 0, this.endAngle);
    this.ctx.fillStyle = "darkgreen";
    this.ctx.strokeStyle = "gold";
    this.ctx.fill();
    this.ctx.stroke();

    // 绘制中心点
    this.ctx.beginPath();
    this.ctx.arc(390, 200, 5, 0, 2 * Math.PI);
    this.ctx.fillStyle = "black";
    this.ctx.strokeStyle = "white";
    this.ctx.fill();
    this.ctx.stroke();

    // 绘制坐标文字
    this.ctx.font = "16px 'Google Sans Code', 'Consolas', sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("坐标：(390, 200)", 390, 175);
  }

  drawSlider() {
    this.ctx.save();

    // 绘制滑块轨道背景
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(this.sliderX, this.sliderY, this.sliderWidth, this.sliderHeight);

    // 绘制已滑过的部分
    const thumbX = this.getThumbPosition();
    this.ctx.fillStyle = "#4CAF50";
    this.ctx.fillRect(this.sliderX, this.sliderY, thumbX - this.sliderX, this.sliderHeight);

    // 绘制滑块轨道边框
    this.ctx.strokeStyle = "#666";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(this.sliderX, this.sliderY, this.sliderWidth, this.sliderHeight);

    // 绘制thumb
    const thumbY = this.sliderY + this.sliderHeight / 2;
    this.ctx.beginPath();
    this.ctx.arc(thumbX, thumbY, 10, 0, 2 * Math.PI);

    if (this.isHovered || this.isDragging) {
      this.ctx.fillStyle = "#2C8F30";
    } else {
      this.ctx.fillStyle = "#4CAF50";
    }

    this.ctx.fill();

    // 绘制角度值
    this.ctx.font = "16px 'Google Sans Code', sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "bottom"; // 明确设置文本基线

    const angleInfo = this.formatAngle(this.endAngle);
    const labelText = "结束弧度: ";
    const numberText = angleInfo.text;

    // 绘制标签文字（白色）
    this.ctx.fillStyle = "#aaa";
    this.ctx.fillText(labelText, this.sliderX, this.sliderY - 10);

    // 计算数字文字的起始位置
    const labelWidth = this.ctx.measureText(labelText).width;

    // 绘制数字（黄色）
    this.ctx.fillStyle = "#FFD700"; // 金黄色
    this.ctx.fillText(numberText, this.sliderX + labelWidth, this.sliderY - 10);

    this.ctx.restore();
  }
}

// 创建实例
new CircleDemo("canvas-circle");

class EllipseCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.rotationAngle = 0; // 默认旋转角度为0

    // 滑块相关属性
    this.slider = {
      x: 0,
      y: 0,
      width: 150,
      height: 8,
      thumbRadius: 10,
      isDragging: false,
      minValue: 0,
      maxValue: 2 * Math.PI,
      value: 0, // 默认值为0
    };

    this.init();
    this.setupEventListeners();
    this.draw();
  }

  init() {
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // 设置滑块位置（右上角）
    this.slider.x = this.canvas.offsetWidth - this.slider.width - 20;
    this.slider.y = 40;
  }

  setupEventListeners() {
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.handleMouseUp());
    this.canvas.addEventListener("mouseleave", () => this.handleMouseUp());
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.offsetWidth / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.offsetHeight / rect.height);

    const thumbX = this.slider.x + (this.slider.value / this.slider.maxValue) * this.slider.width;
    const thumbY = this.slider.y + this.slider.height / 2;

    const distance = Math.sqrt((x - thumbX) ** 2 + (y - thumbY) ** 2);

    if (distance <= this.slider.thumbRadius) {
      this.slider.isDragging = true;
    }
  }

  handleMouseMove(e) {
    if (!this.slider.isDragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.offsetWidth / rect.width);

    // 计算滑块值
    const relativeX = Math.max(0, Math.min(this.slider.width, x - this.slider.x));
    this.slider.value = (relativeX / this.slider.width) * this.slider.maxValue;
    this.rotationAngle = this.slider.value;

    this.draw();
  }

  handleMouseUp() {
    this.slider.isDragging = false;
  }

  drawSlider() {
    // 绘制滑块轨道（未滑过部分）
    this.ctx.fillStyle = "#444";
    this.ctx.fillRect(this.slider.x, this.slider.y, this.slider.width, this.slider.height);

    // 绘制已滑过部分
    const progressWidth = (this.slider.value / this.slider.maxValue) * this.slider.width;
    this.ctx.fillStyle = "#669919";
    this.ctx.fillRect(this.slider.x, this.slider.y, progressWidth, this.slider.height);

    // 绘制滑块拇指
    const thumbX = this.slider.x + (this.slider.value / this.slider.maxValue) * this.slider.width;
    const thumbY = this.slider.y + this.slider.height / 2;

    this.ctx.fillStyle = "#669919";
    this.ctx.beginPath();
    this.ctx.arc(thumbX, thumbY, this.slider.thumbRadius, 0, 2 * Math.PI);
    this.ctx.fill();

    // 绘制当前值标签（跟随thumb移动）
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.font = "14px 'Google Sans Code', sans-serif";
    this.ctx.textAlign = "center";

    let valueText = "";
    if (Math.abs(this.slider.value - 0) < 0.01) {
      valueText = "0";
    } else if (Math.abs(this.slider.value - Math.PI / 2) < 0.01) {
      valueText = "0.5π";
    } else if (Math.abs(this.slider.value - Math.PI) < 0.01) {
      valueText = "π";
    } else if (Math.abs(this.slider.value - (3 * Math.PI) / 2) < 0.01) {
      valueText = "1.5π";
    } else if (Math.abs(this.slider.value - 2 * Math.PI) < 0.01) {
      valueText = "2π";
    } else {
      valueText = this.slider.value.toFixed(2);
    }

    this.ctx.fillText(valueText, thumbX, this.slider.y - 12);

    // 绘制标签标题
    this.ctx.fillStyle = "#aaa";
    this.ctx.font = "14px 'Google Sans Code', sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.fillText("旋转弧度", this.slider.x, this.slider.y + this.slider.height + 25);
  }

  draw() {
    // 清除画布
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);

    // 绘制椭圆
    this.ctx.beginPath();
    this.ctx.ellipse(375, 200, 150, 75, this.rotationAngle, 0, 2 * Math.PI);
    this.ctx.fillStyle = "darkgreen";
    this.ctx.strokeStyle = "gold";
    this.ctx.lineWidth = 2;
    this.ctx.fill();
    this.ctx.stroke();

    // 绘制滑块
    this.drawSlider();
  }
}

// 初始化椭圆canvas
new EllipseCanvas("canvas-椭圆");

class 正多边形范例 {
  constructor() {
    this.canvas = document.getElementById("canvas-正多边形范例");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.正圆 = {
      圆心: {
        x: this.canvas.offsetWidth / 2,
        y: this.canvas.offsetHeight / 2,
      },
      半径: 150,
      路径: null,
    };
    this.正多边形 = {
      顶点数量: 5,
      起始弧度: -Math.PI / 2,
    };

    // 初始化滑块控制
    this.初始化滑块控制();

    requestAnimationFrame(this.绘制全部.bind(this));
  }

  绘制正圆() {
    this.ctx.save();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "#fff3";
    this.ctx.fillStyle = "#fff1";
    this.正圆.路径 = new Path2D();
    this.正圆.路径.arc(this.正圆.圆心.x, this.正圆.圆心.y, this.正圆.半径, 0, 2 * Math.PI);
    this.ctx.stroke(this.正圆.路径);
    this.ctx.fill(this.正圆.路径);
    this.ctx.restore();
  }

  绘制正多边形() {
    this.ctx.save();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "lightskyblue";
    this.ctx.fillStyle = "#87cefa25";
    this.ctx.beginPath();
    for (let i = 0; i < this.正多边形.顶点数量; i++) {
      this.ctx.lineTo(
        this.正圆.圆心.x +
          this.正圆.半径 * Math.cos(this.正多边形.起始弧度 + (i * 2 * Math.PI) / this.正多边形.顶点数量),
        this.正圆.圆心.y +
          this.正圆.半径 * Math.sin(this.正多边形.起始弧度 + (i * 2 * Math.PI) / this.正多边形.顶点数量),
      );
    }
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
  }

  绘制起始弧度参考线() {
    this.ctx.save();
    const 虚线长度 = 10;
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "#fff7";
    this.ctx.setLineDash([虚线长度, 虚线长度]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.正圆.圆心.x, this.正圆.圆心.y);
    this.ctx.lineTo(
      this.正圆.圆心.x + this.正圆.半径 * Math.cos(this.正多边形.起始弧度),
      this.正圆.圆心.y + this.正圆.半径 * Math.sin(this.正多边形.起始弧度),
    );
    this.ctx.stroke();
    this.ctx.lineDashOffset = 虚线长度;
    this.ctx.strokeStyle = "#0007";
    this.ctx.stroke();
    this.ctx.restore();
  }

  绘制圆心() {
    this.ctx.save();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "#333";
    this.ctx.fillStyle = "#aaa";
    this.ctx.beginPath();
    this.ctx.arc(this.正圆.圆心.x, this.正圆.圆心.y, 7, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
  }

  绘制正多边形顶点() {
    this.ctx.save();
    this.ctx.lineWidth = 2;
    for (let i = 0; i < this.正多边形.顶点数量; i++) {
      this.ctx.beginPath();
      const 顶点弧度 = this.正多边形.起始弧度 + (i * 2 * Math.PI) / this.正多边形.顶点数量;
      const 顶点坐标 = {
        x: this.正圆.圆心.x + this.正圆.半径 * Math.cos(顶点弧度),
        y: this.正圆.圆心.y + this.正圆.半径 * Math.sin(顶点弧度),
      };
      this.ctx.arc(顶点坐标.x, 顶点坐标.y, 5, 0, Math.PI * 2);
      this.ctx.closePath();
      this.ctx.fillStyle = "gold";
      this.ctx.fill();
      this.ctx.strokeStyle = "#fff7";
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  绘制顶点索引() {
    this.ctx.save();
    this.ctx.font = "14px 'Google Sans Code', sans-serif";
    this.ctx.fillStyle = "#aaa";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    for (let i = 0; i < this.正多边形.顶点数量; i++) {
      const 顶点弧度 = this.正多边形.起始弧度 + (i * 2 * Math.PI) / this.正多边形.顶点数量;
      // 计算索引文本位置（在顶点外侧）
      const 索引偏移距离 = 20;
      const 索引坐标 = {
        x: this.正圆.圆心.x + (this.正圆.半径 + 索引偏移距离) * Math.cos(顶点弧度),
        y: this.正圆.圆心.y + (this.正圆.半径 + 索引偏移距离) * Math.sin(顶点弧度),
      };

      // 绘制索引文本
      this.ctx.fillText(i.toString(), 索引坐标.x, 索引坐标.y);
    }
    this.ctx.restore();
  }

  绘制全部() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.绘制正圆();
    this.绘制正多边形();
    this.绘制起始弧度参考线();
    this.绘制圆心();
    this.绘制正多边形顶点();
    this.绘制顶点索引();
  }

  初始化滑块控制() {
    // 获取滑块元素
    const 顶点数量滑块 = document.getElementById("顶点数量滑块");
    const 起始弧度滑块 = document.getElementById("起始弧度滑块");
    const 顶点数量显示 = document.getElementById("顶点数量显示");
    const 起始弧度显示 = document.getElementById("起始弧度显示");

    // 顶点数量滑块事件
    顶点数量滑块.addEventListener("input", (e) => {
      const 新值 = parseInt(e.target.value);
      this.正多边形.顶点数量 = 新值;
      顶点数量显示.textContent = 新值;
      // 立即更新绘制
      requestAnimationFrame(this.绘制全部.bind(this));
    });

    // 起始弧度滑块事件
    起始弧度滑块.addEventListener("input", (e) => {
      const 新值 = parseInt(e.target.value) / 100; // 转换为弧度
      this.正多边形.起始弧度 = 新值;
      // 更新显示文本
      if (Math.abs(新值) < 0.01) {
        起始弧度显示.textContent = "0";
      } else if (Math.abs(Math.abs(新值) - Math.PI) < 0.01) {
        起始弧度显示.textContent = 新值 > 0 ? "π" : "-π";
      } else if (Math.abs(Math.abs(新值) - Math.PI / 2) < 0.01) {
        起始弧度显示.textContent = 新值 > 0 ? "π/2" : "-π/2";
      } else if (Math.abs(Math.abs(新值) - Math.PI * 1.5) < 0.01) {
        起始弧度显示.textContent = 新值 > 0 ? "3π/2" : "-3π/2";
      } else if (Math.abs(Math.abs(新值) - Math.PI * 2) < 0.01) {
        起始弧度显示.textContent = 新值 > 0 ? "2π" : "-2π";
      } else {
        起始弧度显示.textContent = 新值.toFixed(2);
      }
      // 立即更新绘制
      requestAnimationFrame(this.绘制全部.bind(this));
    });
  }
}

new 正多边形范例();

class 半径弧度算坐标 {
  constructor() {
    this.canvas = document.getElementById("canvas-半径弧度算坐标");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // 初始化参数
    this.圆心 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
    };
    this.半径 = 275;
    this.顶点弧度 = 0;
    this.顶点半径 = 8;
    this.是否拖拽中 = false;
    this.鼠标悬停在顶点上 = false;
    this.最后鼠标位置 = null;

    // 绑定事件
    this.绑定事件();

    // 开始绘制循环
    this.绘制();
  }

  绑定事件() {
    this.canvas.addEventListener("mousedown", this.鼠标按下.bind(this));
    this.canvas.addEventListener("mousemove", this.鼠标移动.bind(this));
    this.canvas.addEventListener("mouseup", this.鼠标松开.bind(this));
    this.canvas.addEventListener("mouseleave", this.鼠标离开.bind(this));
  }

  鼠标按下(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * this.dpr) / this.dpr;
    const y = ((e.clientY - rect.top) * this.dpr) / this.dpr;

    // 检查是否点击在顶点上
    const 顶点坐标 = this.计算顶点坐标();
    const 距离 = Math.sqrt((x - 顶点坐标.x) ** 2 + (y - 顶点坐标.y) ** 2);

    if (距离 <= this.顶点半径) {
      this.是否拖拽中 = true;
    }
  }

  鼠标移动(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * this.dpr) / this.dpr;
    const y = ((e.clientY - rect.top) * this.dpr) / this.dpr;

    // 记录鼠标位置
    this.最后鼠标位置 = { x, y };

    // 检查鼠标是否悬停在顶点上
    const 顶点坐标 = this.计算顶点坐标();
    const 距离 = Math.sqrt((x - 顶点坐标.x) ** 2 + (y - 顶点坐标.y) ** 2);
    this.鼠标悬停在顶点上 = 距离 <= this.顶点半径;

    if (this.是否拖拽中) {
      // 计算新的弧度
      const dx = x - this.圆心.x;
      const dy = y - this.圆心.y;
      this.顶点弧度 = Math.atan2(dy, dx);
    }

    // 重新绘制
    this.绘制();
  }

  鼠标松开() {
    this.是否拖拽中 = false;

    // 松开鼠标后立即检查鼠标是否还在顶点上
    const 顶点坐标 = this.计算顶点坐标();
    const 鼠标位置 = this.获取鼠标位置();
    if (鼠标位置) {
      const 距离 = Math.sqrt((鼠标位置.x - 顶点坐标.x) ** 2 + (鼠标位置.y - 顶点坐标.y) ** 2);
      this.鼠标悬停在顶点上 = 距离 <= this.顶点半径;
      // 立即重新绘制以更新顶点颜色
      this.绘制();
    }
  }

  鼠标离开() {
    this.是否拖拽中 = false;
  }

  计算顶点坐标() {
    return {
      x: this.圆心.x + this.半径 * Math.cos(this.顶点弧度),
      y: this.圆心.y + this.半径 * Math.sin(this.顶点弧度),
    };
  }

  获取鼠标位置() {
    // 返回最后一次记录的鼠标位置
    return this.最后鼠标位置;
  }

  绘制提示() {
    this.ctx.save();
    this.ctx.font = "20px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "#ccc";
    this.ctx.fillText("拖拽顶点", this.canvas.offsetWidth / 2, 40);
    this.ctx.restore();
  }

  绘制圆() {
    this.ctx.save();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "#5af3";
    this.ctx.beginPath();
    this.ctx.arc(this.圆心.x, this.圆心.y, this.半径, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.restore();
  }

  绘制圆心() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.圆心.x, this.圆心.y, 7, 0, 2 * Math.PI);
    this.ctx.fillStyle = "#aaa";
    this.ctx.fill();
    this.ctx.restore();
  }

  绘制顶点() {
    this.ctx.save();
    const 顶点坐标 = this.计算顶点坐标();

    this.ctx.beginPath();
    this.ctx.arc(顶点坐标.x, 顶点坐标.y, this.顶点半径, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.鼠标悬停在顶点上 || this.是否拖拽中 ? "gold" : "rgb(134, 94, 0)";
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.restore();
  }

  绘制连线() {
    this.ctx.save();
    const 顶点坐标 = this.计算顶点坐标();

    // 黑白相间的虚线
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([10, 10]);
    this.ctx.strokeStyle = "#0008";
    this.ctx.beginPath();
    this.ctx.moveTo(this.圆心.x, this.圆心.y);
    this.ctx.lineTo(顶点坐标.x, 顶点坐标.y);
    this.ctx.stroke();

    this.ctx.lineDashOffset = 10;
    this.ctx.strokeStyle = "#fff8";
    this.ctx.stroke();

    this.ctx.restore();
  }

  绘制坐标示意线() {
    this.ctx.save();
    const 顶点坐标 = this.计算顶点坐标();

    // 横坐标示意线（绿色+透明虚线）
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeStyle = "lightgreen";
    this.ctx.beginPath();
    this.ctx.moveTo(this.圆心.x, 顶点坐标.y);
    this.ctx.lineTo(顶点坐标.x, 顶点坐标.y);
    this.ctx.stroke();

    // 纵坐标示意线（蓝色+透明虚线）
    this.ctx.strokeStyle = "lightblue";
    this.ctx.beginPath();
    this.ctx.moveTo(this.圆心.x, this.圆心.y);
    this.ctx.lineTo(this.圆心.x, 顶点坐标.y);
    this.ctx.stroke();

    this.ctx.restore();
  }

  绘制公式文本() {
    this.ctx.save();
    const 顶点坐标 = this.计算顶点坐标();

    this.ctx.font = "14px 'Google Sans Code', 'Consolas', sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // 根据顶点位置动态调整文本显示位置
    const 顶点在圆心上方 = 顶点坐标.y <= this.圆心.y;
    const 横坐标示意线在圆心左方 = 顶点坐标.x <= this.圆心.x;

    // 横坐标公式文本
    const 横坐标文本 = "Math.Cos(弧度) × 半径";
    const 横坐标文本Y = 顶点在圆心上方 ? 顶点坐标.y - 30 : 顶点坐标.y + 30;
    const 横坐标文本X = (this.圆心.x + 顶点坐标.x) / 2;

    // 绘制横坐标文本的圆角矩形底色
    this.ctx.save();
    this.ctx.fillStyle = "#ffffff1a";
    this.ctx.lineWidth = 1;

    // 测量文本尺寸
    const 横坐标文本尺寸 = this.ctx.measureText(横坐标文本);
    const 横坐标矩形宽度 = 横坐标文本尺寸.width + 20; // 左右各10px内边距
    const 横坐标矩形高度 = 横坐标文本尺寸.actualBoundingBoxAscent + 横坐标文本尺寸.actualBoundingBoxDescent + 15; // 上下各5px内边距

    // 绘制圆角矩形
    this.ctx.beginPath();
    this.ctx.roundRect(
      横坐标文本X - 横坐标矩形宽度 / 2,
      横坐标文本Y - 横坐标矩形高度 / 2,
      横坐标矩形宽度,
      横坐标矩形高度,
      7,
    );
    this.ctx.fill();
    this.ctx.restore();

    // 绘制横坐标文本
    this.ctx.fillStyle = "#90ee90cc";
    this.ctx.fillText(横坐标文本, 横坐标文本X, 横坐标文本Y);

    // 纵坐标公式文本
    const 纵坐标文本 = "Math.Sin(弧度) × 半径";
    const 纵坐标文本X = 横坐标示意线在圆心左方 ? this.圆心.x + 20 : this.圆心.x - 20;
    const 纵坐标文本Y = (this.圆心.y + 顶点坐标.y) / 2;

    // 绘制纵坐标文本的圆角矩形底色
    this.ctx.save();
    this.ctx.fillStyle = "#ffffff1a";
    this.ctx.lineWidth = 1;

    // 测量文本尺寸
    const 纵坐标文本尺寸 = this.ctx.measureText(纵坐标文本);
    const 纵坐标矩形宽度 = 纵坐标文本尺寸.width + 20; // 左右各10px内边距
    const 纵坐标矩形高度 = 纵坐标文本尺寸.actualBoundingBoxAscent + 纵坐标文本尺寸.actualBoundingBoxDescent + 15; // 上下各5px内边距

    // 绘制圆角矩形
    this.ctx.beginPath();
    this.ctx.roundRect(
      纵坐标文本X - (横坐标示意线在圆心左方 ? 0 : 纵坐标矩形宽度),
      纵坐标文本Y - 纵坐标矩形高度 / 2,
      纵坐标矩形宽度,
      纵坐标矩形高度,
      7,
    );
    this.ctx.fill();
    this.ctx.restore();

    // 绘制纵坐标文本
    this.ctx.fillStyle = "#add8e6cc";
    this.ctx.textAlign = 横坐标示意线在圆心左方 ? "left" : "right";
    this.ctx.fillText(纵坐标文本, 纵坐标文本X + (this.ctx.textAlign === "left" ? 10 : -10), 纵坐标文本Y);

    this.ctx.restore();
  }

  绘制() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制各个元素
    this.绘制提示();
    this.绘制圆();
    this.绘制连线();
    this.绘制坐标示意线();
    this.绘制公式文本();
    this.绘制顶点();
    this.绘制圆心();
  }
}

new 半径弧度算坐标();

class 正六边形范例 {
  constructor() {
    this.canvas = document.getElementById("canvas-正六边形");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.正多边形 = {
      圆心: {
        x: this.canvas.offsetWidth / 2,
        y: this.canvas.offsetHeight / 2,
      },
      半径: 150,
      起始弧度: -Math.PI / 2,
      顶点数量: 6,
      顶点坐标组: [],
    };

    requestAnimationFrame(this.绘制全部.bind(this));
  }

  绘制圆周() {
    this.ctx.save();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "#5af3";
    this.ctx.beginPath();
    this.ctx.arc(this.正多边形.圆心.x, this.正多边形.圆心.y, this.正多边形.半径, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.restore();
  }

  绘制圆心() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.正多边形.圆心.x, this.正多边形.圆心.y, 7, 0, 2 * Math.PI);
    this.ctx.fillStyle = "#aaa";
    this.ctx.fill();
    this.ctx.restore();
  }

  初始化多边形顶点() {
    this.正多边形.顶点坐标组 = [];
    const 弧度偏移量 = (2 * Math.PI) / this.正多边形.顶点数量;
    for (let i = 0; i < this.正多边形.顶点数量; i++) {
      const 顶点弧度 = this.正多边形.起始弧度 + i * 弧度偏移量;
      const 顶点坐标 = {
        x: this.正多边形.圆心.x + this.正多边形.半径 * Math.cos(顶点弧度),
        y: this.正多边形.圆心.y + this.正多边形.半径 * Math.sin(顶点弧度),
      };
      this.正多边形.顶点坐标组.push(顶点坐标);
    }
  }

  绘制多边形() {
    this.ctx.save();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "lightskyblue";
    this.ctx.fillStyle = "#87cefa25";
    this.ctx.beginPath();

    // 移动到第一个顶点
    this.ctx.moveTo(this.正多边形.顶点坐标组[0].x, this.正多边形.顶点坐标组[0].y);

    // 连接所有顶点
    for (let i = 1; i < this.正多边形.顶点坐标组.length; i++) {
      this.ctx.lineTo(this.正多边形.顶点坐标组[i].x, this.正多边形.顶点坐标组[i].y);
    }

    // 闭合路径
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }

  绘制顶点() {
    this.ctx.save();
    this.ctx.lineWidth = 2;

    for (let i = 0; i < this.正多边形.顶点坐标组.length; i++) {
      const 顶点坐标 = this.正多边形.顶点坐标组[i];

      this.ctx.beginPath();
      this.ctx.arc(顶点坐标.x, 顶点坐标.y, 5, 0, Math.PI * 2);
      this.ctx.fillStyle = "gold";
      this.ctx.fill();
      this.ctx.strokeStyle = "#fff";
      this.ctx.stroke();

      // 绘制顶点索引
      this.ctx.font = "14px 'Google Sans Code', 'Consolas', sans-serif";
      this.ctx.fillStyle = "#fffa";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";

      this.绘制索引(i);
    }

    this.ctx.restore();
  }

  绘制索引(i) {
    const 索引偏移距离 = 20;
    const 弧度偏移量 = (2 * Math.PI) / this.正多边形.顶点数量;
    const 顶点弧度 = this.正多边形.起始弧度 + i * 弧度偏移量;
    const 水平偏移 = Math.cos(顶点弧度) * (this.正多边形.半径 + 索引偏移距离);
    const 垂直偏移 = Math.sin(顶点弧度) * (this.正多边形.半径 + 索引偏移距离);
    const 索引坐标 = {
      x: this.正多边形.圆心.x + 水平偏移,
      y: this.正多边形.圆心.y + 垂直偏移,
    };

    this.ctx.fillText(i.toString(), 索引坐标.x, 索引坐标.y);
  }

  绘制全部() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 初始化顶点
    this.初始化多边形顶点();

    // 绘制各个元素
    this.绘制圆周();
    this.绘制多边形();
    this.绘制圆心();
    this.绘制顶点();
  }
}

new 正六边形范例();

class TextAlignmentDemo {
  constructor() {
    this.canvas = document.getElementById("canvas-text");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.cssWidth = this.canvas.offsetWidth;
    this.cssHeight = this.canvas.offsetHeight;

    // 设置canvas尺寸
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // 文本设置
    this.text = "ABgfjpyZ-水平与垂直";
    this.centerX = this.canvas.offsetWidth / 2;
    this.centerY = this.canvas.offsetHeight / 2;

    // 单选框设置
    this.textAlignOptions = ["left", "right", "center", "start", "end"];
    this.textBaselineOptions = ["top", "hanging", "middle", "alphabetic", "ideographic", "bottom"];
    this.selectedTextAlign = "start";
    this.selectedTextBaseline = "alphabetic";

    // 单选框尺寸和位置
    this.radioSize = 12;
    this.radioSpacing = 20;
    this.radioGroupSpacing = 40;

    // 存储单选框坐标和尺寸信息
    this.textAlignRadioBoxes = [];
    this.textBaselineRadioBoxes = [];

    // 跟踪鼠标悬停状态
    this.hoveredTextAlign = null;
    this.hoveredTextBaseline = null;
    this.hoveredCheckbox = false;

    // 复选框设置
    this.showTextCoordinate = true; // 默认选中

    this.init();
  }

  init() {
    this.draw();
    this.addEventListeners();
  }

  draw() {
    // 清空canvas
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);

    // 绘制主文本
    this.ctx.font = "bold 30px 'Consolas', sans-serif";
    this.ctx.fillStyle = "#abc";
    this.ctx.strokeStyle = "firebrick";
    this.ctx.lineWidth = 1;
    this.ctx.textBaseline = this.selectedTextBaseline;
    this.ctx.textAlign = this.selectedTextAlign;

    this.ctx.fillText(this.text, this.centerX, this.centerY);
    this.ctx.strokeText(this.text, this.centerX, this.centerY);

    // 绘制基准线和坐标点
    this.ctx.save();
    this.ctx.strokeStyle = "#4d87";
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.centerY);
    this.ctx.lineTo(this.cssWidth, this.centerY);
    this.ctx.stroke();
    this.ctx.moveTo(this.centerX, this.centerY + 50);
    this.ctx.lineTo(this.centerX, this.centerY - 50);
    this.ctx.stroke();

    // 根据复选框状态决定是否绘制坐标点
    if (this.showTextCoordinate) {
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, 6, 0, Math.PI * 2);
      this.ctx.fillStyle = "gold";
      this.ctx.fill();
    }
    this.ctx.restore();

    // 绘制单选框
    this.drawRadioGroups();
  }

  drawRadioGroups() {
    const startX = 20;
    const startY = 20;

    // 先绘制标题（位置固定）
    this.ctx.font = "14px 微软雅黑, sans-serif";
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillText("水平对齐：", startX, startY);
    this.ctx.fillText("垂直基线：", startX, startY + this.radioGroupSpacing + 10);

    // 设置字体用于测量文本宽度
    this.ctx.font = "14px 'Google Sans Code', 'Consolas', monospace";
    const radioHeight = 30; // 字体大小 + 10 + 5

    // 清空存储的单选框信息
    this.textAlignRadioBoxes = [];
    this.textBaselineRadioBoxes = [];
    this.checkboxInfo = null;

    // 绘制水平对齐单选框组
    let currentX = startX + 80; // 标题右边开始
    this.textAlignOptions.forEach((option, index) => {
      // 测量当前选项的文本宽度
      const textMetrics = this.ctx.measureText(option);
      const radioWidth = textMetrics.width + 20;

      const x = currentX + radioWidth / 2;
      const y = startY + 7; // 调整Y坐标，让文本在单选框中心

      // 记录单选框坐标和尺寸信息
      this.textAlignRadioBoxes.push({
        option: option,
        x: currentX,
        y: y - radioHeight / 2,
        width: radioWidth,
        height: radioHeight,
      });

      // 如果选中，先绘制背景矩形
      if (option === this.selectedTextAlign) {
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        this.ctx.fillRect(currentX, y - radioHeight / 2, radioWidth, radioHeight);
      }
      // 如果悬停，绘制悬停背景
      else if (option === this.hoveredTextAlign) {
        this.ctx.fillStyle = "#fff2";
        this.ctx.fillRect(currentX, y - radioHeight / 2, radioWidth, radioHeight);
      }

      // 绘制边框
      this.ctx.strokeStyle = "#888";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(currentX, y - radioHeight / 2, radioWidth, radioHeight);

      // 绘制文本
      this.ctx.fillStyle = option === this.selectedTextAlign ? "white" : "#aaa";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(option, x, y);

      // 更新下一个单选框的起始位置（无空隙）
      currentX += radioWidth;
    });

    // 绘制垂直基线单选框组
    currentX = startX + 80; // 标题右边开始
    this.textBaselineOptions.forEach((option, index) => {
      // 测量当前选项的文本宽度
      const textMetrics = this.ctx.measureText(option);
      const radioWidth = textMetrics.width + 20;

      const x = currentX + radioWidth / 2;
      const y = startY + this.radioGroupSpacing + 17; // 调整Y坐标，让文本在单选框中心

      // 记录单选框坐标和尺寸信息
      this.textBaselineRadioBoxes.push({
        option: option,
        x: currentX,
        y: y - radioHeight / 2,
        width: radioWidth,
        height: radioHeight,
      });

      // 如果选中，先绘制背景矩形
      if (option === this.selectedTextBaseline) {
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        this.ctx.fillRect(currentX, y - radioHeight / 2, radioWidth, radioHeight);
      }
      // 如果悬停，绘制悬停背景
      else if (option === this.hoveredTextBaseline) {
        this.ctx.fillStyle = "#fff1";
        this.ctx.fillRect(currentX, y - radioHeight / 2, radioWidth, radioHeight);
      }

      // 绘制边框
      this.ctx.strokeStyle = "#888";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(currentX, y - radioHeight / 2, radioWidth, radioHeight);

      // 绘制文本
      this.ctx.fillStyle = option === this.selectedTextBaseline ? "white" : "#aaa";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(option, x, y);

      // 更新下一个单选框的起始位置（无空隙）
      currentX += radioWidth;
    });

    // 绘制复选框
    const checkboxY = startY + this.radioGroupSpacing + 60;
    const checkboxSize = 16;
    const checkboxX = startX;

    // 如果悬停，绘制悬停背景
    if (this.hoveredCheckbox) {
      this.ctx.fillStyle = "#fff1";
      this.ctx.fillRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
    }

    // 绘制复选框边框
    this.ctx.strokeStyle = "#888";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(checkboxX, checkboxY, checkboxSize, checkboxSize);

    // 如果选中，绘制勾选标记
    if (this.showTextCoordinate) {
      // 绘制打勾
      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(checkboxX + 3, checkboxY + 8);
      this.ctx.lineTo(checkboxX + 7, checkboxY + 12);
      this.ctx.lineTo(checkboxX + 13, checkboxY + 5);
      this.ctx.stroke();
    }

    // 绘制复选框文本
    this.ctx.font = "14px 微软雅黑, sans-serif";
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillText("显示文本坐标", checkboxX + checkboxSize + 8, checkboxY + 2);

    // 记录复选框信息（包括文本区域）
    this.checkboxInfo = {
      x: checkboxX,
      y: checkboxY,
      width: checkboxSize + 8 + this.ctx.measureText("显示文本坐标").width, // 复选框 + 间距 + 文本宽度
      height: checkboxSize,
    };
  }

  addEventListeners() {
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 检查水平对齐单选框点击
      this.textAlignRadioBoxes.forEach((radioBox) => {
        if (
          x >= radioBox.x &&
          x <= radioBox.x + radioBox.width &&
          y >= radioBox.y &&
          y <= radioBox.y + radioBox.height
        ) {
          this.selectedTextAlign = radioBox.option;
          this.draw();
          return;
        }
      });

      // 检查垂直基线单选框点击
      this.textBaselineRadioBoxes.forEach((radioBox) => {
        if (
          x >= radioBox.x &&
          x <= radioBox.x + radioBox.width &&
          y >= radioBox.y &&
          y <= radioBox.y + radioBox.height
        ) {
          this.selectedTextBaseline = radioBox.option;
          this.draw();
          return;
        }
      });

      // 检查复选框点击
      if (
        this.checkboxInfo &&
        x >= this.checkboxInfo.x &&
        x <= this.checkboxInfo.x + this.checkboxInfo.width &&
        y >= this.checkboxInfo.y &&
        y <= this.checkboxInfo.y + this.checkboxInfo.height
      ) {
        this.showTextCoordinate = !this.showTextCoordinate;
        this.draw();
        return;
      }
    });

    // 添加鼠标移动事件监听器
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let isOverRadioBox = false;
      let newHoveredTextAlign = null;
      let newHoveredTextBaseline = null;
      let newHoveredCheckbox = false;

      // 检查是否在水平对齐单选框上
      this.textAlignRadioBoxes.forEach((radioBox) => {
        if (
          x >= radioBox.x &&
          x <= radioBox.x + radioBox.width &&
          y >= radioBox.y &&
          y <= radioBox.y + radioBox.height
        ) {
          isOverRadioBox = true;
          newHoveredTextAlign = radioBox.option;
        }
      });

      // 检查是否在垂直基线单选框上
      this.textBaselineRadioBoxes.forEach((radioBox) => {
        if (
          x >= radioBox.x &&
          x <= radioBox.x + radioBox.width &&
          y >= radioBox.y &&
          y <= radioBox.y + radioBox.height
        ) {
          isOverRadioBox = true;
          newHoveredTextBaseline = radioBox.option;
        }
      });

      // 检查是否在复选框上
      if (
        this.checkboxInfo &&
        x >= this.checkboxInfo.x &&
        x <= this.checkboxInfo.x + this.checkboxInfo.width &&
        y >= this.checkboxInfo.y &&
        y <= this.checkboxInfo.y + this.checkboxInfo.height
      ) {
        newHoveredCheckbox = true;
      }

      // 更新悬停状态
      if (
        this.hoveredTextAlign !== newHoveredTextAlign ||
        this.hoveredTextBaseline !== newHoveredTextBaseline ||
        this.hoveredCheckbox !== newHoveredCheckbox
      ) {
        this.hoveredTextAlign = newHoveredTextAlign;
        this.hoveredTextBaseline = newHoveredTextBaseline;
        this.hoveredCheckbox = newHoveredCheckbox;
        this.draw(); // 重新绘制以显示悬停效果
      }

      // 设置光标样式
      if (isOverRadioBox || newHoveredCheckbox) {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
      } else {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
      }
    });
  }
}

// 初始化应用
new TextAlignmentDemo();

const canvas_clear = document.getElementById("canvas-clearRect");
const ctx_clear = canvas_clear.getContext("2d");
const dpr_clear = window.devicePixelRatio || 1;
canvas_clear.width = canvas_clear.offsetWidth * dpr_clear;
canvas_clear.height = canvas_clear.offsetHeight * dpr_clear;
ctx_clear.scale(dpr_clear, dpr_clear);
ctx_clear.fillStyle = "darkgreen";
ctx_clear.strokeStyle = "gold";
const 清空演示半径 = 100;
const 清空演示圆心 = {
  x: canvas_clear.offsetWidth / 2,
  y: canvas_clear.offsetHeight / 2,
};
ctx_clear.arc(清空演示圆心.x, 清空演示圆心.y, 清空演示半径, 0, 2 * Math.PI);
ctx_clear.fill();
ctx_clear.stroke();
ctx_clear.clearRect(
  清空演示圆心.x,
  清空演示圆心.y,
  清空演示半径 + ctx_clear.lineWidth,
  清空演示半径 + ctx_clear.lineWidth,
);
ctx_clear.setLineDash([10, 5]);
ctx_clear.strokeStyle = "white";
ctx_clear.strokeRect(
  清空演示圆心.x,
  清空演示圆心.y,
  清空演示半径 + ctx_clear.lineWidth,
  清空演示半径 + ctx_clear.lineWidth,
);

class ClosePathDemo {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.isClosePathEnabled = true;

    this.initCanvas();
    this.createCheckbox();
    this.draw();
  }

  initCanvas() {
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  createCheckbox() {
    // 设置复选框的位置和尺寸
    this.checkboxX = 10;
    this.checkboxY = 10;
    this.checkboxSize = 16;
    this.checkboxPadding = 8;
    this.isHovered = false;

    // 绑定鼠标点击事件
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
      const y = ((e.clientY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

      // 检查是否点击在复选框区域
      const checkboxAreaWidth = this.checkboxSize + this.checkboxPadding * 2 + 60; // 60是文字宽度估算
      const checkboxAreaHeight = this.checkboxSize + this.checkboxPadding * 2;

      if (
        x >= this.checkboxX &&
        x <= this.checkboxX + checkboxAreaWidth &&
        y >= this.checkboxY &&
        y <= this.checkboxY + checkboxAreaHeight
      ) {
        this.isClosePathEnabled = !this.isClosePathEnabled;
        this.draw();
      }
    });

    // 绑定鼠标移动事件来检测悬停
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
      const y = ((e.clientY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

      // 检查是否悬停在复选框区域
      const checkboxAreaWidth = this.checkboxSize + this.checkboxPadding * 2 + 60;
      const checkboxAreaHeight = this.checkboxSize + this.checkboxPadding * 2;

      const wasHovered = this.isHovered;
      this.isHovered =
        x >= this.checkboxX &&
        x <= this.checkboxX + checkboxAreaWidth &&
        y >= this.checkboxY &&
        y <= this.checkboxY + checkboxAreaHeight;

      // 如果悬停状态改变，重新绘制
      if (wasHovered !== this.isHovered) {
        this.draw();
      }
    });

    // 绑定鼠标离开事件
    this.canvas.addEventListener("mouseleave", () => {
      if (this.isHovered) {
        this.isHovered = false;
        this.draw();
      }
    });
  }

  draw() {
    // 清除画布
    this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);

    // 绘制复选框
    this.drawCheckbox();

    // 设置样式
    this.ctx.fillStyle = "darkgreen";
    this.ctx.strokeStyle = "gold";
    this.ctx.lineWidth = 2;

    // 开始路径
    this.ctx.beginPath();
    this.ctx.moveTo(200, 200);
    this.ctx.lineTo(350, 100);
    this.ctx.lineTo(500, 250);

    // 根据复选框状态决定是否闭合路径
    if (this.isClosePathEnabled) {
      this.ctx.closePath();
    }

    // 填充和描边
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawCheckbox() {
    // 保存当前状态
    this.ctx.save();

    // 根据状态确定颜色
    let fillColor, strokeColor;

    if (this.isClosePathEnabled) {
      // 选中状态
      if (this.isHovered) {
        fillColor = "#3E8D42"; // 悬停时的绿色填充
        strokeColor = "#3E8D42"; // 悬停时的深绿色边框
      } else {
        fillColor = "#2E7D32"; // 选中时的绿色填充
        strokeColor = "#2E7D32"; // 选中时的深绿色边框
      }
    } else {
      // 未选中状态
      if (this.isHovered) {
        fillColor = "#fff2"; // 悬停时的浅灰色填充
        strokeColor = "#aaa"; // 悬停时的灰色边框
      } else {
        fillColor = "transparent"; // 未选中时透明填充
        strokeColor = "#888"; // 未选中时的灰色边框
      }
    }

    // 绘制复选框填充
    if (fillColor !== "transparent") {
      this.ctx.fillStyle = fillColor;
      this.ctx.fillRect(
        this.checkboxX + this.checkboxPadding,
        this.checkboxY + this.checkboxPadding,
        this.checkboxSize,
        this.checkboxSize,
      );
    }

    // 绘制复选框边框
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      this.checkboxX + this.checkboxPadding,
      this.checkboxY + this.checkboxPadding,
      this.checkboxSize,
      this.checkboxSize,
    );

    // 如果选中，绘制对勾
    if (this.isClosePathEnabled) {
      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(
        this.checkboxX + this.checkboxPadding + 3,
        this.checkboxY + this.checkboxPadding + this.checkboxSize / 2,
      );
      this.ctx.lineTo(
        this.checkboxX + this.checkboxPadding + this.checkboxSize / 2,
        this.checkboxY + this.checkboxPadding + this.checkboxSize - 3,
      );
      this.ctx.lineTo(
        this.checkboxX + this.checkboxPadding + this.checkboxSize - 3,
        this.checkboxY + this.checkboxPadding + 3,
      );
      this.ctx.stroke();
    }

    // 绘制文字
    this.ctx.fillStyle = "white";
    this.ctx.font = "16px sans-serif";
    this.ctx.fillText(
      "闭合路径",
      this.checkboxX + this.checkboxPadding + this.checkboxSize + 8,
      this.checkboxY + this.checkboxPadding + this.checkboxSize - 2,
    );

    // 恢复状态
    this.ctx.restore();
  }
}

// 创建实例
new ClosePathDemo("canvas-closePath");
