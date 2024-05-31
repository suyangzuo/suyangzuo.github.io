const 图像区 = document.querySelector(".图像区");
const 多边形修剪图分区 = 图像区.querySelector(".多边形修剪图分区");
const 多边形图像容器 = 多边形修剪图分区.querySelector(".图像容器");
const 多边形图像 = 多边形图像容器.querySelector(".图像");
let 多边形修剪数据组 = [];

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
  const 鼠标点击比例_水平 = `${Math.floor(
    (鼠标点击位置_x / 多边形图像容器宽度) * 100,
  )}`;
  const 鼠标点击比例_垂直 = `${Math.floor(
    (鼠标点击位置_y / 多边形图像容器高度) * 100,
  )}`;

  多边形修剪指示区.style.left = `${鼠标点击位置_x}px`;
  多边形修剪指示区.style.top = `${鼠标点击位置_y - 5}px`;
  多边形修剪指示区.style.translate = "-50% -100%";

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

  const 修剪数据分区_x = document.createElement("修剪数据分区");
  修剪数据分区_x.className = "修剪数据分区";
  const 修剪数据_x文本 = document.createElement("span");
  修剪数据_x文本.className = "修剪数据-坐标类";
  修剪数据_x文本.textContent = "X";
  const 修剪数据_x数据 = document.createElement("span");
  修剪数据_x数据.className = "修剪数据-坐标数据";
  修剪数据_x数据.textContent = `${鼠标点击比例_水平}`;
  const 百分比_x = document.createElement("span");
  百分比_x.className = "多边形修剪百分比符号";
  百分比_x.textContent = "%";
  修剪数据_x数据.appendChild(百分比_x);
  修剪数据分区_x.append(修剪数据_x文本, ":", 修剪数据_x数据);

  const 修剪数据分区_y = document.createElement("修剪数据分区");
  修剪数据分区_y.className = "修剪数据分区";
  const 修剪数据_y文本 = document.createElement("span");
  修剪数据_y文本.className = "修剪数据-坐标类";
  修剪数据_y文本.textContent = "Y";
  const 修剪数据_y数据 = document.createElement("span");
  修剪数据_y数据.className = "修剪数据-坐标数据";
  修剪数据_y数据.textContent = `${鼠标点击比例_垂直}`;
  const 百分比_y = document.createElement("span");
  百分比_y.className = "多边形修剪百分比符号";
  百分比_y.textContent = "%";
  修剪数据_y数据.appendChild(百分比_y);
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

  多边形修剪数据组.push(修剪数据对象);

  关闭按钮.addEventListener("click", (event) => {
    event.stopImmediatePropagation();
    const 待关闭修剪区序号 = parseInt(
      关闭按钮.parentElement.querySelector(".修剪序号").innerText,
      10,
    );
    多边形修剪数据组 = 多边形修剪数据组.filter(
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
    }
  });
});
