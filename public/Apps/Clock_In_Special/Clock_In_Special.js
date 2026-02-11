const 选择图像 = document.getElementById("选择图像");
const 背景区 = document.querySelector(".背景区");
const 打卡信息区 = document.querySelector(".打卡信息区");
const 防伪区 = document.querySelector(".防伪区");
const 打卡标题区 = document.querySelector(".打卡标题区");
const 打卡时间 = document.querySelector(".打卡时间");
const 生成截图按钮 = document.getElementById("生成截图");
const 生成区 = document.querySelector(".生成区");
const 参数区 = document.querySelector(".参数区");
const 打卡地点显示区 = document.querySelector(".打卡地点");
const 打卡地点文本框 = document.getElementById("打卡地点");
const 打卡日期 = document.querySelector(".打卡日期");
const 打卡日期输入 = document.getElementById("打卡日期输入");
const 打卡时间输入 = document.getElementById("打卡时间输入");
const 防伪ID = document.querySelector(".防伪ID");
const 星期名称表 = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const 打卡地点存储键 = "Clock_In_Special_打卡地点";
const 背景图存储键 = "Clock_In_Special_背景图";
const 防伪字符表 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const 设置背景图尺寸 = (img) => {
  if (!img || !img.naturalWidth || !img.naturalHeight) return;
  const 比 = img.naturalWidth / img.naturalHeight;
  img.style.maxWidth = "";
  img.style.maxHeight = "";
  img.style.width = "";
  img.style.height = "";
  if (比 < 1) {
    img.style.maxWidth = "750px";
    img.style.height = "auto";
  } else {
    img.style.maxHeight = "1200px";
    img.style.width = "auto";
  }
};

const 生成打卡时间 = (小时数, 分钟数) => {
  if (!打卡时间) {
    return;
  }

  const 当前时间 = new Date();
  const 小时 =
    小时数 != null && 分钟数 != null ? String(小时数).padStart(2, "0") : String(当前时间.getHours()).padStart(2, "0");
  const 分钟 =
    小时数 != null && 分钟数 != null ? String(分钟数).padStart(2, "0") : String(当前时间.getMinutes()).padStart(2, "0");

  打卡时间.innerHTML = "";
  if (打卡标题区) {
    const 旧垫底层 = 打卡标题区.querySelector(".打卡时间垫底层");
    if (旧垫底层) {
      旧垫底层.remove();
    }

    const 打卡时间垫底层 = document.createElement("span");
    打卡时间垫底层.className = "打卡时间垫底层";

    const 垫底小时元素 = document.createElement("span");
    垫底小时元素.textContent = 小时;

    const 垫底分隔元素 = document.createElement("span");
    垫底分隔元素.textContent = ":";

    const 垫底分钟元素 = document.createElement("span");
    垫底分钟元素.textContent = 分钟;

    打卡时间垫底层.append(垫底小时元素, 垫底分隔元素, 垫底分钟元素);
    if (打卡时间) {
      打卡标题区.insertBefore(打卡时间垫底层, 打卡时间);
    } else {
      打卡标题区.append(打卡时间垫底层);
    }
  }

  const 小时元素 = document.createElement("span");
  小时元素.className = "打卡时间片";
  小时元素.textContent = 小时;

  const 分隔元素 = document.createElement("span");
  分隔元素.className = "打卡时间片";
  分隔元素.textContent = ":";

  const 分钟元素 = document.createElement("span");
  分钟元素.className = "打卡时间片";
  分钟元素.textContent = 分钟;

  打卡时间.append(小时元素, 分隔元素, 分钟元素);
};

const 更新打卡地点 = () => {
  if (!打卡地点显示区 || !打卡地点文本框) {
    return;
  }

  const 文本值 = 打卡地点文本框.value.trim();
  打卡地点显示区.textContent = 文本值 || "打卡地点";
  sessionStorage.setItem(打卡地点存储键, 文本值);
};

