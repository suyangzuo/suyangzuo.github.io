const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 侧边栏颜色_已选中 = rootStyle.getPropertyValue("--侧边栏颜色-已选中");
const 侧边栏颜色_鼠标悬停 = rootStyle.getPropertyValue("--侧边栏颜色-鼠标悬停");

const 侧边栏 = document.getElementsByClassName("侧边栏")[0];
const 技术栈选择器 = document.getElementsByClassName("技术栈选择器")[0];
const 技术栈内容 = document.getElementsByClassName("技术栈内容")[0];
const 技术栈组 = document.querySelectorAll(".技术栈");
let 专题项组 = null;
let 专题项标记组 = null;

let 技术栈名称 = "博客导航页";

if (sessionStorage.getItem("页面技术栈") === null) {
  sessionStorage.setItem("页面技术栈", 技术栈名称);
} else {
  技术栈名称 = sessionStorage.getItem("页面技术栈");
}

let 前一专题项 = null;

设置侧边栏内容();

async function 设置侧边栏内容() {
  let fileName = `./侧边栏/${技术栈名称}.html`;

  await fetch(fileName)
    .then(async (response) => await response.text())
    .then((content) => (侧边栏.innerHTML = content));

  专题项组 = document.querySelectorAll(".专题项");
  专题项标记组 = document.querySelectorAll(".专题项-标记");

  let index =
    sessionStorage.getItem("专题项索引") === null
      ? 0
      : sessionStorage.getItem("专题项索引");

  专题项组[index].style.setProperty(
    "background",
    侧边栏颜色_已选中,
    "important"
  );
  专题项组.forEach((专题项) => {
    专题项.addEventListener("click", 修改专题项样式);
    const 标记 = 专题项.querySelector(".专题项-标记");
    标记.textContent = "\u2666";
  });

  前一专题项 = 专题项组[index];
}

技术栈组.forEach((技术栈) => {
  技术栈.addEventListener("click", 获取侧边栏技术栈名称);
  技术栈.addEventListener("click", 设置侧边栏内容);
});

function 获取侧边栏技术栈名称(event) {
  const 技术栈 = event.currentTarget;
  let 技术栈文本 = 技术栈.getElementsByTagName("p")[0].textContent;
  技术栈名称 = 技术栈文本;
  if (技术栈名称 === "Web前端原生开发") {
    技术栈名称 = "Web前端-原生开发";
  }
  sessionStorage.setItem("页面技术栈", 技术栈名称);
}

function 修改专题项样式(event) {
  const 专题项 = event.currentTarget;
  if (前一专题项 === 专题项) return;
  if (前一专题项 !== null) {
    前一专题项.style.setProperty("background", "transparent");
  }
  专题项.style.setProperty("background", 侧边栏颜色_已选中, "important");
  前一专题项 = 专题项;
  sessionStorage.setItem("专题项索引", Array.from(专题项组).indexOf(专题项));
}

技术栈选择器.addEventListener("click", 显示技术栈内容);
技术栈内容.addEventListener("mouseleave", 隐藏技术栈内容);

function 显示技术栈内容() {
  技术栈内容.style.opacity = "1";
  技术栈内容.style.transform = "scale(1)";
  技术栈选择器.style.setProperty("animation", "none");
  技术栈选择器.style.transform = "scale(0)";
}

function 隐藏技术栈内容() {
  技术栈内容.style.opacity = "0";
  技术栈内容.style.transform = "scale(0)";
  技术栈选择器.style.transform = "scale(1)";
}
