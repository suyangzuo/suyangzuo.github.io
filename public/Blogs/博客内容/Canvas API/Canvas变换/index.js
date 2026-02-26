const dpr = window.devicePixelRatio || 1;
const fontFamily = "'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
const 图像源 = "/Blogs/博客内容/Canvas API/Canvas变换/Images/希里.webp";

class Canvas线性变换 {
  constructor(CanvasId) {
    this.canvas = document.getElementById(CanvasId);
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.canvas.offsetWidth * dpr;
    this.canvas.height = this.canvas.offsetHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.画布宽度 = this.canvas.offsetWidth;
    this.画布高度 = this.canvas.offsetHeight;
    this.网格间距 = 40;

    this.原点X = this.画布宽度 / 2;
    this.原点Y = this.画布高度 / 2;
    this.n = 0;
    this.x = 0;

    this.滑块配置 = {
      左边距: 10,
      顶边距: this.画布高度 - 60,
      宽度: 200,
      高度: 20,
      间距: 30,
      数值宽度: 80,
    };

    this.拖拽偏移 = { x: 0, y: 0 };
    this.鼠标坐标 = { x: 0, y: 0 };

    this.重置按钮 = {
      x: this.画布宽度 - 60,
      y: 10,
      width: 50,
      height: 24,
      悬停: false,
    };

    this.动画状态 = {
      正在重置: false,
      开始时间: 0,
      持续时间: 500,
      起始值: { n: 0, x: 0 },
    };

    this.滑块状态 = {
      n: {
        当前值: 0,
        最小值: -10,
        最大值: 10,
        拖动中: false,
        悬停: false,
      },
      x: {
        当前值: 0,
        最小值: 0,
        最大值: 400,
        拖动中: false,
        悬停: false,
      },
    };

    this.绑定事件();
    this.绘制();
  }

  绑定事件() {
    this.canvas.addEventListener("mousedown", (e) => this.鼠标按下(e));
    this.canvas.addEventListener("mousemove", (e) => this.鼠标移动(e));
    this.canvas.addEventListener("mouseup", () => this.鼠标释放());
    this.canvas.addEventListener("mouseleave", () => this.鼠标释放());
  }

  鼠标按下(e) {
    const 坐标 = this.获取鼠标坐标(e);

    if (this.检查鼠标在重置按钮上(坐标)) {
      this.重置();
      return;
    }

    const n滑块区域 = this.计算滑块区域("n");
    if (this.检查鼠标在Thumb上(坐标, n滑块区域)) {
      this.滑块状态.n.拖动中 = true;
      this.拖拽偏移.x = 坐标.x - n滑块区域.thumb.x;
      return;
    } else if (this.检查鼠标在轨道上(坐标, n滑块区域)) {
      let thumbX = 坐标.x - 6;
      thumbX = Math.max(n滑块区域.track.x, Math.min(n滑块区域.track.x + n滑块区域.track.width - 12, thumbX));
      this.更新滑块值("n", thumbX);
      this.滑块状态.n.拖动中 = true;
      this.拖拽偏移.x = 6;
      return;
    }

    const x滑块区域 = this.计算滑块区域("x");
    if (this.检查鼠标在Thumb上(坐标, x滑块区域)) {
      this.滑块状态.x.拖动中 = true;
      this.拖拽偏移.x = 坐标.x - x滑块区域.thumb.x;
      return;
    } else if (this.检查鼠标在轨道上(坐标, x滑块区域)) {
      let thumbX = 坐标.x - 6;
      thumbX = Math.max(x滑块区域.track.x, Math.min(x滑块区域.track.x + x滑块区域.track.width - 12, thumbX));
      this.更新滑块值("x", thumbX);
      this.滑块状态.x.拖动中 = true;
      this.拖拽偏移.x = 6;
      return;
    }
  }

  鼠标移动(e) {
    const 坐标 = this.获取鼠标坐标(e);
    this.鼠标坐标 = 坐标;

    if (this.滑块状态.n.拖动中) {
      const n滑块区域 = this.计算滑块区域("n");
      let newX = 坐标.x - this.拖拽偏移.x;
      newX = Math.max(n滑块区域.track.x, Math.min(n滑块区域.track.x + n滑块区域.track.width - 12, newX));
      this.更新滑块值("n", newX);
    } else if (this.滑块状态.x.拖动中) {
      const x滑块区域 = this.计算滑块区域("x");
      let newX = 坐标.x - this.拖拽偏移.x;
      newX = Math.max(x滑块区域.track.x, Math.min(x滑块区域.track.x + x滑块区域.track.width - 12, newX));
      this.更新滑块值("x", newX);
    } else {
      const n滑块区域 = this.计算滑块区域("n");
      const 新n悬停状态 = this.检查鼠标在Thumb上(坐标, n滑块区域) || this.检查鼠标在轨道上(坐标, n滑块区域);

      const x滑块区域 = this.计算滑块区域("x");
      const 新x悬停状态 = this.检查鼠标在Thumb上(坐标, x滑块区域) || this.检查鼠标在轨道上(坐标, x滑块区域);

      const 新重置按钮悬停状态 = this.检查鼠标在重置按钮上(坐标);

      if (
        this.滑块状态.n.悬停 !== 新n悬停状态 ||
        this.滑块状态.x.悬停 !== 新x悬停状态 ||
        this.重置按钮.悬停 !== 新重置按钮悬停状态
      ) {
        this.滑块状态.n.悬停 = 新n悬停状态;
        this.滑块状态.x.悬停 = 新x悬停状态;
        this.重置按钮.悬停 = 新重置按钮悬停状态;
        this.绘制();
      }
    }
  }

  鼠标释放() {
    this.滑块状态.n.拖动中 = false;
    this.滑块状态.x.拖动中 = false;
  }

