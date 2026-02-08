const 光标 = {
  默认: 'url("/Images/Common/鼠标-默认.cur"), auto',
  指向: 'url("/Images/Common/鼠标-指向.cur"), pointer',
  拖拽: 'url("/Images/Common/鼠标-拖拽.cur"), grab',
};

class 热区 {
  constructor() {
    this.初始化();
    this.安装事件();
    this.绘制();
  }

  初始化() {
    this.cvs = document.getElementById("cvs-热区");
    this.ctx = this.cvs.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.cssWidth = this.cvs.clientWidth;
    this.cssHeight = this.cvs.clientHeight;
    this.width = this.cssWidth * this.dpr;
    this.height = this.cssHeight * this.dpr;
    this.cvs.width = this.width;
    this.cvs.height = this.height;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // 中央矩形初始尺寸（CSS像素）
    this.rect = {
      w: Math.min(400, this.cssWidth * 0.6),
      h: Math.min(250, this.cssHeight * 0.5),
      x: 0,
      y: 0,
    };
    this.rect.x = (this.cssWidth - this.rect.w) / 2;
    this.rect.y = (this.cssHeight - this.rect.h) / 2 - 100;

    // 颜色与样式
    this.bgColor = "#0f1720";
    this.edgeColor = "#48b0ff";
    this.cornerColor = "#48b0ff";
    this.fillColor = "rgba(80, 160, 255, 0.15)";
    this.fillHoverColor = "rgba(80, 160, 255, 0.25)";
    this.highlightColor = "#ffd166";
    this.toleranceFill = "rgba(255,209,102,0.12)";
    this.toleranceStroke = "rgb(201, 92, 150)";
    this.sliderFillColors = ["#349a59", "#349a59", "#349a59", "#349a59"];

    // 四个滑块的值（CSS像素）: 边内容差、边外容差、角内容差、角外容差
    this.值_内 = 5;
    this.值_外 = 5;
    this.值_角内 = 5;
    this.值_角外 = 5;

    // 状态
    this.拖拽中 = false;
    this.拖拽偏移 = { x: 0, y: 0 };
    this.悬停边 = -1; // 0 top,1 right,2 bottom,3 left
    this.悬停角 = -1; // 0 tl,1 tr,2 br,3 bl
    this.显示热区 = false;
    this.鼠标在矩形内 = false;
    this.悬停复选框 = false;
    this.悬停滑块 = null;
    this.滑块拖拽偏移 = 0;
    this.复选框标题 = "显示热区";
    this.复选框字体 = "14px 'Noto Sans SC', 微软雅黑, sans-serif";

    // 滑块布局（CSS像素）
    this.sliderArea = {
      padding: 12,
      width: Math.min(260, this.cssWidth * 0.4),
      height: 250,
      gap: 10,
    };
    this.sliderArea.x = 12;
    this.sliderArea.y = this.cssHeight - this.sliderArea.height - 12;

    // 控件交互
    this.activeSlider = null; // '内'|'外'|'角内'|'角外'

    // 用于避免在mousemove里频繁调用getBoundingClientRect
    this.边界矩形 = this.cvs.getBoundingClientRect();
  }

  安装事件() {
    // 使用 Pointer 事件统一鼠标和触摸
    this.cvs.style.touchAction = "none";
    this._pointerMove = this._pointerMove.bind(this);
    this._pointerDown = this._pointerDown.bind(this);
    this._pointerUp = this._pointerUp.bind(this);
    this._resize = this._resize.bind(this);
    this._pointerEnter = this._pointerEnter.bind(this);

    this.cvs.addEventListener("pointerdown", this._pointerDown);
    this.cvs.addEventListener("pointerenter", this._pointerEnter);
    window.addEventListener("pointermove", this._pointerMove);
    window.addEventListener("pointerup", this._pointerUp);
    window.addEventListener("resize", this._resize);

    if (typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(() => this._updateBoundingRectDebounced());
      this._resizeObserver.observe(this.cvs);
    }
  }

  _resize() {
    // 重新初始化画布尺寸与相关布局
    this.cssWidth = this.cvs.clientWidth;
    this.cssHeight = this.cvs.clientHeight;
    this.width = this.cssWidth * this.dpr;
    this.height = this.cssHeight * this.dpr;
    this.cvs.width = this.width;
    this.cvs.height = this.height;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    // 把滑块区域重新放到左下角
    this.sliderArea.width = Math.min(260, this.cssWidth * 0.4);
    this.sliderArea.y = this.cssHeight - this.sliderArea.height - 12;
    this._updateBoundingRectDebounced();
    this.绘制();
  }

  _pointerEnter() {
    this._updateBoundingRectDebounced();
  }

  _updateBoundingRectDebounced() {
    if (this._rectTimer) clearTimeout(this._rectTimer);
    this._rectTimer = setTimeout(() => {
      this.更新边界矩形();
      this._rectTimer = null;
    }, 50);
  }

  // 将客户端坐标转换为 canvas CSS 像素坐标（避免在mousemove里调用getBoundingClientRect）
  客户到画布(clientX, clientY) {
    const r = this.边界矩形;
    const x = clientX - r.left;
    const y = clientY - r.top;
    return { x, y };
  }

  _pointerDown(e) {
    this._updateBoundingRectDebounced();
    const p = this.客户到画布(e.clientX, e.clientY);
    // 先检查滑块区域与复选框
    if (this._pointInCheckbox(p)) {
      this.显示热区 = !this.显示热区;
      this.绘制();
      return;
    }
    const s = this._hitTestSlider(p);
    if (s) {
      this.activeSlider = s.name;
      this.悬停滑块 = s.name;
      this.滑块拖拽偏移 = s.inThumb ? s.offsetX : 0;
      if (!s.inThumb) this._updateSliderValueFromPoint(s.name, p, this.滑块拖拽偏移);
      this.绘制();
      return;
    }

    // 角点热区优先级最高，其次边热区，只有不在热区时才允许拖拽矩形
    const inCorner = this._hitTestCorner(p) >= 0;
    const inEdge = !inCorner && this._hitTestEdge(p) >= 0;
    if (!inCorner && !inEdge && this._pointInRect(p, this.rect)) {
      this.拖拽中 = true;
      this.拖拽偏移.x = p.x - this.rect.x;
      this.拖拽偏移.y = p.y - this.rect.y;
      return;
    }
  }

  _pointerUp() {
    this.拖拽中 = false;
    this.activeSlider = null;
    this.滑块拖拽偏移 = 0;
  }

  _pointerMove(e) {
    const p = this.客户到画布(e.clientX, e.clientY);
    let needRedraw = false;
    const prevInRect = this.鼠标在矩形内;
    const prevHoverCheckbox = this.悬停复选框;
    const prevHoverSlider = this.悬停滑块;
    const controlHit = !this.拖拽中 && !this.activeSlider ? this._hitTestSlider(p) : null;

    if (this.拖拽中) {
      // 拖拽矩形，保持相对偏移
      this.rect.x = p.x - this.拖拽偏移.x;
      this.rect.y = p.y - this.拖拽偏移.y;
      // 限制在画布内
      this.rect.x = Math.max(0, Math.min(this.rect.x, this.cssWidth - this.rect.w));
      this.rect.y = Math.max(0, Math.min(this.rect.y, this.cssHeight - this.rect.h));
      needRedraw = true;
    } else if (this.activeSlider) {
      this._updateSliderValueFromPoint(this.activeSlider, p, this.滑块拖拽偏移);
      needRedraw = true;
    } else if (controlHit) {
      // 鼠标位于控件区域时，不检测矩形热区
      this.悬停角 = -1;
      this.悬停边 = -1;
      this.鼠标在矩形内 = false;
      this.悬停滑块 = controlHit === "checkbox" ? null : controlHit.name;
      this.悬停复选框 = controlHit === "checkbox";
    } else {
      // 更新悬停状态（角优先）
      const prev角 = this.悬停角;
      const prev边 = this.悬停边;
      const hit角 = this._hitTestCorner(p);
      if (hit角 >= 0) {
        this.悬停角 = hit角;
        this.悬停边 = -1;
      } else {
        this.悬停角 = -1;
        const hit边 = this._hitTestEdge(p);
        this.悬停边 = hit边;
      }
      this.鼠标在矩形内 = this.悬停角 < 0 && this.悬停边 < 0 && this._pointInRect(p, this.rect);
      if (prev角 !== this.悬停角 || prev边 !== this.悬停边) needRedraw = true;
    }

    if (!this.拖拽中 && !this.activeSlider) {
      if (!controlHit) {
        this.悬停滑块 = null;
        this.悬停复选框 = this._pointInCheckbox(p);
      }
    } else {
      this.悬停复选框 = false;
      if (this.activeSlider) this.悬停滑块 = this.activeSlider;
    }

    if (prevHoverCheckbox !== this.悬停复选框 || prevHoverSlider !== this.悬停滑块) needRedraw = true;

    if (prevInRect !== this.鼠标在矩形内) needRedraw = true;
    if (needRedraw) this.绘制();
  }

  // 画布主要绘制入口
  绘制() {
    const ctx = this.ctx;
    // 清空并绘制深色背景
    ctx.save();
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);

