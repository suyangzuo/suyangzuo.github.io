const categorys = document.getElementsByClassName("software-category");
const containers = document.getElementsByClassName("software-container");
let text = "文本编辑器";

Array.from(categorys).forEach((category) => {
  category.addEventListener("click", insertSoftwareHTML);
});

async function insertSoftwareHTML() {
  if (text === Array.from(this.getElementsByTagName("p"))[0].innerText) return;
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  containers[0].innerHTML = "";
  text = Array.from(this.getElementsByTagName("p"))[0].innerText;
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
