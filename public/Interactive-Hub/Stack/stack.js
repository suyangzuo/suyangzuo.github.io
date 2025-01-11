const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 栈内容高度 = parseInt(rootStyle.getPropertyValue("--栈内容高度"), 10);
const 栈内容间距 = parseInt(rootStyle.getPropertyValue("--栈内容间距"), 10);
const 栈容量 = 8;
let 栈指针 = -1;
let 当前图源 = document.querySelector(".当前资源").querySelector("img").src;
const 资源组 = document.querySelectorAll(".资源");
const 栈 = document.querySelector(".栈");
const 极效模式 = document.getElementById("极效模式");
const 传统模式 = document.getElementById("传统模式");

for (let i = 0; i < 栈容量; i++) {
  const 栈内容 = document.createElement("figure");
  栈内容.className = "栈内容 已删除";
  const img = document.createElement("img");
  img.src = "";
  img.alt = "栈内容图像";
  栈内容.appendChild(img);
  栈.appendChild(栈内容);
}

const 栈内容组 = document.getElementsByClassName("栈内容");
const 索引组 = document.getElementsByClassName("索引");
const 索引区 = document.querySelector(".索引区");

for (let i = 0; i < 栈容量; i++) {
  const 索引容器 = document.createElement("div");
  索引容器.className = "索引容器";
  索引区.appendChild(索引容器);
  const 索引元素 = document.createElement("span");
  索引元素.className = "索引";
  索引元素.textContent = i.toString();
  索引容器.appendChild(索引元素);
}

const btn_reset = document.querySelector(".重置按钮");
btn_reset.addEventListener("click", 重置参数);

const btn_IsEmpty = document.getElementById("IsEmpty");
const btn_IsFull = document.getElementById("IsFull");
const btn_Peek = document.getElementById("Peek");
const btn_Push = document.getElementById("Push");
const btn_Pop = document.getElementById("Pop");
let 当前资源 = 资源组[0];
for (const 资源 of 资源组) {
  资源.addEventListener("click", () => {
    if (资源.classList.contains("当前资源")) {
      return;
    }

    资源.classList.add("当前资源");
    当前资源.classList.remove("当前资源");
    当前资源 = 资源;
    当前图源 = 当前资源.querySelector("img").src;
  });
}

const 栈操作动画关键帧 = [
  { backgroundColor: "transparent" },
  { backgroundColor: "firebrick" },
  { backgroundColor: "transparent" },
  { backgroundColor: "firebrick" },
  { backgroundColor: "transparent" },
];

const 栈操作动画设置 = {
  easing: "linear",
  duration: 750,
};

const 空满判断动画关键帧 = [
  { opacity: 0 },
  { opacity: 1, offset: 0.01 },
  { opacity: 1, offset: 0.99 },
  { opacity: 0 },
];

const 空满判断动画设置 = {
  easing: "linear",
  duration: 1000,
};

const 栈动画时长 = 500;

btn_IsEmpty.addEventListener("click", () => {
  const 真假 = btn_IsEmpty.querySelector(".真假");
  const img = 真假.querySelector("img");
  if (IsEmpty(栈指针)) {
    img.src = "./Images/真.png";
  } else {
    img.src = "./Images/假.png";
  }
  真假.animate(空满判断动画关键帧, 空满判断动画设置);
});

btn_IsFull.addEventListener("click", () => {
  const 真假 = btn_IsFull.querySelector(".真假");
  const img = 真假.querySelector("img");
  if (IsFull(栈指针, 栈)) {
    img.src = "./Images/真.png";
  } else {
    img.src = "./Images/假.png";
  }
  真假.animate(空满判断动画关键帧, 空满判断动画设置);
});

btn_Push.addEventListener("click", Push);

btn_Pop.addEventListener("click", Pop);

btn_Peek.addEventListener("click", Peek);

