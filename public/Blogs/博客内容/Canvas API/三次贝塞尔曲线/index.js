class 二次贝塞尔曲线动画 {
  constructor() {
    this.canvas = document.getElementById("canvas-二次贝塞尔曲线-动画");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // 二次贝塞尔曲线的三个控制点
    this.controlPoints = {
      P0: { x: 100, y: 370 },
      P1: { x: 400, y: 75 },
      P2: { x: 700, y: 325 },
    };

    // 拖拽相关状态
    this.dragState = {
      isDragging: false,
      draggedPoint: null,
      startX: 0,
      startY: 0,
      hoveredPoint: null, // 当前悬停的控制点
    };

    // 播放按钮悬停状态
    this.buttonHoverState = {
      isHovered: false,
    };

    // 动画状态
    this.animation = {
      // 动画进度
      progress: 0,
      duration: 4000, // 4秒
      startTime: null,
      isPlaying: false, // 是否正在播放
      isPaused: false, // 是否暂停
      pausedProgress: 0, // 暂停时的进度
      pausedTime: 0, // 暂停时的时间

      // 辅助线动画
      showControlLines: true, // 控制线一开始就显示
      showTangentLines: false,
      showCurve: false,

      // 时间控制
      controlLinesDelay: 0, // 控制线立即显示
      tangentLinesDelay: 1000, // 1秒后显示切线
      curveDelay: 1000, // 1秒后开始绘制曲线，与切线同步
    };

    // 状态提示
    this.statusDisplay = {
      currentPhase: "准备中",
      phases: ["准备中", "显示控制线", "显示切线", "绘制曲线", "完成"],
      currentIndex: 0,
    };

    // 初始化
    this.init();
  }

  // 初始化
  init() {
    // 添加各种鼠标事件
    this.addMouseEvents();

    // 不自动开始动画，等待用户点击播放按钮
    this.draw();
  }

  // 添加各种鼠标事件
  addMouseEvents() {
    this.canvas.addEventListener("click", (e) => this.handleCanvasClick(e));
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e));
    this.canvas.addEventListener("mouseleave", (e) => this.handleMouseLeave(e));
  }

  // 处理鼠标按下事件
  handleMouseDown(e) {
    if (this.animation.isPlaying) return; // 动画播放时不允许拖拽

    const rect = this.canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // 检查是否点击了控制点
    const clickedPoint = this.getClickedControlPoint(x, y);
    if (clickedPoint) {
      this.dragState.isDragging = true;
      this.dragState.draggedPoint = clickedPoint;
      this.dragState.startX = x;
      this.dragState.startY = y;
      this.canvas.style.cursor = "grabbing";
    }
  }

  // 处理鼠标移动事件
  handleMouseMove(e) {
    if (!this.dragState.isDragging) {
      // 检查鼠标悬停在控制点上
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);

      const hoveredPoint = this.getClickedControlPoint(x, y);
      if (hoveredPoint !== this.dragState.hoveredPoint) {
        this.dragState.hoveredPoint = hoveredPoint;
        if (hoveredPoint && !this.animation.isPlaying) {
          this.canvas.style.cursor = "grab";
        } else {
          this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
        }
        this.draw(); // 重新绘制以更新颜色
      }

      // 检查播放按钮悬停状态
      const isButtonHovered = this.isClickOnPlayButton(x, y);
      if (isButtonHovered !== this.buttonHoverState.isHovered) {
        this.buttonHoverState.isHovered = isButtonHovered;
        this.draw(); // 重新绘制以更新按钮颜色
      }
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // 更新控制点位置
    if (this.dragState.draggedPoint) {
      this.dragState.draggedPoint.x = x;
      this.dragState.draggedPoint.y = y;
      this.draw(); // 重新绘制
    }
  }

  // 处理鼠标松开事件
  handleMouseUp(e) {
    if (this.dragState.isDragging) {
      this.dragState.isDragging = false;
      this.dragState.draggedPoint = null;
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
    }
  }

  // 处理鼠标离开事件
  handleMouseLeave(e) {
    if (this.dragState.isDragging) {
      this.dragState.isDragging = false;
      this.dragState.draggedPoint = null;
    }
    // 清除悬停状态
    if (this.dragState.hoveredPoint) {
      this.dragState.hoveredPoint = null;
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
      this.draw(); // 重新绘制以更新颜色
    }
    // 清除按钮悬停状态
    if (this.buttonHoverState.isHovered) {
      this.buttonHoverState.isHovered = false;
      this.draw(); // 重新绘制以更新按钮颜色
    }
  }

  // 获取被点击的控制点
  getClickedControlPoint(x, y) {
    const { P0, P1, P2 } = this.controlPoints;
    const clickRadius = 15; // 点击半径

    // 检查P0
    if (Math.sqrt((x - P0.x) ** 2 + (y - P0.y) ** 2) <= clickRadius) {
      return P0;
    }
    // 检查P1
    if (Math.sqrt((x - P1.x) ** 2 + (y - P1.y) ** 2) <= clickRadius) {
      return P1;
    }
    // 检查P2
    if (Math.sqrt((x - P2.x) ** 2 + (y - P2.y) ** 2) <= clickRadius) {
      return P2;
    }

    return null;
  }

  // 处理Canvas点击事件
  handleCanvasClick(e) {
    if (this.dragState.isDragging) return; // 如果正在拖拽，不处理点击

    const rect = this.canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // 检查是否点击了播放按钮
    if (this.isClickOnPlayButton(x, y)) {
      if (this.animation.isPlaying && !this.animation.isPaused) {
        // 正在播放时，点击暂停
        this.pauseAnimation();
      } else {
        // 暂停时或未播放时，点击开始/继续
        this.startAnimation();
      }
    }
  }

  // 检查是否点击了播放按钮
  isClickOnPlayButton(x, y) {
    const buttonX = this.canvas.offsetWidth - 120;
    const buttonY = 20;
    const buttonWidth = 100;
    const buttonHeight = 40;

    return x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight;
  }

  // 开始动画
  startAnimation() {
    if (this.animation.isPlaying && !this.animation.isPaused) return; // 防止重复启动

    if (this.animation.isPaused) {
      // 从暂停状态继续播放
      this.continueAnimation();
    } else {
      // 开始新的动画
      this.animation.isPlaying = true;
      this.animation.isPaused = false;
      this.animation.startTime = performance.now();
      this.animation.progress = 0;
      this.animation.showTangentLines = true; // 立即显示切线
      this.animation.showCurve = false;
      this.statusDisplay.currentIndex = 0;
      this.animate();
    }
  }

  // 暂停动画
  pauseAnimation() {
    if (!this.animation.isPlaying || this.animation.isPaused) return;

    this.animation.isPaused = true;
    this.animation.pausedProgress = this.animation.progress;
    this.animation.pausedTime = performance.now();
    this.animation.isPlaying = false;

    // 立即重新绘制以更新按钮文本
    this.draw();
  }

  // 继续动画
  continueAnimation() {
    if (!this.animation.isPaused) return;

    this.animation.isPaused = false;
    this.animation.isPlaying = true;

    // 计算剩余时间，从暂停点继续
    const remainingProgress = 1 - this.animation.pausedProgress;
    const remainingTime = remainingProgress * this.animation.duration;
    this.animation.startTime = performance.now() - (this.animation.duration - remainingTime);

    // 确保暂停时的状态得到保持
    this.animation.progress = this.animation.pausedProgress;

    // 确保切线保持显示状态
    this.animation.showTangentLines = true;

    // 立即重新绘制以更新按钮文本
    this.draw();
    this.animate();
  }

  // 重新开始动画
  restartAnimation() {
    this.animation.isPlaying = false;
    this.animation.isPaused = false;
    this.animation.startTime = null;
    this.animation.progress = 0;
    this.animation.pausedProgress = 0;
    this.animation.pausedTime = 0;
    this.animation.showTangentLines = false; // 重置时隐藏切线
    this.animation.showCurve = false;
    this.statusDisplay.currentIndex = 0;
    this.draw();
  }

  // 动画循环
  animate() {
    if (!this.animation.isPlaying || this.animation.isPaused) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.animation.startTime;
    this.animation.progress = Math.min(elapsed / this.animation.duration, 1);

    this.updateAnimationState();
    this.updateStatus();
    this.draw();

    if (this.animation.progress < 1) {
      requestAnimationFrame(() => this.animate());
    } else {
      // 动画完成后，立即重新启用播放按钮，但保持动画状态
      this.animation.isPlaying = false;
      this.animation.isPaused = false;
      this.updateStatus(); // 更新状态显示
      this.draw(); // 重新绘制以更新播放按钮状态
    }
  }

  // 更新动画状态
  updateAnimationState() {
    const progress = this.animation.progress;

    // 曲线绘制时机（与切线同步）
    if (progress >= this.animation.curveDelay / this.animation.duration) {
      this.animation.showCurve = true;
    }

    // 切线在开始播放时立即显示，不需要等待进度
  }

  // 更新状态显示
  updateStatus() {
    const progress = this.animation.progress;
    const phaseIndex = Math.floor(progress * (this.statusDisplay.phases.length - 1));

    this.statusDisplay.currentIndex = Math.min(phaseIndex, this.statusDisplay.phases.length - 1);
    this.statusDisplay.currentPhase = this.statusDisplay.phases[this.statusDisplay.currentIndex];
  }

  // 计算二次贝塞尔曲线上的点
  getBezierPoint(t) {
    const { P0, P1, P2 } = this.controlPoints;
    const x = Math.pow(1 - t, 2) * P0.x + 2 * (1 - t) * t * P1.x + Math.pow(t, 2) * P2.x;
    const y = Math.pow(1 - t, 2) * P0.y + 2 * (1 - t) * t * P1.y + Math.pow(t, 2) * P2.y;
    return { x, y };
  }

  // 计算辅助线上的点
  getHelperPoint(t) {
    const { P0, P1, P2 } = this.controlPoints;

    // P0到P1的线段上的点
    const Q0 = {
      x: P0.x + (P1.x - P0.x) * t,
      y: P0.y + (P1.y - P0.y) * t,
    };

    // P1到P2的线段上的点
    const Q1 = {
      x: P1.x + (P2.x - P1.x) * t,
      y: P1.y + (P2.y - P1.y) * t,
    };

    return { Q0, Q1 };
  }

  // 绘制
  draw() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制网格
    this.drawGrid();

    // 绘制控制线
    if (this.animation.showControlLines) {
      this.drawControlLines();
    }

    // 绘制切线和辅助点
    if (this.animation.showTangentLines) {
      this.drawTangentLines();
    }

    // 绘制控制点
    this.drawControlPoints();

    // 绘制贝塞尔曲线
    this.drawBezierCurve();

    // 绘制状态信息
    this.drawStatusInfo();
  }

  // 绘制网格
  drawGrid() {
    this.ctx.strokeStyle = "#ffffff0c";
    this.ctx.lineWidth = 1;

    // 绘制垂直线
    for (let x = 0; x <= this.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // 绘制水平线
    for (let y = 0; y <= this.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  // 绘制控制点
  drawControlPoints() {
    const { P0, P1, P2 } = this.controlPoints;

    // 绘制P0
    if (this.dragState.hoveredPoint === P0) {
      this.ctx.fillStyle = "#4CAF50"; // 悬停时的亮绿色
    } else {
      this.ctx.fillStyle = "#1C6F20"; // 正常时的深绿色
    }
    this.ctx.beginPath();
    this.ctx.arc(P0.x, P0.y, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 绘制P1
    if (this.dragState.hoveredPoint === P1) {
      this.ctx.fillStyle = "#FF9800"; // 悬停时的亮橙色
    } else {
      this.ctx.fillStyle = "#aF4800"; // 正常时的深橙色
    }
    this.ctx.beginPath();
    this.ctx.arc(P1.x, P1.y, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 绘制P2
    if (this.dragState.hoveredPoint === P2) {
      this.ctx.fillStyle = "#2196F3"; // 悬停时的亮蓝色
    } else {
      this.ctx.fillStyle = "#1146a3"; // 正常时的深蓝色
    }
    this.ctx.beginPath();
    this.ctx.arc(P2.x, P2.y, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 绘制标签
    this.ctx.fillStyle = "lightsteelblue";
    this.ctx.font = "16px 'Google Sans Code', monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText("P₀", P0.x, P0.y - 20);
    this.ctx.fillText("P₁", P1.x, P1.y - 20);
    this.ctx.fillText("P₂", P2.x, P2.y - 20);
  }

  // 绘制控制线
  drawControlLines() {
    const { P0, P1, P2 } = this.controlPoints;

    this.ctx.strokeStyle = "#666";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    // P0到P1
    this.ctx.beginPath();
    this.ctx.moveTo(P0.x, P0.y);
    this.ctx.lineTo(P1.x, P1.y);
    this.ctx.stroke();

    // P1到P2
    this.ctx.beginPath();
    this.ctx.moveTo(P1.x, P1.y);
    this.ctx.lineTo(P2.x, P2.y);
    this.ctx.stroke();

    this.ctx.setLineDash([]);
  }

  // 绘制切线和辅助点
  drawTangentLines() {
    const { P0, P1, P2 } = this.controlPoints;

    // 计算当前参数t（基于动画进度）
    const t = Math.max(
      0,
      (this.animation.progress - this.animation.tangentLinesDelay / this.animation.duration) /
        (1 - this.animation.tangentLinesDelay / this.animation.duration),
    );

    // 获取辅助点（即使t=0也要显示）
    const { Q0, Q1 } = this.getHelperPoint(t);

    // 绘制辅助点
    this.ctx.fillStyle = "#FF5722";
    this.ctx.beginPath();
    this.ctx.arc(Q0.x, Q0.y, 6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#9C27B0";
    this.ctx.beginPath();
    this.ctx.arc(Q1.x, Q1.y, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制切线
    this.ctx.strokeStyle = "#FF5722";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(Q0.x, Q0.y);
    this.ctx.lineTo(Q1.x, Q1.y);
    this.ctx.stroke();

    // 绘制参数t的指示器
    this.ctx.textAlign = "center";
    this.ctx.baseline = "middle";
    this.ctx.font = "18px 'Google Sans Code', sans-serif";

    // 计算整体文本的宽度，以便水平居中
    const tText = "t";
    const equalText = "=";
    const valueText = t.toFixed(2);

    // 测量各部分文本的宽度
    const tWidth = this.ctx.measureText(tText).width;
    const equalWidth = this.ctx.measureText(equalText).width;
    const valueWidth = this.ctx.measureText(valueText).width;

    // 计算总宽度和起始位置
    const totalWidth = tWidth + equalWidth + valueWidth;
    const startX = this.canvas.offsetWidth / 2 - totalWidth / 2;
    const y = this.canvas.offsetHeight - 25;

    // 绘制"t"
    this.ctx.fillStyle = "lightblue";
    this.ctx.fillText(tText, startX + tWidth / 2 - 10, y);

    // 绘制"="
    this.ctx.fillStyle = "silver";
    this.ctx.fillText(equalText, startX + tWidth + equalWidth / 2, y);

    // 绘制数值
    this.ctx.fillStyle = "darkgoldenrod";
    this.ctx.fillText(valueText, startX + tWidth + equalWidth + valueWidth / 2 + 10, y);
  }

  // 绘制贝塞尔曲线
  drawBezierCurve() {
    const { P0, P1, P2 } = this.controlPoints;

    // 计算当前应该绘制的曲线长度（与切线同步）
    const curveProgress = Math.max(
      0,
      (this.animation.progress - this.animation.curveDelay / this.animation.duration) /
        (1 - this.animation.curveDelay / this.animation.duration),
    );

    this.ctx.strokeStyle = "#4CAF50";
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";

    this.ctx.beginPath();
    this.ctx.moveTo(P0.x, P0.y);

    // 绘制曲线
    const steps = 100;
    for (let i = 1; i <= steps * curveProgress; i++) {
      const t = i / steps;
      const point = this.getBezierPoint(t);
      this.ctx.lineTo(point.x, point.y);
    }

    this.ctx.stroke();

    // 绘制 P(t)（运动进度指示点）
    const currentPoint = this.getBezierPoint(curveProgress);
    this.ctx.fillStyle = "#FFD700";
    this.ctx.beginPath();
    this.ctx.arc(currentPoint.x, currentPoint.y, 6, 0, Math.PI * 2); // 增大半径
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // 在P(t)点下方绘制文本标签
    this.ctx.fillStyle = "#FFD700";
    this.ctx.font = "14px 'Google Sans Code', monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText("P(t)", currentPoint.x, currentPoint.y + 25);
  }

  // 绘制状态信息
  drawStatusInfo() {
    // 在右上角显示当前状态
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "18px sans-serif";
    this.ctx.textAlign = "right";
    this.ctx.fillText(`状态: ${this.statusDisplay.currentPhase}`, this.canvas.width - 20, 30);
    this.ctx.fillText(`进度: ${Math.round(this.animation.progress * 100)}%`, this.canvas.width - 20, 50);

    // 绘制播放按钮
    this.drawPlayButton();

    // 在左上角显示公式
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = "#4CAF50";
    this.ctx.font = "16px 'Google Sans Code', sans-serif";
    this.ctx.fillText("二次贝塞尔曲线原理", 20, 30);
  }

  // 获取按钮背景颜色
  getButtonColor() {
    const { isPlaying, isPaused } = this.animation;
    const { isHovered } = this.buttonHoverState;

    // 播放中状态
    if (isPlaying && !isPaused) {
      return isHovered ? "#555" : "#333";
    }

    // 暂停状态
    if (isPaused) {
      return isHovered ? "#8B4513" : "#5B2500";
    }

    // 未播放状态（默认）
    return isHovered ? "#1d7b2a" : "#0a4F10";
  }

  // 绘制播放按钮
  drawPlayButton() {
    const buttonX = this.canvas.offsetWidth - 120;
    const buttonY = 20;
    const buttonWidth = 100;
    const buttonHeight = 40;

    // 按钮背景颜色逻辑
    let buttonColor = this.getButtonColor();

    this.ctx.fillStyle = buttonColor;
    this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // 按钮边框
    this.ctx.strokeStyle = "#aaa";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // 按钮文字
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "16px sans-serif";
    this.ctx.textAlign = "center";

    let buttonText;
    if (this.animation.isPaused) {
      buttonText = "继续";
    } else if (this.animation.isPlaying) {
      buttonText = "暂停";
    } else {
      buttonText = "播放动画";
    }

    this.ctx.fillText(buttonText, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 + 6);
  }
}

new 二次贝塞尔曲线动画();

class 三次贝塞尔曲线动画 {
  constructor() {
    this.canvas = document.getElementById("canvas-三次贝塞尔曲线-动画");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // 三次贝塞尔曲线的四个控制点
    this.controlPoints = {
      P0: { x: 75, y: 525 },
      P1: { x: 225, y: 100 },
      P2: { x: 625, y: 125 },
      P3: { x: 700, y: 425 },
    };

    // 拖拽相关状态
    this.dragState = {
      isDragging: false,
      draggedPoint: null,
      startX: 0,
      startY: 0,
      hoveredPoint: null, // 当前悬停的控制点
    };

    // 播放按钮悬停状态
    this.buttonHoverState = {
      isHovered: false,
    };

    // 动画状态
    this.animation = {
      // 动画进度
      progress: 0,
      duration: 4000, // 4秒
      startTime: null,
      isPlaying: false, // 是否正在播放
      isPaused: false, // 是否暂停
      pausedProgress: 0, // 暂停时的进度
      pausedTime: 0, // 暂停时的时间

      // 辅助线动画
      showControlLines: true, // 控制线一开始就显示
      showTangentLines: false,
      showCurve: false,

      // 时间控制
      controlLinesDelay: 0, // 控制线立即显示
      tangentLinesDelay: 1000, // 1秒后显示切线
      curveDelay: 1000, // 1秒后开始绘制曲线，与切线同步
    };

    // 状态提示
    this.statusDisplay = {
      currentPhase: "准备中",
      phases: ["准备中", "显示控制线", "显示切线", "绘制曲线", "完成"],
      currentIndex: 0,
    };

    // 初始化
    this.init();
  }

  // 初始化
  init() {
    // 添加各种鼠标事件
    this.addMouseEvents();

    // 不自动开始动画，等待用户点击播放按钮
    this.draw();
  }

  // 添加各种鼠标事件
  addMouseEvents() {
    this.canvas.addEventListener("click", (e) => this.handleCanvasClick(e));
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e));
    this.canvas.addEventListener("mouseleave", (e) => this.handleMouseLeave(e));
  }

  // 处理鼠标按下事件
  handleMouseDown(e) {
    if (this.animation.isPlaying) return; // 动画播放时不允许拖拽

    const rect = this.canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // 检查是否点击了控制点
    const clickedPoint = this.getClickedControlPoint(x, y);
    if (clickedPoint) {
      this.dragState.isDragging = true;
      this.dragState.draggedPoint = clickedPoint;
      this.dragState.startX = x;
      this.dragState.startY = y;
      this.canvas.style.cursor = "grabbing";
    }
  }

  // 处理鼠标移动事件
  handleMouseMove(e) {
    if (!this.dragState.isDragging) {
      // 检查鼠标悬停在控制点上
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);

      const hoveredPoint = this.getClickedControlPoint(x, y);
      if (hoveredPoint !== this.dragState.hoveredPoint) {
        this.dragState.hoveredPoint = hoveredPoint;
        if (hoveredPoint && !this.animation.isPlaying) {
          this.canvas.style.cursor = "grab";
        } else {
          this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
        }
        this.draw(); // 重新绘制以更新颜色
      }

      // 检查播放按钮悬停状态
      const isButtonHovered = this.isClickOnPlayButton(x, y);
      if (isButtonHovered !== this.buttonHoverState.isHovered) {
        this.buttonHoverState.isHovered = isButtonHovered;
        this.draw(); // 重新绘制以更新按钮颜色
      }
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // 更新控制点位置
    if (this.dragState.draggedPoint) {
      this.dragState.draggedPoint.x = x;
      this.dragState.draggedPoint.y = y;
      this.draw(); // 重新绘制
    }
  }

  // 处理鼠标松开事件
  handleMouseUp(e) {
    if (this.dragState.isDragging) {
      this.dragState.isDragging = false;
      this.dragState.draggedPoint = null;
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
    }
  }

  // 处理鼠标离开事件
  handleMouseLeave(e) {
    if (this.dragState.isDragging) {
      this.dragState.isDragging = false;
      this.dragState.draggedPoint = null;
    }
    // 清除悬停状态
    if (this.dragState.hoveredPoint) {
      this.dragState.hoveredPoint = null;
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
      this.draw(); // 重新绘制以更新颜色
    }
    // 清除按钮悬停状态
    if (this.buttonHoverState.isHovered) {
      this.buttonHoverState.isHovered = false;
      this.draw(); // 重新绘制以更新按钮颜色
    }
  }

  // 获取被点击的控制点
  getClickedControlPoint(x, y) {
    const { P0, P1, P2, P3 } = this.controlPoints;
    const clickRadius = 15; // 点击半径

    // 检查P0
    if (Math.sqrt((x - P0.x) ** 2 + (y - P0.y) ** 2) <= clickRadius) {
      return P0;
    }
    // 检查P1
    if (Math.sqrt((x - P1.x) ** 2 + (y - P1.y) ** 2) <= clickRadius) {
      return P1;
    }
    // 检查P2
    if (Math.sqrt((x - P2.x) ** 2 + (y - P2.y) ** 2) <= clickRadius) {
      return P2;
    }
    // 检查P3
    if (Math.sqrt((x - P3.x) ** 2 + (y - P3.y) ** 2) <= clickRadius) {
      return P3;
    }

    return null;
  }

  // 处理Canvas点击事件
  handleCanvasClick(e) {
    if (this.dragState.isDragging) return; // 如果正在拖拽，不处理点击

    const rect = this.canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // 检查是否点击了播放按钮
    if (this.isClickOnPlayButton(x, y)) {
      if (this.animation.isPlaying && !this.animation.isPaused) {
        // 正在播放时，点击暂停
        this.pauseAnimation();
      } else {
        // 暂停时或未播放时，点击开始/继续
        this.startAnimation();
      }
    }
  }

  // 检查是否点击了播放按钮
  isClickOnPlayButton(x, y) {
    const buttonX = this.canvas.offsetWidth - 120;
    const buttonY = 20;
    const buttonWidth = 100;
    const buttonHeight = 40;

    return x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight;
  }

  // 开始动画
  startAnimation() {
    if (this.animation.isPlaying && !this.animation.isPaused) return; // 防止重复启动

    if (this.animation.isPaused) {
      // 从暂停状态继续播放
      this.continueAnimation();
    } else {
      // 开始新的动画
      this.animation.isPlaying = true;
      this.animation.isPaused = false;
      this.animation.startTime = performance.now();
      this.animation.progress = 0;
      this.animation.showTangentLines = true; // 立即显示切线
      this.animation.showCurve = false;
      this.statusDisplay.currentIndex = 0;
      this.animate();
    }
  }

  // 暂停动画
  pauseAnimation() {
    if (!this.animation.isPlaying || this.animation.isPaused) return;

    this.animation.isPaused = true;
    this.animation.pausedProgress = this.animation.progress;
    this.animation.pausedTime = performance.now();
    this.animation.isPlaying = false;

    // 立即重新绘制以更新按钮文本
    this.draw();
  }

  // 继续动画
  continueAnimation() {
    if (!this.animation.isPaused) return;

    this.animation.isPaused = false;
    this.animation.isPlaying = true;

    // 计算剩余时间，从暂停点继续
    const remainingProgress = 1 - this.animation.pausedProgress;
    const remainingTime = remainingProgress * this.animation.duration;
    this.animation.startTime = performance.now() - (this.animation.duration - remainingTime);

    // 确保暂停时的状态得到保持
    this.animation.progress = this.animation.pausedProgress;

    // 确保切线保持显示状态
    this.animation.showTangentLines = true;

    // 立即重新绘制以更新按钮文本
    this.draw();
    this.animate();
  }

  // 重新开始动画
  restartAnimation() {
    this.animation.isPlaying = false;
    this.animation.isPaused = false;
    this.animation.startTime = null;
    this.animation.progress = 0;
    this.animation.pausedProgress = 0;
    this.animation.pausedTime = 0;
    this.animation.showTangentLines = false; // 重置时隐藏切线
    this.animation.showCurve = false;
    this.statusDisplay.currentIndex = 0;
    this.draw();
  }

  // 动画循环
  animate() {
    if (!this.animation.isPlaying || this.animation.isPaused) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.animation.startTime;
    this.animation.progress = Math.min(elapsed / this.animation.duration, 1);

    this.updateAnimationState();
    this.updateStatus();
    this.draw();

    if (this.animation.progress < 1) {
      requestAnimationFrame(() => this.animate());
    } else {
      // 动画完成后，立即重新启用播放按钮，但保持动画状态
      this.animation.isPlaying = false;
      this.animation.isPaused = false;
      this.updateStatus(); // 更新状态显示
      this.draw(); // 重新绘制以更新播放按钮状态
    }
  }

  // 更新动画状态
  updateAnimationState() {
    const progress = this.animation.progress;

    // 曲线绘制时机（与切线同步）
    if (progress >= this.animation.curveDelay / this.animation.duration) {
      this.animation.showCurve = true;
    }

    // 切线在开始播放时立即显示，不需要等待进度
  }

  // 更新状态显示
  updateStatus() {
    const progress = this.animation.progress;
    const phaseIndex = Math.floor(progress * (this.statusDisplay.phases.length - 1));

    this.statusDisplay.currentIndex = Math.min(phaseIndex, this.statusDisplay.phases.length - 1);
    this.statusDisplay.currentPhase = this.statusDisplay.phases[this.statusDisplay.currentIndex];
  }

  // 计算三次贝塞尔曲线上的点
  getBezierPoint(t) {
    const { P0, P1, P2, P3 } = this.controlPoints;
    const x =
      Math.pow(1 - t, 3) * P0.x +
      3 * Math.pow(1 - t, 2) * t * P1.x +
      3 * (1 - t) * Math.pow(t, 2) * P2.x +
      Math.pow(t, 3) * P3.x;
    const y =
      Math.pow(1 - t, 3) * P0.y +
      3 * Math.pow(1 - t, 2) * t * P1.y +
      3 * (1 - t) * Math.pow(t, 2) * P2.y +
      Math.pow(t, 3) * P3.y;
    return { x, y };
  }

  // 计算辅助线上的点
  getHelperPoint(t) {
    const { P0, P1, P2, P3 } = this.controlPoints;

    // P0到P1的线段上的点
    const Q0 = {
      x: P0.x + (P1.x - P0.x) * t,
      y: P0.y + (P1.y - P0.y) * t,
    };

    // P1到P2的线段上的点
    const Q1 = {
      x: P1.x + (P2.x - P1.x) * t,
      y: P1.y + (P2.y - P1.y) * t,
    };

    // P2到P3的线段上的点
    const Q2 = {
      x: P2.x + (P3.x - P2.x) * t,
      y: P2.y + (P3.y - P2.y) * t,
    };

    // 二次贝塞尔曲线的辅助点
    const R0 = {
      x: Q0.x + (Q1.x - Q0.x) * t,
      y: Q0.y + (Q1.y - Q0.y) * t,
    };

    const R1 = {
      x: Q1.x + (Q2.x - Q1.x) * t,
      y: Q1.y + (Q2.y - Q1.y) * t,
    };

    return { Q0, Q1, Q2, R0, R1 };
  }

  // 绘制
  draw() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制网格
    this.drawGrid();

    // 绘制控制线
    if (this.animation.showControlLines) {
      this.drawControlLines();
    }

    // 绘制控制点
    this.drawControlPoints();

    // 绘制切线和辅助点
    if (this.animation.showTangentLines) {
      this.drawTangentLines();
    }

    // 绘制贝塞尔曲线
    this.drawBezierCurve();

    // 绘制状态信息
    this.drawStatusInfo();
  }

  // 绘制网格
  drawGrid() {
    this.ctx.strokeStyle = "#ffffff0c";
    this.ctx.lineWidth = 1;

    // 绘制垂直线
    for (let x = 0; x <= this.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // 绘制水平线
    for (let y = 0; y <= this.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  // 绘制控制点
  drawControlPoints() {
    const { P0, P1, P2, P3 } = this.controlPoints;

    // 绘制P0
    if (this.dragState.hoveredPoint === P0) {
      this.ctx.fillStyle = "#4CAF50"; // 悬停时的亮绿色
    } else {
      this.ctx.fillStyle = "#1C6F20"; // 正常时的深绿色
    }
    this.ctx.beginPath();
    this.ctx.arc(P0.x, P0.y, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 绘制P1
    if (this.dragState.hoveredPoint === P1) {
      this.ctx.fillStyle = "#FF9800"; // 悬停时的亮橙色
    } else {
      this.ctx.fillStyle = "#aF4800"; // 正常时的深橙色
    }
    this.ctx.beginPath();
    this.ctx.arc(P1.x, P1.y, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 绘制P2
    if (this.dragState.hoveredPoint === P2) {
      this.ctx.fillStyle = "#2196F3"; // 悬停时的亮蓝色
    } else {
      this.ctx.fillStyle = "#1146a3"; // 正常时的深蓝色
    }
    this.ctx.beginPath();
    this.ctx.arc(P2.x, P2.y, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 绘制P3
    if (this.dragState.hoveredPoint === P3) {
      this.ctx.fillStyle = "#E91E63"; // 悬停时的亮粉色
    } else {
      this.ctx.fillStyle = "#a01547"; // 正常时的深粉色
    }
    this.ctx.beginPath();
    this.ctx.arc(P3.x, P3.y, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 绘制标签
    this.ctx.fillStyle = "lightsteelblue";
    this.ctx.font = "16px 'Google Sans Code', monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText("P₀", P0.x - 25, P0.y + 5);
    this.ctx.fillText("P₁", P1.x, P1.y - 20);
    this.ctx.fillText("P₂", P2.x, P2.y - 20);
    this.ctx.fillText("P₃", P3.x + 25, P3.y + 5);
  }

  // 绘制控制线
  drawControlLines() {
    const { P0, P1, P2, P3 } = this.controlPoints;

    this.ctx.strokeStyle = "#666";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    // P0到P1
    this.ctx.beginPath();
    this.ctx.moveTo(P0.x, P0.y);
    this.ctx.lineTo(P1.x, P1.y);
    this.ctx.stroke();

    // P1到P2
    this.ctx.beginPath();
    this.ctx.moveTo(P1.x, P1.y);
    this.ctx.lineTo(P2.x, P2.y);
    this.ctx.stroke();

    // P2到P3
    this.ctx.beginPath();
    this.ctx.moveTo(P2.x, P2.y);
    this.ctx.lineTo(P3.x, P3.y);
    this.ctx.stroke();

    this.ctx.setLineDash([]);
  }

  // 绘制切线和辅助点
  drawTangentLines() {
    const { P0, P1, P2, P3 } = this.controlPoints;

    // 计算当前参数t（基于动画进度）
    const t = Math.max(
      0,
      (this.animation.progress - this.animation.tangentLinesDelay / this.animation.duration) /
        (1 - this.animation.tangentLinesDelay / this.animation.duration),
    );

    // 获取辅助点（即使t=0也要显示）
    const { Q0, Q1, Q2, R0, R1 } = this.getHelperPoint(t);

    // 绘制一级辅助线 - Q0到Q1（第一段）
    this.ctx.lineWidth = 2;

    // 第一段线的第1种颜色
    this.ctx.strokeStyle = "#a58";
    this.ctx.beginPath();
    this.ctx.moveTo(Q0.x, Q0.y);
    this.ctx.lineTo(Q1.x, Q1.y);
    this.ctx.stroke();

    // 绘制一级辅助线 - Q1到Q2（第二段）
    // 第二段线的第1种颜色
    this.ctx.strokeStyle = "darkgoldenrod";
    this.ctx.beginPath();
    this.ctx.moveTo(Q1.x, Q1.y);
    this.ctx.lineTo(Q2.x, Q2.y);
    this.ctx.stroke();

    // 绘制二级辅助线（切线）
    this.ctx.strokeStyle = "#00BCD4";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(R0.x, R0.y);
    this.ctx.lineTo(R1.x, R1.y);
    this.ctx.stroke();

    // 绘制一级辅助点（Q0, Q1, Q2）
    this.ctx.fillStyle = "#FF5722";
    this.ctx.beginPath();
    this.ctx.arc(Q0.x, Q0.y, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#9C27B0";
    this.ctx.beginPath();
    this.ctx.arc(Q1.x, Q1.y, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#FF9800";
    this.ctx.beginPath();
    this.ctx.arc(Q2.x, Q2.y, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制二级辅助点（R0, R1）
    this.ctx.fillStyle = "#00BCD4";
    this.ctx.beginPath();
    this.ctx.arc(R0.x, R0.y, 6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#4CAF50";
    this.ctx.beginPath();
    this.ctx.arc(R1.x, R1.y, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制参数t的指示器
    this.ctx.textAlign = "center";
    this.ctx.baseline = "middle";
    this.ctx.font = "18px 'Google Sans Code', sans-serif";

    // 计算整体文本的宽度，以便水平居中
    const tText = "t";
    const equalText = "=";
    const valueText = t.toFixed(2);

    // 测量各部分文本的宽度
    const tWidth = this.ctx.measureText(tText).width;
    const equalWidth = this.ctx.measureText(equalText).width;
    const valueWidth = this.ctx.measureText(valueText).width;

    // 计算总宽度和起始位置
    const totalWidth = tWidth + equalWidth + valueWidth;
    const startX = this.canvas.offsetWidth / 2 - totalWidth / 2;
    const y = this.canvas.offsetHeight - 25;

    // 绘制"t"
    this.ctx.fillStyle = "lightblue";
    this.ctx.fillText(tText, startX + tWidth / 2 - 10, y);

    // 绘制"="
    this.ctx.fillStyle = "silver";
    this.ctx.fillText(equalText, startX + tWidth + equalWidth / 2, y);

    // 绘制数值
    this.ctx.fillStyle = "darkgoldenrod";
    this.ctx.fillText(valueText, startX + tWidth + equalWidth + valueWidth / 2 + 10, y);
  }

  // 绘制贝塞尔曲线
  drawBezierCurve() {
    const { P0, P1, P2, P3 } = this.controlPoints;

    // 计算当前应该绘制的曲线长度（与切线同步）
    const curveProgress = Math.max(
      0,
      (this.animation.progress - this.animation.curveDelay / this.animation.duration) /
        (1 - this.animation.curveDelay / this.animation.duration),
    );

    this.ctx.strokeStyle = "#4CAF50";
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";

    this.ctx.beginPath();
    this.ctx.moveTo(P0.x, P0.y);

    // 绘制曲线
    const steps = 100;
    for (let i = 1; i <= steps * curveProgress; i++) {
      const t = i / steps;
      const point = this.getBezierPoint(t);
      this.ctx.lineTo(point.x, point.y);
    }

    this.ctx.stroke();

    // 绘制 P(t)（运动进度指示点）
    const currentPoint = this.getBezierPoint(curveProgress);
    this.ctx.fillStyle = "#FFD700";
    this.ctx.beginPath();
    this.ctx.arc(currentPoint.x, currentPoint.y, 6, 0, Math.PI * 2); // 增大半径
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // 在P(t)点下方绘制文本标签
    this.ctx.fillStyle = "#FFD700";
    this.ctx.font = "14px 'Google Sans Code', monospace";
    this.ctx.textAlign = "center";
    this.ctx.fillText("P(t)", currentPoint.x, currentPoint.y + 25);
  }

  // 绘制状态信息
  drawStatusInfo() {
    // 在右上角显示当前状态
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "18px sans-serif";
    this.ctx.textAlign = "right";
    this.ctx.fillText(`状态: ${this.statusDisplay.currentPhase}`, this.canvas.width - 20, 30);
    this.ctx.fillText(`进度: ${Math.round(this.animation.progress * 100)}%`, this.canvas.width - 20, 50);

    // 绘制播放按钮
    this.drawPlayButton();

    // 在左上角显示公式
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = "#4CAF50";
    this.ctx.font = "16px 'Google Sans Code', sans-serif";
    this.ctx.fillText("三次贝塞尔曲线原理", 20, 30);
  }

  // 获取按钮背景颜色
  getButtonColor() {
    const { isPlaying, isPaused } = this.animation;
    const { isHovered } = this.buttonHoverState;

    // 播放中状态
    if (isPlaying && !isPaused) {
      return isHovered ? "#555" : "#333";
    }

    // 暂停状态
    if (isPaused) {
      return isHovered ? "#8B4513" : "#5B2500";
    }

    // 未播放状态（默认）
    return isHovered ? "#1d7b2a" : "#0a4F10";
  }

  // 绘制播放按钮
  drawPlayButton() {
    const buttonX = this.canvas.offsetWidth - 120;
    const buttonY = 20;
    const buttonWidth = 100;
    const buttonHeight = 40;

    // 按钮背景颜色逻辑
    let buttonColor = this.getButtonColor();

    this.ctx.fillStyle = buttonColor;
    this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // 按钮边框
    this.ctx.strokeStyle = "#aaa";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // 按钮文字
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "16px sans-serif";
    this.ctx.textAlign = "center";

    let buttonText;
    if (this.animation.isPaused) {
      buttonText = "继续";
    } else if (this.animation.isPlaying) {
      buttonText = "暂停";
    } else {
      buttonText = "播放动画";
    }

    this.ctx.fillText(buttonText, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2 + 6);
  }
}

new 三次贝塞尔曲线动画();

class 采样点 {
  constructor() {
    this.canvas = document.getElementById("canvas-采样点");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.cssWidth = this.canvas.offsetWidth;
    this.cssHeight = this.canvas.offsetHeight;
    this.采样点数量 = 2; // 默认10个采样点
    this.容差 = 1;
    this.当前鼠标位置 = null;

    // 采样点数量滑块配置
    this.采样点滑块 = {
      x: 20,
      y: 40,
      width: 200,
      height: 6,
      thumbRadius: 8,
      minValue: 1,
      maxValue: 100,
      value: 2,
      isDragging: false,
      thumbHovered: false,
    };

    // 容差滑块配置
    this.容差滑块 = {
      x: 20,
      y: 100,
      width: 200,
      height: 6,
      thumbRadius: 8,
      minValue: 0,
      maxValue: 40,
      value: 1,
      isDragging: false,
      thumbHovered: false,
    };

    // 复选框配置
    this.显示t值复选框 = {
      x: 20,
      y: 140,
      size: 16,
      checked: true,
      hovered: false,
      label: "显示t",
    };

    this.显示采样点复选框 = {
      x: 20,
      y: 170,
      size: 16,
      checked: true,
      hovered: false,
      label: "显示采样点",
    };

    this.显示有效采样范围复选框 = {
      x: 20,
      y: 200,
      size: 16,
      checked: false,
      hovered: false,
      label: "显示有效采样范围",
    };

    this.三次贝塞尔曲线坐标 = {
      P0: {
        x: 100,
        y: this.cssHeight - 75,
      },
      P1: {
        x: this.cssWidth / 2 - 100,
        y: 150,
      },
      P2: {
        x: this.cssWidth / 2 + 100,
        y: 100,
      },
      P3: {
        x: this.cssWidth - 100,
        y: this.cssHeight - 150,
      },
    };

    this.添加事件监听器();
    this.绘制全部();

    // 设置默认鼠标样式
    this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
  }

  绘制全部() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.绘制三次贝塞尔曲线(this.三次贝塞尔曲线坐标);
    this.绘制采样点(this.采样点数量);
    this.绘制滑块();
    this.绘制状态文本();
  }

  绘制三次贝塞尔曲线(三次贝塞尔曲线坐标) {
    this.ctx.save();
    this.ctx.moveTo(三次贝塞尔曲线坐标.P0.x, 三次贝塞尔曲线坐标.P0.y);
    this.ctx.bezierCurveTo(
      三次贝塞尔曲线坐标.P1.x,
      三次贝塞尔曲线坐标.P1.y,
      三次贝塞尔曲线坐标.P2.x,
      三次贝塞尔曲线坐标.P2.y,
      三次贝塞尔曲线坐标.P3.x,
      三次贝塞尔曲线坐标.P3.y,
    );

    // 检查鼠标是否在曲线内
    if (this.鼠标在曲线内()) {
      this.ctx.strokeStyle = "gold";
    } else {
      this.ctx.strokeStyle = "#fff3";
    }

    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }

  鼠标在曲线内() {
    // 获取当前鼠标位置（从全局变量或事件中获取）
    if (!this.当前鼠标位置) return false;

    const { x, y } = this.当前鼠标位置;

    // 检查鼠标是否在贝塞尔曲线附近
    return this.坐标位于贝塞尔曲线附近(x, y, this.三次贝塞尔曲线坐标);
  }

  坐标位于贝塞尔曲线附近(x, y, 三次贝塞尔曲线坐标) {
    const 容差 = this.容差;
    const 步数 = this.采样点数量;

    for (let i = 0; i < 步数; i++) {
      let t;
      if (步数 === 1) {
        t = 0.5;
      } else {
        t = i / (步数 - 1);
      }
      const 点 = this.获取三次贝塞尔曲线采样点坐标(t, 三次贝塞尔曲线坐标);
      const 距离 = Math.sqrt((x - 点.x) ** 2 + (y - 点.y) ** 2);
      if (距离 < 容差) {
        return true;
      }
    }
    return false;
  }

  绘制状态文本() {
    if (this.鼠标在曲线内()) {
      this.ctx.save();
      this.ctx.fillStyle = "lightsteelblue";
      this.ctx.font = "16px 'Noto Sans SC', sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText("鼠标位于三次贝塞尔曲线内", this.cssWidth / 2, this.cssHeight - 50);
      this.ctx.restore();
    }
  }

  绘制采样点(采样点数量) {
    if (采样点数量 < 1) return;

    this.ctx.save();

    for (let i = 0; i < 采样点数量; i++) {
      let t;
      if (采样点数量 === 1) {
        // 如果只有一个采样点，让它位于50%的位置
        t = 0.5;
      } else {
        // 多个采样点时，均匀分布
        t = i / (采样点数量 - 1);
      }
      const 点 = this.获取三次贝塞尔曲线采样点坐标(t, this.三次贝塞尔曲线坐标);

      // 绘制采样区域（根据复选框状态决定是否显示）
      if (this.显示有效采样范围复选框.checked) {
        this.ctx.fillStyle = "rgba(255, 107, 107, 0.2)";
        this.ctx.beginPath();
        this.ctx.arc(点.x, 点.y, this.容差, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // 绘制采样点（根据复选框状态决定是否显示）
      if (this.显示采样点复选框.checked) {
        this.ctx.fillStyle = "#FF6B6B";
        this.ctx.beginPath();
        this.ctx.arc(点.x, 点.y, 4, 0, Math.PI * 2);
        this.ctx.fill();

        // 绘制采样点边框
        this.ctx.strokeStyle = "#fff";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }

      // 绘制t值标签（根据复选框状态决定是否显示）
      if (this.显示t值复选框.checked) {
        this.ctx.fillStyle = "#fff";
        this.ctx.font = "12px Google Sans Code, monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.格式化t值(t), 点.x, 点.y - 10);
      }
    }

    this.ctx.restore();
  }

  获取三次贝塞尔曲线采样点坐标(t, 三次贝塞尔曲线坐标) {
    const { P0, P1, P2, P3 } = 三次贝塞尔曲线坐标;
    const mt = 1 - t;

    return {
      x: mt ** 3 * P0.x + 3 * mt ** 2 * t * P1.x + 3 * mt * t ** 2 * P2.x + t ** 3 * P3.x,
      y: mt ** 3 * P0.y + 3 * mt ** 2 * t * P1.y + 3 * mt * t ** 2 * P2.y + t ** 3 * P3.y,
    };
  }

  格式化t值(t) {
    // 如果t是整数，直接返回整数形式
    if (Number.isInteger(t)) {
      return t.toString();
    }

    // 如果是小数，去掉末尾的0
    const 格式化后 = t.toFixed(2);
    if (格式化后.endsWith(".00")) {
      return 格式化后.slice(0, -3); // 去掉.00
    } else if (格式化后.endsWith("0")) {
      return 格式化后.slice(0, -1); // 去掉末尾的0
    }

    return 格式化后;
  }

  添加事件监听器() {
    this.canvas.addEventListener("mousedown", this.处理鼠标按下.bind(this));
    this.canvas.addEventListener("mousemove", this.处理鼠标移动.bind(this));
    this.canvas.addEventListener("mouseup", this.处理鼠标抬起.bind(this));
  }

  处理鼠标按下(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (this.鼠标悬停在滑块thumb内(mouseX, mouseY, this.采样点滑块)) {
      this.采样点滑块.isDragging = true;
      this.更新采样点滑块值(mouseX);
    } else if (this.鼠标悬停在滑块thumb内(mouseX, mouseY, this.容差滑块)) {
      this.容差滑块.isDragging = true;
      this.更新容差滑块值(mouseX);
    } else if (this.鼠标悬停在复选框内(mouseX, mouseY, this.显示t值复选框)) {
      this.显示t值复选框.checked = !this.显示t值复选框.checked;
      this.绘制全部();
    } else if (this.鼠标悬停在复选框内(mouseX, mouseY, this.显示采样点复选框)) {
      this.显示采样点复选框.checked = !this.显示采样点复选框.checked;
      this.绘制全部();
    } else if (this.鼠标悬停在复选框内(mouseX, mouseY, this.显示有效采样范围复选框)) {
      this.显示有效采样范围复选框.checked = !this.显示有效采样范围复选框.checked;
      this.绘制全部();
    }
  }

  处理鼠标移动(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 保存当前鼠标位置
    this.当前鼠标位置 = { x: mouseX, y: mouseY };

    // 检查滑块thumb悬停
    this.采样点滑块.thumbHovered = this.鼠标悬停在滑块thumb内(mouseX, mouseY, this.采样点滑块);
    this.容差滑块.thumbHovered = this.鼠标悬停在滑块thumb内(mouseX, mouseY, this.容差滑块);

    // 检查复选框悬停
    this.显示t值复选框.hovered = this.鼠标悬停在复选框内(mouseX, mouseY, this.显示t值复选框);
    this.显示采样点复选框.hovered = this.鼠标悬停在复选框内(mouseX, mouseY, this.显示采样点复选框);
    this.显示有效采样范围复选框.hovered = this.鼠标悬停在复选框内(mouseX, mouseY, this.显示有效采样范围复选框);

    // 根据悬停状态改变鼠标样式
    if (this.显示t值复选框.hovered || this.显示采样点复选框.hovered || this.显示有效采样范围复选框.hovered) {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
    } else if (this.采样点滑块.thumbHovered || this.容差滑块.thumbHovered) {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
    } else {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
    }

    // 处理拖拽
    if (this.采样点滑块.isDragging) {
      this.更新采样点滑块值(mouseX);
    } else if (this.容差滑块.isDragging) {
      this.更新容差滑块值(mouseX);
    }

    this.绘制全部();
  }

  处理鼠标抬起(e) {
    this.采样点滑块.isDragging = false;
    this.容差滑块.isDragging = false;
  }

  鼠标悬停在滑块thumb内(x, y, 滑块对象) {
    const thumbX = this.获取滑块thumb位置(滑块对象);
    const thumbY = 滑块对象.y + 滑块对象.height / 2;
    const 距离 = Math.sqrt((x - thumbX) ** 2 + (y - thumbY) ** 2);
    return 距离 <= 滑块对象.thumbRadius;
  }

  获取滑块thumb位置(滑块对象) {
    const 比例 = (滑块对象.value - 滑块对象.minValue) / (滑块对象.maxValue - 滑块对象.minValue);
    return 滑块对象.x + 滑块对象.thumbRadius + 比例 * (滑块对象.width - 滑块对象.thumbRadius * 2);
  }

  更新采样点滑块值(mouseX) {
    const 相对位置 = Math.max(
      0,
      Math.min(
        1,
        (mouseX - this.采样点滑块.x - this.采样点滑块.thumbRadius) /
          (this.采样点滑块.width - this.采样点滑块.thumbRadius * 2),
      ),
    );
    this.采样点滑块.value = Math.round(
      this.采样点滑块.minValue + 相对位置 * (this.采样点滑块.maxValue - this.采样点滑块.minValue),
    );
    this.采样点数量 = this.采样点滑块.value;
  }

  更新容差滑块值(mouseX) {
    const 相对位置 = Math.max(
      0,
      Math.min(
        1,
        (mouseX - this.容差滑块.x - this.容差滑块.thumbRadius) / (this.容差滑块.width - this.容差滑块.thumbRadius * 2),
      ),
    );
    this.容差滑块.value = Math.round(
      this.容差滑块.minValue + 相对位置 * (this.容差滑块.maxValue - this.容差滑块.minValue),
    );
    this.容差 = this.容差滑块.value;
  }

  鼠标悬停在复选框内(x, y, 复选框) {
    // 计算复选框文本的结束位置
    const 复选框文本开始x = 复选框.x + 复选框.size + 10;

    // 保存当前字体状态
    const 当前字体 = this.ctx.font;

    // 设置字体并测量文字宽度
    this.ctx.font = "14px 'Noto Sans SC', sans-serif";
    const 显示文字宽度 = this.ctx.measureText("显示").width;

    let 后续文字宽度 = 0;
    if (复选框.label === "显示t") {
      this.ctx.font = "14px 'Google Sans Code', monospace";
      后续文字宽度 = this.ctx.measureText("t").width;
    } else if (复选框.label === "显示采样点") {
      this.ctx.font = "14px 'Noto Sans SC', sans-serif";
      后续文字宽度 = this.ctx.measureText("采样点").width;
    } else if (复选框.label === "显示有效采样范围") {
      this.ctx.font = "14px 'Noto Sans SC', sans-serif";
      后续文字宽度 = this.ctx.measureText("有效采样范围").width;
    }

    // 恢复字体状态
    this.ctx.font = 当前字体;

    const 复选框文本结束x = 复选框文本开始x + 显示文字宽度 + 3 + 后续文字宽度;

    // 检查鼠标是否在复选框、文本或空隙范围内
    return x >= 复选框.x && x <= 复选框文本结束x && y >= 复选框.y && y <= 复选框.y + 复选框.size;
  }

  绘制滑块() {
    this.ctx.save();

    // 绘制采样点数量滑块
    this.绘制单个滑块(this.采样点滑块, "采样点数量: ", "#4CAF50", "#FF6B6B");

    // 绘制容差滑块
    this.绘制单个滑块(this.容差滑块, "容差: ", "#4CAF50", "#FF6B6B");

    // 绘制复选框
    this.绘制复选框();

    this.ctx.restore();
  }

  绘制单个滑块(滑块对象, 标签文本, 进度条颜色, 数字颜色) {
    // 绘制滑块轨道
    this.ctx.fillStyle = "#333";
    this.ctx.beginPath();
    this.ctx.roundRect(滑块对象.x, 滑块对象.y, 滑块对象.width, 滑块对象.height, [滑块对象.height / 2]);
    this.ctx.fill();

    // 绘制已滑过的部分
    const 比例 = (滑块对象.value - 滑块对象.minValue) / (滑块对象.maxValue - 滑块对象.minValue);
    const 已滑过宽度 = 比例 * 滑块对象.width;
    this.ctx.beginPath();
    this.ctx.fillStyle = 进度条颜色;
    this.ctx.roundRect(滑块对象.x, 滑块对象.y, 已滑过宽度, 滑块对象.height, [
      滑块对象.height / 2,
      0,
      0,
      滑块对象.height / 2,
    ]);
    this.ctx.fill();

    // 绘制滑块thumb（正圆形）
    const thumbX = this.获取滑块thumb位置(滑块对象);
    const thumbY = 滑块对象.y + 滑块对象.height / 2;
    if (滑块对象.thumbHovered) {
      this.ctx.fillStyle = "#FFD700"; // 悬停时高亮
    } else {
      this.ctx.fillStyle = "#FFA500";
    }
    this.ctx.beginPath();
    this.ctx.arc(thumbX, thumbY, 滑块对象.thumbRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制滑块边框
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 绘制当前值（数字部分用单独颜色）
    this.ctx.font = "14px 'Noto Sans SC', sans-serif";
    this.ctx.textAlign = "left";

    // 绘制标签部分
    this.ctx.fillStyle = "#fff";
    this.ctx.fillText(标签文本, 滑块对象.x, 滑块对象.y - 15);

    // 绘制数字部分（用单独颜色）
    const 文字宽度 = this.ctx.measureText(标签文本).width;
    this.ctx.font = "14px Google Sans Code, monospace";
    this.ctx.fillStyle = 数字颜色;
    this.ctx.fillText(滑块对象.value.toString(), 滑块对象.x + 文字宽度 + 5, 滑块对象.y - 15);
  }

  绘制复选框() {
    // 绘制所有复选框
    this.绘制单个复选框(this.显示t值复选框);
    this.绘制单个复选框(this.显示采样点复选框);
    this.绘制单个复选框(this.显示有效采样范围复选框);
  }

  绘制单个复选框(复选框) {
    // 先清除复选框区域，避免残留内容
    this.ctx.clearRect(复选框.x, 复选框.y, 复选框.size, 复选框.size);

    // 绘制复选框边框 - 使用保存的悬停状态
    this.ctx.strokeStyle = "#FFD700b0";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(复选框.x, 复选框.y, 复选框.size, 复选框.size);

    // 如果选中，绘制勾选标记
    if (复选框.checked) {
      this.ctx.fillStyle = "#FFD70040";
      this.ctx.fillRect(复选框.x, 复选框.y, 复选框.size, 复选框.size);

      // 绘制白色勾选符号
      this.ctx.strokeStyle = "#fff";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(复选框.x + 4, 复选框.y + 复选框.size / 2);
      this.ctx.lineTo(复选框.x + 复选框.size / 2, 复选框.y + 复选框.size - 4);
      this.ctx.lineTo(复选框.x + 复选框.size - 4, 复选框.y + 4);
      this.ctx.stroke();
    } else if (复选框.hovered) {
      this.ctx.fillStyle = "#FFD70020";
      this.ctx.fillRect(复选框.x, 复选框.y, 复选框.size, 复选框.size);
    }

    // 绘制标签文字 - 分开绘制"显示"和后面的文字
    this.ctx.fillStyle = "#aaa";
    this.ctx.font = "14px 'Noto Sans SC', sans-serif";
    this.ctx.textAlign = "left";

    // 先绘制"显示"
    this.ctx.fillText("显示", 复选框.x + 复选框.size + 10, 复选框.y + 复选框.size / 2 + 5);

    // 计算"显示"的宽度，然后绘制后面的文字
    const 显示文字宽度 = this.ctx.measureText("显示").width;
    this.ctx.fillStyle = "lightblue";
    // 根据复选框类型设置不同的颜色和字体
    if (复选框.label === "显示t") {
      this.ctx.font = "14px 'Google Sans Code', monospace";
      this.ctx.fillText("t", 复选框.x + 复选框.size + 10 + 显示文字宽度 + 3, 复选框.y + 复选框.size / 2 + 5);
    } else if (复选框.label === "显示采样点") {
      this.ctx.font = "14px 'Noto Sans SC', sans-serif";
      this.ctx.fillText("采样点", 复选框.x + 复选框.size + 10 + 显示文字宽度 + 3, 复选框.y + 复选框.size / 2 + 5);
    } else if (复选框.label === "显示有效采样范围") {
      this.ctx.font = "14px 'Noto Sans SC', sans-serif";
      this.ctx.fillText("有效采样范围", 复选框.x + 复选框.size + 10 + 显示文字宽度 + 3, 复选框.y + 复选框.size / 2 + 5);
    }
  }
}

new 采样点();

class 爱心 {
  constructor() {
    this.canvas = document.getElementById("canvas-三次贝塞尔曲线-爱心");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.cssWidth = this.canvas.offsetWidth;
    this.cssHeight = this.canvas.offsetHeight;

    this.当前悬停控制点 = null;
    this.当前悬停曲线编号 = null;

    this.三次贝塞尔曲线描边颜色组 = {
      普通: "#fff5",
      悬停: "#fed830c0",
      选中: "#a0e532c0",
    };

    // 拖拽相关状态
    this.拖拽状态 = {
      正在拖拽: false,
      拖拽的控制点: null,
      拖拽的曲线段: null,
      拖拽起始位置: { x: 0, y: 0 },
      刚刚结束拖拽: false,
      按住Shift键: false,
      按住Ctrl键: false,
    };

    // 复选框配置
    this.显示控制点序号复选框 = {
      x: this.cssWidth / 2 - 60,
      y: this.cssHeight - 25,
      size: 16,
      checked: true,
      hovered: false,
      label: "显示控制点序号",
    };

    // 定义爱心的所有控制点，相邻曲线共享端点
    this.爱心控制点 = {
      // 第1段曲线的起点（也是第4段曲线的终点）
      "1-P₀&4-P₃": {
        x: this.cssWidth / 2,
        y: 200,
      },
      // 第1段曲线的控制点
      "1-P₁": {
        x: this.cssWidth / 2 - 75,
        y: 100,
      },
      "1-P₂": {
        x: this.cssWidth / 2 - 175,
        y: 100,
      },
      // 第1段曲线的终点（也是第2段曲线的起点）
      "1-P₃&2-P₀": {
        x: this.cssWidth / 2 - 200,
        y: 225,
      },
      // 第2段曲线的控制点
      "2-P₁": {
        x: this.cssWidth / 2 - 225,
        y: 350,
      },
      "2-P₂": {
        x: this.cssWidth / 2 - 25,
        y: 425,
      },
      // 第2段曲线的终点（也是第3段曲线的起点）
      "2-P₃&3-P₀": {
        x: this.cssWidth / 2,
        y: 450,
      },
      // 第3段曲线的控制点
      "3-P₁": {
        x: this.cssWidth / 2 + 25,
        y: 425,
      },
      "3-P₂": {
        x: this.cssWidth / 2 + 225,
        y: 350,
      },
      // 第3段曲线的终点（也是第4段曲线的起点）
      "3-P₃&4-P₀": {
        x: this.cssWidth / 2 + 200,
        y: 225,
      },
      // 第4段曲线的控制点
      "4-P₁": {
        x: this.cssWidth / 2 + 175,
        y: 100,
      },
      "4-P₂": {
        x: this.cssWidth / 2 + 75,
        y: 100,
      },
    };

    // 定义4段曲线的绘制信息，每段曲线包含控制点引用
    this.爱心 = {
      三次贝塞尔坐标组: [
        {
          // 第1段曲线：从顶部中心到左侧
          P0: this.爱心控制点["1-P₀&4-P₃"],
          P1: this.爱心控制点["1-P₁"],
          P2: this.爱心控制点["1-P₂"],
          P3: this.爱心控制点["1-P₃&2-P₀"],
          鼠标悬停: false,
          已选中: false,
        },
        {
          // 第2段曲线：从左侧到底部中心
          P0: this.爱心控制点["1-P₃&2-P₀"],
          P1: this.爱心控制点["2-P₁"],
          P2: this.爱心控制点["2-P₂"],
          P3: this.爱心控制点["2-P₃&3-P₀"],
          鼠标悬停: false,
          已选中: false,
        },
        {
          // 第3段曲线：从底部中心到右侧
          P0: this.爱心控制点["2-P₃&3-P₀"],
          P1: this.爱心控制点["3-P₁"],
          P2: this.爱心控制点["3-P₂"],
          P3: this.爱心控制点["3-P₃&4-P₀"],
          鼠标悬停: false,
          已选中: false,
        },
        {
          // 第4段曲线：从右侧到顶部中心
          P0: this.爱心控制点["3-P₃&4-P₀"],
          P1: this.爱心控制点["4-P₁"],
          P2: this.爱心控制点["4-P₂"],
          P3: this.爱心控制点["1-P₀&4-P₃"],
          鼠标悬停: false,
          已选中: false,
        },
      ],
    };
    this.添加鼠标事件();
    this.绘制全部();
  }

  添加鼠标事件() {
    this.canvas.addEventListener("mousemove", (e) => {
      this.处理鼠标移动(e);
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.处理鼠标离开();
    });

    this.canvas.addEventListener("click", (e) => {
      this.处理鼠标点击(e);
    });

    this.canvas.addEventListener("mousedown", (e) => {
      this.处理鼠标按下(e);
    });

    this.canvas.addEventListener("mouseup", (e) => {
      this.处理鼠标抬起(e);
    });

    // 添加键盘事件监听器
    document.addEventListener("keydown", (e) => {
      if (e.key === "Shift") {
        this.拖拽状态.按住Shift键 = true;
      }
      if (e.key === "Control") {
        this.拖拽状态.按住Ctrl键 = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "Shift") {
        this.拖拽状态.按住Shift键 = false;
      }
      if (e.key === "Control") {
        this.拖拽状态.按住Ctrl键 = false;
      }
    });
  }

  处理鼠标移动(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 处理拖拽
    if (this.拖拽状态.正在拖拽) {
      this.处理拖拽移动(mouseX, mouseY);
      return;
    }

    let 找到悬停 = false;
    let 找到控制点悬停 = false;

    // 检查控制点悬停（优先检查已选中的曲线）
    for (let i = 0; i < this.爱心.三次贝塞尔坐标组.length; i++) {
      const 三次贝塞尔坐标 = this.爱心.三次贝塞尔坐标组[i];
      if (三次贝塞尔坐标.已选中) {
        const 悬停的控制点 = this.检查控制点悬停(mouseX, mouseY, 三次贝塞尔坐标);
        if (悬停的控制点) {
          三次贝塞尔坐标.悬停的控制点 = 悬停的控制点;
          this.当前悬停控制点 = 悬停的控制点;
          this.当前悬停曲线编号 = i + 1;
          找到控制点悬停 = true;
          break;
        } else {
          三次贝塞尔坐标.悬停的控制点 = null;
          this.当前悬停控制点 = null;
          this.当前悬停曲线编号 = null;
        }
      }
    }

    // 只有在没有找到控制点悬停时，才检查曲线悬停
    let 找到的悬停曲线 = null;
    if (!找到控制点悬停) {
      for (let i = this.爱心.三次贝塞尔坐标组.length - 1; i >= 0; i--) {
        const 三次贝塞尔坐标 = this.爱心.三次贝塞尔坐标组[i];
        if (this.坐标位于贝塞尔曲线附近(mouseX, mouseY, 三次贝塞尔坐标)) {
          找到的悬停曲线 = 三次贝塞尔坐标;
          break;
        }
      }
    }

    // 更新所有曲线的悬停状态
    for (const 三次贝塞尔坐标 of this.爱心.三次贝塞尔坐标组) {
      三次贝塞尔坐标.鼠标悬停 = 三次贝塞尔坐标 === 找到的悬停曲线;
    }

    if (找到的悬停曲线) {
      找到悬停 = true;
    }

    // 检查复选框悬停
    this.显示控制点序号复选框.hovered = this.鼠标悬停在复选框内(mouseX, mouseY);

    // 设置鼠标样式
    if (找到控制点悬停) {
      this.canvas.style.cursor = "grab";
    } else if (找到悬停) {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
    } else if (this.显示控制点序号复选框.hovered) {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
    } else {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
    }

    this.绘制全部();
  }

  处理鼠标离开() {
    // 如果正在拖拽，停止拖拽
    if (this.拖拽状态.正在拖拽) {
      this.拖拽状态.正在拖拽 = false;
      this.拖拽状态.拖拽的控制点 = null;
      this.拖拽状态.拖拽的曲线段 = null;
      this.拖拽状态.刚刚结束拖拽 = true;
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';

      // 延迟重置刚刚结束拖拽标志
      setTimeout(() => {
        this.拖拽状态.刚刚结束拖拽 = false;
      }, 100);
    }

    for (const 三次贝塞尔坐标 of this.爱心.三次贝塞尔坐标组) {
      三次贝塞尔坐标.鼠标悬停 = false;
      三次贝塞尔坐标.悬停的控制点 = null;
    }
    this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
    this.绘制全部();
  }

  处理鼠标点击(e) {
    // 如果正在拖拽或刚刚结束拖拽，不处理点击事件
    if (this.拖拽状态.正在拖拽 || this.拖拽状态.刚刚结束拖拽) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 检查是否点击了复选框
    if (this.鼠标悬停在复选框内(mouseX, mouseY)) {
      this.显示控制点序号复选框.checked = !this.显示控制点序号复选框.checked;
      this.绘制全部();
      return;
    }

    // 找到最上层的曲线（数组中的最后一个）
    for (let i = this.爱心.三次贝塞尔坐标组.length - 1; i >= 0; i--) {
      const 三次贝塞尔坐标 = this.爱心.三次贝塞尔坐标组[i];
      if (this.坐标位于贝塞尔曲线附近(mouseX, mouseY, 三次贝塞尔坐标)) {
        // 切换选中状态
        三次贝塞尔坐标.已选中 = !三次贝塞尔坐标.已选中;
        break;
      }
    }

    this.绘制全部();
  }

  处理鼠标按下(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 检查是否点击了控制点（优先检查已选中的曲线）
    for (const 三次贝塞尔坐标 of this.爱心.三次贝塞尔坐标组) {
      if (三次贝塞尔坐标.已选中) {
        const 点击的控制点 = this.检查控制点点击(mouseX, mouseY, 三次贝塞尔坐标);
        if (点击的控制点) {
          this.拖拽状态.正在拖拽 = true;
          this.拖拽状态.拖拽的控制点 = 点击的控制点;
          this.拖拽状态.拖拽的曲线段 = 三次贝塞尔坐标;
          this.拖拽状态.拖拽起始位置 = { x: mouseX, y: mouseY };
          this.canvas.style.cursor = "grabbing";
          return;
        }
      }
    }
  }

  处理鼠标抬起(e) {
    if (this.拖拽状态.正在拖拽) {
      this.拖拽状态.正在拖拽 = false;
      this.拖拽状态.拖拽的控制点 = null;
      this.拖拽状态.拖拽的曲线段 = null;
      this.拖拽状态.刚刚结束拖拽 = true;
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';

      // 延迟重置刚刚结束拖拽标志，防止立即触发点击事件
      setTimeout(() => {
        this.拖拽状态.刚刚结束拖拽 = false;
      }, 100);
    }
  }

  检查控制点点击(x, y, 三次贝塞尔坐标) {
    const 容差 = 10;
    const 控制点列表 = [
      { 点: 三次贝塞尔坐标.P0, 名称: "P0" },
      { 点: 三次贝塞尔坐标.P1, 名称: "P1" },
      { 点: 三次贝塞尔坐标.P2, 名称: "P2" },
      { 点: 三次贝塞尔坐标.P3, 名称: "P3" },
    ];

    for (const 控制点 of 控制点列表) {
      const 距离 = Math.sqrt((x - 控制点.点.x) ** 2 + (y - 控制点.点.y) ** 2);
      if (距离 < 容差) {
        return 控制点.名称;
      }
    }
    return null;
  }

  检查控制点悬停(x, y, 三次贝塞尔坐标) {
    const 容差 = 10;
    const 控制点列表 = [
      { 点: 三次贝塞尔坐标.P0, 名称: "P0" },
      { 点: 三次贝塞尔坐标.P1, 名称: "P1" },
      { 点: 三次贝塞尔坐标.P2, 名称: "P2" },
      { 点: 三次贝塞尔坐标.P3, 名称: "P3" },
    ];

    for (const 控制点 of 控制点列表) {
      const 距离 = Math.sqrt((x - 控制点.点.x) ** 2 + (y - 控制点.点.y) ** 2);
      if (距离 < 容差) {
        return 控制点.名称;
      }
    }
    return null;
  }

  鼠标悬停在复选框内(x, y) {
    const 复选框 = this.显示控制点序号复选框;

    // 计算文本宽度，用于确定整个可点击区域
    this.ctx.font = "14px 'Google Sans Code', Consolas, 'Noto Sans SC', sans-serif";
    const 文本宽度 = this.ctx.measureText(复选框.label).width;

    // 整个可点击区域：从复选框左边到文本右边，包括中间的空隙
    const 总宽度 = 复选框.size + 8 + 文本宽度; // 8是复选框和文本之间的间距

    return (
      x >= 复选框.x && x <= 复选框.x + 总宽度 && y >= 复选框.y - 复选框.size / 2 && y <= 复选框.y + 复选框.size / 2
    );
  }

  绘制复选框() {
    const 复选框 = this.显示控制点序号复选框;

    // 绘制复选框边框
    this.ctx.strokeStyle = 复选框.hovered ? "#aaa" : "#888";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(复选框.x, 复选框.y - 复选框.size / 2, 复选框.size, 复选框.size);

    // 如果选中，绘制勾选标记
    if (复选框.checked) {
      this.ctx.strokeStyle = "yellowgreen";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(复选框.x + 4, 复选框.y);
      this.ctx.lineTo(复选框.x + 复选框.size / 3 + 2, 复选框.y + 复选框.size / 3 - 2);
      this.ctx.lineTo(复选框.x + 复选框.size - 4, 复选框.y - 复选框.size / 3 + 1);
      this.ctx.stroke();
    }

    // 绘制标签文本
    this.ctx.fillStyle = 复选框.hovered ? "#fff" : "#ccc";
    this.ctx.font = "14px 'Google Sans Code', Consolas, 'Noto Sans SC', sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.fillText(复选框.label, 复选框.x + 复选框.size + 8, 复选框.y + 5);
  }

  处理拖拽移动(mouseX, mouseY) {
    if (!this.拖拽状态.正在拖拽 || !this.拖拽状态.拖拽的控制点 || !this.拖拽状态.拖拽的曲线段) {
      return;
    }

    const 控制点名称 = this.拖拽状态.拖拽的控制点;
    const 曲线段 = this.拖拽状态.拖拽的曲线段;

    // 更新控制点位置
    switch (控制点名称) {
      case "P0":
        曲线段.P0.x = mouseX;
        曲线段.P0.y = mouseY;
        break;
      case "P1":
        曲线段.P1.x = mouseX;
        曲线段.P1.y = mouseY;
        // 如果按住Shift键，自动对齐关联的控制点
        if (this.拖拽状态.按住Shift键) {
          this.自动对齐关联控制点(控制点名称, 曲线段, mouseX, mouseY);
        }
        // 如果按住Ctrl键，同步关联控制点距离
        if (this.拖拽状态.按住Ctrl键) {
          this.同步关联控制点距离(控制点名称, 曲线段, mouseX, mouseY);
        }
        break;
      case "P2":
        曲线段.P2.x = mouseX;
        曲线段.P2.y = mouseY;
        // 如果按住Shift键，自动对齐关联的控制点
        if (this.拖拽状态.按住Shift键) {
          this.自动对齐关联控制点(控制点名称, 曲线段, mouseX, mouseY);
        }
        // 如果按住Ctrl键，同步关联控制点距离
        if (this.拖拽状态.按住Ctrl键) {
          this.同步关联控制点距离(控制点名称, 曲线段, mouseX, mouseY);
        }
        break;
      case "P3":
        曲线段.P3.x = mouseX;
        曲线段.P3.y = mouseY;
        break;
    }

    // 实时重绘
    this.绘制全部();
  }

  坐标位于贝塞尔曲线附近(x, y, 三次贝塞尔坐标) {
    const 容差 = 10;
    const 采样点数量 = 50;

    for (let i = 0; i <= 采样点数量; i++) {
      const t = i / 采样点数量;
      const 采样点 = this.获取三次贝塞尔曲线采样点坐标(t, 三次贝塞尔坐标);
      const 距离平方 = (x - 采样点.x) ** 2 + (y - 采样点.y) ** 2;
      if (距离平方 < 容差 ** 2) {
        return true;
      }
    }
    return false;
  }

  获取三次贝塞尔曲线采样点坐标(t, 三次贝塞尔坐标) {
    const { P0, P1, P2, P3 } = 三次贝塞尔坐标;
    const mt = 1 - t;

    return {
      x: mt ** 3 * P0.x + 3 * mt ** 2 * t * P1.x + 3 * mt * t ** 2 * P2.x + t ** 3 * P3.x,
      y: mt ** 3 * P0.y + 3 * mt ** 2 * t * P1.y + 3 * mt * t ** 2 * P2.y + t ** 3 * P3.y,
    };
  }

  绘制全部() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.绘制爱心曲线();
    this.绘制选中段的控制点();
    this.绘制控制点坐标();
    this.绘制复选框();
  }

  绘制爱心曲线() {
    // 绘制填充的爱心
    this.ctx.beginPath();
    this.ctx.moveTo(this.爱心.三次贝塞尔坐标组[0].P0.x, this.爱心.三次贝塞尔坐标组[0].P0.y);

    // 绘制4段彼此相连的三次贝塞尔曲线
    for (const 三次贝塞尔坐标 of this.爱心.三次贝塞尔坐标组) {
      this.ctx.bezierCurveTo(
        三次贝塞尔坐标.P1.x,
        三次贝塞尔坐标.P1.y,
        三次贝塞尔坐标.P2.x,
        三次贝塞尔坐标.P2.y,
        三次贝塞尔坐标.P3.x,
        三次贝塞尔坐标.P3.y,
      );
    }

    this.ctx.closePath();
    this.ctx.save();
    this.ctx.fillStyle = "#f5c4";
    this.ctx.fill();
    this.ctx.restore();

    // 为每段贝塞尔曲线单独绘制描边，实现独立高亮
    for (let i = 0; i < this.爱心.三次贝塞尔坐标组.length; i++) {
      const 三次贝塞尔坐标 = this.爱心.三次贝塞尔坐标组[i];

      // 根据选中和悬停状态设置样式
      if (三次贝塞尔坐标.已选中) {
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = this.三次贝塞尔曲线描边颜色组.选中;
      } else if (三次贝塞尔坐标.鼠标悬停) {
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = this.三次贝塞尔曲线描边颜色组.悬停;
      } else {
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = this.三次贝塞尔曲线描边颜色组.普通;
      }

      // 绘制单段贝塞尔曲线
      this.ctx.beginPath();
      if (i === 0) {
        // 第一段曲线从起点开始
        this.ctx.moveTo(三次贝塞尔坐标.P0.x, 三次贝塞尔坐标.P0.y);
      } else {
        // 其他段曲线从前一段的终点开始
        const 前一段 = this.爱心.三次贝塞尔坐标组[i - 1];
        this.ctx.moveTo(前一段.P3.x, 前一段.P3.y);
      }

      this.ctx.bezierCurveTo(
        三次贝塞尔坐标.P1.x,
        三次贝塞尔坐标.P1.y,
        三次贝塞尔坐标.P2.x,
        三次贝塞尔坐标.P2.y,
        三次贝塞尔坐标.P3.x,
        三次贝塞尔坐标.P3.y,
      );

      this.ctx.stroke();
    }
  }

  绘制选中段的控制点() {
    for (const 三次贝塞尔坐标 of this.爱心.三次贝塞尔坐标组) {
      if (三次贝塞尔坐标.已选中) {
        // 绘制控制线（虚线）
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeStyle = "#FF6B6B";
        this.ctx.lineWidth = 2;

        // P0 到 P1 的连线
        this.ctx.beginPath();
        this.ctx.moveTo(三次贝塞尔坐标.P0.x, 三次贝塞尔坐标.P0.y);
        this.ctx.lineTo(三次贝塞尔坐标.P1.x, 三次贝塞尔坐标.P1.y);
        this.ctx.stroke();

        // P2 到 P3 的连线
        this.ctx.beginPath();
        this.ctx.moveTo(三次贝塞尔坐标.P2.x, 三次贝塞尔坐标.P2.y);
        this.ctx.lineTo(三次贝塞尔坐标.P3.x, 三次贝塞尔坐标.P3.y);
        this.ctx.stroke();

        // 重置虚线设置
        this.ctx.setLineDash([]);

        // 根据控制点位置找到对应的标签
        const p0标签 = this.获取控制点标签(三次贝塞尔坐标.P0);
        const p1标签 = this.获取控制点标签(三次贝塞尔坐标.P1);
        const p2标签 = this.获取控制点标签(三次贝塞尔坐标.P2);
        const p3标签 = this.获取控制点标签(三次贝塞尔坐标.P3);

        this.绘制控制点(三次贝塞尔坐标.P0, p0标签, "#7F1B2B", 三次贝塞尔坐标.悬停的控制点 === "P0");
        this.绘制控制点(三次贝塞尔坐标.P1, p1标签, "#0E8D54", 三次贝塞尔坐标.悬停的控制点 === "P1");
        this.绘制控制点(三次贝塞尔坐标.P2, p2标签, "#055771", 三次贝塞尔坐标.悬停的控制点 === "P2");
        this.绘制控制点(三次贝塞尔坐标.P3, p3标签, "#362E64", 三次贝塞尔坐标.悬停的控制点 === "P3");
      }
    }
  }

  // 根据控制点位置找到对应的标签
  获取控制点标签(控制点) {
    for (const [标签, 点] of Object.entries(this.爱心控制点)) {
      if (点 === 控制点) {
        return 标签;
      }
    }
    return "未知";
  }

  绘制控制点(point, label, color, 是否悬停 = false) {
    // 绘制控制点圆圈
    if (是否悬停) {
      // 悬停时使用更亮的颜色
      this.ctx.fillStyle = this.获取悬停颜色(color);
      this.ctx.lineWidth = 3;
    } else {
      this.ctx.fillStyle = color;
      this.ctx.lineWidth = 2;
    }

    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制控制点边框
    this.ctx.strokeStyle = "#fff";
    this.ctx.stroke();

    // 只有在复选框选中时才绘制标签
    if (this.显示控制点序号复选框.checked) {
      // 绘制标签：各个部分分开绘制，使用不同颜色
      this.ctx.font = "14px Google Sans Code, monospace";
      this.ctx.textAlign = "center";

      let currentX = point.x;
      // 为特定标签设置不同的Y位置
      let labelY;
      if (label === "2-P₁" || label === "2-P₂" || label === "3-P₁" || label === "3-P₂" || label === "1-P₀&4-P₃") {
        labelY = point.y + 25; // 显示在点的下方
      } else {
        labelY = point.y - 15; // 其他标签显示在点的上方
      }

      // 解析标签并分别绘制
      if (label.includes("&")) {
        // 处理包含"&"的标签，如"1-P₀&4-P₃"
        const parts = label.split("&");
        const firstPart = parts[0]; // "1-P₀"
        const secondPart = parts[1]; // "4-P₃"

        // 绘制第一部分
        currentX = this.绘制标签部分(firstPart, currentX - 40, labelY);
        currentX += 15;

        // 绘制"&"符号
        this.ctx.fillStyle = "gray"; // 金色
        this.ctx.fillText("&", currentX, labelY);
        currentX += this.ctx.measureText("&").width + 4;

        // 绘制第二部分
        this.绘制标签部分(secondPart, currentX, labelY);
      } else {
        // 处理普通标签，如"1-P₀"
        this.绘制标签部分(label, currentX - 10, labelY);
      }
    }
  }

  // 绘制标签的各个部分
  绘制标签部分(labelPart, x, y) {
    // 解析标签部分，如"1-P₀"
    const match = labelPart.match(/^(\d+)-(.+)$/);
    if (match) {
      const number = match[1]; // "1"
      const dash = "-"; // "-"
      const pLabel = match[2]; // "P₀"

      // 绘制数字
      this.ctx.fillStyle = "lightskyblue";
      this.ctx.fillText(number, x, y);
      x += this.ctx.measureText(number).width + 2;

      // 绘制连字符
      this.ctx.fillStyle = "#FFD700"; // 金色
      this.ctx.fillText(dash, x, y);
      x += this.ctx.measureText(dash).width + 6;

      // 绘制P标签
      this.ctx.fillStyle = "lightblue"; // 青色
      this.ctx.fillText(pLabel, x, y);
    } else {
      // 如果不是预期格式，直接绘制
      this.ctx.fillStyle = "#fff";
      this.ctx.fillText(labelPart, x, y);
    }

    // 返回绘制后的x位置，供调用者使用
    return x;
  }

  获取悬停颜色(原始颜色) {
    // 将颜色转换为更亮的版本
    const 颜色映射 = {
      "#7F1B2B": "#FF6B6B", // P0 悬停色
      "#0E8D54": "#4ECDC4", // P1 悬停色
      "#055771": "#45B7D1", // P2 悬停色
      "#362E64": "#96CEB4", // P3 悬停色
    };
    return 颜色映射[原始颜色] || 原始颜色;
  }

  绘制三次贝塞尔曲线(三次贝塞尔坐标) {
    this.ctx.save();

    // 根据选中和悬停状态设置样式
    if (三次贝塞尔坐标.已选中) {
      this.ctx.lineWidth = 5;
      this.ctx.strokeStyle = this.三次贝塞尔曲线描边颜色组.选中;
    } else if (三次贝塞尔坐标.鼠标悬停) {
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = this.三次贝塞尔曲线描边颜色组.悬停;
    } else {
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = this.三次贝塞尔曲线描边颜色组.普通;
    }

    // 只使用bezierCurveTo，不调用stroke()，因为这是连续路径的一部分
    this.ctx.bezierCurveTo(
      三次贝塞尔坐标.P1.x,
      三次贝塞尔坐标.P1.y,
      三次贝塞尔坐标.P2.x,
      三次贝塞尔坐标.P2.y,
      三次贝塞尔坐标.P3.x,
      三次贝塞尔坐标.P3.y,
    );

    this.ctx.restore();
  }

  绘制控制点坐标() {
    this.ctx.save();

    // 辅助函数：格式化坐标显示，x坐标占用3个字符位且右对齐
    const 格式化坐标显示 = (x, y) => {
      const xStr = Math.round(x).toString();
      const yStr = Math.round(y).toString();

      // x坐标占用3个字符位，右对齐
      const xPadded = xStr.padStart(3, " ");
      const yPadded = yStr.padStart(3, " ");

      return { xPadded, yPadded, xWidth: this.ctx.measureText(xPadded).width };
    };

    // 定义4段曲线的显示配置
    const 曲线配置 = [
      // 左上角：曲线1
      {
        x: 20,
        y: 30,
        textAlign: "left",
        曲线编号: 1,
        控制点: this.爱心.三次贝塞尔坐标组[0],
      },
      // 左下角：曲线2
      {
        x: 20,
        y: this.cssHeight - 120,
        textAlign: "left",
        曲线编号: 2,
        控制点: this.爱心.三次贝塞尔坐标组[1],
      },
      // 右下角：曲线3
      {
        x: this.cssWidth - 120,
        y: this.cssHeight - 120,
        textAlign: "left",
        曲线编号: 3,
        控制点: this.爱心.三次贝塞尔坐标组[2],
      },
      // 右上角：曲线4
      {
        x: this.cssWidth - 120,
        y: 30,
        textAlign: "left",
        曲线编号: 4,
        控制点: this.爱心.三次贝塞尔坐标组[3],
      },
    ];

    // 循环绘制4段曲线的控制点坐标
    for (const [index, 配置] of 曲线配置.entries()) {
      // 设置文本对齐方式
      this.ctx.textAlign = 配置.textAlign;
      // 设置字体
      this.ctx.font = "15px 'Google Sans Code', Consolas, 'Noto Sans SC', sans-serif";

      // 绘制标题："曲线"和数字分开绘制
      this.ctx.fillStyle = "lightsteelblue";
      this.ctx.fillText("曲线", 配置.x, 配置.y);
      this.ctx.fillStyle = "gold";
      this.ctx.fillText(配置.曲线编号.toString(), 配置.x + this.ctx.measureText("曲线").width + 2, 配置.y);

      // 绘制控制点坐标
      this.ctx.font = "14px 'Google Sans Code', monospace";
      const 控制点标签 = ["P₀", "P₁", "P₂", "P₃"];
      const 控制点属性 = ["P0", "P1", "P2", "P3"];

      for (let j = 0; j < 4; j++) {
        const y = 配置.y + (j + 1) * 22;
        const 标签 = 控制点标签[j];
        const 属性 = 控制点属性[j];
        const 点 = 配置.控制点[属性];

        // 检查是否需要高亮：当前悬停的控制点或共享的控制点
        let 需要高亮 = false;
        if (this.当前悬停曲线编号 === 配置.曲线编号 && this.当前悬停控制点 === 属性) {
          需要高亮 = true;
        } else if (this.当前悬停控制点 && this.当前悬停曲线编号) {
          // 检查是否是共享控制点
          const 当前悬停点 = this.爱心.三次贝塞尔坐标组[this.当前悬停曲线编号 - 1][this.当前悬停控制点];
          if (当前悬停点 === 点) {
            需要高亮 = true;
          }
        }

        if (需要高亮) {
          this.ctx.fillStyle = "#0005";
          this.ctx.strokeStyle = "#afd7";
          this.ctx.lineWidth = 1;
          this.ctx.fillRect(配置.x - 10, y - 16, 120, 23);
          this.ctx.strokeRect(配置.x - 10, y - 16, 120, 23);
        }

        // 绘制控制点标签
        this.ctx.fillStyle = "#FF6B6B";
        this.ctx.fillText(标签, 配置.x, y);

        // 绘制冒号
        this.ctx.fillStyle = "gray";
        this.ctx.fillText(":", 配置.x + this.ctx.measureText(标签).width + 2, y);

        // 格式化坐标
        const 坐标 = 格式化坐标显示(点.x, 点.y);

        // 绘制X坐标
        this.ctx.fillStyle = "#8ad";
        this.ctx.fillText(坐标.xPadded, 配置.x + this.ctx.measureText(标签 + " :").width, y);

        // 绘制逗号
        this.ctx.fillStyle = "#fff8";
        this.ctx.fillText(",", 配置.x + this.ctx.measureText(标签 + " :").width + 2 + 坐标.xWidth, y);

        // 绘制Y坐标
        this.ctx.fillStyle = "#28e";
        this.ctx.fillText(坐标.yPadded, 配置.x + this.ctx.measureText(标签 + " :").width + 5 + 坐标.xWidth + 10, y);
      }
    }

    this.ctx.restore();
  }

  自动对齐关联控制点(控制点名称, 当前曲线段, mouseX, mouseY) {
    // 找到当前曲线段在数组中的索引
    const 当前曲线索引 = this.爱心.三次贝塞尔坐标组.indexOf(当前曲线段);
    if (当前曲线索引 === -1) return;

    let 关联控制点 = null;
    let 关联曲线段 = null;

    if (控制点名称 === "P1") {
      // P1控制点：需要找到前一段曲线的P2控制点
      const 前一段索引 = (当前曲线索引 - 1 + this.爱心.三次贝塞尔坐标组.length) % this.爱心.三次贝塞尔坐标组.length;
      关联曲线段 = this.爱心.三次贝塞尔坐标组[前一段索引];
      关联控制点 = 关联曲线段.P2;
    } else if (控制点名称 === "P2") {
      // P2控制点：需要找到下一段曲线的P1控制点
      const 下一段索引 = (当前曲线索引 + 1) % this.爱心.三次贝塞尔坐标组.length;
      关联曲线段 = this.爱心.三次贝塞尔坐标组[下一段索引];
      关联控制点 = 关联曲线段.P1;
    }

    if (关联控制点 && 关联曲线段) {
      // 计算当前控制点和共享端点的连线方向
      let 共享端点;
      if (控制点名称 === "P1") {
        共享端点 = 当前曲线段.P0;
      } else {
        共享端点 = 当前曲线段.P3;
      }

      // 计算方向向量
      const dx = mouseX - 共享端点.x;
      const dy = mouseY - 共享端点.y;
      const 距离 = Math.sqrt(dx * dx + dy * dy);

      if (距离 > 0) {
        // 归一化方向向量
        const 方向x = dx / 距离;
        const 方向y = dy / 距离;

        // 计算关联控制点应该的位置（保持原有距离）
        const 关联控制点距离 = Math.sqrt((关联控制点.x - 共享端点.x) ** 2 + (关联控制点.y - 共享端点.y) ** 2);

        // 将关联控制点移动到与当前控制点反方向的位置
        // 这样两个控制点会在共享端点的两侧，形成平滑的曲线过渡
        关联控制点.x = 共享端点.x - 方向x * 关联控制点距离;
        关联控制点.y = 共享端点.y - 方向y * 关联控制点距离;
      }
    }
  }

  同步关联控制点距离(控制点名称, 当前曲线段, mouseX, mouseY) {
    // 找到当前曲线段在数组中的索引
    const 当前曲线索引 = this.爱心.三次贝塞尔坐标组.indexOf(当前曲线段);
    if (当前曲线索引 === -1) return;

    let 关联控制点 = null;
    let 关联曲线段 = null;

    if (控制点名称 === "P1") {
      // P1控制点：需要找到前一段曲线的P2控制点
      const 前一段索引 = (当前曲线索引 - 1 + this.爱心.三次贝塞尔坐标组.length) % this.爱心.三次贝塞尔坐标组.length;
      关联曲线段 = this.爱心.三次贝塞尔坐标组[前一段索引];
      关联控制点 = 关联曲线段.P2;
    } else if (控制点名称 === "P2") {
      // P2控制点：需要找到下一段曲线的P1控制点
      const 下一段索引 = (当前曲线索引 + 1) % this.爱心.三次贝塞尔坐标组.length;
      关联曲线段 = this.爱心.三次贝塞尔坐标组[下一段索引];
      关联控制点 = 关联曲线段.P1;
    }

    if (关联控制点 && 关联曲线段) {
      // 计算当前控制点和共享端点的连线方向
      let 共享端点;
      if (控制点名称 === "P1") {
        共享端点 = 当前曲线段.P0;
      } else {
        共享端点 = 当前曲线段.P3;
      }

      // 计算拖拽控制点与共享控制点之间的距离
      const 拖拽控制点距离 = Math.sqrt((mouseX - 共享端点.x) ** 2 + (mouseY - 共享端点.y) ** 2);

      if (拖拽控制点距离 > 0) {
        // 计算关联控制点与共享端点的连线方向
        const 关联控制点dx = 关联控制点.x - 共享端点.x;
        const 关联控制点dy = 关联控制点.y - 共享端点.y;
        const 关联控制点距离 = Math.sqrt(关联控制点dx ** 2 + 关联控制点dy ** 2);

        if (关联控制点距离 > 0) {
          // 归一化关联控制点的方向向量
          const 关联控制点方向x = 关联控制点dx / 关联控制点距离;
          const 关联控制点方向y = 关联控制点dy / 关联控制点距离;

          // 将关联控制点移动到与拖拽控制点相同的距离
          关联控制点.x = 共享端点.x + 关联控制点方向x * 拖拽控制点距离;
          关联控制点.y = 共享端点.y + 关联控制点方向y * 拖拽控制点距离;
        }
      }
    }
  }
}

new 爱心();
