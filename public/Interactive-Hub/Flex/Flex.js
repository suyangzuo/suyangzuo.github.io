window.addEventListener("load", () => {
  const 重置按钮 = document.getElementsByClassName("重置按钮")[0];
  重置按钮.addEventListener("click", 重置参数);
});

const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 轴区切换时长 = 100;

const 弹性展示区 = document.getElementsByClassName("弹性-展示区")[0];

const 初始块元素数量 = rootStyle.getPropertyValue("--初始盒子数量");
const 最低尺寸百分比 = 2;
const 最高尺寸百分比 = 20;
创建块元素(初始块元素数量);

function 创建块元素(数量) {
  for (let i = 1; i <= 数量; i++) {
    const element = document.createElement("div");
    element.className = i % 2 === 0 ? "弹性元素 偶元素" : "弹性元素 奇元素";
    element.style.backgroundColor = i % 2 === 0 ? "brown" : "steelblue";
    let 宽度百分比 = Math.floor(
      Math.random() * (最高尺寸百分比 - 最低尺寸百分比 + 1) + 最低尺寸百分比,
    );
    let 高度百分比 = Math.floor(
      Math.random() * (最高尺寸百分比 - 最低尺寸百分比 + 1) + 最低尺寸百分比,
    );
    element.style.width = `${宽度百分比}%`;
    element.style.height = `${高度百分比}%`;
    element.textContent = i;
    element.style.display = "flex";
    element.style.justifyContent = "center";
    element.style.alignItems = "center";
    element.style.fontSize = "clamp(0.5rem, 1rem, 1.5rem)";
    弹性展示区.appendChild(element);
  }
}

const 展示区块组 = 弹性展示区.getElementsByTagName("div");

const 盒子数量滑块 = document.getElementById("box-count");
盒子数量滑块.setAttribute("盒子数量", 盒子数量滑块.value);
调整盒子数量数字位置();

盒子数量滑块.addEventListener("input", 修改盒子数量);

function 修改盒子数量() {
  盒子数量滑块.nextElementSibling.textContent = 盒子数量滑块.value;
  调整盒子数量数字位置();
  弹性展示区.innerHTML = "";
  创建块元素(盒子数量滑块.value);
  let 盒子比率 = (盒子数量滑块.value * 100) / 盒子数量滑块.max;
  root.style.setProperty("--盒子数量比率", `${盒子比率}%`);
  const 展示区块数组 = Array.from(展示区块组);
  展示区块数组.forEach((element) => {
    element.style.flexShrink = 收缩滑块.value;
  });
  展示区块数组.forEach((element) => {
    element.style.flexGrow = 扩张滑块.value;
  });
}

function 调整盒子数量数字位置() {
  const 当前值 = 盒子数量滑块.value;
  const min = 盒子数量滑块.min ? 盒子数量滑块.min : 0;
  const max = 盒子数量滑块.max ? 盒子数量滑块.max : 100;
  const 修正值 = Number(((当前值 - min) * 100) / (max - min));
  root.style.setProperty(
    "--盒子数量值左偏移",
    `calc(${修正值}% + (${8 - 修正值 * 0.15}px))`,
  );
}

const 块布局 = document.getElementById("display-block");
const 弹性布局 = document.getElementById("display-flex");
const 轴分布三区 = document.getElementsByClassName("轴分布三区")[0];
轴分布三区.style.filter = "brightness(50%)";
轴分布三区.style.pointerEvents = "none";

块布局.addEventListener("change", 修改布局);
弹性布局.addEventListener("change", 修改布局);

