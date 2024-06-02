const 圆形修剪图分区 = 图像区.querySelector(".圆形修剪图分区");
const 圆形图像容器 = 图像区.querySelector(".圆形图像容器");
const 圆形图 = 圆形图像容器.querySelector(".图像");
const 圆形操作分区 = 操作区.querySelector(".圆形操作分区");
const 圆形半径滑块 = 圆形操作分区.querySelector("#圆形半径滑块");
const 圆形半径数值 = 圆形操作分区.querySelector(".滑块数据");
const 圆形圆心区 = 圆形修剪图分区.querySelector(".圆形圆心区");
const 圆形圆心水平数值 = 圆形圆心区.querySelector(".圆心水平数值");
const 圆形圆心垂直数值 = 圆形圆心区.querySelector(".圆心垂直数值");
const 圆形代码容器 = 圆形修剪图分区.querySelector(".圆形修剪代码容器");
const 圆形代码区 = 圆形代码容器.querySelector("code");
const 圆形代码按钮 = 圆形操作分区.querySelector(".圆形修剪代码按钮");
const 圆形重置按钮 = 圆形操作分区.querySelector("#圆形修剪重置");
const 圆形圆心对象 = {
  水平: 0,
  垂直: 0,
};
let 圆形半径 = 圆形半径滑块.value;
let 已定义圆心_圆形 = false;
let 已显示代码_圆形 = false;

圆形半径滑块.addEventListener("input", () => {
  圆形半径 = 圆形半径滑块.value;
  root.style.setProperty("--圆形半径", `${圆形半径}%`);
  圆形半径数值.textContent = `${圆形半径}`;

  if (已定义圆心_圆形) {
    圆形图.style.clipPath = 生成圆形修剪值代码(
      `${圆形圆心对象.水平}%`,
      `${圆形圆心对象.垂直}%`,
      `${圆形半径}%`,
    );
    更新圆形修剪代码区代码();
  }
});

圆形半径滑块.addEventListener("mouseup", () => {
  if (已显示代码_圆形) {
    刷新代码格式化脚本();
  }
});

圆形图像容器.addEventListener("click", (event) => {
  const 视口_x = event.clientX;
  const 视口_y = event.clientY;
  const 边界矩形 = 圆形图像容器.getBoundingClientRect();
  const 边界_x = 边界矩形.left;
  const 边界_y = 边界矩形.top;
  const left = 视口_x - 边界_x;
  const top = 视口_y - 边界_y;
  const 容器样式 = window.getComputedStyle(圆形图像容器);
  const 容器宽度 = parseInt(容器样式.width, 10);
  const 容器高度 = parseInt(容器样式.height, 10);
  const 水平比例 = (left / 容器宽度) * 100;
  const 垂直比例 = (top / 容器高度) * 100;
  圆形圆心区.style.top = `${垂直比例}%`;
  圆形圆心区.style.left = `${水平比例}%`;
  圆形圆心水平数值.textContent = `${水平比例.toFixed(0)}`;
  圆形圆心垂直数值.textContent = `${垂直比例.toFixed(0)}`;
  if (!圆形圆心区.classList.contains("圆心区可见")) {
    圆形圆心区.classList.add("圆心区可见");
  }
  圆形圆心对象.水平 = 水平比例;
  圆形圆心对象.垂直 = 垂直比例;
  已定义圆心_圆形 = true;

  圆形图.style.clipPath = 生成圆形修剪值代码(
    `${水平比例}%`,
    `${垂直比例}%`,
    `${圆形半径}%`,
  );
  更新圆形修剪代码区代码();
  if (已显示代码_圆形) {
    刷新代码格式化脚本();
  }
});

圆形代码按钮.addEventListener("click", () => {
  已显示代码_圆形 = !已显示代码_圆形;
  /*if (已显示代码_圆形) {
    刷新代码格式化脚本();
  }*/
});

圆形重置按钮.addEventListener("click", () => {
  重置圆形修剪参数();
});

function 生成圆形修剪值代码(圆心水平值, 圆心垂直值, 半径值) {
  return `circle(${半径值} at ${圆心水平值} ${圆心垂直值})`;
}

function 更新圆形修剪代码区代码() {
  //范围型触发input事件时，如果运行prism.js，会严重影响性能，因此需要将格式化代码分离出去
  const 代码前缀 = "目标元素 {\n";
  const 代码后缀 = "\n}";
  圆形代码区.innerHTML = `${代码前缀}  clip-path: ${生成圆形修剪值代码(
    `${圆形圆心对象.水平.toFixed(0)}%`,
    `${圆形圆心对象.垂直.toFixed(0)}%`,
    `${圆形半径}%`,
  )};${代码后缀}`;
}

function 重置圆形修剪参数() {
  root.style.setProperty("--圆形半径", "0%");
  圆形图.style.removeProperty("clip-path");
  圆形代码容器.classList.remove("代码容器可见");
  圆形代码按钮.innerHTML = '<i class="fa-solid fa-code"></i>';
  圆形代码区.innerHTML = "";
  圆形半径滑块.value = 0;
  圆形半径 = 圆形半径滑块.value;
  圆形半径数值.textContent = `${圆形半径}`;
  已定义圆心_圆形 = false;
  已显示代码_圆形 = false;
  圆形圆心对象.水平 = 0;
  圆形圆心对象.垂直 = 0;
  圆形圆心区.classList.remove("圆心区可见");
  圆形圆心区.style.top = "50%";
  圆形圆心区.style.left = "50%";
}
