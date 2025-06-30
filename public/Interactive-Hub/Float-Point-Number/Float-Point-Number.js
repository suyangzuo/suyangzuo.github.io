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

    this.floatTypes = {
      float: {
        name: "float",
        displayName: "float",
        size: 4,
        bits: 32,
        expBits: 8,
        fracBits: 23,
        bias: 127
      },
      double: {
        name: "double",
        displayName: "double",
        size: 8,
        bits: 64,
        expBits: 11,
        fracBits: 52,
        bias: 1023
      }
    };

    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.setValue(0);
    this.draw();
  }

  setupCanvas() {
    // 获取设备像素比
    const dpr = window.devicePixelRatio || 1;
    
    // 自适应宽度
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    
    // 设置Canvas的CSS尺寸
    this.canvas.style.width = containerWidth + 'px';
    this.canvas.style.height = 'auto';
    
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
    this.canvas.style.height = actualHeight + 'px';
    
    // 缩放绘图上下文以匹配DPI
    this.ctx.scale(dpr, dpr);
  }

  setupEventListeners() {
    // 类型切换
    document.querySelectorAll('input[name="floatType"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.currentType = e.target.value;
        this.bitSize = this.floatTypes[this.currentType].bits;
        this.setValue(0);
        this.setupCanvas();
        this.draw();
        this.updateTypeSelection();
      });
    });
    this.updateTypeSelection();

    // 数值输入
    const valueInput = document.getElementById("currentValue");
    valueInput.addEventListener("input", (e) => {
      let v = parseFloat(e.target.value);
      if (isNaN(v)) v = 0;
      this.specialValue = null;
      this.setValue(v);
      this.draw();
    });
    
    // 数值输入框失去焦点时重新格式化
    valueInput.addEventListener("blur", (e) => {
      let v = parseFloat(e.target.value);
      if (!isNaN(v)) {
        this.setValue(v);
      }
    });

    // 增减按钮
    const increaseBtn = document.getElementById("increaseBtn");
    const decreaseBtn = document.getElementById("decreaseBtn");
    
    // 增加按钮
    this.setupContinuousButton(increaseBtn, () => {
      this.specialValue = null;
      const stepInputValue = document.getElementById("stepValue").value;
      let step = parseFloat(stepInputValue);
      
      // 如果无法解析为有效数字，使用默认值0.1
      if (isNaN(step) || step <= 0) {
        step = 0.1;
      }
      
      this.setValue(this.value + step);
      this.draw();
    });
    
    // 减少按钮
    this.setupContinuousButton(decreaseBtn, () => {
      this.specialValue = null;
      const stepInputValue = document.getElementById("stepValue").value;
      let step = parseFloat(stepInputValue);
      
      // 如果无法解析为有效数字，使用默认值0.1
      if (isNaN(step) || step <= 0) {
        step = 0.1;
      }
      
      this.setValue(this.value - step);
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
      if (inputValue === "" || inputValue === "." || inputValue === "-" || inputValue === "-." || isNaN(parseFloat(inputValue))) {
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
      if (this.currentType === "float") {
        // float最大规格化数: 0 11111110 11111111111111111111111
        // 符号位=0, 指数位=254(11111110), 尾数位全1
        const sign = 0;
        const expBits = [1, 1, 1, 1, 1, 1, 1, 0]; // 254 = 11111110
        const fracBits = Array(23).fill(1); // 23位尾数全1
        this.setBits([sign, ...expBits, ...fracBits]);
      } else {
        // double最大规格化数: 0 11111111110 1111111111111111111111111111111111111111111111111111
        // 符号位=0, 指数位=2046(11111111110), 尾数位全1
        const sign = 0;
        const expBits = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]; // 2046 = 11111111110
        const fracBits = Array(52).fill(1); // 52位尾数全1
        this.setBits([sign, ...expBits, ...fracBits]);
      }
      this.draw();
    });
    document.getElementById("minBtn").addEventListener("click", () => {
      this.specialValue = null;
      if (this.currentType === "float") {
        // float最小负规格化数: 1 11111110 11111111111111111111111
        // 符号位=1, 指数位=254(11111110), 尾数位全1
        const sign = 1;
        const expBits = [1, 1, 1, 1, 1, 1, 1, 0]; // 254 = 11111110
        const fracBits = Array(23).fill(1); // 23位尾数全1
        this.setBits([sign, ...expBits, ...fracBits]);
      } else {
        // double最小负规格化数: 1 11111111110 1111111111111111111111111111111111111111111111111111
        // 符号位=1, 指数位=2046(11111111110), 尾数位全1
        const sign = 1;
        const expBits = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]; // 2046 = 11111111110
        const fracBits = Array(52).fill(1); // 52位尾数全1
        this.setBits([sign, ...expBits, ...fracBits]);
      }
      this.draw();
    });

    // Canvas交互
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseleave", () => {
      this.hoveredBit = -1;
      this.draw();
    });
    this.canvas.addEventListener("click", (e) => this.handleClick(e));

    // 解释原理弹窗
    document.addEventListener("click", (e) => {
      if (e.target && e.target.id === "explainBtn") {
        this.showPrincipleDialog();
      }
    });
    document.getElementById("closeDialogBtn").addEventListener("click", () => {
      this.hidePrincipleDialog();
    });
    document.getElementById("principleDialog").addEventListener("click", (e) => {
      if (e.target === document.getElementById("principleDialog")) {
        this.hidePrincipleDialog();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.getElementById("principleDialog").classList.contains("show")) {
        this.hidePrincipleDialog();
      }
    });

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

  setValue(val) {
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
    let scientificValue = "";
    
    if (isNaN(val)) {
      displayValue = "NaN";
      scientificValue = '<span style="color: #f44336;">NaN</span>';
    } else if (!isFinite(val)) {
      displayValue = val > 0 ? "∞" : "-∞";
      scientificValue = val > 0 ? '<span style="color: #f44336;">∞</span>' : '<span style="color: #f44336;">-∞</span>';
    } else {
      // float: 6位有效数字，double: 15位有效数字
      const precision = this.currentType === "float" ? 6 : 15;
      
      // 始终显示固定位数的有效数字
      displayValue = val.toPrecision(precision);
      
      // 生成科学记数法表示
      const absVal = Math.abs(val);
      if (absVal === 0) {
        scientificValue = '<span style="color: #aaa;">0.000000</span><span style="color: #ff9800;">e</span><span style="color: #4caf50;">+00</span>';
      } else {
        const exponent = Math.floor(Math.log10(absVal));
        const mantissa = absVal / Math.pow(10, exponent);
        const sign = val < 0 ? "-" : "";
        const expSign = exponent >= 0 ? "+" : "";
        const expStr = Math.abs(exponent).toString().padStart(2, '0');
        
        // 根据精度设置尾数位数
        const mantissaPrecision = this.currentType === "float" ? 5 : 14; // 总位数-1（因为小数点前有1位）
        const mantissaStr = mantissa.toFixed(mantissaPrecision).replace(/\.?0+$/, '');
        
        // 用不同颜色表示不同部分
        const mantissaColor = "#aaa"; // 尾数部分颜色
        const eColor = "#ff9800"; // e的颜色
        const expColor = "#4caf50"; // 指数部分颜色
        
        scientificValue = `<span style="color: ${mantissaColor};">${sign}${mantissaStr}</span><span style="color: ${eColor};">e</span><span style="color: ${expColor};">${expSign}${expStr}</span>`;
      }
    }
    
    document.getElementById("currentValue").value = displayValue;
    
    // 更新科学记数法显示
    const scientificDisplay = document.getElementById("scientificValue");
    if (scientificDisplay) {
      scientificDisplay.innerHTML = scientificValue;
    }
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
      let hi = 0, lo = 0;
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
    let scientificValue = "";
    
    if (isNaN(this.value)) {
      displayValue = "NaN";
      scientificValue = '<span style="color: #f44336;">NaN</span>';
    } else if (!isFinite(this.value)) {
      displayValue = this.value > 0 ? "∞" : "-∞";
      scientificValue = this.value > 0 ? '<span style="color: #f44336;">∞</span>' : '<span style="color: #f44336;">-∞</span>';
    } else {
      // float: 6位有效数字，double: 15位有效数字
      const precision = this.currentType === "float" ? 6 : 15;
      
      // 始终显示固定位数的有效数字
      displayValue = this.value.toPrecision(precision);
      
      // 生成科学记数法表示
      const absVal = Math.abs(this.value);
      if (absVal === 0) {
        scientificValue = '<span style="color: #aaa;">0.000000</span><span style="color: #ff9800;">e</span><span style="color: #4caf50;">+00</span>';
      } else {
        const exponent = Math.floor(Math.log10(absVal));
        const mantissa = absVal / Math.pow(10, exponent);
        const sign = this.value < 0 ? "-" : "";
        const expSign = exponent >= 0 ? "+" : "";
        const expStr = Math.abs(exponent).toString().padStart(2, '0');
        
        // 根据精度设置尾数位数
        const mantissaPrecision = this.currentType === "float" ? 5 : 14; // 总位数-1（因为小数点前有1位）
        const mantissaStr = mantissa.toFixed(mantissaPrecision).replace(/\.?0+$/, '');
        
        // 用不同颜色表示不同部分
        const mantissaColor = "#aaa"; // 尾数部分颜色
        const eColor = "#ff9800"; // e的颜色
        const expColor = "#4caf50"; // 指数部分颜色
        
        scientificValue = `<span style="color: ${mantissaColor};">${sign}${mantissaStr}</span><span style="color: ${eColor};">e</span><span style="color: ${expColor};">${expSign}${expStr}</span>`;
      }
    }
    
    document.getElementById("currentValue").value = displayValue;
    
    // 更新科学记数法显示
    const scientificDisplay = document.getElementById("scientificValue");
    if (scientificDisplay) {
      scientificDisplay.innerHTML = scientificValue;
    }
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
    this.setBits(this.bits);
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
    
    // 绘制表达式区
    this.updateCalculationExpression();
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
    this.ctx.fillStyle = this.bits[bitIndex] ? "#fff" : getComputedStyle(document.documentElement).getPropertyValue("--深色文本");
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
      this.ctx.fillStyle = bitType === "符号位" ? "#cc5555" : (bitType === "指数位" ? "#ff9800" : "#4caf50");
      let label = bitType === "符号位" ? "S" : (bitType === "指数位" ? "E" : "M");
      this.ctx.fillText(label, bx + bitWidth / 2, by + bitWidth + 13); // 从10px增加到13px
      this.ctx.restore();
    }
    
    this.ctx.restore();
  }

  updateCalculationExpression() {
    const type = this.floatTypes[this.currentType];
    const bits = this.bits;
    
    // 拆分位
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
    
    // 生成HTML内容
    let html = '';
    
    // 标题
    html += '<div class="标题">IEEE 754 浮点数计算过程</div>';
    
    // 第一步：显示位值
    html += '<div class="步骤">';
    html += '<span class="步骤标题">第一步：读取位值</span>';
    html += '<div class="步骤内容">';
    html += '<div class="步骤行">S = <span class="数字">' + s + '</span></div>';
    html += '<div class="步骤行">E = <span class="数字">' + eVal + '</span></div>';
    html += '<div class="步骤行">M = <span class="数字">' + mVal.toFixed(6) + '</span></div>';
    html += '</div>';
    html += '</div>';
    
    // 检查特殊值
    if (eVal === 0 && mVal === 0) {
      html += '<div class="步骤">';
      html += '<span class="步骤标题">结果：</span>';
      html += '<div class="步骤内容">';
      html += '<div class="步骤行"><span class="结果">' + (s === 0 ? '+0' : '-0') + '</span></div>';
      html += '</div>';
      html += '</div>';
    } else if (eVal === (1 << type.expBits) - 1) {
      html += '<div class="步骤">';
      html += '<span class="步骤标题">结果：</span>';
      html += '<div class="步骤内容">';
      if (mVal === 0) {
        html += '<div class="步骤行"><span class="结果">' + (s === 0 ? '+∞' : '-∞') + '</span></div>';
      } else {
        html += '<div class="步骤行"><span class="结果">NaN</span></div>';
      }
      html += '</div>';
      html += '</div>';
    } else {
      // 正常数值计算
      const exp = eVal - type.bias; // 实际指数
      
      html += '<div class="步骤">';
      html += '<span class="步骤标题">第二步：计算实际指数</span>';
      html += '<div class="步骤内容">';
      html += '<div class="步骤行">实际指数 = <span class="数字">' + eVal + '</span> <span class="运算符">-</span> <span class="数字">' + type.bias + '</span> <span class="运算符">=</span> <span class="数字">' + exp + '</span></div>';
      html += '</div>';
      html += '</div>';
      
      html += '<div class="步骤">';
      html += '<span class="步骤标题">第三步：应用公式</span>';
      html += '<div class="步骤内容">';
      html += '<div class="公式">数值 = <span class="括号">(</span><span class="运算符">-</span><span class="数字">1</span><span class="括号">)</span><span class="上标"><sup>' + s + '</sup></span> <span class="运算符">×</span> <span class="括号">(</span><span class="数字">1</span> <span class="运算符">+</span> <span class="数字">' + mVal.toFixed(6) + '</span><span class="括号">)</span> <span class="运算符">×</span> <span class="数字">2</span><span class="上标"><sup>' + exp + '</sup></span></div>';
      html += '</div>';
      html += '</div>';
      
      // 计算最终结果
      const real = Math.pow(-1, s) * (1 + mVal) * Math.pow(2, exp);
      
      html += '<div class="步骤">';
      html += '<span class="步骤标题">第四步：计算结果</span>';
      html += '<div class="步骤内容">';
      html += '<div class="步骤行"><span class="数字">' + Math.pow(-1, s) + '</span> <span class="运算符">×</span> <span class="数字">' + (1 + mVal).toFixed(6) + '</span> <span class="运算符">×</span> <span class="数字">' + Math.pow(2, exp).toFixed(6) + '</span> <span class="运算符">=</span> <span class="结果">' + real + '</span></div>';
      html += '</div>';
      html += '</div>';
    }
    
    // 添加解释按钮
    html += '<button class="解释原理按钮" id="explainBtn" type="button">详细原理</button>';
    
    document.getElementById("calculationContent").innerHTML = html;
  }

  showPrincipleDialog() {
    const content = document.getElementById("principleContent");
    content.innerHTML = this.generatePrincipleContent();
    document.getElementById("principleDialog").classList.add("show");
    document.body.style.overflow = "hidden";
  }

  hidePrincipleDialog() {
    document.getElementById("principleDialog").classList.remove("show");
    document.body.style.overflow = "";
  }

  generatePrincipleContent() {
    const type = this.floatTypes[this.currentType];
    const bits = this.bits;
    const s = bits[0];
    const eBits = bits.slice(1, 1 + type.expBits);
    const mBits = bits.slice(1 + type.expBits);
    
    let eVal = 0;
    for (let i = 0; i < eBits.length; i++) {
      eVal = (eVal << 1) | eBits[i];
    }
    
    let mVal = 0;
    for (let i = 0; i < mBits.length; i++) {
      mVal += mBits[i] * Math.pow(2, -(i + 1));
    }
    
    return `
      <h3>浮点数的IEEE 754标准结构</h3>
      <p>浮点数由三部分组成：<span class="重点">符号位</span>、<span class="重点">指数位</span>、<span class="重点">尾数位</span>（又称有效数字）。</p>
      <div class="公式">数值 = <span class="括号">(</span><span class="运算符">-</span><span class="数字">1</span><span class="括号">)</span><span class="上标"><sup>S</sup></span> <span class="运算符">×</span> <span class="括号">(</span><span class="数字">1</span> <span class="运算符">+</span> <span class="数字">M</span><span class="括号">)</span> <span class="运算符">×</span> <span class="数字">2</span><span class="上标"><sup>E-bias</sup></span></div>
      
      <h3>各部分含义</h3>
      <ul>
        <li><span class="重点">S</span>：符号位，0为正数，1为负数</li>
        <li><span class="重点">E</span>：指数部分的无符号整数</li>
        <li><span class="重点">bias</span>：偏移量，${type.displayName}为${type.bias}，这样可以用无符号整数表示正负指数</li>
        <li><span class="重点">M</span>：尾数部分，二进制小数（0 ≤ M < 1）</li>
      </ul>
      
      <h3>当前数值分析</h3>
      <div class="示例">
        <p><strong>位值分解：</strong></p>
        <p>符号位 S = <span class="数字">${s}</span> ${s === 0 ? '（正数）' : '（负数）'}</p>
        <p>指数位 E = <span class="数字">${eVal}</span> （二进制：${eBits.join('')}）</p>
        <p>尾数位 M = <span class="数字">${mVal.toFixed(6)}</span> （二进制小数）</p>
        
        <p><strong>尾数二进制计算过程：</strong></p>
        <div class="二进制计算">
          ${mBits.slice(0, Math.min(10, mBits.length)).map((bit, i) => 
            `${bit} × 2<sup>-${i + 1}</sup> = ${bit} × ${(1/Math.pow(2, i+1)).toFixed(6)}`
          ).join('<br>')}
          ${mBits.length > 10 ? `<br>... (还有${mBits.length - 10}位)` : ''}
          <br><strong>总和 = <span class="数字">${mVal.toFixed(6)}</span></strong>
        </div>
      </div>
      
      <h3>特殊值规则</h3>
      <ul>
        <li>当E全为0且M全为0时，表示±0（零值）</li>
        <li>当E全为1且M全为0时，表示±∞（无穷大）</li>
        <li>当E全为1且M不全为0时，表示NaN（非数字）</li>
        <li>当E全为0且M不全为0时，表示非规格化数（次正规数）</li>
      </ul>
      
      <h3>偏移量（Bias）的作用</h3>
      <p>IEEE 754使用偏移量来表示指数，${type.displayName}的偏移量是${type.bias}。</p>
      <p>偏移量范围：-${type.bias} 到 ${((1 << type.expBits) - 1 - type.bias)}，对应指数位 0 到 ${((1 << type.expBits) - 1)}</p>
      <p>这样做的好处：</p>
      <ul>
        <li>可以用无符号整数表示正负指数</li>
        <li>简化硬件设计</li>
        <li>便于比较指数大小</li>
      </ul>
      
      <h3>规格化与非规格化</h3>
      <p><strong>规格化数：</strong>当指数位不全为0时，尾数部分隐含一个1，即实际尾数为1.M</p>
      <p><strong>非规格化数：</strong>当指数位全为0时，尾数部分不隐含1，即实际尾数为0.M，用于表示非常接近0的数</p>
      
      <h3>精度说明</h3>
      <p><strong>${type.displayName}：</strong>${type.bits}位，${type.expBits}位指数，${type.fracBits}位尾数</p>
      <p>有效数字位数：${type.displayName === 'float' ? '6-7' : '15-17'}位十进制数字</p>
      <p>数值范围：约±${type.displayName === 'float' ? '3.4×10³⁸' : '1.8×10³⁰⁸'}</p>
      
      <h3>实际应用举例</h3>
      <div class="示例">
        <p>以0.15625的float表示为例：</p>
        <div class="公式">0 01111100 01000000000000000000000</div>
        <p>即 S=0, E=124, M=0.25</p>
        <p>实际指数 = 124 - 127 = -3</p>
        <p>数值 = 1 × (1+0.25) × 2<sup>-3</sup> = 1.25 × 0.125 = 0.15625</p>
      </div>
    `;
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
    
    [increaseBtn, decreaseBtn].forEach(btn => {
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
