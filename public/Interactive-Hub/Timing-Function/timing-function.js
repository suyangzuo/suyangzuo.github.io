class CubicBezierEditor {
  constructor() {
    this.canvas = document.getElementById('bezierCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.codeElement = document.getElementById('cubicBezierCode');
    this.copyBtn = document.getElementById('copyCode');
    this.playBtn = document.getElementById('playAnimation');
    this.durationInput = document.getElementById('animationDuration');
    this.decreaseBtn = document.getElementById('decreaseDuration');
    this.increaseBtn = document.getElementById('increaseDuration');
    this.demoElement = document.querySelector('.demo-element');
    this.presetBtns = document.querySelectorAll('.preset-btn');
    
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.margin = 150;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.graphWidth = this.width - 2 * this.margin;
    this.graphHeight = this.height - 2 * this.margin;
    
    this.controlPoints = { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1.0 };
    this.targetControlPoints = { ...this.controlPoints };
    
    // 保存初始状态
    this.initialControlPoints = { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1.0 };
    this.initialDuration = 1000;
    
    this.dragging = false;
    this.dragTarget = null;
    this.isAnimating = false;
    this.animationStartTime = 0;
    this.animationDuration = 500;
    this.hoveredPoint = null;
    
    this.durationInterval = null;
    this.durationTimeout = null;
    
    this.presets = {
      'ease': [0.25, 0.1, 0.25, 1],
      'linear': [0, 0, 1, 1],
      'ease-in': [0.42, 0, 1, 1],
      'ease-out': [0, 0, 0.58, 1],
      'ease-in-out': [0.42, 0, 0.58, 1]
    };
    
    this.init();
  }
  
  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.draw();
    this.updateCode();
    this.startAnimationLoop();
  }
  
  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.devicePixelRatio;
    this.canvas.height = rect.height * this.devicePixelRatio;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    this.width = rect.width;
    this.height = rect.height;
    this.graphWidth = this.width - 2 * this.margin;
    this.graphHeight = this.height - 2 * this.margin;
  }
  
  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    
    // 添加全局鼠标事件，支持Canvas外拖拽
    document.addEventListener('mousemove', this.onGlobalMouseMove.bind(this));
    document.addEventListener('mouseup', this.onGlobalMouseUp.bind(this));
    
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
    
    this.copyBtn.addEventListener('click', this.copyCode.bind(this));
    this.playBtn.addEventListener('click', this.playAnimation.bind(this));
    
    this.decreaseBtn.addEventListener('mousedown', () => this.startDurationChange(-100));
    this.increaseBtn.addEventListener('mousedown', () => this.startDurationChange(100));
    this.decreaseBtn.addEventListener('mouseup', this.stopDurationChange.bind(this));
    this.increaseBtn.addEventListener('mouseup', this.stopDurationChange.bind(this));
    this.decreaseBtn.addEventListener('mouseleave', this.stopDurationChange.bind(this));
    this.increaseBtn.addEventListener('mouseleave', this.stopDurationChange.bind(this));
    
    this.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        this.setPreset(preset);
      });
    });
    
    // 监听重置按钮
    const resetBtn = document.querySelector('.重置按钮');
    if (resetBtn) {
      resetBtn.addEventListener('click', this.resetToInitial.bind(this));
    }
    
    window.addEventListener('resize', this.onResize.bind(this));
  }
  
  startDurationChange(delta) {
    this.changeDuration(delta);
    
    this.durationTimeout = setTimeout(() => {
      this.durationInterval = setInterval(() => {
        this.changeDuration(delta);
      }, 100);
    }, 300);
  }
  
  stopDurationChange() {
    if (this.durationTimeout) {
      clearTimeout(this.durationTimeout);
      this.durationTimeout = null;
    }
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
  }
  
  changeDuration(delta) {
    const currentValue = parseInt(this.durationInput.value) || 1000;
    const newValue = Math.max(0, currentValue + delta);
    this.durationInput.value = newValue;
  }
  
  startAnimationLoop() {
    const animate = (currentTime) => {
      if (this.isAnimating) {
        this.updateAnimation(currentTime);
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
  
  updateAnimation(currentTime) {
    if (!this.animationStartTime) {
      this.animationStartTime = currentTime;
    }
    
    const elapsed = currentTime - this.animationStartTime;
    const progress = Math.min(elapsed / this.animationDuration, 1);
    const easeProgress = this.easeInOutCubic(progress);
    
    this.controlPoints.x1 = this.lerp(this.controlPoints.x1, this.targetControlPoints.x1, easeProgress);
    this.controlPoints.y1 = this.lerp(this.controlPoints.y1, this.targetControlPoints.y1, easeProgress);
    this.controlPoints.x2 = this.lerp(this.controlPoints.x2, this.targetControlPoints.x2, easeProgress);
    this.controlPoints.y2 = this.lerp(this.controlPoints.y2, this.targetControlPoints.y2, easeProgress);
    
    this.draw();
    this.updateCode();
    this.updatePresetHighlight();
    
    if (progress >= 1) {
      this.isAnimating = false;
      this.animationStartTime = 0;
      this.controlPoints = { ...this.targetControlPoints };
    }
  }
  
  lerp(start, end, t) {
    return start + (end - start) * t;
  }
  
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  screenToBezier(x, y) {
    const bezierX = (x - this.margin) / this.graphWidth;
    const bezierY = 1 - (y - this.margin) / this.graphHeight;
    return { x: bezierX, y: bezierY };
  }
  
  bezierToScreen(x, y) {
    const screenX = this.margin + x * this.graphWidth;
    const screenY = this.margin + (1 - y) * this.graphHeight;
    return { x: screenX, y: screenY };
  }
  
  getControlPointAt(x, y) {
    const tolerance = 15;
    const points = [
      { key: 'x1', x: this.controlPoints.x1, y: this.controlPoints.y1 },
      { key: 'x2', x: this.controlPoints.x2, y: this.controlPoints.y2 }
    ];
    
    for (let point of points) {
      const screenPos = this.bezierToScreen(point.x, point.y);
      const distance = Math.sqrt(
        Math.pow(x - screenPos.x, 2) + Math.pow(y - screenPos.y, 2)
      );
      if (distance <= tolerance) {
        return point.key;
      }
    }
    return null;
  }
  
  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.dragTarget = this.getControlPointAt(x, y);
    if (this.dragTarget) {
      this.dragging = true;
      this.canvas.style.cursor = 'grabbing';
      this.isAnimating = false;
    }
  }
  
  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const hoveredPoint = this.getControlPointAt(x, y);
    if (hoveredPoint !== this.hoveredPoint) {
      this.hoveredPoint = hoveredPoint;
      this.canvas.style.cursor = hoveredPoint ? 'grab' : 'default';
      this.draw();
    }
    
    if (!this.dragging || !this.dragTarget) return;
    
    const bezierPos = this.screenToBezier(x, y);
    const clampedX = Math.max(0, Math.min(1, bezierPos.x));
    this.controlPoints[this.dragTarget] = clampedX;
    this.controlPoints[this.dragTarget.replace('x', 'y')] = bezierPos.y;
    this.targetControlPoints = { ...this.controlPoints };
    
    this.draw();
    this.updateCode();
    this.updatePresetHighlight();
  }
  
  onMouseUp() {
    this.dragging = false;
    this.dragTarget = null;
    this.canvas.style.cursor = this.hoveredPoint ? 'grab' : 'default';
  }
  
  onMouseLeave() {
    // 鼠标离开Canvas时不停止拖拽，只更新悬停状态
    this.hoveredPoint = null;
    this.canvas.style.cursor = 'default';
    this.draw();
  }
  
  onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    this.dragTarget = this.getControlPointAt(x, y);
    if (this.dragTarget) {
      this.dragging = true;
      this.isAnimating = false;
    }
  }
  
  onTouchMove(e) {
    e.preventDefault();
    if (!this.dragging || !this.dragTarget) return;
    
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const bezierPos = this.screenToBezier(x, y);
    const clampedX = Math.max(0, Math.min(1, bezierPos.x));
    this.controlPoints[this.dragTarget] = clampedX;
    this.controlPoints[this.dragTarget.replace('x', 'y')] = bezierPos.y;
    this.targetControlPoints = { ...this.controlPoints };
    
    this.draw();
    this.updateCode();
    this.updatePresetHighlight();
  }
  
  onTouchEnd(e) {
    e.preventDefault();
    this.dragging = false;
    this.dragTarget = null;
  }
  
  onResize() {
    this.setupCanvas();
    this.draw();
  }
  
  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid();
    this.drawAxes();
    this.drawBezierCurve();
    this.drawControlPoints();
    this.drawLabels();
  }
  
  drawGrid() {
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 1;
    
    [0.25, 0.5, 0.75, 1].forEach(x => {
      const screenX = this.margin + x * this.graphWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, this.margin);
      this.ctx.lineTo(screenX, this.height - this.margin);
      this.ctx.stroke();
    });
    
    [0.25, 0.5, 0.75, 1].forEach(y => {
      const screenY = this.margin + (1 - y) * this.graphHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(this.margin, screenY);
      this.ctx.lineTo(this.width - this.margin, screenY);
      this.ctx.stroke();
    });
  }
  
  drawAxes() {
    this.ctx.strokeStyle = '#666666';
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.margin, this.height - this.margin);
    this.ctx.lineTo(this.width - this.margin, this.height - this.margin);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.margin, this.margin);
    this.ctx.lineTo(this.margin, this.height - this.margin);
    this.ctx.stroke();
  }
  
  drawBezierCurve() {
    this.ctx.strokeStyle = '#2a978c';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    
    this.ctx.moveTo(this.margin, this.height - this.margin);
    
    const cp1 = this.bezierToScreen(this.controlPoints.x1, this.controlPoints.y1);
    const cp2 = this.bezierToScreen(this.controlPoints.x2, this.controlPoints.y2);
    const end = this.bezierToScreen(1, 1);
    
    this.ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    this.ctx.stroke();
  }
  
  drawControlPoints() {
    const cp1 = this.bezierToScreen(this.controlPoints.x1, this.controlPoints.y1);
    const cp2 = this.bezierToScreen(this.controlPoints.x2, this.controlPoints.y2);
    const start = this.bezierToScreen(0, 0);
    const end = this.bezierToScreen(1, 1);
    
    this.ctx.strokeStyle = '#555555';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(cp1.x, cp1.y);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(cp2.x, cp2.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);
    
    this.drawPoint(cp1.x, cp1.y, '#4a90e2', '控制点1', this.hoveredPoint === 'x1');
    this.drawPoint(cp2.x, cp2.y, '#e74c3c', '控制点2', this.hoveredPoint === 'x2');
    this.drawPoint(start.x, start.y, '#27ae60', '起点', false);
    this.drawPoint(end.x, end.y, '#f39c12', '终点', false);
    
    this.drawCoordinateLabels(cp1, cp2);
  }
  
  drawPoint(x, y, color, label, isHovered) {
    const radius = isHovered ? 10 : 8;
    
    if (isHovered) {
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius + 2, 0, 2 * Math.PI);
      this.ctx.stroke();
    }
    
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius - 3, 0, 2 * Math.PI);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    
    if (label === '控制点1' || label === '控制点2') {
      this.ctx.fillText(label, x, y - 20);
    } else {
      this.ctx.fillText(label, x, y - radius - 8);
    }
  }
  
  drawCoordinateLabels(cp1, cp2) {
    this.ctx.font = '12px "Google Sans Code", monospace';
    this.ctx.textAlign = 'left';
    
    const x1 = Math.round(this.controlPoints.x1 * 100) / 100;
    const y1 = Math.round(this.controlPoints.y1 * 100) / 100;
    const x2 = Math.round(this.controlPoints.x2 * 100) / 100;
    const y2 = Math.round(this.controlPoints.y2 * 100) / 100;
    
    // 句柄1坐标显示在下方
    const coord1Text = `${x1}, ${y1}`;
    const coord1Width = this.ctx.measureText(coord1Text).width;
    
    // 绘制背景，增加垂直内边距
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(cp1.x + 15, cp1.y + 3, coord1Width + 10, 19);
    
    // 绘制坐标文本
    this.ctx.fillStyle = '#90cdf4'; // 蓝色数字
    this.ctx.fillText(x1.toString(), cp1.x + 20, cp1.y + 15);
    this.ctx.fillStyle = '#aaaaaa'; // 更亮的灰色逗号
    this.ctx.fillText(', ', cp1.x + 20 + this.ctx.measureText(x1.toString()).width, cp1.y + 15);
    this.ctx.fillStyle = '#90cdf4'; // 蓝色数字
    this.ctx.fillText(y1.toString(), cp1.x + 20 + this.ctx.measureText(x1.toString()).width + this.ctx.measureText(', ').width, cp1.y + 15);
    
    // 句柄2坐标显示在下方
    const coord2Text = `${x2}, ${y2}`;
    const coord2Width = this.ctx.measureText(coord2Text).width;
    
    // 绘制背景，增加垂直内边距
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(cp2.x + 15, cp2.y + 3, coord2Width + 10, 19);
    
    // 绘制坐标文本
    this.ctx.fillStyle = '#fbb6ce'; // 粉色数字
    this.ctx.fillText(x2.toString(), cp2.x + 20, cp2.y + 15);
    this.ctx.fillStyle = '#aaaaaa'; // 更亮的灰色逗号
    this.ctx.fillText(', ', cp2.x + 20 + this.ctx.measureText(x2.toString()).width, cp2.y + 15);
    this.ctx.fillStyle = '#fbb6ce'; // 粉色数字
    this.ctx.fillText(y2.toString(), cp2.x + 20 + this.ctx.measureText(x2.toString()).width + this.ctx.measureText(', ').width, cp2.y + 15);
  }
  
  drawLabels() {
    this.ctx.textAlign = 'center';
    
    // 时间标签位置调整到Canvas边缘和坐标轴数值之间的中心
    const timeLabelY = this.height - this.margin + 60; // 在坐标轴数值下方，距离Canvas边缘更远
    
    // 绘制时间标签，使用粉色和代码字体
    this.ctx.font = '14px "JetBrains Mono", "Consolas", "Monaco", monospace';
    this.ctx.fillStyle = '#fbb6ce'; // 粉色，对应第二个坐标点
    this.ctx.fillText('时间', this.width / 2 - 30, timeLabelY);
    
    // 确保括号使用相同的字体和大小
    this.ctx.font = '12px "JetBrains Mono", "Consolas", "Monaco", monospace';
    this.ctx.fillStyle = '#ffffff'; // 白色
    this.ctx.fillText('(', this.width / 2 - 5, timeLabelY);
    this.ctx.fillStyle = '#fbb6ce'; // 粉色
    this.ctx.fillText('t', this.width / 2 + 5, timeLabelY);
    this.ctx.fillStyle = '#ffffff'; // 白色
    this.ctx.fillText(')', this.width / 2 + 12, timeLabelY);
    
    // 位置标签位置调整到Canvas边缘和坐标轴数值之间的中心
    const positionLabelX = this.margin - 60; // 在坐标轴数值左侧，距离Canvas边缘更远
    
    this.ctx.save();
    this.ctx.translate(positionLabelX, this.height / 2);
    this.ctx.rotate(-Math.PI / 2);
    
    // 绘制位置标签，使用蓝色和代码字体
    this.ctx.font = '14px "JetBrains Mono", "Consolas", "Monaco", monospace';
    this.ctx.fillStyle = '#90cdf4'; // 蓝色，对应第一个坐标点
    this.ctx.fillText('位置', -30, 0);
    
    // 确保括号使用相同的字体和大小
    this.ctx.font = '12px "JetBrains Mono", "Consolas", "Monaco", monospace';
    this.ctx.fillStyle = '#ffffff'; // 白色
    this.ctx.fillText('(', -5, 0);
    this.ctx.fillStyle = '#90cdf4'; // 蓝色
    this.ctx.fillText('p', 5, 0);
    this.ctx.fillStyle = '#ffffff'; // 白色
    this.ctx.fillText(')', 12, 0);
    
    this.ctx.restore();
    
    this.ctx.font = '12px "JetBrains Mono", "Consolas", "Monaco", monospace';
    this.ctx.fillStyle = '#cccccc';
    [0, 0.25, 0.5, 0.75, 1].forEach(value => {
      const x = this.margin + value * this.graphWidth;
      const y = this.height - this.margin + 20;
      this.ctx.fillText(value.toString(), x, y);
    });
    
    [0, 0.25, 0.5, 0.75, 1].forEach(value => {
      const y = this.margin + (1 - value) * this.graphHeight;
      this.ctx.textAlign = 'right';
      this.ctx.fillText(value.toString(), this.margin - 10, y + 4);
    });
  }
  
  updateCode() {
    const x1 = Math.round(this.controlPoints.x1 * 100) / 100;
    const y1 = Math.round(this.controlPoints.y1 * 100) / 100;
    const x2 = Math.round(this.controlPoints.x2 * 100) / 100;
    const y2 = Math.round(this.controlPoints.y2 * 100) / 100;
    
    this.codeElement.innerHTML = `
      <span class="function-name">cubic-bezier</span><span class="parentheses">(</span><span class="number first-point">${x1}</span><span class="comma">, </span><span class="number first-point">${y1}</span><span class="comma">, </span><span class="number second-point">${x2}</span><span class="comma">, </span><span class="number second-point">${y2}</span><span class="parentheses">)</span>
    `;
  }
  
  checkPresetMatch() {
    const current = [
      this.controlPoints.x1,
      this.controlPoints.y1,
      this.controlPoints.x2,
      this.controlPoints.y2
    ];
    
    for (const [presetName, presetValues] of Object.entries(this.presets)) {
      const isMatch = presetValues.every((value, index) => 
        Math.abs(value - current[index]) < 0.01
      );
      if (isMatch) {
        return presetName;
      }
    }
    return null;
  }
  
  updatePresetHighlight() {
    const matchedPreset = this.checkPresetMatch();
    
    this.presetBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.preset === matchedPreset) {
        btn.classList.add('active');
      }
    });
  }
  
  copyCode() {
    const codeText = this.codeElement.textContent;
    navigator.clipboard.writeText(codeText).then(() => {
      const originalText = this.copyBtn.innerHTML;
      this.copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
      setTimeout(() => {
        this.copyBtn.innerHTML = originalText;
      }, 1000);
    });
  }
  
  setPreset(presetName) {
    if (this.presets[presetName]) {
      const [x1, y1, x2, y2] = this.presets[presetName];
      this.targetControlPoints = { x1, y1, x2, y2 };
      
      // 立即更新预设值高亮
      this.presetBtns.forEach(btn => btn.classList.remove('active'));
      document.querySelector(`[data-preset="${presetName}"]`).classList.add('active');
      
      // 开始500ms的动画过渡
      this.isAnimating = true;
      this.animationStartTime = 0;
      this.animationDuration = 500;
    }
  }
  
  playAnimation() {
    const duration = parseInt(this.durationInput.value);
    const x1 = this.controlPoints.x1;
    const y1 = this.controlPoints.y1;
    const x2 = this.controlPoints.x2;
    const y2 = this.controlPoints.y2;
    
    // 如果元素已经在终点位置，则重置到起点
    if (this.demoElement.style.left === 'calc(100% - 60px)') {
      this.demoElement.style.transition = 'none';
      this.demoElement.style.left = '20px';
      this.demoElement.offsetHeight; // 强制重排
    }
    
    this.demoElement.style.transition = `left ${duration}ms cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
    this.demoElement.style.left = 'calc(100% - 60px)';
  }
  
  onGlobalMouseMove(e) {
    if (!this.dragging || !this.dragTarget) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 计算相对于Canvas的位置
    const bezierPos = this.screenToBezier(x, y);
    const clampedX = Math.max(0, Math.min(1, bezierPos.x));
    this.controlPoints[this.dragTarget] = clampedX;
    this.controlPoints[this.dragTarget.replace('x', 'y')] = bezierPos.y;
    this.targetControlPoints = { ...this.controlPoints };
    
    this.draw();
    this.updateCode();
    this.updatePresetHighlight();
  }
  
  onGlobalMouseUp() {
    if (this.dragging) {
      this.dragging = false;
      this.dragTarget = null;
      this.canvas.style.cursor = this.hoveredPoint ? 'grab' : 'default';
    }
  }
  
  resetToInitial() {
    // 重置控制点到初始状态
    this.controlPoints = { ...this.initialControlPoints };
    this.targetControlPoints = { ...this.initialControlPoints };
    
    // 重置动画时长
    this.durationInput.value = this.initialDuration;
    
    // 重置预设值高亮
    this.presetBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-preset="ease"]').classList.add('active');
    
    // 重置动画演示元素
    this.demoElement.style.transition = 'none';
    this.demoElement.style.left = '20px';
    
    // 停止任何正在进行的动画
    this.isAnimating = false;
    this.animationStartTime = 0;
    
    // 更新显示
    this.draw();
    this.updateCode();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CubicBezierEditor();
});
