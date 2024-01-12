const 收藏栏按钮 = document.getElementById("收藏栏按钮");
const 收藏按钮 = document.getElementById("收藏按钮");
const 收藏数量 = document.getElementById("收藏数量");
const 收藏提示 = document.getElementById("收藏提示");
const 收藏栏 = document.getElementById("收藏栏");
const 收藏栏添加按钮 = document.getElementById("收藏条目-添加");
const 关闭收藏栏按钮 = document.getElementById("关闭收藏栏");

let 博客收藏 = [];

侧边栏.addEventListener("click", () => {
  localStorage.clear();
  博客收藏.length = 0;
  收藏数量.textContent = 博客收藏.length;
  console.log(博客收藏);
});

if (localStorage.getItem("博客收藏") !== null) {
  博客收藏 = JSON.parse(localStorage.getItem("博客收藏"));
}

初始化收藏区();
// 初始化收藏栏();

收藏栏按钮.addEventListener("click", 显示收藏栏);
关闭收藏栏按钮.addEventListener("click", 关闭收藏栏);

收藏栏添加按钮.addEventListener("click", () => {
  if (该页已被收藏()) {
    收藏提示.textContent = "本专题已在收藏夹中";
    收藏提示.style.color = "yellow";
    刷新收藏提示动画();
  } else {
    添加博客();
    添加收藏栏条目();
  }
});

function 初始化收藏区() {
  const 本地收藏解析结果 = JSON.parse(localStorage.getItem("博客收藏"));

  if (本地收藏解析结果 === null || 本地收藏解析结果.length === 0) return;
  let 数量 = 本地收藏解析结果.length;
  收藏数量.textContent = 数量;
  收藏数量.style.visibility = "visible";

  if (
    本地收藏解析结果?.some((收藏) => {
      收藏.技术栈 === "经验之谈" && 收藏.专题 === "首页";
    })
  ) {
    收藏按钮.style.color = "gold";
  }
}

// function 初始化收藏栏() {
//   博客收藏.forEach((博客) => {
//     添加收藏栏条目(博客.技术栈, 博客.专题);
//   });
// }

技术栈组.forEach((技术栈) => {
  技术栈.addEventListener("click", () => {
    if (
      JSON.parse(localStorage.getItem("博客收藏"))?.some((收藏) => {
        收藏.技术栈 === 技术栈名称 && 收藏.专题 === 专题名称;
      })
    ) {
      收藏按钮.style.color = "gold";
    } else {
      收藏按钮.style.color = "white";
    }
  });
});

收藏按钮.addEventListener("click", 收藏博客);

function 收藏博客() {
  if (该页已被收藏()) {
    // const 所有信息区 = document.querySelectorAll(".收藏信息区");
    // const 待删除信息区 = Array.from(所有信息区).find((信息) => {
    //   信息.querySelector(".收藏信息 .收藏文本-技术栈").textContent ===
    //     "经验之谈";
    // });
    // console.log(待删除信息区);
    // const 删除条目技术栈 = 待删除信息区
    //   .querySelector(".收藏信息-技术栈")
    //   .querySelector(".收藏信息-文本").textContent;
    // const 删除条目专题 = 待删除信息区
    //   .querySelector(".收藏信息-专题")
    //   .querySelector(".收藏信息-文本").textContent;
    // 待删除条目.remove();
    删除博客(技术栈名称, 专题名称);
  } else {
    添加博客();
    添加收藏栏条目();
  }
}

function 添加博客() {
  const 收藏时间 = 获取当前日期();

  const 当前博客 = {
    技术栈: 技术栈名称,
    专题: 专题名称,
    时间: 收藏时间,
  };

  博客收藏.push(当前博客);

  localStorage.setItem("博客收藏", JSON.stringify(博客收藏));

  收藏数量.textContent = 博客收藏.length;
  收藏数量.style.visibility = "visible";
  收藏按钮.style.color = "orange";
  收藏提示.textContent = "已添加到收藏栏";
  收藏提示.style.color = "seagreen";
  刷新收藏提示动画();
}

function 删除博客(技术栈名称参数, 专题名称参数) {
  const 博客收藏_已过滤 = 博客收藏.filter(
    (博客) => !(博客.技术栈 === 技术栈名称参数 && 博客.专题 === 专题名称参数)
  );

  localStorage.setItem("博客收藏", JSON.stringify(博客收藏_已过滤));

  博客收藏 = 博客收藏_已过滤;

  收藏数量.textContent = 博客收藏.length;
  if (收藏数量.textContent === "0") {
    收藏数量.style.visibility = "hidden";
  }
  收藏按钮.style.color = "white";

  收藏提示.textContent = "已从收藏栏删除";
  收藏提示.style.color = "hotpink";
  刷新收藏提示动画();
}

