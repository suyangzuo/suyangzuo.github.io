const 冒泡排序区 = document.getElementById("冒泡排序区");
const 数字区 = 冒泡排序区.querySelector(".数字区");
const 代码演示区 = document.querySelector(".代码演示区");
const 动画速率 = document.getElementById("动画速率");
const 动画速率数值 = document.getElementById("动画速率数值");
const 开始按钮 = document.getElementById("开始运行");
const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 数字宽度 = rootStyle.getPropertyValue("--数字宽度");
const 数字间隙 = rootStyle.getPropertyValue("--数字间隙");
const 内循环池 = [];
const 延时函数池 = [];
const 重置按钮 = document.querySelector(".重置按钮");
const 数字数量 = 10;

let 排序过程正在运行 = false;

const 原始数字过渡时长 = parseInt(rootStyle.getPropertyValue("--数字过渡时长"));
const 原始交换动画时长 = 500;
const 原始交换前等待时长 = 2000;
const 原始交换后等待时长 = 2000;
const 原始本次数字恢复到下次数字变色时长 = 1000;
const 原始两轮之间等待时长 = 2500;
const 原始大循环间隔时长 = 2000;

let 数字过渡时长 = 原始数字过渡时长;
let 交换动画时长 = 原始交换动画时长;
let 交换前等待时长 = 原始交换前等待时长;
let 交换后等待时长 = 原始交换后等待时长;
let 本次数字恢复到下次数字变色时长 = 原始本次数字恢复到下次数字变色时长;
let 两轮之间等待时长 = 原始两轮之间等待时长;
let 大循环间隔时长 = 原始大循环间隔时长;
const 数字组 = 数字区.getElementsByClassName("数字");

初始化数字();

if (localStorage.getItem("动画速率") === null) {
  localStorage.setItem("动画速率", 动画速率.value);
} else {
  动画速率.value = localStorage.getItem("动画速率");
  设置动画速率(parseInt(动画速率.value, 10));
}

重置按钮.addEventListener("click", 重置参数);

动画速率.addEventListener("input", () => {
  设置动画速率(parseInt(动画速率.value, 10));
  localStorage.setItem("动画速率", 动画速率.value);
});

开始按钮.addEventListener("click", async () => {
  if (排序过程正在运行) return;
  排序过程正在运行 = true;
  const 左数字索引 = 数字区.querySelector(".左数字索引");
  const 右数字索引 = 数字区.querySelector(".右数字索引");
  左数字索引.style.opacity = "1";
  右数字索引.style.opacity = "1";
  for (let i = 0; i < 数字组.length - 1; i++) {
    if (!排序过程正在运行) return;
    设置外循环轮数字(i);
    左数字索引.style.translate = `calc(${数字宽度} * 0.5 - 50%)`;
    右数字索引.style.translate = `calc(${数字宽度} * 1.5 + ${数字间隙} - 50%)`;
    await sleep(大循环间隔时长);

    for (let j = 0; j < 数字组.length - 1 - i; j++) {
      if (!排序过程正在运行) return;
      左数字索引.style.translate = `calc(${数字宽度} * ${
        0.5 + j
      } + ${数字间隙} * ${j} - 50%)`;
      右数字索引.style.translate = `calc(${数字宽度} * ${
        1.5 + j
      } + ${数字间隙} * ${j + 1} - 50%)`;

      生成内循环区(j);

      数字组[j].classList.add("操作中数字");
      数字组[j + 1].classList.add("操作中数字");

      const 前一数字 = parseInt(数字组[j].textContent, 10);
      const 后一数字 = parseInt(数字组[j + 1].textContent, 10);
      await sleep(交换前等待时长);

      if (前一数字 > 后一数字) {
        if (!排序过程正在运行) return; //修复重置后仍然交换元素位置与索引
        生成动画_交换(数字组[j], 数字组[j + 1]);
        await sleep(交换动画时长);
        if (!排序过程正在运行) return; //修复重置后仍然交换元素位置与索引
        数字组[j].before(数字组[j + 1]);
      }
      await sleep(交换后等待时长);

      数字组[j].classList.remove("操作中数字");
      数字组[j + 1].classList.remove("操作中数字");

      await sleep(本次数字恢复到下次数字变色时长);
    }

    数字组[数字组.length - 1 - i].classList.add("已确定数字");
    await sleep(两轮之间等待时长);
    for (const 内循环区 of 内循环池) {
      内循环区.remove();
    }
    内循环池.length = 0;
  }
});

function sleep(duration) {
  return new Promise((resolve) => {
    if (!排序过程正在运行) return;
    setTimeout(resolve, duration);
  });
}

function 设置动画速率(速率) {
  交换前等待时长 = 原始交换前等待时长 / 速率;
  交换后等待时长 = 原始交换后等待时长 / 速率;
  本次数字恢复到下次数字变色时长 = 原始本次数字恢复到下次数字变色时长 / 速率;
  两轮之间等待时长 = 原始两轮之间等待时长 / 速率;
  动画速率数值.textContent = `×${速率}`;
  switch (速率) {
    case 1:
      交换动画时长 = 500;
      大循环间隔时长 = 2000;
      break;
    case 2:
      交换动画时长 = 400;
      大循环间隔时长 = 1666;
      break;
    case 3:
      交换动画时长 = 300;
      大循环间隔时长 = 1333;
      break;
    case 4:
      交换动画时长 = 250;
      大循环间隔时长 = 1000;
      break;
  }
  数字过渡时长 = 交换动画时长;
  root.style.setProperty("--数字过渡时长", `${数字过渡时长}ms`);
}

