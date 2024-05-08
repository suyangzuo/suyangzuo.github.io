const 交互列表组 = document.querySelectorAll(".交互列表");

for (const 交互列表 of 交互列表组) {
  const 交互单项组 = 交互列表.querySelectorAll(".交互单项");
  for (let 交互单项 of 交互单项组) {
    if (交互单项.innerHTML === "") continue;
    let index = Array.from(交互单项组).indexOf(交互单项);
    const 序号 = 交互单项.querySelector(".序号");
    序号.innerText = index + 1;
  }
}