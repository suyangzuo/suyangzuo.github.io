window.addEventListener("load", () => {
  const 重置按钮 = document.getElementsByClassName("重置按钮")[0];
  重置按钮.addEventListener("click", 重置参数);
});

const 已屏蔽亮度 = "35%";
const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 轴区切换时长 = 100;

const 弹性展示区 = document.getElementsByClassName("弹性-展示区")[0];
const 水平轴指示区 = document.querySelector(".水平轴指示区");
const 垂直轴指示区 = document.querySelector(".垂直轴指示区");

let 计算容器 = null;
let 更新请求ID1 = null;
let 更新请求ID2 = null;
let 待更新 = false;

function 创建计算容器() {
  if (计算容器) {
    计算容器.innerHTML = "";
    return;
  }
  计算容器 = document.createElement("div");
  计算容器.style.position = "absolute";
  计算容器.style.visibility = "hidden";
  计算容器.style.pointerEvents = "none";
  计算容器.style.width = "800px";
  计算容器.style.height = "800px";
  计算容器.style.top = "0";
  计算容器.style.left = "0";
  计算容器.style.overflow = "hidden";
  弹性展示区.appendChild(计算容器);
}

function 执行更新() {
  if (更新请求ID1 !== null) {
    cancelAnimationFrame(更新请求ID1);
    更新请求ID1 = null;
  }
  if (更新请求ID2 !== null) {
    cancelAnimationFrame(更新请求ID2);
    更新请求ID2 = null;
  }

  const 弹性元素组 = 弹性展示区.querySelectorAll(".弹性元素");
  if (弹性元素组.length === 0) {
    待更新 = false;
    return;
  }

  if (块布局.checked) {
    弹性元素组.forEach((元素) => {
      元素.style.position = "relative";
      元素.style.left = "";
      元素.style.top = "";
      const 原始宽度 = 元素.dataset.原始宽度;
      const 原始高度 = 元素.dataset.原始高度;
      if (原始宽度) {
        元素.style.width = 原始宽度;
      }
      if (原始高度) {
        元素.style.height = 原始高度;
      }
    });
    待更新 = false;
    return;
  }

  弹性元素组.forEach((元素) => {
    元素.style.position = "absolute";
  });

  创建计算容器();
  
  const 计算元素组 = [];
  弹性元素组.forEach((实际元素) => {
    const 计算元素 = document.createElement("div");
    计算元素.className = 实际元素.className;
    计算元素.style.backgroundColor = 实际元素.style.backgroundColor;
    计算元素.setAttribute("data-number", 实际元素.getAttribute("data-number"));
    
    const 原始宽度 = 实际元素.dataset.原始宽度 || 实际元素.style.width;
    const 原始高度 = 实际元素.dataset.原始高度 || 实际元素.style.height;
    
    实际元素.dataset.原始宽度 = 原始宽度;
    实际元素.dataset.原始高度 = 原始高度;
    
    计算元素.style.width = 原始宽度;
    计算元素.style.height = 原始高度;
    计算元素.style.position = "static";
    计算元素.style.left = "";
    计算元素.style.top = "";
    
    const 实际样式 = window.getComputedStyle(实际元素);
    计算元素.style.flexGrow = 实际样式.flexGrow;
    计算元素.style.flexShrink = 实际样式.flexShrink;
    计算元素.style.flexBasis = 实际样式.flexBasis;
    
    计算容器.appendChild(计算元素);
    计算元素组.push({ 实际元素, 计算元素 });
  });

  计算容器.style.display = 弹性展示区.style.display || "flex";
  计算容器.style.flexDirection = 弹性展示区.style.flexDirection || "row";
  计算容器.style.flexWrap = 弹性展示区.style.flexWrap || "nowrap";
  计算容器.style.justifyContent = 弹性展示区.style.justifyContent || "normal";
  计算容器.style.alignItems = 弹性展示区.style.alignItems || "normal";
  计算容器.style.alignContent = 弹性展示区.style.alignContent || "normal";
  计算容器.style.rowGap = 弹性展示区.style.rowGap || "0px";
  计算容器.style.columnGap = 弹性展示区.style.columnGap || "0px";

  更新请求ID1 = requestAnimationFrame(() => {
    更新请求ID2 = requestAnimationFrame(() => {
      if (计算容器 && 计算容器.parentElement) {
        计算元素组.forEach(({ 实际元素, 计算元素 }) => {
          if (!计算元素.parentElement) return;
          const 计算元素Rect = 计算元素.getBoundingClientRect();
          const 计算容器Rect = 计算容器.getBoundingClientRect();
          实际元素.style.left = `${计算元素Rect.left - 计算容器Rect.left}px`;
          实际元素.style.top = `${计算元素Rect.top - 计算容器Rect.top}px`;
          实际元素.style.width = `${计算元素Rect.width}px`;
          实际元素.style.height = `${计算元素Rect.height}px`;
        });
        计算容器.innerHTML = "";
      }
      更新请求ID1 = null;
      更新请求ID2 = null;
      const 需要再次更新 = 待更新;
      待更新 = false;
      if (需要再次更新) {
        执行更新();
      }
    });
  });
}

