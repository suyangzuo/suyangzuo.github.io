const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 侧边栏颜色_已选中 = rootStyle.getPropertyValue("--侧边栏颜色-已选中");
const 侧边栏颜色_鼠标悬停 = rootStyle.getPropertyValue("--侧边栏颜色-鼠标悬停");

const 侧边栏收缩容器 = document.getElementsByClassName("侧边栏收缩容器")[0];
const 侧边栏 = document.getElementsByClassName("侧边栏")[0];
const 技术栈选择器 = document.getElementsByClassName("技术栈选择器")[0];
const 技术栈对话框 = document.querySelector(".技术栈对话框");
const 关闭技术栈对话框按钮 = document.querySelector(".关闭技术栈对话框");
const 技术栈内容 = document.getElementsByClassName("技术栈内容")[0];
const 技术栈组 = document.querySelectorAll(".技术栈");
const 专题内容区 = document.getElementsByClassName("专题内容区")[0];
let 专题组 = null;
let 专题标记组 = null;

let 技术栈名称 = "经验之谈";
let 专题索引记录 = [{ 技术栈: "经验之谈", 专题索引: 0 }];

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

技术栈组.forEach((技术栈) => {
  技术栈.addEventListener("click", 点选技术栈);
  技术栈.addEventListener("click", 设置侧边栏);
  技术栈.addEventListener("click", 设置内容);
  技术栈.addEventListener("click", () => {
    if (技术栈对话框.open) {
      隐藏技术栈内容();
    }
  });
});

function 刷新代码格式化脚本() {
  const 代码格式化脚本元素 = document.querySelector("script[代码格式化]");
  代码格式化脚本元素.remove();
  const 新脚本 = document.createElement("script");
  新脚本.src = "/Scripts/prism.js";
  新脚本.setAttribute("代码格式化", "");
  document.body.appendChild(新脚本);
}

function 设置侧边栏() {
  侧边栏.innerHTML = "";

  let fileName = `./侧边栏/${技术栈名称}.html`;

  const xhr = new XMLHttpRequest();
  xhr.open("GET", fileName, false); /* false -> 同步请求 */
  xhr.send();

  if (xhr.status === 200) {
    侧边栏.insertAdjacentHTML("afterbegin", xhr.responseText);
  }

  // fetch(fileName)
  //   .then((response) => response.text())
  //   .then((content) => (侧边栏.innerHTML = content))
  //   .then(() => {
  //     专题组 = document.querySelectorAll(".专题");
  //     专题标记组 = document.querySelectorAll(".专题-标记");

  //     index = JSON.parse(sessionStorage.getItem("专题索引记录")).find(
  //       (记录) => 记录.技术栈 === 技术栈名称
  //     ).专题索引;

  //     专题组[index].style.setProperty(
  //       "background",
  //       侧边栏颜色_已选中,
  //       "important"
  //     );
  //     专题组.forEach((专题) => {
  //       专题.addEventListener("click", 修改专题样式);
  //       const 标记 = 专题.querySelector(".专题-标记");
  //       标记.textContent = "\u2666";
  //     });

  //     前一专题 = 专题组[index];
  //     专题名称 = 专题组[index]
  //       .getElementsByClassName("专题-内容")[0]
  //       .textContent.trim();
  //   });

  专题组 = document.querySelectorAll(".专题");
  专题标记组 = document.querySelectorAll(".专题-标记");

  index = JSON.parse(sessionStorage.getItem("专题索引记录")).find(
    (记录) => 记录.技术栈 === 技术栈名称
  ).专题索引;

  专题组[index].style.setProperty("background", 侧边栏颜色_已选中, "important");
  专题组.forEach((专题) => {
    专题.addEventListener("click", 修改专题样式);
    const 标记 = 专题.querySelector(".专题-标记");
    标记.textContent = "\u2666";
  });

  前一专题 = 专题组[index];
  专题名称 = 专题组[index]
    .getElementsByClassName("专题-内容")[0]
    .textContent.trim();
}

async function 设置内容() {
  专题文件路径 = `./博客内容/${技术栈名称}/${专题名称}.html`;

  await fetch(专题文件路径)
    .then((response) => response.text())
    .then((content) => {
      专题内容区.innerHTML = content;
      刷新代码格式化脚本();
    });
  window.scrollTo(0, 0);
  特殊元素样式补充();
}

