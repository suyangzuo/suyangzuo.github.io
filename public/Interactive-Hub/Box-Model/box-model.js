const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);

const 第1盒 = document.querySelector(".第1盒");
const 第2盒 = document.querySelector(".第2盒");
const 第3盒 = document.querySelector(".第3盒");
const 第4盒 = document.querySelector(".第4盒");

const 边框盒子点击范围 = document.querySelector(".边框盒子");
const 内容盒子点击范围 = document.querySelector(".内容盒子");
const 边框盒子选择radio = document.getElementById("边框盒子");
const 内容盒子选择radio = document.getElementById("内容盒子");

const 外边距_上_范围条 = document.getElementById("外边距上");
const 外边距_右_范围条 = document.getElementById("外边距右");
const 外边距_下_范围条 = document.getElementById("外边距下");
const 外边距_左_范围条 = document.getElementById("外边距左");

const 外边距_上_数字 = document.querySelector(".外边距上 .值-数字");
const 外边距_右_数字 = document.querySelector(".外边距右 .值-数字");
const 外边距_下_数字 = document.querySelector(".外边距下 .值-数字");
const 外边距_左_数字 = document.querySelector(".外边距左 .值-数字");

const 边框_上_范围条 = document.getElementById("边框上");
const 边框_右_范围条 = document.getElementById("边框右");
const 边框_下_范围条 = document.getElementById("边框下");
const 边框_左_范围条 = document.getElementById("边框左");

const 边框_上_数字 = document.querySelector(".边框上 .值-数字");
const 边框_右_数字 = document.querySelector(".边框右 .值-数字");
const 边框_下_数字 = document.querySelector(".边框下 .值-数字");
const 边框_左_数字 = document.querySelector(".边框左 .值-数字");

const 内边距_上_范围条 = document.getElementById("内边距上");
const 内边距_右_范围条 = document.getElementById("内边距右");
const 内边距_下_范围条 = document.getElementById("内边距下");
const 内边距_左_范围条 = document.getElementById("内边距左");

const 内边距_上_数字 = document.querySelector(".内边距上 .值-数字");
const 内边距_右_数字 = document.querySelector(".内边距右 .值-数字");
const 内边距_下_数字 = document.querySelector(".内边距下 .值-数字");
const 内边距_左_数字 = document.querySelector(".内边距左 .值-数字");

const 内容_宽_范围条 = document.getElementById("内容宽");
const 内容_高_范围条 = document.getElementById("内容高");

const 内容_宽_数字 = document.querySelector(".内容宽 .值-数字");
const 内容_高_数字 = document.querySelector(".内容高 .值-数字");

let 内容宽 = 内容_宽_范围条.value;
let 内容高 = 内容_高_范围条.value;

let 内边距上 = 内边距_上_范围条.value;
let 内边距右 = 内边距_右_范围条.value;
let 内边距下 = 内边距_下_范围条.value;
let 内边距左 = 内边距_左_范围条.value;

let 边框上 = 边框_上_范围条.value;
let 边框右 = 边框_右_范围条.value;
let 边框下 = 边框_下_范围条.value;
let 边框左 = 边框_左_范围条.value;

let 外边距上 = 外边距_上_范围条.value;
let 外边距右 = 外边距_右_范围条.value;
let 外边距下 = 外边距_下_范围条.value;
let 外边距左 = 外边距_左_范围条.value;

内容_宽_范围条.oninput = 修改内容宽;
内容_高_范围条.oninput = 修改内容高;

内边距_上_范围条.oninput = 修改内边距上;
内边距_右_范围条.oninput = 修改内边距右;
内边距_下_范围条.oninput = 修改内边距下;
内边距_左_范围条.oninput = 修改内边距左;

边框_上_范围条.oninput = 修改边框上;
边框_右_范围条.oninput = 修改边框右;
边框_下_范围条.oninput = 修改边框下;
边框_左_范围条.oninput = 修改边框左;

外边距_上_范围条.oninput = 修改外边距上;
外边距_右_范围条.oninput = 修改外边距右;
外边距_下_范围条.oninput = 修改外边距下;
外边距_左_范围条.oninput = 修改外边距左;

