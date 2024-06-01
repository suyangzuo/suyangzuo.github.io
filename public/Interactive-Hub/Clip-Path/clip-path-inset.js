const 向内操作分区 = 操作区.querySelector(".向内操作分区");
const 向内修剪标签组 = 向内操作分区.querySelectorAll(".向内修剪标签");
const 向内修剪滑块组 = 向内操作分区.querySelectorAll(".向内修剪滑块");
const 向内修剪数值组 = 向内操作分区.querySelectorAll(".向内修剪数值");
const 向内修剪方向按钮组 = 向内操作分区.querySelectorAll(".操作选项按钮");
const 向内修剪图分区 = 图像区.querySelector(".向内修剪图分区");
const 向内修剪代码容器 = 向内修剪图分区.querySelector(".代码容器");
const 向内图像 = 向内修剪图分区.querySelector(".图像");
const 向内修剪区重置按钮 = 操作区.querySelector("#向内修剪重置");
let 当前可用方向按钮 = 向内修剪方向按钮组[0];
当前可用方向按钮.style.filter = "brightness(100%)";
let 当前可用方向标签 = 向内修剪标签组[0];
当前可用方向标签.style.visibility = "visible";
当前可用方向标签.style.opacity = "1";

for (const 向内修剪数值元素 of 向内修剪数值组) {
  向内修剪数值元素.textContent = "0";
  const 百分比符号 = document.createElement("span");
  百分比符号.className = "向内修剪数值-百分比符号";
  百分比符号.textContent = "%";
  向内修剪数值元素.appendChild(百分比符号);
}

向内修剪方向按钮组.forEach((方向按钮, index) => {
  方向按钮.addEventListener("click", () => {
    if (方向按钮 === 当前可用方向按钮) return;
    方向按钮.style.filter = "brightness(100%)";
    当前可用方向按钮.style.removeProperty("filter");
    当前可用方向按钮 = 方向按钮;

    向内修剪标签组[index].style.visibility = "visible";
    向内修剪标签组[index].style.opacity = "1";
    当前可用方向标签.style.removeProperty("visibility");
    当前可用方向标签.style.removeProperty("opacity");
    当前可用方向标签 = 向内修剪标签组[index];
  });
});

for (const 向内修剪滑块 of 向内修剪滑块组) {
  向内修剪滑块.addEventListener("input", () => {
    const 向内修剪值 = parseInt(向内修剪滑块.value, 10);
    const 方向 = 向内修剪滑块.id.at(-1);
    root.style.setProperty(`--向内修剪比例-${方向}`, `${向内修剪值}%`);
    const 向内修剪数值元素 = 向内修剪滑块.nextElementSibling;
    向内修剪数值元素.textContent = `${向内修剪值}`;
    const 百分比符号 = document.createElement("span");
    百分比符号.className = "向内修剪数值-百分比符号";
    百分比符号.textContent = "%";
    向内修剪数值元素.appendChild(百分比符号);

    向内图像.style.clipPath = `${生成向内修剪代码()}`;
    更新向内修剪代码区代码();
  });

  向内修剪滑块.addEventListener("mouseup", () => {
    if (向内修剪代码容器.classList.contains("代码容器可见")) {
      刷新代码格式化脚本();
    }
  });
}

function 获取向内修剪比例对象() {
  const 上 = rootStyle.getPropertyValue("--向内修剪比例-上");
  const 右 = rootStyle.getPropertyValue("--向内修剪比例-右");
  const 下 = rootStyle.getPropertyValue("--向内修剪比例-下");
  const 左 = rootStyle.getPropertyValue("--向内修剪比例-左");
  return {
    上: 上,
    右: 右,
    下: 下,
    左: 左,
  };
}

function 生成向内修剪代码() {
  const 向内修剪比例对象 = 获取向内修剪比例对象();
  return `inset(${向内修剪比例对象.上} ${向内修剪比例对象.右} ${向内修剪比例对象.下} ${向内修剪比例对象.左})`;
}

function 更新向内修剪代码区代码() {
  //范围型触发input事件时，如果运行prism.js，会严重影响性能，因此需要将格式化代码分离出去
  const 代码元素 = 向内修剪代码容器.querySelector("code");
  const 代码前缀 = "目标元素 {\n";
  const 代码后缀 = "\n}";
  代码元素.innerHTML = `${代码前缀}  clip-path: ${生成向内修剪代码()};${代码后缀}`;
}

向内修剪区重置按钮.addEventListener("click", () => {
  重置向内修剪参数();
  更新向内修剪代码区代码();
  if (向内修剪代码容器.classList.contains("代码容器可见")) {
    刷新代码格式化脚本();
  }
});

function 重置向内修剪参数() {
  root.style.setProperty("--向内修剪比例-上", "0%");
  root.style.setProperty("--向内修剪比例-右", "0%");
  root.style.setProperty("--向内修剪比例-下", "0%");
  root.style.setProperty("--向内修剪比例-左", "0%");
  向内图像.style.removeProperty("clip-path");
  向内修剪代码容器.classList.remove("代码容器可见");
  for (const 向内修剪滑块 of 向内修剪滑块组) {
    向内修剪滑块.value = 0;
    const 向内修剪数值元素 = 向内修剪滑块.nextElementSibling;
    向内修剪数值元素.textContent = "0";
    const 百分比符号 = document.createElement("span");
    百分比符号.className = "向内修剪数值-百分比符号";
    百分比符号.textContent = "%";
    向内修剪数值元素.appendChild(百分比符号);
  }
}
