const slider = document.querySelector(".slider");
const lengthNumber = document.querySelector("#密码长度滑块 > p:nth-child(3)");
const passwordBox = document.querySelector("#密码框 > p");
const digitBox = document.querySelector("#数字框");
const symbolBox = document.querySelector("#符号框");
const refreshPasswordButton = document.querySelector("#刷新密码 > img");
const copyPasswordButton = document.querySelector("#复制安全密码");
const defaultPasswordTypeButton = document.querySelector("#默认密码类型");
const currentPasswordType = document.querySelector(
  "#默认密码类型 > p:nth-child(1)"
);
const passwordTypeSelectContainer =
  document.querySelector("#密码类型选择-容器");
const passwordTypeSelect = document.querySelectorAll("#密码类型选择-内容 > p");
const passwordCharType = document.querySelector("#密码字符类型");

const passwordPool = new Array(93);
for (let i = 0; i < passwordPool.length; i++) {
  if (i <= 9) passwordPool[i] = String.fromCharCode(i + 48);
  else if (i <= 35) passwordPool[i] = String.fromCharCode(i + 55);
  else if (i <= 61) passwordPool[i] = String.fromCharCode(i + 61);
  else if (i <= 67) passwordPool[i] = String.fromCharCode(i - 29);
  else if (i <= 75) passwordPool[i] = String.fromCharCode(i - 28);
  else if (i <= 82) passwordPool[i] = String.fromCharCode(i - 17);
  else if (i <= 88) passwordPool[i] = String.fromCharCode(i + 8);
  else passwordPool[i] = String.fromCharCode(i + 34);
  // if (passwordPool[i] === "<") passwordPool[i] = "&lt;";
  // else if (passwordPool[i] === ">") passwordPool[i] = "&gt;";
}

passwordTypeSelect.forEach((passwordType) => {
  passwordType.onclick = () => {
    currentPasswordType.textContent = passwordType.textContent;
    resetPasswordType();
    getPassword();
  };
});

let digitChecked = true;
let symbolChecked = true;

digitBox.onclick = 数字框被点击;
symbolBox.onclick = 符号框被点击;

slider.oninput = getPassword;
refreshPasswordButton.onclick = getPassword;

const 密码复制提示 = document.getElementById("密码复制提示");
const 密码复制动画提示时长 = 2000;
let 密码复制动画Id = null;
copyPasswordButton.addEventListener("click", 点击复制密码按钮);
function 点击复制密码按钮() {
  copyPasswordButton.removeEventListener("click", 点击复制密码按钮);
  let content = passwordBox.textContent;
  navigator.clipboard.writeText(content);
  // 密码复制提示.style.animationName = "none";
  密码复制提示.classList.add("密码复制提示动画");
  密码复制动画Id = setTimeout(() => {
    密码复制提示.classList.remove("密码复制提示动画");
    copyPasswordButton.addEventListener("click", 点击复制密码按钮);
  }, 密码复制动画提示时长);
}

passwordTypeSelectContainer.style.display = "none";
defaultPasswordTypeButton.onclick = () => {
  if (passwordTypeSelectContainer.style.display === "none") {
    passwordTypeSelectContainer.style.display = "block";
  } else {
    passwordTypeSelectContainer.style.display = "none";
  }
};

passwordTypeSelectContainer.onmouseleave = () => {
  passwordTypeSelectContainer.style.display = "none";
};

function resetPasswordType() {
  let type = currentPasswordType.textContent;
  if (type === "PIN") {
    slider.setAttribute("min", 3);
    slider.setAttribute("max", 12);
    slider.value = 6;
    lengthNumber.textContent = 6;
    passwordCharType.style.display = "none";
    密码复制提示.classList.remove("密码复制提示动画");
    return;
  }
  if (type === "易记密码") {
    slider.setAttribute("min", 3);
    slider.setAttribute("max", 15);
    slider.value = 5;
    lengthNumber.textContent = 5;
    passwordCharType.style.display = "none";
    密码复制提示.classList.remove("密码复制提示动画");
    return;
  }
  if (type === "随机密码") {
    slider.setAttribute("min", 8);
    slider.setAttribute("max", 100);
    slider.setAttribute("value", 12);
    slider.value = 12;
    lengthNumber.textContent = 12;
    passwordCharType.style.display = "flex";
    密码复制提示.style.opacity = "0";
    密码复制提示.classList.remove("密码复制提示动画");
    return;
  }
  clearTimeout(密码复制动画Id);
  密码复制提示.classList.remove("密码复制提示动画");
  copyPasswordButton.addEventListener("click", 点击复制密码按钮);
}

function getPassword() {
  let minIndex = 0;
  let maxIndex = 92;
  let length = slider.value;
  lengthNumber.textContent = length;
  const 密码类型 = currentPasswordType.textContent;
  if (密码类型 === "随机密码") {
    if (digitChecked && symbolChecked) {
      minIndex = 0;
      maxIndex = 92;
    } else if (digitChecked) {
      minIndex = 0;
      maxIndex = 61;
    } else if (symbolChecked) {
      minIndex = 10;
      maxIndex = 92;
    } else {
      minIndex = 10;
      maxIndex = 61;
    }
  } else if (密码类型 === "PIN") {
    minIndex = 0;
    maxIndex = 9;
  } else if (密码类型 === "易记密码") {
    minIndex = 10;
    maxIndex = 61;
  }

  const minIndexSuppose = minIndex;
  const maxIndexSuppose = maxIndex;

  let indexPool = Array.from({ length: length }, (_, i) => i);
  let indexForRemove = Math.floor(Math.random() * indexPool.length);
  const indexForDigit = indexPool[indexForRemove];
  indexPool.splice(indexForRemove, 1);
  indexForRemove = Math.floor(Math.random() * indexPool.length);
  const indexForSymbol = indexPool[indexForRemove];
  indexPool.splice(indexForRemove, 1);
  indexForRemove = Math.floor(Math.random() * indexPool.length);
  const indexForLetter = indexPool[indexForRemove];
  indexPool = null;

  const passwordElement = document.createElement("div");

  for (let i = 0; i < length; i++) {
    let character = document.createElement("span");
    minIndex = minIndexSuppose;
    maxIndex = maxIndexSuppose;
    if (i === indexForLetter) {
      minIndex = 10;
      maxIndex = 61;
    } else if (digitChecked && i === indexForDigit) {
      minIndex = 0;
      maxIndex = 9;
    } else if (symbolChecked && i === indexForSymbol) {
      minIndex = 62;
      maxIndex = 92;
    }

    let index = Math.floor(Math.random() * (maxIndex - minIndex)) + minIndex;

    if (index <= 9) {
      character.classList.add("digit");
    } else if (index >= 62) {
      character.classList.add("symbol");
    } else {
      character.classList.add("letter");
    }
    character.textContent = passwordPool[index];
    passwordElement.appendChild(character);
  }

  passwordBox.innerHTML = passwordElement.innerHTML;
  clearTimeout(密码复制动画Id);
  密码复制提示.classList.remove("密码复制提示动画");
  copyPasswordButton.addEventListener("click", 点击复制密码按钮);
}

function 数字框被点击() {
  digitChecked = digitBox.checked;
  getPassword();
}

function 符号框被点击() {
  symbolChecked = symbolBox.checked;
  getPassword();
}
