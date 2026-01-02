const 画布 = document.getElementById("canvas");
const 上下文 = 画布.getContext("2d");

const 存储键 = "ease-animation-state-v1";
const 固定移动距离 = 1000;
const 默认状态 = {
  当前曲线: "移动",
  曲线集: {
    移动: {
      控制点1: { x: 0.25, y: 0.25 },
      控制点2: { x: 0.75, y: 0.75 },
    },
    跳跃: {
      控制点1: { x: 0.25, y: 0.25 },
      控制点2: { x: 0.75, y: 0.75 },
    },
  },
  参数: {
    跳跃时长: 500,
    跳跃高度: 150,
    移动距离: 固定移动距离,
    最高速度: 500,
    音效音量: 50,
    加速时长: 1000,
  },
};

const 坐标显示配置 = {
  颜色: {
    标签: "#ffba41",
    括号: "#6cb6e4",
    数字: "silver",
    小数点: "#aaa",
    逗号: "gray",
  },
  坐标间隔: 50,
  括号间距: 1,
};

const 滑块样式配置 = {
  数值与单位间隔: 23,
};

const 角色尺寸配置 = {
  存储键: "ease-animation-char-size-v1",
  最小: 50,
  最大: 300,
  默认: 120,
};

const 布局样式配置 = {
  基础内边距: 24,
  贝塞尔左侧额外间距: 10,
};

const 滑块列表 = [
  { 键: "跳跃时长", 标签: "跳跃时长", 单位: "毫秒", 最小: 200, 最大: 5000, 步长: 50 },
  { 键: "跳跃高度", 标签: "跳跃高度", 单位: "像素", 最小: 20, 最大: 500, 步长: 5 },
  { 键: "加速时长", 标签: "加速时长", 单位: "毫秒", 最小: 100, 最大: 3000, 步长: 50 },
  { 键: "最高速度", 标签: "最高速度", 单位: "像素/秒", 最小: 20, 最大: 1000, 步长: 10 },
  { 键: "音效音量", 标签: "音效音量", 单位: "%", 最小: 0, 最大: 100, 步长: 1 },
];

const 界面引用 = {
  贝塞尔区域: { x: 0, y: 0, width: 0, height: 0 },
  控制柄: { 控制点1: { x: 0, y: 0 }, 控制点2: { x: 0, y: 0 } },
  切换按钮: { 移动: { x: 0, y: 0, width: 0, height: 0 }, 跳跃: { x: 0, y: 0, width: 0, height: 0 } },
  滑轨列表: [],
};

const 交互状态 = {
  悬停柄: null,
  活动柄: null,
  活动滑块: null,
  悬停滑块: null,
  悬停按钮: null,
  指针编号: null,
};

const 布局 = {
  方向: "竖直",
  参数区: { x: 0, y: 0, width: 0, height: 0 },
  动画区: { x: 0, y: 0, width: 0, height: 0 },
};

const 按键集合 = new Set();

const 状态 = 初始化状态();
const 忍者图像 = new Image();
忍者图像.src = "./Images/忍者.png";
const 落地音效 = new Audio("./Audios/落地.mp3");
落地音效.volume = 限制值(状态.参数.音效音量 / 100, 0, 1);
const 忍者精灵 = {
  帧宽: 348,
  帧高: 348,
  朝右: { 起始X: 0, 起始Y: 0 },
  朝左: { 起始X: 349, 起始Y: 0 },
};

let 角色显示宽度 = 读取角色尺寸();
let 角色显示高度 = 角色显示宽度;

const 角色 = {
  世界X: 0,
  垂直位移: 0,
  朝向: 1,
  移动方向: 0,
  移动计时: 0,
  减速中: false,
  跳跃中: false,
  跳跃计时: 0,
  当前移动速度: 0,
  当前跳跃速度: 0,
  起跳水平速度: 0,
  起跳方向: 0,
  上一垂直位移: 0,
};


let 上次时间戳 = 0;

自适应画布尺寸();
window.addEventListener("resize", 自适应画布尺寸);
画布.addEventListener("pointerdown", 处理指针按下);
画布.addEventListener("pointermove", 处理指针移动);
画布.addEventListener("pointerup", 处理指针抬起);
画布.addEventListener("pointerleave", 处理指针抬起);
画布.addEventListener("pointercancel", 处理指针抬起);
window.addEventListener("keydown", 处理按键按下, { passive: false });
window.addEventListener("keyup", 处理按键抬起);

requestAnimationFrame(动画帧循环);

function 初始化状态() {
  const 克隆 = (对象) => structuredClone(对象);
  const 基础状态 = 克隆(默认状态);
  try {
    const 已存 = localStorage.getItem(存储键);
    if (!已存) return 基础状态;
    const 解析 = JSON.parse(已存);
    if (解析.当前曲线 === "跳跃" || 解析.当前曲线 === "移动") {
      基础状态.当前曲线 = 解析.当前曲线;
    }
    if (解析.曲线集) {
      ["移动", "跳跃"].forEach((类型) => {
        if (解析.曲线集[类型]) {
          ["控制点1", "控制点2"].forEach((柄) => {
            if (解析.曲线集[类型][柄]) {
              const { x, y } = 解析.曲线集[类型][柄];
              基础状态.曲线集[类型][柄] = {
                x: 限制值(Number(x) || 0, 0, 1),
                y: 限制值(Number(y) || 0, 0, 1),
              };
            }
          });
        }
      });
    }
    if (解析.参数) {
      滑块列表.forEach((滑块) => {
        const 数值 = 解析.参数[滑块.键];
        if (typeof 数值 === "number") {
          基础状态.参数[滑块.键] = 限制值(数值, 滑块.最小, 滑块.最大);
        }
      });
      if (typeof 解析.参数.移动最高速度 === "number" && typeof 解析.参数.最高速度 !== "number") {
        基础状态.参数.最高速度 = 限制值(解析.参数.移动最高速度, 20, 1000);
      }
    }
  } catch (error) {
    console.warn("无法解析本地设置，使用默认值", error);
  }
  基础状态.参数.移动距离 = 固定移动距离;
  return 基础状态;
}

function 保存本地状态() {
  try {
    localStorage.setItem(存储键, JSON.stringify(状态));
  } catch (error) {
    console.warn("无法保存设置", error);
  }
}

function 自适应画布尺寸() {
  const 像素比 = window.devicePixelRatio || 1;
  const { width, height } = 画布.getBoundingClientRect();
  画布.width = width * 像素比;
  画布.height = height * 像素比;
  上下文.setTransform(1, 0, 0, 1, 0, 0);
  上下文.scale(像素比, 像素比);
  更新界面布局(width, height);
}

