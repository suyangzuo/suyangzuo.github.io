const cards = document.querySelectorAll(".tutorial-card");

cards.forEach((card) => {
  card.addEventListener("mouseenter", changeCardBrightness);
  card.addEventListener("mouseleave", restoreCardBrightness);
});

function changeCardBrightness() {
  cards.forEach((card) => {
    card.style.filter = "brightness(45%)";
    this.style.filter = "brightness(100%)";
  });
}

function restoreCardBrightness() {
  cards.forEach((card) => {
    card.style.filter = "brightness(100%)";
  });
}
