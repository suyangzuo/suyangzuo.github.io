const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);

const 控制区 = document.getElementsByClassName("控制区")[0];
const 颜色区 = document.getElementsByClassName("颜色区")[0];

const 阴影包围框垂直偏移 =
  rootStyle.getPropertyValue("--当前阴影代码包围框垂直偏移");

const 阴影内嵌复选框 = document.getElementById("shadow-inset");
const 滑块组 = document.querySelectorAll('input[type="range"]');
const 滑块_x轴偏移 = document.getElementById("x轴偏移");
const 滑块_y轴偏移 = document.getElementById("y轴偏移");
const 滑块_模糊半径 = document.getElementById("模糊半径");
const 滑块_扩散半径 = document.getElementById("扩散半径");

const 增加阴影数量按钮 = document.getElementsByClassName("增加阴影数量按钮")[0];
const 阴影列表 = document.getElementsByClassName("阴影列表")[0];

let 阴影序号池 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const 已加入序号池 = [];
let 当前阴影序号 = -1;

const 本体 = document.getElementsByClassName("本体")[0];

const 颜色选择器 = document.getElementById("颜色选择器");
const 红值 = document.getElementsByClassName("红值")[0];
const 绿值 = document.getElementsByClassName("绿值")[0];
const 蓝值 = document.getElementsByClassName("蓝值")[0];

const 代码区 = document.getElementsByClassName("代码区")[0];
const 代码文本元素 = 代码区.getElementsByClassName("代码文本")[0];

const 阴影属性组 = new Array(阴影序号池.length);
for (let i = 0; i < 阴影属性组.length; i++) {
  阴影属性组[i] = {
    内嵌: "",
    x轴偏移: 0,
    y轴偏移: 0,
    模糊半径: 0,
    扩散半径: 0,
    红: 0,
    绿: 0,
    蓝: 0,
    透明度: 1,
    颜色: `rgba(${this.红}, ${this.绿}, ${this.蓝}, ${this.透明度})`,
    完整代码: "",
  };
}

function 清空阴影属性(阴影属性) {
  阴影属性.内嵌 = "";
  阴影属性.x轴偏移 = 0;
  阴影属性.y轴偏移 = 0;
  阴影属性.模糊半径 = 0;
  阴影属性.扩散半径 = 0;
  阴影属性.红 = Math.floor(Math.random() * 256);
  阴影属性.绿 = Math.floor(Math.random() * 256);
  阴影属性.蓝 = Math.floor(Math.random() * 256);
  阴影属性.透明度 = 1;
  阴影属性.颜色 = `rgba(${阴影属性.红}, ${阴影属性.绿}, ${阴影属性.蓝}, ${阴影属性.透明度})`;
  阴影属性.完整代码 = "";
}

function 初始化阴影属性(阴影属性) {
  阴影属性.内嵌 = "";
  阴影属性.x轴偏移 = 10;
  阴影属性.y轴偏移 = 10;
  阴影属性.模糊半径 = 0;
  阴影属性.扩散半径 = 0;
  阴影属性.红 = Math.floor(Math.random() * 256);
  阴影属性.绿 = Math.floor(Math.random() * 256);
  阴影属性.蓝 = Math.floor(Math.random() * 256);
  阴影属性.透明度 = 1;
  阴影属性.颜色 = `rgba(${阴影属性.红}, ${阴影属性.绿}, ${阴影属性.蓝}, ${阴影属性.透明度})`;
  阴影属性.完整代码 = `${阴影属性.内嵌} ${阴影属性.x轴偏移}px ${阴影属性.y轴偏移}px ${阴影属性.模糊半径}px ${阴影属性.扩散半径}px ${阴影属性.颜色}`;
  return 阴影属性;
}

增加阴影数量按钮.addEventListener("click", 点击增加阴影数量按钮);

