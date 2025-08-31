class FloatVisualizer {
  constructor() {
    this.canvas = document.getElementById("floatCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.currentType = "float"; // 默认float类型
    this.bits = [];
    this.bitSize = 32;
    this.hoveredBit = -1;
    this.value = 0;
    this.specialValue = null; // 记录特殊值

    // 为每个类型保存独立的状态
    this.typeStates = {
      float: {
        value: 0,
        bits: [],
        specialValue: null,
        isMaxSelected: false,
        isMinSelected: false
      },
      double: {
        value: 0,
        bits: [],
        specialValue: null,
        isMaxSelected: false,
        isMinSelected: false
      }
    };

    this.floatTypes = {
      float: {
        name: "float",
        displayName: "float",
        size: 4,
        bits: 32,
        expBits: 8,
        fracBits: 23,
        bias: 127,
      },
      double: {
        name: "double",
        displayName: "double",
        size: 8,
        bits: 64,
        expBits: 11,
        fracBits: 52,
        bias: 1023,
      },
    };

    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.setValue(0);
    this.draw();

    // 初始化输入框的data-previous-value属性
    const valueInput = document.getElementById("currentValue");
    if (valueInput) {
      valueInput.setAttribute("data-previous-value", "0");
    }

    // 保存初始状态
    this.saveCurrentTypeState();
  }

  setupCanvas() {
    // 获取设备像素比
    const dpr = window.devicePixelRatio || 1;

    // 自适应宽度
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;

    // 设置Canvas的CSS尺寸
    this.canvas.style.width = containerWidth + "px";
    this.canvas.style.height = "auto";

    // 根据类型计算高度
    const type = this.floatTypes[this.currentType];
    const bitWidth = Math.min(35, (containerWidth - 100) / Math.min(32, type.bits) - 2);
    this.currentBitSize = bitWidth;

    // 计算需要的行数
    let rows = 1;
    if (this.currentType === "double") {
      // double类型：符号位+指数位一行，尾数位另起一行
      const signExpBits = 1 + type.expBits; // 符号位 + 指数位
      const fracBits = type.fracBits; // 尾数位

      // 计算每行能放多少个格子
      const bitsPerRow = Math.floor((containerWidth - 100) / (bitWidth + 6));

      // 符号位+指数位需要一行
      rows = 1;
      // 尾数位需要的行数
      rows += Math.ceil(fracBits / bitsPerRow);
    }

    // 计算实际高度
    const actualHeight = rows * (bitWidth + 80) + 50; // 每行高度 + 底部间距

    // 设置Canvas的实际尺寸（考虑DPI缩放）
    this.canvas.width = containerWidth * dpr;
    this.canvas.height = actualHeight * dpr;
    this.canvas.style.height = actualHeight + "px";

    // 缩放绘图上下文以匹配DPI
    this.ctx.scale(dpr, dpr);
  }

  setupEventListeners() {
    // 类型切换
    document.querySelectorAll('input[name="floatType"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        // 保存当前类型的状态
        this.saveCurrentTypeState();
        
        // 切换到新类型
        const newType = e.target.value;
        this.currentType = newType;
        this.bitSize = this.floatTypes[this.currentType].bits;
        
        // 恢复新类型的状态
        this.restoreTypeState(newType);
        
        // 重新设置Canvas和绘制
        this.setupCanvas();
        this.draw();
        this.updateTypeSelection();
      });
    });
    this.updateTypeSelection();

    // 数值输入
    const valueInput = document.getElementById("currentValue");

    // 输入过程中进行严格验证
    valueInput.addEventListener("input", (e) => {
      const inputValue = e.target.value;
      const previousValue = e.target.getAttribute("data-previous-value") || "";

      // 1. 检查是否为空字符串
      if (inputValue === "") {
        // 空字符串当作0处理
        this.specialValue = null;
        this.value = 0;
        this.updateBitsFromValue();
        this.draw();
        // 保存当前值用于下次验证
        e.target.setAttribute("data-previous-value", inputValue);
        return;
      }

      // 2. 检查是否只包含允许的字符 (0-9, -, .)
      const allowedChars = /^[0-9\-\.]+$/;
      if (!allowedChars.test(inputValue)) {
        // 包含不允许的字符，阻止输入，恢复为之前的值
        // 计算光标应该保持的相对位置
        const currentLength = inputValue.length;
        const previousLength = previousValue.length;
        const cursorPos = e.target.selectionStart;

        // 计算光标相对于前一个值的位置
        let targetPos;
        if (currentLength > previousLength) {
          // 输入了字符，光标应该保持在输入位置
          targetPos = Math.min(cursorPos - 1, previousLength);
        } else {
          // 删除了字符，光标应该保持在当前位置
          targetPos = Math.min(cursorPos, previousLength);
        }

        e.target.value = previousValue;
        // 使用setTimeout确保DOM更新后再设置光标位置
        setTimeout(() => {
          e.target.setSelectionRange(targetPos, targetPos);
        }, 0);
        return;
      }

      // 3. 检查"-"的数量（最多只能有一个）
      const minusCount = (inputValue.match(/-/g) || []).length;
      if (minusCount > 1) {
        // 多个"-"，阻止输入，恢复为之前的值
        // 计算光标应该保持的相对位置
        const currentLength = inputValue.length;
        const previousLength = previousValue.length;
        const cursorPos = e.target.selectionStart;

        // 计算光标相对于前一个值的位置
        let targetPos;
        if (currentLength > previousLength) {
          // 输入了字符，光标应该保持在输入位置
          targetPos = Math.min(cursorPos - 1, previousLength);
        } else {
          // 删除了字符，光标应该保持在当前位置
          targetPos = Math.min(cursorPos, previousLength);
        }

        e.target.value = previousValue;
        // 使用setTimeout确保DOM更新后再设置光标位置
        setTimeout(() => {
          e.target.setSelectionRange(targetPos, targetPos);
        }, 0);
        return;
      }

      // 4. 检查"."的数量（最多只能有一个）
      const dotCount = (inputValue.match(/\./g) || []).length;
      if (dotCount > 1) {
        // 多个"."，阻止输入，恢复为之前的值
        // 计算光标应该保持的相对位置
        const currentLength = inputValue.length;
        const previousLength = previousValue.length;
        const cursorPos = e.target.selectionStart;

        // 计算光标相对于前一个值的位置
        let targetPos;
        if (currentLength > previousLength) {
          // 输入了字符，光标应该保持在输入位置
          targetPos = Math.min(cursorPos - 1, previousLength);
        } else {
          // 删除了字符，光标应该保持在当前位置
          targetPos = Math.min(cursorPos, previousLength);
        }

        e.target.value = previousValue;
        // 使用setTimeout确保DOM更新后再设置光标位置
        setTimeout(() => {
          e.target.setSelectionRange(targetPos, targetPos);
        }, 0);
        return;
      }

      // 5. 检查"-"的位置（只能在开头）
      const hasMinus = inputValue.includes("-");
      if (hasMinus && !inputValue.startsWith("-")) {
        // "-"不在开头，阻止输入，恢复为之前的值
        // 计算光标应该保持的相对位置
        const currentLength = inputValue.length;
        const previousLength = previousValue.length;
        const cursorPos = e.target.selectionStart;

        // 计算光标相对于前一个值的位置
        let targetPos;
        if (currentLength > previousLength) {
          // 输入了字符，光标应该保持在输入位置
          targetPos = Math.min(cursorPos - 1, previousLength);
        } else {
          // 删除了字符，光标应该保持在当前位置
          targetPos = Math.min(cursorPos, previousLength);
        }

        e.target.value = previousValue;
        // 使用setTimeout确保DOM更新后再设置光标位置
        setTimeout(() => {
          e.target.setSelectionRange(targetPos, targetPos);
        }, 0);
        return;
      }

      // 6. 检查特殊情况（仅包含"-"或"-."）
      const onlyMinus = inputValue === "-";
      const onlyMinusDot = inputValue === "-.";
      if (onlyMinus || onlyMinusDot) {
        // 允许继续输入但不更新数值
        // 保存当前值用于下次验证
        e.target.setAttribute("data-previous-value", inputValue);
        return;
      }

      // 7. 如果格式有效，尝试解析为数字
      let v = parseFloat(inputValue);
      if (!isNaN(v)) {
        this.specialValue = null;
        this.value = v;
        this.updateBitsFromValue();
        
        // 检查数值是否为极值，如果不是则取消极值按钮的选中状态
        this.checkAndUpdateExtremeButtonStates(v);
        
        this.draw();
        // 保存当前值用于下次验证
        e.target.setAttribute("data-previous-value", inputValue);
      } else {
        // 无法解析为有效数字，阻止输入，恢复为之前的值
        // 计算光标应该保持的相对位置
        const currentLength = inputValue.length;
        const previousLength = previousValue.length;
        const cursorPos = e.target.selectionStart;

        // 计算光标相对于前一个值的位置
        let targetPos;
        if (currentLength > previousLength) {
          // 输入了字符，光标应该保持在输入位置
          targetPos = Math.min(cursorPos - 1, previousLength);
        } else {
          // 删除了字符，光标应该保持在当前位置
          targetPos = Math.min(cursorPos, previousLength);
        }

        e.target.value = previousValue;
        // 使用setTimeout确保DOM更新后再设置光标位置
        setTimeout(() => {
          e.target.setSelectionRange(targetPos, targetPos);
        }, 0);
      }
    });

    // 数值输入框失去焦点时进行格式化和验证
    valueInput.addEventListener("blur", (e) => {
      // 检查是否是因为Tab键触发的blur事件
      if (e.relatedTarget && e.relatedTarget.tagName === "INPUT") {
        // 如果是Tab键切换到其他输入框，不进行验证
        return;
      }

      let v = parseFloat(e.target.value);
      if (isNaN(v) || e.target.value === "") {
        // 如果输入无效或为空，重置为当前值
        this.setValue(this.value, true);
      } else {
        // 如果输入有效，保持原始格式
        this.setValue(v, true);
      }
    });

          // 增减按钮
      const increaseBtn = document.getElementById("increaseBtn");
      const decreaseBtn = document.getElementById("decreaseBtn");
      
      // 增加按钮
      this.setupContinuousButton(increaseBtn, () => {
        this.specialValue = null;
        this.isMaxSelected = false;
        this.isMinSelected = false;
        
        const stepInputValue = document.getElementById("stepValue").value;
        let step = parseFloat(stepInputValue);
        
        // 如果无法解析为有效数字，使用默认值0.1
        if (isNaN(step) || step <= 0) {
          step = 0.1;
        }
        
        this.setValue(this.value + step, true);
        this.updateExtremeButtonStates();
        this.draw();
      });
      
      // 减少按钮
      this.setupContinuousButton(decreaseBtn, () => {
        this.specialValue = null;
        this.isMaxSelected = false;
        this.isMinSelected = false;
        
        const stepInputValue = document.getElementById("stepValue").value;
        let step = parseFloat(stepInputValue);
        
        // 如果无法解析为有效数字，使用默认值0.1
        if (isNaN(step) || step <= 0) {
          step = 0.1;
        }
        
        this.setValue(this.value - step, true);
        this.updateExtremeButtonStates();
        this.draw();
      });

    // 步进输入框
    const stepInput = document.getElementById("stepValue");

    // 步进设置区点击聚焦
    const stepSettingArea = document.querySelector(".步进设置区");
    stepSettingArea.addEventListener("click", (e) => {
      // 如果点击的不是输入框本身，则聚焦到输入框
      if (e.target !== stepInput) {
        stepInput.focus();
      }
    });

    // 只在失去焦点时进行验证和格式化，输入过程中完全自由
    stepInput.addEventListener("blur", (e) => {
      const inputValue = e.target.value;

      // 如果输入为空或无法解析，使用默认值
      if (
        inputValue === "" ||
        inputValue === "." ||
        inputValue === "-" ||
        inputValue === "-." ||
        isNaN(parseFloat(inputValue))
      ) {
        e.target.value = 0.1;
        return;
      }

      let step = parseFloat(inputValue);

      // 限制步进值范围
      if (step <= 0) {
        step = 0.1;
        e.target.value = step;
      } else if (step < 0.000001) {
        step = 0.000001;
        e.target.value = step;
      } else if (step > 1000000) {
        step = 1000000;
        e.target.value = step;
      }
    });

    // 极值按钮
    document.getElementById("maxBtn").addEventListener("click", () => {
      this.specialValue = null;
      this.isMaxSelected = true;
      this.isMinSelected = false;
      
      if (this.currentType === "float") {
        // float类型：设置最大值为16777216
        this.setValue(16777216);
      } else {
        // double类型：设置最大值为9007199254740992
        this.setValue(9007199254740992);
      }
      
      // 更新按钮状态
      this.updateExtremeButtonStates();
      this.draw();
    });
    document.getElementById("minBtn").addEventListener("click", () => {
      this.specialValue = null;
      this.isMaxSelected = false;
      this.isMinSelected = true;
      
      if (this.currentType === "float") {
        // float类型：设置最小值为-16777216
        this.setValue(-16777216);
      } else {
        // double类型：设置最小值为-9007199254740992
        this.setValue(-9007199254740992);
      }
      
      // 更新按钮状态
      this.updateExtremeButtonStates();
      this.draw();
    });

    // Canvas交互
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseleave", () => {
      this.hoveredBit = -1;
      this.draw();
    });
    this.canvas.addEventListener("click", (e) => this.handleClick(e));

    // 窗口自适应
    window.addEventListener("resize", () => {
      this.setupCanvas();
      this.draw();
    });
  }

  updateTypeSelection() {
    document.querySelectorAll(".浮点数类型选项").forEach((option) => {
      option.classList.remove("selected");
    });
    document.querySelectorAll('input[name="floatType"]').forEach((radio) => {
      radio.checked = false;
    });
    const targetRadio = document.getElementById(`type-${this.currentType}`);
    const targetLabel = document.querySelector(`label[for="type-${this.currentType}"]`);
    if (targetRadio && targetLabel) {
      targetRadio.checked = true;
      targetLabel.classList.add("selected");
    }
  }

  // 更新位值但不重新格式化输入框（用于输入过程中）
  updateBitsFromValue() {
    // 对于float类型，限制输入范围
    if (this.currentType === "float") {
      if (this.value > 16777216) {
        this.value = 16777216;
      } else if (this.value < -16777216) {
        this.value = -16777216;
      }
    }
    
    // 对于double类型，限制输入范围
    if (this.currentType === "double") {
      if (this.value > 9007199254740992) {
        this.value = 9007199254740992;
      } else if (this.value < -9007199254740992) {
        this.value = -9007199254740992;
      }
    }
    
    const type = this.floatTypes[this.currentType];
    const buf = new ArrayBuffer(type.size);
    const view = new DataView(buf);
    if (this.currentType === "float") {
      view.setFloat32(0, this.value);
      let bits = [];
      let intVal = view.getUint32(0);
      for (let i = type.bits - 1; i >= 0; i--) {
        bits.push((intVal >> i) & 1);
      }
      this.bits = bits;
    } else {
      view.setFloat64(0, this.value);
      let bits = [];
      // JS没有getUint64，分两部分取
      let hi = view.getUint32(0);
      let lo = view.getUint32(4);
      for (let i = 31; i >= 0; i--) bits.push((hi >> i) & 1);
      for (let i = 31; i >= 0; i--) bits.push((lo >> i) & 1);
      this.bits = bits;
    }

    // 更新科学记数法显示（不更新输入框）
    this.updateScientificNotation();
  }

  // 更新数值表示显示
  updateScientificNotation() {
    const val = this.value;
    const type = this.floatTypes[this.currentType];

    // 先生成二进制精确值，获取其实际整数位数
    const binaryIntegerWidth = this.getBinaryIntegerWidth(val, type);

    // 更新十进制精确值，使用二进制精确值的整数位数作为宽度
    this.updateDecimalValue(val, type, binaryIntegerWidth);

    // 更新二进制精确值，使用相同的宽度
    this.updateBinaryValue(val, type, binaryIntegerWidth);

    // 更新二进制科学记数法
    this.updateBinaryScientificValue(val, type, binaryIntegerWidth);
  }

  // 保存当前类型的状态
  saveCurrentTypeState() {
    this.typeStates[this.currentType] = {
      value: this.value,
      bits: [...this.bits],
      specialValue: this.specialValue,
      isMaxSelected: this.isMaxSelected || false,
      isMinSelected: this.isMinSelected || false
    };
  }

  // 恢复指定类型的状态
  restoreTypeState(type) {
    const state = this.typeStates[type];
    if (state) {
      this.value = state.value;
      this.bits = [...state.bits];
      this.specialValue = state.specialValue;
      this.isMaxSelected = state.isMaxSelected || false;
      this.isMinSelected = state.isMinSelected || false;
      
      // 更新输入框显示
      const valueInput = document.getElementById("currentValue");
      if (valueInput) {
        if (this.specialValue === null) {
          // 正常数值，使用setValue更新显示
          this.setValue(this.value, true);
        } else {
          // 特殊值，直接设置输入框
          valueInput.value = this.specialValue;
          valueInput.setAttribute("data-previous-value", this.specialValue);
        }
      }
      
      // 更新科学记数法显示
      this.updateScientificNotation();
      
      // 更新极值按钮状态
      this.updateExtremeButtonStates();
    }
  }

  // 检查数值是否为极值，如果不是则取消极值按钮的选中状态
  checkAndUpdateExtremeButtonStates(val) {
    let shouldBeMaxSelected = false;
    let shouldBeMinSelected = false;
    
    // 检查是否为最大值
    if (this.currentType === "float") {
      if (val === 16777216) {
        shouldBeMaxSelected = true;
      } else if (val === -16777216) {
        shouldBeMinSelected = true;
      }
    } else if (this.currentType === "double") {
      if (val === 9007199254740992) {
        shouldBeMaxSelected = true;
      } else if (val === -9007199254740992) {
        shouldBeMinSelected = true;
      }
    }
    
    // 如果当前状态不正确，则更新
    if (this.isMaxSelected !== shouldBeMaxSelected || this.isMinSelected !== shouldBeMinSelected) {
      this.isMaxSelected = shouldBeMaxSelected;
      this.isMinSelected = shouldBeMinSelected;
      this.updateExtremeButtonStates();
    }
  }

  // 更新极值按钮状态
  updateExtremeButtonStates() {
    const maxBtn = document.getElementById("maxBtn");
    const minBtn = document.getElementById("minBtn");
    
    if (maxBtn) {
      if (this.isMaxSelected) {
        maxBtn.classList.add("selected");
      } else {
        maxBtn.classList.remove("selected");
      }
    }
    
    if (minBtn) {
      if (this.isMinSelected) {
        minBtn.classList.add("selected");
      } else {
        minBtn.classList.remove("selected");
      }
    }
  }

  // 获取二进制精确值的实际整数位数（用于设置十进制精确值的宽度）
  getBinaryIntegerWidth(val, type) {
    if (isNaN(val) || !isFinite(val)) {
      return 1; // 对于NaN和∞，使用最小宽度
    }

    // 使用实际的浮点位数，而不是理论计算
    const bits = this.bits;
    const s = bits[0]; // 符号位
    const eBits = bits.slice(1, 1 + type.expBits); // 指数位
    const mBits = bits.slice(1 + type.expBits); // 尾数位

    // 计算指数值
    let eVal = 0;
    for (let i = 0; i < eBits.length; i++) {
      eVal = (eVal << 1) | eBits[i];
    }

    // 检查特殊值
    if (eVal === 0 && mBits.every(bit => bit === 0)) {
      // 零值：整数部分为"0"
      return 1;
    } else if (eVal === (1 << type.expBits) - 1) {
      // 无穷大或NaN
      return 1;
    } else {
      // 正常数值
      const exp = eVal - type.bias; // 实际指数
      
      if (eVal === 0) {
        // 非规格化数：整数部分为0
        return 1;
      } else {
        // 规格化数：需要根据指数计算整数部分
        if (exp >= 0) {
          // 正指数：整数部分有多个位
          // 从隐含的前导1开始，根据指数扩展整数部分
          let tempVal = 1; // 隐含的前导1
          let remainingExp = exp;
          let usedBits = 0;
          
          // 构建整数部分
          while (remainingExp > 0 && usedBits < type.fracBits) {
            if (mBits[usedBits] === 1) {
              tempVal = tempVal * 2 + 1;
            } else {
              tempVal = tempVal * 2;
            }
            remainingExp--;
            usedBits++;
          }
          
          // 将tempVal转换为二进制字符串，获取实际长度
          const integerPart = tempVal.toString(2);
          const sign = val < 0 ? 1 : 0; // 负值需要额外1位宽度
          return integerPart.length + sign;
        } else {
          // 负指数：整数部分为0
          return 1;
        }
      }
    }
  }

  // 更新十进制精确值显示
  updateDecimalValue(val, type, maxIntegerWidth) {
    let decimalValue = "";

    if (isNaN(val)) {
      decimalValue = '<span style="color: #f44336;">NaN</span>';
    } else if (!isFinite(val)) {
      decimalValue = val > 0 ? '<span style="color: #f44336;">∞</span>' : '<span style="color: #f44336;">-∞</span>';
    } else {
      // 根据类型确定有效位数
      const significantDigits = this.currentType === "float" ? 7 : 16; // float约7位，double约16位十进制有效数字

      // 计算需要显示的小数位数
      const absVal = Math.abs(val);
      let decimalPlaces;

      if (absVal === 0) {
        decimalPlaces = significantDigits;
      } else if (absVal >= 1) {
        // 如果绝对值>=1，计算整数部分的位数
        const integerDigits = Math.floor(Math.log10(absVal)) + 1;
        // 剩余的小数位数
        decimalPlaces = Math.max(0, significantDigits - integerDigits);
      } else {
        // 如果绝对值<1，计算前导零的个数
        const leadingZeros = Math.floor(-Math.log10(absVal));
        // 总的有效位数减去前导零
        decimalPlaces = significantDigits - 1 + leadingZeros;
      }

      // 使用toFixed确保显示正确的小数位数
      const formattedValue = val.toFixed(Math.max(0, decimalPlaces));

      // 分离整数和小数部分，确保小数点对齐
      const parts = formattedValue.split(".");
      if (parts.length === 2) {
        // 有小数点的情况
        const integerPart = parts[0];
        const fractionalPart = parts[1];
        // 使用动态宽度确保对齐
        const width = Math.max(maxIntegerWidth, integerPart.length);
        decimalValue = `<span class="整数部分" style="display: inline-block; text-align: right; width: ${width}ch;">${integerPart}</span><span class="小数点">.</span><span class="小数部分">${fractionalPart}</span>`;
      } else {
        // 没有小数点的情况（纯整数）
        const integerPart = formattedValue;
        // 使用动态宽度确保对齐，并添加虚拟的小数点和小数部分以保持对齐
        const width = Math.max(maxIntegerWidth, integerPart.length);
        decimalValue = `<span class="整数部分" style="display: inline-block; text-align: right; width: ${width}ch;">${integerPart}</span><span class="小数点">.</span><span class="小数部分">0</span>`;
      }
    }

    const decimalDisplay = document.getElementById("decimalValue");
    if (decimalDisplay) {
      decimalDisplay.innerHTML = decimalValue;
    }
  }

  // 更新二进制精确值显示
  updateBinaryValue(val, type, maxIntegerWidth) {
    let binaryValue = "";

    if (isNaN(val)) {
      binaryValue = '<span style="color: #f44336;">NaN</span>';
    } else if (!isFinite(val)) {
      binaryValue = val > 0 ? '<span style="color: #f44336;">∞</span>' : '<span style="color: #f44336;">-∞</span>';
    } else {
      // 使用实际的浮点位数，而不是高精度转换
      const bits = this.bits;
      const s = bits[0]; // 符号位
      const eBits = bits.slice(1, 1 + type.expBits); // 指数位
      const mBits = bits.slice(1 + type.expBits); // 尾数位

      // 计算指数值
      let eVal = 0;
      for (let i = 0; i < eBits.length; i++) {
        eVal = (eVal << 1) | eBits[i];
      }

      // 检查特殊值
      if (eVal === 0 && mBits.every(bit => bit === 0)) {
        // 零值：显示为 0.00000000000000000000000 (总共24位：1位整数+23位小数)
        const signPart = s === 0 ? "" : "-";
        const integerPart = "0";
        const fullIntegerPart = signPart + integerPart;
        // 使用与十进制精确值相同的宽度计算逻辑，确保小数点对齐
        const width = Math.max(maxIntegerWidth, fullIntegerPart.length);
        binaryValue = `<span class="整数部分" style="display: inline-block; text-align: right; width: ${width}ch;">${fullIntegerPart}</span><span class="小数点">.</span><span class="小数部分">${"0".repeat(type.fracBits)}</span>`;
      } else if (eVal === (1 << type.expBits) - 1) {
        if (mBits.every(bit => bit === 0)) {
          binaryValue = `<span style="color: #f44336;">${s === 0 ? "" : "-"}∞</span>`;
        } else {
          binaryValue = '<span style="color: #f44336;">NaN</span>';
        }
      } else {
        // 正常数值
        const exp = eVal - type.bias; // 实际指数
        const sign = s === 0 ? "" : "-";

        // 构建二进制表示
        let integerPart = "";
        let mantissaStr = "";
        
        if (eVal === 0) {
          // 非规格化数：整数部分为0
          integerPart = "0";
          // 尾数部分显示完整的type.fracBits位
          for (let i = 0; i < type.fracBits; i++) {
            mantissaStr += mBits[i] || "0";
          }
        } else {
          // 规格化数：需要根据指数计算整数部分
          if (exp >= 0) {
            // 正指数：整数部分有多个位
            // 从隐含的前导1开始，根据指数扩展整数部分
            let tempVal = 1; // 隐含的前导1
            let remainingExp = exp;
            let usedBits = 0;
            
            // 构建整数部分
            while (remainingExp > 0 && usedBits < type.fracBits) {
              if (mBits[usedBits] === 1) {
                tempVal = tempVal * 2 + 1;
              } else {
                tempVal = tempVal * 2;
              }
              remainingExp--;
              usedBits++;
            }
            
            // 将tempVal转换为二进制字符串
            integerPart = tempVal.toString(2);
            
            // 构建尾数部分：确保总位数不超过限制
            // 计算剩余可用的尾数位数
            const remainingBits = type.fracBits - usedBits;
            for (let i = 0; i < remainingBits; i++) {
              mantissaStr += mBits[usedBits + i] || "0";
            }
          } else {
            // 负指数：整数部分为0
            integerPart = "0";
            // 对于负指数，需要正确显示小数部分
            // 例如：0.25 = 0.01₂，指数-2，需要1个前导零，然后是1，然后是0
            const leadingZeros = Math.abs(exp) - 1;
            mantissaStr = "0".repeat(leadingZeros);
            
            // 添加隐含的前导1（对于规格化数）
            if (eVal > 0) {
              mantissaStr += "1";
            }
            
            // 添加剩余的尾数位
            const remainingBits = type.fracBits - mantissaStr.length;
            for (let i = 0; i < remainingBits; i++) {
              mantissaStr += mBits[i] || "0";
            }
          }
        }

        // 使用动态宽度确保小数点对齐，考虑符号位和整数部分的组合
        const fullIntegerPart = sign + integerPart;
        // 使用与十进制精确值相同的宽度计算逻辑，确保小数点对齐
        const width = Math.max(maxIntegerWidth, fullIntegerPart.length);
        binaryValue = `<span class="整数部分" style="display: inline-block; text-align: right; width: ${width}ch;">${fullIntegerPart}</span><span class="小数点">.</span><span class="小数部分">${mantissaStr}</span>`;
      }
    }

    const binaryDisplay = document.getElementById("binaryValue");
    if (binaryDisplay) {
      binaryDisplay.innerHTML = binaryValue;
    }
  }

  // 更新二进制科学记数法显示
  updateBinaryScientificValue(val, type, maxIntegerWidth) {
    let binaryScientificValue = "";

    if (isNaN(val)) {
      binaryScientificValue = '<span style="color: #f44336;">NaN</span>';
    } else if (!isFinite(val)) {
      binaryScientificValue =
        val > 0 ? '<span style="color: #f44336;">∞</span>' : '<span style="color: #f44336;">-∞</span>';
    } else {
      // 使用实际的浮点数位值计算
      const bits = this.bits;
      const s = bits[0]; // 符号位
      const eBits = bits.slice(1, 1 + type.expBits); // 指数位
      const mBits = bits.slice(1 + type.expBits); // 尾数位

      // 计算指数值
      let eVal = 0;
      for (let i = 0; i < eBits.length; i++) {
        eVal = (eVal << 1) | eBits[i];
      }

      // 计算尾数值
      let mVal = 0;
      for (let i = 0; i < mBits.length; i++) {
        mVal += mBits[i] * Math.pow(2, -(i + 1));
      }

      // 检查特殊值
      if (eVal === 0 && mVal === 0) {
        // 直接左对齐，不使用动态宽度
        binaryScientificValue = `<span class="整数部分">${s === 0 ? "" : "-"}0</span><span class="小数点">.</span><span class="小数部分">00000000000000000000000</span> <span class="乘号">×</span> <span style="color: #4caf50;">2<sup>0</sup></span>`;
      } else if (eVal === (1 << type.expBits) - 1) {
        if (mVal === 0) {
          binaryScientificValue = `<span style="color: #f44336;">${s === 0 ? "" : "-"}∞</span>`;
        } else {
          binaryScientificValue = '<span style="color: #f44336;">NaN</span>';
        }
      } else {
        // 正常数值
        const exp = eVal - type.bias; // 实际指数
        const sign = s === 0 ? "" : "-";

        // 从实际的位值构建尾数字符串，确保只有0和1
        let mantissaStr = "";
        for (let i = 0; i < Math.min(mBits.length, type.fracBits); i++) {
          mantissaStr += mBits[i];
        }

        // 直接左对齐，不使用动态宽度
        binaryScientificValue = `<span class="整数部分">${sign}1</span><span class="小数点">.</span><span class="小数部分">${mantissaStr}</span> <span class="乘号">×</span> <span style="color: #4caf50;">2<sup>${exp}</sup></span>`;
      }
    }

    const binaryScientificDisplay = document.getElementById("binaryScientificValue");
    if (binaryScientificDisplay) {
      binaryScientificDisplay.innerHTML = binaryScientificValue;
    }
  }

  // 高精度十进制转换
  toHighPrecisionDecimal(val, precision) {
    if (val === 0) return "0";

    const absVal = Math.abs(val);
    const sign = val < 0 ? "-" : "";

    // 使用字符串操作来避免浮点数精度问题
    let str = absVal.toString();

    // 如果是科学记数法，转换为普通小数
    if (str.includes("e")) {
      const [mantissa, exponent] = str.split("e");
      const exp = parseInt(exponent);
      const [intPart, fracPart = ""] = mantissa.split(".");

      if (exp >= 0) {
        str = intPart + fracPart + "0".repeat(exp - fracPart.length);
        if (exp > fracPart.length) {
          str = str.substring(0, intPart.length + exp) + "." + str.substring(intPart.length + exp);
        }
      } else {
        str = "0." + "0".repeat(-exp - 1) + intPart + fracPart;
      }
    }

    // 确保有足够的小数位数
    const parts = str.split(".");
    if (parts.length === 1) {
      str += ".";
    }

    const fractionalPart = parts[1] || "";
    const paddedFractional = fractionalPart.padEnd(precision, "0");

    return sign + parts[0] + "." + paddedFractional.substring(0, precision);
  }

  // 高精度二进制转换
  toHighPrecisionBinary(val, precision) {
    if (val === 0) return "0";

    const absVal = Math.abs(val);
    const sign = val < 0 ? "-" : "";

    // 分离整数和小数部分
    const intPart = Math.floor(absVal);
    const fracPart = absVal - intPart;

    // 转换整数部分
    let intBinary = intPart.toString(2);

    // 转换小数部分
    let fracBinary = "";
    let temp = fracPart;
    for (let i = 0; i < precision; i++) {
      temp *= 2;
      fracBinary += Math.floor(temp).toString();
      temp -= Math.floor(temp);
      if (temp === 0) break;
    }

    // 补齐到指定精度
    fracBinary = fracBinary.padEnd(precision, "0");

    return sign + intBinary + "." + fracBinary;
  }

  setValue(val, preserveFormat = false) {
    // 对于float类型，限制输入范围
    if (this.currentType === "float") {
      if (val > 16777216) {
        val = 16777216;
      } else if (val < -16777216) {
        val = -16777216;
      }
    }
    
    // 对于double类型，限制输入范围
    if (this.currentType === "double") {
      if (val > 9007199254740992) {
        val = 9007199254740992;
      } else if (val < -9007199254740992) {
        val = -9007199254740992;
      }
    }
    
    this.value = val;
    // 用DataView写入并读取二进制
    const type = this.floatTypes[this.currentType];
    const buf = new ArrayBuffer(type.size);
    const view = new DataView(buf);
    if (this.currentType === "float") {
      view.setFloat32(0, val);
      let bits = [];
      let intVal = view.getUint32(0);
      for (let i = type.bits - 1; i >= 0; i--) {
        bits.push((intVal >> i) & 1);
      }
      this.bits = bits;
    } else {
      view.setFloat64(0, val);
      let bits = [];
      // JS没有getUint64，分两部分取
      let hi = view.getUint32(0);
      let lo = view.getUint32(4);
      for (let i = 31; i >= 0; i--) bits.push((hi >> i) & 1);
      for (let i = 31; i >= 0; i--) bits.push((lo >> i) & 1);
      this.bits = bits;
    }

    // 根据浮点数类型设置显示精度
    let displayValue;

    if (isNaN(val)) {
      displayValue = "NaN";
    } else if (!isFinite(val)) {
      displayValue = val > 0 ? "∞" : "-∞";
    } else {
      if (preserveFormat) {
        // 保持原始格式，不进行精度格式化
        displayValue = val.toString();
      } else {
        // 特殊处理：如果值为0，直接显示"0"
        if (val === 0) {
          displayValue = "0";
        } else {
          // 对于float类型，如果是整数且不超过16777216，使用普通数字格式
          if (this.currentType === "float" && Number.isInteger(val) && Math.abs(val) <= 16777216) {
            displayValue = val.toString();
          } else if (this.currentType === "double" && Number.isInteger(val) && Math.abs(val) <= 9007199254740992) {
            // 对于double类型，如果是整数且不超过9007199254740992，使用普通数字格式
            displayValue = val.toString();
          } else {
            // float: 6位有效数字，double: 15位有效数字
            const precision = this.currentType === "float" ? 6 : 15;
            // 始终显示固定位数的有效数字
            displayValue = val.toPrecision(precision);
          }
        }
      }
    }

    // 检查数值是否为极值，如果不是则取消极值按钮的选中状态
    this.checkAndUpdateExtremeButtonStates(val);

    const valueInput = document.getElementById("currentValue");
    valueInput.value = displayValue;

    // 同步更新data-previous-value属性
    valueInput.setAttribute("data-previous-value", displayValue);

    // 检查数值是否为极值，如果不是则取消极值按钮的选中状态
    this.checkAndUpdateExtremeButtonStates(this.value);
    
    // 更新科学记数法显示
    this.updateScientificNotation();
  }

  setBits(bits) {
    // bits: 高位在前
    this.bits = bits.slice(0, this.bitSize);
    // 反推数值
    const type = this.floatTypes[this.currentType];
    if (this.currentType === "float") {
      let intVal = 0;
      for (let i = 0; i < 32; i++) {
        intVal = (intVal << 1) | bits[i];
      }
      const buf = new ArrayBuffer(4);
      const view = new DataView(buf);
      view.setUint32(0, intVal);
      this.value = view.getFloat32(0);
    } else {
      let hi = 0,
        lo = 0;
      for (let i = 0; i < 32; i++) hi = (hi << 1) | bits[i];
      for (let i = 32; i < 64; i++) lo = (lo << 1) | bits[i];
      const buf = new ArrayBuffer(8);
      const view = new DataView(buf);
      view.setUint32(0, hi);
      view.setUint32(4, lo);
      this.value = view.getFloat64(0);
    }

    // 根据浮点数类型设置显示精度
    let displayValue;

    if (isNaN(this.value)) {
      displayValue = "NaN";
    } else if (!isFinite(this.value)) {
      displayValue = this.value > 0 ? "∞" : "-∞";
    } else {
      // 特殊处理：如果值为0，直接显示"0"
      if (this.value === 0) {
        displayValue = "0";
      } else {
        // 对于float类型，如果是整数且不超过16777216，使用普通数字格式
        if (this.currentType === "float" && Number.isInteger(this.value) && Math.abs(this.value) <= 16777216) {
          displayValue = this.value.toString();
        } else if (this.currentType === "double" && Number.isInteger(this.value) && Math.abs(this.value) <= 9007199254740992) {
          // 对于double类型，如果是整数且不超过9007199254740992，使用普通数字格式
          displayValue = this.value.toString();
        } else {
          // float: 6位有效数字，double: 15位有效数字
          const precision = this.currentType === "float" ? 6 : 15;
          // 始终显示固定位数的有效数字
          displayValue = this.value.toPrecision(precision);
        }
      }
    }

    const valueInput = document.getElementById("currentValue");
    valueInput.value = displayValue;

    // 同步更新data-previous-value属性
    valueInput.setAttribute("data-previous-value", displayValue);

    // 更新科学记数法显示
    this.updateScientificNotation();
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let bit = this.getBitIndexAt(x, y);
    if (bit !== this.hoveredBit) {
      this.hoveredBit = bit;
      this.draw();
    }
  }

  handleClick(e) {
    if (this.hoveredBit === -1) return;
    // 切换该位
    this.bits[this.hoveredBit] = this.bits[this.hoveredBit] ? 0 : 1;
    this.specialValue = null;
    this.isMaxSelected = false;
    this.isMinSelected = false;
    this.setBits(this.bits);
    this.updateExtremeButtonStates();
    this.draw();
  }

  getBitIndexAt(x, y) {
    const type = this.floatTypes[this.currentType];
    const bitWidth = this.currentBitSize;
    const gap = 6;
    const containerWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const bitsPerRow = Math.floor((containerWidth - 100) / (bitWidth + gap));

    if (this.currentType === "float") {
      // float类型：单行显示
      const startX = (containerWidth - (bitWidth + gap) * this.bitSize + gap) / 2;
      const bitY = 50;
      for (let i = 0; i < this.bitSize; i++) {
        let bx = startX + i * (bitWidth + gap);
        if (x >= bx && x <= bx + bitWidth && y >= bitY && y <= bitY + bitWidth) {
          return i;
        }
      }
    } else {
      // double类型：多行显示
      const signExpBits = 1 + type.expBits; // 符号位 + 指数位
      const fracBits = type.fracBits; // 尾数位

      // 第一行：符号位 + 指数位
      const firstRowStartX = (containerWidth - (bitWidth + gap) * signExpBits + gap) / 2;
      const firstRowY = 50;
      for (let i = 0; i < signExpBits; i++) {
        let bx = firstRowStartX + i * (bitWidth + gap);
        if (x >= bx && x <= bx + bitWidth && y >= firstRowY && y <= firstRowY + bitWidth) {
          return i;
        }
      }

      // 后续行：尾数位
      let bitIndex = signExpBits;
      let row = 1;
      for (let startBit = 0; startBit < fracBits; startBit += bitsPerRow) {
        const endBit = Math.min(startBit + bitsPerRow, fracBits);
        const bitsInThisRow = endBit - startBit;
        const rowStartX = (containerWidth - (bitWidth + gap) * bitsInThisRow + gap) / 2;
        const rowY = firstRowY + row * (bitWidth + 80);

        for (let i = 0; i < bitsInThisRow; i++) {
          let bx = rowStartX + i * (bitWidth + gap);
          if (x >= bx && x <= bx + bitWidth && y >= rowY && y <= rowY + bitWidth) {
            return bitIndex + i;
          }
        }
        bitIndex += bitsInThisRow;
        row++;
      }
    }
    return -1;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const type = this.floatTypes[this.currentType];
    const bitWidth = this.currentBitSize;
    const gap = 6;
    const containerWidth = this.canvas.width / (window.devicePixelRatio || 1);

    if (this.currentType === "float") {
      // float类型：单行显示
      const startX = (containerWidth - (bitWidth + gap) * this.bitSize + gap) / 2;
      const bitY = 50;

      // 绘制每一位
      for (let i = 0; i < this.bitSize; i++) {
        let bx = startX + i * (bitWidth + gap);
        let by = bitY;
        let bitType = "尾数位";
        if (i === 0) bitType = "符号位";
        else if (i <= type.expBits) bitType = "指数位";

        this.drawBit(bx, by, i, bitType);
      }
    } else {
      // double类型：多行显示
      const signExpBits = 1 + type.expBits; // 符号位 + 指数位
      const fracBits = type.fracBits; // 尾数位
      const bitsPerRow = Math.floor((containerWidth - 100) / (bitWidth + gap));

      // 第一行：符号位 + 指数位
      const firstRowStartX = (containerWidth - (bitWidth + gap) * signExpBits + gap) / 2;
      const firstRowY = 50;

      for (let i = 0; i < signExpBits; i++) {
        let bx = firstRowStartX + i * (bitWidth + gap);
        let by = firstRowY;
        let bitType = i === 0 ? "符号位" : "指数位";
        this.drawBit(bx, by, i, bitType);
      }

      // 后续行：尾数位
      let bitIndex = signExpBits;
      let row = 1;
      for (let startBit = 0; startBit < fracBits; startBit += bitsPerRow) {
        const endBit = Math.min(startBit + bitsPerRow, fracBits);
        const bitsInThisRow = endBit - startBit;
        const rowStartX = (containerWidth - (bitWidth + gap) * bitsInThisRow + gap) / 2;
        const rowY = firstRowY + row * (bitWidth + 80);

        for (let i = 0; i < bitsInThisRow; i++) {
          let bx = rowStartX + i * (bitWidth + gap);
          let by = rowY;
          this.drawBit(bx, by, bitIndex + i, "尾数位");
        }
        bitIndex += bitsInThisRow;
        row++;
      }
    }
  }

  drawBit(bx, by, bitIndex, bitType) {
    // 颜色
    this.ctx.save();
    if (bitType === "符号位") {
      // 符号位：根据值设置不同的蓝色
      if (this.bits[bitIndex] === 0) {
        this.ctx.strokeStyle = "#1d517b"; // 值为0时的蓝色
        this.ctx.fillStyle = "#1d517b";
      } else {
        this.ctx.strokeStyle = "#2a6ea5"; // 值为1时的蓝色
        this.ctx.fillStyle = "#2a6ea5";
      }
    } else if (bitType === "指数位") {
      // 指数位：根据值设置不同的金色
      if (this.bits[bitIndex] === 0) {
        this.ctx.strokeStyle = "#533c04"; // 值为0时的金色
        this.ctx.fillStyle = "#533c04";
      } else {
        this.ctx.strokeStyle = "#8c6608"; // 值为1时的金色
        this.ctx.fillStyle = "#8c6608";
      }
    } else {
      // 尾数位：根据值设置颜色
      this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--尾数位边框");
      if (this.bits[bitIndex] === 0) {
        this.ctx.fillStyle = "#333"; // 值为0时使用深灰色
      } else {
        this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--尾数位背景"); // 值为1时保持绿色
      }
    }

    // 值为0时边框变暗（仅对尾数位）
    if (this.bits[bitIndex] === 0 && bitType === "尾数位") {
      this.ctx.strokeStyle = "#555";
    }

    // 悬停时边框变白色
    if (bitIndex === this.hoveredBit) {
      this.ctx.strokeStyle = "#fff";
    }

    const bitWidth = this.currentBitSize;

    // 绘制外边框（2px，10px圆角）
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(bx + 10, by);
    this.ctx.lineTo(bx + bitWidth - 10, by);
    this.ctx.quadraticCurveTo(bx + bitWidth, by, bx + bitWidth, by + 10);
    this.ctx.lineTo(bx + bitWidth, by + bitWidth - 10);
    this.ctx.quadraticCurveTo(bx + bitWidth, by + bitWidth, bx + bitWidth - 10, by + bitWidth);
    this.ctx.lineTo(bx + 10, by + bitWidth);
    this.ctx.quadraticCurveTo(bx, by + bitWidth, bx, by + bitWidth - 10);
    this.ctx.lineTo(bx, by + 10);
    this.ctx.quadraticCurveTo(bx, by, bx + 10, by);
    this.ctx.closePath();
    this.ctx.stroke();

    // 绘制内部填充区域（留1px透明边距，8px圆角）
    this.ctx.beginPath();
    this.ctx.moveTo(bx + 10, by + 3);
    this.ctx.lineTo(bx + bitWidth - 10, by + 3);
    this.ctx.quadraticCurveTo(bx + bitWidth - 3, by + 3, bx + bitWidth - 3, by + 11);
    this.ctx.lineTo(bx + bitWidth - 3, by + bitWidth - 11);
    this.ctx.quadraticCurveTo(bx + bitWidth - 3, by + bitWidth - 3, bx + bitWidth - 10, by + bitWidth - 3);
    this.ctx.lineTo(bx + 10, by + bitWidth - 3);
    this.ctx.quadraticCurveTo(bx + 3, by + bitWidth - 3, bx + 3, by + bitWidth - 11);
    this.ctx.lineTo(bx + 3, by + 11);
    this.ctx.quadraticCurveTo(bx + 3, by + 3, bx + 10, by + 3);
    this.ctx.closePath();
    this.ctx.fill();

    // 位值
    this.ctx.fillStyle = this.bits[bitIndex]
      ? "#fff"
      : getComputedStyle(document.documentElement).getPropertyValue("--深色文本");
    this.ctx.font = `${Math.max(12, Math.min(16, bitWidth * 0.4))}px JetBrains Mono, Consolas, monospace`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(this.bits[bitIndex], bx + bitWidth / 2, by + bitWidth / 2);

    // 索引 - 向上2px
    this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--索引文字");
    this.ctx.font = "12px JetBrains Mono, Consolas, monospace";
    this.ctx.fillText(this.bitSize - 1 - bitIndex, bx + bitWidth / 2, by - 12);

    // 位类型标签 - 放大2px
    if (bitIndex === 0 || bitIndex === 1 || bitIndex === this.floatTypes[this.currentType].expBits + 1) {
      this.ctx.save();
      this.ctx.font = "14px JetBrains Mono, Consolas, monospace"; // 从12px增加到14px
      this.ctx.fillStyle = bitType === "符号位" ? "#cc5555" : bitType === "指数位" ? "#ff9800" : "#4caf50";
      let label = bitType === "符号位" ? "S" : bitType === "指数位" ? "E" : "M";
      this.ctx.fillText(label, bx + bitWidth / 2, by + bitWidth + 13); // 从10px增加到13px
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  // 设置连续增减按钮功能
  setupContinuousButton(button, action) {
    let intervalId = null;
    let timeoutId = null;
    let isPressed = false;

    button.addEventListener("mousedown", () => {
      // 先清理可能存在的定时器
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      isPressed = true;

      // 立即执行一次
      action();

      // 0.5秒后开始连续执行（只有在按住状态下）
      timeoutId = setTimeout(() => {
        if (isPressed) {
          intervalId = setInterval(() => {
            if (isPressed) {
              action();
            } else {
              clearInterval(intervalId);
              intervalId = null;
            }
          }, 100); // 每100ms执行一次
        }
      }, 500);
    });

    button.addEventListener("mouseup", () => {
      isPressed = false;
      this.clearButtonTimers();
    });

    button.addEventListener("mouseleave", () => {
      isPressed = false;
      this.clearButtonTimers();
    });

    // 防止拖拽时触发
    button.addEventListener("dragstart", (e) => {
      e.preventDefault();
    });

    // 保存定时器引用以便清理
    button.intervalId = intervalId;
    button.timeoutId = timeoutId;
    button.isPressed = isPressed;
  }

  // 清理按钮定时器
  clearButtonTimers() {
    const increaseBtn = document.getElementById("increaseBtn");
    const decreaseBtn = document.getElementById("decreaseBtn");

    [increaseBtn, decreaseBtn].forEach((btn) => {
      // 清理定时器
      if (btn.timeoutId) {
        clearTimeout(btn.timeoutId);
        btn.timeoutId = null;
      }
      if (btn.intervalId) {
        clearInterval(btn.intervalId);
        btn.intervalId = null;
      }

      // 重置状态
      if (btn.isPressed !== undefined) {
        btn.isPressed = false;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FloatVisualizer();
});
