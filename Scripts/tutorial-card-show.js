const links = document.querySelectorAll(".intro > a");

// links.forEach((link) => {
//   link.addEventListener("mouseenter", changeLinkBrightness);
//   link.addEventListener("mouseleave", restoreLinkBrightness);
// });

function changeLinkBrightness() {
  links.forEach((link) => {
    link.style.filter = "brightness(45%)";
    this.style.filter = "brightness(100%)";
    let previous = this.previousElementSibling;
    let next = this.nextElementSibling;
    if (previous !== null) previous.style.filter = "brightness(100%)";
    if (next !== null) next.style.filter = "brightness(100%)";
  });
}

function restoreLinkBrightness() {
  links.forEach((link) => {
    link.style.filter = "brightness(100%)";
  });
}