  获取鼠标坐标(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  计算滑块区域(type) {
    const { 左边距, 顶边距, 宽度, 高度, 间距 } = this.滑块配置;
    const y = 顶边距 + (type === "x" ? 间距 : 0);

    const 滑块 = this.滑块状态[type];
    const 比例 = (滑块.当前值 - 滑块.最小值) / (滑块.最大值 - 滑块.最小值);

    let thumbX = 左边距 + 70 + 比例 * (宽度 - 12);

    return {
      track: {
        x: 左边距 + 70,
        y: y - 6,
        width: 宽度,
        height: 高度,
      },
      thumb: {
        x: thumbX,
        y: y - 6,
        width: 12,
        height: 高度,
      },
      label: {
        x: 左边距,
        y: y + 5,
      },
      value: {
        x: 左边距 + 80 + 宽度,
        y: y + 5,
      },
    };
  }

  检查鼠标在Thumb上(坐标, 滑块区域) {
    const { thumb } = 滑块区域;
    return (
      坐标.x >= thumb.x && 坐标.x <= thumb.x + thumb.width && 坐标.y >= thumb.y && 坐标.y <= thumb.y + thumb.height
    );
  }

  检查鼠标在轨道上(坐标, 滑块区域) {
    const { track } = 滑块区域;
    return (
      坐标.x >= track.x && 坐标.x <= track.x + track.width && 坐标.y >= track.y && 坐标.y <= track.y + track.height
    );
  }

  检查鼠标在重置按钮上(坐标) {
    const 按钮 = this.重置按钮;
    return 坐标.x >= 按钮.x && 坐标.x <= 按钮.x + 按钮.width && 坐标.y >= 按钮.y && 坐标.y <= 按钮.y + 按钮.height;
  }

  重置() {
    if (this.动画状态.正在重置) {
      return;
    }

    this.动画状态.正在重置 = true;
    this.动画状态.开始时间 = performance.now();
    this.初始化重置起始值();
    this.动画循环();
  }

  缓动函数(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  动画循环() {
    if (!this.动画状态.正在重置) {
      return;
    }

    const 当前时间 = performance.now();
    const 经过时间 = 当前时间 - this.动画状态.开始时间;
    const 进度 = Math.min(经过时间 / this.动画状态.持续时间, 1);
    const 缓动进度 = this.缓动函数(进度);

    this.更新动画值(缓动进度);
    this.绘制();

    if (进度 < 1) {
      requestAnimationFrame(() => this.动画循环());
    } else {
      this.动画状态.正在重置 = false;
    }
  }

  更新滑块值(type, thumbX) {
    const 滑块区域 = this.计算滑块区域(type);
    const 比例 = (thumbX - 滑块区域.track.x) / (滑块区域.track.width - 12);
    const 滑块 = this.滑块状态[type];
    滑块.当前值 = this.格式化滑块值(type, 滑块.最小值 + 比例 * (滑块.最大值 - 滑块.最小值));
    this.应用滑块值(type, 滑块.当前值);
    this.绘制();
  }

  绘制单个滑块(type, label) {
    const ctx = this.ctx;
    const 滑块区域 = this.计算滑块区域(type);
    const 滑块 = this.滑块状态[type];
    const 比例 = (滑块.当前值 - 滑块.最小值) / (滑块.最大值 - 滑块.最小值);

    // 绘制滑块标题，右对齐，中文和字母不同颜色
    ctx.font = `14px ${fontFamily}`;
    ctx.textBaseline = "middle";
    
    // 分离中文和字母
    const 中文匹配 = label.match(/[\u4e00-\u9fa5]+/);
    const 字母匹配 = label.match(/[a-zA-Z]+/);
    const 中文部分 = 中文匹配 ? 中文匹配[0] : "";
    const 字母部分 = 字母匹配 ? 字母匹配[0] : "";
    
    // 调整标题X，减少文本和滑块之间的距离
    const 标题X = 滑块区域.track.x - 5;
    
    // 计算整体宽度
    const 整体宽度 = ctx.measureText(中文部分 + 字母部分).width;
    
    // 中文在前（左边），字母在后（右边），整体右对齐
    ctx.textAlign = "left";
    
    // 计算起始位置，使整体右对齐到标题X
    const 起始位置 = 标题X - 整体宽度 - 4;
    
    // 绘制中文部分
    if (中文部分) {
      ctx.fillStyle = "#61afef";
      ctx.fillText(中文部分, 起始位置 - 2, 滑块区域.label.y);
    }
    
    // 绘制字母部分
    if (字母部分) {
      const 中文宽度 = ctx.measureText(中文部分).width;
      ctx.fillStyle = "#e5c07b";
      ctx.fillText(字母部分, 起始位置 + 中文宽度, 滑块区域.label.y);
    }

    ctx.fillStyle = "#444";
    ctx.fillRect(滑块区域.track.x, 滑块区域.track.y, 滑块区域.track.width, 滑块区域.track.height);

    ctx.fillStyle = "#4e81cdff";
    ctx.fillRect(滑块区域.track.x, 滑块区域.track.y, 比例 * 滑块区域.track.width, 滑块区域.track.height);

    if (滑块.拖动中 || 滑块.悬停) {
      ctx.fillStyle = "gold";
    } else {
      ctx.fillStyle = "transparent";
    }
    ctx.fillRect(滑块区域.thumb.x, 滑块区域.thumb.y, 滑块区域.thumb.width, 滑块区域.thumb.height);

    const 值文本 = this.格式化滑块值文本(滑块.当前值);
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    let 当前X = 滑块区域.value.x;
    for (let i = 0; i < 值文本.length; i++) {
      const 字符 = 值文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "lightskyblue";
      } else {
        ctx.fillStyle = "#ffffff";
      }
      ctx.fillText(字符, 当前X, 滑块区域.value.y);
      当前X += ctx.measureText(字符).width;
    }
  }

  绘制重置按钮() {
    const ctx = this.ctx;
    const 按钮 = this.重置按钮;

    if (按钮.悬停) {
      ctx.fillStyle = "#4e81cdff";
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
    } else {
      ctx.fillStyle = "#305286ff";
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
    }
    ctx.fillRect(按钮.x, 按钮.y, 按钮.width, 按钮.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = `12px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("重置", 按钮.x + 按钮.width / 2, 按钮.y + 按钮.height / 2 + 1);
  }

  格式化滑块值(type, 值) {
    if (type === "n") {
      // 最多显示到小数点后1位
      return Math.round(值 * 10) / 10;
    } else if (type === "x") {
      // 始终为整数
      return Math.round(值);
    }
    return 值;
  }

  格式化滑块值文本(值) {
    // 检测值的类型，判断是n还是x
    // 根据值的特性判断：n通常有小数点，x是整数
    if (Number.isInteger(值)) {
      // x值，始终为整数
      return 值.toString();
    } else {
      // n值，最多显示到小数点后1位
      return Number(值).toFixed(1).replace(/\.?0+$/, '');
    }
  }

  应用滑块值(type, 值) {
    if (type === "n") {
      this.n = 值;
    } else if (type === "x") {
      this.x = 值;
    }
  }

  初始化重置起始值() {
    this.动画状态.起始值 = {
      n: this.n,
      x: this.x,
    };
  }

  更新动画值(缓动进度) {
    this.n = this.动画状态.起始值.n * (1 - 缓动进度);
    // 确保x值始终为整数
    this.x = Math.round(this.动画状态.起始值.x * (1 - 缓动进度));
    this.滑块状态.n.当前值 = this.n;
    this.滑块状态.x.当前值 = this.x;
  }

  绘制经纬线() {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);

    ctx.strokeStyle = "#ffffff0c";
    ctx.lineWidth = 1;

    const 绘制范围 = 800;

    // 水平线
    for (let y = -绘制范围; y <= 绘制范围; y += this.网格间距) {
      ctx.beginPath();
      ctx.moveTo(-绘制范围, y);
      ctx.lineTo(绘制范围, y);
      ctx.stroke();
    }

    // 垂直线
    ctx.strokeStyle = "#ffffff0c";
    for (let x = -绘制范围; x <= 绘制范围; x += this.网格间距) {
      ctx.beginPath();
      ctx.moveTo(x, -绘制范围);
      ctx.lineTo(x, 绘制范围);
      ctx.stroke();
    }

    ctx.restore();
  }

  绘制轴线() {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);

    // 绘制x轴线
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-this.画布宽度 / 2, 0);
    ctx.lineTo(this.画布宽度 / 2, 0);
    ctx.stroke();

    // 绘制y轴线
    ctx.beginPath();
    ctx.moveTo(0, -this.画布高度 / 2);
    ctx.lineTo(0, this.画布高度 / 2);
    ctx.stroke();

    // 在x轴线右端绘制"x轴"文本
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    
    // 中文部分
    ctx.fillStyle = "#61afef";
    ctx.fillText("轴", this.canvas.offsetWidth / 2 - 10, 10);
    
    // 字母部分
    ctx.fillStyle = "#e5c07b";
    ctx.fillText("x", this.canvas.offsetWidth / 2 - 26, 10);

    // 在y轴线上端绘制"y轴"文本
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    
    // 中文部分
    ctx.fillStyle = "#61afef";
    ctx.fillText("轴", 30, -this.canvas.offsetHeight / 2 + 10);
    
    // 字母部分
    ctx.fillStyle = "#e5c07b";
    ctx.fillText("y", 16, -this.canvas.offsetHeight / 2 + 10);

    ctx.restore();
  }

  绘制原点() {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);

    const 文本区域 = {
      x: -12,
      y: -20,
      width: 60,
      height: 40,
    };

    ctx.fillStyle = "#000a";
    ctx.beginPath();
    ctx.roundRect(文本区域.x, 文本区域.y, 文本区域.width, 文本区域.height, 4);
    ctx.fill();

    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6cb3edff";
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("原点", 10, -5);

    ctx.font = `12px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const 坐标文本X = 12;
    const 坐标文本Y = 5;

    ctx.fillStyle = "#ccc";
    ctx.fillText("0", 坐标文本X, 坐标文本Y);
    ctx.fillStyle = "gray";
    ctx.fillText(",", 坐标文本X + 8, 坐标文本Y);
    ctx.fillStyle = "#ccc";
    ctx.fillText("0", 坐标文本X + 18, 坐标文本Y);

    ctx.restore();
  }

  绘制公式() {
    const ctx = this.ctx;
    ctx.save();

    const x = 60;
    const y = this.画布高度 - 125;

    ctx.font = `14px ${fontFamily}`;
    ctx.textBaseline = "top";

    // 计算各部分宽度
    ctx.textAlign = "right";
    const y宽度 = ctx.measureText("-4000").width;
    // 增加x宽度，使用更长的字符串来测量
    const x宽度 = ctx.measureText("600").width;
    const n宽度 = ctx.measureText("-10").width;
    
    // 计算各部分的位置
    const y标题宽度 = ctx.measureText("y").width;
    const 等号宽度 = ctx.measureText(" = ").width;
    const 乘号宽度 = ctx.measureText(" * ").width;
    
    // 计算关键位置
    const y位置 = x;
    const 等号位置 = y位置 + y标题宽度;
    const x起始位置 = 等号位置 + 等号宽度;
    const x中心位置 = x起始位置 + x宽度 / 2;
    const 乘号位置 = x起始位置 + x宽度;
    const n起始位置 = 乘号位置 + 乘号宽度;
    const n中心位置 = n起始位置 + n宽度 / 2;

    // 绘制标题
    ctx.textAlign = "left";
    
    // 绘制"y"
    ctx.fillStyle = "#61afef";
    ctx.fillText("y", y位置, y);
    
    // 绘制" = "
    ctx.fillStyle = "#98c379";
    ctx.fillText(" = ", 等号位置, y);
    
    // 绘制"x"，处于下方"x的值"的水平居中位
    ctx.textAlign = "center";
    ctx.fillStyle = "#61afef";
    ctx.fillText("x", x中心位置, y);
    
    // 绘制" * "，要与下方值运算里面的"*"水平对齐
    ctx.textAlign = "left";
    ctx.fillStyle = "#98c379";
    ctx.fillText(" * ", 乘号位置, y);
    
    // 绘制"n"，处于下方"n的值"的水平居中位
    ctx.textAlign = "center";
    ctx.fillStyle = "#61afef";
    ctx.fillText("n", n中心位置, y);

    // 计算y值
    const y值 = this.x * this.n;

    // 绘制值
    
    // 下方的得数(y的值)用右对齐，与标题中的"y"右对齐
    ctx.textAlign = "right";
    
    // y值格式化，根据n的精度计算
    const y值文本 = Number(y值).toFixed(1).replace(/\.?0+$/, '');
    const y标题右边缘 = y位置 + y标题宽度;
    
    // 分离负号和数字部分，分别绘制
    if (y值文本.startsWith("-")) {
      // 绘制数字部分
      const 数字部分 = y值文本.substring(1);
      const 数字宽度 = ctx.measureText(数字部分).width;
      ctx.fillStyle = "#e5c07b";
      ctx.fillText(数字部分, y标题右边缘, y + 25);
      
      // 绘制负号，在数字前面
      ctx.fillStyle = "darkgoldenrod";
      ctx.fillText("-", y标题右边缘 - 数字宽度, y + 25);
    } else {
      // 没有负号，直接绘制整个数字
      ctx.fillStyle = "#e5c07b";
      ctx.fillText(y值文本, y标题右边缘, y + 25);
    }

    // 绘制" = "
    ctx.textAlign = "left";
    ctx.fillStyle = "#98c379";
    ctx.fillText(" = ", 等号位置, y + 25);
    
    // 下方的x的值用居中对齐，与标题中的"x"居中对齐
    ctx.textAlign = "center";
    ctx.fillStyle = "#e5c07b";
    // x值始终为整数
    const x值文本 = Math.round(this.x).toString();
    ctx.fillText(x值文本, x中心位置, y + 25);
    
    // 绘制" * "，与标题中的"*"水平对齐
    ctx.textAlign = "left";
    ctx.fillStyle = "#98c379";
    ctx.fillText(" * ", 乘号位置, y + 25);
    
    // 下方的"n的值"用居中对齐，与标题中的"n"居中对齐
    // n值最多显示到小数点后1位
    const n值文本 = Number(this.n).toFixed(1).replace(/\.?0+$/, '');
    
    // 分离负号和数字部分，分别绘制
    if (n值文本.startsWith("-")) {
      // 切换到左对齐，以便更精确地控制位置
      ctx.textAlign = "left";
      
      // 计算n值的总宽度
      const 负号宽度 = ctx.measureText("-").width;
      const 数字部分 = n值文本.substring(1);
      const 数字宽度 = ctx.measureText(数字部分).width;
      const n值总宽度 = 负号宽度 + 数字宽度;
      
      // 计算n值左边缘位置，使整个n值文本居中
      const n值左边缘 = n中心位置 - n值总宽度 / 2;
      
      // 绘制负号
      ctx.fillStyle = "darkgoldenrod";
      ctx.fillText("-", n值左边缘, y + 25);
      
      // 绘制数字部分
      ctx.fillStyle = "#e5c07b";
      ctx.fillText(数字部分, n值左边缘 + 负号宽度, y + 25);
    } else {
      // 没有负号，直接绘制整个数字
      ctx.textAlign = "center";
      ctx.fillStyle = "#e5c07b";
      ctx.fillText(n值文本, n中心位置, y + 25);
    }

    ctx.restore();
  }

  绘制直线() {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);

    ctx.strokeStyle = "#ff6b6b";
    ctx.lineWidth = 2;

    // 计算直线的起点和终点
    const 起点X = -this.画布宽度 / 2;
    const 起点Y = this.n * 起点X;
    const 终点X = this.画布宽度 / 2;
    const 终点Y = this.n * 终点X;

    ctx.beginPath();
    ctx.moveTo(起点X, 起点Y);
    ctx.lineTo(终点X, 终点Y);
    ctx.stroke();

    ctx.restore();
  }

  绘制滑块() {
    this.绘制单个滑块("n", "系数 n");
    this.绘制单个滑块("x", "参数 x");
  }

  绘制() {
    const ctx = this.ctx;

    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, this.画布宽度, this.画布高度);

    this.绘制经纬线();
    this.绘制轴线();
    this.绘制原点();
    this.绘制直线();
    this.绘制公式();
    this.绘制滑块();
    this.绘制重置按钮();
  }
}

new Canvas线性变换("canvas-线性变换");

class Canvas仿射变换 {
  constructor(CanvasId) {
    this.canvas = document.getElementById(CanvasId);
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.canvas.offsetWidth * dpr;
    this.canvas.height = this.canvas.offsetHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.画布宽度 = this.canvas.offsetWidth;
    this.画布高度 = this.canvas.offsetHeight;
    this.网格间距 = 40;
    
    this.原点X = this.画布宽度 / 2;
    this.原点Y = this.画布高度 / 2;
    this.n = 0;
    this.x = 0;
    this.平移 = 0;

    this.滑块配置 = {
      左边距: 10,
      顶边距: this.画布高度 - 30,
      宽度: 200,
      高度: 20,
      间距: 30,
      数值宽度: 80,
    };

    this.拖拽偏移 = { x: 0, y: 0 };
    this.鼠标坐标 = { x: 0, y: 0 };

    this.重置按钮 = {
      x: this.画布宽度 - 60,
      y: 10,
      width: 50,
      height: 24,
      悬停: false,
    };

    this.动画状态 = {
      正在重置: false,
      开始时间: 0,
      持续时间: 500,
      起始值: { n: 0, x: 0, 平移: 0 },
    };

    this.滑块状态 = {
      "平移": {
        当前值: 0,
        最小值: -100,
        最大值: 100,
        拖动中: false,
        悬停: false,
      },
      n: {
        当前值: 0,
        最小值: -10,
        最大值: 10,
        拖动中: false,
        悬停: false,
      },
      x: {
        当前值: 0,
        最小值: 0,
        最大值: 400,
        拖动中: false,
        悬停: false,
      },
    };

    this.绑定事件();
    this.绘制();
  }

