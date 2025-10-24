class 随心绘 {
  constructor() {
    this.canvas = document.getElementById("画布");
    this.基础形状分区组 = document.getElementsByClassName("基础形状分区");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.画布边界矩形 = this.canvas.getBoundingClientRect();
    window.addEventListener("resize", () => {
      this.画布边界矩形 = this.canvas.getBoundingClientRect();
      this.canvas.width = this.canvas.offsetWidth * this.dpr;
      this.canvas.height = this.canvas.offsetHeight * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);
      this.绘制基础形状对象组();
    });
    document.addEventListener("scroll", () => {
      this.画布边界矩形 = this.canvas.getBoundingClientRect();
    });

    this.本地存储池 = {
      按钮音效:
        JSON.parse(localStorage.getItem("随心绘存储池")) === null
          ? true
          : JSON.parse(localStorage.getItem("随心绘存储池")).按钮音效,
      辅助视觉效果:
        JSON.parse(localStorage.getItem("随心绘存储池")) === null
          ? true
          : JSON.parse(localStorage.getItem("随心绘存储池")).辅助视觉效果,
      描边色:
        localStorage.getItem("随心绘存储池") === null
          ? "rgba(128, 128, 128, 1)"
          : JSON.parse(localStorage.getItem("随心绘存储池")).描边色,
      填充色:
        localStorage.getItem("随心绘存储池") === null
          ? "transparent"
          : JSON.parse(localStorage.getItem("随心绘存储池")).填充色,
      描边宽度:
        localStorage.getItem("随心绘存储池") === null
          ? 2
          : Number(JSON.parse(localStorage.getItem("随心绘存储池")).描边宽度),
    };

    this.辅助 = {
      视觉效果复选框: document.getElementById("辅助视觉效果"),
      按钮音效复选框: document.getElementById("按钮音效"),
      点击音效对象: new Audio("/Audios/Click.mp3"),
      清空音效: new Audio("/Audios/Clear.mp3"),
    };

    this.辅助.视觉效果复选框.checked = this.本地存储池.辅助视觉效果;
    this.辅助.按钮音效复选框.checked = this.本地存储池.按钮音效;

    this.图层处理按钮组 = {
      向上一层: document.getElementById("向上一层"),
      向下一层: document.getElementById("向下一层"),
      置于顶层: document.getElementById("置于顶层"),
      置于底层: document.getElementById("置于底层"),
    };

    this.撤销按钮 = document.getElementById("撤销");
    this.删除按钮 = document.getElementById("删除");

    this.变换按钮组 = {
      水平翻转: document.getElementById("水平翻转"),
      垂直翻转: document.getElementById("垂直翻转"),
      顺时针旋转: document.getElementById("顺时针旋转"),
      逆时针旋转: document.getElementById("逆时针旋转"),
    };

    this.图形组合按钮组 = {
      交集: document.getElementById("交集"),
      并集: document.getElementById("并集"),
      差集: document.getElementById("差集"),
      复制: document.getElementById("复制"),
    };

    this.基础形状单选框组 = {
      矩形: document.getElementById("矩形"),
      圆: document.getElementById("圆"),
      多边形: document.getElementById("多边形"),
      多角星: document.getElementById("多角星"),
      直线: document.getElementById("直线"),
      自由: document.getElementById("自由"),
      选择路径: document.getElementById("选择路径"),
      图像: document.getElementById("图像"),
      文本: document.getElementById("文本"),
      当前基础形状单选框: null,
    };

    this.操作说明 = {
      矩形: ["按住 Shift 绘制正方形", "按 ↑ 或 ↓ 调整圆角"],
      圆: ["按住 Shift 绘制正圆", "按 ← 或 → 精细调整旋转弧度", "按 ↑ 或 ↓ 快速调整旋转弧度"],
      多边形: ["按 ↑ 或 ↓ 调整边数", "按 ← 或 → 精细调整起始弧度", "按住 Shift 同时按 ← 或 → 快速调整起始弧度"],
      多角星: [
        "按 ↑ 或 ↓ 调整角数",
        "按 ← 或 → 精细调整起始弧度",
        "按住 Shift 同时按 ← 或 → 快速调整起始弧度",
        "按 [ 或 ] 调整内半径",
      ],
      直线: ["按 Enter 确认", "按 ESC 取消"],
      缩放与旋转: ["按住 Shift 等比缩放", "按住 Alt 围绕中心缩放", "鼠标位于句柄时按住 Ctrl 旋转"],
    };

    this.交互框 = null;

    this.全局标志 = {
      左键已按下: false,
      拖拽中: false,
      旋转中: false,
      缩放中: false,
      绘制选框中: false,
      多边形边数可增减: true,
      多边形可旋转: true,
      手动调整内半径: false,
      辅助视觉效果: this.辅助.视觉效果复选框.checked,
      按钮音效: this.辅助.按钮音效复选框.checked,
      Alt拖拽复制中: false,
    };

    this.全局属性 = {
      已选中基础形状: null,
      填充色: this.本地存储池.填充色,
      描边色: this.本地存储池.描边色,
      辅助外框描边色: "#aaccee12",
      辅助线段描边色: "#a81",
      选框描边色: "#aaa",
      选框描边宽度: 1,
      描边宽度: this.本地存储池.描边宽度,
      悬停描边色: "darkgoldenrod",
      图像初始最大宽度: this.canvas.offsetWidth / 4,
      图像初始最大高度: this.canvas.offsetHeight / 4,
      悬停描边宽度: 4,
      多边形边数: 5,
      鼠标坐标: null,
      点击坐标: null,
      初始坐标组: [],
      偏移量: null,
      左键按下时间: null,
      拖拽时间: null,
      鼠标与点击坐标位置关系: {
        上: null,
        左: null,
      },
      悬停形状: null,
      选中形状: null,
      缩放模式: null, // 'free', 'proportional', 'horizontal', 'vertical'
      用户全局描边色: null, // 保存用户设置的全局描边色（非选中形状时）
      用户全局填充色: null, // 保存用户设置的全局填充色（非选中形状时）
      复制预览形状: null, // Alt+拖拽复制时的预览形状
      复制源形状: null, // 正在被复制的源形状
    };

    this.当前形状对象 = {
      形状: null,
      坐标: { x: null, y: null },
      顶点坐标组: [],
      外顶点坐标组: [],
      内顶点坐标组: [],
      尺寸: null,
      圆角: 0,
      描边色: "transparent",
      填充色: "transparent",
      描边宽度: 2,
      路径: null,
      已选中: false,
      已悬停: false,
      极值坐标: null,
      按下时坐标: null,
      按下时顶点坐标组: null,
    };

    this.数据集 = {
      操作记录: [],
      基础形状对象组: [],
      框选形状对象: null, // 用于选框工具选中的多个形状
    };

    this.键盘状态 = {
      Shift: false,
      Control: false,
      Alt: false,
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      Enter: false,
      Escape: false,
      Delete: false,
      "[": false,
      "]": false,
      z: false,
      r: false,
      c: false,
      q: false,
      w: false,
      e: false,
      b: false,
      a: false,
      t: false,
      g: false,
    };

    this.快捷键映射 = {
      r: "矩形",
      c: "圆",
      q: "多边形",
      w: "多角星",
      e: "直线",
      b: "自由",
      a: "选择路径",
      t: "文本",
      g: "组合",
    };

    this.添加颜色拾取器();
    this.添加颜色拾取器事件();
    this.添加描边宽度滑块事件();
    this.添加清空画布按钮点击事件();
    this.添加撤销按钮点击事件();
    this.添加删除按钮点击事件();
    this.添加变换按钮点击事件();
    this.添加复制按钮点击事件();
    this.处理辅助效果选项();
    this.添加键盘事件();
    this.添加canvas按下左键事件();
    this.添加canvas鼠标抬起事件();
    this.添加canvas鼠标移动事件();
    this.添加基础形状分区点击事件();
    this.添加修改形状图层按钮点击事件();
    this.添加图像上传事件();
  }

  禁用所有图形控制按钮() {
    this.图层处理按钮组.向上一层.parentElement.classList.add("禁用");
    this.图层处理按钮组.向下一层.parentElement.classList.add("禁用");
    this.图层处理按钮组.置于底层.parentElement.classList.add("禁用");
    this.图层处理按钮组.置于顶层.parentElement.classList.add("禁用");
    this.变换按钮组.水平翻转.parentElement.classList.add("禁用");
    this.变换按钮组.垂直翻转.parentElement.classList.add("禁用");
    this.变换按钮组.顺时针旋转.parentElement.classList.add("禁用");
    this.变换按钮组.逆时针旋转.parentElement.classList.add("禁用");
    /* this.图形组合按钮组.交集.parentElement.classList.add("禁用");
    this.图形组合按钮组.并集.parentElement.classList.add("禁用");
    this.图形组合按钮组.差集.parentElement.classList.add("禁用"); */
    this.图形组合按钮组.复制.parentElement.classList.add("禁用");
  }

  启用所有图形控制按钮() {
    this.图层处理按钮组.向上一层.parentElement.classList.remove("禁用");
    this.图层处理按钮组.向下一层.parentElement.classList.remove("禁用");
    this.图层处理按钮组.置于底层.parentElement.classList.remove("禁用");
    this.图层处理按钮组.置于顶层.parentElement.classList.remove("禁用");
    this.变换按钮组.水平翻转.parentElement.classList.remove("禁用");
    this.变换按钮组.垂直翻转.parentElement.classList.remove("禁用");
    this.变换按钮组.顺时针旋转.parentElement.classList.remove("禁用");
    this.变换按钮组.逆时针旋转.parentElement.classList.remove("禁用");
    /* this.图形组合按钮组.交集.parentElement.classList.remove("禁用");
    this.图形组合按钮组.并集.parentElement.classList.remove("禁用");
    this.图形组合按钮组.差集.parentElement.classList.remove("禁用"); */
    this.图形组合按钮组.复制.parentElement.classList.remove("禁用");
  }

  添加图像上传事件() {
    this.基础形状单选框组.图像.addEventListener("change", async () => {
      const 文件组 = this.基础形状单选框组.图像.files;
      if (文件组.length <= 0) return;

      // 先加载所有图像并计算尺寸
      const 图像信息组 = [];
      const 失败文件组 = [];
      for (const 文件 of 文件组) {
        try {
          const 数据Url = await this.获取图像Url(文件);
          const 图像对象 = await this.加载图像(数据Url);

          let 宽 = 图像对象.naturalWidth;
          let 高 = 图像对象.naturalHeight;
          const 宽高比 = 宽 / 高;
          if (宽高比 >= 1) {
            宽 = this.全局属性.图像初始最大宽度;
            高 = 宽 / 宽高比;
          } else {
            高 = this.全局属性.图像初始最大高度;
            宽 = 高 * 宽高比;
          }

          图像信息组.push({
            图像对象: 图像对象,
            宽: 宽,
            高: 高,
          });
        } catch (error) {
          // 记录加载失败的文件
          失败文件组.push(文件.name);
          console.error(`图像加载失败: ${文件.name}`, error);
        }
      }

      // 如果所有文件都加载失败，显示错误提示并返回
      if (图像信息组.length === 0) {
        alert(
          `所有图像加载失败！\n\n失败的文件：\n${失败文件组.join(
            "\n"
          )}\n\n可能原因：\n- 浏览器不支持该图像格式（如 .tif、.bmp 等）\n- 文件已损坏\n\n建议：请使用常见的图像格式（.jpg、.png、.gif、.webp 等）`
        );
        this.基础形状单选框组.图像.value = "";
        return;
      }

      // 如果部分文件加载失败，显示警告
      if (失败文件组.length > 0) {
        alert(`部分图像加载失败：\n${失败文件组.join("\n")}\n\n其他图像将正常加载。`);
      }

      // 计算布局：智能多行布局，支持自动换行
      const 图像间距 = 20; // 图像之间的间距
      const 行间距 = 20; // 行之间的间距
      const canvasWidth = this.canvas.offsetWidth;
      const canvasHeight = this.canvas.offsetHeight;
      const canvas中心X = canvasWidth / 2;
      const canvas中心Y = canvasHeight / 2;

      // 将图像分配到多行（贪心算法：尽可能填满每一行）
      const 行数组 = [];
      let 当前行 = [];
      let 当前行宽度 = 0;

      for (const 图像信息 of 图像信息组) {
        const 图像宽度 = 图像信息.宽;
        const 需要的宽度 = 当前行宽度 + (当前行.length > 0 ? 图像间距 : 0) + 图像宽度;

        if (需要的宽度 <= canvasWidth || 当前行.length === 0) {
          // 可以放入当前行
          当前行.push(图像信息);
          当前行宽度 = 需要的宽度;
        } else {
          // 当前行已满，开始新行
          行数组.push(当前行);
          当前行 = [图像信息];
          当前行宽度 = 图像宽度;
        }
      }
      // 添加最后一行
      if (当前行.length > 0) {
        行数组.push(当前行);
      }

      // 计算每行的信息（宽度和高度）
      const 行信息组 = 行数组.map((行) => {
        let 行宽度 = 0;
        let 行最大高度 = 0;

        for (let i = 0; i < 行.length; i++) {
          行宽度 += 行[i].宽;
          if (i < 行.length - 1) {
            行宽度 += 图像间距;
          }
          if (行[i].高 > 行最大高度) {
            行最大高度 = 行[i].高;
          }
        }

        return {
          图像组: 行,
          宽度: 行宽度,
          高度: 行最大高度,
        };
      });

      // 计算所有行的总高度
      let 总高度 = 0;
      for (let i = 0; i < 行信息组.length; i++) {
        总高度 += 行信息组[i].高度;
        if (i < 行信息组.length - 1) {
          总高度 += 行间距;
        }
      }

      // 计算起始Y坐标，使所有行整体垂直居中
      let 当前Y = canvas中心Y - 总高度 / 2;

      // 创建图像形状对象
      const 新添加的图像对象组 = [];

      // 遍历每一行
      for (const 行信息 of 行信息组) {
        // 计算这一行的起始X坐标，使这一行水平居中
        let 当前X = canvas中心X - 行信息.宽度 / 2;

        // 遍历这一行的每个图像
        for (const 图像信息 of 行信息.图像组) {
          const 左上角X = 当前X;
          const 左上角Y = 当前Y;
          const 宽 = 图像信息.宽;
          const 高 = 图像信息.高;

          // 创建顶点坐标组（矩形四个角：左上、右上、右下、左下）
          const 顶点坐标组 = [
            { x: 左上角X, y: 左上角Y },
            { x: 左上角X + 宽, y: 左上角Y },
            { x: 左上角X + 宽, y: 左上角Y + 高 },
            { x: 左上角X, y: 左上角Y + 高 },
          ];

          // 计算中心坐标
          const 中心 = {
            x: 左上角X + 宽 / 2,
            y: 左上角Y + 高 / 2,
          };

          // 创建图像形状对象
          const 图像形状对象 = {
            形状: "图像",
            图像对象: 图像信息.图像对象,
            坐标: { x: 左上角X, y: 左上角Y }, // 左上角坐标
            极值坐标: null, // 将通过获取极值坐标函数自动计算
            中心: 中心,
            尺寸: {
              宽: 宽,
              高: 高,
            },
            旋转弧度: 0, // 初始旋转角度
            已选中: false,
            已悬停: false,
            顶点坐标组: 顶点坐标组,
            按下时坐标: null,
            按下时顶点坐标组: null,
            描边色: this.全局属性.描边色,
            填充色: this.全局属性.填充色,
            描边宽度: 0, // 图像默认无描边
            路径: null,
          };

          // 自动计算极值坐标和中心
          图像形状对象.极值坐标 = this.获取极值坐标(图像形状对象);
          图像形状对象.中心 = 图像形状对象.极值坐标.中心;

          // 创建并更新Path2D路径
          this.更新路径(图像形状对象);

          // 添加到基础形状对象组
          this.数据集.基础形状对象组.push(图像形状对象);

          // 记录新添加的图像对象（用于撤销）
          新添加的图像对象组.push(图像形状对象);

          // 更新当前X坐标，为下一张图像做准备
          当前X += 宽 + 图像间距;
        }

        // 更新当前Y坐标，为下一行做准备
        当前Y += 行信息.高度 + 行间距;
      }

      // 记录操作，支持撤销
      if (新添加的图像对象组.length > 0) {
        // 保存图像对象的快照（不能使用structuredClone，图像对象需保持引用）
        const 图像对象快照组 = 新添加的图像对象组.map((obj) => {
          // 创建快照，但图像对象保持引用
          const 快照 = {
            形状: obj.形状,
            图像对象: obj.图像对象, // 图像对象保持引用
            坐标: { ...obj.坐标 },
            中心: { ...obj.中心 },
            尺寸: {
              宽: obj.尺寸.宽,
              高: obj.尺寸.高,
            },
            旋转弧度: obj.旋转弧度,
            已选中: obj.已选中,
            已悬停: obj.已悬停,
            顶点坐标组: obj.顶点坐标组.map((v) => ({ ...v })),
            描边色: obj.描边色,
            填充色: obj.填充色,
            描边宽度: obj.描边宽度,
          };
          return 快照;
        });

        this.数据集.操作记录.push({
          操作类型: "添加图像",
          图像对象组: 新添加的图像对象组.map((obj, index) => ({
            索引: this.数据集.基础形状对象组.indexOf(obj),
            对象快照: 图像对象快照组[index],
          })),
        });

        this.撤销按钮.classList.remove("禁用");
      }

      // 重新绘制画布
      this.清空画布();
      this.绘制基础形状对象组();

      // 重置文件选择器，允许再次选择相同文件
      this.基础形状单选框组.图像.value = "";
    });
  }

  加载图像(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  获取图像Url(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  添加颜色拾取器() {
    this.描边颜色拾取器 = Pickr.create({
      el: ".颜色框",
      theme: "monolith", // or 'monolith', or 'nano'
      default: this.全局属性.描边色,

      swatches: [
        "rgba(128, 128, 128, 1)",
        "white",
        "black",
        "rgba(244, 67, 54, 1)",
        "rgba(233, 30, 99, 1)",
        "rgba(156, 39, 176, 1)",
        "rgba(103, 58, 183, 1)",
        "rgba(63, 81, 181, 1)",
        "rgba(33, 150, 243, 1)",
        "rgba(0, 188, 212, 1)",
        "rgba(0, 150, 136, 1)",
        "rgba(76, 175, 80, 1)",
        "rgba(139, 195, 74, 1)",
        "rgba(255, 235, 59, 1)",
        "rgba(255, 193, 7, 1)",
        "transparent",
      ],

      components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
          hex: true,
          rgba: true,
          input: true,
          clear: true,
          save: true,
        },
      },
    });

    this.填充颜色拾取器 = Pickr.create({
      el: ".颜色框",
      theme: "monolith", // or 'monolith', or 'nano'
      default: this.全局属性.填充色,

      swatches: [
        "transparent",
        "white",
        "black",
        "gray",
        "rgba(244, 67, 54, 1)",
        "rgba(233, 30, 99, 1)",
        "rgba(156, 39, 176, 1)",
        "rgba(103, 58, 183, 1)",
        "rgba(63, 81, 181, 1)",
        "rgba(33, 150, 243, 1)",
        "rgba(0, 188, 212, 1)",
        "rgba(0, 150, 136, 1)",
        "rgba(76, 175, 80, 1)",
        "rgba(139, 195, 74, 1)",
        "rgba(255, 235, 59, 1)",
        "rgba(255, 193, 7, 1)",
      ],

      components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
          hex: true,
          rgba: true,
          input: true,
          clear: true,
          save: true,
        },
      },
    });
  }

  添加颜色拾取器事件() {
    this.描边颜色拾取器.on("changestop", () => {
      this.描边颜色拾取器.applyColor(true);
    });

    this.填充颜色拾取器.on("changestop", () => {
      this.填充颜色拾取器.applyColor(true);
    });

    this.描边颜色拾取器.on("change", (color) => {
      const 颜色字符串 = color.toRGBA().toString();
      if (this.全局属性.选中形状) {
        // 修改选中形状的描边色
        this.全局属性.选中形状.描边色 = 颜色字符串;
        this.清空画布();
        this.绘制基础形状对象组();
      } else {
        // 没有选中形状时，更新用户的全局描边色
        this.全局属性.用户全局描边色 = 颜色字符串;
      }
      // 无论是否有选中形状，都更新全局描边色（保持UI和实际值一致）
      this.全局属性.描边色 = 颜色字符串;
      this.本地存储池.描边色 = this.全局属性.描边色;
      localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
    });

    this.填充颜色拾取器.on("change", (color) => {
      const 颜色字符串 = color.toRGBA().toString();
      if (this.全局属性.选中形状) {
        // 修改选中形状的填充色
        this.全局属性.选中形状.填充色 = 颜色字符串;
        this.清空画布();
        this.绘制基础形状对象组();
      } else {
        // 没有选中形状时，更新用户的全局填充色
        this.全局属性.用户全局填充色 = 颜色字符串;
      }
      // 无论是否有选中形状，都更新全局填充色（保持UI和实际值一致）
      this.全局属性.填充色 = 颜色字符串;
      this.本地存储池.填充色 = this.全局属性.填充色;
      localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
    });

    this.描边颜色拾取器.on("swatchselect", (color) => {
      this.描边颜色拾取器.applyColor(true);
      const 颜色字符串 = color.toRGBA().toString();
      if (this.全局属性.选中形状) {
        // 修改选中形状的描边色
        this.全局属性.选中形状.描边色 = 颜色字符串;
        this.清空画布();
        this.绘制基础形状对象组();
      } else {
        // 没有选中形状时，更新用户的全局描边色
        this.全局属性.用户全局描边色 = 颜色字符串;
      }
      // 无论是否有选中形状，都更新全局描边色
      this.全局属性.描边色 = 颜色字符串;
      this.本地存储池.描边色 = this.全局属性.描边色;
      localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
    });

    this.填充颜色拾取器.on("swatchselect", (color) => {
      this.填充颜色拾取器.applyColor(true);
      const 颜色字符串 = color.toRGBA().toString();
      if (this.全局属性.选中形状) {
        // 修改选中形状的填充色
        this.全局属性.选中形状.填充色 = 颜色字符串;
        this.清空画布();
        this.绘制基础形状对象组();
      } else {
        // 没有选中形状时，更新用户的全局填充色
        this.全局属性.用户全局填充色 = 颜色字符串;
      }
      // 无论是否有选中形状，都更新全局填充色
      this.全局属性.填充色 = 颜色字符串;
      this.本地存储池.填充色 = this.全局属性.填充色;
      localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
    });
  }

  添加描边宽度滑块事件() {
    const 描边宽度滑块 = document.getElementById("描边宽度");
    描边宽度滑块.value = this.本地存储池.描边宽度;
    描边宽度滑块.nextElementSibling.textContent = 描边宽度滑块.value;
    描边宽度滑块.addEventListener("input", () => {
      const 宽度 = parseInt(描边宽度滑块.value, 10);
      描边宽度滑块.nextElementSibling.textContent = 描边宽度滑块.value;
      if (this.全局属性.选中形状) {
        // 修改选中形状的描边宽度
        this.全局属性.选中形状.描边宽度 = 宽度;
        this.清空画布();
        this.绘制基础形状对象组();
      }
      // 无论是否有选中形状，都更新全局描边宽度（保持UI和实际值一致）
      this.全局属性.描边宽度 = 宽度;
      this.本地存储池.描边宽度 = this.全局属性.描边宽度;
      localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
    });
  }

  更新描边宽度滑块(形状对象) {
    if (!形状对象 || 形状对象.描边宽度 === undefined) return;

    const 描边宽度滑块 = document.getElementById("描边宽度");
    const 描边宽度 = 形状对象.描边宽度;

    // 更新滑块的值和显示的文本
    描边宽度滑块.value = 描边宽度;
    描边宽度滑块.nextElementSibling.textContent = 描边宽度;
  }

  应用选中形状的颜色到拾色器(形状对象) {
    if (!形状对象) return;

    // 保存当前的用户全局颜色（如果还没有保存）
    if (this.全局属性.用户全局描边色 === null) {
      this.全局属性.用户全局描边色 = this.全局属性.描边色;
    }
    if (this.全局属性.用户全局填充色 === null) {
      this.全局属性.用户全局填充色 = this.全局属性.填充色;
    }

    // 更新拾色器显示选中形状的颜色
    if (形状对象.描边色) {
      this.描边颜色拾取器.setColor(形状对象.描边色);
    }
    if (形状对象.填充色) {
      this.填充颜色拾取器.setColor(形状对象.填充色);
    }
  }

  恢复用户全局颜色到拾色器() {
    // 恢复拾色器到用户的全局颜色
    if (this.全局属性.用户全局描边色 !== null) {
      this.描边颜色拾取器.setColor(this.全局属性.用户全局描边色);
      this.全局属性.描边色 = this.全局属性.用户全局描边色;
      this.全局属性.用户全局描边色 = null;
    }
    if (this.全局属性.用户全局填充色 !== null) {
      this.填充颜色拾取器.setColor(this.全局属性.用户全局填充色);
      this.全局属性.填充色 = this.全局属性.用户全局填充色;
      this.全局属性.用户全局填充色 = null;
    }
  }

  添加修改形状图层按钮点击事件() {
    const 向上一层按钮 = document.getElementById("向上一层");
    const 向下一层按钮 = document.getElementById("向下一层");
    const 置于顶层按钮 = document.getElementById("置于顶层");
    const 置于底层按钮 = document.getElementById("置于底层");
    向上一层按钮.addEventListener("click", () => {
      if (!this.全局属性.选中形状 || this.数据集.基础形状对象组.length <= 1) return;
      const 选中索引 = this.数据集.基础形状对象组.indexOf(this.全局属性.选中形状);
      if (选中索引 === this.数据集.基础形状对象组.length - 1) return;
      [this.数据集.基础形状对象组[选中索引], this.数据集.基础形状对象组[选中索引 + 1]] = [
        this.数据集.基础形状对象组[选中索引 + 1],
        this.数据集.基础形状对象组[选中索引],
      ];
      this.数据集.操作记录.push({
        操作类型: "交换图层",
        操作数据: [选中索引, 选中索引 + 1],
      });
      this.根据选中形状索引修改处理按钮状态();
      this.清空画布();
      this.绘制基础形状对象组();
    });

    向下一层按钮.addEventListener("click", () => {
      if (!this.全局属性.选中形状 || this.数据集.基础形状对象组.length <= 1) return;
      const 选中索引 = this.数据集.基础形状对象组.indexOf(this.全局属性.选中形状);
      if (选中索引 === 0) return;
      [this.数据集.基础形状对象组[选中索引], this.数据集.基础形状对象组[选中索引 - 1]] = [
        this.数据集.基础形状对象组[选中索引 - 1],
        this.数据集.基础形状对象组[选中索引],
      ];
      this.数据集.操作记录.push({
        操作类型: "交换图层",
        操作数据: [选中索引, 选中索引 - 1],
      });
      this.根据选中形状索引修改处理按钮状态();
      this.清空画布();
      this.绘制基础形状对象组();
    });

    置于顶层按钮.addEventListener("click", () => {
      if (!this.全局属性.选中形状 || this.数据集.基础形状对象组.length <= 1) return;
      const 选中索引 = this.数据集.基础形状对象组.indexOf(this.全局属性.选中形状);
      if (选中索引 === this.数据集.基础形状对象组.length - 1) return;
      const 置换元素 = this.数据集.基础形状对象组.splice(选中索引, 1)[0];
      this.数据集.基础形状对象组.push(置换元素);
      this.数据集.操作记录.push({
        操作类型: "置于顶层",
        操作数据: 选中索引,
      });
      this.根据选中形状索引修改处理按钮状态();
      this.清空画布();
      this.绘制基础形状对象组();
    });

    置于底层按钮.addEventListener("click", () => {
      if (!this.全局属性.选中形状 || this.数据集.基础形状对象组.length <= 1) return;
      const 选中索引 = this.数据集.基础形状对象组.indexOf(this.全局属性.选中形状);
      if (选中索引 === 0) return;
      const 置换元素 = this.数据集.基础形状对象组.splice(选中索引, 1)[0];
      this.数据集.基础形状对象组.unshift(置换元素);
      this.数据集.操作记录.push({
        操作类型: "置于底层",
        操作数据: 选中索引,
      });
      this.根据选中形状索引修改处理按钮状态();
      this.清空画布();
      this.绘制基础形状对象组();
    });
  }

  根据选中形状索引修改处理按钮状态() {
    // 根据是否有选中形状来控制变换按钮的启用/禁用
    if (this.全局属性.选中形状) {
      this.变换按钮组.水平翻转.parentElement.classList.remove("禁用");
      this.变换按钮组.垂直翻转.parentElement.classList.remove("禁用");
      this.变换按钮组.顺时针旋转.parentElement.classList.remove("禁用");
      this.变换按钮组.逆时针旋转.parentElement.classList.remove("禁用");
      /* this.图形组合按钮组.交集.parentElement.classList.remove("禁用");
      this.图形组合按钮组.并集.parentElement.classList.remove("禁用");
      this.图形组合按钮组.差集.parentElement.classList.remove("禁用"); */
      this.图形组合按钮组.复制.parentElement.classList.remove("禁用");
    } else {
      this.变换按钮组.水平翻转.parentElement.classList.add("禁用");
      this.变换按钮组.垂直翻转.parentElement.classList.add("禁用");
      this.变换按钮组.顺时针旋转.parentElement.classList.add("禁用");
      this.变换按钮组.逆时针旋转.parentElement.classList.add("禁用");
      /* this.图形组合按钮组.交集.parentElement.classList.add("禁用");
      this.图形组合按钮组.并集.parentElement.classList.add("禁用");
      this.图形组合按钮组.差集.parentElement.classList.add("禁用"); */
      this.图形组合按钮组.复制.parentElement.classList.add("禁用");
    }

    if (!this.全局属性.选中形状 || this.数据集.基础形状对象组.length <= 1) {
      this.图层处理按钮组.向上一层.parentElement.classList.add("禁用");
      this.图层处理按钮组.向下一层.parentElement.classList.add("禁用");
      this.图层处理按钮组.置于底层.parentElement.classList.add("禁用");
      this.图层处理按钮组.置于顶层.parentElement.classList.add("禁用");
      return;
    }
    const 选中索引 = this.数据集.基础形状对象组.indexOf(this.全局属性.选中形状);
    if (选中索引 <= 0) {
      this.图层处理按钮组.向下一层.parentElement.classList.add("禁用");
      this.图层处理按钮组.置于底层.parentElement.classList.add("禁用");
      this.图层处理按钮组.向上一层.parentElement.classList.remove("禁用");
      this.图层处理按钮组.置于顶层.parentElement.classList.remove("禁用");
    } else if (选中索引 >= this.数据集.基础形状对象组.length - 1) {
      this.图层处理按钮组.向上一层.parentElement.classList.add("禁用");
      this.图层处理按钮组.置于顶层.parentElement.classList.add("禁用");
      this.图层处理按钮组.向下一层.parentElement.classList.remove("禁用");
      this.图层处理按钮组.置于底层.parentElement.classList.remove("禁用");
    } else {
      this.图层处理按钮组.向上一层.parentElement.classList.remove("禁用");
      this.图层处理按钮组.向下一层.parentElement.classList.remove("禁用");
      this.图层处理按钮组.置于底层.parentElement.classList.remove("禁用");
      this.图层处理按钮组.置于顶层.parentElement.classList.remove("禁用");
    }
  }

  添加基础形状分区点击事件() {
    for (const 基础形状分区 of this.基础形状分区组) {
      基础形状分区.addEventListener("click", () => {
        this.全局属性.已选中基础形状 = 基础形状分区.getAttribute("形状");
      });
    }
  }

  鼠标位于形状内() {
    if (this.数据集.基础形状对象组.length <= 0) return null;
    for (let i = this.数据集.基础形状对象组.length - 1; i >= 0; i--) {
      const 形状 = this.数据集.基础形状对象组[i];
      if (!形状.路径) continue;
      if (this.交互框 && 形状 === this.全局属性.选中形状) {
        this.交互框.鼠标位于内部 = this.鼠标位于交互框内() || Object.values(this.鼠标位于交互框边界()).includes(true);
        this.全局属性.选中形状.已悬停 = this.交互框.鼠标位于内部;
        if (this.交互框.鼠标位于内部) {
          if (this.全局属性.悬停形状 && this.全局属性.悬停形状 !== this.全局属性.选中形状) {
            this.全局属性.悬停形状.已悬停 = false;
          }
          return this.全局属性.选中形状;
        }
      }
      if (形状.形状 === "直线" || 形状.形状 === "自由") {
        const 容差 = 8;
        for (let i = 0; i < 形状.顶点坐标组.length; i++) {
          const 采样点坐标 = 形状.顶点坐标组[i];
          if (
            Math.abs(this.全局属性.鼠标坐标.x - 采样点坐标.x) > 容差 ||
            Math.abs(this.全局属性.鼠标坐标.y - 采样点坐标.y) > 容差
          ) {
            形状.已悬停 = false;
            continue;
          }
          if (!形状.已悬停) {
            const 鼠标与采样点距离平方 =
              (this.全局属性.鼠标坐标.x - 采样点坐标.x) ** 2 + (this.全局属性.鼠标坐标.y - 采样点坐标.y) ** 2;
            形状.已悬停 = 鼠标与采样点距离平方 < 容差 ** 2;
          }
          this.ctx.strokeStyle = 形状.已悬停 ? this.全局属性.悬停描边色 : 形状.描边色;
          if (形状.已悬停) {
            return 形状;
          }
        }
      } else {
        形状.已悬停 = this.ctx.isPointInPath(
          形状.路径,
          this.全局属性.鼠标坐标.x * this.dpr,
          this.全局属性.鼠标坐标.y * this.dpr
        );
        if (形状.已悬停) {
          if (this.全局属性.悬停形状 && this.全局属性.悬停形状 !== 形状) {
            this.全局属性.悬停形状.已悬停 = false;
          }
          this.全局属性.悬停形状 = 形状;
          return 形状;
        }
      }
    }
    return null;
  }

  鼠标位于交互框内() {
    if (!this.交互框) return null;
    const 容差 = 10;

    // 获取旋转中心点
    let 中心X, 中心Y;
    const 形状对象 = this.交互框.交互形状;
    if (形状对象 && (形状对象.形状 === "圆" || 形状对象.形状 === "多边形" || 形状对象.形状 === "多角星")) {
      // 对于圆、多边形、多角星，旋转中心是坐标点（圆心）
      中心X = 形状对象.坐标.x;
      中心Y = 形状对象.坐标.y;
    } else if (形状对象 && (形状对象.形状 === "矩形" || 形状对象.形状 === "图像")) {
      // 对于矩形和图像，旋转中心是极值坐标的中心
      中心X = 形状对象.极值坐标.中心.x;
      中心Y = 形状对象.极值坐标.中心.y;
    } else {
      // 其他情况，使用交互框的几何中心
      中心X = this.交互框.坐标.x + this.交互框.尺寸.width / 2;
      中心Y = this.交互框.坐标.y + this.交互框.尺寸.height / 2;
    }

    // 获取旋转弧度
    const 旋转弧度 = this.交互框.旋转弧度 || 0;

    // 将鼠标坐标转换到以旋转中心为原点的局部坐标系（逆变换）
    const dx = this.全局属性.鼠标坐标.x - 中心X;
    const dy = this.全局属性.鼠标坐标.y - 中心Y;
    const cos = Math.cos(-旋转弧度);
    const sin = Math.sin(-旋转弧度);
    const 局部X = dx * cos - dy * sin;
    const 局部Y = dx * sin + dy * cos;

    // 计算交互框在局部坐标系中的边界
    // 对于多边形和多角星，交互框的中心不在旋转中心（形状中心）
    const 半宽 = this.交互框.尺寸.width / 2;
    const 半高 = this.交互框.尺寸.height / 2;

    // 交互框左上角相对于旋转中心的偏移
    const 交互框中心偏移X = this.交互框.坐标.x + 半宽 - 中心X;
    const 交互框中心偏移Y = this.交互框.坐标.y + 半高 - 中心Y;

    // 在局部坐标系中，交互框的范围
    const 局部左边界 = 交互框中心偏移X - 半宽;
    const 局部右边界 = 交互框中心偏移X + 半宽;
    const 局部上边界 = 交互框中心偏移Y - 半高;
    const 局部下边界 = 交互框中心偏移Y + 半高;

    return (
      局部X >= 局部左边界 + 容差 &&
      局部X <= 局部右边界 - 容差 &&
      局部Y >= 局部上边界 + 容差 &&
      局部Y <= 局部下边界 - 容差
    );
  }

  鼠标位于交互框边界() {
    if (!this.交互框) return null;
    const 容差 = 10;

    // 获取旋转中心点
    let 中心X, 中心Y;
    const 形状对象 = this.交互框.交互形状;
    if (形状对象 && (形状对象.形状 === "圆" || 形状对象.形状 === "多边形" || 形状对象.形状 === "多角星")) {
      // 对于圆、多边形、多角星，旋转中心是坐标点（圆心）
      中心X = 形状对象.坐标.x;
      中心Y = 形状对象.坐标.y;
    } else if (形状对象 && (形状对象.形状 === "矩形" || 形状对象.形状 === "图像")) {
      // 对于矩形和图像，旋转中心是极值坐标的中心
      中心X = 形状对象.极值坐标.中心.x;
      中心Y = 形状对象.极值坐标.中心.y;
    } else {
      // 其他情况，使用交互框的几何中心
      中心X = this.交互框.坐标.x + this.交互框.尺寸.width / 2;
      中心Y = this.交互框.坐标.y + this.交互框.尺寸.height / 2;
    }

    // 获取旋转弧度
    const 旋转弧度 = this.交互框.旋转弧度 || 0;

    // 将鼠标坐标转换到以旋转中心为原点的局部坐标系（逆变换）
    const dx = this.全局属性.鼠标坐标.x - 中心X;
    const dy = this.全局属性.鼠标坐标.y - 中心Y;
    const cos = Math.cos(-旋转弧度);
    const sin = Math.sin(-旋转弧度);
    const 局部X = dx * cos - dy * sin;
    const 局部Y = dx * sin + dy * cos;

    // 计算交互框在局部坐标系中的边界
    // 对于多边形和多角星，交互框的中心不在旋转中心（形状中心）
    const 半宽 = this.交互框.尺寸.width / 2;
    const 半高 = this.交互框.尺寸.height / 2;

    // 交互框左上角相对于旋转中心的偏移
    const 交互框中心偏移X = this.交互框.坐标.x + 半宽 - 中心X;
    const 交互框中心偏移Y = this.交互框.坐标.y + 半高 - 中心Y;

    // 在局部坐标系中，交互框的边界
    const 局部左边界 = 交互框中心偏移X - 半宽;
    const 局部右边界 = 交互框中心偏移X + 半宽;
    const 局部上边界 = 交互框中心偏移Y - 半高;
    const 局部下边界 = 交互框中心偏移Y + 半高;

    // 判断是否在扩展的边界范围内
    const 鼠标位于左边界内 = 局部X >= 局部左边界 - 容差;
    const 鼠标位于右边界内 = 局部X <= 局部右边界 + 容差;
    const 鼠标位于上边界内 = 局部Y >= 局部上边界 - 容差;
    const 鼠标位于下边界内 = 局部Y <= 局部下边界 + 容差;
    const 鼠标位于水平范围内 = 鼠标位于左边界内 && 鼠标位于右边界内;
    const 鼠标位于垂直范围内 = 鼠标位于上边界内 && 鼠标位于下边界内;

    const 边界位置 = {
      上: 鼠标位于水平范围内 && 鼠标位于上边界内 && 局部Y <= 局部上边界 + 容差,
      下: 鼠标位于水平范围内 && 局部Y >= 局部下边界 - 容差 && 鼠标位于下边界内,
      左: 鼠标位于垂直范围内 && 鼠标位于左边界内 && 局部X <= 局部左边界 + 容差,
      右: 鼠标位于垂直范围内 && 局部X >= 局部右边界 - 容差 && 鼠标位于右边界内,
    };
    return 边界位置;
  }

  设置旋转变换矩阵(x, y, 旋转弧度) {
    const a = Math.cos(旋转弧度) * this.dpr;
    const b = Math.sin(旋转弧度) * this.dpr;
    const c = -b;
    const d = a;
    const cx = x;
    const cy = y;
    const e = cx * this.dpr;
    const f = cy * this.dpr;
    this.ctx.setTransform(a, b, c, d, e, f);
  }

  添加canvas鼠标移动事件() {
    this.canvas.addEventListener("mousemove", (e) => {
      this.全局属性.鼠标坐标 = this.获取鼠标坐标(e);

      // Alt+拖拽复制中：更新预览形状位置并绘制
      if (this.全局标志.Alt拖拽复制中 && this.全局属性.复制预览形状) {
        const 偏移量 = {
          x: this.全局属性.鼠标坐标.x - this.全局属性.复制预览形状.初始鼠标位置.x,
          y: this.全局属性.鼠标坐标.y - this.全局属性.复制预览形状.初始鼠标位置.y,
        };

        // 根据形状类型更新位置
        const 源形状 = this.全局属性.复制源形状;
        if (源形状.形状 === "圆") {
          this.全局属性.复制预览形状.坐标 = {
            x: 源形状.坐标.x + 偏移量.x,
            y: 源形状.坐标.y + 偏移量.y,
          };
        } else if (源形状.形状 === "多边形") {
          this.全局属性.复制预览形状.坐标 = {
            x: 源形状.坐标.x + 偏移量.x,
            y: 源形状.坐标.y + 偏移量.y,
          };
          this.全局属性.复制预览形状.顶点坐标组 = this.获取多边形顶点坐标组(
            this.全局属性.复制预览形状.坐标.x,
            this.全局属性.复制预览形状.坐标.y,
            this.全局属性.复制预览形状.尺寸.水平半径,
            this.全局属性.复制预览形状.尺寸.垂直半径,
            this.全局属性.复制预览形状.边数,
            this.全局属性.复制预览形状.起始弧度,
            this.全局属性.复制预览形状.旋转弧度 || 0
          );
        } else if (源形状.形状 === "多角星") {
          this.全局属性.复制预览形状.坐标 = {
            x: 源形状.坐标.x + 偏移量.x,
            y: 源形状.坐标.y + 偏移量.y,
          };
          const 旋转弧度 = this.全局属性.复制预览形状.旋转弧度 || 0;
          this.全局属性.复制预览形状.外顶点坐标组 = this.获取多边形顶点坐标组(
            this.全局属性.复制预览形状.坐标.x,
            this.全局属性.复制预览形状.坐标.y,
            this.全局属性.复制预览形状.尺寸.外半径.水平,
            this.全局属性.复制预览形状.尺寸.外半径.垂直,
            this.全局属性.复制预览形状.边数,
            this.全局属性.复制预览形状.起始弧度,
            旋转弧度
          );
          this.全局属性.复制预览形状.内顶点坐标组 = this.获取多边形顶点坐标组(
            this.全局属性.复制预览形状.坐标.x,
            this.全局属性.复制预览形状.坐标.y,
            this.全局属性.复制预览形状.尺寸.内半径.水平,
            this.全局属性.复制预览形状.尺寸.内半径.垂直,
            this.全局属性.复制预览形状.边数,
            this.全局属性.复制预览形状.起始弧度 + Math.PI / this.全局属性.复制预览形状.边数,
            旋转弧度
          );
        } else if (源形状.形状 === "矩形" || 源形状.形状 === "直线" || 源形状.形状 === "自由") {
          this.全局属性.复制预览形状.顶点坐标组 = 源形状.顶点坐标组.map((坐标) => ({
            x: 坐标.x + 偏移量.x,
            y: 坐标.y + 偏移量.y,
          }));
        } else if (源形状.形状 === "图像") {
          this.全局属性.复制预览形状.顶点坐标组 = 源形状.顶点坐标组.map((坐标) => ({
            x: 坐标.x + 偏移量.x,
            y: 坐标.y + 偏移量.y,
          }));
          this.全局属性.复制预览形状.坐标 = {
            x: 源形状.坐标.x + 偏移量.x,
            y: 源形状.坐标.y + 偏移量.y,
          };
          this.全局属性.复制预览形状.中心 = {
            x: 源形状.中心.x + 偏移量.x,
            y: 源形状.中心.y + 偏移量.y,
          };
        }

        // 更新极值坐标和路径
        this.全局属性.复制预览形状.极值坐标 = this.获取极值坐标(this.全局属性.复制预览形状);
        this.更新路径(this.全局属性.复制预览形状);

        // 重新绘制画布，包括预览形状（透明度33%）
        this.清空画布();
        this.绘制基础形状对象组();

        const 原透明度 = this.ctx.globalAlpha;
        this.ctx.globalAlpha = 0.25;

        this.绘制单个形状(this.全局属性.复制预览形状);

        this.ctx.globalAlpha = 原透明度;
        return;
      }

      if (this.键盘状态.Alt && !this.全局标志.左键已按下) {
        const 悬停形状 = this.鼠标位于形状内();

        // 清除所有形状的Alt预览状态
        for (const 形状 of this.数据集.基础形状对象组) {
          if (形状.Alt预览中) {
            形状.Alt预览中 = false;
          }
        }

        if (悬停形状) {
          this.canvas.style.cursor = 'url("/Images/Common/copy.cur"), pointer';

          // 如果形状未被选中，设置Alt预览状态并绘制预览交互框
          if (!悬停形状.已选中) {
            悬停形状.Alt预览中 = true;

            // 重新绘制画布以显示预览交互框
            this.清空画布();
            this.绘制基础形状对象组();
          }

          return; // 不需要继续后续处理
        } else {
          this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), pointer';

          // 重新绘制以清除预览交互框
          this.清空画布();
          this.绘制基础形状对象组();
        }
      }

      // 如果不是左键按下状态，且不是直线或选择路径工具，则不处理
      // 但Alt拖拽复制时也需要阻止后续逻辑
      if (
        (!this.全局标志.左键已按下 &&
          this.全局属性.已选中基础形状 !== "直线" &&
          this.全局属性.已选中基础形状 !== "选择路径") ||
        this.全局标志.Alt拖拽复制中
      )
        return;
      if (this.全局属性.已选中基础形状 === "选择路径") {
        let 锚点 = null;

        // 检查是否应该开始绘制选框
        if (
          this.全局标志.左键已按下 &&
          !this.全局标志.绘制选框中 &&
          !this.全局标志.拖拽中 &&
          !this.全局标志.旋转中 &&
          !this.全局标志.缩放中 &&
          !this.全局属性.悬停形状 &&
          !this.全局属性.选中形状 &&
          this.全局属性.点击坐标
        ) {
          const 移动距离 = Math.sqrt(
            Math.pow(this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x, 2) +
              Math.pow(this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y, 2)
          );

          if (移动距离 > 1) {
            this.全局标志.绘制选框中 = true;
          }
        }

        if (this.全局标志.绘制选框中) {
          this.判断鼠标与点击坐标位置关系();
          const 选框x = this.全局属性.鼠标与点击坐标位置关系.左 ? this.全局属性.鼠标坐标.x : this.全局属性.点击坐标.x;
          const 选框y = this.全局属性.鼠标与点击坐标位置关系.上 ? this.全局属性.鼠标坐标.y : this.全局属性.点击坐标.y;
          const 选框宽 = Math.abs(this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x);
          const 选框高 = Math.abs(this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y);

          this.清空画布();
          this.绘制基础形状对象组();
          this.绘制选框(选框x, 选框y, 选框宽, 选框高);
          return;
        }

        if (this.交互框) {
          this.交互框.鼠标位于内部 = this.鼠标位于交互框内();
          this.交互框.鼠标位于边界 = this.鼠标位于交互框边界();

          if (this.全局标志.拖拽中) {
            this.canvas.style.cursor = 'url("/Images/Common/鼠标-移动.cur"), pointer';
            this.全局属性.选中形状.已移动 = true;
            if (
              this.全局属性.选中形状.形状 !== "直线" &&
              this.全局属性.选中形状.形状 !== "自由" &&
              this.全局属性.选中形状.形状 !== "矩形" &&
              this.全局属性.选中形状.形状 !== "图像" &&
              this.全局属性.偏移量
            ) {
              this.全局属性.选中形状.坐标.x = this.全局属性.鼠标坐标.x + this.全局属性.偏移量.x;
              this.全局属性.选中形状.坐标.y = this.全局属性.鼠标坐标.y + this.全局属性.偏移量.y;
            } else {
              const 偏移量 = {
                x: this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x,
                y: this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y,
              };
              for (let i = 0; i < this.全局属性.选中形状.顶点坐标组.length; i++) {
                this.全局属性.选中形状.顶点坐标组[i].x = this.初始坐标组[i].x + 偏移量.x;
                this.全局属性.选中形状.顶点坐标组[i].y = this.初始坐标组[i].y + 偏移量.y;
              }
              // 对于图像，还需要更新坐标和中心
              if (this.全局属性.选中形状.形状 === "图像") {
                this.全局属性.选中形状.坐标.x = this.全局属性.选中形状.顶点坐标组[0].x;
                this.全局属性.选中形状.坐标.y = this.全局属性.选中形状.顶点坐标组[0].y;
              }
            }
            if (
              this.全局属性.选中形状.形状 === "多边形" ||
              this.全局属性.选中形状.形状 === "多角星" ||
              this.全局属性.选中形状.形状 === "矩形" ||
              this.全局属性.选中形状.形状 === "图像" ||
              this.全局属性.选中形状.形状 === "直线" ||
              this.全局属性.选中形状.形状 === "自由"
            ) {
              this.全局属性.选中形状.极值坐标 = this.获取极值坐标(this.全局属性.选中形状);
              // 对于图像，更新中心坐标
              if (this.全局属性.选中形状.形状 === "图像") {
                this.全局属性.选中形状.中心 = this.全局属性.选中形状.极值坐标.中心;
              }
            }
            this.更新路径(this.全局属性.选中形状);
          } else if (this.全局标志.旋转中 || this.全局标志.缩放中 || this.交互框.鼠标位于边界) {
            const 位于旋转句柄 =
              (this.交互框.鼠标位于边界.上 && this.交互框.鼠标位于边界.左) ||
              (this.交互框.鼠标位于边界.下 && this.交互框.鼠标位于边界.右) ||
              (this.交互框.鼠标位于边界.上 && this.交互框.鼠标位于边界.右) ||
              (this.交互框.鼠标位于边界.下 && this.交互框.鼠标位于边界.左);

            if (this.全局标志.缩放中) {
              this.canvas.style.cursor = 'url("/Images/Common/缩放.cur") 10 10, pointer';

              // 获取缩放锚点以便绘制
              锚点 = this.全局属性.选中形状.缩放锚点;

              // 动态更新缩放锚点和模式（根据Alt和Shift键状态）
              // 注意：根据初始拖拽类型更新，不根据当前鼠标位置
              this.更新缩放锚点和模式(this.全局属性.选中形状);

              this.执行缩放(this.全局属性.选中形状, this.键盘状态.Shift);
              this.全局属性.选中形状.已移动 = false;
              this.更新路径(this.全局属性.选中形状);
            } else if (this.全局标志.旋转中) {
              this.canvas.style.cursor = 'url("/Images/Common/busy.png") 10 10, pointer';
              if (
                this.全局属性.选中形状.形状 === "多边形" ||
                this.全局属性.选中形状.形状 === "多角星" ||
                this.全局属性.选中形状.形状 === "圆"
              ) {
                锚点 = this.全局属性.选中形状.坐标;
              } else {
                锚点 = this.全局属性.选中形状.点击时锚点;
              }
              const 弧度差 = this.获取弧度差(
                锚点.x,
                锚点.y,
                this.全局属性.点击坐标.x,
                this.全局属性.点击坐标.y,
                this.全局属性.鼠标坐标.x,
                this.全局属性.鼠标坐标.y
              );
              this.全局属性.选中形状.累积旋转弧度 = Math.abs(弧度差);
              if (this.全局属性.选中形状.形状 === "矩形" || this.全局属性.选中形状.形状 === "图像") {
                for (let i = 0; i < this.全局属性.选中形状.点击时顶点坐标组.length; i++) {
                  this.全局属性.选中形状.顶点坐标组[i] = this.旋转坐标(
                    this.全局属性.选中形状.点击时顶点坐标组[i],
                    锚点,
                    -弧度差
                  );
                }
                this.全局属性.选中形状.极值坐标 = this.获取极值坐标(this.全局属性.选中形状);

                // 对于图像，还需要更新坐标和中心
                if (this.全局属性.选中形状.形状 === "图像") {
                  this.全局属性.选中形状.坐标.x = this.全局属性.选中形状.顶点坐标组[0].x;
                  this.全局属性.选中形状.坐标.y = this.全局属性.选中形状.顶点坐标组[0].y;
                  this.全局属性.选中形状.中心 = this.全局属性.选中形状.极值坐标.中心;
                }

                // 记录矩形和图像的累积旋转弧度（用于绘制交互框）
                if (this.全局属性.选中形状.旋转弧度 === undefined) {
                  this.全局属性.选中形状.旋转弧度 = 0;
                }
                if (this.全局属性.选中形状.点击时旋转弧度 === undefined) {
                  this.全局属性.选中形状.点击时旋转弧度 = this.全局属性.选中形状.旋转弧度;
                }
                this.全局属性.选中形状.旋转弧度 = this.全局属性.选中形状.点击时旋转弧度 - 弧度差;
                // 标准化旋转弧度到 0-2π 范围
                if (this.全局属性.选中形状.旋转弧度 > Math.PI * 2) {
                  this.全局属性.选中形状.旋转弧度 -= Math.PI * 2;
                } else if (this.全局属性.选中形状.旋转弧度 < 0) {
                  this.全局属性.选中形状.旋转弧度 += Math.PI * 2;
                }
              } else if (this.全局属性.选中形状.形状 === "圆") {
                this.全局属性.选中形状.旋转弧度 = this.全局属性.选中形状.点击时旋转弧度 - 弧度差;
                if (this.全局属性.选中形状.旋转弧度 > Math.PI * 2) {
                  this.全局属性.选中形状.旋转弧度 -= Math.PI * 2;
                } else if (this.全局属性.选中形状.旋转弧度 < 0) {
                  this.全局属性.选中形状.旋转弧度 += Math.PI * 2;
                }
              } else if (this.全局属性.选中形状.形状 === "多边形" || this.全局属性.选中形状.形状 === "多角星") {
                // 多边形/多角星：旋转椭圆（使用旋转弧度）
                // 如果旋转弧度未定义，初始化为0（仅在第一次创建时）
                if (this.全局属性.选中形状.旋转弧度 === undefined) {
                  this.全局属性.选中形状.旋转弧度 = 0;
                }
                // 如果点击时旋转弧度未定义，使用当前旋转弧度
                if (this.全局属性.选中形状.点击时旋转弧度 === undefined) {
                  this.全局属性.选中形状.点击时旋转弧度 = this.全局属性.选中形状.旋转弧度;
                }
                this.全局属性.选中形状.旋转弧度 = this.全局属性.选中形状.点击时旋转弧度 - 弧度差;
                if (this.全局属性.选中形状.旋转弧度 > Math.PI * 2) {
                  this.全局属性.选中形状.旋转弧度 -= Math.PI * 2;
                } else if (this.全局属性.选中形状.旋转弧度 < 0) {
                  this.全局属性.选中形状.旋转弧度 += Math.PI * 2;
                }
                this.全局属性.选中形状.极值坐标 = this.获取极值坐标(this.全局属性.选中形状);
              } else if (this.全局属性.选中形状.形状 === "直线" || this.全局属性.选中形状.形状 === "自由") {
                for (let i = 0; i < this.全局属性.选中形状.点击时顶点坐标组.length; i++) {
                  this.全局属性.选中形状.顶点坐标组[i] = this.旋转坐标(
                    this.全局属性.选中形状.点击时顶点坐标组[i],
                    锚点,
                    -弧度差
                  );
                }
              }
              this.全局属性.选中形状.已移动 = false;
              this.更新路径(this.全局属性.选中形状);
            } else if (位于旋转句柄) {
              // 区分不同句柄的光标样式
              // 句柄0（左上）和句柄2（右下）：西北-东南
              // 句柄1（右上）和句柄3（左下）：东北-西南
              let 光标样式;
              if (this.键盘状态.Control) {
                光标样式 = 'url("/Images/Common/busy.png") 10 10, pointer';
              } else if (
                (this.交互框.鼠标位于边界.上 && this.交互框.鼠标位于边界.左) ||
                (this.交互框.鼠标位于边界.下 && this.交互框.鼠标位于边界.右)
              ) {
                // 句柄0和句柄2
                光标样式 = 'url("/Images/Common/鼠标-西北-东南.cur"), pointer';
              } else {
                // 句柄1和句柄3
                光标样式 = 'url("/Images/Common/鼠标-东北-西南.cur"), pointer';
              }
              this.canvas.style.cursor = 光标样式;

              if (this.键盘状态.Control && this.全局标志.左键已按下) {
                this.全局标志.旋转中 = true;
              } else if (!this.键盘状态.Control && this.全局标志.左键已按下) {
                this.全局标志.缩放中 = true;
                this.全局属性.缩放模式 = this.键盘状态.Shift ? "proportional" : "free";
              }
            } else if (this.交互框.鼠标位于边界.上 || this.交互框.鼠标位于边界.下) {
              this.canvas.style.cursor = 'url("/Images/Common/鼠标-南北.cur"), pointer';
              if (this.全局标志.左键已按下) {
                this.全局标志.缩放中 = true;
                this.全局属性.缩放模式 = "vertical";
              }
            } else if (this.交互框.鼠标位于边界.左 || this.交互框.鼠标位于边界.右) {
              this.canvas.style.cursor = 'url("/Images/Common/鼠标-东西.cur"), pointer';
              if (this.全局标志.左键已按下) {
                this.全局标志.缩放中 = true;
                this.全局属性.缩放模式 = "horizontal";
              }
            } else {
              this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), pointer';
            }
          }
        }
        if (!this.全局标志.拖拽中 && this.全局属性.已选中基础形状 === "选择路径") {
          this.全局属性.悬停形状 = this.鼠标位于形状内();
        }
        this.清空画布();
        this.绘制基础形状对象组();
        if (this.全局标志.辅助视觉效果 && 锚点) {
          this.绘制椭圆(锚点.x, 锚点.y, 4, 4, 0, "white", "black", 2);
        }
        return;
      }

      this.清空画布();
      this.判断鼠标与点击坐标位置关系();
      this.绘制基础形状对象组();

      if (this.全局属性.已选中基础形状) {
        this.当前形状对象.描边色 = this.全局属性.描边色;
        this.当前形状对象.填充色 = this.全局属性.填充色;
      }

      if (this.全局属性.已选中基础形状 === "矩形") {
        this.当前形状对象.形状 = this.全局属性.已选中基础形状;
        if (!this.键盘状态.Shift) {
          this.当前形状对象.尺寸 = {
            宽: Math.abs(this.全局属性.点击坐标.x - this.全局属性.鼠标坐标.x),
            高: Math.abs(this.全局属性.点击坐标.y - this.全局属性.鼠标坐标.y),
          };
          this.当前形状对象.坐标.x = this.全局属性.鼠标与点击坐标位置关系.左
            ? this.全局属性.鼠标坐标.x
            : this.全局属性.点击坐标.x;
          this.当前形状对象.坐标.y = this.全局属性.鼠标与点击坐标位置关系.上
            ? this.全局属性.鼠标坐标.y
            : this.全局属性.点击坐标.y;
        } else {
          const 水平偏移 = Math.abs(this.全局属性.点击坐标.x - this.全局属性.鼠标坐标.x);
          const 垂直偏移 = Math.abs(this.全局属性.点击坐标.y - this.全局属性.鼠标坐标.y);
          const 更大偏移 = Math.max(水平偏移, 垂直偏移);
          this.当前形状对象.尺寸 = {
            宽: 更大偏移,
            高: 更大偏移,
          };
          this.当前形状对象.坐标.x =
            this.全局属性.点击坐标.x + 更大偏移 * (this.全局属性.鼠标与点击坐标位置关系.左 ? -1 : 0);
          this.当前形状对象.坐标.y =
            this.全局属性.点击坐标.y + 更大偏移 * (this.全局属性.鼠标与点击坐标位置关系.上 ? -1 : 0);
        }
        this.当前形状对象.极值坐标 = this.获取极值坐标(this.当前形状对象);
        this.当前形状对象.顶点坐标组 = [
          { x: this.当前形状对象.坐标.x, y: this.当前形状对象.坐标.y },
          { x: this.当前形状对象.坐标.x + this.当前形状对象.尺寸.宽, y: this.当前形状对象.坐标.y },
          {
            x: this.当前形状对象.坐标.x + this.当前形状对象.尺寸.宽,
            y: this.当前形状对象.坐标.y + this.当前形状对象.尺寸.高,
          },
          { x: this.当前形状对象.坐标.x, y: this.当前形状对象.坐标.y + this.当前形状对象.尺寸.高 },
        ];
        if (this.全局标志.辅助视觉效果 && this.当前形状对象.形状 === "矩形") {
          this.绘制操作说明();
        }
        this.当前形状对象.路径 = this.绘制矩形(
          this.当前形状对象.顶点坐标组,
          this.当前形状对象.圆角,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        ).路径;
        if (this.全局标志.辅助视觉效果 && this.当前形状对象.形状 === "矩形") {
          this.绘制辅助点(this.当前形状对象.坐标.x, this.当前形状对象.坐标.y);
        }
      } else if (this.全局属性.已选中基础形状 === "圆") {
        this.当前形状对象.形状 = "圆";
        const 理论水平半径 = Math.abs(this.全局属性.点击坐标.x - this.全局属性.鼠标坐标.x);
        const 理论垂直半径 = Math.abs(this.全局属性.点击坐标.y - this.全局属性.鼠标坐标.y);
        const 更大理论半径 = Math.max(理论水平半径, 理论垂直半径);
        this.当前形状对象.尺寸 = {
          水平半径: this.键盘状态.Shift ? 更大理论半径 : 理论水平半径,
          垂直半径: this.键盘状态.Shift ? 更大理论半径 : 理论垂直半径,
        };
        this.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        // 计算极值坐标（用于交互框）
        this.当前形状对象.极值坐标 = this.获取极值坐标(this.当前形状对象);
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.当前形状对象.路径 = this.绘制椭圆(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.水平半径,
          this.当前形状对象.尺寸.垂直半径,
          this.当前形状对象.旋转弧度,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        ).路径;
        if (this.全局标志.辅助视觉效果 && !this.键盘状态.Shift) {
          const 偏移x = Math.cos(this.当前形状对象.旋转弧度) * this.当前形状对象.尺寸.水平半径;
          const 偏移y = Math.sin(this.当前形状对象.旋转弧度) * this.当前形状对象.尺寸.水平半径;
          const 终点坐标 = {
            x: this.全局属性.点击坐标.x + 偏移x,
            y: this.全局属性.点击坐标.y + 偏移y,
          };
          this.绘制辅助虚线(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, 终点坐标.x, 终点坐标.y);
          this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
        }
      } else if (this.全局属性.已选中基础形状 === "多边形") {
        this.当前形状对象.形状 = "多边形";
        this.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        const 半径 = this.获取绘制半径(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.鼠标坐标.x,
          this.全局属性.鼠标坐标.y
        );
        this.当前形状对象.尺寸 = {
          水平半径: 半径.水平,
          垂直半径: 半径.垂直,
        };
        const 更大半径 = Math.max(半径.水平, 半径.垂直);
        this.当前形状对象.尺寸.水平半径 = 更大半径;
        this.当前形状对象.尺寸.垂直半径 = 更大半径;
        this.当前形状对象.边数 = this.全局属性.多边形边数;
        this.当前形状对象.顶点坐标组 = this.获取多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.水平半径,
          this.当前形状对象.尺寸.垂直半径,
          this.当前形状对象.边数,
          this.当前形状对象.起始弧度
        );
        this.当前形状对象.极值坐标 = this.获取极值坐标(this.当前形状对象);
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.当前形状对象.路径 = this.绘制多边形(
          this.当前形状对象.顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        ).路径;
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.顶点坐标组[0].x,
            this.当前形状对象.顶点坐标组[0].y
          );
          this.描边辅助圆(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, 更大半径, 更大半径);
        }
      } else if (this.全局属性.已选中基础形状 === "多角星") {
        this.当前形状对象.形状 = "多角星";
        this.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        const 外半径 = this.获取绘制半径(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.鼠标坐标.x,
          this.全局属性.鼠标坐标.y
        );
        if (!this.当前形状对象.尺寸 || !this.当前形状对象.尺寸.外半径 || !this.当前形状对象.尺寸.内半径) {
          this.当前形状对象.尺寸 = {
            外半径: {
              水平: 0,
              垂直: 0,
            },
            内半径: {
              水平: 0,
              垂直: 0,
            },
          };
        }
        const 更大外半径 = Math.max(外半径.水平, 外半径.垂直);
        const 更大内半径 = 更大外半径 * 0.5;
        this.当前形状对象.尺寸.外半径.水平 = 更大外半径;
        this.当前形状对象.尺寸.外半径.垂直 = 更大外半径;
        if (!this.全局标志.手动调整内半径) {
          this.当前形状对象.尺寸.内半径.水平 = 更大内半径;
          this.当前形状对象.尺寸.内半径.垂直 = 更大内半径;
        }
        const 边数 = this.全局属性.多边形边数;
        this.当前形状对象.边数 = this.全局属性.多边形边数;
        this.当前形状对象.外顶点坐标组 = this.获取多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.外半径.水平,
          this.当前形状对象.尺寸.外半径.垂直,
          this.当前形状对象.边数,
          this.当前形状对象.起始弧度
        );
        this.当前形状对象.内顶点坐标组 = this.获取多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.内半径.水平,
          this.当前形状对象.尺寸.内半径.垂直,
          this.当前形状对象.边数,
          this.当前形状对象.起始弧度 + Math.PI / 边数
        );
        this.当前形状对象.极值坐标 = this.获取极值坐标(this.当前形状对象);
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.当前形状对象.路径 = this.绘制多角星(
          this.当前形状对象.外顶点坐标组,
          this.当前形状对象.内顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        ).路径;
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.外顶点坐标组[0].x,
            this.当前形状对象.外顶点坐标组[0].y
          );
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.内顶点坐标组[0].x,
            this.当前形状对象.内顶点坐标组[0].y
          );
          this.绘制多边形顶点索引(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.外半径.水平,
            this.当前形状对象.尺寸.外半径.垂直,
            20,
            this.当前形状对象.边数,
            this.当前形状对象.起始弧度,
            "lightskyblue"
          );
          this.绘制多边形顶点索引(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.内半径.水平,
            this.当前形状对象.尺寸.内半径.垂直,
            -20,
            this.当前形状对象.边数,
            this.当前形状对象.起始弧度 + Math.PI / this.当前形状对象.边数,
            "yellowgreen"
          );
          this.描边辅助圆(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.外半径.水平,
            this.当前形状对象.尺寸.外半径.垂直
          );
          this.描边辅助圆(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.内半径.水平,
            this.当前形状对象.尺寸.内半径.垂直
          );
        }
      } else if (this.全局属性.已选中基础形状 === "直线") {
        this.当前形状对象.形状 = "直线";
        if (this.全局标志.辅助视觉效果 && this.当前形状对象.顶点坐标组.length > 0) {
          this.绘制操作说明();
        }
        if (this.当前形状对象.顶点坐标组.length >= 2) {
          this.当前形状对象.路径 = this.绘制直线(
            this.当前形状对象.顶点坐标组,
            this.全局属性.描边色,
            this.全局属性.描边宽度
          ).路径;
          this.当前形状对象.极值坐标 = this.获取极值坐标(this.当前形状对象);
        }
        if (this.当前形状对象.顶点坐标组.length >= 1) {
          const 最后坐标 = this.当前形状对象.顶点坐标组[this.当前形状对象.顶点坐标组.length - 1];
          if (this.全局标志.辅助视觉效果) {
            this.绘制辅助虚线(最后坐标.x, 最后坐标.y, this.全局属性.鼠标坐标.x, this.全局属性.鼠标坐标.y);
          }
        }
        if (this.全局标志.辅助视觉效果) {
          for (const 坐标 of this.当前形状对象.顶点坐标组) {
            this.绘制辅助点(坐标.x, 坐标.y);
          }
        }
      } else if (this.全局属性.已选中基础形状 === "自由") {
        this.当前形状对象.形状 = "自由";
        this.当前形状对象.顶点坐标组.push(this.全局属性.鼠标坐标);
        this.当前形状对象.路径 = this.绘制自由路径(
          this.当前形状对象.顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.描边宽度
        ).路径;
        this.当前形状对象.极值坐标 = this.获取极值坐标(this.当前形状对象);
      }
      if (
        this.全局标志.辅助视觉效果 &&
        this.全局属性.已选中基础形状 &&
        this.全局属性.已选中基础形状 !== "矩形" &&
        this.全局属性.已选中基础形状 !== "直线" &&
        this.全局属性.已选中基础形状 !== "选择路径"
      ) {
        this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
      }
    });
  }

  添加canvas按下左键事件() {
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      this.全局标志.左键已按下 = true;
      this.全局标志.手动调整内半径 = false;
      this.全局属性.点击坐标 = this.全局属性.鼠标坐标;
      this.当前形状对象.描边宽度 = this.全局属性.描边宽度;

      // 检测Alt+拖拽复制：当按住Alt键且鼠标悬停在形状上时
      if (this.键盘状态.Alt) {
        const 悬停形状 = this.鼠标位于形状内();
        if (悬停形状) {
          this.全局标志.Alt拖拽复制中 = true;
          this.全局属性.复制源形状 = 悬停形状;

          // 创建预览形状（深度克隆）
          if (悬停形状.形状 === "图像") {
            // 图像类型：手动创建快照
            this.全局属性.复制预览形状 = {
              形状: 悬停形状.形状,
              图像对象: 悬停形状.图像对象,
              坐标: { x: 悬停形状.坐标.x, y: 悬停形状.坐标.y },
              中心: { x: 悬停形状.中心.x, y: 悬停形状.中心.y },
              尺寸: {
                宽: 悬停形状.尺寸.宽,
                高: 悬停形状.尺寸.高,
              },
              旋转弧度: 悬停形状.旋转弧度,
              已选中: false,
              已悬停: false,
              Alt预览中: false,
              顶点坐标组: 悬停形状.顶点坐标组.map((v) => ({ x: v.x, y: v.y })),
              描边色: 悬停形状.描边色,
              填充色: 悬停形状.填充色,
              描边宽度: 悬停形状.描边宽度,
              路径: null,
            };
          } else {
            // 其他形状：使用 structuredClone
            const path = 悬停形状.路径;
            悬停形状.路径 = null;
            this.全局属性.复制预览形状 = structuredClone(悬停形状);
            悬停形状.路径 = path;
            this.全局属性.复制预览形状.路径 = null;
            this.全局属性.复制预览形状.已选中 = false;
            this.全局属性.复制预览形状.已悬停 = false;
            this.全局属性.复制预览形状.Alt预览中 = false;
          }

          // 记录初始鼠标位置
          this.全局属性.复制预览形状.初始鼠标位置 = {
            x: this.全局属性.点击坐标.x,
            y: this.全局属性.点击坐标.y,
          };

          // 初始化预览形状的路径
          this.全局属性.复制预览形状.极值坐标 = this.获取极值坐标(this.全局属性.复制预览形状);
          this.更新路径(this.全局属性.复制预览形状);

          // 清除所有形状的悬停状态和Alt预览状态，避免与预览形状冲突
          for (const 形状 of this.数据集.基础形状对象组) {
            形状.已悬停 = false;
            形状.Alt预览中 = false;
          }

          // 立即绘制预览形状
          this.清空画布();
          this.绘制基础形状对象组();

          const 原透明度 = this.ctx.globalAlpha;
          this.ctx.globalAlpha = 0.33;
          this.绘制单个形状(this.全局属性.复制预览形状);
          this.ctx.globalAlpha = 原透明度;
          return; // 阻止其他事件处理
        }
      }

      // 如果当前是绘制新形状的模式（非选择路径、非选框），则更新滑块为全局描边宽度
      if (this.全局属性.已选中基础形状 && this.全局属性.已选中基础形状 !== "选择路径") {
        const 描边宽度滑块 = document.getElementById("描边宽度");
        描边宽度滑块.value = this.全局属性.描边宽度;
        描边宽度滑块.nextElementSibling.textContent = this.全局属性.描边宽度;
      }

      this.当前形状对象.已移动 = false;
      if (this.全局属性.选中形状) {
        this.交互框.鼠标位于内部 = this.鼠标位于交互框内();
        this.交互框.鼠标位于边界 = this.鼠标位于交互框边界();
        if (this.交互框.鼠标位于边界) {
          const 位于句柄 =
            (this.交互框.鼠标位于边界.上 && this.交互框.鼠标位于边界.左) ||
            (this.交互框.鼠标位于边界.下 && this.交互框.鼠标位于边界.右) ||
            (this.交互框.鼠标位于边界.上 && this.交互框.鼠标位于边界.右) ||
            (this.交互框.鼠标位于边界.下 && this.交互框.鼠标位于边界.左);

          // 只在确实位于边界上时才处理缩放/旋转
          if (
            this.全局属性.已选中基础形状 === "选择路径" &&
            (位于句柄 ||
              this.交互框.鼠标位于边界.上 ||
              this.交互框.鼠标位于边界.下 ||
              this.交互框.鼠标位于边界.左 ||
              this.交互框.鼠标位于边界.右)
          ) {
            // 记录缩放和旋转的初始状态
            this.记录形状初始状态(this.全局属性.选中形状);

            // 记录初始拖拽位置类型（句柄/上下边界/左右边界）
            // 这个类型在整个拖拽过程中保持不变
            if (位于句柄) {
              this.全局属性.选中形状.初始拖拽类型 = "handle";
            } else if (this.交互框.鼠标位于边界.上 || this.交互框.鼠标位于边界.下) {
              this.全局属性.选中形状.初始拖拽类型 = "vertical";
            } else if (this.交互框.鼠标位于边界.左 || this.交互框.鼠标位于边界.右) {
              this.全局属性.选中形状.初始拖拽类型 = "horizontal";
            }

            // 根据初始拖拽类型和键盘状态设置锚点和模式
            this.设置初始缩放锚点和模式(this.全局属性.选中形状, this.交互框.鼠标位于边界);

            this.全局属性.选中形状.累积旋转弧度 = 0;
            return;
          }
        }

        if (!this.交互框.鼠标位于内部) {
          this.全局属性.选中形状.已选中 = false;
          if (!this.全局属性.悬停形状) {
            this.全局属性.选中形状 = null;
            this.交互框 = null;
            this.删除按钮.classList.add("禁用");
            this.恢复用户全局颜色到拾色器();
          } else if (this.全局属性.选中形状 !== this.全局属性.悬停形状) {
            this.全局属性.选中形状 = this.全局属性.悬停形状;
            this.全局属性.选中形状.已选中 = true;
            this.更新描边宽度滑块(this.全局属性.选中形状);
            this.应用选中形状的颜色到拾色器(this.全局属性.选中形状);
            const 鼠标在内形状 = this.鼠标位于形状内();
            if (鼠标在内形状) {
              this.全局属性.选中形状 = 鼠标在内形状;
              this.全局属性.选中形状.已选中 = true;
              this.更新描边宽度滑块(this.全局属性.选中形状);
              this.应用选中形状的颜色到拾色器(this.全局属性.选中形状);
              this.绘制交互框(鼠标在内形状);
              this.交互框.鼠标位于内部 = this.鼠标位于交互框内();
              this.全局标志.拖拽中 = true;
              if (
                this.全局属性.选中形状.形状 !== "直线" &&
                this.全局属性.选中形状.形状 !== "自由" &&
                this.全局属性.选中形状.形状 !== "矩形" &&
                this.全局属性.选中形状.形状 !== "图像"
              ) {
                this.全局属性.偏移量 = {
                  x: this.全局属性.选中形状.坐标.x - this.全局属性.点击坐标.x,
                  y: this.全局属性.选中形状.坐标.y - this.全局属性.点击坐标.y,
                };
              } else {
                this.初始坐标组 = this.全局属性.选中形状.顶点坐标组.map((坐标) => ({ ...坐标 }));
              }
              this.全局属性.选中形状.按下时坐标 = structuredClone(this.全局属性.选中形状.坐标);
              this.全局属性.选中形状.按下时顶点坐标组 = structuredClone(this.全局属性.选中形状.顶点坐标组);
            }
          }
        } else {
          this.全局标志.拖拽中 = true;
          if (
            this.全局属性.选中形状.形状 !== "直线" &&
            this.全局属性.选中形状.形状 !== "自由" &&
            this.全局属性.选中形状.形状 !== "矩形" &&
            this.全局属性.选中形状.形状 !== "图像"
          ) {
            this.全局属性.偏移量 = {
              x: this.全局属性.选中形状.坐标.x - this.全局属性.点击坐标.x,
              y: this.全局属性.选中形状.坐标.y - this.全局属性.点击坐标.y,
            };
          } else {
            this.初始坐标组 = this.全局属性.选中形状.顶点坐标组.map((坐标) => ({ ...坐标 }));
          }
          this.全局属性.选中形状.按下时坐标 = structuredClone(this.全局属性.选中形状.坐标);
          this.全局属性.选中形状.按下时顶点坐标组 = structuredClone(this.全局属性.选中形状.顶点坐标组);
        }
      } else if (this.全局属性.已选中基础形状 === "选择路径") {
        const 鼠标在内形状 = this.鼠标位于形状内();
        if (鼠标在内形状) {
          this.删除按钮.classList.remove("禁用");
          this.全局属性.选中形状 = 鼠标在内形状;
          this.全局属性.选中形状.已选中 = true;
          this.更新描边宽度滑块(this.全局属性.选中形状);
          this.应用选中形状的颜色到拾色器(this.全局属性.选中形状);
          this.全局属性.选中形状.已移动 = false;
          this.绘制交互框(鼠标在内形状);
          this.交互框.鼠标位于内部 = this.鼠标位于交互框内();
          this.全局标志.拖拽中 = true;
          if (
            this.全局属性.选中形状.形状 !== "直线" &&
            this.全局属性.选中形状.形状 !== "自由" &&
            this.全局属性.选中形状.形状 !== "矩形" &&
            this.全局属性.选中形状.形状 !== "图像"
          ) {
            this.全局属性.偏移量 = {
              x: this.全局属性.选中形状.坐标.x - this.全局属性.点击坐标.x,
              y: this.全局属性.选中形状.坐标.y - this.全局属性.点击坐标.y,
            };
          } else {
            this.初始坐标组 = this.全局属性.选中形状.顶点坐标组.map((坐标) => ({ ...坐标 }));
          }
          this.全局属性.选中形状.按下时坐标 = structuredClone(this.全局属性.选中形状.坐标);
          this.全局属性.选中形状.按下时顶点坐标组 = structuredClone(this.全局属性.选中形状.顶点坐标组);
        }
      }

      if (this.全局属性.已选中基础形状 !== "选择路径" && this.全局属性.选中形状) {
        this.全局属性.选中形状.已悬停 = false;
        this.全局属性.选中形状.已选中 = false;
        this.全局属性.选中形状 = null;
        this.全局属性.悬停形状 = null;
        this.恢复用户全局颜色到拾色器();
      }
      this.清空画布();
      this.绘制基础形状对象组();

      if (this.全局属性.已选中基础形状 === "矩形") {
        this.当前形状对象.圆角 = 0;
      } else if (this.全局属性.已选中基础形状 === "多边形" || this.全局属性.已选中基础形状 === "多角星") {
        this.当前形状对象.起始弧度 = -Math.PI / 2;
      } else if (this.全局属性.已选中基础形状 === "圆" && !this.键盘状态.Shift) {
        this.当前形状对象.旋转弧度 = 0;
      } else if (this.全局属性.已选中基础形状 === "直线") {
        this.清空画布();
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.当前形状对象.形状 = "直线";
        if (this.当前形状对象.顶点坐标组.length === 0) {
          this.ctx.moveTo(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
        } else {
          this.ctx.lineTo(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
        }
        this.当前形状对象.顶点坐标组.push(this.全局属性.点击坐标);
        this.当前形状对象.路径 = this.绘制直线(
          this.当前形状对象.顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.描边宽度
        )?.路径;
        if (this.全局标志.辅助视觉效果) {
          for (const 坐标 of this.当前形状对象.顶点坐标组) {
            this.绘制辅助点(坐标.x, 坐标.y);
          }
        }
        this.撤销按钮.classList.remove("禁用");
      } else if (this.全局属性.已选中基础形状 === "自由") {
        this.当前形状对象.顶点坐标组.push(this.全局属性.点击坐标);
      } else if (this.全局属性.已选中基础形状 === "选择路径") {
        if (this.全局属性.选中形状) {
          this.全局属性.选中形状.已选中 = false;
          this.全局属性.选中形状 = null;
          this.恢复用户全局颜色到拾色器();
        }
        this.全局属性.选中形状 = this.全局属性.悬停形状;
        if (this.全局属性.选中形状) {
          this.全局属性.选中形状.已选中 = !!this.全局属性.选中形状; //将null或者非null转换为布尔类型
          this.更新描边宽度滑块(this.全局属性.选中形状);
          this.应用选中形状的颜色到拾色器(this.全局属性.选中形状);
          this.清空画布();
          this.绘制基础形状对象组();
        }
        this.根据选中形状索引修改处理按钮状态();
      }
    });
  }

  添加canvas鼠标抬起事件() {
    this.canvas.addEventListener("mouseup", () => {
      // Alt+拖拽复制完成：将预览形状添加到形状组
      if (this.全局标志.Alt拖拽复制中 && this.全局属性.复制预览形状) {
        // 清除初始鼠标位置属性
        delete this.全局属性.复制预览形状.初始鼠标位置;

        // 添加复制的形状到形状组
        const 新形状索引 = this.数据集.基础形状对象组.length;
        this.数据集.基础形状对象组.push(this.全局属性.复制预览形状);

        // 记录操作以便撤销
        this.数据集.操作记录.push({
          操作类型: "复制形状",
          原形状: this.全局属性.复制源形状,
          新形状索引: 新形状索引,
        });

        // 重置状态
        this.全局标志.Alt拖拽复制中 = false;
        this.全局标志.左键已按下 = false;
        this.全局属性.复制预览形状 = null;
        this.全局属性.复制源形状 = null;
        this.全局属性.点击坐标 = null;

        // 重新绘制
        this.清空画布();
        this.绘制基础形状对象组();

        // 启用撤销按钮
        this.撤销按钮.classList.remove("禁用");

        return;
      }

      // 如果Alt拖拽复制被中断（没有完成），清理状态
      if (this.全局标志.Alt拖拽复制中) {
        this.全局标志.Alt拖拽复制中 = false;
        this.全局属性.复制预览形状 = null;
        this.全局属性.复制源形状 = null;

        // 重新绘制以移除预览
        this.清空画布();
        this.绘制基础形状对象组();
      }

      // 在重置缩放标志之前，检查是否需要规范化矩形和图像的顶点顺序
      if (
        this.全局标志.缩放中 &&
        this.全局属性.选中形状 &&
        (this.全局属性.选中形状.形状 === "矩形" || this.全局属性.选中形状.形状 === "图像")
      ) {
        this.规范化矩形顶点顺序(this.全局属性.选中形状);
      }

      this.全局标志.拖拽中 = false;
      this.全局标志.旋转中 = false;
      this.全局标志.缩放中 = false;
      this.全局标志.绘制选框中 = false;
      this.全局属性.缩放模式 = null;
      this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), pointer';
      if (!this.全局属性.点击坐标) return;
      const 鼠标移动距离 = Math.sqrt(
        Math.abs(this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x) ** 2 +
          Math.abs(this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y) ** 2
      );
      const 形状移动距离 = this.全局属性.选中形状?.已移动 === false ? 0 : 鼠标移动距离;
      const 旋转弧度 = this.全局属性.选中形状?.累积旋转弧度 || 0;
      this.全局标志.左键已按下 = false;
      this.全局属性.左键按下时间 = null;
      this.全局属性.拖拽时间 = null;
      this.全局标志.手动调整内半径 = false;
      this.全局属性.多边形边数 = 5;
      if (this.全局属性.已选中基础形状 && this.全局属性.已选中基础形状 !== "直线" && 鼠标移动距离 > 0) {
        if (this.全局属性.已选中基础形状 !== "选择路径") {
          const path = this.当前形状对象.路径;
          this.当前形状对象.路径 = null;
          const 克隆 = structuredClone(this.当前形状对象);
          克隆.路径 = path;
          if (this.当前形状对象.顶点坐标组) {
            克隆.顶点坐标组 = this.当前形状对象.顶点坐标组.map((坐标) => ({ ...坐标 }));
          }

          this.数据集.基础形状对象组.push(克隆);
          this.数据集.操作记录.push({
            操作类型: "添加基础形状",
          });
        }
        this.清空画布();
        this.绘制基础形状对象组();
        this.全局属性.点击坐标 = null;
        this.当前形状对象.顶点坐标组 = [];
      }

      if (this.交互框 && 形状移动距离 > 0) {
        if (this.全局属性.选中形状.形状 === "圆") {
          this.数据集.操作记录.push({
            操作类型: "移动",
            形状: this.全局属性.选中形状,
            坐标: structuredClone(this.全局属性.选中形状.按下时坐标),
          });
        } else if (this.全局属性.选中形状.形状 === "多边形") {
          this.数据集.操作记录.push({
            操作类型: "移动",
            形状: this.全局属性.选中形状,
            坐标: structuredClone(this.全局属性.选中形状.按下时坐标),
            极值坐标: structuredClone(this.全局属性.选中形状.极值坐标),
          });
        } else if (this.全局属性.选中形状.形状 === "多角星") {
          this.数据集.操作记录.push({
            操作类型: "移动",
            形状: this.全局属性.选中形状,
            坐标: structuredClone(this.全局属性.选中形状.按下时坐标),
            极值坐标: structuredClone(this.全局属性.选中形状.极值坐标),
          });
        } else if (
          this.全局属性.选中形状.形状 === "直线" ||
          this.全局属性.选中形状.形状 === "自由" ||
          this.全局属性.选中形状.形状 === "矩形" ||
          this.全局属性.选中形状.形状 === "图像"
        ) {
          this.数据集.操作记录.push({
            操作类型: "移动",
            形状: this.全局属性.选中形状,
            顶点坐标组: [...this.全局属性.选中形状.按下时顶点坐标组],
            极值坐标: structuredClone(this.全局属性.选中形状.极值坐标),
          });
        }
        this.全局属性.选中形状.按下时坐标 = null;
        this.全局属性.按下时顶点坐标组 = null;
      }

      if (this.全局属性.选中形状 && 旋转弧度 > 0.001) {
        const 旋转前数据 = {};
        if (this.全局属性.选中形状.形状 === "圆") {
          旋转前数据.旋转弧度 = this.全局属性.选中形状.点击时旋转弧度;
        } else if (this.全局属性.选中形状.形状 === "多边形" || this.全局属性.选中形状.形状 === "多角星") {
          旋转前数据.起始弧度 = this.全局属性.选中形状.点击时起始弧度;
        } else if (
          this.全局属性.选中形状.形状 === "矩形" ||
          this.全局属性.选中形状.形状 === "图像" ||
          this.全局属性.选中形状.形状 === "直线" ||
          this.全局属性.选中形状.形状 === "自由"
        ) {
          旋转前数据.顶点坐标组 = this.全局属性.选中形状.点击时顶点坐标组.map((坐标) => ({ ...坐标 }));
          // 对于矩形和图像，还需要保存旋转弧度
          if (this.全局属性.选中形状.形状 === "矩形" || this.全局属性.选中形状.形状 === "图像") {
            旋转前数据.旋转弧度 = this.全局属性.选中形状.点击时旋转弧度;
          }
        }
        this.数据集.操作记录.push({
          操作类型: "旋转",
          形状: this.全局属性.选中形状,
          旋转前数据: 旋转前数据,
        });
        this.全局属性.选中形状.点击时旋转弧度 = null;
        this.全局属性.选中形状.点击时起始弧度 = null;
        this.全局属性.选中形状.点击时顶点坐标组 = null;
        this.全局属性.选中形状.点击时锚点 = null;
        this.全局属性.选中形状.累积旋转弧度 = 0;
      }

      // 记录缩放操作
      if (this.全局属性.选中形状 && this.全局属性.选中形状.点击时尺寸) {
        const 是否已缩放 = this.检查是否已缩放(this.全局属性.选中形状);
        if (是否已缩放) {
          this.数据集.操作记录.push({
            操作类型: "缩放",
            形状: this.全局属性.选中形状,
            缩放前尺寸: this.全局属性.选中形状.点击时尺寸,
            缩放前坐标: this.全局属性.选中形状.点击时坐标 ? { ...this.全局属性.选中形状.点击时坐标 } : null,
            缩放前顶点坐标组: this.全局属性.选中形状.点击时顶点坐标组
              ? this.全局属性.选中形状.点击时顶点坐标组.map((坐标) => ({ ...坐标 }))
              : null,
            缩放前旋转弧度: this.全局属性.选中形状.点击时旋转弧度,
            缩放前起始弧度: this.全局属性.选中形状.点击时起始弧度,
          });
        }
        this.清除形状初始状态(this.全局属性.选中形状);
      }

      if (this.数据集.操作记录.length > 0) {
        this.撤销按钮.classList.remove("禁用");
      }
    });
  }

  判断鼠标与点击坐标位置关系() {
    if (!this.全局属性.点击坐标 || !this.全局属性.鼠标坐标) return;
    if (this.全局属性.鼠标坐标.x === this.全局属性.点击坐标.x) {
      this.全局属性.鼠标与点击坐标位置关系.左 = null;
    } else {
      this.全局属性.鼠标与点击坐标位置关系.左 = this.全局属性.鼠标坐标.x < this.全局属性.点击坐标.x;
    }
    if (this.全局属性.鼠标坐标.y === this.全局属性.点击坐标.y) {
      this.全局属性.鼠标与点击坐标位置关系.上 = null;
    } else {
      this.全局属性.鼠标与点击坐标位置关系.上 = this.全局属性.鼠标坐标.y < this.全局属性.点击坐标.y;
    }
  }

  获取鼠标坐标(e) {
    return {
      x: e.clientX - this.画布边界矩形.left,
      y: e.clientY - this.画布边界矩形.top,
    };
  }

  添加键盘事件() {
    document.addEventListener("keydown", (e) => {
      if (!Object.hasOwn(this.键盘状态, e.key)) return;
      this.键盘状态[e.key] = true;
      if (e.key === "Alt") {
        e.preventDefault();
        // 检测鼠标是否悬停在形状上，如果是则立即改变光标并显示预览交互框
        if (!this.全局标志.左键已按下 && !this.全局标志.Alt拖拽复制中) {
          const 悬停形状 = this.鼠标位于形状内();

          // 清除所有形状的Alt预览状态
          for (const 形状 of this.数据集.基础形状对象组) {
            if (形状.Alt预览中) {
              形状.Alt预览中 = false;
            }
          }

          if (悬停形状) {
            this.canvas.style.cursor = 'url("/Images/Common/copy.cur"), pointer';

            // 如果形状未被选中，设置Alt预览状态并绘制预览交互框
            if (!悬停形状.已选中) {
              悬停形状.Alt预览中 = true;

              // 立即绘制预览交互框
              this.清空画布();
              this.绘制基础形状对象组();
            }
          }
        }
      }
      if (e.key === "z" && this.键盘状态.Control) {
        if (this.全局标志.按钮音效) {
          this.辅助.点击音效对象.currentTime = 0;
          this.辅助.点击音效对象.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.撤销();
        return;
      }
      if (this.全局属性.选中形状 && e.key === "Delete") {
        if (this.全局标志.按钮音效) {
          this.辅助.清空音效.currentTime = 0;
          this.辅助.清空音效.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.删除形状(this.全局属性.选中形状);
        return;
      }
      if (this.交互框 && e.key === "Control") {
        this.交互框.鼠标位于边界 = this.鼠标位于交互框边界();
        if (this.交互框.鼠标位于边界) {
          if (
            (this.交互框.鼠标位于边界.上 && this.交互框.鼠标位于边界.左) ||
            (this.交互框.鼠标位于边界.下 && this.交互框.鼠标位于边界.右)
          ) {
            this.canvas.style.cursor = this.键盘状态.Control
              ? 'url("/Images/Common/busy.png") 10 10, pointer'
              : 'url("/Images/Common/鼠标-西北-东南.cur"), pointer';
          } else if (
            (this.交互框.鼠标位于边界.上 && this.交互框.鼠标位于边界.右) ||
            (this.交互框.鼠标位于边界.下 && this.交互框.鼠标位于边界.左)
          ) {
            this.canvas.style.cursor = this.键盘状态.Control
              ? 'url("/Images/Common/busy.png") 10 10, pointer'
              : 'url("/Images/Common/鼠标-东北-西南.cur"), pointer';
          }
        }
      }
      if (e.key === "Enter") {
        if (this.全局属性.已选中基础形状 === "直线") {
          if (this.当前形状对象.顶点坐标组.length >= 2) {
            const path = this.当前形状对象.路径;
            this.当前形状对象.路径 = null;
            const 克隆 = structuredClone(this.当前形状对象);
            克隆.路径 = path;
            this.数据集.基础形状对象组.push(克隆);
            this.数据集.操作记录.push({
              操作类型: "添加基础形状",
            });
          }
        }
      }
      if (e.key === "Escape" || (e.key === "Enter" && this.全局属性.已选中基础形状 === "直线")) {
        this.全局标志.左键已按下 = false;
        this.全局标志.拖拽中 = false;
        this.全局标志.绘制选框中 = false;
        this.全局属性.点击坐标 = null;
        this.全局属性.左键按下时间 = null;
        this.全局属性.拖拽时间 = null;
        this.全局属性.多边形边数 = 5;
        this.重置当前形状对象();
        this.清空画布();
        this.绘制基础形状对象组();
      }
      if (e.key === "Escape") {
        if (this.数据集.操作记录.length <= 0) {
          this.撤销按钮.classList.add("禁用");
        }
        return;
      }
      if (!this.全局标志.左键已按下 && Object.hasOwn(this.快捷键映射, e.key)) {
        if (this.基础形状单选框组.当前基础形状单选框) {
          this.基础形状单选框组.当前基础形状单选框.checked = false;
        }
        this.基础形状单选框组[this.快捷键映射[e.key]].checked = true;
        this.基础形状单选框组.当前基础形状单选框 = this.基础形状单选框组[this.快捷键映射[e.key]];
        this.全局属性.已选中基础形状 = this.快捷键映射[e.key];
        if (this.基础形状单选框组["选择路径"].checked) {
          const 悬停形状 = this.鼠标位于形状内();
          if (悬停形状) {
            悬停形状.已悬停 = true;
            this.清空画布();
            this.绘制基础形状对象组();
          }
        } else {
          if (this.全局属性.悬停形状) {
            this.全局属性.悬停形状.已悬停 = false;
            this.全局属性.悬停形状 = null;
            this.清空画布();
            this.绘制基础形状对象组();
          }
        }
      }
      if (this.全局标志.左键已按下 && this.全局属性.已选中基础形状 === "矩形" && !this.全局标志.Alt拖拽复制中) {
        const 短边 = Math.min(this.当前形状对象.尺寸.宽, this.当前形状对象.尺寸.高);
        if (this.键盘状态.ArrowUp && this.当前形状对象.圆角 < 短边 / 2) {
          this.当前形状对象.圆角 += 1;
        }
        if (this.键盘状态.ArrowDown && this.当前形状对象.圆角 >= 1) {
          this.当前形状对象.圆角 -= 1;
        }
        this.清空画布();
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.当前形状对象.路径 = this.绘制矩形(
          this.当前形状对象.顶点坐标组,
          this.当前形状对象.圆角,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        ).路径;
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助点(this.当前形状对象.坐标.x, this.当前形状对象.坐标.y);
        }
      } else if (
        this.全局标志.左键已按下 &&
        !this.键盘状态.Shift &&
        this.全局属性.已选中基础形状 === "圆" &&
        !this.全局标志.Alt拖拽复制中
      ) {
        if (this.键盘状态.ArrowLeft) {
          this.当前形状对象.旋转弧度 -= 0.01;
        }
        if (this.键盘状态.ArrowRight) {
          this.当前形状对象.旋转弧度 += 0.01;
        }
        if (this.键盘状态.ArrowUp) {
          this.当前形状对象.旋转弧度 -= 0.05;
        }
        if (this.键盘状态.ArrowDown) {
          this.当前形状对象.旋转弧度 += 0.05;
        }
        this.清空画布();
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.当前形状对象.路径 = this.绘制椭圆(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.水平半径,
          this.当前形状对象.尺寸.垂直半径,
          this.当前形状对象.旋转弧度,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        ).路径;
        if (this.全局标志.辅助视觉效果) {
          const 偏移x = Math.cos(this.当前形状对象.旋转弧度) * this.当前形状对象.尺寸.水平半径;
          const 偏移y = Math.sin(this.当前形状对象.旋转弧度) * this.当前形状对象.尺寸.水平半径;
          const 终点坐标 = {
            x: this.全局属性.点击坐标.x + 偏移x,
            y: this.全局属性.点击坐标.y + 偏移y,
          };
          this.绘制辅助虚线(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y, 终点坐标.x, 终点坐标.y);
          this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
        }
      } else if (
        this.全局标志.左键已按下 &&
        this.全局标志.多边形边数可增减 &&
        this.全局标志.多边形可旋转 &&
        this.全局属性.已选中基础形状 === "多边形" &&
        !this.全局标志.Alt拖拽复制中
      ) {
        if (this.键盘状态.ArrowUp) {
          if (this.全局属性.多边形边数 < 50) {
            this.全局属性.多边形边数++;
          }
        }
        if (this.键盘状态.ArrowDown) {
          if (this.全局属性.多边形边数 > 3) {
            this.全局属性.多边形边数--;
          }
        }
        if (this.键盘状态.ArrowLeft) {
          this.当前形状对象.起始弧度 -= this.键盘状态.Shift ? 0.05 : 0.01;
        }
        if (this.键盘状态.ArrowRight) {
          this.当前形状对象.起始弧度 += this.键盘状态.Shift ? 0.05 : 0.01;
        }
        this.清空画布();
        this.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        const 半径 = this.获取绘制半径(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.鼠标坐标.x,
          this.全局属性.鼠标坐标.y
        );
        const 更大半径 = Math.max(半径.水平, 半径.垂直);
        this.当前形状对象.尺寸 = {
          水平半径: 更大半径,
          垂直半径: 更大半径,
        };
        this.当前形状对象.边数 = this.全局属性.多边形边数;
        this.当前形状对象.顶点坐标组 = this.获取多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.水平半径,
          this.当前形状对象.尺寸.垂直半径,
          this.当前形状对象.边数,
          this.当前形状对象.起始弧度
        );
        this.当前形状对象.极值坐标 = this.获取极值坐标(this.当前形状对象);
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.当前形状对象.路径 = this.绘制多边形(
          this.当前形状对象.顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        ).路径;
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.顶点坐标组[0].x,
            this.当前形状对象.顶点坐标组[0].y
          );
          this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
          this.描边辅助圆(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.水平半径,
            this.当前形状对象.尺寸.垂直半径
          );
        }
      } else if (
        this.全局标志.左键已按下 &&
        this.全局标志.多边形边数可增减 &&
        this.全局标志.多边形可旋转 &&
        this.全局属性.已选中基础形状 === "多角星" &&
        !this.全局标志.Alt拖拽复制中
      ) {
        if (this.键盘状态.ArrowUp) {
          if (this.全局属性.多边形边数 < 100) {
            this.全局属性.多边形边数++;
          }
        }
        if (this.键盘状态.ArrowDown) {
          if (this.全局属性.多边形边数 > 3) {
            this.全局属性.多边形边数--;
          }
        }
        if (this.键盘状态.ArrowLeft) {
          this.当前形状对象.起始弧度 -= this.键盘状态.Shift ? 0.05 : 0.01;
        }
        if (this.键盘状态.ArrowRight) {
          this.当前形状对象.起始弧度 += this.键盘状态.Shift ? 0.05 : 0.01;
        }
        if (e.key === "[") {
          this.全局标志.手动调整内半径 = true;
          if (this.当前形状对象.尺寸.内半径.水平 >= 2) {
            this.当前形状对象.尺寸.内半径.水平 -= 2;
          }
          if (this.当前形状对象.尺寸.内半径.垂直 >= 2) {
            this.当前形状对象.尺寸.内半径.垂直 -= 2;
          }
        }
        if (e.key === "]") {
          this.全局标志.手动调整内半径 = true;
          this.当前形状对象.尺寸.内半径.水平 += 2;
          this.当前形状对象.尺寸.内半径.垂直 += 2;
        }
        this.清空画布();
        this.当前形状对象.坐标.x = this.全局属性.点击坐标.x;
        this.当前形状对象.坐标.y = this.全局属性.点击坐标.y;
        this.当前形状对象.尺寸.外半径 = this.获取绘制半径(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.全局属性.鼠标坐标.x,
          this.全局属性.鼠标坐标.y
        );
        const 更大半径 = Math.max(this.当前形状对象.尺寸.外半径.水平, this.当前形状对象.尺寸.外半径.垂直);
        this.当前形状对象.尺寸.外半径.水平 = 更大半径;
        this.当前形状对象.尺寸.外半径.垂直 = 更大半径;
        this.当前形状对象.边数 = this.全局属性.多边形边数;
        this.当前形状对象.外顶点坐标组 = this.获取多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.外半径.水平,
          this.当前形状对象.尺寸.外半径.垂直,
          this.当前形状对象.边数,
          this.当前形状对象.起始弧度
        );
        this.当前形状对象.极值坐标 = this.获取极值坐标(this.当前形状对象);
        this.当前形状对象.内顶点坐标组 = this.获取多边形顶点坐标组(
          this.全局属性.点击坐标.x,
          this.全局属性.点击坐标.y,
          this.当前形状对象.尺寸.内半径.水平,
          this.当前形状对象.尺寸.内半径.垂直,
          this.当前形状对象.边数,
          this.当前形状对象.起始弧度 + Math.PI / this.当前形状对象.边数
        );
        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }
        this.绘制基础形状对象组();
        this.当前形状对象.路径 = this.绘制多角星(
          this.当前形状对象.外顶点坐标组,
          this.当前形状对象.内顶点坐标组,
          this.全局属性.描边色,
          this.全局属性.填充色,
          this.全局属性.描边宽度
        ).路径;
        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.外顶点坐标组[0].x,
            this.当前形状对象.外顶点坐标组[0].y
          );
          this.绘制辅助虚线(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.内顶点坐标组[0].x,
            this.当前形状对象.内顶点坐标组[0].y
          );
          this.绘制多边形顶点索引(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.外半径.水平,
            this.当前形状对象.尺寸.外半径.垂直,
            20,
            this.当前形状对象.边数,
            this.当前形状对象.起始弧度,
            "lightskyblue"
          );
          this.绘制多边形顶点索引(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.内半径.水平,
            this.当前形状对象.尺寸.内半径.垂直,
            -20,
            this.当前形状对象.边数,
            this.当前形状对象.起始弧度 + Math.PI / this.当前形状对象.边数,
            "yellowgreen"
          );
          this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
          this.描边辅助圆(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.外半径.水平,
            this.当前形状对象.尺寸.外半径.垂直
          );
          this.描边辅助圆(
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.当前形状对象.尺寸.内半径.水平,
            this.当前形状对象.尺寸.内半径.垂直
          );
        }
      }
    });

    document.addEventListener("keyup", (e) => {
      if (!Object.hasOwn(this.键盘状态, e.key)) return;
      this.键盘状态[e.key] = false;
      this.全局标志.多边形边数可增减 = true;
      this.全局标志.多边形可旋转 = true;

      // Alt键释放时恢复光标并清除预览交互框（如果不在拖拽复制中）
      if (e.key === "Alt" && !this.全局标志.Alt拖拽复制中) {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), pointer';

        // 清除所有形状的Alt预览状态，如果不是选择路径工具也清除悬停状态
        let 需要重绘 = false;
        const 是选择路径工具 = this.全局属性.已选中基础形状 === "选择路径";

        for (const 形状 of this.数据集.基础形状对象组) {
          if (形状.Alt预览中) {
            形状.Alt预览中 = false;
            需要重绘 = true;
          }
          // 如果不是选择路径工具，也清除悬停状态
          if (!是选择路径工具 && 形状.已悬停) {
            形状.已悬停 = false;
            需要重绘 = true;
          }
        }

        // 如果有形状处于预览状态，重新绘制以清除预览交互框
        if (需要重绘) {
          this.清空画布();
          this.绘制基础形状对象组();
        }
      }

      if (this.交互框 && e.key === "Control") {
        this.全局标志.旋转中 = false;
        this.交互框.鼠标位于边界 = this.鼠标位于交互框边界();
        if (this.交互框.鼠标位于边界) {
          if (
            (this.交互框.鼠标位于边界.上 && this.交互框.鼠标位于边界.左) ||
            (this.交互框.鼠标位于边界.下 && this.交互框.鼠标位于边界.右)
          ) {
            this.canvas.style.cursor = 'url("/Images/Common/鼠标-西北-东南.cur"), pointer';
          } else if (
            (this.交互框.鼠标位于边界.上 && this.交互框.鼠标位于边界.右) ||
            (this.交互框.鼠标位于边界.下 && this.交互框.鼠标位于边界.左)
          ) {
            this.canvas.style.cursor = 'url("/Images/Common/鼠标-东北-西南.cur"), pointer';
          }
        }
      }
    });
  }

  处理辅助效果选项() {
    this.辅助.视觉效果复选框.addEventListener("change", () => {
      this.全局标志.辅助视觉效果 = this.辅助.视觉效果复选框.checked;
      this.本地存储池.辅助视觉效果 = this.全局标志.辅助视觉效果;
      localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
    });
    this.辅助.按钮音效复选框.addEventListener("change", () => {
      this.全局标志.按钮音效 = this.辅助.按钮音效复选框.checked;
      this.本地存储池.按钮音效 = this.全局标志.按钮音效;
      localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
    });
  }

  更新矩形路径(矩形对象) {
    矩形对象.路径 = new Path2D();
    if (矩形对象.顶点坐标组) {
      const 顶点 = 矩形对象.顶点坐标组;
      const 圆角 = 矩形对象.圆角 || 0;

      if (圆角 <= 0) {
        矩形对象.路径.moveTo(顶点[0].x, 顶点[0].y);
        for (let i = 1; i < 顶点.length; i++) {
          矩形对象.路径.lineTo(顶点[i].x, 顶点[i].y);
        }
        矩形对象.路径.closePath();
      } else {
        const 上边长度 = Math.hypot(顶点[1].x - 顶点[0].x, 顶点[1].y - 顶点[0].y);
        const 右边长度 = Math.hypot(顶点[2].x - 顶点[1].x, 顶点[2].y - 顶点[1].y);
        const 下边长度 = Math.hypot(顶点[3].x - 顶点[2].x, 顶点[3].y - 顶点[2].y);
        const 左边长度 = Math.hypot(顶点[0].x - 顶点[3].x, 顶点[0].y - 顶点[3].y);

        const 最大圆角 = Math.min(上边长度, 右边长度, 下边长度, 左边长度) / 2;
        const 实际圆角 = Math.min(圆角, 最大圆角);

        const 上边起始比例 = 实际圆角 / 上边长度;
        const 右边起始比例 = 实际圆角 / 右边长度;
        const 下边起始比例 = 实际圆角 / 下边长度;
        const 左边起始比例 = 实际圆角 / 左边长度;

        const 上边起始点 = {
          x: 顶点[0].x + (顶点[1].x - 顶点[0].x) * 上边起始比例,
          y: 顶点[0].y + (顶点[1].y - 顶点[0].y) * 上边起始比例,
        };

        矩形对象.路径.moveTo(上边起始点.x, 上边起始点.y);

        矩形对象.路径.lineTo(
          顶点[1].x - (顶点[1].x - 顶点[0].x) * 上边起始比例,
          顶点[1].y - (顶点[1].y - 顶点[0].y) * 上边起始比例
        );
        矩形对象.路径.arcTo(
          顶点[1].x,
          顶点[1].y,
          顶点[1].x + (顶点[2].x - 顶点[1].x) * 右边起始比例,
          顶点[1].y + (顶点[2].y - 顶点[1].y) * 右边起始比例,
          实际圆角
        );

        矩形对象.路径.lineTo(
          顶点[2].x - (顶点[2].x - 顶点[1].x) * 右边起始比例,
          顶点[2].y - (顶点[2].y - 顶点[1].y) * 右边起始比例
        );
        矩形对象.路径.arcTo(
          顶点[2].x,
          顶点[2].y,
          顶点[2].x + (顶点[3].x - 顶点[2].x) * 下边起始比例,
          顶点[2].y + (顶点[3].y - 顶点[2].y) * 下边起始比例,
          实际圆角
        );

        矩形对象.路径.lineTo(
          顶点[3].x - (顶点[3].x - 顶点[2].x) * 下边起始比例,
          顶点[3].y - (顶点[3].y - 顶点[2].y) * 下边起始比例
        );
        矩形对象.路径.arcTo(
          顶点[3].x,
          顶点[3].y,
          顶点[3].x + (顶点[0].x - 顶点[3].x) * 左边起始比例,
          顶点[3].y + (顶点[0].y - 顶点[3].y) * 左边起始比例,
          实际圆角
        );

        矩形对象.路径.lineTo(
          顶点[0].x - (顶点[0].x - 顶点[3].x) * 左边起始比例,
          顶点[0].y - (顶点[0].y - 顶点[3].y) * 左边起始比例
        );
        矩形对象.路径.arcTo(顶点[0].x, 顶点[0].y, 上边起始点.x, 上边起始点.y, 实际圆角);

        矩形对象.路径.closePath();
      }
    } else {
      矩形对象.路径.roundRect(矩形对象.坐标.x, 矩形对象.坐标.y, 矩形对象.尺寸.宽, 矩形对象.尺寸.高, [矩形对象.圆角]);
    }
  }

  更新椭圆路径(椭圆对象) {
    椭圆对象.路径 = new Path2D();
    椭圆对象.路径.ellipse(
      椭圆对象.坐标.x,
      椭圆对象.坐标.y,
      椭圆对象.尺寸.水平半径,
      椭圆对象.尺寸.垂直半径,
      椭圆对象.旋转弧度,
      0,
      2 * Math.PI
    );
    // 更新极值坐标（用于交互框）
    椭圆对象.极值坐标 = this.获取极值坐标(椭圆对象);
  }

  更新多边形路径(多边形对象) {
    if (多边形对象.顶点坐标组.length < 3) return;
    多边形对象.路径 = new Path2D();
    多边形对象.顶点坐标组 = this.获取多边形顶点坐标组(
      多边形对象.坐标.x,
      多边形对象.坐标.y,
      多边形对象.尺寸.水平半径,
      多边形对象.尺寸.垂直半径,
      多边形对象.边数,
      多边形对象.起始弧度,
      多边形对象.旋转弧度 || 0
    );
    多边形对象.路径.moveTo(多边形对象.顶点坐标组[0].x, 多边形对象.顶点坐标组[0].y);
    for (let i = 1; i < 多边形对象.顶点坐标组.length; i++) {
      多边形对象.路径.lineTo(多边形对象.顶点坐标组[i].x, 多边形对象.顶点坐标组[i].y);
    }
    多边形对象.路径.closePath();
  }

  更新多角星路径(多角星对象) {
    if (多角星对象.外顶点坐标组.length < 3 || 多角星对象.内顶点坐标组.length < 3) return;
    多角星对象.路径 = new Path2D();
    const 边数 = 多角星对象.外顶点坐标组.length;
    const 旋转弧度 = 多角星对象.旋转弧度 || 0;
    多角星对象.外顶点坐标组 = this.获取多边形顶点坐标组(
      多角星对象.坐标.x,
      多角星对象.坐标.y,
      多角星对象.尺寸.外半径.水平,
      多角星对象.尺寸.外半径.垂直,
      边数,
      多角星对象.起始弧度,
      旋转弧度
    );
    多角星对象.内顶点坐标组 = this.获取多边形顶点坐标组(
      多角星对象.坐标.x,
      多角星对象.坐标.y,
      多角星对象.尺寸.内半径.水平,
      多角星对象.尺寸.内半径.垂直,
      边数,
      多角星对象.起始弧度 + Math.PI / 边数,
      旋转弧度
    );
    for (let i = 0; i < 边数; i++) {
      if (i === 0) {
        多角星对象.路径.moveTo(多角星对象.外顶点坐标组[i].x, 多角星对象.外顶点坐标组[i].y);
      } else {
        多角星对象.路径.lineTo(多角星对象.外顶点坐标组[i].x, 多角星对象.外顶点坐标组[i].y);
      }
      多角星对象.路径.lineTo(多角星对象.内顶点坐标组[i].x, 多角星对象.内顶点坐标组[i].y);
    }
    多角星对象.路径.closePath();
  }

  更新直线路径(直线对象) {
    if (直线对象.顶点坐标组.length < 2) return;
    直线对象.路径 = new Path2D();
    for (let i = 0; i < 直线对象.顶点坐标组.length; i++) {
      if (i === 0) {
        直线对象.路径.moveTo(直线对象.顶点坐标组[i].x, 直线对象.顶点坐标组[i].y);
      } else {
        直线对象.路径.lineTo(直线对象.顶点坐标组[i].x, 直线对象.顶点坐标组[i].y);
      }
    }
  }

  更新自由路径对象(自由路径对象) {
    if (自由路径对象.顶点坐标组.length < 2) return;
    自由路径对象.路径 = new Path2D();

    if (自由路径对象.顶点坐标组.length === 2) {
      自由路径对象.路径.moveTo(自由路径对象.顶点坐标组[0].x, 自由路径对象.顶点坐标组[0].y);
      自由路径对象.路径.lineTo(自由路径对象.顶点坐标组[1].x, 自由路径对象.顶点坐标组[1].y);
    } else {
      自由路径对象.路径.moveTo(自由路径对象.顶点坐标组[0].x, 自由路径对象.顶点坐标组[0].y);

      for (let i = 1; i < 自由路径对象.顶点坐标组.length - 1; i++) {
        const 中间点x = (自由路径对象.顶点坐标组[i].x + 自由路径对象.顶点坐标组[i + 1].x) / 2;
        const 中间点y = (自由路径对象.顶点坐标组[i].y + 自由路径对象.顶点坐标组[i + 1].y) / 2;
        自由路径对象.路径.quadraticCurveTo(
          自由路径对象.顶点坐标组[i].x,
          自由路径对象.顶点坐标组[i].y,
          中间点x,
          中间点y
        );
      }

      const lastIndex = 自由路径对象.顶点坐标组.length - 1;
      自由路径对象.路径.quadraticCurveTo(
        自由路径对象.顶点坐标组[lastIndex - 1].x,
        自由路径对象.顶点坐标组[lastIndex - 1].y,
        自由路径对象.顶点坐标组[lastIndex].x,
        自由路径对象.顶点坐标组[lastIndex].y
      );
    }
  }

  更新路径(路径对象) {
    if (路径对象.形状 === "矩形") {
      this.更新矩形路径(路径对象);
    } else if (路径对象.形状 === "图像") {
      this.更新图像路径(路径对象);
    } else if (路径对象.形状 === "圆") {
      this.更新椭圆路径(路径对象);
    } else if (路径对象.形状 === "多边形") {
      this.更新多边形路径(路径对象);
    } else if (路径对象.形状 === "多角星") {
      this.更新多角星路径(路径对象);
    } else if (路径对象.形状 === "直线") {
      this.更新直线路径(路径对象);
    } else if (路径对象.形状 === "自由") {
      this.更新自由路径对象(路径对象);
    }
  }

  更新图像路径(图像对象) {
    // 图像使用矩形路径用于碰撞检测
    const path = new Path2D();
    if (图像对象.顶点坐标组 && 图像对象.顶点坐标组.length === 4) {
      path.moveTo(图像对象.顶点坐标组[0].x, 图像对象.顶点坐标组[0].y);
      for (let i = 1; i < 图像对象.顶点坐标组.length; i++) {
        path.lineTo(图像对象.顶点坐标组[i].x, 图像对象.顶点坐标组[i].y);
      }
      path.closePath();
    }
    图像对象.路径 = path;
  }

  绘制选框(x, y, 宽, 高) {
    const path = new Path2D();
    this.ctx.save();
    path.rect(x, y, 宽, 高);
    this.ctx.strokeStyle = this.全局属性.选框描边色;
    this.ctx.fillStyle = "transparent";
    this.ctx.lineWidth = this.全局属性.选框描边宽度;
    this.ctx.setLineDash([10, 10]);
    this.ctx.stroke(path);
    this.ctx.fill(path);
    this.ctx.restore();
    return {
      坐标: { x: x, y: y },
      尺寸: { 宽: 宽, 高: 高 },
      路径: path,
    };
  }

  绘制矩形(顶点坐标组, 圆角, 描边色, 填充色, 描边宽度) {
    const path = new Path2D();
    this.ctx.save();
    if (圆角 <= 0) {
      path.moveTo(顶点坐标组[0].x, 顶点坐标组[0].y);
      for (let i = 1; i < 顶点坐标组.length; i++) {
        path.lineTo(顶点坐标组[i].x, 顶点坐标组[i].y);
      }
      path.closePath();
    } else {
      // 计算每条边的长度
      const 上边长度 = Math.hypot(顶点坐标组[0].x - 顶点坐标组[1].x, 顶点坐标组[0].y - 顶点坐标组[1].y);
      const 右边长度 = Math.hypot(顶点坐标组[1].x - 顶点坐标组[2].x, 顶点坐标组[1].y - 顶点坐标组[2].y);
      const 下边长度 = Math.hypot(顶点坐标组[2].x - 顶点坐标组[3].x, 顶点坐标组[2].y - 顶点坐标组[3].y);
      const 左边长度 = Math.hypot(顶点坐标组[3].x - 顶点坐标组[0].x, 顶点坐标组[3].y - 顶点坐标组[0].y);

      // 限制圆角半径不超过边长的一半
      const 最大圆角 = Math.min(上边长度, 右边长度, 下边长度, 左边长度) / 2;
      const 实际圆角 = Math.min(圆角, 最大圆角);

      // 计算每条边上圆角起始点的位置（距离顶点的距离）
      const 上边起始比例 = 实际圆角 / 上边长度;
      const 右边起始比例 = 实际圆角 / 右边长度;
      const 下边起始比例 = 实际圆角 / 下边长度;
      const 左边起始比例 = 实际圆角 / 左边长度;
      // 计算上边圆角起始点（从左上角出发）
      const 上边起始点 = {
        x: 顶点坐标组[0].x + (顶点坐标组[1].x - 顶点坐标组[0].x) * 上边起始比例,
        y: 顶点坐标组[0].y + (顶点坐标组[1].y - 顶点坐标组[0].y) * 上边起始比例,
      };

      // 从上边圆角起始点开始绘制
      path.moveTo(上边起始点.x, 上边起始点.y);

      // 上边 + 右上角圆角
      path.lineTo(
        顶点坐标组[1].x - (顶点坐标组[1].x - 顶点坐标组[0].x) * 上边起始比例,
        顶点坐标组[1].y - (顶点坐标组[1].y - 顶点坐标组[0].y) * 上边起始比例
      );
      path.arcTo(
        顶点坐标组[1].x,
        顶点坐标组[1].y,
        顶点坐标组[1].x + (顶点坐标组[2].x - 顶点坐标组[1].x) * 右边起始比例,
        顶点坐标组[1].y + (顶点坐标组[2].y - 顶点坐标组[1].y) * 右边起始比例,
        实际圆角
      );

      // 右边 + 右下角圆角
      path.lineTo(
        顶点坐标组[2].x - (顶点坐标组[2].x - 顶点坐标组[1].x) * 右边起始比例,
        顶点坐标组[2].y - (顶点坐标组[2].y - 顶点坐标组[1].y) * 右边起始比例
      );
      path.arcTo(
        顶点坐标组[2].x,
        顶点坐标组[2].y,
        顶点坐标组[2].x + (顶点坐标组[3].x - 顶点坐标组[2].x) * 下边起始比例,
        顶点坐标组[2].y + (顶点坐标组[3].y - 顶点坐标组[2].y) * 下边起始比例,
        实际圆角
      );

      // 下边 + 左下角圆角
      path.lineTo(
        顶点坐标组[3].x - (顶点坐标组[3].x - 顶点坐标组[2].x) * 下边起始比例,
        顶点坐标组[3].y - (顶点坐标组[3].y - 顶点坐标组[2].y) * 下边起始比例
      );
      path.arcTo(
        顶点坐标组[3].x,
        顶点坐标组[3].y,
        顶点坐标组[3].x + (顶点坐标组[0].x - 顶点坐标组[3].x) * 左边起始比例,
        顶点坐标组[3].y + (顶点坐标组[0].y - 顶点坐标组[3].y) * 左边起始比例,
        实际圆角
      );

      // 左边 + 左上角圆角
      path.lineTo(
        顶点坐标组[0].x - (顶点坐标组[0].x - 顶点坐标组[3].x) * 左边起始比例,
        顶点坐标组[0].y - (顶点坐标组[0].y - 顶点坐标组[3].y) * 左边起始比例
      );
      path.arcTo(顶点坐标组[0].x, 顶点坐标组[0].y, 上边起始点.x, 上边起始点.y, 实际圆角);

      path.closePath();
    }
    this.ctx.strokeStyle = 描边色;
    this.ctx.fillStyle = 填充色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.stroke(path);
    this.ctx.fill(path);
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      填充色: 填充色,
      坐标: { x: 顶点坐标组[0].x, y: 顶点坐标组[0].y },
      // 尺寸: { 宽: 宽, 高: 高 },
      圆角: 圆角,
      顶点坐标组: 顶点坐标组,
      路径: path,
      已悬停: false,
      已选中: false,
    };
  }

  绘制椭圆(x, y, 水平半径, 垂直半径, 旋转弧度, 描边色, 填充色, 描边宽度) {
    const path = new Path2D();
    this.ctx.save();
    path.ellipse(x, y, 水平半径, 垂直半径, 旋转弧度, 0, 2 * Math.PI);
    this.ctx.strokeStyle = 描边色;
    this.ctx.fillStyle = 填充色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.stroke(path);
    this.ctx.fill(path);
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      填充色: 填充色,
      坐标: { x: x, y: y },
      尺寸: { 水平半径: 水平半径, 垂直半径: 垂直半径 },
      旋转弧度: 旋转弧度,
      路径: path,
      已悬停: false,
      已选中: false,
    };
  }

  绘制多边形(顶点坐标组, 描边色, 填充色, 描边宽度) {
    const path = new Path2D();
    if (顶点坐标组.length < 3) return;
    this.ctx.save();
    path.moveTo(顶点坐标组[0].x, 顶点坐标组[0].y);
    for (let i = 1; i < 顶点坐标组.length; i++) {
      path.lineTo(顶点坐标组[i].x, 顶点坐标组[i].y);
    }
    path.closePath();
    this.ctx.strokeStyle = 描边色;
    this.ctx.fillStyle = 填充色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.stroke(path);
    this.ctx.fill(path);
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      填充色: 填充色,
      顶点坐标组: 顶点坐标组,
      路径: path,
      已悬停: false,
      已选中: false,
    };
  }

  绘制多角星(外顶点坐标组, 内顶点坐标组, 描边色, 填充色, 描边宽度) {
    if (外顶点坐标组.length < 3 || 内顶点坐标组.length < 3) return;
    const path = new Path2D();
    const 边数 = 外顶点坐标组.length;
    this.ctx.save();
    for (let i = 0; i < 边数; i++) {
      if (i === 0) {
        path.moveTo(外顶点坐标组[i].x, 外顶点坐标组[i].y);
      } else {
        path.lineTo(外顶点坐标组[i].x, 外顶点坐标组[i].y);
      }
      path.lineTo(内顶点坐标组[i].x, 内顶点坐标组[i].y);
    }
    path.closePath();
    this.ctx.strokeStyle = 描边色;
    this.ctx.fillStyle = 填充色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.stroke(path);
    this.ctx.fill(path);
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      填充色: 填充色,
      外顶点坐标组: 外顶点坐标组,
      内顶点坐标组: 内顶点坐标组,
      路径: path,
      已悬停: false,
      已选中: false,
    };
  }

  绘制直线(顶点坐标组, 描边色, 描边宽度) {
    if (顶点坐标组.length < 2) return;
    const path = new Path2D();
    this.ctx.save();
    this.ctx.strokeStyle = 描边色;
    this.ctx.lineWidth = 描边宽度;
    for (let i = 0; i < 顶点坐标组.length; i++) {
      if (i === 0) {
        path.moveTo(顶点坐标组[i].x, 顶点坐标组[i].y);
      } else {
        path.lineTo(顶点坐标组[i].x, 顶点坐标组[i].y);
      }
    }
    this.ctx.stroke(path);
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      顶点坐标组: 顶点坐标组,
      路径: path,
      已悬停: false,
      已选中: false,
    };
  }

  绘制自由路径(顶点坐标组, 描边色, 描边宽度) {
    if (顶点坐标组.length < 2) return;
    const path = new Path2D();
    this.ctx.save();
    this.ctx.strokeStyle = 描边色;
    this.ctx.lineWidth = 描边宽度;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    if (顶点坐标组.length === 2) {
      path.moveTo(顶点坐标组[0].x, 顶点坐标组[0].y);
      path.lineTo(顶点坐标组[1].x, 顶点坐标组[1].y);
    } else {
      path.moveTo(顶点坐标组[0].x, 顶点坐标组[0].y);

      for (let i = 1; i < 顶点坐标组.length - 1; i++) {
        const 中间点x = (顶点坐标组[i].x + 顶点坐标组[i + 1].x) / 2;
        const 中间点y = (顶点坐标组[i].y + 顶点坐标组[i + 1].y) / 2;
        path.quadraticCurveTo(顶点坐标组[i].x, 顶点坐标组[i].y, 中间点x, 中间点y);
      }

      const lastIndex = 顶点坐标组.length - 1;
      path.quadraticCurveTo(
        顶点坐标组[lastIndex - 1].x,
        顶点坐标组[lastIndex - 1].y,
        顶点坐标组[lastIndex].x,
        顶点坐标组[lastIndex].y
      );
    }

    this.ctx.stroke(path);
    this.ctx.restore();
    return {
      描边宽度: 描边宽度,
      描边色: 描边色,
      顶点坐标组: 顶点坐标组,
      路径: path,
      已悬停: false,
      已选中: false,
    };
  }

  绘制辅助点(x, y) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
    this.ctx.closePath();
    this.ctx.fillStyle = "yellowgreen";
    this.ctx.fill();
    this.ctx.restore();
  }

  绘制辅助虚线(起点x, 起点y, 终点x, 终点y) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(起点x, 起点y);
    this.ctx.lineTo(终点x, 终点y);
    this.ctx.setLineDash([10, 10]);
    this.ctx.strokeStyle = this.全局属性.辅助线段描边色;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    this.ctx.restore();
  }

  描边辅助圆(x, y, 水平半径, 垂直半径) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, 水平半径, 垂直半径, 0, 0, 2 * Math.PI);
    this.ctx.closePath();
    this.ctx.strokeStyle = this.全局属性.辅助外框描边色;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    this.ctx.restore();
  }

  绘制多边形顶点索引(x, y, 水平半径, 垂直半径, 索引偏移, 边数, 起始弧度, 填充色) {
    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = "13px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    const 弧度偏移 = (2 * Math.PI) / 边数;
    for (let i = 0; i < 边数; i++) {
      const 顶点弧度 = 起始弧度 + i * 弧度偏移;
      const 顶点半径 = this.获取椭圆弧度半径(水平半径, 垂直半径, 顶点弧度) + 索引偏移;
      const 顶点水平偏移 = 顶点半径 * Math.cos(顶点弧度);
      const 顶点垂直偏移 = 顶点半径 * Math.sin(顶点弧度);
      const 索引x = x + 顶点水平偏移;
      const 索引y = y + 顶点垂直偏移;
      this.ctx.fillStyle = "#0007";
      this.ctx.strokeStyle = "transparent";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(索引x, 索引y, 15, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.fillStyle = 填充色;
      this.ctx.fillText(i.toString(), 索引x, 索引y);
    }
    this.ctx.restore();
  }

  获取椭圆弧度半径(水平半径, 垂直半径, 弧度) {
    const x = 水平半径 * Math.cos(弧度);
    const y = 垂直半径 * Math.sin(弧度);
    return Math.sqrt(x * x + y * y);
  }

  获取多边形顶点坐标组(x, y, 水平半径, 垂直半径, 边数, 起始弧度, 旋转弧度 = 0) {
    const 弧度偏移 = (2 * Math.PI) / 边数;
    const 顶点坐标组 = [];
    const cos旋转 = Math.cos(旋转弧度);
    const sin旋转 = Math.sin(旋转弧度);

    for (let i = 0; i < 边数; i++) {
      const 顶点弧度 = 起始弧度 + i * 弧度偏移;
      const 顶点水平偏移 = 水平半径 * Math.cos(顶点弧度);
      const 顶点垂直偏移 = 垂直半径 * Math.sin(顶点弧度);

      // 如果椭圆有旋转，应用旋转变换
      if (旋转弧度 !== 0) {
        const 旋转后水平偏移 = 顶点水平偏移 * cos旋转 - 顶点垂直偏移 * sin旋转;
        const 旋转后垂直偏移 = 顶点水平偏移 * sin旋转 + 顶点垂直偏移 * cos旋转;
        顶点坐标组.push({
          x: x + 旋转后水平偏移,
          y: y + 旋转后垂直偏移,
        });
      } else {
        顶点坐标组.push({
          x: x + 顶点水平偏移,
          y: y + 顶点垂直偏移,
        });
      }
    }
    return 顶点坐标组;
  }

  获取极值坐标(形状对象) {
    if (!形状对象) return;
    const 极值坐标 = {
      上: null,
      下: null,
      左: null,
      右: null,
      中心: null,
    };
    if (
      形状对象.形状 === "多边形" ||
      形状对象.形状 === "直线" ||
      形状对象.形状 === "自由" ||
      形状对象.形状 === "矩形" ||
      形状对象.形状 === "图像"
    ) {
      极值坐标.上 = Math.min(...形状对象.顶点坐标组.map((item) => item.y));
      极值坐标.下 = Math.max(...形状对象.顶点坐标组.map((item) => item.y));
      极值坐标.左 = Math.min(...形状对象.顶点坐标组.map((item) => item.x));
      极值坐标.右 = Math.max(...形状对象.顶点坐标组.map((item) => item.x));
      极值坐标.中心 = {
        x: (极值坐标.左 + 极值坐标.右) / 2,
        y: (极值坐标.上 + 极值坐标.下) / 2,
      };
    } else if (形状对象.形状 === "多角星") {
      极值坐标.上 = Math.min(...形状对象.外顶点坐标组.map((item) => item.y));
      极值坐标.下 = Math.max(...形状对象.外顶点坐标组.map((item) => item.y));
      极值坐标.左 = Math.min(...形状对象.外顶点坐标组.map((item) => item.x));
      极值坐标.右 = Math.max(...形状对象.外顶点坐标组.map((item) => item.x));
      极值坐标.中心 = {
        x: (极值坐标.左 + 极值坐标.右) / 2,
        y: (极值坐标.上 + 极值坐标.下) / 2,
      };
    } else if (形状对象.形状 === "圆") {
      // 对于旋转的圆，需要计算旋转后的极值坐标
      if (形状对象.旋转弧度 && 形状对象.旋转弧度 !== 0) {
        // 在椭圆边界上取多个采样点，然后旋转，找出极值
        const 采样数 = 36; // 取36个点
        let 采样点组 = [];
        for (let i = 0; i < 采样数; i++) {
          const 角度 = (i / 采样数) * Math.PI * 2;
          const x = 形状对象.坐标.x + 形状对象.尺寸.水平半径 * Math.cos(角度);
          const y = 形状对象.坐标.y + 形状对象.尺寸.垂直半径 * Math.sin(角度);

          // 旋转这个点
          const dx = x - 形状对象.坐标.x;
          const dy = y - 形状对象.坐标.y;
          const cos = Math.cos(形状对象.旋转弧度);
          const sin = Math.sin(形状对象.旋转弧度);
          const 旋转后x = 形状对象.坐标.x + dx * cos - dy * sin;
          const 旋转后y = 形状对象.坐标.y + dx * sin + dy * cos;

          采样点组.push({ x: 旋转后x, y: 旋转后y });
        }

        极值坐标.上 = Math.min(...采样点组.map((item) => item.y));
        极值坐标.下 = Math.max(...采样点组.map((item) => item.y));
        极值坐标.左 = Math.min(...采样点组.map((item) => item.x));
        极值坐标.右 = Math.max(...采样点组.map((item) => item.x));
        极值坐标.中心 = {
          x: 形状对象.坐标.x,
          y: 形状对象.坐标.y,
        };
      } else {
        // 未旋转的圆，直接计算
        极值坐标.上 = 形状对象.坐标.y - 形状对象.尺寸.垂直半径;
        极值坐标.下 = 形状对象.坐标.y + 形状对象.尺寸.垂直半径;
        极值坐标.左 = 形状对象.坐标.x - 形状对象.尺寸.水平半径;
        极值坐标.右 = 形状对象.坐标.x + 形状对象.尺寸.水平半径;
        极值坐标.中心 = {
          x: 形状对象.坐标.x,
          y: 形状对象.坐标.y,
        };
      }
    }
    return 极值坐标;
  }

  获取绘制半径(起点x, 起点y, 终点x, 终点y) {
    const 水平偏移 = Math.abs(起点x - 终点x);
    const 垂直偏移 = Math.abs(起点y - 终点y);
    return {
      水平: 水平偏移,
      垂直: 垂直偏移,
    };
  }

  获取弧度差(锚点x, 锚点y, 起点x, 起点y, 当前x, 当前y) {
    const 起始向量x = 起点x - 锚点x;
    const 起始向量y = 起点y - 锚点y;
    const 当前向量x = 当前x - 锚点x;
    const 当前向量y = 当前y - 锚点y;
    const 起始弧度 = Math.atan2(起始向量y, 起始向量x);
    const 当前弧度 = Math.atan2(当前向量y, 当前向量x);
    let 弧度差 = 当前弧度 - 起始弧度;
    if (弧度差 > Math.PI) {
      弧度差 -= 2 * Math.PI;
    } else if (弧度差 < -Math.PI) {
      弧度差 += 2 * Math.PI;
    }
    return -弧度差;
  }

  旋转坐标(坐标, 锚点, 弧度) {
    const 水平偏移 = 坐标.x - 锚点.x;
    const 垂直偏移 = 坐标.y - 锚点.y;
    const 新x = 水平偏移 * Math.cos(弧度) - 垂直偏移 * Math.sin(弧度) + 锚点.x;
    const 新y = 水平偏移 * Math.sin(弧度) + 垂直偏移 * Math.cos(弧度) + 锚点.y;
    return {
      x: 新x,
      y: 新y,
    };
  }

  记录形状初始状态(形状) {
    if (!形状) return;

    // 记录点击时的极值坐标（用于Alt键的中心缩放）
    const 极值 = this.获取极值坐标(形状);
    if (极值 && 极值.中心) {
      形状.点击时中心 = { x: 极值.中心.x, y: 极值.中心.y };
    }

    if (形状.形状 === "圆") {
      形状.点击时旋转弧度 = 形状.旋转弧度;
      形状.点击时尺寸 = {
        水平半径: 形状.尺寸.水平半径,
        垂直半径: 形状.尺寸.垂直半径,
      };
      形状.点击时坐标 = { x: 形状.坐标.x, y: 形状.坐标.y };
    } else if (形状.形状 === "多边形") {
      形状.点击时起始弧度 = 形状.起始弧度;
      形状.点击时旋转弧度 = 形状.旋转弧度 || 0;
      形状.点击时尺寸 = {
        水平半径: 形状.尺寸.水平半径,
        垂直半径: 形状.尺寸.垂直半径,
      };
      形状.点击时坐标 = { x: 形状.坐标.x, y: 形状.坐标.y };
    } else if (形状.形状 === "多角星") {
      形状.点击时起始弧度 = 形状.起始弧度;
      形状.点击时旋转弧度 = 形状.旋转弧度 || 0;
      形状.点击时尺寸 = {
        外半径: {
          水平: 形状.尺寸.外半径.水平,
          垂直: 形状.尺寸.外半径.垂直,
        },
        内半径: {
          水平: 形状.尺寸.内半径.水平,
          垂直: 形状.尺寸.内半径.垂直,
        },
      };
      形状.点击时坐标 = { x: 形状.坐标.x, y: 形状.坐标.y };
    } else if (形状.形状 === "矩形" || 形状.形状 === "图像" || 形状.形状 === "直线" || 形状.形状 === "自由") {
      形状.点击时顶点坐标组 = 形状.顶点坐标组.map((坐标) => ({ ...坐标 }));
      形状.点击时锚点 = 形状.极值坐标
        ? {
            x: 形状.极值坐标.中心.x,
            y: 形状.极值坐标.中心.y,
          }
        : null;
      // 为矩形和图像记录旋转弧度（用于交互框旋转）
      if (形状.形状 === "矩形" || 形状.形状 === "图像") {
        形状.点击时旋转弧度 = 形状.旋转弧度 || 0;
      }
      // 为图像记录实际尺寸
      if (形状.形状 === "图像" && 形状.尺寸) {
        形状.点击时尺寸 = {
          宽: 形状.尺寸.宽,
          高: 形状.尺寸.高,
          已记录顶点: true,
        };
        形状.点击时坐标 = { x: 形状.坐标.x, y: 形状.坐标.y };
      } else {
        // 为基于顶点的形状也记录尺寸（用于检查是否已缩放）
        形状.点击时尺寸 = { 已记录顶点: true };
      }
    }
    形状.累积旋转弧度 = 0;
  }

  清除形状初始状态(形状) {
    if (!形状) return;
    形状.点击时尺寸 = null;
    形状.点击时坐标 = null;
    形状.点击时顶点坐标组 = null;
    形状.缩放锚点 = null;
    形状.原始缩放锚点 = null;
    形状.点击时旋转弧度 = null;
    形状.点击时起始弧度 = null;
    形状.点击时锚点 = null;
    形状.点击时中心 = null;
    形状.初始拖拽类型 = null;
  }

  获取未旋转形状的极值坐标(形状对象) {
    // 计算形状在未应用整体旋转时的极值坐标
    if (形状对象.形状 === "多边形") {
      const 边数 = 形状对象.边数;
      const 水平半径 = 形状对象.尺寸.水平半径;
      const 垂直半径 = 形状对象.尺寸.垂直半径;
      const 起始弧度 = 形状对象.起始弧度 || 0;
      const 弧度偏移 = (2 * Math.PI) / 边数;

      let 最小x = Infinity;
      let 最大x = -Infinity;
      let 最小y = Infinity;
      let 最大y = -Infinity;

      for (let i = 0; i < 边数; i++) {
        const 顶点弧度 = 起始弧度 + i * 弧度偏移;
        const x = 水平半径 * Math.cos(顶点弧度);
        const y = 垂直半径 * Math.sin(顶点弧度);

        最小x = Math.min(最小x, x);
        最大x = Math.max(最大x, x);
        最小y = Math.min(最小y, y);
        最大y = Math.max(最大y, y);
      }

      return { 左: 最小x, 右: 最大x, 上: 最小y, 下: 最大y };
    } else if (形状对象.形状 === "多角星") {
      const 边数 = 形状对象.边数;
      const 外水平半径 = 形状对象.尺寸.外半径.水平;
      const 外垂直半径 = 形状对象.尺寸.外半径.垂直;
      const 内水平半径 = 形状对象.尺寸.内半径.水平;
      const 内垂直半径 = 形状对象.尺寸.内半径.垂直;
      const 起始弧度 = 形状对象.起始弧度 || 0;
      const 弧度偏移 = (2 * Math.PI) / 边数;

      let 最小x = Infinity;
      let 最大x = -Infinity;
      let 最小y = Infinity;
      let 最大y = -Infinity;

      // 外顶点
      for (let i = 0; i < 边数; i++) {
        const 顶点弧度 = 起始弧度 + i * 弧度偏移;
        const x = 外水平半径 * Math.cos(顶点弧度);
        const y = 外垂直半径 * Math.sin(顶点弧度);

        最小x = Math.min(最小x, x);
        最大x = Math.max(最大x, x);
        最小y = Math.min(最小y, y);
        最大y = Math.max(最大y, y);
      }

      // 内顶点
      for (let i = 0; i < 边数; i++) {
        const 顶点弧度 = 起始弧度 + Math.PI / 边数 + i * 弧度偏移;
        const x = 内水平半径 * Math.cos(顶点弧度);
        const y = 内垂直半径 * Math.sin(顶点弧度);

        最小x = Math.min(最小x, x);
        最大x = Math.max(最大x, x);
        最小y = Math.min(最小y, y);
        最大y = Math.max(最大y, y);
      }

      return { 左: 最小x, 右: 最大x, 上: 最小y, 下: 最大y };
    }

    return null;
  }

  获取交互框实际角点(形状对象) {
    // 计算交互框去掉外边距后的实际角点（用于缩放锚点）
    if (!形状对象 || !形状对象.顶点坐标组 || 形状对象.顶点坐标组.length === 0) {
      return null;
    }

    // 计算所有顶点的AABB
    let 最左 = 形状对象.顶点坐标组[0].x;
    let 最右 = 形状对象.顶点坐标组[0].x;
    let 最上 = 形状对象.顶点坐标组[0].y;
    let 最下 = 形状对象.顶点坐标组[0].y;

    for (const 坐标 of 形状对象.顶点坐标组) {
      if (坐标.x < 最左) 最左 = 坐标.x;
      if (坐标.x > 最右) 最右 = 坐标.x;
      if (坐标.y < 最上) 最上 = 坐标.y;
      if (坐标.y > 最下) 最下 = 坐标.y;
    }

    // 返回四个角点（这些是形状的实际边界，不包含外边距）
    return [
      { x: 最左, y: 最上 }, // 左上
      { x: 最右, y: 最上 }, // 右上
      { x: 最右, y: 最下 }, // 右下
      { x: 最左, y: 最下 }, // 左下
    ];
  }

  获取旋转矩形的角点(形状对象) {
    // 对于圆形、多边形、多角星，计算旋转矩形的四个角点
    if (形状对象.形状 === "圆") {
      const 圆心 = 形状对象.坐标;
      const 水平半径 = 形状对象.尺寸.水平半径;
      const 垂直半径 = 形状对象.尺寸.垂直半径;
      const 旋转弧度 = 形状对象.旋转弧度 || 0;

      // 未旋转的矩形四个角点（相对于圆心）
      const 角点组_局部 = [
        { x: -水平半径, y: -垂直半径 }, // 左上
        { x: 水平半径, y: -垂直半径 }, // 右上
        { x: -水平半径, y: 垂直半径 }, // 左下
        { x: 水平半径, y: 垂直半径 }, // 右下
      ];

      // 应用旋转变换
      const cos = Math.cos(旋转弧度);
      const sin = Math.sin(旋转弧度);

      return 角点组_局部.map((角点) => ({
        x: 圆心.x + 角点.x * cos - 角点.y * sin,
        y: 圆心.y + 角点.x * sin + 角点.y * cos,
      }));
    } else if (形状对象.形状 === "多边形" || 形状对象.形状 === "多角星") {
      // 获取未旋转形状的极值坐标
      const 极值 = this.获取未旋转形状的极值坐标(形状对象);
      if (!极值) return null;

      const 中心 = 形状对象.坐标;
      const 旋转弧度 = 形状对象.旋转弧度 || 0;

      // 基于未旋转的极值坐标构建四个角点
      const 角点组_局部 = [
        { x: 极值.左, y: 极值.上 }, // 左上
        { x: 极值.右, y: 极值.上 }, // 右上
        { x: 极值.左, y: 极值.下 }, // 左下
        { x: 极值.右, y: 极值.下 }, // 右下
      ];

      // 应用旋转变换到世界坐标系
      const cos = Math.cos(旋转弧度);
      const sin = Math.sin(旋转弧度);

      return 角点组_局部.map((角点) => ({
        x: 中心.x + 角点.x * cos - 角点.y * sin,
        y: 中心.y + 角点.x * sin + 角点.y * cos,
      }));
    }

    return null;
  }

  获取缩放锚点(鼠标位于边界, 形状对象) {
    if (!形状对象 || !鼠标位于边界) return null;

    // 对于圆形、多边形、多角星，使用旋转矩形的角点
    if (形状对象.形状 === "圆" || 形状对象.形状 === "多边形" || 形状对象.形状 === "多角星") {
      const 角点组 = this.获取旋转矩形的角点(形状对象);
      if (!角点组) return null;

      // 根据鼠标所在的句柄位置，返回相对的角点
      if (鼠标位于边界.上 && 鼠标位于边界.左) {
        return 角点组[3]; // 右下
      } else if (鼠标位于边界.上 && 鼠标位于边界.右) {
        return 角点组[2]; // 左下
      } else if (鼠标位于边界.下 && 鼠标位于边界.左) {
        return 角点组[1]; // 右上
      } else if (鼠标位于边界.下 && 鼠标位于边界.右) {
        return 角点组[0]; // 左上
      }
    } else if (形状对象.形状 === "矩形") {
      // 对于矩形，使用其实际顶点作为角点（顶点已规范化）
      if (!形状对象.顶点坐标组 || 形状对象.顶点坐标组.length < 4) return null;

      const 顶点 = 形状对象.顶点坐标组;
      // 顶点顺序：[左上, 右上, 右下, 左下]

      // 根据鼠标所在的句柄位置，返回对角线的点
      if (鼠标位于边界.上 && 鼠标位于边界.左) {
        return { x: 顶点[2].x, y: 顶点[2].y }; // 右下
      } else if (鼠标位于边界.上 && 鼠标位于边界.右) {
        return { x: 顶点[3].x, y: 顶点[3].y }; // 左下
      } else if (鼠标位于边界.下 && 鼠标位于边界.左) {
        return { x: 顶点[1].x, y: 顶点[1].y }; // 右上
      } else if (鼠标位于边界.下 && 鼠标位于边界.右) {
        return { x: 顶点[0].x, y: 顶点[0].y }; // 左上
      }
    } else if (形状对象.形状 === "图像") {
      // 🎯 对于图像，使用局部坐标系动态查找对角顶点（支持旋转）
      if (!形状对象.顶点坐标组 || 形状对象.顶点坐标组.length < 4) return null;

      const 顶点 = 形状对象.顶点坐标组;
      const 中心X = 形状对象.极值坐标.中心.x;
      const 中心Y = 形状对象.极值坐标.中心.y;
      const 旋转弧度 = 形状对象.旋转弧度 || 0;

      // 将所有顶点转换到局部坐标系
      const cos = Math.cos(-旋转弧度);
      const sin = Math.sin(-旋转弧度);
      const 局部顶点 = 顶点.map((v) => {
        const dx = v.x - 中心X;
        const dy = v.y - 中心Y;
        return {
          世界坐标: v,
          局部x: dx * cos - dy * sin,
          局部y: dx * sin + dy * cos,
        };
      });

      // 根据鼠标位于的句柄位置，在局部坐标系中查找对角的顶点
      let 目标条件 = null;
      if (鼠标位于边界.上 && 鼠标位于边界.左) {
        // 左上句柄 → 需要局部坐标系中右下的顶点
        目标条件 = (v) => v.局部x > 0 && v.局部y > 0;
      } else if (鼠标位于边界.上 && 鼠标位于边界.右) {
        // 右上句柄 → 需要局部坐标系中左下的顶点
        目标条件 = (v) => v.局部x < 0 && v.局部y > 0;
      } else if (鼠标位于边界.下 && 鼠标位于边界.左) {
        // 左下句柄 → 需要局部坐标系中右上的顶点
        目标条件 = (v) => v.局部x > 0 && v.局部y < 0;
      } else if (鼠标位于边界.下 && 鼠标位于边界.右) {
        // 右下句柄 → 需要局部坐标系中左上的顶点
        目标条件 = (v) => v.局部x < 0 && v.局部y < 0;
      }

      if (目标条件) {
        const 目标顶点 = 局部顶点.find(目标条件);
        if (目标顶点) {
          return { x: 目标顶点.世界坐标.x, y: 目标顶点.世界坐标.y };
        }
      }
    } else if (形状对象.形状 === "直线" || 形状对象.形状 === "自由") {
      // 对于直线和自由绘制，使用交互框的角点（去掉外边距）
      const 角点组 = this.获取交互框实际角点(形状对象);
      if (!角点组) return null;

      // 根据鼠标所在的句柄位置，返回对角线的点
      if (鼠标位于边界.上 && 鼠标位于边界.左) {
        return 角点组[2]; // 右下
      } else if (鼠标位于边界.上 && 鼠标位于边界.右) {
        return 角点组[3]; // 左下
      } else if (鼠标位于边界.下 && 鼠标位于边界.左) {
        return 角点组[1]; // 右上
      } else if (鼠标位于边界.下 && 鼠标位于边界.右) {
        return 角点组[0]; // 左上
      }
    } else {
      // 对于其他形状，使用极值坐标
      let 极值 = 形状对象.极值坐标;
      if (!极值) {
        极值 = this.获取极值坐标(形状对象);
      }
      if (!极值) return null;

      let 锚点 = null;
      if (鼠标位于边界.上 && 鼠标位于边界.左) {
        锚点 = { x: 极值.右, y: 极值.下 };
      } else if (鼠标位于边界.上 && 鼠标位于边界.右) {
        锚点 = { x: 极值.左, y: 极值.下 };
      } else if (鼠标位于边界.下 && 鼠标位于边界.左) {
        锚点 = { x: 极值.右, y: 极值.上 };
      } else if (鼠标位于边界.下 && 鼠标位于边界.右) {
        锚点 = { x: 极值.左, y: 极值.上 };
      }
      return 锚点;
    }

    return null;
  }

  获取边界缩放锚点(鼠标位于边界, 形状对象) {
    if (!形状对象 || !鼠标位于边界) return null;

    // 对于圆形、多边形、多角星，使用旋转矩形的边缘中点
    if (形状对象.形状 === "圆" || 形状对象.形状 === "多边形" || 形状对象.形状 === "多角星") {
      const 角点组 = this.获取旋转矩形的角点(形状对象);
      if (!角点组) return null;

      // 根据鼠标所在的边界，返回相对边的中点
      if (鼠标位于边界.上) {
        // 上边 → 返回下边中点（左下和右下的中点）
        return {
          x: (角点组[2].x + 角点组[3].x) / 2,
          y: (角点组[2].y + 角点组[3].y) / 2,
        };
      } else if (鼠标位于边界.下) {
        // 下边 → 返回上边中点（左上和右上的中点）
        return {
          x: (角点组[0].x + 角点组[1].x) / 2,
          y: (角点组[0].y + 角点组[1].y) / 2,
        };
      } else if (鼠标位于边界.左) {
        // 左边 → 返回右边中点（右上和右下的中点）
        return {
          x: (角点组[1].x + 角点组[3].x) / 2,
          y: (角点组[1].y + 角点组[3].y) / 2,
        };
      } else if (鼠标位于边界.右) {
        // 右边 → 返回左边中点（左上和左下的中点）
        return {
          x: (角点组[0].x + 角点组[2].x) / 2,
          y: (角点组[0].y + 角点组[2].y) / 2,
        };
      }
    } else if (形状对象.形状 === "矩形") {
      // 对于矩形，使用其实际顶点计算边缘中点（顶点已规范化）
      if (!形状对象.顶点坐标组 || 形状对象.顶点坐标组.length < 4) return null;

      const 顶点 = 形状对象.顶点坐标组;
      // 顶点顺序：[左上, 右上, 右下, 左下]

      // 根据鼠标所在的边界，返回相对边的中点
      if (鼠标位于边界.上) {
        // 上边 → 返回下边中点（左下和右下的中点）
        return {
          x: (顶点[3].x + 顶点[2].x) / 2,
          y: (顶点[3].y + 顶点[2].y) / 2,
        };
      } else if (鼠标位于边界.下) {
        // 下边 → 返回上边中点（左上和右上的中点）
        return {
          x: (顶点[0].x + 顶点[1].x) / 2,
          y: (顶点[0].y + 顶点[1].y) / 2,
        };
      } else if (鼠标位于边界.左) {
        // 左边 → 返回右边中点（右上和右下的中点）
        return {
          x: (顶点[1].x + 顶点[2].x) / 2,
          y: (顶点[1].y + 顶点[2].y) / 2,
        };
      } else if (鼠标位于边界.右) {
        // 右边 → 返回左边中点（左上和左下的中点）
        return {
          x: (顶点[0].x + 顶点[3].x) / 2,
          y: (顶点[0].y + 顶点[3].y) / 2,
        };
      }
    } else if (形状对象.形状 === "图像") {
      // 🎯 对于图像，使用局部坐标系动态查找对边的两个顶点（支持旋转）
      if (!形状对象.顶点坐标组 || 形状对象.顶点坐标组.length < 4) return null;

      const 顶点 = 形状对象.顶点坐标组;
      const 中心X = 形状对象.极值坐标.中心.x;
      const 中心Y = 形状对象.极值坐标.中心.y;
      const 旋转弧度 = 形状对象.旋转弧度 || 0;

      // 将所有顶点转换到局部坐标系
      const cos = Math.cos(-旋转弧度);
      const sin = Math.sin(-旋转弧度);
      const 局部顶点 = 顶点.map((v) => {
        const dx = v.x - 中心X;
        const dy = v.y - 中心Y;
        return {
          世界坐标: v,
          局部x: dx * cos - dy * sin,
          局部y: dx * sin + dy * cos,
        };
      });

      // 根据鼠标所在的边界，在局部坐标系中查找对边的两个顶点
      let 对边顶点 = null;
      if (鼠标位于边界.上) {
        // 上边 → 返回下边中点（局部y>0的两个点）
        对边顶点 = 局部顶点.filter((v) => v.局部y > 0);
      } else if (鼠标位于边界.下) {
        // 下边 → 返回上边中点（局部y<0的两个点）
        对边顶点 = 局部顶点.filter((v) => v.局部y < 0);
      } else if (鼠标位于边界.左) {
        // 左边 → 返回右边中点（局部x>0的两个点）
        对边顶点 = 局部顶点.filter((v) => v.局部x > 0);
      } else if (鼠标位于边界.右) {
        // 右边 → 返回左边中点（局部x<0的两个点）
        对边顶点 = 局部顶点.filter((v) => v.局部x < 0);
      }

      if (对边顶点 && 对边顶点.length >= 2) {
        return {
          x: (对边顶点[0].世界坐标.x + 对边顶点[1].世界坐标.x) / 2,
          y: (对边顶点[0].世界坐标.y + 对边顶点[1].世界坐标.y) / 2,
        };
      }
    } else if (形状对象.形状 === "直线" || 形状对象.形状 === "自由") {
      // 对于直线和自由绘制，使用交互框的边缘中点
      const 角点组 = this.获取交互框实际角点(形状对象);
      if (!角点组) return null;

      // 根据鼠标所在的边界，返回相对边的中点
      if (鼠标位于边界.上) {
        // 上边 → 返回下边中点（左下和右下的中点）
        return {
          x: (角点组[3].x + 角点组[2].x) / 2,
          y: (角点组[3].y + 角点组[2].y) / 2,
        };
      } else if (鼠标位于边界.下) {
        // 下边 → 返回上边中点（左上和右上的中点）
        return {
          x: (角点组[0].x + 角点组[1].x) / 2,
          y: (角点组[0].y + 角点组[1].y) / 2,
        };
      } else if (鼠标位于边界.左) {
        // 左边 → 返回右边中点（右上和右下的中点）
        return {
          x: (角点组[1].x + 角点组[2].x) / 2,
          y: (角点组[1].y + 角点组[2].y) / 2,
        };
      } else if (鼠标位于边界.右) {
        // 右边 → 返回左边中点（左上和左下的中点）
        return {
          x: (角点组[0].x + 角点组[3].x) / 2,
          y: (角点组[0].y + 角点组[3].y) / 2,
        };
      }
    } else {
      // 对于其他形状，使用极值坐标
      let 极值 = 形状对象.极值坐标;
      if (!极值) {
        极值 = this.获取极值坐标(形状对象);
      }
      if (!极值) return null;

      let 锚点 = null;
      if (鼠标位于边界.上) {
        锚点 = { x: 极值.中心.x, y: 极值.下 };
      } else if (鼠标位于边界.下) {
        锚点 = { x: 极值.中心.x, y: 极值.上 };
      } else if (鼠标位于边界.左) {
        锚点 = { x: 极值.右, y: 极值.中心.y };
      } else if (鼠标位于边界.右) {
        锚点 = { x: 极值.左, y: 极值.中心.y };
      }
      return 锚点;
    }

    return null;
  }

  旋转点坐标(点, 旋转中心, 旋转弧度) {
    // 将点相对于旋转中心进行旋转
    const dx = 点.x - 旋转中心.x;
    const dy = 点.y - 旋转中心.y;
    const cos = Math.cos(旋转弧度);
    const sin = Math.sin(旋转弧度);
    return {
      x: 旋转中心.x + dx * cos - dy * sin,
      y: 旋转中心.y + dx * sin + dy * cos,
    };
  }

  获取中心缩放锚点(形状对象) {
    if (!形状对象) return null;

    // 优先使用点击时记录的中心点（保持锚点固定）
    if (形状对象.点击时中心) {
      return { x: 形状对象.点击时中心.x, y: 形状对象.点击时中心.y };
    }

    // 对于圆形、多边形、多角星，使用几何中心（即坐标点）
    if (形状对象.形状 === "圆" || 形状对象.形状 === "多边形" || 形状对象.形状 === "多角星") {
      return { x: 形状对象.坐标.x, y: 形状对象.坐标.y };
    }

    // 对于其他形状，使用极值坐标的中心
    let 极值 = 形状对象.极值坐标;
    if (!极值) {
      极值 = this.获取极值坐标(形状对象);
    }
    if (!极值 || !极值.中心) return null;

    return { x: 极值.中心.x, y: 极值.中心.y };
  }

  设置初始缩放锚点和模式(形状对象, 鼠标位于边界) {
    if (!形状对象) return;

    const 初始拖拽类型 = 形状对象.初始拖拽类型;

    // 首先计算并保存原始锚点（非Alt模式的锚点）
    if (初始拖拽类型 === "handle") {
      形状对象.原始缩放锚点 = this.获取缩放锚点(鼠标位于边界, 形状对象);
    } else if (初始拖拽类型 === "vertical" || 初始拖拽类型 === "horizontal") {
      形状对象.原始缩放锚点 = this.获取边界缩放锚点(鼠标位于边界, 形状对象);
    }

    // 根据Alt键和初始拖拽类型设置锚点和模式
    if (this.键盘状态.Alt) {
      // 按住Alt键 - 使用中心点作为锚点
      形状对象.缩放锚点 = this.获取中心缩放锚点(形状对象);
      if (初始拖拽类型 === "handle") {
        // Alt + 句柄 = 从中心自由缩放，Shift控制是否等比
        this.全局属性.缩放模式 = this.键盘状态.Shift ? "proportional" : "free";
      } else if (初始拖拽类型 === "vertical") {
        this.全局属性.缩放模式 = "vertical";
      } else if (初始拖拽类型 === "horizontal") {
        this.全局属性.缩放模式 = "horizontal";
      }
    } else {
      // 没有按Alt键 - 使用原始锚点
      形状对象.缩放锚点 = 形状对象.原始缩放锚点;
      if (初始拖拽类型 === "handle") {
        // 根据Shift键决定是否等比缩放
        this.全局属性.缩放模式 = this.键盘状态.Shift ? "proportional" : "free";
      } else if (初始拖拽类型 === "vertical") {
        this.全局属性.缩放模式 = "vertical";
      } else if (初始拖拽类型 === "horizontal") {
        this.全局属性.缩放模式 = "horizontal";
      }
    }
  }

  更新缩放锚点和模式(形状对象) {
    if (!形状对象) return;

    const 初始拖拽类型 = 形状对象.初始拖拽类型;
    if (!初始拖拽类型) return;

    // 根据Alt键和初始拖拽类型更新锚点和模式
    // 注意：初始拖拽类型不变，只根据键盘状态调整
    if (this.键盘状态.Alt) {
      // 按住Alt键 - 使用中心点作为锚点
      形状对象.缩放锚点 = this.获取中心缩放锚点(形状对象);
      if (初始拖拽类型 === "handle") {
        // Alt + 句柄 = 从中心自由缩放，Shift控制是否等比
        this.全局属性.缩放模式 = this.键盘状态.Shift ? "proportional" : "free";
      } else if (初始拖拽类型 === "vertical") {
        this.全局属性.缩放模式 = "vertical";
      } else if (初始拖拽类型 === "horizontal") {
        this.全局属性.缩放模式 = "horizontal";
      }
    } else {
      // 没有按Alt键 - 恢复原始锚点
      形状对象.缩放锚点 = 形状对象.原始缩放锚点;
      if (初始拖拽类型 === "handle") {
        // 句柄缩放：只根据Shift更新模式
        this.全局属性.缩放模式 = this.键盘状态.Shift ? "proportional" : "free";
      } else if (初始拖拽类型 === "vertical") {
        // 垂直缩放：保持垂直模式
        this.全局属性.缩放模式 = "vertical";
      } else if (初始拖拽类型 === "horizontal") {
        // 水平缩放：保持水平模式
        this.全局属性.缩放模式 = "horizontal";
      }
    }
  }

  执行缩放(形状对象, 是否等比) {
    if (!形状对象 || !形状对象.点击时尺寸) return;

    const 缩放锚点 = 形状对象.缩放锚点;
    if (!缩放锚点) return;

    const 缩放模式 = this.全局属性.缩放模式;

    const 点击坐标 = this.全局属性.点击坐标;
    const 鼠标坐标 = this.全局属性.鼠标坐标;

    // 对于旋转后的圆形、多边形、多角星、矩形、图像，需要在局部坐标系中计算缩放比例
    const 需要局部坐标系 =
      (形状对象.形状 === "圆" ||
        形状对象.形状 === "多边形" ||
        形状对象.形状 === "多角星" ||
        形状对象.形状 === "矩形" ||
        形状对象.形状 === "图像") &&
      形状对象.旋转弧度;

    // 计算缩放比例
    let 水平缩放比例 = 1;
    let 垂直缩放比例 = 1;

    if (需要局部坐标系) {
      // 在局部坐标系中计算缩放比例
      const 旋转弧度 = 形状对象.旋转弧度;
      const cos = Math.cos(-旋转弧度);
      const sin = Math.sin(-旋转弧度);

      // 将点击坐标和鼠标坐标转换到局部坐标系
      const 点击_dx = 点击坐标.x - 缩放锚点.x;
      const 点击_dy = 点击坐标.y - 缩放锚点.y;
      const 点击_局部x = 点击_dx * cos - 点击_dy * sin;
      const 点击_局部y = 点击_dx * sin + 点击_dy * cos;

      const 鼠标_dx = 鼠标坐标.x - 缩放锚点.x;
      const 鼠标_dy = 鼠标坐标.y - 缩放锚点.y;
      const 鼠标_局部x = 鼠标_dx * cos - 鼠标_dy * sin;
      const 鼠标_局部y = 鼠标_dx * sin + 鼠标_dy * cos;

      // 在局部坐标系中计算缩放比例
      if (缩放模式 === "horizontal") {
        水平缩放比例 = Math.abs(点击_局部x) > 0.1 ? 鼠标_局部x / 点击_局部x : 1;
      } else if (缩放模式 === "vertical") {
        垂直缩放比例 = Math.abs(点击_局部y) > 0.1 ? 鼠标_局部y / 点击_局部y : 1;
      } else if (缩放模式 === "proportional" || 是否等比) {
        const 初始距离 = Math.sqrt(点击_局部x * 点击_局部x + 点击_局部y * 点击_局部y);
        const 当前距离 = Math.sqrt(鼠标_局部x * 鼠标_局部x + 鼠标_局部y * 鼠标_局部y);
        const 缩放比例 = 初始距离 > 0 ? 当前距离 / 初始距离 : 1;

        // 检测翻转
        const 水平翻转 = 点击_局部x * 鼠标_局部x < 0;
        const 垂直翻转 = 点击_局部y * 鼠标_局部y < 0;

        水平缩放比例 = 水平翻转 ? -缩放比例 : 缩放比例;
        垂直缩放比例 = 垂直翻转 ? -缩放比例 : 缩放比例;
      } else {
        // 自由缩放
        水平缩放比例 = Math.abs(点击_局部x) > 0.1 ? 鼠标_局部x / 点击_局部x : 1;
        垂直缩放比例 = Math.abs(点击_局部y) > 0.1 ? 鼠标_局部y / 点击_局部y : 1;
      }
    } else {
      // 在世界坐标系中计算缩放比例（原有逻辑）
      if (缩放模式 === "horizontal") {
        // 水平缩放 - 保留方向以支持镜像翻转
        const 初始水平距离 = 点击坐标.x - 缩放锚点.x;
        const 当前水平距离 = 鼠标坐标.x - 缩放锚点.x;
        水平缩放比例 = Math.abs(初始水平距离) > 0.1 ? 当前水平距离 / 初始水平距离 : 1;
      } else if (缩放模式 === "vertical") {
        // 垂直缩放 - 保留方向以支持镜像翻转
        const 初始垂直距离 = 点击坐标.y - 缩放锚点.y;
        const 当前垂直距离 = 鼠标坐标.y - 缩放锚点.y;
        垂直缩放比例 = Math.abs(初始垂直距离) > 0.1 ? 当前垂直距离 / 初始垂直距离 : 1;
      } else {
        // 自由缩放或等比缩放
        const 初始距离 = Math.sqrt(Math.pow(点击坐标.x - 缩放锚点.x, 2) + Math.pow(点击坐标.y - 缩放锚点.y, 2));
        const 当前距离 = Math.sqrt(Math.pow(鼠标坐标.x - 缩放锚点.x, 2) + Math.pow(鼠标坐标.y - 缩放锚点.y, 2));

        if (缩放模式 === "proportional" || 是否等比) {
          // 等比缩放 - 需要检测镜像翻转
          const 缩放比例 = 初始距离 > 0 ? 当前距离 / 初始距离 : 1;

          // 检测水平和垂直方向是否发生翻转
          const 初始水平距离 = 点击坐标.x - 缩放锚点.x;
          const 初始垂直距离 = 点击坐标.y - 缩放锚点.y;
          const 当前水平距离 = 鼠标坐标.x - 缩放锚点.x;
          const 当前垂直距离 = 鼠标坐标.y - 缩放锚点.y;

          // 判断是否水平翻转（符号相反）
          const 水平翻转 = 初始水平距离 * 当前水平距离 < 0;
          // 判断是否垂直翻转（符号相反）
          const 垂直翻转 = 初始垂直距离 * 当前垂直距离 < 0;

          // 应用翻转到缩放比例
          水平缩放比例 = 水平翻转 ? -缩放比例 : 缩放比例;
          垂直缩放比例 = 垂直翻转 ? -缩放比例 : 缩放比例;
        } else {
          // 自由缩放 - 保留方向以支持镜像翻转
          const 初始水平距离 = 点击坐标.x - 缩放锚点.x;
          const 初始垂直距离 = 点击坐标.y - 缩放锚点.y;
          const 当前水平距离 = 鼠标坐标.x - 缩放锚点.x;
          const 当前垂直距离 = 鼠标坐标.y - 缩放锚点.y;

          水平缩放比例 = Math.abs(初始水平距离) > 0.1 ? 当前水平距离 / 初始水平距离 : 1;
          垂直缩放比例 = Math.abs(初始垂直距离) > 0.1 ? 当前垂直距离 / 初始垂直距离 : 1;
        }
      }
    }

    // 应用缩放
    this.应用缩放(形状对象, 水平缩放比例, 垂直缩放比例, 缩放锚点);
  }

  应用缩放(形状对象, 水平缩放比例, 垂直缩放比例, 缩放锚点) {
    if (形状对象.形状 === "圆") {
      // 半径取绝对值以确保始终为正
      形状对象.尺寸.水平半径 = Math.abs(形状对象.点击时尺寸.水平半径 * 水平缩放比例);
      形状对象.尺寸.垂直半径 = Math.abs(形状对象.点击时尺寸.垂直半径 * 垂直缩放比例);

      // 更新圆心位置
      if (形状对象.点击时坐标) {
        if (形状对象.旋转弧度) {
          // 对于旋转后的椭圆，在局部坐标系中计算圆心位置
          const 旋转弧度 = 形状对象.旋转弧度;
          const cos = Math.cos(-旋转弧度);
          const sin = Math.sin(-旋转弧度);

          // 将点击时的圆心坐标转换到局部坐标系
          const dx = 形状对象.点击时坐标.x - 缩放锚点.x;
          const dy = 形状对象.点击时坐标.y - 缩放锚点.y;
          const 局部x = dx * cos - dy * sin;
          const 局部y = dx * sin + dy * cos;

          // 在局部坐标系中应用缩放
          const 缩放后局部x = 局部x * 水平缩放比例;
          const 缩放后局部y = 局部y * 垂直缩放比例;

          // 转换回世界坐标系
          const cos_world = Math.cos(旋转弧度);
          const sin_world = Math.sin(旋转弧度);
          形状对象.坐标.x = 缩放锚点.x + 缩放后局部x * cos_world - 缩放后局部y * sin_world;
          形状对象.坐标.y = 缩放锚点.y + 缩放后局部x * sin_world + 缩放后局部y * cos_world;
        } else {
          // 对于未旋转的椭圆，直接在世界坐标系中计算
          形状对象.坐标.x = 缩放锚点.x + (形状对象.点击时坐标.x - 缩放锚点.x) * 水平缩放比例;
          形状对象.坐标.y = 缩放锚点.y + (形状对象.点击时坐标.y - 缩放锚点.y) * 垂直缩放比例;
        }
      }

      // 圆形不需要镜像旋转角度，因为半径已经取绝对值
      // 保持原始旋转角度不变
      if (形状对象.点击时旋转弧度 !== undefined) {
        形状对象.旋转弧度 = 形状对象.点击时旋转弧度;
      }
    } else if (形状对象.形状 === "多边形") {
      // 半径取绝对值以确保始终为正
      形状对象.尺寸.水平半径 = Math.abs(形状对象.点击时尺寸.水平半径 * 水平缩放比例);
      形状对象.尺寸.垂直半径 = Math.abs(形状对象.点击时尺寸.垂直半径 * 垂直缩放比例);

      // 更新中心位置
      if (形状对象.点击时坐标) {
        if (形状对象.旋转弧度) {
          // 对于旋转后的多边形，在局部坐标系中计算中心位置
          const 旋转弧度 = 形状对象.旋转弧度;
          const cos = Math.cos(-旋转弧度);
          const sin = Math.sin(-旋转弧度);

          const dx = 形状对象.点击时坐标.x - 缩放锚点.x;
          const dy = 形状对象.点击时坐标.y - 缩放锚点.y;
          const 局部x = dx * cos - dy * sin;
          const 局部y = dx * sin + dy * cos;

          const 缩放后局部x = 局部x * 水平缩放比例;
          const 缩放后局部y = 局部y * 垂直缩放比例;

          const cos_world = Math.cos(旋转弧度);
          const sin_world = Math.sin(旋转弧度);
          形状对象.坐标.x = 缩放锚点.x + 缩放后局部x * cos_world - 缩放后局部y * sin_world;
          形状对象.坐标.y = 缩放锚点.y + 缩放后局部x * sin_world + 缩放后局部y * cos_world;
        } else {
          // 对于未旋转的多边形，直接在世界坐标系中计算
          形状对象.坐标.x = 缩放锚点.x + (形状对象.点击时坐标.x - 缩放锚点.x) * 水平缩放比例;
          形状对象.坐标.y = 缩放锚点.y + (形状对象.点击时坐标.y - 缩放锚点.y) * 垂直缩放比例;
        }
      }
      // 处理起始弧度的镜像
      let 起始弧度 = 形状对象.点击时起始弧度;
      if (起始弧度 !== undefined) {
        // 如果水平翻转，起始弧度关于Y轴镜像
        if (水平缩放比例 < 0) {
          起始弧度 = Math.PI - 起始弧度;
        }
        // 如果垂直翻转，起始弧度关于X轴镜像
        if (垂直缩放比例 < 0) {
          起始弧度 = -起始弧度;
        }
        形状对象.起始弧度 = 起始弧度;
      }
      形状对象.顶点坐标组 = this.获取多边形顶点坐标组(
        形状对象.坐标.x,
        形状对象.坐标.y,
        形状对象.尺寸.水平半径,
        形状对象.尺寸.垂直半径,
        形状对象.边数,
        形状对象.起始弧度,
        形状对象.旋转弧度 || 0
      );
      形状对象.极值坐标 = this.获取极值坐标(形状对象);
    } else if (形状对象.形状 === "多角星") {
      // 半径取绝对值以确保始终为正
      形状对象.尺寸.外半径.水平 = Math.abs(形状对象.点击时尺寸.外半径.水平 * 水平缩放比例);
      形状对象.尺寸.外半径.垂直 = Math.abs(形状对象.点击时尺寸.外半径.垂直 * 垂直缩放比例);
      形状对象.尺寸.内半径.水平 = Math.abs(形状对象.点击时尺寸.内半径.水平 * 水平缩放比例);
      形状对象.尺寸.内半径.垂直 = Math.abs(形状对象.点击时尺寸.内半径.垂直 * 垂直缩放比例);

      // 更新中心位置
      if (形状对象.点击时坐标) {
        if (形状对象.旋转弧度) {
          // 对于旋转后的多角星，在局部坐标系中计算中心位置
          const 旋转弧度 = 形状对象.旋转弧度;
          const cos = Math.cos(-旋转弧度);
          const sin = Math.sin(-旋转弧度);

          const dx = 形状对象.点击时坐标.x - 缩放锚点.x;
          const dy = 形状对象.点击时坐标.y - 缩放锚点.y;
          const 局部x = dx * cos - dy * sin;
          const 局部y = dx * sin + dy * cos;

          const 缩放后局部x = 局部x * 水平缩放比例;
          const 缩放后局部y = 局部y * 垂直缩放比例;

          const cos_world = Math.cos(旋转弧度);
          const sin_world = Math.sin(旋转弧度);
          形状对象.坐标.x = 缩放锚点.x + 缩放后局部x * cos_world - 缩放后局部y * sin_world;
          形状对象.坐标.y = 缩放锚点.y + 缩放后局部x * sin_world + 缩放后局部y * cos_world;
        } else {
          // 对于未旋转的多角星，直接在世界坐标系中计算
          形状对象.坐标.x = 缩放锚点.x + (形状对象.点击时坐标.x - 缩放锚点.x) * 水平缩放比例;
          形状对象.坐标.y = 缩放锚点.y + (形状对象.点击时坐标.y - 缩放锚点.y) * 垂直缩放比例;
        }
      }
      // 处理起始弧度的镜像
      let 起始弧度 = 形状对象.点击时起始弧度;
      if (起始弧度 !== undefined) {
        // 如果水平翻转，起始弧度关于Y轴镜像
        if (水平缩放比例 < 0) {
          起始弧度 = Math.PI - 起始弧度;
        }
        // 如果垂直翻转，起始弧度关于X轴镜像
        if (垂直缩放比例 < 0) {
          起始弧度 = -起始弧度;
        }
        形状对象.起始弧度 = 起始弧度;
      }
      const 旋转弧度 = 形状对象.旋转弧度 || 0;
      形状对象.外顶点坐标组 = this.获取多边形顶点坐标组(
        形状对象.坐标.x,
        形状对象.坐标.y,
        形状对象.尺寸.外半径.水平,
        形状对象.尺寸.外半径.垂直,
        形状对象.边数,
        形状对象.起始弧度,
        旋转弧度
      );
      形状对象.内顶点坐标组 = this.获取多边形顶点坐标组(
        形状对象.坐标.x,
        形状对象.坐标.y,
        形状对象.尺寸.内半径.水平,
        形状对象.尺寸.内半径.垂直,
        形状对象.边数,
        形状对象.起始弧度 + Math.PI / 形状对象.边数,
        旋转弧度
      );
      形状对象.极值坐标 = this.获取极值坐标(形状对象);
    } else if (
      形状对象.形状 === "矩形" ||
      形状对象.形状 === "图像" ||
      形状对象.形状 === "直线" ||
      形状对象.形状 === "自由"
    ) {
      // 对于顶点坐标组，应用缩放比例（包括负值），实现镜像翻转
      if (形状对象.点击时顶点坐标组) {
        // 检查是否有旋转（矩形和图像需要特殊处理）
        if ((形状对象.形状 === "矩形" || 形状对象.形状 === "图像") && 形状对象.旋转弧度) {
          // 对于旋转后的矩形和图像，在局部坐标系中缩放顶点
          const 旋转弧度 = 形状对象.旋转弧度;
          const cos = Math.cos(-旋转弧度);
          const sin = Math.sin(-旋转弧度);

          for (let i = 0; i < 形状对象.顶点坐标组.length; i++) {
            // 将点击时的顶点转换到局部坐标系
            const dx = 形状对象.点击时顶点坐标组[i].x - 缩放锚点.x;
            const dy = 形状对象.点击时顶点坐标组[i].y - 缩放锚点.y;
            const 局部x = dx * cos - dy * sin;
            const 局部y = dx * sin + dy * cos;

            // 在局部坐标系中应用缩放
            const 缩放后局部x = 局部x * 水平缩放比例;
            const 缩放后局部y = 局部y * 垂直缩放比例;

            // 转换回世界坐标系
            const cos_world = Math.cos(旋转弧度);
            const sin_world = Math.sin(旋转弧度);
            形状对象.顶点坐标组[i].x = 缩放锚点.x + 缩放后局部x * cos_world - 缩放后局部y * sin_world;
            形状对象.顶点坐标组[i].y = 缩放锚点.y + 缩放后局部x * sin_world + 缩放后局部y * cos_world;
          }

          // 保持矩形和图像的旋转角度不变
          if (形状对象.点击时旋转弧度 !== undefined) {
            形状对象.旋转弧度 = 形状对象.点击时旋转弧度;
          }

          // 对于图像，还需要更新坐标、尺寸和中心
          if (形状对象.形状 === "图像") {
            形状对象.坐标.x = 形状对象.顶点坐标组[0].x;
            形状对象.坐标.y = 形状对象.顶点坐标组[0].y;
            形状对象.尺寸.宽 = Math.sqrt(
              Math.pow(形状对象.顶点坐标组[1].x - 形状对象.顶点坐标组[0].x, 2) +
                Math.pow(形状对象.顶点坐标组[1].y - 形状对象.顶点坐标组[0].y, 2)
            );
            形状对象.尺寸.高 = Math.sqrt(
              Math.pow(形状对象.顶点坐标组[3].x - 形状对象.顶点坐标组[0].x, 2) +
                Math.pow(形状对象.顶点坐标组[3].y - 形状对象.顶点坐标组[0].y, 2)
            );
          }
        } else {
          // 对于未旋转的矩形、图像、直线、自由路径，直接在世界坐标系中缩放
          for (let i = 0; i < 形状对象.顶点坐标组.length; i++) {
            形状对象.顶点坐标组[i].x = 缩放锚点.x + (形状对象.点击时顶点坐标组[i].x - 缩放锚点.x) * 水平缩放比例;
            形状对象.顶点坐标组[i].y = 缩放锚点.y + (形状对象.点击时顶点坐标组[i].y - 缩放锚点.y) * 垂直缩放比例;
          }

          // 对于图像，还需要更新坐标、尺寸和中心
          if (形状对象.形状 === "图像") {
            形状对象.坐标.x = 形状对象.顶点坐标组[0].x;
            形状对象.坐标.y = 形状对象.顶点坐标组[0].y;
            形状对象.尺寸.宽 = Math.abs(形状对象.顶点坐标组[1].x - 形状对象.顶点坐标组[0].x);
            形状对象.尺寸.高 = Math.abs(形状对象.顶点坐标组[3].y - 形状对象.顶点坐标组[0].y);
          }
        }
        形状对象.极值坐标 = this.获取极值坐标(形状对象);
        // 对于图像，更新中心坐标
        if (形状对象.形状 === "图像") {
          形状对象.中心 = 形状对象.极值坐标.中心;
        }
      }
    }
  }

  计算矩形旋转角度(形状对象) {
    if (
      (形状对象.形状 !== "矩形" && 形状对象.形状 !== "图像") ||
      !形状对象.顶点坐标组 ||
      形状对象.顶点坐标组.length !== 4
    ) {
      return 0;
    }

    // 计算第一条边（左上到右上）的角度
    const 顶点 = 形状对象.顶点坐标组;
    const dx = 顶点[1].x - 顶点[0].x;
    const dy = 顶点[1].y - 顶点[0].y;

    // 使用 atan2 计算角度
    let 角度 = Math.atan2(dy, dx);

    // 归一化到 [0, 2π)
    while (角度 < 0) 角度 += Math.PI * 2;
    while (角度 >= Math.PI * 2) 角度 -= Math.PI * 2;

    return 角度;
  }

  规范化矩形顶点顺序(形状对象) {
    // 🎯 图像不需要规范化！
    // 图像绘制完全基于顶点的几何向量，顶点索引可以"乱序"
    // 只要几何位置正确，图像就能正确显示和缩放
    if (形状对象.形状 === "图像") {
      return;
    }

    // 只规范化矩形
    if (形状对象.形状 !== "矩形" || !形状对象.顶点坐标组 || 形状对象.顶点坐标组.length !== 4) {
      return;
    }

    const 顶点 = 形状对象.顶点坐标组;

    // 保存原有的旋转角度
    const 原始旋转弧度 = 形状对象.旋转弧度 || 0;

    // 计算矩形中心点
    const 中心X = (顶点[0].x + 顶点[1].x + 顶点[2].x + 顶点[3].x) / 4;
    const 中心Y = (顶点[0].y + 顶点[1].y + 顶点[2].y + 顶点[3].y) / 4;

    // 先检测当前顶点的实际旋转角度
    const dx = 顶点[1].x - 顶点[0].x;
    const dy = 顶点[1].y - 顶点[0].y;
    let 当前旋转角度 = Math.atan2(dy, dx);
    // 归一化到 [0, 2π)
    while (当前旋转角度 < 0) 当前旋转角度 += Math.PI * 2;
    while (当前旋转角度 >= Math.PI * 2) 当前旋转角度 -= Math.PI * 2;

    // 检查当前角度与原始角度的差异
    let 角度差 = Math.abs(当前旋转角度 - 原始旋转弧度);
    // 考虑2π周期性
    if (角度差 > Math.PI) {
      角度差 = Math.PI * 2 - 角度差;
    }

    // 如果角度差接近180°，说明发生了镜像翻转，使用当前角度
    // 否则使用原始角度
    const 使用旋转角度 = 角度差 > Math.PI * 0.8 && 角度差 < Math.PI * 1.2 ? 当前旋转角度 : 原始旋转弧度;

    // 在局部坐标系中重新排序
    const cos = Math.cos(-使用旋转角度);
    const sin = Math.sin(-使用旋转角度);

    // 将顶点转换到局部坐标系，并确定它们的位置
    const 局部顶点 = [];
    for (let i = 0; i < 顶点.length; i++) {
      const dx = 顶点[i].x - 中心X;
      const dy = 顶点[i].y - 中心Y;
      const 局部x = dx * cos - dy * sin;
      const 局部y = dx * sin + dy * cos;
      局部顶点.push({
        原始索引: i,
        世界坐标: { x: 顶点[i].x, y: 顶点[i].y },
        局部x: 局部x,
        局部y: 局部y,
      });
    }

    // 根据局部坐标重新排序：左上、右上、右下、左下
    const 排序后顶点 = [];
    for (const 顶点数据 of 局部顶点) {
      const 在左侧 = 顶点数据.局部x < 0;
      const 在上方 = 顶点数据.局部y < 0;

      if (在左侧 && 在上方) {
        排序后顶点[0] = { x: 顶点数据.世界坐标.x, y: 顶点数据.世界坐标.y }; // 左上
      } else if (!在左侧 && 在上方) {
        排序后顶点[1] = { x: 顶点数据.世界坐标.x, y: 顶点数据.世界坐标.y }; // 右上
      } else if (!在左侧 && !在上方) {
        排序后顶点[2] = { x: 顶点数据.世界坐标.x, y: 顶点数据.世界坐标.y }; // 右下
      } else {
        排序后顶点[3] = { x: 顶点数据.世界坐标.x, y: 顶点数据.世界坐标.y }; // 左下
      }
    }

    形状对象.顶点坐标组 = 排序后顶点;

    // 更新极值坐标
    形状对象.极值坐标 = this.获取极值坐标(形状对象);

    // 使用之前确定的旋转角度（已经考虑了镜像翻转）
    形状对象.旋转弧度 = 使用旋转角度;

    // 对于图像，还需要更新坐标、中心和尺寸
    if (形状对象.形状 === "图像") {
      形状对象.坐标.x = 排序后顶点[0].x;
      形状对象.坐标.y = 排序后顶点[0].y;
      形状对象.中心 = 形状对象.极值坐标.中心;

      // 计算宽高（使用边长）
      const 宽度向量x = 排序后顶点[1].x - 排序后顶点[0].x;
      const 宽度向量y = 排序后顶点[1].y - 排序后顶点[0].y;
      const 高度向量x = 排序后顶点[3].x - 排序后顶点[0].x;
      const 高度向量y = 排序后顶点[3].y - 排序后顶点[0].y;

      形状对象.尺寸.宽 = Math.sqrt(宽度向量x * 宽度向量x + 宽度向量y * 宽度向量y);
      形状对象.尺寸.高 = Math.sqrt(高度向量x * 高度向量x + 高度向量y * 高度向量y);
    }
  }

  检查是否已缩放(形状) {
    if (!形状 || !形状.点击时尺寸) return false;

    const 阈值 = 0.1;
    if (形状.形状 === "圆") {
      return (
        Math.abs(形状.尺寸.水平半径 - 形状.点击时尺寸.水平半径) > 阈值 ||
        Math.abs(形状.尺寸.垂直半径 - 形状.点击时尺寸.垂直半径) > 阈值
      );
    } else if (形状.形状 === "多边形") {
      return (
        Math.abs(形状.尺寸.水平半径 - 形状.点击时尺寸.水平半径) > 阈值 ||
        Math.abs(形状.尺寸.垂直半径 - 形状.点击时尺寸.垂直半径) > 阈值
      );
    } else if (形状.形状 === "多角星") {
      return (
        Math.abs(形状.尺寸.外半径.水平 - 形状.点击时尺寸.外半径.水平) > 阈值 ||
        Math.abs(形状.尺寸.外半径.垂直 - 形状.点击时尺寸.外半径.垂直) > 阈值
      );
    } else if (形状.形状 === "矩形" || 形状.形状 === "图像" || 形状.形状 === "直线" || 形状.形状 === "自由") {
      if (形状.点击时顶点坐标组 && 形状.顶点坐标组.length === 形状.点击时顶点坐标组.length) {
        for (let i = 0; i < 形状.顶点坐标组.length; i++) {
          if (
            Math.abs(形状.顶点坐标组[i].x - 形状.点击时顶点坐标组[i].x) > 阈值 ||
            Math.abs(形状.顶点坐标组[i].y - 形状.点击时顶点坐标组[i].y) > 阈值
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  撤销缩放(操作记录) {
    const 形状 = 操作记录.形状;
    const 缩放前尺寸 = 操作记录.缩放前尺寸;
    const 缩放前坐标 = 操作记录.缩放前坐标;
    const 缩放前顶点坐标组 = 操作记录.缩放前顶点坐标组;
    const 缩放前旋转弧度 = 操作记录.缩放前旋转弧度;
    const 缩放前起始弧度 = 操作记录.缩放前起始弧度;

    if (形状.形状 === "圆") {
      形状.尺寸.水平半径 = 缩放前尺寸.水平半径;
      形状.尺寸.垂直半径 = 缩放前尺寸.垂直半径;
      if (缩放前坐标) {
        形状.坐标.x = 缩放前坐标.x;
        形状.坐标.y = 缩放前坐标.y;
      }
      // 恢复旋转弧度
      if (缩放前旋转弧度 !== undefined) {
        形状.旋转弧度 = 缩放前旋转弧度;
      }
    } else if (形状.形状 === "多边形") {
      形状.尺寸.水平半径 = 缩放前尺寸.水平半径;
      形状.尺寸.垂直半径 = 缩放前尺寸.垂直半径;
      if (缩放前坐标) {
        形状.坐标.x = 缩放前坐标.x;
        形状.坐标.y = 缩放前坐标.y;
      }
      // 恢复起始弧度
      if (缩放前起始弧度 !== undefined) {
        形状.起始弧度 = 缩放前起始弧度;
      }
      形状.顶点坐标组 = this.获取多边形顶点坐标组(
        形状.坐标.x,
        形状.坐标.y,
        形状.尺寸.水平半径,
        形状.尺寸.垂直半径,
        形状.边数,
        形状.起始弧度,
        形状.旋转弧度 || 0
      );
      形状.极值坐标 = this.获取极值坐标(形状);
    } else if (形状.形状 === "多角星") {
      形状.尺寸.外半径.水平 = 缩放前尺寸.外半径.水平;
      形状.尺寸.外半径.垂直 = 缩放前尺寸.外半径.垂直;
      形状.尺寸.内半径.水平 = 缩放前尺寸.内半径.水平;
      形状.尺寸.内半径.垂直 = 缩放前尺寸.内半径.垂直;
      if (缩放前坐标) {
        形状.坐标.x = 缩放前坐标.x;
        形状.坐标.y = 缩放前坐标.y;
      }
      // 恢复起始弧度
      if (缩放前起始弧度 !== undefined) {
        形状.起始弧度 = 缩放前起始弧度;
      }
      const 旋转弧度 = 形状.旋转弧度 || 0;
      形状.外顶点坐标组 = this.获取多边形顶点坐标组(
        形状.坐标.x,
        形状.坐标.y,
        形状.尺寸.外半径.水平,
        形状.尺寸.外半径.垂直,
        形状.边数,
        形状.起始弧度,
        旋转弧度
      );
      形状.内顶点坐标组 = this.获取多边形顶点坐标组(
        形状.坐标.x,
        形状.坐标.y,
        形状.尺寸.内半径.水平,
        形状.尺寸.内半径.垂直,
        形状.边数,
        形状.起始弧度 + Math.PI / 形状.边数,
        旋转弧度
      );
      形状.极值坐标 = this.获取极值坐标(形状);
    } else if (形状.形状 === "矩形" || 形状.形状 === "直线" || 形状.形状 === "自由") {
      if (缩放前顶点坐标组) {
        形状.顶点坐标组 = 缩放前顶点坐标组.map((坐标) => ({ ...坐标 }));
        形状.极值坐标 = this.获取极值坐标(形状);
      }
    } else if (形状.形状 === "图像") {
      // 恢复图像的顶点坐标组
      if (缩放前顶点坐标组) {
        形状.顶点坐标组 = 缩放前顶点坐标组.map((坐标) => ({ ...坐标 }));
      }
      // 恢复图像的坐标（左上角）
      if (缩放前坐标) {
        形状.坐标.x = 缩放前坐标.x;
        形状.坐标.y = 缩放前坐标.y;
      }
      // 恢复图像的尺寸
      if (缩放前尺寸) {
        形状.尺寸.宽 = 缩放前尺寸.宽;
        形状.尺寸.高 = 缩放前尺寸.高;
      }
      // 恢复旋转弧度
      if (缩放前旋转弧度 !== undefined) {
        形状.旋转弧度 = 缩放前旋转弧度;
      }
      // 重新计算极值坐标和中心
      形状.极值坐标 = this.获取极值坐标(形状);
      形状.中心 = 形状.极值坐标.中心;
    }
    this.更新路径(形状);
  }

  水平翻转形状(形状) {
    if (!形状) return;

    // 获取形状中心点
    let 极值 = 形状.极值坐标;
    if (!极值) {
      极值 = this.获取极值坐标(形状);
    }
    const 中心点 = 极值.中心;

    // 记录变换前的状态
    const 变换前数据 = {
      坐标: 形状.坐标 ? { ...形状.坐标 } : null,
      顶点坐标组: 形状.顶点坐标组 ? 形状.顶点坐标组.map((坐标) => ({ ...坐标 })) : null,
      外顶点坐标组: 形状.外顶点坐标组 ? 形状.外顶点坐标组.map((坐标) => ({ ...坐标 })) : null,
      内顶点坐标组: 形状.内顶点坐标组 ? 形状.内顶点坐标组.map((坐标) => ({ ...坐标 })) : null,
      旋转弧度: 形状.旋转弧度,
      起始弧度: 形状.起始弧度,
    };

    // 围绕中心点水平翻转
    if (形状.形状 === "圆") {
      // 圆：翻转旋转角度
      形状.旋转弧度 = Math.PI - 形状.旋转弧度;
    } else if (形状.形状 === "多边形" || 形状.形状 === "多角星") {
      // 多边形/多角星：翻转旋转弧度
      // 初始化旋转弧度（如果未定义）
      if (形状.旋转弧度 === undefined) {
        形状.旋转弧度 = 0;
      }
      // 初始化起始弧度（如果未定义）
      if (形状.起始弧度 === undefined) {
        形状.起始弧度 = -Math.PI / 2;
      }

      // 水平翻转
      形状.旋转弧度 = -形状.旋转弧度;

      // 用新的旋转弧度重新生成顶点坐标
      if (形状.形状 === "多边形") {
        形状.顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.水平半径,
          形状.尺寸.垂直半径,
          形状.边数,
          形状.起始弧度,
          形状.旋转弧度
        );
      } else if (形状.形状 === "多角星") {
        形状.外顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.外半径.水平,
          形状.尺寸.外半径.垂直,
          形状.边数,
          形状.起始弧度,
          形状.旋转弧度
        );
        形状.内顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.内半径.水平,
          形状.尺寸.内半径.垂直,
          形状.边数,
          形状.起始弧度 + Math.PI / 形状.边数,
          形状.旋转弧度
        );
      }
    } else if (形状.形状 === "矩形" || 形状.形状 === "图像" || 形状.形状 === "直线" || 形状.形状 === "自由") {
      // 顶点形状：翻转顶点
      形状.顶点坐标组 = 形状.顶点坐标组.map((坐标) => ({
        x: 中心点.x - (坐标.x - 中心点.x),
        y: 坐标.y,
      }));

      // 对于图像，更新坐标和中心
      if (形状.形状 === "图像") {
        形状.坐标.x = 形状.顶点坐标组[0].x;
        形状.坐标.y = 形状.顶点坐标组[0].y;
      }
    }

    // 更新极值坐标
    形状.极值坐标 = this.获取极值坐标(形状);

    // 对于图像，更新中心
    if (形状.形状 === "图像") {
      形状.中心 = 形状.极值坐标.中心;
    }

    // 矩形和图像翻转后规范化顶点顺序
    if (形状.形状 === "矩形" || 形状.形状 === "图像") {
      this.规范化矩形顶点顺序(形状);
      // 对于图像，还需要更新旋转弧度（用于交互框绘制）
      if (形状.形状 === "图像") {
        形状.旋转弧度 = this.计算矩形旋转角度(形状);
      }
    }

    // 更新路径
    this.更新路径(形状);
    this.清空画布();
    this.绘制基础形状对象组();

    // 重绘交互框
    if (形状 === this.全局属性.选中形状) {
      this.绘制交互框(形状);
    }

    // 记录操作以便撤销
    this.数据集.操作记录.push({
      操作类型: "水平翻转",
      形状: 形状,
      变换前数据: 变换前数据,
    });
    this.撤销按钮.classList.remove("禁用");
  }

  垂直翻转形状(形状) {
    if (!形状) return;

    // 获取形状中心点
    let 极值 = 形状.极值坐标;
    if (!极值) {
      极值 = this.获取极值坐标(形状);
    }
    const 中心点 = 极值.中心;

    // 记录变换前的状态
    const 变换前数据 = {
      坐标: 形状.坐标 ? { ...形状.坐标 } : null,
      顶点坐标组: 形状.顶点坐标组 ? 形状.顶点坐标组.map((坐标) => ({ ...坐标 })) : null,
      外顶点坐标组: 形状.外顶点坐标组 ? 形状.外顶点坐标组.map((坐标) => ({ ...坐标 })) : null,
      内顶点坐标组: 形状.内顶点坐标组 ? 形状.内顶点坐标组.map((坐标) => ({ ...坐标 })) : null,
      旋转弧度: 形状.旋转弧度,
      起始弧度: 形状.起始弧度,
    };

    // 围绕中心点垂直翻转
    if (形状.形状 === "圆") {
      // 圆：翻转旋转角度
      形状.旋转弧度 = -形状.旋转弧度;
    } else if (形状.形状 === "多边形" || 形状.形状 === "多角星") {
      // 多边形/多角星：翻转旋转弧度
      // 初始化旋转弧度（如果未定义）
      if (形状.旋转弧度 === undefined) {
        形状.旋转弧度 = 0;
      }
      // 初始化起始弧度（如果未定义）
      if (形状.起始弧度 === undefined) {
        形状.起始弧度 = -Math.PI / 2;
      }

      // 垂直翻转
      形状.旋转弧度 = Math.PI - 形状.旋转弧度;

      // 用新的旋转弧度重新生成顶点坐标
      if (形状.形状 === "多边形") {
        形状.顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.水平半径,
          形状.尺寸.垂直半径,
          形状.边数,
          形状.起始弧度,
          形状.旋转弧度
        );
      } else if (形状.形状 === "多角星") {
        形状.外顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.外半径.水平,
          形状.尺寸.外半径.垂直,
          形状.边数,
          形状.起始弧度,
          形状.旋转弧度
        );
        形状.内顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.内半径.水平,
          形状.尺寸.内半径.垂直,
          形状.边数,
          形状.起始弧度 + Math.PI / 形状.边数,
          形状.旋转弧度
        );
      }
    } else if (形状.形状 === "矩形" || 形状.形状 === "图像" || 形状.形状 === "直线" || 形状.形状 === "自由") {
      // 顶点形状：翻转顶点
      形状.顶点坐标组 = 形状.顶点坐标组.map((坐标) => ({
        x: 坐标.x,
        y: 中心点.y - (坐标.y - 中心点.y),
      }));

      // 对于图像，更新坐标和中心
      if (形状.形状 === "图像") {
        形状.坐标.x = 形状.顶点坐标组[0].x;
        形状.坐标.y = 形状.顶点坐标组[0].y;
      }
    }

    // 更新极值坐标
    形状.极值坐标 = this.获取极值坐标(形状);

    // 对于图像，更新中心
    if (形状.形状 === "图像") {
      形状.中心 = 形状.极值坐标.中心;
    }

    // 矩形和图像翻转后规范化顶点顺序
    if (形状.形状 === "矩形" || 形状.形状 === "图像") {
      this.规范化矩形顶点顺序(形状);
      // 对于图像，还需要更新旋转弧度（用于交互框绘制）
      if (形状.形状 === "图像") {
        形状.旋转弧度 = this.计算矩形旋转角度(形状);
      }
    }

    // 更新路径
    this.更新路径(形状);
    this.清空画布();
    this.绘制基础形状对象组();

    // 重绘交互框
    if (形状 === this.全局属性.选中形状) {
      this.绘制交互框(形状);
    }

    // 记录操作以便撤销
    this.数据集.操作记录.push({
      操作类型: "垂直翻转",
      形状: 形状,
      变换前数据: 变换前数据,
    });
    this.撤销按钮.classList.remove("禁用");
  }

  旋转形状90度(形状, 顺时针) {
    if (!形状) return;

    // 获取形状中心点
    let 极值 = 形状.极值坐标;
    if (!极值) {
      极值 = this.获取极值坐标(形状);
    }
    const 中心点 = 极值.中心;
    const 旋转弧度 = 顺时针 ? Math.PI / 2 : -Math.PI / 2;

    // 记录变换前的状态
    const 变换前数据 = {
      坐标: 形状.坐标 ? { ...形状.坐标 } : null,
      顶点坐标组: 形状.顶点坐标组 ? 形状.顶点坐标组.map((坐标) => ({ ...坐标 })) : null,
      旋转弧度: 形状.旋转弧度,
      起始弧度: 形状.起始弧度,
      尺寸: null,
    };

    // 围绕中心点旋转90度
    if (形状.形状 === "圆") {
      // 圆：只增加旋转角度，不交换半径（与鼠标旋转逻辑一致）
      形状.旋转弧度 += 旋转弧度;
      // 归一化旋转角度
      while (形状.旋转弧度 > Math.PI * 2) 形状.旋转弧度 -= Math.PI * 2;
      while (形状.旋转弧度 < 0) 形状.旋转弧度 += Math.PI * 2;
    } else if (形状.形状 === "多边形" || 形状.形状 === "多角星") {
      // 多边形/多角星：旋转椭圆（使用旋转弧度，与鼠标旋转逻辑一致）
      if (形状.旋转弧度 === undefined) {
        形状.旋转弧度 = 0;
      }
      形状.旋转弧度 += 旋转弧度;
      // 归一化旋转角度
      while (形状.旋转弧度 > Math.PI * 2) 形状.旋转弧度 -= Math.PI * 2;
      while (形状.旋转弧度 < 0) 形状.旋转弧度 += Math.PI * 2;
    } else if (形状.形状 === "矩形" || 形状.形状 === "图像" || 形状.形状 === "直线" || 形状.形状 === "自由") {
      // 顶点形状：旋转所有顶点
      const cos = Math.cos(旋转弧度);
      const sin = Math.sin(旋转弧度);
      形状.顶点坐标组 = 形状.顶点坐标组.map((坐标) => {
        const dx = 坐标.x - 中心点.x;
        const dy = 坐标.y - 中心点.y;
        return {
          x: 中心点.x + dx * cos - dy * sin,
          y: 中心点.y + dx * sin + dy * cos,
        };
      });

      // 对于图像，更新坐标
      if (形状.形状 === "图像") {
        形状.坐标.x = 形状.顶点坐标组[0].x;
        形状.坐标.y = 形状.顶点坐标组[0].y;
      }
    }

    // 更新路径和极值坐标
    if (形状.形状 === "圆") {
      // 圆形旋转后极值坐标会变化（对于椭圆），需要更新
      形状.极值坐标 = this.获取极值坐标(形状);
    } else if (形状.形状 === "多边形") {
      形状.顶点坐标组 = this.获取多边形顶点坐标组(
        形状.坐标.x,
        形状.坐标.y,
        形状.尺寸.水平半径,
        形状.尺寸.垂直半径,
        形状.边数,
        形状.起始弧度,
        形状.旋转弧度 || 0
      );
      形状.极值坐标 = this.获取极值坐标(形状);
    } else if (形状.形状 === "多角星") {
      const 旋转弧度 = 形状.旋转弧度 || 0;
      形状.外顶点坐标组 = this.获取多边形顶点坐标组(
        形状.坐标.x,
        形状.坐标.y,
        形状.尺寸.外半径.水平,
        形状.尺寸.外半径.垂直,
        形状.边数,
        形状.起始弧度,
        旋转弧度
      );
      形状.内顶点坐标组 = this.获取多边形顶点坐标组(
        形状.坐标.x,
        形状.坐标.y,
        形状.尺寸.内半径.水平,
        形状.尺寸.内半径.垂直,
        形状.边数,
        形状.起始弧度 + Math.PI / 形状.边数,
        旋转弧度
      );
      形状.极值坐标 = this.获取极值坐标(形状);
    } else if (形状.形状 === "矩形" || 形状.形状 === "图像" || 形状.形状 === "直线" || 形状.形状 === "自由") {
      形状.极值坐标 = this.获取极值坐标(形状);

      // 对于图像，更新中心
      if (形状.形状 === "图像") {
        形状.中心 = 形状.极值坐标.中心;
      }
    }

    // 矩形和图像旋转后规范化顶点顺序
    if (形状.形状 === "矩形" || 形状.形状 === "图像") {
      this.规范化矩形顶点顺序(形状);
      // 对于图像，还需要更新旋转弧度（用于交互框绘制）
      if (形状.形状 === "图像") {
        形状.旋转弧度 = this.计算矩形旋转角度(形状);
      }
    }

    this.更新路径(形状);
    this.清空画布();
    this.绘制基础形状对象组();

    // 重绘交互框
    if (形状 === this.全局属性.选中形状) {
      this.绘制交互框(形状);
    }

    // 记录操作以便撤销
    this.数据集.操作记录.push({
      操作类型: 顺时针 ? "顺时针旋转90度" : "逆时针旋转90度",
      形状: 形状,
      变换前数据: 变换前数据,
    });
    this.撤销按钮.classList.remove("禁用");
  }

  撤销变换(操作记录) {
    const 形状 = 操作记录.形状;
    const 变换前数据 = 操作记录.变换前数据;

    // 恢复坐标
    if (变换前数据.坐标) {
      形状.坐标 = { ...变换前数据.坐标 };
    }

    // 恢复顶点坐标组
    if (变换前数据.顶点坐标组) {
      形状.顶点坐标组 = 变换前数据.顶点坐标组.map((坐标) => ({ ...坐标 }));
    }

    // 恢复外顶点和内顶点坐标组（多角星）
    if (变换前数据.外顶点坐标组) {
      形状.外顶点坐标组 = 变换前数据.外顶点坐标组.map((坐标) => ({ ...坐标 }));
    }
    if (变换前数据.内顶点坐标组) {
      形状.内顶点坐标组 = 变换前数据.内顶点坐标组.map((坐标) => ({ ...坐标 }));
    }

    // 恢复旋转弧度
    if (变换前数据.旋转弧度 !== undefined) {
      形状.旋转弧度 = 变换前数据.旋转弧度;
    }

    // 恢复起始弧度
    if (变换前数据.起始弧度 !== undefined) {
      形状.起始弧度 = 变换前数据.起始弧度;
    }

    // 恢复尺寸
    if (变换前数据.尺寸) {
      if (形状.形状 === "圆" || 形状.形状 === "多边形") {
        形状.尺寸.水平半径 = 变换前数据.尺寸.水平半径;
        形状.尺寸.垂直半径 = 变换前数据.尺寸.垂直半径;
      } else if (形状.形状 === "多角星") {
        形状.尺寸.外半径 = { ...变换前数据.尺寸.外半径 };
        形状.尺寸.内半径 = { ...变换前数据.尺寸.内半径 };
      }
    }

    // 更新极值坐标和路径
    形状.极值坐标 = this.获取极值坐标(形状);

    // 对于图像，更新中心
    if (形状.形状 === "图像") {
      形状.中心 = 形状.极值坐标.中心;
    }

    this.更新路径(形状);
  }

  清空画布() {
    this.ctx.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);
    this.交互框 = null;
  }

  添加清空画布按钮点击事件() {
    const 清空画布按钮 = document.getElementById("清空画布按钮");
    清空画布按钮.addEventListener("click", () => {
      if (this.全局标志.按钮音效) {
        this.辅助.清空音效.currentTime = 0;
        this.辅助.清空音效.play().catch((e) => {
          console.log("按钮音效播放失败:", e);
        });
      }
      this.清空画布();
      this.全局属性.选中形状 = null;
      this.全局属性.悬停形状 = null;
      this.恢复用户全局颜色到拾色器();
      this.重置当前形状对象();
      this.数据集.基础形状对象组 = [];
      this.当前形状对象.顶点坐标组 = [];
      this.当前形状对象.外顶点坐标组 = [];
      this.当前形状对象.内顶点坐标组 = [];
      this.数据集.操作记录 = [];
      this.删除按钮.classList.add("禁用");
      this.撤销按钮.classList.add("禁用");
      this.禁用所有图形控制按钮();
    });
  }

  添加删除按钮点击事件() {
    const 删除按钮 = document.getElementById("删除");
    删除按钮.addEventListener("click", () => {
      if (this.全局属性.选中形状) {
        if (this.全局标志.按钮音效) {
          this.辅助.清空音效.currentTime = 0;
          this.辅助.清空音效.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.删除形状(this.全局属性.选中形状);
      }
    });
  }

  添加变换按钮点击事件() {
    // 水平翻转
    this.变换按钮组.水平翻转.addEventListener("click", () => {
      if (this.全局属性.选中形状) {
        if (this.全局标志.按钮音效) {
          this.辅助.点击音效对象.currentTime = 0;
          this.辅助.点击音效对象.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.水平翻转形状(this.全局属性.选中形状);
      }
    });

    // 垂直翻转
    this.变换按钮组.垂直翻转.addEventListener("click", () => {
      if (this.全局属性.选中形状) {
        if (this.全局标志.按钮音效) {
          this.辅助.点击音效对象.currentTime = 0;
          this.辅助.点击音效对象.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.垂直翻转形状(this.全局属性.选中形状);
      }
    });

    // 顺时针旋转90°
    this.变换按钮组.顺时针旋转.addEventListener("click", () => {
      if (this.全局属性.选中形状) {
        if (this.全局标志.按钮音效) {
          this.辅助.点击音效对象.currentTime = 0;
          this.辅助.点击音效对象.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.旋转形状90度(this.全局属性.选中形状, true);
      }
    });

    // 逆时针旋转90°
    this.变换按钮组.逆时针旋转.addEventListener("click", () => {
      if (this.全局属性.选中形状) {
        if (this.全局标志.按钮音效) {
          this.辅助.点击音效对象.currentTime = 0;
          this.辅助.点击音效对象.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.旋转形状90度(this.全局属性.选中形状, false);
      }
    });
  }

  添加复制按钮点击事件() {
    this.图形组合按钮组.复制.addEventListener("click", () => {
      if (this.全局属性.选中形状) {
        if (this.全局标志.按钮音效) {
          this.辅助.点击音效对象.currentTime = 0;
          this.辅助.点击音效对象.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.复制形状(this.全局属性.选中形状);
      }
    });
  }

  检查位置是否与现有形状接近(目标中心X, 目标中心Y, 排除形状 = null) {
    const 最小距离 = 20; // 如果两个形状的中心点距离小于这个值，认为太接近

    for (const 现有形状 of this.数据集.基础形状对象组) {
      if (现有形状 === 排除形状) continue;

      let 现有极值 = 现有形状.极值坐标;
      if (!现有极值) {
        现有极值 = this.获取极值坐标(现有形状);
      }

      if (现有极值 && 现有极值.中心) {
        const dx = 目标中心X - 现有极值.中心.x;
        const dy = 目标中心Y - 现有极值.中心.y;
        const 距离 = Math.sqrt(dx * dx + dy * dy);

        if (距离 < 最小距离) {
          return true; // 太接近了
        }
      }
    }

    return false; // 位置可用
  }

  复制形状(形状) {
    if (!形状) return;

    // 获取形状的极值坐标和中心点
    let 极值 = 形状.极值坐标;
    if (!极值) {
      极值 = this.获取极值坐标(形状);
    }
    const 中心点 = 极值.中心;
    const 形状宽度 = 极值.右 - 极值.左;
    const 形状高度 = 极值.下 - 极值.上;

    // 计算偏移量
    const canvas宽度 = this.canvas.offsetWidth;
    const canvas高度 = this.canvas.offsetHeight;

    // 默认偏移距离（可以根据形状大小调整）
    const 基础偏移 = 30;
    const 边界安全距离 = 10; // 距离边界的最小距离

    let 水平方向 = 0;
    let 垂直方向 = 0;

    // 根据中点位置确定偏移方向
    if (中心点.x <= canvas宽度 / 2) {
      水平方向 = 1; // 向右
    } else {
      水平方向 = -1; // 向左
    }

    if (中心点.y <= canvas高度 / 2) {
      垂直方向 = 1; // 向下
    } else {
      垂直方向 = -1; // 向上
    }

    // 寻找一个不与现有形状重叠且在canvas内的位置（合并重叠与边界判断）
    let 水平偏移 = 水平方向 * 基础偏移;
    let 垂直偏移 = 垂直方向 * 基础偏移;
    let 目标中心X = 中心点.x + 水平偏移;
    let 目标中心Y = 中心点.y + 垂直偏移;

    const 最大搜索步数 = Math.ceil((Math.max(canvas宽度, canvas高度) * 2) / 基础偏移);
    let 已走步数 = 0;

    while (已走步数 < 最大搜索步数) {
      // 计算边界
      const 新形状左边界 = 目标中心X - 形状宽度 / 2;
      const 新形状右边界 = 目标中心X + 形状宽度 / 2;
      const 新形状上边界 = 目标中心Y - 形状高度 / 2;
      const 新形状下边界 = 目标中心Y + 形状高度 / 2;

      const 越左 = 新形状左边界 < 边界安全距离;
      const 越右 = 新形状右边界 > canvas宽度 - 边界安全距离;
      const 越上 = 新形状上边界 < 边界安全距离;
      const 越下 = 新形状下边界 > canvas高度 - 边界安全距离;

      const 溢出 = 越左 || 越右 || 越上 || 越下;
      const 重叠 = this.检查位置是否与现有形状接近(目标中心X, 目标中心Y, 形状);

      if (!溢出 && !重叠) break; // 满足条件，停止搜索

      // 若溢出，则反转对应轴方向
      if (越左) 水平方向 = 1; // 往右走
      if (越右) 水平方向 = -1; // 往左走
      if (越上) 垂直方向 = 1; // 往下走
      if (越下) 垂直方向 = -1; // 往上走

      // 前进一步（按当前方向推进一格）
      水平偏移 += 水平方向 * 基础偏移;
      垂直偏移 += 垂直方向 * 基础偏移;
      目标中心X = 中心点.x + 水平偏移;
      目标中心Y = 中心点.y + 垂直偏移;

      已走步数++;
    }

    // 深度克隆形状对象（图像类型需特殊处理）
    let 新形状;

    if (形状.形状 === "图像") {
      // 图像类型：手动创建快照（图像对象保持引用）
      新形状 = {
        形状: 形状.形状,
        图像对象: 形状.图像对象, // 图像对象保持引用
        坐标: { x: 形状.坐标.x, y: 形状.坐标.y },
        中心: { x: 形状.中心.x, y: 形状.中心.y },
        尺寸: {
          宽: 形状.尺寸.宽,
          高: 形状.尺寸.高,
        },
        旋转弧度: 形状.旋转弧度,
        已选中: false,
        已悬停: false,
        顶点坐标组: 形状.顶点坐标组.map((v) => ({ x: v.x, y: v.y })),
        按下时坐标: null,
        按下时顶点坐标组: null,
        描边色: 形状.描边色,
        填充色: 形状.填充色,
        描边宽度: 形状.描边宽度,
        路径: null,
      };
    } else {
      // 其他形状：使用 structuredClone
      const path = 形状.路径;
      形状.路径 = null;
      新形状 = structuredClone(形状);
      形状.路径 = path;
      新形状.路径 = null;

      // 取消选中和悬停状态
      新形状.已选中 = false;
      新形状.已悬停 = false;
    }

    // 根据形状类型应用偏移
    if (形状.形状 === "圆") {
      新形状.坐标 = {
        x: 形状.坐标.x + 水平偏移,
        y: 形状.坐标.y + 垂直偏移,
      };
    } else if (形状.形状 === "多边形") {
      新形状.坐标 = {
        x: 形状.坐标.x + 水平偏移,
        y: 形状.坐标.y + 垂直偏移,
      };
      新形状.顶点坐标组 = this.获取多边形顶点坐标组(
        新形状.坐标.x,
        新形状.坐标.y,
        新形状.尺寸.水平半径,
        新形状.尺寸.垂直半径,
        新形状.边数,
        新形状.起始弧度,
        新形状.旋转弧度 || 0
      );
    } else if (形状.形状 === "多角星") {
      新形状.坐标 = {
        x: 形状.坐标.x + 水平偏移,
        y: 形状.坐标.y + 垂直偏移,
      };
      const 旋转弧度 = 新形状.旋转弧度 || 0;
      新形状.外顶点坐标组 = this.获取多边形顶点坐标组(
        新形状.坐标.x,
        新形状.坐标.y,
        新形状.尺寸.外半径.水平,
        新形状.尺寸.外半径.垂直,
        新形状.边数,
        新形状.起始弧度,
        旋转弧度
      );
      新形状.内顶点坐标组 = this.获取多边形顶点坐标组(
        新形状.坐标.x,
        新形状.坐标.y,
        新形状.尺寸.内半径.水平,
        新形状.尺寸.内半径.垂直,
        新形状.边数,
        新形状.起始弧度 + Math.PI / 新形状.边数,
        旋转弧度
      );
    } else if (形状.形状 === "矩形" || 形状.形状 === "直线" || 形状.形状 === "自由") {
      // 对于基于顶点的形状，偏移所有顶点
      新形状.顶点坐标组 = 形状.顶点坐标组.map((坐标) => ({
        x: 坐标.x + 水平偏移,
        y: 坐标.y + 垂直偏移,
      }));
    } else if (形状.形状 === "图像") {
      // 对于图像，偏移所有顶点、坐标和中心
      新形状.顶点坐标组 = 形状.顶点坐标组.map((坐标) => ({
        x: 坐标.x + 水平偏移,
        y: 坐标.y + 垂直偏移,
      }));
      新形状.坐标 = {
        x: 形状.坐标.x + 水平偏移,
        y: 形状.坐标.y + 垂直偏移,
      };
      新形状.中心 = {
        x: 形状.中心.x + 水平偏移,
        y: 形状.中心.y + 垂直偏移,
      };
    }

    // 更新新形状的极值坐标和路径
    新形状.极值坐标 = this.获取极值坐标(新形状);
    this.更新路径(新形状);

    // 将新形状添加到形状组
    const 新形状索引 = this.数据集.基础形状对象组.length;
    this.数据集.基础形状对象组.push(新形状);

    // 记录操作以便撤销
    this.数据集.操作记录.push({
      操作类型: "复制形状",
      原形状: 形状,
      新形状索引: 新形状索引,
    });

    // 重新绘制
    this.清空画布();
    this.绘制基础形状对象组();

    // 启用撤销按钮
    this.撤销按钮.classList.remove("禁用");
  }

  添加撤销按钮点击事件() {
    const 撤销按钮 = document.getElementById("撤销");
    撤销按钮.addEventListener("click", () => {
      if (this.全局标志.按钮音效) {
        this.辅助.点击音效对象.currentTime = 0;
        this.辅助.点击音效对象.play().catch((e) => {
          console.log("按钮音效播放失败:", e);
        });
      }
      this.撤销();
    });
  }

  撤销() {
    if (
      this.数据集.操作记录.length <= 0 &&
      this.当前形状对象.形状 === "直线" &&
      this.当前形状对象.顶点坐标组.length <= 0
    )
      return;
    if (
      this.数据集.基础形状对象组.length <= 0 &&
      !(this.当前形状对象.形状 === "直线" && this.当前形状对象.顶点坐标组.length > 0) &&
      this.数据集.操作记录.length <= 0
    ) {
      return;
    }

    if (this.当前形状对象.形状 === "直线" && this.当前形状对象.顶点坐标组.length >= 1) {
      this.当前形状对象.顶点坐标组.pop();
      this.清空画布();
      this.绘制基础形状对象组();
      if (this.当前形状对象.顶点坐标组.length >= 2) {
        this.绘制直线(this.当前形状对象.顶点坐标组, this.全局属性.描边色, this.全局属性.描边宽度);
      }
      if (this.当前形状对象.顶点坐标组.length >= 1) {
        if (this.全局标志.辅助视觉效果) {
          const 最后坐标 = this.当前形状对象.顶点坐标组[this.当前形状对象.顶点坐标组.length - 1];
          if (this.全局标志.辅助视觉效果) {
            this.绘制辅助虚线(最后坐标.x, 最后坐标.y, this.全局属性.鼠标坐标.x, this.全局属性.鼠标坐标.y);
          }
          for (const 坐标 of this.当前形状对象.顶点坐标组) {
            this.绘制辅助点(坐标.x, 坐标.y);
          }
        }
      }
      if (this.当前形状对象.顶点坐标组.length <= 0) {
        this.撤销按钮.classList.add("禁用");
      }
      return;
    }

    const 最后操作 = this.数据集.操作记录[this.数据集.操作记录.length - 1];
    const 最后形状 = this.数据集.基础形状对象组[this.数据集.基础形状对象组.length - 1];
    if (最后操作.操作类型 === "添加基础形状") {
      if (!this.当前形状对象.形状 || this.当前形状对象.顶点坐标组.length <= 0) {
        if (最后形状.形状 === "直线") {
          最后形状.顶点坐标组.pop();
          if (最后形状.顶点坐标组.length <= 1) {
            this.数据集.基础形状对象组.pop();
            this.数据集.操作记录.pop();
          }
          this.更新路径(最后形状);
          this.全局属性.选中形状 = null;
          this.恢复用户全局颜色到拾色器();
          this.清空画布();
          this.绘制基础形状对象组();
          if (this.数据集.操作记录.length <= 0) {
            this.撤销按钮.classList.add("禁用");
          }
          return;
        } else {
          if (最后形状 === this.全局属性.选中形状) {
            this.全局属性.选中形状 = null;
            this.恢复用户全局颜色到拾色器();
            this.重置当前形状对象();
          }
          this.数据集.基础形状对象组.pop();
        }
        if (this.数据集.基础形状对象组.length <= 1) {
          this.图层处理按钮组.向上一层.parentElement.classList.add("禁用");
          this.图层处理按钮组.向下一层.parentElement.classList.add("禁用");
          this.图层处理按钮组.置于底层.parentElement.classList.add("禁用");
          this.图层处理按钮组.置于顶层.parentElement.classList.add("禁用");
        }
      }
    } else if (最后操作.操作类型 === "交换图层") {
      [this.数据集.基础形状对象组[最后操作.操作数据[0]], this.数据集.基础形状对象组[最后操作.操作数据[1]]] = [
        this.数据集.基础形状对象组[最后操作.操作数据[1]],
        this.数据集.基础形状对象组[最后操作.操作数据[0]],
      ];
      this.根据选中形状索引修改处理按钮状态();
    } else if (最后操作.操作类型 === "置于顶层") {
      const 置换元素 = this.数据集.基础形状对象组.pop();
      this.数据集.基础形状对象组.splice(最后操作.操作数据, 0, 置换元素);
      this.根据选中形状索引修改处理按钮状态();
    } else if (最后操作.操作类型 === "置于底层") {
      const 置换元素 = this.数据集.基础形状对象组.shift();
      this.数据集.基础形状对象组.splice(最后操作.操作数据, 0, 置换元素);
      this.根据选中形状索引修改处理按钮状态();
    } else if (最后操作.操作类型 === "删除基础形状") {
      this.数据集.基础形状对象组.splice(最后操作.操作数据, 0, 最后操作.被删除形状对象);
      最后操作.被删除形状对象.已悬停 = false;
      最后操作.被删除形状对象.已选中 = false;
      if (this.全局属性.选中形状 === 最后操作.被删除形状对象) {
        this.全局属性.选中形状 = null;
        this.恢复用户全局颜色到拾色器();
      }
      const 悬停形状 = this.鼠标位于形状内();
      if (悬停形状) {
        悬停形状.已悬停 = true;
      }
      if (this.数据集.基础形状对象组.length > 1 && this.全局属性.选中形状) {
        const 选中索引 = this.数据集.基础形状对象组.indexOf(this.全局属性.选中形状);
        if (选中索引 <= 0) {
          this.图层处理按钮组.向下一层.parentElement.classList.add("禁用");
          this.图层处理按钮组.置于底层.parentElement.classList.add("禁用");
          this.图层处理按钮组.向上一层.parentElement.classList.remove("禁用");
          this.图层处理按钮组.置于顶层.parentElement.classList.remove("禁用");
        } else if (选中索引 >= this.数据集.基础形状对象组.length - 1) {
          this.图层处理按钮组.向上一层.parentElement.classList.add("禁用");
          this.图层处理按钮组.置于顶层.parentElement.classList.add("禁用");
          this.图层处理按钮组.向下一层.parentElement.classList.remove("禁用");
          this.图层处理按钮组.置于底层.parentElement.classList.remove("禁用");
        } else {
          this.图层处理按钮组.向上一层.parentElement.classList.remove("禁用");
          this.图层处理按钮组.向下一层.parentElement.classList.remove("禁用");
          this.图层处理按钮组.置于底层.parentElement.classList.remove("禁用");
          this.图层处理按钮组.置于顶层.parentElement.classList.remove("禁用");
        }
      }
    } else if (最后操作.操作类型 === "移动") {
      if (最后操作.坐标) {
        最后操作.形状.坐标 = 最后操作.坐标;
        if (最后操作.形状.形状 === "多边形") {
          最后操作.形状.顶点坐标组 = this.获取多边形顶点坐标组(
            最后操作.形状.坐标.x,
            最后操作.形状.坐标.y,
            最后操作.形状.尺寸.水平半径,
            最后操作.形状.尺寸.垂直半径,
            最后操作.形状.边数,
            最后操作.形状.起始弧度
          );
        } else if (最后操作.形状.形状 === "多角星") {
          最后操作.形状.外顶点坐标组 = this.获取多边形顶点坐标组(
            最后操作.形状.坐标.x,
            最后操作.形状.坐标.y,
            最后操作.形状.尺寸.外半径.水平,
            最后操作.形状.尺寸.外半径.垂直,
            最后操作.形状.边数,
            最后操作.形状.起始弧度
          );
          最后操作.形状.外顶点坐标组 = this.获取多边形顶点坐标组(
            最后操作.形状.坐标.x,
            最后操作.形状.坐标.y,
            最后操作.形状.尺寸.内半径.水平,
            最后操作.形状.尺寸.内半径.垂直,
            最后操作.形状.边数,
            最后操作.形状.起始弧度 + Math.PI / 最后操作.形状.边数
          );
        }
        this.更新路径(最后操作.形状);
      } else if (最后操作.顶点坐标组) {
        最后操作.形状.顶点坐标组 = [...最后操作.顶点坐标组];
        // 对于图像，还需要更新坐标和中心
        if (最后操作.形状.形状 === "图像") {
          最后操作.形状.坐标.x = 最后操作.形状.顶点坐标组[0].x;
          最后操作.形状.坐标.y = 最后操作.形状.顶点坐标组[0].y;
        }
        this.更新路径(最后操作.形状);
      }
      if (
        最后操作.形状.形状 === "多边形" ||
        最后操作.形状.形状 === "多角星" ||
        最后操作.形状.形状 === "直线" ||
        最后操作.形状.形状 === "自由" ||
        最后操作.形状.形状 === "矩形" ||
        最后操作.形状.形状 === "图像"
      ) {
        最后操作.形状.极值坐标 = this.获取极值坐标(最后操作.形状);
        // 对于图像，更新中心坐标
        if (最后操作.形状.形状 === "图像") {
          最后操作.形状.中心 = 最后操作.形状.极值坐标.中心;
        }
      }
    } else if (最后操作.操作类型 === "旋转") {
      const 形状 = 最后操作.形状;
      const 旋转前数据 = 最后操作.旋转前数据;

      if (形状.形状 === "圆") {
        形状.旋转弧度 = 旋转前数据.旋转弧度;
      } else if (形状.形状 === "多边形" || 形状.形状 === "多角星") {
        形状.起始弧度 = 旋转前数据.起始弧度;
        if (形状.形状 === "多边形") {
          形状.顶点坐标组 = this.获取多边形顶点坐标组(
            形状.坐标.x,
            形状.坐标.y,
            形状.尺寸.水平半径,
            形状.尺寸.垂直半径,
            形状.边数,
            形状.起始弧度
          );
        } else if (形状.形状 === "多角星") {
          形状.外顶点坐标组 = this.获取多边形顶点坐标组(
            形状.坐标.x,
            形状.坐标.y,
            形状.尺寸.外半径.水平,
            形状.尺寸.外半径.垂直,
            形状.边数,
            形状.起始弧度
          );
          形状.内顶点坐标组 = this.获取多边形顶点坐标组(
            形状.坐标.x,
            形状.坐标.y,
            形状.尺寸.内半径.水平,
            形状.尺寸.内半径.垂直,
            形状.边数,
            形状.起始弧度 + Math.PI / 形状.边数
          );
        }
        形状.极值坐标 = this.获取极值坐标(形状);
      } else if (形状.形状 === "矩形" || 形状.形状 === "图像" || 形状.形状 === "直线" || 形状.形状 === "自由") {
        形状.顶点坐标组 = 旋转前数据.顶点坐标组.map((坐标) => ({ ...坐标 }));
        形状.极值坐标 = this.获取极值坐标(形状);
        // 对于矩形和图像，恢复旋转弧度
        if ((形状.形状 === "矩形" || 形状.形状 === "图像") && 旋转前数据.旋转弧度 !== undefined) {
          形状.旋转弧度 = 旋转前数据.旋转弧度;
        }
        // 对于图像，更新坐标和中心
        if (形状.形状 === "图像") {
          形状.坐标.x = 形状.顶点坐标组[0].x;
          形状.坐标.y = 形状.顶点坐标组[0].y;
          形状.中心 = 形状.极值坐标.中心;
        }
      }
      this.更新路径(形状);
    } else if (最后操作.操作类型 === "缩放") {
      this.撤销缩放(最后操作);
    } else if (
      最后操作.操作类型 === "水平翻转" ||
      最后操作.操作类型 === "垂直翻转" ||
      最后操作.操作类型 === "顺时针旋转90度" ||
      最后操作.操作类型 === "逆时针旋转90度"
    ) {
      this.撤销变换(最后操作);
    } else if (最后操作.操作类型 === "复制形状") {
      // 撤销复制操作：删除复制出来的形状
      const 被复制形状 = this.数据集.基础形状对象组[最后操作.新形状索引];
      if (被复制形状 === this.全局属性.选中形状) {
        this.全局属性.选中形状 = null;
        this.恢复用户全局颜色到拾色器();
        this.重置当前形状对象();
      }
      this.数据集.基础形状对象组.splice(最后操作.新形状索引, 1);

      if (this.数据集.基础形状对象组.length <= 1) {
        this.图层处理按钮组.向上一层.parentElement.classList.add("禁用");
        this.图层处理按钮组.向下一层.parentElement.classList.add("禁用");
        this.图层处理按钮组.置于底层.parentElement.classList.add("禁用");
        this.图层处理按钮组.置于顶层.parentElement.classList.add("禁用");
      }
    } else if (最后操作.操作类型 === "添加图像") {
      // 撤销添加图像操作：删除所有添加的图像
      // 按照索引从大到小的顺序删除，避免索引变化影响
      const 按索引降序排列 = 最后操作.图像对象组.sort((a, b) => b.索引 - a.索引);
      for (const 图像信息 of 按索引降序排列) {
        const 图像对象 = this.数据集.基础形状对象组[图像信息.索引];
        if (图像对象 === this.全局属性.选中形状) {
          this.全局属性.选中形状 = null;
          this.恢复用户全局颜色到拾色器();
          this.重置当前形状对象();
        }
        this.数据集.基础形状对象组.splice(图像信息.索引, 1);
      }

      if (this.数据集.基础形状对象组.length <= 1) {
        this.图层处理按钮组.向上一层.parentElement.classList.add("禁用");
        this.图层处理按钮组.向下一层.parentElement.classList.add("禁用");
        this.图层处理按钮组.置于底层.parentElement.classList.add("禁用");
        this.图层处理按钮组.置于顶层.parentElement.classList.add("禁用");
      }
    }
    this.数据集.操作记录.pop();
    if (this.数据集.操作记录.length <= 0) {
      this.撤销按钮.classList.add("禁用");
    }
    if (this.数据集.基础形状对象组.length <= 0 || !this.全局属性.选中形状) {
      this.删除按钮.classList.add("禁用");
    }
    this.清空画布();
    this.绘制基础形状对象组();

    // 重绘交互框（如果有选中形状或框选形状对象）
    if (this.数据集.框选形状对象) {
      this.绘制交互框(this.数据集.框选形状对象, 1, true);
      // 绘制所有被框选形状的预览交互框
      for (const 形状 of this.数据集.框选形状对象.对象组) {
        const 原始形状 = this.数据集.基础形状对象组[形状.索引];
        if (原始形状) {
          this.绘制交互框(原始形状, 0.5, false);
        }
      }
    } else if (this.全局属性.选中形状) {
      this.绘制交互框(this.全局属性.选中形状);
    }

    if (!this.全局属性.选中形状) {
      this.禁用所有图形控制按钮();
    }
  }

  重置当前形状对象() {
    this.当前形状对象 = {
      形状: null,
      坐标: { x: null, y: null },
      顶点坐标组: [],
      尺寸: null,
      圆角: 0,
      描边色: "transparent",
      填充色: "transparent",
      描边宽度: this.全局属性.描边宽度,
      路径: null,
    };
  }

  删除形状(形状对象) {
    if (!形状对象) return;
    const 选中索引 = this.数据集.基础形状对象组.indexOf(形状对象);
    this.数据集.基础形状对象组.splice(选中索引, 1);
    this.数据集.操作记录.push({
      操作类型: "删除基础形状",
      操作数据: 选中索引,
      被删除形状对象: 形状对象,
    });
    if (形状对象 === this.全局属性.选中形状) {
      this.全局属性.选中形状 = null;
      this.恢复用户全局颜色到拾色器();
      this.重置当前形状对象();
      this.根据选中形状索引修改处理按钮状态();
    }
    this.清空画布();
    this.绘制基础形状对象组();
    this.删除按钮.classList.add("禁用");
  }

  绘制单个形状(形状对象) {
    if (!形状对象) return;

    // 特殊处理：图像类型直接绘制图像（图像不依赖路径）
    if (形状对象.形状 === "图像" && 形状对象.图像对象) {
      this.ctx.save();

      // 使用顶点坐标绘制图像（支持旋转和缩放、翻转）
      if (形状对象.顶点坐标组 && 形状对象.顶点坐标组.length === 4) {
        const v0 = 形状对象.顶点坐标组[0]; // 左上
        const v1 = 形状对象.顶点坐标组[1]; // 右上
        const v2 = 形状对象.顶点坐标组[2]; // 右下
        const v3 = 形状对象.顶点坐标组[3]; // 左下

        // 计算宽度和高度向量
        const 宽度向量x = v1.x - v0.x;
        const 宽度向量y = v1.y - v0.y;
        const 高度向量x = v3.x - v0.x;
        const 高度向量y = v3.y - v0.y;

        // 计算实际宽高
        const 实际宽度 = Math.sqrt(宽度向量x * 宽度向量x + 宽度向量y * 宽度向量y);
        const 实际高度 = Math.sqrt(高度向量x * 高度向量x + 高度向量y * 高度向量y);

        // 如果宽高不为0，才绘制
        if (实际宽度 > 0 && 实际高度 > 0) {
          // 使用setTransform直接设置变换矩阵（需要考虑dpr）
          const a = (宽度向量x / 实际宽度) * this.dpr;
          const b = (宽度向量y / 实际宽度) * this.dpr;
          const c = (高度向量x / 实际高度) * this.dpr;
          const d = (高度向量y / 实际高度) * this.dpr;
          const e = v0.x * this.dpr;
          const f = v0.y * this.dpr;

          this.ctx.setTransform(a, b, c, d, e, f);

          // 绘制图像
          this.ctx.drawImage(形状对象.图像对象, 0, 0, 实际宽度, 实际高度);

          // 如果有描边，绘制矩形边框
          if (形状对象.描边宽度 > 0) {
            this.ctx.strokeStyle = 形状对象.描边色;
            this.ctx.lineWidth = 形状对象.描边宽度;
            this.ctx.strokeRect(0, 0, 实际宽度, 实际高度);
          }

          // 恢复变换矩阵（恢复到dpr scale状态）
          this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        }
      }

      this.ctx.restore();
    } else if (形状对象.路径) {
      // 其他形状使用路径绘制（需要路径存在）
      this.ctx.strokeStyle = 形状对象.描边色;
      this.ctx.fillStyle = 形状对象.填充色;
      this.ctx.lineWidth = 形状对象.描边宽度;
      this.ctx.stroke(形状对象.路径);
      if (形状对象.形状 !== "直线" && 形状对象.形状 !== "自由") {
        this.ctx.fill(形状对象.路径);
      }
    }

    // 选中时绘制完整交互框，悬停时绘制半透明无句柄交互框，Alt预览时也绘制半透明交互框
    if (形状对象.已选中) {
      this.绘制交互框(形状对象, 1.0, true);
    } else if (形状对象.已悬停) {
      this.绘制交互框(形状对象, 0.4, false);
    } else if (形状对象.Alt预览中) {
      this.绘制交互框(形状对象, 0.4, false);
    }
  }

  绘制基础形状对象组() {
    if (this.数据集.基础形状对象组.length <= 0) return;
    for (const 形状对象 of this.数据集.基础形状对象组) {
      if (!形状对象.路径) continue;

      // 特殊处理：图像类型直接绘制图像
      if (形状对象.形状 === "图像" && 形状对象.图像对象) {
        this.ctx.save();

        // 使用顶点坐标绘制图像（支持旋转和缩放、翻转）
        if (形状对象.顶点坐标组 && 形状对象.顶点坐标组.length === 4) {
          const v0 = 形状对象.顶点坐标组[0]; // 左上
          const v1 = 形状对象.顶点坐标组[1]; // 右上
          const v2 = 形状对象.顶点坐标组[2]; // 右下
          const v3 = 形状对象.顶点坐标组[3]; // 左下

          // 计算宽度和高度向量
          const 宽度向量x = v1.x - v0.x;
          const 宽度向量y = v1.y - v0.y;
          const 高度向量x = v3.x - v0.x;
          const 高度向量y = v3.y - v0.y;

          // 计算实际宽高
          const 实际宽度 = Math.sqrt(宽度向量x * 宽度向量x + 宽度向量y * 宽度向量y);
          const 实际高度 = Math.sqrt(高度向量x * 高度向量x + 高度向量y * 高度向量y);

          // 如果宽高不为0，才绘制
          if (实际宽度 > 0 && 实际高度 > 0) {
            // 使用setTransform直接设置变换矩阵（需要考虑dpr）
            // 变换矩阵：[a, b, c, d, e, f] 表示 [[a, c, e], [b, d, f], [0, 0, 1]]
            // 其中 (a, b) 是X轴向量，(c, d) 是Y轴向量，(e, f) 是平移
            const a = (宽度向量x / 实际宽度) * this.dpr;
            const b = (宽度向量y / 实际宽度) * this.dpr;
            const c = (高度向量x / 实际高度) * this.dpr;
            const d = (高度向量y / 实际高度) * this.dpr;
            const e = v0.x * this.dpr;
            const f = v0.y * this.dpr;

            this.ctx.setTransform(a, b, c, d, e, f);

            // 绘制图像
            this.ctx.drawImage(形状对象.图像对象, 0, 0, 实际宽度, 实际高度);

            // 如果有描边，绘制矩形边框
            if (形状对象.描边宽度 > 0) {
              this.ctx.strokeStyle = 形状对象.描边色;
              this.ctx.lineWidth = 形状对象.描边宽度;
              this.ctx.strokeRect(0, 0, 实际宽度, 实际高度);
            }

            // 恢复变换矩阵（恢复到dpr scale状态）
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
          }
        }

        this.ctx.restore();
      } else {
        // 其他形状使用路径绘制
        this.ctx.strokeStyle = 形状对象.描边色;
        this.ctx.fillStyle = 形状对象.填充色;
        this.ctx.lineWidth = 形状对象.描边宽度;
        this.ctx.stroke(形状对象.路径);
        if (形状对象.形状 !== "直线" && 形状对象.形状 !== "自由") {
          this.ctx.fill(形状对象.路径);
        }
      }

      // 选中时绘制完整交互框，悬停时绘制半透明无句柄交互框
      if (形状对象.已选中) {
        this.绘制交互框(形状对象, 1.0, true);
      } else if (形状对象.已悬停) {
        this.绘制交互框(形状对象, 0.4, false);
      }
    }
    // 绘制缩放/旋转操作说明
    if (this.全局标志.辅助视觉效果) {
      this.绘制缩放旋转操作说明();
    }
  }

  绘制交互框(形状对象, 透明度 = 1, 显示句柄 = true) {
    if (!形状对象) return;
    this.ctx.save();
    this.ctx.beginPath();
    let 旋转弧度 = 0;
    const 外边距 = 10 + 形状对象.描边宽度 * (形状对象.形状 === "多角星" ? 1 : 0.5);
    const 坐标 = {
      x: 0,
      y: 0,
    };
    const 尺寸 = {
      width: 0,
      height: 0,
    };

    // 对于圆，使用旋转矩形（基于半径）
    if (形状对象.形状 === "圆") {
      旋转弧度 = 形状对象.旋转弧度 || 0;

      const 中心 = 形状对象.坐标;
      const 水平半径 = 形状对象.尺寸.水平半径;
      const 垂直半径 = 形状对象.尺寸.垂直半径;

      // 交互框的左上角在局部坐标系中的位置
      坐标.x = 中心.x - 水平半径 - 外边距;
      坐标.y = 中心.y - 垂直半径 - 外边距;
      尺寸.width = (水平半径 + 外边距) * 2;
      尺寸.height = (垂直半径 + 外边距) * 2;
    } else if (形状对象.形状 === "多边形" || 形状对象.形状 === "多角星") {
      // 对于多边形和多角星，使用未旋转的极值坐标
      旋转弧度 = 形状对象.旋转弧度 || 0;

      const 极值 = this.获取未旋转形状的极值坐标(形状对象);
      if (极值) {
        const 中心 = 形状对象.坐标;

        // 基于未旋转的极值坐标计算交互框
        坐标.x = 中心.x + 极值.左 - 外边距;
        坐标.y = 中心.y + 极值.上 - 外边距;
        尺寸.width = 极值.右 - 极值.左 + 外边距 * 2;
        尺寸.height = 极值.下 - 极值.上 + 外边距 * 2;
      }
    } else if (形状对象.形状 === "矩形" || 形状对象.形状 === "图像") {
      // 矩形和图像如果有旋转弧度，需要特殊处理
      旋转弧度 = 形状对象.旋转弧度 || 0;

      // 计算未旋转时的原始尺寸（通过顶点计算）
      // 假设矩形/图像有4个顶点，计算第一条边的长度作为宽，第二条边的长度作为高
      if (形状对象.顶点坐标组 && 形状对象.顶点坐标组.length === 4) {
        // 如果有旋转，需要计算原始矩形的尺寸
        // 使用极值坐标的中心作为旋转中心
        const 中心 = 形状对象.极值坐标.中心;

        // 计算第一条边和第二条边的长度（原始矩形的宽和高）
        const 边1长度 = Math.sqrt(
          Math.pow(形状对象.顶点坐标组[1].x - 形状对象.顶点坐标组[0].x, 2) +
            Math.pow(形状对象.顶点坐标组[1].y - 形状对象.顶点坐标组[0].y, 2)
        );
        const 边2长度 = Math.sqrt(
          Math.pow(形状对象.顶点坐标组[3].x - 形状对象.顶点坐标组[0].x, 2) +
            Math.pow(形状对象.顶点坐标组[3].y - 形状对象.顶点坐标组[0].y, 2)
        );

        // 交互框的左上角（相对于中心点的局部坐标）
        坐标.x = 中心.x - 边1长度 / 2 - 外边距;
        坐标.y = 中心.y - 边2长度 / 2 - 外边距;
        尺寸.width = 边1长度 + 外边距 * 2;
        尺寸.height = 边2长度 + 外边距 * 2;
      } else {
        // 没有旋转或顶点数据不正确，使用极值坐标（AABB）
        坐标.x = 形状对象.极值坐标.左 - 外边距;
        坐标.y = 形状对象.极值坐标.上 - 外边距;
        尺寸.width = 形状对象.极值坐标.右 - 形状对象.极值坐标.左 + 外边距 * 2;
        尺寸.height = 形状对象.极值坐标.下 - 形状对象.极值坐标.上 + 外边距 * 2;
      }
    } else if (形状对象.形状 === "直线" || 形状对象.形状 === "自由") {
      let 最左 = 形状对象.顶点坐标组[0].x;
      let 最右 = 形状对象.顶点坐标组[0].x;
      let 最上 = 形状对象.顶点坐标组[0].y;
      let 最下 = 形状对象.顶点坐标组[0].y;
      for (const 坐标 of 形状对象.顶点坐标组) {
        if (坐标.x < 最左) {
          最左 = 坐标.x;
        }
        if (坐标.x > 最右) {
          最右 = 坐标.x;
        }
        if (坐标.y < 最上) {
          最上 = 坐标.y;
        }
        if (坐标.y > 最下) {
          最下 = 坐标.y;
        }
      }
      const 宽度 = 最右 - 最左;
      const 高度 = 最下 - 最上;
      坐标.x = 最左 - 外边距;
      坐标.y = 最上 - 外边距;
      尺寸.width = 宽度 + 外边距 * 2;
      尺寸.height = 高度 + 外边距 * 2;
    }
    // 只在显示句柄时更新 this.交互框（用于交互检测）
    if (显示句柄) {
      this.交互框 = {
        坐标: 坐标,
        尺寸: 尺寸,
        交互形状: 形状对象,
        容差: 10,
        外边距: 外边距,
        旋转弧度: 旋转弧度,
        鼠标位于内部: true,
        鼠标位于边界: {
          上: false,
          下: false,
          左: false,
          右: false,
        },
      };
    }

    const 虚线长度 = 10;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([虚线长度, 虚线长度]);

    // 如果交互框需要旋转，应用旋转变换
    // 旋转中心是形状的中心，不是交互框的几何中心
    if (旋转弧度) {
      let 中心X, 中心Y;

      // 根据形状类型确定旋转中心
      if (
        形状对象.形状 === "矩形" ||
        形状对象.形状 === "图像" ||
        形状对象.形状 === "直线" ||
        形状对象.形状 === "自由"
      ) {
        // 对于基于顶点的形状，使用极值坐标的中心
        中心X = 形状对象.极值坐标.中心.x;
        中心Y = 形状对象.极值坐标.中心.y;
      } else {
        // 对于圆、多边形、多角星，使用坐标点
        中心X = 形状对象.坐标.x;
        中心Y = 形状对象.坐标.y;
      }

      this.ctx.translate(中心X, 中心Y);
      this.ctx.rotate(旋转弧度);
      this.ctx.translate(-中心X, -中心Y);
    }

    // 绘制交互框矩形（应用透明度）
    this.ctx.rect(坐标.x, 坐标.y, 尺寸.width, 尺寸.height);
    const 旋转时隐藏 = this.全局标志.旋转中 && !this.全局标志.辅助视觉效果;
    this.ctx.strokeStyle = 旋转时隐藏 ? "transparent" : `rgba(135, 206, 250, ${透明度})`;
    this.ctx.stroke();
    this.ctx.lineDashOffset = 虚线长度;
    this.ctx.strokeStyle = 旋转时隐藏 ? "transparent" : `rgba(23, 28, 33, ${透明度})`;
    this.ctx.stroke();

    // 只在显示句柄时绘制句柄
    if (显示句柄) {
      const 句柄半径 = 8;
      this.ctx.strokeStyle = 旋转时隐藏 ? "transparent" : "#aaa";
      this.ctx.lineWidth = 4;
      this.ctx.fillStyle = 旋转时隐藏 ? "transparent" : "#333";
      this.ctx.setLineDash([]);
      const 句柄总路径 = new Path2D();
      const 句柄路径组 = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];

      // 计算四个角点的位置（在旋转变换后的坐标系中）
      const 角点坐标组 = [
        { x: 坐标.x, y: 坐标.y }, // 左上
        { x: 坐标.x + 尺寸.width, y: 坐标.y }, // 右上
        { x: 坐标.x + 尺寸.width, y: 坐标.y + 尺寸.height }, // 右下
        { x: 坐标.x, y: 坐标.y + 尺寸.height }, // 左下
      ];

      for (let i = 0; i < 句柄路径组.length; i++) {
        句柄路径组[i].arc(角点坐标组[i].x, 角点坐标组[i].y, 句柄半径, 0, 2 * Math.PI);
        句柄总路径.addPath(句柄路径组[i]);
      }

      this.ctx.stroke(句柄总路径);
      this.ctx.fill(句柄总路径);
    }

    this.ctx.restore();
  }

  绘制操作说明() {
    if (this.当前形状对象.形状 === null) return;
    const 特殊名词组 = ["↑", "↓", "←", "→", "[", "]", "Shift", "Enter", "ESC"];
    const 上距离 = 20;
    const 右距离 = 20;
    const 起始坐标 = {
      x: this.canvas.offsetWidth - 右距离,
      y: 上距离,
    };
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "top";
    this.ctx.font = "14px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    const 段间距 = 5;
    const 操作说明组 = this.操作说明[this.当前形状对象.形状];
    for (const 操作说明 of 操作说明组) {
      const 说明分段集合 = 操作说明.split(" ");
      起始坐标.x = this.canvas.offsetWidth - 右距离;
      for (let i = 说明分段集合.length - 1; i >= 0; i--) {
        const 本段宽度 = this.ctx.measureText(说明分段集合[i]).width;
        if (特殊名词组.includes(说明分段集合[i])) {
          this.ctx.fillStyle = "lightskyblue";
        } else {
          this.ctx.fillStyle = "#fffa";
        }
        this.ctx.fillText(说明分段集合[i], 起始坐标.x, 起始坐标.y);
        起始坐标.x -= 本段宽度 + 段间距;
      }
      起始坐标.y += 25;
    }
    this.ctx.closePath();
    this.ctx.restore();
  }

  绘制缩放旋转操作说明() {
    // 只有当存在交互框时才继续
    if (!this.交互框) return;

    // 如果正在旋转或缩放，直接显示说明
    const 正在操作 = this.全局标志.旋转中 || this.全局标志.缩放中;

    if (!正在操作) {
      // 如果没有正在操作，则检查鼠标是否位于边界
      const 鼠标位于边界状态 = this.鼠标位于交互框边界();
      if (!鼠标位于边界状态) return;

      // 检查鼠标是否位于边界（至少有一个方向为true）
      const 鼠标位于边界 = 鼠标位于边界状态.上 || 鼠标位于边界状态.下 || 鼠标位于边界状态.左 || 鼠标位于边界状态.右;

      if (!鼠标位于边界) return;
    }

    const 特殊名词组 = ["Shift", "Alt", "Ctrl"];
    const 上距离 = 20;
    const 右距离 = 20;
    const 起始坐标 = {
      x: this.canvas.offsetWidth - 右距离,
      y: 上距离,
    };

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "top";
    this.ctx.font = "14px 'Google Sans Code', Consolas, 'Noto Sans SC', 微软雅黑, sans-serif";
    const 段间距 = 5;

    // 统一显示"缩放与旋转"说明
    const 操作说明组 = this.操作说明.缩放与旋转;

    for (const 操作说明 of 操作说明组) {
      const 说明分段集合 = 操作说明.split(" ");
      起始坐标.x = this.canvas.offsetWidth - 右距离;
      for (let i = 说明分段集合.length - 1; i >= 0; i--) {
        const 本段宽度 = this.ctx.measureText(说明分段集合[i]).width;
        if (特殊名词组.includes(说明分段集合[i])) {
          this.ctx.fillStyle = "lightskyblue";
        } else {
          this.ctx.fillStyle = "#fffa";
        }
        this.ctx.fillText(说明分段集合[i], 起始坐标.x, 起始坐标.y);
        起始坐标.x -= 本段宽度 + 段间距;
      }
      起始坐标.y += 25;
    }
    this.ctx.closePath();
    this.ctx.restore();
  }
}

new 随心绘();
