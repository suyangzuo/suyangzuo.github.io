const 左分区 = document.querySelector(".左分区");
const 中分区 = document.querySelector(".中分区");
const 右分区 = document.querySelector(".右分区");
const 左积木区 = 左分区.querySelector(".积木区");
const 中积木区 = 中分区.querySelector(".积木区");
const 右积木区 = 右分区.querySelector(".积木区");

const 积木数量 = 5;
const 积木高度 = 35;
const 最大积木宽度百分比 = 90;
let 动画时长 = 500;
const 左积木栈 = [];
const 中积木栈 = [];
const 右积木栈 = [];

const 操作记录 = [];
const 恢复记录 = [];
let 当前积木 = null;
let 来源 = null;
let 目标 = null;
let 动画 = null;

const 操作分区组 = document.querySelectorAll(".操作分区");
const 撤销按钮 = document.getElementById("撤销");
const 恢复按钮 = document.getElementById("恢复");
const 重置按钮 = document.querySelector(".reset-game");

初始化积木();

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
    左积木栈.push(积木);
    左积木区.appendChild(积木);

    积木.style.backgroundColor = 生成随机颜色(i);
  }
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
    操作记录.push({
      来源: 来源,
      目标: 目标,
    });
    移动积木(来源, 目标);
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

  setTimeout(() => {
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
    if (操作记录.length > 0) {
      撤销按钮.classList.remove("禁用");
    }
    恢复按钮.addEventListener("click", 恢复操作);
    if (恢复记录.length > 0) {
      恢复按钮.classList.remove("禁用");
    }

    if (目标积木区.children.length === 积木数量) {
    }
  }, 动画时长);
}

撤销按钮.addEventListener("click", 撤销操作);
恢复按钮.addEventListener("click", 恢复操作);

function 撤销操作() {
  if (操作记录.length === 0) {
    return;
  }
  撤销按钮.classList.add("禁用");
  撤销按钮.removeEventListener("click", 撤销操作);
  const 记录 = 操作记录.pop();
  恢复记录.push(记录);
  console.log(恢复记录);
  当前积木 = 记录.目标.querySelector(".积木区").lastElementChild;
  移动积木(记录.目标, 记录.来源);
}

function 恢复操作() {
  if (恢复记录.length === 0) {
    return;
  }
  恢复按钮.classList.add("禁用");
  恢复按钮.removeEventListener("click", 撤销操作);
  const 记录 = 恢复记录.pop();
  操作记录.push(记录);
  当前积木 = 记录.来源.querySelector(".积木区").lastElementChild;
  移动积木(记录.来源, 记录.目标);
}

重置按钮.addEventListener("click", 重置游戏);

function 重置游戏() {
  动画时长 = 500;
  操作记录.length = 0;
  恢复记录.length = 0;
  当前积木 = null;
  来源 = null;
  目标 = null;
  动画 = null;

  初始化积木();
}