function 点击增加阴影数量按钮(event) {
  if (阴影序号池.length === 0) return;
  const 阴影项 = document.createElement("li");
  阴影项.className = "阴影项";
  阴影列表.appendChild(阴影项);
  const 阴影颜色标记 = document.createElement("span");
  阴影颜色标记.className = "阴影颜色标记";
  阴影项.appendChild(阴影颜色标记);
  const 阴影文本 = document.createElement("span");
  阴影文本.textContent = "阴影";
  阴影项.appendChild(阴影文本);
  const 序号元素 = document.createElement("span");
  序号元素.className = "阴影序号";
  const 序号 = 阴影序号池.shift();
  已加入序号池.push(序号);
  已加入序号池.sort((a, b) => a - b);
  阴影项.setAttribute("序号", 序号);
  序号元素.textContent = 序号;
  阴影项.appendChild(序号元素);
  if (阴影序号池.length === 0) {
    event.currentTarget.setAttribute("已屏蔽", "");
  }
  const 删除阴影按钮 = document.createElement("span");
  删除阴影按钮.className = "删除阴影按钮";
  删除阴影按钮.textContent = " \u2a2f";
  阴影项.appendChild(删除阴影按钮);
  阴影项.addEventListener("click", 点击阴影项);
  删除阴影按钮.addEventListener("click", 点击删除阴影按钮);
  阴影列表.children[序号 - 1].before(阴影项);

  初始化阴影属性(阴影属性组[序号 - 1]);
  阴影颜色标记.style.backgroundColor = 阴影属性组[序号 - 1].颜色;
  更新阴影和代码();
  const 单个阴影代码组 = 代码区.querySelectorAll(".单个阴影代码");

  let 代码序号 = 已加入序号池.indexOf(当前阴影序号);
  if (阴影序号池.length === 10 || 代码序号 === -1) {
    root.style.setProperty("--当前阴影代码包围框可见性", "hidden");
    root.style.setProperty("--当前阴影代码包围框透明度", "0%");
    root.style.setProperty("--当前阴影代码包围框垂直偏移", 阴影包围框垂直偏移);
  } else {
    root.style.setProperty(
      "--当前阴影代码包围框垂直偏移",
      `${单个阴影代码组[代码序号].offsetTop + 1}px`,
    );
  }
}

function 更新阴影和代码() {
  const 有效属性组 = 阴影属性组.filter((阴影属性) => 阴影属性.完整代码 !== "");
  const 有效代码组 = [];
  有效属性组.forEach((属性) => {
    有效代码组.push(属性.完整代码);
  });
  本体.style.boxShadow = `${有效代码组.join(",")}`;
  打印代码(有效代码组);
}

let 之前选中阴影项 = null;

function 点击阴影项(event) {
  控制区.removeAttribute("已屏蔽");
  颜色区.removeAttribute("已屏蔽");
  const 所有阴影项 = document.querySelectorAll(".阴影项");
  所有阴影项.forEach((项) => {
    项.style.pointerEvents = "none";
  });
  const 阴影项 = event.currentTarget;
  阴影项.setAttribute("已选中", "");
  if (之前选中阴影项 !== null && 之前选中阴影项 !== 阴影项) {
    之前选中阴影项.removeAttribute("已选中");
  }
  之前选中阴影项 = 阴影项;
  const 序号 = parseInt(阴影项.getAttribute("序号"), 10);
  当前阴影序号 = 序号;
  const 阴影属性 = 阴影属性组[序号 - 1];
  根据阴影参数修改控件(阴影属性);

  获取16进制颜色(阴影属性);

  本体.style.transition = "box-shadow 250ms";
  阴影属性.模糊半径 = parseInt(阴影属性.模糊半径, 10) + 20;
  阴影属性.扩散半径 = parseInt(阴影属性.扩散半径, 10) + 40;
  阴影属性.完整代码 = `${阴影属性.内嵌} ${阴影属性.x轴偏移}px ${阴影属性.y轴偏移}px ${阴影属性.模糊半径}px ${阴影属性.扩散半径}px ${阴影属性.颜色}`;

  root.style.setProperty("--当前阴影代码包围框可见性", "visible");
  root.style.setProperty("--当前阴影代码包围框透明度", "100%");
  let 代码序号 = 已加入序号池.indexOf(当前阴影序号);
  const 单个阴影代码组 = 代码区.querySelectorAll(".单个阴影代码");
  root.style.setProperty(
    "--当前阴影代码包围框垂直偏移",
    `${单个阴影代码组[代码序号].offsetTop + 1}px`,
  );

  const 有效属性组 = 阴影属性组.filter((阴影属性) => 阴影属性.完整代码 !== "");
  const 有效代码组 = [];
  有效属性组.forEach((属性) => {
    有效代码组.push(属性.完整代码);
  });
  本体.style.boxShadow = `${有效代码组.join(",")}`;
  setTimeout(() => {
    阴影属性.模糊半径 -= 20;
    阴影属性.扩散半径 -= 40;
    阴影属性.完整代码 = `${阴影属性.内嵌} ${阴影属性.x轴偏移}px ${阴影属性.y轴偏移}px ${阴影属性.模糊半径}px ${阴影属性.扩散半径}px ${阴影属性.颜色}`;

    const 有效属性组 = 阴影属性组.filter(
      (阴影属性) => 阴影属性.完整代码 !== "",
    );
    const 有效代码组 = [];
    有效属性组.forEach((属性) => {
      有效代码组.push(属性.完整代码);
    });
    本体.style.boxShadow = `${有效代码组.join(",")}`;
    // 本体.style.transition = "none";
    所有阴影项.forEach((项) => {
      项.style.pointerEvents = "all";
    });
  }, 250);
}

