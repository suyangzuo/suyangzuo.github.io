const 重置游戏按钮 = document.querySelector(".reset-game");

const 结果区 = document.querySelector(".result-area");
const 结果区计算样式 = window.getComputedStyle(结果区);
const 游戏区 = document.querySelector(".game-area");
const 游戏区计算样式 = window.getComputedStyle(游戏区);

const 提示宽度 = 100;
const 提示高度 = 100;
const 设置区高度 = 105 + 25;
const 控制区高度 = 150;
const 结果区过渡时长 = parseFloat(结果区计算样式.transition) * 1000;

const 音效复选框 = document.getElementById("音效");
const 拆弹音效 = new Audio("./Audios/拆弹.mp3");

const 提示时长滑块 = document.getElementById("提示时长");
const 炸弹数量滑块 = document.getElementById("炸弹数量");
let 提示时长 = parseInt(提示时长滑块.value, 10);
let 炸弹数量 = parseInt(炸弹数量滑块.value, 10);
let 提示间隔 = 250;
let 当前目标索引 = 0;
let 点击次数 = 0;

const 提示序列 = [];
let 起始时间 = null;
let 初始化渐显Id = null;
let 隐藏全部提示Id = null;
let 恢复点击提示Id = null;
let 生成结果Id = null;
const 提示动画组 = [];

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
      炸弹数量 = parseInt(炸弹数量滑块.value, 10);
    }
  });
}

游戏区.addEventListener("click", () => {
  点击次数++;
});

let 点击开始按钮延时Id = null;
const 开始按钮 = document.getElementById("start");
开始按钮.addEventListener("click", () => {
  clearTimeout(点击开始按钮延时Id);
  clearTimeout(隐藏全部提示Id);
  for (const 提示动画 of 提示动画组) {
    提示动画?.cancel();
  }
  提示动画组.length = 0;
  for (const 提示 of 提示序列) {
    提示.元素.style.opacity = "0";
  }
  点击开始按钮延时Id = setTimeout(() => {
    初始化();
    生成提示元素();
    禁止点击提示();
    生成提示动画();
  }, 500 + (结果区.classList.contains("隐藏") ? 0 : 结果区过渡时长));
  结果区.classList.add("隐藏");
});

function 生成提示元素() {
  const 游戏区宽度 = parseFloat(游戏区计算样式.width);
  const 游戏区高度 = parseFloat(游戏区计算样式.height);
  const 提示元素宽度占比 = (提示宽度 / 游戏区宽度) * 100;
  const 设置区高度占比 = (设置区高度 / 游戏区高度) * 100;
  const 控制区高度占比 = (控制区高度 / 游戏区高度) * 100;
  for (let i = 0; i < 炸弹数量; i++) {
    const 水平坐标 = `${Math.floor(Math.random() * (90 - 提示元素宽度占比 - 10 + 1) + 10)}%`;
    const 垂直坐标 = `${Math.floor(
      Math.random() * (100 - 控制区高度占比 - 设置区高度占比 - 设置区高度占比 + 1) + 设置区高度占比
    )}%`;
    const 提示元素 = document.createElement("div");
    提示元素.className = "提示";
    提示元素.style.left = 水平坐标;
    提示元素.style.top = 垂直坐标;
    提示元素.setAttribute("data-index", i);
    提示元素.addEventListener("click", 记录玩家数据);
    游戏区.appendChild(提示元素);
    const 提示序号 = document.createElement("span");
    提示序号.classList.add("提示序号");
    提示序号.textContent = i + 1;
    提示元素.appendChild(提示序号);
    const 已确认元素 = document.createElement("figure");
    已确认元素.className = "已确认 隐藏";
    提示元素.appendChild(已确认元素);
    提示序列.push({
      元素: 提示元素,
      坐标: {
        水平: 水平坐标,
        垂直: 垂直坐标,
      },
      点击次数: 0,
      成功用时: 0,
    });
  }

  初始化渐显Id = setTimeout(() => {
    for (const 提示 of 提示序列) {
      提示.元素.classList.add("半隐");
    }
  }, 10);
}

function 生成提示动画() {
  const 关键帧序列 = [{ opacity: 0.25 }, { opacity: 1, offset: 0.1 }, { opacity: 1, offset: 0.9 }, { opacity: 0.25 }];
  for (const [index, 提示] of 提示序列.entries()) {
    const 动画设置 = {
      duration: 提示时长,
      delay: (提示时长 + 提示间隔) * (index + 1),
    };

    提示动画组.push(提示.元素.animate(关键帧序列, 动画设置));
  }

  隐藏全部提示Id = setTimeout(() => {
    for (const 提示 of 提示序列) {
      提示.元素.classList.remove("半隐");
    }
  }, (提示间隔 + 提示时长) * (提示序列.length + 1));

  恢复点击提示Id = setTimeout(恢复点击提示, (提示间隔 + 提示时长) * (提示序列.length + 1) + 250);
}

