/* document.addEventListener("DOMContentLoaded", () => {
  let includes = document.getElementsByTagName("insert-e");
  for (let i = 0; i < includes.length; i++) {
    let include = includes[i];
    load_file(include.attributes.src.value, function (text) {
      include.insertAdjacentHTML("afterend", text);
      include.remove();
    });
  }
});

async function load_file(filename, callback) {
  await fetch(filename)
    .then(async (response) => await response.text())
    .then((text) => callback(text));
}
*/

插入元素();

function 插入元素() {
  const script = document.currentScript;
  const parent = script.parentElement;
  const target = script.getAttribute("target"); /* 想要插入的HTML */
  const position = script.getAttribute("position");

  const xhr = new XMLHttpRequest();
  xhr.open("GET", target, false); /* false -> 同步请求 */
  xhr.send();

  if (xhr.status === 200) {
    parent.insertAdjacentHTML(position, xhr.responseText);
  }
}
