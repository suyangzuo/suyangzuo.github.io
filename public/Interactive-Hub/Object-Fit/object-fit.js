const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);

const 图像区 = document.querySelector(".对象匹配-图像区");
const 图像 = 图像区.querySelector("img");
const 溢出隐藏checkbox = document.querySelector("#溢出隐藏");
const 图像尺寸原始checkbox = document.querySelector("#图像尺寸-原始大小");
const 图像尺寸百分百checkbox = document.querySelector("#图像尺寸-百分之百");
const 图像尺寸放大checkbox = document.querySelector("#图像尺寸-放大");

function 溢出隐藏被修改() {
  if (溢出隐藏checkbox.checked) {
    图像区.style.overflow = "hidden";
  } else {
    图像区.style.overflow = "visible";
  }
}

溢出隐藏checkbox.onchange = 溢出隐藏被修改;

function 修改图像尺寸() {
  if (图像尺寸原始checkbox.checked) {
    图像.style.width = "auto";
    图像.style.height = "auto";
    图像.style.opacity = "0.75";
  } else if (图像尺寸百分百checkbox.checked) {
    图像.style.width = "100%";
    图像.style.height = "100%";
    图像.style.opacity = "0.75";
  } else if (图像尺寸放大checkbox.checked) {
    图像.style.width = "150%";
    图像.style.height = "150%";
    图像.style.opacity = "0.25";
  }
}

图像尺寸原始checkbox.onchange = 修改图像尺寸;
图像尺寸百分百checkbox.onchange = 修改图像尺寸;
图像尺寸放大checkbox.onchange = 修改图像尺寸;

const 对象匹配控件类型操作区 = document.querySelector(".控件类型操作区");
const 对象匹配组 = 对象匹配控件类型操作区.querySelectorAll(".控件子组");

Array.from(对象匹配组).forEach((控件子组) => {
  const 代码 = 控件子组.querySelector(".代码");
  const 单选框 = 控件子组.querySelector(".单选框");
  单选框.onchange = () => {
    let index = Array.from(对象匹配组).indexOf(控件子组);
    let styleCode = 对象匹配组[index].querySelector(".代码").innerText;
    图像.style.objectFit = `${styleCode}`;
  };
});

const x轴数字区 = document.querySelector(".X轴数字区");
const y轴数字区 = document.querySelector(".Y轴数字区");
const 数字区宽度 = parseInt(window.getComputedStyle(x轴数字区).width, 10);
const x轴 = document.querySelector("#对象位置-X轴");
const y轴 = document.querySelector("#对象位置-Y轴");
const 轴Label = document.querySelector(".label-x轴");
const 轴Label宽度 = window.getComputedStyle(轴Label).width;
let x轴百分比 = x轴.value;
let y轴百分比 = y轴.value;
// let 横向初始位移 = window.getComputedStyle(x轴数字区).left;
const 初始百分比 = 50;
const 轴正负修正 = 100;
const 拇指宽度 = 10;
let 拇指修正 = 0;

x轴.oninput = 修改X轴百分比;
y轴.oninput = 修改Y轴百分比;

function 修改X轴百分比() {
  x轴百分比 = x轴.value;
  x轴数字区.innerText = `${x轴百分比}%`;
  let 真实百分比 = (Number(x轴百分比) + 100) / 3;
  root.style.setProperty("--进度-X轴", `${真实百分比}%`);
  const 值 = x轴.value;
  const 最小值 = x轴.min ? x轴.min : 0;
  const 最大值 = x轴.max ? x轴.max : 100;
  const 新值 = Number(((值 - 最小值) * 100) / (最大值 - 最小值));
  x轴数字区.style.left = `calc(${新值}% + ${8 - 新值 * 0.15}px)`;
  // if (x轴百分比 <= -100) {
  //   拇指修正 = 5;
  // } else if (x轴百分比 <= -70) {
  //   拇指修正 = 4;
  // } else if (x轴百分比 <= -40) {
  //   拇指修正 = 3;
  // } else if (x轴百分比 <= -10) {
  //   拇指修正 = 2;
  // } else if (x轴百分比 <= 20) {
  //   拇指修正 = 1;
  // } else if (x轴百分比 <= 50) {
  //   拇指修正 = 0;
  // } else if (x轴百分比 <= 80) {
  //   拇指修正 = -1;
  // } else if (x轴百分比 <= 110) {
  //   拇指修正 = -2;
  // } else if (x轴百分比 <= 140) {
  //   拇指修正 = -3;
  // } else if (x轴百分比 <= 170) {
  //   拇指修正 = -4;
  // } else {
  //   拇指修正 = -5;
  // }

  // x轴数字区.style.left = `calc(${x轴百分比}px + ${轴Label宽度} + ${轴正负修正}px - ${
  //   数字区宽度 / 2
  // }px + ${拇指修正}px)`;
  图像.style.objectPosition = `${x轴百分比}% ${y轴百分比}%`;
}

function 修改Y轴百分比() {
  y轴百分比 = y轴.value;
  y轴数字区.innerText = `${y轴百分比}%`;
  let 真实百分比 = (Number(y轴百分比) + 100) / 3;
  root.style.setProperty("--进度-Y轴", `${真实百分比}%`);
  const 值 = y轴.value;
  const 最小值 = y轴.min ? y轴.min : 0;
  const 最大值 = y轴.max ? y轴.max : 100;
  const 新值 = Number(((值 - 最小值) * 100) / (最大值 - 最小值));
  y轴数字区.style.left = `calc(${新值}% + ${8 - 新值 * 0.15}px)`;
  // if (y轴百分比 <= -100) {
  //   拇指修正 = 5;
  // } else if (y轴百分比 <= -70) {
  //   拇指修正 = 4;
  // } else if (y轴百分比 <= -40) {
  //   拇指修正 = 3;
  // } else if (y轴百分比 <= -10) {
  //   拇指修正 = 2;
  // } else if (y轴百分比 <= 20) {
  //   拇指修正 = 1;
  // } else if (y轴百分比 <= 50) {
  //   拇指修正 = 0;
  // } else if (y轴百分比 <= 80) {
  //   拇指修正 = -1;
  // } else if (y轴百分比 <= 110) {
  //   拇指修正 = -2;
  // } else if (y轴百分比 <= 140) {
  //   拇指修正 = -3;
  // } else if (y轴百分比 <= 170) {
  //   拇指修正 = -4;
  // } else {
  //   拇指修正 = -5;
  // }
  // y轴数字区.style.left = `calc(${y轴百分比}px + ${轴Label宽度} + ${轴正负修正}px - ${
  //   数字区宽度 / 2
  // }px + ${拇指修正}px)`;
  图像.style.objectPosition = `${x轴百分比}% ${y轴百分比}%`;
}

window.addEventListener("load", () => {
  const 重置按钮 = document.getElementsByClassName("重置按钮")[0];
  重置按钮.addEventListener("click", 重置参数);
});

function 重置参数() {
  溢出隐藏checkbox.checked = false;
  图像尺寸原始checkbox.checked = true;
  const 对象匹配控件 = document.querySelector(".控件-对象匹配");
  const 对象匹配控件子组 = 对象匹配控件.querySelectorAll(".控件子组");
  对象匹配控件子组.forEach((控件) => {
    const 单选框 = 控件.querySelector("input[type='radio']");
    单选框.checked = false;
  });
  x轴.value = 50;
  y轴.value = 50;
  修改X轴百分比();
  修改Y轴百分比();
  图像.style.width = "auto";
  图像.style.height = "auto";
  图像.style.opacity = "0.75";
  图像区.style.overflow = "visible";
}
