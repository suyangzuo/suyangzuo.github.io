const navCells = Array.from(document.getElementsByClassName("nav-cell"));
const contributors = document.getElementsByClassName("contributor");

navCells.forEach((navCell) => {
  navCell.addEventListener("click", () => {
    let index = navCells.indexOf(navCell);
    contributors[index].scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

const 侧边栏 = document.querySelector(".侧边栏");
const 侧边贡献者容器组 = 侧边栏.querySelectorAll(".侧边-贡献者容器");
侧边贡献者容器组.forEach((容器) => {
  容器.addEventListener("click", () => {
    let index = Array.from(侧边贡献者容器组).indexOf(容器);
    contributors[index].scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

window.onscroll = () => {
  if (window.scrollY >= 350) {
    侧边栏.style.transform = "translateY(-50%) scaleX(1)";
  } else {
    侧边栏.style.transform = "translateY(-50%) scaleX(0)";
  }
};
