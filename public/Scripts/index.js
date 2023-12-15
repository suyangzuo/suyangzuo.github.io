const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);

const 图像滑块组 = document.getElementsByClassName("图像滑块组")[0];
const 图像滑块 = 图像滑块组.getElementsByClassName("图像滑块");
const 图像序号指示器组 = document.getElementsByClassName("图像序号指示器");
const 图像序号指示器颜色_当前 = "#a03020";
const 图像序号指示器颜色_未选中 = "rgba(173, 173, 173, 0.75)";
const 图像序号指示器颜色_鼠标悬停 = "rgb(175, 224, 247)";

let 鼠标x = 0;
let 鼠标y = 0;

window.addEventListener("click", 获取鼠标坐标);

图像滑块[0].innerHTML = 图像滑块[1].innerHTML;
图像滑块[2].innerHTML = 图像滑块[1].innerHTML;

const 长廊1区图像容器组 = Array.from(
  document.getElementsByClassName("图像容器")
);

const 箭头组 = document.getElementsByClassName("箭头");
const 左箭头 = 箭头组[0];
const 右箭头 = 箭头组[1];

const 自动滚动延时 = 4000;
const 图像数量 = 图像滑块[1].children.length;
const 图像移动时长 = parseInt(rootStyle.getPropertyValue("--图像移动时长"), 10);

const 图像容器宽度 = parseInt(rootStyle.getPropertyValue("--图像容器宽度"), 10);
const 实际图像间距 = parseInt(rootStyle.getPropertyValue("--实际图像间距"), 10);
const 图像宽度 = 图像容器宽度 - 实际图像间距;
const 图像容器高度 = (图像宽度 * 9) / 16;
const 图像高度 = (图像宽度 * 9) / 16;

const 覆盖层宽度 = 图像宽度;
const 覆盖层高度 = 图像高度;
const 初始图像位移 = 图像容器宽度 / 2;
let 图像位移 = 初始图像位移; // --> 图像容器宽度 / 2
const 初始图像索引 = 图像数量 - 1 + 图像数量 / 2;
let 图像索引 = 初始图像索引; // --> 中间滑块的第5张图

let mouseIsEnter = false; // --> 判断鼠标是否悬停在箭头上

let 图像长廊定时滚动 = setInterval(点击右箭头, 自动滚动延时);

let 当前所指图像索引 = 初始图像索引;

let 图像自动滚动中 = false;
let 图像受指示器滚动中 = false;

function 获取鼠标坐标(event) {
  鼠标x = event.clientX;
  鼠标y = event.clientY;
}

图像序号指示器组[初始图像索引 - 图像数量].getElementsByClassName(
  "指示器内部"
)[0].style.background = 图像序号指示器颜色_当前;

function 初始化图像覆盖透明度() {
  长廊1区图像容器组[初始图像索引 - 1].getElementsByClassName(
    "img-overlay"
  )[0].style.opacity = "0.5";
  长廊1区图像容器组[初始图像索引].getElementsByClassName(
    "img-overlay"
  )[0].style.opacity = "0";
  长廊1区图像容器组[初始图像索引 + 1].getElementsByClassName(
    "img-overlay"
  )[0].style.opacity = "0.5";
}

初始化图像覆盖透明度();
初始化左右图像功能();

// ------- ↓ 此处有Bug：当鼠标不动、图片移动时，mouseenter 和 mouseleave 无法触发-------
长廊1区图像容器组.forEach((图像容器) => {
  const 图像覆盖 = 图像容器.getElementsByClassName("img-overlay")[0];

  图像覆盖.addEventListener("mouseenter", () => {
    if (图像受指示器滚动中) return;
    clearInterval(图像长廊定时滚动);
    图像长廊定时滚动 = null;
    当前所指图像索引 = 长廊1区图像容器组.indexOf(图像容器);
    if (当前所指图像索引 !== 图像索引) {
      图像覆盖.style.opacity = "0.25";
      if (当前所指图像索引 > 图像索引) {
        图像滑块组.style.left = "-0.5%";
      } else {
        图像滑块组.style.left = "0.5%";
      }
    }
  });

  图像覆盖.addEventListener("mouseleave", () => {
    if (图像受指示器滚动中) return;
    if (!图像长廊定时滚动) {
      图像长廊定时滚动 = setInterval(点击右箭头, 自动滚动延时);
    }
    当前所指图像索引 = 长廊1区图像容器组.indexOf(图像容器);
    if (当前所指图像索引 !== 图像索引) {
      图像覆盖.style.opacity = "0.5";
    }
    图像滑块组.style.left = "0";
  });
});
// ------- ↑ 此处有Bug：当鼠标不动、图片移动时，mouseenter 和 mouseleave 无法触发-------

