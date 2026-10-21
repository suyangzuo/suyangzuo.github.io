const 鼠标样式 = {
  普通: 'url("/Images/Common/鼠标-默认.cur"), auto',
  拖拽: 'url("/Images/Common/鼠标-拖拽.cur"), grab',
  指向: 'url("/Images/Common/鼠标-指向.cur"), pointer',
};

const 字体 = "'Google Sans Code', 'JetBrains Mono', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";

class Git单人工作流 {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.初始化();
  }

  初始化() {
    this.绘制对象组 = [];
    this.画布边界矩形 = this.canvas.getBoundingClientRect();
    this.设置画布尺寸与缩放();
    this.添加画布尺寸观察器();
    this.添加窗体滚动事件();
    this.获取设置区输入元素();
    this.添加设置区输入元素事件();
    this.初始化标志();
    this.设置绘制样式();
    this.绘制普通目录();
    this.绘制对象组.push(this.样式.普通目录);
    this.鼠标坐标 = {
      x: 0,
      y: 0,
    };
    this.添加鼠标事件();
    this.添加Canvas鼠标事件();
  }

  设置画布尺寸与缩放() {
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.画布水平中点 = this.canvas.offsetWidth / 2;
    this.画布垂直中点 = this.canvas.offsetHeight / 2;
    this.画布边界矩形 = this.canvas.getBoundingClientRect();
  }

  添加画布尺寸观察器() {
    if (this.画布尺寸观察器) return;
    this.画布尺寸观察器 = new ResizeObserver(() => {
      this.设置画布尺寸与缩放();
      this.重绘();
    });
    this.画布尺寸观察器.observe(this.canvas);
  }

  添加窗体滚动事件() {
    window.addEventListener("scroll", () => {
      this.设置画布尺寸与缩放();
    });
  }

  初始化标志() {
    this.标志 = {
      选项: {
        SHA校验码: false,
        提交说明: false,
        电脑: 1,
      },
      鼠标: {
        已按下: false,
      },
      仓库: {
        Git仓库: false,
      },
    };
  }

  获取设置区输入元素() {
    this.SHA校验码复选框 = document.getElementById("SHA校验码");
    this.提交说明复选框 = document.getElementById("提交说明");
    this.电脑1单选框 = document.getElementById("电脑1");
    this.电脑2单选框 = document.getElementById("电脑2");
  }

  添加设置区输入元素事件() {
    this.SHA校验码复选框.addEventListener("change", () => {
      this.标志.SHA校验码 = this.SHA校验码复选框.checked;
    });
    this.提交说明复选框.addEventListener("change", () => {
      this.标志.提交说明 = this.提交说明复选框.checked;
    });
    this.电脑1单选框.addEventListener("change", () => {
      this.标志.选项.电脑 = this.电脑1单选框.checked ? 1 : 2;
    });
    this.电脑2单选框.addEventListener("change", () => {
      this.标志.选项.电脑 = this.电脑2单选框.checked ? 2 : 1;
    });
  }

  添加Canvas鼠标事件() {
    this.canvas.addEventListener("mousemove", () => {
      this.更新悬停状态();
      this.更新鼠标样式();
      this.重绘();
    });
  }

  更新悬停状态() {
    this.样式.普通目录.悬停 = this.在矩形内(this.样式.普通目录);
    this.样式.修改按钮.悬停 = this.在圆内(this.样式.修改按钮);
  }

  在矩形内(矩形) {
    const { x, y } = this.鼠标坐标;
    const 在水平范围内 = x >= 矩形.水平坐标 && x <= 矩形.水平坐标 + 矩形.宽度;
    const 在垂直范围内 = y >= 矩形.垂直坐标 && y <= 矩形.垂直坐标 + 矩形.高度;
    return 在水平范围内 && 在垂直范围内;
  }

  在圆内(圆) {
    const { x, y } = this.鼠标坐标;
    const 距离平方 = (x - 圆.水平坐标) ** 2 + (y - 圆.垂直坐标) ** 2;
    return 距离平方 <= 圆.半径 ** 2;
  }

  更新鼠标样式() {
    const 有悬停 = this.样式.普通目录.悬停 || this.样式.修改按钮.悬停;
    this.canvas.style.cursor = 有悬停 ? 鼠标样式.指向 : 鼠标样式.普通;
  }

  添加鼠标事件() {
    window.addEventListener("mousemove", (e) => {
      this.更新鼠标坐标(e);
    });

    window.addEventListener("mousedown", (e) => {
      this.标志.鼠标.已按下 = true;
    });

    window.addEventListener("mouseup", (e) => {
      this.标志.鼠标.已按下 = false;
    });
  }

  更新鼠标坐标(e) {
    this.鼠标坐标.x = e.clientX - this.画布边界矩形.left;
    this.鼠标坐标.y = e.clientY - this.画布边界矩形.top;
  }

  清空画布() {
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
  }

  重绘() {
    this.清空画布();
    for (let i = 0; i < this.绘制对象组.length; i++) {
      const 绘制对象 = this.绘制对象组[i];
      if (绘制对象.用途 === "普通目录") {
        this.绘制普通目录(绘制对象);
      }
    }
  }

  设置绘制样式() {
    this.样式 = {
      普通目录: {
        悬停: false,
        选中: false,
        用途: "普通目录",
        类型: "圆角矩形",
        描边色: "#fff2",
        描边色_悬停: "#fffa",
        填充色: "transparent",
        填充色_悬停: "#ffffff1a",
        描边宽度: 2,
        圆角: 10,
        宽度: 450,
        高度: 175,
        水平坐标: null,
        水平比例: null,
        垂直坐标: null,
        垂直比例: null,
        标题字号: 18,
        标题字色: "gold",
        文本字号: 14,
        文本字色: "#fff",
      },
      修改按钮: {
        悬停: false,
        半径: 17.5,
        水平坐标: null,
        垂直坐标: null,
        填充色: "#345",
        填充色_悬停: "#567",
        十字色: "#bcd",
        十字色_悬停: "#def",
      },
    };
  }

  绘制圆角矩形(目标) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = 目标.悬停 ? 目标.描边色_悬停 : 目标.描边色;
    this.ctx.lineWidth = 目标.描边宽度;
    this.ctx.fillStyle = 目标.悬停 ? 目标.填充色_悬停 : 目标.填充色;
    this.ctx.roundRect(
      this.canvas.offsetWidth * 目标.水平比例,
      this.canvas.offsetHeight * 目标.垂直比例,
      目标.宽度,
      目标.高度,
      [目标.圆角],
    );
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.restore();
  }

  绘制普通目录() {
    this.样式.普通目录.水平坐标 = this.画布水平中点 - this.样式.普通目录.宽度 / 2;
    this.样式.普通目录.水平比例 = this.样式.普通目录.水平坐标 / this.canvas.offsetWidth;
    this.样式.普通目录.垂直坐标 = this.canvas.offsetHeight - this.样式.普通目录.高度 - 35;
    this.样式.普通目录.垂直比例 = this.样式.普通目录.垂直坐标 / this.canvas.offsetHeight;
    this.绘制圆角矩形(this.样式.普通目录);
    const 水平中点 = this.样式.普通目录.水平坐标 + this.样式.普通目录.宽度 / 2;
    const 标题文本 = "普通目录";
    const 标题宽度 = this.ctx.measureText(标题文本).width;
    this.ctx.save();
    this.ctx.font = `${this.样式.普通目录.标题字号}px ${字体}`;
    this.ctx.fillStyle = this.样式.普通目录.标题字色;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(标题文本, 水平中点, this.样式.普通目录.垂直坐标 - this.样式.普通目录.标题字号 * 1.5);
    this.绘制修改按钮(水平中点, 标题宽度, this.样式.普通目录.垂直坐标);
    this.ctx.restore();
  }

  绘制修改按钮(目录水平中点, 标题宽度, 目录垂直坐标) {
    const 按钮 = this.样式.修改按钮;
    按钮.水平坐标 = 目录水平中点 + 标题宽度 / 2 + 30 + 按钮.半径;
    按钮.垂直坐标 = 目录垂直坐标 - 按钮.半径 - 12;
    this.ctx.beginPath();
    this.ctx.fillStyle = 按钮.悬停 ? 按钮.填充色_悬停 : 按钮.填充色;
    this.ctx.arc(按钮.水平坐标, 按钮.垂直坐标, 按钮.半径, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    const 十字半径 = 按钮.半径 / 2;
    this.ctx.strokeStyle = 按钮.悬停 ? 按钮.十字色_悬停 : 按钮.十字色;
    this.ctx.lineWidth = 1.5;
    this.ctx.moveTo(按钮.水平坐标 - 十字半径, 按钮.垂直坐标);
    this.ctx.lineTo(按钮.水平坐标 + 十字半径, 按钮.垂直坐标);
    this.ctx.moveTo(按钮.水平坐标, 按钮.垂直坐标 - 十字半径);
    this.ctx.lineTo(按钮.水平坐标, 按钮.垂直坐标 + 十字半径);
    this.ctx.stroke();
  }
}

new Git单人工作流();
