const root = document.querySelector(":root");
const 变量区 = document.querySelector(".变量区");
const 变量容器区 = 变量区.querySelector(".变量容器区");
const 内存容量滑块 = document.getElementById("内存容量");
const 变量容器组 = document.getElementsByClassName("变量容器");

let 程序颜色 = "black";
let 内存容量 = parseInt(内存容量滑块.value, 10);
const 内存位数 = 32;
let 内存起始地址_10进制 = Math.floor(Math.random() * 100001);
let 空闲内存表 = [{ 起始位置: 0, 容量: 内存容量 - 1 }];

const 内存占用表 = new Map();
内存占用表.set("Photoshop", { 起始位置: 0, 容量: 64 });
内存占用表.set("百度网盘", { 起始位置: 0, 容量: 8 });
内存占用表.set("微信", { 起始位置: 0, 容量: 24 });
内存占用表.set("Edge 浏览器", { 起始位置: 0, 容量: 96 });
内存占用表.set("网易云音乐", { 起始位置: 0, 容量: 16 });

初始化内存();

内存容量滑块.addEventListener("input", () => {
  内存容量 = parseInt(内存容量滑块.value, 10);
  const 滑块值 = 内存容量滑块.parentElement.querySelector(".滑块值");
  滑块值.textContent = 内存容量滑块.value;
  空闲内存表 = [{ 起始位置: 0, 容量: 内存容量 - 1 }];
  初始化内存();
});

function 初始化内存() {
  变量容器区.innerHTML = "";
  for (let i = 0; i < 内存容量; i++) {
    const 变量容器 = document.createElement("div");
    变量容器.className = "变量容器";
    变量容器区.appendChild(变量容器);

    let 内存地址_10进制 = 内存起始地址_10进制 + i;
    变量容器.setAttribute("内存地址-10进制", 内存地址_10进制);
    变量容器.setAttribute("内存地址-16进制", 获取16进制内存地址(内存地址_10进制, 内存位数));
    变量容器.setAttribute("索引", i);
  }
  for (const 应用键值对 of 内存占用表) {
    //键：应用名称
    //值：{起始位置，容量}
    程序颜色 = 生成随机颜色();
    添加内存分配示意(应用键值对);
    空闲内存表 = 数组洗牌(空闲内存表);
    const 新的空闲内存表 = 更新空闲内存表(应用键值对);
    if (新的空闲内存表.length > 0) {
      空闲内存表 = 新的空闲内存表;
    }
  }
}

function 获取16进制内存地址(内存地址_10进制, 内存位数) {
  const 内存地址_16进制 = 内存地址_10进制.toString(16);
  return `0x${"0".repeat(内存位数 / 4 - 内存地址_16进制.length)}${内存地址_16进制}`;
}

function 更新空闲内存表(应用键值对) {
  //键：应用名称
  //值：{起始位置，容量}
  const 新的空闲内存表 = [];
  const 应用占用内存 = 应用键值对[1].容量;
  let 已分配内存 = false;
  for (let i = 0; i < 空闲内存表.length; i++) {
    if (空闲内存表[i].容量 < 应用占用内存 || 已分配内存) {
      新的空闲内存表.push(空闲内存表[i]);
      continue;
    }

    已分配内存 = true;
    const 最高位置 = 空闲内存表[i].起始位置 + 空闲内存表[i].容量 - 应用占用内存;
    const 最低位置 = 空闲内存表[i].起始位置;
    const 起始位置 = Math.floor(Math.random() * (最高位置 - 最低位置 + 1) + 最低位置);
    应用键值对[1].起始位置 = 起始位置;
    if (起始位置 === 空闲内存表[i].起始位置) {
      空闲内存表[i].起始位置 = 空闲内存表[i].起始位置 + 应用占用内存;
      空闲内存表[i].容量 = 空闲内存表[i].容量 - 应用占用内存;
      新的空闲内存表.push(空闲内存表[i]);
    } else if (起始位置 + 应用占用内存 === 空闲内存表[i].起始位置 + 空闲内存表[i].容量) {
      空闲内存表[i].容量 = 空闲内存表[i].容量 - 应用占用内存;
      新的空闲内存表.push(空闲内存表[i]);
    } else {
      const 应用前方未占用内存 = {
        起始位置: 空闲内存表[i].起始位置,
        容量: 起始位置 - 空闲内存表[i].起始位置,
      };
      const 应用后方未占用内存 = {
        起始位置: 起始位置 + 应用占用内存,
        容量: 空闲内存表[i].起始位置 + 空闲内存表[i].容量 - (起始位置 + 应用占用内存),
      };
      新的空闲内存表.push(应用前方未占用内存);
      新的空闲内存表.push(应用后方未占用内存);
    }

    const 背景色 = 程序颜色;
    let 应用内存顺序 = 1;
    for (let j = 应用键值对[1].起始位置; j < 应用键值对[1].起始位置 + 应用占用内存; j++) {
      变量容器组[j].classList.add("已占用");
      变量容器组[j].setAttribute("应用名称", 应用键值对[0]);
      变量容器组[j].style.backgroundColor = 背景色;
      const 本应用内存顺序 = document.createElement("span");
      本应用内存顺序.className = "本应用内存顺序";
      本应用内存顺序.textContent = 应用内存顺序;
      变量容器组[j].appendChild(本应用内存顺序);
      应用内存顺序++;
    }
  }
  return 新的空闲内存表;
}

function 添加内存分配示意(程序) {
  const 内存分配区 = document.querySelector(".内存分配区");
  const 内存分配分区 = document.createElement("div");
  内存分配分区.className = "内存分配分区";
  内存分配区.appendChild(内存分配分区);
  const 内存分配名称 = document.createElement("h4");
  内存分配名称.className = "内存分配名称";
  内存分配分区.appendChild(内存分配名称);
  const 名称颜色 = document.createElement("span");
  名称颜色.className = "名称颜色";
  名称颜色.style.backgroundColor = 程序颜色;
  const 名称文本 = document.createElement("span");
  名称文本.className = "名称文本";
  名称文本.textContent = 程序[0];
  内存分配名称.append(名称颜色, 名称文本);
}

function 生成随机颜色() {
  const red = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  return `rgba(${red},${blue},${green},0.75)`;
}

function 数组洗牌(数组) {
  for (let i = 数组.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [数组[i], 数组[j]] = [数组[j], 数组[i]];
  }
  return 数组;
}
