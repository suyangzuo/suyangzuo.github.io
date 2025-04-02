let 行数 = 10;
let 列数 = 10;
const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 数据区 = document.querySelector(".数据区");
const 索引数据容器组 = document.querySelectorAll(".索引数据容器");

const 平面 = document.getElementById("平面");
const 三维 = document.getElementById("三维");
const 过渡时长 = 500;
let 当前三维视角展示索引 = 0;
let 平面过渡延时函数 = null;
let 三维过渡延时函数 = null;

const 数组容器组 = document.getElementsByClassName("数组容器");
const 索引容器组 = document.getElementsByClassName("二维数组索引容器");
const 行号容器组 = document.getElementsByClassName("行号容器");
const 列号容器组 = document.getElementsByClassName("列号容器");
const 数组行二维集合 = [];
const 数组格三维集合 = [];

root.style.setProperty("--数据区坐标-top", `${数组容器组[0].getBoundingClientRect().top}px`);
root.style.setProperty("--数据区坐标-left", `${数组容器组[0].getBoundingClientRect().left}px`);

Array.from(数组容器组, (数组容器, index) => {
  const 数组格二维集合 = [];
  for (let i = 0; i < 行数; i++) {
    const 数组格一维集合 = [];
    const 行 = document.createElement("div");
    行.className = "数组行";
    数组容器.appendChild(行);
    for (let j = 0; j < 列数; j++) {
      const 数组格 = document.createElement("div");
      数组格.className = "数组格";
      数组格.id = `${index}-${i}-${j}`;
      行.appendChild(数组格);

      数组格.addEventListener("mouseenter", () => {
        高亮当前行号列号(数组格);
        数据区.classList.remove("隐藏");
        更新数据区(数组格, [index, i, j]);
        root.style.setProperty("--数据区坐标-left", `${数组容器.getBoundingClientRect().left}px`);
      });
      数组格.addEventListener("mouseleave", () => {
        数据区.classList.add("隐藏");
        复原当前行号列号(数组格);
      });
      数组格一维集合.push(数组格);
    }
    数组格二维集合.push(数组格一维集合);
  }
  数组格三维集合.push(数组格二维集合);

  const 序号容器组 = 生成序号();
  const 二维数组索引容器 = document.createElement("div");
  二维数组索引容器.className = "二维数组索引容器";
  二维数组索引容器.textContent = index.toString();
  数组容器.append(序号容器组.行号容器, 序号容器组.列号容器, 二维数组索引容器);
  const 行号组 = 序号容器组.行号容器.querySelectorAll(".行号");
  for (let i = 0; i < 行号组.length; i++) {
    const 行号 = 行号组[i];
    行号.addEventListener("mouseenter", () => {
      数据区.classList.remove("隐藏");
      更新数据区(行号, [index, i]);
      root.style.setProperty("--数据区坐标-left", `${数组容器.getBoundingClientRect().left}px`);
    });

    行号.addEventListener("mouseleave", () => {
      数据区.classList.add("隐藏");
    });
  }

  二维数组索引容器.addEventListener("mouseenter", () => {
    数据区.classList.remove("隐藏");
    更新数据区(二维数组索引容器, [index]);
    root.style.setProperty("--数据区坐标-left", `${数组容器.getBoundingClientRect().left}px`);
  });

  二维数组索引容器.addEventListener("mouseleave", () => {
    数据区.classList.add("隐藏");
  });
});

