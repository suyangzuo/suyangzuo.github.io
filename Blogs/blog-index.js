const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 侧边栏颜色_已选中 = rootStyle.getPropertyValue("--侧边栏颜色-已选中");
const 侧边栏颜色_鼠标悬停 = rootStyle.getPropertyValue("--侧边栏颜色-鼠标悬停");

const 侧边栏 = document.getElementsByClassName("侧边栏")[0];
const 技术栈选择器 = document.getElementsByClassName("技术栈选择器")[0];
const 技术栈内容 = document.getElementsByClassName("技术栈内容")[0];
const 技术栈组 = document.querySelectorAll(".技术栈");
const 专题内容区 = document.getElementsByClassName("专题内容区")[0];
let 专题组 = null;
let 专题标记组 = null;

let 技术栈名称 = "博客导航页";
let 专题索引记录 = [{ 技术栈: "博客导航页", 专题索引: 0 }];

//需要记录多个技术栈的索引，因此将专题索引记录数组转化为'JSON'格式保存在会话中
if (sessionStorage.getItem("专题索引记录") === null) {
  sessionStorage.setItem("专题索引记录", JSON.stringify(专题索引记录));
} else {
  专题索引记录 = JSON.parse(sessionStorage.getItem("专题索引记录"));
}

if (sessionStorage.getItem("页面技术栈") === null) {
  sessionStorage.setItem("页面技术栈", 技术栈名称);
} else {
  技术栈名称 = sessionStorage.getItem("页面技术栈");
}

let index = JSON.parse(sessionStorage.getItem("专题索引记录")).find(
  (记录) => 记录.技术栈 === 技术栈名称
).专题索引;
let 专题名称 = "首页";
let 专题文件路径 = `./博客内容/${技术栈名称}/${专题名称}.html`;

let 前一专题 = null;

设置侧边栏();
设置内容();

async function 设置侧边栏() {
  let fileName = `./侧边栏/${技术栈名称}.html`;

  await fetch(fileName)
    .then((response) => response.text())
    .then((content) => (侧边栏.innerHTML = content));

  专题组 = document.querySelectorAll(".专题");
  专题标记组 = document.querySelectorAll(".专题-标记");

  index = JSON.parse(sessionStorage.getItem("专题索引记录")).find(
    (记录) => 记录.技术栈 === 技术栈名称
  ).专题索引;

  专题组[index].style.setProperty("background", 侧边栏颜色_已选中, "important");
  专题组.forEach((专题) => {
    专题.addEventListener("click", 修改专题样式);
    专题.addEventListener("click", 设置内容);
    const 标记 = 专题.querySelector(".专题-标记");
    标记.textContent = "\u2666";
  });

  前一专题 = 专题组[index];
  专题名称 = 专题组[index].getElementsByClassName("专题-内容")[0].textContent;

  设置内容();
}

async function 设置内容() {
  专题文件路径 = `./博客内容/${技术栈名称}/${专题名称}.html`;

  await fetch(专题文件路径)
    .then((response) => response.text())
    .then((content) => (专题内容区.innerHTML = content));
}

技术栈组.forEach((技术栈) => {
  技术栈.addEventListener("click", 点选技术栈);
  技术栈.addEventListener("click", 设置侧边栏);
});

function 点选技术栈(event) {
  const 技术栈 = event.currentTarget;
  let 技术栈文本 = 技术栈.getElementsByTagName("p")[0].textContent;
  技术栈名称 = 技术栈文本;
  if (技术栈名称 === "Web前端原生开发") {
    技术栈名称 = "Web前端-原生开发";
  }
  sessionStorage.setItem("页面技术栈", 技术栈名称);
  if (!专题索引记录.some((item) => item.技术栈 === 技术栈名称)) {
    专题索引记录.push({ 技术栈: 技术栈名称, 专题索引: 0 });
    sessionStorage.setItem("专题索引记录", JSON.stringify(专题索引记录));
  }
}

function 修改专题样式(event) {
  const 专题 = event.currentTarget;
  if (前一专题 === 专题) return;
  if (前一专题 !== null) {
    前一专题.style.setProperty("background", "transparent");
  }
  专题.style.setProperty("background", 侧边栏颜色_已选中, "important");
  前一专题 = 专题;
  专题名称 = 专题.getElementsByClassName("专题-内容")[0].textContent;

  index = Array.from(专题组).indexOf(专题);
  if (!专题索引记录.some((记录) => 记录.技术栈 === 技术栈名称)) {
    专题索引记录.push({ 技术栈: 技术栈名称, 专题索引: index });
  } else {
    let 记录 = 专题索引记录.find((记录) => 记录.技术栈 === 技术栈名称);
    记录.专题索引 = index;
  }
  sessionStorage.setItem("专题索引记录", JSON.stringify(专题索引记录));
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
