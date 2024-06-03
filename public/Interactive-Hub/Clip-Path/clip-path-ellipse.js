const 椭圆修剪图分区 = 图像区.querySelector(".椭圆修剪图分区");
const 椭圆图像容器 = 图像区.querySelector(".椭圆图像容器");
const 椭圆图 = 椭圆图像容器.querySelector(".图像");
const 椭圆操作分区 = 操作区.querySelector(".椭圆操作分区");
const 椭圆水平半径滑块 = 椭圆操作分区.querySelector("#椭圆水平半径滑块");
const 椭圆垂直半径滑块 = 椭圆操作分区.querySelector("#椭圆垂直半径滑块");
const 椭圆水平半径数值 =
  椭圆水平半径滑块.nextElementSibling.querySelector(".滑块数据");
const 椭圆垂直半径数值 =
  椭圆垂直半径滑块.nextElementSibling.querySelector(".滑块数据");
const 椭圆圆心区 = 椭圆修剪图分区.querySelector(".椭圆圆心区");
const 椭圆圆心水平数值 = 椭圆圆心区.querySelector(".圆心水平数值");
const 椭圆圆心垂直数值 = 椭圆圆心区.querySelector(".圆心垂直数值");
const 椭圆代码容器 = 椭圆修剪图分区.querySelector(".椭圆修剪代码容器");
const 椭圆代码区 = 椭圆代码容器.querySelector("code");
const 椭圆代码按钮 = 椭圆操作分区.querySelector(".椭圆修剪代码按钮");
const 椭圆重置按钮 = 椭圆操作分区.querySelector("#椭圆修剪重置");
const 椭圆圆心对象 = {
  水平: 0,
  垂直: 0,
};
let 椭圆水平半径 = 椭圆水平半径滑块.value;
let 椭圆垂直半径 = 椭圆垂直半径滑块.value;
let 已定义圆心_椭圆 = false;
let 已显示代码_椭圆 = false;

椭圆水平半径滑块.addEventListener("input", () => {
  椭圆图.style.transition = "none";
  椭圆水平半径 = 椭圆水平半径滑块.value;
  root.style.setProperty("--椭圆水平半径", `${椭圆水平半径}%`);
  椭圆水平半径数值.textContent = `${椭圆水平半径}`;

  if (已定义圆心_椭圆) {
    椭圆图.style.clipPath = 生成椭圆修剪值代码(
      `${椭圆圆心对象.水平}%`,
      `${椭圆圆心对象.垂直}%`,
      `${椭圆水平半径}%`,
      `${椭圆垂直半径}%`,
    );
    更新椭圆修剪代码区代码();
  }
});

椭圆垂直半径滑块.addEventListener("input", () => {
  椭圆图.style.transition = "none";
  椭圆垂直半径 = 椭圆垂直半径滑块.value;
  root.style.setProperty("--椭圆垂直半径", `${椭圆垂直半径}%`);
  椭圆垂直半径数值.textContent = `${椭圆垂直半径}`;

  if (已定义圆心_椭圆) {
    椭圆图.style.clipPath = 生成椭圆修剪值代码(
      `${椭圆圆心对象.水平}%`,
      `${椭圆圆心对象.垂直}%`,
      `${椭圆水平半径}%`,
      `${椭圆垂直半径}%`,
    );
    更新椭圆修剪代码区代码();
  }
});

椭圆水平半径滑块.addEventListener("mouseup", () => {
  椭圆图.style.removeProperty("transition");
  if (已显示代码_椭圆) {
    刷新代码格式化脚本();
  }
});

椭圆垂直半径滑块.addEventListener("mouseup", () => {
  椭圆图.style.removeProperty("transition");
  if (已显示代码_椭圆) {
    刷新代码格式化脚本();
  }
});

