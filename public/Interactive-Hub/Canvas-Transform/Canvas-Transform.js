const 光标样式 = {
  默认: 'url("/Images/Common/鼠标-默认.cur"), auto',
  指向: 'url("/Images/Common/鼠标-指向.cur"), pointer',
  拖拽: 'url("/Images/Common/鼠标-拖拽.cur"), grab',
};

class CanvasTransform {
  constructor() {
    this.画布 = document.getElementById("canvas-transform");
    this.上下文 = this.画布.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.cssWidth = this.画布.clientWidth;
    this.cssHeight = this.画布.clientHeight;
    this.画布.width = this.cssWidth * this.dpr;
    this.画布.height = this.cssHeight * this.dpr;
    // 初始化setTransform参数（考虑DPI缩放，默认a和d为this.dpr）
    this.transformParams = {
      a: 1, // 水平缩放（滑块值，实际应用时会乘以this.dpr）
      b: 0, // 水平倾斜
      c: 0, // 垂直倾斜
      d: 1, // 垂直缩放（滑块值，实际应用时会乘以this.dpr）
      e: 0, // 水平平移
      f: 0, // 垂直平移
    };

    // 原点偏移（将原点移到画布中心）
    this.originX = this.cssWidth / 2;
    this.originY = this.cssHeight / 2;

    // 可拖拽矩形
    this.rect = this.loadRectPosition();

    // 鼠标位置
    this.mouseX = 0;
    this.mouseY = 0;

    // 防抖定时器
    this.resizeTimer = null;

    // 初始化
    this.init();
  }

  // 从sessionStorage加载矩形位置
  loadRectPosition() {
    const storedRect = sessionStorage.getItem("canvas-rect");
    if (storedRect) {
      try {
        const rect = JSON.parse(storedRect);
        return {
          ...rect,
          isDragging: false,
          isHovering: false,
        };
      } catch (e) {
        // 如果解析失败，使用默认坐标
        return this.getDefaultRect();
      }
    } else {
      // 如果没有存储的位置，使用默认坐标
      return this.getDefaultRect();
    }
  }

  // 获取默认矩形位置（坐标为0,0）
  getDefaultRect() {
    const rect = {
      x: 0,
      y: 0,
      width: 240,
      height: 160,
      isDragging: false,
      isHovering: false,
    };
    this.saveRectPosition(rect);
    return rect;
  }

  // 保存矩形位置到sessionStorage
  saveRectPosition(rect) {
    const rectToSave = {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
    sessionStorage.setItem("canvas-rect", JSON.stringify(rectToSave));
  }

  init() {
    this.bindEvents();
    this.initResizeObserver();
    this.draw();
  }

  initResizeObserver() {
    // 创建ResizeObserver实例
    this.resizeObserver = new ResizeObserver((entries) => {
      // 防抖处理
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }

      this.resizeTimer = setTimeout(() => {
        this.resize();
      }, 50); // 50ms防抖
    });

    // 观察Canvas元素的尺寸变化
    this.resizeObserver.observe(this.画布);
  }

  resize() {
    // 更新画布尺寸
    this.cssWidth = this.画布.clientWidth;
    this.cssHeight = this.画布.clientHeight;
    this.画布.width = this.cssWidth * this.dpr;
    this.画布.height = this.cssHeight * this.dpr;

    // 更新原点位置
    this.originX = this.cssWidth / 2;
    this.originY = this.cssHeight / 2;

    // 重新计算矩形位置（如果矩形超出新的画布范围）
    if (this.rect.x + this.rect.width > this.originX) {
      this.rect.x = this.originX - this.rect.width;
    }
    if (this.rect.y + this.rect.height > this.originY) {
      this.rect.y = this.originY - this.rect.height;
    }
    if (this.rect.x < -this.originX) {
      this.rect.x = -this.originX;
    }
    if (this.rect.y < -this.originY) {
      this.rect.y = -this.originY;
    }

    // 重绘画布
    this.draw();
  }

  bindEvents() {
    // 鼠标事件
    this.画布.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.画布.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.画布.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.画布.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
  }

