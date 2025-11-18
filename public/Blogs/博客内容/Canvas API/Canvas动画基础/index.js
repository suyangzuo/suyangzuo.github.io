class SpeedControlAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;

    // 设置Canvas尺寸
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // 旋转小球动画参数
    this.lastTime = 0;
    this.rotationAngle = 0;
    this.rotationSpeed = 300; // 度/秒，默认速度

    // 小球参数
    this.ballRadius = 15;
    this.orbitRadius = 80;
    this.centerX = this.canvas.offsetWidth / 2;
    this.centerY = this.canvas.offsetHeight / 2;

    // 滑块参数
    this.sliderWidth = 200;
    this.sliderHeight = 20;
    this.sliderX = 100;
    this.sliderY = this.canvas.offsetHeight - 60;
    this.sliderMin = 100;
    this.sliderMax = 1000;
    this.sliderStep = 50;
    this.sliderValue = 300;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // 绑定事件
    this.bindEvents();

    // 启动动画
    this.start();
  }

  // 绘制旋转小球
  drawRotatingBall() {
    // 清除画布
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);

    // 绘制轨道
    this.ctx.strokeStyle = "#444";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.orbitRadius, 0, Math.PI * 2);
    this.ctx.stroke();

    // 计算小球位置
    const ballX = this.centerX + this.orbitRadius * Math.cos((this.rotationAngle * Math.PI) / 180);
    const ballY = this.centerY + this.orbitRadius * Math.sin((this.rotationAngle * Math.PI) / 180);

    // 绘制小球
    this.ctx.fillStyle = "#ff6b6b";
    this.ctx.beginPath();
    this.ctx.arc(ballX, ballY, this.ballRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制小球边框
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  // 绘制滑块
  drawSlider() {
    // 绘制"旋转速度"文字
    this.ctx.fillStyle = "silver";
    this.ctx.font = "16px sans-serif";
    this.ctx.textAlign = "right";
    this.ctx.fillText("旋转速度", this.sliderX - 15, this.sliderY + 15);

    // 绘制滑块轨道
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(this.sliderX, this.sliderY, this.sliderWidth, this.sliderHeight);

    // 计算滑块位置
    const sliderProgress = (this.sliderValue - this.sliderMin) / (this.sliderMax - this.sliderMin);
    const sliderPosX = this.sliderX + sliderProgress * this.sliderWidth;

    // 绘制已滑过的部分
    this.ctx.fillStyle = "#4CAF50";
    this.ctx.fillRect(this.sliderX, this.sliderY, sliderPosX - this.sliderX, this.sliderHeight);

    // 检查鼠标是否在滑块上
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = ((this.lastMouseX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
    const mouseY = ((this.lastMouseY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

    const isHovering =
      mouseX >= sliderPosX - 5 &&
      mouseX <= sliderPosX + 5 &&
      mouseY >= this.sliderY - 5 &&
      mouseY <= this.sliderY + this.sliderHeight + 5;

    // 绘制滑块（根据悬停状态或拖拽状态改变样式）
    if (isHovering || this.isDragging) {
      this.ctx.fillStyle = "#ffd700"; // 悬停或拖拽时变为金色
      this.ctx.shadowColor = "#ffd700";
      this.ctx.shadowBlur = 10;
    } else {
      this.ctx.fillStyle = "#fff";
      this.ctx.shadowBlur = 0;
    }

    this.ctx.fillRect(sliderPosX - 5, this.sliderY - 5, 10, this.sliderHeight + 10);
    this.ctx.strokeStyle = isHovering || this.isDragging ? "#ffb700" : "#666";
    this.ctx.lineWidth = isHovering || this.isDragging ? 2 : 1;
    this.ctx.strokeRect(sliderPosX - 5, this.sliderY - 5, 10, this.sliderHeight + 10);

    // 重置阴影
    this.ctx.shadowBlur = 0;

    // 绘制数值
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.font = "16px 'JetBrains Mono', Consolas, monospace";
    this.ctx.textAlign = "left";
    this.ctx.fillText(this.sliderValue, this.sliderX + this.sliderWidth + 15, this.sliderY + 15);
  }

  // 动画循环
  animate(currentTime) {
    // 计算时间差（毫秒转换为秒）
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // 基于时间计算旋转角度
    const angleChange = this.rotationSpeed * deltaTime;
    this.rotationAngle += angleChange;

    // 保持角度在0-360度范围内
    if (this.rotationAngle >= 360) {
      this.rotationAngle -= 360;
    }

    // 绘制动画
    this.drawRotatingBall();
    this.drawSlider();

    requestAnimationFrame(this.animate.bind(this));
  }

  // 处理鼠标按下事件
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
    const y = ((e.clientY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

    // 检查是否点击在滑块上
    const sliderProgress = (this.sliderValue - this.sliderMin) / (this.sliderMax - this.sliderMin);
    const sliderPosX = this.sliderX + sliderProgress * this.sliderWidth;

    if (
      x >= sliderPosX - 5 &&
      x <= sliderPosX + 5 &&
      y >= this.sliderY - 5 &&
      y <= this.sliderY + this.sliderHeight + 5
    ) {
      this.isDragging = true;
    }
  }

  // 处理鼠标移动事件
  handleMouseMove(e) {
    // 更新鼠标位置
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    if (this.isDragging) {
      const rect = this.canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;

      // 计算新的滑块值
      let newValue = ((x - this.sliderX) / this.sliderWidth) * (this.sliderMax - this.sliderMin) + this.sliderMin;
      newValue = Math.max(this.sliderMin, Math.min(this.sliderMax, newValue));

      // 按步进值调整
      this.sliderValue = Math.round(newValue / this.sliderStep) * this.sliderStep;

      // 更新旋转速度
      this.rotationSpeed = this.sliderValue;
    }

    // 检查鼠标是否在滑块上并更新鼠标样式
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
    const mouseY = ((e.clientY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

    const sliderProgress = (this.sliderValue - this.sliderMin) / (this.sliderMax - this.sliderMin);
    const sliderPosX = this.sliderX + sliderProgress * this.sliderWidth;

    const isHovering =
      mouseX >= sliderPosX - 5 &&
      mouseX <= sliderPosX + 5 &&
      mouseY >= this.sliderY - 5 &&
      mouseY <= this.sliderY + this.sliderHeight + 5;

    if (isHovering || this.isDragging) {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
    } else {
      this.canvas.style.cursor = "default";
    }
  }

  // 处理鼠标松开事件
  handleMouseUp() {
    this.isDragging = false;
  }

  // 处理鼠标离开事件
  handleMouseLeave() {
    this.canvas.style.cursor = "default";
  }

  // 绑定事件
  bindEvents() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
  }

  // 启动动画
  start() {
    requestAnimationFrame(this.animate.bind(this));
  }
}

// 创建动画实例
const speedControlAnimation = new SpeedControlAnimation("canvas-speed-control");

class DeltaTimeAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;

    // 设置Canvas尺寸
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // 动画参数
    this.lastTime = 0;
    this.currentTime = 0;
    this.ballX = 50;
    this.currentTimeBarX = 50;
    this.lastTimeBarX = 50;
    this.ballY = this.canvas.offsetHeight / 2;
    this.currentTimeBarY = this.ballY - 40;
    this.lastTimeBarY = this.ballY + 40;
    this.barWidth = 20;
    this.barHeight = 8;
    this.ballRadius = 12;

    // 动画状态控制
    this.animationPhase = 0; // 0: 移动, 1: 停顿, 2: 显示时间差, 3: currentTime进度条移动, 4: 等待下一次移动
    this.phaseStartTime = 0;
    this.moveStep = 0; // 当前移动步数 (0-7)
    this.totalSteps = 8;
    this.stepDistance = (this.canvas.offsetWidth - 100) / this.totalSteps;

    // 时间差显示相关
    this.deltaTimeDisplay = 0;
    this.deltaTimeBarWidth = 0;
    this.lastTimeStartX = 50; // 保存lastTime移动的起始位置
    this.lineGrowthStartTime = 0; // 竖线增长开始时间
    this.lineGrowthProgress = 0; // 竖线增长进度

    // 动画控制
    this.isRunning = true;

    // 启动动画
    this.start();
  }

  // 动画循环
  animate(currentTimestamp) {
    if (!this.isRunning) return;

    // 清除画布
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);

    // 更新currentTime
    this.currentTime = currentTimestamp;

    // 根据动画阶段执行不同逻辑
    this.updateAnimationPhase(currentTimestamp);
    this.drawAnimation();

    requestAnimationFrame(this.animate.bind(this));
  }

  // 更新动画阶段
  updateAnimationPhase(currentTimestamp) {
    switch (this.animationPhase) {
      case 0: // 移动阶段
        if (currentTimestamp - this.phaseStartTime > 0) {
          // 计算350ms内的移动进度
          const progress = Math.min((currentTimestamp - this.phaseStartTime) / 350, 1);
          const startX = 50 + this.moveStep * this.stepDistance;
          const endX = 50 + (this.moveStep + 1) * this.stepDistance;
          this.ballX = startX + (endX - startX) * progress;
          this.currentTimeBarX = this.ballX;

          // 检查是否到达下一个停顿点
          if (progress >= 1) {
            this.ballX = endX;
            this.currentTimeBarX = this.ballX;
            this.moveStep++;
            // 无论是否是最后一步，都进入停顿阶段显示时间差
            this.animationPhase = 1;
            this.phaseStartTime = currentTimestamp;
          }
        }
        break;

      case 1: // 停顿0.15秒
        if (currentTimestamp - this.phaseStartTime >= 150) {
          this.animationPhase = 2;
          this.phaseStartTime = currentTimestamp;
          // 计算时间差：当前时间减去lastTime更新时的时间
          this.deltaTimeDisplay = (this.currentTime - this.lastTime) / 1000;
          this.deltaTimeBarWidth = Math.min(this.deltaTimeDisplay * 200, 150); // 将时间差转换为视觉长度
        }
        break;

      case 2: // 竖线增长0.25秒 + 显示时间差1.75秒
        if (this.lineGrowthStartTime === 0) {
          this.lineGrowthStartTime = currentTimestamp;
        }

        // 计算竖线增长进度
        const lineGrowthTime = currentTimestamp - this.lineGrowthStartTime;
        if (lineGrowthTime < 250) {
          // 竖线增长阶段
          this.lineGrowthProgress = lineGrowthTime / 250;
        } else {
          // 竖线增长完成，显示时间差
          this.lineGrowthProgress = 1;
          if (currentTimestamp - this.phaseStartTime >= 2000) {
            this.lastTimeStartX = this.lastTimeBarX; // 保存起始位置
            this.animationPhase = 3;
            this.phaseStartTime = currentTimestamp;
            this.lineGrowthStartTime = 0; // 重置
            this.lineGrowthProgress = 0; // 重置
          }
        }
        break;

      case 3: // lastTime进度条移动0.35秒
        if (currentTimestamp - this.phaseStartTime >= 350) {
          this.lastTimeBarX = this.currentTimeBarX;
          // 更新lastTime为当前时间，这样下次计算时间差时就是正确的间隔
          this.lastTime = this.currentTime;
          // 检查是否是最后一步
          if (this.moveStep >= this.totalSteps) {
            // 最后一步完成，进入重置等待阶段
            this.animationPhase = 4;
            this.phaseStartTime = currentTimestamp;
          } else {
            // 不是最后一步，进入下一次移动等待阶段
            this.animationPhase = 4;
            this.phaseStartTime = currentTimestamp;
          }
        } else {
          // 计算过渡进度
          const progress = (currentTimestamp - this.phaseStartTime) / 350;
          const endX = this.currentTimeBarX;
          this.lastTimeBarX = this.lastTimeStartX + (endX - this.lastTimeStartX) * progress;
        }
        break;

      case 4: // 等待1秒后开始下一次移动
        if (currentTimestamp - this.phaseStartTime >= 1000) {
          if (this.moveStep >= this.totalSteps) {
            // 重新开始整个循环
            this.moveStep = 0;
            this.ballX = 50;
            this.currentTimeBarX = 50;
            this.lastTimeBarX = 50;
            // lastTime已经在阶段3更新，这里不需要重复更新
          }
          this.animationPhase = 0;
          this.phaseStartTime = currentTimestamp;
        }
        break;
    }
  }

  // 绘制动画
  drawAnimation() {
    this.drawStepIndicators();
    this.drawProgressBars();
    this.drawDeltaTimeLines();
    this.drawLabels();
  }

  // 绘制步骤指示器
  drawStepIndicators() {
    this.ctx.fillStyle = "#666";
    for (let i = 0; i <= this.totalSteps; i++) {
      const x = 50 + i * this.stepDistance;
      // 刻度放在两个进度条之间的垂直居中位置
      const scaleY = (this.currentTimeBarY + this.lastTimeBarY + this.barHeight) / 2;
      this.ctx.fillRect(x - 1, scaleY, 2, 10);
    }
  }

  // 绘制进度条
  drawProgressBars() {
    // 绘制currentTime进度条
    this.ctx.fillStyle = "#4CAF50";
    this.ctx.fillRect(50, this.currentTimeBarY, this.currentTimeBarX - 50, this.barHeight);
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(50, this.currentTimeBarY, this.currentTimeBarX - 50, this.barHeight);

    // 绘制lastTime进度条
    this.ctx.fillStyle = "#2196F3";
    this.ctx.fillRect(50, this.lastTimeBarY, this.lastTimeBarX - 50, this.barHeight);
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(50, this.lastTimeBarY, this.lastTimeBarX - 50, this.barHeight);
  }

  // 绘制时间差竖线和填充区域
  drawDeltaTimeLines() {
    if (this.animationPhase === 2) {
      // 绘制竖线
      this.ctx.strokeStyle = "#fff";
      this.ctx.lineWidth = 2;

      // 计算竖线的当前长度
      const currentTimeLineLength = (this.lastTimeBarY - this.currentTimeBarY) * this.lineGrowthProgress;
      const lastTimeLineLength = (this.lastTimeBarY - this.currentTimeBarY) * this.lineGrowthProgress;

      // currentTime竖线：从currentTime进度条上边缘向下增长
      this.ctx.beginPath();
      this.ctx.moveTo(this.currentTimeBarX, this.currentTimeBarY);
      this.ctx.lineTo(this.currentTimeBarX, this.currentTimeBarY + currentTimeLineLength);
      this.ctx.stroke();

      // lastTime竖线：从lastTime进度条下边缘向上增长到currentTime进度条下边缘
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastTimeBarX, this.lastTimeBarY + this.barHeight);
      this.ctx.lineTo(this.lastTimeBarX, this.lastTimeBarY + this.barHeight - lastTimeLineLength);
      this.ctx.stroke();

      // 只有当竖线增长完成时才显示填充区域和文字
      if (this.lineGrowthProgress >= 1) {
        this.drawDeltaTimeFill();
        this.drawDeltaTimeText();
      }
    }
  }

  // 绘制时间差填充区域
  drawDeltaTimeFill() {
    this.ctx.fillStyle = "rgba(255, 152, 0, 0.25)";
    // 上方区域：从currentTime进度条下边缘到lastTime进度条上边缘
    this.ctx.fillRect(
      this.lastTimeBarX,
      this.currentTimeBarY + this.barHeight,
      this.currentTimeBarX - this.lastTimeBarX,
      this.lastTimeBarY - (this.currentTimeBarY + this.barHeight),
    );
    // 下方区域：从lastTime进度条下边缘到currentTime进度条上边缘
    this.ctx.fillRect(
      this.lastTimeBarX,
      this.lastTimeBarY,
      this.currentTimeBarX - this.lastTimeBarX,
      this.currentTimeBarY + this.barHeight - (this.lastTimeBarY + this.barHeight),
    );
  }

  // 绘制时间差文字
  drawDeltaTimeText() {
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "14px JetBrains Mono, Consolas, sans-serif";
    this.ctx.textAlign = "center";
    const textX = (this.currentTimeBarX + this.lastTimeBarX) / 2;
    const textY = (this.currentTimeBarY + this.lastTimeBarY + this.barHeight) / 2 + this.barHeight;
    this.ctx.fillText(`${this.deltaTimeDisplay.toFixed(3)}s`, textX, textY);
  }

  // 绘制标签
  drawLabels() {
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "14px JetBrains Mono, Consolas, sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.fillText("currentTime（内置参数）", 14, this.currentTimeBarY - 13);
    this.ctx.fillText("lastTime", 14, this.lastTimeBarY + 30);
  }

  // 启动动画
  start() {
    this.isRunning = true;
    requestAnimationFrame(this.animate.bind(this));
  }

  // 停止动画
  stop() {
    this.isRunning = false;
  }
}

// 创建动画实例
const deltaTimeAnimation = new DeltaTimeAnimation("canvas-deltaTime");

// 为交叉观察器提供全局访问
window.deltaTimeAnimation = deltaTimeAnimation;

class MoveAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;

    // 设置Canvas尺寸
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // 动画参数
    this.lastTime = 0;
    this.pxPerSecond = 450;
    this.isRunning = true;

    // 矩形参数
    this.rectWidth = 100;
    this.rectHeight = 100;
    this.rectX = 0;
    this.rectY = (this.canvas.offsetHeight - this.rectHeight) / 2;
    this.rectFillStyle = "#385";
    this.rectStrokeStyle = "gold";
    this.ctx.lineWidth = 5;

    // 启动动画
    this.start();
  }

  // 绘制矩形
  drawRect() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.rectFillStyle;
    this.ctx.strokeStyle = this.rectStrokeStyle;
    this.ctx.fillRect(this.rectX, this.rectY, this.rectWidth, this.rectHeight);
    this.ctx.strokeRect(this.rectX, this.rectY, this.rectWidth, this.rectHeight);
  }

  // 动画循环
  animate(currentTime) {
    if (!this.isRunning) return;

    // 计算时间差（毫秒转换为秒）
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // 基于时间计算移动距离
    const moveDistance = this.pxPerSecond * deltaTime;
    this.rectX += moveDistance;

    // 边界检测
    if (this.rectX > this.canvas.offsetWidth - this.rectWidth) {
      this.rectX = 0;
    }

    this.drawRect();
    requestAnimationFrame(this.animate.bind(this));
  }

  // 启动动画
  start() {
    this.isRunning = true;
    requestAnimationFrame(this.animate.bind(this));
  }

  // 停止动画
  stop() {
    this.isRunning = false;
  }
}

