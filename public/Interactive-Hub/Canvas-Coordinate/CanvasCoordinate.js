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
      坐标参考线: document.getElementById("坐标参考线"),
      坐标信息: document.getElementById("坐标信息"),
      坐标背景: document.getElementById("坐标背景"),
    };
    this.边界矩形 = this.canvas.getBoundingClientRect();
    this.鼠标坐标 = {
      x: null,
      y: null,
    };

    // 矩形参数
    this.矩形 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
      宽度: 300,
      高度: 200,
      旋转角度: 0,
    };

    // 交互状态
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
      缩放锚点: { x: 0, y: 0 }, // 局部坐标系中的锚点位置
      Alt键按下: false,
      Shift键按下: false,
      鼠标已悬停: false,
    };

    // 显示选项
    this.显示选项 = {
      世界坐标系: true,
      局部坐标系: true,
      坐标信息: true,
      坐标参考线: true,
      坐标背景: true,
    };

    // 从sessionStorage加载复选框状态
    this.从SessionStorage加载复选框状态();

    // 设置复选框的初始状态
    this.复选框.坐标参考线.checked = this.显示选项.坐标参考线;
    this.复选框.坐标信息.checked = this.显示选项.坐标信息;
    this.复选框.坐标背景.checked = this.显示选项.坐标背景;

    // 初始绘制
    this.绘制场景();

    // 事件监听
    window.addEventListener("scroll", () => {
      this.边界矩形 = this.canvas.getBoundingClientRect();
    });

    window.addEventListener("resize", () => {
      this.边界矩形 = this.canvas.getBoundingClientRect();
      this.canvas.width = this.canvas.offsetWidth * this.dpr;
      this.canvas.height = this.canvas.offsetHeight * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);
      this.绘制场景();
    });

    this.canvas.addEventListener("mousedown", (e) => this.鼠标按下(e));
    window.addEventListener("mousemove", (e) => this.鼠标移动(e));
    this.canvas.addEventListener("mouseup", () => this.鼠标释放());
    this.canvas.addEventListener("mouseleave", () => this.鼠标释放());

    // 监听键盘事件以检测Alt键和Shift键
    window.addEventListener("keydown", (e) => {
      if (e.key === "Alt") {
        e.preventDefault();
        this.交互状态.Alt键按下 = true;
      } else if (e.key === "Shift" || e.shiftKey) {
        this.交互状态.Shift键按下 = true;
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "Alt") {
        this.交互状态.Alt键按下 = false;
      } else if (e.key === "Shift" || !e.shiftKey) {
        this.交互状态.Shift键按下 = false;
      }
    });

    // 页面失去焦点时，清除按键状态
    window.addEventListener("blur", () => {
      this.交互状态.Alt键按下 = false;
      this.交互状态.Shift键按下 = false;
    });

    // 监听复选框状态变化，重新绘制场景并保存到sessionStorage
    this.复选框.坐标参考线.addEventListener("change", () => {
      this.显示选项.坐标参考线 = this.复选框.坐标参考线.checked;
      this.保存复选框状态到SessionStorage();
      this.绘制场景();
    });
    this.复选框.坐标信息.addEventListener("change", () => {
      this.显示选项.坐标信息 = this.复选框.坐标信息.checked;
      this.保存复选框状态到SessionStorage();
      this.绘制场景();
    });
    this.复选框.坐标背景.addEventListener("change", () => {
      this.显示选项.坐标背景 = this.复选框.坐标背景.checked;
      this.保存复选框状态到SessionStorage();
      this.绘制场景();
    });
  }

  // 从sessionStorage加载复选框状态
  从SessionStorage加载复选框状态() {
    try {
      const 保存的状态 = sessionStorage.getItem("canvasCoordinateCheckboxStates");
      if (保存的状态) {
        const 解析状态 = JSON.parse(保存的状态);
        // 只更新存在的字段，使用默认值true
        if (解析状态.坐标参考线 !== undefined) {
          this.显示选项.坐标参考线 = 解析状态.坐标参考线;
        }
        if (解析状态.坐标信息 !== undefined) {
          this.显示选项.坐标信息 = 解析状态.坐标信息;
        }
        if (解析状态.坐标背景 !== undefined) {
          this.显示选项.坐标背景 = 解析状态.坐标背景;
        }
      }
    } catch (e) {
      console.error("加载sessionStorage状态失败:", e);
      // 如果出错，保持默认值true
    }
  }

  // 保存复选框状态到sessionStorage
  保存复选框状态到SessionStorage() {
    try {
      const 要保存的状态 = {
        坐标参考线: this.显示选项.坐标参考线,
        坐标信息: this.显示选项.坐标信息,
        坐标背景: this.显示选项.坐标背景,
      };
      sessionStorage.setItem("canvasCoordinateCheckboxStates", JSON.stringify(要保存的状态));
    } catch (e) {
      console.error("保存到sessionStorage失败:", e);
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

    // 转换鼠标坐标到局部坐标系
    const dx = 鼠标位置.x - 矩形.x;
    const dy = 鼠标位置.y - 矩形.y;
    const 弧度 = (-矩形.旋转角度 * Math.PI) / 180;
    const 局部X = dx * Math.cos(弧度) - dy * Math.sin(弧度);
    const 局部Y = dx * Math.sin(弧度) + dy * Math.cos(弧度);

    const 半宽 = 矩形.宽度 / 2;
    const 半高 = 矩形.高度 / 2;
    const 边界阈值 = 10;

    // 检查是否点击在旋转句柄上（旋转）
    if (Math.abs(局部X) < 边界阈值 && Math.abs(局部Y + 半高 + 20) < 边界阈值) {
      this.交互状态.正在旋转 = true;
      this.交互状态.旋转起始 = {
        角度: 矩形.旋转角度,
        x: 鼠标位置.x,
        y: 鼠标位置.y,
      };
    }
    // 检查是否点击在角点上（缩放）
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

      // 使用策略模式确定是哪个角，并设置缩放锚点为对角点，保存被拖拽角点的初始位置
      // 注意：局部Y = 半高 是下边缘，局部Y = -半高 是上边缘
      const 角点配置 = this.获取角点配置(局部X, 局部Y, 半宽, 半高, 边界阈值);
      this.交互状态.缩放角 = 角点配置.角;
      this.交互状态.缩放锚点 = 角点配置.锚点;
      this.交互状态.被拖拽点初始位置 = 角点配置.被拖拽点;
    }
    // 检查是否点击在边缘上（缩放）
    else if (
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

      // 使用数据驱动方式处理边缘检测
      const 边缘配置 = [
        {
          条件: Math.abs(局部X - 半宽) < 边界阈值 && Math.abs(局部Y) <= 半高,
          边: "右",
          锚点: { x: -半宽, y: 0 },
          被拖拽点: { x: 半宽, y: 局部Y }
        },
        {
          条件: Math.abs(局部X + 半宽) < 边界阈值 && Math.abs(局部Y) <= 半高,
          边: "左",
          锚点: { x: 半宽, y: 0 },
          被拖拽点: { x: -半宽, y: 局部Y }
        },
        {
          条件: Math.abs(局部Y - 半高) < 边界阈值 && Math.abs(局部X) <= 半宽,
          边: "下",
          锚点: { x: 0, y: -半高 },
          被拖拽点: { x: 局部X, y: 半高 }
        },
        {
          条件: true, // 默认情况
          边: "上",
          锚点: { x: 0, y: 半高 },
          被拖拽点: { x: 局部X, y: -半高 }
        }
      ];

      // 查找第一个匹配的边缘配置
      const 匹配配置 = 边缘配置.find(配置 => 配置.条件);
      this.交互状态.缩放边 = 匹配配置.边;
      this.交互状态.缩放锚点 = 匹配配置.锚点;
      this.交互状态.被拖拽点初始位置 = 匹配配置.被拖拽点;
    }
    // 检查是否点击在矩形内部（拖动）
    else if (Math.abs(局部X) <= 半宽 && Math.abs(局部Y) <= 半高) {
      this.交互状态.正在拖动 = true;
      this.交互状态.拖动偏移 = {
        x: 鼠标位置.x - 矩形.x,
        y: 鼠标位置.y - 矩形.y,
      };
      // 保存开始拖动时矩形的位置（用于Shift键限制方向）
      this.交互状态.拖动起始位置 = {
        x: 矩形.x,
        y: 矩形.y,
      };
      this.canvas.classList.add("dragging");
    }
  }

  // 获取角点配置（策略模式）
  获取角点配置(局部X, 局部Y, 半宽, 半高, 边界阈值) {
    const 角点配置列表 = [
      {
        条件: Math.abs(局部X - 半宽) < 边界阈值 && Math.abs(局部Y - 半高) < 边界阈值,
        角: "右下",
        锚点: { x: -半宽, y: -半高 }, // 对角是左上角
        被拖拽点: { x: 半宽, y: 半高 }
      },
      {
        条件: Math.abs(局部X + 半宽) < 边界阈值 && Math.abs(局部Y - 半高) < 边界阈值,
        角: "左下",
        锚点: { x: 半宽, y: -半高 }, // 对角是右上角
        被拖拽点: { x: -半宽, y: 半高 }
      },
      {
        条件: Math.abs(局部X - 半宽) < 边界阈值 && Math.abs(局部Y + 半高) < 边界阈值,
        角: "右上",
        锚点: { x: -半宽, y: 半高 }, // 对角是左下角
        被拖拽点: { x: 半宽, y: -半高 }
      },
      {
        条件: true, // 默认情况：左上角
        角: "左上",
        锚点: { x: 半宽, y: 半高 }, // 对角是右下角
        被拖拽点: { x: -半宽, y: -半高 }
      }
    ];

    // 查找第一个匹配的角点配置
    return 角点配置列表.find(配置 => 配置.条件);
  }

  鼠标移动(e) {
    this.获取鼠标坐标(e);
    const 鼠标位置 = this.交互状态.鼠标位置;

    // 同步更新Shift键状态（从鼠标事件中获取，更可靠）
    this.交互状态.Shift键按下 = e.shiftKey;

    // 更新鼠标样式（仅在非交互状态下）
    if (!this.交互状态.正在拖动 && !this.交互状态.正在缩放 && !this.交互状态.正在旋转) {
      this.更新鼠标样式(鼠标位置);
    }

    // 处理不同的交互状态
    if (this.交互状态.正在拖动) {
      this.处理拖动(鼠标位置);
    } else if (this.交互状态.正在旋转) {
      this.处理旋转(鼠标位置);
    } else if (this.交互状态.正在缩放) {
      this.处理缩放(鼠标位置);
    }
    
    this.绘制场景();
  }

  // 更新鼠标样式
  更新鼠标样式(鼠标位置) {
    const 矩形 = this.矩形;
    const 边界阈值 = 10;

    // 转换鼠标坐标到局部坐标系
    const { 局部X, 局部Y, 半宽, 半高 } = this.计算鼠标局部坐标(鼠标位置, 矩形);
    
    this.交互状态.鼠标已悬停 = false;

    // 按优先级检查鼠标位置并设置对应的cursor样式
    const cursor = this.获取鼠标cursor样式(局部X, 局部Y, 半宽, 半高, 边界阈值);
    this.canvas.style.cursor = cursor;

    // 如果在矩形内部，设置悬停状态
    if (cursor === "grab" && Math.abs(局部X) <= 半宽 && Math.abs(局部Y) <= 半高) {
      this.交互状态.鼠标已悬停 = true;
    }
  }

  // 计算鼠标在局部坐标系中的位置
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
  
  // 根据鼠标位置获取对应的cursor样式
  获取鼠标cursor样式(局部X, 局部Y, 半宽, 半高, 边界阈值) {
    // 检查是否在旋转句柄上
    if (this.是否在旋转句柄上(局部X, 局部Y, 半高, 边界阈值)) {
      return "grab";
    }

    // 检查是否在角点上
    const 角点cursor = this.获取角点cursor样式(局部X, 局部Y, 半宽, 半高, 边界阈值);
    if (角点cursor) {
      return 角点cursor;
    }

    // 检查是否在边缘上
    const 边缘cursor = this.获取边缘cursor样式(局部X, 局部Y, 半宽, 半高, 边界阈值);
    if (边缘cursor) {
      return 边缘cursor;
    }

    // 检查是否在矩形内部
    if (Math.abs(局部X) <= 半宽 && Math.abs(局部Y) <= 半高) {
      return "grab";
    }

    return "default";
  }

  // 检查是否在旋转句柄上
  是否在旋转句柄上(局部X, 局部Y, 半高, 边界阈值) {
    return Math.abs(局部X) < 边界阈值 && Math.abs(局部Y + 半高 + 20) < 边界阈值;
  }

  // 获取角点的cursor样式
  获取角点cursor样式(局部X, 局部Y, 半宽, 半高, 边界阈值) {
    // 左上角点和右下角点 (nwse-resize)
    if (
      (this.接近值(局部X, 半宽, 边界阈值) && this.接近值(局部Y, 半高, 边界阈值)) ||
      (this.接近值(局部X, -半宽, 边界阈值) && this.接近值(局部Y, -半高, 边界阈值))
    ) {
      return "nwse-resize";
    }

    // 右上角点和左下角点 (nesw-resize)
    if (
      (this.接近值(局部X, -半宽, 边界阈值) && this.接近值(局部Y, 半高, 边界阈值)) ||
      (this.接近值(局部X, 半宽, 边界阈值) && this.接近值(局部Y, -半高, 边界阈值))
    ) {
      return "nesw-resize";
    }

    return null;
  }

  // 获取边缘的cursor样式
  获取边缘cursor样式(局部X, 局部Y, 半宽, 半高, 边界阈值) {
    // 左右边缘 (ew-resize)
    if (
      (this.接近值(局部X, 半宽, 边界阈值) && Math.abs(局部Y) <= 半高) ||
      (this.接近值(局部X, -半宽, 边界阈值) && Math.abs(局部Y) <= 半高)
    ) {
      return "ew-resize";
    }

    // 上下边缘 (ns-resize)
    if (
      (this.接近值(局部Y, 半高, 边界阈值) && Math.abs(局部X) <= 半宽) ||
      (this.接近值(局部Y, -半高, 边界阈值) && Math.abs(局部X) <= 半宽)
    ) {
      return "ns-resize";
    }

    return null;
  }

  // 检查值是否接近目标值（在阈值范围内）
  接近值(值, 目标值, 阈值) {
    return Math.abs(值 - 目标值) < 阈值;
  }

  // 处理拖动操作
  处理拖动(鼠标位置) {
    if (this.交互状态.Shift键按下) {
      // Shift键按下：限制移动方向为水平或垂直（以开始拖拽时的矩形位置为原点）
      const 拖动起始 = this.交互状态.拖动起始位置;
      
      // 先计算正常情况下的矩形位置
      const 正常X = 鼠标位置.x - this.交互状态.拖动偏移.x;
      const 正常Y = 鼠标位置.y - this.交互状态.拖动偏移.y;
      
      // 计算相对于初始矩形位置的偏移
      const dx = 正常X - 拖动起始.x;
      const dy = 正常Y - 拖动起始.y;
      
      // 判断是水平移动还是垂直移动（选择偏移量较大的方向）
      if (Math.abs(dx) > Math.abs(dy)) {
        // 水平移动：保持Y坐标为初始值
        this.矩形.x = 拖动起始.x + dx;
        this.矩形.y = 拖动起始.y;
      } else {
        // 垂直移动：保持X坐标为初始值
        this.矩形.x = 拖动起始.x;
        this.矩形.y = 拖动起始.y + dy;
      }
    } else {
      // 正常拖动：自由移动
      this.矩形.x = 鼠标位置.x - this.交互状态.拖动偏移.x;
      this.矩形.y = 鼠标位置.y - this.交互状态.拖动偏移.y;
    }
  }
  
  处理旋转(鼠标位置) {
    const 旋转起始 = this.交互状态.旋转起始;

    // 计算鼠标相对于矩形中心的角度变化
    const dx = 鼠标位置.x - this.矩形.x;
    const dy = 鼠标位置.y - this.矩形.y;
    const 起始Dx = 旋转起始.x - this.矩形.x;
    const 起始Dy = 旋转起始.y - this.矩形.y;

    let 当前角度 = (Math.atan2(dy, dx) * 180) / Math.PI;
    let 起始角度 = (Math.atan2(起始Dy, 起始Dx) * 180) / Math.PI;

    this.矩形.旋转角度 = 旋转起始.角度 + (当前角度 - 起始角度);
    
    // 确保旋转角度始终为正值（0-360范围）
    if (this.矩形.旋转角度 < 0) {
      this.矩形.旋转角度 += 360;
    }
    if (this.矩形.旋转角度 >= 360) {
      this.矩形.旋转角度 -= 360;
    }
    
    // 如果Shift键按下，将角度对齐到最近的45度倍数
    if (this.交互状态.Shift键按下) {
      this.矩形.旋转角度 = this.对齐到45度倍数(this.矩形.旋转角度);
    }
  }

  // 将角度对齐到最近的45度倍数（0, 45, 90, 135, 180, 225, 270, 315）
  对齐到45度倍数(角度) {
    // 角度已经在0-360范围内，直接计算最近的45度倍数
    const 倍数 = Math.round(角度 / 45);
    const 对齐角度 = 倍数 * 45;
    
    // 确保结果在0-360范围内
    return ((对齐角度 % 360) + 360) % 360;
  }

  // 处理缩放操作
  处理缩放(鼠标位置) {
    const 缩放起始 = this.交互状态.缩放起始;
    const 使用中心锚点 = this.交互状态.Alt键按下;
    const 角度 = (this.矩形.旋转角度 * Math.PI) / 180;
    const 弧度 = (-this.矩形.旋转角度 * Math.PI) / 180;

    // 计算鼠标在局部坐标系中的位置和增量
    const { 鼠标局部X, 鼠标局部Y, 局部Dx, 局部Dy } = this.计算缩放局部坐标(鼠标位置, 缩放起始, 弧度);

    if (this.交互状态.缩放边) {
      this.处理边缩放(缩放起始, 鼠标局部X, 鼠标局部Y, 局部Dx, 局部Dy, 使用中心锚点, 角度);
    } else if (this.交互状态.缩放角) {
      this.处理角缩放(缩放起始, 鼠标局部X, 鼠标局部Y, 局部Dx, 局部Dy, 使用中心锚点, 角度);
    }
  }

  // 计算缩放时的局部坐标
  计算缩放局部坐标(鼠标位置, 缩放起始, 弧度) {
    // 将鼠标位置转换为局部坐标系（相对于开始缩放时的矩形中心）
    const dx = 鼠标位置.x - 缩放起始.矩形中心X;
    const dy = 鼠标位置.y - 缩放起始.矩形中心Y;
    const 鼠标局部X = dx * Math.cos(弧度) - dy * Math.sin(弧度);
    const 鼠标局部Y = dx * Math.sin(弧度) + dy * Math.cos(弧度);

    // 计算鼠标移动的增量（相对于开始时的鼠标位置）
    const 起始Dx = 缩放起始.x - 缩放起始.矩形中心X;
    const 起始Dy = 缩放起始.y - 缩放起始.矩形中心Y;
    const 起始鼠标局部X = 起始Dx * Math.cos(弧度) - 起始Dy * Math.sin(弧度);
    const 起始鼠标局部Y = 起始Dx * Math.sin(弧度) + 起始Dy * Math.cos(弧度);
    const 局部Dx = 鼠标局部X - 起始鼠标局部X;
    const 局部Dy = 鼠标局部Y - 起始鼠标局部Y;

    return { 鼠标局部X, 鼠标局部Y, 局部Dx, 局部Dy };
  }

  // 处理边的缩放
  处理边缩放(缩放起始, 鼠标局部X, 鼠标局部Y, 局部Dx, 局部Dy, 使用中心锚点, 角度) {
    const 锚点 = 使用中心锚点 ? { x: 0, y: 0 } : this.交互状态.缩放锚点;
    const 被拖拽点初始位置 = this.交互状态.被拖拽点初始位置;
    const 缩放边 = this.交互状态.缩放边;
    const 是水平边 = 缩放边 === "右" || 缩放边 === "左";

    // 计算被拖拽点的局部坐标
    const { x: 被拖拽点局部X, y: 被拖拽点局部Y } = this.计算边拖拽点位置(
      缩放边, 使用中心锚点, 鼠标局部X, 鼠标局部Y, 被拖拽点初始位置, 局部Dx, 局部Dy
    );

    if (是水平边) {
      this.应用水平边缩放(缩放起始, 被拖拽点局部X, 锚点, 使用中心锚点, 缩放边, 角度);
    } else {
      this.应用垂直边缩放(缩放起始, 被拖拽点局部Y, 锚点, 使用中心锚点, 缩放边, 角度);
    }
  }

  // 计算边拖拽点的位置
  计算边拖拽点位置(缩放边, 使用中心锚点, 鼠标局部X, 鼠标局部Y, 被拖拽点初始位置, 局部Dx, 局部Dy) {
    if (使用中心锚点) {
      // Alt键按下：被拖拽点直接跟随鼠标位置
      const 是水平边 = 缩放边 === "右" || 缩放边 === "左";
      return {
        x: 是水平边 ? 鼠标局部X : 被拖拽点初始位置.x,
        y: 是水平边 ? 被拖拽点初始位置.y : 鼠标局部Y
      };
    } else {
      // 正常模式：基于初始位置+增量
      const 是水平边 = 缩放边 === "右" || 缩放边 === "左";
      return {
        x: 是水平边 ? 被拖拽点初始位置.x + 局部Dx : 被拖拽点初始位置.x,
        y: 是水平边 ? 被拖拽点初始位置.y : 被拖拽点初始位置.y + 局部Dy
      };
    }
  }

  // 应用水平边缩放
  应用水平边缩放(缩放起始, 被拖拽点局部X, 锚点, 使用中心锚点, 缩放边, 角度) {
    const 新宽度 = Math.max(50, Math.abs(被拖拽点局部X - 锚点.x));

    if (使用中心锚点) {
      // Alt键按下：以中心为锚点，中心位置不变，宽度 = |被拖拽点局部X| * 2
      this.矩形.x = 缩放起始.矩形中心X;
      this.矩形.y = 缩放起始.矩形中心Y;
      this.矩形.宽度 = Math.max(50, Math.abs(被拖拽点局部X) * 2);
    } else {
      // 正常模式：以相对边中点为锚点
      const 锚点世界 = this.局部坐标转世界坐标(缩放起始.矩形中心X, 缩放起始.矩形中心Y, 锚点.x, 锚点.y, 角度);
      const 新的中心到锚点向量X = ((缩放边 === "右" ? 1 : -1) * 新宽度) / 2;
      const 新的中心 = this.局部坐标转世界坐标(锚点世界.x, 锚点世界.y, 新的中心到锚点向量X, 0, 角度);

      this.矩形.x = 新的中心.x;
      this.矩形.y = 新的中心.y;
      this.矩形.宽度 = 新宽度;
    }
  }

  // 应用垂直边缩放
  应用垂直边缩放(缩放起始, 被拖拽点局部Y, 锚点, 使用中心锚点, 缩放边, 角度) {
    const 新高度 = Math.max(50, Math.abs(被拖拽点局部Y - 锚点.y));

    if (使用中心锚点) {
      // Alt键按下：以中心为锚点，中心位置不变，高度 = |被拖拽点局部Y| * 2
      this.矩形.x = 缩放起始.矩形中心X;
      this.矩形.y = 缩放起始.矩形中心Y;
      this.矩形.高度 = Math.max(50, Math.abs(被拖拽点局部Y) * 2);
    } else {
      // 正常模式：以相对边中点为锚点
      const 锚点世界 = this.局部坐标转世界坐标(缩放起始.矩形中心X, 缩放起始.矩形中心Y, 锚点.x, 锚点.y, 角度);
      const 新的中心到锚点向量Y = ((缩放边 === "下" ? 1 : -1) * 新高度) / 2;
      const 新的中心 = this.局部坐标转世界坐标(锚点世界.x, 锚点世界.y, 0, 新的中心到锚点向量Y, 角度);

      this.矩形.x = 新的中心.x;
      this.矩形.y = 新的中心.y;
      this.矩形.高度 = 新高度;
    }
  }

  // 处理角的缩放
  处理角缩放(缩放起始, 鼠标局部X, 鼠标局部Y, 局部Dx, 局部Dy, 使用中心锚点, 角度) {
    const 锚点 = 使用中心锚点 ? { x: 0, y: 0 } : this.交互状态.缩放锚点;
    const 被拖拽点初始位置 = this.交互状态.被拖拽点初始位置;

    // 计算被拖拽点的局部坐标
    const 被拖拽点局部X = 使用中心锚点 ? 鼠标局部X : 被拖拽点初始位置.x + 局部Dx;
    const 被拖拽点局部Y = 使用中心锚点 ? 鼠标局部Y : 被拖拽点初始位置.y + 局部Dy;

    // 计算新尺寸
    const 新宽度 = Math.max(10, Math.abs(被拖拽点局部X - 锚点.x));
    const 新高度 = Math.max(10, Math.abs(被拖拽点局部Y - 锚点.y));

    if (使用中心锚点) {
      // Alt键按下：以中心为锚点，中心位置不变，尺寸 = |被拖拽点局部坐标| * 2
      this.矩形.x = 缩放起始.矩形中心X;
      this.矩形.y = 缩放起始.矩形中心Y;
      this.矩形.宽度 = Math.max(10, Math.abs(被拖拽点局部X) * 2);
      this.矩形.高度 = Math.max(10, Math.abs(被拖拽点局部Y) * 2);
    } else {
      // 正常模式：以对角点为锚点
      const 锚点世界 = this.局部坐标转世界坐标(缩放起始.矩形中心X, 缩放起始.矩形中心Y, 锚点.x, 锚点.y, 角度);
      const 被拖拽点世界 = this.局部坐标转世界坐标(缩放起始.矩形中心X, 缩放起始.矩形中心Y, 被拖拽点局部X, 被拖拽点局部Y, 角度);

      // 新中心是世界坐标系中锚点和被拖拽点的中点
      this.矩形.x = (锚点世界.x + 被拖拽点世界.x) / 2;
      this.矩形.y = (锚点世界.y + 被拖拽点世界.y) / 2;
      this.矩形.宽度 = 新宽度;
      this.矩形.高度 = 新高度;
    }
  }

  // 将局部坐标转换为世界坐标
  局部坐标转世界坐标(中心X, 中心Y, 局部X, 局部Y, 角度) {
    return {
      x: 中心X + 局部X * Math.cos(角度) - 局部Y * Math.sin(角度),
      y: 中心Y + 局部X * Math.sin(角度) + 局部Y * Math.cos(角度)
    };
  }

  鼠标释放() {
    this.交互状态.正在拖动 = false;
    this.交互状态.正在缩放 = false;
    this.交互状态.正在旋转 = false;
    this.交互状态.缩放边 = null;
    this.交互状态.缩放角 = null;
    this.canvas.classList.remove("dragging");
  }

  绘制场景() {
    // 清空画布
    this.清空画布();

    // 绘制世界坐标系
    if (this.显示选项.世界坐标系) {
      this.绘制世界坐标系();
    }

    // 绘制局部坐标系
    if (this.显示选项.局部坐标系) {
      this.绘制局部坐标系();
    }

    // 绘制矩形
    this.绘制矩形();

    // 绘制坐标信息（始终显示）
    if (this.显示选项.坐标信息) {
      this.绘制坐标信息();
    }

    if (this.显示选项.坐标参考线) {
      this.绘制坐标参考线();
    }
  }

  绘制世界坐标系() {
    const 宽度 = this.canvas.offsetWidth;
    const 高度 = this.canvas.offsetHeight;

    this.ctx.save();

    // 绘制经纬线
    this.ctx.strokeStyle = "#ffffff1a";
    this.ctx.lineWidth = 0.5;

    // 绘制垂直线（经线）
    for (let x = 0; x <= 宽度; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, 高度);
      this.ctx.stroke();
    }

    // 绘制水平线（纬线）
    for (let y = 0; y <= 高度; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(宽度, y);
      this.ctx.stroke();
    }

    // 绘制坐标轴
    this.ctx.strokeStyle = "#4fc3f7";
    this.ctx.lineWidth = 2;

    // X轴
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(宽度, 0);
    this.ctx.stroke();

    // Y轴
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, 高度);
    this.ctx.stroke();

    // 绘制刻度
    this.ctx.fillStyle = "#6fa8fdff";
    this.ctx.font = "12px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.textBaseline = "top";

    // X轴刻度
    for (let x = 100; x < 宽度; x += 100) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, -5);
      this.ctx.lineTo(x, 5);
      this.ctx.stroke();
      this.ctx.fillText(`${x}`, x - 10, 10);
    }

    // Y轴刻度
    for (let y = 100; y < 高度; y += 100) {
      this.ctx.beginPath();
      this.ctx.moveTo(-5, y);
      this.ctx.lineTo(5, y);
      this.ctx.stroke();
      this.ctx.fillText(`${y}`, 10, y - 5);
    }

    // 标签
    this.ctx.fillStyle = "lightcyan";
    this.ctx.font = "13px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.fillText("世界坐标系", 5, 10);
    this.ctx.fillText("0, 0", 5, 25);

    this.ctx.restore();
  }

  绘制矩形() {
    const 矩形 = this.矩形;

    this.ctx.save();

    // 移动到矩形位置
    this.ctx.translate(矩形.x, 矩形.y);

    // 旋转矩形
    this.ctx.rotate((矩形.旋转角度 * Math.PI) / 180);

    // 绘制矩形
    this.ctx.fillStyle = this.交互状态.鼠标已悬停 ? "rgba(79, 195, 247, 0.2)" : "rgba(79, 195, 247, 0.075)";
    this.ctx.strokeStyle = "#4fc3f7";
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(-矩形.宽度 / 2, -矩形.高度 / 2, 矩形.宽度, 矩形.高度);
    this.ctx.strokeRect(-矩形.宽度 / 2, -矩形.高度 / 2, 矩形.宽度, 矩形.高度);

    // 绘制矩形中心点
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 4, 0, 2 * Math.PI);
    this.ctx.fillStyle = "#ff5722";
    this.ctx.fill();

    // 绘制缩放控制点
    const 半宽 = 矩形.宽度 / 2;
    const 半高 = 矩形.高度 / 2;

    // 绘制旋转句柄
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

    // 边缘中点（缩放控制点）
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

    // 角点（缩放控制点）
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
  }

  绘制局部坐标系() {
    const 矩形 = this.矩形;
    const 半宽 = 矩形.宽度 / 2;
    const 半高 = 矩形.高度 / 2;

    this.ctx.save();

    // 移动到矩形位置
    this.ctx.translate(矩形.x, 矩形.y);

    // 旋转坐标系
    this.ctx.rotate((矩形.旋转角度 * Math.PI) / 180);

    // 绘制坐标轴
    this.ctx.strokeStyle = "#ff5722";
    this.ctx.lineWidth = 2;

    // X轴（长度匹配矩形宽度，只绘制正值方向）
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(半宽, 0);
    this.ctx.stroke();

    // Y轴（长度匹配矩形高度，只绘制正值方向）
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, 半高);
    this.ctx.stroke();

    // 绘制箭头
    // X轴箭头
    this.ctx.beginPath();
    this.ctx.moveTo(半宽, 0);
    this.ctx.lineTo(半宽 - 10, -5);
    this.ctx.lineTo(半宽 - 10, 5);
    this.ctx.closePath();
    this.ctx.fillStyle = "#ff5722";
    this.ctx.fill();

    // Y轴箭头
    this.ctx.beginPath();
    this.ctx.moveTo(0, 半高);
    this.ctx.lineTo(-5, 半高 - 10);
    this.ctx.lineTo(5, 半高 - 10);
    this.ctx.closePath();
    this.ctx.fill();

    // 绘制刻度
    this.ctx.fillStyle = "#ff9f22ff";
    this.ctx.font = "12px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.textBaseline = "top";

    // X轴刻度（每50个单位绘制一个）
    for (let x = 50; x <= 半宽; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, -5);
      this.ctx.lineTo(x, 5);
      this.ctx.stroke();

      // 整百数字保持在原位，50、150等数字绘制在轴的另一侧
      if (x % 100 === 0) {
        this.ctx.fillText(`${x}`, x - 10, 10);
      } else {
        this.ctx.fillText(`${x}`, x - 10, -20);
      }
    }

    // Y轴刻度（每50个单位绘制一个）
    for (let y = 50; y <= 半高; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(-5, y);
      this.ctx.lineTo(5, y);
      this.ctx.stroke();

      // 整百数字保持在原位，50、150等数字绘制在轴的另一侧
      if (y % 100 === 0) {
        this.ctx.fillText(`${y}`, 10, y - 5);
      } else {
        this.ctx.fillText(`${y}`, -30, y - 5);
      }
    }

    // 标签
    this.ctx.fillStyle = "lightcyan";
    this.ctx.textAlign = "right";
    this.ctx.font = "13px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.fillText("局部坐标系", -15, -25);
    this.ctx.fillText("0, 0", -15, -10);

    this.ctx.restore();
  }

  绘制坐标信息() {
    if (!this.复选框.坐标信息.checked) return;
    const 矩形 = this.矩形;

    // 默认位置为画布中心
    let x = this.canvas.offsetWidth / 2;
    let y = 30;
    let 局部X = 0;
    let 局部Y = 0;

    // 如果鼠标在画布内，则使用鼠标位置
    if (this.鼠标坐标.x !== null && this.鼠标坐标.y !== null) {
      x = this.鼠标坐标.x;
      y = this.鼠标坐标.y;

      // 计算鼠标在局部坐标系中的位置
      const dx = this.鼠标坐标.x - 矩形.x;
      const dy = this.鼠标坐标.y - 矩形.y;
      const 弧度 = (-矩形.旋转角度 * Math.PI) / 180;
      局部X = dx * Math.cos(弧度) - dy * Math.sin(弧度);
      局部Y = dx * Math.sin(弧度) + dy * Math.cos(弧度);
    }

    this.ctx.save();
    const 鼠标与文本距离 = 25;
    const 行距 = 18;
    const 符号颜色 = "#aaa";
    this.ctx.font = "12px 'Google Sans Code', Consolas, 'Noto Sans CJK SC', 微软雅黑, sans-serif";
    this.ctx.textBaseline = "top";

    // 如果鼠标在画布内，显示坐标信息
    if (this.鼠标坐标.x !== null && this.鼠标坐标.y !== null) {
      const xy宽度 = this.ctx.measureText("世界坐标").width;
      const 冒号空格宽度 = this.ctx.measureText(": ").width;
      const 世界x坐标值宽度 = this.ctx.measureText(`${Math.floor(this.鼠标坐标.x)}`).width;
      const 世界y坐标值宽度 = this.ctx.measureText(`${Math.floor(this.鼠标坐标.y)}`).width;
      const 局部x坐标值宽度 = this.ctx.measureText(`${Math.floor(局部X)}`).width;
      const 局部y坐标值宽度 = this.ctx.measureText(`${Math.floor(局部Y)}`).width;
      const 逗号空格宽度 = this.ctx.measureText(", ").width;
      const 世界总宽度 = xy宽度 + 冒号空格宽度 + 世界x坐标值宽度 + 逗号空格宽度 + 世界y坐标值宽度;
      const 局部总宽度 = xy宽度 + 冒号空格宽度 + 局部x坐标值宽度 + 逗号空格宽度 + 局部y坐标值宽度;
      if (x <= 世界总宽度 / 2) {
        x = 世界总宽度 / 2;
      } else if (x >= this.canvas.offsetWidth - 世界总宽度 / 2) {
        x = this.canvas.offsetWidth - 世界总宽度 / 2;
      }
      if (y <= -鼠标与文本距离 + 4) {
        y = -鼠标与文本距离 + 4;
      } else if (y >= this.canvas.offsetHeight - 鼠标与文本距离 * 4 - 行距 / 2) {
        y = this.canvas.offsetHeight - 鼠标与文本距离 * 4 - 行距 / 2;
      }

      if (this.显示选项.坐标背景) {
        const 最大宽度 = this.ctx.measureText("矩形尺寸: 1000 × 1000").width;
        this.ctx.beginPath();
        this.ctx.fillStyle = "#000a";
        this.ctx.roundRect(x - 世界总宽度 / 2 - 15, y + 鼠标与文本距离 - 15, 最大宽度 + 30, 110, [8]);
        this.ctx.fill();
      }

      // 世界坐标
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

      // 局部坐标
      const 局部坐标垂直坐标 = y + 鼠标与文本距离 + 行距;
      this.ctx.fillStyle = "silver";
      this.ctx.fillText("局部坐标", x - 世界总宽度 / 2, 局部坐标垂直坐标);
      this.ctx.fillStyle = 符号颜色;
      this.ctx.fillText(": ", x - 世界总宽度 / 2 + xy宽度, 局部坐标垂直坐标);
      this.ctx.fillStyle = "#ff5722";
      this.ctx.fillText(`${Math.floor(局部X)}`, x - 世界总宽度 / 2 + xy宽度 + 冒号空格宽度, 局部坐标垂直坐标);
      this.ctx.fillStyle = 符号颜色;
      this.ctx.fillText(", ", x - 世界总宽度 / 2 + xy宽度 + 冒号空格宽度 + 局部x坐标值宽度, 局部坐标垂直坐标);
      this.ctx.fillStyle = "#ff5722";
      this.ctx.fillText(
        `${Math.floor(局部Y)}`,
        x - 世界总宽度 / 2 + xy宽度 + 冒号空格宽度 + 局部x坐标值宽度 + 逗号空格宽度,
        局部坐标垂直坐标
      );

      // 矩形信息
      const x坐标垂直坐标 = y + 鼠标与文本距离 + 行距 * 2;
      const 矩形信息标题宽度 = this.ctx.measureText("矩形信息").width;
      const 矩形坐标x宽度 = this.ctx.measureText(`${Math.floor(矩形.x)}`).width;
      const 矩形旋转值宽度 = this.ctx.measureText(`${Math.floor(矩形.旋转角度)}`).width;
      const 矩形宽度值宽度 = this.ctx.measureText(`${Math.floor(矩形.宽度)}`).width;
      this.ctx.fillStyle = "silver";
      this.ctx.fillText("矩形中心", x - 世界总宽度 / 2, x坐标垂直坐标);
      this.ctx.fillText("旋转角度", x - 世界总宽度 / 2, x坐标垂直坐标 + 行距);
      this.ctx.fillText("矩形尺寸", x - 世界总宽度 / 2, x坐标垂直坐标 + 行距 * 2);
      this.ctx.fillStyle = 符号颜色;
      this.ctx.fillText(": ", x - 世界总宽度 / 2 + 矩形信息标题宽度, x坐标垂直坐标);
      this.ctx.fillText(": ", x - 世界总宽度 / 2 + 矩形信息标题宽度, x坐标垂直坐标 + 行距);
      this.ctx.fillText(": ", x - 世界总宽度 / 2 + 矩形信息标题宽度, x坐标垂直坐标 + 行距 * 2);
      this.ctx.fillStyle = "lightgreen";
      this.ctx.fillText(`${Math.floor(矩形.x)}`, x - 世界总宽度 / 2 + 矩形信息标题宽度 + 冒号空格宽度, x坐标垂直坐标);
      this.ctx.fillStyle = 符号颜色;
      this.ctx.fillText(", ", x - 世界总宽度 / 2 + 矩形信息标题宽度 + 冒号空格宽度 + 矩形坐标x宽度, x坐标垂直坐标);
      this.ctx.fillStyle = "lightgreen";
      this.ctx.fillText(
        `${Math.floor(矩形.y)}`,
        x - 世界总宽度 / 2 + 矩形信息标题宽度 + 冒号空格宽度 + 矩形坐标x宽度 + 逗号空格宽度,
        x坐标垂直坐标
      );
      this.ctx.fillText(
        `${Math.floor(矩形.旋转角度)}`,
        x - 世界总宽度 / 2 + 矩形信息标题宽度 + 冒号空格宽度,
        x坐标垂直坐标 + 行距
      );
      this.ctx.fillStyle = "#4cf";
      this.ctx.fillText(
        "°",
        x - 世界总宽度 / 2 + 矩形信息标题宽度 + 冒号空格宽度 + 矩形旋转值宽度,
        x坐标垂直坐标 + 行距
      );
      this.ctx.fillStyle = "lightgreen";
      const 乘号空格宽度 = this.ctx.measureText(" × ").width;
      this.ctx.fillText(
        `${Math.floor(矩形.宽度)}`,
        x - 世界总宽度 / 2 + 矩形信息标题宽度 + 冒号空格宽度,
        x坐标垂直坐标 + 行距 * 2
      );
      this.ctx.fillStyle = 符号颜色;
      this.ctx.fillText(
        " × ",
        x - 世界总宽度 / 2 + 矩形信息标题宽度 + 冒号空格宽度 + 矩形宽度值宽度,
        x坐标垂直坐标 + 行距 * 2
      );
      this.ctx.fillStyle = "lightgreen";
      this.ctx.fillText(
        `${Math.floor(矩形.高度)}`,
        x - 世界总宽度 / 2 + 矩形信息标题宽度 + 冒号空格宽度 + 矩形宽度值宽度 + 乘号空格宽度,
        x坐标垂直坐标 + 行距 * 2
      );
    }
    // 如果鼠标不在画布内，只显示矩形信息
    else {
      this.ctx.fillStyle = "silver";
      this.ctx.fillText(`矩形中心: (${Math.floor(矩形.x)}, ${Math.floor(矩形.y)})`, x - 100, y);
      this.ctx.fillText(`旋转角度: ${Math.floor(矩形.旋转角度)}°`, x - 100, y + 18);
      this.ctx.fillText(`尺寸: ${Math.floor(矩形.宽度)} × ${Math.floor(矩形.高度)}`, x - 100, y + 36);
    }

    this.ctx.restore();
  }

  绘制坐标参考线() {
    if (!this.复选框.坐标参考线.checked) return;

    // 如果鼠标不在画布内，不绘制参考线
    if (this.鼠标坐标.x === null || this.鼠标坐标.y === null) return;

    const 鼠标X = this.鼠标坐标.x;
    const 鼠标Y = this.鼠标坐标.y;
    const 画布宽度 = this.canvas.offsetWidth;
    const 画布高度 = this.canvas.offsetHeight;

    // 确保鼠标位置在画布范围内
    if (鼠标X < 0 || 鼠标X > 画布宽度 || 鼠标Y < 0 || 鼠标Y > 画布高度) return;

    this.ctx.save();

    // 设置虚线样式
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    this.ctx.lineWidth = 1;

    // 绘制垂直向上的虚线（从鼠标位置到画布顶部）
    this.ctx.beginPath();
    this.ctx.moveTo(鼠标X, 鼠标Y);
    this.ctx.lineTo(鼠标X, 0);
    this.ctx.stroke();

    // 绘制水平向左的虚线（从鼠标位置到画布左边缘）
    this.ctx.beginPath();
    this.ctx.moveTo(鼠标X, 鼠标Y);
    this.ctx.lineTo(0, 鼠标Y);
    this.ctx.stroke();

    this.ctx.restore();
  }

  清空画布() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  重置() {
    // 恢复矩形初始状态
    this.矩形 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
      宽度: 300,
      高度: 200,
      旋转角度: 0,
    };

    // 重置交互状态
    this.交互状态 = {
      正在拖动: false,
      正在缩放: false,
      正在旋转: false,
      拖动偏移: { x: 0, y: 0 },
      缩放起始: { 宽度: 0, 高度: 0, x: 0, y: 0, 矩形中心X: 0, 矩形中心Y: 0 },
      旋转起始: { 角度: 0, x: 0, y: 0 },
      鼠标位置: { x: 0, y: 0 },
      缩放边: null,
      缩放角: null,
      缩放锚点: { x: 0, y: 0 },
      Alt键按下: false,
    };

    // 重置鼠标坐标
    this.鼠标坐标 = {
      x: null,
      y: null,
    };

    // 重新绘制场景
    this.绘制场景();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new 坐标系教程();
});