  绑定事件() {
    this.canvas.addEventListener("mousedown", (e) => this.鼠标按下(e));
    this.canvas.addEventListener("mousemove", (e) => this.鼠标移动(e));
    this.canvas.addEventListener("mouseup", () => this.鼠标释放());
    this.canvas.addEventListener("mouseleave", () => this.鼠标释放());
  }

  鼠标按下(e) {
    const 坐标 = this.获取鼠标坐标(e);

    if (this.检查鼠标在重置按钮上(坐标)) {
      this.重置();
      return;
    }

    const 平移滑块区域 = this.计算滑块区域("平移");
    if (this.检查鼠标在Thumb上(坐标, 平移滑块区域)) {
      this.滑块状态["平移"].拖动中 = true;
      this.拖拽偏移.x = 坐标.x - 平移滑块区域.thumb.x;
      return;
    } else if (this.检查鼠标在轨道上(坐标, 平移滑块区域)) {
      let thumbX = 坐标.x - 6;
      thumbX = Math.max(平移滑块区域.track.x, Math.min(平移滑块区域.track.x + 平移滑块区域.track.width - 12, thumbX));
      this.更新滑块值("平移", thumbX);
      this.滑块状态["平移"].拖动中 = true;
      this.拖拽偏移.x = 6;
      return;
    }

    const n滑块区域 = this.计算滑块区域("n");
    if (this.检查鼠标在Thumb上(坐标, n滑块区域)) {
      this.滑块状态.n.拖动中 = true;
      this.拖拽偏移.x = 坐标.x - n滑块区域.thumb.x;
      return;
    } else if (this.检查鼠标在轨道上(坐标, n滑块区域)) {
      let thumbX = 坐标.x - 6;
      thumbX = Math.max(n滑块区域.track.x, Math.min(n滑块区域.track.x + n滑块区域.track.width - 12, thumbX));
      this.更新滑块值("n", thumbX);
      this.滑块状态.n.拖动中 = true;
      this.拖拽偏移.x = 6;
      return;
    }

    const x滑块区域 = this.计算滑块区域("x");
    if (this.检查鼠标在Thumb上(坐标, x滑块区域)) {
      this.滑块状态.x.拖动中 = true;
      this.拖拽偏移.x = 坐标.x - x滑块区域.thumb.x;
      return;
    } else if (this.检查鼠标在轨道上(坐标, x滑块区域)) {
      let thumbX = 坐标.x - 6;
      thumbX = Math.max(x滑块区域.track.x, Math.min(x滑块区域.track.x + x滑块区域.track.width - 12, thumbX));
      this.更新滑块值("x", thumbX);
      this.滑块状态.x.拖动中 = true;
      this.拖拽偏移.x = 6;
      return;
    }
  }

  鼠标移动(e) {
    const 坐标 = this.获取鼠标坐标(e);
    this.鼠标坐标 = 坐标;

    if (this.滑块状态["平移"].拖动中) {
      const 平移滑块区域 = this.计算滑块区域("平移");
      let newX = 坐标.x - this.拖拽偏移.x;
      newX = Math.max(平移滑块区域.track.x, Math.min(平移滑块区域.track.x + 平移滑块区域.track.width - 12, newX));
      this.更新滑块值("平移", newX);
    } else if (this.滑块状态.n.拖动中) {
      const n滑块区域 = this.计算滑块区域("n");
      let newX = 坐标.x - this.拖拽偏移.x;
      newX = Math.max(n滑块区域.track.x, Math.min(n滑块区域.track.x + n滑块区域.track.width - 12, newX));
      this.更新滑块值("n", newX);
    } else if (this.滑块状态.x.拖动中) {
      const x滑块区域 = this.计算滑块区域("x");
      let newX = 坐标.x - this.拖拽偏移.x;
      newX = Math.max(x滑块区域.track.x, Math.min(x滑块区域.track.x + x滑块区域.track.width - 12, newX));
      this.更新滑块值("x", newX);
    } else {
      const 平移滑块区域 = this.计算滑块区域("平移");
      const 新平移悬停状态 = this.检查鼠标在Thumb上(坐标, 平移滑块区域) || this.检查鼠标在轨道上(坐标, 平移滑块区域);

      const n滑块区域 = this.计算滑块区域("n");
      const 新n悬停状态 = this.检查鼠标在Thumb上(坐标, n滑块区域) || this.检查鼠标在轨道上(坐标, n滑块区域);

      const x滑块区域 = this.计算滑块区域("x");
      const 新x悬停状态 = this.检查鼠标在Thumb上(坐标, x滑块区域) || this.检查鼠标在轨道上(坐标, x滑块区域);

      const 新重置按钮悬停状态 = this.检查鼠标在重置按钮上(坐标);

      if (
        this.滑块状态["平移"].悬停 !== 新平移悬停状态 ||
        this.滑块状态.n.悬停 !== 新n悬停状态 ||
        this.滑块状态.x.悬停 !== 新x悬停状态 ||
        this.重置按钮.悬停 !== 新重置按钮悬停状态
      ) {
        this.滑块状态["平移"].悬停 = 新平移悬停状态;
        this.滑块状态.n.悬停 = 新n悬停状态;
        this.滑块状态.x.悬停 = 新x悬停状态;
        this.重置按钮.悬停 = 新重置按钮悬停状态;
        this.绘制();
      }
    }
  }

  鼠标释放() {
    this.滑块状态["平移"].拖动中 = false;
    this.滑块状态.n.拖动中 = false;
    this.滑块状态.x.拖动中 = false;
  }

