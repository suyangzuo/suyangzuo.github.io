const root = document.querySelector(":root");
const rootStyle = window.getComputedStyle(root);
// const 球直径 = rootStyle.getPropertyValue("--球直径");
// const 动画名称初始值 = rootStyle.getPropertyValue("--动画名称");
const 动画区 = document.querySelector(".动画区");
const 调用区 = document.querySelector(".调用区");
const 调用区滑块组 = 调用区.querySelectorAll("input[type='range']");
const 动画名称文本框 = 调用区.querySelector("#动画名称");
const 动画持续时间滑块 = 调用区.querySelector("#动画持续时间");
const 动画时间函数单选框组 = 调用区.querySelectorAll(
  "input[name='动画时间函数']",
);
const 动画延迟滑块 = 调用区.querySelector("#动画延迟");
const 无限动画迭代单选框 = 调用区.querySelector("#动画迭代计数-无限");
const 动画迭代计数滑块 = 调用区.querySelector("#动画迭代计数");
const 动画方向单选框组 = 调用区.querySelectorAll("input[name='动画方向']");
const 动画填充模式单选框组 = 调用区.querySelectorAll(
  "input[name='动画填充模式']",
);
const 动画播放状态单选框组 = 调用区.querySelectorAll(
  "input[name='动画播放状态']",
);

const 代码区 = document.querySelector(".代码区");
const 速写代码区 = 代码区.querySelector(".速写代码区");

const 定义区 = document.querySelector(".定义区");

for (const 调用区滑块 of 调用区滑块组) {
  调用区滑块.addEventListener("input", () => {
    const 滑块值 = parseInt(调用区滑块.value, 10);
    const 滑块百分比 =
      ((调用区滑块.value - 调用区滑块.min) /
        (调用区滑块.max - 调用区滑块.min)) *
      100;
    root.style.setProperty(`--${调用区滑块.id}渐变位置`, `${滑块百分比}%`);
    const 参数值数字 =
      调用区滑块.nextElementSibling.querySelector(".参数值数字");
    参数值数字.textContent = 调用区滑块.value;
  });
}

动画名称文本框.addEventListener("input", () => {
  /*root.style.setProperty(
    "--动画名称",
    动画名称文本框.value.trim() === ""
      ? 动画名称初始值
      : 动画名称文本框.value.trim(),
  );*/

  const 速写动画名称 = 速写代码区.querySelector(".名称代码");
  速写动画名称.textContent = 动画名称文本框.value.trim();
});

const 关键帧1 = {
  top: 0,
  left: 0,
  width: "var(--球直径)",
  height: "var(--球直径)",
  rotate: "z 0deg",
  opacity: 1,
  offset: 0,
};

const 关键帧2 = {
  top: "calc(100% - calc(var(--球直径) * 3))",
  left: "calc((100% - var(--球直径)) / 5)",
  width: "calc(var(--球直径) * 3)",
  height: "calc(var(--球直径) * 3)",
  rotate: "z 360deg",
  opacity: 1,
  offset: 0.2,
};

const 关键帧3 = {
  top: 0,
  left: "calc((100% - var(--球直径)) / 5 * 2)",
  width: "var(--球直径)",
  height: "var(--球直径)",
  rotate: "z 0deg",
  opacity: 1,
  offset: 0.4,
};

const 关键帧4 = {
  top: "calc(100% - calc(var(--球直径) * 3))",
  left: "calc((100% - var(--球直径)) / 5 * 3)",
  width: "calc(var(--球直径) * 3)",
  height: "calc(var(--球直径) * 3)",
  rotate: "z 360deg",
  opacity: 1,
  offset: 0.6,
};

const 关键帧5 = {
  top: 0,
  left: "calc((100% - var(--球直径)) / 5 * 4)",
  width: "var(--球直径)",
  height: "var(--球直径)",
  rotate: "z 0deg",
  opacity: 1,
  offset: 0.8,
};

const 关键帧6 = {
  top: "calc(100% - calc(var(--球直径) * 3))",
  left: "calc(100% - calc(var(--球直径) * 3))",
  width: "calc(var(--球直径) * 3)",
  height: "calc(var(--球直径) * 3)",
  rotate: "z 360deg",
  opacity: 1,
  offset: 1,
};

