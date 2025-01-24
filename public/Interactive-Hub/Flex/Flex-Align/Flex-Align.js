const root = document.querySelector(":root");
const 弹性容器 = document.querySelector(".弹性容器");
const 弹性项过渡时长 = 250;
let 交叉轴单行布局 = window.getComputedStyle(弹性容器).alignItems;
const 盒子数量滑块 = document.getElementById("盒子数量滑块");
const 盒子数量文本 = document.getElementById("盒子数量文本");
const 固定尺寸单选 = document.getElementById("固定");
const 随机尺寸单选 = document.getElementById("随机");
const 弹性不换行单选 = document.getElementById("nowrap-slider");
const 弹性换行单选 = document.getElementById("wrap-slider");
const 交叉轴内容操纵区 = document.querySelector("#交叉轴内容操纵区");
const 交叉轴项目操纵区 = document.querySelector("#交叉轴项目操纵区");
const 弹性包裹操纵区 = document.getElementById("弹性环绕操纵区");
const 弹性包裹按钮组 = 弹性包裹操纵区.querySelectorAll("input[type='radio']");
const 单选框组 = document.querySelectorAll("input[type='radio']");
const 选中指示器组 = document.querySelectorAll(".选中指示器");
const 交叉轴内容单选组 = 交叉轴内容操纵区.querySelectorAll(
  "input[type='radio']",
);
const 交叉轴项目单选组 = 交叉轴项目操纵区.querySelectorAll(
  "input[type='radio']",
);

const 弹性行首元素索引组 = [0];
const 最高元素高度组 = [];
let 前一次交叉轴内容对齐标签 =
  document.getElementById("content-正常-滑块").parentElement;

const 视口高度低于1180 = window.matchMedia("(height < 1180px)");
const 视口宽度低于1130 = window.matchMedia("(width < 1130px)");

视口宽度低于1130.addEventListener("change", () => {
  媒体查询时刷新指示器样式();
});

视口高度低于1180.addEventListener("change", () => {
  媒体查询时刷新指示器样式();

  弹性行首元素索引组.length = 0;
  弹性行首元素索引组.push(0);
  最高元素高度组.length = 0;
  setTimeout(() => {
    记录行数与每行首元素索引();
    生成弹性行();
    拉伸弹性行();
    生成弹性行高度();
    更新弹性项高度();
  }, 弹性项过渡时长 + 25);
});

function 媒体查询时刷新指示器样式() {
  for (const 选中指示器 of 选中指示器组) {
    const 操纵区 = 选中指示器.parentElement;
    const 操纵区按钮组 = Array.from(操纵区.querySelectorAll("input"));
    const 当前标签 = 操纵区按钮组.find((按钮) => 按钮.checked).parentElement;
    选中指示器.style.width = `${当前标签.offsetWidth}px`;
    选中指示器.style.height = `${当前标签.offsetHeight}px`;
    选中指示器.style.left = `${当前标签.offsetLeft}px`;
  }
}

生成弹性项(盒子数量滑块.value);
记录行数与每行首元素索引();
生成弹性行();
拉伸弹性行();
生成弹性行高度();

盒子数量滑块.addEventListener("input", 拖动盒子数量滑块);
固定尺寸单选.addEventListener("change", 修改弹性项尺寸类型);
随机尺寸单选.addEventListener("change", 修改弹性项尺寸类型);

