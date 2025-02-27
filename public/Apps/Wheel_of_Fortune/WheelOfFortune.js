const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 奖品数量 = 10;
let 总旋转角度 = 360 * Math.random() * 5 + 360 * 26;

/* for (let i = 0; i < 奖品数量; i++) {
  root.style.setProperty(`--奖品-${i}-起点`, `calc(360deg / ${奖品数量} * ${i - 0.5})`);
} */

const 奖品容器组 = document.querySelectorAll(".奖品容器");
const 奖品内容组 = document.querySelectorAll(".奖品内容");

for (const [index, 奖品容器] of 奖品容器组.entries()) {
  const 背景色 = rootStyle.getPropertyValue(`--奖品-${index}-背景色`);
  const 渐变起点 = rootStyle.getPropertyValue(`--奖品-${index}-起点`);
  const 渐变终点 = rootStyle.getPropertyValue(`--奖品-${index}-终点`);
  奖品容器.style.backgroundImage = `conic-gradient(
    transparent ${渐变起点},
    ${背景色} ${渐变起点} ${渐变终点},
    transparent ${渐变终点})`;
}

for (const [index, 奖品内容] of 奖品内容组.entries()) {
  奖品内容.style.rotate = `z ${(index * 360) / 奖品数量}deg`;
  修正转盘奖品序号角度();
}

const 奖品设置区 = document.querySelector(".奖品设置区");
for (let i = 0; i < 奖品数量; i++) {
  const 转盘奖品文本 = 奖品内容组[i].querySelector(".奖品文本");

  const 奖品 = document.createElement("div");
  奖品.className = "奖品";
  奖品设置区.appendChild(奖品);

  const 设置奖品序号 = document.createElement("label");
  设置奖品序号.className = "设置奖品序号";
  设置奖品序号.textContent = i + 1;

  const 奖品名称 = document.createElement("input");
  奖品名称.type = "text";
  奖品名称.className = "奖品名称 文本框";
  奖品名称.value = 转盘奖品文本.innerText;

  奖品.append(设置奖品序号, 奖品名称);

  奖品名称.addEventListener("input", () => {
    转盘奖品文本.textContent = 奖品名称.value;
  });
}

function 修正转盘奖品序号角度() {
  for (const [index, 奖品内容] of 奖品内容组.entries()) {
    const 转盘奖品序号 = 奖品内容.querySelector(".转盘奖品序号");
    转盘奖品序号.textContent = index + 1;
    const 旋转角度 = parseInt(window.getComputedStyle(奖品内容).rotate, 10);
    转盘奖品序号.style.rotate = `z -${旋转角度}deg`;
  }
}