const 更新打卡日期 = () => {
  if (!打卡日期) return;

  let 日期对象 = new Date();
  if (打卡日期输入 && 打卡日期输入.value) {
    const 解析 = new Date(打卡日期输入.value);
    if (!Number.isNaN(解析.getTime())) {
      日期对象 = 解析;
    }
  }

  const 年份 = 日期对象.getFullYear();
  const 月份 = String(日期对象.getMonth() + 1).padStart(2, "0");
  const 日期 = String(日期对象.getDate()).padStart(2, "0");
  const 星期 = 星期名称表[日期对象.getDay()];

  打卡日期.innerHTML = "";
  const 年月日元素 = document.createElement("span");
  年月日元素.className = "打卡日期片";
  年月日元素.textContent = `${年份}.${月份}.${日期}`;
  const 星期元素 = document.createElement("span");
  星期元素.className = "打卡日期片";
  星期元素.textContent = 星期;
  打卡日期.append(年月日元素, 星期元素);
};

const 更新打卡时间 = () => {
  if (!打卡时间) return;

  let 小时数 = null;
  let 分钟数 = null;
  if (打卡时间输入 && 打卡时间输入.value) {
    const 匹配 = /^(\d{1,2}):(\d{2})$/.exec(打卡时间输入.value.trim());
    if (匹配) {
      const h = parseInt(匹配[1], 10);
      const m = parseInt(匹配[2], 10);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        小时数 = h;
        分钟数 = m;
      }
    }
  }

  生成打卡时间(小时数, 分钟数);
};

const 生成防伪ID = (长度 = 14) => {
  let 结果 = "";
  for (let i = 0; i < 长度; i += 1) {
    const 索引 = Math.floor(Math.random() * 防伪字符表.length);
    结果 += 防伪字符表[索引];
  }
  return 结果;
};

document.addEventListener("DOMContentLoaded", () => {
  const 今 = new Date();
  if (打卡日期输入) {
    打卡日期输入.value = `${今.getFullYear()}-${String(今.getMonth() + 1).padStart(2, "0")}-${String(今.getDate()).padStart(2, "0")}`;
  }
  if (打卡时间输入) {
    打卡时间输入.value = `${String(今.getHours()).padStart(2, "0")}:${String(今.getMinutes()).padStart(2, "0")}`;
  }
  更新打卡日期();
  更新打卡时间();
});
document.addEventListener("DOMContentLoaded", () => {
  if (防伪ID) {
    防伪ID.textContent = 生成防伪ID();
  }
});
document.addEventListener("DOMContentLoaded", () => {
  if (打卡地点文本框) {
    const 记录值 = sessionStorage.getItem(打卡地点存储键) || "";
    打卡地点文本框.value = 记录值;
  }
  更新打卡地点();
});
document.addEventListener("DOMContentLoaded", () => {
  if (!背景区) {
    return;
  }

  const 背景图数据 = sessionStorage.getItem(背景图存储键);
  if (!背景图数据) {
    return;
  }

  const 图像元素 = document.createElement("img");
  图像元素.src = 背景图数据;
  图像元素.alt = "已保存的背景图";

  背景区.innerHTML = "";
  背景区.append(图像元素);
  图像元素.onload = () => 设置背景图尺寸(图像元素);
  if (图像元素.complete) 设置背景图尺寸(图像元素);
});

if (打卡地点文本框) {
  打卡地点文本框.addEventListener("input", 更新打卡地点);
}
if (打卡日期输入) {
  打卡日期输入.addEventListener("change", 更新打卡日期);
  打卡日期输入.addEventListener("input", 更新打卡日期);
}
if (打卡时间输入) {
  打卡时间输入.addEventListener("change", 更新打卡时间);
  打卡时间输入.addEventListener("input", 更新打卡时间);
}

const 使用当前日期按钮 = document.getElementById("使用当前日期");
const 使用当前时间按钮 = document.getElementById("使用当前时间");
if (使用当前日期按钮 && 打卡日期输入) {
  使用当前日期按钮.addEventListener("click", () => {
    const 今 = new Date();
    打卡日期输入.value = `${今.getFullYear()}-${String(今.getMonth() + 1).padStart(2, "0")}-${String(今.getDate()).padStart(2, "0")}`;
    更新打卡日期();
  });
}
if (使用当前时间按钮 && 打卡时间输入) {
  使用当前时间按钮.addEventListener("click", () => {
    const 今 = new Date();
    打卡时间输入.value = `${String(今.getHours()).padStart(2, "0")}:${String(今.getMinutes()).padStart(2, "0")}`;
    更新打卡时间();
  });
}

