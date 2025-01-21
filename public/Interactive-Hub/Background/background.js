const root = document.querySelector(":root");
const 滚动条宽度 = 10;
const 顶栏高度 = 50;

const 背景总区 = document.querySelector(".背景总区");
const 背景总区计算样式 = window.getComputedStyle(背景总区);
const 操作区 = document.querySelector(".背景-操作区");
// const 背景容器 = document.getElementsByClassName("背景-容器")[0];
const 内容容器 = document.querySelector(".内容容器");
const 背景尺寸滑块 = document.getElementById("bg-size");
const 背景尺寸标记 = document.getElementById("bg-size-marks");
const 拖拽区 = document.querySelector(".拖拽区");
let 拖拽偏移 = {
  水平: 0,
  垂直: 0,
};

const 自动单选框 = document.getElementById("bg-size-auto");
const 等比覆盖单选框 = document.getElementById("bg-size-cover");
const 等比包含单选框 = document.getElementById("bg-size-contain");

const 背景重复复选框 = document.getElementById("bg-repeat");
const 背景附着单选组 = document.querySelectorAll("input[name='bg-attachment']");

const 初始x轴位置 = 0;
const 初始y轴位置 = 0;
let x轴位置 = 初始x轴位置;
let y轴位置 = 初始y轴位置;
const 宽度滑块 = document.getElementById("宽度");
const 高度滑块 = document.getElementById("高度");
const x轴滑块 = document.getElementById("x-axis");
const y轴滑块 = document.getElementById("y-axis");
const 位置轴宽度 = parseInt(window.getComputedStyle(x轴滑块).width, 10);
const 尺寸轴宽度 = parseInt(window.getComputedStyle(宽度滑块).width, 10);
const 拇指宽度 = 16;
const 宽度数字 = document.querySelector(".宽度数字").querySelector(".数字");
const 高度数字 = document.querySelector(".高度数字").querySelector(".数字");
const x轴数字 = document.querySelector(".x轴数字").querySelector(".数字");
const y轴数字 = document.querySelector(".y轴数字").querySelector(".数字");

const 初始标记索引 = 3;
let 之前标记 = 背景尺寸标记.getElementsByTagName("option")[初始标记索引];
之前标记.style.color = "tomato";
之前标记.style.fontWeight = "bolder";
之前标记.style.transform = "scale(1.2)";
let 当前标记 = 之前标记;

拖拽区.addEventListener("dragstart", (event) => {
  // event.preventDefault();
  const 鼠标位置_水平 = event.clientX;
  const 鼠标位置_垂直 = event.clientY;
  const 拖拽区边界矩形 = 拖拽区.getBoundingClientRect();
  拖拽偏移.水平 = 拖拽区边界矩形.left - 鼠标位置_水平;
  拖拽偏移.垂直 = 拖拽区边界矩形.top - 鼠标位置_垂直;
  操作区.style.transition = "none";
  event.dataTransfer.effectAllowed = "move";
});

拖拽区.addEventListener("drag", (event) => {
  const 鼠标位置_水平 = event.clientX;
  const 鼠标位置_垂直 = event.clientY;
  操作区.style.left = `${鼠标位置_水平 + 拖拽偏移.水平 - 滚动条宽度}px`;
  操作区.style.top = `${鼠标位置_垂直 + 拖拽偏移.垂直 - 顶栏高度}px`;
  拖拽区.classList.add("拖拽中");
});

背景总区.addEventListener("dragover", (event) => {
  event.preventDefault();
});

背景总区.addEventListener("drop", (event) => {
  event.dataTransfer.dropEffect = "move";
  const 鼠标位置_水平 = event.clientX;
  const 鼠标位置_垂直 = event.clientY;
  const left = 鼠标位置_水平 + 拖拽偏移.水平 - 滚动条宽度;
  const top = 鼠标位置_垂直 + 拖拽偏移.垂直 - 顶栏高度;
  const width = 背景总区.offsetWidth;
  const height = 背景总区.offsetHeight;
  const 水平比例 = left / width;
  const 垂直比例 = top / height;
  const 水平补偿 = (滚动条宽度 * 2 * 水平比例) / width;
  操作区.style.left = `${(水平比例 + 水平补偿) * 100}%`;
  操作区.style.top = `${垂直比例 * 100}%`;
  拖拽区.classList.remove("拖拽中");
  操作区.style.transition = "";
});

