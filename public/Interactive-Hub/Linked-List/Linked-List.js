class 链表可视化 {
  constructor() {
    this.canvas = document.querySelector('.展示区 canvas');
    this.ctx = this.canvas.getContext('2d');
    this.devicePixelRatio = window.devicePixelRatio || 1;
    
    // 链表数据
    this.链表类型 = '单向链表'; // 默认单向链表
    this.节点数组 = [];
    this.拖拽的节点 = null;
    this.拖拽偏移 = { x: 0, y: 0 };
    
    // 颜色配置
    this.颜色 = {
      节点背景: '#1d2738',
      节点边框: '#4a5568',
      节点文字: '#ffffff',
      连线: '#a0aec0',
      指针文字: '#ff6b6b',
      head标签: '#ff6b6b',
      控制区背景: 'rgba(40, 40, 40, 0.95)',
      控制区边框: '#555',
      字段名称: '#a0aec0',
      姓名值: '#ffffff',
      年龄值: '#ffffff',
      内存地址值: '#ffd700',
      next值: '#ff6b6b',
      previous值: '#00d4aa',
      删除按钮: '#dd3747',
      删除按钮悬停: '#ff3742'
    };
    
    // 节点配置
    this.节点配置 = {
      宽度: 200,
      圆角: 10,
      间距: 250
    };
    
    // 动画相关
    this.删除动画 = {
      正在删除: false,
      删除的节点: null,
      动画开始时间: 0,
      动画持续时间: 1000, // 1秒总时长
      连线过渡时间: 350, // 线条过渡时间500ms
      过渡动画: null
    };
    
    // 字体
    this.字体 = '"JetBrains Mono", "Noto Sans SC", Consolas, monospace';
    
    this.初始化Canvas();
    this.设置事件监听();
    this.创建控制区();
    this.绘制();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.初始化Canvas();
      this.绘制();
    });
  }
  
  初始化Canvas() {
    // 设置Canvas尺寸为视口大小
    this.canvas.width = window.innerWidth * this.devicePixelRatio;
    this.canvas.height = (window.innerHeight - 50) * this.devicePixelRatio;
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    
    // 设置Canvas样式
    this.canvas.style.border = 'none';
    this.canvas.style.borderRadius = '0';
  }
  
  设置事件监听() {
    this.canvas.addEventListener('mousedown', (e) => this.处理鼠标按下(e));
    this.canvas.addEventListener('mousemove', (e) => this.处理鼠标移动(e));
    this.canvas.addEventListener('mouseup', () => this.处理鼠标松开());
    
    // 全局鼠标事件，确保拖拽状态持续
    document.addEventListener('mousemove', (e) => {
      if (this.拖拽的节点) {
        this.处理鼠标移动(e);
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (this.拖拽的节点) {
        this.处理鼠标松开();
      }
    });
    
    // 鼠标悬停事件
    this.canvas.addEventListener('mousemove', (e) => {
      this.处理鼠标悬停(e);
    });
  }
  
  创建控制区() {
    const 控制区 = document.querySelector('.控制区');
    控制区.innerHTML = `
      <div class="控制面板">
        <div class="控制组">
          <label>链表类型：</label>
          <div class="radio组">
            <label class="radio标签">
              <input type="radio" name="链表类型" value="单向链表" checked>
              <span class="radio文本">单向链表</span>
            </label>
            <label class="radio标签">
              <input type="radio" name="链表类型" value="双向链表">
              <span class="radio文本">双向链表</span>
            </label>
          </div>
        </div>
        <div class="控制组">
          <button id="添加节点按钮">添加节点</button>
        </div>
      </div>
    `;
    
    // 绑定事件
    document.querySelectorAll('input[name="链表类型"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.链表类型 = e.target.value;
        this.更新节点指针();
        this.绘制();
      });
    });
    
    document.getElementById('添加节点按钮').addEventListener('click', () => {
      this.添加节点();
    });
    
    // 为重置按钮添加功能
    document.querySelector('.重置按钮').addEventListener('click', () => {
      this.重置();
    });
  }
  
  生成随机姓名() {
    const 姓氏 = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
    const 名字 = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英'];
    return 姓氏[Math.floor(Math.random() * 姓氏.length)] + 名字[Math.floor(Math.random() * 名字.length)];
  }
  
  生成随机内存地址() {
    // 生成32位十六进制地址
    const 地址 = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase();
    return '0x' + 地址.padStart(8, '0');
  }
  
  添加节点() {
    // 计算Canvas可视区域
    const canvas宽度 = this.canvas.width / this.devicePixelRatio;
    const canvas高度 = this.canvas.height / this.devicePixelRatio;
    
    // 计算新节点的位置
    let x, y;
    
      // 计算节点高度
    const 节点行高 = 22;
    const 顶部边距 = 25;
    const 底部边距 = 15;
    const 字段数量 = this.链表类型 === '双向链表' ? 4 : 3;
    const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;
    
    if (this.节点数组.length === 0) {
      // 第一个节点，放在Canvas偏左上角位置
      x = 150;
      y = 250;
    } else {
      // 获取最后一个节点的位置
      const 最后一个节点 = this.节点数组[this.节点数组.length - 1];
      const 新节点X = 最后一个节点.x + this.节点配置.间距;
      
      // 检查新节点是否会超出Canvas右边界
      if (新节点X + this.节点配置.宽度 > canvas宽度 - 50) {
        // 如果会超出，则换行到下一行
        const 行数 = Math.floor(this.节点数组.length / 3); // 每行最多3个节点
        const 列数 = this.节点数组.length % 3;
        x = 100 + 列数 * this.节点配置.间距;
        y = 100 + 行数 * (节点高度 + 50);
      } else {
        // 不会超出，放在最后一个节点的右边
        x = 新节点X;
        y = 最后一个节点.y;
      }
      
      // 确保节点不会超出Canvas边界
      x = Math.max(50, Math.min(x, canvas宽度 - this.节点配置.宽度 - 50));
      y = Math.max(50, Math.min(y, canvas高度 - 节点高度 - 50));
    }
    
    const 新节点 = {
      id: Date.now() + Math.random(),
      姓名: this.生成随机姓名(),
      年龄: Math.floor(Math.random() * 120) + 1,
      内存地址: this.生成随机内存地址(),
      x: x,
      y: y,
      next: null,
      previous: null
    };
    
    this.节点数组.push(新节点);
    this.更新节点指针();
    this.绘制();
  }
  
  更新节点指针() {
    // 清空所有指针
    this.节点数组.forEach(节点 => {
      节点.next = null;
      节点.previous = null;
    });
    
    // 重新建立指针关系
    for (let i = 0; i < this.节点数组.length - 1; i++) {
      this.节点数组[i].next = this.节点数组[i + 1];
      if (this.链表类型 === '双向链表') {
        this.节点数组[i + 1].previous = this.节点数组[i];
      }
    }
  }
  
  重置() {
    // 清空节点数组
    this.节点数组 = [];
        
    // 清理动画状态
    this.删除动画.正在删除 = false;
    this.删除动画.删除的节点 = null;
    this.删除动画.过渡动画 = null;
    
    // 重新绘制
    this.绘制();
  }
  
  处理鼠标按下(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / this.devicePixelRatio / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / this.devicePixelRatio / rect.height);
    
    // 检查是否点击了删除按钮
    for (let i = this.节点数组.length - 1; i >= 0; i--) {
      const 节点 = this.节点数组[i];
      if (this.点击在删除按钮内(x, y, 节点)) {
        this.删除节点(i);
        return;
      }
    }
    
    // 检查是否点击了节点
    for (let i = this.节点数组.length - 1; i >= 0; i--) {
      const 节点 = this.节点数组[i];
      if (this.点击在节点内(x, y, 节点)) {
        this.拖拽的节点 = 节点;
        this.拖拽偏移.x = x - 节点.x;
        this.拖拽偏移.y = y - 节点.y;
        this.canvas.style.cursor = 'grabbing';
        break;
      }
    }
  }
  
  处理鼠标移动(e) {
    if (!this.拖拽的节点) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / this.devicePixelRatio / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / this.devicePixelRatio / rect.height);
    
    this.拖拽的节点.x = x - this.拖拽偏移.x;
    this.拖拽的节点.y = y - this.拖拽偏移.y;
    
    this.绘制();
  }
  
  处理鼠标松开() {
    this.拖拽的节点 = null;
    // 恢复默认鼠标样式
    this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
  }
  
  点击在节点内(x, y, 节点) {
    // 计算节点高度
    const 节点行高 = 22;
    const 顶部边距 = 25;
    const 底部边距 = 15;
    const 字段数量 = this.链表类型 === '双向链表' ? 4 : 3;
    const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;
    
    return x >= 节点.x && x <= 节点.x + this.节点配置.宽度 &&
           y >= 节点.y && y <= 节点.y + 节点高度;
  }
  
  点击在删除按钮内(x, y, 节点) {
    const 按钮大小 = 25;
    const 按钮X = 节点.x + this.节点配置.宽度 - 按钮大小/2 - 5; // 顶在右上角，向内5px
    const 按钮Y = 节点.y + 按钮大小/2 + 5; // 顶在右上角，向下5px
    return x >= 按钮X - 按钮大小/2 && x <= 按钮X + 按钮大小/2 &&
           y >= 按钮Y - 按钮大小/2 && y <= 按钮Y + 按钮大小/2;
  }
  
  处理鼠标悬停(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / this.devicePixelRatio / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / this.devicePixelRatio / rect.height);
    
    // 检查鼠标是否悬停在删除按钮上
    let 悬停在删除按钮 = false;
    for (let i = this.节点数组.length - 1; i >= 0; i--) {
      const 节点 = this.节点数组[i];
      if (this.点击在删除按钮内(x, y, 节点)) {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
        悬停在删除按钮 = true;
        this.悬停的节点 = 节点; // 设置悬停的节点，这样删除按钮会显示
        break;
      }
    }
    
    // 检查鼠标是否悬停在节点上
    if (!悬停在删除按钮) {
      this.悬停的节点 = null;
      for (let i = this.节点数组.length - 1; i >= 0; i--) {
        const 节点 = this.节点数组[i];
        if (this.点击在节点内(x, y, 节点)) {
          this.悬停的节点 = 节点;
          this.canvas.style.cursor = 'grab';
          break;
        }
      }
    }
    
    // 如果既不在删除按钮上也不在节点上，恢复默认样式
    if (!悬停在删除按钮 && !this.悬停的节点) {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
    }
    
    this.绘制();
  }
  
  删除节点(索引) {
    if (this.删除动画.正在删除) return; // 防止重复删除
    
    const 要删除的节点 = this.节点数组[索引];
    const 前一个节点 = 索引 > 0 ? this.节点数组[索引 - 1] : null;
    const 后一个节点 = 索引 < this.节点数组.length - 1 ? this.节点数组[索引 + 1] : null;
    
    // 开始删除动画
    this.删除动画.正在删除 = true;
    this.删除动画.删除的节点 = 要删除的节点;
    this.删除动画.动画开始时间 = Date.now();
    // 计算节点高度
    const 节点行高 = 22;
    const 顶部边距 = 25;
    const 底部边距 = 15;
    const 字段数量 = this.链表类型 === '双向链表' ? 4 : 3;
    const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;
    
    this.删除动画.过渡动画 = {
      前一个节点: 前一个节点,
      后一个节点: 后一个节点,
      原始起点: 前一个节点 ? { x: 前一个节点.x + this.节点配置.宽度, y: 前一个节点.y + 节点高度 / 2 } : null,
      原始终点: 要删除的节点 ? { x: 要删除的节点.x, y: 要删除的节点.y + 节点高度 / 2 } : null,
      目标起点: 前一个节点 ? { x: 前一个节点.x + this.节点配置.宽度, y: 前一个节点.y + 节点高度 / 2 } : null,
      目标终点: 后一个节点 ? { x: 后一个节点.x, y: 后一个节点.y + 节点高度 / 2 } : null,
      要删除的节点: 要删除的节点
    };
    
    // 先不删除节点，等动画完成后再删除
    // this.节点数组.splice(索引, 1);
    // this.更新节点指针();
    
    // 开始动画循环
    this.执行删除动画();
  }
  
  执行删除动画() {
    if (!this.删除动画.正在删除) return;
    
    const 当前时间 = Date.now();
    const 经过时间 = 当前时间 - this.删除动画.动画开始时间;
    const 连线进度 = Math.min(经过时间 / this.删除动画.连线过渡时间, 1);
    
    if (连线进度 < 1) {
      // 继续动画
      this.绘制();
      requestAnimationFrame(() => this.执行删除动画());
    } else {
      // 动画完成，现在删除节点
      const 要删除的节点索引 = this.节点数组.findIndex(节点 => 节点 === this.删除动画.删除的节点);
      if (要删除的节点索引 !== -1) {
        this.节点数组.splice(要删除的节点索引, 1);
        this.更新节点指针();
      }
      
      // 清理动画状态
      this.删除动画.正在删除 = false;
      this.删除动画.删除的节点 = null;
      this.删除动画.过渡动画 = null;
      this.绘制();
    }
  }
  
  绘制() {
    // 清空Canvas
    this.ctx.clearRect(0, 0, this.canvas.width / this.devicePixelRatio, this.canvas.height / this.devicePixelRatio);
    
    // 绘制连线
    this.绘制连线();
    
    // 绘制节点
    this.节点数组.forEach((节点, 索引) => {
      this.绘制节点(节点, 索引);
    });
  }
  
  绘制连线() {
    this.ctx.strokeStyle = this.颜色.连线;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    
    // 绘制正常的连线
    for (let i = 0; i < this.节点数组.length - 1; i++) {
      const 当前节点 = this.节点数组[i];
      const 下一个节点 = this.节点数组[i + 1];
      
      // 检查是否在删除动画中且当前连线需要特殊处理
      if (this.删除动画.正在删除 && this.删除动画.过渡动画) {
        const 动画 = this.删除动画.过渡动画;
        // 如果是前一个节点到要删除的节点的连线，跳过正常绘制（由过渡动画处理）
        if (当前节点 === 动画.前一个节点 && 下一个节点 === 动画.要删除的节点) {
          continue;
        }
        // 如果是删除的节点到后一个节点的连线，跳过正常绘制
        if (当前节点 === 动画.要删除的节点 && 下一个节点 === 动画.后一个节点) {
          continue;
        }
      }
      
      // 计算节点高度
      const 节点行高 = 22;
      const 顶部边距 = 25;
      const 底部边距 = 15;
      const 字段数量 = this.链表类型 === '双向链表' ? 4 : 3;
      const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;
      
      // 计算连线起点和终点
      const 起点X = 当前节点.x + this.节点配置.宽度;
      const 起点Y = 当前节点.y + 节点高度 / 2;
      const 终点X = 下一个节点.x;
      const 终点Y = 下一个节点.y + 节点高度 / 2;
      
      // 绘制贝塞尔曲线
      this.ctx.beginPath();
      this.ctx.moveTo(起点X, 起点Y);
      
      // 控制点
      const 控制点1X = 起点X + (终点X - 起点X) * 0.3;
      const 控制点1Y = 起点Y;
      const 控制点2X = 终点X - (终点X - 起点X) * 0.3;
      const 控制点2Y = 终点Y;
      
      this.ctx.bezierCurveTo(控制点1X, 控制点1Y, 控制点2X, 控制点2Y, 终点X, 终点Y);
      this.ctx.stroke();
      
      // 绘制箭头
      this.绘制箭头(终点X, 终点Y, 控制点2X, 控制点2Y);
      
      // 如果是双向链表，绘制反向箭头
      if (this.链表类型 === '双向链表') {
        this.绘制反向箭头(起点X, 起点Y, 控制点1X, 控制点1Y);
      }
    }
    
    // 绘制删除动画中的过渡连线
    if (this.删除动画.正在删除 && this.删除动画.过渡动画) {
      const 动画 = this.删除动画.过渡动画;
      const 当前时间 = Date.now();
      const 经过时间 = 当前时间 - this.删除动画.动画开始时间;
      const 连线进度 = Math.min(经过时间 / this.删除动画.连线过渡时间, 1); // 500ms用于连线过渡
      
      if (连线进度 < 1 && 动画.前一个节点 && 动画.后一个节点) {
        // 计算节点高度
        const 节点行高 = 22;
        const 顶部边距 = 25;
        const 底部边距 = 15;
        const 字段数量 = this.链表类型 === '双向链表' ? 4 : 3;
        const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;
        
        // 计算过渡中的起点和终点
        const 起点X = 动画.原始起点.x + (动画.目标起点.x - 动画.原始起点.x) * 连线进度;
        const 起点Y = 动画.原始起点.y + (动画.目标起点.y - 动画.原始起点.y) * 连线进度;
        const 终点X = 动画.原始终点.x + (动画.目标终点.x - 动画.原始终点.x) * 连线进度;
        const 终点Y = 动画.原始终点.y + (动画.目标终点.y - 动画.原始终点.y) * 连线进度;
        
        // 绘制过渡连线
        this.ctx.strokeStyle = this.颜色.连线;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(起点X, 起点Y);
        
        // 控制点 - 贝塞尔曲线参数也随进度变化
        const 控制点1X = 起点X + (终点X - 起点X) * 0.3;
        const 控制点1Y = 起点Y;
        const 控制点2X = 终点X - (终点X - 起点X) * 0.3;
        const 控制点2Y = 终点Y;
        
        this.ctx.bezierCurveTo(控制点1X, 控制点1Y, 控制点2X, 控制点2Y, 终点X, 终点Y);
        this.ctx.stroke();
        
        // 绘制箭头
        this.绘制箭头(终点X, 终点Y, 控制点2X, 控制点2Y);
        
        // 如果是双向链表，绘制反向箭头
        if (this.链表类型 === '双向链表') {
          this.绘制反向箭头(起点X, 起点Y, 控制点1X, 控制点1Y);
        }
      }
    }
  }
  
  绘制箭头(x, y, 控制点X, 控制点Y) {
    const 箭头长度 = 10;
    const 箭头角度 = Math.atan2(y - 控制点Y, x - 控制点X);
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      x - 箭头长度 * Math.cos(箭头角度 - Math.PI / 6),
      y - 箭头长度 * Math.sin(箭头角度 - Math.PI / 6)
    );
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      x - 箭头长度 * Math.cos(箭头角度 + Math.PI / 6),
      y - 箭头长度 * Math.sin(箭头角度 + Math.PI / 6)
    );
    this.ctx.stroke();
  }
  
  绘制反向箭头(x, y, 控制点X, 控制点Y) {
    const 箭头长度 = 8;
    const 箭头角度 = Math.atan2(控制点Y - y, 控制点X - x);
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      x + 箭头长度 * Math.cos(箭头角度 - Math.PI / 6),
      y + 箭头长度 * Math.sin(箭头角度 - Math.PI / 6)
    );
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      x + 箭头长度 * Math.cos(箭头角度 + Math.PI / 6),
      y + 箭头长度 * Math.sin(箭头角度 + Math.PI / 6)
    );
    this.ctx.stroke();
  }
  
  绘制节点(节点, 索引) {
    // 检查是否是删除动画中的节点 - 直接隐藏
    if (this.删除动画.正在删除 && this.删除动画.删除的节点 === 节点) {
      return; // 直接不绘制删除的节点
    }
    
    // 计算节点高度
    const 节点行高 = 22;
    const 顶部边距 = 25;
    const 底部边距 = 15;
    const 字段数量 = this.链表类型 === '双向链表' ? 4 : 3; // 姓名、年龄、内存地址、next、previous(双向链表)
    const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;
    
    // 检查是否悬停
    const 是否悬停 = this.悬停的节点 === 节点;
    const 背景色 = 是否悬停 ? '#3d4a5c' : this.颜色.节点背景;
    const 边框色 = 是否悬停 ? '#5a6c7d' : this.颜色.节点边框;
    
    // 绘制节点背景
    this.ctx.fillStyle = 背景色;
    this.ctx.strokeStyle = 边框色;
    this.ctx.lineWidth = 2;
    
    // 绘制圆角矩形
    this.ctx.beginPath();
    this.ctx.moveTo(节点.x + this.节点配置.圆角, 节点.y);
    this.ctx.lineTo(节点.x + this.节点配置.宽度 - this.节点配置.圆角, 节点.y);
    this.ctx.quadraticCurveTo(节点.x + this.节点配置.宽度, 节点.y, 节点.x + this.节点配置.宽度, 节点.y + this.节点配置.圆角);
    this.ctx.lineTo(节点.x + this.节点配置.宽度, 节点.y + 节点高度 - this.节点配置.圆角);
    this.ctx.quadraticCurveTo(节点.x + this.节点配置.宽度, 节点.y + 节点高度, 节点.x + this.节点配置.宽度 - this.节点配置.圆角, 节点.y + 节点高度);
    this.ctx.lineTo(节点.x + this.节点配置.圆角, 节点.y + 节点高度);
    this.ctx.quadraticCurveTo(节点.x, 节点.y + 节点高度, 节点.x, 节点.y + 节点高度 - this.节点配置.圆角);
    this.ctx.lineTo(节点.x, 节点.y + this.节点配置.圆角);
    this.ctx.quadraticCurveTo(节点.x, 节点.y, 节点.x + this.节点配置.圆角, 节点.y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    
    // 绘制索引
    this.ctx.font = `bold 14px ${this.字体}`;
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = this.颜色.字段名称;
    this.ctx.fillText('索引:', 节点.x + this.节点配置.宽度 / 2 - 15, 节点.y - 22);
    this.ctx.fillStyle = 'greenyellow'; // 使用greenyellow颜色
    this.ctx.fillText(索引.toString(), 节点.x + this.节点配置.宽度 / 2 + 15, 节点.y - 22);
    
    // 绘制节点内容
    this.ctx.font = `14px ${this.字体}`;
    this.ctx.textAlign = 'left';
    
    // 计算字段名称的最大宽度
    const 字段名称列表 = ['姓名：', '年龄：', '内存地址：', 'next：', 'previous：'];
    this.ctx.font = `14px ${this.字体}`;
    const 字段名称宽度 = Math.max(...字段名称列表.map(名称 => this.ctx.measureText(名称).width));
    
    // 计算文本起始位置
    const 文本X = 节点.x + 10;
    let 当前Y = 节点.y + 25;
    
    // 第一行：姓名
    this.ctx.fillStyle = this.颜色.字段名称;
    this.ctx.textAlign = 'right';
    this.ctx.fillText('姓名：', 文本X + 字段名称宽度, 当前Y);
    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = this.颜色.姓名值;
    this.ctx.fillText(节点.姓名, 文本X + 字段名称宽度 + 10, 当前Y);
    当前Y += 节点行高;
    
    // 第二行：年龄
    this.ctx.fillStyle = this.颜色.字段名称;
    this.ctx.textAlign = 'right';
    this.ctx.fillText('年龄：', 文本X + 字段名称宽度, 当前Y);
    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = this.颜色.年龄值;
    this.ctx.fillText(节点.年龄.toString(), 文本X + 字段名称宽度 + 10, 当前Y);
    当前Y += 节点行高;
    
    // 第三行：内存地址
    this.ctx.fillStyle = this.颜色.字段名称;
    this.ctx.textAlign = 'right';
    this.ctx.fillText('内存地址：', 文本X + 字段名称宽度, 当前Y);
    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = this.颜色.内存地址值;
    this.ctx.fillText(节点.内存地址, 文本X + 字段名称宽度 + 10, 当前Y);
    当前Y += 节点行高;
    
    // 第四行：next指针
    const 下一个节点地址 = 节点.next ? 节点.next.内存地址 : 'NULL';
    this.ctx.fillStyle = this.颜色.字段名称;
    this.ctx.textAlign = 'right';
    this.ctx.fillText('next：', 文本X + 字段名称宽度, 当前Y);
    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = this.颜色.next值;
    this.ctx.fillText(下一个节点地址, 文本X + 字段名称宽度 + 10, 当前Y);
    
    // 如果是双向链表，添加previous字段
    if (this.链表类型 === '双向链表') {
      当前Y += 节点行高;
      const 上一个节点地址 = 节点.previous ? 节点.previous.内存地址 : 'NULL';
      this.ctx.fillStyle = this.颜色.字段名称;
      this.ctx.textAlign = 'right';
      this.ctx.fillText('previous：', 文本X + 字段名称宽度, 当前Y);
      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = this.颜色.previous值;
      this.ctx.fillText(上一个节点地址, 文本X + 字段名称宽度 + 10, 当前Y);
    }
    
    // 绘制head标签
    if (索引 === 0) {
      this.ctx.fillStyle = this.颜色.head标签;
      this.ctx.font = `bold 16px ${this.字体}`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('head', 节点.x + this.节点配置.宽度 / 2, 节点.y - 48);
    }
    
    // 如果鼠标悬停在节点上，绘制删除按钮
    if (this.悬停的节点 === 节点) {
      this.绘制删除按钮(节点);
    }
  }
  
  绘制删除按钮(节点) {
    const 按钮大小 = 25;
    const 按钮X = 节点.x + this.节点配置.宽度 - 按钮大小/2 - 3; // 顶在右上角，向内5px
    const 按钮Y = 节点.y + 按钮大小/2 + 3; // 顶在右上角，向下5px
    
    // 计算删除按钮的圆角
    const 右上角圆角 = this.节点配置.圆角 - 2; // 节点边框厚度为2px
    const 其他角圆角 = 5; // 其他三个角使用3px圆角
    
    // 绘制混合圆角的矩形背景
    this.ctx.fillStyle = this.颜色.删除按钮;
    this.ctx.beginPath();
    // 左上角 - 3px圆角
    this.ctx.moveTo(按钮X - 按钮大小/2 + 其他角圆角, 按钮Y - 按钮大小/2);
    this.ctx.lineTo(按钮X + 按钮大小/2 - 右上角圆角, 按钮Y - 按钮大小/2);
    // 右上角 - 保持原来的圆角
    this.ctx.quadraticCurveTo(按钮X + 按钮大小/2, 按钮Y - 按钮大小/2, 按钮X + 按钮大小/2, 按钮Y - 按钮大小/2 + 右上角圆角);
    // 右边线
    this.ctx.lineTo(按钮X + 按钮大小/2, 按钮Y + 按钮大小/2 - 其他角圆角);
    // 右下角 - 3px圆角
    this.ctx.quadraticCurveTo(按钮X + 按钮大小/2, 按钮Y + 按钮大小/2, 按钮X + 按钮大小/2 - 其他角圆角, 按钮Y + 按钮大小/2);
    // 下边线
    this.ctx.lineTo(按钮X - 按钮大小/2 + 其他角圆角, 按钮Y + 按钮大小/2);
    // 左下角 - 3px圆角
    this.ctx.quadraticCurveTo(按钮X - 按钮大小/2, 按钮Y + 按钮大小/2, 按钮X - 按钮大小/2, 按钮Y + 按钮大小/2 - 其他角圆角);
    // 左边线
    this.ctx.lineTo(按钮X - 按钮大小/2, 按钮Y - 按钮大小/2 + 其他角圆角);
    // 左上角 - 3px圆角
    this.ctx.quadraticCurveTo(按钮X - 按钮大小/2, 按钮Y - 按钮大小/2, 按钮X - 按钮大小/2 + 其他角圆角, 按钮Y - 按钮大小/2);
    this.ctx.closePath();
    this.ctx.fill();
    
    // 绘制X符号
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold 14px ${this.字体}`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('×', 按钮X, 按钮Y + 4);
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new 链表可视化();
});