  handleMouseDown(e) {
    const rect = this.画布.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - this.originX;
    const mouseY = e.clientY - rect.top - this.originY;

    // 考虑平移变换的影响
    const mouseXTransformed = mouseX - this.transformParams.e;
    const mouseYTransformed = mouseY - this.transformParams.f;

    // 检查是否点击在矩形上
    if (
      mouseXTransformed >= this.rect.x &&
      mouseXTransformed <= this.rect.x + this.rect.width &&
      mouseYTransformed >= this.rect.y &&
      mouseYTransformed <= this.rect.y + this.rect.height
    ) {
      this.rect.isDragging = true;
      this.画布.style.cursor = 光标样式.拖拽;
      // 记录鼠标相对于矩形左上角的偏移量
      this.rect.offsetX = mouseXTransformed - this.rect.x;
      this.rect.offsetY = mouseYTransformed - this.rect.y;
    }
  }

  handleMouseMove(e) {
    const rect = this.画布.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left - this.originX;
    this.mouseY = e.clientY - rect.top - this.originY;

    // 检查鼠标是否在矩形上
    if (!this.rect.isDragging) {
      // 考虑平移变换的影响
      const mouseXTransformed = this.mouseX - this.transformParams.e;
      const mouseYTransformed = this.mouseY - this.transformParams.f;

      const isHovering =
        mouseXTransformed >= this.rect.x &&
        mouseXTransformed <= this.rect.x + this.rect.width &&
        mouseYTransformed >= this.rect.y &&
        mouseYTransformed <= this.rect.y + this.rect.height;

      if (isHovering !== this.rect.isHovering) {
        this.rect.isHovering = isHovering;
        this.画布.style.cursor = isHovering ? 光标样式.指向 : 光标样式.默认;
        this.draw(); // 重绘矩形，更新悬停样式
      }
    } else {
      // 拖拽矩形，使用偏移量保持鼠标位置相对不变
      this.rect.x = this.mouseX - this.transformParams.e - this.rect.offsetX;
      this.rect.y = this.mouseY - this.transformParams.f - this.rect.offsetY;
      this.draw();
    }
  }

  handleMouseUp() {
    this.rect.isDragging = false;
    this.draw();
    // 保存矩形位置到sessionStorage
    this.saveRectPosition(this.rect);
  }

  handleMouseLeave() {
    this.rect.isDragging = false;
    this.rect.isHovering = false;
    this.画布.style.cursor = 光标样式.默认;
    this.draw();
  }

  draw() {
    // 清除画布（使用设备像素比例）
    this.上下文.clearRect(0, 0, this.cssWidth * this.dpr, this.cssHeight * this.dpr);

    // 保存当前状态
    this.上下文.save();

    // 应用变换（考虑DPI缩放）
    this.上下文.setTransform(
      this.transformParams.a * this.dpr,
      this.transformParams.b * this.dpr,
      this.transformParams.c * this.dpr,
      this.transformParams.d * this.dpr,
      (this.transformParams.e + this.originX) * this.dpr,
      (this.transformParams.f + this.originY) * this.dpr,
    );

    // 绘制经纬线
    this.drawGrid();

    // 绘制坐标轴
    this.drawAxes();

    // 绘制矩形
    this.drawRect();

    // 恢复状态
    this.上下文.restore();
  }

  drawGrid() {
    const gridSize = 20;
    const gridColor = "rgba(255, 255, 255, 0.1)";

    this.上下文.strokeStyle = gridColor;
    this.上下文.lineWidth = 1;

    // 计算需要绘制的网格范围（考虑变换后的可视区域）
    const padding = 1500; // 额外绘制的padding，确保填满整个Canvas
    const startX = -this.originX - padding;
    const endX = this.originX + padding;
    const startY = -this.originY - padding;
    const endY = this.originY + padding;

    // 绘制垂直线
    for (let x = startX; x <= endX; x += gridSize) {
      this.上下文.beginPath();
      this.上下文.moveTo(x, startY);
      this.上下文.lineTo(x, endY);
      this.上下文.stroke();
    }

    // 绘制水平线
    for (let y = startY; y <= endY; y += gridSize) {
      this.上下文.beginPath();
      this.上下文.moveTo(startX, y);
      this.上下文.lineTo(endX, y);
      this.上下文.stroke();
    }
  }

