class Linux历史时间轴 {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.历史事件 = [
      {
        年份: 1991,
        标题: "Linux 诞生",
        描述: "Linus Torvalds 发布 Linux 0.01 版本",
        重要程度: 5,
      },
      {
        年份: 1992,
        标题: "GPL 许可证",
        描述: "Linux 采用 GPL 许可证，确保开源自由",
        重要程度: 5,
      },
      {
        年份: 1994,
        标题: "Red Hat 成立",
        描述: "Red Hat 公司成立，商业化 Linux 开始",
        重要程度: 4,
      },
      {
        年份: 2005,
        标题: "Git 版本控制",
        描述: "Linus Torvalds 开发 Git 版本控制系统",
        重要程度: 5,
      },
      {
        年份: 2008,
        标题: "Android 发布",
        描述: "Google 发布基于 Linux 的 Android 系统",
        重要程度: 5,
      },
      {
        年份: 2021,
        标题: "Linux 30 周年",
        描述: "Linux 诞生 30 周年，全球开发者庆祝",
        重要程度: 4,
      },
    ];

    this.当前年份 = 1991;
    this.目标年份 = 2025;
    this.动画进度 = 0;
    this.动画速度 = 0.003;
    this.动画ID = null;

    this.初始化();
  }

  初始化() {
    this.调整Canvas大小();
    window.addEventListener("resize", () => this.调整Canvas大小());
    this.开始动画();
  }

  调整Canvas大小() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // 设置Canvas的实际像素大小
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // 设置Canvas的CSS大小
    this.canvas.style.width = rect.width + "px";
    this.canvas.style.height = rect.height + "px";

    // 重新获取上下文并设置缩放
    this.ctx = this.canvas.getContext("2d");
    this.ctx.scale(dpr, dpr);

    // 保存CSS尺寸用于位置计算
    this.cssWidth = rect.width;
    this.cssHeight = rect.height;
  }

  开始动画() {
    const 动画 = () => {
      this.绘制();
      this.更新动画();
      this.动画ID = requestAnimationFrame(动画);
    };
    动画();
  }

  更新动画() {
    this.动画进度 += this.动画速度;
    if (this.动画进度 > 1) {
      this.动画进度 = 1;
    }

    this.当前年份 = 1991 + (this.目标年份 - 1991) * this.动画进度;
  }

  绘制() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);

    // 绘制背景
    this.绘制背景();

    // 绘制时间轴
    this.绘制时间轴();

    // 绘制历史事件
    this.绘制历史事件();

    // 绘制当前年份指示器
    this.绘制年份指示器();
  }

  绘制背景() {
    // 渐变背景
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.cssHeight);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
  }

  绘制时间轴() {
    const 时间轴Y = this.cssHeight * 0.5; // 时间轴在垂直正中间
    const 时间轴宽度 = this.cssWidth * 0.9; // 时间轴宽度为Canvas宽度的90%
    const 开始X = (this.cssWidth - 时间轴宽度) / 2; // 居中计算
    const 结束X = 开始X + 时间轴宽度;

    // 绘制主时间轴
    this.ctx.strokeStyle = "#4a90e2";
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(开始X, 时间轴Y);
    this.ctx.lineTo(结束X, 时间轴Y);
    this.ctx.stroke();

    // 绘制时间刻度
    this.ctx.strokeStyle = "#4a90e2";
    this.ctx.lineWidth = 2;
    this.ctx.font = "14px Arial";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.textAlign = "center";

    for (let 年份 = 1991; 年份 <= 2025; 年份 += 2) {
      const x = 开始X + ((年份 - 1991) / (2025 - 1991)) * (结束X - 开始X);

      // 绘制刻度线
      this.ctx.beginPath();
      this.ctx.moveTo(x, 时间轴Y - 12);
      this.ctx.lineTo(x, 时间轴Y + 12);
      this.ctx.stroke();

      // 绘制年份标签
      this.ctx.fillText(年份.toString(), x, 时间轴Y + 35);
    }
  }

  绘制历史事件() {
    const 时间轴Y = this.cssHeight * 0.5;
    const 时间轴宽度 = this.cssWidth * 0.9;
    const 开始X = (this.cssWidth - 时间轴宽度) / 2;
    const 结束X = 开始X + 时间轴宽度;

    this.历史事件.forEach((事件, 索引) => {
      const x = 开始X + ((事件.年份 - 1991) / (2025 - 1991)) * (结束X - 开始X);

      // 只绘制当前年份之前的事件
      if (事件.年份 <= this.当前年份) {
        const 透明度 = Math.min(1, (this.当前年份 - 事件.年份) / 2);

        // 判断是上方还是下方显示（交替显示）
        const 位于上方 = 索引 % 2 === 0;
        const 基础距离 = 80;
        const 随机偏移 = (事件.年份 % 3) * 20; // 根据年份添加随机偏移，避免重叠

        let y;
        if (位于上方) {
          y = 时间轴Y - 基础距离 - 随机偏移;
        } else {
          y = 时间轴Y + 基础距离 + 随机偏移;
        }

        // 特殊处理1994年事件，向上移动100px
        if (事件.年份 === 1994) {
          y -= 100;
        }

        // 特殊处理2005年事件，向下移动100px
        if (事件.年份 === 2005) {
          y += 100;
        }

        // 特殊处理2021年事件，向上移动30px
        if (事件.年份 === 2021) {
          y -= 30;
        }

        // 绘制连接线
        this.ctx.strokeStyle = `rgba(74, 144, 226, ${透明度})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, 时间轴Y);
        this.ctx.lineTo(x, y + (位于上方 ? 15 : -15));
        this.ctx.stroke();

        // 绘制事件圆圈
        this.ctx.fillStyle = `rgba(106, 127, 219, ${透明度})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 事件.重要程度 * 3, 0, Math.PI * 2);
        this.ctx.fill();

        // 绘制事件标题和描述，修正文本位置避免与圆圈重叠
        const 圆圈半径 = 事件.重要程度 * 3;
        const 文本间距 = 40;

        if (位于上方) {
          // 绘制标题（金色）
          this.ctx.font = "bold 14px sans-serif";
          this.ctx.fillStyle = `rgba(255, 215, 0, ${透明度})`; // gold颜色

          // 1991年和1992年的事件标题左对齐
          if (事件.年份 === 1991 || 事件.年份 === 1992) {
            this.ctx.textAlign = "left";
            this.ctx.fillText(事件.标题, 20, y - 圆圈半径 - 10);
          } else {
            this.ctx.textAlign = "center";
            this.ctx.fillText(事件.标题, x, y - 圆圈半径 - 10);
          }

          // 绘制描述（白色）
          this.ctx.font = "13px sans-serif";
          this.ctx.fillStyle = `rgba(255, 255, 255, ${透明度})`;

          // 1991年和1992年的事件描述左对齐
          if (事件.年份 === 1991 || 事件.年份 === 1992) {
            this.ctx.textAlign = "left";
            this.ctx.fillText(事件.描述, 20, y - 圆圈半径 - 30);
          } else {
            // 其他事件检查是否会溢出Canvas边界
            const 描述文本宽度 = this.ctx.measureText(事件.描述).width;
            const 左边距 = 20; // 距离Canvas左边的最小距离
            const 右边距 = 20; // 距离Canvas右边的最小距离

            if (x - 描述文本宽度 / 2 < 左边距) {
              // 如果会溢出左边，改为左对齐
              this.ctx.textAlign = "left";
              this.ctx.fillText(事件.描述, 左边距, y - 圆圈半径 - 30);
            } else if (x + 描述文本宽度 / 2 > this.cssWidth - 右边距) {
              // 如果会溢出右边，改为右对齐
              this.ctx.textAlign = "right";
              this.ctx.fillText(事件.描述, this.cssWidth - 右边距, y - 圆圈半径 - 30);
            } else {
              // 居中显示
              this.ctx.textAlign = "center";
              this.ctx.fillText(事件.描述, x, y - 圆圈半径 - 30);
            }
          }
        } else {
          // 绘制标题（金色）
          this.ctx.font = "bold 14px sans-serif";
          this.ctx.fillStyle = `rgba(255, 215, 0, ${透明度})`; // gold颜色

          // 1991年和1992年的事件标题左对齐
          if (事件.年份 === 1991 || 事件.年份 === 1992) {
            this.ctx.textAlign = "left";
            this.ctx.fillText(事件.标题, 20, y + 圆圈半径 + 20);
          } else {
            this.ctx.textAlign = "center";
            this.ctx.fillText(事件.标题, x, y + 圆圈半径 + 20);
          }

          // 绘制描述（白色）
          this.ctx.font = "13px sans-serif";
          this.ctx.fillStyle = `rgba(255, 255, 255, ${透明度})`;

          // 1991年和1992年的事件描述左对齐
          if (事件.年份 === 1991 || 事件.年份 === 1992) {
            this.ctx.textAlign = "left";
            this.ctx.fillText(事件.描述, 20, y + 圆圈半径 + 文本间距);
          } else {
            // 其他事件检查是否会溢出Canvas边界
            const 描述文本宽度 = this.ctx.measureText(事件.描述).width;
            const 左边距 = 20; // 距离Canvas左边的最小距离
            const 右边距 = 20; // 距离Canvas右边的最小距离

            if (x - 描述文本宽度 / 2 < 左边距) {
              // 如果会溢出左边，改为左对齐
              this.ctx.textAlign = "left";
              this.ctx.fillText(事件.描述, 左边距, y + 圆圈半径 + 文本间距);
            } else if (x + 描述文本宽度 / 2 > this.cssWidth - 右边距) {
              // 如果会溢出右边，改为右对齐
              this.ctx.textAlign = "right";
              this.ctx.fillText(事件.描述, this.cssWidth - 右边距, y + 圆圈半径 + 文本间距);
            } else {
              // 居中显示
              this.ctx.textAlign = "center";
              this.ctx.fillText(事件.描述, x, y + 圆圈半径 + 文本间距);
            }
          }
        }
      }
    });
  }

  绘制年份指示器() {
    const 时间轴Y = this.cssHeight * 0.5;
    const 时间轴宽度 = this.cssWidth * 0.9;
    const 开始X = (this.cssWidth - 时间轴宽度) / 2;
    const 结束X = 开始X + 时间轴宽度;

    const x = 开始X + ((this.当前年份 - 1991) / (2025 - 1991)) * (结束X - 开始X);

    // 绘制当前年份指示器
    this.ctx.fillStyle = "#ff6b6b";
    this.ctx.beginPath();
    this.ctx.arc(x, 时间轴Y, 8, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制年份文本
    this.ctx.font = "bold 18px Arial";
    this.ctx.fillStyle = "#ff6b6b";
    this.ctx.textAlign = "center";
    this.ctx.fillText(Math.floor(this.当前年份).toString(), x, 时间轴Y - 25);
  }
}

