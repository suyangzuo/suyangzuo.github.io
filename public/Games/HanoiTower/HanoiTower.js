const 操作分区组 = Array.from(document.querySelectorAll(".操作分区"));
const 左分区 = document.querySelector(".左分区");
const 中分区 = document.querySelector(".中分区");
const 右分区 = document.querySelector(".右分区");
const 左积木区 = 左分区.querySelector(".积木区");
const 中积木区 = 中分区.querySelector(".积木区");
const 右积木区 = 右分区.querySelector(".积木区");

const 数据结构区 = document.querySelector(".数据结构区");
const 左数据区 = 数据结构区.querySelector(".左数据区");
const 中数据区 = 数据结构区.querySelector(".中数据区");
const 右数据区 = 数据结构区.querySelector(".右数据区");
const 记录数据区 = 数据结构区.querySelector(".记录数据区");
const 左记录区 = 左数据区.querySelector(".记录区");
const 中记录区 = 中数据区.querySelector(".记录区");
const 右记录区 = 右数据区.querySelector(".记录区");
const 数据可视化记录组 = [左记录区, 中记录区, 右记录区];
const 步骤记录区 = 记录数据区.querySelector(".记录区");
const 左数据指针 = 左数据区.querySelector(".数据指针");
const 中数据指针 = 中数据区.querySelector(".数据指针");
const 右数据指针 = 右数据区.querySelector(".数据指针");
const 记录指针 = 数据结构区.querySelector(".记录指针");
const 数据指针组 = [左数据指针, 中数据指针, 右数据指针, 记录指针];
const 数据指针位置组 = [-1, -1, -1, -1];
/* let 左数据指针位置 = -1;
let 中数据指针位置 = -1;
let 右数据指针位置 = -1;
let 记录指针位置 = -1; */

const 位置图标关联对象 = {
  左: '<i class="fa-solid fa-l"></i>',
  中: '<i class="fa-solid fa-m"></i>',
  右: '<i class="fa-solid fa-r"></i>',
};

const 动画速度描述组 = [
  { 用时: 1000, 描述: "极慢" },
  { 用时: 750, 描述: "较慢" },
  { 用时: 500, 描述: "正常" },
  { 用时: 250, 描述: "较快" },
  { 用时: 125, 描述: "极快" },
];

let 已恢复初始状态 = true;
let 积木数量 = 5;
let 动画时长 = 250;
const 积木高度 = 35;
const 最大积木宽度百分比 = 90;
const 操作栈 = [];
let 栈指针 = -1;
let 当前积木 = null;
let 来源 = null;
let 目标 = null;
let 动画 = null;
const 木头音效 = new Audio("./Audios/木头.mp3");

const 设置按钮 = document.getElementById("设置");
const 设置对话框 = document.getElementById("设置对话框");
设置按钮.addEventListener("click", () => {
  设置对话框.showModal();
  设置对话框.classList.add("启用");
  设置按钮.classList.add("禁用");
});

设置对话框.addEventListener("click", (e) => {
  e.stopPropagation();
  if (e.target.id === "设置对话框") {
    设置对话框.close();
    设置对话框.classList.remove("启用");
    设置按钮.classList.remove("禁用");
  }
});

const 积木数量滑块 = document.getElementById("积木数量");
const 动画速度滑块 = document.getElementById("动画速度");
积木数量滑块.addEventListener("input", (e) => {
  积木数量 = parseInt(积木数量滑块.value, 10);
  const 值 = 积木数量滑块.nextElementSibling;
  值.textContent = 积木数量滑块.value;
  重置游戏();
});
动画速度滑块.addEventListener("input", (e) => {
  const 索引 = parseInt(动画速度滑块.value, 10);
  动画时长 = 动画速度描述组[索引].用时;
  const 值 = 动画速度滑块.nextElementSibling;
  值.textContent = 动画速度描述组[索引].描述;
});

const 音效复选框 = document.getElementById("音效");
const 数据可视化复选框 = document.getElementById("数据可视化");

数据可视化复选框.addEventListener("change", () => {
  if (数据可视化复选框.checked) {
    数据结构区.classList.remove("已屏蔽");
  } else {
    数据结构区.classList.add("已屏蔽");
  }
});

const 撤销按钮 = document.getElementById("撤销");
const 恢复按钮 = document.getElementById("恢复");
const 重置按钮 = document.querySelector(".reset-game");

初始化积木();
初始化数据结构区();

function 初始化积木() {
  左积木区.innerHTML = "";
  中积木区.innerHTML = "";
  右积木区.innerHTML = "";
  for (let i = 0; i < 积木数量; i++) {
    const 积木 = document.createElement("div");
    积木.className = "积木";
    const 当前积木宽度 = 最大积木宽度百分比 - 12.5 * i;
    积木.style.width = `${当前积木宽度}%`;
    积木.id = 当前积木宽度 * 10;
    左积木区.appendChild(积木);
    积木.style.backgroundColor = 生成随机颜色(i);
  }
}

