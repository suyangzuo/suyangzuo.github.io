class LengthVisualizer {
  constructor() {
    this.canvas = document.getElementById("lengthCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.currentUnit = "px";
    this.currentValue = 100;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.lineStartX = 0;
    this.lineStartY = 0;
    this.lineEndX = 0;
    this.lineEndY = 0;
    this.isHorizontal = true;
    this.hoveredPoint = null; // 悬停的拖拽点

    // 根元素font-size相关属性
    this.rootFontSize = 16; // 默认根元素font-size
    this.isRootFontButtonPressed = false; // 是否正在按住根元素font按钮
    this.rootFontButtonInterval = null; // 连续增减的定时器

    // 线条位置动画相关属性
    this.isAnimating = false; // 是否正在动画中
    this.animationStartTime = 0; // 动画开始时间
    this.animationDuration = 250; // 动画持续时间（毫秒）
    this.animationStartPos = { x1: 0, y1: 0, x2: 0, y2: 0 }; // 动画开始位置
    this.animationEndPos = { x1: 0, y1: 0, x2: 0, y2: 0 }; // 动画结束位置

    // 单位配置
    this.units = {
      px: {
        name: "像素",
        description: "像素（px）是CSS中最常用的绝对长度单位，1px等于屏幕上的一个像素点。",
        defaultValue: 100,
        maxValue: 1000,
      },
      rem: {
        name: "根元素字体大小",
        description: "rem单位相对于根元素（html）的字体大小。当前根元素字体大小为16px。",
        defaultValue: 10,
        maxValue: 50,
      },
      em: {
        name: "父元素字体大小",
        description: "em单位相对于父元素的字体大小。当前父元素字体大小为16px。",
        defaultValue: 10,
        maxValue: 50,
      },
      vw: {
        name: "视口宽度",
        description: "vw单位相对于视口宽度的百分比。当前视口宽度为",
        defaultValue: 10,
        maxValue: 100,
      },
      vh: {
        name: "视口高度",
        description: "vh单位相对于视口高度的百分比。当前视口高度为",
        defaultValue: 10,
        maxValue: 100,
      },
      ch: {
        name: "字符宽度",
        description: 'ch单位等于数字"0"的宽度。当前字体下1ch约等于8px。',
        defaultValue: 20,
        maxValue: 100,
      },
    };

    // 为每个单位存储独立的数值
    this.unitValues = {
      px: this.units.px.defaultValue,
      rem: this.units.rem.defaultValue,
      em: this.units.em.defaultValue,
      vw: this.units.vw.defaultValue,
      vh: this.units.vh.defaultValue,
      ch: this.units.ch.defaultValue,
    };

    // 设置初始值
    this.currentValue = this.unitValues[this.currentUnit];

    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.updateSliderRange();
    this.updateUnitSelection();

    // 初始化根元素font-size输入框的值
    const rootFontInput = document.getElementById("rootFontSizeInput");
    if (rootFontInput) {
      rootFontInput.value = this.rootFontSize;
    }

    // 确保根元素控制区初始状态是隐藏的
    const rootFontControl = document.getElementById("rootFontSizeControl");
    if (rootFontControl) {
      rootFontControl.classList.remove("show");
    }

    this.checkTitleOverlap(); // 检查与交互标题的重叠
    this.draw();
  }

  setupCanvas() {
    // 设置Canvas尺寸为全屏
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // 计算线条的垂直位置（交互标题下边界与控制区上边界之间的50%处）
    const titleElement = document.querySelector(".交互标题");
    const controlArea = document.querySelector(".控制区");
    let verticalCenter = this.canvas.height * 0.5; // 默认居中
    
    if (titleElement && controlArea && this.currentUnit !== "vh") {
      const titleRect = titleElement.getBoundingClientRect();
      const controlRect = controlArea.getBoundingClientRect();
      
      // 计算交互标题下边界与控制区上边界之间的中点
      const titleBottom = titleRect.bottom;
      const controlTop = controlRect.top; // 使用真实的控制区位置
      
      verticalCenter = titleBottom + (controlTop - titleBottom) * 0.5;
    }
    
    // 初始化线条位置
    if (this.currentUnit === "vw") {
      // vw单位：从视口左边缘开始
      this.lineStartX = 0;
      this.lineStartY = verticalCenter;
      this.lineEndX = this.getPixelValue();
      this.lineEndY = verticalCenter;
    } else if (this.currentUnit === "vh") {
      // vh单位：从视口顶部开始
      this.lineStartX = this.canvas.width * 0.5;
      this.lineStartY = 0;
      this.lineEndX = this.lineStartX;
      this.lineEndY = this.getPixelValue();
      
      // 立即检查与交互标题的重叠状态
      requestAnimationFrame(() => {
        this.checkTitleOverlap();
      });
    } else if (["px", "rem", "em", "ch"].includes(this.currentUnit)) {
      // px、rem、em、ch单位：居中显示
      const maxPixelValue = this.getMaxPixelValue();
      this.lineStartX = (this.canvas.width - maxPixelValue) / 2;
      this.lineStartY = verticalCenter;
      this.lineEndX = this.lineStartX + this.getPixelValue();
      this.lineEndY = verticalCenter;
    }
  }

  setupEventListeners() {
    // 单位选择事件
    document.querySelectorAll('input[name="unit"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const oldUnit = this.currentUnit;
        const newUnit = e.target.value;
        
        // 保存当前单位的数值
        this.unitValues[oldUnit] = this.currentValue;
        
        // 切换到新单位
        this.currentUnit = newUnit;
        
        // 恢复新单位的数值
        this.currentValue = this.unitValues[newUnit];
        
        this.updateUnitSelection();
        this.updateSliderRange();
        
        // 如果是vh单位，立即检查与交互标题的重叠
        if (newUnit === "vh") {
          // 延迟一帧确保DOM更新完成后再检查重叠
          requestAnimationFrame(() => {
            this.checkTitleOverlap();
          });
        } else {
          this.checkTitleOverlap(); // 检查与交互标题的重叠
        }
        
        this.draw();
      });
    });

    // 数值滑块事件
    const slider = document.getElementById("lengthSlider");
    slider.addEventListener("input", (e) => {
      // 如果正在动画中，不处理滑块输入
      if (this.isAnimating) return;
      
      this.currentValue = parseFloat(e.target.value);
      // 更新当前单位的存储值
      this.unitValues[this.currentUnit] = this.currentValue;
      
      this.updateValueDisplay();
      this.updateLinePosition();
      this.checkControlAreaOverlap(); // 检查重叠并更新透明度
      this.checkTitleOverlap(); // 检查与交互标题的重叠
      this.draw();
    });

    // 确保滑块初始值与currentValue匹配
    slider.value = this.currentValue;

    // Canvas拖拽事件 - 只在Canvas上监听鼠标按下
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));

    // 全局鼠标事件监听器，用于检测滑块拖拽状态和Canvas拖拽
    let isSliderDragging = false;

    slider.addEventListener("mousedown", () => {
      isSliderDragging = true;
      this.checkControlAreaOverlap(); // 开始拖拽时检查重叠
      this.checkTitleOverlap(); // 检查与交互标题的重叠
    });

    // 将鼠标移动和释放事件监听器添加到document上，确保拖拽时即使鼠标离开Canvas也能继续
    document.addEventListener("mousemove", (e) => {
      // 处理Canvas拖拽
      this.handleMouseMove(e);

      // 处理滑块拖拽
      if (isSliderDragging) {
        this.checkControlAreaOverlap(); // 滑块拖拽过程中实时检查重叠
        this.checkTitleOverlap(); // 检查与交互标题的重叠
      }
    });

    document.addEventListener("mouseup", () => {
      // 处理Canvas拖拽结束
      this.handleMouseUp();

      // 处理滑块拖拽结束
      if (isSliderDragging) {
        isSliderDragging = false;
        // 滑块拖拽结束后也要检查重叠状态，而不是直接恢复透明度
        this.checkControlAreaOverlap();
        this.checkTitleOverlap();
      }
    });

    // 窗口大小改变事件
    window.addEventListener("resize", () => {
      setTimeout(() => {
        this.setupCanvas();
        
        // 对于vw和vh单位，保持百分比值不变，只更新线条的实际像素长度
        if (this.currentUnit === "vw" || this.currentUnit === "vh") {
          // 保持currentValue（百分比值）不变，只更新线条位置
          if (!this.isAnimating) {
            this.updateLinePosition();
          }
        } else if (["px", "rem", "em", "ch"].includes(this.currentUnit)) {
          // 对于其他单位，需要重新计算线条位置
          if (!this.isAnimating) {
            this.updateLinePosition();
          }
        }
        
        // 确保z-index设置正确
        this.updateUnitSelection();
        
        // 如果是vh单位，立即检查与交互标题的重叠
        if (this.currentUnit === "vh") {
          requestAnimationFrame(() => {
            this.checkTitleOverlap();
          });
        } else {
          this.checkTitleOverlap(); // 检查与交互标题的重叠
        }
        
        this.draw();
      }, 100);
    });

    // 重置按钮事件
    const resetButton = document.querySelector(".重置按钮");
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        this.resetToDefault();
      });
    }

    // 根元素font-size控制事件
    this.setupRootFontSizeControls();
  }

  updateUnitSelection() {
    // 更新单位选项的选中状态
    document.querySelectorAll(".单位选项").forEach((option) => {
      option.classList.remove("selected");
    });
    document.querySelector(`label[for="unit-${this.currentUnit}"]`).classList.add("selected");

    // 更新unit-item的高亮状态
    document.querySelectorAll(".unit-item").forEach((item) => {
      item.classList.remove("selected");
      const unitEn = item.querySelector(".unit-en");
      if (unitEn && unitEn.textContent.trim() === this.currentUnit) {
        item.classList.add("selected");
      }
    });

    // 显示/隐藏根元素font-size控制区
    const rootFontControl = document.getElementById("rootFontSizeControl");
    // 记录切换前的单位
    if (!this._lastUnit) this._lastUnit = this.currentUnit;
    const oldUnit = this._lastUnit;
    this._lastUnit = this.currentUnit;

    if (rootFontControl) {
      if (this.currentUnit === "rem") {
        rootFontControl.classList.add("show");
        if (oldUnit !== "rem") {
          // 涉及rem切换时，使用跟随控制区的动画
          this.animateLineFollowControlArea();
        } else {
          // 其他单位切换到rem时，使用普通动画
          this.animateUnitTransition(oldUnit);
        }
      } else {
        rootFontControl.classList.remove("show");
        if (oldUnit === "rem") {
          // 从rem切换到其他单位时，使用跟随控制区的动画
          this.animateLineFollowControlArea();
        } else {
          // 其他单位之间切换时，使用普通动画
          this.animateUnitTransition(oldUnit);
        }
      }
    } else {
      // 如果没有根元素控制区，所有切换都使用普通动画
      this.animateUnitTransition(oldUnit);
    }

    // 根据单位类型设置不同的z-index层级
    const canvas = document.getElementById("lengthCanvas");
    const canvasContainer = document.querySelector(".canvas-container");

    if (this.currentUnit === "vh") {
      // vh单位：Canvas在顶栏上方，但在后退区、重置区、控制区下方
      canvas.style.zIndex = "9999";
      canvasContainer.style.zIndex = "9999";
      
      // 立即检查与交互标题的重叠状态
      requestAnimationFrame(() => {
        this.checkTitleOverlap();
      });
    } else {
      // 其他单位：Canvas在最底层，所有其他元素在上方
      canvas.style.zIndex = "1";
      canvasContainer.style.zIndex = "1";
    }
  }

  updateSliderRange() {
    const unit = this.units[this.currentUnit];
    const slider = document.getElementById("lengthSlider");
    slider.min = 1;
    slider.max = unit.maxValue;
    slider.step = this.currentUnit === "px" ? 1 : 0.1; // px单位step=1，其他单位step=0.1
    
    // 更新滑块的datalist属性，提供停顿感
    slider.setAttribute("list", `${this.currentUnit}-datalist`);
    
    // 只有在非动画状态下才更新滑块值
    if (!this.isAnimating) {
      slider.value = this.currentValue;
    }
    
    this.updateValueDisplay();
  }

  updateValueDisplay() {
    // 格式化数值，如果是浮点数则保留一位小数
    const formattedValue = Number.isInteger(this.currentValue) ? this.currentValue : this.currentValue.toFixed(1);
    document.getElementById("lengthValue").textContent = formattedValue;

    // 更新长度信息显示
    const lengthValue = document.querySelector(".length-value");
    const lengthUnit = document.querySelector(".length-unit");
    const unitDetails = document.querySelector(".unit-details");

    lengthValue.textContent = formattedValue;
    lengthUnit.textContent = this.currentUnit;

    // 动态更新rem单位的描述
    if (this.currentUnit === "rem") {
      unitDetails.textContent = `根元素字体大小 (${this.rootFontSize}px)`;
    } else {
      unitDetails.textContent = this.units[this.currentUnit].name;
    }
  }

  updateLinePosition() {
    // 如果正在动画中，不更新位置
    if (this.isAnimating) return;
    
    // 计算线条的垂直位置（交互标题下边界与控制区上边界之间的50%处）
    const titleElement = document.querySelector(".交互标题");
    const controlArea = document.querySelector(".控制区");
    let verticalCenter = this.canvas.height * 0.5; // 默认居中

    if (titleElement && controlArea && this.currentUnit !== "vh") {
      const titleRect = titleElement.getBoundingClientRect();
      const controlRect = controlArea.getBoundingClientRect();
      
      // 计算交互标题下边界与控制区上边界之间的中点
      const titleBottom = titleRect.bottom;
      const controlTop = controlRect.top; // 使用真实的控制区位置
      
      verticalCenter = titleBottom + (controlTop - titleBottom) * 0.5;
    }

    if (this.currentUnit === "vw") {
      // vw单位：从视口左边缘开始
      this.lineStartX = 0;
      this.lineStartY = verticalCenter;
      this.lineEndX = this.getPixelValue();
      this.lineEndY = verticalCenter;
    } else if (this.currentUnit === "vh") {
      // vh单位：从视口顶部开始
      this.lineStartX = this.canvas.width * 0.5;
      this.lineStartY = 0;
      this.lineEndX = this.lineStartX;
      this.lineEndY = this.getPixelValue();
    } else if (["px", "rem", "em", "ch"].includes(this.currentUnit)) {
      // px、rem、em、ch单位：居中显示
      const maxPixelValue = this.getMaxPixelValue();
      this.lineStartX = (this.canvas.width - maxPixelValue) / 2;
      this.lineStartY = verticalCenter;
      this.lineEndX = this.lineStartX + this.getPixelValue();
      this.lineEndY = verticalCenter;
    } else if (this.isHorizontal) {
      // 其他水平单位：保持适当的边距
      const margin = Math.min(this.canvas.width, this.canvas.height) * 0.1; // 10%的边距
      this.lineStartX = margin;
      this.lineStartY = verticalCenter;
      this.lineEndX = this.lineStartX + this.getPixelValue();
      this.lineEndY = verticalCenter;
    } else {
      // 其他垂直单位：保持原有逻辑
      this.lineEndX = this.lineStartX;
      this.lineEndY = this.lineStartY + this.getPixelValue();
    }
  }

  getPixelValue() {
    // 将当前单位的值转换为像素值
    switch (this.currentUnit) {
      case "px":
        return this.currentValue;
      case "rem":
        return this.currentValue * this.rootFontSize; // 使用自定义的根元素font-size
      case "em":
        return this.currentValue * parseFloat(getComputedStyle(document.body).fontSize);
      case "vw":
        return (this.currentValue / 100) * window.innerWidth;
      case "vh":
        return (this.currentValue / 100) * window.innerHeight;
      case "ch":
        return this.currentValue * 8; // 近似值
      default:
        return this.currentValue;
    }
  }

  getMaxPixelValue() {
    // 计算当前单位的最大像素值
    const maxValue = this.units[this.currentUnit].maxValue;
    switch (this.currentUnit) {
      case "px":
        return maxValue;
      case "rem":
        return maxValue * this.rootFontSize; // 使用自定义的根元素font-size
      case "em":
        return maxValue * parseFloat(getComputedStyle(document.body).fontSize);
      case "vw":
        return (maxValue / 100) * window.innerWidth;
      case "vh":
        return (maxValue / 100) * window.innerHeight;
      case "ch":
        return maxValue * 8; // 近似值
      default:
        return maxValue;
    }
  }

  pixelToUnitValue(pixelValue) {
    // 将像素值转换为单位值
    switch (this.currentUnit) {
      case "px":
        return pixelValue;
      case "rem":
        return pixelValue / this.rootFontSize; // 使用自定义的根元素font-size
      case "em":
        return pixelValue / parseFloat(getComputedStyle(document.body).fontSize);
      case "vw":
        return (pixelValue / window.innerWidth) * 100;
      case "vh":
        return (pixelValue / window.innerHeight) * 100;
      case "ch":
        return pixelValue / 8; // 近似值
      default:
        return pixelValue;
    }
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否点击在拖拽点上
    const tolerance = 15;
    if (this.isHorizontal) {
      if (Math.abs(x - this.lineStartX) < tolerance && Math.abs(y - this.lineStartY) < tolerance) {
        this.isDragging = "start";
        this.checkControlAreaOverlap(); // 检查重叠并设置透明度
        this.checkTitleOverlap(); // 检查与交互标题的重叠
      } else if (Math.abs(x - this.lineEndX) < tolerance && Math.abs(y - this.lineEndY) < tolerance) {
        this.isDragging = "end";
        this.checkControlAreaOverlap(); // 检查重叠并设置透明度
        this.checkTitleOverlap(); // 检查与交互标题的重叠
      }
    } else {
      if (Math.abs(x - this.lineStartX) < tolerance && Math.abs(y - this.lineStartY) < tolerance) {
        this.isDragging = "start";
        this.checkControlAreaOverlap(); // 检查重叠并设置透明度
        this.checkTitleOverlap(); // 检查与交互标题的重叠
      } else if (Math.abs(x - this.lineEndX) < tolerance && Math.abs(y - this.lineEndY) < tolerance) {
        this.isDragging = "end";
        this.checkControlAreaOverlap(); // 检查重叠并设置透明度
        this.checkTitleOverlap(); // 检查与交互标题的重叠
      }
    }
  }

  handleMouseMove(e) {
    // 获取鼠标坐标
    let x, y;
    if (this.isDragging) {
      // 拖拽状态下，使用相对于Canvas的坐标
      const rect = this.canvas.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      // 非拖拽状态下，检查鼠标是否在Canvas内
      const rect = this.canvas.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        return; // 鼠标不在Canvas内，不处理
      }
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // 检查鼠标悬停（只在非拖拽状态下）
    if (!this.isDragging) {
      const tolerance = 15;
      let newHoveredPoint = null;

      if (this.isHorizontal) {
        if (Math.abs(x - this.lineStartX) < tolerance && Math.abs(y - this.lineStartY) < tolerance) {
          newHoveredPoint = "start";
        } else if (Math.abs(x - this.lineEndX) < tolerance && Math.abs(y - this.lineEndY) < tolerance) {
          newHoveredPoint = "end";
        }
      } else {
        if (Math.abs(x - this.lineStartX) < tolerance && Math.abs(y - this.lineStartY) < tolerance) {
          newHoveredPoint = "start";
        } else if (Math.abs(x - this.lineEndX) < tolerance && Math.abs(y - this.lineEndY) < tolerance) {
          newHoveredPoint = "end";
        }
      }

      // 更新悬停状态
      if (newHoveredPoint !== this.hoveredPoint) {
        this.hoveredPoint = newHoveredPoint;
        this.draw();
      }
    }

    // 处理拖拽
    if (!this.isDragging) return;

    if (this.isDragging === "end") {
      if (this.currentUnit === "vw") {
        // vw单位：起点固定在视口左边缘，只能拖拽终点
        // 直接根据鼠标位置计算百分比值
        const percentage = (x / this.canvas.width) * 100;
        const processedValue = Math.round(percentage * 10) / 10;
        this.currentValue = Math.max(1, Math.min(this.units[this.currentUnit].maxValue, processedValue));
        this.lineEndX = this.getPixelValue(); // 根据百分比值计算像素位置
      } else if (this.currentUnit === "vh") {
        // vh单位：起点固定在视口顶部，只能拖拽终点
        // 直接根据鼠标位置计算百分比值
        const percentage = (y / this.canvas.height) * 100;
        const processedValue = Math.round(percentage * 10) / 10;
        this.currentValue = Math.max(1, Math.min(this.units[this.currentUnit].maxValue, processedValue));
        this.lineEndY = this.getPixelValue(); // 根据百分比值计算像素位置
      } else if (this.isHorizontal) {
        const newLength = x - this.lineStartX;
        if (newLength > 0) {
          // 将像素值转换为单位值
          const unitValue = this.pixelToUnitValue(newLength);
          // px单位四舍五入到整数，其他单位保留一位小数
          const processedValue = this.currentUnit === "px" ? Math.round(unitValue) : Math.round(unitValue * 10) / 10;
          this.currentValue = Math.max(1, Math.min(this.units[this.currentUnit].maxValue, processedValue));
          this.lineEndX = x;
        }
      } else {
        const newLength = y - this.lineStartY;
        if (newLength > 0) {
          // 将像素值转换为单位值
          const unitValue = this.pixelToUnitValue(newLength);
          // px单位四舍五入到整数，其他单位保留一位小数
          const processedValue = this.currentUnit === "px" ? Math.round(unitValue) : Math.round(unitValue * 10) / 10;
          this.currentValue = Math.max(1, Math.min(this.units[this.currentUnit].maxValue, processedValue));
          this.lineEndY = y;
        }
      }
    } else if (this.isDragging === "start") {
      if (this.currentUnit === "vw") {
        // vw单位：起点固定在视口左边缘，只能拖拽终点
        // 直接根据鼠标位置计算百分比值
        const percentage = (x / this.canvas.width) * 100;
        const processedValue = Math.round(percentage * 10) / 10;
        this.currentValue = Math.max(1, Math.min(this.units[this.currentUnit].maxValue, processedValue));
        this.lineStartX = 0; // 保持起点在视口左边缘
        this.lineEndX = this.getPixelValue(); // 根据百分比值计算像素位置
      } else if (this.currentUnit === "vh") {
        // vh单位：起点固定在视口顶部，只能拖拽终点
        // 直接根据鼠标位置计算百分比值
        const percentage = (y / this.canvas.height) * 100;
        const processedValue = Math.round(percentage * 10) / 10;
        this.currentValue = Math.max(1, Math.min(this.units[this.currentUnit].maxValue, processedValue));
        this.lineStartY = 0; // 保持起点在视口顶部
        this.lineEndY = this.getPixelValue(); // 根据百分比值计算像素位置
      } else if (["rem", "em", "ch"].includes(this.currentUnit)) {
        // rem、em、ch单位：保持居中，只能拖拽终点
        const newLength = this.lineEndX - x;
        if (newLength > 0) {
          const unitValue = this.pixelToUnitValue(newLength);
          const processedValue = this.currentUnit === "px" ? Math.round(unitValue) : Math.round(unitValue * 10) / 10;
          this.currentValue = Math.max(1, Math.min(this.units[this.currentUnit].maxValue, processedValue));
          // 重新计算居中位置
          const maxPixelValue = this.getMaxPixelValue();
          this.lineStartX = (this.canvas.width - maxPixelValue) / 2;
        }
      } else if (["px", "rem", "em", "ch"].includes(this.currentUnit)) {
        // px、rem、em、ch单位：保持居中，只能拖拽终点
        const newLength = this.lineEndX - x;
        if (newLength > 0) {
          const unitValue = this.pixelToUnitValue(newLength);
          const processedValue = this.currentUnit === "px" ? Math.round(unitValue) : Math.round(unitValue * 10) / 10;
          this.currentValue = Math.max(1, Math.min(this.units[this.currentUnit].maxValue, processedValue));
          // 重新计算居中位置
          const maxPixelValue = this.getMaxPixelValue();
          this.lineStartX = (this.canvas.width - maxPixelValue) / 2;
        }
      } else if (this.isHorizontal) {
        // 其他水平单位：保持最小边距
        const margin = Math.min(this.canvas.width, this.canvas.height) * 0.1; // 10%的边距
        const newLength = this.lineEndX - x;
        if (newLength > 0 && x >= margin) {
          // 将像素值转换为单位值
          const unitValue = this.pixelToUnitValue(newLength);
          // px单位四舍五入到整数，其他单位保留一位小数
          const processedValue = this.currentUnit === "px" ? Math.round(unitValue) : Math.round(unitValue * 10) / 10;
          this.currentValue = Math.max(1, Math.min(this.units[this.currentUnit].maxValue, processedValue));
          this.lineStartX = x;
        }
      } else {
        // 其他垂直单位：保持最小边距
        const margin = Math.min(this.canvas.width, this.canvas.height) * 0.1; // 10%的边距
        const newLength = this.lineEndY - y;
        if (newLength > 0 && y >= margin) {
          // 将像素值转换为单位值
          const unitValue = this.pixelToUnitValue(newLength);
          // px单位四舍五入到整数，其他单位保留一位小数
          const processedValue = this.currentUnit === "px" ? Math.round(unitValue) : Math.round(unitValue * 10) / 10;
          this.currentValue = Math.max(1, Math.min(this.units[this.currentUnit].maxValue, processedValue));
          this.lineStartY = y;
        }
      }
    }

    // 更新滑块和显示
    document.getElementById("lengthSlider").value = this.currentValue;
    // 更新当前单位的存储值
    this.unitValues[this.currentUnit] = this.currentValue;
    this.updateValueDisplay();
    // 如果不在动画中，才更新线条位置（vw和vh单位已经手动更新了位置）
    if (!this.isAnimating && this.currentUnit !== "vw" && this.currentUnit !== "vh") {
      this.updateLinePosition();
    }
    this.checkControlAreaOverlap(); // 检查重叠并更新透明度
    this.checkTitleOverlap(); // 检查与交互标题的重叠
    this.draw();
  }

  handleMouseUp() {
    this.isDragging = false;
    this.hoveredPoint = null; // 清除悬停状态

    // 松开鼠标后也要检查与交互标题的重叠状态
    this.checkTitleOverlap();

    this.draw(); // 重新绘制以清除悬停效果
  }

  draw() {
    // 清空Canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 设置线条样式
    this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--线条颜色");
    this.ctx.lineWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--线条宽度"));
    this.ctx.lineCap = "round";

    // 绘制线条
    this.ctx.beginPath();
    this.ctx.moveTo(this.lineStartX, this.lineStartY);
    this.ctx.lineTo(this.lineEndX, this.lineEndY);
    this.ctx.stroke();

    // 绘制拖拽点
    this.drawDragPoint(this.lineStartX, this.lineStartY, this.hoveredPoint === "start");
    this.drawDragPoint(this.lineEndX, this.lineEndY, this.hoveredPoint === "end");

    // 显示长度信息（横向线条在上方，纵向线条在右边）
    this.drawLengthInfo();

    // 更新信息显示位置
    this.updateInfoPosition();
  }

  drawDragPoint(x, y, isHovered) {
    const pointSize = isHovered
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue("--拖拽点悬停大小"))
      : parseInt(getComputedStyle(document.documentElement).getPropertyValue("--拖拽点大小"));
    const pointColor = isHovered
      ? getComputedStyle(document.documentElement).getPropertyValue("--拖拽点悬停颜色")
      : getComputedStyle(document.documentElement).getPropertyValue("--拖拽点颜色");

    this.ctx.fillStyle = pointColor;
    this.ctx.beginPath();
    this.ctx.arc(x, y, pointSize / 2, 0, 2 * Math.PI);
    this.ctx.fill();

    // 添加白色边框
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // 悬停时添加发光效果
    if (isHovered) {
      this.ctx.shadowColor = pointColor;
      this.ctx.shadowBlur = 10;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }
  }

  drawLengthInfo() {
    // 格式化数值，如果是浮点数则保留一位小数
    const formattedValue = Number.isInteger(this.currentValue) ? this.currentValue : this.currentValue.toFixed(1);

    // 设置字体样式
    this.ctx.font = '14px "JetBrains Mono", Consolas, monospace';
    this.ctx.textAlign = "left"; // 改为左对齐，便于控制间距
    this.ctx.textBaseline = "bottom";

    if (this.isHorizontal) {
      // 横向线条：在上方显示
      const centerX = (this.lineStartX + this.lineEndX) / 2;
      const textY = this.lineStartY - 20;

      // 计算文本宽度，确保固定间距
      const valueWidth = this.ctx.measureText(formattedValue).width;
      const unitWidth = this.ctx.measureText(this.currentUnit).width;
      const totalWidth = valueWidth + 2 + unitWidth; // 2px间距
      const startX = centerX - totalWidth / 2; // 居中对齐

      // 绘制当前单位长度（绿色）
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--选中单位颜色");
      this.ctx.fillText(formattedValue, startX, textY);

      // 绘制单位（蓝色），保持2px间隔
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--拖拽点颜色");
      this.ctx.fillText(this.currentUnit, startX + valueWidth + 2, textY);

      // 如果不是px单位，显示等量换算的px长度
      if (this.currentUnit !== "px") {
        const pixelValue = this.getPixelValue();
        const pixelTextY = textY - 20; // 在上方再显示一行

        // 计算px文本宽度
        const pixelValueText = pixelValue.toFixed(1);
        const pixelValueWidth = this.ctx.measureText(pixelValueText).width;
        const pixelUnitWidth = this.ctx.measureText("px").width;
        const pixelTotalWidth = pixelValueWidth + 2 + pixelUnitWidth;
        const pixelStartX = centerX - pixelTotalWidth / 2;

        // 绘制px数值（silver）
        this.ctx.fillStyle = "silver";
        this.ctx.fillText(pixelValueText, pixelStartX, pixelTextY);

        // 绘制px单位（gray），保持2px间隔
        this.ctx.fillStyle = "gray";
        this.ctx.fillText("px", pixelStartX + pixelValueWidth + 2, pixelTextY);
      }

      // 如果是ch单位，在线条下方显示数字
      if (this.currentUnit === "ch") {
        this.drawChNumbers();
      }
    } else {
      // 纵向线条：在右边显示
      const textX = this.lineEndX + 20;
      const centerY = (this.lineStartY + this.lineEndY) / 2;

      // 计算文本宽度
      const valueWidth = this.ctx.measureText(formattedValue).width;
      const unitWidth = this.ctx.measureText(this.currentUnit).width;
      const totalWidth = valueWidth + 2 + unitWidth;

      // 绘制当前单位长度（绿色）
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--选中单位颜色");
      this.ctx.fillText(formattedValue, textX, centerY);

      // 绘制单位（蓝色），保持2px间隔
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--拖拽点颜色");
      this.ctx.fillText(this.currentUnit, textX + valueWidth + 2, centerY);

      // 如果不是px单位，显示等量换算的px长度
      if (this.currentUnit !== "px") {
        const pixelValue = this.getPixelValue();

        // vh单位使用上下布局，其他单位使用左右布局
        if (this.currentUnit === "vh") {
          // vh单位：上下布局
          const pixelTextY = centerY - 20; // 在上方显示

          // 计算px文本宽度
          const pixelValueText = pixelValue.toFixed(1);
          const pixelValueWidth = this.ctx.measureText(pixelValueText).width;
          const pixelUnitWidth = this.ctx.measureText("px").width;
          const pixelTotalWidth = pixelValueWidth + 2 + pixelUnitWidth;
          const pixelStartX = textX; // 左对齐，与vh文本对齐

          // 绘制px数值（silver）
          this.ctx.fillStyle = "silver";
          this.ctx.fillText(pixelValueText, pixelStartX, pixelTextY);

          // 绘制px单位（gray），保持2px间隔
          this.ctx.fillStyle = "gray";
          this.ctx.fillText("px", pixelStartX + pixelValueWidth + 2, pixelTextY);
        } else {
          // 其他单位：左右布局
          const pixelTextX = textX + totalWidth + 20; // 在右边再显示一列

          // 计算px文本宽度
          const pixelValueText = pixelValue.toFixed(1);
          const pixelValueWidth = this.ctx.measureText(pixelValueText).width;
          const pixelUnitWidth = this.ctx.measureText("px").width;
          const pixelTotalWidth = pixelValueWidth + 2 + pixelUnitWidth;

          // 绘制px数值（silver）
          this.ctx.fillStyle = "silver";
          this.ctx.fillText(pixelValueText, pixelTextX, centerY);

          // 绘制px单位（gray），保持2px间隔
          this.ctx.fillStyle = "gray";
          this.ctx.fillText("px", pixelTextX + pixelValueWidth + 2, centerY);
        }
      }
    }
  }

  drawChNumbers() {
    // 为ch单位在线条下方显示数字
    const chCount = Math.ceil(this.currentValue); // 向上取整
    const digitWidth = 8; // 每个数字的宽度（近似值）
    const totalWidth = chCount * digitWidth;
    const startX = (this.lineStartX + this.lineEndX) / 2 - totalWidth / 2; // 居中对齐
    const textY = this.lineStartY + 30; // 在线条下方30px

    // 设置数字字体样式
    this.ctx.font = '12px "JetBrains Mono", Consolas, monospace';
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillStyle = "#888"; // 灰色数字

    // 绘制0-9重复的数字
    for (let i = 0; i < chCount; i++) {
      const digit = i % 10; // 0-9循环
      this.ctx.fillText(digit.toString(), startX + i * digitWidth, textY);
    }

    // 为每段0-9添加不同颜色的透明度覆盖
    const colors = [
      "rgba(255, 0, 0, 0.15)", // 红色
      "rgba(0, 255, 0, 0.15)", // 绿色
      "rgba(0, 0, 255, 0.15)", // 蓝色
      "rgba(255, 255, 0, 0.15)", // 黄色
      "rgba(255, 0, 255, 0.15)", // 紫色
      "rgba(0, 255, 255, 0.15)", // 青色
      "rgba(255, 165, 0, 0.15)", // 橙色
      "rgba(128, 0, 128, 0.15)", // 紫罗兰
      "rgba(0, 128, 0, 0.15)", // 深绿色
      "rgba(128, 128, 0, 0.15)", // 橄榄色
    ];

    // 计算完整的0-9段数和最后一段的数字数量
    const completeSegments = Math.floor(chCount / 10);
    const remainingDigits = chCount % 10;

    // 绘制完整段的覆盖
    for (let segment = 0; segment < completeSegments; segment++) {
      const segmentStartX = startX + segment * 10 * digitWidth;
      const segmentEndX = segmentStartX + 10 * digitWidth;
      const color = colors[segment % colors.length];

      this.ctx.fillStyle = color;
      this.ctx.fillRect(segmentStartX, textY - 2, segmentEndX - segmentStartX, 16);
    }

    // 绘制最后一段的覆盖（如果有剩余数字）
    if (remainingDigits > 0) {
      const lastSegmentStartX = startX + completeSegments * 10 * digitWidth;
      const lastSegmentEndX = lastSegmentStartX + remainingDigits * digitWidth;
      const color = colors[completeSegments % colors.length];

      this.ctx.fillStyle = color;
      this.ctx.fillRect(lastSegmentStartX, textY - 2, lastSegmentEndX - lastSegmentStartX, 16);
    }
  }

  updateInfoPosition() {
    const lengthInfo = document.querySelector(".length-info");
    const unitInfo = document.querySelector(".unit-info");

    // 根据线条方向调整信息显示位置
    if (this.isHorizontal) {
      lengthInfo.className = "length-info horizontal";
      unitInfo.className = "unit-info horizontal";

      const centerX = (this.lineStartX + this.lineEndX) / 2;
      lengthInfo.style.left = centerX + "px";
      unitInfo.style.left = centerX + "px";

      // 重置垂直位置
      lengthInfo.style.top = "";
      unitInfo.style.top = "";
    } else {
      lengthInfo.className = "length-info vertical";
      unitInfo.className = "unit-info vertical";

      const centerY = (this.lineStartY + this.lineEndY) / 2;
      lengthInfo.style.top = centerY + "px";
      unitInfo.style.top = centerY + "px";

      // 重置水平位置
      lengthInfo.style.left = "";
      unitInfo.style.left = "";
    }
  }

  // 切换线条方向（用于vw/vh单位）
  setLineDirection(isHorizontal) {
    this.isHorizontal = isHorizontal;
    
    // 计算线条的垂直位置（交互标题下边界与控制区上边界之间的50%处）
    const titleElement = document.querySelector(".交互标题");
    const controlArea = document.querySelector(".控制区");
    let verticalCenter = this.canvas.height * 0.5; // 默认居中
    
    if (titleElement && controlArea && this.currentUnit !== "vh") {
      const titleRect = titleElement.getBoundingClientRect();
      const controlRect = controlArea.getBoundingClientRect();
      
      // 计算交互标题下边界与控制区上边界之间的中点
      const titleBottom = titleRect.bottom;
      const controlTop = controlRect.top; // 使用真实的控制区位置
      
      verticalCenter = titleBottom + (controlTop - titleBottom) * 0.5;
    }
    
    if (this.currentUnit === "vw") {
      // vw单位：从视口左边缘开始，更好地体现"视口宽度"概念
      this.lineStartX = 0;
      this.lineStartY = verticalCenter;
      this.lineEndX = this.getPixelValue();
      this.lineEndY = verticalCenter;
    } else if (this.currentUnit === "vh") {
      // vh单位：从视口顶部开始，更好地体现"视口高度"概念
      this.lineStartX = this.canvas.width * 0.5;
      this.lineStartY = 0;
      this.lineEndX = this.lineStartX;
      this.lineEndY = this.getPixelValue();
    } else if (["px", "rem", "em", "ch"].includes(this.currentUnit)) {
      // px、rem、em、ch单位：居中显示
      const maxPixelValue = this.getMaxPixelValue();
      this.lineStartX = (this.canvas.width - maxPixelValue) / 2;
      this.lineStartY = verticalCenter;
      this.lineEndX = this.lineStartX + this.getPixelValue();
      this.lineEndY = verticalCenter;
    } else if (isHorizontal) {
      // 其他水平单位：保持适当的边距
      const margin = Math.min(this.canvas.width, this.canvas.height) * 0.1; // 10%的边距
      this.lineStartX = margin;
      this.lineStartY = verticalCenter;
      this.lineEndX = this.lineStartX + this.getPixelValue();
      this.lineEndY = verticalCenter;
    } else {
      // 其他垂直单位：保持适当的边距
      const margin = Math.min(this.canvas.width, this.canvas.height) * 0.1; // 10%的边距
      this.lineStartX = this.canvas.width * 0.5;
      this.lineStartY = margin;
      this.lineEndX = this.lineStartX;
      this.lineEndY = this.lineStartY + this.getPixelValue();
    }
    
    this.draw();
  }

  checkControlAreaOverlap() {
    const controlArea = document.querySelector(".控制区");
    if (!controlArea) return;

    // 获取控制区的位置和尺寸
    const controlRect = controlArea.getBoundingClientRect();

    // 获取Canvas的位置
    const canvasRect = this.canvas.getBoundingClientRect();

    // 将线条坐标转换为页面坐标
    const lineStartPageX = canvasRect.left + this.lineStartX;
    const lineStartPageY = canvasRect.top + this.lineStartY;
    const lineEndPageX = canvasRect.left + this.lineEndX;
    const lineEndPageY = canvasRect.top + this.lineEndY;

    // 检查线条是否与控制区重叠
    const isOverlapping = this.isLineIntersectingRect(
      lineStartPageX,
      lineStartPageY,
      lineEndPageX,
      lineEndPageY,
      controlRect.left,
      controlRect.top,
      controlRect.right,
      controlRect.bottom
    );

    // 设置控制区的透明度
    if (isOverlapping) {
      controlArea.classList.add("dragging");
    } else {
      controlArea.classList.remove("dragging");
    }
  }

  checkTitleOverlap() {
    const title = document.querySelector(".交互标题");
    if (!title) return;

    // 获取交互标题的位置和尺寸
    const titleRect = title.getBoundingClientRect();

    // 获取Canvas的位置
    const canvasRect = this.canvas.getBoundingClientRect();

    // 将线条坐标转换为页面坐标
    const lineStartPageX = canvasRect.left + this.lineStartX;
    const lineStartPageY = canvasRect.top + this.lineStartY;
    const lineEndPageX = canvasRect.left + this.lineEndX;
    const lineEndPageY = canvasRect.top + this.lineEndY;

    // 检查线条是否与交互标题重叠
    const isOverlapping = this.isLineIntersectingRect(
      lineStartPageX,
      lineStartPageY,
      lineEndPageX,
      lineEndPageY,
      titleRect.left,
      titleRect.top,
      titleRect.right,
      titleRect.bottom
    );

    // 设置交互标题的透明度
    if (isOverlapping) {
      title.classList.add("dragging");
    } else {
      title.classList.remove("dragging");
    }
  }

  isLineIntersectingRect(lineStartX, lineStartY, lineEndX, lineEndY, rectLeft, rectTop, rectRight, rectBottom) {
    // 检查线条是否与矩形相交
    // 使用线段与矩形相交的算法

    // 检查线条的端点是否在矩形内
    if (
      this.isPointInRect(lineStartX, lineStartY, rectLeft, rectTop, rectRight, rectBottom) ||
      this.isPointInRect(lineEndX, lineEndY, rectLeft, rectTop, rectRight, rectBottom)
    ) {
      return true;
    }

    // 检查线条是否与矩形的四条边相交
    const rectLines = [
      [rectLeft, rectTop, rectRight, rectTop], // 上边
      [rectRight, rectTop, rectRight, rectBottom], // 右边
      [rectRight, rectBottom, rectLeft, rectBottom], // 下边
      [rectLeft, rectBottom, rectLeft, rectTop], // 左边
    ];

    for (const rectLine of rectLines) {
      if (
        this.isLineIntersectingLine(
          lineStartX,
          lineStartY,
          lineEndX,
          lineEndY,
          rectLine[0],
          rectLine[1],
          rectLine[2],
          rectLine[3]
        )
      ) {
        return true;
      }
    }

    return false;
  }

  isPointInRect(x, y, rectLeft, rectTop, rectRight, rectBottom) {
    return x >= rectLeft && x <= rectRight && y >= rectTop && y <= rectBottom;
  }

  isLineIntersectingLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    // 检查两条线段是否相交
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denominator === 0) {
      return false; // 平行线
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  resetToDefault() {
    // 重置所有单位的存储值为默认值
    this.unitValues = {
      px: this.units.px.defaultValue,
      rem: this.units.rem.defaultValue,
      em: this.units.em.defaultValue,
      vw: this.units.vw.defaultValue,
      vh: this.units.vh.defaultValue,
      ch: this.units.ch.defaultValue,
    };

    // 重置单位到px
    this.currentUnit = "px";
    this.currentValue = this.unitValues[this.currentUnit];

    // 重置根元素font-size
    this.rootFontSize = 16;
    const rootFontInput = document.getElementById("rootFontSizeInput");
    if (rootFontInput) {
      rootFontInput.value = this.rootFontSize;
    }

    // 更新单位选择状态
    this.updateUnitSelection();

    // 更新滑块范围和值
    this.updateSliderRange();

    // 更新显示
    this.updateValueDisplay();

    // 更新线条位置
    if (!this.isAnimating) {
      this.updateLinePosition();
    }

    // 检查重叠状态
    this.checkTitleOverlap();

    // 清除控制区的dragging类，恢复透明度
    const controlArea = document.querySelector(".控制区");
    if (controlArea) {
      controlArea.classList.remove("dragging");
    }

    // 重新绘制
    this.draw();

    // 手动触发px单位的单选框选中状态
    const pxRadio = document.getElementById("unit-px");
    if (pxRadio) {
      pxRadio.checked = true;
    }
  }

  setupRootFontSizeControls() {
    const decreaseBtn = document.getElementById("decreaseRootFont");
    const increaseBtn = document.getElementById("increaseRootFont");
    const rootFontInput = document.getElementById("rootFontSizeInput");
    const resetBtn = document.getElementById("resetRootFont");

    if (!decreaseBtn || !increaseBtn || !rootFontInput) return;

    // 减少按钮事件
    decreaseBtn.addEventListener("mousedown", () => {
      this.isRootFontButtonPressed = true;
      this.decreaseRootFontSize();
      this.startContinuousDecrease();
    });

    increaseBtn.addEventListener("mousedown", () => {
      this.isRootFontButtonPressed = true;
      this.increaseRootFontSize();
      this.startContinuousIncrease();
    });

    // 重置按钮事件
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.rootFontSize = 16;
        if (rootFontInput) {
          rootFontInput.value = this.rootFontSize;
        }
        this.updateValueDisplay(); // 更新描述
        if (!this.isAnimating) {
          this.updateLinePosition();
        }
        this.draw();
      });
    }

    // 鼠标释放事件
    document.addEventListener("mouseup", () => {
      if (this.isRootFontButtonPressed) {
        this.isRootFontButtonPressed = false;
        this.stopContinuousChange();
      }
    });

    // 鼠标离开按钮事件
    decreaseBtn.addEventListener("mouseleave", () => {
      if (this.isRootFontButtonPressed) {
        this.stopContinuousChange();
      }
    });

    increaseBtn.addEventListener("mouseleave", () => {
      if (this.isRootFontButtonPressed) {
        this.stopContinuousChange();
      }
    });

    // 数值框输入事件
    rootFontInput.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      if (value >= 8 && value <= 32) {
        this.rootFontSize = value;
        this.updateValueDisplay(); // 更新描述
        if (!this.isAnimating) {
          this.updateLinePosition();
        }
        this.draw();
      }
    });

    // 数值框失去焦点事件
    rootFontInput.addEventListener("blur", (e) => {
      const value = parseInt(e.target.value);
      if (value < 8) {
        this.rootFontSize = 8;
        e.target.value = 8;
      } else if (value > 32) {
        this.rootFontSize = 32;
        e.target.value = 32;
      }
      this.updateValueDisplay(); // 更新描述
      if (!this.isAnimating) {
        this.updateLinePosition();
      }
      this.draw();
    });
  }

  decreaseRootFontSize() {
    if (this.rootFontSize > 8) {
      this.rootFontSize--;
      const rootFontInput = document.getElementById("rootFontSizeInput");
      if (rootFontInput) {
        rootFontInput.value = this.rootFontSize;
      }
      this.updateValueDisplay(); // 更新描述
      if (!this.isAnimating) {
        this.updateLinePosition();
      }
      this.draw();
    }
  }

  increaseRootFontSize() {
    if (this.rootFontSize < 32) {
      this.rootFontSize++;
      const rootFontInput = document.getElementById("rootFontSizeInput");
      if (rootFontInput) {
        rootFontInput.value = this.rootFontSize;
      }
      this.updateValueDisplay(); // 更新描述
      if (!this.isAnimating) {
        this.updateLinePosition();
      }
      this.draw();
    }
  }

  startContinuousDecrease() {
    this.rootFontButtonInterval = setInterval(() => {
      if (this.isRootFontButtonPressed) {
        this.decreaseRootFontSize();
      }
    }, 100); // 每100ms减少一次
  }

  startContinuousIncrease() {
    this.rootFontButtonInterval = setInterval(() => {
      if (this.isRootFontButtonPressed) {
        this.increaseRootFontSize();
      }
    }, 100); // 每100ms增加一次
  }

  stopContinuousChange() {
    if (this.rootFontButtonInterval) {
      clearInterval(this.rootFontButtonInterval);
      this.rootFontButtonInterval = null;
    }
  }

  // 开始线条位置动画
  startLineAnimation(targetPos) {
    // 记录动画开始位置
    this.animationStartPos = {
      x1: this.lineStartX,
      y1: this.lineStartY,
      x2: this.lineEndX,
      y2: this.lineEndY
    };
    
    // 记录动画结束位置
    this.animationEndPos = targetPos;
    
    // 开始动画
    this.isAnimating = true;
    this.animationStartTime = performance.now();
    
    // 启动动画循环
    this.animateLine();
  }

  // 动画循环
  animateLine() {
    if (!this.isAnimating) return;
    
    const currentTime = performance.now();
    const elapsed = currentTime - this.animationStartTime;
    const progress = Math.min(elapsed / this.animationDuration, 1);
    
    // 使用缓动函数（ease-out）
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    // 计算当前位置
    this.lineStartX = this.animationStartPos.x1 + (this.animationEndPos.x1 - this.animationStartPos.x1) * easeProgress;
    this.lineStartY = this.animationStartPos.y1 + (this.animationEndPos.y1 - this.animationStartPos.y1) * easeProgress;
    this.lineEndX = this.animationStartPos.x2 + (this.animationEndPos.x2 - this.animationStartPos.x2) * easeProgress;
    this.lineEndY = this.animationStartPos.y2 + (this.animationEndPos.y2 - this.animationStartPos.y2) * easeProgress;
    
    // 实时更新滑块值，实现thumb的平滑过渡
    const slider = document.getElementById("lengthSlider");
    if (slider) {
      slider.value = this.currentValue;
    }
    
    // 实时检查控制区重叠状态
    this.checkControlAreaOverlap();
    
    // 如果是vh单位，实时检查与交互标题的重叠状态
    if (this.currentUnit === "vh") {
      this.checkTitleOverlap();
    }
    
    // 重新绘制
    this.draw();
    
    // 检查动画是否完成
    if (progress < 1) {
      requestAnimationFrame(() => this.animateLine());
    } else {
      // 动画完成，确保位置和值精确
      this.isAnimating = false;
      this.updateLinePosition();
      this.updateValueDisplay();
      
      // 更新当前单位的存储值
      this.unitValues[this.currentUnit] = this.currentValue;
      
      // 确保滑块值精确
      if (slider) {
        slider.value = this.currentValue;
      }
      
      this.draw();
    }
  }

  // 计算目标位置但不立即应用
  calculateTargetPosition() {
    // 计算线条的垂直位置（交互标题下边界与控制区上边界之间的50%处）
    const titleElement = document.querySelector(".交互标题");
    const controlArea = document.querySelector(".控制区");
    let verticalCenter = this.canvas.height * 0.5; // 默认居中

    if (titleElement && controlArea && this.currentUnit !== "vh") {
      const titleRect = titleElement.getBoundingClientRect();
      const controlRect = controlArea.getBoundingClientRect();
      
      // 计算交互标题下边界与控制区上边界之间的中点
      const titleBottom = titleRect.bottom;
      const controlTop = controlRect.top; // 使用真实的控制区位置
      
      verticalCenter = titleBottom + (controlTop - titleBottom) * 0.5;
    }

    let targetPos = { x1: 0, y1: 0, x2: 0, y2: 0 };

    if (this.currentUnit === "vw") {
      // vw单位：从视口左边缘开始
      targetPos = {
        x1: 0,
        y1: verticalCenter,
        x2: this.getPixelValue(),
        y2: verticalCenter
      };
    } else if (this.currentUnit === "vh") {
      // vh单位：从视口顶部开始
      targetPos = {
        x1: this.canvas.width * 0.5,
        y1: 0,
        x2: this.canvas.width * 0.5,
        y2: this.getPixelValue()
      };
    } else if (["px", "rem", "em", "ch"].includes(this.currentUnit)) {
      // px、rem、em、ch单位：居中显示
      const maxPixelValue = this.getMaxPixelValue();
      targetPos = {
        x1: (this.canvas.width - maxPixelValue) / 2,
        y1: verticalCenter,
        x2: (this.canvas.width - maxPixelValue) / 2 + this.getPixelValue(),
        y2: verticalCenter
      };
    } else if (this.isHorizontal) {
      // 其他水平单位：保持适当的边距
      const margin = Math.min(this.canvas.width, this.canvas.height) * 0.1; // 10%的边距
      targetPos = {
        x1: margin,
        y1: verticalCenter,
        x2: margin + this.getPixelValue(),
        y2: verticalCenter
      };
    } else {
      // 其他垂直单位：保持原有逻辑
      targetPos = {
        x1: this.lineStartX,
        y1: this.lineStartY,
        x2: this.lineStartX,
        y2: this.lineStartY + this.getPixelValue()
      };
    }

    return targetPos;
  }

  // 动画：线条实时跟随根元素控制区高度变化（包括方向过渡）
  animateLineFollowControlArea() {
    const duration = 250;
    const startTime = performance.now();
    this.isAnimating = true;
    
    // 记录动画开始时的线条位置
    const startPos = {
      x1: this.lineStartX,
      y1: this.lineStartY,
      x2: this.lineEndX,
      y2: this.lineEndY
    };
    
    // 记录动画开始时的滑块值
    const slider = document.getElementById("lengthSlider");
    const startSliderValue = parseFloat(slider.value);
    
    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数（ease-out）
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      // 临时禁用动画检查，让updateLinePosition可以执行
      const wasAnimating = this.isAnimating;
      this.isAnimating = false;
      
      // 计算当前帧的目标位置
      this.updateLinePosition();
      const targetPos = {
        x1: this.lineStartX,
        y1: this.lineStartY,
        x2: this.lineEndX,
        y2: this.lineEndY
      };
      
      // 恢复动画状态
      this.isAnimating = wasAnimating;
      
      // 计算方向向量
      const startDirectionX = startPos.x2 - startPos.x1;
      const startDirectionY = startPos.y2 - startPos.y1;
      const targetDirectionX = targetPos.x2 - targetPos.x1;
      const targetDirectionY = targetPos.y2 - targetPos.y1;
      
      // 计算当前帧的方向向量（平滑过渡）
      const currentDirectionX = startDirectionX + (targetDirectionX - startDirectionX) * easeProgress;
      const currentDirectionY = startDirectionY + (targetDirectionY - startDirectionY) * easeProgress;
      
      // 计算线条中心点
      const startCenterX = (startPos.x1 + startPos.x2) / 2;
      const startCenterY = (startPos.y1 + startPos.y2) / 2;
      const targetCenterX = (targetPos.x1 + targetPos.x2) / 2;
      const targetCenterY = (targetPos.y1 + targetPos.y2) / 2;
      
      // 计算当前帧的中心点位置
      const currentCenterX = startCenterX + (targetCenterX - startCenterX) * easeProgress;
      const currentCenterY = startCenterY + (targetCenterY - startCenterY) * easeProgress;
      
      // 计算当前帧的像素长度
      const startPixelLength = Math.sqrt(startDirectionX * startDirectionX + startDirectionY * startDirectionY);
      const targetPixelLength = Math.sqrt(targetDirectionX * targetDirectionX + targetDirectionY * targetDirectionY);
      const currentPixelLength = startPixelLength + (targetPixelLength - startPixelLength) * easeProgress;
      
      // 标准化方向向量并应用当前长度
      const directionLength = Math.sqrt(currentDirectionX * currentDirectionX + currentDirectionY * currentDirectionY);
      if (directionLength > 0) {
        const normalizedDirectionX = currentDirectionX / directionLength;
        const normalizedDirectionY = currentDirectionY / directionLength;
        
        // 计算当前帧的线条位置
        const halfLength = currentPixelLength / 2;
        this.lineStartX = currentCenterX - normalizedDirectionX * halfLength;
        this.lineStartY = currentCenterY - normalizedDirectionY * halfLength;
        this.lineEndX = currentCenterX + normalizedDirectionX * halfLength;
        this.lineEndY = currentCenterY + normalizedDirectionY * halfLength;
      } else {
        // 如果方向向量为零，使用默认方向
        if (this.currentUnit === "vh") {
          // vh单位：垂直线条
          const halfLength = currentPixelLength / 2;
          this.lineStartX = currentCenterX;
          this.lineStartY = currentCenterY - halfLength;
          this.lineEndX = currentCenterX;
          this.lineEndY = currentCenterY + halfLength;
        } else {
          // 其他单位：水平线条
          const halfLength = currentPixelLength / 2;
          this.lineStartX = currentCenterX - halfLength;
          this.lineStartY = currentCenterY;
          this.lineEndX = currentCenterX + halfLength;
          this.lineEndY = currentCenterY;
        }
      }
      
      // 实时更新滑块值，实现thumb的平滑过渡
      if (slider) {
        slider.value = this.currentValue;
      }
      
      // 实时检查控制区重叠状态
      this.checkControlAreaOverlap();
      
      // 如果是vh单位，实时检查与交互标题的重叠状态
      if (this.currentUnit === "vh") {
        this.checkTitleOverlap();
      }
      
      this.draw();
      
      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        // 动画完成，确保位置精确
        this.isAnimating = false;
        this.updateLinePosition();
        this.updateValueDisplay();
        
        // 更新当前单位的存储值
        this.unitValues[this.currentUnit] = this.currentValue;
        
        // 确保滑块值精确
        if (slider) {
          slider.value = this.currentValue;
        }
        
        this.draw();
      }
    };
    animate();
  }

  // 动画：单位切换的平滑过渡（包括位置、长度和方向）
  animateUnitTransition(oldUnit) {
    const duration = 300; // 稍微增加动画时长，让过渡更自然
    const startTime = performance.now();
    this.isAnimating = true;
    
    // 记录动画开始时的线条位置和长度
    const startPos = {
      x1: this.lineStartX,
      y1: this.lineStartY,
      x2: this.lineEndX,
      y2: this.lineEndY
    };
    
    // 计算当前单位值对应的像素长度
    const startPixelLength = Math.sqrt(
      Math.pow(startPos.x2 - startPos.x1, 2) + Math.pow(startPos.y2 - startPos.y1, 2)
    );
    
    // 计算目标位置和长度
    const targetPos = this.calculateTargetPosition();
    const targetPixelLength = Math.sqrt(
      Math.pow(targetPos.x2 - targetPos.x1, 2) + Math.pow(targetPos.y2 - targetPos.y1, 2)
    );
    
    // 计算线条中心点（用于保持中心对齐）
    const startCenterX = (startPos.x1 + startPos.x2) / 2;
    const startCenterY = (startPos.y1 + startPos.y2) / 2;
    const targetCenterX = (targetPos.x1 + targetPos.x2) / 2;
    const targetCenterY = (targetPos.y1 + targetPos.y2) / 2;
    
    // 计算方向向量
    const startDirectionX = startPos.x2 - startPos.x1;
    const startDirectionY = startPos.y2 - startPos.y1;
    const targetDirectionX = targetPos.x2 - targetPos.x1;
    const targetDirectionY = targetPos.y2 - targetPos.y1;
    
    // 记录动画开始时的滑块值
    const slider = document.getElementById("lengthSlider");
    const startSliderValue = parseFloat(slider.value);
    
    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数（ease-out）
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      // 计算当前帧的中心点位置
      const currentCenterX = startCenterX + (targetCenterX - startCenterX) * easeProgress;
      const currentCenterY = startCenterY + (targetCenterY - startCenterY) * easeProgress;
      
      // 计算当前帧的像素长度（平滑过渡）
      const currentPixelLength = startPixelLength + (targetPixelLength - startPixelLength) * easeProgress;
      
      // 计算当前帧的方向向量（平滑过渡）
      const currentDirectionX = startDirectionX + (targetDirectionX - startDirectionX) * easeProgress;
      const currentDirectionY = startDirectionY + (targetDirectionY - startDirectionY) * easeProgress;
      
      // 标准化方向向量并应用当前长度
      const directionLength = Math.sqrt(currentDirectionX * currentDirectionX + currentDirectionY * currentDirectionY);
      if (directionLength > 0) {
        const normalizedDirectionX = currentDirectionX / directionLength;
        const normalizedDirectionY = currentDirectionY / directionLength;
        
        // 计算当前帧的线条位置
        const halfLength = currentPixelLength / 2;
        this.lineStartX = currentCenterX - normalizedDirectionX * halfLength;
        this.lineStartY = currentCenterY - normalizedDirectionY * halfLength;
        this.lineEndX = currentCenterX + normalizedDirectionX * halfLength;
        this.lineEndY = currentCenterY + normalizedDirectionY * halfLength;
      } else {
        // 如果方向向量为零，使用默认方向
        if (this.currentUnit === "vh") {
          // vh单位：垂直线条
          const halfLength = currentPixelLength / 2;
          this.lineStartX = currentCenterX;
          this.lineStartY = currentCenterY - halfLength;
          this.lineEndX = currentCenterX;
          this.lineEndY = currentCenterY + halfLength;
        } else {
          // 其他单位：水平线条
          const halfLength = currentPixelLength / 2;
          this.lineStartX = currentCenterX - halfLength;
          this.lineStartY = currentCenterY;
          this.lineEndX = currentCenterX + halfLength;
          this.lineEndY = currentCenterY;
        }
      }
      
      // 更新显示的值（实时计算当前像素长度对应的单位值）
      this.updateDisplayValueFromPixelLength(currentPixelLength);
      
      // 实时更新滑块值，实现thumb的平滑过渡
      if (slider) {
        slider.value = this.currentValue;
      }
      
      // 实时检查控制区重叠状态
      this.checkControlAreaOverlap();
      
      // 如果是vh单位，实时检查与交互标题的重叠状态
      if (this.currentUnit === "vh") {
        this.checkTitleOverlap();
      }
      
      this.draw();
      
      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        // 动画完成，确保位置和值精确
        this.isAnimating = false;
        this.updateLinePosition();
        this.updateValueDisplay();
        
        // 更新当前单位的存储值
        this.unitValues[this.currentUnit] = this.currentValue;
        
        // 确保滑块值精确
        if (slider) {
          slider.value = this.currentValue;
        }
        
        this.draw();
      }
    };
    animate();
  }

  // 根据像素长度更新显示的单位值
  updateDisplayValueFromPixelLength(pixelLength) {
    // 对于vw和vh单位，保持百分比值不变，不根据像素长度重新计算
    if (this.currentUnit === "vw" || this.currentUnit === "vh") {
      // 保持currentValue不变，只更新显示
      const formattedValue = Number.isInteger(this.currentValue) ? this.currentValue : this.currentValue.toFixed(1);
      document.getElementById("lengthValue").textContent = formattedValue;
      
      // 更新长度信息显示
      const lengthValue = document.querySelector(".length-value");
      const lengthUnit = document.querySelector(".length-unit");
      const unitDetails = document.querySelector(".unit-details");
      
      if (lengthValue) lengthValue.textContent = formattedValue;
      if (lengthUnit) lengthUnit.textContent = this.currentUnit;
      
      if (unitDetails) unitDetails.textContent = this.units[this.currentUnit].name;
      return;
    }
    
    // 将像素长度转换为当前单位的值
    let unitValue;
    switch (this.currentUnit) {
      case "px":
        unitValue = pixelLength;
        break;
      case "rem":
        unitValue = pixelLength / this.rootFontSize;
        break;
      case "em":
        unitValue = pixelLength / parseFloat(getComputedStyle(document.body).fontSize);
        break;
      case "ch":
        unitValue = pixelLength / 8; // 近似值
        break;
      default:
        unitValue = pixelLength;
    }
    
    // 更新当前值（不触发滑块更新，避免冲突）
    this.currentValue = unitValue;
    
    // 更新当前单位的存储值
    this.unitValues[this.currentUnit] = unitValue;
    
    // 更新显示
    const formattedValue = Number.isInteger(unitValue) ? unitValue : unitValue.toFixed(1);
    document.getElementById("lengthValue").textContent = formattedValue;
    
    // 更新长度信息显示
    const lengthValue = document.querySelector(".length-value");
    const lengthUnit = document.querySelector(".length-unit");
    const unitDetails = document.querySelector(".unit-details");
    
    if (lengthValue) lengthValue.textContent = formattedValue;
    if (lengthUnit) lengthUnit.textContent = this.currentUnit;
    
    // 动态更新rem单位的描述
    if (this.currentUnit === "rem") {
      if (unitDetails) unitDetails.textContent = `根元素字体大小 (${this.rootFontSize}px)`;
    } else {
      if (unitDetails) unitDetails.textContent = this.units[this.currentUnit].name;
    }
  }
}

// 初始化应用
document.addEventListener("DOMContentLoaded", () => {
  const visualizer = new LengthVisualizer();

  // 监听单位变化，为vw/vh设置不同的线条方向
  document.querySelectorAll('input[name="unit"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "vw") {
        visualizer.setLineDirection(true); // 水平线条
      } else if (e.target.value === "vh") {
        visualizer.setLineDirection(false); // 垂直线条
      } else {
        visualizer.setLineDirection(true); // 默认水平线条
      }
    });
  });
});
