const games = document.querySelectorAll(".game-grid");
for (const [index, game] of games.entries()) {
  game.classList.add(`game-${index + 1}`);
  GenerateGameNumber(index, game);
}

function GenerateGameNumber(index, gameGrid) {
  const numberElement = document.createElement("span");
  numberElement.className = "游戏序号";
  numberElement.textContent = `${index + 1}`;
  const gameTitle = gameGrid.querySelector("p");
  gameTitle?.prepend(numberElement);
}
