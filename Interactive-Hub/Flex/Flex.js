window.addEventListener("load", () => {
  const 重置按钮 = document.getElementsByClassName("重置按钮")[0];
  重置按钮.addEventListener("click", 重置参数);
});

const root = document.querySelector(":root");

const 弹性展示区 = document.getElementsByClassName("弹性-展示区")[0];

const 块元素数量 = 12;
const 最低尺寸百分比 = 2;
const 最高尺寸百分比 = 20;
创建块元素(块元素数量);

function 创建块元素(数量) {
  for (let i = 1; i <= 数量; i++) {
    const element = document.createElement("div");
    element.className = i % 2 === 0 ? "弹性元素 偶元素" : "弹性元素 奇元素";
    element.style.backgroundColor = i % 2 === 0 ? "brown" : "steelblue";
    let 宽度百分比 = Math.floor(
      Math.random() * (最高尺寸百分比 - 最低尺寸百分比 + 1) + 最低尺寸百分比
    );
    let 高度百分比 = Math.floor(
      Math.random() * (最高尺寸百分比 - 最低尺寸百分比 + 1) + 最低尺寸百分比
    );
    element.style.width = `${宽度百分比}%`;
    element.style.height = `${高度百分比}%`;
    element.textContent = i;
    element.style.display = "flex";
    element.style.justifyContent = "center";
    element.style.alignItems = "center";
    element.style.fontSize = "1.5rem";
    弹性展示区.appendChild(element);
  }
}

const 展示区块组 = 弹性展示区.getElementsByTagName("div");

const 盒子数量滑块 = document.getElementById("box-count");
盒子数量滑块.setAttribute("盒子数量", 盒子数量滑块.value);
调整盒子数量数字位置();

盒子数量滑块.addEventListener("input", 修改盒子数量);

function 修改盒子数量() {
  盒子数量滑块.setAttribute("盒子数量", 盒子数量滑块.value);
  调整盒子数量数字位置();
  弹性展示区.innerHTML = "";
  创建块元素(盒子数量滑块.value);
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
    `calc(${修正值}% + (${8 - 修正值 * 0.15}px))`
  );
}

const 块布局 = document.getElementById("display-block");
const 弹性布局 = document.getElementById("display-flex");

块布局.addEventListener("change", 修改布局);
弹性布局.addEventListener("change", 修改布局);

function 修改布局() {
  if (块布局.checked) {
    弹性展示区.style.display = "block";
  } else {
    弹性展示区.style.display = "flex";
  }
}

const 主轴水平 = document.getElementById("flex-direction-row");
const 主轴垂直 = document.getElementById("flex-direction-column");

主轴水平.addEventListener("change", 修改主轴方向);
主轴垂直.addEventListener("change", 修改主轴方向);

function 修改主轴方向() {
  if (主轴水平.checked) {
    弹性展示区.style.flexDirection = "row";
  } else {
    弹性展示区.style.flexDirection = "column";
  }
}

const 弹性包裹 = document.getElementById("flex-wrap");
弹性包裹.addEventListener("input", 修改弹性包裹);

function 修改弹性包裹() {
  弹性展示区.style.flexWrap = 弹性包裹.checked ? "wrap" : "nowrap";
  console.log(弹性展示区.style.flexWrap);
}

const 收缩滑块 = document.getElementById("flex-shrink");
const 扩张滑块 = document.getElementById("flex-grow");

收缩滑块.setAttribute("收缩值", 收缩滑块.value);
扩张滑块.setAttribute("扩张值", 扩张滑块.value);
调整收缩数字位置();
调整扩张数字位置();

收缩滑块.addEventListener("input", 修改弹性收缩);
扩张滑块.addEventListener("input", 修改弹性扩张);

function 修改弹性收缩() {
  收缩滑块.setAttribute("收缩值", 收缩滑块.value);
  调整收缩数字位置();
  Array.from(展示区块组).forEach((element) => {
    element.style.flexShrink = 收缩滑块.value;
  });
}

function 修改弹性扩张() {
  扩张滑块.setAttribute("扩张值", 扩张滑块.value);
  调整扩张数字位置();
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
    `calc(${修正值}% + (${8 - 修正值 * 0.15}px))`
  );
}

function 调整扩张数字位置() {
  const 当前值 = 扩张滑块.value;
  const min = 扩张滑块.min ? 扩张滑块.min : 0;
  const max = 扩张滑块.max ? 扩张滑块.max : 100;
  const 修正值 = Number(((当前值 - min) * 100) / (max - min));
  root.style.setProperty(
    "--扩张值左偏移",
    `calc(${修正值}% + (${8 - 修正值 * 0.15}px))`
  );
}

function 重置参数() {}
