const categorys = document.getElementsByClassName("software-category"); //获取软件选择列表
const containers = document.getElementsByClassName("software-container"); //获取软件卡片容器

//如果软件名为空（每次浏览器会话第1次进入软件页），则默认为“文本编辑器”
if (sessionStorage.getItem("software-name") === null) {
  sessionStorage.setItem("software-name", "文本编辑器");
}

//进入软件页时，将每个软件选项设置为默认样式，并将与会话中保存名称相同的软件选项设置为绿底金字
Array.from(categorys).forEach((category) => {
  category.style.background = "none";
  let p = category.firstElementChild;
  p.style.color = "var(--f-color)";
  if (p.innerText === sessionStorage.getItem("software-name")) {
    category.setAttribute("style", "background: rgb(31,82,63) !important");
    p.style.color = "gold";
  }
});

//通过会话中保存的软件名，获取对应文件名的HTML文件
let fileName = getSoftwareFileName(sessionStorage.getItem("software-name"));

//获取文件名对应的HTML文件内容，并置入“software-container"标签内
fetch(fileName)
  .then(async (response) => await response.text())
  .then((content) => (containers[0].innerHTML = content));

Array.from(categorys).forEach((category) => {
  category.addEventListener("click", insertSoftwareHTML);
  category.addEventListener("click", changeCategoryStyle);
});

//通过软件名，获取对应文件名的HTML文件
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

//每次点击软件选项，通过点击的软件名，获取对应的HTML文件内容并置入“software-container"标签内
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

//每次点击软件选项，通过点击的软件名，设置其为绿底金字，其它选项置为默认样式
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
