const selectors = document.getElementsByClassName("宗旨选择器");
const selectorsArray = Array.from(selectors);
const purposes = document.getElementsByClassName("purpose");
const selectorOuter = document.querySelector(".selector-outer");

const 选择器浮动层 = document.querySelector(".选择器浮动层");
// let 浮动层宽度 = window.getComputedStyle(selectors[0]).width;
// 选择器浮动层.style.width = 浮动层宽度;

let prevIndex = -1;
let index = -1;

if (sessionStorage.getItem("windowY") !== null) {
  let y = parseInt(sessionStorage.getItem("windowY"));
  window.scroll(0, y);
}

if (sessionStorage.getItem("选择器浮动层位置") !== null) {
  prevIndex = parseInt(sessionStorage.getItem("选择器浮动层位置"), 10);
  选择器浮动层.style.visibility = "visible";
  选择器浮动层.style.filter = "opacity(1)";
  选择器浮动层.style.width = window.getComputedStyle(
    selectors[prevIndex]
  ).width;
  选择器浮动层.style.left = `${selectors[prevIndex].offsetLeft}px`;
  selectors[prevIndex].setAttribute("style", "color:white !important");
}

selectorsArray.forEach((selector) => {
  selector.addEventListener("click", () => {
    index = selectorsArray.indexOf(selector);
    sessionStorage.setItem("选择器浮动层位置", index);

    if (prevIndex === index) return;
    if (prevIndex === -1) {
      选择器浮动层.style.visibility = "visible";
      选择器浮动层.style.filter = "opacity(1)";
      选择器浮动层.style.transition = "none";
    } else {
      选择器浮动层.style.transition = "0.25s";
      selectors[prevIndex].style.backgroundColor = "transparent";
      selectors[prevIndex].style.color = "black";
    }

    prevIndex = index;
    选择器浮动层.style.width = window.getComputedStyle(selectors[index]).width;
    选择器浮动层.style.left = `${selectors[index].offsetLeft}px`;
    // selectors[index].style.backgroundColor = "#222";
    // selectors[index].style.color = "white";
    selectors[index].setAttribute("style", "color:white !important");
    purposes[index].scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

const mediaQuery = window.matchMedia("(max-width: 1000px)");

mediaQuery.addEventListener("change", (e) => {
  // if (e.matches) {
  //   window.location.reload();
  // }
  window.location.reload();
});

let scrollStopped;

window.addEventListener("scroll", () => {
  window.clearTimeout("scrollStopped");
  scrollStopped = setTimeout(() => {
    sessionStorage.setItem("windowY", window.scrollY);
  }, 250);
});
