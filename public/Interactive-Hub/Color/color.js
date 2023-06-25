Coloris({
  themeMode: "dark",
  focusInput: true,
});

let 当前Hex颜色 = "";
let 当前RGB颜色 = "";
const hex颜色 = document.getElementById("Hex颜色");
const rgb颜色 = document.getElementById("RGB颜色");
const hex红 = document.getElementById("Hex-红");
const rgb红 = document.getElementById("RGB-红");
const hex绿 = document.getElementById("Hex-绿");
const rgb绿 = document.getElementById("RGB-绿");
const hex蓝 = document.getElementById("Hex-蓝");
const rgb蓝 = document.getElementById("RGB-蓝");
const hex透明度 = document.getElementById("Hex-透明度");
const rgb透明度 = document.getElementById("RGB-透明度");

document.addEventListener("coloris:pick", 更新当前颜色);

function 更新当前颜色(event) {
  当前Hex颜色 = chroma(event.detail.color).hex();
  当前RGB颜色 = chroma(当前Hex颜色).css();
  更新Hex颜色();
  更新RGB颜色();
  更新红色();
  更新绿色();
  更新蓝色();
  更新透明度();
}

function 更新Hex颜色() {
  hex颜色.value = 当前Hex颜色;
}

function 更新RGB颜色() {
  rgb颜色.value = 当前RGB颜色;
}

function 更新红色() {
  hex红.value = 当前Hex颜色.slice(1, 3);
  rgb红.value = chroma(当前RGB颜色).get("rgb.r");
}

function 更新绿色() {
  hex绿.value = 当前Hex颜色.slice(3, 5);
  rgb绿.value = chroma(当前RGB颜色).get("rgb.g");
}

function 更新蓝色() {
  hex蓝.value = 当前Hex颜色.slice(5, 7);
  rgb蓝.value = chroma(当前RGB颜色).get("rgb.b");
}

function 更新透明度() {
  hex透明度.value = 当前Hex颜色.length === 9 ? 当前Hex颜色.slice(7, 9) : "ff";
  rgb透明度.value = chroma(当前RGB颜色).rgba()[3];
}
