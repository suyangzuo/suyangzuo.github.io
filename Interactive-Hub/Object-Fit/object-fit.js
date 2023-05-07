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
const x轴 = document.querySelector("#对象位置-X轴");
const y轴 = document.querySelector("#对象位置-Y轴");
let x轴数字文本 = x轴数字区.innerText;
let y轴数字文本 = y轴数字区.innerText;
let x轴百分比 = x轴.value;
let y轴百分比 = y轴.value;
let 轴宽度 = parseInt(window.getComputedStyle(x轴).width, 10);
let 横向初始位移 = window.getComputedStyle(x轴数字区).left;

x轴.oninput = 修改X轴百分比;
y轴.oninput = 修改Y轴百分比;

function 修改X轴百分比() {
  x轴百分比 = x轴.value;
  x轴数字区.innerText = `${x轴百分比}%`;
  x轴数字区.style.left = `calc(${x轴百分比}px + ${横向初始位移})`;
  图像.style.objectPosition = `${x轴百分比}% ${y轴百分比}%`;
}

function 修改Y轴百分比() {
  y轴百分比 = y轴.value;
  y轴数字区.innerText = `${y轴百分比}%`;
  y轴数字区.style.left = `calc(${y轴百分比}px + ${横向初始位移})`;
  x轴数字区.style.left = `calc(${x轴百分比}px + ${横向初始位移})`;
  图像.style.objectPosition = `${x轴百分比}% ${y轴百分比}%`;
}