function 修改布局() {
  if (块布局.checked) {
    弹性展示区.style.display = "block";
    主轴按钮.style.background =
      "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
    主轴按钮.style.color = "white";
    轴分布三区.style.filter = "brightness(50%)";
    轴分布三区.style.pointerEvents = "none";
    轴方向区.style.filter = "brightness(50%)";
    轴方向区.style.pointerEvents = "none";
    包裹区.style.filter = "brightness(50%)";
    包裹区.style.pointerEvents = "none";
    间隙区.style.filter = "brightness(50%)";
    间隙区.style.pointerEvents = "none";
    轴分布类型.style.filter = "brightness(50%)";
    轴分布类型.style.pointerEvents = "none";
    尺寸区.style.filter = "brightness(50%)";
    尺寸区.style.pointerEvents = "none";
  } else {
    弹性展示区.style.display = "flex";
    修改主轴方向();
    修改行间隙值();
    修改列间隙值();
    主轴按钮.style.background =
      "linear-gradient(90deg, rgb(159, 159, 159) 0%, rgb(205, 205, 205) 100%)";
    主轴按钮.style.color = "black";
    轴分布三区.style.filter = "brightness(100%)";
    轴分布三区.style.pointerEvents = "auto";
    轴方向区.style.filter = "brightness(100%)";
    轴方向区.style.pointerEvents = "auto";
    包裹区.style.filter = "brightness(100%)";
    包裹区.style.pointerEvents = "auto";
    间隙区.style.filter = "brightness(100%)";
    间隙区.style.pointerEvents = "auto";
    轴分布类型.style.filter = "brightness(100%)";
    轴分布类型.style.pointerEvents = "auto";
    交叉轴多行按钮.style.filter = 弹性包裹.checked
      ? "brightness(100%)"
      : "brightness(50%)";
    交叉轴多行按钮.style.pointerEvents = 弹性包裹.checked ? "auto" : "none";
    交叉轴多行分布区.style.filter = 弹性包裹.checked
      ? "brightness(100%)"
      : "brightness(50%)";
    交叉轴多行分布区.style.pointerEvents = 弹性包裹.checked ? "auto" : "none";
    尺寸区.style.filter = "brightness(100%)";
    尺寸区.style.pointerEvents = "auto";
  }
  主轴分布区.style.visibility = "visible";
  主轴分布区.style.opacity = "1";
  交叉轴单行分布区.style.visibility = "hidden";
  交叉轴单行分布区.style.opacity = "0";
  交叉轴单行按钮.style.background =
    "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
  交叉轴单行按钮.style.color = "white";
  交叉轴多行分布区.style.visibility = "hidden";
  交叉轴多行分布区.style.visibility = "0";
  交叉轴多行按钮.style.background =
    "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
  交叉轴多行按钮.style.color = "white";
}

const 主轴行 = document.getElementById("flex-direction-row");
const 主轴列 = document.getElementById("flex-direction-column");
const 轴方向区 = document.getElementsByClassName("轴方向区")[0];
轴方向区.style.filter = "brightness(50%)";
轴方向区.style.pointerEvents = "none";

主轴行.addEventListener("change", 修改主轴方向);
主轴列.addEventListener("change", 修改主轴方向);

function 修改主轴方向() {
  if (主轴行.checked) {
    弹性展示区.style.flexDirection = "row";
  } else {
    弹性展示区.style.flexDirection = "column";
  }
}

const 弹性包裹 = document.getElementById("flex-wrap");
弹性包裹.addEventListener("input", 修改弹性包裹);
const 包裹区 = document.getElementsByClassName("包裹区")[0];
包裹区.style.filter = "brightness(50%)";
包裹区.style.pointerEvents = "none";
const 包裹中文 = 包裹区.getElementsByClassName("包裹中文")[0];
const 包裹代码 = 包裹区.getElementsByClassName("包裹代码")[0];

function 修改弹性包裹() {
  包裹中文.textContent = 弹性包裹.checked ? "包裹" : "不包裹";
  包裹代码.textContent = 弹性包裹.checked ? "wrap" : "nowrap";
  弹性展示区.style.flexWrap = 包裹代码.textContent;
  交叉轴多行按钮.style.filter = 弹性包裹.checked
    ? "brightness(100%)"
    : "brightness(50%)";
  交叉轴多行按钮.style.pointerEvents = 弹性包裹.checked ? "auto" : "none";
  交叉轴多行分布区.style.filter = 弹性包裹.checked
    ? "brightness(100%)"
    : "brightness(50%)";
  交叉轴多行分布区.style.pointerEvents = 弹性包裹.checked ? "auto" : "none";
}

const 行间隙 = document.getElementById("x-gap");
const 列间隙 = document.getElementById("y-gap");
行间隙.setAttribute("行间隙值", `${行间隙.value}`);
列间隙.setAttribute("列间隙值", `${列间隙.value}`);
调整行间隙位置();
调整列间隙位置();

