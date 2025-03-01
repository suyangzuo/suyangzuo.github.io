const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 奖品数量 = 10;
let 最大圈数 = 25 + Math.random();
let 最小圈数 = 5 + Math.random();
let 总旋转角度 = 生成总旋转角度();

function 生成总旋转角度() {
  return 360 * (Math.random() * (最大圈数 - 最小圈数 + 1) + 最小圈数);
}

const 转盘容器 = document.querySelector(".转盘容器");
const 转盘指示器 = document.querySelector(".转盘指示器");
const 指示器前端线 = document.querySelector(".指示器前端线");
const 指示器后端线 = document.querySelector(".指示器后端线");
const 角度间隔 = parseInt(rootStyle.getPropertyValue("--角度间隔"), 10);

const 奖品容器组 = document.querySelectorAll(".奖品容器");
const 奖品内容组 = document.querySelectorAll(".奖品内容");

for (const [index, 奖品容器] of 奖品容器组.entries()) {
  const 背景色 = rootStyle.getPropertyValue(`--奖品-${index}-背景色`);
  const 渐变起点 = rootStyle.getPropertyValue(`--奖品-${index}-起点`);
  const 渐变终点 = rootStyle.getPropertyValue(`--奖品-${index}-终点`);
  奖品容器.style.backgroundImage = `conic-gradient(
    from -18deg,
    transparent ${渐变起点},
    ${背景色} ${渐变起点} ${渐变终点},
    transparent ${渐变终点})`;
}

for (const [index, 奖品内容] of 奖品内容组.entries()) {
  奖品内容.style.rotate = `z ${(index * 360) / 奖品数量}deg`;
  修正转盘奖品序号角度();
}

const 奖品设置区 = document.querySelector(".奖品设置区");
const 奖品设置项组 = document.getElementsByClassName("奖品设置项");
const 奖品名称文本框组 = document.getElementsByClassName("奖品名称 文本框");
for (let i = 0; i < 奖品数量; i++) {
  const 转盘奖品文本 = 奖品内容组[i].querySelector(".奖品文本");

  const 奖品设置项 = document.createElement("div");
  奖品设置项.className = "奖品设置项";
  奖品设置区.appendChild(奖品设置项);

  const 设置奖品序号 = document.createElement("label");
  设置奖品序号.className = "设置奖品序号";
  设置奖品序号.textContent = i + 1;

  const 奖品名称输入框 = document.createElement("input");
  奖品名称输入框.type = "text";
  奖品名称输入框.id = `奖品-${i + 1}`;
  设置奖品序号.setAttribute("for", 奖品名称输入框.id);
  奖品名称输入框.className = "奖品名称 文本框";
  奖品名称输入框.value = 转盘奖品文本.innerText;
  奖品设置项.append(设置奖品序号, 奖品名称输入框);

  奖品名称输入框.addEventListener("input", () => {
    转盘奖品文本.textContent = 奖品名称输入框.value;
  });

  奖品设置项.addEventListener("mouseenter", 显示转盘指示器);
  奖品设置项.addEventListener("mouseleave", 隐藏转盘指示器);
}

for (const 文本框 of 奖品名称文本框组) {
  文本框.addEventListener("focus", () => {
    for (const 奖品设置项 of 奖品设置项组) {
      奖品设置项.removeEventListener("mouseenter", 显示转盘指示器);
      奖品设置项.removeEventListener("mouseleave", 隐藏转盘指示器);
    }
  });
  文本框.addEventListener("focus", 显示转盘指示器);

  文本框.addEventListener("blur", () => {
    for (const 奖品设置项 of 奖品设置项组) {
      奖品设置项.addEventListener("mouseenter", 显示转盘指示器);
      奖品设置项.addEventListener("mouseleave", 隐藏转盘指示器);
    }
  });
  文本框.addEventListener("blur", 隐藏转盘指示器);
}

function 显示转盘指示器(event) {
  const 索引 = Array.from(document.querySelectorAll(`.${event.target.classList[0]}`)).indexOf(event.target);
  转盘指示器.classList.remove("隐藏");
  指示器前端线.classList.remove("隐藏");
  指示器后端线.classList.remove("隐藏");
  转盘指示器.style.setProperty("--指示器起始角度", `${角度间隔 * 索引}deg`);
  转盘指示器.style.setProperty("--指示器结束角度", `${角度间隔 * (索引 + 1)}deg`);
  转盘指示器.style.setProperty("--转盘指示器背景色", rootStyle.getPropertyValue(`--奖品-${索引}-背景色`));
  指示器前端线.style.setProperty("--指示器起始角度", `${角度间隔 * 索引}deg`);
  指示器后端线.style.setProperty("--指示器起始角度", `${角度间隔 * 索引}deg`);
}

function 隐藏转盘指示器() {
  转盘指示器.classList.add("隐藏");
  指示器前端线.classList.add("隐藏");
  指示器后端线.classList.add("隐藏");
}

function 修正转盘奖品序号角度() {
  for (const [index, 奖品内容] of 奖品内容组.entries()) {
    const 转盘奖品序号 = 奖品内容.querySelector(".转盘奖品序号");
    转盘奖品序号.textContent = index + 1;
    const 旋转角度 = parseInt(window.getComputedStyle(奖品内容).rotate, 10);
    转盘奖品序号.style.rotate = `z -${旋转角度}deg`;
  }
}

const 开奖按钮 = document.getElementById("开奖按钮");
const 旋转转盘单选框 = document.getElementById("旋转对象-转盘");
const 旋转指针单选框 = document.getElementById("旋转对象-指针");
const 指针 = document.querySelector(".指针");
const 转盘奖品序号组 = document.querySelectorAll(".转盘奖品序号");

