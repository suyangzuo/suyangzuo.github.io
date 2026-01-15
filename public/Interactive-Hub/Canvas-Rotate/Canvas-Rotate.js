class Canvas旋转演示器 {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.宽 = this.canvas.offsetWidth;
    this.高 = this.canvas.offsetHeight;
    this.ctx.scale(this.dpr, this.dpr);
    this.鼠标样式 = {
      默认: 'url("/Images/Common/鼠标-默认.cur"), auto',
      指向: 'url("/Images/Common/鼠标-指向.cur"), pointer',
      拖拽: "grab",
      拖拽中: "grabbing",
      移动: 'url("/Images/Common/鼠标-移动.cur"), move',
      旋转: 'url("/Images/Common/鼠标-移动.cur"), move',
    };
    this.原点 = {
      x: 0,
      y: 0,
    };
    this.初始旋转弧度 = 0;
    this.旋转弧度 = 0;
    this.空格已按下 = false;
    this.Ctrl已按下 = false;
    this.鼠标已按下 = false;
    this.拖拽画布 = false;
    this.旋转画布中 = false;
    this.鼠标按下坐标 = {
      x: null,
      y: null,
    };
    this.鼠标坐标 = {
      x: null,
      y: null,
    };
    this.拖拽偏移 = {
      x: null,
      y: null,
    };
    this.存储键 = {
      原点x: "canvas-rotate-origin-x",
      原点y: "canvas-rotate-origin-y",
      旋转弧度: "canvas-rotate-rotation",
      选中形状类型: "canvas-rotate-selected-shape",
      形状数组: "canvas-rotate-shapes",
    };
    this.重置按钮 = document.querySelector(".重置按钮");
    
    this.图形样式 = {
      普通: {
        填充色: "#2a5082cc",
        描边色: "silver",
        描边宽度: 2,
        中心点描边色: "#ba8e23",
        中心点描边宽度: 1.5,
      },
      悬停: {
        填充色: "#3a6092cc",
        描边色: "white",
        描边宽度: 2,
        中心点描边色: "gold",
        中心点描边宽度: 1.5,
      },
    };
    
    this.默认形状数组 = [
      {
        类型: "矩形",
        中心点: null, // 将在初始化时随机生成
        宽度: 120,
        高度: 80,
        悬停中: false,
        拖拽中: false,
      },
      {
        类型: "椭圆",
        中心点: null, // 将在初始化时随机生成
        半径x: 80,
        半径y: 60,
        悬停中: false,
        拖拽中: false,
      },
      {
        类型: "正多边形",
        中心点: null, // 将在初始化时随机生成
        边数: 6,
        半径: 70,
        悬停中: false,
        拖拽中: false,
      },
      {
        类型: "不规则多边形",
        中心点: null,
        顶点: [
          { x: 260, y: 270 }, // 绝对坐标，将在生成随机位置时调整
          { x: 350, y: 280 },
          { x: 360, y: 340 },
          { x: 280, y: 350 },
          { x: 250, y: 320 },
        ],
        悬停中: false,
        拖拽中: false,
      },
    ];
    
    // 深拷贝默认形状数组作为初始形状数组
    this.形状数组 = this.默认形状数组.map(形状 => {
      const 副本 = { ...形状 };
      if (形状.中心点) {
        副本.中心点 = { ...形状.中心点 };
      }
      if (形状.顶点) {
        副本.顶点 = 形状.顶点.map(v => ({ ...v }));
      }
      return 副本;
    });
    
    this.当前悬停形状索引 = -1;
    this.当前拖拽形状索引 = -1;
    this.拖拽形状偏移 = { x: null, y: null };
    this.拖拽前形状中心点Canvas坐标 = [];
    
    this.形状单选框 = document.querySelectorAll('input[name="形状"]');
    
    this.读取状态();
    this.刷新边界矩形();
    this.绘制全部();
    this.添加事件侦听器();
  }
  
  生成形状随机位置() {
    // 计算可用区域（原点右下方，留出边距）
    const 边距 = 50;
    const 最小x = 边距;
    const 最大x = this.宽 - 边距;
    const 最小y = 边距;
    const 最大y = this.高 - 边距;
    
    for (const 形状 of this.默认形状数组) {
      let 中心点x, 中心点y;
      
      if (形状.类型 === "矩形") {
        // 确保矩形完全在Canvas内
        const 半宽 = 形状.宽度 / 2;
        const 半高 = 形状.高度 / 2;
        中心点x = 最小x + 半宽 + Math.random() * (最大x - 最小x - 形状.宽度);
        中心点y = 最小y + 半高 + Math.random() * (最大y - 最小y - 形状.高度);
      } else if (形状.类型 === "椭圆") {
        // 确保椭圆完全在Canvas内
        const 半径x = 形状.半径x;
        const 半径y = 形状.半径y;
        中心点x = 最小x + 半径x + Math.random() * (最大x - 最小x - 半径x * 2);
        中心点y = 最小y + 半径y + Math.random() * (最大y - 最小y - 半径y * 2);
      } else if (形状.类型 === "正多边形") {
        // 确保正多边形完全在Canvas内
        const 半径 = 形状.半径;
        中心点x = 最小x + 半径 + Math.random() * (最大x - 最小x - 半径 * 2);
        中心点y = 最小y + 半径 + Math.random() * (最大y - 最小y - 半径 * 2);
      } else if (形状.类型 === "不规则多边形") {
        // 顶点是绝对坐标，为每个顶点添加随机偏移（保持形状大致不变，但每个顶点位置随机）
        const 随机偏移范围 = 30; // 每个顶点可以随机偏移±30像素
        const 新顶点 = [];
        for (let i = 0; i < 形状.顶点.length; i++) {
          const 随机偏移x = (Math.random() - 0.5) * 2 * 随机偏移范围;
          const 随机偏移y = (Math.random() - 0.5) * 2 * 随机偏移范围;
          新顶点.push({
            x: 形状.顶点[i].x + 随机偏移x,
            y: 形状.顶点[i].y + 随机偏移y,
          });
        }
        
        // 计算新顶点的边界
        let 最小顶点x = Infinity;
        let 最大顶点x = -Infinity;
        let 最小顶点y = Infinity;
        let 最大顶点y = -Infinity;
        for (const 顶点 of 新顶点) {
          最小顶点x = Math.min(最小顶点x, 顶点.x);
          最大顶点x = Math.max(最大顶点x, 顶点.x);
          最小顶点y = Math.min(最小顶点y, 顶点.y);
          最大顶点y = Math.max(最大顶点y, 顶点.y);
        }
        const 顶点宽度 = 最大顶点x - 最小顶点x;
        const 顶点高度 = 最大顶点y - 最小顶点y;
        
        // 计算中心点的可用范围，确保所有顶点都在Canvas内
        const 半宽 = 顶点宽度 / 2;
        const 半高 = 顶点高度 / 2;
        const 当前中心x = (最小顶点x + 最大顶点x) / 2;
        const 当前中心y = (最小顶点y + 最大顶点y) / 2;
        
        // 生成新的中心点位置（在Canvas范围内）
        中心点x = 最小x + 半宽 + Math.random() * (最大x - 最小x - 顶点宽度);
        中心点y = 最小y + 半高 + Math.random() * (最大y - 最小y - 顶点高度);
        
        // 将顶点移动到新的中心点位置（保持顶点之间的相对位置）
        const 偏移x = 中心点x - 当前中心x;
        const 偏移y = 中心点y - 当前中心y;
        for (let i = 0; i < 新顶点.length; i++) {
          形状.顶点[i] = {
            x: 新顶点[i].x + 偏移x,
            y: 新顶点[i].y + 偏移y,
          };
        }
      }
      
      if (中心点x !== undefined && 中心点y !== undefined) {
        形状.中心点 = { x: 中心点x, y: 中心点y };
      }
    }
  }
  
  计算不规则多边形中心点() {
    for (const 形状 of this.形状数组) {
      if (形状.类型 === "不规则多边形") {
        let 总x = 0;
        let 总y = 0;
        for (const 顶点 of 形状.顶点) {
          总x += 顶点.x;
          总y += 顶点.y;
        }
        const 中心点x = 总x / 形状.顶点.length;
        const 中心点y = 总y / 形状.顶点.length;
        
        形状.中心点 = { x: 中心点x, y: 中心点y };
        
        for (let i = 0; i < 形状.顶点.length; i++) {
          形状.顶点[i] = {
            x: 形状.顶点[i].x - 中心点x,
            y: 形状.顶点[i].y - 中心点y,
          };
        }
      }
    }
  }

  添加事件侦听器() {
    this.重置按钮.addEventListener("click", this.重置.bind(this));
    
    this.形状单选框.forEach((单选框) => {
      单选框.addEventListener("change", () => {
        if (单选框.checked) {
          this.清空画布();
          this.绘制全部();
          this.保存形状选择状态();
        }
      });
    });
    
    window.addEventListener("scroll", this.刷新边界矩形.bind(this));
    window.addEventListener("resize", this.处理窗口尺寸变化.bind(this));
    window.addEventListener("keydown", (e) => {
      e.preventDefault();
      if (e.key === " ") {
        this.空格已按下 = true;
        if (this.鼠标已按下) {
          this.拖拽画布 = true;
          this.canvas.style.cursor = this.鼠标样式.拖拽;
        }
        return;
      }

      if (e.key === "Control") {
        this.Ctrl已按下 = true;
        if (this.鼠标已按下) {
          this.旋转画布中 = true;
          this.canvas.style.cursor = this.鼠标样式.旋转;
        }
        return;
      }
    });
    window.addEventListener("keyup", (e) => {
      e.preventDefault();
      this.鼠标按下坐标.x = null;
      this.鼠标按下坐标.y = null;
      this.canvas.style.cursor = this.鼠标样式.默认;
      if (e.key === " ") {
        this.空格已按下 = false;
        const 之前拖拽 = this.拖拽画布;
        this.拖拽画布 = false;
        if (之前拖拽) {
          this.拖拽前形状中心点Canvas坐标 = [];
          this.清空画布();
          this.绘制全部();
        }
        return;
      }

      if (e.key === "Control") {
        this.Ctrl已按下 = false;
        this.旋转画布中 = false;
        return;
      }
    });
    window.addEventListener("mousemove", (e) => {
      this.鼠标坐标 = this.获取鼠标坐标(e);
      if (this.拖拽画布) {
        this.移动画布();
        return;
      }

      if (this.旋转画布中) {
        this.旋转画布();
        return;
      }
      
      if (this.当前拖拽形状索引 >= 0) {
        this.处理图形拖拽();
        return;
      }
      
      this.检测图形悬停();
    });
    window.addEventListener("mousedown", (e) => {
      this.鼠标已按下 = true;
      this.鼠标按下坐标 = this.获取鼠标坐标(e);
      
      if (this.空格已按下) {
        this.拖拽画布 = true;
        this.canvas.style.cursor = this.鼠标样式.拖拽;
        this.拖拽偏移.x = this.鼠标坐标.x - this.原点.x;
        this.拖拽偏移.y = this.鼠标坐标.y - this.原点.y;
        this.记录拖拽前形状中心点();
        return;
      }
      
      if (this.Ctrl已按下) {
        this.旋转画布中 = true;
        this.canvas.style.cursor = this.鼠标样式.旋转;
        const dx = this.鼠标按下坐标.x - this.原点.x;
        const dy = this.鼠标按下坐标.y - this.原点.y;
        this.初始旋转弧度 = Math.atan2(dy, dx) - this.旋转弧度;
        return;
      }
      
      if (this.当前悬停形状索引 >= 0) {
        const 形状 = this.形状数组[this.当前悬停形状索引];
        this.当前拖拽形状索引 = this.当前悬停形状索引;
        形状.拖拽中 = true;
        const 鼠标在原点坐标系 = this.转换到原点坐标系(this.鼠标坐标);
        this.拖拽形状偏移.x = 鼠标在原点坐标系.x - 形状.中心点.x;
        this.拖拽形状偏移.y = 鼠标在原点坐标系.y - 形状.中心点.y;
        this.canvas.style.cursor = this.鼠标样式.拖拽中;
      }
    });
    window.addEventListener("mouseup", (e) => {
      this.鼠标已按下 = false;
      const 之前拖拽 = this.拖拽画布;
      const 之前旋转 = this.旋转画布中;
      this.拖拽画布 = false;
      this.旋转画布中 = false;
      this.鼠标按下坐标.x = null;
      this.鼠标按下坐标.y = null;
      this.拖拽偏移.x = null;
      this.拖拽偏移.y = null;
      if (之前拖拽) {
        this.拖拽前形状中心点Canvas坐标 = [];
        this.清空画布();
        this.绘制全部();
      }
      
      if (this.当前拖拽形状索引 >= 0) {
        this.形状数组[this.当前拖拽形状索引].拖拽中 = false;
        this.当前拖拽形状索引 = -1;
        this.拖拽形状偏移.x = null;
        this.拖拽形状偏移.y = null;
        // 保存图形拖拽后的状态
        this.保存形状状态();
      }
      
      this.canvas.style.cursor = this.鼠标样式.默认;
      if (之前拖拽 || 之前旋转) {
        this.保存状态();
      }
    });
  }

  移动画布() {
    this.原点.x = this.鼠标坐标.x - this.拖拽偏移.x;
    this.原点.y = this.鼠标坐标.y - this.拖拽偏移.y;
    this.清空画布();
    this.绘制全部();
    this.绘制拖拽前形状中心点十字();
    this.保存状态();
    this.保存形状状态();
  }
  
  记录拖拽前形状中心点() {
    this.拖拽前形状中心点Canvas坐标 = [];
    const 选中类型 = this.获取当前选中形状类型();
    
    for (const 形状 of this.形状数组) {
      if (形状.类型 === 选中类型) {
        const Canvas坐标 = this.转换到Canvas坐标系(形状.中心点);
        this.拖拽前形状中心点Canvas坐标.push(Canvas坐标);
      }
    }
  }
  
  转换到Canvas坐标系(原点坐标系点) {
    const cos = Math.cos(this.旋转弧度);
    const sin = Math.sin(this.旋转弧度);
    const 旋转后x = 原点坐标系点.x * cos - 原点坐标系点.y * sin;
    const 旋转后y = 原点坐标系点.x * sin + 原点坐标系点.y * cos;
    return {
      x: 旋转后x + this.原点.x,
      y: 旋转后y + this.原点.y,
    };
  }
  
  绘制拖拽前形状中心点十字() {
    if (this.拖拽前形状中心点Canvas坐标.length === 0) return;
    
    this.ctx.save();
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    
    this.ctx.strokeStyle = "#d6a";
    this.ctx.lineWidth = 1.5;
    const 十字长度 = 10;
    
    for (const 中心点 of this.拖拽前形状中心点Canvas坐标) {
      this.ctx.beginPath();
      this.ctx.moveTo(中心点.x - 十字长度, 中心点.y);
      this.ctx.lineTo(中心点.x + 十字长度, 中心点.y);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(中心点.x, 中心点.y - 十字长度);
      this.ctx.lineTo(中心点.x, 中心点.y + 十字长度);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  旋转画布() {
    const dx = this.鼠标坐标.x - this.原点.x;
    const dy = this.鼠标坐标.y - this.原点.y;
    const 当前角度 = Math.atan2(dy, dx);

    this.旋转弧度 = 当前角度 - this.初始旋转弧度;

    this.清空画布();
    this.绘制全部();
    this.保存状态();
    this.保存形状状态();
  }

  绘制经纬线() {
    this.ctx.save();
    this.ctx.strokeStyle = "#ffffff18";
    this.ctx.lineWidth = 1;
    const 刻度间距 = 25;

    const 角点 = [
      { x: 0, y: 0 },
      { x: this.宽, y: 0 },
      { x: 0, y: this.高 },
      { x: this.宽, y: this.高 },
    ];

    const cos = Math.cos(-this.旋转弧度);
    const sin = Math.sin(-this.旋转弧度);
    let 最小x = Infinity;
    let 最大x = -Infinity;
    let 最小y = Infinity;
    let 最大y = -Infinity;

    for (const 角 of 角点) {
      const 原点坐标系x = 角.x - this.原点.x;
      const 原点坐标系y = 角.y - this.原点.y;

      const 旋转后x = 原点坐标系x * cos - 原点坐标系y * sin;
      const 旋转后y = 原点坐标系x * sin + 原点坐标系y * cos;

      最小x = Math.min(最小x, 旋转后x);
      最大x = Math.max(最大x, 旋转后x);
      最小y = Math.min(最小y, 旋转后y);
      最大y = Math.max(最大y, 旋转后y);
    }

    const 扩展量 = 刻度间距 * 2;
    最小x -= 扩展量;
    最大x += 扩展量;
    最小y -= 扩展量;
    最大y += 扩展量;

    const 起始经线索引 = Math.floor(最小x / 刻度间距);
    const 结束经线索引 = Math.ceil(最大x / 刻度间距);
    const 起始纬线索引 = Math.floor(最小y / 刻度间距);
    const 结束纬线索引 = Math.ceil(最大y / 刻度间距);

    for (let i = 起始经线索引; i <= 结束经线索引; i++) {
      const x = i * 刻度间距;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 最小y);
      this.ctx.lineTo(x, 最大y);
      this.ctx.stroke();
    }

    for (let i = 起始纬线索引; i <= 结束纬线索引; i++) {
      const y = i * 刻度间距;
      this.ctx.beginPath();
      this.ctx.moveTo(最小x, y);
      this.ctx.lineTo(最大x, y);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  绘制轴线() {
    this.ctx.save();
    this.ctx.strokeStyle = "#579";
    this.ctx.lineWidth = 2;

    const 对角线长度 = Math.sqrt(this.宽 * this.宽 + this.高 * this.高);

    this.ctx.beginPath();
    this.ctx.moveTo(0, -对角线长度);
    this.ctx.lineTo(0, 对角线长度);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(-对角线长度, 0);
    this.ctx.lineTo(对角线长度, 0);
    this.ctx.stroke();

    this.ctx.restore();
  }

  绘制原点() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 5, 0, 2 * Math.PI);
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.font = "14px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "left";
    const 逗号宽度 = this.ctx.measureText(",").width;
    const x坐标宽度 = this.ctx.measureText(`0`).width;
    const x坐标绘制点 = {
      x: 10,
      y: 10,
    };
    this.ctx.fillStyle = "lightseagreen";
    this.ctx.fillText(`0`, x坐标绘制点.x, x坐标绘制点.y);
    this.ctx.fillStyle = "gray";
    const 逗号绘制点 = {
      x: x坐标绘制点.x + x坐标宽度 + 1,
      y: x坐标绘制点.y,
    };
    this.ctx.fillText(",", 逗号绘制点.x, 逗号绘制点.y);
    const y坐标绘制点 = {
      x: 逗号绘制点.x + 逗号宽度 + 4,
      y: x坐标绘制点.y,
    };
    this.ctx.fillStyle = "lightseagreen";
    this.ctx.fillText(`0`, y坐标绘制点.x, y坐标绘制点.y);
    this.ctx.restore();
  }

  绘制画布旋转弧度() {
    this.ctx.save();
    this.ctx.font = "14px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    this.ctx.textBaseline = "bottom";
    this.ctx.textAlign = "left";
    const 弧度数字绘制坐标 = {
      x: 10,
      y: -10,
    };
    let 标准化弧度 = this.旋转弧度 % (2 * Math.PI);
    if (标准化弧度 < 0) {
      标准化弧度 += 2 * Math.PI;
    }
    const 弧度近似值 = Math.round(标准化弧度 * 100) / 100;
    const 弧度文本 = 弧度近似值.toString();
    const 小数点索引 = 弧度文本.indexOf(".");
    
    let 当前x = 弧度数字绘制坐标.x;
    this.ctx.fillStyle = "#ba8e23";
    
    if (小数点索引 === -1) {
      this.ctx.fillText(弧度文本, 当前x, 弧度数字绘制坐标.y);
    } else {
      const 整数部分 = 弧度文本.slice(0, 小数点索引);
      const 小数部分 = 弧度文本.slice(小数点索引 + 1);
      
      this.ctx.fillText(整数部分, 当前x, 弧度数字绘制坐标.y);
      当前x += this.ctx.measureText(整数部分).width;
      
      this.ctx.fillStyle = "gray";
      this.ctx.fillText(".", 当前x, 弧度数字绘制坐标.y);
      当前x += this.ctx.measureText(".").width;
      
      this.ctx.fillStyle = "#ba8e23";
      this.ctx.fillText(小数部分, 当前x, 弧度数字绘制坐标.y);
    }
    
    this.ctx.restore();
  }

  刷新边界矩形() {
    this.边界矩形 = this.canvas.getBoundingClientRect();
  }
  
  处理窗口尺寸变化() {
    // 重新计算Canvas尺寸（考虑dpr）
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.宽 = this.canvas.offsetWidth;
    this.高 = this.canvas.offsetHeight;
    this.ctx.scale(this.dpr, this.dpr);
    
    // 更新边界矩形
    this.刷新边界矩形();
    
    // 重新绘制所有内容
    this.清空画布();
    this.绘制全部();
  }

  获取鼠标坐标(e) {
    const 鼠标坐标 = {
      x: e.clientX - this.边界矩形.left,
      y: e.clientY - this.边界矩形.top,
    };
    return 鼠标坐标;
  }

  清空画布() {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.宽, this.高);
  }

  绘制全部() {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.translate(this.原点.x, this.原点.y);
    this.ctx.rotate(this.旋转弧度);
    this.绘制经纬线();
    this.绘制轴线();
    this.绘制原点();
    this.绘制画布旋转弧度();
    this.绘制图形();
  }
  
  转换到原点坐标系(Canvas坐标) {
    const 相对x = Canvas坐标.x - this.原点.x;
    const 相对y = Canvas坐标.y - this.原点.y;
    const cos = Math.cos(-this.旋转弧度);
    const sin = Math.sin(-this.旋转弧度);
    return {
      x: 相对x * cos - 相对y * sin,
      y: 相对x * sin + 相对y * cos,
    };
  }
  
  检测图形悬停() {
    const 鼠标在原点坐标系 = this.转换到原点坐标系(this.鼠标坐标);
    let 新的悬停索引 = -1;
    
    for (let i = this.形状数组.length - 1; i >= 0; i--) {
      const 形状 = this.形状数组[i];
      if (this.点在图形内(鼠标在原点坐标系, 形状)) {
        新的悬停索引 = i;
        break;
      }
    }
    
    if (新的悬停索引 !== this.当前悬停形状索引) {
      if (this.当前悬停形状索引 >= 0) {
        this.形状数组[this.当前悬停形状索引].悬停中 = false;
      }
      this.当前悬停形状索引 = 新的悬停索引;
      if (this.当前悬停形状索引 >= 0) {
        this.形状数组[this.当前悬停形状索引].悬停中 = true;
        this.canvas.style.cursor = this.鼠标样式.指向;
      } else {
        this.canvas.style.cursor = this.鼠标样式.默认;
      }
      this.清空画布();
      this.绘制全部();
    }
  }
  
  点在图形内(点, 形状) {
    switch (形状.类型) {
      case "矩形":
        return (
          点.x >= 形状.中心点.x - 形状.宽度 / 2 &&
          点.x <= 形状.中心点.x + 形状.宽度 / 2 &&
          点.y >= 形状.中心点.y - 形状.高度 / 2 &&
          点.y <= 形状.中心点.y + 形状.高度 / 2
        );
      case "椭圆":
        const dx = (点.x - 形状.中心点.x) / 形状.半径x;
        const dy = (点.y - 形状.中心点.y) / 形状.半径y;
        return dx * dx + dy * dy <= 1;
      case "正多边形":
        return this.点在正多边形内(点, 形状);
      case "不规则多边形":
        return this.点在不规则多边形内(点, 形状);
      default:
        return false;
    }
  }
  
  点在正多边形内(点, 形状) {
    const { 中心点, 边数, 半径 } = 形状;
    const 角度步 = (2 * Math.PI) / 边数;
    const dx = 点.x - 中心点.x;
    const dy = 点.y - 中心点.y;
    const 距离 = Math.sqrt(dx * dx + dy * dy);
    if (距离 > 半径) return false;
    
    let 角度 = Math.atan2(dy, dx);
    if (角度 < 0) 角度 += 2 * Math.PI;
    
    let 调整角度 = 角度 + Math.PI / 2;
    if (调整角度 >= 2 * Math.PI) 调整角度 -= 2 * Math.PI;
    
    for (let i = 0; i < 边数; i++) {
      const 当前边起始角度 = i * 角度步 - Math.PI / 2;
      const 当前边结束角度 = (i + 1) * 角度步 - Math.PI / 2;
      const 当前顶点1 = {
        x: 中心点.x + 半径 * Math.cos(当前边起始角度),
        y: 中心点.y + 半径 * Math.sin(当前边起始角度),
      };
      const 当前顶点2 = {
        x: 中心点.x + 半径 * Math.cos(当前边结束角度),
        y: 中心点.y + 半径 * Math.sin(当前边结束角度),
      };
      const v1x = 当前顶点2.x - 当前顶点1.x;
      const v1y = 当前顶点2.y - 当前顶点1.y;
      const v2x = 点.x - 当前顶点1.x;
      const v2y = 点.y - 当前顶点1.y;
      const 叉积 = v1x * v2y - v1y * v2x;
      if (叉积 < 0) return false;
    }
    return true;
  }
  
  点在不规则多边形内(点, 形状) {
    const { 中心点, 顶点 } = 形状;
    let 交点数量 = 0;
    
    for (let i = 0; i < 顶点.length; i++) {
      const 当前顶点 = {
        x: 中心点.x + 顶点[i].x,
        y: 中心点.y + 顶点[i].y,
      };
      const 下一个顶点 = {
        x: 中心点.x + 顶点[(i + 1) % 顶点.length].x,
        y: 中心点.y + 顶点[(i + 1) % 顶点.length].y,
      };
      
      if (
        ((当前顶点.y > 点.y) !== (下一个顶点.y > 点.y)) &&
        (点.x <
          ((下一个顶点.x - 当前顶点.x) * (点.y - 当前顶点.y)) /
            (下一个顶点.y - 当前顶点.y) +
            当前顶点.x)
      ) {
        交点数量++;
      }
    }
    return 交点数量 % 2 === 1;
  }
  
  处理图形拖拽() {
    if (this.当前拖拽形状索引 < 0) return;
    const 形状 = this.形状数组[this.当前拖拽形状索引];
    const 鼠标在原点坐标系 = this.转换到原点坐标系(this.鼠标坐标);
    形状.中心点.x = 鼠标在原点坐标系.x - this.拖拽形状偏移.x;
    形状.中心点.y = 鼠标在原点坐标系.y - this.拖拽形状偏移.y;
    this.清空画布();
    this.绘制全部();
    this.保存形状状态();
  }
  
  获取当前选中形状类型() {
    for (const 单选框 of this.形状单选框) {
      if (单选框.checked) {
        const 映射 = {
          "矩形": "矩形",
          "椭圆": "椭圆",
          "正多边形": "正多边形",
          "不规则": "不规则多边形",
        };
        return 映射[单选框.id] || 单选框.id;
      }
    }
    return "矩形";
  }
  
  绘制图形() {
    const 选中类型 = this.获取当前选中形状类型();
    
    for (let i = 0; i < this.形状数组.length; i++) {
      const 形状 = this.形状数组[i];
      if (形状.类型 === 选中类型) {
        const 样式 = 形状.悬停中 ? this.图形样式.悬停 : this.图形样式.普通;
        this.绘制单个图形(形状, 样式);
      }
    }
  }
  
  绘制单个图形(形状, 样式) {
    this.ctx.save();
    
    this.ctx.fillStyle = 样式.填充色;
    this.ctx.strokeStyle = 样式.描边色;
    this.ctx.lineWidth = 样式.描边宽度;
    
    switch (形状.类型) {
      case "矩形":
        this.绘制矩形(形状);
        break;
      case "椭圆":
        this.绘制椭圆(形状);
        break;
      case "正多边形":
        this.绘制正多边形(形状);
        break;
      case "不规则多边形":
        this.绘制不规则多边形(形状);
        break;
    }
    
    this.绘制中心点十字(形状.中心点, 样式);
    this.ctx.restore();
  }
  
  绘制矩形(形状) {
    const { 中心点, 宽度, 高度 } = 形状;
    this.ctx.fillRect(中心点.x - 宽度 / 2, 中心点.y - 高度 / 2, 宽度, 高度);
    this.ctx.strokeRect(中心点.x - 宽度 / 2, 中心点.y - 高度 / 2, 宽度, 高度);
  }
  
  绘制椭圆(形状) {
    const { 中心点, 半径x, 半径y } = 形状;
    this.ctx.beginPath();
    this.ctx.ellipse(中心点.x, 中心点.y, 半径x, 半径y, 0, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }
  
  绘制正多边形(形状) {
    const { 中心点, 边数, 半径 } = 形状;
    const 角度步 = (2 * Math.PI) / 边数;
    this.ctx.beginPath();
    for (let i = 0; i < 边数; i++) {
      const 角度 = i * 角度步 - Math.PI / 2;
      const x = 中心点.x + 半径 * Math.cos(角度);
      const y = 中心点.y + 半径 * Math.sin(角度);
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }
  
  绘制不规则多边形(形状) {
    const { 中心点, 顶点 } = 形状;
    this.ctx.beginPath();
    for (let i = 0; i < 顶点.length; i++) {
      const x = 中心点.x + 顶点[i].x;
      const y = 中心点.y + 顶点[i].y;
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }
  
  绘制中心点十字(中心点, 样式) {
    this.ctx.strokeStyle = 样式.中心点描边色;
    this.ctx.lineWidth = 样式.中心点描边宽度;
    const 十字长度 = 10;
    
    this.ctx.beginPath();
    this.ctx.moveTo(中心点.x - 十字长度, 中心点.y);
    this.ctx.lineTo(中心点.x + 十字长度, 中心点.y);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(中心点.x, 中心点.y - 十字长度);
    this.ctx.lineTo(中心点.x, 中心点.y + 十字长度);
    this.ctx.stroke();
  }

  重置() {
    this.原点.x = 0;
    this.原点.y = 0;
    this.旋转弧度 = 0;
    this.初始旋转弧度 = 0;
    
    // 先恢复默认形状数组的顶点（对于不规则多边形）
    for (let i = 0; i < this.默认形状数组.length; i++) {
      const 默认形状 = this.默认形状数组[i];
      if (默认形状.类型 === "不规则多边形") {
        // 恢复默认顶点（绝对坐标）
        默认形状.顶点 = [
          { x: 260, y: 270 },
          { x: 350, y: 280 },
          { x: 360, y: 340 },
          { x: 280, y: 350 },
          { x: 250, y: 320 },
        ];
      }
      默认形状.中心点 = null; // 重置中心点，准备生成新的随机位置
    }
    
    // 重新生成随机位置（更新默认形状数组）
    this.生成形状随机位置();
    
    // 恢复所有形状到默认状态（使用新的随机位置）
    this.形状数组 = this.默认形状数组.map(形状 => {
      const 副本 = { ...形状 };
      if (形状.中心点) {
        副本.中心点 = { ...形状.中心点 };
      }
      if (形状.顶点) {
        副本.顶点 = 形状.顶点.map(v => ({ ...v }));
      }
      return 副本;
    });
    
    // 重新计算不规则多边形的中心点
    this.计算不规则多边形中心点();
    
    // 清除悬停和拖拽状态
    this.当前悬停形状索引 = -1;
    this.当前拖拽形状索引 = -1;
    this.拖拽形状偏移.x = null;
    this.拖拽形状偏移.y = null;
    
    this.清空画布();
    this.绘制全部();
    this.保存状态();
    this.保存形状状态();
  }

  读取状态() {
    try {
      const 原点x = localStorage.getItem(this.存储键.原点x);
      if (原点x !== null) {
        const 值 = parseFloat(原点x);
        if (Number.isFinite(值)) {
          this.原点.x = 值;
        }
      }
    } catch (err) {
      console.warn("读取原点x失败", err);
    }

    try {
      const 原点y = localStorage.getItem(this.存储键.原点y);
      if (原点y !== null) {
        const 值 = parseFloat(原点y);
        if (Number.isFinite(值)) {
          this.原点.y = 值;
        }
      }
    } catch (err) {
      console.warn("读取原点y失败", err);
    }

    try {
      const 旋转弧度 = localStorage.getItem(this.存储键.旋转弧度);
      if (旋转弧度 !== null) {
        const 值 = parseFloat(旋转弧度);
        if (Number.isFinite(值)) {
          this.旋转弧度 = 值;
        }
      }
    } catch (err) {
      console.warn("读取旋转弧度失败", err);
    }

    this.读取形状选择状态();
    this.读取形状状态();
  }
  
  读取形状选择状态() {
    try {
      const 选中形状类型 = localStorage.getItem(this.存储键.选中形状类型);
      if (选中形状类型 !== null) {
        const 单选框 = document.getElementById(选中形状类型);
        if (单选框) {
          单选框.checked = true;
        }
      }
    } catch (err) {
      console.warn("读取选中形状类型失败", err);
    }
  }
  
  读取形状状态() {
    try {
      const 形状数组JSON = localStorage.getItem(this.存储键.形状数组);
      if (形状数组JSON !== null) {
        const 保存的形状数组 = JSON.parse(形状数组JSON);
        if (Array.isArray(保存的形状数组) && 保存的形状数组.length === this.形状数组.length) {
          // 优先从localStorage恢复形状状态
          let 成功恢复 = true;
          for (let i = 0; i < this.形状数组.length; i++) {
            const 当前形状 = this.形状数组[i];
            const 保存的形状 = 保存的形状数组[i];
            if (保存的形状 && 保存的形状.类型 === 当前形状.类型) {
              // 恢复中心点
              if (保存的形状.中心点 && typeof 保存的形状.中心点.x === "number" && typeof 保存的形状.中心点.y === "number") {
                // 如果中心点是null，先创建对象
                if (当前形状.中心点 === null || 当前形状.中心点 === undefined) {
                  当前形状.中心点 = { x: 0, y: 0 };
                }
                当前形状.中心点.x = 保存的形状.中心点.x;
                当前形状.中心点.y = 保存的形状.中心点.y;
              } else {
                成功恢复 = false;
                break;
              }
              // 恢复其他参数（根据类型）
              if (当前形状.类型 === "矩形") {
                if (typeof 保存的形状.宽度 === "number") 当前形状.宽度 = 保存的形状.宽度;
                if (typeof 保存的形状.高度 === "number") 当前形状.高度 = 保存的形状.高度;
              } else if (当前形状.类型 === "椭圆") {
                if (typeof 保存的形状.半径x === "number") 当前形状.半径x = 保存的形状.半径x;
                if (typeof 保存的形状.半径y === "number") 当前形状.半径y = 保存的形状.半径y;
              } else if (当前形状.类型 === "正多边形") {
                if (typeof 保存的形状.边数 === "number") 当前形状.边数 = 保存的形状.边数;
                if (typeof 保存的形状.半径 === "number") 当前形状.半径 = 保存的形状.半径;
              } else if (当前形状.类型 === "不规则多边形") {
                if (Array.isArray(保存的形状.顶点)) {
                  // 恢复顶点（相对坐标）
                  当前形状.顶点 = 保存的形状.顶点.map(v => ({
                    x: typeof v.x === "number" ? v.x : 0,
                    y: typeof v.y === "number" ? v.y : 0,
                  }));
                }
              }
            } else {
              成功恢复 = false;
              break;
            }
          }
          
          if (成功恢复) {
            // 成功恢复，不需要重新计算不规则多边形的中心点
            // 因为顶点已经是相对坐标，中心点也已经正确恢复
            return; // 成功恢复，直接返回
          }
        }
      }
      
      // 如果没有保存的状态或恢复失败，生成随机位置
      this.生成形状随机位置();
      // 更新形状数组的中心点
      for (let i = 0; i < this.形状数组.length; i++) {
        if (this.默认形状数组[i].中心点) {
          this.形状数组[i].中心点 = { ...this.默认形状数组[i].中心点 };
        }
      }
      this.计算不规则多边形中心点();
    } catch (err) {
      console.warn("读取形状状态失败", err);
      // 如果读取失败，生成随机位置
      this.生成形状随机位置();
      // 更新形状数组的中心点
      for (let i = 0; i < this.形状数组.length; i++) {
        if (this.默认形状数组[i].中心点) {
          this.形状数组[i].中心点 = { ...this.默认形状数组[i].中心点 };
        }
      }
      this.计算不规则多边形中心点();
    }
  }

  保存状态() {
    try {
      localStorage.setItem(this.存储键.原点x, this.原点.x.toString());
    } catch (err) {
      console.warn("保存原点x失败", err);
    }

    try {
      localStorage.setItem(this.存储键.原点y, this.原点.y.toString());
    } catch (err) {
      console.warn("保存原点y失败", err);
    }

    try {
      localStorage.setItem(this.存储键.旋转弧度, this.旋转弧度.toString());
    } catch (err) {
      console.warn("保存旋转弧度失败", err);
    }
  }
  
  保存形状选择状态() {
    try {
      for (const 单选框 of this.形状单选框) {
        if (单选框.checked) {
          localStorage.setItem(this.存储键.选中形状类型, 单选框.id);
          break;
        }
      }
    } catch (err) {
      console.warn("保存选中形状类型失败", err);
    }
  }
  
  保存形状状态() {
    try {
      // 只保存形状的基本参数，不保存临时状态（如悬停中、拖拽中）
      const 保存的形状数组 = this.形状数组.map(形状 => {
        const 保存的形状 = {
          类型: 形状.类型,
          中心点: { x: 形状.中心点.x, y: 形状.中心点.y },
        };
        
        if (形状.类型 === "矩形") {
          保存的形状.宽度 = 形状.宽度;
          保存的形状.高度 = 形状.高度;
        } else if (形状.类型 === "椭圆") {
          保存的形状.半径x = 形状.半径x;
          保存的形状.半径y = 形状.半径y;
        } else if (形状.类型 === "正多边形") {
          保存的形状.边数 = 形状.边数;
          保存的形状.半径 = 形状.半径;
        } else if (形状.类型 === "不规则多边形") {
          // 保存顶点（相对坐标）
          保存的形状.顶点 = 形状.顶点.map(v => ({ x: v.x, y: v.y }));
        }
        
        return 保存的形状;
      });
      
      localStorage.setItem(this.存储键.形状数组, JSON.stringify(保存的形状数组));
    } catch (err) {
      console.warn("保存形状状态失败", err);
    }
  }
}

new Canvas旋转演示器();
