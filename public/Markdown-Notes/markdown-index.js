const 知识库 = {
  Linux: {
    图标: "/Images/Page-Logos/Linux.png",
    笔记: [
      {
        标题: "apt搜索包名称",
        作者: "苏扬",
        时间: {
          年: 2025,
          月: 5,
          日: 10,
        },
      },
      {
        标题: "深色模式",
        作者: "苏扬",
        时间: {
          年: 2025,
          月: 5,
          日: 11,
        },
      },
      {
        标题: "115网盘",
        作者: "苏扬",
        时间: {
          年: 2025,
          月: 5,
          日: 12,
        },
      },
      {
        标题: "输入法",
        作者: "",
        时间: {
          年: 2025,
          月: 5,
          日: 10,
        },
      },
      {
        标题: "终端 & Shell",
        作者: "",
        时间: {
          年: 0,
          月: 0,
          日: 0,
        },
      },
      {
        标题: "Flatpak",
        作者: "",
        时间: {
          年: 0,
          月: 0,
          日: 0,
        },
      },
      {
        标题: "字体",
        作者: "",
        时间: {
          年: 0,
          月: 0,
          日: 0,
        },
      },
      {
        标题: "Linux下载GCC",
        作者: "凌子轩",
        时间: {
          年: 2025,
          月: 5,
          日: 22,
        },
      },
    ],
  },
  JetBrains: {
    图标: "/Images/Page-Logos/JetBrains.png",
    笔记: [
      {
        标题: "使用 Prettier",
        作者: "苏扬",
        时间: {
          年: 2025,
          月: 5,
          日: 27,
        },
      },
      {
        标题: "使用中文输入法",
        作者: "",
        时间: {
          年: 0,
          月: 0,
          日: 0,
        },
      },
    ],
  },
  Rust: { 图标: "/Images/Page-Logos/编程开发/Rust.png", 笔记: [] },
  Blender: { 图标: "/Images/Page-Logos/3D/Blender.png", 笔记: [] },
};

const 二级目录区 = document.querySelector(".二级目录区");
const 目录区 = document.querySelector(".目录区");
const 笔记对话框 = document.getElementById("笔记对话框");
const 笔记区 = 笔记对话框.querySelector(".笔记区");
const 笔记信息区 = 笔记对话框.querySelector(".笔记信息区");
const 笔记目录区 = 笔记对话框.querySelector(".笔记目录区");
const 关闭对话框按钮 = 笔记对话框.querySelector("#关闭对话框");
关闭对话框按钮.addEventListener("click", () => {
  笔记对话框.close();
});

for (const 键 in 知识库) {
  生成一级目录(键);
}

生成二级目录("Linux");

document.querySelector(".目录").classList.add("当前目录");

function 生成一级目录(键) {
  const 目录 = document.createElement("div");
  目录.className = "目录";
  目录区.appendChild(目录);

  const 目录链接 = document.createElement("div");
  目录链接.className = "目录链接";
  目录.appendChild(目录链接);

  const 目录标题 = document.createElement("h3");
  目录标题.className = "目录标题";
  目录标题.textContent = 键;

  const 目录Logo容器 = document.createElement("figure");
  目录Logo容器.className = "目录Logo容器";
  const 目录Logo = document.createElement("img");
  目录Logo.className = "目录Logo";
  目录Logo.src = 知识库[键].图标;
  目录Logo.alt = "目录Logo";
  目录Logo容器.appendChild(目录Logo);

  目录链接.append(目录Logo容器, 目录标题);

  目录.addEventListener("click", () => {
    二级目录区.innerHTML = "";
    const 当前目录 = 目录区.querySelector(".当前目录");
    当前目录.classList.remove("当前目录");
    目录.classList.add("当前目录");
    if (知识库[键].笔记.length === 0) {
      return;
    }
    生成二级目录(键);
  });
}

function 生成二级目录(键) {
  const 笔记对象组 = 知识库[键].笔记;
  for (const [index, 笔记对象] of 笔记对象组.entries()) {
    const 条目链接 = document.createElement("div");
    条目链接.className = "条目链接";
    二级目录区.appendChild(条目链接);
    const 条目链接旋转容器 = document.createElement("div");
    条目链接旋转容器.className = "条目链接旋转容器";
    条目链接.appendChild(条目链接旋转容器);
    const 链接序号 = document.createElement("span");
    链接序号.className = "链接序号";
    链接序号.textContent = index + 1;
    const 链接标题 = document.createElement("span");
    链接标题.className = "链接标题";
    链接标题.textContent = 笔记对象.标题;
    const 链接序号与标题 = document.createElement("div");
    链接序号与标题.className = "链接序号与标题";
    链接序号与标题.append(链接序号, 链接标题);

    const 链接作者 = document.createElement("span");
    链接作者.className = "链接作者";
    链接作者.textContent = 笔记对象.作者;
    const 链接时间 = document.createElement("span");
    链接时间.className = "链接时间";
    链接时间.textContent = `${笔记对象.时间.年}.${笔记对象.时间.月}.${笔记对象.时间.日}`;
    const 作者与时间 = document.createElement("div");
    作者与时间.className = "链接作者与时间";
    作者与时间.append(链接作者, 链接时间);
    条目链接旋转容器.append(链接序号与标题, 作者与时间);

    const 笔记文件名 = 笔记对象.标题.replaceAll(" ", "");
    条目链接.addEventListener("click", () => {
      fetch(`./${键}/${笔记文件名}/${笔记文件名}.md`)
        .then((response) => response.text())
        .then((text) => 生成笔记区内容(键, 笔记文件名, text))
        .then(() => 生成笔记目录区内容())
        .then(() => 生成作者和日期(键, 笔记文件名));
    });
  }
}

