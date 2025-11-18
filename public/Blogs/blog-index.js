const 页脚信息区 = document.getElementById("页脚信息区");
const 页脚Logo区 = document.getElementById("页脚Logo区");
页脚Logo区.style.height = window.getComputedStyle(页脚信息区).height;

const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 侧边栏颜色_已选中 = rootStyle.getPropertyValue("--侧边栏颜色-已选中");

const 侧边栏收缩容器 = document.getElementsByClassName("侧边栏收缩容器")[0];
const 侧边栏 = document.getElementsByClassName("侧边栏")[0];
const 技术栈选择器 = document.getElementsByClassName("技术栈选择器")[0];
const 技术栈对话框 = document.querySelector(".技术栈对话框");
const 关闭技术栈对话框按钮 = document.querySelector(".关闭技术栈对话框");
const 技术栈组 = document.querySelectorAll(".技术栈");
const 专题内容区 = document.getElementsByClassName("专题内容区")[0];

const 转载提醒文本 = "基于对初学者友好、易读易懂的原则，译者对原文内容和格式作了一些调整和补充。";

const 收藏栏按钮 = document.getElementById("收藏栏按钮");
const 收藏按钮 = document.getElementById("收藏按钮");
const 收藏数量 = document.getElementById("收藏数量");
const 收藏提示 = document.getElementById("收藏提示");
const 收藏栏 = document.getElementById("收藏栏");
const 收藏栏布局区 = document.getElementById("收藏栏布局区");
const 收藏栏添加按钮 = document.getElementById("收藏条目-添加");
const 关闭收藏栏按钮 = document.getElementById("关闭收藏栏");
const 收藏栏重复提示 = document.getElementById("收藏栏重复提示");

const 远距标点组 = [" ", "，", "。", "：", "；", "、"];

let 上一激活标题 = null;

// let 章节区标题组 = [];

let 侧边栏布局 = localStorage.getItem("侧边栏布局");
if (侧边栏布局 === null) {
  侧边栏布局 = "紧凑";
  localStorage.setItem("侧边栏布局", 侧边栏布局);
}
let 专题组 = null;
let 专题标记组 = null;
let 技术栈名称 = "经验之谈";
let 专题索引记录 = [{ 技术栈: "经验之谈", 专题索引: 0 }];

//需要记录多个技术栈的索引，因此将专题索引记录数组转化为'JSON'格式保存在会话中
if (localStorage.getItem("专题索引记录") === null) {
  localStorage.setItem("专题索引记录", JSON.stringify(专题索引记录));
} else {
  专题索引记录 = JSON.parse(localStorage.getItem("专题索引记录"));
}

if (localStorage.getItem("页面技术栈") === null) {
  localStorage.setItem("页面技术栈", 技术栈名称);
} else {
  技术栈名称 = localStorage.getItem("页面技术栈");
}

let index = JSON.parse(localStorage.getItem("专题索引记录")).find((记录) => 记录.技术栈 === 技术栈名称).专题索引;

let 专题名称 = "首页";
if (localStorage.getItem("专题") === null) {
  localStorage.setItem("专题", 专题名称);
} else {
  专题名称 = localStorage.getItem("专题");
}

let 专题文件路径 = `./博客内容/${技术栈名称}/${专题名称}/index.html`;

let 前一专题 = null;

从网址获取技术栈和专题();

设置侧边栏();
设置内容().then((发生了回退) => {
  生成章节区();
  生成章节();
  初始化章节观察器();
  更新网址(技术栈名称, 专题名称);
});

window.addEventListener("popstate", () => {
  从网址获取技术栈和专题();
  设置侧边栏();
  设置内容().then((发生了回退) => {
    生成章节区();
    生成章节();
    初始化章节观察器();
    当前专题已被收藏时刷新收藏按钮样式();
    if (发生了回退) {
      更新网址(技术栈名称, 专题名称);
    }
  });
});