左箭头.addEventListener("click", 点击左箭头);
右箭头.addEventListener("click", 点击右箭头);

左箭头.addEventListener("mouseenter", () => {
  mouseIsEnter = true;
  clearInterval(图像长廊定时滚动);
  图像长廊定时滚动 = null;
});

左箭头.addEventListener("mouseleave", () => {
  mouseIsEnter = false;
  图像长廊定时滚动 = setInterval(点击右箭头, 自动滚动延时);
});

右箭头.addEventListener("mouseenter", () => {
  mouseIsEnter = true;
  clearInterval(图像长廊定时滚动);
  图像长廊定时滚动 = null;
});

右箭头.addEventListener("mouseleave", () => {
  mouseIsEnter = false;
  图像长廊定时滚动 = setInterval(点击右箭头, 自动滚动延时);
});

function 点击左箭头() {
  左箭头.removeEventListener("click", 点击左箭头);
  图像索引--;
  图像位移 += 图像容器宽度;

  const 图覆盖后2 =
    长廊1区图像容器组[图像索引 + 2].getElementsByClassName("img-overlay")[0];
  const 图覆盖当前 =
    长廊1区图像容器组[图像索引].getElementsByClassName("img-overlay")[0];
  const 图覆盖前2 =
    长廊1区图像容器组[图像索引 - 2].getElementsByClassName("img-overlay")[0];
  图覆盖后2.removeEventListener("click", 点击右箭头);
  图覆盖前2.removeEventListener("click", 点击左箭头);
  图覆盖当前.removeEventListener("click", 点击左箭头);
  图覆盖当前.removeEventListener("click", 点击右箭头);

  let 图覆盖后1 =
    长廊1区图像容器组[图像索引 + 1].getElementsByClassName("img-overlay")[0];
  let 图覆盖前1 =
    长廊1区图像容器组[图像索引 - 1].getElementsByClassName("img-overlay")[0];

  图覆盖前1.style.opacity = "0.5";
  图覆盖后1.style.opacity = "0.5";
  图覆盖当前.style.opacity = "0";

  图像滑块组.style.transition = `transform ${图像移动时长}ms ease-out, left 250ms ease-out`;
  图像滑块组.style.transform = `translateX(${图像位移}px)`;
  if (mouseIsEnter) {
    左箭头.style.filter = "brightness(50%)";
  }

  if (图像索引 <= 初始图像索引 - 图像数量) {
    初始化图像覆盖透明度();
  }

  //---------- ↓ 根据鼠标位置，判断鼠标是否位于左右图上，如是，则左右图覆盖层透明度改为 25% ----------
  window.addEventListener("mousemove", 获取鼠标坐标);
  //---------- ↑ 根据鼠标位置，判断鼠标是否位于左右图上，如是，则左右图覆盖层透明度改为 25% ----------

  setTimeout(点击左箭头延迟运行, 图像移动时长);
}

