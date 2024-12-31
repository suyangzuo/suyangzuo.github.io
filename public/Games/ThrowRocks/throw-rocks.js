const 重置按钮 = document.querySelector(".reset-game");

const 蓄力按钮 = document.querySelector("#蓄力");
const 蓄力条渐变 = document.querySelector(".蓄力条渐变");
const 蓄力数字 = document.querySelector(".蓄力数字");

const 蓄力满总用时 = 3000;
let 时间间隔 = 10;
let 蓄力步长 = 100 / (蓄力满总用时 / 时间间隔);
let 鼠标左键按下 = false;
let 蓄力值 = 0;
let 蓄力定时器 = null;
let 蓄力特效定时器 = null;

蓄力按钮.addEventListener("mousedown", () => {
  鼠标左键按下 = true;
  if (!蓄力定时器 && 蓄力值 < 100) {
    蓄力定时器 = setInterval(() => {
      蓄力值 += 蓄力步长;
      if (蓄力值 >= 100) {
        蓄力值 = 100;
        clearInterval(蓄力定时器);
        clearInterval(蓄力特效定时器);
        蓄力按钮.disabled = true;
      }
      蓄力条渐变.style.setProperty("--蓄力渐变修剪", `${100 - 蓄力值}%`);
      蓄力数字.textContent = `${蓄力值.toFixed(0)}`;
    }, 时间间隔);
  }

  蓄力特效定时器 = setInterval(() => {
    const 气泡 = 生成蓄力特效气泡();
    const 水平平移 = `${Math.floor(Math.random() * 51) - 25}px`;
    const 垂直平移 = `-${Math.floor(Math.random() * 40)}px`;
    气泡.style.translate = `${水平平移} ${垂直平移}`;
    const transition = parseInt(气泡.style.transition, 10);
    setTimeout(() => {
      气泡.remove();
    }, transition / 2);
  }, 20);
});

蓄力按钮.addEventListener("mouseup", () => {
  鼠标左键按下 = false;
  clearInterval(蓄力定时器);
  clearInterval(蓄力特效定时器);
  蓄力按钮.disabled = true;
});

function 生成蓄力特效气泡() {
  const 气泡 = document.createElement("div");
  气泡.className = "蓄力特效气泡";
  蓄力按钮.appendChild(气泡);
  const size = Math.floor(Math.random() * 8 + 3);
  气泡.style.width = `${size}px`;
  气泡.style.height = `${size}px`;
  气泡.style.transition = `${Math.floor(Math.random() * 751 + 250)}ms`;
  气泡.style.top = `${Math.floor(Math.random() * 26)}%`;
  气泡.style.left = `${Math.floor(Math.random() * 101)}%`;
  气泡.style.opacity = `${Math.floor(Math.random() * 51 + 50)}%`;
  return 气泡;
}

重置按钮.addEventListener("click", 重置参数);

function 重置参数() {
  clearInterval(蓄力定时器);
  clearInterval(蓄力特效定时器);

  蓄力定时器 = null;
  蓄力特效定时器 = null;

  蓄力条渐变.style.setProperty("--蓄力渐变修剪", "100%");
  蓄力数字.textContent = "0";
  蓄力按钮.disabled = false;
  蓄力值 = 0;
}
