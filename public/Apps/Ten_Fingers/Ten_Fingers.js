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

const Storage_Keys = {
  定时器分: "TenFingers_定时器_分",
  定时器秒: "TenFingers_定时器_秒",
  已设置定时: "TenFingers_已设置定时",
  姓名: "TenFingers_姓名",
  当前文件夹: "TenFingers_当前文件夹",
};

let 当前文件夹 = 从本地存储读取(Storage_Keys.当前文件夹, "Computer");

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
            .then((内容) => 内容.trim().replace(/\n/g, " "));
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

function 初始化姓名输入框() {
  if (姓名输入框) {
    const 存储的姓名 = 从会话存储读取(Storage_Keys.姓名, "测试者");
    测试者姓名 = 存储的姓名;
    姓名输入框.value = 测试者姓名;

    姓名输入框.addEventListener("input", (event) => {
      const 输入的姓名 = event.target.value;
      测试者姓名 = 输入的姓名;
      保存到会话存储(Storage_Keys.姓名, 输入的姓名);
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
    查看详情按钮.addEventListener("click", () => {
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

    if (当前输入索引 > 0 && 正确率数字元素) {
      const 正确率 = (正确字符数 / 当前输入索引) * 100;
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
  测试开始时间 = null;
  测试结束时间 = null;

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

  const 容器上内边距 = 20;

  if (字符相对顶部 < 可见区域顶部) {
    const 目标滚动位置 = 字符相对顶部 - 容器上内边距;
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
        const 文章内容 = await fetch(文件路径)
          .then((response) => response.text())
          .then((内容) => 内容.trim().replace(/\n/g, " "));
        await 初始化输入容器(文章内容);
      }
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
      // 如果测试已结束且有结果区内容，则显示结果区
      if (测试结束状态 && 结果区元素) {
        显示结果区();
      }
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
    更新结果区头部信息();
    更新结果区图表();
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
    <div class="结果区头部">
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
      <div class="结果区部分">
        <h3 class="结果区部分标题">错误数据分析</h3>
        <div id="错误分析图表" style="width: 100%; height: 400px;"></div>
      </div>
      <div class="结果区部分">
        <h3 class="结果区部分标题">输入速度分析</h3>
        <div id="速度分析图表" style="width: 100%; height: 400px;"></div>
      </div>
    </div>
  `;

  // 绑定关闭按钮
  const 关闭按钮 = 结果区.querySelector("#关闭结果区");
  if (关闭按钮) {
    关闭按钮.addEventListener("click", 隐藏结果区);
  }

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
      formatter: function(params) {
        let result = `${params[0].axisValueLabel}<br/>`;
        let hasNonZero = false;

        params.forEach(function(item) {
          if (item.value > 0) {
            result += `${item.marker}${item.seriesName}: ${item.value}<br/>`;
            hasNonZero = true;
          }
        });

        return hasNonZero ? result : `${params[0].axisValueLabel}<br/>无错误输入`;
      }
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
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", 初始化定时器设置);
  document.addEventListener("DOMContentLoaded", 初始化定时复选框);
  document.addEventListener("DOMContentLoaded", 初始化姓名输入框);
  document.addEventListener("DOMContentLoaded", 初始化开始按钮);
  document.addEventListener("DOMContentLoaded", 初始化终止和详情按钮);
} else {
  初始化定时器设置();
  初始化定时复选框();
  初始化姓名输入框();
  初始化开始按钮();
  初始化终止和详情按钮();
}
