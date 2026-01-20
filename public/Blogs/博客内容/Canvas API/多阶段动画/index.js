class DrawRectangleMultiPhases {
  constructor() {
    this.canvas = document.getElementById("canvas-phase");
    this.ctx = this.canvas.getContext("2d");

    this.setupCanvas();

    this.config = {
      point: {
        waitBeforeMove: 1000,
        move: 1000,
        waitAfterMove: 1000,
      },
      rect: {
        width: 150,
        height: 250,
        firstLines: 1000,
        secondLines: 1000,
        waitAfterOutline: 500,
        fill: 1000,
        waitAfterFill: 3000,
      },
      highlightDuration: 125,
      waitingYOffset: 60,
      slider: {
        x: 30,
        y: this.cssHeight - 80,
        width: 120,
        height: 8,
        thumb: 20,
        min: 1,
        max: 5,
        value: 1,
      },
    };

    this.state = {
      speed: 1,
      point: {
        phase: "waitingBeforeMove",
        startTime: null,
        start: { x: 0, y: 0 },
        target: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
      },
      rect: {
        phase: "waiting",
        startTime: null,
        first: 0,
        second: 0,
        fill: 0,
      },
      highlight: {
        point: { current: 1, target: 1, progress: 0, start: null },
        rect: { current: 1, target: 1, progress: 0, start: null },
      },
      waitingMoveStart: null,
      waitingYOffset: 0,
      timelineStart: null,
      slider: { dragging: false, hovered: false },
    };

    this.setTargetToCenter();
    this.attachEvents();
    this.resetAnimation(true);
    requestAnimationFrame(this.loop.bind(this));
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cssWidth = rect.width;
    this.cssHeight = rect.height;
  }

  setTargetToCenter() {
    const w = this.config.rect.width;
    const h = this.config.rect.height;
    this.state.point.target.x = (this.cssWidth - w) / 2;
    this.state.point.target.y = (this.cssHeight - h) / 2;
  }

  attachEvents() {
    window.addEventListener("resize", () => {
      this.setupCanvas();
      this.setTargetToCenter();
      this.config.slider.y = this.cssHeight - 80;
      this.resetAnimation(true);
    });

    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.handleMouseUp());
    this.canvas.addEventListener("mouseleave", () => this.handleMouseLeave());
  }

  loop(timestamp) {
    if (!this.state.timelineStart) {
      this.state.timelineStart = timestamp;
      this.state.waitingMoveStart = timestamp;
      this.updateCoordinates();
    }

    this.update(timestamp);
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }

  resetAnimation(reseed = false, preserveSliderDrag = false) {
    this.state.point.phase = "waitingBeforeMove";
    this.state.point.startTime = null;
    this.state.point.pos = { x: 0, y: 0 };
    if (reseed) {
      this.state.point.start = { x: 0, y: 0 };
    } else {
      this.state.point.start = { x: this.state.point.pos.x, y: this.state.point.pos.y };
    }

    this.state.rect.phase = "waiting";
    this.state.rect.startTime = null;
    this.state.rect.first = 0;
    this.state.rect.second = 0;
    this.state.rect.fill = 0;

    this.state.highlight.point = { current: 1, target: 1, progress: 0, start: null };
    this.state.highlight.rect = { current: 1, target: 1, progress: 0, start: null };

    this.state.waitingMoveStart = null;
    this.state.waitingYOffset = 0;
    this.state.timelineStart = null;
    if (!preserveSliderDrag) {
      this.state.slider.dragging = false;
      this.state.slider.hovered = false;
    }
    // 保持当前 speed，slider 的 value 已外部同步
    this.updateCoordinates();
  }

  update(timestamp) {
    this.updatePoint(timestamp);
    this.updateRect(timestamp);
    this.updateHighlights(timestamp);
    this.updateWaitingYOffset(timestamp);
    this.updateCoordinates();
  }

  updatePoint(timestamp) {
    const durations = this.getPointDurations();
    const p = this.state.point;

    if (!p.startTime) p.startTime = timestamp;
    if (!this.state.waitingMoveStart) this.state.waitingMoveStart = timestamp;

    const elapsed = timestamp - p.startTime;

    switch (p.phase) {
      case "waitingBeforeMove":
        if (elapsed >= durations.waitBeforeMove) {
          p.phase = "moving";
          p.startTime = timestamp;
        }
        break;
      case "moving":
        {
          const progress = Math.min(elapsed / durations.move, 1);
          p.pos.x = p.start.x + (p.target.x - p.start.x) * progress;
          p.pos.y = p.start.y + (p.target.y - p.start.y) * progress;
          if (progress === 1) {
            p.phase = "waitingAfterMove";
            p.startTime = timestamp;
          }
        }
        break;
      case "waitingAfterMove":
        if (elapsed >= durations.waitAfterMove) {
          p.phase = "completed";
          p.startTime = timestamp;
          this.startRectangle(timestamp);
        }
        break;
      default:
        break;
    }
  }

  startRectangle(timestamp) {
    const r = this.state.rect;
    if (r.phase !== "waiting") return;
    r.phase = "drawingFirstLines";
    r.startTime = timestamp;
    r.first = 0;
    r.second = 0;
    r.fill = 0;
  }

  updateRect(timestamp) {
    const r = this.state.rect;
    if (!r.startTime) return;
    const d = this.getRectDurations();
    const elapsed = timestamp - r.startTime;

    switch (r.phase) {
      case "drawingFirstLines":
        r.first = Math.min(elapsed / d.firstLines, 1);
        if (r.first === 1) {
          r.phase = "drawingSecondLines";
          r.startTime = timestamp;
        }
        break;
      case "drawingSecondLines":
        r.second = Math.min(elapsed / d.secondLines, 1);
        if (r.second === 1) {
          r.phase = "waitingAfterOutline";
          r.startTime = timestamp;
        }
        break;
      case "waitingAfterOutline":
        if (elapsed >= d.waitAfterOutline) {
          r.phase = "filling";
          r.startTime = timestamp;
        }
        break;
      case "filling":
        r.fill = Math.min(elapsed / d.fill, 1);
        if (r.fill === 1) {
          r.phase = "waitingAfterFill";
          r.startTime = timestamp;
        }
        break;
      case "waitingAfterFill":
        if (elapsed >= d.waitAfterFill) {
          this.resetAnimation();
        }
        break;
      default:
        break;
    }
  }

  updateWaitingYOffset(timestamp) {
    if (!this.state.waitingMoveStart) {
      this.state.waitingYOffset = 0;
      return;
    }
    const total = this.getPointDurations();
    const totalDuration = total.waitBeforeMove + total.move + total.waitAfterMove;
    const elapsed = timestamp - this.state.waitingMoveStart;
    const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);
    this.state.waitingYOffset = this.config.waitingYOffset * progress;
  }

  updateHighlights(timestamp) {
    this.updateHighlightBlock(timestamp, this.state.highlight.point, this.getPointStatusIndex());
    this.updateHighlightBlock(timestamp, this.state.highlight.rect, this.getRectStatusIndex());
  }

  updateHighlightBlock(timestamp, block, targetIndex) {
    if (block.target !== targetIndex) {
      block.target = targetIndex;
      block.start = timestamp;
      block.progress = 0;
    }
    if (block.start && block.current !== block.target) {
      const elapsed = timestamp - block.start;
      block.progress = Math.min(elapsed / this.config.highlightDuration, 1);
      if (block.progress === 1) {
        block.current = block.target;
        block.start = null;
        block.progress = 0;
      }
    }
  }

  getPointStatusIndex() {
    switch (this.state.point.phase) {
      case "waitingBeforeMove":
        return 1;
      case "moving":
        return 2;
      case "waitingAfterMove":
        return 3;
      case "completed":
        return 4;
      default:
        return 1;
    }
  }

  getRectStatusIndex() {
    switch (this.state.rect.phase) {
      case "waiting":
        return 1;
      case "drawingFirstLines":
        return 2;
      case "drawingSecondLines":
        return 3;
      case "waitingAfterOutline":
        return 4;
      case "filling":
        return 5;
      case "waitingAfterFill":
        return 6;
      default:
        return 1;
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawDashedBorders();
    if (this.state.point.phase === "waitingAfterMove" || this.state.rect.phase !== "waiting") {
      this.drawRectangle();
    }
    this.drawPoint();
    this.drawStatusDisplay();
    this.drawSpeedSlider();
  }

  drawPoint() {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(this.state.point.pos.x, this.state.point.pos.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "orange";
    ctx.fill();
  }

  drawRectangle() {
    const ctx = this.ctx;
    const rect = this.state.rect;
    const w = this.config.rect.width;
    const h = this.config.rect.height;
    const startX = (this.cssWidth - w) / 2;
    const startY = (this.cssHeight - h) / 2;

    ctx.strokeStyle = "lightskyblue";
    ctx.lineWidth = 2;

    if (rect.phase !== "waiting") {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + w * rect.first, startY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX, startY + h * rect.first);
      ctx.stroke();
    }

    if (["drawingSecondLines", "waitingAfterOutline", "filling", "waitingAfterFill"].includes(rect.phase)) {
      ctx.beginPath();
      ctx.moveTo(startX + w, startY);
      ctx.lineTo(startX + w, startY + h * rect.second);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(startX, startY + h);
      ctx.lineTo(startX + w * rect.second, startY + h);
      ctx.stroke();
    }

    if (["filling", "waitingAfterFill"].includes(rect.phase)) {
      ctx.fillStyle = "rgba(0, 100, 255, 0.5)";
      const fillHeight = h * rect.fill;
      ctx.fillRect(startX, startY, w, fillHeight);
    }
  }

  drawStatusDisplay() {
    const display = {
      leftX: this.cssWidth - 210,
      rightX: this.cssWidth - 100,
      startY: 50,
      lineHeight: 30,
      highlightHeight: 25,
      padding: 5,
    };

    const pointStatus = ["点状态", "移动前等待", "移动", "移动后等待", "完成"];
    const rectStatus = ["矩形状态", "等待", "绘制左上线", "绘制右下线", "填充前等待", "填充", "填充后等待"];

    this.ctx.font = "14px Arial";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";

    this.drawStatusColumn(display.leftX, display.startY, pointStatus, this.state.highlight.point, "left", display);
    this.drawStatusColumn(display.rightX, display.startY, rectStatus, this.state.highlight.rect, "right", display);
  }

  drawStatusColumn(x, startY, texts, highlight, column, display) {
    const ctx = this.ctx;
    texts.forEach((text, index) => {
      let y = startY + index * display.lineHeight;

      if (column === "right") {
        if (index === 1) {
          y += this.state.waitingYOffset;
        } else if (index >= 2) {
          y += 60;
        }
      }

      if (index !== 0) {
        let alpha = 0;
        if (highlight.current === index) alpha = 0.5;
        else if (highlight.target === index && highlight.progress > 0) alpha = 0.5 * highlight.progress;
        else if (highlight.current !== 0 && highlight.progress > 0 && highlight.current === index) alpha = 0.5 * (1 - highlight.progress);
        if (alpha > 0) {
          ctx.fillStyle = `rgba(50, 150, 255, ${alpha})`;
          ctx.fillRect(
            x - display.padding,
            y - display.highlightHeight / 2,
            ctx.measureText(text).width + display.padding * 2,
            display.highlightHeight,
          );
        }
      }

      if (index === 0) {
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "Gold";
      } else {
        ctx.font = "14px sans-serif";
        const active =
          highlight.current === index ||
          (highlight.target === index && highlight.progress > 0) ||
          (highlight.current !== 0 && highlight.progress > 0 && highlight.current === index);
        ctx.fillStyle = active ? "white" : "silver";
      }
      ctx.fillText(text, x, y + 1);
    });
  }

  drawSpeedSlider() {
    const slider = this.config.slider;
    const stateSlider = this.state.slider;
    const ctx = this.ctx;

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("动画时长倍率", slider.x + slider.width / 2, slider.y - 25);

    ctx.fillStyle = "#444";
    ctx.fillRect(slider.x, slider.y, slider.width, slider.height);

    const ratio = (this.state.speed - slider.min) / (slider.max - slider.min);
    const filledWidth = ratio * slider.width;
    if (filledWidth > 0) {
      ctx.fillStyle = "rgba(76, 175, 80, 0.75)";
      ctx.fillRect(slider.x, slider.y, filledWidth, slider.height);
    }

    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.strokeRect(slider.x, slider.y, slider.width, slider.height);

    const thumbX = slider.x + ratio * slider.width;
    ctx.fillStyle = stateSlider.hovered || stateSlider.dragging ? "#66BB6A" : "#2C8F30";
    ctx.beginPath();
    ctx.arc(thumbX, slider.y + slider.height / 2, slider.thumb / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = "center";
    for (let i = slider.min; i <= slider.max; i++) {
      const markX = slider.x + ((i - slider.min) / (slider.max - slider.min)) * slider.width;
      const markY = slider.y + slider.height + 20;
      if (i === this.state.speed) {
        ctx.font = "bold 14px Google Sans Code";
        ctx.fillStyle = "#4CAF50";
      } else {
        ctx.font = "12px Google Sans Code";
        ctx.fillStyle = "#888";
      }
      ctx.fillText(i.toString(), markX, markY);
    }
  }

  drawDashedBorders() {
    const ctx = this.ctx;
    ctx.setLineDash([7, 7]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.moveTo(0, this.state.point.pos.y);
    ctx.lineTo(this.state.point.pos.x, this.state.point.pos.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.state.point.pos.x, 0);
    ctx.lineTo(this.state.point.pos.x, this.state.point.pos.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  handleMouseDown(e) {
    const { x, y } = this.getMousePos(e);
    if (this.isPointInSlider(x, y)) {
      this.state.slider.dragging = true;
      this.updateSliderValue(x);
    }
  }

  handleMouseMove(e) {
    const { x, y } = this.getMousePos(e);
    this.state.slider.hovered = this.isPointInSlider(x, y);
    if (this.state.slider.dragging) {
      this.updateSliderValue(x);
    }
  }

  handleMouseUp() {
    this.state.slider.dragging = false;
  }

  handleMouseLeave() {
    this.state.slider.dragging = false;
    this.state.slider.hovered = false;
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  isPointInSlider(x, y) {
    const s = this.config.slider;
    const halfThumb = s.thumb / 2;
    return x >= s.x - halfThumb && x <= s.x + s.width + halfThumb && y >= s.y - halfThumb && y <= s.y + s.height + halfThumb;
  }

  updateSliderValue(x) {
    const s = this.config.slider;
    const clamped = Math.max(0, Math.min(s.width, x - s.x));
    const ratio = clamped / s.width;
    const newValue = Math.round(s.min + ratio * (s.max - s.min));
    if (newValue !== this.state.speed) {
      this.state.speed = newValue;
      this.config.slider.value = newValue;
      this.resetAnimation(true, true);
    }
  }

  getPointDurations() {
    return {
      waitBeforeMove: this.config.point.waitBeforeMove * this.state.speed,
      move: this.config.point.move * this.state.speed,
      waitAfterMove: this.config.point.waitAfterMove * this.state.speed,
    };
  }

  getRectDurations() {
    return {
      firstLines: this.config.rect.firstLines * this.state.speed,
      secondLines: this.config.rect.secondLines * this.state.speed,
      waitAfterOutline: this.config.rect.waitAfterOutline * this.state.speed,
      fill: this.config.rect.fill * this.state.speed,
      waitAfterFill: this.config.rect.waitAfterFill * this.state.speed,
    };
  }

  updateCoordinates() {
    const xCoord = document.getElementById("x-coord");
    const yCoord = document.getElementById("y-coord");
    if (!xCoord || !yCoord) return;
    xCoord.innerHTML = `X<span class="coord-colon">:</span><span class="coord-value">${Math.round(this.state.point.pos.x)}</span>`;
    xCoord.style.left = `${this.state.point.pos.x}px`;
    yCoord.innerHTML = `Y<span class="coord-colon">:</span><span class="coord-value">${Math.round(this.state.point.pos.y)}</span>`;
    yCoord.style.top = `${this.state.point.pos.y}px`;
  }
}

new DrawRectangleMultiPhases();