function 更新界面布局(宽度, 高度) {
  布局.方向 = 宽度 >= 高度 ? "竖直" : "水平";
  if (布局.方向 === "竖直") {
    const 分割线 = 宽度 * 0.35;
    布局.参数区 = { x: 0, y: 0, width: 分割线, height: 高度 };
    布局.动画区 = { x: 分割线, y: 0, width: 宽度 - 分割线, height: 高度 };
  } else {
    const 分割线 = 高度 * 0.5;
    布局.参数区 = { x: 0, y: 0, width: 宽度, height: 分割线 };
    布局.动画区 = { x: 0, y: 分割线, width: 宽度, height: 高度 - 分割线 };
  }
}

function 动画帧循环(时间戳) {
  if (!上次时间戳) 上次时间戳 = 时间戳;
  const 帧间隔 = Math.min((时间戳 - 上次时间戳) / 1000, 0.05);
  上次时间戳 = 时间戳;
  更新模拟(帧间隔);
  渲染界面帧();
  requestAnimationFrame(动画帧循环);
}

function 更新模拟(时间增量) {
  限制角色位置();
  const 跳跃秒 = Math.max(状态.参数.跳跃时长 / 1000, 0.001);
  const 加速秒 = Math.max(状态.参数.加速时长 / 1000, 0.001);
  const 移动意图 = 计算移动意图();

  if (角色.跳跃中) {
    角色.当前移动速度 = 角色.起跳水平速度;
    if (角色.起跳方向 !== 0 && 角色.起跳水平速度 > 0) {
      const 水平步长 = 角色.起跳水平速度 * 角色.起跳方向 * 时间增量;
      角色.世界X = 限制值(角色.世界X + 水平步长, 0, 获取移动上限());
      角色.朝向 = 角色.起跳方向;
    }
  } else {
    if (移动意图 !== 0) {
      if (角色.移动方向 !== 移动意图) {
        角色.移动计时 = 0;
      }
      角色.减速中 = false;
      角色.移动方向 = 移动意图;
      角色.移动计时 = Math.min(角色.移动计时 + 时间增量, 加速秒);
    } else if (角色.移动方向 !== 0) {
      角色.减速中 = true;
      角色.移动计时 = Math.max(角色.移动计时 - 时间增量, 0);
      if (角色.移动计时 === 0) {
        角色.移动方向 = 0;
        角色.当前移动速度 = 0;
        角色.减速中 = false;
      }
    } else {
      角色.移动计时 = 0;
      角色.当前移动速度 = 0;
      角色.减速中 = false;
    }

    if (角色.移动方向 !== 0) {
      const t = 加速秒 > 0 ? 角色.移动计时 / 加速秒 : 0;
      const 移动进度 = 计算贝塞尔(状态.曲线集.移动, t);
      角色.当前移动速度 = 移动进度 * 状态.参数.最高速度;
      角色.世界X = 限制值(角色.世界X + 角色.当前移动速度 * 角色.移动方向 * 时间增量, 0, 获取移动上限());
      角色.朝向 = 角色.移动方向;
    }
  }

  if (角色.跳跃中) {
    角色.跳跃计时 = Math.min(角色.跳跃计时 + 时间增量, 跳跃秒);
    const 跳跃归一 = 角色.跳跃计时 / 跳跃秒;
    const 上升阶段 = 跳跃归一 <= 0.5;
    const 相位 = 上升阶段 ? 跳跃归一 * 2 : (跳跃归一 - 0.5) * 2;
    const 反向相位 = 1 - 相位;
    const 位置归一 = 上升阶段 ? 计算贝塞尔(状态.曲线集.跳跃, 相位) : 计算贝塞尔(状态.曲线集.跳跃, 反向相位);
    角色.垂直位移 = 状态.参数.跳跃高度 * 位置归一;
    if (时间增量 > 0) {
      角色.当前跳跃速度 = Math.abs((角色.垂直位移 - 角色.上一垂直位移) / 时间增量);
    }
    角色.上一垂直位移 = 角色.垂直位移;
    if (角色.跳跃计时 >= 跳跃秒) {
      重置跳跃状态();
    }
  } else {
    角色.当前跳跃速度 = 0;
    角色.上一垂直位移 = 0;
  }
}

function 渲染界面帧() {
  const 画布宽 = 画布.clientWidth;
  const 画布高 = 画布.clientHeight;
  上下文.clearRect(0, 0, 画布宽, 画布高);
  绘制参数区域();
  绘制动画区域();
}

function 绘制参数区域() {
  const 区域 = 布局.参数区;
  const 内边距 = 布局样式配置.基础内边距;
  const 左侧基准 = 内边距 + 布局样式配置.贝塞尔左侧额外间距;
  上下文.save();
  上下文.fillStyle = "#151515";
  上下文.fillRect(区域.x, 区域.y, 区域.width, 区域.height);
  const 渐变 = 上下文.createLinearGradient(区域.x, 区域.y, 区域.x, 区域.y + 区域.height);
  渐变.addColorStop(0, "rgba(62,62,62,0.15)");
  渐变.addColorStop(1, "rgba(12,12,12,0.8)");
  上下文.fillStyle = 渐变;
  上下文.fillRect(区域.x, 区域.y, 区域.width, 区域.height);

  上下文.fillStyle = "#f2f2f2";
  上下文.font = "600 22px 'Google Sans Code', 'Noto Sans SC', sans-serif";
  上下文.fillText("参数调节区域", 区域.x + 左侧基准, 区域.y + 内边距 + 6);

  绘制曲线切换(区域, 内边距, 左侧基准);
  绘制贝塞尔编辑(区域, 内边距, 左侧基准);
  绘制滑块(区域, 内边距, 左侧基准);
  上下文.restore();
}

function 绘制曲线切换(区域, 内边距, 左侧基准) {
  const 按钮宽 = 120;
  const 按钮高 = 32;
  const 起始X = 区域.x + 左侧基准;
  const 起始Y = 区域.y + 内边距 + 28;
  const 间隔 = 12;
  const 曲线列表 = [
    { 键: "移动", 标签: "移动曲线" },
    { 键: "跳跃", 标签: "跳跃曲线" },
  ];
  曲线列表.forEach((曲线, 索引) => {
    const x = 起始X + 索引 * (按钮宽 + 间隔);
    const y = 起始Y;
    const 悬停 = 交互状态.悬停按钮 === 曲线.键;
    const 激活 = 状态.当前曲线 === 曲线.键;
    上下文.beginPath();
    绘制圆角矩形(上下文, x, y, 按钮宽, 按钮高, 5);
    上下文.fillStyle = 激活 ? "#2761c4ff" : 悬停 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)";
    上下文.fill();
    上下文.lineWidth = 1;
    上下文.strokeStyle = 激活 ? "transparent" : "rgba(255,255,255,0.08)";
    上下文.stroke();
    上下文.fillStyle = 激活 ? "#fff" : "#ccc";
    上下文.font = "500 14px 'Noto Sans SC', sans-serif";
    上下文.textAlign = "center";
    上下文.textBaseline = "middle";
    上下文.fillText(曲线.标签, x + 按钮宽 / 2, y + 按钮高 / 2 + 1);
    界面引用.切换按钮[曲线.键] = { x, y, width: 按钮宽, height: 按钮高 };
  });
  上下文.textAlign = "left";
  上下文.textBaseline = "alphabetic";
}