function 点选技术栈(event) {
  const 技术栈 = event.currentTarget;
  let 技术栈文本 = 技术栈.getElementsByTagName("p")[0].textContent.trim();
  技术栈名称 = 技术栈文本;
  if (技术栈名称 === "Web前端原生开发") {
    技术栈名称 = "Web前端-原生开发";
  } else if (技术栈名称 === "C#") {
    技术栈名称 = "CSharp";
  } else if (技术栈名称 === "PHP") {
    技术栈名称 = "php";
  }
  sessionStorage.setItem("页面技术栈", 技术栈名称);
  if (!专题索引记录.some((item) => item.技术栈 === 技术栈名称)) {
    专题索引记录.push({ 技术栈: 技术栈名称, 专题索引: 0 });
    sessionStorage.setItem("专题索引记录", JSON.stringify(专题索引记录));
  }
}

function 修改专题样式(event) {
  event.stopPropagation();
  const 专题 = event.currentTarget;
  if (前一专题 === 专题) return;
  if (前一专题 !== null) {
    前一专题.style.setProperty("background", "transparent");
  }
  专题.style.setProperty("background", 侧边栏颜色_已选中, "important");
  前一专题 = 专题;
  专题名称 = 专题.getElementsByClassName("专题-内容")[0].textContent.trim();

  index = Array.from(专题组).indexOf(专题);
  if (!专题索引记录.some((记录) => 记录.技术栈 === 技术栈名称)) {
    专题索引记录.push({ 技术栈: 技术栈名称, 专题索引: index });
  } else {
    let 记录 = 专题索引记录.find((记录) => 记录.技术栈 === 技术栈名称);
    记录.专题索引 = index;
  }
  sessionStorage.setItem("专题索引记录", JSON.stringify(专题索引记录));

  设置内容();
}

技术栈选择器.addEventListener("click", 显示技术栈内容);
// 技术栈内容.addEventListener("mouseleave", 隐藏技术栈内容);
关闭技术栈对话框按钮.addEventListener("click", 隐藏技术栈内容);

function 显示技术栈内容() {
  技术栈对话框.showModal();
  技术栈选择器.style.scale = "0";
}

function 隐藏技术栈内容() {
  技术栈对话框.close();
  技术栈选择器.style.scale = "1";
}

//---------------------- ↓ 对内容中的特殊元素补充样式 ----------------------
function 特殊元素样式补充() {
  const topicContentArea = document.getElementsByClassName("专题内容区")[0];
  if (topicContentArea.innerHTML === "") return;

  const 原创转载 = document.querySelector(".简介标题 > span");
  if (原创转载.className === "转载") {
    const 原文链接 = document.querySelector(".原文链接 > a");
    原文链接.style.marginLeft = "0";
  }

  const 分区3级标题组 = document.querySelectorAll(".分区3级标题");
  分区3级标题组.forEach((标题) => {
    let 首节点 = 标题.childNodes[0];
    if (首节点.textContent.trim().length === 0) 首节点 = 标题.childNodes[1];

    if (首节点.nodeType === Node.ELEMENT_NODE) {
      首节点.style.marginLeft = "0";
    }
  });

  const 附加说明组 = document.querySelectorAll(".附加说明");
  附加说明组.forEach((附加说明) => {
    const 前一节点 = 附加说明.previousSibling;
    if (
      前一节点.className !== "超链接" &&
      前一节点.nodeType === Node.ELEMENT_NODE
    ) {
      附加说明.style.marginLeft = "2px";
    }
  });

  const 超链接组 = document.querySelectorAll(".超链接");
  超链接组.forEach((超链接) => {
    const 前一节点 = 超链接.previousSibling;
    if (前一节点?.textContent.trim().length === 0) {
      超链接.style.marginLeft = "0";
    }
  });

  const 行内专业名词组 = document.querySelectorAll(".行内专业名词");
  行内专业名词组.forEach((行内专业名词) => {
    const 前一节点 = 行内专业名词.previousSibling;
    if (
      前一节点.tagName === "BR" ||
      (前一节点.nodeType === Node.TEXT_NODE &&
        (前一节点.textContent.at(-1) === "，" ||
          前一节点.textContent.at(-1) === "。" ||
          前一节点.textContent.at(-1) === "：" ||
          前一节点.textContent.at(-1) === "；" ||
          前一节点.textContent.at(-1) === "、"))
    ) {
      行内专业名词.style.marginLeft = "0";
    }
  });

  const 分区普通文本组 = document.querySelectorAll(".分区普通文本");
  分区普通文本组?.forEach((分区普通文本) => {
    const 首节点 = 分区普通文本.firstChild;
    if (
      首节点.nodeType === Node.TEXT_NODE &&
      首节点.textContent.trim().length === 0
    ) {
      const 第2节点 = 首节点.nextSibling;
      if (第2节点.nodeType === Node.ELEMENT_NODE) {
        第2节点.style.marginLeft = "0";
      }
    }
  });

  const 提醒 = document.querySelector(".提醒");
  const 专业名词组 = document.querySelectorAll(".专业名词");
  专业名词组?.forEach((专业名词) => {
    const 前一节点 = 专业名词.previousSibling;
    if (
      前一节点 === null ||
      前一节点.textContent.at(-1) === " " ||
      前一节点.textContent.at(-1) === "，" ||
      前一节点.textContent.at(-1) === "。" ||
      前一节点.textContent.at(-1) === "：" ||
      前一节点.textContent.at(-1) === "；" ||
      前一节点.textContent.at(-1) === "、"
    ) {
      专业名词.style.marginLeft = "0";
    }
  });

  const 表格组 = document.querySelectorAll(".表格");
  表格组?.forEach((表格) => {
    const 表格后元素 = 表格.nextElementSibling;
    if (表格后元素?.className === "提醒") {
      表格.style.marginBottom = "50px";
    }
  });
}
//---------------------- ↑ 对内容中的特殊元素补充样式 ----------------------

