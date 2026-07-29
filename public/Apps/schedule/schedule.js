(function () {
  "use strict";

  const STORAGE_KEY = "schedule-app-v1";
  const CUSTOM_KEY = "schedule-custom-subjects-v1";

  const 默认科目配置 = [
    { 名称: "语文", 老师: "Leon", 背景: "#E57373" },
    { 名称: "数学", 老师: "Chris", 背景: "#BA68C8" },
    { 名称: "英语", 老师: "Carlos", 背景: "#4DD0E1" },
    { 名称: "物理", 老师: "Eason", 背景: "#64B5F6" },
    { 名称: "化学", 老师: "Krauser", 背景: "#81C784" },
    { 名称: "生物", 老师: "Wesker", 背景: "#FFD54F" },
    { 名称: "地理", 老师: "Billy", 背景: "#FFB74D" },
    { 名称: "政治", 老师: "Ada", 背景: "#FF8A65" },
    { 名称: "历史", 老师: "Jill", 背景: "#A1887F" },
  ];

  const 预设颜色列表 = [
    "#E57373", "#BA68C8", "#4DD0E1", "#64B5F6",
    "#81C784", "#FFD54F", "#FFB74D", "#FF8A65",
    "#A1887F", "#7C5CFF", "#26C6DA", "#EF5350",
    "#66BB6A", "#EC407A", "#42A5F5", "#FFEE58",
  ];

  const 科目区 = document.querySelector(".科目区");
  const 表格单元格 = Array.from(document.querySelectorAll("td"));
  const 重置按钮 = document.getElementById("重置按钮");

  const 选项卡栏 = document.querySelector(".选项卡栏");
  const 选项卡按钮们 = document.querySelectorAll(".选项卡");
  const 面板们 = document.querySelectorAll(".面板");

  const 添加表单 = document.getElementById("添加表单");
  const 名称输入 = document.getElementById("科目名称输入");
  const 老师输入 = document.getElementById("老师输入");
  const 颜色输入 = document.getElementById("颜色输入");
  const 预设颜色容器 = document.getElementById("预设颜色");

  const 自定义列表 = document.getElementById("自定义列表");
  const 自定义计数 = document.getElementById("自定义计数");

  let 当前拖拽 = null;
  let 自定义科目列表 = [];
  let 选中颜色 = "#7c5cff";

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function 生成拖动背景(hex) {
    return hexToRgba(hex, 0.55);
  }

  function 获取全部科目配置() {
    return [...默认科目配置, ...自定义科目列表];
  }

  function 保存自定义科目() {
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(自定义科目列表));
    } catch (_) {}
  }

  function 加载自定义科目() {
    try {
      const raw = localStorage.getItem(CUSTOM_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
      return [];
    } catch (_) {
      return [];
    }
  }

  function 渲染预设颜色() {
    预设颜色容器.innerHTML = "";
    预设颜色列表.forEach((color) => {
      const span = document.createElement("span");
      span.style.backgroundColor = color;
      if (color === 选中颜色) span.classList.add("selected");
      span.addEventListener("click", () => {
        选中颜色 = color;
        颜色输入.value = color;
        渲染预设颜色();
      });
      预设颜色容器.appendChild(span);
    });
  }

  function 创建科目元素(配置) {
    const el = document.createElement("div");
    el.classList.add("科目");
    el.draggable = true;
    el.setAttribute("科目名称", 配置.名称);
    el.setAttribute("科目背景", 配置.背景);
    el.setAttribute("单元格背景", 生成拖动背景(配置.背景));
    el.setAttribute("老师", 配置.老师 || "");
    el.style.backgroundColor = 配置.背景;

    const 名称Span = document.createElement("span");
    名称Span.className = "科目名称";
    名称Span.textContent = 配置.名称;

    const 老师Span = document.createElement("span");
    老师Span.className = "老师名称";
    老师Span.textContent = 配置.老师 || "";

    el.appendChild(名称Span);
    el.appendChild(老师Span);

    el.addEventListener("dragstart", (e) => {
      el.classList.add("dragging");
      当前拖拽 = {
        名称: 配置.名称,
        背景: 配置.背景,
        拖动背景: 生成拖动背景(配置.背景),
        老师: 配置.老师 || "",
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

  function 渲染科目区() {
    科目区.innerHTML = "";
    获取全部科目配置().forEach((c) => {
      科目区.appendChild(创建科目元素(c));
    });
  }

  function 创建空状态() {
      const div = document.createElement("div");
      div.className = "空状态";
      div.innerHTML =
        '<i class="fa-solid fa-inbox"></i><p>还没有自定义科目</p><span>在上方添加你的第一个科目</span>';
      return div;
    }

    function 渲染自定义列表() {
    自定义计数.textContent = 自定义科目列表.length;

    自定义列表.innerHTML = "";

    if (自定义科目列表.length === 0) {
      自定义列表.appendChild(创建空状态());
      return;
    }

    自定义科目列表.forEach((item) => {
      const row = document.createElement("div");
      row.className = "自定义科目项";

      const 颜色预览 = document.createElement("div");
      颜色预览.className = "自定义颜色预览";
      颜色预览.style.backgroundColor = item.背景;

      const 信息 = document.createElement("div");
      信息.className = "自定义信息";

      const 名称 = document.createElement("span");
      名称.className = "自定义名称";
      名称.textContent = item.名称;

      const 老师 = document.createElement("span");
      老师.className = "自定义老师";
      老师.textContent = item.老师 || "未设置老师";

      信息.appendChild(名称);
      信息.appendChild(老师);

      const 删除按钮 = document.createElement("button");
      删除按钮.className = "自定义删除";
      删除按钮.type = "button";
      删除按钮.title = "删除此科目";
      删除按钮.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
      删除按钮.addEventListener("click", () => {
        删除自定义科目(item.名称);
      });

      row.appendChild(颜色预览);
      row.appendChild(信息);
      row.appendChild(删除按钮);
      自定义列表.appendChild(row);
    });
  }

  function 删除自定义科目(名称) {
    自定义科目列表 = 自定义科目列表.filter((s) => s.名称 !== 名称);
    保存自定义科目();
    渲染科目区();
    渲染自定义列表();
    showToast("已删除科目");
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
      const allSubjects = 获取全部科目配置();
      表格单元格.forEach((td, idx) => {
        const item = data[idx];
        if (!item) return;
        const 配置 = allSubjects.find((c) => c.名称 === item.名称);
        填充单元格(td, {
          名称: item.名称,
          老师: item.老师,
          背景: 配置 ? 配置.背景 : item.背景,
        });
      });
    } catch (_) {}
  }

  function 切换选项卡(tabName) {
    选项卡按钮们.forEach((btn) => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    面板们.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === tabName);
    });

    选项卡栏.dataset.active = tabName;
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

  选项卡按钮们.forEach((btn) => {
    btn.addEventListener("click", () => {
      切换选项卡(btn.dataset.tab);
    });
  });

  颜色输入.addEventListener("input", (e) => {
    选中颜色 = e.target.value;
    渲染预设颜色();
  });

  添加表单.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = 名称输入.value.trim();
    const teacher = 老师输入.value.trim();

    if (!name) {
      名称输入.focus();
      showToast("请输入科目名称");
      return;
    }

    if (默认科目配置.some((s) => s.名称 === name) ||
        自定义科目列表.some((s) => s.名称 === name)) {
      showToast("该科目已存在");
      return;
    }

    自定义科目列表.push({
      名称: name,
      老师: teacher,
      背景: 选中颜色,
    });

    保存自定义科目();
    渲染科目区();
    渲染自定义列表();

    名称输入.value = "";
    老师输入.value = "";
    颜色输入.value = "#7c5cff";
    选中颜色 = "#7c5cff";
    渲染预设颜色();
    名称输入.focus();

    showToast("科目已添加");
  });

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

  自定义科目列表 = 加载自定义科目();
  渲染预设颜色();
  渲染科目区();
  构建单元格内容();
  渲染自定义列表();
  加载数据();
})();