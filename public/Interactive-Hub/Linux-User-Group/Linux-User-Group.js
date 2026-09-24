function 创建补间(起始值, 结束值, 持续时间 = 250) {
  return {
    起始值,
    结束值,
    起始时间: performance.now(),
    持续时间,
    当前值: 起始值,
    已完成: 起始值 === 结束值,
    更新(当前时间) {
      if (this.已完成) return this.当前值;
      const 进度 = Math.min((当前时间 - this.起始时间) / this.持续时间, 1);
      this.当前值 = this.起始值 + (this.结束值 - this.起始值) * 进度;
      if (进度 >= 1) this.已完成 = true;
      return this.当前值;
    },
    跳转至结束() {
      this.当前值 = this.结束值;
      this.已完成 = true;
    },
  };
}

function 颜色混合(颜色1, 颜色2, 比例) {
  const rgb1 = 解析颜色(颜色1);
  const rgb2 = 解析颜色(颜色2);
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * 比例);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * 比例);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * 比例);
  const a = rgb1.a + (rgb2.a - rgb1.a) * 比例;
  return `rgba(${r},${g},${b},${a})`;
}

function 解析颜色(颜色) {
  if (颜色.startsWith("#")) {
    let hex = 颜色.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const num = parseInt(hex, 16);
    if (hex.length === 8) {
      return {
        r: (num >>> 24) & 255,
        g: (num >>> 16) & 255,
        b: (num >>> 8) & 255,
        a: (num & 255) / 255,
      };
    }
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255, a: 1 };
  }
  const match = 颜色.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    };
  }
  return { r: 255, g: 255, b: 255, a: 1 };
}

function 圆角矩形路径(上下文, x, y, 宽, 高, 半径) {
  const r = Math.min(半径, 宽 / 2, 高 / 2);
  上下文.beginPath();
  上下文.moveTo(x + r, y);
  上下文.lineTo(x + 宽 - r, y);
  上下文.quadraticCurveTo(x + 宽, y, x + 宽, y + r);
  上下文.lineTo(x + 宽, y + 高 - r);
  上下文.quadraticCurveTo(x + 宽, y + 高, x + 宽 - r, y + 高);
  上下文.lineTo(x + r, y + 高);
  上下文.quadraticCurveTo(x, y + 高, x, y + 高 - r);
  上下文.lineTo(x, y + r);
  上下文.quadraticCurveTo(x, y, x + r, y);
  上下文.closePath();
}

function 截断文本(上下文, 文本, 最大宽度) {
  if (上下文.measureText(文本).width <= 最大宽度) return 文本;
  let 结果 = 文本;
  while (结果.length > 1 && 上下文.measureText(结果 + "…").width > 最大宽度) {
    结果 = 结果.slice(0, -1);
  }
  return 结果 + "…";
}

// ==================== 权限工具函数 ====================
// 将某个类的权限位（0-7）转为 "rwx" / "r-x" 形式
function 位转字符串(位) {
  return (位 & 4 ? "r" : "-") + (位 & 2 ? "w" : "-") + (位 & 1 ? "x" : "-");
}

// 将八进制数字（0-511）转为 {u,g,o} 权限对象
function 数字转权限(数字) {
  return { u: (数字 >> 6) & 7, g: (数字 >> 3) & 7, o: 数字 & 7 };
}

// ==================== 统一配置对象 ====================
const 配置 = {
  动画时长: 250,
  边距: { 上: 110, 下: 25, 左: 25, 右: 25 },
  布局: {
    子节点水平间距: 100,
    子节点垂直间距: 40,
  },
  目录: {
    圆角: 8,
    填充色: "#1c1c1cff",
    当前填充色: "#3e310cff",
    描边色: "#b06100ff",
    当前描边色: "#FF8C00",
    描边宽度: 2,
    当前描边宽度: 3,
    当前放大倍数: 1.2,
    名称颜色: "#fff",
    名称字体: "12px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
    名称偏移: -8,
    文本边距: 15,
    权限字体: "14px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
    权限行间隔: 10,
    权限内边距: 15,
    权限垂直内边距: 15,
  },
  根目录: {
    圆角: 10,
    填充色: "#1c1c1c",
    当前填充色: "#1e3e29ff",
    描边色: "#4a9e6aff",
    当前描边色: "#6ee7a0",
    描边宽度: 2,
    当前描边宽度: 4,
    当前放大倍数: 1.3,
    名称颜色: "#6ee7a0",
    名称字体: "bold 15px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
    名称偏移: -10,
    文本边距: 18,
    权限字体: "14px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
    权限行间隔: 10,
    权限内边距: 15,
    权限垂直内边距: 15,
  },
  文件: {
    圆角: 5,
    填充色: "#173352ff",
    描边色: "#75a7e1ff",
    描边宽度: 2,
    名称颜色: "#fff",
    名称字体: "13px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
    名称偏移: -8,
    文本边距: 15,
    权限字体: "14px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
    权限行间隔: 10,
    权限内边距: 15,
    权限垂直内边距: 15,
  },
  连接线: {
    颜色: "#555",
    宽度: 1.75,
  },
  画布: {
    背景色: "#111111",
    字体: "'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
  },
  高亮: {
    波纹颜色: "rgba(0, 200, 255, 0.6)",
    波纹最大半径: 55,
    波纹持续时间: 600,
    波纹线宽: 2,
  },
  // 数字模式下三位八进制数字之间的间隔（像素）
  数字间隔: 4,
  // 数字模式下实际生效权限数字的高亮：颜色与放大倍数
  生效数字高亮: {
    颜色: "#f26586ff",
    放大倍数: 1.2,
  },
  // 读、写、执行三个权限位字符之间的间隔（像素）
  权限间隔: 2,
  // 节点内组行与 u 行之间的垂直间距（像素）
  组行与u行间距: 10,
  // 节点内部权限文本的配色方案
  权限配色: {
    类: "gold", // u / g / o
    所有者: "rgba(90, 186, 249, 1)", // 节点内所有者名称
    所属组: "rgba(122, 199, 122, 1)", // 节点内所属组名称
    标点: "gray", // 冒号与逗号
    r: "#22c55e",
    w: "rgba(250, 122, 163, 1)",
    x: "lightskyblue",
    "-": "silver", // 无权限占位符
    数字: "#ddd",
  },
  // 权限字母悬停时点击范围的半透明背景色
  权限悬停背景色: "rgba(255, 255, 255, 0.25)",
  // 实际生效权限行（ugo 三行中当前用户命中的那一行）背后的横向横幅（横向铺满节点左右边界，带上下描边）
  生效行横幅: {
    颜色: "#111",
    描边色: "#888",
    描边宽度: 1,
    垂直内边距: 5,
  },
  // 目录非空标记：节点左边缘内侧的竖条
  非空标记: {
    颜色: "rgba(232, 163, 61, 0.85)",
    根目录颜色: "rgba(156, 250, 195, 1)", // 根目录非空时竖条偏绿色
    宽: 3.5,
    高: 26,
    边距: 3,
    圆角: 1.75,
  },
  错误: {
    背景色: "rgba(180, 30, 30, 0.92)",
    文字颜色: "#fff",
    字体: "14px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
    圆角: 8,
    内边距: 12,
    最大宽度: 420,
    停留时间: 2200,
    消失时间: 300,
  },
  警告: {
    背景色: "rgba(181, 136, 21, 1)",
    文字颜色: "#fff",
    字体: "14px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
    圆角: 8,
    内边距: 12,
    最大宽度: 420,
    停留时间: 2200,
    消失时间: 300,
  },
  成功: {
    背景色: "rgba(30, 130, 60, 0.94)",
    文字颜色: "#fff",
    字体: "14px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
    圆角: 8,
    内边距: 12,
    最大宽度: 420,
    停留时间: 2200,
    消失时间: 300,
  },
  交互: {
    拖拽阈值: 5,
    点击时间阈值: 300,
  },
  主目录图标: {
    尺寸: 32,
    边距: 4,
  },
  删除按钮: {
    半径: 9,
    背景色: "#c0392b",
    悬停背景色: "#e74c3c",
    叉颜色: "#ffffff",
    线宽: 1.6,
    叉比例: 0.42, // 叉叉半长占半径比例
  },
};

// ==================== 节点 ID 计数器 ====================
let 下一节点ID = 1;
let 全局层级计数器 = 1; // 用于控制节点层叠顺序，越大越在上层

function 创建节点(类型, 名称, 父节点) {
  return {
    id: 下一节点ID++,
    类型, // "目录" | "文件"
    名称,
    父节点,
    子节点组: [],
    x: 0,
    y: 0,
    宽: 0,
    高: 0,
    层级: 全局层级计数器++, // 新节点层级最高
    // 权限：目录默认 755，文件默认 644
    权限: 类型 === "目录" ? { u: 7, g: 5, o: 5 } : { u: 6, g: 4, o: 4 },
    // 所有者与所属组：初始为空，初始化时随机分配
    所有者: "",
    所属组: "",
    动画: null,
    尺寸动画: null,
    删除动画: null,
    当前位置动画: null,
    当前位置过渡: 0,
    是当前位置: false,
    是主目录: false, // home 目录下的主目录（~）
    被拖拽: false,
    固定位置: false,
    拖拽偏移X: 0,
    拖拽偏移Y: 0,
  };
}

// ==================== 全局状态 ====================
const 画布 = document.getElementById("canvas");
const 上下文 = 画布.getContext("2d");
const 命令输入框 = document.getElementById("命令输入框");
const 命令执行按钮 = document.getElementById("命令执行按钮");
const 命令提示符 = document.getElementById("命令提示符");
const 重置按钮 = document.querySelector(".重置按钮");
const 历史记录按钮 = document.getElementById("历史记录按钮");
const 历史记录模态 = document.getElementById("历史记录模态");
const 历史记录关闭按钮 = document.getElementById("历史记录关闭按钮");
const 历史记录导出按钮 = document.getElementById("历史记录导出按钮");
const 历史记录表格体 = document.getElementById("历史记录表格体");
const 突出生效权限复选框 = document.getElementById("其它选项-突出生效权限");

// 权限显示模式："字母"（u/g/o 三行字母）或 "数字"（三位八进制横排），二选一
function 获取权限显示模式() {
  const 选中 = document.querySelector('input[name="权限模式"]:checked');
  return 选中 ? 选中.value : "字母";
}

// 是否突出生效权限：开启时字母模式绘制"生效行横幅"、数字模式高亮生效数字；状态保存到 localStorage
let 突出生效权限 = localStorage.getItem("突出生效权限") !== "否";

let 根节点 = null;
let 当前位置节点 = null;
let 节点表 = new Map();
let 错误提示组 = [];
let 波纹组 = [];
let cd动画组 = []; // cd 切换时的圆形滑动动画
let 命令历史 = [];
let 历史索引 = -1;
let 临时输入 = "";
let 命令记录组 = []; // 保存用户输入的命令记录（含对错标记）
let 撤销栈 = []; // 撤销快照栈，每条有效命令执行前压入
let 画布宽 = 0;
let 画布高 = 0;
let 动画帧ID = null;
let 拖拽节点 = null;
let 拖拽起始X = 0;
let 拖拽起始Y = 0;
let 拖拽当前X = 0;
let 拖拽当前Y = 0;
let 鼠标按下时间 = 0;
let 鼠标按下节点 = null;
let 拖拽跟随偏移组 = [];
let 悬停节点 = null;
let 悬停删除节点 = null;
let 拖拽时按住Ctrl = false;
// 在删除按钮上按下后尚未确认：移动进入拖拽则取消，松开且未拖拽才执行删除
let 按下删除节点 = null;
let 删除按钮按下X = 0;
let 删除按钮按下Y = 0;
// 在权限字母上按下后尚未确认：移动进入拖拽则取消，松开且未拖拽才切换权限位
let 按下权限 = null; // { 节点, 类名, 位 }
// 鼠标悬停的权限字母：在点击范围绘制半透明矩形
let 悬停权限字母 = null; // { 节点, 类名, 位 }

// 视图平移状态
let 视图偏移X = 0;
let 视图偏移Y = 0;
let 正在拖拽视图 = false;
let 视图拖拽起始X = 0;
let 视图拖拽起始Y = 0;
let 视图拖拽初始偏移X = 0;
let 视图拖拽初始偏移Y = 0;
let 中键按下位置X = 0;
let 中键按下位置Y = 0;
let 中键已移动 = false;

// ==================== 主目录（~）管理 ====================
const 主目录图标 = new Image();
主目录图标.src = "/Interactive-Hub/Linux-Permissions/Images/主目录.svg";
主目录图标.onload = () => 请求重绘();

// 节点内所有者/所属组图标
const 节点用户图标 = new Image();
节点用户图标.src = "/Interactive-Hub/Linux-User-Group/Images/用户.webp";
节点用户图标.onload = () => 请求重绘();
const 节点组图标 = new Image();
节点组图标.src = "/Interactive-Hub/Linux-User-Group/Images/组.png";
节点组图标.onload = () => 请求重绘();

// 查找根目录下名为 "home" 的子目录
function 查找home目录() {
  if (!根节点) return null;
  return 根节点.子节点组.find((n) => n.名称 === "home" && n.类型 === "目录") || null;
}

// 查找当前被标记为主目录的节点
function 查找主目录() {
  if (!根节点) return null;
  const 所有节点 = 收集所有节点(根节点);
  return 所有节点.find((n) => n.是主目录) || null;
}

// 更新主目录标记：清除旧标记，并优先把当前用户的主目录标记为主目录（~ 指向它）
// 当前用户没有主目录时，回退为 home 目录下第一个目录子节点
function 更新主目录() {
  const home目录 = 查找home目录();
  const 所有节点 = 根节点 ? 收集所有节点(根节点) : [];
  // 清除全部旧标记
  for (const 节点 of 所有节点) 节点.是主目录 = false;

  if (!home目录) return;

  // 优先当前用户的主目录（/home/当前用户）
  const 期望名称 = 面板当前用户;
  const 用户主目录 = home目录.子节点组.find((n) => n.类型 === "目录" && n.名称 === 期望名称);
  if (用户主目录) {
    用户主目录.是主目录 = true;
    return;
  }
  // 回退：home 目录下第一个目录子节点
  const 第一个目录 = home目录.子节点组.find((n) => n.类型 === "目录");
  if (第一个目录) 第一个目录.是主目录 = true;
}

// ==================== 目录名称池（中英文混合，不以"."开头） ====================
const 目录名称池 = [
  // 中文
  "文档",
  "图片",
  "音乐",
  "视频",
  "下载",
  "桌面",
  "项目",
  "代码",
  "资料",
  "备份",
  "配置",
  "脚本",
  "日志",
  "模板",
  "测试",
  "工具",
  "相册",
  "收藏",
  "文档库",
  "源代码",
  "资源",
  "插件",
  "主题",
  "字体",
  "文档集",
  "归档",
  "快照",
  "工作区",
  "临时",
  "缓存",
  "输出",
  "输入",
  "共享",
  "公共",
  "私有",
  "系统",
  "用户",
  "组",
  "权限",
  "安全",
  "网络",
  "数据库",
  "缓存区",
  "交换区",
  "挂载",
  "设备",
  "驱动",
  "内核",
  "模块",
  "服务",
  "进程",
  "线程",
  "信号",
  "管道",
  "套接字",
  "消息",
  "队列",
  "栈",
  "堆",
  "树",
  "图",
  "哈希",
  "链表",
  "数组",
  // 英文
  "documents",
  "pictures",
  "music",
  "videos",
  "downloads",
  "desktop",
  "projects",
  "code",
  "data",
  "backup",
  "config",
  "scripts",
  "logs",
  "templates",
  "tests",
  "tools",
  "album",
  "favorites",
  "library",
  "source",
  "resources",
  "plugins",
  "themes",
  "fonts",
  "archive",
  "workspace",
  "temp",
  "cache",
  "output",
  "input",
  "shared",
  "public",
  "private",
  "system",
  "users",
  "groups",
  "permissions",
  "security",
  "network",
  "database",
  "swap",
  "mount",
  "devices",
  "drivers",
  "kernel",
  "modules",
  "services",
  "processes",
  "threads",
  "signals",
  "pipes",
  "sockets",
  "messages",
  "queue",
  "stack",
  "heap",
  "tree",
  "graph",
  "hash",
  "list",
  "array",
  "dict",
  "set",
  "tuple",
];

const 文件名称池 = [
  // 中文
  "报告.txt",
  "笔记.md",
  "数据.csv",
  "配置.conf",
  "脚本.sh",
  "说明.txt",
  "代码.py",
  "样式.css",
  "页面.html",
  "清单.txt",
  "备忘录.md",
  "记录.log",
  "索引.json",
  "说明文档.txt",
  "主程序.c",
  "摘要.txt",
  "概览.md",
  "统计.csv",
  "设置.ini",
  "运行.sh",
  "教程.txt",
  "指南.md",
  "表格.xls",
  "演示.ppt",
  "草稿.doc",
  // 英文
  "readme.txt",
  "makefile",
  "dockerfile",
  "env.example",
  "package.json",
  "tsconfig.json",
  "webpack.config.js",
  "readme.md",
  "license",
  "changelog.md",
  "todo.md",
  "contributing.md",
  "babel.config.js",
  "eslintrc.json",
  "prettierrc.json",
  "setup.py",
  "requirements.txt",
  "pipfile",
  "cargo.toml",
  "go.mod",
  "pom.xml",
  "build.gradle",
  "cmakelists.txt",
  "configure.ac",
  "makefile.am",
  "index.js",
  "app.js",
  "main.py",
  "server.go",
  "lib.rs",
  "utils.js",
  "helpers.py",
  "constants.ts",
  "types.ts",
  "api.dart",
  "readme.rst",
  "index.rst",
  "conf.py",
  "database.sql",
  "schema.prisma",
  "nginx.conf",
  "apache.conf",
  "ssh_config",
  "bashrc.example",
  "zshrc.example",
  "vimrc.example",
  "tmux.conf",
  "gitconfig.example",
  "npmrc.example",
  "yarn.lock",
];

// 随机初始化时使用的贴近真实的权限池（默认权限 755/644 权重最高）
const 目录权限池 = ["755", "755", "755", "700", "750", "775", "711", "770"];
const 文件权限池 = ["644", "644", "644", "600", "640", "664", "755", "444"];

function 随机权限(类型) {
  const 池 = 类型 === "目录" ? 目录权限池 : 文件权限池;
  return 数字转权限(parseInt(池[Math.floor(Math.random() * 池.length)], 8));
}

// 为整棵节点树随机分配所有者与所属组（从面板用户组数据中选取）
function 分配所有者和组(节点) {
  if (面板用户组.length === 0) return;
  const 用户名组 = 面板用户组.map((u) => u.名称);
  const 组名组 = 面板组组.map((g) => g.名称);
  function 遍历(当前节点) {
    const 随机用户 = 用户名组[Math.floor(Math.random() * 用户名组.length)];
    const 随机组 = 组名组[Math.floor(Math.random() * 组名组.length)];
    当前节点.所有者 = 随机用户;
    当前节点.所属组 = 随机组;
    for (const 子 of 当前节点.子节点组) 遍历(子);
  }
  遍历(节点);
}

// ==================== 节点尺寸测量 ====================
// 权限区内容（不含内边距）的墨迹高度：字母模式为用户行+组行+3行权限（共5行），数字模式为用户行+组行+单行数字
function 计算权限内容高(尺寸) {
  const 是字母模式 = 获取权限显示模式() === "字母";
  上下文.font = 尺寸.权限字体;
  const 字号 = parseFloat(尺寸.权限字体);
  const 度量 = 上下文.measureText(是字母模式 ? "u: rwx" : "000");
  const 上延 = 度量.actualBoundingBoxAscent ?? 字号 * 0.8;
  const 下延 = 度量.actualBoundingBoxDescent ?? 字号 * 0.2;
  const 单行高 = 上延 + 下延;
  // 行1(用户) + 行2(组) + 行间隔 + u/g/o 三行
  // 用户行与组行之间用标准行间隔，组行与u行之间用 组行与u行间距(10px)
  const 前两行高 = 2 * 单行高 + 尺寸.权限行间隔 + 配置.组行与u行间距;
  return 是字母模式 ? 前两行高 + 2 * 尺寸.权限行间隔 + 3 * 单行高 : 前两行高 + 单行高;
}

// 计算权限区所有行的最大宽度（用于节点宽度计算和整体居中）
function 计算权限区最大宽(尺寸, 节点) {
  const 是字母模式 = 获取权限显示模式() === "字母";
  上下文.font = 尺寸.权限字体;

  // 图标行宽度：图标 + 间距 + 文本
  const 主上延 = 上下文.measureText("u: rwx").actualBoundingBoxAscent ?? parseFloat(尺寸.权限字体) * 0.8;
  const 主下延 = 上下文.measureText("u: rwx").actualBoundingBoxDescent ?? parseFloat(尺寸.权限字体) * 0.2;
  const 图标尺寸 = 主上延 + 主下延 + 5;
  const 图标与名称间距 = 7;
  const 用户行宽 = 图标尺寸 + 图标与名称间距 + 上下文.measureText(节点.所有者 || "-").width;
  const 组行宽 = 图标尺寸 + 图标与名称间距 + 上下文.measureText(节点.所属组 || "-").width;
  let 最大宽 = Math.max(用户行宽, 组行宽);

  if (是字母模式) {
    // 权限行：u: rwx / g: rwx / o: rwx
    const 行段组 = [
      构建权限行段("u", 节点.权限.u),
      构建权限行段("g", 节点.权限.g),
      构建权限行段("o", 节点.权限.o),
    ];
    for (const 行段 of 行段组) {
      最大宽 = Math.max(最大宽, 计算行段宽度(行段));
    }
  } else {
    // 数字模式：三位八进制
    const 数字文本 = `${节点.权限.u}${节点.权限.g}${节点.权限.o}`;
    最大宽 = Math.max(最大宽, 上下文.measureText(数字文本).width);
  }

  return 最大宽;
}

function 测量节点尺寸(节点) {
  const 是根目录 = !节点.父节点;
  const 尺寸 = 是根目录 ? 配置.根目录 : 配置[节点.类型];
  上下文.font = 尺寸.名称字体;
  const 文本宽 = 上下文.measureText(节点.名称).width;
  // 宽度：名称所需宽度 与 权限区最大行宽 + 左右内边距 的较大值
  const 权限最大行宽 = 计算权限区最大宽(尺寸, 节点);
  const 新宽 = Math.ceil(Math.max(文本宽 + 尺寸.文本边距 * 2, 权限最大行宽 + 尺寸.权限内边距 * 2));
  // 高度：权限内容墨迹高度 + 上下内边距（各10px）
  const 新高 = Math.ceil(计算权限内容高(尺寸) + 尺寸.权限垂直内边距 * 2);

  // 与当前目标一致则无需变更（动画进行中比较目标值，避免反复重建动画）
  const 当前目标 = 节点.尺寸动画 ? 节点.尺寸动画.结束值 : { 宽: 节点.宽, 高: 节点.高 };
  if (当前目标.宽 === 新宽 && 当前目标.高 === 新高) return;
  if (节点.宽 <= 0 || 节点.高 <= 0) {
    // 新节点：直接落定，不做尺寸动画
    节点.宽 = 新宽;
    节点.高 = 新高;
    节点.尺寸动画 = null;
    return;
  }
  // 尺寸变化（如切换权限显示模式）：平滑过渡
  节点.尺寸动画 = {
    起始值: { 宽: 节点.宽, 高: 节点.高 },
    结束值: { 宽: 新宽, 高: 新高 },
    起始时间: performance.now(),
    持续时间: 配置.动画时长,
    已完成: false,
    更新(时间) {
      if (this.已完成) return this.结束值;
      const 进度 = Math.min((时间 - this.起始时间) / this.持续时间, 1);
      const 当前 = {
        宽: this.起始值.宽 + (this.结束值.宽 - this.起始值.宽) * 进度,
        高: this.起始值.高 + (this.结束值.高 - this.起始值.高) * 进度,
      };
      if (进度 >= 1) this.已完成 = true;
      return 当前;
    },
  };
}

function 测量所有节点(节点) {
  测量节点尺寸(节点);
  for (const 子节点 of 节点.子节点组) {
    测量所有节点(子节点);
  }
}

// ==================== 尺寸计算 ====================
function 计算子树尺寸(节点) {
  // 子树宽：自身宽度 + 水平间距 + 最深层子树宽度
  let 最大子树宽 = 0;
  for (const 子节点 of 节点.子节点组) {
    const 子尺寸 = 计算子树尺寸(子节点);
    最大子树宽 = Math.max(最大子树宽, 子尺寸.宽);
  }
  return { 宽: 节点.宽 + 配置.布局.子节点水平间距 + 最大子树宽, 高: 节点.高 };
}

// 下移子树：节点及其所有后代 y 偏移
function 下移子树(节点, 偏移Y) {
  节点.布局.y += 偏移Y;
  for (const 子 of 节点.子节点组) {
    下移子树(子, 偏移Y);
  }
}

// 按深度收集节点
function 按深度收集(节点, 深度, 结果) {
  if (!结果[深度]) 结果[深度] = [];
  结果[深度].push(节点);
  for (const 子 of 节点.子节点组) {
    按深度收集(子, 深度 + 1, 结果);
  }
}

// 消除同深度不同子树间的重叠：同层节点按 y 排序，
// 相邻重叠时下移后者及其后代，不影响前者
function 消除重叠(根) {
  const 按深度 = [];
  按深度收集(根, 0, 按深度);
  const 间距 = 配置.布局.子节点垂直间距;

  for (let d = 1; d < 按深度.length; d++) {
    const 层节点 = [...按深度[d]].sort((a, b) => a.布局.y - b.布局.y);
    for (let i = 1; i < 层节点.length; i++) {
      const 前 = 层节点[i - 1];
      const 后 = 层节点[i];
      const 前底 = 前.布局.y + 前.高 / 2;
      const 后顶 = 后.布局.y - 后.高 / 2;
      const 重叠 = 前底 + 间距 - 后顶;
      if (重叠 > 0) {
        下移子树(后, 重叠);
      }
    }
  }
}

