document.addEventListener("DOMContentLoaded", () => {
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

// function load_file(filename, callback) {
//   fetch(filename)
//     .then((response) => response.text())
//     .then((text) => callback(text));
// }
