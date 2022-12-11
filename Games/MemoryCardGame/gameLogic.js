const cardsPool = [
  {
    name: "乖喵",
    img: "./Images/乖喵.jpg",
  },
  {
    name: "火山汽车",
    img: "./Images/火山汽车.jpg",
  },
  {
    name: "卡通狐狸",
    img: "./Images/卡通狐狸.png",
  },
  {
    name: "科幻城市雨天",
    img: "./Images/科幻城市雨天.jpg",
  },
  {
    name: "女战士",
    img: "./Images/女战士.jpg",
  },
  {
    name: "苹果花",
    img: "./Images/苹果花.jpg",
  },
  {
    name: "群山雪路",
    img: "./Images/群山雪路.png",
  },
  {
    name: "游戏机",
    img: "./Images/游戏机.jpg",
  },
  {
    name: "乖喵",
    img: "./Images/乖喵.jpg",
  },
  {
    name: "火山汽车",
    img: "./Images/火山汽车.jpg",
  },
  {
    name: "卡通狐狸",
    img: "./Images/卡通狐狸.png",
  },
  {
    name: "科幻城市雨天",
    img: "./Images/科幻城市雨天.jpg",
  },
  {
    name: "女战士",
    img: "./Images/女战士.jpg",
  },
  {
    name: "苹果花",
    img: "./Images/苹果花.jpg",
  },
  {
    name: "群山雪路",
    img: "./Images/群山雪路.png",
  },
  {
    name: "游戏机",
    img: "./Images/游戏机.jpg",
  },
];

cardsPool.sort(() => 0.5 - Math.random());

const cardGrid = document.querySelector("#card-grid");
const timePassedElement = document.querySelector("#time-passed");
const resetGameButton = document.querySelector(".game-area > button");
let clickCountElement = document.querySelector("#click-count");
let clickCount = 0;

let cardsPairName = []; //配对组，保存两次点击的图片名称
let cardsPairIndex = []; //配对组，保存两次点击的图片Id

let matchCount = 0; //匹配次数
let timePassed = 0;
let timerIsRunning = false; //用来记录第1次点击，以计时

resetGameButton.onclick = resetGame;

function createCards() {
  for (let i = 0; i < cardsPool.length; i++) {
    let outer = document.createElement("div"); //生成翻转卡片外层
    outer.className = "outer";
    outer.setAttribute("index", i);
    outer.addEventListener("click", clickCard);
    // outer.addEventListener("click", timerIntervalStart);
    cardGrid.appendChild(outer); //将外层作为网格的子元素
    let inner = document.createElement("div"); //生成翻转卡片内层
    inner.className = "inner";
    outer.appendChild(inner); //将内层作为外层的子元素
    let front = document.createElement("div"); //生成卡片正面
    front.className = "front";
    inner.appendChild(front); //将正面作为内层的子元素
    let back = document.createElement("div"); //生成卡片背面
    back.className = "back";
    inner.appendChild(back); //将背面作为内层的子元素
    let frontImage = document.createElement("img"); //生成正面img
    frontImage.setAttribute("src", "./Images/Ready.png");
    front.appendChild(frontImage); //将正面img作为正面子元素
    let backImage = document.createElement("img"); //生成背面img
    back.appendChild(backImage); //将背面img作为背面子元素
  }
  clickCountElement.textContent = `${clickCount}`;
  timePassedElement.textContent = `${timePassed}`;
}

createCards();

function clickCard() {
  clickCount++;
  clickCountElement.textContent = `${clickCount}`;
  if (timerIsRunning === false) {
    timerIntervalStart();
    timerIsRunning = true;
  }
  let index = this.getAttribute("index"); //获取outer元素
  if (cardsPairIndex.length === 1 && cardsPairIndex[0] === index) return;

  cardsPairIndex.push(index);
  cardsPairName.push(cardsPool[index].name); //将点击的图片名称放入配对组
  let inner = this.firstElementChild; //获取inner元素
  let back = inner.querySelector(".back"); //获取背面元素
  let backImage = back.firstElementChild; //获取背面img元素
  backImage.setAttribute("src", cardsPool[index].img);
  inner.style.transform = "rotateY(180deg)";
  if (cardsPairName.length >= 2) {
    let names = [...cardsPairName];
    let indexs = [...cardsPairIndex];
    cardsPairName.length = 0;
    cardsPairIndex.length = 0;
    setTimeout(() => checkMatch(names, indexs), 500);
  }
}

function checkMatch(names, indexs) {
  const outers = document.querySelectorAll(".outer");
  const frontImages = document.querySelectorAll(".front > img");
  const inners = document.querySelectorAll(".inner");
  if (names[0] === names[1]) {
    frontImages[indexs[0]].setAttribute("src", "./Images/Checked.png");
    frontImages[indexs[1]].setAttribute("src", "./Images/Checked.png");
    outers[indexs[0]].removeEventListener("click", clickCard);
    outers[indexs[1]].removeEventListener("click", clickCard);
    matchCount++;
  } else {
    frontImages[indexs[0]].setAttribute("src", "./Images/Ready.png");
    frontImages[indexs[1]].setAttribute("src", "./Images/Ready.png");
  }
  inners[indexs[0]].style.transform = "rotateY(0deg)";
  inners[indexs[1]].style.transform = "rotateY(0deg)";
}

function timerIntervalStart() {
  let countTimeResult = setInterval(() => {
    if (matchCount === cardsPool.length / 2 || !timerIsRunning) {
      clearInterval(countTimeResult);
    } else {
      timePassed++;
      let timePassedString = timePassed.toString();
      timePassedElement.textContent = `${timePassedString.slice(
        0,
        timePassedString.length - 1
      )}.${timePassedString.charAt(timePassedString.length - 1)}`;
    }
  }, 100);
}

function resetGame() {
  timerIsRunning = false;
  clickCount = 0;
  timePassed = 0;
  matchCount = 0;
  cardsPairIndex.length = 0;
  cardsPairName.length = 0;
  cardsPool.sort(() => 0.5 - Math.random());
  cardGrid.innerHTML = "";
  createCards();
}
