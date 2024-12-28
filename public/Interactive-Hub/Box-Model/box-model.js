const root = document.querySelector(":root");
const 滑块组 = document.querySelectorAll("input[type='range']");
const 内容盒子单选框 = document.querySelector("#内容盒子");
const 边框盒子单选框 = document.querySelector("#边框盒子");
const 盒子 = document.querySelector(".边框盒子");
const 盒子计算样式 = window.getComputedStyle(盒子);
const 内容盒子 = document.querySelector(".内容盒子");
const 外边距盒子 = document.querySelector(".外边距盒子");

const 宽度滑块 = document.querySelector("#宽度");
const 高度滑块 = document.querySelector("#高度");
const 宽高关联复选框 = document.querySelector("#宽高关联");
const 内边距滑块 = document.querySelector("#内边距");
const 边框滑块 = document.querySelector("#边框");
const 外边距滑块 = document.querySelector("#外边距");

const 盒子尺寸中文 = document.querySelector(".盒子尺寸中文");

const 外边距辅助复选框 = document.querySelector("#外边距-辅助");
const 边框辅助复选框 = document.querySelector("#边框-辅助");
const 内边距辅助复选框 = document.querySelector("#内边距-辅助");
const 内容辅助复选框 = document.querySelector("#内容-辅助");
const 盒子属性辅助复选框组 = document.querySelectorAll(
  ".盒子模型属性信息区 input[type='checkbox']",
);

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
  刷新宽度数值显示();
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
  刷新宽度数值显示();
});

