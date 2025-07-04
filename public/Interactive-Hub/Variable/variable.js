// Canvas 渲染系统
class 内存Canvas渲染器 {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.内存块大小 = 35;
    this.内存块间距 = 1;
    this.每行内存块数 = 0;
    this.总行数 = 0;
    this.悬停索引 = -1;
    this.当前应用索引 = -1;
    this.需要重绘 = true;
    this.节流定时器 = null;
    this.上次重绘时间 = 0;
    this.移动到内存分配区 = false;
    this.移动到Canvas = false;
    this.mousemove监听器 = null;
    
    // 字体设置
    this.字体 = '12px "JetBrains Mono", Consolas, "Noto Sans SC", 微软雅黑, monospace, sans-serif';
    this.抬头字体 = '10px "Noto Sans SC", 微软雅黑, sans-serif';
    
    this.初始化Canvas();
    this.绑定事件();
  }

  初始化Canvas() {
    this.计算Canvas尺寸();
    this.设置Canvas样式();
  }

  计算Canvas尺寸() {
    const 容器宽度 = this.canvas.parentElement.offsetWidth;
    
    // 为应用抬头预留空间：左右各预留100px，上下各预留50px
    const 左右预留空间 = 100;
    const 上下预留空间 = 50;
    
    this.每行内存块数 = Math.floor((容器宽度 - 20 - 左右预留空间 * 2) / (this.内存块大小 + this.内存块间距));
    this.总行数 = Math.ceil(内存容量 / this.每行内存块数);
    
    const canvas宽度 = this.每行内存块数 * (this.内存块大小 + this.内存块间距) - this.内存块间距 + 左右预留空间 * 2;
    const canvas高度 = this.总行数 * (this.内存块大小 + this.内存块间距) - this.内存块间距 + 上下预留空间 * 2;
    
    // 处理DPI缩放
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = canvas宽度 * dpr;
    this.canvas.height = canvas高度 * dpr;
    this.canvas.style.width = canvas宽度 + 'px';
    this.canvas.style.height = canvas高度 + 'px';
    
    // 重置变换矩阵，然后设置DPI缩放
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    
    // 强制设置需要重绘标志
    this.需要重绘 = true;
  }

  设置Canvas样式() {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'center';
  }

  绑定事件() {
    this.mousemove监听器 = (e) => this.处理鼠标移动(e);
    // 绑定其他事件
    this.canvas.addEventListener('mouseenter', (e) => this.处理鼠标进入(e));
    this.canvas.addEventListener('mouseleave', (e) => this.处理鼠标离开(e));
    this.canvas.addEventListener('click', (e) => this.处理鼠标点击(e));
  }

  处理鼠标移动(e) {
    // 如果鼠标在Canvas内，才处理Canvas的鼠标移动逻辑
    if (!this.移动到Canvas) {
      return;
    }
    
    // 节流处理，限制重绘频率
    const 当前时间 = Date.now();
    if (当前时间 - this.上次重绘时间 < 16) { // 约60fps
      if (this.节流定时器) {
        clearTimeout(this.节流定时器);
      }
      this.节流定时器 = setTimeout(() => {
        this.处理鼠标移动(e);
      }, 16);
      return;
    }
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 记录鼠标位置，用于应用抬头检测
    this.鼠标X = x;
    this.鼠标Y = y;
    
    // 首先检查鼠标是否在应用抬头区域（优先处理，因为抬头在Z轴上方）
    let 悬停应用 = null;
    for (const [应用名称, 应用数据] of 内存占用表) {
      if (应用数据.起始位置 >= 0 && 应用数据.起始位置 < 内存容量) {
        const { x: 应用X, y: 应用Y } = this.索引到坐标(应用数据.起始位置);
        const 抬头文本 = 应用名称;
        const 抬头宽度 = this.ctx.measureText(抬头文本).width + 20;
        const 抬头高度 = 20;
        const 抬头X = 应用X - 抬头宽度 - 5;
        const 抬头Y = 应用Y - 抬头高度 / 2;
        
        if (x >= 抬头X && x <= 抬头X + 抬头宽度 && 
            y >= 抬头Y && y <= 抬头Y + 抬头高度) {
          悬停应用 = 应用名称;
          break;
        }
      }
    }
    
    // 处理应用高亮状态变更
    if (悬停应用 !== this.当前应用索引) {
      if (悬停应用) {
        this.设置当前应用(悬停应用);
        
        // 高亮对应的内存分配分区
        const 内存分配分区 = document.querySelector(`.内存分配分区[程序名称="${悬停应用}"]`);
        if (内存分配分区) {
          内存分配分区.classList.add("当前内存分配分区");
        }
      } else {
        this.清除当前应用();
        
        // 清除所有内存分配分区的高亮
        const 所有内存分配分区 = document.querySelectorAll('.内存分配分区');
        所有内存分配分区.forEach(分区 => {
          分区.classList.remove("当前内存分配分区");
        });
      }
    }
    
    // 只有在没有悬停应用抬头时，才处理字节格子的悬停
    if (!悬停应用) {
      const 新悬停索引 = this.坐标到索引(x, y);
      
      if (新悬停索引 !== this.悬停索引) {
        this.悬停索引 = 新悬停索引;
        this.需要重绘 = true;
        this.重绘();
        this.更新悬停提示();
      }
      // 移除了不必要的重绘调用
    } else {
      // 如果悬停在应用抬头，清除字节格子的悬停状态
      if (this.悬停索引 !== -1) {
        this.悬停索引 = -1;
        this.隐藏悬停提示();
      }
      // 重绘以显示应用抬头的高亮效果
      this.需要重绘 = true;
      this.重绘();
    }
    
    this.上次重绘时间 = 当前时间;
  }

  处理鼠标进入(e) {
    this.移动到Canvas = true;
    // 开始监听mousemove事件
    this.canvas.addEventListener('mousemove', this.mousemove监听器);
  }

  处理鼠标离开(e) {
    this.移动到Canvas = false;
    // 停止监听mousemove事件
    this.canvas.removeEventListener('mousemove', this.mousemove监听器);
    
    // 只有当鼠标没有移动到内存分配区时，才清除状态
    if (!this.移动到内存分配区) {
      this.悬停索引 = -1;
      this.鼠标X = 0;
      this.鼠标Y = 0;
      this.当前应用索引 = -1;
      this.需要重绘 = true;
      this.重绘();
      this.隐藏悬停提示();
      
      // 清除所有内存分配分区的高亮
      const 所有内存分配分区 = document.querySelectorAll('.内存分配分区');
      所有内存分配分区.forEach(分区 => {
        分区.classList.remove("当前内存分配分区");
      });
    }
  }

  处理鼠标点击(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const 点击索引 = this.坐标到索引(x, y);
    if (点击索引 >= 0 && 点击索引 < 内存容量) {
      // 可以在这里添加点击处理逻辑
    }
  }

  坐标到索引(x, y) {
    // 考虑预留空间
    const 左右预留空间 = 100;
    const 上下预留空间 = 50;
    
    // 减去预留空间得到相对于内存块的坐标
    const 相对X = x - 左右预留空间;
    const 相对Y = y - 上下预留空间;
    
    const 行 = Math.floor(相对Y / (this.内存块大小 + this.内存块间距));
    const 列 = Math.floor(相对X / (this.内存块大小 + this.内存块间距));
    
    if (行 < 0 || 行 >= this.总行数 || 列 < 0 || 列 >= this.每行内存块数) {
      return -1;
    }
    
    const 索引 = 行 * this.每行内存块数 + 列;
    return 索引 < 内存容量 ? 索引 : -1;
  }

  索引到坐标(索引) {
    const 行 = Math.floor(索引 / this.每行内存块数);
    const 列 = 索引 % this.每行内存块数;
    
    // 考虑预留空间
    const 左右预留空间 = 100;
    const 上下预留空间 = 50;
    
    const x = 列 * (this.内存块大小 + this.内存块间距) + 左右预留空间;
    const y = 行 * (this.内存块大小 + this.内存块间距) + 上下预留空间;
    
    return { x, y };
  }

  重绘() {
    if (!this.需要重绘) return;
    
    // 清除整个Canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 优化DOM操作：只在需要时清除和添加高亮
    if (this.当前应用索引 !== -1) {
      // 只处理当前应用的内存分配分区
      const 当前内存分配分区 = document.querySelector(`.内存分配分区[程序名称="${this.当前应用索引}"]`);
      if (当前内存分配分区 && !当前内存分配分区.classList.contains("当前内存分配分区")) {
        当前内存分配分区.classList.add("当前内存分配分区");
      }
    } else {
      // 只在清除当前应用时清除所有高亮
      const 所有内存分配分区 = document.querySelectorAll('.内存分配分区.当前内存分配分区');
      所有内存分配分区.forEach(分区 => {
        分区.classList.remove("当前内存分配分区");
      });
    }
    
    for (let i = 0; i < 内存容量; i++) {
      this.绘制内存块(i);
    }
    
    this.需要重绘 = false;
  }

  绘制内存块(索引) {
    const { x, y } = this.索引到坐标(索引);
    const 内存数据 = this.获取内存块数据(索引);
    
    // 绘制背景
    this.绘制内存块背景(x, y, 内存数据);
    
    // 绘制边框
    this.绘制内存块边框(x, y, 内存数据);
    
    // 绘制文本
    this.绘制内存块文本(x, y, 内存数据);
    
    // 绘制应用抬头
    if (内存数据.是应用起始) {
      this.绘制应用抬头(x, y, 内存数据);
    }
  }

  获取内存块数据(索引) {
    const 内存块 = {
      索引: 索引,
      已占用: false,
      应用名称: '',
      应用顺序: 0,
      应用颜色: '',
      是应用起始: false,
      是应用末尾: false,
      是当前应用: false,
      空闲内存序号: 0,
      内存地址_10进制: 内存起始地址_10进制 + 索引,
      内存地址_16进制: 获取16进制内存地址(内存起始地址_10进制 + 索引, 内存位数)
    };

    // 检查是否被应用占用
    for (const [应用名称, 应用数据] of 内存占用表) {
      if (索引 >= 应用数据.起始位置 && 索引 < 应用数据.起始位置 + 应用数据.容量) {
        内存块.已占用 = true;
        内存块.应用名称 = 应用名称;
        内存块.应用顺序 = 索引 - 应用数据.起始位置;
        内存块.应用颜色 = 应用数据.颜色 || '#666';
        内存块.是应用起始 = 索引 === 应用数据.起始位置;
        内存块.是应用末尾 = 索引 === 应用数据.起始位置 + 应用数据.容量 - 1;
        
        // 检查是否是当前应用（包括该应用的所有内存块）
        if (this.当前应用索引 === 应用名称) {
          内存块.是当前应用 = true;
        }
        break;
      }
    }

    // 如果没有被占用，计算空闲内存序号
    if (!内存块.已占用) {
      for (let i = 0; i < 空闲内存表.length; i++) {
        const 空闲内存 = 空闲内存表[i];
        if (索引 >= 空闲内存.起始位置 && 索引 < 空闲内存.起始位置 + 空闲内存.容量) {
          内存块.空闲内存序号 = 索引 - 空闲内存.起始位置;
          break;
        }
      }
    }

    return 内存块;
  }

  绘制内存块背景(x, y, 内存数据) {
    if (内存数据.已占用) {
      // 已占用的内存块
      this.ctx.fillStyle = 内存数据.应用颜色;
      this.ctx.fillRect(x, y, this.内存块大小, this.内存块大小);
    } else {
      // 空闲的内存块
      this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--变量背景色');
      this.ctx.fillRect(x, y, this.内存块大小, this.内存块大小);
    }

    // 悬停效果
    if (内存数据.索引 === this.悬停索引 && !内存数据.已占用) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.fillRect(x, y, this.内存块大小, this.内存块大小);
    }
  }

  绘制内存块边框(x, y, 内存数据) {
    this.ctx.strokeStyle = 'transparent';
    this.ctx.lineWidth = 1;

    if (内存数据.索引 === this.悬停索引) {
      this.ctx.strokeStyle = 内存数据.已占用 ? 'silver' : 'white';
    } else if (内存数据.是当前应用) {
      this.ctx.strokeStyle = 'white';
    }

    if (this.ctx.strokeStyle !== 'transparent') {
      this.ctx.strokeRect(x, y, this.内存块大小, this.内存块大小);
    }
  }

  绘制内存块文本(x, y, 内存数据) {
    if (内存数据.已占用) {
      // 绘制应用顺序
      this.ctx.font = this.字体;
      this.ctx.fillStyle = 'white';
      this.ctx.shadowColor = 'black';
      this.ctx.shadowBlur = 2;
      this.ctx.fillText(内存数据.应用顺序.toString(), x + this.内存块大小 / 2, y + this.内存块大小 / 2);
      this.ctx.shadowBlur = 0;
    } else {
      // 绘制空闲内存序号
      this.ctx.font = this.字体;
      this.ctx.fillStyle = '#fff3';
      this.ctx.shadowColor = 'black';
      this.ctx.shadowBlur = 2;
      this.ctx.fillText(内存数据.空闲内存序号.toString(), x + this.内存块大小 / 2, y + this.内存块大小 / 2);
      this.ctx.shadowBlur = 0;
    }
  }

  绘制应用抬头(x, y, 内存数据) {
    const 抬头文本 = 内存数据.应用名称;
    const 抬头宽度 = this.ctx.measureText(抬头文本).width + 20;
    const 抬头高度 = 20;
    const 抬头X = x - 抬头宽度 - 5;
    const 抬头Y = y - 抬头高度 / 2;

    // 检查鼠标是否在应用抬头区域内
    const 鼠标X = this.鼠标X || 0;
    const 鼠标Y = this.鼠标Y || 0;
    
    const 鼠标在抬头区域 = 鼠标X >= 抬头X && 鼠标X <= 抬头X + 抬头宽度 && 
                          鼠标Y >= 抬头Y && 鼠标Y <= 抬头Y + 抬头高度;
    
    // 检查是否是当前应用（从内存分配分区悬停触发）
    const 是当前应用 = this.当前应用索引 === 内存数据.应用名称;

    // 绘制抬头背景
    this.ctx.fillStyle = (鼠标在抬头区域 || 是当前应用) ? '#123' : '#111';
    this.ctx.strokeStyle = (鼠标在抬头区域 || 是当前应用) ? 'orange' : '#aaa';
    this.ctx.lineWidth = 1;
    this.ctx.fillRect(抬头X, 抬头Y, 抬头宽度, 抬头高度);
    this.ctx.strokeRect(抬头X, 抬头Y, 抬头宽度, 抬头高度);

    // 绘制抬头文本
    this.ctx.font = this.抬头字体;
    this.ctx.fillStyle = (鼠标在抬头区域 || 是当前应用) ? '#8fc' : 'white';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(抬头文本, 抬头X + 抬头宽度 / 2, 抬头Y + 抬头高度 / 2);
    this.ctx.textAlign = 'center';
  }

  更新悬停提示() {
    if (this.悬停索引 >= 0 && this.悬停索引 < 内存容量) {
      const 内存数据 = this.获取内存块数据(this.悬停索引);
      if (内存数据.已占用) {
        this.显示悬停提示(内存数据);
      } else {
        this.隐藏悬停提示();
      }
    } else {
      this.隐藏悬停提示();
    }
  }

  显示悬停提示(内存数据) {
    // 缓存提示框引用，避免重复查询
    if (!this.提示框) {
      this.提示框 = document.querySelector('.字节描述提示框');
      if (!this.提示框) {
        this.提示框 = this.创建悬停提示框();
      }
    }

    const { x, y } = this.索引到坐标(内存数据.索引);
    const rect = this.canvas.getBoundingClientRect();
    
    this.提示框.style.left = (rect.left + x + this.内存块大小 / 2 - 70) + 'px';
    this.提示框.style.top = (rect.top + y - this.提示框.offsetHeight - 10) + 'px';
    
    // 缓存DOM元素引用，避免重复查询
    if (!this.提示框元素) {
      this.提示框元素 = {
        名称: this.提示框.querySelector('.字节名称'),
        顺位: this.提示框.querySelector('.字节顺位'),
        十进制地址: this.提示框.querySelector('.进制地址:first-child .地址值'),
        十六进制地址: this.提示框.querySelector('.进制地址:last-child .地址值')
      };
    }
    
    // 更新提示框内容
    if (this.提示框元素.名称) this.提示框元素.名称.textContent = 内存数据.应用名称;
    if (this.提示框元素.顺位) this.提示框元素.顺位.textContent = 内存数据.应用顺序;
    if (this.提示框元素.十进制地址) this.提示框元素.十进制地址.textContent = 内存数据.内存地址_10进制;
    if (this.提示框元素.十六进制地址) this.提示框元素.十六进制地址.textContent = 内存数据.内存地址_16进制;
    
    this.提示框.classList.add('可见');
  }

  隐藏悬停提示() {
    if (this.提示框) {
      this.提示框.classList.remove('可见');
    }
  }

  创建悬停提示框() {
    const 提示框 = document.createElement('div');
    提示框.className = '字节描述提示框';
    提示框.innerHTML = `
      <div class="字节名称与顺位">
        <span class="字节名称"></span>
        <span class="字节顺位"></span>
      </div>
      <div class="字节地址">
        <div class="进制地址">
          <span class="进制">Dec</span>
          <div class="地址代码">
            <span class="地址值"></span>
          </div>
        </div>
        <div class="进制地址">
          <span class="进制">Hex</span>
          <div class="地址代码">
            <span class="地址前缀">0x</span>
            <span class="地址值"></span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(提示框);
    return 提示框;
  }

  设置当前应用(应用名称) {
    this.当前应用索引 = 应用名称;
    this.需要重绘 = true;
    this.重绘();
  }

  清除当前应用() {
    this.当前应用索引 = -1;
    this.需要重绘 = true;
    this.重绘();
  }

  强制重绘() {
    this.需要重绘 = true;
    this.重绘();
  }
}

const root = document.querySelector(":root");
const 内存分配区 = document.querySelector(".内存分配区");
const 内存Canvas = document.getElementById("内存Canvas");
const 内存容量滑块 = document.getElementById("内存容量");
const 重置按钮 = document.querySelector(".重置按钮");

// Canvas 渲染器
let 内存渲染器;

let 程序颜色 = "black";
let 内存容量 = parseInt(内存容量滑块.value, 10);
const 内存位数 = 32;
let 内存起始地址_10进制 = Math.floor(Math.random() * (4294967296 - 1 - 内存容量));
let 空闲内存表 = [{ 起始位置: 0, 容量: 内存容量 }];

const 变量类型表 = new Map();
变量类型表.set("int", { 长度: 4, 有符号: true, 类型: "数字" });
变量类型表.set("short", { 长度: 2, 有符号: true, 类型: "数字" });
变量类型表.set("char", { 长度: 1, 有符号: true, 类型: "数字" });
变量类型表.set("long long", { 长度: 8, 有符号: true, 类型: "数字" });
变量类型表.set("float", { 长度: 4, 有符号: true, 类型: "数字" });
变量类型表.set("double", { 长度: 8, 有符号: true, 类型: "数字" });
变量类型表.set("unsigned int", { 长度: 4, 有符号: false, 类型: "数字" });
变量类型表.set("unsigned short", { 长度: 2, 有符号: false, 类型: "数字" });
变量类型表.set("unsigned char", { 长度: 1, 有符号: false, 类型: "数字" });
变量类型表.set("unsigned long long", { 长度: 8, 有符号: false, 类型: "数字" });
变量类型表.set("unsigned float", { 长度: 4, 有符号: false, 类型: "数字" });
变量类型表.set("unsigned double", { 长度: 8, 有符号: false, 类型: "数字" });
变量类型表.set("int *", { 长度: 4, 有符号: false, 类型: "指针" });
变量类型表.set("short *", { 长度: 2, 有符号: false, 类型: "指针" });
变量类型表.set("char *", { 长度: 1, 有符号: false, 类型: "指针" });
变量类型表.set("long long *", { 长度: 8, 有符号: false, 类型: "指针" });
变量类型表.set("int*", { 长度: 4, 有符号: false, 类型: "指针" });
变量类型表.set("short*", { 长度: 2, 有符号: false, 类型: "指针" });
变量类型表.set("char*", { 长度: 1, 有符号: false, 类型: "指针" });
变量类型表.set("long long*", { 长度: 8, 有符号: false, 类型: "指针" });
变量类型表.set("float *", { 长度: 4, 有符号: false, 类型: "指针" });
变量类型表.set("double *", { 长度: 8, 有符号: false, 类型: "指针" });
变量类型表.set("float*", { 长度: 4, 有符号: false, 类型: "指针" });
变量类型表.set("double*", { 长度: 8, 有符号: false, 类型: "指针" });

const 无效标识符起始字符表 = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
const 无效标识符字符表 = new Set([
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "-",
  "+",
  "=",
  "{",
  "}",
  "[",
  "]",
  "|",
  "\\",
  ":",
  ";",
  "'",
  '"',
  "<",
  ">",
  ",",
  "/",
  "?",
  "~",
  "`",
  "!",
  " ",
]);

