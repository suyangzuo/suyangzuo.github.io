const 选择文章按钮 = document.querySelector("#选择文章"); // 选择文章按钮
const 文件夹列表区 = document.querySelector(".文件夹列表区");
const 文章列表区 = document.querySelector(".文章列表区");
const 分钟输入框 = document.querySelector("#分钟");
const 秒输入框 = document.querySelector("#秒");
const 姓名输入框 = document.querySelector("#姓名");
let 当前文章 = "";
let 测试者姓名 = "测试者";
let 错误字符集合 = {};
let 退格次数 = 0;
let 当前输入索引 = 0;
let 正在合成 = false;
let 输入容器 = null;
let 隐藏输入框 = null;
let 测试结束覆盖层 = null;
let 所有字符元素缓存 = null; // 缓存字符元素数组（虚拟滚动时使用）
let 上一个当前字符元素 = null; // 缓存上一个当前字符元素
let 统计信息更新定时器 = null; // 节流定时器
let 待更新的统计信息 = false; // 标记是否需要更新统计信息
let 配对符号状态 = new Map(); // 记录每种配对符号的状态（前符号 -> 是否已输入前符号）

// 虚拟滚动相关变量
let 文章内容字符串 = ""; // 保存原始文章内容
let 块大小 = 450; // 每个块包含的字符数（400-500之间）
let 块数组 = []; // 块数组，每个元素包含 { blockElement, elements, startIndex, endIndex, isRendered }
let 字符元素映射 = new Map(); // 字符索引到字符元素的映射（仅已渲染的块）
let 滚动监听器 = null; // 滚动事件监听器
let 正在程序滚动 = false; // 标记是否正在程序滚动，避免滚动事件干扰
// 缓存DOM元素引用
let 字符数显示元素 = null;
let 已输入字符数元素 = null;
let 总字符数元素 = null;
let 错误数据显示元素 = null;
let 错误字符数元素 = null;
let 退格次数元素 = null;
let 正确率数字元素 = null;
let 小数点元素 = null;
let 正确率小数元素 = null;
let 进度圆环元素 = null;
let 进度百分比元素 = null;
let 进度数字元素 = null;
let 进度小数点元素 = null;
let 进度小数元素 = null;
let 进度百分号元素 = null;
let 总字符数 = 0;
let 已输入字符数 = 0;
let 正确字符数 = 0;
let 错误字符数 = 0;
let 计时器开始时间 = null;
let 累计已用时间 = 0;
let 计时器间隔ID = null;
let 正在计时 = false;
let 倒计时剩余时间 = 0;
let 倒计时开始时间 = null;
let 正在倒计时 = false;
let 倒计时暂停时剩余时间 = 0;
let 测试结束状态 = false;
let 统计数据数组 = [];
let 统计定时器ID = null;
let 结果区元素 = null;
let 错误分析图表 = null;
let 速度分析图表 = null;
let 测试开始时间 = null;
let 测试结束时间 = null;
let 历史数据图表 = null;
let 当前显示数据类型 = "速度"; // 默认显示速度
let 当前页码 = 1; // 当前页码
const 每页记录数 = 30; // 每页显示的记录数

const Storage_Keys = {
  定时器分: "TenFingers_定时器_分",
  定时器秒: "TenFingers_定时器_秒",
  已设置定时: "TenFingers_已设置定时",
  姓名: "TenFingers_姓名",
  当前文件夹: "TenFingers_当前文件夹",
  随机选择: "TenFingers_随机选择",
};

let 当前文件夹 = 从本地存储读取(Storage_Keys.当前文件夹, "Computer");
let 全局文件夹结构 = null; // 保存文件夹结构以便随机选择

function 从本地存储读取(键名, 默认值) {
  const 存储值 = localStorage.getItem(键名);
  if (存储值 !== null) {
    if (typeof 默认值 === "boolean") {
      return 存储值 === "true";
    }
    if (typeof 默认值 === "number") {
      const 数值 = parseFloat(存储值);
      // 检查是否为有效数字，包括0
      if (!isNaN(数值)) {
        return 数值;
      }
      return 默认值;
    }
    return 存储值;
  }
  return 默认值;
}

function 保存到本地存储(键名, 值) {
  localStorage.setItem(键名, String(值));
}

function 从会话存储读取(键名, 默认值) {
  const 存储值 = sessionStorage.getItem(键名);
  if (存储值 !== null) {
    return 存储值;
  }
  return 默认值;
}

function 保存到会话存储(键名, 值) {
  sessionStorage.setItem(键名, String(值));
}

const 定时器 = {
  分: 从本地存储读取(Storage_Keys.定时器分, 1),
  秒: 从本地存储读取(Storage_Keys.定时器秒, 0),
};
let 已设置定时 = 从本地存储读取(Storage_Keys.已设置定时, false);

async function 获取文本文件列表() {
  const response = await fetch("./Texts/file-list.json");
  if (response.ok) {
    const 文件夹结构 = await response.json();
    return 文件夹结构;
  } else {
    throw new Error("无法读取文件！");
  }
}

async function 初始化文章列表() {
  const 文件夹结构 = await 获取文本文件列表();
  全局文件夹结构 = 文件夹结构; // 保存到全局变量
  const 文章列表区 = document.querySelector(".文章列表区");
  const 文章列表关闭按钮 = document.createElement("button");
  文章列表关闭按钮.className = "关闭按钮 文章列表关闭按钮";
  文章列表关闭按钮.textContent = "✖";
  文章列表区.appendChild(文章列表关闭按钮);
  文章列表关闭按钮.addEventListener("click", (event) => {
    event.stopPropagation();
    关闭文章列表();

    // 关闭文章列表后，如果隐藏输入框已启用，则让它获得焦点
    if (隐藏输入框 && !隐藏输入框.disabled && document.activeElement !== 隐藏输入框) {
      隐藏输入框.focus();
    }
  });

  const 文件夹列表 = document.createElement("ul");
  文件夹列表.className = "文件夹列表";
  文件夹列表区.appendChild(文件夹列表);
  let 文章容器高度 = null;
  for (const [文件夹名, 文件列表] of Object.entries(文件夹结构)) {
    if (!文件列表 || 文件列表.length === 0) {
      continue;
    }

    let fileIndex = 0;

    const 文件夹项 = document.createElement("li");
    文件夹项.className = "文件夹项";
    文件夹项.dataset.文件夹名 = 文件夹名;
    文件夹项.title = 文件夹名;
    const 文件夹图标 = document.createElement("img");
    文件夹图标.className = "文件夹图标";
    文件夹图标.src = `/Apps/Ten_Fingers/SVG/${文件夹名}.svg`;
    文件夹项.appendChild(文件夹图标);
    if (文件夹项.dataset.文件夹名 === 当前文件夹) {
      文件夹项.classList.add("激活");
    }
    文件夹列表.appendChild(文件夹项);
    文件夹项.addEventListener("click", () => {
      更新文章列表(文件夹名);
    });

    const 文章列表 = document.createElement("ul");
    文章列表.className = `文章列表 ${文件夹名}列表`;
    文章列表.dataset.文件夹名 = 文件夹名;
    文章列表区.appendChild(文章列表);

    for (const 文件信息 of 文件列表) {
      const 文件名 = 文件信息.文件名 || 文件信息; // 兼容旧格式（字符串）和新格式（对象）
      const 文件路径 = `./Texts/${文件夹名}/${文件名}`;
      const 文章容器 = document.createElement("li");
      文章容器.className = "文章容器";

      文章容器.dataset.文件路径 = 文件路径;
      文章容器.dataset.序号 = 文件名.split("_")[0];

      const 文章序号 = document.createElement("span");
      文章序号.className = "文章序号";
      文章序号.textContent = 文件名.split("_")[0];

      const 文章标题 = document.createElement("h3");
      文章标题.className = "文章标题";
      文章标题.textContent = 文件名.split("_")[1].replace(/\.txt$/i, "");

      const 字符数量元素 = document.createElement("span");
      字符数量元素.className = "文章字符数";
      // 直接从 JSON 中读取字符数
      const 字符数 = 文件信息.字符数;
      if (字符数 !== null && 字符数 !== undefined) {
        字符数量元素.textContent = `${字符数}`;
      } else {
        字符数量元素.textContent = "未知";
      }

      文章容器.append(文章序号, 文章标题, 字符数量元素);
      文章列表.appendChild(文章容器);

      文章容器.addEventListener("click", async () => {
        const 已激活文章容器 = 文章列表区.querySelector(".文章容器.激活");
        if (已激活文章容器) {
          已激活文章容器.classList.remove("激活");
        }
        文章容器.classList.toggle("激活");
        const 已选择文章文件夹 = 文件夹列表.querySelector(".文件夹项[data-序号]");
        已选择文章文件夹?.removeAttribute("data-序号");
        文件夹项.dataset.序号 = 文章容器.dataset.序号;
        当前文章 = `${文章序号.textContent.trim()}_${文章标题.textContent.trim()}`;

        if (文章容器.classList.contains("激活")) {
          const 文件路径 = 文章容器.dataset.文件路径;
          const 文章内容 = await fetch(文件路径)
            .then((response) => response.text())
            .then((内容) => 内容.trim().replace(/[\r\n]+/g, " "));
          // 更新文章标题显示
          更新文章标题显示(文件夹名, 文件名);
          await 初始化输入容器(文章内容);
        }
      });
      if (!文章容器高度) {
        文章容器高度 = 文章容器.offsetHeight;
      }
      fileIndex++;
    }

    const firstArticleContainer = 文章列表.querySelector(".文章容器:first-child");
    const lastArticleContainer = 文章列表.querySelector(".文章容器:last-child");
    const 内边距 = 50;
    const 文章列表区高度 = 文章容器高度 * 10 + 100;
    文章列表区.style.height = `${文章列表区高度}px`;
    const root = document.querySelector(":root");
    root.style.setProperty("--文件夹列表区垂直偏移", `${文章列表区高度 / 2}px`);
    文章列表.style.width = `${
      lastArticleContainer.offsetLeft + lastArticleContainer.offsetWidth + 内边距 * 2 - firstArticleContainer.offsetLeft
    }px`;
    选择文章按钮.removeAttribute("disabled");
  }

  阻止文章列表点击冒泡();
}

初始化文章列表();

选择文章按钮.addEventListener("click", (event) => {
  event.stopPropagation();
  if (文章列表区.classList.toggle("显示")) {
    更新文章列表(当前文件夹);
    暂停倒计时();
    // 文章列表显示时，禁用隐藏输入框
    if (隐藏输入框) {
      隐藏输入框.blur();
      隐藏输入框.disabled = true;
    }
  } else {
    if (测试结束状态 === false && 已输入字符数 > 0) {
      恢复倒计时();
    }
    // 文章列表隐藏时，启用隐藏输入框
    if (隐藏输入框) {
      隐藏输入框.disabled = false;
    }
  }
  文件夹列表区.classList.toggle("显示");
});

document.addEventListener("mousedown", (event) => {
  if (!文章列表区.classList.contains("显示")) {
    return;
  }

  const 点击文章列表 = 文章列表区.contains(event.target);
  const 点击文件夹列表 = 文件夹列表区.contains(event.target);
  const 点击选择文章按钮 = 选择文章按钮.contains(event.target);
  const 点击关闭按钮 = event.target.closest(".文章列表关闭按钮");

  if (点击文章列表 || 点击文件夹列表) {
    if (隐藏输入框 && document.activeElement === 隐藏输入框) {
      event.preventDefault();
    }
  } else if (!点击选择文章按钮) {
    if (!点击关闭按钮 && 隐藏输入框 && document.activeElement === 隐藏输入框) {
      event.preventDefault();
    }
  }
});

document.addEventListener("click", (event) => {
  if (!文章列表区.classList.contains("显示")) {
    return;
  }

  const 点击文章列表 = 文章列表区.contains(event.target);
  const 点击文件夹列表 = 文件夹列表区.contains(event.target);
  const 点击选择文章按钮 = 选择文章按钮.contains(event.target);
  const 点击关闭按钮 = event.target.closest(".文章列表关闭按钮");

  if (点击文章列表 || 点击文件夹列表) {
    // 文章列表显示时，不操作隐藏输入框
    return;
  }

  if (!点击选择文章按钮) {
    关闭文章列表();

    // 关闭文章列表后，如果隐藏输入框已启用，则让它获得焦点
    if (!点击关闭按钮 && 隐藏输入框 && !隐藏输入框.disabled && document.activeElement !== 隐藏输入框) {
      隐藏输入框.focus();
    }
  }
});

