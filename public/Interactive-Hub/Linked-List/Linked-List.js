class 链表可视化 {
  constructor() {
    this.canvas = document.querySelector(".展示区 canvas");
    this.ctx = this.canvas.getContext("2d");
    this.devicePixelRatio = window.devicePixelRatio || 1;

    // 链表数据
    this.链表类型 = "单向链表"; // 默认单向链表
    this.节点数组 = [];
    this.拖拽的节点 = null;
    this.拖拽偏移 = { x: 0, y: 0 };
    this.环形模式 = false; // 默认不选中环形模式

    // 颜色配置
    this.颜色 = {
      节点背景: "#1d2738",
      节点边框: "#4a5568",
      节点文字: "#ffffff",
      连线: "#fff3",
      箭头颜色: "#39d",
      指针文字: "#ff6b6b",
      head标签: "rgb(152, 84, 123)",
      控制区背景: "rgba(40, 40, 40, 0.95)",
      控制区边框: "#555",
      字段名称: "#a0aec0",
      姓名值: "#ffffff",
      年龄值: "#ffffff",
      内存地址值: "#ffd700",
      next值: "#ff6b6b",
      previous值: "yellowgreen",
      删除按钮: "#8d1717",
      删除按钮悬停: "#ff3742",
      添加提示: "#4a90e2",
    };

    // 节点配置
    this.节点配置 = {
      宽度: 200,
      圆角: 10,
      间距: 250,
    };

    // 动画相关
    this.删除动画 = {
      正在删除: false,
      删除的节点: null,
      动画开始时间: 0,
      动画持续时间: 1000,
      连线过渡时间: 350,
      过渡动画: null,
    };

    // 鼠标悬停添加节点提示
    this.鼠标位置 = { x: 0, y: 0 };
    this.显示添加提示 = false;
    this.悬停在删除按钮 = false;
    this.鼠标在控制区 = false;
    this.启用添加节点 = true;

    // 字体
    this.字体 = '"Google Sans Code", Consolas, "Noto Sans SC", sans-serif';

    this.初始化Canvas();
    this.设置事件监听();
    this.添加控制区DOM事件侦听器();
    this.绘制();

    // 监听窗口大小变化
    window.addEventListener("resize", () => {
      this.初始化Canvas();
      this.绘制();
    });
  }

  初始化Canvas() {
    this.canvas.width = window.innerWidth * this.devicePixelRatio;
    this.canvas.height = (window.innerHeight - 50) * this.devicePixelRatio;
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);

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
          this.显示添加提示 = false;
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
          this.显示添加提示 = false;
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

  添加控制区DOM事件侦听器() {
    document.querySelectorAll('input[name="链表类型"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.链表类型 = e.target.value;
        this.更新节点指针();
        this.绘制();
      });
    });

    document.getElementById("环形复选框").addEventListener("change", (e) => {
      this.环形模式 = e.target.checked;
      this.更新节点指针();
      this.绘制();
    });

    document.getElementById("添加节点复选框").addEventListener("change", (e) => {
      this.启用添加节点 = e.target.checked;
      // 如果取消选中，隐藏预览节点
      if (!this.启用添加节点) {
        this.显示添加提示 = false;
      }
      this.绘制();
    });

    // 为重置按钮添加功能
    document.querySelector(".重置按钮").addEventListener("click", () => {
      this.重置();
    });
  }

  生成随机姓名() {
    const 姓氏 = [
      "张",
      "王",
      "李",
      "赵",
      "陈",
      "刘",
      "杨",
      "黄",
      "周",
      "吴",
      "徐",
      "孙",
      "胡",
      "朱",
      "高",
      "林",
      "何",
      "郭",
      "马",
      "罗",
      "梁",
      "宋",
      "郑",
      "谢",
      "韩",
      "唐",
      "冯",
      "于",
      "董",
      "萧",
      "程",
      "曹",
      "袁",
      "邓",
      "许",
      "傅",
      "沈",
      "曾",
      "彭",
      "吕",
      "苏",
      "卢",
      "蒋",
      "蔡",
      "贾",
      "丁",
      "魏",
      "薛",
      "叶",
      "阎",
      "余",
      "潘",
      "杜",
      "戴",
      "夏",
      "钟",
      "汪",
      "田",
      "任",
      "姜",
      "范",
      "方",
      "石",
      "姚",
      "谭",
      "廖",
      "邹",
      "熊",
      "金",
      "陆",
      "郝",
      "孔",
      "白",
      "崔",
      "康",
      "毛",
      "邱",
      "秦",
      "江",
      "史",
      "顾",
      "侯",
      "邵",
      "孟",
      "龙",
      "万",
      "段",
      "雷",
      "钱",
      "汤",
      "尹",
      "黎",
      "易",
      "常",
      "武",
      "乔",
      "贺",
      "赖",
      "龚",
      "文",
    ];
    const 名字 = [
      // 传统经典名字（各时代都有）
      "伟",
      "芳",
      "娜",
      "敏",
      "静",
      "丽",
      "强",
      "磊",
      "军",
      "洋",
      "勇",
      "艳",
      "杰",
      "娟",
      "涛",
      "明",
      "超",
      "霞",
      "平",
      "刚",

      // 建国初期特色名字（50-70年代）
      "建国",
      "建军",
      "建平",
      "建强",
      "建明",
      "建新",
      "建伟",
      "建英",
      "建珍",
      "建芳",
      "志强",
      "志明",
      "志新",
      "志伟",
      "志平",
      "志华",
      "志英",
      "志珍",
      "志芳",
      "志兰",
      "国强",
      "国明",
      "国新",
      "国伟",
      "国平",
      "国华",
      "国英",
      "国珍",
      "国芳",
      "国兰",
      "家强",
      "家明",
      "家新",
      "家伟",
      "家平",
      "家华",
      "家英",
      "家珍",
      "家芳",
      "家兰",
      "文强",
      "文明",
      "文新",
      "文伟",
      "文平",
      "文华",
      "文英",
      "文珍",
      "文芳",
      "文兰",
      "玉华",
      "玉英",
      "玉珍",
      "玉芳",
      "玉兰",
      "秀华",
      "秀英",
      "秀珍",
      "秀芳",
      "秀兰",
      "美华",
      "美英",
      "美珍",
      "美芳",
      "美兰",
      "丽华",
      "丽英",
      "丽珍",
      "丽芳",
      "丽兰",

      // 改革开放时期名字（80-90年代）
      "浩",
      "博",
      "宇",
      "天",
      "子",
      "涵",
      "萱",
      "琪",
      "瑶",
      "欣",
      "鑫",
      "磊",
      "鹏",
      "飞",
      "龙",
      "虎",
      "威",
      "锋",
      "锐",
      "智",
      "慧",
      "颖",
      "莹",
      "雪",
      "雨",
      "云",
      "风",
      "雷",
      "电",
      "光",
      "晨",
      "曦",
      "旭",
      "阳",
      "月",
      "星",
      "辰",
      "宇",
      "宙",
      "天",

      // 新世纪名字（00年代）
      "梓",
      "涵",
      "萱",
      "琪",
      "瑶",
      "欣",
      "鑫",
      "磊",
      "鹏",
      "飞",
      "龙",
      "虎",
      "威",
      "锋",
      "锐",
      "智",
      "慧",
      "颖",
      "莹",
      "雪",
      "雨",
      "云",
      "风",
      "雷",
      "电",
      "光",
      "晨",
      "曦",
      "旭",
      "阳",
      "月",
      "星",
      "辰",
      "宇",
      "宙",
      "天",
      "地",
      "山",
      "水",
      "火",

      // 现代流行名字（10年代至今）
      "子墨",
      "子轩",
      "子涵",
      "子萱",
      "子琪",
      "子瑶",
      "子欣",
      "子鑫",
      "子磊",
      "子鹏",
      "梓墨",
      "梓轩",
      "梓涵",
      "梓萱",
      "梓琪",
      "梓瑶",
      "梓欣",
      "梓鑫",
      "梓磊",
      "梓鹏",
      "浩然",
      "浩宇",
      "浩天",
      "浩博",
      "浩轩",
      "浩涵",
      "浩萱",
      "浩琪",
      "浩瑶",
      "浩欣",
      "博文",
      "博雅",
      "博学",
      "博识",
      "博闻",
      "博见",
      "博爱",
      "博学",
      "博雅",
      "博文",
    ];
    return 姓氏[Math.floor(Math.random() * 姓氏.length)] + 名字[Math.floor(Math.random() * 名字.length)];
  }

  生成随机内存地址() {
    // 生成32位十六进制地址
    const 地址 = Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .toUpperCase();
    return "0x" + 地址.padStart(8, "0");
  }

  添加节点(指定位置 = null) {
    // 计算Canvas可视区域
    const canvas宽度 = this.canvas.width / this.devicePixelRatio;
    const canvas高度 = this.canvas.height / this.devicePixelRatio;

    // 计算新节点的位置
    let x, y;

    // 计算节点高度
    const 节点行高 = 22;
    const 顶部边距 = 25;
    const 底部边距 = 15;
    const 字段数量 = this.链表类型 === "双向链表" ? 3 : 2; // 姓名、年龄、next、previous(双向链表)
    const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;

    if (指定位置) {
      // 如果指定了位置（鼠标点击位置），以该位置为中心点
      // 创建临时节点来计算宽度
      const 临时节点 = {
        姓名: "临时",
        年龄: 0,
        next: null,
        previous: null,
      };
      const 临时宽度 = this.计算节点宽度(临时节点);
      x = 指定位置.x - 临时宽度 / 2;
      y = 指定位置.y - 节点高度 / 2;
    } else if (this.节点数组.length === 0) {
      // 第一个节点，放在Canvas偏左上角位置
      x = 150;
      y = 250;
    } else {
      // 获取最后一个节点的位置
      const 最后一个节点 = this.节点数组[this.节点数组.length - 1];
      const 最后一个节点宽度 = this.计算节点宽度(最后一个节点);
      const 新节点X = 最后一个节点.x + 最后一个节点宽度 + this.节点配置.间距;

      // 创建临时节点来计算新节点宽度
      const 临时节点 = {
        姓名: "临时",
        年龄: 0,
        next: null,
        previous: null,
      };
      const 新节点宽度 = this.计算节点宽度(临时节点);

      // 检查新节点是否会超出Canvas右边界
      if (新节点X + 新节点宽度 > canvas宽度 - 50) {
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
      x = Math.max(50, Math.min(x, canvas宽度 - 新节点宽度 - 50));
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
      previous: null,
    };

    this.节点数组.push(新节点);
    this.更新节点指针();
    this.绘制();
  }

  更新节点指针() {
    // 清空所有指针
    this.节点数组.forEach((节点) => {
      节点.next = null;
      节点.previous = null;
    });

    // 重新建立指针关系
    for (let i = 0; i < this.节点数组.length - 1; i++) {
      this.节点数组[i].next = this.节点数组[i + 1];
      if (this.链表类型 === "双向链表") {
        this.节点数组[i + 1].previous = this.节点数组[i];
      }
    }

    // 如果是环形模式且节点数量大于1，建立循环引用
    if (this.环形模式 && this.节点数组.length > 1) {
      if (this.链表类型 === "双向链表") {
        // 双向链表：head节点的previous指向最后一个节点，最后一个节点的next指向head节点
        this.节点数组[0].previous = this.节点数组[this.节点数组.length - 1];
        this.节点数组[this.节点数组.length - 1].next = this.节点数组[0];
      } else {
        // 单向链表：最后一个节点的next指向head节点
        this.节点数组[this.节点数组.length - 1].next = this.节点数组[0];
      }
    }
  }

  重置() {
    // 清空节点数组
    this.节点数组 = [];
    this.环形模式 = false;
    this.启用添加节点 = true;

    // 清理动画状态
    this.删除动画.正在删除 = false;
    this.删除动画.删除的节点 = null;
    this.删除动画.过渡动画 = null;

    // 重置其他状态
    this.拖拽的节点 = null;
    this.拖拽偏移 = { x: 0, y: 0 };
    this.悬停的节点 = null;
    this.悬停在删除按钮 = false;
    this.显示添加提示 = false;
    this.鼠标在控制区 = false;

    // 重置环形复选框
    const 环形复选框 = document.getElementById("环形复选框");
    if (环形复选框) {
      环形复选框.checked = false;
    }

    // 重置添加节点复选框
    const 添加节点复选框 = document.getElementById("添加节点复选框");
    if (添加节点复选框) {
      添加节点复选框.checked = true;
    }

    // 重新绘制
    this.绘制();
  }

  处理鼠标按下(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / this.devicePixelRatio / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / this.devicePixelRatio / rect.height);

    // 只处理左键点击
    if (e.button !== 0) return;

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
        this.canvas.style.cursor = "grabbing";
        break;
      }
    }

    // 如果点击在空白处且显示添加提示，则添加节点
    if (this.显示添加提示 && this.启用添加节点) {
      this.添加节点({ x: x, y: y });
      // 创建节点后，立即隐藏预览节点并重新检测鼠标位置
      this.显示添加提示 = false;
      // 立即重新检测鼠标是否在新创建的节点上
      this.重新检测鼠标位置(x, y);
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
    const 字段数量 = this.链表类型 === "双向链表" ? 3 : 2; // 姓名、年龄、next、previous(双向链表)
    const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;

    const 节点宽度 = this.计算节点宽度(节点);
    return x >= 节点.x && x <= 节点.x + 节点宽度 && y >= 节点.y && y <= 节点.y + 节点高度;
  }

  点击在删除按钮内(x, y, 节点) {
    const 按钮大小 = 25;
    const 节点宽度 = this.计算节点宽度(节点);
    const 按钮X = 节点.x + 节点宽度 - 按钮大小 / 2 - 3; // 顶在右上角，向内5px
    const 按钮Y = 节点.y + 按钮大小 / 2 + 3; // 顶在右上角，向下5px
    return (
      x >= 按钮X - 按钮大小 / 2 && x <= 按钮X + 按钮大小 / 2 && y >= 按钮Y - 按钮大小 / 2 && y <= 按钮Y + 按钮大小 / 2
    );
  }

  鼠标在节点边界附近(x, y, 节点) {
    // 计算节点高度
    const 节点行高 = 22;
    const 顶部边距 = 25;
    const 底部边距 = 15;
    const 字段数量 = this.链表类型 === "双向链表" ? 3 : 2; // 姓名、年龄、next、previous(双向链表)
    const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;

    const 节点宽度 = this.计算节点宽度(节点);

    // 左边界向外20px范围，但只在节点垂直范围内检测
    if (x >= 节点.x - 20 && x <= 节点.x) {
      if (y >= 节点.y - 20 && y <= 节点.y + 节点高度 + 20) {
        return true;
      }
    }

    // 右边界向外20px范围，但只在节点垂直范围内检测
    if (x >= 节点.x + 节点宽度 && x <= 节点.x + 节点宽度 + 20) {
      if (y >= 节点.y - 20 && y <= 节点.y + 节点高度 + 20) {
        return true;
      }
    }

    // 下边界向外20px范围，但只在节点宽度范围内检测
    if (y >= 节点.y + 节点高度 && y <= 节点.y + 节点高度 + 20) {
      if (x >= 节点.x - 20 && x <= 节点.x + 节点宽度 + 20) {
        return true;
      }
    }

    // 上边界向外20px范围，但只在节点宽度范围内检测
    if (y >= 节点.y - 20 && y <= 节点.y) {
      if (x >= 节点.x - 20 && x <= 节点.x + 节点宽度 + 20) {
        return true;
      }
    }

    return false;
  }

  重新检测鼠标位置(x, y) {
    // 更新鼠标位置
    this.鼠标位置 = { x, y };

    // 如果鼠标在控制区，不显示添加提示
    if (this.鼠标在控制区) {
      this.悬停的节点 = null;
      this.悬停在删除按钮 = false;
      this.显示添加提示 = false;
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
      this.绘制();
      return;
    }

    // 检查鼠标是否悬停在删除按钮上
    let 悬停在删除按钮 = false;
    this.悬停在删除按钮 = false;
    for (let i = this.节点数组.length - 1; i >= 0; i--) {
      const 节点 = this.节点数组[i];
      if (this.点击在删除按钮内(x, y, 节点)) {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
        悬停在删除按钮 = true;
        this.悬停在删除按钮 = true;
        this.绘制删除按钮(节点);
        this.悬停的节点 = 节点; // 设置悬停的节点，这样删除按钮会显示
        this.显示添加提示 = false;
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
          this.canvas.style.cursor = "grab";
          this.显示添加提示 = false;
          break;
        }
      }
    }

    // 如果既不在删除按钮上也不在节点上，检查是否在节点边界附近
    if (!悬停在删除按钮 && !this.悬停的节点) {
      // 检查鼠标是否在节点边界附近
      let 在节点边界附近 = false;
      for (let i = 0; i < this.节点数组.length; i++) {
        const 节点 = this.节点数组[i];
        if (this.鼠标在节点边界附近(x, y, 节点)) {
          在节点边界附近 = true;
          break;
        }
      }

      if (!在节点边界附近) {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
        // 只有在启用添加节点时才显示预览节点
        this.显示添加提示 = this.启用添加节点;
      } else {
        this.显示添加提示 = false;
      }
    }

    this.绘制();
  }

  处理鼠标悬停(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.canvas.width / this.devicePixelRatio / rect.width);
    const y = (e.clientY - rect.top) * (this.canvas.height / this.devicePixelRatio / rect.height);

    // 更新鼠标位置
    this.鼠标位置 = { x, y };

    // 如果鼠标在控制区，不显示添加提示
    if (this.鼠标在控制区) {
      this.悬停的节点 = null;
      this.悬停在删除按钮 = false;
      this.显示添加提示 = false;
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
      this.绘制();
      return;
    }

    // 检查鼠标是否悬停在删除按钮上
    let 悬停在删除按钮 = false;
    this.悬停在删除按钮 = false;
    for (let i = this.节点数组.length - 1; i >= 0; i--) {
      const 节点 = this.节点数组[i];
      if (this.点击在删除按钮内(x, y, 节点)) {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
        悬停在删除按钮 = true;
        this.悬停在删除按钮 = true;
        this.绘制删除按钮(节点);
        this.悬停的节点 = 节点; // 设置悬停的节点，这样删除按钮会显示
        this.显示添加提示 = false;
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
          this.canvas.style.cursor = "grab";
          this.显示添加提示 = false;
          break;
        }
      }
    }

    // 如果既不在删除按钮上也不在节点上，检查是否在节点边界附近
    if (!悬停在删除按钮 && !this.悬停的节点) {
      // 检查鼠标是否在节点边界附近
      let 在节点边界附近 = false;
      for (let i = 0; i < this.节点数组.length; i++) {
        const 节点 = this.节点数组[i];
        if (this.鼠标在节点边界附近(x, y, 节点)) {
          在节点边界附近 = true;
          break;
        }
      }

      if (!在节点边界附近) {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), auto';
        // 只有在启用添加节点时才显示预览节点
        this.显示添加提示 = this.启用添加节点;
      } else {
        this.显示添加提示 = false;
      }
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
    const 字段数量 = this.链表类型 === "双向链表" ? 3 : 2; // 姓名、年龄、next、previous(双向链表)
    const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;

    this.删除动画.过渡动画 = {
      前一个节点: 前一个节点,
      后一个节点: 后一个节点,
      原始起点: 前一个节点
        ? { x: 前一个节点.x + this.计算节点宽度(前一个节点) + 6 + 2, y: 前一个节点.y + 节点高度 / 2 }
        : null,
      原始终点: 要删除的节点 ? { x: 要删除的节点.x - 6 - 2, y: 要删除的节点.y + 节点高度 / 2 } : null,
      目标起点: 前一个节点
        ? { x: 前一个节点.x + this.计算节点宽度(前一个节点) + 6 + 2, y: 前一个节点.y + 节点高度 / 2 }
        : null,
      目标终点: 后一个节点 ? { x: 后一个节点.x - 6 - 2, y: 后一个节点.y + 节点高度 / 2 } : null,
      要删除的节点: 要删除的节点,
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
      const 要删除的节点索引 = this.节点数组.findIndex((节点) => 节点 === this.删除动画.删除的节点);
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

    // 绘制预览节点（在最下方，不遮挡其他元素）
    if (this.显示添加提示) {
      this.绘制预览节点();
    }

    // 绘制连线（在预览节点上方）
    this.绘制连线();

    // 绘制节点（在最上方）
    this.节点数组.forEach((节点, 索引) => {
      this.绘制节点(节点, 索引);
    });
  }

  绘制连线() {
    this.ctx.strokeStyle = this.颜色.连线;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";

    // 计算节点高度
    const 节点行高 = 22;
    const 顶部边距 = 25;
    const 底部边距 = 15;
    const 字段数量 = this.链表类型 === "双向链表" ? 3 : 2; // 姓名、年龄、next、previous(双向链表)
    const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;

    // 绘制正常的连线
    for (let i = 0; i < this.节点数组.length; i++) {
      const 当前节点 = this.节点数组[i];

      // 检查是否在删除动画中且当前连线需要特殊处理
      if (this.删除动画.正在删除 && this.删除动画.过渡动画) {
        const 动画 = this.删除动画.过渡动画;
        // 如果是前一个节点到要删除的节点的连线，跳过正常绘制（由过渡动画处理）
        if (当前节点 === 动画.前一个节点 && 当前节点.next === 动画.要删除的节点) {
          continue;
        }
        // 如果是删除的节点到后一个节点的连线，跳过正常绘制
        if (当前节点 === 动画.要删除的节点 && 当前节点.next === 动画.后一个节点) {
          continue;
        }
      }

      // 绘制next连线
      if (当前节点.next) {
        // 计算连线起点和终点（与圆点保持2像素距离）
        const 圆点半径 = 6;
        const 连线偏移 = 8;
        const 起点X = 当前节点.x + this.计算节点宽度(当前节点) + 圆点半径 + 连线偏移;
        const 起点Y = 当前节点.y + 节点高度 / 2;
        const 终点X = 当前节点.next.x - 圆点半径 - 连线偏移;
        const 终点Y = 当前节点.next.y + 节点高度 / 2;

        // 计算水平位置差
        const 水平位置差 = 终点X - 起点X;
        const 垂直位置差绝对值 = Math.abs(终点Y - 起点Y);
        console.log(水平位置差);

        // 根据水平位置差动态调整控制点
        let 控制点1X, 控制点2X;
        const 调整系数 = 水平位置差 < 50 ? Math.min(20, 6 - 水平位置差 / 50) : Math.max(5, 水平位置差 / 50);
        let 基础偏移 = Math.min(17, Math.abs(水平位置差 * 4) / 150 + 10) * Math.min(1, 垂直位置差绝对值 / 250 + 0.25);
        控制点1X = 起点X + 基础偏移 * 调整系数 + 20;
        控制点2X = 终点X - 基础偏移 * 调整系数 - 20;

        const 控制点1Y = 起点Y;
        const 控制点2Y = 终点Y;

        // 绘制贝塞尔曲线
        this.ctx.beginPath();
        this.ctx.moveTo(起点X, 起点Y);
        this.ctx.bezierCurveTo(控制点1X, 控制点1Y, 控制点2X, 控制点2Y, 终点X, 终点Y);
        this.ctx.stroke();

        // 绘制箭头
        this.绘制箭头(起点X, 起点Y, 终点X, 终点Y, 控制点1X, 控制点1Y, 控制点2X, 控制点2Y, false);

        // 如果是双向链表，在起点也绘制一个箭头
        if (this.链表类型 === "双向链表") {
          this.绘制箭头(起点X, 起点Y, 终点X, 终点Y, 控制点1X, 控制点1Y, 控制点2X, 控制点2Y, true);
        }
      }
    }

    // 绘制预览节点的连线（如果有节点且显示添加提示）
    if (this.显示添加提示 && this.节点数组.length > 0) {
      this.绘制预览节点连线();
    }

    // 绘制删除动画中的过渡连线
    if (this.删除动画.正在删除 && this.删除动画.过渡动画) {
      const 动画 = this.删除动画.过渡动画;
      const 当前时间 = Date.now();
      const 经过时间 = 当前时间 - this.删除动画.动画开始时间;
      const 连线进度 = Math.min(经过时间 / this.删除动画.连线过渡时间, 1);

      if (连线进度 < 1 && 动画.前一个节点 && 动画.后一个节点) {
        const 起点X = 动画.原始起点.x + (动画.目标起点.x - 动画.原始起点.x) * 连线进度;
        const 起点Y = 动画.原始起点.y + (动画.目标起点.y - 动画.原始起点.y) * 连线进度;
        const 终点X = 动画.原始终点.x + (动画.目标终点.x - 动画.原始终点.x) * 连线进度;
        const 终点Y = 动画.原始终点.y + (动画.目标终点.y - 动画.原始终点.y) * 连线进度;

        // 绘制过渡连线
        this.ctx.strokeStyle = this.颜色.连线;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(起点X, 起点Y);

        // 计算水平位置差并动态调整控制点
        const 水平位置差 = 终点X - 起点X;
        let 控制点1X, 控制点2X;

        if (水平位置差 < 50) {
          // 当水平位置差小于50时（包括负值），增加P1的水平坐标，减少P2的水平坐标
          const 调整系数 = Math.max(0.3, 1 - 水平位置差 / 50); // 最小0.3，最大1.0
          const 基础偏移 = 50; // 基础偏移量

          // 统一使用相同的弯曲逻辑，无论水平位置差是正是负
          控制点1X = 起点X + 基础偏移 * 调整系数;
          控制点2X = 终点X - 基础偏移 * 调整系数;
        } else {
          // 当水平位置差大于等于50时，使用原来的计算方式
          控制点1X = 起点X + (终点X - 起点X) * 0.3;
          控制点2X = 终点X - (终点X - 起点X) * 0.3;
        }

        const 控制点1Y = 起点Y;
        const 控制点2Y = 终点Y;

        this.ctx.bezierCurveTo(控制点1X, 控制点1Y, 控制点2X, 控制点2Y, 终点X, 终点Y);
        this.ctx.stroke();

        // 绘制箭头
        this.绘制箭头(起点X, 起点Y, 终点X, 终点Y, 控制点1X, 控制点1Y, 控制点2X, 控制点2Y, false);

        // 如果是双向链表，在起点也绘制一个箭头
        if (this.链表类型 === "双向链表") {
          this.绘制箭头(起点X, 起点Y, 终点X, 终点Y, 控制点1X, 控制点1Y, 控制点2X, 控制点2Y, true);
        }
      }
    }
  }

  绘制预览节点连线() {
    // 计算节点高度
    const 节点行高 = 22;
    const 顶部边距 = 25;
    const 底部边距 = 15;
    const 字段数量 = this.链表类型 === "双向链表" ? 3 : 2;
    const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;

    // 计算预览节点的位置和尺寸
    const 临时节点 = {
      姓名: "预览",
      年龄: 0,
      next: null,
      previous: null,
    };
    const 预览节点宽度 = this.计算节点宽度(临时节点);
    const 预览节点X = this.鼠标位置.x - 预览节点宽度 / 2;
    const 预览节点Y = this.鼠标位置.y - 节点高度 / 2;

    // 找到最后一个节点，绘制从最后一个节点到预览节点的next连线
    const 最后一个节点 = this.节点数组[this.节点数组.length - 1];
    if (最后一个节点) {
      // 计算连线起点和终点
      const 圆点半径 = 6;
      const 连线偏移 = 8;
      const 起点X = 最后一个节点.x + this.计算节点宽度(最后一个节点) + 圆点半径 + 连线偏移;
      const 起点Y = 最后一个节点.y + 节点高度 / 2;
      const 终点X = 预览节点X - 圆点半径 - 连线偏移;
      const 终点Y = 预览节点Y + 节点高度 / 2;

      // 计算水平位置差
      const 水平位置差 = 终点X - 起点X;
      const 垂直位置差绝对值 = Math.abs(终点Y - 起点Y);

      // 根据水平位置差动态调整控制点
      let 控制点1X, 控制点2X;
      const 调整系数 = 水平位置差 < 50 ? Math.min(20, 6 - 水平位置差 / 50) : Math.max(5, 水平位置差 / 50);
      let 基础偏移 = Math.min(25, Math.abs(水平位置差 * 4) / 150 + 10);
      基础偏移 *= Math.min(1, 垂直位置差绝对值 / 250);
      控制点1X = 起点X + 基础偏移 * 调整系数;
      控制点2X = 终点X - 基础偏移 * 调整系数;

      const 控制点1Y = 起点Y;
      const 控制点2Y = 终点Y;

      // 使用半透明颜色绘制预览连线
      this.ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`; // 20%不透明度的白色
      this.ctx.lineWidth = 2;

      // 绘制贝塞尔曲线
      this.ctx.beginPath();
      this.ctx.moveTo(起点X, 起点Y);
      this.ctx.bezierCurveTo(控制点1X, 控制点1Y, 控制点2X, 控制点2Y, 终点X, 终点Y);
      this.ctx.stroke();

      // 绘制箭头（使用半透明颜色）
      this.ctx.strokeStyle = `rgba(57, 153, 221, 0.2)`; // 20%不透明度的箭头颜色
      this.ctx.lineWidth = 2;

      // 计算箭头方向
      const t = 0.97;
      const 切线X =
        3 * Math.pow(1 - t, 2) * (控制点1X - 起点X) +
        6 * (1 - t) * t * (控制点2X - 控制点1X) +
        3 * Math.pow(t, 2) * (终点X - 控制点2X);
      const 切线Y =
        3 * Math.pow(1 - t, 2) * (控制点1Y - 起点Y) +
        6 * (1 - t) * t * (控制点2Y - 控制点1Y) +
        3 * Math.pow(t, 2) * (终点Y - 控制点2Y);

      const 箭头长度 = 10;
      const 箭头角度 = Math.atan2(切线Y, 切线X);

      // 绘制箭头
      this.ctx.beginPath();
      this.ctx.moveTo(终点X, 终点Y);
      this.ctx.lineTo(
        终点X - 箭头长度 * Math.cos(箭头角度 - Math.PI / 6),
        终点Y - 箭头长度 * Math.sin(箭头角度 - Math.PI / 6)
      );
      this.ctx.moveTo(终点X, 终点Y);
      this.ctx.lineTo(
        终点X - 箭头长度 * Math.cos(箭头角度 + Math.PI / 6),
        终点Y - 箭头长度 * Math.sin(箭头角度 + Math.PI / 6)
      );
      this.ctx.stroke();

      // 恢复原来的连线颜色
      this.ctx.strokeStyle = this.颜色.连线;
    }

    // 如果是双向链表，为前面的连线添加起点箭头
    if (this.链表类型 === "双向链表" && this.节点数组.length > 0) {
      const 最后一个节点 = this.节点数组[this.节点数组.length - 1];
      if (最后一个节点) {
        // 计算连线起点和终点（与上面的连线计算保持一致）
        const 圆点半径 = 6;
        const 连线偏移 = 8;
        const 起点X = 最后一个节点.x + this.计算节点宽度(最后一个节点) + 圆点半径 + 连线偏移;
        const 起点Y = 最后一个节点.y + 节点高度 / 2;
        const 终点X = 预览节点X - 圆点半径 - 连线偏移;
        const 终点Y = 预览节点Y + 节点高度 / 2;

        // 计算水平位置差
        const 水平位置差 = 终点X - 起点X;
        const 垂直位置差绝对值 = Math.abs(终点Y - 起点Y);

        // 根据水平位置差动态调整控制点
        let 控制点1X, 控制点2X;
        const 调整系数 = 水平位置差 < 50 ? Math.min(20, 6 - 水平位置差 / 50) : Math.max(5, 水平位置差 / 50);
        let 基础偏移 = Math.min(25, Math.abs(水平位置差 * 4) / 150 + 10);
        基础偏移 *= Math.min(1, 垂直位置差绝对值 / 250);
        控制点1X = 起点X + 基础偏移 * 调整系数;
        控制点2X = 终点X - 基础偏移 * 调整系数;

        const 控制点1Y = 起点Y;
        const 控制点2Y = 终点Y;

        // 绘制起点箭头（从最后一个节点指向预览节点）
        this.ctx.strokeStyle = `rgba(57, 153, 221, 0.2)`; // 20%不透明度的next箭头颜色
        this.ctx.lineWidth = 2;

        // 计算起点箭头方向（正向箭头）
        const t = 0.97;
        const 切线X =
          3 * Math.pow(1 - t, 2) * (控制点1X - 起点X) +
          6 * (1 - t) * t * (控制点2X - 控制点1X) +
          3 * Math.pow(t, 2) * (终点X - 控制点2X);
        const 切线Y =
          3 * Math.pow(1 - t, 2) * (控制点1Y - 起点Y) +
          6 * (1 - t) * t * (控制点2Y - 控制点1Y) +
          3 * Math.pow(t, 2) * (终点Y - 控制点2Y);

        const 箭头长度 = 10;
        const 箭头角度 = Math.atan2(切线Y, 切线X);

        // 绘制起点箭头
        this.ctx.beginPath();
        this.ctx.moveTo(起点X, 起点Y);
        this.ctx.lineTo(
          起点X + 箭头长度 * Math.cos(箭头角度 - Math.PI / 6),
          起点Y + 箭头长度 * Math.sin(箭头角度 - Math.PI / 6)
        );
        this.ctx.moveTo(起点X, 起点Y);
        this.ctx.lineTo(
          起点X + 箭头长度 * Math.cos(箭头角度 + Math.PI / 6),
          起点Y + 箭头长度 * Math.sin(箭头角度 + Math.PI / 6)
        );
        this.ctx.stroke();

        // 恢复原来的连线颜色
        this.ctx.strokeStyle = this.颜色.连线;
      }
    }
  }

  绘制箭头(起点X, 起点Y, 终点X, 终点Y, 控制点1X, 控制点1Y, 控制点2X, 控制点2Y, 是反向箭头 = false) {
    // 使用真正的贝塞尔曲线切线公式计算箭头方向
    const t = 是反向箭头 ? 0.03 : 0.97; // 反向箭头用t=0.1，正向箭头用t=0.9

    // 贝塞尔曲线切线公式：B'(t) = 3(1-t)²(P₁-P₀) + 6(1-t)t(P₂-P₁) + 3t²(P₃-P₂)
    const 切线X =
      3 * Math.pow(1 - t, 2) * (控制点1X - 起点X) +
      6 * (1 - t) * t * (控制点2X - 控制点1X) +
      3 * Math.pow(t, 2) * (终点X - 控制点2X);

    const 切线Y =
      3 * Math.pow(1 - t, 2) * (控制点1Y - 起点Y) +
      6 * (1 - t) * t * (控制点2Y - 控制点1Y) +
      3 * Math.pow(t, 2) * (终点Y - 控制点2Y);

    const 箭头长度 = 10;
    const 箭头角度 = Math.atan2(切线Y, 切线X);

    // 根据是否是反向箭头调整角度
    const 最终角度 = 是反向箭头 ? 箭头角度 + Math.PI : 箭头角度;

    // 设置箭头颜色
    this.ctx.strokeStyle = this.颜色.箭头颜色;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(是反向箭头 ? 起点X : 终点X, 是反向箭头 ? 起点Y : 终点Y);

    // 绘制箭头的两个分支
    this.ctx.lineTo(
      (是反向箭头 ? 起点X : 终点X) - 箭头长度 * Math.cos(最终角度 - Math.PI / 6),
      (是反向箭头 ? 起点Y : 终点Y) - 箭头长度 * Math.sin(最终角度 - Math.PI / 6)
    );
    this.ctx.moveTo(是反向箭头 ? 起点X : 终点X, 是反向箭头 ? 起点Y : 终点Y);
    this.ctx.lineTo(
      (是反向箭头 ? 起点X : 终点X) - 箭头长度 * Math.cos(最终角度 + Math.PI / 6),
      (是反向箭头 ? 起点Y : 终点Y) - 箭头长度 * Math.sin(最终角度 + Math.PI / 6)
    );

    this.ctx.stroke();

    // 恢复原来的连线颜色
    this.ctx.strokeStyle = this.颜色.连线;
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
    const 字段数量 = this.链表类型 === "双向链表" ? 3 : 2; // 姓名、年龄、next、previous(双向链表)
    const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;

    // 计算节点宽度
    const 节点宽度 = this.计算节点宽度(节点);

    // 检查是否悬停
    const 鼠标悬停 = this.悬停的节点 === 节点;
    const 背景色 = 鼠标悬停 ? "#2d3a4c" : this.颜色.节点背景;
    const 边框色 = 鼠标悬停 ? "#8a9cad" : this.颜色.节点边框;

    // 绘制节点背景
    this.ctx.fillStyle = 背景色;
    this.ctx.strokeStyle = 边框色;
    this.ctx.lineWidth = 2;

    // 绘制圆角矩形
    this.ctx.beginPath();
    this.ctx.roundRect(节点.x, 节点.y, 节点宽度, 节点高度, [this.节点配置.圆角]);
    this.ctx.fill();
    this.ctx.stroke();

    // 绘制指针状态圆点
    this.绘制指针状态圆点(节点, 节点宽度, 节点高度);

    // 绘制内存地址（移到上方）
    this.ctx.font = `14px ${this.字体}`;
    this.ctx.textAlign = "left";

    // 计算字段名称的最大宽度
    // const 字段名称列表 = ["姓名：", "年龄：", "next：", "previous："];
    this.ctx.font = `14px ${this.字体}`;
    // const 字段名称宽度 = Math.max(...字段名称列表.map((名称) => this.ctx.measureText(名称).width));
    const 中文冒号宽度 = this.ctx.measureText("：").width;
    // const 内存地址宽度 = this.ctx.measureText(" 0x12345678").width;

    // 计算文本起始位置，使用动态宽度确保文本居中
    // 重新计算字段名称宽度，只考虑实际使用的字段
    const 实际字段名称列表 =
      this.链表类型 === "双向链表" ? ["姓名：", "年龄：", "next：", "previous："] : ["姓名：", "年龄：", "next："];
    const 实际字段名称宽度 = Math.max(...实际字段名称列表.map((名称) => this.ctx.measureText(名称).width));

    // 计算所有字段值的最大宽度
    let 最大宽度 = 0;
    const 姓名宽度 = this.ctx.measureText(节点.姓名).width;
    const 年龄宽度 = this.ctx.measureText(节点.年龄.toString()).width;
    const 下一个节点地址临时 = 节点.next ? 节点.next.内存地址 : "NULL";
    const next宽度 = this.ctx.measureText(下一个节点地址临时).width;
    最大宽度 = Math.max(最大宽度, 姓名宽度, 年龄宽度, next宽度);

    if (this.链表类型 === "双向链表") {
      const 上一个节点地址临时 = 节点.previous ? 节点.previous.内存地址 : "NULL";
      const previous宽度 = this.ctx.measureText(上一个节点地址临时).width;
      最大宽度 = Math.max(最大宽度, previous宽度);
    }

    // 计算文本总宽度：字段名称宽度 + 最大字段值宽度
    const 文本总宽度 = 实际字段名称宽度 + 最大宽度;

    // 计算左边距，使文本在节点中居中
    const 左边距 = (节点宽度 - 文本总宽度) / 2;
    const 文本X = 节点.x + 左边距;
    const 内存地址垂直偏移 = -15;
    const 索引垂直偏移 = -35;

    // 绘制内存地址（在节点上方，使用和节点内部相同的对齐方式，向下移动2px）
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.textAlign = "right";
    this.ctx.fillText("内存地址", 文本X + 实际字段名称宽度 - 中文冒号宽度, 节点.y + 内存地址垂直偏移);
    this.ctx.fillStyle = "gray";
    this.ctx.fillText("：", 文本X + 实际字段名称宽度, 节点.y + 内存地址垂直偏移);
    this.ctx.textAlign = "left";

    // 绘制内存地址值，0x部分使用#999颜色
    const 内存地址文本 = 节点.内存地址;
    const 零x部分 = "0x";
    const 地址部分 = 内存地址文本.substring(2);

    // 先绘制0x部分（#999颜色）
    this.ctx.fillStyle = "#999";
    this.ctx.fillText(零x部分, 文本X + 实际字段名称宽度, 节点.y + 内存地址垂直偏移);

    // 再绘制地址部分（原来的颜色）
    this.ctx.fillStyle = this.颜色.内存地址值;
    const 零x宽度 = this.ctx.measureText(零x部分).width;
    this.ctx.fillText(地址部分, 文本X + 实际字段名称宽度 + 零x宽度 + 1, 节点.y + 内存地址垂直偏移);

    // 绘制索引（与内存地址保持8px间距）
    this.ctx.font = `14px ${this.字体}`;
    this.ctx.textAlign = "right";
    this.ctx.fillStyle = "lightskyblue";
    this.ctx.fillText("索引", 文本X + 实际字段名称宽度 - 中文冒号宽度, 节点.y + 索引垂直偏移);
    this.ctx.fillStyle = "gray";
    this.ctx.fillText("：", 文本X + 实际字段名称宽度, 节点.y + 索引垂直偏移);
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = "greenyellow"; // 使用greenyellow颜色
    this.ctx.fillText(索引.toString(), 文本X + 实际字段名称宽度 + 1, 节点.y + 索引垂直偏移);

    // 绘制节点内容
    this.ctx.font = `14px ${this.字体}`;
    this.ctx.textAlign = "left";

    // 计算文本起始位置
    let 当前Y = 节点.y + 25;

    // 第一行：姓名
    this.ctx.fillStyle = this.颜色.字段名称;
    this.ctx.textAlign = "right";
    this.ctx.fillText("姓名", 文本X + 实际字段名称宽度 - 中文冒号宽度, 当前Y);
    this.ctx.fillStyle = "gray";
    this.ctx.fillText("：", 文本X + 实际字段名称宽度, 当前Y);
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = this.颜色.姓名值;
    this.ctx.fillText(节点.姓名, 文本X + 实际字段名称宽度, 当前Y);
    当前Y += 节点行高;

    // 第二行：年龄
    this.ctx.fillStyle = this.颜色.字段名称;
    this.ctx.textAlign = "right";
    this.ctx.fillText("年龄", 文本X + 实际字段名称宽度 - 中文冒号宽度, 当前Y);
    this.ctx.fillStyle = "gray";
    this.ctx.fillText("：", 文本X + 实际字段名称宽度, 当前Y);
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = this.颜色.年龄值;
    this.ctx.fillText(节点.年龄.toString(), 文本X + 实际字段名称宽度, 当前Y);
    当前Y += 节点行高;

    // 第三行：next指针
    const 下一个节点地址 = 节点.next ? 节点.next.内存地址 : "NULL";
    this.ctx.fillStyle = "#60cc60";
    this.ctx.textAlign = "right";
    this.ctx.fillText("next", 文本X + 实际字段名称宽度 - 中文冒号宽度, 当前Y);
    this.ctx.fillStyle = "gray";
    this.ctx.fillText("：", 文本X + 实际字段名称宽度, 当前Y);
    this.ctx.textAlign = "left";

    // 绘制next值，0x部分使用#999颜色
    if (下一个节点地址 !== "NULL") {
      const 零x部分 = "0x";
      const 地址部分 = 下一个节点地址.substring(2);

      // 先绘制0x部分（#999颜色）
      this.ctx.fillStyle = "#999";
      this.ctx.fillText(零x部分, 文本X + 实际字段名称宽度, 当前Y);

      // 再绘制地址部分（原来的颜色）
      this.ctx.fillStyle = this.颜色.next值;
      const 零x宽度 = this.ctx.measureText(零x部分).width;
      this.ctx.fillText(地址部分, 文本X + 实际字段名称宽度 + 零x宽度 + 1, 当前Y);
    } else {
      this.ctx.fillStyle = this.颜色.next值;
      this.ctx.fillText(下一个节点地址, 文本X + 实际字段名称宽度, 当前Y);
    }

    // 如果是双向链表，添加previous字段
    if (this.链表类型 === "双向链表") {
      当前Y += 节点行高;
      const 上一个节点地址 = 节点.previous ? 节点.previous.内存地址 : "NULL";
      this.ctx.fillStyle = "#60cc60";
      this.ctx.textAlign = "right";
      this.ctx.fillText("previous", 文本X + 实际字段名称宽度 - 中文冒号宽度, 当前Y);
      this.ctx.fillStyle = "gray";
      this.ctx.fillText("：", 文本X + 实际字段名称宽度, 当前Y);
      this.ctx.textAlign = "left";

      // 绘制previous值，0x部分使用#999颜色
      if (上一个节点地址 !== "NULL") {
        const 零x部分 = "0x";
        const 地址部分 = 上一个节点地址.substring(2);

        // 先绘制0x部分（#999颜色）
        this.ctx.fillStyle = "#999";
        this.ctx.fillText(零x部分, 文本X + 实际字段名称宽度, 当前Y);

        // 再绘制地址部分（原来的颜色）
        this.ctx.fillStyle = this.颜色.previous值;
        const 零x宽度 = this.ctx.measureText(零x部分).width;
        this.ctx.fillText(地址部分, 文本X + 实际字段名称宽度 + 零x宽度 + 1, 当前Y);
      } else {
        this.ctx.fillStyle = this.颜色.previous值;
        this.ctx.fillText(上一个节点地址, 文本X + 实际字段名称宽度, 当前Y);
      }
    }

    // 绘制head标签
    if (索引 === 0) {
      this.ctx.fillStyle = this.颜色.head标签;
      this.ctx.font = `bold 16px ${this.字体}`;
      this.ctx.textAlign = "center";
      this.ctx.fillText("head", 节点.x + 节点宽度 / 2, 节点.y - 60);
    }

    // 如果鼠标悬停在节点上，绘制删除按钮
    if (this.悬停的节点 === 节点) {
      this.绘制删除按钮(节点);
    }
  }

  计算节点宽度(节点) {
    // 确保字体设置正确
    this.ctx.font = `14px ${this.字体}`;

    // 单向链表的宽度计算
    if (this.链表类型 === "单向链表") {
      const next地址 = 节点.next ? 节点.next.内存地址 : "NULL";
      return next地址 === "NULL" ? 120 : 160;
    }

    // 双向链表的宽度计算
    if (this.链表类型 === "双向链表") {
      const next地址 = 节点.next ? 节点.next.内存地址 : "NULL";
      const previous地址 = 节点.previous ? 节点.previous.内存地址 : "NULL";

      // 计算最长文本的宽度
      let 最长文本 = "";

      if (next地址 === "NULL" && previous地址 === "NULL") {
        // 情况：next和previous都为NULL
        最长文本 = "previous：NULL";
      } else if (next地址 !== "NULL" && previous地址 === "NULL") {
        // 情况：next不为NULL，previous为NULL（头节点）
        最长文本 = `next：${next地址}`;
      } else if (previous地址 !== "NULL") {
        // 情况：previous不为NULL（包括next为NULL和不为NULL的情况）
        最长文本 = `previous：${previous地址}`;
      }

      if (最长文本) {
        const 文本宽度 = this.ctx.measureText(最长文本).width;
        // 头节点（next不为NULL，previous为NULL）使用60px边距，其他使用30px边距
        const 边距 = next地址 !== "NULL" && previous地址 === "NULL" ? 60 : 30;
        return 文本宽度 + 边距;
      }
    }

    // 默认情况，返回原来的固定宽度
    return this.节点配置.宽度;
  }

  绘制删除按钮(节点) {
    const 按钮大小 = 25;
    const 节点宽度 = this.计算节点宽度(节点);
    const 按钮X = 节点.x + 节点宽度 - 按钮大小 / 2 - 3; // 顶在右上角，向内5px
    const 按钮Y = 节点.y + 按钮大小 / 2 + 3; // 顶在右上角，向下5px

    // 计算删除按钮的圆角
    const 右上角圆角 = this.节点配置.圆角 - 2; // 节点边框厚度为2px
    const 其他角圆角 = 5; // 其他三个角使用3px圆角

    // 绘制混合圆角的矩形背景
    this.ctx.fillStyle = this.悬停在删除按钮 ? this.颜色.删除按钮悬停 : this.颜色.删除按钮;
    this.ctx.beginPath();
    // 左上角 - 3px圆角
    this.ctx.moveTo(按钮X - 按钮大小 / 2 + 其他角圆角, 按钮Y - 按钮大小 / 2);
    this.ctx.lineTo(按钮X + 按钮大小 / 2 - 右上角圆角, 按钮Y - 按钮大小 / 2);
    // 右上角 - 保持原来的圆角
    this.ctx.quadraticCurveTo(
      按钮X + 按钮大小 / 2,
      按钮Y - 按钮大小 / 2,
      按钮X + 按钮大小 / 2,
      按钮Y - 按钮大小 / 2 + 右上角圆角
    );
    // 右边线
    this.ctx.lineTo(按钮X + 按钮大小 / 2, 按钮Y + 按钮大小 / 2 - 其他角圆角);
    // 右下角 - 3px圆角
    this.ctx.quadraticCurveTo(
      按钮X + 按钮大小 / 2,
      按钮Y + 按钮大小 / 2,
      按钮X + 按钮大小 / 2 - 其他角圆角,
      按钮Y + 按钮大小 / 2
    );
    // 下边线
    this.ctx.lineTo(按钮X - 按钮大小 / 2 + 其他角圆角, 按钮Y + 按钮大小 / 2);
    // 左下角 - 3px圆角
    this.ctx.quadraticCurveTo(
      按钮X - 按钮大小 / 2,
      按钮Y + 按钮大小 / 2,
      按钮X - 按钮大小 / 2,
      按钮Y + 按钮大小 / 2 - 其他角圆角
    );
    // 左边线
    this.ctx.lineTo(按钮X - 按钮大小 / 2, 按钮Y - 按钮大小 / 2 + 其他角圆角);
    // 左上角 - 3px圆角
    this.ctx.quadraticCurveTo(
      按钮X - 按钮大小 / 2,
      按钮Y - 按钮大小 / 2,
      按钮X - 按钮大小 / 2 + 其他角圆角,
      按钮Y - 按钮大小 / 2
    );
    this.ctx.closePath();
    this.ctx.fill();

    // 绘制X符号
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = `bold 14px ${this.字体}`;
    this.ctx.textAlign = "center";
    this.ctx.fillText("×", 按钮X, 按钮Y + 4);
  }

  绘制预览节点() {
    const x = this.鼠标位置.x;
    const y = this.鼠标位置.y;

    // 计算预览节点的高度
    const 节点行高 = 22;
    const 顶部边距 = 25;
    const 底部边距 = 15;
    const 字段数量 = this.链表类型 === "双向链表" ? 3 : 2; // 姓名、年龄、next、previous(双向链表)
    const 节点高度 = 顶部边距 + 字段数量 * 节点行高 + 底部边距;

    // 创建临时节点来计算宽度
    const 临时节点 = {
      姓名: "预览",
      年龄: 0,
      next: null,
      previous: null,
    };
    const 节点宽度 = this.计算节点宽度(临时节点);

    // 计算预览节点的位置（鼠标位置为中心点）
    const 预览节点X = x - 节点宽度 / 2;
    const 预览节点Y = y - 节点高度 / 2;
    const 不透明度 = 0.33;

    // 绘制预览节点背景（33%不透明度）
    this.ctx.fillStyle = `rgba(29, 39, 56, ${不透明度})`; // 节点背景色，33%不透明度
    this.ctx.strokeStyle = `rgba(74, 85, 104, ${不透明度})`; // 节点边框色，33%不透明度
    this.ctx.lineWidth = 2;

    // 绘制圆角矩形
    this.ctx.beginPath();
    this.ctx.roundRect(预览节点X, 预览节点Y, 节点宽度, 节点高度, [this.节点配置.圆角]);
    this.ctx.fill();
    this.ctx.stroke();

    // 绘制预览节点的文本内容（33%不透明度）
    this.ctx.font = `14px ${this.字体}`;
    this.ctx.textAlign = "left";

    // 计算字段名称的最大宽度
    const 字段名称列表 =
      this.链表类型 === "双向链表" ? ["姓名：", "年龄：", "next：", "previous："] : ["姓名：", "年龄：", "next："];
    const 字段名称宽度 = Math.max(...字段名称列表.map((名称) => this.ctx.measureText(名称).width));
    const 中文冒号宽度 = this.ctx.measureText("：").width;

    // 计算文本起始位置，使用动态宽度确保文本居中
    const 文本总宽度 = 字段名称宽度 + this.ctx.measureText("预览").width;
    const 左边距 = (节点宽度 - 文本总宽度) / 2;
    const 文本X = 预览节点X + 左边距;
    const 内存地址垂直偏移 = -15;
    const 索引垂直偏移 = -35;

    // 绘制内存地址（在节点上方）
    this.ctx.fillStyle = `rgba(135, 206, 250, ${不透明度})`; // lightskyblue，33%不透明度
    this.ctx.textAlign = "right";
    this.ctx.fillText("内存地址", 文本X + 字段名称宽度 - 中文冒号宽度, 预览节点Y + 内存地址垂直偏移);
    this.ctx.fillStyle = `rgba(128, 128, 128, ${不透明度})`; // 冒号，33%不透明度
    this.ctx.fillText("：", 文本X + 字段名称宽度, 预览节点Y + 内存地址垂直偏移);
    this.ctx.textAlign = "left";

    // 绘制内存地址值，0x部分使用#999颜色
    const 预览内存地址 = "0x12345678";
    const 零x部分 = "0x";
    const 地址部分 = 预览内存地址.substring(2);

    // 先绘制0x部分（#999颜色）
    this.ctx.fillStyle = `rgba(153, 153, 153, ${不透明度})`; // #999，33%不透明度
    this.ctx.fillText(零x部分, 文本X + 字段名称宽度, 预览节点Y + 内存地址垂直偏移);

    // 再绘制地址部分（原来的颜色）
    this.ctx.fillStyle = `rgba(255, 215, 0, ${不透明度})`; // 内存地址值颜色，33%不透明度
    const 零x宽度 = this.ctx.measureText(零x部分).width;
    this.ctx.fillText(地址部分, 文本X + 字段名称宽度 + 零x宽度 + 1, 预览节点Y + 内存地址垂直偏移);

    // 绘制索引（与内存地址保持8px间距）
    this.ctx.font = `14px ${this.字体}`;
    this.ctx.textAlign = "right";
    this.ctx.fillStyle = `rgba(135, 206, 250, ${不透明度})`; // lightskyblue，33%不透明度
    this.ctx.fillText("索引", 文本X + 字段名称宽度 - 中文冒号宽度, 预览节点Y + 索引垂直偏移);
    this.ctx.fillStyle = `rgba(128, 128, 128, ${不透明度})`; // 冒号，33%不透明度
    this.ctx.fillText("：", 文本X + 字段名称宽度, 预览节点Y + 索引垂直偏移);
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = `rgba(173, 255, 47, ${不透明度})`; // greenyellow，33%不透明度
    this.ctx.fillText(this.节点数组.length.toString(), 文本X + 字段名称宽度 + 1, 预览节点Y + 索引垂直偏移);

    // 绘制预览节点的内容
    let 当前Y = 预览节点Y + 25;

    // 第一行：姓名
    this.ctx.fillStyle = `rgba(160, 174, 192, ${不透明度})`; // 字段名称，33%不透明度
    this.ctx.textAlign = "right";
    this.ctx.fillText("姓名", 文本X + 字段名称宽度 - 中文冒号宽度, 当前Y);
    this.ctx.fillStyle = `rgba(128, 128, 128, ${不透明度})`; // 冒号，33%不透明度
    this.ctx.fillText("：", 文本X + 字段名称宽度, 当前Y);
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = `rgba(255, 255, 255, ${不透明度})`; // 姓名值，33%不透明度
    this.ctx.fillText("预览", 文本X + 字段名称宽度, 当前Y);
    当前Y += 节点行高;

    // 第二行：年龄
    this.ctx.fillStyle = `rgba(160, 174, 192, ${不透明度})`; // 字段名称，33%不透明度
    this.ctx.textAlign = "right";
    this.ctx.fillText("年龄", 文本X + 字段名称宽度 - 中文冒号宽度, 当前Y);
    this.ctx.fillStyle = `rgba(128, 128, 128, ${不透明度})`; // 冒号，33%不透明度
    this.ctx.fillText("：", 文本X + 字段名称宽度, 当前Y);
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = `rgba(255, 255, 255, ${不透明度})`; // 年龄值，33%不透明度
    this.ctx.fillText("0", 文本X + 字段名称宽度, 当前Y);
    当前Y += 节点行高;

    // 第三行：next指针
    this.ctx.fillStyle = `rgba(96, 204, 96, ${不透明度})`; // next字段名，33%不透明度
    this.ctx.textAlign = "right";
    this.ctx.fillText("next", 文本X + 字段名称宽度 - 中文冒号宽度, 当前Y);
    this.ctx.fillStyle = `rgba(128, 128, 128, ${不透明度})`; // 冒号，33%不透明度
    this.ctx.fillText("：", 文本X + 字段名称宽度, 当前Y);
    this.ctx.textAlign = "left";
    this.ctx.fillStyle = `rgba(255, 107, 107, ${不透明度})`; // next值，33%不透明度
    this.ctx.fillText("NULL", 文本X + 字段名称宽度, 当前Y);

    // 如果是双向链表，添加previous字段
    if (this.链表类型 === "双向链表") {
      当前Y += 节点行高;
      this.ctx.fillStyle = `rgba(96, 204, 96, ${不透明度})`; // previous字段名，33%不透明度
      this.ctx.textAlign = "right";
      this.ctx.fillText("previous", 文本X + 字段名称宽度 - 中文冒号宽度, 当前Y);
      this.ctx.fillStyle = `rgba(128, 128, 128, ${不透明度})`; // 冒号，33%不透明度
      this.ctx.fillText("：", 文本X + 字段名称宽度, 当前Y);
      this.ctx.textAlign = "left";
      this.ctx.fillStyle = `rgba(154, 205, 50, ${不透明度})`; // previous值，33%不透明度
      this.ctx.fillText("NULL", 文本X + 字段名称宽度, 当前Y);
    }
  }

  绘制指针状态圆点(节点, 节点宽度, 节点高度) {
    this.ctx.save();
    const 圆点半径 = 6;
    const 填充颜色 = "#0a50a2"; // 使用蓝色圆点
    const 描边颜色 = "silver";
    this.ctx.fillStyle = 填充颜色;
    this.ctx.strokeStyle = 描边颜色;
    this.ctx.lineWidth = 2;

    // 绘制next指针状态圆点（右侧）
    if (节点.next) {
      this.ctx.beginPath();
      this.ctx.arc(节点.x + 节点宽度, 节点.y + 节点高度 / 2, 圆点半径, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    }

    // 绘制previous指针状态圆点（左侧）
    if (节点.previous) {
      this.ctx.beginPath();
      this.ctx.arc(节点.x, 节点.y + 节点高度 / 2, 圆点半径, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    }

    // 检查节点是否被其他节点指向（用于单向链表）
    if (this.链表类型 === "单向链表") {
      // 检查是否有其他节点的next指向当前节点
      const 被指向 = this.节点数组.some((其他节点) => 其他节点.next === 节点);
      if (被指向) {
        this.ctx.beginPath();
        this.ctx.arc(节点.x, 节点.y + 节点高度 / 2, 圆点半径, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  new 链表可视化();
});