function 更新弹性元素位置() {
  待更新 = true;
  if (更新请求ID1 === null && 更新请求ID2 === null) {
    执行更新();
  }
}

const 固定尺寸单选 = document.getElementById("固定");
const 随机尺寸单选 = document.getElementById("随机");

const 初始块元素数量 = rootStyle.getPropertyValue("--初始盒子数量");
const 最低尺寸百分比 = 3;
const 最高尺寸百分比 = 20;
创建块元素(初始块元素数量);
window.addEventListener("load", () => {
  更新弹性元素位置();
});

function 创建块元素(数量) {
  for (let i = 1; i <= 数量; i++) {
    const element = document.createElement("div");
    element.className = i % 2 === 0 ? "弹性元素 偶元素" : "弹性元素 奇元素";
    element.style.backgroundColor = i % 2 === 0 ? "#4a7" : "#468";
    let 宽度百分比 = Math.floor(
      Math.random() * (最高尺寸百分比 - 最低尺寸百分比 + 1) + 最低尺寸百分比,
    );
    let 高度百分比 = Math.floor(
      Math.random() * (最高尺寸百分比 - 最低尺寸百分比 + 1) + 最低尺寸百分比,
    );
    const 宽度值 = 固定尺寸单选.checked ? "12.5%" : `${宽度百分比}%`;
    const 高度值 = 固定尺寸单选.checked ? "125px" : `${高度百分比}%`;
    element.style.width = 宽度值;
    element.style.height = 高度值;
    element.dataset.原始宽度 = 宽度值;
    element.dataset.原始高度 = 高度值;
    element.setAttribute("data-number", `${i}`);
    弹性展示区.appendChild(element);
  }
}

固定尺寸单选.addEventListener("change", 修改盒子尺寸);
随机尺寸单选.addEventListener("change", 修改盒子尺寸);

function 修改盒子尺寸() {
  const 盒子组 = 弹性展示区.querySelectorAll(".弹性元素");
  for (const 盒子 of 盒子组) {
    let 宽度百分比 = Math.floor(
      Math.random() * (最高尺寸百分比 - 最低尺寸百分比 + 1) + 最低尺寸百分比,
    );
    let 高度百分比 = Math.floor(
      Math.random() * (最高尺寸百分比 - 最低尺寸百分比 + 1) + 最低尺寸百分比,
    );
    const 宽度值 = 固定尺寸单选.checked ? "12.5%" : `${宽度百分比}%`;
    const 高度值 = 固定尺寸单选.checked ? "125px" : `${高度百分比}%`;
    盒子.style.width = 宽度值;
    盒子.style.height = 高度值;
    盒子.dataset.原始宽度 = 宽度值;
    盒子.dataset.原始高度 = 高度值;
  }
  更新弹性元素位置();
}

const 展示区块组 = 弹性展示区.getElementsByTagName("div");

const 盒子数量滑块 = document.getElementById("box-count");
盒子数量滑块.setAttribute("盒子数量", 盒子数量滑块.value);
调整盒子数量数字位置();

盒子数量滑块.addEventListener("input", 修改盒子数量);

