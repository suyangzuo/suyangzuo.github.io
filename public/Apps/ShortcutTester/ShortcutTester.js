const 功能键池 = ["Ctrl", "Alt", "Shift"];
const 字符键池 = [
  "Q",
  "W",
  "E",
  "R",
  "T",
  "A",
  "S",
  "D",
  "F",
  "G",
  "Z",
  "X",
  "C",
  "V",
];

const 快捷键池 = [];

for (const 字符键 of 字符键池) {
  快捷键池.push([功能键池[0], 字符键]);
  快捷键池.push([功能键池[1], 字符键]);
  快捷键池.push([功能键池[2], 字符键]);
  快捷键池.push([功能键池[0], 功能键池[1], 字符键]);
  快捷键池.push([功能键池[0], 功能键池[2], 字符键]);
  快捷键池.push([功能键池[1], 功能键池[2], 字符键]);
  快捷键池.push([功能键池[0], 功能键池[1], 功能键池[2], 字符键]);
}

let 测试次数 = 30;
生成快捷键测试单();

function 生成快捷键测试单() {
  const 快捷键列表 = document.querySelector(".快捷键列表");
  for (let i = 1; i <= 测试次数; i++) {
    const 快捷键列表项 = document.createElement("li");
    快捷键列表项.className = "快捷键列表项";
    快捷键列表.appendChild(快捷键列表项);

    const 快捷键列表项内部 = document.createElement("div");
    快捷键列表项内部.className = "快捷键列表项内部";
    快捷键列表项.appendChild(快捷键列表项内部);

    const 按键集合 = document.createElement("div");
    按键集合.className = "按键集合";
    const 按键结果 = document.createElement("div");
    按键结果.className = "按键结果";
    快捷键列表项内部.append(按键集合, 按键结果);

    const 快捷键索引 = Math.floor(Math.random() * 快捷键池.length);
    for (const [索引, 单个按键] of 快捷键池[快捷键索引].entries()) {
      const 单个按键元素 = document.createElement("span");
      单个按键元素.className = "单个按键元素";
      单个按键元素.textContent = 单个按键;
      按键集合.appendChild(单个按键元素);
      if (索引 < 快捷键池[快捷键索引].length - 1) {
        const 加号元素 = document.createElement("span");
        加号元素.className = "加号元素";
        加号元素.textContent = "\xa0+\xa0";
        按键集合.appendChild(加号元素);
      }
    }
  }
}