for (const 弹性环绕按钮 of 弹性包裹按钮组) {
  弹性环绕按钮.addEventListener("input", () => {
    const 交叉轴内容对齐选中指示器 =
      document.getElementById("交叉轴内容选中指示器");
    if (弹性环绕按钮.id === "nowrap-slider") {
      弹性容器.style.flexWrap = "nowrap";
      const alignContentNormal = document.getElementById("content-正常-滑块");
      alignContentNormal.checked = true;
      弹性容器.style.alignContent = "normal";
      交叉轴内容对齐选中指示器.style.width = `${alignContentNormal.parentElement.offsetWidth}px`;
      交叉轴内容对齐选中指示器.style.height = `${alignContentNormal.parentElement.offsetHeight}px`;
      交叉轴内容对齐选中指示器.style.left = `${alignContentNormal.parentElement.offsetLeft}px`;
      弹性行首元素索引组.length = 0;
      弹性行首元素索引组.push(0);
      最高元素高度组.length = 0;
      记录行数与每行首元素索引();
      生成弹性行();
      拉伸弹性行();
      生成弹性行高度();
      交叉轴内容操纵区.style.filter = "brightness(50%)";
      交叉轴内容操纵区.style.pointerEvents = "none";
    } else {
      弹性容器.style.flexWrap = "wrap";
      前一次交叉轴内容对齐标签.querySelector("input[type='radio']").checked =
        true;
      弹性容器.style.alignContent =
        前一次交叉轴内容对齐标签.querySelector("span").innerText;
      交叉轴内容对齐选中指示器.style.width = `${前一次交叉轴内容对齐标签.offsetWidth}px`;
      交叉轴内容对齐选中指示器.style.height = `${前一次交叉轴内容对齐标签.offsetHeight}px`;
      交叉轴内容对齐选中指示器.style.left = `${前一次交叉轴内容对齐标签.offsetLeft}px`;
      弹性行首元素索引组.length = 0;
      弹性行首元素索引组.push(0);
      最高元素高度组.length = 0;
      记录行数与每行首元素索引();
      生成弹性行();
      拉伸弹性行();
      生成弹性行高度();
      交叉轴内容操纵区.style.filter = "brightness(100%)";
      交叉轴内容操纵区.style.pointerEvents = "all";
    }
  });
}

for (const 单选按钮 of 交叉轴内容单选组) {
  单选按钮.addEventListener("input", () => {
    const 弹性不环绕按钮 = document.getElementById("nowrap-slider");
    if (弹性不环绕按钮.checked) return;
    弹性容器.style.alignContent = 单选按钮.previousElementSibling.innerText;
    前一次交叉轴内容对齐标签 = 单选按钮.parentElement;
    弹性行首元素索引组.length = 0;
    弹性行首元素索引组.push(0);
    最高元素高度组.length = 0;
    const 弹性行指示区 = 弹性容器.querySelector(".弹性行指示区");
    弹性行指示区.style.alignContent = 弹性容器.style.alignContent;

    记录行数与每行首元素索引();
    生成弹性行();
    拉伸弹性行();
    生成弹性行高度();
  });
}

for (const 单选按钮 of 交叉轴项目单选组) {
  单选按钮.addEventListener("input", () => {
    弹性容器.style.alignItems = 单选按钮.previousElementSibling.innerText;
    交叉轴单行布局 = window.getComputedStyle(弹性容器).alignItems;
    弹性行首元素索引组.length = 0;
    弹性行首元素索引组.push(0);
    最高元素高度组.length = 0;
  });
}

for (const 选中指示器 of 选中指示器组) {
  const 第一标签 = 选中指示器.nextElementSibling;
  选中指示器.style.width = `${第一标签.offsetWidth}px`;
  选中指示器.style.height = `${第一标签.offsetHeight}px`;
  选中指示器.style.left = `${第一标签.offsetLeft}px`;
}

for (const 单选框 of 单选框组) {
  单选框.addEventListener("input", () => {
    const 标签 = 单选框.parentElement;
    const 选中指示器 = 标签.parentElement.querySelector(".选中指示器");
    选中指示器.style.width = `${标签.offsetWidth}px`;
    选中指示器.style.height = `${标签.offsetHeight}px`;
    选中指示器.style.left = `${标签.offsetLeft}px`;
  });
}

const 总区尺寸观察器 = new ResizeObserver(总区尺寸观察回调);
总区尺寸观察器.observe(document.querySelector(".弹性总区"));

/*const 弹性项尺寸观察器 = new ResizeObserver(弹性项尺寸观察回调);
弹性项尺寸观察器.observe(弹性容器.querySelector(".弹性项"));

function 弹性项尺寸观察回调(entries) {
  for (const entry of entries) {
    弹性行首元素索引组.length = 0;
    弹性行首元素索引组.push(0);
    最高元素高度组.length = 0;
    记录行数与每行首元素索引();
    生成弹性行();
    拉伸弹性行();
    生成弹性行高度();
    更新弹性项高度();
  }
}*/