    // 绘制矩形的容器填充
    ctx.fillStyle = this.鼠标在矩形内 ? this.fillHoverColor : this.fillColor;
    ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);

    // 根据悬停状态，绘制边或角高亮或普通样式
    // 四边
    const edges = [
      { x1: this.rect.x, y1: this.rect.y, x2: this.rect.x + this.rect.w, y2: this.rect.y }, // top
      { x1: this.rect.x + this.rect.w, y1: this.rect.y, x2: this.rect.x + this.rect.w, y2: this.rect.y + this.rect.h }, // right
      { x1: this.rect.x + this.rect.w, y1: this.rect.y + this.rect.h, x2: this.rect.x, y2: this.rect.y + this.rect.h }, // bottom
      { x1: this.rect.x, y1: this.rect.y + this.rect.h, x2: this.rect.x, y2: this.rect.y }, // left
    ];

    // 绘制每条边
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.lineWidth = this.悬停边 === i && this.悬停角 === -1 ? 2 : 1;
      ctx.strokeStyle = this.悬停边 === i && this.悬停角 === -1 ? this.highlightColor : this.edgeColor;
      ctx.moveTo(edges[i].x1, edges[i].y1);
      ctx.lineTo(edges[i].x2, edges[i].y2);
      ctx.stroke();
    }

    // 四个角点
    const corners = [
      { x: this.rect.x, y: this.rect.y }, // tl
      { x: this.rect.x + this.rect.w, y: this.rect.y }, // tr
      { x: this.rect.x + this.rect.w, y: this.rect.y + this.rect.h }, // br
      { x: this.rect.x, y: this.rect.y + this.rect.h }, // bl
    ];
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const r = this.悬停角 === i ? 5 : 4;
      ctx.fillStyle = this.悬停角 === i ? this.highlightColor : this.cornerColor;
      ctx.arc(corners[i].x, corners[i].y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 鼠标在容差范围内时绘制虚线容差区域（边容差内外合一为一个矩形）
    if (this.显示热区 && (this.悬停边 >= 0 || this.悬停角 >= 0)) {
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = this.toleranceStroke;
      ctx.fillStyle = this.toleranceFill;

      if (this.悬停边 >= 0) {
        this._绘制边容差(this.悬停边, true);
      }
      if (this.悬停角 >= 0) {
        this._绘制角容差(this.悬停角, true);
      }
      ctx.restore();
    }

    // 最后绘制滑块和复选框
    this._绘制控件();

    ctx.restore();
  }

  _绘制边容差(edgeIndex, needFill) {
    const ctx = this.ctx;
    this.ctx.fillStyle = "#f6a3";
    // 合并内外容差为一个连续区域
    const 内 = this.值_内;
    const 外 = this.值_外;
    if (edgeIndex === 0) {
      // top
      const top = this.rect.y - 外;
      const bottom = this.rect.y + 内;
      ctx.beginPath();
      ctx.rect(this.rect.x, top, this.rect.w, bottom - top);
      if (needFill) ctx.fill();
      ctx.stroke();
    } else if (edgeIndex === 2) {
      // bottom
      const top = this.rect.y + this.rect.h - 内;
      const bottom = this.rect.y + this.rect.h + 外;
      ctx.beginPath();
      ctx.rect(this.rect.x, top, this.rect.w, bottom - top);
      if (needFill) ctx.fill();
      ctx.stroke();
    } else if (edgeIndex === 3) {
      // left
      const left = this.rect.x - 外;
      const right = this.rect.x + 内;
      ctx.beginPath();
      ctx.rect(left, this.rect.y, right - left, this.rect.h);
      if (needFill) ctx.fill();
      ctx.stroke();
    } else if (edgeIndex === 1) {
      // right
      const left = this.rect.x + this.rect.w - 内;
      const right = this.rect.x + this.rect.w + 外;
      ctx.beginPath();
      ctx.rect(left, this.rect.y, right - left, this.rect.h);
      if (needFill) ctx.fill();
      ctx.stroke();
    }
  }

  _绘制角容差(cornerIndex, needFill) {
    const ctx = this.ctx;
    this.ctx.fillStyle = "#f6a3";
    const 角内 = this.值_角内;
    const 角外 = this.值_角外;
    const c = cornerIndex;
    const cx = c === 0 || c === 3 ? this.rect.x : this.rect.x + this.rect.w;
    const cy = c === 0 || c === 1 ? this.rect.y : this.rect.y + this.rect.h;
    // 角热区：角内朝向矩形中心，角外朝向外部
    let left, top, w, h;
    if (c === 0) {
      left = cx - 角外;
      top = cy - 角外;
      w = 角内 + 角外;
      h = 角内 + 角外;
    } else if (c === 1) {
      left = cx - 角内;
      top = cy - 角外;
      w = 角内 + 角外;
      h = 角内 + 角外;
    } else if (c === 2) {
      left = cx - 角内;
      top = cy - 角内;
      w = 角内 + 角外;
      h = 角内 + 角外;
    } else {
      left = cx - 角外;
      top = cy - 角内;
      w = 角内 + 角外;
      h = 角内 + 角外;
    }
    ctx.beginPath();
    ctx.rect(left, top, w, h);
    if (needFill) ctx.fill();
    ctx.stroke();
  }

  _绘制控件() {
    const ctx = this.ctx;
    const s = this.sliderArea;
    const x = s.x;
    const y = s.y;
    const w = s.width;
    const h = s.height;

    // 绘制半透明背景面板
    ctx.save();
    ctx.fillStyle = "rgba(10,15,20,0.6)";
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    roundRect(ctx, x, y, w, h, 8, true, true);

    // 复选框（现代风格，支持悬停态）
    const cbX = x + 12;
    const cbY = y + 10;
    const cbSize = 18;
    const cbHover = this.悬停复选框;
    ctx.save();
    ctx.fillStyle = this.显示热区 ? "#2d854d" : cbHover ? "#1a243a" : "#0b1220";
    ctx.strokeStyle = this.显示热区 ? (cbHover ? "lightgreen" : "#2d854d") : cbHover ? "#64748b" : "#334155";
    ctx.lineWidth = 1.5;
    roundRect(ctx, cbX, cbY, cbSize, cbSize, 2, true, true);
    if (this.显示热区) {
      // ctx.strokeStyle = "#0b1220";
      ctx.strokeStyle = "#def";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cbX + 4, cbY + 9);
      ctx.lineTo(cbX + 8, cbY + 13);
      ctx.lineTo(cbX + 14, cbY + 5);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = "#e2e8f0";
    ctx.font = this.复选框字体;
    ctx.textBaseline = "top";
    ctx.fillText(this.复选框标题, cbX + cbSize + 8, cbY + 3);

    // 四个滑块纵向排列
    const sliderNames = ["边内容差", "边外容差", "角内容差", "角外容差"];
    const sliderValues = [this.值_内, this.值_外, this.值_角内, this.值_角外];
    const lineHeight = this._getSliderLineHeight();
    const startY = this._getSliderStartY(cbY, cbSize);
    for (let i = 0; i < 4; i++) {
      const layout = this._getSliderLayout(i, startY, lineHeight, w);
      const sy = layout.labelY;
      const isHover = this.悬停滑块 === this._indexToSliderName(i);
      const sliderColor = isHover ? this._getSliderHoverColor(i) : this.sliderFillColors[i];
      // 标题
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "14px 'Noto Sans SC', 微软雅黑, sans-serif";
      ctx.fillText(sliderNames[i], x + 12, sy);

      // 滑块轨道（左边）
      const trackX = layout.trackX;
      const trackY = layout.trackY;
      const trackW = layout.trackW;
      const trackH = layout.trackH;
      // 背景轨道
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      roundRect(ctx, trackX, trackY, trackW, trackH, 0, true, false);

      // 把值映射到滑块上（0-100）
      const tpos = layout.thumbX;
      // 进度填充
      ctx.fillStyle = sliderColor;
      roundRect(ctx, trackX, trackY, tpos - trackX, trackH, 0, true, false);
      // 拖动圆点
      ctx.beginPath();
      ctx.fillStyle = sliderColor;
      ctx.arc(tpos, trackY + trackH / 2, layout.thumbR, 0, Math.PI * 2);
      ctx.fill();

      // 数值（右侧）
      ctx.fillStyle = "#80aae0";
      ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "left";
      ctx.fillText(Math.round(sliderValues[i]), trackX + trackW + 10, trackY - 3);
      ctx.textAlign = "left";
    }

    ctx.restore();
  }

  _pointInRect(p, r) {
    return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  }

  _hitTestEdge(p) {
    // 检查四边（合并内外）
    const 内 = this.值_内;
    const 外 = this.值_外;
    // top
    if (p.x >= this.rect.x && p.x <= this.rect.x + this.rect.w && p.y >= this.rect.y - 外 && p.y <= this.rect.y + 内)
      return 0;
    // right
    if (
      p.y >= this.rect.y &&
      p.y <= this.rect.y + this.rect.h &&
      p.x >= this.rect.x + this.rect.w - 内 &&
      p.x <= this.rect.x + this.rect.w + 外
    )
      return 1;
    // bottom
    if (
      p.x >= this.rect.x &&
      p.x <= this.rect.x + this.rect.w &&
      p.y >= this.rect.y + this.rect.h - 内 &&
      p.y <= this.rect.y + this.rect.h + 外
    )
      return 2;
    // left
    if (p.y >= this.rect.y && p.y <= this.rect.y + this.rect.h && p.x >= this.rect.x - 外 && p.x <= this.rect.x + 内)
      return 3;
    return -1;
  }

  _hitTestCorner(p) {
    const 角内 = this.值_角内;
    const 角外 = this.值_角外;
    const tl = { x: this.rect.x, y: this.rect.y };
    const tr = { x: this.rect.x + this.rect.w, y: this.rect.y };
    const br = { x: this.rect.x + this.rect.w, y: this.rect.y + this.rect.h };
    const bl = { x: this.rect.x, y: this.rect.y + this.rect.h };
    // 角0(tl): 内=右+下, 外=左+上 → x∈[cx-角外,cx+角内], y∈[cy-角外,cy+角内]
    if (p.x >= tl.x - 角外 && p.x <= tl.x + 角内 && p.y >= tl.y - 角外 && p.y <= tl.y + 角内) return 0;
    // 角1(tr): 内=左+下, 外=右+上
    if (p.x >= tr.x - 角内 && p.x <= tr.x + 角外 && p.y >= tr.y - 角外 && p.y <= tr.y + 角内) return 1;
    // 角2(br): 内=左+上, 外=右+下
    if (p.x >= br.x - 角内 && p.x <= br.x + 角外 && p.y >= br.y - 角内 && p.y <= br.y + 角外) return 2;
    // 角3(bl): 内=右+上, 外=左+下
    if (p.x >= bl.x - 角外 && p.x <= bl.x + 角内 && p.y >= bl.y - 角内 && p.y <= bl.y + 角外) return 3;
    return -1;
  }

  _hitTestSlider(p) {
    const s = this.sliderArea;
    const x = s.x;
    const y = s.y;
    const w = s.width;
    if (this._pointInCheckbox(p)) return "checkbox";
    const startY = this._getSliderStartY(y + 10, 18);
    const lineHeight = this._getSliderLineHeight();
    for (let i = 0; i < 4; i++) {
      const layout = this._getSliderLayout(i, startY, lineHeight, w);
      const inTrack =
        p.x >= layout.trackX - 10 &&
        p.x <= layout.trackX + layout.trackW + 10 &&
        p.y >= layout.trackY - 12 &&
        p.y <= layout.trackY + layout.trackH + 12;
      const inThumb = Math.hypot(p.x - layout.thumbX, p.y - layout.thumbY) <= layout.thumbR + 2;
      if (inTrack || inThumb) {
        const name = this._indexToSliderName(i);
        return {
          name,
          inThumb,
          offsetX: p.x - layout.thumbX,
        };
      }
    }
    return null;
  }

  _updateSliderValueFromPoint(name, p, offsetX = 0) {
    const s = this.sliderArea;
    const w = s.width;
    const startY = this._getSliderStartY(s.y + 10, 18);
    const lineHeight = this._getSliderLineHeight();
    const index = this._sliderNameToIndex(name);
    const layout = this._getSliderLayout(index, startY, lineHeight, w);
    const desiredX = p.x - offsetX;
    const minX = layout.trackX + layout.thumbR;
    const maxX = layout.trackX + layout.trackW - layout.thumbR;
    const clampedX = Math.max(minX, Math.min(maxX, desiredX));
    const usableW = Math.max(1, layout.trackW - layout.thumbR * 2);
    const value = ((clampedX - minX) / usableW) * 100;
    if (name === "内") this.值_内 = Math.round(value);
    else if (name === "外") this.值_外 = Math.round(value);
    else if (name === "角内") this.值_角内 = Math.round(value);
    else if (name === "角外") this.值_角外 = Math.round(value);
  }

  _getSliderLayout(index, startY, lineHeight, panelWidth) {
    const x = this.sliderArea.x;
    const sy = startY + index * lineHeight;
    const trackX = x + 12;
    const trackY = sy + 12 + 10;
    const trackW = panelWidth - 60;
    const trackH = 5;
    const val = Math.max(0, Math.min(100, this._getSliderValueByIndex(index)));
    const thumbR = 8;
    const thumbX = trackX + thumbR + (val / 100) * Math.max(0, trackW - thumbR * 2);
    const thumbY = trackY + trackH / 2;
    return {
      labelY: sy,
      trackX,
      trackY,
      trackW,
      trackH,
      thumbX,
      thumbY,
      thumbR,
    };
  }

  _indexToSliderName(i) {
    return i === 0 ? "内" : i === 1 ? "外" : i === 2 ? "角内" : "角外";
  }

  _sliderNameToIndex(name) {
    return name === "内" ? 0 : name === "外" ? 1 : name === "角内" ? 2 : 3;
  }

  _getSliderValueByIndex(index) {
    return index === 0 ? this.值_内 : index === 1 ? this.值_外 : index === 2 ? this.值_角内 : this.值_角外;
  }

  _getSliderHoverColor(index) {
    const base = this.sliderFillColors[index];
    return base === "#349a59" ? "#57c477" : "#7bd59b";
  }

  _getSliderStartY(cbY, cbSize) {
    return cbY + cbSize + 24;
  }

  _getSliderLineHeight() {
    return 50;
  }

  _pointInCheckbox(p) {
    const s = this.sliderArea;
    const cbX = s.x + 12;
    const cbY = s.y + 10;
    const cbSize = 18;
    const padding = 8;
    const labelX = cbX + cbSize + 8;
    const labelY = cbY + 3;
    this.ctx.save();
    this.ctx.font = this.复选框字体;
    const labelWidth = this.ctx.measureText(this.复选框标题).width;
    this.ctx.restore();
    const rectX = cbX;
    const rectY = cbY;
    const rectW = labelX - cbX + labelWidth + padding;
    const rectH = Math.max(cbSize, 16);
    return p.x >= rectX && p.x <= rectX + rectW && p.y >= rectY && p.y <= rectY + rectH;
  }

  // 外部调用以更新边界矩形（由 IntersectionObserver 在防抖后调用）
  更新边界矩形() {
    this.边界矩形 = this.cvs.getBoundingClientRect();
  }
}

// 辅助：画圆角矩形
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof r === "undefined") r = 5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, [r]);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// 实例化
const 热区实例 = new 热区();

class 缩放 {
  constructor(画布元素) {
    this.默认配置 = {
      角柄半径: 5,
      最小宽度: 10,
      最小高度: 10,
      初始矩形: { x: 225, y: 200, width: 350, height: 225 },
    };
    this.锚点坐标表 = {
      西北: (矩形) => ({ x: 矩形.x + 矩形.width, y: 矩形.y + 矩形.height }),
      北: (矩形) => ({ x: 矩形.x + 矩形.width / 2, y: 矩形.y + 矩形.height }),
      东北: (矩形) => ({ x: 矩形.x, y: 矩形.y + 矩形.height }),
      东: (矩形) => ({ x: 矩形.x, y: 矩形.y + 矩形.height / 2 }),
      东南: (矩形) => ({ x: 矩形.x, y: 矩形.y }),
      南: (矩形) => ({ x: 矩形.x + 矩形.width / 2, y: 矩形.y }),
      西南: (矩形) => ({ x: 矩形.x + 矩形.width, y: 矩形.y }),
      西: (矩形) => ({ x: 矩形.x + 矩形.width, y: 矩形.y + 矩形.height / 2 }),
    };
    this.画布 = typeof 画布元素 === "string" ? document.querySelector(画布元素) : 画布元素;
    if (!this.画布 || this.画布.tagName !== "CANVAS") {
      throw new Error("请传入有效的 canvas 元素或选择器");
    }
    this.上下文 = this.画布.getContext("2d");

    const 默认 = this.默认配置;
    this.角柄半径 = 默认.角柄半径;
    this.最小宽度 = 默认.最小宽度;
    this.最小高度 = 默认.最小高度;
    this.矩形 = { ...默认.初始矩形 };

    this.设备像素比 = window.devicePixelRatio || 1;
    this.拖拽偏移X = 0;
    this.拖拽偏移Y = 0;
    this.缩放偏移X = 0;
    this.缩放偏移Y = 0;
    this.当前操作 = null;
    this.当前悬停 = null;
    this.按下命中热区 = null;

    this.正常角点色 = "rgba(74, 158, 255)";
    this.命中角点色 = "rgba(255, 160, 60)";
    this.边线视觉宽度 = 1;
    this.锚点色 = "rgba(200, 80, 80)";
    this.锚点半径 = 6;

    this.绑定事件 = this.绑定事件.bind(this);
    this.鼠标按下 = this.鼠标按下.bind(this);
    this.鼠标移动 = this.鼠标移动.bind(this);
    this.鼠标抬起 = this.鼠标抬起.bind(this);
    this.鼠标离开 = this.鼠标离开.bind(this);

    this.绑定事件();
    this.设置画布尺寸();
    window.addEventListener("resize", () => this.设置画布尺寸());
  }

  绑定事件() {
    window.addEventListener("resize", this.更新边界矩形.bind(this));
    this.画布.addEventListener("mousedown", this.鼠标按下);
    this.画布.addEventListener("mousemove", this.鼠标移动);
    this.画布.addEventListener("mouseup", this.鼠标抬起);
    this.画布.addEventListener("mouseleave", this.鼠标离开);
  }

  设置画布尺寸() {
    this.更新边界矩形();
    this.画布.width = this.画布.clientWidth * this.设备像素比;
    this.画布.height = this.画布.clientHeight * this.设备像素比;
    this.上下文.scale(this.设备像素比, this.设备像素比);
    this.绘制();
  }

  获取画布坐标(事件) {
    return {
      x: 事件.clientX - this.边界矩形.left,
      y: 事件.clientY - this.边界矩形.top,
    };
  }

  更新边界矩形() {
    this.边界矩形 = this.画布.getBoundingClientRect();
  }

  获取命中拖拽热区(鼠标X, 鼠标Y) {
    const { x, y, width, height } = this.矩形;
    const 容差 = 5;
    const 左 = x;
    const 右 = x + width;
    const 上 = y;
    const 下 = y + height;

    const 在左 = 鼠标X >= 左 - 容差 && 鼠标X <= 左 + 容差;
    const 在右 = 鼠标X >= 右 - 容差 && 鼠标X <= 右 + 容差;
    const 在上 = 鼠标Y >= 上 - 容差 && 鼠标Y <= 上 + 容差;
    const 在下 = 鼠标Y >= 下 - 容差 && 鼠标Y <= 下 + 容差;

    let 范围X小 = Math.min(左, 右) - 容差;
    let 范围X大 = Math.max(左, 右) + 容差;
    if (范围X大 - 范围X小 < 2 * 容差) {
      const 中心X = (左 + 右) / 2;
      范围X小 = 中心X - 容差;
      范围X大 = 中心X + 容差;
    }
    const 在X扩展 = 鼠标X >= 范围X小 && 鼠标X <= 范围X大;

    let 范围Y小 = Math.min(上, 下) - 容差;
    let 范围Y大 = Math.max(上, 下) + 容差;
    if (范围Y大 - 范围Y小 < 2 * 容差) {
      const 中心Y = (上 + 下) / 2;
      范围Y小 = 中心Y - 容差;
      范围Y大 = 中心Y + 容差;
    }
    const 在Y扩展 = 鼠标Y >= 范围Y小 && 鼠标Y <= 范围Y大;

    if (在左 && 在上) return "西北";
    if (在右 && 在上) return "东北";
    if (在右 && 在下) return "东南";
    if (在左 && 在下) return "西南";
    if (在上 && 在X扩展) return "北";
    if (在右 && 在Y扩展) return "东";
    if (在下 && 在X扩展) return "南";
    if (在左 && 在Y扩展) return "西";
    if (
      鼠标X >= Math.min(左, 右) &&
      鼠标X <= Math.max(左, 右) &&
      鼠标Y >= Math.min(上, 下) &&
      鼠标Y <= Math.max(上, 下)
    )
      return "本体";
    return null;
  }