function 点击左箭头延迟运行() {
  if (图像索引 <= 初始图像索引 - 图像数量) {
    图像索引 = 初始图像索引;
    图像位移 = 初始图像位移;
    图像长廊位移重置();
  }

  图覆盖前1 =
    长廊1区图像容器组[图像索引 - 1].getElementsByClassName("img-overlay")[0];
  图覆盖后1 =
    长廊1区图像容器组[图像索引 + 1].getElementsByClassName("img-overlay")[0];
  图覆盖后1.addEventListener("click", 点击右箭头);
  图覆盖前1.addEventListener("click", 点击左箭头);

  //---------- ↓ 根据鼠标位置，判断鼠标是否位于左右图上，如是，则左右图覆盖层透明度改为 25% ----------
  let previousOffset = 图覆盖前1.getBoundingClientRect();
  let previousOffsetLeft = previousOffset.left;
  let previousOffsetTop = previousOffset.top;
  let nextOffset = 图覆盖后1.getBoundingClientRect();
  let nextOffsetLeft = nextOffset.left;
  let nextOffsetTop = nextOffset.top;
  if (
    鼠标x >= previousOffsetLeft &&
    鼠标x <= previousOffsetLeft + 图像宽度 &&
    鼠标y >= previousOffsetTop &&
    鼠标y <= previousOffsetTop + 图像高度
  ) {
    图覆盖前1.style.opacity = "0.25";
  } else if (
    鼠标x >= nextOffsetLeft &&
    鼠标x <= nextOffsetLeft + 图像宽度 &&
    鼠标y >= nextOffsetTop &&
    鼠标y <= nextOffsetTop + 图像高度
  ) {
    图覆盖后1.style.opacity = "0.25";
  }

  if (图像索引 >= 10 && 图像索引 <= 19) {
    let 之前图像索引 = 图像索引 === 19 ? 0 : 图像索引 - 图像数量 + 1;
    图像序号指示器组[之前图像索引].getElementsByClassName(
      "指示器内部"
    )[0].style.background = 图像序号指示器颜色_未选中;
    图像序号指示器组[图像索引 - 图像数量]
      .getElementsByClassName("指示器内部")[0]
      .style.setProperty("background", 图像序号指示器颜色_当前, "important");
  } else if (图像索引 <= 9) {
    let 之前图像索引 = 图像索引 === 9 ? 0 : 图像索引 + 1;
    图像序号指示器组[之前图像索引].getElementsByClassName(
      "指示器内部"
    )[0].style.background = 图像序号指示器颜色_未选中;
    图像序号指示器组[图像索引]
      .getElementsByClassName("指示器内部")[0]
      .style.setProperty("background", 图像序号指示器颜色_当前, "important");
  } else if (图像索引 >= 20) {
    let 之前图像索引 = 图像索引 === 29 ? 0 : 图像索引 - 图像数量 * 2 + 1;
    图像序号指示器组[之前图像索引].getElementsByClassName(
      "指示器内部"
    )[0].style.background = 图像序号指示器颜色_未选中;
    图像序号指示器组[图像索引 - 图像数量 * 2]
      .getElementsByClassName("指示器内部")[0]
      .style.setProperty("background", 图像序号指示器颜色_当前, "important");
  }

  window.removeEventListener("mousemove", 获取鼠标坐标);
  //---------- ↑ 根据鼠标位置，判断鼠标是否位于左右图上，如是，则左右图覆盖层透明度改为 25% ----------

  左箭头.addEventListener("click", 点击左箭头);
  左箭头.style.filter = "brightness(100%)";
}

function 点击右箭头() {
  图像自动滚动中 = true;
  右箭头.removeEventListener("click", 点击右箭头);
  图像索引++;
  图像位移 -= 图像容器宽度;

  const 图覆盖后2 =
    长廊1区图像容器组[图像索引 + 2].getElementsByClassName("img-overlay")[0];
  const 图覆盖当前 =
    长廊1区图像容器组[图像索引].getElementsByClassName("img-overlay")[0];
  const 图覆盖前2 =
    长廊1区图像容器组[图像索引 - 2].getElementsByClassName("img-overlay")[0];
  图覆盖后2.removeEventListener("click", 点击右箭头);
  图覆盖前2.removeEventListener("click", 点击左箭头);
  图覆盖当前.removeEventListener("click", 点击左箭头);
  图覆盖当前.removeEventListener("click", 点击右箭头);

  let 图覆盖前1 =
    长廊1区图像容器组[图像索引 - 1].getElementsByClassName("img-overlay")[0];
  let 图覆盖后1 =
    长廊1区图像容器组[图像索引 + 1].getElementsByClassName("img-overlay")[0];

  图覆盖前1.style.opacity = "0.5";
  图覆盖后1.style.opacity = "0.5";
  图覆盖当前.style.opacity = "0";

  图像滑块组.style.transition = `transform ${图像移动时长}ms ease-out, left 250ms ease-out`;
  图像滑块组.style.transform = `translateX(${图像位移}px)`;
  if (mouseIsEnter) {
    右箭头.style.filter = "brightness(50%)";
  }

  if (图像索引 >= 初始图像索引 + 图像数量) {
    初始化图像覆盖透明度();
  }

  //---------- ↓ 根据鼠标位置，判断鼠标是否位于左右图上，如是，则左右图覆盖层透明度改为 25% ----------
  window.addEventListener("mousemove", 获取鼠标坐标);
  //---------- ↑ 根据鼠标位置，判断鼠标是否位于左右图上，如是，则左右图覆盖层透明度改为 25% ----------

  setTimeout(点击右箭头延迟运行, 图像移动时长);
}