  drawAxes() {
    // 添加padding，确保坐标轴覆盖整个Canvas
    const padding = 1500;

    // X轴
    this.上下文.strokeStyle = "#259a5bff";
    this.上下文.lineWidth = 2;
    this.上下文.beginPath();
    this.上下文.moveTo(-this.originX - padding, 0);
    this.上下文.lineTo(this.originX + padding, 0);
    this.上下文.stroke();

    // Y轴
    this.上下文.strokeStyle = "#9f3131ff";
    this.上下文.beginPath();
    this.上下文.moveTo(0, -this.originY - padding);
    this.上下文.lineTo(0, this.originY + padding);
    this.上下文.stroke();

    // 绘制文本标签
    this.上下文.font = "14px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    this.上下文.textAlign = "center";
    this.上下文.textBaseline = "middle";

    // 绘制"原点"文本（位于坐标轴交汇处）
    this.上下文.fillStyle = "rgba(255, 255, 255, 0.8)";
    this.上下文.fillText("原点", 25, -15);

    this.上下文.font = "20px 'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    // 绘制"x"文本（位于x轴右侧）
    this.上下文.fillStyle = "#259a5bff";
    this.上下文.fillText("x", 400, -15);

    // 绘制"y"文本（位于y轴上方）
    this.上下文.fillStyle = "#9f3131ff";
    this.上下文.fillText("y", 20, -400);
  }

  drawRect() {
    // 绘制矩形
    if (this.rect.isHovering || this.rect.isDragging) {
      this.上下文.fillStyle = "rgba(59, 116, 182, 0.6)";
      this.上下文.strokeStyle = "#86beffff";
    } else {
      this.上下文.fillStyle = "rgba(45, 100, 163, 0.5)";
      this.上下文.strokeStyle = "rgba(74, 158, 255)";
    }

    this.上下文.lineWidth = 2;
    this.上下文.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    this.上下文.strokeRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
  }

  updateTransform(params) {
    this.transformParams = { ...this.transformParams, ...params };
    this.draw();
  }
}

// 初始化
window.canvasTransform = new CanvasTransform();