宽度滑块.addEventListener("input", (event) => {
  const 百分比 = 获取滑块百分比(宽度滑块);
  root.style.setProperty("--宽度滑块位置", 百分比);
  root.style.setProperty("--内容容器宽度", `${宽度滑块.value}%`);
  宽度数字.textContent = 宽度滑块.value;
  const 百分比值 = parseFloat(百分比);
  let 位移 = (尺寸轴宽度 - 拇指宽度) * (百分比值 / 100);
  宽度数字.parentElement.style.transform = `translateY(100%) translateX(${
    位移 - 尺寸轴宽度 / 2 + 拇指宽度 / 2
  }px)`;
  event.stopPropagation();
});

高度滑块.addEventListener("input", () => {
  const 百分比 = 获取滑块百分比(高度滑块);
  root.style.setProperty("--高度滑块位置", 百分比);
  root.style.setProperty("--内容容器高度", `${高度滑块.value}%`);
  高度数字.textContent = 高度滑块.value;
  const 百分比值 = parseFloat(百分比);
  let 位移 = (尺寸轴宽度 - 拇指宽度) * (百分比值 / 100);
  高度数字.parentElement.style.transform = `translateY(100%) translateX(${
    位移 - 尺寸轴宽度 / 2 + 拇指宽度 / 2
  }px)`;
});

背景尺寸滑块.addEventListener("mousedown", () => {
  背景尺寸滑块.style.filter = "opacity(100%)";
  背景尺寸标记.style.filter = "opacity(100%)";
});
背景尺寸滑块.addEventListener("input", 修改背景尺寸);
背景尺寸滑块.addEventListener("mousedown", 修改背景尺寸);

function 修改背景尺寸(event) {
  自动单选框.checked = false;
  等比覆盖单选框.checked = false;
  等比包含单选框.checked = false;
  let value = 背景尺寸滑块.value;
  root.style.setProperty(
    "--比例-背景尺寸",
    `calc(100% * (${value} - ${背景尺寸滑块.min}) / (${背景尺寸滑块.max} - ${背景尺寸滑块.min}))`,
  );
  当前标记 = 背景尺寸标记.querySelector(`[label="${value}"]`);
  root.style.setProperty(
    "--背景尺寸标记偏移",
    parseInt(value, 10) >= 100
      ? `${当前标记.offsetLeft - 1.5}px`
      : `${当前标记.offsetLeft + 2}px`,
  );
  root.style.setProperty(
    "--背景尺寸下划线宽度",
    parseInt(value, 10) >= 100 ? "27px" : "19px",
  );
  之前标记.style.color = "white";
  之前标记.style.fontWeight = "normal";
  之前标记.style.transform = "scale(100%)";
  当前标记.style.color = "tomato";
  当前标记.style.fontWeight = "bolder";
  当前标记.style.transform = "scale(1.2)";
  之前标记 = 当前标记;

  内容容器.style.backgroundSize = `${value}% ${value}%`;
}

window.addEventListener("load", () => {
  const 重置按钮 = document.getElementsByClassName("重置按钮")[0];
  重置按钮.addEventListener("click", 重置参数);
});

for (const 背景附着单选 of 背景附着单选组) {
  背景附着单选.addEventListener("change", () => {
    内容容器.style.backgroundAttachment = 背景附着单选.id;
  });
}

// ---------------------- ↓ 重置 ----------------------
function 重置参数() {
  之前标记 = 背景尺寸标记.getElementsByTagName("option")[初始标记索引];
  之前标记.style.color = "tomato";
  之前标记.style.fontWeight = "bolder";
  之前标记.style.transform = "scale(1.2)";
  if (当前标记 !== 之前标记) {
    当前标记.style.color = "white";
    当前标记.style.fontWeight = "normal";
    当前标记.style.transform = "scale(100%)";
  }
  当前标记 = 之前标记;
  // root.style.setProperty("--范围滑块数字标记伪元素顺位", 初始标记索引);

  背景尺寸滑块.value = "100";
  let value = 背景尺寸滑块.value;
  /*root.style.setProperty(
    "--比例-背景尺寸",
    `calc(100% * (${value} - ${背景尺寸滑块.min}) / (${背景尺寸滑块.max} - ${背景尺寸滑块.min}))`,
  );*/
  root.style.removeProperty("--比例-背景尺寸");
  背景尺寸滑块.style.filter = "opacity(50%)";
  背景尺寸标记.style.filter = "opacity(50%)";

  等比覆盖单选框.checked = false;
  等比包含单选框.checked = false;
  自动单选框.checked = true;

  内容容器.style.backgroundSize = "";
  x轴位置 = 初始x轴位置;
  y轴位置 = 初始y轴位置;
  内容容器.style.backgroundPosition = "";
  x轴滑块.value = 初始x轴位置;
  y轴滑块.value = 初始y轴位置;
  宽度滑块.value = "100";
  高度滑块.value = "100";
  /*root.style.setProperty("--填充比例-X轴", `${50}%`);
  root.style.setProperty("--填充比例-Y轴", `${50}%`);*/
  root.style.removeProperty("--填充比例-X轴");
  root.style.removeProperty("--填充比例-Y轴");
  root.style.removeProperty("--内容容器宽度");
  root.style.removeProperty("--内容容器高度");
  root.style.removeProperty("--宽度滑块位置");
  root.style.removeProperty("--高度滑块位置");

  背景重复复选框.checked = true;
  内容容器.style.backgroundRepeat = "";

  x轴数字.parentElement.style.transform = "translateY(100%)";
  y轴数字.parentElement.style.transform = "translateY(100%)";
  x轴数字.textContent = `${x轴滑块.value}`;
  y轴数字.textContent = `${y轴滑块.value}`;
  宽度数字.parentElement.style.transform = "";
  高度数字.parentElement.style.transform = "";
  宽度数字.textContent = "100";
  高度数字.textContent = "100";

  const 背景滚动 = document.getElementById("scroll");
  背景滚动.checked = true;
  内容容器.style.backgroundAttachment = "";

  操作区.style.left = "";
  操作区.style.top = "";
}

