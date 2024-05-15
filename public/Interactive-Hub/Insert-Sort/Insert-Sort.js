const 排序区 = document.getElementById("排序区");
const 数字区 = 排序区.querySelector(".数字区");
const 控制区 = 排序区.querySelector(".控制区");
const 代码演示区 = document.querySelector(".代码演示区");
const 动画速率 = document.getElementById("动画速率");
const 动画速率数值 = document.getElementById("动画速率数值");
const 排列顺序 = document.getElementById("排列顺序");
const 播放音效复选框 = document.getElementById("播放音效");
const 开始按钮 = document.getElementById("开始运行");
const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 数字宽度 = rootStyle.getPropertyValue("--数字宽度");
const 数字间隙 = rootStyle.getPropertyValue("--数字间隙");
const 内循环池 = [];
const 延时函数池 = [];
const 重置按钮 = document.querySelector(".重置按钮");
const 数字数量 = 10;

const checkedAudio = new Audio("/Audios/Checked.mp3");
const uncheckedAudio = new Audio("/Audios/Unchecked.mp3");

if (localStorage.getItem("插入排序法-升序排列") === null) {
  localStorage.setItem("插入排序法-升序排列", 排列顺序.checked);
} else {
  排列顺序.checked = JSON.parse(localStorage.getItem("插入排序法-升序排列"));
}

if (localStorage.getItem("插入排序法-播放音效") === null) {
  localStorage.setItem("插入排序法-播放音效", 播放音效复选框.checked);
} else {
  播放音效复选框.checked = JSON.parse(
    localStorage.getItem("插入排序法-播放音效"),
  );
}

const 排列顺序标签 = 控制区.querySelector(".排列顺序标签");
let 升序排列 = 排列顺序.checked;
let 播放音效 = 播放音效复选框.checked;

let 排序过程正在运行 = false;

const 原始数字过渡时长 = parseInt(rootStyle.getPropertyValue("--数字过渡时长"));
const 原始交换动画时长 = 1000;
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

const 数字索引组 = document.getElementsByClassName("数字索引");

if (localStorage.getItem("插入排序法-动画速率") === null) {
  localStorage.setItem("插入排序法-动画速率", 动画速率.value);
} else {
  动画速率.value = localStorage.getItem("插入排序法-动画速率");
  设置动画速率(parseInt(动画速率.value, 10));
}

重置按钮.addEventListener("click", 重置参数);

排列顺序.addEventListener("click", (event) => {
  //防止排序过程中修改排序规则
  if (排序过程正在运行) event.preventDefault();
});

排列顺序.addEventListener("input", (event) => {
  localStorage.setItem("插入排序法-升序排列", 排列顺序.checked);
  升序排列 = 排列顺序.checked;
  const 数字记录框描述 = 数字区.querySelector(".数字记录框描述");
  数字记录框描述.textContent = 升序排列 ? "最小数索引" : "最大数索引";
});

播放音效复选框.addEventListener("input", (event) => {
  localStorage.setItem("插入排序法-播放音效", 播放音效复选框.checked);
  播放音效 = 播放音效复选框.checked;
});

动画速率.addEventListener("input", () => {
  设置动画速率(parseInt(动画速率.value, 10));
  localStorage.setItem("插入排序法-动画速率", 动画速率.value);
});

