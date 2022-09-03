const categorys = document.getElementsByClassName("software-category");
const containers = document.getElementsByClassName("software-container");

Array.from(categorys).forEach((category) => {
  category.addEventListener("mouseenter", insertSoftwareHTML);
});

async function insertSoftwareHTML() {
  containers[0].innerHTML = "";
  let text = Array.from(this.getElementsByTagName("p"))[0].innerText;
  let filename = "";
  switch (text) {
    case "文本编辑器":
      filename = "/Software/text-editor.html";
      break;
    case "集成开发环境":
      filename = "/Software/ide.html";
      break;
    case "开发工具":
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
    .then((text) => (containers[0].innerHTML = text));
}
