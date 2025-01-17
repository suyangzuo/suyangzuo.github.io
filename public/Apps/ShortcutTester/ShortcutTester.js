const root = document.querySelector(":root");
const 快捷键列表项高度 = document.querySelector(".快捷键列表项").offsetHeight;
root.style.setProperty("--快捷键列表项高度", `${快捷键列表项高度}px`);
const 测试透视容器 = document.querySelector(".测试容器-透视");
const 快捷键池区 = document.querySelector(".快捷键池");
测试透视容器.style.width = `${快捷键池区.offsetWidth}px`;

const 姓名框 = document.getElementById("姓名");
姓名框.addEventListener("input", 输入姓名);
const 次数框 = document.getElementById("测试次数");
次数框.addEventListener("input", 更新次数);
let 测试起始时间 = 0;
let 姓名 = 姓名框.value;
let 次数 = parseInt(次数框.value, 10);
let 剩余次数 = 次数;
let 奇偶次数 = 剩余次数 % 2 ? 剩余次数 + 1 : 剩余次数;
let 测试运行中 = false;
let 旋转角度 = 0;
const 提示类型区 = document.querySelector(".提示类型区");
const 提示按键单选框 = document.getElementById("提示类型-按键");
const 结果对话框 = document.getElementById("结果对话框");
无结果时生成关闭按钮();
// const 摘要层 = 结果对话框.querySelector(".摘要层");
/*const 关闭对话框_摘要层 = document.getElementById("关闭对话框-摘要层");
关闭对话框_摘要层.addEventListener("click", () => {
  结果对话框.close();
});
const 显示详情按钮 = document.getElementById("显示详情");
显示详情按钮.addEventListener("click", () => {
  详情层.classList.add("显示详情");
  摘要层.classList.add("隐藏摘要");
});*/
// const 详情层 = 结果对话框.querySelector(".详情层");
/*const 显示摘要按钮 = document.getElementById("显示摘要");
显示摘要按钮.addEventListener("click", () => {
  详情层.classList.remove("显示详情");
  摘要层.classList.remove("隐藏摘要");
});
const 关闭对话框_详情层 = document.getElementById("关闭对话框-详情层");
关闭对话框_详情层.addEventListener("click", () => {
  结果对话框.close();
});*/
const 查看结果按钮 = document.getElementById("result");
查看结果按钮.addEventListener("click", () => {
  结果对话框.showModal();
});

const 音效复选框 = document.getElementById("音效");
音效复选框.addEventListener("change", () => {
  const 音效文本 = 音效复选框.previousElementSibling;
  音效文本.innerHTML = 音效复选框.checked
    ? '<i class="fa-solid fa-volume-high">'
    : '<i class="fa-solid fa-volume-xmark"></i>';
});

const 正确音效 = new Audio("./Audios/正确.mp3");
const 错误音效 = new Audio("./Audios/错误.mp3");

const 测试计数元素 = document.querySelector(".测试计数");
const 计次元素 = 测试计数元素.querySelector(".计次");
const 斜杠元素 = 测试计数元素.querySelector(".斜杠");
const 总数元素 = 测试计数元素.querySelector(".总数");
const 加油区 = document.querySelector(".加油区");
const 加油动画时长 = 2500;
let 加油动画 = null;
let 测试开始延时函数 = null;

const 加油动画帧序列 = [
  { translate: "0 -200%" },
  { translate: "0 -100%", offset: 0.1 },
  { translate: "0 -100%", offset: 0.45 },
  { translate: "0 0", offset: 0.55 },
  { translate: "0 0", offset: 0.9 },
  { translate: "0 100%" },
];

const 加油动画设置 = {
  easing: "linear",
  duration: 加油动画时长,
};

const 旋转用时 = parseInt(
  window.getComputedStyle(root).getPropertyValue("--旋转用时"),
  10,
);
const 测试间隔 = 1000;
const 测试结果出现延时 = 1500;
let 旋转延时id = null;
const 旋转容器 = document.querySelector(".测试容器-旋转");

const 修饰键组 = ["Control", "Alt", "Shift", "Meta"];
const 大写符号键组 = ["<", ">", "?", "_", ":", "{", "}", "|", '"'];
const 方向键组 = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
const 测试对象组 = [];
const 测试对象池 = [];
const 列表项容器组 = document.querySelectorAll(".列表项容器");
for (const [index, 容器] of 列表项容器组.entries()) {
  容器.id = `${index}`;
}

const 取消选择按钮 = document.getElementById("取消选择");
const 取消测试按钮 = document.getElementById("cancel");
const 开始按钮 = document.querySelector("#run");

const 测试面组 = document.querySelectorAll(".测试面");
let 当前用户快捷键内容 = null;

let 错误动画 = null;
const 错误动画关键帧序列 = [
  { backgroundColor: "transparent" },
  { backgroundColor: "brown", offset: 0.2 },
  { backgroundColor: "transparent" },
  { backgroundColor: "brown", offset: 0.8 },
  { backgroundColor: "transparent" },
];

const 错误动画设置 = {
  easing: "ease-out",
  duration: 1000,
};

const 快捷键种类区 = document.querySelector(".快捷键种类区");
const 快捷键列表区 = document.querySelector(".快捷键列表区");
// 快捷键列表区.style.width = window.getComputedStyle(快捷键种类区).width;
const 快捷键种类组 = 快捷键种类区.querySelectorAll(".快捷键种类");
const 快捷键列表组 = 快捷键列表区.querySelectorAll(".快捷键列表");

取消选择按钮.addEventListener("click", () => {
  for (const 列表 of 快捷键列表组) {
    const 已确认容器组 = 列表.querySelectorAll(".已确认容器");
    for (const 已确认容器 of 已确认容器组) {
      已确认容器.classList.remove("已确认容器");
    }
  }

  const 种类计数组 = 快捷键种类区.querySelectorAll(".当前种类选中计数");
  if (种类计数组.length > 0) {
    for (const 种类计数 of 种类计数组) {
      种类计数.textContent = "0";
      种类计数.classList.remove("已有选中数");
    }
  }

  测试对象池.length = 0;
});

