const root = document.querySelector(":root");

let 姓名 = "";
let 次数 = 10;
let 剩余次数 = 次数;
let 测试运行中 = false;
let 旋转角度 = 0;
const 旋转用时 = root.style.getPropertyValue("--旋转用时");
let 旋转延时id = null;
const 旋转容器 = document.querySelector(".测试容器-旋转");

const 测试对象组 = [];
const 测试对象池 = [];
const 列表项容器组 = document.querySelectorAll(".列表项容器");
for (const [index, 容器] of 列表项容器组.entries()) {
  容器.id = `${index}`;
}
const 开始按钮 = document.querySelector("#run");
const 测试面组 = document.querySelectorAll(".测试面");

const 快捷键种类区 = document.querySelector(".快捷键种类区");
const 快捷键列表区 = document.querySelector(".快捷键列表区");
// 快捷键列表区.style.width = window.getComputedStyle(快捷键种类区).width;
const 快捷键种类组 = 快捷键种类区.querySelectorAll(".快捷键种类");
const 快捷键列表组 = 快捷键列表区.querySelectorAll(".快捷键列表");
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
    });
  }
}

function 添加测试对象(列表项容器) {
  const 功能键组 = 列表项容器.querySelectorAll(".功能键");
  const 按键 = 列表项容器.querySelector(".按键");
  const 测试对象 = {
    id: 列表项容器.id,
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
    key: "",
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

    测试对象.key = 按键.textContent.trim();
  }

  测试对象池.push(测试对象);
}

function 删除测试对象(列表项容器) {
  const 删除对象索引 = 测试对象池.findIndex(
    (item) => item.id === 列表项容器.id,
  );
  测试对象池.splice(删除对象索引, 1);
}

const 姓名框 = document.getElementById("姓名");
姓名框.addEventListener("input", 输入姓名);

const 次数框 = document.getElementById("测试次数");
次数框.addEventListener("input", 更新次数);

开始按钮.addEventListener("click", () => {
  测试运行中 = !测试运行中;

  if (!测试运行中) {
    return;
  }

  if (测试对象池.length === 0 || 次数 <= 0) {
    生成错误信息();
    return;
  }

  测试对象组.length = 0;
  生成测试对象组();

  测试面组[剩余次数 % 2].innerHTML = "";
  测试面组[剩余次数 % 2].append(
    生成测试目标(次数, 剩余次数),
    生成用户按键信息前缀(),
  );

  window.addEventListener("keydown", 按下快捷键封装器);

  /*window.addEventListener("keydown", (event) => {
    event.preventDefault();
    if (event.repeat) {
      return;
    }
    const 用户快捷键内容 =
      测试面组[剩余次数 % 2].querySelector(".用户快捷键内容");
    用户快捷键内容.innerHTML = "";
    const 描述 = document.createElement("span");
    描述.className = "测试描述";
    描述.textContent = "您的输入";
    用户快捷键内容.appendChild(描述);

    let ctrl = null;
    let alt = null;
    let shift = null;
    let meta = null;
    const key = event.key;
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
      } else if (ctrl) {
        ctrl.after(meta);
        meta.before(生成连接符());
      } else {
        描述.after(meta);
      }
    }

    if (key >= "a" && key <= "z") {
      const keyElement = document.createElement("span");
      keyElement.className = "按键";
      keyElement.usage = key.toUpperCase();
      keyElement.textContent = key.toUpperCase();
      用户快捷键内容.appendChild(keyElement);
      keyElement.before(生成连接符());

      const 测试对象 = 测试对象组[次数 - 剩余次数];

      剩余次数--;
      测试面组[剩余次数 % 2].innerHTML = "";
      测试面组[剩余次数 % 2].append(
        生成测试目标(次数, 剩余次数),
        生成用户按键信息前缀(),
      );
      旋转角度 += 180;
      旋转延时id = setTimeout(() => {
        旋转容器.style.rotate = `y ${旋转角度}deg`;
      }, 1000);
    }

    if (剩余次数 <= 0) {
      window.removeEventListener("keydown", 按下快捷键);
    }
  });*/

  window.addEventListener("keyup", 松开快捷键);
});

const 按下快捷键封装器 = function (event) {
  按下快捷键(event);
};

function 按下快捷键(event) {
  event.preventDefault();
  if (event.repeat) {
    return;
  }
  const 用户快捷键内容 =
    测试面组[剩余次数 % 2].querySelector(".用户快捷键内容");
  用户快捷键内容.innerHTML = "";
  const 描述 = document.createElement("span");
  描述.className = "测试描述";
  描述.textContent = "您的输入";
  用户快捷键内容.appendChild(描述);

  let ctrl = null;
  let alt = null;
  let shift = null;
  let meta = null;
  const key = event.key;
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
    } else if (ctrl) {
      ctrl.after(meta);
      meta.before(生成连接符());
    } else {
      描述.after(meta);
    }
  }

  if (key >= "a" && key <= "z") {
    const keyElement = document.createElement("span");
    keyElement.className = "按键";
    keyElement.usage = key.toUpperCase();
    keyElement.textContent = key.toUpperCase();
    用户快捷键内容.appendChild(keyElement);
    keyElement.before(生成连接符());

    剩余次数--;
    if (剩余次数 > 0) {
      测试面组[剩余次数 % 2].innerHTML = "";
      测试面组[剩余次数 % 2].append(
        生成测试目标(次数, 剩余次数),
        生成用户按键信息前缀(),
      );
      旋转角度 += 180;
      旋转延时id = setTimeout(() => {
        旋转容器.style.rotate = `y ${旋转角度}deg`;
      }, 1000);
    }
  }

  if (剩余次数 <= 0) {
    window.removeEventListener("keydown", 按下快捷键封装器);
  }

  console.log(剩余次数);
}

function 松开快捷键(event) {
  if (剩余次数 <= 0) {
    window.removeEventListener("keyup", 松开快捷键);
  }
}

function 生成测试对象组() {
  for (let i = 0; i < 次数; i++) {
    const 随机索引 = Math.floor(Math.random() * 测试对象池.length);
    测试对象组.push(测试对象池[随机索引]);
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
  key.textContent = 测试对象.key.toUpperCase();
  快捷键内容.appendChild(key);

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

function 生成连接符() {
  const 连接符 = document.createElement("span");
  连接符.className = "连接符";
  连接符.textContent = "+";
  return 连接符;
}

function 生成错误信息() {
  const 错误文字层 = document.querySelector(".错误文字层");
  const 错误动画层 = document.querySelector(".错误动画层");
  if (测试对象池.length === 0) {
    错误文字层.textContent = "没有选择任何快捷键";
  } else if (次数 === 0) {
    错误文字层.textContent = "测试次数为0";
  }
}
