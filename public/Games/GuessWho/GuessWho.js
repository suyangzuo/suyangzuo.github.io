// const 汉堡按钮 = document.getElementById("汉堡");
// const 菜单 = document.getElementById("菜单");

// 汉堡按钮.addEventListener("click", () => {
//   菜单.classList.toggle("展示");
// });

// const 人物名字按钮 = document.querySelectorAll(".人物名字");
// const 人物肖像区 = document.querySelectorAll(".人物肖像");

// 人物名字按钮.forEach((button) => {
//   button.addEventListener("dragstart", (event) => {
//     event.dataTransfer.setData("text/plain", button.textContent);
//   });
// });

// 人物肖像区.forEach((肖像) => {
//   肖像.addEventListener("dragover", (event) => {
//     event.preventDefault();
//   });

//   肖像.addEventListener("drop", (event) => {
//     const draggedName = event.dataTransfer.getData("text/plain");
//     const img = 肖像.querySelector("img");

//     if (img && img.alt === draggedName) {
//       img.style.display = "none";
//       肖像.innerHTML += "<p>成功</p>";

//       人物名字按钮.forEach((button) => {
//         if (button.textContent === draggedName) {
//           button.style.display = "none";
//         }
//       });
//     }
//   });
// });

const 人物按钮姓名组 = document.querySelectorAll(".人物按钮")
人物按钮姓名组.forEach((人物按钮姓名组, index) => {
  人物按钮姓名组.textContent=`姓名 ${index+1}`
})

const 规则介绍页 = document.querySelector(".规则介绍页")
const 遮罩层 = document.querySelector(".规则遮罩层")

document.querySelector(".规则按钮").addEventListener('click', () => {
  规则介绍页.showModal();
  遮罩层.style.display='block'
})

规则介绍页.addEventListener("click", () => {
  规则介绍页.close();
  遮罩层.style.display='none'
})

const card = document.querySelector('.人物肖像');

const cards = document.querySelectorAll('.人物肖像');

cards.forEach(card => {
    card.addEventListener('click', function() {
        card.classList.toggle('翻转'); 
    });
});