function 刷新收藏提示动画() {
  收藏提示.style.animation = "none";
  收藏提示.offsetHeight;
  收藏提示.style.animation = "收藏提示动画 1.25s ease-out";
}

function 显示收藏栏() {
  收藏栏.showModal();
}

function 关闭收藏栏() {
  收藏栏.close();
}

function 添加收藏栏条目() {
  const 条目 = document.createElement("div");
  条目.className = "收藏条目";

  const 删除条目按钮 = document.createElement("button");
  删除条目按钮.id = "删除条目按钮";
  删除条目按钮.innerHTML = "<i class='fa-solid fa-xmark'></i>";
  删除条目按钮.addEventListener("click", 点击条目删除按钮);
  条目.appendChild(删除条目按钮);

  const 收藏条目_标志 = document.createElement("figure");
  收藏条目_标志.className = "收藏条目-标志";

  const 收藏信息区 = document.createElement("div");
  收藏信息区.className = "收藏信息区";

  条目.append(收藏条目_标志, 收藏信息区);

  const image = document.createElement("img");
  const 技术栈图标 = document.querySelector(".专题名称").querySelector("img");
  image.src = 技术栈图标.src;
  image.alt = 技术栈图标.alt;
  收藏条目_标志.appendChild(image);

  const 收藏信息_技术栈 = document.createElement("p");
  收藏信息_技术栈.className = "收藏信息";
  收藏信息_技术栈.classList.add("收藏信息-技术栈");
  const fontAwesome_技术栈 = document.createElement("i");
  fontAwesome_技术栈.className = "fa-solid";
  fontAwesome_技术栈.classList.add("fa-microchip");
  fontAwesome_技术栈.classList.add("收藏信息-标志");
  const 收藏信息_文本_技术栈 = document.createElement("span");
  收藏信息_文本_技术栈.className = "收藏信息-文本";
  收藏信息_文本_技术栈.classList.add("收藏文本-技术栈");
  收藏信息_文本_技术栈.textContent = 技术栈名称;
  收藏信息_技术栈.append(fontAwesome_技术栈, 收藏信息_文本_技术栈);

  const 收藏信息_专题 = document.createElement("p");
  收藏信息_专题.className = "收藏信息";
  收藏信息_专题.classList.add("收藏信息-专题");
  const fontAwesome_专题 = document.createElement("i");
  fontAwesome_专题.className = "fa-solid";
  fontAwesome_专题.classList.add("fa-newspaper");
  fontAwesome_专题.classList.add("收藏信息-标志");
  const 收藏信息_文本_专题 = document.createElement("span");
  收藏信息_文本_专题.className = "收藏信息-文本";
  收藏信息_文本_专题.classList.add("收藏文本-专题");
  收藏信息_文本_专题.textContent = 专题名称;
  收藏信息_专题.append(fontAwesome_专题, 收藏信息_文本_专题);

  const 收藏信息_日期 = document.createElement("p");
  收藏信息_日期.className = "收藏信息";
  收藏信息_日期.classList.add("收藏信息-日期");
  const fontAwesome_日期 = document.createElement("i");
  fontAwesome_日期.className = "fa-solid";
  fontAwesome_日期.classList.add("fa-clock");
  fontAwesome_日期.classList.add("收藏信息-标志");
  const 收藏信息_文本_日期 = document.createElement("span");
  收藏信息_文本_日期.className = "收藏信息-文本";
  收藏信息_文本_日期.classList.add("收藏文本-时间");
  收藏信息_文本_日期.textContent = 获取当前日期();
  收藏信息_日期.append(fontAwesome_日期, 收藏信息_文本_日期);

  收藏信息区.append(收藏信息_技术栈, 收藏信息_专题, 收藏信息_日期);

  收藏栏添加按钮.before(条目);
}

function 点击条目删除按钮(event) {
  const 待删除条目 = event.currentTarget.parentElement;
  const 待删除信息区 = 待删除条目.querySelector(".收藏信息区");
  const 删除条目技术栈 = 待删除信息区
    .querySelector(".收藏信息-技术栈")
    .querySelector(".收藏信息-文本").textContent;
  const 删除条目专题 = 待删除信息区
    .querySelector(".收藏信息-专题")
    .querySelector(".收藏信息-文本").textContent;
  待删除条目.remove();
  删除博客(删除条目技术栈, 删除条目专题);
}

function 获取当前日期() {
  const today = new Date();
  const 收藏时间 = `${today.getFullYear()}年${
    today.getMonth() + 1
  }月${today.getDate()}日`;

  return 收藏时间;
}

function 该页已被收藏() {
  return 博客收藏.some(
    (博客) => 博客.技术栈 === 技术栈名称 && 博客.专题 === 专题名称
  );
}
