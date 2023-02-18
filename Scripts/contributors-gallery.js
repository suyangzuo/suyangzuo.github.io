const gallery = document.querySelector(".gallery-container");

const buttons = document.querySelectorAll(".gallery-container > button");

const imageContainers = document.querySelectorAll(
  ".slider1 > .image-container"
);
let imageCount = imageContainers.length;

const rootVar = document.querySelector(":root");
const rootStyle = getComputedStyle(rootVar);

const slider1 = document.querySelector(".slider1");
const slider2 = document.querySelector(".slider2");

const sliderWidth = parseFloat(rootStyle.getPropertyValue("--slider-width"));
const imageHeight = parseFloat(getComputedStyle(imageContainers[0]).height);
const imageWidth = parseFloat(rootStyle.getPropertyValue("--image-width"));
const imageGap = parseFloat(rootStyle.getPropertyValue("--image-gap"));

let galleryWidth = parseFloat(rootStyle.getPropertyValue("--gallery-width"));
let edgeWidth = parseFloat(rootStyle.getPropertyValue("--edge-width"));

const sliderContent = slider1.innerHTML;
slider2.innerHTML = sliderContent;

// slider1.setAttribute("style", `transform: translateX(${edgeWidth}px)`);
let slider1ImageIndex = 0;
let slider2ImageIndex = -1;
let totalOffset1 = 0;
let totalOffset2 = 0;

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const buttonType = button.dataset.buttonType;
    if (buttonType === "next") {
      if (slider1ImageIndex < 9) {
        slider1ImageIndex++;
        if (slider1ImageIndex === 8) {
          slider2.style.right = `calc(
            (${imageWidth}px + ${imageGap}px) * ${imageCount - 2} -
              ${edgeWidth}px - ${imageGap}px
          )`;
        }
      }
    } else {
      if (slider1ImageIndex > 0) {
        slider1ImageIndex--;
      }
    }

    let offset =
      buttonType === "prev" ? imageWidth + imageGap : -imageWidth - imageGap;
    totalOffset1 += offset;
    totalOffset2 += offset;

    slider1.setAttribute("style", `transform: translateX(${totalOffset1}px)`);
    slider2.setAttribute("style", `transform: translateX(${totalOffset2}px)`);
  });
});

window.onresize = () => {
  galleryWidth = parseFloat(rootStyle.getPropertyValue("--gallery-width"));
  edgeWidth = parseFloat(rootStyle.getPropertyValue("--edge-width"));
};
