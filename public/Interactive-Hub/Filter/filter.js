const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
const 滤镜拇指宽度 = parseInt(rootStyle.getPropertyValue("--滤镜拇指宽度"), 10);
const 进度条颜色_已填充 = rootStyle.getPropertyValue("--进度条颜色-已填充");
const 展示区 = document.querySelector(".展示区");
const 图像区 = document.querySelector(".图像区");
const 原图容器 = 图像区.querySelector(".原图容器");
const 效果图容器 = 图像区.querySelector(".效果图容器");
const 效果图 = 效果图容器.querySelector(".图像");
const 投影图容器 = 图像区.querySelector(".投影图容器");
const 投影图 = 投影图容器.querySelector(".投影图");
const 效果图滑块 = document.getElementById("效果图滑块");
const 分割线 = document.querySelector(".分割线");
const 切换图像按钮 = document.getElementById("切换图像");
const 缩略图像组 = document.querySelectorAll(".图像序号项");
const 滤镜开关按钮 = document.getElementById("滤镜开关");
const 滤镜列表 = document.querySelector(".滤镜列表");
const 滤镜项组 = 滤镜列表.querySelectorAll(".滤镜项");
const 投影项 = 滤镜列表.querySelector(".投影项");
const 投影按钮组 = 投影项.querySelectorAll(".投影按钮");
const 投影滑块区组 = 投影项.querySelectorAll(".滑块区");
const 滤镜滑块组 = document.querySelectorAll(".滑块");
const 滤镜开关容器组 = document.querySelectorAll(".开关容器");
const 重置按钮组 = document.querySelectorAll(".重置");
const 全局重置按钮 = document.querySelector(".重置按钮");
let 缩略图已显示 = false;
let 滤镜列表已显示 = false;
let 滤镜效果组 = [];

图像区.addEventListener("click", () => {
  滤镜开关按钮.innerHTML = '<i class="fa-solid fa-eye"></i>';
  滤镜列表.style.removeProperty("clip-path");
  滤镜列表.style.removeProperty("pointer-events");
  分割线.style.removeProperty("opacity");
  效果图滑块.style.removeProperty("opacity");
  效果图滑块.style.removeProperty("pointer-events");
  滤镜列表已显示 = false;
});

效果图滑块.addEventListener("input", () => {
  效果图容器.style.clipPath = `inset(0 ${(1000 - 效果图滑块.value) / 10}% 0 0)`;
  分割线.style.left = `calc(${效果图滑块.value / 10}% - 2px)`;
  const 拇指宽度 = parseInt(
    rootStyle.getPropertyValue("--效果图滑块拇指宽度"),
    10,
  );
  const 拇指x偏移 = (效果图滑块.value - 500) * (拇指宽度 / 1000);
  root.style.setProperty("--效果图滑块拇指x修正", `${拇指x偏移}px`);
});

for (const 缩略图项 of 缩略图像组) {
  缩略图项.addEventListener("click", () => {
    const 原图 = 原图容器.querySelector(".图像");
    const 效果图 = 效果图容器.querySelector(".图像");
    const 缩略图 = 缩略图项.querySelector(".图像序号缩略图");
    原图.src = 缩略图.src;
    效果图.src = 缩略图.src;
  });
}

切换图像按钮.addEventListener("click", () => {
  缩略图已显示 = !缩略图已显示;
  if (缩略图已显示) {
    切换图像按钮.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    切换图像按钮.style.animation = "none";
  } else {
    切换图像按钮.innerHTML = '<i class="fa-regular fa-image"></i>';
    切换图像按钮.style.removeProperty("animation");
  }

  缩略图像组.forEach((缩略图项, index) => {
    if (缩略图已显示) {
      缩略图项.style.translate = `0 -${(50 + 10) * (index + 1)}px`;
      缩略图项.style.opacity = "1";
      缩略图项.style.pointerEvents = "all";
    } else {
      缩略图项.style.translate = `0 0`;
      缩略图项.style.opacity = "0";
      缩略图项.style.pointerEvents = "none";
    }
  });
});

滤镜开关按钮.addEventListener("click", () => {
  滤镜列表已显示 = !滤镜列表已显示;
  if (滤镜列表已显示) {
    滤镜开关按钮.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    滤镜列表.style.clipPath = "inset(0 0 0 0)";
    滤镜列表.style.pointerEvents = "all";
    分割线.style.opacity = "0";
    效果图滑块.style.opacity = "0";
    效果图滑块.style.pointerEvents = "none";
  } else {
    滤镜开关按钮.innerHTML = '<i class="fa-solid fa-eye"></i>';
    滤镜列表.style.removeProperty("clip-path");
    滤镜列表.style.removeProperty("pointer-events");
    分割线.style.removeProperty("opacity");
    效果图滑块.style.removeProperty("opacity");
    效果图滑块.style.removeProperty("pointer-events");
  }
});