// 初始化时间轴
new Linux历史时间轴("canvas-linux-history");

const canvas_linux_development = document.getElementById("canvas-linux-development");
const ctx_linux_development = canvas_linux_development.getContext("2d");
canvas_linux_development.width = canvas_linux_development.offsetWidth * window.devicePixelRatio;
canvas_linux_development.height = canvas_linux_development.offsetHeight * window.devicePixelRatio;
ctx_linux_development.scale(window.devicePixelRatio, window.devicePixelRatio);

class Linux分布式开发可视化 {
  constructor() {
    this.canvas = canvas_linux_development;
    this.ctx = ctx_linux_development;
    this.中心X = this.canvas.width / window.devicePixelRatio / 2;
    this.中心Y = this.canvas.height / window.devicePixelRatio / 2;
    this.开发者列表 = [];
    this.动画ID = null;
    this.linus头像 = new Image();
    this.linus头像已加载 = false;

    this.加载Linus头像();
    this.初始化开发者();
    this.开始动画();
  }

  加载Linus头像() {
    this.linus头像.onload = () => {
      this.linus头像已加载 = true;
    };
    this.linus头像.src = "/Images/People/Cohen-Linus-Torvalds.webp";
  }

  初始化开发者() {
    // 创建50-70个开发者
    const 开发者数量 = Math.floor(Math.random() * 21) + 50; // 50-70
    let 已生成中国开发者 = false;

    for (let i = 0; i < 开发者数量; i++) {
      // 使用矩形分布，充分利用Canvas空间
      const 最小距离 = 120; // 增加最小距离，避免与中心头像重叠
      const 最大X距离 = this.中心X * 0.9; // Canvas宽度的90%
      const 最大Y距离 = this.中心Y * 0.9; // Canvas高度的90%

      // 随机选择分布方式：圆形分布或矩形分布
      const 分布方式 = Math.random();
      let x, y;

      if (分布方式 < 0.7) {
        // 70%使用矩形分布
        x = (Math.random() - 0.5) * 最大X距离 * 2;
        y = (Math.random() - 0.5) * 最大Y距离 * 2;

        // 确保不会太靠近中心
        const 到中心距离 = Math.sqrt(x * x + y * y);
        if (到中心距离 < 最小距离) {
          const 角度 = Math.atan2(y, x);
          x = Math.cos(角度) * 最小距离;
          y = Math.sin(角度) * 最小距离;
        }
      } else {
        // 30%使用圆形分布作为补充
        const 距离 = Math.random() * (Math.min(最大X距离, 最大Y距离) - 最小距离) + 最小距离;
        const 角度 = Math.random() * Math.PI * 2;
        x = Math.cos(角度) * 距离;
        y = Math.sin(角度) * 距离;
      }

      // 添加随机偏移
      const 偏移X = (Math.random() - 0.5) * 50;
      const 偏移Y = (Math.random() - 0.5) * 50;

      x += this.中心X + 偏移X;
      y += this.中心Y + 偏移Y;

      // 根据距离计算头像大小和透明度
      const 到中心距离 = Math.sqrt((x - this.中心X) * (x - this.中心X) + (y - this.中心Y) * (y - this.中心Y));
      const 最大距离 = Math.max(最大X距离, 最大Y距离);
      const 距离比例 = 到中心距离 / 最大距离; // 0-1之间
      const 头像大小 = Math.max(6, 30 - 距离比例 * 20); // 6-30像素
      const 透明度 = Math.max(0.1, 1 - 距离比例 * 0.7); // 0.1-1，远处开发者透明度更低

      // 增强浮动动画参数，让浮动效果更明显
      const 浮动幅度 = Math.random() * 15 + 20; // 20-35像素，更明显的浮动
      const 浮动速度 = Math.random() * 0.08 + 0.04; // 0.04-0.12，更快的浮动
      const 浮动相位 = Math.random() * Math.PI * 2;

      // 选择国旗类型，确保至少有一个中国开发者
      let 国旗类型;
      if (!已生成中国开发者 && i === 开发者数量 - 1) {
        // 如果还没有生成中国开发者，且这是最后一个位置，强制生成中国开发者
        国旗类型 = this.国旗数据.findIndex((flag) => flag.type === "china");
        已生成中国开发者 = true;
      } else {
        国旗类型 = Math.floor(Math.random() * this.国旗数据.length);
        // 如果随机选到了中国，标记已生成
        if (this.国旗数据[国旗类型].type === "china") {
          已生成中国开发者 = true;
        }
      }

      this.开发者列表.push({
        x: x,
        y: y,
        原始X: x,
        原始Y: y,
        头像大小: 头像大小,
        透明度: 透明度,
        浮动幅度: 浮动幅度,
        浮动速度: 浮动速度,
        浮动相位: 浮动相位,
        国旗类型: 国旗类型,
      });
    }
  }