侧边栏收缩容器.addEventListener("click", 修改侧边栏可见性);
let 侧边栏可见 = false;
const 视口宽度低于800px = window.matchMedia("(width < 800px)");

function 修改侧边栏可见性(event) {
  if (!侧边栏可见) {
    侧边栏.style.setProperty("visibility", "visible", "important");
    侧边栏.style.setProperty("opacity", "1", "important");
    侧边栏可见 = true;
  } else {
    侧边栏.style.visibility = "hidden";
    侧边栏.style.opacity = "0";
    侧边栏可见 = false;
  }
}

window.addEventListener("resize", 修改视口尺寸);

function 修改视口尺寸() {
  if (!视口宽度低于800px.matches) {
    侧边栏.style.visibility = "visible";
    侧边栏.style.opacity = "1";
    侧边栏可见 = true;
  } else {
    侧边栏可见 = false;
  }
}

//------------------- ↓ 监控专题内容区内 DOM 修改 -------------------
const mutationObserver = new MutationObserver(专题改变时运行);
mutationObserver.observe(专题内容区, {
  childList: true,
});

function 专题改变时运行() {
  if (!(技术栈名称 === "Web前端-原生开发" && 专题名称 === "首页")) {
    更新图像序号();
    return;
  }

  生成永恒代码统计图表();
}

function 更新图像序号() {
  const screenShotsContainers = document.querySelectorAll(".截图容器");
  screenShotsContainers.forEach((container) => {
    const 截图序号 = document.createElement("span");
    截图序号.className = "截图序号";
    container.appendChild(截图序号);
    const imageIndex = Array.from(screenShotsContainers).indexOf(container);
    截图序号.textContent = `图 ${imageIndex + 1}`;

    const containerSibling = container.nextElementSibling;
    if (
      containerSibling !== null &&
      containerSibling.className === "分区普通文本"
    ) {
      const 行内截图序号 = document.createElement("span");
      行内截图序号.className = "行内截图序号";
      行内截图序号.textContent = `·图${imageIndex + 1}·`;
      containerSibling?.prepend("如", 行内截图序号, "所示，");
    }
  });
}

function 生成永恒代码统计图表() {
  // 基于准备好的dom，初始化echarts实例
  const myChart = echarts.init(
    document.getElementById("永恒代码统计图表"),
    "dark"
  );

  // 指定图表的配置项和数据
  const option = {
    backgroundColor: "#fff1",
    title: {
      text: "统计日期：2024年1月13日",
      textStyle: {
        color: "gold",
        fontSize: 16,
      },
      padding: 25,
    },
    tooltip: {},
    legend: {
      data: ["代码行数"],
      padding: [25, 0, 0, 0],
    },
    xAxis: {
      data: ["总行数", "HTML", "CSS", "JavaScript"],
      axisLabel: {
        margin: 15,
        fontSize: 13,
        color: "white",
      },
    },
    yAxis: {},
    grid: {
      height: "70%",
      width: "75%",
      top: "17.5%",
      left: "15%",
    },
    series: [
      {
        name: "代码行数",
        type: "bar",
        data: [48203, 23030, 21124, 4042],
        label: {
          position: "top",
          distance: 10,
          show: true,
          formatter: ["{c}"],
          color: "orange",
        },
        showBackground: true,
        backgroundStyle: {
          color: "rgba(180, 180, 180, 0.075)",
        },
      },
    ],
    // media: [
    //   {
    //     query: {
    //       maxWidth: 1200,
    //     },
    //     option: {
    //       width: 375,
    //       height: 300,
    //     },
    //   },
    // ],
  };

  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
}

//------------------- ↑ 监控专题内容区内 DOM 修改 -------------------
