const 选择文章按钮 = document.querySelector("#选择文章");
const 文件夹列表区 = document.querySelector(".文件夹列表区");
const 文章列表区 = document.querySelector(".文章列表区");
const 分钟滑块 = document.querySelector("#分钟");
const 秒滑块 = document.querySelector("#秒");
let 当前文件夹 = "General";

const STORAGE_KEYS = {
  定时器分: "TenFingers_定时器_分",
  定时器秒: "TenFingers_定时器_秒",
  分钟滑块值: "TenFingers_分钟滑块值",
  秒滑块值: "TenFingers_秒滑块值",
  已设置定时: "TenFingers_已设置定时",
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
  文章列表关闭按钮.addEventListener("click", 关闭文章列表);

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
      const 文章内容 = await fetch(文件路径).then((response) => response.text());
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

      文章容器.addEventListener("click", () => {
        const 已激活文章容器 = 文章列表区.querySelector(".文章容器.激活");
        if (已激活文章容器) {
          已激活文章容器.classList.remove("激活");
        }
        文章容器.classList.toggle("激活");
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
  event.stopPropagation(); // 阻止事件冒泡，避免触发外部点击关闭
  if (文章列表区.classList.toggle("显示")) {
    更新文章列表(当前文件夹);
  }
  文件夹列表区.classList.toggle("显示");
});

document.addEventListener("click", (event) => {
  if (!文章列表区.classList.contains("显示")) {
    return;
  }

  const 点击文章列表 = 文章列表区.contains(event.target);
  const 点击文件夹列表 = 文件夹列表区.contains(event.target);
  const 点击选择文章按钮 = 选择文章按钮.contains(event.target);

  if (!点击文章列表 && !点击文件夹列表 && !点击选择文章按钮) {
    关闭文章列表();
  }
});

function 阻止文章列表点击冒泡() {
  for (const 文章列表 of 文章列表区.querySelectorAll(".文章列表")) {
    文章列表.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }
  // 阻止文件夹列表区的点击事件冒泡
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

function 更新滑块填充(滑块元素) {
  const 最小值 = parseFloat(滑块元素.min) || 0;
  const 最大值 = parseFloat(滑块元素.max) || 100;
  const 当前值 = parseFloat(滑块元素.value);
  const 填充百分比 = ((当前值 - 最小值) / (最大值 - 最小值)) * 100;

  滑块元素.style.setProperty("--fill", `${填充百分比}%`);
}

function 初始化定时器设置() {
  const 分钟显示 = document.querySelector("#分钟显示");
  const 秒显示 = document.querySelector("#秒显示");

  const 分钟滑块值 = 从本地存储读取(STORAGE_KEYS.分钟滑块值, 0);
  const 秒滑块值 = 从本地存储读取(STORAGE_KEYS.秒滑块值, 30);

  分钟滑块.value = 分钟滑块值;
  秒滑块.value = 秒滑块值;

  定时器.分 = parseInt(分钟滑块值, 10);
  定时器.秒 = parseInt(秒滑块值, 10);

  function 更新定时时长() {
    分钟显示.textContent = 分钟滑块.value;
    秒显示.textContent = 秒滑块.value;
    定时器.分 = parseInt(分钟滑块.value, 10);
    定时器.秒 = parseInt(秒滑块.value, 10);
    更新滑块填充(分钟滑块);
    更新滑块填充(秒滑块);

    保存到本地存储(STORAGE_KEYS.定时器分, 定时器.分);
    保存到本地存储(STORAGE_KEYS.定时器秒, 定时器.秒);
    保存到本地存储(STORAGE_KEYS.分钟滑块值, 分钟滑块.value);
    保存到本地存储(STORAGE_KEYS.秒滑块值, 秒滑块.value);
  }

  分钟滑块.addEventListener("input", () => {
    更新定时时长();
    const 分钟值 = parseInt(分钟滑块.value);
    const 秒值 = parseInt(秒滑块.value);

    if (分钟值 === 0 && 秒值 < 10) {
      秒滑块.value = 10;
      更新定时时长();
    }
  });

  秒滑块.addEventListener("input", () => {
    const 分钟值 = parseInt(分钟滑块.value);
    const 秒值 = parseInt(秒滑块.value);

    if (分钟值 === 0 && 秒值 < 10) {
      秒滑块.value = 10;
    }
    更新定时时长();
  });

  更新定时时长();
}

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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", 初始化定时器设置);
  document.addEventListener("DOMContentLoaded", 初始化定时复选框);
} else {
  初始化定时器设置();
  初始化定时复选框();
}