const 应用池 = [
  "Photoshop",
  "百度网盘",
  "微信",
  "Edge浏览器",
  "网易云音乐",
  "Blender",
  "3ds Max",
  "QQ",
  "饿了么",
  "抖音",
  "Word",
  "Excel",
  "PowerPoint",
  "VS Code",
  "Steam",
  "WinRAR",
  "Illustrator",
  "Premiere Pro",
  "Inkscape",
  "Krita",
  "小红书",
  "Animate",
  "记事本",
  "画图",
  "Bandicam",
];
const 最小预安装应用数 = 1;
const 最大预安装应用数 = 10;
let 预安装应用数 = Math.floor(Math.random() * (最大预安装应用数 - 最小预安装应用数 + 1)) + 最小预安装应用数;
const 最小占用内存 = 2;
const 最大占用内存 = 192;
const 内存占用表 = new Map();

初始化内存();

内存容量滑块.addEventListener("input", () => {
  内存起始地址_10进制 = Math.floor(Math.random() * 300000000);
  内存容量 = parseInt(内存容量滑块.value, 10);
  const 滑块值 = 内存容量滑块.parentElement.querySelector(".滑块值");
  滑块值.textContent = 内存容量滑块.value;
  空闲内存表 = [{ 起始位置: 0, 容量: 内存容量 }];
  初始化内存();
  
  // 检查代码输入分区的输入并分配内存
  检查并分配代码输入分区内存();
  
  // 确保Canvas重绘 - 使用setTimeout确保DOM更新完成后再重绘
  setTimeout(() => {
    if (内存渲染器) {
      内存渲染器.初始化Canvas();
      内存渲染器.强制重绘();
    }
  }, 0);
});