let 当前快捷键种类 = 快捷键种类组[0];
let 当前快捷键列表 = 快捷键列表组[0];
for (const [索引, 种类] of 快捷键种类组.entries()) {
  种类.addEventListener("click", () => {
    if (种类 === 当前快捷键种类) return;
    种类.classList.add("当前种类");
    当前快捷键种类.classList.remove("当前种类");
    当前快捷键种类 = 种类;
    快捷键列表组[索引].classList.add("当前列表");
    当前快捷键列表.classList.remove("当前列表");
    当前快捷键列表 = 快捷键列表组[索引];
  });

  const 当前种类选中计数 = document.createElement("span");
  当前种类选中计数.className = "当前种类选中计数";
  种类.appendChild(当前种类选中计数);
}

for (const 列表 of 快捷键列表组) {
  const 列表内容器集合 = 列表.querySelectorAll(".列表项容器");
  for (const [index, 容器] of 列表内容器集合.entries()) {
    const 序号 = document.createElement("span");
    序号.textContent = `${index + 1}`;
    序号.className = "序号";
    容器.prepend(序号);

    容器.addEventListener("click", () => {
      if (容器.className.includes("已确认容器")) {
        容器.classList.remove("已确认容器");
        删除测试对象(容器);
      } else {
        容器.classList.add("已确认容器");
        添加测试对象(容器);
      }

      /*const 列表 = 容器.parentElement.parentElement;
      const 索引 = 快捷键列表区.indexOf(列表);*/
      const 当前种类选中计数 =
        当前快捷键种类.querySelector(".当前种类选中计数");
      const 已确认容器组 = 当前快捷键列表.querySelectorAll(".已确认容器");
      if (已确认容器组.length <= 0) {
        当前种类选中计数.textContent = "0";
        当前种类选中计数.classList.remove("已有选中数");
      } else {
        当前种类选中计数.textContent = `${已确认容器组.length}`;
        当前种类选中计数.classList.add("已有选中数");
      }
    });
  }
}

function 添加测试对象(列表项容器) {
  const 功能键组 = 列表项容器.querySelectorAll(".功能键");
  const 按键 = 列表项容器.querySelector(".按键");
  const 用途 = 列表项容器.querySelector(".用途").textContent.trim();
  const 测试对象 = {
    id: 列表项容器.id,
    usage: 用途,
    duration: 0,
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
    key: "",
    passed: false,
  };

  for (const 功能键 of 功能键组) {
    if (功能键.textContent.trim() === "Ctrl") {
      测试对象.ctrl = true;
    } else if (功能键.textContent.trim() === "Alt") {
      测试对象.alt = true;
    } else if (功能键.textContent.trim() === "Shift") {
      测试对象.shift = true;
    } else if (功能键.textContent.trim() === "Win") {
      测试对象.meta = true;
    }

    const 按键内容 = 按键.textContent.trim();
    switch (按键内容) {
      case "⬆":
        测试对象.key = "ArrowUp";
        break;
      case "⬇":
        测试对象.key = "ArrowDown";
        break;
      default:
        测试对象.key = 按键内容;
        break;
    }
  }

  测试对象池.push(测试对象);
}

function 删除测试对象(列表项容器) {
  const 删除对象索引 = 测试对象池.findIndex(
    (item) => item.id === 列表项容器.id,
  );
  测试对象池.splice(删除对象索引, 1);
}

开始按钮.addEventListener("click", () => {
  /*测试运行中 = !测试运行中;

  if (!测试运行中) {
    return;
  }*/

  if (测试对象池.length === 0 || 姓名 === "" || 次数 <= 0) {
    生成错误信息();
    return;
  }

  结果对话框.innerHTML = "";
  查看结果按钮.disabled = true;
  提示类型区.classList.add("禁用");

  clearTimeout(测试开始延时函数);
  加油动画 = 加油区.animate(加油动画帧序列, 加油动画设置);

  剩余次数 = 次数;
  计次元素.textContent = (次数 - 剩余次数 + 1).toString();
  斜杠元素.textContent = "/";
  总数元素.textContent = 次数.toString();

  测试对象组.length = 0;
  生成测试对象组();

  奇偶次数 = 剩余次数 % 2 ? 剩余次数 + 1 : 剩余次数;
  旋转容器.style.transition = "none";
  旋转容器.style.rotate = "";
  setTimeout(() => {
    旋转容器.style.transition = "";
  }, 旋转用时);
  旋转角度 = 0;

  const 当前面 = 测试面组[奇偶次数 % 2];
  当前面.innerHTML = "";
  测试开始延时函数 = setTimeout(() => {
    当前面.append(
      生成测试目标(次数, 剩余次数),
      生成用户按键信息前缀(),
      生成单次测试结果区容器(),
    );

    window.addEventListener("keydown", 屏蔽按下快捷键默认行为);
    window.addEventListener("keydown", 按下快捷键封装器);
    window.addEventListener("keyup", 松开快捷键封装器);

    测试起始时间 = performance.now();
  }, 加油动画时长);
});

const 按下快捷键封装器 = function (event) {
  按下快捷键(event);
};

const 屏蔽按下快捷键默认行为 = function (event) {
  event.preventDefault();
};

