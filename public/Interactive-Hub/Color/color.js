Coloris({
  themeMode: "dark",
  focusInput: true,
});

let 当前hex颜色 = "";
let 当前rgba颜色 = "";

const hex颜色区 = document.querySelector(".hex颜色区");
const rgba颜色区 = document.querySelector(".rgba颜色区");
const 红值_hex = hex颜色区.querySelector(".红值");
const 绿值_hex = hex颜色区.querySelector(".绿值");
const 蓝值_hex = hex颜色区.querySelector(".蓝值");
const 透明值_hex = hex颜色区.querySelector(".透明值");
const 红值_rgba = rgba颜色区.querySelector(".红值");
const 绿值_rgba = rgba颜色区.querySelector(".绿值");
const 蓝值_rgba = rgba颜色区.querySelector(".蓝值");
const 透明值_rgba = rgba颜色区.querySelector(".透明值");

document.addEventListener("coloris:pick", (event) => {
  更新当前颜色(event);
  const 红对象 = 获取红色();
  const 绿对象 = 获取绿色();
  const 蓝对象 = 获取蓝色();
  const 透明度对象 = 获取透明度();
  红值_hex.textContent = 红对象.hex;
  红值_rgba.textContent = 红对象.rgba;
  绿值_hex.textContent = 绿对象.hex;
  绿值_rgba.textContent = 绿对象.rgba;
  蓝值_hex.textContent = 蓝对象.hex;
  蓝值_rgba.textContent = 蓝对象.rgba;
  透明值_hex.textContent = 透明度对象.hex;
  透明值_rgba.textContent = 透明度对象.rgba;
});

function 更新当前颜色(event) {
  当前hex颜色 = chroma(event.detail.color).hex();
  当前rgba颜色 = chroma(当前hex颜色).css();
}

function 获取红色() {
  return {
    hex: 当前hex颜色.slice(1, 3),
    rgba: chroma(当前rgba颜色).get("rgb.r"),
  };
}

function 获取绿色() {
  return {
    hex: 当前hex颜色.slice(3, 5),
    rgba: chroma(当前rgba颜色).get("rgb.g"),
  };
}

function 获取蓝色() {
  return {
    hex: 当前hex颜色.slice(5, 7),
    rgba: chroma(当前rgba颜色).get("rgb.b"),
  };
}

function 获取透明度() {
  return {
    hex: 当前hex颜色.length === 9 ? 当前hex颜色.slice(7, 9) : "ff",
    rgba: chroma(当前rgba颜色).rgba()[3],
  };
}