function 更新网址(技术栈, 专题) {
  const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?tech=${技术栈}&article=${专题}`;
  const state = { path: newUrl };
  const unused = "";
  window.history.pushState(state, unused, newUrl);
}

function 从网址获取技术栈和专题() {
  const url = new URL(decodeURI(window.location.href));
  const paramsString = url.searchParams; //返回 url 中的参数对象
  const 包含技术栈 = paramsString.has("tech");
  const 包含专题 = paramsString.has("article");
  if (!包含技术栈 || !包含专题) return;

  const 技术栈 = paramsString.get("tech");
  const 专题 = paramsString.get("article");
  技术栈名称 = 技术栈;
  专题名称 = 专题;
  localStorage.setItem("专题", 专题名称);
  localStorage.setItem("页面技术栈", 技术栈名称);
}

技术栈组.forEach((技术栈) => {
  技术栈.addEventListener("click", 点选技术栈);
  技术栈.addEventListener("click", 设置侧边栏);
  技术栈.addEventListener("click", () => {
    设置内容().then((发生了回退) => {
      生成章节区();
      生成章节();
      初始化章节观察器();
      更新网址(技术栈名称, 专题名称);
    });
  });
  技术栈.addEventListener("click", () => {
    if (技术栈对话框.open) {
      隐藏技术栈内容();
    }
  });
});

function 刷新第三方库() {
  const 代码格式化脚本元素 = document.querySelector("script[代码格式化]");
  代码格式化脚本元素.remove();
  const 代码格式化新脚本 = document.createElement("script");
  代码格式化新脚本.src = "/Scripts/prism.js";
  代码格式化新脚本.type = "text/javascript";
  代码格式化新脚本.setAttribute("代码格式化", "");

  const 视频回放脚本元素 = document.querySelector("script[视频回放]");
  视频回放脚本元素.remove();
  const 视频回放新脚本 = document.createElement("script");
  视频回放新脚本.src = "https://vjs.zencdn.net/8.10.0/video.min.js";
  视频回放新脚本.type = "text/javascript";
  视频回放新脚本.setAttribute("视频回放", "");

  document.body.append(代码格式化新脚本, 视频回放新脚本);
}

function 生成侧边栏标签() {
  const 侧边栏标签 = document.createElement("label");
  侧边栏标签.setAttribute("for", "侧边栏布局");
  侧边栏标签.id = "侧边栏布局标签";
  const 侧边栏布局复选框 = document.createElement("input");
  侧边栏布局复选框.setAttribute("type", "checkbox");
  侧边栏布局复选框.id = "侧边栏布局";
  侧边栏布局复选框.setAttribute("layout", 侧边栏布局);
  侧边栏布局复选框.checked = 侧边栏布局 === "紧凑";
  侧边栏标签.appendChild(侧边栏布局复选框);
  侧边栏布局复选框.addEventListener("input", () => {
    侧边栏布局 = 侧边栏布局复选框.checked ? "紧凑" : "宽松";
    侧边栏布局复选框.setAttribute("layout", 侧边栏布局);
    localStorage.setItem("侧边栏布局", 侧边栏布局);
  });
  return 侧边栏标签;
}

function 设置侧边栏(event) {
  侧边栏.innerHTML = "";

  let fileName = `./侧边栏/${技术栈名称}.html`;

  const xhr = new XMLHttpRequest();
  xhr.open("GET", fileName, false); /* false -> 同步请求 */
  xhr.send();

  if (xhr.status === 200) {
    侧边栏.insertAdjacentHTML("afterbegin", xhr.responseText);
  }

  const 侧边栏标签 = 生成侧边栏标签();
  侧边栏.prepend(侧边栏标签);

  /*fetch(fileName)
    .then((response) => response.text())
    .then((content) => (侧边栏.innerHTML = content))
    .then(() => {
      专题组 = document.querySelectorAll(".专题");
      专题标记组 = document.querySelectorAll(".专题-标记");

      index = JSON.parse(localStorage.getItem("专题索引记录")).find(
        (记录) => 记录.技术栈 === 技术栈名称
      ).专题索引;

      专题组[index].style.setProperty(
        "background",
        侧边栏颜色_已选中,
        "important"
      );
      专题组.forEach((专题) => {
        专题.addEventListener("click", 修改专题样式);
        const 标记 = 专题.querySelector(".专题-标记");
        标记.textContent = "\u2666";
      });

      前一专题 = 专题组[index];
      专题名称 = 专题组[index]
        .getElementsByClassName("专题-内容")[0]
        .textContent.trim();
    });*/

  专题组 = document.querySelectorAll(".专题");
  if (event !== undefined && event.type === "click") {
    专题名称 = 专题组[index].getElementsByClassName("专题-内容")[0].innerText;
  }

  // 此if用于后退、前进时
  if (event === undefined) {
    const 当前专题 = Array.from(专题组).find(
      (专题) => 专题名称 === 专题.getElementsByClassName("专题-内容")[0].innerText
    );

    if (当前专题 === undefined) return;

    if (前一专题 !== null && 前一专题 !== 当前专题) {
      前一专题.classList.remove("当前专题");
    }

    当前专题.classList.add("当前专题");
    前一专题 = 当前专题;
    // 专题名称 = 专题.getElementsByClassName("专题-内容")[0].textContent.trim();

    index = Array.from(专题组).indexOf(当前专题);

    if (!专题索引记录.some((记录) => 记录.技术栈 === 技术栈名称)) {
      专题索引记录.push({ 技术栈: 技术栈名称, 专题索引: index });
    } else {
      let 记录 = 专题索引记录.find((记录) => 记录.技术栈 === 技术栈名称);
      记录.专题索引 = index;
    }

    localStorage.setItem("专题索引记录", JSON.stringify(专题索引记录));
  }

  专题标记组 = document.querySelectorAll(".专题-标记");

  index = JSON.parse(localStorage.getItem("专题索引记录")).find((记录) => 记录.技术栈 === 技术栈名称).专题索引;

  专题组[index]?.classList.add("当前专题");
  专题组.forEach((专题) => {
    专题.addEventListener("click", 修改专题样式);
    const 标记 = 专题.querySelector(".专题-标记");
    if (专题.hasAttribute("原创")) {
      标记.innerHTML = "<i class='fa-solid fa-mug-hot'></i>";
    } else {
      标记.innerHTML = "<i class='fa-solid fa-circle-nodes'></i>";
    }
    专题.addEventListener("click", 当前专题已被收藏时刷新收藏按钮样式);
  });

  前一专题 = 专题组[index];
  /*专题名称 = 专题组[index]
    ?.getElementsByClassName("专题-内容")[0]
    .textContent.trim();*/
  localStorage.setItem("专题", 专题名称);

  const 选项卡图标 = document.querySelector("link[rel='icon']");
  const 技术栈图标 = document.querySelector(".专题名称 > img");
  选项卡图标.href = 技术栈图标.src;
}

// 从 JS 代码中提取全局变量/类/函数名
function 提取全局声明(代码内容) {
  const 声明列表 = [];
  // 匹配 class 声明: class ClassName { 或 class ClassName extends
  const classRegex = /^\s*class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/gm;
  let match;
  while ((match = classRegex.exec(代码内容)) !== null) {
    声明列表.push(match[1]);
  }
  // 匹配 function 声明: function functionName( 或 function functionName {
  const functionRegex = /^\s*function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[({]/gm;
  while ((match = functionRegex.exec(代码内容)) !== null) {
    声明列表.push(match[1]);
  }
  // 匹配 const/let/var 声明（全局作用域）: const/let/var variableName =
  const varRegex = /^\s*(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/gm;
  while ((match = varRegex.exec(代码内容)) !== null) {
    声明列表.push(match[1]);
  }
  return 声明列表;
}

// 清理之前专题加载的外部资源（JS 和 CSS）
function 清理专题外部资源() {
  // 清理之前专题的 JS 文件
  const 之前专题JS = document.querySelectorAll('script[data-专题资源="true"]');
  之前专题JS.forEach((脚本) => 脚本.remove());

  // 清理之前专题的 CSS 文件
  const 之前专题CSS = document.querySelectorAll('link[data-专题资源="true"]');
  之前专题CSS.forEach((样式) => 样式.remove());
}

// 清理全局作用域中的变量（避免重复声明错误）
function 清理全局变量(变量名列表) {
  变量名列表.forEach((变量名) => {
    try {
      // 尝试从 window 对象删除（适用于 class、function、var 声明的变量）
      if (window.hasOwnProperty(变量名)) {
        delete window[变量名];
      }
      // 对于 const/let 声明的变量，它们不在 window 对象上
      // 但我们可以尝试通过 eval 来删除（虽然不推荐，但这是唯一的方法）
      // 实际上，const/let 声明的变量无法删除，但我们可以通过重新声明来覆盖
      // 由于我们会在执行新代码前清理，所以重复声明错误会在执行时发生
      // 但通过 delete window[变量名] 已经可以处理大部分情况（class、function）
    } catch (error) {
      // 某些变量可能无法删除，忽略错误
    }
  });
}

// 加载专题的外部 JS 文件（如果存在）
async function 加载专题JS文件(技术栈名称, 专题名称) {
  const JS文件路径 = `./博客内容/${技术栈名称}/${专题名称}/index.js`;
  try {
    const response = await fetch(JS文件路径);
    if (response.ok) {
      // 获取 JS 代码内容
      const 代码内容 = await response.text();
      if (代码内容.trim()) {
        // 提取代码中声明的全局变量/类/函数
        const 全局声明列表 = 提取全局声明(代码内容);
        // 清理这些全局变量，避免重复声明错误
        清理全局变量(全局声明列表);

        // 使用 new Function 执行代码
        try {
          new Function(代码内容)();
        } catch (执行错误) {
          console.error(`执行专题 JS 文件时出错 (${JS文件路径}):`, 执行错误);
        }
      }
      return true;
    }
  } catch (error) {
    // 文件不存在或加载失败，忽略错误
  }
  return false;
}

// 加载专题的外部 CSS 文件（如果存在）
async function 加载专题CSS文件(技术栈名称, 专题名称) {
  const CSS文件路径 = `./博客内容/${技术栈名称}/${专题名称}/index.css`;
  try {
    const response = await fetch(CSS文件路径);
    if (response.ok) {
      const 样式元素 = document.createElement("link");
      样式元素.rel = "stylesheet";
      样式元素.type = "text/css";
      样式元素.href = CSS文件路径;
      样式元素.setAttribute("data-专题资源", "true");
      document.head.appendChild(样式元素);
      return true;
    }
  } catch (error) {
    // 文件不存在或加载失败，忽略错误
  }
  return false;
}

async function 设置内容() {
  专题文件路径 = `./博客内容/${技术栈名称}/${专题名称}/index.html`;
  let 需要更新侧边栏 = false;
  let 发生了回退 = false;

  // 清理之前专题的外部资源
  清理专题外部资源();

  try {
    const response = await fetch(专题文件路径);
    if (!response.ok) {
      // 如果文件不存在，回退到首页
      专题文件路径 = `./博客内容/${技术栈名称}/首页/index.html`;
      专题名称 = "首页";
      localStorage.setItem("专题", 专题名称);
      需要更新侧边栏 = true;
      发生了回退 = true;

      const 首页响应 = await fetch(专题文件路径);
      if (!首页响应.ok) {
        throw new Error(`无法加载专题文件: ${专题文件路径}`);
      }
      const content = await 首页响应.text();
      专题内容区.innerHTML = content;
    } else {
      const content = await response.text();
      专题内容区.innerHTML = content;
    }

    // 加载专题的外部 JS 和 CSS 文件（如果存在）
    await 加载专题CSS文件(技术栈名称, 专题名称);
    await 加载专题JS文件(技术栈名称, 专题名称);

    // 处理 HTML 内联的 script 标签（保持向后兼容，虽然重构后应该不会有）
    const parser = new DOMParser();
    const document = parser.parseFromString(专题内容区.innerHTML, "text/html");
    const 脚本组 = document.body.querySelectorAll("script");
    脚本组?.forEach((脚本) => {
      脚本.type = "text/javascript";
      const 脚本代码 = 脚本.textContent.trim();
      if (脚本代码) {
        //Function(`'use strict'; return ${脚本代码}`)();
        new Function(脚本代码)();
      }
    });
  } catch (error) {
    console.error("加载专题内容时出错:", error);
    // 如果连首页都无法加载，显示错误信息
    专题内容区.innerHTML = `<div style="padding: 20px; text-align: center; color: #ff6b6b;">
      <h2>页面加载失败</h2>
      <p>无法加载专题内容，请检查网络连接或联系管理员。</p>
    </div>`;
  }

  const 选项卡标题 = document.querySelector("title");
  选项卡标题.textContent = `${技术栈名称}-${专题名称}`;
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant",
  });
  特殊元素样式补充();
  刷新第三方库();
  插入转载提醒内容();

  // 如果回退到了首页，需要更新侧边栏选中状态
  if (需要更新侧边栏) {
    设置侧边栏();
  }

  return 发生了回退;
}

function 点选技术栈(event) {
  const 技术栈 = event.currentTarget;
  技术栈名称 = 技术栈.getElementsByTagName("p")[0].textContent.trim();
  if (技术栈名称 === "Web前端原生开发") {
    技术栈名称 = "Web前端-原生开发";
  } else if (技术栈名称 === "C#") {
    技术栈名称 = "CSharp";
  }
  localStorage.setItem("页面技术栈", 技术栈名称);

  if (!专题索引记录.some((item) => item.技术栈 === 技术栈名称)) {
    专题索引记录.push({ 技术栈: 技术栈名称, 专题索引: 0 });
    index = 0;
  } else {
    const 记录 = 专题索引记录.find((记录) => 记录.技术栈 === 技术栈名称);
    index = 记录.专题索引;
  }
  localStorage.setItem("专题索引记录", JSON.stringify(专题索引记录));
}

function 修改专题样式(event) {
  event.stopPropagation();
  const 专题 = event.currentTarget;
  if (前一专题 === 专题) return;
  if (前一专题 !== null) {
    前一专题.classList.remove("当前专题");
  }
  专题.classList.add("当前专题");
  前一专题 = 专题;
  专题名称 = 专题.getElementsByClassName("专题-内容")[0].innerText;
  localStorage.setItem("专题", 专题名称);

  index = Array.from(专题组).indexOf(专题);
  if (!专题索引记录.some((记录) => 记录.技术栈 === 技术栈名称)) {
    专题索引记录.push({ 技术栈: 技术栈名称, 专题索引: index });
  } else {
    const 记录 = 专题索引记录.find((记录) => 记录.技术栈 === 技术栈名称);
    记录.专题索引 = index;
  }
  localStorage.setItem("专题索引记录", JSON.stringify(专题索引记录));

  设置内容().then((发生了回退) => {
    生成章节区();
    生成章节();
    初始化章节观察器();
    更新网址(技术栈名称, 专题名称);
  });
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

function 生成章节区() {
  const 专题正文区 = document.querySelector(".专题正文区");
  if (专题正文区 === null || 专题正文区.innerHTML === "") return;

  const 章节区 = document.createElement("div");
  章节区.id = "章节区";
  const 章节区标题 = document.createElement("h2");
  章节区标题.className = "章节区标题";
  章节区标题.textContent = "目录";
  const 章节区内容 = document.createElement("div");
  章节区内容.className = "章节区内容";
  章节区.append(章节区标题, 章节区内容);

  const 章节区容器 = document.createElement("div");
  章节区容器.id = "章节区容器";
  章节区容器.appendChild(章节区);

  专题正文区.appendChild(章节区容器);
}

function 生成章节() {
  const 专题正文区 = document.querySelector(".专题正文区");
  if (专题正文区 === null || 专题正文区.innerHTML === "") return;

  const 章节区 = document.getElementById("章节区");
  const 章节区内容 = 章节区.querySelector(".章节区内容");
  章节区内容.innerHTML = "";

  const 二级标题组 = document.querySelectorAll(".分区2级标题");
  if (二级标题组.length === 0) {
    const 三级标题组 = document.querySelectorAll(".分区3级标题");
    三级标题组.forEach((三级标题, index) => {
      三级标题.id = `三级标题-${index + 1}`;
      const 锚链接 = document.createElement("a");
      锚链接.className = "锚链接-3级标题";
      锚链接.innerHTML = 三级标题.innerHTML;
      锚链接.href = `#${三级标题.id}`;
      const 序号 = document.createElement("span");
      序号.className = "标题序号-3级";
      序号.textContent = `${index + 1}`;
      锚链接.prepend(序号);

      锚链接.addEventListener("click", (event) => {
        event.preventDefault(); //防止将锚链接加入历史记录

        //上一行也会同时屏蔽锚链接的滚动，下面的代码恢复滚动功能
        const targetElement = document.querySelector(锚链接.getAttribute("href"));
        targetElement.scrollIntoView();
      });

      章节区内容.appendChild(锚链接);
    });
  } else {
    二级标题组.forEach((二级标题, index_2) => {
      二级标题.id = `二级标题-${index_2 + 1}`;
      const 二级锚链接 = document.createElement("a");
      二级锚链接.className = "锚链接-2级标题";
      二级锚链接.innerHTML = 二级标题.innerHTML;
      二级锚链接.href = `#${二级标题.id}`;

      二级锚链接.addEventListener("click", (event) => {
        event.preventDefault(); //防止将锚链接加入历史记录

        //上一行也会同时屏蔽锚链接的滚动，下面的代码恢复滚动功能
        const targetElement = document.querySelector(二级锚链接.getAttribute("href"));
        targetElement.scrollIntoView();
      });

      章节区内容.appendChild(二级锚链接);
      const 三级标题组 = document.querySelectorAll(`#${二级标题.id} ~ .分区3级标题`);
      三级标题组.forEach((三级标题, index_3) => {
        三级标题.id = `三级标题-${index_2 + 1}-${index_3 + 1}`;
        const 三级锚链接 = document.createElement("a");
        三级锚链接.className = "锚链接-3级标题";
        三级锚链接.innerHTML = 三级标题.innerHTML;
        三级锚链接.href = `#${三级标题.id}`;

        三级锚链接.addEventListener("click", (event) => {
          event.preventDefault(); //防止将锚链接加入历史记录

          //上一行也会同时屏蔽锚链接的滚动，下面的代码恢复滚动功能
          const targetElement = document.querySelector(三级锚链接.getAttribute("href"));
          targetElement.scrollIntoView();
        });

        章节区内容.appendChild(三级锚链接);
      });
    });
  }
}