function 按下快捷键(event) {
  if (event.repeat) {
    return;
  }

  const 当前面 = 测试面组[奇偶次数 % 2];
  const 用户快捷键内容 = 当前面.querySelector(".用户快捷键内容");
  当前用户快捷键内容 = 用户快捷键内容;
  用户快捷键内容.innerHTML = "";
  const 描述 = document.createElement("span");
  描述.className = "测试描述";
  描述.textContent = "您的输入";
  用户快捷键内容.appendChild(描述);

  let ctrl = null;
  let alt = null;
  let shift = null;
  let meta = null;
  let key = event.key;
  if (event.ctrlKey) {
    ctrl = document.createElement("span");
    ctrl.className = "功能键";
    ctrl.textContent = "Ctrl";
    ctrl.usage = "Control";
    描述.after(ctrl);
  }

  if (event.altKey) {
    alt = document.createElement("span");
    alt.className = "功能键";
    alt.usage = "Alt";
    alt.textContent = "Alt";
    if (ctrl !== null) {
      ctrl.after(alt);
      alt.before(生成连接符());
    } else {
      描述.after(alt);
    }
  }

  if (event.shiftKey) {
    shift = document.createElement("span");
    shift.className = "功能键";
    shift.usage = "Shift";
    shift.textContent = "Shift";
    if (ctrl && alt) {
      alt.after(shift);
      shift.before(生成连接符());
    } else if (ctrl) {
      ctrl.after(shift);
      shift.before(生成连接符());
    } else if (alt) {
      alt.after(shift);
      shift.before(生成连接符());
    } else {
      描述.after(shift);
    }
  }

  if (event.metaKey) {
    meta = document.createElement("span");
    meta.className = "功能键";
    meta.usage = "Meta";
    meta.textContent = "Win";
    if (ctrl && alt && shift) {
      shift.after(meta);
      meta.before(生成连接符());
    } else if (ctrl && alt) {
      alt.after(meta);
      meta.before(生成连接符());
    } else if (ctrl && shift) {
      shift.after(meta);
      meta.before(生成连接符());
    } else if (alt && shift) {
      shift.after(meta);
      meta.before(生成连接符());
    } else if (ctrl) {
      ctrl.after(meta);
      meta.before(生成连接符());
    } else if (alt) {
      alt.after(meta);
      meta.before(生成连接符());
    } else if (shift) {
      shift.after(meta);
      meta.before(生成连接符());
    } else {
      描述.after(meta);
    }
  }

  if (!修饰键组.some((修饰键) => 修饰键 === key)) {
    const keyElement = document.createElement("span");
    keyElement.className = "按键";

    if (大写符号键组.some((键) => 键 === key)) {
      switch (key) {
        case "<":
          key = ",";
          break;
        case ">":
          key = ".";
          break;
        case ":":
          key = ";";
          break;
        case '"':
          key = "'";
          break;
        case "{":
          key = "[";
          break;
        case "}":
          key = "]";
          break;
        case "|":
          key = "\\";
          break;
        case "_":
          key = "-";
          break;
        case "?":
          key = "/";
          break;
      }
      keyElement.textContent = key;
    } else if (key === "=") {
      key = "+";
      keyElement.textContent = key;
    } else if (方向键组.some((键) => 键 === key)) {
      switch (key) {
        case "ArrowUp":
          keyElement.textContent = "⬆";
          break;
        case "ArrowDown":
          keyElement.textContent = "⬇";
          break;
        case "ArrowLeft":
          keyElement.textContent = "⬅";
          break;
        case "ArrowRight":
          keyElement.textContent = "➡";
          break;
      }
    } else {
      keyElement.textContent = key.toUpperCase();
    }

    用户快捷键内容.appendChild(keyElement);
    const 功能键组 = 用户快捷键内容.querySelectorAll(".功能键");
    if (功能键组.length > 0) {
      keyElement.before(生成连接符());
    }

    const 测试对象 = 测试对象组[次数 - 剩余次数];

    剩余次数--;
    奇偶次数--;
    window.removeEventListener("keydown", 按下快捷键封装器);
    window.removeEventListener("keyup", 松开快捷键封装器);

    测试对象.passed =
      event.ctrlKey === 测试对象.ctrl &&
      event.altKey === 测试对象.alt &&
      event.shiftKey === 测试对象.shift &&
      event.metaKey === 测试对象.meta &&
      (key.toUpperCase() === 测试对象.key || key === 测试对象.key);

    测试对象.duration = performance.now() - 测试起始时间;
    const 单次用时分 = Math.floor(测试对象.duration / 60000);
    const 单次用时秒 =
      单次用时分 < 1
        ? (测试对象.duration / 1000).toFixed(2)
        : ((测试对象.duration % 60000) / 1000).toFixed(2);

    生成单次测试结果(当前面, 单次用时分, 单次用时秒, 测试对象.passed);

    if (音效复选框.checked) {
      if (测试对象.passed) {
        正确音效.play();
      } else {
        错误音效.play();
      }
    }

    if (剩余次数 > 0) {
      const 下一面 = 测试面组[奇偶次数 % 2];
      下一面.innerHTML = "";
      下一面.append(
        生成测试目标(次数, 剩余次数),
        生成用户按键信息前缀(),
        生成单次测试结果区容器(),
      );

      旋转角度 += 180;
      旋转延时id = setTimeout(() => {
        旋转容器.style.rotate = `y ${旋转角度}deg`;
        计次元素.textContent = (次数 - 剩余次数 + 1).toString();
      }, 测试间隔);

      setTimeout(() => {
        window.addEventListener("keydown", 按下快捷键封装器);
        window.addEventListener("keyup", 松开快捷键封装器);
        测试起始时间 = performance.now();
      }, 旋转用时 + 测试间隔);
    } else {
      window.removeEventListener("keydown", 屏蔽按下快捷键默认行为);
      setTimeout(() => {
        生成结果时删除关闭按钮();
        生成摘要层与详情层();
        生成对话框按钮();
        生成摘要();
        生成详情();
        结果对话框.showModal();
        查看结果按钮.disabled = false;
        提示类型区.classList.remove("禁用");
      }, 测试结果出现延时);
    }
  }
}

function 生成单次测试结果(当前面, 分, 秒, 测试通过) {
  const 单次测试结果区 = 当前面.querySelector(".单次测试结果区");
  单次测试结果区.innerHTML = "";

  const 单次测试用时 = document.createElement("div");
  单次测试用时.className = "单次测试用时";
  const 用时描述 = document.createElement("span");
  用时描述.className = "单次测试用时描述";
  用时描述.textContent = "本次用时";
  const 分容器 = document.createElement("span");
  分容器.className = "单次测试用时容器";
  const 用时分 = document.createElement("span");
  用时分.className = "单次测试用时值";
  用时分.textContent = 分.toString();
  const 用时分后缀 = document.createElement("span");
  用时分后缀.className = "单次测试用时后缀";
  用时分后缀.textContent = "分";
  分容器.append(用时分, 用时分后缀);
  const 秒容器 = document.createElement("span");
  秒容器.className = "单次测试用时容器";
  const 用时秒 = document.createElement("span");
  用时秒.className = "单次测试用时值";
  用时秒.textContent = 秒;
  const 用时秒后缀 = document.createElement("span");
  用时秒后缀.className = "单次测试用时后缀";
  用时秒后缀.textContent = "秒";
  秒容器.append(用时秒, 用时秒后缀);
  if (分 < 1) {
    单次测试用时.append(用时描述, 秒容器);
  } else {
    单次测试用时.append(用时描述, 分容器, 秒容器);
  }

  const 单次测试结果 = document.createElement("figure");
  单次测试结果.className = "单次测试结果";
  const 结果图 = document.createElement("img");
  结果图.src = 测试通过 ? "./Images/correct.png" : "./Images/incorrect.png";
  结果图.alt = "结果图";
  单次测试结果.appendChild(结果图);

  单次测试结果区.append(单次测试用时, 单次测试结果);
}

