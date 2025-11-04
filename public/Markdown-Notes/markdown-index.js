const 知识库 = {
  通用: {
    图标: "/Images/Markdown-Notes/知识库-01.webp",
    笔记: [
      {
        标题: "压缩解压软件",
        作者: "",
        时间: {
          年: 0,
          月: 0,
          日: 0,
        },
      },
      {
        标题: "常用字符的 Unicode 编码",
        作者: "苏扬",
        时间: {
          年: 2025,
          月: 8,
          日: 22,
        },
      },
    ],
  },
  Linux: {
    图标: "/Images/Page-Logos/Linux.png",
    笔记: [
      {
        标题: "文件权限",
        作者: "苏扬",
        时间: {
          年: 2025,
          月: 6,
          日: 20,
        },
      },
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
        标题: "Fcitx 输入法",
        作者: "",
        时间: {
          年: 0,
          月: 0,
          日: 0,
        },
      },
      {
        标题: "字体",
        作者: "凌子轩",
        时间: {
          年: 2025,
          月: 6,
          日: 22,
        },
      },
      {
        标题: "使用 GCC",
        作者: "凌子轩",
        时间: {
          年: 2025,
          月: 5,
          日: 22,
        },
      },
      {
        标题: "鼠标指针",
        作者: "凌子轩",
        时间: {
          年: 2025,
          月: 6,
          日: 30,
        },
      },
      {
        标题: "Samba",
        作者: "凌子轩",
        时间: {
          年: 2025,
          月: 7,
          日: 17,
        },
      },
      {
        标题: "截图与录屏",
        作者: "",
        时间: {
          年: 0,
          月: 0,
          日: 0,
        },
      },
      {
        标题: "开启BBR",
        作者: "杜宗远",
        时间: {
          年: 2025,
          月: 9,
          日: 12,
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
        标题: "使用 Fcitx 输入法框架",
        作者: "苏扬",
        时间: {
          年: 2025,
          月: 6,
          日: 18,
        },
      },
    ],
  },
  包管理器: { 图标: "/Images/Page-Logos/包管理器.png", 笔记: [] },
  Blender: { 图标: "/Images/Page-Logos/3D/Blender.png", 笔记: [] },
  Kdenlive: {
    图标: "/Images/SVG/Kdenlive.svg",
    笔记: [
      {
        标题: "快捷键",
        作者: "",
        时间: {
          年: 0,
          月: 0,
          日: 0,
        },
      },
    ],
  },
};

const 二级目录区 = document.querySelector(".二级目录区");
const 目录区 = document.querySelector(".目录区");
const 笔记对话框 = document.getElementById("笔记对话框");
const 笔记区 = 笔记对话框.querySelector(".笔记区");
const 笔记信息区 = 笔记对话框.querySelector(".笔记信息区");
const 笔记目录区 = 笔记对话框.querySelector(".笔记目录区");
const 关闭对话框按钮 = 笔记对话框.querySelector("#关闭对话框");
const 笔记区目录组 = [];
const 笔记目录区标题组 = [];

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
  滚动方向 = "down";
  上次滚动位置 = 0;
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
  const 技术栈列表 = Object.keys(知识库);
  const 默认目录 = 技术栈列表[0];

  for (const 键 of 技术栈列表) {
    生成一级目录(键);
  }

  let 目标目录 = null;
  if (URL参数.技术栈) {
    const 匹配目录 = 标准化技术栈名称(URL参数.技术栈);
    if (匹配目录) {
      目标目录 = 匹配目录;
    } else if (笔记状态?.当前目录) {
      console.warn(`未找到匹配的技术栈: ${URL参数.技术栈}`);
      目标目录 = 笔记状态.当前目录;
    } else {
      目标目录 = 默认目录;
    }
  } else if (笔记状态?.当前目录) {
    目标目录 = 笔记状态.当前目录;
  } else {
    目标目录 = 默认目录;
  }

  切换目录(目标目录, { 更新历史: false });

  const 目录数据 = 知识库[目标目录];
  const 要打开的笔记 =
    URL参数.技术栈 &&
    URL参数.笔记 &&
    目录数据?.笔记.some((笔记) => 笔记.标题.replaceAll(" ", "") === URL参数.笔记)
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

  window.addEventListener("popstate", 处理浏览器历史导航);
});