function 初始化章节观察器() {
  const 简介标题 = document.querySelector(".简介标题");
  if (简介标题 === null) return;
  const 正文区标题组 = document.querySelectorAll(".分区3级标题");
  const 章节区标题组 = document.querySelectorAll(".锚链接-3级标题");
  const 参数 = {
    rootMargin: "-95px 0px -66.666667% 0px",
    threshold: 1,
  };
  const 正文区标题观察器 = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        let 标题索引 =
          entry.target.className === 简介标题.className ? -1 : Array.from(正文区标题组).indexOf(entry.target);

        if (entry.target.className !== 简介标题.className) {
          章节区标题组[标题索引].classList.add("已激活");
          const top偏移 = 章节区标题组[标题索引].offsetTop;
          const 高度 = window.getComputedStyle(章节区标题组[标题索引]).height;
          root.style.setProperty("--章节区位置-偏移-top", `${top偏移}px`);
          root.style.setProperty("--章节区位置-高度", 高度);
        }

        if (上一激活标题 !== null && 上一激活标题 !== 章节区标题组[标题索引]) {
          上一激活标题.classList.remove("已激活");
        }

        if (entry.target.className !== 简介标题.className) {
          上一激活标题 = 章节区标题组[标题索引];
        }
      }
    });
  }, 参数);

  正文区标题观察器.observe(简介标题);
  正文区标题组.forEach((标题) => {
    正文区标题观察器.observe(标题);
  });
}

