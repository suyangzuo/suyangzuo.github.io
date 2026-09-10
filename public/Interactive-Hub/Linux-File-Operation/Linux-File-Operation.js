// ==================== 工具函数 ====================
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

// ==================== 统一配置对象 ====================
const 配置 = {
  动画时长: 250,
  边距: { 上: 100, 下: 25, 左: 25, 右: 25 },
  布局: {
    子节点水平间距: 100,
    子节点垂直间距: 40,
  },
  目录: {
    高: 40,
    圆角: 8,
    填充色: "#FFD76610",
    当前填充色: "#FFD76650",
    描边色: "#FF8C00a0",
    当前描边色: "#FF8C00",
    当前隐藏填充色: "#FFD76605",
    当前隐藏描边色:"#FF8C0030",
    描边宽度: 2,
    当前描边宽度: 3,
    当前放大倍数: 1.3,
    名称颜色: "#fff",
    名称字体: "12px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
    名称偏移: -8,
    文本边距: 15,
    非空标记: {
      圆圈颜色: "rgba(255,255,255,0.5)",
      圆圈半径: 3,
      圆圈间距: 8,
    },
  },
  根目录: {
    高: 48,
    圆角: 10,
    填充色: "#2d5a3d10",
    当前填充色: "#2d5a3dff",
    描边色: "#4a9e6aff",
    当前描边色: "#6ee7a0",
    描边宽度: 2,
    当前描边宽度: 4,
    当前放大倍数: 1.3,
    名称颜色: "#6ee7a0",
    名称字体: "bold 15px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
    名称偏移: -10,
    文本边距: 18,
  },
  文件: {
    高: 34,
    圆角: 5,
    填充色: "#245181ff",
    描边色: "#75a7e1ff",
    描边宽度: 2,
    名称颜色: "#fff",
    名称字体: "13px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif",
    文本边距: 15,
  },
  连接线: {
    颜色: "#555",
    宽度: 1,
    弯曲半径: 200,
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
  隐藏: {
    // 隐藏（全透明）
    填充色: "#FFD76600",
    描边色: "#FF8C0000",
    名称颜色: "#ffffff00",
    // 当前隐藏（全透明）
    当前填充色: "#FFD76600",
    当前描边色: "#FF8C0000",
    当前名称颜色: "#ffffff00",
    // 显示隐藏（复选框勾选时）
    隐藏目录填充色: "#FFD76603",
    隐藏目录描边色: "#FF8C0030",
    当前隐藏目录填充色: "#FFD76605",
    当前隐藏目录描边色: "#FF8C0050",
    隐藏文件填充色: "#24518120",
    隐藏文件描边色: "#75a7e130",
    当前隐藏文件填充色: "#24518130",
    当前隐藏文件描边色: "#75a7e150",
    // 显示隐藏时名称颜色
    隐藏名称颜色: "#fff3",
    当前隐藏名称颜色: "#fff6",
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
  交互: {
    拖拽阈值: 5,
    点击时间阈值: 300,
  },
};

// 语义化别名
配置.目录.当前目录填充色 = 配置.目录.当前填充色;
配置.目录.当前目录描边色 = 配置.目录.当前描边色;
配置.目录.当前目录描边宽度 = 配置.目录.当前描边宽度;

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
    动画: null,
    删除动画: null,
    当前位置动画: null,
    当前位置过渡: 0,
    是当前位置: false,
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
const 显示隐藏复选框 = document.getElementById("显示隐藏");
const 历史记录按钮 = document.getElementById("历史记录按钮");
const 历史记录模态 = document.getElementById("历史记录模态");
const 历史记录关闭按钮 = document.getElementById("历史记录关闭按钮");
const 历史记录导出按钮 = document.getElementById("历史记录导出按钮");
const 历史记录表格体 = document.getElementById("历史记录表格体");

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
let 拖拽时按住Ctrl = false;

// 视图平移状态
let 视图偏移X = 0;
let 视图偏移Y = 0;
let 正在拖拽视图 = false;
let 空格按下 = false;
let 视图拖拽起始X = 0;
let 视图拖拽起始Y = 0;
let 视图拖拽初始偏移X = 0;
let 视图拖拽初始偏移Y = 0;

// ==================== 目录名称池 ====================
const 目录名称池 = [
  "文档", "图片", "音乐", "视频", "下载", "桌面", "项目", "代码",
  "资料", "备份", "配置", "脚本", "日志", "模板", "测试", "工具",
];

const 文件名称池 = [
  "报告.txt", "笔记.md", "数据.csv", "配置.conf", "脚本.sh",
  "说明.txt", "代码.py", "样式.css", "页面.html", "清单.txt",
  "备忘录.md", "记录.log", "索引.json", "readme.txt", "主程序.c",
];

// ==================== 节点尺寸测量 ====================
function 测量节点尺寸(节点) {
  const 是根目录 = !节点.父节点;
  const 尺寸 = 是根目录 ? 配置.根目录 : 配置[节点.类型];
  上下文.font = 尺寸.名称字体;
  const 文本宽 = 上下文.measureText(节点.名称).width;
  节点.宽 = Math.ceil(文本宽) + 尺寸.文本边距 * 2;
  节点.高 = 尺寸.高;
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
  let 名称颜色 = 尺寸.名称颜色;

  // 检查是否为隐藏节点（名称以 . 开头）
  const 是隐藏 = 节点.名称.startsWith(".");
  const 显示隐藏 = 显示隐藏复选框 ? 显示隐藏复选框.checked : false;

  const 是当前位置 = 节点.是当前位置 && !节点.删除动画;
  // 只要当前位置过渡值不为0，就应用过渡效果（包括正在失去当前状态的节点）
  const 位置比例 = 节点.当前位置过渡;

  if (是隐藏 && !显示隐藏) {
    // 未勾选显示隐藏：全透明
    if (是当前位置) {
      填充色 = 配置.隐藏.当前填充色;
      描边色 = 配置.隐藏.当前描边色;
      名称颜色 = 配置.隐藏.当前名称颜色;
    } else {
      填充色 = 配置.隐藏.填充色;
      描边色 = 配置.隐藏.描边色;
      名称颜色 = 配置.隐藏.名称颜色;
    }
  } else if (是隐藏 && 显示隐藏) {
    // 勾选显示隐藏：根据目录/文件类型使用不同颜色
    名称颜色 = 是当前位置 ? 配置.隐藏.当前隐藏名称颜色 : 配置.隐藏.隐藏名称颜色;
    if (节点.类型 === "目录") {
      if (是当前位置) {
        填充色 = 配置.隐藏.当前隐藏目录填充色;
        描边色 = 配置.隐藏.当前隐藏目录描边色;
      } else {
        填充色 = 配置.隐藏.隐藏目录填充色;
        描边色 = 配置.隐藏.隐藏目录描边色;
      }
    } else {
      if (是当前位置) {
        填充色 = 配置.隐藏.当前隐藏文件填充色;
        描边色 = 配置.隐藏.当前隐藏文件描边色;
      } else {
        填充色 = 配置.隐藏.隐藏文件填充色;
        描边色 = 配置.隐藏.隐藏文件描边色;
      }
    }
  }

  // 悬停时隐藏节点名称颜色也加亮
  if (是隐藏 && 显示隐藏 && 节点 === 悬停节点 && !节点.删除动画) {
    名称颜色 = 配置.隐藏.当前隐藏名称颜色;
  }

  if (位置比例 > 0 && 节点.类型 === "目录") {
    const 放大 = 尺寸.当前放大倍数;
    实际宽 = 节点.宽 * (1 + (放大 - 1) * 位置比例) * 当前比例;
    实际高 = 节点.高 * (1 + (放大 - 1) * 位置比例) * 当前比例;
    if (是隐藏 && 显示隐藏) {
      // 隐藏节点当前高亮颜色
      if (节点.类型 === "目录") {
        填充色 = 颜色混合(配置.隐藏.隐藏目录填充色, 配置.隐藏.当前隐藏目录填充色, 位置比例);
        描边色 = 颜色混合(配置.隐藏.隐藏目录描边色, 配置.隐藏.当前隐藏目录描边色, 位置比例);
      } else {
        填充色 = 颜色混合(配置.隐藏.隐藏文件填充色, 配置.隐藏.当前隐藏文件填充色, 位置比例);
        描边色 = 颜色混合(配置.隐藏.隐藏文件描边色, 配置.隐藏.当前隐藏文件描边色, 位置比例);
      }
    } else if (是隐藏 && !显示隐藏) {
      // 保持全透明，不做颜色混合
    } else {
      填充色 = 颜色混合(尺寸.填充色, 尺寸.当前填充色, 位置比例);
      描边色 = 颜色混合(尺寸.描边色, 尺寸.当前描边色, 位置比例);
    }
    描边宽度 = 尺寸.描边宽度 + (尺寸.当前描边宽度 - 尺寸.描边宽度) * 位置比例;
  }

  return { 实际宽, 实际高, 填充色, 描边色, 描边宽度, 名称颜色, 当前比例, 尺寸 };
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
    const 起点X = 父在左侧
      ? 父中心X + 父半宽 + 父尺寸.描边宽度 / 2
      : 父中心X - 父半宽 - 父尺寸.描边宽度 / 2;
    const 起点Y = 父中心Y;
    const 终点X = 父在左侧
      ? 子中心X - 子半宽 - 子尺寸.描边宽度 / 2
      : 子中心X + 子半宽 + 子尺寸.描边宽度 / 2;
    const 终点Y = 子中心Y;
    const 控制点1X = 起点X + (父在左侧 ? 水平距离 * 0.5 : -水平距离 * 0.5);
    const 控制点1Y = 起点Y;
    const 控制点2X = 终点X + (父在左侧 ? -水平距离 * 0.5 : 水平距离 * 0.5);
    const 控制点2Y = 终点Y;

    return { 起点X, 起点Y, 控制点1X, 控制点1Y, 控制点2X, 控制点2Y, 终点X, 终点Y };
  } else {
    const 父在上方 = 父中心Y < 子中心Y;
    const 起点X = 父中心X;
    const 起点Y = 父在上方
      ? 父中心Y + 父半高 + 父尺寸.描边宽度 / 2
      : 父中心Y - 父半高 - 父尺寸.描边宽度 / 2;
    const 终点X = 子中心X;
    const 终点Y = 父在上方
      ? 子中心Y - 子半高 - 子尺寸.描边宽度 / 2
      : 子中心Y + 子半高 + 子尺寸.描边宽度 / 2;
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

function 绘制节点(节点) {
  const { 实际宽, 实际高, 填充色, 描边色, 描边宽度, 名称颜色, 当前比例, 尺寸 } = 获取节点实际尺寸(节点);
  if (当前比例 <= 0) return;

  const 实际X = 节点.x - 实际宽 / 2;
  const 实际Y = 节点.y - 实际高 / 2;
  const 实际圆角 = 尺寸.圆角 * 当前比例;

  // 悬停高亮：加粗描边
  const 是悬停 = 节点 === 悬停节点 && !节点.删除动画;
  const 最终描边宽度 = 是悬停 ? 描边宽度 + 1.5 : 描边宽度;

  // 填充
  上下文.fillStyle = 填充色;
  圆角矩形路径(上下文, 实际X, 实际Y, 实际宽, 实际高, 实际圆角);
  上下文.fill();

  // 描边
  上下文.strokeStyle = 描边色;
  上下文.lineWidth = 最终描边宽度;
  上下文.stroke();

  // 根目录非空标记：3个小圆圈（绿色调）
  if (!节点.父节点 && 节点.子节点组.length > 0 && !节点.删除动画) {
    const 标记 = 配置.根目录.非空标记 || { 圆圈颜色: "rgba(110,231,160,0.6)", 圆圈半径: 3, 圆圈间距: 8 };
    const 圆圈总数 = 3;
    const 总宽 = (圆圈总数 - 1) * 标记.圆圈间距;
    const 起始X = 节点.x - 总宽 / 2;
    上下文.fillStyle = 标记.圆圈颜色;
    for (let i = 0; i < 圆圈总数; i++) {
      上下文.beginPath();
      上下文.arc(起始X + i * 标记.圆圈间距, 节点.y, 标记.圆圈半径, 0, Math.PI * 2);
      上下文.fill();
    }
  }

  // 普通目录非空标记：3个小圆圈
  if (节点.类型 === "目录" && 节点.父节点 && 节点.子节点组.length > 0 && !节点.删除动画) {
    const 标记 = 配置.目录.非空标记;
    const 圆圈总数 = 3;
    const 总宽 = (圆圈总数 - 1) * 标记.圆圈间距;
    const 起始X = 节点.x - 总宽 / 2;
    上下文.fillStyle = 标记.圆圈颜色;
    for (let i = 0; i < 圆圈总数; i++) {
      上下文.beginPath();
      上下文.arc(起始X + i * 标记.圆圈间距, 节点.y, 标记.圆圈半径, 0, Math.PI * 2);
      上下文.fill();
    }
  }

  // 名称
  上下文.fillStyle = 名称颜色;
  上下文.font = 尺寸.名称字体;
  上下文.textAlign = "center";
  const 显示名称 = 截断文本(上下文, 节点.名称, 实际宽 - 8);

  if (节点.类型 === "文件") {
    // 文件名称放矩形正中
    上下文.textBaseline = "middle";
    上下文.fillText(显示名称, 节点.x, 节点.y);
  } else {
    // 目录名称放矩形上方
    上下文.textBaseline = "bottom";
    上下文.fillText(显示名称, 节点.x, 实际Y + 尺寸.名称偏移);
  }
}

function 绘制错误提示() {
  if (!错误提示组.length) return;
  const 提示 = 错误提示组[0];
  const 配置错误 = 配置.错误;

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
        段内进度 = 动画.段长度组[i] > 0
          ? (当前距离 - 已遍历距离) / 动画.段长度组[i]
          : 0;
        段内进度 = Math.max(0, Math.min(1, 段内进度));
        break;
      }
      已遍历距离 += 动画.段长度组[i];
    }

    const 参数 = 动画.段参数组[当前段索引];
    if (!参数) continue;

    const 点 = 计算贝塞尔点(
      段内进度,
      参数.起点X, 参数.起点Y,
      参数.控制点1X, 参数.控制点1Y,
      参数.控制点2X, 参数.控制点2Y,
      参数.终点X, 参数.终点Y
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

function 更新节点位置(节点, 时间) {
  if (节点.删除动画) {
    节点.删除动画.更新(时间);
    return !节点.删除动画.已完成;
  }
  if (节点.动画) {
    const 结果 = 节点.动画.更新(时间);
    节点.x = 结果.x;
    节点.y = 结果.y;
    return !节点.动画.已完成;
  }
  return false;
}

function 更新当前位置过渡(节点, 时间) {
  if (节点.当前位置动画) {
    节点.当前位置过渡 = 节点.当前位置动画.更新(时间);
    if (节点.当前位置动画.已完成) 节点.当前位置动画 = null;
    return true;
  }
  return false;
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

function 处理鼠标按下(事件) {
  // 按住空格时拖拽：拖拽 Canvas 视图
  if (空格按下) {
    正在拖拽视图 = true;
    视图拖拽起始X = 事件.clientX;
    视图拖拽起始Y = 事件.clientY;
    视图拖拽初始偏移X = 视图偏移X;
    视图拖拽初始偏移Y = 视图偏移Y;
    画布.style.cursor = "grabbing";
    return;
  }

  const { x, y } = 获取鼠标坐标(事件);
  const 命中节点 = 查找命中节点(x, y);
  鼠标按下时间 = performance.now();
  鼠标按下节点 = 命中节点;

  if (命中节点) {
    拖拽节点 = 命中节点;
    拖拽起始X = x;
    拖拽起始Y = y;
    拖拽当前X = x;
    拖拽当前Y = y;
    命中节点.拖拽偏移X = x - 命中节点.x;
    命中节点.拖拽偏移Y = y - 命中节点.y;
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
    视图偏移X = 视图拖拽初始偏移X + (事件.clientX - 视图拖拽起始X);
    视图偏移Y = 视图拖拽初始偏移Y + (事件.clientY - 视图拖拽起始Y);
    请求重绘();
    return;
  }

  const { x, y } = 获取鼠标坐标(事件);

  // 未拖拽时：检测悬停节点
  if (!拖拽节点) {
    const 命中 = 查找命中节点(x, y);
    if (命中 !== 悬停节点) {
      悬停节点 = 命中;
      画布.style.cursor = 命中 ? "pointer" : "var(--光标-默认)";
      请求重绘();
    }
    return;
  }

  拖拽当前X = x;
  拖拽当前Y = y;

  if (!拖拽节点.被拖拽) {
    const 移动距离 = Math.sqrt((x - 拖拽起始X) ** 2 + (y - 拖拽起始Y) ** 2);
    if (移动距离 <= 配置.交互.拖拽阈值) return;
    // 开始拖拽
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
    画布.style.cursor = 空格按下 ? "grab" : "var(--光标-默认)";
    return;
  }

  if (!拖拽节点) return;

  const 按下时长 = performance.now() - 鼠标按下时间;
  const 是点击 = !拖拽节点.被拖拽 && 按下时长 < 配置.交互.点击时间阈值;

  if (是点击 && 鼠标按下节点 && 鼠标按下节点.类型 === "目录") {
    // 点击目录：设为当前目录
    执行cd(鼠标按下节点);
  }

  if (拖拽节点.被拖拽) {
    // 拖拽结束：标记为固定位置，不再自动布局
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

function 更新命令高亮() {
  const 文本 = 命令输入框.value;
  if (!文本) {
    命令高亮层.innerHTML = "";
    return;
  }

  const 有效命令组 = ["cd", "mkdir", "rmdir", "rm", "touch", "cp", "mv"];
  const 转义 = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const 部分组 = 文本.split(/(\s+)/);
  let 结果 = "";
  let 已遇到命令 = false;

  for (const 部分 of 部分组) {
    if (!部分) continue;
    if (/^\s+$/.test(部分)) {
      结果 += 转义(部分);
      continue;
    }
    if (!已遇到命令) {
      // 第一个非空白部分是命令
      const 小写 = 部分.toLowerCase();
      if (有效命令组.includes(小写)) {
        结果 += `<span class="语法-命令">${转义(部分)}</span>`;
        已遇到命令 = true;
      } else {
        结果 += 转义(部分);
        已遇到命令 = true;
      }
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
    } else {
      结果 += `<span class="语法-路径">${转义(部分)}</span>`;
    }
  }

  命令高亮层.innerHTML = 结果;
}

function 解析相对路径(路径) {
  if (!路径 || 路径 === "/") return 根节点;
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

function 解析命令(输入) {
  const 错误 = { 有错误: false, 消息: "" };

  if (!输入.trim()) {
    return { 有效: false };
  }

  const 部分组 = 输入.trim().split(/\s+/);
  const 命令 = 部分组[0].toLowerCase();
  const 参数组 = 部分组.slice(1);

  const 有效命令组 = ["cd", "mkdir", "rmdir", "rm", "touch", "cp", "mv"];
  if (!有效命令组.includes(命令)) {
    return { 有效: false, 错误: { 有错误: true, 消息: `未知命令：${命令}\n支持：cd / mkdir / rmdir / rm / touch / cp / mv` } };
  }

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
      return { 有效: true, 命令: "cd", 目标: 目标节点, 目标路径: 目标 };
    }

    case "mkdir": {
      let 创建父级 = false;
      let 路径组 = [];

      for (const 参数 of 参数组) {
        if (参数.startsWith("-")) {
          const 标志组 = 参数.slice(1).split("");
          for (const 标志 of 标志组) {
            if (标志 === "p") 创建父级 = true;
            else return { 有效: false, 错误: { 有错误: true, 消息: `mkdir：无效参数 -${标志}\n支持：-p（创建父级目录）` } };
          }
        } else {
          路径组.push(参数);
        }
      }

      if (路径组.length === 0) {
        return { 有效: false, 错误: { 有错误: true, 消息: "mkdir：缺少目录名\n用法：mkdir [-p] <目录名/路径>" } };
      }
      if (路径组.length > 1) {
        return { 有效: false, 错误: { 有错误: true, 消息: "mkdir：参数过多\n用法：mkdir [-p] <目录名/路径>" } };
      }

      const 路径 = 路径组[0];
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
      const 处理后目录组 = [];
      let 当前节点 = 父节点;
      for (let i = 0; i < 目录名组.length - 1; i++) {
        const 名 = 目录名组[i];
        if (名 === "..") {
          if (当前节点.父节点) 当前节点 = 当前节点.父节点;
        } else if (名 !== ".") {
          const 子节点 = 当前节点.子节点组.find((n) => n.名称 === 名);
          if (!子节点) {
            if (!创建父级) {
              return { 有效: false, 错误: { 有错误: true, 消息: `mkdir：目录不存在：${名}\n使用 -p 参数自动创建父级目录` } };
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
          return { 有效: true, 命令: "mkdir", 静默忽略: true };
        }
        return { 有效: false, 错误: { 有错误: true, 消息: `mkdir：已存在同名项：${最终目录名}` } };
      }

      return { 有效: true, 命令: "mkdir", 名称: 最终目录名, 父节点: 当前节点, 创建父级 };
    }

    case "rmdir": {
      if (参数组.length === 0) {
        return { 有效: false, 错误: { 有错误: true, 消息: "rmdir：缺少目录名\n用法：rmdir <目录名>" } };
      }
      if (参数组.length > 1) {
        return { 有效: false, 错误: { 有错误: true, 消息: "rmdir：参数过多\n用法：rmdir <目录名>" } };
      }
      const 名称 = 参数组[0];
      if (名称.includes("/") && 名称 !== "/") {
        return { 有效: false, 错误: { 有错误: true, 消息: "rmdir：请使用目录名而非路径\n用法：rmdir <目录名>" } };
      }
      const 目标节点 = 当前位置节点.子节点组.find((n) => n.名称 === 名称);
      if (!目标节点) {
        return { 有效: false, 错误: { 有错误: true, 消息: `rmdir：目录不存在：${名称}` } };
      }
      if (目标节点.类型 !== "目录") {
        return { 有效: false, 错误: { 有错误: true, 消息: `rmdir：${名称} 不是目录\n请使用 rm 删除文件` } };
      }
      if (目标节点.子节点组.length > 0) {
        return { 有效: false, 错误: { 有错误: true, 消息: `rmdir：目录非空：${名称}\n请先删除目录内的所有内容` } };
      }
      return { 有效: true, 命令: "rmdir", 目标: 目标节点, 名称 };
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
            else return { 有效: false, 错误: { 有错误: true, 消息: `rm：无效参数 -${标志}\n支持：-f（强制）-r（递归）` } };
          }
        } else {
          名称组.push(参数);
        }
      }

      if (名称组.length === 0) {
        return { 有效: false, 错误: { 有错误: true, 消息: "rm：缺少文件名\n用法：rm [-f] [-r] <文件名>" } };
      }
      if (名称组.length > 1) {
        return { 有效: false, 错误: { 有错误: true, 消息: "rm：一次只能删除一个文件\n用法：rm [-f] [-r] <文件名>" } };
      }
      if (名称组[0].includes("/") && 名称组[0] !== "/") {
        return { 有效: false, 错误: { 有错误: true, 消息: "rm：请使用文件名而非路径\n用法：rm [-f] [-r] <文件名>" } };
      }

      const 名称 = 名称组[0];
      const 目标节点 = 当前位置节点.子节点组.find((n) => n.名称 === 名称);
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
        return { 有效: true, 命令: "rm", 目标: 目标节点, 名称, 递归: true, 强制 };
      }
      return { 有效: true, 命令: "rm", 目标: 目标节点, 名称, 递归: false, 强制 };
    }

    case "touch": {
      if (参数组.length === 0) {
        return { 有效: false, 错误: { 有错误: true, 消息: "touch：缺少文件名\n用法：touch <文件名>" } };
      }
      if (参数组.length > 1) {
        return { 有效: false, 错误: { 有错误: true, 消息: "touch：参数过多\n用法：touch <文件名>" } };
      }
      const 名称 = 参数组[0];
      if (名称.startsWith("-")) {
        return { 有效: false, 错误: { 有错误: true, 消息: "touch：不支持该参数\n用法：touch <文件名>" } };
      }
      if (名称.includes("/")) {
        return { 有效: false, 错误: { 有错误: true, 消息: "touch：文件名不能包含 /" } };
      }
      const 重复 = 当前位置节点.子节点组.find((n) => n.名称 === 名称);
      if (重复) {
        return { 有效: false, 静默忽略: true, 消息: `touch：${名称} 已存在（已更新）` };
      }
      return { 有效: true, 命令: "touch", 名称 };
    }

    case "cp": {
      let 递归 = false;
      let 路径组 = [];
      for (const 参数 of 参数组) {
        if (参数.startsWith("-")) {
          const 标志组 = 参数.slice(1).split("");
          for (const 标志 of 标志组) {
            if (标志 === "r" || 标志 === "R") 递归 = true;
            else return { 有效: false, 错误: { 有错误: true, 消息: `cp：无效参数 -${标志}\n支持：-r（递归复制目录）` } };
          }
        } else {
          路径组.push(参数);
        }
      }
      if (路径组.length < 2) {
        return { 有效: false, 错误: { 有错误: true, 消息: "cp：缺少源或目标\n用法：cp [-r] <源> <目标>" } };
      }
      if (路径组.length > 2) {
        return { 有效: false, 错误: { 有错误: true, 消息: "cp：参数过多\n用法：cp [-r] <源> <目标>" } };
      }
      const 源路径 = 路径组[0];
      const 目标路径 = 路径组[1];
      const 源节点 = 解析相对路径(源路径);
      if (!源节点) {
        return { 有效: false, 错误: { 有错误: true, 消息: `cp：源路径不存在：${源路径}` } };
      }
      if (源节点 === 根节点) {
        return { 有效: false, 错误: { 有错误: true, 消息: "cp：不能复制根目录" } };
      }
      if (源节点.类型 === "目录" && !递归) {
        return { 有效: false, 错误: { 有错误: true, 消息: `cp：${源路径} 是目录\n请使用 cp -r 递归复制目录` } };
      }
      // 解析目标：可以是目录或新名称
      let 目标父节点;
      let 新名称;
      if (目标路径.endsWith("/")) {
        // 目标必须是已存在的目录
        const 目标目录 = 解析相对路径(目标路径.slice(0, -1));
        if (!目标目录 || 目标目录.类型 !== "目录") {
          return { 有效: false, 错误: { 有错误: true, 消息: `cp：目标目录不存在：${目标路径}` } };
        }
        目标父节点 = 目标目录;
        新名称 = 源节点.名称;
      } else {
        const 目标节点 = 解析相对路径(目标路径);
        if (目标节点) {
          if (目标节点.类型 === "目录") {
            目标父节点 = 目标节点;
            新名称 = 源节点.名称;
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
      // 检查目标父目录下是否已有同名项
      const 同名 = 目标父节点.子节点组.find((n) => n.名称 === 新名称);
      if (同名 && 同名 !== 源节点) {
        return { 有效: false, 错误: { 有错误: true, 消息: `cp：目标已存在同名项：${新名称}` } };
      }
      return { 有效: true, 命令: "cp", 源: 源节点, 目标父节点, 新名称, 递归 };
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
      if (路径组.length > 2) {
        return { 有效: false, 错误: { 有错误: true, 消息: "mv：参数过多\n用法：mv <源> <目标>" } };
      }
      const 源路径 = 路径组[0];
      const 目标路径 = 路径组[1];
      const 源节点 = 解析相对路径(源路径);
      if (!源节点) {
        return { 有效: false, 错误: { 有错误: true, 消息: `mv：源路径不存在：${源路径}` } };
      }
      if (源节点 === 根节点) {
        return { 有效: false, 错误: { 有错误: true, 消息: "mv：不能移动根目录" } };
      }
      // 解析目标
      let 目标父节点;
      let 新名称;
      if (目标路径.endsWith("/")) {
        const 目标目录 = 解析相对路径(目标路径.slice(0, -1));
        if (!目标目录 || 目标目录.类型 !== "目录") {
          return { 有效: false, 错误: { 有错误: true, 消息: `mv：目标目录不存在：${目标路径}` } };
        }
        目标父节点 = 目标目录;
        新名称 = 源节点.名称;
      } else {
        const 目标节点 = 解析相对路径(目标路径);
        if (目标节点) {
          if (目标节点.类型 === "目录") {
            目标父节点 = 目标节点;
            新名称 = 源节点.名称;
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
      // 不能移动到自己或自己的后代
      let 检查节点 = 目标父节点;
      while (检查节点) {
        if (检查节点 === 源节点) {
          return { 有效: false, 错误: { 有错误: true, 消息: "mv：不能将目录移动到自己的子目录中" } };
        }
        检查节点 = 检查节点.父节点;
      }
      const 同名 = 目标父节点.子节点组.find((n) => n.名称 === 新名称);
      if (同名 && 同名 !== 源节点) {
        return { 有效: false, 错误: { 有错误: true, 消息: `mv：目标已存在同名项：${新名称}` } };
      }
      return { 有效: true, 命令: "mv", 源: 源节点, 目标父节点, 新名称 };
    }
  }
}

function 执行命令() {
  const 输入 = 命令输入框.value;
  if (!输入.trim()) return;

  // 清除之前的错误提示
  错误提示组 = [];

  // 加入历史
  命令历史.push(输入);
  if (命令历史.length > 10) 命令历史.shift();
  历史索引 = -1;
  临时输入 = "";

  const 解析 = 解析命令(输入);
  命令输入框.value = "";
  更新命令高亮(); // 同步清空高亮层

  // 记录命令（无论对错）
  const 命令正确 = 解析.有效 || !!解析.静默忽略;
  命令记录组.push({ 命令: 输入, 正确: 命令正确 });

  if (!解析.有效) {
    if (解析.静默忽略) {
      更新提示符();
      return;
    }
    if (解析.错误) {
      显示错误(解析.错误.消息);
    }
    return;
  }

  switch (解析.命令) {
    case "cd":
      执行cd(解析.目标);
      break;
    case "mkdir":
      if (解析.静默忽略) break; // -p 模式下已存在则静默成功
      执行mkdir(解析.名称, 解析.父节点);
      break;
    case "rmdir":
      执行rmdir(解析.目标);
      break;
    case "rm":
      执行rm(解析.目标, 解析.递归);
      break;
    case "touch":
      执行touch(解析.名称);
      break;
    case "cp":
      执行cp(解析.源, 解析.目标父节点, 解析.新名称, 解析.递归);
      break;
    case "mv":
      执行mv(解析.源, 解析.目标父节点, 解析.新名称);
      break;
  }

  更新提示符();
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
          起点X: 参数.终点X, 起点Y: 参数.终点Y,
          控制点1X: 参数.控制点2X, 控制点1Y: 参数.控制点2Y,
          控制点2X: 参数.控制点1X, 控制点2Y: 参数.控制点1Y,
          终点X: 参数.起点X, 终点Y: 参数.起点Y,
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
        const 点 = 计算贝塞尔点(t, 参数.起点X, 参数.起点Y, 参数.控制点1X, 参数.控制点1Y, 参数.控制点2X, 参数.控制点2Y, 参数.终点X, 参数.终点Y);
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
    布局并动画();
    更新提示符();
  }, 配置.动画时长);
  布局并动画();
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
    布局并动画();
    更新提示符();
  }, 配置.动画时长);
  布局并动画();
}

function 执行touch(名称) {
  const 新节点 = 创建节点("文件", 名称, 当前位置节点);
  测量节点尺寸(新节点);
  // 寻找不重叠且靠近当前节点的位置
  const 空位 = 寻找近处空位(当前位置节点, 新节点.宽, 新节点.高);
  新节点.x = 空位.x;
  新节点.y = 空位.y;
  新节点.固定位置 = true; // 固定位置，不参与自动布局
  当前位置节点.子节点组.push(新节点);
  节点表.set(新节点.id, 新节点);
  布局并动画();
}

// 深拷贝子树（用于 cp 递归复制目录），每个节点都寻找不重叠的空位
function 克隆子树(源节点, 新父节点) {
  const 新节点 = 创建节点(源节点.类型, 源节点.名称, 新父节点);
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
    // 递归复制整个子树
    const 新节点 = 创建节点("目录", 新名称, 目标父节点);
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
    // 复制单个文件
    const 新节点 = 创建节点("文件", 新名称, 目标父节点);
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
  请求重绘();
}

function 显示错误(消息) {
  错误提示组.push({
    消息,
    阶段: "显示",
    开始时间: performance.now(),
  });
  请求重绘();
}

// ==================== 历史记录 ====================
function 处理键盘事件(事件) {
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
  节点表.clear();
  节点表.set(根节点.id, 根节点);

  const 已用名称 = new Set();
  const 所有目录组 = [根节点];

  // 先随机决定总层数：1-5（1 层 = 只有根目录）
  const 最大层数 = 1 + Math.floor(Math.random() * 5); // 1~5

  if (最大层数 >= 2) {
    const 根子节点数 = 2 + Math.floor(Math.random() * 2); // 2-3
    for (let i = 0; i < 根子节点数; i++) {
      const 名称 = 取随机名称(目录名称池, 已用名称);
      const 子目录 = 创建节点("目录", 名称, 根节点);
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
      随机目录.子节点组.push(文件);
      节点表.set(文件.id, 文件);
    }
  }

  // 随机选择当前位置
  当前位置节点 = 所有目录组[Math.floor(Math.random() * 所有目录组.length)];
  当前位置节点.是当前位置 = true;
  当前位置节点.当前位置过渡 = 1;

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

  布局并动画();
  更新提示符();
}

function 模拟真实初始化() {
  根节点 = 创建节点("目录", "/", null);
  节点表.clear();
  节点表.set(根节点.id, 根节点);

  const 一级目录组 = ["bin", "boot", "dev", "etc", "home", "lib", "lib64", "media", "mnt", "opt", "proc", "root", "run", "sbin", "srv", "sys", "tmp", "usr", "var"];
  const 目录映射 = {};

  for (const 名称 of 一级目录组) {
    const 子目录 = 创建节点("目录", 名称, 根节点);
    根节点.子节点组.push(子目录);
    节点表.set(子目录.id, 子目录);
    目录映射[名称] = 子目录;
  }

  // home/用户名/公共、模板、视频、图片、文档、下载、音乐、桌面
  const 用户名 = 创建节点("目录", "user", 目录映射["home"]);
  目录映射["home"].子节点组.push(用户名);
  节点表.set(用户名.id, 用户名);

  const 用户子目录组 = ["公共", "模板", "视频", "图片", "文档", "下载", "音乐", "桌面"];
  for (const 名称 of 用户子目录组) {
    const 子目录 = 创建节点("目录", 名称, 用户名);
    用户名.子节点组.push(子目录);
    节点表.set(子目录.id, 子目录);
  }

  当前位置节点 = 用户名;
  当前位置节点.是当前位置 = true;
  当前位置节点.当前位置过渡 = 1;

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
  根节点 = null;
  当前位置节点 = null;
  节点表.clear();
  全局层级计数器 = 1; // 重置层级计数器
  视图偏移X = 0;
  视图偏移Y = 0;
  正在拖拽视图 = false;

  const 选中模式 = document.querySelector('input[name="初始化模式"]:checked');
  const 模式 = 选中模式 ? 选中模式.value : "随机";

  // 保存到 localStorage
  localStorage.setItem("文件操作初始化模式", 模式);

  if (模式 === "仅根目录") {
    仅根目录初始化();
  } else if (模式 === "模拟真实") {
    模拟真实初始化();
  } else {
    随机初始化();
  }
}

// ==================== 启动时恢复设置 ====================
function 恢复初始化模式() {
  const 保存的模式 = localStorage.getItem("文件操作初始化模式");
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
  if (根节点) 布局并动画();
  请求重绘();
}

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
    命令单元格.textContent = 记录.命令;
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
重置按钮.addEventListener("click", 重置);
画布.addEventListener("mousedown", 处理鼠标按下);
画布.addEventListener("mousemove", 处理鼠标移动);
画布.addEventListener("mouseup", 处理鼠标松开);
画布.addEventListener("mouseleave", 处理鼠标松开);

// 在指定区域松开鼠标后自动聚焦命令输入框
function 聚焦命令输入框() {
  命令输入框.focus();
}
重置按钮.addEventListener("mouseup", 聚焦命令输入框);
画布.addEventListener("mouseup", 聚焦命令输入框);
document.querySelector(".设置区").addEventListener("mouseup", 聚焦命令输入框);
window.addEventListener("resize", 调整画布尺寸);

// 空格键：按下时禁止页面滚动，进入视图拖拽准备状态
window.addEventListener("keydown", (事件) => {
  if (事件.code === "Space" && document.activeElement !== 命令输入框) {
    事件.preventDefault();
    if (!空格按下) {
      空格按下 = true;
      画布.style.cursor = "grab";
    }
  }
});
window.addEventListener("keyup", (事件) => {
  if (事件.code === "Space") {
    空格按下 = false;
    正在拖拽视图 = false;
    画布.style.cursor = "var(--光标-默认)";
  }
});

// Ctrl 键：拖拽中按下/松开时，实时切换子节点是否跟随
window.addEventListener("keydown", (事件) => {
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
    localStorage.setItem("文件操作初始化模式", 单选按钮.value);
  });
});

// 显示隐藏复选框变化时重绘并保存到 localStorage
if (显示隐藏复选框) {
  // 启动时恢复选中状态
  const 保存的显示隐藏 = localStorage.getItem("文件操作显示隐藏");
  if (保存的显示隐藏 === "true") {
    显示隐藏复选框.checked = true;
  }
  显示隐藏复选框.addEventListener("change", () => {
    localStorage.setItem("文件操作显示隐藏", 显示隐藏复选框.checked);
    请求重绘();
  });
}

// ==================== 启动 ====================
恢复初始化模式();
调整画布尺寸();
重置();
聚焦命令输入框();