function 阻止文章列表点击冒泡() {
  for (const 文章列表 of 文章列表区.querySelectorAll(".文章列表")) {
    文章列表.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  文件夹列表区.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

function 更新文章列表(文件夹名) {
  const 当前文章列表 = document.querySelector(`ul[data-文件夹名="${当前文件夹}"]`);
  if (当前文章列表) {
    当前文章列表.classList.remove("显示");
  }
  const 新文章列表 = document.querySelector(`ul[data-文件夹名="${文件夹名}"]`);
  if (新文章列表) {
    新文章列表.classList.add("显示");
  }
  const 当前文件夹项 = 文件夹列表区.querySelector(".文件夹项.激活");
  if (当前文件夹项) {
    当前文件夹项.classList.remove("激活");
  }
  const 新文件夹项 = 文件夹列表区.querySelector(`.文件夹项[data-文件夹名="${文件夹名}"]`);
  if (新文件夹项) {
    新文件夹项.classList.add("激活");
  }
  当前文件夹 = 文件夹名;
  保存到本地存储(Storage_Keys.当前文件夹, 文件夹名);
  文章列表区.style.width = 新文章列表.style.width;
}

function 关闭文章列表() {
  文章列表区.classList.remove("显示");
  文件夹列表区.classList.remove("显示");
  const 当前文章列表 = document.querySelector(`ul[data-文件夹名="${当前文件夹}"]`);
  if (当前文章列表) {
    当前文章列表.classList.remove("显示");
  }
  // 文章列表关闭时，启用隐藏输入框
  if (隐藏输入框) {
    隐藏输入框.disabled = false;
  }
}

function 更新关闭文章列表按钮位置() {
  const 关闭文章列表按钮 = document.querySelector(".文章列表关闭按钮");
  if (关闭文章列表按钮) {
    关闭文章列表按钮.style.top = `${文章列表区.offsetTop}px`;
  }
}

function 初始化定时器设置() {
  const 分钟值 = 从本地存储读取(Storage_Keys.定时器分, 1);
  const 秒值 = 从本地存储读取(Storage_Keys.定时器秒, 0);

  分钟输入框.value = 分钟值;
  秒输入框.value = 秒值;

  定时器.分 = parseInt(分钟值, 10);
  定时器.秒 = parseInt(秒值, 10);

  function 更新定时时长(是否强制验证 = false) {
    let 分钟值 = parseInt(分钟输入框.value, 10) || 0;
    let 秒值 = parseInt(秒输入框.value, 10) || 0;

    if (分钟值 < 0) 分钟值 = 0;
    if (分钟值 > 59) 分钟值 = 59;
    if (秒值 < 0) 秒值 = 0;
    if (秒值 > 59) 秒值 = 59;

    // 当分钟为0时，秒数最低为5
    if (分钟值 === 0 && 秒值 < 5) {
      秒值 = 5;
    }

    分钟输入框.value = 分钟值;
    秒输入框.value = 秒值;

    定时器.分 = 分钟值;
    定时器.秒 = 秒值;

    保存到本地存储(Storage_Keys.定时器分, 定时器.分);
    保存到本地存储(Storage_Keys.定时器秒, 定时器.秒);
  }

  分钟输入框.addEventListener("input", () => {
    更新定时时长(false);
  });

  分钟输入框.addEventListener("blur", () => {
    更新定时时长(true);
  });

  秒输入框.addEventListener("input", () => {
    更新定时时长(false);
  });

  秒输入框.addEventListener("blur", () => {
    更新定时时长(true);
  });

  更新定时时长(true);
}

document.addEventListener("keydown", (event) => {
  const 当前焦点元素 = document.activeElement;

  if (当前焦点元素 && (当前焦点元素.tagName === "INPUT" || 当前焦点元素.tagName === "TEXTAREA")) {
    if (event.key === "Escape" || event.key === "Enter") {
      当前焦点元素.blur();
      event.preventDefault();
    }
  }
});

function 初始化定时复选框() {
  const 定时复选框 = document.querySelector("#定时复选框");

  if (定时复选框) {
    已设置定时 = 从本地存储读取(Storage_Keys.已设置定时, false);
    定时复选框.checked = 已设置定时;

    定时复选框.addEventListener("change", (event) => {
      已设置定时 = event.target.checked;
      保存到本地存储(Storage_Keys.已设置定时, 已设置定时);
    });
  }
}

function 初始化随机复选框() {
  const 随机复选框 = document.querySelector("#随机复选框");
  if (随机复选框) {
    const 随机选择状态 = 从本地存储读取(Storage_Keys.随机选择, false);
    随机复选框.checked = 随机选择状态;

    随机复选框.addEventListener("change", (event) => {
      const 选中状态 = event.target.checked;
      保存到本地存储(Storage_Keys.随机选择, 选中状态);
    });
  }
}

function 初始化姓名输入框() {
  if (姓名输入框) {
    const 存储的姓名 = 从本地存储读取(Storage_Keys.姓名, "测试者");
    测试者姓名 = 存储的姓名;
    姓名输入框.value = 测试者姓名;

    姓名输入框.addEventListener("input", (event) => {
      const 输入的姓名 = event.target.value;
      测试者姓名 = 输入的姓名;
      保存到本地存储(Storage_Keys.姓名, 输入的姓名);
    });
  }
}

function 在英文中文间添加空格(文本) {
  return 文本.replace(/([\u4e00-\u9fa5])([a-zA-Z])/g, "$1 $2").replace(/([a-zA-Z])([\u4e00-\u9fa5])/g, "$1 $2");
}

// 检测文本是否包含中文字符
function 包含中文(文本) {
  // 中文字符范围：\u4e00-\u9fa5
  // 中文标点符号：\u3000-\u303f（包括顿号、逗号、句号等）
  // 全角字符：\uff00-\uffef
  return /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(文本);
}

function 格式化时间(毫秒) {
  const 总秒数 = Math.floor(毫秒 / 1000);
  const 小时 = Math.floor(总秒数 / 3600);
  const 分钟 = Math.floor((总秒数 % 3600) / 60);
  const 秒 = 总秒数 % 60;

  return {
    小时: String(小时).padStart(2, "0"),
    分钟: String(分钟).padStart(2, "0"),
    秒: String(秒).padStart(2, "0"),
  };
}

function 格式化测试时间(毫秒) {
  const 总秒数 = Math.floor(毫秒 / 1000);
  const 小时 = Math.floor(总秒数 / 3600);
  const 分钟 = Math.floor((总秒数 % 3600) / 60);
  const 秒 = 总秒数 % 60;

  const 结果 = {};
  if (小时 > 0) {
    结果.小时 = String(小时).padStart(2, "0");
  }
  if (分钟 > 0 || 小时 > 0) {
    结果.分钟 = String(分钟).padStart(2, "0");
  }
  结果.秒 = String(秒).padStart(2, "0");

  return 结果;
}

function 记录统计数据() {
  const 当前本地时间 = new Date();
  const 本地时间对象 = {
    年: String(当前本地时间.getFullYear()),
    月: String(当前本地时间.getMonth() + 1).padStart(2, "0"),
    日: String(当前本地时间.getDate()).padStart(2, "0"),
    时: String(当前本地时间.getHours()).padStart(2, "0"),
    分: String(当前本地时间.getMinutes()).padStart(2, "0"),
    秒: String(当前本地时间.getSeconds()).padStart(2, "0"),
  };

  const 当前测试时间 = 正在计时 ? Date.now() - 计时器开始时间 + 累计已用时间 : 累计已用时间;
  const 测试时间数据 = 格式化测试时间(当前测试时间);

  let 速度 = 0;
  if (当前测试时间 > 0) {
    速度 = (已输入字符数 / 当前测试时间) * 60000;
  }

  const 统计数据 = {
    本地时间: 本地时间对象,
    测试时间: 测试时间数据,
    测试时间毫秒: 当前测试时间, // 保存精确的毫秒数
    速度: 速度,
  };

  统计数据数组.push(统计数据);
}

function 更新速度显示() {
  const 错误数据显示 = document.querySelector("#错误数据显示");
  if (!错误数据显示) return;

  const 速度字符数元素 = 错误数据显示.querySelector(".速度字符数");
  if (速度字符数元素) {
    const 当前测试时间 = 正在计时 ? Date.now() - 计时器开始时间 + 累计已用时间 : 累计已用时间;
    let 速度 = 0;
    if (当前测试时间 > 0) {
      速度 = (已输入字符数 / 当前测试时间) * 60000;
    }
    速度字符数元素.textContent = Math.round(速度);
  }
}

function 开始统计数据收集() {
  if (统计定时器ID !== null) return;

  统计定时器ID = setInterval(() => {
    if (正在计时 && !测试结束状态) {
      记录统计数据();
      更新速度显示();
    }
  }, 500);
}

function 停止统计数据收集() {
  if (统计定时器ID !== null) {
    clearInterval(统计定时器ID);
    统计定时器ID = null;
  }
}

function 更新计时器显示() {
  const 已用时间显示 = document.querySelector("#已用时间显示");
  if (已用时间显示) {
    const 当前时间 = 正在计时 ? Date.now() - 计时器开始时间 + 累计已用时间 : 累计已用时间;
    const 时间数据 = 格式化时间(当前时间);

    const 小时元素 = 已用时间显示.querySelector(".小时");
    const 分钟元素 = 已用时间显示.querySelector(".分钟");
    const 秒元素 = 已用时间显示.querySelector(".秒");

    if (小时元素) 小时元素.textContent = 时间数据.小时;
    if (分钟元素) 分钟元素.textContent = 时间数据.分钟;
    if (秒元素) 秒元素.textContent = 时间数据.秒;
  }
}

function 开始计时() {
  if (正在计时) return;

  正在计时 = true;
  计时器开始时间 = Date.now();

  // 记录测试开始时间（第一次开始计时时）
  if (测试开始时间 === null) {
    测试开始时间 = new Date();
  }

  function 更新计时() {
    if (正在计时) {
      更新计时器显示();
      requestAnimationFrame(更新计时);
    }
  }
  更新计时();

  开始统计数据收集();
}

function 暂停计时() {
  if (!正在计时) return;

  正在计时 = false;
  if (计时器开始时间 !== null) {
    累计已用时间 += Date.now() - 计时器开始时间;
    计时器开始时间 = null;
  }
  更新计时器显示();

  停止统计数据收集();
}

function 开始倒计时() {
  if (正在倒计时) return;

  const 定时复选框 = document.querySelector("#定时复选框");
  if (!定时复选框 || !定时复选框.checked) return;

  if (倒计时暂停时剩余时间 > 0) {
    倒计时剩余时间 = 倒计时暂停时剩余时间;
  } else {
    const 初始分钟 = parseInt(分钟输入框.value) || 0;
    const 初始秒数 = parseInt(秒输入框.value) || 0;
    倒计时剩余时间 = (初始分钟 * 60 + 初始秒数) * 1000;
  }

  if (倒计时剩余时间 <= 0) return;

  正在倒计时 = true;
  倒计时开始时间 = Date.now();

  function 更新倒计时() {
    if (!正在倒计时) return;

    const 当前时间 = Date.now();
    const 已过时间 = 当前时间 - 倒计时开始时间;
    const 剩余时间 = 倒计时剩余时间 - 已过时间;

    if (剩余时间 <= 0) {
      停止倒计时();
      进入测试结束状态("倒计时结束");
      return;
    }

    const 剩余秒数 = Math.floor(剩余时间 / 1000);
    const 分钟 = Math.floor(剩余秒数 / 60);
    const 秒 = 剩余秒数 % 60;

    if (分钟输入框) 分钟输入框.value = 分钟;
    if (秒输入框) 秒输入框.value = 秒;

    requestAnimationFrame(更新倒计时);
  }
  更新倒计时();
}

function 停止倒计时() {
  正在倒计时 = false;
  倒计时开始时间 = null;
  倒计时暂停时剩余时间 = 0;
}

function 暂停倒计时() {
  if (!正在倒计时) return;

  const 当前时间 = Date.now();
  const 已过时间 = 当前时间 - 倒计时开始时间;
  const 剩余时间 = 倒计时剩余时间 - 已过时间;

  if (剩余时间 > 0) {
    倒计时暂停时剩余时间 = 剩余时间;
  }

  正在倒计时 = false;
  倒计时开始时间 = null;
}

function 恢复倒计时() {
  开始倒计时();
}

function 进入测试结束状态(原因) {
  if (测试结束状态) return;

  测试结束状态 = true;
  停止倒计时();
  暂停计时();
  停止统计数据收集();

  // 记录测试结束时间
  测试结束时间 = new Date();

  // 保存测试记录到 IndexedDB
  保存测试记录();

  if (隐藏输入框) {
    隐藏输入框.blur();
    隐藏输入框.disabled = true;
  }

  if (测试结束覆盖层 && 输入容器) {
    测试结束覆盖层.innerHTML = "";

    const 覆盖层内容 = document.createElement("div");
    覆盖层内容.className = "覆盖层内容容器";
    覆盖层内容.style.cssText = "display: flex; flex-direction: column; align-items: center; pointer-events: auto;";

    const 文本元素 = document.createElement("div");
    文本元素.textContent = "测试结束";
    文本元素.style.cssText = "font-size: 72px; font-weight: bold; color: #fff; margin-bottom: 30px;";

    const 查看详情按钮 = document.createElement("button");
    查看详情按钮.textContent = "查看详情";
    查看详情按钮.className = "查看详情按钮";
    查看详情按钮.addEventListener("click", (event) => {
      event.stopPropagation();
      显示结果区();
    });

    覆盖层内容.appendChild(文本元素);
    覆盖层内容.appendChild(查看详情按钮);
    测试结束覆盖层.appendChild(覆盖层内容);
    测试结束覆盖层.style.display = "flex";
  }
}

function 格式化百分比(数值) {
  const 字符串 = 数值.toFixed(2);
  const [整数部分, 小数部分] = 字符串.split(".");

  if (小数部分 === "00") {
    return {
      整数部分,
      小数部分: null,
      需要显示小数点: false,
    };
  }

  if (小数部分[1] === "0") {
    return {
      整数部分,
      小数部分: 小数部分[0],
      需要显示小数点: true,
    };
  }

  return {
    整数部分,
    小数部分,
    需要显示小数点: true,
  };
}

function 更新统计信息() {
  // 使用缓存的DOM元素引用
  if (已输入字符数元素) 已输入字符数元素.textContent = 已输入字符数;
  if (总字符数元素) 总字符数元素.textContent = 总字符数;

  if (错误数据显示元素) {
    const 实际错误字符数 = Object.keys(错误字符集合).length;

    if (错误字符数元素) 错误字符数元素.textContent = 实际错误字符数;
    if (退格次数元素) 退格次数元素.textContent = 退格次数;

    if (当前输入索引 > 0 && 正确率数字元素) {
      const 正确率 = (正确字符数 / 当前输入索引) * 100;
      const 格式化结果 = 格式化百分比(正确率);

      正确率数字元素.textContent = 格式化结果.整数部分;

      if (格式化结果.需要显示小数点 && 格式化结果.小数部分 !== null) {
        if (小数点元素) 小数点元素.style.display = "inline";
        if (正确率小数元素) {
          正确率小数元素.textContent = 格式化结果.小数部分;
          正确率小数元素.style.display = "inline";
        }
      } else {
        if (小数点元素) 小数点元素.style.display = "none";
        if (正确率小数元素) 正确率小数元素.style.display = "none";
      }
    } else if (正确率数字元素) {
      正确率数字元素.textContent = "0";
      if (小数点元素) 小数点元素.style.display = "none";
      if (正确率小数元素) 正确率小数元素.style.display = "none";
    }
  }

  if (进度圆环元素 && 进度百分比元素 && 总字符数 > 0) {
    const 进度 = (已输入字符数 / 总字符数) * 100;
    const 进度角度 = (进度 / 100) * 360;
    进度圆环元素.style.setProperty("--进度角度", `${进度角度}deg`);

    const 格式化结果 = 格式化百分比(进度);

    if (进度数字元素) {
      进度数字元素.textContent = 格式化结果.整数部分;
    }
    if (格式化结果.需要显示小数点 && 格式化结果.小数部分 !== null) {
      if (进度小数点元素) {
        进度小数点元素.style.display = "inline";
        进度小数点元素.textContent = ".";
      }
      if (进度小数元素) {
        进度小数元素.style.display = "inline";
        进度小数元素.textContent = 格式化结果.小数部分;
      }
    } else {
      if (进度小数点元素) 进度小数点元素.style.display = "none";
      if (进度小数元素) 进度小数元素.style.display = "none";
    }
    if (进度百分号元素) {
      进度百分号元素.textContent = "%";
    }
  } else if (进度百分比元素) {
    if (进度数字元素) 进度数字元素.textContent = "0";
    if (进度小数点元素) 进度小数点元素.style.display = "none";
    if (进度小数元素) 进度小数元素.style.display = "none";
    if (进度百分号元素) 进度百分号元素.textContent = "%";
    if (进度圆环元素) 进度圆环元素.style.setProperty("--进度角度", "0deg");
  }
}

async function 随机选择文章() {
  if (!全局文件夹结构) {
    // 如果还没有加载文件夹结构，先加载
    全局文件夹结构 = await 获取文本文件列表();
  }

  // 收集所有可用的文章
  const 所有文章 = [];
  for (const [文件夹名, 文件列表] of Object.entries(全局文件夹结构)) {
    if (!文件列表 || 文件列表.length === 0) {
      continue;
    }
    for (const 文件信息 of 文件列表) {
      const 文件名 = 文件信息.文件名 || 文件信息;
      所有文章.push({
        文件夹名: 文件夹名,
        文件名: 文件名,
        文件路径: `./Texts/${文件夹名}/${文件名}`,
      });
    }
  }

  if (所有文章.length === 0) {
    return null;
  }

  // 随机选择一篇文章
  const 随机索引 = Math.floor(Math.random() * 所有文章.length);
  const 随机文章 = 所有文章[随机索引];

  // 更新文件夹和文章列表的激活状态
  更新文章列表(随机文章.文件夹名);

  // 找到对应的文章容器并激活
  const 文章列表区 = document.querySelector(".文章列表区");
  const 文章列表 = 文章列表区.querySelector(`ul[data-文件夹名="${随机文章.文件夹名}"]`);
  if (文章列表) {
    // 移除之前的激活状态
    const 已激活文章容器 = 文章列表区.querySelector(".文章容器.激活");
    if (已激活文章容器) {
      已激活文章容器.classList.remove("激活");
    }

    // 激活选中的文章容器
    const 文章容器 = 文章列表.querySelector(`.文章容器[data-文件路径="${随机文章.文件路径}"]`);
    if (文章容器) {
      文章容器.classList.add("激活");
      
      // 更新文件夹项的data-序号
      const 文件夹列表区 = document.querySelector(".文件夹列表区");
      const 文件夹列表 = 文件夹列表区.querySelector(".文件夹列表");
      const 已选择文章文件夹 = 文件夹列表.querySelector(".文件夹项[data-序号]");
      已选择文章文件夹?.removeAttribute("data-序号");
      const 文件夹项 = 文件夹列表.querySelector(`.文件夹项[data-文件夹名="${随机文章.文件夹名}"]`);
      if (文件夹项) {
        文件夹项.dataset.序号 = 文章容器.dataset.序号;
      }

      // 更新当前文章变量
      const 文章序号 = 文章容器.querySelector(".文章序号")?.textContent.trim() || "";
      const 文章标题 = 文章容器.querySelector(".文章标题")?.textContent.trim() || "";
      当前文章 = `${文章序号}_${文章标题}`;
    }
  }

  return 随机文章;
}

function 更新文章标题显示(文件夹名, 文件名) {
  const 文章标题设置子区 = document.querySelector(".文章标题设置子区");
  if (!文章标题设置子区) return;

  // 清空之前的内容
  文章标题设置子区.innerHTML = "";

  // 解析文件名：序号_文本部分.txt
  const 文件名部分 = 文件名.split("_");
  const 文章序号 = 文件名部分[0];
  const 文章文本部分 = 文件名部分[1] ? 文件名部分[1].replace(/\.txt$/i, "") : "";

  // 创建文件夹名span
  const 文件夹名元素 = document.createElement("span");
  文件夹名元素.className = "文章标题文件夹名";
  文件夹名元素.textContent = 文件夹名;

  // 创建分隔符span
  const 分隔符元素 = document.createElement("span");
  分隔符元素.className = "文章标题分隔符";
  分隔符元素.textContent = " - ";

  // 创建文章名span（包含序号、分隔符、文本部分）
  const 文章名元素 = document.createElement("span");
  文章名元素.className = "文章标题文章名";

  // 创建文章序号span
  const 文章序号元素 = document.createElement("span");
  文章序号元素.className = "文章标题文章序号";
  文章序号元素.textContent = 文章序号;

  // 创建文章分隔符span（将_替换为·）
  const 文章分隔符元素 = document.createElement("span");
  文章分隔符元素.className = "文章标题文章分隔符";
  文章分隔符元素.textContent = "·";

  // 创建文章文本部分span
  const 文章文本元素 = document.createElement("span");
  文章文本元素.className = "文章标题文章文本";
  文章文本元素.textContent = 文章文本部分;

  // 组装文章名
  文章名元素.append(文章序号元素, 文章分隔符元素, 文章文本元素);

  // 组装完整标题
  文章标题设置子区.append(文件夹名元素, 分隔符元素, 文章名元素);

  // 添加"显示"类
  文章标题设置子区.classList.add("显示");
}

// 虚拟滚动：块管理模块
function 获取块索引(字符索引) {
  return Math.floor(字符索引 / 块大小);
}

function 获取块内索引(字符索引) {
  return 字符索引 % 块大小;
}

function 获取字符元素(字符索引) {
  // 先检查映射表
  if (字符元素映射.has(字符索引)) {
    return 字符元素映射.get(字符索引);
  }
  
  // 如果不在映射表中，说明块未渲染，返回 null
  return null;
}

function 创建块(块索引, 开始索引, 结束索引) {
  const 块元素 = document.createElement("div");
  块元素.className = "字符块";
  块元素.dataset.blockIndex = 块索引;
  // 使用 display: contents 避免块影响布局，让字符连续显示
  // 如果浏览器不支持 contents，块元素不会影响布局，字符仍然会连续显示
  块元素.style.display = "contents";
  
  // 确保块元素不会影响布局（作为降级方案）
  块元素.style.margin = "0";
  块元素.style.padding = "0";
  块元素.style.border = "none";
  
  // 确保文章内容字符串已初始化
  if (!文章内容字符串 || 文章内容字符串.length === 0) {
    console.error("文章内容字符串为空，无法创建块");
    return null;
  }
  
  const 字符片段 = 文章内容字符串.slice(开始索引, 结束索引);
  const 字符元素数组 = [];
  
  for (let i = 0; i < 字符片段.length; i++) {
    const 字符 = 字符片段[i];
    const 全局索引 = 开始索引 + i;
    
    const 字符元素 = document.createElement("span");
    字符元素.className = "原始字符";
    字符元素.textContent = 字符;
    字符元素.dataset.charIndex = 全局索引;
    字符元素.setAttribute("data-input", ""); // 初始化 data-input 属性为空
    
    if (字符 === "\n") {
      字符元素.classList.add("换行符");
    } else if (字符 === " ") {
      字符元素.classList.add("空格");
    }
    
    块元素.appendChild(字符元素);
    字符元素数组.push(字符元素);
    字符元素映射.set(全局索引, 字符元素);
  }
  
  return {
    blockElement: 块元素,
    elements: 字符元素数组,
    startIndex: 开始索引,
    endIndex: 结束索引,
    isRendered: true
  };
}

function 卸载块(块索引) {
  const 块数据 = 块数组[块索引];
  if (!块数据 || !块数据.isRendered) return;
  
  // 从映射表中移除
  for (let i = 块数据.startIndex; i < 块数据.endIndex; i++) {
    字符元素映射.delete(i);
  }
  
  // 从 DOM 中移除
  if (块数据.blockElement.parentNode) {
    块数据.blockElement.parentNode.removeChild(块数据.blockElement);
  }
  
  块数据.isRendered = false;
  块数据.blockElement = null;
  块数据.elements = null;
}

function 渲染块(块索引) {
  const 块数据 = 块数组[块索引];
  if (!块数据 || 块数据.isRendered) return;
  
  // 重新创建块
  const 新块数据 = 创建块(块索引, 块数据.startIndex, 块数据.endIndex);
  if (!新块数据) {
    console.error(`创建块 ${块索引} 失败`);
    return;
  }
  块数组[块索引] = 新块数据;
  
  // 插入到正确位置
  let 插入位置 = null;
  for (let i = 块索引 - 1; i >= 0; i--) {
    if (块数组[i] && 块数组[i].isRendered && 块数组[i].blockElement.parentNode) {
      插入位置 = 块数组[i].blockElement.nextSibling;
      break;
    }
  }
  
  if (插入位置) {
    输入容器.insertBefore(新块数据.blockElement, 插入位置);
  } else {
    // 如果没有找到插入位置，直接追加到容器末尾
    输入容器.appendChild(新块数据.blockElement);
  }
  
  // 恢复错误标记和状态
  恢复块状态(块索引);
}

function 恢复块状态(块索引) {
  const 块数据 = 块数组[块索引];
  if (!块数据 || !块数据.isRendered) return;
  
  for (let i = 块数据.startIndex; i < 块数据.endIndex; i++) {
    const 字符元素 = 字符元素映射.get(i);
    if (!字符元素) continue;
    
    // 恢复错误标记
    if (错误字符集合[i]) {
      字符元素.classList.add("错误");
      字符元素.classList.remove("正确");
    } else if (i < 当前输入索引) {
      // 已输入但未标记为错误的字符，标记为正确
      字符元素.classList.add("正确");
      字符元素.classList.remove("错误");
    }
    
    // 恢复当前字符高亮
    if (i === 当前输入索引) {
      字符元素.classList.add("当前");
      上一个当前字符元素 = 字符元素;
    } else {
      字符元素.classList.remove("当前");
    }
  }
}

function 更新可见块() {
  if (!输入容器) return;
  
  // 如果块数组为空，说明还没有初始化，直接返回
  if (!块数组 || 块数组.length === 0) return;
  
  // 如果正在程序滚动，暂时不更新可见块，避免干扰滚动
  if (正在程序滚动) return;
  
  // 计算当前输入索引所在的块
  const 当前块索引 = 获取块索引(当前输入索引);
  
  // 确定需要渲染的块范围（当前 + 前后各 2 个）
  const 预加载范围 = 2;
  const 最小块索引 = Math.max(0, 当前块索引 - 预加载范围);
  const 最大块索引 = Math.min(块数组.length - 1, 当前块索引 + 预加载范围);
  
  // 卸载不在范围内的块
  for (let i = 0; i < 块数组.length; i++) {
    if (i < 最小块索引 || i > 最大块索引) {
      卸载块(i);
    }
  }
  
  // 渲染在范围内的块
  for (let i = 最小块索引; i <= 最大块索引; i++) {
    if (块数组[i] && !块数组[i].isRendered) {
      渲染块(i);
    }
  }
}

function 确保块已加载(字符索引) {
  const 目标块索引 = 获取块索引(字符索引);
  
  // 如果目标块未渲染，先渲染它
  if (!块数组[目标块索引] || !块数组[目标块索引].isRendered) {
    渲染块(目标块索引);
  }
  
  // 同时确保相邻块也已加载（用于平滑滚动）
  const 预加载范围 = 1;
  for (let i = Math.max(0, 目标块索引 - 预加载范围); 
       i <= Math.min(块数组.length - 1, 目标块索引 + 预加载范围); 
       i++) {
    if (块数组[i] && !块数组[i].isRendered) {
      渲染块(i);
    }
  }
}

// 节流函数
function 节流(函数, 延迟) {
  let 上次执行时间 = 0;
  let 定时器ID = null;
  
  return function(...参数) {
    const 当前时间 = Date.now();
    const 剩余时间 = 延迟 - (当前时间 - 上次执行时间);
    
    if (剩余时间 <= 0) {
      上次执行时间 = 当前时间;
      函数.apply(this, 参数);
    } else {
      clearTimeout(定时器ID);
      定时器ID = setTimeout(() => {
        上次执行时间 = Date.now();
        函数.apply(this, 参数);
      }, 剩余时间);
    }
  };
}

async function 初始化输入容器(文章内容) {
  文章内容 = 在英文中文间添加空格(文章内容);
  文章内容字符串 = 文章内容; // 保存原始内容供虚拟滚动使用
  const 输入区 = document.querySelector(".输入区");
  if (!输入区) return;

  输入区.innerHTML = "";

  当前输入索引 = 0;
  错误字符集合 = {};
  退格次数 = 0;
  正在合成 = false;
  测试结束状态 = false;
  测试开始时间 = null;
  测试结束时间 = null;
  配对符号状态.clear(); // 重置配对符号状态

  总字符数 = 文章内容.length;
  已输入字符数 = 0;
  正确字符数 = 0;
  错误字符数 = 0;
  累计已用时间 = 0;
  正在计时 = false;
  计时器开始时间 = null;

  停止倒计时();
  停止统计数据收集();
  统计数据数组 = [];
  倒计时暂停时剩余时间 = 0;

  // 隐藏结果区
  隐藏结果区();

  const 定时复选框 = document.querySelector("#定时复选框");
  if (定时复选框 && 定时复选框.checked) {
    const 初始分钟值 = 从本地存储读取(Storage_Keys.定时器分, 1);
    const 初始秒值 = 从本地存储读取(Storage_Keys.定时器秒, 0);
    if (分钟输入框) 分钟输入框.value = 初始分钟值;
    if (秒输入框) 秒输入框.value = 初始秒值;
  }

  if (测试结束覆盖层) {
    测试结束覆盖层.style.display = "none";
  }

  更新统计信息();
  更新计时器显示();
  更新速度显示();

  // 清理旧的虚拟滚动数据
  块数组 = [];
  字符元素映射.clear();
  上一个当前字符元素 = null;
  if (滚动监听器) {
    输入容器?.removeEventListener("scroll", 滚动监听器);
    滚动监听器 = null;
  }

  输入容器 = document.createElement("div");
  输入容器.className = "输入容器";
  // 如果文章包含中文，添加"中文文章"类
  if (包含中文(文章内容)) {
    输入容器.classList.add("中文文章");
  }
  输入容器.setAttribute("tabindex", "0");

  // 虚拟滚动：创建块结构
  // 注意：总字符数已经在上面赋值了，这里直接使用
  const 块数量 = Math.ceil(总字符数 / 块大小);
  
  for (let i = 0; i < 块数量; i++) {
    const 开始索引 = i * 块大小;
    const 结束索引 = Math.min(开始索引 + 块大小, 总字符数);
    
    块数组.push({
      blockElement: null,
      elements: null,
      startIndex: 开始索引,
      endIndex: 结束索引,
      isRendered: false
    });
  }

  // 初始只渲染当前块 + 前后各 2 个（共 5 个）
  当前输入索引 = 0;
  更新可见块();

  输入区.appendChild(输入容器);
  
  // 添加滚动监听器（使用节流优化）
  滚动监听器 = 节流(() => {
    更新可见块();
  }, 100);
  输入容器.addEventListener("scroll", 滚动监听器, { passive: true });
  
  // 禁止使用鼠标滚轮对输入容器进行滚动
  输入容器.addEventListener("wheel", (event) => {
    event.preventDefault();
  }, { passive: false });
  
  // 兼容旧版浏览器的 mousewheel 事件
  输入容器.addEventListener("mousewheel", (event) => {
    event.preventDefault();
    return false;
  }, { passive: false });
  
  // 所有字符元素缓存改为通过映射表访问（虚拟滚动时）
  所有字符元素缓存 = null; // 不再使用全局缓存，改为通过映射表访问
  上一个当前字符元素 = null;
  
  // 缓存DOM元素引用
  字符数显示元素 = document.querySelector("#字符数显示");
  已输入字符数元素 = 字符数显示元素?.querySelector(".已输入字符数");
  总字符数元素 = 字符数显示元素?.querySelector(".总字符数");
  错误数据显示元素 = document.querySelector("#错误数据显示");
  错误字符数元素 = 错误数据显示元素?.querySelector(".错误字符数");
  退格次数元素 = 错误数据显示元素?.querySelector(".退格次数");
  正确率数字元素 = 错误数据显示元素?.querySelector(".正确率数字");
  小数点元素 = 错误数据显示元素?.querySelector(".小数点");
  正确率小数元素 = 错误数据显示元素?.querySelector(".正确率小数");
  进度圆环元素 = document.querySelector("#进度圆环");
  进度百分比元素 = document.querySelector("#进度百分比");
  进度数字元素 = 进度百分比元素?.querySelector(".进度数字");
  进度小数点元素 = 进度百分比元素?.querySelector(".进度小数点");
  进度小数元素 = 进度百分比元素?.querySelector(".进度小数");
  进度百分号元素 = 进度百分比元素?.querySelector(".进度百分号");

  测试结束覆盖层 = document.createElement("div");
  测试结束覆盖层.className = "测试结束覆盖层";
  测试结束覆盖层.textContent = "测试结束";
  测试结束覆盖层.style.display = "none";
  输入区.appendChild(测试结束覆盖层);

  隐藏输入框 = document.createElement("input");
  隐藏输入框.className = "隐藏输入框";
  隐藏输入框.type = "text";
  隐藏输入框.style.position = "absolute";
  隐藏输入框.style.opacity = "0";
  隐藏输入框.style.pointerEvents = "none";
  隐藏输入框.style.width = "1px";
  隐藏输入框.style.height = "1px";
  隐藏输入框.style.left = "-9999px";
  
  // 禁用输入法的自动配对/补全功能
  隐藏输入框.autocomplete = "off";
  隐藏输入框.autocapitalize = "off";
  隐藏输入框.spellcheck = false;
  隐藏输入框.inputMode = "text";
  隐藏输入框.setAttribute("autocomplete", "off");
  隐藏输入框.setAttribute("autocapitalize", "off");
  隐藏输入框.setAttribute("spellcheck", "false");
  隐藏输入框.setAttribute("inputmode", "text");
  
  // 如果文章列表正在显示，则禁用隐藏输入框；否则启用
  隐藏输入框.disabled = 文章列表区.classList.contains("显示");
  输入区.appendChild(隐藏输入框);

  更新当前字符高亮();

  // 只有在隐藏输入框未禁用时才让它获得焦点
  if (隐藏输入框 && !隐藏输入框.disabled) {
    隐藏输入框.focus();
  }

  输入容器.addEventListener("mousedown", (event) => {
    if (隐藏输入框 && document.activeElement === 隐藏输入框) {
      event.preventDefault();
    }
  });

  输入容器.addEventListener("click", () => {
    if (隐藏输入框 && document.activeElement !== 隐藏输入框) {
      隐藏输入框.focus();
    }
  });

  输入容器.addEventListener("keydown", 处理键盘输入);
  隐藏输入框.addEventListener("keydown", 处理键盘输入);

  // 定义符号配对规则（前符号 -> 后符号）
  const 符号配对规则 = new Map([
    ["\"", "\""],  // 英文双引号
    ["'", "'"],    // 英文单引号
    ["\u201C", "\u201D"],  // 中文左双引号 -> 中文右双引号
    ["\u2018", "\u2019"],  // 中文左单引号 -> 中文右单引号
    ["(", ")"],    // 英文圆括号
    ["[", "]"],    // 英文方括号
    ["{", "}"],    // 英文花括号
    ["（", "）"],   // 中文全角圆括号
    ["【", "】"],   // 中文方括号
    ["「", "」"],   // 中文引号式方括号
    ["｛", "｝"],   // 中文全角花括号
    ["《", "》"],   // 书名号
    ["<", ">"],    // 尖括号
  ]);

  // 检查是否是符号自动配对（包括正向和反向）
  // 注意：这个函数只检查输入数据是否是配对符号的自动配对，不检查是否匹配当前应该输入的字符
  function 是符号自动配对(输入数据, 当前应该输入的字符) {
    if (!输入数据 || 输入数据.length !== 2) return false;
    
    // 正向配对：前符号+后符号
    const 第一个字符是前符号 = 是前符号(输入数据[0]);
    if (第一个字符是前符号) {
      const 后符号 = 符号配对规则.get(输入数据[0]);
      if (后符号 && 输入数据[1] === 后符号) {
        return true;
      }
    }
    
    // 反向配对：后符号+前符号
    const 后符号检查 = 是后符号(输入数据[0]);
    if (后符号检查.是后符号) {
      if (输入数据[1] === 后符号检查.对应的前符号) {
        return true;
      }
    }
    
    return false;
  }

  // 检查字符是否是配对符号的前符号
  function 是前符号(字符) {
    return 符号配对规则.has(字符);
  }

  // 检查字符是否是配对符号的后符号
  function 是后符号(字符) {
    for (const [前符号, 后符号] of 符号配对规则) {
      if (后符号 === 字符) {
        return { 是后符号: true, 对应的前符号: 前符号 };
      }
    }
    return { 是后符号: false, 对应的前符号: null };
  }

  // 处理配对符号的输入逻辑
  function 处理配对符号输入(输入的字符, 当前应该输入的字符) {
    // 如果输入的是前符号
    if (是前符号(输入的字符)) {
      const 状态 = 配对符号状态.get(输入的字符) || false;
      if (!状态) {
        // 第一次输入前符号，只输入前符号，设置状态为true
        配对符号状态.set(输入的字符, true);
        return 输入的字符; // 返回前符号
      } else {
        // 状态已经是true，说明之前已经输入过前符号，现在再次输入前符号时，应该输入后符号
        const 后符号 = 符号配对规则.get(输入的字符);
        if (后符号) {
          配对符号状态.set(输入的字符, false); // 重置状态
          return 后符号; // 返回后符号
        }
        return 输入的字符;
      }
    }
    
    // 如果输入的是后符号
    const 后符号检查 = 是后符号(输入的字符);
    if (后符号检查.是后符号) {
      const 前符号 = 后符号检查.对应的前符号;
      const 状态 = 配对符号状态.get(前符号) || false;
      if (状态) {
        // 之前已经输入过前符号，现在输入后符号，重置状态
        配对符号状态.set(前符号, false);
      }
      // 无论状态如何，都返回后符号（允许直接输入后符号）
      return 输入的字符; // 返回后符号
    }
    
    // 不是配对符号，直接返回
    return 输入的字符;
  }

  // 监听 beforeinput 事件，阻止输入法的自动配对/补全
  隐藏输入框.addEventListener("beforeinput", (event) => {
    // 如果输入类型是 insertCompositionText 或 insertText，检查是否是自动配对
    if (event.inputType === "insertCompositionText" || event.inputType === "insertText") {
      const 输入数据 = event.data;
      if (!输入数据) return;
      
      // 确保块已加载
      确保块已加载(当前输入索引);
      const 当前字符元素 = 获取字符元素(当前输入索引);
      const 当前应该输入的字符 = 当前字符元素 ? 当前字符元素.textContent : null;
      
      // 处理多字符输入（自动配对）
      if (输入数据.length > 1) {
        // 检查是否是配对符号的自动配对（无论状态如何，都要阻止）
        const 第一个字符是前符号 = 是前符号(输入数据[0]);
        const 第一个字符是后符号 = 是后符号(输入数据[0]);
        const 第二个字符是后符号检查 = 是后符号(输入数据[1]);
        const 第二个字符是前符号 = 是前符号(输入数据[1]);
        
        // 正向配对：前符号+后符号
        if (第一个字符是前符号 && 第二个字符是后符号检查.是后符号) {
          if (第二个字符是后符号检查.对应的前符号 === 输入数据[0]) {
            // 确实是配对符号的自动配对，无论状态如何都要阻止
            event.preventDefault();
            const 前符号 = 输入数据[0];
            const 状态 = 配对符号状态.get(前符号) || false;
            if (状态) {
              // 状态为true，应该处理后符号
              const 后符号 = 符号配对规则.get(前符号);
              if (后符号) {
                配对符号状态.set(前符号, false);
                if (!正在合成) {
                  处理输入字符(后符号);
                }
              }
            } else {
              // 状态为false，处理前符号
              配对符号状态.set(前符号, true);
              if (!正在合成) {
                处理输入字符(前符号);
              }
            }
            隐藏输入框.value = "";
            return;
          }
        }
        
        // 反向配对：后符号+前符号
        if (第一个字符是后符号 && 第二个字符是前符号) {
          const 后符号检查 = 是后符号(输入数据[0]);
          if (后符号检查.是后符号 && 后符号检查.对应的前符号 === 输入数据[1]) {
            // 确实是配对符号的自动配对，无论状态如何都要阻止
            event.preventDefault();
            const 前符号 = 后符号检查.对应的前符号;
            const 状态 = 配对符号状态.get(前符号) || false;
            if (状态) {
              // 状态为true，应该处理后符号
              配对符号状态.set(前符号, false);
              if (!正在合成) {
                处理输入字符(输入数据[0]); // 处理后符号
              }
            } else {
              // 状态为false，但输入的是反向配对，处理后符号
              配对符号状态.set(前符号, false);
              if (!正在合成) {
                处理输入字符(输入数据[0]); // 处理后符号
              }
            }
            隐藏输入框.value = "";
            return;
          }
        }
        
        // 如果是正常的多字符输入（如中文词组），不阻止，让后续的 input 事件处理
      } else if (输入数据.length === 1) {
        // 处理单个字符输入：如果是配对符号的前符号，且状态为true，应该阻止并处理后符号
        if (是前符号(输入数据)) {
          const 状态 = 配对符号状态.get(输入数据) || false;
          if (状态) {
            // 状态为true，应该处理后符号，阻止输入法自动配对
            event.preventDefault();
            const 后符号 = 符号配对规则.get(输入数据);
            if (后符号) {
              配对符号状态.set(输入数据, false);
              if (!正在合成) {
                处理输入字符(后符号);
              }
              隐藏输入框.value = "";
              return;
            }
          }
        }
      }
    }
  });

  隐藏输入框.addEventListener("compositionstart", () => {
    正在合成 = true;
    更新隐藏输入框位置();
  });
  隐藏输入框.addEventListener("compositionupdate", () => {});
  隐藏输入框.addEventListener("compositionend", (event) => {
    正在合成 = false;

    const 输入的字符 = 隐藏输入框.value;
    if (输入的字符) {
      // 确保块已加载
      确保块已加载(当前输入索引);
      const 当前字符元素 = 获取字符元素(当前输入索引);
      const 当前应该输入的字符 = 当前字符元素 ? 当前字符元素.textContent : null;
      
      // 如果是符号自动配对，检查状态决定处理前符号还是后符号
      if (是符号自动配对(输入的字符, 当前应该输入的字符)) {
        // 判断是正向配对（前符号+后符号）还是反向配对（后符号+前符号）
        const 是前符号输入 = 符号配对规则.has(输入的字符[0]);
        const 后符号检查 = 是后符号(输入的字符[0]);
        const 是后符号输入 = 后符号检查.是后符号;
        
        if (是前符号输入) {
          // 正向配对：前符号+后符号
          const 前符号 = 输入的字符[0];
          const 状态 = 配对符号状态.get(前符号) || false;
          if (状态) {
            // 状态为true，应该处理后符号
            const 后符号 = 符号配对规则.get(前符号);
            if (后符号) {
              配对符号状态.set(前符号, false);
              处理输入字符(后符号);
            }
          } else {
            // 状态为false，处理前符号
            配对符号状态.set(前符号, true);
            处理输入字符(前符号);
          }
        } else if (是后符号输入) {
          // 反向配对：后符号+前符号
          const 前符号 = 后符号检查.对应的前符号;
          const 状态 = 配对符号状态.get(前符号) || false;
          if (状态) {
            // 状态为true，应该处理后符号
            配对符号状态.set(前符号, false);
            处理输入字符(输入的字符[0]); // 处理后符号
          } else {
            // 状态为false，但输入的是反向配对，处理后符号
            配对符号状态.set(前符号, false);
            处理输入字符(输入的字符[0]); // 处理后符号
          }
        }
      } else if (输入的字符.length === 1) {
        // 单个字符输入，检查是否是配对符号
        const 处理后的字符 = 处理配对符号输入(输入的字符, 当前应该输入的字符);
        处理输入字符(处理后的字符);
      } else {
        // 多字符输入（如中文词组），直接处理
        处理输入字符(输入的字符);
      }
      隐藏输入框.value = "";
    }
  });
  隐藏输入框.addEventListener("input", (event) => {
    if (!正在合成) {
      const 输入的字符 = 隐藏输入框.value;
      if (输入的字符) {
        // 确保块已加载
        确保块已加载(当前输入索引);
        const 当前字符元素 = 获取字符元素(当前输入索引);
        const 当前应该输入的字符 = 当前字符元素 ? 当前字符元素.textContent : null;
        
        // 如果是符号自动配对，检查状态决定处理前符号还是后符号
        if (是符号自动配对(输入的字符, 当前应该输入的字符)) {
          // 判断是正向配对（前符号+后符号）还是反向配对（后符号+前符号）
          const 是前符号输入 = 符号配对规则.has(输入的字符[0]);
          const 后符号检查 = 是后符号(输入的字符[0]);
          const 是后符号输入 = 后符号检查.是后符号;
          
          if (是前符号输入) {
            // 正向配对：前符号+后符号
            const 前符号 = 输入的字符[0];
            const 状态 = 配对符号状态.get(前符号) || false;
            if (状态) {
              // 状态为true，应该处理后符号
              const 后符号 = 符号配对规则.get(前符号);
              if (后符号) {
                配对符号状态.set(前符号, false);
                处理输入字符(后符号);
              }
            } else {
              // 状态为false，处理前符号
              配对符号状态.set(前符号, true);
              处理输入字符(前符号);
            }
          } else if (是后符号输入) {
            // 反向配对：后符号+前符号
            const 前符号 = 后符号检查.对应的前符号;
            const 状态 = 配对符号状态.get(前符号) || false;
            if (状态) {
              // 状态为true，应该处理后符号
              配对符号状态.set(前符号, false);
              处理输入字符(输入的字符[0]); // 处理后符号
            } else {
              // 状态为false，但输入的是反向配对，处理后符号
              配对符号状态.set(前符号, false);
              处理输入字符(输入的字符[0]); // 处理后符号
            }
          }
        } else if (输入的字符.length === 1) {
          // 单个字符输入，检查是否是配对符号
          const 处理后的字符 = 处理配对符号输入(输入的字符, 当前应该输入的字符);
          处理输入字符(处理后的字符);
        } else {
          // 多字符输入（如中文词组），直接处理
          处理输入字符(输入的字符);
        }
        隐藏输入框.value = "";
      }
    }
  });

  隐藏输入框.addEventListener("focus", () => {
    if (已输入字符数 > 0 && !正在计时) {
      开始计时();
    }
  });

  隐藏输入框.addEventListener("blur", () => {
    暂停计时();
  });

  输入容器.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
    }
  });
}