  绘制() {
    this.上下文.clearRect(0, 0, this.画布.width, this.画布.height);
    const { x, y, width, height } = this.矩形;
    const 边宽 = this.边线视觉宽度;
    const 悬停 = this.当前悬停;

    this.上下文.fillStyle = this.当前悬停 === "本体" ? "rgba(80, 160, 255, 0.25)" : "rgba(80, 160, 255, 0.15)";
    this.上下文.fillRect(x, y, width, height);

    // 用 fillRect 画边，避免 strokeRect 在 1px 细条上产生双线（视觉变粗）；悬停时描边为 2
    const 边列表 = [
      { 方向: "北", x: x, y: y, w: width, h: 边宽 },
      { 方向: "南", x: x, y: y + height - 边宽, w: width, h: 边宽 },
      { 方向: "东", x: x + width - 边宽, y: y, w: 边宽, h: height },
      { 方向: "西", x: x, y: y, w: 边宽, h: height },
    ];
    边列表.forEach(({ 方向, x: 边X, y: 边Y, w: 边W, h: 边H }) => {
      const 当前边宽 = 悬停 === 方向 ? 2 : 边宽;
      let drawX = 边X,
        drawY = 边Y,
        drawW = 边W,
        drawH = 边H;
      if (方向 === "北") drawH = 当前边宽;
      else if (方向 === "南") {
        drawY = y + height - 当前边宽;
        drawH = 当前边宽;
      } else if (方向 === "东") {
        drawX = x + width - 当前边宽;
        drawW = 当前边宽;
      } else if (方向 === "西") drawW = 当前边宽;
      this.上下文.fillStyle = 悬停 === 方向 ? this.命中角点色 : this.正常角点色;
      this.上下文.fillRect(drawX, drawY, drawW, drawH);
    });

    const 角点列表 = [
      ["西北", x, y],
      ["东北", x + width, y],
      ["东南", x + width, y + height],
      ["西南", x, y + height],
    ];
    角点列表.forEach(([方向, 角X, 角Y]) => {
      this.上下文.fillStyle = 悬停 === 方向 ? this.命中角点色 : this.正常角点色;
      this.上下文.beginPath();
      this.上下文.arc(角X, 角Y, this.角柄半径, 0, Math.PI * 2);
      this.上下文.fill();
    });

    /* const 操作 = this.当前操作;
    if (操作 && 操作 !== "移动") {
      const 锚 = this.取锚点坐标();
      if (锚) {
        this.上下文.fillStyle = this.锚点色;
        this.上下文.strokeStyle = "#fff";
        this.上下文.lineWidth = 1.5;
        this.上下文.beginPath();
        this.上下文.arc(锚.x, 锚.y, this.锚点半径, 0, Math.PI * 2);
        this.上下文.fill();
        this.上下文.stroke();
      }
    } */

    // 左下方提示文案，左右边距各 2，"角"与"边"单独颜色
    const 边距 = 10;
    const 文案默认色 = "#94a3b8";
    const 角边字色 = "#4a9eff";
    this.上下文.font = "16px 'Noto Sans SC', 微软雅黑, sans-serif";
    this.上下文.textBaseline = "bottom";
    this.上下文.textAlign = "left";
    const 文案Y = this.画布.clientHeight - 边距;
    const 片段列表 = [
      { 文本: "拖拽矩形的", 色: 文案默认色 },
      { 文本: "角", 色: 角边字色 },
      { 文本: "或", 色: 文案默认色 },
      { 文本: "边", 色: 角边字色 },
      { 文本: "进行缩放", 色: 文案默认色 },
    ];
    let 文案X = 边距;
    for (const { 文本, 色 } of 片段列表) {
      this.上下文.fillStyle = 色;
      this.上下文.fillText(文本, 文案X, 文案Y);
      文案X += this.上下文.measureText(文本).width;
    }

    // 右下角两行：mousemove/mousedown（事件名色）+ 命中热区（标签色）+ 冒号 + 值
    const 标签色 = "#94a3b8";
    const 事件名色 = "#4a9eff";
    const 冒号色 = "gray";
    const 值色 = "lightseagreen";
    this.上下文.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    this.上下文.textBaseline = "bottom";
    const 右下边距 = 10;
    const 行高 = 18;
    const 值区宽度 = 40;
    const 右X = this.画布.clientWidth - 右下边距;
    let 行Y = this.画布.clientHeight - 右下边距;
    const 移动值 = this.当前悬停 != null ? this.当前悬停 : "null";
    const 按下值 = this.按下命中热区 != null ? this.按下命中热区 : "null";
    const 冒号宽 = this.上下文.measureText("：").width;
    const 值区左 = 右X - 值区宽度;
    const 冒号右 = 值区左;
    const 标签右 = 冒号右 - 冒号宽;
    const 命中热区宽 = this.上下文.measureText("命中热区").width;
    this.上下文.textAlign = "right";
    this.上下文.fillStyle = 事件名色;
    this.上下文.fillText("mousemove", 标签右 - 命中热区宽 - 4, 行Y);
    this.上下文.fillStyle = 标签色;
    this.上下文.fillText("命中热区", 标签右, 行Y);
    this.上下文.fillStyle = 冒号色;
    this.上下文.fillText("：", 冒号右, 行Y);
    this.上下文.textAlign = "left";
    this.上下文.fillStyle = 值色;
    this.上下文.fillText(移动值, 值区左, 行Y);
    行Y -= 行高;
    this.上下文.textAlign = "right";
    this.上下文.fillStyle = 事件名色;
    this.上下文.fillText("mousedown", 标签右 - 命中热区宽 - 4, 行Y);
    this.上下文.fillStyle = 标签色;
    this.上下文.fillText("命中热区", 标签右, 行Y);
    this.上下文.fillStyle = 冒号色;
    this.上下文.fillText("：", 冒号右, 行Y);
    this.上下文.textAlign = "left";
    this.上下文.fillStyle = 值色;
    this.上下文.fillText(按下值, 值区左, 行Y);
  }

  取锚点坐标() {
    const 操作 = this.当前操作;
    if (!操作 || 操作 === "移动") return null;
    const 匹配 = this.锚点坐标表[操作];
    return 匹配 ? 匹配(this.矩形) : null;
  }

  鼠标按下(事件) {
    const { x: 鼠标X, y: 鼠标Y } = this.获取画布坐标(事件);
    const 拖拽热区 = this.获取命中拖拽热区(鼠标X, 鼠标Y);
    this.按下命中热区 = 拖拽热区;
    if (!拖拽热区) return;

    if (拖拽热区 === "本体") {
      this.当前操作 = "移动";
      this.拖拽偏移X = 鼠标X - this.矩形.x;
      this.拖拽偏移Y = 鼠标Y - this.矩形.y;
      this.绘制();
    } else {
      this.当前操作 = 拖拽热区;
      const { x, y, width, height } = this.矩形;
      switch (拖拽热区) {
        case "西北":
          this.缩放偏移X = x - 鼠标X;
          this.缩放偏移Y = y - 鼠标Y;
          break;
        case "北":
          this.缩放偏移X = 0;
          this.缩放偏移Y = y - 鼠标Y;
          break;
        case "东北":
          this.缩放偏移X = x + width - 鼠标X;
          this.缩放偏移Y = y - 鼠标Y;
          break;
        case "东":
          this.缩放偏移X = x + width - 鼠标X;
          this.缩放偏移Y = 0;
          break;
        case "东南":
          this.缩放偏移X = x + width - 鼠标X;
          this.缩放偏移Y = y + height - 鼠标Y;
          break;
        case "南":
          this.缩放偏移X = 0;
          this.缩放偏移Y = y + height - 鼠标Y;
          break;
        case "西南":
          this.缩放偏移X = x - 鼠标X;
          this.缩放偏移Y = y + height - 鼠标Y;
          break;
        case "西":
          this.缩放偏移X = x - 鼠标X;
          this.缩放偏移Y = 0;
          break;
      }
      this.绘制();
    }
  }

  应用缩放(鼠标X, 鼠标Y) {
    const 有效X = 鼠标X + this.缩放偏移X;
    const 有效Y = 鼠标Y + this.缩放偏移Y;
    const { x, y, width, height } = this.矩形;

    switch (this.当前操作) {
      case "西北": {
        this.矩形.width = Math.max(this.最小宽度, x + width - 有效X);
        this.矩形.height = Math.max(this.最小高度, y + height - 有效Y);
        this.矩形.x = x + width - this.矩形.width;
        this.矩形.y = y + height - this.矩形.height;
        break;
      }
      case "北": {
        this.矩形.height = Math.max(this.最小高度, y + height - 有效Y);
        this.矩形.y = y + height - this.矩形.height;
        break;
      }
      case "东北": {
        this.矩形.width = Math.max(this.最小宽度, 有效X - x);
        this.矩形.height = Math.max(this.最小高度, y + height - 有效Y);
        this.矩形.y = y + height - this.矩形.height;
        break;
      }
      case "东": {
        this.矩形.width = Math.max(this.最小宽度, 有效X - x);
        break;
      }
      case "东南": {
        this.矩形.width = Math.max(this.最小宽度, 有效X - x);
        this.矩形.height = Math.max(this.最小高度, 有效Y - y);
        break;
      }
      case "南": {
        this.矩形.height = Math.max(this.最小高度, 有效Y - y);
        break;
      }
      case "西南": {
        this.矩形.width = Math.max(this.最小宽度, x + width - 有效X);
        this.矩形.height = Math.max(this.最小高度, 有效Y - y);
        this.矩形.x = x + width - this.矩形.width;
        break;
      }
      case "西": {
        this.矩形.width = Math.max(this.最小宽度, x + width - 有效X);
        this.矩形.x = x + width - this.矩形.width;
        break;
      }
    }
  }

  鼠标移动(事件) {
    const { x: 鼠标X, y: 鼠标Y } = this.获取画布坐标(事件);

    if (this.当前操作 === "移动") {
      this.矩形.x = 鼠标X - this.拖拽偏移X;
      this.矩形.y = 鼠标Y - this.拖拽偏移Y;
      this.绘制();
      return;
    }

    if (this.当前操作) {
      this.应用缩放(鼠标X, 鼠标Y);
      this.绘制();
      return;
    }

    const 命中 = this.获取命中拖拽热区(鼠标X, 鼠标Y);
    if (命中 !== this.当前悬停) {
      this.当前悬停 = 命中;
      this.绘制();
    }
    const 光标样式 = {
      西北: "nwse-resize",
      东北: "nesw-resize",
      东南: "nwse-resize",
      西南: "nesw-resize",
      北: "ns-resize",
      南: "ns-resize",
      东: "ew-resize",
      西: "ew-resize",
      本体: 光标.拖拽,
    };
    this.画布.style.cursor = 命中 && 光标样式[命中] ? 光标样式[命中] : 光标.默认;
  }

  鼠标抬起() {
    this.当前操作 = null;
    this.按下命中热区 = null;
    this.绘制();
  }

  鼠标离开() {
    if (!this.当前操作) this.画布.style.cursor = 光标.默认;
    this.当前操作 = null;
    if (this.当前悬停 !== null) this.当前悬停 = null;
    this.绘制();
  }
}

const 缩放实例 = new 缩放("#cvs-缩放");

class 镜像缩放 {
  constructor(画布元素) {
    this.默认配置 = {
      角柄半径: 5,
      最小宽度: 10,
      最小高度: 10,
      初始矩形: { x: 225, y: 200, width: 350, height: 225 },
    };
    this.锚点坐标表 = {
      西北: (矩形) => ({ x: 矩形.x + 矩形.width, y: 矩形.y + 矩形.height }),
      北: (矩形) => ({ x: 矩形.x + 矩形.width / 2, y: 矩形.y + 矩形.height }),
      东北: (矩形) => ({ x: 矩形.x, y: 矩形.y + 矩形.height }),
      东: (矩形) => ({ x: 矩形.x, y: 矩形.y + 矩形.height / 2 }),
      东南: (矩形) => ({ x: 矩形.x, y: 矩形.y }),
      南: (矩形) => ({ x: 矩形.x + 矩形.width / 2, y: 矩形.y }),
      西南: (矩形) => ({ x: 矩形.x + 矩形.width, y: 矩形.y }),
      西: (矩形) => ({ x: 矩形.x + 矩形.width, y: 矩形.y + 矩形.height / 2 }),
    };
    this.画布 = typeof 画布元素 === "string" ? document.querySelector(画布元素) : 画布元素;
    if (!this.画布 || this.画布.tagName !== "CANVAS") {
      throw new Error("请传入有效的 canvas 元素或选择器");
    }
    this.上下文 = this.画布.getContext("2d");

    const 默认 = this.默认配置;
    this.角柄半径 = 默认.角柄半径;
    this.最小宽度 = 默认.最小宽度;
    this.最小高度 = 默认.最小高度;
    this.矩形 = { ...默认.初始矩形 };

    this.设备像素比 = window.devicePixelRatio || 1;
    this.拖拽偏移X = 0;
    this.拖拽偏移Y = 0;
    this.缩放偏移X = 0;
    this.缩放偏移Y = 0;
    this.当前操作 = null;
    this.当前悬停 = null;
    this.按下命中热区 = null;

    this.正常角点色 = "rgba(74, 158, 255)";
    this.命中角点色 = "rgba(255, 160, 60)";
    this.边线视觉宽度 = 1;
    this.锚点色 = "rgba(200, 80, 80)";
    this.锚点半径 = 6;

    this.标准化 = true;
    this.悬停标准化复选框 = false;
    this.复选框字体 = "14px 'Noto Sans SC', 微软雅黑, sans-serif";

    this.绑定事件 = this.绑定事件.bind(this);
    this.鼠标按下 = this.鼠标按下.bind(this);
    this.鼠标移动 = this.鼠标移动.bind(this);
    this.鼠标抬起 = this.鼠标抬起.bind(this);
    this.鼠标离开 = this.鼠标离开.bind(this);

    this.绑定事件();
    this.设置画布尺寸();
    window.addEventListener("resize", () => this.设置画布尺寸());
  }

  绑定事件() {
    window.addEventListener("resize", this.更新边界矩形.bind(this));
    this.画布.addEventListener("mousedown", this.鼠标按下);
    this.画布.addEventListener("mousemove", this.鼠标移动);
    this.画布.addEventListener("mouseup", this.鼠标抬起);
    this.画布.addEventListener("mouseleave", this.鼠标离开);
  }

  是否在标准化复选框(鼠标X, 鼠标Y) {
    const 边距 = 10;
    const 文案Y = this.画布.clientHeight - 边距;
    const cbX = 边距;
    const cbY = 文案Y - 45;
    const cbSize = 18;
    this.上下文.font = this.复选框字体;
    const 标签宽 = this.上下文.measureText("标准化").width;
    const 内边距 = 8;
    const 右 = cbX + cbSize + 8 + 标签宽 + 内边距;
    const 高 = cbSize;
    return 鼠标X >= cbX && 鼠标X <= 右 && 鼠标Y >= cbY && 鼠标Y <= cbY + 高;
  }

  设置画布尺寸() {
    this.更新边界矩形();
    this.画布.width = this.画布.clientWidth * this.设备像素比;
    this.画布.height = this.画布.clientHeight * this.设备像素比;
    this.上下文.scale(this.设备像素比, this.设备像素比);
    this.绘制();
  }

  获取画布坐标(事件) {
    return {
      x: 事件.clientX - this.边界矩形.left,
      y: 事件.clientY - this.边界矩形.top,
    };
  }

  更新边界矩形() {
    this.边界矩形 = this.画布.getBoundingClientRect();
  }

