const 内存预占用表 = [
  {
    程序: "Adobe Photoshop CC 2025",
    容量: 64,
  },
  {
    程序: "百度网盘",
    容量: 8,
  },
  {
    程序: "微信",
    容量: 24,
  },
  {
    程序: "Edge 浏览器",
    容量: 96,
  },
  {
    程序: "网易云音乐",
    容量: 16,
  },
];

const 变量区 = document.querySelector(".变量区");
const 变量容器区 = 变量区.querySelector(".变量容器区");
const 内存容量滑块 = document.getElementById("内存容量");

let 变量总数 = parseInt(内存容量滑块.value, 10);
const 内存位数 = 32;
let 内存起始地址_10进制 = Math.floor(Math.random() * 100001);

const 初始化内存 = () => {
  变量容器区.innerHTML = "";
  for (let i = 0; i < 变量总数; i++) {
    const 变量容器 = document.createElement("div");
    变量容器.className = "变量容器";
    变量容器区.appendChild(变量容器);

    let 内存地址_10进制 = 内存起始地址_10进制 + i;
    let 内存地址_16进制 = 内存地址_10进制.toString(16);

    变量容器.setAttribute("内存地址-10进制", 内存地址_10进制);
    变量容器.setAttribute(
      "内存地址-16进制",
      `0x${"0".repeat(内存位数 / 4 - 内存地址_16进制.length)}${内存地址_16进制}`
    );
  }
};

初始化内存();

内存容量滑块.addEventListener("input", () => {
  变量总数 = parseInt(内存容量滑块.value, 10);
  const 滑块值 = 内存容量滑块.parentElement.querySelector(".滑块值");
  滑块值.textContent = 内存容量滑块.value;
  初始化内存();
});