function 绘制贝塞尔编辑(区域, 内边距) {
  const 编辑顶部 = 区域.y + 内边距 + 80;
  const 编辑高 = 区域.height * 0.6;
  const 左侧基准 = 内边距 + 布局样式配置.贝塞尔左侧额外间距;
  const 右侧基准 = 内边距;
  const 编辑宽 = 区域.width - 左侧基准 - 右侧基准;
  const 编辑区 = { x: 区域.x + 左侧基准, y: 编辑顶部, width: 编辑宽, height: 编辑高 };
  界面引用.贝塞尔区域 = 编辑区;

  上下文.save();
  上下文.fillStyle = "#0f0f0f";
  上下文.fillRect(编辑区.x, 编辑区.y, 编辑区.width, 编辑区.height);
  上下文.strokeStyle = "rgba(255,255,255,0.08)";
  上下文.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const x = 编辑区.x + (编辑区.width / 4) * i;
    const y = 编辑区.y + (编辑区.height / 4) * i;
    上下文.beginPath();
    上下文.moveTo(x, 编辑区.y);
    上下文.lineTo(x, 编辑区.y + 编辑区.height);
    上下文.stroke();
    上下文.beginPath();
    上下文.moveTo(编辑区.x, y);
    上下文.lineTo(编辑区.x + 编辑区.width, y);
    上下文.stroke();
  }

  绘制坐标轴与刻度(编辑区);

  const 当前曲线 = 状态.曲线集[状态.当前曲线];
  const P0 = { x: 0, y: 0 };
  const P3 = { x: 1, y: 1 };
  const 控制点集合 = {
    控制点1: 正规化到画布(当前曲线.控制点1, 编辑区),
    控制点2: 正规化到画布(当前曲线.控制点2, 编辑区),
    P0: 正规化到画布(P0, 编辑区),
    P3: 正规化到画布(P3, 编辑区),
  };
  界面引用.控制柄.控制点1 = 控制点集合.控制点1;
  界面引用.控制柄.控制点2 = 控制点集合.控制点2;

  上下文.strokeStyle = "rgba(255,255,255,0.25)";
  上下文.lineWidth = 2;
  上下文.beginPath();
  上下文.moveTo(控制点集合.P0.x, 控制点集合.P0.y);
  上下文.lineTo(控制点集合.控制点1.x, 控制点集合.控制点1.y);
  上下文.stroke();

  上下文.beginPath();
  上下文.moveTo(控制点集合.控制点2.x, 控制点集合.控制点2.y);
  上下文.lineTo(控制点集合.P3.x, 控制点集合.P3.y);
  上下文.stroke();

  上下文.strokeStyle = "#2fefb0";
  上下文.lineWidth = 2.5;
  上下文.beginPath();
  for (let t = 0; t <= 1.001; t += 0.02) {
    const 点 = 采样曲线点(当前曲线, t);
    const 画布点 = 正规化到画布(点, 编辑区);
    if (t === 0) 上下文.moveTo(画布点.x, 画布点.y);
    else 上下文.lineTo(画布点.x, 画布点.y);
  }
  上下文.stroke();

  const 动画进度 = 获取当前曲线进度();
  const 进度点 = 正规化到画布(采样曲线点(当前曲线, 动画进度), 编辑区);
  上下文.strokeStyle = "#ffd166";
  上下文.lineWidth = 2;
  上下文.beginPath();
  上下文.arc(进度点.x, 进度点.y, 8, 0, Math.PI * 2);
  上下文.stroke();

  绘制控制点(控制点集合.控制点1, "控制点1");
  绘制控制点(控制点集合.控制点2, "控制点2");

  上下文.font = "500 14px 'Google Sans Code', monospace";
  const { 颜色, 坐标间隔, 括号间距 } = 坐标显示配置;
  const 文本Y = 编辑区.y + 编辑区.height + 50;
  const 数字宽度 = (文本) => {
    let 宽 = 0;
    for (const 字符 of 文本) {
      宽 += 上下文.measureText(字符).width;
    }
    return 宽;
  };

  const 标记宽度 = (文本, 前间距 = 0, 后间距 = 0) => 前间距 + 上下文.measureText(文本).width + 后间距;

  const 计算坐标宽度 = (标签, 点) => {
    return (
      上下文.measureText(标签).width +
      标记宽度("(", 括号间距, 括号间距) +
      数字宽度(点.x.toFixed(2)) +
      标记宽度(",") +
      标记宽度(" ") +
      数字宽度(点.y.toFixed(2)) +
      标记宽度(")", 括号间距, 括号间距)
    );
  };

  const 块宽度 = 计算坐标宽度("P1", 当前曲线.控制点1) + 坐标间隔 + 计算坐标宽度("P2", 当前曲线.控制点2);
  let 光标X = 编辑区.x + (编辑区.width - 块宽度) / 2;

  const 绘制数字 = (文本) => {
    for (const 字符 of 文本) {
      if (字符 === ".") {
        上下文.fillStyle = 颜色.小数点;
      } else {
        上下文.fillStyle = 颜色.数字;
      }
      上下文.fillText(字符, 光标X, 文本Y);
      光标X += 上下文.measureText(字符).width;
    }
  };

  const 绘制标记 = (文本, 颜色值, 前间距 = 0, 后间距 = 0) => {
    上下文.fillStyle = 颜色值;
    光标X += 前间距;
    上下文.fillText(文本, 光标X, 文本Y);
    光标X += 上下文.measureText(文本).width + 后间距;
  };

  const 绘制坐标 = (标签, 点) => {
    绘制标记(标签, 颜色.标签);
    绘制标记("(", 颜色.括号, 括号间距, 括号间距);
    绘制数字(点.x.toFixed(2));
    绘制标记(",", 颜色.逗号);
    绘制标记(" ", 颜色.数字);
    绘制数字(点.y.toFixed(2));
    绘制标记(")", 颜色.括号, 括号间距, 括号间距);
  };

  绘制坐标("P1", 当前曲线.控制点1);
  光标X += 坐标间隔;
  绘制坐标("P2", 当前曲线.控制点2);
  上下文.restore();
}