const 动画选项 = {
  duration: 0,
  easing: "ease",
  delay: 0,
  iterations: 1,
  direction: "normal",
  fill: "none",
};

let 动画 = null;
const 关键帧池 = [关键帧1, 关键帧2, 关键帧3, 关键帧4, 关键帧5, 关键帧6];
const 关键帧序列 = [关键帧1, 关键帧2, 关键帧3, 关键帧4, 关键帧5, 关键帧6];

function 生成关键帧及动画选项() {
  const 已确认关键帧复选框组 =
    关键帧区.querySelectorAll(".关键帧复选框:checked");
}

const 刷新动画按钮 = 动画区.querySelector("#刷新动画");
刷新动画按钮.addEventListener("click", 刷新动画);

const 警告色 = "brown";
const 名称不符关键帧序列 = [
  { outline: `solid 2px ${警告色}`, backgroundColor: 警告色 },
  { outline: "solid 2px transparent", backgroundColor: "#222" },
  { outline: `solid 2px ${警告色}`, backgroundColor: 警告色 },
  { outline: "solid 2px transparent", backgroundColor: "#222" },
  { outline: `solid 2px ${警告色}`, backgroundColor: 警告色 },
  { outline: "solid 2px #def3", backgroundColor: "#222" },
];

const 名称不符动画选项 = {
  duration: 1250,
};

let 关键帧标识符文本框动画 = null;
let 动画名称动画 = null;

function 刷新动画() {
  const 球 = 动画区.querySelector(".球");
  动画?.cancel();
  动画 = 球.animate(关键帧序列, 动画选项);

  const 关键帧序列标识符文本框 = document.querySelector("#关键帧序列标识符");
  const 动画名称文本框 = document.querySelector("#动画名称");
  const 关键帧序列标识符 = 关键帧序列标识符文本框.value.trim();
  const 动画名称 = 动画名称文本框.value.trim();

  if (动画播放状态单选框组[0].checked && 关键帧序列标识符 === 动画名称) {
    动画.play();
  } else {
    动画.pause();
    关键帧标识符文本框动画?.cancel();
    动画名称动画?.cancel();
    关键帧标识符文本框动画 = 关键帧序列标识符文本框.animate(
      名称不符关键帧序列,
      名称不符动画选项,
    );
    动画名称动画 = 动画名称文本框.animate(名称不符关键帧序列, 名称不符动画选项);
  }
  // 球.classList.remove("球动画");
  // void 球.offsetTop;
  // 球.classList.add("球动画");
}

let 最后确认索引 = 关键帧序列.length - 1;
const 关键帧区 = 定义区.querySelector(".关键帧区");
const 关键帧属性区 = 定义区.querySelector(".关键帧属性区");
const 动画属性分区组 = 关键帧属性区.querySelectorAll(".关键帧属性分区");
const 关键帧复选框组 = 关键帧区.querySelectorAll(".关键帧复选框");
const 关键帧时间点文本框组 = 关键帧区.querySelectorAll(".关键帧时间点");
for (const [索引, 关键帧复选框] of 关键帧复选框组.entries()) {
  if (索引 < 2) {
    关键帧复选框.addEventListener("input", (e) => {
      关键帧复选框.checked = true;
    });
  } else {
    关键帧复选框.addEventListener("input", () => {
      if (!关键帧复选框.checked) {
        let 后一关键帧分区 = 关键帧复选框.parentElement.nextElementSibling;
        while (后一关键帧分区) {
          const 后一关键帧复选框 =
            后一关键帧分区.querySelector(".关键帧复选框");
          后一关键帧复选框.checked = false;
          后一关键帧分区 = 后一关键帧分区.nextElementSibling;
        }
      }
    });
  }

  关键帧复选框.addEventListener("input", () => {
    if (关键帧复选框.checked) {
      if (索引 > 1) {
        关键帧序列.push(关键帧池[索引]);
        最后确认索引++;
      }
    } else {
      while (索引 <= 最后确认索引) {
        关键帧序列.pop();
        最后确认索引--;
      }
    }
  });
}

for (const [索引, 关键帧时间点文本框] of 关键帧时间点文本框组.entries()) {
  关键帧时间点文本框.addEventListener("input", () => {
    if (!关键帧时间点文本框.value.trim()) {
      return;
    }

    const 百分比数字 = parseInt(关键帧时间点文本框.value.trim(), 10);
    关键帧序列[索引].offset = 百分比数字 / 100;
  });
}