function 初始化内存() {
  预安装应用数 = Math.floor(Math.random() * (7 - 2 + 1)) + 2;
  数组洗牌(应用池);
  内存占用表.clear();
  
  // 重要：确保空闲内存表正确重置
  空闲内存表 = [{ 起始位置: 0, 容量: 内存容量 }];
  
  // 临时存储所有应用，然后逐个分配内存
  const 临时应用列表 = [];
  for (let i = 0; i < 预安装应用数; i++) {
    临时应用列表.push({
      名称: 应用池[i],
      容量: Math.floor(Math.random() * (最大占用内存 - 最小占用内存 + 1) + 最小占用内存),
    });
  }

  内存分配区.innerHTML = "";
  const 内存分配区标题 = document.createElement("h4");
  内存分配区标题.className = "内存分配区标题";
  内存分配区标题.textContent = "内存分配";
  内存分配区.appendChild(内存分配区标题);
  
  for (const 临时应用 of 临时应用列表) {
    程序颜色 = 生成随机深色();
    const 应用键值对 = [临时应用.名称, { 起始位置: 0, 容量: 临时应用.容量, 颜色: 程序颜色 }];
    
    const 已分配内存 = 向内存中添加应用(应用键值对);
    
    if (已分配内存) {
      // 只有成功分配内存的应用才添加到内存占用表
      内存占用表.set(临时应用.名称, {
        起始位置: 应用键值对[1].起始位置,
        容量: 临时应用.容量,
        颜色: 程序颜色,
      });
      添加内存分配示意(应用键值对);
    } else {
      console.warn(`应用 ${临时应用.名称} 内存分配失败，容量: ${临时应用.容量}`);
    }
  }
  
  // 移除这里的Canvas重绘，由调用方负责
}

