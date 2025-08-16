class RadiusAndAngleCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");

    // 获取设备像素比
    this.devicePixelRatio = window.devicePixelRatio || 1;

    // 圆的基本参数 - 增大半径
    this.圆心X = 0;
    this.圆心Y = 0;
    this.半径 = 180; // 增大半径

    // 坐标系设置
    this.当前坐标系 = "计算机图形学"; // 默认坐标系
    this.是否页面刚载入 = true; // 标记页面刚载入状态

    // 从localStorage加载上次选中的坐标系，但控制点位置使用默认值
    this.loadCoordinateSystemFromStorage();

    // 根据当前坐标系设置默认的控制点位置
    if (this.当前坐标系 === "计算机图形学") {
      this.控制点1角度 = 0; // 计算机图形学坐标系：正右方
      this.控制点2角度 = Math.PI / 2; // 计算机图形学坐标系：正下方（90度）
    } else {
      this.控制点1角度 = -Math.PI / 2; // 导航坐标系：正上方
      this.控制点2角度 = 0; // 导航坐标系：正右方
    }
    this.拖拽的控制点 = null;
    this.鼠标在控制点上 = false;
    this.悬停的控制点 = null; // 新增：跟踪悬停的控制点

    // 保存初始值用于重置
    this.初始值 = {
      控制点1角度: this.控制点1角度,
      控制点2角度: this.控制点2角度,
    };

    // 缓存计算结果，避免重复计算
    this.缓存 = {
      角度差: 0,
      角度值: 0,
      弧度值: 0,
      需要更新: true,
    };

    // 颜色定义 - 深色模式
    this.颜色 = {
      圆: "#64b5f6",
      圆心: "#ff6b6b",
      控制点: "#aa5200",
      控制点悬停: "#dd8533", // 新增：悬停颜色
      虚线: "#9e9e9e",
      特殊弧: "#ff7043",
      文本: "#e0e0e0",
      公式背景: "rgba(30, 30, 46, 0.95)",
      角度区域: "rgba(100, 181, 246, 0.15)",
      公式边框: "#444",
      // 新增：文本颜色
      标签文本: "#81c784", // 绿色
      数值文本: "#ffd54f", // 黄色
      单位文本: "#ff8a65", // 橙色
      符号文本: "#90caf9", // 蓝色
      括号文本: "#a5d6a7", // 浅绿色
    };

    // 字体设置
    this.字体 = '"JetBrains Mono", "Noto Sans SC", Consolas, monospace';

    this.init();
  }

  // 从localStorage加载坐标系选择（不加载控制点位置）
  loadCoordinateSystemFromStorage() {
    try {
      const 保存的设置 = localStorage.getItem("radiusAngleSettings");

      if (保存的设置) {
        const 设置 = JSON.parse(保存的设置);

        // 只恢复上次选中的坐标系，不恢复控制点位置
        if (设置.当前坐标系) {
          this.当前坐标系 = 设置.当前坐标系;
        }
      }
    } catch (error) {
      console.error("加载坐标系选择失败:", error);
      // 出错时保持默认值
    }
  }

  // 加载特定坐标系的控制点数据
  loadCoordinateSystemData(坐标系名称) {
    try {
      const 保存的设置 = localStorage.getItem("radiusAngleSettings");
      if (保存的设置) {
        const 设置 = JSON.parse(保存的设置);
        // 查找指定坐标系的记录数据
        if (设置[坐标系名称]) {
          return {
            控制点1角度: 设置[坐标系名称].控制点1角度,
            控制点2角度: 设置[坐标系名称].控制点2角度,
          };
        }
      }
      return null;
    } catch (error) {
      console.error("加载坐标系数据失败:", error);
      return null;
    }
  }

  // 保存坐标系选择到localStorage
  saveCoordinateSystemSelection() {
    try {
      // 先读取现有的设置
      let 现有设置 = {};
      try {
        const 现有数据 = localStorage.getItem("radiusAngleSettings");
        if (现有数据) {
          现有设置 = JSON.parse(现有数据);
        }
      } catch (e) {
        // 如果解析失败，使用空对象
        现有设置 = {};
      }

      // 只保存当前选中的坐标系，不保存控制点数据
      现有设置.当前坐标系 = this.当前坐标系;
      localStorage.setItem("radiusAngleSettings", JSON.stringify(现有设置));
    } catch (error) {
      console.error("保存坐标系选择失败:", error);
    }
  }

  // 重置所有坐标系的数据
  resetAllCoordinateSystems() {
    try {
      // 先读取现有的设置
      let 现有设置 = {};
      try {
        const 现有数据 = localStorage.getItem("radiusAngleSettings");
        if (现有数据) {
          现有设置 = JSON.parse(现有数据);
        }
      } catch (e) {
        // 如果解析失败，使用空对象
        现有设置 = {};
      }

      // 保留当前选中的坐标系，但清除所有坐标系的控制点数据
      现有设置.当前坐标系 = this.当前坐标系;

      // 清除"计算机图形学"坐标系的控制点数据
      if (现有设置.计算机图形学) {
        delete 现有设置.计算机图形学;
      }

      // 清除"导航"坐标系的控制点数据
      if (现有设置.导航) {
        delete 现有设置.导航;
      }

      // 保存重置后的设置到localStorage
      localStorage.setItem("radiusAngleSettings", JSON.stringify(现有设置));
    } catch (error) {
      console.error("重置所有坐标系数据失败:", error);
    }
  }

  // 保存设置到localStorage
  saveToLocalStorage() {
    try {
      // 先读取现有的设置
      let 现有设置 = {};
      try {
        const 现有数据 = localStorage.getItem("radiusAngleSettings");
        if (现有数据) {
          现有设置 = JSON.parse(现有数据);
        }
      } catch (e) {
        // 如果解析失败，使用空对象
        现有设置 = {};
      }

      // 保存当前选中的坐标系
      现有设置.当前坐标系 = this.当前坐标系;

      // 为当前坐标系保存控制点数据
      现有设置[this.当前坐标系] = {
        控制点1角度: this.控制点1角度,
        控制点2角度: this.控制点2角度,
        时间戳: Date.now(),
      };

      localStorage.setItem("radiusAngleSettings", JSON.stringify(现有设置));
    } catch (error) {
      console.error("保存到localStorage失败:", error);
    }
  }

  init() {
    this.resizeCanvas();
    this.setupEventListeners();
    this.render();

    window.addEventListener("resize", () => {
      this.resizeCanvas();
      this.render();
    });
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();

    // 设置canvas的CSS尺寸
    this.canvas.style.width = rect.width + "px";
    this.canvas.style.height = rect.height + "px";

    // 设置canvas的实际像素尺寸（考虑DPI缩放）
    this.canvas.width = rect.width * this.devicePixelRatio;
    this.canvas.height = rect.height * this.devicePixelRatio;

    // 缩放绘图上下文以匹配DPI
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);

    // 重新计算圆心位置（基于CSS尺寸）
    this.圆心X = rect.width / 2;

    // 计算圆的位置，确保上下距离一致
    const 公式区域高度 = 80;
    const 可用高度 = rect.height - 公式区域高度;
    const 上边距 = (可用高度 - this.半径 * 2) / 2;
    this.圆心Y = 上边距 + this.半径;

    // 标记需要更新缓存
    this.缓存.需要更新 = true;
  }

  setupEventListeners() {
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.handleMouseUp());
    // 移除mouseleave事件，让拖拽状态在鼠标离开Canvas时保持
    // this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());

    // 添加全局鼠标事件，确保拖拽状态持续
    document.addEventListener("mousemove", (e) => {
      if (this.拖拽的控制点) {
        this.handleMouseMove(e);
      }
    });

    document.addEventListener("mouseup", () => {
      if (this.拖拽的控制点) {
        this.handleMouseUp();
      }
    });

    // 添加坐标系切换事件监听器
    this.setup坐标系切换监听器();
  }

  // 设置坐标系切换监听器
  setup坐标系切换监听器() {
    const 坐标系选项s = document.querySelectorAll('input[name="坐标系"]');
    坐标系选项s.forEach((选项) => {
      选项.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.切换坐标系(e.target.value);
        }
      });
    });

    // 根据当前坐标系设置HTML中单选按钮的选中状态
    this.updateRadioButtonState();
  }

  // 更新HTML中单选按钮的选中状态
  updateRadioButtonState() {
    const 坐标系选项s = document.querySelectorAll('input[name="坐标系"]');
    坐标系选项s.forEach((选项) => {
      选项.checked = 选项.value === this.当前坐标系;
    });
  }

  // 切换坐标系
  切换坐标系(新坐标系) {
    if (this.当前坐标系 === 新坐标系) return;

    // 先保存当前坐标系的数据
    this.saveToLocalStorage();

    // 切换到新坐标系
    this.当前坐标系 = 新坐标系;

    // 立即保存新的坐标系选择到localStorage
    this.saveCoordinateSystemSelection();

    // 页面载入后第一次切换到某个坐标系时，永远使用默认值
    if (this.是否页面刚载入) {
      // 使用默认值
      if (新坐标系 === "计算机图形学") {
        // 计算机图形学坐标系：A点在正右方(0度)，B点在正下方(90度)
        this.控制点1角度 = 0;
        this.控制点2角度 = Math.PI / 2;
      } else {
        // 导航坐标系：A点在正上方(-90度)，B点在正右方(0度)
        this.控制点1角度 = -Math.PI / 2;
        this.控制点2角度 = 0;
      }
      this.是否页面刚载入 = false; // 标记页面已不是刚载入状态
    } else {
      // 页面载入后，尝试加载新坐标系的记录数据
      const 记录数据 = this.loadCoordinateSystemData(新坐标系);

      if (记录数据) {
        // 如果有记录数据，使用记录的数据
        this.控制点1角度 = 记录数据.控制点1角度;
        this.控制点2角度 = 记录数据.控制点2角度;
      } else {
        // 如果没有记录数据，使用默认值
        if (新坐标系 === "计算机图形学") {
          // 计算机图形学坐标系：A点在正右方(0度)，B点在正下方(90度)
          this.控制点1角度 = 0;
          this.控制点2角度 = Math.PI / 2;
        } else {
          // 导航坐标系：A点在正上方(-90度)，B点在正右方(0度)
          this.控制点1角度 = -Math.PI / 2;
          this.控制点2角度 = 0;
        }
      }
    }

    // 更新初始值
    this.初始值.控制点1角度 = this.控制点1角度;
    this.初始值.控制点2角度 = this.控制点2角度;

    // 标记需要更新缓存
    this.缓存.需要更新 = true;

    // 更新HTML中单选按钮的选中状态
    this.updateRadioButtonState();

    // 重新渲染
    this.render();
  }

  // 统一的角度计算函数，确保精度
  calculate角度() {
    if (!this.缓存.需要更新) {
      return this.缓存;
    }

    // 计算角度差，确保精度
    let 角度差 = this.控制点2角度 - this.控制点1角度;
    if (角度差 < 0) {
      角度差 += 2 * Math.PI;
    }

    // 先计算弧度值，然后四舍五入到两位小数
    const 弧度值 = Math.round(角度差 * 100) / 100;

    // 使用精确的弧度值计算角度值
    const 角度值 = (弧度值 * 180) / Math.PI;

    // 缓存结果
    this.缓存 = {
      角度差: 角度差,
      角度值: 角度值,
      弧度值: 弧度值,
      需要更新: false,
    };

    return this.缓存;
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否点击了控制点
    const 控制点1X = this.圆心X + this.半径 * Math.cos(this.控制点1角度);
    const 控制点1Y = this.圆心Y + this.半径 * Math.sin(this.控制点1角度);
    const 控制点2X = this.圆心X + this.半径 * Math.cos(this.控制点2角度);
    const 控制点2Y = this.圆心Y + this.半径 * Math.sin(this.控制点2角度);

    const 点击距离1 = Math.sqrt((x - 控制点1X) ** 2 + (y - 控制点1Y) ** 2);
    const 点击距离2 = Math.sqrt((x - 控制点2X) ** 2 + (y - 控制点2Y) ** 2);

    if (点击距离1 <= 15) {
      this.拖拽的控制点 = 1;
      this.canvas.style.cursor = "grabbing";
    } else if (点击距离2 <= 15) {
      this.拖拽的控制点 = 2;
      this.canvas.style.cursor = "grabbing";
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.拖拽的控制点) {
      // 计算鼠标相对于圆心的角度
      const dx = x - this.圆心X;
      const dy = y - this.圆心Y;
      const 角度 = Math.atan2(dy, dx);

      // 更新控制点角度
      if (this.拖拽的控制点 === 1) {
        this.控制点1角度 = 角度;
      } else {
        this.控制点2角度 = 角度;
      }

      // 标记需要更新缓存
      this.缓存.需要更新 = true;
      this.render();
    } else {
      // 检查鼠标是否悬停在控制点上
      const 控制点1X = this.圆心X + this.半径 * Math.cos(this.控制点1角度);
      const 控制点1Y = this.圆心Y + this.半径 * Math.sin(this.控制点1角度);
      const 控制点2X = this.圆心X + this.半径 * Math.cos(this.控制点2角度);
      const 控制点2Y = this.圆心Y + this.半径 * Math.sin(this.控制点2角度);

      const 悬停距离1 = Math.sqrt((x - 控制点1X) ** 2 + (y - 控制点1Y) ** 2);
      const 悬停距离2 = Math.sqrt((x - 控制点2X) ** 2 + (y - 控制点2Y) ** 2);

      let 新的悬停控制点 = null;
      if (悬停距离1 <= 15) {
        新的悬停控制点 = 1;
        this.canvas.style.cursor = "grab";
      } else if (悬停距离2 <= 15) {
        新的悬停控制点 = 2;
        this.canvas.style.cursor = "grab";
      } else {
        this.canvas.style.cursor = "default";
      }

      // 如果悬停状态发生变化，重新渲染
      if (this.悬停的控制点 !== 新的悬停控制点) {
        this.悬停的控制点 = 新的悬停控制点;
        this.render();
      }
    }
  }

  handleMouseUp() {
    this.拖拽的控制点 = null;
    this.canvas.style.cursor = "default";

    // 拖拽结束后保存设置到localStorage
    this.saveToLocalStorage();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width / this.devicePixelRatio, this.canvas.height / this.devicePixelRatio);

    // 绘制圆
    this.draw圆();

    // 绘制角度区域
    this.draw角度区域();

    // 绘制虚线
    this.draw虚线();

    // 绘制特殊弧段
    this.draw特殊弧段();

    // 绘制控制点 - 移到最后确保在最上层
    this.draw控制点();

    // 绘制圆心
    this.draw圆心();

    // 绘制角度和弧度值
    this.draw角度弧度值();

    // 绘制公式
    this.draw公式();
  }

  draw圆() {
    this.ctx.beginPath();
    this.ctx.arc(this.圆心X, this.圆心Y, this.半径, 0, 2 * Math.PI);
    this.ctx.strokeStyle = this.颜色.圆;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  draw角度区域() {
    // 绘制角度区域（扇形）
    this.ctx.beginPath();
    this.ctx.moveTo(this.圆心X, this.圆心Y);
    this.ctx.arc(this.圆心X, this.圆心Y, this.半径, this.控制点1角度, this.控制点2角度);
    this.ctx.closePath();
    this.ctx.fillStyle = this.颜色.角度区域;
    this.ctx.fill();

    // 填充圆心到角度弧线之间的区域（去掉边框，只保留填色）
    this.ctx.beginPath();
    this.ctx.moveTo(this.圆心X, this.圆心Y);
    this.ctx.arc(this.圆心X, this.圆心Y, this.半径 * 0.3, this.控制点1角度, this.控制点2角度);
    this.ctx.closePath();
    this.ctx.fillStyle = "rgba(255, 213, 79, 0.25)"; // 半透明黄色填充
    this.ctx.fill();
  }

  draw圆心() {
    // 绘制圆心阴影
    this.ctx.beginPath();
    this.ctx.arc(this.圆心X + 2, this.圆心Y + 2, 7.5, 0, 2 * Math.PI);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fill();

    // 绘制圆心
    this.ctx.beginPath();
    this.ctx.arc(this.圆心X, this.圆心Y, 7.5, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.颜色.圆心;
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // 绘制圆心标签
    this.ctx.fillStyle = "#fff";
    this.ctx.font = `bold 12px ${this.字体}`;
    this.ctx.textAlign = "center";
    this.ctx.fillText("•", this.圆心X, this.圆心Y + 4);
  }

  draw控制点() {
    const 控制点1X = this.圆心X + this.半径 * Math.cos(this.控制点1角度);
    const 控制点1Y = this.圆心Y + this.半径 * Math.sin(this.控制点1角度);
    const 控制点2X = this.圆心X + this.半径 * Math.cos(this.控制点2角度);
    const 控制点2Y = this.圆心Y + this.半径 * Math.sin(this.控制点2角度);

    // 绘制控制点1
    this.draw单个控制点(控制点1X, 控制点1Y, "A", 1);

    // 绘制控制点2
    this.draw单个控制点(控制点2X, 控制点2Y, "B", 2);
  }

  draw单个控制点(x, y, 标签, 控制点编号) {
    const 是否悬停 = this.悬停的控制点 === 控制点编号;
    const 是否拖拽 = this.拖拽的控制点 === 控制点编号;

    // 控制点大小根据状态调整
    const 基础大小 = 10.5;
    const 悬停大小 = 基础大小 + 2;
    const 拖拽大小 = 基础大小 + 3;
    const 当前大小 = 是否拖拽 ? 拖拽大小 : 是否悬停 ? 悬停大小 : 基础大小;

    // 控制点颜色
    const 控制点颜色 = 是否悬停 || 是否拖拽 ? this.颜色.控制点悬停 : this.颜色.控制点;

    // 绘制控制点阴影
    this.ctx.beginPath();
    this.ctx.arc(x + 2, y + 2, 当前大小, 0, 2 * Math.PI);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fill();

    // 绘制控制点
    this.ctx.beginPath();
    this.ctx.arc(x, y, 当前大小, 0, 2 * Math.PI);
    this.ctx.fillStyle = 控制点颜色;
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 是否悬停 || 是否拖拽 ? 3 : 2;
    this.ctx.stroke();

    // 绘制控制点标签
    this.ctx.fillStyle = "#fff";
    this.ctx.font = `bold 12px ${this.字体}`;
    this.ctx.textAlign = "center";
    this.ctx.fillText(标签, x, y + 3);

    // 如果悬停或拖拽，绘制外圈光晕效果
    if (是否悬停 || 是否拖拽) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, 当前大小 + 5, 0, 2 * Math.PI);
      this.ctx.strokeStyle = 控制点颜色;
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 0.3;
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    }
  }

  draw虚线() {
    const 控制点1X = this.圆心X + this.半径 * Math.cos(this.控制点1角度);
    const 控制点1Y = this.圆心Y + this.半径 * Math.sin(this.控制点1角度);
    const 控制点2X = this.圆心X + this.半径 * Math.cos(this.控制点2角度);
    const 控制点2Y = this.圆心Y + this.半径 * Math.sin(this.控制点2角度);

    // 绘制从圆心到控制点的虚线
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeStyle = this.颜色.虚线;
    this.ctx.lineWidth = 1;

    // 到控制点A的线
    this.ctx.beginPath();
    this.ctx.moveTo(this.圆心X, this.圆心Y);
    this.ctx.lineTo(控制点1X, 控制点1Y);
    this.ctx.stroke();

    // 到控制点B的线
    this.ctx.beginPath();
    this.ctx.moveTo(this.圆心X, this.圆心Y);
    this.ctx.lineTo(控制点2X, 控制点2Y);
    this.ctx.stroke();

    this.ctx.setLineDash([]);
  }

  draw特殊弧段() {
    const 计算结果 = this.calculate角度();

    // 绘制特殊弧段
    this.ctx.beginPath();
    this.ctx.arc(this.圆心X, this.圆心Y, this.半径, this.控制点1角度, this.控制点2角度);
    this.ctx.strokeStyle = this.颜色.特殊弧;
    this.ctx.lineWidth = 4;
    this.ctx.stroke();

    // 在弧段外侧显示弧度值 - 使用椭圆路径，确保始终在弧度线一侧
    const 弧度中点 = (this.控制点1角度 + this.控制点2角度) / 2;

    // 计算弧度线的方向，确保文本始终在弧度线的一侧
    const 弧度方向 = this.控制点2角度 - this.控制点1角度;
    const 是否顺时针 = 弧度方向 > 0 || (弧度方向 < 0 && Math.abs(弧度方向) > Math.PI);

    // 根据弧度方向调整文本位置，确保始终在弧度线外侧
    let 文本角度 = 弧度中点;
    if (!是否顺时针) {
      // 如果是逆时针，文本角度需要调整到弧度线的外侧
      文本角度 = 弧度中点 + Math.PI;
    }

    // 使用椭圆路径确保距离一致，水平半径略大
    const 椭圆水平半径 = this.半径 + 80; // 水平方向更大
    const 椭圆垂直半径 = this.半径 + 35; // 垂直方向
    const 文本X = this.圆心X + 椭圆水平半径 * Math.cos(文本角度);
    const 文本Y = this.圆心Y + 椭圆垂直半径 * Math.sin(文本角度);

    // 绘制弧度文本（多色显示，无单位）
    this.draw多色文本(`弧度：${计算结果.弧度值.toFixed(2)}`, 文本X, 文本Y + 4, [
      { 文本: "弧度：", 颜色: this.颜色.标签文本 },
      { 文本: 计算结果.弧度值.toFixed(2), 颜色: this.颜色.数值文本 },
    ]);
  }

  draw角度弧度值() {
    const 计算结果 = this.calculate角度();

    // 在圆心下方显示角度值（多色显示）
    this.draw多色文本(`角度：${计算结果.角度值.toFixed(1)}°`, this.圆心X, this.圆心Y + 30, [
      { 文本: "角度：", 颜色: this.颜色.标签文本 },
      { 文本: 计算结果.角度值.toFixed(1), 颜色: this.颜色.数值文本 },
      { 文本: "°", 颜色: this.颜色.单位文本 },
    ]);
  }

  // 绘制多色文本的辅助函数
  draw多色文本(完整文本, x, y, 颜色配置) {
    this.ctx.font = `bold 14px ${this.字体}`;
    this.ctx.textAlign = "center";

    let 当前X = x;
    const 总宽度 = this.ctx.measureText(完整文本).width;
    当前X = x - 总宽度 / 2;

    for (const 配置 of 颜色配置) {
      // 绘制文字阴影
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      this.ctx.fillText(配置.文本, 当前X + this.ctx.measureText(配置.文本).width / 2 + 2, y + 2);

      // 绘制主文字
      this.ctx.fillStyle = 配置.颜色;
      this.ctx.fillText(配置.文本, 当前X + this.ctx.measureText(配置.文本).width / 2, y);
      当前X += this.ctx.measureText(配置.文本).width;
    }
  }

  draw公式() {
    const 计算结果 = this.calculate角度();
    const canvasHeight = this.canvas.height / this.devicePixelRatio;
    const 公式Y = canvasHeight - 60; // 放在Canvas最下方
    const canvasWidth = this.canvas.width / this.devicePixelRatio;

    // 计算公式宽度（包括标签）
    this.ctx.font = `16px ${this.字体}`;
    const 角度公式文本 = `${计算结果.角度值.toFixed(1)}° = ${计算结果.弧度值.toFixed(2)} × (180° / π)`;
    const 弧度公式文本 = `${计算结果.弧度值.toFixed(2)} = ${计算结果.角度值.toFixed(1)}° × (π / 180°)`;

    // 计算包含标签的完整公式宽度
    const 角度标签宽度 = this.ctx.measureText("角度：").width;
    const 弧度标签宽度 = this.ctx.measureText("弧度：").width;
    const 角度公式宽度 = this.ctx.measureText(角度公式文本).width;
    const 弧度公式宽度 = this.ctx.measureText(弧度公式文本).width;
    const 角度总宽度 = 角度标签宽度 + 角度公式宽度;
    const 弧度总宽度 = 弧度标签宽度 + 弧度公式宽度;

    // 计算整体宽度和起始位置，使两个公式水平居中
    const 总宽度 = 角度总宽度 + 75 + 弧度总宽度; // 75px间距
    const 起始X = (canvasWidth - 总宽度) / 2;

    // 绘制精简的公式（多色显示，水平居中排列）
    this.ctx.font = `bold 16px ${this.字体}`;
    this.ctx.textAlign = "left";

    // 角度公式
    this.draw公式多色文本(角度公式文本, 起始X, 公式Y, "角度");

    // 弧度公式
    this.draw公式多色文本(
      弧度公式文本,
      起始X + 角度总宽度 + 75, // 第一个公式总宽度（包括标签）+ 75px间距
      公式Y,
      "弧度"
    );
  }

  // 绘制公式多色文本的辅助函数
  draw公式多色文本(完整文本, x, y, 标签文本) {
    this.ctx.font = `16px ${this.字体}`; // 不加粗
    this.ctx.textAlign = "left";

    let 当前X = x;

    // 在公式前面添加标签
    this.ctx.font = `16px ${this.字体}`;
    this.ctx.fillStyle = this.颜色.标签文本;
    this.ctx.fillText(标签文本 + "：", 当前X, y);
    当前X += this.ctx.measureText(标签文本 + "：").width;

    // 绘制完整公式文本
    // 提取第一个数值（角度或弧度值）
    const 数值匹配 = 完整文本.match(/^([0-9.]+)/);
    if (数值匹配) {
      const 数值 = 数值匹配[1];

      // 绘制数值
      this.ctx.font = `16px ${this.字体}`;
      this.ctx.fillStyle = this.颜色.数值文本;
      this.ctx.fillText(数值, 当前X, y);
      当前X += this.ctx.measureText(数值).width;
    }

    // 提取单位部分（只处理角度单位°）
    const 单位匹配 = 完整文本.match(/([°])/);
    if (单位匹配) {
      const 单位 = 单位匹配[1];
      this.ctx.fillStyle = this.颜色.单位文本;
      this.ctx.fillText(单位, 当前X, y);
      当前X += this.ctx.measureText(单位).width;
    }

    // 等号前添加较小间距
    当前X += 6;

    // 等号
    const 等号匹配 = 完整文本.match(/(=)/);
    if (等号匹配) {
      this.ctx.fillStyle = "#aaa";
      this.ctx.fillText("=", 当前X, y);
      当前X += this.ctx.measureText("=").width;
    }

    // 等号后添加较大间距
    当前X += 0;

    // 剩余文本（π等）- 分别处理不同符号的颜色
    const 剩余文本 = 完整文本.substring(完整文本.indexOf("=") + 1);

    // 逐字符处理剩余文本
    for (let i = 0; i < 剩余文本.length; i++) {
      const 字符 = 剩余文本[i];

      if (字符 === "°") {
        this.ctx.fillStyle = this.颜色.单位文本;
      } else if (字符 === "×" || 字符 === "/") {
        this.ctx.fillStyle = this.颜色.符号文本;
      } else if (字符 === "(" || 字符 === ")") {
        this.ctx.fillStyle = this.颜色.括号文本;
      } else {
        this.ctx.fillStyle = this.颜色.文本;
      }

      this.ctx.fillText(字符, 当前X, y);
      当前X += this.ctx.measureText(字符).width;
    }
  }

  // 重置功能
  reset() {
    // 根据当前坐标系重置控制点位置
    if (this.当前坐标系 === "计算机图形学") {
      this.控制点1角度 = 0;
      this.控制点2角度 = Math.PI / 2;
    } else {
      this.控制点1角度 = -Math.PI / 2;
      this.控制点2角度 = 0;
    }

    // 更新初始值
    this.初始值.控制点1角度 = this.控制点1角度;
    this.初始值.控制点2角度 = this.控制点2角度;

    // 清除拖拽和悬停状态
    this.拖拽的控制点 = null;
    this.悬停的控制点 = null;
    this.canvas.style.cursor = "default";

    // 标记需要更新缓存
    this.缓存.需要更新 = true;

    // 重置所有坐标系的数据到localStorage
    this.resetAllCoordinateSystems();

    // 重新渲染
    this.render();
  }
}

// 初始化Canvas
function initCanvas() {
  const canvas = document.createElement("canvas");
  canvas.id = "radius-angle-canvas";
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  // 替换展示区内容
  const 展示区 = document.querySelector(".展示区");

  // 保存坐标系选择区
  const 坐标系选择区 = 展示区.querySelector(".坐标系选择区");

  // 清空展示区并添加Canvas
  展示区.innerHTML = "";
  展示区.appendChild(canvas);

  // 重新添加坐标系选择区
  if (坐标系选择区) {
    展示区.appendChild(坐标系选择区);
  }

  const canvas实例 = new RadiusAndAngleCanvas("radius-angle-canvas");

  // 绑定重置按钮事件
  const 重置按钮 = document.querySelector(".重置按钮");
  if (重置按钮) {
    重置按钮.addEventListener("click", () => {
      canvas实例.reset();
    });
  }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  initCanvas();
});