选择图像.addEventListener("change", () => {
  const [文件] = 选择图像.files || [];
  if (!文件) {
    return;
  }

  const 读取器 = new FileReader();
  读取器.onload = () => {
    const 图像元素 = document.createElement("img");
    const 图像数据 = String(读取器.result || "");
    图像元素.src = 图像数据;
    图像元素.alt = 文件.name || "选择的图像";

    背景区.innerHTML = "";
    背景区.append(图像元素);
    图像元素.onload = () => 设置背景图尺寸(图像元素);

    sessionStorage.setItem(背景图存储键, 图像数据);
  };

  读取器.readAsDataURL(文件);
});

if (参数区) {
  let 拖拽偏移X = 0;
  let 拖拽偏移Y = 0;

  const 在可拖拽区域 = (节点) => 参数区.contains(节点) && !节点.closest(".标签") && !节点.closest(".按钮区");

  参数区.addEventListener("mousedown", (e) => {
    if (!在可拖拽区域(e.target)) return;
    e.preventDefault();

    const 区 = 参数区.getBoundingClientRect();
    拖拽偏移X = e.clientX - 区.left;
    拖拽偏移Y = e.clientY - 区.top;

    const 总区 = 参数区.offsetParent;
    if (!总区) return;

    const onMove = (e) => {
      const 总Rect = 总区.getBoundingClientRect();
      const 边左 = 总Rect.left + 总区.clientLeft;
      const 边上 = 总Rect.top + 总区.clientTop;
      参数区.style.left = `${e.clientX - 拖拽偏移X - 边左}px`;
      参数区.style.top = `${e.clientY - 拖拽偏移Y - 边上}px`;
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      参数区.style.removeProperty("cursor");
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    参数区.style.cursor = 'url("/Images/Common/鼠标-拖拽.cur"), grab';
  });
}

const 创建截图模态 = () => {
  const 模态层 = document.createElement("div");
  模态层.className = "截图模态";
  模态层.setAttribute("role", "dialog");
  模态层.setAttribute("aria-modal", "true");

  const 关闭按钮 = document.createElement("button");
  关闭按钮.className = "截图模态关闭";
  关闭按钮.type = "button";
  关闭按钮.setAttribute("aria-label", "关闭截图预览");
  关闭按钮.textContent = "×";

  const 图像容器 = document.createElement("div");
  图像容器.className = "截图模态图像容器";

  const 加载提示 = document.createElement("span");
  加载提示.className = "截图模态加载";
  加载提示.textContent = "正在生成截图...";

  图像容器.append(加载提示);
  模态层.append(关闭按钮, 图像容器);

  const 关闭模态 = () => {
    document.body.style.overflow = "";
    模态层.remove();
    document.removeEventListener("keydown", 按键关闭);
  };

  const 按键关闭 = (事件) => {
    if (事件.key === "Escape") {
      关闭模态();
    }
  };

  关闭按钮.addEventListener("click", 关闭模态);
  模态层.addEventListener("click", (事件) => {
    if (事件.target === 模态层) {
      关闭模态();
    }
  });
  document.addEventListener("keydown", 按键关闭);

  document.body.append(模态层);
  document.body.style.overflow = "hidden";

  return { 模态层, 图像容器, 关闭模态 };
};

const 打开截图模态 = async () => {
  if (!生成区 || !window.snapdom) {
    return;
  }

  const { 图像容器, 关闭模态 } = 创建截图模态();

  try {
    const 导出对象 = await window.snapdom(生成区, { embedFonts: true });
    const 截图图像 = await 导出对象.toPng({
      scale: 1,
      dpr: window.devicePixelRatio || 1,
    });
    图像容器.innerHTML = "";
    截图图像.classList.add("截图模态图像");
    图像容器.append(截图图像);
  } catch (错误) {
    图像容器.innerHTML = "";
    const 错误提示 = document.createElement("span");
    错误提示.className = "截图模态加载";
    错误提示.textContent = "截图生成失败，请重试。";
    图像容器.append(错误提示);
    setTimeout(关闭模态, 1500);
  }
};

if (生成截图按钮) {
  生成截图按钮.addEventListener("click", (事件) => {
    事件.preventDefault();
    打开截图模态();
  });
}