const 松开快捷键封装器 = function (event) {
  松开快捷键(event);
};

function 松开快捷键(event) {
  const 功能键组 = 当前用户快捷键内容?.querySelectorAll(".功能键");
  const 功能键数组 = Array.from(功能键组);
  const 按键组 = 当前用户快捷键内容?.querySelector(".按键");
  const key = event.key;
  let 键 = null;
  if (key === "Shift") {
    键 = 功能键数组.find((item) => item.textContent.trim() === "Shift");
  } else if (key === "Control") {
    键 = 功能键数组.find((item) => item.textContent.trim() === "Ctrl");
  } else if (key === "Alt") {
    键 = 功能键数组.find((item) => item.textContent.trim() === "Alt");
  } else if (key === "Meta") {
    键 = 功能键数组.find((item) => item.textContent.trim() === "Win");
  }
  const 前连接符 = 键?.previousElementSibling;
  const 后连接符 = 键?.nextElementSibling;
  const 键索引 = 功能键数组.indexOf(键);
  if (键索引 > 0 && 键索引 < 功能键数组.length - 1) {
    前连接符?.remove();
  } else if (键索引 === 0) {
    后连接符?.remove();
  } else if (键索引 === 功能键数组.length - 1) {
    前连接符?.remove();
  }
  键?.remove();
}

function 生成测试对象组() {
  测试对象组.length = 0;
  for (let i = 0; i < 次数; i++) {
    const 随机索引 = Math.floor(Math.random() * 测试对象池.length);
    测试对象组.push(structuredClone(测试对象池[随机索引]));
  }
}

function 输入姓名() {
  姓名 = 姓名框.value;
}

function 更新次数() {
  if (次数框.value === "") {
    次数 = 0;
    剩余次数 = 次数;
    return;
  }
  次数 = parseInt(次数框.value, 10);
  if (次数 > 100) {
    次数框.value = "100";
    次数 = 100;
  }
  剩余次数 = 次数;
}

function 生成测试目标(总次数, 剩余次数) {
  const 快捷键内容 = document.createElement("div");
  快捷键内容.className = "快捷键内容";

  const 测试标题 = document.createElement("span");
  测试标题.className = "测试描述";
  测试标题.textContent = "测试目标";
  快捷键内容.appendChild(测试标题);

  const 测试对象 = 测试对象组[总次数 - 剩余次数];
  if (提示按键单选框.checked) {
    if (测试对象.ctrl) {
      const ctrl = document.createElement("span");
      ctrl.className = "功能键";
      ctrl.textContent = "Ctrl";
      快捷键内容.appendChild(ctrl);
      ctrl.after(生成连接符());
    }

    if (测试对象.alt) {
      const alt = document.createElement("span");
      alt.className = "功能键";
      alt.textContent = "Alt";
      快捷键内容.appendChild(alt);
      alt.after(生成连接符());
    }

    if (测试对象.shift) {
      const shift = document.createElement("span");
      shift.className = "功能键";
      shift.textContent = "Shift";
      快捷键内容.appendChild(shift);
      shift.after(生成连接符());
    }

    if (测试对象.meta) {
      const meta = document.createElement("span");
      meta.className = "功能键";
      meta.textContent = "Win";
      快捷键内容.appendChild(meta);
      meta.after(生成连接符());
    }

    const key = document.createElement("span");
    key.className = "按键";
    switch (测试对象.key) {
      case "ArrowUp":
        key.textContent = "⬆";
        break;
      case "ArrowDown":
        key.textContent = "⬇";
        break;
      default:
        key.textContent = 测试对象.key.toUpperCase();
        break;
    }
    快捷键内容.appendChild(key);
  } else {
    const 用途 = document.createElement("span");
    用途.className = "用途";
    用途.textContent = 测试对象.usage;
    快捷键内容.appendChild(用途);
  }

  return 快捷键内容;
}

function 生成用户按键信息前缀() {
  const 快捷键内容 = document.createElement("div");
  快捷键内容.className = "快捷键内容 用户快捷键内容";

  const 测试标题 = document.createElement("span");
  测试标题.className = "测试描述";
  测试标题.textContent = "您的输入";
  快捷键内容.appendChild(测试标题);

  return 快捷键内容;
}

function 生成单次测试结果区容器() {
  const 单次测试结果区 = document.createElement("div");
  单次测试结果区.className = "单次测试结果区";
  return 单次测试结果区;
}

function 生成连接符() {
  const 连接符 = document.createElement("span");
  连接符.className = "连接符";
  连接符.textContent = "+";
  return 连接符;
}

function 生成错误信息() {
  错误动画?.cancel();
  if (测试对象池.length === 0) {
    const 快捷键列表区错误层 = document.querySelector(".快捷键列表区错误层");
    错误动画 = 快捷键列表区错误层.animate(错误动画关键帧序列, 错误动画设置);
  } else if (姓名 === "") {
    错误动画 = 姓名框.animate(错误动画关键帧序列, 错误动画设置);
  } else if (次数 <= 0) {
    次数框.animate(错误动画关键帧序列, 错误动画设置);
  }
}