  // 100个国家的国旗数据
  国旗数据 = [
    { name: "中国", type: "china", colors: ["#DE2910", "#FFDE00"] },
    { name: "法国", type: "vertical", colors: ["#0055A4", "#FFFFFF", "#EF4135"] },
    { name: "德国", type: "horizontal", colors: ["#000000", "#DD0000", "#FFCE00"] },
    { name: "意大利", type: "vertical", colors: ["#008C45", "#F4F5F0", "#CD212A"] },
    { name: "瑞典", type: "cross", colors: ["#006AA7", "#FECC00"] },
    { name: "巴西", type: "diamond", colors: ["#009C3B", "#FFDF00", "#3E4095"] },
    { name: "美国", type: "stars", colors: ["#B22234", "#FFFFFF", "#3C3B6E"] },
    { name: "英国", type: "union", colors: ["#00247D", "#FFFFFF", "#CF142B"] },
    { name: "俄罗斯", type: "horizontal", colors: ["#FFFFFF", "#0039A6", "#D52B1E"] },
    { name: "加拿大", type: "maple", colors: ["#FF0000", "#FFFFFF"] },
    { name: "澳大利亚", type: "stars", colors: ["#00247D", "#FFFFFF", "#FF0000"] },
    { name: "韩国", type: "yin_yang", colors: ["#FFFFFF", "#C60C30", "#003478"] },
    { name: "印度", type: "chakra", colors: ["#FF9933", "#FFFFFF", "#138808", "#000088"] },
    { name: "墨西哥", type: "eagle", colors: ["#006341", "#FFFFFF", "#CE1126"] },
    { name: "西班牙", type: "horizontal", colors: ["#AA151B", "#F1BF00", "#AA151B"] },
    { name: "葡萄牙", type: "vertical", colors: ["#006600", "#FF0000"] },
    { name: "希腊", type: "cross", colors: ["#0D5EAF", "#FFFFFF"] },
    { name: "芬兰", type: "cross", colors: ["#FFFFFF", "#003580"] },
    { name: "丹麦", type: "cross", colors: ["#C60C30", "#FFFFFF"] },
    { name: "挪威", type: "cross", colors: ["#BA0C2F", "#FFFFFF", "#00205B"] },
    { name: "波兰", type: "horizontal", colors: ["#FFFFFF", "#DC143C"] },
    { name: "乌克兰", type: "horizontal", colors: ["#0057B7", "#FFD700"] },
    { name: "捷克", type: "triangle", colors: ["#FFFFFF", "#D7141A", "#11457E"] },
    { name: "匈牙利", type: "horizontal", colors: ["#C8102E", "#FFFFFF", "#00843D"] },
    { name: "奥地利", type: "horizontal", colors: ["#ED2939", "#FFFFFF", "#ED2939"] },
    { name: "瑞士", type: "cross", colors: ["#D52B1E", "#FFFFFF"] },
    { name: "比利时", type: "vertical", colors: ["#000000", "#FFD90C", "#EF3340"] },
    { name: "荷兰", type: "horizontal", colors: ["#21468B", "#FFFFFF", "#AE1C28"] },
    { name: "卢森堡", type: "horizontal", colors: ["#00A1DE", "#FFFFFF", "#D52B1E"] },
    { name: "爱尔兰", type: "vertical", colors: ["#169B62", "#FFFFFF", "#FF883E"] },
    { name: "冰岛", type: "cross", colors: ["#02529C", "#FFFFFF", "#DC1E35"] },
    { name: "爱沙尼亚", type: "horizontal", colors: ["#0072CE", "#000000", "#FFFFFF"] },
    { name: "拉脱维亚", type: "horizontal", colors: ["#9E3039", "#FFFFFF", "#9E3039"] },
    { name: "立陶宛", type: "horizontal", colors: ["#FDB913", "#006A44", "#C1272D"] },
    { name: "白俄罗斯", type: "horizontal", colors: ["#D22730", "#4AA657", "#FFFFFF"] },
    { name: "摩尔多瓦", type: "vertical", colors: ["#0033A0", "#FFD700", "#CE1126"] },
    { name: "罗马尼亚", type: "vertical", colors: ["#002B7F", "#FCD116", "#CE1126"] },
    { name: "保加利亚", type: "horizontal", colors: ["#FFFFFF", "#00966E", "#D62612"] },
    { name: "塞尔维亚", type: "horizontal", colors: ["#FF0000", "#FFFFFF", "#0000FF"] },
    { name: "克罗地亚", type: "horizontal", colors: ["#FF0000", "#FFFFFF", "#0000FF"] },
    { name: "斯洛文尼亚", type: "horizontal", colors: ["#FFFFFF", "#0000FF", "#FF0000"] },
    { name: "波黑", type: "triangle", colors: ["#002395", "#FECB00", "#FFFFFF"] },
    { name: "黑山", type: "horizontal", colors: ["#D92121", "#FFD700"] },
    { name: "阿尔巴尼亚", type: "horizontal", colors: ["#E41E20", "#000000"] },
    { name: "马其顿", type: "stars", colors: ["#D20000", "#FFE600"] },
    { name: "土耳其", type: "moon", colors: ["#E30A17", "#FFFFFF"] },
    { name: "以色列", type: "stars", colors: ["#FFFFFF", "#0038B8"] },
    { name: "伊朗", type: "horizontal", colors: ["#239F40", "#FFFFFF", "#DA0000"] },
    { name: "伊拉克", type: "horizontal", colors: ["#CE1126", "#FFFFFF", "#007A3D"] },
    { name: "叙利亚", type: "horizontal", colors: ["#FFFFFF", "#000000", "#FF0000"] },
    { name: "黎巴嫩", type: "horizontal", colors: ["#FFFFFF", "#FF0000", "#007A3D"] },
    { name: "约旦", type: "triangle", colors: ["#007A3D", "#FFFFFF", "#FF0000"] },
    { name: "沙特", type: "horizontal", colors: ["#006C35", "#FFFFFF"] },
    { name: "阿联酋", type: "vertical", colors: ["#FF0000", "#FFFFFF", "#00732F", "#000000"] },
    { name: "卡塔尔", type: "vertical", colors: ["#8D1B3D", "#FFFFFF"] },
    { name: "巴林", type: "vertical", colors: ["#FFFFFF", "#D50032"] },
    { name: "科威特", type: "horizontal", colors: ["#007A3D", "#FFFFFF", "#FF0000", "#000000"] },
    { name: "阿曼", type: "horizontal", colors: ["#FFFFFF", "#D52B1E", "#007A3D"] },
    { name: "也门", type: "horizontal", colors: ["#CE1126", "#FFFFFF", "#000000"] },
    { name: "埃及", type: "horizontal", colors: ["#CE1126", "#FFFFFF", "#000000"] },
    { name: "摩洛哥", type: "stars", colors: ["#C1272D", "#006233"] },
    { name: "突尼斯", type: "moon", colors: ["#E70013", "#FFFFFF"] },
    { name: "阿尔及利亚", type: "moon", colors: ["#006233", "#FFFFFF", "#D21034"] },
    { name: "尼日利亚", type: "vertical", colors: ["#008753", "#FFFFFF", "#008753"] },
    {
      name: "南非",
      type: "triangle",
      colors: ["#007847", "#FFD100", "#000000", "#DE3831", "#FFFFFF", "#002395"],
    },
    { name: "肯尼亚", type: "horizontal", colors: ["#000000", "#FFFFFF", "#FF0000", "#FFFFFF", "#006600"] },
    { name: "埃塞俄比亚", type: "horizontal", colors: ["#078930", "#FCDD09", "#DA121A"] },
    { name: "加纳", type: "horizontal", colors: ["#FCD116", "#009E49", "#D21034"] },
    { name: "喀麦隆", type: "vertical", colors: ["#007A5E", "#CE1126", "#FCD116"] },
    { name: "安哥拉", type: "horizontal", colors: ["#FF0000", "#000000", "#FFD700"] },
    { name: "纳米比亚", type: "diagonal", colors: ["#003580", "#FFFFFF", "#D21034", "#009543", "#FFD600"] },
    { name: "津巴布韦", type: "triangle", colors: ["#FFFFFF", "#009739", "#FFD600", "#D21034", "#000000"] },
    { name: "赞比亚", type: "horizontal", colors: ["#198A00", "#FF0000", "#000000", "#FF7F00"] },
    { name: "莫桑比克", type: "triangle", colors: ["#FF0000", "#FFFFFF", "#009739", "#FFD600", "#000000"] },
    { name: "马达加斯加", type: "vertical", colors: ["#FFFFFF", "#F44336", "#388E3C"] },
    { name: "安提瓜和巴布达", type: "triangle", colors: ["#000000", "#FFD600", "#0072CE", "#FFFFFF", "#EF3340"] },
    { name: "阿根廷", type: "horizontal", colors: ["#74ACDF", "#FFFFFF", "#F6B40E"] },
    { name: "智利", type: "stars", colors: ["#0033A0", "#FFFFFF", "#D52B1E"] },
    { name: "哥伦比亚", type: "horizontal", colors: ["#FCD116", "#003893", "#CE1126"] },
    { name: "秘鲁", type: "vertical", colors: ["#D91023", "#FFFFFF", "#D91023"] },
    { name: "委内瑞拉", type: "horizontal", colors: ["#F4D40C", "#003893", "#EF3340"] },
    { name: "乌拉圭", type: "horizontal", colors: ["#FFFFFF", "#68A2D7"] },
    { name: "巴拉圭", type: "horizontal", colors: ["#D52B1E", "#FFFFFF", "#0038A8"] },
    { name: "玻利维亚", type: "horizontal", colors: ["#D52B1E", "#FFD100", "#007934"] },
    { name: "厄瓜多尔", type: "horizontal", colors: ["#FFD100", "#0072CE", "#EF3340"] },
    { name: "古巴", type: "triangle", colors: ["#002A8F", "#FFFFFF", "#D52B1E"] },
    { name: "牙买加", type: "diagonal", colors: ["#FED100", "#007847", "#000000"] },
    { name: "洪都拉斯", type: "horizontal", colors: ["#18C3DF", "#FFFFFF", "#18C3DF"] },
    { name: "危地马拉", type: "vertical", colors: ["#4997D0", "#FFFFFF", "#4997D0"] },
    { name: "巴拿马", type: "quarter", colors: ["#FFFFFF", "#005293", "#D50032", "#FFFFFF"] },
    { name: "哥斯达黎加", type: "horizontal", colors: ["#002B7F", "#FFFFFF", "#CE1126", "#FFFFFF", "#002B7F"] },
    { name: "萨尔瓦多", type: "horizontal", colors: ["#0047AB", "#FFFFFF", "#0047AB"] },
    { name: "新西兰", type: "stars", colors: ["#00247D", "#FFFFFF", "#CC142B"] },
    { name: "新加坡", type: "moon", colors: ["#EF3340", "#FFFFFF"] },
    { name: "马来西亚", type: "stars", colors: ["#010066", "#FFFFFF", "#FFD100"] },
    { name: "印度尼西亚", type: "horizontal", colors: ["#FF0000", "#FFFFFF"] },
    { name: "菲律宾", type: "triangle", colors: ["#0038A8", "#FFFFFF", "#CE1126", "#FFD100"] },
    { name: "泰国", type: "horizontal", colors: ["#A51931", "#FFFFFF", "#2D2A4A", "#FFFFFF", "#A51931"] },
    { name: "越南", type: "stars", colors: ["#DA251D", "#FFFF00"] },
    { name: "柬埔寨", type: "horizontal", colors: ["#032EA1", "#E00025", "#032EA1"] },
    { name: "老挝", type: "horizontal", colors: ["#CE1126", "#002868", "#FFFFFF"] },
    { name: "缅甸", type: "horizontal", colors: ["#FECB00", "#34B233", "#EA2839"] },
    { name: "斯里兰卡", type: "vertical", colors: ["#FFB700", "#00534E", "#A2001D"] },
    { name: "孟加拉", type: "circle", colors: ["#006A4E", "#F42A41"] },
    { name: "巴基斯坦", type: "moon", colors: ["#01411C", "#FFFFFF"] },
    { name: "尼泊尔", type: "triangle", colors: ["#DC143C", "#003893", "#FFFFFF"] },
    { name: "不丹", type: "diagonal", colors: ["#FFCC00", "#FF6600", "#FFFFFF"] },
    { name: "马尔代夫", type: "rectangle", colors: ["#D21034", "#007E3A", "#FFFFFF"] },
    { name: "蒙古", type: "vertical", colors: ["#C4272F", "#015197", "#FFD900"] },
    { name: "哈萨克斯坦", type: "horizontal", colors: ["#00AFCA", "#FFD600"] },
    { name: "乌兹别克斯坦", type: "horizontal", colors: ["#1EB53A", "#FFFFFF", "#0099B5", "#CE1126"] },
    { name: "土库曼斯坦", type: "vertical", colors: ["#009639", "#FFFFFF", "#D21034"] },
    { name: "吉尔吉斯斯坦", type: "circle", colors: ["#E8112D", "#FFD600"] },
    { name: "塔吉克斯坦", type: "horizontal", colors: ["#FFFFFF", "#D52B1E", "#007A3D"] },
    { name: "格鲁吉亚", type: "cross", colors: ["#FFFFFF", "#FF0000"] },
    { name: "亚美尼亚", type: "horizontal", colors: ["#D90012", "#0033A0", "#F2A800"] },
    { name: "阿塞拜疆", type: "horizontal", colors: ["#00B3E3", "#FFFFFF", "#ED2939"] },
    { name: "日本", type: "circle", colors: ["#FFFFFF", "#BC002D"] },
  ];