// ---------------------- ↑ 重置 ----------------------

等比覆盖单选框.addEventListener("input", 选择等比覆盖);
等比包含单选框.addEventListener("input", 选择等比包含);
自动单选框.addEventListener("input", 选择自动);

function 选择等比覆盖() {
  if (等比覆盖单选框.checked) {
    内容容器.style.backgroundSize = "cover";
  }
  背景尺寸滑块.style.filter = "opacity(50%)";
  背景尺寸标记.style.filter = "opacity(50%)";
}

function 选择等比包含() {
  if (等比包含单选框.checked) {
    内容容器.style.backgroundSize = "contain";
    背景尺寸滑块.style.filter = "opacity(50%)";
    背景尺寸标记.style.filter = "opacity(50%)";
  }
}

function 选择自动() {
  if (自动单选框.checked) {
    内容容器.style.backgroundSize = "auto";
    背景尺寸滑块.style.filter = "opacity(50%)";
    背景尺寸标记.style.filter = "opacity(50%)";
  }
}

x轴滑块.addEventListener("input", 修改背景x轴位置);
y轴滑块.addEventListener("input", 修改背景y轴位置);

function 修改背景x轴位置() {
  x轴位置 = x轴滑块.value;
  内容容器.style.backgroundPosition = `${x轴位置}% ${y轴位置}%`;
  let x轴填充比例 =
    ((x轴位置 - x轴滑块.min) * 100) / (x轴滑块.max - x轴滑块.min);

  root.style.setProperty("--背景位置-X轴", `${x轴位置}%`);
  root.style.setProperty("--填充比例-X轴", `${x轴填充比例}%`);

  let 轴数字位移 = (位置轴宽度 - 拇指宽度) * (x轴填充比例 / 100);
  x轴数字.parentElement.style.transform = `translateY(100%) translateX(${
    轴数字位移 - 位置轴宽度 / 2 + 拇指宽度 / 2
  }px)`;
  x轴数字.textContent = `${x轴位置}`;
}

function 修改背景y轴位置() {
  y轴位置 = y轴滑块.value;
  内容容器.style.backgroundPosition = `${x轴位置}% ${y轴位置}%`;
  let y轴填充比例 =
    ((y轴位置 - y轴滑块.min) * 100) / (y轴滑块.max - y轴滑块.min);

  root.style.setProperty("--背景位置-Y轴", `${y轴位置}%`);
  root.style.setProperty("--填充比例-Y轴", `${y轴填充比例}%`);

  let 轴数字位移 = (位置轴宽度 - 拇指宽度) * (y轴填充比例 / 100);
  y轴数字.parentElement.style.transform = `translateY(100%) translateX(${
    轴数字位移 - 位置轴宽度 / 2 + 拇指宽度 / 2
  }px)`;
  y轴数字.textContent = `${y轴位置}`;
}

背景重复复选框.addEventListener("change", 修改背景重复);

function 修改背景重复() {
  内容容器.style.backgroundRepeat = 背景重复复选框.checked
    ? "repeat"
    : "no-repeat";
}

function 获取滑块百分比(滑块) {
  const 值 = parseFloat(滑块.value);
  const max = parseFloat(滑块.max);
  const min = parseFloat(滑块.min);
  return `${((值 - min) / (max - min)) * 100}%`;
}