function 绘制坐标轴与刻度(编辑区) {
  const 刻度列表 = [0, 0.25, 0.5, 0.75, 1];
  const 轴颜色 = "rgba(255,255,255,0.45)";
  const 刻度颜色 = "rgba(255,255,255,0.3)";
  const 文本颜色 = "rgba(255,255,255,0.75)";
  const 刻度长度 = 8;
  const 底部Y = 编辑区.y + 编辑区.height;

  const 是跳跃曲线 = 状态.当前曲线 === "跳跃";
  const x最大值 = 是跳跃曲线 ? 状态.参数.跳跃时长 : 状态.参数.加速时长;
  const y最大值 = 是跳跃曲线 ? 状态.参数.跳跃高度 : 状态.参数.最高速度;
  const x上限 = Math.max(x最大值, 1);
  const y上限 = Math.max(y最大值, 1);
  const y轴标题 = 是跳跃曲线 ? "高度" : "速度";

  const 格式化刻度 = (数值) => {
    if (数值 === 0) return "0";
    if (数值 >= 100) return String(Math.round(数值));
    const 保留 = 数值 >= 10 ? 1 : 2;
    return Number(数值.toFixed(保留)).toString();
  };

  上下文.save();
  上下文.strokeStyle = 轴颜色;
  上下文.lineWidth = 1.5;
  上下文.beginPath();
  上下文.moveTo(编辑区.x, 底部Y);
  上下文.lineTo(编辑区.x + 编辑区.width, 底部Y);
  上下文.stroke();
  上下文.beginPath();
  上下文.moveTo(编辑区.x, 底部Y);
  上下文.lineTo(编辑区.x, 编辑区.y);
  上下文.stroke();

  上下文.strokeStyle = 刻度颜色;
  上下文.fillStyle = 文本颜色;
  上下文.font = "400 14px 'Google Sans Code', 'Noto Sans SC', sans-serif";

  上下文.textAlign = "center";
  上下文.textBaseline = "bottom";
  刻度列表.forEach((刻度) => {
    const x = 编辑区.x + 刻度 * 编辑区.width;
    上下文.beginPath();
    上下文.moveTo(x, 底部Y);
    上下文.lineTo(x, 底部Y - 刻度长度);
    上下文.stroke();
    if (刻度 !== 0) {
      上下文.fillText(格式化刻度(刻度 * x上限), x, 底部Y - 刻度长度 - 4);
    }
  });

  上下文.textAlign = "left";
  上下文.textBaseline = "middle";
  刻度列表.forEach((刻度) => {
    const y = 编辑区.y + (1 - 刻度) * 编辑区.height;
    上下文.beginPath();
    上下文.moveTo(编辑区.x, y);
    上下文.lineTo(编辑区.x + 刻度长度, y);
    上下文.stroke();
    if (刻度 !== 0) {
      上下文.fillText(格式化刻度(刻度 * y上限), 编辑区.x + 刻度长度 + 6, y);
    }
  });

  // 原点处仅显示一个 0，放在区域外侧左下角
  上下文.textAlign = "right";
  上下文.textBaseline = "top";
  上下文.fillText("0", 编辑区.x - 6, 底部Y + 2);

  上下文.fillStyle = "rgba(53, 192, 146, 1)";
  上下文.textAlign = "center";
  上下文.textBaseline = "top";
  上下文.fillText("时间", 编辑区.x + 编辑区.width / 2, 底部Y + 10);

  上下文.save();
  上下文.translate(编辑区.x - 15, 编辑区.y + 编辑区.height / 2);
  上下文.rotate(-Math.PI / 2);
  上下文.textAlign = "center";
  上下文.textBaseline = "middle";
  上下文.fillText(y轴标题, 0, 0);
  上下文.restore();

  上下文.restore();
}

function 绘制滑块(区域, 内边距) {
  界面引用.滑轨列表 = [];
  const 起始Y = 区域.y + 内边距 + 80 + 区域.height * 0.6 + 100;
  const 标签宽 = 120;
  const 轨道宽 = Math.max(160, 区域.width - 内边距 * 2 - 标签宽 * 2 - 20);
  const 轨道高 = 6;
  const 间隔 = 36;
  滑块列表.forEach((滑块, 索引) => {
    上下文.save();
    const y = 起始Y + 索引 * 间隔;
    上下文.fillStyle = "#999";
    上下文.font = "500 14px 'Google Sans Code', 'Noto Sans SC', sans-serif";
    上下文.textAlign = "right";
    上下文.textBaseline = "middle";

    const 轨道X = 区域.x + 内边距 + 标签宽;
    const 轨道Y = y - 轨道高 / 2;
    const 比例 = (状态.参数[滑块.键] - 滑块.最小) / (滑块.最大 - 滑块.最小);
    const 手柄X = 轨道X + 轨道宽 * 比例;
    const 手柄Y = y - 1;
    const 参数文本 = `${状态.参数[滑块.键]}`;
    const 参数数值宽度 = 上下文.measureText(参数文本).width;
    const 单位宽度 = 上下文.measureText(`${滑块.单位}`).width;
    const 高亮中 = 交互状态.活动滑块 === 滑块.键 || 交互状态.悬停滑块 === 滑块.键;

    上下文.fillStyle = 高亮中 ? "#fff" : "#999";
    上下文.fillText(滑块.标签, 区域.x + 内边距 + 标签宽 - 20, y);

    上下文.fillStyle = "rgba(255,255,255,0.12)";
    上下文.fillRect(轨道X, 轨道Y, 轨道宽, 轨道高);
    const 填充色 = 高亮中 ? "#6cb6e4ff" : "#2f5baf";
    上下文.fillStyle = 填充色;
    上下文.fillRect(轨道X, 轨道Y, 轨道宽 * 比例, 轨道高);
    上下文.beginPath();
    上下文.arc(手柄X, 手柄Y, 9, 0, Math.PI * 2);
    if (高亮中) {
      上下文.fillStyle = "#993340ff";
      上下文.shadowColor = "rgba(81, 247, 255, 0.35)";
      上下文.shadowBlur = 8;
      上下文.lineWidth = 2.5;
      上下文.strokeStyle = "#7cf7ff";
    } else {
      上下文.fillStyle = "#111";
      上下文.lineWidth = 2;
      上下文.strokeStyle = "#51f7ff";
    }
    上下文.fill();
    上下文.stroke();
    上下文.shadowColor = "transparent";
    上下文.shadowBlur = 0;

    上下文.fillStyle = 高亮中 ? "gold" : "darkgoldenrod";
    上下文.textAlign = "left";
    上下文.fillText(参数文本, 轨道X + 轨道宽 + 20, y);
    上下文.fillStyle = 高亮中 ? "#fff" : "#999";
    const 数值与单位间隔 = 滑块样式配置.数值与单位间隔;
    if (滑块.单位.includes("/")) {
      const [单位前, 单位后] = 滑块.单位.split("/");
      const 单位前宽度 = 上下文.measureText(单位前).width + 4;
      const 斜杠宽度 = 上下文.measureText("/").width + 4;
      上下文.fillText(单位前, 轨道X + 轨道宽 + 数值与单位间隔 + 参数数值宽度, y);
      上下文.fillStyle = 高亮中 ? "#aaa" : "#666";
      上下文.fillText("/", 轨道X + 轨道宽 + 数值与单位间隔 + 参数数值宽度 + 单位前宽度, y);
      上下文.fillStyle = 高亮中 ? "#fff" : "#999";
      上下文.fillText(单位后, 轨道X + 轨道宽 + 数值与单位间隔 + 参数数值宽度 + 单位前宽度 + 斜杠宽度, y);
    } else {
      上下文.fillText(`${滑块.单位}`, 轨道X + 轨道宽 + 数值与单位间隔 + 参数数值宽度, y);
    }

    界面引用.滑轨列表.push({
      键: 滑块.键,
      x: 轨道X - 15, // 扩大命中区域，覆盖thumb
      y: 轨道Y - 12,
      width: 轨道宽 + 30,
      height: 轨道高 + 24,
      轨道X,
      轨道宽,
      手柄X,
      手柄Y,
      手柄半径: 12,
    });
    上下文.restore();
  });
}