传统模式.addEventListener("change", () => {
  for (let i = 栈指针 + 1; i < 栈容量; i++) {
    栈内容组[i].classList.add("已删除");
    索引组[i].classList.remove("已添加");
  }
});

function IsEmpty() {
  return 栈指针 < 0;
}

function IsFull() {
  return 栈指针 === 栈容量 - 1;
}

function Peek() {
  if (IsEmpty()) {
    栈.animate(栈操作动画关键帧, 栈操作动画设置);
    return;
  }

  const 当前栈内容 = 栈内容组[栈指针];
  const peek动画关键帧 = [
    { scale: 1 },
    { scale: 1.5 },
    { scale: 1 },
    { scale: 1.5 },
    { scale: 1 },
  ];

  const peek动画设置 = {
    easing: "linear",
    duration: 500,
  };

  当前栈内容.animate(peek动画关键帧, peek动画设置);
}

function Push() {
  if (IsFull()) {
    栈.animate(栈操作动画关键帧, 栈操作动画设置);
    return;
  }
  if (栈指针 >= 0) {
    索引组[栈指针].classList.remove("当前索引");
  }
  栈指针++;
  索引组[栈指针].classList.add("已添加");
  索引组[栈指针].classList.add("当前索引");
  const 当前栈内容 = 栈内容组[栈指针];
  setTimeout(
    () => {
      当前栈内容.querySelector("img").src = 当前图源;
    },
    极效模式.checked ? 栈动画时长 : 0,
  );
  setTimeout(() => {
    当前栈内容.classList.remove("已删除");
  }, 栈动画时长);
  刷新栈指针位置();
  生成push动画();
}

function Pop() {
  if (IsEmpty()) {
    栈.animate(栈操作动画关键帧, 栈操作动画设置);
    return;
  }
  const 最后栈内容 = 栈内容组[栈指针];
  if (!极效模式.checked) {
    最后栈内容.classList.add("已删除");
    索引组[栈指针].classList.remove("已添加");
    生成pop动画(最后栈内容);
  }
  索引组[栈指针].classList.remove("当前索引");
  栈指针--;
  if (栈指针 >= 0) {
    索引组[栈指针].classList.add("当前索引");
  }
  刷新栈指针位置();
}

function 刷新栈指针位置() {
  const 垂直偏移 = -(栈内容高度 + 栈内容间距) * 栈指针;
  root.style.setProperty("--指针垂直偏移", `${垂直偏移}px`);
}

function 生成push动画() {
  const push动画 = document.createElement("img");
  push动画.className = "栈动画元素 push动画元素";
  push动画.src = 当前图源;
  push动画.alt = "push动画";
  栈.appendChild(push动画);
  const 垂直偏移 = `${栈内容组[栈指针].offsetTop}px`;
  push动画.style.translate = `-50% ${垂直偏移}`;
  setTimeout(() => {
    push动画?.remove();
  }, 栈动画时长);
}

function 生成pop动画(弹出栈内容) {
  const pop动画 = document.createElement("img");
  pop动画.className = "栈动画元素 pop动画元素";
  pop动画.src = 弹出栈内容.querySelector("img").src;
  pop动画.alt = "pop动画";
  栈.appendChild(pop动画);
  const 垂直偏移 = `${弹出栈内容.offsetTop}px`;
  const pop动画关键帧 = [
    { translate: `-50% ${垂直偏移}` },
    { translate: "-50% -150px" },
  ];
  const pop动画设置 = {
    easing: "ease-out",
    duration: 栈动画时长,
    fill: "forwards",
  };
  pop动画.animate(pop动画关键帧, pop动画设置);
  setTimeout(() => {
    pop动画?.remove();
  }, 栈动画时长);
}

function 重置参数() {
  for (const 栈内容 of 栈内容组) {
    栈内容.classList.add("已删除");
  }

  for (const 索引 of 索引组) {
    索引.classList.remove("已添加");
  }

  传统模式.checked = true;
  栈指针 = -1;
  刷新栈指针位置();
}