// 创建动画实例
const moveAnimation = new MoveAnimation("canvas-move");

// 为交叉观察器提供全局访问
window.moveAnimation = moveAnimation;

const canvas_move_stop = document.getElementById("canvas-move_stop");
const ctx_move_stop = canvas_move_stop.getContext("2d");
const dpr_move_stop = window.devicePixelRatio || 1;
canvas_move_stop.width = canvas_move_stop.offsetWidth * dpr_move_stop;
canvas_move_stop.height = canvas_move_stop.offsetHeight * dpr_move_stop;
ctx_move_stop.scale(dpr_move_stop, dpr_move_stop);

// 动画参数
let bool_stop_stop = true;
let lastTime_stop = 0;
const px_per_second_stop = 600;

// 鼠标位置跟踪
let lastMouseX_stop = 0;
let lastMouseY_stop = 0;

const rect_move_width_stop = 100;
const rect_move_height_stop = 100;
let rect_move_x_stop = 0;
const rect_move_y_stop = (canvas_move_stop.offsetHeight - rect_move_height_stop) / 2;
const rect_move_fillStyle_stop = "#385";
const rect_move_strokeStyle_stop = "gold";
ctx_move_stop.lineWidth = 5;

function rect_move_draw_stop() {
  ctx_move_stop.clearRect(0, 0, canvas_move_stop.width, canvas_move_stop.height);
  ctx_move_stop.fillStyle = rect_move_fillStyle_stop;
  ctx_move_stop.strokeStyle = rect_move_strokeStyle_stop;
  ctx_move_stop.fillRect(rect_move_x_stop, rect_move_y_stop, rect_move_width_stop, rect_move_height_stop);
  ctx_move_stop.strokeRect(rect_move_x_stop, rect_move_y_stop, rect_move_width_stop, rect_move_height_stop);

  // 如果动画停止，绘制重新播放按钮
  if (bool_stop_stop) {
    ctx_move_stop.save();
    // 按钮背景
    const buttonWidth_stop = 120;
    const buttonHeight_stop = 40;
    const buttonX_stop = (canvas_move_stop.offsetWidth - buttonWidth_stop) / 2;
    const buttonY_stop = (canvas_move_stop.offsetHeight - buttonHeight_stop) / 2;

    // 检查鼠标是否悬停在按钮上
    const rect = canvas_move_stop.getBoundingClientRect();
    const mouseX = ((lastMouseX_stop - rect.left) * (canvas_move_stop.width / rect.width)) / dpr_move_stop;
    const mouseY = ((lastMouseY_stop - rect.top) * (canvas_move_stop.height / rect.height)) / dpr_move_stop;

    const isHovering =
      mouseX >= buttonX_stop &&
      mouseX <= buttonX_stop + buttonWidth_stop &&
      mouseY >= buttonY_stop &&
      mouseY <= buttonY_stop + buttonHeight_stop;

    // 绘制按钮背景
    ctx_move_stop.fillStyle = isHovering ? "#2C8F30" : "#2156a3";
    ctx_move_stop.fillRect(buttonX_stop, buttonY_stop, buttonWidth_stop, buttonHeight_stop);

    // 绘制按钮边框
    ctx_move_stop.strokeStyle = "#aaa";
    ctx_move_stop.lineWidth = 1;
    ctx_move_stop.strokeRect(buttonX_stop, buttonY_stop, buttonWidth_stop, buttonHeight_stop);

    // 绘制按钮文字
    ctx_move_stop.fillStyle = "#fff";
    ctx_move_stop.font = "16px sans-serif";
    ctx_move_stop.textAlign = "center";
    ctx_move_stop.textBaseline = "middle";
    ctx_move_stop.fillText("重新播放", buttonX_stop + buttonWidth_stop / 2, buttonY_stop + buttonHeight_stop / 2);
    ctx_move_stop.restore();
  }
}