function 修改盒子数量() {
  盒子数量滑块.nextElementSibling.textContent = 盒子数量滑块.value;
  调整盒子数量数字位置();
  const 弹性元素组 = 弹性展示区.querySelectorAll(".弹性元素");
  for (const 弹性元素 of 弹性元素组) {
    弹性元素.remove();
  }
  // 弹性展示区.innerHTML = "";
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
  更新弹性元素位置();
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
轴分布三区.style.filter = `brightness(${已屏蔽亮度})`;
轴分布三区.style.pointerEvents = "none";

块布局.addEventListener("change", 修改布局);
弹性布局.addEventListener("change", 修改布局);

function 修改布局() {
  if (块布局.checked) {
    弹性展示区.style.display = "block";
    水平轴指示区.style.opacity = "";
    垂直轴指示区.style.opacity = "";
    主轴按钮.style.background =
      "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
    主轴按钮.style.color = "white";
    屏蔽弹性布局操作区();
  } else {
    弹性展示区.style.display = "flex";
    水平轴指示区.style.opacity = "1";
    垂直轴指示区.style.opacity = "1";
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
    换行区.style.filter = "brightness(100%)";
    换行区.style.pointerEvents = "auto";
    间隙区.style.filter = "brightness(100%)";
    间隙区.style.pointerEvents = "auto";
    轴分布类型.style.filter = "brightness(100%)";
    轴分布类型.style.pointerEvents = "auto";
    交叉轴多行按钮.style.filter = 弹性换行.checked
      ? "brightness(100%)"
      : `brightness(${已屏蔽亮度})`;
    交叉轴多行按钮.style.pointerEvents = 弹性换行.checked ? "auto" : "none";
    交叉轴多行分布区.style.filter = 弹性换行.checked
      ? "brightness(100%)"
      : `brightness(${已屏蔽亮度})`;
    交叉轴多行分布区.style.pointerEvents = 弹性换行.checked ? "auto" : "none";
    尺寸区.style.filter = "brightness(100%)";
    尺寸区.style.pointerEvents = "auto";
  }
  弹性轴区样式初始化();
  更新弹性元素位置();
}

const 主轴行 = document.getElementById("flex-direction-row");
const 主轴列 = document.getElementById("flex-direction-column");
const 轴方向区 = document.getElementsByClassName("轴方向区")[0];
轴方向区.style.filter = `brightness(${已屏蔽亮度})`;
轴方向区.style.pointerEvents = "none";

主轴行.addEventListener("change", 修改主轴方向);
主轴列.addEventListener("change", 修改主轴方向);

function 修改主轴方向() {
  if (主轴行.checked) {
    弹性展示区.style.flexDirection = "row";
    const 水平轴指示文本 = 水平轴指示区.querySelector(".轴指示文本");
    const 垂直轴指示文本 = 垂直轴指示区.querySelector(".轴指示文本");
    水平轴指示文本.textContent = "主轴";
    垂直轴指示文本.textContent = "交叉轴";
  } else {
    弹性展示区.style.flexDirection = "column";
    const 水平轴指示文本 = 水平轴指示区.querySelector(".轴指示文本");
    const 垂直轴指示文本 = 垂直轴指示区.querySelector(".轴指示文本");
    水平轴指示文本.textContent = "交叉轴";
    垂直轴指示文本.textContent = "主轴";
  }
  更新弹性元素位置();
}

function 弹性轴区样式初始化() {
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

const 弹性换行 = document.getElementById("wrap");
const 弹性不换行 = document.getElementById("nowrap");
弹性换行.addEventListener("input", 修改弹性换行);
弹性不换行.addEventListener("input", 修改弹性换行);
const 换行区 = document.getElementsByClassName("换行区")[0];
换行区.style.filter = `brightness(${已屏蔽亮度})`;
换行区.style.pointerEvents = "none";

function 修改弹性换行() {
  弹性展示区.style.flexWrap = 弹性换行.checked ? "wrap" : "nowrap";
  交叉轴多行按钮.style.filter = 弹性换行.checked
    ? "brightness(100%)"
    : `brightness(${已屏蔽亮度})`;
  交叉轴多行按钮.style.pointerEvents = 弹性换行.checked ? "auto" : "none";
  交叉轴多行分布区.style.filter = 弹性换行.checked
    ? "brightness(100%)"
    : `brightness(${已屏蔽亮度})`;
  交叉轴多行分布区.style.pointerEvents = 弹性换行.checked ? "auto" : "none";
  更新弹性元素位置();
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
间隙区.style.filter = `brightness(${已屏蔽亮度})`;
间隙区.style.pointerEvents = "none";

function 修改行间隙值() {
  行间隙.nextElementSibling.textContent = 行间隙.value;
  调整行间隙位置();
  弹性展示区.style.rowGap = `${行间隙.value}px`;
  let 行间隙比率 = (行间隙.value * 100) / 行间隙.max;
  root.style.setProperty("--行间隙比率", `${行间隙比率}%`);
  更新弹性元素位置();
}

function 修改列间隙值() {
  列间隙.nextElementSibling.textContent = 列间隙.value;
  调整列间隙位置();
  弹性展示区.style.columnGap = `${列间隙.value}px`;
  let 列间隙比率 = (列间隙.value * 100) / 列间隙.max;
  root.style.setProperty("--列间隙比率", `${列间隙比率}%`);
  更新弹性元素位置();
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
let 当前按钮 = 主轴按钮;

const 轴分布类型 = document.getElementsByClassName("轴分布类型")[0];
轴分布类型.style.filter = `brightness(${已屏蔽亮度})`;
轴分布类型.style.pointerEvents = "none";

主轴按钮.addEventListener("click", (event) => {
  if (块布局.checked) return;
  当前按钮.classList.remove("当前按钮");
  主轴按钮.classList.add("当前按钮");
  当前按钮 = 主轴按钮;
  event.target.style.background =
    "linear-gradient(90deg, rgb(159, 159, 159) 0%, rgb(205, 205, 205) 100%)";
  event.target.style.color = "black";
  弹性轴区样式初始化();
});

交叉轴单行按钮.addEventListener("click", (event) => {
  if (块布局.checked) return;
  当前按钮.classList.remove("当前按钮");
  交叉轴单行按钮.classList.add("当前按钮");
  当前按钮 = 交叉轴单行按钮;
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
  当前按钮.classList.remove("当前按钮");
  交叉轴多行按钮.classList.add("当前按钮");
  当前按钮 = 交叉轴多行按钮;
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
  更新弹性元素位置();
}

function 修改交叉轴单行布局(event) {
  let id = event.target.id;
  const label = document.querySelector(`label[for=${id}]`);
  const 代码 = label.getElementsByClassName("代码")[0].textContent;
  弹性展示区.style.alignItems = `${代码}`;
  更新弹性元素位置();
}

function 修改交叉轴多行布局(event) {
  let id = event.target.id;
  const label = document.querySelector(`label[for=${id}]`);
  const 代码 = label.getElementsByClassName("代码")[0].textContent;
  弹性展示区.style.alignContent = `${代码}`;
  更新弹性元素位置();
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
尺寸区.style.filter = `brightness(${已屏蔽亮度})`;
尺寸区.style.pointerEvents = "none";

function 修改弹性收缩() {
  收缩滑块.nextElementSibling.textContent = 收缩滑块.value;
  调整收缩数字位置();
  let 收缩比率 = (收缩滑块.value * 100) / 收缩滑块.max;
  root.style.setProperty("--收缩比率", `${收缩比率}%`);
  Array.from(展示区块组).forEach((element) => {
    element.style.flexShrink = 收缩滑块.value;
  });
  更新弹性元素位置();
}

function 修改弹性扩张() {
  扩张滑块.nextElementSibling.textContent = 扩张滑块.value;
  调整扩张数字位置();
  let 扩张比率 = (扩张滑块.value * 100) / 扩张滑块.max;
  root.style.setProperty("--扩张比率", `${扩张比率}%`);
  Array.from(展示区块组).forEach((element) => {
    element.style.flexGrow = 扩张滑块.value;
  });
  更新弹性元素位置();
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

function 屏蔽弹性布局操作区() {
  轴分布三区.style.filter = `brightness(${已屏蔽亮度})`;
  轴分布三区.style.pointerEvents = "none";
  轴方向区.style.filter = `brightness(${已屏蔽亮度})`;
  轴方向区.style.pointerEvents = "none";
  换行区.style.filter = `brightness(${已屏蔽亮度})`;
  换行区.style.pointerEvents = "none";
  间隙区.style.filter = `brightness(${已屏蔽亮度})`;
  间隙区.style.pointerEvents = "none";
  轴分布类型.style.filter = `brightness(${已屏蔽亮度})`;
  轴分布类型.style.pointerEvents = "none";
  尺寸区.style.filter = `brightness(${已屏蔽亮度})`;
  尺寸区.style.pointerEvents = "none";
}

function 重置参数() {
  盒子数量滑块.value = 初始块元素数量;
  盒子数量滑块.nextElementSibling.textContent = 盒子数量滑块.value;
  调整盒子数量数字位置();
  弹性展示区.innerHTML = "";
  弹性展示区.style.display = "block";
  固定尺寸单选.checked = true;
  创建块元素(初始块元素数量);

  块布局.checked = true;
  弹性布局.checked = false;

  主轴行.checked = true;
  主轴列.checked = false;

  弹性不换行.checked = true;
  弹性展示区.style.flexWrap = 弹性换行.checked ? "wrap" : "nowrap";

  行间隙.value = 0;
  行间隙.nextElementSibling.textContent = 行间隙.value;
  调整行间隙位置();
  列间隙.value = 0;
  列间隙.nextElementSibling.textContent = 列间隙.value;
  调整列间隙位置();

  主轴按钮.style.background =
    "linear-gradient(90deg, rgb(29, 29, 29) 0%, rgb(45, 45, 45) 100%)";
  主轴按钮.style.color = "white";
  弹性轴区样式初始化();
  主轴分布全部选项.forEach((element) => {
    element.checked = element.id.includes("正常");
  });
  交叉轴单行分布全部选项.forEach((element) => {
    element.checked = element.id.includes("正常");
  });
  交叉轴多行分布全部选项.forEach((element) => {
    element.checked = element.id.includes("正常");
  });

  屏蔽弹性布局操作区();

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
  
  更新弹性元素位置();
}
