const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 原始盒子 = document.querySelector("#原始盒子");
const 变换盒子 = document.querySelector("#变换盒子");
const 原点盒子 = document.querySelector("#原点盒子");
const 背景图确认框 = document.querySelector("#图像");

const 滑块组 = document.querySelectorAll(".滑块");
const 变换风格单选组 = document.querySelectorAll(".变换风格区 .单选框");
const 背面可见性单选组 = document.querySelectorAll(".背面可见性区 .单选框");
const 无透视单选框 = document.querySelector("#none");
const 透视滑块 = document.querySelector("#透视");
const 原点滑块组 = document.querySelectorAll(".变换原点区 .滑块");
const 平移滑块组 = document.querySelectorAll(".平移区 .滑块");
const 缩放滑块组 = document.querySelectorAll(".缩放区 .滑块");
const 旋转滑块组 = document.querySelectorAll(".旋转区 .滑块");
const 变换滑块组 = [...平移滑块组, ...缩放滑块组, ...旋转滑块组];
const 选择器组 = document.querySelectorAll(".选择器");

const 重置变换属性按钮组 = document.querySelectorAll(".控件区 .按钮");
const 水平垂直关联复选框 = document.querySelector("#水平垂直关联");

let X轴平移单位 = "%";
let Y轴平移单位 = "%";
let Z轴平移单位 = "%";

背景图确认框.addEventListener("change", () => {
  if (背景图确认框.checked) {
    原始盒子.classList.add("背景图盒子");
    变换盒子.classList.add("背景图盒子");
  } else {
    原始盒子.classList.remove("背景图盒子");
    变换盒子.classList.remove("背景图盒子");
  }
});

for (const 选择器 of 选择器组) {
  选择器.addEventListener("change", () => {
    if (选择器.id === "X轴平移选择器") {
      X轴平移单位 = 选择器.value;
      const X轴平移 = 选择器.parentElement.previousElementSibling.value;
      root.style.setProperty(`--平移-X轴`, `${X轴平移}${X轴平移单位}`);
    } else if (选择器.id === "Y轴平移选择器") {
      Y轴平移单位 = 选择器.value;
      const Y轴平移 = 选择器.parentElement.previousElementSibling.value;
      root.style.setProperty(`--平移-Y轴`, `${Y轴平移}${Y轴平移单位}`);
    } else {
      Z轴平移单位 = 选择器.value;
      const Z轴平移 = 选择器.parentElement.previousElementSibling.value;
      root.style.setProperty(`--平移-Z轴`, `${Z轴平移}${Z轴平移单位}`);
    }
  });
}

for (const 滑块 of 滑块组) {
  滑块.addEventListener("input", () => {
    设置滑块填充与数值(滑块);
  });
}

function 设置滑块填充与数值(滑块) {
  const percentValue = 获取滑块填充百分比(滑块);
  root.style.setProperty(`--${滑块.id}填充`, `${percentValue}%`);
  const 控件数字 = 滑块.nextElementSibling.querySelector(".控件数字");
  控件数字.textContent = 滑块.value;
}

for (const 单选框 of 变换风格单选组) {
  单选框.addEventListener("change", () => {
    root.style.setProperty("--变换风格", 单选框.id);
  });
}

for (const 单选框 of 背面可见性单选组) {
  单选框.addEventListener("change", () => {
    变换盒子.style.backfaceVisibility = 单选框.id;
  });
}

无透视单选框.addEventListener("change", () => {
  透视滑块.classList.add("无效");
  透视滑块.nextElementSibling.classList.add("无效");
  root.style.setProperty("--透视", "none");
});

透视滑块.addEventListener("input", () => {
  透视滑块.classList.remove("无效");
  透视滑块.nextElementSibling.classList.remove("无效");
  无透视单选框.checked = false;
  root.style.setProperty("--透视", `${透视滑块.value}px`);
});

透视滑块.addEventListener("click", () => {
  透视滑块.classList.remove("无效");
  透视滑块.nextElementSibling.classList.remove("无效");
  无透视单选框.checked = false;
  root.style.setProperty("--透视", `${透视滑块.value}px`);
});

for (const 滑块 of 原点滑块组) {
  滑块.addEventListener("input", () => {
    root.style.setProperty(`--${滑块.id}偏移`, `${滑块.value}%`);
  });
}

for (const 滑块 of 平移滑块组) {
  滑块.addEventListener("input", () => {
    const 单位 = 滑块.nextElementSibling.querySelector(".选择器").value;
    root.style.setProperty(`--${滑块.id}`, `${滑块.value}${单位}`);
    显示或隐藏原始盒子();
  });
}

for (const 滑块 of 缩放滑块组) {
  滑块.addEventListener("input", () => {
    root.style.setProperty(`--${滑块.id}`, `${滑块.value}%`);
    if (水平垂直关联复选框.checked) {
      const 另一滑块 = Array.from(缩放滑块组).find((checkbox) => checkbox.id !== 滑块.id);
      另一滑块.value = 滑块.value;
      root.style.setProperty(`--${另一滑块.id}`, `${另一滑块.value}%`);
      设置滑块填充与数值(另一滑块);
    }
    显示或隐藏原始盒子();
    刷新原点缩放();
  });
}

水平垂直关联复选框.addEventListener("change", () => {
  const 关联符号 = 水平垂直关联复选框.previousElementSibling;
  if (水平垂直关联复选框.checked) {
    关联符号.innerHTML = '<i class="fa-solid fa-link"></i>';
  } else {
    关联符号.innerHTML = '<i class="fa-solid fa-link-slash"></i>';
  }
});