function 拖动盒子数量滑块() {
  const 数量 = parseInt(盒子数量滑块.value, 10);
  const 比例 = 数量 / 盒子数量滑块.max;
  盒子数量滑块.style.setProperty("--盒子数量比例", `${比例 * 100}%`);
  盒子数量文本.textContent = `${数量}`;
  弹性容器.innerHTML = "";
  弹性行首元素索引组.length = 0;
  弹性行首元素索引组.push(0);
  最高元素高度组.length = 0;
  生成弹性项(数量);
  记录行数与每行首元素索引();
  生成弹性行();
  const 弹性行指示区 = 弹性容器.querySelector(".弹性行指示区");
  弹性行指示区.style.alignContent = 弹性容器.style.alignContent;
  拉伸弹性行();
  生成弹性行高度();
  更新弹性项高度();
}

function 生成弹性项(数量) {
  for (let i = 1; i <= 数量; i++) {
    const 弹性项 = document.createElement("div");
    弹性项.className = "弹性项";
    const 宽度上限 = 25;
    const 宽度下限 = 8.25;
    const 高度上限 = 25;
    const 高度下限 = 3;
    const 宽度 = Math.floor(
      Math.random() * (宽度上限 - 宽度下限 + 1) + 宽度下限,
    );
    const 高度 = Math.floor(
      Math.random() * (高度上限 - 高度下限 + 1) + 高度下限,
    );
    const 红 = Math.floor(Math.random() * 256);
    const 绿 = Math.floor(Math.random() * 256);
    const 蓝 = Math.floor(Math.random() * 256);
    const 背景色 = `rgb(${红}, ${绿}, ${蓝})`;
    弹性项.style.width = 固定尺寸单选.checked ? "12.5%" : `${宽度}%`;
    弹性项.style.height = 固定尺寸单选.checked ? "125px" : `${高度}%`;
    const 渐变扣除比例 = 100 / (8 * 高度);
    /*弹性项.style.backgroundImage = `linear-gradient(transparent ${渐变扣除比例}%, ${背景色} ${渐变扣除比例}%, ${背景色} ${
      100 - 渐变扣除比例
    }%, transparent ${100 - 渐变扣除比例}%)`;*/
    弹性项.style.backgroundImage = `linear-gradient(transparent 2px, ${背景色} 2px, ${背景色} calc(100% - 2px), transparent calc(100% - 2px))`;
    弹性容器.appendChild(弹性项);

    const 弹性项高度 = document.createElement("span");
    弹性项高度.className = "弹性项高度";
    const 弹性项高度数值 = document.createElement("span");
    弹性项高度数值.className = "弹性项高度数值";
    弹性项高度数值.textContent = `${高度 * 8}`;
    const 弹性项高度单位 = document.createElement("span");
    弹性项高度单位.className = "弹性项高度单位";
    弹性项高度单位.textContent = "px";
    弹性项高度.append(弹性项高度数值, 弹性项高度单位);

    弹性项.appendChild(弹性项高度);
  }
}

let 刷新数据与效果定时任务 = null;
let 延时清除定时刷新 = null;

function 修改弹性项尺寸类型() {
  clearTimeout(延时清除定时刷新);
  clearInterval(刷新数据与效果定时任务);
  const 弹性项组 = document.querySelectorAll(".弹性项");
  const 宽度上限 = 25;
  const 宽度下限 = 8.25;
  const 高度上限 = 25;
  const 高度下限 = 3;
  for (const 弹性项 of 弹性项组) {
    const 宽度 = Math.floor(
      Math.random() * (宽度上限 - 宽度下限 + 1) + 宽度下限,
    );
    const 高度 = Math.floor(
      Math.random() * (高度上限 - 高度下限 + 1) + 高度下限,
    );
    弹性项.style.width = 固定尺寸单选.checked ? "12.5%" : `${宽度}%`;
    弹性项.style.height = 固定尺寸单选.checked ? "125px" : `${高度}%`;
  }

  刷新数据与效果定时任务 = setInterval(() => {
    更新弹性项高度();
    if (弹性不换行单选.checked) {
      return;
    }
    弹性行首元素索引组.length = 0;
    弹性行首元素索引组.push(0);
    最高元素高度组.length = 0;
    记录行数与每行首元素索引();
    生成弹性行();
    拉伸弹性行();
    生成弹性行高度();
  }, 25);

  延时清除定时刷新 = setTimeout(() => {
    clearInterval(刷新数据与效果定时任务);
  }, 弹性项过渡时长 + 25);

  /*setTimeout(() => {
    弹性行首元素索引组.length = 0;
    弹性行首元素索引组.push(0);
    最高元素高度组.length = 0;
    记录行数与每行首元素索引();
    生成弹性行();
    拉伸弹性行();
    生成弹性行高度();
    更新弹性项高度();
  }, 弹性项过渡时长 + 25);*/
}