  获取命中拖拽热区(鼠标X, 鼠标Y) {
    const { x, y, width, height } = this.矩形;
    const 容差 = 5;
    const 左 = x;
    const 右 = x + width;
    const 上 = y;
    const 下 = y + height;

    const 在左 = 鼠标X >= 左 - 容差 && 鼠标X <= 左 + 容差;
    const 在右 = 鼠标X >= 右 - 容差 && 鼠标X <= 右 + 容差;
    const 在上 = 鼠标Y >= 上 - 容差 && 鼠标Y <= 上 + 容差;
    const 在下 = 鼠标Y >= 下 - 容差 && 鼠标Y <= 下 + 容差;

    let 范围X小 = Math.min(左, 右) - 容差;
    let 范围X大 = Math.max(左, 右) + 容差;
    if (范围X大 - 范围X小 < 2 * 容差) {
      const 中心X = (左 + 右) / 2;
      范围X小 = 中心X - 容差;
      范围X大 = 中心X + 容差;
    }
    const 在X扩展 = 鼠标X >= 范围X小 && 鼠标X <= 范围X大;

    let 范围Y小 = Math.min(上, 下) - 容差;
    let 范围Y大 = Math.max(上, 下) + 容差;
    if (范围Y大 - 范围Y小 < 2 * 容差) {
      const 中心Y = (上 + 下) / 2;
      范围Y小 = 中心Y - 容差;
      范围Y大 = 中心Y + 容差;
    }
    const 在Y扩展 = 鼠标Y >= 范围Y小 && 鼠标Y <= 范围Y大;

    if (在左 && 在上) return "西北";
    if (在右 && 在上) return "东北";
    if (在右 && 在下) return "东南";
    if (在左 && 在下) return "西南";
    if (在上 && 在X扩展) return "北";
    if (在右 && 在Y扩展) return "东";
    if (在下 && 在X扩展) return "南";
    if (在左 && 在Y扩展) return "西";
    if (
      鼠标X >= Math.min(左, 右) &&
      鼠标X <= Math.max(左, 右) &&
      鼠标Y >= Math.min(上, 下) &&
      鼠标Y <= Math.max(上, 下)
    )
      return "本体";
    return null;
  }

  绘制() {
    this.上下文.clearRect(0, 0, this.画布.width, this.画布.height);
    const { x, y, width, height } = this.矩形;
    const 边宽 = this.边线视觉宽度;
    const 悬停 = this.当前悬停;

    this.上下文.fillStyle = this.当前悬停 === "本体" ? "rgba(80, 160, 255, 0.25)" : "rgba(80, 160, 255, 0.15)";
    this.上下文.fillRect(x, y, width, height);

    // 用 fillRect 画边，避免 strokeRect 在 1px 细条上产生双线（视觉变粗）；悬停时描边为 2
    const 边列表 = [
      { 方向: "北", x: x, y: y, w: width, h: 边宽 },
      { 方向: "南", x: x, y: y + height - 边宽, w: width, h: 边宽 },
      { 方向: "东", x: x + width - 边宽, y: y, w: 边宽, h: height },
      { 方向: "西", x: x, y: y, w: 边宽, h: height },
    ];
    边列表.forEach(({ 方向, x: 边X, y: 边Y, w: 边W, h: 边H }) => {
      const 当前边宽 = 悬停 === 方向 ? 2 : 边宽;
      let drawX = 边X,
        drawY = 边Y,
        drawW = 边W,
        drawH = 边H;
      if (方向 === "北") drawH = 当前边宽;
      else if (方向 === "南") {
        drawY = y + height - 当前边宽;
        drawH = 当前边宽;
      } else if (方向 === "东") {
        drawX = x + width - 当前边宽;
        drawW = 当前边宽;
      } else if (方向 === "西") drawW = 当前边宽;
      this.上下文.fillStyle = 悬停 === 方向 ? this.命中角点色 : this.正常角点色;
      this.上下文.fillRect(drawX, drawY, drawW, drawH);
    });

    const 角点列表 = [
      ["西北", x, y],
      ["东北", x + width, y],
      ["东南", x + width, y + height],
      ["西南", x, y + height],
    ];
    角点列表.forEach(([方向, 角X, 角Y]) => {
      this.上下文.fillStyle = 悬停 === 方向 ? this.命中角点色 : this.正常角点色;
      this.上下文.beginPath();
      this.上下文.arc(角X, 角Y, this.角柄半径, 0, Math.PI * 2);
      this.上下文.fill();
    });

    // 四条边的外侧绘制方向标签：每条边在其几何外侧，与是否标准化一致（未标准化时镜像后方向仍正确）
    const 中点X = x + width / 2;
    const 中点Y = y + height / 2;
    const 边标签偏移 = 10;
    this.上下文.font = "14px 'Noto Sans SC', 微软雅黑, sans-serif";
    this.上下文.fillStyle = "#888";
    // 西边：竖线 x，外侧 = width>0 在左，width<0 在右
    this.上下文.textBaseline = "middle";
    if (width >= 0) {
      this.上下文.textAlign = "right";
      this.上下文.fillText("西", x - 边标签偏移, 中点Y);
    } else {
      this.上下文.textAlign = "left";
      this.上下文.fillText("西", x + 边标签偏移, 中点Y);
    }
    // 东边：竖线 x+width
    if (width >= 0) {
      this.上下文.textAlign = "left";
      this.上下文.fillText("东", x + width + 边标签偏移, 中点Y);
    } else {
      this.上下文.textAlign = "right";
      this.上下文.fillText("东", x + width - 边标签偏移, 中点Y);
    }
    // 北边：横线 y，外侧 = height>0 在上，height<0 在下
    this.上下文.textAlign = "center";
    if (height >= 0) {
      this.上下文.textBaseline = "bottom";
      this.上下文.fillText("北", 中点X, y - 边标签偏移);
    } else {
      this.上下文.textBaseline = "top";
      this.上下文.fillText("北", 中点X, y + 边标签偏移);
    }
    // 南边：横线 y+height
    if (height >= 0) {
      this.上下文.textBaseline = "top";
      this.上下文.fillText("南", 中点X, y + height + 边标签偏移);
    } else {
      this.上下文.textBaseline = "bottom";
      this.上下文.fillText("南", 中点X, y + height - 边标签偏移);
    }

    /* const 操作 = this.当前操作;
    if (操作 && 操作 !== "移动") {
      const 锚 = this.取锚点坐标();
      if (锚) {
        this.上下文.fillStyle = this.锚点色;
        this.上下文.strokeStyle = "#fff";
        this.上下文.lineWidth = 1.5;
        this.上下文.beginPath();
        this.上下文.arc(锚.x, 锚.y, this.锚点半径, 0, Math.PI * 2);
        this.上下文.fill();
        this.上下文.stroke();
      }
    } */

    // 左下方：标准化复选框 + 提示文案
    const 边距 = 10;
    const 文案默认色 = "#94a3b8";
    const 角边字色 = "#4a9eff";
    this.上下文.font = "16px 'Noto Sans SC', 微软雅黑, sans-serif";
    this.上下文.textBaseline = "bottom";
    this.上下文.textAlign = "left";
    const 文案Y = this.画布.clientHeight - 边距;
    const cbX = 边距;
    const cbY = 文案Y - 45;
    const cbSize = 18;
    const cbHover = this.悬停标准化复选框;
    this.上下文.save();
    this.上下文.fillStyle = this.标准化 ? "#2d854d" : cbHover ? "#1a243a" : "#0b1220";
    this.上下文.strokeStyle = this.标准化 ? (cbHover ? "lightgreen" : "#2d854d") : cbHover ? "#64748b" : "#334155";
    this.上下文.lineWidth = 1.5;
    roundRect(this.上下文, cbX, cbY, cbSize, cbSize, 2, true, true);
    if (this.标准化) {
      this.上下文.strokeStyle = "#def";
      this.上下文.lineWidth = 2.2;
      this.上下文.beginPath();
      this.上下文.moveTo(cbX + 4, cbY + 9);
      this.上下文.lineTo(cbX + 8, cbY + 13);
      this.上下文.lineTo(cbX + 14, cbY + 5);
      this.上下文.stroke();
    }
    this.上下文.restore();
    this.上下文.fillStyle = "#e2e8f0";
    this.上下文.font = this.复选框字体;
    this.上下文.textBaseline = "top";
    this.上下文.fillText("标准化", cbX + cbSize + 8, cbY + 3);
    this.上下文.textBaseline = "bottom";
    const 片段列表 = [
      { 文本: "拖拽矩形的", 色: 文案默认色 },
      { 文本: "角", 色: 角边字色 },
      { 文本: "或", 色: 文案默认色 },
      { 文本: "边", 色: 角边字色 },
      { 文本: "进行缩放", 色: 文案默认色 },
    ];
    let 文案X = 边距;
    for (const { 文本, 色 } of 片段列表) {
      this.上下文.fillStyle = 色;
      this.上下文.fillText(文本, 文案X, 文案Y);
      文案X += this.上下文.measureText(文本).width;
    }

    // 右下角两行：mousemove/mousedown（事件名色）+ 命中热区（标签色）+ 冒号 + 值
    const 标签色 = "#94a3b8";
    const 事件名色 = "#4a9eff";
    const 冒号色 = "gray";
    const 值色 = "lightseagreen";
    this.上下文.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    this.上下文.textBaseline = "bottom";
    const 右下边距 = 10;
    const 行高 = 18;
    const 值区宽度 = 40;
    const 右X = this.画布.clientWidth - 右下边距;
    let 行Y = this.画布.clientHeight - 右下边距;
    const 移动值 = this.当前悬停 != null ? this.当前悬停 : "null";
    const 按下值 = this.按下命中热区 != null ? this.按下命中热区 : "null";
    const 冒号宽 = this.上下文.measureText("：").width;
    const 值区左 = 右X - 值区宽度;
    const 冒号右 = 值区左;
    const 标签右 = 冒号右 - 冒号宽;
    const 命中热区宽 = this.上下文.measureText("命中热区").width;
    this.上下文.textAlign = "right";
    this.上下文.fillStyle = 事件名色;
    this.上下文.fillText("mousemove", 标签右 - 命中热区宽 - 4, 行Y);
    this.上下文.fillStyle = 标签色;
    this.上下文.fillText("命中热区", 标签右, 行Y);
    this.上下文.fillStyle = 冒号色;
    this.上下文.fillText("：", 冒号右, 行Y);
    this.上下文.textAlign = "left";
    this.上下文.fillStyle = 值色;
    this.上下文.fillText(移动值, 值区左, 行Y);
    行Y -= 行高;
    this.上下文.textAlign = "right";
    this.上下文.fillStyle = 事件名色;
    this.上下文.fillText("mousedown", 标签右 - 命中热区宽 - 4, 行Y);
    this.上下文.fillStyle = 标签色;
    this.上下文.fillText("命中热区", 标签右, 行Y);
    this.上下文.fillStyle = 冒号色;
    this.上下文.fillText("：", 冒号右, 行Y);
    this.上下文.textAlign = "left";
    this.上下文.fillStyle = 值色;
    this.上下文.fillText(按下值, 值区左, 行Y);
  }

  取锚点坐标() {
    const 操作 = this.当前操作;
    if (!操作 || 操作 === "移动") return null;
    const 匹配 = this.锚点坐标表[操作];
    return 匹配 ? 匹配(this.矩形) : null;
  }

  鼠标按下(事件) {
    const { x: 鼠标X, y: 鼠标Y } = this.获取画布坐标(事件);
    const 拖拽热区 = this.获取命中拖拽热区(鼠标X, 鼠标Y);
    this.按下命中热区 = 拖拽热区;
    if (!拖拽热区) {
      if (this.是否在标准化复选框(鼠标X, 鼠标Y)) {
        this.标准化 = !this.标准化;
        if (this.标准化) {
          const r = this.矩形;
          if (r.width < 0) {
            r.x += r.width;
            r.width = -r.width;
          }
          if (r.height < 0) {
            r.y += r.height;
            r.height = -r.height;
          }
        }
        this.绘制();
      }
      return;
    }

    if (拖拽热区 === "本体") {
      this.当前操作 = "移动";
      this.拖拽偏移X = 鼠标X - this.矩形.x;
      this.拖拽偏移Y = 鼠标Y - this.矩形.y;
      this.绘制();
    } else {
      this.当前操作 = 拖拽热区;
      const { x, y, width, height } = this.矩形;
      switch (拖拽热区) {
        case "西北":
          this.缩放偏移X = x - 鼠标X;
          this.缩放偏移Y = y - 鼠标Y;
          break;
        case "北":
          this.缩放偏移X = 0;
          this.缩放偏移Y = y - 鼠标Y;
          break;
        case "东北":
          this.缩放偏移X = x + width - 鼠标X;
          this.缩放偏移Y = y - 鼠标Y;
          break;
        case "东":
          this.缩放偏移X = x + width - 鼠标X;
          this.缩放偏移Y = 0;
          break;
        case "东南":
          this.缩放偏移X = x + width - 鼠标X;
          this.缩放偏移Y = y + height - 鼠标Y;
          break;
        case "南":
          this.缩放偏移X = 0;
          this.缩放偏移Y = y + height - 鼠标Y;
          break;
        case "西南":
          this.缩放偏移X = x - 鼠标X;
          this.缩放偏移Y = y + height - 鼠标Y;
          break;
        case "西":
          this.缩放偏移X = x - 鼠标X;
          this.缩放偏移Y = 0;
          break;
      }
      this.绘制();
    }
  }

  应用缩放(鼠标X, 鼠标Y) {
    const 有效X = 鼠标X + this.缩放偏移X;
    const 有效Y = 鼠标Y + this.缩放偏移Y;
    const { x, y, width, height } = this.矩形;
    const 最小宽 = this.最小宽度;
    const 最小高 = this.最小高度;
    //确保宽高不会位于 (-最小值, 最小值) 范围内
    const 限定有效范围 = (v, 最小) => (Math.abs(v) < 最小 ? (v >= 0 ? 最小 : -最小) : v);

    switch (this.当前操作) {
      case "西北": {
        this.矩形.width = 限定有效范围(x + width - 有效X, 最小宽);
        this.矩形.height = 限定有效范围(y + height - 有效Y, 最小高);
        this.矩形.x = x + width - this.矩形.width;
        this.矩形.y = y + height - this.矩形.height;
        break;
      }
      case "北": {
        this.矩形.height = 限定有效范围(y + height - 有效Y, 最小高);
        this.矩形.y = y + height - this.矩形.height;
        break;
      }
      case "东北": {
        this.矩形.width = 限定有效范围(有效X - x, 最小宽);
        this.矩形.height = 限定有效范围(y + height - 有效Y, 最小高);
        this.矩形.y = y + height - this.矩形.height;
        break;
      }
      case "东": {
        this.矩形.width = 限定有效范围(有效X - x, 最小宽);
        break;
      }
      case "东南": {
        this.矩形.width = 限定有效范围(有效X - x, 最小宽);
        this.矩形.height = 限定有效范围(有效Y - y, 最小高);
        break;
      }
      case "南": {
        this.矩形.height = 限定有效范围(有效Y - y, 最小高);
        break;
      }
      case "西南": {
        this.矩形.width = 限定有效范围(x + width - 有效X, 最小宽);
        this.矩形.height = 限定有效范围(有效Y - y, 最小高);
        this.矩形.x = x + width - this.矩形.width;
        break;
      }
      case "西": {
        this.矩形.width = 限定有效范围(x + width - 有效X, 最小宽);
        this.矩形.x = x + width - this.矩形.width;
        break;
      }
    }

    // 仅当勾选“标准化”时：宽高始终 ≥0，使“东”恒在右、“西”恒在左，并同步对侧高亮
    if (this.标准化) {
      const 水平翻转 = this.矩形.width < 0;
      const 垂直翻转 = this.矩形.height < 0;
      if (水平翻转) {
        this.矩形.x += this.矩形.width;
        this.矩形.width = -this.矩形.width;
      }
      if (垂直翻转) {
        this.矩形.y += this.矩形.height;
        this.矩形.height = -this.矩形.height;
      }

      const 水平翻转镜像表 = {
        西北: "东北",
        北: "北",
        东北: "西北",
        东: "西",
        东南: "西南",
        南: "南",
        西南: "东南",
        西: "东",
      };
      const 垂直翻转镜像表 = {
        西北: "西南",
        北: "南",
        东北: "东南",
        东: "东",
        东南: "东北",
        南: "北",
        西南: "西北",
        西: "西",
      };
      if (水平翻转) {
        this.当前操作 = 水平翻转镜像表[this.当前操作];
        this.按下命中热区 = this.当前操作;
        this.当前悬停 = this.当前操作;
      }
      if (垂直翻转) {
        this.当前操作 = 垂直翻转镜像表[this.当前操作];
        this.按下命中热区 = this.当前操作;
        this.当前悬停 = this.当前操作;
      }
    }
  }