function 更新隐藏输入框位置() {
  if (!隐藏输入框 || !输入容器) return;

  // 确保目标字符所在的块已加载
  确保块已加载(当前输入索引);
  
  const 当前字符元素 = 获取字符元素(当前输入索引);
  if (!当前字符元素) return;

  const 字符位置 = 当前字符元素.getBoundingClientRect();
  const 输入区元素 = document.querySelector(".输入区");
  if (!输入区元素) return;

  const 输入区位置 = 输入区元素.getBoundingClientRect();

  const 相对左 = 字符位置.left - 输入区位置.left + 输入区元素.scrollLeft + 20;
  const 相对上 = 字符位置.top - 输入区位置.top + 输入区元素.scrollTop + 30;

  隐藏输入框.style.left = `${相对左}px`;
  隐藏输入框.style.top = `${相对上}px`;
}

function 滚动到当前字符() {
  if (!输入容器) return;

  if (当前输入索引 === 0) return; // 还没有输入任何字符，不滚动

  // 检查刚刚输入的字符（当前输入索引 - 1），而不是下一个要输入的字符
  const 刚刚输入的字符索引 = 当前输入索引 - 1;
  if (刚刚输入的字符索引 < 0 || 刚刚输入的字符索引 >= 总字符数) return;

  // 确保容器已加载
  确保块已加载(刚刚输入的字符索引);
  
  const 刚刚输入的字符元素 = 获取字符元素(刚刚输入的字符索引);
  if (!刚刚输入的字符元素) return;

  // 找到刚刚输入的字符所在行的最后一个字符
  const 刚刚输入的字符矩形 = 刚刚输入的字符元素.getBoundingClientRect();
  const 当前行顶部 = 刚刚输入的字符矩形.top;
  const 行容差 = 2; // 允许2px的误差，因为字符可能有轻微的高度差异
  
  let 当前行最后一个字符索引 = 刚刚输入的字符索引;
  
  // 向后查找，找到第一个不在同一行的字符
  // 限制查找范围，避免遍历过多元素（最多查找100个字符）
  const 最大查找范围 = Math.min(刚刚输入的字符索引 + 100, 总字符数);
  for (let i = 刚刚输入的字符索引 + 1; i < 最大查找范围; i++) {
    // 确保块已加载
    确保块已加载(i);
    
    const 下一个字符元素 = 获取字符元素(i);
    if (!下一个字符元素) break;
    
    const 下一个字符矩形 = 下一个字符元素.getBoundingClientRect();
    // 如果下一个字符的top位置与当前字符的top位置差异超过容差，说明不在同一行
    if (Math.abs(下一个字符矩形.top - 当前行顶部) > 行容差) {
      break;
    }
    当前行最后一个字符索引 = i;
  }

  // 只有当刚刚输入的字符是它所在行的最后一个字符时，才检查是否需要滚动
  if (刚刚输入的字符索引 !== 当前行最后一个字符索引) {
    return; // 不是行尾，不滚动
  }

  // 使用 requestAnimationFrame 确保在布局更新后计算位置
  requestAnimationFrame(() => {
    const 容器高度 = 输入容器.clientHeight;
    const 容器滚动顶部 = 输入容器.scrollTop;
    const 容器滚动底部 = 容器滚动顶部 + 容器高度;

    const 容器矩形 = 输入容器.getBoundingClientRect();
    const 字符矩形 = 刚刚输入的字符元素.getBoundingClientRect();

    // 计算字符相对于容器的绝对位置（考虑滚动）
    // 使用 getBoundingClientRect 计算相对位置，然后加上当前滚动位置
    // 这样可以避免因为块元素的存在导致的位置计算错误
    const 字符相对顶部 = 字符矩形.top - 容器矩形.top + 容器滚动顶部;
    const 字符相对底部 = 字符矩形.bottom - 容器矩形.top + 容器滚动顶部;

    const 边距 = 80;
    const 可见区域顶部 = 容器滚动顶部 + 边距;
    const 可见区域底部 = 容器滚动底部 - 边距;

    const 容器上内边距 = 20;

    // 只在需要滚动时才滚动，避免重复滚动
    if (字符相对顶部 < 可见区域顶部) {
      // 计算目标滚动位置：让字符行顶部距离容器顶部有 容器上内边距 的距离
      const 目标滚动位置 = 字符相对顶部 - 容器上内边距;
      // 检查目标位置是否与当前滚动位置差异较大，避免微小调整
      const 滚动差异 = Math.abs(目标滚动位置 - 容器滚动顶部);
      if (滚动差异 > 5) {
        正在程序滚动 = true;
        输入容器.scrollTo({
          top: Math.max(0, 目标滚动位置),
          behavior: "smooth",
        });
        // 滚动完成后重置标志（平滑滚动大约需要 500ms）
        setTimeout(() => {
          正在程序滚动 = false;
        }, 600);
      }
    } else if (字符相对底部 > 可见区域底部) {
      // 让新行滚动到容器顶部，与最开始的第一行保持相同的垂直位置
      // 计算目标滚动位置：让字符行顶部距离容器顶部有 容器上内边距 的距离
      const 目标滚动位置 = 字符相对顶部 - 容器上内边距;
      // 检查目标位置是否与当前滚动位置差异较大，避免微小调整
      const 滚动差异 = Math.abs(目标滚动位置 - 容器滚动顶部);
      if (滚动差异 > 5) {
        正在程序滚动 = true;
        输入容器.scrollTo({
          top: Math.max(0, 目标滚动位置),
          behavior: "smooth",
        });
        // 滚动完成后重置标志（平滑滚动大约需要 500ms）
        setTimeout(() => {
          正在程序滚动 = false;
        }, 600);
      }
    }
  });
}

