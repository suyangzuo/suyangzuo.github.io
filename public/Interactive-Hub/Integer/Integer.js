class IntegerVisualizer {
  constructor() {
    this.canvas = document.getElementById("integerCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.currentType = "int"; // 默认int类型
    this.isSigned = true; // 默认有符号
    this.bits = []; // 存储位值
    this.bitSize = 32; // 默认32位
    this.hoveredBit = -1; // 悬停的位索引

    // 连续增减相关
    this.increaseInterval = null;
    this.decreaseInterval = null;
    this.intervalDelay = 100; // 初始延迟
    this.minIntervalDelay = 50; // 最小延迟
    this.increaseTimeout = null; // 增加按钮的延迟超时
    this.decreaseTimeout = null; // 减少按钮的延迟超时

    // DOM元素缓存
    this.domCache = {
      calculationContent: null,
      arrows: [],
      numberElements: [],
      resultElements: null,
      explainBtn: null,
      lastExpressionType: null, // 记录上次的表达式类型
      lastSignType: null, // 记录上次的符号类型
      lastIntegerType: null, // 记录上次的整数类型
    };

    // 整数类型配置
    this.integerTypes = {
      char: {
        name: "char",
        displayName: "char",
        size: 1, // 字节数
        bits: 8,
        description: "1字节 (8位)",
      },
      short: {
        name: "short",
        displayName: "short",
        size: 2,
        bits: 16,
        description: "2字节 (16位)",
      },
      int: {
        name: "int",
        displayName: "int",
        size: 4,
        bits: 32,
        description: "4字节 (32位)",
      },
      longlong: {
        name: "long long",
        displayName: "long long",
        size: 8,
        bits: 64,
        description: "8字节 (64位)",
      },
    };

    // 为每种类型存储独立的位值
    this.typeBits = {
      char: this.generateRandomBits(8),
      short: this.generateRandomBits(16),
      int: this.generateRandomBits(32),
      longlong: this.generateRandomBits(64),
    };

    // 为每种类型存储符号设置
    this.typeSigns = {
      char: true,
      short: true,
      int: true,
      longlong: true,
    };

    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.updateTypeSelection();
    this.updateSignSelection();
    this.draw();
    // 确保初始值与随机生成的数字一致
    this.updateValueFromBits();
    // 初始化极值按钮状态
    this.updateExtremeButtons();

    // 初始化DOM缓存
    this.cacheDOMElements();
  }

  setupCanvas() {
    // 获取设备像素比
    const dpr = window.devicePixelRatio || 1;

    // 获取容器宽度
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const maxBitSize = 35; // 最大格子尺寸
    const gap = 5;
    const padding = 100; // 左右各50px的内边距

    // 考虑内边距后的可用宽度
    const availableWidth = containerWidth - padding;

    // 计算合适的格子尺寸，确保不超过最大值
    const bitsPerRow = Math.floor(availableWidth / (maxBitSize + gap));

    // 特殊处理不同类型的换行逻辑
    let actualBitsPerRow;
    if (this.currentType === "longlong") {
      // 对于long long类型，优先使用32位换行，如果空间不够则使用16位换行
      if (bitsPerRow >= 32) {
        actualBitsPerRow = 32; // 32个格子换行（4字节）
      } else if (bitsPerRow >= 16) {
        actualBitsPerRow = 16; // 16个格子换行（2字节）
      } else {
        actualBitsPerRow = 8; // 如果空间实在不够，使用8位换行（1字节）
      }
    } else if (this.currentType === "int") {
      // 对于int类型，优先使用单行显示，空间不够时再换行
      if (bitsPerRow >= 32) {
        actualBitsPerRow = 32; // 单行显示32个格子
      } else if (bitsPerRow >= 16) {
        actualBitsPerRow = 16; // 2行，每行16个
      } else {
        actualBitsPerRow = 8; // 4行，每行8个
      }
    } else {
      // 其他类型保持原有逻辑
      const bytesPerRow = Math.floor(bitsPerRow / 8) * 8;
      actualBitsPerRow = Math.max(8, bytesPerRow); // 至少8位（1字节）
    }

    // 根据实际每行格子数计算合适的格子尺寸
    const totalBytesInRow = Math.ceil(actualBitsPerRow / 8);
    const totalGaps = actualBitsPerRow - 1 + (totalBytesInRow - 1); // 格子间距 + 字节间距
    const totalExtraGaps = (totalBytesInRow - 1) * maxBitSize; // 字节间的额外间距

    // 计算格子尺寸，确保不超过最大值
    const bitWidth = Math.min(maxBitSize, (availableWidth - totalGaps * gap - totalExtraGaps) / actualBitsPerRow);

    // 设置Canvas的CSS尺寸为容器宽度
    this.canvas.style.width = containerWidth + "px";

    // 设置Canvas的实际尺寸（考虑DPI缩放）
    this.canvas.width = containerWidth * dpr;
    this.canvas.height = 200 * dpr; // 临时高度，稍后会重新计算

    // 缩放绘图上下文以匹配DPI
    this.ctx.scale(dpr, dpr);

    // 计算实际需要的宽度（包含字节间距）
    const totalBytes = Math.ceil(this.bitSize / 8);
    const bytesPerRowActual = Math.ceil(actualBitsPerRow / 8);
    const rows = Math.ceil(totalBytes / bytesPerRowActual);

    // 调整高度以适应新的字节分隔线布局和更大的行距
    const bytes = Math.ceil(this.bitSize / 8);
    const calculatedHeight = rows * (bitWidth + gap + 80) + bytes * 50 + 80; // 增加行距到80px

    // 重新设置Canvas的实际高度
    this.canvas.height = calculatedHeight * dpr;

    // 重新缩放绘图上下文（因为重新设置尺寸会重置变换）
    this.ctx.scale(dpr, dpr);

    // 存储当前格子尺寸，供其他方法使用
    this.currentBitSize = bitWidth;

    // 初始化位值 - 只在类型切换时重新初始化，视口改变时保持原有值
    if (!this.bits || this.bits.length !== this.integerTypes[this.currentType].bits) {
      this.bits = [...this.typeBits[this.currentType]];
      this.bitSize = this.integerTypes[this.currentType].bits;
    }
  }

  setupEventListeners() {
    // 整数类型选择事件
    document.querySelectorAll('input[name="integerType"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const oldType = this.currentType;
        const newType = e.target.value;

        // 保存当前类型的位值
        this.typeBits[oldType] = [...this.bits];
        this.typeSigns[oldType] = this.isSigned;

        // 切换到新类型
        this.currentType = newType;
        this.bits = [...this.typeBits[newType]];
        this.isSigned = this.typeSigns[newType];
        this.bitSize = this.integerTypes[newType].bits;

        // 清除DOM缓存，强制重新生成
        this.domCache.calculationContent = null;
        this.domCache.lastExpressionType = null;
        this.domCache.lastSignType = null;
        this.domCache.lastIntegerType = null;

        this.updateTypeSelection();
        this.updateSignSelection();
        this.setupCanvas();
        this.draw();
        this.updateValueFromBits();
        this.updateExtremeButtons();
      });
    });

    // 符号选择事件
    document.querySelectorAll('input[name="signType"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const newSignType = e.target.value === "signed";

        // 只有当符号类型真正改变时才执行更新
        if (this.isSigned !== newSignType) {
          this.isSigned = newSignType;
          this.typeSigns[this.currentType] = this.isSigned;

          // 清除DOM缓存，强制重新生成
          this.domCache.calculationContent = null;
          this.domCache.lastExpressionType = null;
          this.domCache.lastSignType = null;

          this.updateSignSelection();
          this.draw();
          this.updateValueFromBits();
          this.updateExtremeButtons();
        }
      });
    });

    // 数值输入框事件
    const valueInput = document.getElementById("currentValue");
    valueInput.addEventListener("input", (e) => {
      const inputValue = e.target.value.trim();

      // 允许空值、单独的负号、以及有效的数字
      if (inputValue === "" || inputValue === "-") {
        // 不触发任何事件，保持当前状态
        return;
      }

      // 检查是否是有效的数字（包括负数）
      const numberValue = parseInt(inputValue);
      if (isNaN(numberValue)) {
        // 无效输入，恢复为当前值
        e.target.value = this.calculateValue();
        return;
      }

      // 有效数字，更新位值
      this.setValueToBits(numberValue);
      // 使用智能更新
      this.updateCalculationExpression();
      // 控制解释原理按钮的显示
      this.updateExplainButtonVisibility();
      this.redrawCanvasOnly();
    });

    // 添加失去焦点事件，处理不完整的输入
    valueInput.addEventListener("blur", (e) => {
      const inputValue = e.target.value.trim();

      // 如果输入为空或只有负号，恢复为当前值
      if (inputValue === "" || inputValue === "-") {
        e.target.value = this.calculateValue();
      }
    });

    // 增减按钮事件
    const increaseBtn = document.getElementById("increaseBtn");
    const decreaseBtn = document.getElementById("decreaseBtn");
    const valueInputGroup = document.querySelector(".数值输入组");

    // 增加按钮
    increaseBtn.addEventListener("mousedown", (e) => {
      // 只响应左键点击
      if (e.button !== 0) return;

      e.preventDefault(); // 阻止默认行为
      increaseBtn.classList.add("active");
      valueInputGroup.classList.add("button-active");

      // 立即增加一次值
      this.increaseValue();

      // 延迟750ms后开始连续增加，避免误触
      this.increaseTimeout = setTimeout(() => {
        this.startContinuousIncrease();
      }, 750);
    });

    increaseBtn.addEventListener("mouseup", (e) => {
      // 只响应左键释放
      if (e.button !== 0) return;

      increaseBtn.classList.remove("active");
      // 清除延迟超时
      if (this.increaseTimeout) {
        clearTimeout(this.increaseTimeout);
        this.increaseTimeout = null;
      }
      this.stopContinuousChange();
      // 检查鼠标是否在数值输入组内
      if (!valueInputGroup.matches(":hover")) {
        valueInputGroup.classList.remove("button-active");
      }
    });

    increaseBtn.addEventListener("mouseleave", () => {
      increaseBtn.classList.remove("active");
      // 清除延迟超时
      if (this.increaseTimeout) {
        clearTimeout(this.increaseTimeout);
        this.increaseTimeout = null;
      }
      this.stopContinuousChange();
      // 鼠标离开按钮区域时，移除数值输入组的激活样式
      valueInputGroup.classList.remove("button-active");
    });

    // 减少按钮
    decreaseBtn.addEventListener("mousedown", (e) => {
      // 只响应左键点击
      if (e.button !== 0) return;

      e.preventDefault(); // 阻止默认行为
      decreaseBtn.classList.add("active");
      valueInputGroup.classList.add("button-active");

      // 立即减少一次值
      this.decreaseValue();

      // 延迟750ms后开始连续减少，避免误触
      this.decreaseTimeout = setTimeout(() => {
        this.startContinuousDecrease();
      }, 750);
    });

    decreaseBtn.addEventListener("mouseup", (e) => {
      // 只响应左键释放
      if (e.button !== 0) return;

      decreaseBtn.classList.remove("active");
      // 清除延迟超时
      if (this.decreaseTimeout) {
        clearTimeout(this.decreaseTimeout);
        this.decreaseTimeout = null;
      }
      this.stopContinuousChange();
      // 检查鼠标是否在数值输入组内
      if (!valueInputGroup.matches(":hover")) {
        valueInputGroup.classList.remove("button-active");
      }
    });

    decreaseBtn.addEventListener("mouseleave", () => {
      decreaseBtn.classList.remove("active");
      // 清除延迟超时
      if (this.decreaseTimeout) {
        clearTimeout(this.decreaseTimeout);
        this.decreaseTimeout = null;
      }
      this.stopContinuousChange();
      // 鼠标离开按钮区域时，移除数值输入组的激活样式
      valueInputGroup.classList.remove("button-active");
    });

    // 数值输入组鼠标离开事件
    valueInputGroup.addEventListener("mouseleave", () => {
      // 如果按钮没有激活状态，则移除阴影
      if (!increaseBtn.classList.contains("active") && !decreaseBtn.classList.contains("active")) {
        valueInputGroup.classList.remove("button-active");
      }
    });

    // 全局鼠标事件，确保松开鼠标时停止
    document.addEventListener("mouseup", (e) => {
      // 只响应左键释放
      if (e.button !== 0) return;

      increaseBtn.classList.remove("active");
      decreaseBtn.classList.remove("active");

      // 清除延迟超时
      if (this.increaseTimeout) {
        clearTimeout(this.increaseTimeout);
        this.increaseTimeout = null;
      }
      if (this.decreaseTimeout) {
        clearTimeout(this.decreaseTimeout);
        this.decreaseTimeout = null;
      }

      this.stopContinuousChange();

      // 检查鼠标是否在数值输入组内
      if (!valueInputGroup.matches(":hover")) {
        valueInputGroup.classList.remove("button-active");
      }
    });

    // 阻止右键菜单
    increaseBtn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    decreaseBtn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    // 最大值最小值按钮事件
    const maxBtn = document.getElementById("maxBtn");
    const minBtn = document.getElementById("minBtn");

    maxBtn.addEventListener("click", (e) => {
      // 只响应左键点击
      if (e.button !== 0) return;

      e.preventDefault();
      this.setToMaxValue();
    });

    minBtn.addEventListener("click", (e) => {
      // 只响应左键点击
      if (e.button !== 0) return;

      e.preventDefault();
      this.setToMinValue();
    });

    // 阻止右键菜单
    maxBtn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    minBtn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    // Canvas鼠标事件
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("click", (e) => this.handleClick(e));
    this.canvas.addEventListener("mouseleave", () => {
      if (this.hoveredBit !== -1) {
        this.hoveredBit = -1;
        // 只重绘Canvas，不重新生成计算表达式
        this.redrawCanvasOnly();
      }
    });

    // 窗口大小改变事件
    window.addEventListener("resize", () => {
      setTimeout(() => {
        // 视口改变时需要重新生成DOM，因为布局可能发生变化
        this.domCache.calculationContent = null;
        this.domCache.lastExpressionType = null;
        this.domCache.lastSignType = null;
        this.domCache.lastIntegerType = null;

        this.setupCanvas();
        this.draw();
      }, 100);
    });

    // 解释原理按钮事件 - 使用事件委托处理动态生成的按钮
    const principleDialog = document.getElementById("principleDialog");
    const closeDialogBtn = document.getElementById("closeDialogBtn");

    // 使用事件委托监听解释原理按钮的点击
    document.addEventListener("click", (e) => {
      if (e.target && e.target.id === "explainBtn") {
        this.showPrincipleDialog();
      }
    });

    closeDialogBtn.addEventListener("click", () => {
      this.hidePrincipleDialog();
    });

    // 点击对话框背景关闭
    principleDialog.addEventListener("click", (e) => {
      if (e.target === principleDialog) {
        this.hidePrincipleDialog();
      }
    });

    // ESC键关闭对话框
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && principleDialog.classList.contains("show")) {
        this.hidePrincipleDialog();
      }
    });
  }

  startContinuousIncrease() {
    this.intervalDelay = 100;
    this.increaseValue();
    this.increaseInterval = setInterval(() => {
      this.intervalDelay = Math.max(this.minIntervalDelay, this.intervalDelay * 0.9);
      this.increaseValue();

      // 检查是否达到最大值，如果达到则停止连续增加
      const inputValue = document.getElementById("currentValue").value.trim();
      const currentValue = parseInt(inputValue) || 0;
      let maxValue;
      if (this.isSigned) {
        maxValue = Math.pow(2, this.bitSize - 1) - 1;
      } else {
        maxValue = Math.pow(2, this.bitSize) - 1;
      }

      if (currentValue >= maxValue) {
        this.stopContinuousChange();
        document.getElementById("increaseBtn").classList.remove("active");
        document.querySelector(".数值输入组").classList.remove("button-active");
      }
    }, this.intervalDelay);
  }

  startContinuousDecrease() {
    this.intervalDelay = 100;
    this.decreaseValue();
    this.decreaseInterval = setInterval(() => {
      this.intervalDelay = Math.max(this.minIntervalDelay, this.intervalDelay * 0.9);
      this.decreaseValue();

      // 检查是否达到最小值，如果达到则停止连续减少
      const inputValue = document.getElementById("currentValue").value.trim();
      const currentValue = parseInt(inputValue) || 0;
      let minValue;
      if (this.isSigned) {
        minValue = -Math.pow(2, this.bitSize - 1);
      } else {
        minValue = 0;
      }

      if (currentValue <= minValue) {
        this.stopContinuousChange();
        document.getElementById("decreaseBtn").classList.remove("active");
        document.querySelector(".数值输入组").classList.remove("button-active");
      }
    }, this.intervalDelay);
  }

  stopContinuousChange() {
    if (this.increaseInterval) {
      clearInterval(this.increaseInterval);
      this.increaseInterval = null;
    }
    if (this.decreaseInterval) {
      clearInterval(this.decreaseInterval);
      this.decreaseInterval = null;
    }
    // 清除延迟超时
    if (this.increaseTimeout) {
      clearTimeout(this.increaseTimeout);
      this.increaseTimeout = null;
    }
    if (this.decreaseTimeout) {
      clearTimeout(this.decreaseTimeout);
      this.decreaseTimeout = null;
    }
    this.intervalDelay = 100;
  }

  increaseValue() {
    const inputValue = document.getElementById("currentValue").value.trim();
    const currentValue = parseInt(inputValue) || 0;

    // 计算当前类型的最大值
    let maxValue;
    if (this.isSigned) {
      maxValue = Math.pow(2, this.bitSize - 1) - 1; // 有符号整数的最大值
    } else {
      maxValue = Math.pow(2, this.bitSize) - 1; // 无符号整数的最大值
    }

    // 如果当前值已经达到最大值，则不再增加
    if (currentValue >= maxValue) {
      return;
    }

    const newValue = currentValue + 1;
    this.setValueToBits(newValue);
    // 使用智能更新
    this.updateCalculationExpression();
    // 控制解释原理按钮的显示
    this.updateExplainButtonVisibility();
    this.redrawCanvasOnly();
  }

  decreaseValue() {
    const inputValue = document.getElementById("currentValue").value.trim();
    const currentValue = parseInt(inputValue) || 0;

    // 计算当前类型的最小值
    let minValue;
    if (this.isSigned) {
      minValue = -Math.pow(2, this.bitSize - 1); // 有符号整数的最小值
    } else {
      minValue = 0; // 无符号整数的最小值
    }

    // 如果当前值已经达到最小值，则不再减少
    if (currentValue <= minValue) {
      return;
    }

    const newValue = currentValue - 1;
    this.setValueToBits(newValue);
    // 使用智能更新
    this.updateCalculationExpression();
    // 控制解释原理按钮的显示
    this.updateExplainButtonVisibility();
    this.redrawCanvasOnly();
  }

  setValueToBits(value) {
    // 根据当前类型和符号设置计算位值
    if (this.isSigned) {
      this.setSignedValueToBits(value);
    } else {
      this.setUnsignedValueToBits(value);
    }

    // 更新输入框值
    document.getElementById("currentValue").value = value;

    // 保存到当前类型
    this.typeBits[this.currentType] = [...this.bits];

    // 更新极值按钮状态
    this.updateExtremeButtons();
  }

  setUnsignedValueToBits(value) {
    // 确保值在范围内
    const maxValue = Math.pow(2, this.bitSize) - 1;
    value = Math.max(0, Math.min(value, maxValue));

    // 转换为二进制
    for (let i = 0; i < this.bitSize; i++) {
      this.bits[i] = (value >> (this.bitSize - 1 - i)) & 1;
    }
  }

  setSignedValueToBits(value) {
    // 确保值在范围内
    const maxValue = Math.pow(2, this.bitSize - 1) - 1;
    const minValue = -Math.pow(2, this.bitSize - 1);
    value = Math.max(minValue, Math.min(value, maxValue));

    if (value >= 0) {
      // 正数，直接转换
      this.setUnsignedValueToBits(value);
    } else {
      // 负数，使用补码
      const absValue = Math.abs(value);
      this.setUnsignedValueToBits(absValue);

      // 取反
      for (let i = 0; i < this.bitSize; i++) {
        this.bits[i] = this.bits[i] === 0 ? 1 : 0;
      }

      // 加1
      let carry = 1;
      for (let i = this.bitSize - 1; i >= 0; i--) {
        const sum = this.bits[i] + carry;
        this.bits[i] = sum % 2;
        carry = Math.floor(sum / 2);
      }
    }
  }

  updateValueFromBits() {
    const value = this.calculateValue();
    document.getElementById("currentValue").value = value;

    // 更新极值按钮状态
    this.updateExtremeButtons();
  }

  updateTypeSelection() {
    // 更新整数类型选项的选中状态
    document.querySelectorAll(".整数类型选项").forEach((option) => {
      option.classList.remove("selected");
    });

    // 更新radio按钮的checked状态
    document.querySelectorAll('input[name="integerType"]').forEach((radio) => {
      radio.checked = false;
    });

    const targetRadio = document.getElementById(`type-${this.currentType}`);
    const targetLabel = document.querySelector(`label[for="type-${this.currentType}"]`);

    if (targetRadio && targetLabel) {
      targetRadio.checked = true;
      targetLabel.classList.add("selected");
    }
  }

  updateSignSelection() {
    // 更新符号选项的选中状态
    document.querySelectorAll(".符号选项").forEach((option) => {
      option.classList.remove("selected");
    });

    // 更新radio按钮的checked状态
    document.querySelectorAll('input[name="signType"]').forEach((radio) => {
      radio.checked = false;
    });

    const signValue = this.isSigned ? "signed" : "unsigned";
    const targetRadio = document.getElementById(signValue);
    const targetLabel = document.querySelector(`label[for="${signValue}"]`);

    if (targetRadio && targetLabel) {
      targetRadio.checked = true;
      targetLabel.classList.add("selected");
    }
  }

  generateRandomBits(bitCount) {
    const bits = [];
    for (let i = 0; i < bitCount; i++) {
      bits.push(Math.random() < 0.5 ? 0 : 1);
    }
    return bits;
  }

  getBitRect(index) {
    const bitWidth = this.currentBitSize || 35; // 使用动态计算的格子尺寸，默认35px
    const bitHeight = bitWidth; // 确保宽高相等
    const gap = 5;
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth; // 使用容器宽度而不是Canvas实际宽度
    const padding = 100; // 左右各50px的内边距
    const availableWidth = containerWidth - padding;
    const bitsPerRow = Math.floor(availableWidth / (bitWidth + gap));

    // 特殊处理不同类型的换行逻辑
    let actualBitsPerRow;
    if (this.currentType === "longlong") {
      // 对于long long类型，优先使用32位换行，如果空间不够则使用16位换行
      if (bitsPerRow >= 32) {
        actualBitsPerRow = 32; // 32个格子换行（4字节）
      } else if (bitsPerRow >= 16) {
        actualBitsPerRow = 16; // 16个格子换行（2字节）
      } else {
        actualBitsPerRow = 8; // 如果空间实在不够，使用8位换行（1字节）
      }
    } else if (this.currentType === "int") {
      // 对于int类型，优先使用单行显示，空间不够时再换行
      if (bitsPerRow >= 32) {
        actualBitsPerRow = 32; // 单行显示32个格子
      } else if (bitsPerRow >= 16) {
        actualBitsPerRow = 16; // 2行，每行16个
      } else {
        actualBitsPerRow = 8; // 4行，每行8个
      }
    } else {
      // 其他类型保持原有逻辑
      const bytesPerRow = Math.floor(bitsPerRow / 8) * 8;
      actualBitsPerRow = Math.max(8, bytesPerRow); // 至少8位（1字节）
    }

    const row = Math.floor(index / actualBitsPerRow);
    const col = index % actualBitsPerRow;

    // 计算字节内的位置
    const byteIndex = Math.floor(col / 8);
    const bitInByte = col % 8;

    // 在每8个格子之间增加一个格子的距离
    const extraGap = byteIndex * bitWidth; // 每个字节后增加一个格子的宽度作为间距

    const x = col * (bitWidth + gap) + extraGap;
    const y = row * (bitHeight + gap + 80); // 增加行距到80px

    // 计算整体宽度以确定居中偏移，考虑内边距
    const totalBitsInRow = Math.min(actualBitsPerRow, this.bitSize - row * actualBitsPerRow);
    const totalBytesInRow = Math.ceil(totalBitsInRow / 8);
    const totalWidth = totalBitsInRow * (bitWidth + gap) + (totalBytesInRow - 1) * bitWidth;
    const centerOffset = (availableWidth - totalWidth) / 2 + padding / 2; // 加上左内边距

    return {
      x: x + centerOffset, // 居中偏移
      y: y + 30, // 上边距
      width: bitWidth,
      height: bitHeight,
    };
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let newHoveredBit = -1;

    // 检查鼠标是否在任何位上
    for (let i = 0; i < this.bitSize; i++) {
      const bitRect = this.getBitRect(i);
      if (x >= bitRect.x && x <= bitRect.x + bitRect.width && y >= bitRect.y && y <= bitRect.y + bitRect.height) {
        newHoveredBit = i;
        break;
      }
    }

    if (newHoveredBit !== this.hoveredBit) {
      this.hoveredBit = newHoveredBit;
      // 只重绘Canvas，不重新生成计算表达式
      this.redrawCanvasOnly();
    }
  }

  // 新增方法：只重绘Canvas，不重新生成计算表达式
  redrawCanvasOnly() {
    // 清空Canvas - 由于已经通过 ctx.scale 处理了 DPI 缩放，直接使用 CSS 尺寸
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const calculatedHeight = this.canvas.height / (window.devicePixelRatio || 1);
    this.ctx.clearRect(0, 0, containerWidth, calculatedHeight);

    // 绘制位格子
    for (let i = 0; i < this.bitSize; i++) {
      this.drawBit(i);
    }

    // 绘制字节分隔线
    this.drawByteSeparators();

    // 注意：这里不调用updateCalculationExpression，避免不必要的更新
  }

  handleClick(e) {
    if (this.hoveredBit === -1) return;

    // 检查是否是最左边的格子（索引最大的格子）
    const isLeftmostBit = this.hoveredBit === 0;

    if (isLeftmostBit) {
      // 最左边的格子（最高位）
      if (this.isSigned) {
        // 有符号状态下，切换正负（通过切换符号位）
        // 注意：这里改变的是实际存储值，显示值会在drawBit中互换
        this.bits[this.hoveredBit] = this.bits[this.hoveredBit] === 0 ? 1 : 0;
      } else {
        // 无符号状态下，正常切换位值
        this.bits[this.hoveredBit] = this.bits[this.hoveredBit] === 0 ? 1 : 0;
      }
    } else {
      // 其他格子，正常切换位值
      this.bits[this.hoveredBit] = this.bits[this.hoveredBit] === 0 ? 1 : 0;
    }

    // 使用智能更新
    this.updateCalculationExpression();
    this.updateValueFromBits();

    // 控制解释原理按钮的显示
    this.updateExplainButtonVisibility();

    // 只重绘Canvas
    this.redrawCanvasOnly();
  }

  calculateValue() {
    if (this.isSigned) {
      return this.calculateSignedValue();
    } else {
      return this.calculateUnsignedValue();
    }
  }

  calculateUnsignedValue() {
    let value = 0;
    for (let i = 0; i < this.bitSize; i++) {
      if (this.bits[i] === 1) {
        value += Math.pow(2, this.bitSize - 1 - i);
      }
    }
    return value;
  }

  calculateSignedValue() {
    // 检查符号位
    if (this.bits[0] === 0) {
      // 正数，直接计算
      return this.calculateUnsignedValue();
    } else {
      // 负数，使用补码计算
      // 先取反
      const invertedBits = this.bits.map((bit) => (bit === 0 ? 1 : 0));
      // 加1
      let carry = 1;
      const resultBits = [];
      for (let i = this.bitSize - 1; i >= 0; i--) {
        const sum = invertedBits[i] + carry;
        resultBits.unshift(sum % 2);
        carry = Math.floor(sum / 2);
      }
      // 计算绝对值
      let absValue = 0;
      for (let i = 0; i < this.bitSize; i++) {
        if (resultBits[i] === 1) {
          absValue += Math.pow(2, this.bitSize - 1 - i);
        }
      }

      return -absValue;
    }
  }

  generateCalculationExpression() {
    if (this.isSigned) {
      return this.generateSignedExpression();
    } else {
      return this.generateUnsignedExpression();
    }
  }

  generateUnsignedExpression() {
    let expression = "";
    let hasTerms = false;

    for (let i = 0; i < this.bitSize; i++) {
      if (this.bits[i] === 1) {
        if (hasTerms) {
          expression += '<span class="运算符"> + </span>';
        }
        expression += `<span class="数字">2<sup class="指数">${this.bitSize - 1 - i}</sup></span>`;
        hasTerms = true;
      }
    }

    if (!hasTerms) {
      expression = '<span class="数字">0</span>';
    }

    const value = this.calculateValue();
    expression += `<span class="等号"> = </span><span class="结果">${value}</span>`;

    return expression;
  }

  generateSignedExpression() {
    if (this.bits[0] === 0) {
      // 正数，使用无符号的显示方式但应用有符号的颜色
      let expression = "";
      let hasTerms = false;

      for (let i = 0; i < this.bitSize; i++) {
        if (this.bits[i] === 1) {
          if (hasTerms) {
            expression += '<span class="运算符"> + </span>';
          }
          expression += `<span class="数字">2<sup class="指数">${this.bitSize - 1 - i}</sup></span>`;
          hasTerms = true;
        }
      }

      if (!hasTerms) {
        expression = '<span class="数字">0</span>';
      }

      const value = this.calculateValue();
      expression += `<span class="等号"> = </span><span class="结果">${value}</span>`;

      return expression;
    } else {
      // 负数，显示简化的计算过程
      let expression = '<div class="标题">负数计算过程</div>';

      // 显示原始位值
      expression += '<div class="计算步骤容器">';
      expression += '<div class="步骤标签区">';
      expression += '<span class="标签">原值<span class="分隔符">-</span><span class="术语">原码</span></span>';
      expression += "</div>";
      expression += '<div class="步骤数字区">';
      for (let i = 0; i < this.bitSize; i++) {
        const bitValue = this.bits[i];
        expression += `<span class="数字 位值${bitValue}">${bitValue}</span>`;
        if ((i + 1) % 8 === 0 && i < this.bitSize - 1) {
          expression += " ";
        }
      }
      expression += "</div>";
      expression += "</div>";

      // 向下箭头
      expression += '<div class="向下箭头">↓</div>';

      // 计算反码
      expression += '<div class="计算步骤容器">';
      expression += '<div class="步骤标签区">';
      expression += '<span class="标签">取反<span class="分隔符">-</span><span class="术语">反码</span></span>';
      expression += "</div>";
      expression += '<div class="步骤数字区">';
      for (let i = 0; i < this.bitSize; i++) {
        const inverted = this.bits[i] === 0 ? 1 : 0;
        expression += `<span class="数字 位值${inverted}">${inverted}</span>`;
        if ((i + 1) % 8 === 0 && i < this.bitSize - 1) {
          expression += " ";
        }
      }
      expression += "</div>";
      expression += "</div>";

      // 向下箭头
      expression += '<div class="向下箭头">↓</div>';

      // 反码加1
      let carry = 1;
      const resultBits = [];
      for (let i = this.bitSize - 1; i >= 0; i--) {
        const inverted = this.bits[i] === 0 ? 1 : 0;
        const sum = inverted + carry;
        resultBits.unshift(sum % 2);
        carry = Math.floor(sum / 2);
      }

      expression += '<div class="计算步骤容器">';
      expression += '<div class="步骤标签区">';
      expression += '<span class="标签">加1<span class="分隔符">-</span><span class="术语">补码</span></span>';
      expression += "</div>";
      expression += '<div class="步骤数字区">';
      for (let i = 0; i < this.bitSize; i++) {
        const resultBit = resultBits[i];
        expression += `<span class="数字 位值${resultBit}">${resultBit}</span>`;
        if ((i + 1) % 8 === 0 && i < this.bitSize - 1) {
          expression += " ";
        }
      }
      expression += "</div>";
      expression += "</div>";

      // 计算绝对值
      let absValue = 0;
      for (let i = 0; i < this.bitSize; i++) {
        if (resultBits[i] === 1) {
          absValue += Math.pow(2, this.bitSize - 1 - i);
        }
      }

      // 分解结果显示和解释原理按钮放在同一个容器中
      expression += '<div class="结果按钮容器">';
      expression += '<div class="计算步骤容器">';
      expression += '<span class="结果标签">结果</span>';
      expression += '<span class="等号符号">=</span>';
      expression += '<span class="负号符号">-</span>';
      expression += `<span class="结果数字">${absValue}</span>`;
      expression += "</div>";
      expression += '<button class="解释原理按钮" id="explainBtn" type="button">解释原理</button>';
      expression += "</div>";

      return expression;
    }
  }

  draw() {
    // 清空Canvas - 由于已经通过 ctx.scale 处理了 DPI 缩放，直接使用 CSS 尺寸
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const calculatedHeight = this.canvas.height / (window.devicePixelRatio || 1);
    this.ctx.clearRect(0, 0, containerWidth, calculatedHeight);

    // 绘制位格子
    for (let i = 0; i < this.bitSize; i++) {
      this.drawBit(i);
    }

    // 绘制字节分隔线
    this.drawByteSeparators();

    // 智能更新计算表达式
    this.updateCalculationExpression();

    // 控制解释原理按钮的显示
    this.updateExplainButtonVisibility();

    // 设置计算表达式区域的位置
    this.updateCalculationExpressionPosition();
  }

  // 智能更新计算表达式
  updateCalculationExpression() {
    const currentExpressionType = this.getExpressionType();
    const currentSignType = this.isSigned ? "signed" : "unsigned";
    const currentIntegerType = this.currentType;

    // 检查是否需要重新生成DOM
    const needRegenerateDOM =
      this.domCache.lastExpressionType !== currentExpressionType ||
      this.domCache.lastSignType !== currentSignType ||
      this.domCache.lastIntegerType !== currentIntegerType ||
      !this.domCache.calculationContent;

    if (needRegenerateDOM) {
      // 需要重新生成DOM
      this.regenerateCalculationExpression();
      this.domCache.lastExpressionType = currentExpressionType;
      this.domCache.lastSignType = currentSignType;
      this.domCache.lastIntegerType = currentIntegerType;
    } else {
      // 只需要更新数字内容
      this.updateCalculationNumbers();
    }

    // 确保CSS类是最新的
    this.updateCalculationExpressionClasses();
  }

  // 获取当前表达式类型
  getExpressionType() {
    if (!this.isSigned) {
      return "unsigned";
    } else if (this.bits[0] === 0) {
      return "signed_positive";
    } else {
      return "signed_negative";
    }
  }

  // 重新生成计算表达式DOM
  regenerateCalculationExpression() {
    const expression = this.generateCalculationExpression();
    document.getElementById("calculationContent").innerHTML = expression;

    // 缓存DOM元素
    this.cacheDOMElements();

    // 立即更新CSS类
    this.updateCalculationExpressionClasses();

    // 调整箭头位置
    this.adjustArrowPositions();
  }

  // 缓存DOM元素
  cacheDOMElements() {
    const calculationContent = document.getElementById("calculationContent");
    this.domCache.calculationContent = calculationContent;

    // 缓存箭头
    this.domCache.arrows = Array.from(calculationContent.querySelectorAll(".向下箭头"));

    // 缓存数字元素
    this.domCache.numberElements = Array.from(calculationContent.querySelectorAll(".数字"));

    // 缓存结果元素
    const resultElements = calculationContent.querySelectorAll(".结果, .结果数字");
    this.domCache.resultElements = Array.from(resultElements);

    // 缓存解释原理按钮
    this.domCache.explainBtn = document.getElementById("explainBtn");
  }

  // 只更新数字内容
  updateCalculationNumbers() {
    if (!this.domCache.numberElements.length) return;

    const expressionType = this.getExpressionType();

    // 检查表达式类型是否发生了变化
    if (this.domCache.lastExpressionType !== expressionType) {
      // 表达式类型发生了变化，需要重新生成DOM
      this.regenerateCalculationExpression();
      // 更新缓存状态
      this.domCache.lastExpressionType = expressionType;
      return;
    }

    if (expressionType === "unsigned" || expressionType === "signed_positive") {
      // 无符号或有符号正数，更新计算表达式中的数字
      this.updatePositiveExpressionNumbers();
    } else if (expressionType === "signed_negative") {
      // 有符号负数，更新负数计算过程中的数字
      this.updateNegativeExpressionNumbers();
    }

    // 更新结果
    this.updateResultNumbers();

    // 确保CSS类是最新的
    this.updateCalculationExpressionClasses();
  }

  // 更新正数表达式中的数字
  updatePositiveExpressionNumbers() {
    // 对于正数和无符号，需要重新生成表达式以反映位值变化
    // 因为位值改变时，表达式的结构可能会改变（某些项消失或出现）
    this.regenerateCalculationExpression();
  }

  // 更新负数表达式中的数字
  updateNegativeExpressionNumbers() {
    // 更新原码数字
    for (let i = 0; i < this.bitSize; i++) {
      if (this.domCache.numberElements[i]) {
        const bitValue = this.bits[i];
        this.domCache.numberElements[i].textContent = bitValue;
        this.domCache.numberElements[i].className = `数字 位值${bitValue}`;
      }
    }

    // 更新反码数字
    for (let i = 0; i < this.bitSize; i++) {
      if (this.domCache.numberElements[i + this.bitSize]) {
        const inverted = this.bits[i] === 0 ? 1 : 0;
        this.domCache.numberElements[i + this.bitSize].textContent = inverted;
        this.domCache.numberElements[i + this.bitSize].className = `数字 位值${inverted}`;
      }
    }

    // 更新补码数字
    let carry = 1;
    const resultBits = [];
    for (let i = this.bitSize - 1; i >= 0; i--) {
      const inverted = this.bits[i] === 0 ? 1 : 0;
      const sum = inverted + carry;
      resultBits.unshift(sum % 2);
      carry = Math.floor(sum / 2);
    }

    for (let i = 0; i < this.bitSize; i++) {
      if (this.domCache.numberElements[i + this.bitSize * 2]) {
        const resultBit = resultBits[i];
        this.domCache.numberElements[i + this.bitSize * 2].textContent = resultBit;
        this.domCache.numberElements[i + this.bitSize * 2].className = `数字 位值${resultBit}`;
      }
    }
  }

  // 更新结果数字
  updateResultNumbers() {
    const expressionType = this.getExpressionType();

    if (expressionType === "signed_negative") {
      // 负数，需要计算绝对值
      let carry = 1;
      const resultBits = [];
      for (let i = this.bitSize - 1; i >= 0; i--) {
        const inverted = this.bits[i] === 0 ? 1 : 0;
        const sum = inverted + carry;
        resultBits.unshift(sum % 2);
        carry = Math.floor(sum / 2);
      }

      let absValue = 0;
      for (let i = 0; i < this.bitSize; i++) {
        if (resultBits[i] === 1) {
          absValue += Math.pow(2, this.bitSize - 1 - i);
        }
      }

      // 更新结果数字
      if (this.domCache.resultElements.length > 0) {
        this.domCache.resultElements[0].textContent = absValue;
      }
    } else {
      // 正数或无符号，直接计算值
      const value = this.calculateValue();
      if (this.domCache.resultElements.length > 0) {
        this.domCache.resultElements[0].textContent = value;
      }
    }
  }

  drawBit(index) {
    const bitRect = this.getBitRect(index);
    const bitValue = this.bits[index];
    const isHovered = index === this.hoveredBit;
    const isSignBit = index === 0 && this.isSigned;

    // 绘制开关背景
    this.ctx.save();

    // 设置样式
    if (isSignBit) {
      if (bitValue === 0) {
        // 符号位为0时，用蓝色表示正数
        this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--符号位激活");
        this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--符号位激活");
      } else {
        // 符号位为1时，用红色表示负数
        this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--符号位背景");
        this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--符号位边框");
      }
    } else {
      if (bitValue === 1) {
        this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--位格子激活");
        this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--位格子激活");
      } else {
        this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--位格子背景");
        // 文本为0的格子边框颜色更显眼
        this.ctx.strokeStyle =
          bitValue === 0 ? "#666" : getComputedStyle(document.documentElement).getPropertyValue("--位格子边框");
      }
    }

    // 悬停效果 - 只改变边框颜色，不改变内部
    if (isHovered) {
      this.ctx.strokeStyle = "#fff";
    }

    // 绘制开关外框
    this.ctx.lineWidth = 2;
    this.drawRoundedRect(bitRect.x, bitRect.y, bitRect.width, bitRect.height, 8);
    this.ctx.stroke();

    // 绘制开关背景 - 悬停时不改变内部颜色
    this.ctx.fillStyle =
      bitValue === 1
        ? isSignBit
          ? getComputedStyle(document.documentElement).getPropertyValue("--符号位背景") // 符号位为1时用红色
          : getComputedStyle(document.documentElement).getPropertyValue("--位格子激活")
        : isSignBit
          ? getComputedStyle(document.documentElement).getPropertyValue("--符号位激活") // 符号位为0时用蓝色
          : getComputedStyle(document.documentElement).getPropertyValue("--位格子背景");

    this.drawRoundedRect(bitRect.x + 2, bitRect.y + 2, bitRect.width - 4, bitRect.height - 4, 6);
    this.ctx.fill();

    this.ctx.restore();

    // 绘制位值（0或1）- 修复有符号状态下的显示逻辑
    let displayValue = bitValue;
    if (isSignBit) {
      // 有符号状态下，符号位显示值不互换，保持与实际存储值一致
      // 这样：符号位显示0时表示正数，显示1时表示负数
      displayValue = bitValue;
    }

    this.ctx.fillStyle =
      displayValue === 1 ? "#fff" : getComputedStyle(document.documentElement).getPropertyValue("--深色文本");
    // 字体大小不需要考虑DPI缩放，因为已经通过ctx.scale处理了
    const fontSize = Math.max(12, Math.min(16, this.currentBitSize * 0.4)); // 根据格子尺寸动态调整字体大小
    this.ctx.font = `${fontSize}px Google Sans Code, JetBrains Mono, Consolas, Noto Sans SC, 微软雅黑, sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(displayValue.toString(), bitRect.x + bitRect.width / 2, bitRect.y + bitRect.height / 2);

    // 绘制索引
    this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--索引文字");
    this.ctx.font = "12px Google Sans Code, JetBrains Mono, Consolas, Noto Sans SC, 微软雅黑, sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText((this.bitSize - 1 - index).toString(), bitRect.x + bitRect.width / 2, bitRect.y - 12);
  }

  // 绘制圆角矩形的辅助方法
  drawRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  drawByteSeparators() {
    this.ctx.lineWidth = 1; // 改为1px高度

    // 遍历每个字节，确保所有字节都有分隔线
    const totalBytes = Math.ceil(this.bitSize / 8);

    // 修复：遍历所有字节，包括最后一个字节
    for (let byteIndex = 1; byteIndex <= totalBytes; byteIndex++) {
      const startBitIndex = (byteIndex - 1) * 8;
      const endBitIndex = Math.min(byteIndex * 8 - 1, this.bitSize - 1);

      // 获取字节的第一个和最后一个位的位置
      const startBitRect = this.getBitRect(startBitIndex);
      const endBitRect = this.getBitRect(endBitIndex);

      // 检查字节是否跨行
      if (startBitRect.y === endBitRect.y) {
        // 同一行，正常绘制
        const startX = startBitRect.x;
        const endX = endBitRect.x + endBitRect.width;
        const centerX = (startX + endX) / 2;
        const y = startBitRect.y + startBitRect.height + 17;

        // 使用gray颜色绘制横线
        this.ctx.strokeStyle = "gray";
        this.ctx.fillStyle = "silver"; // 字节文本使用silver颜色

        // 绘制纯横线
        this.ctx.beginPath();
        this.ctx.moveTo(startX, y);
        this.ctx.lineTo(endX, y);
        this.ctx.stroke();

        // 绘制字节标签 - 修复字节顺序
        this.ctx.font = "14px Google Sans Code, JetBrains Mono, Consolas, Noto Sans SC, 微软雅黑, sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(`字节${totalBytes - byteIndex + 1}`, centerX, y + 20);
      } else {
        // 跨行，需要分别绘制每一行的部分
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth; // 使用容器宽度而不是Canvas实际宽度
        const bitWidth = this.currentBitSize || 35; // 使用动态计算的格子尺寸
        const gap = 5;
        const padding = 100; // 左右各50px的内边距
        const availableWidth = containerWidth - padding;
        const bitsPerRow = Math.floor(availableWidth / (bitWidth + gap));

        // 特殊处理不同类型的换行逻辑，与setupCanvas方法保持一致
        let actualBitsPerRow;
        if (this.currentType === "longlong") {
          // 对于long long类型，优先使用32位换行，如果空间不够则使用16位换行
          if (bitsPerRow >= 32) {
            actualBitsPerRow = 32; // 32个格子换行（4字节）
          } else if (bitsPerRow >= 16) {
            actualBitsPerRow = 16; // 16个格子换行（2字节）
          } else {
            actualBitsPerRow = 8; // 如果空间实在不够，使用8位换行（1字节）
          }
        } else if (this.currentType === "int") {
          // 对于int类型，优先使用单行显示，空间不够时再换行
          if (bitsPerRow >= 32) {
            actualBitsPerRow = 32; // 单行显示32个格子
          } else if (bitsPerRow >= 16) {
            actualBitsPerRow = 16; // 2行，每行16个
          } else {
            actualBitsPerRow = 8; // 4行，每行8个
          }
        } else {
          // 其他类型保持原有逻辑
          const bytesPerRow = Math.floor(bitsPerRow / 8) * 8;
          actualBitsPerRow = Math.max(8, bytesPerRow); // 至少8位（1字节）
        }

        // 计算当前字节跨越的行
        const startRow = Math.floor(startBitIndex / actualBitsPerRow);
        const endRow = Math.floor(endBitIndex / actualBitsPerRow);

        for (let row = startRow; row <= endRow; row++) {
          const rowStartBit = row * actualBitsPerRow;
          const rowEndBit = Math.min((row + 1) * actualBitsPerRow - 1, this.bitSize - 1);

          // 计算当前行中字节的范围
          const byteStartInRow = Math.max(startBitIndex, rowStartBit);
          const byteEndInRow = Math.min(endBitIndex, rowEndBit);

          if (byteStartInRow <= byteEndInRow) {
            const startBitRectInRow = this.getBitRect(byteStartInRow);
            const endBitRectInRow = this.getBitRect(byteEndInRow);

            const startX = startBitRectInRow.x;
            const endX = endBitRectInRow.x + endBitRectInRow.width;
            const centerX = (startX + endX) / 2;
            const y = startBitRectInRow.y + startBitRectInRow.height + 17;

            // 使用gray颜色绘制横线
            this.ctx.strokeStyle = "gray";
            this.ctx.fillStyle = "silver"; // 字节文本使用silver颜色

            // 绘制纯横线
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();

            // 只在第一行绘制字节标签 - 修复字节顺序
            if (row === startRow) {
              this.ctx.font = "14px Google Sans Code, JetBrains Mono, Consolas, Noto Sans SC, 微软雅黑, sans-serif";
              this.ctx.textAlign = "center";
              this.ctx.textBaseline = "middle";
              this.ctx.fillText(`字节${totalBytes - byteIndex + 1}`, centerX, y + 20);
            }
          }
        }
      }
    }
  }

  updateCalculationExpressionPosition() {
    // 计算最下面一行格子的位置
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth; // 使用容器宽度而不是Canvas实际宽度
    const bitWidth = this.currentBitSize || 35; // 使用动态计算的格子尺寸
    const gap = 5;
    const padding = 100;
    const availableWidth = containerWidth - padding;
    const bitsPerRow = Math.floor(availableWidth / (bitWidth + gap));

    // 特殊处理不同类型的换行逻辑，与setupCanvas方法保持一致
    let actualBitsPerRow;
    if (this.currentType === "longlong") {
      // 对于long long类型，优先使用32位换行，如果空间不够则使用16位换行
      if (bitsPerRow >= 32) {
        actualBitsPerRow = 32; // 32个格子换行（4字节）
      } else if (bitsPerRow >= 16) {
        actualBitsPerRow = 16; // 16个格子换行（2字节）
      } else {
        actualBitsPerRow = 8; // 如果空间实在不够，使用8位换行（1字节）
      }
    } else if (this.currentType === "int") {
      // 对于int类型，优先使用单行显示，空间不够时再换行
      if (bitsPerRow >= 32) {
        actualBitsPerRow = 32; // 单行显示32个格子
      } else if (bitsPerRow >= 16) {
        actualBitsPerRow = 16; // 2行，每行16个
      } else {
        actualBitsPerRow = 8; // 4行，每行8个
      }
    } else {
      // 其他类型保持原有逻辑
      const bytesPerRow = Math.floor(bitsPerRow / 8) * 8;
      actualBitsPerRow = Math.max(8, bytesPerRow); // 至少8位（1字节）
    }

    // 计算总行数
    const totalRows = Math.ceil(this.bitSize / actualBitsPerRow);
    const lastRow = totalRows - 1;

    // 计算最下面一行格子的底部位置
    const bitHeight = bitWidth; // 确保宽高相等
    const rowHeight = bitHeight + gap + 80; // 行距80px
    const lastRowBottom = 30 + (lastRow + 1) * rowHeight; // 30px是上边距

    // 设置计算表达式区域的位置
    const calculationExpression = document.getElementById("calculationExpression");
    calculationExpression.style.top = `${lastRowBottom + 100}px`; // 再向下100px
  }

  setToMaxValue() {
    let maxValue;
    if (this.isSigned) {
      maxValue = Math.pow(2, this.bitSize - 1) - 1; // 有符号整数的最大值
    } else {
      maxValue = Math.pow(2, this.bitSize) - 1; // 无符号整数的最大值
    }

    this.setValueToBits(maxValue);
    // 使用智能更新
    this.updateCalculationExpression();
    // 控制解释原理按钮的显示
    this.updateExplainButtonVisibility();
    this.redrawCanvasOnly();
  }

  setToMinValue() {
    let minValue;
    if (this.isSigned) {
      minValue = -Math.pow(2, this.bitSize - 1); // 有符号整数的最小值
    } else {
      minValue = 0; // 无符号整数的最小值
    }

    this.setValueToBits(minValue);
    // 使用智能更新
    this.updateCalculationExpression();
    // 控制解释原理按钮的显示
    this.updateExplainButtonVisibility();
    this.redrawCanvasOnly();
  }

  updateExtremeButtons() {
    const inputValue = document.getElementById("currentValue").value.trim();
    const currentValue = parseInt(inputValue) || 0;
    const maxBtn = document.getElementById("maxBtn");
    const minBtn = document.getElementById("minBtn");

    // 计算当前类型的最大值和最小值
    let maxValue, minValue;
    if (this.isSigned) {
      maxValue = Math.pow(2, this.bitSize - 1) - 1;
      minValue = -Math.pow(2, this.bitSize - 1);
    } else {
      maxValue = Math.pow(2, this.bitSize) - 1;
      minValue = 0;
    }

    // 更新最大值按钮状态
    if (currentValue === maxValue) {
      maxBtn.classList.add("highlighted");
    } else {
      maxBtn.classList.remove("highlighted");
    }

    // 更新最小值按钮状态
    if (currentValue === minValue) {
      minBtn.classList.add("highlighted");
    } else {
      minBtn.classList.remove("highlighted");
    }
  }

  showPrincipleDialog() {
    const dialog = document.getElementById("principleDialog");
    const content = document.getElementById("principleContent");
    content.innerHTML = this.generatePrincipleContent();
    dialog.classList.add("show");
    document.body.style.overflow = "hidden"; // 防止背景滚动
  }

  hidePrincipleDialog() {
    const dialog = document.getElementById("principleDialog");
    dialog.classList.remove("show");
    document.body.style.overflow = ""; // 恢复背景滚动
  }

  generatePrincipleContent() {
    return `
      <h3>为什么计算机使用补码表示负数？</h3>
      <p>在计算机中，我们希望用<span class="重点">相同的硬件</span>来处理正数和负数。补码的设计使得：<span class="重点">正数 + 负数 = 0</span>，这样可以用加法器处理减法运算。</p>
      
      <div class="示例">
        <p><strong>核心思想：</strong>如果我们要表示 -5，就找一个数，使得 5 + 这个数 = 0</p>
        <p>在8位系统中：5 + (-5) = 0，即 00000101 + ? = 00000000</p>
      </div>

      <h3>补码的计算原理</h3>
      <p>补码 = 反码 + 1</p>
      <p>反码 = 将所有位取反（0变1，1变0）</p>
      
      <div class="公式">
        补码 = 反码 + 1<br>
        原码 = -(补码的反码 + 1)
      </div>

      <h3>图解：-5的补码表示</h3>
      <div class="图解">
        <p><strong>步骤1：5的二进制表示</strong></p>
        <div class="步骤1容器">
          <div class="位数字容器">
            <span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span>
          </div>
          <p>8位表示：00000101</p>
        </div>
      </div>

      <div class="图解">
        <p><strong>步骤2：取反得到反码</strong></p>
        <div class="垂直运算">
          <div class="运算行">
            <div class="位数字容器">
              <span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span>
            </div>
            <span class="说明">原码</span>
          </div>
          <div class="运算行">
            <span class="箭头">↓</span>
            <span class="说明">取反</span>
          </div>
          <div class="运算行">
            <div class="位数字容器">
              <span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span><span class="位值 位值0">0</span>
            </div>
            <span class="说明">反码</span>
          </div>
        </div>
      </div>

      <div class="图解">
        <p><strong>步骤3：反码加1得到补码</strong></p>
        <div class="垂直运算">
          <div class="运算行">
            <div class="位数字容器">
              <span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span><span class="位值 位值0">0</span>
            </div>
            <span class="说明">反码</span>
          </div>
          <div class="运算行">
            <span class="运算符">+</span>
            <div class="位数字容器">
              <span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span>
            </div>
            <span class="说明">加1</span>
          </div>
          <div class="运算行">
            <span class="等号">=</span>
            <div class="位数字容器">
              <span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span>
            </div>
            <span class="说明">补码</span>
          </div>
        </div>
      </div>

      <h3>验证：为什么这样是正确的？</h3>
      <div class="示例">
        <p><strong>验证：5 + (-5) = 0</strong></p>
        <div class="图解">
          <div class="垂直运算">
            <div class="运算行">
              <div class="位数字容器">
                <span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span>
              </div>
              <span class="说明">+5</span>
            </div>
            <div class="运算行">
              <span class="运算符">+</span>
              <div class="位数字容器">
                <span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span>
              </div>
              <span class="说明">-5的补码</span>
            </div>
            <div class="运算行">
              <span class="等号">=</span>
              <div class="位数字容器">
                <span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span>
              </div>
              <span class="说明">结果：0</span>
            </div>
          </div>
        </div>
      </div>

      <h3>详细加法过程</h3>
      <div class="图解">
        <p><strong>逐位相加过程：</strong></p>
        <div class="垂直运算">
          <div class="运算行">
            <div class="位数字容器">
              <span class="进位">&nbsp;</span><span class="进位">&nbsp;</span><span class="进位">&nbsp;</span><span class="进位">&nbsp;</span><span class="进位">&nbsp;</span><span class="进位">&nbsp;</span><span class="进位">1</span><span class="进位">1</span>
            </div>
            <span class="说明">进位</span>
          </div>
          <div class="运算行">
            <div class="位数字容器">
              <span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span>
            </div>
            <span class="说明">+5</span>
          </div>
          <div class="运算行">
            <span class="运算符">+</span>
            <div class="位数字容器">
              <span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span><span class="位值 位值0">0</span><span class="位值 位值1">1</span><span class="位值 位值1">1</span>
            </div>
            <span class="说明">-5补码</span>
          </div>
          <div class="运算行">
            <span class="等号">=</span>
            <div class="位数字容器">
              <span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span><span class="位值 位值0">0</span>
            </div>
            <span class="说明">结果</span>
          </div>
        </div>
        <p><em>注意：最高位的进位被丢弃，这是8位系统的特性</em></p>
      </div>

      <h3>补码的数学原理</h3>
      <p>在n位系统中，补码的数学定义是：</p>
      <div class="公式">
        对于负数 -x，其补码 = 2<sup>n</sup> - x
      </div>
      <p>例如：在8位系统中，-5的补码 = 2<sup>8</sup> - 5 = 256 - 5 = 251</p>
      <p>251的二进制表示正是：11111011</p>

      <h3>为什么选择补码？</h3>
      <div class="示例">
        <p><strong>优势1：</strong>统一的加法运算</p>
        <p>正数 + 负数 = 正数 + 补码，结果自动正确</p>
        
        <p><strong>优势2：</strong>零的唯一表示</p>
        <p>只有00000000表示0，没有+0和-0的混淆</p>
        
        <p><strong>优势3：</strong>硬件实现简单</p>
        <p>只需要加法器和取反器，不需要专门的减法电路</p>
      </div>

      <h3>实际应用</h3>
      <p>在C语言中，当你声明 <span class="重点">int x = -5;</span> 时：</p>
      <ul>
        <li>编译器自动将-5转换为补码形式</li>
        <li>内存中存储的是11111011（8位示例）</li>
        <li>当你打印x时，编译器自动将补码转换回-5</li>
      </ul>

      <p>这就是为什么计算机能够用相同的硬件处理正负数运算的奥秘！</p>
    `;
  }

  updateExplainButtonVisibility() {
    const explainBtn = document.getElementById("explainBtn");

    // 如果按钮不存在，说明还没有生成（可能是正数状态）
    if (!explainBtn) {
      return;
    }

    // 只有变量类型为"有符号"且最高位为1（负数）时才显示解释原理按钮
    if (this.isSigned && this.bits[0] === 1) {
      explainBtn.style.display = "block";
    } else {
      explainBtn.style.display = "none";
    }
  }

  updateCalculationExpressionClasses() {
    const calculationExpression = document.getElementById("calculationExpression");

    // 移除所有可能的类
    calculationExpression.classList.remove("无符号", "有符号正数", "有符号负数");

    if (!this.isSigned) {
      // 无符号类型
      calculationExpression.classList.add("无符号");
    } else {
      // 有符号类型
      if (this.bits[0] === 0) {
        // 有符号正数
        calculationExpression.classList.add("有符号正数");
      } else {
        // 有符号负数
        calculationExpression.classList.add("有符号负数");
      }
    }
  }

  // 动态调整向下箭头位置的方法
  adjustArrowPositions() {
    // 只在重新生成DOM时调整箭头位置
    setTimeout(() => {
      const arrows = document.querySelectorAll(".向下箭头");
      arrows.forEach((arrow) => {
        const container = arrow.previousElementSibling;
        if (container && container.classList.contains("计算步骤容器")) {
          const labelArea = container.querySelector(".步骤标签区");
          const numberArea = container.querySelector(".步骤数字区");

          if (labelArea && numberArea) {
            const labelWidth = labelArea.offsetWidth;
            const numberWidth = numberArea.offsetWidth;
            const containerWidth = container.offsetWidth;

            // 计算步骤数字区相对于容器的中心位置
            const numberAreaCenter = labelWidth + numberWidth / 2;

            // 计算箭头应该的位置（相对于容器的50%位置）
            const arrowOffset = numberAreaCenter - containerWidth / 2;

            arrow.style.marginLeft = `${arrowOffset}px`;
          }
        }
      });
    }, 10);
  }
}

// 初始化应用
document.addEventListener("DOMContentLoaded", () => {
  new IntegerVisualizer();
});
