Coloris({
  themeMode: "dark",
  focusInput: true,
});

let 当前hex颜色 = "";
let 当前rgba颜色 = "";

document.addEventListener("coloris:pick", (event) => {
  更新当前颜色(event);
});

function 更新当前颜色(event) {
  当前hex颜色 = chroma(event.detail.color).hex();
  当前rgba颜色 = chroma(当前hex颜色).css();
}