function 初始化数据结构区() {
  const 所有记录容器 = 数据结构区.querySelectorAll(".记录容器");
  for (const 记录容器 of 所有记录容器) {
    记录容器.remove();
  }

  for (let i = 0; i < 积木数量; i++) {
    const 记录容器 = 生成记录容器(左记录区);
    记录容器.id = `高度-${积木数量 - i}`;
  }

  for (let i = 0; i < 数据指针位置组.length; i++) {
    数据指针位置组[i] = -1;
  }
  数据指针位置组[0] = 积木数量 - 1;
  for (let i = 0; i < 数据指针位置组.length; i++) {
    数据指针组[i].style.translate = `${100 * 数据指针位置组[i]}%`;
  }

  左记录区.lastElementChild.classList.add("顶端记录");
}

function 生成随机颜色(index) {
  return `rgb(${221 - index * 30}, ${238 - index * 30}, ${255 - index * 30})`;
}

for (const 操作分区 of 操作分区组) {
  操作分区.addEventListener("click", 点击操作分区);
}

function 点击操作分区(e) {
  const 操作分区 = e.currentTarget;
  if (来源 === 操作分区) {
    来源 = null;
    操作分区.classList.remove("来源");
    当前积木 = null;
    return;
  }
  const 积木区 = 操作分区.querySelector(".积木区");
  if (来源 === null) {
    /* 来源为空，此分支为来源 */
    /* 没有积木 */
    if (积木区.children.length === 0) {
      return;
    }
    /* 有积木 */
    来源 = 操作分区;
    操作分区.classList.add("来源");
    当前积木 = 积木区.lastElementChild;
  } else {
    /* 来源非空，此分支为目标 */
    const 目标积木区 = 操作分区.querySelector(".积木区");
    if (目标积木区.children.length > 0) {
      const 目标积木区最后积木宽度 = parseInt(目标积木区.lastElementChild.id, 10);
      const 当前积木宽度 = parseInt(当前积木.id, 10);
      if (当前积木宽度 > 目标积木区最后积木宽度) {
        return;
      }
    }

    for (const 分区 of 操作分区组) {
      分区.removeEventListener("click", 点击操作分区);
    }
    目标 = 操作分区;
    栈指针++;
    数据指针位置组[数据指针位置组.length - 1]++;
    刷新数据可视化三区样式(来源, 目标);

    if (栈指针 <= 操作栈.length - 1) {
      操作栈[栈指针].来源 = 来源;
      操作栈[栈指针].目标 = 目标;
      for (let i = 操作栈.length - 1; i > 栈指针; i--) {
        操作栈.pop();
      }
      步骤记录区.querySelector(".顶端记录")?.classList.remove("顶端记录");
      const 当前全部记录 = 步骤记录区.querySelectorAll(".记录容器");
      当前全部记录[数据指针位置组[数据指针位置组.length - 1]].classList.remove("已撤销");
      当前全部记录[数据指针位置组[数据指针位置组.length - 1]].classList.add("顶端记录");
      for (let i = 数据指针位置组[数据指针位置组.length - 1] + 1; i < 当前全部记录.length; i++) {
        当前全部记录[i]?.remove();
      }
    } else {
      操作栈.push({
        来源: 来源,
        目标: 目标,
      });
      生成记录容器(步骤记录区);
      步骤记录区.querySelector(".顶端记录")?.classList.remove("顶端记录");
      步骤记录区.lastElementChild.classList.add("顶端记录");
    }
    移动积木(来源, 目标);
    数据指针组[数据指针组.length - 1].style.translate = `${100 * 数据指针位置组[数据指针位置组.length - 1]}%`;
  }
}

function 移动积木(source, target) {
  const 目标积木区 = target.querySelector(".积木区");
  const 来源剩余积木高度 = (source.querySelector(".积木区").children.length - 1) * 积木高度;
  const 目标已有积木高度 = 目标积木区.children.length * 积木高度;
  const 高度差值 = 来源剩余积木高度 - 目标已有积木高度;
  const 来源左偏移 = source.offsetLeft;
  const 目标左偏移 = target.offsetLeft;
  const 偏移差 = 目标左偏移 - 来源左偏移;
  const 关键帧序列 = [
    { translate: "0 0", opacity: "1" },
    { translate: "0 -300px", opacity: "0", offset: 0.5 },
    { translate: `${偏移差}px -300px`, opacity: "0", offset: 0.5 },
    { translate: `${偏移差}px ${高度差值}px`, opacity: "1" },
  ];
  const 动画设置 = {
    easing: "linear",
    duration: 动画时长,
    fill: "forwards",
  };
  动画 = 当前积木.animate(关键帧序列, 动画设置);

  if (栈指针 >= 操作栈.length - 1) {
    恢复按钮.removeEventListener("click", 恢复操作);
    恢复按钮.classList.add("禁用");
  }

  setTimeout(() => {
    if (音效复选框.checked) {
      木头音效.play();
    }
    动画.cancel();
    source.querySelector(".积木区").lastElementChild.remove();
    目标积木区.appendChild(当前积木);
    source.classList.remove("来源");
    source.classList.remove("目标");
    target.classList.remove("来源");
    target.classList.remove("目标");
    当前积木 = null;
    来源 = null;
    目标 = null;
    for (const 分区 of 操作分区组) {
      分区.addEventListener("click", 点击操作分区);
    }
    撤销按钮.addEventListener("click", 撤销操作);
    if (栈指针 > -1) {
      撤销按钮.classList.remove("禁用");
    }

    if (栈指针 < 操作栈.length - 1) {
      恢复按钮.addEventListener("click", 恢复操作);
      恢复按钮.classList.remove("禁用");
    }

    if (目标积木区.children.length === 积木数量) {
    }
  }, 动画时长);
}