function 点击删除阴影按钮(event) {
  event.stopPropagation();
  const 阴影项 = event.currentTarget.parentElement;
  // const 序号 = event.currentTarget.previousElementSibling.textContent;
  const 序号 = parseInt(阴影项.getAttribute("序号"), 10);
  if (序号 === 当前阴影序号) {
    当前阴影序号 = -1;
  }
  let index = 已加入序号池.indexOf(parseInt(序号, 10));
  已加入序号池.splice(index, 1);
  已加入序号池.sort((a, b) => a - b);
  阴影序号池.push(序号);
  阴影序号池.sort((a, b) => a - b);
  if (阴影序号池.length > 0) {
    增加阴影数量按钮.removeAttribute("已屏蔽");
  }
  阴影项.remove();
  清空阴影属性(阴影属性组[序号 - 1]);
  更新阴影和代码();
  const 单个阴影代码组 = 代码区.querySelectorAll(".单个阴影代码");

  let 代码序号 = 已加入序号池.indexOf(当前阴影序号);
  if (阴影序号池.length === 10 || 代码序号 === -1) {
    控制区.setAttribute("已屏蔽", "");
    颜色区.setAttribute("已屏蔽", "");
    root.style.setProperty("--当前阴影代码包围框可见性", "hidden");
    root.style.setProperty("--当前阴影代码包围框透明度", "0%");
    // root.style.setProperty("--当前阴影代码包围框垂直偏移", 阴影包围框垂直偏移);
  } else {
    root.style.setProperty(
      "--当前阴影代码包围框垂直偏移",
      `${单个阴影代码组[代码序号].offsetTop + 1}px`,
    );
  }
}

const x轴偏移 = document.getElementById("x轴偏移");
const y轴偏移 = document.getElementById("y轴偏移");
const 模糊半径 = document.getElementById("模糊半径");
const 扩散半径 = document.getElementById("扩散半径");
x轴偏移.setAttribute("x轴偏移值", x轴偏移.value);
y轴偏移.setAttribute("y轴偏移值", y轴偏移.value);
模糊半径.setAttribute("模糊半径值", 模糊半径.value);
扩散半径.setAttribute("扩散半径值", 扩散半径.value);
x轴偏移.addEventListener("input", 修改滑块比率);
y轴偏移.addEventListener("input", 修改滑块比率);
模糊半径.addEventListener("input", 修改滑块比率);
扩散半径.addEventListener("input", 修改滑块比率);

function 修改滑块比率(event) {
  本体.style.transition = "none";
  let 滑块 = event.currentTarget;
  非操作性修改滑块比率(滑块);
  根据参数调整对应阴影效果(当前阴影序号);

  const 有效属性组 = 阴影属性组.filter((阴影属性) => 阴影属性.完整代码 !== "");
  const 有效代码组 = [];
  有效属性组.forEach((属性) => {
    有效代码组.push(属性.完整代码);
  });
  打印代码(有效代码组);
}