let 三维数据动画对象组 = [
  [null, null],
  [null, null],
  [null, null],
];
const 三维容器动画关键帧序列 = [
  { scale: 1, offset: 0 },
  { scale: 1.5, offset: 0.15 },
  { scale: 1.5, offset: 0.85 },
  { scale: 1, offset: 1 },
];
const 行容器动画关键帧序列 = [
  { scale: 1, offset: 0 },
  { scale: 1.5, translate: "-30px 0", offset: 0.15 },
  { scale: 1.5, translate: "-30px 0", offset: 0.85 },
  { scale: 1, offset: 1 },
];
const 列容器动画关键帧序列 = [
  { scale: 1, offset: 0 },
  { scale: 1.5, translate: "0 -30px", offset: 0.15 },
  { scale: 1.5, translate: "0 -30px", offset: 0.85 },
  { scale: 1, offset: 1 },
];
const 三维数据动画关键帧序列 = [
  { scale: 1, offset: 0 },
  { scale: 1.5, translate: "0 -50px", offset: 0.15 },
  { scale: 1.5, translate: "0 -50px", offset: 0.85 },
  { scale: 1, offset: 1 },
];
const 三维数据动画设置 = [
  { duration: 750, delay: 0 },
  { duration: 750, delay: 750 * 1.25 },
  { duration: 750, delay: 750 * 2.5 },
];
for (let u = 0; u < 数组格三维集合.length; u++) {
  for (let i = 0; i < 行数; i++) {
    for (let j = 0; j < 列数; j++) {
      const 数组格 = 数组格三维集合[u][i][j];
      数组格.addEventListener("click", () => {
        const 三维索引 = 索引容器组[u];
        const 行 = 行号容器组[u].children[i];
        const 列 = 列号容器组[u].children[j];
        const 三维数据 = 索引数据容器组[0];
        const 行数据 = 索引数据容器组[1];
        const 列数据 = 索引数据容器组[2];

        for (const 组 of 三维数据动画对象组) {
          for (const 对象 of 组) {
            对象?.cancel();
          }
        }
        三维数据动画对象组[0][0] = 三维索引.animate(三维容器动画关键帧序列, 三维数据动画设置[0]);
        三维数据动画对象组[0][1] = 三维数据.animate(三维数据动画关键帧序列, 三维数据动画设置[0]);
        三维数据动画对象组[1][0] = 行.animate(行容器动画关键帧序列, 三维数据动画设置[1]);
        三维数据动画对象组[1][1] = 行数据.animate(三维数据动画关键帧序列, 三维数据动画设置[1]);
        三维数据动画对象组[2][0] = 列.animate(列容器动画关键帧序列, 三维数据动画设置[2]);
        三维数据动画对象组[2][1] = 列数据.animate(三维数据动画关键帧序列, 三维数据动画设置[2]);
      });
    }
  }
}

for (const 数组容器 of 数组容器组) {
  const 数组行集合 = 数组容器.querySelectorAll(".数组行");
  数组行二维集合.push(数组行集合);
}

function 生成序号() {
  const 行号容器 = document.createElement("div");
  行号容器.className = "行号容器 序号容器";

  const 列号容器 = document.createElement("div");
  列号容器.className = "列号容器 序号容器";

  for (let i = 0; i < 行数; i++) {
    const 行号 = document.createElement("span");
    行号.className = "行号 序号";
    行号.textContent = i.toString();
    行号容器.appendChild(行号);
  }

  for (let i = 0; i < 列数; i++) {
    const 列号 = document.createElement("span");
    列号.className = "列号 序号";
    列号.textContent = i.toString();
    列号容器.appendChild(列号);
  }

  return {
    行号容器: 行号容器,
    列号容器: 列号容器,
  };
}

function 高亮当前行号列号(数组格) {
  const 当前行列对象 = 获取当前行号列号元素(数组格);
  const 高亮行号 = 当前行列对象.当前行号;
  const 高亮列号 = 当前行列对象.当前列号;
  高亮行号.classList.add("当前序号");
  高亮列号.classList.add("当前序号");

  const 行号 = 获取当前行列(数组格).行号;
  const 列号 = 获取当前行列(数组格).列号;
  const 当前数组容器 = 数组格.parentElement.parentElement;
  for (let i = 0; i <= 行号; i++) {
    当前数组容器.children[i].children[列号].classList.add("同列单元格");
  }

  for (let i = 0; i <= 列号; i++) {
    当前数组容器.children[行号].children[i].classList.add("同行单元格");
  }
}

function 复原当前行号列号(数组格) {
  const 当前行列对象 = 获取当前行号列号元素(数组格);
  const 高亮行号 = 当前行列对象.当前行号;
  const 高亮列号 = 当前行列对象.当前列号;
  高亮行号.classList.remove("当前序号");
  高亮列号.classList.remove("当前序号");

  const 行号 = 获取当前行列(数组格).行号;
  const 列号 = 获取当前行列(数组格).列号;
  const 当前数组容器 = 数组格.parentElement.parentElement;
  for (let i = 0; i <= 行号; i++) {
    当前数组容器.children[i].children[列号].classList.remove("同列单元格");
  }

  for (let i = 0; i <= 列号; i++) {
    当前数组容器.children[行号].children[i].classList.remove("同行单元格");
  }
}