function 图像长廊位移重置() {
  图像滑块组.style.transition = "transform 0ms, left 250ms ease-out";
  图像滑块组.style.transform = `translateX(${初始图像位移}px)`;
}

function 点击右箭头延迟运行() {
  if (图像索引 >= 初始图像索引 + 图像数量) {
    图像索引 = 初始图像索引;
    图像位移 = 初始图像位移;
    图像长廊位移重置();
  }

  图覆盖后1 =
    长廊1区图像容器组[图像索引 + 1].getElementsByClassName("img-overlay")[0];
  图覆盖前1 =
    长廊1区图像容器组[图像索引 - 1].getElementsByClassName("img-overlay")[0];
  图覆盖后1.addEventListener("click", 点击右箭头);
  图覆盖前1.addEventListener("click", 点击左箭头);

  //---------- ↓ 根据鼠标位置，判断鼠标是否位于左右图上，如是，则左右图覆盖层透明度改为 25% ----------
  let previousOffset = 图覆盖前1.getBoundingClientRect();
  let previousOffsetLeft = previousOffset.left;
  let previousOffsetTop = previousOffset.top;
  let nextOffset = 图覆盖后1.getBoundingClientRect();
  let nextOffsetLeft = nextOffset.left;
  let nextOffsetTop = nextOffset.top;
  if (
    鼠标x >= previousOffsetLeft &&
    鼠标x <= previousOffsetLeft + 覆盖层宽度 &&
    鼠标y >= previousOffsetTop &&
    鼠标y <= previousOffsetTop + 覆盖层高度
  ) {
    图覆盖前1.style.opacity = "0.25";
  } else if (
    鼠标x >= nextOffsetLeft &&
    鼠标x <= nextOffsetLeft + 覆盖层宽度 &&
    鼠标y >= nextOffsetTop &&
    鼠标y <= nextOffsetTop + 覆盖层高度
  ) {
    图覆盖后1.style.opacity = "0.25";
  }

  if (图像索引 >= 10 && 图像索引 <= 19) {
    let 之前图像索引 = 图像索引 === 10 ? 9 : 图像索引 - 图像数量 - 1;
    图像序号指示器组[之前图像索引].getElementsByClassName(
      "指示器内部"
    )[0].style.background = 图像序号指示器颜色_未选中;
    图像序号指示器组[图像索引 - 图像数量]
      .getElementsByClassName("指示器内部")[0]
      .style.setProperty("background", 图像序号指示器颜色_当前, "important");
  } else if (图像索引 <= 9) {
    let 之前图像索引 = 图像索引 === 0 ? 9 : 图像索引 - 1;
    图像序号指示器组[之前图像索引].getElementsByClassName(
      "指示器内部"
    )[0].style.background = 图像序号指示器颜色_未选中;
    图像序号指示器组[图像索引]
      .getElementsByClassName("指示器内部")[0]
      .style.setProperty("background", 图像序号指示器颜色_当前, "important");
  } else if (图像索引 >= 20) {
    let 之前图像索引 = 图像索引 === 20 ? 9 : 图像索引 - 图像数量 * 2 - 1;
    图像序号指示器组[之前图像索引].getElementsByClassName(
      "指示器内部"
    )[0].style.background = 图像序号指示器颜色_未选中;
    图像序号指示器组[图像索引 - 图像数量 * 2]
      .getElementsByClassName("指示器内部")[0]
      .style.setProperty("background", 图像序号指示器颜色_当前, "important");
  }

  window.removeEventListener("mousemove", 获取鼠标坐标);
  //---------- ↑ 根据鼠标位置，判断鼠标是否位于左右图上，如是，则左右图覆盖层透明度改为 25% ----------

  右箭头.addEventListener("click", 点击右箭头);
  右箭头.style.filter = "brightness(100%)";
  图像自动滚动中 = false;
}