function 非操作性修改滑块比率(滑块) {
  let value = parseInt(滑块.value, 10);
  let max = parseInt(滑块.max, 10);
  let min = parseInt(滑块.min, 10);
  let id = 滑块.id;
  let 比率 = `${
    ((id === "模糊半径" ? value : value + max) / (max - min)) * 100
  }%`;
  root.style.setProperty(`--${id}比率`, 比率);

  调整滑块位置(滑块);
}

function 调整滑块位置(滑块) {
  let id = 滑块.id;
  let 补充名称 = id === "模糊半径" || id === "扩散半径" ? "偏移" : "";
  const 当前值 = 滑块.value;
  const 修正min = 滑块.min ? 滑块.min : 0;
  const 修正max = 滑块.max ? 滑块.max : 100;
  const 修正值 = Number(((当前值 - 修正min) * 100) / (修正max - 修正min));
  /*root.style.setProperty(
    `--${id}${补充名称}`,
    `calc(${修正值}% + (${8 - 修正值 * 0.15}px))`,
  );*/
  root.style.setProperty(
    `--${id}${补充名称}`,
    `calc(${修正值}% + ${(50 - 修正值) * 0.18}px)`,
  );
  滑块.setAttribute(`${id}值`, 当前值);

  const 减少按钮 = 滑块.parentElement.previousElementSibling;
  const 增加按钮 = 滑块.parentElement.nextElementSibling;
  if (滑块.value === 滑块.min) {
    减少按钮.setAttribute("已屏蔽", "");
  } else if (滑块.value === 滑块.max) {
    增加按钮.setAttribute("已屏蔽", "");
  } else {
    减少按钮.removeAttribute("已屏蔽");
    增加按钮.removeAttribute("已屏蔽");
  }
}

function 根据参数调整对应阴影效果(序号) {
  if (序号 === -1) return;
  const 阴影属性 = 阴影属性组[序号 - 1];
  阴影属性.内嵌 = 阴影内嵌复选框.checked ? "inset" : "";
  阴影属性.x轴偏移 = 滑块_x轴偏移.value;
  阴影属性.y轴偏移 = 滑块_y轴偏移.value;
  阴影属性.模糊半径 = 滑块_模糊半径.value;
  阴影属性.扩散半径 = 滑块_扩散半径.value;
  阴影属性.完整代码 = `${阴影属性.内嵌} ${阴影属性.x轴偏移}px ${阴影属性.y轴偏移}px ${阴影属性.模糊半径}px ${阴影属性.扩散半径}px ${阴影属性.颜色}`;

  const 有效属性组 = 阴影属性组.filter((阴影属性) => 阴影属性.完整代码 !== "");
  const 有效代码组 = [];
  有效属性组.forEach((属性) => {
    有效代码组.push(属性.完整代码);
  });
  本体.style.boxShadow = `${有效代码组.join(",")}`;
}

const 加减按钮组 = document.getElementsByClassName("阴影属性按钮");
Array.from(加减按钮组).forEach((按钮) => {
  按钮.addEventListener("mousedown", 点击增加或减少按钮);
});

function 点击增加或减少按钮(event) {
  const 按钮 = event.currentTarget;
  const 滑块区 = 按钮.className.includes("减")
    ? 按钮.nextElementSibling
    : 按钮.previousElementSibling;
  const 滑块 = 滑块区.querySelector('input[type="range"]');
  let id = 滑块.id;
  if (按钮.className.includes("减")) {
    滑块.value--;
  } else if (按钮.className.includes("加")) {
    滑块.value++;
  }

  let value = parseInt(滑块.value, 10);
  let max = parseInt(滑块.max, 10);
  let min = parseInt(滑块.min, 10);
  let 比率 = `${
    ((id === "模糊半径" ? value : value + max) / (max - min)) * 100
  }%`;
  root.style.setProperty(`--${id}比率`, 比率);

  调整滑块位置(滑块);
  根据参数调整对应阴影效果(当前阴影序号);
  const 有效属性组 = 阴影属性组.filter((阴影属性) => 阴影属性.完整代码 !== "");
  const 有效代码组 = [];
  有效属性组.forEach((属性) => {
    有效代码组.push(属性.完整代码);
  });
  打印代码(有效代码组);
}

阴影内嵌复选框.addEventListener("click", 点击阴影内嵌复选框);

