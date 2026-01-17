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
      normal: { x: 0, y: 0 }, // 法线方向
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

    // 计算法线方向（垂直于切线，指向曲线外侧）
    // 对于向下弯曲的曲线，法线应该是 (-tangent.y, tangent.x)
    this.ball.normal = {
      x: -this.ball.tangent.y,
      y: this.ball.tangent.x,
    };

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
    const { position, radius, normal, image, rotation } = this.ball;

    // 计算圆球中心位置
    // 小球图像的中心点就是以t算出的曲线上的坐标点
    // 同时，小球要始终根据法线方向，反方向移动图像绘制高度的一半
    const 图像高度 = radius * 2;
    const 偏移距离 = 图像高度 / 2; // 图像绘制高度的一半
    const centerX = position.x - normal.x * 偏移距离; // 反方向移动
    const centerY = position.y - normal.y * 偏移距离; // 反方向移动

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
