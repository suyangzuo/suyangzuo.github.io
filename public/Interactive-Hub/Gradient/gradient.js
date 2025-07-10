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
    this.selectedColor = "#ff0000"; // 默认选中的颜色

    // 警告相关属性
    this.warning = {
      message: "",
      startTime: 0,
      duration: 2500, // 2.5秒
      isShowing: false,
    };
    this.warningTimeout = null;
    this.isDraggingColorStop = false; // 新增：标记是否正在拖拽色标

    // 颜色选择器位置记忆（相对于视口的百分比）
    this.colorPickerPosition = { x: 50, y: 50 }; // 默认屏幕正中间

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
      sizeKeyword: null, // 默认不选中任何关键字
      size: { x: 50, y: 50 },
      sizeUnit: "%",
      colorStops: [
        { position: 0, color: "#ffffff", isAboveLine: true },
        { position: 100, color: "#000000", isAboveLine: true },
      ],
      selectedStop: null,
    };

    // 椭圆和圆的独立参数存储
    this.ellipseData = {
      center: { x: 0.5, y: 0.5 },
      size: { x: 50, y: 50 }, // 椭圆：水平半径50%，垂直半径50%
      sizeUnit: "%",
      sizeKeyword: null, // 椭圆的尺寸关键字
      colorStops: [
        { position: 0, color: "#ffffff", isAboveLine: true },
        { position: 100, color: "#000000", isAboveLine: true },
      ],
    };

    this.circleData = {
      center: { x: 0.5, y: 0.5 },
      size: { x: 50, y: 50 }, // 正圆：半径50%
      sizeUnit: "%",
      sizeKeyword: null, // 正圆的尺寸关键字
      colorStops: [
        { position: 0, color: "#ffffff", isAboveLine: true },
        { position: 100, color: "#000000", isAboveLine: true },
      ],
    };

    // 角度渐变数据
    this.conicData = {
      center: { x: 0.5, y: 0.5 },
      startAngle: 0, // 默认从0°开始，控制点在圆心正上方
      colorStops: [
        { position: 0, color: "#2481db" },
        { position: 90, color: "#c39b46" },
      ],
      selectedStop: null,
    };
    
    // 角度渐变控制点状态
    this.conicCenterHovered = false;
    this.conicAngleHandleHovered = false;

    this.isDragging = false;
    this.dragTarget = null;
    this.dragStartPos = { x: 0, y: 0 };
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.isAdjustingAngle = false; // 角度调整状态
    this.radialCenterHovered = false; // 圆心悬停状态
    this.radialSizeHandleHovered = -1; // 尺寸控制点悬停状态，-1表示没有悬停，0-3表示四个方向的控制点

    this.init();
  }

  init() {
    // 等待DOM完全加载
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.setupCanvases();
        this.setupEventListeners();
        this.initializeRadialDefaults();
        this.renderAll();
      });
    } else {
      this.setupCanvases();
      this.setupEventListeners();
      this.initializeRadialDefaults();
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

  initializeRadialDefaults() {
    // 初始化椭圆和圆的默认参数，严格按照CSS代码实现
    const radialCanvas = this.canvases["radial-canvas"];

    if (radialCanvas) {
      const rect = radialCanvas.getBoundingClientRect();

      // 设置椭圆的默认尺寸：CSS代码中的 ellipse 50% 50% 表示水平半径是容器宽度的50%，垂直半径是容器高度的50%
      this.ellipseData.size = { x: 50, y: 50 };

      // 设置圆的默认尺寸：CSS代码中的 circle 50% 表示半径是容器高度的50%
      this.circleData.size = { x: 50, y: 50 };

      // 根据当前形状设置初始参数
      if (this.radialData.shape === "ellipse") {
        this.radialData.size = { ...this.ellipseData.size };
      } else if (this.radialData.shape === "circle") {
        this.radialData.size = { ...this.circleData.size };
      }

      // 如果使用了尺寸关键字，计算对应的尺寸
      if (this.radialData.sizeKeyword) {
        this.calculateSizeFromKeyword(this.radialData.sizeKeyword);
      }

      // 更新滑块值
      this.updateRadialSlider();

      // 确保渲染径向渐变
      this.renderRadial();
      this.updateRadialColorStops();
    }
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

    // 角度渐变事件
    this.setupConicEvents();

    // 窗口大小改变
    window.addEventListener("resize", () => {
      this.setupCanvases();
      this.initializeRadialDefaults();
      this.updateRadialControls();
      this.renderAll();
      // 更新颜色选择器位置
      this.updateColorPickerPositionOnResize();
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

      // 检查是否点击在角度控制器的圆球上
      if (this.angleController) {
        const dx = clickX - this.angleController.ballX;
        const dy = clickY - this.angleController.ballY;
        const ballDistance = Math.sqrt(dx * dx + dy * dy);
        if (ballDistance <= 12) {
          // 只有点击在圆球附近才允许拖拽
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

    // 形状和尺寸关键字选择
    document.querySelectorAll('input[name="radial-shape"], input[name="radial-size"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        this.updateRadialData();
        this.updateRadialSlider();
        this.renderRadial();
        this.updateRadialColorStops();
        this.updateRadialCSS();
      });
    });

    // Canvas鼠标事件处理
    canvas.addEventListener("mousedown", (e) => {
      if (this.currentType !== "radial") return;

      // 检查鼠标是否在色标上
      const target = e.target;
      if (target && (target.classList.contains("radial-color-stop") || target.closest(".radial-color-stop"))) {
        return; // 在色标上点击时不添加新色标
      }

      // 获取radial-canvas-container的尺寸和位置
      const container = document.getElementById("radial-canvas-container");
      const containerRect = container.getBoundingClientRect();

      // 获取Canvas的尺寸和位置
      const canvasRect = canvas.getBoundingClientRect();

      // 计算container在Canvas坐标系中的偏移量
      const offsetX = containerRect.left - canvasRect.left;
      const offsetY = containerRect.top - canvasRect.top;

      // 将鼠标坐标转换为container坐标系
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;

      // 检查是否点击在控制点上
      if (this.radialHandles) {
        // 检查圆心控制点（需要将container坐标转换为Canvas坐标）
        const center = this.radialHandles.center;
        const centerDistance = Math.sqrt((x + offsetX - center.x) ** 2 + (y + offsetY - center.y) ** 2);
        if (centerDistance <= center.radius) {
          e.stopPropagation();
          this.startDrag("radial-center", null, e);
          return;
        }

        // 检查尺寸控制点
        for (const handle of this.radialHandles.sizeHandles) {
          const handleDistance = Math.sqrt((x + offsetX - handle.x) ** 2 + (y + offsetY - handle.y) ** 2);
          if (handleDistance <= handle.radius) {
            e.stopPropagation();
            this.startDrag("radial-size", handle.index, e);
            return;
          }
        }
      }

      // 检查是否在虚线上方或下方60px范围内
      const centerX = this.radialData.center.x * containerRect.width;
      const centerY = this.radialData.center.y * containerRect.height;
      const distanceFromLine = Math.abs(y - centerY);
      if (distanceFromLine > 60) return; // 超出范围，不添加色标

      // 根据形状计算最大半径
      let maxRadius;
      if (this.radialData.shape === "circle") {
        maxRadius = (this.radialData.size.x / 100) * containerRect.height;
      } else {
        maxRadius = (this.radialData.size.x / 100) * containerRect.width;
      }

      // 检查点击位置是否在有效范围内
      const rightBound = centerX + maxRadius;
      const validRangeStart = centerX - 40;
      const validRangeEnd = rightBound + 40;

      if (x < validRangeStart || x > validRangeEnd) return;

      // 计算点击位置到圆心的水平距离
      const horizontalDistance = x - centerX;

      // 计算位置百分比
      let position;
      if (horizontalDistance >= 0) {
        position = Math.max(0, Math.min(100, (horizontalDistance / maxRadius) * 100));
      } else {
        position = 0;
      }

      // 判断是在虚线上方还是下方
      const isAboveLine = y < centerY;

      // 获取当前位置的渐变颜色
      const color = this.getColorAtRadialPosition(position);

      // 添加新的色标
      const newStop = {
        position: position,
        color: color,
        isSelected: false,
        isAboveLine: isAboveLine,
      };

      this.radialData.colorStops.push(newStop);
      this.radialData.colorStops.sort((a, b) => a.position - b.position);
      this.renderRadial();
      this.updateRadialColorStops();
      this.updateRadialCSS();
    });

    // 添加鼠标悬停效果
    canvas.addEventListener("mousemove", (e) => {
      if (this.currentType !== "radial") return;

      // 检查鼠标是否在色标上
      const target = e.target;
      if (target && (target.classList.contains("radial-color-stop") || target.closest(".radial-color-stop"))) {
        this.hideRadialPreview();
        return;
      }

      // 获取radial-canvas-container的尺寸和位置
      const container = document.getElementById("radial-canvas-container");
      const containerRect = container.getBoundingClientRect();

      // 获取Canvas的尺寸和位置
      const canvasRect = canvas.getBoundingClientRect();

      // 计算container在Canvas坐标系中的偏移量
      const offsetX = containerRect.left - canvasRect.left;
      const offsetY = containerRect.top - canvasRect.top;

      // 将鼠标坐标转换为container坐标系
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;

      // 检查是否悬停在控制点上
      if (this.radialHandles) {
        let isOverControl = false;
        let wasCenterHovered = this.radialCenterHovered;

        // 检查圆心控制点（需要将container坐标转换为Canvas坐标）
        const center = this.radialHandles.center;
        const centerDistance = Math.sqrt((x + offsetX - center.x) ** 2 + (y + offsetY - center.y) ** 2);
        if (centerDistance <= center.radius) {
          canvas.style.cursor = "move";
          isOverControl = true;
          this.radialCenterHovered = true;
        } else {
          this.radialCenterHovered = false;
        }

        // 检查尺寸控制点
        let wasSizeHandleHovered = this.radialSizeHandleHovered;
        this.radialSizeHandleHovered = -1; // 重置悬停状态
        
        if (!isOverControl) {
          for (let i = 0; i < this.radialHandles.sizeHandles.length; i++) {
            const handle = this.radialHandles.sizeHandles[i];
            const handleDistance = Math.sqrt((x + offsetX - handle.x) ** 2 + (y + offsetY - handle.y) ** 2);
            if (handleDistance <= handle.radius) {
              canvas.style.cursor = "pointer";
              isOverControl = true;
              this.radialSizeHandleHovered = i; // 设置悬停的控制点索引
              break;
            }
          }
        }
        
        // 如果尺寸控制点悬停状态发生变化，重新渲染控制点
        if (wasSizeHandleHovered !== this.radialSizeHandleHovered) {
          this.drawRadialControls();
        }

        // 如果圆心悬停状态发生变化，重新渲染控制点
        if (wasCenterHovered !== this.radialCenterHovered) {
          this.drawRadialControls();
        }

        // 如果悬停在控制点上，隐藏预览色标并返回
        if (isOverControl) {
          this.hideRadialPreview();
          return;
        }

        canvas.style.cursor = "crosshair";
      }

      // 原有的预览色标逻辑
      const centerX = this.radialData.center.x * containerRect.width;
      const centerY = this.radialData.center.y * containerRect.height;

      let maxRadius;
      if (this.radialData.shape === "circle") {
        maxRadius = (this.radialData.size.x / 100) * containerRect.height;
      } else {
        maxRadius = (this.radialData.size.x / 100) * containerRect.width;
      }

      const distanceFromLine = Math.abs(y - centerY);
      if (distanceFromLine <= 60) {
        const rightBound = centerX + maxRadius;
        const validRangeStart = centerX - 40;
        const validRangeEnd = rightBound + 40;

        if (x >= validRangeStart && x <= validRangeEnd) {
          this.showRadialPreview(x, y, centerX, centerY, y < centerY);
        } else {
          this.hideRadialPreview();
        }
      } else {
        this.hideRadialPreview();
      }
    });

    canvas.addEventListener("mouseleave", () => {
      this.hideRadialPreview();
      canvas.style.cursor = "crosshair";
      
      // 重置圆心悬停状态
      if (this.radialCenterHovered) {
        this.radialCenterHovered = false;
        this.drawRadialControls();
      }
    });
  }

  setupConicEvents() {
    const canvas = this.canvases["conic-canvas"];

    // Canvas鼠标移动事件 - 处理悬停效果和预览色标
    canvas.addEventListener("mousemove", (e) => {
      if (this.currentType !== "conic") return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 检查是否悬停在控制点上
      if (this.conicHandles) {
        let isOverControl = false;
        let wasCenterHovered = this.conicCenterHovered;
        let wasAngleHandleHovered = this.conicAngleHandleHovered;

        // 检查圆心控制点
        const center = this.conicHandles.center;
        const centerDistance = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
        if (centerDistance <= center.radius) {
          canvas.style.cursor = "move";
          isOverControl = true;
          this.conicCenterHovered = true;
        } else {
          this.conicCenterHovered = false;
        }

        // 检查角度控制点
        if (!isOverControl) {
          const angleHandle = this.conicHandles.angleHandle;
          const angleDistance = Math.sqrt((x - angleHandle.x) ** 2 + (y - angleHandle.y) ** 2);
          if (angleDistance <= angleHandle.radius) {
            canvas.style.cursor = "pointer";
            isOverControl = true;
            this.conicAngleHandleHovered = true;
          } else {
            this.conicAngleHandleHovered = false;
          }
        }

        // 检查是否悬停在色标上
        if (!isOverControl && this.conicColorStops) {
          let wasHoveredStop = this.hoveredConicStop;
          this.hoveredConicStop = null;
          
          for (let i = this.conicColorStops.length - 1; i >= 0; i--) {
            const stopData = this.conicColorStops[i];
            const distance = Math.sqrt((x - stopData.x) ** 2 + (y - stopData.y) ** 2);
            if (distance <= stopData.size) {
              canvas.style.cursor = "url('/Images/Common/鼠标-指向.cur'), pointer";
              this.hoveredConicStop = stopData.stop;
              isOverControl = true;
              break;
            }
          }
          
          // 如果悬停状态发生变化，重新渲染
          if (wasHoveredStop !== this.hoveredConicStop) {
            this.renderConic();
          }
        }

        // 如果悬停状态发生变化，重新渲染
        if (wasCenterHovered !== this.conicCenterHovered || wasAngleHandleHovered !== this.conicAngleHandleHovered) {
          this.renderConic();
        }

        // 如果悬停在控制点或色标上，隐藏预览色标并返回
        if (isOverControl) {
          this.hideConicPreview();
          return;
        }

        // 检查是否贴近圆边界75px（无论内外）- 使用到边界的距离
        const radius = this.conicHandles.radius;
        const distance = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
        const distanceToBoundary = Math.abs(distance - radius);
        
        if (distanceToBoundary <= 100) {
          // 计算角度（相对于起始角度）
          const angle = ((Math.atan2(y - center.y, x - center.x) * 180) / Math.PI + 360) % 360;
          const relativeAngle = (angle - this.conicData.startAngle + 360) % 360;
          
          // 显示预览色标
          this.showConicPreview(x, y, relativeAngle);
          canvas.style.cursor = "crosshair";
        } else {
          // 隐藏预览色标
          this.hideConicPreview();
          canvas.style.cursor = "crosshair";
        }
      }
    });

    // Canvas鼠标按下事件 - 处理拖拽和色标添加
    canvas.addEventListener("mousedown", (e) => {
      if (this.currentType !== "conic") return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 检查是否点击在控制点上
      if (this.conicHandles) {
        // 检查圆心控制点
        const center = this.conicHandles.center;
        const centerDistance = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
        if (centerDistance <= center.radius) {
          e.stopPropagation();
          this.startDrag("conic-center", null, e);
          return;
        }

        // 检查角度控制点
        const angleHandle = this.conicHandles.angleHandle;
        const angleDistance = Math.sqrt((x - angleHandle.x) ** 2 + (y - angleHandle.y) ** 2);
        if (angleDistance <= angleHandle.radius) {
          e.stopPropagation();
          this.startDrag("conic-angle", null, e);
          return;
        }
      }

      // 检查是否点击在Canvas色标上
      if (this.conicColorStops) {
        for (let i = this.conicColorStops.length - 1; i >= 0; i--) {
          const stopData = this.conicColorStops[i];
          const distance = Math.sqrt((x - stopData.x) ** 2 + (y - stopData.y) ** 2);
          if (distance <= stopData.size) {
            e.stopPropagation();
            // 记录下点击的色标和起始坐标
            let mouseMoved = false;
            const mouseDownX = e.clientX;
            const mouseDownY = e.clientY;
            const stop = stopData.stop;
            // 监听mousemove和mouseup
            const handleMouseMove = (moveEvent) => {
              if (!mouseMoved) {
                const dx = moveEvent.clientX - mouseDownX;
                const dy = moveEvent.clientY - mouseDownY;
                if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
                  mouseMoved = true;
                  // 进入拖拽
                  this.startConicColorStopDrag(stop, e);
                  document.removeEventListener("mousemove", handleMouseMove);
                  document.removeEventListener("mouseup", handleMouseUp);
                }
              }
            };
            const handleMouseUp = (upEvent) => {
              document.removeEventListener("mousemove", handleMouseMove);
              document.removeEventListener("mouseup", handleMouseUp);
              if (!mouseMoved) {
                // 视为点击，弹出拾色器
                this.selectConicColorStop(stop);
              }
            };
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            return;
          }
        }
      }

      // 添加新色标
      const centerX = this.conicData.center.x * rect.width;
      const centerY = this.conicData.center.y * rect.height;
      const radius = this.conicHandles ? this.conicHandles.radius : Math.min(rect.width, rect.height) * 0.4;

      // 计算点击位置到圆心的距离
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 检查是否在圆外一定范围内 - 使用到边界的距离
      const distanceToBoundary = Math.abs(distance - radius);
      if (distanceToBoundary <= 100) {
        // 计算角度（相对于起始角度）
        const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
        // 将角度偏移+90°，使其与显示角度一致
        const adjustedAngle = (angle + 90 + 360) % 360;
        const relativeAngle = (adjustedAngle - this.conicData.startAngle + 360) % 360;
        
        this.addConicColorStop(relativeAngle);
      }
    });

    // Canvas鼠标离开事件
    canvas.addEventListener("mouseleave", () => {
      if (this.currentType !== "conic") return;

      canvas.style.cursor = "crosshair";
      
      // 重置悬停状态
      let needsRerender = false;
      if (this.conicCenterHovered || this.conicAngleHandleHovered) {
        this.conicCenterHovered = false;
        this.conicAngleHandleHovered = false;
        needsRerender = true;
      }
      
      if (this.hoveredConicStop) {
        this.hoveredConicStop = null;
        needsRerender = true;
      }
      
      if (needsRerender) {
        this.renderConic();
      }
      
      // 隐藏预览色标
      this.hideConicPreview();
    });
  }

  startDrag(type, target, e) {
    this.isDragging = true;
    this.dragTarget = { type, target };

    // 对于尺寸控制点，记录container的偏移量
    if (type === "radial-size") {
      const container = document.getElementById("radial-canvas-container");
      const containerRect = container.getBoundingClientRect();
      this.dragStartPos = {
        x: e.clientX,
        y: e.clientY,
        canvasLeft: containerRect.left,
        canvasTop: containerRect.top,
      };
    } else {
      this.dragStartPos = { x: e.clientX, y: e.clientY };
    }

    // 为角度渐变的控制点添加拖拽时的悬停效果
    if (type === "conic-center" || type === "conic-angle") {
      const controlElement = e.target;
      if (controlElement) {
        controlElement.style.transform = controlElement.style.transform.replace(/scale\([^)]*\)/, 'scale(1.2)');
      }
    }

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

    if (type === "radial-center") {
      this.updateRadialCenter(deltaX, deltaY);
      // 更新拖拽起始位置为当前位置，用于下一次计算
      this.dragStartPos = { x: e.clientX, y: e.clientY };
    } else if (type === "radial-size") {
      this.updateRadialSize(target, deltaX, deltaY);
      // 对于尺寸控制点，不更新拖拽起始位置，让控制点跟随鼠标
    } else if (type === "conic-center") {
      this.updateConicCenter(deltaX, deltaY);
      // 更新拖拽起始位置为当前位置，用于下一次计算
      this.dragStartPos = { x: e.clientX, y: e.clientY };
    } else if (type === "conic-angle") {
      this.updateConicAngle(deltaX, deltaY);
      // 更新拖拽起始位置为当前位置，用于下一次计算
      this.dragStartPos = { x: e.clientX, y: e.clientY };
    }
  }

  stopDrag() {
    // 为角度渐变的控制点移除拖拽时的悬停效果
    if (this.dragTarget && (this.dragTarget.type === "conic-center" || this.dragTarget.type === "conic-angle")) {
      // 这里需要找到对应的控制点元素并恢复其transform
      // 由于控制点是在Canvas中绘制的，我们需要重新渲染来恢复状态
      if (this.currentType === "conic") {
        this.renderConic();
      }
    }

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

    // 更新Canvas显示 - 使用具体的ID选择器
    const linearContainer = document.getElementById("linear-canvas-container");
    const radialContainer = document.getElementById("radial-canvas-container");
    const conicContainer = document.getElementById("conic-canvas-container");

    if (linearContainer) linearContainer.classList.toggle("active", type === "linear");
    if (radialContainer) radialContainer.classList.toggle("active", type === "radial");
    if (conicContainer) conicContainer.classList.toggle("active", type === "conic");

    // 更新控制区显示
    document.querySelectorAll(".control-section").forEach((section) => {
      section.classList.toggle("active", section.classList.contains(`${type}-controls`));
    });

    // 只渲染当前类型的Canvas和色标
    if (type === "linear") {
      this.renderLinear();
      this.updateLinearColorStops();
      this.updateLinearCSS();
    } else if (type === "radial") {
      this.renderRadial();
      this.updateRadialColorStops();
      this.updateRadialCSS();
    } else if (type === "conic") {
      this.renderConic();
      this.updateConicCSS();
    }
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
    // 获取radial-canvas-container的尺寸
    const container = document.getElementById("radial-canvas-container");
    const containerRect = container.getBoundingClientRect();

    this.radialData.center.x += deltaX / containerRect.width;
    this.radialData.center.y += deltaY / containerRect.height;

    // 限制在Canvas范围内
    this.radialData.center.x = Math.max(0.1, Math.min(0.9, this.radialData.center.x));
    this.radialData.center.y = Math.max(0.1, Math.min(0.9, this.radialData.center.y));

    // 如果选择了尺寸关键字，根据新的圆心位置重新计算尺寸
    if (this.radialData.sizeKeyword) {
      this.calculateSizeFromKeyword(this.radialData.sizeKeyword);
    }

    this.renderRadial();
    this.updateRadialColorStops();
    this.updateRadialCSS();
  }

  updateRadialSize(target, deltaX, deltaY) {
    // 获取radial-canvas-container的尺寸
    const container = document.getElementById("radial-canvas-container");
    const containerRect = container.getBoundingClientRect();

    const centerX = this.radialData.center.x * containerRect.width;
    const centerY = this.radialData.center.y * containerRect.height;

    // 使用记录的Canvas偏移量计算鼠标位置
    const mouseX = this.dragStartPos.x - this.dragStartPos.canvasLeft + deltaX;
    const mouseY = this.dragStartPos.y - this.dragStartPos.canvasTop + deltaY;

    // 计算鼠标到圆心的距离
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 根据形状计算新的尺寸
    let newSize;
    if (this.radialData.shape === "circle") {
      // 圆的尺寸：基于container的最小尺寸计算，确保圆形
      const minDimension = Math.min(containerRect.width, containerRect.height);
      newSize = Math.max(5, (distance / minDimension) * 100);
      
      // 对于圆形，x和y尺寸应该相同
      this.radialData.size.x = newSize;
      this.radialData.size.y = newSize;
    } else {
      // 椭圆的尺寸：基于container的宽度或高度计算
      if (target === 0 || target === 2) {
        // 上下控制点：基于container高度计算
        const defaultRadius = containerRect.height;
        newSize = Math.max(5, (distance / defaultRadius) * 100);
        this.radialData.size.y = newSize;
      } else {
        // 左右控制点：基于container宽度计算
        const defaultRadius = containerRect.width;
        newSize = Math.max(5, (distance / defaultRadius) * 100);
        this.radialData.size.x = newSize;
      }
    }

    // 手动拖拽尺寸时，取消尺寸关键字选中（因为用户主动改变了尺寸）
    if (this.radialData.sizeKeyword) {
      this.radialData.sizeKeyword = null;
      this.clearSizeKeywordSelection();
    }

    this.renderRadial();
    this.updateRadialColorStops();
    this.updateRadialCSS();
  }

  addRadialColorStop(position, isAboveLine = true) {
    const color = this.getColorAtRadialPosition(position);
    this.radialData.colorStops.push({
      position,
      color,
      isAboveLine: isAboveLine,
    });
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
    // 只在当前类型为radial时才更新径向渐变色标
    if (this.currentType !== "radial") return;

    const canvasContainer = document.getElementById("radial-canvas-container");
    const existingStops = canvasContainer.querySelectorAll(".radial-color-stop");
    existingStops.forEach((stop) => stop.remove());

    this.radialData.colorStops.forEach((stop, index) => {
      const stopElement = document.createElement("div");
      stopElement.className = "radial-color-stop";

      // 设置色标颜色
      stopElement.style.setProperty("--色标-默认", stop.color);

      // 计算相对颜色并设置伪元素颜色
      const contrastColor = this.getContrastColor(stop.color);
      stopElement.style.setProperty("--色标-相对色", contrastColor);

      // 计算色标位置（基于container的尺寸）
      const container = document.getElementById("radial-canvas-container");
      const containerRect = container.getBoundingClientRect();

      const centerX = this.radialData.center.x * containerRect.width;
      const centerY = this.radialData.center.y * containerRect.height;

      // 根据形状计算色标位置
      let radius;
      if (this.radialData.shape === "circle") {
        // 圆的色标位置：基于半径百分比，使用容器的最小尺寸作为基准
        const minDimension = Math.min(containerRect.width, containerRect.height);
        radius = (stop.position / 100) * (this.radialData.size.x / 100) * minDimension;
      } else {
        // 椭圆的色标位置：基于水平半径百分比
        radius = (stop.position / 100) * (this.radialData.size.x / 100) * containerRect.width;
      }

      // 将container坐标系转换为屏幕坐标系
      const screenX = centerX + radius;
      stopElement.style.left = `${screenX}px`;

      // 根据色标位置决定三角形方向
      if (stop.isAboveLine) {
        stopElement.style.top = `${centerY - 20}px`; // 圆心上方4px + 三角形高度(18px) - 4px调整 = 18px
        stopElement.classList.remove("upside-down"); // 底边在上，尖角在下
      } else {
        stopElement.style.top = `${centerY + 22}px`; // 圆心下方4px + 4px调整 = 8px
        stopElement.classList.add("upside-down"); // 底边在下，尖角在上
      }

      stopElement.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        this.startRadialColorStopDrag(stop, e);
      });

      stopElement.addEventListener("click", (e) => {
        this.selectRadialColorStop(stopElement, stop);
      });

      // 设置色标的z-index，确保在控制元素之上
      stopElement.style.zIndex = "20";

      canvasContainer.appendChild(stopElement);
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

  // 角度渐变方法
  updateConicCenter(deltaX, deltaY) {
    const canvas = this.canvases["conic-canvas"];
    const rect = canvas.getBoundingClientRect();

    this.conicData.center.x += deltaX / rect.width;
    this.conicData.center.y += deltaY / rect.height;

    // 限制在Canvas范围内（允许到边缘）
    this.conicData.center.x = Math.max(0, Math.min(1, this.conicData.center.x));
    this.conicData.center.y = Math.max(0, Math.min(1, this.conicData.center.y));

    this.renderConic();
    this.updateConicCSS();
  }

  updateConicAngle(deltaX, deltaY) {
    const canvas = this.canvases["conic-canvas"];
    const rect = canvas.getBoundingClientRect();

    const centerX = this.conicData.center.x * rect.width;
    const centerY = this.conicData.center.y * rect.height;

    // 计算当前鼠标位置相对于圆心的角度
    const currentMouseX = this.dragStartPos.x + deltaX - rect.left;
    const currentMouseY = this.dragStartPos.y + deltaY - rect.top;
    const angle = (Math.atan2(currentMouseY - centerY, currentMouseX - centerX) * 180) / Math.PI;
    
    // 将角度偏移+90°，使其与显示角度一致
    const adjustedAngle = (angle + 90 + 360) % 360;
    
    // 更新起始角度（确保在0-360范围内）
    this.conicData.startAngle = adjustedAngle;

    // 更新拖拽起始位置，用于下一次计算
    this.dragStartPos = { x: this.dragStartPos.x + deltaX, y: this.dragStartPos.y + deltaY };

    this.renderConic();
    this.updateConicCSS();
  }

  addConicColorStop(angle) {
    const color = this.getColorAtConicAngle(angle);
    this.conicData.colorStops.push({ position: angle, color });
    this.conicData.colorStops.sort((a, b) => a.position - b.position);

    this.renderConic();
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
    this.updateConicCSS();
  }

  // updateConicColorStops方法已删除，现在使用Canvas绘制色标

  selectConicColorStop(stop) {
    this.conicData.selectedStop = stop;
    this.openColorPicker(stop);
  }

  // 渲染方法
  renderLinear() {
    // 只在当前类型为linear时才渲染线性渐变
    if (this.currentType !== "linear") return;

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
      centerX,
      centerY,
      angleRad,
      gradientX,
      gradientY,
      gradientWidth,
      gradientHeight
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

    // 绘制可拖拽的蓝色圆球
    const ballRadius = 5; // 圆球半径5px，直径10px
    const ballDistance = controllerRadius - ballRadius - 5; // 圆球紧贴时钟边界内侧，留5px边距

    // 根据当前角度计算圆球位置
    // CSS渐变角度0deg在正上，需要转换为数学坐标系
    const currentAngleRad = ((this.linearData.angle - 90) * Math.PI) / 180;
    const ballX = controllerX + Math.cos(currentAngleRad) * ballDistance;
    const ballY = controllerY + Math.sin(currentAngleRad) * ballDistance;

    // 绘制圆心到圆球的灰色虚线连接
    ctx.strokeStyle = "rgba(128, 128, 128, 0.6)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]); // 设置虚线样式：3px实线，3px空白

    ctx.beginPath();
    ctx.moveTo(controllerX, controllerY);
    ctx.lineTo(ballX, ballY);
    ctx.stroke();

    // 重置虚线样式
    ctx.setLineDash([]);

    // 绘制蓝色圆球
    ctx.fillStyle = "rgba(52, 152, 219, 0.9)";
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制圆球边框
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 恢复状态
    ctx.restore();

    // 保存控制器信息用于交互
    this.angleController = {
      x: controllerX,
      y: controllerY,
      radius: controllerRadius,
      ballX: ballX,
      ballY: ballY,
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
    // 只在当前类型为radial时才渲染径向渐变
    if (this.currentType !== "radial") return;

    // 使用CSS background-image替代Canvas渲染
    const overlay = document.getElementById("radial-overlay");
    const cssCode = this.generateRadialGradientCSS();
    overlay.style.backgroundImage = cssCode;

    // 在Canvas上绘制控制元素
    this.drawRadialControls();
  }

  // 新增：在Canvas上绘制径向渐变控制元素
  drawRadialControls() {
    const canvas = this.canvases["radial-canvas"];
    const ctx = this.ctxs["radial-canvas"];

    // 获取radial-canvas-container的尺寸和位置（这是实际的渲染区域）
    const container = document.getElementById("radial-canvas-container");
    const containerRect = container.getBoundingClientRect();

    // 获取Canvas的尺寸和位置
    const canvasRect = canvas.getBoundingClientRect();

    // 清除Canvas
    ctx.clearRect(0, 0, canvas.width / this.dpr, canvas.height / this.dpr);

    // 计算container在Canvas坐标系中的偏移量
    const offsetX = containerRect.left - canvasRect.left;
    const offsetY = containerRect.top - canvasRect.top;

    // 使用container的尺寸来计算控制点位置，但需要加上偏移量
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const centerX = this.radialData.center.x * containerWidth + offsetX;
    const centerY = this.radialData.center.y * containerHeight + offsetY;

    // 根据形状计算半径
    let radiusX, radiusY;
    if (this.radialData.shape === "circle") {
      radiusX = radiusY = (this.radialData.size.x / 100) * containerHeight;
    } else {
      radiusX = (this.radialData.size.x / 100) * containerWidth;
      radiusY = (this.radialData.size.y / 100) * containerHeight;
    }

    // 绘制尺寸指示器（虚线圆/椭圆）
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]); // 8px实线，8px空白

    if (this.radialData.shape === "circle") {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radiusX, 0, 2 * Math.PI);
    } else {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    }
    ctx.stroke();
    ctx.restore();

    // 绘制圆心控制点（黑色圆点）
    ctx.save();
    
    // 检查圆心是否被悬停
    const isCenterHovered = this.radialCenterHovered;
    
    if (isCenterHovered) {
      // 悬停状态：更大的圆点，带阴影效果
      ctx.shadowColor = "rgba(52, 152, 219, 0.8)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#3498db"; // 蓝色填充
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI); // 更大的半径
      ctx.fill();
      ctx.stroke();
      
      // 绘制内圈
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#2980b9";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // 正常状态
      ctx.fillStyle = "#000000";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    
    ctx.restore();

    // 绘制90度指示虚线（黑白间隔）
    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radiusX, centerY);
    ctx.stroke();

    // 绘制白色部分
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = 8; // 偏移8px，让白色部分与黑色部分错开

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radiusX, centerY);
    ctx.stroke();
    ctx.restore();

    // 绘制尺寸控制点（红色圆点，4个方向）- 最后绘制，确保在最上层
    const sizeHandlePositions = [
      { x: centerX, y: centerY - radiusY }, // 上
      { x: centerX + radiusX, y: centerY }, // 右
      { x: centerX, y: centerY + radiusY }, // 下
      { x: centerX - radiusX, y: centerY }, // 左
    ];

    sizeHandlePositions.forEach((pos, index) => {
      ctx.save();
      
      // 检查是否被悬停
      const isHovered = this.radialSizeHandleHovered === index;
      
      if (isHovered) {
        // 悬停状态：更大的圆点，带阴影效果
        ctx.shadowColor = "rgba(231, 76, 60, 0.8)";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#e74c3c";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 10, 0, 2 * Math.PI); // 更大的半径
        ctx.fill();
        ctx.stroke();
        
        // 绘制内圈
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#c0392b";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // 正常状态
        ctx.fillStyle = "#e74c3c";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 7.5, 0, 2 * Math.PI); // 半径改为7.5px，直径15px
        ctx.fill();
        ctx.stroke();
      }
      
      ctx.restore();
    });

    // 保存控制点位置用于交互检测
    this.radialHandles = {
      center: { x: centerX, y: centerY, radius: 8 },
      sizeHandles: sizeHandlePositions.map((pos, index) => ({
        x: pos.x,
        y: pos.y,
        radius: 7.5, // 半径改为7.5px，直径15px
        index: index,
      })),
    };
  }

  renderConic() {
    // 只在当前类型为conic时才渲染角度渐变
    if (this.currentType !== "conic") return;

    const canvas = this.canvases["conic-canvas"];
    const ctx = this.ctxs["conic-canvas"];
    const width = canvas.width / this.dpr;
    const height = canvas.height / this.dpr;

    ctx.clearRect(0, 0, width, height);

    // 计算圆心和半径
    const centerX = this.conicData.center.x * width;
    const centerY = this.conicData.center.y * height;
    const radius = Math.min(width, height) * 0.4;

    // 1. 绘制整个Canvas的角度渐变
    // 将角度偏移-90°，使0°指向正上方
    const adjustedStartAngle = this.conicData.startAngle - 90;
    const gradient = ctx.createConicGradient(
      (adjustedStartAngle * Math.PI) / 180,
      centerX,
      centerY
    );

    // 添加色标到渐变
    this.conicData.colorStops.forEach((stop) => {
      gradient.addColorStop(stop.position / 360, stop.color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. 绘制参考圆的边界
    ctx.save();
    // 先绘制黑色阴影
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 4;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();

    // 3. 绘制起始角度线（七彩色实线）
    ctx.save();
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // 将角度偏移-90°，使0°指向正上方
    const adjustedAngle = this.conicData.startAngle - 90;
    const startAngleRad = (adjustedAngle * Math.PI) / 180;
    const endX = centerX + Math.cos(startAngleRad) * radius;
    const endY = centerY + Math.sin(startAngleRad) * radius;
    
    // 绘制七彩色渐变线
    const colors = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#8000ff', '#ff0080'];
    const segmentLength = radius / colors.length;
    
    for (let i = 0; i < colors.length; i++) {
      const startDist = i * segmentLength;
      const endDist = (i + 1) * segmentLength;
      
      const startX = centerX + Math.cos(startAngleRad) * startDist;
      const startY = centerY + Math.sin(startAngleRad) * startDist;
      const segmentEndX = centerX + Math.cos(startAngleRad) * endDist;
      const segmentEndY = centerY + Math.sin(startAngleRad) * endDist;
      
      // 创建渐变
      const gradient = ctx.createLinearGradient(startX, startY, segmentEndX, segmentEndY);
      gradient.addColorStop(0, colors[i]);
      gradient.addColorStop(1, colors[(i + 1) % colors.length]);
      
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(segmentEndX, segmentEndY);
      ctx.stroke();
    }
    
    ctx.restore();

    // 4. 绘制圆心控制点（在彩色线之后绘制，确保在最上层）
    ctx.save();
    
    // 检查圆心是否被悬停
    const isCenterHovered = this.conicCenterHovered;
    
    if (isCenterHovered) {
      // 悬停状态：更大的圆点，带阴影效果
      ctx.shadowColor = "rgba(52, 152, 219, 0.8)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#3498db"; // 蓝色填充
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // 绘制内圈
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#2980b9";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // 正常状态
      ctx.fillStyle = "#000000";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    
    ctx.restore();

    // 5. 绘制色标连线（黑白相间虚线）
    this.conicData.colorStops.forEach((stop) => {
      // 将角度偏移-90°，使色标位置与显示角度一致
      const adjustedStopAngle = this.conicData.startAngle + stop.position - 90;
      const stopAngleRad = (adjustedStopAngle * Math.PI) / 180;
      const stopX = centerX + Math.cos(stopAngleRad) * (radius + 30); // 色标在圆外30px
      const stopY = centerY + Math.sin(stopAngleRad) * (radius + 30);

      // 绘制连线（从圆心到色标位置，但只到圆边界）
      ctx.save();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      
      const lineEndX = centerX + Math.cos(stopAngleRad) * radius;
      const lineEndY = centerY + Math.sin(stopAngleRad) * radius;
      ctx.lineTo(lineEndX, lineEndY);
      ctx.stroke();

      // 绘制白色部分
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = 8;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(lineEndX, lineEndY);
      ctx.stroke();
      ctx.restore();
    });

    // 6. 绘制起始角度控制点（最后绘制，确保在最上层）
    ctx.save();
    
    // 检查角度控制点是否被悬停
    const isAngleHandleHovered = this.conicAngleHandleHovered;
    
    if (isAngleHandleHovered) {
      // 悬停状态
      ctx.shadowColor = "rgba(255, 107, 107, 0.8)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#ff6b6b";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(endX, endY, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    } else {
      // 正常状态
      ctx.fillStyle = "#ff6b6b";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(endX, endY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    
    ctx.restore();

    // 7. 绘制色标和角度文本
    this.conicData.colorStops.forEach((stop, index) => {
      // 将角度偏移-90°，使色标位置与显示角度一致
      const adjustedStopAngle = this.conicData.startAngle + stop.position - 90;
      const stopAngleRad = (adjustedStopAngle * Math.PI) / 180;
      const stopX = centerX + Math.cos(stopAngleRad) * (radius + 30); // 色标在圆外30px
      const stopY = centerY + Math.sin(stopAngleRad) * (radius + 30);

      // 检查是否正在拖拽这个色标
      const isDraggingThisStop = this.isDraggingColorStop && this.dragTarget && 
                                this.dragTarget.type === "conic-color-stop" && 
                                this.dragTarget.stop === stop;

      // 绘制色标（菱形）
      ctx.save();
      ctx.translate(stopX, stopY);
      ctx.rotate(stopAngleRad + Math.PI / 2); // 让菱形朝向圆心

      // 设置缩放和透明度
      let scale = 1;
      let alpha = 1;
      if (isDraggingThisStop) {
        scale = 1.3;
        alpha = 0.7;
      } else if (this.hoveredConicStop === stop) {
        scale = 1.25;
      }
      
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;

      // 绘制菱形
      const size = 9; // 菱形大小
      ctx.fillStyle = stop.color;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 4;
      
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.restore();

      // 绘制角度文本
      ctx.save();
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      
      const angleText = `${stop.position.toFixed(1)}°`;
      const textMetrics = ctx.measureText(angleText);
      const textWidth = textMetrics.width;
      const textHeight = 12; // 字体大小
      
      // 计算文本背景位置 - 向上5px
      const textX = stopX;
      const textY = stopY - 20; // 原来是-15，现在-20（向上5px）
      
      // 绘制背景圆角矩形
      const paddingX = 10;
      const paddingY = 5;
      const bgWidth = textWidth + paddingX * 2;
      const bgHeight = textHeight + paddingY * 2;
      const bgX = textX - bgWidth / 2;
      const bgY = textY - textHeight - paddingY;
      
      // 绘制背景
      ctx.save();
      
      // 绘制圆角矩形 - 使用更大的圆角（类似CSS的50px效果）
      const cornerRadius = Math.min(bgWidth, bgHeight) / 2; // 使用宽高较小值的一半，实现类似50px的效果
      
      // 绘制背景模糊效果 - 使用阴影模拟背后模糊
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 2; // 2px模糊
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = "#0008"; // 背景色
      
      ctx.beginPath();
      ctx.moveTo(bgX + cornerRadius, bgY);
      ctx.lineTo(bgX + bgWidth - cornerRadius, bgY);
      ctx.quadraticCurveTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + cornerRadius);
      ctx.lineTo(bgX + bgWidth, bgY + bgHeight - cornerRadius);
      ctx.quadraticCurveTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - cornerRadius, bgY + bgHeight);
      ctx.lineTo(bgX + cornerRadius, bgY + bgHeight);
      ctx.quadraticCurveTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - cornerRadius);
      ctx.lineTo(bgX, bgY + cornerRadius);
      ctx.quadraticCurveTo(bgX, bgY, bgX + cornerRadius, bgY);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
      
      // 绘制文本
      ctx.fillStyle = "#ffffff";
      ctx.fillText(angleText, textX, textY);
      
      ctx.restore();

      // 保存色标位置用于交互检测
      if (!this.conicColorStops) this.conicColorStops = [];
      this.conicColorStops[index] = {
        stop: stop,
        x: stopX,
        y: stopY,
        size: size * scale,
        angle: stopAngleRad
      };
    });

    // 绘制预览色标（如果有）
    if (this.conicPreviewData) {
      ctx.save();
      ctx.translate(this.conicPreviewData.x, this.conicPreviewData.y);
      ctx.rotate(this.conicPreviewData.angle + Math.PI / 2); // 让菱形朝向圆心

      // 设置透明度为35%
      ctx.globalAlpha = 0.5;

      // 绘制菱形
      const size = 9; // 菱形大小
      ctx.fillStyle = this.conicPreviewData.color;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 4;
      
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.restore();
    }

    // 保存控制点位置用于交互检测
    this.conicHandles = {
      center: { x: centerX, y: centerY, radius: 8 },
      angleHandle: { x: endX, y: endY, radius: 8 },
      radius: radius,
    };
  }

  renderAll() {
    this.renderLinear();
    this.renderRadial();
    this.renderConic();

    this.updateRadialControls();
    this.updateConicControls();
    this.updateLinearColorStops();
    this.updateRadialColorStops();

    this.updateLinearCSS();
    this.updateRadialCSS();
    this.updateConicCSS();

    // 如果警告正在显示，重新渲染警告
    if (this.warning.isShowing) {
      this.renderWarning();
    }
  }

  updateRadialControls() {
    // 只在当前类型为radial时才更新径向渐变控制点
    if (this.currentType !== "radial") return;

    // 现在控制点直接在Canvas上绘制，不需要更新DOM元素
    this.drawRadialControls();
  }

  updateRadialSlider() {
    // 更新滑块值以匹配当前尺寸
    const slider = document.getElementById("radial-size-slider");
    if (slider) {
      // 对于圆，使用x值；对于椭圆，使用x和y的平均值
      const value =
        this.radialData.shape === "circle"
          ? this.radialData.size.x
          : Math.round((this.radialData.size.x + this.radialData.size.y) / 2);
      slider.value = value;
    }
  }

  updateConicControls() {
    // 只在当前类型为conic时才更新角度渐变控制点
    if (this.currentType !== "conic") return;

    // 现在控制点直接在Canvas上绘制，不需要更新DOM元素
    this.renderConic();
  }

  updateLinearColorStops() {
    // 只在当前类型为linear时才更新线性渐变色标
    if (this.currentType !== "linear") return;

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
          return `<span class="css-hash">#</span><span class="css-number">${parts[0].slice(
            1
          )}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
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
    const sizeKeyword = this.radialData.sizeKeyword;

    const stops = this.radialData.colorStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ");

    // 如果使用了尺寸关键字，直接使用关键字
    if (sizeKeyword) {
      if (this.radialData.shape === "circle") {
        return `radial-gradient(circle ${sizeKeyword} at ${centerX}% ${centerY}%, ${stops})`;
      } else {
        return `radial-gradient(ellipse ${sizeKeyword} at ${centerX}% ${centerY}%, ${stops})`;
      }
    }

    // 否则使用具体的尺寸值
    if (this.radialData.shape === "circle") {
      // 正圆模式：需要计算实际的像素半径
      const container = document.getElementById("radial-canvas-container");
      const containerRect = container.getBoundingClientRect();
      const radiusPx = (sizeX / 100) * containerRect.height; // 圆的半径基于容器高度
      return `radial-gradient(circle ${radiusPx}px at ${centerX}% ${centerY}%, ${stops})`;
    } else {
      // 椭圆模式：可以使用百分比
      return `radial-gradient(ellipse ${sizeX}${unit} ${sizeY}${unit} at ${centerX}% ${centerY}%, ${stops})`;
    }
  }

  generateRadialGradientCSSHighlighted() {
    const centerX = this.radialData.center.x * 100;
    const centerY = this.radialData.center.y * 100;
    const sizeX = this.radialData.size.x;
    const sizeY = this.radialData.size.y;
    const unit = this.radialData.sizeUnit;
    const sizeKeyword = this.radialData.sizeKeyword;

    const stops = this.radialData.colorStops.map((stop) => `${stop.color} ${stop.position.toFixed(1)}`).join(", ");

    // 如果使用了尺寸关键字，直接使用关键字
    if (sizeKeyword) {
      if (this.radialData.shape === "circle") {
        return `<span class="css-function">radial-gradient</span><span class="css-bracket">(</span><span class="css-shape">circle</span> <span class="css-bracket">${sizeKeyword}</span> <span class="css-keyword">at</span> <span class="css-number">${centerX.toFixed(
          1
        )}</span><span class="css-unit">%</span> <span class="css-number">${centerY.toFixed(
          1
        )}</span><span class="css-unit">%</span><span class="css-comma">,</span> ${stops
          .split(",")
          .map((stop) => {
            const parts = stop.trim().split(" ");
            if (parts[0].startsWith("#")) {
              return `<span class="css-hash">#</span><span class="css-number">${parts[0].slice(
                1
              )}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
            } else {
              return `<span class="css-bracket">${parts[0]}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
            }
          })
          .join('<span class="css-comma">,</span> ')}<span class="css-bracket">)</span>`;
      } else {
        return `<span class="css-function">radial-gradient</span><span class="css-bracket">(</span><span class="css-shape">ellipse</span> <span class="css-bracket">${sizeKeyword}</span> <span class="css-keyword">at</span> <span class="css-number">${centerX.toFixed(
          1
        )}</span><span class="css-unit">%</span> <span class="css-number">${centerY.toFixed(
          1
        )}</span><span class="css-unit">%</span><span class="css-comma">,</span> ${stops
          .split(",")
          .map((stop) => {
            const parts = stop.trim().split(" ");
            if (parts[0].startsWith("#")) {
              return `<span class="css-hash">#</span><span class="css-number">${parts[0].slice(
                1
              )}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
            } else {
              return `<span class="css-bracket">${parts[0]}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
            }
          })
          .join('<span class="css-comma">,</span> ')}<span class="css-bracket">)</span>`;
      }
    }

    // 否则使用具体的尺寸值
    if (this.radialData.shape === "circle") {
      // 正圆模式：需要计算实际的像素半径
      const container = document.getElementById("radial-canvas-container");
      const containerRect = container.getBoundingClientRect();
      const radiusPx = (sizeX / 100) * containerRect.height; // 圆的半径基于容器高度

      return `<span class="css-function">radial-gradient</span><span class="css-bracket">(</span><span class="css-shape">circle</span> <span class="css-number">${radiusPx.toFixed(
        1
      )}</span><span class="css-unit">px</span> <span class="css-keyword">at</span> <span class="css-number">${centerX.toFixed(
        1
      )}</span><span class="css-unit">%</span> <span class="css-number">${centerY.toFixed(
        1
      )}</span><span class="css-unit">%</span><span class="css-comma">,</span> ${stops
        .split(",")
        .map((stop) => {
          const parts = stop.trim().split(" ");
          if (parts[0].startsWith("#")) {
            return `<span class="css-hash">#</span><span class="css-number">${parts[0].slice(
              1
            )}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
          } else {
            return `<span class="css-bracket">${parts[0]}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
          }
        })
        .join('<span class="css-comma">,</span> ')}<span class="css-bracket">)</span>`;
    } else {
      return `<span class="css-function">radial-gradient</span><span class="css-bracket">(</span><span class="css-shape">ellipse</span> <span class="css-number">${sizeX.toFixed(
        1
      )}</span><span class="css-unit">${unit}</span> <span class="css-number">${sizeY.toFixed(
        1
      )}</span><span class="css-unit">${unit}</span> <span class="css-keyword">at</span> <span class="css-number">${centerX.toFixed(
        1
      )}</span><span class="css-unit">%</span> <span class="css-number">${centerY.toFixed(
        1
      )}</span><span class="css-unit">%</span><span class="css-comma">,</span> ${stops
        .split(",")
        .map((stop) => {
          const parts = stop.trim().split(" ");
          if (parts[0].startsWith("#")) {
            return `<span class="css-hash">#</span><span class="css-number">${parts[0].slice(
              1
            )}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">%</span>`;
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
          return `<span class="css-hash">#</span><span class="css-number">${parts[0].slice(
            1
          )}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">deg</span>`;
        } else {
          return `<span class="css-bracket">${parts[0]}</span> <span class="css-number">${parts[1]}</span><span class="css-unit">deg</span>`;
        }
      })
      .join('<span class="css-comma">,</span> ')}<span class="css-bracket">)</span>`;
  }

  updateLinearCSS() {
    // 只在当前类型为linear时才更新线性渐变CSS
    if (this.currentType !== "linear") return;

    const cssElement = document.getElementById("linear-css");
    cssElement.innerHTML = this.generateLinearGradientCSSHighlighted();
  }

  updateRadialCSS() {
    // 只在当前类型为radial时才更新径向渐变CSS
    if (this.currentType !== "radial") return;

    const cssElement = document.getElementById("radial-css");
    cssElement.innerHTML = this.generateRadialGradientCSSHighlighted();
  }

  updateConicCSS() {
    // 只在当前类型为conic时才更新角度渐变CSS
    if (this.currentType !== "conic") return;

    const cssElement = document.getElementById("conic-css");
    cssElement.innerHTML = this.generateConicGradientCSSHighlighted();
  }

  updateRadialData() {
    const newShape = document.querySelector('input[name="radial-shape"]:checked').value;
    const sizeKeywordElement = document.querySelector('input[name="radial-size"]:checked');
    const newSizeKeyword = sizeKeywordElement ? sizeKeywordElement.value : null;

    // 如果形状发生变化，保存当前参数并恢复对应形状的参数
    if (newShape !== this.radialData.shape) {
      // 保存当前参数到对应的存储
      if (this.radialData.shape === "ellipse") {
        this.ellipseData.center = { ...this.radialData.center };
        this.ellipseData.size = { ...this.radialData.size };
        this.ellipseData.sizeUnit = this.radialData.sizeUnit;
        this.ellipseData.sizeKeyword = this.radialData.sizeKeyword;
        this.ellipseData.colorStops = this.radialData.colorStops.map((stop) => ({ ...stop }));
      } else if (this.radialData.shape === "circle") {
        this.circleData.center = { ...this.radialData.center };
        this.circleData.size = { ...this.radialData.size };
        this.circleData.sizeUnit = this.radialData.sizeUnit;
        this.circleData.sizeKeyword = this.radialData.sizeKeyword;
        this.circleData.colorStops = this.radialData.colorStops.map((stop) => ({ ...stop }));
      }

      // 恢复新形状的参数
      if (newShape === "ellipse") {
        this.radialData.center = { ...this.ellipseData.center };
        this.radialData.size = { ...this.ellipseData.size };
        this.radialData.sizeUnit = this.ellipseData.sizeUnit;
        this.radialData.sizeKeyword = this.ellipseData.sizeKeyword;
        this.radialData.colorStops = this.ellipseData.colorStops.map((stop) => ({ ...stop }));
      } else if (newShape === "circle") {
        this.radialData.center = { ...this.circleData.center };
        this.radialData.size = { ...this.circleData.size };
        this.radialData.sizeUnit = this.circleData.sizeUnit;
        this.radialData.sizeKeyword = this.circleData.sizeKeyword;
        this.radialData.colorStops = this.circleData.colorStops.map((stop) => ({ ...stop }));
      }
      // 更新HTML中的选中状态
      this.updateSizeKeywordSelection();
    }

    this.radialData.shape = newShape;
    this.radialData.sizeKeyword = newSizeKeyword;

    // 如果选择了尺寸关键字，计算对应的尺寸
    if (newSizeKeyword) {
      this.calculateSizeFromKeyword(newSizeKeyword);
    }
  }

  // 根据尺寸关键字计算尺寸
  calculateSizeFromKeyword(keyword) {
    const container = document.getElementById("radial-canvas-container");
    const containerRect = container.getBoundingClientRect();
    const centerX = this.radialData.center.x * containerRect.width;
    const centerY = this.radialData.center.y * containerRect.height;

    // 计算到各个边界的距离
    const distanceToLeft = centerX;
    const distanceToRight = containerRect.width - centerX;
    const distanceToTop = centerY;
    const distanceToBottom = containerRect.height - centerY;

    // 计算到各个角的距离
    const distanceToTopLeft = Math.sqrt(centerX * centerX + centerY * centerY);
    const distanceToTopRight = Math.sqrt(
      (containerRect.width - centerX) * (containerRect.width - centerX) + centerY * centerY
    );
    const distanceToBottomLeft = Math.sqrt(
      centerX * centerX + (containerRect.height - centerY) * (containerRect.height - centerY)
    );
    const distanceToBottomRight = Math.sqrt(
      (containerRect.width - centerX) * (containerRect.width - centerX) +
        (containerRect.height - centerY) * (containerRect.height - centerY)
    );

    let radiusX, radiusY;

    switch (keyword) {
      case "closest-side":
        // 等比缩放圆，直到圆和离圆最近的渲染范围边界相交
        if (this.radialData.shape === "circle") {
          const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);
          radiusX = radiusY = minDistance;
        } else {
          radiusX = Math.min(distanceToLeft, distanceToRight);
          radiusY = Math.min(distanceToTop, distanceToBottom);
        }
        break;

      case "farthest-side":
        // 等比缩放圆，直到圆和离圆最远的渲染范围边界相交
        if (this.radialData.shape === "circle") {
          const maxDistance = Math.max(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);
          radiusX = radiusY = maxDistance;
        } else {
          radiusX = Math.max(distanceToLeft, distanceToRight);
          radiusY = Math.max(distanceToTop, distanceToBottom);
        }
        break;

      case "closest-corner":
        // 等比缩放圆，直到圆和离圆最近的渲染范围的角相交
        const minCornerDistance = Math.min(
          distanceToTopLeft,
          distanceToTopRight,
          distanceToBottomLeft,
          distanceToBottomRight
        );
        if (this.radialData.shape === "circle") {
          radiusX = radiusY = minCornerDistance;
        } else {
          // 对于椭圆，closest-corner 表示椭圆刚好与最近的角落相交
          // 椭圆的形状应该根据到角落的实际距离来确定，不保持容器的宽高比
          // 找到最近的角落
          let closestCornerX, closestCornerY;
          if (
            distanceToTopLeft <= distanceToTopRight &&
            distanceToTopLeft <= distanceToBottomLeft &&
            distanceToTopLeft <= distanceToBottomRight
          ) {
            closestCornerX = 0;
            closestCornerY = 0;
          } else if (distanceToTopRight <= distanceToBottomLeft && distanceToTopRight <= distanceToBottomRight) {
            closestCornerX = containerRect.width;
            closestCornerY = 0;
          } else if (distanceToBottomLeft <= distanceToBottomRight) {
            closestCornerX = 0;
            closestCornerY = containerRect.height;
          } else {
            closestCornerX = containerRect.width;
            closestCornerY = containerRect.height;
          }

          // 计算椭圆半径，使其刚好经过最近的角落
          const dx = Math.abs(closestCornerX - centerX);
          const dy = Math.abs(closestCornerY - centerY);

          // 对于椭圆，使用椭圆标准方程：(x/rx)^2 + (y/ry)^2 = 1
          // 当椭圆经过角落时，满足：(dx/rx)^2 + (dy/ry)^2 = 1
          // 椭圆的形状比例 = 水平半径 / 垂直半径
          const aspectRatio = dx / dy;

          // 解方程：设 ry = k，则 rx = k * aspectRatio
          // 代入椭圆方程：(dx/(k*aspectRatio))^2 + (dy/k)^2 = 1
          // 化简：dx^2/(k^2*aspectRatio^2) + dy^2/k^2 = 1
          // 进一步：dx^2 + dy^2*aspectRatio^2 = k^2*aspectRatio^2
          // 所以：k = sqrt((dx^2 + dy^2*aspectRatio^2) / aspectRatio^2)
          const k = Math.sqrt((dx * dx + dy * dy * aspectRatio * aspectRatio) / (aspectRatio * aspectRatio));

          radiusX = k * aspectRatio;
          radiusY = k;
        }
        break;

      case "farthest-corner":
        // 等比缩放圆，直到圆和离圆最远的渲染范围的角相交
        const maxCornerDistance = Math.max(
          distanceToTopLeft,
          distanceToTopRight,
          distanceToBottomLeft,
          distanceToBottomRight
        );
        if (this.radialData.shape === "circle") {
          radiusX = radiusY = maxCornerDistance;
        } else {
          // 对于椭圆，farthest-corner 表示椭圆刚好与最远的角落相交
          // 椭圆的形状应该根据到角落的实际距离来确定，不保持容器的宽高比
          // 找到最远的角落
          let farthestCornerX, farthestCornerY;
          if (
            distanceToTopLeft >= distanceToTopRight &&
            distanceToTopLeft >= distanceToBottomLeft &&
            distanceToTopLeft >= distanceToBottomRight
          ) {
            farthestCornerX = 0;
            farthestCornerY = 0;
          } else if (distanceToTopRight >= distanceToBottomLeft && distanceToTopRight >= distanceToBottomRight) {
            farthestCornerX = containerRect.width;
            farthestCornerY = 0;
          } else if (distanceToBottomLeft >= distanceToBottomRight) {
            farthestCornerX = 0;
            farthestCornerY = containerRect.height;
          } else {
            farthestCornerX = containerRect.width;
            farthestCornerY = containerRect.height;
          }

          // 计算椭圆半径，使其刚好经过最远的角落
          const dx = Math.abs(farthestCornerX - centerX);
          const dy = Math.abs(farthestCornerY - centerY);

          // 对于椭圆，使用椭圆标准方程：(x/rx)^2 + (y/ry)^2 = 1
          // 当椭圆经过角落时，满足：(dx/rx)^2 + (dy/ry)^2 = 1
          // 椭圆的形状比例 = 水平半径 / 垂直半径
          const aspectRatio = dx / dy;

          // 解方程：设 ry = k，则 rx = k * aspectRatio
          // 代入椭圆方程：(dx/(k*aspectRatio))^2 + (dy/k)^2 = 1
          // 化简：dx^2/(k^2*aspectRatio^2) + dy^2/k^2 = 1
          // 进一步：dx^2 + dy^2*aspectRatio^2 = k^2*aspectRatio^2
          // 所以：k = sqrt((dx^2 + dy^2*aspectRatio^2) / aspectRatio^2)
          const k = Math.sqrt((dx * dx + dy * dy * aspectRatio * aspectRatio) / (aspectRatio * aspectRatio));

          radiusX = k * aspectRatio;
          radiusY = k;
        }
        break;
    }

    // 将像素值转换为百分比
    if (this.radialData.shape === "circle") {
      // 对于圆形，使用实际计算的半径值，不强制保持宽高比
      // 使用容器的最小尺寸作为基准，确保圆不会超出容器
      const minDimension = Math.min(containerRect.width, containerRect.height);
      this.radialData.size.x = (radiusX / minDimension) * 100;
    } else {
      this.radialData.size.x = (radiusX / containerRect.width) * 100;
      this.radialData.size.y = (radiusY / containerRect.height) * 100;
    }
  }

  // 清除尺寸关键字选中状态
  clearSizeKeywordSelection() {
    document.querySelectorAll('input[name="radial-size"]').forEach((radio) => {
      radio.checked = false;
    });
  }

  // 获取当前径向渐变的实际半径，严格按照CSS代码实现
  getCurrentRadialRadius() {
    const radialCanvas = this.canvases["radial-canvas"];
    const rect = radialCanvas.getBoundingClientRect();

    if (this.radialData.shape === "circle") {
      // 圆：使用容器的最小尺寸作为基准，与 calculateSizeFromKeyword 保持一致
      const minDimension = Math.min(rect.width, rect.height);
      return (this.radialData.size.x / 100) * minDimension;
    } else {
      // 椭圆：CSS代码中的 ellipse 50% 50% 表示水平半径是容器宽度的50%
      // 对于椭圆，色标位置应该基于水平半径（90度方向）
      return (this.radialData.size.x / 100) * rect.width;
    }
  }

  // 计算相对颜色（对比色）
  getContrastColor(color) {
    // 解析颜色
    const rgb = this.parseColor(color);
    if (!rgb) return "#ffffff"; // 默认白色

    // 计算亮度 (YIQ公式)
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

    // 如果亮度大于128，返回深色；否则返回浅色
    return brightness > 128 ? "#000000" : "#ffffff";
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
    // 使用CSS渐变插值计算颜色，而不是从Canvas采样
    const stops = this.radialData.colorStops;
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

  getColorAtConicAngle(angle) {
    // 根据角度在色标之间插值计算颜色
    const stops = this.conicData.colorStops;
    if (stops.length === 0) return "#000000";
    if (stops.length === 1) return stops[0].color;

    // 找到角度所在的色标区间
    for (let i = 0; i < stops.length - 1; i++) {
      const current = stops[i];
      const next = stops[i + 1];

      if (angle >= current.position && angle <= next.position) {
        const ratio = (angle - current.position) / (next.position - current.position);
        return this.interpolateColor(current.color, next.color, ratio);
      }
    }

    // 如果角度超出范围，返回最近的色标颜色
    if (angle <= stops[0].position) return stops[0].color;
    return stops[stops.length - 1].color;
  }

  openColorPicker(colorStop) {
    this.currentColorStop = colorStop;
    this.originalColor = colorStop.color; // 保存原始颜色
    this.showColorPicker(colorStop.color);
  }

  // 获取色标位置并计算拾色器位置
  getColorPickerPosition(colorStop) {
    // 使用记忆的位置（相对于视口的百分比）
    const pickerWidth = 320; // 拾色器宽度（未缩放）
    const pickerHeight = 575; // 拾色器高度（未缩放）

    // 计算基于百分比的位置（让拾色器中心点与屏幕中心点重合）
    // 当 this.colorPickerPosition.x = 50, y = 50 时，拾色器应该完全居中
    const pickerX = (this.colorPickerPosition.x / 100) * window.innerWidth - pickerWidth / 2;
    const pickerY = (this.colorPickerPosition.y / 100) * window.innerHeight - pickerHeight / 2;

    // 确保不超出屏幕边界，但优先保持居中位置
    let finalPickerX = pickerX;
    let finalPickerY = pickerY;

    // 只有当拾色器完全超出屏幕边界时才调整位置
    if (pickerX < 0) {
      finalPickerX = 0;
    } else if (pickerX + pickerWidth > window.innerWidth) {
      finalPickerX = window.innerWidth - pickerWidth;
    }

    if (pickerY < 0) {
      finalPickerY = 0;
    } else if (pickerY + pickerHeight > window.innerHeight) {
      finalPickerY = window.innerHeight - pickerHeight;
    }

    return { x: finalPickerX, y: finalPickerY };
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

  // 窗口大小改变时更新颜色选择器位置
  updateColorPickerPositionOnResize() {
    const overlay = document.getElementById("color-picker-overlay");
    const picker = document.querySelector(".color-picker");

    // 如果颜色选择器当前是显示的，则更新其位置
    if (overlay.classList.contains("show") && picker) {
      const position = this.getColorPickerPosition(this.currentColorStop);
      picker.style.left = `${position.x}px`;
      picker.style.top = `${position.y}px`;
    }
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

      // 保存位置（拾色器中心点相对于屏幕中心点的百分比）
      const pickerRect = picker.getBoundingClientRect();

      // 计算拾色器中心点位置
      const pickerCenterX = pickerRect.left + pickerRect.width / 2;
      const pickerCenterY = pickerRect.top + pickerRect.height / 2;

      // 计算相对于屏幕中心点的百分比位置
      const xPercent = (pickerCenterX / window.innerWidth) * 100;
      const yPercent = (pickerCenterY / window.innerHeight) * 100;

      // 保存位置
      this.colorPickerPosition = {
        x: Math.max(0, Math.min(100, xPercent)),
        y: Math.max(0, Math.min(100, yPercent)),
      };

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

      // 只渲染当前类型的Canvas
      if (this.currentType === "linear") {
        this.renderLinear();
        this.updateLinearColorStops();
        this.updateLinearCSS();
      } else if (this.currentType === "radial") {
        this.renderRadial();
        this.updateRadialColorStops();
        this.updateRadialCSS();
      } else if (this.currentType === "conic") {
        this.renderConic();
        this.updateConicCSS();
      }
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
      // 获取radial-canvas-container的尺寸和位置
      const container = document.getElementById("radial-canvas-container");
      const containerRect = container.getBoundingClientRect();

      const centerX = this.radialData.center.x * containerRect.width;
      const centerY = this.radialData.center.y * containerRect.height;

      // 计算鼠标在container坐标系中的位置
      const clickX = e.clientX - containerRect.left;
      const clickY = e.clientY - containerRect.top;

      // 只使用水平距离来计算色标位置，避免垂直移动影响
      const horizontalDistance = clickX - centerX;

      // 根据形状计算最大半径
      let maxRadius;
      if (this.radialData.shape === "circle") {
        maxRadius = (this.radialData.size.x / 100) * containerRect.height;
      } else {
        maxRadius = (this.radialData.size.x / 100) * containerRect.width;
      }

      // 如果鼠标在圆心右侧，正常计算位置
      if (horizontalDistance >= 0) {
        stop.position = Math.max(0, Math.min(100, (horizontalDistance / maxRadius) * 100));
      } else {
        // 如果鼠标在圆心左侧，限制色标位置为0（圆心位置）
        stop.position = 0;
      }

      // 更新色标显示方向（圆心上方或下方）
      stop.isAboveLine = clickY < centerY;

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
    this.dragTarget = { type: "conic-color-stop", stop: stop }; // 设置拖拽目标
    const canvas = this.canvases["conic-canvas"];
    const rect = canvas.getBoundingClientRect();
    const startY = e.clientY;
    let isDraggingUp = false;
    let isDraggingDown = false;
    let isInDeleteZone = false;

    const handleMouseMove = (e) => {
      const currentY = e.clientY;
      const deltaY = currentY - startY;

      // 计算圆心和半径
      const centerX = this.conicData.center.x * rect.width;
      const centerY = this.conicData.center.y * rect.height;
      const radius = Math.min(rect.width, rect.height) * 0.4;

      // 计算鼠标相对于圆心的位置
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const distanceFromCenter = Math.sqrt((mouseX - centerX) ** 2 + (mouseY - centerY) ** 2);
      const isInsideCircle = distanceFromCenter <= radius;

      // 实时计算色标的当前位置
      // 根据当前角度计算色标在圆外的位置
      const adjustedStopAngle = this.conicData.startAngle + stop.position - 90;
      const stopAngleRad = (adjustedStopAngle * Math.PI) / 180;
      const stopDistanceFromCenter = radius + 30; // 色标在圆外30px
      const stopX = centerX + Math.cos(stopAngleRad) * stopDistanceFromCenter;
      const stopY = centerY + Math.sin(stopAngleRad) * stopDistanceFromCenter;
      
      // 计算鼠标到色标中心点的直线距离
      const distanceFromStop = Math.sqrt((mouseX - stopX) ** 2 + (mouseY - stopY) ** 2);

      // 删除逻辑：如果在圆内部，不删除；如果在圆外部且距离色标50px以上，则删除
      if (isInsideCircle) {
        // 在圆内部，移除删除状态
        if (isInDeleteZone) {
          isInDeleteZone = false;
        }
        if (isDraggingUp || isDraggingDown) {
          isDraggingUp = false;
          isDraggingDown = false;
        }
      } else {
        // 在圆外部
        if (distanceFromStop > 75) {
          // 距离色标50px以上，进入删除状态
          if (!isDraggingDown) {
            isDraggingDown = true;
          }
          if (!isInDeleteZone) {
            isInDeleteZone = true;
          }
        } else {
          // 距离色标50px以内，移除删除状态
          if (isDraggingDown) {
            isDraggingDown = false;
          }
          if (isInDeleteZone) {
            isInDeleteZone = false;
          }
        }
      }

      // 角度拖拽调整位置
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const dx = clickX - centerX;
      const dy = clickY - centerY;
      const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;

      // 将角度偏移+90°，使其与显示角度一致
      const adjustedAngle = (angle + 90 + 360) % 360;
      
      // 计算相对于起始角度的位置
      const relativeAngle = (adjustedAngle - this.conicData.startAngle + 360) % 360;
      stop.position = Math.max(0, Math.min(360, relativeAngle));

      this.conicData.colorStops.sort((a, b) => a.position - b.position);
      this.renderConic();
      this.updateConicCSS();
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // 清除拖拽状态
      this.isDraggingColorStop = false;
      this.dragTarget = null;
      
      // 重新渲染以确保所有色标都恢复到默认状态
      this.renderConic();

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
      // 对于径向和角度渐变，在Canvas底部显示
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

  showRadialPreview(x, y, centerX, centerY, isAboveLine) {
    // 移除现有预览
    this.hideRadialPreview();

    // 获取radial-canvas-container的尺寸和位置
    const container = document.getElementById("radial-canvas-container");
    const containerRect = container.getBoundingClientRect();

    // 计算圆的右边界（基于container的尺寸）
    let maxRadius;
    if (this.radialData.shape === "circle") {
      // 对于圆形，使用容器的最小尺寸作为基准
      const minDimension = Math.min(containerRect.width, containerRect.height);
      maxRadius = (this.radialData.size.x / 100) * minDimension;
    } else {
      maxRadius = (this.radialData.size.x / 100) * containerRect.width;
    }

    const rightBound = centerX + maxRadius;

    // 计算预览色标的有效范围
    const validRangeStart = centerX - 40; // 圆心偏左40px
    const validRangeEnd = rightBound + 40; // 圆的右边界偏右40px

    // 检查光标是否在有效范围内
    if (x < validRangeStart || x > validRangeEnd) {
      return; // 不在有效范围内，不显示预览
    }

    // 计算预览色标的实际位置（限制在圆心到右边界之间）
    const actualX = Math.max(centerX, Math.min(rightBound, x));

    // 计算当前位置对应的渐变位置百分比
    const horizontalDistance = actualX - centerX;
    let position;
    if (horizontalDistance >= 0) {
      position = Math.max(0, Math.min(100, (horizontalDistance / maxRadius) * 100));
    } else {
      position = 0;
    }

    // 获取当前位置的渐变颜色
    const color = this.getColorAtRadialPosition(position);

    // 创建预览元素
    const preview = document.createElement("div");
    preview.className = "radial-color-stop preview";
    preview.style.setProperty("--色标-默认", color);
    preview.style.setProperty("--色标-相对色", this.getContrastColor(color)); // 使用相对颜色
    preview.style.opacity = "1";
    preview.style.zIndex = "25"; // 预览色标应该在最上层

    // 预览色标的水平中点应该始终和光标处于同一位置
    // 但实际位置不能小于圆心，不能超过圆的右边界
    preview.style.left = `${actualX}px`;

    if (isAboveLine) {
      // 圆心上方：预览色标的下边缘在圆心上方4px
      preview.style.top = `${centerY - 20}px`; // 18px(三角形高度) + 4px - 4px调整 = 18px
      preview.classList.remove("upside-down"); // 底边在上，尖角在下
    } else {
      // 圆心下方：预览色标的上边缘在圆心下方4px
      preview.style.top = `${centerY + 22}px`; // 4px + 4px调整 = 8px
      preview.classList.add("upside-down"); // 底边在下，尖角在上
    }

    // 添加到Canvas容器
    const canvasContainer = document.getElementById("radial-canvas-container");
    canvasContainer.appendChild(preview);
    this.radialPreview = preview;
  }

  hideRadialPreview() {
    if (this.radialPreview) {
      this.radialPreview.remove();
      this.radialPreview = null;
    }
  }

  showConicPreview(x, y, relativeAngle) {
    // 移除现有预览
    this.hideConicPreview();

    // 修正角度：将数学坐标系（向右为0°）转换为CSS坐标系（向上为0°）
    const cssAngle = (relativeAngle + 90) % 360;

    // 获取当前位置的渐变颜色
    const color = this.getColorAtConicAngle(cssAngle);

    // 计算预览色标位置（在圆外，朝向圆心）
    const canvas = this.canvases["conic-canvas"];
    const rect = canvas.getBoundingClientRect();
    const centerX = this.conicData.center.x * rect.width;
    const centerY = this.conicData.center.y * rect.height;
    const radius = Math.min(rect.width, rect.height) * 0.4;
    
    // 计算色标角度（相对于起始角度）
    const totalAngle = this.conicData.startAngle + relativeAngle;
    const angleRad = (totalAngle * Math.PI) / 180;

    // 色标位置在圆外30px
    const stopX = centerX + Math.cos(angleRad) * (radius + 30);
    const stopY = centerY + Math.sin(angleRad) * (radius + 30);

    // 保存预览色标信息，在renderConic中绘制
    this.conicPreviewData = {
      x: stopX,
      y: stopY,
      color: color,
      angle: angleRad,
      relativeAngle: relativeAngle
    };

    // 重新渲染Canvas以显示预览色标
    this.renderConic();
  }

  hideConicPreview() {
    if (this.conicPreviewData) {
      this.conicPreviewData = null;
      this.renderConic();
    }
  }

  updateSizeKeywordSelection() {
    // 先全部取消选中
    document.querySelectorAll('input[name="radial-size"]').forEach((radio) => {
      radio.checked = false;
    });
    // 恢复单位选中
    if (this.radialData.sizeUnit) {
      const unitRadio = document.querySelector(`input[name="radial-size"][value="${this.radialData.sizeUnit}"]`);
      if (unitRadio) unitRadio.checked = true;
    }
    // 恢复关键字选中
    if (this.radialData.sizeKeyword) {
      const keywordRadio = document.querySelector(`input[name="radial-size"][value="${this.radialData.sizeKeyword}"]`);
      if (keywordRadio) keywordRadio.checked = true;
    }
  }
}

// 初始化
new GradientTutorial();
