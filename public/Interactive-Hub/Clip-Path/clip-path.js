const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 图像区 = document.querySelector(".图像区");
const 操作区 = document.querySelector(".操作区");
const 图像分区组 = 图像区.querySelectorAll(".图像分区");
const 多边形修剪图分区 = 图像区.querySelector(".多边形修剪图分区");
const 多边形图像容器 = 多边形修剪图分区.querySelector(".图像容器");
const 多边形图像 = 多边形图像容器.querySelector(".图像");
const 多边形修剪代码容器 = 多边形修剪图分区.querySelector(".代码容器");
const 代码按钮组 = 操作区.querySelectorAll(".代码按钮");
const 操作分区组 = 操作区.querySelectorAll(".操作分区");
let 当前激活操作区 = 操作区.querySelector(".多边形操作分区");
let 当前激活图像分区 = 图像区.querySelector(".多边形修剪图分区");
const 多边形修剪重置按钮 = 操作区.querySelector("#多边形修剪重置");
let 多边形修剪数据组 = [];
const 向内操作分区 = 操作区.querySelector(".向内操作分区");
const 向内修剪标签组 = 向内操作分区.querySelectorAll(".向内修剪标签");
const 向内修剪滑块组 = 向内操作分区.querySelectorAll(".向内修剪滑块");
const 向内修剪数值组 = 向内操作分区.querySelectorAll(".向内修剪数值");
const 向内修剪方向按钮组 = 向内操作分区.querySelectorAll(".操作选项按钮");
const 向内修剪图分区 = 图像区.querySelector(".向内修剪图分区");
const 向内修剪代码容器 = 向内修剪图分区.querySelector(".代码容器");
const 向内图像 = 向内修剪图分区.querySelector(".图像");
const 向内修剪区重置按钮 = 操作区.querySelector("#向内修剪重置");
let 当前可用方向按钮 = 向内修剪方向按钮组[0];
当前可用方向按钮.style.filter = "brightness(100%)";
let 当前可用方向标签 = 向内修剪标签组[0];
当前可用方向标签.style.visibility = "visible";
当前可用方向标签.style.opacity = "1";

多边形图像容器.addEventListener("click", (event) => {
  const 多边形修剪指示区 = document.createElement("div");
  多边形修剪指示区.className = "多边形修剪指示区";
  多边形图像容器.appendChild(多边形修剪指示区);

  const 多边形图像容器边界矩形 = 多边形图像容器.getBoundingClientRect();
  const 多边形图像容器宽度 = parseInt(
    window.getComputedStyle(多边形图像容器).width,
    10,
  );
  const 多边形图像容器高度 = parseInt(
    window.getComputedStyle(多边形图像容器).height,
    10,
  );
  const 鼠标点击位置_x = event.clientX - 多边形图像容器边界矩形.left;
  const 鼠标点击位置_y = event.clientY - 多边形图像容器边界矩形.top;
  const 鼠标点击比例_水平 = `${Math.floor(
    (鼠标点击位置_x / 多边形图像容器宽度) * 100,
  )}`;
  const 鼠标点击比例_垂直 = `${Math.floor(
    (鼠标点击位置_y / 多边形图像容器高度) * 100,
  )}`;

  多边形修剪指示区.style.left = `${鼠标点击比例_水平}%`;
  多边形修剪指示区.style.top = `${鼠标点击比例_垂直}%`;
  多边形修剪指示区.style.translate = "-50% -150%";

  const 修剪序号 = document.createElement("span");
  修剪序号.className = "修剪序号";
  const 序号 = 多边形修剪数据组.length + 1;
  修剪序号.textContent = `${序号}`;
  多边形修剪指示区.appendChild(修剪序号);

  const 修剪数据区 = document.createElement("div");
  修剪数据区.className = "修剪数据区";
  多边形修剪指示区.appendChild(修剪数据区);

  const 关闭按钮 = document.createElement("span");
  关闭按钮.className = "修剪指示区关闭按钮";
  关闭按钮.textContent = "✖";
  多边形修剪指示区.appendChild(关闭按钮);

  const 指示区三角箭头 = document.createElement("span");
  指示区三角箭头.className = "指示区三角箭头";
  多边形修剪指示区.appendChild(指示区三角箭头);

  const 修剪数据分区_x = document.createElement("修剪数据分区");
  修剪数据分区_x.className = "修剪数据分区";
  const 修剪数据_x文本 = document.createElement("span");
  修剪数据_x文本.className = "修剪数据-坐标类";
  修剪数据_x文本.textContent = "X";
  const 修剪数据_x数据 = document.createElement("span");
  修剪数据_x数据.className = "修剪数据-坐标数据";
  const x比例 = document.createElement("span");
  x比例.className = "x比例数据";
  x比例.textContent = `${鼠标点击比例_水平}`;
  const 百分比_x = document.createElement("span");
  百分比_x.className = "多边形修剪百分比符号";
  百分比_x.textContent = "%";
  修剪数据_x数据.append(x比例, 百分比_x);
  修剪数据分区_x.append(修剪数据_x文本, ":", 修剪数据_x数据);

  const 修剪数据分区_y = document.createElement("修剪数据分区");
  修剪数据分区_y.className = "修剪数据分区";
  const 修剪数据_y文本 = document.createElement("span");
  修剪数据_y文本.className = "修剪数据-坐标类";
  修剪数据_y文本.textContent = "Y";
  const 修剪数据_y数据 = document.createElement("span");
  修剪数据_y数据.className = "修剪数据-坐标数据";
  const y比例 = document.createElement("span");
  y比例.className = "y比例数据";
  y比例.textContent = `${鼠标点击比例_垂直}`;
  const 百分比_y = document.createElement("span");
  百分比_y.className = "多边形修剪百分比符号";
  百分比_y.textContent = "%";
  修剪数据_y数据.append(y比例, 百分比_y);
  修剪数据分区_y.append(修剪数据_y文本, ":", 修剪数据_y数据);

  const 水平分割线 = document.createElement("span");
  水平分割线.style.width = "100%";
  水平分割线.style.height = "1px";
  水平分割线.style.backgroundColor = "#678a";

  修剪数据区.append(修剪数据分区_x, 水平分割线, 修剪数据分区_y);

  const 修剪数据对象 = {
    修剪序号: 序号,
    修剪指示区元素: 多边形修剪指示区,
  };

  多边形修剪数据组.push(修剪数据对象);

  关闭按钮.addEventListener("click", (event) => {
    event.stopImmediatePropagation();
    const 待关闭修剪区序号 = parseInt(
      关闭按钮.parentElement.querySelector(".修剪序号").innerText,
      10,
    );
    多边形修剪数据组 = 多边形修剪数据组.filter(
      (数据) => 数据.修剪序号 !== 待关闭修剪区序号,
    );

    多边形修剪指示区.remove();

    if (多边形修剪数据组.length > 0) {
      const 修剪序号组 = 多边形图像容器.querySelectorAll(".修剪序号");
      for (const 序号 of 修剪序号组) {
        序号.classList.add("修剪序号刷新中");
        setTimeout(() => {
          序号.classList.remove("修剪序号刷新中");
        }, 500);
      }

      多边形修剪数据组.forEach((数据, index) => {
        数据.修剪序号 = index + 1;
        数据.修剪指示区元素.querySelector(".修剪序号").textContent =
          `${数据.修剪序号}`;
      });

      多边形图像.style.clipPath = 生成多边形修剪代码();
    } else {
      多边形图像.style.removeProperty("clip-path");
    }
    更新多边形修剪区代码();
    刷新代码格式化脚本();
  });

  多边形图像.style.clipPath = 生成多边形修剪代码();
  更新多边形修剪区代码();
  刷新代码格式化脚本();
});