function 生成一级目录(键) {
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

  目录.addEventListener("click", () => {
    切换目录(键);
  });
}

function 切换目录(键, { 更新历史 = true } = {}) {
  const 标准键 = 标准化技术栈名称(键) || 键;
  if (!知识库[标准键]) return;

  // 清空二级目录
  二级目录区.innerHTML = "";

  // 更新一级目录的高亮状态
  const 当前目录 = 目录区.querySelector(".当前目录");
  if (当前目录) {
    当前目录.classList.remove("当前目录");
  }

  const 目标目录元素 =
    Array.from(目录区.children).find((目录元素) => 目录元素.dataset?.技术栈 === 标准键) ||
    Array.from(目录区.children).find(
      (目录元素) => 目录元素.querySelector(".目录标题")?.textContent === 标准键
    );

  if (目标目录元素) {
    目标目录元素.classList.add("当前目录");
  }

  // 保存当前目录状态
  const 笔记状态 = JSON.parse(localStorage.getItem("笔记状态") || "null") || {};
  笔记状态.当前目录 = 标准键;
  localStorage.setItem("笔记状态", JSON.stringify(笔记状态));

  if (更新历史) {
    更新URL(标准键, null);
  }

  if (知识库[标准键].笔记.length > 0) {
    生成二级目录(标准键);
  }

  document.title = `知识库 - ${标准键}`;
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

    const 链接作者与照片 = document.createElement("div");
    链接作者与照片.className = "链接作者与照片";
    const 链接作者 = document.createElement("span");
    链接作者.className = "链接作者";
    链接作者.textContent = 笔记对象.作者;
    const 链接作者照片 = document.createElement("img");
    链接作者照片.className = "链接作者照片";
    链接作者照片.src = 笔记对象.作者
      ? `/Images/Contributors/${笔记对象.作者}.jpg`
      : "/Images/Contributors/Mystery_Men.jpg";
    链接作者照片.alt = "链接作者照片";
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
  }
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
    前缀符号.innerHTML = "&#128209; ";
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
  滚动方向 = "down";
  上次滚动位置 = 0;
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
  滚动方向 = "down";
  上次滚动位置 = 0;
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
    目录区_一级目录.addEventListener("click", () => {
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
      const 前缀符号 = 目录区_二级目录.querySelector(".前缀符号");
      前缀符号?.remove();
      目录分级容器.appendChild(目录区_二级目录);
      目录区_二级目录.addEventListener("click", () => {
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
    }
  }

  // 初始化交叉观察器并开始观察
  初始化交叉观察器();
  开始观察标题();

  // 延迟设置初始高亮，确保高亮第一个一级标题
  setTimeout(() => {
    设置初始高亮();
  }, 100);
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

function 防抖(回调, 延时 = 100) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      回调.apply(this, args);
    }, 延时);
  };
}

// 交叉观察器配置
const 交叉观察器配置 = {
  root: null, // 使用视口作为根
  rootMargin: "-20% 0px -70% 0px", // 顶部25%处开始高亮，底部50%作为结束区域
  threshold: /* [0, 0.1, 0.5, 1] */ 0, // 多个阈值，更精确的触发
};

let 交叉观察器 = null;
let 当前高亮索引 = -1;
let 滚动方向 = "down";
let 上次滚动位置 = 0;
let 点击目标索引 = -1; // 记录点击的目标标题索引
let 点击目标时间戳 = 0; // 记录点击的时间戳

// 检测滚动方向
function 检测滚动方向(当前位置) {
  滚动方向 = 当前位置 > 上次滚动位置 ? "down" : "up";
  上次滚动位置 = 当前位置;
}

