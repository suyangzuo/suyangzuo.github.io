const navCells = Array.from(document.getElementsByClassName("nav-cell"));
const contributors = document.getElementsByClassName("contributor");

navCells.forEach((navCell) => {
  navCell.addEventListener("click", () => {
    let index = navCells.indexOf(navCell);
    console.log(contributors[index]);
    // contributors[index].focus();
    contributors[index].scrollTo(0, 0);
  });
});
