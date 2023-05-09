const 交互项组 = Array.from(document.getElementsByClassName("交互单项"));

for (let 交互单项 of 交互项组) {
  if (交互单项.innerHTML === "") continue;
  console.log(交互单项);
  let index = 交互项组.indexOf(交互单项);
  const 序号 = 交互单项.querySelector(".序号");
  序号.innerText = index + 1;
}