滤镜滑块组.forEach((滤镜滑块, index) => {
  滤镜滑块.style.backgroundImage = `linear-gradient(90deg, ${进度条颜色_已填充} ${
    (滤镜滑块.value / 滤镜滑块.max) * 100
  }%, transparent ${(滤镜滑块.value / 滤镜滑块.max) * 100}%)`;
  const 滑块值 = 滤镜滑块.parentElement.querySelector(".滑块值");
  const 初始偏移 =
    (滤镜拇指宽度 / 滤镜滑块.max) * (滤镜滑块.value - 滤镜滑块.max / 2);
  root.style.setProperty(`--拇指偏移修正-${滤镜滑块.id}`, `${初始偏移}px`);
  const 最小值 = 滤镜滑块.parentElement.querySelector(".最小值");
  const 最大值 = 滤镜滑块.parentElement.querySelector(".最大值");
  最小值.textContent = `${滤镜滑块.min}`;
  最大值.textContent = `${滤镜滑块.max}`;
  滑块值.textContent = `${滤镜滑块.value}`;
  最小值.appendChild(生成后缀元素(滤镜滑块.id));
  最大值.appendChild(生成后缀元素(滤镜滑块.id));
  滑块值.appendChild(生成后缀元素(滤镜滑块.id));
  滤镜滑块.addEventListener("input", () => {
    const 偏移 =
      (滤镜拇指宽度 / 滤镜滑块.max) * (滤镜滑块.value - 滤镜滑块.max / 2);
    root.style.setProperty(`--拇指偏移修正-${滤镜滑块.id}`, `${偏移}px`);
    const 滑块背景色比例 = 滤镜滑块.value / 滤镜滑块.max;
    滤镜滑块.style.backgroundImage = `linear-gradient(90deg, ${进度条颜色_已填充} ${
      滑块背景色比例 * 100
    }%, transparent ${滑块背景色比例 * 100}%)`;
    滑块值.textContent = `${滤镜滑块.value}`;
    滑块值.appendChild(生成后缀元素(滤镜滑块.id));

    const 后缀 = 生成后缀文本(滤镜滑块.id);
    const 滤镜项 = 滤镜滑块.parentElement.parentElement;
    const 滤镜名称 = 滤镜项.querySelector(".英文标签").textContent;
    const 开关容器 = 滤镜项.querySelector(".开关容器");
    const 开关 = 开关容器.querySelector("input[type='checkbox']");
    if (开关.checked) {
      if (滤镜名称 === "drop-shadow") {
        投影图.style.filter = `${生成投影对象().滤镜名称}(${
          生成投影对象().滤镜值
        })`;
      } else {
        const 当前滤镜对象 = 滤镜效果组.find(
          (滤镜对象) => 滤镜对象.滤镜名称 === 滤镜名称,
        );
        当前滤镜对象.滤镜值 = `${滤镜滑块.value}${后缀}`;
      }
    }

    let 滤镜代码 = "";
    for (const 滤镜对象 of 滤镜效果组) {
      const 单滤镜代码 = `${滤镜对象.滤镜名称}(${滤镜对象.滤镜值}) `;
      滤镜代码 = 滤镜代码.concat(单滤镜代码);
    }
    滤镜代码 = `${滤镜代码.trimEnd()}`;
    效果图.style.filter = 滤镜代码;
  });
});

滤镜开关容器组.forEach((开关容器) => {
  const 开关 = 开关容器.querySelector("input[type='checkbox']");
  开关.addEventListener("input", () => {
    const 滤镜项 = 开关.parentElement.parentElement;
    const 滤镜名称 = 滤镜项.querySelector(".英文标签").textContent;
    const 滤镜滑块 = 滤镜项.querySelector(".滑块");
    // if (滤镜名称 === "drop-shadow") return;
    const 后缀 = 生成后缀文本(滤镜滑块.id);
    const 滤镜值 = `${滤镜滑块.value}${后缀}`;
    if (开关.checked) {
      if (滤镜名称 === "drop-shadow") {
        投影图容器.style.opacity = "1";
        投影图.style.filter = `${生成投影对象().滤镜名称}(${
          生成投影对象().滤镜值
        })`;
      } else {
        滤镜效果组.push({
          滤镜名称: 滤镜名称,
          滤镜值: 滤镜值,
        });
      }
    } else {
      if (滤镜名称 === "drop-shadow") {
        投影图容器.style.removeProperty("opacity");
        投影图.style.removeProperty("filter");
      } else {
        滤镜效果组 = 滤镜效果组.filter(
          (滤镜对象) => 滤镜对象.滤镜名称 !== 滤镜名称,
        );
      }
    }
    let 滤镜代码 = "";
    for (const 滤镜对象 of 滤镜效果组) {
      const 单滤镜代码 = `${滤镜对象.滤镜名称}(${滤镜对象.滤镜值}) `;
      滤镜代码 = 滤镜代码.concat(单滤镜代码);
    }
    滤镜代码 = `${滤镜代码.trimEnd()}`;
    效果图.style.filter = 滤镜代码;
  });
});