function 获取当前行号列号元素(数组格) {
  const 行列组 = 数组格.id.split("-");
  const 行号 = 行列组[1];
  const 列号 = 行列组[2];
  const 行号容器 = 数组格.parentElement.parentElement.querySelector(".行号容器");
  const 列号容器 = 数组格.parentElement.parentElement.querySelector(".列号容器");
  const 当前行号 = 行号容器.children[行号];
  const 当前列号 = 列号容器.children[列号];

  return {
    当前行号: 当前行号,
    当前列号: 当前列号,
  };
}

function 获取当前行列(单元格) {
  const 行列组 = 单元格.id.split("-");
  const 行号 = 行列组[1];
  const 列号 = 行列组[2];
  return {
    行号: 行号,
    列号: 列号,
  };
}

平面.addEventListener("change", () => {
  Array.from(数组容器组, (数组容器) => {
    数组容器.classList.remove("三维展示");
    数组容器.classList.remove("已屏蔽");
  });

  const 全部数组格 = document.getElementsByClassName("数组格");
  Array.from(全部数组格, (数组格) => {
    数组格.classList.add("有过渡");
    clearTimeout(三维过渡延时函数);
    平面过渡延时函数 = setTimeout(() => {
      数组格.classList.remove("有过渡");
    }, 过渡时长);
  });
});

三维.addEventListener("change", () => {
  Array.from(数组容器组, (数组容器) => {
    数组容器.classList.add("三维展示");
  });

  Array.from(数组容器组, (数组容器, index) => {
    if (当前三维视角展示索引 === index) {
      数组容器.classList.remove("已屏蔽");
    } else {
      数组容器.classList.add("已屏蔽");
    }
  });

  const 全部数组格 = document.getElementsByClassName("数组格");
  Array.from(全部数组格, (数组格) => {
    数组格.classList.add("有过渡");
    clearTimeout(平面过渡延时函数);
    三维过渡延时函数 = setTimeout(() => {
      数组格.classList.remove("有过渡");
    }, 过渡时长);
  });
});

Array.from(索引容器组, (索引容器, 索引) => {
  索引容器.addEventListener("mouseenter", () => {
    const 当前二维数组行集合 = 数组容器组[索引].querySelectorAll(".数组行");
    for (const 行 of 当前二维数组行集合) {
      行.classList.add("当前数组行");
    }
  });

  索引容器.addEventListener("mouseleave", () => {
    const 当前二维数组行集合 = 数组容器组[索引].querySelectorAll(".数组行");
    for (const 行 of 当前二维数组行集合) {
      行.classList.remove("当前数组行");
    }
  });

  索引容器.addEventListener("click", () => {
    if (平面.checked) return;
    if (索引 === 当前三维视角展示索引) return;
    当前三维视角展示索引 = 索引;

    Array.from(数组容器组, (数组容器, index) => {
      if (当前三维视角展示索引 === index) {
        数组容器.classList.remove("已屏蔽");
      } else {
        数组容器.classList.add("已屏蔽");
      }
    });
  });
});

Array.from(行号容器组, (行号容器, 一维索引) => {
  const 行号组 = 行号容器.querySelectorAll(".行号");
  for (const [二维索引, 行号] of 行号组.entries()) {
    行号.addEventListener("mouseenter", () => {
      数组行二维集合[一维索引][二维索引].classList.add("当前数组行");
    });

    行号.addEventListener("mouseleave", () => {
      数组行二维集合[一维索引][二维索引].classList.remove("当前数组行");
    });
  }
});

function 更新数据区(元素, 索引组) {
  if (元素.className === "二维数组索引容器") {
    索引数据容器组[0].classList.remove("隐藏");
    索引数据容器组[1].classList.add("隐藏");
    索引数据容器组[2].classList.add("隐藏");
  } else if (元素.className.includes("行号")) {
    索引数据容器组[0].classList.remove("隐藏");
    索引数据容器组[1].classList.remove("隐藏");
    索引数据容器组[2].classList.add("隐藏");
  } else if (元素.className.includes("数组格")) {
    索引数据容器组[0].classList.remove("隐藏");
    索引数据容器组[1].classList.remove("隐藏");
    索引数据容器组[2].classList.remove("隐藏");
  }

  for (let i = 0; i < 索引组.length; i++) {
    const 索引数据 = 索引数据容器组[i].querySelector(".索引数据");
    索引数据.textContent = 索引组[i];
  }
}

const resizeObserver = new ResizeObserver(() => {
  root.style.setProperty("--数据区坐标-top", `${数组容器组[0].getBoundingClientRect().top}px`);
});

resizeObserver.observe(document.body);
