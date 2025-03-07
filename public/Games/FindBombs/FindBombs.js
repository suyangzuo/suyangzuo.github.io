const 结果区 = document.querySelector(".result-area");
const 游戏区 = document.querySelector(".game-area");
const 游戏区计算样式 = window.getComputedStyle(游戏区);

const 提示宽度 = 100;
const 提示高度 = 100;

const 提示时长滑块 = document.getElementById("提示时长");
const 坐标数量滑块 = document.getElementById("坐标数量");
let 提示时长 = parseInt(提示时长滑块.value, 10);
let 坐标数量 = parseInt(坐标数量滑块.value, 10);
let 提示间隔 = 500;
let 当前目标索引 = 0;
let 点击次数 = 0;

const 提示序列 = [];
let 起始时间 = null;
let 恢复点击提示Id = null;

const 滑块组 = document.querySelectorAll(".滑块");
for (const 滑块 of 滑块组) {
  const 数据值 = 滑块.parentElement.querySelector(".数据值");
  滑块.addEventListener("input", () => {
    if (滑块.id === "提示时长") {
      const 时长 = parseFloat(滑块.value) / 1000;
      数据值.textContent = Math.round(时长 * 100) / 100;
      提示时长 = parseInt(提示时长滑块.value, 10);
    } else {
      数据值.textContent = 滑块.value;
      坐标数量 = parseInt(坐标数量滑块.value, 10);
    }
  });
}

游戏区.addEventListener("click", () => {
  点击次数++;
});

const 开始按钮 = document.getElementById("start");
开始按钮.addEventListener("click", 初始化);
开始按钮.addEventListener("click", 生成提示元素);
开始按钮.addEventListener("click", 禁止点击提示);
开始按钮.addEventListener("click", 生成提示动画);

function 生成提示元素() {
  const 游戏区宽度 = parseInt(游戏区计算样式.width);
  const 游戏区高度 = parseInt(游戏区计算样式.height);
  for (let i = 0; i < 坐标数量; i++) {
    const 水平坐标 = Math.floor(Math.random() * (游戏区宽度 - 提示宽度 - 100 - (提示宽度 + 100) + 1) + 提示宽度 + 100);
    const 垂直坐标 = Math.floor(Math.random() * (游戏区高度 - 提示高度 - 150));
    const 提示元素 = document.createElement("div");
    提示元素.classList.add("提示");
    提示元素.style.left = `${水平坐标}px`;
    提示元素.style.top = `${垂直坐标}px`;
    提示元素.setAttribute("data-index", i);
    提示元素.addEventListener("click", 记录玩家数据);
    游戏区.appendChild(提示元素);
    /* const 提示序号 = document.createElement("span");
    提示序号.classList.add("提示序号");
    提示序号.textContent = i + 1;
    提示元素.appendChild(提示序号); */
    const 已确认元素 = document.createElement("figure");
    已确认元素.className = "已确认 隐藏";
    提示元素.appendChild(已确认元素);
    提示序列.push({
      元素: 提示元素,
      x: 水平坐标,
      y: 垂直坐标,
      点击次数: 0,
      成功用时: 0,
    });
  }
}

function 生成提示动画() {
  const 关键帧序列 = [{ opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 1, offset: 0.9 }, { opacity: 0 }];
  for (const [index, 提示] of 提示序列.entries()) {
    const 动画设置 = {
      duration: 提示时长,
      delay: (提示时长 + 提示间隔) * index,
    };

    提示.元素.animate(关键帧序列, 动画设置);
  }

  恢复点击提示Id = setTimeout(恢复点击提示, (提示间隔 + 提示时长) * 提示序列.length);
}

function 记录玩家数据(event) {
  event.stopPropagation();
  点击次数++;
  const 提示元素索引 = parseInt(event.target.getAttribute("data-index"), 10);
  if (提示元素索引 !== 当前目标索引) return;
  const 结束时间 = performance.now();
  提示序列[提示元素索引].成功用时 = 结束时间 - 起始时间;
  提示序列[提示元素索引].点击次数 = 点击次数;
  生成成功效果();
  起始时间 = 结束时间;
  点击次数 = 0;
  当前目标索引++;
  if (当前目标索引 > 提示序列.length - 1) {
    禁止点击提示();
  }
}

function 禁止点击提示() {
  clearTimeout(恢复点击提示Id);
  for (const 提示 of 提示序列) {
    提示.元素.style.pointerEvents = "none";
  }
}

function 恢复点击提示() {
  for (const 提示 of 提示序列) {
    提示.元素.style.pointerEvents = "auto";
  }
  起始时间 = performance.now();
}

function 初始化() {
  点击次数 = 0;
  当前目标索引 = 0;
  提示序列.length = 0;
  游戏区.innerHTML = "";
}

function 生成生活用时(起始时间, 结束时间) {
  const 用时 = 结束时间 - 起始时间;
  const 分 = Math.floor(用时 / 60000);
  const 秒 = (用时 - 分 * 60000) / 1000;
  return {
    分: 分,
    秒: 秒,
  };
}

function 生成成功效果() {
  提示序列[当前目标索引].元素.style.opacity = "1";
  const 已确认元素 = 提示序列[当前目标索引].元素.querySelector(".已确认");
  已确认元素.classList.remove("隐藏");
}

function 生成结果() {}