  获取鼠标坐标(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  计算滑块区域(type) {
    const { 左边距, 顶边距, 宽度, 高度, 间距 } = this.滑块配置;
    let y;
    switch (type) {
      case "平移":
        y = 顶边距 - 2 * 间距;
        break;
      case "n":
        y = 顶边距 - 1 * 间距;
        break;
      case "x":
        y = 顶边距;
        break;
    }

    const 滑块 = this.滑块状态[type];
    const 比例 = (滑块.当前值 - 滑块.最小值) / (滑块.最大值 - 滑块.最小值);

    let thumbX = 左边距 + 70 + 比例 * (宽度 - 12);

    return {
      track: {
        x: 左边距 + 70,
        y: y - 6,
        width: 宽度,
        height: 高度,
      },
      thumb: {
        x: thumbX,
        y: y - 6,
        width: 12,
        height: 高度,
      },
      label: {
        x: 左边距,
        y: y + 5,
      },
      value: {
        x: 左边距 + 80 + 宽度,
        y: y + 5,
      },
    };
  }

  检查鼠标在Thumb上(坐标, 滑块区域) {
    const { thumb } = 滑块区域;
    return (
      坐标.x >= thumb.x && 坐标.x <= thumb.x + thumb.width && 坐标.y >= thumb.y && 坐标.y <= thumb.y + thumb.height
    );
  }

  检查鼠标在轨道上(坐标, 滑块区域) {
    const { track } = 滑块区域;
    return (
      坐标.x >= track.x && 坐标.x <= track.x + track.width && 坐标.y >= track.y && 坐标.y <= track.y + track.height
    );
  }

  检查鼠标在重置按钮上(坐标) {
    const 按钮 = this.重置按钮;
    return 坐标.x >= 按钮.x && 坐标.x <= 按钮.x + 按钮.width && 坐标.y >= 按钮.y && 坐标.y <= 按钮.y + 按钮.height;
  }

  重置() {
    if (this.动画状态.正在重置) {
      return;
    }

    this.动画状态.正在重置 = true;
    this.动画状态.开始时间 = performance.now();
    this.初始化重置起始值();
    this.动画循环();
  }

  缓动函数(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  动画循环() {
    if (!this.动画状态.正在重置) {
      return;
    }

    const 当前时间 = performance.now();
    const 经过时间 = 当前时间 - this.动画状态.开始时间;
    const 进度 = Math.min(经过时间 / this.动画状态.持续时间, 1);
    const 缓动进度 = this.缓动函数(进度);

    this.更新动画值(缓动进度);
    this.绘制();

    if (进度 < 1) {
      requestAnimationFrame(() => this.动画循环());
    } else {
      this.动画状态.正在重置 = false;
    }
  }

  更新滑块值(type, thumbX) {
    const 滑块区域 = this.计算滑块区域(type);
    const 比例 = (thumbX - 滑块区域.track.x) / (滑块区域.track.width - 12);
    const 滑块 = this.滑块状态[type];
    滑块.当前值 = this.格式化滑块值(type, 滑块.最小值 + 比例 * (滑块.最大值 - 滑块.最小值));
    this.应用滑块值(type, 滑块.当前值);
    this.绘制();
  }

  绘制单个滑块(type, label) {
    const ctx = this.ctx;
    const 滑块区域 = this.计算滑块区域(type);
    const 滑块 = this.滑块状态[type];
    const 比例 = (滑块.当前值 - 滑块.最小值) / (滑块.最大值 - 滑块.最小值);

    // 绘制滑块标题，右对齐，中文和字母不同颜色
    ctx.font = `14px ${fontFamily}`;
    ctx.textBaseline = "middle";
    
    // 分离中文和字母
    const 中文匹配 = label.match(/[\u4e00-\u9fa5]+/);
    const 字母匹配 = label.match(/[a-zA-Z]+/);
    const 中文部分 = 中文匹配 ? 中文匹配[0] : "";
    const 字母部分 = 字母匹配 ? 字母匹配[0] : "";
    
    // 调整标题X，减少文本和滑块之间的距离
    const 标题X = 滑块区域.track.x - 5;
    
    // 计算整体宽度
    const 整体宽度 = ctx.measureText(中文部分 + 字母部分).width;
    
    // 中文在前（左边），字母在后（右边），整体右对齐
    ctx.textAlign = "left";
    
    // 计算起始位置，使整体右对齐到标题X
    const 起始位置 = 标题X - 整体宽度 - 4;
    
    // 绘制中文部分
    if (中文部分) {
      ctx.fillStyle = "#61afef";
      ctx.fillText(中文部分, 起始位置 - 2, 滑块区域.label.y);
    }
    
    // 绘制字母部分
    if (字母部分) {
      const 中文宽度 = ctx.measureText(中文部分).width;
      ctx.fillStyle = "#e5c07b";
      ctx.fillText(字母部分, 起始位置 + 中文宽度, 滑块区域.label.y);
    }

    ctx.fillStyle = "#444";
    ctx.fillRect(滑块区域.track.x, 滑块区域.track.y, 滑块区域.track.width, 滑块区域.track.height);

    ctx.fillStyle = "#4e81cdff";
    ctx.fillRect(滑块区域.track.x, 滑块区域.track.y, 比例 * 滑块区域.track.width, 滑块区域.track.height);

    if (滑块.拖动中 || 滑块.悬停) {
      ctx.fillStyle = "gold";
    } else {
      ctx.fillStyle = "transparent";
    }
    ctx.fillRect(滑块区域.thumb.x, 滑块区域.thumb.y, 滑块区域.thumb.width, 滑块区域.thumb.height);

    const 值文本 = this.格式化滑块值文本(滑块.当前值);
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    let 当前X = 滑块区域.value.x;
    for (let i = 0; i < 值文本.length; i++) {
      const 字符 = 值文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "lightskyblue";
      } else {
        ctx.fillStyle = "#ffffff";
      }
      ctx.fillText(字符, 当前X, 滑块区域.value.y);
      当前X += ctx.measureText(字符).width;
    }
  }

  绘制重置按钮() {
    const ctx = this.ctx;
    const 按钮 = this.重置按钮;

    if (按钮.悬停) {
      ctx.fillStyle = "#4e81cdff";
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
    } else {
      ctx.fillStyle = "#305286ff";
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
    }
    ctx.fillRect(按钮.x, 按钮.y, 按钮.width, 按钮.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = `12px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("重置", 按钮.x + 按钮.width / 2, 按钮.y + 按钮.height / 2 + 1);
  }

  格式化滑块值(type, 值) {
    if (type === "n") {
      // 最多显示到小数点后1位
      return Math.round(值 * 10) / 10;
    } else if (type === "x" || type === "平移") {
      // 始终为整数
      return Math.round(值);
    }
    return 值;
  }

  格式化滑块值文本(值) {
    // 检测值的类型
    if (Number.isInteger(值)) {
      // 整数类型
      return 值.toString();
    } else {
      // 小数类型，最多显示到小数点后1位
      return Number(值).toFixed(1).replace(/\.?0+$/, '');
    }
  }

  应用滑块值(type, 值) {
    if (type === "n") {
      this.n = 值;
    } else if (type === "x") {
      this.x = 值;
    } else if (type === "平移") {
      this.平移 = 值;
    }
  }

  初始化重置起始值() {
    this.动画状态.起始值 = {
      n: this.n,
      x: this.x,
      平移: this.平移,
    };
  }

  更新动画值(缓动进度) {
    this.n = this.动画状态.起始值.n * (1 - 缓动进度);
    // 确保x值始终为整数
    this.x = Math.round(this.动画状态.起始值.x * (1 - 缓动进度));
    this.平移 = Math.round(this.动画状态.起始值.平移 * (1 - 缓动进度));
    this.滑块状态["平移"].当前值 = this.平移;
    this.滑块状态.n.当前值 = this.n;
    this.滑块状态.x.当前值 = this.x;
  }

  绘制经纬线() {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);

    ctx.strokeStyle = "#ffffff0c";
    ctx.lineWidth = 1;

    const 绘制范围 = 800;

    // 水平线
    for (let y = -绘制范围; y <= 绘制范围; y += this.网格间距) {
      ctx.beginPath();
      ctx.moveTo(-绘制范围, y);
      ctx.lineTo(绘制范围, y);
      ctx.stroke();
    }

    // 垂直线
    ctx.strokeStyle = "#ffffff0c";
    for (let x = -绘制范围; x <= 绘制范围; x += this.网格间距) {
      ctx.beginPath();
      ctx.moveTo(x, -绘制范围);
      ctx.lineTo(x, 绘制范围);
      ctx.stroke();
    }

    ctx.restore();
  }

  绘制轴线() {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);

    // 绘制x轴线
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-this.画布宽度 / 2, 0);
    ctx.lineTo(this.画布宽度 / 2, 0);
    ctx.stroke();

    // 绘制y轴线
    ctx.beginPath();
    ctx.moveTo(0, -this.画布高度 / 2);
    ctx.lineTo(0, this.画布高度 / 2);
    ctx.stroke();

    // 在x轴线右端绘制"x轴"文本
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    
    // 中文部分
    ctx.fillStyle = "#61afef";
    ctx.fillText("轴", this.canvas.offsetWidth / 2 - 10, 10);
    
    // 字母部分
    ctx.fillStyle = "#e5c07b";
    ctx.fillText("x", this.canvas.offsetWidth / 2 - 26, 10);

    // 在y轴线上端绘制"y轴"文本
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    
    // 中文部分
    ctx.fillStyle = "#61afef";
    ctx.fillText("轴", 30, -this.canvas.offsetHeight / 2 + 10);
    
    // 字母部分
    ctx.fillStyle = "#e5c07b";
    ctx.fillText("y", 16, -this.canvas.offsetHeight / 2 + 10);

    ctx.restore();
  }

  绘制原点() {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);

    const 文本区域 = {
      x: -12,
      y: -20,
      width: 60,
      height: 40,
    };

    ctx.fillStyle = "#000a";
    ctx.beginPath();
    ctx.roundRect(文本区域.x, 文本区域.y, 文本区域.width, 文本区域.height, 4);
    ctx.fill();

    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6cb3edff";
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("原点", 10, -5);

    ctx.font = `12px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const 坐标文本X = 12;
    const 坐标文本Y = 5;

    ctx.fillStyle = "#ccc";
    ctx.fillText("0", 坐标文本X, 坐标文本Y);
    ctx.fillStyle = "gray";
    ctx.fillText(",", 坐标文本X + 8, 坐标文本Y);
    ctx.fillStyle = "#ccc";
    ctx.fillText("0", 坐标文本X + 18, 坐标文本Y);

    ctx.restore();
  }

  绘制公式() {
    const ctx = this.ctx;
    ctx.save();

    const x = 60;
    const y = this.画布高度 - 155;

    ctx.font = `14px ${fontFamily}`;
    ctx.textBaseline = "top";

    // 计算各部分宽度
    ctx.textAlign = "right";
    const y宽度 = ctx.measureText("-4000").width;
    // 增加x宽度，使用更长的字符串来测量
    const x宽度 = ctx.measureText("600").width;
    const n宽度 = ctx.measureText("-10").width;
    const 平移宽度 = ctx.measureText("-100").width;
    
    // 计算各部分的位置
    const y标题宽度 = ctx.measureText("y").width;
    const 等号宽度 = ctx.measureText(" = ").width;
    const 乘号宽度 = ctx.measureText(" * ").width;
    const 加号宽度 = ctx.measureText(" + ").width;
    
    // 计算关键位置
    const y位置 = x;
    const 等号位置 = y位置 + y标题宽度;
    const x起始位置 = 等号位置 + 等号宽度;
    const x中心位置 = x起始位置 + x宽度 / 2;
    const 乘号位置 = x起始位置 + x宽度;
    const n起始位置 = 乘号位置 + 乘号宽度;
    const n中心位置 = n起始位置 + n宽度 / 2;
    const 加号位置 = n起始位置 + n宽度;
    const 平移起始位置 = 加号位置 + 加号宽度;
    const 平移中心位置 = 平移起始位置 + 平移宽度 / 2;

    // 绘制标题
    ctx.textAlign = "left";
    
    // 绘制"y"
    ctx.fillStyle = "#61afef";
    ctx.fillText("y", y位置, y);
    
    // 绘制" = "
    ctx.fillStyle = "#98c379";
    ctx.fillText(" = ", 等号位置, y);
    
    // 绘制"x"，处于下方"x的值"的水平居中位
    ctx.textAlign = "center";
    ctx.fillStyle = "#61afef";
    ctx.fillText("x", x中心位置, y);
    
    // 绘制" * "，要与下方值运算里面的"*"水平对齐
    ctx.textAlign = "left";
    ctx.fillStyle = "#98c379";
    ctx.fillText(" * ", 乘号位置, y);
    
    // 绘制"n"，处于下方"n的值"的水平居中位
    ctx.textAlign = "center";
    ctx.fillStyle = "#61afef";
    ctx.fillText("n", n中心位置, y);
    
    // 绘制" + "
    ctx.textAlign = "left";
    ctx.fillStyle = "#98c379";
    ctx.fillText(" + ", 加号位置, y);
    
    // 绘制"平移"，处于下方"平移"的水平居中位
    ctx.textAlign = "center";
    ctx.fillStyle = "#61afef";
    ctx.fillText("平移", 平移中心位置, y);

    // 计算y值
    const y值 = this.x * this.n + this.平移;

    // 绘制值
    
    // 下方的得数(y的值)用右对齐，与标题中的"y"右对齐
    ctx.textAlign = "right";
    
    // y值格式化，根据n的精度计算
    const y值文本 = Number(y值).toFixed(1).replace(/\.?0+$/, '');
    const y标题右边缘 = y位置 + y标题宽度;
    
    // 分离负号和数字部分，分别绘制
    if (y值文本.startsWith("-")) {
      // 绘制数字部分
      const 数字部分 = y值文本.substring(1);
      const 数字宽度 = ctx.measureText(数字部分).width;
      ctx.fillStyle = "#e5c07b";
      ctx.fillText(数字部分, y标题右边缘, y + 25);
      
      // 绘制负号，在数字前面
      ctx.fillStyle = "darkgoldenrod";
      ctx.fillText("-", y标题右边缘 - 数字宽度, y + 25);
    } else {
      // 没有负号，直接绘制整个数字
      ctx.fillStyle = "#e5c07b";
      ctx.fillText(y值文本, y标题右边缘, y + 25);
    }

    // 绘制" = "
    ctx.textAlign = "left";
    ctx.fillStyle = "#98c379";
    ctx.fillText(" = ", 等号位置, y + 25);
    
    // 下方的x的值用居中对齐，与标题中的"x"居中对齐
    ctx.textAlign = "center";
    ctx.fillStyle = "#e5c07b";
    // x值始终为整数
    const x值文本 = Math.round(this.x).toString();
    ctx.fillText(x值文本, x中心位置, y + 25);
    
    // 绘制" * "，与标题中的"*"水平对齐
    ctx.textAlign = "left";
    ctx.fillStyle = "#98c379";
    ctx.fillText(" * ", 乘号位置, y + 25);
    
    // 下方的"n的值"用居中对齐，与标题中的"n"居中对齐
    // n值最多显示到小数点后1位
    const n值文本 = Number(this.n).toFixed(1).replace(/\.?0+$/, '');
    
    // 分离负号和数字部分，分别绘制
    if (n值文本.startsWith("-")) {
      // 切换到左对齐，以便更精确地控制位置
      ctx.textAlign = "left";
      
      // 计算n值的总宽度
      const 负号宽度 = ctx.measureText("-").width;
      const 数字部分 = n值文本.substring(1);
      const 数字宽度 = ctx.measureText(数字部分).width;
      const n值总宽度 = 负号宽度 + 数字宽度;
      
      // 计算n值左边缘位置，使整个n值文本居中
      const n值左边缘 = n中心位置 - n值总宽度 / 2;
      
      // 绘制负号
      ctx.fillStyle = "darkgoldenrod";
      ctx.fillText("-", n值左边缘, y + 25);
      
      // 绘制数字部分
      ctx.fillStyle = "#e5c07b";
      ctx.fillText(数字部分, n值左边缘 + 负号宽度, y + 25);
    } else {
      // 没有负号，直接绘制整个数字
      ctx.textAlign = "center";
      ctx.fillStyle = "#e5c07b";
      ctx.fillText(n值文本, n中心位置, y + 25);
    }
    
    // 绘制" + "，与标题中的"+"水平对齐
    ctx.textAlign = "left";
    ctx.fillStyle = "#98c379";
    ctx.fillText(" + ", 加号位置, y + 25);
    
    // 下方的"平移的值"用居中对齐，与标题中的"平移"居中对齐
    // 平移值始终为整数
    const 平移值文本 = Math.round(this.平移).toString();
    
    // 分离负号和数字部分，分别绘制
    if (平移值文本.startsWith("-")) {
      // 切换到左对齐，以便更精确地控制位置
      ctx.textAlign = "left";
      
      // 计算平移值的总宽度
      const 负号宽度 = ctx.measureText("-").width;
      const 数字部分 = 平移值文本.substring(1);
      const 数字宽度 = ctx.measureText(数字部分).width;
      const 平移值总宽度 = 负号宽度 + 数字宽度;
      
      // 计算平移值左边缘位置，使整个平移值文本居中
      const 平移值左边缘 = 平移中心位置 - 平移值总宽度 / 2;
      
      // 绘制负号
      ctx.fillStyle = "darkgoldenrod";
      ctx.fillText("-", 平移值左边缘, y + 25);
      
      // 绘制数字部分
      ctx.fillStyle = "#e5c07b";
      ctx.fillText(数字部分, 平移值左边缘 + 负号宽度, y + 25);
    } else {
      // 没有负号，直接绘制整个数字
      ctx.textAlign = "center";
      ctx.fillStyle = "#e5c07b";
      ctx.fillText(平移值文本, 平移中心位置, y + 25);
    }

    ctx.restore();
  }

  绘制直线() {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);

    ctx.strokeStyle = "#ff6b6b";
    ctx.lineWidth = 2;

    // 计算直线的起点和终点
    const 起点X = -this.画布宽度 / 2;
    const 起点Y = this.n * 起点X + this.平移;
    const 终点X = this.画布宽度 / 2;
    const 终点Y = this.n * 终点X + this.平移;

    ctx.beginPath();
    ctx.moveTo(起点X, 起点Y);
    ctx.lineTo(终点X, 终点Y);
    ctx.stroke();

    ctx.restore();
  }

  绘制滑块() {
    this.绘制单个滑块("平移", "平移");
    this.绘制单个滑块("n", "系数 n");
    this.绘制单个滑块("x", "参数 x");
  }

  绘制() {
    const ctx = this.ctx;

    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, this.画布宽度, this.画布高度);

    this.绘制经纬线();
    this.绘制轴线();
    this.绘制原点();
    this.绘制直线();
    this.绘制公式();
    this.绘制滑块();
    this.绘制重置按钮();
  }
}