投影按钮组.forEach((投影按钮) => {
  投影按钮.addEventListener("click", () => {
    const 投影属性名称 = 投影按钮.innerText;
    for (const 按钮 of 投影按钮组) {
      按钮.style.visibility = "hidden";
    }
    const 投影滑块区 = 投影项.querySelector(
      `label[for="投影-${投影属性名称}"]`,
    );
    投影滑块区.style.visibility = "visible";
  });
});

投影滑块区组.forEach((投影滑块区) => {
  投影滑块区.addEventListener("mouseleave", () => {
    投影滑块区.style.removeProperty("visibility");
    for (const 按钮 of 投影按钮组) {
      按钮.style.removeProperty("visibility");
    }
  });

  const 投影滑块 = 投影滑块区.querySelector(".滑块");
  投影滑块.addEventListener("input", () => {
    //修改投影组内相关对象的值
  });
});

function 生成投影对象() {
  const 投影滑块_x偏移 = 投影项.querySelector("#投影-x偏移");
  const 投影滑块_y偏移 = 投影项.querySelector("#投影-y偏移");
  const 投影滑块_模糊 = 投影项.querySelector("#投影-模糊");
  const 投影代码 = `${投影滑块_x偏移.value}px ${投影滑块_y偏移.value}px ${投影滑块_模糊.value}px black`;
  return {
    滤镜名称: "drop-shadow",
    滤镜值: 投影代码,
  };
}

重置按钮组.forEach((重置按钮) => {
  const 滤镜项 = 重置按钮.parentElement;
  const 滤镜中文名称 = 滤镜项.querySelector(".中文标签").textContent;
  const 滤镜英文名称 = 滤镜项.querySelector(".英文标签").textContent;
  if (滤镜中文名称 === "投影") {
    重置按钮.addEventListener("click", () => {
      const 投影滑块组 = 滤镜项.querySelectorAll(".滑块");
      for (const 投影滑块 of 投影滑块组) {
        const 默认值 = parseInt(
          rootStyle.getPropertyValue(`--默认值-${投影滑块.id}`),
          10,
        );
        投影滑块.value = 默认值;
        const 滑块值 = 投影滑块.parentElement.querySelector(".滑块值");
        滑块值.textContent = `${默认值}`;
        滑块值.appendChild(生成后缀元素(投影滑块.id));
        投影滑块.style.backgroundImage = `linear-gradient(90deg, ${进度条颜色_已填充} ${
          (投影滑块.value / 投影滑块.max) * 100
        }%, transparent ${(投影滑块.value / 投影滑块.max) * 100}%)`;
        const 初始偏移 =
          (滤镜拇指宽度 / 投影滑块.max) * (投影滑块.value - 投影滑块.max / 2);
        root.style.setProperty(
          `--拇指偏移修正-${投影滑块.id}`,
          `${初始偏移}px`,
        );
      }

      const 投影开关 = 投影项.querySelector("#投影开关");
      if (投影开关.checked) {
        投影图.style.filter = `${生成投影对象().滤镜名称}(${
          生成投影对象().滤镜值
        })`;
      }
    });
  } else {
    重置按钮.addEventListener("click", () => {
      const 滑块值 = 滤镜项.querySelector(".滑块值");
      const 滤镜滑块 = 滤镜项.querySelector(".滑块");
      const 开关容器 = 滤镜项.querySelector(".开关容器");
      const 开关 = 开关容器.querySelector("input[type='checkbox']");
      const 默认值 = parseInt(
        rootStyle.getPropertyValue(`--默认值-${滤镜中文名称}`),
        10,
      );
      滤镜滑块.value = 默认值;
      滑块值.textContent = `${默认值}`;
      滑块值.appendChild(生成后缀元素(滤镜滑块.id));
      滤镜滑块.style.backgroundImage = `linear-gradient(90deg, ${进度条颜色_已填充} ${
        (滤镜滑块.value / 滤镜滑块.max) * 100
      }%, transparent ${(滤镜滑块.value / 滤镜滑块.max) * 100}%)`;

      const 初始偏移 =
        (滤镜拇指宽度 / 滤镜滑块.max) * (滤镜滑块.value - 滤镜滑块.max / 2);
      root.style.setProperty(`--拇指偏移修正-${滤镜滑块.id}`, `${初始偏移}px`);

      const 后缀 = 生成后缀文本(滤镜滑块.id);
      if (开关.checked) {
        const 当前滤镜对象 = 滤镜效果组.find(
          (滤镜对象) => 滤镜对象.滤镜名称 === 滤镜英文名称,
        );
        当前滤镜对象.滤镜值 = `${滤镜滑块.value}${后缀}`;
      }

      let 滤镜代码 = "";
      for (const 滤镜对象 of 滤镜效果组) {
        const 单滤镜代码 = `${滤镜对象.滤镜名称}(${滤镜对象.滤镜值}) `;
        滤镜代码 = 滤镜代码.concat(单滤镜代码);
      }
      滤镜代码 = `${滤镜代码.trimEnd()}`;
      效果图.style.filter = 滤镜代码;
    });
  }
});

