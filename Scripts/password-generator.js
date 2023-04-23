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
  if (passwordPool[i] === "<") passwordPool[i] = "&lt;";
  else if (passwordPool[i] === ">") passwordPool[i] = "&gt;";
}

passwordTypeSelect.forEach((passwordType) => {
  passwordType.onclick = () => {
    let content = passwordType.innerHTML;
    currentPasswordType.innerHTML = content;
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

copyPasswordButton.onclick = () => {
  let content = passwordBox.innerHTML;
  navigator.clipboard.writeText(content);
};

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
  let type = currentPasswordType.innerHTML;
  if (type === "PIN") {
    slider.setAttribute("min", 3);
    slider.setAttribute("max", 12);
    slider.value = 6;
    lengthNumber.innerHTML = 6;
    passwordCharType.style.display = "none";
    return;
  }
  if (type === "随机密码") {
    slider.setAttribute("min", 8);
    slider.setAttribute("max", 100);
    slider.setAttribute("value", 12);
    slider.value = 12;
    lengthNumber.innerHTML = 12;
    passwordCharType.style.display = "flex";
    return;
  }
}

function getPassword() {
  let minIndex = 0;
  let maxIndex = 92;
  let length = slider.value;
  lengthNumber.innerHTML = length;
  let passwordArray = [];
  if (currentPasswordType.innerHTML === "随机密码") {
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
  } else if (currentPasswordType.innerHTML === "PIN") {
    minIndex = 0;
    maxIndex = 9;
  }
  for (let i = 0; i < length; i++) {
    passwordArray.push(
      passwordPool[Math.floor(Math.random() * (maxIndex - minIndex)) + minIndex]
    );
  }
  let password = passwordArray.join("");
  passwordBox.innerHTML = password;
}

function 数字框被点击() {
  digitChecked = digitBox.checked;
  getPassword();
}

function 符号框被点击() {
  symbolChecked = symbolBox.checked;
  getPassword();
}
