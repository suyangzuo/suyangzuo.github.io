// const cards = document.querySelectorAll(".software");
const firstCategory = Array.from(
  document.getElementsByClassName("software-category")
)[0];
const firstP = Array.from(document.getElementsByTagName("p"))[0];

const currentCategory = firstCategory;

firstCategory.style.backgroundColor = "rgb(41,52,63)";
firstP.style.color = "gold";
firstP.style.transform = "translateX(1em)";

const categories = document.querySelectorAll(".software-category");

categories.forEach((category) => {
  category.addEventListener("mouseenter", changeCategoryStyleWhenMouseEnter);
  category.addEventListener("mouseleave", changeCategoryStyleWhenMouseLeave);
  category.addEventListener("click", changeCategoryStyle);
});

function changeCategoryStyleWhenMouseEnter() {
  if (this.style.backgroundColor === rgb(41,52,63)) return;
  this.style.backgroundColor = "rgb(0,37,48)";
}

function changeCategoryStyleWhenMouseLeave() {
  if (this.style.backgroundColor === rgb(41,52,63)) return;
  this.style.backgroundColor = "transparent";
}

function changeCategoryStyle() {
  categories.forEach((category) => {
    category.style.backgroundColor = "transparent";
    let p = Array.from(category.getElementsByTagName("p"))[0];
    p.style.color = "var(--f-color)";
    p.style.transform = "translateX(0)";
  });
  this.style.backgroundColor = "rgb(41,52,63)";
  let p = Array.from(this.getElementsByTagName("p"))[0];
  p.style.color = "gold";
  p.style.transform = "translateX(1em)";
}