边框滑块.addEventListener("input", () => {
  root.style.setProperty("--边框尺寸", `${边框滑块.value}px`);
  刷新宽度数值显示();
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
  // root.style.setProperty(`--${滑块.id}修剪比例`, `${100 - 滑块比例 * 100}%`);
  root.style.setProperty(`--${滑块.id}修剪比例`, `${滑块比例 * 100}%`);
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
  刷新宽度数值显示();
}

function 刷新宽度数值显示() {
  const 边框盒子宽度描述区 =
    document.querySelector(".外边距盒子 > .盒子宽度描述区");
  const 内容宽度数字 = 内容盒子.querySelector(".宽度数字");
  const 盒子宽度数字 = 外边距盒子.querySelector(".边框盒子尺寸区 .宽度数字");
  const 内容数字 = 外边距盒子.querySelector(".边框盒子尺寸区 .内容数字");
  const 内容中文 = 外边距盒子.querySelector(".边框盒子尺寸区 .内容中文");
  const 内容代码 = 外边距盒子.querySelector(".边框盒子尺寸区 .内容代码");
  const 内边距数字 = 外边距盒子.querySelector(".边框盒子尺寸区 .内边距数字");
  const 边框数字 = 外边距盒子.querySelector(".边框盒子尺寸区 .边框数字");

  const 内容盒子宽度描述区 = 内容盒子.querySelector(".盒子宽度描述区");
  const 加号区组 = document.querySelectorAll(".加号区");
  const 内边距区 = document.querySelector(".内边距区");
  const 边框区 = document.querySelector(".边框区");
  if (内容盒子单选框.checked) {
    内容宽度数字.textContent = 宽度滑块.value;
    盒子宽度数字.textContent = (
      parseInt(宽度滑块.value, 10) +
      parseInt(内边距滑块.value, 10) * 2 +
      parseInt(边框滑块.value, 10) * 2
    ).toString();
    内容数字.textContent = 宽度滑块.value;
    内容中文.textContent = "内容";
    内容代码.textContent = "content";
    内边距数字.textContent = 内边距滑块.value;
    边框数字.textContent = 边框滑块.value;
    for (const 加号区 of 加号区组) {
      加号区.style.display = "";
    }
    内边距区.style.display = "";
    边框区.style.display = "";
    内容盒子宽度描述区.style.display = "";
    边框盒子宽度描述区.classList.remove("边框盒子宽度描述区");
  } else {
    内容数字.textContent = 宽度滑块.value;
    内容宽度数字.textContent = 宽度滑块.value;
    内容中文.textContent = "宽度";
    内容代码.textContent = "width";
    盒子宽度数字.textContent = parseInt(盒子计算样式.width, 10).toString();
    for (const 加号区 of 加号区组) {
      加号区.style.display = "none";
    }
    内边距区.style.display = "none";
    边框区.style.display = "none";
    内容盒子宽度描述区.style.display = "none";
    边框盒子宽度描述区.classList.add("边框盒子宽度描述区");
  }
}

const 外边距闪烁关键帧序列 = [
  { backgroundColor: "transparent" },
  { backgroundColor: "#b0835460" },
  { backgroundColor: "transparent" },
];

const 透明度关键帧序列 = [{ opacity: "1" }, { opacity: "0" }, { opacity: "1" }];

/*const 边框闪烁关键帧序列 = [
  { borderColor: "#e4c482" },
  { borderColor: "black" },
  { borderColor: "#e4c482" },
];

const 内边距闪烁关键帧序列 = [
  { backgroundColor: "#788053" },
  { backgroundColor: "#234" },
  { backgroundColor: "#788053" },
];*/

const 闪烁选项 = {
  easing: "ease-out",
  duration: 2000,
  iterations: Infinity,
};

let 外边距动画 = null;
let 外边距文本动画 = null;
/*let 边框动画 = null;
let 内边距动画 = null;*/

for (const 复选框 of 盒子属性辅助复选框组) {
  复选框.addEventListener("change", () => {
    const 文本 = document.querySelector(`.盒子${复选框.id.slice(0, -3)}文本`);
    文本.style.opacity = 复选框.checked ? "1" : "0";
  });
}

const 外边距效果单选组 = document.querySelectorAll(".外边距效果单选区 .单选框");

for (const 效果单选 of 外边距效果单选组) {
  效果单选.addEventListener("change", () => {
    const 盒子外边距文本 = document.querySelector(".盒子外边距文本");
    if (效果单选.id === "外边距-闪烁") {
      外边距动画 = 外边距盒子.animate(外边距闪烁关键帧序列, 闪烁选项);
      if (外边距辅助复选框.checked) {
        外边距文本动画 = 盒子外边距文本.animate(透明度关键帧序列, 闪烁选项);
      }
      外边距盒子.classList.remove("已隐藏");
    } else if (效果单选.id === "外边距-显示") {
      外边距动画?.cancel();
      外边距文本动画?.cancel();
      外边距盒子.style.backgroundColor = "#b08354";
      if (外边距辅助复选框.checked) {
        盒子外边距文本.style.opacity = "1";
      }
      外边距盒子.classList.remove("已隐藏");
    } else {
      外边距动画?.cancel();
      外边距文本动画?.cancel();
      外边距盒子.style.backgroundColor = "transparent";
      盒子外边距文本.style.opacity = "0";
      外边距盒子.classList.add("已隐藏");
    }
  });
}

/*
const 边框效果单选组 = document.querySelectorAll(".边框效果单选区 .单选框");
for (const 效果单选 of 边框效果单选组) {
  效果单选.addEventListener("change", () => {
    if (效果单选.id === "边框-闪烁") {
      边框动画 = 盒子.animate(边框闪烁关键帧序列, 闪烁选项);
    } else if (效果单选.id === "边框-显示") {
      边框动画?.cancel();
      盒子.style.borderColor = "#e4c482";
    } else {
      边框动画?.cancel();
      盒子.style.borderColor = "transparent";
    }
  });
}

const 内边距效果单选组 = document.querySelectorAll(".内边距效果单选区 .单选框");
for (const 效果单选 of 内边距效果单选组) {
  效果单选.addEventListener("change", () => {
    if (效果单选.id === "内边距-闪烁") {
      内边距动画 = 盒子.animate(内边距闪烁关键帧序列, 闪烁选项);
    } else if (效果单选.id === "内边距-显示") {
      内边距动画?.cancel();
      盒子.style.backgroundColor = "#788053";
    } else {
      内边距动画?.cancel();
      盒子.style.backgroundColor = "transparent";
    }
  });
}*/

const 重置按钮 = document.querySelector(".重置按钮");
重置按钮.addEventListener("click", 重置参数);

function 重置参数() {
  内容盒子单选框.checked = true;
  更新盒子模型();
  更新盒子模型时刷新所有属性();

  /*宽度滑块.max = "350";
  高度滑块.max = "350";*/

  宽高关联复选框.checked = true;
  const 宽高关联图像 = 宽高关联复选框.parentElement.querySelector("img");
  宽高关联图像.src = "/Images/Common/绑定.png";

  宽度滑块.value = "300";
  高度滑块.value = "300";
  内边距滑块.value = "50";
  边框滑块.value = "50";
  外边距滑块.value = "50";

  for (const 滑块 of 滑块组) {
    拖动滑块时修改数字(滑块);
  }

  root.style.setProperty("--边框尺寸", "50px");
  root.style.setProperty("--内边距尺寸", "50px");
  root.style.setProperty("--外边距尺寸", "50px");
  root.style.setProperty("--盒子宽度", "300px");
  root.style.setProperty("--盒子高度", "300px");
  root.style.setProperty("--宽度修剪比例", "75%");
  root.style.setProperty("--高度修剪比例", "75%");
  root.style.setProperty("--内容修剪比例", "25%");
  root.style.setProperty("--内边距修剪比例", "50%");
  root.style.setProperty("--边框修剪比例", "50%");
  root.style.setProperty("--外边距修剪比例", "50%");

  // 盒子.style.boxSizing = "";

  /*外边距辅助复选框.checked = true;
  边框辅助复选框.checked = true;
  内边距辅助复选框.checked = true;
  内容辅助复选框.checked = true;*/

  for (const 复选框 of 盒子属性辅助复选框组) {
    复选框.checked = true;
    const 文本 = document.querySelector(`.盒子${复选框.id.slice(0, -3)}文本`);
    文本.style.opacity = 复选框.checked ? "1" : "0";
  }

  // 外边距效果单选组[0].checked = true;
  外边距动画?.cancel();
  外边距文本动画?.cancel();
  外边距盒子.style.backgroundColor = "#b08354";
  if (外边距辅助复选框.checked) {
    document.querySelector(".盒子外边距文本").style.opacity = "1";
  }
  外边距盒子.classList.remove("已隐藏");

  刷新宽度数值显示();
}
