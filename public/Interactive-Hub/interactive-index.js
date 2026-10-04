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

/* 导航条固定逻辑：
   导航条 fixed 后会一直留在视口内，交叉观察器不再触发，因此不能直接观察导航条本身。
   改为观察一个占据导航条原位的零高度"哨兵"，并用 rootMargin 调整视口顶边：
   先下移 25% 导航条高度（对应"导航条的 0.25 离开视口"），再叠加 -50px 使触发点提前 50px。
   由于上方边距为负，触发时哨兵仍在真实视口内（top 为正值），
   因此方向判断要与移动后的边界比较，而不是与 0 比较。 */
const 导航条 = document.querySelector(".导航条");
const 导航条高度 = 导航条.offsetHeight;
// 触发边界在真实视口顶边向下 35px 处（= 50px 提前量 - 25% 导航条高度）
const 触发边界 = 50 - 导航条高度 * 0.25;

const 导航条容器 = document.createElement("div");
导航条容器.className = "导航条容器";
const 导航条哨兵 = document.createElement("div");
导航条哨兵.className = "导航条哨兵";

导航条.before(导航条容器);
导航条容器.append(导航条哨兵, 导航条);

const 导航条观察器 = new IntersectionObserver(
  ([条目]) => {
    const 已离开视口 = !条目.isIntersecting && 条目.boundingClientRect.top < 触发边界;
    导航条.classList.toggle("固定", 已离开视口);
    // 导航条脱离文档流时用 margin-bottom 撑出同样的高度（而不是哨兵自身高度），
    // 否则哨兵变高会改变其相交状态，导致在固定/恢复之间高频切换（闪烁）
    导航条哨兵.style.marginBottom = 已离开视口 ? `${导航条高度}px` : "";
  },
  {
    rootMargin: `${-触发边界}px 0px 0px 0px`,
    threshold: 0,
  }
);
导航条观察器.observe(导航条哨兵);
