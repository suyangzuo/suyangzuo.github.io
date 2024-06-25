const direction_raidos = document.querySelectorAll("input[type='radio'");
const row_radio = document.getElementById("row-radio");
const column_radio = document.getElementById("column-radio");

const main_container = document.querySelector(".main-container");
const cross_container = document.querySelector(".cross-container");
const main_title = main_container.querySelector(".axis-title");
const cross_title = cross_container.querySelector(".axis-title");
const 弹性方向文本 = document.querySelector(".弹性方向文本");
const 弹性方向文本数据 = 弹性方向文本.querySelector(".弹性方向文本-方向");

const 行辅助线 = document.querySelector(".行辅助线");
const 列辅助线 = document.querySelector(".列辅助线");
const 行标题 = document.querySelector(".行标题");
const 列标题 = document.querySelector(".列标题");

const root = document.querySelector(":root");

const 方向线 = document.querySelector(".方向线");

for (const radio of direction_raidos) {
  radio.addEventListener("input", () => {
    if (row_radio.checked) {
      main_container.style.rotate = "z 0deg";
      cross_container.style.rotate = "z 0deg";
      main_title.style.rotate = "z 0deg";
      main_title.style.translate = "-50% 10px";
      main_title.style.top = "-3px";
      cross_title.style.rotate = "z 0deg";
      cross_title.style.translate = "10px -50%";
      弹性方向文本.style.top = "52%";
      弹性方向文本.style.left = "78%";
      弹性方向文本.style.writingMode = "horizontal-tb";
      弹性方向文本.style.letterSpacing = "0";
      方向线.style.rotate = "z 0deg";
      弹性方向文本数据.textContent = "行";
      弹性方向文本数据.style.marginLeft = "5px";
      弹性方向文本数据.style.marginTop = "0";
      弹性方向文本数据.style.padding = "5px 7px";
      /* root.style.setProperty("--行辅助线-背景色", "white");
      root.style.setProperty("--行辅助线-垂直缩放", "2");
      root.style.setProperty("--列辅助线-背景色", "#999");
      root.style.setProperty("--列辅助线-水平缩放", "1"); */
    } else {
      main_container.style.rotate = "z 90deg";
      cross_container.style.rotate = "z -90deg";
      main_title.style.rotate = "z -90deg";
      main_title.style.translate = "-50% -50px";
      main_title.style.top = "10px";
      cross_title.style.rotate = "z 90deg";
      cross_title.style.translate = "-60px -50%";
      弹性方向文本.style.top = "76.5%";
      弹性方向文本.style.left = "52%";
      弹性方向文本.style.writingMode = "vertical-lr";
      弹性方向文本.style.letterSpacing = "2px";
      方向线.style.rotate = "z 90deg";
      弹性方向文本数据.textContent = "列";
      弹性方向文本数据.style.marginLeft = "0";
      弹性方向文本数据.style.marginTop = "5px";
      弹性方向文本数据.style.padding = "7px 5px";
      /* root.style.setProperty("--行辅助线-背景色", "#999");
      root.style.setProperty("--行辅助线-垂直缩放", "1");
      root.style.setProperty("--列辅助线-背景色", "white");
      root.style.setProperty("--列辅助线-水平缩放", "2"); */
    }
  });
}
