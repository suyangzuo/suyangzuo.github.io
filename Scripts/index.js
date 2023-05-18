const 图像滑块组 = document.getElementsByClassName("图像滑块组")[0];
const 图像滑块组成员 = 图像滑块组.getElementsByClassName("图像滑块");

图像滑块组成员[0].innerHTML = 图像滑块组成员[1].innerHTML;
图像滑块组成员[2].innerHTML = 图像滑块组成员[1].innerHTML;

const 长廊1区图像容器组 = Array.from(
  document.getElementsByClassName("图像容器")
);

const 箭头组 = document.getElementsByClassName("箭头");
const 左箭头 = 箭头组[0];
const 右箭头 = 箭头组[1];

const 自动滚动延时 = 4000;
const 图像数量 = 10;
const 图像移动时长 = 350;
const 图像容器宽度 = 800;

const 初始图像位移 = 400;
let 图像位移 = 初始图像位移; // --> 图像容器宽度 / 2
const 初始图像索引 = 图像数量 - 1 + 图像数量 / 2;
let 图像索引 = 初始图像索引; // --> 中间滑块的第5张图

let mouseIsEnter = false; // --> 判断鼠标是否悬停在箭头上

let 图像长廊定时滚动 = setInterval(点击右箭头, 自动滚动延时);

let 当前所指图像索引 = 初始图像索引;

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
    clearInterval(图像长廊定时滚动);
    当前所指图像索引 = 长廊1区图像容器组.indexOf(图像容器);
    if (当前所指图像索引 !== 图像索引) {
      图像覆盖.style.opacity = 0.25;
      if (当前所指图像索引 > 图像索引) {
        图像滑块组.style.left = "-0.5%";
      } else {
        图像滑块组.style.left = "0.5%";
      }
    }
  });

  图像覆盖.addEventListener("mouseleave", () => {
    图像长廊定时滚动 = setInterval(点击右箭头, 自动滚动延时);
    当前所指图像索引 = 长廊1区图像容器组.indexOf(图像容器);
    if (当前所指图像索引 !== 图像索引) {
      图像覆盖.style.opacity = 0.5;
      图像滑块组.style.left = "0";
    }
  });
});
// ------- ↑ 此处有Bug：当鼠标不动、图片移动时，mouseenter 和 mouseleave 无法触发-------

左箭头.addEventListener("click", 点击左箭头);
右箭头.addEventListener("click", 点击右箭头);

左箭头.addEventListener("mouseenter", () => {
  mouseIsEnter = true;
  clearInterval(图像长廊定时滚动);
});

左箭头.addEventListener("mouseleave", () => {
  mouseIsEnter = false;
  图像长廊定时滚动 = setInterval(点击右箭头, 自动滚动延时);
});

右箭头.addEventListener("mouseenter", () => {
  mouseIsEnter = true;
  clearInterval(图像长廊定时滚动);
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

  长廊1区图像容器组[图像索引 - 1].getElementsByClassName(
    "img-overlay"
  )[0].style.opacity = "0.5";
  长廊1区图像容器组[图像索引].getElementsByClassName(
    "img-overlay"
  )[0].style.opacity = "0";
  长廊1区图像容器组[图像索引 + 1].getElementsByClassName(
    "img-overlay"
  )[0].style.opacity = "0.5";
  图像滑块组.style.transition = `transform ${图像移动时长}ms ease-out, left 250ms ease-out`;
  图像滑块组.style.transform = `translateX(${图像位移}px)`;
  if (mouseIsEnter) {
    左箭头.style.filter = "brightness(50%)";
  }

  if (图像索引 <= 初始图像索引 - 图像数量) {
    初始化图像覆盖透明度();
  }

  setTimeout(() => {
    if (图像索引 <= 初始图像索引 - 图像数量) {
      图像索引 = 初始图像索引;
      图像位移 = 初始图像位移;
      图像长廊位移重置();
    }

    const 图覆盖后1 =
      长廊1区图像容器组[图像索引 + 1].getElementsByClassName("img-overlay")[0];
    const 图覆盖前1 =
      长廊1区图像容器组[图像索引 - 1].getElementsByClassName("img-overlay")[0];
    图覆盖后1.addEventListener("click", 点击右箭头);
    图覆盖前1.addEventListener("click", 点击左箭头);

    左箭头.addEventListener("click", 点击左箭头);
    左箭头.style.filter = "brightness(100%)";
  }, 图像移动时长);
}

function 点击右箭头() {
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

  const 图覆盖前1 =
    长廊1区图像容器组[图像索引 - 1].getElementsByClassName("img-overlay")[0];
  const 图覆盖后1 =
    长廊1区图像容器组[图像索引 + 1].getElementsByClassName("img-overlay")[0];
  图覆盖前1.style.opacity = "0.5";
  图覆盖后1.style.opacity = "0.5";
  长廊1区图像容器组[图像索引].getElementsByClassName(
    "img-overlay"
  )[0].style.opacity = "0";

  图像滑块组.style.transition = `transform ${图像移动时长}ms ease-out, left 250ms ease-out`;
  图像滑块组.style.transform = `translateX(${图像位移}px)`;
  if (mouseIsEnter) {
    右箭头.style.filter = "brightness(50%)";
  }

  if (图像索引 >= 初始图像索引 + 图像数量) {
    初始化图像覆盖透明度();
  }

  setTimeout(() => {
    if (图像索引 >= 初始图像索引 + 图像数量) {
      图像索引 = 初始图像索引;
      图像位移 = 初始图像位移;
      图像长廊位移重置();
    }

    const 图覆盖后1 =
      长廊1区图像容器组[图像索引 + 1].getElementsByClassName("img-overlay")[0];
    const 图覆盖前1 =
      长廊1区图像容器组[图像索引 - 1].getElementsByClassName("img-overlay")[0];
    图覆盖后1.addEventListener("click", 点击右箭头);
    图覆盖前1.addEventListener("click", 点击左箭头);

    右箭头.addEventListener("click", 点击右箭头);
    右箭头.style.filter = "brightness(100%)";
  }, 图像移动时长);
}

function 图像长廊位移重置() {
  图像滑块组.style.transition = "transform 0ms, left 250ms ease-out";
  图像滑块组.style.transform = `translateX(${初始图像位移}px)`;
}

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
