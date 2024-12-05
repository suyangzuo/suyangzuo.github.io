const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 展示区 = document.querySelector(".展示区");
const 定位距离区 = document.querySelector(".定位距离区");
const 绝对定位距离滑块组 = 定位距离区.querySelectorAll("input[type='range']");
const 顶距离滑块 = 定位距离区.querySelector("input[id='顶']");
const 右距离滑块 = 定位距离区.querySelector("input[id='右']");
const 底距离滑块 = 定位距离区.querySelector("input[id='底']");
const 左距离滑块 = 定位距离区.querySelector("input[id='左']");
const 自身定位区 = document.querySelector(".自身定位区");
const 参照对象区 = document.querySelector(".参照对象区");
const 参照对象复选框组 = 参照对象区.querySelectorAll("input[type='checkbox']");
const 绝对定位距离启用组 = 定位距离区.querySelectorAll(
  "input[type='checkbox']",
);
const 顶距离启用复选框 = 定位距离区.querySelector("#顶-启用");
const 右距离启用复选框 = 定位距离区.querySelector("#右-启用");
const 底距离启用复选框 = 定位距离区.querySelector("#底-启用");
const 左距离启用复选框 = 定位距离区.querySelector("#左-启用");
let 顶_已确认 = 顶距离启用复选框.checked;
let 右_已确认 = 右距离启用复选框.checked;
let 底_已确认 = 底距离启用复选框.checked;
let 左_已确认 = 左距离启用复选框.checked;
const 自身 = document.querySelector(".绝对定位-元素");

const 平移区 = document.querySelector(".平移区");
const 平移滑块组 = 平移区.querySelectorAll("input[type='range']");
const 水平平移滑块 = 平移区.querySelector("#水平平移");
const 垂直平移滑块 = 平移区.querySelector("#垂直平移");

let 当前参照对象 = null;
const 外部容器复选框 = 参照对象区.querySelector("#外部容器");
const 中间容器复选框 = 参照对象区.querySelector("#中间容器");
const 内部容器复选框 = 参照对象区.querySelector("#内部容器");
const 外部容器 = document.querySelector(".绝对定位-外部容器");
const 中间容器 = document.querySelector(".绝对定位-中间容器");
const 内部容器 = document.querySelector(".绝对定位-内部容器");
const 顶辅助线 = 自身.querySelector(".顶辅助线");
const 右辅助线 = 自身.querySelector(".右辅助线");
const 底辅助线 = 自身.querySelector(".底辅助线");
const 左辅助线 = 自身.querySelector(".左辅助线");

for (const 定位距离滑块 of 绝对定位距离滑块组) {
  定位距离滑块.addEventListener("input", () => {
    const 滑块半值 = (定位距离滑块.max - 定位距离滑块.min) / 2;
    const 滑块值 = parseInt(定位距离滑块.value, 10);
    const 渐变位置 =
      (滑块值 + 滑块半值) / (定位距离滑块.max - 定位距离滑块.min);
    const 渐变位置百分比 = `${渐变位置 * 100}%`;
    root.style.setProperty(`--${定位距离滑块.id}渐变位置`, 渐变位置百分比);
    const 滑块值数字 = 定位距离滑块.parentElement.querySelector(".滑块值数字");
    滑块值数字.textContent = 定位距离滑块.value;

    if (顶_已确认 && 定位距离滑块.id === "顶") {
      自身.style.top = `${定位距离滑块.value}%`;
    } else if (底_已确认 && 定位距离滑块.id === "底") {
      自身.style.bottom = `${定位距离滑块.value}%`;
    } else if (左_已确认 && 定位距离滑块.id === "左") {
      自身.style.left = `${定位距离滑块.value}%`;
    } else if (右_已确认 && 定位距离滑块.id === "右") {
      自身.style.right = `${定位距离滑块.value}%`;
    }

    更新辅助线();
  });
}

const 定位单选框组 = 自身定位区.querySelectorAll("input[type='radio']");
for (const 定位单选框 of 定位单选框组) {
  定位单选框.addEventListener("change", () => {
    自身.style.position = 定位单选框组[0].checked ? "" : "absolute";
    const 定位距离区 = 自身定位区.querySelector(".定位距离区");
    const 定位值 = 自身.querySelector(".描述值");
    const 描述值文本 = 定位值.querySelector(".描述值文本");
    const 定位描述辅助 = 自身.querySelector(".定位描述辅助");
    const 代码值 = 自身.querySelector(".代码值");
    if (定位单选框组[0].checked) {
      定位距离区.classList.add("已屏蔽");
      描述值文本.textContent = "静态";
      定位描述辅助.classList.remove("屏蔽描述辅助");
      定位描述辅助.textContent = "默认";
      代码值.textContent = "static";
      当前参照对象 = null;
      顶辅助线.style.opacity = "0";
      底辅助线.style.opacity = "0";
      左辅助线.style.opacity = "0";
      右辅助线.style.opacity = "0";
    } else {
      定位距离区.classList.remove("已屏蔽");
      描述值文本.textContent = "绝对";
      定位描述辅助.classList.add("屏蔽描述辅助");
      定位描述辅助.textContent = "";
      代码值.textContent = "absolute";
      const 顶 = 顶距离滑块.value;
      const 右 = 右距离滑块.value;
      const 底 = 底距离滑块.value;
      const 左 = 左距离滑块.value;
      刷新绝对定位位置(顶, 右, 底, 左);
      更新参照对象();
      更新辅助线();
    }
  });
}