function 获取16进制内存地址(内存地址_10进制, 内存位数) {
  const 内存地址_16进制 = 内存地址_10进制.toString(16);
  return `${"0".repeat(内存位数 / 4 - 内存地址_16进制.length)}${内存地址_16进制}`;
}

function 向内存中添加应用(应用键值对) {
  //键：应用名称
  //值：{起始位置，容量}
  const 新的空闲内存表 = [];
  const 应用占用内存 = 应用键值对[1].容量;
  let 已分配内存 = false;
  
  // 找到所有足够大的空闲内存块
  const 可用内存块索引列表 = [];
  for (let i = 0; i < 空闲内存表.length; i++) {
    if (空闲内存表[i].容量 >= 应用占用内存) {
      可用内存块索引列表.push(i);
    }
  }
  
  // 如果没有找到足够大的内存块，返回失败
  if (可用内存块索引列表.length === 0) {
    console.warn(`内存分配失败: 应用 ${应用键值对[0]} 需要 ${应用占用内存} 字节，但最大空闲块只有 ${Math.max(...空闲内存表.map(m => m.容量))} 字节`);
    return false;
  }
  
  // 随机选择一个可用内存块
  const 随机索引 = Math.floor(Math.random() * 可用内存块索引列表.length);
  const 目标内存块索引 = 可用内存块索引列表[随机索引];
  
  // 处理所有空闲内存块
  for (let i = 0; i < 空闲内存表.length; i++) {
    if (i === 目标内存块索引) {
      // 在目标内存块中分配内存
      const 最高位置 = 空闲内存表[i].起始位置 + 空闲内存表[i].容量 - 应用占用内存;
      const 最低位置 = 空闲内存表[i].起始位置;
      const 起始位置 = Math.floor(Math.random() * (最高位置 - 最低位置 + 1) + 最低位置);
      应用键值对[1].起始位置 = 起始位置;
      
      if (起始位置 === 空闲内存表[i].起始位置) {
        // 应用分配在空闲内存块的开始位置
        空闲内存表[i].起始位置 = 空闲内存表[i].起始位置 + 应用占用内存;
        空闲内存表[i].容量 = 空闲内存表[i].容量 - 应用占用内存;
        新的空闲内存表.push(空闲内存表[i]);
      } else if (起始位置 + 应用占用内存 === 空闲内存表[i].起始位置 + 空闲内存表[i].容量) {
        // 应用分配在空闲内存块的结束位置
        空闲内存表[i].容量 = 空闲内存表[i].容量 - 应用占用内存;
        新的空闲内存表.push(空闲内存表[i]);
      } else {
        // 应用分配在空闲内存块的中间位置
        const 应用前方未占用内存 = {
          起始位置: 空闲内存表[i].起始位置,
          容量: 起始位置 - 空闲内存表[i].起始位置,
        };
        const 应用后方未占用内存 = {
          起始位置: 起始位置 + 应用占用内存,
          容量: 空闲内存表[i].起始位置 + 空闲内存表[i].容量 - (起始位置 + 应用占用内存),
        };
        新的空闲内存表.push(应用前方未占用内存);
        新的空闲内存表.push(应用后方未占用内存);
      }
      已分配内存 = true;
    } else {
      // 其他内存块保持不变
      新的空闲内存表.push(空闲内存表[i]);
    }
  }
  
  空闲内存表 = 新的空闲内存表;
  
  // 对空闲内存表进行合并优化，避免碎片化
  空闲内存表 = 合并相邻空闲内存块(空闲内存表);
  
  return 已分配内存;
}

// 新增：合并相邻的空闲内存块
function 合并相邻空闲内存块(空闲内存表) {
  if (空闲内存表.length <= 1) {
    return 空闲内存表;
  }
  
  // 按起始位置排序
  空闲内存表.sort((a, b) => a.起始位置 - b.起始位置);
  
  const 合并后的空闲内存表 = [];
  let 当前块 = { ...空闲内存表[0] };
  
  for (let i = 1; i < 空闲内存表.length; i++) {
    const 下一块 = 空闲内存表[i];
    
    // 检查是否相邻
    if (当前块.起始位置 + 当前块.容量 === 下一块.起始位置) {
      // 合并相邻块
      当前块.容量 += 下一块.容量;
    } else {
      // 不相邻，保存当前块并开始新块
      合并后的空闲内存表.push(当前块);
      当前块 = { ...下一块 };
    }
  }
  
  // 添加最后一个块
  合并后的空闲内存表.push(当前块);
  
  return 合并后的空闲内存表;
}

