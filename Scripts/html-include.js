document.addEventListener("DOMContentLoaded", () => {
  let includes = document.getElementsByTagName("include");
  for (let i = 0; i < includes.length; i++) {
    let include = includes[i];
    load_file(include.attributes.src.value, function (text) {
      include.insertAdjacentHTML("afterend", text);
      include.remove();
    });
  }
});

function load_file(filename, callback) {
  fetch(filename)
    .then((response) => response.text())
    .then((text) => callback(text));
}
