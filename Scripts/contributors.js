const navCells = Array.from(document.getElementsByClassName("nav-cell"));
const contributors = document.getElementsByClassName("contributor");

navCells.forEach((navCell) => {
  navCell.addEventListener("click", () => {
    let index = navCells.indexOf(navCell);
    contributors[index].scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

let 屏蔽肖像放大效果 = false;

const 指示器 = document.getElementsByClassName("指示器")[0];
const 指示器肖像组 = 指示器.querySelectorAll("img");
指示器肖像组.forEach((肖像) => {
  肖像.addEventListener("click", (event) => {
    屏蔽肖像放大效果 = true;
    setTimeout(() => {
      屏蔽肖像放大效果 = false;
    }, 400);
    let index = Array.from(指示器肖像组).indexOf(event.target);
    contributors[index].scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

let 之前肖像索引 = -1;

window.addEventListener("scroll", 根据Y轴偏移修改指示器样式);

function 根据Y轴偏移修改指示器样式() {
  if (window.scrollY >= 350) {
    指示器.style.visibility = "visible";
    指示器.style.transform = "translateY(-50%) scale(1)";
    指示器.style.opacity = "1";
    if (window.scrollY >= 350) {
      let index = Math.floor((window.scrollY - 150) / 550);
      // if (window.scrollY >= 3850) {
      //   index = 7;
      // }
      if (!屏蔽肖像放大效果) {
        指示器肖像组[index].style.transform = "scale(3)";
        指示器肖像组[index].style.setProperty(
          "filter",
          "brightness(1)",
          "important"
        );
      }
      if (之前肖像索引 !== -1 && 之前肖像索引 !== index) {
        指示器肖像组[之前肖像索引].style.transform = "scale(1)";
        指示器肖像组[之前肖像索引].style.setProperty("filter", "brightness(1)");
      }
      之前肖像索引 = index;
    }
  } else {
    指示器.style.visibility = "hidden";
    指示器.style.transform = "translateY(-50%) scale(0)";
    指示器.style.opacity = "0";
    之前肖像索引 = -1;
  }
}

// const 侧边栏 = document.querySelector(".侧边栏");
// const 侧边贡献者容器组 = 侧边栏.querySelectorAll(".侧边-贡献者容器");
// 侧边贡献者容器组.forEach((容器) => {
//   容器.addEventListener("click", () => {
//     let index = Array.from(侧边贡献者容器组).indexOf(容器);
//     contributors[index].scrollIntoView({ behavior: "smooth", block: "center" });
//   });
// });

// window.onscroll = () => {
//   if (window.scrollY >= 350) {
//     侧边栏.style.transform = "translateY(-50%) scaleX(1)";
//   } else {
//     侧边栏.style.transform = "translateY(-50%) scaleX(0)";
//   }
// };
