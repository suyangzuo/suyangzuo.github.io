// 姓名池后期需要打乱，因此用let
let 角色姓名池 = [
  "刘备",
  "关羽",
  "张飞",
  "赵云",
  "马超",
  "黄忠",
  "袁绍",
  "袁术",
  "孙权",
  "黄盖",
  "周瑜",
  "太史慈",
  "夏侯渊",
  "夏侯惇",
  "庞统",
  "徐庶",
  "曹操",
  "曹丕",
  "刘禅",
  "姜维",
  "张昭",
  "司马懿",
  "司马昭",
  "张角",
  "吕布",
];

const 登场角色数量 = 10;
let 登场姓名组 = []; //后期会打乱
let 登场图片组 = []; //后期会打乱
const 比较组 = [];
const 肖像区 = document.querySelector(".肖像区");
const 姓名区 = document.querySelector(".姓名区");

let 肖像类型 = "影视剧";
const 肖像类型单选区 = document.querySelector(".肖像类型单选区");
const 肖像类型单选框组 = 肖像类型单选区.querySelectorAll(".单选框");
for (const 单选框 of 肖像类型单选框组) {
  单选框.addEventListener("change", () => {
    //仅仅替换图片，不做其它任何逻辑上的更改
    肖像类型 = 单选框.id;
    const 所有肖像图 = document.querySelectorAll(".肖像图");
    for (let i = 0; i < 登场角色数量; i++) {
      登场图片组[i].图片路径 = `./人物肖像图片/${肖像类型}/${登场图片组[i].图片名称}.png`;
      所有肖像图[i].src = 登场图片组[i].图片路径;
    }
  });
}

生成登场姓名和肖像数据();

function 生成登场姓名和肖像数据() {
  角色姓名池 = 角色姓名池.sort(() => Math.random() - 0.5); // 打乱姓名顺序
  登场姓名组.length = 0;
  登场图片组.length = 0;
  for (let i = 0; i < 登场角色数量; i++) {
    登场姓名组.push(角色姓名池[i]);
    登场图片组.push({
      图片名称: 角色姓名池[i],
      图片路径: `./人物肖像图片/${肖像类型}/${角色姓名池[i]}.png`,
    });
  }
}

for (let i = 0; i < 登场角色数量; i++) {
  生成姓名();
  生成肖像();
}

function 生成姓名() {
  姓名区.innerHTML = "";
  登场姓名组 = 登场姓名组.sort(() => Math.random() - 0.5);
  for (let i = 0; i < 登场角色数量; i++) {
    const 本轮姓名 = 登场姓名组[i];
    const 姓名 = document.createElement("button");
    姓名.className = "姓名";
    姓名.setAttribute("data-name", 本轮姓名);
    姓名.textContent = 本轮姓名;
    姓名区.appendChild(姓名);
  }
}

function 生成肖像() {
  肖像区.innerHTML = "";
  登场图片组 = 登场图片组.sort(() => Math.random() - 0.5); //打乱肖像
  for (let i = 0; i < 登场角色数量; i++) {
    const 本轮图片 = 登场图片组[i];
    const 肖像 = document.createElement("div");
    肖像.className = "肖像";
    肖像区.appendChild(肖像);
    const 肖像图容器 = document.createElement("figure");
    肖像图容器.className = "肖像图容器";
    肖像图容器.setAttribute("data-name", 本轮图片.图片名称);
    肖像.appendChild(肖像图容器);
    const 肖像图 = document.createElement("img");
    肖像图.className = "肖像图";
    肖像图.src = 本轮图片.图片路径;
    肖像图.alt = 本轮图片.图片名称;
    肖像图.setAttribute("data-type", 肖像类型);
    肖像图容器.appendChild(肖像图);
  }
}

const 姓名按钮组 = document.getElementsByClassName("姓名");
const 肖像组 = document.getElementsByClassName("肖像");

for (const 姓名按钮 of 姓名按钮组) {
  姓名按钮.addEventListener("click", 点击姓名或肖像);
}

for (const 肖像 of 肖像组) {
  const 肖像图容器 = 肖像.querySelector(".肖像图容器");
  肖像图容器.addEventListener("click", 点击姓名或肖像);
}

function 点击姓名或肖像(e) {
  const 点击对象 = e.currentTarget;
  let 类型 = "肖像";
  if (点击对象.className.includes("姓名")) {
    类型 = "姓名";
  }
  const 选中姓名 = 点击对象.getAttribute("data-name");
  if (比较组.length === 0) {
    比较组.push({
      元素: 点击对象,
      类型: 类型,
      姓名: 选中姓名,
    });
    点击对象.classList.add("选中");
  } else {
    if (类型 === 比较组[0].类型) {
      if (点击对象 === 比较组[0].元素) {
        return;
      } else {
        比较组[0].元素.classList.remove("选中");
        比较组[0].元素 = 点击对象;
        比较组[0].姓名 = 选中姓名;
        点击对象.classList.add("选中");
      }
    } else {
      比较组.push({
        元素: 点击对象,
        类型: 类型,
        姓名: 选中姓名,
      });
      点击对象.classList.add("选中");
      获取比较结果();
    }
  }
}

function 获取比较结果() {
  屏蔽姓名与肖像点击事件();
  let 结果正确 = false;
  if (比较组[0].姓名 === 比较组[1].姓名) {
    结果正确 = true;
  }
  setTimeout(() => {
    比较组[0].元素.classList.remove("选中");
    比较组[1].元素.classList.remove("选中");
    if (结果正确) {
      比较组[0].元素.classList.add("出队");
      比较组[1].元素.classList.add("出队");
    }
    比较组.length = 0;
    恢复姓名与肖像点击事件();
  }, 750);
}

function 屏蔽姓名与肖像点击事件() {
  for (const 肖像 of 肖像组) {
    const 肖像图容器 = 肖像.querySelector(".肖像图容器");
    肖像图容器.removeEventListener("click", 点击姓名或肖像);
  }
  for (const 姓名按钮 of 姓名按钮组) {
    姓名按钮.removeEventListener("click", 点击姓名或肖像);
  }
}

function 恢复姓名与肖像点击事件() {
  for (const 肖像 of 肖像组) {
    const 肖像图容器 = 肖像.querySelector(".肖像图容器");
    肖像图容器.addEventListener("click", 点击姓名或肖像);
  }
  for (const 姓名按钮 of 姓名按钮组) {
    姓名按钮.addEventListener("click", 点击姓名或肖像);
  }
}

const 重置按钮 = document.querySelector(".reset-game");
重置按钮.addEventListener("click", () => {
  比较组.length = 0;
  生成登场姓名和肖像数据();
  生成姓名();
  生成肖像();
  for (const 姓名按钮 of 姓名按钮组) {
    姓名按钮.addEventListener("click", 点击姓名或肖像);
  }

  for (const 肖像 of 肖像组) {
    const 肖像图容器 = 肖像.querySelector(".肖像图容器");
    肖像图容器.addEventListener("click", 点击姓名或肖像);
  }
});