function 刷新原点缩放() {
  const 水平缩放 = parseInt(rootStyle.getPropertyValue("--缩放-水平"), 10);
  const 垂直缩放 = parseInt(rootStyle.getPropertyValue("--缩放-垂直"), 10);
  const 原点水平缩放 = `${10000 / 水平缩放}%`;
  const 原点垂直缩放 = `${10000 / 垂直缩放}%`;
  原点盒子.style.scale = `${原点水平缩放} ${原点垂直缩放}`;
}

for (const 滑块 of 旋转滑块组) {
  滑块.addEventListener("input", () => {
    root.style.setProperty(`--${滑块.id}`, `${滑块.value}deg`);
    显示或隐藏原始盒子();
  });
}

function 显示或隐藏原始盒子() {
  const 已修改滑块 = 变换滑块组.some((滑块) => {
    const min = parseInt(滑块.min, 10);
    const max = parseInt(滑块.max, 10);
    const value = parseInt(滑块.value, 10);
    return value !== max - (max - min) / 2;
  });

  if (已修改滑块) {
    原始盒子.classList.add("显示原始盒子");
  } else {
    原始盒子.classList.remove("显示原始盒子");
  }
}

for (const 按钮 of 重置变换属性按钮组) {
  按钮.addEventListener("click", () => {
    const 本区滑块组 = 按钮.parentElement.parentElement.parentElement.querySelectorAll(".滑块");

    for (const 滑块 of 本区滑块组) {
      const min = parseInt(滑块.min, 10);
      const max = parseInt(滑块.max, 10);
      滑块.value = max - (max - min) / 2;
      let 单位 = "%";
      if (滑块.id.includes("旋转")) {
        单位 = "deg";
      } else if (滑块.id.includes("平移")) {
        if (滑块.id.includes("Z")) {
          单位 = "px";
          滑块.nextElementSibling.querySelector(".选择器").value = "px";
        } else {
          滑块.nextElementSibling.querySelector(".选择器").value = "%";
        }
      }
      root.style.setProperty(`--${滑块.id}`, `${滑块.value}${单位}`);
      设置滑块填充与数值(滑块);
      if (滑块.id.includes("缩放")) {
        刷新原点缩放();
      }
    }

    if (按钮.id === "重置变换原点") {
      for (const 滑块 of 原点滑块组) {
        const min = parseInt(滑块.min, 10);
        const max = parseInt(滑块.max, 10);
        滑块.value = max - (max - min) / 2;
        root.style.setProperty(`--${滑块.id}偏移`, `${滑块.value}%`);
        设置滑块填充与数值(滑块);
      }
    }

    显示或隐藏原始盒子();
  });
}

const 重置按钮 = document.querySelector(".重置按钮");
重置按钮.addEventListener("click", 重置参数);

function 重置参数() {
  const 平面单选框 = document.querySelector("#flat");
  平面单选框.checked = true;
  root.style.setProperty("--变换风格", "flat");

  const 无透视单选框 = document.querySelector("#none");
  无透视单选框.checked = true;

  const 透视滑块 = document.querySelector("#透视");
  透视滑块.value = 0;
  root.style.setProperty("--透视", "none");

  for (const 滑块 of 原点滑块组) {
    滑块.value = 50;
    滑块.nextElementSibling.querySelector(".控件数字").textContent = "50";
    root.style.setProperty(`--${滑块.id}偏移`, `${滑块.value}%`);
  }

  for (const 滑块 of 平移滑块组) {
    滑块.value = 0;
    滑块.nextElementSibling.querySelector(".控件数字").textContent = "0";
    滑块.nextElementSibling.querySelector(".选择器").value = "%";
    root.style.setProperty(`--${滑块.id}`, `${滑块.value}px`);
  }

  for (const 滑块 of 缩放滑块组) {
    滑块.value = 100;
    滑块.nextElementSibling.querySelector(".控件数字").textContent = "100";
    root.style.setProperty(`--${滑块.id}`, `${滑块.value}%`);
  }

  for (const 滑块 of 旋转滑块组) {
    滑块.value = 0;
    滑块.nextElementSibling.querySelector(".控件数字").textContent = "0";
    root.style.setProperty(`--${滑块.id}`, `${滑块.value}deg`);
  }

  for (const 滑块 of 滑块组) {
    const percentValue = 获取滑块填充百分比(滑块);
    root.style.setProperty(`--${滑块.id}填充`, `${percentValue}%`);
  }

  原点盒子.style.scale = "";
  原始盒子.classList.remove("显示原始盒子");

  水平垂直关联复选框.checked = true;
  水平垂直关联复选框.previousElementSibling.innerHTML = '<i class="fa-solid fa-link"></i>';

  const 背面可见单选框 = document.querySelector("#visible");
  背面可见单选框.checked = true;
  变换盒子.style.backfaceVisibility = "";

  背景图确认框.checked = false;
  原始盒子.classList.remove("背景图盒子");
  变换盒子.classList.remove("背景图盒子");
}

function 获取滑块填充百分比(滑块) {
  const min = parseInt(滑块.min, 10);
  const max = parseInt(滑块.max, 10);
  const value = parseInt(滑块.value, 10);
  return ((value - min) / (max - min)) * 100;
}
