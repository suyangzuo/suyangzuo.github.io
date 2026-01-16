const 信息提供区 = document.querySelector("#信息提供区");
const 标签区集合 = 信息提供区.querySelectorAll(".标签区");
const 生成对话按钮 = document.getElementById("生成对话");
const 对话生成区 = document.getElementById("对话生成区");
const 随机回复复选框 = document.getElementById("随机生成回复");
const 分割回复时间复选框 = document.getElementById("分割回复时间");
const 颜色模式复选框 = document.getElementById("颜色模式");
const 截图按钮 = document.getElementById("截图");
const 回复词集合 = ["已收到", "收到", "已知悉", "收到了", "好的老师", "收到！", "明白！"];

// 获取信息输入区的所有文本框
const 信息输入区 = document.querySelector(".信息输入区");
const 输入框集合 = 信息输入区.querySelectorAll(".输入框");

let 随机回复 = false;
let 分割回复时间 = true;
let 颜色模式 = "dark";

if (localStorage.getItem("随机回复") === null) {
  localStorage.setItem("随机回复", 随机回复.toString());
} else {
  随机回复 = JSON.parse(localStorage.getItem("随机回复"));
  随机回复复选框.checked = 随机回复;
}

if (localStorage.getItem("分割回复时间") === null) {
  localStorage.setItem("分割回复时间", 分割回复时间.toString());
} else {
  分割回复时间 = JSON.parse(localStorage.getItem("分割回复时间"));
  分割回复时间复选框.checked = 分割回复时间;
}

if (localStorage.getItem("颜色模式") === null) {
  localStorage.setItem("颜色模式", 颜色模式);
} else {
  颜色模式 = localStorage.getItem("颜色模式");
  颜色模式复选框.checked = 颜色模式 === "light";
  if (颜色模式复选框.checked) {
    对话生成区.setAttribute("浅色模式", "");
  } else {
    对话生成区.removeAttribute("浅色模式");
  }
}

随机回复复选框.addEventListener("input", () => {
  随机回复 = 随机回复复选框.checked;
  localStorage.setItem("随机回复", 随机回复.toString());
});

分割回复时间复选框.addEventListener("input", () => {
  分割回复时间 = 分割回复时间复选框.checked;
  localStorage.setItem("分割回复时间", 分割回复时间.toString());
});

颜色模式复选框.addEventListener("input", () => {
  颜色模式 = 颜色模式复选框.checked ? "light" : "dark";
  if (颜色模式复选框.checked) {
    对话生成区.setAttribute("浅色模式", "");
  } else {
    对话生成区.removeAttribute("浅色模式");
  }
  localStorage.setItem("颜色模式", 颜色模式);
});

// 定义使用localStorage的文本框id
const 使用localStorage的输入框id = ["班级名称", "班级人数", "班主任姓名", "学生姓名", "回复者姓名后缀"];

// 恢复所有文本框的值
for (const 输入框 of 输入框集合) {
  const 使用localStorage = 使用localStorage的输入框id.includes(输入框.id);
  const 存储键 = `输入框_${输入框.id}`;
  const 保存的值 = 使用localStorage ? localStorage.getItem(存储键) : sessionStorage.getItem(存储键);

  if (保存的值 !== null) {
    输入框.value = 保存的值;
  }

  // 为每个文本框添加input事件监听器，保存值到对应的存储
  输入框.addEventListener("input", () => {
    if (使用localStorage) {
      localStorage.setItem(存储键, 输入框.value);
    } else {
      sessionStorage.setItem(存储键, 输入框.value);
    }
  });
}

生成对话按钮.addEventListener("click", 生成对话);