function 生成摘要() {
  const 摘要层 = 结果对话框.querySelector(".摘要层");
  摘要层.innerHTML = "";
  摘要层.classList.remove("隐藏摘要");
  const 结果标题 = document.createElement("h2");
  结果标题.className = "结果标题";
  结果标题.textContent = "摘要";

  const 姓名区 = document.createElement("div");
  姓名区.className = "结果分区";
  const 姓名标题 = document.createElement("span");
  姓名标题.className = "分区标题";
  姓名标题.textContent = "姓名";
  const 姓名元素 = document.createElement("span");
  姓名元素.className = "姓名";
  姓名元素.textContent = 姓名;
  姓名区.append(姓名标题, 姓名元素);

  const 提示类型 = document.createElement("div");
  提示类型.className = "结果分区";
  const 提示类型区标题 = document.createElement("span");
  提示类型区标题.className = "分区标题";
  提示类型区标题.textContent = "提示类型";
  const 提示类型区元素 = document.createElement("span");
  提示类型区元素.className = "姓名";
  提示类型区元素.style.color = "darkgoldenrod";
  提示类型区元素.textContent = 提示按键单选框.checked ? "按键" : "用途";
  提示类型.append(提示类型区标题, 提示类型区元素);

  const 时间区 = document.createElement("div");
  时间区.className = "结果分区";
  const 时间区标题 = document.createElement("span");
  时间区标题.className = "分区标题";
  时间区标题.textContent = "测试时间";
  const 时间日期 = 获取当前时间();
  时间区.append(时间区标题, 时间日期.日期, 时间日期.时间);

  const 正确数据 = 生成正确数据();
  const 错误数据 = 生成错误数据();
  const 总体正确率 = 生成总体数据();

  const 显示详情按钮 = document.getElementById("显示详情");
  const 关闭对话框按钮_摘要层 = document.getElementById("关闭对话框-摘要层");

  摘要层.append(
    结果标题,
    姓名区,
    提示类型,
    时间区,
    总体正确率,
    正确数据,
    错误数据,
    显示详情按钮,
    关闭对话框按钮_摘要层,
  );
}

function 生成平均正确数据() {
  const 正确对象组 = 测试对象组.filter((item) => item.passed);
  if (正确对象组.length <= 0) {
    return;
  }
  const 正确数据分组对象 = Object.groupBy(
    正确对象组,
    (测试对象) => 测试对象.usage,
  );
  const 正确统计组 = [];
  for (const 属性 in 正确数据分组对象) {
    正确统计组.push({
      用途: 属性,
      总用时: 正确数据分组对象[属性].reduce(
        (累积, 当前) => 累积 + 当前.duration,
        0,
      ),
      平均:
        正确数据分组对象[属性].reduce((累积, 当前) => 累积 + 当前.duration, 0) /
        正确数据分组对象[属性].length,
      最快: Math.min(...正确数据分组对象[属性].map((item) => item.duration)),
      最慢: Math.max(...正确数据分组对象[属性].map((item) => item.duration)),
    });
  }

  const 平均最快对象 = 正确统计组.find(
    (item) => item.平均 === Math.min(...正确统计组.map((item) => item.平均)),
  );
  const 平均最慢对象 = 正确统计组.find(
    (item) => item.平均 === Math.max(...正确统计组.map((item) => item.平均)),
  );
  const 平均最快用时 = 以毫秒算时间(平均最快对象.最快);
  const 平均最慢用时 = 以毫秒算时间(平均最慢对象.最慢);

  const 平均最快 = document.createElement("span");
  平均最快.className = "父容器";
  const 平均最快前缀 = document.createElement("span");
  平均最快前缀.className = "前缀";
  平均最快前缀.textContent = "平均最快";
  const 平均最快分子容器 = document.createElement("span");
  平均最快分子容器.className = "子容器";
  const 平均最快分值 = document.createElement("span");
  平均最快分值.className = "值";
  平均最快分值.textContent = 平均最快用时.分.toString();
  const 平均最快分单位 = document.createElement("span");
  平均最快分单位.className = "单位";
  平均最快分单位.textContent = "分";
  平均最快分子容器.append(平均最快分值, 平均最快分单位);
  const 平均最快秒子容器 = document.createElement("span");
  平均最快秒子容器.className = "子容器";
  const 平均最快秒值 = document.createElement("span");
  平均最快秒值.className = "值";
  平均最快秒值.textContent = 平均最快用时.秒.toString();
  const 平均最快秒单位 = document.createElement("span");
  平均最快秒单位.className = "单位";
  平均最快秒单位.textContent = "秒";
  const 平均最快用途 = document.createElement("span");
  平均最快用途.className = "用途";
  平均最快用途.textContent = 平均最快对象.用途;
  平均最快秒子容器.append(平均最快秒值, 平均最快秒单位, 平均最快用途);

  if (平均最快用时.分 >= 1) {
    平均最快.append(平均最快前缀, 平均最快分子容器, 平均最快秒子容器);
  } else {
    平均最快.append(平均最快前缀, 平均最快秒子容器);
  }

  const 平均最慢 = document.createElement("span");
  平均最慢.className = "父容器";
  const 平均最慢前缀 = document.createElement("span");
  平均最慢前缀.className = "前缀";
  平均最慢前缀.textContent = "平均最慢";
  const 平均最慢分子容器 = document.createElement("span");
  平均最慢分子容器.className = "子容器";
  const 平均最慢分值 = document.createElement("span");
  平均最慢分值.className = "值";
  平均最慢分值.textContent = 平均最慢用时.分.toString();
  const 平均最慢分单位 = document.createElement("span");
  平均最慢分单位.className = "单位";
  平均最慢分单位.textContent = "分";
  平均最慢分子容器.append(平均最慢分值, 平均最慢分单位);
  const 平均最慢秒子容器 = document.createElement("span");
  平均最慢秒子容器.className = "子容器";
  const 平均最慢秒值 = document.createElement("span");
  平均最慢秒值.className = "值";
  平均最慢秒值.textContent = 平均最慢用时.秒.toString();
  const 平均最慢秒单位 = document.createElement("span");
  平均最慢秒单位.className = "单位";
  平均最慢秒单位.textContent = "秒";
  const 平均最慢用途 = document.createElement("span");
  平均最慢用途.className = "用途";
  平均最慢用途.textContent = 平均最慢对象.用途;
  平均最慢秒子容器.append(平均最慢秒值, 平均最慢秒单位, 平均最慢用途);

  if (平均最慢用时.分 >= 1) {
    平均最慢.append(平均最慢前缀, 平均最慢分子容器, 平均最慢秒子容器);
  } else {
    平均最慢.append(平均最慢前缀, 平均最慢秒子容器);
  }

  return {
    最快: 平均最快,
    最慢: 平均最慢,
  };
}