// 按自身高度紧凑排列子节点，同级节点保持紧凑
function 计算布局(节点, 左边界, 中心Y) {
  节点.布局 = { x: 左边界, y: 中心Y };
  if (!节点.子节点组.length) return;

  const 子左边界 = 左边界 + 节点.宽 + 配置.布局.子节点水平间距;
  const 间距 = 配置.布局.子节点垂直间距;
  const 子节点 = 节点.子节点组;

  // 按自身高度紧凑排列
  const 自身总高 = 子节点.reduce((sum, 子) => sum + 子.高, 0) + (子节点.length - 1) * 间距;
  let 当前Y = 中心Y - 自身总高 / 2;
  for (const 子 of 子节点) {
    const 子中心Y = 当前Y + 子.高 / 2;
    计算布局(子, 子左边界, 子中心Y);
    当前Y += 子.高 + 间距;
  }
}

function 布局并动画() {
  if (!根节点) return;
  测量所有节点(根节点);
  // 尺寸动画中的节点：布局按目标尺寸计算，保证过渡结束后位置与最终尺寸匹配
  // （渲染循环每帧会用动画插值覆写 节点.宽/高，此处改动只影响布局计算）
  for (const 节点 of 收集所有节点(根节点)) {
    if (节点.尺寸动画) {
      节点.宽 = 节点.尺寸动画.结束值.宽;
      节点.高 = 节点.尺寸动画.结束值.高;
    }
  }

  const 可用高度 = 画布高 - 配置.边距.上 - 配置.边距.下;
  const 可用宽度 = 画布宽 - 配置.边距.左 - 配置.边距.右;
  const 画布中心Y = 配置.边距.上 + 可用高度 / 2;
  计算布局(根节点, 配置.边距.左, 画布中心Y);
  消除重叠(根节点);

  // Y 坐标取整，避免 1px 连线落在半像素位置被反走样
  const 所有节点 = 收集所有节点(根节点);
  for (const 节点 of 所有节点) {
    节点.布局.y = Math.round(节点.布局.y);
  }

  // 水平居中校正
  const 树尺寸 = 计算子树尺寸(根节点);
  const 偏移X = (可用宽度 - Math.min(树尺寸.宽, 可用宽度)) / 2;
  for (const 节点 of 所有节点) {
    节点.布局.x += 偏移X;
  }

  // 为每个节点启动/更新位置动画
  const 现在 = performance.now();
  for (const 节点 of 所有节点) {
    if (节点.删除动画) continue;
    if (节点.被拖拽) continue; // 拖拽中的节点不自动布局
    if (节点.固定位置) {
      // 固定位置的节点：不自动布局，位置由用户拖拽决定
      节点.动画 = null;
      continue;
    }
    if (!节点.动画) {
      // 新节点：从当前位置动画到布局位置
      节点.动画 = {
        起始值: { x: 节点.x, y: 节点.y },
        结束值: { x: 节点.布局.x, y: 节点.布局.y },
        起始时间: 现在,
        持续时间: 配置.动画时长,
        已完成: false,
        更新(时间) {
          if (this.已完成) return this.结束值;
          const 进度 = Math.min((时间 - this.起始时间) / this.持续时间, 1);
          const 当前 = {
            x: this.起始值.x + (this.结束值.x - this.起始值.x) * 进度,
            y: this.起始值.y + (this.结束值.y - this.起始值.y) * 进度,
          };
          if (进度 >= 1) this.已完成 = true;
          return 当前;
        },
      };
    } else {
      // 已有动画：更新目标
      节点.动画.结束值 = { x: 节点.布局.x, y: 节点.布局.y };
      节点.动画.已完成 = false;
      节点.动画.起始时间 = 现在;
      节点.动画.起始值 = { x: 节点.x, y: 节点.y };
    }
  }

  请求重绘();
}

function 收集所有节点(节点, 结果 = []) {
  if (!节点) return 结果;
  结果.push(节点);
  for (const 子节点 of 节点.子节点组) {
    收集所有节点(子节点, 结果);
  }
  return 结果;
}

// ==================== 绘制函数 ====================
function 获取节点实际尺寸(节点) {
  const 是根目录 = !节点.父节点;
  const 尺寸 = 是根目录 ? 配置.根目录 : 配置[节点.类型];
  const 当前比例 = 节点.删除动画 ? 1 - 节点.删除动画.当前值 : 1;
  let 实际宽 = 节点.宽 * 当前比例;
  let 实际高 = 节点.高 * 当前比例;
  let 填充色 = 尺寸.填充色;
  let 描边色 = 尺寸.描边色;
  let 描边宽度 = 尺寸.描边宽度;

  const 是当前位置 = 节点.是当前位置 && !节点.删除动画;
  // 只要当前位置过渡值不为0，就应用过渡效果（包括正在失去当前状态的节点）
  const 位置比例 = 节点.当前位置过渡;

  if (是当前位置 || 位置比例 > 0) {
    if (节点.类型 === "目录") {
      const 放大 = 尺寸.当前放大倍数;
      实际宽 = 节点.宽 * (1 + (放大 - 1) * 位置比例) * 当前比例;
      实际高 = 节点.高 * (1 + (放大 - 1) * 位置比例) * 当前比例;
      填充色 = 颜色混合(尺寸.填充色, 尺寸.当前填充色, 位置比例);
      描边色 = 颜色混合(尺寸.描边色, 尺寸.当前描边色, 位置比例);
      描边宽度 = 尺寸.描边宽度 + (尺寸.当前描边宽度 - 尺寸.描边宽度) * 位置比例;
    }
  }

  return { 实际宽, 实际高, 填充色, 描边色, 描边宽度, 当前比例, 尺寸 };
}

// 计算两个节点之间连接线的贝塞尔曲线参数
function 计算连接线参数(父节点, 子节点) {
  const 父尺寸 = 获取节点实际尺寸(父节点);
  const 子尺寸 = 获取节点实际尺寸(子节点);

  const 父中心X = 父节点.x;
  const 父中心Y = 父节点.y;
  const 子中心X = 子节点.x;
  const 子中心Y = 子节点.y;

  const 父半宽 = 父尺寸.实际宽 / 2;
  const 父半高 = 父尺寸.实际高 / 2;
  const 子半宽 = 子尺寸.实际宽 / 2;
  const 子半高 = 子尺寸.实际高 / 2;

  const 水平距离 = Math.abs(子中心X - 父中心X) - 父半宽 - 子半宽;
  const 垂直距离 = Math.abs(子中心Y - 父中心Y) - 父半高 - 子半高;

  if (水平距离 > 垂直距离) {
    const 父在左侧 = 父中心X < 子中心X;
    const 起点X = 父在左侧 ? 父中心X + 父半宽 + 父尺寸.描边宽度 / 2 : 父中心X - 父半宽 - 父尺寸.描边宽度 / 2;
    const 起点Y = 父中心Y;
    const 终点X = 父在左侧 ? 子中心X - 子半宽 - 子尺寸.描边宽度 / 2 : 子中心X + 子半宽 + 子尺寸.描边宽度 / 2;
    const 终点Y = 子中心Y;
    const 控制点1X = 起点X + (父在左侧 ? 水平距离 * 0.5 : -水平距离 * 0.5);
    const 控制点1Y = 起点Y;
    const 控制点2X = 终点X + (父在左侧 ? -水平距离 * 0.5 : 水平距离 * 0.5);
    const 控制点2Y = 终点Y;

    return { 起点X, 起点Y, 控制点1X, 控制点1Y, 控制点2X, 控制点2Y, 终点X, 终点Y };
  } else {
    const 父在上方 = 父中心Y < 子中心Y;
    const 起点X = 父中心X;
    const 起点Y = 父在上方 ? 父中心Y + 父半高 + 父尺寸.描边宽度 / 2 : 父中心Y - 父半高 - 父尺寸.描边宽度 / 2;
    const 终点X = 子中心X;
    const 终点Y = 父在上方 ? 子中心Y - 子半高 - 子尺寸.描边宽度 / 2 : 子中心Y + 子半高 + 子尺寸.描边宽度 / 2;
    const 控制点1X = 起点X;
    const 控制点1Y = 起点Y + (父在上方 ? 垂直距离 * 0.5 : -垂直距离 * 0.5);
    const 控制点2X = 终点X;
    const 控制点2Y = 终点Y + (父在上方 ? -垂直距离 * 0.5 : 垂直距离 * 0.5);

    return { 起点X, 起点Y, 控制点1X, 控制点1Y, 控制点2X, 控制点2Y, 终点X, 终点Y };
  }
}

function 绘制连接线(父节点, 子节点) {
  const 参数 = 计算连接线参数(父节点, 子节点);

  上下文.strokeStyle = 配置.连接线.颜色;
  上下文.lineWidth = 配置.连接线.宽度;
  上下文.beginPath();
  上下文.moveTo(参数.起点X, 参数.起点Y);
  上下文.bezierCurveTo(参数.控制点1X, 参数.控制点1Y, 参数.控制点2X, 参数.控制点2Y, 参数.终点X, 参数.终点Y);
  上下文.stroke();
}

// 用当前字体测量一行权限段的总渲染宽度（含段后间距）
function 计算行段宽度(行段) {
  let 宽 = 0;
  for (const 段 of 行段) {
    宽 += 上下文.measureText(段.文本).width + (段.后间距 || 0);
  }
  return 宽;
}

// 构建某个权限类的一行权限文本段（逐字符着色），形如 "u: rwx"
// 类名: "u" / "g" / "o"，位: 0-7
function 构建权限行段(类名, 位) {
  const 配色 = 配置.权限配色;
  const 行段 = [
    { 文本: 类名, 颜色: 配色.类 },
    { 文本: ":", 颜色: 配色.标点 },
    { 文本: " ", 颜色: 配色.标点 },
  ];
  const 字符串 = 位转字符串(位);
  for (let i = 0; i < 字符串.length; i++) {
    // 读、写、执行三个权限位彼此之间保留间隔（末位之后不加）
    行段.push({
      文本: 字符串[i],
      颜色: 配色[字符串[i]],
      后间距: i < 字符串.length - 1 ? 配置.权限间隔 : 0,
    });
  }
  return 行段;
}

// 计算节点权限区的布局几何（绘制与权限字母点击命中共用，保证两者坐标一致）
// 整个内容块（用户行+组行+权限行）在节点内整体水平、垂直居中
function 计算权限区几何(节点, 垂直补偿 = 0) {
  const 是根目录 = !节点.父节点;
  const 尺寸 = 是根目录 ? 配置.根目录 : 配置[节点.类型];
  const 主字号 = parseFloat(尺寸.权限字体);
  const 是字母模式 = 获取权限显示模式() === "字母";

  上下文.font = 尺寸.权限字体;
  const 度量主 = 上下文.measureText("u: rwx");
  const 主上延 = 度量主.actualBoundingBoxAscent ?? 主字号 * 0.8;
  const 主下延 = 度量主.actualBoundingBoxDescent ?? 主字号 * 0.2;
  const 行距 = 主下延 + 尺寸.权限行间隔 + 主上延;

  // 图标绘制尺寸与间距
  const 图标尺寸 = 主上延 + 主下延 + 5;
  const 图标与名称间距 = 7;

  // 计算所有行的最大宽度，用于整体水平居中
  const 权限最大行宽 = 计算权限区最大宽(尺寸, 节点);

  // 数字模式：用户行+组行+三位八进制数字
  if (!是字母模式) {
    const 文本 = `${节点.权限.u}${节点.权限.g}${节点.权限.o}`;
    const 度量 = 上下文.measureText(文本);
    const 上延 = 度量.actualBoundingBoxAscent ?? 主字号 * 0.8;
    const 下延 = 度量.actualBoundingBoxDescent ?? 主字号 * 0.2;
    // 总墨迹高度 = 用户行 + 组行 + 数字行
    const 数字墨迹高 = 上延 + 下延;
    const 总墨迹高 = 2 * (主上延 + 主下延) + 尺寸.权限行间隔 + 配置.组行与u行间距 + 数字墨迹高;
    // 整体垂直居中：内容块中心对齐节点中心
    const 内容顶Y = 节点.y - 总墨迹高 / 2;
    const 用户行基线Y = 内容顶Y + 主上延;
    const 组行基线Y = 用户行基线Y + 行距;
    const 数字行基线Y = 组行基线Y + 主下延 + 配置.组行与u行间距 + 上延;
    // 整体水平居中：所有行共享同一个左缘
    const 对齐左缘X = 节点.x - 权限最大行宽 / 2;
    return { 是字母模式, 显示字母: false, 尺寸, 文本, 基线Y: 数字行基线Y + 垂直补偿, 用户行基线Y: 用户行基线Y + 垂直补偿, 组行基线Y: 组行基线Y + 垂直补偿, 主上延, 主下延, 对齐左缘X, 图标尺寸, 图标与名称间距 };
  }

  // 字母模式：用户行+组行+u / g / o 三行主行（u: rwx）
  const 类组 = [
    ["u", 节点.权限.u],
    ["g", 节点.权限.g],
    ["o", 节点.权限.o],
  ];
  const 行段组 = 类组.map(([类名, 位]) => 构建权限行段(类名, 位));

  // 整体水平居中：所有行共享同一个左缘
  const 起始X = 节点.x - 权限最大行宽 / 2;

  // 主行字母区：位于 "类名: " 之后，r/w/x 各占一个等宽字符槽
  const 字母区起始X =
    起始X + 上下文.measureText("u").width + 上下文.measureText(":").width + 上下文.measureText(" ").width;
  const 字母槽宽 = 上下文.measureText("r").width + 配置.权限间隔;

  // 整块墨迹高度 = 用户行 + 组行 + ugo 三行 + 行间隔
  // 用户行与组行之间：权限行间隔；组行与u行之间：组行与u行间距
  const 墨迹高 = 5 * (主上延 + 主下延) + 3 * 尺寸.权限行间隔 + 配置.组行与u行间距;
  // 整体垂直居中：内容块中心对齐节点中心
  const 内容顶Y = 节点.y - 墨迹高 / 2;
  const 用户行基线Y = 内容顶Y + 主上延;
  const 组行基线Y = 用户行基线Y + 行距;
  // u行基线 = 组行基线 + 组行下延 + 组行与u行间距 + u行上延
  const 首行基线Y = 组行基线Y + 主下延 + 配置.组行与u行间距 + 主上延;

  return {
    是字母模式,
    显示字母: true,
    尺寸,
    行段组,
    类组,
    起始X,
    对齐左缘X: 起始X,
    图标尺寸,
    图标与名称间距,
    字母区起始X,
    字母槽宽,
    首行基线Y: 首行基线Y + 垂直补偿,
    行距,
    用户行基线Y: 用户行基线Y + 垂直补偿,
    组行基线Y: 组行基线Y + 垂直补偿,
    主上延,
    主下延,
  };
}

// 计算当前用户对某节点实际生效的权限类：所有者匹配为 "u"，否则所属组（主组或附加组）匹配为 "g"，其余为 "o"
function 获取生效权限类(节点) {
  if (!节点) return "o";
  const 用户 = 面板用户组.find((u) => u.名称 === 面板当前用户);
  if (!用户) return "o";
  if (节点.所有者 === 用户.名称) return "u";
  if (节点.所属组 && (用户.主组 === 节点.所属组 || 用户.附加组组.includes(节点.所属组))) return "g";
  return "o";
}

function 绘制节点(节点) {
  const { 实际宽, 实际高, 填充色, 描边色, 描边宽度, 当前比例, 尺寸 } = 获取节点实际尺寸(节点);
  if (当前比例 <= 0) return;

  const 实际X = 节点.x - 实际宽 / 2;
  const 实际Y = 节点.y - 实际高 / 2;
  const 实际圆角 = 尺寸.圆角 * 当前比例;

  // 悬停高亮：加粗描边
  const 是悬停 = 节点 === 悬停节点 && !节点.删除动画;
  const 最终描边宽度 = 是悬停 ? 描边宽度 + 1.5 : 描边宽度;

  // 权限几何按节点绘制时的垂直补偿提前计算：生效行横幅需在描边与非空竖条之前绘制，避免遮住二者
  const 权限几何 = 计算权限区几何(节点, 节点.父节点 ? 0 : 4);

  // 填充
  上下文.fillStyle = 填充色;
  圆角矩形路径(上下文, 实际X, 实际Y, 实际宽, 实际高, 实际圆角);
  上下文.fill();

  // 实际生效权限行背后的横向横幅：先于描边与非空竖条绘制，保证描边与竖条压在横幅上方
  // 仅在"突出生效权限"开启时绘制
  if (突出生效权限 && 权限几何 && 权限几何.是字母模式) {
    const 生效类序号 = { u: 0, g: 1, o: 2 }[获取生效权限类(节点)];
    const 横幅配置 = 配置.生效行横幅;
    上下文.fillStyle = 横幅配置.颜色;
    上下文.font = 尺寸.权限字体;
    const 横幅度量 = 上下文.measureText("u: rwx");
    const 横幅上延 = 横幅度量.actualBoundingBoxAscent ?? 0;
    const 横幅下延 = 横幅度量.actualBoundingBoxDescent ?? 0;
    const 生效行基线Y = 权限几何.首行基线Y + 生效类序号 * 权限几何.行距;
    // 横向铺满节点左右边界；非根节点横幅整体下移 2 像素
    const 横幅下移 = 节点.父节点 ? 3 : 0;
    const 横幅顶Y = 生效行基线Y - 横幅上延 - 横幅配置.垂直内边距 + 横幅下移;
    const 横幅高 = 横幅上延 + 横幅下延 + 横幅配置.垂直内边距 * 2;
    // 上下边线内缩半个线宽，避免盖住节点左右两侧描边；左右端各留 3 像素不画，避让圆角
    const 横幅边线半宽 = 横幅配置.描边宽度 / 2;
    const 横幅端点内缩 = 3;
    上下文.fillRect(实际X, 横幅顶Y, 实际宽, 横幅高);
    // 上下描边（save/restore 隔离绘制状态，避免影响后续节点描边）
    上下文.save();
    上下文.strokeStyle = 横幅配置.描边色;
    上下文.lineWidth = 横幅配置.描边宽度;
    上下文.beginPath();
    上下文.moveTo(实际X + 横幅端点内缩, 横幅顶Y + 横幅边线半宽);
    上下文.lineTo(实际X + 实际宽 - 横幅端点内缩, 横幅顶Y + 横幅边线半宽);
    上下文.moveTo(实际X + 横幅端点内缩, 横幅顶Y + 横幅高 - 横幅边线半宽);
    上下文.lineTo(实际X + 实际宽 - 横幅端点内缩, 横幅顶Y + 横幅高 - 横幅边线半宽);
    上下文.stroke();
    上下文.restore();
  }

  // 描边（重建圆角矩形路径后描边：横幅的 beginPath 已清空原路径）
  上下文.strokeStyle = 描边色;
  上下文.lineWidth = 最终描边宽度;
  圆角矩形路径(上下文, 实际X, 实际Y, 实际宽, 实际高, 实际圆角);
  上下文.stroke();

  // 目录非空标记：左边缘内侧的竖条（内部已被权限占用，不再用三个点表示）
  if (节点.类型 === "目录" && 节点.子节点组.length > 0 && !节点.删除动画) {
    const 标记 = 配置.非空标记;
    上下文.fillStyle = 节点 === 根节点 ? 标记.根目录颜色 : 标记.颜色;
    圆角矩形路径(上下文, 实际X + 标记.边距, 节点.y - 标记.高 / 2, 标记.宽, 标记.高, 标记.圆角);
    上下文.fill();
  }

  // 名称：目录与文件均绘制在节点上方（节点内部用于显示权限）
  上下文.fillStyle = 尺寸.名称颜色;
  上下文.font = 尺寸.名称字体;
  上下文.textAlign = "center";
  上下文.textBaseline = "bottom";
  const 显示名称 = 截断文本(上下文, 节点.名称, 实际宽 - 8);
  上下文.fillText(显示名称, 节点.x, 实际Y + 尺寸.名称偏移);

  // 主目录图标：在目录名称上方居中绘制
  if (节点.是主目录 && !节点.删除动画 && 主目录图标.complete) {
    const 图标尺寸 = 配置.主目录图标.尺寸;
    const 名称Y = 实际Y + 尺寸.名称偏移;
    const 图标X = 节点.x - 图标尺寸 / 2;
    const 图标Y = 名称Y - 图标尺寸 - 16;
    上下文.drawImage(主目录图标, 图标X, 图标Y, 图标尺寸, 图标尺寸);
  }

  // 权限区：字母模式为用户行+组行+ugo三行，数字模式为用户行+组行+三位八进制
  if (权限几何) {
    上下文.save();
    // 裁剪到节点矩形内，避免删除动画缩小时文本溢出
    圆角矩形路径(上下文, 实际X, 实际Y, 实际宽, 实际高, 实际圆角);
    上下文.clip();

    // 图标绘制尺寸与间距来自 权限几何（与权限行左对齐）
    const 图标尺寸 = 权限几何.图标尺寸;
    const 图标与名称间距 = 权限几何.图标与名称间距;
    // 名称上移微调（像素），仅影响文本不影响图标；基线已含根节点的垂直居中补偿
    const 名称上移 = 2;

    // 左对齐：图标行的左边缘与权限行的左边缘一致
    const 图标X = 权限几何.对齐左缘X;
    const 名称X = 图标X + 图标尺寸 + 图标与名称间距;

    // 图标垂直中点与文本垂直中点对齐（文本中点 = 基线 - 上延/2 + 下延/2）
    const 文本垂直偏移 = 权限几何.主上延 / 2 - 权限几何.主下延 / 2;

    // 第1行：用户行（图标 + 所有者用户名）
    if (节点用户图标.complete && 节点用户图标.naturalWidth) {
      const 图标Y = 权限几何.用户行基线Y - 权限几何.主上延 - 文本垂直偏移 + (节点.父节点 ? 4.5 : -2.5);
      上下文.drawImage(节点用户图标, 图标X, 图标Y, 图标尺寸, 图标尺寸);
    }
    上下文.fillStyle = 配置.权限配色.所有者;
    上下文.textAlign = "left";
    上下文.textBaseline = "alphabetic";
    上下文.fillText(节点.所有者 || "-", 名称X, 权限几何.用户行基线Y - 名称上移);

    // 第2行：组行（图标 + 所属组名）
    if (节点组图标.complete && 节点组图标.naturalWidth) {
      const 图标Y = 权限几何.组行基线Y - 权限几何.主上延 - 文本垂直偏移 + (节点.父节点 ? 4.5 : -2.5);
      上下文.drawImage(节点组图标, 图标X, 图标Y, 图标尺寸, 图标尺寸);
    }
    上下文.fillStyle = 配置.权限配色.所属组;
    上下文.fillText(节点.所属组 || "-", 名称X, 权限几何.组行基线Y - 名称上移);

    if (!权限几何.是字母模式) {
      // 数字模式：三位八进制数字横排（彼此间隔 配置.数字间隔），在节点内水平居中绘制
      // 实际生效的权限数字用不同颜色绘制并放大，放大围绕该行视觉中心，避免基线跳动
      上下文.font = 权限几何.尺寸.权限字体;
      const 数字组 = [节点.权限.u, 节点.权限.g, 节点.权限.o];
      const 生效类序号 = { u: 0, g: 1, o: 2 }[获取生效权限类(节点)];
      const 高亮配置 = 配置.生效数字高亮;
      const 数字总宽 =
        数字组.reduce((宽, 数字) => 宽 + 上下文.measureText(`${数字}`).width, 0) + 配置.数字间隔 * 2;
      let 数字X = 节点.x - 数字总宽 / 2;
      上下文.textAlign = "left";
      上下文.textBaseline = "alphabetic";
      for (let i = 0; i < 3; i++) {
        const 数字文本 = `${数字组[i]}`;
        const 数字宽 = 上下文.measureText(数字文本).width;
        if (突出生效权限 && i === 生效类序号) {
          // 生效数字：换色并围绕数字行视觉中心放大 1.2 倍（仅"突出生效权限"开启时）
          const 行视觉中心Y = 权限几何.基线Y - (权限几何.主上延 - 权限几何.主下延) / 2;
          上下文.save();
          上下文.translate(数字X + 数字宽 / 2, 行视觉中心Y);
          上下文.scale(高亮配置.放大倍数, 高亮配置.放大倍数);
          上下文.translate(-(数字X + 数字宽 / 2), -行视觉中心Y);
          上下文.fillStyle = 高亮配置.颜色;
          上下文.fillText(数字文本, 数字X, 权限几何.基线Y);
          上下文.restore();
        } else {
          上下文.fillStyle = 配置.权限配色.数字;
          上下文.fillText(数字文本, 数字X, 权限几何.基线Y);
        }
        数字X += 数字宽 + 配置.数字间隔;
      }
    } else {
      上下文.textAlign = "left";
      上下文.textBaseline = "alphabetic";
      const { 行段组, 起始X, 字母区起始X, 字母槽宽, 首行基线Y, 行距 } = 权限几何;
      let y = 首行基线Y;

      // 权限字母悬停高亮：在点击范围（字符背后）绘制半透明矩形（与命中矩形完全一致，空隙均分到字符两侧）
      if (悬停权限字母 && 悬停权限字母.节点 === 节点) {
        const 行序号 = { u: 0, g: 1, o: 2 }[悬停权限字母.类名];
        const 位序号 = { 4: 0, 2: 1, 1: 2 }[悬停权限字母.位];
        上下文.fillStyle = 配置.权限悬停背景色;
        上下文.font = 尺寸.权限字体;
        const 度量 = 上下文.measureText("u: rwx");
        const 悬停上延 = 度量.actualBoundingBoxAscent ?? 0;
        const 悬停下延 = 度量.actualBoundingBoxDescent ?? 0;
        const 主行基线 = 首行基线Y + 行序号 * 行距;
        上下文.fillRect(
          字母区起始X + 位序号 * 字母槽宽 - 配置.权限间隔 / 2,
          主行基线 - 悬停上延,
          字母槽宽,
          悬停上延 + 悬停下延,
        );
      }

      // 三行主行：u: rwx / g: rwx / o: rwx
      上下文.font = 尺寸.权限字体;
      for (let i = 0; i < 3; i++) {
        let x = 起始X;
        for (const 段 of 行段组[i]) {
          上下文.fillStyle = 段.颜色;
          上下文.fillText(段.文本, x, y);
          x += 上下文.measureText(段.文本).width + (段.后间距 || 0);
        }
        y += 行距;
      }
    }
    上下文.restore();
  }

  // 删除按钮：右上角红色正圆 + 白色叉叉
  const 按钮几何 = 获取删除按钮几何(节点, 实际宽, 实际高, 当前比例);
  if (按钮几何) {
    const 删除配置 = 配置.删除按钮;
    const 是按钮悬停 = 节点 === 悬停删除节点;
    上下文.save();
    上下文.beginPath();
    上下文.arc(按钮几何.x, 按钮几何.y, 按钮几何.半径, 0, Math.PI * 2);
    上下文.fillStyle = 是按钮悬停 ? 删除配置.悬停背景色 : 删除配置.背景色;
    上下文.fill();

    // 叉叉：两条交叉线段（Y 方向整体上移 1 像素，视觉居中）
    const 叉半长 = 按钮几何.半径 * 删除配置.叉比例;
    const 叉中心Y = 按钮几何.y - 0.5;
    上下文.strokeStyle = 删除配置.叉颜色;
    上下文.lineWidth = 删除配置.线宽 * 当前比例;
    上下文.lineCap = "round";
    上下文.beginPath();
    上下文.moveTo(按钮几何.x - 叉半长, 叉中心Y - 叉半长);
    上下文.lineTo(按钮几何.x + 叉半长, 叉中心Y + 叉半长);
    上下文.moveTo(按钮几何.x + 叉半长, 叉中心Y - 叉半长);
    上下文.lineTo(按钮几何.x - 叉半长, 叉中心Y + 叉半长);
    上下文.stroke();
    上下文.restore();
  }
}

