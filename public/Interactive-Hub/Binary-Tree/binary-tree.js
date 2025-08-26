class 二叉树可视化 {
  constructor() {
    this.canvas = document.querySelector("#canvas-二叉树");
    this.ctx = this.canvas.getContext("2d");
    this.devicePixelRatio = window.devicePixelRatio || 1;

    // 二叉树数据
    this.树类型 = "普通二叉树"; // 默认普通二叉树
    this.根节点 = null;
    this.拖拽的节点 = null;
    this.拖拽偏移 = { x: 0, y: 0 };
    this.拖拽的子节点信息 = []; // 存储所有子节点的相对位置
    this.鼠标按下位置 = { x: 0, y: 0 }; // 记录鼠标按下的初始位置
    this.是否已确定操作类型 = false; // 是否已经确定是点击还是拖拽

    // 颜色配置
    this.颜色 = {
      节点背景: "#1d2738",
      节点边框: "#4a5568",
      节点文字: "#ffffff",
      连线: "#a0aec0",
      left指针: "#ff6b6b",
      right指针: "#00d4aa",
      root标签: "rgb(152, 84, 123)",
      控制区背景: "rgba(40, 40, 40, 0.95)",
      控制区边框: "#555",
      删除按钮: "#8d1717",
      删除按钮悬停: "#ff3742",
      添加提示: "#4a90e2",
      字段名称: "#a0aec0",
      内存地址值: "#ffd700",
    };

    // 节点配置
    this.节点配置 = {
      宽度: 170, // 从80增加到200，参考Linked-List的宽度
      高度: 90, // 从60增加到110，容纳新增的文本内容
      圆角: 10, // 从8增加到10，与Linked-List保持一致
      水平间距: 250, // 从120增加到250，适应更宽的节点
      垂直间距: 150, // 从100增加到150，适应更高的节点
    };

    // 鼠标悬停和节点选择
    this.鼠标位置 = { x: 0, y: 0 };
    this.当前选中节点 = null; // 当前选中的节点
    this.悬停在删除按钮 = false;
    this.预览信息 = null; // 添加预览信息属性
    this.鼠标在控制区 = false; // 添加控制区状态

    // 字体
    this.字体 = '"Google Sans Code", Consolas, "Noto Sans SC", sans-serif';

    this.初始化Canvas();
    this.设置事件监听();
    this.创建控制区();
    this.创建示例树();
    this.重新布局树(); // 确保树在正确位置
    this.绘制();

    // 监听窗口大小变化
    window.addEventListener("resize", () => {
      this.初始化Canvas();
      this.重新布局树();
      this.绘制();
    });
  }

  初始化Canvas() {
    // 设置Canvas尺寸为视口大小
    this.canvas.width = window.innerWidth * this.devicePixelRatio;
    this.canvas.height = (window.innerHeight - 50) * this.devicePixelRatio;
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);

    // 设置Canvas样式
    this.canvas.style.border = "none";
    this.canvas.style.borderRadius = "0";
  }

  设置事件监听() {
    this.canvas.addEventListener("mousedown", (e) => this.处理鼠标按下(e));
    this.canvas.addEventListener("mousemove", (e) => this.处理鼠标移动(e));
    this.canvas.addEventListener("mouseup", () => this.处理鼠标松开());

    // 全局鼠标事件，确保拖拽状态持续
    document.addEventListener("mousemove", (e) => {
      if (this.拖拽的节点) {
        this.处理鼠标移动(e);
      }
    });

    document.addEventListener("mouseup", () => {
      if (this.拖拽的节点) {
        this.处理鼠标松开();
      }
    });

    // 鼠标悬停事件
    this.canvas.addEventListener("mousemove", (e) => {
      this.处理鼠标悬停(e);
    });

    // 添加控制区DOM事件监听
    this.设置控制区事件监听();
  }

  设置控制区事件监听() {
    // 等待DOM加载完成后设置事件监听
    const 设置控制区监听 = () => {
      const 后退区 = document.querySelector(".后退区");
      const 重置区 = document.querySelector(".重置区");

      if (后退区) {
        后退区.addEventListener("mouseenter", () => {
          this.鼠标在控制区 = true;
          this.预览信息 = null;
          this.绘制();
        });
        后退区.addEventListener("mouseleave", () => {
          this.鼠标在控制区 = false;
          this.绘制();
        });
      }

      if (重置区) {
        重置区.addEventListener("mouseenter", () => {
          this.鼠标在控制区 = true;
          this.预览信息 = null;
          this.绘制();
        });
        重置区.addEventListener("mouseleave", () => {
          this.鼠标在控制区 = false;
          this.绘制();
        });
      }
    };

    // 如果DOM已经加载完成，立即设置；否则等待DOMContentLoaded事件
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", 设置控制区监听);
    } else {
      设置控制区监听();
    }
  }

  创建控制区() {
    const 控制区 = document.querySelector(".控制区");
    控制区.innerHTML = `
      <div class="控制面板">
        <div class="控制组">
          <label>树类型：</label>
          <div class="radio组">
            <label class="radio标签">
              <input type="radio" name="树类型" value="普通二叉树" checked>
              <span class="radio文本">普通二叉树</span>
            </label>
            <label class="radio标签">
              <input type="radio" name="树类型" value="平衡二叉树">
              <span class="radio文本">平衡二叉树</span>
            </label>
            <label class="radio标签">
              <input type="radio" name="树类型" value="完美二叉树">
              <span class="radio文本">完美二叉树</span>
            </label>
            <label class="radio标签">
              <input type="radio" name="树类型" value="二叉搜索树">
              <span class="radio文本">二叉搜索树</span>
            </label>
            <label class="radio标签">
              <input type="radio" name="树类型" value="AVL树">
              <span class="radio文本">AVL树</span>
            </label>
          </div>
        </div>
        <div class="控制组">
          <button id="添加节点按钮">添加节点</button>
        </div>
        <div class="控制组">
          <button id="随机生成按钮">随机生成</button>
        </div>
      </div>
    `;

    // 绑定事件
    document.querySelectorAll('input[name="树类型"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.树类型 = e.target.value;
        this.重新构建树();
        this.绘制();
      });
    });

    document.getElementById("添加节点按钮").addEventListener("click", () => {
      this.添加随机节点();
    });

    document.getElementById("随机生成按钮").addEventListener("click", () => {
      this.随机生成树();
    });

    // 为重置按钮添加功能
    document.querySelector(".重置按钮").addEventListener("click", () => {
      this.重置();
    });
  }

  创建示例树() {
    // 创建根节点（位置将由重新布局树方法设置）
    this.根节点 = this.创建节点(50, 0, 0);

    // 创建左子树
    this.根节点.left = this.创建节点(30, 0, 0);
    this.根节点.left.left = this.创建节点(20, 0, 0);
    this.根节点.left.right = this.创建节点(40, 0, 0);

    // 创建右子树
    this.根节点.right = this.创建节点(80, 0, 0);
    this.根节点.right.left = this.创建节点(70, 0, 0);
    this.根节点.right.right = this.创建节点(90, 0, 0);
  }

  创建节点(值, x, y) {
    return {
      id: Date.now() + Math.random(),
      值: 值,
      内存地址: this.生成随机内存地址(),
      x: x,
      y: y,
      left: null,
      right: null,
    };
  }

  生成随机内存地址() {
    // 生成32位十六进制地址
    const 地址 = Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .toUpperCase();
    return "0x" + 地址.padStart(8, "0");
  }

  添加随机节点() {
    const 新值 = Math.floor(Math.random() * 100) + 1;
    const 新节点 = this.创建节点(新值, 0, 0);

    if (!this.根节点) {
      // 如果没有根节点，设置为根节点
      this.根节点 = 新节点;
      this.根节点.x = window.innerWidth / 2;
      this.根节点.y = 100;
    } else {
      // 根据树类型添加节点
      this.根据树类型添加节点(新节点);
    }

    this.重新布局树();
    this.绘制();
  }

  根据树类型添加节点(新节点) {
    switch (this.树类型) {
      case "普通二叉树":
        this.添加到普通二叉树(新节点);
        break;
      case "平衡二叉树":
        this.添加到平衡二叉树(新节点);
        break;
      case "完美二叉树":
        this.添加到完美二叉树(新节点);
        break;
      case "二叉搜索树":
        this.添加到二叉搜索树(新节点);
        break;
      case "AVL树":
        this.添加到AVL树(新节点);
        break;
    }
  }

  添加到普通二叉树(新节点) {
    // 随机选择一个位置添加
    const 位置 = Math.random();
    if (位置 < 0.5) {
      if (!this.根节点.left) {
        this.根节点.left = 新节点;
      } else if (!this.根节点.right) {
        this.根节点.right = 新节点;
      } else {
        // 递归添加到子节点
        this.递归添加到普通二叉树(this.根节点.left, 新节点);
      }
    } else {
      if (!this.根节点.right) {
        this.根节点.right = 新节点;
      } else if (!this.根节点.left) {
        this.根节点.left = 新节点;
      } else {
        // 递归添加到子节点
        this.递归添加到普通二叉树(this.根节点.right, 新节点);
      }
    }
  }

  递归添加到普通二叉树(当前节点, 新节点) {
    if (!当前节点.left) {
      当前节点.left = 新节点;
      return;
    }
    if (!当前节点.right) {
      当前节点.right = 新节点;
      return;
    }

    // 随机选择左子树或右子树
    if (Math.random() < 0.5) {
      this.递归添加到普通二叉树(当前节点.left, 新节点);
    } else {
      this.递归添加到普通二叉树(当前节点.right, 新节点);
    }
  }

  添加到平衡二叉树(新节点) {
    // 平衡二叉树：左右子树高度差不超过1
    if (!this.根节点.left) {
      this.根节点.left = 新节点;
    } else if (!this.根节点.right) {
      this.根节点.right = 新节点;
    } else {
      const 左高度 = this.获取树高度(this.根节点.left);
      const 右高度 = this.获取树高度(this.根节点.right);

      if (左高度 <= 右高度) {
        this.递归添加到平衡二叉树(this.根节点.left, 新节点);
      } else {
        this.递归添加到平衡二叉树(this.根节点.right, 新节点);
      }
    }
  }

  添加到完美二叉树(新节点) {
    // 完美二叉树：所有层都被完全填满
    const 层数 = this.获取树的层数();
    const 当前层节点数 = this.获取当前层节点数(层数);
    const 当前层最大节点数 = Math.pow(2, 层数 - 1);

    if (当前层节点数 < 当前层最大节点数) {
      // 在当前层添加
      this.添加到指定层(this.根节点, 新节点, 层数, 当前层节点数);
    } else {
      // 在新的一层添加
      this.添加到指定层(this.根节点, 新节点, 层数 + 1, 0);
    }
  }

  添加到指定层(节点, 新节点, 目标层数, 当前层数) {
    if (!节点) return false;
    if (当前层数 === 目标层数) {
      if (!节点.left) {
        节点.left = 新节点;
        return true;
      }
      if (!节点.right) {
        节点.right = 新节点;
        return true;
      }
      return false;
    }

    if (this.添加到指定层(节点.left, 新节点, 目标层数, 当前层数 + 1)) {
      return true;
    }
    return this.添加到指定层(节点.right, 新节点, 目标层数, 当前层数 + 1);
  }

  添加到二叉搜索树(新节点) {
    // 二叉搜索树：左子树所有节点值小于根节点，右子树所有节点值大于根节点
    if (新节点.值 < this.根节点.值) {
      if (!this.根节点.left) {
        this.根节点.left = 新节点;
      } else {
        this.递归添加到二叉搜索树(this.根节点.left, 新节点);
      }
    } else {
      if (!this.根节点.right) {
        this.根节点.right = 新节点;
      } else {
        this.递归添加到二叉搜索树(this.根节点.right, 新节点);
      }
    }
  }

  添加到AVL树(新节点) {
    // AVL树：平衡的二叉搜索树
    this.添加到二叉搜索树(新节点);
    this.平衡AVL树();
  }

  随机生成树() {
    this.根节点 = null;
    const 节点数量 = Math.floor(Math.random() * 10) + 5; // 5-14个节点

    for (let i = 0; i < 节点数量; i++) {
      this.添加随机节点();
    }

    this.重新布局树();
    this.绘制();
  }

  重置() {
    this.根节点 = null;
    this.创建示例树();
    this.重新布局树();
    this.绘制();
  }

  获取树高度(节点) {
    if (!节点) return 0;
    return Math.max(this.获取树高度(节点.left), this.获取树高度(节点.right)) + 1;
  }

  获取树的层数() {
    return this.获取树高度(this.根节点);
  }

  获取当前层节点数(层数) {
    return this.计算层节点数(this.根节点, 层数, 1);
  }

  计算层节点数(节点, 目标层数, 当前层数) {
    if (!节点) return 0;
    if (当前层数 === 目标层数) return 1;
    return this.计算层节点数(节点.left, 目标层数, 当前层数 + 1) + this.计算层节点数(节点.right, 目标层数, 当前层数 + 1);
  }

  添加到指定层(节点, 新节点, 目标层数, 当前层数) {
    if (!节点) return false;
    if (当前层数 === 目标层数) {
      if (!节点.left) {
        节点.left = 新节点;
        return true;
      }
      if (!节点.right) {
        节点.right = 新节点;
        return true;
      }
      return false;
    }

    if (this.添加到指定层(节点.left, 新节点, 目标层数, 当前层数 + 1)) {
      return true;
    }
    return this.添加到指定层(节点.right, 新节点, 目标层数, 当前层数 + 1);
  }

  递归添加到二叉搜索树(当前节点, 新节点) {
    if (新节点.值 < 当前节点.值) {
      if (!当前节点.left) {
        当前节点.left = 新节点;
      } else {
        this.递归添加到二叉搜索树(当前节点.left, 新节点);
      }
    } else {
      if (!当前节点.right) {
        当前节点.right = 新节点;
      } else {
        this.递归添加到二叉搜索树(当前节点.right, 新节点);
      }
    }
  }

  递归添加到平衡二叉树(当前节点, 新节点) {
    if (!当前节点.left) {
      当前节点.left = 新节点;
      return;
    }
    if (!当前节点.right) {
      当前节点.right = 新节点;
      return;
    }

    const 左高度 = this.获取树高度(当前节点.left);
    const 右高度 = this.获取树高度(当前节点.right);

    if (左高度 <= 右高度) {
      this.递归添加到平衡二叉树(当前节点.left, 新节点);
    } else {
      this.递归添加到平衡二叉树(当前节点.right, 新节点);
    }
  }

  平衡AVL树() {
    // 简化版AVL平衡，实际实现会更复杂
    this.根节点 = this.平衡节点(this.根节点);
  }

  平衡节点(节点) {
    if (!节点) return null;

    节点.left = this.平衡节点(节点.left);
    节点.right = this.平衡节点(节点.right);

    const 平衡因子 = this.获取平衡因子(节点);

    if (平衡因子 > 1) {
      // 左子树过高，需要右旋
      if (this.获取平衡因子(节点.left) < 0) {
        // 左-右情况，先左旋再右旋
        节点.left = this.左旋(节点.left);
      }
      return this.右旋(节点);
    }

    if (平衡因子 < -1) {
      // 右子树过高，需要左旋
      if (this.获取平衡因子(节点.right) > 0) {
        // 右-左情况，先右旋再左旋
        节点.right = this.右旋(节点.right);
      }
      return this.左旋(节点);
    }

    return 节点;
  }

  获取平衡因子(节点) {
    if (!节点) return 0;
    return this.获取树高度(节点.left) - this.获取树高度(节点.right);
  }

  左旋(节点) {
    const 右子节点 = 节点.right;
    节点.right = 右子节点.left;
    右子节点.left = 节点;
    return 右子节点;
  }

  右旋(节点) {
    const 左子节点 = 节点.left;
    节点.left = 左子节点.right;
    左子节点.right = 节点;
    return 左子节点;
  }

  重新构建树() {
    if (!this.根节点) return;

    // 保存现有节点的值
    const 节点值数组 = this.收集所有节点值(this.根节点);

    // 根据树类型重新构建
    this.根节点 = null;

    for (const 值 of 节点值数组) {
      const 新节点 = this.创建节点(值, 0, 0);
      if (!this.根节点) {
        this.根节点 = 新节点;
      } else {
        this.根据树类型添加节点(新节点);
      }
    }

    this.重新布局树();
  }

  收集所有节点值(节点) {
    if (!节点) return [];
    return [节点.值, ...this.收集所有节点值(节点.left), ...this.收集所有节点值(节点.right)];
  }

  重新布局树() {
    if (!this.根节点) return;

    const canvas宽度 = this.canvas.width / this.devicePixelRatio;
    const 根节点X = canvas宽度 / 2;
    const 根节点Y = 200;

    this.根节点.x = 根节点X;
    this.根节点.y = 根节点Y;

    this.布局子树(this.根节点, 根节点X, 根节点Y, 1);
  }

  布局子树(节点, x, y, 层数) {
    if (!节点) return;

    节点.x = x;
    节点.y = y;

    const 水平偏移 = this.节点配置.水平间距 / Math.pow(2, 层数 - 1);
    const 垂直偏移 = this.节点配置.垂直间距;

    if (节点.left) {
      this.布局子树(节点.left, x - 水平偏移, y + 垂直偏移, 层数 + 1);
    }

    if (节点.right) {
      this.布局子树(节点.right, x + 水平偏移, y + 垂直偏移, 层数 + 1);
    }
  }

  处理鼠标按下(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / this.devicePixelRatio / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / this.devicePixelRatio / rect.height);

    // 只处理左键点击
    if (e.button !== 0) return;

    // 记录鼠标按下的初始位置
    this.鼠标按下位置 = { x, y };
    this.是否已确定操作类型 = false;

    // 检查是否点击了节点
    const 点击的节点 = this.查找点击的节点(x, y);
    if (点击的节点) {
      // 记录拖拽信息，但不确定是否拖拽
      this.拖拽的节点 = 点击的节点;
      this.拖拽偏移.x = x - 点击的节点.x;
      this.拖拽偏移.y = y - 点击的节点.y;

      // 记录所有子节点的相对位置
      this.拖拽的子节点信息 = this.收集子节点相对位置(点击的节点);

      // 不立即返回，等待鼠标移动来判断是点击还是拖拽
    } else {
      // 如果点击在空白处且有预览信息，则添加节点
      if (this.预览信息) {
        this.添加节点到位置(x, y);
      }
    }
  }

  处理鼠标移动(e) {
    if (!this.拖拽的节点) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / this.devicePixelRatio / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / this.devicePixelRatio / rect.height);

    // 计算鼠标移动距离
    const 移动距离 = Math.sqrt(Math.pow(x - this.鼠标按下位置.x, 2) + Math.pow(y - this.鼠标按下位置.y, 2));

    // 如果移动距离超过2像素，确定为拖拽操作
    if (移动距离 > 2) {
      this.是否已确定操作类型 = true;
      this.canvas.style.cursor = "grabbing";

      // 移动主拖拽节点
      this.拖拽的节点.x = x - this.拖拽偏移.x;
      this.拖拽的节点.y = y - this.拖拽偏移.y;

      // 移动所有子节点，保持相对位置
      this.拖拽的子节点信息.forEach(({ 节点, 相对X, 相对Y }) => {
        if (节点 !== this.拖拽的节点) {
          // 避免重复移动主节点
          节点.x = this.拖拽的节点.x + 相对X;
          节点.y = this.拖拽的节点.y + 相对Y;
        }
      });

      this.绘制();
    }
  }

  处理鼠标松开() {
    if (this.拖拽的节点 && !this.是否已确定操作类型) {
      // 如果移动距离 <= 2像素，认为是点击操作
      const 点击的节点 = this.拖拽的节点;

      // 如果点击的是当前选中的节点，则取消选中
      if (点击的节点 === this.当前选中节点) {
        this.当前选中节点 = null;
        this.预览信息 = null;
      } else {
        // 如果点击的是其他节点，则选中该节点
        this.当前选中节点 = 点击的节点;
        this.预览信息 = null;
      }

      this.绘制();
    }

    // 清理拖拽状态
    this.拖拽的节点 = null;
    this.拖拽的子节点信息 = [];
    this.是否已确定操作类型 = false;

    // 恢复默认鼠标样式
    this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
  }

  处理鼠标悬停(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / this.devicePixelRatio / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / this.devicePixelRatio / rect.height);

    // 更新鼠标位置
    this.鼠标位置 = { x, y };

    // 如果鼠标在控制区，不显示预览
    if (this.鼠标在控制区) {
      this.悬停的节点 = null;
      this.预览信息 = null;
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
      this.绘制();
      return;
    }

    // 检查鼠标是否悬停在节点上
    const 悬停的节点 = this.查找点击的节点(x, y);
    if (悬停的节点) {
      this.悬停的节点 = 悬停的节点;
      this.canvas.style.cursor = "grab";
      this.预览信息 = null; // 悬停在节点上时不显示预览
    } else {
      this.悬停的节点 = null;
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';

      // 只有当有当前选中节点时才生成预览
      if (this.当前选中节点) {
        const 预览信息 = this.获取节点预览信息(x, y);
        if (预览信息) {
          this.预览信息 = 预览信息;
        } else {
          this.预览信息 = null;
        }
      } else {
        this.预览信息 = null;
      }
    }

    this.绘制();
  }

  查找点击的节点(x, y) {
    // 按照绘制顺序查找节点，后绘制的节点（上方的节点）优先被找到
    return this.按绘制顺序查找节点(x, y);
  }

  按绘制顺序查找节点(x, y) {
    // 按照绘制顺序：根节点 -> 左子树 -> 右子树
    // 这样后绘制的节点会优先被找到
    const 节点列表 = [];
    this.收集所有节点(this.根节点, 节点列表);
    
    // 从后往前查找，优先找到后绘制的节点（上方的节点）
    for (let i = 节点列表.length - 1; i >= 0; i--) {
      const 节点 = 节点列表[i];
      if (this.点击在节点内(x, y, 节点)) {
        return 节点;
      }
    }
    
    return null;
  }

  收集所有节点(节点, 节点列表) {
    if (!节点) return;
    
    // 先添加当前节点
    节点列表.push(节点);
    
    // 再递归添加左子树
    if (节点.left) {
      this.收集所有节点(节点.left, 节点列表);
    }
    
    // 最后递归添加右子树
    if (节点.right) {
      this.收集所有节点(节点.right, 节点列表);
    }
  }

  点击在节点内(x, y, 节点) {
    return (
      x >= 节点.x - this.节点配置.宽度 / 2 &&
      x <= 节点.x + this.节点配置.宽度 / 2 &&
      y >= 节点.y - this.节点配置.高度 / 2 &&
      y <= 节点.y + this.节点配置.高度 / 2
    );
  }

  添加节点到位置(x, y) {
    const 新值 = Math.floor(Math.random() * 100) + 1;
    const 新节点 = this.创建节点(新值, x, y);

    if (!this.根节点) {
      this.根节点 = 新节点;
    } else {
      // 使用预览信息来确定父节点和节点类型
      if (this.预览信息) {
        const { 父节点, 是左子节点 } = this.预览信息;
        if (是左子节点) {
          父节点.left = 新节点;
        } else {
          父节点.right = 新节点;
        }
        // 设置新节点的位置
        新节点.x = this.预览信息.x;
        新节点.y = this.预览信息.y;
      } else {
        // 如果没有预览信息，使用原来的逻辑
        const 父节点 = this.找到最近的父节点(x, y);
        if (父节点) {
          if (x < 父节点.x) {
            父节点.left = 新节点;
          } else {
            父节点.right = 新节点;
          }
        }
      }
    }

    // 清除预览信息
    this.预览信息 = null;
    this.绘制();
  }

  找到最近的父节点(x, y) {
    return this.递归找到父节点(this.根节点, x, y);
  }

  递归找到父节点(节点, x, y) {
    if (!节点) return null;

    // 检查是否可以作为父节点
    if (this.可以作为父节点(节点, x, y)) {
      return 节点;
    }

    const 左结果 = this.递归找到父节点(节点.left, x, y);
    if (左结果) return 左结果;

    return this.递归找到父节点(节点.right, x, y);
  }

  可以作为父节点(节点, x, y) {
    // 调整有效添加范围，减小水平范围以避免冲突，增大垂直范围
    const 水平距离 = Math.abs(x - 节点.x);
    const 垂直距离 = Math.abs(y - 节点.y);
    const 有效水平范围 = this.节点配置.水平间距 * 0.6; // 减小到60%避免冲突
    const 有效垂直范围 = this.节点配置.垂直间距 * 1.5; // 增大到150%提供更好的垂直范围

    return (
      水平距离 <= 有效水平范围 &&
      垂直距离 <= 有效垂直范围 &&
      ((x < 节点.x && !节点.left) || (x > 节点.x && !节点.right))
    );
  }

  获取节点预览信息(x, y) {
    if (!this.当前选中节点) return null;

    // 基于当前选中节点生成预览
    const 父节点 = this.当前选中节点;

    // 根据鼠标位置确定是左子节点还是右子节点
    const 是左子节点 = x < 父节点.x;

    // 检查是否已经有对应的子节点
    if (是左子节点 && 父节点.left) return null; // 已有左子节点
    if (!是左子节点 && 父节点.right) return null; // 已有右子节点

    // 预览节点位置完全跟随鼠标移动
    const 预览X = x; // 直接使用鼠标X坐标
    const 预览Y = y; // 直接使用鼠标Y坐标

    return {
      父节点: 父节点,
      节点类型: 是左子节点 ? "left" : "right",
      x: 预览X,
      y: 预览Y,
      是左子节点: 是左子节点,
    };
  }

  检查连线是否在选中路径上(父节点, 子节点) {
    // 如果没有选中节点，返回false
    if (!this.当前选中节点) return false;

    // 如果子节点就是选中的节点，这条连线在选中路径上
    if (子节点 === this.当前选中节点) return true;

    // 递归检查子节点是否在选中路径上
    return this.检查节点是否在选中路径上(子节点);
  }

  检查节点是否在选中路径上(节点) {
    // 如果没有选中节点，返回false
    if (!this.当前选中节点 || !节点) return false;

    // 如果当前节点就是选中的节点，返回true
    if (节点 === this.当前选中节点) return true;

    // 递归检查左子树
    if (节点.left && this.检查节点是否在选中路径上(节点.left)) {
      return true;
    }

    // 递归检查右子树
    if (节点.right && this.检查节点是否在选中路径上(节点.right)) {
      return true;
    }

    return false;
  }

  收集子节点相对位置(父节点) {
    const 子节点信息 = [];

    const 递归收集 = (节点) => {
      if (!节点) return;

      // 记录当前节点相对于父节点的位置
      子节点信息.push({
        节点: 节点,
        相对X: 节点.x - 父节点.x,
        相对Y: 节点.y - 父节点.y,
      });

      // 递归收集左子节点
      if (节点.left) {
        递归收集(节点.left);
      }

      // 递归收集右子节点
      if (节点.right) {
        递归收集(节点.right);
      }
    };

    // 从父节点开始收集
    递归收集(父节点);

    return 子节点信息;
  }

  绘制() {
    // 清空Canvas
    this.ctx.clearRect(0, 0, this.canvas.width / this.devicePixelRatio, this.canvas.height / this.devicePixelRatio);

    if (!this.根节点) return;

    // 绘制连线
    this.绘制连线(this.根节点);

    // 绘制节点
    this.绘制所有节点(this.根节点);

    // 绘制预览节点
    if (this.预览信息) {
      this.绘制预览节点();
    }
  }

  绘制连线(节点) {
    if (!节点) return;

    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";

    // 绘制到左子节点的连线
    if (节点.left) {
      this.ctx.strokeStyle = this.颜色.left指针;
      this.绘制连线到子节点(节点, 节点.left, "left");
      this.绘制连线(节点.left);
    }

    // 绘制到右子节点的连线
    if (节点.right) {
      this.ctx.strokeStyle = this.颜色.right指针;
      this.绘制连线到子节点(节点, 节点.right, "right");
      this.绘制连线(节点.right);
    }
  }

  绘制连线到子节点(父节点, 子节点, 方向) {
    // 修改连线起点水平位置：左子节点为25%处，右子节点为75%处
    const 起点X = 父节点.x + (方向 === "left" ? -this.节点配置.宽度 * 0.25 : this.节点配置.宽度 * 0.25);
    const 起点Y = 父节点.y + this.节点配置.高度 / 2;
    const 终点X = 子节点.x;
    const 终点Y = 子节点.y - this.节点配置.高度 / 2;

    // 检查这条连线是否在选中路径上
    const 连线在选中路径上 = this.检查连线是否在选中路径上(父节点, 子节点);

    // 设置透明度：选中路径上100%，其他50%
    this.ctx.globalAlpha = 连线在选中路径上 ? 1.0 : 0.33;

    // 绘制贝塞尔曲线
    this.ctx.beginPath();
    this.ctx.moveTo(起点X, 起点Y);

    const 控制点1X = 起点X;
    const 控制点1Y = 起点Y + (终点Y - 起点Y) * 0.3;
    const 控制点2X = 终点X;
    const 控制点2Y = 终点Y - (终点Y - 起点Y) * 0.3;

    this.ctx.bezierCurveTo(控制点1X, 控制点1Y, 控制点2X, 控制点2Y, 终点X, 终点Y);
    this.ctx.stroke();

    // 绘制箭头
    this.绘制箭头(终点X, 终点Y, 控制点2X, 控制点2Y);

    // 恢复透明度
    this.ctx.globalAlpha = 1.0;
  }

  绘制箭头(x, y, 控制点X, 控制点Y) {
    const 箭头长度 = 8;
    const 箭头角度 = Math.atan2(y - 控制点Y, x - 控制点X);

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x - 箭头长度 * Math.cos(箭头角度 - Math.PI / 6), y - 箭头长度 * Math.sin(箭头角度 - Math.PI / 6));
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x - 箭头长度 * Math.cos(箭头角度 + Math.PI / 6), y - 箭头长度 * Math.sin(箭头角度 + Math.PI / 6));
    this.ctx.stroke();
  }

  绘制所有节点(节点) {
    if (!节点) return;

    this.绘制节点(节点);
    this.绘制所有节点(节点.left);
    this.绘制所有节点(节点.right);
  }

  绘制节点(节点) {
    // 检查是否悬停和已选中
    const 鼠标悬停 = this.悬停的节点 === 节点;
    const 已选中 = this.当前选中节点 === 节点;

    let 背景色, 边框色;

    if (已选中) {
      // 选中状态：使用特殊的选中颜色
      背景色 = "#1a4080"; // 蓝色背景
      边框色 = "silver"; // 白色边框
    } else if (鼠标悬停) {
      // 悬停状态
      背景色 = "#2d3a4c";
      边框色 = "#8a9cad";
    } else {
      // 普通状态
      背景色 = this.颜色.节点背景;
      边框色 = this.颜色.节点边框;
    }

    // 绘制节点背景
    this.ctx.fillStyle = 背景色;
    this.ctx.strokeStyle = 边框色;
    this.ctx.lineWidth = 2;

    // 绘制圆角矩形
    const x = 节点.x - this.节点配置.宽度 / 2;
    const y = 节点.y - this.节点配置.高度 / 2;
    const width = this.节点配置.宽度;
    const height = this.节点配置.高度;
    const radius = this.节点配置.圆角;

    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // 设置字体和文本对齐
    this.ctx.font = `14px ${this.字体}`;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle"; // 添加文本基线设置，确保垂直对齐一致

    // 计算字段名称的最大宽度
    const 字段名称列表 = ["ID：", "left：", "right："];
    const 字段名称宽度 = Math.max(...字段名称列表.map((名称) => this.ctx.measureText(名称).width));
    const 中文冒号宽度 = this.ctx.measureText("：").width;
    const 内存地址宽度 = this.ctx.measureText(" 0x12345678").width;

    // 计算文本起始位置
    const 文本X = x + 15;

    // 绘制内存地址（在节点上方）
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.textAlign = "right";
    this.ctx.fillText("内存地址", 文本X + 字段名称宽度 - 中文冒号宽度, y - 20);
    this.ctx.fillStyle = "gray";
    this.ctx.fillText(" : ", 文本X + 字段名称宽度 + 4, y - 20);
    this.ctx.textAlign = "left";

    // 绘制内存地址值，0x部分使用#999颜色
    const 内存地址文本 = 节点.内存地址;
    const 零x部分 = "0x";
    const 地址部分 = 内存地址文本.substring(2);

    // 先绘制0x部分（#999颜色）
    this.ctx.fillStyle = "#999";
    this.ctx.fillText(零x部分, 文本X + 字段名称宽度, y - 20);

    // 再绘制地址部分（原来的颜色）
    this.ctx.fillStyle = this.颜色.内存地址值;
    const 零x宽度 = this.ctx.measureText(零x部分).width;
    this.ctx.fillText(地址部分, 文本X + 字段名称宽度 + 零x宽度 + 1, y - 20);

    // 绘制节点内容
    this.ctx.font = `14px ${this.字体}`;
    this.ctx.textAlign = "left";

    // 计算文本起始位置
    let 当前Y = y + 25;

    // 第一行：ID
    this.ctx.fillStyle = this.颜色.字段名称;
    this.ctx.textAlign = "right";
    this.ctx.fillText("ID", 文本X + 字段名称宽度 - 中文冒号宽度, 当前Y);
    this.ctx.fillStyle = "gray";
    this.ctx.fillText(" : ", 文本X + 字段名称宽度 + 4, 当前Y);
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = 已选中 ? this.颜色.节点文字 : "#6ad";
    this.ctx.fillText(节点.值.toString(), 文本X + 字段名称宽度, 当前Y);
    当前Y += 22; // 节点行高

    // 第二行：left指针
    const 左子节点地址 = 节点.left ? 节点.left.内存地址 : "NULL";
    this.ctx.fillStyle = this.颜色.left指针;
    this.ctx.textAlign = "right";
    this.ctx.fillText("left", 文本X + 字段名称宽度 - 中文冒号宽度, 当前Y);
    this.ctx.fillStyle = "gray";
    this.ctx.fillText(" : ", 文本X + 字段名称宽度 + 4, 当前Y);
    this.ctx.textAlign = "left";

    // 绘制left值，0x部分使用#999颜色
    if (左子节点地址 !== "NULL") {
      const 零x部分 = "0x";
      const 地址部分 = 左子节点地址.substring(2);

      // 先绘制0x部分（#999颜色）
      this.ctx.fillStyle = "#999";
      this.ctx.fillText(零x部分, 文本X + 字段名称宽度, 当前Y);

      // 再绘制地址部分（原来的颜色）
      this.ctx.fillStyle = this.颜色.left指针;
      const 零x宽度 = this.ctx.measureText(零x部分).width;
      this.ctx.fillText(地址部分, 文本X + 字段名称宽度 + 零x宽度 + 1, 当前Y);
    } else {
      this.ctx.fillStyle = this.颜色.left指针;
      this.ctx.fillText(左子节点地址, 文本X + 字段名称宽度, 当前Y);
    }
    当前Y += 22; // 节点行高

    // 第三行：right指针
    const 右子节点地址 = 节点.right ? 节点.right.内存地址 : "NULL";
    this.ctx.fillStyle = this.颜色.right指针;
    this.ctx.textAlign = "right";
    this.ctx.fillText("right", 文本X + 字段名称宽度 - 中文冒号宽度, 当前Y);
    this.ctx.fillStyle = "gray";
    this.ctx.fillText(" : ", 文本X + 字段名称宽度 + 4, 当前Y);
    this.ctx.textAlign = "left";

    // 绘制right值，0x部分使用#999颜色
    if (右子节点地址 !== "NULL") {
      const 零x部分 = "0x";
      const 地址部分 = 右子节点地址.substring(2);

      // 先绘制0x部分（#999颜色）
      this.ctx.fillStyle = "#999";
      this.ctx.fillText(零x部分, 文本X + 字段名称宽度, 当前Y);

      // 再绘制地址部分（原来的颜色）
      this.ctx.fillStyle = this.颜色.right指针;
      const 零x宽度 = this.ctx.measureText(零x部分).width;
      this.ctx.fillText(地址部分, 文本X + 字段名称宽度 + 零x宽度 + 1, 当前Y);
    } else {
      this.ctx.fillStyle = this.颜色.right指针;
      this.ctx.fillText(右子节点地址, 文本X + 字段名称宽度, 当前Y);
    }

    // 绘制root标签
    if (节点 === this.根节点) {
      this.ctx.fillStyle = this.颜色.root标签;
      this.ctx.font = `bold 18px ${this.字体}`;
      this.ctx.textAlign = "center";
      this.ctx.fillText("root", 节点.x, y - 45);
    }
  }

  绘制预览节点() {
    if (!this.预览信息) return;

    const { x, y, 父节点, 是左子节点 } = this.预览信息;

    // 绘制25%透明度的预览节点
    this.ctx.globalAlpha = 0.25;

    // 绘制节点背景
    this.ctx.fillStyle = this.颜色.节点背景;
    this.ctx.strokeStyle = this.颜色.节点边框;
    this.ctx.lineWidth = 2;

    // 绘制圆角矩形
    const nodeX = x - this.节点配置.宽度 / 2;
    const nodeY = y - this.节点配置.高度 / 2;
    const width = this.节点配置.宽度;
    const height = this.节点配置.高度;
    const radius = this.节点配置.圆角;

    this.ctx.beginPath();
    this.ctx.moveTo(nodeX + radius, nodeY);
    this.ctx.lineTo(nodeX + width - radius, nodeY);
    this.ctx.quadraticCurveTo(nodeX + width, nodeY, nodeX + width, nodeY + radius);
    this.ctx.lineTo(nodeX + width, nodeY + height - radius);
    this.ctx.quadraticCurveTo(nodeX + width, nodeY + height, nodeX + width - radius, nodeY + height);
    this.ctx.lineTo(nodeX + radius, nodeY + height);
    this.ctx.quadraticCurveTo(nodeX, nodeY + height, nodeX, nodeY + height - radius);
    this.ctx.lineTo(nodeX, nodeY + radius);
    this.ctx.quadraticCurveTo(nodeX, nodeY, nodeX + radius, nodeY);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // 绘制预览文字
    this.ctx.fillStyle = this.颜色.节点文字;
    this.ctx.font = `bold 40px ${this.字体}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText("+", x, y);

    // 绘制预览连线
    this.ctx.strokeStyle = 是左子节点 ? this.颜色.left指针 : this.颜色.right指针;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";

    // 计算连线起点和终点
    // 修改连线起点水平位置：左子节点为25%处，右子节点为75%处
    const 起点X = 父节点.x + (是左子节点 ? -this.节点配置.宽度 * 0.25 : this.节点配置.宽度 * 0.25);
    const 起点Y = 父节点.y + this.节点配置.高度 / 2;
    const 终点X = x;
    const 终点Y = y - this.节点配置.高度 / 2;

    // 绘制贝塞尔曲线
    this.ctx.beginPath();
    this.ctx.moveTo(起点X, 起点Y);

    const 控制点1X = 起点X;
    const 控制点1Y = 起点Y + (终点Y - 起点Y) * 0.3;
    const 控制点2X = 终点X;
    const 控制点2Y = 终点Y - (终点Y - 起点Y) * 0.3;

    this.ctx.bezierCurveTo(控制点1X, 控制点1Y, 控制点2X, 控制点2Y, 终点X, 终点Y);
    this.ctx.stroke();

    // 绘制箭头
    this.绘制箭头(终点X, 终点Y, 控制点2X, 控制点2Y);

    // 恢复透明度
    this.ctx.globalAlpha = 1.0;

    // 绘制节点类型标签
    this.ctx.fillStyle = 是左子节点 ? this.颜色.left指针 : this.颜色.right指针;
    this.ctx.font = `bold 14px ${this.字体}`;
    this.ctx.textAlign = "center";
    this.ctx.fillText(是左子节点 ? "L" : "R", x, y - this.节点配置.高度 / 2 - 20);
  }
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  new 二叉树可视化();
});
