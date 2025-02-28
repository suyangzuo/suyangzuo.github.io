const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 奖品数量 = 10;
const 固定圈数 = 25;
const 动态圈数 = 5;
let 总旋转角度 = 生成总旋转角度();

function 生成总旋转角度() {
  return 360 * Math.random() * (动态圈数 + 1) + 360 * 固定圈数;
}

const 转盘容器 = document.querySelector(".转盘容器");
const 转盘指示器 = document.querySelector(".转盘指示器");
const 角度间隔 = parseInt(rootStyle.getPropertyValue("--角度间隔"), 10);

const 奖品容器组 = document.querySelectorAll(".奖品容器");
const 奖品内容组 = document.querySelectorAll(".奖品内容");

for (const [index, 奖品容器] of 奖品容器组.entries()) {
  const 背景色 = rootStyle.getPropertyValue(`--奖品-${index}-背景色`);
  const 渐变起点 = rootStyle.getPropertyValue(`--奖品-${index}-起点`);
  const 渐变终点 = rootStyle.getPropertyValue(`--奖品-${index}-终点`);
  奖品容器.style.backgroundImage = `conic-gradient(
    from -18deg,
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

  const 奖品设置项 = document.createElement("div");
  奖品设置项.className = "奖品设置项";
  奖品设置区.appendChild(奖品设置项);

  const 设置奖品序号 = document.createElement("label");
  设置奖品序号.className = "设置奖品序号";
  设置奖品序号.textContent = i + 1;

  const 奖品名称输入框 = document.createElement("input");
  奖品名称输入框.type = "text";
  奖品名称输入框.id = `奖品-${i + 1}`;
  设置奖品序号.setAttribute("for", 奖品名称输入框.id);
  奖品名称输入框.className = "奖品名称 文本框";
  奖品名称输入框.value = 转盘奖品文本.innerText;

  奖品设置项.append(设置奖品序号, 奖品名称输入框);

  奖品名称输入框.addEventListener("input", () => {
    转盘奖品文本.textContent = 奖品名称输入框.value;
  });

  奖品设置项.addEventListener("mouseenter", () => {
    转盘指示器.classList.remove("隐藏");
    转盘指示器.style.setProperty("--指示器起始角度", `${角度间隔 * i}deg`);
    转盘指示器.style.setProperty("--指示器结束角度", `${角度间隔 * (i + 1)}deg`);
    转盘指示器.style.setProperty("--转盘指示器背景色", rootStyle.getPropertyValue(`--奖品-${i}-背景色`));
  });

  奖品设置项.addEventListener("mouseleave", () => {
    转盘指示器.classList.add("隐藏");
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

const 开奖按钮 = document.getElementById("开奖按钮");
const 旋转转盘单选框 = document.getElementById("旋转对象-转盘");
const 旋转指针单选框 = document.getElementById("旋转对象-指针");
const 指针 = document.querySelector(".指针");
const 转盘奖品序号组 = document.querySelectorAll(".转盘奖品序号");
开奖按钮.addEventListener("click", () => {
  总旋转角度 = 生成总旋转角度();

  const 转盘关键帧序列 = [
    {
      rotate: "z 0deg",
    },
    {
      rotate: `z ${总旋转角度}deg`,
    },
  ];

  const 动画选项 = {
    easing: "cubic-bezier(0.02, 0.95, 0.5, 1)",
    fill: "forwards",
    duration: 10000,
  };

  if (旋转转盘单选框.checked) {
    for (const 转盘奖品序号 of 转盘奖品序号组) {
      const 当前旋转角度 = parseInt(转盘奖品序号.style.rotate, 10);
      转盘奖品序号.style.rotate = `z ${当前旋转角度 - 总旋转角度}deg`;
    }

    转盘容器.animate(转盘关键帧序列, 动画选项);
  } else {
    指针.animate(转盘关键帧序列, 动画选项);
  }
});