//---------------------- ↓ 对内容中的特殊元素补充样式 ----------------------
function 特殊元素样式补充() {
  const topicContentArea = document.getElementsByClassName("专题内容区")[0];
  if (topicContentArea.innerHTML === "") return;

  const 原创转载 = document.querySelector(".简介标题 > span");
  if (原创转载?.className === "转载") {
    const 原文链接 = document.querySelector(".原文链接 > a");
    原文链接.style.marginLeft = "0";
  }

  const 分区2级标题组 = document.querySelectorAll(".分区2级标题");
  分区2级标题组?.forEach((标题, 索引) => {
    const 标题序号 = document.createElement("span");
    标题序号.className = "标题序号-2级";
    标题序号.textContent = `${索引 + 1}`;
    标题.prepend(标题序号);

    const 首个2级行内专业名词 = 标题.querySelector(".行内专业名词");
    const 首个2级行内专业名词前一节点 = 首个2级行内专业名词?.previousSibling;
    if (
      首个2级行内专业名词前一节点?.textContent.trim() === "" ||
      首个2级行内专业名词前一节点?.className?.includes("标题序号")
    ) {
      首个2级行内专业名词.style.marginLeft = "0";
    }

    const 下属3级标题组 = 标题.parentElement.querySelectorAll(".分区3级标题");
    下属3级标题组.forEach((下属3级标题, 下属索引) => {
      const 下属序号 = document.createElement("span");
      下属序号.className = "标题序号-3级";
      下属序号.innerHTML = `${索引 + 1}<span class="次要">-</span>${下属索引 + 1}`;
      下属3级标题.prepend(下属序号);
    });
  });

  const 分区3级标题组 = document.querySelectorAll(".分区3级标题");
  分区3级标题组.forEach((标题) => {
    let 首节点 = 标题.childNodes[0];
    if (首节点.textContent.trim().length === 0) 首节点 = 标题.childNodes[1];

    if (首节点.nodeType === Node.ELEMENT_NODE) {
      首节点.style.marginLeft = "0";
    }

    const 内部行内专业名词 = 标题.querySelector(".行内专业名词");
    if (内部行内专业名词 === null) return;

    const 内部行内专业名词前一节点 = 内部行内专业名词?.previousSibling;
    if (内部行内专业名词前一节点 === null) {
      内部行内专业名词.style.marginLeft = "0";
      return;
    }

    if (
      (内部行内专业名词前一节点.nodeType === Node.TEXT_NODE && 内部行内专业名词前一节点.textContent.trim() === "") ||
      内部行内专业名词前一节点?.className?.includes("标题序号")
    ) {
      内部行内专业名词.style.marginLeft = "0";
    }
  });

  const 附加说明组 = document.querySelectorAll(".附加说明");
  附加说明组.forEach((附加说明) => {
    const 前一节点 = 附加说明.previousSibling;
    if (前一节点 === null) return;

    if (远距标点组.some((标点) => 标点 === 前一节点.textContent.at(-1))) {
      附加说明.style.marginLeft = "0";
    }

    if (前一节点.className !== "超链接" && 前一节点.nodeType === Node.ELEMENT_NODE) {
      附加说明.style.marginLeft = "2px";
    }

    if (附加说明 === 附加说明.parentElement.lastChild) {
      附加说明.style.marginRight = "0";
    }
  });

  const 超链接组 = document.querySelectorAll(".超链接");
  超链接组.forEach((超链接) => {
    const 前一节点 = 超链接.previousSibling;
    if (前一节点?.textContent.trim().length === 0) {
      超链接.style.marginLeft = "0";
    }

    if (前一节点?.nodeType === Node.TEXT_NODE && 远距标点组.some((标点) => 标点 === 前一节点?.textContent.at(-1))) {
      超链接.style.marginLeft = "0";
    }
  });

  const 行内专业名词组 = document.querySelectorAll(".行内专业名词");
  行内专业名词组.forEach((行内专业名词) => {
    const 前一节点 = 行内专业名词.previousSibling;
    const 后一节点 = 行内专业名词.nextSibling;
    if (前一节点 === null) return;
    if (
      前一节点.tagName === "BR" ||
      (前一节点.nodeType === Node.TEXT_NODE &&
        (远距标点组.slice(-(远距标点组.length - 1)).some((标点) => 标点 === 前一节点.textContent.at(-1)) ||
          前一节点.textContent.trim() === "")) ||
      (前一节点.nodeType === Node.ELEMENT_NODE && 行内专业名词.previousElementSibling.className === "专业名词")
    ) {
      行内专业名词.style.marginLeft = "0";
    }

    if (行内专业名词.parentElement.className === "附加说明" && 行内专业名词 === 行内专业名词.parentNode.lastChild) {
      行内专业名词.style.marginRight = "0";
    }

    if (后一节点 === null || 后一节点.nodeType !== Node.ELEMENT_NODE) return;
    const 后一节点元素 = 行内专业名词.nextElementSibling;
    if (后一节点元素.className.includes("强调")) {
      行内专业名词.style.marginRight = "0";
    }
  });

  const 分区普通文本组 = document.querySelectorAll(".分区普通文本");
  分区普通文本组?.forEach((分区普通文本) => {
    const 首节点 = 分区普通文本.firstChild;
    if (首节点 === null) return;
    if (首节点.nodeType === Node.TEXT_NODE && 首节点.textContent.trim().length === 0) {
      const 第2节点 = 首节点.nextSibling;
      if (第2节点.nodeType === Node.ELEMENT_NODE) {
        第2节点.style.marginLeft = "0";
      }
    }
  });

  const 专业名词组 = document.querySelectorAll(".专业名词");
  专业名词组?.forEach((专业名词) => {
    const 前一节点 = 专业名词.previousSibling;
    if (前一节点 === null || 远距标点组.some((标点) => 标点 === 前一节点.textContent.at(-1))) {
      专业名词.style.marginLeft = "0";
    }
  });

  const 代码组 = document.querySelectorAll(".代码");
  代码组?.forEach((代码) => {
    const 前一节点 = 代码.previousSibling;
    if (前一节点 === null || 远距标点组.some((标点) => 标点 === 前一节点.textContent.at(-1))) {
      代码.style.marginLeft = "0";
    }

    const 前一元素 = 代码.previousElementSibling;
    if (
      前一元素 !== null &&
      前一元素.tagName === "BR" &&
      前一节点 !== null &&
      前一节点.nodeType === Node.TEXT_NODE &&
      前一节点.textContent.trim() === ""
    ) {
      代码.style.marginLeft = "0.25em";
    }

    const 父元素 = 代码.parentElement;
    if (父元素 === null) return;
    if (父元素.className === "行内专业名词" && 父元素.style.marginRight !== "0") {
      代码.style.marginRight = "0";
    }

    /*const 父节点后一节点 = 代码.parentNode.nextSibling;
    if (
      父节点后一节点 === null ||
      父节点后一节点.nodeType !== Node.ELEMENT_NODE
    )
      return;
    const 父节点后一元素 = 代码.parentElement.nextElementSibling;
    if (父节点后一元素.className === "附加说明") {
      代码.style.marginRight = "0";
    }*/
  });

  const 行内代码组 = document.querySelectorAll(".行内代码");
  行内代码组?.forEach((行内代码) => {
    if (行内代码 === 行内代码.parentNode.firstChild) {
      行内代码.style.marginLeft = "0";
    } else {
      const 前一节点 = 行内代码.previousSibling;
      if (前一节点.nodeType === Node.ELEMENT_NODE) {
        const 前一元素 = 行内代码.previousElementSibling;
        if (前一元素.className === "行内专业名词" || 前一元素.className.includes("标题序号")) {
          行内代码.style.marginLeft = "0";
          return;
        }
      }
      const 修剪文本 = 前一节点.textContent.trim();
      if (
        修剪文本 === "" ||
        远距标点组.some((标点) => 标点 === 修剪文本) ||
        远距标点组.some((标点) => 标点 === 修剪文本.at(-1)) ||
        前一节点.textContent.at(-1) === " "
      ) {
        // 行内代码.style.marginLeft = "0";
        行内代码.classList.add("左外边距-无");
      } else {
        // 行内代码.style.marginLeft = "0.25em";
        行内代码.classList.add("左外边距-四分之一");
      }
    }

    if (行内代码 === 行内代码.parentNode.lastChild) {
      行内代码.style.marginRight = "0";
    }
  });

  const 换行符后续块内组 = document.querySelectorAll("br + :is(.代码, .专业名词, .附加说明)");
  换行符后续块内组?.forEach((元素) => {
    let 前一节点 = 元素.previousSibling;
    let 前一元素 = 元素.previousElementSibling;
    if (
      前一节点.textContent !== 前一元素.textContent &&
      前一元素.tagName !== "BR" /* 注意：<br>元素的tagName是"BR" */
    ) {
      元素.style.marginLeft = "0.25em";
    }
  });

  const 强调组 = document.querySelectorAll(".强调");
  强调组?.forEach((强调) => {
    const 前一节点 = 强调.previousSibling;
    if (前一节点 === null || 远距标点组.some((标点) => 标点 === 前一节点.textContent.at(-1))) {
      强调.style.marginLeft = "0";
    }

    const 后一节点 = 强调.nextSibling;
    if (后一节点 === null) return;
    if (后一节点.nodeType === Node.TEXT_NODE) {
      强调.style.marginRight = "2px";
    }
  });

  const 表格组 = document.querySelectorAll(".表格");
  表格组?.forEach((表格) => {
    const 表格后元素 = 表格.nextElementSibling;
    if (表格后元素?.className === "提醒") {
      表格.style.marginBottom = "50px";
    }
  });

  const 分区列表项组 = document.querySelectorAll(".分区列表项");
  分区列表项组?.forEach((分区列表项) => {
    if (
      分区列表项.hasChildNodes() &&
      分区列表项.firstChild.nodeType === Node.TEXT_NODE &&
      分区列表项.firstChild.textContent.trim().length === 0
    ) {
      分区列表项.firstChild.textContent = "";
    }
  });
}