function 绘制动画区域() {
  const 区域 = 布局.动画区;
  上下文.save();
  const 渐变 = 上下文.createLinearGradient(区域.x, 区域.y, 区域.x, 区域.y + 区域.height);
  渐变.addColorStop(0, "#040b14");
  渐变.addColorStop(1, "#070707");
  上下文.fillStyle = 渐变;
  上下文.fillRect(区域.x, 区域.y, 区域.width, 区域.height);

  const 内边距 = 40;
  const 轨道起点 = 区域.x + 内边距;
  const 轨道终点 = 区域.x + 区域.width - 内边距;
  const 轨道宽 = Math.max(轨道终点 - 轨道起点, 100);
  const 地面Y = 区域.y + 区域.height - 内边距;
  const 可用轨道宽 = Math.max(轨道宽 - 角色显示宽度, 1);
  const 比例 = 可用轨道宽 / Math.max(获取移动上限(), 1);

  上下文.strokeStyle = "rgba(255,255,255,0.1)";
  上下文.lineWidth = 1;
  上下文.beginPath();
  上下文.moveTo(轨道起点, 地面Y);
  上下文.lineTo(轨道终点, 地面Y);
  上下文.stroke();

  上下文.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i <= 10; i++) {
    const x = 轨道起点 + (轨道宽 / 10) * i;
    上下文.fillRect(x - 1, 区域.y + 内边距, 2, 地面Y - 区域.y - 内边距);
  }

  绘制角色尺寸滑块(区域);

  const 跳跃缩放 = Math.min(1, (区域.height * 0.5) / Math.max(状态.参数.跳跃高度, 1));
  const 角色屏幕X = 轨道起点 + 角色.世界X * 比例;
  const 跳跃偏移 = 角色.垂直位移 * 跳跃缩放;
  const 基线Y = 地面Y - 角色显示高度;
  const 角色Y = 基线Y - 跳跃偏移;

  if (忍者图像.complete) {
    const 帧 = 角色.朝向 >= 0 ? 忍者精灵.朝右 : 忍者精灵.朝左;
    上下文.drawImage(
      忍者图像,
      帧.起始X,
      帧.起始Y,
      忍者精灵.帧宽,
      忍者精灵.帧高,
      角色屏幕X,
      角色Y,
      角色显示宽度,
      角色显示高度
    );
    绘制倒影(帧, 角色屏幕X, 地面Y, 跳跃偏移 * 0.5);
  } else {
    上下文.fillStyle = "#ff5e5e";
    上下文.fillRect(角色屏幕X, 角色Y, 角色显示宽度, 角色显示高度);
  }

  上下文.fillStyle = "rgba(255,255,255,0.15)";
  上下文.fillRect(轨道起点, 地面Y, 轨道宽, 6);
  上下文.fillStyle = "rgba(135,206,250,0.15)";
  上下文.fillRect(轨道起点, 区域.y + 内边距, 轨道宽, 4);

  上下文.fillStyle = "#9ea7ff";
  上下文.font = "500 14px 'Google Sans Code', 'Noto Sans SC', sans-serif";
  // 上下文.fillText("按 A/D 左右移动，空格跳跃", 轨道起点, 区域.y + 内边距 - 10);
  const 单中文宽度 = 上下文.measureText("按").width;
  const 单英文宽度 = 上下文.measureText("A").width;
  上下文.fillText("按", 轨道起点, 区域.y + 内边距 - 10);
  上下文.fillStyle = "yellowgreen";
  上下文.fillText("A", 轨道起点 + 单中文宽度 + 4, 区域.y + 内边距 - 10);
  上下文.fillStyle = "gray";
  上下文.fillText("/", 轨道起点 + (单中文宽度 + 4) + 单英文宽度 + 2, 区域.y + 内边距 - 10);
  上下文.fillStyle = "yellowgreen";
  上下文.fillText("D", 轨道起点 + (单中文宽度 + 4) + (单英文宽度 + 2) * 2, 区域.y + 内边距 - 10);
  上下文.fillStyle = "#9ea7ff";
  上下文.fillText(
    "左右移动",
    轨道起点 + (单中文宽度 + 4) + (单英文宽度 + 2) * 2 + 单英文宽度 + 4,
    区域.y + 内边距 - 10
  );
  上下文.fillStyle = "yellowgreen";
  上下文.fillText(
    "空格",
    轨道起点 + (单中文宽度 + 4) + (单英文宽度 + 2) * 2 + 4 + 单中文宽度 * 4 + 35,
    区域.y + 内边距 - 10
  );
  上下文.fillStyle = "#9ea7ff";
  上下文.fillText(
    "跳跃",
    轨道起点 + (单中文宽度 + 4) + (单英文宽度 + 2) * 2 + 4 + 单中文宽度 * 6 + 35 + 2,
    区域.y + 内边距 - 10
  );

  绘制速度面板(区域, 轨道终点 - 220, 区域.y + 内边距 + 20);
  上下文.restore();
}

