const 知识库 = {
  通用: {
    图标: "/Images/Markdown-Notes/知识库-01.webp",
    笔记: [
      { 标题: "包管理器", 作者: "", 时间: { 年: 0, 月: 0, 日: 0 } },
      { 标题: "常用字符的 Unicode 编码", 作者: "苏扬", 时间: { 年: 2025, 月: 8, 日: 22 } },
      { 标题: "clangd配置", 作者: "凌子轩", 时间: { 年: 2025, 月: 12, 日: 21 } },
      { 标题: "自定义 FireFox 开发者工具字体", 作者: "苏扬", 时间: { 年: 2026, 月: 1, 日: 17 } },
    ],
  },
  Linux: {
    图标: "/Images/Page-Logos/Linux.png",
    笔记: [
      { 标题: "文件权限", 作者: "苏扬", 时间: { 年: 2025, 月: 6, 日: 20 } },
      { 标题: "路径命令", 作者: "苏扬", 时间: { 年: 2026, 月: 8, 日: 31 } },
      { 标题: "文件处理命令", 作者: "苏扬", 时间: { 年: 2026, 月: 8, 日: 31 } },
      { 标题: "用户和组", 作者: "苏扬", 时间: { 年: 2026, 月: 9, 日: 23 } },
      { 标题: "打包-压缩-解包", 作者: "苏扬", 时间: { 年: 2026, 月: 9, 日: 26 } },
      { 标题: "进程监测命令", 作者: "苏扬", 时间: { 年: 2026, 月: 9, 日: 3 } },
      { 标题: "系统监测命令", 作者: "苏扬", 时间: { 年: 2026, 月: 9, 日: 11 } },
      { 标题: "查找文件", 作者: "苏扬", 时间: { 年: 2026, 月: 10, 日: 2 } },
      { 标题: "apt搜索包名称", 作者: "苏扬", 时间: { 年: 2025, 月: 5, 日: 10 } },
      { 标题: "深色模式", 作者: "苏扬", 时间: { 年: 2025, 月: 5, 日: 11 } },
      { 标题: "Fcitx 输入法", 作者: "苏扬", 时间: { 年: 2026, 月: 9, 日: 29 } },
      { 标题: "字体", 作者: "凌子轩", 时间: { 年: 2026, 月: 9, 日: 19 } },
      { 标题: "使用 GCC", 作者: "凌子轩", 时间: { 年: 2025, 月: 5, 日: 22 } },
      { 标题: "鼠标指针", 作者: "凌子轩", 时间: { 年: 2025, 月: 6, 日: 30 } },
      { 标题: "Samba", 作者: "凌子轩", 时间: { 年: 2025, 月: 7, 日: 17 } },
      { 标题: "截图与录屏", 作者: "", 时间: { 年: 0, 月: 0, 日: 0 } },
      { 标题: "开启BBR", 作者: "杜宗远", 时间: { 年: 2025, 月: 9, 日: 12 } },
      { 标题: "Vim 编辑器", 作者: "杜宗远", 时间: { 年: 2025, 月: 11, 日: 9 } },
    ],
  },
  JetBrains: {
    图标: "/Images/Page-Logos/JetBrains.png",
    笔记: [
      { 标题: "使用 Prettier", 作者: "苏扬", 时间: { 年: 2025, 月: 5, 日: 27 } },
      { 标题: "使用 Fcitx 输入法框架", 作者: "苏扬", 时间: { 年: 2025, 月: 6, 日: 18 } },
    ],
  },
  Blender: { 图标: "/Images/Page-Logos/3D/Blender.png", 笔记: [] },
  Kdenlive: {
    图标: "/Images/SVG/Kdenlive.svg",
    笔记: [{ 标题: "快捷键", 作者: "", 时间: { 年: 0, 月: 0, 日: 0 } }],
  },
};

const 二级目录区 = document.querySelector(".二级目录区");
const 目录区 = document.querySelector(".目录区");
const 目录总区 = document.querySelector(".目录总区");
const 笔记对话框 = document.getElementById("笔记对话框");
const 笔记区 = 笔记对话框.querySelector(".笔记区");
const 笔记信息区 = 笔记对话框.querySelector(".笔记信息区");
const 笔记目录区 = 笔记对话框.querySelector(".笔记目录区");
const 关闭对话框按钮 = 笔记对话框.querySelector("#关闭对话框");
const 笔记区目录组 = [];
const 笔记目录区标题组 = [];
let 当前选中目录 = null;

// 分组状态按视图独立记录：技术栈视图与作者视图互不影响
const 技术栈分组状态存储键 = "技术栈视图分组状态";
const 作者分组状态存储键 = "作者视图分组状态";
// 一级目录分组方式：技术栈 或 作者
const 一级目录分组方式存储键 = "一级目录分组方式";
// 各视图下当前选中的一级目录（独立记录，切换视图时恢复）
const 技术栈当前目录存储键 = "技术栈视图当前目录";
const 作者当前目录存储键 = "作者视图当前目录";

// 兼容旧的共享存储键：若视图专属键无记录，则从旧键迁移一次
function 迁移旧分组状态(存储键) {
  const 旧值 = localStorage.getItem("二级目录分组状态");
  if (旧值 !== null) {
    localStorage.setItem(存储键, 旧值);
    localStorage.removeItem("二级目录分组状态");
  }
}

function 获取分组状态() {
  const 视图 = 获取一级目录分组方式();
  const 存储键 = 视图 === "作者" ? 作者分组状态存储键 : 技术栈分组状态存储键;
  const 值 = localStorage.getItem(存储键);
  if (值 === null) {
    迁移旧分组状态(存储键);
    return localStorage.getItem(存储键) === "true";
  }
  return 值 === "true";
}

function 设置分组状态(状态) {
  const 视图 = 获取一级目录分组方式();
  const 存储键 = 视图 === "作者" ? 作者分组状态存储键 : 技术栈分组状态存储键;
  localStorage.setItem(存储键, 状态 ? "true" : "false");
}

function 获取一级目录分组方式() {
  return localStorage.getItem(一级目录分组方式存储键) || "技术栈";
}

function 设置一级目录分组方式(方式) {
  localStorage.setItem(一级目录分组方式存储键, 方式);
}

function 获取视图当前目录(视图) {
  return localStorage.getItem(视图 === "作者" ? 作者当前目录存储键 : 技术栈当前目录存储键);
}

function 设置视图当前目录(视图, 目录名) {
  localStorage.setItem(视图 === "作者" ? 作者当前目录存储键 : 技术栈当前目录存储键, 目录名);
}

// 添加 URL 处理函数
function 更新URL(技术栈, 笔记文件名, { shouldPush = true } = {}) {
  if (!shouldPush) return;
  const url = new URL(window.location.href);
  url.searchParams.set("技术栈", 技术栈);
  if (笔记文件名) {
    url.searchParams.set("笔记", 笔记文件名);
  } else {
    url.searchParams.delete("笔记");
  }
  window.history.pushState({}, "", url);
}

function 清除URL参数({ shouldPush = true } = {}) {
  if (!shouldPush) return;
  const url = new URL(window.location.href);
  url.searchParams.delete("技术栈");
  url.searchParams.delete("笔记");
  window.history.pushState({}, "", url);
}