//---------------------- ↑ 对内容中的特殊元素补充样式 ----------------------

function 插入转载提醒内容() {
  const 转载提醒 = document.querySelector(".转载提醒");
  if (转载提醒 === null) return;
  const 转载提醒段落 = document.createElement("p");
  转载提醒段落.textContent = 转载提醒文本;
  转载提醒.appendChild(转载提醒段落);
}

侧边栏收缩容器.addEventListener("click", 修改侧边栏可见性);
let 侧边栏可见 = !侧边栏.className.includes("隐藏");

function 修改侧边栏可见性() {
  if (!侧边栏可见) {
    侧边栏.classList.remove("侧边栏隐藏");
  } else {
    侧边栏.classList.add("侧边栏隐藏");
  }
  侧边栏可见 = !侧边栏.className.includes("隐藏");
}

const 视口宽度低于800px = window.matchMedia("(width < 1000px)");

视口宽度低于800px.addEventListener("change", () => {
  修改视口尺寸();
});

function 修改视口尺寸() {
  if (!视口宽度低于800px.matches) {
    侧边栏.classList.remove("侧边栏隐藏");
  } else {
    侧边栏.classList.add("侧边栏隐藏");
  }
  侧边栏可见 = !侧边栏.className.includes("隐藏");
}

function 当前专题已被收藏时刷新收藏按钮样式() {
  if (
    JSON.parse(localStorage.getItem("博客收藏"))?.some((收藏) => 收藏.技术栈 === 技术栈名称 && 收藏.专题 === 专题名称)
  ) {
    // 收藏按钮.style.color = "seagreen";
    收藏按钮.classList.add("已收藏状态按钮");
    收藏按钮.classList.remove("未收藏状态按钮");
  } else {
    // 收藏按钮.style.color = "white";
    收藏按钮.classList.remove("已收藏状态按钮");
    收藏按钮.classList.add("未收藏状态按钮");
  }
}

