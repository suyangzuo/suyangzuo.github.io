const 图像滑块组 = document.getElementsByClassName("图像滑块组")[0];
const 图像滑块组成员 = 图像滑块组.getElementsByClassName("图像滑块");

图像滑块组成员[0].innerHTML = 图像滑块组成员[1].innerHTML;
图像滑块组成员[2].innerHTML = 图像滑块组成员[1].innerHTML;

const 箭头组 = document.getElementsByClassName("箭头");
const 左箭头 = 箭头组[0];
const 右箭头 = 箭头组[1];

const 自动滚动延时 = 4000;
const 图像数量 = 10;
const 图像移动时长 = 350;
const 图像容器宽度 = 800;

const 初始图像位移 = 400;
let 图像位移 = 初始图像位移; // --> 图像容器宽度 / 2
const 初始图像索引 = 5;
let 图像索引 = 初始图像索引; // --> 中间滑块的第5张图

let mouseIsOver = false; // --> 判断鼠标是否悬停在箭头上

左箭头.addEventListener("click", 点击左箭头);
右箭头.addEventListener("click", 点击右箭头);

let 图像长廊定时滚动 = setInterval(点击右箭头, 自动滚动延时);

左箭头.addEventListener("mouseenter", () => {
  mouseIsOver = true;
  clearInterval(图像长廊定时滚动);
});

左箭头.addEventListener("mouseleave", () => {
  mouseIsOver = false;
  图像长廊定时滚动 = setInterval(点击右箭头, 自动滚动延时);
});

右箭头.addEventListener("mouseenter", () => {
  mouseIsOver = true;
  clearInterval(图像长廊定时滚动);
});

右箭头.addEventListener("mouseleave", () => {
  mouseIsOver = false;
  图像长廊定时滚动 = setInterval(点击右箭头, 自动滚动延时);
});

function 点击左箭头() {
  左箭头.removeEventListener("click", 点击左箭头);
  图像索引--;
  图像位移 += 图像容器宽度;
  图像滑块组.style.transition = `transform ${图像移动时长}ms ease-out, left 250ms ease-out`;
  图像滑块组.style.transform = `translateX(${图像位移}px)`;
  if (mouseIsOver) {
    左箭头.style.filter = "brightness(50%)";
  }

  if (图像索引 <= 初始图像索引 - 图像数量) {
    setTimeout(() => {
      图像索引 = 初始图像索引;
      图像位移 = 初始图像位移;
      图像长廊位移重置();
    }, 图像移动时长);
  }

  setTimeout(() => {
    左箭头.addEventListener("click", 点击左箭头);
    左箭头.style.filter = "brightness(100%)";
  }, 图像移动时长);
}

function 点击右箭头() {
  右箭头.removeEventListener("click", 点击右箭头);
  图像索引++;
  图像位移 -= 图像容器宽度;
  图像滑块组.style.transition = `transform ${图像移动时长}ms ease-out, left 250ms ease-out`;
  图像滑块组.style.transform = `translateX(${图像位移}px)`;
  if (mouseIsOver) {
    右箭头.style.filter = "brightness(50%)";
  }

  if (图像索引 >= 初始图像索引 + 图像数量) {
    setTimeout(() => {
      图像索引 = 初始图像索引;
      图像位移 = 初始图像位移;
      图像长廊位移重置();
    }, 图像移动时长);
  }

  setTimeout(() => {
    右箭头.addEventListener("click", 点击右箭头);
    右箭头.style.filter = "brightness(100%)";
  }, 图像移动时长);
}

function 图像长廊位移重置() {
  图像滑块组.style.transition = "transform 0ms, left 250ms ease-out";
  图像滑块组.style.transform = `translateX(${初始图像位移}px)`;
}