const 选项 = document.querySelector(".选项");
const 单项 = 选项.querySelectorAll(".单项");
const 外边距_上下框 = 选项.querySelector("#外边距-上下关联-checkbox");
const 外边距_左右框 = 选项.querySelector("#外边距-左右关联-checkbox");
const 外边距_四向框 = 选项.querySelector("#外边距-四向关联-checkbox");
const 边框_上下框 = 选项.querySelector("#边框-上下关联-checkbox");
const 边框_左右框 = 选项.querySelector("#边框-左右关联-checkbox");
const 边框_四向框 = 选项.querySelector("#边框-四向关联-checkbox");
const 内边距_上下框 = 选项.querySelector("#内边距-上下关联-checkbox");
const 内边距_左右框 = 选项.querySelector("#内边距-左右关联-checkbox");
const 内边距_四向框 = 选项.querySelector("#内边距-四向关联-checkbox");

const 内容_宽高框 = 选项.querySelector("#内容-宽高关联-checkbox");

function 修改内容宽() {
  内容宽 = 内容_宽_范围条.value;
  内容_宽_数字.innerText = 内容宽;
  root.style.setProperty("--比率-盒子-内容-宽", `${内容宽}%`);
  if (内容_宽高框.checked) {
    内容_高_范围条.value = 内容宽;
    内容_高_数字.innerText = 内容宽;
    内容高 = 内容宽;
    root.style.setProperty("--比率-盒子-内容-高", `${内容高}%`);
  }
  修改盒子尺寸();
}

function 修改内容高() {
  内容高 = 内容_高_范围条.value;
  内容_高_数字.innerText = 内容高;
  root.style.setProperty("--比率-盒子-内容-高", `${内容高}%`);
  if (内容_宽高框.checked) {
    内容_宽_范围条.value = 内容高;
    内容_宽_数字.innerText = 内容高;
    内容宽 = 内容高;
    root.style.setProperty("--比率-盒子-内容-宽", `${内容宽}%`);
  }
  修改盒子尺寸();
}

function 修改内边距上() {
  内边距_上_数字.innerText = 内边距_上_范围条.value;
  内边距上 = 内边距_上_范围条.value;
  root.style.setProperty("--比率-内边距-上", `${内边距上}%`);
  if (内边距_四向框.checked) {
    let size = 内边距_上_范围条.value;
    四向关联时修改内边距尺寸(size);
  } else if (内边距_上下框.checked) {
    内边距_下_范围条.value = 内边距_上_范围条.value;
    内边距_下_数字.innerText = 内边距_下_范围条.value;
    内边距下 = 内边距_下_范围条.value;
    root.style.setProperty("--比率-内边距-下", `${内边距下}%`);
  }
  修改盒子尺寸();
}

function 修改内边距右() {
  内边距_右_数字.innerText = 内边距_右_范围条.value;
  内边距右 = 内边距_右_范围条.value;
  root.style.setProperty("--比率-内边距-右", `${内边距右}%`);
  if (内边距_四向框.checked) {
    let size = 内边距_右_范围条.value;
    四向关联时修改内边距尺寸(size);
  } else if (内边距_左右框.checked) {
    内边距_左_范围条.value = 内边距_右_范围条.value;
    内边距_左_数字.innerText = 内边距_右_范围条.value;
    内边距左 = 内边距_左_范围条.value;
    root.style.setProperty("--比率-内边距-左", `${内边距左}%`);
  }
  修改盒子尺寸();
}

function 修改内边距下() {
  内边距_下_数字.innerText = 内边距_下_范围条.value;
  内边距下 = 内边距_下_范围条.value;
  root.style.setProperty("--比率-内边距-下", `${内边距下}%`);
  if (内边距_四向框.checked) {
    let size = 内边距_下_范围条.value;
    四向关联时修改内边距尺寸(size);
  } else if (内边距_上下框.checked) {
    内边距_上_范围条.value = 内边距_下_范围条.value;
    内边距_上_数字.innerText = 内边距_下_范围条.value;
    内边距上 = 内边距_上_范围条.value;
    root.style.setProperty("--比率-内边距-上", `${内边距上}%`);
  }
  修改盒子尺寸();
}

function 修改内边距左() {
  内边距_左_数字.innerText = 内边距_左_范围条.value;
  内边距左 = 内边距_左_范围条.value;
  root.style.setProperty("--比率-内边距-左", `${内边距左}%`);
  if (内边距_四向框.checked) {
    let size = 内边距_左_范围条.value;
    四向关联时修改内边距尺寸(size);
  } else if (内边距_左右框.checked) {
    内边距_右_范围条.value = 内边距_左_范围条.value;
    内边距_右_数字.innerText = 内边距_左_范围条.value;
    内边距右 = 内边距_右_范围条.value;
    root.style.setProperty("--比率-内边距-右", `${内边距右}%`);
  }
  修改盒子尺寸();
}

