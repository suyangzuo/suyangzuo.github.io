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
  const 快捷键列表集合 = 列表.querySelectorAll(".列表项容器");
  for (const [index, 容器] of 快捷键列表集合.entries()) {
    const 序号 = document.createElement("span");
    序号.textContent = `${index + 1}`;
    序号.className = "序号";
    容器.prepend(序号);

    容器.addEventListener("click", () => {
      if (容器.className.includes("已确认容器")) {
        容器.classList.remove("已确认容器");
      } else {
        容器.classList.add("已确认容器");
      }
    });
  }
}

let 姓名 = "";
let 次数 = 0;

const 姓名框 = document.getElementById("姓名");
姓名框.addEventListener("input", 输入姓名);

function 输入姓名() {
  姓名 = 姓名框.value;
}

const 次数框 = document.getElementById("测试次数");
次数框.addEventListener("input", 更新次数);

function 更新次数() {
  if (次数框.value === "") {
    次数 = 0;
    return;
  }
  次数 = parseInt(次数框.value, 10);
  if (次数 > 100) {
    次数框.value = "100";
    次数 = 100;
  }
}

window.addEventListener("keydown", 按下快捷键);

window.addEventListener("keyup", 松开快捷键);

function 按下快捷键(event) {
  event.preventDefault();
}

function 松开快捷键(event) {
  event.preventDefault();
}