  鼠标移动(事件) {
    const { x: 鼠标X, y: 鼠标Y } = this.获取画布坐标(事件);

    if (this.当前操作 === "移动") {
      this.矩形.x = 鼠标X - this.拖拽偏移X;
      this.矩形.y = 鼠标Y - this.拖拽偏移Y;
      this.绘制();
      return;
    }

    if (this.当前操作) {
      this.应用缩放(鼠标X, 鼠标Y);
      this.绘制();
      return;
    }

    const 命中 = this.获取命中拖拽热区(鼠标X, 鼠标Y);
    const 上次悬停复选框 = this.悬停标准化复选框;
    this.悬停标准化复选框 = this.是否在标准化复选框(鼠标X, 鼠标Y);
    if (命中 !== this.当前悬停 || 上次悬停复选框 !== this.悬停标准化复选框) {
      this.当前悬停 = 命中;
      this.绘制();
    }
    const 光标样式 = {
      西北: "nwse-resize",
      东北: "nesw-resize",
      东南: "nwse-resize",
      西南: "nesw-resize",
      北: "ns-resize",
      南: "ns-resize",
      东: "ew-resize",
      西: "ew-resize",
      本体: 光标.拖拽,
    };
    this.画布.style.cursor = this.悬停标准化复选框 ? 光标.指向 : 命中 && 光标样式[命中] ? 光标样式[命中] : 光标.默认;
  }

  鼠标抬起() {
    this.当前操作 = null;
    this.按下命中热区 = null;
    this.绘制();
  }

  鼠标离开() {
    if (!this.当前操作) this.画布.style.cursor = 光标.默认;
    this.当前操作 = null;
    if (this.当前悬停 !== null) this.当前悬停 = null;
    if (this.悬停标准化复选框) {
      this.悬停标准化复选框 = false;
      this.绘制();
    }
  }
}

const 镜像缩放实例 = new 镜像缩放("#cvs-镜像缩放");

class 圆热区 {
  constructor() {
    this.初始化();
    this.安装事件();
    this.绘制();
  }

  初始化() {
    this.cvs = document.getElementById("cvs-圆热区");
    this.ctx = this.cvs.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.cssWidth = this.cvs.clientWidth;
    this.cssHeight = this.cvs.clientHeight;
    this.width = this.cssWidth * this.dpr;
    this.height = this.cssHeight * this.dpr;
    this.cvs.width = this.width;
    this.cvs.height = this.height;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // 椭圆：中心 (cx, cy)、水平半径 rx、垂直半径 ry（CSS像素）
    const 初始rx = 175;
    const 初始ry = 125;
    this.椭圆 = {
      cx: this.cssWidth / 2,
      cy: this.cssHeight / 2 - 80,
      rx: 初始rx,
      ry: 初始ry,
    };

    // 颜色与样式
    this.bgColor = "#0f1720";
    this.edgeColor = "#48b0ff";
    this.fillColor = "rgba(80, 160, 255, 0.15)";
    this.fillHoverColor = "rgba(80, 160, 255, 0.25)";
    this.highlightColor = "#ffd166";
    this.toleranceFill = "rgba(255,209,102,0.12)";
    this.toleranceStroke = "rgb(201, 92, 150)";
    this.sliderFillColors = ["#349a59", "#349a59", "#349a59", "#349a59"];

    // 四个滑块：圆内容差、圆外容差、水平半径、垂直半径
    this.值_圆内 = 5;
    this.值_圆外 = 5;
    this.值_rx = 初始rx;
    this.值_ry = 初始ry;

    // 状态（圆热区）
    this.拖拽中 = false;
    this.拖拽偏移 = { x: 0, y: 0 };
    this.悬停椭圆边界 = false;
    this.最后鼠标X = 0;
    this.最后鼠标Y = 0;
    this.鼠标在画布内 = false;
    this.显示算法 = false;
    this.显示热区 = false;
    this.悬停算法复选框 = false;
    this.鼠标在椭圆内 = false;
    this.悬停复选框 = false;
    this.悬停滑块 = null;
    this.滑块拖拽偏移 = 0;
    this.复选框标题 = "显示热区";
    this.复选框字体 = "14px 'Noto Sans SC', 微软雅黑, sans-serif";

    // 滑块布局（CSS像素）：高度增加以容纳两个复选框
    this.sliderArea = {
      padding: 12,
      width: Math.min(260, this.cssWidth * 0.4),
      height: 276,
      gap: 10,
    };
    this.sliderArea.x = 12;
    this.sliderArea.y = this.cssHeight - this.sliderArea.height - 12;

    this.activeSlider = null;
    this.边界矩形 = this.cvs.getBoundingClientRect();
  }

  安装事件() {
    this.cvs.style.touchAction = "none";
    this._pointerMove = this._pointerMove.bind(this);
    this._pointerDown = this._pointerDown.bind(this);
    this._pointerUp = this._pointerUp.bind(this);
    this._resize = this._resize.bind(this);
    this._pointerEnter = this._pointerEnter.bind(this);
    this._pointerLeave = this._pointerLeave.bind(this);

    this.cvs.addEventListener("pointerdown", this._pointerDown);
    this.cvs.addEventListener("pointerenter", this._pointerEnter);
    this.cvs.addEventListener("pointerleave", this._pointerLeave);
    window.addEventListener("pointermove", this._pointerMove);
    window.addEventListener("pointerup", this._pointerUp);
    window.addEventListener("resize", this._resize);

    if (typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(() => this._updateBoundingRectDebounced());
      this._resizeObserver.observe(this.cvs);
    }
  }

  _resize() {
    this.cssWidth = this.cvs.clientWidth;
    this.cssHeight = this.cvs.clientHeight;
    this.width = this.cssWidth * this.dpr;
    this.height = this.cssHeight * this.dpr;
    this.cvs.width = this.width;
    this.cvs.height = this.height;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.sliderArea.width = Math.min(260, this.cssWidth * 0.4);
    this.sliderArea.y = this.cssHeight - this.sliderArea.height - 12;
    this._updateBoundingRectDebounced();
    this.绘制();
  }

  _pointerEnter() {
    this.鼠标在画布内 = true;
    this._updateBoundingRectDebounced();
  }

  _pointerLeave() {
    this.鼠标在画布内 = false;
    this.绘制();
  }

  _updateBoundingRectDebounced() {
    if (this._rectTimer) clearTimeout(this._rectTimer);
    this._rectTimer = setTimeout(() => {
      this.更新边界矩形();
      this._rectTimer = null;
    }, 50);
  }

  客户到画布(clientX, clientY) {
    const r = this.边界矩形;
    const x = clientX - r.left;
    const y = clientY - r.top;
    return { x, y };
  }

  _pointerDown(e) {
    this._updateBoundingRectDebounced();
    const p = this.客户到画布(e.clientX, e.clientY);
    const 命中复选框 = this._pointInCheckbox(p);
    if (命中复选框 === "algorithm") {
      this.显示算法 = !this.显示算法;
      this.绘制();
      return;
    }
    if (命中复选框 === "hotzone") {
      this.显示热区 = !this.显示热区;
      this.绘制();
      return;
    }
    const s = this._hitTestSlider(p);
    if (s) {
      this.activeSlider = s.name;
      this.悬停滑块 = s.name;
      this.滑块拖拽偏移 = s.inThumb ? s.offsetX : 0;
      if (!s.inThumb) this._updateSliderValueFromPoint(s.name, p, this.滑块拖拽偏移);
      this.绘制();
      return;
    }

    const 命中 = this._hitTest椭圆边界(p);
    if (命中 === "内部") {
      this.拖拽中 = true;
      this.拖拽偏移.x = p.x - this.椭圆.cx;
      this.拖拽偏移.y = p.y - this.椭圆.cy;
      return;
    }
  }

  _pointerUp() {
    this.拖拽中 = false;
    this.activeSlider = null;
    this.滑块拖拽偏移 = 0;
  }

  _pointerMove(e) {
    const p = this.客户到画布(e.clientX, e.clientY);
    this.最后鼠标X = p.x;
    this.最后鼠标Y = p.y;
    let needRedraw = false;
    const prevInEllipse = this.鼠标在椭圆内;
    const prevHoverCheckbox = this.悬停复选框;
    const prevHover算法复选框 = this.悬停算法复选框;
    const prevHoverSlider = this.悬停滑块;
    const controlHit = !this.拖拽中 && !this.activeSlider ? this._hitTestSlider(p) : null;

    if (this.拖拽中) {
      this.椭圆.cx = p.x - this.拖拽偏移.x;
      this.椭圆.cy = p.y - this.拖拽偏移.y;
      this.椭圆.cx = Math.max(this.椭圆.rx, Math.min(this.椭圆.cx, this.cssWidth - this.椭圆.rx));
      this.椭圆.cy = Math.max(this.椭圆.ry, Math.min(this.椭圆.cy, this.cssHeight - this.椭圆.ry));
      needRedraw = true;
    } else if (this.activeSlider) {
      this._updateSliderValueFromPoint(this.activeSlider, p, this.滑块拖拽偏移);
      needRedraw = true;
    } else if (controlHit) {
      this.悬停椭圆边界 = false;
      this.鼠标在椭圆内 = false;
      this.悬停滑块 = controlHit === "checkbox-algorithm" || controlHit === "checkbox-hotzone" ? null : controlHit.name;
      this.悬停复选框 = controlHit === "checkbox-hotzone";
      this.悬停算法复选框 = controlHit === "checkbox-algorithm";
    } else {
      const prevEdge = this.悬停椭圆边界;
      const 命中 = this._hitTest椭圆边界(p);
      this.悬停椭圆边界 = 命中 === "边界";
      this.鼠标在椭圆内 = 命中 === "内部";
      if (prevEdge !== this.悬停椭圆边界) needRedraw = true;
    }

    if (!this.拖拽中 && !this.activeSlider) {
      if (!controlHit) {
        this.悬停滑块 = null;
        const 命中复选框 = this._pointInCheckbox(p);
        this.悬停复选框 = 命中复选框 === "hotzone";
        this.悬停算法复选框 = 命中复选框 === "algorithm";
      }
    } else {
      this.悬停复选框 = false;
      this.悬停算法复选框 = false;
      if (this.activeSlider) this.悬停滑块 = this.activeSlider;
    }

    if (
      prevHoverCheckbox !== this.悬停复选框 ||
      prevHover算法复选框 !== this.悬停算法复选框 ||
      prevHoverSlider !== this.悬停滑块
    )
      needRedraw = true;
    if (prevInEllipse !== this.鼠标在椭圆内) needRedraw = true;
    if (this.鼠标在画布内) needRedraw = true;
    if (needRedraw) this.绘制();
  }

  绘制() {
    const ctx = this.ctx;
    const { cx, cy, rx, ry } = this.椭圆;
    ctx.save();
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);