function 修改边框上() {
  边框_上_数字.innerText = 边框_上_范围条.value;
  边框上 = 边框_上_范围条.value;
  root.style.setProperty("--比率-边框-上", `${边框上}%`);
  if (边框_四向框.checked) {
    let size = 边框_上_范围条.value;
    四向关联时修改边框尺寸(size);
  } else if (边框_上下框.checked) {
    边框_下_范围条.value = 边框_上_范围条.value;
    边框_下_数字.innerText = 边框_下_范围条.value;
    边框下 = 边框_下_范围条.value;
    root.style.setProperty("--比率-边框-下", `${边框下}%`);
  }
  修改盒子尺寸();
}

function 修改边框右() {
  边框_右_数字.innerText = 边框_右_范围条.value;
  边框右 = 边框_右_范围条.value;
  root.style.setProperty("--比率-边框-右", `${边框右}%`);
  if (边框_四向框.checked) {
    let size = 边框_右_范围条.value;
    四向关联时修改边框尺寸(size);
  } else if (边框_左右框.checked) {
    边框_左_范围条.value = 边框_右_范围条.value;
    边框_左_数字.innerText = 边框_右_范围条.value;
    边框左 = 边框_左_范围条.value;
    root.style.setProperty("--比率-边框-左", `${边框左}%`);
  }
  修改盒子尺寸();
}

function 修改边框下() {
  边框_下_数字.innerText = 边框_下_范围条.value;
  边框下 = 边框_下_范围条.value;
  root.style.setProperty("--比率-边框-下", `${边框下}%`);
  if (边框_四向框.checked) {
    let size = 边框_下_范围条.value;
    四向关联时修改边框尺寸(size);
  } else if (边框_上下框.checked) {
    边框_上_范围条.value = 边框_下_范围条.value;
    边框_上_数字.innerText = 边框_下_范围条.value;
    边框上 = 边框_上_范围条.value;
    root.style.setProperty("--比率-边框-上", `${边框上}%`);
  }
  修改盒子尺寸();
}

function 修改边框左() {
  边框_左_数字.innerText = 边框_左_范围条.value;
  边框左 = 边框_左_范围条.value;
  root.style.setProperty("--比率-边框-左", `${边框左}%`);
  if (边框_四向框.checked) {
    let size = 边框_左_范围条.value;
    四向关联时修改边框尺寸(size);
  } else if (边框_左右框.checked) {
    边框_右_范围条.value = 边框_左_范围条.value;
    边框_右_数字.innerText = 边框_左_范围条.value;
    边框右 = 边框_右_范围条.value;
    root.style.setProperty("--比率-边框-右", `${边框右}%`);
  }
  修改盒子尺寸();
}

function 修改外边距上() {
  外边距_上_数字.innerText = 外边距_上_范围条.value;
  外边距上 = 外边距_上_范围条.value;
  root.style.setProperty("--比率-外边距-上", `${外边距上}%`);
  if (外边距_四向框.checked) {
    let size = 外边距_上_范围条.value;
    四向关联时修改外边距尺寸(size);
  } else if (外边距_上下框.checked) {
    外边距_下_范围条.value = 外边距_上_范围条.value;
    外边距_下_数字.innerText = 外边距_下_范围条.value;
    外边距下 = 外边距_下_范围条.value;
    root.style.setProperty("--比率-外边距-下", `${外边距下}%`);
  }
  修改盒子尺寸();
}

function 修改外边距右() {
  外边距_右_数字.innerText = 外边距_右_范围条.value;
  外边距右 = 外边距_右_范围条.value;
  root.style.setProperty("--比率-外边距-右", `${外边距右}%`);
  if (外边距_四向框.checked) {
    let size = 外边距_右_范围条.value;
    四向关联时修改外边距尺寸(size);
  } else if (外边距_左右框.checked) {
    外边距_左_范围条.value = 外边距_右_范围条.value;
    外边距_左_数字.innerText = 外边距_右_范围条.value;
    外边距左 = 外边距_左_范围条.value;
    root.style.setProperty("--比率-外边距-左", `${外边距左}%`);
  }
  修改盒子尺寸();
}

