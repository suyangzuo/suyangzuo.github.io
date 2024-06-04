Coloris({
  themeMode: "dark",
  focusInput: true,
});

const 控制区 = document.querySelector(".控制区");

let 当前hex颜色 = "";
let 当前rgba颜色 = "";

const hex颜色区 = document.querySelector(".hex颜色区");
const hex无透明颜色区 = document.querySelector(".hex无透明颜色区");
const hex简写颜色区 = document.querySelector(".hex简写颜色区");
const hex简写无透明颜色区 = document.querySelector(".hex简写无透明颜色区");
const rgba颜色区 = document.querySelector(".rgba颜色区");
const rgb颜色区 = document.querySelector(".rgb颜色区");

const 红_hex = hex颜色区.querySelector(".红值");
const 绿_hex = hex颜色区.querySelector(".绿值");
const 蓝_hex = hex颜色区.querySelector(".蓝值");
const 透明度_hex = hex颜色区.querySelector(".透明值");

const 红_hex无透明 = hex无透明颜色区.querySelector(".红值");
const 绿_hex无透明 = hex无透明颜色区.querySelector(".绿值");
const 蓝_hex无透明 = hex无透明颜色区.querySelector(".蓝值");

const 红_hex简写 = hex简写颜色区.querySelector(".红值");
const 绿_hex简写 = hex简写颜色区.querySelector(".绿值");
const 蓝_hex简写 = hex简写颜色区.querySelector(".蓝值");
const 透明度_hex简写 = hex简写颜色区.querySelector(".透明值");

const 红_hex简写无透明 = hex简写无透明颜色区.querySelector(".红值");
const 绿_hex简写无透明 = hex简写无透明颜色区.querySelector(".绿值");
const 蓝_hex简写无透明 = hex简写无透明颜色区.querySelector(".蓝值");

const 红_rgba = rgba颜色区.querySelector(".红值");
const 绿_rgba = rgba颜色区.querySelector(".绿值");
const 蓝_rgba = rgba颜色区.querySelector(".蓝值");
const 透明度_rgba = rgba颜色区.querySelector(".透明值");

const 红_rgb = rgb颜色区.querySelector(".红值");
const 绿_rgb = rgb颜色区.querySelector(".绿值");
const 蓝_rgb = rgb颜色区.querySelector(".蓝值");

const 前括号组 = 控制区.querySelectorAll(".前括号");
const 后括号组 = 控制区.querySelectorAll(".后括号");
const 逗号组 = 控制区.querySelectorAll(".逗号");
const hex前缀组 = 控制区.querySelectorAll(".hex前缀");
const rgba前缀组 = 控制区.querySelectorAll(".rgba前缀");
const rgb前缀组 = 控制区.querySelectorAll(".rgb前缀");
const 符号组阵列 = [
  前括号组,
  后括号组,
  逗号组,
  hex前缀组,
  rgba前缀组,
  rgb前缀组,
];

清空颜色代码符号();

document.addEventListener("coloris:pick", (event) => {
  更新当前颜色(event);
  生成颜色代码符号();
  const hex可以简写 = hex可简写();
  const hex无透明可以简写 = hex无透明可简写();
  const 红对象 = 获取红色();
  const 绿对象 = 获取绿色();
  const 蓝对象 = 获取蓝色();
  const 透明度对象 = 获取透明度();
  红_hex.textContent = 红对象.hex;
  绿_hex.textContent = 绿对象.hex;
  蓝_hex.textContent = 蓝对象.hex;
  透明度_hex.textContent = 透明度对象.hex;

  红_rgba.textContent = 红对象.rgba;
  绿_rgba.textContent = 绿对象.rgba;
  蓝_rgba.textContent = 蓝对象.rgba;
  透明度_rgba.textContent = 透明度对象.rgba;

  if (透明度对象.hex !== "ff") {
    清空无透明代码符号();
  } else {
    红_hex无透明.textContent = 红对象.hex;
    绿_hex无透明.textContent = 绿对象.hex;
    蓝_hex无透明.textContent = 蓝对象.hex;
    红_rgb.textContent = 红对象.rgba;
    绿_rgb.textContent = 绿对象.rgba;
    蓝_rgb.textContent = 蓝对象.rgba;
  }

  if (hex可以简写 || hex无透明可以简写) {
    红_hex简写.textContent = 红对象.hex[0];
    绿_hex简写.textContent = 绿对象.hex[0];
    蓝_hex简写.textContent = 蓝对象.hex[0];
    透明度_hex简写.textContent = 透明度对象.hex[0];
  } else {
    清空hex简写代码符号();
  }

  if (hex无透明可以简写) {
    红_hex简写无透明.textContent = 红对象.hex[0];
    绿_hex简写无透明.textContent = 绿对象.hex[0];
    蓝_hex简写无透明.textContent = 蓝对象.hex[0];
  } else {
    清空hex简写无透明代码符号();
  }
});