function draw_move_stop(currentTime) {
  // 计算时间差（毫秒转换为秒）
  const deltaTime_stop = (currentTime - lastTime_stop) / 1000;
  lastTime_stop = currentTime;

  // 基于时间计算移动距离
  const moveDistance_stop = px_per_second_stop * deltaTime_stop;
  rect_move_x_stop += moveDistance_stop;

  // 边界检测
  if (rect_move_x_stop > canvas_move_stop.offsetWidth - rect_move_width_stop - ctx_move_stop.lineWidth) {
    bool_stop_stop = true;
  }

  rect_move_draw_stop();
  if (!bool_stop_stop) {
    requestAnimationFrame(draw_move_stop);
  }
}

// 重新播放函数
function restartAnimation() {
  bool_stop_stop = false;
  rect_move_x_stop = 0;
  // 重置时间，确保从最左方开始
  lastTime_stop = performance.now();
  requestAnimationFrame(draw_move_stop);
}

// 鼠标事件处理
canvas_move_stop.addEventListener("mousemove", function (e) {
  lastMouseX_stop = e.clientX;
  lastMouseY_stop = e.clientY;

  // 如果动画停止，继续绘制以更新按钮悬停效果
  if (bool_stop_stop) {
    rect_move_draw_stop();
  }
});

