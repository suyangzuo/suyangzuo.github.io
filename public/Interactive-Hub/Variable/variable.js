const root = document.querySelector(":root");
const 内存分配区 = document.querySelector(".内存分配区");
const 变量区 = document.querySelector(".变量区");
const 变量容器区 = 变量区.querySelector(".变量容器区");
const 内存容量滑块 = document.getElementById("内存容量");
const 变量容器组 = document.getElementsByClassName("变量容器");
const 重置按钮 = document.querySelector(".重置按钮");

let 程序颜色 = "black";
let 内存容量 = parseInt(内存容量滑块.value, 10);
const 内存位数 = 32;
let 内存起始地址_10进制 = Math.floor(Math.random() * 300000000);
let 空闲内存表 = [{ 起始位置: 0, 容量: 内存容量 - 1 }];

const 变量类型表 = new Map();
变量类型表.set("int", { 长度: 4, 有符号: true });
变量类型表.set("short", { 长度: 2, 有符号: true });
变量类型表.set("char", { 长度: 1, 有符号: true });
变量类型表.set("long long", { 长度: 8, 有符号: true });
变量类型表.set("float", { 长度: 4, 有符号: true });
变量类型表.set("double", { 长度: 8, 有符号: true });
变量类型表.set("unsigned int", { 长度: 4, 有符号: false });
变量类型表.set("unsigned short", { 长度: 2, 有符号: false });
变量类型表.set("unsigned char", { 长度: 1, 有符号: false });
变量类型表.set("unsigned long long", { 长度: 8, 有符号: false });
变量类型表.set("unsigned float", { 长度: 4, 有符号: false });
变量类型表.set("unsigned double", { 长度: 8, 有符号: false });
变量类型表.set("int *", { 长度: 4, 有符号: false });
变量类型表.set("short *", { 长度: 2, 有符号: false });
变量类型表.set("char *", { 长度: 1, 有符号: false });
变量类型表.set("long long *", { 长度: 8, 有符号: false });
变量类型表.set("int*", { 长度: 4, 有符号: false });
变量类型表.set("short*", { 长度: 2, 有符号: false });
变量类型表.set("char*", { 长度: 1, 有符号: false });
变量类型表.set("long long*", { 长度: 8, 有符号: false });
变量类型表.set("float *", { 长度: 4, 有符号: false });
变量类型表.set("double *", { 长度: 8, 有符号: false });
变量类型表.set("float*", { 长度: 4, 有符号: false });
变量类型表.set("double*", { 长度: 8, 有符号: false });

const 无效标识符起始字符表 = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
const 无效标识符字符表 = new Set([
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "-",
  "+",
  "=",
  "{",
  "}",
  "[",
  "]",
  "|",
  "\\",
  ":",
  ";",
  "'",
  '"',
  "<",
  ">",
  ",",
  "/",
  "?",
  "~",
  "`",
  "!",
  " ",
]);

const 应用池 = [
  "Photoshop",
  "百度网盘",
  "微信",
  "Edge浏览器",
  "网易云音乐",
  "Blender",
  "3ds Max",
  "QQ",
  "饿了么",
  "抖音",
  "Word",
  "Excel",
  "PowerPoint",
  "VS Code",
  "Steam",
  "WinRAR",
  "Illustrator",
  "Premiere Pro",
  "Inkscape",
  "Krita",
  "小红书",
  "Animate",
  "记事本",
  "画图",
  "Bandicam",
];
let 预安装应用数 = Math.floor(Math.random() * (7 - 2 + 1)) + 2;
const 最小占用内存 = 2;
const 最大占用内存 = 192;
const 内存占用表 = new Map();

初始化内存();

内存容量滑块.addEventListener("input", () => {
  内存起始地址_10进制 = Math.floor(Math.random() * 300000000);
  内存容量 = parseInt(内存容量滑块.value, 10);
  const 滑块值 = 内存容量滑块.parentElement.querySelector(".滑块值");
  滑块值.textContent = 内存容量滑块.value;
  空闲内存表 = [{ 起始位置: 0, 容量: 内存容量 - 1 }];
  初始化内存();
});