function 绘制倒影(帧, 角色屏幕X, 地面Y, 跳跃偏移) {
  if (!忍者图像.complete) return;
  const 反向偏移 = Math.max(0, 跳跃偏移);
  上下文.save();
  上下文.globalAlpha = 0.25;
  上下文.translate(角色屏幕X, 地面Y);
  上下文.scale(1, -1);
  上下文.drawImage(
    忍者图像,
    帧.起始X,
    帧.起始Y,
    忍者精灵.帧宽,
    忍者精灵.帧高,
    0,
    -角色显示高度 - 反向偏移,
    角色显示宽度,
    角色显示高度
  );
  上下文.restore();
}

function 绘制速度面板(区域, 面板X, 面板Y) {
  上下文.save();
  上下文.fillStyle = "rgba(0,0,0,0.35)";
  上下文.fill();
  const 速度列表 = [
    { 标签: "移动速度", 数值: Math.round(角色.当前移动速度), 单位: "像素/秒" },
    { 标签: "跳跃速度", 数值: Math.round(角色.当前跳跃速度), 单位: "像素/秒" },
  ];
  const 颜色方案 = {
    标签: "#aaa",
    分隔: "gray",
    数字: "gold",
    单位: "#8fb3ff",
    斜杠: "gray",
  };
  上下文.font = "400 16px 'Google Sans Code', 'Noto Sans SC', sans-serif";
  速度列表.forEach((速度, 索引) => {
    const 行Y = 面板Y + 索引 * 30 + 20;
    let 光标X = 面板X - 10;
    上下文.fillStyle = 颜色方案.标签;
    上下文.fillText(速度.标签, 光标X, 行Y);
    光标X += 上下文.measureText(速度.标签).width + 4;
    上下文.fillStyle = 颜色方案.分隔;
    上下文.fillText("：", 光标X, 行Y);
    光标X += 上下文.measureText("：").width + 4;
    上下文.fillStyle = 颜色方案.数字;
    上下文.fillText(String(速度.数值), 光标X, 行Y);
    光标X += 上下文.measureText(String(速度.数值)).width + 6;
    const [单位前, 单位后] = 速度.单位.split("/");
    上下文.fillStyle = 颜色方案.单位;
    上下文.fillText(单位前, 光标X, 行Y);
    光标X += 上下文.measureText(单位前).width + 2;
    上下文.fillStyle = 颜色方案.斜杠;
    上下文.fillText("/", 光标X, 行Y);
    光标X += 上下文.measureText("/").width + 2;
    上下文.fillStyle = 颜色方案.单位;
    上下文.fillText(单位后, 光标X, 行Y);
  });
  上下文.restore();
}

function 绘制角色尺寸滑块(区域) {
  const 轨道宽 = 250;
  const 轨道高 = 6;
  const 内边距 = 28;
  const 轨道X = 区域.x + 区域.width / 2 - 轨道宽 / 2;
  const 轨道Y = 区域.y + 内边距 + 60;

  const 比例 = (角色显示宽度 - 角色尺寸配置.最小) / (角色尺寸配置.最大 - 角色尺寸配置.最小);
  const 手柄X = 轨道X + 轨道宽 * 限制值(比例, 0, 1);
  const 手柄Y = 轨道Y + 轨道高 / 2;
  const 高亮中 = 交互状态.活动滑块 === "角色尺寸" || 交互状态.悬停滑块 === "角色尺寸";

  上下文.save();
  上下文.fillStyle = "rgba(45, 45, 45)";
  上下文.fillRect(轨道X, 轨道Y, 轨道宽, 轨道高);

  const 填充宽 = 手柄X - 轨道X;
  上下文.fillStyle = 高亮中 ? "#6cb6e4ff" : "#2f5baf";
  上下文.fillRect(轨道X, 轨道Y, 填充宽, 轨道高);

  上下文.beginPath();
  上下文.arc(手柄X, 手柄Y, 9, 0, Math.PI * 2);
  if (高亮中) {
    上下文.fillStyle = "#993340ff";
    上下文.shadowColor = "rgba(81, 247, 255, 0.35)";
    上下文.shadowBlur = 8;
    上下文.lineWidth = 2.5;
    上下文.strokeStyle = "#7cf7ff";
  } else {
    上下文.fillStyle = "#111";
    上下文.lineWidth = 2;
    上下文.strokeStyle = "#51f7ff";
  }
  上下文.fill();
  上下文.stroke();
  上下文.shadowColor = "transparent";

  上下文.fillStyle = 高亮中 ? "gold" : "darkgoldenrod";
  上下文.font = "400 14px 'Google Sans Code', 'Noto Sans SC', sans-serif";
  const px宽度 = 上下文.measureText("px").width;
  上下文.textAlign = "center";
  上下文.textBaseline = "top";
  上下文.fillText("角色尺寸", 轨道X + 轨道宽 / 2, 轨道Y + 24);

  上下文.fillStyle = 高亮中 ? "#fff" : "#ccc";
  上下文.textBaseline = "bottom";
  上下文.fillText(`${Math.round(角色显示宽度)}`, 轨道X + 轨道宽 / 2 - px宽度 / 2, 轨道Y - 14);
  const 角色尺寸宽度 = 上下文.measureText(`${Math.round(角色显示宽度)}`).width;
  上下文.fillStyle = 高亮中 ? "#aaa" : "gray";
  上下文.fillText("px", 轨道X + 轨道宽 / 2 + 角色尺寸宽度 / 2 - px宽度 / 2 + 12, 轨道Y - 14);

  界面引用.滑轨列表.push({
    键: "角色尺寸",
    x: 轨道X - 15,
    y: 轨道Y - 20,
    width: 轨道宽 + 30,
    height: 50,
    轨道X,
    轨道宽,
    轨道Y,
    轨道高,
    手柄X,
    手柄Y,
    手柄半径: 12,
    方向: "horizontal",
  });

  上下文.restore();
}

function 绘制控制点(位置, 键) {
  上下文.beginPath();
  上下文.arc(位置.x, 位置.y, 10, 0, Math.PI * 2);
  const 激活 = 交互状态.活动柄 === 键;
  const 悬停 = 交互状态.悬停柄 === 键;
  上下文.fillStyle = 激活 || 悬停 ? "#ffba41" : "#0f7c79";
  上下文.fill();
  上下文.lineWidth = 2;
  上下文.strokeStyle = "#ffffff";
  上下文.stroke();
}