function 修改外边距下() {
  外边距_下_数字.innerText = 外边距_下_范围条.value;
  外边距下 = 外边距_下_范围条.value;
  root.style.setProperty("--比率-外边距-下", `${外边距下}%`);
  if (外边距_四向框.checked) {
    let size = 外边距_下_范围条.value;
    四向关联时修改外边距尺寸(size);
  } else if (外边距_上下框.checked) {
    外边距_上_范围条.value = 外边距_下_范围条.value;
    外边距_上_数字.innerText = 外边距_下_范围条.value;
    外边距上 = 外边距_上_范围条.value;
    root.style.setProperty("--比率-外边距-上", `${外边距上}%`);
  }
  修改盒子尺寸();
}

function 修改外边距左() {
  外边距_左_数字.innerText = 外边距_左_范围条.value;
  外边距左 = 外边距_左_范围条.value;
  root.style.setProperty("--比率-外边距-左", `${外边距左}%`);
  if (外边距_四向框.checked) {
    let size = 外边距_左_范围条.value;
    四向关联时修改外边距尺寸(size);
  } else if (外边距_左右框.checked) {
    外边距_右_范围条.value = 外边距_左_范围条.value;
    外边距_右_数字.innerText = 外边距_左_范围条.value;
    外边距右 = 外边距_右_范围条.value;
    root.style.setProperty("--比率-外边距-右", `${外边距右}%`);
  }
  修改盒子尺寸();
}

function 四向关联时修改外边距尺寸(size) {
  外边距_上_范围条.value = size;
  外边距_下_范围条.value = size;
  外边距_左_范围条.value = size;
  外边距_右_范围条.value = size;
  外边距_上_数字.innerText = 外边距_上_范围条.value;
  外边距_右_数字.innerText = 外边距_右_范围条.value;
  外边距_下_数字.innerText = 外边距_下_范围条.value;
  外边距_左_数字.innerText = 外边距_左_范围条.value;
  外边距上 = 外边距_上_范围条.value;
  外边距右 = 外边距_右_范围条.value;
  外边距下 = 外边距_下_范围条.value;
  外边距左 = 外边距_左_范围条.value;
  root.style.setProperty("--比率-外边距-上", `${外边距上}%`);
  root.style.setProperty("--比率-外边距-下", `${外边距下}%`);
  root.style.setProperty("--比率-外边距-左", `${外边距左}%`);
  root.style.setProperty("--比率-外边距-右", `${外边距右}%`);
}

function 四向关联时修改边框尺寸(size) {
  边框_上_范围条.value = size;
  边框_下_范围条.value = size;
  边框_左_范围条.value = size;
  边框_右_范围条.value = size;
  边框_上_数字.innerText = 边框_上_范围条.value;
  边框_右_数字.innerText = 边框_右_范围条.value;
  边框_下_数字.innerText = 边框_下_范围条.value;
  边框_左_数字.innerText = 边框_左_范围条.value;
  边框上 = 边框_上_范围条.value;
  边框右 = 边框_右_范围条.value;
  边框下 = 边框_下_范围条.value;
  边框左 = 边框_左_范围条.value;
  root.style.setProperty("--比率-边框-上", `${边框上}%`);
  root.style.setProperty("--比率-边框-下", `${边框下}%`);
  root.style.setProperty("--比率-边框-左", `${边框左}%`);
  root.style.setProperty("--比率-边框-右", `${边框右}%`);
}

function 四向关联时修改内边距尺寸(size) {
  内边距_上_范围条.value = size;
  内边距_下_范围条.value = size;
  内边距_左_范围条.value = size;
  内边距_右_范围条.value = size;
  内边距_上_数字.innerText = 内边距_上_范围条.value;
  内边距_右_数字.innerText = 内边距_右_范围条.value;
  内边距_下_数字.innerText = 内边距_下_范围条.value;
  内边距_左_数字.innerText = 内边距_左_范围条.value;
  内边距上 = 内边距_上_范围条.value;
  内边距右 = 内边距_右_范围条.value;
  内边距下 = 内边距_下_范围条.value;
  内边距左 = 内边距_左_范围条.value;
  root.style.setProperty("--比率-内边距-上", `${内边距上}%`);
  root.style.setProperty("--比率-内边距-下", `${内边距下}%`);
  root.style.setProperty("--比率-内边距-左", `${内边距左}%`);
  root.style.setProperty("--比率-内边距-右", `${内边距右}%`);
}