function 更新当前字符高亮() {
  if (!输入容器) return;

  // 只更新上一个和当前元素，而不是遍历所有元素
  if (上一个当前字符元素) {
    上一个当前字符元素.classList.remove("当前");
    上一个当前字符元素 = null;
  }

  // 确保当前字符所在的块已加载
  确保块已加载(当前输入索引);
  
  if (当前输入索引 < 总字符数) {
    const 当前字符元素 = 获取字符元素(当前输入索引);
    if (当前字符元素) {
      当前字符元素.classList.add("当前");
      上一个当前字符元素 = 当前字符元素;
      更新隐藏输入框位置();

      滚动到当前字符();
    }
  }
  
  // 更新可见块（输入时可能需要加载下一个块）
  更新可见块();
}

function 处理键盘输入(event) {
  if (测试结束状态) {
    event.preventDefault();
    return;
  }

  if (event.key === "Backspace") {
    event.preventDefault();

    if (当前输入索引 > 0) {
      退格次数++;
      当前输入索引--;

      // 确保块已加载（退格时可能需要加载前一个块）
      确保块已加载(当前输入索引);
      
      const 当前字符元素 = 获取字符元素(当前输入索引);
      if (当前字符元素) {
        if (当前字符元素.classList.contains("正确")) {
          正确字符数--;
        } else if (当前字符元素.classList.contains("错误")) {
          错误字符数--;
        }

        当前字符元素.classList.remove("正确", "错误");
        // 清除 data-input 属性
        当前字符元素.setAttribute("data-input", "");
        if (错误字符集合[当前输入索引]) {
          delete 错误字符集合[当前输入索引];
        }
      }

      已输入字符数--;

      // 标记需要更新统计信息，使用节流
      待更新的统计信息 = true;
      if (!统计信息更新定时器) {
        统计信息更新定时器 = requestAnimationFrame(() => {
          更新统计信息();
          待更新的统计信息 = false;
          统计信息更新定时器 = null;
        });
      }

      更新当前字符高亮();
    }
    return;
  }

  if (!正在合成 && 隐藏输入框 && event.target !== 隐藏输入框) {
    隐藏输入框.focus();
  }
}