function 更新弹性项高度() {
  const 弹性项组 = document.querySelectorAll(".弹性项");
  for (const 弹性项 of 弹性项组) {
    const 弹性项高度数值 = 弹性项.querySelector(".弹性项高度数值");
    弹性项高度数值.textContent = 弹性项.offsetHeight;
  }
}

function 记录行数与每行首元素索引() {
  const 弹性项组 = 弹性容器.querySelectorAll(".弹性项");
  if (弹性项组.length === 0) return;

  const 第一项垂直偏移_top = 弹性项组[0].offsetTop;
  const 第一项垂直偏移_bottom =
    弹性项组[0].offsetTop + 弹性项组[0].offsetHeight;
  const 第一项垂直偏移_center =
    弹性项组[0].offsetTop + Math.floor(弹性项组[0].offsetHeight / 2);

  let 当前偏移 = 第一项垂直偏移_top;
  let 当前行最高高度 = 弹性项组[0].offsetHeight;

  switch (交叉轴单行布局) {
    case "normal":
    case "start":
    case "flex-start":
      当前偏移 = 第一项垂直偏移_top;
      break;
    case "end":
    case "flex-end":
      当前偏移 = 第一项垂直偏移_bottom;
      break;
    case "center":
      当前偏移 = 第一项垂直偏移_center;
      break;
  }

  for (const [索引, 元素] of 弹性项组.entries()) {
    if (索引 === 0) continue;

    let 偏移比较对象 = 元素.offsetTop;

    switch (交叉轴单行布局) {
      case "normal":
      case "start":
      case "flex-start":
        偏移比较对象 = 元素.offsetTop;
        break;
      case "end":
      case "flex-end":
        偏移比较对象 = 元素.offsetTop + 元素.offsetHeight;
        break;
      case "center":
        偏移比较对象 = 元素.offsetTop + Math.floor(元素.offsetHeight / 2);
        break;
    }

    if (
      (交叉轴单行布局 !== "center" && 交叉轴单行布局 !== "end" && 交叉轴单行布局 !== "flex-end" && 偏移比较对象 !== 当前偏移) ||
      ((交叉轴单行布局 === "center" || 交叉轴单行布局 === "end" || 交叉轴单行布局 === "flex-end") && Math.abs(偏移比较对象 - 当前偏移) > 1)
    ) {
      弹性行首元素索引组.push(索引);
      当前偏移 = 偏移比较对象;
      最高元素高度组.push(当前行最高高度);
      当前行最高高度 = 元素.offsetHeight;
    } else {
      if (元素.offsetHeight > 当前行最高高度) {
        当前行最高高度 = 元素.offsetHeight;
      }
    }
  }
  最高元素高度组.push(当前行最高高度);
}

function 生成弹性行() {
  const 原指示区 = 弹性容器.querySelector(".弹性行指示区");
  原指示区?.remove();
  const 弹性行指示区 = document.createElement("div");
  弹性行指示区.className = "弹性行指示区";
  弹性行指示区.style.alignContent = 弹性容器.style.alignContent;
  弹性容器.prepend(弹性行指示区);

  for (let i = 0; i < 最高元素高度组.length; i++) {
    const 弹性行 = document.createElement("div");
    弹性行.className = "弹性行";
    弹性行.style.height = `${最高元素高度组[i]}px`;
    弹性行指示区.appendChild(弹性行);
  }
}

