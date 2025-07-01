const 科目区 = document.querySelector(".科目区");
const 科目数组 = ["语文", "数学", "英语", "物理", "化学", "生物", "地理", "政治", "历史"];
const 科目背景色数组 = [
  "#FF5722", 
  "#FF9800",  
  "#8BC34A",  
  "#009688",  
  "#00BCD4",  
  "#2196F3",  
  "#9C27B0",  
  "#E91E63",  
  "#795548"   
];

for (let i = 0; i < 科目数组.length; i++) {
  const 科目 = document.createElement("div");
  科目.textContent = 科目数组[i];
  科目.classList.add(科目数组[i], "科目");
  科目.draggable = true;
  科目.setAttribute('科目数据', 科目数组[i]);
  科目.setAttribute('颜色数据', 科目背景色数组[i]);
  科目区.append(科目);
}

const 科目 = document.querySelectorAll(".科目");
const 表格单元格 = document.querySelectorAll("table tbody td");

for (let i = 0; i < 科目.length; i++) {
  科目[i].style.backgroundColor = 科目背景色数组[i];
}

科目.forEach(科目 => {
  科目.addEventListener('dragstart', (e) => {
    const 科目名称 = e.target.getAttribute('科目数据');
    const 科目颜色 = e.target.getAttribute('颜色数据');
    e.dataTransfer.setData('text/plain', JSON.stringify({ name: 科目名称, color: 科目颜色 }));
  });
});

表格单元格.forEach(单元格 => {
  单元格.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  单元格.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const 科目名称 = data.name;
    const 科目颜色 = data.color;
    单元格.textContent = 科目名称;
    单元格.style.backgroundColor = 科目颜色;
  });
});