function 初始化数字() {
  for (let i = 0; i < 数字数量; i++) {
    const 数字 = document.createElement("span");
    数字.className = "数字";
    数字区.appendChild(数字);
    const number = Math.floor(Math.random() * 101);
    数字.textContent = number.toString();
    数字.style.left = "0";
    数字.style.translate = `calc((${数字宽度} + ${数字间隙}) * ${i}) 0`;
    数字.setAttribute("索引", i);
  }

  for (let i = 0; i < 数字数量; i++) {
    const 数字索引 = document.createElement("p");
    数字索引.className = "数字索引";
    数字索引.textContent = `${i}`;
    数字区.appendChild(数字索引);
    数字索引.style.left = "0";
    数字索引.style.translate = `calc((${数字宽度} * ${
      0.5 + i
    } + ${数字间隙} * ${i}) - 50%) 0`;
  }
  const 左数字索引 = document.createElement("p");
  const 右数字索引 = document.createElement("p");
  左数字索引.textContent = "j";
  右数字索引.textContent = "j+1";
  左数字索引.className = "左数字索引";
  右数字索引.className = "右数字索引";
  数字区.append(左数字索引, 右数字索引);
}

function 生成动画_交换(左数字, 右数字) {
  const 临时索引 = 左数字.getAttribute("索引");
  左数字.setAttribute("索引", 右数字.getAttribute("索引"));
  右数字.setAttribute("索引", 临时索引);

  const 临时偏移 = 左数字.style.translate;
  左数字.style.translate = 右数字.style.translate;
  右数字.style.translate = 临时偏移;
}

function 生成内循环区(内循环索引数) {
  const 内循环区 = document.createElement("p");
  内循环区.className = "内循环区";
  const 循环文本 = document.createElement("span");
  循环文本.className = "循环文本";
  循环文本.textContent = "内循环";
  const 内循环索引 = document.createElement("span");
  内循环索引.className = "内循环索引";
  内循环索引.textContent = "j";
  const 等号 = document.createElement("span");
  等号.className = "等号";
  等号.textContent = "=";
  const 内循环索引数字 = document.createElement("span");
  内循环索引数字.className = "内循环索引数字";
  内循环索引数字.textContent = `${内循环索引数}`;
  const 内循环轮 = document.createElement("span");
  内循环轮.className = "内循环轮";
  const 内循环轮数字 = document.createElement("span");
  内循环轮数字.className = "内循环轮数字";
  内循环轮数字.textContent = `${内循环索引数 + 1}`;
  内循环轮.innerHTML = `第${内循环轮数字.outerHTML}次`;

  内循环区.append(循环文本, 内循环索引, 等号, 内循环索引数字, 内循环轮);
  代码演示区.appendChild(内循环区);
  内循环池.push(内循环区);
}

function 设置外循环轮数字(外循环索引数) {
  const 外循环索引数字 = document.querySelector(".外循环索引数字");
  外循环索引数字.textContent = 外循环索引数.toString();
  const 外循环轮数字 = document.querySelector(".外循环轮数字");
  外循环轮数字.textContent = `${外循环索引数 + 1}`;
  const 外循环区 = document.querySelector(".外循环区");
  外循环区.classList.add("外循环数字动画");
  setTimeout(() => {
    外循环区.classList.remove("外循环数字动画");
  }, 1000);
}

function 重置参数() {
  排序过程正在运行 = false;
  const 数字组 = 数字区.querySelectorAll(".数字");
  const 数字索引组 = 数字区.querySelectorAll(".数字索引");
  const 原左数字索引 = 数字区.querySelector(".左数字索引");
  const 原右数字索引 = 数字区.querySelector(".右数字索引");

  if (数字组 !== null) {
    for (const 数字 of 数字组) {
      数字.remove();
    }
  }

  if (数字索引组 !== null) {
    for (const 索引 of 数字索引组) {
      索引.remove();
    }
  }

  if (原左数字索引 !== null) 原左数字索引.remove();
  if (原右数字索引 !== null) 原右数字索引.remove();

  初始化数字();

  const 外循环索引数字 = document.querySelector(".外循环索引数字");
  外循环索引数字.textContent = "";
  const 外循环轮数字 = document.querySelector(".外循环轮数字");
  外循环轮数字.textContent = "";

  const 外循环区 = document.querySelector(".外循环区");
  for (const 内循环区 of 内循环池) {
    内循环区.remove();
  }
  内循环池.length = 0;

  if (localStorage.getItem("动画速率") === null) {
    localStorage.setItem("动画速率", 动画速率.value);
  } else {
    动画速率.value = localStorage.getItem("动画速率");
    设置动画速率(parseInt(动画速率.value, 10));
  }
}
