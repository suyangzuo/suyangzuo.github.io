const categorys = document.getElementsByClassName("software-category");
const containers = document.getElementsByClassName("software-container");
let text = "文本编辑器";
Array.from(categorys)[0].style.background = "rgb(31, 82, 63)";
Array.from(categorys)[0].style.color = "gold";

Array.from(categorys).forEach((category) => {
  category.addEventListener("click", insertSoftwareHTML);
  category.addEventListener("click", changeCategoryStyle);
});

async function insertSoftwareHTML() {
  if (text === this.firstElementChild.innerText) return;
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  containers[0].innerHTML = "";
  text = this.firstElementChild.innerText;
  let filename = "";
  switch (text) {
    case "文本编辑器":
      filename = "/Software/text-editor.html";
      break;
    case "IDE":
      filename = "/Software/ide.html";
      break;
    case "数据库":
      filename = "/Software/database.html";
      break;
    case "开发环境与工具":
      filename = "/Software/dev-tools.html";
      break;
    case "操作系统":
      filename = "/Software/os.html";
      break;
    case "平面设计":
      filename = "/Software/graphic-design.html";
      break;
    case "3D":
      filename = "/Software/3d.html";
      break;
    case "影视后期":
      filename = "/Software/video-post.html";
      break;
    case "工程":
      filename = "/Software/engineering.html";
      break;
    default:
      filename = "/Software/text-editor.html";
      break;
  }

  await fetch(filename)
    .then(async (response) => await response.text())
    .then((content) => (containers[0].innerHTML = content));
}

function changeCategoryStyle() {
  Array.from(categorys).forEach((category) => {
    category.style.background = "none";
    let p = category.firstElementChild;
    p.style.color = "var(--f-color)";
    // p.style.transform = "translateX(0)";
  });
  this.style.background = "rgb(31,82,63)";
  let p = this.firstElementChild;
  p.style.color = "gold";
  // p.style.transform = "translateX(1em)";
}