new Canvas仿射变换("canvas-仿射变换");
class Canvas变换基类 {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.canvas.offsetWidth * dpr;
    this.canvas.height = this.canvas.offsetHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.画布宽度 = this.canvas.offsetWidth;
    this.画布高度 = this.canvas.offsetHeight;
    this.网格间距 = 40;

    this.图像 = new Image();
    this.图像.src = 图像源;
    this.图像加载完成 = false;
    this.图像.onload = () => {
      this.图像加载完成 = true;
      this.图像宽度 = (this.图像.width / this.图像.height) * 350;
      this.图像高度 = 350;
      this.绘制();
    };

    this.滑块配置 = {
      左边距: 10,
      顶边距: this.画布高度 - 60,
      宽度: 200,
      高度: 20,
      间距: 30,
      数值宽度: 80,
    };

    this.拖拽偏移 = { x: 0, y: 0 };
    this.鼠标坐标 = { x: 0, y: 0 };

    this.重置按钮 = {
      x: this.画布宽度 - 60,
      y: 10,
      width: 50,
      height: 24,
      悬停: false,
    };

    this.动画状态 = {
      正在重置: false,
      开始时间: 0,
      持续时间: 500,
    };

    this.绑定事件();
  }

  绑定事件() {
    this.canvas.addEventListener("mousedown", (e) => this.鼠标按下(e));
    this.canvas.addEventListener("mousemove", (e) => this.鼠标移动(e));
    this.canvas.addEventListener("mouseup", () => this.鼠标释放());
    this.canvas.addEventListener("mouseleave", () => this.鼠标释放());
  }

  鼠标按下(e) {
    const 坐标 = this.获取鼠标坐标(e);

    if (this.检查鼠标在重置按钮上(坐标)) {
      this.重置();
      return;
    }

    const x滑块区域 = this.计算滑块区域("x");
    if (this.检查鼠标在Thumb上(坐标, x滑块区域)) {
      this.滑块状态.x.拖动中 = true;
      this.拖拽偏移.x = 坐标.x - x滑块区域.thumb.x;
      return;
    } else if (this.检查鼠标在轨道上(坐标, x滑块区域)) {
      let thumbX = 坐标.x - 6;
      thumbX = Math.max(x滑块区域.track.x, Math.min(x滑块区域.track.x + x滑块区域.track.width - 12, thumbX));
      this.更新滑块值("x", thumbX);
      this.滑块状态.x.拖动中 = true;
      this.拖拽偏移.x = 6;
      return;
    }

    if (this.滑块状态.y) {
      const y滑块区域 = this.计算滑块区域("y");
      if (this.检查鼠标在Thumb上(坐标, y滑块区域)) {
        this.滑块状态.y.拖动中 = true;
        this.拖拽偏移.y = 坐标.x - y滑块区域.thumb.x;
        return;
      } else if (this.检查鼠标在轨道上(坐标, y滑块区域)) {
        let thumbX = 坐标.x - 6;
        thumbX = Math.max(y滑块区域.track.x, Math.min(y滑块区域.track.x + y滑块区域.track.width - 12, thumbX));
        this.更新滑块值("y", thumbX);
        this.滑块状态.y.拖动中 = true;
        this.拖拽偏移.y = 6;
        return;
      }
    }
  }

  鼠标移动(e) {
    const 坐标 = this.获取鼠标坐标(e);
    this.鼠标坐标 = 坐标;

    if (this.滑块状态.x.拖动中) {
      const x滑块区域 = this.计算滑块区域("x");
      let newX = 坐标.x - this.拖拽偏移.x;
      newX = Math.max(x滑块区域.track.x, Math.min(x滑块区域.track.x + x滑块区域.track.width - 12, newX));
      this.更新滑块值("x", newX);
    } else if (this.滑块状态.y && this.滑块状态.y.拖动中) {
      const y滑块区域 = this.计算滑块区域("y");
      let newX = 坐标.x - this.拖拽偏移.y;
      newX = Math.max(y滑块区域.track.x, Math.min(y滑块区域.track.x + y滑块区域.track.width - 12, newX));
      this.更新滑块值("y", newX);
    } else {
      const x滑块区域 = this.计算滑块区域("x");
      const 新x悬停状态 = this.检查鼠标在Thumb上(坐标, x滑块区域) || this.检查鼠标在轨道上(坐标, x滑块区域);

      let 新y悬停状态 = false;
      if (this.滑块状态.y) {
        const y滑块区域 = this.计算滑块区域("y");
        新y悬停状态 = this.检查鼠标在Thumb上(坐标, y滑块区域) || this.检查鼠标在轨道上(坐标, y滑块区域);
      }

      const 新重置按钮悬停状态 = this.检查鼠标在重置按钮上(坐标);

      if (
        this.滑块状态.x.悬停 !== 新x悬停状态 ||
        (this.滑块状态.y && this.滑块状态.y.悬停 !== 新y悬停状态) ||
        this.重置按钮.悬停 !== 新重置按钮悬停状态
      ) {
        this.滑块状态.x.悬停 = 新x悬停状态;
        if (this.滑块状态.y) {
          this.滑块状态.y.悬停 = 新y悬停状态;
        }
        this.重置按钮.悬停 = 新重置按钮悬停状态;
        this.绘制();
      }
    }
  }

  鼠标释放() {
    this.滑块状态.x.拖动中 = false;
    if (this.滑块状态.y) {
      this.滑块状态.y.拖动中 = false;
    }
  }

  获取鼠标坐标(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  计算滑块区域(type) {
    const { 左边距, 顶边距, 宽度, 高度, 间距 } = this.滑块配置;
    const y = 顶边距 + (type === "y" ? 间距 : 0);

    const 滑块 = this.滑块状态[type];
    const 比例 = (滑块.当前值 - 滑块.最小值) / (滑块.最大值 - 滑块.最小值);

    let thumbX = 左边距 + 70 + 比例 * (宽度 - 12);

    return {
      track: {
        x: 左边距 + 70,
        y: y - 6,
        width: 宽度,
        height: 高度,
      },
      thumb: {
        x: thumbX,
        y: y - 6,
        width: 12,
        height: 高度,
      },
      label: {
        x: 左边距,
        y: y + 5,
      },
      value: {
        x: 左边距 + 80 + 宽度,
        y: y + 5,
      },
    };
  }

  检查鼠标在Thumb上(坐标, 滑块区域) {
    const { thumb } = 滑块区域;
    return (
      坐标.x >= thumb.x && 坐标.x <= thumb.x + thumb.width && 坐标.y >= thumb.y && 坐标.y <= thumb.y + thumb.height
    );
  }

  检查鼠标在轨道上(坐标, 滑块区域) {
    const { track } = 滑块区域;
    return (
      坐标.x >= track.x && 坐标.x <= track.x + track.width && 坐标.y >= track.y && 坐标.y <= track.y + track.height
    );
  }

  检查鼠标在重置按钮上(坐标) {
    const 按钮 = this.重置按钮;
    return 坐标.x >= 按钮.x && 坐标.x <= 按钮.x + 按钮.width && 坐标.y >= 按钮.y && 坐标.y <= 按钮.y + 按钮.height;
  }

  重置() {
    if (this.动画状态.正在重置) {
      return;
    }

    this.动画状态.正在重置 = true;
    this.动画状态.开始时间 = performance.now();
    this.初始化重置起始值();
    this.动画循环();
  }

  缓动函数(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  动画循环() {
    if (!this.动画状态.正在重置) {
      return;
    }

    const 当前时间 = performance.now();
    const 经过时间 = 当前时间 - this.动画状态.开始时间;
    const 进度 = Math.min(经过时间 / this.动画状态.持续时间, 1);
    const 缓动进度 = this.缓动函数(进度);

    this.更新动画值(缓动进度);
    this.绘制();

    if (进度 < 1) {
      requestAnimationFrame(() => this.动画循环());
    } else {
      this.动画状态.正在重置 = false;
    }
  }

  更新滑块值(type, thumbX) {
    const 滑块区域 = this.计算滑块区域(type);
    const 比例 = (thumbX - 滑块区域.track.x) / (滑块区域.track.width - 12);
    const 滑块 = this.滑块状态[type];
    滑块.当前值 = this.格式化滑块值(滑块.最小值 + 比例 * (滑块.最大值 - 滑块.最小值));
    this.应用滑块值(type, 滑块.当前值);
    this.绘制();
  }

  绘制单个滑块(type, label) {
    const ctx = this.ctx;
    const 滑块区域 = this.计算滑块区域(type);
    const 滑块 = this.滑块状态[type];
    const 比例 = (滑块.当前值 - 滑块.最小值) / (滑块.最大值 - 滑块.最小值);

    ctx.fillStyle = "#ffffff";
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 滑块区域.label.x, 滑块区域.label.y);

    ctx.fillStyle = "#444";
    ctx.fillRect(滑块区域.track.x, 滑块区域.track.y, 滑块区域.track.width, 滑块区域.track.height);

    ctx.fillStyle = "#4e81cdff";
    ctx.fillRect(滑块区域.track.x, 滑块区域.track.y, 比例 * 滑块区域.track.width, 滑块区域.track.height);

    if (滑块.拖动中 || 滑块.悬停) {
      ctx.fillStyle = "gold";
    } else {
      ctx.fillStyle = "transparent";
    }
    ctx.fillRect(滑块区域.thumb.x, 滑块区域.thumb.y, 滑块区域.thumb.width, 滑块区域.thumb.height);

    const 值文本 = this.格式化滑块值文本(滑块.当前值);
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    let 当前X = 滑块区域.value.x;
    for (let i = 0; i < 值文本.length; i++) {
      const 字符 = 值文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "lightskyblue";
      } else {
        ctx.fillStyle = "#ffffff";
      }
      ctx.fillText(字符, 当前X, 滑块区域.value.y);
      当前X += ctx.measureText(字符).width;
    }
  }

  绘制重置按钮() {
    const ctx = this.ctx;
    const 按钮 = this.重置按钮;

    if (按钮.悬停) {
      ctx.fillStyle = "#4e81cdff";
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
    } else {
      ctx.fillStyle = "#305286ff";
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
    }
    ctx.fillRect(按钮.x, 按钮.y, 按钮.width, 按钮.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = `12px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("重置", 按钮.x + 按钮.width / 2, 按钮.y + 按钮.height / 2 + 1);
  }

  绘制原点通用(原点X, 原点Y, transformMatrix = null) {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(原点X, 原点Y);

    // 应用变换矩阵（如果提供）
    if (transformMatrix) {
      ctx.transform(...transformMatrix);
    }

    const 文本区域 = {
      x: -12,
      y: -20,
      width: 60,
      height: 40,
    };

    ctx.fillStyle = "#000a";
    ctx.beginPath();
    ctx.roundRect(文本区域.x, 文本区域.y, 文本区域.width, 文本区域.height, 4);
    ctx.fill();

    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6cb3edff";
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("原点", 10, -5);

    ctx.font = `12px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const 坐标文本X = 12;
    const 坐标文本Y = 5;

    ctx.fillStyle = "#ccc";
    ctx.fillText("0", 坐标文本X, 坐标文本Y);
    ctx.fillStyle = "gray";
    ctx.fillText(",", 坐标文本X + 8, 坐标文本Y);
    ctx.fillStyle = "#ccc";
    ctx.fillText("0", 坐标文本X + 18, 坐标文本Y);

    ctx.restore();
  }

  格式化滑块值(值) {
    return 值;
  }

  格式化滑块值文本(值) {
    return 值.toString();
  }

  应用滑块值(type, 值) {}

  初始化重置起始值() {}

  更新动画值(缓动进度) {}

  绘制() {}

  绘制经纬线() {}

  绘制原点() {}

  绘制函数() {}

  绘制图像() {}

  绘制滑块() {}
}

