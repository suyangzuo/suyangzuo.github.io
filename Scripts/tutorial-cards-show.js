const cards = document.querySelectorAll(".tutorial-card");

cards.forEach((card) => {
  card.addEventListener("mouseover", changeCardBrightness);
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