    ctx.fillStyle = this.鼠标在椭圆内 ? this.fillHoverColor : this.fillColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(200, 80, 80)";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "silver";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (this.显示热区 && this.悬停椭圆边界) {
      this._绘制椭圆容差(true, false);
    }

    ctx.strokeStyle = this.悬停椭圆边界 ? this.highlightColor : this.edgeColor;
    ctx.lineWidth = this.悬停椭圆边界 ? 2 : 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (this.显示热区 && this.悬停椭圆边界) {
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = this.toleranceStroke;
      this._绘制椭圆容差(false, true);
      ctx.restore();
    }

    if (this.鼠标在画布内 && this.显示算法) {
      const mx = this.最后鼠标X;
      const my = this.最后鼠标Y;
      const 水平距离 = Math.abs(mx - cx);
      const 垂直距离 = Math.abs(my - cy);
      const 水平交换 = 水平距离 < rx;
      const 垂直交换 = 垂直距离 < ry;
      const 归一化水平偏移 = (mx - cx) / rx;
      const 归一化垂直偏移 = (my - cy) / ry;
      const 归一化距离 = Math.sqrt(归一化水平偏移 ** 2 + 归一化垂直偏移 ** 2);
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      if (水平交换) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#012";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(mx >= cx ? cx + rx : cx - rx, cy);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#9ab";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(mx, cy);
        ctx.stroke();
      } else {
        ctx.strokeStyle = "#678";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(mx, cy);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#9ab";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(mx >= cx ? cx + rx : cx - rx, cy);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      if (垂直交换) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#012";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, my >= cy ? cy + ry : cy - ry);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#9ab";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, my);
        ctx.stroke();
      } else {
        ctx.strokeStyle = "#678";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, my);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#9ab";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, my >= cy ? cy + ry : cy - ry);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "#94a3b8";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(mx, my);
      ctx.stroke();
      ctx.setLineDash([]);
      const 标注偏移 = 14;
      const 距离标注x = mx + 标注偏移;
      const 距离数值y = my - 标注偏移;
      const 距离文本y = 距离数值y - 14;
      ctx.textAlign = "left";
      ctx.font = "14px 'Noto Sans SC', 微软雅黑, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("归一化距离", 距离标注x, 距离文本y);
      this._绘制数值含灰点(ctx, 归一化距离.toFixed(2), 距离标注x, 距离数值y, "#e2e8f0", false);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const 水平线中x = 水平距离 > rx ? (cx + mx) / 2 : cx + (mx >= cx ? rx : -rx) / 2;
      const 水平线中y = cy;
      const 水平数值y = 水平线中y - 16;
      const 水平文本y = 水平数值y - 18;
      this._绘制数值含灰点(ctx, 归一化水平偏移.toFixed(2), 水平线中x, 水平数值y, "#e2e8f0");
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px 'Noto Sans SC', 微软雅黑, sans-serif";
      ctx.fillText("归一化水平偏移", 水平线中x, 水平文本y);
      const 垂直线中x = cx;
      const 垂直线中y = 垂直距离 > ry ? (cy + my) / 2 : cy + (my >= cy ? ry : -ry) / 2;
      const 垂直标注x = 垂直线中x + 16;
      const 垂直文本y = 垂直线中y - 10;
      const 垂直数值y = 垂直线中y + 9;
      ctx.textAlign = "left";
      ctx.fillText("归一化垂直偏移", 垂直标注x, 垂直文本y);
      this._绘制数值含灰点(ctx, 归一化垂直偏移.toFixed(2), 垂直标注x, 垂直数值y, "#e2e8f0", false);
      ctx.textAlign = "left";
    }

    this._绘制控件();
    ctx.restore();
  }

  _绘制数值含灰点(ctx, 文本, x, y, 默认色, 居中 = true) {
    ctx.font = "12px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    ctx.textBaseline = "middle";
    const 总宽 = ctx.measureText(文本).width;
    let 当前x = 居中 ? x - 总宽 / 2 : x;
    for (const ch of 文本) {
      if (ch === "-") ctx.fillStyle = "#f97316";
      else if (ch === ".") ctx.fillStyle = "gray";
      else ctx.fillStyle = 默认色;
      ctx.fillText(ch, 当前x, y);
      当前x += ctx.measureText(ch).width;
    }
  }

  _绘制椭圆容差(needFill, needStroke = true) {
    const ctx = this.ctx;
    const { cx, cy, rx, ry } = this.椭圆;
    const 内 = this.值_圆内;
    const 外 = this.值_圆外;
    const rxInner = Math.max(1, rx - 内);
    const ryInner = Math.max(1, ry - 内);
    const rxOuter = rx + 外;
    const ryOuter = ry + 外;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rxOuter, ryOuter, 0, 0, Math.PI * 2);
    ctx.moveTo(cx + rxInner, cy);
    ctx.ellipse(cx, cy, rxInner, ryInner, 0, 0, Math.PI * 2, true);
    if (needFill) {
      ctx.fillStyle = "#f6a3";
      ctx.fill("evenodd");
    }
    if (needStroke) ctx.stroke();
  }

  _绘制控件() {
    const ctx = this.ctx;
    const s = this.sliderArea;
    const x = s.x;
    const y = s.y;
    const w = s.width;
    const h = s.height;

    ctx.save();
    ctx.fillStyle = "rgba(10,15,20,0.6)";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    roundRect(ctx, x, y, w, h, 8, true, true);

    const cbX = x + 12;
    const cbSize = 18;
    const 复选框行高 = cbSize + 8;
    const 算法cbY = y + 10;
    const 热区cbY = 算法cbY + 复选框行高;
    const 算法cbHover = this.悬停算法复选框;
    const 热区cbHover = this.悬停复选框;
    ctx.save();
    ctx.fillStyle = this.显示算法 ? "#2d854d" : 算法cbHover ? "#1a243a" : "#0b1220";
    ctx.strokeStyle = this.显示算法 ? (算法cbHover ? "lightgreen" : "#2d854d") : 算法cbHover ? "#64748b" : "#334155";
    ctx.lineWidth = 1.5;
    roundRect(ctx, cbX, 算法cbY, cbSize, cbSize, 2, true, true);
    if (this.显示算法) {
      ctx.strokeStyle = "#def";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cbX + 4, 算法cbY + 9);
      ctx.lineTo(cbX + 8, 算法cbY + 13);
      ctx.lineTo(cbX + 14, 算法cbY + 5);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = "#e2e8f0";
    ctx.font = this.复选框字体;
    ctx.textBaseline = "top";
    ctx.fillText("显示算法", cbX + cbSize + 8, 算法cbY + 3);
    ctx.save();
    ctx.fillStyle = this.显示热区 ? "#2d854d" : 热区cbHover ? "#1a243a" : "#0b1220";
    ctx.strokeStyle = this.显示热区 ? (热区cbHover ? "lightgreen" : "#2d854d") : 热区cbHover ? "#64748b" : "#334155";
    ctx.lineWidth = 1.5;
    roundRect(ctx, cbX, 热区cbY, cbSize, cbSize, 2, true, true);
    if (this.显示热区) {
      ctx.strokeStyle = "#def";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cbX + 4, 热区cbY + 9);
      ctx.lineTo(cbX + 8, 热区cbY + 13);
      ctx.lineTo(cbX + 14, 热区cbY + 5);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = "#e2e8f0";
    ctx.font = this.复选框字体;
    ctx.fillText(this.复选框标题, cbX + cbSize + 8, 热区cbY + 3);

    const sliderNames = ["圆内容差", "圆外容差", "水平半径", "垂直半径"];
    const sliderValues = [this.值_圆内, this.值_圆外, this.值_rx, this.值_ry];
    const lineHeight = this._getSliderLineHeight();
    const startY = this._getSliderStartY(热区cbY, cbSize);
    for (let i = 0; i < 4; i++) {
      const layout = this._getSliderLayout(i, startY, lineHeight, w);
      const sy = layout.labelY;
      const isHover = this.悬停滑块 === this._indexToSliderName(i);
      const sliderColor = isHover ? this._getSliderHoverColor(i) : this.sliderFillColors[i];
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "14px 'Noto Sans SC', 微软雅黑, sans-serif";
      ctx.fillText(sliderNames[i], x + 12, sy);

      const trackX = layout.trackX;
      const trackY = layout.trackY;
      const trackW = layout.trackW;
      const trackH = layout.trackH;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      roundRect(ctx, trackX, trackY, trackW, trackH, 0, true, false);

      const tpos = layout.thumbX;
      ctx.fillStyle = sliderColor;
      roundRect(ctx, trackX, trackY, tpos - trackX, trackH, 0, true, false);
      ctx.beginPath();
      ctx.fillStyle = sliderColor;
      ctx.arc(tpos, trackY + trackH / 2, layout.thumbR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#80aae0";
      ctx.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, monospace";
      ctx.textAlign = "left";
      ctx.fillText(Math.round(sliderValues[i]), trackX + trackW + 10, trackY - 3);
      ctx.textAlign = "left";
    }

    ctx.restore();
  }

  _hitTest椭圆边界(鼠标坐标) {
    const { cx: 圆心x, cy: 圆心y, rx: 水平半径, ry: 垂直半径 } = this.椭圆;
    const 鼠标到圆心水平距离 = 鼠标坐标.x - 圆心x;
    const 鼠标到圆心垂直距离 = 鼠标坐标.y - 圆心y;
    const 去容差水平内半径 = Math.max(1, 水平半径 - this.值_圆内);
    const 去容差垂直内半径 = Math.max(1, 垂直半径 - this.值_圆内);
    const 加容差水平外半径 = 水平半径 + this.值_圆外;
    const 加容差垂直外半径 = 垂直半径 + this.值_圆外;
    const 归一化鼠标到圆心距离平方_外 =
      (鼠标到圆心水平距离 / 加容差水平外半径) ** 2 + (鼠标到圆心垂直距离 / 加容差垂直外半径) ** 2;
    const 归一化鼠标到圆心距离平方_内 =
      (鼠标到圆心水平距离 / 去容差水平内半径) ** 2 + (鼠标到圆心垂直距离 / 去容差垂直内半径) ** 2;
    if (归一化鼠标到圆心距离平方_外 <= 1 && 归一化鼠标到圆心距离平方_内 >= 1) return "边界";
    if (归一化鼠标到圆心距离平方_内 < 1) return "内部";
    return null;
  }

  _hitTestSlider(p) {
    const s = this.sliderArea;
    const x = s.x;
    const y = s.y;
    const w = s.width;
    const 命中复选框 = this._pointInCheckbox(p);
    if (命中复选框 === "algorithm") return "checkbox-algorithm";
    if (命中复选框 === "hotzone") return "checkbox-hotzone";
    const 复选框行高 = 18 + 8;
    const 热区cbY = y + 10 + 复选框行高;
    const startY = this._getSliderStartY(热区cbY, 18);
    const lineHeight = this._getSliderLineHeight();
    for (let i = 0; i < 4; i++) {
      const layout = this._getSliderLayout(i, startY, lineHeight, w);
      const inTrack =
        p.x >= layout.trackX - 10 &&
        p.x <= layout.trackX + layout.trackW + 10 &&
        p.y >= layout.trackY - 12 &&
        p.y <= layout.trackY + layout.trackH + 12;
      const inThumb = Math.hypot(p.x - layout.thumbX, p.y - layout.thumbY) <= layout.thumbR + 2;
      if (inTrack || inThumb) {
        const name = this._indexToSliderName(i);
        return {
          name,
          inThumb,
          offsetX: p.x - layout.thumbX,
        };
      }
    }
    return null;
  }

  _updateSliderValueFromPoint(name, p, offsetX = 0) {
    const s = this.sliderArea;
    const w = s.width;
    const 复选框行高 = 18 + 8;
    const 热区cbY = s.y + 10 + 复选框行高;
    const startY = this._getSliderStartY(热区cbY, 18);
    const lineHeight = this._getSliderLineHeight();
    const index = this._sliderNameToIndex(name);
    const layout = this._getSliderLayout(index, startY, lineHeight, w);
    const desiredX = p.x - offsetX;
    const minX = layout.trackX + layout.thumbR;
    const maxX = layout.trackX + layout.trackW - layout.thumbR;
    const clampedX = Math.max(minX, Math.min(maxX, desiredX));
    const usableW = Math.max(1, layout.trackW - layout.thumbR * 2);
    const value = ((clampedX - minX) / usableW) * layout.maxVal;
    if (name === "圆内") this.值_圆内 = Math.round(value);
    else if (name === "圆外") this.值_圆外 = Math.round(value);
    else if (name === "rx") {
      this.值_rx = Math.max(1, Math.round(value));
      this.椭圆.rx = this.值_rx;
    } else if (name === "ry") {
      this.值_ry = Math.max(1, Math.round(value));
      this.椭圆.ry = this.值_ry;
    }
  }

  _getSliderLayout(index, startY, lineHeight, panelWidth) {
    const x = this.sliderArea.x;
    const sy = startY + index * lineHeight;
    const trackX = x + 12;
    const trackY = sy + 12 + 10;
    const trackW = panelWidth - 60;
    const trackH = 5;
    const maxVal = index <= 1 ? 100 : 200;
    const val = Math.max(0, Math.min(maxVal, this._getSliderValueByIndex(index)));
    const thumbR = 8;
    const thumbX = trackX + thumbR + (val / maxVal) * Math.max(0, trackW - thumbR * 2);
    const thumbY = trackY + trackH / 2;
    return {
      labelY: sy,
      trackX,
      trackY,
      trackW,
      trackH,
      thumbX,
      thumbY,
      thumbR,
      maxVal,
    };
  }

  _indexToSliderName(i) {
    return i === 0 ? "圆内" : i === 1 ? "圆外" : i === 2 ? "rx" : "ry";
  }

  _sliderNameToIndex(name) {
    return name === "圆内" ? 0 : name === "圆外" ? 1 : name === "rx" ? 2 : 3;
  }

  _getSliderValueByIndex(index) {
    return index === 0 ? this.值_圆内 : index === 1 ? this.值_圆外 : index === 2 ? this.值_rx : this.值_ry;
  }

  _getSliderHoverColor(index) {
    const base = this.sliderFillColors[index];
    return base === "#349a59" ? "#57c477" : "#7bd59b";
  }

  _getSliderStartY(cbY, cbSize) {
    return cbY + cbSize + 24;
  }

  _getSliderLineHeight() {
    return 50;
  }

  _pointInCheckbox(p) {
    const s = this.sliderArea;
    const cbX = s.x + 12;
    const cbSize = 18;
    const padding = 8;
    this.ctx.save();
    this.ctx.font = this.复选框字体;
    const 算法标签宽 = this.ctx.measureText("显示算法").width;
    const 热区标签宽 = this.ctx.measureText(this.复选框标题).width;
    this.ctx.restore();
    const 复选框行高 = cbSize + 8;
    const 算法cbY = s.y + 10;
    const 热区cbY = 算法cbY + 复选框行高;
    const 算法rectW = cbSize + 8 + 算法标签宽 + padding;
    const 算法rectH = Math.max(cbSize, 16);
    const 热区rectW = cbSize + 8 + 热区标签宽 + padding;
    const 热区rectH = Math.max(cbSize, 16);
    if (p.x >= cbX && p.x <= cbX + 算法rectW && p.y >= 算法cbY && p.y <= 算法cbY + 算法rectH) return "algorithm";
    if (p.x >= cbX && p.x <= cbX + 热区rectW && p.y >= 热区cbY && p.y <= 热区cbY + 热区rectH) return "hotzone";
    return null;
  }

  // 外部调用以更新边界矩形（由 IntersectionObserver 在防抖后调用）
  更新边界矩形() {
    this.边界矩形 = this.cvs.getBoundingClientRect();
  }
}

const 圆热区实例 = new 圆热区();

class 圆镜像缩放 {
  constructor(画布元素) {
    this.默认配置 = {
      最小半径: 5,
      初始椭圆: { cx: 400, cy: 280, rx: 175, ry: 125 },
    };
    this.画布 = typeof 画布元素 === "string" ? document.querySelector(画布元素) : 画布元素;
    if (!this.画布 || this.画布.tagName !== "CANVAS") {
      throw new Error("请传入有效的 canvas 元素或选择器");
    }
    this.上下文 = this.画布.getContext("2d");

    const 默认 = this.默认配置;
    this.最小半径 = 默认.最小半径;
    this.椭圆 = { ...默认.初始椭圆 };

    this.设备像素比 = window.devicePixelRatio || 1;
    this.拖拽偏移X = 0;
    this.拖拽偏移Y = 0;
    this.缩放偏移X = 0;
    this.缩放偏移Y = 0;
    this.当前操作 = null;
    this.当前悬停 = null;
    this.按下命中热区 = null;

    this.标准化 = true;
    this.悬停标准化复选框 = false;
    this.复选框字体 = "14px 'Noto Sans SC', 微软雅黑, sans-serif";

    this.绑定事件 = this.绑定事件.bind(this);
    this.鼠标按下 = this.鼠标按下.bind(this);
    this.鼠标移动 = this.鼠标移动.bind(this);
    this.鼠标抬起 = this.鼠标抬起.bind(this);
    this.鼠标离开 = this.鼠标离开.bind(this);

    this.绑定事件();
    this.设置画布尺寸();
    window.addEventListener("resize", () => this.设置画布尺寸());
  }

  绑定事件() {
    window.addEventListener("resize", this.更新边界矩形.bind(this));
    this.画布.addEventListener("mousedown", this.鼠标按下);
    this.画布.addEventListener("mousemove", this.鼠标移动);
    this.画布.addEventListener("mouseup", this.鼠标抬起);
    this.画布.addEventListener("mouseleave", this.鼠标离开);
  }

  是否在标准化复选框(鼠标X, 鼠标Y) {
    const 边距 = 10;
    const 文案Y = this.画布.clientHeight - 边距;
    const cbX = 边距;
    const cbY = 文案Y - 45;
    const cbSize = 18;
    this.上下文.font = this.复选框字体;
    const 标签宽 = this.上下文.measureText("标准化").width;
    const 内边距 = 8;
    const 右 = cbX + cbSize + 8 + 标签宽 + 内边距;
    const 高 = cbSize;
    return 鼠标X >= cbX && 鼠标X <= 右 && 鼠标Y >= cbY && 鼠标Y <= cbY + 高;
  }

  设置画布尺寸() {
    this.更新边界矩形();
    this.画布.width = this.画布.clientWidth * this.设备像素比;
    this.画布.height = this.画布.clientHeight * this.设备像素比;
    this.上下文.scale(this.设备像素比, this.设备像素比);
    this.绘制();
  }

  获取画布坐标(事件) {
    return {
      x: 事件.clientX - this.边界矩形.left,
      y: 事件.clientY - this.边界矩形.top,
    };
  }

