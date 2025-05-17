const 笔记区 = document.querySelector(".Markdown");
fetch("./apt查找软件包.md")
  .then((response) => response.text())
  .then((text) => {
    笔记区.innerHTML = marked.parse(text);
    hljs.highlightAll();
  });
