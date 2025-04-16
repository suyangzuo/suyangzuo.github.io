const root = document.querySelector(":root");
const 变量区 = document.querySelector(".变量区");
const 变量容器区 = 变量区.querySelector(".变量容器区");
const 内存容量滑块 = document.getElementById("内存容量");
const 变量容器组 = document.getElementsByClassName("变量容器");

let 内存容量 = parseInt(内存容量滑块.value, 10);
const 内存位数 = 32;
let 内存起始地址_10进制 = Math.floor(Math.random() * 100001);
const 未占用内存组 = [{ 起始位置: 0, 容量: 内存容量 - 1 }];

const 内存占用表 = new Map();
内存占用表.set("Adobe Photoshop CC 2025", { 起始位置: 0, 容量: 64 });
内存占用表.set("百度网盘", { 起始位置: 0, 容量: 8 });
内存占用表.set("微信", { 起始位置: 0, 容量: 24 });
内存占用表.set("Edge 浏览器", { 起始位置: 0, 容量: 96 });
内存占用表.set("网易云音乐", { 起始位置: 0, 容量: 16 });

初始化内存();

内存容量滑块.addEventListener("input", () => {
  内存容量 = parseInt(内存容量滑块.value, 10);
  const 滑块值 = 内存容量滑块.parentElement.querySelector(".滑块值");
  滑块值.textContent = 内存容量滑块.value;
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
  }

  for (const 应用键值对 of 内存占用表) {
    更新未占用内存组(应用键值对);
  }
}

function 获取16进制内存地址(内存地址_10进制, 内存位数) {
  const 内存地址_16进制 = 内存地址_10进制.toString(16);
  return `0x${"0".repeat(内存位数 / 4 - 内存地址_16进制.length)}${内存地址_16进制}`;
}

function 更新未占用内存组(应用键值对) {
  const 应用占用内存 = 应用键值对[1].容量;
  for (let i = 0; i < 未占用内存组.length; i++) {
    if (未占用内存组[i].容量 < 应用占用内存) {
      continue;
    }

    应用键值对[1].起始位置 = 未占用内存组[i].起始位置;
    未占用内存组[i].起始位置 = 未占用内存组[i].起始位置 + 应用占用内存;
    未占用内存组[i].容量 = 未占用内存组[i].容量 - 应用占用内存;

    const 背景色 = 生成随机颜色();
    for (let j = 应用键值对[1].起始位置; j < 应用键值对[1].起始位置 + 应用占用内存; j++) {
      变量容器组[j].classList.add("已占用");
      变量容器组[j].style.backgroundColor = 背景色;
    }
  }
}

function 生成随机颜色() {
  const red = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  return `rgba(${red},${blue},${green},0.75)`;
}