function 初始化内存() {
  预安装应用数 = Math.floor(Math.random() * (7 - 2 + 1)) + 2;
  数组洗牌(应用池);
  内存占用表.clear();
  for (let i = 0; i < 预安装应用数; i++) {
    内存占用表.set(应用池[i], {
      起始位置: 0,
      容量: Math.floor(Math.random() * (最大占用内存 - 最小占用内存 + 1) + 最小占用内存),
    });
  }

  变量容器区.innerHTML = "";
  for (let i = 0; i < 内存容量; i++) {
    const 变量容器 = document.createElement("div");
    变量容器.className = "变量容器";
    变量容器区.appendChild(变量容器);

    let 内存地址_10进制 = 内存起始地址_10进制 + i;
    变量容器.setAttribute("内存地址-10进制", 内存地址_10进制);
    变量容器.setAttribute("内存地址-16进制", 获取16进制内存地址(内存地址_10进制, 内存位数));
    变量容器.setAttribute("索引", i);

    const 字节描述 = document.createElement("div");
    字节描述.className = "字节描述";
    变量容器.appendChild(字节描述);
    const 字节名称与顺位 = document.createElement("div");
    字节名称与顺位.className = "字节名称与顺位";
    const 字节地址 = document.createElement("span");
    字节地址.className = "字节地址";
    字节描述.append(字节名称与顺位, 字节地址);
  }

  内存分配区.innerHTML = "";
  const 内存分配区标题 = document.createElement("h4");
  内存分配区标题.className = "内存分配区标题";
  内存分配区标题.textContent = "内存分配";
  内存分配区.appendChild(内存分配区标题);
  for (const 应用键值对 of 内存占用表) {
    //键：应用名称
    //值：{起始位置，容量}
    // 程序颜色 = 生成随机深色();
    空闲内存表 = 数组洗牌(空闲内存表);
    const 已分配内存 = 向内存中添加应用(应用键值对);
    if (已分配内存) {
      添加内存分配示意(应用键值对);
    }
  }
}

function 获取16进制内存地址(内存地址_10进制, 内存位数) {
  const 内存地址_16进制 = 内存地址_10进制.toString(16);
  return `${"0".repeat(内存位数 / 4 - 内存地址_16进制.length)}${内存地址_16进制}`;
}