function 修改盒子尺寸() {
  let 第1盒宽度 = `${内容宽}px`;
  let 第1盒高度 = `${内容高}px`;
  let 第2盒宽度 = `calc(${内容宽}px + ${内边距左}px + ${内边距右}px)`;
  let 第2盒高度 = `calc(${内容高}px + ${内边距上}px + ${内边距下}px)`;
  let 第3盒宽度 = `calc(${内容宽}px + ${内边距左}px + ${内边距右}px + ${边框左}px + ${边框右}px)`;
  let 第3盒高度 = `calc(${内容高}px + ${内边距上}px + ${内边距下}px + ${边框上}px + ${边框下}px)`;
  let 第4盒宽度 = `calc(${内容宽}px + ${内边距左}px + ${内边距右}px + ${边框左}px + ${边框右}px + ${外边距左}px + ${外边距右}px)`;
  let 第4盒高度 = `calc(${内容高}px + ${内边距上}px + ${内边距下}px + ${边框上}px + ${边框下}px + ${外边距上}px + ${外边距下}px)`;

  第1盒.style.width = 第1盒宽度;
  第1盒.style.height = 第1盒高度;
  第2盒.style.width = 第2盒宽度;
  第2盒.style.height = 第2盒高度;
  第3盒.style.width = 第3盒宽度;
  第3盒.style.height = 第3盒高度;
  第4盒.style.width = 第4盒宽度;
  第4盒.style.height = 第4盒高度;
}

// ----------------------- ↓ 盒子尺寸类型 --------------------------
// 边框盒子点击范围.onchange = 盒子尺寸类型框被点击;
// 内容盒子点击范围.onchange = 盒子尺寸类型框被点击;

const 范围选择器组合 = document.querySelectorAll(".选项 input[type='range']");

let 是边框盒子 = true;

function 盒子尺寸类型框被点击() {
  if (是边框盒子 === true && 边框盒子选择radio.checked) return;
  是边框盒子 = 边框盒子选择radio.checked;
  if (是边框盒子) {
    范围选择器组合.forEach((选择器) => {
      选择器.setAttribute("min", 0);
      选择器.setAttribute("max", 100);
      选择器.setAttribute("value", 50);
      选择器.value = 50;
    });
  } else {
    范围选择器组合.forEach((选择器) => {
      选择器.setAttribute("min", 0);
      选择器.setAttribute("max", 80);
      选择器.setAttribute("value", 40);
      选择器.value = 40;
    });
  }
  刷新数字();
  修改盒子尺寸();
}

function 刷新数字() {
  内容_宽_数字.innerText = 内容_宽_范围条.value;
  内容_高_数字.innerText = 内容_高_范围条.value;
  内边距_上_数字.innerText = 内边距_上_范围条.value;
  内边距_右_数字.innerText = 内边距_右_范围条.value;
  内边距_下_数字.innerText = 内边距_下_范围条.value;
  内边距_左_数字.innerText = 内边距_左_范围条.value;
  边框_上_数字.innerText = 边框_上_范围条.value;
  边框_右_数字.innerText = 边框_右_范围条.value;
  边框_下_数字.innerText = 边框_下_范围条.value;
  边框_左_数字.innerText = 边框_左_范围条.value;
  外边距_上_数字.innerText = 外边距_上_范围条.value;
  外边距_右_数字.innerText = 外边距_右_范围条.value;
  外边距_下_数字.innerText = 外边距_下_范围条.value;
  外边距_左_数字.innerText = 外边距_左_范围条.value;
}
// ----------------------- ↑ 盒子尺寸类型 --------------------------

// ----------------------- ↓ 方向关联 --------------------------
单项.forEach((项) => {
  if (!项.classList.contains("单项-内容")) {
    let 临时选项关联区 = 项.querySelector(".选项关联区");
    let 临时上下关联框 = 临时选项关联区.querySelector(" .上下关联-checkbox");
    let 临时左右关联框 = 临时选项关联区.querySelector(" .左右关联-checkbox");
    let 临时四向关联框 = 临时选项关联区.querySelector(" .四向关联-checkbox");

    临时上下关联框.onchange = (上下checkbox, 左右checkbox, 四向checkbox) => {
      上下checkbox = 临时上下关联框;
      左右checkbox = 临时左右关联框;
      四向checkbox = 临时四向关联框;
      if (上下checkbox.checked && 左右checkbox.checked) {
        四向checkbox.checked = true;
      } else {
        四向checkbox.checked = false;
      }
    };
    临时左右关联框.onchange = (上下checkbox, 左右checkbox, 四向checkbox) => {
      上下checkbox = 临时上下关联框;
      左右checkbox = 临时左右关联框;
      四向checkbox = 临时四向关联框;
      if (上下checkbox.checked && 左右checkbox.checked) {
        四向checkbox.checked = true;
      } else {
        四向checkbox.checked = false;
      }
    };
    临时四向关联框.onchange = (上下checkbox, 左右checkbox, 四向checkbox) => {
      上下checkbox = 临时上下关联框;
      左右checkbox = 临时左右关联框;
      四向checkbox = 临时四向关联框;
      上下checkbox.checked = 四向checkbox.checked;
      左右checkbox.checked = 四向checkbox.checked;
    };
  }
});
// ----------------------- ↑ 方向关联 --------------------------

