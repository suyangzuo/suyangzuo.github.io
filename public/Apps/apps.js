const 卡片间距 = 100;
const 卡片组 = document.querySelectorAll(".app-card");
const 卡片数量 = 卡片组.length;
const 轮播图视口 = document.querySelector(".banner-viewport");
for (const [index, 卡片] of 卡片组.entries()) {
  const 轮播卡片容器 = document.createElement("div");
  轮播卡片容器.className = "轮播卡片容器";
  轮播图视口.appendChild(轮播卡片容器);

  const 卡片图容器 = document.createElement("figure");
  卡片图容器.className = "轮播图卡片图容器";
  const 卡片图 = document.createElement("img");
  卡片图.className = "轮播图卡片图";
  const 图片 = 卡片组[index].querySelector("img");
  卡片图.src = 图片.src;
  卡片图.alt = 图片.alt;
  卡片图容器.appendChild(卡片图);
  轮播卡片容器.appendChild(卡片图容器);

  const 卡片标题与内容 = document.createElement("div");
  卡片标题与内容.className = "轮播图卡片标题与内容";
  轮播卡片容器.appendChild(卡片标题与内容);

  const 卡片标题 = document.createElement("h3");
  卡片标题.className = "轮播图卡片标题";
  const 标题 = 卡片组[index].querySelector(".app-name");
  卡片标题.textContent = 标题.textContent;
  卡片标题与内容.appendChild(卡片标题);

  const 卡片描述 = document.createElement("p");
  卡片描述.className = "轮播图卡片描述";
  const 描述 = 卡片组[index].querySelector(".app-description");
  卡片描述.textContent = 描述.textContent;
  卡片标题与内容.appendChild(卡片描述);

  const 卡片访问区 = document.createElement("div");
  卡片访问区.className = "轮播图卡片访问区";
  卡片标题与内容.appendChild(卡片访问区);

  const 访问链接 = document.createElement("a");
  访问链接.className = "轮播图卡片访问链接";
  const 链接 = 卡片组[index].querySelector(".app-link");
  访问链接.href = 链接.href;
  访问链接.textContent = "访问";
  访问链接.setAttribute("target", "_self");
  const 箭头图标 = document.createElement("i");
  箭头图标.className = "fa-solid fa-arrow-right";
  访问链接.appendChild(箭头图标);
  卡片访问区.appendChild(访问链接);

  const 作者信息 = document.createElement("div");
  作者信息.className = "轮播图卡片作者信息";
  卡片访问区.appendChild(作者信息);

  const 作者头像 = document.createElement("img");
  作者头像.className = "轮播图卡片作者头像";
  const 头像 = 卡片组[index].querySelector(".app-author img");
  作者头像.src = 头像.src;
  作者头像.alt = 头像.alt;
  作者信息.appendChild(作者头像);

  const 作者名称 = document.createElement("span");
  作者名称.className = "轮播图卡片作者名称";
  const 名称 = 卡片组[index].querySelector(".author-name");
  作者名称.textContent = 名称.textContent;
  作者信息.appendChild(作者名称);
}
const 指示器区 = document.querySelector(".指示器区");
for (const [index, 卡片] of 卡片组.entries()) {
  const 指示器 = document.createElement("span");
  指示器.className = "指示器";
  指示器区.appendChild(指示器);
  if (index === 0) {
    指示器.classList.add("当前");
  }
}
const 指示器组 = document.querySelectorAll(".指示器");
let 当前索引 = 0;
const 轮播卡片容器组 = document.querySelectorAll(".轮播卡片容器");
轮播卡片容器组[0].classList.add("当前卡片");

const 左箭头 = document.querySelector(".箭头-左");
const 右箭头 = document.querySelector(".箭头-右");

function 滚动到卡片(index) {
  轮播图视口.style.translate = `calc(${-index * 100}% - ${卡片间距 * index}px) 0`;
  轮播图视口.style.transition = "0.25s ease-out";
  指示器组.forEach((指示器, i) => {
    指示器.classList.toggle("当前", i === index);
  });

  轮播卡片容器组.forEach((容器, i) => {
    if (i === index) {
      容器.classList.add("当前卡片");
    } else {
      容器.classList.remove("当前卡片");
    }
  });

  当前索引 = index;
}

function 卡片初始化() {
  const 轮播卡片容器组 = document.querySelectorAll(".轮播卡片容器");
  const 首卡片克隆 = 轮播卡片容器组[0].cloneNode(true);
  const 尾卡片克隆 = 轮播卡片容器组[卡片数量 - 1].cloneNode(true);
  轮播图视口.appendChild(首卡片克隆);
  轮播卡片容器组[0].before(尾卡片克隆);
  尾卡片克隆.style.marginLeft = `calc(-100% - ${卡片间距}px)`;
  首卡片克隆.classList.remove("当前卡片");
}

卡片初始化();

指示器组.forEach((指示器, i) => {
  指示器.addEventListener("click", () => {
    滚动到卡片(i);
  });
});

function 向前移动() {
  if (当前索引 === 0) {
    轮播图视口.style.transition = "none";
    轮播图视口.style.translate = `calc(-${卡片数量 * 100}% - ${卡片间距 * (卡片数量 - 1)}px) 0`;
    轮播图视口.offsetWidth;
    滚动到卡片(卡片数量 - 1);
  } else {
    滚动到卡片(当前索引 - 1);
  }
}

function 向后移动() {
  if (当前索引 === 卡片数量 - 1) {
    轮播图视口.style.transition = "none";
    轮播图视口.style.translate = `100% 0`;
    轮播图视口.offsetWidth;
    滚动到卡片(0);
  } else {
    滚动到卡片(当前索引 + 1);
  }
}

左箭头.addEventListener("click", 向前移动);
右箭头.addEventListener("click", 向后移动);