function 从URL获取笔记信息() {
  const url = new URL(window.location.href);
  const 技术栈 = url.searchParams.get("技术栈");
  const 笔记 = url.searchParams.get("笔记");
  return { 技术栈, 笔记 };
}

function 标准化技术栈名称(名称) {
  if (!名称) return null;
  const 技术栈键组 = Object.keys(知识库);
  const 匹配键 = 技术栈键组.find((键) => 键.toLowerCase() === 名称.toLowerCase());
  return 匹配键 || null;
}

function 关闭笔记对话框({ 更新历史 = true } = {}) {
  // 如果图片对话框是打开的，先关闭图片对话框
  if (图片对话框 && 图片对话框.open) {
    关闭图片对话框();
  }

  if (笔记对话框.open) {
    笔记对话框.close();
  }

  // 清除URL中的锚点（#及其后面的部分）
  history.replaceState(null, "", window.location.pathname + window.location.search);

  // 获取当前目录，只保留一级目录参数
  const 笔记状态 = JSON.parse(localStorage.getItem("笔记状态") || "null");
  if (更新历史) {
    if (笔记状态?.当前目录) {
      更新URL(笔记状态.当前目录, null); // 只设置技术栈，不设置笔记
    } else {
      清除URL参数();
    }
  }

  // 清除所有高亮状态
  const 所有高亮目录 = 笔记目录区.querySelectorAll(".当前目录");
  所有高亮目录.forEach((目录) => 目录.classList.remove("当前目录"));

  // 重置所有状态
  当前高亮索引 = -1;
  点击目标索引 = -1;
  点击目标时间戳 = 0;

  // 恢复页面标题为技术栈
  if (笔记状态?.当前目录) {
    document.title = `知识库 - ${笔记状态.当前目录}`;
  } else {
    document.title = "知识库";
  }
}

// 修改关闭对话框按钮的事件处理
关闭对话框按钮.addEventListener("click", () => {
  关闭笔记对话框();
});

// 添加页面加载时的状态恢复
document.addEventListener("DOMContentLoaded", () => {
  const URL参数 = 从URL获取笔记信息();
  const 笔记状态 = JSON.parse(localStorage.getItem("笔记状态") || "null");
  const 一级目录方式 = 获取一级目录分组方式();

  // 根据一级目录方式生成目录
  生成一级目录();

  // 创建切换一级目录分组方式按钮
  创建切换一级目录按钮();

  let 目标目录 = null;
  if (一级目录方式 === "作者") {
    // 作者视图：优先从作者视图专属存储恢复，其次兼容旧笔记状态，最后第一个作者
    let 记录的作者 = 获取视图当前目录("作者") || 笔记状态?.当前目录;
    if (记录的作者 && !Array.from(目录区.children).some((目录元素) => 目录元素.dataset?.作者 === 记录的作者)) {
      记录的作者 = null;
    }
    if (记录的作者) {
      目标目录 = 记录的作者;
    } else {
      const 第一个作者 = 目录区.querySelector("[data-作者]");
      目标目录 = 第一个作者?.dataset.作者;
    }
    if (目标目录) 切换作者目录(目标目录);
  } else {
    // 技术栈视图：URL 参数优先，其次视图专属存储，最后默认第一个
    if (URL参数.技术栈) {
      const 匹配目录 = 标准化技术栈名称(URL参数.技术栈);
      if (匹配目录) {
        目标目录 = 匹配目录;
      } else {
        const 记录的技术栈 = 获取视图当前目录("技术栈") || 笔记状态?.当前目录;
        if (记录的技术栈 && 知识库[标准化技术栈名称(记录的技术栈) || 记录的技术栈]) {
          console.warn(`未找到匹配的技术栈: ${URL参数.技术栈}`);
          目标目录 = 记录的技术栈;
        } else {
          目标目录 = Object.keys(知识库)[0];
        }
      }
    } else {
      const 记录的技术栈 = 获取视图当前目录("技术栈") || 笔记状态?.当前目录;
      if (记录的技术栈 && 知识库[标准化技术栈名称(记录的技术栈) || 记录的技术栈]) {
        目标目录 = 记录的技术栈;
      } else {
        目标目录 = Object.keys(知识库)[0];
      }
    }
    切换目录(目标目录, { 更新历史: false });
  }

  // 技术栈视图下才处理 URL 笔记参数与历史记录；作者视图跳过（笔记 URL 基于技术栈）
  if (一级目录方式 !== "作者") {
    const 目录数据 = 知识库[目标目录];
    const 要打开的笔记 =
      URL参数.技术栈 && URL参数.笔记 && 目录数据?.笔记.some((笔记) => 笔记.标题.replaceAll(" ", "") === URL参数.笔记)
        ? URL参数.笔记
        : null;

    if (要打开的笔记) {
      加载并展示笔记(目标目录, 要打开的笔记, { 更新历史: false }).catch(() => {
        if (笔记对话框.open) {
          关闭笔记对话框({ 更新历史: false });
        }
      });
    } else if (!URL参数.技术栈) {
      更新URL(目标目录, null);
    } else if (URL参数.技术栈 && !URL参数.笔记) {
      const 标准URL技术栈 = 标准化技术栈名称(URL参数.技术栈);
      if (标准URL技术栈 !== 目标目录) {
        更新URL(目标目录, null);
      }
    }

    const 新笔记状态 = 笔记状态 || {};
    新笔记状态.当前目录 = 目标目录;
    localStorage.setItem("笔记状态", JSON.stringify(新笔记状态));
  }

  window.addEventListener("popstate", 处理浏览器历史导航);
});

function 生成一级目录() {
  目录区.innerHTML = "";
  const 一级目录方式 = 获取一级目录分组方式();

  if (一级目录方式 === "作者") {
    // 收集所有作者
    const 作者组 = new Set();
    for (const 技术栈数据 of Object.values(知识库)) {
      for (const 笔记对象 of 技术栈数据.笔记) {
        if (笔记对象.作者) 作者组.add(笔记对象.作者);
      }
    }
    // 按作者名排序生成一级目录
    const 排序作者组 = Array.from(作者组).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
    for (const 作者 of 排序作者组) {
      生成作者一级目录(作者);
    }
  } else {
    // 按技术栈生成一级目录
    const 技术栈列表 = Object.keys(知识库);
    for (const 键 of 技术栈列表) {
      生成技术栈一级目录(键);
    }
  }
}

function 生成技术栈一级目录(键) {
  const 目录 = document.createElement("div");
  目录.className = "目录";
  目录.dataset.技术栈 = 键;
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

  // 文章数量：该技术栈包含的总文章数量
  const 文章数量 = document.createElement("span");
  文章数量.className = "文章数量";
  const 文章数量数字 = document.createElement("span");
  文章数量数字.className = "文章数量数字";
  文章数量数字.textContent = 知识库[键].笔记.length;
  文章数量.append(文章数量数字);
  目录.appendChild(文章数量);

  目录.addEventListener("click", () => {
    切换目录(键);
  });
}

