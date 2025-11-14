const 选择文章按钮 = document.querySelector("#选择文章");
const 文件夹列表区 = document.querySelector(".文件夹列表区");
const 文章列表区 = document.querySelector(".文章列表区");
const 分钟输入框 = document.querySelector("#分钟");
const 秒输入框 = document.querySelector("#秒");
const 姓名输入框 = document.querySelector("#姓名");
let 当前文件夹 = "General";
let 当前文章 = "";
let 测试者姓名 = "测试者";
let 错误字符集合 = {};
let 退格次数 = 0;
let 当前输入索引 = 0;
let 正在合成 = false;
let 输入容器 = null;
let 隐藏输入框 = null;
let 测试结束覆盖层 = null;
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

const STORAGE_KEYS = {
  定时器分: "TenFingers_定时器_分",
  定时器秒: "TenFingers_定时器_秒",
  已设置定时: "TenFingers_已设置定时",
  姓名: "TenFingers_姓名",
};

function 从本地存储读取(键名, 默认值) {
  const 存储值 = localStorage.getItem(键名);
  if (存储值 !== null) {
    if (typeof 默认值 === "boolean") {
      return 存储值 === "true";
    }
    if (typeof 默认值 === "number") {
      return parseFloat(存储值) || 默认值;
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
  分: 从本地存储读取(STORAGE_KEYS.定时器分, 0),
  秒: 从本地存储读取(STORAGE_KEYS.定时器秒, 0),
};
let 已设置定时 = 从本地存储读取(STORAGE_KEYS.已设置定时, false);

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
  const 文章列表区 = document.querySelector(".文章列表区");
  const 文章列表关闭按钮 = document.createElement("button");
  文章列表关闭按钮.className = "关闭按钮 文章列表关闭按钮";
  文章列表关闭按钮.textContent = "✖";
  文章列表区.appendChild(文章列表关闭按钮);
  文章列表关闭按钮.addEventListener("click", (event) => {
    event.stopPropagation();
    关闭文章列表();

    if (隐藏输入框 && document.activeElement === 隐藏输入框) {
      隐藏输入框.blur();
      暂停计时();
    }
  });

  const 文件夹列表 = document.createElement("ul");
  文件夹列表.className = "文件夹列表";
  文件夹列表区.appendChild(文件夹列表);

  for (const [文件夹名, 文件列表] of Object.entries(文件夹结构)) {
    if (!文件列表 || 文件列表.length === 0) {
      continue;
    }

    let fileIndex = 0;

    const 文件夹项 = document.createElement("li");
    文件夹项.className = "文件夹项";
    文件夹项.dataset.文件夹名 = 文件夹名;
    文件夹项.title = 文件夹名 === "General" ? "计算机" : 文件夹名;
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

    for (const 文件名 of 文件列表) {
      const 文件路径 = `./Texts/${文件夹名}/${文件名}`;
      const 文章容器 = document.createElement("li");
      文章容器.className = "文章容器";

      文章容器.dataset.文件路径 = 文件路径;

      const 文章序号 = document.createElement("span");
      文章序号.className = "文章序号";
      文章序号.textContent = 文件名.split("_")[0];

      const 文章标题 = document.createElement("h3");
      文章标题.className = "文章标题";
      文章标题.textContent = 文件名.split("_")[1].split(".")[0];

      文章容器.append(文章序号, 文章标题);
      文章列表.appendChild(文章容器);

      文章容器.addEventListener("click", async () => {
        const 已激活文章容器 = 文章列表区.querySelector(".文章容器.激活");
        if (已激活文章容器) {
          已激活文章容器.classList.remove("激活");
        }
        文章容器.classList.toggle("激活");
        当前文章 = `${文章序号.textContent.trim()}_${文章标题.textContent.trim()}`;

        if (文章容器.classList.contains("激活")) {
          const 文件路径 = 文章容器.dataset.文件路径;
          const 文章内容 = await fetch(文件路径).then((response) => response.text());
          await 初始化输入容器(文章内容);
        }
      });

      fileIndex++;
    }

    const firstArticleContainer = 文章列表.querySelector(".文章容器:first-child");
    const lastArticleContainer = 文章列表.querySelector(".文章容器:last-child");
    const 内边距 = 50;
    文章列表.style.width = `${
      lastArticleContainer.offsetLeft + lastArticleContainer.offsetWidth + 内边距 * 2 - firstArticleContainer.offsetLeft
    }px`;
  }

  阻止文章列表点击冒泡();
}

初始化文章列表();

选择文章按钮.addEventListener("click", (event) => {
  event.stopPropagation();
  if (文章列表区.classList.toggle("显示")) {
    更新文章列表(当前文件夹);
    暂停倒计时();
  } else {
    if (测试结束状态 === false && 已输入字符数 > 0) {
      恢复倒计时();
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
    if (隐藏输入框 && document.activeElement !== 隐藏输入框) {
      隐藏输入框.focus();
    }
    return;
  }

  if (!点击选择文章按钮) {
    关闭文章列表();

    if (!点击关闭按钮 && 隐藏输入框 && document.activeElement !== 隐藏输入框) {
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
  文章列表区.style.width = 新文章列表.style.width;
}

function 关闭文章列表() {
  文章列表区.classList.remove("显示");
  文件夹列表区.classList.remove("显示");
  const 当前文章列表 = document.querySelector(`ul[data-文件夹名="${当前文件夹}"]`);
  if (当前文章列表) {
    当前文章列表.classList.remove("显示");
  }
}

function 更新关闭文章列表按钮位置() {
  const 关闭文章列表按钮 = document.querySelector(".文章列表关闭按钮");
  if (关闭文章列表按钮) {
    关闭文章列表按钮.style.top = `${文章列表区.offsetTop}px`;
  }
}

function 初始化定时器设置() {
  const 分钟值 = 从本地存储读取(STORAGE_KEYS.定时器分, 0);
  const 秒值 = 从本地存储读取(STORAGE_KEYS.定时器秒, 30);

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

    if (是否强制验证 && 分钟值 === 0 && 秒值 < 10) {
      秒值 = 10;
    }

    分钟输入框.value = 分钟值;
    秒输入框.value = 秒值;

    定时器.分 = 分钟值;
    定时器.秒 = 秒值;

    保存到本地存储(STORAGE_KEYS.定时器分, 定时器.分);
    保存到本地存储(STORAGE_KEYS.定时器秒, 定时器.秒);
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
    已设置定时 = 从本地存储读取(STORAGE_KEYS.已设置定时, false);
    定时复选框.checked = 已设置定时;

    定时复选框.addEventListener("change", (event) => {
      已设置定时 = event.target.checked;
      保存到本地存储(STORAGE_KEYS.已设置定时, 已设置定时);
    });
  }
}

function 初始化姓名输入框() {
  if (姓名输入框) {
    const 存储的姓名 = 从会话存储读取(STORAGE_KEYS.姓名, "测试者");
    测试者姓名 = 存储的姓名;
    姓名输入框.value = 测试者姓名;

    姓名输入框.addEventListener("input", (event) => {
      const 输入的姓名 = event.target.value;
      测试者姓名 = 输入的姓名;
      保存到会话存储(STORAGE_KEYS.姓名, 输入的姓名);
    });
  }
}

function 在英文中文间添加空格(文本) {
  return 文本.replace(/([\u4e00-\u9fa5])([a-zA-Z])/g, "$1 $2").replace(/([a-zA-Z])([\u4e00-\u9fa5])/g, "$1 $2");
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

  if (隐藏输入框) {
    隐藏输入框.blur();
    隐藏输入框.disabled = true;
  }

  if (测试结束覆盖层 && 输入容器) {
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
  const 字符数显示 = document.querySelector("#字符数显示");
  if (字符数显示) {
    const 已输入字符数元素 = 字符数显示.querySelector(".已输入字符数");
    const 总字符数元素 = 字符数显示.querySelector(".总字符数");
    if (已输入字符数元素) 已输入字符数元素.textContent = 已输入字符数;
    if (总字符数元素) 总字符数元素.textContent = 总字符数;
  }

  const 错误数据显示 = document.querySelector("#错误数据显示");
  if (错误数据显示) {
    const 实际错误字符数 = Object.keys(错误字符集合).length;

    const 错误字符数元素 = 错误数据显示.querySelector(".错误字符数");
    const 退格次数元素 = 错误数据显示.querySelector(".退格次数");
    const 正确率数字元素 = 错误数据显示.querySelector(".正确率数字");

    if (错误字符数元素) 错误字符数元素.textContent = 实际错误字符数;
    if (退格次数元素) 退格次数元素.textContent = 退格次数;

    if (总字符数 > 0 && 正确率数字元素) {
      const 正确率 = (正确字符数 / 总字符数) * 100;
      const 格式化结果 = 格式化百分比(正确率);

      正确率数字元素.textContent = 格式化结果.整数部分;

      const 小数点元素 = 错误数据显示.querySelector(".小数点");
      const 正确率小数元素 = 错误数据显示.querySelector(".正确率小数");

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
      const 小数点元素 = 错误数据显示?.querySelector(".小数点");
      const 正确率小数元素 = 错误数据显示?.querySelector(".正确率小数");
      if (小数点元素) 小数点元素.style.display = "none";
      if (正确率小数元素) 正确率小数元素.style.display = "none";
    }
  }

  const 进度圆环 = document.querySelector("#进度圆环");
  const 进度百分比 = document.querySelector("#进度百分比");
  if (进度圆环 && 进度百分比 && 总字符数 > 0) {
    const 进度 = (已输入字符数 / 总字符数) * 100;
    const 进度角度 = (进度 / 100) * 360;
    进度圆环.style.setProperty("--进度角度", `${进度角度}deg`);

    const 格式化结果 = 格式化百分比(进度);
    const 进度数字元素 = 进度百分比.querySelector(".进度数字");
    const 进度百分号元素 = 进度百分比.querySelector(".进度百分号");

    if (进度数字元素) {
      let 进度文本 = 格式化结果.整数部分;
      if (格式化结果.需要显示小数点 && 格式化结果.小数部分 !== null) {
        进度文本 += "." + 格式化结果.小数部分;
      }
      进度数字元素.textContent = 进度文本;
    }
    if (进度百分号元素) {
      进度百分号元素.textContent = "%";
    }
  } else if (进度百分比) {
    const 进度数字元素 = 进度百分比.querySelector(".进度数字");
    const 进度百分号元素 = 进度百分比.querySelector(".进度百分号");
    if (进度数字元素) 进度数字元素.textContent = "0";
    if (进度百分号元素) 进度百分号元素.textContent = "%";
    if (进度圆环) 进度圆环.style.setProperty("--进度角度", "0deg");
  }
}

async function 初始化输入容器(文章内容) {
  文章内容 = 在英文中文间添加空格(文章内容);
  const 输入区 = document.querySelector(".输入区");
  if (!输入区) return;

  输入区.innerHTML = "";

  当前输入索引 = 0;
  错误字符集合 = {};
  退格次数 = 0;
  正在合成 = false;
  测试结束状态 = false;

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

  const 定时复选框 = document.querySelector("#定时复选框");
  if (定时复选框 && 定时复选框.checked) {
    const 初始分钟值 = 从本地存储读取(STORAGE_KEYS.定时器分, 0);
    const 初始秒值 = 从本地存储读取(STORAGE_KEYS.定时器秒, 30);
    if (分钟输入框) 分钟输入框.value = 初始分钟值;
    if (秒输入框) 秒输入框.value = 初始秒值;
  }

  if (测试结束覆盖层) {
    测试结束覆盖层.style.display = "none";
  }

  更新统计信息();
  更新计时器显示();
  更新速度显示();

  输入容器 = document.createElement("div");
  输入容器.className = "输入容器";
  输入容器.setAttribute("tabindex", "0");

  const 字符数组 = [...文章内容];

  字符数组.forEach((字符, 索引) => {
    const 字符元素 = document.createElement("span");
    字符元素.className = "原始字符";
    字符元素.textContent = 字符;
    字符元素.dataset.charIndex = 索引;

    if (字符 === "\n") {
      字符元素.classList.add("换行符");
    } else if (字符 === " ") {
      字符元素.classList.add("空格");
    }

    输入容器.appendChild(字符元素);
  });

  输入区.appendChild(输入容器);

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
  隐藏输入框.disabled = false;
  输入区.appendChild(隐藏输入框);

  更新当前字符高亮();

  if (隐藏输入框) {
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

  隐藏输入框.addEventListener("compositionstart", () => {
    正在合成 = true;
    更新隐藏输入框位置();
  });
  隐藏输入框.addEventListener("compositionupdate", () => {});
  隐藏输入框.addEventListener("compositionend", (event) => {
    正在合成 = false;

    const 输入的字符 = 隐藏输入框.value;
    if (输入的字符) {
      处理输入字符(输入的字符);
      隐藏输入框.value = "";
    }
  });
  隐藏输入框.addEventListener("input", (event) => {
    if (!正在合成) {
      const 输入的字符 = 隐藏输入框.value;
      if (输入的字符) {
        处理输入字符(输入的字符);
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

  const 所有字符元素 = 输入容器.querySelectorAll(".原始字符");
  if (当前输入索引 >= 所有字符元素.length) return;

  const 当前字符元素 = 所有字符元素[当前输入索引];
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

  const 所有字符元素 = 输入容器.querySelectorAll(".原始字符");
  if (当前输入索引 >= 所有字符元素.length) return;

  const 当前字符元素 = 所有字符元素[当前输入索引];
  if (!当前字符元素) return;

  const 容器高度 = 输入容器.clientHeight;
  const 容器滚动顶部 = 输入容器.scrollTop;
  const 容器滚动底部 = 容器滚动顶部 + 容器高度;

  const 容器矩形 = 输入容器.getBoundingClientRect();
  const 字符矩形 = 当前字符元素.getBoundingClientRect();

  const 字符相对顶部 = 字符矩形.top - 容器矩形.top + 容器滚动顶部;
  const 字符相对底部 = 字符矩形.bottom - 容器矩形.top + 容器滚动顶部;

  const 边距 = 80;
  const 可见区域顶部 = 容器滚动顶部 + 边距;
  const 可见区域底部 = 容器滚动底部 - 边距;

  if (字符相对顶部 < 可见区域顶部) {
    const 目标滚动位置 = 字符相对顶部 - 容器高度 * 0.3;
    输入容器.scrollTo({
      top: Math.max(0, 目标滚动位置),
      behavior: "smooth",
    });
  } else if (字符相对底部 > 可见区域底部) {
    const 目标滚动位置 = 字符相对顶部 - 容器高度 * 0.3;
    输入容器.scrollTo({
      top: Math.max(0, 目标滚动位置),
      behavior: "smooth",
    });
  }
}

function 更新当前字符高亮() {
  const 所有字符元素 = 输入容器.querySelectorAll(".原始字符");

  所有字符元素.forEach((元素) => {
    元素.classList.remove("当前");
  });

  if (当前输入索引 < 所有字符元素.length) {
    const 当前字符元素 = 所有字符元素[当前输入索引];
    if (当前字符元素) {
      当前字符元素.classList.add("当前");
      更新隐藏输入框位置();

      滚动到当前字符();
    }
  }
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

      const 所有字符元素 = 输入容器.querySelectorAll(".原始字符");
      const 当前字符元素 = 所有字符元素[当前输入索引];
      if (当前字符元素) {
        if (当前字符元素.classList.contains("正确")) {
          正确字符数--;
        } else if (当前字符元素.classList.contains("错误")) {
          错误字符数--;
        }

        当前字符元素.classList.remove("正确", "错误");
        if (错误字符集合[当前输入索引]) {
          delete 错误字符集合[当前输入索引];
        }
      }

      已输入字符数--;

      更新统计信息();

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

  const 所有字符元素 = 输入容器.querySelectorAll(".原始字符");

  for (let i = 0; i < 输入的字符.length; i++) {
    if (当前输入索引 >= 所有字符元素.length) {
      break;
    }

    const 当前字符元素 = 所有字符元素[当前输入索引];
    const 应该输入的字符 = 当前字符元素.textContent;
    const 实际输入的字符 = 输入的字符[i];

    当前字符元素.classList.remove("当前");

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

  if (当前输入索引 >= 所有字符元素.length) {
    进入测试结束状态("所有字符输入完成");
  }

  更新统计信息();

  更新当前字符高亮();
}

function 初始化开始按钮() {
  const 开始按钮 = document.querySelector("#开始");
  if (开始按钮) {
    开始按钮.addEventListener("click", async () => {
      const 激活的文章容器 = 文章列表区.querySelector(".文章容器.激活");
      if (激活的文章容器) {
        const 文件路径 = 激活的文章容器.dataset.文件路径;
        const 文章内容 = await fetch(文件路径).then((response) => response.text());
        await 初始化输入容器(文章内容);
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", 初始化定时器设置);
  document.addEventListener("DOMContentLoaded", 初始化定时复选框);
  document.addEventListener("DOMContentLoaded", 初始化姓名输入框);
  document.addEventListener("DOMContentLoaded", 初始化开始按钮);
} else {
  初始化定时器设置();
  初始化定时复选框();
  初始化姓名输入框();
  初始化开始按钮();
}