开始按钮.addEventListener("click", async () => {
  if (排序过程正在运行) return;
  排序过程正在运行 = true;
  屏蔽元素交互(开始按钮);
  屏蔽元素交互(排列顺序标签);
  const i索引 = 数字区.querySelector(".i索引");
  const j索引 = 数字区.querySelector(".j索引");
  const 数字记录框 = 数字区.querySelector(".数字记录框");
  for (let i = 1; i < 数字组.length; i++) {
    if (!排序过程正在运行) return;
    设置外循环轮数字(i);
    i索引.style.translate = `calc(${数字宽度} * ${
      0.5 + i
    } + ${数字间隙} * ${i} - 50%)`;
    j索引.style.translate = `calc(${数字宽度} * ${i - 0.5} + ${数字间隙} * ${
      i - 1
    } - 50%)`;
    数字记录框.style.translate = `calc((${数字宽度} * ${
      i + 0.5
    } + ${数字间隙} * ${i}) - 50%) 45px`;

    await sleep(大循环间隔时长);
    if (排序过程正在运行) {
      i索引.style.opacity = "1";
    }

    await sleep(交换前等待时长);
    if (!排序过程正在运行) return;
    数字组[i].classList.add("操作中数字");
    const 本轮待插入数字 = document.createElement("span");
    本轮待插入数字.className = "数字";
    本轮待插入数字.style.border = "none";
    本轮待插入数字.textContent = 数字组[i].textContent;
    本轮待插入数字.style.translate = 数字组[i].style.translate;
    数字区.appendChild(本轮待插入数字);

    await sleep(交换前等待时长);
    if (!排序过程正在运行) return;
    数字记录框.style.opacity = "1";

    await sleep(交换前等待时长);
    if (!排序过程正在运行) return;
    本轮待插入数字.style.translate = 数字记录框.style.translate;
    await sleep(数字过渡时长);
    if (!排序过程正在运行) return;
    本轮待插入数字.remove();
    const 数字框内数字 = document.createElement("span");
    数字框内数字.className = "数字记录框内数字";
    数字框内数字.textContent = 数字组[i].textContent;
    数字记录框.appendChild(数字框内数字);

    let 待插入数字 = parseInt(数字组[i].textContent, 10);

    await sleep(两轮之间等待时长);
    if (!排序过程正在运行) return;
    if (排序过程正在运行) {
      j索引.style.opacity = "1";
    }
    数字组[i].classList.remove("操作中数字");

    await sleep(两轮之间等待时长);
    if (!排序过程正在运行) return;
    let j = i - 1;
    while (j >= 0) {
      if (!排序过程正在运行) return;
      生成内循环区(j);

      await sleep(数字过渡时长);
      数字记录框.classList.add("操作中数字");
      数字组[j].classList.add("操作中数字");
      let j数字 = parseInt(数字组[j].textContent, 10);
      await sleep(数字过渡时长);
      if (!排序过程正在运行) return;

      if (j数字 <= 待插入数字) {
        if (播放音效) await uncheckedAudio.play();
        await sleep(两轮之间等待时长 > 1000 ? 1000 : 两轮之间等待时长);
        数字组[j].classList.remove("操作中数字");
        数字记录框.classList.remove("操作中数字");
        break;
      } else {
        if (播放音效) await checkedAudio.play();
        await sleep(250);
        const 待移动数字 = document.createElement("span");
        待移动数字.className = "数字";
        待移动数字.style.border = "none";
        待移动数字.textContent = 数字组[j].textContent;
        待移动数字.style.translate = 数字组[j].style.translate;
        数字区.appendChild(待移动数字);

        await sleep(数字过渡时长);
        if (!排序过程正在运行) return;
        待移动数字.style.translate = 数字组[j + 1].style.translate;

        await sleep(数字过渡时长);
        if (!排序过程正在运行) return;
        数字组[j + 1].textContent = 数字组[j].textContent;

        await sleep(数字过渡时长);
        if (!排序过程正在运行) return;
        待移动数字.remove();
        数字组[j].classList.remove("操作中数字");
        j索引.style.translate = `calc(${数字宽度} * ${
          j - 0.5
        } + ${数字间隙} * ${j - 1} - 50%)`;
        数字记录框.style.translate = `calc((${数字宽度} * ${
          j + 0.5
        } + ${数字间隙} * ${j}) - 50%) 45px`;
        j--;
      }
    }

    await sleep(两轮之间等待时长);
    if (!排序过程正在运行) return;
    数字框内数字.style.translate = "0 -70px";

    await sleep(数字过渡时长);
    if (!排序过程正在运行) return;
    数字组[j + 1].textContent = 数字框内数字.textContent;
    数字记录框.classList.remove("操作中数字");
    数字组[j + 1].classList.remove("操作中数字");

    await sleep(数字过渡时长);
    数字记录框.style.opacity = "0";
    await sleep(两轮之间等待时长);
    if (!排序过程正在运行) return;
    数字框内数字.remove();
    for (const 内循环区 of 内循环池) {
      内循环区.remove();
    }
    内循环池.length = 0;
  }
  恢复元素交互(排列顺序标签);
  恢复元素交互(开始按钮);
});