function 生成作者一级目录(作者) {
  const 目录 = document.createElement("div");
  目录.className = "目录";
  目录.dataset.作者 = 作者;
  目录区.appendChild(目录);

  const 目录链接 = document.createElement("div");
  目录链接.className = "目录链接";
  目录.appendChild(目录链接);

  const 目录标题 = document.createElement("h3");
  目录标题.className = "目录标题";
  目录标题.textContent = 作者;

  const 目录Logo容器 = document.createElement("figure");
  目录Logo容器.className = "目录Logo容器";
  const 目录Logo = document.createElement("img");
  目录Logo.className = "目录Logo";
  目录Logo.src = `/Images/Contributors/${作者}.jpg`;
  目录Logo.alt = "作者头像";
  目录Logo容器.appendChild(目录Logo);

  目录链接.append(目录Logo容器, 目录标题);

  // 文章数量：该作者包含的总文章数量（跨所有技术栈统计）
  let 作者文章数 = 0;
  for (const 技术栈数据 of Object.values(知识库)) {
    for (const 笔记对象 of 技术栈数据.笔记) {
      if (笔记对象.作者 === 作者) 作者文章数++;
    }
  }
  const 文章数量 = document.createElement("span");
  文章数量.className = "文章数量";
  const 文章数量数字 = document.createElement("span");
  文章数量数字.className = "文章数量数字";
  文章数量数字.textContent = 作者文章数;
  文章数量.append(文章数量数字);
  目录.appendChild(文章数量);

  目录.addEventListener("click", () => {
    切换作者目录(作者);
  });
}

function 切换目录(键, { 更新历史 = true } = {}) {
  const 标准键 = 标准化技术栈名称(键) || 键;
  if (!知识库[标准键]) return;

  当前选中目录 = 标准键;

  // 清空二级目录
  二级目录区.innerHTML = "";
  二级目录区.classList.remove("作者视图");

  // 更新一级目录的高亮状态
  const 当前目录 = 目录区.querySelector(".当前目录");
  if (当前目录) {
    当前目录.classList.remove("当前目录");
  }

  const 目标目录元素 =
    Array.from(目录区.children).find((目录元素) => 目录元素.dataset?.技术栈 === 标准键) ||
    Array.from(目录区.children).find((目录元素) => 目录元素.querySelector(".目录标题")?.textContent === 标准键);

  if (目标目录元素) {
    目标目录元素.classList.add("当前目录");
  }

  // 保存当前目录状态（技术栈视图）
  const 笔记状态 = JSON.parse(localStorage.getItem("笔记状态") || "null") || {};
  笔记状态.当前目录 = 标准键;
  localStorage.setItem("笔记状态", JSON.stringify(笔记状态));
  设置视图当前目录("技术栈", 标准键);

  if (更新历史) {
    更新URL(标准键, null);
  }

  if (知识库[标准键].笔记.length > 0) {
    生成二级目录(标准键);
  }

  更新分组按钮();

  document.title = `知识库 - ${标准键}`;
}

function 切换作者目录(作者) {
  当前选中目录 = 作者;
  二级目录区.innerHTML = "";
  二级目录区.classList.add("作者视图");

  // 更新一级目录的高亮状态
  const 当前目录 = 目录区.querySelector(".当前目录");
  if (当前目录) {
    当前目录.classList.remove("当前目录");
  }

  const 目标目录元素 = Array.from(目录区.children).find((目录元素) => 目录元素.dataset?.作者 === 作者);
  if (目标目录元素) {
    目标目录元素.classList.add("当前目录");
  }

  // 保存当前目录状态（作者视图）
  const 笔记状态 = JSON.parse(localStorage.getItem("笔记状态") || "null") || {};
  笔记状态.当前目录 = 作者;
  localStorage.setItem("笔记状态", JSON.stringify(笔记状态));
  设置视图当前目录("作者", 作者);

  // 收集该作者的所有笔记
  const 作者笔记组 = [];
  for (const [技术栈名, 技术栈数据] of Object.entries(知识库)) {
    for (const 笔记对象 of 技术栈数据.笔记) {
      if (笔记对象.作者 === 作者) {
        作者笔记组.push({ ...笔记对象, 所属技术栈: 技术栈名 });
      }
    }
  }

  // 根据分组状态决定显示方式
  if (获取分组状态()) {
    // 按技术栈分组
    按技术栈分组作者笔记(作者笔记组);
  } else {
    // 平铺显示，生成二级目录，显示技术栈
    for (const [index, 笔记对象] of 作者笔记组.entries()) {
      const 条目链接 = 创建条目链接(笔记对象.所属技术栈, 笔记对象, index, true);
      二级目录区.appendChild(条目链接);
    }
  }

  更新分组按钮();

  document.title = `知识库 - ${作者}`;
}

// 按技术栈分组显示作者的笔记
function 按技术栈分组作者笔记(作者笔记组) {
  // 按技术栈分组
  const 分组表 = new Map();

  for (const 笔记对象 of 作者笔记组) {
    const 技术栈名 = 笔记对象.所属技术栈;
    if (!分组表.has(技术栈名)) 分组表.set(技术栈名, []);
    分组表.get(技术栈名).push(笔记对象);
  }

  // 技术栈分组按名称排序
  const 排序技术栈组 = Array.from(分组表.keys()).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

  // 渲染所有技术栈分组
  for (const 技术栈名 of 排序技术栈组) {
    const 笔记列表 = 分组表.get(技术栈名);
    const 分组容器 = document.createElement("div");
    分组容器.className = "作者分组容器";

    const 分组标题 = document.createElement("div");
    分组标题.className = "作者分组标题";
    const 技术栈图标 = document.createElement("img");
    技术栈图标.className = "作者分组头像";
    技术栈图标.src = 知识库[技术栈名]?.图标 || "/Images/Contributors/Mystery_Men.jpg";
    技术栈图标.alt = 技术栈名;
    const 技术栈名称 = document.createElement("span");
    技术栈名称.className = "作者分组名称";
    技术栈名称.textContent = 技术栈名;
    const 条目计数 = document.createElement("span");
    条目计数.className = "作者分组计数";
    const 条目计数数字 = document.createElement("span");
    条目计数数字.className = "作者分组计数数字";
    条目计数数字.textContent = 笔记列表.length;
    条目计数.append(条目计数数字, "篇");
    分组标题.append(技术栈图标, 技术栈名称, 条目计数);
    分组容器.appendChild(分组标题);

    const 条目容器 = document.createElement("div");
    条目容器.className = "作者分组条目容器";
    笔记列表.forEach((笔记对象, 索引) => {
      const 条目链接 = 创建条目链接(技术栈名, 笔记对象, 索引, true);
      条目容器.appendChild(条目链接);
    });
    分组容器.appendChild(条目容器);
    二级目录区.appendChild(分组容器);
  }
}

function 生成二级目录(键) {
  当前选中目录 = 键;
  const 笔记对象组 = 知识库[键].笔记;

  if (获取分组状态()) {
    生成分组视图(键, 笔记对象组);
  } else {
    生成平铺视图(键, 笔记对象组);
  }
}

function 生成平铺视图(键, 笔记对象组) {
  for (const [index, 笔记对象] of 笔记对象组.entries()) {
    const 条目链接 = 创建条目链接(键, 笔记对象, index);
    二级目录区.appendChild(条目链接);
  }
}

function 生成分组视图(键, 笔记对象组) {
  // 一级目录为技术栈时，二级目录按作者分组
  按作者分组(键, 笔记对象组);
}