// ----------------------- ↓ 盒子尺寸类型 --------------------------
const 内容 = document.querySelector(".单项-内容");
const 内容中文 = 内容.querySelector(".名称中文");
const 内容英文 = 内容.querySelector(".名称代码");

边框盒子选择radio.onchange = 盒子尺寸类型被修改;
内容盒子选择radio.onchange = 盒子尺寸类型被修改;

function 盒子尺寸类型被修改() {
  if (边框盒子选择radio.checked) {
    内容中文.innerText = "盒子";
    内容英文.innerText = "box";
    第3盒.style.outline = "solid 5px white";
    第1盒.style.outline = "none";
  } else {
    内容中文.innerText = "内容";
    内容英文.innerText = "content";
    第3盒.style.outline = "none";
    第1盒.style.outline = "solid 5px white";
  }
}
// ----------------------- ↑ 盒子尺寸类型 --------------------------

const 全部范围滑块 = document.querySelectorAll("input[type='range']");
全部范围滑块.forEach((滑块) => {
  滑块.setAttribute("list", "范围节点");
});

// ----------------------- ↓ 重置逻辑 --------------------------
window.onload = () => {
  const 重置按钮 = document.getElementsByClassName("重置按钮")[0];
  重置按钮.onclick = 重置参数;
};

function 重置参数() {
  const 所有checkbox = document.querySelectorAll("input[type='checkbox']");
  所有checkbox.forEach((checkbox) => {
    checkbox.checked = false;
  });

  const 所有范围滑块 = document.querySelectorAll("input[type='range']");
  所有范围滑块.forEach((滑块) => {
    滑块.value = 滑块.max / 2;
    const 值数字 = 滑块.nextElementSibling.querySelector(".值-数字");
    值数字.innerText = 滑块.value;
  });

  边框盒子选择radio.checked = true;

  内容宽 = 内容_宽_范围条.value;
  内容高 = 内容_高_范围条.value;

  内边距上 = 内边距_上_范围条.value;
  内边距右 = 内边距_右_范围条.value;
  内边距下 = 内边距_下_范围条.value;
  内边距左 = 内边距_左_范围条.value;

  边框上 = 边框_上_范围条.value;
  边框右 = 边框_右_范围条.value;
  边框下 = 边框_下_范围条.value;
  边框左 = 边框_左_范围条.value;

  外边距上 = 外边距_上_范围条.value;
  外边距右 = 外边距_右_范围条.value;
  外边距下 = 外边距_下_范围条.value;
  外边距左 = 外边距_左_范围条.value;

  root.style.setProperty("--比率-盒子-内容-宽", `${内容宽}%`);
  root.style.setProperty("--比率-盒子-内容-高", `${内容高}%`);
  root.style.setProperty("--比率-内边距-上", `${内边距上}%`);
  root.style.setProperty("--比率-内边距-下", `${内边距下}%`);
  root.style.setProperty("--比率-内边距-左", `${内边距左}%`);
  root.style.setProperty("--比率-内边距-右", `${内边距右}%`);
  root.style.setProperty("--比率-外边距-上", `${外边距上}%`);
  root.style.setProperty("--比率-外边距-下", `${外边距下}%`);
  root.style.setProperty("--比率-外边距-左", `${外边距左}%`);
  root.style.setProperty("--比率-外边距-右", `${外边距右}%`);
  root.style.setProperty("--比率-边框-上", `${边框上}%`);
  root.style.setProperty("--比率-边框-下", `${边框下}%`);
  root.style.setProperty("--比率-边框-左", `${边框左}%`);
  root.style.setProperty("--比率-边框-右", `${边框右}%`);

  修改盒子尺寸();
}
// ----------------------- ↑ 重置逻辑 --------------------------
