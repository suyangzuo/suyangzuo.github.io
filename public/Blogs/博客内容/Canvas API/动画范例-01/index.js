class 波浪线动画 {
  constructor() {
    this.canvas = document.getElementById("canvas-波浪线-动画");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // 波浪线基准参数
    this.waveConfig = {
      amplitude: 40, // 波浪振幅
      frequency: 0.02, // 波浪频率
      speed: 0.15, // 波浪移动速度（加快4倍）
      segments: 200, // 波浪线段数
      baseY: this.canvas.offsetHeight * 0.6, // 垂直坐标（使用CSS像素高度）
    };

    // 动画状态
    this.animation = {
      time: 0,
      isPlaying: true,
      lastTime: 0,
    };

    // 绘制模式选择
    this.drawMode = "wave"; // "wave" 或 "points"

    // 单选按钮配置
    this.radioButtons = {
      wave: {
        x: this.canvas.offsetWidth - 180,
        y: 20,
        width: 90,
        height: 35,
        text: "绘制波浪线",
        selected: true,
        hovered: false,
      },
      points: {
        x: this.canvas.offsetWidth - 90,
        y: 20,
        width: 70,
        height: 35,
        text: "绘制点",
        selected: false,
        hovered: false,
      },
    };

    // 随机波峰波谷变化
    this.randomVariations = [];
    this.generateRandomVariations();

    // 绑定点击事件
    this.绑定鼠标事件();

    // 开始动画
    this.animate();
  }

  // 生成随机波峰波谷变化
  generateRandomVariations() {
    this.randomVariations = [];
    for (let i = 0; i < this.waveConfig.segments; i++) {
      // 为每个段生成随机振幅变化
      this.randomVariations.push({
        amplitude: 0.3 + Math.random() * 1.4, // 0.3到1.7倍振幅，更大的变化范围
        phase: Math.random() * Math.PI * 4, // 随机相位，0到4π
        frequency: 0.5 + Math.random() * 1.0, // 0.5到1.5倍频率，更大的频率变化
        noise: Math.random() * 2 - 1, // -1到1的随机噪声
        timeOffset: Math.random() * Math.PI * 2, // 随机时间偏移
      });
    }
  }

  // 动画循环
  animate() {
    if (!this.animation.isPlaying) return;

    // 计算时间增量，确保不同刷新率下速度一致
    const currentTime = performance.now();
    const deltaTime = this.animation.lastTime === 0 ? 0 : currentTime - this.animation.lastTime;
    this.animation.lastTime = currentTime;

    // 基于时间增量更新动画时间
    this.animation.time += this.waveConfig.speed * (deltaTime / 16.67); // 16.67ms = 60fps基准
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  // 绑定点击事件
  绑定鼠标事件() {
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 检查是否点击了单选按钮
      for (const [key, button] of Object.entries(this.radioButtons)) {
        if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
          this.selectRadioButton(key);
          break;
        }
      }
    });

    // 添加鼠标悬停效果
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 检查鼠标是否悬停在按钮上
      let isHovering = false;
      for (const [key, button] of Object.entries(this.radioButtons)) {
        if (x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height) {
          this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
          isHovering = true;
          button.hovered = true;
        } else {
          button.hovered = false;
        }
      }

      if (!isHovering) {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
      }
    });
  }

  // 选择单选按钮
  selectRadioButton(selectedKey) {
    // 重置所有按钮状态
    for (const key in this.radioButtons) {
      this.radioButtons[key].selected = false;
    }
    // 设置选中状态
    this.radioButtons[selectedKey].selected = true;
    this.drawMode = selectedKey;
  }

  // 绘制波浪线
  draw() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制背景网格
    this.drawGrid();

    // 绘制波浪线
    this.drawWave();

    // 绘制单选按钮
    this.drawRadioButtons();

    // 绘制信息
    this.drawInfo();
  }

  // 绘制背景网格
  drawGrid() {
    this.ctx.strokeStyle = "#333";
    this.ctx.lineWidth = 1;

    // 绘制垂直线
    for (let x = 0; x <= this.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // 绘制水平线
    for (let y = 0; y <= this.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  // 绘制波浪线
  drawWave() {
    this.ctx.strokeStyle = "#4CAF50";
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = "round";

    this.ctx.beginPath();

    // 绘制波浪线
    for (let i = 0; i <= this.waveConfig.segments; i++) {
      const x = (i / this.waveConfig.segments) * this.canvas.width;

      // 计算Y坐标，包含多个正弦波叠加和随机变化
      let y = this.waveConfig.baseY;

      // 主要波浪
      const mainWave = Math.sin(x * this.waveConfig.frequency + this.animation.time) * this.waveConfig.amplitude;

      // 次要波浪（不同频率）
      const secondaryWave1 =
        Math.sin(x * this.waveConfig.frequency * 2.3 + this.animation.time * 1.7) * this.waveConfig.amplitude * 0.4;
      const secondaryWave2 =
        Math.sin(x * this.waveConfig.frequency * 1.7 + this.animation.time * 0.6) * this.waveConfig.amplitude * 0.3;
      const secondaryWave3 =
        Math.sin(x * this.waveConfig.frequency * 3.1 + this.animation.time * 1.2) * this.waveConfig.amplitude * 0.25;

      // 随机变化 - 确保索引在有效范围内
      const index = Math.min(
        Math.floor((i * this.randomVariations.length) / this.waveConfig.segments),
        this.randomVariations.length - 1,
      );
      const randomVariation = this.randomVariations[index];

      // 多个随机波浪叠加
      const randomWave1 =
        Math.sin(
          x * this.waveConfig.frequency * randomVariation.frequency + this.animation.time + randomVariation.phase,
        ) *
        this.waveConfig.amplitude *
        0.5 *
        randomVariation.amplitude;
      const randomWave2 =
        Math.sin(
          x * this.waveConfig.frequency * randomVariation.frequency * 1.8 +
            this.animation.time * 0.9 +
            randomVariation.timeOffset,
        ) *
        this.waveConfig.amplitude *
        0.3 *
        randomVariation.amplitude;

      // 添加随机噪声
      const noise = randomVariation.noise * this.waveConfig.amplitude * 0.2;

      // 添加基于时间的随机变化
      const timeBasedRandom = Math.sin(this.animation.time * 0.3 + i * 0.1) * this.waveConfig.amplitude * 0.15;

      // 组合所有波浪和随机因素
      y +=
        mainWave +
        secondaryWave1 +
        secondaryWave2 +
        secondaryWave3 +
        randomWave1 +
        randomWave2 +
        noise +
        timeBasedRandom;

      if (this.drawMode === "wave") {
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      } else {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    }

    this.ctx.stroke();
  }

  // 绘制单选按钮
  drawRadioButtons() {
    for (const [key, button] of Object.entries(this.radioButtons)) {
      // 绘制文本
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "14px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";

      // 如果选中，绘制背景矩形
      if (button.selected) {
        this.ctx.fillStyle = "#1C7F20";
        this.ctx.fillRect(button.x, button.y, button.width, button.height);
      } else if (button.hovered) {
        this.ctx.fillStyle = "#1C7F2036";
        this.ctx.fillRect(button.x, button.y, button.width, button.height);
      }

      // 绘制文本
      this.ctx.fillStyle = button.selected ? "#fff" : "#ccc";
      this.ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    }
  }

  // 绘制标题信息
  drawInfo() {
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "16px sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.fillText("波浪线动画", 20, 30);
  }
}

new 波浪线动画();