function 正规化到画布(点, 矩形) {
  return {
    x: 矩形.x + 点.x * 矩形.width,
    y: 矩形.y + (1 - 点.y) * 矩形.height,
  };
}

function 正规化自画布(画布X, 画布Y, 矩形) {
  const 归一X = 限制值((画布X - 矩形.x) / 矩形.width, 0, 1);
  const 归一Y = 限制值(1 - (画布Y - 矩形.y) / 矩形.height, 0, 1);
  return { x: 归一X, y: 归一Y };
}

function 采样曲线点(曲线, 时间) {
  const 反比例 = 1 - 时间;
  const p0 = { x: 0, y: 0 };
  const p3 = { x: 1, y: 1 };
  const x =
    反比例 * 反比例 * 反比例 * p0.x +
    3 * 反比例 * 反比例 * 时间 * 曲线.控制点1.x +
    3 * 反比例 * 时间 * 时间 * 曲线.控制点2.x +
    时间 * 时间 * 时间 * p3.x;
  const y =
    反比例 * 反比例 * 反比例 * p0.y +
    3 * 反比例 * 反比例 * 时间 * 曲线.控制点1.y +
    3 * 反比例 * 时间 * 时间 * 曲线.控制点2.y +
    时间 * 时间 * 时间 * p3.y;
  return { x, y };
}

function 计算贝塞尔(曲线, 时间) {
  if (Math.abs(曲线.控制点1.x - 曲线.控制点1.y) < 1e-4 && Math.abs(曲线.控制点2.x - 曲线.控制点2.y) < 1e-4) {
    return 限制值(时间, 0, 1);
  }
  const 采样曲线X = (参数) => {
    const ax = 1 - 3 * 曲线.控制点2.x + 3 * 曲线.控制点1.x;
    const bx = 3 * 曲线.控制点2.x - 6 * 曲线.控制点1.x;
    const cx = 3 * 曲线.控制点1.x;
    return ((ax * 参数 + bx) * 参数 + cx) * 参数;
  };
  const 采样曲线Y = (参数) => {
    const ay = 1 - 3 * 曲线.控制点2.y + 3 * 曲线.控制点1.y;
    const by = 3 * 曲线.控制点2.y - 6 * 曲线.控制点1.y;
    const cy = 3 * 曲线.控制点1.y;
    return ((ay * 参数 + by) * 参数 + cy) * 参数;
  };
  const 采样曲线导数X = (参数) => {
    const ax = 1 - 3 * 曲线.控制点2.x + 3 * 曲线.控制点1.x;
    const bx = 3 * 曲线.控制点2.x - 6 * 曲线.控制点1.x;
    const cx = 3 * 曲线.控制点1.x;
    return (3 * ax * 参数 + 2 * bx) * 参数 + cx;
  };
  const 求解曲线X = (目标X) => {
    const 精度 = 1e-6;
    let 参数 = 目标X;
    for (let i = 0; i < 8; i++) {
      const 偏差X = 采样曲线X(参数) - 目标X;
      if (Math.abs(偏差X) < 精度) return 参数;
      const 导数 = 采样曲线导数X(参数);
      if (Math.abs(导数) < 1e-6) break;
      参数 -= 偏差X / 导数;
    }
    let 最小 = 0;
    let 最大 = 1;
    参数 = 目标X;
    while (最大 - 最小 > 精度) {
      const 当前X = 采样曲线X(参数);
      if (Math.abs(当前X - 目标X) < 精度) return 参数;
      if (目标X > 当前X) {
        最小 = 参数;
      } else {
        最大 = 参数;
      }
      参数 = (最大 + 最小) / 2;
    }
    return 参数;
  };
  return 限制值(采样曲线Y(求解曲线X(时间)), 0, 1);
}

function 获取当前曲线进度() {
  if (状态.当前曲线 === "移动") {
    const 加速秒 = Math.max(状态.参数.加速时长 / 1000, 0.001);
    return 限制值(加速秒 > 0 ? 角色.移动计时 / 加速秒 : 0, 0, 1);
  }
  const 跳跃秒 = Math.max(状态.参数.跳跃时长 / 1000, 0.001);
  if (!角色.跳跃中 || 跳跃秒 <= 0) return 0;
  const 归一 = 限制值(角色.跳跃计时 / 跳跃秒, 0, 1);
  if (归一 <= 0.5) return 归一 * 2;
  return (1 - 归一) * 2;
}

function 处理指针按下(事件) {
  const 位置 = 获取指针位置(事件);
  if (尝试切换按钮(位置)) {
    保存本地状态();
    return;
  }
  const 控制点键 = 获取指针下控制点(位置);
  if (控制点键) {
    交互状态.活动柄 = 控制点键;
    交互状态.指针编号 = 事件.pointerId;
    画布.setPointerCapture(事件.pointerId);
    更新控制点(位置);
    保存本地状态();
    return;
  }
  const 滑块命中 = 获取指针下滑块(位置);
  if (滑块命中) {
    交互状态.活动滑块 = 滑块命中.键;
    交互状态.指针编号 = 事件.pointerId;
    画布.setPointerCapture(事件.pointerId);
    if (!滑块命中.在手柄) {
      更新滑块(位置);
    }
    保存本地状态();
  }
}

function 处理指针移动(事件) {
  const 位置 = 获取指针位置(事件);
  if (交互状态.活动柄) {
    更新控制点(位置);
    保存本地状态();
    return;
  }
  if (交互状态.活动滑块) {
    更新滑块(位置);
    保存本地状态();
    return;
  }
  交互状态.悬停柄 = 获取指针下控制点(位置);
  交互状态.悬停滑块 = 获取指针下滑块(位置)?.键 || null;
  交互状态.悬停按钮 = 获取指针下按钮(位置);
  const 光标 =
    交互状态.悬停柄 || 交互状态.悬停滑块 || 交互状态.悬停按钮
      ? 'url("/Images/Common/鼠标-指向.cur"), pointer'
      : 'url("/Images/Common/鼠标-默认.cur"), auto';
  画布.style.cursor = 光标;
}

function 处理指针抬起(事件) {
  if (交互状态.指针编号 !== null) {
    try {
      画布.releasePointerCapture(交互状态.指针编号);
    } catch (error) {
      /* 忽略 */
    }
  }
  交互状态.指针编号 = null;
  交互状态.活动柄 = null;
  交互状态.活动滑块 = null;
  交互状态.悬停柄 = null;
  交互状态.悬停滑块 = null;
  交互状态.悬停按钮 = null;
}