class Canvas平移 extends Canvas变换基类 {
  constructor() {
    super("canvas-translate");
    this.原点X = 0;
    this.原点Y = 0;
    this.平移X = 0;
    this.平移Y = 0;

    this.滑块状态 = {
      x: {
        当前值: 0,
        最小值: -this.画布宽度,
        最大值: this.画布宽度,
        拖动中: false,
        悬停: false,
      },
      y: {
        当前值: 0,
        最小值: -this.画布高度,
        最大值: this.画布高度,
        拖动中: false,
        悬停: false,
      },
    };

    this.动画状态.起始值 = { 平移X: 0, 平移Y: 0, 滑块X: 0, 滑块Y: 0 };

    this.绘制();
  }

  格式化滑块值(值) {
    return Math.round(值);
  }

  格式化滑块值文本(值) {
    return Math.round(值).toString();
  }

  应用滑块值(type, 值) {
    if (type === "x") {
      this.平移X = 值;
    } else {
      this.平移Y = 值;
    }
  }

  初始化重置起始值() {
    this.动画状态.起始值 = {
      平移X: this.平移X,
      平移Y: this.平移Y,
      滑块X: this.滑块状态.x.当前值,
      滑块Y: this.滑块状态.y.当前值,
    };
  }

  更新动画值(缓动进度) {
    this.平移X = this.动画状态.起始值.平移X * (1 - 缓动进度);
    this.平移Y = this.动画状态.起始值.平移Y * (1 - 缓动进度);
    this.滑块状态.x.当前值 = this.动画状态.起始值.滑块X * (1 - 缓动进度);
    this.滑块状态.y.当前值 = this.动画状态.起始值.滑块Y * (1 - 缓动进度);
  }

  绘制经纬线() {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.平移X, this.平移Y);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;

    const 绘制范围 = 800;

    const 起始Y = -绘制范围;
    const 结束Y = 绘制范围 * 2;

    for (let y = 起始Y; y <= 结束Y; y += this.网格间距) {
      ctx.beginPath();
      ctx.moveTo(-绘制范围, y);
      ctx.lineTo(绘制范围 * 2, y);
      ctx.stroke();
    }

    const 起始X = -绘制范围;
    const 结束X = 绘制范围 * 2;

    for (let x = 起始X; x <= 结束X; x += this.网格间距) {
      ctx.beginPath();
      ctx.moveTo(x, -绘制范围);
      ctx.lineTo(x, 绘制范围 * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  绘制原点() {
    this.绘制原点通用(this.原点X + this.平移X, this.原点Y + this.平移Y);
  }

  绘制滑块() {
    this.绘制单个滑块("x", "水平平移");
    this.绘制单个滑块("y", "垂直平移");
  }

  绘制() {
    const ctx = this.ctx;
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, this.画布宽度, this.画布高度);
    this.绘制经纬线();
    this.绘制图像();
    this.绘制原点();
    this.绘制函数();
    this.绘制滑块();
    this.绘制重置按钮();
  }

  绘制函数() {
    const ctx = this.ctx;
    const x = 10;
    const y = this.滑块配置.顶边距 - 45;

    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    let 当前X = x;

    ctx.fillStyle = "#98c379";
    ctx.fillText("setTransform", 当前X, y);
    当前X += ctx.measureText("setTransform").width;

    ctx.fillStyle = "#b5b";
    ctx.fillText("(", 当前X, y);
    当前X += ctx.measureText("(").width;

    ctx.fillStyle = "#61afef";
    ctx.fillText("1", 当前X, y);
    当前X += ctx.measureText("1").width;

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    ctx.fillStyle = "#61afef";
    ctx.fillText("0", 当前X, y);
    当前X += ctx.measureText("0").width;

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    ctx.fillStyle = "#61afef";
    ctx.fillText("0", 当前X, y);
    当前X += ctx.measureText("0").width;

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    ctx.fillStyle = "#61afef";
    ctx.fillText("1", 当前X, y);
    当前X += ctx.measureText("1").width;

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    const 平移X文本 = Math.round(this.平移X).toString();
    for (let i = 0; i < 平移X文本.length; i++) {
      const 字符 = 平移X文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "darkgoldenrod";
      } else {
        ctx.fillStyle = "orange";
      }
      ctx.fillText(字符, 当前X, y);
      当前X += ctx.measureText(字符).width;
    }

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 4;

    const 平移Y文本 = Math.round(this.平移Y).toString();
    for (let i = 0; i < 平移Y文本.length; i++) {
      const 字符 = 平移Y文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "darkgoldenrod";
      } else {
        ctx.fillStyle = "orange";
      }
      ctx.fillText(字符, 当前X, y);
      当前X += ctx.measureText(字符).width;
    }

    ctx.fillStyle = "#b5b";
    ctx.fillText(")", 当前X, y);
  }

  绘制图像() {
    if (!this.图像加载完成) {
      return;
    }

    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.平移X, this.平移Y);

    const 图像X = -this.图像宽度 / 2;
    const 图像Y = -this.图像高度 / 2;

    ctx.drawImage(this.图像, 图像X, 图像Y, this.图像宽度, this.图像高度);

    ctx.restore();
  }
}

new Canvas平移();

class Canvas倾斜 extends Canvas变换基类 {
  constructor() {
    super("canvas-skew");
    this.原点X = this.画布宽度 / 2;
    this.原点Y = this.画布高度 / 2;
    this.水平倾斜 = 0;
    this.垂直倾斜 = 0;

    this.滑块状态 = {
      x: {
        当前值: 0,
        最小值: -5,
        最大值: 5,
        拖动中: false,
        悬停: false,
      },
      y: {
        当前值: 0,
        最小值: -5,
        最大值: 5,
        拖动中: false,
        悬停: false,
      },
    };

    this.动画状态.起始值 = { 水平倾斜: 0, 垂直倾斜: 0, 滑块X: 0, 滑块Y: 0 };

    this.绘制();
  }

  格式化滑块值(值) {
    return Math.round(值 * 10) / 10;
  }

  格式化滑块值文本(值) {
    const 值文本 = 值.toString();
    return 值文本.replace(/\.0$/, "").replace(/(\.\d)0$/, "$1");
  }

  应用滑块值(type, 值) {
    if (type === "x") {
      this.水平倾斜 = 值;
    } else {
      this.垂直倾斜 = 值;
    }
  }

  初始化重置起始值() {
    this.动画状态.起始值 = {
      水平倾斜: this.水平倾斜,
      垂直倾斜: this.垂直倾斜,
      滑块X: this.滑块状态.x.当前值,
      滑块Y: this.滑块状态.y.当前值,
    };
  }

  更新动画值(缓动进度) {
    this.水平倾斜 = Math.round(this.动画状态.起始值.水平倾斜 * (1 - 缓动进度) * 100) / 100;
    this.垂直倾斜 = Math.round(this.动画状态.起始值.垂直倾斜 * (1 - 缓动进度) * 100) / 100;
    this.滑块状态.x.当前值 = Math.round(this.动画状态.起始值.滑块X * (1 - 缓动进度) * 100) / 100;
    this.滑块状态.y.当前值 = Math.round(this.动画状态.起始值.滑块Y * (1 - 缓动进度) * 100) / 100;
  }

  绘制经纬线() {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);
    ctx.transform(1, this.垂直倾斜, this.水平倾斜, 1, 0, 0);

    ctx.strokeStyle = "#ffff1118";
    ctx.lineWidth = 1;

    const 绘制范围 = 800;

    const 起始Y = -绘制范围;
    const 结束Y = 绘制范围;

    for (let y = 起始Y; y <= 结束Y; y += this.网格间距) {
      ctx.beginPath();
      ctx.moveTo(-绘制范围, y);
      ctx.lineTo(绘制范围, y);
      ctx.stroke();
    }

    const 起始X = -绘制范围;
    const 结束X = 绘制范围;
    ctx.strokeStyle = "#11ffff18";
    for (let x = 起始X; x <= 结束X; x += this.网格间距) {
      ctx.beginPath();
      ctx.moveTo(x, -绘制范围);
      ctx.lineTo(x, 绘制范围);
      ctx.stroke();
    }

    ctx.restore();
  }

  绘制滑块() {
    this.绘制单个滑块("x", "水平倾斜");
    this.绘制单个滑块("y", "垂直倾斜");
  }

  绘制原点() {
    this.绘制原点通用(this.原点X, this.原点Y, [1, this.垂直倾斜, this.水平倾斜, 1, 0, 0]);
  }

  绘制() {
    const ctx = this.ctx;
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, this.画布宽度, this.画布高度);
    this.绘制经纬线();
    this.绘制图像();
    this.绘制原点();
    this.绘制函数();
    this.绘制滑块();
    this.绘制重置按钮();
  }

  绘制函数() {
    const ctx = this.ctx;
    const x = 10;
    const y = this.滑块配置.顶边距 - 45;

    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    let 当前X = x;

    ctx.fillStyle = "#98c379";
    ctx.fillText("setTransform", 当前X, y);
    当前X += ctx.measureText("setTransform").width;

    ctx.fillStyle = "#b5b";
    ctx.fillText("(", 当前X, y);
    当前X += ctx.measureText("(").width;

    ctx.fillStyle = "#61afef";
    ctx.fillText("1", 当前X, y);
    当前X += ctx.measureText("1").width;

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    const 水平倾斜文本 = this.水平倾斜
      .toString()
      .replace(/\.0$/, "")
      .replace(/(\.\d)0$/, "$1");
    for (let i = 0; i < 水平倾斜文本.length; i++) {
      const 字符 = 水平倾斜文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "darkgoldenrod";
      } else {
        ctx.fillStyle = "orange";
      }
      ctx.fillText(字符, 当前X, y);
      当前X += ctx.measureText(字符).width;
    }

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    const 垂直倾斜文本 = this.垂直倾斜
      .toString()
      .replace(/\.0$/, "")
      .replace(/(\.\d)0$/, "$1");
    for (let i = 0; i < 垂直倾斜文本.length; i++) {
      const 字符 = 垂直倾斜文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "darkgoldenrod";
      } else {
        ctx.fillStyle = "orange";
      }
      ctx.fillText(字符, 当前X, y);
      当前X += ctx.measureText(字符).width;
    }

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    ctx.fillStyle = "#61afef";
    ctx.fillText("1", 当前X, y);
    当前X += ctx.measureText("1").width;

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    ctx.fillStyle = "#61afef";
    ctx.fillText("0", 当前X, y);
    当前X += ctx.measureText("0").width;

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    ctx.fillStyle = "#61afef";
    ctx.fillText("0", 当前X, y);
    当前X += ctx.measureText("0").width;

    ctx.fillStyle = "#b5b";
    ctx.fillText(")", 当前X, y);
  }

  绘制图像() {
    if (!this.图像加载完成) {
      return;
    }

    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);
    ctx.transform(1, this.垂直倾斜, this.水平倾斜, 1, 0, 0);

    const 图像X = -this.图像宽度 / 2;
    const 图像Y = -this.图像高度 / 2;

    ctx.drawImage(this.图像, 图像X, 图像Y, this.图像宽度, this.图像高度);

    ctx.restore();
  }
}

