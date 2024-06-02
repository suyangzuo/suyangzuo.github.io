const 多边形修剪图分区 = 图像区.querySelector(".多边形修剪图分区");
const 点击效果图容器 = 多边形修剪图分区.querySelector(".点击效果图容器");
const 多边形操作分区 = 操作区.querySelector(".多边形操作分区");
const 多边形图像容器 = 多边形修剪图分区.querySelector(".图像容器");
const 多边形图像 = 多边形图像容器.querySelector(".图像");
const 多边形修剪代码容器 = 多边形修剪图分区.querySelector(".代码容器");
const 多边形代码区 = 多边形修剪代码容器.querySelector("code");
const 多边形修剪重置按钮 = 操作区.querySelector("#多边形修剪重置");
let 多边形修剪数据组 = [];
let 多边形浮点数据组 = [];
let 代码格式化id = null;
let 已显示代码_多边形;

// 生成点击效果();

function 生成点击效果() {
  点击效果图容器.style.opacity = "1";
  const 点击效果图 = 点击效果图容器.querySelector(".点击效果图");
  点击效果图.classList.add("点击效果动画");
  setTimeout(() => {
    点击效果图容器.style.removeProperty("opacity");
    点击效果图.classList.remove("点击效果动画");
  }, 1000);
}

多边形图像容器.addEventListener("click", (event) => {
  const 多边形修剪指示区 = document.createElement("div");
  多边形修剪指示区.className = "多边形修剪指示区";
  多边形图像容器.appendChild(多边形修剪指示区);

  const 多边形图像容器边界矩形 = 多边形图像容器.getBoundingClientRect();
  const 多边形图像容器宽度 = parseInt(
    window.getComputedStyle(多边形图像容器).width,
    10,
  );
  const 多边形图像容器高度 = parseInt(
    window.getComputedStyle(多边形图像容器).height,
    10,
  );
  const 鼠标点击位置_x = event.clientX - 多边形图像容器边界矩形.left;
  const 鼠标点击位置_y = event.clientY - 多边形图像容器边界矩形.top;
  const 鼠标点击比例_水平 = (鼠标点击位置_x / 多边形图像容器宽度) * 100;
  const 鼠标点击比例_垂直 = (鼠标点击位置_y / 多边形图像容器高度) * 100;

  多边形修剪指示区.style.left = `${鼠标点击比例_水平}%`;
  多边形修剪指示区.style.top = `${鼠标点击比例_垂直}%`;

  const 修剪序号 = document.createElement("span");
  修剪序号.className = "修剪序号";
  const 序号 = 多边形修剪数据组.length + 1;
  修剪序号.textContent = `${序号}`;
  多边形修剪指示区.appendChild(修剪序号);

  const 修剪数据区 = document.createElement("div");
  修剪数据区.className = "修剪数据区";
  多边形修剪指示区.appendChild(修剪数据区);

  const 关闭按钮 = document.createElement("span");
  关闭按钮.className = "修剪指示区关闭按钮";
  关闭按钮.textContent = "✖";
  多边形修剪指示区.appendChild(关闭按钮);

  const 指示区三角箭头 = document.createElement("span");
  指示区三角箭头.className = "指示区三角箭头";
  多边形修剪指示区.appendChild(指示区三角箭头);

  const 修剪数据分区_x = document.createElement("修剪数据分区");
  修剪数据分区_x.className = "修剪数据分区";
  const 修剪数据_x文本 = document.createElement("span");
  修剪数据_x文本.className = "修剪数据-坐标类";
  修剪数据_x文本.textContent = "X";
  const 修剪数据_x数据 = document.createElement("span");
  修剪数据_x数据.className = "修剪数据-坐标数据";
  const x比例 = document.createElement("span");
  x比例.className = "x比例数据";
  x比例.textContent = `${鼠标点击比例_水平.toFixed(0)}`;
  const 百分比_x = document.createElement("span");
  百分比_x.className = "多边形修剪百分比符号";
  百分比_x.textContent = "%";
  修剪数据_x数据.append(x比例, 百分比_x);
  修剪数据分区_x.append(修剪数据_x文本, ":", 修剪数据_x数据);

  const 修剪数据分区_y = document.createElement("修剪数据分区");
  修剪数据分区_y.className = "修剪数据分区";
  const 修剪数据_y文本 = document.createElement("span");
  修剪数据_y文本.className = "修剪数据-坐标类";
  修剪数据_y文本.textContent = "Y";
  const 修剪数据_y数据 = document.createElement("span");
  修剪数据_y数据.className = "修剪数据-坐标数据";
  const y比例 = document.createElement("span");
  y比例.className = "y比例数据";
  y比例.textContent = `${鼠标点击比例_垂直.toFixed(0)}`;
  const 百分比_y = document.createElement("span");
  百分比_y.className = "多边形修剪百分比符号";
  百分比_y.textContent = "%";
  修剪数据_y数据.append(y比例, 百分比_y);
  修剪数据分区_y.append(修剪数据_y文本, ":", 修剪数据_y数据);

  const 水平分割线 = document.createElement("span");
  水平分割线.style.width = "100%";
  水平分割线.style.height = "1px";
  水平分割线.style.backgroundColor = "#678a";

  修剪数据区.append(修剪数据分区_x, 水平分割线, 修剪数据分区_y);

  const 修剪数据对象 = {
    修剪序号: 序号,
    修剪指示区元素: 多边形修剪指示区,
  };

  const 浮点对象 = {
    修剪序号: 序号,
    坐标: {
      x: 鼠标点击比例_水平,
      y: 鼠标点击比例_垂直,
    },
  };

  多边形修剪数据组.push(修剪数据对象);
  多边形浮点数据组.push(浮点对象);

  关闭按钮.addEventListener("click", (event) => {
    event.stopImmediatePropagation();
    const 待关闭修剪区序号 = parseInt(
      关闭按钮.parentElement.querySelector(".修剪序号").innerText,
      10,
    );
    多边形修剪数据组 = 多边形修剪数据组.filter(
      (数据) => 数据.修剪序号 !== 待关闭修剪区序号,
    );
    多边形浮点数据组 = 多边形浮点数据组.filter(
      (数据) => 数据.修剪序号 !== 待关闭修剪区序号,
    );

    多边形修剪指示区.remove();

    if (多边形修剪数据组.length > 0) {
      const 修剪序号组 = 多边形图像容器.querySelectorAll(".修剪序号");
      for (const 序号 of 修剪序号组) {
        序号.classList.add("修剪序号刷新中");
        setTimeout(() => {
          序号.classList.remove("修剪序号刷新中");
        }, 500);
      }

      多边形修剪数据组.forEach((数据, index) => {
        数据.修剪序号 = index + 1;
        数据.修剪指示区元素.querySelector(".修剪序号").textContent =
          `${数据.修剪序号}`;
      });

      多边形浮点数据组.forEach((数据, index) => {
        数据.修剪序号 = index + 1;
      });

      多边形图像.style.clipPath = 生成精确修剪值代码();
    } else {
      多边形图像.style.removeProperty("clip-path");
    }
    更新多边形代码区代码();
    if (多边形修剪代码容器.classList.contains("代码容器可见")) {
      clearTimeout(代码格式化id);
      代码格式化id = setTimeout(() => {
        刷新代码格式化脚本();
      }, 250);
    }
  });

  多边形图像.style.clipPath = 生成精确修剪值代码();
  更新多边形代码区代码();
  if (多边形修剪代码容器.classList.contains("代码容器可见")) {
    clearTimeout(代码格式化id);
    代码格式化id = setTimeout(() => {
      刷新代码格式化脚本();
    }, 250);
  }
});

