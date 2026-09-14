const root = document.querySelector(":root");
const 中心标题动画持续时间 = Number.parseFloat(
  getComputedStyle(root).getPropertyValue("--中心标题动画持续时间")
);

const 中心标题组 = document.querySelectorAll(".中心标题");
for (const 中心标题 of 中心标题组) {
  const 字符组 = 中心标题.querySelectorAll("span");
  字符组.forEach((字符, 索引) => {
    const 轴 = 索引 % 2 === 0 ? "rotateY" : "rotateX";
    字符.animate(
      [{ transform: `${轴}(90deg)` }, { transform: `${轴}(0deg)` }],
      {
        duration: 中心标题动画持续时间 * 1000,
        delay: 中心标题动画持续时间 * 1000 * 索引,
        easing: "ease-in",
        fill: "forwards",
      }
    );
  });
}

const 交互列表组 = document.querySelectorAll(".交互列表");

for (const 交互列表 of 交互列表组) {
  const 交互单项组 = 交互列表.querySelectorAll(".交互单项");
  for (let 交互单项 of 交互单项组) {
    if (交互单项.innerHTML === "") continue;
    let index = Array.from(交互单项组).indexOf(交互单项);
    const 序号 = 交互单项.querySelector(".序号");
    序号.innerText = index + 1;
  }
}

const 交互单向组 = document.querySelectorAll(".交互单项");
for (const 交互单项 of 交互单向组) {
  交互单项.addEventListener("mouseenter", () => {
    const 尺寸 = {
      宽: `${交互单项.offsetWidth}px`,
      高: `${交互单项.offsetHeight}px`,
    };

    const 坐标 = {
      x: `${交互单项.offsetLeft}px`,
      y: `${交互单项.offsetTop}px`,
    };

    const 标题 =
      交互单项.parentElement.parentElement.querySelector("h1").textContent;

    root.style.setProperty("--交互单项宽度", 尺寸.宽);
    root.style.setProperty("--交互单项高度", 尺寸.高);
    root.style.setProperty(`--${标题}-水平偏移`, 坐标.x);
    root.style.setProperty(`--${标题}-垂直偏移`, 坐标.y);
  });
}