function 生成正确数据() {
  let passed = 0;
  for (const 对象 of 测试对象组) {
    if (对象.passed) {
      passed++;
    }
  }
  const 正确用时 = 获取正确用时();
  const 总体数据 = document.createElement("div");
  总体数据.className = "结果分区";

  const 总体数据标题 = document.createElement("span");
  总体数据标题.className = "分区标题";
  总体数据标题.textContent = "正确数据";

  const 正确次数容器 = document.createElement("span");
  正确次数容器.className = "子容器";
  const 正确次数前缀 = document.createElement("span");
  正确次数前缀.className = "前缀";
  正确次数前缀.textContent = "次数";
  const 正确次数值 = document.createElement("span");
  正确次数值.className = "值";
  正确次数值.textContent = passed.toString();
  正确次数容器.append(正确次数前缀, 正确次数值);

  const 总用时子容器 = document.createElement("span");
  总用时子容器.className = "父容器";
  const 总用时前缀 = document.createElement("span");
  总用时前缀.className = "前缀";
  总用时前缀.textContent = "总用时";
  const 总用时分值 = document.createElement("span");
  总用时分值.className = "值";
  总用时分值.textContent = `${正确用时.分}`;
  const 总用时分符号 = document.createElement("span");
  总用时分符号.className = "单位";
  总用时分符号.textContent = "分";
  const 分容器 = document.createElement("div");
  分容器.className = "子容器";
  分容器.append(总用时分值, 总用时分符号);
  const 总用时秒值 = document.createElement("span");
  总用时秒值.className = "值";
  总用时秒值.textContent = `${正确用时.秒}`;
  const 总用时秒符号 = document.createElement("span");
  总用时秒符号.className = "单位";
  总用时秒符号.textContent = "秒";
  const 秒容器 = document.createElement("div");
  秒容器.className = "子容器";
  秒容器.append(总用时秒值, 总用时秒符号);
  if (正确用时.分 >= 1) {
    总用时子容器.append(总用时前缀, 分容器, 秒容器);
  } else {
    总用时子容器.append(总用时前缀, 秒容器);
  }

  const 平均用时容器 = document.createElement("span");
  平均用时容器.className = "父容器";
  const 平均用时前缀 = document.createElement("span");
  平均用时前缀.className = "前缀";
  平均用时前缀.textContent = "平均用时";
  const 平均用时分值 = document.createElement("span");
  平均用时分值.className = "值";
  平均用时分值.textContent = `${正确用时.平均分}`;
  const 平均用时分符号 = document.createElement("span");
  平均用时分符号.className = "单位";
  平均用时分符号.textContent = "分";
  const 平均分容器 = document.createElement("div");
  平均分容器.className = "子容器";
  平均分容器.append(平均用时分值, 平均用时分符号);
  const 平均用时秒值 = document.createElement("span");
  平均用时秒值.className = "值";
  平均用时秒值.textContent = `${正确用时.平均秒}`;
  const 平均用时秒符号 = document.createElement("span");
  平均用时秒符号.className = "单位";
  平均用时秒符号.textContent = "秒";
  const 平均秒容器 = document.createElement("div");
  平均秒容器.className = "子容器";
  平均秒容器.append(平均用时秒值, 平均用时秒符号);
  if (正确用时.平均分 >= 1) {
    平均用时容器.append(平均用时前缀, 平均分容器, 平均秒容器);
  } else {
    平均用时容器.append(平均用时前缀, 平均秒容器);
  }

  const 平均用时 = 生成平均正确数据();

  if (passed <= 0) {
    总体数据.appendChild(总体数据标题);
  } else {
    总体数据.append(
      总体数据标题,
      正确次数容器,
      总用时子容器,
      平均用时容器,
      平均用时.最快,
      平均用时.最慢,
    );
  }
  return 总体数据;
}

function 获取正确用时() {
  let total = 0;
  let 正确次数 = 0;
  for (const 对象 of 测试对象组) {
    if (对象.passed) {
      total += 对象.duration;
      正确次数++;
    }
  }
  let average = total / 正确次数;

  const 总用时 = 以毫秒算时间(total);
  const 平均用时 = 以毫秒算时间(average);

  if (正确次数 === 0) {
    return {
      分: 0,
      秒: 0,
      平均分: 0,
      平均秒: 0,
    };
  } else {
    return {
      分: 总用时.分,
      秒: 总用时.秒,
      平均分: 平均用时.分,
      平均秒: 平均用时.秒,
    };
  }
}