function 处理输入字符(输入的字符) {
  if (!输入的字符 || 输入的字符.length === 0) return;

  if (测试结束状态) return;

  if (已输入字符数 === 0 && 当前输入索引 === 0) {
    开始计时();
    开始倒计时();
  } else if (倒计时暂停时剩余时间 > 0 && !正在倒计时) {
    开始倒计时();
  }

  for (let i = 0; i < 输入的字符.length; i++) {
    if (当前输入索引 >= 总字符数) {
      break;
    }

    // 确保当前字符所在的块已加载
    确保块已加载(当前输入索引);
    
    const 当前字符元素 = 获取字符元素(当前输入索引);
    if (!当前字符元素) {
      // 如果块未加载，跳过这个字符（理论上不应该发生）
      当前输入索引++;
      continue;
    }
    
    const 应该输入的字符 = 当前字符元素.textContent;
    const 实际输入的字符 = 输入的字符[i];

    当前字符元素.classList.remove("当前");

    // 更新 data-input 属性，显示用户实际输入的内容
    当前字符元素.setAttribute("data-input", 实际输入的字符);

    已输入字符数++;

    if (实际输入的字符 === 应该输入的字符) {
      当前字符元素.classList.remove("错误");
      当前字符元素.classList.add("正确");
      正确字符数++;
    } else {
      当前字符元素.classList.remove("正确");
      当前字符元素.classList.add("错误");
      错误字符数++;

      错误字符集合[当前输入索引] = {
        原始字符: 应该输入的字符,
        实际输入字符: 实际输入的字符,
      };
    }

    当前输入索引++;
  }

  if (当前输入索引 >= 总字符数) {
    进入测试结束状态("所有字符输入完成");
  }

  // 标记需要更新统计信息，使用节流
  待更新的统计信息 = true;
  if (!统计信息更新定时器) {
    统计信息更新定时器 = requestAnimationFrame(() => {
      更新统计信息();
      待更新的统计信息 = false;
      统计信息更新定时器 = null;
    });
  }

  更新当前字符高亮();
}

function 初始化开始按钮() {
  const 开始按钮 = document.querySelector("#开始");
  if (开始按钮) {
    开始按钮.addEventListener("click", async () => {
      const 随机复选框 = document.querySelector("#随机复选框");
      const 是否随机 = 随机复选框 && 随机复选框.checked;

      let 文件路径, 文件夹名, 文件名;

      if (是否随机) {
        // 随机选择文章
        const 随机文章 = await 随机选择文章();
        if (!随机文章) {
          return; // 没有可用的文章
        }
        文件路径 = 随机文章.文件路径;
        文件夹名 = 随机文章.文件夹名;
        文件名 = 随机文章.文件名;
      } else {
        // 使用当前激活的文章
      const 激活的文章容器 = 文章列表区.querySelector(".文章容器.激活");
        if (!激活的文章容器) {
          return; // 没有激活的文章
        }
        文件路径 = 激活的文章容器.dataset.文件路径;
        // 从文件路径中提取文件夹名和文件名
        const 路径部分 = 文件路径.split("/");
        文件名 = 路径部分[路径部分.length - 1];
        文件夹名 = 路径部分[路径部分.length - 2];
      }

        const 文章内容 = await fetch(文件路径)
          .then((response) => response.text())
        .then((内容) => 内容.trim().replace(/[\r\n]+/g, " "));
      // 更新文章标题显示
      更新文章标题显示(文件夹名, 文件名);
        await 初始化输入容器(文章内容);
    });
  }
}

function 初始化终止和详情按钮() {
  const 终止按钮 = document.querySelector("#终止按钮");
  if (终止按钮) {
    终止按钮.addEventListener("click", () => {
      进入测试结束状态("用户主动终止");
    });
  }

  const 详情按钮 = document.querySelector("#详情按钮");
  if (详情按钮) {
    详情按钮.addEventListener("click", () => {
      // 允许在任何时候打开结果区
        显示结果区();
    });
  }
}

// 结果区相关函数
function 显示结果区() {
  if (!结果区元素) {
    初始化结果区();
  }

  if (测试结束覆盖层) {
    测试结束覆盖层.style.display = "none";
  }

  if (结果区元素) {
    结果区元素.style.display = "block";

    // 检查是否已开始测试（包括测试结束的情况）
    const 已开始测试 = 测试开始时间 !== null || 测试结束状态 || 已输入字符数 > 0;

    // 根据测试状态控制各个部分的显示/隐藏
    控制结果区显示(已开始测试);

    更新结果区头部信息();
    更新结果区图表();
  }
}

// 控制结果区各个部分的显示/隐藏
function 控制结果区显示(已开始测试) {
  if (!结果区元素) return;

  // 结果区头部 - 只有已开始测试时才显示
  const 结果区头部 = 结果区元素.querySelector(".结果区头部");
  if (结果区头部) {
    结果区头部.style.display = 已开始测试 ? "block" : "none";
  }

  // 错误数据分析部分 - 只有已开始测试时才显示
  const 错误分析部分 = 结果区元素.querySelector(".错误分析部分");
  if (错误分析部分) {
    错误分析部分.style.display = 已开始测试 ? "block" : "none";
  }

  // 输入速度分析部分 - 只有已开始测试时才显示
  const 速度分析部分 = 结果区元素.querySelector(".速度分析部分");
  if (速度分析部分) {
    速度分析部分.style.display = 已开始测试 ? "block" : "none";
  }

  // 历史数据对比部分 - 始终显示
  const 历史数据部分 = 结果区元素.querySelector(".历史数据部分");
  if (历史数据部分) {
    历史数据部分.style.display = "block";
  }
}