function sleep(duration) {
  return new Promise((resolve) => {
    if (!排序过程正在运行) return;
    setTimeout(resolve, duration);
  });
}

function 设置动画速率(速率) {
  交换前等待时长 = 原始交换前等待时长 - 200 * (速率 - 1);
  交换后等待时长 = 原始交换后等待时长 - 200 * (速率 - 1);
  本次数字恢复到下次数字变色时长 =
    原始本次数字恢复到下次数字变色时长 - 200 * (速率 - 1);
  两轮之间等待时长 =
    原始两轮之间等待时长 / 速率 < 500
      ? 500
      : 原始两轮之间等待时长 - 200 * (速率 - 1);
  动画速率数值.textContent = `×${速率}`;

  交换动画时长 =
    原始交换动画时长 - 100 * (速率 - 1) < 125
      ? 125
      : 原始交换动画时长 - 100 * (速率 - 1);
  大循环间隔时长 =
    2000 - 333 * (速率 - 1) < 250 ? 250 : 2000 - 333 * (速率 - 1);

  数字过渡时长 = 交换动画时长;

  const j索引 = 数字区.querySelector(".j索引");
  // j索引.style.transition = `${数字过渡时长}ms`;
  root.style.setProperty("--数字过渡时长", `${数字过渡时长}ms`);
}

function 初始化数字() {
  for (let i = 0; i < 数字数量; i++) {
    const 数字 = document.createElement("span");
    数字.className = "数字";
    数字区.appendChild(数字);
    const number = Math.floor(Math.random() * 101);
    数字.textContent = number.toString();
    数字.style.translate = `calc((${数字宽度} + ${数字间隙}) * ${i}) -50%`;
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
  const i索引 = document.createElement("p");
  const j索引 = document.createElement("p");
  i索引.textContent = "i";
  j索引.textContent = "j";
  i索引.className = "i索引";
  j索引.className = "j索引";
  数字区.append(i索引, j索引);

  const 数字记录框 = document.createElement("div");
  数字记录框.className = "数字记录框";
  const 数字记录框描述 = document.createElement("span");
  数字记录框描述.className = "数字记录框描述";
  数字记录框描述.textContent = "待插入数字";
  数字记录框.appendChild(数字记录框描述);
  数字区.appendChild(数字记录框);
}

async function 生成动画_交换(左数字, 右数字) {
  左数字.classList.add("交换中数字");
  右数字.classList.add("交换中数字");
  await sleep(交换前等待时长);

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
  内循环轮数字.textContent = `${内循环索引数}`;
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

function 屏蔽元素交互(元素) {
  元素.style.pointerEvents = "none";
  元素.style.filter = "brightness(50%)";
}

function 恢复元素交互(元素) {
  元素.style.pointerEvents = "all";
  元素.style.filter = "brightness(100%)";
}

function 重置参数() {
  排序过程正在运行 = false;
  const 数字组 = 数字区.querySelectorAll(".数字");
  const 数字索引组 = 数字区.querySelectorAll(".数字索引");
  const i索引 = 数字区.querySelector(".i索引");
  const j索引 = 数字区.querySelector(".j索引");
  i索引?.remove();
  j索引?.remove();

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

  const 数字记录框 = 数字区.querySelector(".数字记录框");
  数字记录框?.remove();

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

  if (localStorage.getItem("插入排序法-动画速率") === null) {
    localStorage.setItem("插入排序法-动画速率", 动画速率.value);
  } else {
    动画速率.value = localStorage.getItem("插入排序法-动画速率");
    设置动画速率(parseInt(动画速率.value, 10));
  }

  恢复元素交互(排列顺序标签);
  恢复元素交互(开始按钮);
}
