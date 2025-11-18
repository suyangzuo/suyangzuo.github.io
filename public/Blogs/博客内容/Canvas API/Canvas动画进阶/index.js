class DrawRectangleMultiPhases {
  constructor() {
    this.canvas = document.getElementById("canvas-phase-demo");
    this.ctx = this.canvas.getContext("2d");
    this.setupCanvas();
    this.cssWidth = this.canvas.offsetWidth;
    this.cssHeight = this.canvas.offsetHeight;

    // 动画状态
    this.animation = {
      // 点移动阶段
      point: {
        startX: 0,
        startY: 0,
        targetX: 0, // 初始化为0，后续动态设置
        targetY: 0,
        currentX: 0,
        currentY: 0,
        moveDuration: 1000,
        waitBeforeMove: 1000,
        waitAfterMove: 1000,
        startTime: null,
        phase: "waitingBeforeMove",
      },

      // 矩形绘制阶段
      rectangle: {
        width: 150,
        height: 250,
        firstLines: 0,
        secondLines: 0,
        fillProgress: 0,
        firstLinesDuration: 1000,
        secondLinesDuration: 1000,
        fillDuration: 1000,
        waitAfterOutline: 500,
        waitAfterFill: 3000,
        startTime: null,
        phase: "waiting",
      },

      resetStartTime: null,
      resetDuration: 500,
    };

    // 状态提示相关属性
    this.statusDisplay = {
      // 点状态文本
      pointStatus: ["点状态", "移动前等待", "移动", "移动后等待", "完成"],
      // 矩形状态文本
      rectangleStatus: ["矩形状态", "等待", "绘制左上线", "绘制右下线", "填充前等待", "填充", "填充后等待"],
      // 高亮背景矩形
      pointHighlight: {
        currentIndex: 1, // 从"移动前等待"开始
        targetIndex: 1,
        transitionProgress: 0,
        transitionDuration: 125, // 125ms过渡时间
        startTime: null,
      },
      rectangleHighlight: {
        currentIndex: 1, // 初始高亮"等待"状态
        targetIndex: 1,
        transitionProgress: 0,
        transitionDuration: 125,
        startTime: null,
      },
      // 显示位置
      leftColumnX: this.cssWidth - 210, // 左列X坐标
      rightColumnX: this.cssWidth - 100, // 右列X坐标
      startY: 50, // 起始Y坐标
      lineHeight: 30, // 行高
      highlightHeight: 25, // 高亮背景高度
      highlightPadding: 5, // 高亮背景内边距
      // 矩形状态"等待"的动态Y轴偏移量
      waitingYOffset: 0,
      // "等待"移动动画的专门开始时间
      waitingMoveStartTime: null,
    };

    // 时间倍率滑块相关属性
    this.speedSlider = {
      x: 30, // 滑块位置X坐标
      y: this.cssHeight - 80, // 滑块位置Y坐标
      width: 120, // 滑块宽度
      height: 8, // 滑块轨道高度
      thumbSize: 20, // 滑块按钮大小
      minValue: 1, // 最小值
      maxValue: 5, // 最大值
      currentValue: 1, // 当前值
      isDragging: false, // 是否正在拖拽
      hovered: false, // 是否悬停
    };

    // 初始化时设置矩形的指定坐标
    this.setTargetToCenter();

    // 初始化时间倍率滑块事件
    this.initSpeedSlider();

    requestAnimationFrame(this.animate.bind(this));
  }

  // 初始化时间倍率滑块事件
  initSpeedSlider() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
  }

  // 处理鼠标按下事件
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.isPointInSlider(x, y)) {
      this.speedSlider.isDragging = true;
      this.updateSliderValue(x);
    }
  }

  // 处理鼠标移动事件
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 更新悬停状态
    this.speedSlider.hovered = this.isPointInSlider(x, y);

    // 如果正在拖拽，更新滑块值
    if (this.speedSlider.isDragging) {
      this.updateSliderValue(x);
    }
  }

  // 处理鼠标释放事件
  handleMouseUp() {
    this.speedSlider.isDragging = false;
  }

  // 处理鼠标离开事件
  handleMouseLeave() {
    this.speedSlider.isDragging = false;
    this.speedSlider.hovered = false;
  }

  // 检查点是否在滑块区域内
  isPointInSlider(x, y) {
    const slider = this.speedSlider;
    return (
      x >= slider.x - slider.thumbSize / 2 &&
      x <= slider.x + slider.width + slider.thumbSize / 2 &&
      y >= slider.y - slider.thumbSize / 2 &&
      y <= slider.y + slider.height + slider.thumbSize / 2
    );
  }

  // 更新滑块值
  updateSliderValue(x) {
    const slider = this.speedSlider;
    const relativeX = Math.max(0, Math.min(slider.width, x - slider.x));
    const ratio = relativeX / slider.width;
    const newValue = Math.round(slider.minValue + ratio * (slider.maxValue - slider.minValue));

    if (newValue !== slider.currentValue) {
      slider.currentValue = newValue;
      // 重置动画到初始状态
      this.resetAnimationToInitial();
    }
  }

  // 获取调整后的持续时间
  getAdjustedDuration(originalDuration) {
    return originalDuration * this.speedSlider.currentValue;
  }

  // 重置动画到初始状态
  resetAnimationToInitial() {
    // 重置点移动状态
    this.animation.point.startTime = null;
    this.animation.point.phase = "waitingBeforeMove";
    this.animation.point.currentX = 0;
    this.animation.point.currentY = 0;

    // 重置矩形绘制状态
    this.animation.rectangle.firstLines = 0;
    this.animation.rectangle.secondLines = 0;
    this.animation.rectangle.fillProgress = 0;
    this.animation.rectangle.phase = "waiting";
    this.animation.rectangle.startTime = null;

    // 重置状态提示
    this.statusDisplay.pointHighlight.currentIndex = 1;
    this.statusDisplay.pointHighlight.targetIndex = 1;
    this.statusDisplay.pointHighlight.transitionProgress = 0;
    this.statusDisplay.pointHighlight.startTime = null;

    this.statusDisplay.rectangleHighlight.currentIndex = 1;
    this.statusDisplay.rectangleHighlight.targetIndex = 1;
    this.statusDisplay.rectangleHighlight.transitionProgress = 0;
    this.statusDisplay.rectangleHighlight.startTime = null;

    // 重置其他状态
    this.animation.resetStartTime = null;

    // 更新坐标显示
    this.updateCoordinates();
  }

  // 设置Canvas的DPI缩放
  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);
    this.ctx.lineWidth = 2; // 重新设置线宽，因为缩放会影响线宽
  }

  // 计算矩形左上角坐标，使其居中，并设置点的target为矩形左上角
  setTargetToCenter() {
    const rect = this.animation.rectangle;
    const point = this.animation.point;
    point.targetX = (this.cssWidth - rect.width) / 2;
    point.targetY = (this.cssHeight - rect.height) / 2;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawDashedBorders(); // 在点绘制前调用

    // 绘制矩形
    if (this.animation.point.phase === "waitingAfterMove" || this.animation.rectangle.phase !== "waiting") {
      this.drawRectangle();
    }

    // 绘制移动的点
    this.ctx.beginPath();
    this.ctx.arc(this.animation.point.currentX, this.animation.point.currentY, 5, 0, Math.PI * 2);
    this.ctx.fillStyle = "orange";
    this.ctx.fill();

    // 绘制状态提示
    this.drawStatusDisplay();

    // 绘制时间倍率滑块
    this.drawSpeedSlider();
  }

  drawRectangle() {
    const rect = this.animation.rectangle;
    // 动态计算居中
    const startX = (this.cssWidth - rect.width) / 2;
    const startY = (this.cssHeight - rect.height) / 2;

    this.ctx.strokeStyle = "lightskyblue";
    this.ctx.lineWidth = 2;

    // 绘制右边和下边
    if (rect.phase !== "waiting") {
      // 右边(水平)
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(startX + rect.width * rect.firstLines, startY);
      this.ctx.stroke();

      // 下边(垂直)
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(startX, startY + rect.height * rect.firstLines);
      this.ctx.stroke();
    }

    // 绘制左边和上边
    if (
      rect.phase === "drawingSecondLines" ||
      rect.phase === "waitingAfterOutline" ||
      rect.phase === "filling" ||
      rect.phase === "waitingAfterFill"
    ) {
      // 左边(垂直)
      this.ctx.beginPath();
      this.ctx.moveTo(startX + rect.width, startY);
      this.ctx.lineTo(startX + rect.width, startY + rect.height * rect.secondLines);
      this.ctx.stroke();

      // 上边(水平)
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY + rect.height);
      this.ctx.lineTo(startX + rect.width * rect.secondLines, startY + rect.height);
      this.ctx.stroke();
    }

    // 填充矩形
    if (rect.phase === "filling" || rect.phase === "waitingAfterFill") {
      this.ctx.fillStyle = `rgba(0, 100, 255, 0.5)`;
      const fillHeight = rect.height * rect.fillProgress;
      this.ctx.fillRect(startX, startY, rect.width, fillHeight);
    }
  }

  // 绘制状态提示
  drawStatusDisplay() {
    const display = this.statusDisplay;

    // 设置文本样式
    this.ctx.font = "14px Arial";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";

    // 绘制左列（点状态）
    this.drawStatusColumn(display.leftColumnX, display.startY, display.pointStatus, display.pointHighlight, "left");

    // 绘制右列（矩形状态）
    this.drawStatusColumn(
      display.rightColumnX,
      display.startY,
      display.rectangleStatus,
      display.rectangleHighlight,
      "right",
    );
  }

  // 绘制时间倍率滑块
  drawSpeedSlider() {
    const slider = this.speedSlider;

    // 绘制标签文本
    this.ctx.font = "14px sans-serif";
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("动画时长倍率", slider.x + slider.width / 2, slider.y - 25);

    // 绘制滑块轨道背景
    this.ctx.fillStyle = "#444";
    this.ctx.fillRect(slider.x, slider.y, slider.width, slider.height);

    // 绘制已滑过部分的特殊颜色填充
    const ratio = (slider.currentValue - slider.minValue) / (slider.maxValue - slider.minValue);
    const filledWidth = ratio * slider.width;
    if (filledWidth > 0) {
      this.ctx.fillStyle = "rgba(76, 175, 80, 0.75)"; // 半透明绿色，与滑块按钮颜色协调
      this.ctx.fillRect(slider.x, slider.y, filledWidth, slider.height);
    }

    // 绘制轨道边框
    this.ctx.strokeStyle = "#666";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(slider.x, slider.y, slider.width, slider.height);

    // 计算滑块按钮位置
    const thumbX = slider.x + ratio * slider.width;

    // 绘制滑块按钮
    this.ctx.fillStyle = this.speedSlider.hovered || this.speedSlider.isDragging ? "#66BB6A" : "#2C8F30";
    this.ctx.beginPath();
    this.ctx.arc(thumbX, slider.y + slider.height / 2, slider.thumbSize / 2, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制滑块按钮边框
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // 绘制刻度标记
    this.ctx.textAlign = "center";
    for (let i = slider.minValue; i <= slider.maxValue; i++) {
      const markX = slider.x + ((i - slider.minValue) / (slider.maxValue - slider.minValue)) * slider.width;
      const markY = slider.y + slider.height + 20;

      // 当前值对应的刻度数字用绿色、字号加大1、粗体，其他用灰色、正常字号
      if (i === slider.currentValue) {
        this.ctx.font = "bold 14px Google Sans Code"; // 字号加大1（从12px到13px），粗体
        this.ctx.fillStyle = "#4CAF50";
      } else {
        this.ctx.font = "12px Google Sans Code";
        this.ctx.fillStyle = "#888";
      }
      this.ctx.fillText(i.toString(), markX, markY);
    }
  }

  // 绘制状态列
  drawStatusColumn(x, startY, statusTexts, highlight, columnType) {
    const display = this.statusDisplay;

    statusTexts.forEach((text, index) => {
      let y = startY + index * display.lineHeight;

      // 为矩形状态添加特殊的Y轴偏移
      if (columnType === "right") {
        if (index === 1) {
          // "等待"状态
          // "等待"状态使用动态偏移量
          y += display.waitingYOffset;
        } else if (index >= 2) {
          // "绘制左上线"及之后的状态
          // 固定偏移量，使"绘制左上线"与点状态的"完成"对齐
          // 点状态的"完成"在索引4，Y坐标 = 50 + 4 * 30 = 170
          // 矩形状态的"绘制左上线"在索引2，需要偏移 = 170 - (50 + 2 * 30) = 60
          y += 60;
        }
      }

      // 绘制高亮背景 - 标题文本（index === 0）不参与高亮
      if (index !== 0) {
        if (highlight.currentIndex === index) {
          // 当前高亮状态
          this.ctx.fillStyle = "rgba(50, 150, 255, 0.5)";
          this.ctx.fillRect(
            x - display.highlightPadding,
            y - display.highlightHeight / 2,
            this.ctx.measureText(text).width + display.highlightPadding * 2,
            display.highlightHeight,
          );
        } else if (highlight.targetIndex === index && highlight.transitionProgress > 0) {
          // 目标状态（过渡中）
          const alpha = 0.5 * highlight.transitionProgress;
          this.ctx.fillStyle = `rgba(50, 150, 255, ${alpha})`;
          this.ctx.fillRect(
            x - display.highlightPadding,
            y - display.highlightHeight / 2,
            this.ctx.measureText(text).width + display.highlightPadding * 2,
            display.highlightHeight,
          );
        } else if (
          highlight.currentIndex !== 0 &&
          highlight.transitionProgress > 0 &&
          highlight.currentIndex === index
        ) {
          // 当前状态（淡出中）
          const alpha = 0.5 * (1 - highlight.transitionProgress);
          this.ctx.fillStyle = `rgba(50, 150, 255, ${alpha})`;
          this.ctx.fillRect(
            x - display.highlightPadding,
            y - display.highlightHeight / 2,
            this.ctx.measureText(text).width + display.highlightPadding * 2,
            display.highlightHeight,
          );
        }
      }

      // 绘制文本 - 为标题文本设置特殊样式
      if (index === 0) {
        // 标题文本（"点状态"、"矩形状态"）
        this.ctx.font = "bold 16px sans-serif"; // 字号加大1（从14px到16px），加粗
        this.ctx.fillStyle = "Gold"; // 金色
      } else {
        // 普通状态文本 - 高亮状态下使用白色，非高亮状态下使用银色
        this.ctx.font = "14px sans-serif";
        if (
          highlight.currentIndex === index ||
          (highlight.targetIndex === index && highlight.transitionProgress > 0) ||
          (highlight.currentIndex !== 0 && highlight.transitionProgress > 0 && highlight.currentIndex === index)
        ) {
          this.ctx.fillStyle = "white"; // 高亮状态下使用白色
        } else {
          this.ctx.fillStyle = "silver"; // 非高亮状态下使用银色
        }
      }

      this.ctx.fillText(text, x, y);
    });
  }

  drawDashedBorders() {
    // 水平虚线（上边界）
    this.ctx.setLineDash([7, 7]); // 5px实线，3px空白
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.animation.point.currentY);
    this.ctx.lineTo(this.animation.point.currentX, this.animation.point.currentY);
    this.ctx.stroke();

    // 垂直虚线（左边界）
    this.ctx.beginPath();
    this.ctx.moveTo(this.animation.point.currentX, 0);
    this.ctx.lineTo(this.animation.point.currentX, this.animation.point.currentY);
    this.ctx.stroke();

    this.ctx.setLineDash([]); // 重置为实线
  }

  updateCoordinates() {
    const xCoord = document.getElementById("x-coord");
    const yCoord = document.getElementById("y-coord");

    if (!xCoord || !yCoord) return;

    // 更新X坐标（水平对齐）
    xCoord.innerHTML = `X<span class="coord-colon">:</span><span class="coord-value">${Math.round(
      this.animation.point.currentX,
    )}</span>`;
    xCoord.style.left = `${this.animation.point.currentX}px`;

    // 更新Y坐标（垂直对齐）
    yCoord.innerHTML = `Y<span class="coord-colon">:</span><span class="coord-value">${Math.round(
      this.animation.point.currentY,
    )}</span>`;
    yCoord.style.top = `${this.animation.point.currentY}px`;
  }

  updatePhase(timestamp) {
    // 每次动画帧都确保target是居中的（防止canvas大小或rect变化时）
    this.setTargetToCenter();

    // 更新状态提示
    this.updateStatusDisplay(timestamp);

    if (!this.animation.point.startTime) {
      this.animation.point.startTime = timestamp;
      // 设置"等待"移动动画的专门开始时间
      this.statusDisplay.waitingMoveStartTime = timestamp;
      this.animation.point.phase = "waitingBeforeMove";
      return;
    }

    const elapsed = timestamp - this.animation.point.startTime;

    // 点移动阶段控制
    switch (this.animation.point.phase) {
      case "waitingBeforeMove":
        if (elapsed >= this.getAdjustedDuration(this.animation.point.waitBeforeMove)) {
          this.animation.point.phase = "moving";
          this.animation.point.startTime = timestamp;
        }
        break;

      case "moving":
        const moveProgress = Math.min(
          (timestamp - this.animation.point.startTime) / this.getAdjustedDuration(this.animation.point.moveDuration),
          1,
        );

        this.animation.point.currentX =
          this.animation.point.startX + (this.animation.point.targetX - this.animation.point.startX) * moveProgress;
        this.animation.point.currentY =
          this.animation.point.startY + (this.animation.point.targetY - this.animation.point.startY) * moveProgress;

        if (moveProgress === 1) {
          this.animation.point.phase = "waitingAfterMove";
          this.animation.point.startTime = timestamp;
        }
        this.updateCoordinates(); // 更新坐标显示
        break;

      case "waitingAfterMove":
        // 这个阶段现在直接开始绘制矩形
        if (
          timestamp - this.animation.point.startTime >=
          this.getAdjustedDuration(this.animation.point.waitAfterMove)
        ) {
          this.animation.rectangle.phase = "drawingFirstLines";
          this.animation.rectangle.startTime = timestamp;
          this.animation.point.phase = "completed"; // 添加一个新状态表示点移动完成
        }
        break;
    }

    // 矩形绘制阶段控制
    if (this.animation.rectangle.startTime) {
      const rectElapsed = timestamp - this.animation.rectangle.startTime;

      switch (this.animation.rectangle.phase) {
        case "drawingFirstLines":
          this.animation.rectangle.firstLines = Math.min(
            rectElapsed / this.getAdjustedDuration(this.animation.rectangle.firstLinesDuration),
            1,
          );

          if (this.animation.rectangle.firstLines === 1) {
            this.animation.rectangle.phase = "drawingSecondLines";
            this.animation.rectangle.startTime = timestamp;
          }
          break;

        case "drawingSecondLines":
          this.animation.rectangle.secondLines = Math.min(
            rectElapsed / this.getAdjustedDuration(this.animation.rectangle.secondLinesDuration),
            1,
          );

          if (this.animation.rectangle.secondLines === 1) {
            this.animation.rectangle.phase = "waitingAfterOutline";
            this.animation.rectangle.startTime = timestamp;
          }
          break;

        case "waitingAfterOutline":
          if (rectElapsed >= this.getAdjustedDuration(this.animation.rectangle.waitAfterOutline)) {
            this.animation.rectangle.phase = "filling";
            this.animation.rectangle.startTime = timestamp;
          }
          break;

        case "filling":
          this.animation.rectangle.fillProgress = Math.min(
            rectElapsed / this.getAdjustedDuration(this.animation.rectangle.fillDuration),
            1,
          );

          if (this.animation.rectangle.fillProgress === 1) {
            this.animation.rectangle.phase = "waitingAfterFill";
            this.animation.rectangle.startTime = timestamp;
          }
          break;

        case "waitingAfterFill":
          if (rectElapsed >= this.getAdjustedDuration(this.animation.rectangle.waitAfterFill)) {
            this.resetAnimation();
            this.animation.point.startTime = timestamp; // 重置开始时间
            this.animation.point.phase = "waitingBeforeMove"; // 回到初始等待状态
            this.animation.point.currentX = 0;
            this.animation.point.currentY = 0;

            // 重新设置"等待"移动动画的专门开始时间，确保第2次迭代开始"等待"能正常移动
            this.statusDisplay.waitingMoveStartTime = timestamp;
          }
          break;
      }
    }

    // 重置动画
    if (this.animation.resetStartTime) {
      const resetProgress = Math.min(
        (timestamp - this.animation.resetStartTime) / this.getAdjustedDuration(this.animation.resetDuration),
        1,
      );

      this.animation.point.currentX =
        this.animation.point.targetX - (this.animation.point.targetX - this.animation.point.startX) * resetProgress;
      this.animation.point.currentY =
        this.animation.point.targetY - (this.animation.point.targetY - this.animation.point.startY) * resetProgress;

      if (resetProgress === 1) {
        this.animation.point.startTime = timestamp;
        this.animation.point.phase = "waitingBeforeMove";
        this.animation.point.currentX = this.animation.point.startX;
        this.animation.point.currentY = this.animation.point.startY;
        this.animation.resetStartTime = null;
        this.resetAnimationState();
      }
    }
  }

  resetAnimation() {
    // 保留用于重置的逻辑
    // 重置矩形绘制状态
    this.animation.rectangle.firstLines = 0;
    this.animation.rectangle.secondLines = 0;
    this.animation.rectangle.fillProgress = 0;
    this.animation.rectangle.phase = "waiting";
    this.animation.rectangle.startTime = null;

    // 重置点移动状态（除了 startTime 和 phase 已在上面设置）
    this.animation.point.currentX = 0;
    this.animation.point.currentY = 0;
    this.setTargetToCenter();
    this.updateCoordinates(); // 更新坐标显示

    // 重置状态提示
    this.statusDisplay.pointHighlight.currentIndex = 1;
    this.statusDisplay.pointHighlight.targetIndex = 1;
    this.statusDisplay.pointHighlight.transitionProgress = 0;
    this.statusDisplay.pointHighlight.startTime = null;

    this.statusDisplay.rectangleHighlight.currentIndex = 1;
    this.statusDisplay.rectangleHighlight.targetIndex = 1;
    this.statusDisplay.rectangleHighlight.transitionProgress = 0;
    this.statusDisplay.rectangleHighlight.startTime = null;

    // 重置"等待"移动动画的专门开始时间
    this.statusDisplay.waitingMoveStartTime = null;
  }

  resetAnimationState() {
    this.animation.rectangle = {
      width: 150,
      height: 250,
      firstLines: 0,
      secondLines: 0,
      fillProgress: 0,
      firstLinesDuration: 1000,
      secondLinesDuration: 1000,
      fillDuration: 1000,
      waitAfterOutline: 1000,
      waitAfterFill: 3000,
      startTime: null,
      phase: "waiting",
    };

    // 重置"等待"移动动画的专门开始时间
    this.statusDisplay.waitingMoveStartTime = null;
  }

  // 更新状态提示
  updateStatusDisplay(timestamp) {
    const display = this.statusDisplay;

    // 更新点状态高亮
    this.updateHighlight(timestamp, display.pointHighlight, () => {
      // 根据当前点状态设置目标索引
      switch (this.animation.point.phase) {
        case "waitingBeforeMove":
          return 1; // "移动前等待"
        case "moving":
          return 2; // "移动"
        case "waitingAfterMove":
          return 3; // "移动后等待"
        case "completed":
          return 4; // "完成"
        default:
          return 1;
      }
    });

    // 更新矩形状态高亮
    this.updateHighlight(timestamp, display.rectangleHighlight, () => {
      // 根据当前矩形状态设置目标索引
      switch (this.animation.rectangle.phase) {
        case "waiting":
          return 1; // "等待"
        case "drawingFirstLines":
          return 2; // "绘制左上线"
        case "drawingSecondLines":
          return 3; // "绘制右下线"
        case "waitingAfterOutline":
          return 4; // "填充前等待"
        case "filling":
          return 5; // "填充"
        case "waitingAfterFill":
          return 6; // "填充后等待"
        default:
          return 1; // 默认显示"等待"
      }
    });

    // 特殊逻辑：当点状态从"移动后等待"切换到"完成"时，矩形状态同步从"等待"切换到"绘制左上线"
    if (
      this.animation.point.phase === "waitingAfterMove" &&
      display.rectangleHighlight.currentIndex === 1 &&
      display.rectangleHighlight.targetIndex === 1
    ) {
      // 当点状态开始等待后移动时，矩形状态准备切换到"绘制左上线"
      display.rectangleHighlight.targetIndex = 2;
      display.rectangleHighlight.startTime = timestamp;
    }

    // 动态调整矩形状态"等待"的Y轴位置
    this.updateWaitingYPosition();
  }

  // 更新矩形状态"等待"的Y轴位置
  updateWaitingYPosition() {
    const display = this.statusDisplay;
    const pointPhase = this.animation.point.phase;

    // 目标Y坐标 = startY + 3 * lineHeight = 50 + 3 * 30 = 140
    // 初始Y坐标 = startY + 1 * lineHeight = 50 + 1 * 30 = 80
    // 需要移动的距离 = 140 - 80 = 60
    const targetOffset = 60;

    // 检查是否需要重置（当没有初始开始时间时）
    if (!display.waitingMoveStartTime) {
      display.waitingYOffset = 0;
      return;
    }

    // 计算从动画开始到当前的总进度，包括所有阶段的时间
    let totalProgress = 0;

    // 计算从"移动前等待"开始到点状态变成"完成"的总时长
    // 使用waitAfterMove的实际值，这样会受动画时长倍率滑块影响
    const totalDuration =
      this.getAdjustedDuration(this.animation.point.waitBeforeMove) +
      this.getAdjustedDuration(this.animation.point.moveDuration) +
      this.getAdjustedDuration(this.animation.point.waitAfterMove);

    // 使用专门的开始时间计算总进度
    const elapsed = performance.now() - display.waitingMoveStartTime;
    totalProgress = Math.min(elapsed / totalDuration, 1);

    // 基于总进度计算偏移量，确保"等待"在整个过程中匀速向下移动
    // 当点状态变成"completed"时，"等待"应该刚好移动到结束位置
    display.waitingYOffset = targetOffset * totalProgress;
  }

  // 更新高亮动画
  updateHighlight(timestamp, highlight, getTargetIndex) {
    const targetIndex = getTargetIndex();

    // 如果目标索引发生变化，开始过渡动画
    if (highlight.targetIndex !== targetIndex) {
      highlight.targetIndex = targetIndex;
      highlight.startTime = timestamp;
      highlight.transitionProgress = 0;
    }

    // 如果正在过渡中，更新过渡进度
    if (highlight.startTime && highlight.targetIndex !== highlight.currentIndex) {
      const elapsed = timestamp - highlight.startTime;
      highlight.transitionProgress = Math.min(elapsed / highlight.transitionDuration, 1);

      // 过渡完成，更新当前索引
      if (highlight.transitionProgress === 1) {
        highlight.currentIndex = highlight.targetIndex;
        highlight.startTime = null;
        highlight.transitionProgress = 0;
      }
    }
  }

  animate(timestamp) {
    // 此if代表初始状态，此时 startTime = null
    if (!this.animation.point.startTime) {
      this.animation.point.startTime = timestamp;
      // 设置"等待"移动动画的专门开始时间
      this.statusDisplay.waitingMoveStartTime = timestamp;
      this.updateCoordinates(); // 初始状态显示
    }

    this.updatePhase(timestamp);
    this.draw();
    requestAnimationFrame(this.animate.bind(this));
  }
}