function 隐藏结果区() {
  if (结果区元素) {
    结果区元素.style.display = "none";
  }
}

function 初始化结果区() {
  const 结果区 = document.querySelector(".结果区");
  if (!结果区) return;

  结果区元素 = 结果区;

  // 创建结果区内容
  结果区.innerHTML = `
    <button class="关闭结果区按钮" id="关闭结果区">×</button>
    <div class="结果区锚链接容器">
      <a href="#结果区头部锚点" class="结果区锚链接"><span class="锚链接图标">📋</span>信息</a>
      <a href="#错误分析锚点" class="结果区锚链接"><span class="锚链接图标">❌</span>错误</a>
      <a href="#速度分析锚点" class="结果区锚链接"><span class="锚链接图标">⚡</span>速度</a>
      <a href="#历史数据锚点" class="结果区锚链接"><span class="锚链接图标">📊</span>排行</a>
    </div>
    <div class="结果区头部" id="结果区头部锚点">
      <div class="结果区头部内容">
        <div class="结果区头部行">
          <div class="结果区头部项">
            <span class="结果区头部标签">测试者：</span><span class="结果区头部值" id="结果区测试者姓名"></span>
          </div>
        </div>
        <div class="结果区头部行">
          <div class="结果区头部项">
            <span class="结果区头部标签">主题：</span><span class="结果区头部值" id="结果区主题"></span>
          </div>
          <div class="结果区头部项">
            <span class="结果区头部标签">文章：</span><span class="结果区头部值" id="结果区文章"></span>
          </div>
          <div class="结果区头部项">
            <span class="结果区头部标签">字符数量：</span><span class="结果区头部值" id="结果区字符数量"></span>
          </div>
          <div class="结果区头部项">
            <span class="结果区头部标签">完成率：</span><span class="结果区头部值" id="结果区完成率"></span>
          </div>
        </div>
        <div class="结果区头部行">
          <div class="结果区头部项">
            <span class="结果区头部标签">测试起始时间：</span><span class="结果区头部值" id="结果区起始时间"></span>
          </div>
          <div class="结果区头部项">
            <span class="结果区头部标签">测试结束时间：</span><span class="结果区头部值" id="结果区结束时间"></span>
          </div>
          <div class="结果区头部项">
            <span class="结果区头部标签">测试用时：</span><span class="结果区头部值" id="结果区测试用时"></span>
          </div>
        </div>
        <div class="结果区头部行">
          <div class="结果区头部项">
            <span class="结果区头部标签">正确率：</span><span class="结果区头部值" id="结果区正确率"></span>
          </div>
          <div class="结果区头部项">
            <span class="结果区头部标签">退格次数：</span><span class="结果区头部值" id="结果区退格次数"></span>
          </div>
          <div class="结果区头部项">
            <span class="结果区头部标签">速度：</span><span class="结果区头部值" id="结果区速度"></span>
          </div>
        </div>
      </div>
    </div>
    <div class="结果区内容">
      <div class="结果区部分 错误分析部分" id="错误分析锚点">
        <h3 class="结果区部分标题">错误数据分析</h3>
        <div id="错误分析图表" style="width: 100%; height: 400px;"></div>
      </div>
      <div class="结果区部分 速度分析部分" id="速度分析锚点">
        <h3 class="结果区部分标题">输入速度分析</h3>
        <div id="速度分析图表" style="width: 100%; height: 400px;"></div>
      </div>
      <div class="结果区部分 历史数据部分" id="历史数据锚点">
        <h3 class="结果区部分标题">历史数据对比</h3>
        <div class="数据切换按钮组">
          <div class="数据切换按钮左侧组">
            <button class="数据切换按钮 激活" data-type="速度">速度</button>
            <button class="数据切换按钮" data-type="正确率">正确率</button>
            <button class="数据切换按钮" data-type="错误次数">错误次数</button>
            <button class="数据切换按钮" data-type="退格次数">退格次数</button>
          </div>
          <button class="清空记录按钮" id="清空记录按钮" title="清空所有历史记录">清空记录</button>
        </div>
        <div id="历史数据图表" style="width: 100%; height: 500px;"></div>
        <div class="分页控件" id="分页控件" style="display: none;">
          <button class="分页按钮" id="上一页按钮" disabled>上一页</button>
          <span class="页码显示" id="页码显示">第 1 页 / 共 1 页</span>
          <button class="分页按钮" id="下一页按钮" disabled>下一页</button>
        </div>
      </div>
    </div>
  `;

  // 初始化历史数据图表
  const 历史数据图表容器 = document.getElementById("历史数据图表");
  if (历史数据图表容器) {
    历史数据图表 = echarts.init(历史数据图表容器);
    // 立即更新一次历史数据图表
    更新历史数据图表();
  }

  // 绑定数据切换按钮
  const 数据切换按钮组 = 结果区.querySelectorAll(".数据切换按钮");
  数据切换按钮组.forEach((按钮) => {
    按钮.addEventListener("click", () => {
      // 移除所有激活状态
      数据切换按钮组.forEach((btn) => btn.classList.remove("激活"));
      // 添加激活状态到当前按钮
      按钮.classList.add("激活");
      当前显示数据类型 = 按钮.getAttribute("data-type");
      当前页码 = 1; // 切换数据类型时重置到第一页
      更新历史数据图表();
    });
  });

  // 绑定分页按钮
  const 上一页按钮 = 结果区.querySelector("#上一页按钮");
  const 下一页按钮 = 结果区.querySelector("#下一页按钮");
  if (上一页按钮) {
    上一页按钮.addEventListener("click", () => {
      if (当前页码 > 1) {
        当前页码--;
        更新历史数据图表();
      }
    });
  }
  if (下一页按钮) {
    下一页按钮.addEventListener("click", () => {
      更新历史数据图表(); // 在更新函数中检查是否可以翻页
    });
  }

  // 绑定清空记录按钮
  const 清空记录按钮 = 结果区.querySelector("#清空记录按钮");
  if (清空记录按钮) {
    清空记录按钮.addEventListener("click", async () => {
      await 清空所有记录();
      当前页码 = 1; // 重置到第一页
      await 更新历史数据图表();
      // 强制刷新图表
      if (历史数据图表) {
        requestAnimationFrame(() => {
          历史数据图表?.resize();
        });
      }
    });
  }

  // 绑定关闭按钮
  const 关闭按钮 = 结果区.querySelector("#关闭结果区");
  if (关闭按钮) {
    关闭按钮.addEventListener("click", 隐藏结果区);
  }

  // 绑定锚链接点击事件，实现平滑滚动
  const 锚链接列表 = 结果区.querySelectorAll(".结果区锚链接");
  锚链接列表.forEach((锚链接) => {
    锚链接.addEventListener("click", (event) => {
      event.preventDefault();
      const href = 锚链接.getAttribute("href");
      if (href && href.startsWith("#")) {
        const 锚点ID = href.substring(1);
        const 目标元素 = document.getElementById(锚点ID);
        if (目标元素 && 结果区元素) {
          // 计算目标元素相对于结果区的位置
          const 结果区矩形 = 结果区元素.getBoundingClientRect();
          const 目标元素矩形 = 目标元素.getBoundingClientRect();
          const 目标位置 = 结果区元素.scrollTop + (目标元素矩形.top - 结果区矩形.top) - 65;
          
          // 平滑滚动到目标位置
          结果区元素.scrollTo({
            top: Math.max(0, 目标位置),
            behavior: "smooth",
          });
        }
      }
    });
  });

  // 初始化图表
  初始化错误分析图表();
  初始化速度分析图表();
}

function 初始化错误分析图表() {
  const 图表容器 = document.getElementById("错误分析图表");
  if (!图表容器) return;

  错误分析图表 = echarts.init(图表容器);
}

function 初始化速度分析图表() {
  const 图表容器 = document.getElementById("速度分析图表");
  if (!图表容器) return;

  速度分析图表 = echarts.init(图表容器);
}

// 格式化日期时间为年月日时分秒（带颜色标签）
function 格式化日期时间(日期对象) {
  if (!日期对象) return "未知";

  const 年 = String(日期对象.getFullYear());
  const 月 = String(日期对象.getMonth() + 1).padStart(2, "0");
  const 日 = String(日期对象.getDate()).padStart(2, "0");
  const 时 = String(日期对象.getHours()).padStart(2, "0");
  const 分 = String(日期对象.getMinutes()).padStart(2, "0");
  const 秒 = String(日期对象.getSeconds()).padStart(2, "0");

  return `<span class="时间数字">${年}</span><span class="时间单位">年</span><span class="时间数字">${月}</span><span class="时间单位">月</span><span class="时间数字">${日}</span><span class="时间单位">日</span> <span class="时间数字">${时}</span><span class="时间冒号">:</span><span class="时间数字">${分}</span><span class="时间冒号">:</span><span class="时间数字">${秒}</span>`;
}

// 格式化测试用时（带颜色标签）
function 格式化测试用时(毫秒) {
  if (!毫秒 || 毫秒 <= 0) return `<span class="时间数字">0</span><span class="用时秒">秒</span>`;

  const 总秒数 = Math.floor(毫秒 / 1000);
  const 小时 = Math.floor(总秒数 / 3600);
  const 分钟 = Math.floor((总秒数 % 3600) / 60);
  const 秒 = 总秒数 % 60;

  let 结果 = "";
  if (小时 > 0) {
    结果 += `<span class="时间数字">${小时}</span><span class="用时小时">小时</span>`;
  }
  if (分钟 > 0) {
    结果 += `<span class="时间数字">${分钟}</span><span class="用时分钟">分钟</span>`;
  }
  if (秒 > 0 || 结果 === "") {
    结果 += `<span class="时间数字">${秒}</span><span class="用时秒">秒</span>`;
  }

  return 结果;
}

function 更新结果区头部信息() {
  if (!结果区元素) return;

  // 更新测试者姓名
  const 测试者姓名元素 = 结果区元素.querySelector("#结果区测试者姓名");
  if (测试者姓名元素) {
    测试者姓名元素.textContent = 测试者姓名 || "未知";
  }

  // 更新主题（文件夹名称）
  const 主题元素 = 结果区元素.querySelector("#结果区主题");
  if (主题元素) {
    主题元素.textContent = 当前文件夹 || "未知";
  }

  // 更新文章文件名
  const 文章元素 = 结果区元素.querySelector("#结果区文章");
  if (文章元素) {
    文章元素.textContent = (当前文章 || "未知").replace(/_/g, " ");
  }

  // 更新字符数量
  const 字符数量元素 = 结果区元素.querySelector("#结果区字符数量");
  if (字符数量元素) {
    字符数量元素.textContent = 总字符数 || 0;
  }

  // 更新完成率
  const 完成率元素 = 结果区元素.querySelector("#结果区完成率");
  if (完成率元素) {
    if (总字符数 > 0) {
      const 进度 = (当前输入索引 / 总字符数) * 100;
      const 格式化结果 = 格式化百分比(进度);
      let 进度文本 = 格式化结果.整数部分;
      if (格式化结果.需要显示小数点 && 格式化结果.小数部分 !== null) {
        进度文本 += "." + 格式化结果.小数部分;
      }
      完成率元素.innerHTML = `<span class="完成率数字">${进度文本}</span><span class="完成率百分号">%</span>`;
    } else {
      完成率元素.innerHTML = `<span class="完成率数字">0</span><span class="完成率百分号">%</span>`;
    }
  }

  // 更新测试起始时间
  const 起始时间元素 = 结果区元素.querySelector("#结果区起始时间");
  if (起始时间元素) {
    起始时间元素.innerHTML = 格式化日期时间(测试开始时间);
  }

  // 更新测试结束时间
  const 结束时间元素 = 结果区元素.querySelector("#结果区结束时间");
  if (结束时间元素) {
    结束时间元素.innerHTML = 格式化日期时间(测试结束时间);
  }

  // 更新测试用时
  const 测试用时元素 = 结果区元素.querySelector("#结果区测试用时");
  if (测试用时元素 && 测试开始时间 && 测试结束时间) {
    const 用时毫秒 = 测试结束时间.getTime() - 测试开始时间.getTime();
    测试用时元素.innerHTML = 格式化测试用时(用时毫秒);
  } else if (测试用时元素) {
    // 如果没有结束时间，使用累计已用时间
    const 当前测试时间 = 正在计时 ? Date.now() - 计时器开始时间 + 累计已用时间 : 累计已用时间;
    测试用时元素.innerHTML = 格式化测试用时(当前测试时间);
  }

  // 更新正确率
  const 正确率元素 = 结果区元素.querySelector("#结果区正确率");
  if (正确率元素) {
    if (当前输入索引 > 0) {
      const 正确率 = (正确字符数 / 当前输入索引) * 100;
      const 格式化结果 = 格式化百分比(正确率);
      if (格式化结果.需要显示小数点) {
        正确率元素.innerHTML = `<span class="时间数字">${格式化结果.整数部分}.${格式化结果.小数部分}</span><span class="正确率百分号">%</span>`;
      } else {
        正确率元素.innerHTML = `<span class="时间数字">${格式化结果.整数部分}</span><span class="正确率百分号">%</span>`;
      }
    } else {
      正确率元素.innerHTML = `<span class="时间数字">0</span><span class="正确率百分号">%</span>`;
    }
  }

  // 更新退格次数
  const 退格次数元素 = 结果区元素.querySelector("#结果区退格次数");
  if (退格次数元素) {
    退格次数元素.textContent = 退格次数 || 0;
  }

  // 更新速度（使用最后一个统计数据的速度，或计算最终速度）
  const 速度元素 = 结果区元素.querySelector("#结果区速度");
  if (速度元素) {
    let 最终速度 = 0;
    if (统计数据数组 && 统计数据数组.length > 0) {
      // 使用最后一个统计数据的速度
      最终速度 = Math.round(统计数据数组[统计数据数组.length - 1].速度);
    } else {
      // 计算最终速度
      const 当前测试时间 = 正在计时 ? Date.now() - 计时器开始时间 + 累计已用时间 : 累计已用时间;
      if (当前测试时间 > 0) {
        最终速度 = Math.round((已输入字符数 / 当前测试时间) * 60000);
      }
    }
    速度元素.innerHTML = `<span class="速度数字">${最终速度}</span><span class="速度斜杠">/</span><span class="速度单位">分钟</span>`;
  }
}

function 更新结果区图表() {
  更新错误分析图表();
  更新速度分析图表();
  更新历史数据图表();
}