function 按作者分组(键, 笔记对象组) {
  // 按作者分组，作者为空的放到最后一组
  const 分组表 = new Map();
  const 空作者组 = [];

  for (const 笔记对象 of 笔记对象组) {
    const 作者 = 笔记对象.作者 || "";
    if (!作者) {
      空作者组.push(笔记对象);
    } else {
      if (!分组表.has(作者)) 分组表.set(作者, []);
      分组表.get(作者).push(笔记对象);
    }
  }

  // 作者分组按作者名排序
  const 排序作者组 = Array.from(分组表.keys()).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

  let 全局序号 = 0;

  // 渲染有作者的分组
  for (const 作者 of 排序作者组) {
    const 分组容器 = document.createElement("div");
    分组容器.className = "作者分组容器";

    const 分组标题 = document.createElement("div");
    分组标题.className = "作者分组标题";
    const 作者头像 = document.createElement("img");
    作者头像.className = "作者分组头像";
    作者头像.src = `/Images/Contributors/${作者}.jpg`;
    作者头像.alt = 作者;
    const 作者名称 = document.createElement("span");
    作者名称.className = "作者分组名称";
    作者名称.textContent = 作者;
    const 条目计数 = document.createElement("span");
    条目计数.className = "作者分组计数";
    const 条目计数数字 = document.createElement("span");
    条目计数数字.className = "作者分组计数数字";
    条目计数数字.textContent = 分组表.get(作者).length;
    条目计数.append(条目计数数字, "篇");
    分组标题.append(作者头像, 作者名称, 条目计数);
    分组容器.appendChild(分组标题);

    const 条目容器 = document.createElement("div");
    条目容器.className = "作者分组条目容器";
    分组表.get(作者).forEach((笔记对象, 索引) => {
      const 条目链接 = 创建条目链接(键, 笔记对象, 索引);
      条目容器.appendChild(条目链接);
    });
    分组容器.appendChild(条目容器);
    二级目录区.appendChild(分组容器);
  }

  // 空作者放到最后一组
  if (空作者组.length > 0) {
    const 分组容器 = document.createElement("div");
    分组容器.className = "作者分组容器";

    const 分组标题 = document.createElement("div");
    分组标题.className = "作者分组标题";
    const 作者头像 = document.createElement("img");
    作者头像.className = "作者分组头像";
    作者头像.src = "/Images/Contributors/Mystery_Men.jpg";
    作者头像.alt = "匿名";
    const 作者名称 = document.createElement("span");
    作者名称.className = "作者分组名称";
    作者名称.textContent = "未完成";
    const 条目计数 = document.createElement("span");
    条目计数.className = "作者分组计数";
    const 条目计数数字 = document.createElement("span");
    条目计数数字.className = "作者分组计数数字";
    条目计数数字.textContent = 空作者组.length;
    条目计数.append(条目计数数字, "篇");
    分组标题.append(作者头像, 作者名称, 条目计数);
    分组容器.appendChild(分组标题);

    const 条目容器 = document.createElement("div");
    条目容器.className = "作者分组条目容器";
    空作者组.forEach((笔记对象, 索引) => {
      const 条目链接 = 创建条目链接(键, 笔记对象, 索引);
      条目容器.appendChild(条目链接);
    });
    分组容器.appendChild(条目容器);
    二级目录区.appendChild(分组容器);
  }
}

function 创建条目链接(键, 笔记对象, 序号, 显示技术栈 = false) {
  const 条目链接 = document.createElement("div");
  条目链接.className = "条目链接";
  // 日期为 0年0月0日 表示笔记未完成，标记未完成样式（CSS 控制亮度）
  if (!笔记对象.时间.年 && !笔记对象.时间.月 && !笔记对象.时间.日) {
    条目链接.classList.add("未完成");
  }
  const 条目链接旋转容器 = document.createElement("div");
  条目链接旋转容器.className = "条目链接旋转容器";
  条目链接.appendChild(条目链接旋转容器);
  const 链接序号 = document.createElement("span");
  链接序号.className = "链接序号";
  链接序号.textContent = 序号 + 1;
  const 链接标题 = document.createElement("span");
  链接标题.className = "链接标题";
  链接标题.textContent = 笔记对象.标题;
  const 链接序号与标题 = document.createElement("div");
  链接序号与标题.className = "链接序号与标题";
  链接序号与标题.append(链接序号, 链接标题);

  const 链接作者与照片 = document.createElement("div");
  链接作者与照片.className = "链接作者与照片";
  const 链接作者 = document.createElement("span");
  链接作者.className = "链接作者";
  const 链接作者照片 = document.createElement("img");
  链接作者照片.className = "链接作者照片";

  // 根据参数决定显示作者还是技术栈
  if (显示技术栈) {
    // 显示技术栈
    const 所属技术栈 = 笔记对象.所属技术栈 || 键;
    链接作者.textContent = 所属技术栈;
    链接作者照片.src = 知识库[所属技术栈]?.图标 || "/Images/Contributors/Mystery_Men.jpg";
    链接作者照片.alt = "技术栈图标";
  } else {
    // 显示作者
    链接作者.textContent = 笔记对象.作者;
    链接作者照片.src = 笔记对象.作者
      ? `/Images/Contributors/${笔记对象.作者}.jpg`
      : "/Images/Contributors/Mystery_Men.jpg";
    链接作者照片.alt = "链接作者照片";
  }

  链接作者与照片.append(链接作者照片, 链接作者);
  const 链接时间 = document.createElement("span");
  链接时间.className = "链接时间";
  链接时间.textContent = `${笔记对象.时间.年}.${笔记对象.时间.月}.${笔记对象.时间.日}`;
  const 作者与时间 = document.createElement("div");
  作者与时间.className = "链接作者与时间";
  作者与时间.append(链接作者与照片, 链接时间);
  条目链接旋转容器.append(链接序号与标题, 作者与时间);

  const 笔记文件名 = 笔记对象.标题.replaceAll(" ", "");
  条目链接.dataset.技术栈 = 键;
  条目链接.dataset.笔记文件名 = 笔记文件名;
  条目链接.addEventListener("click", () => {
    加载并展示笔记(键, 笔记文件名);
  });
  return 条目链接;
}