行间隙.addEventListener("input", 修改行间隙值);
列间隙.addEventListener("input", 修改列间隙值);

const 间隙区 = document.getElementsByClassName("间隙区")[0];
间隙区.style.filter = "brightness(50%)";
间隙区.style.pointerEvents = "none";

function 修改行间隙值() {
  行间隙.nextElementSibling.textContent = 行间隙.value;
  调整行间隙位置();
  弹性展示区.style.rowGap = `${行间隙.value}px`;
  let 行间隙比率 = (行间隙.value * 100) / 行间隙.max;
  root.style.setProperty("--行间隙比率", `${行间隙比率}%`);
}

function 修改列间隙值() {
  列间隙.nextElementSibling.textContent = 列间隙.value;
  调整列间隙位置();
  弹性展示区.style.columnGap = `${列间隙.value}px`;
  let 列间隙比率 = (列间隙.value * 100) / 列间隙.max;
  root.style.setProperty("--列间隙比率", `${列间隙比率}%`);
}

function 调整行间隙位置() {
  const 当前值 = 行间隙.value;
  const min = 行间隙.min ? 行间隙.min : 0;
  const max = 行间隙.max ? 行间隙.max : 100;
  const 修正值 = Number(((当前值 - min) * 100) / (max - min));
  root.style.setProperty(
    "--行间隙值左偏移",
    `calc(${修正值}% + (${8 - 修正值 * 0.15}px))`,
  );
}

function 调整列间隙位置() {
  const 当前值 = 列间隙.value;
  const min = 列间隙.min ? 列间隙.min : 0;
  const max = 列间隙.max ? 列间隙.max : 100;
  const 修正值 = Number(((当前值 - min) * 100) / (max - min));
  root.style.setProperty(
    "--列间隙值左偏移",
    `calc(${修正值}% + (${8 - 修正值 * 0.15}px))`,
  );
}

const 主轴分布区 = document.getElementsByClassName("主轴分布区")[0];
const 交叉轴单行分布区 = document.getElementsByClassName("交叉轴单行分布区")[0];
const 交叉轴多行分布区 = document.getElementsByClassName("交叉轴多行分布区")[0];
const 主轴按钮 = document.getElementsByClassName("主轴按钮")[0];
const 交叉轴单行按钮 = document.getElementsByClassName("交叉轴单行按钮")[0];
const 交叉轴多行按钮 = document.getElementsByClassName("交叉轴多行按钮")[0];

const 轴分布类型 = document.getElementsByClassName("轴分布类型")[0];
轴分布类型.style.filter = "brightness(50%)";
轴分布类型.style.pointerEvents = "none";

主轴按钮.addEventListener("click", (event) => {
  if (块布局.checked) return;
  event.target.style.background =
    "linear-gradient(90deg, rgb(159, 159, 159) 0%, rgb(205, 205, 205) 100%)";
  event.target.style.color = "black";
  主轴分布区.style.visibility = "visible";
  主轴分布区.style.opacity = "1";
  交叉轴单行分布区.style.visibility = "hidden";
  交叉轴单行分布区.style.opacity = "0";
  交叉轴单行按钮.style.background =
    "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
  交叉轴单行按钮.style.color = "white";
  交叉轴多行分布区.style.visibility = "hidden";
  交叉轴多行分布区.style.visibility = "0";
  交叉轴多行按钮.style.background =
    "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
  交叉轴多行按钮.style.color = "white";
});

交叉轴单行按钮.addEventListener("click", (event) => {
  if (块布局.checked) return;
  event.target.style.background =
    "linear-gradient(90deg, rgb(159, 159, 159) 0%, rgb(205, 205, 205) 100%)";
  event.target.style.color = "black";
  主轴分布区.style.visibility = "hidden";
  主轴分布区.style.opacity = "0";
  主轴按钮.style.background =
    "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
  主轴按钮.style.color = "white";
  交叉轴单行分布区.style.visibility = "visible";
  交叉轴单行分布区.style.opacity = "1";
  交叉轴多行分布区.style.visibility = "hidden";
  交叉轴多行分布区.style.visibility = "0";
  交叉轴多行按钮.style.background =
    "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
  交叉轴多行按钮.style.color = "white";
});