  开始动画() {
    const 动画 = () => {
      this.绘制();
      this.更新浮动();
      this.动画ID = requestAnimationFrame(动画);
    };
    动画();
  }

  更新浮动() {
    const 当前时间 = performance.now() * 0.001; // 转换为秒

    this.开发者列表.forEach((开发者) => {
      // 计算浮动位置 - 使用更明显的正弦波组合让动画更自然
      const 浮动X = Math.sin(当前时间 * 开发者.浮动速度 + 开发者.浮动相位) * 开发者.浮动幅度;
      const 浮动Y = Math.cos(当前时间 * 开发者.浮动速度 * 0.8 + 开发者.浮动相位 + Math.PI / 4) * 开发者.浮动幅度 * 0.9;

      开发者.x = 开发者.原始X + 浮动X;
      开发者.y = 开发者.原始Y + 浮动Y;
    });
  }

  绘制() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制连接线（先绘制，这样头像会在上面）
    this.绘制连接线();

    // 绘制所有开发者头像
    this.开发者列表.forEach((开发者) => {
      this.绘制头像(开发者);
    });

    // 最后绘制中心的Linus Torvalds头像
    this.绘制中心头像();
  }

  绘制连接线() {
    this.ctx.strokeStyle = "rgba(100, 150, 255, 0.2)";
    this.ctx.lineWidth = 1;

    this.开发者列表.forEach((开发者) => {
      this.ctx.beginPath();
      this.ctx.moveTo(开发者.x, 开发者.y);
      this.ctx.lineTo(this.中心X, this.中心Y);
      this.ctx.stroke();
    });
  }

  绘制头像(开发者) {
    this.ctx.save();

    // 设置透明度
    this.ctx.globalAlpha = 开发者.透明度;

    // 绘制头像背景（圆形）
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.beginPath();
    this.ctx.arc(开发者.x, 开发者.y, 开发者.头像大小, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制头像边框
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // 绘制国旗（在圆形区域内）
    this.绘制国旗(开发者);

    this.ctx.restore();
  }

  绘制国旗(开发者) {
    const 头像大小 = 开发者.头像大小;
    const x = 开发者.x;
    const y = 开发者.y;
    const flag = this.国旗数据[开发者.国旗类型];
    const colors = flag.colors;

    // 创建圆形裁剪区域，确保国旗在圆形内
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, 头像大小, 0, Math.PI * 2);
    this.ctx.clip();

    switch (flag.type) {
      case "horizontal": {
        const h = (头像大小 * 2) / colors.length;
        for (let i = 0; i < colors.length; i++) {
          this.ctx.fillStyle = colors[i];
          this.ctx.fillRect(x - 头像大小, y - 头像大小 + i * h, 头像大小 * 2, h);
        }
        break;
      }
      case "vertical": {
        const w = (头像大小 * 2) / colors.length;
        for (let i = 0; i < colors.length; i++) {
          this.ctx.fillStyle = colors[i];
          this.ctx.fillRect(x - 头像大小 + i * w, y - 头像大小, w, 头像大小 * 2);
        }
        break;
      }
      case "cross": {
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.fillStyle = colors[1];
        this.ctx.fillRect(x - 头像大小 * 0.2, y - 头像大小, 头像大小 * 0.4, 头像大小 * 2);
        this.ctx.fillRect(x - 头像大小, y - 头像大小 * 0.2, 头像大小 * 2, 头像大小 * 0.4);
        break;
      }
      case "circle": {
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.fillStyle = colors[1];
        this.ctx.beginPath();
        this.ctx.arc(x, y, 头像大小 * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      }
      case "stars": {
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.fillStyle = colors[1];
        // 绘制五角星
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = Math.PI / 2 + i * ((2 * Math.PI) / 5);
          const sx = x + Math.cos(angle) * 头像大小 * 0.4;
          const sy = y - Math.sin(angle) * 头像大小 * 0.4;
          if (i === 0) this.ctx.moveTo(sx, sy);
          else this.ctx.lineTo(sx, sy);
        }
        this.ctx.closePath();
        this.ctx.fill();
        break;
      }
      case "china": {
        // 中国国旗 - 五星红旗
        // 红色背景
        this.ctx.fillStyle = "#DE2910";
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);

        // 黄色五角星
        this.ctx.fillStyle = "#FFDE00";

        // 绘制大五角星（左上角）
        this.绘制五角星(x - 头像大小 * 0.4, y - 头像大小 * 0.4, 头像大小 * 0.3);

        // 绘制四个小五角星（围绕大星）
        const 小星大小 = 头像大小 * 0.15;
        const 小星距离 = 头像大小 * 0.6;

        // 右上小星
        this.绘制五角星(x + 头像大小 * 0.2, y - 头像大小 * 0.3, 小星大小);
        // 右中小星
        this.绘制五角星(x + 头像大小 * 0.3, y, 小星大小);
        // 右下小星
        this.绘制五角星(x + 头像大小 * 0.2, y + 头像大小 * 0.3, 小星大小);
        // 左中小星
        this.绘制五角星(x - 头像大小 * 0.1, y + 头像大小 * 0.1, 小星大小);
        break;
      }
      case "diamond": {
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.fillStyle = colors[1];
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 头像大小 * 0.8);
        this.ctx.lineTo(x + 头像大小 * 0.8, y);
        this.ctx.lineTo(x, y + 头像大小 * 0.8);
        this.ctx.lineTo(x - 头像大小 * 0.8, y);
        this.ctx.closePath();
        this.ctx.fill();
        break;
      }
      case "triangle": {
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.fillStyle = colors[1];
        this.ctx.beginPath();
        this.ctx.moveTo(x - 头像大小, y + 头像大小);
        this.ctx.lineTo(x + 头像大小, y + 头像大小);
        this.ctx.lineTo(x, y - 头像大小);
        this.ctx.closePath();
        this.ctx.fill();
        break;
      }
      case "moon": {
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.fillStyle = colors[1];
        this.ctx.beginPath();
        this.ctx.arc(x, y, 头像大小 * 0.6, Math.PI * 0.2, Math.PI * 1.8, false);
        this.ctx.arc(x + 头像大小 * 0.2, y, 头像大小 * 0.5, Math.PI * 1.8, Math.PI * 0.2, true);
        this.ctx.closePath();
        this.ctx.fill();
        break;
      }
      case "diagonal": {
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(x - 头像大小, y + 头像大小);
        this.ctx.lineTo(x + 头像大小, y - 头像大小);
        this.ctx.lineTo(x + 头像大小, y + 头像大小);
        this.ctx.closePath();
        this.ctx.clip();
        this.ctx.fillStyle = colors[1];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.restore();
        break;
      }
      case "rectangle": {
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.fillStyle = colors[1];
        this.ctx.fillRect(x - 头像大小 * 0.6, y - 头像大小 * 0.6, 头像大小 * 1.2, 头像大小 * 1.2);
        this.ctx.fillStyle = colors[2];
        this.ctx.fillRect(x - 头像大小 * 0.2, y - 头像大小 * 0.2, 头像大小 * 0.4, 头像大小 * 0.4);
        break;
      }
      case "quarter": {
        // 四分区
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小, 头像大小);
        this.ctx.fillStyle = colors[1];
        this.ctx.fillRect(x, y - 头像大小, 头像大小, 头像大小);
        this.ctx.fillStyle = colors[2];
        this.ctx.fillRect(x - 头像大小, y, 头像大小, 头像大小);
        this.ctx.fillStyle = colors[3];
        this.ctx.fillRect(x, y, 头像大小, 头像大小);
        break;
      }
      case "union": {
        // 英国国旗简化版
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.fillStyle = colors[1];
        this.ctx.fillRect(x - 头像大小 * 0.15, y - 头像大小, 头像大小 * 0.3, 头像大小 * 2);
        this.ctx.fillRect(x - 头像大小, y - 头像大小 * 0.15, 头像大小 * 2, 头像大小 * 0.3);
        this.ctx.fillStyle = colors[2];
        this.ctx.fillRect(x - 头像大小 * 0.1, y - 头像大小, 头像大小 * 0.2, 头像大小 * 2);
        this.ctx.fillRect(x - 头像大小, y - 头像大小 * 0.1, 头像大小 * 2, 头像大小 * 0.2);
        break;
      }
      case "maple": {
        // 加拿大枫叶简化版
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.fillStyle = colors[1];
        this.ctx.fillRect(x - 头像大小 * 0.3, y - 头像大小, 头像大小 * 0.6, 头像大小 * 2);
        this.ctx.fillRect(x - 头像大小, y - 头像大小 * 0.3, 头像大小 * 2, 头像大小 * 0.6);
        break;
      }
      case "yin_yang": {
        // 韩国太极简化版
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.fillStyle = colors[1];
        this.ctx.beginPath();
        this.ctx.arc(x, y, 头像大小 * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = colors[2];
        this.ctx.beginPath();
        this.ctx.arc(x, y, 头像大小 * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      }
      case "chakra": {
        // 印度轮简化版
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.fillStyle = colors[1];
        this.ctx.fillRect(x - 头像大小, y - 头像大小 * 0.33, 头像大小 * 2, 头像大小 * 0.67);
        this.ctx.fillStyle = colors[2];
        this.ctx.fillRect(x - 头像大小, y + 头像大小 * 0.33, 头像大小 * 2, 头像大小 * 0.67);
        this.ctx.fillStyle = colors[3];
        this.ctx.beginPath();
        this.ctx.arc(x, y, 头像大小 * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      }
      case "eagle": {
        // 墨西哥鹰简化版
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
        this.ctx.fillStyle = colors[1];
        this.ctx.fillRect(x - 头像大小, y - 头像大小 * 0.33, 头像大小 * 2, 头像大小 * 0.67);
        this.ctx.fillStyle = colors[2];
        this.ctx.fillRect(x - 头像大小, y + 头像大小 * 0.33, 头像大小 * 2, 头像大小 * 0.67);
        break;
      }
      default: {
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x - 头像大小, y - 头像大小, 头像大小 * 2, 头像大小 * 2);
      }
    }

    this.ctx.restore();
  }

  绘制五角星(中心X, 中心Y, 大小) {
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const 外角 = Math.PI / 2 + i * ((2 * Math.PI) / 5);
      const 内角 = 外角 + Math.PI / 5;

      const 外点X = 中心X + Math.cos(外角) * 大小;
      const 外点Y = 中心Y - Math.sin(外角) * 大小;
      const 内点X = 中心X + Math.cos(内角) * 大小 * 0.382; // 黄金比例
      const 内点Y = 中心Y - Math.sin(内角) * 大小 * 0.382;

      if (i === 0) {
        this.ctx.moveTo(外点X, 外点Y);
      } else {
        this.ctx.lineTo(外点X, 外点Y);
      }
      this.ctx.lineTo(内点X, 内点Y);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  绘制中心头像() {
    this.ctx.save();

    const 中心头像大小 = 50;

    if (this.linus头像已加载) {
      // 使用drawImage绘制Linus Torvalds的真实头像
      const 头像宽高比 = this.linus头像.width / this.linus头像.height;
      let 绘制宽度, 绘制高度;

      if (头像宽高比 > 1) {
        // 图片更宽，以高度为准
        绘制高度 = 中心头像大小 * 2;
        绘制宽度 = 绘制高度 * 头像宽高比;
      } else {
        // 图片更高，以宽度为准
        绘制宽度 = 中心头像大小 * 2;
        绘制高度 = 绘制宽度 / 头像宽高比;
      }

      // 创建圆形裁剪区域
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.中心X, this.中心Y, 中心头像大小, 0, Math.PI * 2);
      this.ctx.clip();

      // 绘制图像
      this.ctx.drawImage(this.linus头像, this.中心X - 绘制宽度 / 2, this.中心Y - 绘制高度 / 2, 绘制宽度, 绘制高度);

      this.ctx.restore();
    } else {
      // 如果图片未加载，绘制占位符
      this.ctx.fillStyle = "#FF6B6B";
      this.ctx.beginPath();
      this.ctx.arc(this.中心X, this.中心Y, 中心头像大小, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 绘制中心头像边框
    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.中心X, this.中心Y, 中心头像大小, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.restore();
  }
}

// 初始化可视化
new Linux分布式开发可视化();

// 操作系统数据 - 各维度评分（0-100）
const 操作系统数据 = {
  Linux: {
    娱乐: 40,
    运维: 100,
    开发: 90,
    设计: 70,
    办公: 70,
  },
  Windows: {
    娱乐: 100,
    运维: 70,
    开发: 80,
    设计: 85,
    办公: 95,
  },
  MacOS: {
    娱乐: 75,
    运维: 75,
    开发: 90,
    设计: 100,
    办公: 85,
  },
};

// 维度配置 - 均匀分布在360°，办公在顶部(0°)
const 维度配置 = [
  { 名称: "办公", 弧度: 0 - Math.PI / 2 }, // 顶部 (0°)，注意：弧度0是正右方
  { 名称: "娱乐", 弧度: (2 * Math.PI) / 5 - Math.PI / 2 }, // 右上 (72°)
  { 名称: "运维", 弧度: ((2 * Math.PI) / 5) * 2 - Math.PI / 2 }, // 右侧 (144°)
  { 名称: "开发", 弧度: ((2 * Math.PI) / 5) * 3 - Math.PI / 2 }, // 右下 (216°)
  { 名称: "设计", 弧度: ((2 * Math.PI) / 5) * 4 - Math.PI / 2 }, // 左上 (288°)
];

class 多边形比较器 {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.当前操作系统 = "Linux";
    this.动画进行中 = false;
    this.操作系统列表 = ["Linux", "Windows", "MacOS"];
    this.悬停的按钮索引 = -1;
    this.按钮重绘动画ID = null;

    // 等待DOM加载完成后初始化
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.初始化());
    } else {
      this.初始化();
    }
  }

  初始化() {
    this.初始化Canvas();
    this.绑定事件();
    this.绘制完整界面();
  }

  初始化Canvas() {
    // 设置canvas尺寸
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // 设置canvas样式尺寸
    this.canvas.style.width = rect.width + "px";
    this.canvas.style.height = rect.height + "px";

    // 计算中心点和半径
    this.中心X = rect.width / 2;
    this.中心Y = rect.height / 2;
    this.半径 = Math.min(this.中心X, this.中心Y) * 0.6; // 减小半径，为单选按钮留空间

    // 计算单选按钮区域
    this.按钮区域 = {
      y: rect.height - 60,
      height: 45,
      width: rect.width,
    };
  }

  绑定事件() {
    // 监听Canvas点击事件
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 检查是否点击了单选按钮区域
      if (y >= this.按钮区域.y && y <= this.按钮区域.y + this.按钮区域.height) {
        const 按钮宽度 = 150;
        const 总宽度 = 按钮宽度 * 3;
        const 起始X = (this.按钮区域.width - 总宽度) / 2;

        // 检查是否在按钮区域内
        if (x >= 起始X && x <= 起始X + 总宽度) {
          const 点击的索引 = Math.floor((x - 起始X) / 按钮宽度);
          if (点击的索引 >= 0 && 点击的索引 < this.操作系统列表.length) {
            const 新操作系统 = this.操作系统列表[点击的索引];
            if (新操作系统 !== this.当前操作系统) {
              const 旧操作系统 = this.当前操作系统;

              // 立即更新按钮状态
              this.当前操作系统 = 新操作系统;
              this.只重绘按钮区域();

              // 然后开始动画（使用旧操作系统作为起始数据）
              this.切换操作系统(新操作系统, 旧操作系统);
            }
          }
        }
      }
    });

    // 监听鼠标移动事件（用于悬停效果）
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 检查是否在单选按钮区域
      if (y >= this.按钮区域.y && y <= this.按钮区域.y + this.按钮区域.height) {
        const 按钮宽度 = 150;
        const 总宽度 = 按钮宽度 * 3;
        const 起始X = (this.按钮区域.width - 总宽度) / 2;

        if (x >= 起始X && x <= 起始X + 总宽度) {
          const 悬停的索引 = Math.floor((x - 起始X) / 按钮宽度);
          if (悬停的索引 >= 0 && 悬停的索引 < this.操作系统列表.length) {
            if (this.悬停的按钮索引 !== 悬停的索引) {
              this.悬停的按钮索引 = 悬停的索引;
              // 使用requestAnimationFrame优化重绘
              if (this.按钮重绘动画ID) {
                cancelAnimationFrame(this.按钮重绘动画ID);
              }
              this.按钮重绘动画ID = requestAnimationFrame(() => {
                this.只重绘按钮区域();
                this.按钮重绘动画ID = null;
              });
            }
          } else {
            if (this.悬停的按钮索引 !== -1) {
              this.悬停的按钮索引 = -1;
              if (this.按钮重绘动画ID) {
                cancelAnimationFrame(this.按钮重绘动画ID);
              }
              this.按钮重绘动画ID = requestAnimationFrame(() => {
                this.只重绘按钮区域();
                this.按钮重绘动画ID = null;
              });
            }
          }
        } else {
          if (this.悬停的按钮索引 !== -1) {
            this.悬停的按钮索引 = -1;
            if (this.按钮重绘动画ID) {
              cancelAnimationFrame(this.按钮重绘动画ID);
            }
            this.按钮重绘动画ID = requestAnimationFrame(() => {
              this.只重绘按钮区域();
              this.按钮重绘动画ID = null;
            });
          }
        }
      } else {
        if (this.悬停的按钮索引 !== -1) {
          this.悬停的按钮索引 = -1;
          if (this.按钮重绘动画ID) {
            cancelAnimationFrame(this.按钮重绘动画ID);
          }
          this.按钮重绘动画ID = requestAnimationFrame(() => {
            this.只重绘按钮区域();
            this.按钮重绘动画ID = null;
          });
        }
      }
    });

    // 监听鼠标离开事件
    this.canvas.addEventListener("mouseleave", () => {
      if (this.悬停的按钮索引 !== -1) {
        this.悬停的按钮索引 = -1;
        if (this.按钮重绘动画ID) {
          cancelAnimationFrame(this.按钮重绘动画ID);
        }
        this.按钮重绘动画ID = requestAnimationFrame(() => {
          this.只重绘按钮区域();
          this.按钮重绘动画ID = null;
        });
      }
    });

    // 监听窗口大小变化
    window.addEventListener("resize", () => {
      this.初始化Canvas();
      this.绘制完整界面();
    });
  }

  切换操作系统(新操作系统, 旧操作系统 = null) {
    this.动画进行中 = true;
    const 旧数据 = 操作系统数据[旧操作系统];
    const 新数据 = 操作系统数据[新操作系统];

    // 使用 requestAnimationFrame 进行动画
    const 动画时长 = 250; // 0.25秒
    const 开始时间 = performance.now();

    const 动画 = (当前时间) => {
      const 经过时间 = 当前时间 - 开始时间;
      const 进度 = Math.min(经过时间 / 动画时长, 1);

      // 使用缓动函数让动画更自然
      const 缓动进度 = this.缓动函数(进度);

      // 计算当前帧的数据
      const 当前数据 = {};
      Object.keys(新数据).forEach((维度) => {
        当前数据[维度] = 旧数据[维度] + (新数据[维度] - 旧数据[维度]) * 缓动进度;
      });

      // 只重绘动态内容，不重绘静态背景
      this.绘制动态内容(当前数据);

      if (进度 < 1) {
        requestAnimationFrame(动画);
      } else {
        this.动画进行中 = false;
        // 动画结束时绘制最终状态
        this.绘制动态内容(新数据);
      }
    };

    requestAnimationFrame(动画);
  }

  缓动函数(t) {
    // 使用 ease-out 缓动函数，让动画更自然
    return 1 - Math.pow(1 - t, 3);
  }

  绘制完整界面(数据 = null) {
    const 使用数据 = 数据 || 操作系统数据[this.当前操作系统];

    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制背景网格
    this.绘制背景网格();

    // 绘制动态内容
    this.绘制动态内容(使用数据);

    // 绘制维度标签
    this.绘制维度标签();

    // 绘制单选按钮
    this.绘制单选按钮();
  }

  绘制动态内容(数据) {
    // 清空多边形和圆心区域（从中心向外扩展一点）
    const 清空半径 = this.半径 + 50; // 比多边形稍大一些
    this.ctx.clearRect(this.中心X - 清空半径, this.中心Y - 清空半径, 清空半径 * 2, 清空半径 * 2);

    // 重新绘制背景网格（只绘制被清空的区域）
    this.绘制背景网格();

    // 绘制动态内容：多边形、圆心和维度标签
    this.绘制多边形形状(数据);
    this.绘制圆心();
    this.绘制维度标签();
  }

  绘制背景网格() {
    this.ctx.strokeStyle = "#444";
    this.ctx.lineWidth = 1;

    // 绘制同心圆
    for (let i = 1; i <= 5; i++) {
      const 当前半径 = (this.半径 * i) / 5;
      this.ctx.beginPath();
      this.ctx.arc(this.中心X, this.中心Y, 当前半径, 0, 2 * Math.PI);
      this.ctx.stroke();
    }

    // 绘制径向线
    维度配置.forEach((维度) => {
      this.ctx.beginPath();
      this.ctx.moveTo(this.中心X, this.中心Y);
      const 终点X = this.中心X + Math.cos(维度.弧度) * this.半径;
      const 终点Y = this.中心Y + Math.sin(维度.弧度) * this.半径;
      this.ctx.lineTo(终点X, 终点Y);
      this.ctx.stroke();
    });
  }

  绘制多边形形状(数据) {
    this.ctx.beginPath();

    维度配置.forEach((维度, 索引) => {
      const 分数 = 数据[维度.名称];
      const 当前半径 = (this.半径 * 分数) / 100;
      const x = this.中心X + Math.cos(维度.弧度) * 当前半径;
      const y = this.中心Y + Math.sin(维度.弧度) * 当前半径;

      if (索引 === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });

    this.ctx.closePath();

    // 填充多边形
    this.ctx.fillStyle = "rgba(100, 150, 255, 0.3)";
    this.ctx.fill();

    // 绘制边框
    this.ctx.strokeStyle = "#6496ff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  绘制维度标签() {
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "16px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    维度配置.forEach((维度) => {
      const 标签半径 = this.半径 + 25;
      const x = this.中心X + Math.cos(维度.弧度) * 标签半径;
      const y = this.中心Y + Math.sin(维度.弧度) * 标签半径;

      this.ctx.fillText(维度.名称, x, y);
    });
  }

  绘制圆心() {
    this.ctx.fillStyle = "#6496ff";
    this.ctx.beginPath();
    this.ctx.arc(this.中心X, this.中心Y, 4, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  绘制单选按钮() {
    const 按钮宽度 = 150;
    const 按钮高度 = this.按钮区域.height;
    const 按钮Y = this.按钮区域.y;
    const 总宽度 = 按钮宽度 * 3;
    const 起始X = (this.按钮区域.width - 总宽度) / 2; // 水平居中

    this.操作系统列表.forEach((操作系统, 索引) => {
      const 按钮X = 起始X + 索引 * 按钮宽度;
      const 是否选中 = 操作系统 === this.当前操作系统;
      const 是否悬停 = 索引 === this.悬停的按钮索引;

      // 确定按钮背景颜色
      let 背景颜色 = "#333";
      if (是否选中) {
        背景颜色 = "#2456af";
      } else if (是否悬停) {
        背景颜色 = "#555";
      }

      // 绘制按钮背景
      this.ctx.fillStyle = 背景颜色;
      this.ctx.fillRect(按钮X + 10, 按钮Y + 5, 按钮宽度 - 20, 按钮高度 - 10);

      // 绘制按钮边框
      this.ctx.strokeStyle = 是否选中 ? "#48c" : "#555";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(按钮X + 10, 按钮Y + 5, 按钮宽度 - 20, 按钮高度 - 10);

      // 绘制文字
      this.ctx.fillStyle = 是否选中 ? "#fff" : "#ccc";
      this.ctx.font = "16px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(操作系统, 按钮X + 按钮宽度 / 2, 按钮Y + 按钮高度 / 2);
    });
  }

  只重绘按钮区域() {
    // 只清空按钮区域
    this.ctx.clearRect(0, this.按钮区域.y, this.canvas.width, this.按钮区域.height);
    this.绘制单选按钮();
  }
}

// 初始化多边形比较器
new 多边形比较器("canvas-os-comparison");
