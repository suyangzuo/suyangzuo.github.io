const cards = document.querySelectorAll(".software");

cards.forEach((card) => {
  card.addEventListener("mouseenter", changeCardBrightness);
  card.addEventListener("mouseleave", restoreCardBrightness);
});

function changeCardBrightness() {
  cards.forEach((card) => {
    card.style.filter = "brightness(25%)";
    this.style.filter = "brightness(100%)";
  });
}

function restoreCardBrightness() {
  cards.forEach((card) => {
    card.style.filter = "brightness(100%)";
  });
}