for (const 参照对象复选框 of 参照对象复选框组) {
  参照对象复选框.addEventListener("input", () => {
    const 参照对象 = document.querySelector(`div[class$=${参照对象复选框.id}]`);
    参照对象.style.position = 参照对象复选框.checked ? "relative" : "";

    更新参照对象();
    更新辅助线();
  });
}

for (const 绝对定位距离启用复选框 of 绝对定位距离启用组) {
  绝对定位距离启用复选框.addEventListener("input", () => {
    const 已确认 = 绝对定位距离启用复选框.checked;
    const 对应距离滑块 = 绝对定位距离启用复选框.parentElement.querySelector(
      "input[type='range']",
    );
    if (对应距离滑块.id === "顶") {
      自身.style.top = 已确认 ? `${对应距离滑块.value}%` : "";
    } else if (对应距离滑块.id === "底") {
      自身.style.bottom = 已确认 ? `${对应距离滑块.value}%` : "";
    } else if (对应距离滑块.id === "左") {
      自身.style.left = 已确认 ? `${对应距离滑块.value}%` : "";
    } else {
      自身.style.right = 已确认 ? `${对应距离滑块.value}%` : "";
    }

    if (绝对定位距离启用复选框.id[0] === "顶") {
      顶_已确认 = 绝对定位距离启用复选框.checked;
    } else if (绝对定位距离启用复选框.id[0] === "底") {
      底_已确认 = 绝对定位距离启用复选框.checked;
    } else if (绝对定位距离启用复选框.id[0] === "左") {
      左_已确认 = 绝对定位距离启用复选框.checked;
    } else {
      右_已确认 = 绝对定位距离启用复选框.checked;
    }

    更新辅助线();
  });
}

for (const 平移滑块 of 平移滑块组) {
  平移滑块.addEventListener("input", () => {
    const 滑块半值 = (平移滑块.max - 平移滑块.min) / 2;
    const 滑块值 = parseInt(平移滑块.value, 10);
    const 渐变位置 = (滑块值 + 滑块半值) / (平移滑块.max - 平移滑块.min);
    const 渐变位置百分比 = `${渐变位置 * 100}%`;
    root.style.setProperty(`--${平移滑块.id}渐变位置`, 渐变位置百分比);
    const 滑块值数字 = 平移滑块.parentElement.querySelector(".滑块值数字");
    滑块值数字.textContent = 平移滑块.value;
    自身.style.translate = `${水平平移滑块.value}% ${垂直平移滑块.value}%`;
  });
}

function 刷新绝对定位位置(顶, 右, 底, 左) {
  if (顶_已确认) {
    自身.style.top = `${顶}%`;
  }

  if (右_已确认) {
    自身.style.right = `${右}%`;
  }

  if (底_已确认) {
    自身.style.bottom = `${底}%`;
  }

  if (左_已确认) {
    自身.style.left = `${左}%`;
  }
}

function 更新参照对象() {
  if (
    !外部容器复选框.checked &&
    !中间容器复选框.checked &&
    !内部容器复选框.checked
  ) {
    当前参照对象 = 展示区;
  }

  if (内部容器复选框.checked) {
    当前参照对象 = 内部容器;
  } else if (中间容器复选框.checked) {
    当前参照对象 = 中间容器;
  } else if (外部容器复选框.checked) {
    当前参照对象 = 外部容器;
  }
}

function 更新辅助线() {
  const 顶滑块值 = parseInt(顶距离滑块.value, 10);
  const 右滑块值 = parseInt(右距离滑块.value, 10);
  const 底滑块值 = parseInt(底距离滑块.value, 10);
  const 左滑块值 = parseInt(左距离滑块.value, 10);
  const 当前参照对象样式 = window.getComputedStyle(当前参照对象);

  if (顶_已确认) {
    顶辅助线.style.opacity = "1";
    底辅助线.style.opacity = "0";
    顶辅助线.style.height = `${
      (parseInt(当前参照对象样式.height) * 顶滑块值) / 100
    }px`;
    const 顶数据值 = 顶辅助线.querySelector(".辅助线数据值");
    顶数据值.textContent = 顶滑块值.toString();
  } else if (底_已确认) {
    顶辅助线.style.opacity = "0";
    底辅助线.style.opacity = "1";
    const 底数据值 = 底辅助线.querySelector(".辅助线数据值");
    底数据值.textContent = 底滑块值.toString();
    底辅助线.style.height = `${
      (parseInt(当前参照对象样式.height) * 底滑块值) / 100
    }px`;
  } else {
    顶辅助线.style.opacity = "0";
    底辅助线.style.opacity = "0";
  }

  if (左_已确认) {
    左辅助线.style.opacity = "1";
    右辅助线.style.opacity = "0";
    左辅助线.style.width = `${
      (parseInt(当前参照对象样式.width) * 左滑块值) / 100
    }px`;
    const 左数据值 = 左辅助线.querySelector(".辅助线数据值");
    左数据值.textContent = 左滑块值.toString();
  } else if (右_已确认) {
    左辅助线.style.opacity = "0";
    右辅助线.style.opacity = "1";
    右辅助线.style.width = `${
      (parseInt(当前参照对象样式.width) * 右滑块值) / 100
    }px`;
    const 右数据值 = 右辅助线.querySelector(".辅助线数据值");
    右数据值.textContent = 右滑块值.toString();
  } else {
    左辅助线.style.opacity = "0";
    右辅助线.style.opacity = "0";
  }
}