let 当前图像指示器索引 = -1;

Array.from(图像序号指示器组).forEach((指示器) => {
  指示器.addEventListener("click", 点击图像序号指示器);
});

// --------------------- ↓ 点击图像序号指示器 ---------------------
function 点击图像序号指示器(event) {
  if (图像自动滚动中) return;
  图像受指示器滚动中 = true;
  clearInterval(图像长廊定时滚动);
  图像长廊定时滚动 = null;
  Array.from(图像序号指示器组).forEach((指示器) => {
    指示器.removeEventListener("click", 点击图像序号指示器);
  });
  let 之前图像指示器索引 = 图像索引;
  if (图像索引 >= 10 && 图像索引 <= 19) {
    之前图像指示器索引 = 图像索引 - 图像数量;
  } else if (图像索引 >= 20) {
    之前图像指示器索引 = 图像索引 - 图像数量 * 2;
  }

  长廊1区图像容器组.forEach((element) => {
    const 覆盖层 = element.getElementsByClassName("img-overlay")[0];
    覆盖层.removeEventListener("click", 点击左箭头);
    覆盖层.removeEventListener("click", 点击右箭头);
  });

  let 图覆盖当前 =
    长廊1区图像容器组[图像索引].getElementsByClassName("img-overlay")[0];
  let 图覆盖前1 =
    长廊1区图像容器组[图像索引 - 1].getElementsByClassName("img-overlay")[0];
  let 图覆盖后1 =
    长廊1区图像容器组[图像索引 + 1].getElementsByClassName("img-overlay")[0];

  图覆盖前1.style.opacity = "0";
  图覆盖后1.style.opacity = "0";
  图覆盖当前.style.opacity = "0";

  当前图像指示器索引 = Array.from(图像序号指示器组).indexOf(event.target);

  图像索引 = 当前图像指示器索引 + 图像数量; //点击指示器后更新索引
  switch (当前图像指示器索引) {
    case 0:
      图像位移 = 初始图像位移 + 图像容器宽度 * 4;
      break;
    case 1:
      图像位移 = 初始图像位移 + 图像容器宽度 * 3;
      break;
    case 2:
      图像位移 = 初始图像位移 + 图像容器宽度 * 2;
      break;
    case 3:
      图像位移 = 初始图像位移 + 图像容器宽度 * 1;
      break;
    case 4:
      图像位移 = 初始图像位移;
      break;
    case 5:
      图像位移 = 初始图像位移 - 图像容器宽度 * 1;
      break;
    case 6:
      图像位移 = 初始图像位移 - 图像容器宽度 * 2;
      break;
    case 7:
      图像位移 = 初始图像位移 - 图像容器宽度 * 3;
      break;
    case 8:
      图像位移 = 初始图像位移 - 图像容器宽度 * 4;
      break;
    case 9:
      图像位移 = 初始图像位移 - 图像容器宽度 * 5;
      break;
  }

  图像滑块组.style.transform = `translateX(${图像位移}px)`; //先移动图像

  图覆盖当前 =
    长廊1区图像容器组[图像索引].getElementsByClassName("img-overlay")[0];
  图覆盖前1 =
    长廊1区图像容器组[图像索引 - 1].getElementsByClassName("img-overlay")[0];
  图覆盖后1 =
    长廊1区图像容器组[图像索引 + 1].getElementsByClassName("img-overlay")[0];
  图覆盖前1.style.opacity = "0.5";
  图覆盖后1.style.opacity = "0.5";
  图覆盖当前.style.opacity = "0";

  window.addEventListener("mousemove", (e) => {
    获取鼠标坐标(e);
  });

  setTimeout(() => {
    图覆盖前1.addEventListener("click", 点击左箭头);
    图覆盖后1.addEventListener("click", 点击右箭头);
    图像序号指示器组[之前图像指示器索引].getElementsByClassName(
      "指示器内部"
    )[0].style.background = 图像序号指示器颜色_未选中;
    图像序号指示器组[当前图像指示器索引]
      .getElementsByClassName("指示器内部")[0]
      .style.setProperty("background", 图像序号指示器颜色_当前, "important");

    // ---------- ↓ 判断鼠标是否位于视口图像内，如是，则停止自动滚动 ----------
    let previousOffset = 图覆盖前1.getBoundingClientRect();
    let previousOffsetLeft = previousOffset.left;
    let previousOffsetTop = previousOffset.top;
    let nextOffset = 图覆盖后1.getBoundingClientRect();
    let nextOffsetLeft = nextOffset.left;
    let nextOffsetTop = nextOffset.top;
    let currentOffset = 图覆盖当前.getBoundingClientRect();
    let currentOffsetLeft = currentOffset.left;
    let currentOffsetTop = currentOffset.top;
    if (
      !(
        (鼠标x >= previousOffsetLeft &&
          鼠标x <= previousOffsetLeft + 覆盖层宽度 &&
          鼠标y >= previousOffsetTop &&
          鼠标y <= previousOffsetTop + 覆盖层高度) ||
        (鼠标x >= nextOffsetLeft &&
          鼠标x <= nextOffsetLeft + 覆盖层宽度 &&
          鼠标y >= nextOffsetTop &&
          鼠标y <= nextOffsetTop + 覆盖层高度) ||
        (鼠标x >= currentOffsetLeft &&
          鼠标x <= currentOffsetLeft + 覆盖层宽度 &&
          鼠标y >= currentOffsetTop &&
          鼠标y <= currentOffsetTop + 覆盖层高度)
      )
    ) {
      图像长廊定时滚动 = setInterval(点击右箭头, 自动滚动延时);
    }
    // ---------- ↑ 判断鼠标是否位于视口图像内，如是，则停止自动滚动 ----------

    window.removeEventListener("mousemove", 获取鼠标坐标);
    Array.from(图像序号指示器组).forEach((指示器) => {
      指示器.addEventListener("click", 点击图像序号指示器);
    });
    图像受指示器滚动中 = false;
  }, 图像移动时长);
}
// --------------------- ↑ 点击图像序号指示器 ---------------------

