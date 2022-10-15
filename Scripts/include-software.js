const categorys = document.getElementsByClassName("software-category");
const containers = document.getElementsByClassName("software-container");

if (sessionStorage.getItem("software-name") === null) {
  sessionStorage.setItem("software-name", "文本编辑器");
}

Array.from(categorys).forEach((category) => {
  category.style.background = "none";
  let p = category.firstElementChild;
  p.style.color = "var(--f-color)";
  if (p.innerText === sessionStorage.getItem("software-name")) {
    category.setAttribute("style", "background: rgb(31,82,63) !important");
    p.style.color = "gold";
  }
});

let fileName = getSoftwareFileName(sessionStorage.getItem("software-name"));

function getSoftwareFileName(softwareName) {
  let tempFileName = "";
  switch (softwareName) {
    case "文本编辑器":
      tempFileName = "/Software/text-editor.html";
      break;
    case "IDE":
      tempFileName = "/Software/ide.html";
      break;
    case "数据库":
      tempFileName = "/Software/database.html";
      break;
    case "开发环境与工具":
      tempFileName = "/Software/dev-tools.html";
      break;
    case "操作系统":
      tempFileName = "/Software/os.html";
      break;
    case "平面设计":
      tempFileName = "/Software/graphic-design.html";
      break;
    case "3D":
      tempFileName = "/Software/3d.html";
      break;
    case "影视后期":
      tempFileName = "/Software/video-post.html";
      break;
    case "工程":
      tempFileName = "/Software/engineering.html";
      break;
    default:
      tempFileName = "/Software/text-editor.html";
      break;
  }
  return tempFileName;
}

fetch(fileName)
  .then(async (response) => await response.text())
  .then((content) => (containers[0].innerHTML = content));

Array.from(categorys).forEach((category) => {
  category.addEventListener("click", insertSoftwareHTML);
  category.addEventListener("click", changeCategoryStyle);
});

async function insertSoftwareHTML() {
  if (
    sessionStorage.getItem("software-name") === this.firstElementChild.innerText
  )
    return;
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  containers[0].innerHTML = "";

  sessionStorage.setItem("software-name", this.firstElementChild.innerText);
  fileName = getSoftwareFileName(sessionStorage.getItem("software-name"));

  await fetch(fileName)
    .then(async (response) => await response.text())
    .then((content) => (containers[0].innerHTML = content));
}

function changeCategoryStyle() {
  Array.from(categorys).forEach((category) => {
    category.style.background = "none";
    let p = category.firstElementChild;
    p.style.color = "var(--f-color)";
  });
  this.setAttribute("style", "background: rgb(31,82,63) !important");
  let p = this.firstElementChild;
  p.style.color = "gold";
}