function 生成对话() {
  for (const 标签区 of 标签区集合) {
    const 输入框 = 标签区.querySelector(".输入框");
    const 标签 = 标签区.querySelector(".标签");
    // 允许"回复者姓名后缀"和"回复信息"为空，因为代码中有默认处理逻辑
    if ((输入框.value === null || 输入框.value === "") && 输入框.id !== "回复者姓名后缀" && 输入框.id !== "回复信息") {
      return;
    }
  }

  对话生成区.innerHTML = "";

  const 班级名称区 = document.createElement("div");
  班级名称区.className = "班级名称区";
  对话生成区.appendChild(班级名称区);

  const 时间区 = document.createElement("h6");
  时间区.className = "时间区";
  const 当前日历时间 = Date.now();
  let 当前日期 = new Date(当前日历时间);
  const 小时 = 当前日期.getHours();
  const 分钟 = 当前日期.getMinutes();
  const 小时文本 = 小时 < 10 ? `0${小时}` : 小时.toString();
  const 分钟文本 = 分钟 < 10 ? `0${分钟}` : 分钟.toString();
  时间区.textContent = `${小时文本}:${分钟文本}`;
  对话生成区.appendChild(时间区);

  const 班级名称输入框 = document.getElementById("班级名称");
  const 班级名称 = 班级名称输入框.value;

  const 班级人数输入框 = document.getElementById("班级人数");
  const 班级人数 = 班级人数输入框.value;

  班级名称区.textContent = `${班级名称} (${班级人数})`;

  const 班主任姓名输入框 = document.getElementById("班主任姓名");
  const 班主任姓名 = 班主任姓名输入框.value;

  const 通知信息输入框 = document.getElementById("通知信息");
  const 通知信息 = 通知信息输入框.value;

  生成个人信息(班主任姓名, 通知信息);

  const 学生姓名输入框 = document.getElementById("学生姓名");
  const 学生姓名 = 学生姓名输入框.value;
  const 姓名集合 = 学生姓名.split("，");

  const 后缀输入框 = document.getElementById("回复者姓名后缀");
  const 后缀字符串 = 后缀输入框.value;
  const 后缀集合 = 后缀字符串.split("，");

  let 时间段数 = 0;
  let 最大值 = 0;
  let 最小值 = 0;
  if (姓名集合.length <= 5) {
    最小值 = 0;
    最大值 = 1;
  } else if (姓名集合.length <= 10) {
    最小值 = 1;
    最大值 = 3;
  } else if (姓名集合.length <= 20) {
    最小值 = 3;
    最大值 = 5;
  } else if (姓名集合.length <= 30) {
    最小值 = 3;
    最大值 = 7;
  } else if (姓名集合.length <= 40) {
    最小值 = 4;
    最大值 = 8;
  } else {
    最小值 = 5;
    最大值 = 10;
  }
  时间段数 = Math.floor(Math.random() * (最大值 - 最小值 + 1) + 最小值);

  let 发送时间使用计数 = 0;
  for (const 姓名 of 姓名集合) {
    const 回复信息输入框 = document.getElementById("回复信息");
    const 输入框内容 = 回复信息输入框.value.trim();
    let 回复信息;
    if (输入框内容) {
      回复信息 = 输入框内容;
    } else {
      const 回复索引 = Math.floor(Math.random() * 回复词集合.length);
      回复信息 = 随机回复复选框.checked ? 回复词集合[回复索引] : "已收到";
    }

    const 后缀索引 = Math.floor(Math.random() * 后缀集合.length);
    const 后缀 = 后缀集合[后缀索引];

    生成个人信息(`${姓名}${后缀}`, 回复信息);

    const 需要添加时间 = Math.floor(Math.random() * (最大值 - 最小值 + 1) + 最小值) === 最大值;
    if (!分割回复时间复选框.checked) continue;
    if (!需要添加时间) continue;
    if (++发送时间使用计数 > 时间段数) continue;
    if (姓名集合.indexOf(姓名) === 姓名集合.length - 1) break;

    const 时间分区 = document.createElement("h6");
    时间分区.className = "时间区";
    当前日期 = new Date(当前日期.getTime() + Math.floor(Math.random() * (1800 - 180) + 180) * 1000);
    const 新小时 = 当前日期.getHours();
    const 新分钟 = 当前日期.getMinutes();
    const 新小时文本 = 新小时 < 10 ? `0${新小时}` : 新小时.toString();
    const 新分钟文本 = 新分钟 < 10 ? `0${新分钟}` : 新分钟.toString();
    时间分区.textContent = `${新小时文本}:${新分钟文本}`;
    对话生成区.appendChild(时间分区);
  }

  对话生成区.querySelectorAll(".个人区").item(0).classList.add("班主任区");
}

function 生成个人信息(name, info) {
  const 个人区 = document.createElement("div");
  个人区.className = "个人区";
  对话生成区.appendChild(个人区);

  const 头像区 = document.createElement("figure");
  头像区.className = "头像区";
  const 头像 = document.createElement("img");
  头像.className = "头像";
  const 头像号码 = Math.floor(Math.random() * 100 + 1);
  头像.src = `./Images/头像/${头像号码}.jpg`;
  头像.alt = "头像";
  头像区.appendChild(头像);

  const 姓名内容区 = document.createElement("div");
  姓名内容区.className = "姓名内容区";

  const 姓名区 = document.createElement("span");
  姓名区.className = "姓名区";

  姓名区.textContent = name;
  const 内容区 = document.createElement("内容区");
  内容区.className = "内容区";
  内容区.textContent = info;
  姓名内容区.append(姓名区, 内容区);

  个人区.append(头像区, 姓名内容区);
}

截图按钮.addEventListener("click", async () => {
  if (对话生成区.innerHTML === "") return;
  const png = await snapdom.toPng(对话生成区);
  png.className = "图像 截图图像";
  const 模态对话框 = document.createElement("dialog");
  模态对话框.className = "模态对话框 对话框 截图对话框";
  document.body.appendChild(模态对话框);
  模态对话框.showModal();

  const 截图容器 = document.createElement("div");
  截图容器.className = "截图容器";
  模态对话框.appendChild(截图容器);
  截图容器.appendChild(png);

  const 关闭按钮 = document.createElement("button");
  关闭按钮.className = "按钮";
  关闭按钮.id = "关闭截图对话框";
  关闭按钮.textContent = "✖";
  模态对话框.appendChild(关闭按钮);
  关闭按钮.addEventListener("click", () => {
    模态对话框.close();
    模态对话框.remove();
  });
});