function 初始化左右图像功能() {
  const 图覆盖后1 =
    长廊1区图像容器组[初始图像索引 + 1].getElementsByClassName(
      "img-overlay"
    )[0];
  const 图覆盖后2 =
    长廊1区图像容器组[初始图像索引 + 2].getElementsByClassName(
      "img-overlay"
    )[0];
  const 图覆盖当前 =
    长廊1区图像容器组[初始图像索引].getElementsByClassName("img-overlay")[0];
  const 图覆盖前1 =
    长廊1区图像容器组[初始图像索引 - 1].getElementsByClassName(
      "img-overlay"
    )[0];
  const 图覆盖前2 =
    长廊1区图像容器组[初始图像索引 - 2].getElementsByClassName(
      "img-overlay"
    )[0];

  图覆盖后1.addEventListener("click", 点击右箭头);
  图覆盖前1.addEventListener("click", 点击左箭头);
  图覆盖后2.removeEventListener("click", 点击右箭头);
  图覆盖前2.removeEventListener("click", 点击左箭头);
  图覆盖当前.removeEventListener("click", 点击左箭头);
  图覆盖当前.removeEventListener("click", 点击右箭头);
}

//-------------------- ↓ 图像长廊标题显隐观察 -----------------------
const 图像长廊区 = document.getElementsByClassName("图像长廊区")[0];
const 图像长廊标题 = 图像长廊区.getElementsByClassName("图像长廊标题")[0];
const 图像长廊标题_p标签 = 图像长廊标题.getElementsByTagName("p");
const p标签宽度 = 图像长廊标题_p标签[0].style.width;

function 观察者回调(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      图像长廊标题_p标签[0].style.transform = "translateX(0)";
      图像长廊标题_p标签[0].style.opacity = "1";
      图像长廊标题_p标签[1].style.transform = "translateX(0)";
      图像长廊标题_p标签[1].style.opacity = "1";
    } else {
      图像长廊标题_p标签[0].style.transform = "translateX(-40%)";
      图像长廊标题_p标签[0].style.opacity = "0";
      图像长廊标题_p标签[1].style.transform = "translateX(40%)";
      图像长廊标题_p标签[1].style.opacity = "0";
    }
  });
}

let options = {
  threshold: 0.35,
};

let 观察者 = new IntersectionObserver(观察者回调, options);
观察者.observe(图像长廊区);
//-------------------- ↑ 图像长廊标题显隐观察 -----------------------