// 创建动画实例并启动
new DrawRectangleMultiPhases();

class 曲线运动 {
  constructor() {
    this.canvas = document.getElementById("canvas-曲线滚动");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.cssWidth = this.canvas.offsetWidth;
    this.cssHeight = this.canvas.offsetHeight;
    this.ctx.scale(this.dpr, this.dpr);
    this.显示控制点 = false;

    this.摇摆路径控制点 = {
      P0: { x: 25, y: 150 },
      P1: { x: 150, y: this.cssHeight / 2 + 250 },
      P2: { x: this.cssWidth - 150, y: this.cssHeight / 2 + 250 },
      P3: { x: this.cssWidth - 25, y: 150 },
    };

    // 复选框配置
    this.checkbox = {
      x: 20,
      y: 20,
      width: 20,
      height: 20,
      checked: false,
      text: "显示路径控制点",
      hovered: false,
    };

    // 拖拽状态
    this.dragging = {
      isDragging: false,
      draggedPoint: null,
      offset: { x: 0, y: 0 },
    };

    // 圆球属性
    this.ball = {
      radius: 15,
      t: 0, // 贝塞尔曲线参数 t (0-1)
      direction: 1, // 1: 正向, -1: 反向
      baseSpeed: 0.0025, // 基础速度（加快5倍）
      currentSpeed: 0.0025,
      position: { x: 0, y: 0 },
      tangent: { x: 0, y: 0 },
      image: null, // 小球图片
      rotation: 0, // 旋转角度
    };

    // 加载小球图片
    this.loadBallImage();

    // 动画状态
    this.animation = {
      isPlaying: true,
      lastTime: 0,
    };

    // 绑定事件
    this.绑定鼠标事件();

    // 动画将在图片加载完成后开始
  }