function 获取指针位置(事件) {
  const 矩形 = 画布.getBoundingClientRect();
  return {
    x: 事件.clientX - 矩形.left,
    y: 事件.clientY - 矩形.top,
  };
}

function 获取指针下控制点(位置) {
  if (!界面引用.贝塞尔区域.width) return null;
  for (const 键 of ["控制点1", "控制点2"]) {
    const 点 = 界面引用.控制柄[键];
    const 距离 = Math.hypot(点.x - 位置.x, 点.y - 位置.y);
    if (距离 < 14) {
      return 键;
    }
  }
  return null;
}

function 更新控制点(位置) {
  if (!交互状态.活动柄) return;
  const 矩形 = 界面引用.贝塞尔区域;
  const 归一 = 正规化自画布(位置.x, 位置.y, 矩形);
  状态.曲线集[状态.当前曲线][交互状态.活动柄] = 归一;
}

function 获取指针下滑块(位置) {
  for (const 轨 of 界面引用.滑轨列表) {
    if (Math.hypot(位置.x - 轨.手柄X, 位置.y - 轨.手柄Y) <= 轨.手柄半径) {
      return { 键: 轨.键, 在手柄: true };
    }
    if (点在矩形内(位置, 轨)) {
      return { 键: 轨.键, 在手柄: false };
    }
  }
  return null;
}

function 更新滑块(位置) {
  const 轨 = 界面引用.滑轨列表.find((轨道) => 轨道.键 === 交互状态.活动滑块);
  if (!轨) return;
  const 配置 =
    滑块列表.find((滑块项) => 滑块项.键 === 轨.键) ||
    (轨.键 === "角色尺寸"
      ? { 键: "角色尺寸", 最小: 角色尺寸配置.最小, 最大: 角色尺寸配置.最大, 步长: 1 }
      : null);
  if (!配置) return;

  const 比例 =
    轨.方向 === "vertical"
      ? 1 - 限制值((位置.y - 轨.轨道Y) / 轨.轨道高, 0, 1)
      : 限制值((位置.x - 轨.轨道X) / 轨.轨道宽, 0, 1);
  const 原值 = 配置.最小 + 比例 * (配置.最大 - 配置.最小);
  const 阶梯值 = Math.round(原值 / 配置.步长) * 配置.步长;
  const 限定值 = 限制值(阶梯值, 配置.最小, 配置.最大);

  if (配置.键 === "角色尺寸") {
    更新角色尺寸(限定值);
    return;
  }

  状态.参数[配置.键] = 限定值;
  if (配置.键 === "移动距离") 限制角色位置();
  if (配置.键 === "音效音量") 落地音效.volume = 限制值(状态.参数.音效音量 / 100, 0, 1);
}

function 尝试切换按钮(位置) {
  for (const 键 of ["移动", "跳跃"]) {
    const 按钮 = 界面引用.切换按钮[键];
    if (点在矩形内(位置, 按钮)) {
      状态.当前曲线 = 键;
      return true;
    }
  }
  return false;
}

function 尝试切换悬停(位置) {
  return ["移动", "跳跃"].some((键) => 点在矩形内(位置, 界面引用.切换按钮[键]));
}

function 获取指针下按钮(位置) {
  for (const 键 of ["移动", "跳跃"]) {
    const 按钮 = 界面引用.切换按钮[键];
    if (点在矩形内(位置, 按钮)) return 键;
  }
  return null;
}
function 处理按键按下(事件) {
  const 键 = 事件.key.toLowerCase();
  if (键 === "a" || 键 === "d") {
    按键集合.add(键);
  }
  if (事件.code === "Space") {
    事件.preventDefault();
    if (事件.repeat) return;
    开始跳跃();
  }
}

function 处理按键抬起(事件) {
  const 键 = 事件.key.toLowerCase();
  if (键 === "a" || 键 === "d") {
    按键集合.delete(键);
  }
}

function 计算移动意图() {
  const 左 = 按键集合.has("a");
  const 右 = 按键集合.has("d");
  if (左 && !右) return -1;
  if (右 && !左) return 1;
  return 0;
}

function 开始跳跃() {
  if (角色.跳跃中) return;
  角色.跳跃中 = true;
  角色.跳跃计时 = 0;
  角色.垂直位移 = 0;
  角色.起跳水平速度 = Math.max(角色.当前移动速度, 0);
  角色.起跳方向 = 角色.移动方向;
  角色.上一垂直位移 = 0;
  if (角色.移动方向 !== 0) {
    角色.朝向 = 角色.移动方向;
  }
}

function 重置跳跃状态() {
  try {
    落地音效.currentTime = 0;
    落地音效.play();
  } catch (error) {
    /* 忽略播放失败 */
  }
  角色.跳跃中 = false;
  角色.跳跃计时 = 0;
  角色.垂直位移 = 0;
  角色.当前跳跃速度 = 0;
  角色.起跳水平速度 = 0;
  角色.起跳方向 = 0;
  角色.上一垂直位移 = 0;
}

function 限制角色位置() {
  角色.世界X = 限制值(角色.世界X, 0, 获取移动上限());
}

function 获取移动上限() {
  return Math.max(状态.参数.移动距离 - 角色显示宽度, 0);
}

function 限制值(数值, 最小值, 最大值) {
  return Math.min(Math.max(数值, 最小值), 最大值);
}

function 点在矩形内(点, 矩形) {
  if (!矩形) return false;
  return 点.x >= 矩形.x && 点.x <= 矩形.x + 矩形.width && 点.y >= 矩形.y && 点.y <= 矩形.y + 矩形.height;
}

function 绘制圆角矩形(绘制上下文, 起点X, 起点Y, 宽度, 高度, 半径) {
  const 圆角 = Math.min(半径, 宽度 / 2, 高度 / 2);
  绘制上下文.beginPath();
  绘制上下文.roundRect(起点X, 起点Y, 宽度, 高度, 圆角);
  绘制上下文.closePath();
}

function 读取角色尺寸() {
  try {
    const 已存 = Number(localStorage.getItem(角色尺寸配置.存储键));
    if (!Number.isNaN(已存)) {
      return 限制值(已存, 角色尺寸配置.最小, 角色尺寸配置.最大);
    }
  } catch (error) {
    /* ignore */
  }
  return 角色尺寸配置.默认;
}

function 更新角色尺寸(新值) {
  const 尺寸 = 限制值(Math.round(新值), 角色尺寸配置.最小, 角色尺寸配置.最大);
  角色显示宽度 = 尺寸;
  角色显示高度 = 尺寸;
  try {
    localStorage.setItem(角色尺寸配置.存储键, String(尺寸));
  } catch (error) {
    /* ignore */
  }
  限制角色位置();
}
