const root = document.querySelector(":root");
const 动画持续时间滑块 = document.querySelector("#动画持续时间");
const 动画延迟滑块 = document.querySelector("#动画延迟");
const 调用区 = document.querySelector(".调用区");
const 调用区滑块组 = 调用区.querySelectorAll("input[type='range']");

const 动画属性组 = {
  "animation-duration": "5s",
  "animation-delay": "0",
};

for (const 调用区滑块 of 调用区滑块组) {
  调用区滑块.addEventListener("input", () => {
    动画属性组[调用区滑块.getAttribute("parameter")] = `${调用区滑块}s`;
    const 滑块值 = parseInt(调用区滑块.value, 10);
    const 滑块百分比 =
      ((调用区滑块.value - 调用区滑块.min) /
        (调用区滑块.max - 调用区滑块.min)) *
      100;
    root.style.setProperty(`--${调用区滑块.id}渐变位置`, `${滑块百分比}%`);
    const 参数值数字 =
      调用区滑块.nextElementSibling.querySelector(".参数值数字");
    参数值数字.textContent = 调用区滑块.value;
  });
}