  // 主绘制函数
  draw() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);

    // 绘制背景网格
    this.drawGrid();

    // 绘制摇摆路径
    this.绘制摇摆路径();

    // 绘制圆球
    this.drawBall();

    // 如果复选框选中，绘制控制点
    if (this.checkbox.checked) {
      this.显示控制点 = true;
      this.绘制摇摆路径控制点();
    } else {
      this.显示控制点 = false;
    }

    // 绘制复选框
    this.drawCheckbox();
  }

  // 绘制背景网格
  drawGrid() {
    this.ctx.strokeStyle = "#ffffff0a";
    this.ctx.lineWidth = 1;

    // 绘制垂直线
    for (let x = 0; x <= this.cssWidth; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.cssHeight);
      this.ctx.stroke();
    }

    // 绘制水平线
    for (let y = 0; y <= this.cssHeight; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.cssWidth, y);
      this.ctx.stroke();
    }
  }

  绘制摇摆路径() {
    const { P0, P1, P2, P3 } = this.摇摆路径控制点;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(P0.x, P0.y);
    this.ctx.bezierCurveTo(P1.x, P1.y, P2.x, P2.y, P3.x, P3.y);
    this.ctx.strokeStyle = "#4CAF50";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }

  绘制摇摆路径控制点() {
    const { P0, P1, P2, P3 } = this.摇摆路径控制点;

    // 绘制控制点连线
    this.ctx.save();
    this.ctx.strokeStyle = "#666";
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);

    // P0 到 P1 的连线
    this.ctx.beginPath();
    this.ctx.moveTo(P0.x, P0.y);
    this.ctx.lineTo(P1.x, P1.y);
    this.ctx.stroke();

    // P2 到 P3 的连线
    this.ctx.beginPath();
    this.ctx.moveTo(P2.x, P2.y);
    this.ctx.lineTo(P3.x, P3.y);
    this.ctx.stroke();

    this.ctx.restore();

    // 绘制控制点
    const points = [P0, P1, P2, P3];
    const colors = ["#aF2B2B", "#aE5e00", "#055771", "#768E14"];
    const labels = ["P0", "P1", "P2", "P3"];
    const labelOffsets = [
      { x: 0, y: -20 }, // P0: 上方
      { x: 25, y: 0 }, // P1: 右侧
      { x: -25, y: 0 }, // P2: 左侧
      { x: 0, y: -20 }, // P3: 上方
    ];

    points.forEach((point, index) => {
      // 绘制控制点圆圈
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      this.ctx.fillStyle = colors[index];
      this.ctx.fill();
      this.ctx.strokeStyle = "#fff";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.restore();

      // 绘制标签（移到控制点外部）
      this.ctx.save();
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "12px 'Google Sans Code', sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";

      const labelX = point.x + labelOffsets[index].x;
      const labelY = point.y + labelOffsets[index].y;

      // 绘制标签文本
      this.ctx.fillStyle = "#fff";
      this.ctx.fillText(labels[index], labelX, labelY);
      this.ctx.restore();
    });
  }

  // 绘制复选框
  drawCheckbox() {
    const checkbox = this.checkbox;

    // 绘制复选框背景
    this.ctx.save();
    if (checkbox.hovered) {
      this.ctx.fillStyle = "#333";
      this.ctx.fillRect(checkbox.x - 2, checkbox.y - 2, checkbox.width + 4, checkbox.height + 4);
    }

    // 绘制复选框边框
    this.ctx.strokeStyle = checkbox.checked ? "#aaa" : "#666";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(checkbox.x, checkbox.y, checkbox.width, checkbox.height);

    // 如果选中，绘制勾选标记
    if (checkbox.checked) {
      this.ctx.strokeStyle = "#4CAF50";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(checkbox.x + 4, checkbox.y + checkbox.height / 2);
      this.ctx.lineTo(checkbox.x + checkbox.width / 2, checkbox.y + checkbox.height - 4);
      this.ctx.lineTo(checkbox.x + checkbox.width - 4, checkbox.y + 4);
      this.ctx.stroke();
    }

    this.ctx.restore();

    // 绘制复选框文本
    this.ctx.save();
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "14px sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(checkbox.text, checkbox.x + checkbox.width + 8, checkbox.y + checkbox.height / 2);
    this.ctx.restore();
  }

  // 绑定事件
  绑定鼠标事件() {
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e));
    this.canvas.addEventListener("mouseleave", (e) => this.handleMouseLeave(e));
  }

  // 处理鼠标按下事件
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否点击了复选框
    if (this.isPointInCheckbox(x, y)) {
      this.checkbox.checked = !this.checkbox.checked;
      this.draw();
      return;
    }

    // 如果复选框选中，检查是否点击了控制点
    if (this.显示控制点) {
      const clickedPoint = this.getClickedControlPoint(x, y);
      if (clickedPoint) {
        this.dragging.isDragging = true;
        this.dragging.draggedPoint = clickedPoint;
        this.dragging.offset.x = x - clickedPoint.x;
        this.dragging.offset.y = y - clickedPoint.y;
        this.canvas.style.cursor = "grabbing";
      }
    }
  }

  // 处理鼠标移动事件
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查鼠标是否悬停在复选框上
    this.checkbox.hovered = this.isPointInCheckbox(x, y);

    // 如果正在拖拽控制点
    if (this.dragging.isDragging && this.dragging.draggedPoint) {
      this.dragging.draggedPoint.x = x - this.dragging.offset.x;
      this.dragging.draggedPoint.y = y - this.dragging.offset.y;
      this.draw();
      return;
    }

    // 更新鼠标样式
    if (this.显示控制点) {
      const hoveredPoint = this.getClickedControlPoint(x, y);
      if (hoveredPoint) {
        this.canvas.style.cursor = "grab";
      } else if (this.checkbox.hovered) {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
      } else {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
      }
    } else if (this.checkbox.hovered) {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
    } else {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
    }

    this.draw();
  }

  // 处理鼠标抬起事件
  handleMouseUp(e) {
    this.dragging.isDragging = false;
    this.dragging.draggedPoint = null;
    this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
  }

  // 处理鼠标离开事件
  handleMouseLeave(e) {
    this.dragging.isDragging = false;
    this.dragging.draggedPoint = null;
    this.checkbox.hovered = false;
    this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
    this.draw();
  }

  // 检查点是否在复选框内
  isPointInCheckbox(x, y) {
    const checkbox = this.checkbox;
    return (
      x >= checkbox.x &&
      x <= checkbox.x + checkbox.width + 8 + this.ctx.measureText(checkbox.text).width &&
      y >= checkbox.y &&
      y <= checkbox.y + checkbox.height
    );
  }

  // 获取点击的控制点
  getClickedControlPoint(x, y) {
    const points = [this.摇摆路径控制点.P0, this.摇摆路径控制点.P1, this.摇摆路径控制点.P2, this.摇摆路径控制点.P3];
    const radius = 8;

    for (let point of points) {
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
      if (distance <= radius) {
        return point;
      }
    }
    return null;
  }

  // 计算贝塞尔曲线上的点
  getBezierPoint(t) {
    const { P0, P1, P2, P3 } = this.摇摆路径控制点;
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const x = uuu * P0.x + 3 * uu * t * P1.x + 3 * u * tt * P2.x + ttt * P3.x;
    const y = uuu * P0.y + 3 * uu * t * P1.y + 3 * u * tt * P2.y + ttt * P3.y;

    return { x, y };
  }

  // 计算贝塞尔曲线的切线向量
  getBezierTangent(t) {
    const { P0, P1, P2, P3 } = this.摇摆路径控制点;
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;

    const x = -3 * uu * P0.x + 3 * (uu - 2 * u * t) * P1.x + 3 * (2 * u * t - tt) * P2.x + 3 * tt * P3.x;
    const y = -3 * uu * P0.y + 3 * (uu - 2 * u * t) * P1.y + 3 * (2 * u * t - tt) * P2.y + 3 * tt * P3.y;

    // 归一化切线向量
    const length = Math.sqrt(x * x + y * y);
    return { x: x / length, y: y / length };
  }

  // 计算贝塞尔曲线的曲率（用于调整速度）
  getBezierCurvature(t) {
    const { P0, P1, P2, P3 } = this.摇摆路径控制点;
    const u = 1 - t;

    // 一阶导数
    const dx = -3 * u * u * P0.x + 3 * (u * u - 2 * u * t) * P1.x + 3 * (2 * u * t - t * t) * P2.x + 3 * t * t * P3.x;
    const dy = -3 * u * u * P0.y + 3 * (u * u - 2 * u * t) * P1.y + 3 * (2 * u * t - t * t) * P2.y + 3 * t * t * P3.y;

    // 二阶导数
    const ddx = 6 * u * P0.x + 3 * (-2 * u + 2 * t) * P1.x + 3 * (2 * u - 2 * t) * P2.x + 6 * t * P3.x;
    const ddy = 6 * u * P0.y + 3 * (-2 * u + 2 * t) * P1.y + 3 * (2 * u - 2 * t) * P2.y + 6 * t * P3.y;

    // 曲率公式: |x'y'' - y'x''| / (x'^2 + y'^2)^(3/2)
    const numerator = Math.abs(dx * ddy - dy * ddx);
    const denominator = Math.pow(dx * dx + dy * dy, 1.5);

    return denominator > 0 ? numerator / denominator : 0;
  }

  // 更新圆球位置
  updateBall() {
    // 计算时间增量，确保不同刷新率下速度一致
    const currentTime = performance.now();
    const deltaTime = this.animation.lastTime === 0 ? 0 : currentTime - this.animation.lastTime;
    this.animation.lastTime = currentTime;

    // 基于时间增量更新 t 值
    this.ball.t += this.ball.currentSpeed * this.ball.direction * (deltaTime / 16.67); // 16.67ms = 60fps基准

    // 检查边界，实现往返循环
    if (this.ball.t >= 1) {
      this.ball.t = 1;
      this.ball.direction = -1;
    } else if (this.ball.t <= 0) {
      this.ball.t = 0;
      this.ball.direction = 1;
    }

    // 计算当前位置
    this.ball.position = this.getBezierPoint(this.ball.t);

    // 计算切线方向
    this.ball.tangent = this.getBezierTangent(this.ball.t);

    // 根据高度调整速度（重力效果）
    // 找到曲线的最高点和最低点
    const { P0, P1, P2, P3 } = this.摇摆路径控制点;
    const maxY = Math.max(P0.y, P1.y, P2.y, P3.y);
    const minY = Math.min(P0.y, P1.y, P2.y, P3.y);

    // 当前高度相对于最低点的比例
    const heightRatio = (this.ball.position.y - minY) / (maxY - minY);

    // 速度计算：最低点最快，最高点最慢
    // 使用非常剧烈的速度变化
    const speedMultiplier = 0.1 + heightRatio * 7; // 0.1 到 5.0 之间，变化非常剧烈
    this.ball.currentSpeed = this.ball.baseSpeed * speedMultiplier;

    // 更新旋转角度（根据高度调整旋转速度）
    // 旋转速度计算：最低点最快，最高点最慢
    const baseRotationSpeed = 0.3;
    const rotationSpeedMultiplier = 0.1 + heightRatio * 2.9; // 0.1 到 3.0 之间
    const rotationSpeed = baseRotationSpeed * rotationSpeedMultiplier;

    this.ball.rotation += rotationSpeed * this.ball.direction * (deltaTime / 16.67); // 基于时间增量
  }

  // 加载小球图片
  loadBallImage() {
    this.ball.image = new Image();
    this.ball.image.src = "/Images/Blogs/Canvas API/动画范例-01/ball.webp";
    this.ball.image.onload = () => {
      // 图片加载完成后开始动画
      this.animate();
    };
  }

  // 绘制圆球
  drawBall() {
    const { position, radius, tangent, image, rotation } = this.ball;

    // 计算圆球中心位置（球在曲线的上方滚动）
    const centerX = position.x + (0.5 - this.ball.t) * this.ball.radius;
    const centerY = position.y - radius;

    // 如果图片已加载，使用图片绘制
    if (image && image.complete) {
      // 绘制圆球主体（带旋转，不透明度100%）
      this.ctx.save();
      // 移动到球心位置
      this.ctx.translate(centerX, centerY);
      // 旋转
      this.ctx.rotate(rotation);
      // 绘制图片
      this.ctx.globalAlpha = 1.0; // 确保不透明度为100%
      this.ctx.drawImage(image, -radius, -radius, radius * 2, radius * 2);
      this.ctx.restore();
    } else {
      // 图片未加载时，绘制默认圆球（带旋转）
      this.ctx.save();
      // 移动到球心位置
      this.ctx.translate(centerX, centerY);
      // 旋转
      this.ctx.rotate(rotation);

      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = "#FFD700";
      this.ctx.fill();
      this.ctx.strokeStyle = "#FF6B35";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // 绘制旋转标记线（显示快速旋转效果）
      this.ctx.strokeStyle = "#FF6B35";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(radius * 0.7, 0);
      this.ctx.stroke();

      this.ctx.restore();
    }
  }

  // 动画循环
  animate() {
    if (!this.animation.isPlaying) return;

    // 更新圆球位置
    this.updateBall();

    // 绘制
    this.draw();

    // 继续动画
    requestAnimationFrame(() => this.animate());
  }
}

new 曲线运动();
