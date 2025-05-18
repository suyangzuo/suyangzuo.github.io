const 笔记对象 = {
  Linux: { 图标: "/Images/Page-Logos/Linux.png", 笔记: ["apt 查找软件包", "深色模式", "115网盘"] },
};

const 心得区 = document.querySelector(".心得区");
const 目录区 = document.querySelector(".目录区");
const 笔记对话框 = document.getElementById("笔记对话框");

for (const 键 in 笔记对象) {
  生成学习心得标题目录(键);
  生成学习心得目录(键);
}

function 生成学习心得标题目录(键) {
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
  目录Logo.src = 笔记对象[键].图标;
  目录Logo.alt = "目录Logo";
  目录Logo容器.appendChild(目录Logo);

  目录链接.append(目录Logo容器, 目录标题);
}

function 生成学习心得目录(键) {
  const 笔记名称组 = 笔记对象[键].笔记;
  for (const 笔记名称 of 笔记名称组) {
    const 条目链接 = document.createElement("div");
    条目链接.className = "条目链接";
    条目链接.textContent = 笔记名称;
    心得区.appendChild(条目链接);

    const 笔记文件名 = 笔记名称.replaceAll(" ", "");
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
          hljs.highlightAll();
          笔记对话框.showModal();
        });
    });
  }
}