function 绘制错误提示() {
  if (!错误提示组.length) return;
  const 提示 = 错误提示组[0];
  const 配置错误 = 提示.类型 === "警告" ? 配置.警告 : 提示.类型 === "成功" ? 配置.成功 : 配置.错误;

  const 行高 = 22;
  const 行组 = 提示.消息.split("\n");
  const 行数 = 行组.length;

  // 计算最宽一行的文本宽度，框宽 = 文本宽 + 左右各 20 + 内边距
  上下文.font = 配置错误.字体;
  let 最大文本宽 = 0;
  for (const 行 of 行组) {
    const 行宽 = 上下文.measureText(行).width;
    if (行宽 > 最大文本宽) 最大文本宽 = 行宽;
  }
  const 框宽 = Math.min(最大文本宽 + 40 + 配置错误.内边距 * 2, 配置错误.最大宽度);
  const 框高 = 行数 * 行高 + 配置错误.内边距 * 2;

  // 计算透明度
  let 透明度 = 1;
  const 现在 = performance.now();
  if (提示.阶段 === "消失") {
    透明度 = 1 - (现在 - 提示.消失开始时间) / 配置错误.消失时间;
  }

  const 中心X = 画布宽 / 2;
  const 中心Y = 画布高 / 2 - 20;

  上下文.save();
  上下文.globalAlpha = Math.max(0, Math.min(1, 透明度));

  // 阴影
  上下文.shadowColor = "rgba(0,0,0,0.5)";
  上下文.shadowBlur = 20;
  上下文.shadowOffsetY = 4;

  // 背景
  上下文.fillStyle = 配置错误.背景色;
  圆角矩形路径(上下文, 中心X - 框宽 / 2, 中心Y - 框高 / 2, 框宽, 框高, 配置错误.圆角);
  上下文.fill();

  上下文.restore();

  // 文字
  上下文.fillStyle = 配置错误.文字颜色;
  上下文.font = 配置错误.字体;
  上下文.textAlign = "center";
  上下文.textBaseline = "middle";
  const 起始Y = 中心Y - ((行数 - 1) * 行高) / 2;
  上下文.globalAlpha = Math.max(0, Math.min(1, 透明度));
  for (let i = 0; i < 行组.length; i++) {
    上下文.fillText(行组[i], 中心X, 起始Y + i * 行高);
  }
  上下文.globalAlpha = 1;
}

function 绘制波纹() {
  if (!波纹组.length) return;
  const 现在 = performance.now();
  for (const 波纹 of 波纹组) {
    const 进度 = (现在 - 波纹.起始时间) / 配置.高亮.波纹持续时间;
    if (进度 > 1) continue;
    const 半径 = 波纹.最大半径 * 进度;
    const 透明度 = (1 - 进度) * 0.8;
    上下文.strokeStyle = 配置.高亮.波纹颜色;
    上下文.lineWidth = 配置.高亮.波纹线宽;
    上下文.globalAlpha = 透明度;
    上下文.beginPath();
    上下文.arc(波纹.x, 波纹.y, 半径, 0, Math.PI * 2);
    上下文.stroke();
    上下文.globalAlpha = 1;
  }
}

// 计算三次贝塞尔曲线上的点
function 计算贝塞尔点(t, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const x = uuu * p0x + 3 * uu * t * p1x + 3 * u * tt * p2x + ttt * p3x;
  const y = uuu * p0y + 3 * uu * t * p1y + 3 * u * tt * p2y + ttt * p3y;

  return { x, y };
}

function 绘制cd动画() {
  if (!cd动画组.length) return;
  const 现在 = performance.now();

  for (const 动画 of cd动画组) {
    const 进度 = (现在 - 动画.起始时间) / 500; // 匀速，500ms
    if (进度 > 1) continue;

    // 根据进度找到当前所在的段
    const 当前距离 = 进度 * 动画.总长度;
    let 已遍历距离 = 0;
    let 当前段索引 = 0;
    let 段内进度 = 0;

    for (let i = 0; i < 动画.段长度组.length; i++) {
      if (当前距离 <= 已遍历距离 + 动画.段长度组[i] || i === 动画.段长度组.length - 1) {
        当前段索引 = i;
        段内进度 = 动画.段长度组[i] > 0 ? (当前距离 - 已遍历距离) / 动画.段长度组[i] : 0;
        段内进度 = Math.max(0, Math.min(1, 段内进度));
        break;
      }
      已遍历距离 += 动画.段长度组[i];
    }

    const 参数 = 动画.段参数组[当前段索引];
    if (!参数) continue;

    const 点 = 计算贝塞尔点(
      段内进度,
      参数.起点X,
      参数.起点Y,
      参数.控制点1X,
      参数.控制点1Y,
      参数.控制点2X,
      参数.控制点2Y,
      参数.终点X,
      参数.终点Y,
    );

    // 绘制圆形
    const 半径 = 8;
    const 透明度 = 进度 < 0.8 ? 1 : 1 - (进度 - 0.8) / 0.2; // 最后 20% 淡出

    上下文.globalAlpha = 透明度;
    上下文.fillStyle = "#555555ff";
    上下文.strokeStyle = "#ffffffff";
    上下文.lineWidth = 2;
    上下文.beginPath();
    上下文.arc(点.x, 点.y, 半径, 0, Math.PI * 2);
    上下文.fill();
    上下文.stroke();
    上下文.globalAlpha = 1;
  }
}

// ==================== 主渲染循环 ====================
function 渲染循环(当前时间) {
  动画帧ID = null;

  // 更新错误提示
  let 有重绘需求 = false;
  if (错误提示组.length) {
    const 提示 = 错误提示组[0];
    if (提示.阶段 === "显示" && 当前时间 - 提示.开始时间 > 配置.错误.停留时间) {
      提示.阶段 = "消失";
      提示.消失开始时间 = 当前时间;
    }
    if (提示.阶段 === "消失" && 当前时间 - 提示.消失开始时间 > 配置.错误.消失时间) {
      错误提示组.shift();
    }
    有重绘需求 = true;
  }

  // 清理已完成的波纹
  if (波纹组.length) {
    const 原长度 = 波纹组.length;
    波纹组 = 波纹组.filter((波纹) => 当前时间 - 波纹.起始时间 < 配置.高亮.波纹持续时间);
    if (波纹组.length > 0 || 原长度 !== 波纹组.length) 有重绘需求 = true;
  }

  // 清理已完成的 cd 动画
  if (cd动画组.length) {
    const 原长度 = cd动画组.length;
    cd动画组 = cd动画组.filter((动画) => 当前时间 - 动画.起始时间 < 500);
    if (cd动画组.length > 0 || 原长度 !== cd动画组.length) 有重绘需求 = true;
  }

  // 清除画布（背景不受视图偏移影响）
  上下文.fillStyle = 配置.画布.背景色;
  上下文.fillRect(0, 0, 画布宽, 画布高);

  // 应用视图平移
  上下文.save();
  上下文.translate(视图偏移X, 视图偏移Y);

  if (根节点) {
    // 先更新所有节点动画
    const 所有节点 = 收集所有节点(根节点);
    let 有动画进行中 = false;

    for (const 节点 of 所有节点) {
      if (节点.删除动画) {
        节点.删除动画.更新(当前时间);
        if (!节点.删除动画.已完成) 有动画进行中 = true;
      } else if (节点.动画) {
        const 结果 = 节点.动画.更新(当前时间);
        节点.x = 结果.x;
        节点.y = 结果.y;
        if (!节点.动画.已完成) 有动画进行中 = true;
      }
      // 尺寸过渡动画（切换权限显示模式时）
      if (节点.尺寸动画) {
        const 尺寸结果 = 节点.尺寸动画.更新(当前时间);
        节点.宽 = 尺寸结果.宽;
        节点.高 = 尺寸结果.高;
        if (!节点.尺寸动画.已完成) 有动画进行中 = true;
      }
    }

    // 检查当前位置过渡动画
    for (const 节点 of 所有节点) {
      if (节点.当前位置动画) {
        节点.当前位置过渡 = 节点.当前位置动画.更新(当前时间);
        if (!节点.当前位置动画.已完成) 有动画进行中 = true;
        else 节点.当前位置动画 = null;
      }
    }

    // 分离正常节点和删除中的节点
    const 正常节点 = 所有节点.filter((n) => !n.删除动画 || n.删除动画.当前值 < 1);
    const 删除节点 = 所有节点.filter((n) => n.删除动画);

    // 绘制连接线（只绘制两个端点都未在删除中的）
    for (const 节点 of 正常节点) {
      if (!节点.父节点) continue;
      if (节点.父节点.删除动画) continue;
      绘制连接线(节点.父节点, 节点);
    }

    // 按层级从低到高绘制节点（层级高的后绘制，显示在上层）
    const 按层级排序 = [...正常节点].sort((a, b) => a.层级 - b.层级);
    for (const 节点 of 按层级排序) {
      绘制节点(节点);
    }

    // 清理已完成删除动画的节点
    let 有节点被移除 = false;
    for (const 节点 of [...删除节点]) {
      if (节点.删除动画.已完成) {
        // 从父节点中移除
        if (节点.父节点) {
          const 索引 = 节点.父节点.子节点组.indexOf(节点);
          if (索引 > -1) 节点.父节点.子节点组.splice(索引, 1);
        }
        节点表.delete(节点.id);
        有节点被移除 = true;
      }
    }

    if (有动画进行中 || 有节点被移除) 有重绘需求 = true;
  }

  绘制波纹();
  绘制cd动画();

  // 恢复视图平移，错误提示框固定位置绘制
  上下文.restore();
  绘制错误提示();

  if (有重绘需求) {
    动画帧ID = requestAnimationFrame(渲染循环);
  }
}

function 请求重绘() {
  if (!动画帧ID) {
    动画帧ID = requestAnimationFrame(渲染循环);
  }
}

// ==================== 鼠标交互 ====================
function 获取鼠标坐标(事件) {
  const 矩形 = 画布.getBoundingClientRect();
  return {
    x: 事件.clientX - 矩形.left - 视图偏移X,
    y: 事件.clientY - 矩形.top - 视图偏移Y,
  };
}

function 查找命中节点(x, y) {
  if (!根节点) return null;
  const 所有节点 = 收集所有节点(根节点);
  let 最高命中节点 = null;
  let 最高命中层级 = -1;
  // 只命中层级最高的节点
  for (const 节点 of 所有节点) {
    if (节点.删除动画) continue;
    const { 实际宽, 实际高 } = 获取节点实际尺寸(节点);
    const 半宽 = 实际宽 / 2;
    const 半高 = 实际高 / 2;
    if (x >= 节点.x - 半宽 && x <= 节点.x + 半宽 && y >= 节点.y - 半高 && y <= 节点.y + 半高) {
      if (节点.层级 > 最高命中层级) {
        最高命中层级 = 节点.层级;
        最高命中节点 = 节点;
      }
    }
  }
  return 最高命中节点;
}

// 计算节点右上角删除按钮的几何信息；不可见/不可删时返回 null
function 获取删除按钮几何(节点, 已知宽, 已知高, 已知比例) {
  if (!节点.父节点) return null; // 根目录不可删除
  if (节点.删除动画) return null;

  let 实际宽 = 已知宽,
    实际高 = 已知高,
    当前比例 = 已知比例;
  if (实际宽 === undefined) {
    const 尺寸 = 获取节点实际尺寸(节点);
    实际宽 = 尺寸.实际宽;
    实际高 = 尺寸.实际高;
    当前比例 = 尺寸.当前比例;
  }
  const 半径 = 配置.删除按钮.半径 * 当前比例;
  // 圆心位于节点矩形右上角顶点
  return {
    x: 节点.x + 实际宽 / 2,
    y: 节点.y - 实际高 / 2,
    半径,
  };
}

// 查找点击是否命中某节点的删除按钮（返回层级最高的命中节点）
function 查找删除按钮命中(x, y) {
  if (!根节点) return null;
  const 所有节点 = 收集所有节点(根节点);
  let 最高命中节点 = null;
  let 最高命中层级 = -1;
  for (const 节点 of 所有节点) {
    const 几何 = 获取删除按钮几何(节点);
    if (!几何) continue;
    const 距离平方 = (x - 几何.x) ** 2 + (y - 几何.y) ** 2;
    if (距离平方 <= 几何.半径 ** 2 && 节点.层级 > 最高命中层级) {
      最高命中层级 = 节点.层级;
      最高命中节点 = 节点;
    }
  }
  return 最高命中节点;
}

// 查找坐标命中的权限字母（返回 { 节点, 类名, 位 }，取层级最高者）
// 点击范围是包裹字符的矩形：宽 = 字符槽宽（字符宽 + 权限间隔，空隙均分到字符两侧，相邻范围相接）
function 查找权限字母命中(x, y) {
  // 仅字母模式存在可点击的权限字母
  if (!根节点 || 获取权限显示模式() !== "字母") return null;

  const 半间隔 = 配置.权限间隔 / 2;
  let 最高命中 = null;
  let 最高层级 = -1;
  for (const 节点 of 收集所有节点(根节点)) {
    if (节点.删除动画) continue;
    // 与绘制端一致：根节点基线含 +4 垂直居中补偿，命中区域同步偏移
    const 几何 = 计算权限区几何(节点, 节点.父节点 ? 0 : 4);
    if (!几何 || !几何.显示字母) continue;

    // 主行墨迹范围（各行字母的矩形高度一致，用同一行文本度量）
    上下文.font = 几何.尺寸.权限字体;
    const 度量 = 上下文.measureText("u: rwx");
    const 上延 = 度量.actualBoundingBoxAscent ?? 0;
    const 下延 = 度量.actualBoundingBoxDescent ?? 0;

    for (let i = 0; i < 3; i++) {
      const 主行基线 = 几何.首行基线Y + i * 几何.行距;
      const 顶Y = 主行基线 - 上延;
      const 底Y = 主行基线 + 下延;
      if (y < 顶Y || y > 底Y) continue;
      for (let j = 0; j < 3; j++) {
        const 左X = 几何.字母区起始X + j * 几何.字母槽宽 - 半间隔;
        if (x >= 左X && x <= 左X + 几何.字母槽宽 && 节点.层级 > 最高层级) {
          最高层级 = 节点.层级;
          最高命中 = { 节点, 类名: 几何.类组[i][0], 位: [4, 2, 1][j] };
        }
      }
    }
  }
  return 最高命中;
}

// 切换单个权限位：有权限则清除（字母变 -），无权限则赋予
// 鼠标点击属于演示操作，不做权限校验（区别于 chmod 命令）
function 切换权限位(节点, 类名, 位) {
  节点.权限[类名] ^= 位;
  请求重绘();
}

function 处理鼠标按下(事件) {
  // 按住鼠标中键（滚轮）时拖拽：拖拽 Canvas 视图
  if (事件.button === 1) {
    // 阻止默认的浏览器自动滚动模式
    事件.preventDefault();
    正在拖拽视图 = true;
    中键按下位置X = 事件.clientX;
    中键按下位置Y = 事件.clientY;
    中键已移动 = false;
    视图拖拽起始X = 事件.clientX;
    视图拖拽起始Y = 事件.clientY;
    视图拖拽初始偏移X = 视图偏移X;
    视图拖拽初始偏移Y = 视图偏移Y;
    return;
  }
  // 非中键：标记已移动，避免误判
  中键已移动 = true;

  const { x, y } = 获取鼠标坐标(事件);

  // 左键按下删除按钮：记录候选和按下位置，待松开时确认（移动则转为拖拽并取消）
  if (事件.button === 0) {
    const 删除命中 = 查找删除按钮命中(x, y);
    if (删除命中) {
      按下删除节点 = 删除命中;
      删除按钮按下X = 事件.clientX;
      删除按钮按下Y = 事件.clientY;
      return;
    }
  }

  const 命中节点 = 查找命中节点(x, y);
  鼠标按下时间 = performance.now();
  鼠标按下节点 = 命中节点;

  // 左键按下权限字母：记录候选，仍可拖拽该节点（移动则取消候选，松开且未拖拽则切换权限位）
  if (事件.button === 0) {
    const 权限命中 = 查找权限字母命中(x, y);
    if (权限命中) {
      按下权限 = 权限命中;
      鼠标按下节点 = 权限命中.节点;
    }
  }

  if (按下权限) {
    拖拽节点 = 按下权限.节点;
  } else {
    拖拽节点 = 命中节点;
  }

  if (拖拽节点) {
    拖拽起始X = x;
    拖拽起始Y = y;
    拖拽当前X = x;
    拖拽当前Y = y;
    拖拽节点.拖拽偏移X = x - 拖拽节点.x;
    拖拽节点.拖拽偏移Y = y - 拖拽节点.y;
    拖拽时按住Ctrl = 事件.ctrlKey;
  }
}

// 根据当前 Ctrl 状态更新拖拽跟随组：按住 Ctrl 时后代不跟随，松开时后代跟随
function 更新拖拽跟随组() {
  拖拽跟随偏移组 = [];
  if (拖拽时按住Ctrl || !拖拽节点) return;
  const 收集后代偏移 = (节点) => {
    for (const 子节点 of 节点.子节点组) {
      const 相对偏移X = 子节点.x - 拖拽节点.x;
      const 相对偏移Y = 子节点.y - 拖拽节点.y;
      拖拽跟随偏移组.push({ 节点: 子节点, 偏移X: 相对偏移X, 偏移Y: 相对偏移Y });
      子节点.动画 = null; // 停止子节点自身动画，避免冲突
      收集后代偏移(子节点);
    }
  };
  收集后代偏移(拖拽节点);
}

function 处理鼠标移动(事件) {
  // 拖拽视图：更新视图偏移（使用原始 clientX/Y）
  if (正在拖拽视图) {
    const 移动距离 = Math.sqrt((事件.clientX - 中键按下位置X) ** 2 + (事件.clientY - 中键按下位置Y) ** 2);
    if (移动距离 > 配置.交互.拖拽阈值) {
      if (!中键已移动) {
        画布.style.cursor = 'url("/Images/Common/鼠标-移动抓手.cur"), grabbing';
      }
      中键已移动 = true;
      // 阻止默认行为，避免中键自动滚动等
      事件.preventDefault();
    }
    视图偏移X = 视图拖拽初始偏移X + (事件.clientX - 视图拖拽起始X);
    视图偏移Y = 视图拖拽初始偏移Y + (事件.clientY - 视图拖拽起始Y);
    请求重绘();
    return;
  }

  const { x, y } = 获取鼠标坐标(事件);

  // 在删除按钮上按下后移动：转为拖拽该节点，并取消删除
  if (按下删除节点 && !拖拽节点) {
    const 移动距离 = Math.sqrt((事件.clientX - 删除按钮按下X) ** 2 + (事件.clientY - 删除按钮按下Y) ** 2);
    if (移动距离 > 配置.交互.拖拽阈值) {
      const 目标节点 = 按下删除节点;
      按下删除节点 = null;
      鼠标按下时间 = performance.now();
      鼠标按下节点 = 目标节点;
      拖拽节点 = 目标节点;
      拖拽起始X = x;
      拖拽起始Y = y;
      拖拽当前X = x;
      拖拽当前Y = y;
      目标节点.拖拽偏移X = x - 目标节点.x;
      目标节点.拖拽偏移Y = y - 目标节点.y;
      拖拽时按住Ctrl = 事件.ctrlKey;
    }
  }

  // 未拖拽时：优先检测删除按钮悬停，其次检测权限字母悬停，最后检测悬停节点
  if (!拖拽节点) {
    const 删除命中 = 查找删除按钮命中(x, y);
    if (删除命中) {
      let 需要重绘 = false;
      if (悬停节点) {
        悬停节点 = null;
        需要重绘 = true;
      }
      if (悬停权限字母) {
        悬停权限字母 = null;
        需要重绘 = true;
      }
      if (悬停删除节点 !== 删除命中) {
        悬停删除节点 = 删除命中;
        需要重绘 = true;
      }
      画布.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
      if (需要重绘) 请求重绘();
      return;
    }
    const 权限命中 = 查找权限字母命中(x, y);
    let 需要重绘 = false;
    if (悬停删除节点) {
      悬停删除节点 = null;
      需要重绘 = true;
    }
    if (权限命中) {
      // 权限字母悬停：字母位于节点内部，节点也保持悬停高亮
      const 同一字母 =
        悬停权限字母 &&
        悬停权限字母.节点 === 权限命中.节点 &&
        悬停权限字母.类名 === 权限命中.类名 &&
        悬停权限字母.位 === 权限命中.位;
      if (!同一字母) {
        悬停权限字母 = 权限命中;
        需要重绘 = true;
      }
      if (悬停节点 !== 权限命中.节点) {
        悬停节点 = 权限命中.节点;
        需要重绘 = true;
      }
      画布.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
      if (需要重绘) 请求重绘();
      return;
    }
    if (悬停权限字母) {
      悬停权限字母 = null;
      需要重绘 = true;
    }
    const 命中 = 查找命中节点(x, y);
    if (命中 !== 悬停节点) {
      悬停节点 = 命中;
      画布.style.cursor = 命中 ? 'url("/Images/Common/鼠标-指向.cur"), pointer' : "var(--光标-默认)";
      需要重绘 = true;
    }
    if (需要重绘) 请求重绘();
    return;
  }

  拖拽当前X = x;
  拖拽当前Y = y;

  if (!拖拽节点.被拖拽) {
    const 移动距离 = Math.sqrt((x - 拖拽起始X) ** 2 + (y - 拖拽起始Y) ** 2);
    if (移动距离 <= 配置.交互.拖拽阈值) return;
    // 开始拖拽：按下后移动即视为拖拽，取消权限点击候选
    按下权限 = null;
    悬停权限字母 = null;
    拖拽节点.被拖拽 = true;
    拖拽节点.动画 = null;
    更新拖拽跟随组();
  }

  // 拖拽中：持续更新拖拽节点位置
  const 新X = x - 拖拽节点.拖拽偏移X;
  const 新Y = y - 拖拽节点.拖拽偏移Y;
  const 移动差X = 新X - 拖拽节点.x;
  const 移动差Y = 新Y - 拖拽节点.y;
  拖拽节点.x = 新X;
  拖拽节点.y = 新Y;

  // 所有后代节点跟随移动，保持相对位置
  for (const 跟随项 of 拖拽跟随偏移组) {
    跟随项.节点.x += 移动差X;
    跟随项.节点.y += 移动差Y;
  }

  请求重绘();
}

function 处理鼠标松开(事件) {
  // 结束视图拖拽
  if (正在拖拽视图) {
    正在拖拽视图 = false;
    画布.style.cursor = "var(--光标-默认)";
    按下删除节点 = null;
    return;
  }

  // 在删除按钮上按下后松开：
  if (按下删除节点) {
    if (!拖拽节点) {
      // 未移动：执行删除
      点击删除节点(按下删除节点);
    }
    // 已移动转为拖拽：不删除
    按下删除节点 = null;
    return;
  }

  if (!拖拽节点) return;

  const 按下时长 = performance.now() - 鼠标按下时间;
  const 是点击 = !拖拽节点.被拖拽 && 按下时长 < 配置.交互.点击时间阈值;

  if (按下权限) {
    // 权限字母点击：未拖拽（未移动）才切换该权限位，不限制按住时长，也不触发目录 cd
    if (!拖拽节点.被拖拽) {
      切换权限位(按下权限.节点, 按下权限.类名, 按下权限.位);
    }
  } else if (是点击 && 鼠标按下节点 && 鼠标按下节点.类型 === "目录" && 鼠标按下节点 !== 当前位置节点) {
    // 点击目录：设为当前目录（缺少 x 权限的目录无法进入）
    const 权限错误 = 检查cd错误(鼠标按下节点);
    if (权限错误) {
      显示错误(权限错误);
    } else {
      撤销栈.push({ 快照: 创建快照(), 来自命令: false });
      执行cd(鼠标按下节点);
    }
  } else if (是点击 && 鼠标按下节点 && 鼠标按下节点.类型 === "文件") {
    // 点击文件：提示需要 r 权限才能读取文件内容
    const 点击文件 = 鼠标按下节点;
    if (!属主有位(点击文件, 0b100)) {
      显示错误(`权限不足：${节点路径文本(点击文件)}\n文件缺少 r（读取）权限，无法读取其内容`);
    }
  }

  if (拖拽节点.被拖拽) {
    // 拖拽结束：记录快照后标记为固定位置，不再自动布局
    撤销栈.push({ 快照: 创建快照(), 来自命令: false });
    拖拽节点.被拖拽 = false;
    拖拽节点.固定位置 = true;
    拖拽节点.动画 = null;
    // 后代节点也标记为固定位置
    for (const 跟随项 of 拖拽跟随偏移组) {
      跟随项.节点.固定位置 = true;
      跟随项.节点.动画 = null;
    }
    拖拽跟随偏移组 = [];
    布局并动画();
  }

  拖拽节点 = null;
  鼠标按下节点 = null;
  按下权限 = null;
}