function 向内存中添加应用(应用键值对) {
  //键：应用名称
  //值：{起始位置，容量}
  const 新的空闲内存表 = [];
  const 应用占用内存 = 应用键值对[1].容量;
  let 已分配内存 = false;
  for (let i = 0; i < 空闲内存表.length; i++) {
    if (已分配内存 || 空闲内存表[i].容量 < 应用占用内存) {
      新的空闲内存表.push(空闲内存表[i]);
      continue;
    }

    已分配内存 = true;
    const 最高位置 = 空闲内存表[i].起始位置 + 空闲内存表[i].容量 - 应用占用内存;
    const 最低位置 = 空闲内存表[i].起始位置;
    const 起始位置 = Math.floor(Math.random() * (最高位置 - 最低位置 + 1) + 最低位置);
    应用键值对[1].起始位置 = 起始位置;
    if (起始位置 === 空闲内存表[i].起始位置) {
      空闲内存表[i].起始位置 = 空闲内存表[i].起始位置 + 应用占用内存;
      空闲内存表[i].容量 = 空闲内存表[i].容量 - 应用占用内存;
      新的空闲内存表.push(空闲内存表[i]);
      变量容器组[起始位置 + 应用占用内存].classList.add("空闲-起始");
    } else if (起始位置 + 应用占用内存 === 空闲内存表[i].起始位置 + 空闲内存表[i].容量) {
      空闲内存表[i].容量 = 空闲内存表[i].容量 - 应用占用内存;
      新的空闲内存表.push(空闲内存表[i]);
      变量容器组[起始位置].classList.add("空闲-起始");
    } else {
      const 应用前方未占用内存 = {
        起始位置: 空闲内存表[i].起始位置,
        容量: 起始位置 - 空闲内存表[i].起始位置,
      };
      const 应用后方未占用内存 = {
        起始位置: 起始位置 + 应用占用内存,
        容量: 空闲内存表[i].起始位置 + 空闲内存表[i].容量 - (起始位置 + 应用占用内存),
      };
      变量容器组[应用前方未占用内存.起始位置].classList.add("空闲-起始");
      变量容器组[应用后方未占用内存.起始位置].classList.add("空闲-起始");
      新的空闲内存表.push(应用前方未占用内存);
      新的空闲内存表.push(应用后方未占用内存);
    }

    程序颜色 = 生成随机深色();
    let 应用内存顺序 = 0;
    for (let j = 应用键值对[1].起始位置; j < 应用键值对[1].起始位置 + 应用占用内存; j++) {
      if (j === 应用键值对[1].起始位置) {
        变量容器组[j].classList.remove("空闲-起始");
        const 应用抬头容器 = document.createElement("div");
        应用抬头容器.className = "应用抬头容器";
        变量容器组[j].appendChild(应用抬头容器);
        const 应用抬头 = document.createElement("div");
        应用抬头.className = "应用抬头";
        应用抬头.setAttribute("应用名称", 应用键值对[0]);
        应用抬头.addEventListener("mouseenter", () => {
          root.style.setProperty("--抬头应用名称", 应用键值对[0]);
        });
        应用抬头容器.appendChild(应用抬头);
        const 抬头文本 = document.createElement("span");
        抬头文本.className = "抬头文本";
        抬头文本.textContent = 应用键值对[0];
        应用抬头.appendChild(抬头文本);

        应用抬头容器.addEventListener("mouseenter", () => {
          for (let k = 应用键值对[1].起始位置; k < 应用键值对[1].起始位置 + 应用占用内存; k++) {
            变量容器组[k].classList.add("当前应用");
          }
        });
        应用抬头容器.addEventListener("mouseleave", () => {
          for (let k = 应用键值对[1].起始位置; k < 应用键值对[1].起始位置 + 应用占用内存; k++) {
            变量容器组[k].classList.remove("当前应用");
          }
        });
      } else if (j === 应用键值对[1].起始位置 + 应用占用内存 - 1) {
        变量容器组[j].classList.add("末尾");
      }
      变量容器组[j].classList.add("已占用");
      变量容器组[j].setAttribute("应用名称", 应用键值对[0]);
      变量容器组[j].style.backgroundColor = 程序颜色;
      const 本应用内存顺序 = document.createElement("span");
      本应用内存顺序.className = "本应用内存顺序";
      本应用内存顺序.textContent = 应用内存顺序;
      本应用内存顺序.setAttribute("data-内存顺序", 应用内存顺序);
      变量容器组[j].appendChild(本应用内存顺序);
      const 字节描述 = 变量容器组[j].querySelector(".字节描述");
      const 字节名称与顺位 = 字节描述.querySelector(".字节名称与顺位");
      const 字节名称 = document.createElement("span");
      字节名称.className = "字节名称";
      const 字节顺位 = document.createElement("span");
      字节顺位.className = "字节顺位";
      字节名称与顺位.append(字节名称, 字节顺位);
      字节名称.textContent = 应用键值对[0];
      字节顺位.textContent = 应用内存顺序;
      const 字节地址 = 字节描述.querySelector(".字节地址");
      const 地址前缀 = document.createElement("span");
      地址前缀.className = "地址前缀";
      地址前缀.textContent = "0x";
      const 地址值 = document.createElement("span");
      地址值.className = "地址值";
      地址值.textContent = 变量容器组[j].getAttribute("内存地址-16进制");
      字节地址.innerHTML = "";
      字节地址.append(地址前缀, 地址值);
      应用内存顺序++;
    }
  }
  空闲内存表 = 新的空闲内存表;
  return 已分配内存;
}