// 绑定滑块事件
window.addEventListener("DOMContentLoaded", () => {
  const sliders = [
    { id: "slider-a", param: "a", default: 1, min: -2, max: 2 },
    { id: "slider-b", param: "b", default: 0, min: -1, max: 1 },
    { id: "slider-c", param: "c", default: 0, min: -1, max: 1 },
    { id: "slider-d", param: "d", default: 1, min: -2, max: 2 },
    { id: "slider-e", param: "e", default: 0, min: -500, max: 500 },
    { id: "slider-f", param: "f", default: 0, min: -500, max: 500 },
  ];

  // 从sessionStorage中读取滑块值
  const loadSliderValues = () => {
    sliders.forEach(({ id, param, default: defaultValue }) => {
      const input = document.getElementById(id);
      const valueDisplay = input.nextElementSibling;

      if (input && valueDisplay) {
        // 从sessionStorage中读取值，否则使用默认值
        const storedValue = sessionStorage.getItem(`slider-${param}`);
        const value = storedValue ? parseFloat(storedValue) : defaultValue;

        // 设置滑块值
        input.value = value;

        // 格式化显示：平移参数显示整数，其他参数如果小数部分全部为0则显示整数，否则显示一位小数
        let formattedValue;
        if (param === "e" || param === "f") {
          formattedValue = value.toFixed(0);
        } else {
          // 检查是否为-0
          if (Object.is(value, -0)) {
            formattedValue = "0";
          }
          // 检查小数部分是否为0
          else if (value % 1 === 0) {
            formattedValue = value.toFixed(0);
          }
          // 检查一位小数后是否全部为0
          else {
            const oneDecimal = value.toFixed(1);
            if (Math.abs(parseFloat(oneDecimal)) < 0.01) {
              formattedValue = "0";
            } else if (oneDecimal.charAt(oneDecimal.length - 1) === "0") {
              formattedValue = parseInt(oneDecimal).toString();
            } else {
              formattedValue = oneDecimal;
            }
          }
        }
        valueDisplay.textContent = formattedValue;

        // 更新Canvas变换
        window.canvasTransform.updateTransform({ [param]: value });

        // 触发input事件以确保浏览器更新滑块位置
        const event = new Event("input", { bubbles: true });
        input.dispatchEvent(event);
      }
    });
  };

  // 保存滑块值到sessionStorage
  const saveSliderValue = (param, value) => {
    sessionStorage.setItem(`slider-${param}`, value.toString());
  };

  // 重置滑块值为默认值
  const resetSliderValues = () => {
    sliders.forEach(({ id, param, default: defaultValue }) => {
      const input = document.getElementById(id);
      const valueDisplay = input.nextElementSibling;

      if (input && valueDisplay) {
        // 设置默认值
        input.value = defaultValue;

        // 更新值显示
        let formattedValue;
        if (param === "e" || param === "f") {
          formattedValue = defaultValue.toFixed(0);
        } else {
          // 检查是否为-0
          if (Object.is(defaultValue, -0)) {
            formattedValue = "0";
          }
          // 检查小数部分是否为0
          else if (defaultValue % 1 === 0) {
            formattedValue = defaultValue.toFixed(0);
          }
          // 检查一位小数后是否全部为0
          else {
            const oneDecimal = defaultValue.toFixed(1);
            if (Math.abs(parseFloat(oneDecimal)) < 0.01) {
              formattedValue = "0";
            } else if (oneDecimal.charAt(oneDecimal.length - 1) === "0") {
              formattedValue = parseInt(oneDecimal).toString();
            } else {
              formattedValue = oneDecimal;
            }
          }
        }
        valueDisplay.textContent = formattedValue;

        // 更新Canvas变换
        window.canvasTransform.updateTransform({ [param]: defaultValue });

        // 从sessionStorage中删除该值
        sessionStorage.removeItem(`slider-${param}`);

        // 触发input事件以确保浏览器更新滑块位置
        const event = new Event("input", { bubbles: true });
        input.dispatchEvent(event);
      }
    });
  };

  // 绑定滑块输入事件
  sliders.forEach(({ id, param }) => {
    const input = document.getElementById(id);
    const valueDisplay = input.nextElementSibling;

    if (input && valueDisplay) {
      input.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        // 格式化显示：平移参数显示整数，其他参数如果小数部分为0则显示整数，否则显示一位小数
        let formattedValue;
        if (param === "e" || param === "f") {
          formattedValue = value.toFixed(0);
        } else {
          // 检查小数部分是否为0
          formattedValue = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
        }
        valueDisplay.textContent = formattedValue;

        // 更新Canvas变换
        window.canvasTransform.updateTransform({ [param]: value });

        // 保存值到sessionStorage
        saveSliderValue(param, value);
      });
    }
  });

  // 从sessionStorage加载旋转值
  const loadRotateValue = () => {
    const storedRotate = sessionStorage.getItem("slider-rotate");
    const value = storedRotate ? parseFloat(storedRotate) : 0;

    const rotateInput = document.getElementById("slider-rotate");
    const rotateValueDisplay = rotateInput?.nextElementSibling;
    if (rotateInput && rotateValueDisplay) {
      rotateInput.value = value;
      // 在数值后面添加"°"符号，并设置不同的颜色
      rotateValueDisplay.innerHTML = `${value}<span style="color: #86beff;">°</span>`;
    }
  };

  // 保存旋转值到sessionStorage
  const saveRotateValue = (value) => {
    sessionStorage.setItem("slider-rotate", value.toString());
  };

  // 绑定旋转滑块事件
  const rotateInput = document.getElementById("slider-rotate");
  const rotateValueDisplay = rotateInput?.nextElementSibling;
  if (rotateInput && rotateValueDisplay) {
    rotateInput.addEventListener("input", (e) => {
      const angle = parseFloat(e.target.value);
      // 在数值后面添加"°"符号，并设置不同的颜色
      rotateValueDisplay.innerHTML = `${angle}<span style="color: #86beff;">°</span>`;

      // 将角度转换为弧度
      const radians = (angle * Math.PI) / 180;

      // 计算旋转的变换矩阵参数
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);

      // 更新a、b、c、d的值
      const a = cos;
      const b = sin;
      const c = -sin;
      const d = cos;

      // 格式化数值的函数：旋转时显示精确到小数点后三位（最后一位是0则不显示），-0显示为0
      const formatValueRotate = (value) => {
        // 检查是否为-0
        if (Object.is(value, -0)) return "0";
        // 检查小数部分是否为0
        if (value % 1 === 0) return value.toFixed(0);
        // 检查是否接近0
        if (Math.abs(value) < 0.001) return "0";
        // 先格式化为三位小数
        let threeDecimal = value.toFixed(3);
        // 移除末尾的0
        while (threeDecimal.includes(".") && threeDecimal.endsWith("0")) {
          threeDecimal = threeDecimal.slice(0, -1);
        }
        // 如果末尾是小数点，也移除
        if (threeDecimal.endsWith(".")) {
          threeDecimal = threeDecimal.slice(0, -1);
        }
        return threeDecimal;
      };

      // 计算thumb位置的值（小数点后一位）
      const getThumbValue = (value) => {
        return parseFloat(value.toFixed(1));
      };

      // 更新a滑块
      const sliderA = document.getElementById("slider-a");
      const valueDisplayA = sliderA?.nextElementSibling;
      if (sliderA && valueDisplayA) {
        sliderA.value = getThumbValue(a); // thumb位置以小数点后一位为准
        valueDisplayA.textContent = formatValueRotate(a); // 显示精确到三位小数
      }

      // 更新b滑块
      const sliderB = document.getElementById("slider-b");
      const valueDisplayB = sliderB?.nextElementSibling;
      if (sliderB && valueDisplayB) {
        sliderB.value = getThumbValue(b); // thumb位置以小数点后一位为准
        valueDisplayB.textContent = formatValueRotate(b); // 显示精确到三位小数
      }

      // 更新c滑块
      const sliderC = document.getElementById("slider-c");
      const valueDisplayC = sliderC?.nextElementSibling;
      if (sliderC && valueDisplayC) {
        sliderC.value = getThumbValue(c); // thumb位置以小数点后一位为准
        valueDisplayC.textContent = formatValueRotate(c); // 显示精确到三位小数
      }

      // 更新d滑块
      const sliderD = document.getElementById("slider-d");
      const valueDisplayD = sliderD?.nextElementSibling;
      if (sliderD && valueDisplayD) {
        sliderD.value = getThumbValue(d); // thumb位置以小数点后一位为准
        valueDisplayD.textContent = formatValueRotate(d); // 显示精确到三位小数
      }

      // 更新Canvas变换
      window.canvasTransform.updateTransform({ a, b, c, d });

      // 保存值到sessionStorage
      saveSliderValue("a", a);
      saveSliderValue("b", b);
      saveSliderValue("c", c);
      saveSliderValue("d", d);
      saveRotateValue(angle);
    });
  }

  // 绑定重置按钮点击事件
  const resetButton = document.querySelector(".重置按钮");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      resetSliderValues();
      // 重置旋转滑块为0
      const rotateInput = document.getElementById("slider-rotate");
      const rotateValueDisplay = rotateInput?.nextElementSibling;
      if (rotateInput && rotateValueDisplay) {
        rotateInput.value = 0;
        rotateValueDisplay.innerHTML = `0<span style="color: #86beff;">°</span>`;
        // 保存重置后的值到sessionStorage
        saveRotateValue(0);
      }
      // 使用默认矩形位置（坐标为0,0）
      window.canvasTransform.rect = window.canvasTransform.getDefaultRect();
      window.canvasTransform.draw();
    });
  }

  // 初始化滑块值
  loadSliderValues();
  // 初始化旋转滑块值
  loadRotateValue();
});