function 记录玩家数据(event) {
  event.stopPropagation();
  点击次数++;
  const 提示元素索引 = parseInt(event.target.getAttribute("data-index"), 10);
  if (提示元素索引 !== 当前目标索引) return;
  const 结束时间 = performance.now();
  提示序列[当前目标索引].成功用时 = 结束时间 - 起始时间;
  提示序列[当前目标索引].点击次数 = 点击次数;
  生成成功效果();
  起始时间 = 结束时间;
  点击次数 = 0;
  当前目标索引++;
  if (当前目标索引 > 提示序列.length - 1) {
    禁止点击提示();
    生成结果Id = setTimeout(生成结果, 1000);
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
  结果区.innerHTML = "";
}

function 生成生活用时(时间段) {
  const 分 = Math.floor(时间段 / 60000);
  const 秒 = Math.round(((时间段 - 分 * 60000) / 1000) * 100) / 100;
  return {
    分: 分,
    秒: 秒,
  };
}

function 生成成功效果() {
  if (音效复选框.checked) {
    拆弹音效.play();
  }
  提示序列[当前目标索引].元素.style.opacity = "1";
  const 已确认元素 = 提示序列[当前目标索引].元素.querySelector(".已确认");
  已确认元素.classList.remove("隐藏");
}

function 生成结果() {
  const 总数据区 = document.createElement("div");
  总数据区.classList.add("总数据区");
  const 总用时区 = document.createElement("div");
  总用时区.classList.add("总用时区");
  const 总点击次数区 = document.createElement("div");
  总点击次数区.classList.add("总点击次数区");
  const 得分区 = document.createElement("div");
  得分区.className = "得分区";
  总数据区.append(总用时区, 总点击次数区, 得分区);

  const 总用时标题 = document.createElement("h4");
  总用时标题.className = "标题 总用时标题";
  总用时标题.textContent = "总用时";
  const 总用时数据 = document.createElement("span");
  总用时数据.className = "数据容器 总用时数据容器";
  总用时区.append(总用时标题, 总用时数据);

  const 分数据容器 = document.createElement("span");
  分数据容器.className = "子数据容器 分数据容器";
  const 分值 = document.createElement("span");
  分值.className = "数值 分值";
  const 分单位 = document.createElement("span");
  分单位.className = "单位 分单位";
  分数据容器.append(分值, 分单位);

  const 秒数据容器 = document.createElement("span");
  秒数据容器.className = "子数据容器 秒数据容器";
  const 秒值 = document.createElement("span");
  秒值.className = "数值 秒值";
  const 秒单位 = document.createElement("span");
  秒单位.className = "单位 秒单位";
  秒数据容器.append(秒值, 秒单位);

  总用时数据.append(分数据容器, 秒数据容器);

  const 总点击次数标题 = document.createElement("h4");
  总点击次数标题.className = "标题 总点击次数标题";
  总点击次数标题.textContent = "总点击次数";
  const 总点击次数数据 = document.createElement("span");
  总点击次数数据.className = "数据容器 总点击次数数据容器";
  总点击次数区.append(总点击次数标题, 总点击次数数据);

  const 点击次数容器 = document.createElement("span");
  点击次数容器.className = "子数据容器 点击次数容器";
  const 点击次数值 = document.createElement("span");
  点击次数值.className = "数值 点击次数值";
  点击次数容器.appendChild(点击次数值);

  总点击次数数据.appendChild(点击次数容器);

  const 得分标题 = document.createElement("h4");
  得分标题.className = "标题 得分标题";
  得分标题.textContent = "得分";
  const 得分数据 = document.createElement("span");
  得分数据.className = "数据容器 得分数据容器";
  得分区.append(得分标题, 得分数据);

  const 得分容器 = document.createElement("span");
  得分容器.className = "子数据容器 得分容器";
  const 得分值 = document.createElement("span");
  得分值.className = "数值 得分值";
  得分容器.appendChild(得分值);

  得分数据.appendChild(得分容器);

  let 总用时 = 0;
  let 总点击次数 = 0;
  for (const 提示 of 提示序列) {
    总用时 += 提示.成功用时;
    总点击次数 += 提示.点击次数;
  }

  const 总生活用时 = 生成生活用时(总用时);

  分值.textContent = 总生活用时.分;
  分单位.textContent = "分";
  秒值.textContent = 总生活用时.秒;
  秒单位.textContent = "秒";
  点击次数值.textContent = 总点击次数;

  /* -----------------------  每个炸弹独立数据区  ----------------------- */

  const 独立数据区域组 = document.createElement("div");
  独立数据区域组.classList.add("独立数据区域组");
  for (let i = 0; i < 提示序列.length; i++) {
    const 独立数据容器 = document.createElement("div");
    独立数据容器.classList.add("独立数据容器");
    独立数据区域组.appendChild(独立数据容器);

    const 独立序号 = document.createElement("span");
    独立序号.classList.add("独立序号");
    独立序号.textContent = i + 1;

    const 横线 = document.createElement("div");
    横线.className = "横线";

    const 炸弹图容器 = document.createElement("figure");
    炸弹图容器.classList.add("炸弹图容器");
    const 炸弹图 = document.createElement("img");
    炸弹图.classList.add("炸弹图");
    炸弹图.src = "./Images/炸弹.png";
    炸弹图.alt = "炸弹";
    炸弹图容器.appendChild(炸弹图);

    const 独立数据区 = document.createElement("div");
    独立数据区.classList.add("独立数据区");

    独立数据容器.append(独立序号, 横线, 炸弹图容器, 独立数据区);

    const 独立用时区 = document.createElement("div");
    独立用时区.classList.add("独立用时区");
    const 独立点击次数区 = document.createElement("div");
    独立点击次数区.classList.add("独立点击次数区");

    独立数据区.append(独立用时区, 独立点击次数区);

    const 独立用时标题 = document.createElement("h4");
    独立用时标题.className = "标题 独立用时标题";
    独立用时标题.textContent = "用时";
    const 独立用时数据 = document.createElement("span");
    独立用时数据.className = "数据容器 独立用时数据容器";
    独立用时区.append(独立用时标题, 独立用时数据);

    const 独立分数据容器 = document.createElement("span");
    独立分数据容器.className = "子数据容器 独立分数据容器";
    const 独立分值 = document.createElement("span");
    独立分值.className = "数值 独立分值";
    const 独立分单位 = document.createElement("span");
    独立分单位.className = "单位 独立分单位";
    独立分数据容器.append(独立分值, 独立分单位);

    const 独立秒数据容器 = document.createElement("span");
    独立秒数据容器.className = "子数据容器 独立秒数据容器";
    const 独立秒值 = document.createElement("span");
    独立秒值.className = "数值 独立秒值";
    const 独立秒单位 = document.createElement("span");
    独立秒单位.className = "单位 独立秒单位";
    独立秒数据容器.append(独立秒值, 独立秒单位);

    独立用时数据.append(独立分数据容器, 独立秒数据容器);

    const 独立点击次数标题 = document.createElement("h4");
    独立点击次数标题.className = "标题 独立点击次数标题";
    独立点击次数标题.textContent = "点击次数";
    const 独立点击次数数据 = document.createElement("span");
    独立点击次数数据.className = "数据容器 独立点击次数数据容器";
    独立点击次数区.append(独立点击次数标题, 独立点击次数数据);

    const 独立点击次数容器 = document.createElement("span");
    独立点击次数容器.className = "子数据容器 独立点击次数容器";
    const 独立点击次数值 = document.createElement("span");
    独立点击次数值.className = "数值 独立点击次数值";
    独立点击次数容器.appendChild(独立点击次数值);

    独立点击次数数据.appendChild(独立点击次数容器);

    const 独立生活用时 = 生成生活用时(提示序列[i].成功用时);
    独立分值.textContent = 独立生活用时.分;
    独立分单位.textContent = "分";
    独立秒值.textContent = 独立生活用时.秒;
    独立秒单位.textContent = "秒";
    独立点击次数值.textContent = 提示序列[i].点击次数;

    得分值.textContent = `${(1000000 / (总用时 + 总点击次数)).toFixed(1)}`;
  }

  结果区.append(总数据区, 独立数据区域组);
  结果区.classList.remove("隐藏");
}

重置游戏按钮.addEventListener("click", 重置游戏);

function 重置游戏() {
  提示时长滑块.value = 500;
  const 提示时长数据值 = 提示时长滑块.parentElement.querySelector(".数据值");
  提示时长数据值.textContent = 0.5;
  炸弹数量滑块.value = 5;
  const 炸弹数量数据值 = 炸弹数量滑块.parentElement.querySelector(".数据值");
  炸弹数量数据值.textContent = 5;
  提示时长 = parseInt(提示时长滑块.value, 10);

  炸弹数量 = parseInt(炸弹数量滑块.value, 10);
  提示间隔 = 250;
  当前目标索引 = 0;
  点击次数 = 0;

  for (const 提示 of 提示序列) {
    提示.元素?.remove();
  }
  提示序列.length = 0;

  起始时间 = null;
  clearTimeout(初始化渐显Id);
  clearTimeout(隐藏全部提示Id);
  clearTimeout(恢复点击提示Id);
  clearTimeout(生成结果Id);
  for (const 提示动画 of 提示动画组) {
    提示动画?.cancel();
  }
  提示动画组.length = 0;
}
