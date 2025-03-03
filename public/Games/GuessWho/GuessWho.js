for (let i = 0; i < 10; i++) {
  const 人物按钮 = document.createElement("button");
  人物按钮.className = "人物按钮";
  document.querySelector(".人物按钮区").appendChild(人物按钮);
}

for (let i = 0; i < 10; i++) {
  const 人物肖像 = document.createElement("div");
  人物肖像.className = "人物肖像";
  document.querySelector(".人物肖像区").appendChild(人物肖像);
  const 正面 = document.createElement("div");
  正面.className = "正面";
  const 背面 = document.createElement("div")
  背面.className = "背面"
  人物肖像.appendChild(正面);
  人物肖像.appendChild(背面);
}

const 人物按钮姓名组 = document.querySelectorAll(".人物按钮");
人物按钮姓名组.forEach((人物按钮姓名组, index) => {
  人物按钮姓名组.textContent = `姓名 ${index + 1}`;
});

const card = document.querySelector(".人物肖像");
const cards = document.querySelectorAll(".人物肖像");
cards.forEach((card) => {
  card.addEventListener("click", function () {
    card.classList.toggle("翻转");
  });
});

const 规则介绍页 = document.querySelector(".规则介绍页");
const 遮罩层 = document.querySelector(".规则遮罩层");
document.querySelector(".规则按钮").addEventListener("click", () => {
  规则介绍页.showModal();
  遮罩层.style.display = "block";
});
规则介绍页.addEventListener("click", () => {
  规则介绍页.close();
  遮罩层.style.display = "none";
});