交叉轴多行按钮.addEventListener("click", (event) => {
  if (块布局.checked) return;
  event.target.style.background =
    "linear-gradient(90deg, rgb(159, 159, 159) 0%, rgb(205, 205, 205) 100%)";
  event.target.style.color = "black";
  主轴分布区.style.visibility = "hidden";
  主轴分布区.style.opacity = "0";
  主轴按钮.style.background =
    "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
  主轴按钮.style.color = "white";
  交叉轴单行分布区.style.visibility = "hidden";
  交叉轴单行分布区.style.opacity = "0";
  交叉轴单行按钮.style.background =
    "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
  交叉轴单行按钮.style.color = "white";
  交叉轴多行分布区.style.visibility = "visible";
  交叉轴多行分布区.style.opacity = "1";
});

const 主轴分布全部选项 = document.querySelectorAll(
  '.主轴分布区 input[type="radio"]',
);
const 交叉轴单行分布全部选项 = document.querySelectorAll(
  '.交叉轴单行分布区 input[type="radio"]',
);
const 交叉轴多行分布全部选项 = document.querySelectorAll(
  '.交叉轴多行分布区 input[type="radio"]',
);

主轴分布全部选项.forEach((element) => {
  element.addEventListener("click", 修改主轴布局);
});

交叉轴单行分布全部选项.forEach((element) => {
  element.addEventListener("click", 修改交叉轴单行布局);
});

交叉轴多行分布全部选项.forEach((element) => {
  element.addEventListener("click", 修改交叉轴多行布局);
});

function 修改主轴布局(event) {
  let id = event.target.id;
  const label = document.querySelector(`label[for=${id}]`);
  const 代码 = label.getElementsByClassName("代码")[0].textContent;
  弹性展示区.style.justifyContent = `${代码}`;
}

function 修改交叉轴单行布局(event) {
  let id = event.target.id;
  const label = document.querySelector(`label[for=${id}]`);
  const 代码 = label.getElementsByClassName("代码")[0].textContent;
  弹性展示区.style.alignItems = `${代码}`;
}

function 修改交叉轴多行布局(event) {
  let id = event.target.id;
  const label = document.querySelector(`label[for=${id}]`);
  const 代码 = label.getElementsByClassName("代码")[0].textContent;
  弹性展示区.style.alignContent = `${代码}`;
}

const 收缩滑块 = document.getElementById("flex-shrink");
const 扩张滑块 = document.getElementById("flex-grow");

收缩滑块.setAttribute("收缩值", 收缩滑块.value);
扩张滑块.setAttribute("扩张值", 扩张滑块.value);
调整收缩数字位置();
调整扩张数字位置();

收缩滑块.addEventListener("input", 修改弹性收缩);
扩张滑块.addEventListener("input", 修改弹性扩张);

const 尺寸区 = document.getElementsByClassName("尺寸区")[0];
尺寸区.style.filter = "brightness(50%)";
尺寸区.style.pointerEvents = "none";

function 修改弹性收缩() {
  收缩滑块.nextElementSibling.textContent = 收缩滑块.value;
  调整收缩数字位置();
  let 收缩比率 = (收缩滑块.value * 100) / 收缩滑块.max;
  root.style.setProperty("--收缩比率", `${收缩比率}%`);
  Array.from(展示区块组).forEach((element) => {
    element.style.flexShrink = 收缩滑块.value;
  });
}

function 修改弹性扩张() {
  扩张滑块.nextElementSibling.textContent = 扩张滑块.value;
  调整扩张数字位置();
  let 扩张比率 = (扩张滑块.value * 100) / 扩张滑块.max;
  root.style.setProperty("--扩张比率", `${扩张比率}%`);
  Array.from(展示区块组).forEach((element) => {
    element.style.flexGrow = 扩张滑块.value;
  });
}

function 调整收缩数字位置() {
  const 当前值 = 收缩滑块.value;
  const min = 收缩滑块.min ? 收缩滑块.min : 0;
  const max = 收缩滑块.max ? 收缩滑块.max : 100;
  const 修正值 = Number(((当前值 - min) * 100) / (max - min));
  root.style.setProperty(
    "--收缩值左偏移",
    `calc(${修正值}% + (${8 - 修正值 * 0.15}px))`,
  );
}