function 更新分组按钮() {
  // 获取或创建按钮容器（放在二级目录区之后）
  let 按钮容器 = document.querySelector(".按钮容器");
  if (!按钮容器) {
    按钮容器 = document.createElement("div");
    按钮容器.className = "按钮容器";
    二级目录区.after(按钮容器);
  }

  // 移除旧分组按钮
  const 旧按钮 = 按钮容器.querySelector(".分组切换按钮");
  if (旧按钮) 旧按钮.remove();

  // 只在有笔记的目录显示按钮
  if (!当前选中目录) return;

  const 一级目录方式 = 获取一级目录分组方式();
  let 有笔记 = false;

  if (一级目录方式 === "作者") {
    // 检查选中作者是否有笔记
    for (const 技术栈数据 of Object.values(知识库)) {
      if (技术栈数据.笔记.some((笔记) => 笔记.作者 === 当前选中目录)) {
        有笔记 = true;
        break;
      }
    }
  } else {
    // 检查选中的技术栈是否有笔记
    有笔记 = 知识库[当前选中目录]?.笔记.length > 0;
  }

  if (!有笔记) return;

  const 按钮 = document.createElement("button");
  按钮.className = "分组切换按钮";
  const 已分组 = 获取分组状态();

  // 根据一级目录方式决定分组按钮文本
  // 一级目录为技术栈时，按作者分组；一级目录为作者时，按技术栈分组
  if (一级目录方式 === "作者") {
    按钮.textContent = "按技术栈分组";
  } else {
    按钮.textContent = "按作者分组";
  }

  const 勾选标记 = document.createElement("img");
  勾选标记.className = "分组勾选标记";
  勾选标记.src = 已分组 ? "/Images/Markdown-Notes/Check.png" : "/Images/Markdown-Notes/Uncheck.svg";
  勾选标记.alt = 已分组 ? "已勾选" : "未勾选";
  按钮.appendChild(勾选标记);

  // 点击切换分组状态
  按钮.addEventListener("click", () => {
    const 新状态 = !获取分组状态();
    设置分组状态(新状态);

    // 清空并重新生成二级目录
    二级目录区.innerHTML = "";
    if (一级目录方式 === "作者") {
      切换作者目录(当前选中目录);
    } else {
      生成二级目录(当前选中目录);
    }
    更新分组按钮();
  });

  // 分组按钮放在视图按钮之后（容器内第二个位置）
  const 视图按钮 = 按钮容器.querySelector(".切换一级目录按钮");
  if (视图按钮) {
    视图按钮.after(按钮);
  } else {
    按钮容器.appendChild(按钮);
  }
}

// 切换一级目录分组方式（技术栈 ↔ 作者）
// 调用前需已通过 设置一级目录分组方式 写入新方式
function 切换一级目录分组方式() {
  const 新方式 = 获取一级目录分组方式();

  // 记录切换前的当前目录，作为新视图无记录时的映射后备
  const 之前的目录 = 当前选中目录;

  // 重新生成一级目录
  生成一级目录();

  // 清空二级目录
  二级目录区.innerHTML = "";

  // 更新切换按钮文本
  更新切换一级目录按钮();

  // 优先恢复该视图自己上次选择的目录；无记录时从旧视图映射；最后才用第一个
  if (新方式 === "作者") {
    let 目标作者 = 获取视图当前目录("作者");
    // 校验该作者仍存在
    if (目标作者 && !Array.from(目录区.children).some((目录元素) => 目录元素.dataset?.作者 === 目标作者)) {
      目标作者 = null;
    }
    // 从旧技术栈映射：该技术栈下第一个有作者的笔记的作者
    if (!目标作者 && 之前的目录 && 知识库[之前的目录]) {
      const 首个有作者的笔记 = 知识库[之前的目录].笔记.find((笔记) => 笔记.作者);
      if (首个有作者的笔记) 目标作者 = 首个有作者的笔记.作者;
    }
    if (!目标作者) {
      const 第一个作者 = 目录区.querySelector("[data-作者]");
      目标作者 = 第一个作者?.dataset.作者;
    }
    if (目标作者) 切换作者目录(目标作者);
  } else {
    let 目标技术栈 = 获取视图当前目录("技术栈");
    // 校验该技术栈仍存在且有笔记
    if (目标技术栈 && !知识库[目标技术栈]) {
      目标技术栈 = null;
    }
    // 从旧作者映射：该作者第一个笔记所属的技术栈
    if (!目标技术栈 && 之前的目录) {
      for (const [技术栈名, 技术栈数据] of Object.entries(知识库)) {
        if (技术栈数据.笔记.some((笔记) => 笔记.作者 === 之前的目录)) {
          目标技术栈 = 技术栈名;
          break;
        }
      }
    }
    if (!目标技术栈) 目标技术栈 = Object.keys(知识库)[0];
    切换目录(目标技术栈);
  }
}

// 更新切换一级目录按钮（同步 radio 选中状态）
function 更新切换一级目录按钮() {
  const 容器 = document.querySelector(".切换一级目录按钮");
  if (!容器) return;

  const 当前方式 = 获取一级目录分组方式();
  const 技术栈Radio = 容器.querySelector('input[value="技术栈"]');
  const 作者Radio = 容器.querySelector('input[value="作者"]');
  if (技术栈Radio) 技术栈Radio.checked = 当前方式 === "技术栈";
  if (作者Radio) 作者Radio.checked = 当前方式 === "作者";
}

// 创建切换一级目录按钮（双 radio 切换器）
function 创建切换一级目录按钮() {
  // 获取或创建按钮容器（放在二级目录区之后）
  let 按钮容器 = document.querySelector(".按钮容器");
  if (!按钮容器) {
    按钮容器 = document.createElement("div");
    按钮容器.className = "按钮容器";
    二级目录区.after(按钮容器);
  }

  // 移除旧按钮
  const 旧按钮 = 按钮容器.querySelector(".切换一级目录按钮");
  if (旧按钮) 旧按钮.remove();

  const 当前方式 = 获取一级目录分组方式();

  // 创建双 radio 切换器容器
  const 切换器 = document.createElement("div");
  切换器.className = "切换一级目录按钮";

  // 视图标题
  const 视图标题 = document.createElement("span");
  视图标题.className = "视图标题";
  视图标题.textContent = "视图";

  const 视图图标 = document.createElement("img");
  视图图标.className = "视图图标";
  视图图标.src = "/Images/Markdown-Notes/view.svg";
  视图标题.appendChild(视图图标);

  // 视图选项包装器（与技术栈、作者选项并列）
  const 视图选项包装器 = document.createElement("div");
  视图选项包装器.className = "视图选项包装器";

  // 技术栈选项
  const 技术栈标签 = document.createElement("label");
  技术栈标签.className = "视图选项";
  技术栈标签.style.flex = "3";
  const 技术栈Radio = document.createElement("input");
  技术栈Radio.type = "radio";
  技术栈Radio.name = "一级目录视图";
  技术栈Radio.value = "技术栈";
  技术栈Radio.checked = 当前方式 === "技术栈";
  const 技术栈文本 = document.createElement("span");
  技术栈文本.className = "视图选项文本";
  技术栈文本.textContent = "技术栈";
  技术栈标签.append(技术栈Radio, 技术栈文本);

  // 作者选项
  const 作者标签 = document.createElement("label");
  作者标签.className = "视图选项";
  作者标签.style.flex = "2";
  const 作者Radio = document.createElement("input");
  作者Radio.type = "radio";
  作者Radio.name = "一级目录视图";
  作者Radio.value = "作者";
  作者Radio.checked = 当前方式 === "作者";
  const 作者文本 = document.createElement("span");
  作者文本.className = "视图选项文本";
  作者文本.textContent = "作者";
  作者标签.append(作者Radio, 作者文本);

  // 切换时：先更新 localStorage 方式，再执行视图切换（切换函数会重新生成目录并同步 radio 状态）
  const 处理切换 = (event) => {
    const 新方式 = event.target.value;
    if (新方式 === 获取一级目录分组方式()) return;
    设置一级目录分组方式(新方式);
    切换一级目录分组方式();
  };

  技术栈Radio.addEventListener("change", 处理切换);
  作者Radio.addEventListener("change", 处理切换);

  视图选项包装器.append(技术栈标签, 作者标签);
  切换器.append(视图标题, 视图选项包装器);

  // 视图按钮放在容器内第一个位置
  按钮容器.prepend(切换器);
}

