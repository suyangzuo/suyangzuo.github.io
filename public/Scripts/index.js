const App和游戏导航区 = document.querySelector(".App和游戏导航区");
const App和游戏导航区高度 = window.getComputedStyle(App和游戏导航区).height;
const App和游戏导航分区组 = App和游戏导航区.querySelectorAll(".App和游戏导航分区");
const App和游戏导航区背景 = App和游戏导航区.querySelector(".App和游戏导航区背景");
const App和游戏范例区 = document.querySelector(".App和游戏范例区");
App和游戏范例区.style.height = App和游戏导航区高度;

const App和游戏范例分区组 = App和游戏范例区.querySelectorAll(".范例分区");

for (const [index, 导航分区] of App和游戏导航分区组.entries()) {
  导航分区.addEventListener("mouseenter", () => {
    App和游戏导航区背景.style.translate = `0 ${100 * index}%`;
    const 当前范例分区 = App和游戏范例区.querySelector(".当前范例分区");
    当前范例分区.classList.remove("当前范例分区");
    App和游戏范例分区组[index].classList.add("当前范例分区");
  });
}
