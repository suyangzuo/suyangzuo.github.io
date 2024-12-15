const 展示区 = document.querySelector(".展示区");
const 外边距盒子 = 展示区.querySelector(".外边距盒子");
const 边框盒子 = 展示区.querySelector(".边框盒子");
const 内容盒子 = 展示区.querySelector(".内容盒子");
const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 初始外边距尺寸 = rootStyle.getPropertyValue("--外边距尺寸");
const 初始内边距尺寸 = rootStyle.getPropertyValue("--内边距尺寸");
const 初始边框尺寸 = rootStyle.getPropertyValue("--边框尺寸");
const 初始内容尺寸 = rootStyle.getPropertyValue("--内容尺寸");

const 操作区 = document.querySelector(".操作区");
const 内容盒子单选框 = 操作区.querySelector("#内容盒子");
const 边框盒子单选框 = 操作区.querySelector("#边框盒子");
const 宽度滑块 = 操作区.querySelector("#宽度");
const 高度滑块 = 操作区.querySelector("#高度");
const 内容滑块 = 操作区.querySelector("#内容");
const 内边距滑块 = 操作区.querySelector("#内边距");
const 边框滑块 = 操作区.querySelector("#边框");
const 外边距滑块 = 操作区.querySelector("#外边距");
const 模型设置区 = 操作区.querySelector(".模型设置区");
const 模型滑块组 = 模型设置区.querySelectorAll(".范围滑块");
const 盒子尺寸中文 = 操作区.querySelector(".盒子尺寸中文");

外边距盒子.style.width = `calc(${window.getComputedStyle(边框盒子).width} + ${初始外边距尺寸} * 2)`;
外边距盒子.style.height = `calc(${window.getComputedStyle(边框盒子).height} + ${初始外边距尺寸} * 2)`;

内容盒子单选框.addEventListener("change", () => {
  盒子尺寸中文.textContent = "内容尺寸";
  设置宽高元素属性();
});

边框盒子单选框.addEventListener("change", () => {
  盒子尺寸中文.textContent = "盒子尺寸";
  设置宽高元素属性();
});

function 设置宽高元素属性() {
  if (边框盒子单选框.checked) {
    宽度滑块.min = "150";
    宽度滑块.max = "750";
    高度滑块.min = "150";
    高度滑块.max = "750";
    宽度滑块.value = parseInt(window.getComputedStyle(边框盒子).width, 10);
    高度滑块.value = parseInt(window.getComputedStyle(边框盒子).height, 10);
  } else {
    宽度滑块.min = "150";
    宽度滑块.max = "350";
    高度滑块.min = "150";
    高度滑块.max = "350";
    宽度滑块.value = parseInt(window.getComputedStyle(内容盒子).width, 10);
    高度滑块.value = parseInt(window.getComputedStyle(内容盒子).height, 10);
  }
  const 宽度修剪百分比 = 获取滑块背景修剪百分比(宽度滑块);
  const 高度修剪百分比 = 获取滑块背景修剪百分比(高度滑块);
  root.style.setProperty("--宽度修剪比例", 宽度修剪百分比);
  root.style.setProperty("--高度修剪比例", 高度修剪百分比);
  拖动滑块时修改数字(宽度滑块);
  拖动滑块时修改数字(高度滑块);
}

宽度滑块.addEventListener("input", (event) => {
  const 百分比 = 获取滑块背景修剪百分比(event.target);
  root.style.setProperty("--宽度修剪比例", 百分比);
  root.style.setProperty("--内容盒子宽度", `${event.target.value}px`);
  设置外边距盒子尺寸();
  拖动滑块时修改数字(event.target);
});

高度滑块.addEventListener("input", (event) => {
  const 百分比 = 获取滑块背景修剪百分比(event.target);
  root.style.setProperty("--高度修剪比例", 百分比);
  root.style.setProperty("--内容盒子高度", `${event.target.value}px`);
  设置外边距盒子尺寸();
  拖动滑块时修改数字(event.target);
});

内容滑块.addEventListener("input", (event) => {
  const 百分比 = 获取滑块背景修剪百分比(event.target);
  root.style.setProperty("--内容修剪比例", 百分比);
  root.style.setProperty("--内容尺寸", `${event.target.value}px`);
  root.style.setProperty("--内容盒子宽度", `${event.target.value}px`);
  root.style.setProperty("--内容盒子高度", `${event.target.value}px`);
  if (内容盒子单选框.checked) {
    宽度滑块.value = event.target.value;
    高度滑块.value = event.target.value;
    const 宽度百分比 = 获取滑块背景修剪百分比(宽度滑块);
    const 高度百分比 = 获取滑块背景修剪百分比(高度滑块);
    root.style.setProperty("--宽度修剪比例", 宽度百分比);
    root.style.setProperty("--高度修剪比例", 高度百分比);
    拖动滑块时修改数字(宽度滑块);
    拖动滑块时修改数字(高度滑块);
  }
  设置外边距盒子尺寸();
  拖动滑块时修改数字(event.target);
});

内边距滑块.addEventListener("input", (event) => {
  const 百分比 = 获取滑块背景修剪百分比(event.target);
  root.style.setProperty("--内边距修剪比例", 百分比);
  root.style.setProperty("--内边距尺寸", `${event.target.value}px`);
  设置外边距盒子尺寸();
  拖动滑块时修改数字(event.target);
});

边框滑块.addEventListener("input", (event) => {
  const 百分比 = 获取滑块背景修剪百分比(event.target);
  root.style.setProperty("--边框修剪比例", 百分比);
  root.style.setProperty("--边框尺寸", `${event.target.value}px`);
  设置外边距盒子尺寸();
  拖动滑块时修改数字(event.target);
});

外边距滑块.addEventListener("input", (event) => {
  const 百分比 = 获取滑块背景修剪百分比(event.target);
  root.style.setProperty("--外边距修剪比例", 百分比);
  root.style.setProperty("--外边距尺寸", `${event.target.value}px`);
  设置外边距盒子尺寸();
  拖动滑块时修改数字(event.target);
});

function 获取滑块背景修剪百分比(滑块) {
  const 滑块值 = parseInt(滑块.value, 10);
  const 最小值 = parseInt(滑块.min, 10);
  const 最大值 = parseInt(滑块.max, 10);
  const 滑块比例 = (滑块值 - 最小值) / (最大值 - 最小值);
  return `${100 - 滑块比例 * 100}%`;
}

function 拖动滑块时修改数字(滑块) {
  const 数字 = 滑块.parentElement.querySelector(".数字");
  数字.textContent = 滑块.value;
}

function 设置外边距盒子尺寸() {
  const 实时根元素样式 = window.getComputedStyle(root);
  const 内容尺寸 = 实时根元素样式.getPropertyValue("--内容尺寸");
  const 内容宽度 = 实时根元素样式.getPropertyValue("--内容盒子宽度");
  const 内容高度 = 实时根元素样式.getPropertyValue("--内容盒子高度");
  const 内边距尺寸 = 实时根元素样式.getPropertyValue("--内边距尺寸");
  const 边框尺寸 = 实时根元素样式.getPropertyValue("--边框尺寸");
  const 外边距尺寸 = 实时根元素样式.getPropertyValue("--外边距尺寸");

  外边距盒子.style.width = `calc(${内容宽度} + ${内边距尺寸} * 2 + ${边框尺寸} * 2 + ${外边距尺寸} * 2)`;
  外边距盒子.style.height = `calc(${内容高度} + ${内边距尺寸} * 2 + ${边框尺寸} * 2 + ${外边距尺寸} * 2)`;
}