// 初始化交叉观察器
function 初始化交叉观察器() {
  if (交叉观察器) {
    交叉观察器.disconnect();
  }

  交叉观察器 = new IntersectionObserver((entries) => {
    // 过滤出可见的标题
    const 可见标题 = entries.filter((entry) => entry.isIntersecting);

    if (可见标题.length === 0) return;

    // 获取当前滚动位置
    const 滚动容器 = 笔记对话框;
    const 当前滚动位置 = 滚动容器.scrollTop;
    检测滚动方向(当前滚动位置);

    // 计算每个可见标题的"优先级分数"
    const 标题分数 = 可见标题.map((entry) => {
      const 标题位置 = entry.boundingClientRect.top;
      const 可见度 = entry.intersectionRatio;
      const 标题索引 = 笔记区目录组.indexOf(entry.target);

      // 基础分数：越靠近视口顶部分数越高
      let 分数 = 1000 - Math.abs(标题位置 - 100); // 100px是理想位置

      // 可见度加成：可见度越高分数越高
      分数 += 可见度 * 100;

      // 滚动方向加成：向下滚动时，位置更低的标题得分更高
      if (滚动方向 === "down") {
        分数 += 标题位置 > 100 ? 50 : 0;
      } else if (滚动方向 === "up") {
        分数 += 标题位置 < 100 ? 50 : 0;
      }

      // 点击目标加成：如果是最近点击的目标，给予额外分数
      const 当前时间 = Date.now();
      if (标题索引 === 点击目标索引 && 当前时间 - 点击目标时间戳 < 3000) {
        分数 += 1000; // 大幅提高点击目标的分数
      }

      return {
        entry,
        分数,
        位置: 标题位置,
        索引: 标题索引,
      };
    });

    // 选择分数最高的标题
    标题分数.sort((a, b) => b.分数 - a.分数);
    const 最佳标题 = 标题分数[0];

    const 目标索引 = 笔记区目录组.indexOf(最佳标题.entry.target);

    if (目标索引 !== -1 && 目标索引 !== 当前高亮索引) {
      // 额外的防回跳检查
      const 当前标题位置 = 笔记区目录组[当前高亮索引]?.getBoundingClientRect().top || 0;
      const 新标题位置 = 最佳标题.entry.target.getBoundingClientRect().top;

      let 应该切换 = true;

      // 检查是否是点击目标
      const 当前时间 = Date.now();
      const 是点击目标 = 目标索引 === 点击目标索引 && 当前时间 - 点击目标时间戳 < 3000;

      // 如果是点击目标，强制切换，跳过防回跳检查
      if (是点击目标) {
        应该切换 = true;
      } else {
        // 向下滚动时，新标题应该在当前标题下方
        if (滚动方向 === "down" && 新标题位置 < 当前标题位置 - 20) {
          应该切换 = false;
        }
        // 向上滚动时，新标题应该在当前标题上方
        else if (滚动方向 === "up" && 新标题位置 > 当前标题位置 + 20) {
          应该切换 = false;
        }
      }

      if (应该切换) {
        更新高亮状态(目标索引);
      }
    }
  }, 交叉观察器配置);
}

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

// 开始观察所有标题
function 开始观察标题() {
  if (!交叉观察器) return;

  // 清除之前的观察
  交叉观察器.disconnect();

  // 观察所有标题
  for (const 标题 of 笔记区目录组) {
    交叉观察器.observe(标题);
  }
}

// 设置初始高亮
function 设置初始高亮() {
  if (笔记区目录组.length > 0) {
    // 清除所有高亮状态
    const 所有高亮目录 = 笔记目录区.querySelectorAll(".当前目录");
    所有高亮目录.forEach((目录) => 目录.classList.remove("当前目录"));

    当前高亮索引 = 0; // 第一个标题总是一级标题
    const 第一个目录 = 笔记目录区标题组[0];
    第一个目录.classList.add("当前目录");

    // 清除点击目标记录
    点击目标索引 = -1;
    点击目标时间戳 = 0;
  }
}

// 滚动事件监听器（用于检测滚动方向）
const 滚动方向检测器 = 防抖(() => {
  const 滚动容器 = 笔记对话框;
  const 当前滚动位置 = 滚动容器.scrollTop;
  检测滚动方向(当前滚动位置);
}, 50);

笔记对话框.addEventListener("scroll", 滚动方向检测器);

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