canvas_move_stop.addEventListener("click", function (e) {
  if (bool_stop_stop) {
    const rect = canvas_move_stop.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) * (canvas_move_stop.width / rect.width)) / dpr_move_stop;
    const clickY = ((e.clientY - rect.top) * (canvas_move_stop.height / rect.height)) / dpr_move_stop;

    const buttonWidth = 120;
    const buttonHeight = 40;
    const buttonX = (canvas_move_stop.offsetWidth - buttonWidth) / 2;
    const buttonY = (canvas_move_stop.offsetHeight - buttonHeight) / 2;

    if (clickX >= buttonX && clickX <= buttonX + buttonWidth && clickY >= buttonY && clickY <= buttonY + buttonHeight) {
      restartAnimation();
    }
  }
});

rect_move_draw_stop();

class 固定速度 {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;

    // 设置Canvas尺寸
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // 旋转小球动画参数
    this.lastTime = 0;
    this.rotationAngle = 0;
    this.rotationSpeed = 300; // 度/秒，默认速度

    // 小球参数
    this.ballRadius = 15;
    this.orbitRadius = 80;
    this.centerX = this.canvas.offsetWidth / 2;
    this.centerY = this.canvas.offsetHeight / 2;

    // 滑块参数
    this.sliderWidth = 200;
    this.sliderHeight = 20;
    this.sliderX = 100;
    this.sliderY = this.canvas.offsetHeight - 60;
    this.sliderMin = 100;
    this.sliderMax = 1000;
    this.sliderStep = 50;
    this.sliderValue = 300;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // 绑定事件
    this.添加鼠标事件();