//------------------- ↓ 监控专题内容区内 DOM 修改 -------------------
const mutationObserver = new MutationObserver(专题改变时运行);
mutationObserver.observe(专题内容区, {
  childList: true,
});

function 专题改变时运行() {
  更新图像序号();
  双击图像生成图像对话框();
}

function 双击图像生成图像对话框() {
  const 截图容器组 = document.getElementsByClassName("截图容器");
  for (const 截图容器 of 截图容器组) {
    // const 图像 = 截图容器.querySelector("img");
    // if (图像 === null) continue;
    const 图像组 = 截图容器.querySelectorAll("img");
    if (图像组.length === 0) continue;

    for (const 图像 of 图像组) {
      const 图像源 = 图像.src;
      const 图像替换文本 = 图像.alt;
      图像.title = "单击以放大";

      图像.addEventListener("click", () => {
        const 对话框 = document.createElement("dialog");
        对话框.className = "图像对话框";
        对话框.classList.add("图像对话框出现");
        对话框.addEventListener("click", () => {
          对话框.classList.remove("图像对话框出现");
          对话框.classList.add("图像对话框消失");
          setTimeout(() => {
            对话框.remove();
          }, 250);
        });

        const 关闭按钮 = document.createElement("button");
        关闭按钮.className = "图像对话框关闭按钮";
        关闭按钮.textContent = "✖";
        关闭按钮.addEventListener("click", (event) => {
          event.stopPropagation();
          对话框.classList.remove("图像对话框出现");
          对话框.classList.add("图像对话框消失");
          setTimeout(() => {
            对话框.remove();
          }, 250);
        });

        const image = document.createElement("img");
        image.src = 图像源;
        image.alt = 图像替换文本;
        image.className = "原始图";
        对话框.append(关闭按钮, image);

        截图容器.appendChild(对话框);
        对话框.show();
      });
    }
  }
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
    if (containerSibling !== null && containerSibling.className === "分区普通文本") {
      const 行内截图序号 = document.createElement("span");
      行内截图序号.className = "行内截图序号";
      行内截图序号.textContent = `· 图${imageIndex + 1} ·`;
      containerSibling?.prepend("如 ", 行内截图序号, " 所示：");
    }
  });
}

function 生成永恒代码统计图表() {
  // 基于准备好的dom，初始化echarts实例
  const myChart = echarts.init(document.getElementById("永恒代码统计图表"), "dark");

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
        data: [
          {
            value: 48203,
            itemStyle: {
              color: "#b0c3da",
            },
          },
          {
            value: 23030,
            itemStyle: {
              color: "#b5a925",
            },
          },
          {
            value: 21124,
            itemStyle: {
              color: "#33c765",
            },
          },
          {
            value: 4042,
            itemStyle: {
              color: "#2999ee",
            },
          },
        ],
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