  更新边界矩形() {
    this.边界矩形 = this.画布.getBoundingClientRect();
  }

  获取命中拖拽热区(鼠标X, 鼠标Y) {
    const { cx, cy, rx, ry } = this.椭圆;
    const 容差 = 5;
    const 水平偏移 = 鼠标X - cx;
    const 垂直偏移 = 鼠标Y - cy;
    const 归一化水平偏移 = 水平偏移 / rx;
    const 归一化垂直偏移 = 垂直偏移 / ry;
    const 归一化距离 = Math.sqrt(归一化水平偏移 ** 2 + 归一化垂直偏移 ** 2);
    const 归一化边缘容差 = Math.min(容差 / Math.min(Math.abs(rx), Math.abs(ry)), 0.25);
    if (Math.abs(归一化距离 - 1) <= 归一化边缘容差) return "缩放";
    if (归一化距离 < 1) return "本体";
    return null;
  }

  根据角度获取缩放光标(鼠标X, 鼠标Y) {
    const { cx, cy } = this.椭圆;
    const 角度 = Math.atan2(鼠标Y - cy, 鼠标X - cx);
    const π = Math.PI;
    const π8 = π / 8;
    if (角度 >= -π8 && 角度 < π8) return "ew-resize";
    if (角度 >= π8 && 角度 < 3 * π8) return "nwse-resize";
    if (角度 >= 3 * π8 && 角度 < 5 * π8) return "ns-resize";
    if (角度 >= 5 * π8 && 角度 < 7 * π8) return "nesw-resize";
    if (角度 >= 7 * π8 || 角度 < -7 * π8) return "ew-resize";
    if (角度 >= -7 * π8 && 角度 < -5 * π8) return "nwse-resize";
    if (角度 >= -5 * π8 && 角度 < -3 * π8) return "ns-resize";
    return "nesw-resize";
  }

  绘制() {
    this.上下文.clearRect(0, 0, this.画布.width, this.画布.height);
    const { cx, cy, rx, ry } = this.椭圆;

    this.上下文.fillStyle = this.当前悬停 === "本体" ? "rgba(80, 160, 255, 0.25)" : "rgba(80, 160, 255, 0.15)";
    this.上下文.beginPath();
    this.上下文.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    this.上下文.fill();

    this.上下文.strokeStyle = this.当前悬停 === "缩放" ? "#ffd166" : "rgba(74, 158, 255)";
    this.上下文.lineWidth = this.当前悬停 === "缩放" ? 2 : 1;
    this.上下文.beginPath();
    this.上下文.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    this.上下文.stroke();

    this.上下文.fillStyle = "rgba(200, 80, 80)";
    this.上下文.beginPath();
    this.上下文.arc(cx, cy, 4, 0, Math.PI * 2);
    this.上下文.fill();
    this.上下文.strokeStyle = "silver";
    this.上下文.lineWidth = 1;
    this.上下文.stroke();

    const 边距 = 10;
    const 文案默认色 = "#94a3b8";
    const 角边字色 = "#4a9eff";
    this.上下文.font = "16px 'Noto Sans SC', 微软雅黑, sans-serif";
    this.上下文.textBaseline = "bottom";
    this.上下文.textAlign = "left";
    const 文案Y = this.画布.clientHeight - 边距;
    const cbX = 边距;
    const cbY = 文案Y - 45;
    const cbSize = 18;
    const cbHover = this.悬停标准化复选框;
    this.上下文.save();
    this.上下文.fillStyle = this.标准化 ? "#2d854d" : cbHover ? "#1a243a" : "#0b1220";
    this.上下文.strokeStyle = this.标准化 ? (cbHover ? "lightgreen" : "#2d854d") : cbHover ? "#64748b" : "#334155";
    this.上下文.lineWidth = 1.5;
    roundRect(this.上下文, cbX, cbY, cbSize, cbSize, 2, true, true);
    if (this.标准化) {
      this.上下文.strokeStyle = "#def";
      this.上下文.lineWidth = 2.2;
      this.上下文.beginPath();
      this.上下文.moveTo(cbX + 4, cbY + 9);
      this.上下文.lineTo(cbX + 8, cbY + 13);
      this.上下文.lineTo(cbX + 14, cbY + 5);
      this.上下文.stroke();
    }
    this.上下文.restore();
    this.上下文.fillStyle = "#e2e8f0";
    this.上下文.font = this.复选框字体;
    this.上下文.textBaseline = "top";
    this.上下文.fillText("标准化", cbX + cbSize + 8, cbY + 3);
    this.上下文.textBaseline = "bottom";
    const 片段列表 = [
      { 文本: "拖拽椭圆的", 色: 文案默认色 },
      { 文本: "边缘", 色: 角边字色 },
      { 文本: "进行缩放", 色: 文案默认色 },
    ];
    let 文案X = 边距;
    for (const { 文本, 色 } of 片段列表) {
      this.上下文.fillStyle = 色;
      this.上下文.fillText(文本, 文案X, 文案Y);
      文案X += this.上下文.measureText(文本).width;
    }
  }

  鼠标按下(事件) {
    const { x: 鼠标X, y: 鼠标Y } = this.获取画布坐标(事件);
    const 拖拽热区 = this.获取命中拖拽热区(鼠标X, 鼠标Y);
    this.按下命中热区 = 拖拽热区;
    if (!拖拽热区) {
      if (this.是否在标准化复选框(鼠标X, 鼠标Y)) {
        this.标准化 = !this.标准化;
        if (this.标准化) {
          const e = this.椭圆;
          if (e.rx < 0) {
            e.cx += e.rx;
            e.rx = -e.rx;
          }
          if (e.ry < 0) {
            e.cy += e.ry;
            e.ry = -e.ry;
          }
        }
        this.绘制();
      }
      return;
    }

    if (拖拽热区 === "本体") {
      this.当前操作 = "移动";
      this.拖拽偏移X = 鼠标X - this.椭圆.cx;
      this.拖拽偏移Y = 鼠标Y - this.椭圆.cy;
      this.绘制();
    } else {
      this.当前操作 = "缩放";
      const { cx, cy, rx, ry } = this.椭圆;
      const 差X = (鼠标X - cx) / rx;
      const 差Y = (鼠标Y - cy) / ry;
      const 归一化距离 = Math.sqrt(差X * 差X + 差Y * 差Y) || 1;
      this.缩放偏移X = (cx - 鼠标X) * (1 - 1 / 归一化距离);
      this.缩放偏移Y = (cy - 鼠标Y) * (1 - 1 / 归一化距离);
      this.绘制();
    }
  }

  应用缩放(鼠标X, 鼠标Y) {
    const { cx, cy, rx, ry } = this.椭圆;
    const 有效X = 鼠标X + this.缩放偏移X;
    const 有效Y = 鼠标Y + this.缩放偏移Y;
    const 新差X = (有效X - cx) / rx;
    const 新差Y = (有效Y - cy) / ry;
    const 比例 = Math.sqrt(新差X * 新差X + 新差Y * 新差Y) || 1;
    const 最小 = this.最小半径;
    let 新rx = rx * 比例;
    let 新ry = ry * 比例;
    const 最小有效 = Math.min(Math.abs(新rx), Math.abs(新ry));
    if (最小有效 <= 0) {
      新rx = rx >= 0 ? 最小 : -最小;
      新ry = ry >= 0 ? 最小 : -最小;
    } else if (最小有效 < 最小) {
      const 缩放系数 = 最小 / 最小有效;
      新rx *= 缩放系数;
      新ry *= 缩放系数;
    }
    this.椭圆.rx = 新rx;
    this.椭圆.ry = 新ry;
    if (this.标准化) {
      const e = this.椭圆;
      if (e.rx < 0) {
        e.cx += e.rx;
        e.rx = -e.rx;
      }
      if (e.ry < 0) {
        e.cy += e.ry;
        e.ry = -e.ry;
      }
    }
  }

  鼠标移动(事件) {
    const { x: 鼠标X, y: 鼠标Y } = this.获取画布坐标(事件);

    if (this.当前操作 === "移动") {
      this.椭圆.cx = 鼠标X - this.拖拽偏移X;
      this.椭圆.cy = 鼠标Y - this.拖拽偏移Y;
      this.绘制();
      return;
    }

    if (this.当前操作 === "缩放") {
      this.应用缩放(鼠标X, 鼠标Y);
      this.绘制();
      return;
    }

    const 命中 = this.获取命中拖拽热区(鼠标X, 鼠标Y);
    const 上次悬停复选框 = this.悬停标准化复选框;
    this.悬停标准化复选框 = this.是否在标准化复选框(鼠标X, 鼠标Y);
    if (命中 !== this.当前悬停 || 上次悬停复选框 !== this.悬停标准化复选框) {
      this.当前悬停 = 命中;
      this.绘制();
    }
    let 光标值 = 光标.默认;
    if (this.悬停标准化复选框) 光标值 = 光标.指向;
    else if (命中 === "本体") 光标值 = 光标.拖拽;
    else if (命中 === "缩放") 光标值 = this.根据角度获取缩放光标(鼠标X, 鼠标Y);
    this.画布.style.cursor = 光标值;
  }

  鼠标抬起() {
    this.当前操作 = null;
    this.按下命中热区 = null;
    this.绘制();
  }

  鼠标离开() {
    if (!this.当前操作) this.画布.style.cursor = 光标.默认;
    this.当前操作 = null;
    if (this.当前悬停 !== null) this.当前悬停 = null;
    if (this.悬停标准化复选框) {
      this.悬停标准化复选框 = false;
      this.绘制();
    }
  }
}

const 圆镜像缩放实例 = new 圆镜像缩放("#cvs-圆镜像缩放");

class 圆水平垂直独立镜像缩放 {
  constructor(画布元素) {
    this.缩放模式 = null;
    this.缩放起始角度 = null;
    this.最后鼠标X = 0;
    this.最后鼠标Y = 0;
    this.鼠标在画布内 = false;
    this.默认配置 = {
      最小半径: 5,
      初始椭圆: { cx: 400, cy: 280, rx: 175, ry: 125 },
    };
    this.画布 = typeof 画布元素 === "string" ? document.querySelector(画布元素) : 画布元素;
    if (!this.画布 || this.画布.tagName !== "CANVAS") {
      throw new Error("请传入有效的 canvas 元素或选择器");
    }
    this.上下文 = this.画布.getContext("2d");

    const 默认 = this.默认配置;
    this.最小半径 = 默认.最小半径;
    this.椭圆 = { ...默认.初始椭圆 };

    this.设备像素比 = window.devicePixelRatio || 1;
    this.拖拽偏移X = 0;
    this.拖拽偏移Y = 0;
    this.缩放偏移X = 0;
    this.缩放偏移Y = 0;
    this.当前操作 = null;
    this.当前悬停 = null;
    this.按下命中热区 = null;

    this.标准化 = true;
    this.悬停标准化复选框 = false;
    this.复选框字体 = "14px 'Noto Sans SC', 微软雅黑, sans-serif";

    this.绑定事件 = this.绑定事件.bind(this);
    this.鼠标按下 = this.鼠标按下.bind(this);
    this.鼠标移动 = this.鼠标移动.bind(this);
    this.鼠标抬起 = this.鼠标抬起.bind(this);
    this.鼠标离开 = this.鼠标离开.bind(this);

    this.绑定事件();
    this.设置画布尺寸();
    window.addEventListener("resize", () => this.设置画布尺寸());
  }

  绑定事件() {
    window.addEventListener("resize", this.更新边界矩形.bind(this));
    this.画布.addEventListener("mousedown", this.鼠标按下);
    this.画布.addEventListener("mousemove", this.鼠标移动);
    this.画布.addEventListener("mouseup", this.鼠标抬起);
    this.画布.addEventListener("mouseleave", this.鼠标离开);
  }

  是否在标准化复选框(鼠标X, 鼠标Y) {
    const 边距 = 10;
    const 文案Y = this.画布.clientHeight - 边距;
    const cbX = 边距;
    const cbY = 文案Y - 45;
    const cbSize = 18;
    this.上下文.font = this.复选框字体;
    const 标签宽 = this.上下文.measureText("标准化").width;
    const 内边距 = 8;
    const 右 = cbX + cbSize + 8 + 标签宽 + 内边距;
    const 高 = cbSize;
    return 鼠标X >= cbX && 鼠标X <= 右 && 鼠标Y >= cbY && 鼠标Y <= cbY + 高;
  }

  设置画布尺寸() {
    this.更新边界矩形();
    this.画布.width = this.画布.clientWidth * this.设备像素比;
    this.画布.height = this.画布.clientHeight * this.设备像素比;
    this.上下文.scale(this.设备像素比, this.设备像素比);
    this.绘制();
  }

  获取画布坐标(事件) {
    return {
      x: 事件.clientX - this.边界矩形.left,
      y: 事件.clientY - this.边界矩形.top,
    };
  }

  更新边界矩形() {
    this.边界矩形 = this.画布.getBoundingClientRect();
  }

  获取命中拖拽热区(鼠标X, 鼠标Y) {
    const { cx, cy, rx, ry } = this.椭圆;
    const 容差 = 5;
    const 差X = (鼠标X - cx) / rx;
    const 差Y = (鼠标Y - cy) / ry;
    const 归一化距离平方 = 差X ** 2 + 差Y ** 2;
    const 归一化距离 = Math.sqrt(归一化距离平方);
    const 实际距离 = Math.sqrt((鼠标X - cx) ** 2 + (鼠标Y - cy) ** 2);
    const 半径 = 归一化距离 >= 1e-6 ? 实际距离 / 归一化距离 : 0;
    const 边缘容差 = Math.min(容差 / Math.min(Math.abs(rx), Math.abs(ry)), 0.25);
    if (Math.abs(归一化距离 - 1) <= 边缘容差) return "缩放";
    if (实际距离 < 半径) return "本体";
    return null;
  }

  根据角度获取缩放光标(鼠标X, 鼠标Y) {
    const { cx, cy } = this.椭圆;
    const 角度 = Math.atan2(鼠标Y - cy, 鼠标X - cx);
    const π = Math.PI;
    const π8 = π / 8;
    if (角度 >= -π8 && 角度 < π8) return "ew-resize";
    if (角度 >= π8 && 角度 < 3 * π8) return "nwse-resize";
    if (角度 >= 3 * π8 && 角度 < 5 * π8) return "ns-resize";
    if (角度 >= 5 * π8 && 角度 < 7 * π8) return "nesw-resize";
    if (角度 >= 7 * π8 || 角度 < -7 * π8) return "ew-resize";
    if (角度 >= -7 * π8 && 角度 < -5 * π8) return "nwse-resize";
    if (角度 >= -5 * π8 && 角度 < -3 * π8) return "ns-resize";
    return "nesw-resize";
  }

  根据角度获取缩放模式(角度) {
    const π = Math.PI;
    const π8 = π / 8;
    if ((角度 >= -π8 && 角度 < π8) || 角度 >= 7 * π8 || 角度 < -7 * π8) return "水平";
    if ((角度 >= 3 * π8 && 角度 < 5 * π8) || (角度 >= -5 * π8 && 角度 < -3 * π8)) return "垂直";
    return "等比";
  }

  几何角转参数角(几何角, rx, ry) {
    return Math.atan2(rx * Math.sin(几何角), ry * Math.cos(几何角));
  }