function 加载并展示笔记(技术栈, 笔记文件名, { 更新历史 = true } = {}) {
  const 标准技术栈 = 标准化技术栈名称(技术栈) || 技术栈;
  const 路径 = `./${标准技术栈}/${笔记文件名}/${笔记文件名}.md`;

  return fetch(路径)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`无法加载笔记：${路径}`);
      }
      return response.text();
    })
    .then((text) => 生成笔记区内容(标准技术栈, 笔记文件名, text, { 更新历史 }))
    .then(() => 生成笔记目录区内容())
    .then(() => 生成作者和日期(标准技术栈, 笔记文件名))
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

function 处理浏览器历史导航() {
  const { 技术栈, 笔记 } = 从URL获取笔记信息();
  const 默认目录 = Object.keys(知识库)[0];
  const 笔记状态 = JSON.parse(localStorage.getItem("笔记状态") || "null");

  let 目标目录 = 标准化技术栈名称(技术栈);
  if (!目标目录) {
    if (技术栈) {
      console.warn(`未找到匹配的技术栈: ${技术栈}`);
    }
    目标目录 = 笔记状态?.当前目录 || 默认目录;
  }

  切换目录(目标目录, { 更新历史: false });

  const 目录数据 = 知识库[目标目录];
  const 笔记存在 = 笔记 && 目录数据?.笔记.some((项) => 项.标题.replaceAll(" ", "") === 笔记);

  if (笔记存在) {
    加载并展示笔记(目标目录, 笔记, { 更新历史: false }).catch(() => {
      if (笔记对话框.open) {
        关闭笔记对话框({ 更新历史: false });
      }
    });
  } else if (笔记对话框.open) {
    关闭笔记对话框({ 更新历史: false });
  }
}

function 生成笔记区内容(技术栈, 笔记文件名, 文本, { 更新历史 = true } = {}) {
  笔记区.innerHTML = marked.parse(文本);
  const images = 笔记区.querySelectorAll("img");
  for (const img of images) {
    const src_split = img.src.split("Markdown-Notes");
    const src_final = `${src_split[0]}Markdown-Notes/${技术栈}/${笔记文件名}${src_split[1]}`;
    img.src = src_final;
    img.title = "点击查看大图";

    // 为图片添加点击事件
    img.style.cursor = "pointer";
    img.addEventListener("click", () => 打开图片对话框(img));
  }
  const h2_all = 笔记区.querySelectorAll("h2");

  for (const h2 of h2_all) {
    const 前缀符号 = document.createElement("span");
    前缀符号.className = "前缀符号";
    前缀符号.innerHTML = "📰 ";
    h2.prepend(前缀符号);
  }
  hljs.highlightAll();
  笔记对话框.showModal();
  笔记对话框.scrollTop = 0;
  if (更新历史) {
    更新URL(技术栈, 笔记文件名);
  }

  // 重置滚动状态
  当前高亮索引 = -1;
  点击目标索引 = -1; // 重置点击目标记录
  点击目标时间戳 = 0;

  // 保存状态到 localStorage，保留当前目录状态
  const 笔记状态 = JSON.parse(localStorage.getItem("笔记状态") || "null") || {};
  笔记状态.技术栈 = 技术栈;
  笔记状态.笔记文件名 = 笔记文件名;
  笔记状态.时间戳 = new Date().getTime();
  // 确保当前目录也被保存
  if (!笔记状态.当前目录) {
    笔记状态.当前目录 = 技术栈;
  }
  localStorage.setItem("笔记状态", JSON.stringify(笔记状态));

  // 更新页面标题为技术栈+笔记
  document.title = `知识库 - ${笔记文件名} - ${技术栈}`;
}

function 生成笔记目录区内容() {
  const 笔记目录容器 = 笔记目录区.querySelector(".笔记目录容器");
  笔记目录容器.innerHTML = "";
  笔记目录区标题组.length = 0;
  笔记区目录组.length = 0;

  // 清除所有高亮状态
  const 所有高亮目录 = 笔记目录区.querySelectorAll(".当前目录");
  所有高亮目录.forEach((目录) => 目录.classList.remove("当前目录"));

  // 重置所有状态
  当前高亮索引 = -1;
  点击目标索引 = -1;
  点击目标时间戳 = 0;

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
    目录区_一级目录.addEventListener("click", (event) => {
      event.preventDefault();
      滚动到标题(一级目录);
      // 记录点击目标
      const 目标索引 = 笔记目录区标题组.indexOf(目录区_一级目录);
      点击目标索引 = 目标索引;
      点击目标时间戳 = Date.now();

      // 清除所有高亮状态
      const 所有高亮目录 = 笔记目录容器.querySelectorAll(".当前目录");
      所有高亮目录.forEach((目录) => 目录.classList.remove("当前目录"));

      // 立即高亮点击的标题
      目录区_一级目录.classList.add("当前目录");
      当前高亮索引 = 目标索引;
    });
    笔记目录区标题组.push(目录区_一级目录);
    笔记区目录组.push(一级目录);

    const 二级目录组 = 笔记区.querySelectorAll(`#${一级目录.id} ~ h2:not(#${一级目录.id} ~ h1 ~ h2)`);
    for (const [index_2, 二级目录] of 二级目录组.entries()) {
      二级目录.id = `${一级目录.id}-${index_2 + 1}`;
      const 目录区_二级目录 = document.createElement("a");
      目录区_二级目录.href = `#${二级目录.id}`;
      目录区_二级目录.className = "二级目录";
      目录区_二级目录.innerHTML = 二级目录.innerHTML;
      const 二级前缀符号 = 目录区_二级目录.querySelector(".前缀符号");
      二级前缀符号?.remove();
      目录分级容器.appendChild(目录区_二级目录);
      目录区_二级目录.addEventListener("click", (event) => {
        event.preventDefault();
        滚动到标题(二级目录);
        // 记录点击目标
        const 目标索引 = 笔记目录区标题组.indexOf(目录区_二级目录);
        点击目标索引 = 目标索引;
        点击目标时间戳 = Date.now();

        // 清除所有高亮状态
        const 所有高亮目录 = 笔记目录容器.querySelectorAll(".当前目录");
        所有高亮目录.forEach((目录) => 目录.classList.remove("当前目录"));

        // 立即高亮点击的标题
        目录区_二级目录.classList.add("当前目录");
        当前高亮索引 = 目标索引;
      });
      笔记目录区标题组.push(目录区_二级目录);
      笔记区目录组.push(二级目录);

      const 三级目录组 = 笔记区.querySelectorAll(
        `#${二级目录.id} ~ h3:not(#${二级目录.id} ~ h2 ~ h3, #${二级目录.id} ~ h1 ~ h3)`
      );
      for (const [index_3, 三级目录] of 三级目录组.entries()) {
        三级目录.id = `${二级目录.id}-${index_3 + 1}`;
        const 目录区_三级目录 = document.createElement("a");
        目录区_三级目录.href = `#${三级目录.id}`;
        目录区_三级目录.className = "三级目录";
        目录区_三级目录.innerHTML = 三级目录.innerHTML;
        const 三级前缀符号 = 目录区_三级目录.querySelector(".前缀符号");
        三级前缀符号?.remove();
        目录分级容器.appendChild(目录区_三级目录);
        目录区_三级目录.addEventListener("click", (event) => {
          event.preventDefault();
          滚动到标题(三级目录);
          // 记录点击目标
          const 目标索引 = 笔记目录区标题组.indexOf(目录区_三级目录);
          点击目标索引 = 目标索引;
          点击目标时间戳 = Date.now();

          // 清除所有高亮状态
          const 所有高亮目录 = 笔记目录容器.querySelectorAll(".当前目录");
          所有高亮目录.forEach((目录) => 目录.classList.remove("当前目录"));

          // 立即高亮点击的标题
          目录区_三级目录.classList.add("当前目录");
          当前高亮索引 = 目标索引;
        });
        笔记目录区标题组.push(目录区_三级目录);
        笔记区目录组.push(三级目录);
      }
    }
  }

  // 内容变化后按当前滚动位置立即同步一次高亮
  处理滚动高亮();
}

