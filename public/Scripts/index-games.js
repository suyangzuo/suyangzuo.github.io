let 灯光特效初始启动 = true;

const 灯光组 = [];
const 游戏区 = document.querySelector(".games");

const 游戏区观察者 = new IntersectionObserver(游戏区观察者回调, {
  threshold: 0.75,
});
游戏区观察者.observe(游戏区);

生成灯光();

function 游戏区观察者回调(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (灯光特效初始启动) {
        灯光特效();
        灯光特效初始启动 = false;
      } else {
        移动灯光();
      }
      // 游戏区观察者.unobserve(游戏区);
    }
  });
}

function 生成灯光() {
  const 灯光上限 = 20;
  for (let i = 1; i <= 灯光上限; i++) {
    const 灯光 = document.createElement("div");
    灯光.className = "灯光";
    const 宽度上限 = 100;
    const 宽度下限 = 10;
    const 高度上限 = 300;
    const 高度下限 = 100;
    const width = Math.floor(Math.random() * (宽度上限 - 宽度下限) + 宽度下限);
    const height = Math.floor(Math.random() * (高度上限 - 高度下限) + 高度下限);
    灯光.style.width = `${width}px`;
    灯光.style.height = `${height}px`;

    const 红 = Math.floor(Math.random() * 256);
    const 绿 = Math.floor(Math.random() * 256);
    const 蓝 = Math.floor(Math.random() * 256);
    const 透明度 = Math.random();
    const 背景色 = `rgba(${红}, ${绿}, ${蓝}, ${透明度})`;
    灯光.style.backgroundColor = 背景色;

    const 模糊上限 = 10;
    const 模糊下限 = 2;
    const 模糊尺寸 = Math.floor(
      Math.random() * (模糊上限 - 模糊下限) + 模糊下限
    );
    灯光.style.filter = `blur(${模糊尺寸}px)`;

    const 顶距离上限 = 110;
    const 顶距离下限 = 80;
    const 顶距离 = Math.floor(
      Math.random() * (顶距离上限 - 顶距离下限) + 顶距离下限
    );
    灯光.style.top = `${顶距离}%`;
    const 左距离上限 = 92.5;
    const 左距离下限 = 5;
    const 左距离 = Math.floor(
      Math.random() * (左距离上限 - 左距离下限) + 左距离下限
    );
    灯光.style.left = `${左距离}%`;
    灯光.style.opacity = "0";

    灯光组.push(灯光);
    游戏区.appendChild(灯光);
  }
}

function 灯光特效() {
  const 移动用时上限 = 3000;
  const 移动用时下限 = 2000;
  const 顶距上限 = 90;
  const 顶距下限 = 10;
  灯光组.forEach((灯光) => {
    const 移动用时 = Math.floor(
      Math.random() * (移动用时上限 - 移动用时下限) + 移动用时下限
    );
    灯光.style.transition = `${移动用时}ms`;
    const 顶距 = Math.floor(Math.random() * (顶距上限 - 顶距下限) + 顶距下限);
    灯光.style.top = `${顶距}%`;
    灯光.style.height = 灯光.style.width;
    灯光.style.opacity = "1";
  });
}

function 移动灯光() {
  灯光组.forEach((灯光) => {
    刷新灯光属性(灯光);
  });
}

function 刷新灯光属性(灯光) {
  const 宽度上限 = 75;
  const 宽度下限 = 10;
  const width = Math.floor(Math.random() * (宽度上限 - 宽度下限) + 宽度下限);
  const height = width;
  灯光.style.width = `${width}px`;
  灯光.style.height = `${height}px`;
  const 红 = Math.floor(Math.random() * 256);
  const 绿 = Math.floor(Math.random() * 256);
  const 蓝 = Math.floor(Math.random() * 256);
  const 透明度 = Math.random();
  const 背景色 = `rgba(${红}, ${绿}, ${蓝}, ${透明度})`;
  灯光.style.backgroundColor = 背景色;
  const 模糊上限 = 10;
  const 模糊下限 = 2;
  const 模糊尺寸 = Math.floor(Math.random() * (模糊上限 - 模糊下限) + 模糊下限);
  灯光.style.filter = `blur(${模糊尺寸}px)`;
  const 顶距离上限 = 90;
  const 顶距离下限 = 10;
  const 顶距离 = Math.floor(
    Math.random() * (顶距离上限 - 顶距离下限) + 顶距离下限
  );
  灯光.style.top = `${顶距离}%`;
  const 左距离上限 = 92.5;
  const 左距离下限 = 5;
  const 左距离 = Math.floor(
    Math.random() * (左距离上限 - 左距离下限) + 左距离下限
  );
  灯光.style.left = `${左距离}%`;
  const 移动用时上限 = 5000;
  const 移动用时下限 = 2500;
  const 移动用时 = Math.floor(
    Math.random() * (移动用时上限 - 移动用时下限) + 移动用时下限
  );
  灯光.style.transition = `${移动用时}ms`;
}
