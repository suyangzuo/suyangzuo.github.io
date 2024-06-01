const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 图像区 = document.querySelector(".图像区");
const 操作区 = document.querySelector(".操作区");
const 图像分区组 = 图像区.querySelectorAll(".图像分区");
const 代码按钮组 = 操作区.querySelectorAll(".代码按钮");
const 操作分区组 = 操作区.querySelectorAll(".操作分区");
const 全局重置按钮 = document.querySelector(".重置区 .重置按钮");
let 当前激活操作区 = 操作区.querySelector(".多边形操作分区");
let 当前激活图像分区 = 图像区.querySelector(".多边形修剪图分区");

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

代码按钮组.forEach((代码按钮, index) => {
  代码按钮.addEventListener("click", () => {
    const 代码容器 = 图像分区组[index + 1].querySelector(".代码容器");

    if (代码容器.classList.contains("多边形修剪代码容器")) {
      更新多边形代码区代码();
    } else if (代码容器.classList.contains("向内修剪代码容器")) {
      更新向内修剪代码区代码();
    }
    if (代码容器.classList.contains("代码容器可见")) {
      代码容器.classList.remove("代码容器可见");
      代码按钮.innerHTML = '<i class="fa-solid fa-code"></i>';
    } else {
      代码容器.classList.add("代码容器可见");
      代码按钮.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      刷新代码格式化脚本();
    }
  });
});

全局重置按钮.addEventListener("click", () => {
  重置多边形修剪区();
  更新多边形代码区代码();
  重置向内修剪参数();
  更新向内修剪代码区代码();
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
