let 当前角色图 = "./Images/1.png";

const 自动更换复选框 = document.getElementById("自动更换");
const 角色区 = document.querySelector(".角色区");
const 角色容器组 = [];
for (let i = 0; i < 16; i++) {
  const 角色容器 = document.createElement("figure");
  角色容器.className = "角色容器";
  if (i === 0) {
    角色容器.classList.add("当前角色");
  }
  角色区.appendChild(角色容器);

  const img = document.createElement("img");
  img.className = "角色图";
  img.src = `./Images/${i + 1}.png`;
  img.alt = `角色${i + 1}`;
  角色容器.appendChild(img);
  角色容器组.push(角色容器);
}

const 队列容器 = document.querySelector(".队列容器");
const 警告容器 = document.querySelector(".警告容器");
const 队列成员组 = document.querySelectorAll(".队列成员");
const 索引容器 = document.querySelector(".索引容器");
for (const [index, 队列成员] of 队列成员组.entries()) {
  const 序号容器 = document.createElement("span");
  序号容器.className = "序号容器";
  队列成员.appendChild(序号容器);

  const 队列图像容器 = document.createElement("figure");
  队列图像容器.className = "队列图像容器 无人";
  队列成员.appendChild(队列图像容器);
  const img = document.createElement("img");
  img.src = `./Images/1.png`;
  img.className = "队列图像";
  队列图像容器.appendChild(img);

  const 索引成员 = document.createElement("span");
  索引成员.className = "索引成员 无人";
  索引成员.textContent = index;
  索引容器.appendChild(索引成员);
}

角色容器组.forEach((角色容器, index) => {
  角色容器.addEventListener("click", () => {
    const 当前角色 = 角色区.querySelector(".当前角色");
    if (当前角色 === 角色容器) {
      return;
    }
    当前角色.classList.remove("当前角色");
    角色容器.classList.add("当前角色");
    当前角色图 = `./Images/${index + 1}.png`;
  });
});

const 索引成员组 = document.querySelectorAll(".索引成员");

let 头指针 = -1;
let 尾指针 = -1;
let 出队元素 = null;

const 头指针容器 = document.querySelector(".头指针容器");
const 尾指针容器 = document.querySelector(".尾指针容器");

const 空按钮 = document.getElementById("空");
const 满按钮 = document.getElementById("满");
const 入队按钮 = document.getElementById("入队");
const 出队按钮 = document.getElementById("出队");
const 清空按钮 = document.getElementById("清空");

let 出入判断动画 = null;
const 出入关键帧序列 = [
  { backgroundColor: "brown" },
  { backgroundColor: "transparent" },
  { backgroundColor: "brown" },
  { backgroundColor: "transparent" },
];

const 出入动画设置 = {
  duration: 500,
};

入队按钮.addEventListener("click", () => {
  if (队列满()) {
    出入判断动画?.cancel();
    出入判断动画 = 警告容器.animate(出入关键帧序列, 出入动画设置);
    return;
  }

  队列容器.classList.remove("空");
  // 队列成员组[尾指针]?.classList.remove("尾");
  索引成员组[尾指针]?.classList.remove("尾");
  if (头指针 === -1) {
    头指针 = 0;
    // 队列成员组[头指针].classList.add("头");
    索引成员组[头指针].classList.add("头");
    头指针容器.style.translate = `${头指针 * 100}% 0`;
    队列容器.style.setProperty("--头指针指示框水平偏移", `${头指针 * 100}%`);
  }
  尾指针 = (尾指针 + 1) % 队列成员组.length;
  尾指针容器.style.translate = `${尾指针 * 100}% 0`;
  队列容器.style.setProperty("--尾指针指示框水平偏移", `${尾指针 * 100}%`);
  if (头指针 !== 尾指针) {
    队列容器.classList.remove("头尾相等");
  } else {
    队列容器.classList.add("头尾相等");
  }
  队列成员组[尾指针].classList.remove("无人");
  // 队列成员组[尾指针].classList.add("尾");
  索引成员组[尾指针].classList.add("尾");
  索引成员组[尾指针].classList.remove("无人");

  const 队列图像 = 队列成员组[尾指针].querySelector(".队列图像");
  队列图像.src = 当前角色图;
  队列图像.parentElement.classList.remove("无人");

  if (自动更换复选框.checked) {
    const index = Math.floor(Math.random() * 角色容器组.length);
    当前角色图 = `./Images/${index + 1}.png`;
    const 当前角色 = 角色区.querySelector(".当前角色");
    当前角色.classList.remove("当前角色");
    角色容器组[index].classList.add("当前角色");
  }
});