function 添加内存分配示意(程序) {
  const 内存分配分区 = document.createElement("div");
  内存分配分区.className = "内存分配分区";
  内存分配分区.setAttribute("程序名称", 程序[0]);
  内存分配区.appendChild(内存分配分区);
  const 内存分配名称 = document.createElement("h4");
  内存分配名称.className = "内存分配名称";
  内存分配分区.appendChild(内存分配名称);
  const 名称颜色 = document.createElement("span");
  名称颜色.className = "名称颜色";
  名称颜色.style.backgroundColor = 程序颜色;
  const 名称文本 = document.createElement("span");
  名称文本.className = "名称文本";
  名称文本.textContent = 程序[0];
  内存分配名称.append(名称颜色, 名称文本);
}

function 生成随机颜色() {
  const red = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  return `rgba(${red},${blue},${green},0.75)`;
}

function 生成随机深色() {
  const r = Math.floor(Math.random() * 128); // 0-127 (darker red)
  const g = Math.floor(Math.random() * 128); // 0-127 (darker green)
  const b = Math.floor(Math.random() * 128); // 0-127 (darker blue)
  return `rgb(${r}, ${g}, ${b})`;
}

function 数组洗牌(数组) {
  for (let i = 数组.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [数组[i], 数组[j]] = [数组[j], 数组[i]];
  }
  return 数组;
}

重置按钮.addEventListener("click", () => {
  内存起始地址_10进制 = Math.floor(Math.random() * 300000000);
  空闲内存表 = [{ 起始位置: 0, 容量: 内存容量 - 1 }];
  初始化内存();
});

const 代码输入区 = document.querySelector(".代码输入区");
const 代码输入框组 = 代码输入区.querySelectorAll('input[type="text"]');
let 自定义应用键值对 = null;
let 之前值长度 = 0;
for (const 代码输入框 of 代码输入框组) {
  代码输入框.addEventListener("input", (event) => {
    if (代码输入框.parentElement.parentElement.classList.contains("初始化")) {
      const 类型框 = 代码输入框.parentElement.querySelector(".类型框");
      const 标识符框 = 代码输入框.parentElement.querySelector(".标识符框");
      const 值框 = 代码输入框.parentElement.querySelector(".值框");
      const 类型 = 类型框.value;
      const 标识符 = 标识符框.value;
      const 值 = 值框.value;
      const 类型正确 = 类型.length > 0 && 变量类型表.has(类型);
      const 标识符正确 =
        标识符.length > 0 &&
        !无效标识符起始字符表.has(标识符[0]) &&
        ((标识符, 无效标识符字符表) => [...标识符].some((字符) => 无效标识符字符表.has(字符)));
      const 值正确 = 值.length > 0;
      const 代码内容正确 = 类型正确 && 标识符正确 && 值正确;
      const 输入值 = 值.length !== 之前值长度;
      const 从零输入值 = 值.length === 1 && 值.length > 之前值长度;
      if (!代码内容正确) {
        从内存中删除应用(自定义应用键值对);
        自定义应用键值对 = null;
      } else {
        if (代码输入框.id.includes("类型") || 代码输入框.id.includes("标识符")) {
          从内存中删除应用(自定义应用键值对);
          const 类型容量 = 变量类型表.get(类型).长度;
          自定义应用键值对 = [标识符, { 起始位置: 0, 容量: 类型容量 }];
          空闲内存表 = 数组洗牌(空闲内存表);
          const 已分配内存 = 向内存中添加应用(自定义应用键值对);
          if (已分配内存) {
            添加内存分配示意(自定义应用键值对);
          }
        } else if (从零输入值) {
          const 类型容量 = 变量类型表.get(类型).长度;
          自定义应用键值对 = [标识符, { 起始位置: 0, 容量: 类型容量 }];
          空闲内存表 = 数组洗牌(空闲内存表);
          const 已分配内存 = 向内存中添加应用(自定义应用键值对);
          if (已分配内存) {
            添加内存分配示意(自定义应用键值对);
          }
        }
      }
      之前值长度 = 值.length;
    }
  });
}