function 更新错误分析图表() {
  if (!错误分析图表) return;

  const 错误统计 = {};

  for (const 索引 in 错误字符集合) {
    const 错误记录 = 错误字符集合[索引];
    const 原始字符 = 错误记录.原始字符;
    const 实际输入字符 = 错误记录.实际输入字符;

    if (!错误统计[原始字符]) {
      错误统计[原始字符] = {
        总次数: 0,
        实际输入分组: {},
      };
    }

    错误统计[原始字符].总次数++;

    if (!错误统计[原始字符].实际输入分组[实际输入字符]) {
      错误统计[原始字符].实际输入分组[实际输入字符] = 0;
    }
    错误统计[原始字符].实际输入分组[实际输入字符]++;
  }

  const 原始字符列表 = Object.keys(错误统计);
  if (原始字符列表.length === 0) {
    // 重置图表容器高度为默认值
    const 图表容器 = document.getElementById("错误分析图表");
    if (图表容器) {
      图表容器.style.height = "400px";
    }
    错误分析图表.setOption({
      textStyle: {
        fontFamily: '"Google Sans Code", "JetBrains Mono", Consolas, "Noto Sans SC", 微软雅黑, sans-serif',
      },
      title: {
        text: "错误字符分析",
        left: "center",
        textStyle: { color: "#fff" },
      },
      graphic: {
        type: "text",
        left: "center",
        top: "middle",
        style: {
          text: "暂无错误数据",
          fontSize: 20,
          fill: "#999",
        },
      },
    });
    // 响应式调整，确保canvas正确计算宽度
    requestAnimationFrame(() => {
      错误分析图表?.resize();
    });
    return;
  }

  // 转换为ECharts数据格式
  原始字符列表.sort();
  const 系列数据 = [];
  const 实际输入字符集合 = new Set();

  原始字符列表.forEach((原始字符) => {
    Object.keys(错误统计[原始字符].实际输入分组).forEach((实际字符) => {
      实际输入字符集合.add(实际字符);
    });
  });

  const 实际输入字符列表 = Array.from(实际输入字符集合);

  实际输入字符列表.forEach((实际字符) => {
    const 数据 = 原始字符列表.map((原始字符) => {
      return 错误统计[原始字符].实际输入分组[实际字符] || 0;
    });

    系列数据.push({
      name: `误输入为"${实际字符 === " " ? "(空格)" : 实际字符}"`,
      type: "bar",
      stack: "错误",
      data: 数据,
    });
  });

  // 根据legend数量动态调整图表容器高度
  const 图表容器 = document.getElementById("错误分析图表");
  if (图表容器) {
    // 基础高度400px，每行legend约40px高度，假设每行约8个legend项目
    const legend行数 = Math.ceil(实际输入字符列表.length / 8);
    const 基础高度 = 400;
    const 每行高度 = 40;
    const 新高度 = 基础高度 + legend行数 * 每行高度;
    图表容器.style.height = `${新高度}px`;
  }

  const 选项 = {
    textStyle: {
      fontFamily: '"Google Sans Code", "JetBrains Mono", Consolas, "Noto Sans SC", 微软雅黑, sans-serif',
    },
    graphic: [], // 清除"暂无数据"提示
    title: {
      text: `错误次数：${错误字符数}`,
      left: "center",
      top: 10,
      textStyle: {
        color: "#fff",
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        let result = `${params[0].axisValueLabel}<br/>`;
        let hasNonZero = false;

        params.forEach(function (item) {
          if (item.value > 0) {
            result += `${item.marker}${item.seriesName}: ${item.value}<br/>`;
            hasNonZero = true;
          }
        });

        return hasNonZero ? result : `${params[0].axisValueLabel}<br/>无错误输入`;
      },
    },
    legend: {
      data: 实际输入字符列表.map((字符) => `误输入为"${字符 === " " ? "(空格)" : 字符}"`),
      bottom: 10,
      textStyle: {
        color: "#fff",
      },
      // legend项目较多时会自动换行
    },
    grid: {
      left: "3%",
      right: "4%",
      // 根据legend项目数量动态计算底部空间
      // 假设每行约8个legend项目，每行约30-35px高度
      // 计算需要的行数，每行按8%空间计算，最小15%，最大不超过35%
      bottom: `${Math.min(25, Math.max(15, Math.ceil(实际输入字符列表.length / 8) * 8))}%`, // 为底部legend留出空间（减小以缩小与legend的距离）
      top: "10%", // 为顶部title留出空间（减小以增大Y轴高度）
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: 原始字符列表.map((字符) => (字符 === " " ? "(空格)" : 字符)),
      axisLabel: {
        color: "#fff",
      },
      axisLine: {
        lineStyle: {
          color: "#666",
        },
      },
    },
    yAxis: {
      type: "value",
      name: "错误次数",
      nameTextStyle: {
        color: "#fff",
      },
      axisLabel: {
        color: "#fff",
      },
      axisLine: {
        lineStyle: {
          color: "#666",
        },
      },
      splitLine: {
        lineStyle: {
          color: "#333",
        },
      },
    },
    series: 系列数据,
  };

  错误分析图表.setOption(选项);

  // 响应式调整
  requestAnimationFrame(() => {
    错误分析图表?.resize();
  });
}

function 更新速度分析图表() {
  if (!速度分析图表 || !统计数据数组 || 统计数据数组.length === 0) {
    if (速度分析图表) {
      速度分析图表.setOption({
        textStyle: {
          fontFamily: '"Google Sans Code", "JetBrains Mono", Consolas, "Noto Sans SC", 微软雅黑, sans-serif',
        },
        title: {
          text: "输入速度变化",
          left: "center",
          textStyle: { color: "#fff" },
        },
        graphic: {
          type: "text",
          left: "center",
          top: "middle",
          style: {
            text: "暂无速度数据",
            fontSize: 20,
            fill: "#999",
          },
        },
      });
      // 响应式调整，确保canvas正确计算宽度
      requestAnimationFrame(() => {
        速度分析图表?.resize();
      });
    }
    return;
  }

  // 提取时间和速度数据
  const 时间数据 = [];
  const 速度数据 = [];

  统计数据数组.forEach((统计) => {
    // 直接使用保存的毫秒数转换为秒数，保留小数精度
    const 总秒数 = (统计.测试时间毫秒 || 0) / 1000;

    时间数据.push(总秒数);
    速度数据.push(Math.round(统计.速度));
  });

  // 计算平均速度 - 使用已有的统计数据
  const 平均速度 = Math.round(统计数据数组[统计数据数组.length - 1].速度);

  const 选项 = {
    textStyle: {
      fontFamily: '"Google Sans Code", "JetBrains Mono", Consolas, "Noto Sans SC", 微软雅黑, sans-serif',
    },
    graphic: [], // 清除"暂无数据"提示
    title: {
      text: `平均速度：${平均速度} 字符 / 分钟`,
      left: "center",
      top: 10,
      textStyle: {
        color: "#fff",
      },
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        const 数据 = params[0];
        const 秒数 = 数据.value[0];
        const 速度 = 数据.value[1];
        const 分钟 = Math.floor(秒数 / 60);
        const 剩余秒 = 秒数 % 60;
        return `时间: ${分钟}分${剩余秒}秒<br/>速度: ${速度} 字符/分钟`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      name: "测试时间（秒）",
      nameTextStyle: {
        color: "#fff",
      },
      axisLabel: {
        color: "#fff",
        formatter: function (value) {
          const 分钟 = Math.floor(value / 60);
          const 秒 = value % 60;
          return `${分钟}分${秒}秒`;
        },
      },
      axisLine: {
        lineStyle: {
          color: "#666",
        },
      },
      splitLine: {
        lineStyle: {
          color: "#333",
        },
      },
    },
    yAxis: {
      type: "value",
      name: "速度（字符/分钟）",
      nameTextStyle: {
        color: "#fff",
      },
      axisLabel: {
        color: "#fff",
      },
      axisLine: {
        lineStyle: {
          color: "#666",
        },
      },
      splitLine: {
        lineStyle: {
          color: "#333",
        },
      },
    },
    series: [
      {
        name: "输入速度",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: 时间数据.map((时间, 索引) => [时间, 速度数据[索引]]),
        lineStyle: {
          color: "#4caf50",
          width: 2,
        },
        itemStyle: {
          color: "#4caf50",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(76, 175, 80, 0.3)" },
              { offset: 1, color: "rgba(76, 175, 80, 0.1)" },
            ],
          },
        },
      },
    ],
  };

  速度分析图表.setOption(选项);

  requestAnimationFrame(() => {
    速度分析图表?.resize();
  });
}

window.addEventListener("resize", () => {
  错误分析图表?.resize();
  速度分析图表?.resize();
  历史数据图表?.resize();
});

// ==================== IndexedDB 相关函数 ====================

const DB_NAME = "TenFingersDB";
const DB_VERSION = 1;
const STORE_NAME = "testRecords";

// 初始化 IndexedDB
function 初始化数据库() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IndexedDB 打开失败:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        objectStore.createIndex("姓名", "姓名", { unique: false });
        objectStore.createIndex("时间", "时间", { unique: false });
      }
    };
  });
}