动画持续时间滑块.addEventListener("input", () => {
  动画选项.duration = parseInt(动画持续时间滑块.value, 10) * 1000;
  // root.style.setProperty("--动画持续时间", `${动画持续时间滑块.value}s`);

  const 速写动画持续时间 = 速写代码区.querySelector(".持续时间代码");
  速写动画持续时间.textContent = `${动画持续时间滑块.value}s`;
});

动画时间函数单选框组.forEach((单选框) => {
  单选框.addEventListener("change", () => {
    动画选项.easing = 单选框.getAttribute("parameter");
    // root.style.setProperty(`--动画时间函数`, 单选框.getAttribute("parameter"));
    const 速写动画时间函数 = 速写代码区.querySelector(".时间函数代码");
    速写动画时间函数.textContent = 单选框.getAttribute("parameter");
  });
});

动画迭代计数滑块.addEventListener("input", () => {
  无限动画迭代单选框.checked = false;
  动画迭代计数滑块.classList.remove("无效");
  const 参数值 = 动画迭代计数滑块.nextElementSibling;
  参数值.classList.remove("无效");

  动画选项.iterations = parseInt(动画迭代计数滑块.value, 10);

  // root.style.setProperty("--动画迭代计数", 动画迭代计数滑块.value);

  const 速写动画迭代计数 = 速写代码区.querySelector(".迭代计数代码");
  速写动画迭代计数.textContent = 无限动画迭代单选框.checked
    ? "infinite"
    : 动画迭代计数滑块.value;
});

无限动画迭代单选框.addEventListener("change", () => {
  动画选项.iterations = Infinity;

  /*root.style.setProperty(
    "--动画迭代计数",
    无限动画迭代单选框.checked ? "infinite" : 动画迭代计数滑块.value,
  );*/

  const 速写动画迭代计数 = 速写代码区.querySelector(".迭代计数代码");
  速写动画迭代计数.textContent = 无限动画迭代单选框.checked
    ? "infinite"
    : 动画迭代计数滑块.value;

  if (无限动画迭代单选框.checked) {
    动画迭代计数滑块.classList.add("无效");
    const 参数值 = 动画迭代计数滑块.nextElementSibling;
    参数值.classList.add("无效");
  }
});

动画延迟滑块.addEventListener("input", () => {
  动画选项.delay = parseInt(动画延迟滑块.value, 10) * 1000;
  // root.style.setProperty("--动画延迟", `${动画延迟滑块.value}s`);

  const 速写动画延迟 = 速写代码区.querySelector(".延迟代码");
  速写动画延迟.textContent = `${动画延迟滑块.value}s`;
});

动画方向单选框组.forEach((单选框) => {
  单选框.addEventListener("change", () => {
    动画选项.direction = 单选框.getAttribute("parameter");
    // root.style.setProperty("--动画方向", 单选框.getAttribute("parameter"));

    const 速写动画方向 = 速写代码区.querySelector(".方向代码");
    速写动画方向.textContent = 单选框.getAttribute("parameter");
  });
});

动画填充模式单选框组.forEach((单选框) => {
  单选框.addEventListener("change", () => {
    动画选项.fill = 单选框.getAttribute("parameter");
    // root.style.setProperty("--动画填充模式", 单选框.getAttribute("parameter"));

    const 速写动画填充模式 = 速写代码区.querySelector(".速写动画填充模式");
    const 填充模式代码 = 速写动画填充模式.querySelector(".填充模式代码");
    填充模式代码.textContent = 单选框.getAttribute("parameter");
  });
});

动画播放状态单选框组.forEach((单选框) => {
  单选框.addEventListener("change", () => {
    if (单选框.getAttribute("parameter") === "running") {
      动画.play();
    } else {
      动画.pause();
    }
    // root.style.setProperty("--动画播放状态", 单选框.getAttribute("parameter"));
  });
});

const 文本框组 = document.querySelectorAll("input[type='text']");
for (const 文本框 of 文本框组) {
  文本框.addEventListener("dblclick", () => {
    if (文本框.value.trim()) {
      文本框.select();
    }
  });
}
