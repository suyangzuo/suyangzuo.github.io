(function () {
  "use strict";

  const STORAGE_KEY = "schedule-app-v1";

  const 科目配置 = [
    { 名称: "语文", 老师: "Leon", 背景: "#E57373", 拖动背景: "rgba(229, 115, 115, 0.55)" },
    { 名称: "数学", 老师: "Chris", 背景: "#BA68C8", 拖动背景: "rgba(186, 104, 200, 0.55)" },
    { 名称: "英语", 老师: "Carlos", 背景: "#4DD0E1", 拖动背景: "rgba(77, 208, 225, 0.55)" },
    { 名称: "物理", 老师: "Eason", 背景: "#64B5F6", 拖动背景: "rgba(100, 181, 246, 0.55)" },
    { 名称: "化学", 老师: "Krauser", 背景: "#81C784", 拖动背景: "rgba(129, 199, 132, 0.55)" },
    { 名称: "生物", 老师: "Wesker", 背景: "#FFD54F", 拖动背景: "rgba(255, 213, 79, 0.55)" },
    { 名称: "地理", 老师: "Billy", 背景: "#FFB74D", 拖动背景: "rgba(255, 183, 77, 0.55)" },
    { 名称: "政治", 老师: "Ada", 背景: "#FF8A65", 拖动背景: "rgba(255, 138, 101, 0.55)" },
    { 名称: "历史", 老师: "Jill", 背景: "#A1887F", 拖动背景: "rgba(161, 136, 127, 0.55)" },
  ];

  const 科目区 = document.querySelector(".科目区");
  const 重置按钮 = document.getElementById("重置按钮");
  const 表格单元格 = Array.from(document.querySelectorAll("td"));

  let 当前拖拽 = null;

  function 创建科目元素(配置) {
    const el = document.createElement("div");
    el.classList.add("科目", 配置.名称);
    el.draggable = true;
    el.setAttribute("科目名称", 配置.名称);
    el.setAttribute("科目背景", 配置.背景);
    el.setAttribute("单元格背景", 配置.拖动背景);
    el.setAttribute("老师", 配置.老师);
    el.style.backgroundColor = 配置.背景;

    const 名称Span = document.createElement("span");
    名称Span.className = "科目名称";
    名称Span.textContent = 配置.名称;

    const 老师Span = document.createElement("span");
    老师Span.className = "老师名称";
    老师Span.textContent = 配置.老师;

    el.appendChild(名称Span);
    el.appendChild(老师Span);

    el.addEventListener("dragstart", (e) => {
      el.classList.add("dragging");
      当前拖拽 = {
        名称: 配置.名称,
        背景: 配置.背景,
        拖动背景: 配置.拖动背景,
        老师: 配置.老师,
      };
      try {
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData("text/plain", 配置.名称);
      } catch (_) {}
    });

    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
      当前拖拽 = null;
      清除所有拖拽高亮();
    });

    return el;
  }

  function 构建单元格内容(td) {
    表格单元格.forEach((td) => {
      if (td.querySelector(".单元格盒子")) return;
      const box = document.createElement("div");
      box.className = "单元格盒子";
      box.appendChild(Object.assign(document.createElement("span"), { className: "科目名称区" }));
      box.appendChild(Object.assign(document.createElement("span"), { className: "老师区" }));
      td.appendChild(box);
    });
  }

  function 清除所有拖拽高亮() {
    表格单元格.forEach((td) => td.classList.remove("drag-over"));
  }

  function 填充单元格(td, 数据) {
    const nameEl = td.querySelector(".科目名称区");
    const teacherEl = td.querySelector(".老师区");
    if (!nameEl || !teacherEl) return;
    nameEl.textContent = 数据.名称;
    teacherEl.textContent = 数据.老师;
    td.style.backgroundColor = 数据.背景;
    td.classList.add("已经放置");
    td.classList.remove("drag-over");
  }

  function 清空单元格(td) {
    const nameEl = td.querySelector(".科目名称区");
    const teacherEl = td.querySelector(".老师区");
    if (nameEl) nameEl.textContent = "";
    if (teacherEl) teacherEl.textContent = "";
    td.style.backgroundColor = "";
    td.classList.remove("已经放置", "drag-over");
  }

  function 读取数据() {
    const 结果 = {};
    表格单元格.forEach((td, idx) => {
      if (!td.classList.contains("已经放置")) return;
      const nameEl = td.querySelector(".科目名称区");
      const teacherEl = td.querySelector(".老师区");
      if (!nameEl || !teacherEl || !nameEl.textContent) return;
      结果[idx] = {
        名称: nameEl.textContent,
        老师: teacherEl.textContent,
        背景: td.style.backgroundColor || "",
      };
    });
    return 结果;
  }

  function 保存数据() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(读取数据()));
      showToast("已保存");
    } catch (_) {}
  }

  function 加载数据() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return;
      表格单元格.forEach((td, idx) => {
        const item = data[idx];
        if (!item) return;
        const 配置 = 科目配置.find((c) => c.名称 === item.名称);
        填充单元格(td, {
          名称: item.名称,
          老师: item.老师,
          背景: 配置 ? 配置.背景 : item.背景,
        });
      });
    } catch (_) {}
  }

  function 创建Toast() {
    const toast = document.createElement("div");
    toast.className = "提示";
    document.body.appendChild(toast);
    return toast;
  }

  const toastEl = 创建Toast();
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1600);
  }

  科目配置.forEach((c) => 科目区.appendChild(创建科目元素(c)));
  构建单元格内容();

  表格单元格.forEach((td) => {
    td.addEventListener("dragover", (e) => {
      if (!当前拖拽) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      td.classList.add("drag-over");
    });

    td.addEventListener("dragleave", (e) => {
      if (!td.contains(e.relatedTarget)) {
        td.classList.remove("drag-over");
      }
    });

    td.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!当前拖拽) return;
      填充单元格(td, 当前拖拽);
      保存数据();
    });

    td.addEventListener("dblclick", () => {
      if (!td.classList.contains("已经放置")) return;
      清空单元格(td);
      保存数据();
      showToast("已清除");
    });

    td.addEventListener("contextmenu", (e) => {
      if (!td.classList.contains("已经放置")) return;
      e.preventDefault();
      清空单元格(td);
      保存数据();
      showToast("已清除");
    });
  });

  重置按钮.addEventListener("click", () => {
    表格单元格.forEach((td) => 清空单元格(td));
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    showToast("已重置");
  });

  加载数据();
})();
