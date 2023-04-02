const navCells = Array.from(document.getElementsByClassName("nav-cell"));
const contributors = document.getElementsByClassName("contributor");

navCells.forEach((navCell) => {
  navCell.addEventListener("click", () => {
    let index = navCells.indexOf(navCell);
    contributors[index].scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