function 生成错误数据() {
  let failed = 0;
  for (const 对象 of 测试对象组) {
    if (!对象.passed) {
      failed++;
    }
  }

  const 错误数据 = document.createElement("div");
  错误数据.className = "结果分区";

  const 错误数据标题 = document.createElement("span");
  错误数据标题.className = "分区标题";
  错误数据标题.textContent = "错误数据";

  const 错误次数容器 = document.createElement("span");
  错误次数容器.className = "子容器";
  const 错误次数前缀 = document.createElement("span");
  错误次数前缀.className = "前缀";
  错误次数前缀.textContent = "次数";
  const 错误次数值 = document.createElement("span");
  错误次数值.className = "值";
  错误次数值.textContent = failed.toString();
  错误次数容器.append(错误次数前缀, 错误次数值);

  const 错误对象组 = 测试对象组.filter((item) => !item.passed);
  const 错误分组对象 = Object.groupBy(错误对象组, (测试对象) => 测试对象.usage);
  console.log(错误分组对象);
  const 错误最多对象 = {
    用途: "",
    数量: 0,
  };
  const 错误最少对象 = {
    用途: "",
    数量: 测试对象组.length,
  };
  for (const 属性 in 错误分组对象) {
    if (错误分组对象[属性].length > 错误最多对象.数量) {
      错误最多对象.用途 = 属性;
      错误最多对象.数量 = 错误分组对象[属性].length;
    }

    if (错误分组对象[属性].length < 错误最少对象.数量) {
      错误最少对象.用途 = 属性;
      错误最少对象.数量 = 错误分组对象[属性].length;
    }
  }

  const 错误最多 = document.createElement("span");
  错误最多.className = "父容器";
  const 错误最多前缀 = document.createElement("span");
  错误最多前缀.className = "前缀";
  错误最多前缀.textContent = "错误最多";
  const 错误最多子容器 = document.createElement("span");
  错误最多子容器.className = "子容器";
  const 错误最多值 = document.createElement("span");
  错误最多值.className = "值";
  错误最多值.textContent = 错误最多对象.数量.toString();
  const 错误最多用途 = document.createElement("span");
  错误最多用途.className = "用途";
  错误最多用途.textContent = 错误最多对象.用途;
  错误最多子容器.append(错误最多值, 错误最多用途);
  const 错误最少 = document.createElement("span");
  错误最少.className = "父容器";
  const 错误最少前缀 = document.createElement("span");
  错误最少前缀.className = "前缀";
  错误最少前缀.textContent = "错误最少";
  const 错误最少子容器 = document.createElement("span");
  错误最少子容器.className = "子容器";
  const 错误最少值 = document.createElement("span");
  错误最少值.className = "值";
  错误最少值.textContent = 错误最少对象.数量.toString();
  const 错误最少用途 = document.createElement("span");
  错误最少用途.className = "用途";
  错误最少用途.textContent = 错误最少对象.用途;
  错误最少子容器.append(错误最少值, 错误最少用途);

  错误最多.append(错误最多前缀, 错误最多子容器);
  错误最少.append(错误最少前缀, 错误最少子容器);

  if (failed <= 0) {
    错误数据.appendChild(错误数据标题);
  } else {
    if (Object.keys(错误分组对象).length <= 1) {
      错误数据.append(错误数据标题, 错误次数容器, 错误最多);
    } else {
      错误数据.append(错误数据标题, 错误次数容器, 错误最多, 错误最少);
    }
  }
  return 错误数据;
}

function 以毫秒算时间(毫秒) {
  const 分 = Math.floor(毫秒 / 60000);
  const 秒 =
    分 < 1 ? (毫秒 / 1000).toFixed(2) : ((毫秒 % 60000) / 1000).toFixed(2);
  return {
    分: 分,
    秒: 秒,
  };
}

function 生成总体数据() {
  let passed = 0;
  for (const 对象 of 测试对象组) {
    if (对象.passed) {
      passed++;
    }
  }
  const 摘要层 = 结果对话框.querySelector(".摘要层");

  const failed = 测试对象组.length - passed;
  const passedRate = passed / 测试对象组.length;
  const passedPercent = (passedRate * 100).toFixed(1);
  const failedRate = failed / 测试对象组.length;
  const failedPercent = (failedRate * 100).toFixed(1);

  const 总体数据区 = document.createElement("div");
  总体数据区.className = "结果分区";
  摘要层.appendChild(总体数据区);

  const 总前缀 = document.createElement("span");
  总前缀.className = "分区标题";
  总前缀.textContent = "总体数据";

  const 总次数容器 = document.createElement("span");
  总次数容器.className = "子容器";
  const 总次数前缀 = document.createElement("span");
  总次数前缀.className = "前缀";
  总次数前缀.textContent = "总次数";
  const 总次数值 = document.createElement("span");
  总次数值.className = "值";
  总次数值.textContent = 次数.toString();
  总次数容器.append(总次数前缀, 总次数值);

  const 正确次数容器 = document.createElement("span");
  正确次数容器.className = "子容器";
  const 正确次数前缀 = document.createElement("span");
  正确次数前缀.className = "前缀";
  正确次数前缀.textContent = "正确";
  const 正确次数值 = document.createElement("span");
  正确次数值.className = "值";
  正确次数值.textContent = passed.toString();
  正确次数容器.append(正确次数前缀, 正确次数值);

  const 错误次数容器 = document.createElement("span");
  错误次数容器.className = "子容器";
  const 错误次数前缀 = document.createElement("span");
  错误次数前缀.className = "前缀";
  错误次数前缀.textContent = "错误";
  const 错误次数值 = document.createElement("span");
  错误次数值.className = "值";
  错误次数值.textContent = failed.toString();
  错误次数容器.append(错误次数前缀, 错误次数值);

  const 正确率容器 = document.createElement("span");
  正确率容器.className = "子容器";
  const 正确率前缀 = document.createElement("span");
  正确率前缀.className = "前缀";
  正确率前缀.textContent = "正确率";
  const 正确率值 = document.createElement("span");
  正确率值.className = "值";
  正确率值.textContent = passedPercent.toString();
  const 正确百分比符号 = document.createElement("span");
  正确百分比符号.className = "单位";
  正确百分比符号.textContent = "%";
  正确率容器.append(正确率前缀, 正确率值, 正确百分比符号);

  const 错误率容器 = document.createElement("span");
  错误率容器.className = "子容器";
  const 错误率前缀 = document.createElement("span");
  错误率前缀.className = "前缀";
  错误率前缀.textContent = "错误率";
  const 错误率值 = document.createElement("span");
  错误率值.className = "值";
  错误率值.textContent = failedPercent.toString();
  const 错误百分比符号 = document.createElement("span");
  错误百分比符号.className = "单位";
  错误百分比符号.textContent = "%";
  错误率容器.append(错误率前缀, 错误率值, 错误百分比符号);

  总体数据区.append(
    总前缀,
    总次数容器,
    正确次数容器,
    错误次数容器,
    正确率容器,
    错误率容器,
  );
  return 总体数据区;
}