function 添加内存分配区开关() {
  if (内存分配区.querySelector("#内存分配区开关") !== null) return;
  const 内存分配区开关 = document.createElement("button");
  内存分配区开关.className = "按钮";
  内存分配区开关.id = "内存分配区开关";
  内存分配区开关.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
  内存分配区开关.addEventListener("click", () => {
    内存分配区.classList.toggle("可见");
    if (内存分配区.classList.contains("可见")) {
      内存分配区开关.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
    } else {
      内存分配区开关.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
    }
  });
  内存分配区.appendChild(内存分配区开关);
  return 内存分配区开关;
}

function 添加内存分配示意(程序) {
  添加内存分配区开关();

  const 内存分配分区 = document.createElement("div");
  内存分配分区.className = "内存分配分区";
  内存分配分区.setAttribute("程序名称", 程序[0]);
  内存分配区.appendChild(内存分配分区);

  const 内存分配颜色名称与容量 = document.createElement("h4");
  const 内存分配颜色与名称 = document.createElement("span");
  内存分配颜色与名称.className = "内存分配颜色与名称";
  内存分配颜色名称与容量.className = "内存分配颜色名称与容量";
  const 名称颜色 = document.createElement("span");
  名称颜色.className = "名称颜色";
  名称颜色.style.backgroundColor = 程序[1].颜色 || 程序颜色;
  const 名称文本 = document.createElement("span");
  名称文本.className = "名称文本";
  名称文本.textContent = 程序[0];
  内存分配颜色与名称.append(名称颜色, 名称文本);
  const 内存分配容量 = document.createElement("span");
  内存分配容量.className = "内存分配容量";
  内存分配容量.textContent = `${程序[1].容量}`;
  内存分配颜色名称与容量.append(内存分配颜色与名称, 内存分配容量);

  const 内存分配数据 = document.createElement("div");
  内存分配数据.className = "内存分配数据";
  const 内存分配地址 = document.createElement("span");
  内存分配地址.className = "内存分配地址";
  
  const 起始内存地址_16进制 = 获取16进制内存地址(内存起始地址_10进制 + 程序[1].起始位置, 内存位数);
  const 结束内存地址_16进制 = 获取16进制内存地址(内存起始地址_10进制 + 程序[1].起始位置 + 程序[1].容量 - 1, 内存位数);
  
  const 起始地址前缀 = document.createElement("span");
  起始地址前缀.className = "地址前缀";
  起始地址前缀.textContent = "0x";
  const 结束地址前缀 = document.createElement("span");
  结束地址前缀.className = "地址前缀";
  结束地址前缀.textContent = "0x";
  const 内存分配起始地址 = document.createElement("span");
  内存分配起始地址.className = "内存分配起始地址";
  内存分配起始地址.textContent = 起始内存地址_16进制;
  const 内存分配结束地址 = document.createElement("span");
  内存分配结束地址.className = "内存分配结束地址";
  内存分配结束地址.textContent = 结束内存地址_16进制;
  const 内存地址连接线 = document.createElement("span");
  内存地址连接线.className = "内存地址连接线";
  内存地址连接线.textContent = "~";
  内存分配地址.append(起始地址前缀, 内存分配起始地址, 内存地址连接线, 结束地址前缀, 内存分配结束地址);
  内存分配数据.appendChild(内存分配地址);

  内存分配分区.append(内存分配颜色名称与容量, 内存分配数据);

  内存分配分区.addEventListener("mouseenter", () => {
    内存渲染器.设置当前应用(程序[0]);
    const 当前内存分配分区 = 内存分配区.querySelector(`[程序名称="${程序[0]}"]`);
    当前内存分配分区.classList.add("当前内存分配分区");
    
    // 确保Canvas立即重绘以显示应用抬头的高亮效果
    内存渲染器.强制重绘();
  });

  内存分配分区.addEventListener("mousemove", () => {
    // 当鼠标在内存分配分区上移动时，立即清除Canvas的悬停状态
    if (内存渲染器.悬停索引 !== -1) {
      内存渲染器.悬停索引 = -1;
      内存渲染器.需要重绘 = true;
      内存渲染器.重绘();
      内存渲染器.隐藏悬停提示();
    }
  });

  内存分配分区.addEventListener("mouseleave", (e) => {
    // 只有当鼠标没有移动到Canvas上时，才清除当前应用
    if (!内存渲染器.移动到Canvas) {
      内存渲染器.清除当前应用();
      const 当前内存分配分区 = 内存分配区.querySelector(`[程序名称="${程序[0]}"]`);
      当前内存分配分区.classList.remove("当前内存分配分区");
    }
  });
}

function 生成随机颜色() {
  const red = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  return `rgba(${red},${blue},${green},0.75)`;
}

function 生成随机深色() {
  const r = Math.floor(Math.random() * 128); // 0-127 (darker red)
  const g = Math.floor(Math.random() * 128); // 0-127 (darker green)
  const b = Math.floor(Math.random() * 128); // 0-127 (darker blue)
  return `rgb(${r}, ${g}, ${b})`;
}

function 数组洗牌(数组) {
  for (let i = 数组.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [数组[i], 数组[j]] = [数组[j], 数组[i]];
  }
  return 数组;
}

const 代码输入区 = document.querySelector(".代码输入区");
const 代码输入框组 = 代码输入区.querySelectorAll('input[type="text"]');
const 自定义应用键值对组 = [null, null];
let 之前值长度 = 0;

// 红色警告样式
const 红色警告样式 = document.createElement('style');
红色警告样式.textContent = `
  .红色警告 {
    background-color: #8b0000 !important;
    outline: solid 1px #ff0000 !important;
  }
`;
document.head.appendChild(红色警告样式);

// 红色警告函数
function 执行红色警告(标识符框1, 标识符框2) {
  标识符框1.classList.add('红色警告');
  标识符框2.classList.add('红色警告');
}

// 清除红色警告函数
function 清除红色警告(标识符框1, 标识符框2) {
  标识符框1.classList.remove('红色警告');
  标识符框2.classList.remove('红色警告');
}

// 检查标识符冲突
function 检查标识符冲突(标识符1, 标识符2) {
  const 第一个标识符框 = document.querySelector('#标识符-1');
  const 第二个标识符框 = document.querySelector('#标识符-2');
  
  if (标识符1 && 标识符2 && 标识符1 === 标识符2) {
    执行红色警告(第一个标识符框, 第二个标识符框);
    return true; // 有冲突
  } else {
    // 如果没有冲突，清除警告
    清除红色警告(第一个标识符框, 第二个标识符框);
    return false; // 无冲突
  }
}

// 检查类型是否有效
function 检查类型有效性(类型, 类型框) {
  if (类型 && !变量类型表.has(类型)) {
    执行红色警告(类型框, 类型框); // 对同一个框执行警告
    return false; // 无效类型
  } else {
    // 如果类型有效，清除警告
    清除红色警告(类型框, 类型框);
    return true; // 有效类型
  }
}