function 点击阴影内嵌复选框(event) {
  const 复选框 = event.currentTarget;
  if (复选框.checked) {
    root.style.setProperty("--阴影内嵌浮动层左偏移", "55%");
    root.style.setProperty("--阴影内嵌浮动层背景色", "rgb(0,210,136)");
  } else {
    root.style.setProperty("--阴影内嵌浮动层左偏移", "0%");
    root.style.setProperty("--阴影内嵌浮动层背景色", "rgb(152, 58, 58)");
  }

  根据参数调整对应阴影效果(当前阴影序号);
  const 有效属性组 = 阴影属性组.filter((阴影属性) => 阴影属性.完整代码 !== "");
  const 有效代码组 = [];
  有效属性组.forEach((属性) => {
    有效代码组.push(属性.完整代码);
  });
  打印代码(有效代码组);
}

function 根据阴影参数修改控件(阴影属性) {
  阴影内嵌复选框.checked = 阴影属性.内嵌 === "inset" ? true : false;
  if (阴影内嵌复选框.checked) {
    root.style.setProperty("--阴影内嵌浮动层左偏移", "55%");
    root.style.setProperty("--阴影内嵌浮动层背景色", "rgb(0,210,136)");
  } else {
    root.style.setProperty("--阴影内嵌浮动层左偏移", "0%");
    root.style.setProperty("--阴影内嵌浮动层背景色", "rgb(152, 58, 58)");
  }
  滑块_x轴偏移.value = 阴影属性.x轴偏移;
  滑块_y轴偏移.value = 阴影属性.y轴偏移;
  滑块_模糊半径.value = 阴影属性.模糊半径;
  滑块_扩散半径.value = 阴影属性.扩散半径;
  非操作性修改滑块比率(滑块_x轴偏移);
  非操作性修改滑块比率(滑块_y轴偏移);
  非操作性修改滑块比率(滑块_模糊半径);
  非操作性修改滑块比率(滑块_扩散半径);
}

颜色选择器.addEventListener("input", 修改颜色);

function 修改颜色() {
  const red = parseInt(`0x${颜色选择器.value.slice(1, 3)}`, 16);
  const green = parseInt(`0x${颜色选择器.value.slice(3, 5)}`, 16);
  const blue = parseInt(`0x${颜色选择器.value.slice(5, 7)}`, 16);
  红值.textContent = red;
  绿值.textContent = green;
  蓝值.textContent = blue;
  if (当前阴影序号 === -1) return;

  const 阴影属性 = 阴影属性组[当前阴影序号 - 1];
  阴影属性.红 = red;
  阴影属性.绿 = green;
  阴影属性.蓝 = blue;
  阴影属性.颜色 = `rgba(${阴影属性.红}, ${阴影属性.绿}, ${阴影属性.蓝}, ${阴影属性.透明度})`;

  阴影属性.完整代码 = `${阴影属性.内嵌} ${阴影属性.x轴偏移}px ${阴影属性.y轴偏移}px ${阴影属性.模糊半径}px ${阴影属性.扩散半径}px ${阴影属性.颜色}`;

  const 当前阴影颜色标记 =
    之前选中阴影项.getElementsByClassName("阴影颜色标记")[0];
  当前阴影颜色标记.style.backgroundColor = 阴影属性.颜色;

  const 有效属性组 = 阴影属性组.filter((阴影属性) => 阴影属性.完整代码 !== "");
  const 有效代码组 = [];
  有效属性组.forEach((属性) => {
    有效代码组.push(属性.完整代码);
  });
  本体.style.boxShadow = `${有效代码组.join(",")}`;
  打印代码(有效代码组);
}

function 获取16进制颜色(阴影属性) {
  const 红_dec = 阴影属性.红;
  const 绿_dec = 阴影属性.绿;
  const 蓝_dec = 阴影属性.蓝;
  const 红_hex = 红_dec.toString(16).padStart(2, "0");
  const 绿_hex = 绿_dec.toString(16).padStart(2, "0");
  const 蓝_hex = 蓝_dec.toString(16).padStart(2, "0");
  颜色选择器.value = `#${红_hex}${绿_hex}${蓝_hex}`;
  红值.textContent = 阴影属性.红;
  绿值.textContent = 阴影属性.绿;
  蓝值.textContent = 阴影属性.蓝;
}