new Canvas倾斜();

class Canvas缩放 extends Canvas变换基类 {
  constructor() {
    super("canvas-scale");
    this.原点X = this.画布宽度 / 2;
    this.原点Y = this.画布高度 / 2;
    this.水平缩放 = 1;
    this.垂直缩放 = 1;

    this.滑块状态 = {
      x: {
        当前值: 1,
        最小值: -5,
        最大值: 5,
        拖动中: false,
        悬停: false,
      },
      y: {
        当前值: 1,
        最小值: -5,
        最大值: 5,
        拖动中: false,
        悬停: false,
      },
    };

    this.动画状态.起始值 = { 水平缩放: 1, 垂直缩放: 1, 滑块X: 1, 滑块Y: 1 };

    this.绘制();
  }

  格式化滑块值(值) {
    return Math.round(值 * 10) / 10;
  }

  格式化滑块值文本(值) {
    const 值文本 = 值.toFixed(2);
    if (值文本.endsWith(".00")) {
      return 值文本.slice(0, -3);
    }
    if (值文本.endsWith("0") && 值文本.includes(".")) {
      return 值文本.slice(0, -1);
    }
    return 值文本;
  }

  应用滑块值(type, 值) {
    if (type === "x") {
      this.水平缩放 = 值;
    } else {
      this.垂直缩放 = 值;
    }
  }

  初始化重置起始值() {
    this.动画状态.起始值 = {
      水平缩放: this.水平缩放,
      垂直缩放: this.垂直缩放,
      滑块X: this.滑块状态.x.当前值,
      滑块Y: this.滑块状态.y.当前值,
    };
  }

  更新动画值(缓动进度) {
    this.水平缩放 = Math.round(((this.动画状态.起始值.水平缩放 - 1) * (1 - 缓动进度) + 1) * 100) / 100;
    this.垂直缩放 = Math.round(((this.动画状态.起始值.垂直缩放 - 1) * (1 - 缓动进度) + 1) * 100) / 100;
    this.滑块状态.x.当前值 = Math.round(((this.动画状态.起始值.滑块X - 1) * (1 - 缓动进度) + 1) * 100) / 100;
    this.滑块状态.y.当前值 = Math.round(((this.动画状态.起始值.滑块Y - 1) * (1 - 缓动进度) + 1) * 100) / 100;
  }

  绘制经纬线() {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);
    ctx.transform(this.水平缩放, 0, 0, this.垂直缩放, 0, 0);

    ctx.strokeStyle = "#ffff1118";
    ctx.lineWidth = 1;

    const 绘制范围 = 800;

    const 起始Y = -绘制范围;
    const 结束Y = 绘制范围;

    for (let y = 起始Y; y <= 结束Y; y += this.网格间距) {
      ctx.beginPath();
      ctx.moveTo(-绘制范围, y);
      ctx.lineTo(绘制范围, y);
      ctx.stroke();
    }

    const 起始X = -绘制范围;
    const 结束X = 绘制范围;
    ctx.strokeStyle = "#11ffff18";
    for (let x = 起始X; x <= 结束X; x += this.网格间距) {
      ctx.beginPath();
      ctx.moveTo(x, -绘制范围);
      ctx.lineTo(x, 绘制范围);
      ctx.stroke();
    }

    ctx.restore();
  }

  绘制滑块() {
    this.绘制单个滑块("x", "水平缩放");
    this.绘制单个滑块("y", "垂直缩放");
  }

  绘制单个滑块(type, label) {
    const ctx = this.ctx;
    const 滑块区域 = this.计算滑块区域(type);
    const 滑块 = this.滑块状态[type];
    const 比例 = (滑块.当前值 - 滑块.最小值) / (滑块.最大值 - 滑块.最小值);

    ctx.fillStyle = "#ffffff";
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 滑块区域.label.x, 滑块区域.label.y);

    ctx.fillStyle = "#444";
    ctx.fillRect(滑块区域.track.x, 滑块区域.track.y, 滑块区域.track.width, 滑块区域.track.height);

    ctx.fillStyle = "#4e81cdff";
    ctx.fillRect(滑块区域.track.x, 滑块区域.track.y, 比例 * 滑块区域.track.width, 滑块区域.track.height);

    if (滑块.拖动中 || 滑块.悬停) {
      ctx.fillStyle = "gold";
    } else {
      ctx.fillStyle = "transparent";
    }
    ctx.fillRect(滑块区域.thumb.x, 滑块区域.thumb.y, 滑块区域.thumb.width, 滑块区域.thumb.height);

    const 值文本 = 滑块.当前值.toString();
    const 格式化值文本 = 值文本.replace(/\.0$/, "").replace(/(\.\d)0$/, "$1");
    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    let 当前X = 滑块区域.value.x;
    for (let i = 0; i < 格式化值文本.length; i++) {
      const 字符 = 格式化值文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "lightskyblue";
      } else {
        ctx.fillStyle = "#ffffff";
      }
      ctx.fillText(字符, 当前X, 滑块区域.value.y);
      当前X += ctx.measureText(字符).width;
    }
  }

  绘制原点() {
    this.绘制原点通用(this.原点X, this.原点Y, [this.水平缩放, 0, 0, this.垂直缩放, 0, 0]);
  }

  绘制() {
    const ctx = this.ctx;
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, this.画布宽度, this.画布高度);
    this.绘制经纬线();
    this.绘制图像();
    this.绘制原点();
    this.绘制函数();
    this.绘制滑块();
    this.绘制重置按钮();
  }

  绘制函数() {
    const ctx = this.ctx;
    const x = 10;
    const y = this.滑块配置.顶边距 - 45;

    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    let 当前X = x;

    ctx.fillStyle = "#98c379";
    ctx.fillText("setTransform", 当前X, y);
    当前X += ctx.measureText("setTransform").width;

    ctx.fillStyle = "#b5b";
    ctx.fillText("(", 当前X, y);
    当前X += ctx.measureText("(").width;

    const 水平缩放文本 = this.格式化滑块值文本(this.水平缩放);
    for (let i = 0; i < 水平缩放文本.length; i++) {
      const 字符 = 水平缩放文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "darkgoldenrod";
      } else {
        ctx.fillStyle = "orange";
      }
      ctx.fillText(字符, 当前X, y);
      当前X += ctx.measureText(字符).width;
    }

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    ctx.fillStyle = "#61afef";
    ctx.fillText("0", 当前X, y);
    当前X += ctx.measureText("0").width;

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    ctx.fillStyle = "#61afef";
    ctx.fillText("0", 当前X, y);
    当前X += ctx.measureText("0").width;

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    const 垂直缩放文本 = this.格式化滑块值文本(this.垂直缩放);
    for (let i = 0; i < 垂直缩放文本.length; i++) {
      const 字符 = 垂直缩放文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "darkgoldenrod";
      } else {
        ctx.fillStyle = "orange";
      }
      ctx.fillText(字符, 当前X, y);
      当前X += ctx.measureText(字符).width;
    }

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    ctx.fillStyle = "#61afef";
    ctx.fillText("0", 当前X, y);
    当前X += ctx.measureText("0").width;

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    ctx.fillStyle = "#61afef";
    ctx.fillText("0", 当前X, y);
    当前X += ctx.measureText("0").width;

    ctx.fillStyle = "#b5b";
    ctx.fillText(")", 当前X, y);
  }

  绘制图像() {
    if (!this.图像加载完成) {
      return;
    }

    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);
    ctx.transform(this.水平缩放, 0, 0, this.垂直缩放, 0, 0);

    const 图像X = -this.图像宽度 / 2;
    const 图像Y = -this.图像高度 / 2;

    ctx.drawImage(this.图像, 图像X, 图像Y, this.图像宽度, this.图像高度);

    ctx.restore();
  }
}

new Canvas缩放();

class Canvas旋转 extends Canvas变换基类 {
  constructor() {
    super("canvas-rotate");
    this.原点X = this.画布宽度 / 2;
    this.原点Y = this.画布高度 / 2;
    this.旋转角度 = 0;

    this.滑块状态 = {
      x: {
        当前值: 0,
        最小值: 0,
        最大值: 360,
        拖动中: false,
        悬停: false,
      },
    };

    this.动画状态.起始值 = { 旋转角度: 0, 滑块X: 0 };

    this.绘制();
  }

