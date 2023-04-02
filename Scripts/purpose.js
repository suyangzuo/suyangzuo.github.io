const selectors = Array.from(document.getElementsByClassName("宗旨选择器"));
const purposes = document.getElementsByClassName("purpose");
let prevIndex = -1;

selectors.forEach((selector) => {
  selector.addEventListener("click", () => {
    let index = selectors.indexOf(selector);

    if (prevIndex === index) return;
    else if (prevIndex === -1) {
      prevIndex = index;
    } else {
      selectors[prevIndex].style.backgroundColor = "transparent";
      selectors[prevIndex].style.color = "black";
      prevIndex = index;
    }

    // selectors[index].style.backgroundColor = "#222";
    // selectors[index].style.color = "white";
    selectors[index].setAttribute(
      "style",
      "background-color:#222 !important; color:white !important"
    );
    purposes[index].scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