// ==================== 命令系统 ====================
function 规范化路径(路径) {
  if (!路径 || 路径 === "/") return "/";
  const 部分组 = 路径.split("/").filter((p) => p !== "" && p !== ".");
  const 结果 = [];
  for (const 部分 of 部分组) {
    if (部分 === "..") {
      if (结果.length) 结果.pop();
    } else {
      结果.push(部分);
    }
  }
  return "/" + 结果.join("/");
}

// 花括号展开：parent/{a,b,c} → parent/a parent/b parent/c，支持嵌套和多段
function 展开花括号(文本) {
  // 找到第一对花括号
  let 开括号位置 = -1;
  let 闭括号位置 = -1;
  let 深度 = 0;
  for (let i = 0; i < 文本.length; i++) {
    if (文本[i] === "{") {
      if (深度 === 0) 开括号位置 = i;
      深度++;
    } else if (文本[i] === "}") {
      深度--;
      if (深度 === 0) {
        闭括号位置 = i;
        break;
      }
    }
  }

  // 没有花括号，原样返回
  if (开括号位置 === -1 || 闭括号位置 === -1) return [文本];

  const 前缀 = 文本.slice(0, 开括号位置);
  const 后缀 = 文本.slice(闭括号位置 + 1);
  const 内部 = 文本.slice(开括号位置 + 1, 闭括号位置);

  // 按逗号拆分顶层（不拆分嵌套花括号内的逗号）
  const 选项组 = [];
  let 当前 = "";
  let 嵌套深度 = 0;
  for (const 字符 of 内部) {
    if (字符 === "{") 嵌套深度++;
    else if (字符 === "}") 嵌套深度--;
    if (字符 === "," && 嵌套深度 === 0) {
      选项组.push(当前);
      当前 = "";
    } else {
      当前 += 字符;
    }
  }
  if (当前 || 选项组.length === 0) 选项组.push(当前);

  // 逐个选项与前缀后缀拼接（修剪选项前后空格），再递归展开剩余花括号
  const 结果 = [];
  for (const 选项 of 选项组) {
    const 拼接 = 前缀 + 选项.trim() + 后缀;
    结果.push(...展开花括号(拼接));
  }
  return 结果;
}

// 通配符展开：路径中含 * 时，匹配所在目录下的所有子节点
// 返回 { 节点组, 匹配目录 } 或 null（路径不含 * 或无匹配）
function 展开通配符(路径) {
  if (!路径.includes("*")) return null;
  const 星号位置 = 路径.indexOf("*");
  const 斜杠位置 = 路径.lastIndexOf("/", 星号位置);
  const 目录部分 = 斜杠位置 === -1 ? "" : 路径.slice(0, 斜杠位置);
  const 目录节点 = 目录部分 ? 解析相对路径(目录部分) : 当前位置节点;
  if (!目录节点 || 目录节点.类型 !== "目录") return null;
  return { 节点组: [...目录节点.子节点组], 匹配目录: 目录节点 };
}

function 解析路径(路径) {
  const 规范化 = 规范化路径(路径);
  if (规范化 === "/") return 根节点;
  const 部分组 = 规范化.split("/").filter(Boolean);
  let 节点 = 根节点;
  for (const 部分 of 部分组) {
    if (!节点) return null;
    const 子节点 = 节点.子节点组.find((n) => n.名称 === 部分);
    if (!子节点) return null;
    节点 = 子节点;
  }
  return 节点;
}

function 获取当前路径() {
  if (!当前位置节点 || 当前位置节点 === 根节点) return "/";
  const 部分组 = [];
  let 节点 = 当前位置节点;
  while (节点 && 节点 !== 根节点) {
    部分组.unshift(节点.名称);
    节点 = 节点.父节点;
  }
  return "/" + 部分组.join("/");
}

const 路径显示区 = document.getElementById("路径显示区");