椭圆图像容器.addEventListener("click", (event) => {
  已定义圆心_椭圆 = true;
  const 视口_x = event.clientX;
  const 视口_y = event.clientY;
  const 边界矩形 = 椭圆图像容器.getBoundingClientRect();
  const 边界_x = 边界矩形.left;
  const 边界_y = 边界矩形.top;
  const left = 视口_x - 边界_x;
  const top = 视口_y - 边界_y;
  const 容器样式 = window.getComputedStyle(椭圆图像容器);
  const 容器宽度 = parseInt(容器样式.width, 10);
  const 容器高度 = parseInt(容器样式.height, 10);
  const 水平比例 = (left / 容器宽度) * 100;
  const 垂直比例 = (top / 容器高度) * 100;
  椭圆圆心区.style.top = `${垂直比例}%`;
  椭圆圆心区.style.left = `${水平比例}%`;
  椭圆圆心水平数值.textContent = `${水平比例.toFixed(0)}`;
  椭圆圆心垂直数值.textContent = `${垂直比例.toFixed(0)}`;
  if (!椭圆圆心区.classList.contains("圆心区可见")) {
    椭圆圆心区.classList.add("圆心区可见");
  }
  椭圆圆心对象.水平 = 水平比例;
  椭圆圆心对象.垂直 = 垂直比例;

  椭圆图.style.clipPath = 生成椭圆修剪值代码(
    `${水平比例}%`,
    `${垂直比例}%`,
    `${椭圆水平半径}%`,
    `${椭圆垂直半径}%`,
  );
  更新椭圆修剪代码区代码();
  if (已显示代码_椭圆) {
    setTimeout(() => {
      刷新代码格式化脚本();
    }, 250);
  }
});

椭圆代码按钮.addEventListener("click", () => {
  已显示代码_椭圆 = !已显示代码_椭圆;
  /*if (已显示代码_椭圆) {
    刷新代码格式化脚本();
  }*/
});

椭圆重置按钮.addEventListener("click", () => {
  重置椭圆修剪参数();
});

function 生成椭圆修剪值代码(圆心水平值, 圆心垂直值, 水平半径值, 垂直半径值) {
  return `ellipse(${水平半径值} ${垂直半径值} at ${圆心水平值} ${圆心垂直值})`;
}

function 更新椭圆修剪代码区代码() {
  //范围型触发input事件时，如果运行prism.js，会严重影响性能，因此需要将格式化代码分离出去
  const 代码前缀 = "目标元素 {\n";
  const 代码后缀 = "\n}";
  椭圆代码区.innerHTML = `${代码前缀}  clip-path: ${生成椭圆修剪值代码(
    `${椭圆圆心对象.水平.toFixed(0)}%`,
    `${椭圆圆心对象.垂直.toFixed(0)}%`,
    `${椭圆水平半径}%`,
    `${椭圆垂直半径}%`,
  )};${代码后缀}`;
}

function 重置椭圆修剪参数() {
  root.style.setProperty("--椭圆水平半径", "0%");
  root.style.setProperty("--椭圆垂直半径", "0%");
  椭圆图.style.removeProperty("clip-path");
  椭圆代码容器.classList.remove("代码容器可见");
  椭圆代码按钮.innerHTML = '<i class="fa-solid fa-code"></i>';
  椭圆代码区.innerHTML = "";
  椭圆水平半径滑块.value = 0;
  椭圆垂直半径滑块.value = 0;
  椭圆水平半径 = 椭圆水平半径滑块.value;
  椭圆垂直半径 = 椭圆垂直半径滑块.value;
  椭圆水平半径数值.textContent = `${椭圆水平半径}`;
  椭圆垂直半径数值.textContent = `${椭圆垂直半径}`;
  已定义圆心_椭圆 = false;
  已显示代码_椭圆 = false;
  椭圆圆心对象.水平 = 0;
  椭圆圆心对象.垂直 = 0;
  椭圆圆心区.classList.remove("圆心区可见");
  椭圆圆心区.style.top = "50%";
  椭圆圆心区.style.left = "50%";
}