function 更新当前颜色(event) {
  当前hex颜色 = event.detail.color;
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

function hex可简写() {
  const 红绿蓝可简写 =
    当前hex颜色[1] === 当前hex颜色[2] &&
    当前hex颜色[3] === 当前hex颜色[4] &&
    当前hex颜色[5] === 当前hex颜色[6];

  const 透明度可简写 =
    当前hex颜色.length === 7 || 当前hex颜色[7] === 当前hex颜色[8];
  return 红绿蓝可简写 && 透明度可简写;
}

function hex无透明可简写() {
  return (
    当前hex颜色[1] === 当前hex颜色[2] &&
    当前hex颜色[3] === 当前hex颜色[4] &&
    当前hex颜色[5] === 当前hex颜色[6] &&
    当前hex颜色.length === 7
  );
}

function 清空颜色代码符号() {
  for (const 符号组 of 符号组阵列) {
    for (const 符号 of 符号组) {
      符号.textContent = "";
    }
  }
}

function 生成颜色代码符号() {
  for (const 前括号 of 前括号组) {
    前括号.textContent = "(";
  }
  for (const 后括号 of 后括号组) {
    后括号.textContent = ")";
  }
  for (const 逗号 of 逗号组) {
    逗号.textContent = ",";
  }
  for (const hex前缀 of hex前缀组) {
    hex前缀.textContent = "#";
  }
  for (const rgba前缀 of rgba前缀组) {
    rgba前缀.textContent = "rgba";
  }
  for (const rgb前缀 of rgb前缀组) {
    rgb前缀.textContent = "rgb";
  }
}

function 清空hex简写代码符号() {
  const hex简写颜色值 = 控制区.querySelector(".hex简写颜色值");
  const span组_hex简写 = hex简写颜色值.querySelectorAll("span");
  const hex简写无透明颜色值 = 控制区.querySelector(".hex简写无透明颜色值");
  const span组_hex简写无透明 = hex简写无透明颜色值.querySelectorAll("span");
  for (const span of span组_hex简写) {
    span.textContent = "";
  }
  for (const span of span组_hex简写无透明) {
    span.textContent = "";
  }
}

function 清空无透明代码符号() {
  const hex无透明颜色值 = 控制区.querySelector(".hex无透明颜色值");
  const span组_hex无透明 = hex无透明颜色值.querySelectorAll("span");
  const hex简写无透明颜色值 = 控制区.querySelector(".hex简写无透明颜色值");
  const span组_hex简写无透明 = hex简写无透明颜色值.querySelectorAll("span");
  const rgb颜色值 = 控制区.querySelector(".rgb颜色值");
  const span组_rgb = rgb颜色值.querySelectorAll("span");
  for (const span of span组_hex无透明) {
    span.textContent = "";
  }
  for (const span of span组_hex简写无透明) {
    span.textContent = "";
  }
  for (const span of span组_rgb) {
    span.textContent = "";
  }
}

function 清空hex简写无透明代码符号() {
  const hex简写无透明颜色值 = 控制区.querySelector(".hex简写无透明颜色值");
  const span组_hex简写无透明 = hex简写无透明颜色值.querySelectorAll("span");
  for (const span of span组_hex简写无透明) {
    span.textContent = "";
  }
}