撤销按钮.addEventListener("click", 撤销操作);
恢复按钮.addEventListener("click", 恢复操作);

function 撤销操作() {
  if (栈指针 < 0) {
    return;
  }
  撤销按钮.classList.add("禁用");
  撤销按钮.removeEventListener("click", 撤销操作);
  const 最后记录 = 操作栈[栈指针];
  栈指针--;
  当前积木 = 最后记录.目标.querySelector(".积木区").lastElementChild;
  移动积木(最后记录.目标, 最后记录.来源);
  数据指针位置组[数据指针位置组.length - 1]--;
  数据指针组[数据指针组.length - 1].style.translate = `${100 * 数据指针位置组[数据指针位置组.length - 1]}%`;
  const 顶端记录 = 步骤记录区.querySelector(".顶端记录");
  顶端记录.classList.remove("顶端记录");
  顶端记录.classList.add("已撤销");
  const 前一记录 = 顶端记录.previousElementSibling;
  if (前一记录.className.includes("记录容器")) {
    前一记录.classList.add("顶端记录");
  }

  刷新数据可视化三区样式(最后记录.目标, 最后记录.来源);
}

function 恢复操作() {
  if (栈指针 >= 操作栈.length - 1) {
    return;
  }
  恢复按钮.classList.add("禁用");
  恢复按钮.removeEventListener("click", 撤销操作);
  栈指针++;
  const 记录 = 操作栈[栈指针];
  当前积木 = 记录.来源.querySelector(".积木区").lastElementChild;
  移动积木(记录.来源, 记录.目标);

  数据指针位置组[数据指针位置组.length - 1]++;
  步骤记录区.querySelector(".顶端记录")?.classList.remove("顶端记录");
  const 当前全部记录 = 步骤记录区.querySelectorAll(".记录容器");
  当前全部记录[数据指针位置组[数据指针位置组.length - 1]].classList.remove("已撤销");
  当前全部记录[数据指针位置组[数据指针位置组.length - 1]].classList.add("顶端记录");
  数据指针组[数据指针组.length - 1].style.translate = `${100 * 数据指针位置组[数据指针位置组.length - 1]}%`;

  刷新数据可视化三区样式(记录.来源, 记录.目标);
}

function 刷新数据可视化三区样式(来源, 目标) {
  const 来源索引 = 操作分区组.indexOf(来源);
  const 目标索引 = 操作分区组.indexOf(目标);
  const 数据区操作对象 = 数据可视化记录组[来源索引].lastElementChild;
  数据区操作对象.remove();
  数据可视化记录组[目标索引].appendChild(数据区操作对象);
  数据指针位置组[来源索引]--;
  数据指针位置组[目标索引]++;
  数据指针组[来源索引].style.translate = `${100 * 数据指针位置组[来源索引]}%`;
  数据指针组[目标索引].style.translate = `${100 * 数据指针位置组[目标索引]}%`;
}

function 生成记录容器(记录区) {
  const 记录容器 = document.createElement("div");
  记录容器.className = "记录容器";
  记录区.appendChild(记录容器);

  if (记录区.parentElement.className.includes("记录数据区")) {
    const 来源 = document.createElement("span");
    来源.className = "记录流向";
    const 目标 = document.createElement("span");
    目标.className = "记录流向";
    const 流向图标 = document.createElement("span");
    流向图标.className = "流向图标";
    流向图标.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';

    if (栈指针 >= 0) {
      const 本次操作 = 操作栈[栈指针];
      const 来源位置 = 本次操作.来源.getAttribute("位置");
      const 目标位置 = 本次操作.目标.getAttribute("位置");
      来源.innerHTML = 位置图标关联对象[来源位置];
      目标.innerHTML = 位置图标关联对象[目标位置];
    }
    记录容器.append(来源, 流向图标, 目标);
  } else {
    const 记录可视区 = document.createElement("div");
    记录可视区.className = "记录可视区";
    记录容器.appendChild(记录可视区);
  }

  return 记录容器;
}

重置按钮.addEventListener("click", 重置游戏);

function 重置游戏() {
  动画时长 = 250;
  操作栈.length = 0;
  栈指针 = -1;
  撤销按钮.classList.add("禁用");
  恢复按钮.classList.add("禁用");
  当前积木 = null;
  来源 = null;
  目标 = null;
  动画 = null;
  /* 数据可视化复选框.checked = false;
  数据结构区.classList.add("已屏蔽"); */

  for (const 操作分区 of 操作分区组) {
    操作分区.classList.remove("来源");
  }

  初始化积木();
  初始化数据结构区();
}