function 获取笔记作者(技术栈, 笔记文件名) {
  const 匹配笔记 = 知识库[技术栈].笔记.find((笔记) => 笔记.标题.replaceAll(" ", "") === 笔记文件名);
  return 匹配笔记.作者;
}

function 获取笔记日期(技术栈, 笔记文件名) {
  const 匹配笔记 = 知识库[技术栈].笔记.find((笔记) => 笔记.标题.replaceAll(" ", "") === 笔记文件名);
  return 匹配笔记.时间;
}

function 滚动到标题(目标标题) {
  if (!目标标题) return;
  const 滚动容器 = 笔记对话框;
  const 容器位置 = 滚动容器.getBoundingClientRect().top;
  const 标题位置 = 目标标题.getBoundingClientRect().top;
  const 偏移 = 标题位置 - 容器位置 - 20; // 保留视觉留白
  const 目标滚动位置 = Math.max(滚动容器.scrollTop + 偏移, 0);

  滚动容器.scrollTo({
    top: 目标滚动位置,
    behavior: "smooth",
  });
}

function 生成作者和日期(技术栈, 笔记文件名) {
  const 作者姓名 = 获取笔记作者(技术栈, 笔记文件名);

  // 创建作者信息组
  const 作者信息组 = document.createElement("div");
  作者信息组.className = "作者信息组";

  // 作者头像容器
  const 作者头像容器 = document.createElement("div");
  作者头像容器.className = "作者头像容器";
  作者头像容器.style.background = `center/contain no-repeat url("/Images/Contributors/${作者姓名}.jpg")`;

  // 作者姓名标签
  const 作者姓名标签 = document.createElement("a");
  作者姓名标签.className = "作者姓名标签";
  作者姓名标签.target = "_self";
  作者姓名标签.href = `/Introduction/contributors.html#${作者姓名}`;
  作者姓名标签.textContent = 作者姓名;

  作者信息组.appendChild(作者头像容器);
  作者信息组.appendChild(作者姓名标签);

  // 日期容器
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
  笔记信息容器.append(作者信息组, 日期容器);
}

// 滚动高亮相关：基于滚动位置的 scrollspy（二分查找，准确且高性能）
let 当前高亮索引 = -1;
let 点击目标索引 = -1; // 记录点击的目标标题索引
let 点击目标时间戳 = 0; // 记录点击的时间戳
let 滚动动画帧 = null;
// 标题顶部距滚动容器顶部该距离以内，视为"当前阅读位置"
const 高亮触发偏移 = 80;

// 二分查找：最后一个"标题顶部距容器顶部 ≤ 触发偏移"的标题索引
function 计算当前标题索引() {
  const 容器顶部 = 笔记对话框.getBoundingClientRect().top;
  let 低 = 0;
  let 高 = 笔记区目录组.length - 1;
  let 结果 = -1;

  while (低 <= 高) {
    const 中 = (低 + 高) >> 1;
    const 标题偏移 = 笔记区目录组[中].getBoundingClientRect().top - 容器顶部;
    if (标题偏移 <= 高亮触发偏移) {
      结果 = 中;
      低 = 中 + 1;
    } else {
      高 = 中 - 1;
    }
  }
  // 尚未滚动到第一个标题（页面停在顶部）时，高亮第一个标题
  return 结果 === -1 ? 0 : 结果;
}

function 处理滚动高亮() {
  滚动动画帧 = null;
  if (笔记区目录组.length === 0) return;

  // 点击目标优先：点击后短时间内、且尚未滚动到目标位置时，保持点击高亮不跳动
  if (点击目标索引 !== -1) {
    const 目标标题 = 笔记区目录组[点击目标索引];
    const 容器顶部 = 笔记对话框.getBoundingClientRect().top;
    const 目标已越过 = !目标标题 || 目标标题.getBoundingClientRect().top - 容器顶部 <= 高亮触发偏移;
    const 点击已过期 = Date.now() - 点击目标时间戳 >= 3000;

    if (!目标已越过 && !点击已过期) {
      return;
    }
    点击目标索引 = -1;
    点击目标时间戳 = 0;
  }

  const 目标索引 = 计算当前标题索引();
  if (目标索引 !== -1 && 目标索引 !== 当前高亮索引) {
    更新高亮状态(目标索引);
  }
}

// 滚动事件用 rAF 合帧，passive 提升滚动性能
function 请求滚动处理() {
  if (滚动动画帧 === null) {
    滚动动画帧 = requestAnimationFrame(处理滚动高亮);
  }
}

笔记对话框.addEventListener("scroll", 请求滚动处理, { passive: true });