// 检查值类型有效性
function 检查值类型有效性(值, 类型, 值框) {
  if (!值 || !类型 || !变量类型表.has(类型)) {
    清除红色警告(值框, 值框);
    return true;
  }
  let 合法 = false;
  if (/^(unsigned )?(int|short|long long)$/.test(类型)) {
    // 整数类型
    合法 = /^-?\d+$/.test(值);
  } else if (/^(unsigned )?(float|double)$/.test(类型)) {
    // 浮点类型
    合法 = /^-?\d+(\.\d+)?$/.test(值);
  } else if (/^(char ?\*)$/.test(类型)) {
    // char* 字符串，单引号或双引号包裹
    合法 = /^(['"]).*\1$/.test(值);
  } else if (/^(int|short|long long|float|double) ?\*$/.test(类型)) {
    // 其它指针类型，允许16进制/10进制数字或NULL
    合法 = /^0x[0-9a-fA-F]+$/.test(值) || /^-?\d+$/.test(值) || /^NULL$/i.test(值);
  } else if (/^char$/.test(类型)) {
    // char类型，单字符单引号
    合法 = /^'.{1}'$/.test(值);
  } else {
    合法 = true; // 其它类型默认不校验
  }
  if (!合法) {
    执行红色警告(值框, 值框);
    return false;
  } else {
    清除红色警告(值框, 值框);
    return true;
  }
}

for (const 代码输入框 of 代码输入框组) {
  // 为每个分区分别记录上一次值类型有效
  let 上一次值类型有效_0 = true;
  let 上一次值类型有效_1 = true;
  代码输入框.addEventListener("input", (event) => {
    const 自定义代码索引 = 代码输入框.parentElement.parentElement.getAttribute("自定义代码索引");
    const 是第一个分区 = 自定义代码索引 === "0";
    const 是第二个分区 = 自定义代码索引 === "1";
    
    if (是第一个分区) {
      const 类型框 = 代码输入框.parentElement.querySelector(".类型框");
      const 标识符框 = 代码输入框.parentElement.querySelector(".标识符框");
      const 值框 = 代码输入框.parentElement.querySelector(".值框");
      const 类型 = 类型框.value.trim();
      const 标识符 = 标识符框.value.trim();
      const 值 = 值框.value.trim();
      
      // 检查类型有效性
      const 类型有效 = 检查类型有效性(类型, 类型框);
      const 类型正确 = 类型.length > 0 && 类型有效;
      
      // 检查值类型有效性
      const 值类型有效 = 检查值类型有效性(值, 类型, 值框);
      const 值正确 = 值.length > 0 && 值类型有效;
      
      const 值由错到对 = !上一次值类型有效_0 && 值类型有效;
      
      const 标识符包含无效字符 = [...标识符].some((字符) => 无效标识符字符表.has(字符));
      const 标识符有字 = 标识符.length > 0;
      const 标识符正确 = !无效标识符起始字符表.has(标识符[0]) && !标识符包含无效字符;
      const 代码内容正确 = 类型正确 && 标识符有字 && 标识符正确 && 值正确;
      const 输入值 = 值.length !== 之前值长度;
      const 从零输入值 = 值.length === 1 && 值.length > 之前值长度;

      if (!标识符有字 || 标识符正确) {
        标识符框.classList.remove("错误");
      } else {
        标识符框.classList.add("错误");
      }

      if (!代码内容正确) {
        从内存中删除应用(自定义应用键值对组[自定义代码索引]);
        自定义应用键值对组[自定义代码索引] = null;
      } else {
        const 类型容量 = 变量类型表.get(类型).长度;
        const 有符号 = 变量类型表.get(类型).有符号;
        const 输入类型或标识符 = 代码输入框.id.includes("类型") || 代码输入框.id.includes("标识符");
        if (输入类型或标识符) {
          从内存中删除应用(自定义应用键值对组[自定义代码索引]);
        }

        if (输入类型或标识符 || 从零输入值 || 值由错到对) {
          const 随机颜色 = 生成随机深色();
          自定义应用键值对组[自定义代码索引] = [标识符, { 起始位置: 0, 容量: 类型容量, 颜色: 随机颜色 }];
          const 已分配内存 = 向内存中添加应用(自定义应用键值对组[自定义代码索引]);
          if (已分配内存) {
            内存占用表.set(标识符, {
              起始位置: 自定义应用键值对组[自定义代码索引][1].起始位置,
              容量: 类型容量,
              值: 值,
              有符号: 有符号,
              颜色: 随机颜色,
            });
            添加内存分配示意(自定义应用键值对组[自定义代码索引]);
          }
        } else if (输入值) {
          const 内存数据 = 内存占用表.get(标识符);
          if (内存数据) {
            内存数据.值 = 值;
          }
        }

        生成当前应用内存位数据(标识符);

        const 值类型是字符串 = Number.isNaN(parseInt(值, 10));
        if (值类型是字符串) {
          const 字符串正确 = 值.length > 1 && 值[0] === '"' && 值[值.length - 1] === '"';
        }
      }
      之前值长度 = 值.length;
      上一次值类型有效_0 = 值类型有效;
      // 重绘Canvas
      if (内存渲染器) {
        内存渲染器.强制重绘();
      }
    } else if (是第二个分区) {
      // 第二个代码输入分区的逻辑
      const 类型框 = 代码输入框.parentElement.querySelector(".类型框");
      const 标识符框 = 代码输入框.parentElement.querySelector(".标识符框");
      const 值框 = 代码输入框.parentElement.querySelector(".值框");
      const 类型 = 类型框.value.trim();
      const 标识符 = 标识符框.value.trim();
      const 值 = 值框.value.trim();
      
      // 获取第一个代码输入分区的标识符
      const 第一个标识符框 = document.querySelector('#标识符-1');
      const 第一个标识符 = 第一个标识符框.value.trim();
      
      // 获取当前作用（初始化或更改）
      const 作用单选框 = 代码输入框.parentElement.parentElement.querySelector('input[name="作用"]:checked');
      const 当前作用 = 作用单选框.id === '作用-初始化' ? '初始化' : '更改';
      
      // 如果是初始化作用，检查标识符冲突
      if (当前作用 === '初始化') {
        if (检查标识符冲突(第一个标识符, 标识符)) {
          // 清除当前应用，防止覆盖
          从内存中删除应用(自定义应用键值对组[自定义代码索引]);
          自定义应用键值对组[自定义代码索引] = null;
          return; // 停止执行后续逻辑，不添加到内存中
        }
      }
      
      // 如果是更改作用，检查标识符是否相同
      if (当前作用 === '更改') {
        if (第一个标识符 && 标识符 && 第一个标识符 !== 标识符) {
          // 标识符不同，显示红色警告
          const 第一个标识符框 = document.querySelector('#标识符-1');
          const 第二个标识符框 = document.querySelector('#标识符-2');
          执行红色警告(第一个标识符框, 第二个标识符框);
          return; // 停止执行后续逻辑，不修改变量值
        } else {
          // 标识符相同，清除警告
          const 第一个标识符框 = document.querySelector('#标识符-1');
          const 第二个标识符框 = document.querySelector('#标识符-2');
          清除红色警告(第一个标识符框, 第二个标识符框);
        }
      }
      
      // 检查类型有效性
      const 类型有效 = 检查类型有效性(类型, 类型框);
      const 类型正确 = 类型.length > 0 && 类型有效;
      
      // 检查值类型有效性
      const 值类型有效 = 检查值类型有效性(值, 类型, 值框);
      const 值正确 = 值.length > 0 && 值类型有效;
      
      const 值由错到对 = !上一次值类型有效_1 && 值类型有效;
      
      const 标识符包含无效字符 = [...标识符].some((字符) => 无效标识符字符表.has(字符));
      const 标识符有字 = 标识符.length > 0;
      const 标识符正确 = !无效标识符起始字符表.has(标识符[0]) && !标识符包含无效字符;
      const 代码内容正确 = 类型正确 && 标识符有字 && 标识符正确 && 值正确;
      const 输入值 = 值.length !== 之前值长度;
      const 从零输入值 = 值.length === 1 && 值.length > 之前值长度;

      if (!标识符有字 || 标识符正确) {
        标识符框.classList.remove("错误");
      } else {
        标识符框.classList.add("错误");
      }

      if (!代码内容正确) {
        从内存中删除应用(自定义应用键值对组[自定义代码索引]);
        自定义应用键值对组[自定义代码索引] = null;
      } else {
        const 类型容量 = 变量类型表.get(类型).长度;
        const 有符号 = 变量类型表.get(类型).有符号;
        const 输入类型或标识符 = 代码输入框.id.includes("类型") || 代码输入框.id.includes("标识符");
        if (输入类型或标识符) {
          从内存中删除应用(自定义应用键值对组[自定义代码索引]);
        }

        if (输入类型或标识符 || 从零输入值 || 值由错到对) {
          const 随机颜色 = 生成随机深色();
          自定义应用键值对组[自定义代码索引] = [标识符, { 起始位置: 0, 容量: 类型容量, 颜色: 随机颜色 }];
          const 已分配内存 = 向内存中添加应用(自定义应用键值对组[自定义代码索引]);
          if (已分配内存) {
            内存占用表.set(标识符, {
              起始位置: 自定义应用键值对组[自定义代码索引][1].起始位置,
              容量: 类型容量,
              值: 值,
              有符号: 有符号,
              颜色: 随机颜色,
            });
            添加内存分配示意(自定义应用键值对组[自定义代码索引]);
          }
        } else if (输入值) {
          const 内存数据 = 内存占用表.get(标识符);
          if (内存数据) {
            内存数据.值 = 值;
          }
        }

        生成当前应用内存位数据(标识符);

        const 值类型是字符串 = Number.isNaN(parseInt(值, 10));
        if (值类型是字符串) {
          const 字符串正确 = 值.length > 1 && 值[0] === '"' && 值[值.length - 1] === '"';
        }
      }
      之前值长度 = 值.length;
      上一次值类型有效_1 = 值类型有效;
      // 重绘Canvas
      if (内存渲染器) {
        内存渲染器.强制重绘();
      }
    }
  });
}

function 从内存中删除应用(自定义应用键值对) {
  if (自定义应用键值对 === null) return;
  const 应用名称 = 自定义应用键值对[0];
  const 应用占用内存 = 自定义应用键值对[1].容量;
  const 当前应用起始位置 = 内存占用表.get(应用名称)?.起始位置 || 0;
  
  // 检查前后是否有其他应用占用
  let 前方有应用 = false;
  let 后方有应用 = false;
  
  for (const [其他应用名称, 其他应用数据] of 内存占用表) {
    if (其他应用名称 === 应用名称) continue;
    
    if (其他应用数据.起始位置 + 其他应用数据.容量 === 当前应用起始位置) {
      前方有应用 = true;
    }
    if (当前应用起始位置 + 应用占用内存 === 其他应用数据.起始位置) {
      后方有应用 = true;
    }
  }
  
  // 检查前后是否有空闲内存
  const 前方空闲内存索引 = 空闲内存表.findIndex((内存) => 内存.起始位置 + 内存.容量 === 当前应用起始位置);
  const 后方空闲内存索引 = 空闲内存表.findIndex((内存) => 内存.起始位置 === 当前应用起始位置 + 应用占用内存);
  
  if (前方有应用 && 后方有应用) {
    // 前后都有应用，创建新的空闲内存块
    const 新空闲内存 = {
      起始位置: 当前应用起始位置,
      容量: 应用占用内存,
    };
    空闲内存表.push(新空闲内存);
  } else if (前方有应用 && 后方空闲内存索引 !== -1) {
    // 前方有应用，后方有空闲内存，合并到后方空闲内存
    空闲内存表[后方空闲内存索引].起始位置 = 当前应用起始位置;
    空闲内存表[后方空闲内存索引].容量 += 应用占用内存;
  } else if (前方空闲内存索引 !== -1 && 后方有应用) {
    // 前方有空闲内存，后方有应用，合并到前方空闲内存
    空闲内存表[前方空闲内存索引].容量 += 应用占用内存;
  } else if (前方空闲内存索引 !== -1 && 后方空闲内存索引 !== -1) {
    // 前后都有空闲内存，合并三个部分
    const 新内存 = {
      起始位置: 空闲内存表[前方空闲内存索引].起始位置,
      容量: 空闲内存表[前方空闲内存索引].容量 + 应用占用内存 + 空闲内存表[后方空闲内存索引].容量,
    };
    // 先删除索引较大的，避免索引变化
    if (前方空闲内存索引 > 后方空闲内存索引) {
      空闲内存表.splice(前方空闲内存索引, 1);
      空闲内存表.splice(后方空闲内存索引, 1);
    } else {
      空闲内存表.splice(后方空闲内存索引, 1);
      空闲内存表.splice(前方空闲内存索引, 1);
    }
    空闲内存表.push(新内存);
  } else {
    // 前后都没有应用或空闲内存，创建新的空闲内存块
    const 新空闲内存 = {
      起始位置: 当前应用起始位置,
      容量: 应用占用内存,
    };
    空闲内存表.push(新空闲内存);
  }

  内存占用表.delete(应用名称);

  const 内存分配分区 = 内存分配区.querySelector(`.内存分配分区[程序名称="${应用名称}"]`);
  内存分配分区?.remove();
  const 应用索引 = 自定义应用键值对组.findIndex((应用) => 应用 === 自定义应用键值对);
  自定义应用键值对组[应用索引] = null;
}

function 生成当前应用内存位数据(应用名称) {
  const 占用 = 内存占用表.get(应用名称);
  if (!占用) return;
  const 占用内存 = 占用.容量;
  const 十进制值 = 占用.值;
  const 数字值 = parseInt(十进制值, 10);
  const 二进制值 = 数字值.toString(2);
  const 位数 = 占用内存 * 8;
}

// 检查并分配代码输入分区内存
function 检查并分配代码输入分区内存() {
  // 检查第一个代码输入分区
  const 第一个类型框 = document.querySelector('#类型-1');
  const 第一个标识符框 = document.querySelector('#标识符-1');
  const 第一个值框 = document.querySelector('#值-1');
  
  if (第一个类型框 && 第一个标识符框 && 第一个值框) {
    const 第一个类型 = 第一个类型框.value.trim();
    const 第一个标识符 = 第一个标识符框.value.trim();
    const 第一个值 = 第一个值框.value.trim();
    
    // 检查第一个分区的输入是否合法
    const 第一个类型有效 = 检查类型有效性(第一个类型, 第一个类型框);
    const 第一个值类型有效 = 检查值类型有效性(第一个值, 第一个类型, 第一个值框);
    const 第一个标识符包含无效字符 = [...第一个标识符].some((字符) => 无效标识符字符表.has(字符));
    const 第一个标识符有字 = 第一个标识符.length > 0;
    const 第一个标识符正确 = !无效标识符起始字符表.has(第一个标识符[0]) && !第一个标识符包含无效字符;
    
    const 第一个分区合法 = 第一个类型.length > 0 && 第一个类型有效 && 
                          第一个标识符有字 && 第一个标识符正确 && 
                          第一个值.length > 0 && 第一个值类型有效;
    
    // 如果第一个分区合法，分配内存
    if (第一个分区合法) {
      const 类型容量 = 变量类型表.get(第一个类型).长度;
      const 有符号 = 变量类型表.get(第一个类型).有符号;
      const 随机颜色 = 生成随机深色();
      
      // 清除之前的应用（如果存在）
      从内存中删除应用(自定义应用键值对组[0]);
      
      自定义应用键值对组[0] = [第一个标识符, { 起始位置: 0, 容量: 类型容量, 颜色: 随机颜色 }];
      const 已分配内存 = 向内存中添加应用(自定义应用键值对组[0]);
      
      if (已分配内存) {
        内存占用表.set(第一个标识符, {
          起始位置: 自定义应用键值对组[0][1].起始位置,
          容量: 类型容量,
          值: 第一个值,
          有符号: 有符号,
          颜色: 随机颜色,
        });
        添加内存分配示意(自定义应用键值对组[0]);
      }
    }
  }
  
  // 检查第二个代码输入分区
  const 第二个类型框 = document.querySelector('#类型-2');
  const 第二个标识符框 = document.querySelector('#标识符-2');
  const 第二个值框 = document.querySelector('#值-2');
  
  if (第二个类型框 && 第二个标识符框 && 第二个值框) {
    const 第二个类型 = 第二个类型框.value.trim();
    const 第二个标识符 = 第二个标识符框.value.trim();
    const 第二个值 = 第二个值框.value.trim();
    
    // 获取第一个代码输入分区的标识符
    const 第一个标识符框 = document.querySelector('#标识符-1');
    const 第一个标识符 = 第一个标识符框 ? 第一个标识符框.value.trim() : '';
    
    // 获取当前作用（初始化或更改）
    const 作用单选框 = document.querySelector('input[name="作用"]:checked');
    const 当前作用 = 作用单选框 && 作用单选框.id === '作用-初始化' ? '初始化' : '更改';
    
    // 检查第二个分区的输入是否合法
    const 第二个类型有效 = 检查类型有效性(第二个类型, 第二个类型框);
    const 第二个值类型有效 = 检查值类型有效性(第二个值, 第二个类型, 第二个值框);
    const 第二个标识符包含无效字符 = [...第二个标识符].some((字符) => 无效标识符字符表.has(字符));
    const 第二个标识符有字 = 第二个标识符.length > 0;
    const 第二个标识符正确 = !无效标识符起始字符表.has(第二个标识符[0]) && !第二个标识符包含无效字符;
    
    let 第二个分区合法 = false;
    
    if (当前作用 === '初始化') {
      // 初始化作用：检查标识符冲突
      const 标识符冲突 = 第一个标识符 && 第二个标识符 && 第一个标识符 === 第二个标识符;
      第二个分区合法 = 第二个类型.length > 0 && 第二个类型有效 && 
                      第二个标识符有字 && 第二个标识符正确 && 
                      第二个值.length > 0 && 第二个值类型有效 && !标识符冲突;
    } else if (当前作用 === '更改') {
      // 更改作用：检查标识符是否相同，需要检查第一个分区的类型是否有效
      const 标识符相同 = 第一个标识符 && 第二个标识符 && 第一个标识符 === 第二个标识符;
      const 第一个类型 = 第一个类型框 ? 第一个类型框.value.trim() : '';
      const 第一个类型有效 = 第一个类型 && 变量类型表.has(第一个类型);
      const 第二个值类型有效 = 检查值类型有效性(第二个值, 第一个类型, 第二个值框);
      第二个分区合法 = 第二个标识符有字 && 第二个标识符正确 && 
                      第二个值.length > 0 && 标识符相同 && 第一个类型有效 && 第二个值类型有效;
    }
    
    // 如果第二个分区合法，分配内存
    if (第二个分区合法) {
      let 类型容量, 有符号;
      
      if (当前作用 === '初始化') {
        // 初始化作用：使用第二个分区的类型
        类型容量 = 变量类型表.get(第二个类型).长度;
        有符号 = 变量类型表.get(第二个类型).有符号;
      } else if (当前作用 === '更改') {
        // 更改作用：使用第一个分区的类型
        const 第一个类型 = 第一个类型框 ? 第一个类型框.value.trim() : '';
        类型容量 = 变量类型表.get(第一个类型).长度;
        有符号 = 变量类型表.get(第一个类型).有符号;
      }
      
      const 随机颜色 = 生成随机深色();
      
      // 清除之前的应用（如果存在）
      从内存中删除应用(自定义应用键值对组[1]);
      
      自定义应用键值对组[1] = [第二个标识符, { 起始位置: 0, 容量: 类型容量, 颜色: 随机颜色 }];
      const 已分配内存 = 向内存中添加应用(自定义应用键值对组[1]);
      
      if (已分配内存) {
        内存占用表.set(第二个标识符, {
          起始位置: 自定义应用键值对组[1][1].起始位置,
          容量: 类型容量,
          值: 第二个值,
          有符号: 有符号,
          颜色: 随机颜色,
        });
        添加内存分配示意(自定义应用键值对组[1]);
      }
    }
  }
}

重置按钮.addEventListener("click", () => {
  const 输入框组 = document.querySelectorAll('input[type="text"]');
  for (const 输入框 of 输入框组) {
    输入框.value = "";
  }
  输入框组[0].focus();
  for (const 自定义应用键值对 of 自定义应用键值对组) {
    if (自定义应用键值对 === null) continue;
    从内存中删除应用(自定义应用键值对);
  }
  之前值长度 = 0;

  内存起始地址_10进制 = Math.floor(Math.random() * 300000000);
  空闲内存表 = [{ 起始位置: 0, 容量: 内存容量 }];
  初始化内存();
  
  // 检查代码输入分区的输入并分配内存（重置后应该没有合法的输入）
  检查并分配代码输入分区内存();
  
  // 确保Canvas在重置后立即重绘
  setTimeout(() => {
    if (内存渲染器) {
      内存渲染器.强制重绘();
    }
  }, 0);
});

// 初始化
function 初始化() {
  内存渲染器 = new 内存Canvas渲染器(内存Canvas);
  初始化内存();
  
  // 检查代码输入分区的输入并分配内存
  检查并分配代码输入分区内存();
  
  // 为整个内存分配区添加mouseenter和mouseleave事件监听器
  内存分配区.addEventListener("mouseenter", () => {
    内存渲染器.移动到内存分配区 = true;
  });
  
  内存分配区.addEventListener("mouseleave", () => {
    内存渲染器.移动到内存分配区 = false;
  });
  
  // 为整个内存分配区添加mousemove事件监听器
  内存分配区.addEventListener("mousemove", () => {
    // 当鼠标在内存分配区上移动时，立即清除Canvas的悬停状态
    if (内存渲染器.悬停索引 !== -1) {
      内存渲染器.悬停索引 = -1;
      内存渲染器.需要重绘 = true;
      内存渲染器.重绘();
      内存渲染器.隐藏悬停提示();
    }
  });
  
  // 确保Canvas在初始化后立即重绘
  setTimeout(() => {
    if (内存渲染器) {
      内存渲染器.强制重绘();
    }
  }, 0);
}

// 窗口大小改变时重新计算Canvas尺寸
window.addEventListener('resize', () => {
  if (内存渲染器) {
    内存渲染器.初始化Canvas();
    内存渲染器.强制重绘();
  }
});

// 初始化应用
document.addEventListener('DOMContentLoaded', 初始化);