function 调整扩张数字位置() {
  const 当前值 = 扩张滑块.value;
  const min = 扩张滑块.min ? 扩张滑块.min : 0;
  const max = 扩张滑块.max ? 扩张滑块.max : 100;
  const 修正值 = Number(((当前值 - min) * 100) / (max - min));
  root.style.setProperty(
    "--扩张值左偏移",
    `calc(${修正值}% + (${8 - 修正值 * 0.15}px))`,
  );
}

function 重置参数() {
  盒子数量滑块.value = 初始块元素数量;
  盒子数量滑块.nextElementSibling.textContent = 盒子数量滑块.value;
  调整盒子数量数字位置();
  弹性展示区.innerHTML = "";
  弹性展示区.style.display = "block";
  创建块元素(初始块元素数量);

  块布局.checked = true;
  弹性布局.checked = false;

  主轴行.checked = true;
  主轴列.checked = false;

  弹性包裹.checked = false;
  包裹中文.textContent = "不包裹";
  包裹代码.textContent = "nowrap";
  弹性展示区.style.flexWrap = 包裹代码.textContent;

  行间隙.value = 0;
  行间隙.nextElementSibling.textContent = 行间隙.value;
  调整行间隙位置();
  列间隙.value = 0;
  列间隙.nextElementSibling.textContent = 列间隙.value;
  调整列间隙位置();

  主轴按钮.style.background =
    "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
  主轴按钮.style.color = "white";
  主轴分布区.style.visibility = "visible";
  主轴分布区.style.opacity = "1";
  交叉轴单行分布区.style.visibility = "hidden";
  交叉轴单行分布区.style.opacity = "0";
  交叉轴单行按钮.style.background =
    "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
  交叉轴单行按钮.style.color = "white";
  交叉轴多行分布区.style.visibility = "hidden";
  交叉轴多行分布区.style.visibility = "0";
  交叉轴多行按钮.style.background =
    "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
  交叉轴多行按钮.style.color = "white";
  主轴分布全部选项.forEach((element) => {
    if (element.id.includes("正常")) {
      element.checked = true;
    } else {
      element.checked = false;
    }
  });
  交叉轴单行分布全部选项.forEach((element) => {
    if (element.id.includes("正常")) {
      element.checked = true;
    } else {
      element.checked = false;
    }
  });
  交叉轴多行分布全部选项.forEach((element) => {
    if (element.id.includes("正常")) {
      element.checked = true;
    } else {
      element.checked = false;
    }
  });

  轴分布三区.style.filter = "brightness(50%)";
  轴分布三区.style.pointerEvents = "none";
  轴方向区.style.filter = "brightness(50%)";
  轴方向区.style.pointerEvents = "none";
  包裹区.style.filter = "brightness(50%)";
  包裹区.style.pointerEvents = "none";
  间隙区.style.filter = "brightness(50%)";
  间隙区.style.pointerEvents = "none";
  轴分布类型.style.filter = "brightness(50%)";
  轴分布类型.style.pointerEvents = "none";
  尺寸区.style.filter = "brightness(50%)";
  尺寸区.style.pointerEvents = "none";

  收缩滑块.value = 1;
  收缩滑块.nextElementSibling.textContent = 收缩滑块.value;
  调整收缩数字位置();
  扩张滑块.value = 0;
  扩张滑块.nextElementSibling.textContent = 扩张滑块.value;
  调整扩张数字位置();

  let 盒子比率 = (盒子数量滑块.value * 100) / 盒子数量滑块.max;
  root.style.setProperty("--盒子数量比率", `${盒子比率}%`);
  let 行间隙比率 = (行间隙.value * 100) / 行间隙.max;
  root.style.setProperty("--行间隙比率", `${行间隙比率}%`);
  let 列间隙比率 = (列间隙.value * 100) / 列间隙.max;
  root.style.setProperty("--列间隙比率", `${列间隙比率}%`);
  let 收缩比率 = (收缩滑块.value * 100) / 收缩滑块.max;
  root.style.setProperty("--收缩比率", `${收缩比率}%`);
  let 扩张比率 = (扩张滑块.value * 100) / 扩张滑块.max;
  root.style.setProperty("--扩张比率", `${扩张比率}%`);
}