function 从内存中删除应用(自定义应用键值对) {
  if (自定义应用键值对 === null) return;
  const 应用名称 = 自定义应用键值对[0];
  const 应用占用内存 = 自定义应用键值对[1].容量;
  let 当前应用变量容器 = 变量容器区.querySelector(`.变量容器[应用名称="${应用名称}"]`);
  const 当前应用变量容器索引 = parseInt(当前应用变量容器.getAttribute("索引"), 10);
  const 当前应用末尾变量容器 = 变量容器区.querySelector(`.变量容器[应用名称="${应用名称}"].已占用.末尾`);
  const 当前应用末尾变量容器索引 = parseInt(当前应用末尾变量容器.getAttribute("索引"), 10);
  const 前方已占用 =
    当前应用变量容器.previousElementSibling === null ||
    当前应用变量容器.previousElementSibling?.classList.contains("已占用");
  const 后方已占用 =
    当前应用末尾变量容器.nextElementSibling === null ||
    当前应用末尾变量容器.nextElementSibling?.classList.contains("已占用");
  if (前方已占用 && 后方已占用) {
    const 新空闲内存 = {
      起始位置: 当前应用变量容器索引,
      容量: 自定义应用键值对[1].容量,
    };
    空闲内存表.push(新空闲内存);
  } else if (前方已占用) {
    const 后方空闲内存索引 = 空闲内存表.findIndex((内存) => 内存.起始位置 === 当前应用末尾变量容器索引 + 1);
    空闲内存表[后方空闲内存索引].起始位置 = 当前应用变量容器索引;
  } else if (后方已占用) {
    const 前方空闲内存索引 = 空闲内存表.findIndex((内存) => 内存.起始位置 + 内存.容量 === 当前应用变量容器索引);
    空闲内存表[前方空闲内存索引].容量 = 空闲内存表[前方空闲内存索引].容量 + 应用占用内存;
  } else {
    const 前方空闲内存索引 = 空闲内存表.findIndex((内存) => 内存.起始位置 + 内存.容量 === 当前应用变量容器索引);
    const 后方空闲内存索引 = 空闲内存表.findIndex((内存) => 内存.起始位置 === 当前应用末尾变量容器索引 + 1);
    const 新内存 = {
      起始位置: 空闲内存表[前方空闲内存索引].起始位置,
      容量: 空闲内存表[前方空闲内存索引].容量 + 应用占用内存 + 空闲内存表[后方空闲内存索引].容量,
    };
    if (前方空闲内存索引 > 后方空闲内存索引) {
      空闲内存表.splice(前方空闲内存索引, 1);
      空闲内存表.splice(后方空闲内存索引, 1);
    } else {
      空闲内存表.splice(后方空闲内存索引, 1);
      空闲内存表.splice(前方空闲内存索引, 1);
    }
    空闲内存表.push(新内存);
  }

  for (let i = 0; i < 应用占用内存; i++) {
    当前应用变量容器.classList.remove("已占用");
    当前应用变量容器.removeAttribute("应用名称");
    当前应用变量容器.style.backgroundColor = "";
    if (i === 0) {
      const 应用抬头容器 = 当前应用变量容器.querySelector(".应用抬头容器");
      应用抬头容器.remove();
      if (前方已占用) {
        当前应用变量容器.classList.add("空闲-起始");
      }
    }
    const 本应用内存顺序 = 当前应用变量容器.querySelector(".本应用内存顺序");
    本应用内存顺序.remove();
    if (i === 应用占用内存 - 1) {
      当前应用变量容器.classList.remove("末尾");
      if (当前应用变量容器.nextElementSibling?.classList.contains("空闲-起始")) {
        当前应用变量容器.nextElementSibling.classList.remove("空闲-起始");
      }
    }
    const 字节名称与顺位 = 当前应用变量容器.querySelector(".字节名称与顺位");
    字节名称与顺位.innerHTML = "";
    const 字节地址 = 当前应用变量容器.querySelector(".字节地址");
    字节地址.innerHTML = "";
    if (i < 应用占用内存 - 1) {
      当前应用变量容器 = 当前应用变量容器.nextElementSibling;
    }
  }

  const 内存分配分区 = 内存分配区.querySelector(`.内存分配分区[程序名称="${应用名称}"]`);
  内存分配分区?.remove();
}