const 转盘关键帧序列 = [
  {
    rotate: "z 0deg",
  },
  {
    rotate: `z ${总旋转角度}deg`,
  },
];

const 动画选项 = {
  easing: "cubic-bezier(0.02, 0.95, 0.5, 1)",
  fill: "forwards",
  duration: 15000,
};

开奖按钮.addEventListener("click", () => {
  if (旋转转盘单选框.checked) {
    for (const 转盘奖品序号 of 转盘奖品序号组) {
      const 当前旋转角度 = parseInt(转盘奖品序号.style.rotate, 10);
      转盘奖品序号.style.rotate = `z ${当前旋转角度 - 总旋转角度}deg`;
    }

    转盘容器.animate(转盘关键帧序列, 动画选项);
  } else {
    指针.animate(转盘关键帧序列, 动画选项);
  }
});

let 延时器id = null;
let 定时器id = null;
const 数字框组 = document.getElementsByClassName("数字框");
for (const 数字框 of 数字框组) {
  const 减少按钮 = 数字框.previousElementSibling;
  const 增加按钮 = 数字框.nextElementSibling;
  减少按钮.addEventListener("click", 点击数字框加减按钮);
  增加按钮.addEventListener("click", 点击数字框加减按钮);
  减少按钮.addEventListener("mousedown", (event) => {
    延时器id = setTimeout(() => {
      快速更新数值(event);
    }, 500);
  });
  增加按钮.addEventListener("mousedown", (event) => {
    延时器id = setTimeout(() => {
      快速更新数值(event);
    }, 500);
  });
  减少按钮.addEventListener("mouseup", () => {
    clearTimeout(延时器id);
    clearInterval(定时器id);
  });
  增加按钮.addEventListener("mouseup", () => {
    clearTimeout(延时器id);
    clearInterval(定时器id);
  });
  减少按钮.addEventListener("mouseleave", () => {
    clearTimeout(延时器id);
    clearInterval(定时器id);
  });
  增加按钮.addEventListener("mouseleave", () => {
    clearTimeout(延时器id);
    clearInterval(定时器id);
  });

  数字框.addEventListener("input", () => {
    const 最小值 = parseInt(数字框.min, 10);
    const 最大值 = parseInt(数字框.max, 10);
    let 值 = parseInt(数字框.value, 10);
    if (值 < 最小值 || 值 > 最大值) {
      值 = 值 < 最小值 ? 最小值 : 最大值;
    }

    if (数字框.id.includes("最低")) {
      最小圈数 = 值 + Math.random();
    } else {
      最大圈数 = 值 + Math.random();
    }
    总旋转角度 = 生成总旋转角度();
    转盘关键帧序列[1].rotate = `z ${总旋转角度}deg`;
  });

  数字框.addEventListener("blur", () => {
    const 最小值 = parseInt(数字框.min, 10);
    const 最大值 = parseInt(数字框.max, 10);
    let 值 = parseInt(数字框.value, 10);
    if (值 < 最小值 || 值 > 最大值) {
      值 = 值 < 最小值 ? 最小值 : 最大值;
      数字框.value = 值;
      return;
    }
  });

  数字框.addEventListener("mouseleave", () => {
    const 最小值 = parseInt(数字框.min, 10);
    const 最大值 = parseInt(数字框.max, 10);
    let 值 = parseInt(数字框.value, 10);
    if (值 < 最小值 || 值 > 最大值) {
      值 = 值 < 最小值 ? 最小值 : 最大值;
      数字框.value = 值;
      return;
    }
  });
}

function 点击数字框加减按钮(event) {
  const 数字框 = event.target.parentElement.querySelector(".数字框");
  const 最小值 = parseInt(数字框.min, 10);
  const 最大值 = parseInt(数字框.max, 10);
  let 值 = parseInt(数字框.value, 10);
  if (event.target.id.includes("减少")) {
    值--;
  } else {
    值++;
  }
  if (值 < 最小值 || 值 > 最大值) {
    值 = 值 < 最小值 ? 最小值 : 最大值;
    return;
  }
  数字框.value = 值;

  if (数字框.id.includes("最低")) {
    最小圈数 = 值 + Math.random();
  } else {
    最大圈数 = 值 + Math.random();
  }
  总旋转角度 = 生成总旋转角度();
  转盘关键帧序列[1].rotate = `z ${总旋转角度}deg`;
}

function 快速更新数值(event) {
  const 数字框 = event.target.parentElement.querySelector(".数字框");
  const 最小值 = parseInt(数字框.min, 10);
  const 最大值 = parseInt(数字框.max, 10);
  let 值 = parseInt(数字框.value, 10);
  定时器id = setInterval(() => {
    if (event.target.id.includes("减少")) {
      值--;
    } else {
      值++;
    }
    if (值 < 最小值 || 值 > 最大值) {
      值 = 值 < 最小值 ? 最小值 : 最大值;
      clearInterval(定时器id);
      return;
    }

    数字框.value = 值;
    if (数字框.id.includes("最低")) {
      最小圈数 = 值 + Math.random();
    } else {
      最大圈数 = 值 + Math.random();
    }
    总旋转角度 = 生成总旋转角度();
    转盘关键帧序列[1].rotate = `z ${总旋转角度}deg`;
  }, 50);
}

const 用时滑块 = document.getElementById("用时");
用时滑块.addEventListener("input", () => {
  动画选项.duration = 用时滑块.value * 1000;
  const 值 = 用时滑块.nextElementSibling.querySelector(".值");
  值.textContent = 用时滑块.value;
});
