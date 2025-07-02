class GradientTutorial {
  constructor() {
    this.currentType = "linear";
    this.canvases = {};
    this.ctxs = {};
    this.dpr = window.devicePixelRatio || 1;
    this.currentColorStop = null;
    this.currentRGB = { r: 255, g: 0, b: 0, a: 255 };
    this.colorPickerInitialized = false;
    this.originalColor = null; // 保存原始颜色，用于取消时恢复

    // 警告相关属性
    this.warning = {
      message: "",
      startTime: 0,
      duration: 2500, // 2.5秒
      isShowing: false,
    };
    this.warningTimeout = null;
    this.isDraggingColorStop = false; // 新增：标记是否正在拖拽色标

    // 线性渐变数据
    this.linearData = {
      angle: 180, // 默认角度
      colorStops: [
        { position: 0, color: "#ffffff" },
        { position: 100, color: "#000000" },
      ],
      selectedStop: null,
    };

    // 径向渐变数据
    this.radialData = {
      center: { x: 0.5, y: 0.5 },
      shape: "ellipse",
      sizeKeyword: "closest-side",
      size: { x: 50, y: 50 },
      sizeUnit: "%",
      colorStops: [
        { position: 0, color: "#ff0000" },
        { position: 100, color: "#0000ff" },
      ],
      selectedStop: null,
    };

    // 锥形渐变数据
    this.conicData = {
      center: { x: 0.5, y: 0.5 },
      startAngle: 0,
      colorStops: [
        { position: 0, color: "#ff0000" },
        { position: 100, color: "#0000ff" },
      ],
      selectedStop: null,
    };

    this.isDragging = false;
    this.dragTarget = null;
    this.dragStartPos = { x: 0, y: 0 };
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.isAdjustingAngle = false; // 角度调整状态

    this.init();
  }

  init() {
    // 等待DOM完全加载
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.setupCanvases();
        this.setupEventListeners();
        this.renderAll();
      });
    } else {
      this.setupCanvases();
      this.setupEventListeners();
      this.renderAll();
    }
  }

  setupCanvases() {
    const canvasIds = ["linear-canvas", "radial-canvas", "conic-canvas"];

    canvasIds.forEach((id) => {
      const canvas = document.getElementById(id);
      const ctx = canvas.getContext("2d");

      // 设置Canvas尺寸和DPI
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * this.dpr;
      canvas.height = rect.height * this.dpr;
      ctx.scale(this.dpr, this.dpr);

      this.canvases[id] = canvas;
      this.ctxs[id] = ctx;
    });
  }

  setupEventListeners() {
    // 渐变类型切换
    document.querySelectorAll(".gradient-type-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchGradientType(e.target.dataset.type);
      });
    });

    // 线性渐变事件
    this.setupLinearEvents();

    // 径向渐变事件
    this.setupRadialEvents();

    // 锥形渐变事件
    this.setupConicEvents();

    // 窗口大小改变
    window.addEventListener("resize", () => {
      this.setupCanvases();
      this.renderAll();
    });
  }

  setupLinearEvents() {
    const canvas = this.canvases["linear-canvas"];
    const overlay = document.getElementById("linear-overlay");

    // 创建预览色标元素
    const previewStop = document.createElement("div");
    previewStop.className = "preview-color-stop";
    previewStop.style.display = "none";
    overlay.appendChild(previewStop);
    this.previewStop = previewStop;

    // Canvas鼠标移动事件
    canvas.addEventListener("mousemove", (e) => {
      if (this.currentType !== "linear") return;

      // 更新鼠标位置
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      // 如果正在调整角度，不处理其他鼠标移动事件
      if (this.isAdjustingAngle) return;

      // 确保linearGradientRect已经初始化
      if (!this.linearGradientRect) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // 检查鼠标是否悬停在角度控制器上
      if (this.angleController) {
        const dx = clickX - this.angleController.x;
        const dy = clickY - this.angleController.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.angleController.radius) {
          canvas.style.cursor = "pointer";
          return;
        }
      }

      // 检查鼠标是否悬停在现有色标上或正在拖拽
      const existingStops = overlay.querySelectorAll(".canvas-color-stop");
      let isHoveringOverStop = false;

      existingStops.forEach((stop) => {
        const stopRect = stop.getBoundingClientRect();
        // 扩大检测范围，包括色标周围的区域
        const expandedLeft = stopRect.left - 10;
        const expandedRight = stopRect.right + 10;
        const expandedTop = stopRect.top - 10;
        const expandedBottom = stopRect.bottom + 10;

        if (
          e.clientX >= expandedLeft &&
          e.clientX <= expandedRight &&
          e.clientY >= expandedTop &&
          e.clientY <= expandedBottom
        ) {
          isHoveringOverStop = true;
        }
      });

      // 如果悬停在色标上或正在拖拽，不显示预览色标
      if (isHoveringOverStop || this.isDragging) {
        canvas.style.cursor = "crosshair";
        previewStop.style.display = "none";
        return;
      }

      // 计算色带在屏幕上的位置
      const scaleX = rect.width / (canvas.width / this.dpr);
      const scaleY = rect.height / (canvas.height / this.dpr);

      const gradientScreenX = this.linearGradientRect.x * scaleX;
      const gradientScreenY = this.linearGradientRect.y * scaleY;
      const gradientScreenWidth = this.linearGradientRect.width * scaleX;
      const gradientScreenHeight = this.linearGradientRect.height * scaleY;

      // 检查鼠标是否在色带下边缘向下1px到60px的区域内
      if (
        clickX >= gradientScreenX &&
        clickX <= gradientScreenX + gradientScreenWidth &&
        clickY >= gradientScreenY + gradientScreenHeight + 1 &&
        clickY <= gradientScreenY + gradientScreenHeight + 60
      ) {
        // 改变鼠标样式
        canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';

        // 显示预览色标
        const relativeX = (clickX - gradientScreenX) / gradientScreenWidth;
        const stopX = gradientScreenX + relativeX * gradientScreenWidth;
        const stopY = gradientScreenY + gradientScreenHeight + 10;

        previewStop.style.left = `${stopX}px`;
        previewStop.style.top = `${stopY}px`;
        previewStop.style.display = "block";

        // 获取该位置的颜色
        const color = this.getColorAtLinearPosition(relativeX * 100);
        previewStop.style.backgroundColor = color;
      } else {
        // 恢复默认鼠标样式
        canvas.style.cursor = "crosshair";
        previewStop.style.display = "none";
        this.renderLinear(); // 重新渲染以清除悬停效果
      }
    });



    // Canvas鼠标按下事件 - 处理色标添加和角度控制器
    canvas.addEventListener("mousedown", (e) => {
      if (this.currentType !== "linear") return;

      // 如果正在拖拽，不处理鼠标按下事件
      if (this.isDragging) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // 检查是否点击在角度控制器上
      if (this.angleController) {
        const dx = clickX - this.angleController.x;
        const dy = clickY - this.angleController.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.angleController.radius) {
          // 点击在角度控制器内，开始角度调整
          this.startAngleAdjustment(e);
          return;
        }
      }

      // 检查是否点击在角度控制器的小十字上
      if (this.angleController) {
        const dx = clickX - this.angleController.crossX;
        const dy = clickY - this.angleController.crossY;
        const crossDistance = Math.sqrt(dx * dx + dy * dy);
        if (crossDistance <= 12) { // 只有点击在小十字中心点附近才允许拖拽
          this.startAngleAdjustment(e);
          return;
        }
      }

      // 确保linearGradientRect已经初始化
      if (!this.linearGradientRect) return;

      // 计算色带在屏幕上的位置
      const scaleX = rect.width / (canvas.width / this.dpr);
      const scaleY = rect.height / (canvas.height / this.dpr);

      const gradientScreenX = this.linearGradientRect.x * scaleX;
      const gradientScreenY = this.linearGradientRect.y * scaleY;
      const gradientScreenWidth = this.linearGradientRect.width * scaleX;
      const gradientScreenHeight = this.linearGradientRect.height * scaleY;

      // 检查鼠标按下是否在色带下边缘向下1px到60px的区域内
      if (
        clickX >= gradientScreenX &&
        clickX <= gradientScreenX + gradientScreenWidth &&
        clickY >= gradientScreenY + gradientScreenHeight + 1 &&
        clickY <= gradientScreenY + gradientScreenHeight + 60
      ) {
        // 在指定区域内按下鼠标添加色标
        const relativeX = (clickX - gradientScreenX) / gradientScreenWidth;
        this.addLinearColorStop(relativeX * 100);
      }
    });

    // 方向线拖拽事件在Canvas点击事件中处理

    // Canvas鼠标离开事件
    canvas.addEventListener("mouseleave", () => {
      if (this.currentType !== "linear") return;

      // 鼠标离开Canvas时隐藏预览色标
      canvas.style.cursor = "crosshair";
      previewStop.style.display = "none";
    });
  }

  setupRadialEvents() {
    const canvas = this.canvases["radial-canvas"];
    const center = document.getElementById("radial-center");
    const sizeHandles = document.querySelectorAll('[id^="radial-size-handle"]');

    // 圆心拖拽
    center.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      this.startDrag("radial-center", null, e);
    });

    // 尺寸控制点拖拽
    sizeHandles.forEach((handle, index) => {
      handle.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        this.startDrag("radial-size", index, e);
      });
    });

    // 形状和尺寸关键字选择
    document.querySelectorAll('input[name="radial-shape"], input[name="radial-size"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        this.updateRadialData();
        this.renderRadial();
        this.updateRadialCSS();
      });
    });

    // 尺寸滑块
    document.getElementById("radial-size-slider").addEventListener("input", (e) => {
      this.radialData.size.x = this.radialData.size.y = parseInt(e.target.value);
      this.renderRadial();
      this.updateRadialCSS();
    });

    // 尺寸单位选择
    document.getElementById("radial-size-unit").addEventListener("change", (e) => {
      this.radialData.sizeUnit = e.target.value;
      this.renderRadial();
      this.updateRadialCSS();
    });

    // Canvas鼠标按下事件 - 处理色标添加
    canvas.addEventListener("mousedown", (e) => {
      if (this.currentType !== "radial") return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // 计算到圆心的距离和角度
      const dx = x - this.radialData.center.x;
      const dy = y - this.radialData.center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 在半径线上添加色标
      if (distance > 0.1 && distance < 0.4) {
        this.addRadialColorStop(distance * 100);
      }
    });
  }

  setupConicEvents() {
    const canvas = this.canvases["conic-canvas"];
    const center = document.getElementById("conic-center");
    const angleHandle = document.getElementById("conic-angle-handle");

    // 圆心拖拽
    center.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      this.startDrag("conic-center", null, e);
    });

    // 角度控制点拖拽
    angleHandle.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      this.startDrag("conic-angle", null, e);
    });

    // Canvas鼠标按下事件 - 处理色标添加
    canvas.addEventListener("mousedown", (e) => {
      if (this.currentType !== "conic") return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // 计算到圆心的距离和角度
      const dx = x - this.conicData.center.x;
      const dy = y - this.conicData.center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;

      // 在圆周上添加色标
      if (distance > 0.2 && distance < 0.4) {
        this.addConicColorStop(angle);
      }
    });
  }

  startDrag(type, target, e) {
    console.log("开始拖拽:", type, target); // 调试信息
    this.isDragging = true;
    this.dragTarget = { type, target };
    this.dragStartPos = { x: e.clientX, y: e.clientY };

    // 使用绑定后的函数引用，确保能正确移除事件监听器
    this.boundHandleDrag = this.handleDrag.bind(this);
    this.boundStopDrag = this.stopDrag.bind(this);

    document.addEventListener("mousemove", this.boundHandleDrag);
    document.addEventListener("mouseup", this.boundStopDrag);
  }

  handleDrag(e) {
    if (!this.isDragging || !this.dragTarget) return;

    const { type, target } = this.dragTarget;
    const deltaX = e.clientX - this.dragStartPos.x;
    const deltaY = e.clientY - this.dragStartPos.y;

    console.log("拖拽中:", type, target, "delta:", deltaX, deltaY); // 调试信息

    if (type === "radial-center") {
      this.updateRadialCenter(deltaX, deltaY);
    } else if (type === "radial-size") {
      this.updateRadialSize(target, deltaX, deltaY);
    } else if (type === "conic-center") {
      this.updateConicCenter(deltaX, deltaY);
    } else if (type === "conic-angle") {
      this.updateConicAngle(deltaX, deltaY);
    }

    // 更新拖拽起始位置为当前位置，用于下一次计算
    this.dragStartPos = { x: e.clientX, y: e.clientY };
  }

  stopDrag() {
    this.isDragging = false;
    this.dragTarget = null;

    if (this.boundHandleDrag) {
      document.removeEventListener("mousemove", this.boundHandleDrag);
      this.boundHandleDrag = null;
    }
    if (this.boundStopDrag) {
      document.removeEventListener("mouseup", this.boundStopDrag);
      this.boundStopDrag = null;
    }
  }

  switchGradientType(type) {
    this.currentType = type;

    // 更新按钮状态
    document.querySelectorAll(".gradient-type-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.type === type);
    });

    // 更新Canvas显示
    document.querySelectorAll(".canvas-container").forEach((container) => {
      container.classList.toggle("active", container.id === `${type}-canvas-container`);
    });

    // 更新控制区显示
    document.querySelectorAll(".control-section").forEach((section) => {
      section.classList.toggle("active", section.classList.contains(`${type}-controls`));
    });

    this.renderAll();
  }

  // 线性渐变方法
  addLinearColorStop(position) {
    // 使用预览色标的颜色
    const color = this.getColorAtLinearPosition(position);

    this.linearData.colorStops.push({ position, color });
    this.linearData.colorStops.sort((a, b) => a.position - b.position);

    this.renderLinear();
    this.updateLinearColorStops();
    this.updateLinearCSS();
  }

  selectLinearColorStop(stopElement) {
    document.querySelectorAll(".canvas-color-stop").forEach((stop) => {
      stop.classList.remove("selected");
    });
    stopElement.classList.add("selected");

    const position = parseFloat(stopElement.dataset.position);
    this.linearData.selectedStop = this.linearData.colorStops.find((stop) => stop.position === position);

    // 这里可以添加颜色选择器
    this.openColorPicker(this.linearData.selectedStop);
  }

  removeLinearColorStop(index) {
    this.linearData.colorStops.splice(index, 1);
    this.renderLinear();
    this.updateLinearColorStops();
    this.updateLinearCSS();
  }



  // 径向渐变方法
  updateRadialCenter(deltaX, deltaY) {
    const canvas = this.canvases["radial-canvas"];
    const rect = canvas.getBoundingClientRect();

    this.radialData.center.x += deltaX / rect.width;
    this.radialData.center.y += deltaY / rect.height;

    // 限制在Canvas范围内
    this.radialData.center.x = Math.max(0.1, Math.min(0.9, this.radialData.center.x));
    this.radialData.center.y = Math.max(0.1, Math.min(0.9, this.radialData.center.y));

    this.renderRadial();
    this.updateRadialCSS();
  }

  updateRadialSize(target, deltaX, deltaY) {
    const canvas = this.canvases["radial-canvas"];
    const rect = canvas.getBoundingClientRect();

    if (target === 0 || target === 2) {
      // 上下
      this.radialData.size.y += ((target === 0 ? -deltaY : deltaY) / rect.height) * 100;
    } else {
      // 左右
      this.radialData.size.x += ((target === 1 ? deltaX : -deltaX) / rect.width) * 100;
    }

    // 限制尺寸范围
    this.radialData.size.x = Math.max(5, Math.min(100, this.radialData.size.x));
    this.radialData.size.y = Math.max(5, Math.min(100, this.radialData.size.y));

    this.renderRadial();
    this.updateRadialCSS();
  }

  addRadialColorStop(position) {
    const color = this.getColorAtRadialPosition(position);
    this.radialData.colorStops.push({ position, color });
    this.radialData.colorStops.sort((a, b) => a.position - b.position);

    this.renderRadial();
    this.updateRadialColorStops();
    this.updateRadialCSS();
  }

  removeRadialColorStop(index) {
    // 检查删除后是否还能保留至少两个色标
    if (this.radialData.colorStops.length - 1 < 2) {
      this.showWarning("至少需要保留两个色标");
      return;
    }
    this.radialData.colorStops.splice(index, 1);
    this.renderRadial();
    this.updateRadialColorStops();
    this.updateRadialCSS();
  }

  updateRadialColorStops() {
    const overlay = document.getElementById("radial-overlay");
    const existingStops = overlay.querySelectorAll(".radial-color-stop");
    existingStops.forEach((stop) => stop.remove());

    this.radialData.colorStops.forEach((stop, index) => {
      const stopElement = document.createElement("div");
      stopElement.className = "radial-color-stop";
      stopElement.style.backgroundColor = stop.color;

      // 计算色标位置（在半径线上）
      const canvas = this.canvases["radial-canvas"];
      const rect = canvas.getBoundingClientRect();
      const centerX = this.radialData.center.x * rect.width;
      const centerY = this.radialData.center.y * rect.height;
      const radius = (stop.position / 100) * Math.min(rect.width, rect.height) * 0.4;

      stopElement.style.left = `${centerX + radius}px`;
      stopElement.style.top = `${centerY}px`;

      stopElement.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        this.startRadialColorStopDrag(stop, e);
      });

      stopElement.addEventListener("click", (e) => {
        this.selectRadialColorStop(stopElement, stop);
      });

      overlay.appendChild(stopElement);
    });
  }

  selectRadialColorStop(stopElement, stop) {
    document.querySelectorAll(".radial-color-stop").forEach((s) => {
      s.classList.remove("selected");
    });
    stopElement.classList.add("selected");
    this.radialData.selectedStop = stop;
    this.openColorPicker(stop);
  }

  // 锥形渐变方法
  updateConicCenter(deltaX, deltaY) {
    const canvas = this.canvases["conic-canvas"];
    const rect = canvas.getBoundingClientRect();

    this.conicData.center.x += deltaX / rect.width;
    this.conicData.center.y += deltaY / rect.height;

    // 限制在Canvas范围内
    this.conicData.center.x = Math.max(0.1, Math.min(0.9, this.conicData.center.x));
    this.conicData.center.y = Math.max(0.1, Math.min(0.9, this.conicData.center.y));

    this.renderConic();
    this.updateConicCSS();
  }

  updateConicAngle(deltaX, deltaY) {
    const canvas = this.canvases["conic-canvas"];
    const rect = canvas.getBoundingClientRect();

    const centerX = this.conicData.center.x * rect.width;
    const centerY = this.conicData.center.y * rect.height;

    const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
    this.conicData.startAngle = (this.conicData.startAngle + angle) % 360;

    this.renderConic();
    this.updateConicControls();
    this.updateConicCSS();
  }

  addConicColorStop(angle) {
    const color = this.getColorAtConicAngle(angle);
    this.conicData.colorStops.push({ position: angle, color });
    this.conicData.colorStops.sort((a, b) => a.position - b.position);

    this.renderConic();
    this.updateConicColorStops();
    this.updateConicCSS();
  }

  removeConicColorStop(index) {
    // 检查删除后是否还能保留至少两个色标
    if (this.conicData.colorStops.length - 1 < 2) {
      this.showWarning("至少需要保留两个色标");
      return;
    }
    this.conicData.colorStops.splice(index, 1);
    this.renderConic();
    this.updateConicColorStops();
    this.updateConicCSS();
  }

  updateConicColorStops() {
    const overlay = document.getElementById("conic-overlay");
    const existingStops = overlay.querySelectorAll(".conic-color-stop");
    existingStops.forEach((stop) => stop.remove());

    this.conicData.colorStops.forEach((stop, index) => {
      const stopElement = document.createElement("div");
      stopElement.className = "conic-color-stop";
      stopElement.style.backgroundColor = stop.color;

      // 计算色标位置（在圆周上）
      const canvas = this.canvases["conic-canvas"];
      const rect = canvas.getBoundingClientRect();
      const centerX = this.conicData.center.x * rect.width;
      const centerY = this.conicData.center.y * rect.height;
      const radius = Math.min(rect.width, rect.height) * 0.3;
      const angleRad = (stop.position * Math.PI) / 180;

      const x = centerX + Math.cos(angleRad) * radius;
      const y = centerY + Math.sin(angleRad) * radius;

      stopElement.style.left = `${x}px`;
      stopElement.style.top = `${y}px`;

      stopElement.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        this.startConicColorStopDrag(stop, e);
      });

      stopElement.addEventListener("click", (e) => {
        this.selectConicColorStop(stopElement, stop);
      });

      overlay.appendChild(stopElement);
    });
  }

  selectConicColorStop(stopElement, stop) {
    document.querySelectorAll(".conic-color-stop").forEach((s) => {
      s.classList.remove("selected");
    });
    stopElement.classList.add("selected");
    this.conicData.selectedStop = stop;
    this.openColorPicker(stop);
  }

  // 渲染方法
  renderLinear() {
    const canvas = this.canvases["linear-canvas"];
    const ctx = this.ctxs["linear-canvas"];
    const width = canvas.width / this.dpr;
    const height = canvas.height / this.dpr;

    ctx.clearRect(0, 0, width, height);

    // 计算色带位置和尺寸
    const gradientWidth = width - 100; // 占Canvas宽度的(100% - 100px)
    const gradientHeight = height - 150; // 占Canvas高度的(100% - 150px)
    const gradientX = 50; // 左边距50px
    const gradientY = 25; // 上边距25px

    // 创建线性渐变
    const angle = this.linearData.angle;
    let startX, startY, endX, endY;
    
    // 计算角度线与色带边界的交点
    const angleRad = ((angle - 90) * Math.PI) / 180; // 转换为数学坐标系
    const centerX = gradientX + gradientWidth / 2;
    const centerY = gradientY + gradientHeight / 2;
    
    // 计算从中心点出发的角度线与色带边界的交点
    const intersections = this.getLineRectangleIntersections(
      centerX, centerY, angleRad,
      gradientX, gradientY, gradientWidth, gradientHeight
    );
    
    if (intersections.length >= 2) {
      // 计算两个交点相对于中心的极角
      const [p1, p2] = intersections;
      const a1 = Math.atan2(p1.y - centerY, p1.x - centerX);
      const a2 = Math.atan2(p2.y - centerY, p2.x - centerX);
      // 计算angleRad与a1、a2的夹角
      const diff1 = Math.abs(((a1 - angleRad + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      const diff2 = Math.abs(((a2 - angleRad + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      // 终点为与angleRad最接近的点，起点为另一个
      let startPoint, endPoint;
      if (diff1 < diff2) {
        endPoint = p1;
        startPoint = p2;
      } else {
        endPoint = p2;
        startPoint = p1;
      }
      startX = startPoint.x;
      startY = startPoint.y;
      endX = endPoint.x;
      endY = endPoint.y;
    } else {
      // 如果计算失败，使用默认值（这种情况不应该发生）
      const halfLength = Math.sqrt(gradientWidth * gradientWidth + gradientHeight * gradientHeight) / 2;
      startX = centerX - Math.cos(angleRad) * halfLength;
      startY = centerY - Math.sin(angleRad) * halfLength;
      endX = centerX + Math.cos(angleRad) * halfLength;
      endY = centerY + Math.sin(angleRad) * halfLength;
    }
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);

    // 添加色标
    this.linearData.colorStops.forEach((stop) => {
      gradient.addColorStop(stop.position / 100, stop.color);
    });

    // 绘制渐变
    ctx.fillStyle = gradient;
    ctx.fillRect(gradientX, gradientY, gradientWidth, gradientHeight);

    // 保存色带信息用于后续计算
    this.linearGradientRect = {
      x: gradientX,
      y: gradientY,
      width: gradientWidth,
      height: gradientHeight,
    };

    // 绘制角度控制器
    this.drawAngleController(ctx, width, height);
  }

  drawAngleController(ctx, width, height) {
    // 角度控制器位置和尺寸 - 放在色带右下角
    const gradientX = 50; // 色带左边距
    const gradientY = 25; // 色带上边距
    const gradientWidth = width - 100; // 色带宽度
    const gradientHeight = height - 150; // 色带高度
    const controllerRadius = 50; // 控制器半径 - 缩小到50px
    
    const controllerX = gradientX + gradientWidth - 40 - controllerRadius; // 色带右边缘向左40px，再减去时钟半径
    const controllerY = gradientY + gradientHeight - 40 - controllerRadius; // 色带下边缘向上40px，再减去时钟半径

    // 保存当前状态
    ctx.save();

    // 绘制圆形背景
    ctx.beginPath();
    ctx.arc(controllerX, controllerY, controllerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(52, 73, 94, 0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制45度刻度 - 修正角度定义：0deg在正上，180deg在正下
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "12px Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

    for (let angle = 0; angle < 360; angle += 45) {
      // 修正角度：CSS渐变角度0deg在正上，需要转换为数学坐标系
      const angleRad = ((angle - 90) * Math.PI) / 180; // 减去90度，使0deg对应正上
      const outerX = controllerX + Math.cos(angleRad) * (controllerRadius + 8);
      const outerY = controllerY + Math.sin(angleRad) * (controllerRadius + 8);
      const innerX = controllerX + Math.cos(angleRad) * (controllerRadius - 5);
      const innerY = controllerY + Math.sin(angleRad) * (controllerRadius - 5);

      // 绘制刻度线
      ctx.beginPath();
      ctx.moveTo(outerX, outerY);
      ctx.lineTo(innerX, innerY);
      ctx.stroke();

      // 绘制角度文字背景
      const textX = controllerX + Math.cos(angleRad) * (controllerRadius + 20);
      const textY = controllerY + Math.sin(angleRad) * (controllerRadius + 20);
      const textWidth = ctx.measureText(`${angle}°`).width;
      const textHeight = 16;
      const textPadding = 4;
      
      ctx.fillStyle = "#0005"; // 半透明黑色背景
      this.drawRoundedRect(
        ctx,
        textX - textWidth / 2 - textPadding - 2, // 增加2px宽度
        textY - textHeight / 2 - textPadding,
        textWidth + textPadding * 2 + 4, // 增加4px宽度
        textHeight + textPadding * 2,
        5 // 5px圆角
      );
      ctx.fill();

      // 绘制角度文字
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillText(`${angle}°`, textX, textY);
    }

    // 绘制圆心
    ctx.beginPath();
    ctx.arc(controllerX, controllerY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fill();

    // 绘制可拖拽的小十字
    const crossSize = 8; // 十字大小
    const crossDistance = controllerRadius - 20; // 十字距离圆心的距离
    
    // 根据当前角度计算十字位置
    // CSS渐变角度0deg在正上，需要转换为数学坐标系
    const currentAngleRad = ((this.linearData.angle - 90) * Math.PI) / 180;
    const crossX = controllerX + Math.cos(currentAngleRad) * crossDistance;
    const crossY = controllerY + Math.sin(currentAngleRad) * crossDistance;

    // 绘制十字
    ctx.strokeStyle = "rgba(52, 152, 219, 0.9)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    
    // 水平线
    ctx.beginPath();
    ctx.moveTo(crossX - crossSize, crossY);
    ctx.lineTo(crossX + crossSize, crossY);
    ctx.stroke();
    
    // 垂直线
    ctx.beginPath();
    ctx.moveTo(crossX, crossY - crossSize);
    ctx.lineTo(crossX, crossY + crossSize);
    ctx.stroke();

    // 绘制十字中心点
    ctx.fillStyle = "rgba(52, 152, 219, 0.9)";
    ctx.beginPath();
    ctx.arc(crossX, crossY, 3, 0, 2 * Math.PI);
    ctx.fill();

    // 恢复状态
    ctx.restore();

    // 保存控制器信息用于交互
    this.angleController = {
      x: controllerX,
      y: controllerY,
      radius: controllerRadius,
      crossX: crossX,
      crossY: crossY,
    };
  }

  startAngleAdjustment(e) {
    this.isAdjustingAngle = true;
    this.adjustAngle(e);
    
    // 绑定鼠标移动和松开事件
    const handleMouseMove = (e) => {
      if (this.isAdjustingAngle) {
        this.adjustAngle(e);
      }
    };
    
    const handleMouseUp = () => {
      this.isAdjustingAngle = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  adjustAngle(e) {
    if (!this.angleController) return;
    
    const canvas = this.canvases["linear-canvas"];
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 计算鼠标相对于圆心的角度
    const dx = mouseX - this.angleController.x;
    const dy = mouseY - this.angleController.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    
    // 转换为CSS渐变角度：0deg在正上，180deg在正下
    let newAngle = angle + 90; // 加上90度，转换为CSS渐变角度
    if (newAngle < 0) newAngle += 360;
    if (newAngle >= 360) newAngle -= 360;
    
    // 更新角度
    this.linearData.angle = newAngle;
    
    // 重新渲染
    this.renderLinear();
    this.updateLinearCSS();
  }



  renderRadial() {
    const canvas = this.canvases["radial-canvas"];
    const ctx = this.ctxs["radial-canvas"];
    const width = canvas.width / this.dpr;
    const height = canvas.height / this.dpr;

    ctx.clearRect(0, 0, width, height);

    // 创建径向渐变
    const centerX = this.radialData.center.x * width;
    const centerY = this.radialData.center.y * height;
    const radiusX = (this.radialData.size.x / 100) * Math.min(width, height) * 0.8;
    const radiusY = (this.radialData.size.y / 100) * Math.min(width, height) * 0.8;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(radiusX, radiusY));

    // 添加色标
    this.radialData.colorStops.forEach((stop) => {
      gradient.addColorStop(stop.position / 100, stop.color);
    });

    // 绘制渐变
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 更新控制点位置
    this.updateRadialControls();
  }

  renderConic() {
    const canvas = this.canvases["conic-canvas"];
    const ctx = this.ctxs["conic-canvas"];
    const width = canvas.width / this.dpr;
    const height = canvas.height / this.dpr;

    ctx.clearRect(0, 0, width, height);

    // 创建锥形渐变（使用Canvas绘制）
    const centerX = this.conicData.center.x * width;
    const centerY = this.conicData.center.y * height;
    const radius = Math.min(width, height) * 0.4;

    // 绘制锥形渐变
    for (let angle = 0; angle < 360; angle += 1) {
      const color = this.getColorAtConicAngle(angle);
      const angleRad = (angle * Math.PI) / 180;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angleRad);

      const gradient = ctx.createLinearGradient(0, 0, radius, 0);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, -1, radius, 2);

      ctx.restore();
    }

    // 更新控制点位置
    this.updateConicControls();
  }

  renderAll() {
    this.renderLinear();
    this.renderRadial();
    this.renderConic();

    this.updateRadialControls();
    this.updateConicControls();
    this.updateLinearColorStops();
    this.updateRadialColorStops();
    this.updateConicColorStops();

    this.updateLinearCSS();
    this.updateRadialCSS();
    this.updateConicCSS();

    // 如果警告正在显示，重新渲染警告
    if (this.warning.isShowing) {
      this.renderWarning();
    }
  }



  updateRadialControls() {
    const canvas = this.canvases["radial-canvas"];
    const rect = canvas.getBoundingClientRect();
    const center = document.getElementById("radial-center");
    const sizeIndicator = document.getElementById("radial-size-indicator");
    const sizeHandles = document.querySelectorAll('[id^="radial-size-handle"]');

    const centerX = this.radialData.center.x * rect.width;
    const centerY = this.radialData.center.y * rect.height;
    const radiusX = (this.radialData.size.x / 100) * Math.min(rect.width, rect.height) * 0.8;
    const radiusY = (this.radialData.size.y / 100) * Math.min(rect.width, rect.height) * 0.8;

    center.style.left = `${centerX}px`;
    center.style.top = `${centerY}px`;

    sizeIndicator.style.left = `${centerX - radiusX}px`;
    sizeIndicator.style.top = `${centerY - radiusY}px`;
    sizeIndicator.style.width = `${radiusX * 2}px`;
    sizeIndicator.style.height = `${radiusY * 2}px`;

    // 更新尺寸控制点
    const positions = [
      { x: centerX, y: centerY - radiusY }, // 上
      { x: centerX + radiusX, y: centerY }, // 右
      { x: centerX, y: centerY + radiusY }, // 下
      { x: centerX - radiusX, y: centerY }, // 左
    ];

    sizeHandles.forEach((handle, index) => {
      handle.style.left = `${positions[index].x}px`;
      handle.style.top = `${positions[index].y}px`;
    });
  }

  updateConicControls() {
    const canvas = this.canvases["conic-canvas"];
    const rect = canvas.getBoundingClientRect();
    const center = document.getElementById("conic-center");
    const angleIndicator = document.getElementById("conic-angle-indicator");
    const angleHandle = document.getElementById("conic-angle-handle");

    const centerX = this.conicData.center.x * rect.width;
    const centerY = this.conicData.center.y * rect.height;
    const radius = Math.min(rect.width, rect.height) * 0.3;

    center.style.left = `${centerX}px`;
    center.style.top = `${centerY}px`;

    const angleRad = (this.conicData.startAngle * Math.PI) / 180;
    const handleX = centerX + Math.cos(angleRad) * radius;
    const handleY = centerY + Math.sin(angleRad) * radius;

    angleIndicator.style.left = `${centerX}px`;
    angleIndicator.style.top = `${centerY}px`;
    angleIndicator.style.width = `${radius}px`;
    angleIndicator.style.transform = `rotate(${this.conicData.startAngle}deg)`;
    angleIndicator.style.transformOrigin = "0 50%";

    angleHandle.style.left = `${handleX}px`;
    angleHandle.style.top = `${handleY}px`;
  }

  updateLinearColorStops() {
    const overlay = document.getElementById("linear-overlay");
    const existingStops = overlay.querySelectorAll(".canvas-color-stop");
    existingStops.forEach((stop) => stop.remove());

    this.linearData.colorStops.forEach((stop, index) => {
      const stopElement = document.createElement("div");
      stopElement.className = "canvas-color-stop";
      stopElement.dataset.position = stop.position;
      stopElement.style.backgroundColor = stop.color;

      // 计算色标位置（在色带下方10px处）
      const canvas = this.canvases["linear-canvas"];
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / (canvas.width / this.dpr);
      const scaleY = rect.height / (canvas.height / this.dpr);

      const gradientScreenX = this.linearGradientRect.x * scaleX;
      const gradientScreenY = this.linearGradientRect.y * scaleY;
      const gradientScreenWidth = this.linearGradientRect.width * scaleX;
      const gradientScreenHeight = this.linearGradientRect.height * scaleY;

      const stopX = gradientScreenX + (stop.position / 100) * gradientScreenWidth;
      const stopY = gradientScreenY + gradientScreenHeight + 10; // 色带下边界再向下10px

      stopElement.style.left = `${stopX}px`;
      stopElement.style.top = `${stopY}px`;

      stopElement.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        this.startLinearColorStopDrag(stop, e);
      });

      // 点击选择色标
      stopElement.addEventListener("click", (e) => {
        this.selectLinearColorStop(stopElement);
      });

      overlay.appendChild(stopElement);
    });
  }

  // CSS代码生成
  generateLinearGradientCSS() {
    const stops = this.linearData.colorStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ");

    return `linear-gradient(${this.linearData.angle}deg, ${stops})`;
  }

  generateLinearGradientCSSHighlighted() {
    const stops = this.linearData.colorStops.map((stop) => `${stop.color} ${stop.position.toFixed(1)}`).join(", ");

    return `<span class="css-function">linear-gradient</span><span class="css-bracket">(</span><span class="css-number">${this.linearData.angle.toFixed(
      1
    )}</span><span class="css-unit">deg</span><span class="css-comma">,</span> ${stops
      .split(",")
      .map((stop) => {
        const parts = stop.trim().split(" ");
        if (parts[0].startsWith("#")) {
          return `<span class="css-hash">#</span><span class="css-number">${parts[0].slice(1)}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
        } else if (parts[0].startsWith("rgb")) {
          return `<span class="css-bracket">${parts[0]}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
        } else {
          return `<span class="css-bracket">${parts[0]}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
        }
      })
      .join('<span class="css-comma">,</span> ')}<span class="css-bracket">)</span>`;
  }

  generateRadialGradientCSS() {
    const centerX = this.radialData.center.x * 100;
    const centerY = this.radialData.center.y * 100;
    const sizeX = this.radialData.size.x;
    const sizeY = this.radialData.size.y;
    const unit = this.radialData.sizeUnit;

    const stops = this.radialData.colorStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ");

    if (this.radialData.shape === "circle") {
      return `radial-gradient(circle ${sizeX}${unit} at ${centerX}% ${centerY}%, ${stops})`;
    } else {
      return `radial-gradient(ellipse ${sizeX}${unit} ${sizeY}${unit} at ${centerX}% ${centerY}%, ${stops})`;
    }
  }

  generateRadialGradientCSSHighlighted() {
    const centerX = this.radialData.center.x * 100;
    const centerY = this.radialData.center.y * 100;
    const sizeX = this.radialData.size.x;
    const sizeY = this.radialData.size.y;
    const unit = this.radialData.sizeUnit;

    const stops = this.radialData.colorStops.map((stop) => `${stop.color} ${stop.position.toFixed(1)}`).join(", ");

    if (this.radialData.shape === "circle") {
      return `<span class="css-function">radial-gradient</span><span class="css-bracket">(</span><span class="css-bracket">circle</span> <span class="css-number">${sizeX.toFixed(
        1
      )}</span><span class="css-unit">${unit}</span> <span class="css-bracket">at</span> <span class="css-number">${centerX.toFixed(
        1
      )}</span><span class="css-unit">%</span> <span class="css-number">${centerY.toFixed(
        1
      )}</span><span class="css-unit">%</span><span class="css-comma">,</span> ${stops
        .split(",")
        .map((stop) => {
          const parts = stop.trim().split(" ");
          if (parts[0].startsWith("#")) {
            return `<span class="css-hash">#</span><span class="css-number">${parts[0].slice(1)}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
          } else {
            return `<span class="css-bracket">${parts[0]}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
          }
        })
        .join('<span class="css-comma">,</span> ')}<span class="css-bracket">)</span>`;
    } else {
      return `<span class="css-function">radial-gradient</span><span class="css-bracket">(</span><span class="css-bracket">ellipse</span> <span class="css-number">${sizeX.toFixed(
        1
      )}</span><span class="css-unit">${unit}</span> <span class="css-number">${sizeY.toFixed(
        1
      )}</span><span class="css-unit">${unit}</span> <span class="css-bracket">at</span> <span class="css-number">${centerX.toFixed(
        1
      )}</span><span class="css-unit">%</span> <span class="css-number">${centerY.toFixed(
        1
      )}</span><span class="css-unit">%</span><span class="css-comma">,</span> ${stops
        .split(",")
        .map((stop) => {
          const parts = stop.trim().split(" ");
          if (parts[0].startsWith("#")) {
            return `<span class="css-hash">#</span><span class="css-number">${parts[0].slice(1)}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
          } else {
            return `<span class="css-bracket">${parts[0]}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
          }
        })
        .join('<span class="css-comma">,</span> ')}<span class="css-bracket">)</span>`;
    }
  }

  generateConicGradientCSS() {
    const centerX = this.conicData.center.x * 100;
    const centerY = this.conicData.center.y * 100;
    const startAngle = this.conicData.startAngle;

    const stops = this.conicData.colorStops.map((stop) => `${stop.color} ${stop.position}deg`).join(", ");

    return `conic-gradient(from ${startAngle}deg at ${centerX}% ${centerY}%, ${stops})`;
  }

  generateConicGradientCSSHighlighted() {
    const centerX = this.conicData.center.x * 100;
    const centerY = this.conicData.center.y * 100;
    const startAngle = this.conicData.startAngle;

    const stops = this.conicData.colorStops.map((stop) => `${stop.color} ${stop.position.toFixed(1)}`).join(", ");

    return `<span class="css-function">conic-gradient</span><span class="css-bracket">(</span><span class="css-bracket">from</span> <span class="css-number">${startAngle.toFixed(
      1
    )}</span><span class="css-unit">deg</span> <span class="css-bracket">at</span> <span class="css-number">${centerX.toFixed(
      1
    )}</span><span class="css-unit">%</span> <span class="css-number">${centerY.toFixed(
      1
    )}</span><span class="css-unit">%</span><span class="css-comma">,</span> ${stops
      .split(",")
      .map((stop) => {
        const parts = stop.trim().split(" ");
        if (parts[0].startsWith("#")) {
          return `<span class="css-hash">#</span><span class="css-number">${parts[0].slice(1)}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">deg</span>`;
        } else {
          return `<span class="css-bracket">${parts[0]}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">deg</span>`;
        }
      })
      .join('<span class="css-comma">,</span> ')}<span class="css-bracket">)</span>`;
  }

  updateLinearCSS() {
    const cssElement = document.getElementById("linear-css");
    cssElement.innerHTML = this.generateLinearGradientCSSHighlighted();
  }

  updateRadialCSS() {
    const cssElement = document.getElementById("radial-css");
    cssElement.innerHTML = this.generateRadialGradientCSSHighlighted();
  }

  updateConicCSS() {
    const cssElement = document.getElementById("conic-css");
    cssElement.innerHTML = this.generateConicGradientCSSHighlighted();
  }

  updateRadialData() {
    this.radialData.shape = document.querySelector('input[name="radial-shape"]:checked').value;
    this.radialData.sizeKeyword = document.querySelector('input[name="radial-size"]:checked').value;
  }

  // 辅助方法
  getColorAtLinearPosition(position) {
    // 根据位置在色标之间插值计算颜色
    const stops = this.linearData.colorStops;
    if (stops.length === 0) return "#000000";
    if (stops.length === 1) return stops[0].color;

    // 找到位置所在的色标区间
    for (let i = 0; i < stops.length - 1; i++) {
      const current = stops[i];
      const next = stops[i + 1];

      if (position >= current.position && position <= next.position) {
        const ratio = (position - current.position) / (next.position - current.position);
        return this.interpolateColor(current.color, next.color, ratio);
      }
    }

    // 如果位置超出范围，返回最近的色标颜色
    if (position <= stops[0].position) return stops[0].color;
    return stops[stops.length - 1].color;
  }

  interpolateColor(color1, color2, ratio) {
    // 简化的颜色插值，支持hex颜色
    if (color1.startsWith("#") && color2.startsWith("#")) {
      const r1 = parseInt(color1.slice(1, 3), 16);
      const g1 = parseInt(color1.slice(3, 5), 16);
      const b1 = parseInt(color1.slice(5, 7), 16);

      const r2 = parseInt(color2.slice(1, 3), 16);
      const g2 = parseInt(color2.slice(3, 5), 16);
      const b2 = parseInt(color2.slice(5, 7), 16);

      const r = Math.round(r1 + (r2 - r1) * ratio);
      const g = Math.round(g1 + (g2 - g1) * ratio);
      const b = Math.round(b1 + (b2 - b1) * ratio);

      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }

    // 对于其他颜色格式，返回第一个颜色
    return color1;
  }

  getColorAtRadialPosition(position) {
    // 简化的颜色获取，实际应该从Canvas中采样
    const hue = (position / 100) * 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  getColorAtConicAngle(angle) {
    // 简化的颜色获取，实际应该从Canvas中采样
    const hue = angle;
    return `hsl(${hue}, 70%, 50%)`;
  }

  openColorPicker(colorStop) {
    this.currentColorStop = colorStop;
    this.originalColor = colorStop.color; // 保存原始颜色
    this.showColorPicker(colorStop.color);
  }

  // 获取色标位置并计算拾色器位置
  getColorPickerPosition(colorStop) {
    const canvas = this.canvases[`${this.currentType}-canvas`];
    const rect = canvas.getBoundingClientRect();
    
    let stopX, stopY;
    let gradientBottomY = 0; // 色带下边界位置
    
    if (this.currentType === "linear") {
      // 线性渐变色标位置
      const scaleX = rect.width / (canvas.width / this.dpr);
      const scaleY = rect.height / (canvas.height / this.dpr);
      const gradientScreenX = this.linearGradientRect.x * scaleX;
      const gradientScreenY = this.linearGradientRect.y * scaleY;
      const gradientScreenWidth = this.linearGradientRect.width * scaleX;
      const gradientScreenHeight = this.linearGradientRect.height * scaleY;
      
      stopX = gradientScreenX + (colorStop.position / 100) * gradientScreenWidth;
      stopY = gradientScreenY + gradientScreenHeight + 10;
      gradientBottomY = gradientScreenY + gradientScreenHeight; // 色带下边界
    } else if (this.currentType === "radial") {
      // 径向渐变色标位置
      const centerX = this.radialData.center.x * rect.width;
      const centerY = this.radialData.center.y * rect.height;
      const radius = (colorStop.position / 100) * Math.min(rect.width, rect.height) * 0.4;
      
      stopX = centerX + radius;
      stopY = centerY;
      gradientBottomY = rect.height; // 对于径向渐变，使用Canvas底部作为参考
    } else if (this.currentType === "conic") {
      // 锥形渐变色标位置
      const centerX = this.conicData.center.x * rect.width;
      const centerY = this.conicData.center.y * rect.height;
      const radius = Math.min(rect.width, rect.height) * 0.3;
      const angleRad = (colorStop.position * Math.PI) / 180;
      
      stopX = centerX + Math.cos(angleRad) * radius;
      stopY = centerY + Math.sin(angleRad) * radius;
      gradientBottomY = rect.height; // 对于锥形渐变，使用Canvas底部作为参考
    }
    
    // 计算拾色器位置
    const pickerWidth = 320; // 拾色器宽度
    const pickerHeight = 280; // 拾色器高度
    
    // 水平位置：屏幕正中间
    const pickerX = (window.innerWidth - pickerWidth) / 2;
    
    // 垂直位置：拾色器下边界与色带下边界一致
    const pickerY = gradientBottomY - pickerHeight;
    
    // 调整Y位置，确保不超出屏幕
    let finalPickerY = pickerY;
    if (finalPickerY < 10) {
      finalPickerY = 10;
    } else if (finalPickerY + pickerHeight > window.innerHeight - 10) {
      finalPickerY = window.innerHeight - pickerHeight - 10;
    }
    
    return { x: pickerX, y: finalPickerY };
  }

  showColorPicker(initialColor) {
    const overlay = document.getElementById("color-picker-overlay");
    const picker = document.querySelector(".color-picker");
    const colorWheel = document.getElementById("color-wheel");
    const colorWheelCursor = document.getElementById("color-wheel-cursor");
    const brightnessSlider = document.getElementById("brightness-slider");
    const alphaSlider = document.getElementById("alpha-slider");
    const brightnessValue = document.getElementById("brightness-value");
    const alphaValue = document.getElementById("alpha-value");
    const hslInput = document.getElementById("hsl-input");

    // 解析初始颜色
    const color = this.parseColor(initialColor);
    this.currentRGB = { r: color.r, g: color.g, b: color.b, a: color.a || 255 };

    // 初始化色盘
    this.initColorWheel(colorWheel);

    // 设置滑块值
    const hsl = this.rgbToHSL(this.currentRGB.r, this.currentRGB.g, this.currentRGB.b);
    brightnessSlider.value = hsl.l;
    alphaSlider.value = this.currentRGB.a;

    // 更新色盘光标位置
    this.updateColorWheelCursor(colorWheel, colorWheelCursor, hsl.h, hsl.s);

    // 更新显示
    this.updateColorPickerDisplay();

    // 计算拾色器位置
    const position = this.getColorPickerPosition(this.currentColorStop);
    
    // 设置拾色器位置
    picker.style.position = "fixed";
    picker.style.left = `${position.x}px`;
    picker.style.top = `${position.y}px`;
    picker.style.transform = "scale(0.8)";
    picker.style.zIndex = "1001";

    // 显示拾色器
    overlay.classList.add("show");

    // 设置拖拽功能
    this.setupColorPickerDrag();

    // 只在第一次初始化事件监听器
    if (!this.colorPickerInitialized) {
      // 色盘事件
      colorWheel.addEventListener("mousedown", (e) => {
        this.handleColorWheelClick(e, colorWheel, colorWheelCursor, brightnessSlider);
        
        // 添加拖拽功能
        const handleMouseMove = (e) => {
          this.handleColorWheelClick(e, colorWheel, colorWheelCursor, brightnessSlider);
        };
        
        const handleMouseUp = () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };
        
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      });

      // 亮度滑块事件
      brightnessSlider.addEventListener("input", () => {
        this.updateColorFromWheel(colorWheel, colorWheelCursor, brightnessSlider);
        brightnessValue.textContent = brightnessSlider.value;
      });

      // 透明度滑块事件
      alphaSlider.addEventListener("input", () => {
        this.currentRGB.a = parseInt(alphaSlider.value);
        alphaValue.textContent = alphaSlider.value;
        this.updateColorPickerDisplay();
        this.updateCurrentColorStop();
      });

      // 输入框事件

      // RGB输入框事件
      const rgbRInput = document.getElementById("rgb-r-input");
      const rgbGInput = document.getElementById("rgb-g-input");
      const rgbBInput = document.getElementById("rgb-b-input");

      const updateRGBFromInputs = () => {
        const r = parseInt(rgbRInput.value) || 0;
        const g = parseInt(rgbGInput.value) || 0;
        const b = parseInt(rgbBInput.value) || 0;
        
        if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
          this.currentRGB = { r, g, b, a: this.currentRGB.a };
          this.updateColorPickerDisplay();
          this.updateCurrentColorStop();
          
          // 更新色盘光标位置
          const hsl = this.rgbToHSL(r, g, b);
          this.updateColorWheelCursor(colorWheel, colorWheelCursor, hsl.h, hsl.s);
          brightnessSlider.value = hsl.l;
        }
      };

      rgbRInput.addEventListener("input", updateRGBFromInputs);
      rgbGInput.addEventListener("input", updateRGBFromInputs);
      rgbBInput.addEventListener("input", updateRGBFromInputs);

      // 16进制输入框事件
      const hexRInput = document.getElementById("hex-r-input");
      const hexGInput = document.getElementById("hex-g-input");
      const hexBInput = document.getElementById("hex-b-input");

      const updateHexFromInputs = () => {
        const r = hexRInput.value.toLowerCase();
        const g = hexGInput.value.toLowerCase();
        const b = hexBInput.value.toLowerCase();
        
        // 验证16进制格式
        const hexRegex = /^[0-9a-f]{2}$/;
        if (hexRegex.test(r) && hexRegex.test(g) && hexRegex.test(b)) {
          const hexColor = `#${r}${g}${b}`;
          const color = this.hexToRGB(hexColor);
          this.currentRGB = { ...color, a: this.currentRGB.a };
          this.updateColorPickerDisplay();
          this.updateCurrentColorStop();
          
          // 更新色盘光标位置
          const hsl = this.rgbToHSL(color.r, color.g, color.b);
          this.updateColorWheelCursor(colorWheel, colorWheelCursor, hsl.h, hsl.s);
          brightnessSlider.value = hsl.l;
        }
      };

      hexRInput.addEventListener("input", updateHexFromInputs);
      hexGInput.addEventListener("input", updateHexFromInputs);
      hexBInput.addEventListener("input", updateHexFromInputs);

      hslInput.addEventListener("input", (e) => {
        const hsl = e.target.value;
        const match = hsl.match(/(\d+),\s*(\d+)%,\s*(\d+)%/);
        if (match) {
          const h = parseInt(match[1]);
          const s = parseInt(match[2]);
          const l = parseInt(match[3]);
          const color = this.hslToRGB(h, s, l);
          this.currentRGB = { ...color, a: this.currentRGB.a };
          this.updateColorPickerDisplay();
          this.updateCurrentColorStop();
          
          // 更新色盘光标位置
          this.updateColorWheelCursor(colorWheel, colorWheelCursor, h, s);
          brightnessSlider.value = l;
        }
      });

      // 按钮事件
      document.getElementById("color-picker-apply").addEventListener("click", () => {
        this.hideColorPicker();
      });

      document.getElementById("color-picker-cancel").addEventListener("click", () => {
        // 恢复原始颜色
        this.currentColorStop.color = this.originalColor;
        this.renderAll();
        this.hideColorPicker();
      });

      document.getElementById("color-picker-close").addEventListener("click", () => {
        // 恢复原始颜色
        this.currentColorStop.color = this.originalColor;
        this.renderAll();
        this.hideColorPicker();
      });

      // 点击遮罩关闭
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          // 恢复原始颜色
          this.currentColorStop.color = this.originalColor;
          this.renderAll();
          this.hideColorPicker();
        }
              });

        this.colorPickerInitialized = true;
    }
  }

  hideColorPicker() {
    const overlay = document.getElementById("color-picker-overlay");
    const picker = document.querySelector(".color-picker");
    overlay.classList.remove("show");
    
    // 保持拾色器位置不变，只隐藏遮罩
    // 不重置位置，避免突然跳到左上角
  }

  setupColorPickerDrag() {
    const picker = document.querySelector(".color-picker");
    const dragHandle = document.getElementById("color-picker-drag-handle");
    const header = document.querySelector(".color-picker-header");
    
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    const startDrag = (e) => {
      e.preventDefault();
      isDragging = true;
      
      const rect = picker.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      
      picker.style.transition = "none";
      document.body.style.cursor = "move";
      document.body.style.userSelect = "none";
    };

    const handleDrag = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newLeft = startLeft + deltaX;
      const newTop = startTop + deltaY;
      
      // 确保拾色器不会完全移出屏幕
      const pickerRect = picker.getBoundingClientRect();
      const maxLeft = window.innerWidth - pickerRect.width;
      const maxTop = window.innerHeight - pickerRect.height;
      
      const clampedLeft = Math.max(0, Math.min(newLeft, maxLeft));
      const clampedTop = Math.max(0, Math.min(newTop, maxTop));
      
      picker.style.left = `${clampedLeft}px`;
      picker.style.top = `${clampedTop}px`;
    };

    const stopDrag = () => {
      if (!isDragging) return;
      
      isDragging = false;
      picker.style.transition = "";
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    // 绑定事件监听器
    dragHandle.addEventListener("mousedown", startDrag);
    header.addEventListener("mousedown", startDrag);
    
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", stopDrag);
    
    // 防止拖拽时触发其他事件
    dragHandle.addEventListener("click", (e) => e.stopPropagation());
    header.addEventListener("click", (e) => e.stopPropagation());
  }

  updateColorPickerDisplay() {
    const brightnessValue = document.getElementById("brightness-value");
    const alphaValue = document.getElementById("alpha-value");
    const hexRInput = document.getElementById("hex-r-input");
    const hexGInput = document.getElementById("hex-g-input");
    const hexBInput = document.getElementById("hex-b-input");
    const rgbRInput = document.getElementById("rgb-r-input");
    const rgbGInput = document.getElementById("rgb-g-input");
    const rgbBInput = document.getElementById("rgb-b-input");
    const hslInput = document.getElementById("hsl-input");

    const { r, g, b, a } = this.currentRGB;
    const hexColor = this.rgbToHex(r, g, b);
    const hslColor = this.rgbToHSL(r, g, b);

    // 更新滑块值显示
    brightnessValue.textContent = hslColor.l;
    alphaValue.textContent = a;

    // 更新输入框（使用value属性，因为它们是input元素）
    if (a === 255) {
      // 不透明度为255时，不显示透明度
      hexRInput.value = hexColor.slice(1, 3);
      hexGInput.value = hexColor.slice(3, 5);
      hexBInput.value = hexColor.slice(5, 7);
      rgbRInput.value = r;
      rgbGInput.value = g;
      rgbBInput.value = b;
    } else {
      // 显示透明度
      const hexWithAlpha = this.rgbaToHex(r, g, b, a);
      hexRInput.value = hexWithAlpha.slice(1, 3);
      hexGInput.value = hexWithAlpha.slice(3, 5);
      hexBInput.value = hexWithAlpha.slice(5, 7);
      rgbRInput.value = r;
      rgbGInput.value = g;
      rgbBInput.value = b;
    }

    hslInput.value = `${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%`;
  }

  // 初始化色盘
  initColorWheel(canvas) {
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // 绘制色盘
    for (let angle = 0; angle < 360; angle += 1) {
      for (let saturation = 0; saturation <= radius; saturation += 1) {
        const hue = angle;
        const sat = (saturation / radius) * 100;
        const lightness = 50; // 固定亮度为50%

        const color = this.hslToRGB(hue, sat, lightness);
        const x = centerX + Math.cos((angle * Math.PI) / 180) * saturation;
        const y = centerY + Math.sin((angle * Math.PI) / 180) * saturation;

        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // 处理色盘点击
  handleColorWheelClick(e, canvas, cursor, brightnessSlider) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= radius) {
      const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
      const saturation = Math.min(100, (distance / radius) * 100);
      
      // 更新光标位置
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      
      // 更新颜色
      const lightness = parseInt(brightnessSlider.value);
      const color = this.hslToRGB(angle, saturation, lightness);
      this.currentRGB = { ...color, a: this.currentRGB.a };
      
      this.updateColorPickerDisplay();
      this.updateCurrentColorStop();
    }
  }

  // 从色盘更新颜色
  updateColorFromWheel(canvas, cursor, brightnessSlider) {
    const rect = canvas.getBoundingClientRect();
    const cursorLeft = parseFloat(cursor.style.left);
    const cursorTop = parseFloat(cursor.style.top);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    const dx = cursorLeft - centerX;
    const dy = cursorTop - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
    const saturation = Math.min(100, (distance / radius) * 100);
    const lightness = parseInt(brightnessSlider.value);
    
    const color = this.hslToRGB(angle, saturation, lightness);
    this.currentRGB = { ...color, a: this.currentRGB.a };
    
    this.updateColorPickerDisplay();
    this.updateCurrentColorStop();
  }

  // 更新色盘光标位置
  updateColorWheelCursor(canvas, cursor, hue, saturation) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    const distance = (saturation / 100) * radius;
    const angleRad = (hue * Math.PI) / 180;
    
    const x = centerX + Math.cos(angleRad) * distance;
    const y = centerY + Math.sin(angleRad) * distance;
    
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  }

  // 更新当前色标颜色
  updateCurrentColorStop() {
    if (this.currentColorStop) {
      const hexColor = this.rgbToHex(this.currentRGB.r, this.currentRGB.g, this.currentRGB.b);
      this.currentColorStop.color = hexColor;
      this.renderAll();
    }
  }

  parseColor(color) {
    if (color.startsWith("#")) {
      return this.hexToRGB(color);
    } else if (color.startsWith("rgba")) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a = match[4] ? Math.round(parseFloat(match[4]) * 255) : 255;
        return { r, g, b, a };
      }
    } else if (color.startsWith("rgb")) {
      const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return { r, g, b, a: 255 };
      }
    } else if (color.startsWith("hsl")) {
      const match = color.match(/(\d+),\s*(\d+)%,\s*(\d+)%/);
      if (match) {
        const h = parseInt(match[1]);
        const s = parseInt(match[2]);
        const l = parseInt(match[3]);
        const rgb = this.hslToRGB(h, s, l);
        return { ...rgb, a: 255 };
      }
    }
    return { r: 255, g: 0, b: 0, a: 255 };
  }

  hexToRGB(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  rgbaToHex(r, g, b, a) {
    const toHex = (n) => {
      const hex = n.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
  }

  rgbToHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  // 别名方法，保持兼容性
  hslToRGB(h, s, l) {
    return this.hslToRgb(h, s, l);
  }

  rgbToHex(r, g, b) {
    const toHex = (n) => {
      const hex = n.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  hslToRGB(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  startLinearColorStopDrag(stop, e) {
    // 色标拖拽逻辑
    this.isDraggingColorStop = true; // 设置拖拽状态
    const canvas = this.canvases["linear-canvas"];
    const rect = canvas.getBoundingClientRect();
    const stopElement = e.target;
    const startY = e.clientY;
    const stopRect = stopElement.getBoundingClientRect();
    const stopTop = stopRect.top;
    const stopBottom = stopRect.bottom;
    let isDraggingUp = false;
    let isDraggingDown = false;
    let isInDeleteZone = false;

    const handleMouseMove = (e) => {
      const currentY = e.clientY;
      const deltaY = currentY - startY;

      // 检查是否向上或向下拖拽超过50px
      if (currentY < stopTop - 50) {
        // 向上拖拽超过50px
        if (!isDraggingUp) {
          isDraggingUp = true;
          stopElement.classList.add("dragging-down");
        }
        if (!isInDeleteZone) {
          isInDeleteZone = true;
          stopElement.classList.add("delete-zone");
        }
      } else if (currentY > stopBottom + 50) {
        // 向下拖拽超过50px
        if (!isDraggingDown) {
          isDraggingDown = true;
          stopElement.classList.add("dragging-down");
        }
        if (!isInDeleteZone) {
          isInDeleteZone = true;
          stopElement.classList.add("delete-zone");
        }
      } else {
        // 在50px范围内，移除拖拽和删除状态
        if (isDraggingUp || isDraggingDown) {
          isDraggingUp = false;
          isDraggingDown = false;
          stopElement.classList.remove("dragging-down");
        }
        if (isInDeleteZone) {
          isInDeleteZone = false;
          stopElement.classList.remove("delete-zone");
        }
      }

      // 水平拖拽调整位置
      const scaleX = rect.width / (canvas.width / this.dpr);
      const gradientScreenX = this.linearGradientRect.x * scaleX;
      const gradientScreenWidth = this.linearGradientRect.width * scaleX;

      const clickX = e.clientX - rect.left;
      const relativeX = (clickX - gradientScreenX) / gradientScreenWidth;
      stop.position = Math.max(0, Math.min(100, relativeX * 100));

      this.linearData.colorStops.sort((a, b) => a.position - b.position);
      this.renderLinear();
      this.updateLinearColorStops();
      this.updateLinearCSS();
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // 移除拖拽样式
      stopElement.classList.remove("dragging-down", "delete-zone");

      // 清除拖拽状态
      this.isDraggingColorStop = false;

      // 如果在删除区域释放，则删除色标
      if (isInDeleteZone) {
        if (this.linearData.colorStops.length <= 2) {
          // 如果只剩两个色标且在删除区域释放，清空上一次警告并立刻开始新警告
          if (this.warning.isShowing) {
            this.warning.isShowing = false;
            this.renderAll();
          }
          this.showWarning("至少需要保留两个色标");
        } else {
          const index = this.linearData.colorStops.indexOf(stop);
          if (index !== -1) {
            this.removeLinearColorStop(index);
          }
        }
      }
      // 如果不在删除区域释放，什么都不做
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  startRadialColorStopDrag(stop, e) {
    this.isDraggingColorStop = true; // 设置拖拽状态
    const canvas = this.canvases["radial-canvas"];
    const rect = canvas.getBoundingClientRect();
    const stopElement = e.target;
    const startY = e.clientY;
    const stopRect = stopElement.getBoundingClientRect();
    const stopTop = stopRect.top;
    const stopBottom = stopRect.bottom;
    let isDraggingUp = false;
    let isDraggingDown = false;
    let isInDeleteZone = false;

    const handleMouseMove = (e) => {
      const currentY = e.clientY;
      const deltaY = currentY - startY;

      // 检查是否向上或向下拖拽超过50px
      if (currentY < stopTop - 50) {
        // 向上拖拽超过50px
        if (!isDraggingUp) {
          isDraggingUp = true;
          stopElement.classList.add("dragging-down");
        }
        if (!isInDeleteZone) {
          isInDeleteZone = true;
          stopElement.classList.add("delete-zone");
        }
      } else if (currentY > stopBottom + 50) {
        // 向下拖拽超过50px
        if (!isDraggingDown) {
          isDraggingDown = true;
          stopElement.classList.add("dragging-down");
        }
        if (!isInDeleteZone) {
          isInDeleteZone = true;
          stopElement.classList.add("delete-zone");
        }
      } else {
        // 在50px范围内，移除拖拽和删除状态
        if (isDraggingUp || isDraggingDown) {
          isDraggingUp = false;
          isDraggingDown = false;
          stopElement.classList.remove("dragging-down");
        }
        if (isInDeleteZone) {
          isInDeleteZone = false;
          stopElement.classList.remove("delete-zone");
        }
      }

      // 径向拖拽调整位置
      const centerX = this.radialData.center.x * rect.width;
      const centerY = this.radialData.center.y * rect.height;
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const dx = clickX - centerX;
      const dy = clickY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxRadius = Math.min(rect.width, rect.height) * 0.4;

      stop.position = Math.max(0, Math.min(100, (distance / maxRadius) * 100));

      this.radialData.colorStops.sort((a, b) => a.position - b.position);
      this.renderRadial();
      this.updateRadialColorStops();
      this.updateRadialCSS();
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // 移除拖拽样式
      stopElement.classList.remove("dragging-down", "delete-zone");

      // 清除拖拽状态
      this.isDraggingColorStop = false;

      // 如果在删除区域释放，则删除色标
      if (isInDeleteZone) {
        if (this.radialData.colorStops.length <= 2) {
          // 如果只剩两个色标且在删除区域释放，清空上一次警告并立刻开始新警告
          if (this.warning.isShowing) {
            this.warning.isShowing = false;
            this.renderAll();
          }
          this.showWarning("至少需要保留两个色标");
        } else {
          const index = this.radialData.colorStops.indexOf(stop);
          if (index !== -1) {
            this.removeRadialColorStop(index);
          }
        }
      }
      // 如果不在删除区域释放，什么都不做
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  startConicColorStopDrag(stop, e) {
    this.isDraggingColorStop = true; // 设置拖拽状态
    const canvas = this.canvases["conic-canvas"];
    const rect = canvas.getBoundingClientRect();
    const stopElement = e.target;
    const startY = e.clientY;
    const stopRect = stopElement.getBoundingClientRect();
    const stopTop = stopRect.top;
    const stopBottom = stopRect.bottom;
    let isDraggingUp = false;
    let isDraggingDown = false;
    let isInDeleteZone = false;

    const handleMouseMove = (e) => {
      const currentY = e.clientY;
      const deltaY = currentY - startY;

      // 检查是否向上或向下拖拽超过50px
      if (currentY < stopTop - 50) {
        // 向上拖拽超过50px
        if (!isDraggingUp) {
          isDraggingUp = true;
          stopElement.classList.add("dragging-down");
        }
        if (!isInDeleteZone) {
          isInDeleteZone = true;
          stopElement.classList.add("delete-zone");
        }
      } else if (currentY > stopBottom + 50) {
        // 向下拖拽超过50px
        if (!isDraggingDown) {
          isDraggingDown = true;
          stopElement.classList.add("dragging-down");
        }
        if (!isInDeleteZone) {
          isInDeleteZone = true;
          stopElement.classList.add("delete-zone");
        }
      } else {
        // 在50px范围内，移除拖拽和删除状态
        if (isDraggingUp || isDraggingDown) {
          isDraggingUp = false;
          isDraggingDown = false;
          stopElement.classList.remove("dragging-down");
        }
        if (isInDeleteZone) {
          isInDeleteZone = false;
          stopElement.classList.remove("delete-zone");
        }
      }

      // 锥形拖拽调整角度
      const centerX = this.conicData.center.x * rect.width;
      const centerY = this.conicData.center.y * rect.height;
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const dx = clickX - centerX;
      const dy = clickY - centerY;
      const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;

      stop.position = angle;

      this.conicData.colorStops.sort((a, b) => a.position - b.position);
      this.renderConic();
      this.updateConicColorStops();
      this.updateConicCSS();
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // 移除拖拽样式
      stopElement.classList.remove("dragging-down", "delete-zone");

      // 清除拖拽状态
      this.isDraggingColorStop = false;

      // 如果在删除区域释放，则删除色标
      if (isInDeleteZone) {
        if (this.conicData.colorStops.length <= 2) {
          // 如果只剩两个色标且在删除区域释放，清空上一次警告并立刻开始新警告
          if (this.warning.isShowing) {
            this.warning.isShowing = false;
            this.renderAll();
          }
          this.showWarning("至少需要保留两个色标");
        } else {
          const index = this.conicData.colorStops.indexOf(stop);
          if (index !== -1) {
            this.removeConicColorStop(index);
          }
        }
      }
      // 如果不在删除区域释放，什么都不做
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  showWarning(message) {
    // 先清除上一次的警告定时器
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
      this.warningTimeout = null;
    }
    this.warning.message = message;
    this.warning.startTime = Date.now();
    this.warning.isShowing = true;

    // 立即渲染一次警告
    this.renderWarning();

    // 设置定时器清除警告
    this.warningTimeout = setTimeout(() => {
      // 只有在不拖拽色标时才清除警告
      if (!this.isDraggingColorStop) {
        this.warning.isShowing = false;
        this.renderAll(); // 重新渲染以清除警告
      }
      this.warningTimeout = null;
    }, this.warning.duration);
  }

  renderWarning() {
    if (!this.warning.isShowing) return;

    const canvas = this.canvases[`${this.currentType}-canvas`];
    const ctx = this.ctxs[`${this.currentType}-canvas`];
    const width = canvas.width / this.dpr;
    const height = canvas.height / this.dpr;

    // 计算警告位置（色带下边缘再往下65px）
    let warningY;
    if (this.currentType === "linear" && this.linearGradientRect) {
      const rect = canvas.getBoundingClientRect();
      const scaleY = rect.height / (canvas.height / this.dpr);
      const gradientScreenY = this.linearGradientRect.y * scaleY;
      const gradientScreenHeight = this.linearGradientRect.height * scaleY;
      warningY = gradientScreenY + gradientScreenHeight + 65;
    } else {
      // 对于径向和锥形渐变，在Canvas底部显示
      warningY = height - 95;
    }

    // 计算警告显示时间
    const elapsed = Date.now() - this.warning.startTime;
    const progress = elapsed / this.warning.duration;

    // 计算透明度（淡入淡出效果）
    let alpha = 1;
    if (progress < 0.1) {
      alpha = Math.max(0.8, progress / 0.1); // 淡入，最小透明度0.8
    } else if (progress > 0.8) {
      alpha = Math.max(0.8, (1 - progress) / 0.2); // 淡出，最小透明度0.8
    }

    // 绘制警告背景
    ctx.save();
    ctx.globalAlpha = alpha;

    // 测量文本尺寸
    ctx.font = "16px Arial, sans-serif";
    const textMetrics = ctx.measureText(this.warning.message);
    const textWidth = textMetrics.width;
    const textHeight = 20;

    // 绘制背景矩形
    const padding = 10;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = textHeight + padding * 2;
    const bgX = (width - bgWidth) / 2;
    const bgY = warningY - bgHeight / 2;

    // 绘制圆角矩形背景
    ctx.fillStyle = "rgba(231, 76, 60, 0.9)";
    this.drawRoundedRect(ctx, bgX, bgY, bgWidth, bgHeight, 8);
    ctx.fill();

    // 绘制边框
    ctx.strokeStyle = "rgba(192, 57, 43, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制文本
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.warning.message, width / 2, warningY);

    ctx.restore();
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * 计算穿过(centerX, centerY)且方向为angleRad的直线与矩形边界的交点
   * @param {number} centerX 直线经过的点x
   * @param {number} centerY 直线经过的点y
   * @param {number} angleRad 直线方向，弧度
   * @param {number} rectX 矩形左上角x
   * @param {number} rectY 矩形左上角y
   * @param {number} rectW 矩形宽
   * @param {number} rectH 矩形高
   * @returns {Array<{x:number, y:number}>} 返回两个交点
   */
  getLineRectangleIntersections(centerX, centerY, angleRad, rectX, rectY, rectW, rectH) {
    const points = [];
    const dx = Math.cos(angleRad);
    const dy = Math.sin(angleRad);

    // 与上下边界的交点
    if (dy !== 0) {
      // 上边界 y = rectY
      let t = (rectY - centerY) / dy;
      let x = centerX + t * dx;
      if (x >= rectX && x <= rectX + rectW) points.push({ x, y: rectY });

      // 下边界 y = rectY + rectH
      t = (rectY + rectH - centerY) / dy;
      x = centerX + t * dx;
      if (x >= rectX && x <= rectX + rectW) points.push({ x, y: rectY + rectH });
    }

    // 与左右边界的交点
    if (dx !== 0) {
      // 左边界 x = rectX
      let t = (rectX - centerX) / dx;
      let y = centerY + t * dy;
      if (y >= rectY && y <= rectY + rectH) points.push({ x: rectX, y });

      // 右边界 x = rectX + rectW
      t = (rectX + rectW - centerX) / dx;
      y = centerY + t * dy;
      if (y >= rectY && y <= rectY + rectH) points.push({ x: rectX + rectW, y });
    }

    // 只返回距离centerX,centerY最远的两个点（防止浮点误差导致多于2个点）
    points.sort((a, b) => {
      const da = (a.x - centerX) ** 2 + (a.y - centerY) ** 2;
      const db = (b.x - centerX) ** 2 + (b.y - centerY) ** 2;
      return db - da;
    });
    return points.slice(0, 2);
  }
}

// 初始化
new GradientTutorial();
