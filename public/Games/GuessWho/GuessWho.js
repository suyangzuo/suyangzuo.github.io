const 候选人物组 = [
  { 肖像: "./人物肖像图片/曹昂.jpeg", 姓名: "曹昂" },
  { 肖像: "./人物肖像图片/曹操.jpeg", 姓名: "曹操" },
  { 肖像: "./人物肖像图片/曹婴.jpeg", 姓名: "曹婴" },
  { 肖像: "./人物肖像图片/陈登.jpeg", 姓名: "陈登" },
  { 肖像: "./人物肖像图片/邓芝.jpeg", 姓名: "邓芝" },
  { 肖像: "./人物肖像图片/董允.jpeg", 姓名: "董允" },
  { 肖像: "./人物肖像图片/杜预.jpeg", 姓名: "杜预" },
  { 肖像: "./人物肖像图片/关银屏.jpeg", 姓名: "关银屏" },
  { 肖像: "./人物肖像图片/郭嘉.jpeg", 姓名: "郭嘉" },
  { 肖像: "./人物肖像图片/黄忠.jpeg", 姓名: "黄忠" },
  { 肖像: "./人物肖像图片/李傕.jpeg", 姓名: "李傕" },
  { 肖像: "./人物肖像图片/刘备.jpeg", 姓名: "刘备" },
  { 肖像: "./人物肖像图片/刘表.jpeg", 姓名: "刘表" },
  { 肖像: "./人物肖像图片/刘封.jpeg", 姓名: "刘封" },
  { 肖像: "./人物肖像图片/毛玠.jpeg", 姓名: "毛玠" },
  { 肖像: "./人物肖像图片/祢衡.jpeg", 姓名: "祢衡" },
  { 肖像: "./人物肖像图片/司马师.jpeg", 姓名: "司马师" },
  { 肖像: "./人物肖像图片/太史慈.jpeg", 姓名: "太史慈" },
  { 肖像: "./人物肖像图片/王异.jpeg", 姓名: "王异" },
  { 肖像: "./人物肖像图片/王元姬.jpeg", 姓名: "王元姬" },
  { 肖像: "./人物肖像图片/许攸.jpeg", 姓名: "许攸" },
  { 肖像: "./人物肖像图片/荀彧.jpeg", 姓名: "荀彧" },
  { 肖像: "./人物肖像图片/于禁.jpeg", 姓名: "于禁" },
  { 肖像: "./人物肖像图片/袁绍.png", 姓名: "袁绍" },
  { 肖像: "./人物肖像图片/张辽.jpeg", 姓名: "张辽" },
  { 肖像: "./人物肖像图片/张翼.jpeg", 姓名: "张翼" },
  { 肖像: "./人物肖像图片/钟会.jpeg", 姓名: "钟会" },
  { 肖像: "./人物肖像图片/周泰.jpeg", 姓名: "周泰" },
  { 肖像: "./人物肖像图片/朱然.jpeg", 姓名: "朱然" },
  { 肖像: "./人物肖像图片/诸葛瞻.jpeg", 姓名: "诸葛瞻" },
];
const index_array = [];

for (let i = 0; i < 10; i++) {
  const names = document.createElement("button");
  names.className = "姓名";
  names.textContent = "姓名" + `${i + 1}`;
  document.querySelector(".姓名区").appendChild(names);
}

for (let i = 0; i < 10; i++) {
  do {
    index = Math.floor(Math.random() * 候选人物组.length);
  } while (index_array.includes(index));
  index_array.push(index);
}

const 肖像组 = document.querySelectorAll(".肖像");
for (let i = 0; i < 肖像组.length; i++) {
  肖像组[i].style.backgroundImage = `url(${候选人物组[index_array[i]].肖像})`;
}

const 姓名组 = document.querySelectorAll(".姓名");
const used_indexes = []; 
for (let i = 0; i < 姓名组.length; i++) {
  do {
    index = Math.floor(Math.random() * 姓名组.length);
  } while (used_indexes.includes(index)); 
  used_indexes.push(index); 
  姓名组[i].textContent = `${候选人物组[index_array[index]].姓名}`;
}