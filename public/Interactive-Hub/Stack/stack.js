const 资源组 = document.querySelectorAll(".资源");
let 当前资源 = 资源组[0];
for (const 资源 of 资源组) {
  资源.addEventListener("click", () => {
    if (资源.classList.contains("当前资源")) {
      return;
    }

    资源.classList.add("当前资源");
    当前资源.classList.remove("当前资源");
    当前资源 = 资源;
  });
}