    // 启动动画
    this.开始动画();
  }

  // 绘制旋转小球
  绘制轨道与小球() {
    // 清除画布
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);

    // 绘制轨道
    this.ctx.strokeStyle = "#444";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.orbitRadius, 0, Math.PI * 2);
    this.ctx.stroke();

    // 计算小球位置
    const ballX = this.centerX + this.orbitRadius * Math.cos((this.rotationAngle * Math.PI) / 180);
    const ballY = this.centerY + this.orbitRadius * Math.sin((this.rotationAngle * Math.PI) / 180);

    // 绘制小球
    this.ctx.fillStyle = "#ff6b6b";
    this.ctx.beginPath();
    this.ctx.arc(ballX, ballY, this.ballRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制小球边框
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  // 绘制滑块
  绘制速度滑块() {
    // 绘制"旋转速度"文字
    this.ctx.fillStyle = "silver";
    this.ctx.font = "16px sans-serif";
    this.ctx.textAlign = "right";
    this.ctx.fillText("旋转速度", this.sliderX - 15, this.sliderY + 15);

    // 绘制滑块轨道
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(this.sliderX, this.sliderY, this.sliderWidth, this.sliderHeight);

    // 计算滑块位置
    const sliderProgress = (this.sliderValue - this.sliderMin) / (this.sliderMax - this.sliderMin);
    const sliderPosX = this.sliderX + sliderProgress * this.sliderWidth;

    // 绘制已滑过的部分
    this.ctx.fillStyle = "#4CAF50";
    this.ctx.fillRect(this.sliderX, this.sliderY, sliderPosX - this.sliderX, this.sliderHeight);

    // 检查鼠标是否在滑块上
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = ((this.lastMouseX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
    const mouseY = ((this.lastMouseY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

    const isHovering =
      mouseX >= sliderPosX - 5 &&
      mouseX <= sliderPosX + 5 &&
      mouseY >= this.sliderY - 5 &&
      mouseY <= this.sliderY + this.sliderHeight + 5;

    // 绘制滑块（根据悬停状态或拖拽状态改变样式）
    if (isHovering || this.isDragging) {
      this.ctx.fillStyle = "#ffd700"; // 悬停或拖拽时变为金色
      this.ctx.shadowColor = "#ffd700";
      this.ctx.shadowBlur = 10;
    } else {
      this.ctx.fillStyle = "#fff";
      this.ctx.shadowBlur = 0;
    }

    this.ctx.fillRect(sliderPosX - 5, this.sliderY - 5, 10, this.sliderHeight + 10);
    this.ctx.strokeStyle = isHovering || this.isDragging ? "#ffb700" : "#666";
    this.ctx.lineWidth = isHovering || this.isDragging ? 2 : 1;
    this.ctx.strokeRect(sliderPosX - 5, this.sliderY - 5, 10, this.sliderHeight + 10);

    // 重置阴影
    this.ctx.shadowBlur = 0;

    // 绘制数值
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.font = "16px 'JetBrains Mono', Consolas, monospace";
    this.ctx.textAlign = "left";
    this.ctx.fillText(this.sliderValue, this.sliderX + this.sliderWidth + 15, this.sliderY + 15);

    // 绘制单位（"°/s"，lightcyan颜色）
    this.ctx.fillStyle = "lightcyan";
    this.ctx.fillText(
      "°/s",
      this.sliderX + this.sliderWidth + 15 + this.ctx.measureText(this.sliderValue).width + 5,
      this.sliderY + 15,
    );
  }

  // 动画循环
  刷新动画参数与图形(currentTime) {
    // 计算时间差（毫秒转换为秒）
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // 基于时间计算旋转角度
    const angleChange = this.rotationSpeed * deltaTime;
    this.rotationAngle += angleChange;

    // 保持角度在0-360度范围内
    if (this.rotationAngle >= 360) {
      this.rotationAngle -= 360;
    }

    // 绘制动画
    this.绘制轨道与小球();
    this.绘制速度滑块();

    requestAnimationFrame(this.刷新动画参数与图形.bind(this));
  }

  // 处理鼠标按下事件
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
    const y = ((e.clientY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

    // 检查是否点击在滑块上
    const sliderProgress = (this.sliderValue - this.sliderMin) / (this.sliderMax - this.sliderMin);
    const sliderPosX = this.sliderX + sliderProgress * this.sliderWidth;

    if (
      x >= sliderPosX - 5 &&
      x <= sliderPosX + 5 &&
      y >= this.sliderY - 5 &&
      y <= this.sliderY + this.sliderHeight + 5
    ) {
      this.isDragging = true;
    }
  }

  // 处理鼠标移动事件
  handleMouseMove(e) {
    // 更新鼠标位置
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    if (this.isDragging) {
      const rect = this.canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;

      // 计算新的滑块值
      let newValue = ((x - this.sliderX) / this.sliderWidth) * (this.sliderMax - this.sliderMin) + this.sliderMin;
      newValue = Math.max(this.sliderMin, Math.min(this.sliderMax, newValue));

      // 按步进值调整
      this.sliderValue = Math.round(newValue / this.sliderStep) * this.sliderStep;

      // 更新旋转速度
      this.rotationSpeed = this.sliderValue;
    }

    // 检查鼠标是否在滑块上并更新鼠标样式
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
    const mouseY = ((e.clientY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

    const sliderProgress = (this.sliderValue - this.sliderMin) / (this.sliderMax - this.sliderMin);
    const sliderPosX = this.sliderX + sliderProgress * this.sliderWidth;

    const isHovering =
      mouseX >= sliderPosX - 5 &&
      mouseX <= sliderPosX + 5 &&
      mouseY >= this.sliderY - 5 &&
      mouseY <= this.sliderY + this.sliderHeight + 5;

    if (isHovering || this.isDragging) {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
    } else {
      this.canvas.style.cursor = "default";
    }
  }

  // 处理鼠标松开事件
  handleMouseUp() {
    this.isDragging = false;
  }

  // 处理鼠标离开事件
  handleMouseLeave() {
    this.canvas.style.cursor = "default";
  }

  // 绑定事件
  添加鼠标事件() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
  }

  // 启动动画
  开始动画() {
    requestAnimationFrame(this.刷新动画参数与图形.bind(this));
  }
}

// 创建动画实例
new 固定速度("canvas-固定速度");

class 固定时间 {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;

    // 设置Canvas尺寸
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // 旋转小球动画参数
    this.lastTime = 0;
    this.rotationAngle = -90; // 从-90度开始，即正上方

    // 倒计时现在基于小球位置实时计算，不需要额外参数

    // 小球参数
    this.ballRadius = 15;
    this.orbitRadius = 80;
    this.centerX = this.canvas.offsetWidth / 2;
    this.centerY = this.canvas.offsetHeight / 2;

    // 滑块参数
    this.sliderWidth = 200;
    this.sliderHeight = 20;
    this.sliderX = 100;
    this.sliderY = this.canvas.offsetHeight - 60;
    this.sliderMin = 100; // 内部值：100ms = 0.1秒
    this.sliderMax = 5000; // 内部值：5000ms = 5秒
    this.sliderStep = 100; // 内部步进：100ms = 0.1秒
    this.sliderValue = 1000; // 以时间为基准，默认 1秒/圈
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // 绑定事件
    this.添加鼠标事件();

    // 启动动画
    this.开始动画();
  }

  // 绘制旋转小球
  绘制轨道与小球() {
    // 清除画布
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);

    // 绘制轨道
    this.ctx.strokeStyle = "#444";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.orbitRadius, 0, Math.PI * 2);
    this.ctx.stroke();

    // 计算小球位置
    const ballX = this.centerX + this.orbitRadius * Math.cos((this.rotationAngle * Math.PI) / 180);
    const ballY = this.centerY + this.orbitRadius * Math.sin((this.rotationAngle * Math.PI) / 180);

    // 绘制小球
    this.ctx.fillStyle = "#ff6b6b";
    this.ctx.beginPath();
    this.ctx.arc(ballX, ballY, this.ballRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制小球边框
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  // 绘制倒计时
  绘制倒计时() {
    // 基于小球当前位置计算倒计时
    // 当小球在正上方(-90度)时，倒计时应该为0
    // 当小球在其他位置时，倒计时显示到达正上方还需要多少时间

    // 计算小球当前位置相对于正上方(-90度)的角度差
    let currentAngle = this.rotationAngle;
    if (currentAngle < -90) {
      currentAngle += 360; // 确保角度在合理范围内
    }

    // 计算到正上方(-90度)的角度差
    let angleToTop = -90 - currentAngle;
    if (angleToTop <= 0) {
      angleToTop += 360; // 如果已经过了正上方，计算到下一圈正上方的角度
    }

    // 根据角度差和旋转速度计算剩余时间
    const 旋转速度 = 360 / (this.sliderValue / 1000); // 度/秒
    const remainingTime = Math.max(0, (angleToTop / 旋转速度) * 1000); // 转换为毫秒

    // 设置字体和位置
    this.ctx.font = "24px 'Google Sans Code', Consolas, monospace";
    this.ctx.textAlign = "right";

    // 绘制倒计时数字（白色，右对齐）
    this.ctx.fillStyle = "#ffffff";
    const timeInSeconds = (remainingTime / 1000).toFixed(2); // 转换为秒数，保留两位小数
    this.ctx.fillText(timeInSeconds, this.centerX + 20, 50);

    // 绘制"s"单位（蓝色，与数字在同一行）
    this.ctx.fillStyle = "#4a9eff";
    this.ctx.font = "24px 'Google Sans Code', Consolas, monospace";
    this.ctx.textAlign = "left";
    this.ctx.fillText("s", this.centerX + 25, 50);
  }

  // 绘制滑块
  绘制速度滑块() {
    // 绘制"旋转一圈的用时"文字
    this.ctx.fillStyle = "silver";
    this.ctx.font = "16px sans-serif";
    this.ctx.textAlign = "right";
    this.ctx.fillText("一圈用时", this.sliderX - 15, this.sliderY + 15);

    // 绘制滑块轨道
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(this.sliderX, this.sliderY, this.sliderWidth, this.sliderHeight);

    // 计算滑块位置
    const sliderProgress = (this.sliderValue - this.sliderMin) / (this.sliderMax - this.sliderMin);
    const sliderPosX = this.sliderX + sliderProgress * this.sliderWidth;

    // 绘制已滑过的部分
    this.ctx.fillStyle = "#4CAF50";
    this.ctx.fillRect(this.sliderX, this.sliderY, sliderPosX - this.sliderX, this.sliderHeight);

    // 检查鼠标是否在滑块上
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = ((this.lastMouseX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
    const mouseY = ((this.lastMouseY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

    const isHovering =
      mouseX >= sliderPosX - 5 &&
      mouseX <= sliderPosX + 5 &&
      mouseY >= this.sliderY - 5 &&
      mouseY <= this.sliderY + this.sliderHeight + 5;

    // 绘制滑块（根据悬停状态或拖拽状态改变样式）
    if (isHovering || this.isDragging) {
      this.ctx.fillStyle = "#ffd700"; // 悬停或拖拽时变为金色
      this.ctx.shadowColor = "#ffd700";
      this.ctx.shadowBlur = 10;
    } else {
      this.ctx.fillStyle = "#fff";
      this.ctx.shadowBlur = 0;
    }

    this.ctx.fillRect(sliderPosX - 5, this.sliderY - 5, 10, this.sliderHeight + 10);
    this.ctx.strokeStyle = isHovering || this.isDragging ? "#ffb700" : "#666";
    this.ctx.lineWidth = isHovering || this.isDragging ? 2 : 1;
    this.ctx.strokeRect(sliderPosX - 5, this.sliderY - 5, 10, this.sliderHeight + 10);

    // 重置阴影
    this.ctx.shadowBlur = 0;

    // 绘制数值（显示秒数）
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.font = "16px 'Google Sans Code', Consolas, monospace";
    this.ctx.textAlign = "left";
    const displayValue = (this.sliderValue / 1000).toFixed(1); // 转换为秒数，保留一位小数
    this.ctx.fillText(displayValue, this.sliderX + this.sliderWidth + 15, this.sliderY + 15);

    // 绘制单位（"°/s"，lightcyan颜色）
    this.ctx.fillStyle = "lightcyan";
    this.ctx.fillText(
      "s",
      this.sliderX + this.sliderWidth + 15 + this.ctx.measureText(displayValue).width + 5,
      this.sliderY + 15,
    );
  }

  // 动画循环
  刷新动画参数与图形(currentTime) {
    // 计算时间差（毫秒转换为秒）
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    const 旋转速度 = 360 / (this.sliderValue / 1000); //以时间算速度，单位：度/秒
    const angleChange = 旋转速度 * deltaTime; // 将ms转换为秒
    this.rotationAngle += angleChange;

    // 保持角度在合理范围内
    if (this.rotationAngle >= 270) {
      this.rotationAngle -= 360;
    }

    // 绘制动画
    this.绘制轨道与小球();
    this.绘制倒计时();
    this.绘制速度滑块();

    requestAnimationFrame(this.刷新动画参数与图形.bind(this));
  }

  // 处理鼠标按下事件
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
    const y = ((e.clientY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

    // 检查是否点击在滑块上
    const sliderProgress = (this.sliderValue - this.sliderMin) / (this.sliderMax - this.sliderMin);
    const sliderPosX = this.sliderX + sliderProgress * this.sliderWidth;

    if (
      x >= sliderPosX - 5 &&
      x <= sliderPosX + 5 &&
      y >= this.sliderY - 5 &&
      y <= this.sliderY + this.sliderHeight + 5
    ) {
      this.isDragging = true;
    }
  }

  // 处理鼠标移动事件
  handleMouseMove(e) {
    // 更新鼠标位置
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    if (this.isDragging) {
      const rect = this.canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;

      // 计算新的滑块值
      let newValue = ((x - this.sliderX) / this.sliderWidth) * (this.sliderMax - this.sliderMin) + this.sliderMin;
      newValue = Math.max(this.sliderMin, Math.min(this.sliderMax, newValue));

      // 按步进值调整
      this.sliderValue = Math.round(newValue / this.sliderStep) * this.sliderStep;

      // 倒计时现在基于小球位置实时计算，不需要更新持续时间
    }

    // 检查鼠标是否在滑块上并更新鼠标样式
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / this.dpr;
    const mouseY = ((e.clientY - rect.top) * (this.canvas.height / rect.height)) / this.dpr;

    const sliderProgress = (this.sliderValue - this.sliderMin) / (this.sliderMax - this.sliderMin);
    const sliderPosX = this.sliderX + sliderProgress * this.sliderWidth;

    const isHovering =
      mouseX >= sliderPosX - 5 &&
      mouseX <= sliderPosX + 5 &&
      mouseY >= this.sliderY - 5 &&
      mouseY <= this.sliderY + this.sliderHeight + 5;

    if (isHovering || this.isDragging) {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
    } else {
      this.canvas.style.cursor = "default";
    }
  }

  // 处理鼠标松开事件
  handleMouseUp() {
    this.isDragging = false;
  }

  // 处理鼠标离开事件
  handleMouseLeave() {
    this.canvas.style.cursor = "default";
  }

  // 绑定事件
  添加鼠标事件() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
  }

  // 启动动画
  开始动画() {
    requestAnimationFrame(this.刷新动画参数与图形.bind(this));
  }
}

// 创建动画实例
new 固定时间("canvas-固定时间");

const canvas_delay = document.getElementById("canvas-delay");
const ctx_delay = canvas_delay.getContext("2d");
const dpr_delay = window.devicePixelRatio || 1;
canvas_delay.width = canvas_delay.offsetWidth * dpr_delay;
canvas_delay.height = canvas_delay.offsetHeight * dpr_delay;
ctx_delay.scale(dpr_delay, dpr_delay);

// 动画参数
let lastTime_delay = 0;
const px_per_second_delay = 400;
let animationPhase_delay = -1; // -1: 未开始, 0: 延时, 1: 移动, 2: 完成
let phaseStartTime_delay = 0;
let delayDuration_delay = 1.0; // 默认延时1秒

// 矩形参数
const rect_delay_width = 80;
const rect_delay_height = 80;
let rect_delay_x = 0; // 从canvas最左边开始
const rect_delay_y = (canvas_delay.offsetHeight - rect_delay_height) / 2;
const rect_delay_fillStyle = "#aa3b4b";
const rect_delay_strokeStyle = "#aaa";
ctx_delay.lineWidth = 3;

// 滑块参数
const slider_delay_width = 200;
const slider_delay_height = 20;
const slider_delay_x = 100;
const slider_delay_y = canvas_delay.offsetHeight - 60;
const slider_delay_min = 0.5;
const slider_delay_max = 3.0;
const slider_delay_step = 0.5;
let slider_delay_value = 1.0;
let isDragging_delay = false;
let lastMouseX_delay = 0;
let lastMouseY_delay = 0;

// 重新播放按钮参数
const button_delay_width = 100;
const button_delay_height = 35;
const button_delay_x = canvas_delay.offsetWidth - button_delay_width - 20;
const button_delay_y = 20;

function drawRect_delay() {
  ctx_delay.clearRect(0, 0, canvas_delay.offsetWidth, canvas_delay.offsetHeight);

  // 绘制矩形
  ctx_delay.fillStyle = rect_delay_fillStyle;
  ctx_delay.strokeStyle = rect_delay_strokeStyle;
  ctx_delay.lineWidth = 2;
  ctx_delay.fillRect(rect_delay_x, rect_delay_y, rect_delay_width, rect_delay_height);
  ctx_delay.strokeRect(rect_delay_x, rect_delay_y, rect_delay_width, rect_delay_height);
}

function drawSlider_delay() {
  // 绘制"延时时长"文字
  ctx_delay.fillStyle = "silver";
  ctx_delay.font = "16px sans-serif";
  ctx_delay.textAlign = "right";
  ctx_delay.textBaseline = "middle";
  ctx_delay.fillText("延时时长", slider_delay_x - 15, slider_delay_y + 10);

  // 绘制滑块轨道
  ctx_delay.fillStyle = "#333";
  ctx_delay.fillRect(slider_delay_x, slider_delay_y, slider_delay_width, slider_delay_height);

  // 计算滑块位置
  const sliderProgress = (slider_delay_value - slider_delay_min) / (slider_delay_max - slider_delay_min);
  const sliderPosX = slider_delay_x + sliderProgress * slider_delay_width;

  // 绘制已滑过的部分
  ctx_delay.fillStyle = "#4CAF50";
  ctx_delay.fillRect(slider_delay_x, slider_delay_y, sliderPosX - slider_delay_x, slider_delay_height);

  // 检查鼠标是否在滑块上
  const rect = canvas_delay.getBoundingClientRect();
  const mouseX = ((lastMouseX_delay - rect.left) * (canvas_delay.width / rect.width)) / dpr_delay;
  const mouseY = ((lastMouseY_delay - rect.top) * (canvas_delay.height / rect.height)) / dpr_delay;

  const isHovering =
    mouseX >= sliderPosX - 5 &&
    mouseX <= sliderPosX + 5 &&
    mouseY >= slider_delay_y - 5 &&
    mouseY <= slider_delay_y + slider_delay_height + 5;

  // 绘制滑块
  ctx_delay.fillStyle = isHovering || isDragging_delay ? "#ffd700" : "#fff";
  ctx_delay.fillRect(sliderPosX - 5, slider_delay_y - 5, 10, slider_delay_height + 10);
  ctx_delay.strokeStyle = isHovering || isDragging_delay ? "#ffb700" : "#666";
  ctx_delay.lineWidth = isHovering || isDragging_delay ? 2 : 1;
  ctx_delay.strokeRect(sliderPosX - 5, slider_delay_y - 5, 10, slider_delay_height + 10);

  // 绘制数值
  ctx_delay.fillStyle = "lightskyblue";
  ctx_delay.font = "16px 'JetBrains Mono', Consolas, monospace";
  ctx_delay.textAlign = "left";
  ctx_delay.fillText(slider_delay_value + "s", slider_delay_x + slider_delay_width + 15, slider_delay_y + 10);
}

function drawButton_delay() {
  // 检查鼠标是否在按钮上
  const rect = canvas_delay.getBoundingClientRect();
  const mouseX = ((lastMouseX_delay - rect.left) * (canvas_delay.width / rect.width)) / dpr_delay;
  const mouseY = ((lastMouseY_delay - rect.top) * (canvas_delay.height / rect.height)) / dpr_delay;

  const isHovering =
    mouseX >= button_delay_x &&
    mouseX <= button_delay_x + button_delay_width &&
    mouseY >= button_delay_y &&
    mouseY <= button_delay_y + button_delay_height;

  // 绘制按钮背景
  ctx_delay.fillStyle = isHovering ? "#2C8F30" : "#2156a3";
  ctx_delay.fillRect(button_delay_x, button_delay_y, button_delay_width, button_delay_height);

  // 绘制按钮边框
  ctx_delay.strokeStyle = "#aaa";
  ctx_delay.lineWidth = 1;
  ctx_delay.strokeRect(button_delay_x, button_delay_y, button_delay_width, button_delay_height);

  // 绘制按钮文字
  ctx_delay.fillStyle = "#fff";
  ctx_delay.font = "14px sans-serif";
  ctx_delay.textAlign = "center";
  ctx_delay.textBaseline = "middle";
  ctx_delay.fillText("重新播放", button_delay_x + button_delay_width / 2, button_delay_y + button_delay_height / 2);
}

function drawDelayCountdown_delay(currentTime) {
  const centerX = canvas_delay.offsetWidth / 2;
  const centerY = 50;
  const fontSize = "24px 'JetBrains Mono', Consolas, monospace";

  if (animationPhase_delay === -1) {
    // 未开始状态，显示延时设置
    const text = delayDuration_delay.toFixed(1);
    const unit = "s";

    // 绘制数字
    ctx_delay.fillStyle = "#fff";
    ctx_delay.font = fontSize;
    ctx_delay.textAlign = "right";
    ctx_delay.textBaseline = "middle";
    ctx_delay.fillText(text, centerX, centerY);

    // 绘制单位
    ctx_delay.fillStyle = "darkgoldenrod";
    ctx_delay.textAlign = "left";
    ctx_delay.fillText(unit, centerX, centerY);
  } else if (animationPhase_delay === 0) {
    // 延时阶段，显示倒计时
    const elapsedTime = (currentTime - phaseStartTime_delay) / 1000;
    const remainingTime = Math.max(0, delayDuration_delay - elapsedTime);
    const text = remainingTime.toFixed(1);
    const unit = "s";

    // 绘制数字
    ctx_delay.fillStyle = "#fff";
    ctx_delay.font = fontSize;
    ctx_delay.textAlign = "right";
    ctx_delay.textBaseline = "middle";
    ctx_delay.fillText(text, centerX, centerY);

    // 绘制单位
    ctx_delay.fillStyle = "darkgoldenrod";
    ctx_delay.textAlign = "left";
    ctx_delay.fillText(unit, centerX, centerY);
  } else if (animationPhase_delay === 1) {
    // 移动阶段，显示0.0s
    const text = "0.0";
    const unit = "s";

    // 绘制数字
    ctx_delay.fillStyle = "#fff";
    ctx_delay.font = fontSize;
    ctx_delay.textAlign = "right";
    ctx_delay.textBaseline = "middle";
    ctx_delay.fillText(text, centerX, centerY);

    // 绘制单位
    ctx_delay.fillStyle = "darkgoldenrod";
    ctx_delay.textAlign = "left";
    ctx_delay.fillText(unit, centerX, centerY);
  } else if (animationPhase_delay === 2) {
    // 完成状态，显示0.0s
    const text = "0.0";
    const unit = "s";

    // 绘制数字
    ctx_delay.fillStyle = "#fff";
    ctx_delay.font = fontSize;
    ctx_delay.textAlign = "right";
    ctx_delay.textBaseline = "middle";
    ctx_delay.fillText(text, centerX, centerY);

    // 绘制单位
    ctx_delay.fillStyle = "darkgoldenrod";
    ctx_delay.textAlign = "left";
    ctx_delay.fillText(unit, centerX, centerY);
  }
}

function animate_delay(currentTime) {
  // 绘制基础元素
  drawRect_delay();
  drawSlider_delay();
  drawButton_delay();
  drawDelayCountdown_delay(currentTime);

  // 动画逻辑
  switch (animationPhase_delay) {
    case 0: // 延时阶段
      if (currentTime - phaseStartTime_delay >= delayDuration_delay * 1000) {
        animationPhase_delay = 1;
        phaseStartTime_delay = currentTime;
        lastTime_delay = currentTime;
      }
      break;

    case 1: // 移动阶段
      const deltaTime = (currentTime - lastTime_delay) / 1000;
      lastTime_delay = currentTime;

      const moveDistance = px_per_second_delay * deltaTime;
      rect_delay_x += moveDistance;

      // 边界检测
      if (rect_delay_x >= canvas_delay.offsetWidth - rect_delay_width) {
        rect_delay_x = canvas_delay.offsetWidth - rect_delay_width; // 停在最右边
        animationPhase_delay = 2; // 进入完成状态
      }
      break;

    case 2: // 完成状态
      // 动画完成，不再继续
      break;
  }

  // 继续请求下一帧以保持交互功能
  requestAnimationFrame(animate_delay);
}

function restartAnimation_delay() {
  animationPhase_delay = 0; // 开始延时阶段
  rect_delay_x = 0; // 重置到canvas最左边
  lastTime_delay = 0;
  delayDuration_delay = slider_delay_value;
  phaseStartTime_delay = performance.now();
  requestAnimationFrame(animate_delay);
}

// 鼠标事件处理
canvas_delay.addEventListener("mousemove", function (e) {
  lastMouseX_delay = e.clientX;
  lastMouseY_delay = e.clientY;

  // 检查鼠标样式
  const rect = canvas_delay.getBoundingClientRect();
  const mouseX = ((e.clientX - rect.left) * (canvas_delay.width / rect.width)) / dpr_delay;
  const mouseY = ((e.clientY - rect.top) * (canvas_delay.height / rect.height)) / dpr_delay;

  // 检查滑块悬停
  const sliderProgress = (slider_delay_value - slider_delay_min) / (slider_delay_max - slider_delay_min);
  const sliderPosX = slider_delay_x + sliderProgress * slider_delay_width;
  const isSliderHovering =
    mouseX >= sliderPosX - 5 &&
    mouseX <= sliderPosX + 5 &&
    mouseY >= slider_delay_y - 5 &&
    mouseY <= slider_delay_y + slider_delay_height + 5;

  // 检查按钮悬停
  const isButtonHovering =
    mouseX >= button_delay_x &&
    mouseX <= button_delay_x + button_delay_width &&
    mouseY >= button_delay_y &&
    mouseY <= button_delay_y + button_delay_height;

  if (isSliderHovering || isDragging_delay) {
    canvas_delay.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
  } else if (isButtonHovering) {
    canvas_delay.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
  } else {
    canvas_delay.style.cursor = "default";
  }
});

canvas_delay.addEventListener("mousedown", function (e) {
  const rect = canvas_delay.getBoundingClientRect();
  const x = ((e.clientX - rect.left) * (canvas_delay.width / rect.width)) / dpr_delay;
  const y = ((e.clientY - rect.top) * (canvas_delay.height / rect.height)) / dpr_delay;

  // 检查是否点击在滑块上
  const sliderProgress = (slider_delay_value - slider_delay_min) / (slider_delay_max - slider_delay_min);
  const sliderPosX = slider_delay_x + sliderProgress * slider_delay_width;

  if (
    x >= sliderPosX - 5 &&
    x <= sliderPosX + 5 &&
    y >= slider_delay_y - 5 &&
    y <= slider_delay_y + slider_delay_height + 5
  ) {
    isDragging_delay = true;
  }
});

canvas_delay.addEventListener("mouseup", function (e) {
  if (isDragging_delay) {
    isDragging_delay = false;
  } else {
    // 检查是否点击了重新播放按钮
    const rect = canvas_delay.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * (canvas_delay.width / rect.width)) / dpr_delay;
    const y = ((e.clientY - rect.top) * (canvas_delay.height / rect.height)) / dpr_delay;

    if (
      x >= button_delay_x &&
      x <= button_delay_x + button_delay_width &&
      y >= button_delay_y &&
      y <= button_delay_y + button_delay_height
    ) {
      restartAnimation_delay();
    }
  }
});

// 滑块拖拽逻辑
canvas_delay.addEventListener("mousemove", function (e) {
  if (isDragging_delay) {
    const rect = canvas_delay.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * (canvas_delay.width / rect.width)) / dpr_delay;

    // 计算新的滑块值
    let newValue =
      ((x - slider_delay_x) / slider_delay_width) * (slider_delay_max - slider_delay_min) + slider_delay_min;
    newValue = Math.max(slider_delay_min, Math.min(slider_delay_max, newValue));

    // 按步进值调整
    slider_delay_value = Math.round(newValue / slider_delay_step) * slider_delay_step;
    delayDuration_delay = slider_delay_value;

    // 如果动画未开始，更新显示
    if (animationPhase_delay === -1) {
      requestAnimationFrame(animate_delay);
    }
  }
});

canvas_delay.addEventListener("mouseleave", function () {
  canvas_delay.style.cursor = "default";
  isDragging_delay = false;
});

// 启动初始绘制（不自动开始动画）
requestAnimationFrame(animate_delay);