操作分区组.forEach((操作分区, index) => {
  操作分区.addEventListener("click", () => {
    if (操作分区 === 当前激活操作区) {
      return;
    }
    当前激活操作区.classList.add("未激活操作分区");
    操作分区.classList.remove("未激活操作分区");

    当前激活图像分区.classList.add("未激活图像分区");
    图像分区组[index + 1].classList.remove("未激活图像分区");

    当前激活操作区 = 操作分区;
    当前激活图像分区 = 图像分区组[index + 1];

    const 原图 = 图像分区组[0].querySelector(".图像");
    原图.src = `./Images/${index + 1}.webp`;
  });
});

多边形修剪重置按钮.addEventListener("click", () => {
  重置多边形修剪区();
  更新多边形修剪区代码();
  刷新代码格式化脚本();
});

代码按钮组.forEach((代码按钮, index) => {
  代码按钮.addEventListener("click", () => {
    const 代码容器 = 图像分区组[index + 1].querySelector(".代码容器");
    const 代码元素 = 代码容器.querySelector("code");
    const 代码前缀 = "目标元素 {\n";
    const 代码后缀 = "\n}";

    if (代码容器.classList.contains("多边形修剪代码容器")) {
      更新多边形修剪区代码();
    } else if (代码容器.classList.contains("向内修剪代码容器")) {
      更新向内修剪区代码();
    }
    if (代码容器.classList.contains("代码容器可见")) {
      代码容器.classList.remove("代码容器可见");
      代码按钮.innerHTML = '<i class="fa-solid fa-code"></i>';
    } else {
      代码容器.classList.add("代码容器可见");
      代码按钮.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    }
    刷新代码格式化脚本();
  });
});

function 刷新代码格式化脚本() {
  const 代码格式化脚本元素 = document.querySelector("script[代码格式化]");
  代码格式化脚本元素.remove();
  const 代码格式化新脚本 = document.createElement("script");
  代码格式化新脚本.src = "/Scripts/prism.js";
  代码格式化新脚本.type = "text/javascript";
  代码格式化新脚本.setAttribute("代码格式化", "");

  document.body.appendChild(代码格式化新脚本);
}

function 更新多边形修剪区代码() {
  const 代码元素 = 多边形修剪代码容器.querySelector("code");
  const 代码前缀 = "目标元素 {\n";
  const 代码后缀 = "\n}";
  代码元素.innerHTML = `${代码前缀}  clip-path: ${生成多边形修剪代码()};${代码后缀}`;
}

