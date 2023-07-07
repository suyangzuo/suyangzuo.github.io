const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 侧边栏颜色_已选中 = rootStyle.getPropertyValue("--侧边栏颜色-已选中");
const 侧边栏颜色_鼠标悬停 = rootStyle.getPropertyValue("--侧边栏颜色-鼠标悬停");

const 侧边栏收缩容器 = document.getElementsByClassName("侧边栏收缩容器")[0];
const 侧边栏 = document.getElementsByClassName("侧边栏")[0];
const 技术栈选择器 = document.getElementsByClassName("技术栈选择器")[0];
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
// 设置内容();

function 刷新代码格式化脚本() {
  const 代码格式化脚本元素 = document.querySelector("script[代码格式化]");
  代码格式化脚本元素.remove();
  const 新脚本 = document.createElement("script");
  新脚本.src = "/Scripts/prism.js";
  // 新脚本.setAttribute("defer", "");
  新脚本.setAttribute("代码格式化", "");
  document.body.appendChild(新脚本);
}

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
    // 专题.addEventListener("click", 设置内容);
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
    .then((content) => {
      专题内容区.innerHTML = content;
      刷新代码格式化脚本();
    });
  window.scrollTo(0, 0);
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

  设置内容();
}

技术栈选择器.addEventListener("click", 显示技术栈内容);
技术栈内容.addEventListener("mouseleave", 隐藏技术栈内容);

function 显示技术栈内容() {
  技术栈内容.style.opacity = "1";
  技术栈内容.style.transform = "scale(1)";
  技术栈选择器.style.scale = "0";
}

function 隐藏技术栈内容() {
  技术栈内容.style.opacity = "0";
  技术栈内容.style.transform = "scale(0)";
  技术栈选择器.style.scale = "1";
}

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
    return;
  }

  生成永恒代码统计图表();
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
      text: "永恒代码量统计",
      textStyle: {
        color: "gold",
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
        data: [40334, 19572, 17310, 3372],
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