全局重置按钮.addEventListener("click", () => {
  重置按钮组.forEach((重置按钮) => {
    const 滤镜项 = 重置按钮.parentElement;
    const 滤镜中文名称 = 滤镜项.querySelector(".中文标签").textContent;
    重置滑块区属性();
    const 开关容器 = 滤镜项.querySelector(".开关容器");
    const 开关 = 开关容器.querySelector("input[type='checkbox']");
    开关.checked = false;

    滤镜效果组.length = 0;
    效果图.style.removeProperty("filter");

    投影图容器.style.removeProperty("opacity");
  });
});

function 重置滑块区属性() {
  for (const 滤镜项 of 滤镜项组) {
    const 滑块值 = 滤镜项.querySelector(".滑块值");
    const 滤镜滑块 = 滤镜项.querySelector(".滑块");
    const 滤镜中文名称 = 滤镜项.querySelector(".中文标签").textContent;
    if (滤镜中文名称 === "投影") {
      for (const 投影滑块区 of 投影滑块区组) {
        const 投影滑块 = 投影滑块区.querySelector(".滑块");
        const 默认值 = parseInt(
          rootStyle.getPropertyValue(`--默认值-${投影滑块.id}`),
          10,
        );
        投影滑块.value = 默认值;
        const 投影滑块值文本 = 投影滑块区.querySelector(".滑块值");
        投影滑块值文本.textContent = `${默认值}`;
        投影滑块值文本.appendChild(生成后缀元素(投影滑块.id));
        投影滑块.style.backgroundImage = `linear-gradient(90deg, ${进度条颜色_已填充} ${
          (投影滑块.value / 投影滑块.max) * 100
        }%, transparent ${(投影滑块.value / 投影滑块.max) * 100}%)`;
        const 初始偏移 =
          (滤镜拇指宽度 / 投影滑块.max) * (投影滑块.value - 投影滑块.max / 2);
        root.style.setProperty(
          `--拇指偏移修正-${投影滑块.id}`,
          `${初始偏移}px`,
        );
      }
    } else {
      const 默认值 = parseInt(
        rootStyle.getPropertyValue(`--默认值-${滤镜中文名称}`),
        10,
      );
      滤镜滑块.value = 默认值;
      滑块值.textContent = `${默认值}`;
      滑块值.appendChild(生成后缀元素(滤镜滑块.id));
      滤镜滑块.style.backgroundImage = `linear-gradient(90deg, ${进度条颜色_已填充} ${
        (滤镜滑块.value / 滤镜滑块.max) * 100
      }%, transparent ${(滤镜滑块.value / 滤镜滑块.max) * 100}%)`;
      const 初始偏移 =
        (滤镜拇指宽度 / 滤镜滑块.max) * (滤镜滑块.value - 滤镜滑块.max / 2);
      root.style.setProperty(`--拇指偏移修正-${滤镜滑块.id}`, `${初始偏移}px`);
    }
  }
}

function 生成后缀元素(滑块id) {
  const 后缀 = document.createElement("span");
  后缀.className = "后缀";
  后缀.innerHTML = "%";
  if (滑块id === "色相" || 滑块id === "投影-颜色") {
    后缀.innerHTML = "deg";
  } else if (滑块id === "模糊" || 滑块id.includes("投影")) {
    后缀.innerHTML = "px";
  }
  return 后缀;
}

function 生成后缀文本(滑块id) {
  let 后缀 = "%";
  if (滑块id === "模糊") {
    后缀 = "px";
  } else if (滑块id === "色相") {
    后缀 = "deg";
  }
  return 后缀;
}
