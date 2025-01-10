const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 栈内容高度 = parseInt(rootStyle.getPropertyValue("--栈内容高度"), 10);
const 栈内容间距 = parseInt(rootStyle.getPropertyValue("--栈内容间距"), 10);
const 栈容量 = 8;
let 栈指针 = -1;
let 当前图源 = document.querySelector(".当前资源").querySelector("img").src;
const 资源组 = document.querySelectorAll(".资源");
const 栈 = document.querySelector(".栈");
const 栈内容组 = document.getElementsByClassName("栈内容");
const 索引区 = document.querySelector(".索引区");
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

刷新索引();

function 刷新索引() {
  索引区.innerHTML = "";
  const 栈内容组 = document.querySelectorAll(".栈内容");
  if (栈内容组.length > 0) {
    for (const [索引, 资源] of 栈内容组.entries()) {
      const 索引容器 = document.createElement("div");
      索引容器.className = "索引容器";
      索引区.appendChild(索引容器);
      const 索引元素 = document.createElement("span");
      索引元素.className = "索引";
      索引元素.textContent = (栈内容组.length - 索引 - 1).toString();
      索引容器.appendChild(索引元素);
    }
  }
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

btn_Push.addEventListener("click", () => {
  Push();
});

btn_Pop.addEventListener("click", () => {
  Pop();
});

function IsEmpty() {
  return 栈指针 < 0;
}

function IsFull() {
  const 栈内容数量 = 栈.querySelectorAll(".栈内容").length;
  return 栈内容数量 === 栈容量;
}

function Peek() {
  if (IsEmpty()) {
    return;
  }

  return 栈[栈指针];
}

function Push() {
  if (IsFull()) {
    栈.animate(栈操作动画关键帧, 栈操作动画设置);
    return;
  }
  const 栈内容 = document.createElement("figure");
  栈内容.className = "栈内容";
  const img = document.createElement("img");
  img.src = 当前图源;
  栈内容.appendChild(img);
  栈.appendChild(栈内容);
  刷新索引();
  栈指针++;
  刷新栈指针位置();
}

function Pop() {
  if (IsEmpty()) {
    栈.animate(栈操作动画关键帧, 栈操作动画设置);
    return;
  }
  const 最后栈内容 = 栈.querySelector(".栈内容:last-of-type");
  最后栈内容.remove();
  刷新索引();
  栈指针--;
  刷新栈指针位置();
}

function 刷新栈指针位置() {
  const 垂直偏移 = -(栈内容高度 + 栈内容间距) * 栈指针;
  root.style.setProperty("--指针垂直偏移", `${垂直偏移}px`);
}
