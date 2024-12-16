const root = document.querySelector(":root");
const 滑块组 = document.querySelectorAll("input[type='range']");
const 内容盒子单选框 = document.querySelector("#内容盒子");
const 边框盒子单选框 = document.querySelector("#边框盒子");
const 盒子 = document.querySelector(".边框盒子");

const 宽度滑块 = document.querySelector("#宽度");
const 高度滑块 = document.querySelector("#高度");
const 宽高关联复选框 = document.querySelector("#宽高关联");
const 内边距滑块 = document.querySelector("#内边距");
const 边框滑块 = document.querySelector("#边框");
const 外边距滑块 = document.querySelector("#外边距");

const 盒子尺寸中文 = document.querySelector(".盒子尺寸中文");

内容盒子单选框.addEventListener("change", 更新盒子模型时刷新所有属性);
边框盒子单选框.addEventListener("change", 更新盒子模型时刷新所有属性);

宽度滑块.addEventListener("input", () => {
  root.style.setProperty("--盒子宽度", `${宽度滑块.value}px`);
  if (宽高关联复选框.checked) {
    高度滑块.value = 宽度滑块.value;
    root.style.setProperty("--盒子高度", `${高度滑块.value}px`);
    更新滑块背景修剪百分比(高度滑块);
    拖动滑块时修改数字(高度滑块);
  }
});

高度滑块.addEventListener("input", () => {
  root.style.setProperty("--盒子高度", `${高度滑块.value}px`);
  if (宽高关联复选框.checked) {
    宽度滑块.value = 高度滑块.value;
    root.style.setProperty("--盒子宽度", `${宽度滑块.value}px`);
    更新滑块背景修剪百分比(宽度滑块);
    拖动滑块时修改数字(宽度滑块);
  }
});

内边距滑块.addEventListener("input", () => {
  root.style.setProperty("--内边距尺寸", `${内边距滑块.value}px`);
});

边框滑块.addEventListener("input", () => {
  root.style.setProperty("--边框尺寸", `${边框滑块.value}px`);
});

外边距滑块.addEventListener("input", () => {
  root.style.setProperty("--外边距尺寸", `${外边距滑块.value}px`);
});

for (const 滑块 of 滑块组) {
  滑块.addEventListener("input", () => {
    更新滑块背景修剪百分比(滑块);
    拖动滑块时修改数字(滑块);
  });
}

宽高关联复选框.addEventListener("change", () => {
  const 宽高关联图像 = 宽高关联复选框.parentElement.querySelector("img");
  if (宽高关联复选框.checked) {
    宽高关联图像.src = "/Images/Common/绑定.png";
  } else {
    宽高关联图像.src = "/Images/Common/X-标记.png";
  }
});

function 更新滑块背景修剪百分比(滑块) {
  const 滑块值 = parseInt(滑块.value, 10);
  const 最小值 = parseInt(滑块.min, 10);
  const 最大值 = parseInt(滑块.max, 10);
  const 滑块比例 = (滑块值 - 最小值) / (最大值 - 最小值);
  root.style.setProperty(`--${滑块.id}修剪比例`, `${100 - 滑块比例 * 100}%`);
}

function 拖动滑块时修改数字(滑块) {
  const 数字 = 滑块.parentElement.querySelector(".数字");
  数字.textContent = 滑块.value;
}

function 更新盒子模型() {
  盒子.style.boxSizing = 内容盒子单选框.checked ? "content-box" : "border-box";
  盒子尺寸中文.textContent = 内容盒子单选框.checked ? "内容尺寸" : "盒子尺寸";
}

function 更新宽高滑块属性() {
  宽度滑块.max = 内容盒子单选框.checked ? "350" : "750";
  高度滑块.max = 内容盒子单选框.checked ? "350" : "750";
}

function 更新盒子模型时刷新所有属性() {
  更新盒子模型();
  更新宽高滑块属性();
  更新滑块背景修剪百分比(宽度滑块);
  更新滑块背景修剪百分比(高度滑块);
  拖动滑块时修改数字(宽度滑块);
  拖动滑块时修改数字(高度滑块);
  root.style.setProperty("--盒子宽度", `${宽度滑块.value}px`);
  root.style.setProperty("--盒子高度", `${高度滑块.value}px`);
}