function 获取当前时间() {
  const dateTime = new Date();

  const 年 = document.createElement("span");
  年.className = "子容器";
  const 年值 = document.createElement("span");
  年值.className = "值";
  年值.textContent = dateTime.getFullYear().toString();
  const 年后缀 = document.createElement("span");
  年后缀.className = "单位";
  年后缀.textContent = "年";
  年.append(年值, 年后缀);

  const 月 = document.createElement("span");
  月.className = "子容器";
  const 月值 = document.createElement("span");
  月值.className = "值";
  月值.textContent = (dateTime.getMonth() + 1).toString();
  const 月后缀 = document.createElement("span");
  月后缀.className = "单位";
  月后缀.textContent = "月";
  月.append(月值, 月后缀);

  const 日 = document.createElement("span");
  日.className = "子容器";
  const 日值 = document.createElement("span");
  日值.className = "值";
  日值.textContent = dateTime.getDate().toString();
  const 日后缀 = document.createElement("span");
  日后缀.className = "单位";
  日后缀.textContent = "日";
  日.append(日值, 日后缀);

  const 时 = document.createElement("span");
  时.className = "子容器";
  const 时值 = document.createElement("span");
  时值.className = "值";
  时值.textContent = dateTime.getHours().toString();
  const 时后缀 = document.createElement("span");
  时后缀.className = "单位";
  时后缀.textContent = "时";
  时.append(时值, 时后缀);

  const 分 = document.createElement("span");
  分.className = "子容器";
  const 分值 = document.createElement("span");
  分值.className = "值";
  分值.textContent = dateTime.getMinutes().toString();
  const 分后缀 = document.createElement("span");
  分后缀.className = "单位";
  分后缀.textContent = "分";
  分.append(分值, 分后缀);

  const 秒 = document.createElement("span");
  秒.className = "子容器";
  const 秒值 = document.createElement("span");
  秒值.className = "值";
  秒值.textContent = dateTime.getSeconds().toString();
  const 秒后缀 = document.createElement("span");
  秒后缀.className = "单位";
  秒后缀.textContent = "秒";
  秒.append(秒值, 秒后缀);

  const 日期 = document.createElement("span");
  日期.className = "父容器";
  日期.append(年, 月, 日);
  const 时间 = document.createElement("span");
  时间.className = "父容器";
  时间.append(时, 分, 秒);

  return {
    日期: 日期,
    时间: 时间,
  };
}

function 生成详情() {
  const 详情层 = 结果对话框.querySelector(".详情层");
  详情层.innerHTML = "";
  详情层.classList.remove("显示详情");
  const 结果标题 = document.createElement("h2");
  结果标题.className = "结果标题";
  结果标题.textContent = "详情";

  const 显示摘要按钮 = document.getElementById("显示摘要");
  const 关闭对话框按钮_详情层 = document.getElementById("关闭对话框-详情层");

  详情层.append(结果标题, 显示摘要按钮, 关闭对话框按钮_详情层);
}

function 生成对话框按钮() {
  const 详情层 = 结果对话框.querySelector(".详情层");
  const 摘要层 = 结果对话框.querySelector(".摘要层");

  const 关闭摘要层按钮 = document.createElement("button");
  关闭摘要层按钮.id = "关闭对话框-摘要层";
  关闭摘要层按钮.className = "按钮";
  关闭摘要层按钮.textContent = "关闭";
  关闭摘要层按钮.addEventListener("click", () => {
    结果对话框.close();
  });

  const 关闭详情层按钮 = document.createElement("button");
  关闭详情层按钮.id = "关闭对话框-详情层";
  关闭详情层按钮.className = "按钮";
  关闭详情层按钮.textContent = "关闭";
  关闭详情层按钮.addEventListener("click", () => {
    结果对话框.close();
  });

  const 显示详情按钮 = document.createElement("button");
  显示详情按钮.id = "显示详情";
  显示详情按钮.className = "按钮";
  显示详情按钮.textContent = "详情";
  显示详情按钮.addEventListener("click", () => {
    详情层.classList.add("显示详情");
    摘要层.classList.add("隐藏摘要");
  });

  const 显示摘要按钮 = document.createElement("button");
  显示摘要按钮.id = "显示摘要";
  显示摘要按钮.className = "按钮";
  显示摘要按钮.textContent = "摘要";
  显示摘要按钮.addEventListener("click", () => {
    详情层.classList.remove("显示详情");
    摘要层.classList.remove("隐藏摘要");
  });

  结果对话框.prepend(
    关闭摘要层按钮,
    关闭详情层按钮,
    显示详情按钮,
    显示摘要按钮,
  );
}

取消测试按钮.addEventListener("click", () => {
  测试运行中 = false;
  测试面组[0].innerHTML = "";
  测试面组[1].innerHTML = "";
  旋转容器.style.transition = "none";
  旋转容器.style.rotate = "";
  setTimeout(() => {
    旋转容器.style.transition = "";
  }, 旋转用时);
  旋转角度 = 0;

  加油动画?.cancel();
  clearTimeout(测试开始延时函数);
  计次元素.textContent = "";
  斜杠元素.textContent = "";
  总数元素.textContent = "";

  测试起始时间 = 0;

  结果对话框.innerHTML = "";
  无结果时生成关闭按钮();
  查看结果按钮.disabled = false;
  提示类型区.classList.remove("禁用");

  window.removeEventListener("keydown", 屏蔽按下快捷键默认行为);
  window.removeEventListener("keydown", 按下快捷键封装器);
  window.removeEventListener("keyup", 松开快捷键封装器);
});

function 无结果时生成关闭按钮() {
  const 关闭对话框按钮 = document.createElement("button");
  关闭对话框按钮.id = "关闭对话框";
  关闭对话框按钮.className = "按钮";
  关闭对话框按钮.textContent = "关闭";
  结果对话框.appendChild(关闭对话框按钮);
  关闭对话框按钮.addEventListener("click", () => {
    结果对话框.close();
  });
}

function 生成结果时删除关闭按钮() {
  const 关闭对话框按钮 = document.getElementById("关闭对话框");
  关闭对话框按钮?.remove();
}

function 生成摘要层与详情层() {
  const 详情层 = document.createElement("div");
  详情层.className = "详情层";
  const 摘要层 = document.createElement("div");
  摘要层.className = "摘要层";
  结果对话框.append(详情层, 摘要层);
}
