class 坐标系教程 {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.重置按钮 = document.querySelector(".重置按钮");
    this.重置按钮.addEventListener("click", () => this.重置());
    this.复选框 = {
      鼠标坐标参考线: document.getElementById("鼠标坐标参考线"),
      鼠标坐标: document.getElementById("鼠标坐标"),
      鼠标坐标背景: document.getElementById("鼠标坐标背景"),
      坐标系选择: document.getElementById("坐标系选择"),
      观察点坐标: document.getElementById("观察点坐标"),
      坐标转换过程: document.getElementById("坐标转换过程"),
    };
    this.坐标系选择文本 = document.getElementById("坐标系选择文本");
    this.控制区元素 = document.querySelector(".控制区");
    this.边界矩形 = this.canvas.getBoundingClientRect();
    this.鼠标坐标 = {
      x: null,
      y: null,
    };
    this.矩形 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
      宽度: 300,
      高度: 200,
      旋转角度: 0,
    };
    this.观察点 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
      半径: 8,
    };
    this.交互状态 = {
      正在拖动: false,
      正在缩放: false,
      正在旋转: false,
      拖动偏移: { x: 0, y: 0 },
      拖动起始位置: { x: 0, y: 0 },
      缩放起始: { 宽度: 0, 高度: 0, x: 0, y: 0, 矩形中心X: 0, 矩形中心Y: 0 },
      旋转起始: { 角度: 0, x: 0, y: 0 },
      鼠标位置: { x: 0, y: 0 },
      缩放边: null,
      缩放角: null,
      缩放锚点: { x: 0, y: 0 },
      Alt键按下: false,
      Shift键按下: false,
      Ctrl键按下: false,
      鼠标已悬停: false,
      观察点悬停: false,
      正在拖动观察点: false,
      观察点拖动偏移: { x: 0, y: 0 },
      按钮状态: {
        x增加: { 按下: false, 按下时间: null, 快速增减定时器: null, 悬停: false },
        x减少: { 按下: false, 按下时间: null, 快速增减定时器: null, 悬停: false },
        y增加: { 按下: false, 按下时间: null, 快速增减定时器: null, 悬停: false },
        y减少: { 按下: false, 按下时间: null, 快速增减定时器: null, 悬停: false },
      },
    };
    this.显示选项 = {
      世界坐标系: true,
      局部坐标系: true,
      鼠标坐标: true,
      鼠标坐标参考线: true,
      鼠标坐标背景: true,
      使用世界坐标系: true,
      观察点坐标: true,
      坐标转换过程: false,
    };
    this.从SessionStorage加载复选框状态();
    this.从SessionStorage加载观察点位置();
    this.从LocalStorage加载坐标系选择();
    this.从LocalStorage加载矩形状态();
    this.从LocalStorage加载观察点坐标状态();
    this.复选框.鼠标坐标参考线.checked = this.显示选项.鼠标坐标参考线;
    this.复选框.鼠标坐标.checked = this.显示选项.鼠标坐标;
    this.复选框.鼠标坐标背景.checked = this.显示选项.鼠标坐标背景;
    this.复选框.坐标系选择.checked = this.显示选项.使用世界坐标系;
    this.复选框.观察点坐标.checked = this.显示选项.观察点坐标;
    this.复选框.坐标转换过程.checked = this.显示选项.坐标转换过程;
    this.绘制场景();
    window.addEventListener("scroll", () => {
      this.边界矩形 = this.canvas.getBoundingClientRect();
    });
    window.addEventListener("resize", () => {
      this.边界矩形 = this.canvas.getBoundingClientRect();
      this.canvas.width = this.canvas.offsetWidth * this.dpr;
      this.canvas.height = this.canvas.offsetHeight * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);
      setTimeout(() => {
        this.绘制场景();
      }, 0);
    });
    this.canvas.addEventListener("mousedown", (e) => this.鼠标按下(e));
    window.addEventListener("mousemove", (e) => this.鼠标移动(e));
    window.addEventListener("mouseup", () => this.鼠标释放());
    window.addEventListener("keydown", (e) => {
      if (e.key === "Alt") {
        e.preventDefault();
        this.交互状态.Alt键按下 = true;
      } else if (e.key === "Shift" || e.shiftKey) {
        this.交互状态.Shift键按下 = true;
      } else if (e.key === "Control" || e.ctrlKey) {
        this.交互状态.Ctrl键按下 = true;
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "Alt") {
        this.交互状态.Alt键按下 = false;
      } else if (e.key === "Shift") {
        this.交互状态.Shift键按下 = false;
      } else if (e.key === "Control" || e.key === "Meta") {
        this.交互状态.Ctrl键按下 = false;
      }
      if (!e.shiftKey) {
        this.交互状态.Shift键按下 = false;
      }
      if (!e.ctrlKey && !e.metaKey) {
        this.交互状态.Ctrl键按下 = false;
      }
    });
    window.addEventListener("blur", () => {
      this.交互状态.Alt键按下 = false;
      this.交互状态.Shift键按下 = false;
      this.交互状态.Ctrl键按下 = false;
    });
    this.复选框.鼠标坐标参考线.addEventListener("change", () => {
      this.显示选项.鼠标坐标参考线 = this.复选框.鼠标坐标参考线.checked;
      this.保存复选框状态到SessionStorage();
      this.绘制场景();
    });
    this.复选框.鼠标坐标.addEventListener("change", () => {
      this.显示选项.鼠标坐标 = this.复选框.鼠标坐标.checked;
      this.保存复选框状态到SessionStorage();
      this.绘制场景();
    });
    this.复选框.鼠标坐标背景.addEventListener("change", () => {
      this.显示选项.鼠标坐标背景 = this.复选框.鼠标坐标背景.checked;
      this.保存复选框状态到SessionStorage();
      this.绘制场景();
    });
    this.复选框.坐标系选择.addEventListener("change", () => {
      this.显示选项.使用世界坐标系 = this.复选框.坐标系选择.checked;
      this.保存坐标系选择到LocalStorage();
      this.更新坐标系选择文本();
      this.绘制场景();
    });
    this.复选框.观察点坐标.addEventListener("change", () => {
      this.显示选项.观察点坐标 = this.复选框.观察点坐标.checked;
      this.保存观察点坐标状态到LocalStorage();
      this.绘制场景();
    });
    this.复选框.坐标转换过程.addEventListener("change", () => {
      this.显示选项.坐标转换过程 = this.复选框.坐标转换过程.checked;
      this.保存复选框状态到SessionStorage();
      this.绘制场景();
    });
  }
  从SessionStorage加载复选框状态() {
    try {
      const 保存的状态 = sessionStorage.getItem("canvasCoordinateCheckboxStates");
      if (保存的状态) {
        const 解析状态 = JSON.parse(保存的状态);
        if (解析状态.鼠标坐标参考线 !== undefined) {
          this.显示选项.鼠标坐标参考线 = 解析状态.鼠标坐标参考线;
        }
        if (解析状态.鼠标坐标 !== undefined) {
          this.显示选项.鼠标坐标 = 解析状态.鼠标坐标;
        }
        if (解析状态.鼠标坐标背景 !== undefined) {
          this.显示选项.鼠标坐标背景 = 解析状态.鼠标坐标背景;
        }
        if (解析状态.坐标转换过程 !== undefined) {
          this.显示选项.坐标转换过程 = 解析状态.坐标转换过程;
        }
      }
    } catch (e) {
      console.error("加载sessionStorage状态失败:", e);
    }
  }
  保存复选框状态到SessionStorage() {
    try {
      const 要保存的状态 = {
        鼠标坐标参考线: this.显示选项.鼠标坐标参考线,
        鼠标坐标: this.显示选项.鼠标坐标,
        鼠标坐标背景: this.显示选项.鼠标坐标背景,
        坐标转换过程: this.显示选项.坐标转换过程,
      };
      sessionStorage.setItem("canvasCoordinateCheckboxStates", JSON.stringify(要保存的状态));
    } catch (e) {
      console.error("保存到sessionStorage失败:", e);
    }
  }
  从SessionStorage加载观察点位置() {
    try {
      const 保存的位置 = sessionStorage.getItem("canvasCoordinate观察点位置");
      if (保存的位置) {
        const 解析位置 = JSON.parse(保存的位置);
        if (解析位置.x !== undefined) {
          this.观察点.x = 解析位置.x;
        }
        if (解析位置.y !== undefined) {
          this.观察点.y = 解析位置.y;
        }
      }
    } catch (e) {
      console.error("加载观察点位置失败:", e);
    }
  }
  保存观察点位置到SessionStorage() {
    try {
      const 要保存的位置 = {
        x: this.观察点.x,
        y: this.观察点.y,
      };
      sessionStorage.setItem("canvasCoordinate观察点位置", JSON.stringify(要保存的位置));
    } catch (e) {
      console.error("保存观察点位置失败:", e);
    }
  }
  从LocalStorage加载坐标系选择() {
    try {
      const 保存的选择 = localStorage.getItem("canvasCoordinate坐标系选择");
      if (保存的选择 !== null) {
        this.显示选项.使用世界坐标系 = JSON.parse(保存的选择);
      }
      this.更新坐标系选择文本();
    } catch (e) {
      console.error("加载坐标系选择失败:", e);
    }
  }
  保存坐标系选择到LocalStorage() {
    try {
      localStorage.setItem("canvasCoordinate坐标系选择", JSON.stringify(this.显示选项.使用世界坐标系));
    } catch (e) {
      console.error("保存坐标系选择失败:", e);
    }
  }
  从LocalStorage加载矩形状态() {
    try {
      const 保存的状态 = localStorage.getItem("canvasCoordinate矩形状态");
      if (保存的状态) {
        const 解析状态 = JSON.parse(保存的状态);
        if (解析状态.x !== undefined) {
          this.矩形.x = 解析状态.x;
        }
        if (解析状态.y !== undefined) {
          this.矩形.y = 解析状态.y;
        }
        if (解析状态.宽度 !== undefined) {
          this.矩形.宽度 = 解析状态.宽度;
        }
        if (解析状态.高度 !== undefined) {
          this.矩形.高度 = 解析状态.高度;
        }
        if (解析状态.旋转角度 !== undefined) {
          this.矩形.旋转角度 = 解析状态.旋转角度;
        }
      }
    } catch (e) {
      console.error("加载矩形状态失败:", e);
    }
  }
  保存矩形状态到LocalStorage() {
    try {
      const 要保存的状态 = {
        x: this.矩形.x,
        y: this.矩形.y,
        宽度: this.矩形.宽度,
        高度: this.矩形.高度,
        旋转角度: this.矩形.旋转角度,
      };
      localStorage.setItem("canvasCoordinate矩形状态", JSON.stringify(要保存的状态));
    } catch (e) {
      console.error("保存矩形状态失败:", e);
    }
  }
  从LocalStorage加载观察点坐标状态() {
    try {
      const 保存的状态 = localStorage.getItem("canvasCoordinate观察点坐标");
      if (保存的状态 !== null) {
        this.显示选项.观察点坐标 = JSON.parse(保存的状态);
      }
    } catch (e) {
      console.error("加载观察点坐标状态失败:", e);
    }
  }
  保存观察点坐标状态到LocalStorage() {
    try {
      localStorage.setItem("canvasCoordinate观察点坐标", JSON.stringify(this.显示选项.观察点坐标));
    } catch (e) {
      console.error("保存观察点坐标状态失败:", e);
    }
  }
  获取鼠标坐标(e) {
    this.交互状态.鼠标位置 = {
      x: e.clientX - this.边界矩形.left,
      y: e.clientY - this.边界矩形.top,
    };
    this.鼠标坐标 = this.交互状态.鼠标位置;
  }
  鼠标按下(e) {
    this.获取鼠标坐标(e);
    const 鼠标位置 = this.交互状态.鼠标位置;
    const 矩形 = this.矩形;
    const 到观察点距离 = Math.sqrt(Math.pow(鼠标位置.x - this.观察点.x, 2) + Math.pow(鼠标位置.y - this.观察点.y, 2));
    if (到观察点距离 <= this.观察点.半径 + 8) {
      this.交互状态.正在拖动观察点 = true;
      this.交互状态.观察点拖动偏移 = {
        x: 鼠标位置.x - this.观察点.x,
        y: 鼠标位置.y - this.观察点.y,
      };
      return;
    }
    const 按钮区域 = this.获取按钮区域();
    const 点击的按钮 = this.检查按钮点击(鼠标位置, 按钮区域);
    if (点击的按钮) {
      this.处理按钮按下(点击的按钮);
      return;
    }
    const dx = 鼠标位置.x - 矩形.x;
    const dy = 鼠标位置.y - 矩形.y;
    const 弧度 = (-矩形.旋转角度 * Math.PI) / 180;
    const 局部X = dx * Math.cos(弧度) - dy * Math.sin(弧度);
    const 局部Y = dx * Math.sin(弧度) + dy * Math.cos(弧度);
    const 半宽 = 矩形.宽度 / 2;
    const 半高 = 矩形.高度 / 2;
    const 边界阈值 = 10;
    if (Math.abs(局部X) < 边界阈值 && Math.abs(局部Y + 半高 + 20) < 边界阈值) {
      this.交互状态.正在旋转 = true;
      this.交互状态.旋转起始 = {
        角度: 矩形.旋转角度,
        x: 鼠标位置.x,
        y: 鼠标位置.y,
      };
    }
    if (
      (Math.abs(局部X - 半宽) < 边界阈值 && Math.abs(局部Y - 半高) < 边界阈值) ||
      (Math.abs(局部X + 半宽) < 边界阈值 && Math.abs(局部Y - 半高) < 边界阈值) ||
      (Math.abs(局部X - 半宽) < 边界阈值 && Math.abs(局部Y + 半高) < 边界阈值) ||
      (Math.abs(局部X + 半宽) < 边界阈值 && Math.abs(局部Y + 半高) < 边界阈值)
    ) {
      this.交互状态.正在缩放 = true;
      this.交互状态.缩放起始 = {
        宽度: 矩形.宽度,
        高度: 矩形.高度,
        x: 鼠标位置.x,
        y: 鼠标位置.y,
        矩形中心X: 矩形.x,
        矩形中心Y: 矩形.y,
      };
      const 角点配置 = this.获取角点配置(局部X, 局部Y, 半宽, 半高, 边界阈值);
      this.交互状态.缩放角 = 角点配置.角;
      this.交互状态.缩放锚点 = 角点配置.锚点;
      this.交互状态.被拖拽点初始位置 = 角点配置.被拖拽点;
    } else if (
      (Math.abs(局部X - 半宽) < 边界阈值 && Math.abs(局部Y) <= 半高) ||
      (Math.abs(局部X + 半宽) < 边界阈值 && Math.abs(局部Y) <= 半高) ||
      (Math.abs(局部Y - 半高) < 边界阈值 && Math.abs(局部X) <= 半宽) ||
      (Math.abs(局部Y + 半高) < 边界阈值 && Math.abs(局部X) <= 半宽)
    ) {
      this.交互状态.正在缩放 = true;
      this.交互状态.缩放起始 = {
        宽度: 矩形.宽度,
        高度: 矩形.高度,
        x: 鼠标位置.x,
        y: 鼠标位置.y,
        矩形中心X: 矩形.x,
        矩形中心Y: 矩形.y,
      };
      const 边缘配置 = [
        {
          条件: Math.abs(局部X - 半宽) < 边界阈值 && Math.abs(局部Y) <= 半高,
          边: "右",
          锚点: { x: -半宽, y: 0 },
          被拖拽点: { x: 半宽, y: 局部Y },
        },
        {
          条件: Math.abs(局部X + 半宽) < 边界阈值 && Math.abs(局部Y) <= 半高,
          边: "左",
          锚点: { x: 半宽, y: 0 },
          被拖拽点: { x: -半宽, y: 局部Y },
        },
        {
          条件: Math.abs(局部Y - 半高) < 边界阈值 && Math.abs(局部X) <= 半宽,
          边: "下",
          锚点: { x: 0, y: -半高 },
          被拖拽点: { x: 局部X, y: 半高 },
        },
        {
          条件: true,
          边: "上",
          锚点: { x: 0, y: 半高 },
          被拖拽点: { x: 局部X, y: -半高 },
        },
      ];
      const 匹配配置 = 边缘配置.find((配置) => 配置.条件);
      this.交互状态.缩放边 = 匹配配置.边;
      this.交互状态.缩放锚点 = 匹配配置.锚点;
      this.交互状态.被拖拽点初始位置 = 匹配配置.被拖拽点;
    } else if (Math.abs(局部X) <= 半宽 && Math.abs(局部Y) <= 半高) {
      this.交互状态.正在拖动 = true;
      this.交互状态.拖动偏移 = {
        x: 鼠标位置.x - 矩形.x,
        y: 鼠标位置.y - 矩形.y,
      };
      this.交互状态.拖动起始位置 = {
        x: 矩形.x,
        y: 矩形.y,
      };
      this.canvas.classList.add("dragging");
    }
  }
  获取角点配置(局部X, 局部Y, 半宽, 半高, 边界阈值) {
    const 角点配置列表 = [
      {
        条件: Math.abs(局部X - 半宽) < 边界阈值 && Math.abs(局部Y - 半高) < 边界阈值,
        角: "右下",
        锚点: { x: -半宽, y: -半高 },
        被拖拽点: { x: 半宽, y: 半高 },
      },
      {
        条件: Math.abs(局部X + 半宽) < 边界阈值 && Math.abs(局部Y - 半高) < 边界阈值,
        角: "左下",
        锚点: { x: 半宽, y: -半高 },
        被拖拽点: { x: -半宽, y: 半高 },
      },
      {
        条件: Math.abs(局部X - 半宽) < 边界阈值 && Math.abs(局部Y + 半高) < 边界阈值,
        角: "右上",
        锚点: { x: -半宽, y: 半高 },
        被拖拽点: { x: 半宽, y: -半高 },
      },
      {
        条件: true,
        角: "左上",
        锚点: { x: 半宽, y: 半高 },
        被拖拽点: { x: -半宽, y: -半高 },
      },
    ];
    return 角点配置列表.find((配置) => 配置.条件);
  }
  鼠标移动(e) {
    this.获取鼠标坐标(e);
    const 鼠标位置 = this.交互状态.鼠标位置;
    this.交互状态.Shift键按下 = e.shiftKey;
    this.交互状态.Ctrl键按下 = e.ctrlKey;
    this.更新按钮悬停状态(鼠标位置);
    if (
      !this.交互状态.正在拖动 &&
      !this.交互状态.正在缩放 &&
      !this.交互状态.正在旋转 &&
      !this.交互状态.正在拖动观察点
    ) {
      this.更新鼠标样式(鼠标位置);
    }
    if (this.交互状态.正在拖动观察点) {
      this.处理观察点拖动(鼠标位置);
    } else if (this.交互状态.正在拖动) {
      this.处理拖动(鼠标位置);
    } else if (this.交互状态.正在旋转) {
      this.处理旋转(鼠标位置);
    } else if (this.交互状态.正在缩放) {
      this.处理缩放(鼠标位置);
    }
    this.绘制场景();
  }
  更新鼠标样式(鼠标位置) {
    const 到观察点距离 = Math.sqrt(Math.pow(鼠标位置.x - this.观察点.x, 2) + Math.pow(鼠标位置.y - this.观察点.y, 2));
    if (到观察点距离 <= this.观察点.半径 + 8) {
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-移动.cur"), move';
      this.交互状态.观察点悬停 = true;
      return;
    } else {
      this.交互状态.观察点悬停 = false;
    }
    const 矩形 = this.矩形;
    const 边界阈值 = 10;
    const { 局部X, 局部Y, 半宽, 半高 } = this.计算鼠标局部坐标(鼠标位置, 矩形);
    this.交互状态.鼠标已悬停 = false;
    const cursor = this.获取鼠标cursor样式(局部X, 局部Y, 半宽, 半高, 边界阈值);
    this.canvas.style.cursor = cursor;
    if (cursor === 'url("/Images/Common/鼠标-移动.cur"), move' && Math.abs(局部X) <= 半宽 && Math.abs(局部Y) <= 半高) {
      this.交互状态.鼠标已悬停 = true;
    }
  }
  计算鼠标局部坐标(鼠标位置, 矩形) {
    const dx = 鼠标位置.x - 矩形.x;
    const dy = 鼠标位置.y - 矩形.y;
    const 弧度 = (-矩形.旋转角度 * Math.PI) / 180;
    const 局部X = dx * Math.cos(弧度) - dy * Math.sin(弧度);
    const 局部Y = dx * Math.sin(弧度) + dy * Math.cos(弧度);
    const 半宽 = 矩形.宽度 / 2;
    const 半高 = 矩形.高度 / 2;
    return { 局部X, 局部Y, 半宽, 半高 };
  }
  获取鼠标cursor样式(局部X, 局部Y, 半宽, 半高, 边界阈值) {
    if (this.是否在旋转句柄上(局部X, 局部Y, 半高, 边界阈值)) {
      return 'url("/Images/Common/鼠标-移动.cur"), move';
    }
    const 角点cursor = this.获取角点cursor样式(局部X, 局部Y, 半宽, 半高, 边界阈值);
    if (角点cursor) {
      return 角点cursor;
    }
    const 边缘cursor = this.获取边缘cursor样式(局部X, 局部Y, 半宽, 半高, 边界阈值);
    if (边缘cursor) {
      return 边缘cursor;
    }
    if (Math.abs(局部X) <= 半宽 && Math.abs(局部Y) <= 半高) {
      return 'url("/Images/Common/鼠标-移动.cur"), move';
    }
    return 'url("/Images/Common/鼠标-默认.cur"), auto';
  }
  是否在旋转句柄上(局部X, 局部Y, 半高, 边界阈值) {
    return Math.abs(局部X) < 边界阈值 && Math.abs(局部Y + 半高 + 20) < 边界阈值;
  }
  获取角点cursor样式(局部X, 局部Y, 半宽, 半高, 边界阈值) {
    if (
      (this.接近值(局部X, 半宽, 边界阈值) && this.接近值(局部Y, 半高, 边界阈值)) ||
      (this.接近值(局部X, -半宽, 边界阈值) && this.接近值(局部Y, -半高, 边界阈值))
    ) {
      return "nwse-resize";
    }
    if (
      (this.接近值(局部X, -半宽, 边界阈值) && this.接近值(局部Y, 半高, 边界阈值)) ||
      (this.接近值(局部X, 半宽, 边界阈值) && this.接近值(局部Y, -半高, 边界阈值))
    ) {
      return "nesw-resize";
    }
    return null;
  }
  获取边缘cursor样式(局部X, 局部Y, 半宽, 半高, 边界阈值) {
    if (
      (this.接近值(局部X, 半宽, 边界阈值) && Math.abs(局部Y) <= 半高) ||
      (this.接近值(局部X, -半宽, 边界阈值) && Math.abs(局部Y) <= 半高)
    ) {
      return "ew-resize";
    }
    if (
      (this.接近值(局部Y, 半高, 边界阈值) && Math.abs(局部X) <= 半宽) ||
      (this.接近值(局部Y, -半高, 边界阈值) && Math.abs(局部X) <= 半宽)
    ) {
      return "ns-resize";
    }
    return null;
  }
  接近值(值, 目标值, 阈值) {
    return Math.abs(值 - 目标值) < 阈值;
  }
  处理拖动(鼠标位置) {
    if (this.交互状态.Shift键按下) {
      const 拖动起始 = this.交互状态.拖动起始位置;
      const 正常X = 鼠标位置.x - this.交互状态.拖动偏移.x;
      const 正常Y = 鼠标位置.y - this.交互状态.拖动偏移.y;
      const dx = 正常X - 拖动起始.x;
      const dy = 正常Y - 拖动起始.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.矩形.x = 拖动起始.x + dx;
        this.矩形.y = 拖动起始.y;
      } else {
        this.矩形.x = 拖动起始.x;
        this.矩形.y = 拖动起始.y + dy;
      }
    } else {
      this.矩形.x = 鼠标位置.x - this.交互状态.拖动偏移.x;
      this.矩形.y = 鼠标位置.y - this.交互状态.拖动偏移.y;
    }
    this.保存矩形状态到LocalStorage();
  }
  处理旋转(鼠标位置) {
    const 旋转起始 = this.交互状态.旋转起始;
    const dx = 鼠标位置.x - this.矩形.x;
    const dy = 鼠标位置.y - this.矩形.y;
    const 起始Dx = 旋转起始.x - this.矩形.x;
    const 起始Dy = 旋转起始.y - this.矩形.y;
    let 当前角度 = (Math.atan2(dy, dx) * 180) / Math.PI;
    let 起始角度 = (Math.atan2(起始Dy, 起始Dx) * 180) / Math.PI;
    this.矩形.旋转角度 = 旋转起始.角度 + (当前角度 - 起始角度);
    // 使用模运算归一化角度到0-360范围（不包括360，360度等于0度）
    this.矩形.旋转角度 = ((this.矩形.旋转角度 % 360) + 360) % 360;
    // 如果角度非常接近360（由于浮点数精度问题），将其设置为0
    if (this.矩形.旋转角度 >= 359.95) {
      this.矩形.旋转角度 = 0;
    }
    if (this.交互状态.Shift键按下) {
      this.矩形.旋转角度 = this.对齐到45度倍数(this.矩形.旋转角度);
    }
    this.保存矩形状态到LocalStorage();
  }
  对齐到45度倍数(角度) {
    const 倍数 = Math.round(角度 / 45);
    const 对齐角度 = 倍数 * 45;
    return ((对齐角度 % 360) + 360) % 360;
  }
  处理缩放(鼠标位置) {
    const 缩放起始 = this.交互状态.缩放起始;
    const 使用中心锚点 = this.交互状态.Alt键按下;
    const 角度 = (this.矩形.旋转角度 * Math.PI) / 180;
    const 弧度 = (-this.矩形.旋转角度 * Math.PI) / 180;
    const { 鼠标局部X, 鼠标局部Y, 局部Dx, 局部Dy } = this.计算缩放局部坐标(鼠标位置, 缩放起始, 弧度);
    if (this.交互状态.缩放边) {
      this.处理边缩放(缩放起始, 鼠标局部X, 鼠标局部Y, 局部Dx, 局部Dy, 使用中心锚点, 角度);
    } else if (this.交互状态.缩放角) {
      this.处理角缩放(缩放起始, 鼠标局部X, 鼠标局部Y, 局部Dx, 局部Dy, 使用中心锚点, 角度);
    }
  }
  计算缩放局部坐标(鼠标位置, 缩放起始, 弧度) {
    const dx = 鼠标位置.x - 缩放起始.矩形中心X;
    const dy = 鼠标位置.y - 缩放起始.矩形中心Y;
    const 鼠标局部X = dx * Math.cos(弧度) - dy * Math.sin(弧度);
    const 鼠标局部Y = dx * Math.sin(弧度) + dy * Math.cos(弧度);
    const 起始Dx = 缩放起始.x - 缩放起始.矩形中心X;
    const 起始Dy = 缩放起始.y - 缩放起始.矩形中心Y;
    const 起始鼠标局部X = 起始Dx * Math.cos(弧度) - 起始Dy * Math.sin(弧度);
    const 起始鼠标局部Y = 起始Dx * Math.sin(弧度) + 起始Dy * Math.cos(弧度);
    const 局部Dx = 鼠标局部X - 起始鼠标局部X;
    const 局部Dy = 鼠标局部Y - 起始鼠标局部Y;
    return { 鼠标局部X, 鼠标局部Y, 局部Dx, 局部Dy };
  }
  处理边缩放(缩放起始, 鼠标局部X, 鼠标局部Y, 局部Dx, 局部Dy, 使用中心锚点, 角度) {
    const 锚点 = 使用中心锚点 ? { x: 0, y: 0 } : this.交互状态.缩放锚点;
    const 被拖拽点初始位置 = this.交互状态.被拖拽点初始位置;
    const 缩放边 = this.交互状态.缩放边;
    const 是水平边 = 缩放边 === "右" || 缩放边 === "左";
    const { x: 被拖拽点局部X, y: 被拖拽点局部Y } = this.计算边拖拽点位置(
      缩放边,
      使用中心锚点,
      鼠标局部X,
      鼠标局部Y,
      被拖拽点初始位置,
      局部Dx,
      局部Dy
    );
    if (是水平边) {
      this.应用水平边缩放(缩放起始, 被拖拽点局部X, 锚点, 使用中心锚点, 缩放边, 角度);
    } else {
      this.应用垂直边缩放(缩放起始, 被拖拽点局部Y, 锚点, 使用中心锚点, 缩放边, 角度);
    }
  }
  计算边拖拽点位置(缩放边, 使用中心锚点, 鼠标局部X, 鼠标局部Y, 被拖拽点初始位置, 局部Dx, 局部Dy) {
    if (使用中心锚点) {
      const 是水平边 = 缩放边 === "右" || 缩放边 === "左";
      return {
        x: 是水平边 ? 鼠标局部X : 被拖拽点初始位置.x,
        y: 是水平边 ? 被拖拽点初始位置.y : 鼠标局部Y,
      };
    } else {
      const 是水平边 = 缩放边 === "右" || 缩放边 === "左";
      return {
        x: 是水平边 ? 被拖拽点初始位置.x + 局部Dx : 被拖拽点初始位置.x,
        y: 是水平边 ? 被拖拽点初始位置.y : 被拖拽点初始位置.y + 局部Dy,
      };
    }
  }
  应用水平边缩放(缩放起始, 被拖拽点局部X, 锚点, 使用中心锚点, 缩放边, 角度) {
    const 新宽度 = Math.max(1, Math.abs(被拖拽点局部X - 锚点.x));
    if (使用中心锚点) {
      this.矩形.x = 缩放起始.矩形中心X;
      this.矩形.y = 缩放起始.矩形中心Y;
      this.矩形.宽度 = Math.max(1, Math.abs(被拖拽点局部X) * 2);
    } else {
      const 被拖拽点相对于锚点的X = 被拖拽点局部X - 锚点.x;
      const 方向 = 被拖拽点相对于锚点的X >= 0 ? 1 : -1;
      const 锚点世界 = this.局部坐标转世界坐标(缩放起始.矩形中心X, 缩放起始.矩形中心Y, 锚点.x, 锚点.y, 角度);
      const 新的中心到锚点向量X = (方向 * 新宽度) / 2;
      const 新的中心 = this.局部坐标转世界坐标(锚点世界.x, 锚点世界.y, 新的中心到锚点向量X, 0, 角度);
      this.矩形.x = 新的中心.x;
      this.矩形.y = 新的中心.y;
      this.矩形.宽度 = 新宽度;
    }
    this.保存矩形状态到LocalStorage();
  }
  应用垂直边缩放(缩放起始, 被拖拽点局部Y, 锚点, 使用中心锚点, 缩放边, 角度) {
    const 新高度 = Math.max(1, Math.abs(被拖拽点局部Y - 锚点.y));
    if (使用中心锚点) {
      this.矩形.x = 缩放起始.矩形中心X;
      this.矩形.y = 缩放起始.矩形中心Y;
      this.矩形.高度 = Math.max(1, Math.abs(被拖拽点局部Y) * 2);
    } else {
      const 被拖拽点相对于锚点的Y = 被拖拽点局部Y - 锚点.y;
      const 方向 = 被拖拽点相对于锚点的Y >= 0 ? 1 : -1;
      const 锚点世界 = this.局部坐标转世界坐标(缩放起始.矩形中心X, 缩放起始.矩形中心Y, 锚点.x, 锚点.y, 角度);
      const 新的中心到锚点向量Y = (方向 * 新高度) / 2;
      const 新的中心 = this.局部坐标转世界坐标(锚点世界.x, 锚点世界.y, 0, 新的中心到锚点向量Y, 角度);
      this.矩形.x = 新的中心.x;
      this.矩形.y = 新的中心.y;
      this.矩形.高度 = 新高度;
    }
    this.保存矩形状态到LocalStorage();
  }
  处理角缩放(缩放起始, 鼠标局部X, 鼠标局部Y, 局部Dx, 局部Dy, 使用中心锚点, 角度) {
    const 锚点 = 使用中心锚点 ? { x: 0, y: 0 } : this.交互状态.缩放锚点;
    const 被拖拽点初始位置 = this.交互状态.被拖拽点初始位置;
    const 被拖拽点局部X = 使用中心锚点 ? 鼠标局部X : 被拖拽点初始位置.x + 局部Dx;
    const 被拖拽点局部Y = 使用中心锚点 ? 鼠标局部Y : 被拖拽点初始位置.y + 局部Dy;
    const 新宽度 = Math.max(10, Math.abs(被拖拽点局部X - 锚点.x));
    const 新高度 = Math.max(10, Math.abs(被拖拽点局部Y - 锚点.y));
    if (使用中心锚点) {
      this.矩形.x = 缩放起始.矩形中心X;
      this.矩形.y = 缩放起始.矩形中心Y;
      this.矩形.宽度 = Math.max(10, Math.abs(被拖拽点局部X) * 2);
      this.矩形.高度 = Math.max(10, Math.abs(被拖拽点局部Y) * 2);
    } else {
      const 锚点世界 = this.局部坐标转世界坐标(缩放起始.矩形中心X, 缩放起始.矩形中心Y, 锚点.x, 锚点.y, 角度);
      const 被拖拽点世界 = this.局部坐标转世界坐标(
        缩放起始.矩形中心X,
        缩放起始.矩形中心Y,
        被拖拽点局部X,
        被拖拽点局部Y,
        角度
      );
      this.矩形.x = (锚点世界.x + 被拖拽点世界.x) / 2;
      this.矩形.y = (锚点世界.y + 被拖拽点世界.y) / 2;
      this.矩形.宽度 = 新宽度;
      this.矩形.高度 = 新高度;
    }
    this.保存矩形状态到LocalStorage();
  }
  局部坐标转世界坐标(中心X, 中心Y, 局部X, 局部Y, 角度) {
    return {
      x: 中心X + 局部X * Math.cos(角度) - 局部Y * Math.sin(角度),
      y: 中心Y + 局部X * Math.sin(角度) + 局部Y * Math.cos(角度),
    };
  }
  鼠标释放() {
    this.交互状态.正在拖动 = false;
    this.交互状态.正在缩放 = false;
    this.交互状态.正在旋转 = false;
    this.交互状态.正在拖动观察点 = false;
    this.交互状态.缩放边 = null;
    this.交互状态.缩放角 = null;
    this.canvas.classList.remove("dragging");
    this.停止所有按钮快速增减();
  }
  处理观察点拖动(鼠标位置) {
    this.观察点.x = 鼠标位置.x - this.交互状态.观察点拖动偏移.x;
    this.观察点.y = 鼠标位置.y - this.交互状态.观察点拖动偏移.y;
    this.保存观察点位置到SessionStorage();
  }
  获取控制区位置() {
    if (!this.控制区元素) return null;
    const 画布矩形 = this.canvas.getBoundingClientRect();
    const 控制区矩形 = this.控制区元素.getBoundingClientRect();
    return {
      x: 控制区矩形.left - 画布矩形.left,
      y: 控制区矩形.top - 画布矩形.top,
      width: 控制区矩形.width,
      height: 控制区矩形.height,
    };
  }
  获取按钮区域() {
    const 控制区位置 = this.获取控制区位置();
    if (!控制区位置) {
      const 画布宽度 = this.canvas.offsetWidth;
      const 画布高度 = this.canvas.offsetHeight;
      const 数字框宽度 = 120;
      const 数字框高度 = 30;
      const 按钮宽度 = 20;
      const 按钮高度 = 15;
      const 间距 = 10;
      const 右边距 = 20;
      const 下边距 = 80;
      const x数字框X = 画布宽度 - 右边距 - 数字框宽度 - 按钮宽度 - 间距;
      const y数字框X = 画布宽度 - 右边距 - 数字框宽度 - 按钮宽度 - 间距;
      const x数字框Y = 画布高度 - 下边距 - 数字框高度 - 间距 - 数字框高度;
      const y数字框Y = 画布高度 - 下边距 - 数字框高度;
      return {
        x数字框: { x: x数字框X, y: x数字框Y, width: 数字框宽度, height: 数字框高度 },
        y数字框: { x: y数字框X, y: y数字框Y, width: 数字框宽度, height: 数字框高度 },
        x增加按钮: { x: x数字框X + 数字框宽度 + 间距, y: x数字框Y, width: 按钮宽度, height: 按钮高度 },
        x减少按钮: { x: x数字框X + 数字框宽度 + 间距, y: x数字框Y + 按钮高度, width: 按钮宽度, height: 按钮高度 },
        y增加按钮: { x: y数字框X + 数字框宽度 + 间距, y: y数字框Y, width: 按钮宽度, height: 按钮高度 },
        y减少按钮: { x: y数字框X + 数字框宽度 + 间距, y: y数字框Y + 按钮高度, width: 按钮宽度, height: 按钮高度 },
      };
    }
    const 数字框宽度 = 120;
    const 数字框高度 = 30;
    const 按钮宽度 = 20;
    const 按钮高度 = 15;
    const 间距 = 10;
    const 控件间距 = 10;
    const 控件与控制区间距 = 10;
    const 控件总宽度 = 数字框宽度 + 间距 + 按钮宽度;
    const x数字框X = 控制区位置.x + 控制区位置.width - 控件总宽度;
    const y数字框X = 控制区位置.x + 控制区位置.width - 控件总宽度;
    const x数字框Y = 控制区位置.y - 控件与控制区间距 - 数字框高度 - 控件间距 - 数字框高度;
    const y数字框Y = 控制区位置.y - 控件与控制区间距 - 数字框高度;
    return {
      x数字框: { x: x数字框X, y: x数字框Y, width: 数字框宽度, height: 数字框高度 },
      y数字框: { x: y数字框X, y: y数字框Y, width: 数字框宽度, height: 数字框高度 },
      x增加按钮: { x: x数字框X + 数字框宽度 + 间距, y: x数字框Y, width: 按钮宽度, height: 按钮高度 },
      x减少按钮: { x: x数字框X + 数字框宽度 + 间距, y: x数字框Y + 按钮高度, width: 按钮宽度, height: 按钮高度 },
      y增加按钮: { x: y数字框X + 数字框宽度 + 间距, y: y数字框Y, width: 按钮宽度, height: 按钮高度 },
      y减少按钮: { x: y数字框X + 数字框宽度 + 间距, y: y数字框Y + 按钮高度, width: 按钮宽度, height: 按钮高度 },
    };
  }
  检查按钮点击(鼠标位置, 按钮区域) {
    if (this.点在区域内(鼠标位置, 按钮区域.x增加按钮)) return "x增加";
    if (this.点在区域内(鼠标位置, 按钮区域.x减少按钮)) return "x减少";
    if (this.点在区域内(鼠标位置, 按钮区域.y增加按钮)) return "y增加";
    if (this.点在区域内(鼠标位置, 按钮区域.y减少按钮)) return "y减少";
    return null;
  }
  点在区域内(点, 区域) {
    return 点.x >= 区域.x && 点.x <= 区域.x + 区域.width && 点.y >= 区域.y && 点.y <= 区域.y + 区域.height;
  }
  更新坐标系选择文本() {
    if (this.坐标系选择文本) {
      this.坐标系选择文本.textContent = this.显示选项.使用世界坐标系 ? "世界坐标系" : "局部坐标系";
    }
  }
  处理按钮按下(按钮类型) {
    const 按钮状态 = this.交互状态.按钮状态[按钮类型];
    按钮状态.按下 = true;
    按钮状态.按下时间 = performance.now();
    按钮状态.快速增减定时器 = null;
    按钮状态.悬停 = true;
    this.执行按钮操作(按钮类型);
    this.绘制场景();
    setTimeout(() => {
      if (按钮状态.按下 && 按钮状态.悬停) {
        this.开始快速增减(按钮类型);
      }
    }, 500);
  }
  执行按钮操作(按钮类型) {
    let 步进 = 1;
    if (this.交互状态.Shift键按下) {
      步进 = 10;
    } else if (this.交互状态.Ctrl键按下) {
      步进 = 5;
    }
    let 坐标值 = 0;
    if (this.显示选项.使用世界坐标系) {
      if (按钮类型 === "x增加") {
        this.观察点.x += 步进;
        坐标值 = this.观察点.x;
      } else if (按钮类型 === "x减少") {
        this.观察点.x -= 步进;
        坐标值 = this.观察点.x;
      } else if (按钮类型 === "y增加") {
        this.观察点.y += 步进;
        坐标值 = this.观察点.y;
      } else if (按钮类型 === "y减少") {
        this.观察点.y -= 步进;
        坐标值 = this.观察点.y;
      }
    } else {
      const 矩形 = this.矩形;
      const dx = this.观察点.x - 矩形.x;
      const dy = this.观察点.y - 矩形.y;
      const 弧度 = (-矩形.旋转角度 * Math.PI) / 180;
      let 局部X = dx * Math.cos(弧度) - dy * Math.sin(弧度);
      let 局部Y = dx * Math.sin(弧度) + dy * Math.cos(弧度);
      if (按钮类型 === "x增加") {
        局部X += 步进;
      } else if (按钮类型 === "x减少") {
        局部X -= 步进;
      } else if (按钮类型 === "y增加") {
        局部Y += 步进;
      } else if (按钮类型 === "y减少") {
        局部Y -= 步进;
      }
      const 角度 = (矩形.旋转角度 * Math.PI) / 180;
      const 世界X = 矩形.x + 局部X * Math.cos(角度) - 局部Y * Math.sin(角度);
      const 世界Y = 矩形.y + 局部X * Math.sin(角度) + 局部Y * Math.cos(角度);
      this.观察点.x = 世界X;
      this.观察点.y = 世界Y;
    }
    this.保存观察点位置到SessionStorage();
  }
  开始快速增减(按钮类型) {
    const 按钮状态 = this.交互状态.按钮状态[按钮类型];
    if (!按钮状态.按下 || !按钮状态.悬停) return;
    const 快速增减 = () => {
      if (按钮状态.按下 && 按钮状态.悬停) {
        this.执行按钮操作(按钮类型);
        this.绘制场景();
        按钮状态.快速增减定时器 = setTimeout(快速增减, 50);
      }
    };
    快速增减();
  }
  停止所有按钮快速增减() {
    Object.keys(this.交互状态.按钮状态).forEach((按钮类型) => {
      const 按钮状态 = this.交互状态.按钮状态[按钮类型];
      按钮状态.按下 = false;
      按钮状态.按下时间 = null;
      if (按钮状态.快速增减定时器) {
        clearTimeout(按钮状态.快速增减定时器);
        按钮状态.快速增减定时器 = null;
      }
    });
  }
  更新按钮悬停状态(鼠标位置) {
    const 按钮区域 = this.获取按钮区域();
    const 按钮类型列表 = ["x增加", "x减少", "y增加", "y减少"];
    按钮类型列表.forEach((按钮类型) => {
      const 按钮状态 = this.交互状态.按钮状态[按钮类型];
      const 区域 = 按钮区域[按钮类型 + "按钮"];
      const 之前悬停 = 按钮状态.悬停;
      按钮状态.悬停 = this.点在区域内(鼠标位置, 区域);
      if (之前悬停 && !按钮状态.悬停) {
        按钮状态.按下 = false;
        if (按钮状态.快速增减定时器) {
          clearTimeout(按钮状态.快速增减定时器);
          按钮状态.快速增减定时器 = null;
        }
      }
    });
  }
  绘制场景() {
    this.清空画布();
    if (this.显示选项.世界坐标系) {
      this.绘制世界坐标系();
    }
    if (this.显示选项.局部坐标系) {
      this.绘制局部坐标系();
    }
    this.绘制矩形();
    this.绘制观察点();
    if (this.显示选项.观察点坐标) {
      this.绘制观察点坐标();
    }
    if (this.显示选项.鼠标坐标) {
      this.绘制坐标信息();
    }
    if (this.显示选项.鼠标坐标参考线) {
      this.绘制坐标参考线();
    }
    this.绘制数字框和按钮();
    if (this.显示选项.坐标转换过程) {
      this.绘制坐标转换公式();
    }
  }
  绘制世界坐标系() {
    const 宽度 = this.canvas.offsetWidth;
    const 高度 = this.canvas.offsetHeight;
    this.ctx.save();
    this.ctx.strokeStyle = "#ffffff1a";
    this.ctx.lineWidth = 0.5;
    for (let x = 0; x <= 宽度; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, 高度);
      this.ctx.stroke();
    }
    for (let y = 0; y <= 高度; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(宽度, y);
      this.ctx.stroke();
    }
    this.ctx.strokeStyle = "#4fc3f7";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(宽度, 0);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, 高度);
    this.ctx.stroke();
    this.ctx.fillStyle = "#6fa8fdff";
    this.ctx.font = "12px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.textBaseline = "top";
    for (let x = 100; x < 宽度; x += 100) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, -5);
      this.ctx.lineTo(x, 5);
      this.ctx.stroke();
      this.ctx.fillText(`${x}`, x - 10, 10);
    }
    for (let y = 100; y < 高度; y += 100) {
      this.ctx.beginPath();
      this.ctx.moveTo(-5, y);
      this.ctx.lineTo(5, y);
      this.ctx.stroke();
      this.ctx.fillText(`${y}`, 10, y - 5);
    }
    this.ctx.fillStyle = "lightcyan";
    this.ctx.font = "13px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.fillText("世界坐标系", 5, 10);
    this.ctx.fillText("0, 0", 5, 25);
    this.ctx.restore();
  }
  绘制矩形() {
    const 矩形 = this.矩形;
    this.ctx.save();
    this.ctx.translate(矩形.x, 矩形.y);
    this.ctx.rotate((矩形.旋转角度 * Math.PI) / 180);
    this.ctx.fillStyle = this.交互状态.鼠标已悬停 ? "rgba(79, 195, 247, 0.2)" : "rgba(79, 195, 247, 0.075)";
    this.ctx.strokeStyle = "#4fc3f7";
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(-矩形.宽度 / 2, -矩形.高度 / 2, 矩形.宽度, 矩形.高度);
    this.ctx.strokeRect(-矩形.宽度 / 2, -矩形.高度 / 2, 矩形.宽度, 矩形.高度);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 4, 0, 2 * Math.PI);
    this.ctx.fillStyle = "#ff5722";
    this.ctx.fill();
    const 半宽 = 矩形.宽度 / 2;
    const 半高 = 矩形.高度 / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -半高);
    this.ctx.lineTo(0, -半高 - 20);
    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(0, -半高 - 20, 6, 0, 2 * Math.PI);
    this.ctx.fillStyle = "#111";
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.fillStyle = "#4fc3f7";
    this.ctx.beginPath();
    this.ctx.arc(半宽, 0, 5, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(-半宽, 0, 5, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(0, 半高, 5, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(0, -半高, 5, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.fillStyle = "yellowgreen";
    this.ctx.beginPath();
    this.ctx.arc(半宽, 半高, 5, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(-半宽, 半高, 5, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(半宽, -半高, 5, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(-半宽, -半高, 5, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.restore();

    const 旋转句柄局部X = 0;
    const 旋转句柄局部Y = -半高 - 20;
    const 角度 = (矩形.旋转角度 * Math.PI) / 180;
    const 旋转句柄世界X = 矩形.x + 旋转句柄局部X * Math.cos(角度) - 旋转句柄局部Y * Math.sin(角度);
    const 旋转句柄世界Y = 矩形.y + 旋转句柄局部X * Math.sin(角度) + 旋转句柄局部Y * Math.cos(角度);

    const 法线局部X = 0;
    const 法线局部Y = -1;
    const 法线世界X = 法线局部X * Math.cos(角度) - 法线局部Y * Math.sin(角度);
    const 法线世界Y = 法线局部X * Math.sin(角度) + 法线局部Y * Math.cos(角度);

    this.ctx.font = "13px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    const 角度值文本 = this.精确格式化数字(矩形.旋转角度, 1);
    const 单位文本 = "°";
    const 角度值宽度 = this.ctx.measureText(角度值文本).width;
    const 单位宽度 = this.ctx.measureText(单位文本).width;
    const 文本总宽度 = 角度值宽度 + 单位宽度;
    const 文本高度 = 13;

    const 间距 = 20;
    const 文本半宽 = 文本总宽度 / 2;
    const 文本半高 = 文本高度 / 2;

    const 法线长度 = Math.sqrt(法线世界X * 法线世界X + 法线世界Y * 法线世界Y);
    const 法线单位X = 法线长度 > 0 ? 法线世界X / 法线长度 : 0;
    const 法线单位Y = 法线长度 > 0 ? 法线世界Y / 法线长度 : 0;

    let 到水平边界距离 = Infinity;
    let 到垂直边界距离 = Infinity;

    if (Math.abs(法线单位X) > 0.0001) {
      到水平边界距离 = 文本半宽 / Math.abs(法线单位X);
    }
    if (Math.abs(法线单位Y) > 0.0001) {
      到垂直边界距离 = 文本半高 / Math.abs(法线单位Y);
    }

    const 边界点到中心距离沿法线 = Math.min(到水平边界距离, 到垂直边界距离);

    const 文本中心X = 旋转句柄世界X + 法线单位X * (间距 + 边界点到中心距离沿法线);
    const 文本中心Y = 旋转句柄世界Y + 法线单位Y * (间距 + 边界点到中心距离沿法线);

    this.ctx.save();
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "left";

    // 绘制角度值，小数点使用gray颜色
    // 计算角度值文本的左对齐起始位置（原来使用center对齐，所以需要计算左对齐位置）
    const 角度值中心X = 文本中心X - 单位宽度 / 2;
    const 角度值左对齐X = 角度值中心X - 角度值宽度 / 2;
    let 当前X = 角度值左对齐X;
    for (let i = 0; i < 角度值文本.length; i++) {
      const 字符 = 角度值文本[i];
      if (字符 === ".") {
        this.ctx.fillStyle = "gray";
      } else {
        this.ctx.fillStyle = "#d6a";
      }
      this.ctx.fillText(字符, 当前X, 文本中心Y);
      当前X += this.ctx.measureText(字符).width;
    }
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#4cf";
    this.ctx.fillText(单位文本, 文本中心X + 角度值宽度 / 2, 文本中心Y);
    this.ctx.restore();
  }
  绘制局部坐标系() {
    const 矩形 = this.矩形;
    const 半宽 = 矩形.宽度 / 2;
    const 半高 = 矩形.高度 / 2;
    this.ctx.save();
    this.ctx.translate(矩形.x, 矩形.y);
    this.ctx.rotate((矩形.旋转角度 * Math.PI) / 180);
    this.ctx.strokeStyle = "#ff5722";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(半宽, 0);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, 半高);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(半宽, 0);
    this.ctx.lineTo(半宽 - 10, -5);
    this.ctx.lineTo(半宽 - 10, 5);
    this.ctx.closePath();
    this.ctx.fillStyle = "#ff5722";
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(0, 半高);
    this.ctx.lineTo(-5, 半高 - 10);
    this.ctx.lineTo(5, 半高 - 10);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.fillStyle = "#ff9f22ff";
    this.ctx.font = "12px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.textBaseline = "top";
    for (let x = 50; x <= 半宽; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, -5);
      this.ctx.lineTo(x, 5);
      this.ctx.stroke();
      if (x % 100 === 0) {
        this.ctx.fillText(`${x}`, x - 10, 10);
      } else {
        this.ctx.fillText(`${x}`, x - 10, -20);
      }
    }
    for (let y = 50; y <= 半高; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(-5, y);
      this.ctx.lineTo(5, y);
      this.ctx.stroke();
      if (y % 100 === 0) {
        this.ctx.fillText(`${y}`, 10, y - 5);
      } else {
        this.ctx.fillText(`${y}`, -30, y - 5);
      }
    }
    this.ctx.textAlign = "right";
    this.ctx.font = "13px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.fillStyle = "#5AF";
    this.ctx.fillText("世界坐标系", -15, -45);
    this.ctx.fillStyle = "lightcyan";
    this.ctx.fillText(`${Math.floor(矩形.x)}, ${Math.floor(矩形.y)}`, -15, -30);
    this.ctx.fillStyle = "#5AF";
    this.ctx.fillText("局部坐标系", -15, -5);
    this.ctx.fillStyle = "lightcyan";
    this.ctx.fillText("0, 0", -15, 10);
    this.ctx.restore();
  }
  绘制坐标信息() {
    if (!this.复选框.鼠标坐标.checked) return;
    const 矩形 = this.矩形;
    let x = this.canvas.offsetWidth / 2;
    let y = 30;
    let 局部X = 0;
    let 局部Y = 0;
    if (this.鼠标坐标.x !== null && this.鼠标坐标.y !== null) {
      x = this.鼠标坐标.x;
      y = this.鼠标坐标.y;
      const dx = this.鼠标坐标.x - 矩形.x;
      const dy = this.鼠标坐标.y - 矩形.y;
      const 弧度 = (-矩形.旋转角度 * Math.PI) / 180;
      局部X = dx * Math.cos(弧度) - dy * Math.sin(弧度);
      局部Y = dx * Math.sin(弧度) + dy * Math.cos(弧度);
    }
    this.ctx.save();
    const 鼠标与文本距离 = 40;
    const 行距 = 18;
    const 符号颜色 = "gray";
    this.ctx.font = "13px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.textBaseline = "top";
    if (this.鼠标坐标.x !== null && this.鼠标坐标.y !== null) {
      const xy宽度 = this.ctx.measureText("世界坐标").width;
      const 冒号空格宽度 = this.ctx.measureText(": ").width;
      const 世界x坐标值宽度 = this.ctx.measureText(`${Math.floor(this.鼠标坐标.x)}`).width;
      const 世界y坐标值宽度 = this.ctx.measureText(`${Math.floor(this.鼠标坐标.y)}`).width;
      const 局部x坐标值宽度 = this.ctx.measureText(`${Math.round(局部X)}`).width;
      const 局部y坐标值宽度 = this.ctx.measureText(`${Math.round(局部Y)}`).width;
      const 逗号空格宽度 = this.ctx.measureText(", ").width;
      const 世界总宽度 = xy宽度 + 冒号空格宽度 + 世界x坐标值宽度 + 逗号空格宽度 + 世界y坐标值宽度;
      const 局部总宽度 = xy宽度 + 冒号空格宽度 + 局部x坐标值宽度 + 逗号空格宽度 + 局部y坐标值宽度;
      if (x <= 世界总宽度 / 2 + 15) {
        x = 世界总宽度 / 2 + 15;
      } else if (x >= this.canvas.offsetWidth - 世界总宽度 / 2 - 25) {
        x = this.canvas.offsetWidth - 世界总宽度 / 2 - 25;
      }
      if (y <= -鼠标与文本距离 + 14) {
        y = -鼠标与文本距离 + 14;
      } else if (y >= this.canvas.offsetHeight - 86) {
        y = this.canvas.offsetHeight - 86;
      }
      if (this.显示选项.鼠标坐标背景) {
        const 最大宽度 = Math.max(世界总宽度, 局部总宽度);
        this.ctx.beginPath();
        this.ctx.fillStyle = "#000a";
        this.ctx.roundRect(x - 最大宽度 / 2 - 15, y + 鼠标与文本距离 - 15, 最大宽度 + 30, 行距 * 2 + 24, [8]);
        this.ctx.fill();
      }
      const 世界坐标垂直坐标 = y + 鼠标与文本距离;
      this.ctx.fillStyle = "silver";
      this.ctx.fillText("世界坐标", x - 世界总宽度 / 2, 世界坐标垂直坐标);
      this.ctx.fillStyle = 符号颜色;
      this.ctx.fillText(": ", x - 世界总宽度 / 2 + xy宽度, 世界坐标垂直坐标);
      this.ctx.fillStyle = "lightskyblue";
      this.ctx.fillText(`${Math.floor(x)}`, x - 世界总宽度 / 2 + xy宽度 + 冒号空格宽度, 世界坐标垂直坐标);
      this.ctx.fillStyle = 符号颜色;
      this.ctx.fillText(", ", x - 世界总宽度 / 2 + xy宽度 + 冒号空格宽度 + 世界x坐标值宽度, 世界坐标垂直坐标);
      this.ctx.fillStyle = "lightskyblue";
      this.ctx.fillText(
        `${Math.floor(this.鼠标坐标.y)}`,
        x - 世界总宽度 / 2 + xy宽度 + 冒号空格宽度 + 世界x坐标值宽度 + 逗号空格宽度,
        世界坐标垂直坐标
      );
      const 局部坐标垂直坐标 = y + 鼠标与文本距离 + 行距;
      this.ctx.fillStyle = "silver";
      this.ctx.fillText("局部坐标", x - 世界总宽度 / 2, 局部坐标垂直坐标);
      this.ctx.fillStyle = 符号颜色;
      this.ctx.fillText(": ", x - 世界总宽度 / 2 + xy宽度, 局部坐标垂直坐标);
      this.ctx.fillStyle = "#ff5722";
      this.ctx.fillText(`${Math.round(局部X)}`, x - 世界总宽度 / 2 + xy宽度 + 冒号空格宽度, 局部坐标垂直坐标);
      this.ctx.fillStyle = 符号颜色;
      this.ctx.fillText(", ", x - 世界总宽度 / 2 + xy宽度 + 冒号空格宽度 + 局部x坐标值宽度, 局部坐标垂直坐标);
      this.ctx.fillStyle = "#ff5722";
      this.ctx.fillText(
        `${Math.round(局部Y)}`,
        x - 世界总宽度 / 2 + xy宽度 + 冒号空格宽度 + 局部x坐标值宽度 + 逗号空格宽度,
        局部坐标垂直坐标
      );
    } else {
      this.ctx.fillStyle = "silver";
      this.ctx.fillText(`矩形中心: (${Math.floor(矩形.x)}, ${Math.floor(矩形.y)})`, x - 100, y);
      this.ctx.fillText(`旋转角度: ${Math.floor(矩形.旋转角度)}°`, x - 100, y + 18);
      this.ctx.fillText(`尺寸: ${Math.floor(矩形.宽度)} × ${Math.floor(矩形.高度)}`, x - 100, y + 36);
    }
    this.ctx.restore();
  }
  绘制坐标参考线() {
    if (!this.复选框.鼠标坐标参考线.checked) return;
    if (this.鼠标坐标.x === null || this.鼠标坐标.y === null) return;
    const 画布宽度 = this.canvas.offsetWidth;
    const 画布高度 = this.canvas.offsetHeight;
    const 鼠标X = this.鼠标坐标.x;
    const 鼠标Y = this.鼠标坐标.y;
    if (鼠标X < 0 || 鼠标X > 画布宽度 || 鼠标Y < 0 || 鼠标Y > 画布高度) return;

    this.ctx.save();
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.lineWidth = 1;

    if (this.显示选项.使用世界坐标系) {
    this.ctx.beginPath();
    this.ctx.moveTo(鼠标X, 鼠标Y);
    this.ctx.lineTo(鼠标X, 0);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(鼠标X, 鼠标Y);
    this.ctx.lineTo(0, 鼠标Y);
    this.ctx.stroke();
    } else {
      const 矩形 = this.矩形;
      const dx = 鼠标X - 矩形.x;
      const dy = 鼠标Y - 矩形.y;
      const 弧度 = (-矩形.旋转角度 * Math.PI) / 180;
      const 局部X = dx * Math.cos(弧度) - dy * Math.sin(弧度);
      const 局部Y = dx * Math.sin(弧度) + dy * Math.cos(弧度);
      const 半宽 = 矩形.宽度 / 2;
      const 半高 = 矩形.高度 / 2;

      const 角度 = (矩形.旋转角度 * Math.PI) / 180;

      const 局部坐标系原点 = { x: 0, y: 0 };
      const 鼠标局部位置 = { x: 局部X, y: 局部Y };

      const 局部X线起点 = { x: 局部坐标系原点.x, y: 局部Y };
      const 局部X线终点 = 鼠标局部位置;

      const 局部Y线起点 = { x: 局部X, y: 局部坐标系原点.y };
      const 局部Y线终点 = 鼠标局部位置;

      const 局部X线起点世界 = this.局部坐标转世界坐标(矩形.x, 矩形.y, 局部X线起点.x, 局部X线起点.y, 角度);
      const 局部X线终点世界 = this.局部坐标转世界坐标(矩形.x, 矩形.y, 局部X线终点.x, 局部X线终点.y, 角度);
      const 局部Y线起点世界 = this.局部坐标转世界坐标(矩形.x, 矩形.y, 局部Y线起点.x, 局部Y线起点.y, 角度);
      const 局部Y线终点世界 = this.局部坐标转世界坐标(矩形.x, 矩形.y, 局部Y线终点.x, 局部Y线终点.y, 角度);

      this.ctx.beginPath();
      this.ctx.moveTo(局部X线起点世界.x, 局部X线起点世界.y);
      this.ctx.lineTo(局部X线终点世界.x, 局部X线终点世界.y);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(局部Y线起点世界.x, 局部Y线起点世界.y);
      this.ctx.lineTo(局部Y线终点世界.x, 局部Y线终点世界.y);
      this.ctx.stroke();
  }

    this.ctx.restore();
  }
  绘制观察点() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.观察点.x, this.观察点.y, this.观察点.半径, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.交互状态.观察点悬停 ? "#ff2722" : "#880712";
    this.ctx.fill();
    this.ctx.strokeStyle = this.交互状态.观察点悬停 ? "#fff" : "#aaa";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }
  绘制观察点坐标() {
    // 计算世界坐标
    const 世界X = Math.round(this.观察点.x);
    const 世界Y = Math.round(this.观察点.y);
    
    // 计算局部坐标
    const 矩形 = this.矩形;
    const dx = this.观察点.x - 矩形.x;
    const dy = this.观察点.y - 矩形.y;
    const 弧度 = (-矩形.旋转角度 * Math.PI) / 180;
    const 局部X = Math.round(dx * Math.cos(弧度) - dy * Math.sin(弧度));
    const 局部Y = Math.round(dx * Math.sin(弧度) + dy * Math.cos(弧度));
    
    this.ctx.save();
    this.ctx.font = "14px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.textBaseline = "top";
    
    // 准备文本
    const 世界文本 = "世界";
    const 局部文本 = "局部";
    const x文本 = "x";
    const y文本 = "y";
    const 冒号 = ":";
    const 世界x值文本 = `${世界X}`;
    const 世界y值文本 = `${世界Y}`;
    const 局部x值文本 = `${局部X}`;
    const 局部y值文本 = `${局部Y}`;
    
    // 测量文本宽度
    const 世界文本宽度 = this.ctx.measureText(世界文本).width;
    const 局部文本宽度 = this.ctx.measureText(局部文本).width;
    const x文本宽度 = this.ctx.measureText(x文本).width;
    const y文本宽度 = this.ctx.measureText(y文本).width;
    const 冒号宽度 = this.ctx.measureText(冒号).width;
    const 世界x值文本宽度 = this.ctx.measureText(世界x值文本).width;
    const 世界y值文本宽度 = this.ctx.measureText(世界y值文本).width;
    const 局部x值文本宽度 = this.ctx.measureText(局部x值文本).width;
    const 局部y值文本宽度 = this.ctx.measureText(局部y值文本).width;
    
    // 计算最大宽度（包括"世界"/"局部"和"x"/"y"之间1的间隙）
    const 最大标签宽度 = Math.max(世界文本宽度 + 1 + x文本宽度, 世界文本宽度 + 1 + y文本宽度, 局部文本宽度 + 1 + x文本宽度, 局部文本宽度 + 1 + y文本宽度);
    const 最大数值宽度 = Math.max(世界x值文本宽度, 世界y值文本宽度, 局部x值文本宽度, 局部y值文本宽度);
    const 总文本宽度 = 最大标签宽度 + 2 + 冒号宽度 + 4 + 最大数值宽度;
    
    const 行高 = 18;
    const 间距 = 10;
    const 画布高度 = this.canvas.offsetHeight;
    const 文本总高度 = 行高 * 4; // 4行：局部x、局部y、世界x、世界y
    
    // 计算文本起始位置（局部坐标在上方，世界坐标在下方）
    let 文本起始Y = this.观察点.y + this.观察点.半径 + 间距;
    if (文本起始Y + 文本总高度 > 画布高度) {
      文本起始Y = this.观察点.y - this.观察点.半径 - 间距 - 文本总高度;
    }
    if (文本起始Y < 0) {
      文本起始Y = 0;
    } else if (文本起始Y + 文本总高度 > 画布高度) {
      文本起始Y = 画布高度 - 文本总高度;
    }
    
    let 文本起始X = this.观察点.x - 总文本宽度 / 2;
    const 画布宽度 = this.canvas.offsetWidth;
    if (文本起始X < 0) {
      文本起始X = 0;
    } else if (文本起始X + 总文本宽度 > 画布宽度) {
      文本起始X = 画布宽度 - 总文本宽度;
    }
    
    // 颜色定义
    const 世界颜色 = "#5AF"; // 世界坐标标题颜色
    const 局部颜色 = "#dd8742"; // 局部坐标标题颜色
    const 世界数值颜色 = "lightseagreen"; // 世界坐标数字颜色
    const 局部数值颜色 = "#50c878"; // 局部坐标数字颜色
    const 冒号颜色 = "#aaa";
    
    // 绘制局部坐标（上方）
    let 当前Y = 文本起始Y;
    let 当前X = 文本起始X;
    
    // 局部x
    this.ctx.fillStyle = 局部颜色;
    this.ctx.fillText(局部文本, 当前X, 当前Y);
    当前X += 局部文本宽度 + 1; // "局部"和"x"之间1的间隙
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.fillText(x文本, 当前X, 当前Y);
    当前X += x文本宽度;
    this.ctx.fillStyle = 冒号颜色;
    this.ctx.fillText(冒号, 当前X + 1, 当前Y);
    当前X += 2 + 冒号宽度;
    this.ctx.fillStyle = 局部数值颜色;
    this.ctx.fillText(局部x值文本, 当前X + 4, 当前Y); // 冒号和数字之间4的间隙
    
    // 局部y
    当前Y += 行高;
    当前X = 文本起始X;
    this.ctx.fillStyle = 局部颜色;
    this.ctx.fillText(局部文本, 当前X, 当前Y);
    当前X += 局部文本宽度 + 1; // "局部"和"y"之间1的间隙
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.fillText(y文本, 当前X, 当前Y);
    当前X += y文本宽度;
    this.ctx.fillStyle = 冒号颜色;
    this.ctx.fillText(冒号, 当前X + 1, 当前Y);
    当前X += 2 + 冒号宽度;
    this.ctx.fillStyle = 局部数值颜色;
    this.ctx.fillText(局部y值文本, 当前X + 4, 当前Y); // 冒号和数字之间4的间隙
    
    // 绘制世界坐标（下方）
    当前Y += 行高;
    当前X = 文本起始X;
    
    // 世界x
    this.ctx.fillStyle = 世界颜色;
    this.ctx.fillText(世界文本, 当前X, 当前Y);
    当前X += 世界文本宽度 + 1; // "世界"和"x"之间1的间隙
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.fillText(x文本, 当前X, 当前Y);
    当前X += x文本宽度;
    this.ctx.fillStyle = 冒号颜色;
    this.ctx.fillText(冒号, 当前X + 1, 当前Y);
    当前X += 2 + 冒号宽度;
    this.ctx.fillStyle = 世界数值颜色;
    this.ctx.fillText(世界x值文本, 当前X + 4, 当前Y); // 冒号和数字之间4的间隙
    
    // 世界y
    当前Y += 行高;
    当前X = 文本起始X;
    this.ctx.fillStyle = 世界颜色;
    this.ctx.fillText(世界文本, 当前X, 当前Y);
    当前X += 世界文本宽度 + 1; // "世界"和"y"之间1的间隙
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.fillText(y文本, 当前X, 当前Y);
    当前X += y文本宽度;
    this.ctx.fillStyle = 冒号颜色;
    this.ctx.fillText(冒号, 当前X + 1, 当前Y);
    当前X += 2 + 冒号宽度;
    this.ctx.fillStyle = 世界数值颜色;
    this.ctx.fillText(世界y值文本, 当前X + 4, 当前Y); // 冒号和数字之间4的间隙
    
    this.ctx.restore();
  }
  绘制数字框和按钮() {
    let x值, y值;
    if (this.显示选项.使用世界坐标系) {
      x值 = Math.round(this.观察点.x);
      y值 = Math.round(this.观察点.y);
    } else {
      const 矩形 = this.矩形;
      const dx = this.观察点.x - 矩形.x;
      const dy = this.观察点.y - 矩形.y;
      const 弧度 = (-矩形.旋转角度 * Math.PI) / 180;
      x值 = Math.round(dx * Math.cos(弧度) - dy * Math.sin(弧度));
      y值 = Math.round(dx * Math.sin(弧度) + dy * Math.cos(弧度));
    }
    const 按钮区域 = this.获取按钮区域();
    const x数字框X = 按钮区域.x数字框.x;
    const y数字框X = 按钮区域.y数字框.x;
    const x数字框Y = 按钮区域.x数字框.y;
    const y数字框Y = 按钮区域.y数字框.y;
    const 数字框宽度 = 按钮区域.x数字框.width;
    const 数字框高度 = 按钮区域.x数字框.height;
    this.ctx.save();
    this.ctx.fillStyle = "#000a";
    this.ctx.fillRect(x数字框X, x数字框Y, 数字框宽度, 数字框高度);
    this.ctx.strokeStyle = "#4fc3f7";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x数字框X, x数字框Y, 数字框宽度, 数字框高度);
    this.ctx.font = "14px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.textBaseline = "middle";
    const x文本 = "x";
    const 冒号 = ":";
    const x值文本 = `${x值}`;
    const x文本宽度 = this.ctx.measureText(x文本).width;
    const 冒号宽度 = this.ctx.measureText(冒号).width;
    const 固定数值宽度 = this.ctx.measureText("1234").width;
    const 总文本宽度 = x文本宽度 + 2 + 冒号宽度 + 4 + 固定数值宽度;
    const 起始X = x数字框X + (数字框宽度 - 总文本宽度) / 2;
    const 文本Y = x数字框Y + 数字框高度 / 2;
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.fillText(x文本, 起始X, 文本Y);
    this.ctx.fillStyle = "#aaa";
    this.ctx.fillText(冒号, 起始X + x文本宽度 + 2, 文本Y);
    this.ctx.fillStyle = "#ea8a24";
    this.ctx.fillText(x值文本, 起始X + x文本宽度 + 2 + 冒号宽度 + 4, 文本Y);
    this.ctx.fillStyle = "#000a";
    this.ctx.fillRect(y数字框X, y数字框Y, 数字框宽度, 数字框高度);
    this.ctx.strokeStyle = "#4fc3f7";
    this.ctx.strokeRect(y数字框X, y数字框Y, 数字框宽度, 数字框高度);
    const y文本 = "y";
    const y值文本 = `${y值}`;
    const y文本宽度 = this.ctx.measureText(y文本).width;
    const y文本Y = y数字框Y + 数字框高度 / 2;
    const 对齐起始X = y数字框X + (数字框宽度 - 总文本宽度) / 2;
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.fillText(y文本, 对齐起始X, y文本Y);
    this.ctx.fillStyle = "#aaa";
    this.ctx.fillText(冒号, 对齐起始X + y文本宽度 + 2, y文本Y);
    this.ctx.fillStyle = "#ea8a24";
    this.ctx.fillText(y值文本, 对齐起始X + y文本宽度 + 2 + 冒号宽度 + 4, y文本Y);
    this.绘制按钮("x增加", 按钮区域.x增加按钮);
    this.绘制按钮("x减少", 按钮区域.x减少按钮);
    this.绘制按钮("y增加", 按钮区域.y增加按钮);
    this.绘制按钮("y减少", 按钮区域.y减少按钮);
    this.ctx.restore();
  }
  绘制按钮(按钮类型, 区域) {
    const 按钮状态 = this.交互状态.按钮状态[按钮类型];
    const 是增加按钮 = 按钮类型.includes("增加");
    this.ctx.fillStyle = 按钮状态.悬停 ? "#2C8F30" : "#444";
    this.ctx.fillRect(区域.x, 区域.y, 区域.width, 区域.height);
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(区域.x, 区域.y, 区域.width, 区域.height);
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "14px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    const 按钮文本 = 是增加按钮 ? "+" : "-";
    this.ctx.fillText(按钮文本, 区域.x + 区域.width / 2, 区域.y + 区域.height / 2);
  }
  绘制坐标转换公式() {
    const 矩形 = this.矩形;
    const 观察点世界X = this.观察点.x;
    const 观察点世界Y = this.观察点.y;
    const dx = 观察点世界X - 矩形.x;
    const dy = 观察点世界Y - 矩形.y;
    const 弧度 = (-矩形.旋转角度 * Math.PI) / 180;
    const cos弧度 = Math.cos(弧度);
    const sin弧度 = Math.sin(弧度);
    const 局部X = dx * cos弧度 - dy * sin弧度;
    const 局部Y = dx * sin弧度 + dy * cos弧度;
    const 角度 = (矩形.旋转角度 * Math.PI) / 180;
    const cos角度 = Math.cos(角度);
    const sin角度 = Math.sin(角度);
    const 计算世界X = 矩形.x + 局部X * cos角度 - 局部Y * sin角度;
    const 计算世界Y = 矩形.y + 局部X * sin角度 + 局部Y * cos角度;
    this.ctx.save();
    this.ctx.font = "14px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "left";
    const 画布宽度 = this.canvas.offsetWidth;
    const 画布高度 = this.canvas.offsetHeight;
    const 公式区域高度 = 220;
    const 起始Y = 画布高度 - 公式区域高度;
    const 行高 = 26;
    const 数字颜色 = "#4da";
    const 等号颜色 = "lightslategray";
    const 运算符颜色 = "#ff6b6b";
    const 冒号颜色 = "gray";
    const 括号颜色 = "#d93";
    const 结果颜色 = "#78B0D7";
    const 左组变量名 = ["dx", "dy", "弧度", "cos(弧度)", "sin(弧度)", "局部X", "局部Y"];
    let 左组最大宽度 = 0;
    for (const 变量名 of 左组变量名) {
      const 宽度 = this.ctx.measureText(变量名).width;
      if (宽度 > 左组最大宽度) 左组最大宽度 = 宽度;
    }
    const 右组变量名 = ["弧度", "cos(弧度)", "sin(弧度)", "世界X", "世界Y"];
    let 右组最大宽度 = 0;
    for (const 变量名 of 右组变量名) {
      const 宽度 = this.ctx.measureText(变量名).width;
      if (宽度 > 右组最大宽度) 右组最大宽度 = 宽度;
    }
    const 角度绝对值 = Math.abs(矩形.旋转角度);
    const 显示角度值 = 角度绝对值; // 保持原始数值，在绘制时格式化为1位小数
    const 计算弧度值 = 显示角度值 === 0 ? 0 : (显示角度值 * Math.PI) / 180;
    const 计算角度值 = 显示角度值 === 0 ? 0 : (显示角度值 * Math.PI) / 180;
    const cos弧度显示值 = 计算弧度值 === 0 ? 1 : Math.cos(计算弧度值);
    const sin弧度显示值 = 计算弧度值 === 0 ? 0 : Math.sin(计算弧度值);
    const cos角度显示值 = 计算角度值 === 0 ? 1 : Math.cos(计算角度值);
    const sin角度显示值 = 计算角度值 === 0 ? 0 : Math.sin(计算角度值);
    // 使用最大可能的数值来计算固定宽度，确保宽度稳定
    const 最大数值 = 9999;
    const 最大负数 = -9999;
    const 最大角度 = 359;
    const 最大弧度 = (最大角度 * Math.PI) / 180;
    const 最大cos = Math.cos(最大弧度);
    const 最大sin = Math.sin(最大弧度);
    
    // 计算左组所有公式行的最大可能宽度
    const 左组公式行1 = this.计算公式行宽度("dx", 左组最大宽度, [最大数值, "-", 最大负数], 最大数值);
    const 左组公式行2 = this.计算公式行宽度("dy", 左组最大宽度, [最大数值, "-", 最大负数], 最大数值);
    const 左组公式行3 = this.计算公式行宽度("弧度", 左组最大宽度, [最大角度, "×", "π", "/", 180], 最大弧度);
    const 左组公式行4 = this.计算公式行宽度("cos(弧度)", 左组最大宽度, ["cos", "(", 最大弧度, ")"], 最大cos);
    const 左组公式行5 = this.计算公式行宽度("sin(弧度)", 左组最大宽度, ["sin", "(", 最大弧度, ")"], 最大sin);
    const 左组公式行6 = this.计算公式行宽度(
      "局部X",
      左组最大宽度,
      [最大数值, "×", 最大cos, "-", 最大数值, "×", 最大sin],
      最大数值
    );
    const 左组公式行7 = this.计算公式行宽度(
      "局部Y",
      左组最大宽度,
      [最大数值, "×", 最大sin, "+", 最大数值, "×", 最大cos],
      最大数值
    );
    const 左组最大行宽度 = Math.max(左组公式行1, 左组公式行2, 左组公式行3, 左组公式行4, 左组公式行5, 左组公式行6, 左组公式行7);
    
    // 计算右组所有公式行的最大可能宽度
    const 右组公式行1 = this.计算公式行宽度("弧度", 右组最大宽度, [最大角度, "×", "π", "/", 180], 最大弧度);
    const 右组公式行2 = this.计算公式行宽度("cos(弧度)", 右组最大宽度, ["cos", "(", 最大弧度, ")"], 最大cos);
    const 右组公式行3 = this.计算公式行宽度("sin(弧度)", 右组最大宽度, ["sin", "(", 最大弧度, ")"], 最大sin);
    const 右组公式行4 = this.计算公式行宽度(
      "世界X",
      右组最大宽度,
      [最大数值, "+", 最大数值, "×", 最大cos, "-", 最大数值, "×", 最大sin],
      最大数值
    );
    const 右组公式行5 = this.计算公式行宽度(
      "世界Y",
      右组最大宽度,
      [最大数值, "+", 最大数值, "×", 最大sin, "+", 最大数值, "×", 最大cos],
      最大数值
    );
    const 右组最大行宽度 = Math.max(右组公式行1, 右组公式行2, 右组公式行3, 右组公式行4, 右组公式行5);
    
    // 使用两组中最大的宽度作为固定宽度
    const 固定公式组宽度 = Math.max(左组最大行宽度, 右组最大行宽度);
    const 两组总宽度 = 固定公式组宽度 + 50 + 固定公式组宽度;
    const 左组起始X = (画布宽度 - 两组总宽度) / 2;
    const 右组起始X = 左组起始X + 固定公式组宽度 + 50;
    let 当前Y = 起始Y;
    this.ctx.fillStyle = "gold";
    this.ctx.fillText("世界坐标 → 局部坐标", 左组起始X + 75, 当前Y);
    当前Y += 行高;
    this.绘制公式行(
      左组起始X,
      当前Y,
      "dx",
      左组最大宽度,
      Math.round(dx),
      [Math.round(观察点世界X), "-", Math.floor(矩形.x)],
      数字颜色,
      等号颜色,
      运算符颜色,
      冒号颜色,
      括号颜色,
      结果颜色
    );
    当前Y += 行高;
    this.绘制公式行(
      左组起始X,
      当前Y,
      "dy",
      左组最大宽度,
      Math.round(dy),
      [Math.round(观察点世界Y), "-", Math.floor(矩形.y)],
      数字颜色,
      等号颜色,
      运算符颜色,
      冒号颜色,
      括号颜色,
      结果颜色
    );
    当前Y += 行高;
    this.绘制公式行(
      左组起始X,
      当前Y,
      "弧度",
      左组最大宽度,
      计算弧度值,
      [显示角度值, "×", "π", "/", 180],
      数字颜色,
      等号颜色,
      运算符颜色,
      冒号颜色,
      括号颜色,
      结果颜色
    );
    当前Y += 行高;
    this.绘制公式行(
      左组起始X,
      当前Y,
      "cos(弧度)",
      左组最大宽度,
      cos弧度显示值,
      ["cos", "(", 计算弧度值, ")"],
      数字颜色,
      等号颜色,
      运算符颜色,
      冒号颜色,
      括号颜色,
      结果颜色
    );
    当前Y += 行高;
    this.绘制公式行(
      左组起始X,
      当前Y,
      "sin(弧度)",
      左组最大宽度,
      sin弧度显示值,
      ["sin", "(", 计算弧度值, ")"],
      数字颜色,
      等号颜色,
      运算符颜色,
      冒号颜色,
      括号颜色,
      结果颜色
    );
    当前Y += 行高;
    this.绘制公式行(
      左组起始X,
      当前Y,
      "局部X",
      左组最大宽度,
      Math.round(局部X),
      [Math.floor(dx), "×", cos弧度显示值, "-", Math.floor(dy), "×", sin弧度显示值],
      数字颜色,
      等号颜色,
      运算符颜色,
      冒号颜色,
      括号颜色,
      结果颜色
    );
    当前Y += 行高;
    this.绘制公式行(
      左组起始X,
      当前Y,
      "局部Y",
      左组最大宽度,
      Math.round(局部Y),
      [Math.floor(dx), "×", sin弧度显示值, "+", Math.floor(dy), "×", cos弧度显示值],
      数字颜色,
      等号颜色,
      运算符颜色,
      冒号颜色,
      括号颜色,
      结果颜色
    );
    当前Y = 起始Y;
    this.ctx.fillStyle = "gold";
    this.ctx.fillText("局部坐标 → 世界坐标", 右组起始X + 75, 当前Y);
    当前Y += 行高;
    this.绘制公式行(
      右组起始X,
      当前Y,
      "弧度",
      右组最大宽度,
      计算角度值,
      [显示角度值, "×", "π", "/", 180],
      数字颜色,
      等号颜色,
      运算符颜色,
      冒号颜色,
      括号颜色,
      结果颜色
    );
    当前Y += 行高;
    this.绘制公式行(
      右组起始X,
      当前Y,
      "cos(弧度)",
      右组最大宽度,
      cos角度显示值,
      ["cos", "(", 计算角度值, ")"],
      数字颜色,
      等号颜色,
      运算符颜色,
      冒号颜色,
      括号颜色,
      结果颜色
    );
    当前Y += 行高;
    this.绘制公式行(
      右组起始X,
      当前Y,
      "sin(弧度)",
      右组最大宽度,
      sin角度显示值,
      ["sin", "(", 计算角度值, ")"],
      数字颜色,
      等号颜色,
      运算符颜色,
      冒号颜色,
      括号颜色,
      结果颜色
    );
    当前Y += 行高;
    this.绘制公式行(
      右组起始X,
      当前Y,
      "世界X",
      右组最大宽度,
      Math.round(计算世界X),
      [Math.floor(矩形.x), "+", Math.round(局部X), "×", cos角度显示值, "-", Math.round(局部Y), "×", sin角度显示值],
      数字颜色,
      等号颜色,
      运算符颜色,
      冒号颜色,
      括号颜色,
      结果颜色
    );
    当前Y += 行高;
    this.绘制公式行(
      右组起始X,
      当前Y,
      "世界Y",
      右组最大宽度,
      Math.round(计算世界Y),
      [Math.floor(矩形.y), "+", Math.round(局部X), "×", sin角度显示值, "+", Math.round(局部Y), "×", cos角度显示值],
      数字颜色,
      等号颜色,
      运算符颜色,
      冒号颜色,
      括号颜色,
      结果颜色
    );
    this.ctx.restore();
  }
  绘制公式行(
    起始X,
    起始Y,
    变量名,
    变量名最大宽度,
    结果值,
    表达式数组,
    数字颜色,
    等号颜色,
    运算符颜色,
    冒号颜色,
    括号颜色,
    结果颜色
  ) {
    let 当前X = 起始X;
    this.ctx.textAlign = "left";
    const 变量名实际宽度 = this.ctx.measureText(变量名).width;
    const 右对齐起始X = 当前X + 变量名最大宽度 - 变量名实际宽度;
    let 字符X = 右对齐起始X;
    for (let i = 0; i < 变量名.length; i++) {
      const 字符 = 变量名[i];
      if (字符 === "(" || 字符 === ")") {
        this.ctx.fillStyle = 括号颜色;
      } else {
        this.ctx.fillStyle = "#fff";
      }
      this.ctx.fillText(字符, 字符X, 起始Y);
      字符X += this.ctx.measureText(字符).width;
    }
    当前X += 变量名最大宽度;
    当前X += 2;
    this.ctx.fillStyle = 冒号颜色;
    this.ctx.fillText(":", 当前X, 起始Y);
    当前X += this.ctx.measureText(":").width + 4;
    this.ctx.fillStyle = 等号颜色;
    this.ctx.fillText(" = ", 当前X, 起始Y);
    当前X += this.ctx.measureText(" = ").width;
    for (let i = 0; i < 表达式数组.length; i++) {
      const 项 = 表达式数组[i];
      const 前一项 = i > 0 ? 表达式数组[i - 1] : null;
      const 后一项 = i < 表达式数组.length - 1 ? 表达式数组[i + 1] : null;
      if (typeof 项 === "string") {
        const 是负数负号 =
          项 === "-" &&
          (前一项 === null || ["+", "-", "×", "/", "("].includes(前一项)) &&
          后一项 !== null &&
          typeof 后一项 === "number";
        if (是负数负号) {
          continue;
        } else if (["+", "-", "×", "/"].includes(项)) {
          当前X += 4;
          this.ctx.fillStyle = 运算符颜色;
          this.ctx.fillText(项, 当前X, 起始Y);
          当前X += this.ctx.measureText(项).width + 4;
        } else if (项 === "(") {
          this.ctx.fillStyle = 括号颜色;
          this.ctx.fillText(项, 当前X, 起始Y);
          当前X += this.ctx.measureText(项).width;
        } else if (项 === ")") {
          this.ctx.fillStyle = 括号颜色;
          this.ctx.fillText(项, 当前X, 起始Y);
          当前X += this.ctx.measureText(项).width;
        } else if (项 === "π") {
          this.ctx.fillStyle = 数字颜色;
          this.ctx.fillText(项, 当前X, 起始Y);
          当前X += this.ctx.measureText(项).width;
        } else if (项 === "cos" || 项 === "sin") {
          this.ctx.fillStyle = "#fff";
          this.ctx.fillText(项, 当前X, 起始Y);
          当前X += this.ctx.measureText(项).width;
        }
      } else {
        const 前一项是负号 =
          i > 0 &&
          表达式数组[i - 1] === "-" &&
          (i === 1 || 表达式数组[i - 2] === null || ["+", "-", "×", "/", "("].includes(表达式数组[i - 2]));
        let 数字文本;
        // 判断是否是角度值：在"弧度"变量的表达式数组中，第一个数字（不是180）是角度值
        // 表达式数组结构为 [显示角度值, "×", "π", "/", 180]，角度值在索引0
        const 是角度值 = 变量名 === "弧度" && 
                        typeof 项 === "number" && 
                        项 !== 180 &&
                        i === 0; // 角度值在第一个位置
        if (是角度值) {
          // 角度值精确到小数点后1位
          数字文本 = this.精确格式化数字(项, 1);
        } else if (变量名 === "cos(弧度)" || 变量名 === "sin(弧度)") {
          数字文本 = this.精确格式化数字(项, 3);
        } else {
          数字文本 = this.精确格式化数字(项, 3);
        }
        if (前一项是负号) {
          数字文本 = "-" + 数字文本;
        }
        if (!数字文本 || 数字文本 === "" || 数字文本 === null || 数字文本 === undefined) {
          数字文本 = "0";
        }
        if (数字文本.trim() === "") {
          数字文本 = "0";
        }
        // 绘制数字文本，小数点使用lightslategray颜色
        for (let j = 0; j < 数字文本.length; j++) {
          const 字符 = 数字文本[j];
          if (字符 === ".") {
            this.ctx.fillStyle = "#aaa";
          } else {
            this.ctx.fillStyle = 数字颜色;
          }
          this.ctx.fillText(字符, 当前X, 起始Y);
          当前X += this.ctx.measureText(字符).width;
        }
      }
    }
    当前X += 2;
    this.ctx.fillStyle = 等号颜色;
    this.ctx.fillText(" = ", 当前X, 起始Y);
    当前X += this.ctx.measureText(" = ").width;
    let 结果文本;
    if (变量名 === "弧度" || 变量名 === "cos(弧度)" || 变量名 === "sin(弧度)") {
      结果文本 = this.精确格式化数字(结果值, 3);
    } else {
      结果文本 = this.精确格式化数字(结果值, 3);
    }
    // 绘制结果文本，小数点使用lightslategray颜色
    for (let j = 0; j < 结果文本.length; j++) {
      const 字符 = 结果文本[j];
      if (字符 === ".") {
        this.ctx.fillStyle = "#aaa";
      } else {
        this.ctx.fillStyle = 结果颜色;
      }
      this.ctx.fillText(字符, 当前X, 起始Y);
      当前X += this.ctx.measureText(字符).width;
    }
  }
  计算公式行宽度(变量名, 变量名最大宽度, 表达式数组, 结果值 = 0) {
    let 宽度 = 变量名最大宽度;
    宽度 += 2;
    宽度 += this.ctx.measureText(":").width;
    宽度 += 4;
    宽度 += this.ctx.measureText(" = ").width;
    for (let i = 0; i < 表达式数组.length; i++) {
      const 项 = 表达式数组[i];
      if (typeof 项 === "string") {
        if (["+", "-", "×", "/"].includes(项)) {
          宽度 += 4;
          宽度 += this.ctx.measureText(项).width;
          宽度 += 4;
        } else {
          宽度 += this.ctx.measureText(项).width;
        }
      } else {
        宽度 += this.ctx.measureText(this.格式化数字(项)).width;
      }
    }
    宽度 += 2;
    宽度 += this.ctx.measureText(" = ").width;
    宽度 += this.ctx.measureText(this.格式化数字(结果值)).width;
    return 宽度;
  }
  精确格式化数字(值, 小数位数 = 2) {
    const 容差 = Math.pow(10, -(小数位数 + 2));
    if (Math.abs(值) < 容差) {
      return "0";
    }
    const 倍数 = Math.pow(10, 小数位数);
    const 精确值 = Math.round(值 * 倍数) / 倍数;
    if (Math.abs(精确值) < 容差) {
      return "0";
    }
    let 结果 = 精确值.toString();
    if (结果.includes(".")) {
      结果 = 结果.replace(/\.?0+$/, "");
    }
    return 结果;
  }
  格式化数字(值) {
    if (Math.abs(值) < 0.001) {
      return "0";
    }
    if (Math.abs(值) < 1) {
      return this.精确格式化数字(值, 3);
    }
    return this.精确格式化数字(值, 2);
  }
  清空画布() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  重置() {
    this.矩形 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
      宽度: 300,
      高度: 200,
      旋转角度: 0,
    };
    this.观察点 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
      半径: 8,
    };
    this.保存观察点位置到SessionStorage();
    this.交互状态 = {
      正在拖动: false,
      正在缩放: false,
      正在旋转: false,
      正在拖动观察点: false,
      拖动偏移: { x: 0, y: 0 },
      观察点拖动偏移: { x: 0, y: 0 },
      缩放起始: { 宽度: 0, 高度: 0, x: 0, y: 0, 矩形中心X: 0, 矩形中心Y: 0 },
      旋转起始: { 角度: 0, x: 0, y: 0 },
      鼠标位置: { x: 0, y: 0 },
      缩放边: null,
      缩放角: null,
      缩放锚点: { x: 0, y: 0 },
      Alt键按下: false,
      Shift键按下: false,
      Ctrl键按下: false,
      鼠标已悬停: false,
      观察点悬停: false,
      按钮状态: {
        x增加: { 按下: false, 按下时间: null, 快速增减定时器: null, 悬停: false },
        x减少: { 按下: false, 按下时间: null, 快速增减定时器: null, 悬停: false },
        y增加: { 按下: false, 按下时间: null, 快速增减定时器: null, 悬停: false },
        y减少: { 按下: false, 按下时间: null, 快速增减定时器: null, 悬停: false },
      },
    };
    this.鼠标坐标 = {
      x: null,
      y: null,
    };
    this.绘制场景();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new 坐标系教程();
});