function 打印代码(有效代码组) {
  if (有效代码组.length === 0) {
    代码文本元素.innerHTML = "";
    return;
  }
  代码文本元素.textContent = "";
  const 代码属性元素 = document.createElement("span");
  代码属性元素.className = "阴影代码抬头";
  代码属性元素.textContent = "box-shadow:";
  代码文本元素.appendChild(代码属性元素);
  for (const 有效代码 of 有效代码组) {
    const 代码元素 = document.createElement("span");
    代码元素.className = "单个阴影代码";
    代码元素.textContent = 有效代码;
    代码文本元素.appendChild(代码元素);
  }
}

window.addEventListener("load", () => {
  const 重置按钮 = document.getElementsByClassName("重置按钮")[0];
  重置按钮.addEventListener("click", 重置参数);
});

function 重置参数(event) {
  本体.style.transition = "none";
  增加阴影数量按钮.removeAttribute("已屏蔽");
  阴影列表.innerHTML = "";
  阴影序号池 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  当前阴影序号 = -1;
  之前选中阴影项 = null;
  for (let i = 0; i < 阴影属性组.length; i++) {
    阴影属性组[i] = {
      内嵌: "",
      x轴偏移: 0,
      y轴偏移: 0,
      模糊半径: 0,
      扩散半径: 0,
      红: 0,
      绿: 0,
      蓝: 0,
      透明度: 1,
      颜色: `rgba(${this.红}, ${this.绿}, ${this.蓝}, ${this.透明度})`,
      完整代码: "",
    };
  }

  阴影内嵌复选框.checked = false;
  if (阴影内嵌复选框.checked) {
    root.style.setProperty("--阴影内嵌浮动层左偏移", "55%");
    root.style.setProperty("--阴影内嵌浮动层背景色", "rgb(0,210,136)");
  } else {
    root.style.setProperty("--阴影内嵌浮动层左偏移", "0%");
    root.style.setProperty("--阴影内嵌浮动层背景色", "rgb(152, 58, 58)");
  }
  x轴偏移.value = 0;
  y轴偏移.value = 0;
  模糊半径.value = 0;
  扩散半径.value = 0;

  Array.from(加减按钮组).forEach((按钮) => {
    if (
      按钮.className.includes("减") &&
      按钮.parentElement.classList.contains("模糊半径")
    ) {
      按钮.setAttribute("已屏蔽", "");
      return;
    }
    按钮.removeAttribute("已屏蔽");
  });

  滑块组.forEach((滑块) => {
    let value = parseInt(滑块.value, 10);
    let max = parseInt(滑块.max, 10);
    let min = parseInt(滑块.min, 10);
    let id = 滑块.id;
    let 比率 = `${
      ((id === "模糊半径" ? value : value + max) / (max - min)) * 100
    }%`;
    root.style.setProperty(`--${id}比率`, 比率);
    let 补充名称 = id === "模糊半径" || id === "扩散半径" ? "偏移" : "";
    const 当前值 = 滑块.value;
    const 修正min = 滑块.min ? 滑块.min : 0;
    const 修正max = 滑块.max ? 滑块.max : 100;
    const 修正值 = Number(((当前值 - 修正min) * 100) / (修正max - 修正min));
    root.style.setProperty(
      `--${id}${补充名称}`,
      `calc(${修正值}% + (${8 - 修正值 * 0.15}px))`,
    );
    滑块.setAttribute(`${id}值`, 当前值);
  });

  红值.textContent = 0;
  绿值.textContent = 0;
  蓝值.textContent = 0;

  颜色选择器.value = "#000000";

  本体.style.boxShadow = "";
  代码文本元素.textContent = "";

  root.style.setProperty("--当前阴影代码包围框可见性", "hidden");
  root.style.setProperty("--当前阴影代码包围框透明度", "0%");
  root.style.setProperty("--当前阴影代码包围框垂直偏移", 阴影包围框垂直偏移);
  已加入序号池.length = 0;

  控制区.setAttribute("已屏蔽", "");
  颜色区.setAttribute("已屏蔽", "");
}