// 保存测试记录到 IndexedDB
async function 保存测试记录() {
  // 检查是否真的开始了测试（有开始时间或有输入）
  if (!测试开始时间 && 已输入字符数 === 0) {
    console.log("未开始测试，不保存记录");
    return;
  }

  try {
    const db = await 初始化数据库();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // 计算最终数据
    const 实际错误字符数 = Object.keys(错误字符集合).length;
    let 最终速度 = 0;
    let 最终正确率 = 0;

    if (统计数据数组 && 统计数据数组.length > 0) {
      最终速度 = Math.round(统计数据数组[统计数据数组.length - 1].速度);
    } else {
      const 当前测试时间 = 累计已用时间;
      if (当前测试时间 > 0) {
        最终速度 = Math.round((已输入字符数 / 当前测试时间) * 60000);
      }
    }

    if (当前输入索引 > 0) {
      最终正确率 = (正确字符数 / 当前输入索引) * 100;
    }

    // 格式化测试开始时间（年、月、日、时、分、秒分开存储）
    let 测试开始时间对象 = null;
    if (测试开始时间) {
      const 开始时间 = new Date(测试开始时间);
      测试开始时间对象 = {
        年: String(开始时间.getFullYear()),
        月: String(开始时间.getMonth() + 1).padStart(2, "0"),
        日: String(开始时间.getDate()).padStart(2, "0"),
        时: String(开始时间.getHours()).padStart(2, "0"),
        分: String(开始时间.getMinutes()).padStart(2, "0"),
        秒: String(开始时间.getSeconds()).padStart(2, "0"),
        时间戳: 开始时间.getTime(), // 保留时间戳用于排序
      };
    }

    // 格式化测试结束时间（年、月、日、时、分、秒分开存储）
    let 测试结束时间对象 = null;
    if (测试结束时间) {
      const 结束时间 = new Date(测试结束时间);
      测试结束时间对象 = {
        年: String(结束时间.getFullYear()),
        月: String(结束时间.getMonth() + 1).padStart(2, "0"),
        日: String(结束时间.getDate()).padStart(2, "0"),
        时: String(结束时间.getHours()).padStart(2, "0"),
        分: String(结束时间.getMinutes()).padStart(2, "0"),
        秒: String(结束时间.getSeconds()).padStart(2, "0"),
        时间戳: 结束时间.getTime(), // 保留时间戳用于排序
      };
    }

    const 记录 = {
      姓名: 测试者姓名 || "未知",
      速度: 最终速度,
      正确率: Math.round(最终正确率 * 100) / 100, // 保留两位小数
      错误次数: 实际错误字符数,
      退格次数: 退格次数,
      时间: 测试结束时间 ? 测试结束时间.getTime() : Date.now(),
      测试开始时间: 测试开始时间对象,
      测试结束时间: 测试结束时间对象,
      测试用时: 测试结束时间 && 测试开始时间 ? 测试结束时间.getTime() - 测试开始时间.getTime() : 累计已用时间,
      字符数: 总字符数,
      已输入字符数: 已输入字符数,
    };

    await new Promise((resolve, reject) => {
      const request = store.add(记录);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log("测试记录已保存到 IndexedDB");
  } catch (error) {
    console.error("保存测试记录失败:", error);
  }
}

// 从 IndexedDB 获取所有测试记录
async function 获取所有测试记录() {
  try {
    const db = await 初始化数据库();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("获取测试记录失败:", error);
    return [];
  }
}

// 清空所有测试记录
async function 清空所有记录() {
  try {
    const db = await 初始化数据库();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => {
        console.log("所有测试记录已清空");
        resolve();
      };
      request.onerror = () => {
        console.error("清空测试记录失败:", request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("清空测试记录失败:", error);
    throw error;
  }
}

// 删除单条测试记录
async function 删除单条记录(记录ID) {
  try {
    const db = await 初始化数据库();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(记录ID);
      request.onsuccess = () => {
        console.log("测试记录已删除:", 记录ID);
        resolve();
      };
      request.onerror = () => {
        console.error("删除测试记录失败:", request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("删除测试记录失败:", error);
    throw error;
  }
}

// 更新历史数据图表
async function 更新历史数据图表() {
  if (!历史数据图表) return;

  try {
    const 所有记录 = await 获取所有测试记录();

    if (所有记录.length === 0) {
      // 清空图表并显示空状态
      历史数据图表.clear();
      历史数据图表.setOption(
        {
          textStyle: {
            fontFamily: '"Google Sans Code", "JetBrains Mono", Consolas, "Noto Sans SC", 微软雅黑, sans-serif',
          },
          title: {
            text: "历史数据对比",
            left: "center",
            textStyle: { color: "#fff" },
          },
          graphic: {
            type: "text",
            left: "center",
            top: "middle",
            style: {
              text: "暂无历史数据",
              fontSize: 20,
              fill: "#999",
            },
          },
        },
        true
      ); // 使用 notMerge: true 完全替换配置

      // 隐藏分页控件
      const 分页控件 = document.getElementById("分页控件");
      if (分页控件) 分页控件.style.display = "none";

      requestAnimationFrame(() => {
        历史数据图表?.resize();
      });
      return;
    }

    // 每条记录独立显示，按时间排序（最新的在前）
    所有记录.sort((a, b) => (b.时间 || 0) - (a.时间 || 0));

    // 为每条记录生成显示数据（Y轴只显示姓名，不显示序号）
    const 记录显示数据 = 所有记录.map((记录) => {
      const 姓名 = 记录.姓名 || "未知";

      return {
        姓名: 姓名,
        原始记录: 记录,
        速度: 记录.速度 || 0,
        正确率: 记录.正确率 || 0,
        错误次数: 记录.错误次数 || 0,
        退格次数: 记录.退格次数 || 0,
      };
    });

    // 根据当前显示的数据类型进行排序
    let 排序后的数据 = [...记录显示数据];
    if (当前显示数据类型 === "速度" || 当前显示数据类型 === "正确率") {
      // 速度、正确率降序排列
      排序后的数据.sort((a, b) => b[当前显示数据类型] - a[当前显示数据类型]);
    } else {
      // 错误次数、退格次数升序排列
      排序后的数据.sort((a, b) => a[当前显示数据类型] - b[当前显示数据类型]);
    }

    // 分页处理
    const 总记录数 = 排序后的数据.length;
    const 总页数 = Math.ceil(总记录数 / 每页记录数);

    // 确保当前页码在有效范围内
    if (当前页码 > 总页数) {
      当前页码 = Math.max(1, 总页数);
    }
    if (当前页码 < 1) {
      当前页码 = 1;
    }

    // 计算当前页的数据范围
    const 起始索引 = (当前页码 - 1) * 每页记录数;
    const 结束索引 = Math.min(起始索引 + 每页记录数, 总记录数);
    const 当前页数据 = 排序后的数据.slice(起始索引, 结束索引);

    // 准备图表数据（只显示当前页的数据）
    const 姓名列表 = 当前页数据.map((item) => item.姓名);

    // 生成随机颜色的函数
    function 生成随机颜色() {
      // 生成适中饱和度和亮度的颜色，确保在深色背景下可见但不会太亮
      const 色相 = Math.floor(Math.random() * 360); // 0-360度
      const 饱和度 = 40 + Math.floor(Math.random() * 30); // 40-70%，适中的饱和度
      const 亮度 = 25 + Math.floor(Math.random() * 30); // 45-65%，适中的亮度
      return `hsl(${色相}, ${饱和度}%, ${亮度}%)`;
    }

    // 为每个数据项生成带颜色的数据
    const 数据值 = 当前页数据.map((item) => ({
      value: item[当前显示数据类型],
      itemStyle: {
        color: 生成随机颜色(),
      },
    }));

    // 更新分页控件
    const 分页控件 = document.getElementById("分页控件");
    const 页码显示 = document.getElementById("页码显示");
    const 上一页按钮 = document.getElementById("上一页按钮");
    const 下一页按钮 = document.getElementById("下一页按钮");

    if (总记录数 > 每页记录数) {
      // 显示分页控件
      if (分页控件) 分页控件.style.display = "flex";
      if (页码显示) 页码显示.textContent = `第 ${当前页码} 页 / 共 ${总页数} 页`;
      if (上一页按钮) 上一页按钮.disabled = 当前页码 <= 1;
      if (下一页按钮) 下一页按钮.disabled = 当前页码 >= 总页数;

      // 更新下一页按钮的点击事件
      if (下一页按钮) {
        下一页按钮.onclick = () => {
          if (当前页码 < 总页数) {
            当前页码++;
            更新历史数据图表();
          }
        };
      }
    } else {
      // 隐藏分页控件
      if (分页控件) 分页控件.style.display = "none";
    }

    // 确定 X 轴标签和单位
    let xAxisName = "";
    let 数据单位 = "";
    let 显示单位 = true; // 是否在X轴标签上显示单位
    if (当前显示数据类型 === "速度") {
      xAxisName = "速度（字符/分钟）";
      数据单位 = " 字符/分钟";
      显示单位 = false; // 速度只显示数字
    } else if (当前显示数据类型 === "正确率") {
      xAxisName = "正确率（%）";
      数据单位 = "%";
    } else if (当前显示数据类型 === "错误次数") {
      xAxisName = "错误次数";
      数据单位 = " 次";
    } else if (当前显示数据类型 === "退格次数") {
      xAxisName = "退格次数";
      数据单位 = " 次";
    }

    const 选项 = {
      textStyle: {
        fontFamily: '"Google Sans Code", "JetBrains Mono", Consolas, "Noto Sans SC", 微软雅黑, sans-serif',
      },
      graphic: [], // 清除"暂无数据"提示
      title: {
        text: `历史数据对比 - ${当前显示数据类型}`,
        left: "center",
        top: 10,
        textStyle: {
          color: "#fff",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "rgba(40, 40, 40, 0.95)",
        borderColor: "lightsteelblue",
        boxShadow: "0 0 5px 2px rgba(0, 0, 0, 0.75)",
        borderWidth: 1,
        textStyle: {
          color: "#fff",
        },
        formatter: function (params) {
          const 数据项 = params[0];
          const 姓名 = 数据项.name;
          // 处理新的数据格式（可能是对象，包含value和itemStyle）
          const 值 = typeof 数据项.value === "object" ? 数据项.value.value : 数据项.value;
          
          // 使用数据项在series中的索引来查找对应的记录（最准确的方法）
          // ECharts的bar chart中，params[0].dataIndex 对应Y轴数据的索引
          const 数据索引 = 数据项.dataIndex;
          let 数据项对象 = null;
          
          if (数据索引 >= 0 && 数据索引 < 当前页数据.length) {
            数据项对象 = 当前页数据[数据索引];
          } else {
            // 如果索引查找失败，使用find方法作为备选
            数据项对象 = 当前页数据.find((item) => item.姓名 === 姓名);
            console.warn(`使用find方法查找数据项: ${姓名}, 索引: ${数据索引}`, { 当前页数据长度: 当前页数据.length });
          }

          if (!数据项对象) {
            console.warn(`未找到数据项: ${姓名}`, { 数据索引, 姓名列表, 当前页数据 });
            return `${姓名}<br/>${当前显示数据类型}: ${值}${数据单位}`;
          }

          const 记录 = 数据项对象.原始记录;
          
          // 调试：检查记录数据
          if (!记录) {
            console.warn(`数据项 ${姓名} 没有原始记录`, 数据项对象);
          }
          let 提示文本 = `${姓名}<br/>${当前显示数据类型}: ${值}${数据单位}`;

          // 添加起始时间和结束时间
          if (记录 && 记录.测试开始时间 && 记录.测试结束时间) {
            // 如果时间是以对象形式存储的（年、月、日、时、分、秒分开）
            if (typeof 记录.测试开始时间 === 'object' && 记录.测试开始时间 !== null && 记录.测试开始时间.年) {
              const 开始时间对象 = 记录.测试开始时间;
              const 结束时间对象 = 记录.测试结束时间;
              
              // 调试：检查时间对象
              console.log(`记录 ${姓名} 的时间:`, {
                开始: 开始时间对象,
                结束: 结束时间对象
              });
              
              const 格式化开始时间 = `<span class="时间数字">${开始时间对象.年}</span><span class="时间单位">年</span><span class="时间数字">${开始时间对象.月}</span><span class="时间单位">月</span><span class="时间数字">${开始时间对象.日}</span><span class="时间单位">日</span> <span class="时间数字">${开始时间对象.时}</span><span class="时间冒号">:</span><span class="时间数字">${开始时间对象.分}</span><span class="时间冒号">:</span><span class="时间数字">${开始时间对象.秒}</span>`;
              const 格式化结束时间 = `<span class="时间数字">${结束时间对象.年}</span><span class="时间单位">年</span><span class="时间数字">${结束时间对象.月}</span><span class="时间单位">月</span><span class="时间数字">${结束时间对象.日}</span><span class="时间单位">日</span> <span class="时间数字">${结束时间对象.时}</span><span class="时间冒号">:</span><span class="时间数字">${结束时间对象.分}</span><span class="时间冒号">:</span><span class="时间数字">${结束时间对象.秒}</span>`;
              
              提示文本 += `<br/>起始时间: ${格式化开始时间}`;
              提示文本 += `<br/>结束时间: ${格式化结束时间}`;
            } else {
              // 兼容旧格式（时间戳）
              const 开始时间戳 = typeof 记录.测试开始时间 === 'number' ? 记录.测试开始时间 : (记录.测试开始时间?.时间戳 || 记录.测试开始时间);
              const 结束时间戳 = typeof 记录.测试结束时间 === 'number' ? 记录.测试结束时间 : (记录.测试结束时间?.时间戳 || 记录.测试结束时间);
              
              if (开始时间戳 && 结束时间戳) {
                const 开始时间 = new Date(开始时间戳);
                const 结束时间 = new Date(结束时间戳);
                const 格式化开始时间 = 格式化日期时间(开始时间);
                const 格式化结束时间 = 格式化日期时间(结束时间);
                提示文本 += `<br/>起始时间: ${格式化开始时间}`;
                提示文本 += `<br/>结束时间: ${格式化结束时间}`;
              }
            }
          } else {
            // 调试：检查为什么没有时间数据
            console.warn(`记录 ${姓名} 缺少时间数据:`, {
              记录: 记录,
              测试开始时间: 记录?.测试开始时间,
              测试结束时间: 记录?.测试结束时间
            });
          }

          return 提示文本;
        },
      },
      grid: {
        left: "15%",
        right: "10%",
        bottom: "10%",
        top: "15%",
        containLabel: false,
      },
      xAxis: {
        type: "value",
        name: xAxisName,
        nameGap: 45,
        nameTextStyle: {
          color: "#999",
        },
        axisLabel: {
          color: "#fff",
          formatter: function (value) {
            return 显示单位 ? value + 数据单位 : value;
          },
        },
        axisLine: {
          lineStyle: {
            color: "#666",
          },
        },
        splitLine: {
          lineStyle: {
            color: "#333",
          },
        },
      },
      yAxis: {
        type: "category",
        data: 姓名列表,
        axisLabel: {
          color: "lightblue",
          fontSize: 14,
        },
        axisLine: {
          lineStyle: {
            color: "#666",
          },
        },
      },
      series: [
        {
          name: 当前显示数据类型,
          type: "bar",
          data: 数据值,
          label: {
            show: true,
            position: "right",
            color: "#fff",
            formatter: function (params) {
              const 值 = typeof params.value === "object" ? params.value.value : params.value;
              return 显示单位 ? 值 + 数据单位 : 值;
            },
          },
        },
      ],
    };

    历史数据图表.setOption(选项);

    // 绑定右键菜单事件
    绑定图表右键菜单(当前页数据);

    requestAnimationFrame(() => {
      历史数据图表?.resize();
    });
  } catch (error) {
    console.error("更新历史数据图表失败:", error);
  }
}

// 存储当前页数据，供右键菜单使用
let 当前右键菜单数据 = null;

// 绑定图表右键菜单
function 绑定图表右键菜单(当前页数据) {
  if (!历史数据图表) return;

  // 保存当前页数据供右键菜单使用
  当前右键菜单数据 = 当前页数据;

  const 图表容器 = 历史数据图表.getDom();
  if (!图表容器) return;

  // 移除旧的事件监听器
  图表容器.removeEventListener('contextmenu', 处理图表右键点击);

  // 添加右键点击事件监听
  图表容器.addEventListener('contextmenu', 处理图表右键点击);
}

// 处理图表右键点击事件
function 处理图表右键点击(event) {
  event.preventDefault();

  if (!当前右键菜单数据 || !历史数据图表) return;

  // 获取点击位置相对于图表容器的坐标
  const 图表容器 = 历史数据图表.getDom();
  const 容器矩形 = 图表容器.getBoundingClientRect();
  const 点击X = event.clientX - 容器矩形.left;
  const 点击Y = event.clientY - 容器矩形.top;

  // 对于横向柱状图，使用convertFromPixel获取Y轴索引
  // 横向柱状图的坐标系统：[x值, y索引]
  try {
    const 图表坐标 = 历史数据图表.convertFromPixel('grid', [点击X, 点击Y]);
    
    if (图表坐标 && 图表坐标.length >= 2) {
      // 对于横向柱状图，图表坐标是 [x值, y索引]
      // 注意：横向柱状图的Y轴是category类型，索引对应数据数组的索引
      const [值, 索引] = 图表坐标;
      
      // 检查是否点击在柱子上（索引应该是有效的）
      // 由于是横向柱状图，索引应该对应Y轴的category索引
      if (索引 !== null && 索引 !== undefined && 索引 >= 0 && 索引 < 当前右键菜单数据.length) {
        const 数据项 = 当前右键菜单数据[索引];
        const 记录 = 数据项?.原始记录;
        
        if (记录 && 记录.id) {
          显示右键菜单(event.clientX, event.clientY, 记录);
          return;
        }
      }
    }
  } catch (error) {
    console.warn("转换图表坐标失败:", error);
  }
}

// 显示右键菜单
function 显示右键菜单(x, y, 记录) {
  // 移除旧的菜单
  const 旧菜单 = document.getElementById('历史数据右键菜单');
  if (旧菜单) {
    旧菜单.remove();
  }

  // 创建菜单
  const 菜单 = document.createElement('div');
  菜单.id = '历史数据右键菜单';
  菜单.className = '历史数据右键菜单';
  菜单.style.left = `${x}px`;
  菜单.style.top = `${y}px`;

  // 创建删除选项
  const 删除选项 = document.createElement('div');
  删除选项.className = '右键菜单项';
  删除选项.textContent = '删除该条记录';
  删除选项.addEventListener('click', async () => {
    try {
      await 删除单条记录(记录.id);
      await 更新历史数据图表();
      隐藏右键菜单();
    } catch (error) {
      console.error("删除记录失败:", error);
      alert("删除记录失败，请重试");
    }
  });

  菜单.appendChild(删除选项);
  document.body.appendChild(菜单);

  // 点击其他地方时隐藏菜单
  const 隐藏菜单 = (e) => {
    if (!菜单.contains(e.target)) {
      隐藏右键菜单();
      document.removeEventListener('click', 隐藏菜单);
    }
  };
  
  // 延迟添加事件监听，避免立即触发
  setTimeout(() => {
    document.addEventListener('click', 隐藏菜单);
  }, 0);
}

// 隐藏右键菜单
function 隐藏右键菜单() {
  const 菜单 = document.getElementById('历史数据右键菜单');
  if (菜单) {
    菜单.remove();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", 初始化定时器设置);
  document.addEventListener("DOMContentLoaded", 初始化定时复选框);
  document.addEventListener("DOMContentLoaded", 初始化随机复选框);
  document.addEventListener("DOMContentLoaded", 初始化姓名输入框);
  document.addEventListener("DOMContentLoaded", 初始化开始按钮);
  document.addEventListener("DOMContentLoaded", 初始化终止和详情按钮);
} else {
  初始化定时器设置();
  初始化定时复选框();
  初始化随机复选框();
  初始化姓名输入框();
  初始化开始按钮();
  初始化终止和详情按钮();
}
