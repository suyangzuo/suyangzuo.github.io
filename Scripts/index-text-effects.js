const imgCardsWords = document.querySelectorAll(".img-cards-words > p");
const introTitles = document.querySelectorAll(".intro-title > p");
const introGifs = document.querySelectorAll(".intro-gif");

let revealHeight = 150;

window.addEventListener("scroll", revealImgCardsWords);
window.addEventListener("scroll", reveaIntroGifs);
window.addEventListener("scroll", revealIntroTitles);

function revealImgCardsWords() {
  let windowHeight = window.innerHeight;
  for (let i = 0; i < imgCardsWords.length; i++) {
    let paragraphTop = imgCardsWords[i].getBoundingClientRect().top;
    if (paragraphTop < windowHeight - revealHeight && paragraphTop >= revealHeight) {
      imgCardsWords[i].style.transform = "translateX(0)";
      imgCardsWords[i].style.filter = "opacity(1)";
    } else {
      imgCardsWords[0].style.transform = "translateX(-100%)";
      imgCardsWords[1].style.transform = "translateX(100%)";
      imgCardsWords[i].style.filter = "opacity(0)";
    }
  }
}

function reveaIntroGifs() {
  let windowHeight = window.innerHeight;
  for (let i = 0; i < introGifs.length; i++) {
    let introGifTop = introGifs[i].getBoundingClientRect().top;
    if (
      (i === 0 || i === 1 || i === 2 || i === 3) &&
      introGifTop < windowHeight - revealHeight
    ) {
      if (i === 0) introGifs[0].style.transform = "translateX(-175%)";
      if (i === 1) introGifs[1].style.transform = "translateX(-125%)";
      if (i === 2) introGifs[2].style.transform = "translateX(-75%)";
      if (i === 3) introGifs[3].style.transform = "translateX(5%)";
    } else if (i === 0 || i === 1 || i === 2) {
      introGifs[i].style.transform = "translateX(-10%)";
    } else if (i === 3) {
      introGifs[i].style.transform = "translateX(-100%)";
    }

    if ((i === 4 || i === 5 || i === 6) && introGifTop < windowHeight - 25) {
      if (i === 4) introGifs[4].style.transform = "translateX(-75%)";
      if (i === 5) introGifs[5].style.transform = "translateX(-125%)";
      if (i === 6) introGifs[6].style.transform = "translateX(-175%)";
    } else if (i === 4 || i === 5 || i === 6) {
      introGifs[i].style.transform = "translateX(-10%)";
    }
  }
}

function revealIntroTitles() {
  let introTitleRevealHeight = 400;
  let windowHeight = window.innerHeight;
  let introTitleTop = introTitles[0].getBoundingClientRect().top;
  if (introTitleTop < windowHeight - introTitleRevealHeight) {
    introTitles[0].style.transform = "translateY(0)";
    introTitles[1].style.transform = "translateY(0)";
    introTitles[0].style.filter = "opacity(1)";
    introTitles[1].style.filter = "opacity(1)";
  } else {
    introTitles[0].style.transform = "translateY(-200%)";
    introTitles[1].style.transform = "translateY(200%)";
    introTitles[0].style.filter = "opacity(0)";
    introTitles[1].style.filter = "opacity(0)";
  }
}