出队按钮.addEventListener("click", () => {
  if (队列空()) {
    出入判断动画?.cancel();
    出入判断动画 = 警告容器.animate(出入关键帧序列, 出入动画设置);
    return;
  }
  // 队列成员组[头指针].classList.remove("头");
  索引成员组[头指针].classList.remove("头");
  队列成员组[头指针].classList.add("无人");
  索引成员组[头指针].classList.add("无人");
  出队元素 = 队列成员组[头指针];
  const 队列图像 = 队列成员组[头指针].querySelector(".队列图像");
  队列图像.parentElement.classList.add("无人");
  if (头指针 === 尾指针) {
    // 队列成员组[尾指针].classList.remove("尾");
    索引成员组[尾指针].classList.remove("尾");
    头指针 = -1;
    尾指针 = -1;
    队列容器.classList.add("空");
  } else {
    头指针 = (头指针 + 1) % 队列成员组.length;
  }
  头指针容器.style.translate = `${头指针 * 100}% 0`;
  尾指针容器.style.translate = `${尾指针 * 100}% 0`;
  队列容器.style.setProperty("--头指针指示框水平偏移", `${头指针 * 100}%`);
  队列容器.style.setProperty("--尾指针指示框水平偏移", `${尾指针 * 100}%`);
  if (头指针 !== 尾指针) {
    队列容器.classList.remove("头尾相等");
  } else {
    队列容器.classList.add("头尾相等");
  }
  // 队列成员组[头指针]?.classList.add("头");
  索引成员组[头指针]?.classList.add("头");
});

清空按钮.addEventListener("click", 清空队列);

function 清空队列() {
  队列成员组.forEach((队列成员) => {
    /* 队列成员.classList.remove("头");
    队列成员.classList.remove("尾"); */
    队列成员.classList.add("无人");
    头指针 = -1;
    尾指针 = -1;
    头指针容器.style.translate = `${头指针 * 100}% 0`;
    尾指针容器.style.translate = `${尾指针 * 100}% 0`;

    const 队列图像容器 = 队列成员.querySelector(".队列图像容器");
    队列图像容器.classList.add("无人");
  });

  索引成员组.forEach((索引成员) => {
    索引成员.classList.remove("头");
    索引成员.classList.remove("尾");
    索引成员.classList.add("无人");
  });

  队列容器.style.setProperty("--头指针指示框水平偏移", `${头指针 * 100}%`);
  队列容器.style.setProperty("--尾指针指示框水平偏移", `${尾指针 * 100}%`);
  队列容器.classList.add("空");
  队列容器.classList.add("头尾相等");
}

const 关键帧序列 = [
  { clipPath: "inset(0 100% 0 0)", opacity: "0" },
  { opacity: "1", offset: 0.075 },
  { clipPath: "inset(0 0 0 0)", offset: 0.15 },
  { clipPath: "inset(0 0 0 0)", offset: 0.85 },
  { opacity: "1", offset: 0.925 },
  { clipPath: "inset(0 0 0 100%)", opacity: "0" },
];
const 动画设置 = {
  duration: 1000,
};
let 判断动画 = null;

空按钮.addEventListener("click", 队列空动画);
满按钮.addEventListener("click", 队列满动画);

function 队列空动画() {
  const 正确层 = 空按钮.querySelector(".正确层");
  const 错误层 = 空按钮.querySelector(".错误层");
  判断动画?.cancel();
  if (队列空()) {
    判断动画 = 正确层.animate(关键帧序列, 动画设置);
  } else {
    判断动画 = 错误层.animate(关键帧序列, 动画设置);
  }
}

function 队列满动画() {
  const 正确层 = 满按钮.querySelector(".正确层");
  const 错误层 = 满按钮.querySelector(".错误层");
  判断动画?.cancel();
  if (队列满()) {
    判断动画 = 正确层.animate(关键帧序列, 动画设置);
  } else {
    判断动画 = 错误层.animate(关键帧序列, 动画设置);
  }
}

function 队列满() {
  if ((头指针 === 0 && 尾指针 === 队列成员组.length - 1) || 头指针 === 尾指针 + 1) {
    return true;
  }
  return false;
}

function 队列空() {
  return 头指针 === -1 && 尾指针 === -1;
}

const 重置按钮 = document.querySelector(".重置按钮");
重置按钮.addEventListener("click", 清空队列);
