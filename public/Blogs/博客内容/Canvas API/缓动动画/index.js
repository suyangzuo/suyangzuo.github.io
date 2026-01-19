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

    this.checkbox = {
      x: 20,
      y: 20,
      width: 20,
      height: 20,
      checked: false,
      text: "显示路径控制点",
      hovered: false,
    };

    this.dragging = {
      isDragging: false,
      draggedPoint: null,
      offset: { x: 0, y: 0 },
    };

    this.ball = {
      radius: 15,
      t: 0,
      direction: 1,
      baseSpeed: 0.0025,
      currentSpeed: 0.0025,
      position: { x: 0, y: 0 },
      tangent: { x: 0, y: 0 },
      normal: { x: 0, y: 0 },
      image: null,
      rotation: 0,
    };

    this.loadBallImage();

    this.animation = {
      isPlaying: true,
      lastTime: 0,
    };

    this.绑定鼠标事件();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
    this.drawGrid();
    this.绘制摇摆路径();
    this.drawBall();
    if (this.checkbox.checked) {
      this.显示控制点 = true;
      this.绘制摇摆路径控制点();
    } else {
      this.显示控制点 = false;
    }
    this.drawCheckbox();
  }

  drawGrid() {
    this.ctx.strokeStyle = "#ffffff0a";
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= this.cssWidth; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.cssHeight);
      this.ctx.stroke();
    }

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

    this.ctx.save();
    this.ctx.strokeStyle = "#666";
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);

    this.ctx.beginPath();
    this.ctx.moveTo(P0.x, P0.y);
    this.ctx.lineTo(P1.x, P1.y);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(P2.x, P2.y);
    this.ctx.lineTo(P3.x, P3.y);
    this.ctx.stroke();

    this.ctx.restore();

    const points = [P0, P1, P2, P3];
    const colors = ["#aF2B2B", "#aE5e00", "#055771", "#768E14"];
    const labels = ["P0", "P1", "P2", "P3"];
    const labelOffsets = [
      { x: 0, y: -20 },
      { x: 25, y: 0 },
      { x: -25, y: 0 },
      { x: 0, y: -20 },
    ];

    points.forEach((point, index) => {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      this.ctx.fillStyle = colors[index];
      this.ctx.fill();
      this.ctx.strokeStyle = "#fff";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.restore();

      this.ctx.save();
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "12px 'Google Sans Code', Consolas, monospace";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";

      const labelX = point.x + labelOffsets[index].x;
      const labelY = point.y + labelOffsets[index].y;

      this.ctx.fillStyle = "#fff";
      this.ctx.fillText(labels[index], labelX, labelY);
      this.ctx.restore();
    });
  }

  drawCheckbox() {
    const checkbox = this.checkbox;

    this.ctx.save();
    if (checkbox.hovered) {
      this.ctx.fillStyle = "#333";
      this.ctx.fillRect(checkbox.x - 2, checkbox.y - 2, checkbox.width + 4, checkbox.height + 4);
    }

    this.ctx.strokeStyle = checkbox.checked ? "#aaa" : "#666";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(checkbox.x, checkbox.y, checkbox.width, checkbox.height);

    if (checkbox.checked) {
      this.ctx.strokeStyle = "#4CAF50";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(checkbox.x + 4, checkbox.y + checkbox.height / 2);
      this.ctx.lineTo(checkbox.x + checkbox.width * 0.45, checkbox.y + checkbox.height - 5);
      this.ctx.lineTo(checkbox.x + checkbox.width - 4, checkbox.y + 4);
      this.ctx.stroke();
    }

    this.ctx.restore();

    this.ctx.save();
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "14px 'Noto Sans SC', 微软雅黑, sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(checkbox.text, checkbox.x + checkbox.width + 8, checkbox.y + checkbox.height / 2);
    this.ctx.restore();
  }

  绑定鼠标事件() {
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e));
    this.canvas.addEventListener("mouseleave", (e) => this.handleMouseLeave(e));
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.isPointInCheckbox(x, y)) {
      this.checkbox.checked = !this.checkbox.checked;
      this.draw();
      return;
    }

    if (this.显示控制点) {
      const clickedPoint = this.getClickedControlPoint(x, y);
      if (clickedPoint) {
        this.dragging.isDragging = true;
        this.dragging.draggedPoint = clickedPoint;
        this.dragging.offset.x = x - clickedPoint.x;
        this.dragging.offset.y = y - clickedPoint.y;
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-拖拽.cur"), grabbing';
      }
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.checkbox.hovered = this.isPointInCheckbox(x, y);

    if (this.dragging.isDragging && this.dragging.draggedPoint) {
      this.dragging.draggedPoint.x = x - this.dragging.offset.x;
      this.dragging.draggedPoint.y = y - this.dragging.offset.y;
      this.draw();
      return;
    }

    if (this.显示控制点) {
      const hoveredPoint = this.getClickedControlPoint(x, y);
      if (hoveredPoint || this.checkbox.hovered) {
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

  handleMouseUp(e) {
    this.dragging.isDragging = false;
    this.dragging.draggedPoint = null;
    this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
  }

  handleMouseLeave(e) {
    this.dragging.isDragging = false;
    this.dragging.draggedPoint = null;
    this.checkbox.hovered = false;
    this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
    this.draw();
  }

  isPointInCheckbox(x, y) {
    const checkbox = this.checkbox;
    this.ctx.font = "14px 'Noto Sans SC', 微软雅黑, sans-serif";
    return (
      x >= checkbox.x &&
      x <= checkbox.x + checkbox.width + 8 + this.ctx.measureText(checkbox.text).width &&
      y >= checkbox.y &&
      y <= checkbox.y + checkbox.height
    );
  }

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

  updateBall() {
    const currentTime = performance.now();
    const deltaTime = this.animation.lastTime === 0 ? 0 : currentTime - this.animation.lastTime;
    this.animation.lastTime = currentTime;

    this.ball.t += this.ball.currentSpeed * this.ball.direction * (deltaTime / 16.67);

    if (this.ball.t >= 1) {
      this.ball.t = 1;
      this.ball.direction = -1;
    } else if (this.ball.t <= 0) {
      this.ball.t = 0;
      this.ball.direction = 1;
    }

    this.ball.position = this.getBezierPoint(this.ball.t);
    this.ball.tangent = this.getBezierTangent(this.ball.t);
    this.ball.normal = {
      x: -this.ball.tangent.y,
      y: this.ball.tangent.x,
    };

    const { P0, P1, P2, P3 } = this.摇摆路径控制点;
    const maxY = Math.max(P0.y, P1.y, P2.y, P3.y);
    const minY = Math.min(P0.y, P1.y, P2.y, P3.y);

    const heightRatio = (this.ball.position.y - minY) / (maxY - minY);

    const speedMultiplier = 0.1 + heightRatio * 7;
    this.ball.currentSpeed = this.ball.baseSpeed * speedMultiplier;

    const baseRotationSpeed = 0.3;
    const rotationSpeedMultiplier = 0.1 + heightRatio * 2.9;
    const rotationSpeed = baseRotationSpeed * rotationSpeedMultiplier;

    this.ball.rotation += rotationSpeed * this.ball.direction * (deltaTime / 16.67);
  }

  loadBallImage() {
    this.ball.image = new Image();
    this.ball.image.src = "/Images/Blogs/Canvas API/动画范例-01/ball.webp";
    this.ball.image.onload = () => {
      this.animate();
    };
  }

  drawBall() {
    const { position, radius, normal, image, rotation } = this.ball;

    const 图像高度 = radius * 2;
    const 偏移距离 = 图像高度 / 2;
    const centerX = position.x - normal.x * 偏移距离;
    const centerY = position.y - normal.y * 偏移距离;

    if (image && image.complete) {
      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(rotation);
      this.ctx.globalAlpha = 1.0;
      this.ctx.drawImage(image, -radius, -radius, radius * 2, radius * 2);
      this.ctx.restore();
    } else {
      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(rotation);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = "#FFD700";
      this.ctx.fill();
      this.ctx.strokeStyle = "#FF6B35";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.strokeStyle = "#FF6B35";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(radius * 0.7, 0);
      this.ctx.stroke();

      this.ctx.restore();
    }
  }

  animate() {
    if (!this.animation.isPlaying) return;
    this.updateBall();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

new 曲线运动();
