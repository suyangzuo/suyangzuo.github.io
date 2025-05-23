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
        作者: "苏扬",
        时间: {
          年: 2025,
          月: 5,
          日: 10,
        },
      },
      {
        标题: "终端 & Shell",
        作者: "苏扬",
        时间: {
          年: 2025,
          月: 5,
          日: 10,
        },
      },
      {
        标题: "Flatpak",
        作者: "苏扬",
        时间: {
          年: 2025,
          月: 5,
          日: 10,
        },
      },
      {
        标题: "字体",
        作者: "苏扬",
        时间: {
          年: 2025,
          月: 5,
          日: 10,
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
  SQLite: { 图标: "/Images/Page-Logos/数据库/SQLite.png", 笔记: [] },
};

const 二级目录区 = document.querySelector(".二级目录区");
const 目录区 = document.querySelector(".目录区");
const 笔记对话框 = document.getElementById("笔记对话框");
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
    const 链接序号 = document.createElement("span");
    链接序号.className = "链接序号";
    链接序号.textContent = index + 1;
    const 链接标题 = document.createElement("span");
    链接标题.className = "链接标题";
    链接标题.textContent = 笔记对象.标题;
    条目链接.append(链接序号, 链接标题);

    const 笔记文件名 = 笔记对象.标题.replaceAll(" ", "");
    条目链接.addEventListener("click", () => {
      const 笔记区 = 笔记对话框.querySelector(".笔记区");
      fetch(`./${键}/${笔记文件名}/${笔记文件名}.md`)
        .then((response) => response.text())
        .then((text) => {
          笔记区.innerHTML = marked.parse(text);
          const images = 笔记区.querySelectorAll("img");
          for (const img of images) {
            const src_split = img.src.split("Markdown-Notes");
            const src_final = `${src_split[0]}Markdown-Notes/${键}/${笔记文件名}${src_split[1]}`;
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
        });
    });
  }
}