function 生成笔记区内容(技术栈, 笔记文件名, 文本) {
  笔记区.innerHTML = marked.parse(文本);
  const images = 笔记区.querySelectorAll("img");
  for (const img of images) {
    const src_split = img.src.split("Markdown-Notes");
    const src_final = `${src_split[0]}Markdown-Notes/${技术栈}/${笔记文件名}${src_split[1]}`;
    img.src = src_final;
  }
  const h2_all = 笔记区.querySelectorAll("h2");
  for (const h2 of h2_all) {
    const 前缀符号 = document.createElement("span");
    前缀符号.className = "前缀符号";
    前缀符号.innerHTML = "&#128209; ";
    h2.prepend(前缀符号);
  }
  hljs.highlightAll();
  笔记对话框.showModal();
  笔记对话框.scrollTop = 0;
}

function 生成笔记目录区内容() {
  const 笔记目录容器 = 笔记目录区.querySelector(".笔记目录容器");
  笔记目录容器.innerHTML = "";

  const 一级目录组 = 笔记区.querySelectorAll("h1");
  for (const [index_1, 一级目录] of 一级目录组.entries()) {
    一级目录.id = `目录-${index_1 + 1}`;

    const 目录分级容器 = document.createElement("div");
    目录分级容器.className = "目录分级容器";
    笔记目录容器.appendChild(目录分级容器);
    const 目录区_一级目录 = document.createElement("a");
    目录区_一级目录.href = `#${一级目录.id}`;
    目录区_一级目录.className = "一级目录";
    目录区_一级目录.innerHTML = 一级目录.innerHTML;
    目录分级容器.appendChild(目录区_一级目录);
    if (index_1 === 0) {
      目录区_一级目录.classList.add("当前目录");
    }
    目录区_一级目录.addEventListener("click", () => {
      const 当前目录 = 笔记目录容器.querySelector(".当前目录");
      当前目录?.classList.remove("当前目录");
      目录区_一级目录.classList.add("当前目录");
    });

    const 二级目录组 = 笔记区.querySelectorAll(`#${一级目录.id} ~ h2:not(#${一级目录.id} ~ h1 ~ h2)`);
    for (const [index_2, 二级目录] of 二级目录组.entries()) {
      二级目录.id = `${一级目录.id}-${index_2 + 1}`;
      const 目录区_二级目录 = document.createElement("a");
      目录区_二级目录.href = `#${二级目录.id}`;
      目录区_二级目录.className = "二级目录";
      目录区_二级目录.innerHTML = 二级目录.innerHTML;
      const 前缀符号 = 目录区_二级目录.querySelector(".前缀符号");
      前缀符号?.remove();
      目录分级容器.appendChild(目录区_二级目录);
      目录区_二级目录.addEventListener("click", () => {
        const 当前目录 = 笔记目录容器.querySelector(".当前目录");
        当前目录?.classList.remove("当前目录");
        目录区_二级目录.classList.add("当前目录");
      });
    }
  }
}

function 获取笔记作者(技术栈, 笔记文件名) {
  const 匹配笔记 = 知识库[技术栈].笔记.find((笔记) => 笔记.标题.replaceAll(" ", "") === 笔记文件名);
  return 匹配笔记.作者;
}

function 获取笔记日期(技术栈, 笔记文件名) {
  const 匹配笔记 = 知识库[技术栈].笔记.find((笔记) => 笔记.标题.replaceAll(" ", "") === 笔记文件名);
  return 匹配笔记.时间;
}

function 生成作者和日期(技术栈, 笔记文件名) {
  const 作者容器 = document.createElement("div");
  作者容器.className = "作者容器";
  const 作者 = document.createElement("a");
  作者.className = "作者";
  作者.target = "_self";
  作者.href = `/Introduction/contributors.html`;
  const 作者姓名 = 获取笔记作者(技术栈, 笔记文件名);
  作者容器.style.background = `center/contain no-repeat url("/Images/Contributors/${作者姓名}.jpg")`;
  作者.textContent = 作者姓名;
  作者容器.appendChild(作者);
  const 日期 = 获取笔记日期(技术栈, 笔记文件名);
  const 日期容器 = document.createElement("div");
  日期容器.className = "日期容器";
  const 年容器 = document.createElement("span");
  年容器.className = "年容器 日期子容器";
  年容器.textContent = 日期.年;
  const 月容器 = document.createElement("span");
  月容器.className = "月容器 日期子容器";
  月容器.textContent = 日期.月;
  const 日容器 = document.createElement("span");
  日容器.className = "日容器 日期子容器";
  日容器.textContent = 日期.日;
  日期容器.append(年容器, "年", 月容器, "月", 日容器, "日");
  const 笔记信息容器 = 笔记信息区.querySelector(".笔记信息容器");
  笔记信息容器.innerHTML = "";
  笔记信息容器.append(作者容器, 日期容器);
}
