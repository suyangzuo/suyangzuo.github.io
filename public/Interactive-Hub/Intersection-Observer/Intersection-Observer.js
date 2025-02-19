const root = document.querySelector(":root");
const 关闭设置区 = document.getElementById("关闭设置区");
const 视口 = document.querySelector(".视口");
const 根元素外边距控件区 = document.querySelector(".根元素外边距控件区");
const 根元素外边距滑块组 = 根元素外边距控件区.querySelectorAll(".范围滑块");
const 数字按钮组 = document.querySelectorAll(".数字按钮");

const 起始阈值滑块 = document.getElementById("起始阈值");
const 阈值数量滑块 = document.getElementById("数量");
const 阈值步长滑块 = document.getElementById("步长");
const 阈值控件区 = document.querySelector(".阈值控件区");

const 已交叉复选框 = document.getElementById("已交叉");
const 未交叉复选框 = document.getElementById("未交叉");
const 回调特效复选框 = document.getElementById("显示回调特效");
const 交叉比复选框 = document.getElementById("显示交叉比");
const 交叉比容器 = document.querySelector(".交叉比容器");
const 交叉比值元素 = document.querySelector(".交叉比值");

const 根元素外边距上滑块 = document.getElementById("上");
const 根元素外边距右滑块 = document.getElementById("右");
const 根元素外边距下滑块 = document.getElementById("下");
const 根元素外边距左滑块 = document.getElementById("左");

for (const 滑块 of 根元素外边距滑块组) {
  滑块.addEventListener("input", () => {
    滑块.nextElementSibling.querySelector(".数值").textContent = `${滑块.value}`;
    root.style.setProperty(`--根元素外边距-${滑块.id}`, `${滑块.value}px`);
  });
}

for (const 按钮 of 数字按钮组) {
  let 数值快速变化延时函数 = null;
  let 数值快速变化定时函数 = null;
  const 数字框 = 按钮.parentElement.querySelector(".数字框");
  const 最小值 = parseFloat(数字框.min);
  const 步长 = parseFloat(数字框.step);
  const 变化类型 = 按钮.getAttribute("变化");

  按钮.addEventListener("mousedown", () => {
    更新数值();
    数值快速变化延时函数 = setTimeout(() => {
      数值快速变化定时函数 = setInterval(更新数值, 75);
    }, 500);
  });

  function 更新数值() {
    let 当前值 = parseFloat(数字框.value);
    if (变化类型 === "减少") {
      当前值 -= 步长;
    } else {
      当前值 += 步长;
    }
    if (当前值 < 最小值) {
      当前值 = 最小值;
    }

    if (当前值 === 0 || 数字框.id === "数量") {
      当前值 = Math.round(当前值);
    } else {
      当前值 = Math.round(当前值 * 100) / 100;
    }

    数字框.value = 当前值.toString();
  }

  按钮.addEventListener("mouseup", () => {
    clearInterval(数值快速变化定时函数);
    clearInterval(数值快速变化延时函数);
  });

  按钮.addEventListener("mouseleave", () => {
    clearInterval(数值快速变化定时函数);
    clearInterval(数值快速变化延时函数);
  });
}

交叉比复选框.addEventListener("change", () => {
  if (!交叉比复选框.checked) {
    交叉比容器.classList.add("隐藏");
  } else {
    交叉比容器.classList.remove("隐藏");
  }
});

const 关键帧序列 = [
  { backgroundColor: "transparent" },
  { backgroundColor: "brown" },
  { backgroundColor: "transparent" },
  { backgroundColor: "brown" },
  { backgroundColor: "transparent" },
];

const 动画选项 = {
  easing: "linear",
  duration: 500,
};

const 选项 = {
  root: null,
  rootMargin: `${根元素外边距上滑块.value}px ${根元素外边距右滑块.value}px ${根元素外边距下滑块.value}px ${根元素外边距左滑块.value}px`,
  threshold: [0],
};

function 回调(entries) {
  entries.forEach((entry) => {
    const 被观察者 = entry.target;
    if ((已交叉复选框.checked && entry.isIntersecting) || (!已交叉复选框.checked && !entry.isIntersecting)) {
      if (回调特效复选框.checked) {
        视口.animate(关键帧序列, 动画选项);
      }
    }
  });
}

起始阈值滑块.addEventListener("input", 更新阈值);
阈值数量滑块.addEventListener("input", 更新阈值);
阈值步长滑块.addEventListener("input", 更新阈值);
for (const 按钮 of 数字按钮组) {
  按钮.addEventListener("click", 更新阈值);
}

function 更新阈值() {
  选项.threshold.length = 0;
  let 阈值 = parseFloat(起始阈值滑块.value);
  const 阈值数量 = parseInt(阈值数量滑块.value, 10);
  const 步长 = parseFloat(阈值步长滑块.value);
  for (let i = 1; i <= 阈值数量; i++) {
    选项.threshold.push(阈值);
    阈值 += 步长;
    阈值 = Math.round(阈值 * 100) / 100;
    if (阈值 > 1) {
      break;
    }
  }
}
