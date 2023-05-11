const 控制区组 = document.querySelectorAll(".控制区 > section");
const 图像组 = document.getElementsByClassName("对象匹配-图像区")[0].children;
const 重置按钮 = document.getElementsByClassName("重置按钮");

//初始化所有滑块数字
for (let 控制区 of 控制区组) {
  const input组 = 控制区.querySelectorAll("input[type='range']");
  const 滑块数字组 = 控制区.querySelectorAll(".滑块数字");
  for (let input控件 of input组) {
    let index = Array.from(input组).indexOf(input控件);
    滑块数字组[index].innerText = input组[index].value;
  }
}

const 全部input = document.querySelectorAll("input[type='range']");

function 修改数字区位置(范围滑块, 数字区) {
  const 值 = 范围滑块.value;
  const 最小值 = 范围滑块.min ? 范围滑块.min : 0;
  const 最大值 = 范围滑块.max ? 范围滑块.max : 100;
  const 新值 = Number(((值 - 最小值) * 100) / (最大值 - 最小值));
  数字区.style.left = `calc(${新值}% + ${8 - 新值 * 0.15}px)`;
}

for (let input of 全部input) {
  let 相邻数字区 = input.nextElementSibling;
  修改数字区位置(input, 相邻数字区);
  input.oninput = () => {
    // 相邻数字区 = input.nextElementSibling;
    修改数字区位置(input, 相邻数字区);
    相邻数字区.innerText = input.value;
    switch (input.id) {
      case "块-宽度":
        图像组[0].style.width = `${input.value}px`;
        图像组[5].style.width = `${input.value}px`;
        break;
      case "块-高度":
        图像组[0].style.height = `${input.value}px`;
        图像组[5].style.height = `${input.value}px`;
        break;
      case "行内块-宽度":
        图像组[2].style.width = `${input.value}px`;
        break;
      case "行内块-高度":
        图像组[2].style.height = `${input.value}px`;
        break;
      case "行内-宽度":
        图像组[1].style.width = `${input.value}px`;
        图像组[3].style.width = `${input.value}px`;
        break;
      case "行内-高度":
        图像组[1].style.height = `${input.value}px`;
        图像组[3].style.height = `${input.value}px`;
        break;
      case "弹性-宽度":
        图像组[4].style.width = `${input.value}px`;
        break;
      case "弹性-高度":
        图像组[4].style.height = `${input.value}px`;
        break;
      case "行内-字体尺寸":
        图像组[1].style.fontSize = `${input.value}rem`;
        图像组[3].style.fontSize = `${input.value}rem`;
        break;
    }
  };
}

// 重置参数
window.onload = () => {
  const 重置按钮 = document.querySelector(".重置按钮");
  重置按钮.onclick = () => {
    for (let 控制区 of 控制区组) {
      const input组 = 控制区.querySelectorAll("input[type='range']");
      const 滑块数字组 = 控制区.querySelectorAll(".滑块数字");
      for (let input of input组) {
        switch (input.id) {
          case "块-宽度":
            input.value = 600;
            图像组[0].style.width = `${input.value}px`;
            图像组[5].style.width = `${input.value}px`;
            break;
          case "块-高度":
            input.value = 25;
            图像组[0].style.height = `${input.value}px`;
            图像组[5].style.height = `${input.value}px`;
            break;
          case "行内块-宽度":
            input.value = 150;
            图像组[2].style.width = `${input.value}px`;
            break;
          case "行内块-高度":
            input.value = 21;
            图像组[2].style.height = `${input.value}px`;
            break;
          case "行内-宽度":
            input.value = 150;
            图像组[1].style.width = `${input.value}px`;
            图像组[3].style.width = `${input.value}px`;
            break;
          case "行内-高度":
            input.value = 150;
            图像组[1].style.height = `${input.value}px`;
            图像组[3].style.height = `${input.value}px`;
            break;
          case "弹性-宽度":
            input.value = 600;
            图像组[4].style.width = `${input.value}px`;
            break;
          case "弹性-高度":
            input.value = 25;
            图像组[4].style.height = `${input.value}px`;
            break;
          case "行内-字体尺寸":
            input.value = 1;
            图像组[1].style.fontSize = `${input.value}rem`;
            图像组[3].style.fontSize = `${input.value}rem`;
            break;
        }
        let index = Array.from(input组).indexOf(input);
        滑块数字组[index].innerText = input组[index].value;
        修改数字区位置(input, 滑块数字组[index]);
      }
    }
  };
};