function 更新路径显示() {
  const 路径 = 获取当前路径();
  // 将斜杠包成灰色 span
  const 高亮路径 = 路径.replace(/\//g, '<span class="路径斜杠">/</span>');
  路径显示区.innerHTML = 高亮路径;
}

function 更新提示符() {
  const 目录名 = 当前位置节点 ? 当前位置节点.名称 : "/";
  命令提示符.innerHTML = '<span class="提示符目录">' + 目录名 + '</span> <span class="提示符符号">$</span>';
  更新路径显示();
}

// ==================== 命令语法高亮 ====================
const 命令高亮层 = document.getElementById("命令高亮层");

const 命令输入区 = document.querySelector(".命令输入区");

function 高亮命令语法(文本) {
  const 有效命令组 = ["cd", "mkdir", "rmdir", "rm", "touch", "cp", "mv", "chmod", "useradd", "su", "usermod", "userdel", "groupdel"];
  const 转义 = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // 路径中的特殊字符用单独颜色高亮
  const 转义路径 = (s) =>
    转义(s)
      .replace(/\//g, '<span class="语法-斜杠">/</span>')
      .replace(/\{/g, '<span class="语法-花括号">{</span>')
      .replace(/\}/g, '<span class="语法-花括号">}</span>')
      .replace(/,/g, '<span class="语法-逗号">,</span>');
  const 部分组 = 文本.split(/(\s+)/);
  let 结果 = "";
  let 已遇到命令 = false;
  let 当前命令 = "";
  let chmod模式已高亮 = false;

  for (const 部分 of 部分组) {
    if (!部分) continue;
    if (/^\s+$/.test(部分)) {
      结果 += 转义(部分);
      continue;
    }
    if (!已遇到命令) {
      // 第一个非空白部分是命令（或 sudo 前缀）
      const 小写 = 部分.toLowerCase();
      if (小写 === "sudo") {
        结果 += `<span class="语法-sudo">${转义(部分)}</span>`;
        continue; // 保持 已遇到命令 = false，等待下一个命令词
      }
      if (有效命令组.includes(小写)) {
        结果 += `<span class="语法-命令">${转义(部分)}</span>`;
        当前命令 = 小写;
      } else {
        结果 += 转义(部分);
      }
      已遇到命令 = true;
      continue;
    }
    // 后续部分：参数或路径
    if (部分.startsWith("-")) {
      // 横杠参数，拆出横杠和参数字母
      const 横杠 = 部分[0];
      const 字母 = 部分.slice(1);
      结果 += `<span class="语法-横杠">${转义(横杠)}</span>`;
      if (字母) {
        结果 += `<span class="语法-参数">${转义(字母)}</span>`;
      }
    } else if (当前命令 === "chmod" && !chmod模式已高亮) {
      // chmod 后的第一个非横杠参数是权限模式
      chmod模式已高亮 = true;
      结果 += `<span class="语法-参数">${转义路径(部分)}</span>`;
    } else {
      结果 += `<span class="语法-路径">${转义路径(部分)}</span>`;
    }
  }

  return 结果;
}

function 更新命令高亮() {
  const 文本 = 命令输入框.value;
  if (!文本) {
    命令高亮层.innerHTML = "";
    命令输入区.style.width = "";
    return;
  }

  命令高亮层.innerHTML = 高亮命令语法(文本);

  // 根据内容实际宽度自动扩展输入区，最大宽度由 CSS max-width 限制
  命令高亮层.style.width = "max-content";
  const 内容宽度 = 命令高亮层.offsetWidth;
  命令高亮层.style.width = "";
  命令输入区.style.width = Math.max(内容宽度, 340) + 命令提示符.offsetWidth + 命令执行按钮.offsetWidth + 30 + "px";
}

function 解析相对路径(路径) {
  if (!路径 || 路径 === "/") return 根节点;
  // ~ 表示当前用户主目录，动态查找实际主目录节点
  if (路径 === "~") {
    const 主目录 = 查找主目录();
    if (主目录) return 主目录;
    return 解析路径("/home/" + 面板当前用户);
  }
  if (路径.startsWith("~/")) {
    const 主目录 = 查找主目录();
    if (主目录) {
      const 子路径 = 路径.slice(2);
      const 部分组 = 子路径.split("/").filter((p) => p !== "" && p !== ".");
      let 节点 = 主目录;
      for (const 部分 of 部分组) {
        if (部分 === "..") {
          if (节点.父节点) 节点 = 节点.父节点;
        } else {
          const 子节点 = 节点.子节点组.find((n) => n.名称 === 部分);
          if (!子节点) return null;
          节点 = 子节点;
        }
      }
      return 节点;
    }
    路径 = "/home/" + 面板当前用户 + 路径.slice(1);
  }
  if (路径.startsWith("/")) {
    // 绝对路径：从根开始
    return 解析路径(路径);
  }
  // 相对路径：从当前位置开始
  const 部分组 = 路径.split("/").filter((p) => p !== "" && p !== ".");
  let 节点 = 当前位置节点;
  for (const 部分 of 部分组) {
    if (部分 === "..") {
      if (节点.父节点) 节点 = 节点.父节点;
    } else {
      const 子节点 = 节点.子节点组.find((n) => n.名称 === 部分);
      if (!子节点) return null;
      节点 = 子节点;
    }
  }
  return 节点;
}

// 解析 chmod 符号模式，如 "u+x"、"go-w"、"u=rwx,g=rx"、"a="
// 返回语句组 [{ 谁, 操作, 字符集 }]，无效时返回 null
function 解析符号模式(模式) {
  const 语句组 = [];
  for (const 段 of 模式.split(",")) {
    const 匹配 = 段.match(/^([ugoa]*)([+\-=])([rwxX]*)$/);
    if (!匹配) return null;
    const 操作 = 匹配[2];
    const 字符集 = [...new Set(匹配[3].split(""))];
    // "+" 和 "-" 必须带权限字符，"=" 允许为空（表示清空）
    if (字符集.length === 0 && 操作 !== "=") return null;
    语句组.push({ 谁: 匹配[1] || "a", 操作, 字符集 });
  }
  return 语句组;
}

// 智能分割：按空格分割，但跳过花括号 {} 内和引号内的空格；引号本身被移除
function 智能分割命令(输入) {
  const 结果 = [];
  let 当前 = "";
  let 花括号深度 = 0;
  let 引号 = null; // 当前所在的引号字符（" 或 '），null 表示不在引号内
  let 已有内容 = false; // 标记当前词是否已开始（让 "" 也能成为空参数）
  for (const 字符 of 输入.trim()) {
    if (引号) {
      // 引号内：空格、花括号都按字面量处理，直到遇到匹配的结束引号
      if (字符 === 引号) 引号 = null;
      else 当前 += 字符;
      continue;
    }
    if (字符 === '"' || 字符 === "'") {
      引号 = 字符;
      已有内容 = true;
      continue;
    }
    if (字符 === "{") 花括号深度++;
    else if (字符 === "}") 花括号深度--;
    if (/\s/.test(字符) && 花括号深度 === 0) {
      if (当前 || 已有内容) {
        结果.push(当前);
        当前 = "";
        已有内容 = false;
      }
    } else {
      当前 += 字符;
    }
  }
  if (当前 || 已有内容) 结果.push(当前);
  return 结果;
}

// 将路径开头的 ~ 展开为当前用户主目录的绝对路径（~ 或 ~/... → 主目录路径/...）
function 展开主目录路径(路径) {
  if (路径 !== "~" && !路径.startsWith("~/")) return 路径;
  let 主目录路径 = "/home/" + 面板当前用户;
  const 主目录 = 查找主目录();
  if (主目录) {
    const 部分组 = [];
    let 节点 = 主目录;
    while (节点 && 节点.父节点) {
      部分组.unshift(节点.名称);
      节点 = 节点.父节点;
    }
    主目录路径 = "/" + 部分组.join("/");
  }
  return 主目录路径 + 路径.slice(1);
}

function 解析命令(输入) {
  const 错误 = { 有错误: false, 消息: "" };

  if (!输入.trim()) {
    return { 有效: false };
  }

  let 部分组 = 智能分割命令(输入);
  let 提权 = false;

  // sudo 前缀：提取并标记提权，后续按原逻辑解析实际命令
  if (部分组[0].toLowerCase() === "sudo") {
    提权 = true;
    部分组 = 部分组.slice(1);
    if (!部分组.length) {
      return { 有效: false, 错误: { 有错误: true, 消息: "sudo：缺少要执行的命令\n用法：sudo <命令> [参数]" } };
    }
  }

  const 命令 = 部分组[0].toLowerCase();
  // 统一展开参数开头的 ~ 为主目录绝对路径，让所有命令都能识别 ~
  const 参数组 = 部分组.slice(1).map(展开主目录路径);

  const 有效命令组 = ["cd", "mkdir", "rmdir", "rm", "touch", "cp", "mv", "chmod", "useradd", "su", "usermod", "userdel", "groupdel"];
  if (!有效命令组.includes(命令)) {
    return {
      有效: false,
      错误: {
        有错误: true,
        消息: `未知命令：${命令}\n支持：cd / mkdir / rmdir / rm / touch / cp / mv / chmod / useradd / su / usermod / userdel / groupdel（可加 sudo 前缀提权）`,
      },
    };
  }

  // 需要 root 提权的管理类命令：未加 sudo 时直接报错
  const 需提权命令组 = ["useradd", "usermod", "userdel", "groupdel"];
  if (需提权命令组.includes(命令) && !提权) {
    return { 有效: false, 错误: { 有错误: true, 消息: `${命令}：权限不足\n该命令需要 root 权限，请使用 sudo` } };
  }

  // 包装有效结果：附加 提权 标记供执行时跳过权限检查
  const 包装 = (结果) => (结果 && 结果.有效 ? { ...结果, 提权 } : 结果);

  switch (命令) {
    case "cd": {
      if (参数组.length === 0) {
        return { 有效: false, 错误: { 有错误: true, 消息: "cd：缺少目标路径\n用法：cd <路径>" } };
      }
      if (参数组.length > 1) {
        return { 有效: false, 错误: { 有错误: true, 消息: "cd：参数过多\n用法：cd <路径>" } };
      }
      const 目标 = 参数组[0];
      if (目标.startsWith("-")) {
        return { 有效: false, 错误: { 有错误: true, 消息: "cd：不支持该参数\n支持：cd / cd .. / cd <路径>" } };
      }
      // 使用相对路径解析，支持 .. 和子目录名
      const 目标节点 = 解析相对路径(目标);
      if (!目标节点) {
        return { 有效: false, 错误: { 有错误: true, 消息: `cd：路径不存在：${目标}` } };
      }
      if (目标节点.类型 !== "目录") {
        return { 有效: false, 错误: { 有错误: true, 消息: `cd：${目标} 不是目录\n无法进入文件` } };
      }
      return 包装({ 有效: true, 命令: "cd", 目标: 目标节点, 目标路径: 目标 });
    }

    case "chmod": {
      let 递归 = false;
      let 非标志参数组 = [];

      for (const 参数 of 参数组) {
        if (参数.startsWith("-")) {
          const 标志组 = 参数.slice(1).split("");
          for (const 标志 of 标志组) {
            if (标志 === "r" || 标志 === "R") 递归 = true;
            else
              return {
                有效: false,
                错误: { 有错误: true, 消息: `chmod：无效参数 -${标志}\n支持：-R（递归应用权限）` },
              };
          }
        } else {
          非标志参数组.push(参数);
        }
      }

      if (非标志参数组.length === 0) {
        return {
          有效: false,
          错误: {
            有错误: true,
            消息: "chmod：缺少权限模式\n用法：chmod [-R] <模式> <目标>\n模式：755 / u+x / go-w / u=rwx,g=rx",
          },
        };
      }
      if (非标志参数组.length === 1) {
        return { 有效: false, 错误: { 有错误: true, 消息: "chmod：缺少目标\n用法：chmod [-R] <模式> <目标>" } };
      }
      if (非标志参数组.length > 2) {
        return { 有效: false, 错误: { 有错误: true, 消息: "chmod：参数过多\n用法：chmod [-R] <模式> <目标>" } };
      }

      const 模式 = 非标志参数组[0];
      const 目标路径 = 非标志参数组[1];

      // 解析权限模式：数字模式（3位八进制）或符号模式
      let 数字模式 = null;
      let 符号语句组 = null;
      if (/^[0-7]{3}$/.test(模式)) {
        数字模式 = 数字转权限(parseInt(模式, 8));
      } else {
        符号语句组 = 解析符号模式(模式);
        if (!符号语句组) {
          return {
            有效: false,
            错误: {
              有错误: true,
              消息: `chmod：无效的权限模式：${模式}\n数字模式：755（3位八进制）\n符号模式：u+x / go-w / u=rwx,g=rx`,
            },
          };
        }
      }

      const 目标节点 = 解析相对路径(目标路径);
      if (!目标节点) {
        return { 有效: false, 错误: { 有错误: true, 消息: `chmod：路径不存在：${目标路径}` } };
      }

      return 包装({ 有效: true, 命令: "chmod", 目标: 目标节点, 数字模式, 符号语句组, 递归 });
    }

    case "mkdir": {
      let 创建父级 = false;
      let 原始路径组 = [];

      for (const 参数 of 参数组) {
        if (参数.startsWith("-")) {
          const 标志组 = 参数.slice(1).split("");
          for (const 标志 of 标志组) {
            if (标志 === "p") 创建父级 = true;
            else
              return {
                有效: false,
                错误: { 有错误: true, 消息: `mkdir：无效参数 -${标志}\n支持：-p（创建父级目录）` },
              };
          }
        } else {
          原始路径组.push(参数);
        }
      }

      // 花括号展开：parent/{a,b,c} → parent/a parent/b parent/c
      const 路径组 = [];
      for (const 原始路径 of 原始路径组) {
        路径组.push(...展开花括号(原始路径));
      }

      if (路径组.length === 0) {
        return {
          有效: false,
          错误: { 有错误: true, 消息: "mkdir：缺少目录名\n用法：mkdir [-p] <目录名/路径> [目录名/路径...]" },
        };
      }

      // 多目录支持：每个路径独立解析，返回创建任务组
      const 创建任务组 = [];
      for (const 路径 of 路径组) {
        // 解析路径，支持相对路径和绝对路径
        let 父节点;
        let 目录名组;

        if (路径.startsWith("/")) {
          // 绝对路径
          const 规范化后路径 = 规范化路径(路径);
          if (规范化后路径 === "/") {
            return { 有效: false, 错误: { 有错误: true, 消息: "mkdir：目录已存在：/" } };
          }
          const 部分组 = 规范化后路径.split("/").filter((p) => p);
          目录名组 = 部分组;
          父节点 = 根节点;
        } else {
          // 相对路径
          const 部分组 = 路径.split("/").filter((p) => p && p !== ".");
          if (部分组.length === 0) {
            return { 有效: false, 错误: { 有错误: true, 消息: "mkdir：无效的目录名" } };
          }
          目录名组 = 部分组;
          父节点 = 当前位置节点;
        }

        // 处理 ".." 和 "."
        let 当前节点 = 父节点;
        for (let i = 0; i < 目录名组.length - 1; i++) {
          const 名 = 目录名组[i];
          if (名 === "..") {
            if (当前节点.父节点) 当前节点 = 当前节点.父节点;
          } else if (名 !== ".") {
            const 子节点 = 当前节点.子节点组.find((n) => n.名称 === 名);
            if (!子节点) {
              if (!创建父级) {
                return {
                  有效: false,
                  错误: { 有错误: true, 消息: `mkdir：目录不存在：${名}\n使用 -p 参数自动创建父级目录` },
                };
              }
              // 创建中间目录
              const 新目录 = 创建节点("目录", 名, 当前节点);
              新目录.x = 当前节点.x + 当前节点.宽 + 配置.布局.子节点水平间距;
              新目录.y = 当前节点.y;
              新目录.固定位置 = true;
              当前节点.子节点组.push(新目录);
              节点表.set(新目录.id, 新目录);
              当前节点 = 新目录;
            } else if (子节点.类型 !== "目录") {
              return { 有效: false, 错误: { 有错误: true, 消息: `mkdir：${名} 不是目录` } };
            } else {
              当前节点 = 子节点;
            }
          }
        }

        const 最终目录名 = 目录名组[目录名组.length - 1];
        if (最终目录名 === ".." || 最终目录名 === ".") {
          return { 有效: false, 错误: { 有错误: true, 消息: "mkdir：无效的目录名" } };
        }

        const 重复 = 当前节点.子节点组.find((n) => n.名称 === 最终目录名);
        if (重复) {
          if (创建父级) {
            // -p 模式下已存在则静默成功
            continue;
          }
          return { 有效: false, 错误: { 有错误: true, 消息: `mkdir：已存在同名项：${最终目录名}` } };
        }

        创建任务组.push({ 名称: 最终目录名, 父节点: 当前节点 });
      }

      if (创建任务组.length === 0) {
        // -p 模式下全部已存在
        return { 有效: true, 命令: "mkdir", 静默忽略: true };
      }

      return 包装({ 有效: true, 命令: "mkdir", 创建任务组, 创建父级 });
    }

    case "rmdir": {
      if (参数组.length === 0) {
        return { 有效: false, 错误: { 有错误: true, 消息: "rmdir：缺少目录名\n用法：rmdir <目录名/路径>" } };
      }

      // 花括号展开：parent/{a,b} → parent/a parent/b
      const 路径组 = [];
      for (const 参数 of 参数组) {
        路径组.push(...展开花括号(参数));
      }

      // 多目录支持：逐个解析路径，返回目标组
      const 目标组 = [];
      for (const 路径 of 路径组) {
        const 目标节点 = 解析相对路径(路径);
        if (!目标节点) {
          return { 有效: false, 错误: { 有错误: true, 消息: `rmdir：目录不存在：${路径}` } };
        }
        if (目标节点.类型 !== "目录") {
          return { 有效: false, 错误: { 有错误: true, 消息: `rmdir：${路径} 不是目录\n请使用 rm 删除文件` } };
        }
        if (目标节点 === 根节点) {
          return { 有效: false, 错误: { 有错误: true, 消息: "rmdir：不能删除根目录 /" } };
        }
        if (目标节点.子节点组.length > 0) {
          return { 有效: false, 错误: { 有错误: true, 消息: `rmdir：目录非空：${路径}\n请先删除目录内的所有内容` } };
        }
        目标组.push(目标节点);
      }

      return 包装({ 有效: true, 命令: "rmdir", 目标组 });
    }

    case "rm": {
      let 强制 = false;
      let 递归 = false;
      let 名称组 = [];

      for (const 参数 of 参数组) {
        if (参数.startsWith("-")) {
          const 标志组 = 参数.slice(1).split("");
          for (const 标志 of 标志组) {
            if (标志 === "f") 强制 = true;
            else if (标志 === "r" || 标志 === "R") 递归 = true;
            else
              return { 有效: false, 错误: { 有错误: true, 消息: `rm：无效参数 -${标志}\n支持：-f（强制）-r（递归）` } };
          }
        } else {
          名称组.push(参数);
        }
      }

      if (名称组.length === 0) {
        return {
          有效: false,
          错误: { 有错误: true, 消息: "rm：缺少文件名\n用法：rm [-f] [-r] <文件名/路径> [文件名/路径...]" },
        };
      }

      // 花括号展开：parent/{a,b} → parent/a parent/b
      const 展开名称组 = [];
      for (const 名称 of 名称组) {
        展开名称组.push(...展开花括号(名称));
      }

      // 多目标支持：逐个解析路径（含通配符展开），返回目标组
      const 目标组 = [];
      for (const 名称 of 展开名称组) {
        const 通配 = 展开通配符(名称);
        if (通配) {
          if (通配.节点组.length === 0) {
            if (强制) continue;
            return { 有效: false, 错误: { 有错误: true, 消息: `rm：通配符无匹配：${名称}` } };
          }
          for (const 节点 of 通配.节点组) {
            if (节点 === 根节点) {
              return { 有效: false, 错误: { 有错误: true, 消息: "rm：不能删除根目录" } };
            }
            if (节点.类型 === "目录") {
              if (!递归) {
                return {
                  有效: false,
                  错误: { 有错误: true, 消息: `rm：${节点.名称} 是目录\n请使用 rm -r 或 rmdir 删除目录` },
                };
              }
              目标组.push({ 目标: 节点, 递归: true });
            } else {
              目标组.push({ 目标: 节点, 递归: false });
            }
          }
          continue;
        }
        const 目标节点 = 解析相对路径(名称);
        if (!目标节点) {
          if (强制) {
            return { 有效: false, 静默忽略: true };
          }
          return { 有效: false, 错误: { 有错误: true, 消息: `rm：文件不存在：${名称}` } };
        }
        if (目标节点.类型 === "目录") {
          if (!递归) {
            return { 有效: false, 错误: { 有错误: true, 消息: `rm：${名称} 是目录\n请使用 rm -r 或 rmdir 删除目录` } };
          }
          目标组.push({ 目标: 目标节点, 递归: true });
        } else {
          目标组.push({ 目标: 目标节点, 递归: false });
        }
      }

      if (目标组.length === 0) {
        return { 有效: false, 静默忽略: true };
      }

      return 包装({ 有效: true, 命令: "rm", 目标组, 强制 });
    }

    case "touch": {
      if (参数组.length === 0) {
        return {
          有效: false,
          错误: { 有错误: true, 消息: "touch：缺少文件名\n用法：touch <文件名/路径> [文件名/路径...]" },
        };
      }

      // 花括号展开：dir/{a,b} → dir/a dir/b
      const 展开参数组 = [];
      for (const 原始参数 of 参数组) {
        if (原始参数.startsWith("-")) {
          return {
            有效: false,
            错误: { 有错误: true, 消息: "touch：不支持该参数\n用法：touch <文件名/路径> [文件名/路径...]" },
          };
        }
        展开参数组.push(...展开花括号(原始参数));
      }

      const 创建任务组 = [];
      for (const 参数 of 展开参数组) {
        // 解析路径，支持相对路径和绝对路径
        let 父节点;
        let 文件名;

        if (参数.startsWith("/")) {
          // 绝对路径
          const 规范化后路径 = 规范化路径(参数);
          const 部分组 = 规范化后路径.split("/").filter((p) => p);
          if (部分组.length === 0) {
            return { 有效: false, 错误: { 有错误: true, 消息: "touch：无效的文件路径" } };
          }
          文件名 = 部分组[部分组.length - 1];
          // 解析父目录
          父节点 = 根节点;
          for (let i = 0; i < 部分组.length - 1; i++) {
            const 名 = 部分组[i];
            const 子节点 = 父节点.子节点组.find((n) => n.名称 === 名);
            if (!子节点 || 子节点.类型 !== "目录") {
              return {
                有效: false,
                错误: { 有错误: true, 消息: `touch：目录不存在：${部分组.slice(0, i + 1).join("/")}` },
              };
            }
            父节点 = 子节点;
          }
        } else {
          // 相对路径
          const 部分组 = 参数.split("/").filter((p) => p && p !== ".");
          if (部分组.length === 0) {
            return { 有效: false, 错误: { 有错误: true, 消息: "touch：无效的文件名" } };
          }
          文件名 = 部分组[部分组.length - 1];
          if (文件名 === ".." || 文件名 === ".") {
            return { 有效: false, 错误: { 有错误: true, 消息: "touch：无效的文件名" } };
          }
          // 解析父目录
          父节点 = 当前位置节点;
          for (let i = 0; i < 部分组.length - 1; i++) {
            const 名 = 部分组[i];
            if (名 === "..") {
              if (父节点.父节点) 父节点 = 父节点.父节点;
            } else {
              const 子节点 = 父节点.子节点组.find((n) => n.名称 === 名);
              if (!子节点 || 子节点.类型 !== "目录") {
                return {
                  有效: false,
                  错误: { 有错误: true, 消息: `touch：目录不存在：${部分组.slice(0, i + 1).join("/")}` },
                };
              }
              父节点 = 子节点;
            }
          }
        }

        const 重复 = 父节点.子节点组.find((n) => n.名称 === 文件名);
        if (重复) {
          return { 有效: false, 静默忽略: true, 消息: `touch：${参数} 已存在（已更新）` };
        }
        创建任务组.push({ 名称: 文件名, 父节点 });
      }
      return 包装({ 有效: true, 命令: "touch", 创建任务组 });
    }

    case "cp": {
      let 递归 = false;
      let 路径组 = [];
      for (const 参数 of 参数组) {
        if (参数.startsWith("-")) {
          const 标志组 = 参数.slice(1).split("");
          for (const 标志 of 标志组) {
            if (标志 === "r" || 标志 === "R") 递归 = true;
            else
              return { 有效: false, 错误: { 有错误: true, 消息: `cp：无效参数 -${标志}\n支持：-r（递归复制目录）` } };
          }
        } else {
          路径组.push(参数);
        }
      }
      if (路径组.length < 2) {
        return { 有效: false, 错误: { 有错误: true, 消息: "cp：缺少源或目标\n用法：cp [-r] <源> <目标>" } };
      }

      // 花括号展开：{a,b} → a b，parent/{a,b} → parent/a parent/b
      const 展开路径组 = [];
      for (const 路径 of 路径组) {
        展开路径组.push(...展开花括号(路径));
      }

      const 目标路径 = 展开路径组[展开路径组.length - 1];

      // 解析目标：多源时必须是已存在的目录；单源时可以是目录或新名称
      let 目标父节点;
      let 新名称 = null;
      if (展开路径组.length > 2) {
        const 目标节点 = 解析相对路径(目标路径);
        if (!目标节点 || 目标节点.类型 !== "目录") {
          return { 有效: false, 错误: { 有错误: true, 消息: `cp：多源复制时目标必须是已存在的目录：${目标路径}` } };
        }
        目标父节点 = 目标节点;
      } else if (目标路径.endsWith("/")) {
        // 目标必须是已存在的目录
        const 目标目录 = 解析相对路径(目标路径.slice(0, -1));
        if (!目标目录 || 目标目录.类型 !== "目录") {
          return { 有效: false, 错误: { 有错误: true, 消息: `cp：目标目录不存在：${目标路径}` } };
        }
        目标父节点 = 目标目录;
      } else {
        const 目标节点 = 解析相对路径(目标路径);
        if (目标节点) {
          if (目标节点.类型 === "目录") {
            目标父节点 = 目标节点;
          } else {
            // 目标是已存在文件：覆盖
            目标父节点 = 目标节点.父节点;
            新名称 = 目标节点.名称;
          }
        } else {
          // 目标不存在：作为新名称，父目录必须存在
          const 规范路径 = 规范化路径(目标路径.startsWith("/") ? 目标路径 : 获取当前路径() + "/" + 目标路径);
          const 部分组 = 规范路径.split("/").filter(Boolean);
          新名称 = 部分组.pop();
          let 父路径 = "/" + 部分组.join("/");
          if (!部分组.length) 父路径 = "/";
          目标父节点 = 解析路径(父路径);
          if (!目标父节点) {
            return { 有效: false, 错误: { 有错误: true, 消息: `cp：目标父目录不存在：${父路径}` } };
          }
        }
      }

      // 展开所有源（支持 * 通配符和花括号展开），并逐个校验
      const 任务组 = [];
      const 警告组 = [];
      for (let i = 0; i < 展开路径组.length - 1; i++) {
        const 源路径 = 展开路径组[i];
        const 通配 = 展开通配符(源路径);
        const 源节点组 = 通配 ? 通配.节点组 : [解析相对路径(源路径)];
        const 源不存在 = !通配 && !源节点组[0];
        if (源不存在) {
          return { 有效: false, 错误: { 有错误: true, 消息: `cp：源路径不存在：${源路径}` } };
        }
        if (通配 && 通配.节点组.length === 0) {
          return { 有效: false, 错误: { 有错误: true, 消息: `cp：通配符无匹配：${源路径}` } };
        }
        for (const 源节点 of 源节点组) {
          if (源节点 === 根节点) {
            return { 有效: false, 错误: { 有错误: true, 消息: "cp：不能复制根目录" } };
          }
          if (源节点.类型 === "目录" && !递归) {
            // 未指定 -r：略过目录并给出黄色警告
            警告组.push(`未指定 -r，略过目录：${源节点.名称}`);
            continue;
          }
          // 单源且目标是新名称时沿用该名称，否则保持源名称
          const 任务名称 = 展开路径组.length === 2 && 新名称 ? 新名称 : 源节点.名称;
          // 源和目标解析到同一节点：不能复制
          if (目标父节点 === 源节点.父节点 && 任务名称 === 源节点.名称) {
            if (展开路径组.length > 2) continue; // 多源时源和目标同目录则跳过
            return { 有效: false, 错误: { 有错误: true, 消息: `cp：${源路径} 和 ${目标路径} 是同一文件` } };
          }
          // 目标是源目录本身或其后代：会导致无限递归
          let 检查节点 = 目标父节点;
          let 是自身或后代 = false;
          while (检查节点) {
            if (检查节点 === 源节点) {
              是自身或后代 = true;
              break;
            }
            检查节点 = 检查节点.父节点;
          }
          if (是自身或后代) {
            if (递归) {
              return { 有效: false, 错误: { 有错误: true, 消息: `cp：不能将目录复制到自身或其子目录中` } };
            }
            continue; // 非递归时目录已被略过，不会走到这里
          }
          // 检查目标父目录下是否已有同名项
          const 同名 = 目标父节点.子节点组.find((n) => n.名称 === 任务名称);
          if (同名 && 同名 !== 源节点) {
            return { 有效: false, 错误: { 有错误: true, 消息: `cp：目标已存在同名项：${任务名称}` } };
          }
          任务组.push({ 源: 源节点, 新名称: 任务名称 });
        }
      }
      if (任务组.length === 0) {
        if (警告组.length) {
          return { 有效: false, 静默忽略: true, 消息: 警告组.join("\n") };
        }
        return { 有效: false, 错误: { 有错误: true, 消息: "cp：没有可复制的文件" } };
      }
      // 多条警告合并为一条，避免逐条闪烁
      const 警告消息 = 警告组.length ? 警告组.join("\n") : null;
      return 包装({ 有效: true, 命令: "cp", 任务组, 目标父节点, 递归, 警告消息 });
    }

    case "mv": {
      let 路径组 = [];
      for (const 参数 of 参数组) {
        if (参数.startsWith("-")) {
          return { 有效: false, 错误: { 有错误: true, 消息: "mv：不支持该参数\n用法：mv <源> <目标>" } };
        }
        路径组.push(参数);
      }
      if (路径组.length < 2) {
        return { 有效: false, 错误: { 有错误: true, 消息: "mv：缺少源或目标\n用法：mv <源> <目标>" } };
      }

      // 花括号展开：{a,b} → a b，parent/{a,b} → parent/a parent/b
      const 展开路径组 = [];
      for (const 路径 of 路径组) {
        展开路径组.push(...展开花括号(路径));
      }

      const 目标路径 = 展开路径组[展开路径组.length - 1];

      // 解析目标：多源时必须是已存在的目录；单源时可以是目录或新名称
      let 目标父节点;
      let 新名称 = null;
      if (展开路径组.length > 2) {
        const 目标节点 = 解析相对路径(目标路径);
        if (!目标节点 || 目标节点.类型 !== "目录") {
          return { 有效: false, 错误: { 有错误: true, 消息: `mv：多源移动时目标必须是已存在的目录：${目标路径}` } };
        }
        目标父节点 = 目标节点;
      } else if (目标路径.endsWith("/")) {
        const 目标目录 = 解析相对路径(目标路径.slice(0, -1));
        if (!目标目录 || 目标目录.类型 !== "目录") {
          return { 有效: false, 错误: { 有错误: true, 消息: `mv：目标目录不存在：${目标路径}` } };
        }
        目标父节点 = 目标目录;
      } else {
        const 目标节点 = 解析相对路径(目标路径);
        if (目标节点) {
          if (目标节点.类型 === "目录") {
            目标父节点 = 目标节点;
          } else {
            目标父节点 = 目标节点.父节点;
            新名称 = 目标节点.名称;
          }
        } else {
          const 规范路径 = 规范化路径(目标路径.startsWith("/") ? 目标路径 : 获取当前路径() + "/" + 目标路径);
          const 部分组 = 规范路径.split("/").filter(Boolean);
          新名称 = 部分组.pop();
          let 父路径 = "/" + 部分组.join("/");
          if (!部分组.length) 父路径 = "/";
          目标父节点 = 解析路径(父路径);
          if (!目标父节点) {
            return { 有效: false, 错误: { 有错误: true, 消息: `mv：目标父目录不存在：${父路径}` } };
          }
        }
      }

      // 展开所有源（支持 * 通配符和花括号展开），并逐个校验
      const 任务组 = [];
      for (let i = 0; i < 展开路径组.length - 1; i++) {
        const 源路径 = 展开路径组[i];
        const 通配 = 展开通配符(源路径);
        const 源节点组 = 通配 ? 通配.节点组 : [解析相对路径(源路径)];
        const 源不存在 = !通配 && !源节点组[0];
        if (源不存在) {
          return { 有效: false, 错误: { 有错误: true, 消息: `mv：源路径不存在：${源路径}` } };
        }
        if (通配 && 通配.节点组.length === 0) {
          return { 有效: false, 错误: { 有错误: true, 消息: `mv：通配符无匹配：${源路径}` } };
        }
        for (const 源节点 of 源节点组) {
          if (源节点 === 根节点) {
            return { 有效: false, 错误: { 有错误: true, 消息: "mv：不能移动根目录" } };
          }
          // 单源且目标是新名称时沿用该名称，否则保持源名称
          const 任务名称 = 展开路径组.length === 2 && 新名称 ? 新名称 : 源节点.名称;
          // 不能移动到自己或自己的后代
          let 检查节点 = 目标父节点;
          let 是自身或后代 = false;
          while (检查节点) {
            if (检查节点 === 源节点) {
              是自身或后代 = true;
              break;
            }
            检查节点 = 检查节点.父节点;
          }
          if (是自身或后代) {
            if (展开路径组.length > 2 || 通配) continue; // 多源/通配时跳过会导致循环的项
            return { 有效: false, 错误: { 有错误: true, 消息: "mv：不能将目录移动到自己的子目录中" } };
          }
          const 同名 = 目标父节点.子节点组.find((n) => n.名称 === 任务名称);
          if (同名 && 同名 !== 源节点) {
            return { 有效: false, 错误: { 有错误: true, 消息: `mv：目标已存在同名项：${任务名称}` } };
          }
          // 源路径和目标路径相同且名称相同：不能移动
          if (目标父节点 === 源节点.父节点 && 任务名称 === 源节点.名称) {
            if (展开路径组.length > 2 || 通配) continue;
            return { 有效: false, 错误: { 有错误: true, 消息: `mv：${源路径} 和 ${目标路径} 是同一文件` } };
          }
          任务组.push({ 源: 源节点, 新名称: 任务名称 });
        }
      }
      if (任务组.length === 0) {
        return { 有效: false, 错误: { 有错误: true, 消息: "mv：没有可移动的文件" } };
      }
      return 包装({ 有效: true, 命令: "mv", 任务组, 目标父节点 });
    }

    // ==================== 用户与组命令 ====================
    case "useradd": {
      let 创建主目录 = false;
      let 登录shell = null;
      let 名称 = null;
      for (let i = 0; i < 参数组.length; i++) {
        const 参数 = 参数组[i];
        if (参数 === "-m") {
          创建主目录 = true;
        } else if (参数 === "-s") {
          const 值 = 参数组[++i];
          if (!值) return { 有效: false, 错误: { 有错误: true, 消息: "useradd：-s 需要指定 shell 路径\n用法：useradd [-m] [-s <shell>] <用户名>" } };
          登录shell = 值;
        } else if (参数.startsWith("-")) {
          return { 有效: false, 错误: { 有错误: true, 消息: `useradd：无效参数 ${参数}\n支持：-m（创建主目录）-s（指定登录shell）` } };
        } else if (!名称) {
          名称 = 参数;
        } else {
          return { 有效: false, 错误: { 有错误: true, 消息: "useradd：参数过多\n用法：useradd [-m] [-s <shell>] <用户名>" } };
        }
      }
      if (!名称) return { 有效: false, 错误: { 有错误: true, 消息: "useradd：缺少用户名\n用法：useradd [-m] [-s <shell>] <用户名>" } };
      if (面板用户组.some((u) => u.名称 === 名称)) return { 有效: false, 错误: { 有错误: true, 消息: `useradd：用户已存在：${名称}` } };
      return 包装({ 有效: true, 命令: "useradd", 名称, 选项: { 创建主目录, 登录shell } });
    }

    case "su": {
      let 切换主目录 = false;
      let 名称 = null;
      for (const 参数 of 参数组) {
        if (参数 === "-") 切换主目录 = true;
        else if (参数.startsWith("-")) return { 有效: false, 错误: { 有错误: true, 消息: `su：无效参数 ${参数}\n支持：su [-] [用户名]` } };
        else if (!名称) 名称 = 参数;
        else return { 有效: false, 错误: { 有错误: true, 消息: "su：参数过多\n用法：su [-] [用户名]" } };
      }
      const 目标 = 名称 ? 面板用户组.find((u) => u.名称 === 名称) : null;
      if (名称 && !目标) return { 有效: false, 错误: { 有错误: true, 消息: `su：用户不存在：${名称}` } };
      return 包装({ 有效: true, 命令: "su", 目标用户: 目标 || null, 切换主目录 });
    }

    case "usermod": {
      let 新名称 = null;
      let 新主目录 = null;
      let 移动主目录 = false;
      let 登录shell = null;
      let 主组 = null;
      let 目标用户 = null;
      for (let i = 0; i < 参数组.length; i++) {
        const 参数 = 参数组[i];
        if (参数 === "-l") {
          const 值 = 参数组[++i];
          if (!值) return { 有效: false, 错误: { 有错误: true, 消息: "usermod：-l 需要指定新用户名\n用法：usermod -l <新用户名> <旧用户名>" } };
          新名称 = 值;
        } else if (参数 === "-d") {
          const 值 = 参数组[++i];
          if (!值) return { 有效: false, 错误: { 有错误: true, 消息: "usermod：-d 需要指定主目录路径\n用法：usermod -d <新主目录> [-m] <用户名>" } };
          新主目录 = 值;
        } else if (参数 === "-m") {
          移动主目录 = true;
        } else if (参数 === "-s") {
          const 值 = 参数组[++i];
          if (!值) return { 有效: false, 错误: { 有错误: true, 消息: "usermod：-s 需要指定 shell 路径\n用法：usermod -s <shell> <用户名>" } };
          登录shell = 值;
        } else if (参数 === "-g") {
          const 值 = 参数组[++i];
          if (!值) return { 有效: false, 错误: { 有错误: true, 消息: "usermod：-g 需要指定主组\n用法：usermod -g <主组> <用户名>" } };
          主组 = 值;
        } else if (参数.startsWith("-")) {
          return { 有效: false, 错误: { 有错误: true, 消息: `usermod：无效参数 ${参数}\n支持：-l（改用户名）-d（改主目录）-m（移动主目录内容）-s（改登录shell）-g（改主组）` } };
        } else if (!目标用户) {
          目标用户 = 参数;
        } else {
          return { 有效: false, 错误: { 有错误: true, 消息: "usermod：参数过多\n用法：usermod [-l 新名] [-d 新主目录 [-m]] [-s shell] [-g 主组] <用户名>" } };
        }
      }
      if (!目标用户) return { 有效: false, 错误: { 有错误: true, 消息: "usermod：缺少用户名\n用法：usermod [-l 新名] [-d 新主目录 [-m]] [-s shell] [-g 主组] <用户名>" } };
      const 用户 = 面板用户组.find((u) => u.名称 === 目标用户);
      if (!用户) return { 有效: false, 错误: { 有错误: true, 消息: `usermod：用户不存在：${目标用户}` } };
      return 包装({ 有效: true, 命令: "usermod", 用户, 选项: { 新名称, 新主目录, 移动主目录, 登录shell, 主组 } });
    }

    case "userdel": {
      let 删除主目录 = false;
      let 强制 = false;
      let 名称 = null;
      for (const 参数 of 参数组) {
        if (参数 === "-r") 删除主目录 = true;
        else if (参数 === "-f") 强制 = true;
        else if (参数.startsWith("-")) return { 有效: false, 错误: { 有错误: true, 消息: `userdel：无效参数 ${参数}\n支持：-r（删除主目录）-f（强制删除）` } };
        else if (!名称) 名称 = 参数;
        else return { 有效: false, 错误: { 有错误: true, 消息: "userdel：参数过多\n用法：userdel [-r] [-f] <用户名>" } };
      }
      if (!名称) return { 有效: false, 错误: { 有错误: true, 消息: "userdel：缺少用户名\n用法：userdel [-r] [-f] <用户名>" } };
      const 用户 = 面板用户组.find((u) => u.名称 === 名称);
      if (!用户) return { 有效: false, 错误: { 有错误: true, 消息: `userdel：用户不存在：${名称}` } };
      return 包装({ 有效: true, 命令: "userdel", 用户, 选项: { 删除主目录, 强制 } });
    }

    case "groupdel": {
      let 名称 = null;
      for (const 参数 of 参数组) {
        if (参数.startsWith("-")) return { 有效: false, 错误: { 有错误: true, 消息: `groupdel：无效参数 ${参数}\n用法：groupdel <组名>` } };
        if (!名称) 名称 = 参数;
        else return { 有效: false, 错误: { 有错误: true, 消息: "groupdel：参数过多\n用法：groupdel <组名>" } };
      }
      if (!名称) return { 有效: false, 错误: { 有错误: true, 消息: "groupdel：缺少组名\n用法：groupdel <组名>" } };
      if (!面板组组.some((g) => g.名称 === 名称)) return { 有效: false, 错误: { 有错误: true, 消息: `groupdel：组不存在：${名称}` } };
      return 包装({ 有效: true, 命令: "groupdel", 组名: 名称 });
    }
  }
}

// ==================== 撤销 ====================
// 序列化整棵节点树为纯数据（不含循环引用）
function 创建快照() {
  function 序列化节点(节点) {
    return {
      id: 节点.id,
      类型: 节点.类型,
      名称: 节点.名称,
      权限: { ...节点.权限 },
      所有者: 节点.所有者,
      所属组: 节点.所属组,
      x: 节点.x,
      y: 节点.y,
      固定位置: 节点.固定位置,
      是主目录: 节点.是主目录,
      子节点组: 节点.子节点组.map(序列化节点),
    };
  }
  return {
    根节点: 根节点 ? 序列化节点(根节点) : null,
    当前位置ID: 当前位置节点 ? 当前位置节点.id : null,
    下一节点ID: 下一节点ID,
    全局层级计数器: 全局层级计数器,
  };
}

// 从快照重建节点树
function 恢复快照(快照) {
  if (!快照.根节点) return;
  节点表.clear();

  function 重建节点(数据, 父节点) {
    const 节点 = {
      id: 数据.id,
      类型: 数据.类型,
      名称: 数据.名称,
      父节点,
      子节点组: [],
      x: 数据.x,
      y: 数据.y,
      宽: 0,
      高: 0,
      层级: 全局层级计数器++,
      权限: { ...数据.权限 },
      所有者: 数据.所有者 || "",
      所属组: 数据.所属组 || "",
      动画: null,
      尺寸动画: null,
      删除动画: null,
      当前位置动画: null,
      当前位置过渡: 0,
      是当前位置: false,
      是主目录: 数据.是主目录,
      被拖拽: false,
      固定位置: 数据.固定位置,
      拖拽偏移X: 0,
      拖拽偏移Y: 0,
    };
    节点表.set(节点.id, 节点);
    for (const 子数据 of 数据.子节点组) {
      节点.子节点组.push(重建节点(子数据, 节点));
    }
    return 节点;
  }

  根节点 = 重建节点(快照.根节点, null);
  当前位置节点 = 快照.当前位置ID !== null ? 节点表.get(快照.当前位置ID) || 根节点 : 根节点;
  当前位置节点.是当前位置 = true;
  当前位置节点.当前位置过渡 = 1;
  下一节点ID = 快照.下一节点ID;
  更新主目录();
}

// Ctrl+Z 撤销上一条命令或鼠标操作
function 撤销() {
  if (撤销栈.length === 0) return;
  const 条目 = 撤销栈.pop();
  恢复快照(条目.快照);
  // 仅命令来源的撤销才从历史记录中删除上一条
  if (条目.来自命令 && 命令记录组.length > 0) 命令记录组.pop();
  错误提示组 = [];
  更新主目录();
  更新提示符();
  布局并动画();
  请求重绘();
}

function 执行命令() {
  const 输入 = 命令输入框.value;
  if (!输入.trim()) return;

  // 加入历史
  命令历史.push(输入);
  if (命令历史.length > 10) 命令历史.shift();
  历史索引 = -1;
  临时输入 = "";

  // 在解析前创建快照（解析阶段可能已修改树，如 mkdir -p 创建中间目录）
  const 快照 = 创建快照();

  const 解析 = 解析命令(输入);
  命令输入框.value = "";
  更新命令高亮(); // 同步清空高亮层

  // 记录命令（无论对错）
  const 命令正确 = 解析.有效 || !!解析.静默忽略;
  命令记录组.push({ 命令: 输入, 正确: 命令正确 });

  if (!解析.有效) {
    if (解析.静默忽略) {
      if (解析.消息) 显示警告(解析.消息);
      更新提示符();
      return;
    }
    if (解析.错误) {
      显示错误(解析.错误.消息);
    }
    return;
  }

  switch (解析.命令) {
    case "cd": {
      const 权限错误 = 解析.提权 ? null : 检查cd错误(解析.目标);
      if (权限错误) {
        显示错误(权限错误 + "\n提示：可使用 sudo 提权执行");
        break;
      }
      执行cd(解析.目标);
      break;
    }
    case "chmod": {
      const 权限错误 = 解析.提权 ? null : 检查chmod错误(解析.目标);
      if (权限错误) {
        显示错误(权限错误 + "\n提示：可使用 sudo 提权执行");
        break;
      }
      执行chmod(解析.目标, 解析.数字模式, 解析.符号语句组, 解析.递归);
      break;
    }
    case "mkdir": {
      if (解析.静默忽略) break; // -p 模式下已存在则静默成功
      // 多目录支持：逐个校验并执行
      for (const 任务 of 解析.创建任务组) {
        const 权限错误 = 解析.提权 ? null : 检查目录写权限错误("mkdir", 任务.父节点);
        if (权限错误) {
          显示错误(权限错误 + "\n提示：可使用 sudo 提权执行");
          break;
        }
        执行mkdir(任务.名称, 任务.父节点);
      }
      break;
    }
    case "rmdir": {
      // 多目标支持：逐个校验并执行
      for (const 目标 of 解析.目标组) {
        const 权限错误 = 解析.提权 ? null : 目标.父节点 ? 检查目录写权限错误("rmdir", 目标.父节点) : null;
        if (权限错误) {
          显示错误(权限错误 + "\n提示：可使用 sudo 提权执行");
          break;
        }
        执行rmdir(目标);
      }
      break;
    }
    case "rm": {
      // 多目标支持：逐个校验并执行
      for (const 任务 of 解析.目标组) {
        const 权限错误 = 解析.提权 ? null : 检查rm错误(任务.目标, 任务.递归);
        if (权限错误) {
          显示错误(权限错误 + "\n提示：可使用 sudo 提权执行");
          break;
        }
        执行rm(任务.目标, 任务.递归);
      }
      break;
    }
    case "touch": {
      // 多目标支持：逐个校验并执行
      for (const 任务 of 解析.创建任务组) {
        const 权限错误 = 解析.提权 ? null : 检查目录写权限错误("touch", 任务.父节点);
        if (权限错误) {
          显示错误(权限错误 + "\n提示：可使用 sudo 提权执行");
          break;
        }
        执行touch(任务.名称, 任务.父节点);
      }
      break;
    }
    case "cp": {
      if (解析.警告消息) 显示警告(解析.警告消息);
      for (const 任务 of 解析.任务组) {
        const 权限错误 = 解析.提权 ? null : 检查cp错误(任务.源, 解析.目标父节点, 解析.递归);
        if (权限错误) {
          显示错误(权限错误 + "\n提示：可使用 sudo 提权执行");
          break;
        }
        执行cp(任务.源, 解析.目标父节点, 任务.新名称, 解析.递归);
      }
      break;
    }
    case "mv": {
      for (const 任务 of 解析.任务组) {
        const 权限错误 = 解析.提权 ? null : 检查mv错误(任务.源, 解析.目标父节点);
        if (权限错误) {
          显示错误(权限错误 + "\n提示：可使用 sudo 提权执行");
          break;
        }
        执行mv(任务.源, 解析.目标父节点, 任务.新名称);
      }
      break;
    }
    case "useradd": {
      执行useradd(解析.名称, 解析.选项);
      break;
    }
    case "su": {
      执行su(解析.目标用户, 解析.切换主目录);
      break;
    }
    case "usermod": {
      执行usermod(解析.用户, 解析.选项);
      break;
    }
    case "userdel": {
      执行userdel(解析.用户, 解析.选项);
      break;
    }
    case "groupdel": {
      执行groupdel(解析.组名);
      break;
    }
  }

  // 执行成功（无错误提示）则压入撤销栈，否则丢弃快照
  if (错误提示组.length === 0) {
    撤销栈.push({ 快照, 来自命令: true });
  }

  更新提示符();
}

// ==================== 权限检查 ====================
// 本工具将操作者视为文件属主，所有命令按 u（属主）类权限校验
// 属主是否拥有某个权限位
function 属主有位(节点, 位) {
  return (节点.权限.u & 位) === 位;
}

// 从根到目标节点路径上逐个检查目录的进入（x）权限
// 返回第一个缺少 x 的目录，null 表示整条路径可通行
function 找不可进入目录(目标节点) {
  for (const 节点 of 获取祖先路径(目标节点)) {
    if (!属主有位(节点, 0b1)) return 节点;
  }
  return null;
}

// 把节点转为绝对路径文本（用于错误提示）
function 节点路径文本(节点) {
  const 路径组 = 获取祖先路径(节点);
  if (路径组.length === 1) return "/"; // 根目录自身
  return (
    "/" +
    路径组
      .slice(1)
      .map((n) => n.名称)
      .join("/")
  );
}

// cd：目标目录及沿途所有祖先目录都需要 x 权限
function 检查cd错误(目标节点) {
  const 拦截 = 找不可进入目录(目标节点);
  if (拦截) {
    return `cd：权限不足：${节点路径文本(拦截)}\n目录缺少 x（执行）权限，无法进入`;
  }
  return null;
}

// 在目录内新建/删除条目：该目录（含祖先路径）需要 x，自身还需要 w
function 检查目录写权限错误(命令, 父节点) {
  const 拦截 = 找不可进入目录(父节点);
  if (拦截) {
    return `${命令}：权限不足：${节点路径文本(拦截)}\n目录缺少 x（执行）权限，无法进入`;
  }
  if (!属主有位(父节点, 0b10)) {
    return `${命令}：权限不足：${节点路径文本(父节点)}\n目录缺少 w（写入）权限`;
  }
  return null;
}

// rm：父目录需要 w+x；递归删除时子树内每个含子项的目录都需要 w+x（用于清空其内容）
function 检查rm错误(目标节点, 递归) {
  if (目标节点.父节点) {
    const 错误 = 检查目录写权限错误("rm", 目标节点.父节点);
    if (错误) return 错误;
  }
  if (递归 && 目标节点.类型 === "目录") {
    const 待查目录组 = [];
    (function 收集目录(节点) {
      for (const 子节点 of 节点.子节点组) {
        if (子节点.类型 === "目录") {
          待查目录组.push(子节点);
          收集目录(子节点);
        }
      }
    })(目标节点);
    for (const 目录 of [目标节点, ...待查目录组]) {
      if (目录.子节点组.length === 0) continue; // 空目录无需清空
      if (!属主有位(目录, 0b11)) {
        return `rm：权限不足：${节点路径文本(目录)}\n目录缺少 w（写入）或 x（执行）权限，无法清空其内容`;
      }
    }
  }
  if (递归 && !属主有位(目标节点, 0b1)) {
    return `rm：权限不足：${节点路径文本(目标节点)}\n目录缺少 x（执行）权限，无法递归遍历其内容`;
  }
  return null;
}

// cp：源需要可读（文件 r；目录 r+x），目标父目录需要 w+x
function 检查cp错误(源节点, 目标父节点, 递归) {
  if (源节点.父节点) {
    const 拦截 = 找不可进入目录(源节点.父节点);
    if (拦截) {
      return `cp：权限不足：${节点路径文本(拦截)}\n目录缺少 x（执行）权限，无法读取源文件`;
    }
  }
  if (源节点.类型 === "目录" && 递归) {
    // 递归复制要读取子树内每个节点：都需要 r；目录含子项时还需要 x 才能访问其内容
    const 待查组 = [];
    (function 收集(节点) {
      待查组.push(节点);
      for (const 子节点 of 节点.子节点组) 收集(子节点);
    })(源节点);
    for (const 节点 of 待查组) {
      const 缺读 = !属主有位(节点, 0b100);
      const 缺搜索 = 节点.类型 === "目录" && 节点.子节点组.length > 0 && !属主有位(节点, 0b1);
      if (缺读 || 缺搜索) {
        return `cp：权限不足：${节点路径文本(节点)}\n缺少 r（读取）${节点.类型 === "目录" ? "或 x（执行）" : ""}权限，无法复制`;
      }
    }
  } else if (!属主有位(源节点, 0b100)) {
    return `cp：权限不足：${节点路径文本(源节点)}\n文件缺少 r（读取）权限，无法复制`;
  }
  return 检查目录写权限错误("cp", 目标父节点);
}

// mv：源父目录与目标父目录都需要 w+x（重命名语义，不检查源自身权限）
function 检查mv错误(源节点, 目标父节点) {
  if (源节点.父节点) {
    const 错误 = 检查目录写权限错误("mv", 源节点.父节点);
    if (错误) return 错误;
  }
  return 检查目录写权限错误("mv", 目标父节点);
}

// chmod：需要读取并改写目标自身，需目标 r+w（属主位）
function 检查chmod错误(目标节点) {
  if (!属主有位(目标节点, 0b110)) {
    return `chmod：权限不足：${节点路径文本(目标节点)}\n缺少 r（读取）或 w（写入）权限，无法修改权限`;
  }
  return null;
}

// 获取节点的祖先路径（从根到该节点）
function 获取祖先路径(节点) {
  const 路径 = [];
  let 当前 = 节点;
  while (当前) {
    路径.unshift(当前);
    当前 = 当前.父节点;
  }
  return 路径;
}

// 查找两个节点的最近共同祖先
function 查找共同祖先(节点A, 节点B) {
  const 路径A = 获取祖先路径(节点A);
  const 路径B = 获取祖先路径(节点B);
  let 共同祖先 = null;
  for (let i = 0; i < Math.min(路径A.length, 路径B.length); i++) {
    if (路径A[i] === 路径B[i]) {
      共同祖先 = 路径A[i];
    } else {
      break;
    }
  }
  return 共同祖先;
}

function 执行cd(目标节点) {
  if (当前位置节点 === 目标节点) return;

  const 起始节点 = 当前位置节点;

  // 构建路径段：从起始节点向上到共同祖先，再向下到目标节点
  const 路径段组 = [];
  if (起始节点) {
    const 共同祖先 = 查找共同祖先(起始节点, 目标节点);

    // 从起始节点向上到共同祖先（不含共同祖先）
    let 当前 = 起始节点;
    while (当前 !== 共同祖先 && 当前.父节点) {
      路径段组.push({ 从: 当前.父节点, 到: 当前, 反向: true }); // 反向=向上
      当前 = 当前.父节点;
    }

    // 从共同祖先向下到目标节点
    const 目标路径 = 获取祖先路径(目标节点);
    const 共同祖先索引 = 目标路径.indexOf(共同祖先);
    for (let i = 共同祖先索引; i < 目标路径.length - 1; i++) {
      路径段组.push({ 从: 目标路径[i], 到: 目标路径[i + 1], 反向: false }); // 正向=向下
    }
  }

  // 移除旧高亮
  if (当前位置节点) {
    const 旧节点 = 当前位置节点;
    旧节点.当前位置动画 = 创建补间(旧节点.当前位置过渡, 0, 配置.动画时长);
    旧节点.是当前位置 = false;
  }

  // 设置新高亮
  当前位置节点 = 目标节点;
  目标节点.是当前位置 = true;
  目标节点.当前位置过渡 = 0;
  目标节点.当前位置动画 = 创建补间(0, 1, 配置.动画时长);

  // 添加 cd 滑动动画（沿连接线贝塞尔曲线）
  if (起始节点 && 路径段组.length > 0) {
    // 预计算每段的贝塞尔参数和长度
    const 段参数组 = 路径段组.map((段) => {
      // 计算连接线参数（始终用父→子的方向）
      const 参数 = 计算连接线参数(段.从, 段.到);
      // 如果是反向（向上），交换起点终点和控制点
      if (段.反向) {
        return {
          起点X: 参数.终点X,
          起点Y: 参数.终点Y,
          控制点1X: 参数.控制点2X,
          控制点1Y: 参数.控制点2Y,
          控制点2X: 参数.控制点1X,
          控制点2Y: 参数.控制点1Y,
          终点X: 参数.起点X,
          终点Y: 参数.起点Y,
        };
      }
      return 参数;
    });

    // 计算每段的近似长度（用于均分时间）
    const 段长度组 = 段参数组.map((参数) => {
      // 用采样点估算贝塞尔曲线长度
      let 长度 = 0;
      let 前一点 = { x: 参数.起点X, y: 参数.起点Y };
      for (let i = 1; i <= 10; i++) {
        const t = i / 10;
        const 点 = 计算贝塞尔点(
          t,
          参数.起点X,
          参数.起点Y,
          参数.控制点1X,
          参数.控制点1Y,
          参数.控制点2X,
          参数.控制点2Y,
          参数.终点X,
          参数.终点Y,
        );
        长度 += Math.hypot(点.x - 前一点.x, 点.y - 前一点.y);
        前一点 = 点;
      }
      return 长度;
    });

    const 总长度 = 段长度组.reduce((sum, len) => sum + len, 0);

    // 清除之前的 cd 动画，只保留最新的
    cd动画组.length = 0;
    cd动画组.push({
      起始时间: performance.now(),
      段参数组,
      段长度组,
      总长度,
    });
  }

  // 添加波纹效果
  波纹组.push({
    x: 目标节点.x,
    y: 目标节点.y,
    起始时间: performance.now(),
    最大半径: 配置.高亮.波纹最大半径,
  });

  布局并动画();
  更新提示符();
}

// 为新节点寻找不重叠且尽量靠近参考节点的位置
function 寻找近处空位(参考节点, 新宽, 新高) {
  if (!根节点) return { x: 参考节点.x, y: 参考节点.y };
  const 所有节点 = 收集所有节点(根节点);
  const 间距 = 配置.布局.子节点垂直间距;
  const 步长 = 新高 + 间距;
  const 基准X = 参考节点.x + 参考节点.宽 / 2 + 配置.布局.子节点水平间距 + 新宽 / 2;
  const 基准Y = 参考节点.y;

  const 有重叠 = (x, y) => {
    for (const 节点 of 所有节点) {
      if (节点.删除动画) continue;
      if (!节点.宽) 测量节点尺寸(节点);
      const 水平重叠 = Math.abs(x - 节点.x) < (新宽 + 节点.宽) / 2 + 间距 * 0.5;
      const 垂直重叠 = Math.abs(y - 节点.y) < (新高 + 节点.高) / 2 + 间距 * 0.5;
      if (水平重叠 && 垂直重叠) return true;
    }
    return false;
  };

  // 从参考节点 y 开始，逐步向上下两侧扫描最近的空位
  for (let k = 0; k < 200; k++) {
    const 偏移组 = k === 0 ? [0] : [k * 步长, -k * 步长];
    for (const 偏移 of 偏移组) {
      const x = 基准X;
      const y = 基准Y + 偏移;
      if (!有重叠(x, y)) return { x, y };
    }
  }
  return { x: 基准X, y: 基准Y };
}

function 执行mkdir(名称, 父节点 = 当前位置节点) {
  const 新节点 = 创建节点("目录", 名称, 父节点);
  测量节点尺寸(新节点);
  // 寻找不重叠且靠近父节点的位置
  const 空位 = 寻找近处空位(父节点, 新节点.宽, 新节点.高);
  新节点.x = 空位.x;
  新节点.y = 空位.y;
  新节点.固定位置 = true; // 固定位置，不参与自动布局
  父节点.子节点组.push(新节点);
  节点表.set(新节点.id, 新节点);
  更新主目录();
  布局并动画();
}

function 执行rmdir(目标节点) {
  目标节点.删除动画 = 创建补间(0, 1, 配置.动画时长);
  // 延迟后真正从树中移除
  setTimeout(() => {
    if (目标节点.父节点) {
      const 索引 = 目标节点.父节点.子节点组.indexOf(目标节点);
      if (索引 > -1) 目标节点.父节点.子节点组.splice(索引, 1);
    }
    节点表.delete(目标节点.id);
    更新主目录();
    布局并动画();
    更新提示符();
  }, 配置.动画时长);
  布局并动画();
}

// 点击节点右上角删除按钮：递归删除节点及其各级子节点（无需考虑权限，一定可以删除）
function 点击删除节点(节点) {
  if (!节点.父节点 || 节点.删除动画) return; // 根目录及删除中的节点不可删

  // 删除前创建快照用于撤销（必须在 cd 之前，否则快照里的当前位置会被改变）
  撤销栈.push({ 快照: 创建快照(), 来自命令: false });

  // 当前位置若处于被删子树内，先回到被删节点的父目录
  if (当前位置节点) {
    let 当前 = 当前位置节点;
    let 在子树内 = false;
    while (当前) {
      if (当前 === 节点) {
        在子树内 = true;
        break;
      }
      当前 = 当前.父节点;
    }
    if (在子树内) 执行cd(节点.父节点);
  }

  悬停删除节点 = null;
  悬停权限字母 = null;
  执行rm(节点, true);
}

function 执行rm(目标节点, 递归) {
  const 待删除 = [];
  function 收集删除节点(节点) {
    待删除.push(节点);
    for (const 子节点 of 节点.子节点组) {
      收集删除节点(子节点);
    }
  }
  收集删除节点(目标节点);

  for (const 节点 of 待删除) {
    节点.删除动画 = 创建补间(0, 1, 配置.动画时长);
  }

  setTimeout(() => {
    for (const 节点 of 待删除) {
      if (节点.父节点) {
        const 索引 = 节点.父节点.子节点组.indexOf(节点);
        if (索引 > -1) 节点.父节点.子节点组.splice(索引, 1);
      }
      节点表.delete(节点.id);
    }
    更新主目录();
    布局并动画();
    更新提示符();
  }, 配置.动画时长);
  布局并动画();
}

function 执行touch(名称, 父节点 = 当前位置节点) {
  const 新节点 = 创建节点("文件", 名称, 父节点);
  测量节点尺寸(新节点);
  // 寻找不重叠且靠近当前节点的位置
  const 空位 = 寻找近处空位(父节点, 新节点.宽, 新节点.高);
  新节点.x = 空位.x;
  新节点.y = 空位.y;
  新节点.固定位置 = true; // 固定位置，不参与自动布局
  父节点.子节点组.push(新节点);
  节点表.set(新节点.id, 新节点);
  布局并动画();
}

// 深拷贝子树（用于 cp 递归复制目录），每个节点都寻找不重叠的空位
function 克隆子树(源节点, 新父节点) {
  const 新节点 = 创建节点(源节点.类型, 源节点.名称, 新父节点);
  新节点.权限 = { ...源节点.权限 }; // cp 保留源权限
  测量节点尺寸(新节点);
  const 空位 = 寻找近处空位(新父节点, 新节点.宽, 新节点.高);
  新节点.x = 空位.x;
  新节点.y = 空位.y;
  新节点.固定位置 = true;
  节点表.set(新节点.id, 新节点);
  新父节点.子节点组.push(新节点);
  for (const 子 of 源节点.子节点组) {
    克隆子树(子, 新节点);
  }
  return 新节点;
}

function 执行cp(源节点, 目标父节点, 新名称, 递归) {
  if (源节点.类型 === "目录" && 递归) {
    // 递归复制整个子树（保留源权限）
    const 新节点 = 创建节点("目录", 新名称, 目标父节点);
    新节点.权限 = { ...源节点.权限 };
    测量节点尺寸(新节点);
    const 空位 = 寻找近处空位(目标父节点, 新节点.宽, 新节点.高);
    新节点.x = 空位.x;
    新节点.y = 空位.y;
    新节点.固定位置 = true;
    节点表.set(新节点.id, 新节点);
    目标父节点.子节点组.push(新节点);
    for (const 子 of 源节点.子节点组) {
      克隆子树(子, 新节点);
    }
  } else {
    // 复制单个文件（保留源权限）
    const 新节点 = 创建节点("文件", 新名称, 目标父节点);
    新节点.权限 = { ...源节点.权限 };
    测量节点尺寸(新节点);
    const 空位 = 寻找近处空位(目标父节点, 新节点.宽, 新节点.高);
    新节点.x = 空位.x;
    新节点.y = 空位.y;
    新节点.固定位置 = true;
    目标父节点.子节点组.push(新节点);
    节点表.set(新节点.id, 新节点);
  }
  // 添加波纹效果提示操作成功
  波纹组.push({
    x: 目标父节点.x,
    y: 目标父节点.y,
    起始时间: performance.now(),
    最大半径: 配置.高亮.波纹最大半径,
  });
  更新主目录();
  布局并动画();
}

function 执行mv(源节点, 目标父节点, 新名称) {
  // 从原父节点移除
  const 原父节点 = 源节点.父节点;
  if (原父节点) {
    const 索引 = 原父节点.子节点组.indexOf(源节点);
    if (索引 > -1) 原父节点.子节点组.splice(索引, 1);
  }
  // 更新父节点和名称，但保持位置不动，只更新连接线
  源节点.父节点 = 目标父节点;
  源节点.名称 = 新名称;
  // 保持固定位置，不触发自动布局移动
  源节点.固定位置 = true;
  源节点.动画 = null;
  目标父节点.子节点组.push(源节点);
  // 后代也保持固定位置
  const 保持后代 = (节点) => {
    for (const 子 of 节点.子节点组) {
      子.固定位置 = true;
      子.动画 = null;
      保持后代(子);
    }
  };
  保持后代(源节点);
  // 添加波纹效果
  波纹组.push({
    x: 目标父节点.x,
    y: 目标父节点.y,
    起始时间: performance.now(),
    最大半径: 配置.高亮.波纹最大半径,
  });
  更新主目录();
  请求重绘();
}

// ==================== chmod ====================
// 将符号模式的一条语句应用到单个节点
function 应用符号语句到节点(节点, 语句) {
  // 目标权限类（a 表示全部：ugo）
  const 类组 = [];
  if (语句.谁.includes("a")) {
    类组.push("u", "g", "o");
  } else {
    if (语句.谁.includes("u")) 类组.push("u");
    if (语句.谁.includes("g")) 类组.push("g");
    if (语句.谁.includes("o")) 类组.push("o");
  }

  // 计算该语句对应的权限位
  // X：仅当目标是目录、或该文件任一类别已有执行权限时才视为 x
  let 位 = 0;
  for (const 字符 of 语句.字符集) {
    if (字符 === "r") 位 |= 4;
    else if (字符 === "w") 位 |= 2;
    else if (字符 === "x") 位 |= 1;
    else if (字符 === "X") {
      const 是目录 = 节点.类型 === "目录";
      const 任一可执行 = 节点.权限.u & 1 || 节点.权限.g & 1 || 节点.权限.o & 1;
      if (是目录 || 任一可执行) 位 |= 1;
    }
  }

  for (const 类 of 类组) {
    if (语句.操作 === "+") {
      节点.权限[类] = (节点.权限[类] | 位) & 7;
    } else if (语句.操作 === "-") {
      节点.权限[类] = 节点.权限[类] & ~位 & 7;
    } else {
      // "="：精确设置（未列出的权限被清除）
      节点.权限[类] = 位;
    }
  }
}

function 执行chmod(目标节点, 数字模式, 符号语句组, 递归) {
  // -R 递归应用于目标及其所有后代，否则仅目标自身
  const 目标组 = 递归 ? 收集所有节点(目标节点) : [目标节点];

  for (const 节点 of 目标组) {
    if (数字模式) {
      节点.权限 = { u: 数字模式.u, g: 数字模式.g, o: 数字模式.o };
    } else {
      // 符号模式：按语句顺序依次应用（前面的语句可能影响后续 X 的判断）
      for (const 语句 of 符号语句组) {
        应用符号语句到节点(节点, 语句);
      }
    }
  }

  // 添加波纹效果提示操作成功
  波纹组.push({
    x: 目标节点.x,
    y: 目标节点.y,
    起始时间: performance.now(),
    最大半径: 配置.高亮.波纹最大半径,
  });
  请求重绘();
}

function 显示错误(消息) {
  // 新错误立刻替换正在显示的错误（无论旧错误处于显示还是消失阶段）
  错误提示组 = [
    {
      消息,
      阶段: "显示",
      开始时间: performance.now(),
    },
  ];
  请求重绘();
}

function 显示警告(消息) {
  // 新警告立刻替换正在显示的提示（与错误行为一致，避免逐条闪烁）
  错误提示组 = [
    {
      消息,
      类型: "警告",
      阶段: "显示",
      开始时间: performance.now(),
    },
  ];
  请求重绘();
}

function 显示成功(消息) {
  // 绿色成功提示，行为与错误/警告一致
  错误提示组 = [
    {
      消息,
      类型: "成功",
      阶段: "显示",
      开始时间: performance.now(),
    },
  ];
  请求重绘();
}

// ==================== 用户与组命令 ====================
// 同步重绘：用户和组面板 + 主目录标记 + 主画布布局/提示符
function 同步用户组界面() {
  绘制用户和组面板();
  更新主目录();
  布局并动画();
  请求重绘();
  更新提示符();
}

// 在 home 目录下创建主目录（所有者=用户名，所属组=主组），返回节点或 null
function 创建用户主目录节点(用户名, 组名) {
  const home目录 = 查找home目录();
  if (!home目录) return null;
  if (home目录.子节点组.some((n) => n.名称 === 用户名)) return null; // 已存在
  const 节点 = 创建节点("目录", 用户名, home目录);
  节点.所有者 = 用户名;
  节点.所属组 = 组名 || 用户名;
  测量节点尺寸(节点);
  const 空位 = 寻找近处空位(home目录, 节点.宽, 节点.高);
  节点.x = 空位.x;
  节点.y = 空位.y;
  节点.固定位置 = true;
  home目录.子节点组.push(节点);
  节点表.set(节点.id, 节点);
  return 节点;
}

function 执行useradd(名称, 选项) {
  // -m：同步创建主目录；未指定 -m 时仅登记用户信息
  let 主目录 = "/home/" + 名称;
  if (选项.创建主目录) {
    const 节点 = 创建用户主目录节点(名称, 名称);
    if (节点) 主目录 = "/home/" + 名称;
  }
  面板用户组.push({ 名称, 主组: 名称, 附加组组: [], 主目录, 登录shell: 选项.登录shell || 默认登录shell });
  同步用户组界面();
}

function 执行su(目标用户, 切换主目录) {
  const 目标主目录节点 = 查找用户主目录节点(目标用户.名称);
  if (切换主目录 && !目标主目录节点) {
    显示错误(`su：${目标用户.名称} 的主目录不存在：/home/${目标用户.名称}`);
    return;
  }
  面板当前用户 = 目标用户.名称;
  // 主目录标记与 ~ 指向新用户
  更新主目录();
  // 更新"当前用户"高亮与连线
  绘制用户和组面板();
  // 有 "-" 时切换当前目录到该用户主目录；无 "-" 保持当前目录
  if (切换主目录) {
    执行cd(目标主目录节点);
  } else {
    布局并动画();
    请求重绘();
    更新提示符();
  }
}

// 按用户名查找其主目录节点（/home/用户名）
function 查找用户主目录节点(用户名) {
  const home目录 = 查找home目录();
  if (!home目录) return null;
  return home目录.子节点组.find((n) => n.类型 === "目录" && n.名称 === 用户名) || null;
}

// 将某用户的所有节点（所有者匹配）改属到新用户名/新主组
function 批量改属用户节点(旧用户名, 新用户名, 新主组) {
  for (const 节点 of 收集所有节点(根节点)) {
    if (节点.所有者 === 旧用户名) {
      节点.所有者 = 新用户名;
      节点.所属组 = 新主组;
    }
  }
}

function 执行usermod(用户, 选项) {
  const 旧名称 = 用户.名称;

  // -g：修改主组（先校验组存在）
  if (选项.主组) {
    if (!面板组组.some((g) => g.名称 === 选项.主组)) {
      显示错误(`usermod：组不存在：${选项.主组}`);
      return;
    }
    用户.主组 = 选项.主组;
  }

  // -l：修改用户名
  if (选项.新名称 && 选项.新名称 !== 旧名称) {
    if (面板用户组.some((u) => u.名称 === 选项.新名称)) {
      显示错误(`usermod：用户名已存在：${选项.新名称}`);
      return;
    }
    用户.名称 = 选项.新名称;
    // 同步同名主组
    const 组 = 面板组组.find((g) => g.名称 === 旧名称);
    if (组) 组.名称 = 选项.新名称;
  }

  // 更新节点归属（用户名/主组可能已变化）
  批量改属用户节点(旧名称, 用户.名称, 用户.主组);

  // -d：更新主目录路径（-m 时移动内容）
  if (选项.新主目录) {
    const 旧节点 = 查找用户主目录节点(旧名称);
    const 新路径 = 选项.新主目录;
    let 新节点 = 解析路径(新路径);
    if (选项.移动主目录) {
      // 移动原主目录内容到新位置
      if (旧节点 && 旧节点 !== 新节点) {
        if (!新节点) {
          // 目标不存在：确保父路径存在（自动补建缺失的中间目录），再移动并重命名原主目录节点
          const 父路径 = 新路径.slice(0, 新路径.lastIndexOf("/")) || "/";
          const 新名称 = 新路径.slice(新路径.lastIndexOf("/") + 1);
          let 父节点 = 确保目录路径(父路径);
          if (父节点 && !父节点.子节点组.some((n) => n.名称 === 新名称)) {
            const 原父 = 旧节点.父节点;
            if (原父) {
              const 索引 = 原父.子节点组.indexOf(旧节点);
              if (索引 > -1) 原父.子节点组.splice(索引, 1);
            }
            旧节点.父节点 = 父节点;
            旧节点.名称 = 新名称;
            父节点.子节点组.push(旧节点);
            新节点 = 旧节点;
          }
        } else if (新节点.类型 === "目录") {
          // 目标已存在：把原主目录内容移入
          for (const 子 of [...旧节点.子节点组]) {
            子.父节点 = 新节点;
            新节点.子节点组.push(子);
          }
          旧节点.子节点组 = [];
          // 删除旧主目录节点
          const 原父 = 旧节点.父节点;
          if (原父) {
            const 索引 = 原父.子节点组.indexOf(旧节点);
            if (索引 > -1) 原父.子节点组.splice(索引, 1);
          }
          节点表.delete(旧节点.id);
        }
      }
    } else {
      // 无 -m：仅更新登记的主目录路径，不创建/移动目录内容
    }
    用户.主目录 = 新路径;
  }

  // -s：修改登录shell（绿色提示）
  if (选项.登录shell) {
    用户.登录shell = 选项.登录shell;
    显示成功(`已将登录shell改为：${选项.登录shell}`);
  }

  同步用户组界面();
}

// 确保某绝对路径存在（逐段创建缺失目录，属主 root），返回末节点或 null
function 确保目录路径(绝对路径) {
  if (!绝对路径 || !绝对路径.startsWith("/")) return null;
  const 部分组 = 绝对路径.split("/").filter(Boolean);
  let 当前 = 根节点;
  for (const 名 of 部分组) {
    let 子 = 当前.子节点组.find((n) => n.名称 === 名 && n.类型 === "目录");
    if (!子) {
      子 = 创建节点("目录", 名, 当前);
      子.所有者 = "root";
      子.所属组 = "root";
      测量节点尺寸(子);
      const 空位 = 寻找近处空位(当前, 子.宽, 子.高);
      子.x = 空位.x;
      子.y = 空位.y;
      子.固定位置 = true;
      当前.子节点组.push(子);
      节点表.set(子.id, 子);
    }
    当前 = 子;
  }
  return 当前;
}

function 执行userdel(用户, 选项) {
  const 用户名 = 用户.名称;

  // 不能删除当前登录用户（除非 -f 强制）
  if (用户名 === 面板当前用户 && !选项.强制) {
    显示错误(`userdel：无法删除当前登录用户：${用户名}\n请先切换到其他用户，或使用 -f 强制删除`);
    return;
  }

  // -r：删除主目录；未加 -r 时若主目录非空给出警告
  const 主目录节点 = 查找用户主目录节点(用户名);
  if (选项.删除主目录) {
    if (主目录节点 && 主目录节点 !== 当前位置节点) {
      // 若当前目录在被删主目录内，先回到 home
      let 祖先 = 当前位置节点;
      let 在内部 = false;
      while (祖先) {
        if (祖先 === 主目录节点) { 在内部 = true; break; }
        祖先 = 祖先.父节点;
      }
      if (在内部) 执行cd(查找home目录() || 根节点);
      执行rm(主目录节点, true);
    }
  } else if (主目录节点 && 收集所有节点(主目录节点).length > 1) {
    显示警告(`userdel：主目录 /home/${用户名} 仍保留\n如要一并删除，请使用 -r 参数`);
  }

  // 从用户列表移除
  面板用户组 = 面板用户组.filter((u) => u !== 用户);
  // 删除同名主组
  面板组组 = 面板组组.filter((g) => g.名称 !== 用户名);
  // 从其他用户的附加组中移除该组
  for (const u of 面板用户组) u.附加组组 = u.附加组组.filter((g) => g !== 用户名);

  // 若被删的是当前用户（-f 强制），切换当前用户到剩余的第一个用户
  if (面板当前用户 === 用户名) {
    面板当前用户 = 面板用户组.length ? 面板用户组[0].名称 : "root";
  }

  同步用户组界面();
}

function 执行groupdel(组名) {
  // 有用户以该组作为主组：报错
  const 占用用户 = 面板用户组.filter((u) => u.主组 === 组名);
  if (占用用户.length) {
    显示错误(`groupdel：无法删除组 ${组名}：它是用户 ${占用用户.map((u) => u.名称).join("、")} 的主组`);
    return;
  }
  // 有用户把它作为附加组：删除成功但给出黄色警告
  const 附加占用 = 面板用户组.filter((u) => u.附加组组.includes(组名));
  let 警告 = null;
  if (附加占用.length) {
    警告 = `groupdel：已将组 ${组名} 从以下用户的附加组中移除：${附加占用.map((u) => u.名称).join("、")}`;
  }

  面板组组 = 面板组组.filter((g) => g.名称 !== 组名);
  for (const u of 面板用户组) u.附加组组 = u.附加组组.filter((g) => g !== 组名);

  同步用户组界面();
  if (警告) 显示警告(警告);
}

// ==================== 历史记录 ====================
function 处理键盘事件(事件) {
  // Ctrl+Z 撤销
  if (事件.key === "z" && (事件.ctrlKey || 事件.metaKey) && !事件.shiftKey) {
    事件.preventDefault();
    撤销();
    return;
  }

  if (事件.key === "Enter") {
    执行命令();
    return;
  }

  if (事件.key === "ArrowUp") {
    事件.preventDefault();
    if (命令历史.length === 0) return;
    if (历史索引 === -1) {
      临时输入 = 命令输入框.value;
      历史索引 = 命令历史.length - 1;
    } else if (历史索引 > 0) {
      历史索引--;
    }
    命令输入框.value = 命令历史[历史索引];
    更新命令高亮();
    return;
  }

  if (事件.key === "ArrowDown") {
    事件.preventDefault();
    if (历史索引 === -1) return;
    if (历史索引 < 命令历史.length - 1) {
      历史索引++;
      命令输入框.value = 命令历史[历史索引];
    } else {
      历史索引 = -1;
      命令输入框.value = 临时输入;
    }
    更新命令高亮();
    return;
  }
}

// ==================== 初始化 ====================
function 随机初始化() {
  根节点 = 创建节点("目录", "/", null);
  根节点.权限 = { u: 7, g: 5, o: 5 };
  节点表.clear();
  节点表.set(根节点.id, 根节点);

  const 已用名称 = new Set();
  const 所有目录组 = [根节点];

  // 先随机决定总层数：2-6（1 层 = 只有根目录）
  const 最大层数 = 2 + Math.floor(Math.random() * 5); // 2~6

  if (最大层数 >= 2) {
    const 根子节点数 = 2 + Math.floor(Math.random() * 2); // 2-3
    for (let i = 0; i < 根子节点数; i++) {
      const 名称 = 取随机名称(目录名称池, 已用名称);
      const 子目录 = 创建节点("目录", 名称, 根节点);
      子目录.权限 = 随机权限("目录");
      根节点.子节点组.push(子目录);
      节点表.set(子目录.id, 子目录);
      所有目录组.push(子目录);
    }

    // 逐层向下扩展
    let 当前层节点组 = [...根节点.子节点组];
    for (let 层 = 3; 层 <= 最大层数; 层++) {
      const 下一层节点组 = [];
      for (const 父节点 of 当前层节点组) {
        // 每个节点 60% 概率继续生子节点
        if (Math.random() > 0.4) {
          const 子节点数 = 1 + Math.floor(Math.random() * 2); // 1-2
          for (let j = 0; j < 子节点数; j++) {
            const 名称 = 取随机名称(目录名称池, 已用名称);
            const 子目录 = 创建节点("目录", 名称, 父节点);
            子目录.权限 = 随机权限("目录");
            父节点.子节点组.push(子目录);
            节点表.set(子目录.id, 子目录);
            所有目录组.push(子目录);
            下一层节点组.push(子目录);
          }
        }
      }
      if (下一层节点组.length === 0) break; // 该层没有节点，停止扩展
      当前层节点组 = 下一层节点组;
    }
  }

  // 随机分配文件到目录
  if (所有目录组.length > 1) {
    const 文件数 = 2 + Math.floor(Math.random() * 3); // 2-4
    for (let i = 0; i < 文件数; i++) {
      const 随机目录 = 所有目录组[Math.floor(Math.random() * 所有目录组.length)];
      const 文件名称 = 取随机名称(文件名称池, 已用名称);
      const 文件 = 创建节点("文件", 文件名称, 随机目录);
      文件.权限 = 随机权限("文件");
      随机目录.子节点组.push(文件);
      节点表.set(文件.id, 文件);
    }
  }

  // 随机选择当前位置
  当前位置节点 = 所有目录组[Math.floor(Math.random() * 所有目录组.length)];
  当前位置节点.是当前位置 = true;
  当前位置节点.当前位置过渡 = 1;

  // 随机分配所有者与所属组
  分配所有者和组(根节点);

  布局并动画();
  更新提示符();
}

function 仅根目录初始化() {
  根节点 = 创建节点("目录", "/", null);
  节点表.clear();
  节点表.set(根节点.id, 根节点);
  当前位置节点 = 根节点;
  根节点.是当前位置 = true;
  根节点.当前位置过渡 = 1;

  分配所有者和组(根节点);

  布局并动画();
  更新提示符();
}

// 在指定父节点下随机生成多层目录/文件子树；所有节点归属给定的所有者与所属组
// 当前层级从 1 开始；末层倾向生成文件，非末层倾向生成目录并按概率继续向下扩展
function 生成随机子树(父节点, 当前层级, 最大层级, 已用名称, 所有者, 所属组) {
  if (当前层级 > 最大层级) return;
  const 子节点数 = 1 + Math.floor(Math.random() * 3); // 1-3 个
  for (let i = 0; i < 子节点数; i++) {
    const 目录概率 = 当前层级 === 最大层级 ? 0.3 : 0.55;
    const 是目录 = Math.random() < 目录概率;
    const 名称池 = 是目录 ? 目录名称池 : 文件名称池;
    const 名称 = 取随机名称(名称池, 已用名称);
    const 子节点 = 创建节点(是目录 ? "目录" : "文件", 名称, 父节点);
    子节点.权限 = 随机权限(是目录 ? "目录" : "文件");
    子节点.所有者 = 所有者;
    子节点.所属组 = 所属组;
    父节点.子节点组.push(子节点);
    节点表.set(子节点.id, 子节点);
    if (是目录 && 当前层级 < 最大层级 && Math.random() < 0.6) {
      生成随机子树(子节点, 当前层级 + 1, 最大层级, 已用名称, 所有者, 所属组);
    }
  }
}

function 模拟真实初始化() {
  根节点 = 创建节点("目录", "/", null);
  节点表.clear();
  节点表.set(根节点.id, 根节点);

  // (2) 根目录与 home 目录归属 root:root（与真实系统一致）
  根节点.所有者 = "root";
  根节点.所属组 = "root";

  // (3) 根目录下仅生成 home（不再生成 bin/boot/dev 等其它一级目录）
  const home目录 = 创建节点("目录", "home", 根节点);
  根节点.子节点组.push(home目录);
  节点表.set(home目录.id, home目录);
  home目录.所有者 = "root";
  home目录.所属组 = "root";

  // (1) 为每个存在的用户生成主目录：名称=用户名，所属组=该用户的主组；
  //     当前用户的主目录即 ~ 对应的目录（展开主目录路径时据此动态解析）
  for (const 用户 of 面板用户组) {
    const 主目录节点 = 创建节点("目录", 用户.名称, home目录);
    home目录.子节点组.push(主目录节点);
    节点表.set(主目录节点.id, 主目录节点);
    主目录节点.所有者 = 用户.名称;
    主目录节点.所属组 = 用户.主组;
    if (用户.名称 === 面板当前用户) {
      主目录节点.是主目录 = true; // ~ 根据当前用户指向其主目录
    }

    // (4) 在该用户主目录下随机生成 1-4 层级的目录/文件
    const 最大层级 = 1 + Math.floor(Math.random() * 4); // 1-4
    生成随机子树(主目录节点, 1, 最大层级, new Set(), 用户.名称, 用户.主组);
  }

  // 默认进入当前用户的主目录（~）；若不存在则回退到 /home
  当前位置节点 = 查找主目录() || home目录;
  当前位置节点.是当前位置 = true;
  当前位置节点.当前位置过渡 = 1;

  // 已在生成时按用户分配所有者/组，不再随机分配
  布局并动画();
  更新提示符();
}

function 取随机名称(名称池, 已用名称) {
  const 可用名称组 = 名称池.filter((n) => !已用名称.has(n));
  if (可用名称组.length === 0) {
    const 随机名 = 名称池[Math.floor(Math.random() * 名称池.length)] + "_" + Math.floor(Math.random() * 100);
    已用名称.add(随机名);
    return 随机名;
  }
  const 名称 = 可用名称组[Math.floor(Math.random() * 可用名称组.length)];
  已用名称.add(名称);
  return 名称;
}

function 重置() {
  错误提示组 = [];
  波纹组 = [];
  cd动画组 = [];
  根节点 = null;
  当前位置节点 = null;
  节点表.clear();
  全局层级计数器 = 1; // 重置层级计数器
  视图偏移X = 0;
  视图偏移Y = 0;
  正在拖拽视图 = false;
  悬停删除节点 = null;
  按下删除节点 = null;
  悬停权限字母 = null;
  按下权限 = null;
  命令记录组 = [];
  撤销栈 = [];
  命令历史 = [];
  历史索引 = -1;
  临时输入 = "";

  // 清空命令输入框并同步高亮层
  命令输入框.value = "";
  更新命令高亮();

  const 选中模式 = document.querySelector('input[name="初始化模式"]:checked');
  const 模式 = 选中模式 ? 选中模式.value : "随机";

  // 保存到 localStorage
  localStorage.setItem("权限初始化模式", 模式);

  // 先初始化用户和组面板数据，确保节点树初始化时能获取到所有者/组数据
  初始化用户和组();

  if (模式 === "仅根目录") {
    仅根目录初始化();
  } else if (模式 === "模拟真实") {
    模拟真实初始化();
  } else {
    随机初始化();
  }
  错误提示组 = []; // 清空错误提示
}

// ==================== 启动时恢复设置 ====================
function 恢复初始化模式() {
  const 保存的模式 = localStorage.getItem("权限初始化模式");
  if (保存的模式) {
    const 单选按钮 = document.querySelector(`input[name="初始化模式"][value="${保存的模式}"]`);
    if (单选按钮) 单选按钮.checked = true;
  }
}

function 调整画布尺寸() {
  const 容器 = 画布.parentElement;
  画布宽 = 容器.clientWidth;
  画布高 = 容器.clientHeight;
  const dpr = window.devicePixelRatio || 1;
  画布.width = 画布宽 * dpr;
  画布.height = 画布高 * dpr;
  上下文.setTransform(dpr, 0, 0, dpr, 0, 0);
  // 窗体尺寸变化时仅更新画布，不重新布局，保持各节点当前位置
  请求重绘();
}

// 监听窗口尺寸变化，实时调整画布
window.addEventListener("resize", 调整画布尺寸);

// ==================== 历史记录 ====================
function 打开历史记录() {
  渲染历史记录表格();
  历史记录模态.classList.add("显示");
}

function 关闭历史记录() {
  历史记录模态.classList.remove("显示");
  聚焦命令输入框();
}

function 渲染历史记录表格() {
  历史记录表格体.innerHTML = "";
  if (命令记录组.length === 0) {
    const 空行 = document.createElement("tr");
    const 空单元格 = document.createElement("td");
    空单元格.colSpan = 3;
    空单元格.textContent = "暂无历史记录";
    空单元格.style.textAlign = "center";
    空单元格.style.color = "#666";
    空单元格.style.padding = "20px";
    空行.appendChild(空单元格);
    历史记录表格体.appendChild(空行);
    return;
  }
  命令记录组.forEach((记录, 索引) => {
    const 行 = document.createElement("tr");

    const 序号单元格 = document.createElement("td");
    序号单元格.textContent = 索引 + 1;
    行.appendChild(序号单元格);

    const 命令单元格 = document.createElement("td");
    命令单元格.innerHTML = 高亮命令语法(记录.命令);
    行.appendChild(命令单元格);

    const 结果单元格 = document.createElement("td");
    const 图标 = document.createElement("i");
    if (记录.正确) {
      图标.className = "fa-solid fa-check 结果图标-正确";
    } else {
      图标.className = "fa-solid fa-xmark 结果图标-错误";
    }
    结果单元格.appendChild(图标);
    行.appendChild(结果单元格);

    历史记录表格体.appendChild(行);
  });
}

function 导出历史记录() {
  let 内容 = "# 命令历史记录\n\n";
  内容 += "| 序号 | 命令 | 结果 |\n";
  内容 += "| --- | --- | --- |\n";
  命令记录组.forEach((记录, 索引) => {
    const 转义命令 = 记录.命令.replace(/\|/g, "\\|");
    内容 += `| ${索引 + 1} | ${转义命令} | ${记录.正确 ? "✅" : "❌"} |\n`;
  });
  const Blob对象 = new Blob([内容], { type: "text/markdown;charset=utf-8" });
  const 链接 = document.createElement("a");
  链接.href = URL.createObjectURL(Blob对象);
  链接.download = "命令历史记录.md";
  document.body.appendChild(链接);
  链接.click();
  document.body.removeChild(链接);
  URL.revokeObjectURL(链接.href);
}

历史记录按钮.addEventListener("click", 打开历史记录);
历史记录关闭按钮.addEventListener("click", 关闭历史记录);
历史记录导出按钮.addEventListener("click", 导出历史记录);
历史记录模态.addEventListener("click", (事件) => {
  if (事件.target === 历史记录模态) 关闭历史记录();
});

// ==================== 事件绑定 ====================
命令执行按钮.addEventListener("click", 执行命令);
命令输入框.addEventListener("keydown", 处理键盘事件);
命令输入框.addEventListener("input", 更新命令高亮);
// 同步输入框与高亮层的水平滚动位置，防止高亮层文本溢出
命令输入框.addEventListener("scroll", () => {
  命令高亮层.scrollLeft = 命令输入框.scrollLeft;
});
重置按钮.addEventListener("click", 重置);
画布.addEventListener("mousedown", 处理鼠标按下);
画布.addEventListener("mousemove", 处理鼠标移动);
画布.addEventListener("mouseup", 处理鼠标松开);
画布.addEventListener("mouseleave", 处理鼠标松开);

// ==================== 命令输入区拖拽 ====================
// 拖拽热区：边框向内 2px、向外 6px
const 命令输入区拖拽 = {
  激活: false,
  起始X: 0,
  起始Y: 0,
  偏移X: 0,
  偏移Y: 0,
  按下时宽: 0,
  按下时高: 0,
};

function 命令输入区热区判定(事件) {
  const 矩形 = 命令输入区.getBoundingClientRect();
  const 内边距 = 2;
  const x = 事件.clientX;
  const y = 事件.clientY;

  // 命令提示符区域始终可拖拽
  const 提示符矩形 = 命令提示符.getBoundingClientRect();
  if (x >= 提示符矩形.left && x <= 提示符矩形.right && y >= 提示符矩形.top && y <= 提示符矩形.bottom) {
    return true;
  }

  // 不在元素范围内
  if (x < 矩形.left || x > 矩形.right || y < 矩形.top || y > 矩形.bottom) {
    return false;
  }

  // 在上边框热区（向内 2px）
  if (y >= 矩形.top && y <= 矩形.top + 内边距) return true;
  // 在下边框热区（向内 2px）
  if (y >= 矩形.bottom - 内边距 && y <= 矩形.bottom) return true;
  // 在左边框热区（向内 2px）
  if (x >= 矩形.left && x <= 矩形.left + 内边距) return true;
  // 在右边框热区（向内 2px）
  if (x >= 矩形.right - 内边距 && x <= 矩形.right) return true;

  return false;
}

命令输入区.addEventListener("mousedown", (事件) => {
  if (事件.button !== 0) return; // 仅左键
  if (!命令输入区热区判定(事件)) return;

  // 阻止文本选择
  事件.preventDefault();

  const 矩形 = 命令输入区.getBoundingClientRect();
  命令输入区拖拽.激活 = true;
  命令输入区拖拽.起始X = 事件.clientX;
  命令输入区拖拽.起始Y = 事件.clientY;
  命令输入区拖拽.按下时宽 = 矩形.width;
  命令输入区拖拽.按下时高 = 矩形.height;
  // 记录元素左上角当前视口坐标作为拖拽基准
  命令输入区拖拽.基准X = 矩形.left;
  命令输入区拖拽.基准Y = 矩形.top;
  // 将 fixed 定位改为以当前位置为基准
  命令输入区.style.left = 矩形.left + "px";
  命令输入区.style.top = 矩形.top + "px";
  命令输入区.style.transform = "none";
  命令输入区.style.cursor = 'url("/Images/Common/鼠标-移动抓手.cur"), grabbing';
});

document.addEventListener("mousemove", (事件) => {
  if (!命令输入区拖拽.激活) return;

  const 视口宽 = window.innerWidth;
  const 视口高 = window.innerHeight;
  const 元素宽 = 命令输入区拖拽.按下时宽;
  const 元素高 = 命令输入区拖拽.按下时高;

  let 新X = 命令输入区拖拽.基准X + (事件.clientX - 命令输入区拖拽.起始X);
  let 新Y = 命令输入区拖拽.基准Y + (事件.clientY - 命令输入区拖拽.起始Y);

  // 限制在视口内：left 0 ~ 视口宽-元素宽，top 0 ~ 视口高-元素高
  新X = Math.max(0, Math.min(新X, 视口宽 - 元素宽));
  新Y = Math.max(0, Math.min(新Y, 视口高 - 元素高));

  命令输入区.style.left = 新X + "px";
  命令输入区.style.top = 新Y + "px";
});

document.addEventListener("mouseup", () => {
  if (!命令输入区拖拽.激活) return;
  命令输入区拖拽.激活 = false;
  命令输入区.style.cursor = "";
});

// 热区悬停时光标提示可拖拽
命令输入区.addEventListener("mousemove", (事件) => {
  if (命令输入区拖拽.激活) return;
  if (命令输入区热区判定(事件)) {
    命令输入区.style.cursor = 'url("/Images/Common/鼠标-移动抓手.cur"), grab';
  } else {
    命令输入区.style.cursor = "";
  }
});

// 在指定区域松开鼠标后自动聚焦命令输入框
function 聚焦命令输入框() {
  命令输入框.focus();
}
重置按钮.addEventListener("mouseup", 聚焦命令输入框);
画布.addEventListener("mouseup", 聚焦命令输入框);
document.querySelector(".设置区").addEventListener("mouseup", 聚焦命令输入框);

// Ctrl 键：拖拽中按下/松开时，实时切换子节点是否跟随
window.addEventListener("keydown", (事件) => {
  // Ctrl+Z 撤销（全局，输入框未聚焦时也可触发）
  if (事件.key === "z" && (事件.ctrlKey || 事件.metaKey) && !事件.shiftKey && document.activeElement !== 命令输入框) {
    事件.preventDefault();
    撤销();
    return;
  }
  if (事件.key === "Control" && 拖拽节点 && 拖拽节点.被拖拽 && !拖拽时按住Ctrl) {
    拖拽时按住Ctrl = true;
    更新拖拽跟随组();
  }
});
window.addEventListener("keyup", (事件) => {
  if (事件.key === "Control" && 拖拽时按住Ctrl) {
    拖拽时按住Ctrl = false;
    if (拖拽节点 && 拖拽节点.被拖拽) 更新拖拽跟随组();
  }
});

// 单选按钮变化时立即保存到 localStorage
document.querySelectorAll('input[name="初始化模式"]').forEach((单选按钮) => {
  单选按钮.addEventListener("change", () => {
    localStorage.setItem("权限初始化模式", 单选按钮.value);
  });
});

// 权限模式单选按钮变化时重新布局（节点高度随模式自适应）并保存到 localStorage
document.querySelectorAll('input[name="权限模式"]').forEach((单选按钮) => {
  单选按钮.addEventListener("change", () => {
    localStorage.setItem("权限显示模式", 单选按钮.value);
    // 清除可能残留的字母模式悬停/按下状态（数字模式无可点击字母）
    悬停权限字母 = null;
    按下权限 = null;
    布局并动画();
  });
});

// "突出生效权限"复选框：状态保存到 localStorage，变化时仅重绘（不改变布局）
突出生效权限复选框.checked = 突出生效权限;
突出生效权限复选框.addEventListener("change", () => {
  突出生效权限 = 突出生效权限复选框.checked;
  localStorage.setItem("突出生效权限", 突出生效权限 ? "是" : "否");
  请求重绘();
});

// ==================== 用户和组面板（左侧悬浮画布） ====================
const 用户和组画布 = document.getElementById("用户和组");
const 用户和组上下文 = 用户和组画布.getContext("2d");

// 组配色池：填充与描边均为不透明色，连线用同色系近似色；不同组用不同配色，以示区分
const 组配色池 = [
  { 填充: "#173352", 描边: "#4a9eff", 连线: "#3d7ac2" },
  { 填充: "#1e3e29", 描边: "#6ee7a0", 连线: "#4a9e6a" },
  { 填充: "#3e310c", 描边: "#e8a33d", 连线: "#b06100" },
  { 填充: "#331726", 描边: "#d374a8", 连线: "#9c5580" },
  { 填充: "#241c3a", 描边: "#a78bfa", 连线: "#7a63c8" },
  { 填充: "#0f3a3a", 描边: "#2dd4bf", 连线: "#1f9e8a" },
  { 填充: "#3a3a10", 描边: "#eab308", 连线: "#a3820a" },
  { 填充: "#3a1518", 描边: "#ef4444", 连线: "#b03236" },
];

const 用户和组面板 = {
  内边距上: 15, // CSS padding-top（原 25px 减 10px：表头图像上移 10px）
  内边距左: 15, // CSS padding-left（原 25px 减 10px：两列整体左移 10px）
  内边距右: 16, // 右内边距（CSS padding-right）：16 = 热区右缘间距(5) + 热区半边长(19) - 箭头半宽(8)，保证箭头居中于热区且完整绘制
  箭头宽: 16,
  箭头高: 28,
  箭头线宽: 2.5,
  箭头颜色: "#aaa",
  箭头悬停颜色: "#fff",
  箭头左边距: 25, // 箭头与组列之间的间隔（原 15px + 10px 补偿：两列左移 10px 后箭头视觉位置不变）
  箭头右边距: 0, // 箭头与内容区右边的距离（箭头右缘与内容区右缘齐平）
  箭头热区扩展: 5, // 点击热区在箭头矩形基础上、下各扩展 5px，水平宽度与高度相同（正方形热区）
  热区右缘间距: 5, // 热区最右端距画布最右端 5px（热区伸入右内边距区域）
  表头高: 34,
  表头间距: 20, // 表头图像与首个节点之间的间隔（原 10px + 10px 补偿：表头上移 10px 后节点视觉位置不变）
  描边余量: 2, // 内容边缘基础余量，保证节点描边完整可见（描边形式与目录/文件节点一致）
  节点宽: 100, // 两列节点的固定宽度
  节点高: 36,
  节点圆角: 6,
  节点描边宽度: 2,
  当前描边宽度: 3,
  当前填充变亮: 0.15, // 当前用户/组的填充向白色混合的比例
  当前描边变亮: 0.4, // 当前用户/组的描边向白色混合的比例（更亮，直观显眼）
  非当前变暗: 0.45, // 非当前用户/组的填充与描边向黑色混合的比例（更深更暗，与"当前"拉开差距）
  节点内边距X: 12,
  列间距: 60,
  节点垂直间距: 22,
  名称字体: "13px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
  名称颜色: "#fff",
  连接线宽度: 3,
  附加组连接线宽度: 1,
  附加组连接线颜色: "gray",
  当前标记颜色: "gold",
  当前标记半径: 4,
  当前标记边距: 10,
  扫描变亮比例: 0.25,
  扫描持续时间: 1200,
  已收起: false, // 默认展开；收起时向左移动至只露出箭头
  悬停箭头: false,
  按下待确认: false, // 已在箭头上按下，等待原地松开才算点击
  按下已移动: false,
};

// 两列表头图像（每列只在最上方绘制一次）：左列用户、右列组
const 用户图标 = new Image();
用户图标.src = "/Interactive-Hub/Linux-User-Group/Images/用户.webp";
用户图标.onload = () => 绘制用户和组面板();
const 组图标 = new Image();
组图标.src = "/Interactive-Hub/Linux-User-Group/Images/组.png";
组图标.onload = () => 绘制用户和组面板();

// 面板数据：当前存在的用户与组
let 面板用户组 = []; // { 名称, 主组, 附加组组, 主目录, 登录shell }
let 面板组组 = []; // { 名称, 配色索引 }
let 面板当前用户 = "ntzz";
const 默认登录shell = "/bin/bash";

let 用户和组内容宽 = 0;
let 用户和组内容高 = 0;
let 面板节点布局组 = []; // { 类型: "用户"|"组", 名称, x, y, 宽, 高 }，连线定位用

// 面板悬停状态与扫描动画
let 面板悬停节点 = null; // { 类型: "用户"|"组", 名称 }
let 面板扫描动画帧ID = null; // 扫描动画的 requestAnimationFrame ID

// 随机生成用的名称池（不含保底名称 ntzz）
const 面板用户名称池 = ["alice", "bob", "carol", "david", "emma", "frank", "grace", "henry", "ivy", "jack", "kate", "leo", "mila", "noah", "olivia", "peter", "quinn", "ryan", "sara", "theo", "ursula", "vera", "wyatt", "xander", "yolanda", "zane"];
const 面板组名称池 = ["wheel", "docker", "dev", "ops", "staff", "admin", "users", "www", "audio", "video", "plugdev", "netdev", "mail", "games", "backup", "news", "render", "bluetooth", "kvm", "nginx"];

// 初始化面板数据：保底 ntzz 用户，再随机生成 1-3 个用户；
// 每个用户默认拥有与自己同名的组（同名组即其主组），组的总数比用户多 1-3 个
// 每个用户额外分配 0-2 个附加组（从额外组中选取）
function 初始化用户和组() {
  面板用户组 = [{ 名称: "ntzz", 主组: "ntzz", 附加组组: [], 主目录: "/home/ntzz", 登录shell: 默认登录shell }];
  const 可用用户名 = [...面板用户名称池];
  const 额外用户数 = 1 + Math.floor(Math.random() * 3); // 1-3
  for (let i = 0; i < 额外用户数 && 可用用户名.length; i++) {
    const 名称 = 可用用户名.splice(Math.floor(Math.random() * 可用用户名.length), 1)[0];
    // 主组为同名组
    面板用户组.push({ 名称, 主组: 名称, 附加组组: [], 主目录: "/home/" + 名称, 登录shell: 默认登录shell });
  }

  // 每个用户的同名组（按用户顺序分配配色）
  面板组组 = 面板用户组.map((u, i) => ({ 名称: u.名称, 配色索引: i }));

  // 额外组：组的总数比用户多 1-3 个，名称取自组名称池（不会与用户名冲突）
  const 可用组名 = [...面板组名称池];
  const 额外组数 = 1 + Math.floor(Math.random() * 3); // 1-3
  for (let i = 0; i < 额外组数 && 可用组名.length; i++) {
    const 名称 = 可用组名.splice(Math.floor(Math.random() * 可用组名.length), 1)[0];
    面板组组.push({ 名称, 配色索引: 面板组组.length });
  }

  // 为每个用户分配 0-2 个附加组（从所有非主组的组中随机选取，不重复）
  // 注意：某个用户的主组也可以作为其他用户的附加组
  const 候选组名称组 = 面板组组.map((g) => g.名称);
  for (const 用户 of 面板用户组) {
    const 可用附加组 = 候选组名称组.filter((n) => n !== 用户.主组);
    const 附加组数 = Math.floor(Math.random() * 3); // 0-2
    for (let i = 0; i < 附加组数 && 可用附加组.length; i++) {
      const 索引 = Math.floor(Math.random() * 可用附加组.length);
      用户.附加组组.push(可用附加组.splice(索引, 1)[0]);
    }
  }

  绘制用户和组面板();
}

function 获取组配色(组名) {
  const 组 = 面板组组.find((g) => g.名称 === 组名);
  return 组配色池[(组 ? 组.配色索引 : 0) % 组配色池.length];
}

// 图像按固定高度等比缩放后的绘制宽度；未加载完成时按正方形占位
function 获取图像绘制宽(图像, 高度) {
  if (图像.complete && 图像.naturalWidth) {
    return (高度 * 图像.naturalWidth) / 图像.naturalHeight;
  }
  return 高度;
}

// 箭头位于内容区右侧（右缘与内容区右缘齐平），垂直居中（绘制与点击命中共用同一几何）
function 获取用户和组箭头几何() {
  return {
    x: 用户和组内容宽 - 用户和组面板.箭头右边距 - 用户和组面板.箭头宽,
    y: (用户和组内容高 - 用户和组面板.箭头高) / 2,
    宽: 用户和组面板.箭头宽,
    高: 用户和组面板.箭头高,
  };
}

// 绘制单个用户/组节点：圆角矩形 + 居中名称（过长则截断）
// 描边形式与目录/文件节点一致：同一路径先填充后描边，描边骑跨路径两侧
// 当前用户/其主组：在节点左上角绘制金色圆点标记；其余节点正常绘制
// 扫描进度(0~1)：非 null 时在填充范围内绘制自左向右的不透明→半透明扫描效果
function 绘制面板节点(节点, 配色, 是当前, 扫描进度) {
  const 面板 = 用户和组面板;

  // 扫描动画：色带从矩形左缘外逐渐右移，最终正好填满矩形
  // 渐变：左端全透明 → 右端全不透明；右端从矩形左缘移到右缘
  if (扫描进度 !== null && 扫描进度 !== undefined) {
    const rgb = 解析颜色(颜色混合(配色.填充, "#ffffff", 面板.扫描变亮比例));
    const 渐变右缘X = 节点.x + 节点.宽 * 扫描进度;
    // 进度为 0 时渐变宽度为 0 会失效，用最小宽度保证起点稳定
    const 有效右缘X = Math.max(渐变右缘X, 节点.x + 0.001);
    const 渐变 = 用户和组上下文.createLinearGradient(节点.x, 0, 有效右缘X, 0);
    渐变.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
    渐变.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},1)`);
    用户和组上下文.fillStyle = 渐变;
    圆角矩形路径(用户和组上下文, 节点.x, 节点.y, 节点.宽, 节点.高, 面板.节点圆角);
    用户和组上下文.fill();
  } else {
    用户和组上下文.fillStyle = 配色.填充;
    圆角矩形路径(用户和组上下文, 节点.x, 节点.y, 节点.宽, 节点.高, 面板.节点圆角);
    用户和组上下文.fill();
  }

  用户和组上下文.strokeStyle = 配色.描边;
  用户和组上下文.lineWidth = 面板.节点描边宽度;
  用户和组上下文.stroke();

  // 当前标记：左上角金色实心圆（与上边缘和左边缘均距离 10px）
  if (是当前) {
    用户和组上下文.fillStyle = 面板.当前标记颜色;
    用户和组上下文.beginPath();
    用户和组上下文.arc(
      节点.x + 面板.当前标记边距,
      节点.y + 面板.当前标记边距,
      面板.当前标记半径,
      0,
      Math.PI * 2
    );
    用户和组上下文.fill();
  }

  用户和组上下文.fillStyle = 面板.名称颜色;
  用户和组上下文.font = 面板.名称字体;
  用户和组上下文.textAlign = "center";
  用户和组上下文.textBaseline = "middle";
  const 显示名称 = 截断文本(用户和组上下文, 节点.名称, 节点.宽 - 面板.节点内边距X * 2);
  const 名称X = 节点.x + 节点.宽 / 2;
  const 名称Y = 节点.y + 节点.高 / 2 + 0.5;
  // 模拟阴影：先绘制右下角偏移1px的黑色文本
  用户和组上下文.fillStyle = "#000";
  用户和组上下文.fillText(显示名称, 名称X + 1, 名称Y + 1);
  // 正常位置绘制名称文本
  用户和组上下文.fillStyle = 面板.名称颜色;
  用户和组上下文.fillText(显示名称, 名称X, 名称Y);
}

// 画布尺寸由绘制内容决定：两列类表格（表头图像在列首，只画一次）+ 右侧箭头
function 绘制用户和组面板() {
  const 面板 = 用户和组面板;
  const 余量 = 面板.描边余量;

  const 用户表头宽 = 获取图像绘制宽(用户图标, 面板.表头高);
  const 组表头宽 = 获取图像绘制宽(组图标, 面板.表头高);
  const 列宽 = 面板.节点宽; // 两列节点固定同宽

  // 单列高度 = 表头 + 表头间距 + 节点列
  const 列内容高 = (数量) => 面板.表头高 + 面板.表头间距 + 数量 * (面板.节点高 + 面板.节点垂直间距) - 面板.节点垂直间距;
  const 用户列高 = 列内容高(面板用户组.length);
  const 组列高 = 列内容高(面板组组.length);

  用户和组内容宽 = 余量 + 列宽 + 面板.列间距 + 列宽 + 面板.箭头左边距 + 面板.箭头宽 + 面板.箭头右边距;
  用户和组内容高 = Math.max(用户列高, 组列高, 面板.箭头高) + 余量 * 2;

  // 两列均顶端对齐：左列用户从 余量 处开始，右列组紧随其后
  const 组列X = 余量 + 列宽 + 面板.列间距;
  面板节点布局组 = [];
  const 节点起始Y = 余量 + 面板.表头高 + 面板.表头间距;
  let y = 节点起始Y;
  for (const 用户 of 面板用户组) {
    面板节点布局组.push({ 类型: "用户", 名称: 用户.名称, x: 余量, y, 宽: 列宽, 高: 面板.节点高 });
    y += 面板.节点高 + 面板.节点垂直间距;
  }
  y = 节点起始Y;
  for (const 组 of 面板组组) {
    面板节点布局组.push({ 类型: "组", 名称: 组.名称, x: 组列X, y, 宽: 列宽, 高: 面板.节点高 });
    y += 面板.节点高 + 面板.节点垂直间距;
  }

  const dpr = window.devicePixelRatio || 1;
  用户和组画布.width = 用户和组内容宽 * dpr;
  用户和组画布.height = 用户和组内容高 * dpr;
  用户和组画布.style.width = 用户和组内容宽 + "px";
  用户和组画布.style.height = 用户和组内容高 + "px";
  用户和组上下文.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 表头：每列最上方各绘制一次（图像），水平居中于该列
  if (用户图标.complete && 用户图标.naturalWidth) {
    用户和组上下文.drawImage(用户图标, 余量 + (列宽 - 用户表头宽) / 2, 余量, 用户表头宽, 面板.表头高);
  }
  if (组图标.complete && 组图标.naturalWidth) {
    用户和组上下文.drawImage(组图标, 组列X + (列宽 - 组表头宽) / 2, 余量, 组表头宽, 面板.表头高);
  }

  // 从属关系连线：先绘制附加组连线（细灰线），后绘制主组连线（粗线），确保主组连线在上
  for (const 用户 of 面板用户组) {
    const 用户节点 = 面板节点布局组.find((n) => n.类型 === "用户" && n.名称 === 用户.名称);
    if (!用户节点) continue;

    // 附加组连线：较细，灰色（先绘制，位于底层）
    for (const 附加组名 of 用户.附加组组) {
      const 附加组节点 = 面板节点布局组.find((n) => n.类型 === "组" && n.名称 === 附加组名);
      if (!附加组节点) continue;
      const 起点X = 用户节点.x + 用户节点.宽;
      const 起点Y = 用户节点.y + 用户节点.高 / 2;
      const 终点X = 附加组节点.x;
      const 终点Y = 附加组节点.y + 附加组节点.高 / 2;
      const 水平距离 = 终点X - 起点X;
      用户和组上下文.strokeStyle = 面板.附加组连接线颜色;
      用户和组上下文.lineWidth = 面板.附加组连接线宽度;
      用户和组上下文.beginPath();
      用户和组上下文.moveTo(起点X, 起点Y);
      用户和组上下文.bezierCurveTo(起点X + 水平距离 * 0.5, 起点Y, 终点X - 水平距离 * 0.5, 终点Y, 终点X, 终点Y);
      用户和组上下文.stroke();
    }

    // 主组连线：较粗，颜色与同组配色一致（后绘制，位于上层）
    const 主组节点 = 面板节点布局组.find((n) => n.类型 === "组" && n.名称 === 用户.主组);
    if (主组节点) {
      const 配色 = 获取组配色(用户.主组);
      const 起点X = 用户节点.x + 用户节点.宽;
      const 起点Y = 用户节点.y + 用户节点.高 / 2;
      const 终点X = 主组节点.x;
      const 终点Y = 主组节点.y + 主组节点.高 / 2;
      const 水平距离 = 终点X - 起点X;
      用户和组上下文.strokeStyle = 配色.连线;
      用户和组上下文.lineWidth = 面板.连接线宽度;
      用户和组上下文.beginPath();
      用户和组上下文.moveTo(起点X, 起点Y);
      用户和组上下文.bezierCurveTo(起点X + 水平距离 * 0.5, 起点Y, 终点X - 水平距离 * 0.5, 终点Y, 终点X, 终点Y);
      用户和组上下文.stroke();
    }
  }

  // 节点：当前用户高亮，其主组也高亮（颜色均为不透明）
  const 当前用户 = 面板用户组.find((u) => u.名称 === 面板当前用户);

  // 计算扫描进度：有悬停节点时为 0~1 的循环进度，否则为 null
  let 扫描进度 = null;
  if (面板悬停节点) {
    // 来回扫动：一个周期 = 左→右 + 右→左，用三角波实现
    const 周期进度 = ((performance.now() - 面板悬停节点.开始时间) % (面板.扫描持续时间 * 2)) / (面板.扫描持续时间 * 2);
    扫描进度 = 周期进度 < 0.5 ? 周期进度 * 2 : 2 - 周期进度 * 2;
  }

  // 判断某个节点是否需要扫描高亮
  function 需要扫描(节点) {
    if (!面板悬停节点) return false;
    if (面板悬停节点.类型 === "用户") {
      if (节点.类型 === "用户" && 节点.名称 === 面板悬停节点.名称) return true;
      if (节点.类型 === "组") {
        const 用户 = 面板用户组.find((u) => u.名称 === 面板悬停节点.名称);
        if (!用户) return false;
        return 用户.主组 === 节点.名称 || 用户.附加组组.includes(节点.名称);
      }
    } else {
      if (节点.类型 === "组" && 节点.名称 === 面板悬停节点.名称) return true;
      if (节点.类型 === "用户") {
        const 用户 = 面板用户组.find((u) => u.名称 === 节点.名称);
        if (!用户) return false;
        return 用户.主组 === 面板悬停节点.名称 || 用户.附加组组.includes(面板悬停节点.名称);
      }
    }
    return false;
  }

  for (const 节点 of 面板节点布局组) {
    const 节点的扫描进度 = 需要扫描(节点) ? 扫描进度 : null;
    if (节点.类型 === "用户") {
      const 用户 = 面板用户组.find((u) => u.名称 === 节点.名称);
      绘制面板节点(节点, 获取组配色(用户.主组), 节点.名称 === 面板当前用户, 节点的扫描进度);
    } else {
      绘制面板节点(节点, 获取组配色(节点.名称), false, 节点的扫描进度);
    }
  }

  // 最右侧的收起/展开箭头
  const 几何 = 获取用户和组箭头几何();
  const 中心X = 几何.x + 几何.宽 / 2;
  const 中心Y = 几何.y + 几何.高 / 2;
  const 半宽 = 几何.宽 / 2 - 面板.箭头线宽;
  const 半高 = 几何.高 / 2 - 面板.箭头线宽;

  // 展开状态显示向左箭头（点击收起），收起状态显示向右箭头（点击展开）
  const 朝向 = 面板.已收起 ? 1 : -1;
  用户和组上下文.strokeStyle = 面板.悬停箭头 ? 面板.箭头悬停颜色 : 面板.箭头颜色;
  用户和组上下文.lineWidth = 面板.箭头线宽;
  用户和组上下文.lineCap = "round";
  用户和组上下文.lineJoin = "round";
  用户和组上下文.beginPath();
  用户和组上下文.moveTo(中心X - 朝向 * 半宽, 中心Y - 半高);
  用户和组上下文.lineTo(中心X + 朝向 * 半宽, 中心Y);
  用户和组上下文.lineTo(中心X - 朝向 * 半宽, 中心Y + 半高);
  用户和组上下文.stroke();
}

// 事件坐标 → 内容区坐标：扣除左/上内边距后命中箭头热区
// 热区为正方形：边长 = 箭头高 + 上下各 5px；最右端距画布最右端 5px（伸入右内边距区域）
// 因 内边距右(16) - 热区右缘间距(5) = 热区半边长(19) - 箭头半宽(8)，箭头恰好水平居中于热区
function 命中用户和组箭头(事件) {
  const 面板 = 用户和组面板;
  const 矩形 = 用户和组画布.getBoundingClientRect();
  const x = 事件.clientX - 矩形.left - 面板.内边距左;
  const y = 事件.clientY - 矩形.top - 面板.内边距上;
  const 几何 = 获取用户和组箭头几何();
  const 热区边长 = 几何.高 + 面板.箭头热区扩展 * 2;
  const 热区右缘 = 用户和组内容宽 + 面板.内边距右 - 面板.热区右缘间距;
  const 中心Y = 几何.y + 几何.高 / 2;
  return x >= 热区右缘 - 热区边长 && x <= 热区右缘 && Math.abs(y - 中心Y) <= 热区边长 / 2;
}

// 命中面板节点（用户或组矩形），返回 { 类型, 名称 }
function 命中面板节点(事件) {
  const 面板 = 用户和组面板;
  const 矩形 = 用户和组画布.getBoundingClientRect();
  const x = 事件.clientX - 矩形.left - 面板.内边距左;
  const y = 事件.clientY - 矩形.top - 面板.内边距上;
  for (const 节点 of 面板节点布局组) {
    if (x >= 节点.x && x <= 节点.x + 节点.宽 && y >= 节点.y && y <= 节点.y + 节点.高) {
      return { 类型: 节点.类型, 名称: 节点.名称 };
    }
  }
  return null;
}

// 扫描动画循环：持续重绘面板实现扫描效果
function 面板扫描动画循环() {
  面板扫描动画帧ID = null;
  if (!面板悬停节点) return;
  绘制用户和组面板();
  面板扫描动画帧ID = requestAnimationFrame(面板扫描动画循环);
}

// 启动/停止扫描动画
function 启动面板扫描动画() {
  if (!面板扫描动画帧ID) {
    面板扫描动画帧ID = requestAnimationFrame(面板扫描动画循环);
  }
}

function 停止面板扫描动画() {
  面板悬停节点 = null;
  if (面板扫描动画帧ID) {
    cancelAnimationFrame(面板扫描动画帧ID);
    面板扫描动画帧ID = null;
  }
  绘制用户和组面板();
}

用户和组画布.addEventListener("mousedown", (事件) => {
  if (事件.button !== 0) return;
  if (!命中用户和组箭头(事件)) return;
  用户和组面板.按下待确认 = true;
  用户和组面板.按下已移动 = false;
});

用户和组画布.addEventListener("mousemove", (事件) => {
  // 按下后出现任何移动都不再算点击
  if (用户和组面板.按下待确认) {
    用户和组面板.按下已移动 = true;
    return;
  }

  // 节点悬停检测：用户/组矩形
  const 命中节点 = 命中面板节点(事件);
  const 悬停节点有变化 =
    (!!命中节点 !== !!面板悬停节点) ||
    (命中节点 && 面板悬停节点 && (命中节点.类型 !== 面板悬停节点.类型 || 命中节点.名称 !== 面板悬停节点.名称));

  if (悬停节点有变化) {
    if (命中节点) {
      面板悬停节点 = { ...命中节点, 开始时间: performance.now() };
      启动面板扫描动画();
    } else {
      停止面板扫描动画();
    }
  }

  const 悬停 = 命中用户和组箭头(事件);
  if (悬停 !== 用户和组面板.悬停箭头) {
    用户和组面板.悬停箭头 = 悬停;
    用户和组画布.style.cursor = 悬停 ? 'url("/Images/Common/鼠标-指向.cur"), pointer' : "var(--光标-默认)";
    绘制用户和组面板();
  }
});

用户和组画布.addEventListener("mouseup", () => {
  if (!用户和组面板.按下待确认) return;
  用户和组面板.按下待确认 = false;
  // 按下且期间鼠标未移动才切换收起/展开
  if (用户和组面板.按下已移动) return;
  用户和组面板.已收起 = !用户和组面板.已收起;
  用户和组画布.classList.toggle("收起", 用户和组面板.已收起);
  localStorage.setItem("用户和组已收起", 用户和组面板.已收起 ? "是" : "否");
  绘制用户和组面板();
});

用户和组画布.addEventListener("mouseleave", () => {
  用户和组面板.按下待确认 = false;
  停止面板扫描动画();
  if (用户和组面板.悬停箭头) {
    用户和组面板.悬停箭头 = false;
    绘制用户和组面板();
  }
});

// 收起时露出的可见宽度 = 右内边距 + 箭头右边距 + 箭头宽（供 CSS 的 .收起 位移计算）
用户和组画布.style.setProperty("--箭头可见宽度", 用户和组面板.内边距右 + 用户和组面板.箭头右边距 + 用户和组面板.箭头宽 + "px");

// ==================== 启动 ====================
恢复初始化模式();
// 恢复权限显示模式设置（默认字母模式）
const 保存的权限模式 = localStorage.getItem("权限显示模式");
if (保存的权限模式) {
  const 单选按钮 = document.querySelector(`input[name="权限模式"][value="${保存的权限模式}"]`);
  if (单选按钮) 单选按钮.checked = true;
}
// 恢复用户和组面板展开/收起状态（首帧前同步 class，避免加载时多余的过渡动画）
if (localStorage.getItem("用户和组已收起") === "是") {
  用户和组面板.已收起 = true;
  用户和组画布.classList.add("收起");
}
调整画布尺寸();
重置();
聚焦命令输入框();