多边形修剪重置按钮.addEventListener("click", () => {
  重置多边形修剪区();
});

function 更新多边形代码区代码() {
  const 代码前缀 = "目标元素 {\n";
  const 代码后缀 = "\n}";
  多边形代码区.innerHTML = `${代码前缀}  clip-path: ${生成多边形修剪代码()};${代码后缀}`;
}

function 生成精确修剪值代码() {
  const 坐标数组 = [];
  for (const 浮点对象 of 多边形浮点数据组) {
    坐标数组.push(`${浮点对象.坐标.x}% ${浮点对象.坐标.y}%`);
  }
  const 精准值代码 = 坐标数组.join(", ");
  return `polygon(${精准值代码})`;
}

function 生成多边形修剪代码() {
  const 比例数组 = [];
  for (const 修剪对象 of 多边形修剪数据组) {
    const 指示区 = 修剪对象.修剪指示区元素;
    const x比例 = 指示区.querySelector(".x比例数据").innerText;
    const y比例 = 指示区.querySelector(".y比例数据").innerText;
    比例数组.push(`${x比例}% ${y比例}%`);
  }

  const 百分比代码 = 比例数组.join(", ");
  return `polygon(${百分比代码})`;
}

function 重置多边形修剪区() {
  for (const 修剪对象 of 多边形修剪数据组) {
    修剪对象.修剪指示区元素.remove();
  }
  多边形修剪数据组.length = 0;
  多边形浮点数据组.length = 0;
  多边形图像.style.removeProperty("clip-path");
  多边形修剪代码容器.classList.remove("代码容器可见");
  const 代码按钮 = 多边形操作分区.querySelector(".代码按钮");
  代码按钮.innerHTML = '<i class="fa-solid fa-code"></i>';
  多边形代码区.innerHTML = "";
}
