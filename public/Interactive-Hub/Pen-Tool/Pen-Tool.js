const 根元素 = document.querySelector(":root");
const 根样式 = window.getComputedStyle(根元素);
const 字体 = {
  家族: 根样式.getPropertyValue("--字体-家族"),
  尺寸: {
    大: 16,
    中: 14,
    小: 12,
  },
};
const 光标样式 = {
  默认: 根样式.getPropertyValue("--光标-默认"),
  指向: 根样式.getPropertyValue("--光标-指向"),
  抓取: "grab",
  抓住: "grabbing",
  移动: 根样式.getPropertyValue("--光标-移动"),
};