// 更新高亮状态
function 更新高亮状态(目标索引) {
  const 当前高亮目录 = 笔记目录区.querySelector(".当前目录");
  const 目标目录 = 笔记目录区标题组[目标索引];

  if (当前高亮目录 !== 目标目录) {
    // 清除所有高亮状态
    const 所有高亮目录 = 笔记目录区.querySelectorAll(".当前目录");
    所有高亮目录.forEach((目录) => 目录.classList.remove("当前目录"));

    // 高亮目标目录
    目标目录.classList.add("当前目录");

    // 平滑滚动到目标目录（如果目标目录不在可视区域内）
    const 目录容器 = 笔记目录区.querySelector(".笔记目录容器");
    const 目录边界 = 目标目录.getBoundingClientRect();
    const 容器边界 = 目录容器.getBoundingClientRect();

    // 如果目标目录在容器可视区域外，则滚动到可见位置
    if (目录边界.top < 容器边界.top || 目录边界.bottom > 容器边界.bottom) {
      目标目录.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    当前高亮索引 = 目标索引;

    // 如果这是点击目标，清除点击目标记录
    if (目标索引 === 点击目标索引) {
      点击目标索引 = -1;
      点击目标时间戳 = 0;
    }
  }
}

// 图片点击放大功能
let 图片对话框 = null;
let 当前图片 = null;
let 当前缩放比例 = 1;
let 图片原始尺寸 = { width: 0, height: 0 };
let 图片当前尺寸 = { width: 0, height: 0 };

// 创建图片对话框
function 创建图片对话框() {
  if (图片对话框) return 图片对话框;

  图片对话框 = document.createElement("dialog");
  图片对话框.className = "图片对话框";
  图片对话框.innerHTML = `
    <div class="图片对话框内容">
      <div class="图片工具栏">
        <button class="图片工具栏按钮" id="放大按钮" title="放大">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button class="图片工具栏按钮" id="缩小按钮" title="缩小">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button class="图片工具栏按钮" id="重置按钮" title="重置">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M3 21v-5h5"></path>
          </svg>
        </button>
        <button class="图片工具栏按钮" id="关闭图片按钮" title="关闭">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="图片容器">
        <img class="放大图片" alt="放大图片">
      </div>
    </div>
  `;

  document.body.appendChild(图片对话框);

  // 绑定事件
  const 放大按钮 = 图片对话框.querySelector("#放大按钮");
  const 缩小按钮 = 图片对话框.querySelector("#缩小按钮");
  const 重置按钮 = 图片对话框.querySelector("#重置按钮");
  const 关闭图片按钮 = 图片对话框.querySelector("#关闭图片按钮");
  const 放大图片 = 图片对话框.querySelector(".放大图片");

  放大按钮.addEventListener("click", () => 缩放图片(1.2));
  缩小按钮.addEventListener("click", () => 缩放图片(0.8));
  重置按钮.addEventListener("click", 重置图片);
  关闭图片按钮.addEventListener("click", 关闭图片对话框);

  // 点击背景关闭
  图片对话框.addEventListener("click", (e) => {
    if (e.target === 图片对话框) {
      关闭图片对话框();
    }
  });

  // 键盘事件
  document.addEventListener("keydown", (e) => {
    if (图片对话框.open) {
      switch (e.key) {
        case "Escape":
          关闭图片对话框();
          break;
        case "+":
        case "=":
          e.preventDefault();
          缩放图片(1.2);
          break;
        case "-":
          e.preventDefault();
          缩放图片(0.8);
          break;
        case "0":
          重置图片();
          break;
      }
    }
  });

  // 鼠标滚轮缩放
  图片对话框.addEventListener("wheel", (e) => {
    e.preventDefault();
    const 缩放因子 = e.deltaY > 0 ? 0.9 : 1.1;
    缩放图片(缩放因子);
  });

  return 图片对话框;
}

// 打开图片对话框
function 打开图片对话框(图片元素) {
  if (!图片对话框) {
    创建图片对话框();
  }

  当前图片 = 图片对话框.querySelector(".放大图片");
  当前图片.src = 图片元素.src;
  当前图片.alt = 图片元素.alt || "图片";

  // 重置缩放状态
  当前缩放比例 = 1;
  图片原始尺寸 = { width: 0, height: 0 };
  图片当前尺寸 = { width: 0, height: 0 };

  // 等待图片加载完成后设置初始尺寸
  当前图片.onload = () => {
    图片原始尺寸 = {
      width: 当前图片.naturalWidth,
      height: 当前图片.naturalHeight,
    };

    // 计算初始尺寸，确保图片在视口内
    const 视口宽度 = window.innerWidth * 0.9;
    const 视口高度 = window.innerHeight * 0.9;
    const 宽高比 = 图片原始尺寸.width / 图片原始尺寸.height;

    if (宽高比 > 视口宽度 / 视口高度) {
      // 图片较宽，以宽度为准
      图片当前尺寸.width = Math.min(视口宽度, 图片原始尺寸.width);
      图片当前尺寸.height = 图片当前尺寸.width / 宽高比;
    } else {
      // 图片较高，以高度为准
      图片当前尺寸.height = Math.min(视口高度, 图片原始尺寸.height);
      图片当前尺寸.width = 图片当前尺寸.height * 宽高比;
    }

    当前图片.style.width = `${图片当前尺寸.width}px`;
    当前图片.style.height = `${图片当前尺寸.height}px`;
  };

  图片对话框.showModal();
}

// 缩放图片
function 缩放图片(缩放因子) {
  if (!当前图片 || !图片原始尺寸.width) return;

  const 新缩放比例 = 当前缩放比例 * 缩放因子;

  // 计算新尺寸
  const 新宽度 = 图片原始尺寸.width * 新缩放比例;
  const 新高度 = 图片原始尺寸.height * 新缩放比例;

  // 限制最大尺寸为视口的90%
  const 最大宽度 = window.innerWidth * 0.9;
  const 最大高度 = window.innerHeight * 0.9;

  // 如果新尺寸超过视口限制，则限制为视口大小
  if (新宽度 > 最大宽度 || 新高度 > 最大高度) {
    // 计算在视口限制下的最大缩放比例
    const 宽度缩放比例 = 最大宽度 / 图片原始尺寸.width;
    const 高度缩放比例 = 最大高度 / 图片原始尺寸.height;
    const 最大缩放比例 = Math.min(宽度缩放比例, 高度缩放比例);

    当前缩放比例 = 最大缩放比例;
    图片当前尺寸.width = 图片原始尺寸.width * 最大缩放比例;
    图片当前尺寸.height = 图片原始尺寸.height * 最大缩放比例;
  } else {
    当前缩放比例 = 新缩放比例;
    图片当前尺寸.width = 新宽度;
    图片当前尺寸.height = 新高度;
  }

  当前图片.style.width = `${图片当前尺寸.width}px`;
  当前图片.style.height = `${图片当前尺寸.height}px`;
}

// 重置图片
function 重置图片() {
  if (!当前图片 || !图片原始尺寸.width) return;

  当前缩放比例 = 1;

  // 重新计算适合视口的尺寸
  const 视口宽度 = window.innerWidth * 0.9;
  const 视口高度 = window.innerHeight * 0.9;
  const 宽高比 = 图片原始尺寸.width / 图片原始尺寸.height;

  if (宽高比 > 视口宽度 / 视口高度) {
    // 图片较宽，以宽度为准
    图片当前尺寸.width = Math.min(视口宽度, 图片原始尺寸.width);
    图片当前尺寸.height = 图片当前尺寸.width / 宽高比;
  } else {
    // 图片较高，以高度为准
    图片当前尺寸.height = Math.min(视口高度, 图片原始尺寸.height);
    图片当前尺寸.width = 图片当前尺寸.height * 宽高比;
  }

  当前图片.style.width = `${图片当前尺寸.width}px`;
  当前图片.style.height = `${图片当前尺寸.height}px`;
}

// 关闭图片对话框
function 关闭图片对话框() {
  if (图片对话框) {
    图片对话框.close();
    // 彻底移除对话框元素
    if (图片对话框.parentNode) {
      图片对话框.parentNode.removeChild(图片对话框);
    }
    // 重置相关变量
    图片对话框 = null;
    当前图片 = null;
    当前缩放比例 = 1;
    图片原始尺寸 = { width: 0, height: 0 };
    图片当前尺寸 = { width: 0, height: 0 };
  }
}

// 页面卸载时清理图片对话框
window.addEventListener("beforeunload", () => {
  if (图片对话框) {
    关闭图片对话框();
  }
});

// 页面隐藏时也清理图片对话框（防止在移动设备上切换应用时出现问题）
document.addEventListener("visibilitychange", () => {
  if (document.hidden && 图片对话框 && 图片对话框.open) {
    关闭图片对话框();
  }
});