  绘制计算过程() {
    const ctx = this.ctx;
    const x = 10;
    let y = 10;

    ctx.fillStyle = "#000a";
    ctx.fillRect(0, 0, 300, 140);

    function 格式化数字(数字) {
      let 文本 = 数字.toString();
      if (文本 === "-0") {
        return "0";
      }
      if (文本.includes(".")) {
        let [整数部分, 小数部分] = 文本.split(".");
        小数部分 = 小数部分.replace(/0+$/, "");
        if (小数部分 === "") {
          if (整数部分 === "-0") {
            return "0";
          }
          return 整数部分;
        }
        if (整数部分 === "-0") {
          return "-0." + 小数部分;
        }
        return `${整数部分}.${小数部分}`;
      }
      return 文本;
    }

    const 颜色 = {
      标题: "#98c379",
      运算符: "gray",
      角度值: "lightblue",
      函数名: "#e5c07b",
      括号: "#b5b",
      标题括号: "#5c7f9cff", // 标题括号专用颜色
      字母: "#4b9c70ff", // abcd字母专用颜色
      负号: "lightskyblue",
      小数点: "gray",
      过程标题: "#61afef",
    };

    ctx.font = `16px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = 颜色.过程标题;
    ctx.fillText("计算过程", x, y);
    y += 25;

    ctx.font = `14px ${fontFamily}`;
    ctx.textBaseline = "top";

    const 标题文本 = ["弧度", "a(水平缩放)", "b(水平倾斜)", "c(垂直倾斜)", "d(垂直缩放)"];
    let 最大标题宽度 = 0;
    for (const 标题 of 标题文本) {
      const 宽度 = ctx.measureText(标题).width;
      if (宽度 > 最大标题宽度) {
        最大标题宽度 = 宽度;
      }
    }

    const 旋转角度文本 = this.旋转角度.toString();
    const 原始弧度值 = ((this.旋转角度 * Math.PI) / 180).toFixed(3);
    const 弧度值 = 格式化数字(原始弧度值);

    // 绘制弧度计算行
    ctx.textAlign = "right";
    ctx.fillStyle = 颜色.标题;
    ctx.fillText("弧度", x + 最大标题宽度, y);
    ctx.textAlign = "left";
    let 当前X = x + 最大标题宽度;

    ctx.fillStyle = 颜色.运算符;
    ctx.fillText("=", 当前X + 8, y);
    当前X += 8 + ctx.measureText("=").width + 8;

    ctx.fillStyle = 颜色.角度值;
    ctx.fillText(旋转角度文本, 当前X, y);
    当前X += ctx.measureText(旋转角度文本).width;

    ctx.fillStyle = 颜色.运算符;
    ctx.fillText("×", 当前X + 8, y);
    当前X += 8 + ctx.measureText("×").width + 8;

    ctx.fillStyle = 颜色.函数名;
    ctx.fillText("π", 当前X, y);
    当前X += ctx.measureText("π").width;

    ctx.fillStyle = 颜色.运算符;
    ctx.fillText("/", 当前X + 8, y);
    当前X += 8 + ctx.measureText("/").width + 8;

    ctx.fillStyle = 颜色.角度值;
    ctx.fillText("180", 当前X, y);
    当前X += ctx.measureText("180").width;

    ctx.fillStyle = 颜色.运算符;
    ctx.fillText("=", 当前X + 8, y);
    当前X += 8 + ctx.measureText("=").width + 8;

    for (let i = 0; i < 弧度值.length; i++) {
      const 字符 = 弧度值[i];
      if (字符 === "-") {
        ctx.fillStyle = 颜色.负号;
      } else if (字符 === ".") {
        ctx.fillStyle = 颜色.小数点;
      } else {
        ctx.fillStyle = 颜色.角度值;
      }
      ctx.fillText(字符, 当前X, y);
      当前X += ctx.measureText(字符).width;
    }
    y += 20;

    const 弧度 = (this.旋转角度 * Math.PI) / 180;
    const a = Math.cos(弧度);
    const b = Math.sin(弧度);
    const c = -Math.sin(弧度);
    const d = Math.cos(弧度);

    // 绘制参数配置
    const 参数配置 = [
      { letter: "a", text: "水平缩放", value: a, func: "cos", hasMinus: false },
      { letter: "b", text: "水平倾斜", value: b, func: "sin", hasMinus: false },
      { letter: "c", text: "垂直倾斜", value: c, func: "sin", hasMinus: true },
      { letter: "d", text: "垂直缩放", value: d, func: "cos", hasMinus: false },
    ];

    // 计算中间部分宽度
    const 中间部分宽度 = [];
    for (const 配置 of 参数配置) {
      let 宽度 = ctx.measureText(配置.func).width;
      宽度 += ctx.measureText("(").width;
      宽度 += ctx.measureText(弧度值).width;
      宽度 += ctx.measureText(")").width;
      if (配置.hasMinus) {
        宽度 += ctx.measureText("-").width;
      }
      中间部分宽度.push(宽度);
    }

    const 最大中间宽度 = Math.max(...中间部分宽度);

    // 绘制abcd四行
    for (let i = 0; i < 参数配置.length; i++) {
      const 配置 = 参数配置[i];
      const 目标右边缘 = x + 最大标题宽度;

      // 绘制标题部分
      ctx.textAlign = "right";
      ctx.fillStyle = 颜色.字母;

      const 右括号宽度 = ctx.measureText(")").width;
      const 文本宽度 = ctx.measureText(配置.text).width;
      const 左括号宽度 = ctx.measureText("(").width;

      ctx.fillText(配置.letter, 目标右边缘 - (左括号宽度 + 文本宽度 + 右括号宽度), y);
      ctx.fillStyle = 颜色.标题括号;
      ctx.fillText("(", 目标右边缘 - (文本宽度 + 右括号宽度), y);
      ctx.fillStyle = 颜色.标题;
      ctx.fillText(配置.text, 目标右边缘 - 右括号宽度, y);
      ctx.fillStyle = 颜色.标题括号;
      ctx.fillText(")", 目标右边缘, y);

      // 绘制计算部分
      ctx.textAlign = "left";
      当前X = x + 最大标题宽度;

      ctx.fillStyle = 颜色.运算符;
      ctx.fillText("=", 当前X + 8, y);
      当前X += 8 + ctx.measureText("=").width + 8;

      // 绘制负号（如果需要）
      if (配置.hasMinus) {
        ctx.fillStyle = 颜色.负号;
        ctx.fillText("-", 当前X, y);
        当前X += ctx.measureText("-").width;
      }

      // 绘制函数名
      ctx.fillStyle = 颜色.函数名;
      ctx.fillText(配置.func, 当前X, y);
      当前X += ctx.measureText(配置.func).width;

      // 绘制括号和弧度值
      ctx.fillStyle = 颜色.括号;
      ctx.fillText("(", 当前X, y);
      当前X += ctx.measureText("(").width;

      for (let j = 0; j < 弧度值.length; j++) {
        const 字符 = 弧度值[j];
        if (字符 === "-") {
          ctx.fillStyle = 颜色.负号;
        } else if (字符 === ".") {
          ctx.fillStyle = 颜色.小数点;
        } else {
          ctx.fillStyle = 颜色.角度值;
        }
        ctx.fillText(字符, 当前X, y);
        当前X += ctx.measureText(字符).width;
      }

      ctx.fillStyle = 颜色.括号;
      ctx.fillText(")", 当前X, y);
      当前X += ctx.measureText(")").width;

      // 调整宽度以对齐
      当前X += 最大中间宽度 - 中间部分宽度[i];

      // 绘制结果部分
      ctx.fillStyle = 颜色.运算符;
      ctx.fillText("=", 当前X + 8, y);
      当前X += 8 + ctx.measureText("=").width + 8;

      const 值文本 = 格式化数字(配置.value.toFixed(3));
      for (let j = 0; j < 值文本.length; j++) {
        const 字符 = 值文本[j];
        if (字符 === "-") {
          ctx.fillStyle = 颜色.负号;
        } else if (字符 === ".") {
          ctx.fillStyle = 颜色.小数点;
        } else {
          ctx.fillStyle = 颜色.角度值;
        }
        ctx.fillText(字符, 当前X, y);
        当前X += ctx.measureText(字符).width;
      }

      y += 20;
    }
  }

  绘制() {
    const ctx = this.ctx;
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, this.画布宽度, this.画布高度);
    this.绘制经纬线();
    this.绘制图像();
    this.绘制原点();
    this.绘制计算过程();
    this.绘制函数();
    this.绘制滑块();
    this.绘制重置按钮();
  }

  绘制经纬线() {
    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);
    const 弧度 = (this.旋转角度 * Math.PI) / 180;
    ctx.transform(Math.cos(弧度), Math.sin(弧度), -Math.sin(弧度), Math.cos(弧度), 0, 0);

    ctx.strokeStyle = "#ffffff0c";
    ctx.lineWidth = 1;

    const 绘制范围 = 800;

    const 起始Y = -绘制范围;
    const 结束Y = 绘制范围;

    for (let y = 起始Y; y <= 结束Y; y += this.网格间距) {
      ctx.beginPath();
      ctx.moveTo(-绘制范围, y);
      ctx.lineTo(绘制范围, y);
      ctx.stroke();
    }

    const 起始X = -绘制范围;
    const 结束X = 绘制范围;
    ctx.strokeStyle = "#ffffff0c";
    for (let x = 起始X; x <= 结束X; x += this.网格间距) {
      ctx.beginPath();
      ctx.moveTo(x, -绘制范围);
      ctx.lineTo(x, 绘制范围);
      ctx.stroke();
    }

    ctx.restore();
  }

  绘制原点() {
    const 弧度 = (this.旋转角度 * Math.PI) / 180;
    this.绘制原点通用(this.原点X, this.原点Y, [Math.cos(弧度), Math.sin(弧度), -Math.sin(弧度), Math.cos(弧度), 0, 0]);
  }

  绘制滑块() {
    this.绘制单个滑块("x", "旋转角度");
  }

  格式化滑块值(值) {
    return Math.round(值);
  }

  格式化滑块值文本(值) {
    return Math.round(值).toString();
  }

  应用滑块值(type, 值) {
    if (type === "x") {
      this.旋转角度 = Math.round(值);
    }
  }

  初始化重置起始值() {
    this.动画状态.起始值 = {
      旋转角度: this.旋转角度,
      滑块X: this.滑块状态.x.当前值,
    };
  }

  更新动画值(缓动进度) {
    this.旋转角度 = Math.round(this.动画状态.起始值.旋转角度 * (1 - 缓动进度));
    this.滑块状态.x.当前值 = Math.round(this.动画状态.起始值.滑块X * (1 - 缓动进度));
  }

  绘制函数() {
    const ctx = this.ctx;
    const x = 10;
    const y = this.滑块配置.顶边距 - 45;

    function 格式化数字(数字) {
      let 文本 = 数字.toString();
      if (文本 === "-0") {
        return "0";
      }
      if (文本.includes(".")) {
        let [整数部分, 小数部分] = 文本.split(".");
        小数部分 = 小数部分.replace(/0+$/, "");
        if (小数部分 === "") {
          if (整数部分 === "-0") {
            return "0";
          }
          return 整数部分;
        }
        if (整数部分 === "-0") {
          return "-0." + 小数部分;
        }
        return `${整数部分}.${小数部分}`;
      }
      return 文本;
    }

    ctx.font = `14px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    let 当前X = x;

    ctx.fillStyle = "#98c379";
    ctx.fillText("setTransform", 当前X, y);
    当前X += ctx.measureText("setTransform").width;

    ctx.fillStyle = "#b5b";
    ctx.fillText("(", 当前X, y);
    当前X += ctx.measureText("(").width;

    const 弧度 = (this.旋转角度 * Math.PI) / 180;
    const a = Math.cos(弧度);
    const b = Math.sin(弧度);
    const c = -Math.sin(弧度);
    const d = Math.cos(弧度);

    const a文本 = 格式化数字(a.toFixed(3));
    for (let i = 0; i < a文本.length; i++) {
      const 字符 = a文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "darkgoldenrod";
      } else if (字符 === ".") {
        ctx.fillStyle = "gray";
      } else {
        ctx.fillStyle = "orange";
      }
      ctx.fillText(字符, 当前X, y);
      当前X += ctx.measureText(字符).width;
    }

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    const b文本 = 格式化数字(b.toFixed(3));
    for (let i = 0; i < b文本.length; i++) {
      const 字符 = b文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "darkgoldenrod";
      } else if (字符 === ".") {
        ctx.fillStyle = "gray";
      } else {
        ctx.fillStyle = "orange";
      }
      ctx.fillText(字符, 当前X, y);
      当前X += ctx.measureText(字符).width;
    }

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    const c文本 = 格式化数字(c.toFixed(3));
    for (let i = 0; i < c文本.length; i++) {
      const 字符 = c文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "darkgoldenrod";
      } else if (字符 === ".") {
        ctx.fillStyle = "gray";
      } else {
        ctx.fillStyle = "orange";
      }
      ctx.fillText(字符, 当前X, y);
      当前X += ctx.measureText(字符).width;
    }

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    const d文本 = 格式化数字(d.toFixed(3));
    for (let i = 0; i < d文本.length; i++) {
      const 字符 = d文本[i];
      if (字符 === "-") {
        ctx.fillStyle = "darkgoldenrod";
      } else if (字符 === ".") {
        ctx.fillStyle = "gray";
      } else {
        ctx.fillStyle = "orange";
      }
      ctx.fillText(字符, 当前X, y);
      当前X += ctx.measureText(字符).width;
    }

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    ctx.fillStyle = "#61afef";
    ctx.fillText("0", 当前X, y);
    当前X += ctx.measureText("0").width;

    ctx.fillStyle = "gray";
    ctx.fillText(",", 当前X, y);
    当前X += ctx.measureText(",").width + 6;

    ctx.fillStyle = "#61afef";
    ctx.fillText("0", 当前X, y);
    当前X += ctx.measureText("0").width;

    ctx.fillStyle = "#b5b";
    ctx.fillText(")", 当前X, y);
  }

  绘制图像() {
    if (!this.图像加载完成) {
      return;
    }

    const ctx = this.ctx;
    ctx.save();

    ctx.translate(this.原点X, this.原点Y);
    const 弧度 = (this.旋转角度 * Math.PI) / 180;
    ctx.transform(Math.cos(弧度), Math.sin(弧度), -Math.sin(弧度), Math.cos(弧度), 0, 0);

    const 图像X = -this.图像宽度 / 2;
    const 图像Y = -this.图像高度 / 2;

    ctx.drawImage(this.图像, 图像X, 图像Y, this.图像宽度, this.图像高度);

    ctx.restore();
  }
}

new Canvas旋转();

