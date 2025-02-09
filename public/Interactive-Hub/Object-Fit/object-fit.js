const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);

const 图像区 = document.querySelector(".图像容器");
const 图像 = 图像区.querySelector("img");
const 图像尺寸原始checkbox = document.querySelector("#图像尺寸-原始大小");
const 图像尺寸百分百checkbox = document.querySelector("#图像尺寸-百分之百");
const 图像尺寸放大checkbox = document.querySelector("#图像尺寸-放大");
const 图像尺寸双倍checkbox = document.querySelector("#图像尺寸-双倍");

const 溢出控件操作区 = document.querySelector(".溢出操作区");
const 溢出单选组 = 溢出控件操作区.querySelectorAll(".单选框");
for (const 溢出单选 of 溢出单选组) {
  溢出单选.addEventListener("change", (event) => {
    溢出设置已修改(event);
  });
}

const 图像源单选组 = document.querySelectorAll("input[name='图像源']");
for (const 图像源单选 of 图像源单选组) {
  图像源单选.addEventListener("change", () => {
    图像.src = 图像源单选.previousElementSibling.querySelector("img").src;
  });
}

function 溢出设置已修改(event) {
  图像区.style.overflow = event.target.parentElement
    .querySelector(".值代码")
    .textContent.trim();
}

function 修改图像尺寸() {
  if (图像尺寸原始checkbox.checked) {
    图像.style.width = "auto";
    图像.style.height = "auto";
  } else if (图像尺寸百分百checkbox.checked) {
    图像.style.width = "100%";
    图像.style.height = "100%";
  } else if (图像尺寸放大checkbox.checked) {
    图像.style.width = "150%";
    图像.style.height = "150%";
  } else if (图像尺寸双倍checkbox.checked) {
    图像.style.width = "200%";
    图像.style.height = "200%";
  }
}

图像尺寸原始checkbox.onchange = 修改图像尺寸;
图像尺寸百分百checkbox.onchange = 修改图像尺寸;
图像尺寸放大checkbox.onchange = 修改图像尺寸;
图像尺寸双倍checkbox.onchange = 修改图像尺寸;

const 对象匹配控件类型操作区 = document.querySelector(".对象匹配操作区");
const 对象匹配组 = 对象匹配控件类型操作区.querySelectorAll(".控件子组");

Array.from(对象匹配组).forEach((控件子组, index) => {
  const 单选框 = 控件子组.querySelector(".单选框");
  单选框.onchange = () => {
    let styleCode = 对象匹配组[index].querySelector(".代码").innerText;
    图像.style.objectFit = `${styleCode}`;
  };
});

const 容器比例滑块 = document.getElementById("容器比例");
const 容器比例数字 = document
  .querySelector(".容器比例数字区")
  .querySelector(".数字");
容器比例滑块.addEventListener("input", () => {
  const 值 = parseFloat(容器比例滑块.value);
  const 百分比 = 获取滑块百分比(容器比例滑块);
  容器比例数字.textContent = 值.toString();
  root.style.setProperty("--进度-容器比例", 百分比);
  root.style.setProperty("--容器比例", `${值}`);
  const 最小值 = 容器比例滑块.min ? 容器比例滑块.min : 0;
  const 最大值 = 容器比例滑块.max ? 容器比例滑块.max : 100;
  const 新值 = Number(((值 - 最小值) * 100) / (最大值 - 最小值));
  const 容器比例数字区 = document.querySelector(".容器比例数字区");
  容器比例数字区.style.left = `calc(${新值}% + ${8 - 新值 * 0.155}px)`;
});

function 获取滑块百分比(滑块) {
  const 值 = parseFloat(滑块.value);
  const max = parseFloat(滑块.max);
  const min = parseFloat(滑块.min);
  return `${((值 - min) / (max - min)) * 100}%`;
}

const x轴数字区 = document.querySelector(".X轴数字区");
const y轴数字区 = document.querySelector(".Y轴数字区");
const x轴 = document.querySelector("#对象位置-X轴");
const y轴 = document.querySelector("#对象位置-Y轴");
let x轴百分比 = x轴.value;
let y轴百分比 = y轴.value;
const 拇指宽度 = 10;

x轴.oninput = 修改X轴百分比;
y轴.oninput = 修改Y轴百分比;

function 修改X轴百分比() {
  x轴百分比 = x轴.value;
  x轴数字区.querySelector(".数字").innerText = `${x轴百分比}`;
  let 真实百分比 = (Number(x轴百分比) + 100) / 3;
  root.style.setProperty("--进度-X轴", `${真实百分比}%`);
  const 值 = x轴.value;
  const 最小值 = x轴.min ? x轴.min : 0;
  const 最大值 = x轴.max ? x轴.max : 100;
  const 新值 = Number(((值 - 最小值) * 100) / (最大值 - 最小值));
  x轴数字区.style.left = `calc(${新值}% + ${8 - 新值 * 0.155}px)`;
  图像.style.objectPosition = `${x轴百分比}% ${y轴百分比}%`;
}

function 修改Y轴百分比() {
  y轴百分比 = y轴.value;
  y轴数字区.querySelector(".数字").innerText = `${y轴百分比}`;
  let 真实百分比 = (Number(y轴百分比) + 100) / 3;
  root.style.setProperty("--进度-Y轴", `${真实百分比}%`);
  const 值 = y轴.value;
  const 最小值 = y轴.min ? y轴.min : 0;
  const 最大值 = y轴.max ? y轴.max : 100;
  const 新值 = Number(((值 - 最小值) * 100) / (最大值 - 最小值));
  y轴数字区.style.left = `calc(${新值}% + ${8 - 新值 * 0.15}px)`;
  图像.style.objectPosition = `${x轴百分比}% ${y轴百分比}%`;
}

window.addEventListener("load", () => {
  const 重置按钮 = document.getElementsByClassName("重置按钮")[0];
  重置按钮.addEventListener("click", 重置参数);
});

function 重置参数() {
  // root.style.setProperty("--容器宽度", "500px");
  root.style.removeProperty("--容器比例");
  root.style.removeProperty("--进度-容器比例");
  容器比例滑块.value = "1";
  容器比例数字.textContent = 容器比例滑块.value;
  const 容器比例数字区 = document.querySelector(".容器比例数字区");
  容器比例数字区.style.left = "";
  const 溢出可见 = document.getElementById("溢出-可见");
  溢出可见.checked = true;
  图像尺寸原始checkbox.checked = true;
  const 填充 = document.getElementById("对象匹配-填充");
  填充.checked = true;
  const 图像01 = document.getElementById("01");
  图像01.checked = true;
  图像.src = "./01.jpg";
  x轴.value = 50;
  y轴.value = 50;
  修改X轴百分比();
  修改Y轴百分比();
  图像.style.width = "auto";
  图像.style.height = "auto";
  图像.style.opacity = "0.75";
  图像区.style.overflow = "visible";
}