function 生成多边形修剪代码() {
  const 比例数组 = [];
  for (const 修剪对象 of 多边形修剪数据组) {
    const 指示区 = 修剪对象.修剪指示区元素;
    const x比例 = 指示区.querySelector(".x比例数据").innerText;
    const y比例 = 指示区.querySelector(".y比例数据").innerText;
    比例数组.push(`${x比例}% ${y比例}%`);
  }

  const 百分比代码 = 比例数组.join(", ");
  return `polygon(${百分比代码})`;
}

function 重置多边形修剪区() {
  for (const 修剪对象 of 多边形修剪数据组) {
    修剪对象.修剪指示区元素.remove();
  }
  多边形修剪数据组.length = 0;
  多边形图像.style.removeProperty("clip-path");
}

//-------------------------------------------------------------------------

for (const 向内修剪数值元素 of 向内修剪数值组) {
  向内修剪数值元素.textContent = "0";
  const 百分比符号 = document.createElement("span");
  百分比符号.className = "向内修剪数值-百分比符号";
  百分比符号.textContent = "%";
  向内修剪数值元素.appendChild(百分比符号);
}

向内修剪方向按钮组.forEach((方向按钮, index) => {
  方向按钮.addEventListener("click", () => {
    if (方向按钮 === 当前可用方向按钮) return;
    方向按钮.style.filter = "brightness(100%)";
    当前可用方向按钮.style.removeProperty("filter");
    当前可用方向按钮 = 方向按钮;

    向内修剪标签组[index].style.visibility = "visible";
    向内修剪标签组[index].style.opacity = "1";
    当前可用方向标签.style.removeProperty("visibility");
    当前可用方向标签.style.removeProperty("opacity");
    当前可用方向标签 = 向内修剪标签组[index];
  });
});

for (const 向内修剪滑块 of 向内修剪滑块组) {
  向内修剪滑块.addEventListener("input", () => {
    const 向内修剪值 = parseInt(向内修剪滑块.value, 10);
    const 方向 = 向内修剪滑块.id.at(-1);
    root.style.setProperty(`--向内修剪比例-${方向}`, `${向内修剪值}%`);
    const 向内修剪数值元素 = 向内修剪滑块.nextElementSibling;
    向内修剪数值元素.textContent = `${向内修剪值}`;
    const 百分比符号 = document.createElement("span");
    百分比符号.className = "向内修剪数值-百分比符号";
    百分比符号.textContent = "%";
    向内修剪数值元素.appendChild(百分比符号);

    向内图像.style.clipPath = `${生成向内修剪代码()}`;
    更新向内修剪区代码();
  });

  向内修剪滑块.addEventListener("mouseup", () => {
    刷新代码格式化脚本();
  });
}

function 生成向内修剪标签数据文本() {}

function 获取向内修剪比例对象() {
  const 上 = rootStyle.getPropertyValue("--向内修剪比例-上");
  const 右 = rootStyle.getPropertyValue("--向内修剪比例-右");
  const 下 = rootStyle.getPropertyValue("--向内修剪比例-下");
  const 左 = rootStyle.getPropertyValue("--向内修剪比例-左");
  return {
    上: 上,
    右: 右,
    下: 下,
    左: 左,
  };
}

function 生成向内修剪代码() {
  const 向内修剪比例对象 = 获取向内修剪比例对象();
  return `inset(${向内修剪比例对象.上} ${向内修剪比例对象.右} ${向内修剪比例对象.下} ${向内修剪比例对象.左})`;
}

function 更新向内修剪区代码() {
  //范围型触发input事件时，如果运行prism.js，会严重影响性能，因此需要将格式化代码分离出去
  const 代码元素 = 向内修剪代码容器.querySelector("code");
  const 代码前缀 = "目标元素 {\n";
  const 代码后缀 = "\n}";
  代码元素.innerHTML = `${代码前缀}  clip-path: ${生成向内修剪代码()};${代码后缀}`;
}

向内修剪区重置按钮.addEventListener("click", () => {
  重置向内修剪参数();
  更新向内修剪区代码();
  刷新代码格式化脚本();
});

function 重置向内修剪参数() {
  root.style.setProperty("--向内修剪比例-上", "0%");
  root.style.setProperty("--向内修剪比例-右", "0%");
  root.style.setProperty("--向内修剪比例-下", "0%");
  root.style.setProperty("--向内修剪比例-左", "0%");
  向内图像.style.removeProperty("clip-path");
  for (const 向内修剪滑块 of 向内修剪滑块组) {
    向内修剪滑块.value = 0;
    const 向内修剪数值元素 = 向内修剪滑块.nextElementSibling;
    向内修剪数值元素.textContent = "0";
    const 百分比符号 = document.createElement("span");
    百分比符号.className = "向内修剪数值-百分比符号";
    百分比符号.textContent = "%";
    向内修剪数值元素.appendChild(百分比符号);
  }
}