function 生成弹性行高度() {
  const 弹性行组 = document.getElementsByClassName("弹性行");

  for (let i = 0; i < 弹性行组.length; i++) {
    const 弹性行数据 = document.createElement("div");
    弹性行数据.className = "弹性行数据";
    弹性行组[i].appendChild(弹性行数据);
    const 弹性数据标题 = document.createElement("span");
    弹性数据标题.className = "弹性数据标题";
    const 标题第一部分 = document.createElement("span");
    标题第一部分.className = "标题前缀";
    标题第一部分.textContent = "第";
    const 标题第二部分 = document.createElement("span");
    标题第二部分.className = "标题行号";
    标题第二部分.textContent = `${i + 1}`;
    const 标题第三部分 = document.createElement("span");
    标题第三部分.className = "标题后缀";
    标题第三部分.textContent = "行 - 高度：";
    弹性数据标题.append(标题第一部分, 标题第二部分, 标题第三部分);
    const 弹性数据 = document.createElement("span");
    弹性数据.className = "弹性数据";
    const 弹性数据数值 = document.createElement("span");
    弹性数据数值.className = "弹性数据数值";
    弹性数据数值.textContent = `${弹性行组[i].offsetHeight}`;
    const 弹性数据单位 = document.createElement("span");
    弹性数据单位.className = "弹性数据单位";
    弹性数据单位.textContent = "px";
    弹性数据.append(弹性数据数值, 弹性数据单位);
    弹性行数据.append(弹性数据标题, 弹性数据);
  }
}

function 拉伸弹性行() {
  const 弹性行指示区 = 弹性容器.querySelector(".弹性行指示区");
  const 交叉轴多行布局 = window.getComputedStyle(弹性行指示区).alignContent;
  if (交叉轴多行布局 === "normal" || 交叉轴多行布局 === "stretch") {
    let 所有行高度和 = 0;
    const 弹性行组 = document.querySelectorAll(".弹性行");
    for (const 弹性行 of 弹性行组) {
      所有行高度和 += 弹性行.offsetHeight;
    }

    const 剩余空间 = 弹性容器.offsetHeight - 所有行高度和;

    for (const 弹性行 of 弹性行组) {
      弹性行.style.height = `${
        弹性行.offsetHeight + 剩余空间 / 弹性行组.length
      }px`;
    }
  }
}

function 总区尺寸观察回调(entries) {
  for (const entry of entries) {
    setTimeout(() => {
      弹性行首元素索引组.length = 0;
      弹性行首元素索引组.push(0);
      最高元素高度组.length = 0;
      记录行数与每行首元素索引();
      生成弹性行();
      拉伸弹性行();
      生成弹性行高度();
      更新弹性项高度();
    }, 弹性项过渡时长 + 25);
  }
}

const 重置按钮 = document.querySelector(".重置按钮");
重置按钮.addEventListener("click", 重置参数);

function 重置参数() {
  clearInterval(刷新数据与效果定时任务);
  盒子数量滑块.value = 10;
  盒子数量文本.textContent = "10";
  盒子数量滑块.style.setProperty("--盒子数量比例", "50%");
  固定尺寸单选.checked = true;
  弹性包裹按钮组[0].checked = true;
  交叉轴内容单选组[0].checked = true;
  交叉轴项目单选组[0].checked = true;
  前一次交叉轴内容对齐标签 =
    document.getElementById("content-正常-滑块").parentElement;
  媒体查询时刷新指示器样式();
  弹性容器.style.flexWrap = "";
  弹性容器.style.alignContent = "";
  弹性容器.style.alignItems = "";
  交叉轴单行布局 = window.getComputedStyle(弹性容器).alignItems;

  const 盒子透明 = document.getElementById("盒子透明复选框");
  const 行透明 = document.getElementById("行透明复选框");
  盒子透明.checked = false;
  行透明.checked = false;

  弹性容器.innerHTML = "";
  生成弹性项(盒子数量滑块.value);
  弹性行首元素索引组.length = 0;
  弹性行首元素索引组.push(0);
  最高元素高度组.length = 0;
  记录行数与每行首元素索引();
  生成弹性行();
  拉伸弹性行();
  生成弹性行高度();

  /*setTimeout(() => {
    记录行数与每行首元素索引();
    生成弹性行();
    拉伸弹性行();
    生成弹性行高度();
    更新弹性项高度();
  }, 弹性项过渡时长 + 25);*/
}
