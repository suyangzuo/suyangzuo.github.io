const 科目区 = document.querySelector(".科目区");
const 重置按钮 = document.getElementById("重置按钮");
const 科目数组 = ["语文", "数学", "英语", "物理", "化学", "生物", "地理", "政治", "历史"];
const 老师数组 = ["Leon", "Chris", "Carlos", "Eason", "Krauser", "Wesker", "Billy", "Ada", "Jill"];
const 科目背景色数组 = [
  "#FF5722",
  "#FF9800",
  "#8BC34A",
  "#009688",
  "#00BCD4",
  "#2196F3",
  "#9C27B0",
  "#E91E63",
  "#795548",
];

const 科目拖动背景色数组 = [
  "rgba(255, 87, 34, 0.6)",
  "rgba(255, 152, 0, 0.6)",
  "rgba(139, 195, 74, 0.6)",
  "rgba(0, 150, 136, 0.6)",
  "rgba(0, 188, 212, 0.6)",
  "rgba(33, 150, 243, 0.6)",
  "rgba(156, 39, 176, 0.6)",
  "rgba(233, 30, 99, 0.6)",
  "rgba(121, 85, 72, 0.6)",
];

for (let i = 0; i < 科目数组.length; i++) {
  const 科目 = document.createElement("div");
  科目.classList.add(科目数组[i], "科目");
  科目.draggable = true;
  科目.setAttribute("科目名称", 科目数组[i]);
  科目.setAttribute("科目背景", 科目背景色数组[i]);
  科目.setAttribute("单元格背景", 科目拖动背景色数组[i]);
  科目.setAttribute("老师", 老师数组[i]);

  科目.style.display = "flex";
  科目.style.flexDirection = "column";

  const 科目名称 = document.createElement("span");
  科目名称.textContent = 科目数组[i];
  科目名称.className = "科目名称";

  const 老师名称 = document.createElement("span");
  老师名称.textContent = 老师数组[i];
  老师名称.className = "老师名称";

  科目.appendChild(科目名称);
  科目.appendChild(老师名称);
  科目区.append(科目);
}

const 科目 = document.querySelectorAll(".科目");
const 表格单元格 = document.querySelectorAll("td");
let 当前被拖拽的科目名称 = "";
let 当前被拖拽的科目背景 = "";
let 当前被拖拽的科目单元格背景 = "";
let 当前被拖拽的老师 = "";

for (let i = 0; i < 表格单元格.length; i++) {
  const 单元格盒子 = document.createElement("div");
  单元格盒子.style.display = "flex";
  单元格盒子.style.flexDirection = "column";
  单元格盒子.style.padding = "0";
  单元格盒子.style.margin = "0";

  const 科目区 = document.createElement("span");
  const 老师区 = document.createElement("span");
  科目区.className = "科目名称区";
  老师区.className = "老师区";

  单元格盒子.appendChild(科目区);
  单元格盒子.appendChild(老师区);

  表格单元格[i].appendChild(单元格盒子);
}

科目.forEach((item, index) => {
  item.style.backgroundColor = 科目背景色数组[index];
});

科目.forEach((item) => {
  item.addEventListener("dragstart", (e) => {
    当前被拖拽的科目名称 = e.target.getAttribute("科目名称");
    当前被拖拽的科目背景 = e.target.getAttribute("科目背景");
    当前被拖拽的科目单元格背景 = e.target.getAttribute("单元格背景");
    当前被拖拽的老师 = e.target.getAttribute("老师");
  });
});

表格单元格.forEach((item) => {
  item.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!item.classList.contains("已经放置")) {
      item.style.backgroundColor = 当前被拖拽的科目单元格背景;
    }
  });

  item.addEventListener("dragleave", () => {
    if (!item.classList.contains("已经放置")) {
      item.style.backgroundColor = "rgba(41, 40, 40, 0.5)";
    }
  });

  item.addEventListener("drop", () => {
    const 科目名称Span = item.querySelector(".科目名称区");
    const 老师名称Span = item.querySelector(".老师区");

    科目名称Span.textContent = 当前被拖拽的科目名称;
    老师名称Span.textContent = 当前被拖拽的老师;
    item.style.backgroundColor = 当前被拖拽的科目背景;
    item.classList.add("已经放置");
  });
});

重置按钮.addEventListener("click", () => {
  const 所有单元格 = document.querySelectorAll("td");
  所有单元格.forEach((item) => {
    item.style.backgroundColor = "rgba(41, 40, 40, 0.5)";
    item.classList.remove("已经放置");
    const 科目名称区 = item.querySelector(".科目名称区");
    const 老师区 = item.querySelector(".老师区");
    if (科目名称区) {
      科目名称区.textContent = "";
    }
    if (老师区) {
      老师区.textContent = "";
    }
  });
});
