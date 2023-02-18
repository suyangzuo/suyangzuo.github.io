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

let slider1ImageIndex = 0;
let slider2ImageIndex = -1;
let totalOffset1 = 0;
let totalOffset2 = 0;
let slider1Actived = true;
let slider2Actived = false;
let nextTimes1 = 0;
let nextTimes2 = 0;

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const buttonType = button.dataset.buttonType;
    if (buttonType === "next") {
      if (slider1Actived && slider1ImageIndex === 9) {
        slider2ImageIndex = -1;
        slider2Actived = true;
        slider1Actived = false;
        nextTimes2 += 2;
      }
      if (slider2Actived && slider2ImageIndex === 9) {
        slider1ImageIndex = -1;
        slider1Actived = true;
        slider2Actived = false;
        nextTimes1 += 2;
      }
      if (slider1Actived && slider1ImageIndex < 9) slider1ImageIndex++;
      if (slider2Actived && slider2ImageIndex < 9) slider2ImageIndex++;
      console.log(slider2ImageIndex);

      if (slider1ImageIndex === 2) {
        slider2.style.left =
          "calc(var(--slider-width) + var(--edge-width) + var(--image-gap))";
      }
      if (slider2ImageIndex === 2) {
        slider1.style.left =
          "calc((var(--slider-width) + var(--edge-width) + var(--image-gap)) * 2 - var(--edge-width))";
      }
    } else {
      slider1ImageIndex--;
      slider2ImageIndex--;
    }

    let offset =
      buttonType === "prev" ? imageWidth + imageGap : -imageWidth - imageGap;
    totalOffset1 += offset;
    totalOffset2 += offset;

    slider1.style.transform = `translateX(${totalOffset2}px)`;
    slider2.style.transform = `translateX(${totalOffset2}px)`;
  });
});

// window.onresize = () => {
//   galleryWidth = parseFloat(rootStyle.getPropertyValue("--gallery-width"));
//   edgeWidth = parseFloat(rootStyle.getPropertyValue("--edge-width"));
// };
