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
    // 自适应宽度
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    this.canvas.width = containerWidth;
    
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
      const bitsPerRow = Math.floor((containerWidth - 100) / (bitWidth + 5));
      
      // 符号位+指数位需要一行
      rows = 1;
      // 尾数位需要的行数
      rows += Math.ceil(fracBits / bitsPerRow);
    }
    
    this.canvas.height = rows * (bitWidth + 80) + 50; // 每行高度 + 底部间距
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

    // 增减按钮
    document.getElementById("increaseBtn").addEventListener("click", () => {
      this.specialValue = null;
      this.setValue(this.value + 1);
      this.draw();
    });
    document.getElementById("decreaseBtn").addEventListener("click", () => {
      this.specialValue = null;
      this.setValue(this.value - 1);
      this.draw();
    });

    // 极值按钮
    document.getElementById("maxBtn").addEventListener("click", () => {
      this.specialValue = null;
      if (this.currentType === "float") {
        this.setBits([0, ...Array(8).fill(1), ...Array(22).fill(1)]); // 最大正数
      } else {
        this.setBits([0, ...Array(11).fill(1), ...Array(52).fill(1)]);
      }
      this.draw();
    });
    document.getElementById("minBtn").addEventListener("click", () => {
      this.specialValue = null;
      if (this.currentType === "float") {
        this.setBits([1, ...Array(8).fill(1), ...Array(22).fill(1)]); // 最小负数
      } else {
        this.setBits([1, ...Array(11).fill(1), ...Array(52).fill(1)]);
      }
      this.draw();
    });

    // 特殊值按钮
    document.getElementById("zeroBtn").addEventListener("click", () => {
      this.specialValue = null;
      this.setValue(0);
      this.draw();
    });
    document.getElementById("infinityBtn").addEventListener("click", () => {
      this.specialValue = Infinity;
      this.setValue(Infinity);
      this.draw();
    });
    document.getElementById("negativeInfinityBtn").addEventListener("click", () => {
      this.specialValue = -Infinity;
      this.setValue(-Infinity);
      this.draw();
    });
    document.getElementById("nanBtn").addEventListener("click", () => {
      this.specialValue = NaN;
      this.setValue(NaN);
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
    document.getElementById("currentValue").value = isNaN(val) ? "NaN" : val;
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
    document.getElementById("currentValue").value = isNaN(this.value) ? "NaN" : this.value;
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
    const gap = 5;
    const containerWidth = this.canvas.width;
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
    const gap = 5;
    const containerWidth = this.canvas.width;
    
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
      this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--符号位边框");
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--符号位背景");
    } else if (bitType === "指数位") {
      this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--指数位边框");
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--指数位背景");
    } else {
      this.ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--尾数位边框");
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--尾数位背景");
    }
    if (bitIndex === this.hoveredBit) {
      this.ctx.strokeStyle = "#fff";
    }
    
    const bitWidth = this.currentBitSize;
    
    // 绘制圆角矩形
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(bx + 8, by);
    this.ctx.lineTo(bx + bitWidth - 8, by);
    this.ctx.quadraticCurveTo(bx + bitWidth, by, bx + bitWidth, by + 8);
    this.ctx.lineTo(bx + bitWidth, by + bitWidth - 8);
    this.ctx.quadraticCurveTo(bx + bitWidth, by + bitWidth, bx + bitWidth - 8, by + bitWidth);
    this.ctx.lineTo(bx + 8, by + bitWidth);
    this.ctx.quadraticCurveTo(bx, by + bitWidth, bx, by + bitWidth - 8);
    this.ctx.lineTo(bx, by + 8);
    this.ctx.quadraticCurveTo(bx, by, bx + 8, by);
    this.ctx.closePath();
    this.ctx.stroke();
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
      this.ctx.font = "12px JetBrains Mono, Consolas, monospace"; // 从10px增加到12px
      this.ctx.fillStyle = bitType === "符号位" ? "#cc5555" : (bitType === "指数位" ? "#ff9800" : "#4caf50");
      let label = bitType === "符号位" ? "S" : (bitType === "指数位" ? "E" : "M");
      this.ctx.fillText(label, bx + bitWidth / 2, by + bitWidth + 10);
      this.ctx.restore();
    }
    
    this.ctx.restore();
  }

  updateCalculationExpression() {
    const type = this.floatTypes[this.currentType];
    const bits = this.bits;
    // 拆分
    const s = bits[0];
    const eBits = bits.slice(1, 1 + type.expBits);
    const mBits = bits.slice(1 + type.expBits);
    // 指数
    let eVal = 0;
    for (let i = 0; i < eBits.length; i++) {
      eVal = (eVal << 1) | eBits[i];
    }
    // 尾数
    let mVal = 0;
    for (let i = 0; i < mBits.length; i++) {
      mVal += mBits[i] * Math.pow(2, -(i + 1));
    }
    // 计算实际值
    let html = `<div class="标题">IEEE 754 ${type.displayName} 浮点数结构</div>`;
    html += `<div>符号位 S = <span class="数字">${s}</span>，指数 E = <span class="数字">${eVal}</span>，尾数 M = <span class="数字">${mVal.toFixed(8)}</span></div>`;
    if (eVal === 0 && mVal === 0) {
      html += `<div>特殊值：<span class="结果">${s === 0 ? "+0" : "-0"}</span></div>`;
    } else if (eVal === (1 << type.expBits) - 1) {
      if (mVal === 0) {
        html += `<div>特殊值：<span class="结果">${s === 0 ? "+∞" : "-∞"}</span></div>`;
      } else {
        html += `<div>特殊值：<span class="结果">NaN</span></div>`;
      }
    } else {
      let exp = eVal - type.bias;
      let real = Math.pow(-1, s) * (1 + mVal) * Math.pow(2, exp);
      html += `<div>数值 = <span class="数字">(-1)<sup>${s}</sup> × (1 + ${mVal.toFixed(8)}) × 2<sup>${exp}</sup></span></div>`;
      html += `<div class="结果">实际值：${real}</div>`;
    }
    html += '<button class="解释原理按钮" id="explainBtn" type="button">解释原理</button>';
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
    return `
      <h3>浮点数的IEEE 754标准结构</h3>
      <p>浮点数由三部分组成：<span class="重点">符号位</span>、<span class="重点">指数位</span>、<span class="重点">尾数位</span>（又称有效数字）。</p>
      <div class="公式">数值 = (-1)<sup>S</sup> × (1 + M) × 2<sup>E-bias</sup></div>
      <p>其中：</p>
      <ul>
        <li>S：符号位，0为正，1为负</li>
        <li>E：指数部分的无符号整数</li>
        <li>bias：偏移量，float为127，double为1023</li>
        <li>M：尾数部分，二进制小数</li>
      </ul>
      <h3>特殊值</h3>
      <ul>
        <li>当E全为0且M全为0时，表示±0</li>
        <li>当E全为1且M全为0时，表示±∞</li>
        <li>当E全为1且M不全为0时，表示NaN</li>
        <li>当E全为0且M不全为0时，表示非规格化数</li>
      </ul>
      <h3>举例说明</h3>
      <div class="示例">
        <p>float 32位：1位符号 + 8位指数 + 23位尾数</p>
        <p>double 64位：1位符号 + 11位指数 + 52位尾数</p>
        <p>如 0.15625 的 float 表示：</p>
        <div class="公式">0 01111100 01000000000000000000000</div>
        <div>即 S=0, E=124, M=0.25，数值 = 1 × (1+0.25) × 2<sup>-3</sup> = 0.15625</div>
      </div>
      <h3>为什么要有偏移量（bias）？</h3>
      <p>这样可以用无符号整数来表示正负指数，简化硬件设计。</p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FloatVisualizer();
});