  根据角度获取扇形范围(角度, rx, ry) {
    const π = Math.PI;
    const π8 = π / 8;
    const 转 = (α) => this.几何角转参数角(α, rx, ry);
    if (角度 >= -π8 && 角度 < π8) return { startAngle: 转(-π8), endAngle: 转(π8) };
    if (角度 >= π8 && 角度 < 3 * π8) return { startAngle: 转(π8), endAngle: 转(3 * π8) };
    if (角度 >= 3 * π8 && 角度 < 5 * π8) return { startAngle: 转(3 * π8), endAngle: 转(5 * π8) };
    if (角度 >= 5 * π8 && 角度 < 7 * π8) return { startAngle: 转(5 * π8), endAngle: 转(7 * π8) };
    if (角度 >= 7 * π8 || 角度 < -7 * π8) return { startAngle: 转(7 * π8), endAngle: 转(-7 * π8) };
    if (角度 >= -7 * π8 && 角度 < -5 * π8) return { startAngle: 转(-7 * π8), endAngle: 转(-5 * π8) };
    if (角度 >= -5 * π8 && 角度 < -3 * π8) return { startAngle: 转(-5 * π8), endAngle: 转(-3 * π8) };
    return { startAngle: 转(-3 * π8), endAngle: 转(-π8) };
  }

  绘制() {
    this.上下文.clearRect(0, 0, this.画布.width, this.画布.height);
    const { cx, cy } = this.椭圆;
    const rx = Math.abs(this.椭圆.rx);
    const ry = Math.abs(this.椭圆.ry);

    this.上下文.fillStyle = this.当前悬停 === "本体" ? "rgba(80, 160, 255, 0.25)" : "rgba(80, 160, 255, 0.15)";
    this.上下文.beginPath();
    this.上下文.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    this.上下文.fill();

    if (this.当前悬停 === "缩放") {
      const 角度 = this.当前操作 === "缩放" ? this.缩放起始角度 : Math.atan2(this.最后鼠标Y - cy, this.最后鼠标X - cx);
      const { startAngle, endAngle } = this.根据角度获取扇形范围(角度, rx, ry);
      this.上下文.fillStyle = "#ffffff15";
      this.上下文.beginPath();
      this.上下文.moveTo(cx, cy);
      this.上下文.ellipse(cx, cy, rx, ry, 0, startAngle, endAngle);
      this.上下文.closePath();
      this.上下文.fill();
    }

    this.上下文.strokeStyle = this.当前悬停 === "缩放" ? "#ffd166" : "rgba(74, 158, 255)";
    this.上下文.lineWidth = this.当前悬停 === "缩放" ? 2 : 1;
    this.上下文.beginPath();
    this.上下文.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    this.上下文.stroke();

    const π = Math.PI;
    const π8 = π / 8;
    const 边界角度列表 = [-π8, π8, 3 * π8, 5 * π8, 7 * π8, -7 * π8, -5 * π8, -3 * π8];
    this.上下文.strokeStyle = "#ffffff15";
    this.上下文.lineWidth = 1;
    for (const 几何角 of 边界角度列表) {
      const θ = this.几何角转参数角(几何角, rx, ry);
      const ex = cx + rx * Math.cos(θ);
      const ey = cy + ry * Math.sin(θ);
      this.上下文.beginPath();
      this.上下文.moveTo(cx, cy);
      this.上下文.lineTo(ex, ey);
      this.上下文.stroke();
    }

    this.上下文.fillStyle = "rgba(200, 80, 80)";
    this.上下文.beginPath();
    this.上下文.arc(cx, cy, 4, 0, Math.PI * 2);
    this.上下文.fill();
    this.上下文.strokeStyle = "silver";
    this.上下文.lineWidth = 1;
    this.上下文.stroke();

    if (this.鼠标在画布内) {
      const mx = this.最后鼠标X;
      const my = this.最后鼠标Y;
      const 角度 = Math.atan2(my - cy, mx - cx);
      const 距离 = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
      this.上下文.setLineDash([10, 10]);
      this.上下文.strokeStyle = "#94a3b8aa";
      this.上下文.lineWidth = 1;
      this.上下文.beginPath();
      this.上下文.moveTo(cx, cy);
      this.上下文.lineTo(mx, my);
      this.上下文.stroke();
      this.上下文.setLineDash([]);
      if (距离 >= 1e-6) {
        const cosθ = Math.cos(角度);
        const sinθ = Math.sin(角度);
        const 椭圆上距离 = (rx * ry) / Math.sqrt(ry * ry * cosθ * cosθ + rx * rx * sinθ * sinθ);
        const 扩展距离 = 椭圆上距离;
        const 文本X = cx + (扩展距离 + 72) * cosθ;
        const 文本Y = cy + (扩展距离 + 30) * sinθ;
        const 精简小数 = (s) => {
          if (!s.includes(".")) return s;
          s = s.replace(/0+$/, "");
          return s.endsWith(".") ? s.slice(0, -1) : s;
        };
        const 角度度 = 精简小数(((角度 * 180) / Math.PI).toFixed(0));
        const 弧度 = 角度;
        const 弧度Str = 精简小数(弧度.toFixed(2));
        const 等号边距 = 8;
        const 角度部分 = `${角度度}°`;
        const 等号色 = "darkgoldenrod";
        const 字体 = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, monospace";
        this.上下文.font = 字体;
        this.上下文.textBaseline = "middle";
        const 等号宽 = this.上下文.measureText("=").width;
        const 等号中心X = 文本X;
        let x = 等号中心X - 等号宽 / 2 - 等号边距 - this.上下文.measureText(角度部分).width;
        for (const ch of 角度部分) {
          if (ch === "-") this.上下文.fillStyle = "lightskyblue";
          else if (ch === ".") this.上下文.fillStyle = "gray";
          else if (ch === "°") this.上下文.fillStyle = "greenyellow";
          else this.上下文.fillStyle = "#e2e8f0";
          this.上下文.fillText(ch, x, 文本Y);
          x += this.上下文.measureText(ch).width;
        }
        this.上下文.fillStyle = 等号色;
        this.上下文.fillText("=", 等号中心X - 等号宽 / 2, 文本Y);
        x = 等号中心X + 等号宽 / 2 + 等号边距;
        for (const ch of 弧度Str) {
          if (ch === "-") this.上下文.fillStyle = "lightskyblue";
          else if (ch === ".") this.上下文.fillStyle = "gray";
          else this.上下文.fillStyle = "#e2e8f0";
          this.上下文.fillText(ch, x, 文本Y);
          x += this.上下文.measureText(ch).width;
        }
      }
    }

    this.上下文.textAlign = "left";
    const 边距 = 10;
    const 文案默认色 = "#94a3b8";
    const 角边字色 = "#4a9eff";
    this.上下文.font = "16px 'Noto Sans SC', 微软雅黑, sans-serif";
    this.上下文.textBaseline = "bottom";
    const 文案Y = this.画布.clientHeight - 边距;
    const cbX = 边距;
    const cbY = 文案Y - 45;
    const cbSize = 18;
    const cbHover = this.悬停标准化复选框;
    this.上下文.save();
    this.上下文.fillStyle = this.标准化 ? "#2d854d" : cbHover ? "#1a243a" : "#0b1220";
    this.上下文.strokeStyle = this.标准化 ? (cbHover ? "lightgreen" : "#2d854d") : cbHover ? "#64748b" : "#334155";
    this.上下文.lineWidth = 1.5;
    roundRect(this.上下文, cbX, cbY, cbSize, cbSize, 2, true, true);
    if (this.标准化) {
      this.上下文.strokeStyle = "#def";
      this.上下文.lineWidth = 2.2;
      this.上下文.beginPath();
      this.上下文.moveTo(cbX + 4, cbY + 9);
      this.上下文.lineTo(cbX + 8, cbY + 13);
      this.上下文.lineTo(cbX + 14, cbY + 5);
      this.上下文.stroke();
    }
    this.上下文.restore();
    this.上下文.fillStyle = "#e2e8f0";
    this.上下文.font = this.复选框字体;
    this.上下文.textBaseline = "top";
    this.上下文.fillText("标准化", cbX + cbSize + 8, cbY + 3);
    this.上下文.textBaseline = "bottom";
    const 片段列表 = [
      { 文本: "拖拽椭圆的", 色: 文案默认色 },
      { 文本: "边缘", 色: 角边字色 },
      { 文本: "进行缩放", 色: 文案默认色 },
    ];
    let 文案X = 边距;
    for (const { 文本, 色 } of 片段列表) {
      this.上下文.fillStyle = 色;
      this.上下文.fillText(文本, 文案X, 文案Y);
      文案X += this.上下文.measureText(文本).width;
    }
  }

  鼠标按下(事件) {
    const { x: 鼠标X, y: 鼠标Y } = this.获取画布坐标(事件);
    const 拖拽热区 = this.获取命中拖拽热区(鼠标X, 鼠标Y);
    this.按下命中热区 = 拖拽热区;
    if (!拖拽热区) {
      if (this.是否在标准化复选框(鼠标X, 鼠标Y)) {
        this.标准化 = !this.标准化;
        if (this.标准化) {
          const e = this.椭圆;
          if (e.rx < 0) {
            e.cx += e.rx;
            e.rx = -e.rx;
          }
          if (e.ry < 0) {
            e.cy += e.ry;
            e.ry = -e.ry;
          }
        }
        this.绘制();
      }
      return;
    }

    if (拖拽热区 === "本体") {
      this.当前操作 = "移动";
      this.拖拽偏移X = 鼠标X - this.椭圆.cx;
      this.拖拽偏移Y = 鼠标Y - this.椭圆.cy;
      this.绘制();
    } else {
      this.当前操作 = "缩放";
      const { cx, cy, rx, ry } = this.椭圆;
      const 角度 = Math.atan2(鼠标Y - cy, 鼠标X - cx);
      this.缩放起始角度 = 角度;
      this.缩放模式 = this.根据角度获取缩放模式(角度);
      const π = Math.PI;
      const π8 = π / 8;
      const 右 = 角度 >= -π8 && 角度 < π8;
      const 上 = 角度 >= -5 * π8 && 角度 < -3 * π8;
      this.按下时边缘X = 右 ? (rx >= 0 ? cx + rx : cx) : rx >= 0 ? cx - rx : cx + rx;
      this.按下时边缘Y = 上 ? (ry >= 0 ? cy - ry : cy + ry) : ry >= 0 ? cy + ry : cy;
      this.按下时鼠标X = 鼠标X;
      this.按下时鼠标Y = 鼠标Y;
      const 差X = (鼠标X - cx) / rx;
      const 差Y = (鼠标Y - cy) / ry;
      const 归一化距离 = Math.sqrt(差X * 差X + 差Y * 差Y) || 1;
      this.缩放偏移X = this.缩放模式 === "水平" ? this.按下时边缘X - 鼠标X : (cx - 鼠标X) * (1 - 1 / 归一化距离);
      this.缩放偏移Y = this.缩放模式 === "垂直" ? this.按下时边缘Y - 鼠标Y : (cy - 鼠标Y) * (1 - 1 / 归一化距离);
      this.绘制();
    }
  }

  应用缩放(鼠标X, 鼠标Y) {
    const { cx, cy, rx, ry } = this.椭圆;
    const 有效X = 鼠标X + this.缩放偏移X;
    const 有效Y = 鼠标Y + this.缩放偏移Y;
    const 最小 = this.最小半径;
    let 新rx = rx;
    let 新ry = ry;
    if (this.缩放模式 === "水平") {
      新rx = Math.max(最小, Math.abs(有效X - cx));
    } else if (this.缩放模式 === "垂直") {
      新ry = Math.max(最小, Math.abs(有效Y - cy));
    } else {
      const 新差X = (有效X - cx) / rx;
      const 新差Y = (有效Y - cy) / ry;
      const 比例 = Math.sqrt(新差X * 新差X + 新差Y * 新差Y) || 1;
      新rx = rx * 比例;
      新ry = ry * 比例;
      const 最小有效 = Math.min(Math.abs(新rx), Math.abs(新ry));
      if (最小有效 < 最小 && 最小有效 > 0) {
        const 修正 = 最小 / 最小有效;
        新rx *= 修正;
        新ry *= 修正;
      } else if (最小有效 === 0) {
        新rx = rx >= 0 ? 最小 : -最小;
        新ry = ry >= 0 ? 最小 : -最小;
      }
    }
    this.椭圆.rx = 新rx;
    this.椭圆.ry = 新ry;
    if (this.标准化) {
      const e = this.椭圆;
      if (e.rx < 0) {
        e.cx += e.rx;
        e.rx = -e.rx;
      }
      if (e.ry < 0) {
        e.cy += e.ry;
        e.ry = -e.ry;
      }
    }
  }

  鼠标移动(事件) {
    const { x: 鼠标X, y: 鼠标Y } = this.获取画布坐标(事件);
    this.最后鼠标X = 鼠标X;
    this.最后鼠标Y = 鼠标Y;
    this.鼠标在画布内 = true;

    if (this.当前操作 === "移动") {
      this.椭圆.cx = 鼠标X - this.拖拽偏移X;
      this.椭圆.cy = 鼠标Y - this.拖拽偏移Y;
      this.绘制();
      return;
    }

    if (this.当前操作 === "缩放") {
      this.应用缩放(鼠标X, 鼠标Y);
      this.绘制();
      return;
    }

    const 命中 = this.获取命中拖拽热区(鼠标X, 鼠标Y);
    const 上次悬停复选框 = this.悬停标准化复选框;
    this.悬停标准化复选框 = this.是否在标准化复选框(鼠标X, 鼠标Y);
    if (命中 !== this.当前悬停 || 上次悬停复选框 !== this.悬停标准化复选框 || 命中 === "缩放") {
      this.当前悬停 = 命中;
    }
    this.绘制();
    let 光标值 = 光标.默认;
    if (this.悬停标准化复选框) 光标值 = 光标.指向;
    else if (命中 === "本体") 光标值 = 光标.拖拽;
    else if (命中 === "缩放") 光标值 = this.根据角度获取缩放光标(鼠标X, 鼠标Y);
    this.画布.style.cursor = 光标值;
  }

  鼠标抬起() {
    this.当前操作 = null;
    this.按下命中热区 = null;
    this.绘制();
  }

  鼠标离开() {
    this.鼠标在画布内 = false;
    if (!this.当前操作) this.画布.style.cursor = 光标.默认;
    this.当前操作 = null;
    if (this.当前悬停 !== null) this.当前悬停 = null;
    if (this.悬停标准化复选框) this.悬停标准化复选框 = false;
    this.绘制();
  }
}

const 圆水平垂直独立镜像缩放实例 = new 圆水平垂直独立镜像缩放("#cvs-圆水平垂直独立镜像缩放");

// 统一的全局 scroll 防抖：滚动时更新所有 canvas 的边界矩形
const 实例集合 = [热区实例, 缩放实例, 镜像缩放实例, 圆热区实例, 圆镜像缩放实例, 圆水平垂直独立镜像缩放实例];
let 全局滚动定时器 = null;
window.addEventListener(
  "scroll",
  () => {
    if (全局滚动定时器) clearTimeout(全局滚动定时器);
    全局滚动定时器 = setTimeout(() => {
      for (const 实例 of 实例集合) {
        实例.更新边界矩形();
      }
      全局滚动定时器 = null;
    }, 50);
  },
  { passive: true },
);
