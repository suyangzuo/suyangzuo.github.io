const 左分区 = document.querySelector(".左分区");
const 中分区 = document.querySelector(".中分区");
const 右分区 = document.querySelector(".右分区");
const 左积木区 = 左分区.querySelector(".积木区");
const 中积木区 = 中分区.querySelector(".积木区");
const 右积木区 = 右分区.querySelector(".积木区");

const 积木数量 = 5;
const 最大积木宽度 = 90;
const 左积木栈 = [];
const 中积木栈 = [];
const 右积木栈 = [];

const 操作分区组 = document.querySelectorAll(".操作分区");

初始化积木();

function 初始化积木() {
  for (let i = 0; i < 积木数量; i++) {
    const 积木 = document.createElement("div");
    积木.className = "积木";
    const 当前积木宽度 = 90 - 10 * i;
    积木.style.width = `${当前积木宽度}%`;
    左积木栈.push(积木);
    左积木区.appendChild(积木);
  }
}

