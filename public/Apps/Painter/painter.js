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
      字体默认尺寸:
        localStorage.getItem("随心绘存储池") === null
          ? 16
          : Number(JSON.parse(localStorage.getItem("随心绘存储池")).字体默认尺寸),
      文本描边色:
        localStorage.getItem("随心绘存储池") === null
          ? "rgba(128, 128, 128, 1)"
          : JSON.parse(localStorage.getItem("随心绘存储池")).文本描边色 || "rgba(128, 128, 128, 1)",
      文本填充色:
        localStorage.getItem("随心绘存储池") === null
          ? "rgba(255, 255, 255, 1)"
          : JSON.parse(localStorage.getItem("随心绘存储池")).文本填充色 || "rgba(255, 255, 255, 1)",
      箭头描边色:
        localStorage.getItem("随心绘存储池") === null
          ? "rgba(128, 128, 128, 1)"
          : JSON.parse(localStorage.getItem("随心绘存储池")).箭头描边色 || "rgba(128, 128, 128, 1)",
      箭头填充色:
        localStorage.getItem("随心绘存储池") === null
          ? "transparent"
          : JSON.parse(localStorage.getItem("随心绘存储池")).箭头填充色 || "transparent",
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
      编组: document.getElementById("编组"),
      水平均匀分布: document.getElementById("水平均匀分布"),
      垂直均匀分布: document.getElementById("垂直均匀分布"),
      水平居中对齐: document.getElementById("水平居中对齐"),
      垂直居中对齐: document.getElementById("垂直居中对齐"),
    };

    this.基础形状单选框组 = {
      矩形: document.getElementById("矩形"),
      圆: document.getElementById("圆"),
      多边形: document.getElementById("多边形"),
      多角星: document.getElementById("多角星"),
      直线: document.getElementById("直线"),
      自由: document.getElementById("自由"),
      箭头: document.getElementById("箭头"),
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
      直线: ["按 空格 确认", "按 ESC 取消", "按住 Shift 限定方向"],
      文本: ["按 ESC 确认", "拖拽输入框边缘移动"],
      缩放与旋转: [
        "按住 Shift 等比缩放",
        "按住 Alt 围绕中心缩放",
        "鼠标位于句柄时按住 Ctrl 旋转",
        "按住 Ctrl 旋转时按住 Shift 量化到 45°",
      ],
      复制: ["按住 Alt 拖拽以复制"],
      箭头: ["按住 Shift 限定方向"],
    };

    this.交互框 = null;

    this.全局标志 = {
      左键已按下: false,
      拖拽中: false,
      旋转中: false,
      缩放中: false,
      多边形边数可增减: true,
      多边形可旋转: true,
      手动调整内半径: false,
      辅助视觉效果: this.辅助.视觉效果复选框.checked,
      按钮音效: this.辅助.按钮音效复选框.checked,
      Alt拖拽复制中: false,
      文本编辑中: false, // 是否处于文本编辑状态
      正在恢复颜色: false, // 是否正在恢复拾色器颜色（用于防止触发change事件）
      正在框选: false, // 是否正在进行框选操作
      Shift已按下: false, // 是否按住Shift键（用于多选）
      多选拖拽中: false, // 是否正在拖拽多选形状
      多选缩放中: false, // 是否正在缩放多选形状
      多选旋转中: false, // 是否正在旋转多选形状
      Shift点击待移除: false, // Shift+点击待移除的形状（需要等待mouseup判断是点击还是拖拽）
      Shift单独拖拽中: false, // Shift+拖拽单独移动形状中（只移动一个形状，不移动其他）
    };

    this.全局属性 = {
      已选中基础形状: null,
      填充色: this.本地存储池.填充色,
      描边色: this.本地存储池.描边色,
      辅助外框描边色: "#aaccee12",
      辅助线段描边色: "#a81",
      选框描边色: "#4a9eff", // 选框的描边颜色
      选框填充色: "rgba(74, 158, 255, 0.05)", // 选框的填充颜色
      描边宽度: this.本地存储池.描边宽度,
      箭头工具描边宽度: 2, // 箭头工具专属的描边宽度
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
      多选形状组: [], // 当前多选的形状引用数组
      多选初始位置组: [], // 多选形状拖拽时的初始位置信息
      多选旋转锚点: null, // 多选旋转的锚点（旋转中心）
      多选旋转初始位置组: [], // 多选形状旋转时的初始位置信息
      多选旋转初始边界中心: null, // 多选旋转时的初始边界中心（用于计算整体旋转角度）
      多选旋转初始边界: null, // 多选旋转时的初始边界（未旋转状态）
      多选整体旋转弧度: 0, // 多选整体旋转弧度（累积）
      多选旋转弧度映射: {}, // 多选旋转弧度的映射（key: 多选形状组的标识）
      多选旋转边界映射: {}, // 多选旋转边界的映射（key: 多选形状组的标识，保存未旋转的边界）
      编组旋转弧度映射: {}, // 编组ID到旋转弧度的映射 { 组ID: 旋转弧度 }
      编组旋转边界映射: {}, // 编组ID到未旋转边界的映射 { 组ID: 未旋转边界 }
      框选起点: null, // 框选的起点坐标
      框选终点: null, // 框选的终点坐标
      缩放模式: null, // 'free', 'proportional', 'horizontal', 'vertical'
      用户全局描边色: null, // 保存用户设置的全局描边色（非选中形状时）
      用户全局填充色: null, // 保存用户设置的全局填充色（非选中形状时）
      文本描边色: this.本地存储池.文本描边色, // 文本专用的描边色
      文本填充色: this.本地存储池.文本填充色, // 文本专用的填充色
      箭头描边色: this.本地存储池.箭头描边色, // 箭头专用的描边色
      箭头填充色: this.本地存储池.箭头填充色, // 箭头专用的填充色
      复制预览形状: null, // Alt+拖拽复制时的预览形状
      复制源形状: null, // 正在被复制的源形状
      复制预览组: null, // Alt+拖拽复制组时的预览形状数组
      复制源组: null, // 正在被复制的源组（形状数组）
      文本输入容器: null, // 文本输入容器DOM元素
      当前编辑文本形状: null, // 当前正在编辑的文本形状
      文本字号: this.本地存储池.字体默认尺寸, // 文本字号
      文本字体: '"JetBrains Mono", Consolas, "Noto Sans SC", 微软雅黑, sans-serif', // 文本字体
      Shift点击待移除形状: null, // Shift+点击待移除的形状对象
      Shift点击待移除信息: null, // Shift+点击待移除的操作信息（用于撤销）
      双击待编组形状: null, // 双击后待编组的形状（在文本输入完成后与该形状编组）
      双击待编组形状中心: null, // 双击形状的中心点（用于文本居中）
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
      已多选: false, // 是否在多选组中
      极值坐标: null,
      按下时坐标: null,
      按下时顶点坐标组: null,
      旋转弧度: 0, // 初始化旋转弧度为0
    };

    this.数据集 = {
      操作记录: [],
      基础形状对象组: [],
      框选形状对象: null, // 用于选框工具选中的多个形状
      形状组: {}, // 形状组：{组ID: [形状对象引用数组]}
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
      " ": false,
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
      v: false,
    };

    this.快捷键映射 = {
      r: "矩形",
      c: "圆",
      q: "多边形",
      w: "多角星",
      e: "直线",
      b: "自由",
      v: "箭头",
      a: "选择路径",
      t: "文本",
      g: "组合",
    };

    // 绘图区元素（用于添加文本输入框）
    this.绘图区 = document.getElementById("绘图区");

    this.添加颜色拾取器();
    this.添加颜色拾取器事件();
    this.添加描边宽度滑块事件();
    this.添加字体默认尺寸滑块事件();
    this.添加清空画布按钮点击事件();
    this.添加撤销按钮点击事件();
    this.添加删除按钮点击事件();
    this.添加变换按钮点击事件();
    this.添加复制按钮点击事件();
    this.添加编组按钮点击事件();
    this.添加对齐和分布按钮点击事件();
    this.处理辅助效果选项();
    this.添加键盘事件();
    this.添加窗口焦点事件();
    this.添加canvas按下左键事件();
    this.添加canvas鼠标抬起事件();
    this.添加canvas鼠标移动事件();
    this.添加canvas双击事件();
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
      // 如果正在恢复颜色，不执行任何逻辑
      if (this.全局标志.正在恢复颜色) {
        return;
      }

      const 颜色字符串 = color.toRGBA().toString();

      // 如果有选中形状，修改选中形状的描边色
      if (this.全局属性.选中形状) {
        this.全局属性.选中形状.描边色 = 颜色字符串;
        this.清空画布();
        this.绘制基础形状对象组();
        // 选中形状时，只修改该形状的颜色，不修改工具的全局颜色
        return;
      }

      // 如果正在编辑已有文本形状，也更新该文本形状的描边色
      if (this.全局标志.文本编辑中 && this.全局属性.当前编辑文本形状) {
        this.全局属性.当前编辑文本形状.描边色 = 颜色字符串;
        // 正在编辑已有文本形状时，不修改任何全局颜色或工具专用颜色，直接返回
        return;
      }

      // 判断当前是否处于文本工具状态（选中文本工具但没有选中形状）
      const 处于文本工具状态 =
        (this.全局标志.文本编辑中 && !this.全局属性.当前编辑文本形状) || // 正在创建新文本
        this.全局属性.已选中基础形状 === "文本"; // 选中文本工具

      // 判断当前是否处于箭头工具状态（选中箭头工具但没有选中形状）
      const 处于箭头工具状态 = this.全局属性.已选中基础形状 === "箭头"; // 选中箭头工具

      // 根据状态保存到不同的变量
      if (处于文本工具状态) {
        // 文本工具状态：保存到文本描边色和本地存储
        this.全局属性.文本描边色 = 颜色字符串;
        this.本地存储池.文本描边色 = 颜色字符串;
        localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
      } else if (处于箭头工具状态) {
        // 箭头工具状态：保存到箭头描边色和本地存储
        this.全局属性.箭头描边色 = 颜色字符串;
        this.本地存储池.箭头描边色 = 颜色字符串;
        localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
      } else {
        // 其他状态：保存到全局描边色
        this.全局属性.用户全局描边色 = 颜色字符串;
        this.全局属性.描边色 = 颜色字符串;
        this.本地存储池.描边色 = this.全局属性.描边色;
        localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
      }
    });

    this.填充颜色拾取器.on("change", (color) => {
      // 如果正在恢复颜色，不执行任何逻辑
      if (this.全局标志.正在恢复颜色) {
        return;
      }

      const 颜色字符串 = color.toRGBA().toString();

      // 如果有选中形状，修改选中形状的填充色
      if (this.全局属性.选中形状) {
        this.全局属性.选中形状.填充色 = 颜色字符串;
        this.清空画布();
        this.绘制基础形状对象组();
        // 选中形状时，只修改该形状的颜色，不修改工具的全局颜色
        return;
      }

      // 如果正在编辑已有文本形状，也更新该文本形状的填充色
      if (this.全局标志.文本编辑中 && this.全局属性.当前编辑文本形状) {
        this.全局属性.当前编辑文本形状.填充色 = 颜色字符串;
        // 正在编辑已有文本形状时，不修改任何全局颜色或工具专用颜色
        // 但仍需更新文本输入框的文本颜色
        const 文本输入框 = document.getElementById("文本输入");
        if (文本输入框) {
          文本输入框.style.color = 颜色字符串;
        }
        return;
      }

      // 判断当前是否处于文本工具状态（选中文本工具但没有选中形状）
      const 处于文本工具状态 =
        (this.全局标志.文本编辑中 && !this.全局属性.当前编辑文本形状) || // 正在创建新文本
        this.全局属性.已选中基础形状 === "文本"; // 选中文本工具

      // 判断当前是否处于箭头工具状态（选中箭头工具但没有选中形状）
      const 处于箭头工具状态 = this.全局属性.已选中基础形状 === "箭头"; // 选中箭头工具

      // 根据状态保存到不同的变量
      if (处于文本工具状态) {
        // 文本工具状态：保存到文本填充色和本地存储
        this.全局属性.文本填充色 = 颜色字符串;
        this.本地存储池.文本填充色 = 颜色字符串;
        localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
      } else if (处于箭头工具状态) {
        // 箭头工具状态：保存到箭头填充色和本地存储
        this.全局属性.箭头填充色 = 颜色字符串;
        this.本地存储池.箭头填充色 = 颜色字符串;
        localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
      } else {
        // 其他状态：保存到全局填充色
        this.全局属性.用户全局填充色 = 颜色字符串;
        this.全局属性.填充色 = 颜色字符串;
        this.本地存储池.填充色 = this.全局属性.填充色;
        localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
      }

      // 如果文本输入框正在显示，更新输入框的文本颜色
      const 文本输入框 = document.getElementById("文本输入");
      if (文本输入框) {
        文本输入框.style.color = 颜色字符串;
      }
    });

    this.描边颜色拾取器.on("swatchselect", (color) => {
      // 如果正在恢复颜色，不执行任何逻辑
      if (this.全局标志.正在恢复颜色) {
        return;
      }

      this.描边颜色拾取器.applyColor(true);
      const 颜色字符串 = color.toRGBA().toString();

      // 如果有选中形状，修改选中形状的描边色
      if (this.全局属性.选中形状) {
        this.全局属性.选中形状.描边色 = 颜色字符串;
        this.清空画布();
        this.绘制基础形状对象组();
        // 选中形状时，只修改该形状的颜色，不修改工具的全局颜色
        return;
      }

      // 如果正在编辑已有文本形状，也更新该文本形状的描边色
      if (this.全局标志.文本编辑中 && this.全局属性.当前编辑文本形状) {
        this.全局属性.当前编辑文本形状.描边色 = 颜色字符串;
        // 正在编辑已有文本形状时，不修改任何全局颜色或工具专用颜色，直接返回
        return;
      }

      // 判断当前是否处于文本工具状态（选中文本工具但没有选中形状）
      const 处于文本工具状态 =
        (this.全局标志.文本编辑中 && !this.全局属性.当前编辑文本形状) || // 正在创建新文本
        this.全局属性.已选中基础形状 === "文本"; // 选中文本工具

      // 判断当前是否处于箭头工具状态（选中箭头工具但没有选中形状）
      const 处于箭头工具状态 = this.全局属性.已选中基础形状 === "箭头"; // 选中箭头工具

      // 根据状态保存到不同的变量
      if (处于文本工具状态) {
        // 文本工具状态：保存到文本描边色
        this.全局属性.文本描边色 = 颜色字符串;
        this.本地存储池.文本描边色 = 颜色字符串;
        localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
      } else if (处于箭头工具状态) {
        // 箭头工具状态：保存到箭头描边色
        this.全局属性.箭头描边色 = 颜色字符串;
        this.本地存储池.箭头描边色 = 颜色字符串;
        localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
      } else {
        // 其他状态：保存到全局描边色
        this.全局属性.用户全局描边色 = 颜色字符串;
        this.全局属性.描边色 = 颜色字符串;
        this.本地存储池.描边色 = this.全局属性.描边色;
        localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
      }
    });

    this.填充颜色拾取器.on("swatchselect", (color) => {
      // 如果正在恢复颜色，不执行任何逻辑
      if (this.全局标志.正在恢复颜色) {
        return;
      }

      this.填充颜色拾取器.applyColor(true);
      const 颜色字符串 = color.toRGBA().toString();

      // 如果有选中形状，修改选中形状的填充色
      if (this.全局属性.选中形状) {
        this.全局属性.选中形状.填充色 = 颜色字符串;
        this.清空画布();
        this.绘制基础形状对象组();
        // 选中形状时，只修改该形状的颜色，不修改工具的全局颜色
        return;
      }

      // 如果正在编辑已有文本形状，也更新该文本形状的填充色
      if (this.全局标志.文本编辑中 && this.全局属性.当前编辑文本形状) {
        this.全局属性.当前编辑文本形状.填充色 = 颜色字符串;
        // 正在编辑已有文本形状时，不修改任何全局颜色或工具专用颜色
        // 但仍需更新文本输入框的文本颜色
        const 文本输入框 = document.getElementById("文本输入");
        if (文本输入框) {
          文本输入框.style.color = 颜色字符串;
        }
        return;
      }

      // 判断当前是否处于文本工具状态（选中文本工具但没有选中形状）
      const 处于文本工具状态 =
        (this.全局标志.文本编辑中 && !this.全局属性.当前编辑文本形状) || // 正在创建新文本
        this.全局属性.已选中基础形状 === "文本"; // 选中文本工具

      // 判断当前是否处于箭头工具状态（选中箭头工具但没有选中形状）
      const 处于箭头工具状态 = this.全局属性.已选中基础形状 === "箭头"; // 选中箭头工具

      // 根据状态保存到不同的变量
      if (处于文本工具状态) {
        // 文本工具状态：保存到文本填充色
        this.全局属性.文本填充色 = 颜色字符串;
        this.本地存储池.文本填充色 = 颜色字符串;
        localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
      } else if (处于箭头工具状态) {
        // 箭头工具状态：保存到箭头填充色
        this.全局属性.箭头填充色 = 颜色字符串;
        this.本地存储池.箭头填充色 = 颜色字符串;
        localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
      } else {
        // 其他状态：保存到全局填充色
        this.全局属性.用户全局填充色 = 颜色字符串;
        this.全局属性.填充色 = 颜色字符串;
        this.本地存储池.填充色 = this.全局属性.填充色;
        localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
      }

      // 如果文本输入框正在显示，更新输入框的文本颜色
      const 文本输入框 = document.getElementById("文本输入");
      if (文本输入框) {
        文本输入框.style.color = 颜色字符串;
      }
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
        // 文本形状不设置描边，始终保持描边宽度为0
        if (this.全局属性.选中形状.形状 !== "文本") {
          // 修改选中形状的描边宽度
          this.全局属性.选中形状.描边宽度 = 宽度;
          this.清空画布();
          this.绘制基础形状对象组();
        }
      }
      // 无论是否有选中形状，都更新全局描边宽度（保持UI和实际值一致）
      this.全局属性.描边宽度 = 宽度;

      // 如果当前选中的是箭头工具，保存箭头工具专属的描边宽度
      if (this.全局属性.已选中基础形状 === "箭头") {
        this.全局属性.箭头工具描边宽度 = 宽度;
      } else {
        // 其他工具保存到本地存储
        this.本地存储池.描边宽度 = this.全局属性.描边宽度;
        localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
      }
    });
  }

  添加字体默认尺寸滑块事件() {
    const 字体默认尺寸滑块 = document.getElementById("字体默认尺寸");
    字体默认尺寸滑块.value = this.本地存储池.字体默认尺寸;
    字体默认尺寸滑块.nextElementSibling.textContent = 字体默认尺寸滑块.value;
    字体默认尺寸滑块.addEventListener("input", () => {
      const 尺寸 = parseInt(字体默认尺寸滑块.value, 10);
      字体默认尺寸滑块.nextElementSibling.textContent = 字体默认尺寸滑块.value;
      this.全局属性.文本字号 = 尺寸;
      this.本地存储池.字体默认尺寸 = 尺寸;
      localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
    });
  }

  更新描边宽度滑块(形状对象) {
    if (!形状对象 || 形状对象.描边宽度 === undefined) return;

    // 文本形状不更新描边滑块
    if (形状对象.形状 === "文本") return;

    const 描边宽度滑块 = document.getElementById("描边宽度");
    const 描边宽度 = 形状对象.描边宽度;

    // 如果是箭头，设置max为5，否则为20
    if (形状对象.形状 === "箭头") {
      描边宽度滑块.max = 5;
    } else {
      描边宽度滑块.max = 20;
    }

    // 更新滑块的值和显示的文本
    描边宽度滑块.value = 描边宽度;
    描边宽度滑块.nextElementSibling.textContent = 描边宽度;
  }

  应用选中形状的颜色到拾色器(形状对象) {
    if (!形状对象) return;

    // 设置标志，防止 setColor 触发的 change 事件执行颜色保存逻辑
    this.全局标志.正在恢复颜色 = true;

    // 保存当前的用户全局颜色（如果还没有保存）
    if (this.全局属性.用户全局描边色 === null) {
      this.全局属性.用户全局描边色 = this.全局属性.描边色;
    }
    if (this.全局属性.用户全局填充色 === null) {
      this.全局属性.用户全局填充色 = this.全局属性.填充色;
    }

    // 显示选中形状自己的颜色（不区分形状类型）
    if (形状对象.描边色) {
      this.描边颜色拾取器.setColor(形状对象.描边色);
    }
    if (形状对象.填充色) {
      this.填充颜色拾取器.setColor(形状对象.填充色);
    }

    // 重置标志
    this.全局标志.正在恢复颜色 = false;
  }

  恢复用户全局颜色到拾色器() {
    // 判断当前是否处于文本相关状态（但不包括选中文本形状）
    const 处于文本状态 =
      this.全局标志.文本编辑中 || // 正在编辑文本
      this.全局属性.已选中基础形状 === "文本"; // 选中文本工具

    // 判断当前是否处于箭头相关状态（但不包括选中箭头形状）
    const 处于箭头状态 = this.全局属性.已选中基础形状 === "箭头"; // 选中箭头工具

    // 设置标志，防止 setColor 触发的 change 事件执行颜色保存逻辑
    this.全局标志.正在恢复颜色 = true;

    // 恢复拾色器到用户的全局颜色
    if (this.全局属性.用户全局描边色 !== null) {
      if (处于文本状态) {
        // 文本状态：恢复到文本描边色
        this.描边颜色拾取器.setColor(this.全局属性.文本描边色);
      } else if (处于箭头状态) {
        // 箭头状态：恢复到箭头描边色
        this.描边颜色拾取器.setColor(this.全局属性.箭头描边色);
      } else {
        // 其他状态：恢复到全局描边色
        this.描边颜色拾取器.setColor(this.全局属性.用户全局描边色);
        this.全局属性.描边色 = this.全局属性.用户全局描边色;
      }
      this.全局属性.用户全局描边色 = null;
    }

    if (this.全局属性.用户全局填充色 !== null) {
      if (处于文本状态) {
        // 文本状态：恢复到文本填充色
        this.填充颜色拾取器.setColor(this.全局属性.文本填充色);
      } else if (处于箭头状态) {
        // 箭头状态：恢复到箭头填充色
        this.填充颜色拾取器.setColor(this.全局属性.箭头填充色);
      } else {
        // 其他状态：恢复到全局填充色
        this.填充颜色拾取器.setColor(this.全局属性.用户全局填充色);
        this.全局属性.填充色 = this.全局属性.用户全局填充色;
      }
      this.全局属性.用户全局填充色 = null;
    }

    // 重置标志
    this.全局标志.正在恢复颜色 = false;
  }

  // ========== 多选相关辅助方法 ==========

  // 添加形状到多选组
  添加到多选组(形状对象) {
    if (!形状对象) return;

    // 如果该形状已经在多选组中，不重复添加
    if (形状对象.已多选) return;

    // 设置标志
    形状对象.已多选 = true;

    // 添加到多选组
    this.全局属性.多选形状组.push(形状对象);

    // 如果单选形状也在多选组中，清空单选
    if (this.全局属性.选中形状 && this.全局属性.多选形状组.length > 1) {
      this.全局属性.选中形状.已选中 = false;
      this.全局属性.选中形状 = null;
    }
  }

  // 从多选组移除形状
  从多选组移除(形状对象) {
    if (!形状对象 || !形状对象.已多选) return;

    // 清除标志
    形状对象.已多选 = false;

    // 从多选组中移除
    const 索引 = this.全局属性.多选形状组.indexOf(形状对象);
    if (索引 !== -1) {
      this.全局属性.多选形状组.splice(索引, 1);
    }
  }

  // 清空多选组
  清空多选组() {
    // 判断是编组
    const 是编组 =
      this.全局属性.多选形状组.length > 0 &&
      this.全局属性.多选形状组.every((形状) => 形状.所属组ID === this.全局属性.多选形状组[0].所属组ID) &&
      this.全局属性.多选形状组[0].所属组ID !== undefined;

    // 如果不是编组（框选），清空多选旋转映射（下次框选从0开始）
    if (!是编组) {
      const 多选标识 = this.全局属性.多选形状组
        .map((形状) => this.数据集.基础形状对象组.indexOf(形状))
        .sort()
        .join(",");
      if (多选标识) {
        delete this.全局属性.多选旋转弧度映射[多选标识];
        delete this.全局属性.多选旋转边界映射[多选标识];
      }
    }
    // 如果是编组，保留映射（下次选择编组时继承旋转状态）

    // 清除所有形状的多选标志
    this.全局属性.多选形状组.forEach((形状) => {
      形状.已多选 = false;
    });

    // 清空数组
    this.全局属性.多选形状组 = [];

    // 重置整体旋转弧度（取消选择后，下次再选中时从0开始）
    this.全局属性.多选整体旋转弧度 = 0;
  }

  // ========== 编组相关辅助方法 ==========

  // 生成唯一的组ID
  生成组ID() {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取形状所属的组
  获取形状所属组(形状对象) {
    if (!形状对象 || !形状对象.所属组ID) return null;
    return this.数据集.形状组[形状对象.所属组ID] || null;
  }

  // 根据组ID获取组
  根据组ID获取组(组ID) {
    return this.数据集.形状组[组ID] || null;
  }

  // 创建组（将多个形状编成一组）
  创建组(形状对象数组) {
    if (!形状对象数组 || 形状对象数组.length < 2) return null;

    const 组ID = this.生成组ID();
    this.数据集.形状组[组ID] = [...形状对象数组]; // 存储形状对象引用的副本

    // 为每个形状设置所属组ID
    形状对象数组.forEach((形状) => {
      形状.所属组ID = 组ID;
    });

    return 组ID;
  }

  // 从组中移除单个形状
  从组中移除形状(形状对象) {
    if (!形状对象 || !形状对象.所属组ID) return;

    const 组ID = 形状对象.所属组ID;
    const 组 = this.数据集.形状组[组ID];
    if (!组) return;

    // 从组中移除该形状
    const 组内索引 = 组.indexOf(形状对象);
    if (组内索引 !== -1) {
      组.splice(组内索引, 1);
    }

    // 清除形状的所属组ID
    形状对象.所属组ID = undefined;

    // 如果组内只剩一个形状，取消编组（将剩下的形状也移除）
    if (组.length === 1) {
      const 剩余形状 = 组[0];
      if (剩余形状) {
        剩余形状.所属组ID = undefined;
      }
      delete this.数据集.形状组[组ID];
    } else if (组.length === 0) {
      // 如果组变空了，删除组
      delete this.数据集.形状组[组ID];
    }
  }

  // 将形状添加到组中
  将形状添加到组(形状对象, 目标组ID) {
    if (!形状对象 || !目标组ID || !this.数据集.形状组[目标组ID]) return;

    // 如果形状已经在目标组中，直接返回
    if (形状对象.所属组ID === 目标组ID) return;

    // 如果形状在另一个组中，先从原组中移除
    if (形状对象.所属组ID) {
      this.从组中移除形状(形状对象);
    }

    // 将形状添加到目标组
    this.数据集.形状组[目标组ID].push(形状对象);
    形状对象.所属组ID = 目标组ID;
  }

  // 合并两个编组（将源组的所有形状合并到目标组）
  合并编组(源组ID, 目标组ID) {
    if (!源组ID || !目标组ID || !this.数据集.形状组[源组ID] || !this.数据集.形状组[目标组ID]) return;
    if (源组ID === 目标组ID) return; // 不能合并同一个组

    const 源组 = this.数据集.形状组[源组ID];

    // 将源组的所有形状添加到目标组
    源组.forEach((形状) => {
      if (形状) {
        形状.所属组ID = 目标组ID;
        this.数据集.形状组[目标组ID].push(形状);
      }
    });

    // 删除源组
    delete this.数据集.形状组[源组ID];
  }

  // 删除组（取消编组）
  删除组(组ID) {
    if (!组ID || !this.数据集.形状组[组ID]) return;

    const 组内形状 = this.数据集.形状组[组ID];

    // 清除每个形状的所属组ID
    组内形状.forEach((形状) => {
      if (形状) {
        形状.所属组ID = undefined;
      }
    });

    // 从形状组中删除
    delete this.数据集.形状组[组ID];
  }

  // 检查形状是否属于某个组
  形状已编组(形状对象) {
    return 形状对象 && 形状对象.所属组ID !== undefined;
  }

  // 获取组内所有形状（根据组ID或形状对象）
  获取组内所有形状(组ID或形状对象) {
    let 组ID;
    if (typeof 组ID或形状对象 === "string") {
      组ID = 组ID或形状对象;
    } else if (组ID或形状对象 && 组ID或形状对象.所属组ID) {
      组ID = 组ID或形状对象.所属组ID;
    } else {
      return [];
    }

    return this.数据集.形状组[组ID] || [];
  }

  // 获取多选形状的整体边界（极值坐标）
  获取多选形状的边界() {
    if (this.全局属性.多选形状组.length === 0) {
      return null;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // 遍历所有多选形状，计算综合边界
    this.全局属性.多选形状组.forEach((形状) => {
      let 顶点组 = [];

      // 根据形状类型获取顶点
      // 文本形状：优先处理
      if (形状.形状 === "文本") {
        // 文本形状总是使用其顶点坐标组
        if (形状.顶点坐标组 && 形状.顶点坐标组.length > 0) {
          顶点组 = 形状.顶点坐标组;
        }
        // 如果没有顶点坐标组，跳过此形状（不影响边界计算）
      } else if (形状.形状 === "圆") {
        // 圆形：生成8个顶点用于边界计算
        顶点组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.水平半径,
          形状.尺寸.垂直半径,
          8,
          0,
          形状.旋转弧度 || 0
        );
      } else if (形状.形状 === "多边形") {
        // 多边形：使用或生成顶点坐标组
        if (形状.顶点坐标组 && 形状.顶点坐标组.length > 0) {
          顶点组 = 形状.顶点坐标组;
        } else {
          顶点组 = this.获取多边形顶点坐标组(
            形状.坐标.x,
            形状.坐标.y,
            形状.尺寸.水平半径,
            形状.尺寸.垂直半径,
            形状.边数,
            形状.起始弧度,
            形状.旋转弧度 || 0
          );
        }
      } else if (形状.形状 === "多角星") {
        // 多角星：使用外顶点和内顶点
        if (形状.外顶点坐标组 && 形状.内顶点坐标组) {
          顶点组 = [...形状.外顶点坐标组, ...形状.内顶点坐标组];
        } else {
          const 外顶点 = this.获取多边形顶点坐标组(
            形状.坐标.x,
            形状.坐标.y,
            形状.尺寸.外半径.水平,
            形状.尺寸.外半径.垂直,
            形状.边数,
            形状.起始弧度,
            形状.旋转弧度 || 0
          );
          const 内顶点 = this.获取多边形顶点坐标组(
            形状.坐标.x,
            形状.坐标.y,
            形状.尺寸.内半径.水平,
            形状.尺寸.内半径.垂直,
            形状.边数,
            形状.起始弧度 + Math.PI / 形状.边数,
            形状.旋转弧度 || 0
          );
          顶点组 = [...外顶点, ...内顶点];
        }
      } else {
        // 其他形状：使用顶点坐标组
        if (形状.顶点坐标组 && 形状.顶点坐标组.length > 0) {
          顶点组 = 形状.顶点坐标组;
        }
      }

      // 遍历顶点更新边界
      顶点组.forEach((顶点) => {
        minX = Math.min(minX, 顶点.x);
        minY = Math.min(minY, 顶点.y);
        maxX = Math.max(maxX, 顶点.x);
        maxY = Math.max(maxY, 顶点.y);
      });
    });

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    };
  }

  // 判断形状是否完全在框选矩形内
  形状在框选矩形内(形状对象, 框选矩形) {
    if (!形状对象) {
      return false;
    }

    const { minX, minY, maxX, maxY } = 框选矩形;

    // 获取需要检查的顶点组
    let 顶点组 = [];

    // 文本形状：优先处理
    if (形状对象.形状 === "文本") {
      // 文本形状总是使用其顶点坐标组
      if (形状对象.顶点坐标组 && 形状对象.顶点坐标组.length > 0) {
        顶点组 = 形状对象.顶点坐标组;
      } else {
        // 如果没有顶点坐标组，无法判断
        return false;
      }
    } else if (形状对象.形状 === "圆") {
      // 圆形：生成8个顶点用于近似判断
      顶点组 = this.获取多边形顶点坐标组(
        形状对象.坐标.x,
        形状对象.坐标.y,
        形状对象.尺寸.水平半径,
        形状对象.尺寸.垂直半径,
        8,
        0,
        形状对象.旋转弧度 || 0
      );
    } else if (形状对象.形状 === "多边形") {
      // 多边形：使用或生成顶点坐标组
      if (形状对象.顶点坐标组 && 形状对象.顶点坐标组.length > 0) {
        顶点组 = 形状对象.顶点坐标组;
      } else {
        顶点组 = this.获取多边形顶点坐标组(
          形状对象.坐标.x,
          形状对象.坐标.y,
          形状对象.尺寸.水平半径,
          形状对象.尺寸.垂直半径,
          形状对象.边数,
          形状对象.起始弧度,
          形状对象.旋转弧度 || 0
        );
      }
    } else if (形状对象.形状 === "多角星") {
      // 多角星：需要检查外顶点和内顶点
      if (形状对象.外顶点坐标组 && 形状对象.内顶点坐标组) {
        顶点组 = [...形状对象.外顶点坐标组, ...形状对象.内顶点坐标组];
      } else {
        const 外顶点 = this.获取多边形顶点坐标组(
          形状对象.坐标.x,
          形状对象.坐标.y,
          形状对象.尺寸.外半径.水平,
          形状对象.尺寸.外半径.垂直,
          形状对象.边数,
          形状对象.起始弧度,
          形状对象.旋转弧度 || 0
        );
        const 内顶点 = this.获取多边形顶点坐标组(
          形状对象.坐标.x,
          形状对象.坐标.y,
          形状对象.尺寸.内半径.水平,
          形状对象.尺寸.内半径.垂直,
          形状对象.边数,
          形状对象.起始弧度 + Math.PI / 形状对象.边数,
          形状对象.旋转弧度 || 0
        );
        顶点组 = [...外顶点, ...内顶点];
      }
    } else {
      // 其他形状：使用顶点坐标组
      if (!形状对象.顶点坐标组 || 形状对象.顶点坐标组.length === 0) {
        return false;
      }
      顶点组 = 形状对象.顶点坐标组;
    }

    // 检查形状的所有顶点是否都在框选矩形内
    return 顶点组.every((顶点) => {
      return 顶点.x >= minX && 顶点.x <= maxX && 顶点.y >= minY && 顶点.y <= maxY;
    });
  }

  // 绘制框选矩形
  绘制框选矩形() {
    if (!this.全局属性.框选起点 || !this.全局属性.框选终点) return;

    const minX = Math.min(this.全局属性.框选起点.x, this.全局属性.框选终点.x);
    const minY = Math.min(this.全局属性.框选起点.y, this.全局属性.框选终点.y);
    const width = Math.abs(this.全局属性.框选终点.x - this.全局属性.框选起点.x);
    const height = Math.abs(this.全局属性.框选终点.y - this.全局属性.框选起点.y);

    this.ctx.save();

    // 绘制填充
    this.ctx.fillStyle = this.全局属性.选框填充色;
    this.ctx.fillRect(minX, minY, width, height);

    // 绘制边框（实线）
    this.ctx.strokeStyle = this.全局属性.选框描边色;
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([]); // 实线
    this.ctx.strokeRect(minX, minY, width, height);

    this.ctx.restore();
  }

  // 获取多选整体旋转状态（用于边界检测）
  // 交互框不旋转，直接使用AABB边界，此函数主要用于获取整体旋转弧度（用于其他逻辑）
  获取多选整体旋转状态() {
    const 边界 = this.获取多选形状的边界();
    if (!边界) return { 整体旋转弧度: 0 };

    let 已编组;
    const 多选数量 = this.全局属性.多选形状组.length;
    已编组 =
      多选数量 > 0 &&
      多选数量 >= 2 &&
      this.全局属性.多选形状组.every((形状) => 形状.所属组ID === this.全局属性.多选形状组[0].所属组ID) &&
      this.全局属性.多选形状组[0].所属组ID !== undefined;

    // 计算整体旋转角度（用于形状的旋转逻辑，不影响交互框）
    let 整体旋转弧度 = 0;
    if (this.全局标志.多选旋转中 && this.全局属性.多选整体旋转弧度 !== undefined) {
      // 旋转中：使用当前的整体旋转弧度（相对于初始状态的增量）+ 之前保存的旋转弧度
      let 之前保存的旋转弧度 = 0;
      if (已编组) {
        const 组ID = this.全局属性.多选形状组[0].所属组ID;
        if (组ID) {
          之前保存的旋转弧度 = this.全局属性.编组旋转弧度映射[组ID] || 0;
        }
      } else {
        const 多选标识 = this.全局属性.多选形状组
          .map((形状) => this.数据集.基础形状对象组.indexOf(形状))
          .sort()
          .join(",");
        之前保存的旋转弧度 = this.全局属性.多选旋转弧度映射[多选标识] || 0;
      }
      整体旋转弧度 = 之前保存的旋转弧度 + this.全局属性.多选整体旋转弧度;
    } else if (已编组) {
      // 编组且不在旋转中：使用保存的编组旋转弧度
      const 组ID = this.全局属性.多选形状组[0].所属组ID;
      if (组ID && this.全局属性.编组旋转弧度映射[组ID]) {
        整体旋转弧度 = this.全局属性.编组旋转弧度映射[组ID];
      }
    } else {
      // 多选且不在旋转中：使用保存的多选旋转弧度
      const 多选标识 = this.全局属性.多选形状组
        .map((形状) => this.数据集.基础形状对象组.indexOf(形状))
        .sort()
        .join(",");
      if (this.全局属性.多选旋转弧度映射[多选标识]) {
        整体旋转弧度 = this.全局属性.多选旋转弧度映射[多选标识];
      }
    }

    return { 整体旋转弧度 };
  }

  // 检测鼠标是否在多选整体交互框内
  // 交互框不旋转，直接使用AABB边界检测
  鼠标位于多选整体交互框内() {
    if (this.全局属性.多选形状组.length === 0) return false;

    const 边界 = this.获取多选形状的边界();
    if (!边界) return false;

    const { minX, minY, width, height } = 边界;
    const 外边距 = 25; // 与绘制时使用的外边距一致
    const 容差 = 10; // 容差

    // 直接使用世界坐标系检测（交互框不旋转）
    const 鼠标X = this.全局属性.鼠标坐标.x;
    const 鼠标Y = this.全局属性.鼠标坐标.y;

    // 检查鼠标是否在整体交互框的范围内（包括容差）
    return (
      鼠标X >= minX - 外边距 - 容差 &&
      鼠标X <= minX + width + 外边距 + 容差 &&
      鼠标Y >= minY - 外边距 - 容差 &&
      鼠标Y <= minY + height + 外边距 + 容差
    );
  }

  // 绘制多选整体交互框
  // 交互框不旋转，始终显示为轴对齐边界框（AABB），但尺寸会随内部形状的旋转而改变
  绘制多选整体交互框(边界, 不透明度 = 1.0, 强制已编组 = false, 自定义虚线模式 = null) {
    if (!边界) return;

    const 外边距 = 25; // 整体交互框的外边距（增大）
    let 已编组;
    if (强制已编组) {
      已编组 = 强制已编组;
    } else {
      const 多选数量 = this.全局属性.多选形状组.length;
      已编组 =
        多选数量 > 0 &&
        多选数量 >= 2 &&
        this.全局属性.多选形状组.every((形状) => 形状.所属组ID === this.全局属性.多选形状组[0].所属组ID) &&
        this.全局属性.多选形状组[0].所属组ID !== undefined;
    }

    // 直接使用传入的边界（已经是AABB，不需要旋转）
    // 边界会根据内部形状的旋转状态自动调整尺寸
    const { minX, minY, width, height } = 边界;

    this.ctx.save();
    this.ctx.globalAlpha = 不透明度;

    // 绘制整体交互框矩形（实线，不旋转）
    this.ctx.strokeStyle = "#4a9eff"; // 蓝色，与框选框颜色一致
    this.ctx.lineWidth = 2;
    if (自定义虚线模式 !== null) {
      // 如果指定了自定义虚线模式，使用自定义模式
      this.ctx.setLineDash(自定义虚线模式);
    } else if (已编组) {
      this.ctx.setLineDash([]);
    } else {
      this.ctx.setLineDash([10, 5]);
    }

    this.ctx.strokeRect(minX - 外边距, minY - 外边距, width + 外边距 * 2, height + 外边距 * 2);

    // 绘制四个角的句柄（与单个形状交互框句柄样式相同）
    const 句柄半径 = 8; // 与单个形状交互框句柄相同
    this.ctx.strokeStyle = "#aaa"; // 浅灰色描边
    this.ctx.lineWidth = 2; // 减小描边宽度
    this.ctx.fillStyle = "#333"; // 深灰色填充
    this.ctx.globalAlpha = 1;
    this.ctx.setLineDash([]);

    // 左上角
    this.ctx.beginPath();
    this.ctx.arc(minX - 外边距, minY - 外边距, 句柄半径, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // 右上角
    this.ctx.beginPath();
    this.ctx.arc(minX + width + 外边距, minY - 外边距, 句柄半径, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // 右下角
    this.ctx.beginPath();
    this.ctx.arc(minX + width + 外边距, minY + height + 外边距, 句柄半径, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // 左下角
    this.ctx.beginPath();
    this.ctx.arc(minX - 外边距, minY + height + 外边距, 句柄半径, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  // 检测鼠标是否在多选整体交互框的句柄或边界上
  // 交互框不旋转，直接使用AABB边界检测
  鼠标位于多选整体交互框边界() {
    if (this.全局属性.多选形状组.length === 0) return null;

    const 边界 = this.获取多选形状的边界();
    if (!边界) return null;

    const { minX, minY, width, height } = 边界;
    const 外边距 = 25; // 与绘制时使用的外边距一致
    const 容差 = 10; // 容差

    // 直接使用世界坐标系检测（交互框不旋转）
    const 鼠标X = this.全局属性.鼠标坐标.x;
    const 鼠标Y = this.全局属性.鼠标坐标.y;

    // 计算交互框的实际边界（包括外边距）
    const 左边界 = minX - 外边距;
    const 右边界 = minX + width + 外边距;
    const 上边界 = minY - 外边距;
    const 下边界 = minY + height + 外边距;

    // 检查是否在句柄上（四个角）
    const 句柄半径 = 8;
    const 左上距离 = Math.sqrt(Math.pow(鼠标X - 左边界, 2) + Math.pow(鼠标Y - 上边界, 2));
    const 右上距离 = Math.sqrt(Math.pow(鼠标X - 右边界, 2) + Math.pow(鼠标Y - 上边界, 2));
    const 右下距离 = Math.sqrt(Math.pow(鼠标X - 右边界, 2) + Math.pow(鼠标Y - 下边界, 2));
    const 左下距离 = Math.sqrt(Math.pow(鼠标X - 左边界, 2) + Math.pow(鼠标Y - 下边界, 2));

    const 位于句柄 =
      左上距离 <= 句柄半径 + 容差 ||
      右上距离 <= 句柄半径 + 容差 ||
      右下距离 <= 句柄半径 + 容差 ||
      左下距离 <= 句柄半径 + 容差;

    // 检查是否在边界上（上下左右边）
    const 在水平范围内 = 鼠标X >= 左边界 - 容差 && 鼠标X <= 右边界 + 容差;
    const 在垂直范围内 = 鼠标Y >= 上边界 - 容差 && 鼠标Y <= 下边界 + 容差;

    const 边界位置 = {
      上: !位于句柄 && 在水平范围内 && 鼠标Y >= 上边界 - 容差 && 鼠标Y <= 上边界 + 容差,
      下: !位于句柄 && 在水平范围内 && 鼠标Y >= 下边界 - 容差 && 鼠标Y <= 下边界 + 容差,
      左: !位于句柄 && 在垂直范围内 && 鼠标X >= 左边界 - 容差 && 鼠标X <= 左边界 + 容差,
      右: !位于句柄 && 在垂直范围内 && 鼠标X >= 右边界 - 容差 && 鼠标X <= 右边界 + 容差,
    };

    // 如果位于句柄或边界，返回边界位置信息
    if (位于句柄 || 边界位置.上 || 边界位置.下 || 边界位置.左 || 边界位置.右) {
      return { 位于句柄, ...边界位置 };
    }

    return null;
  }

  // ========== 多选相关辅助方法结束 ==========

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
    // 根据是否有选中形状或多选形状来控制变换按钮的启用/禁用
    const 有选中或多选 = this.全局属性.选中形状 || this.全局属性.多选形状组.length > 0;
    const 多选数量 = this.全局属性.多选形状组.length;

    if (有选中或多选) {
      this.变换按钮组.水平翻转.parentElement.classList.remove("禁用");
      this.变换按钮组.垂直翻转.parentElement.classList.remove("禁用");
      this.变换按钮组.顺时针旋转.parentElement.classList.remove("禁用");
      this.变换按钮组.逆时针旋转.parentElement.classList.remove("禁用");
      /* this.图形组合按钮组.交集.parentElement.classList.remove("禁用");
      this.图形组合按钮组.并集.parentElement.classList.remove("禁用");
      this.图形组合按钮组.差集.parentElement.classList.remove("禁用"); */
      this.图形组合按钮组.复制.parentElement.classList.remove("禁用");
      // 删除按钮：有选中或多选时启用
      this.删除按钮.classList.remove("禁用");
    } else {
      this.变换按钮组.水平翻转.parentElement.classList.add("禁用");
      this.变换按钮组.垂直翻转.parentElement.classList.add("禁用");
      this.变换按钮组.顺时针旋转.parentElement.classList.add("禁用");
      this.变换按钮组.逆时针旋转.parentElement.classList.add("禁用");
      /* this.图形组合按钮组.交集.parentElement.classList.add("禁用");
      this.图形组合按钮组.并集.parentElement.classList.add("禁用");
      this.图形组合按钮组.差集.parentElement.classList.add("禁用"); */
      this.图形组合按钮组.复制.parentElement.classList.add("禁用");
      // 删除按钮：无选中也无多选时禁用
      this.删除按钮.classList.add("禁用");
    }

    // 均匀分布按钮：需要>=3个形状才能分布
    if (多选数量 >= 3) {
      this.图形组合按钮组.水平均匀分布.parentElement.classList.remove("禁用");
      this.图形组合按钮组.垂直均匀分布.parentElement.classList.remove("禁用");
    } else {
      this.图形组合按钮组.水平均匀分布.parentElement.classList.add("禁用");
      this.图形组合按钮组.垂直均匀分布.parentElement.classList.add("禁用");
    }

    // 居中对齐按钮：需要>=2个形状才能对齐
    if (多选数量 >= 2) {
      this.图形组合按钮组.水平居中对齐.parentElement.classList.remove("禁用");
      this.图形组合按钮组.垂直居中对齐.parentElement.classList.remove("禁用");
    } else {
      this.图形组合按钮组.水平居中对齐.parentElement.classList.add("禁用");
      this.图形组合按钮组.垂直居中对齐.parentElement.classList.add("禁用");
    }

    // 更新编组按钮状态：多选形状数量>=2时启用，或者选中已编组的形状时启用
    const 选中形状已编组 = this.全局属性.选中形状 && this.形状已编组(this.全局属性.选中形状);

    if (多选数量 >= 2 || 选中形状已编组) {
      this.图形组合按钮组.编组.parentElement.classList.remove("禁用");
      // 如果选中已编组的形状，则复选框应该被选中
      if (选中形状已编组 && 多选数量 === 0) {
        // 如果单独选中已编组的形状，需要将整个组加入多选组
        const 组内形状 = this.获取组内所有形状(this.全局属性.选中形状);
        if (组内形状.length > 0) {
          // 清空多选组，然后添加组内所有形状
          this.清空多选组();
          组内形状.forEach((形状) => {
            this.添加到多选组(形状);
          });
          // 清除单选状态
          this.全局属性.选中形状.已选中 = false;
          this.全局属性.选中形状 = null;
        }
      }
      // 检查已编组：多选组内所有形状属于同一个组
      const 已编组 =
        多选数量 > 0 &&
        多选数量 >= 2 &&
        this.全局属性.多选形状组.every((形状) => 形状.所属组ID === this.全局属性.多选形状组[0].所属组ID) &&
        this.全局属性.多选形状组[0].所属组ID !== undefined;

      if (已编组 || (选中形状已编组 && 多选数量 > 0)) {
        this.图形组合按钮组.编组.checked = true;
      } else {
        this.图形组合按钮组.编组.checked = false;
      }
    } else {
      this.图形组合按钮组.编组.parentElement.classList.add("禁用");
      this.图形组合按钮组.编组.checked = false;
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
        const 新选中的工具 = 基础形状分区.getAttribute("形状");
        const 旧选中的工具 = this.全局属性.已选中基础形状;
        const 描边宽度滑块 = document.getElementById("描边宽度");

        // 如果要切换工具，先保存当前工具的描边宽度
        if (旧选中的工具 !== 新选中的工具) {
          if (旧选中的工具 === "箭头") {
            // 从箭头工具切换出去，保存箭头工具的描边宽度
            this.全局属性.箭头工具描边宽度 = this.全局属性.描边宽度;
          } else if (旧选中的工具 !== null) {
            // 从其他工具切换出去，保存其他工具的描边宽度
            this.本地存储池.描边宽度 = this.全局属性.描边宽度;
            localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
          }
        }

        this.全局属性.已选中基础形状 = 新选中的工具;

        // 切换工具时清空多选组
        if (this.全局属性.多选形状组.length > 0) {
          this.清空多选组();
        }

        // 切换到新工具，恢复该工具的描边宽度
        if (新选中的工具 === "箭头") {
          // 切换到箭头工具，恢复箭头工具专属的描边宽度并设置滑块最大值为5
          描边宽度滑块.max = 5;
          this.全局属性.描边宽度 = this.全局属性.箭头工具描边宽度;
          描边宽度滑块.value = this.全局属性.箭头工具描边宽度;
          描边宽度滑块.nextElementSibling.textContent = this.全局属性.箭头工具描边宽度;
        } else if (旧选中的工具 === "箭头") {
          // 从箭头工具切换到其他工具，恢复滑块最大值和其他工具的描边宽度
          描边宽度滑块.max = 20;
          this.全局属性.描边宽度 = this.本地存储池.描边宽度;
          描边宽度滑块.value = this.本地存储池.描边宽度;
          描边宽度滑块.nextElementSibling.textContent = this.本地存储池.描边宽度;
        }

        // 更新拾色器颜色
        if (新选中的工具 === "文本") {
          // 切换到文本工具，显示文本专用颜色
          // 设置标志，防止 setColor 触发的 change 事件执行颜色保存逻辑
          this.全局标志.正在恢复颜色 = true;
          this.描边颜色拾取器.setColor(this.全局属性.文本描边色);
          this.填充颜色拾取器.setColor(this.全局属性.文本填充色);
          this.全局标志.正在恢复颜色 = false;
        } else if (新选中的工具 === "箭头") {
          // 切换到箭头工具，显示箭头专用颜色
          // 设置标志，防止 setColor 触发的 change 事件执行颜色保存逻辑
          this.全局标志.正在恢复颜色 = true;
          this.描边颜色拾取器.setColor(this.全局属性.箭头描边色);
          this.填充颜色拾取器.setColor(this.全局属性.箭头填充色);
          this.全局标志.正在恢复颜色 = false;
        } else if (旧选中的工具 === "文本" || 旧选中的工具 === "箭头") {
          // 从文本工具或箭头工具切换出去
          // 如果有选中形状，显示选中形状的颜色；否则显示全局颜色
          if (this.全局属性.选中形状) {
            // 应用选中形状的颜色到拾色器（函数内部会处理标志）
            this.应用选中形状的颜色到拾色器(this.全局属性.选中形状);
          } else {
            // 设置标志，防止 setColor 触发的 change 事件执行颜色保存逻辑
            this.全局标志.正在恢复颜色 = true;
            this.描边颜色拾取器.setColor(this.全局属性.描边色);
            this.填充颜色拾取器.setColor(this.全局属性.填充色);
            this.全局标志.正在恢复颜色 = false;
          }
        }
      });
    }
  }

  鼠标位于形状内() {
    if (this.数据集.基础形状对象组.length <= 0) return null;
    for (let i = this.数据集.基础形状对象组.length - 1; i >= 0; i--) {
      const 形状 = this.数据集.基础形状对象组[i];
      if (!形状.路径) continue;
      // 跳过已多选的形状（多选时不响应单个形状的交互），但按住Shift键时除外
      if (形状.已多选 && !this.全局标志.Shift已按下) continue;
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
      if (形状.形状 === "直线" || 形状.形状 === "自由" || 形状.形状 === "箭头") {
        // 使用 isPointInStroke 检测鼠标是否在路径的描边上，通过临时增加线宽来增加容差
        this.ctx.save();
        const 容差 = 10; // 增加8像素的容差
        this.ctx.lineWidth = 形状.描边宽度 + 容差;
        形状.已悬停 = this.ctx.isPointInStroke(
          形状.路径,
          this.全局属性.鼠标坐标.x * this.dpr,
          this.全局属性.鼠标坐标.y * this.dpr
        );
        this.ctx.restore();
        if (形状.已悬停) {
          if (this.全局属性.悬停形状 && this.全局属性.悬停形状 !== 形状) {
            this.全局属性.悬停形状.已悬停 = false;
          }
          this.全局属性.悬停形状 = 形状;
          return 形状;
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
    } else if (形状对象 && (形状对象.形状 === "矩形" || 形状对象.形状 === "图像" || 形状对象.形状 === "文本")) {
      // 对于矩形、图像和文本，旋转中心是极值坐标的中心
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
    } else if (
      形状对象 &&
      (形状对象.形状 === "矩形" ||
        形状对象.形状 === "图像" ||
        形状对象.形状 === "直线" ||
        形状对象.形状 === "自由" ||
        形状对象.形状 === "箭头" ||
        形状对象.形状 === "文本")
    ) {
      // 对于矩形、图像、直线、自由、箭头，旋转中心是极值坐标的中心
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
      if (this.全局标志.Alt拖拽复制中 && this.全局属性.复制预览组) {
        // 复制组的情况
        const 偏移量 = {
          x: this.全局属性.鼠标坐标.x - this.全局属性.复制预览组[0].初始鼠标位置.x,
          y: this.全局属性.鼠标坐标.y - this.全局属性.复制预览组[0].初始鼠标位置.y,
        };

        // 更新所有预览形状的位置
        this.全局属性.复制预览组.forEach((预览形状, 索引) => {
          const 源形状 = this.全局属性.复制源组[索引];

          // 根据形状类型更新位置（和单个形状复制相同的逻辑）
          if (源形状.形状 === "圆") {
            预览形状.坐标 = {
              x: 源形状.坐标.x + 偏移量.x,
              y: 源形状.坐标.y + 偏移量.y,
            };
          } else if (源形状.形状 === "多边形") {
            预览形状.坐标 = {
              x: 源形状.坐标.x + 偏移量.x,
              y: 源形状.坐标.y + 偏移量.y,
            };
            预览形状.顶点坐标组 = this.获取多边形顶点坐标组(
              预览形状.坐标.x,
              预览形状.坐标.y,
              预览形状.尺寸.水平半径,
              预览形状.尺寸.垂直半径,
              预览形状.边数,
              预览形状.起始弧度,
              预览形状.旋转弧度 || 0
            );
          } else if (源形状.形状 === "多角星") {
            预览形状.坐标 = {
              x: 源形状.坐标.x + 偏移量.x,
              y: 源形状.坐标.y + 偏移量.y,
            };
            const 旋转弧度 = 预览形状.旋转弧度 || 0;
            预览形状.外顶点坐标组 = this.获取多边形顶点坐标组(
              预览形状.坐标.x,
              预览形状.坐标.y,
              预览形状.尺寸.外半径.水平,
              预览形状.尺寸.外半径.垂直,
              预览形状.边数,
              预览形状.起始弧度,
              旋转弧度
            );
            预览形状.内顶点坐标组 = this.获取多边形顶点坐标组(
              预览形状.坐标.x,
              预览形状.坐标.y,
              预览形状.尺寸.内半径.水平,
              预览形状.尺寸.内半径.垂直,
              预览形状.边数,
              预览形状.起始弧度 + Math.PI / 预览形状.边数,
              旋转弧度
            );
          } else if (
            源形状.形状 === "矩形" ||
            源形状.形状 === "直线" ||
            源形状.形状 === "自由" ||
            源形状.形状 === "箭头" ||
            源形状.形状 === "文本"
          ) {
            预览形状.顶点坐标组 = 源形状.顶点坐标组.map((坐标) => ({
              x: 坐标.x + 偏移量.x,
              y: 坐标.y + 偏移量.y,
            }));
            if (源形状.形状 === "箭头") {
              预览形状.起点 = {
                x: 源形状.起点.x + 偏移量.x,
                y: 源形状.起点.y + 偏移量.y,
              };
              预览形状.终点 = {
                x: 源形状.终点.x + 偏移量.x,
                y: 源形状.终点.y + 偏移量.y,
              };
            }
            if (源形状.形状 === "文本") {
              预览形状.坐标 = {
                x: 源形状.坐标.x + 偏移量.x,
                y: 源形状.坐标.y + 偏移量.y,
              };
            }
          } else if (源形状.形状 === "图像") {
            预览形状.顶点坐标组 = 源形状.顶点坐标组.map((坐标) => ({
              x: 坐标.x + 偏移量.x,
              y: 坐标.y + 偏移量.y,
            }));
            预览形状.坐标 = {
              x: 源形状.坐标.x + 偏移量.x,
              y: 源形状.坐标.y + 偏移量.y,
            };
            预览形状.中心 = {
              x: 源形状.中心.x + 偏移量.x,
              y: 源形状.中心.y + 偏移量.y,
            };
          }

          // 更新极值坐标和路径
          预览形状.极值坐标 = this.获取极值坐标(预览形状);
          this.更新路径(预览形状);
        });

        // 重新绘制
        this.清空画布();
        this.绘制基础形状对象组();

        const 原透明度 = this.ctx.globalAlpha;
        this.ctx.globalAlpha = 0.33;
        this.全局属性.复制预览组.forEach((预览形状) => {
          this.绘制单个形状(预览形状);
        });
        this.ctx.globalAlpha = 原透明度;
        return;
      }

      if (this.全局标志.Alt拖拽复制中 && this.全局属性.复制预览形状) {
        // 单个形状复制的情况
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
        } else if (
          源形状.形状 === "矩形" ||
          源形状.形状 === "直线" ||
          源形状.形状 === "自由" ||
          源形状.形状 === "箭头" ||
          源形状.形状 === "文本"
        ) {
          this.全局属性.复制预览形状.顶点坐标组 = 源形状.顶点坐标组.map((坐标) => ({
            x: 坐标.x + 偏移量.x,
            y: 坐标.y + 偏移量.y,
          }));
          // 对于箭头，还需要更新起点和终点
          if (源形状.形状 === "箭头") {
            this.全局属性.复制预览形状.起点 = {
              x: 源形状.起点.x + 偏移量.x,
              y: 源形状.起点.y + 偏移量.y,
            };
            this.全局属性.复制预览形状.终点 = {
              x: 源形状.终点.x + 偏移量.x,
              y: 源形状.终点.y + 偏移量.y,
            };
          }
          // 对于文本，还需要更新坐标
          if (源形状.形状 === "文本") {
            this.全局属性.复制预览形状.坐标 = {
              x: 源形状.坐标.x + 偏移量.x,
              y: 源形状.坐标.y + 偏移量.y,
            };
          }
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
      ) {
        return;
      }
      if (this.全局属性.已选中基础形状 === "选择路径") {
        let 锚点 = null;

        // 框选逻辑：更新框选终点并绘制框选矩形
        if (this.全局标志.正在框选) {
          this.全局属性.框选终点 = { ...this.全局属性.鼠标坐标 };

          // 计算当前框选矩形的边界
          const minX = Math.min(this.全局属性.框选起点.x, this.全局属性.框选终点.x);
          const minY = Math.min(this.全局属性.框选起点.y, this.全局属性.框选终点.y);
          const maxX = Math.max(this.全局属性.框选起点.x, this.全局属性.框选终点.x);
          const maxY = Math.max(this.全局属性.框选起点.y, this.全局属性.框选终点.y);

          const 框选矩形 = { minX, minY, maxX, maxY };

          // 清除所有形状的框选预览状态
          this.数据集.基础形状对象组.forEach((形状) => {
            形状.框选预览中 = false;
          });

          // 标记在框选矩形内的形状
          this.数据集.基础形状对象组.forEach((形状) => {
            if (this.形状在框选矩形内(形状, 框选矩形)) {
              形状.框选预览中 = true;
            }
          });

          this.清空画布();
          this.绘制基础形状对象组();
          this.绘制框选矩形();
          return;
        }

        // 处理多选旋转
        if (
          this.全局标志.多选旋转中 &&
          this.全局属性.多选形状组.length > 0 &&
          this.全局属性.多选旋转锚点 &&
          this.全局属性.多选旋转初始位置组.length > 0
        ) {
          this.canvas.style.cursor = 'url("/Images/Common/busy.png") 10 10, pointer';

          const 锚点 = this.全局属性.多选旋转锚点;

          // 计算弧度差
          let 弧度差 = this.获取弧度差(
            锚点.x,
            锚点.y,
            this.全局属性.点击坐标.x,
            this.全局属性.点击坐标.y,
            this.全局属性.鼠标坐标.x,
            this.全局属性.鼠标坐标.y
          );

          // 按住Shift键时，旋转角度量化到45度（π/4）的倍数（8个象限）
          if (this.键盘状态.Shift) {
            // 使用第一个形状作为参考来计算量化
            if (this.全局属性.多选旋转初始位置组.length > 0) {
              const 第一个初始位置 = this.全局属性.多选旋转初始位置组[0];
              const 形状 = 第一个初始位置.形状;

              // 对于有旋转弧度属性的形状，使用旋转弧度进行量化
              if (形状.形状 !== "直线" && 形状.形状 !== "自由") {
                const 点击时旋转弧度 = 第一个初始位置.按下时旋转弧度 || 0;
                let 目标旋转弧度 = 点击时旋转弧度 - 弧度差;

                // 将目标旋转弧度转换到 [0, 2π) 范围
                while (目标旋转弧度 < 0) {
                  目标旋转弧度 += Math.PI * 2;
                }
                while (目标旋转弧度 >= Math.PI * 2) {
                  目标旋转弧度 -= Math.PI * 2;
                }

                // 量化到最近的45度
                const 角度步长 = Math.PI / 4; // 45度
                const 量化后旋转弧度 = Math.round(目标旋转弧度 / 角度步长) * 角度步长;

                // 重新计算弧度差
                弧度差 = 点击时旋转弧度 - 量化后旋转弧度;
              } else {
                // 对于直线和自由形状，量化累积旋转弧度
                const 当前累积旋转弧度 = Math.abs(弧度差);
                const 角度步长 = Math.PI / 4; // 45度
                const 量化后累积旋转弧度 = Math.round(当前累积旋转弧度 / 角度步长) * 角度步长;

                // 重新计算弧度差（保持符号）
                const 符号 = Math.sign(弧度差);
                弧度差 = 符号 * 量化后累积旋转弧度;
              }
            }
          }

          // 对所有多选形状应用旋转：围绕锚点旋转，同时自身也旋转
          this.全局属性.多选旋转初始位置组.forEach((初始位置) => {
            const 形状 = 初始位置.形状;

            // 获取形状的中心点（用于围绕锚点旋转）
            let 形状中心 = null;
            if (形状.形状 === "圆" || 形状.形状 === "多边形" || 形状.形状 === "多角星") {
              形状中心 = { x: 初始位置.按下时坐标.x, y: 初始位置.按下时坐标.y };
            } else if (形状.形状 === "文本") {
              形状中心 = { x: 初始位置.按下时坐标.x, y: 初始位置.按下时坐标.y };
            } else if (形状.形状 === "矩形" || 形状.形状 === "图像" || 形状.形状 === "箭头") {
              // 计算初始状态的极值坐标中心
              const 临时顶点坐标组 = 初始位置.按下时顶点坐标组 ? [...初始位置.按下时顶点坐标组] : [];
              if (临时顶点坐标组.length > 0) {
                const 最左 = Math.min(...临时顶点坐标组.map((v) => v.x));
                const 最右 = Math.max(...临时顶点坐标组.map((v) => v.x));
                const 最上 = Math.min(...临时顶点坐标组.map((v) => v.y));
                const 最下 = Math.max(...临时顶点坐标组.map((v) => v.y));
                形状中心 = {
                  x: (最左 + 最右) / 2,
                  y: (最上 + 最下) / 2,
                };
              }
            } else if (形状.形状 === "直线" || 形状.形状 === "自由") {
              // 计算所有顶点的中心
              if (初始位置.按下时顶点坐标组 && 初始位置.按下时顶点坐标组.length > 0) {
                const 最左 = Math.min(...初始位置.按下时顶点坐标组.map((v) => v.x));
                const 最右 = Math.max(...初始位置.按下时顶点坐标组.map((v) => v.x));
                const 最上 = Math.min(...初始位置.按下时顶点坐标组.map((v) => v.y));
                const 最下 = Math.max(...初始位置.按下时顶点坐标组.map((v) => v.y));
                形状中心 = {
                  x: (最左 + 最右) / 2,
                  y: (最上 + 最下) / 2,
                };
              }
            }

            if (!形状中心) return;

            // 围绕锚点旋转形状中心点
            const 旋转后的中心 = this.旋转坐标(形状中心, 锚点, -弧度差);

            // 计算中心点的偏移量
            const 中心偏移量 = {
              x: 旋转后的中心.x - 形状中心.x,
              y: 旋转后的中心.y - 形状中心.y,
            };

            // 根据形状类型应用旋转
            if (形状.形状 === "矩形" || 形状.形状 === "图像" || 形状.形状 === "箭头") {
              // 形状自身也要旋转（围绕锚点旋转时，自身也要转）
              const 初始旋转弧度 = 初始位置.按下时旋转弧度 !== undefined ? 初始位置.按下时旋转弧度 : 0;

              if (初始位置.按下时顶点坐标组 && 初始位置.按下时顶点坐标组.length > 0) {
                // 计算形状初始状态的极值坐标中心（按下时的中心）
                const 初始顶点组 = 初始位置.按下时顶点坐标组;
                const 初始最左 = Math.min(...初始顶点组.map((v) => v.x));
                const 初始最右 = Math.max(...初始顶点组.map((v) => v.x));
                const 初始最上 = Math.min(...初始顶点组.map((v) => v.y));
                const 初始最下 = Math.max(...初始顶点组.map((v) => v.y));
                const 初始中心 = {
                  x: (初始最左 + 初始最右) / 2,
                  y: (初始最上 + 初始最下) / 2,
                };

                // 对于矩形和图像，使用局部坐标系（先更新旋转弧度，然后基于旋转弧度生成顶点）
                if (形状.形状 === "矩形" || 形状.形状 === "图像") {
                  // 先更新旋转弧度（局部坐标系）
                  形状.旋转弧度 = 初始旋转弧度 - 弧度差;
                  // 标准化旋转弧度到 [0, 2π) 范围
                  while (形状.旋转弧度 > Math.PI * 2) {
                    形状.旋转弧度 -= Math.PI * 2;
                  }
                  while (形状.旋转弧度 < 0) {
                    形状.旋转弧度 += Math.PI * 2;
                  }

                  // 从初始顶点计算未旋转的尺寸（反向旋转到未旋转状态）
                  let 未旋转尺寸 = { 宽: 0, 高: 0 };
                  if (初始旋转弧度 !== 0) {
                    // 将初始顶点反向旋转到未旋转状态，计算尺寸
                    const 未旋转顶点组 = 初始顶点组.map((顶点) => this.旋转坐标(顶点, 初始中心, -初始旋转弧度));
                    const 未旋转最左 = Math.min(...未旋转顶点组.map((v) => v.x));
                    const 未旋转最右 = Math.max(...未旋转顶点组.map((v) => v.x));
                    const 未旋转最上 = Math.min(...未旋转顶点组.map((v) => v.y));
                    const 未旋转最下 = Math.max(...未旋转顶点组.map((v) => v.y));
                    未旋转尺寸.宽 = 未旋转最右 - 未旋转最左;
                    未旋转尺寸.高 = 未旋转最下 - 未旋转最上;
                  } else {
                    // 如果没有初始旋转，直接计算尺寸
                    未旋转尺寸.宽 = 初始最右 - 初始最左;
                    未旋转尺寸.高 = 初始最下 - 初始最上;
                  }

                  // 围绕锚点旋转中心（位置旋转）
                  const 位置旋转后的中心 = this.旋转坐标(初始中心, 锚点, -弧度差);

                  // 基于旋转后的中心和旋转弧度生成顶点坐标组（局部坐标系）
                  const cos = Math.cos(形状.旋转弧度);
                  const sin = Math.sin(形状.旋转弧度);
                  const 半宽 = 未旋转尺寸.宽 / 2;
                  const 半高 = 未旋转尺寸.高 / 2;

                  // 局部坐标系的四个角点（相对于中心）
                  const 局部角点组 = [
                    { x: -半宽, y: -半高 },
                    { x: 半宽, y: -半高 },
                    { x: 半宽, y: 半高 },
                    { x: -半宽, y: 半高 },
                  ];

                  // 将局部坐标系的角点转换到世界坐标系（应用旋转和位置）
                  形状.顶点坐标组 = 局部角点组.map((局部角点) => ({
                    x: 位置旋转后的中心.x + 局部角点.x * cos - 局部角点.y * sin,
                    y: 位置旋转后的中心.y + 局部角点.x * sin + 局部角点.y * cos,
                  }));
                } else if (形状.形状 === "箭头") {
                  // 箭头：使用局部坐标系（先更新旋转弧度，然后基于旋转后的起点和终点生成顶点）
                  // 从初始顶点坐标组获取起点和终点（顶点坐标组[0]是起点，[1]是终点）
                  const 初始起点 = 初始位置.按下时顶点坐标组[0];
                  const 初始终点 = 初始位置.按下时顶点坐标组[1];

                  // 计算初始起点和终点的中心
                  const 初始线段中心 = {
                    x: (初始起点.x + 初始终点.x) / 2,
                    y: (初始起点.y + 初始终点.y) / 2,
                  };

                  // 计算未旋转的线段长度和方向
                  let 未旋转长度 = 0;
                  let 未旋转方向 = 0;
                  if (初始旋转弧度 !== 0) {
                    // 如果有初始旋转，先反旋转到未旋转状态
                    const 未旋转起点 = this.旋转坐标(初始起点, 初始线段中心, -初始旋转弧度);
                    const 未旋转终点 = this.旋转坐标(初始终点, 初始线段中心, -初始旋转弧度);
                    const dx = 未旋转终点.x - 未旋转起点.x;
                    const dy = 未旋转终点.y - 未旋转起点.y;
                    未旋转长度 = Math.sqrt(dx * dx + dy * dy);
                    未旋转方向 = Math.atan2(dy, dx);
                  } else {
                    // 如果没有初始旋转，直接计算长度和方向
                    const dx = 初始终点.x - 初始起点.x;
                    const dy = 初始终点.y - 初始起点.y;
                    未旋转长度 = Math.sqrt(dx * dx + dy * dy);
                    未旋转方向 = Math.atan2(dy, dx);
                  }

                  // 先更新旋转弧度（局部坐标系）
                  形状.旋转弧度 = 初始旋转弧度 - 弧度差;
                  // 标准化旋转弧度到 [0, 2π) 范围
                  while (形状.旋转弧度 > Math.PI * 2) {
                    形状.旋转弧度 -= Math.PI * 2;
                  }
                  while (形状.旋转弧度 < 0) {
                    形状.旋转弧度 += Math.PI * 2;
                  }

                  // 围绕锚点旋转线段中心（位置旋转）
                  const 位置旋转后的中心 = this.旋转坐标(初始线段中心, 锚点, -弧度差);

                  // 计算新的方向：未旋转方向 + 新的旋转弧度（相对于未旋转状态的旋转角度）
                  // 新的旋转弧度 = 初始旋转弧度 - 弧度差，所以新方向 = 未旋转方向 + (初始旋转弧度 - 弧度差)
                  const 新方向 = 未旋转方向 + 形状.旋转弧度;
                  // 标准化方向到 [0, 2π) 范围
                  let 标准化方向 = 新方向;
                  while (标准化方向 > Math.PI * 2) {
                    标准化方向 -= Math.PI * 2;
                  }
                  while (标准化方向 < 0) {
                    标准化方向 += Math.PI * 2;
                  }

                  const 半长度 = 未旋转长度 / 2;
                  const 新起点 = {
                    x: 位置旋转后的中心.x - 半长度 * Math.cos(标准化方向),
                    y: 位置旋转后的中心.y - 半长度 * Math.sin(标准化方向),
                  };
                  const 新终点 = {
                    x: 位置旋转后的中心.x + 半长度 * Math.cos(标准化方向),
                    y: 位置旋转后的中心.y + 半长度 * Math.sin(标准化方向),
                  };

                  // 更新起点和终点
                  形状.起点 = 新起点;
                  形状.终点 = 新终点;

                  // 基于新的起点和终点生成顶点坐标组（局部坐标系）
                  形状.顶点坐标组 = this.计算箭头顶点坐标组(新起点, 新终点);
                }

                // 更新极值坐标
                形状.极值坐标 = this.获取极值坐标(形状);
              }

              // 对于图像，更新坐标和中心
              if (形状.形状 === "图像") {
                形状.坐标.x = 形状.顶点坐标组[0].x;
                形状.坐标.y = 形状.顶点坐标组[0].y;
                形状.极值坐标 = this.获取极值坐标(形状);
                形状.中心 = 形状.极值坐标.中心;
              }

              // 对于箭头，更新起点和终点
              if (形状.形状 === "箭头") {
                const 保存的旋转弧度 = 形状.旋转弧度;
                this.更新箭头起点终点(形状);
                形状.旋转弧度 = 保存的旋转弧度;
              }

              // 如果还没有更新极值坐标，现在更新
              if (!形状.极值坐标) {
                形状.极值坐标 = this.获取极值坐标(形状);
              }
            } else if (形状.形状 === "文本") {
              // 旋转文本的坐标点（基线位置）
              形状.坐标.x = 旋转后的中心.x;
              形状.坐标.y = 旋转后的中心.y;

              // 形状自身也要旋转
              const 初始旋转弧度 = 初始位置.按下时旋转弧度 !== undefined ? 初始位置.按下时旋转弧度 : 0;
              形状.旋转弧度 = 初始旋转弧度 - 弧度差;
              // 标准化旋转弧度到 0-2π 范围
              while (形状.旋转弧度 > Math.PI * 2) {
                形状.旋转弧度 -= Math.PI * 2;
              }
              while (形状.旋转弧度 < 0) {
                形状.旋转弧度 += Math.PI * 2;
              }

              // 重新生成顶点和极值坐标
              this.更新文本形状(形状);
            } else if (形状.形状 === "圆") {
              // 旋转圆的中心点（坐标）
              形状.坐标.x = 旋转后的中心.x;
              形状.坐标.y = 旋转后的中心.y;

              // 形状自身也要旋转
              const 初始旋转弧度 = 初始位置.按下时旋转弧度 !== undefined ? 初始位置.按下时旋转弧度 : 0;
              形状.旋转弧度 = 初始旋转弧度 - 弧度差;
              // 标准化旋转弧度到 0-2π 范围
              while (形状.旋转弧度 > Math.PI * 2) {
                形状.旋转弧度 -= Math.PI * 2;
              }
              while (形状.旋转弧度 < 0) {
                形状.旋转弧度 += Math.PI * 2;
              }

              // 重新计算顶点坐标组
              if (形状.边数 !== undefined) {
                形状.顶点坐标组 = this.获取多边形顶点坐标组(
                  形状.坐标.x,
                  形状.坐标.y,
                  形状.尺寸.水平半径,
                  形状.尺寸.垂直半径,
                  形状.边数,
                  形状.起始弧度 || 0,
                  形状.旋转弧度 || 0
                );
              }

              形状.极值坐标 = this.获取极值坐标(形状);
            } else if (形状.形状 === "多边形" || 形状.形状 === "多角星") {
              // 旋转多边形/多角星的中心点（坐标）
              形状.坐标.x = 旋转后的中心.x;
              形状.坐标.y = 旋转后的中心.y;

              // 形状自身也要旋转
              const 初始旋转弧度 = 初始位置.按下时旋转弧度 !== undefined ? 初始位置.按下时旋转弧度 : 0;
              形状.旋转弧度 = 初始旋转弧度 - 弧度差;
              // 标准化旋转弧度到 0-2π 范围
              while (形状.旋转弧度 > Math.PI * 2) {
                形状.旋转弧度 -= Math.PI * 2;
              }
              while (形状.旋转弧度 < 0) {
                形状.旋转弧度 += Math.PI * 2;
              }

              // 重新计算顶点坐标组（应用形状自身的旋转）
              if (形状.形状 === "多边形") {
                形状.顶点坐标组 = this.获取多边形顶点坐标组(
                  形状.坐标.x,
                  形状.坐标.y,
                  形状.尺寸.水平半径,
                  形状.尺寸.垂直半径,
                  形状.边数,
                  形状.起始弧度,
                  形状.旋转弧度 || 0
                );
              } else if (形状.形状 === "多角星") {
                形状.外顶点坐标组 = this.获取多边形顶点坐标组(
                  形状.坐标.x,
                  形状.坐标.y,
                  形状.尺寸.外半径.水平,
                  形状.尺寸.外半径.垂直,
                  形状.边数,
                  形状.起始弧度,
                  形状.旋转弧度 || 0
                );
                形状.内顶点坐标组 = this.获取多边形顶点坐标组(
                  形状.坐标.x,
                  形状.坐标.y,
                  形状.尺寸.内半径.水平,
                  形状.尺寸.内半径.垂直,
                  形状.边数,
                  形状.起始弧度 + Math.PI / 形状.边数,
                  形状.旋转弧度 || 0
                );
              }

              形状.极值坐标 = this.获取极值坐标(形状);
            } else if (形状.形状 === "直线" || 形状.形状 === "自由") {
              // 旋转所有顶点（保持形状自身不变）
              if (初始位置.按下时顶点坐标组 && 初始位置.按下时顶点坐标组.length > 0) {
                形状.顶点坐标组 = 初始位置.按下时顶点坐标组.map((坐标) => this.旋转坐标(坐标, 锚点, -弧度差));
              }

              // 更新极值坐标
              形状.极值坐标 = this.获取极值坐标(形状);
            }

            // 更新路径
            this.更新路径(形状);
          });

          // 更新整体旋转弧度（用于绘制旋转的整体交互框）
          // 直接使用弧度差（负值），与形状旋转保持一致
          this.全局属性.多选整体旋转弧度 = -弧度差;

          // 重新绘制
          this.清空画布();
          this.绘制基础形状对象组();

          // 如果辅助视觉效果为true，绘制锚点
          if (this.全局标志.辅助视觉效果 && 锚点) {
            this.绘制椭圆(锚点.x, 锚点.y, 4, 4, 0, "white", "black", 2);
          }

          return;
        }

        // 处理多选缩放
        if (this.全局标志.多选缩放中 && this.全局属性.多选形状组.length > 0) {
          this.canvas.style.cursor = 'url("/Images/Common/缩放.cur") 10 10, pointer';

          // 动态更新缩放锚点和模式（根据Alt和Shift键状态）
          this.更新多选缩放锚点和模式();

          // 获取缩放锚点以便绘制
          const 锚点 = this.全局属性.多选缩放锚点;

          // 执行多选缩放
          this.执行多选缩放();

          // 更新所有形状的路径和极值坐标
          this.全局属性.多选形状组.forEach((形状) => {
            this.更新路径(形状);
          });

          // 重新绘制
          this.清空画布();
          this.绘制基础形状对象组();

          // 如果辅助视觉效果为true，绘制锚点
          if (this.全局标志.辅助视觉效果 && 锚点) {
            this.绘制椭圆(锚点.x, 锚点.y, 4, 4, 0, "white", "black", 2);
          }

          return;
        }

        // 处理多选拖拽
        if (
          this.全局标志.多选拖拽中 &&
          this.全局属性.多选形状组.length > 0 &&
          this.全局属性.多选初始位置组.length > 0
        ) {
          // 如果正在单独拖拽一个形状（Shift+拖拽单独移动）
          if (this.全局标志.Shift单独拖拽中 && this.全局属性.Shift点击待移除形状) {
            const 单独移动形状 = this.全局属性.Shift点击待移除形状;
            // 找到这个形状的初始位置
            const 初始位置 = this.全局属性.多选初始位置组.find((位置) => 位置.形状 === 单独移动形状);

            if (初始位置) {
              const 偏移量 = {
                x: this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x,
                y: this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y,
              };

              // 只移动这个形状
              // 对于文本，坐标是基线位置，需要根据初始坐标和偏移量更新
              if (单独移动形状.形状 === "文本" && 初始位置.按下时坐标) {
                单独移动形状.坐标.x = 初始位置.按下时坐标.x + 偏移量.x;
                单独移动形状.坐标.y = 初始位置.按下时坐标.y + 偏移量.y;
                // 重新计算顶点坐标组
                this.更新文本形状(单独移动形状);
              } else {
                // 其他形状通过顶点坐标组移动
                if (初始位置.按下时顶点坐标组 && 初始位置.按下时顶点坐标组.length > 0) {
                  // 对于多边形，通过坐标移动然后重新计算顶点坐标组
                  if (单独移动形状.形状 === "多边形" && 初始位置.按下时坐标) {
                    单独移动形状.坐标.x = 初始位置.按下时坐标.x + 偏移量.x;
                    单独移动形状.坐标.y = 初始位置.按下时坐标.y + 偏移量.y;
                    // 重新计算顶点坐标组
                    单独移动形状.顶点坐标组 = this.获取多边形顶点坐标组(
                      单独移动形状.坐标.x,
                      单独移动形状.坐标.y,
                      单独移动形状.尺寸.水平半径,
                      单独移动形状.尺寸.垂直半径,
                      单独移动形状.边数,
                      单独移动形状.起始弧度,
                      单独移动形状.旋转弧度 || 0
                    );
                  } else if (单独移动形状.形状 === "多角星" && 初始位置.按下时坐标) {
                    // 对于多角星，通过坐标移动然后重新计算顶点坐标组
                    单独移动形状.坐标.x = 初始位置.按下时坐标.x + 偏移量.x;
                    单独移动形状.坐标.y = 初始位置.按下时坐标.y + 偏移量.y;
                    // 重新计算外顶点和内顶点
                    单独移动形状.外顶点坐标组 = this.获取多边形顶点坐标组(
                      单独移动形状.坐标.x,
                      单独移动形状.坐标.y,
                      单独移动形状.尺寸.外半径.水平,
                      单独移动形状.尺寸.外半径.垂直,
                      单独移动形状.边数,
                      单独移动形状.起始弧度,
                      单独移动形状.旋转弧度 || 0
                    );
                    单独移动形状.内顶点坐标组 = this.获取多边形顶点坐标组(
                      单独移动形状.坐标.x,
                      单独移动形状.坐标.y,
                      单独移动形状.尺寸.内半径.水平,
                      单独移动形状.尺寸.内半径.垂直,
                      单独移动形状.边数,
                      单独移动形状.起始弧度 + Math.PI / 单独移动形状.边数,
                      单独移动形状.旋转弧度 || 0
                    );
                  } else {
                    // 其他形状通过顶点坐标组移动
                    for (let i = 0; i < 单独移动形状.顶点坐标组.length && i < 初始位置.按下时顶点坐标组.length; i++) {
                      单独移动形状.顶点坐标组[i].x = 初始位置.按下时顶点坐标组[i].x + 偏移量.x;
                      单独移动形状.顶点坐标组[i].y = 初始位置.按下时顶点坐标组[i].y + 偏移量.y;
                    }
                    // 对于图像，还需要更新坐标和中心
                    if (单独移动形状.形状 === "图像") {
                      单独移动形状.坐标.x = 单独移动形状.顶点坐标组[0].x;
                      单独移动形状.坐标.y = 单独移动形状.顶点坐标组[0].y;
                    }
                  }
                } else if (
                  初始位置.按下时坐标 &&
                  (单独移动形状.形状 === "圆" || 单独移动形状.形状 === "多边形" || 单独移动形状.形状 === "多角星")
                ) {
                  // 对于圆形、多边形、多角星等使用坐标的形状
                  单独移动形状.坐标.x = 初始位置.按下时坐标.x + 偏移量.x;
                  单独移动形状.坐标.y = 初始位置.按下时坐标.y + 偏移量.y;
                }
              }

              // 更新形状的极值坐标和路径
              单独移动形状.极值坐标 = this.获取极值坐标(单独移动形状);
              this.更新路径(单独移动形状);
              // 对于图像和文本，更新中心坐标
              if (单独移动形状.形状 === "图像" || 单独移动形状.形状 === "文本") {
                单独移动形状.中心 = 单独移动形状.极值坐标.中心;
              }
            }

            // 重新绘制（整体交互框会实时更新）
            this.清空画布();
            this.绘制基础形状对象组();
            return;
          }

          // 如果之前标记了Shift+点击待移除，检测到拖拽时只移动这个形状
          if (this.全局标志.Shift点击待移除) {
            // 计算鼠标移动距离
            const 鼠标移动距离 = Math.sqrt(
              Math.abs(this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x) ** 2 +
                Math.abs(this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y) ** 2
            );

            // 如果移动距离超过阈值（例如3像素），认为是拖拽而不是点击
            if (鼠标移动距离 > 3) {
              // 取消移除操作，改为单独移动这个形状
              const 待移除形状 = this.全局属性.Shift点击待移除形状;
              if (待移除形状) {
                // 找到这个形状的初始位置
                const 初始位置 = this.全局属性.多选初始位置组.find((位置) => 位置.形状 === 待移除形状);

                if (初始位置) {
                  const 偏移量 = {
                    x: this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x,
                    y: this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y,
                  };

                  // 只移动这个形状
                  // 对于文本，坐标是基线位置，需要根据初始坐标和偏移量更新
                  if (待移除形状.形状 === "文本" && 初始位置.按下时坐标) {
                    待移除形状.坐标.x = 初始位置.按下时坐标.x + 偏移量.x;
                    待移除形状.坐标.y = 初始位置.按下时坐标.y + 偏移量.y;
                    // 重新计算顶点坐标组
                    this.更新文本形状(待移除形状);
                  } else {
                    // 其他形状通过顶点坐标组移动
                    if (初始位置.按下时顶点坐标组 && 初始位置.按下时顶点坐标组.length > 0) {
                      // 对于多边形，通过坐标移动然后重新计算顶点坐标组
                      if (待移除形状.形状 === "多边形" && 初始位置.按下时坐标) {
                        待移除形状.坐标.x = 初始位置.按下时坐标.x + 偏移量.x;
                        待移除形状.坐标.y = 初始位置.按下时坐标.y + 偏移量.y;
                        // 重新计算顶点坐标组
                        待移除形状.顶点坐标组 = this.获取多边形顶点坐标组(
                          待移除形状.坐标.x,
                          待移除形状.坐标.y,
                          待移除形状.尺寸.水平半径,
                          待移除形状.尺寸.垂直半径,
                          待移除形状.边数,
                          待移除形状.起始弧度,
                          待移除形状.旋转弧度 || 0
                        );
                      } else if (待移除形状.形状 === "多角星" && 初始位置.按下时坐标) {
                        // 对于多角星，通过坐标移动然后重新计算顶点坐标组
                        待移除形状.坐标.x = 初始位置.按下时坐标.x + 偏移量.x;
                        待移除形状.坐标.y = 初始位置.按下时坐标.y + 偏移量.y;
                        // 重新计算外顶点和内顶点
                        待移除形状.外顶点坐标组 = this.获取多边形顶点坐标组(
                          待移除形状.坐标.x,
                          待移除形状.坐标.y,
                          待移除形状.尺寸.外半径.水平,
                          待移除形状.尺寸.外半径.垂直,
                          待移除形状.边数,
                          待移除形状.起始弧度,
                          待移除形状.旋转弧度 || 0
                        );
                        待移除形状.内顶点坐标组 = this.获取多边形顶点坐标组(
                          待移除形状.坐标.x,
                          待移除形状.坐标.y,
                          待移除形状.尺寸.内半径.水平,
                          待移除形状.尺寸.内半径.垂直,
                          待移除形状.边数,
                          待移除形状.起始弧度 + Math.PI / 待移除形状.边数,
                          待移除形状.旋转弧度 || 0
                        );
                      } else {
                        // 其他形状通过顶点坐标组移动
                        for (let i = 0; i < 待移除形状.顶点坐标组.length && i < 初始位置.按下时顶点坐标组.length; i++) {
                          待移除形状.顶点坐标组[i].x = 初始位置.按下时顶点坐标组[i].x + 偏移量.x;
                          待移除形状.顶点坐标组[i].y = 初始位置.按下时顶点坐标组[i].y + 偏移量.y;
                        }
                        // 对于图像，还需要更新坐标和中心
                        if (待移除形状.形状 === "图像") {
                          待移除形状.坐标.x = 待移除形状.顶点坐标组[0].x;
                          待移除形状.坐标.y = 待移除形状.顶点坐标组[0].y;
                        }
                      }
                    } else if (
                      初始位置.按下时坐标 &&
                      (待移除形状.形状 === "圆" || 待移除形状.形状 === "多边形" || 待移除形状.形状 === "多角星")
                    ) {
                      // 对于圆形、多边形、多角星等使用坐标的形状
                      待移除形状.坐标.x = 初始位置.按下时坐标.x + 偏移量.x;
                      待移除形状.坐标.y = 初始位置.按下时坐标.y + 偏移量.y;
                    }
                  }

                  // 更新形状的极值坐标和路径
                  待移除形状.极值坐标 = this.获取极值坐标(待移除形状);
                  this.更新路径(待移除形状);
                  // 对于图像和文本，更新中心坐标
                  if (待移除形状.形状 === "图像" || 待移除形状.形状 === "文本") {
                    待移除形状.中心 = 待移除形状.极值坐标.中心;
                  }
                }

                // 清除待移除标志，设置单独拖拽标志（因为已经在拖拽了）
                this.全局标志.Shift点击待移除 = false;
                this.全局标志.Shift单独拖拽中 = true;
                // 保存单独移动的形状引用，以便后续继续移动
                // 不清除待移除信息，因为可能还需要用于撤销
              }

              // 重新绘制（整体交互框会实时更新）
              this.清空画布();
              this.绘制基础形状对象组();
              return;
            }
          }

          this.canvas.style.cursor = 'url("/Images/Common/鼠标-移动.cur"), pointer';

          const 偏移量 = {
            x: this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x,
            y: this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y,
          };

          // 移动所有多选形状
          this.全局属性.多选初始位置组.forEach((初始位置) => {
            const 形状 = 初始位置.形状;

            // 对于文本，坐标是基线位置，需要根据初始坐标和偏移量更新
            if (形状.形状 === "文本" && 初始位置.按下时坐标) {
              形状.坐标.x = 初始位置.按下时坐标.x + 偏移量.x;
              形状.坐标.y = 初始位置.按下时坐标.y + 偏移量.y;
              // 重新计算顶点坐标组
              this.更新文本形状(形状);
            } else {
              // 其他形状通过顶点坐标组移动
              if (初始位置.按下时顶点坐标组 && 初始位置.按下时顶点坐标组.length > 0) {
                // 对于多边形，通过坐标移动然后重新计算顶点坐标组
                if (形状.形状 === "多边形" && 初始位置.按下时坐标) {
                  形状.坐标.x = 初始位置.按下时坐标.x + 偏移量.x;
                  形状.坐标.y = 初始位置.按下时坐标.y + 偏移量.y;
                  // 重新计算顶点坐标组
                  形状.顶点坐标组 = this.获取多边形顶点坐标组(
                    形状.坐标.x,
                    形状.坐标.y,
                    形状.尺寸.水平半径,
                    形状.尺寸.垂直半径,
                    形状.边数,
                    形状.起始弧度,
                    形状.旋转弧度 || 0
                  );
                } else if (形状.形状 === "多角星" && 初始位置.按下时坐标) {
                  // 对于多角星，通过坐标移动然后重新计算顶点坐标组
                  形状.坐标.x = 初始位置.按下时坐标.x + 偏移量.x;
                  形状.坐标.y = 初始位置.按下时坐标.y + 偏移量.y;
                  // 重新计算外顶点和内顶点
                  形状.外顶点坐标组 = this.获取多边形顶点坐标组(
                    形状.坐标.x,
                    形状.坐标.y,
                    形状.尺寸.外半径.水平,
                    形状.尺寸.外半径.垂直,
                    形状.边数,
                    形状.起始弧度,
                    形状.旋转弧度 || 0
                  );
                  形状.内顶点坐标组 = this.获取多边形顶点坐标组(
                    形状.坐标.x,
                    形状.坐标.y,
                    形状.尺寸.内半径.水平,
                    形状.尺寸.内半径.垂直,
                    形状.边数,
                    形状.起始弧度 + Math.PI / 形状.边数,
                    形状.旋转弧度 || 0
                  );
                } else {
                  // 其他形状通过顶点坐标组移动
                  for (let i = 0; i < 形状.顶点坐标组.length && i < 初始位置.按下时顶点坐标组.length; i++) {
                    形状.顶点坐标组[i].x = 初始位置.按下时顶点坐标组[i].x + 偏移量.x;
                    形状.顶点坐标组[i].y = 初始位置.按下时顶点坐标组[i].y + 偏移量.y;
                  }
                  // 对于图像，还需要更新坐标和中心
                  if (形状.形状 === "图像") {
                    形状.坐标.x = 形状.顶点坐标组[0].x;
                    形状.坐标.y = 形状.顶点坐标组[0].y;
                  }
                }
              } else if (
                初始位置.按下时坐标 &&
                (形状.形状 === "圆" || 形状.形状 === "多边形" || 形状.形状 === "多角星")
              ) {
                // 对于圆形、多边形、多角星等使用坐标的形状
                形状.坐标.x = 初始位置.按下时坐标.x + 偏移量.x;
                形状.坐标.y = 初始位置.按下时坐标.y + 偏移量.y;
              }
            }

            // 更新极值坐标、中心等属性
            if (
              形状.形状 === "多边形" ||
              形状.形状 === "多角星" ||
              形状.形状 === "矩形" ||
              形状.形状 === "图像" ||
              形状.形状 === "直线" ||
              形状.形状 === "自由" ||
              形状.形状 === "箭头" ||
              形状.形状 === "文本" ||
              形状.形状 === "圆"
            ) {
              形状.极值坐标 = this.获取极值坐标(形状);
              // 对于图像和文本，更新中心坐标
              if (形状.形状 === "图像" || 形状.形状 === "文本") {
                形状.中心 = 形状.极值坐标.中心;
              }
              // 对于箭头，更新起点和终点
              if (形状.形状 === "箭头") {
                this.更新箭头起点终点(形状);
              }
            }

            this.更新路径(形状);
          });

          this.清空画布();
          this.绘制基础形状对象组();
          return;
        }

        // 检测鼠标是否在多选整体交互框的句柄或边界上，设置cursor样式
        if (this.全局属性.多选形状组.length > 0 && !this.全局标志.左键已按下) {
          const 多选边界位置 = this.鼠标位于多选整体交互框边界();
          // 检查鼠标是否在整体交互框内部
          const 鼠标在交互框内 = this.鼠标位于多选整体交互框内();

          if (多选边界位置) {
            // 如果鼠标在句柄或边界上，设置相应的cursor样式
            if (多选边界位置.位于句柄) {
              // 句柄：如果按住Ctrl键，显示旋转光标；否则根据位置设置不同的cursor样式
              if (this.键盘状态.Control) {
                this.canvas.style.cursor = 'url("/Images/Common/busy.png") 10 10, pointer';
              } else {
                // 根据位置设置不同的cursor样式
                const 边界 = this.获取多选形状的边界();
                if (边界) {
                  const { minX, minY, maxX, maxY } = 边界;
                  const 鼠标X = this.全局属性.鼠标坐标.x;
                  const 鼠标Y = this.全局属性.鼠标坐标.y;

                  // 确定是哪个角的句柄（使用极值坐标的角，不包含外边距）
                  const 左上距离 = Math.sqrt(Math.pow(鼠标X - minX, 2) + Math.pow(鼠标Y - minY, 2));
                  const 右上距离 = Math.sqrt(Math.pow(鼠标X - maxX, 2) + Math.pow(鼠标Y - minY, 2));
                  const 右下距离 = Math.sqrt(Math.pow(鼠标X - maxX, 2) + Math.pow(鼠标Y - maxY, 2));
                  const 左下距离 = Math.sqrt(Math.pow(鼠标X - minX, 2) + Math.pow(鼠标Y - maxY, 2));

                  // 判断最近的句柄
                  const 最近距离 = Math.min(左上距离, 右上距离, 右下距离, 左下距离);
                  if (最近距离 === 左上距离 || 最近距离 === 右下距离) {
                    // 左上或右下句柄
                    this.canvas.style.cursor = 'url("/Images/Common/鼠标-西北-东南.cur"), pointer';
                  } else {
                    // 右上或左下句柄
                    this.canvas.style.cursor = 'url("/Images/Common/鼠标-东北-西南.cur"), pointer';
                  }
                }
              }
            } else if (多选边界位置.上 || 多选边界位置.下) {
              // 上下边界
              this.canvas.style.cursor = 'url("/Images/Common/鼠标-南北.cur"), pointer';
            } else if (多选边界位置.左 || 多选边界位置.右) {
              // 左右边界
              this.canvas.style.cursor = 'url("/Images/Common/鼠标-东西.cur"), pointer';
            }
            // 不需要继续处理单个形状的交互框
            this.清空画布();
            this.绘制基础形状对象组();
            return;
          } else if (鼠标在交互框内) {
            // 鼠标在交互框内部，但不在句柄或边界上，使用默认cursor
            this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), pointer';
            // 检测悬停形状（鼠标在交互框内时，也可以悬停到交互框内的其他形状）
            if (!this.全局标志.拖拽中) {
              this.全局属性.悬停形状 = this.鼠标位于形状内();
            }
            // 不需要继续处理单个形状的交互框
            this.清空画布();
            this.绘制基础形状对象组();
            return;
          } else {
            // 鼠标在交互框外面，使用默认cursor
            this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), pointer';
            if (!this.全局标志.拖拽中) {
              this.全局属性.悬停形状 = this.鼠标位于形状内();
            }
            // 不需要继续处理单个形状的交互框
            this.清空画布();
            this.绘制基础形状对象组();
            return;
          }
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
              this.全局属性.选中形状.形状 !== "箭头" &&
              this.全局属性.选中形状.形状 !== "文本" &&
              this.全局属性.偏移量
            ) {
              this.全局属性.选中形状.坐标.x = this.全局属性.鼠标坐标.x + this.全局属性.偏移量.x;
              this.全局属性.选中形状.坐标.y = this.全局属性.鼠标坐标.y + this.全局属性.偏移量.y;
            } else {
              const 偏移量 = {
                x: this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x,
                y: this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y,
              };

              // 对于文本，坐标是基线位置，需要根据初始坐标和偏移量更新
              if (this.全局属性.选中形状.形状 === "文本" && this.全局属性.选中形状.按下时坐标) {
                this.全局属性.选中形状.坐标.x = this.全局属性.选中形状.按下时坐标.x + 偏移量.x;
                this.全局属性.选中形状.坐标.y = this.全局属性.选中形状.按下时坐标.y + 偏移量.y;
                // 重新计算顶点坐标组
                this.更新文本形状(this.全局属性.选中形状);
              } else {
                // 其他形状通过顶点坐标组移动
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
            }
            if (
              this.全局属性.选中形状.形状 === "多边形" ||
              this.全局属性.选中形状.形状 === "多角星" ||
              this.全局属性.选中形状.形状 === "矩形" ||
              this.全局属性.选中形状.形状 === "图像" ||
              this.全局属性.选中形状.形状 === "直线" ||
              this.全局属性.选中形状.形状 === "自由" ||
              this.全局属性.选中形状.形状 === "箭头" ||
              this.全局属性.选中形状.形状 === "文本"
            ) {
              this.全局属性.选中形状.极值坐标 = this.获取极值坐标(this.全局属性.选中形状);
              // 对于图像和文本，更新中心坐标
              if (this.全局属性.选中形状.形状 === "图像" || this.全局属性.选中形状.形状 === "文本") {
                this.全局属性.选中形状.中心 = this.全局属性.选中形状.极值坐标.中心;
              }
              // 对于箭头，更新起点和终点
              if (this.全局属性.选中形状.形状 === "箭头") {
                this.更新箭头起点终点(this.全局属性.选中形状);
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
                // 如果点击时锚点为null，使用极值坐标的中心作为备用
                if (!锚点 && this.全局属性.选中形状.极值坐标 && this.全局属性.选中形状.极值坐标.中心) {
                  锚点 = this.全局属性.选中形状.极值坐标.中心;
                }
              }
              let 弧度差 = this.获取弧度差(
                锚点.x,
                锚点.y,
                this.全局属性.点击坐标.x,
                this.全局属性.点击坐标.y,
                this.全局属性.鼠标坐标.x,
                this.全局属性.鼠标坐标.y
              );

              // 按住Shift键时，旋转角度量化到45度（π/4）的倍数（8个象限）
              if (this.键盘状态.Shift) {
                // 对于有旋转弧度属性的形状，使用旋转弧度进行量化
                if (this.全局属性.选中形状.形状 !== "直线" && this.全局属性.选中形状.形状 !== "自由") {
                  // 计算目标旋转弧度
                  const 点击时旋转弧度 = this.全局属性.选中形状.点击时旋转弧度 || 0;
                  let 目标旋转弧度 = 点击时旋转弧度 - 弧度差;

                  // 将目标旋转弧度转换到 [0, 2π) 范围
                  while (目标旋转弧度 < 0) {
                    目标旋转弧度 += Math.PI * 2;
                  }
                  while (目标旋转弧度 >= Math.PI * 2) {
                    目标旋转弧度 -= Math.PI * 2;
                  }

                  // 量化到最近的45度
                  const 角度步长 = Math.PI / 4; // 45度
                  const 量化后旋转弧度 = Math.round(目标旋转弧度 / 角度步长) * 角度步长;

                  // 重新计算弧度差
                  弧度差 = 点击时旋转弧度 - 量化后旋转弧度;
                } else {
                  // 对于直线和自由形状，使用累积旋转弧度进行量化
                  // 累积旋转弧度 = 从点击位置到当前鼠标位置的总角度差
                  // 由于每次弧度差都是相对于点击位置计算的，所以直接使用当前的弧度差
                  // 量化累积旋转弧度（即量化当前弧度差的绝对值）
                  const 当前累积旋转弧度 = Math.abs(弧度差);
                  const 角度步长 = Math.PI / 4; // 45度
                  const 量化后累积旋转弧度 = Math.round(当前累积旋转弧度 / 角度步长) * 角度步长;

                  // 重新计算弧度差（保持符号）
                  const 符号 = Math.sign(弧度差);
                  弧度差 = 符号 * 量化后累积旋转弧度;
                }
              }

              this.全局属性.选中形状.累积旋转弧度 = Math.abs(弧度差);
              if (
                this.全局属性.选中形状.形状 === "矩形" ||
                this.全局属性.选中形状.形状 === "图像" ||
                this.全局属性.选中形状.形状 === "箭头"
              ) {
                // 确保点击时顶点坐标组存在
                if (this.全局属性.选中形状.点击时顶点坐标组 && this.全局属性.选中形状.顶点坐标组) {
                  for (let i = 0; i < this.全局属性.选中形状.点击时顶点坐标组.length; i++) {
                    this.全局属性.选中形状.顶点坐标组[i] = this.旋转坐标(
                      this.全局属性.选中形状.点击时顶点坐标组[i],
                      锚点,
                      -弧度差
                    );
                  }
                }
                this.全局属性.选中形状.极值坐标 = this.获取极值坐标(this.全局属性.选中形状);

                // 对于图像，还需要更新坐标和中心
                if (this.全局属性.选中形状.形状 === "图像") {
                  this.全局属性.选中形状.坐标.x = this.全局属性.选中形状.顶点坐标组[0].x;
                  this.全局属性.选中形状.坐标.y = this.全局属性.选中形状.顶点坐标组[0].y;
                  this.全局属性.选中形状.中心 = this.全局属性.选中形状.极值坐标.中心;
                }

                // 对于箭头，还需要更新起点和终点
                if (this.全局属性.选中形状.形状 === "箭头") {
                  this.更新箭头起点终点(this.全局属性.选中形状);
                }

                // 记录矩形、图像和箭头的累积旋转弧度（用于绘制交互框）
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
              } else if (this.全局属性.选中形状.形状 === "文本") {
                // 文本特殊处理：只更新旋转弧度，坐标保持不变
                // 坐标始终是未旋转的左边中心点

                // 更新旋转弧度
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

                // 重新生成顶点和极值坐标
                this.更新文本形状(this.全局属性.选中形状);
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
                // 更新极值坐标
                this.全局属性.选中形状.极值坐标 = this.获取极值坐标(this.全局属性.选中形状);
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
                // 在旋转前记录形状初始状态
                this.记录形状初始状态(this.全局属性.选中形状);
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
            // 如果按住Shift，将直线方向固定到8个特定角度
            let 目标x = this.全局属性.鼠标坐标.x;
            let 目标y = this.全局属性.鼠标坐标.y;

            if (this.键盘状态.Shift) {
              const dx = 目标x - 最后坐标.x;
              const dy = 目标y - 最后坐标.y;
              const 距离 = Math.sqrt(dx * dx + dy * dy);

              if (距离 > 0) {
                // 计算当前角度（弧度）
                let 角度 = Math.atan2(dy, dx);

                // 将角度转换到 [0, 2π) 范围
                if (角度 < 0) {
                  角度 += Math.PI * 2;
                }

                // 将角度量化到最近的45度（π/4）
                const 角度步长 = Math.PI / 4; // 45度
                const 量化后角度 = Math.round(角度 / 角度步长) * 角度步长;

                // 根据量化后的角度计算新的目标点
                目标x = 最后坐标.x + 距离 * Math.cos(量化后角度);
                目标y = 最后坐标.y + 距离 * Math.sin(量化后角度);
              }
            }

            this.绘制辅助虚线(最后坐标.x, 最后坐标.y, 目标x, 目标y);
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
      } else if (this.全局属性.已选中基础形状 === "箭头") {
        this.当前形状对象.形状 = "箭头";
        this.当前形状对象.起点 = { x: this.全局属性.点击坐标.x, y: this.全局属性.点击坐标.y };

        // 如果按住Shift，将箭头方向固定到8个特定角度
        let 终点x = this.全局属性.鼠标坐标.x;
        let 终点y = this.全局属性.鼠标坐标.y;

        if (this.键盘状态.Shift) {
          const dx = 终点x - this.当前形状对象.起点.x;
          const dy = 终点y - this.当前形状对象.起点.y;
          const 距离 = Math.sqrt(dx * dx + dy * dy);

          if (距离 > 0) {
            // 计算当前角度（弧度）
            let 角度 = Math.atan2(dy, dx);

            // 将角度转换到 [0, 2π) 范围
            if (角度 < 0) {
              角度 += Math.PI * 2;
            }

            // 将角度量化到最近的45度（π/4）
            const 角度步长 = Math.PI / 4; // 45度
            const 量化后角度 = Math.round(角度 / 角度步长) * 角度步长;

            // 根据量化后的角度计算新的终点
            终点x = this.当前形状对象.起点.x + 距离 * Math.cos(量化后角度);
            终点y = this.当前形状对象.起点.y + 距离 * Math.sin(量化后角度);
          }
        }

        this.当前形状对象.终点 = { x: 终点x, y: 终点y };

        // 计算箭头的初始旋转弧度（根据起点和终点的方向）
        const dx = this.当前形状对象.终点.x - this.当前形状对象.起点.x;
        const dy = this.当前形状对象.终点.y - this.当前形状对象.起点.y;
        this.当前形状对象.旋转弧度 = Math.atan2(dy, dx);

        // 计算箭头的顶点坐标组（用于碰撞检测和交互）
        this.当前形状对象.顶点坐标组 = this.计算箭头顶点坐标组(this.当前形状对象.起点, this.当前形状对象.终点);

        this.当前形状对象.极值坐标 = this.获取极值坐标(this.当前形状对象);

        if (this.全局标志.辅助视觉效果) {
          this.绘制操作说明();
        }

        const 箭头对象 = this.绘制箭头(
          this.当前形状对象.起点,
          this.当前形状对象.终点,
          this.全局属性.箭头描边色,
          this.全局属性.描边宽度
        );
        this.当前形状对象.路径 = 箭头对象.路径;
        this.当前形状对象.描边宽度 = 箭头对象.描边宽度;
        this.当前形状对象.描边色 = this.全局属性.箭头描边色;
        this.当前形状对象.填充色 = this.全局属性.箭头填充色;

        if (this.全局标志.辅助视觉效果) {
          this.绘制辅助点(this.当前形状对象.起点.x, this.当前形状对象.起点.y);
        }
      }
      if (
        this.全局标志.辅助视觉效果 &&
        this.全局属性.已选中基础形状 &&
        this.全局属性.已选中基础形状 !== "矩形" &&
        this.全局属性.已选中基础形状 !== "直线" &&
        this.全局属性.已选中基础形状 !== "选择路径" &&
        this.全局属性.已选中基础形状 !== "箭头"
      ) {
        this.绘制辅助点(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
      }
    });
  }

  添加canvas按下左键事件() {
    // 处理右键点击：重置绘制相关状态，防止右键菜单后左键点击直接绘制
    this.canvas.addEventListener("contextmenu", (e) => {
      // 重置绘制相关状态
      this.全局属性.点击坐标 = null;
      this.全局标志.左键已按下 = false;
      this.全局标志.拖拽中 = false;
      this.全局标志.正在框选 = false;
      this.全局标志.缩放中 = false;
      this.全局标志.旋转中 = false;
      // 不阻止右键菜单的默认行为，允许显示右键菜单
    });

    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;

      // 如果正在文本编辑模式，点击画布外确认文本
      if (this.全局标志.文本编辑中) {
        this.退出文本编辑模式();
        return;
      }

      this.全局标志.左键已按下 = true;
      this.全局标志.手动调整内半径 = false;
      this.全局属性.点击坐标 = this.全局属性.鼠标坐标;
      this.当前形状对象.描边宽度 = this.全局属性.描边宽度;

      // 文本工具：点击画布创建新文本输入框
      if (this.全局属性.已选中基础形状 === "文本" && !this.全局标志.文本编辑中) {
        // 如果有选中的形状，取消选中状态
        if (this.全局属性.选中形状) {
          this.全局属性.选中形状.已选中 = false;
          this.全局属性.选中形状.已悬停 = false;
          this.全局属性.选中形状 = null;
          this.恢复用户全局颜色到拾色器();
          // 重绘画布以清除交互框
          this.清空画布();
          this.绘制基础形状对象组();
        }

        // 文本工具总是创建新文本，不进入已有文本的编辑模式
        this.进入文本编辑模式(this.全局属性.点击坐标.x, this.全局属性.点击坐标.y);
        return;
      }

      // 检测Alt+拖拽复制：当按住Alt键且鼠标悬停在形状上时，或者多选组内
      if (this.键盘状态.Alt) {
        // 首先检查是否在多选整体交互框内（复制组）
        if (this.全局属性.多选形状组.length > 0 && this.鼠标位于多选整体交互框内()) {
          this.全局标志.Alt拖拽复制中 = true;
          this.全局属性.复制源组 = [...this.全局属性.多选形状组];

          // 创建预览组（深度克隆所有形状）
          this.全局属性.复制预览组 = this.全局属性.复制源组.map((形状) => {
            if (形状.形状 === "图像") {
              return {
                形状: 形状.形状,
                图像对象: 形状.图像对象,
                坐标: { x: 形状.坐标.x, y: 形状.坐标.y },
                中心: { x: 形状.中心.x, y: 形状.中心.y },
                尺寸: { 宽: 形状.尺寸.宽, 高: 形状.尺寸.高 },
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
              const path = 形状.路径;
              形状.路径 = null;
              const 预览形状 = structuredClone(形状);
              形状.路径 = path;
              预览形状.路径 = null;
              预览形状.已选中 = false;
              预览形状.已悬停 = false;
              return 预览形状;
            }
          });

          // 记录初始鼠标位置
          this.全局属性.复制预览组.forEach((预览形状) => {
            预览形状.初始鼠标位置 = {
              x: this.全局属性.点击坐标.x,
              y: this.全局属性.点击坐标.y,
            };
          });

          // 初始化预览形状的路径
          this.全局属性.复制预览组.forEach((预览形状) => {
            预览形状.极值坐标 = this.获取极值坐标(预览形状);
            this.更新路径(预览形状);
          });

          // 清除所有形状的悬停状态和Alt预览状态
          for (const 形状 of this.数据集.基础形状对象组) {
            形状.已悬停 = false;
            形状.Alt预览中 = false;
          }

          // 立即绘制预览组
          this.清空画布();
          this.绘制基础形状对象组();

          const 原透明度 = this.ctx.globalAlpha;
          this.ctx.globalAlpha = 0.33;
          this.全局属性.复制预览组.forEach((预览形状) => {
            this.绘制单个形状(预览形状);
          });
          this.ctx.globalAlpha = 原透明度;
          return; // 阻止其他事件处理
        }

        const 悬停形状 = this.鼠标位于形状内();
        if (悬停形状) {
          // 检查悬停的形状是否属于某个编组
          if (this.形状已编组(悬停形状)) {
            // 如果形状属于编组，复制整个编组
            const 组内形状 = this.获取组内所有形状(悬停形状);

            if (组内形状.length > 0) {
              this.全局标志.Alt拖拽复制中 = true;
              this.全局属性.复制源组 = [...组内形状];

              // 创建预览组（深度克隆所有形状）
              this.全局属性.复制预览组 = this.全局属性.复制源组.map((形状) => {
                if (形状.形状 === "图像") {
                  return {
                    形状: 形状.形状,
                    图像对象: 形状.图像对象,
                    坐标: { x: 形状.坐标.x, y: 形状.坐标.y },
                    中心: { x: 形状.中心.x, y: 形状.中心.y },
                    尺寸: { 宽: 形状.尺寸.宽, 高: 形状.尺寸.高 },
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
                  const path = 形状.路径;
                  形状.路径 = null;
                  const 预览形状 = structuredClone(形状);
                  形状.路径 = path;
                  预览形状.路径 = null;
                  预览形状.已选中 = false;
                  预览形状.已悬停 = false;
                  return 预览形状;
                }
              });

              // 记录初始鼠标位置
              this.全局属性.复制预览组.forEach((预览形状) => {
                预览形状.初始鼠标位置 = {
                  x: this.全局属性.点击坐标.x,
                  y: this.全局属性.点击坐标.y,
                };
              });

              // 初始化预览形状的路径
              this.全局属性.复制预览组.forEach((预览形状) => {
                预览形状.极值坐标 = this.获取极值坐标(预览形状);
                this.更新路径(预览形状);
              });

              // 清除所有形状的悬停状态和Alt预览状态
              for (const 形状 of this.数据集.基础形状对象组) {
                形状.已悬停 = false;
                形状.Alt预览中 = false;
              }

              // 立即绘制预览组
              this.清空画布();
              this.绘制基础形状对象组();

              const 原透明度 = this.ctx.globalAlpha;
              this.ctx.globalAlpha = 0.33;
              this.全局属性.复制预览组.forEach((预览形状) => {
                this.绘制单个形状(预览形状);
              });
              this.ctx.globalAlpha = 原透明度;
              return; // 阻止其他事件处理
            }
          }

          // 如果形状不属于编组，复制单个形状
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
      if (this.全局属性.选中形状 && this.交互框) {
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
            // 文本特殊处理：只允许等比缩放，禁止边界拖拽，只允许句柄
            if (this.全局属性.选中形状.形状 === "文本") {
              // 只允许句柄拖拽
              if (!位于句柄) {
                return; // 禁止边界缩放
              }
            }

            // 箭头特殊处理：只允许缩放长边（沿着箭头方向），禁止缩放短边
            if (this.全局属性.选中形状.形状 === "箭头") {
              // 判断交互框的宽高
              const 交互框宽 = this.交互框.尺寸.width;
              const 交互框高 = this.交互框.尺寸.height;

              // 禁止句柄缩放
              if (位于句柄) {
                return;
              }

              // 判断哪个是长边（沿着箭头方向）：长边允许缩放，短边禁止
              // 当宽>高时，左右边是长边（沿着箭头方向），上下边是短边（垂直于箭头）
              // 当高>宽时，上下边是长边（沿着箭头方向），左右边是短边（垂直于箭头）
              const 宽大于高 = 交互框宽 > 交互框高;

              if (宽大于高) {
                // 箭头横向：左右边是长边，允许；上下边是短边，禁止
                if (this.交互框.鼠标位于边界.上 || this.交互框.鼠标位于边界.下) {
                  return; // 禁止上下边界缩放
                }
              } else {
                // 箭头纵向：上下边是长边，允许；左右边是短边，禁止
                if (this.交互框.鼠标位于边界.左 || this.交互框.鼠标位于边界.右) {
                  return; // 禁止左右边界缩放
                }
              }
            }

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
          // 首先检查：如果按住Shift点击的是已编组的形状，且当前有未编组的形状（单选或多选），将它们加入该编组
          if (this.全局标志.Shift已按下 && this.全局属性.悬停形状 && this.形状已编组(this.全局属性.悬停形状)) {
            // 保存当前状态（在所有操作之前）
            const 当前选中形状 = this.全局属性.选中形状;
            const 当前多选形状组 = [...this.全局属性.多选形状组];

            // 检查是否有未编组的形状（单选或多选）
            const 有未编组单选 = 当前选中形状 && !this.形状已编组(当前选中形状);
            const 有未编组多选 = 当前多选形状组.length > 0 && 当前多选形状组.some((形状) => !形状.所属组ID);

            if (有未编组单选 || 有未编组多选) {
              const 目标组ID = this.全局属性.悬停形状.所属组ID;
              const 要加入组的形状 = [];

              // 收集所有未编组的形状
              if (有未编组单选 && !要加入组的形状.includes(当前选中形状)) {
                要加入组的形状.push(当前选中形状);
              }
              当前多选形状组.forEach((形状) => {
                if (!形状.所属组ID && !要加入组的形状.includes(形状)) {
                  要加入组的形状.push(形状);
                }
              });

              if (要加入组的形状.length > 0) {
                // 保存初始组状态（在添加任何形状之前）
                const 初始组形状 = [...this.数据集.形状组[目标组ID]];

                // 保存操作前的选中状态（用于撤销后恢复选中）
                const 操作前选中形状 = 当前选中形状;
                const 操作前多选形状组 = [...当前多选形状组];

                // 将所有未编组的形状加入该编组
                要加入组的形状.forEach((形状, 索引) => {
                  // 如果是第一个形状，使用初始组状态；否则使用当前组状态
                  const 当前操作前组形状 = 索引 === 0 ? 初始组形状 : [...this.数据集.形状组[目标组ID]];
                  this.将形状添加到组(形状, 目标组ID);
                  this.数据集.操作记录.push({
                    操作类型: "添加形状到编组",
                    组ID: 目标组ID,
                    添加的形状: 形状,
                    操作前组形状: 当前操作前组形状,
                    操作前选中形状: 索引 === 0 ? 操作前选中形状 : undefined,
                    操作前多选形状组: 索引 === 0 ? 操作前多选形状组 : undefined,
                  });
                });

                // 获取组内所有形状
                const 组内形状 = this.获取组内所有形状(this.全局属性.悬停形状);

                // 清空多选组，然后添加组内所有形状
                this.清空多选组();
                组内形状.forEach((形状) => {
                  this.添加到多选组(形状);
                });

                // 清除选中形状
                if (this.全局属性.选中形状) {
                  this.全局属性.选中形状.已选中 = false;
                }
                this.全局属性.选中形状 = null;

                // 清除悬停状态
                for (const 形状 of this.数据集.基础形状对象组) {
                  形状.已悬停 = false;
                }
                this.全局属性.悬停形状 = null;

                // 启用撤销按钮
                this.撤销按钮.classList.remove("禁用");

                // 更新按钮状态
                this.根据选中形状索引修改处理按钮状态();

                // 重新绘制
                this.清空画布();
                this.绘制基础形状对象组();
                return;
              }
            }
          }

          // 如果按住Shift且点击了另一个形状，进入多选模式
          if (this.全局标志.Shift已按下 && this.全局属性.悬停形状 && this.全局属性.已选中基础形状 === "选择路径") {
            // 将当前选中的形状加入多选组
            if (this.全局属性.选中形状 && !this.全局属性.选中形状.已多选) {
              this.添加到多选组(this.全局属性.选中形状);
              this.全局属性.选中形状.已选中 = false;
              this.全局属性.选中形状 = null;
            }

            // 将悬停的形状加入多选组（如果还未加入）
            if (!this.全局属性.悬停形状.已多选) {
              this.添加到多选组(this.全局属性.悬停形状);
            }

            // 如果只有一个形状，转换为单选
            if (this.全局属性.多选形状组.length === 1) {
              const 单个形状 = this.全局属性.多选形状组[0];
              this.清空多选组();
              this.全局属性.选中形状 = 单个形状;
              单个形状.已选中 = true;
              this.更新描边宽度滑块(单个形状);
              this.应用选中形状的颜色到拾色器(单个形状);
              this.删除按钮.classList.remove("禁用");
            } else if (this.全局属性.多选形状组.length > 0) {
              // 如果有多选，更新删除按钮状态
              this.删除按钮.classList.remove("禁用");
            }

            // 更新按钮状态（包括编组按钮）
            this.根据选中形状索引修改处理按钮状态();

            this.清空画布();
            this.绘制基础形状对象组();
            return;
          }

          const 之前选中的是箭头 = this.全局属性.选中形状.形状 === "箭头";
          this.全局属性.选中形状.已选中 = false;
          if (!this.全局属性.悬停形状) {
            this.全局属性.选中形状 = null;
            this.交互框 = null;
            this.删除按钮.classList.add("禁用");
            // 取消选中时，恢复描边宽度滑块的max为20
            const 描边宽度滑块 = document.getElementById("描边宽度");
            描边宽度滑块.max = 20;
            // 如果之前选中的是箭头，恢复描边宽度到非箭头工具的值
            if (之前选中的是箭头) {
              this.全局属性.描边宽度 = this.本地存储池.描边宽度;
              描边宽度滑块.value = this.本地存储池.描边宽度;
              描边宽度滑块.nextElementSibling.textContent = this.本地存储池.描边宽度;
            }
            this.恢复用户全局颜色到拾色器();

            // 当选中一个形状时，用选择路径工具进行框选，会来到这个分支
            // 按下鼠标后会取消选择当前形状，然后开始框选
            if (this.全局属性.已选中基础形状 === "选择路径") {
              this.全局标志.正在框选 = true;
              this.全局属性.框选起点 = { ...this.全局属性.点击坐标 };
              this.全局属性.框选终点 = { ...this.全局属性.点击坐标 };
            }
          } else if (this.全局属性.选中形状 !== this.全局属性.悬停形状) {
            // 清空多选组（如果有）
            this.清空多选组();

            this.全局属性.选中形状 = this.全局属性.悬停形状;
            this.全局属性.选中形状.已选中 = true;
            this.更新描边宽度滑块(this.全局属性.选中形状);
            this.应用选中形状的颜色到拾色器(this.全局属性.选中形状);
            const 鼠标在内形状 = this.鼠标位于形状内();
            if (鼠标在内形状) {
              // 检查是否点击了已编组的形状
              if (this.形状已编组(鼠标在内形状)) {
                // 如果点击了已编组的形状，自动选择整个组
                const 组内形状 = this.获取组内所有形状(鼠标在内形状);
                if (组内形状.length > 0) {
                  // 清除所有形状的悬停状态，避免显示悬停样式
                  for (const 形状 of this.数据集.基础形状对象组) {
                    形状.已悬停 = false;
                  }
                  // 先清除单选状态（在添加到多选组之前，因为添加到多选组会在多选组长度>1时清除选中状态）
                  if (this.全局属性.选中形状) {
                    this.全局属性.选中形状.已选中 = false;
                  }
                  // 清空多选组，然后添加组内所有形状
                  this.清空多选组();
                  组内形状.forEach((形状) => {
                    this.添加到多选组(形状);
                  });
                  // 确保选中形状已清除（添加到多选组内部可能已经清除了）
                  this.全局属性.选中形状 = null;
                  // 清除全局悬停状态
                  this.全局属性.悬停形状 = null;
                  // 更新按钮状态
                  this.根据选中形状索引修改处理按钮状态();

                  // 立即开始拖拽（因为鼠标刚刚点击了编组内的形状，应该立即可以拖拽）
                  // 参考单个形状的逻辑：点击形状后立即设置拖拽标志（见3649行和3975行）
                  this.全局标志.多选拖拽中 = true;
                  this.全局标志.拖拽中 = true;

                  // 记录所有多选形状的初始位置
                  this.全局属性.多选初始位置组 = this.全局属性.多选形状组.map((形状) => ({
                    形状: 形状,
                    按下时坐标: structuredClone(形状.坐标),
                    按下时顶点坐标组: structuredClone(形状.顶点坐标组),
                    按下时旋转弧度: 形状.旋转弧度 ? structuredClone(形状.旋转弧度) : undefined,
                    按下时字号: 形状.字号 ? structuredClone(形状.字号) : undefined,
                  }));

                  // 重新绘制（立即显示整体交互框和多选预览交互框）
                  this.清空画布();
                  this.绘制基础形状对象组();
                  return;
                }
              }

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
                this.全局属性.选中形状.形状 !== "图像" &&
                this.全局属性.选中形状.形状 !== "箭头" &&
                this.全局属性.选中形状.形状 !== "文本"
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
            this.全局属性.选中形状.形状 !== "图像" &&
            this.全局属性.选中形状.形状 !== "箭头"
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

        // 如果点击了已编组的形状，且没有按Shift，自动选择整个组
        if (!this.全局标志.Shift已按下 && 鼠标在内形状 && this.形状已编组(鼠标在内形状)) {
          // 清空多选组
          this.清空多选组();
          // 获取组内所有形状
          const 组内形状 = this.获取组内所有形状(鼠标在内形状);
          if (组内形状.length > 0) {
            // 清除所有形状的悬停状态，避免显示悬停样式
            for (const 形状 of this.数据集.基础形状对象组) {
              形状.已悬停 = false;
            }
            // 先清除单选状态（在添加到多选组之前，因为添加到多选组会在多选组长度>1时清除选中状态）
            if (this.全局属性.选中形状) {
              this.全局属性.选中形状.已选中 = false;
            }
            // 添加组内所有形状到多选组
            组内形状.forEach((形状) => {
              this.添加到多选组(形状);
            });
            // 确保选中形状已清除（添加到多选组内部可能已经清除了）
            this.全局属性.选中形状 = null;
            // 清除全局悬停状态
            this.全局属性.悬停形状 = null;
            // 更新按钮状态
            this.根据选中形状索引修改处理按钮状态();

            // 立即开始拖拽（因为鼠标刚刚点击了编组内的形状，应该立即可以拖拽）
            // 参考单个形状的逻辑：点击形状后立即设置拖拽标志
            this.全局标志.多选拖拽中 = true;
            this.全局标志.拖拽中 = true;

            // 记录所有多选形状的初始位置
            this.全局属性.多选初始位置组 = this.全局属性.多选形状组.map((形状) => ({
              形状: 形状,
              按下时坐标: structuredClone(形状.坐标),
              按下时顶点坐标组: structuredClone(形状.顶点坐标组),
              按下时旋转弧度: 形状.旋转弧度 ? structuredClone(形状.旋转弧度) : undefined,
              按下时字号: 形状.字号 ? structuredClone(形状.字号) : undefined,
            }));

            // 重新绘制（立即显示整体交互框和多选预览交互框）
            this.清空画布();
            this.绘制基础形状对象组();
            return;
          }
        }

        // Shift+点击：多选模式
        if (this.全局标志.Shift已按下 && 鼠标在内形状) {
          // 首先检查：如果点击的是已编组的形状，且当前有未编组的形状（单选或多选），将它们加入该编组
          if (this.形状已编组(鼠标在内形状)) {
            // 保存当前状态（在所有操作之前）
            const 当前选中形状 = this.全局属性.选中形状;
            const 当前多选形状组 = [...this.全局属性.多选形状组];

            // 检查是否有未编组的形状（单选或多选）
            const 有未编组单选 = 当前选中形状 && !this.形状已编组(当前选中形状);
            const 有未编组多选 = 当前多选形状组.length > 0 && 当前多选形状组.some((形状) => !形状.所属组ID);

            if (有未编组单选 || 有未编组多选) {
              const 目标组ID = 鼠标在内形状.所属组ID;
              const 要加入组的形状 = [];

              // 收集所有未编组的形状
              if (有未编组单选 && !要加入组的形状.includes(当前选中形状)) {
                要加入组的形状.push(当前选中形状);
              }
              当前多选形状组.forEach((形状) => {
                if (!形状.所属组ID && !要加入组的形状.includes(形状)) {
                  要加入组的形状.push(形状);
                }
              });

              if (要加入组的形状.length > 0) {
                // 保存初始组状态（在添加任何形状之前）
                const 初始组形状 = [...this.数据集.形状组[目标组ID]];

                // 保存操作前的选中状态（用于撤销后恢复选中）
                const 操作前选中形状 = 当前选中形状;
                const 操作前多选形状组 = [...当前多选形状组];

                // 将所有未编组的形状加入该编组
                要加入组的形状.forEach((形状, 索引) => {
                  // 如果是第一个形状，使用初始组状态；否则使用当前组状态
                  const 当前操作前组形状 = 索引 === 0 ? 初始组形状 : [...this.数据集.形状组[目标组ID]];
                  this.将形状添加到组(形状, 目标组ID);
                  this.数据集.操作记录.push({
                    操作类型: "添加形状到编组",
                    组ID: 目标组ID,
                    添加的形状: 形状,
                    操作前组形状: 当前操作前组形状,
                    操作前选中形状: 索引 === 0 ? 操作前选中形状 : undefined,
                    操作前多选形状组: 索引 === 0 ? 操作前多选形状组 : undefined,
                  });
                });

                // 获取组内所有形状
                const 组内形状 = this.获取组内所有形状(鼠标在内形状);

                // 清空多选组，然后添加组内所有形状
                this.清空多选组();
                组内形状.forEach((形状) => {
                  this.添加到多选组(形状);
                });

                // 清除选中形状
                if (this.全局属性.选中形状) {
                  this.全局属性.选中形状.已选中 = false;
                }
                this.全局属性.选中形状 = null;

                // 清除悬停状态
                for (const 形状 of this.数据集.基础形状对象组) {
                  形状.已悬停 = false;
                }
                this.全局属性.悬停形状 = null;

                // 启用撤销按钮
                this.撤销按钮.classList.remove("禁用");

                // 更新按钮状态
                this.根据选中形状索引修改处理按钮状态();

                // 重新绘制
                this.清空画布();
                this.绘制基础形状对象组();
                return;
              }
            }
          }

          // 检查当前是否选中了一个编组（多选组内所有形状属于同一个组）
          let 当前编组ID = null;
          if (this.全局属性.多选形状组.length > 0) {
            const 第一个形状 = this.全局属性.多选形状组[0];
            const 已编组 =
              第一个形状.所属组ID !== undefined &&
              this.全局属性.多选形状组.every((形状) => 形状.所属组ID === 第一个形状.所属组ID);
            if (已编组) {
              当前编组ID = 第一个形状.所属组ID;
            }
          }

          // 如果当前选中了一个编组，且点击的形状不在当前编组内，将其加入编组
          if (当前编组ID && 鼠标在内形状.所属组ID !== 当前编组ID) {
            // 保存操作前的状态以便撤销
            const 操作前当前组形状 = [...this.数据集.形状组[当前编组ID]];
            let 操作前另一个组ID = null;
            let 操作前另一个组形状 = null;
            if (鼠标在内形状.所属组ID) {
              操作前另一个组ID = 鼠标在内形状.所属组ID;
              操作前另一个组形状 = [...this.数据集.形状组[操作前另一个组ID]];
            }

            // 如果点击的形状也在另一个编组内，合并两个编组
            if (操作前另一个组ID && 操作前另一个组ID !== 当前编组ID) {
              // 合并两个编组
              this.合并编组(操作前另一个组ID, 当前编组ID);

              // 记录操作以便撤销
              this.数据集.操作记录.push({
                操作类型: "合并编组",
                目标组ID: 当前编组ID,
                源组ID: 操作前另一个组ID,
                操作前当前组形状: 操作前当前组形状,
                操作前源组形状: 操作前另一个组形状,
              });

              // 将源组的所有形状添加到多选组（这样整体交互框才会显示所有形状）
              // 注意：合并后，源组的形状已经属于目标组了
              操作前另一个组形状.forEach((形状) => {
                if (this.数据集.基础形状对象组.includes(形状) && !形状.已多选) {
                  this.添加到多选组(形状);
                }
              });
            } else {
              // 只是将单个形状加入编组
              this.将形状添加到组(鼠标在内形状, 当前编组ID);

              // 记录操作以便撤销
              this.数据集.操作记录.push({
                操作类型: "添加形状到编组",
                组ID: 当前编组ID,
                添加的形状: 鼠标在内形状,
                操作前组形状: 操作前当前组形状,
              });
            }

            // 将形状添加到多选组（如果还未添加）
            if (!鼠标在内形状.已多选) {
              this.添加到多选组(鼠标在内形状);
            }

            // 启用撤销按钮
            this.撤销按钮.classList.remove("禁用");

            // 更新按钮状态（包括编组按钮）
            this.根据选中形状索引修改处理按钮状态();

            this.清空画布();
            this.绘制基础形状对象组();
            return;
          }

          // 如果有单选形状，先将其加入多选组
          if (this.全局属性.选中形状 && !this.全局属性.选中形状.已多选) {
            this.添加到多选组(this.全局属性.选中形状);
            this.全局属性.选中形状.已选中 = false;
            this.全局属性.选中形状 = null;
          }

          // 如果该形状已经在多选组中，延迟移除（等待mouseup判断是点击还是拖拽）
          if (鼠标在内形状.已多选) {
            // 检查当前是否选中了一个编组，且该形状属于这个编组
            let 需要记录移除操作 = false;
            let 移除前的组ID = null;
            let 移除前的组形状 = null;

            if (this.形状已编组(鼠标在内形状)) {
              const 形状所在组ID = 鼠标在内形状.所属组ID;

              // 检查当前是否选中了一个编组（之前已经计算过当前编组ID）
              if (当前编组ID && 形状所在组ID === 当前编组ID) {
                // 这是"选中一个编组时，按Shift键点击组内形状"的情况
                需要记录移除操作 = true;
                移除前的组ID = 形状所在组ID;
                移除前的组形状 = [...this.数据集.形状组[形状所在组ID]];
              }
            }

            // 记录待移除信息，等待mouseup判断是点击还是拖拽
            this.全局标志.Shift点击待移除 = true;
            this.全局属性.Shift点击待移除形状 = 鼠标在内形状;
            this.全局属性.Shift点击待移除信息 = {
              需要记录移除操作: 需要记录移除操作,
              移除前的组ID: 移除前的组ID,
              移除前的组形状: 移除前的组形状,
            };

            // 立即开始拖拽（如果用户拖拽，则移动形状但不移除）
            // 参考单个形状的逻辑：点击形状后立即设置拖拽标志
            this.全局标志.多选拖拽中 = true;
            this.全局标志.拖拽中 = true;

            // 记录所有多选形状的初始位置（包括待移除的形状）
            this.全局属性.多选初始位置组 = this.全局属性.多选形状组.map((形状) => ({
              形状: 形状,
              按下时坐标: structuredClone(形状.坐标),
              按下时顶点坐标组: structuredClone(形状.顶点坐标组),
              按下时旋转弧度: 形状.旋转弧度 ? structuredClone(形状.旋转弧度) : undefined,
              按下时字号: 形状.字号 ? structuredClone(形状.字号) : undefined,
            }));

            // 重新绘制
            this.清空画布();
            this.绘制基础形状对象组();
            return;
          } else {
            // 否则添加到多选组
            this.添加到多选组(鼠标在内形状);
          }

          // 根据剩余形状数量决定状态
          if (this.全局属性.多选形状组.length === 0) {
            // 多选组为空，清除所有选中状态
            this.删除按钮.classList.add("禁用");
            this.恢复用户全局颜色到拾色器();
          } else if (this.全局属性.多选形状组.length === 1) {
            // 只有一个形状，转换为单选
            const 单个形状 = this.全局属性.多选形状组[0];
            this.清空多选组();
            this.全局属性.选中形状 = 单个形状;
            单个形状.已选中 = true;
            this.更新描边宽度滑块(单个形状);
            this.应用选中形状的颜色到拾色器(单个形状);
            this.删除按钮.classList.remove("禁用");
          } else {
            // 如果多选组有多个形状，更新删除按钮状态
            this.删除按钮.classList.remove("禁用");
          }

          // 更新按钮状态（包括编组按钮）
          this.根据选中形状索引修改处理按钮状态();

          // 如果多选组有多个形状，保持多选状态，整体交互框会自动重新计算

          this.清空画布();
          this.绘制基础形状对象组();
          return;
        }

        // 如果已有多选，点击多选组内的形状不响应（只能操作整体交互框）
        if (this.全局属性.多选形状组.length > 0 && 鼠标在内形状 && 鼠标在内形状.已多选) {
          // 不处理，让用户只能操作整体交互框
          return;
        }

        // 正常单选模式
        if (鼠标在内形状) {
          // 如果点击的形状不在多选组中，清空多选组
          if (!鼠标在内形状.已多选) {
            this.清空多选组();
          }

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
        } else {
          // 没有点击到形状
          // 如果有多选，检查是否点击在整体交互框的句柄或边界上（旋转或缩放）
          if (this.全局属性.多选形状组.length > 0) {
            const 多选边界位置 = this.鼠标位于多选整体交互框边界();
            if (多选边界位置) {
              // 如果按住Ctrl键且在句柄上，开始旋转多选形状
              if (this.键盘状态.Control && 多选边界位置.位于句柄) {
                this.全局标志.多选旋转中 = true;
                this.全局标志.旋转中 = true;

                // 判断是编组
                const 是编组 =
                  this.全局属性.多选形状组.length > 0 &&
                  this.全局属性.多选形状组.every((形状) => 形状.所属组ID === this.全局属性.多选形状组[0].所属组ID) &&
                  this.全局属性.多选形状组[0].所属组ID !== undefined;

                // 获取初始边界（如果有保存的边界，使用保存的；否则使用当前边界）
                let 初始边界 = null;
                if (是编组) {
                  const 组ID = this.全局属性.多选形状组[0].所属组ID;
                  if (组ID && this.全局属性.编组旋转边界映射[组ID]) {
                    初始边界 = this.全局属性.编组旋转边界映射[组ID];
                  }
                } else {
                  const 多选标识 = this.全局属性.多选形状组
                    .map((形状) => this.数据集.基础形状对象组.indexOf(形状))
                    .sort()
                    .join(",");
                  if (this.全局属性.多选旋转边界映射[多选标识]) {
                    初始边界 = this.全局属性.多选旋转边界映射[多选标识];
                  }
                }

                // 如果没有保存的边界，使用当前边界
                if (!初始边界) {
                  初始边界 = this.获取多选形状的边界();
                }

                if (初始边界) {
                  const 锚点 = {
                    x: 初始边界.minX + 初始边界.width / 2,
                    y: 初始边界.minY + 初始边界.height / 2,
                  };
                  this.全局属性.多选旋转锚点 = 锚点;
                  // 记录初始边界中心（用于计算整体旋转角度）
                  this.全局属性.多选旋转初始边界中心 = {
                    x: 初始边界.minX + 初始边界.width / 2,
                    y: 初始边界.minY + 初始边界.height / 2,
                  };
                  // 记录初始边界（未旋转状态）
                  this.全局属性.多选旋转初始边界 = structuredClone(初始边界);
                  // 初始化整体旋转弧度为0
                  this.全局属性.多选整体旋转弧度 = 0;

                  // 记录所有形状的初始状态
                  this.全局属性.多选旋转初始位置组 = this.全局属性.多选形状组.map((形状) => {
                    // 对于矩形和图像，确保旋转弧度已计算（从顶点坐标组计算）
                    // 必须在保存顶点坐标组之前计算，因为计算依赖于顶点坐标组
                    let 当前旋转弧度 = 形状.旋转弧度;
                    if (
                      (形状.形状 === "矩形" || 形状.形状 === "图像") &&
                      形状.顶点坐标组 &&
                      形状.顶点坐标组.length === 4
                    ) {
                      // 总是从顶点坐标组重新计算旋转弧度，确保准确性
                      // 这确保使用的是当前的、最新的旋转弧度，而不是可能过时的形状.旋转弧度
                      当前旋转弧度 = this.计算矩形旋转角度(形状);
                      // 同时更新形状的旋转弧度，确保一致性
                      形状.旋转弧度 = 当前旋转弧度;
                    }

                    const 初始位置 = {
                      形状: 形状,
                      按下时坐标: structuredClone(形状.坐标),
                      按下时顶点坐标组: structuredClone(形状.顶点坐标组),
                      按下时旋转弧度: 当前旋转弧度 !== undefined ? 当前旋转弧度 : 0,
                      按下时字号: 形状.字号 !== undefined ? structuredClone(形状.字号) : undefined,
                    };
                    return 初始位置;
                  });

                  // 记录形状的初始状态（用于撤销）
                  this.全局属性.多选形状组.forEach((形状) => {
                    this.记录形状初始状态(形状);
                  });

                  return;
                }
              } else {
                // 点击在整体交互框的句柄或边界上，开始缩放多选形状
                this.全局标志.多选缩放中 = true;
                this.全局标志.缩放中 = true;

                // 获取多选形状的边界
                const 边界 = this.获取多选形状的边界();
                if (边界) {
                  // 记录初始边界和所有形状的初始状态
                  this.全局属性.多选缩放初始边界 = structuredClone(边界);
                  this.全局属性.多选缩放初始位置组 = this.全局属性.多选形状组.map((形状) => {
                    const 初始位置 = {
                      形状: 形状,
                      按下时坐标: structuredClone(形状.坐标),
                      按下时顶点坐标组: structuredClone(形状.顶点坐标组),
                      按下时旋转弧度: 形状.旋转弧度 !== undefined ? structuredClone(形状.旋转弧度) : undefined,
                      按下时字号: 形状.字号 !== undefined ? structuredClone(形状.字号) : undefined,
                      按下时尺寸: 形状.尺寸 ? structuredClone(形状.尺寸) : undefined,
                    };
                    // 为文本形状记录初始字号和尺寸
                    if (形状.形状 === "文本") {
                      形状.点击时字号 = 形状.字号;
                      形状.点击时尺寸 = structuredClone(形状.尺寸);
                    }
                    return 初始位置;
                  });

                  // 记录初始拖拽位置类型（句柄/上下边界/左右边界）
                  if (多选边界位置.位于句柄) {
                    this.全局属性.多选缩放初始拖拽类型 = "handle";
                  } else if (多选边界位置.上 || 多选边界位置.下) {
                    this.全局属性.多选缩放初始拖拽类型 = "vertical";
                  } else if (多选边界位置.左 || 多选边界位置.右) {
                    this.全局属性.多选缩放初始拖拽类型 = "horizontal";
                  }

                  // 设置初始缩放锚点和模式
                  this.设置多选缩放锚点和模式(边界, 多选边界位置);

                  return;
                }
              }
            }

            // 检查是否点击在整体交互框内（拖拽）
            if (this.鼠标位于多选整体交互框内()) {
              // 点击在整体交互框内，开始拖拽多选形状
              this.全局标志.多选拖拽中 = true;
              this.全局标志.拖拽中 = true;

              // 记录所有多选形状的初始位置
              this.全局属性.多选初始位置组 = this.全局属性.多选形状组.map((形状) => ({
                形状: 形状,
                按下时坐标: structuredClone(形状.坐标),
                按下时顶点坐标组: structuredClone(形状.顶点坐标组),
                按下时旋转弧度: 形状.旋转弧度 ? structuredClone(形状.旋转弧度) : undefined,
                按下时字号: 形状.字号 ? structuredClone(形状.字号) : undefined,
              }));

              return;
            }
          }
          // 点击在整体交互框外部，开始框选
          this.全局标志.正在框选 = true;
          this.全局属性.框选起点 = { ...this.全局属性.点击坐标 };
          this.全局属性.框选终点 = { ...this.全局属性.点击坐标 };

          // 清空多选组（开始新的框选）
          this.清空多选组();

          // 如果有单选形状，也清除
          if (this.全局属性.选中形状) {
            this.全局属性.选中形状.已选中 = false;
            this.全局属性.选中形状 = null;
            this.交互框 = null;
          }
        }
      }

      if (this.全局属性.已选中基础形状 !== "选择路径") {
        // 绘制新形状时，清空多选组和选中形状
        if (this.全局属性.多选形状组.length > 0) {
          this.清空多选组();
          // 更新按钮状态（包括编组按钮）
          this.根据选中形状索引修改处理按钮状态();
        }
        if (this.全局属性.选中形状) {
          this.全局属性.选中形状.已悬停 = false;
          this.全局属性.选中形状.已选中 = false;
          this.全局属性.选中形状 = null;
          this.全局属性.悬停形状 = null;
          this.恢复用户全局颜色到拾色器();
        }
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

        // 如果按住Shift且已有顶点，将新点的方向固定到8个特定角度
        let 实际点击坐标 = { ...this.全局属性.点击坐标 };

        if (this.键盘状态.Shift && this.当前形状对象.顶点坐标组.length > 0) {
          const 最后坐标 = this.当前形状对象.顶点坐标组[this.当前形状对象.顶点坐标组.length - 1];
          const dx = 实际点击坐标.x - 最后坐标.x;
          const dy = 实际点击坐标.y - 最后坐标.y;
          const 距离 = Math.sqrt(dx * dx + dy * dy);

          if (距离 > 0) {
            // 计算当前角度（弧度）
            let 角度 = Math.atan2(dy, dx);

            // 将角度转换到 [0, 2π) 范围
            if (角度 < 0) {
              角度 += Math.PI * 2;
            }

            // 将角度量化到最近的45度（π/4）
            const 角度步长 = Math.PI / 4; // 45度
            const 量化后角度 = Math.round(角度 / 角度步长) * 角度步长;

            // 根据量化后的角度计算新的点击坐标
            实际点击坐标.x = 最后坐标.x + 距离 * Math.cos(量化后角度);
            实际点击坐标.y = 最后坐标.y + 距离 * Math.sin(量化后角度);
          }
        }

        if (this.当前形状对象.顶点坐标组.length === 0) {
          this.ctx.moveTo(实际点击坐标.x, 实际点击坐标.y);
        } else {
          this.ctx.lineTo(实际点击坐标.x, 实际点击坐标.y);
        }
        this.当前形状对象.顶点坐标组.push(实际点击坐标);
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
    this.canvas.addEventListener("mouseup", (e) => {
      // 只处理左键（button === 0）的抬起事件，忽略右键和其他按键
      if (e.button !== 0) return;
      // Alt+拖拽复制完成：将预览形状添加到形状组
      if (this.全局标志.Alt拖拽复制中 && this.全局属性.复制预览组) {
        // 复制组的情况
        const 偏移量 = {
          x: this.全局属性.鼠标坐标.x - this.全局属性.复制预览组[0].初始鼠标位置.x,
          y: this.全局属性.鼠标坐标.y - this.全局属性.复制预览组[0].初始鼠标位置.y,
        };

        // 使用复制组函数完成复制
        this.复制组(this.全局属性.复制源组, 偏移量);

        // 清除初始鼠标位置属性
        this.全局属性.复制预览组.forEach((预览形状) => {
          delete 预览形状.初始鼠标位置;
        });

        // 重置状态
        this.全局标志.Alt拖拽复制中 = false;
        this.全局标志.左键已按下 = false;
        this.全局属性.复制预览组 = null;
        this.全局属性.复制源组 = null;
        this.全局属性.点击坐标 = null;

        // 根据Alt键当前状态恢复光标：如果Alt键还按着且鼠标在形状上，显示复制光标；否则恢复默认光标
        if (this.键盘状态.Alt && this.鼠标位于形状内()) {
          this.canvas.style.cursor = 'url("/Images/Common/copy.cur"), pointer';
        } else {
          this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), pointer';
        }

        // 重新绘制
        this.清空画布();
        this.绘制基础形状对象组();

        // 启用撤销按钮
        this.撤销按钮.classList.remove("禁用");

        return;
      }

      if (this.全局标志.Alt拖拽复制中 && this.全局属性.复制预览形状) {
        // 单个形状复制的情况
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

        // 根据Alt键当前状态恢复光标
        if (this.键盘状态.Alt && this.鼠标位于形状内()) {
          this.canvas.style.cursor = 'url("/Images/Common/copy.cur"), pointer';
        } else {
          this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), pointer';
        }

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

      // 框选完成：选中所有在框选矩形内的形状
      if (this.全局标志.正在框选) {
        this.全局标志.正在框选 = false;

        // 计算框选矩形的边界
        const minX = Math.min(this.全局属性.框选起点.x, this.全局属性.框选终点.x);
        const minY = Math.min(this.全局属性.框选起点.y, this.全局属性.框选终点.y);
        const maxX = Math.max(this.全局属性.框选起点.x, this.全局属性.框选终点.x);
        const maxY = Math.max(this.全局属性.框选起点.y, this.全局属性.框选终点.y);

        const 框选矩形 = { minX, minY, maxX, maxY };

        // 遍历所有形状，检查是否完全在框选矩形内
        this.数据集.基础形状对象组.forEach((形状) => {
          if (this.形状在框选矩形内(形状, 框选矩形)) {
            this.添加到多选组(形状);
          }
          // 清除框选预览状态
          形状.框选预览中 = false;
        });

        // 如果只有一个形状，转换为单选
        if (this.全局属性.多选形状组.length === 1) {
          const 单个形状 = this.全局属性.多选形状组[0];
          this.清空多选组();
          this.全局属性.选中形状 = 单个形状;
          单个形状.已选中 = true;
          this.更新描边宽度滑块(单个形状);
          this.应用选中形状的颜色到拾色器(单个形状);
          this.删除按钮.classList.remove("禁用");
        } else if (this.全局属性.多选形状组.length > 0) {
          // 如果有多选，更新删除按钮状态
          this.删除按钮.classList.remove("禁用");
        } else {
          // 如果没有选中任何形状，禁用删除按钮
          this.删除按钮.classList.add("禁用");
        }

        // 更新按钮状态（包括编组按钮）
        this.根据选中形状索引修改处理按钮状态();

        // 清除框选起点和终点
        this.全局属性.框选起点 = null;
        this.全局属性.框选终点 = null;

        // 重新绘制
        this.清空画布();
        this.绘制基础形状对象组();
      }

      // 处理多选旋转结束
      if (
        this.全局标志.多选旋转中 &&
        this.全局属性.多选形状组.length > 0 &&
        this.全局属性.多选旋转初始位置组.length > 0
      ) {
        // 计算鼠标移动距离
        const 鼠标移动距离 = Math.sqrt(
          Math.abs(this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x) ** 2 +
            Math.abs(this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y) ** 2
        );

        // 如果移动距离大于0，记录操作以便撤销
        if (鼠标移动距离 > 0) {
          // 记录所有多选形状的旋转操作
          const 旋转操作数组 = [];
          this.全局属性.多选旋转初始位置组.forEach((初始位置) => {
            const 形状 = 初始位置.形状;

            // 根据形状类型记录不同的信息
            if (形状.形状 === "圆" || 形状.形状 === "多边形" || 形状.形状 === "多角星") {
              旋转操作数组.push({
                操作类型: "旋转",
                形状: 形状,
                坐标: structuredClone(初始位置.按下时坐标),
                旋转弧度: 初始位置.按下时旋转弧度 !== undefined ? structuredClone(初始位置.按下时旋转弧度) : undefined,
              });
            } else if (形状.形状 === "文本") {
              旋转操作数组.push({
                操作类型: "旋转",
                形状: 形状,
                坐标: structuredClone(初始位置.按下时坐标),
                旋转弧度: 初始位置.按下时旋转弧度 !== undefined ? structuredClone(初始位置.按下时旋转弧度) : undefined,
                顶点坐标组: 初始位置.按下时顶点坐标组 ? [...初始位置.按下时顶点坐标组] : [],
              });
            } else if (
              形状.形状 === "直线" ||
              形状.形状 === "自由" ||
              形状.形状 === "矩形" ||
              形状.形状 === "图像" ||
              形状.形状 === "箭头"
            ) {
              旋转操作数组.push({
                操作类型: "旋转",
                形状: 形状,
                顶点坐标组: 初始位置.按下时顶点坐标组 ? [...初始位置.按下时顶点坐标组] : [],
                旋转弧度: 初始位置.按下时旋转弧度 !== undefined ? structuredClone(初始位置.按下时旋转弧度) : undefined,
              });
            }
          });

          // 如果有多选形状，合并为一个操作记录
          // 判断是编组（所有形状属于同一个组）
          const 是编组 =
            this.全局属性.多选形状组.length > 0 &&
            this.全局属性.多选形状组.every((形状) => 形状.所属组ID === this.全局属性.多选形状组[0].所属组ID) &&
            this.全局属性.多选形状组[0].所属组ID !== undefined;

          // 保存整体旋转状态（用于撤销）
          let 整体旋转状态 = null;
          if (鼠标移动距离 > 0) {
            if (是编组) {
              const 组ID = this.全局属性.多选形状组[0].所属组ID;
              整体旋转状态 = {
                是编组: true,
                组ID: 组ID,
                之前的旋转弧度: this.全局属性.编组旋转弧度映射[组ID] || 0,
                之前的边界: this.全局属性.编组旋转边界映射[组ID]
                  ? structuredClone(this.全局属性.编组旋转边界映射[组ID])
                  : null,
              };
            } else {
              const 多选标识 = this.全局属性.多选形状组
                .map((形状) => this.数据集.基础形状对象组.indexOf(形状))
                .sort()
                .join(",");
              整体旋转状态 = {
                是编组: false,
                多选标识: 多选标识,
                之前的旋转弧度: this.全局属性.多选旋转弧度映射[多选标识] || 0,
                之前的边界: this.全局属性.多选旋转边界映射[多选标识]
                  ? structuredClone(this.全局属性.多选旋转边界映射[多选标识])
                  : null,
              };
            }
          }

          if (旋转操作数组.length > 0) {
            this.数据集.操作记录.push({
              操作类型: "旋转多个形状",
              旋转操作数组: 旋转操作数组,
              整体旋转状态: 整体旋转状态,
            });
            this.撤销按钮.classList.remove("禁用");
          }
        }

        // 判断是编组（所有形状属于同一个组）
        const 是编组 =
          this.全局属性.多选形状组.length > 0 &&
          this.全局属性.多选形状组.every((形状) => 形状.所属组ID === this.全局属性.多选形状组[0].所属组ID) &&
          this.全局属性.多选形状组[0].所属组ID !== undefined;

        // 保存整体旋转弧度（无论是编组还是多选）
        if (鼠标移动距离 > 0) {
          const 整体旋转增量 = this.全局属性.多选整体旋转弧度 || 0;

          if (是编组) {
            // 编组：保存到编组旋转弧度映射
            const 组ID = this.全局属性.多选形状组[0].所属组ID;
            const 之前的旋转弧度 = this.全局属性.编组旋转弧度映射[组ID] || 0;
            // 标准化旋转增量到 [-π, π] 范围
            let 标准化增量 = 整体旋转增量;
            while (标准化增量 > Math.PI) {
              标准化增量 -= Math.PI * 2;
            }
            while (标准化增量 < -Math.PI) {
              标准化增量 += Math.PI * 2;
            }
            // 累积保存
            this.全局属性.编组旋转弧度映射[组ID] = 之前的旋转弧度 + 标准化增量;
            // 标准化到 [0, 2π) 范围
            let 标准化旋转 = this.全局属性.编组旋转弧度映射[组ID];
            while (标准化旋转 < 0) {
              标准化旋转 += Math.PI * 2;
            }
            while (标准化旋转 >= Math.PI * 2) {
              标准化旋转 -= Math.PI * 2;
            }
            this.全局属性.编组旋转弧度映射[组ID] = 标准化旋转;

            // 保存编组的未旋转边界（如果还没有保存的话）
            if (this.全局属性.多选旋转初始边界 && !this.全局属性.编组旋转边界映射[组ID]) {
              this.全局属性.编组旋转边界映射[组ID] = structuredClone(this.全局属性.多选旋转初始边界);
            }
          } else {
            // 多选（非编组）：保存到多选旋转弧度映射（使用多选形状组的唯一标识）
            const 多选标识 = this.全局属性.多选形状组
              .map((形状) => this.数据集.基础形状对象组.indexOf(形状))
              .sort()
              .join(",");
            const 之前的旋转弧度 = this.全局属性.多选旋转弧度映射[多选标识] || 0;
            // 标准化旋转增量到 [-π, π] 范围
            let 标准化增量 = 整体旋转增量;
            while (标准化增量 > Math.PI) {
              标准化增量 -= Math.PI * 2;
            }
            while (标准化增量 < -Math.PI) {
              标准化增量 += Math.PI * 2;
            }
            // 累积保存
            this.全局属性.多选旋转弧度映射[多选标识] = 之前的旋转弧度 + 标准化增量;
            // 标准化到 [0, 2π) 范围
            let 标准化旋转 = this.全局属性.多选旋转弧度映射[多选标识];
            while (标准化旋转 < 0) {
              标准化旋转 += Math.PI * 2;
            }
            while (标准化旋转 >= Math.PI * 2) {
              标准化旋转 -= Math.PI * 2;
            }
            this.全局属性.多选旋转弧度映射[多选标识] = 标准化旋转;

            // 保存多选的未旋转边界（如果还没有保存的话）
            if (this.全局属性.多选旋转初始边界 && !this.全局属性.多选旋转边界映射[多选标识]) {
              this.全局属性.多选旋转边界映射[多选标识] = structuredClone(this.全局属性.多选旋转初始边界);
            }
          }
        }

        // 清除多选旋转状态（但保留累积的旋转弧度）
        this.全局标志.多选旋转中 = false;
        this.全局标志.旋转中 = false;
        this.全局属性.多选旋转锚点 = null;
        this.全局属性.多选旋转初始位置组 = [];
        this.全局属性.多选旋转初始边界中心 = null;
        // 不再重置多选整体旋转弧度，因为它已经保存到映射中了

        // 重新绘制
        this.清空画布();
        this.绘制基础形状对象组();
      }

      // 处理多选缩放结束
      if (this.全局标志.多选缩放中 && this.全局属性.多选形状组.length > 0 && this.全局属性.多选缩放初始位置组) {
        // 规范化矩形和图像的顶点顺序
        this.全局属性.多选形状组.forEach((形状) => {
          if (形状.形状 === "矩形" || 形状.形状 === "图像") {
            this.规范化矩形顶点顺序(形状);
          }
        });

        // 计算鼠标移动距离
        const 鼠标移动距离 = Math.sqrt(
          Math.abs(this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x) ** 2 +
            Math.abs(this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y) ** 2
        );

        // 如果移动距离大于0，记录操作以便撤销
        if (鼠标移动距离 > 0) {
          // 记录所有多选形状的缩放操作
          const 缩放操作数组 = [];
          this.全局属性.多选缩放初始位置组.forEach((初始位置) => {
            const 形状 = 初始位置.形状;

            // 根据形状类型记录不同的信息
            if (形状.形状 === "圆" || 形状.形状 === "多边形" || 形状.形状 === "多角星") {
              缩放操作数组.push({
                操作类型: "缩放",
                形状: 形状,
                坐标: structuredClone(初始位置.按下时坐标),
                尺寸: structuredClone(初始位置.按下时尺寸),
                旋转弧度: 初始位置.按下时旋转弧度 !== undefined ? structuredClone(初始位置.按下时旋转弧度) : undefined,
              });
            } else if (形状.形状 === "文本") {
              缩放操作数组.push({
                操作类型: "缩放",
                形状: 形状,
                坐标: structuredClone(初始位置.按下时坐标),
                字号: structuredClone(初始位置.按下时字号),
                尺寸: structuredClone(初始位置.按下时尺寸),
                旋转弧度: 初始位置.按下时旋转弧度 !== undefined ? structuredClone(初始位置.按下时旋转弧度) : undefined,
                顶点坐标组: 初始位置.按下时顶点坐标组 ? [...初始位置.按下时顶点坐标组] : [],
              });
            } else if (
              形状.形状 === "直线" ||
              形状.形状 === "自由" ||
              形状.形状 === "矩形" ||
              形状.形状 === "图像" ||
              形状.形状 === "箭头"
            ) {
              缩放操作数组.push({
                操作类型: "缩放",
                形状: 形状,
                顶点坐标组: 初始位置.按下时顶点坐标组 ? [...初始位置.按下时顶点坐标组] : [],
                旋转弧度: 初始位置.按下时旋转弧度 !== undefined ? structuredClone(初始位置.按下时旋转弧度) : undefined,
              });
            }
          });

          // 如果有多选形状，合并为一个操作记录
          if (缩放操作数组.length > 0) {
            this.数据集.操作记录.push({
              操作类型: "缩放多个形状",
              缩放操作数组: 缩放操作数组,
            });
            this.撤销按钮.classList.remove("禁用");
          }
        }

        // 清除多选缩放状态
        this.全局标志.多选缩放中 = false;
        this.全局标志.缩放中 = false;
        this.全局属性.多选缩放初始边界 = null;
        this.全局属性.多选缩放初始位置组 = [];
        this.全局属性.多选缩放初始拖拽类型 = null;
        this.全局属性.多选缩放原始锚点 = null;
        this.全局属性.多选缩放锚点 = null;

        // 重新绘制
        this.清空画布();
        this.绘制基础形状对象组();
      }

      // 处理多选拖拽结束
      if (this.全局标志.多选拖拽中 && this.全局属性.多选形状组.length > 0 && this.全局属性.多选初始位置组.length > 0) {
        // 计算鼠标移动距离
        const 鼠标移动距离 = Math.sqrt(
          Math.abs(this.全局属性.鼠标坐标.x - this.全局属性.点击坐标.x) ** 2 +
            Math.abs(this.全局属性.鼠标坐标.y - this.全局属性.点击坐标.y) ** 2
        );

        // 如果之前标记了Shift+点击待移除，且没有拖拽（只是点击），则执行移除操作
        if (this.全局标志.Shift点击待移除 && 鼠标移动距离 <= 3) {
          const 待移除形状 = this.全局属性.Shift点击待移除形状;
          const 待移除信息 = this.全局属性.Shift点击待移除信息;

          if (待移除形状 && 待移除信息) {
            // 从编组中移除（如果形状在编组中）
            if (this.形状已编组(待移除形状)) {
              this.从组中移除形状(待移除形状);

              // 如果是在"选中编组时点击组内形状"的情况下，记录操作以便撤销
              if (待移除信息.需要记录移除操作) {
                this.数据集.操作记录.push({
                  操作类型: "从编组移除形状",
                  组ID: 待移除信息.移除前的组ID,
                  移除的形状: 待移除形状,
                  操作前组形状: 待移除信息.移除前的组形状,
                });
                this.撤销按钮.classList.remove("禁用");
              }
            }

            // 从多选组移除
            this.从多选组移除(待移除形状);

            // 根据剩余形状数量决定状态
            if (this.全局属性.多选形状组.length === 0) {
              // 多选组为空，清除所有选中状态
              this.删除按钮.classList.add("禁用");
              this.恢复用户全局颜色到拾色器();
            } else if (this.全局属性.多选形状组.length === 1) {
              // 只有一个形状，转换为单选
              const 单个形状 = this.全局属性.多选形状组[0];
              this.清空多选组();
              this.全局属性.选中形状 = 单个形状;
              单个形状.已选中 = true;
              this.更新描边宽度滑块(单个形状);
              this.应用选中形状的颜色到拾色器(单个形状);
              this.删除按钮.classList.remove("禁用");
            } else {
              // 如果多选组有多个形状，更新删除按钮状态
              this.删除按钮.classList.remove("禁用");
            }

            // 更新按钮状态（包括编组按钮）
            this.根据选中形状索引修改处理按钮状态();

            // 清除待移除标志
            this.全局标志.Shift点击待移除 = false;
            this.全局属性.Shift点击待移除形状 = null;
            this.全局属性.Shift点击待移除信息 = null;

            // 重新绘制
            this.清空画布();
            this.绘制基础形状对象组();
          }
        }

        // 如果移动距离大于0，记录操作以便撤销（拖拽移动的情况）
        if (鼠标移动距离 > 0) {
          // 检查是否有单独移动的形状（Shift+拖拽单个形状的情况）
          // 如果待移除标志已被清除（说明已经拖拽了），但可能之前是单独移动
          // 我们需要检查多选初始位置组中是否有形状被单独移动了

          // 记录所有多选形状的移动操作（包括单独移动的形状）
          const 移动操作数组 = [];
          this.全局属性.多选初始位置组.forEach((初始位置) => {
            const 形状 = 初始位置.形状;

            // 计算这个形状的移动距离
            let 形状移动距离 = 0;
            if (初始位置.按下时坐标 && 形状.坐标) {
              形状移动距离 = Math.sqrt(
                Math.abs(形状.坐标.x - 初始位置.按下时坐标.x) ** 2 + Math.abs(形状.坐标.y - 初始位置.按下时坐标.y) ** 2
              );
            } else if (初始位置.按下时顶点坐标组 && 形状.顶点坐标组 && 形状.顶点坐标组.length > 0) {
              // 对于基于顶点的形状，检查第一个顶点的移动距离
              if (初始位置.按下时顶点坐标组.length > 0) {
                形状移动距离 = Math.sqrt(
                  Math.abs(形状.顶点坐标组[0].x - 初始位置.按下时顶点坐标组[0].x) ** 2 +
                    Math.abs(形状.顶点坐标组[0].y - 初始位置.按下时顶点坐标组[0].y) ** 2
                );
              }
            }

            // 如果移动距离大于0，或者形状在编组中且整体移动距离大于0，记录操作
            // 注意：如果形状在编组中，即使单个形状的移动距离为0（由于精度问题），也应该记录
            const 应该记录 = 形状移动距离 > 0 || (鼠标移动距离 > 0 && 形状.所属组ID !== undefined);

            if (应该记录) {
              // 根据形状类型记录不同的信息
              if (形状.形状 === "圆") {
                移动操作数组.push({
                  操作类型: "移动",
                  形状: 形状,
                  坐标: structuredClone(初始位置.按下时坐标),
                });
              } else if (形状.形状 === "多边形" || 形状.形状 === "多角星") {
                移动操作数组.push({
                  操作类型: "移动",
                  形状: 形状,
                  坐标: structuredClone(初始位置.按下时坐标),
                });
              } else if (形状.形状 === "文本") {
                移动操作数组.push({
                  操作类型: "移动",
                  形状: 形状,
                  坐标: structuredClone(初始位置.按下时坐标),
                });
              } else if (
                形状.形状 === "直线" ||
                形状.形状 === "自由" ||
                形状.形状 === "矩形" ||
                形状.形状 === "图像" ||
                形状.形状 === "箭头"
              ) {
                移动操作数组.push({
                  操作类型: "移动",
                  形状: 形状,
                  顶点坐标组: 初始位置.按下时顶点坐标组 ? [...初始位置.按下时顶点坐标组] : [],
                });
              }
            }
          });

          // 如果有多选形状移动，记录操作
          if (移动操作数组.length > 0) {
            if (移动操作数组.length === 1) {
              // 单个形状移动（可能是Shift+拖拽单独移动）
              this.数据集.操作记录.push(移动操作数组[0]);
            } else {
              // 多个形状移动
              this.数据集.操作记录.push({
                操作类型: "移动多个形状",
                移动操作数组: 移动操作数组,
              });
            }
            this.撤销按钮.classList.remove("禁用");
          }
        }

        // 清除多选拖拽状态
        this.全局标志.多选拖拽中 = false;
        this.全局属性.多选初始位置组 = [];

        // 清除单独拖拽标志
        this.全局标志.Shift单独拖拽中 = false;

        // 如果拖拽移动了，清除待移除标志（因为拖拽意味着不移除）
        if (鼠标移动距离 > 3) {
          this.全局标志.Shift点击待移除 = false;
          this.全局属性.Shift点击待移除形状 = null;
          this.全局属性.Shift点击待移除信息 = null;
        }
      }

      this.全局标志.拖拽中 = false;
      this.全局标志.旋转中 = false;
      this.全局标志.缩放中 = false;
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

          // 对于所有形状（除了箭头），清除旋转弧度，让它们从0开始
          // 箭头在绘制时会设置旋转弧度以匹配方向
          if (克隆.形状 !== "箭头") {
            克隆.旋转弧度 = 0;
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
        } else if (this.全局属性.选中形状.形状 === "文本") {
          this.数据集.操作记录.push({
            操作类型: "移动",
            形状: this.全局属性.选中形状,
            坐标: structuredClone(this.全局属性.选中形状.按下时坐标),
          });
        } else if (
          this.全局属性.选中形状.形状 === "直线" ||
          this.全局属性.选中形状.形状 === "自由" ||
          this.全局属性.选中形状.形状 === "矩形" ||
          this.全局属性.选中形状.形状 === "图像" ||
          this.全局属性.选中形状.形状 === "箭头"
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
        } else if (this.全局属性.选中形状.形状 === "文本") {
          旋转前数据.旋转弧度 = this.全局属性.选中形状.点击时旋转弧度;
        } else if (
          this.全局属性.选中形状.形状 === "矩形" ||
          this.全局属性.选中形状.形状 === "图像" ||
          this.全局属性.选中形状.形状 === "直线" ||
          this.全局属性.选中形状.形状 === "自由" ||
          this.全局属性.选中形状.形状 === "箭头"
        ) {
          // 确保点击时顶点坐标组存在
          if (this.全局属性.选中形状.点击时顶点坐标组) {
            旋转前数据.顶点坐标组 = this.全局属性.选中形状.点击时顶点坐标组.map((坐标) => ({ ...坐标 }));
          }
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
        const 已缩放 = this.形状已缩放(this.全局属性.选中形状);
        if (已缩放) {
          this.数据集.操作记录.push({
            操作类型: "缩放",
            形状: this.全局属性.选中形状,
            缩放前尺寸: structuredClone(this.全局属性.选中形状.点击时尺寸),
            缩放前坐标: this.全局属性.选中形状.点击时坐标 ? { ...this.全局属性.选中形状.点击时坐标 } : null,
            缩放前顶点坐标组: this.全局属性.选中形状.点击时顶点坐标组
              ? this.全局属性.选中形状.点击时顶点坐标组.map((坐标) => ({ ...坐标 }))
              : null,
            缩放前旋转弧度: this.全局属性.选中形状.点击时旋转弧度,
            缩放前起始弧度: this.全局属性.选中形状.点击时起始弧度,
            缩放前字号: this.全局属性.选中形状.点击时字号,
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

  添加canvas双击事件() {
    this.canvas.addEventListener("dblclick", (e) => {
      // 只有在"选择路径"工具下才响应双击
      if (this.全局属性.已选中基础形状 !== "选择路径") return;

      // 获取鼠标坐标
      this.全局属性.鼠标坐标 = this.获取鼠标坐标(e);

      // 检查是否双击在形状上
      const 双击的形状 = this.鼠标位于形状内();
      if (双击的形状) {
        if (双击的形状.形状 === "文本") {
          // 双击文本形状：进入文本编辑模式
          this.进入文本编辑模式(双击的形状.坐标.x, 双击的形状.坐标.y, 双击的形状);
        } else {
          // 双击非文本形状：切换到文本工具，在形状中心创建文本输入框
          // 计算形状中心位置
          const 中心点 = this.获取中心缩放锚点(双击的形状);
          if (!中心点) return;

          // 保存双击的形状和中心点，以便文本输入完成后编组和居中
          this.全局属性.双击待编组形状 = 双击的形状;
          this.全局属性.双击待编组形状中心 = { x: 中心点.x, y: 中心点.y };

          // 切换到文本工具
          const 文本工具单选框 = document.getElementById("文本");
          if (文本工具单选框) {
            // 选中单选框并触发点击事件，以更新UI状态
            文本工具单选框.checked = true;
            const 文本工具分区 = 文本工具单选框.closest(".基础形状分区");
            if (文本工具分区) {
              文本工具分区.click();
            } else {
              // 如果没有找到分区，手动更新状态
              const 旧选中的工具 = this.全局属性.已选中基础形状;
              this.全局属性.已选中基础形状 = "文本";

              // 更新拾色器颜色
              this.全局标志.正在恢复颜色 = true;
              this.描边颜色拾取器.setColor(this.全局属性.文本描边色);
              this.填充颜色拾取器.setColor(this.全局属性.文本填充色);
              this.全局标志.正在恢复颜色 = false;
            }
          } else {
            // 如果没有找到单选框，直接更新状态
            this.全局属性.已选中基础形状 = "文本";
          }

          // 在形状中心创建文本输入框（使用中心点作为文本坐标）
          // 注意：文本的坐标.x是左边缘，坐标.y是垂直中心
          // 所以这里先使用中心点，后续会根据文本实际宽度调整
          this.进入文本编辑模式(中心点.x, 中心点.y);
        }
      }
    });
  }

  添加键盘事件() {
    document.addEventListener("keydown", (e) => {
      // 文本编辑模式：ESC确认，Enter换行
      if (this.全局标志.文本编辑中) {
        if (e.key === "Escape") {
          e.preventDefault();
          this.退出文本编辑模式();
          return;
        }
        // 在文本编辑模式下，不处理其他键盘事件
        return;
      }

      // ESC键：取消选择（单选或多选）
      if (e.key === "Escape") {
        // 如果有多选，清空多选组
        if (this.全局属性.多选形状组.length > 0) {
          this.清空多选组();
          this.交互框 = null;
          this.删除按钮.classList.add("禁用");
          this.恢复用户全局颜色到拾色器();
          // 清除悬停状态
          if (this.全局属性.悬停形状) {
            this.全局属性.悬停形状.已悬停 = false;
            this.全局属性.悬停形状 = null;
          }
          // 立即检测鼠标是否在形状上，如果在就显示预览交互框
          const 鼠标在内形状 = this.鼠标位于形状内();
          if (鼠标在内形状) {
            鼠标在内形状.已悬停 = true;
            this.全局属性.悬停形状 = 鼠标在内形状;
          }
          this.清空画布();
          this.绘制基础形状对象组();
          return;
        }
        // 如果有单选，清除单选
        if (this.全局属性.选中形状) {
          this.全局属性.选中形状.已选中 = false;
          this.全局属性.选中形状 = null;
          this.交互框 = null;
          this.删除按钮.classList.add("禁用");
          this.恢复用户全局颜色到拾色器();
          // 清除悬停状态
          if (this.全局属性.悬停形状) {
            this.全局属性.悬停形状.已悬停 = false;
            this.全局属性.悬停形状 = null;
          }
          // 立即检测鼠标是否在形状上，如果在就显示预览交互框
          const 鼠标在内形状 = this.鼠标位于形状内();
          if (鼠标在内形状) {
            鼠标在内形状.已悬停 = true;
            this.全局属性.悬停形状 = 鼠标在内形状;
          }
          this.清空画布();
          this.绘制基础形状对象组();
          return;
        }
      }

      // 跟踪Shift键状态（用于多选）
      if (e.key === "Shift") {
        this.全局标志.Shift已按下 = true;

        if (this.全局属性.多选形状组.length > 0) {
          // 重新检测悬停形状（Shift按下后，已多选形状可以被检测）
          this.全局属性.悬停形状 = this.鼠标位于形状内();
          this.清空画布();
          this.绘制基础形状对象组();
        } else if (
          this.全局属性.已选中基础形状 === "选择路径" &&
          this.全局属性.悬停形状 &&
          this.形状已编组(this.全局属性.悬停形状) &&
          !this.全局属性.悬停形状.已选中 &&
          !this.全局属性.悬停形状.已多选
        ) {
          // 如果鼠标悬停在编组内的形状上，按下Shift时需要更新编组预览交互框的虚线模式
          this.清空画布();
          this.绘制基础形状对象组();
        }
      }

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
      if (e.key === "Delete" && !this.全局标志.文本编辑中) {
        if (this.全局属性.选中形状) {
          // 删除单个选中的形状
          if (this.全局标志.按钮音效) {
            this.辅助.清空音效.currentTime = 0;
            this.辅助.清空音效.play().catch((e) => {
              console.log("按钮音效播放失败:", e);
            });
          }
          this.删除形状(this.全局属性.选中形状);
          return;
        } else if (this.全局属性.多选形状组.length > 0) {
          // 删除多选的所有形状
          if (this.全局标志.按钮音效) {
            this.辅助.清空音效.currentTime = 0;
            this.辅助.清空音效.play().catch((e) => {
              console.log("按钮音效播放失败:", e);
            });
          }
          this.删除多选形状();
          return;
        }
      }
      // g键：编组/取消编组
      if (e.key === "g" && !this.全局标志.文本编辑中) {
        e.preventDefault();
        // 检查是否有多选（且数量>=2）或已编组的形状
        const 多选数量 = this.全局属性.多选形状组.length;
        const 选中形状已编组 = this.全局属性.选中形状 && this.形状已编组(this.全局属性.选中形状);

        if (多选数量 >= 2) {
          // 检查已编组
          const 第一个形状 = this.全局属性.多选形状组[0];
          const 已编组 =
            第一个形状.所属组ID !== undefined &&
            this.全局属性.多选形状组.every((形状) => 形状.所属组ID === 第一个形状.所属组ID);

          if (已编组) {
            // 已编组，执行取消编组
            this.图形组合按钮组.编组.checked = false;
            this.执行取消编组();
          } else {
            // 未编组，执行编组
            this.图形组合按钮组.编组.checked = true;
            this.执行编组();
          }
        } else if (选中形状已编组) {
          // 如果选中的是已编组的形状，需要先将整个组加入多选组
          const 组内形状 = this.获取组内所有形状(this.全局属性.选中形状);
          if (组内形状.length > 0) {
            // 清空多选组，然后添加组内所有形状
            this.清空多选组();
            组内形状.forEach((形状) => {
              this.添加到多选组(形状);
            });
            // 清除单选状态
            this.全局属性.选中形状.已选中 = false;
            this.全局属性.选中形状 = null;
            // 执行取消编组
            this.图形组合按钮组.编组.checked = false;
            this.执行取消编组();
          }
        }
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
      if (e.key === " ") {
        if (this.全局属性.已选中基础形状 === "直线") {
          e.preventDefault(); // 阻止空格键默认的页面滚动行为
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
      if (e.key === "Escape" || (e.key === " " && this.全局属性.已选中基础形状 === "直线")) {
        this.全局标志.左键已按下 = false;
        this.全局标志.拖拽中 = false;
        this.全局属性.点击坐标 = null;
        this.全局属性.左键按下时间 = null;
        this.全局属性.拖拽时间 = null;
        this.全局属性.多边形边数 = 5;

        // 取消Alt拖拽复制操作
        if (this.全局标志.Alt拖拽复制中) {
          this.全局标志.Alt拖拽复制中 = false;
          if (this.全局属性.复制预览组) {
            this.全局属性.复制预览组.forEach((预览形状) => {
              delete 预览形状.初始鼠标位置;
            });
            this.全局属性.复制预览组 = null;
            this.全局属性.复制源组 = null;
          }
          if (this.全局属性.复制预览形状) {
            delete this.全局属性.复制预览形状.初始鼠标位置;
            this.全局属性.复制预览形状 = null;
            this.全局属性.复制源形状 = null;
          }

          // 根据Alt键当前状态恢复光标
          if (this.键盘状态.Alt && this.鼠标位于形状内()) {
            this.canvas.style.cursor = 'url("/Images/Common/copy.cur"), pointer';
          } else {
            this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), pointer';
          }
        }

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
        const 新选中的工具 = this.快捷键映射[e.key];
        const 旧选中的工具 = this.全局属性.已选中基础形状;
        const 描边宽度滑块 = document.getElementById("描边宽度");

        // 如果要切换工具，先保存当前工具的描边宽度
        if (旧选中的工具 !== 新选中的工具) {
          if (旧选中的工具 === "箭头") {
            // 从箭头工具切换出去，保存箭头工具的描边宽度
            this.全局属性.箭头工具描边宽度 = this.全局属性.描边宽度;
          } else if (旧选中的工具 !== null) {
            // 从其他工具切换出去，保存其他工具的描边宽度
            this.本地存储池.描边宽度 = this.全局属性.描边宽度;
            localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
          }
        }

        if (this.基础形状单选框组.当前基础形状单选框) {
          this.基础形状单选框组.当前基础形状单选框.checked = false;
        }
        this.基础形状单选框组[新选中的工具].checked = true;
        this.基础形状单选框组.当前基础形状单选框 = this.基础形状单选框组[新选中的工具];
        this.全局属性.已选中基础形状 = 新选中的工具;

        // 切换到新工具，恢复该工具的描边宽度
        if (新选中的工具 === "箭头") {
          // 切换到箭头工具，恢复箭头工具专属的描边宽度并设置滑块最大值为5
          描边宽度滑块.max = 5;
          this.全局属性.描边宽度 = this.全局属性.箭头工具描边宽度;
          描边宽度滑块.value = this.全局属性.箭头工具描边宽度;
          描边宽度滑块.nextElementSibling.textContent = this.全局属性.箭头工具描边宽度;
        } else if (旧选中的工具 === "箭头") {
          // 从箭头工具切换到其他工具，恢复滑块最大值和其他工具的描边宽度
          描边宽度滑块.max = 20;
          this.全局属性.描边宽度 = this.本地存储池.描边宽度;
          描边宽度滑块.value = this.本地存储池.描边宽度;
          描边宽度滑块.nextElementSibling.textContent = this.本地存储池.描边宽度;
        }

        // 更新拾色器颜色
        if (新选中的工具 === "文本") {
          // 切换到文本工具，显示文本专用颜色
          // 设置标志，防止 setColor 触发的 change 事件执行颜色保存逻辑
          this.全局标志.正在恢复颜色 = true;
          this.描边颜色拾取器.setColor(this.全局属性.文本描边色);
          this.填充颜色拾取器.setColor(this.全局属性.文本填充色);
          this.全局标志.正在恢复颜色 = false;
        } else if (新选中的工具 === "箭头") {
          // 切换到箭头工具，显示箭头专用颜色
          // 设置标志，防止 setColor 触发的 change 事件执行颜色保存逻辑
          this.全局标志.正在恢复颜色 = true;
          this.描边颜色拾取器.setColor(this.全局属性.箭头描边色);
          this.填充颜色拾取器.setColor(this.全局属性.箭头填充色);
          this.全局标志.正在恢复颜色 = false;
        } else if (旧选中的工具 === "文本" || 旧选中的工具 === "箭头") {
          // 从文本工具或箭头工具切换出去
          // 如果有选中形状，显示选中形状的颜色；否则显示全局颜色
          if (this.全局属性.选中形状) {
            // 应用选中形状的颜色到拾色器（函数内部会处理标志）
            this.应用选中形状的颜色到拾色器(this.全局属性.选中形状);
          } else {
            // 设置标志，防止 setColor 触发的 change 事件执行颜色保存逻辑
            this.全局标志.正在恢复颜色 = true;
            this.描边颜色拾取器.setColor(this.全局属性.描边色);
            this.填充颜色拾取器.setColor(this.全局属性.填充色);
            this.全局标志.正在恢复颜色 = false;
          }
        }

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
      // 跟踪Shift键状态（用于多选）
      if (e.key === "Shift") {
        this.全局标志.Shift已按下 = false;
        if (this.全局属性.多选形状组.length > 0) {
          // 清除已多选形状的悬停状态
          for (const 形状 of this.全局属性.多选形状组) {
            形状.已悬停 = false;
          }
          // 清除已多选形状的悬停形状引用
          if (this.全局属性.悬停形状 && this.全局属性.悬停形状.已多选) {
            this.全局属性.悬停形状 = null;
          }
          // 重新检测悬停形状（Shift松开后，可能需要检测其他形状）
          if (this.全局属性.已选中基础形状 === "选择路径") {
            this.全局属性.悬停形状 = this.鼠标位于形状内();
          }
          this.清空画布();
          this.绘制基础形状对象组();
        } else if (
          this.全局属性.已选中基础形状 === "选择路径" &&
          this.全局属性.悬停形状 &&
          this.形状已编组(this.全局属性.悬停形状) &&
          !this.全局属性.悬停形状.已选中 &&
          !this.全局属性.悬停形状.已多选
        ) {
          // 如果鼠标悬停在编组内的形状上，松开Shift时需要更新编组预览交互框的虚线模式
          this.清空画布();
          this.绘制基础形状对象组();
        }
      }

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

  添加窗口焦点事件() {
    // 监听窗口失焦事件，重置所有键盘状态
    window.addEventListener("blur", () => {
      // 如果Alt键被记录为按下状态，需要清理相关状态
      if (this.键盘状态.Alt && !this.全局标志.Alt拖拽复制中) {
        // 清除所有形状的Alt预览状态
        for (const 形状 of this.数据集.基础形状对象组) {
          if (形状.Alt预览中) {
            形状.Alt预览中 = false;
            if (!形状.已悬停 || !this.基础形状单选框组["选择路径"].checked) {
              形状.已悬停 = false;
            }
          }
        }
      }

      // 重置所有键盘状态
      for (const key in this.键盘状态) {
        this.键盘状态[key] = false;
      }

      // 恢复光标为默认状态
      if (!this.全局标志.Alt拖拽复制中) {
        this.canvas.style.cursor = 'url("/Images/Common/鼠标-默认.cur"), pointer';
      }

      // 重新绘制
      this.清空画布();
      this.绘制基础形状对象组();
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

  更新箭头起点终点(箭头对象) {
    // 从顶点坐标组更新起点和终点
    if (箭头对象.顶点坐标组 && 箭头对象.顶点坐标组.length >= 2) {
      箭头对象.起点 = { x: 箭头对象.顶点坐标组[0].x, y: 箭头对象.顶点坐标组[0].y };
      箭头对象.终点 = { x: 箭头对象.顶点坐标组[1].x, y: 箭头对象.顶点坐标组[1].y };

      // 根据新的起点和终点，更新旋转弧度
      // 但只有当箭头长度足够时才更新，避免在箭头很短时方向不稳定
      const dx = 箭头对象.终点.x - 箭头对象.起点.x;
      const dy = 箭头对象.终点.y - 箭头对象.起点.y;
      const 长度 = Math.sqrt(dx * dx + dy * dy);

      // 只有当箭头长度大于1像素时才更新旋转弧度，否则保持原有方向
      if (长度 > 1) {
        箭头对象.旋转弧度 = Math.atan2(dy, dx);
      }
    }
  }

  更新箭头路径(箭头对象) {
    if (!箭头对象.起点 || !箭头对象.终点) return;

    const path = new Path2D();
    const 起点 = 箭头对象.起点;
    const 终点 = 箭头对象.终点;

    const dx = 终点.x - 起点.x;
    const dy = 终点.y - 起点.y;
    const 长度 = Math.sqrt(dx * dx + dy * dy);

    if (长度 < 1) {
      箭头对象.路径 = path;
      return;
    }

    const 单位向量x = dx / 长度;
    const 单位向量y = dy / 长度;
    // const 箭头长度 = Math.min(长度 * 0.2, 箭头对象.描边宽度 * 5);
    const 箭头长度 = 18;
    const 箭头角度 = Math.PI / 6;

    path.moveTo(起点.x, 起点.y);
    path.lineTo(终点.x, 终点.y);

    const 左端点x = 终点.x - 箭头长度 * (单位向量x * Math.cos(箭头角度) - 单位向量y * Math.sin(箭头角度));
    const 左端点y = 终点.y - 箭头长度 * (单位向量y * Math.cos(箭头角度) + 单位向量x * Math.sin(箭头角度));
    const 右端点x = 终点.x - 箭头长度 * (单位向量x * Math.cos(箭头角度) + 单位向量y * Math.sin(箭头角度));
    const 右端点y = 终点.y - 箭头长度 * (单位向量y * Math.cos(箭头角度) - 单位向量x * Math.sin(箭头角度));

    path.lineTo(左端点x, 左端点y);
    path.moveTo(终点.x, 终点.y);
    path.lineTo(右端点x, 右端点y);

    箭头对象.路径 = path;

    // 更新顶点坐标组
    箭头对象.顶点坐标组 = [
      { x: 起点.x, y: 起点.y },
      { x: 终点.x, y: 终点.y },
      { x: 左端点x, y: 左端点y },
      { x: 右端点x, y: 右端点y },
    ];
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
    } else if (路径对象.形状 === "箭头") {
      this.更新箭头路径(路径对象);
    } else if (路径对象.形状 === "文本") {
      this.更新文本路径(路径对象);
    }
  }

  更新文本路径(文本对象) {
    // 文本使用矩形路径用于碰撞检测
    const path = new Path2D();
    if (文本对象.顶点坐标组 && 文本对象.顶点坐标组.length === 4) {
      path.moveTo(文本对象.顶点坐标组[0].x, 文本对象.顶点坐标组[0].y);
      for (let i = 1; i < 文本对象.顶点坐标组.length; i++) {
        path.lineTo(文本对象.顶点坐标组[i].x, 文本对象.顶点坐标组[i].y);
      }
      path.closePath();
    }
    文本对象.路径 = path;
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

  绘制箭头(起点, 终点, 描边色, 描边宽度) {
    const path = new Path2D();
    this.ctx.save();
    this.ctx.strokeStyle = 描边色;
    const 实际描边宽度 = Math.min(描边宽度, 5);
    this.ctx.lineWidth = 实际描边宽度;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    // 计算箭头方向向量
    const dx = 终点.x - 起点.x;
    const dy = 终点.y - 起点.y;
    const 长度 = Math.sqrt(dx * dx + dy * dy);

    if (长度 < 1) {
      this.ctx.restore();
      return {
        描边宽度: 实际描边宽度,
        描边色: 描边色,
        起点: 起点,
        终点: 终点,
        路径: path,
        已悬停: false,
        已选中: false,
      };
    }

    // 归一化方向向量
    const 单位向量x = dx / 长度;
    const 单位向量y = dy / 长度;

    // 绘制主线
    path.moveTo(起点.x, 起点.y);
    path.lineTo(终点.x, 终点.y);

    // 计算箭头参数（根据描边宽度调整）
    // const 箭头长度 = Math.max(Math.min(长度 * 0.5, 实际描边宽度 * 5), 10);
    const 箭头长度 = 18;
    const 箭头角度 = Math.PI / 6; // 30度

    // 计算箭头两端的坐标
    // 左侧箭头端点
    const 左端点x = 终点.x - 箭头长度 * (单位向量x * Math.cos(箭头角度) - 单位向量y * Math.sin(箭头角度));
    const 左端点y = 终点.y - 箭头长度 * (单位向量y * Math.cos(箭头角度) + 单位向量x * Math.sin(箭头角度));

    // 右侧箭头端点
    const 右端点x = 终点.x - 箭头长度 * (单位向量x * Math.cos(箭头角度) + 单位向量y * Math.sin(箭头角度));
    const 右端点y = 终点.y - 箭头长度 * (单位向量y * Math.cos(箭头角度) - 单位向量x * Math.sin(箭头角度));

    // 绘制箭头的两端（不用moveTo，直接从终点lineTo）
    path.lineTo(左端点x, 左端点y);

    // 移动到终点，绘制另一端
    path.moveTo(终点.x, 终点.y);
    path.lineTo(右端点x, 右端点y);

    this.ctx.stroke(path);
    this.ctx.restore();

    return {
      描边宽度: 实际描边宽度,
      描边色: 描边色,
      起点: 起点,
      终点: 终点,
      顶点坐标组: [
        { x: 起点.x, y: 起点.y },
        { x: 终点.x, y: 终点.y },
        { x: 左端点x, y: 左端点y },
        { x: 右端点x, y: 右端点y },
      ],
      路径: path,
      已悬停: false,
      已选中: false,
    };
  }

  计算箭头顶点坐标组(起点, 终点) {
    const dx = 终点.x - 起点.x;
    const dy = 终点.y - 起点.y;
    const 长度 = Math.sqrt(dx * dx + dy * dy);

    if (长度 < 1) {
      return [
        { x: 起点.x, y: 起点.y },
        { x: 终点.x, y: 终点.y },
      ];
    }

    const 单位向量x = dx / 长度;
    const 单位向量y = dy / 长度;
    // const 箭头长度 = Math.min(长度 * 0.2, 描边宽度 * 5);
    const 箭头长度 = 18;
    const 箭头角度 = Math.PI / 6;

    const 左端点x = 终点.x - 箭头长度 * (单位向量x * Math.cos(箭头角度) - 单位向量y * Math.sin(箭头角度));
    const 左端点y = 终点.y - 箭头长度 * (单位向量y * Math.cos(箭头角度) + 单位向量x * Math.sin(箭头角度));
    const 右端点x = 终点.x - 箭头长度 * (单位向量x * Math.cos(箭头角度) + 单位向量y * Math.sin(箭头角度));
    const 右端点y = 终点.y - 箭头长度 * (单位向量y * Math.cos(箭头角度) - 单位向量x * Math.sin(箭头角度));

    return [
      { x: 起点.x, y: 起点.y },
      { x: 终点.x, y: 终点.y },
      { x: 左端点x, y: 左端点y },
      { x: 右端点x, y: 右端点y },
    ];
  }

  // ==================== 文本相关函数 ====================

  // 创建可拖拽的文本输入框
  创建文本输入框(x, y, 初始文本 = "", 文本形状 = null) {
    // 如果已经存在输入框，先删除
    if (this.全局属性.文本输入容器) {
      this.删除文本输入框();
    }

    // 创建临时输入框以读取CSS样式值
    const 临时输入框 = document.createElement("input");
    临时输入框.className = "文本框";
    临时输入框.style.visibility = "hidden";
    临时输入框.style.position = "absolute";
    document.body.appendChild(临时输入框);

    const 计算样式 = window.getComputedStyle(临时输入框);
    const 输入框内边距 = parseFloat(计算样式.paddingLeft) || 8;
    const 输入框边框 = parseFloat(计算样式.borderLeftWidth) || 1;

    document.body.removeChild(临时输入框);

    // Canvas使用middle baseline，y坐标是文本的垂直中心
    // 交互框的顶部 = y - 字号/2
    // 输入框应该与交互框对齐，所以容器的top应该等于交互框顶部 - 内边距 - 边框
    const 字号 = this.全局属性.文本字号;
    const 交互框顶部 = y - 字号 / 2;

    // 创建容器
    const 容器 = document.createElement("div");
    容器.className = "文本输入容器";
    容器.id = "文本输入容器";

    // 检查是否是通过双击形状创建的（需要居中）
    const 需要居中 = this.全局属性.双击待编组形状中心 !== null;
    const 形状中心 = 需要居中 ? this.全局属性.双击待编组形状中心 : null;

    // 如果是通过双击形状创建的，初始时容器左边界在形状中心（稍后会居中）
    // 否则使用原来的逻辑
    if (需要居中 && 形状中心) {
      // 暂时设置容器位置（会在输入事件中动态调整）
      容器.style.left = `${形状中心.x - 输入框内边距 - 输入框边框}px`;
    } else {
      容器.style.left = `${x - 输入框内边距 - 输入框边框}px`;
    }
    容器.style.top = `${交互框顶部 - 输入框内边距 - 输入框边框}px`;

    // 如果是编辑已有文本且有旋转，应用旋转变换
    if (文本形状 && 文本形状.旋转弧度) {
      // 计算旋转中心相对于容器左上角的位置
      // 旋转中心 = 几何中心 = (x + 文本宽度/2, y)
      const 几何中心x = x + 文本形状.尺寸.宽 / 2;
      const 几何中心y = y;

      // 容器左上角的位置
      const 容器左上角x = x - 输入框内边距 - 输入框边框;
      const 容器左上角y = 交互框顶部 - 输入框内边距 - 输入框边框;

      // 旋转中心相对于容器左上角的偏移
      const 旋转中心偏移x = 几何中心x - 容器左上角x;
      const 旋转中心偏移y = 几何中心y - 容器左上角y;

      // 设置旋转变换
      容器.style.transformOrigin = `${旋转中心偏移x}px ${旋转中心偏移y}px`;
      容器.style.transform = `rotate(${文本形状.旋转弧度}rad)`;
    }

    // 创建输入框（使用textarea支持多行）
    const 输入框 = document.createElement("textarea");
    输入框.className = "文本框";
    输入框.id = "文本输入";
    输入框.value = 初始文本;
    输入框.style.fontSize = `${this.全局属性.文本字号}px`;
    输入框.style.color = 文本形状 ? 文本形状.填充色 : this.全局属性.文本填充色; // 使用文本填充色
    输入框.style.resize = "none"; // 禁止手动调整大小
    输入框.style.overflow = "hidden"; // 隐藏滚动条
    输入框.rows = 1; // 初始行数

    // 设置输入框宽度
    if (文本形状) {
      // 编辑已有文本：计算合适的宽度
      const 字体大小 = this.全局属性.文本字号;
      const 动态余量 = Math.max(20, 字体大小);
      const 左内边距 = parseFloat(计算样式.paddingLeft) || 0;
      const 右内边距 = parseFloat(计算样式.paddingRight) || 0;
      const 额外宽度 = 左内边距 + 右内边距;
      输入框.style.width = `${文本形状.尺寸.宽 + 额外宽度 + 动态余量}px`;
    } else {
      // 新绘制文本：初始宽度50px
      输入框.style.width = "50px";
    }

    const 文本操作提示 = document.createElement("div");
    文本操作提示.className = "文本操作提示";
    const 文本提示前缀 = document.createElement("span");
    文本提示前缀.textContent = "按 ";
    const 文本提示后缀 = document.createElement("span");
    文本提示后缀.textContent = " 确认";
    const 文本提示按键 = document.createElement("span");
    文本提示按键.className = "文本提示按键";
    文本提示按键.textContent = "ESC";
    文本操作提示.append(文本提示前缀, 文本提示按键, 文本提示后缀);

    容器.append(输入框, 文本操作提示);
    this.绘图区.appendChild(容器);

    this.全局属性.文本输入容器 = 容器;

    // 添加拖拽功能
    this.添加文本输入框拖拽功能(容器, 输入框);

    // 自动调整textarea高度的函数
    const 自动调整高度 = () => {
      输入框.style.height = "auto";
      输入框.style.height = `${输入框.scrollHeight}px`;
    };

    // 添加输入事件监听，随着输入动态调整宽度和高度
    输入框.addEventListener("input", () => {
      // 自动调整高度
      自动调整高度();

      // 获取输入框的内边距和边框
      const 计算样式 = window.getComputedStyle(输入框);
      const 左内边距 = parseFloat(计算样式.paddingLeft) || 0;
      const 右内边距 = parseFloat(计算样式.paddingRight) || 0;
      const 额外宽度 = 左内边距 + 右内边距;

      // 获取字体大小，用于计算动态余量
      const 字体大小 = parseFloat(输入框.style.fontSize) || 16;
      // 余量随字体大小增加：字体越大，余量越大（至少20px，最多字体大小的2倍）
      const 动态余量 = Math.max(20, 字体大小);

      // 创建临时span来测量文本宽度（取每行的最大宽度）
      const 行数组 = 输入框.value.split("\n");
      let 最大宽度 = 0;

      行数组.forEach((行) => {
        const 临时span = document.createElement("span");
        临时span.style.visibility = "hidden";
        临时span.style.position = "absolute";
        临时span.style.fontSize = 输入框.style.fontSize;
        临时span.style.fontFamily = 计算样式.fontFamily;
        临时span.style.fontWeight = 计算样式.fontWeight;
        临时span.style.letterSpacing = 计算样式.letterSpacing;
        临时span.style.whiteSpace = "pre"; // 保留空格
        临时span.textContent = 行 || " ";
        document.body.appendChild(临时span);

        const 行宽度 = 临时span.offsetWidth;
        document.body.removeChild(临时span);

        最大宽度 = Math.max(最大宽度, 行宽度);
      });

      if (文本形状) {
        // 编辑已有文本：宽度精确匹配文本 + 额外宽度 + 动态余量
        输入框.style.width = `${最大宽度 + 额外宽度 + 动态余量}px`;
      } else {
        // 新绘制文本：最小宽度50px
        const 新宽度 = Math.max(50, 最大宽度 + 额外宽度 + 动态余量);
        输入框.style.width = `${新宽度}px`;
      }

      // 如果需要在形状中心居中，调整容器位置（水平和垂直都居中）
      if (需要居中 && 形状中心) {
        // 使用 requestAnimationFrame 确保在DOM更新后调整位置
        requestAnimationFrame(() => {
          // 获取容器的实际宽度和高度（包括输入框和提示文本）
          const 容器宽度 = 容器.offsetWidth;
          const 容器高度 = 容器.offsetHeight;

          // 计算容器左边界位置，使容器整体水平居中
          const 容器左边界 = 形状中心.x - 容器宽度 / 2;

          // 计算容器顶部位置，使容器整体垂直居中
          // 形状中心.y是垂直中心，容器的top = 形状中心.y - 容器高度/2
          const 容器顶部 = 形状中心.y - 容器高度 / 2;

          // 更新容器位置
          容器.style.left = `${容器左边界}px`;
          容器.style.top = `${容器顶部}px`;
        });
      }
    });

    // 初始化高度
    自动调整高度();

    // 如果需要在形状中心居中，初始化时也调整一次位置（水平和垂直都居中）
    if (需要居中 && 形状中心) {
      // 使用 setTimeout 确保容器已渲染到DOM后再调整位置
      setTimeout(() => {
        requestAnimationFrame(() => {
          // 获取容器的实际宽度和高度（包括输入框和提示文本）
          const 容器宽度 = 容器.offsetWidth;
          const 容器高度 = 容器.offsetHeight;

          // 计算容器左边界位置，使容器整体水平居中
          const 容器左边界 = 形状中心.x - 容器宽度 / 2;

          // 计算容器顶部位置，使容器整体垂直居中
          // 形状中心.y是垂直中心，容器的top = 形状中心.y - 容器高度/2
          const 容器顶部 = 形状中心.y - 容器高度 / 2;

          // 更新容器位置
          容器.style.left = `${容器左边界}px`;
          容器.style.top = `${容器顶部}px`;
        });
      }, 0);
    }

    // 防止输入框失去焦点
    输入框.addEventListener("blur", (e) => {
      // 在文本编辑模式下，如果失去焦点，立即重新聚焦
      if (this.全局标志.文本编辑中) {
        setTimeout(() => {
          输入框.focus();
        }, 0);
      }
    });

    // 自动聚焦
    setTimeout(() => {
      输入框.focus();
      输入框.select();
    }, 0);

    return 容器;
  }

  // 添加文本输入框拖拽功能
  添加文本输入框拖拽功能(容器, 输入框) {
    let 拖拽中 = false;
    let 起始X = 0;
    let 起始Y = 0;
    let 容器起始Left = 0;
    let 容器起始Top = 0;
    const 边缘容差 = 10; // 增加边缘容差（像素）

    const 鼠标按下 = (e) => {
      // 检查鼠标是否在输入框的边缘区域（用于拖拽）
      const rect = 输入框.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const 在左边缘 = x < 边缘容差;
      const 在右边缘 = x > rect.width - 边缘容差;
      const 在上边缘 = y < 边缘容差;
      const 在下边缘 = y > rect.height - 边缘容差;

      if (在左边缘 || 在右边缘 || 在上边缘 || 在下边缘) {
        拖拽中 = true;
        起始X = e.clientX;
        起始Y = e.clientY;
        容器起始Left = parseInt(容器.style.left) || 0;
        容器起始Top = parseInt(容器.style.top) || 0;
        e.preventDefault();
        e.stopPropagation(); // 阻止事件冒泡
      }
    };

    const 鼠标移动 = (e) => {
      if (!拖拽中) {
        // 更新光标样式
        const rect = 输入框.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const 在左边缘 = x < 边缘容差;
        const 在右边缘 = x > rect.width - 边缘容差;
        const 在上边缘 = y < 边缘容差;
        const 在下边缘 = y > rect.height - 边缘容差;

        if (在左边缘 || 在右边缘 || 在上边缘 || 在下边缘) {
          输入框.style.cursor = "move";
        } else {
          输入框.style.cursor = "text";
        }
        return;
      }

      const dx = e.clientX - 起始X;
      const dy = e.clientY - 起始Y;
      const 新Left = 容器起始Left + dx;
      const 新Top = 容器起始Top + dy;
      容器.style.left = `${新Left}px`;
      容器.style.top = `${新Top}px`;

      // 更新点击坐标，使绿色辅助点跟随移动
      if (this.全局属性.点击坐标) {
        // 读取输入框的实际CSS样式值
        const 计算样式 = window.getComputedStyle(输入框);
        const 输入框内边距 = parseFloat(计算样式.paddingLeft) || 8;
        const 输入框边框 = parseFloat(计算样式.borderLeftWidth) || 1;
        const 字号 = this.全局属性.文本字号;
        const 交互框顶部偏移 = 字号 / 2;

        // 计算文本的实际坐标（Canvas绘制坐标）
        this.全局属性.点击坐标.x = 新Left + 输入框内边距 + 输入框边框;
        this.全局属性.点击坐标.y = 新Top + 输入框内边距 + 输入框边框 + 交互框顶部偏移;

        // 重绘画布（文本编辑状态不绘制辅助点）
        this.清空画布();
        this.绘制基础形状对象组();
      }

      e.preventDefault();
      e.stopPropagation(); // 阻止事件冒泡
    };

    const 鼠标抬起 = () => {
      拖拽中 = false;
    };

    输入框.addEventListener("mousedown", 鼠标按下);
    输入框.addEventListener("mousemove", 鼠标移动);
    document.addEventListener("mousemove", 鼠标移动); // 全局监听，防止鼠标移出输入框
    document.addEventListener("mouseup", 鼠标抬起);

    // 保存清理函数
    容器._清理拖拽事件 = () => {
      输入框.removeEventListener("mousedown", 鼠标按下);
      输入框.removeEventListener("mousemove", 鼠标移动);
      document.removeEventListener("mousemove", 鼠标移动);
      document.removeEventListener("mouseup", 鼠标抬起);
    };
  }

  // 删除文本输入框
  删除文本输入框() {
    if (this.全局属性.文本输入容器) {
      // 清理事件监听器
      if (this.全局属性.文本输入容器._清理拖拽事件) {
        this.全局属性.文本输入容器._清理拖拽事件();
      }
      this.全局属性.文本输入容器.remove();
      this.全局属性.文本输入容器 = null;
    }
  }

  // 获取文本输入框的值
  获取文本输入框的值() {
    if (this.全局属性.文本输入容器) {
      const 输入框 = this.全局属性.文本输入容器.querySelector("#文本输入");
      return 输入框 ? 输入框.value.trim() : "";
    }
    return "";
  }

  // 进入文本编辑模式
  进入文本编辑模式(x, y, 文本形状 = null) {
    this.全局标志.文本编辑中 = true;
    this.全局属性.当前编辑文本形状 = 文本形状;

    // 保存进入前的用户全局颜色（如果还没有保存）
    if (this.全局属性.用户全局描边色 === null) {
      this.全局属性.用户全局描边色 = this.全局属性.描边色;
    }
    if (this.全局属性.用户全局填充色 === null) {
      this.全局属性.用户全局填充色 = this.全局属性.填充色;
    }

    // 更新拾色器到文本专用颜色
    // 设置标志，防止 setColor 触发的 change 事件执行颜色保存逻辑
    this.全局标志.正在恢复颜色 = true;

    if (文本形状) {
      this.描边颜色拾取器.setColor(文本形状.描边色);
      this.填充颜色拾取器.setColor(文本形状.填充色);
    } else {
      this.描边颜色拾取器.setColor(this.全局属性.文本描边色);
      this.填充颜色拾取器.setColor(this.全局属性.文本填充色);
    }

    // 重置标志
    this.全局标志.正在恢复颜色 = false;

    // 如果是编辑已有文本，使用其内容和位置
    if (文本形状) {
      // 使用文本形状的字号（缩放后的字号）
      const 原始字号 = this.全局属性.文本字号;
      this.全局属性.文本字号 = 文本形状.字号;

      this.创建文本输入框(文本形状.坐标.x, 文本形状.坐标.y, 文本形状.文本内容, 文本形状);

      // 恢复原始字号
      this.全局属性.文本字号 = 原始字号;

      // 取消文本形状的选中和悬停状态，隐藏交互框和预览交互框
      文本形状.已选中 = false;
      文本形状.已悬停 = false;

      // 临时隐藏文本内容，避免与文本框重叠
      文本形状._原始文本内容 = 文本形状.文本内容;
      文本形状.文本内容 = "";

      // 重绘画布以隐藏交互框和文本
      this.清空画布();
      this.绘制基础形状对象组();
    } else {
      this.创建文本输入框(x, y);
    }
  }

  // 退出文本编辑模式并确认文本
  退出文本编辑模式() {
    const 文本内容 = this.获取文本输入框的值();
    const 输入框位置 = this.全局属性.文本输入容器
      ? {
          x: parseInt(this.全局属性.文本输入容器.style.left) || 0,
          y: parseInt(this.全局属性.文本输入容器.style.top) || 0,
        }
      : null;

    // 在删除输入框之前，读取其CSS样式值
    let 输入框内边距 = 8; // 默认值
    let 输入框边框 = 1; // 默认值
    if (this.全局属性.文本输入容器) {
      const 输入框元素 = this.全局属性.文本输入容器.querySelector("#文本输入");
      if (输入框元素) {
        const 计算样式 = window.getComputedStyle(输入框元素);
        输入框内边距 = parseFloat(计算样式.paddingLeft) || 8;
        输入框边框 = parseFloat(计算样式.borderLeftWidth) || 1;
      }
    }

    this.删除文本输入框();
    this.全局标志.文本编辑中 = false;

    // 如果有双击待编组的形状，但文本为空（比如按ESC），则清除待编组形状，什么都不做
    if (!文本内容 && this.全局属性.双击待编组形状) {
      this.全局属性.双击待编组形状 = null;
      this.全局属性.双击待编组形状中心 = null;
    }

    // 如果文本为空且正在编辑已有文本，删除该文本形状
    if (!文本内容 && this.全局属性.当前编辑文本形状) {
      const 要删除的形状 = this.全局属性.当前编辑文本形状;

      // 恢复原始文本内容到形状对象，以便撤销时能够正确恢复
      if (要删除的形状._原始文本内容) {
        要删除的形状.文本内容 = 要删除的形状._原始文本内容;
        delete 要删除的形状._原始文本内容;
      }

      // 从数据集中移除该形状
      const 索引 = this.数据集.基础形状对象组.indexOf(要删除的形状);
      if (索引 !== -1) {
        this.数据集.基础形状对象组.splice(索引, 1);

        // 记录删除操作（使用"删除基础形状"以支持撤销）
        this.数据集.操作记录.push({
          操作类型: "删除基础形状",
          操作数据: 索引,
          被删除形状对象: 要删除的形状,
        });
        this.撤销按钮.classList.remove("禁用");
      }

      // 清除选中状态
      this.全局属性.选中形状 = null;

      // 重绘画布
      this.清空画布();
      this.绘制基础形状对象组();
    }

    // 如果文本不为空，创建或更新文本形状
    if (文本内容 && 输入框位置) {
      if (this.全局属性.当前编辑文本形状) {
        // 编辑已有文本：使用文本形状的字号
        const 字号 = this.全局属性.当前编辑文本形状.字号;
        const 交互框顶部偏移 = 字号 / 2;

        const 实际x = 输入框位置.x + 输入框内边距 + 输入框边框;
        const 实际y = 输入框位置.y + 输入框内边距 + 输入框边框 + 交互框顶部偏移;

        // 恢复原始文本内容（用于撤销）
        const 旧文本 = this.全局属性.当前编辑文本形状._原始文本内容 || this.全局属性.当前编辑文本形状.文本内容;
        const 旧坐标 = { x: this.全局属性.当前编辑文本形状.坐标.x, y: this.全局属性.当前编辑文本形状.坐标.y };
        delete this.全局属性.当前编辑文本形状._原始文本内容;

        // 检查文本内容或坐标是否真的改变了
        const 文本内容已改变 = 旧文本 !== 文本内容;
        const 坐标已改变 = 旧坐标.x !== 实际x || 旧坐标.y !== 实际y;

        // 更新文本内容和坐标（如果文本框被拖拽了）
        this.全局属性.当前编辑文本形状.文本内容 = 文本内容;
        this.全局属性.当前编辑文本形状.坐标.x = 实际x;
        this.全局属性.当前编辑文本形状.坐标.y = 实际y;
        this.更新文本形状(this.全局属性.当前编辑文本形状);
        this.更新路径(this.全局属性.当前编辑文本形状);

        // 只有在文本内容或坐标真正改变时才记录编辑操作
        if (文本内容已改变 || 坐标已改变) {
          this.数据集.操作记录.push({
            操作类型: "编辑文本",
            形状: this.全局属性.当前编辑文本形状,
            旧文本: 旧文本,
            旧坐标: 旧坐标,
          });
          this.撤销按钮.classList.remove("禁用");
        }
      } else {
        // 创建新文本：使用全局字号
        const 字号 = this.全局属性.文本字号;
        const 交互框顶部偏移 = 字号 / 2;

        const 实际x = 输入框位置.x + 输入框内边距 + 输入框边框;
        const 实际y = 输入框位置.y + 输入框内边距 + 输入框边框 + 交互框顶部偏移;

        const 新文本形状 = this.创建文本形状(实际x, 实际y, 文本内容, false); // 不记录操作，稍后统一记录

        // 如果有双击待编组的形状，调整文本位置使其整体中心在形状中心，然后编组
        if (this.全局属性.双击待编组形状 && 新文本形状 && this.全局属性.双击待编组形状中心) {
          const 双击的形状 = this.全局属性.双击待编组形状;
          const 形状中心 = this.全局属性.双击待编组形状中心;

          // 调整文本坐标，使得文本整体中心 = 形状中心
          // 文本中心 = (坐标.x + 文本宽度/2, 坐标.y)
          // 要让文本中心 = 形状中心，需要：坐标.x = 形状中心.x - 文本宽度/2，坐标.y = 形状中心.y
          新文本形状.坐标.x = 形状中心.x - 新文本形状.尺寸.宽 / 2;
          新文本形状.坐标.y = 形状中心.y;

          // 重新计算文本的顶点坐标组和极值坐标（因为坐标改变了）
          this.更新文本形状(新文本形状);
          this.更新路径(新文本形状);

          // 检查双击的形状是否已经在某个组中
          let 最终组ID = null;
          let 编组操作信息 = null;

          if (双击的形状.所属组ID !== undefined) {
            // 如果已经在组中，先记录操作前的组形状，然后将新文本形状添加到该组
            const 操作前组形状 = [...this.数据集.形状组[双击的形状.所属组ID]];
            this.将形状添加到组(新文本形状, 双击的形状.所属组ID);
            最终组ID = 双击的形状.所属组ID;

            // 记录操作信息（稍后统一记录）
            编组操作信息 = {
              操作类型: "添加形状到编组",
              组ID: 双击的形状.所属组ID,
              添加的形状: 新文本形状,
              操作前组形状: 操作前组形状,
            };
          } else {
            // 如果不在组中，创建新组
            最终组ID = this.创建组([双击的形状, 新文本形状]);

            // 记录操作信息（稍后统一记录）
            编组操作信息 = {
              操作类型: "编组",
              组ID: 最终组ID,
              形状数组: [双击的形状, 新文本形状],
            };
          }

          // 记录合并操作：双击添加文本并编组
          this.数据集.操作记录.push({
            操作类型: "双击添加文本并编组",
            文本形状: 新文本形状,
            编组操作信息: 编组操作信息,
          });

          // 清除待编组形状
          this.全局属性.双击待编组形状 = null;
          this.全局属性.双击待编组形状中心 = null;

          // 启用撤销按钮
          this.撤销按钮.classList.remove("禁用");

          // 自动选中整个编组
          if (最终组ID) {
            // 获取组内所有形状
            const 组内形状 = this.获取组内所有形状(最终组ID);

            // 清除所有形状的悬停状态
            for (const 形状 of this.数据集.基础形状对象组) {
              形状.已悬停 = false;
            }

            // 清除单选状态
            if (this.全局属性.选中形状) {
              this.全局属性.选中形状.已选中 = false;
            }

            // 清空多选组，然后添加组内所有形状
            this.清空多选组();
            组内形状.forEach((形状) => {
              this.添加到多选组(形状);
            });

            // 清除选中形状和悬停状态
            this.全局属性.选中形状 = null;
            this.全局属性.悬停形状 = null;

            // 更新按钮状态
            this.根据选中形状索引修改处理按钮状态();

            // 自动切换到"选择路径"工具
            const 选择路径单选框 = document.getElementById("选择路径");
            if (选择路径单选框) {
              // 直接手动更新状态，避免触发点击事件清空多选组
              const 旧选中的工具 = this.全局属性.已选中基础形状;
              const 描边宽度滑块 = document.getElementById("描边宽度");

              // 保存当前工具的描边宽度（如果从文本工具切换，不需要保存）
              if (旧选中的工具 === "箭头") {
                this.全局属性.箭头工具描边宽度 = this.全局属性.描边宽度;
              } else if (旧选中的工具 !== null && 旧选中的工具 !== "文本") {
                this.本地存储池.描边宽度 = this.全局属性.描边宽度;
                localStorage.setItem("随心绘存储池", JSON.stringify(this.本地存储池));
              }

              // 更新单选框状态
              if (this.基础形状单选框组.当前基础形状单选框) {
                this.基础形状单选框组.当前基础形状单选框.checked = false;
              }
              选择路径单选框.checked = true;
              this.基础形状单选框组.当前基础形状单选框 = 选择路径单选框;

              // 更新全局状态
              this.全局属性.已选中基础形状 = "选择路径";

              // 恢复描边宽度（如果之前不是箭头工具）
              if (旧选中的工具 !== "箭头") {
                描边宽度滑块.max = 20;
                this.全局属性.描边宽度 = this.本地存储池.描边宽度;
                描边宽度滑块.value = this.本地存储池.描边宽度;
                描边宽度滑块.nextElementSibling.textContent = this.本地存储池.描边宽度;
              }

              // 恢复拾色器颜色（从文本工具切换时）
              if (旧选中的工具 === "文本" || 旧选中的工具 === "箭头") {
                // 如果有多选，保持当前颜色（多选的颜色）
                // 否则恢复到全局颜色
                if (this.全局属性.多选形状组.length === 0) {
                  this.全局标志.正在恢复颜色 = true;
                  this.描边颜色拾取器.setColor(this.全局属性.描边色);
                  this.填充颜色拾取器.setColor(this.全局属性.填充色);
                  this.全局标志.正在恢复颜色 = false;
                }
              }
            }
          }
        } else {
          this.数据集.操作记录.push({
            操作类型: "添加基础形状",
          });
          this.撤销按钮.classList.remove("禁用");
        }
      }
    }

    this.全局属性.当前编辑文本形状 = null;

    // 恢复拾色器颜色（根据当前工具状态，但不修改全局颜色值）
    // 设置标志，防止 setColor 触发的 change 事件执行颜色保存逻辑
    this.全局标志.正在恢复颜色 = true;

    if (this.全局属性.已选中基础形状 === "文本") {
      // 文本工具：显示文本专用颜色
      this.描边颜色拾取器.setColor(this.全局属性.文本描边色);
      this.填充颜色拾取器.setColor(this.全局属性.文本填充色);
    } else if (this.全局属性.已选中基础形状 === "箭头") {
      // 箭头工具：显示箭头专用颜色
      this.描边颜色拾取器.setColor(this.全局属性.箭头描边色);
      this.填充颜色拾取器.setColor(this.全局属性.箭头填充色);
    } else if (this.全局属性.用户全局描边色 !== null || this.全局属性.用户全局填充色 !== null) {
      // 其他工具：恢复到保存的全局颜色（只更新拾色器，不修改全局颜色值）
      if (this.全局属性.用户全局描边色 !== null) {
        this.描边颜色拾取器.setColor(this.全局属性.用户全局描边色);
        this.全局属性.用户全局描边色 = null;
      }
      if (this.全局属性.用户全局填充色 !== null) {
        this.填充颜色拾取器.setColor(this.全局属性.用户全局填充色);
        this.全局属性.用户全局填充色 = null;
      }
    } else {
      // 没有保存的颜色，使用当前全局颜色
      this.描边颜色拾取器.setColor(this.全局属性.描边色);
      this.填充颜色拾取器.setColor(this.全局属性.填充色);
    }

    // 重置标志
    this.全局标志.正在恢复颜色 = false;

    // 清除点击坐标，防止切换工具后出现选框
    this.全局属性.点击坐标 = null;
    this.全局标志.左键已按下 = false;

    this.清空画布();
    this.绘制基础形状对象组();

    // 如果当前是"选择路径"工具，检查鼠标是否悬停在形状上，立即绘制预览交互框
    if (this.全局属性.已选中基础形状 === "选择路径") {
      const 悬停形状 = this.鼠标位于形状内();
      if (悬停形状) {
        悬停形状.已悬停 = true;
        this.全局属性.悬停形状 = 悬停形状;

        // 重绘以显示预览交互框
        this.清空画布();
        this.绘制基础形状对象组();
      }
    }
  }

  // 创建文本形状
  创建文本形状(x, y, 文本内容, 是否记录操作 = true) {
    const 文本形状 = {
      形状: "文本",
      坐标: { x, y },
      文本内容,
      字号: this.全局属性.文本字号,
      字体: this.全局属性.文本字体,
      描边色: this.全局属性.文本描边色, // 使用文本专用的描边色
      填充色: this.全局属性.文本填充色, // 使用文本专用的填充色
      描边宽度: 0,
      已选中: false,
      已悬停: false,
      旋转弧度: 0,
      缩放比例: { x: 1, y: 1 },
      路径: null, // 初始化路径属性
    };

    // 计算文本尺寸和路径
    this.更新文本形状(文本形状);
    this.更新路径(文本形状);

    // 添加到形状组
    this.数据集.基础形状对象组.push(文本形状);

    // 记录操作（如果指定要记录）
    if (是否记录操作) {
      this.数据集.操作记录.push({
        操作类型: "添加基础形状",
      });
      this.撤销按钮.classList.remove("禁用");
    }

    return 文本形状;
  }

  // 更新文本形状（计算尺寸和顶点）
  更新文本形状(文本形状) {
    this.ctx.save();
    this.ctx.font = `${文本形状.字号}px ${文本形状.字体}`;

    // 支持多行文本
    const 行数组 = 文本形状.文本内容.split("\n");
    let 最大宽度 = 0;

    // 计算每行的宽度，取最大值
    行数组.forEach((行) => {
      const 文本度量 = this.ctx.measureText(行);
      最大宽度 = Math.max(最大宽度, 文本度量.width);
    });

    // 如果文本为空，使用一个空格的宽度
    if (最大宽度 === 0) {
      最大宽度 = this.ctx.measureText(" ").width;
    }

    const 文本宽度 = 最大宽度;
    const 行高 = 文本形状.字号 * 1.2;
    const 文本高度 = 行数组.length * 行高;

    文本形状.尺寸 = {
      宽: 文本宽度,
      高: 文本高度,
    };

    // 计算顶点坐标组（4个角点）
    // 使用 middle baseline，文本坐标是垂直中心位置
    const 半高 = 文本高度 / 2;

    // 计算几何中心（旋转中心）
    const 中心x = 文本形状.坐标.x + 文本宽度 / 2;
    const 中心y = 文本形状.坐标.y;

    // 计算未旋转的顶点（相对于几何中心）
    const 半宽 = 文本宽度 / 2;
    const 左上 = { x: 中心x - 半宽, y: 中心y - 半高 };
    const 右上 = { x: 中心x + 半宽, y: 中心y - 半高 };
    const 右下 = { x: 中心x + 半宽, y: 中心y + 半高 };
    const 左下 = { x: 中心x - 半宽, y: 中心y + 半高 };

    // 如果有旋转，应用旋转
    if (文本形状.旋转弧度) {
      const cos = Math.cos(文本形状.旋转弧度);
      const sin = Math.sin(文本形状.旋转弧度);

      const 旋转点 = (点) => {
        const dx = 点.x - 中心x;
        const dy = 点.y - 中心y;
        return {
          x: 中心x + dx * cos - dy * sin,
          y: 中心y + dx * sin + dy * cos,
        };
      };

      文本形状.顶点坐标组 = [旋转点(左上), 旋转点(右上), 旋转点(右下), 旋转点(左下)];
    } else {
      文本形状.顶点坐标组 = [左上, 右上, 右下, 左下];
    }

    // 计算极值坐标
    文本形状.极值坐标 = this.获取极值坐标(文本形状);
    文本形状.中心 = 文本形状.极值坐标.中心;

    this.ctx.restore();
  }

  // 绘制文本
  绘制文本(文本形状) {
    this.ctx.save();

    // 设置字体和颜色
    this.ctx.font = `${文本形状.字号}px ${文本形状.字体}`;
    this.ctx.fillStyle = 文本形状.填充色;
    this.ctx.textBaseline = "middle"; // 使用middle对齐，文本垂直居中

    // 获取缩放比例（默认为1,1）
    const 缩放x = 文本形状.缩放比例?.x ?? 1;
    const 缩放y = 文本形状.缩放比例?.y ?? 1;

    // 计算中心点
    const 中心x = 文本形状.坐标.x + 文本形状.尺寸.宽 / 2;
    const 中心y = 文本形状.坐标.y; // middle baseline，y坐标就是垂直中心

    // 应用变换：先平移至中心，然后缩放，再旋转，最后平移回去
    this.ctx.translate(中心x, 中心y);
    if (文本形状.旋转弧度) {
      this.ctx.rotate(文本形状.旋转弧度);
    }
    this.ctx.scale(缩放x, 缩放y);
    this.ctx.translate(-中心x, -中心y);

    // 绘制文本（支持多行）
    const 行数组 = 文本形状.文本内容.split("\n");
    const 行高 = 文本形状.字号 * 1.2; // 行高为字号的1.2倍
    const 总高度 = 行数组.length * 行高;
    // 坐标.y是整个文本块的垂直中心，第一行的y = 坐标.y - 总高度/2 + 行高/2
    const 起始y = 文本形状.坐标.y - 总高度 / 2 + 行高 / 2;

    行数组.forEach((行, 索引) => {
      const y = 起始y + 索引 * 行高;
      this.ctx.fillText(行, 文本形状.坐标.x, y);
    });

    this.ctx.restore();
  }

  绘制辅助点(x, y) {
    // 文本编辑状态不绘制辅助点
    if (this.全局标志.文本编辑中) {
      return;
    }

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
      形状对象.形状 === "图像" ||
      形状对象.形状 === "箭头" ||
      形状对象.形状 === "文本"
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
    } else if (形状.形状 === "文本") {
      // 文本形状特殊处理
      形状.点击时顶点坐标组 = 形状.顶点坐标组.map((坐标) => ({ ...坐标 }));

      // 文本的旋转锚点应该是几何中心（不是极值坐标的中心）
      // 几何中心 = 坐标.x + 文本宽度/2, 坐标.y
      const 几何中心x = 形状.坐标.x + 形状.尺寸.宽 / 2;
      const 几何中心y = 形状.坐标.y;
      形状.点击时锚点 = {
        x: 几何中心x,
        y: 几何中心y,
      };

      形状.点击时旋转弧度 = 形状.旋转弧度 || 0;
      形状.点击时坐标 = { x: 形状.坐标.x, y: 形状.坐标.y };
      形状.点击时字号 = 形状.字号;
      形状.点击时尺寸 = {
        宽: 形状.尺寸.宽,
        高: 形状.尺寸.高,
      };
    } else if (
      形状.形状 === "矩形" ||
      形状.形状 === "图像" ||
      形状.形状 === "直线" ||
      形状.形状 === "自由" ||
      形状.形状 === "箭头"
    ) {
      形状.点击时顶点坐标组 = 形状.顶点坐标组.map((坐标) => ({ ...坐标 }));
      形状.点击时锚点 =
        形状.极值坐标 && 形状.极值坐标.中心
          ? {
              x: 形状.极值坐标.中心.x,
              y: 形状.极值坐标.中心.y,
            }
          : null;
      // 为矩形、图像和箭头记录旋转弧度（用于交互框旋转）
      if (形状.形状 === "矩形" || 形状.形状 === "图像" || 形状.形状 === "箭头") {
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
        // 为基于顶点的形状也记录尺寸（用于形状已缩放）
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
    形状.点击时字号 = null;
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
    // 顺序与获取旋转矩形的角点保持一致：左上、右上、左下、右下
    return [
      { x: 最左, y: 最上 }, // 左上 [0]
      { x: 最右, y: 最上 }, // 右上 [1]
      { x: 最左, y: 最下 }, // 左下 [2]
      { x: 最右, y: 最下 }, // 右下 [3]
    ];
  }

  获取旋转矩形的角点(形状对象) {
    // 对于圆形、多边形、多角星、箭头，计算旋转矩形的四个角点
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
    } else if (形状对象.形状 === "箭头") {
      // 对于箭头，基于其顶点在局部坐标系中的AABB计算旋转矩形
      if (!形状对象.顶点坐标组 || 形状对象.顶点坐标组.length < 2) return null;
      if (!形状对象.极值坐标 || !形状对象.极值坐标.中心) return null;

      const 中心 = 形状对象.极值坐标.中心;
      const 旋转弧度 = 形状对象.旋转弧度 || 0;

      // 将所有顶点转换到局部坐标系（去掉旋转）
      const cos_inv = Math.cos(-旋转弧度);
      const sin_inv = Math.sin(-旋转弧度);

      let 局部最左 = Infinity,
        局部最右 = -Infinity;
      let 局部最上 = Infinity,
        局部最下 = -Infinity;

      for (const 顶点 of 形状对象.顶点坐标组) {
        const dx = 顶点.x - 中心.x;
        const dy = 顶点.y - 中心.y;
        const 局部x = dx * cos_inv - dy * sin_inv;
        const 局部y = dx * sin_inv + dy * cos_inv;

        局部最左 = Math.min(局部最左, 局部x);
        局部最右 = Math.max(局部最右, 局部x);
        局部最上 = Math.min(局部最上, 局部y);
        局部最下 = Math.max(局部最下, 局部y);
      }

      // 构建局部坐标系中的四个角点
      const 角点组_局部 = [
        { x: 局部最左, y: 局部最上 }, // 左上
        { x: 局部最右, y: 局部最上 }, // 右上
        { x: 局部最左, y: 局部最下 }, // 左下
        { x: 局部最右, y: 局部最下 }, // 右下
      ];

      // 应用旋转变换回世界坐标系
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
    } else if (形状对象.形状 === "矩形" || 形状对象.形状 === "图像") {
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
    } else if (形状对象.形状 === "箭头") {
      // 🎯 对于箭头，使用旋转的交互框角点作为锚点（支持旋转）
      const 旋转弧度 = 形状对象.旋转弧度 || 0;

      if (旋转弧度 !== 0) {
        // 有旋转时，使用旋转矩形的角点
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
      } else {
        // 没有旋转时，使用交互框的实际角点
        const 角点组 = this.获取交互框实际角点(形状对象);
        if (!角点组) return null;

        // 根据鼠标所在的句柄位置，返回对角线的点
        // 角点顺序：[0]=左上, [1]=右上, [2]=左下, [3]=右下
        if (鼠标位于边界.上 && 鼠标位于边界.左) {
          return 角点组[3]; // 右下
        } else if (鼠标位于边界.上 && 鼠标位于边界.右) {
          return 角点组[2]; // 左下
        } else if (鼠标位于边界.下 && 鼠标位于边界.左) {
          return 角点组[1]; // 右上
        } else if (鼠标位于边界.下 && 鼠标位于边界.右) {
          return 角点组[0]; // 左上
        }
      }
    } else if (形状对象.形状 === "直线" || 形状对象.形状 === "自由") {
      // 对于直线和自由绘制，使用交互框的角点（去掉外边距）
      const 角点组 = this.获取交互框实际角点(形状对象);
      if (!角点组) return null;

      // 根据鼠标所在的句柄位置，返回对角线的点
      // 角点顺序：[0]=左上, [1]=右上, [2]=左下, [3]=右下
      if (鼠标位于边界.上 && 鼠标位于边界.左) {
        return 角点组[3]; // 右下
      } else if (鼠标位于边界.上 && 鼠标位于边界.右) {
        return 角点组[2]; // 左下
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
    } else if (形状对象.形状 === "矩形" || 形状对象.形状 === "图像") {
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
    } else if (形状对象.形状 === "箭头") {
      // 🎯 对于箭头，使用旋转矩形的边缘中点作为锚点（支持旋转）
      const 旋转弧度 = 形状对象.旋转弧度 || 0;

      if (旋转弧度 !== 0) {
        // 有旋转时，使用旋转矩形的边缘中点
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
      } else {
        // 没有旋转时，使用交互框的边缘中点
        const 角点组 = this.获取交互框实际角点(形状对象);
        if (!角点组) return null;

        // 根据鼠标所在的边界，返回相对边的中点
        // 角点顺序：[0]=左上, [1]=右上, [2]=左下, [3]=右下
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
      }
    } else if (形状对象.形状 === "直线" || 形状对象.形状 === "自由") {
      // 对于直线和自由绘制，使用交互框的边缘中点
      const 角点组 = this.获取交互框实际角点(形状对象);
      if (!角点组) return null;

      // 根据鼠标所在的边界，返回相对边的中点
      // 角点顺序：[0]=左上, [1]=右上, [2]=左下, [3]=右下
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
        // Alt + 句柄 = 从中心自由缩放，Shift控制等比
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
        // 根据Shift键决定等比缩放
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
        // Alt + 句柄 = 从中心自由缩放，Shift控制等比
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

  执行缩放(形状对象, 等比) {
    if (!形状对象 || !形状对象.点击时尺寸) return;

    const 缩放锚点 = 形状对象.缩放锚点;
    if (!缩放锚点) return;

    const 缩放模式 = this.全局属性.缩放模式;

    const 点击坐标 = this.全局属性.点击坐标;
    const 鼠标坐标 = this.全局属性.鼠标坐标;

    // 对于旋转后的圆形、多边形、多角星、矩形、图像、箭头，需要在局部坐标系中计算缩放比例
    const 需要局部坐标系 =
      (形状对象.形状 === "圆" ||
        形状对象.形状 === "多边形" ||
        形状对象.形状 === "多角星" ||
        形状对象.形状 === "矩形" ||
        形状对象.形状 === "图像" ||
        形状对象.形状 === "箭头") &&
      形状对象.旋转弧度;

    // 计算缩放比例
    let 水平缩放比例 = 1;
    let 垂直缩放比例 = 1;
    const 阈值 = 0.01;

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
        水平缩放比例 = Math.abs(点击_局部x) > 阈值 ? 鼠标_局部x / 点击_局部x : 1;
      } else if (缩放模式 === "vertical") {
        垂直缩放比例 = Math.abs(点击_局部y) > 阈值 ? 鼠标_局部y / 点击_局部y : 1;
      } else if (缩放模式 === "proportional" || 等比) {
        const 初始距离 = Math.sqrt(点击_局部x * 点击_局部x + 点击_局部y * 点击_局部y);
        const 当前距离 = Math.sqrt(鼠标_局部x * 鼠标_局部x + 鼠标_局部y * 鼠标_局部y);
        const 缩放比例 = 初始距离 > 阈值 ? 当前距离 / 初始距离 : 1;

        // 检测翻转
        const 水平翻转 = 点击_局部x * 鼠标_局部x < 0;
        const 垂直翻转 = 点击_局部y * 鼠标_局部y < 0;

        水平缩放比例 = 水平翻转 ? -缩放比例 : 缩放比例;
        垂直缩放比例 = 垂直翻转 ? -缩放比例 : 缩放比例;
      } else {
        // 自由缩放
        水平缩放比例 = Math.abs(点击_局部x) > 阈值 ? 鼠标_局部x / 点击_局部x : 1;
        垂直缩放比例 = Math.abs(点击_局部y) > 阈值 ? 鼠标_局部y / 点击_局部y : 1;
      }
    } else {
      // 在世界坐标系中计算缩放比例（原有逻辑）
      if (缩放模式 === "horizontal") {
        // 水平缩放 - 保留方向以支持镜像翻转
        const 初始水平距离 = 点击坐标.x - 缩放锚点.x;
        const 当前水平距离 = 鼠标坐标.x - 缩放锚点.x;
        水平缩放比例 = Math.abs(初始水平距离) > 阈值 ? 当前水平距离 / 初始水平距离 : 1;
      } else if (缩放模式 === "vertical") {
        // 垂直缩放 - 保留方向以支持镜像翻转
        const 初始垂直距离 = 点击坐标.y - 缩放锚点.y;
        const 当前垂直距离 = 鼠标坐标.y - 缩放锚点.y;
        垂直缩放比例 = Math.abs(初始垂直距离) > 阈值 ? 当前垂直距离 / 初始垂直距离 : 1;
      } else {
        // 自由缩放或等比缩放
        const 初始距离 = Math.sqrt(Math.pow(点击坐标.x - 缩放锚点.x, 2) + Math.pow(点击坐标.y - 缩放锚点.y, 2));
        const 当前距离 = Math.sqrt(Math.pow(鼠标坐标.x - 缩放锚点.x, 2) + Math.pow(鼠标坐标.y - 缩放锚点.y, 2));

        if (缩放模式 === "proportional" || 等比) {
          // 等比缩放 - 需要检测镜像翻转
          const 缩放比例 = 初始距离 > 阈值 ? 当前距离 / 初始距离 : 1;

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

          水平缩放比例 = Math.abs(初始水平距离) > 阈值 ? 当前水平距离 / 初始水平距离 : 1;
          垂直缩放比例 = Math.abs(初始垂直距离) > 阈值 ? 当前垂直距离 / 初始垂直距离 : 1;
        }
      }
    }

    // 应用缩放
    this.应用缩放(形状对象, 水平缩放比例, 垂直缩放比例, 缩放锚点);
  }

  应用缩放(形状对象, 水平缩放比例, 垂直缩放比例, 缩放锚点) {
    if (形状对象.形状 === "文本") {
      // 文本形状：等比缩放，通过修改字号实现
      // 检测是否越过另一端（缩放比例为负数）
      const 句柄越过另一端 = 水平缩放比例 < 0 || 垂直缩放比例 < 0;

      // 如果句柄越过另一端，将缩放比例限制为最小字号对应的比例
      let 原始缩放比例;
      if (句柄越过另一端) {
        // 限制为最小字号12px对应的缩放比例
        原始缩放比例 = 12 / 形状对象.点击时字号;
      } else {
        // 计算等比缩放比例（取两个方向的平均值）
        原始缩放比例 = (Math.abs(水平缩放比例) + Math.abs(垂直缩放比例)) / 2;
      }

      // 计算目标字号
      const 目标字号 = Math.round(形状对象.点击时字号 * 原始缩放比例);

      // 限制字号范围：最小12px，最大100px
      形状对象.字号 = Math.max(12, Math.min(100, 目标字号));

      // 计算实际应用的缩放比例（考虑字号限制）
      const 实际缩放比例 = 形状对象.字号 / 形状对象.点击时字号;

      // 缩放顶点坐标（使用实际缩放比例，这样句柄在达到限制时会停止移动）
      if (形状对象.点击时顶点坐标组 && 形状对象.顶点坐标组) {
        if (形状对象.旋转弧度) {
          // 对于旋转后的文本，在局部坐标系中缩放顶点
          const 旋转弧度 = 形状对象.旋转弧度;
          const cos = Math.cos(-旋转弧度);
          const sin = Math.sin(-旋转弧度);

          for (let i = 0; i < 形状对象.顶点坐标组.length; i++) {
            // 将点击时的顶点转换到局部坐标系
            const dx = 形状对象.点击时顶点坐标组[i].x - 缩放锚点.x;
            const dy = 形状对象.点击时顶点坐标组[i].y - 缩放锚点.y;
            const 局部x = dx * cos - dy * sin;
            const 局部y = dx * sin + dy * cos;

            // 在局部坐标系中应用实际缩放比例
            const 缩放后局部x = 局部x * 实际缩放比例;
            const 缩放后局部y = 局部y * 实际缩放比例;

            // 转换回世界坐标系
            const cos_world = Math.cos(旋转弧度);
            const sin_world = Math.sin(旋转弧度);
            形状对象.顶点坐标组[i].x = 缩放锚点.x + 缩放后局部x * cos_world - 缩放后局部y * sin_world;
            形状对象.顶点坐标组[i].y = 缩放锚点.y + 缩放后局部x * sin_world + 缩放后局部y * cos_world;
          }
        } else {
          // 对于未旋转的文本，直接在世界坐标系中等比缩放
          for (let i = 0; i < 形状对象.顶点坐标组.length; i++) {
            形状对象.顶点坐标组[i].x = 缩放锚点.x + (形状对象.点击时顶点坐标组[i].x - 缩放锚点.x) * 实际缩放比例;
            形状对象.顶点坐标组[i].y = 缩放锚点.y + (形状对象.点击时顶点坐标组[i].y - 缩放锚点.y) * 实际缩放比例;
          }
        }
      }

      // 更新文本尺寸（基于新的字号，支持多行）
      this.ctx.save();
      this.ctx.font = `${形状对象.字号}px ${形状对象.字体}`;

      // 支持多行文本
      const 行数组 = 形状对象.文本内容.split("\n");
      let 最大宽度 = 0;

      // 计算每行的宽度，取最大值
      行数组.forEach((行) => {
        const 文本度量 = this.ctx.measureText(行);
        最大宽度 = Math.max(最大宽度, 文本度量.width);
      });

      // 如果文本为空，使用一个空格的宽度
      if (最大宽度 === 0) {
        最大宽度 = this.ctx.measureText(" ").width;
      }

      const 行高 = 形状对象.字号 * 1.2;

      形状对象.尺寸 = {
        宽: 最大宽度,
        高: 行数组.length * 行高,
      };
      this.ctx.restore();

      // 根据缩放后的顶点更新文本坐标（左边中心点）
      // 计算几何中心
      const 中心x =
        (形状对象.顶点坐标组[0].x + 形状对象.顶点坐标组[1].x + 形状对象.顶点坐标组[2].x + 形状对象.顶点坐标组[3].x) / 4;
      const 中心y =
        (形状对象.顶点坐标组[0].y + 形状对象.顶点坐标组[1].y + 形状对象.顶点坐标组[2].y + 形状对象.顶点坐标组[3].y) / 4;

      // 计算左边中心点（在局部坐标系中相对于几何中心的偏移）
      const 文本宽度 = 形状对象.尺寸.宽;
      const 半宽 = 文本宽度 / 2;

      if (形状对象.旋转弧度) {
        // 有旋转：需要反向旋转来计算左边中心点
        const cos = Math.cos(-形状对象.旋转弧度);
        const sin = Math.sin(-形状对象.旋转弧度);
        形状对象.坐标.x = 中心x + -半宽 * cos - 0 * sin;
        形状对象.坐标.y = 中心y + -半宽 * sin + 0 * cos;
      } else {
        // 无旋转：直接计算
        形状对象.坐标.x = 中心x - 半宽;
        形状对象.坐标.y = 中心y;
      }

      // 只更新极值坐标，不重新计算顶点
      形状对象.极值坐标 = this.获取极值坐标(形状对象);
      形状对象.中心 = 形状对象.极值坐标.中心;

      // 保持旋转角度不变
      if (形状对象.点击时旋转弧度 !== undefined) {
        形状对象.旋转弧度 = 形状对象.点击时旋转弧度;
      }
    } else if (形状对象.形状 === "圆") {
      // 半径取绝对值以确保始终为正，并设置最小值为5
      const 最小半径 = 5;
      形状对象.尺寸.水平半径 = Math.max(最小半径, Math.abs(形状对象.点击时尺寸.水平半径 * 水平缩放比例));
      形状对象.尺寸.垂直半径 = Math.max(最小半径, Math.abs(形状对象.点击时尺寸.垂直半径 * 垂直缩放比例));

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
      // 半径取绝对值以确保始终为正，并设置最小值为5
      const 最小半径 = 5;
      形状对象.尺寸.水平半径 = Math.max(最小半径, Math.abs(形状对象.点击时尺寸.水平半径 * 水平缩放比例));
      形状对象.尺寸.垂直半径 = Math.max(最小半径, Math.abs(形状对象.点击时尺寸.垂直半径 * 垂直缩放比例));

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
      // 半径取绝对值以确保始终为正，并设置最小值为5
      const 最小半径 = 5;
      形状对象.尺寸.外半径.水平 = Math.max(最小半径, Math.abs(形状对象.点击时尺寸.外半径.水平 * 水平缩放比例));
      形状对象.尺寸.外半径.垂直 = Math.max(最小半径, Math.abs(形状对象.点击时尺寸.外半径.垂直 * 垂直缩放比例));
      形状对象.尺寸.内半径.水平 = Math.max(最小半径, Math.abs(形状对象.点击时尺寸.内半径.水平 * 水平缩放比例));
      形状对象.尺寸.内半径.垂直 = Math.max(最小半径, Math.abs(形状对象.点击时尺寸.内半径.垂直 * 垂直缩放比例));

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
      形状对象.形状 === "自由" ||
      形状对象.形状 === "箭头"
    ) {
      // 对于顶点坐标组，应用缩放比例（包括负值），实现镜像翻转
      if (形状对象.点击时顶点坐标组) {
        // 对于箭头，只缩放其长度（沿着箭头方向）
        if (形状对象.形状 === "箭头") {
          // 计算箭头方向的单位向量
          const dx = 形状对象.点击时顶点坐标组[1].x - 形状对象.点击时顶点坐标组[0].x;
          const dy = 形状对象.点击时顶点坐标组[1].y - 形状对象.点击时顶点坐标组[0].y;
          const 长度 = Math.sqrt(dx * dx + dy * dy);

          if (长度 > 0) {
            // 箭头方向的单位向量
            const 方向x = dx / 长度;
            const 方向y = dy / 长度;

            // 计算缩放比例（取水平和垂直缩放比例中绝对值较大的那个）
            let 缩放比例;
            if (Math.abs(水平缩放比例 - 1) > Math.abs(垂直缩放比例 - 1)) {
              缩放比例 = 水平缩放比例;
            } else {
              缩放比例 = 垂直缩放比例;
            }

            // 将起点和终点相对于缩放锚点进行缩放
            // 1. 计算起点和终点相对于锚点的向量
            const 起点到锚点x = 形状对象.点击时顶点坐标组[0].x - 缩放锚点.x;
            const 起点到锚点y = 形状对象.点击时顶点坐标组[0].y - 缩放锚点.y;
            const 终点到锚点x = 形状对象.点击时顶点坐标组[1].x - 缩放锚点.x;
            const 终点到锚点y = 形状对象.点击时顶点坐标组[1].y - 缩放锚点.y;

            // 2. 将这些向量投影到箭头方向上
            const 起点沿箭头投影 = 起点到锚点x * 方向x + 起点到锚点y * 方向y;
            const 终点沿箭头投影 = 终点到锚点x * 方向x + 终点到锚点y * 方向y;

            // 3. 缩放投影长度
            const 起点新投影 = 起点沿箭头投影 * 缩放比例;
            const 终点新投影 = 终点沿箭头投影 * 缩放比例;

            // 4. 计算新的起点和终点位置（相对于锚点）
            const 起点新向量x = 起点新投影 * 方向x;
            const 起点新向量y = 起点新投影 * 方向y;
            const 终点新向量x = 终点新投影 * 方向x;
            const 终点新向量y = 终点新投影 * 方向y;

            // 5. 计算最终的世界坐标
            形状对象.顶点坐标组[0].x = 缩放锚点.x + 起点新向量x;
            形状对象.顶点坐标组[0].y = 缩放锚点.y + 起点新向量y;
            形状对象.顶点坐标组[1].x = 缩放锚点.x + 终点新向量x;
            形状对象.顶点坐标组[1].y = 缩放锚点.y + 终点新向量y;
          } else {
            // 如果长度为0，保持原样
            形状对象.顶点坐标组[0] = { ...形状对象.点击时顶点坐标组[0] };
            形状对象.顶点坐标组[1] = { ...形状对象.点击时顶点坐标组[1] };
          }
        }
        // 检查是否有旋转（矩形、图像需要特殊处理）
        else if ((形状对象.形状 === "矩形" || 形状对象.形状 === "图像") && 形状对象.旋转弧度) {
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

          // 保持矩形、图像和箭头的旋转角度不变
          if (形状对象.点击时旋转弧度 !== undefined) {
            形状对象.旋转弧度 = 形状对象.点击时旋转弧度;
          }

          // 对于图像，还需要更新特定属性
          if (形状对象.形状 === "图像") {
            形状对象.坐标.x = 形状对象.顶点坐标组[0].x;
            形状对象.坐标.y = 形状对象.顶点坐标组[0].y;
            const 最小尺寸 = 5;
            形状对象.尺寸.宽 = Math.max(
              最小尺寸,
              Math.sqrt(
                Math.pow(形状对象.顶点坐标组[1].x - 形状对象.顶点坐标组[0].x, 2) +
                  Math.pow(形状对象.顶点坐标组[1].y - 形状对象.顶点坐标组[0].y, 2)
              )
            );
            形状对象.尺寸.高 = Math.max(
              最小尺寸,
              Math.sqrt(
                Math.pow(形状对象.顶点坐标组[3].x - 形状对象.顶点坐标组[0].x, 2) +
                  Math.pow(形状对象.顶点坐标组[3].y - 形状对象.顶点坐标组[0].y, 2)
              )
            );
          }

          // 对于矩形，确保最小尺寸
          if (形状对象.形状 === "矩形" && 形状对象.顶点坐标组.length >= 4) {
            const 最小尺寸 = 5;
            const 宽 = Math.sqrt(
              Math.pow(形状对象.顶点坐标组[1].x - 形状对象.顶点坐标组[0].x, 2) +
                Math.pow(形状对象.顶点坐标组[1].y - 形状对象.顶点坐标组[0].y, 2)
            );
            const 高 = Math.sqrt(
              Math.pow(形状对象.顶点坐标组[3].x - 形状对象.顶点坐标组[0].x, 2) +
                Math.pow(形状对象.顶点坐标组[3].y - 形状对象.顶点坐标组[0].y, 2)
            );

            if (宽 < 最小尺寸 || 高 < 最小尺寸) {
              // 计算当前矩形的中心
              const 中心x =
                (形状对象.顶点坐标组[0].x +
                  形状对象.顶点坐标组[1].x +
                  形状对象.顶点坐标组[2].x +
                  形状对象.顶点坐标组[3].x) /
                4;
              const 中心y =
                (形状对象.顶点坐标组[0].y +
                  形状对象.顶点坐标组[1].y +
                  形状对象.顶点坐标组[2].y +
                  形状对象.顶点坐标组[3].y) /
                4;

              // 使用最小尺寸重新生成顶点（保持旋转角度和中心位置）
              const 实际宽 = Math.max(最小尺寸, 宽);
              const 实际高 = Math.max(最小尺寸, 高);
              const cos = Math.cos(旋转弧度);
              const sin = Math.sin(旋转弧度);
              const 半宽 = 实际宽 / 2;
              const 半高 = 实际高 / 2;

              // 局部坐标系的四个角点
              const 局部角点组 = [
                { x: -半宽, y: -半高 },
                { x: 半宽, y: -半高 },
                { x: 半宽, y: 半高 },
                { x: -半宽, y: 半高 },
              ];

              // 转换到世界坐标系
              形状对象.顶点坐标组 = 局部角点组.map((局部角点) => ({
                x: 中心x + 局部角点.x * cos - 局部角点.y * sin,
                y: 中心y + 局部角点.x * sin + 局部角点.y * cos,
              }));
            }
          }
        } else if (形状对象.形状 !== "箭头") {
          // 对于未旋转的矩形、图像、直线、自由路径，直接在世界坐标系中缩放
          for (let i = 0; i < 形状对象.顶点坐标组.length; i++) {
            形状对象.顶点坐标组[i].x = 缩放锚点.x + (形状对象.点击时顶点坐标组[i].x - 缩放锚点.x) * 水平缩放比例;
            形状对象.顶点坐标组[i].y = 缩放锚点.y + (形状对象.点击时顶点坐标组[i].y - 缩放锚点.y) * 垂直缩放比例;
          }

          // 对于图像，更新特定属性
          if (形状对象.形状 === "图像") {
            形状对象.坐标.x = 形状对象.顶点坐标组[0].x;
            形状对象.坐标.y = 形状对象.顶点坐标组[0].y;
            const 最小尺寸 = 5;
            形状对象.尺寸.宽 = Math.max(最小尺寸, Math.abs(形状对象.顶点坐标组[1].x - 形状对象.顶点坐标组[0].x));
            形状对象.尺寸.高 = Math.max(最小尺寸, Math.abs(形状对象.顶点坐标组[3].y - 形状对象.顶点坐标组[0].y));
          }

          // 对于矩形，确保最小尺寸
          if (形状对象.形状 === "矩形" && 形状对象.顶点坐标组.length >= 4) {
            const 最小尺寸 = 5;
            const 宽 = Math.abs(形状对象.顶点坐标组[1].x - 形状对象.顶点坐标组[0].x);
            const 高 = Math.abs(形状对象.顶点坐标组[3].y - 形状对象.顶点坐标组[0].y);

            if (宽 < 最小尺寸 || 高 < 最小尺寸) {
              // 计算当前矩形的中心
              const 中心x =
                (形状对象.顶点坐标组[0].x +
                  形状对象.顶点坐标组[1].x +
                  形状对象.顶点坐标组[2].x +
                  形状对象.顶点坐标组[3].x) /
                4;
              const 中心y =
                (形状对象.顶点坐标组[0].y +
                  形状对象.顶点坐标组[1].y +
                  形状对象.顶点坐标组[2].y +
                  形状对象.顶点坐标组[3].y) /
                4;

              // 使用最小尺寸重新生成顶点（保持中心位置，未旋转）
              const 实际宽 = Math.max(最小尺寸, 宽);
              const 实际高 = Math.max(最小尺寸, 高);
              const 半宽 = 实际宽 / 2;
              const 半高 = 实际高 / 2;

              形状对象.顶点坐标组 = [
                { x: 中心x - 半宽, y: 中心y - 半高 },
                { x: 中心x + 半宽, y: 中心y - 半高 },
                { x: 中心x + 半宽, y: 中心y + 半高 },
                { x: 中心x - 半宽, y: 中心y + 半高 },
              ];
            }
          }
        }

        // 更新极值坐标
        形状对象.极值坐标 = this.获取极值坐标(形状对象);

        // 对于图像，更新中心坐标
        if (形状对象.形状 === "图像") {
          形状对象.中心 = 形状对象.极值坐标.中心;
        }

        // 对于箭头，更新起点和终点（旋转和非旋转统一在这里处理）
        if (形状对象.形状 === "箭头") {
          this.更新箭头起点终点(形状对象);
        }
      }
    }
  }

  // ========== 多选缩放相关函数 ==========

  // 设置多选缩放的初始锚点和模式
  设置多选缩放锚点和模式(边界, 鼠标位于边界) {
    if (!边界) return;

    const { minX, minY, maxX, maxY, centerX, centerY } = 边界;

    // 首先计算并保存原始锚点（非Alt模式的锚点）
    // 锚点应该基于所有形状极值坐标综合计算的角（不包含外边距）
    let 原始锚点 = null;

    if (this.全局属性.多选缩放初始拖拽类型 === "handle") {
      // 句柄：根据鼠标位置确定对角的锚点
      const 鼠标X = this.全局属性.鼠标坐标.x;
      const 鼠标Y = this.全局属性.鼠标坐标.y;

      // 确定是哪个角的句柄（距离最近的角，使用极值坐标的角，不包含外边距）
      const 左上距离 = Math.sqrt(Math.pow(鼠标X - minX, 2) + Math.pow(鼠标Y - minY, 2));
      const 右上距离 = Math.sqrt(Math.pow(鼠标X - maxX, 2) + Math.pow(鼠标Y - minY, 2));
      const 右下距离 = Math.sqrt(Math.pow(鼠标X - maxX, 2) + Math.pow(鼠标Y - maxY, 2));
      const 左下距离 = Math.sqrt(Math.pow(鼠标X - minX, 2) + Math.pow(鼠标Y - maxY, 2));

      if (左上距离 <= 右上距离 && 左上距离 <= 右下距离 && 左上距离 <= 左下距离) {
        // 左上角句柄，锚点在右下角（极值坐标的右下角）
        原始锚点 = { x: maxX, y: maxY };
      } else if (右上距离 <= 右下距离 && 右上距离 <= 左下距离) {
        // 右上角句柄，锚点在左下角（极值坐标的左下角）
        原始锚点 = { x: minX, y: maxY };
      } else if (右下距离 <= 左下距离) {
        // 右下角句柄，锚点在左上角（极值坐标的左上角）
        原始锚点 = { x: minX, y: minY };
      } else {
        // 左下角句柄，锚点在右上角（极值坐标的右上角）
        原始锚点 = { x: maxX, y: minY };
      }
    } else if (this.全局属性.多选缩放初始拖拽类型 === "vertical") {
      // 垂直缩放（上下边界）：锚点在相对边的中点
      if (鼠标位于边界.上) {
        // 上边界，锚点在下边界中点（极值坐标的下边界）
        原始锚点 = { x: centerX, y: maxY };
      } else if (鼠标位于边界.下) {
        // 下边界，锚点在上边界中点（极值坐标的上边界）
        原始锚点 = { x: centerX, y: minY };
      }
    } else if (this.全局属性.多选缩放初始拖拽类型 === "horizontal") {
      // 水平缩放（左右边界）：锚点在相对边的中点
      if (鼠标位于边界.左) {
        // 左边界，锚点在右边界中点（极值坐标的右边界）
        原始锚点 = { x: maxX, y: centerY };
      } else if (鼠标位于边界.右) {
        // 右边界，锚点在左边界中点（极值坐标的左边界）
        原始锚点 = { x: minX, y: centerY };
      }
    }

    // 保存原始锚点
    this.全局属性.多选缩放原始锚点 = 原始锚点;

    // 检查是否有任何形状旋转过
    const 有旋转 = this.检查多选形状是否有旋转();

    // 根据Alt键和初始拖拽类型设置锚点和模式
    if (this.键盘状态.Alt) {
      // 按住Alt键 - 使用中心点作为锚点
      this.全局属性.多选缩放锚点 = { x: centerX, y: centerY };
      if (this.全局属性.多选缩放初始拖拽类型 === "handle") {
        // Alt + 句柄：如果有旋转，强制等比缩放；否则根据Shift键决定
        this.全局属性.缩放模式 = 有旋转 || this.键盘状态.Shift ? "proportional" : "free";
      } else if (this.全局属性.多选缩放初始拖拽类型 === "vertical") {
        this.全局属性.缩放模式 = "vertical";
      } else if (this.全局属性.多选缩放初始拖拽类型 === "horizontal") {
        this.全局属性.缩放模式 = "horizontal";
      }
    } else {
      // 没有按Alt键 - 使用原始锚点
      this.全局属性.多选缩放锚点 = 原始锚点;
      if (this.全局属性.多选缩放初始拖拽类型 === "handle") {
        // 句柄缩放：如果有旋转，强制等比缩放；否则根据Shift键决定
        this.全局属性.缩放模式 = 有旋转 || this.键盘状态.Shift ? "proportional" : "free";
      } else if (this.全局属性.多选缩放初始拖拽类型 === "vertical") {
        this.全局属性.缩放模式 = "vertical";
      } else if (this.全局属性.多选缩放初始拖拽类型 === "horizontal") {
        this.全局属性.缩放模式 = "horizontal";
      }
    }
  }

  // 更新多选缩放的锚点和模式（鼠标移动时调用）
  更新多选缩放锚点和模式() {
    if (!this.全局属性.多选缩放初始边界) return;

    const 边界 = this.全局属性.多选缩放初始边界;
    const { centerX, centerY } = 边界;

    // 检查是否有任何形状旋转过
    const 有旋转 = this.检查多选形状是否有旋转();

    // 根据Alt键更新锚点和模式
    if (this.键盘状态.Alt) {
      // 按住Alt键 - 使用中心点作为锚点
      this.全局属性.多选缩放锚点 = { x: centerX, y: centerY };
      if (this.全局属性.多选缩放初始拖拽类型 === "handle") {
        // Alt + 句柄：如果有旋转，强制等比缩放；否则根据Shift键决定
        this.全局属性.缩放模式 = 有旋转 || this.键盘状态.Shift ? "proportional" : "free";
      } else if (this.全局属性.多选缩放初始拖拽类型 === "vertical") {
        this.全局属性.缩放模式 = "vertical";
      } else if (this.全局属性.多选缩放初始拖拽类型 === "horizontal") {
        this.全局属性.缩放模式 = "horizontal";
      }
    } else {
      // 没有按Alt键 - 恢复原始锚点
      this.全局属性.多选缩放锚点 = this.全局属性.多选缩放原始锚点;
      if (this.全局属性.多选缩放初始拖拽类型 === "handle") {
        // 句柄缩放：如果有旋转，强制等比缩放；否则根据Shift键决定
        this.全局属性.缩放模式 = 有旋转 || this.键盘状态.Shift ? "proportional" : "free";
      } else if (this.全局属性.多选缩放初始拖拽类型 === "vertical") {
        // 垂直缩放：保持垂直模式
        this.全局属性.缩放模式 = "vertical";
      } else if (this.全局属性.多选缩放初始拖拽类型 === "horizontal") {
        // 水平缩放：保持水平模式
        this.全局属性.缩放模式 = "horizontal";
      }
    }
  }

  // 执行多选缩放
  执行多选缩放() {
    if (!this.全局属性.多选缩放初始边界 || !this.全局属性.多选缩放锚点) return;

    const 初始边界 = this.全局属性.多选缩放初始边界;
    const 缩放锚点 = this.全局属性.多选缩放锚点;

    const 点击坐标 = this.全局属性.点击坐标;
    const 鼠标坐标 = this.全局属性.鼠标坐标;

    // 检查是否有任何形状旋转过
    const 有旋转 = this.检查多选形状是否有旋转();

    // 根据是否有旋转和缩放模式决定缩放方式
    // 如果所有形状都未旋转，且缩放模式为"free"，则允许自由缩放
    // 否则强制使用等比缩放
    const 强制等比缩放 = 有旋转 || this.全局属性.缩放模式 === "proportional";

    // 计算缩放比例
    let 水平缩放比例 = 1;
    let 垂直缩放比例 = 1;
    const 阈值 = 0.01;

    if (强制等比缩放) {
      // 等比缩放
      const 初始距离 = Math.sqrt(Math.pow(点击坐标.x - 缩放锚点.x, 2) + Math.pow(点击坐标.y - 缩放锚点.y, 2));
      const 当前距离 = Math.sqrt(Math.pow(鼠标坐标.x - 缩放锚点.x, 2) + Math.pow(鼠标坐标.y - 缩放锚点.y, 2));
      const 缩放比例 = 初始距离 > 阈值 ? 当前距离 / 初始距离 : 1;

      // 检测水平和垂直方向是否发生翻转
      const 初始水平距离 = 点击坐标.x - 缩放锚点.x;
      const 初始垂直距离 = 点击坐标.y - 缩放锚点.y;
      const 当前水平距离 = 鼠标坐标.x - 缩放锚点.x;
      const 当前垂直距离 = 鼠标坐标.y - 缩放锚点.y;

      const 水平翻转 = 初始水平距离 * 当前水平距离 < 0;
      const 垂直翻转 = 初始垂直距离 * 当前垂直距离 < 0;

      水平缩放比例 = 水平翻转 ? -缩放比例 : 缩放比例;
      垂直缩放比例 = 垂直翻转 ? -缩放比例 : 缩放比例;
    } else {
      // 自由缩放（所有形状都未旋转，且缩放模式为"free"）
      const 初始水平距离 = 点击坐标.x - 缩放锚点.x;
      const 初始垂直距离 = 点击坐标.y - 缩放锚点.y;
      const 当前水平距离 = 鼠标坐标.x - 缩放锚点.x;
      const 当前垂直距离 = 鼠标坐标.y - 缩放锚点.y;

      // 计算水平和垂直方向的缩放比例
      水平缩放比例 = Math.abs(初始水平距离) > 阈值 ? 当前水平距离 / 初始水平距离 : 1;
      垂直缩放比例 = Math.abs(初始垂直距离) > 阈值 ? 当前垂直距离 / 初始垂直距离 : 1;
    }

    // 对每个形状应用相同的缩放比例
    this.全局属性.多选缩放初始位置组.forEach((初始位置) => {
      const 形状 = 初始位置.形状;

      // 对每个形状应用缩放（使用它们的初始状态）
      this.应用多选形状缩放(形状, 初始位置, 水平缩放比例, 垂直缩放比例, 缩放锚点, 初始边界);
    });
  }

  // 应用多选形状缩放（单个形状）
  // 使用统一的单个缩放逻辑，确保每个形状按照各自的缩放逻辑进行缩放
  应用多选形状缩放(形状, 初始位置, 水平缩放比例, 垂直缩放比例, 缩放锚点, 初始边界) {
    if (!形状 || !初始位置) return;

    // 保存形状的原始状态（如果存在）
    const 原始点击时尺寸 = 形状.点击时尺寸;
    const 原始点击时顶点坐标组 = 形状.点击时顶点坐标组;
    const 原始点击时坐标 = 形状.点击时坐标;
    const 原始点击时旋转弧度 = 形状.点击时旋转弧度;
    const 原始点击时字号 = 形状.点击时字号;
    const 原始缩放锚点 = 形状.缩放锚点;

    try {
      // 临时设置单个缩放所需的属性，复用单个缩放的逻辑
      形状.点击时尺寸 = 初始位置.按下时尺寸 ? structuredClone(初始位置.按下时尺寸) : undefined;
      形状.点击时顶点坐标组 = 初始位置.按下时顶点坐标组 ? 初始位置.按下时顶点坐标组.map((v) => ({ ...v })) : undefined;
      形状.点击时坐标 = 初始位置.按下时坐标 ? { ...初始位置.按下时坐标 } : undefined;
      形状.点击时旋转弧度 = 初始位置.按下时旋转弧度 !== undefined ? 初始位置.按下时旋转弧度 : undefined;
      形状.点击时字号 = 初始位置.按下时字号 !== undefined ? 初始位置.按下时字号 : undefined;

      // 设置多选的缩放锚点（统一的锚点）
      形状.缩放锚点 = 缩放锚点;

      // 调用单个缩放的逻辑
      this.应用缩放(形状, 水平缩放比例, 垂直缩放比例, 缩放锚点);
    } finally {
      // 恢复形状的原始状态
      形状.点击时尺寸 = 原始点击时尺寸;
      形状.点击时顶点坐标组 = 原始点击时顶点坐标组;
      形状.点击时坐标 = 原始点击时坐标;
      形状.点击时旋转弧度 = 原始点击时旋转弧度;
      形状.点击时字号 = 原始点击时字号;
      形状.缩放锚点 = 原始缩放锚点;
    }

    // 更新极值坐标
    形状.极值坐标 = this.获取极值坐标(形状);

    // 对于文本，更新文本形状
    if (形状.形状 === "文本") {
      this.更新文本形状(形状);
    }
  }

  // 检查多选形状组中是否有任何形状旋转过
  检查多选形状是否有旋转() {
    if (!this.全局属性.多选形状组 || this.全局属性.多选形状组.length === 0) {
      return false;
    }

    // 检查每个形状是否旋转过
    for (const 形状 of this.全局属性.多选形状组) {
      let 旋转弧度 = 形状.旋转弧度;

      // 对于矩形和图像，如果旋转弧度未显式设置，需要计算
      if ((形状.形状 === "矩形" || 形状.形状 === "图像") && 旋转弧度 === undefined) {
        旋转弧度 = this.计算矩形旋转角度(形状);
      }

      // 如果旋转弧度不为0（或接近0），则认为已旋转
      if (旋转弧度 !== undefined && 旋转弧度 !== null) {
        // 使用小的阈值来避免浮点数精度问题
        const 旋转阈值 = 0.0001;
        const 归一化角度 = ((旋转弧度 % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (归一化角度 > 旋转阈值 && Math.abs(归一化角度 - Math.PI * 2) > 旋转阈值) {
          return true; // 发现旋转过的形状
        }
      }
    }

    return false; // 所有形状都未旋转
  }

  // ========== 多选缩放相关函数结束 ==========

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
  }

  // ========== 多选缩放相关函数结束 ==========

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
  }

  // ========== 多选缩放相关函数结束 ==========

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

  形状已缩放(形状) {
    if (!形状 || !形状.点击时尺寸) return false;

    const 阈值 = 0.1;
    if (形状.形状 === "圆") {
      return (
        Math.abs(形状.尺寸.水平半径 - 形状.点击时尺寸.水平半径) > 阈值 ||
        Math.abs(形状.尺寸.垂直半径 - 形状.点击时尺寸.垂直半径) > 阈值
      );
    } else if (形状.形状 === "文本") {
      // 文本形状通过字号判断是否缩放
      if (形状.点击时字号 !== undefined) {
        return Math.abs(形状.字号 - 形状.点击时字号) > 0.5;
      }
      return false;
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
    } else if (
      形状.形状 === "矩形" ||
      形状.形状 === "图像" ||
      形状.形状 === "直线" ||
      形状.形状 === "自由" ||
      形状.形状 === "箭头"
    ) {
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
    const 缩放前字号 = 操作记录.缩放前字号;

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
    } else if (形状.形状 === "文本") {
      // 恢复文本的字号
      if (缩放前字号 !== undefined) {
        形状.字号 = 缩放前字号;
      }
      // 恢复文本的坐标
      if (缩放前坐标) {
        形状.坐标.x = 缩放前坐标.x;
        形状.坐标.y = 缩放前坐标.y;
      }
      // 恢复旋转弧度
      if (缩放前旋转弧度 !== undefined) {
        形状.旋转弧度 = 缩放前旋转弧度;
      }
      // 恢复顶点坐标组
      if (缩放前顶点坐标组) {
        形状.顶点坐标组 = 缩放前顶点坐标组.map((坐标) => ({ ...坐标 }));
      }
      // 根据恢复的字号重新计算文本尺寸
      this.更新文本形状(形状);
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
    } else if (形状.形状 === "矩形" || 形状.形状 === "直线" || 形状.形状 === "自由" || 形状.形状 === "箭头") {
      if (缩放前顶点坐标组) {
        形状.顶点坐标组 = 缩放前顶点坐标组.map((坐标) => ({ ...坐标 }));
        形状.极值坐标 = this.获取极值坐标(形状);

        // 对于箭头，还需要更新起点和终点
        if (形状.形状 === "箭头") {
          this.更新箭头起点终点(形状);
        }
      }
      // 对于矩形和箭头，恢复旋转弧度
      if ((形状.形状 === "矩形" || 形状.形状 === "箭头") && 缩放前旋转弧度 !== undefined) {
        形状.旋转弧度 = 缩放前旋转弧度;
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
      起点: 形状.起点 ? { ...形状.起点 } : null,
      终点: 形状.终点 ? { ...形状.终点 } : null,
      缩放比例: 形状.缩放比例 ? { ...形状.缩放比例 } : null,
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
    } else if (形状.形状 === "文本") {
      // 文本：水平翻转使用缩放比例
      if (!形状.缩放比例) {
        形状.缩放比例 = { x: 1, y: 1 };
      }
      形状.缩放比例.x = -形状.缩放比例.x;

      // 更新文本形状（重新计算顶点和极值坐标）
      this.更新文本形状(形状);
    } else if (
      形状.形状 === "矩形" ||
      形状.形状 === "图像" ||
      形状.形状 === "直线" ||
      形状.形状 === "自由" ||
      形状.形状 === "箭头"
    ) {
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
      // 对于箭头，更新起点和终点
      if (形状.形状 === "箭头") {
        this.更新箭头起点终点(形状);
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

  翻转多选形状(水平翻转, 垂直翻转) {
    if (!this.全局属性.多选形状组 || this.全局属性.多选形状组.length === 0) {
      return;
    }

    // 获取整体边界中心作为翻转轴
    const 边界 = this.获取多选形状的边界();
    if (!边界) {
      return;
    }

    const 翻转轴 = {
      x: 边界.centerX || 边界.minX + 边界.width / 2,
      y: 边界.centerY || 边界.minY + 边界.height / 2,
    };

    // 记录所有形状的初始状态（用于撤销）
    const 翻转操作数组 = [];
    this.全局属性.多选形状组.forEach((形状) => {
      const 变换前数据 = {
        坐标: 形状.坐标 ? { ...形状.坐标 } : null,
        顶点坐标组: 形状.顶点坐标组 ? 形状.顶点坐标组.map((坐标) => ({ ...坐标 })) : null,
        外顶点坐标组: 形状.外顶点坐标组 ? 形状.外顶点坐标组.map((坐标) => ({ ...坐标 })) : null,
        内顶点坐标组: 形状.内顶点坐标组 ? 形状.内顶点坐标组.map((坐标) => ({ ...坐标 })) : null,
        旋转弧度: 形状.旋转弧度,
        起始弧度: 形状.起始弧度,
        起点: 形状.起点 ? { ...形状.起点 } : null,
        终点: 形状.终点 ? { ...形状.终点 } : null,
        缩放比例: 形状.缩放比例 ? { ...形状.缩放比例 } : null,
      };

      翻转操作数组.push({
        操作类型: "翻转",
        形状: 形状,
        变换前数据: 变换前数据,
      });

      // 获取形状中心点
      let 形状中心 = null;
      if (形状.形状 === "圆" || 形状.形状 === "多边形" || 形状.形状 === "多角星") {
        形状中心 = { x: 形状.坐标.x, y: 形状.坐标.y };
      } else if (形状.形状 === "文本") {
        // 文本的中心是坐标.x + 宽度/2（因为坐标.x是文本的左边缘）
        const 文本极值 = this.获取极值坐标(形状);
        形状中心 = 文本极值 ? 文本极值.中心 : { x: 形状.坐标.x + 形状.尺寸.宽 / 2, y: 形状.坐标.y };
      } else if (形状.形状 === "矩形" || 形状.形状 === "图像" || 形状.形状 === "箭头") {
        const 极值 = this.获取极值坐标(形状);
        if (极值) {
          形状中心 = 极值.中心;
        }
      } else if (形状.形状 === "直线" || 形状.形状 === "自由") {
        if (形状.顶点坐标组 && 形状.顶点坐标组.length > 0) {
          const 最左 = Math.min(...形状.顶点坐标组.map((v) => v.x));
          const 最右 = Math.max(...形状.顶点坐标组.map((v) => v.x));
          const 最上 = Math.min(...形状.顶点坐标组.map((v) => v.y));
          const 最下 = Math.max(...形状.顶点坐标组.map((v) => v.y));
          形状中心 = {
            x: (最左 + 最右) / 2,
            y: (最上 + 最下) / 2,
          };
        }
      }

      if (!形状中心) return;

      // 计算翻转后的形状中心（围绕翻转轴）
      let 翻转后的中心 = { ...形状中心 };
      if (水平翻转) {
        翻转后的中心.x = 翻转轴.x - (形状中心.x - 翻转轴.x);
      }
      if (垂直翻转) {
        翻转后的中心.y = 翻转轴.y - (形状中心.y - 翻转轴.y);
      }

      // 根据形状类型应用翻转
      if (形状.形状 === "圆") {
        // 圆：翻转旋转角度
        形状.坐标.x = 翻转后的中心.x;
        形状.坐标.y = 翻转后的中心.y;
        if (水平翻转 && 垂直翻转) {
          // 水平+垂直翻转 = 180度旋转
          形状.旋转弧度 = (形状.旋转弧度 || 0) + Math.PI;
        } else if (水平翻转) {
          // 水平翻转：翻转旋转角度
          形状.旋转弧度 = Math.PI - (形状.旋转弧度 || 0);
        } else if (垂直翻转) {
          // 垂直翻转：翻转旋转角度
          形状.旋转弧度 = -(形状.旋转弧度 || 0);
        }
        // 标准化旋转弧度
        while (形状.旋转弧度 > Math.PI * 2) {
          形状.旋转弧度 -= Math.PI * 2;
        }
        while (形状.旋转弧度 < 0) {
          形状.旋转弧度 += Math.PI * 2;
        }
      } else if (形状.形状 === "多边形" || 形状.形状 === "多角星") {
        // 多边形/多角星：翻转旋转弧度
        形状.坐标.x = 翻转后的中心.x;
        形状.坐标.y = 翻转后的中心.y;

        if (形状.旋转弧度 === undefined) {
          形状.旋转弧度 = 0;
        }
        if (形状.起始弧度 === undefined) {
          形状.起始弧度 = -Math.PI / 2;
        }

        if (水平翻转 && 垂直翻转) {
          // 水平+垂直翻转 = 180度旋转
          形状.旋转弧度 = 形状.旋转弧度 + Math.PI;
        } else if (水平翻转) {
          // 水平翻转
          形状.旋转弧度 = -形状.旋转弧度;
        } else if (垂直翻转) {
          // 垂直翻转
          形状.旋转弧度 = Math.PI - 形状.旋转弧度;
        }

        // 标准化旋转弧度
        while (形状.旋转弧度 > Math.PI * 2) {
          形状.旋转弧度 -= Math.PI * 2;
        }
        while (形状.旋转弧度 < 0) {
          形状.旋转弧度 += Math.PI * 2;
        }

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
      } else if (形状.形状 === "文本") {
        // 文本：翻转坐标和缩放比例
        // 文本的中心需要计算（坐标.x + 宽度/2）
        const 当前文本中心 = { x: 形状.坐标.x + 形状.尺寸.宽 / 2, y: 形状.坐标.y };

        // 根据翻转后的中心计算新的坐标
        形状.坐标.x = 翻转后的中心.x - 形状.尺寸.宽 / 2;
        形状.坐标.y = 翻转后的中心.y;

        // 使用缩放比例来实现翻转
        if (!形状.缩放比例) {
          形状.缩放比例 = { x: 1, y: 1 };
        }
        if (水平翻转) {
          形状.缩放比例.x = -形状.缩放比例.x;
        }
        if (垂直翻转) {
          形状.缩放比例.y = -形状.缩放比例.y;
        }

        // 重新生成顶点和极值坐标
        this.更新文本形状(形状);
      } else if (
        形状.形状 === "矩形" ||
        形状.形状 === "图像" ||
        形状.形状 === "直线" ||
        形状.形状 === "自由" ||
        形状.形状 === "箭头"
      ) {
        // 顶点形状：翻转顶点
        if (形状.顶点坐标组 && 形状.顶点坐标组.length > 0) {
          形状.顶点坐标组 = 形状.顶点坐标组.map((坐标) => {
            let 新坐标 = { ...坐标 };
            if (水平翻转) {
              新坐标.x = 翻转轴.x - (坐标.x - 翻转轴.x);
            }
            if (垂直翻转) {
              新坐标.y = 翻转轴.y - (坐标.y - 翻转轴.y);
            }
            return 新坐标;
          });
        }

        // 对于图像，更新坐标和中心
        if (形状.形状 === "图像") {
          形状.坐标.x = 形状.顶点坐标组[0].x;
          形状.坐标.y = 形状.顶点坐标组[0].y;
        }
        // 对于箭头，更新起点和终点
        if (形状.形状 === "箭头") {
          this.更新箭头起点终点(形状);
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
    });

    // 清空画布并重新绘制
    this.清空画布();
    this.绘制基础形状对象组();

    // 记录操作以便撤销
    const 操作类型 = 水平翻转 && 垂直翻转 ? "水平垂直翻转多个形状" : 水平翻转 ? "水平翻转多个形状" : "垂直翻转多个形状";
    this.数据集.操作记录.push({
      操作类型: 操作类型,
      翻转操作数组: 翻转操作数组,
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
      起点: 形状.起点 ? { ...形状.起点 } : null,
      终点: 形状.终点 ? { ...形状.终点 } : null,
      缩放比例: 形状.缩放比例 ? { ...形状.缩放比例 } : null,
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
    } else if (形状.形状 === "文本") {
      // 文本：垂直翻转使用缩放比例
      if (!形状.缩放比例) {
        形状.缩放比例 = { x: 1, y: 1 };
      }
      形状.缩放比例.y = -形状.缩放比例.y;

      // 更新文本形状（重新计算顶点和极值坐标）
      this.更新文本形状(形状);
    } else if (
      形状.形状 === "矩形" ||
      形状.形状 === "图像" ||
      形状.形状 === "直线" ||
      形状.形状 === "自由" ||
      形状.形状 === "箭头"
    ) {
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
      // 对于箭头，更新起点和终点
      if (形状.形状 === "箭头") {
        this.更新箭头起点终点(形状);
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
      起点: 形状.起点 ? { ...形状.起点 } : null,
      终点: 形状.终点 ? { ...形状.终点 } : null,
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
    } else if (
      形状.形状 === "矩形" ||
      形状.形状 === "图像" ||
      形状.形状 === "直线" ||
      形状.形状 === "自由" ||
      形状.形状 === "箭头"
    ) {
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
      // 对于箭头，更新起点和终点
      if (形状.形状 === "箭头") {
        this.更新箭头起点终点(形状);
      }
    } else if (形状.形状 === "文本") {
      // 文本：旋转90度
      if (形状.旋转弧度 === undefined) {
        形状.旋转弧度 = 0;
      }
      形状.旋转弧度 += 旋转弧度;
      // 标准化旋转角度
      while (形状.旋转弧度 > Math.PI * 2) 形状.旋转弧度 -= Math.PI * 2;
      while (形状.旋转弧度 < 0) 形状.旋转弧度 += Math.PI * 2;

      // 更新文本形状（重新计算顶点和极值坐标）
      this.更新文本形状(形状);
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
    } else if (
      形状.形状 === "矩形" ||
      形状.形状 === "图像" ||
      形状.形状 === "直线" ||
      形状.形状 === "自由" ||
      形状.形状 === "箭头"
    ) {
      形状.极值坐标 = this.获取极值坐标(形状);

      // 对于图像，更新中心
      if (形状.形状 === "图像") {
        形状.中心 = 形状.极值坐标.中心;
      }
      // 对于箭头，更新起点和终点
      if (形状.形状 === "箭头") {
        this.更新箭头起点终点(形状);
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

  旋转多选形状90度(顺时针) {
    if (!this.全局属性.多选形状组 || this.全局属性.多选形状组.length === 0) {
      return;
    }

    // 判断是编组
    const 是编组 =
      this.全局属性.多选形状组.length > 0 &&
      this.全局属性.多选形状组.every((形状) => 形状.所属组ID === this.全局属性.多选形状组[0].所属组ID) &&
      this.全局属性.多选形状组[0].所属组ID !== undefined;

    // 获取整体边界（未旋转状态）
    let 初始边界 = null;
    if (是编组) {
      const 组ID = this.全局属性.多选形状组[0].所属组ID;
      if (组ID && this.全局属性.编组旋转边界映射[组ID]) {
        初始边界 = this.全局属性.编组旋转边界映射[组ID];
      }
    } else {
      const 多选标识 = this.全局属性.多选形状组
        .map((形状) => this.数据集.基础形状对象组.indexOf(形状))
        .sort()
        .join(",");
      if (this.全局属性.多选旋转边界映射[多选标识]) {
        初始边界 = this.全局属性.多选旋转边界映射[多选标识];
      }
    }

    // 如果没有保存的边界，计算当前边界
    if (!初始边界) {
      初始边界 = this.获取多选形状的边界();
    }

    if (!初始边界) {
      return;
    }

    // 计算锚点（整体边界中心）
    const 锚点 = {
      x: 初始边界.minX + 初始边界.width / 2,
      y: 初始边界.minY + 初始边界.height / 2,
    };

    // 旋转弧度（90度 = π/2）
    const 旋转弧度 = 顺时针 ? Math.PI / 2 : -Math.PI / 2;

    // 记录所有形状的初始状态（用于撤销）
    const 旋转操作数组 = [];
    const 初始位置组 = this.全局属性.多选形状组.map((形状) => {
      // 记录初始状态
      const 初始位置 = {
        形状: 形状,
        按下时坐标: structuredClone(形状.坐标),
        按下时顶点坐标组: structuredClone(形状.顶点坐标组),
        按下时旋转弧度: 形状.旋转弧度 !== undefined ? structuredClone(形状.旋转弧度) : 0,
        按下时字号: 形状.字号 !== undefined ? structuredClone(形状.字号) : undefined,
      };

      // 对于矩形和图像，确保旋转弧度已计算
      if ((形状.形状 === "矩形" || 形状.形状 === "图像") && 形状.顶点坐标组 && 形状.顶点坐标组.length === 4) {
        初始位置.按下时旋转弧度 = this.计算矩形旋转角度(形状);
        形状.旋转弧度 = 初始位置.按下时旋转弧度;
      }

      // 记录操作以便撤销
      if (
        形状.形状 === "圆" ||
        形状.形状 === "文本" ||
        形状.形状 === "多边形" ||
        形状.形状 === "多角星" ||
        形状.形状 === "矩形" ||
        形状.形状 === "图像" ||
        形状.形状 === "直线" ||
        形状.形状 === "自由" ||
        形状.形状 === "箭头"
      ) {
        旋转操作数组.push({
          操作类型: "旋转",
          形状: 形状,
          坐标: 初始位置.按下时坐标 ? structuredClone(初始位置.按下时坐标) : null,
          顶点坐标组: 初始位置.按下时顶点坐标组 ? [...初始位置.按下时顶点坐标组] : [],
          旋转弧度: 初始位置.按下时旋转弧度 !== undefined ? structuredClone(初始位置.按下时旋转弧度) : undefined,
        });
      }

      return 初始位置;
    });

    // 对所有多选形状应用旋转：围绕锚点旋转，同时自身也旋转
    初始位置组.forEach((初始位置) => {
      const 形状 = 初始位置.形状;

      // 获取形状的中心点（用于围绕锚点旋转）
      let 形状中心 = null;
      if (形状.形状 === "圆" || 形状.形状 === "多边形" || 形状.形状 === "多角星") {
        形状中心 = { x: 初始位置.按下时坐标.x, y: 初始位置.按下时坐标.y };
      } else if (形状.形状 === "文本") {
        形状中心 = { x: 初始位置.按下时坐标.x, y: 初始位置.按下时坐标.y };
      } else if (形状.形状 === "矩形" || 形状.形状 === "图像" || 形状.形状 === "箭头") {
        // 计算初始状态的极值坐标中心
        const 初始顶点组 = 初始位置.按下时顶点坐标组;
        if (初始顶点组 && 初始顶点组.length > 0) {
          const 最左 = Math.min(...初始顶点组.map((v) => v.x));
          const 最右 = Math.max(...初始顶点组.map((v) => v.x));
          const 最上 = Math.min(...初始顶点组.map((v) => v.y));
          const 最下 = Math.max(...初始顶点组.map((v) => v.y));
          形状中心 = {
            x: (最左 + 最右) / 2,
            y: (最上 + 最下) / 2,
          };
        }
      } else if (形状.形状 === "直线" || 形状.形状 === "自由") {
        // 计算所有顶点的中心
        if (初始位置.按下时顶点坐标组 && 初始位置.按下时顶点坐标组.length > 0) {
          const 最左 = Math.min(...初始位置.按下时顶点坐标组.map((v) => v.x));
          const 最右 = Math.max(...初始位置.按下时顶点坐标组.map((v) => v.x));
          const 最上 = Math.min(...初始位置.按下时顶点坐标组.map((v) => v.y));
          const 最下 = Math.max(...初始位置.按下时顶点坐标组.map((v) => v.y));
          形状中心 = {
            x: (最左 + 最右) / 2,
            y: (最上 + 最下) / 2,
          };
        }
      }

      if (!形状中心) return;

      // 围绕锚点旋转形状中心点
      const 旋转后的中心 = this.旋转坐标(形状中心, 锚点, 旋转弧度);

      // 计算中心点的偏移量
      const 中心偏移量 = {
        x: 旋转后的中心.x - 形状中心.x,
        y: 旋转后的中心.y - 形状中心.y,
      };

      // 根据形状类型应用旋转
      if (形状.形状 === "矩形" || 形状.形状 === "图像" || 形状.形状 === "箭头") {
        const 初始旋转弧度 = 初始位置.按下时旋转弧度 !== undefined ? 初始位置.按下时旋转弧度 : 0;

        if (初始位置.按下时顶点坐标组 && 初始位置.按下时顶点坐标组.length > 0) {
          const 初始顶点组 = 初始位置.按下时顶点坐标组;
          const 初始最左 = Math.min(...初始顶点组.map((v) => v.x));
          const 初始最右 = Math.max(...初始顶点组.map((v) => v.x));
          const 初始最上 = Math.min(...初始顶点组.map((v) => v.y));
          const 初始最下 = Math.max(...初始顶点组.map((v) => v.y));
          const 初始中心 = {
            x: (初始最左 + 初始最右) / 2,
            y: (初始最上 + 初始最下) / 2,
          };

          // 对于矩形和图像，使用局部坐标系
          if (形状.形状 === "矩形" || 形状.形状 === "图像") {
            // 先更新旋转弧度（局部坐标系）
            形状.旋转弧度 = 初始旋转弧度 + 旋转弧度;
            // 标准化旋转弧度到 [0, 2π) 范围
            while (形状.旋转弧度 > Math.PI * 2) {
              形状.旋转弧度 -= Math.PI * 2;
            }
            while (形状.旋转弧度 < 0) {
              形状.旋转弧度 += Math.PI * 2;
            }

            // 从初始顶点计算未旋转的尺寸
            let 未旋转尺寸 = { 宽: 0, 高: 0 };
            if (初始旋转弧度 !== 0) {
              const 未旋转顶点组 = 初始顶点组.map((顶点) => this.旋转坐标(顶点, 初始中心, -初始旋转弧度));
              const 未旋转最左 = Math.min(...未旋转顶点组.map((v) => v.x));
              const 未旋转最右 = Math.max(...未旋转顶点组.map((v) => v.x));
              const 未旋转最上 = Math.min(...未旋转顶点组.map((v) => v.y));
              const 未旋转最下 = Math.max(...未旋转顶点组.map((v) => v.y));
              未旋转尺寸.宽 = 未旋转最右 - 未旋转最左;
              未旋转尺寸.高 = 未旋转最下 - 未旋转最上;
            } else {
              未旋转尺寸.宽 = 初始最右 - 初始最左;
              未旋转尺寸.高 = 初始最下 - 初始最上;
            }

            // 基于旋转后的中心和旋转弧度生成顶点坐标组
            const cos = Math.cos(形状.旋转弧度);
            const sin = Math.sin(形状.旋转弧度);
            const 半宽 = 未旋转尺寸.宽 / 2;
            const 半高 = 未旋转尺寸.高 / 2;

            const 局部角点组 = [
              { x: -半宽, y: -半高 },
              { x: 半宽, y: -半高 },
              { x: 半宽, y: 半高 },
              { x: -半宽, y: 半高 },
            ];

            形状.顶点坐标组 = 局部角点组.map((局部角点) => ({
              x: 旋转后的中心.x + 局部角点.x * cos - 局部角点.y * sin,
              y: 旋转后的中心.y + 局部角点.x * sin + 局部角点.y * cos,
            }));
          } else if (形状.形状 === "箭头") {
            // 箭头：使用局部坐标系
            const 初始起点 = 初始位置.按下时顶点坐标组[0];
            const 初始终点 = 初始位置.按下时顶点坐标组[1];
            const 初始线段中心 = {
              x: (初始起点.x + 初始终点.x) / 2,
              y: (初始起点.y + 初始终点.y) / 2,
            };

            let 未旋转长度 = 0;
            let 未旋转方向 = 0;
            if (初始旋转弧度 !== 0) {
              const 未旋转起点 = this.旋转坐标(初始起点, 初始线段中心, -初始旋转弧度);
              const 未旋转终点 = this.旋转坐标(初始终点, 初始线段中心, -初始旋转弧度);
              const dx = 未旋转终点.x - 未旋转起点.x;
              const dy = 未旋转终点.y - 未旋转起点.y;
              未旋转长度 = Math.sqrt(dx * dx + dy * dy);
              未旋转方向 = Math.atan2(dy, dx);
            } else {
              const dx = 初始终点.x - 初始起点.x;
              const dy = 初始终点.y - 初始起点.y;
              未旋转长度 = Math.sqrt(dx * dx + dy * dy);
              未旋转方向 = Math.atan2(dy, dx);
            }

            // 更新旋转弧度
            形状.旋转弧度 = 初始旋转弧度 + 旋转弧度;
            while (形状.旋转弧度 > Math.PI * 2) {
              形状.旋转弧度 -= Math.PI * 2;
            }
            while (形状.旋转弧度 < 0) {
              形状.旋转弧度 += Math.PI * 2;
            }

            // 计算新方向
            const 新方向 = 未旋转方向 + 形状.旋转弧度;
            let 标准化方向 = 新方向;
            while (标准化方向 > Math.PI * 2) {
              标准化方向 -= Math.PI * 2;
            }
            while (标准化方向 < 0) {
              标准化方向 += Math.PI * 2;
            }

            const 半长度 = 未旋转长度 / 2;
            const 新起点 = {
              x: 旋转后的中心.x - 半长度 * Math.cos(标准化方向),
              y: 旋转后的中心.y - 半长度 * Math.sin(标准化方向),
            };
            const 新终点 = {
              x: 旋转后的中心.x + 半长度 * Math.cos(标准化方向),
              y: 旋转后的中心.y + 半长度 * Math.sin(标准化方向),
            };

            形状.起点 = 新起点;
            形状.终点 = 新终点;
            形状.顶点坐标组 = this.计算箭头顶点坐标组(新起点, 新终点);
          }

          // 更新极值坐标
          形状.极值坐标 = this.获取极值坐标(形状);

          // 对于图像，更新坐标和中心
          if (形状.形状 === "图像") {
            形状.坐标.x = 形状.顶点坐标组[0].x;
            形状.坐标.y = 形状.顶点坐标组[0].y;
            形状.极值坐标 = this.获取极值坐标(形状);
            形状.中心 = 形状.极值坐标.中心;
          }
        }
      } else if (形状.形状 === "文本") {
        // 旋转文本的坐标点（文本的坐标是文本块的左边缘和垂直中心）
        // 由于文本中心需要加上宽度的一半，我们需要计算正确的坐标
        const 文本中心x = 初始位置.按下时坐标.x + 形状.尺寸.宽 / 2;
        const 文本中心y = 初始位置.按下时坐标.y;
        const 文本中心 = { x: 文本中心x, y: 文本中心y };
        const 旋转后的文本中心 = this.旋转坐标(文本中心, 锚点, 旋转弧度);

        // 更新文本坐标（左边缘和垂直中心）
        形状.坐标.x = 旋转后的文本中心.x - 形状.尺寸.宽 / 2;
        形状.坐标.y = 旋转后的文本中心.y;

        // 形状自身也要旋转
        const 初始旋转弧度 = 初始位置.按下时旋转弧度 !== undefined ? 初始位置.按下时旋转弧度 : 0;
        形状.旋转弧度 = 初始旋转弧度 + 旋转弧度;
        while (形状.旋转弧度 > Math.PI * 2) {
          形状.旋转弧度 -= Math.PI * 2;
        }
        while (形状.旋转弧度 < 0) {
          形状.旋转弧度 += Math.PI * 2;
        }

        // 更新文本形状（重新计算顶点和极值坐标）
        this.更新文本形状(形状);
      } else if (形状.形状 === "圆") {
        // 旋转圆的中心点
        形状.坐标.x = 旋转后的中心.x;
        形状.坐标.y = 旋转后的中心.y;

        // 形状自身也要旋转
        const 初始旋转弧度 = 初始位置.按下时旋转弧度 !== undefined ? 初始位置.按下时旋转弧度 : 0;
        形状.旋转弧度 = 初始旋转弧度 + 旋转弧度;
        while (形状.旋转弧度 > Math.PI * 2) {
          形状.旋转弧度 -= Math.PI * 2;
        }
        while (形状.旋转弧度 < 0) {
          形状.旋转弧度 += Math.PI * 2;
        }

        // 重新计算顶点坐标组
        if (形状.边数 !== undefined) {
          形状.顶点坐标组 = this.获取多边形顶点坐标组(
            形状.坐标.x,
            形状.坐标.y,
            形状.尺寸.水平半径,
            形状.尺寸.垂直半径,
            形状.边数,
            形状.起始弧度 || 0,
            形状.旋转弧度 || 0
          );
        }

        形状.极值坐标 = this.获取极值坐标(形状);
      } else if (形状.形状 === "多边形" || 形状.形状 === "多角星") {
        // 旋转多边形/多角星的中心点
        形状.坐标.x = 旋转后的中心.x;
        形状.坐标.y = 旋转后的中心.y;

        // 形状自身也要旋转
        const 初始旋转弧度 = 初始位置.按下时旋转弧度 !== undefined ? 初始位置.按下时旋转弧度 : 0;
        形状.旋转弧度 = 初始旋转弧度 + 旋转弧度;
        while (形状.旋转弧度 > Math.PI * 2) {
          形状.旋转弧度 -= Math.PI * 2;
        }
        while (形状.旋转弧度 < 0) {
          形状.旋转弧度 += Math.PI * 2;
        }

        // 重新计算顶点坐标组
        if (形状.形状 === "多边形") {
          形状.顶点坐标组 = this.获取多边形顶点坐标组(
            形状.坐标.x,
            形状.坐标.y,
            形状.尺寸.水平半径,
            形状.尺寸.垂直半径,
            形状.边数,
            形状.起始弧度,
            形状.旋转弧度 || 0
          );
        } else if (形状.形状 === "多角星") {
          形状.外顶点坐标组 = this.获取多边形顶点坐标组(
            形状.坐标.x,
            形状.坐标.y,
            形状.尺寸.外半径.水平,
            形状.尺寸.外半径.垂直,
            形状.边数,
            形状.起始弧度,
            形状.旋转弧度 || 0
          );
          形状.内顶点坐标组 = this.获取多边形顶点坐标组(
            形状.坐标.x,
            形状.坐标.y,
            形状.尺寸.内半径.水平,
            形状.尺寸.内半径.垂直,
            形状.边数,
            形状.起始弧度 + Math.PI / 形状.边数,
            形状.旋转弧度 || 0
          );
        }

        形状.极值坐标 = this.获取极值坐标(形状);
      } else if (形状.形状 === "直线" || 形状.形状 === "自由") {
        // 旋转所有顶点
        const cos = Math.cos(旋转弧度);
        const sin = Math.sin(旋转弧度);
        形状.顶点坐标组 = 初始位置.按下时顶点坐标组.map((顶点) => {
          const dx = 顶点.x - 形状中心.x;
          const dy = 顶点.y - 形状中心.y;
          const 旋转后的顶点相对于中心 = {
            x: dx * cos - dy * sin,
            y: dx * sin + dy * cos,
          };
          return {
            x: 旋转后的中心.x + 旋转后的顶点相对于中心.x,
            y: 旋转后的中心.y + 旋转后的顶点相对于中心.y,
          };
        });

        形状.极值坐标 = this.获取极值坐标(形状);
      }

      // 更新路径
      this.更新路径(形状);
    });

    // 保存整体旋转状态（用于撤销，在应用旋转之前保存）
    let 整体旋转状态 = null;
    if (是编组) {
      const 组ID = this.全局属性.多选形状组[0].所属组ID;
      const 操作前的旋转弧度 = this.全局属性.编组旋转弧度映射[组ID] || 0;
      整体旋转状态 = {
        是编组: true,
        组ID: 组ID,
        之前的旋转弧度: 操作前的旋转弧度,
        之前的边界: this.全局属性.编组旋转边界映射[组ID] ? structuredClone(this.全局属性.编组旋转边界映射[组ID]) : null,
      };
    } else {
      const 多选标识 = this.全局属性.多选形状组
        .map((形状) => this.数据集.基础形状对象组.indexOf(形状))
        .sort()
        .join(",");
      const 操作前的旋转弧度 = this.全局属性.多选旋转弧度映射[多选标识] || 0;
      整体旋转状态 = {
        是编组: false,
        多选标识: 多选标识,
        之前的旋转弧度: 操作前的旋转弧度,
        之前的边界: this.全局属性.多选旋转边界映射[多选标识]
          ? structuredClone(this.全局属性.多选旋转边界映射[多选标识])
          : null,
      };
    }

    // 保存整体旋转状态（应用旋转）
    if (是编组) {
      const 组ID = this.全局属性.多选形状组[0].所属组ID;
      const 之前的旋转弧度 = this.全局属性.编组旋转弧度映射[组ID] || 0;
      let 新旋转弧度 = 之前的旋转弧度 + 旋转弧度;
      while (新旋转弧度 > Math.PI * 2) {
        新旋转弧度 -= Math.PI * 2;
      }
      while (新旋转弧度 < 0) {
        新旋转弧度 += Math.PI * 2;
      }
      this.全局属性.编组旋转弧度映射[组ID] = 新旋转弧度;

      // 保存编组的未旋转边界（如果还没有保存的话）
      if (!this.全局属性.编组旋转边界映射[组ID]) {
        this.全局属性.编组旋转边界映射[组ID] = structuredClone(初始边界);
      }
    } else {
      const 多选标识 = this.全局属性.多选形状组
        .map((形状) => this.数据集.基础形状对象组.indexOf(形状))
        .sort()
        .join(",");
      const 之前的旋转弧度 = this.全局属性.多选旋转弧度映射[多选标识] || 0;
      let 新旋转弧度 = 之前的旋转弧度 + 旋转弧度;
      while (新旋转弧度 > Math.PI * 2) {
        新旋转弧度 -= Math.PI * 2;
      }
      while (新旋转弧度 < 0) {
        新旋转弧度 += Math.PI * 2;
      }
      this.全局属性.多选旋转弧度映射[多选标识] = 新旋转弧度;

      // 保存多选的未旋转边界（如果还没有保存的话）
      if (!this.全局属性.多选旋转边界映射[多选标识]) {
        this.全局属性.多选旋转边界映射[多选标识] = structuredClone(初始边界);
      }
    }

    // 清空画布并重新绘制
    this.清空画布();
    this.绘制基础形状对象组();

    // 记录操作以便撤销
    this.数据集.操作记录.push({
      操作类型: 顺时针 ? "顺时针旋转90度多个形状" : "逆时针旋转90度多个形状",
      旋转操作数组: 旋转操作数组,
      整体旋转状态: 整体旋转状态,
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

    // 对于箭头，恢复起点和终点
    if (形状.形状 === "箭头") {
      if (变换前数据.起点) {
        形状.起点 = { ...变换前数据.起点 };
      }
      if (变换前数据.终点) {
        形状.终点 = { ...变换前数据.终点 };
      }
    }

    // 恢复缩放比例（用于文本形状的翻转）
    if (变换前数据.缩放比例) {
      形状.缩放比例 = { ...变换前数据.缩放比例 };
    } else if (形状.形状 === "文本") {
      // 如果没有保存的缩放比例，但形状是文本，则重置为默认值
      形状.缩放比例 = { x: 1, y: 1 };
    }

    // 对于文本形状，需要重新更新形状数据
    if (形状.形状 === "文本") {
      this.更新文本形状(形状);
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
        // 删除单个选中的形状
        if (this.全局标志.按钮音效) {
          this.辅助.清空音效.currentTime = 0;
          this.辅助.清空音效.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.删除形状(this.全局属性.选中形状);
      } else if (this.全局属性.多选形状组.length > 0) {
        // 删除多选的所有形状
        if (this.全局标志.按钮音效) {
          this.辅助.清空音效.currentTime = 0;
          this.辅助.清空音效.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.删除多选形状();
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
      } else if (this.全局属性.多选形状组 && this.全局属性.多选形状组.length > 0) {
        // 多选或编组时，整体水平翻转
        if (this.全局标志.按钮音效) {
          this.辅助.点击音效对象.currentTime = 0;
          this.辅助.点击音效对象.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.翻转多选形状(true, false);
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
      } else if (this.全局属性.多选形状组 && this.全局属性.多选形状组.length > 0) {
        // 多选或编组时，整体垂直翻转
        if (this.全局标志.按钮音效) {
          this.辅助.点击音效对象.currentTime = 0;
          this.辅助.点击音效对象.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.翻转多选形状(false, true);
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
      } else if (this.全局属性.多选形状组 && this.全局属性.多选形状组.length > 0) {
        // 多选或编组时，整体旋转90度
        if (this.全局标志.按钮音效) {
          this.辅助.点击音效对象.currentTime = 0;
          this.辅助.点击音效对象.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.旋转多选形状90度(true);
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
      } else if (this.全局属性.多选形状组 && this.全局属性.多选形状组.length > 0) {
        // 多选或编组时，整体旋转90度
        if (this.全局标志.按钮音效) {
          this.辅助.点击音效对象.currentTime = 0;
          this.辅助.点击音效对象.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.旋转多选形状90度(false);
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
      } else if (this.全局属性.多选形状组.length > 0) {
        // 多选状态下的复制：复制组或多个形状
        if (this.全局标志.按钮音效) {
          this.辅助.点击音效对象.currentTime = 0;
          this.辅助.点击音效对象.play().catch((e) => {
            console.log("按钮音效播放失败:", e);
          });
        }
        this.复制组(this.全局属性.多选形状组);
      }
    });
  }

  添加编组按钮点击事件() {
    this.图形组合按钮组.编组.addEventListener("change", (e) => {
      const 已选中 = e.target.checked;

      if (this.全局标志.按钮音效) {
        this.辅助.点击音效对象.currentTime = 0;
        this.辅助.点击音效对象.play().catch((err) => {
          console.log("按钮音效播放失败:", err);
        });
      }

      if (已选中) {
        // 编组：如果多选形状数量>=2，则编组
        if (this.全局属性.多选形状组.length >= 2) {
          this.执行编组();
        }
      } else {
        // 取消编组：如果当前多选组是已编组的组，则取消编组
        this.执行取消编组();
      }
    });
  }

  添加对齐和分布按钮点击事件() {
    // 水平居中对齐
    this.图形组合按钮组.水平居中对齐.addEventListener("click", () => {
      if (this.全局属性.多选形状组.length < 2) return;

      if (this.全局标志.按钮音效) {
        this.辅助.点击音效对象.currentTime = 0;
        this.辅助.点击音效对象.play().catch((err) => {
          console.log("按钮音效播放失败:", err);
        });
      }

      this.执行水平居中对齐();
    });

    // 垂直居中对齐
    this.图形组合按钮组.垂直居中对齐.addEventListener("click", () => {
      if (this.全局属性.多选形状组.length < 2) return;

      if (this.全局标志.按钮音效) {
        this.辅助.点击音效对象.currentTime = 0;
        this.辅助.点击音效对象.play().catch((err) => {
          console.log("按钮音效播放失败:", err);
        });
      }

      this.执行垂直居中对齐();
    });

    // 水平均匀分布
    this.图形组合按钮组.水平均匀分布.addEventListener("click", () => {
      if (this.全局属性.多选形状组.length < 3) return;

      if (this.全局标志.按钮音效) {
        this.辅助.点击音效对象.currentTime = 0;
        this.辅助.点击音效对象.play().catch((err) => {
          console.log("按钮音效播放失败:", err);
        });
      }

      this.执行水平均匀分布();
    });

    // 垂直均匀分布
    this.图形组合按钮组.垂直均匀分布.addEventListener("click", () => {
      if (this.全局属性.多选形状组.length < 3) return;

      if (this.全局标志.按钮音效) {
        this.辅助.点击音效对象.currentTime = 0;
        this.辅助.点击音效对象.play().catch((err) => {
          console.log("按钮音效播放失败:", err);
        });
      }

      this.执行垂直均匀分布();
    });
  }

  // 执行编组操作
  执行编组() {
    if (this.全局属性.多选形状组.length < 2) return;

    // 检查是否已经编组（多选组内所有形状属于同一个组）
    const 第一个形状 = this.全局属性.多选形状组[0];
    const 已编组 =
      第一个形状.所属组ID !== undefined &&
      this.全局属性.多选形状组.every((形状) => 形状.所属组ID === 第一个形状.所属组ID);

    if (已编组) {
      // 已经编组，不需要重复编组
      return;
    }

    // 创建新组
    const 组ID = this.创建组([...this.全局属性.多选形状组]);

    // 记录操作以便撤销
    this.数据集.操作记录.push({
      操作类型: "编组",
      组ID: 组ID,
      形状数组: [...this.全局属性.多选形状组],
    });

    // 更新按钮状态
    this.根据选中形状索引修改处理按钮状态();

    // 重新绘制
    this.清空画布();
    this.绘制基础形状对象组();

    // 启用撤销按钮
    this.撤销按钮.classList.remove("禁用");
  }

  // 执行取消编组操作
  执行取消编组() {
    // 检查多选组已编组
    if (this.全局属性.多选形状组.length === 0) return;

    const 第一个形状 = this.全局属性.多选形状组[0];
    const 组ID = 第一个形状.所属组ID;

    if (!组ID || !this.数据集.形状组[组ID]) return;

    // 检查多选组内所有形状是否属于同一个组
    const 在同一组 = this.全局属性.多选形状组.every((形状) => 形状.所属组ID === 组ID);
    if (!在同一组) return;

    // 保存组的完整信息（包括多选组外的形状）以便撤销
    const 组内所有形状 = [...this.数据集.形状组[组ID]];

    // 删除组
    this.删除组(组ID);

    // 记录操作以便撤销
    this.数据集.操作记录.push({
      操作类型: "取消编组",
      组ID: 组ID,
      形状数组: 组内所有形状,
    });

    // 更新按钮状态
    this.根据选中形状索引修改处理按钮状态();

    // 重新绘制
    this.清空画布();
    this.绘制基础形状对象组();

    // 启用撤销按钮
    this.撤销按钮.classList.remove("禁用");
  }

  // ========== 对齐和分布相关函数 ==========

  // 保存形状的完整状态（用于撤销）
  保存形状状态(形状) {
    if (!形状) return null;

    // 深拷贝坐标
    const 坐标 = structuredClone(形状.坐标);

    // 深拷贝顶点坐标组
    let 顶点坐标组 = null;
    if (形状.顶点坐标组 && 形状.顶点坐标组.length > 0) {
      顶点坐标组 = 形状.顶点坐标组.map((顶点) => ({ x: 顶点.x, y: 顶点.y }));
    }

    // 深拷贝外顶点坐标组（多角星）
    let 外顶点坐标组 = null;
    if (形状.外顶点坐标组 && 形状.外顶点坐标组.length > 0) {
      外顶点坐标组 = 形状.外顶点坐标组.map((顶点) => ({ x: 顶点.x, y: 顶点.y }));
    }

    // 深拷贝内顶点坐标组（多角星）
    let 内顶点坐标组 = null;
    if (形状.内顶点坐标组 && 形状.内顶点坐标组.length > 0) {
      内顶点坐标组 = 形状.内顶点坐标组.map((顶点) => ({ x: 顶点.x, y: 顶点.y }));
    }

    // 深拷贝中心（图像）
    let 中心 = null;
    if (形状.中心) {
      中心 = { x: 形状.中心.x, y: 形状.中心.y };
    }

    // 深拷贝起点和终点（箭头）
    let 起点 = null;
    let 终点 = null;
    if (形状.形状 === "箭头") {
      if (形状.起点) {
        起点 = { x: 形状.起点.x, y: 形状.起点.y };
      }
      if (形状.终点) {
        终点 = { x: 形状.终点.x, y: 形状.终点.y };
      }
    }

    return {
      形状: 形状,
      坐标: 坐标,
      顶点坐标组: 顶点坐标组,
      外顶点坐标组: 外顶点坐标组,
      内顶点坐标组: 内顶点坐标组,
      中心: 中心,
      起点: 起点,
      终点: 终点,
    };
  }

  // 恢复形状的完整状态（用于撤销）
  恢复形状状态(形状, 状态) {
    if (!形状 || !状态) return;

    // 恢复坐标
    if (状态.坐标) {
      形状.坐标.x = 状态.坐标.x;
      形状.坐标.y = 状态.坐标.y;
    }

    // 恢复中心（图像）
    if (状态.中心 && 形状.形状 === "图像") {
      形状.中心.x = 状态.中心.x;
      形状.中心.y = 状态.中心.y;
    }

    // 恢复起点和终点（箭头）
    if (状态.起点 && 状态.终点 && 形状.形状 === "箭头") {
      形状.起点 = { x: 状态.起点.x, y: 状态.起点.y };
      形状.终点 = { x: 状态.终点.x, y: 状态.终点.y };
    }

    // 根据形状类型决定是恢复顶点还是重新计算
    if (
      形状.形状 === "矩形" ||
      形状.形状 === "直线" ||
      形状.形状 === "自由" ||
      形状.形状 === "箭头" ||
      形状.形状 === "图像"
    ) {
      // 对于基于顶点的形状，直接恢复顶点坐标组
      if (状态.顶点坐标组) {
        形状.顶点坐标组 = 状态.顶点坐标组.map((坐标) => ({ x: 坐标.x, y: 坐标.y }));
      }
    } else if (形状.形状 === "多边形" && 形状.边数 !== undefined) {
      // 对于多边形，恢复坐标后重新计算顶点坐标组
      if (状态.坐标) {
        形状.顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.水平半径,
          形状.尺寸.垂直半径,
          形状.边数,
          形状.起始弧度,
          形状.旋转弧度 || 0
        );
      }
    } else if (形状.形状 === "多角星" && 形状.边数 !== undefined) {
      // 对于多角星，恢复坐标后重新计算外顶点和内顶点坐标组
      if (状态.坐标) {
        形状.外顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.外半径.水平,
          形状.尺寸.外半径.垂直,
          形状.边数,
          形状.起始弧度,
          形状.旋转弧度 || 0
        );
        形状.内顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.内半径.水平,
          形状.尺寸.内半径.垂直,
          形状.边数,
          形状.起始弧度 + Math.PI / 形状.边数,
          形状.旋转弧度 || 0
        );
      }
    } else if (形状.形状 === "圆") {
      // 对于圆形，如果边数不为undefined，需要重新计算顶点坐标组
      if (状态.坐标 && 形状.边数 !== undefined) {
        形状.顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.水平半径,
          形状.尺寸.垂直半径,
          形状.边数,
          形状.起始弧度,
          形状.旋转弧度 || 0
        );
      }
    }

    // 对于文本，更新文本形状
    if (形状.形状 === "文本") {
      this.更新文本形状(形状);
    }

    // 对于箭头，更新起点和终点
    if (形状.形状 === "箭头" && 状态.起点 && 状态.终点) {
      this.更新箭头起点终点(形状);
    }

    // 更新极值坐标和路径
    形状.极值坐标 = this.获取极值坐标(形状);
    // 对于图像和文本，更新中心坐标
    if (形状.形状 === "图像" || 形状.形状 === "文本") {
      形状.中心 = 形状.极值坐标.中心;
    }
    this.更新路径(形状);
  }

  // 移动形状到新位置（用于对齐和分布）
  移动形状到新位置(形状, 目标中心X, 目标中心Y) {
    if (!形状) return;

    // 获取形状的当前中心点
    let 极值 = 形状.极值坐标;
    if (!极值) {
      极值 = this.获取极值坐标(形状);
    }
    const 当前中心X = 极值.中心.x;
    const 当前中心Y = 极值.中心.y;

    // 计算偏移量
    const 偏移量X = 目标中心X - 当前中心X;
    const 偏移量Y = 目标中心Y - 当前中心Y;

    // 根据形状类型移动
    if (形状.形状 === "文本") {
      // 文本：移动坐标
      形状.坐标.x += 偏移量X;
      形状.坐标.y += 偏移量Y;
      // 重新计算顶点坐标组
      this.更新文本形状(形状);
    } else if (形状.形状 === "圆") {
      // 圆形：移动坐标
      形状.坐标.x += 偏移量X;
      形状.坐标.y += 偏移量Y;
      // 重新计算顶点坐标组（如果需要）
      if (形状.边数 !== undefined) {
        形状.顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.水平半径,
          形状.尺寸.垂直半径,
          形状.边数,
          形状.起始弧度,
          形状.旋转弧度 || 0
        );
      }
    } else if (形状.形状 === "多边形") {
      // 多边形：移动坐标
      形状.坐标.x += 偏移量X;
      形状.坐标.y += 偏移量Y;
      // 重新计算顶点坐标组
      if (形状.边数 !== undefined) {
        形状.顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.水平半径,
          形状.尺寸.垂直半径,
          形状.边数,
          形状.起始弧度,
          形状.旋转弧度 || 0
        );
      }
    } else if (形状.形状 === "多角星") {
      // 多角星：移动坐标
      形状.坐标.x += 偏移量X;
      形状.坐标.y += 偏移量Y;
      // 重新计算外顶点和内顶点坐标组
      if (形状.边数 !== undefined) {
        形状.外顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.外半径.水平,
          形状.尺寸.外半径.垂直,
          形状.边数,
          形状.起始弧度,
          形状.旋转弧度 || 0
        );
        形状.内顶点坐标组 = this.获取多边形顶点坐标组(
          形状.坐标.x,
          形状.坐标.y,
          形状.尺寸.内半径.水平,
          形状.尺寸.内半径.垂直,
          形状.边数,
          形状.起始弧度 + Math.PI / 形状.边数,
          形状.旋转弧度 || 0
        );
      }
    } else if (形状.形状 === "矩形" || 形状.形状 === "直线" || 形状.形状 === "自由" || 形状.形状 === "箭头") {
      // 基于顶点的形状：移动所有顶点
      if (形状.顶点坐标组 && 形状.顶点坐标组.length > 0) {
        形状.顶点坐标组.forEach((顶点) => {
          顶点.x += 偏移量X;
          顶点.y += 偏移量Y;
        });
      }
      // 对于箭头，更新起点和终点
      if (形状.形状 === "箭头" && 形状.顶点坐标组.length >= 2) {
        形状.起点 = { ...形状.顶点坐标组[0] };
        形状.终点 = { ...形状.顶点坐标组[1] };
        this.更新箭头起点终点(形状);
      }
    } else if (形状.形状 === "图像") {
      // 图像：移动所有顶点、坐标和中心
      if (形状.顶点坐标组 && 形状.顶点坐标组.length > 0) {
        形状.顶点坐标组.forEach((顶点) => {
          顶点.x += 偏移量X;
          顶点.y += 偏移量Y;
        });
      }
      形状.坐标.x += 偏移量X;
      形状.坐标.y += 偏移量Y;
      if (形状.中心) {
        形状.中心.x += 偏移量X;
        形状.中心.y += 偏移量Y;
      }
    }

    // 更新极值坐标和路径
    形状.极值坐标 = this.获取极值坐标(形状);
    // 对于图像和文本，更新中心坐标
    if (形状.形状 === "图像" || 形状.形状 === "文本") {
      形状.中心 = 形状.极值坐标.中心;
    }
    this.更新路径(形状);
  }

  // 执行水平居中对齐
  执行水平居中对齐() {
    if (this.全局属性.多选形状组.length < 2) return;

    // 记录所有形状的初始状态（用于撤销）
    const 对齐前状态组 = this.全局属性.多选形状组.map((形状) => {
      return this.保存形状状态(形状);
    });

    // 计算所有形状的中心点，得到整体中心
    const 整体边界 = this.获取多选形状的边界();
    if (!整体边界) return;

    const 整体中心X = 整体边界.centerX;
    const 整体中心Y = 整体边界.centerY;

    // 将所有形状的中心点水平对齐到整体中心X
    this.全局属性.多选形状组.forEach((形状) => {
      let 极值 = 形状.极值坐标;
      if (!极值) {
        极值 = this.获取极值坐标(形状);
      }
      const 形状中心X = 极值.中心.x;
      const 形状中心Y = 极值.中心.y;

      // 移动形状，使其中心点的X坐标等于整体中心X
      this.移动形状到新位置(形状, 整体中心X, 形状中心Y);
    });

    // 记录操作以便撤销
    this.数据集.操作记录.push({
      操作类型: "水平居中对齐",
      对齐前状态组: 对齐前状态组,
    });

    // 重新绘制
    this.清空画布();
    this.绘制基础形状对象组();

    // 启用撤销按钮
    this.撤销按钮.classList.remove("禁用");
  }

  // 执行垂直居中对齐
  执行垂直居中对齐() {
    if (this.全局属性.多选形状组.length < 2) return;

    // 记录所有形状的初始状态（用于撤销）
    const 对齐前状态组 = this.全局属性.多选形状组.map((形状) => {
      return this.保存形状状态(形状);
    });

    // 计算所有形状的中心点，得到整体中心
    const 整体边界 = this.获取多选形状的边界();
    if (!整体边界) return;

    const 整体中心X = 整体边界.centerX;
    const 整体中心Y = 整体边界.centerY;

    // 将所有形状的中心点垂直对齐到整体中心Y
    this.全局属性.多选形状组.forEach((形状) => {
      let 极值 = 形状.极值坐标;
      if (!极值) {
        极值 = this.获取极值坐标(形状);
      }
      const 形状中心X = 极值.中心.x;
      const 形状中心Y = 极值.中心.y;

      // 移动形状，使其中心点的Y坐标等于整体中心Y
      this.移动形状到新位置(形状, 形状中心X, 整体中心Y);
    });

    // 记录操作以便撤销
    this.数据集.操作记录.push({
      操作类型: "垂直居中对齐",
      对齐前状态组: 对齐前状态组,
    });

    // 重新绘制
    this.清空画布();
    this.绘制基础形状对象组();

    // 启用撤销按钮
    this.撤销按钮.classList.remove("禁用");
  }

  // 执行水平均匀分布
  执行水平均匀分布() {
    if (this.全局属性.多选形状组.length < 3) return;

    // 记录所有形状的初始状态（用于撤销）
    const 分布前状态组 = this.全局属性.多选形状组.map((形状) => {
      return this.保存形状状态(形状);
    });

    // 获取所有形状的边界信息，按X坐标排序
    const 形状边界数组 = this.全局属性.多选形状组.map((形状) => {
      let 极值 = 形状.极值坐标;
      if (!极值) {
        极值 = this.获取极值坐标(形状);
      }
      return {
        形状: 形状,
        左边界: 极值.左,
        右边界: 极值.右,
        中心X: 极值.中心.x,
        中心Y: 极值.中心.y,
      };
    });

    // 按左边界排序
    形状边界数组.sort((a, b) => a.左边界 - b.左边界);

    // 第一个和最后一个形状保持不动
    const 第一个形状右边界 = 形状边界数组[0].右边界;
    const 最后一个形状左边界 = 形状边界数组[形状边界数组.length - 1].左边界;

    // 计算需要分布的中间形状数量（不包括第一个和最后一个）
    const 中间形状数量 = 形状边界数组.length - 2;
    if (中间形状数量 > 0) {
      // 计算总的可用空间（最后一个形状的左边界 - 第一个形状的右边界）
      const 总可用空间 = 最后一个形状左边界 - 第一个形状右边界;

      // 计算所有中间形状的总宽度（不包括第一个和最后一个）
      let 中间形状总宽度 = 0;
      for (let i = 1; i < 形状边界数组.length - 1; i++) {
        中间形状总宽度 += 形状边界数组[i].右边界 - 形状边界数组[i].左边界;
      }

      // 计算均匀分布的间距
      const 均匀间距 = (总可用空间 - 中间形状总宽度) / (中间形状数量 + 1);

      // 分布中间的形状
      let 当前累积位置 = 第一个形状右边界 + 均匀间距;
      for (let i = 1; i < 形状边界数组.length - 1; i++) {
        const 当前形状宽度 = 形状边界数组[i].右边界 - 形状边界数组[i].左边界;
        const 目标左边界 = 当前累积位置;
        const 目标中心X = 目标左边界 + 当前形状宽度 / 2;
        const 当前中心Y = 形状边界数组[i].中心Y;

        // 移动形状到新位置
        this.移动形状到新位置(形状边界数组[i].形状, 目标中心X, 当前中心Y);

        // 更新累积位置（当前位置 + 当前形状宽度 + 间距）
        当前累积位置 = 目标左边界 + 当前形状宽度 + 均匀间距;
      }
    }

    // 记录操作以便撤销
    this.数据集.操作记录.push({
      操作类型: "水平均匀分布",
      分布前状态组: 分布前状态组,
    });

    // 重新绘制
    this.清空画布();
    this.绘制基础形状对象组();

    // 启用撤销按钮
    this.撤销按钮.classList.remove("禁用");
  }

  // 执行垂直均匀分布
  执行垂直均匀分布() {
    if (this.全局属性.多选形状组.length < 3) return;

    // 记录所有形状的初始状态（用于撤销）
    const 分布前状态组 = this.全局属性.多选形状组.map((形状) => {
      return this.保存形状状态(形状);
    });

    // 获取所有形状的边界信息，按Y坐标排序
    const 形状边界数组 = this.全局属性.多选形状组.map((形状) => {
      let 极值 = 形状.极值坐标;
      if (!极值) {
        极值 = this.获取极值坐标(形状);
      }
      return {
        形状: 形状,
        上边界: 极值.上,
        下边界: 极值.下,
        中心X: 极值.中心.x,
        中心Y: 极值.中心.y,
      };
    });

    // 按上边界排序
    形状边界数组.sort((a, b) => a.上边界 - b.上边界);

    // 第一个和最后一个形状保持不动
    const 第一个形状下边界 = 形状边界数组[0].下边界;
    const 最后一个形状上边界 = 形状边界数组[形状边界数组.length - 1].上边界;

    // 计算需要分布的中间形状数量（不包括第一个和最后一个）
    const 中间形状数量 = 形状边界数组.length - 2;
    if (中间形状数量 > 0) {
      // 计算总的可用空间（最后一个形状的上边界 - 第一个形状的下边界）
      const 总可用空间 = 最后一个形状上边界 - 第一个形状下边界;

      // 计算所有中间形状的总高度（不包括第一个和最后一个）
      let 中间形状总高度 = 0;
      for (let i = 1; i < 形状边界数组.length - 1; i++) {
        中间形状总高度 += 形状边界数组[i].下边界 - 形状边界数组[i].上边界;
      }

      // 计算均匀分布的间距
      const 均匀间距 = (总可用空间 - 中间形状总高度) / (中间形状数量 + 1);

      // 分布中间的形状
      let 当前累积位置 = 第一个形状下边界 + 均匀间距;
      for (let i = 1; i < 形状边界数组.length - 1; i++) {
        const 当前形状高度 = 形状边界数组[i].下边界 - 形状边界数组[i].上边界;
        const 目标上边界 = 当前累积位置;
        const 目标中心Y = 目标上边界 + 当前形状高度 / 2;
        const 当前中心X = 形状边界数组[i].中心X;

        // 移动形状到新位置
        this.移动形状到新位置(形状边界数组[i].形状, 当前中心X, 目标中心Y);

        // 更新累积位置（当前位置 + 当前形状高度 + 间距）
        当前累积位置 = 目标上边界 + 当前形状高度 + 均匀间距;
      }
    }

    // 记录操作以便撤销
    this.数据集.操作记录.push({
      操作类型: "垂直均匀分布",
      分布前状态组: 分布前状态组,
    });

    // 重新绘制
    this.清空画布();
    this.绘制基础形状对象组();

    // 启用撤销按钮
    this.撤销按钮.classList.remove("禁用");
  }

  // ========== 对齐和分布相关函数结束 ==========

  位置与现有形状接近(目标中心X, 目标中心Y, 排除形状 = null) {
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
      const 重叠 = this.位置与现有形状接近(目标中心X, 目标中心Y, 形状);

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
    } else if (形状.形状 === "文本") {
      // 对于文本形状，偏移坐标并重新计算顶点坐标组
      新形状.坐标 = {
        x: 形状.坐标.x + 水平偏移,
        y: 形状.坐标.y + 垂直偏移,
      };
      // 重新计算顶点坐标组和极值坐标
      this.更新文本形状(新形状);
    } else if (形状.形状 === "矩形" || 形状.形状 === "直线" || 形状.形状 === "自由" || 形状.形状 === "箭头") {
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

  // 复制组（多个形状）
  复制组(形状对象数组, 偏移量 = null) {
    if (!形状对象数组 || 形状对象数组.length === 0) return;

    // 计算组的整体边界（用于计算偏移）
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    形状对象数组.forEach((形状) => {
      let 极值 = 形状.极值坐标;
      if (!极值) {
        极值 = this.获取极值坐标(形状);
      }
      if (极值) {
        minX = Math.min(minX, 极值.左);
        minY = Math.min(minY, 极值.上);
        maxX = Math.max(maxX, 极值.右);
        maxY = Math.max(maxY, 极值.下);
      }
    });

    const 组宽度 = maxX - minX;
    const 组高度 = maxY - minY;
    const 组中心X = (minX + maxX) / 2;
    const 组中心Y = (minY + maxY) / 2;

    // 如果没有提供偏移量，计算默认偏移（用于按钮复制）
    let 水平偏移 = 0;
    let 垂直偏移 = 0;

    if (!偏移量) {
      // 使用和单个形状复制相同的逻辑
      const canvas宽度 = this.canvas.offsetWidth;
      const canvas高度 = this.canvas.offsetHeight;
      const 基础偏移 = 30;
      const 边界安全距离 = 10;

      let 水平方向 = 组中心X <= canvas宽度 / 2 ? 1 : -1;
      let 垂直方向 = 组中心Y <= canvas高度 / 2 ? 1 : -1;

      水平偏移 = 水平方向 * 基础偏移;
      垂直偏移 = 垂直方向 * 基础偏移;
      let 目标中心X = 组中心X + 水平偏移;
      let 目标中心Y = 组中心Y + 垂直偏移;

      const 最大搜索步数 = Math.ceil((Math.max(canvas宽度, canvas高度) * 2) / 基础偏移);
      let 已走步数 = 0;

      while (已走步数 < 最大搜索步数) {
        const 新组左边界 = 目标中心X - 组宽度 / 2;
        const 新组右边界 = 目标中心X + 组宽度 / 2;
        const 新组上边界 = 目标中心Y - 组高度 / 2;
        const 新组下边界 = 目标中心Y + 组高度 / 2;

        const 越左 = 新组左边界 < 边界安全距离;
        const 越右 = 新组右边界 > canvas宽度 - 边界安全距离;
        const 越上 = 新组上边界 < 边界安全距离;
        const 越下 = 新组下边界 > canvas高度 - 边界安全距离;

        const 溢出 = 越左 || 越右 || 越上 || 越下;

        if (!溢出) {
          // 检查是否有形状重叠（简化检查，只检查中心点）
          const 重叠 = 形状对象数组.some((形状) => {
            let 极值 = 形状.极值坐标;
            if (!极值) {
              极值 = this.获取极值坐标(形状);
            }
            const 形状中心X = 极值.中心.x + 水平偏移;
            const 形状中心Y = 极值.中心.y + 垂直偏移;
            // 排除原形状，只检查与其他形状的重叠
            return this.数据集.基础形状对象组.some((现有形状) => {
              if (形状对象数组.includes(现有形状)) return false; // 排除原组内的形状
              let 现有极值 = 现有形状.极值坐标;
              if (!现有极值) {
                现有极值 = this.获取极值坐标(现有形状);
              }
              const dx = 形状中心X - 现有极值.中心.x;
              const dy = 形状中心Y - 现有极值.中心.y;
              const 距离 = Math.sqrt(dx * dx + dy * dy);
              return 距离 < 20; // 最小距离
            });
          });

          if (!重叠) break;
        }

        if (越左) 水平方向 = 1;
        if (越右) 水平方向 = -1;
        if (越上) 垂直方向 = 1;
        if (越下) 垂直方向 = -1;

        水平偏移 += 水平方向 * 基础偏移;
        垂直偏移 += 垂直方向 * 基础偏移;
        目标中心X = 组中心X + 水平偏移;
        目标中心Y = 组中心Y + 垂直偏移;

        已走步数++;
      }
    } else {
      // 使用提供的偏移量（用于Alt+拖拽复制）
      水平偏移 = 偏移量.x;
      垂直偏移 = 偏移量.y;
    }

    // 复制所有形状并应用偏移
    const 新形状数组 = [];
    const 起始索引 = this.数据集.基础形状对象组.length;

    形状对象数组.forEach((形状, 索引) => {
      // 克隆形状（使用和单个形状复制相同的逻辑）
      let 新形状;

      if (形状.形状 === "图像") {
        新形状 = {
          形状: 形状.形状,
          图像对象: 形状.图像对象,
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
        const path = 形状.路径;
        形状.路径 = null;
        新形状 = structuredClone(形状);
        形状.路径 = path;
        新形状.路径 = null;
        新形状.已选中 = false;
        新形状.已悬停 = false;
      }

      // 应用偏移（和单个形状复制相同的逻辑）
      if (新形状.形状 === "圆") {
        新形状.坐标 = {
          x: 形状.坐标.x + 水平偏移,
          y: 形状.坐标.y + 垂直偏移,
        };
      } else if (新形状.形状 === "多边形") {
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
      } else if (新形状.形状 === "多角星") {
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
      } else if (新形状.形状 === "文本") {
        新形状.坐标 = {
          x: 形状.坐标.x + 水平偏移,
          y: 形状.坐标.y + 垂直偏移,
        };
        this.更新文本形状(新形状);
      } else if (新形状.形状 === "矩形" || 新形状.形状 === "直线" || 新形状.形状 === "自由" || 新形状.形状 === "箭头") {
        新形状.顶点坐标组 = 形状.顶点坐标组.map((坐标) => ({
          x: 坐标.x + 水平偏移,
          y: 坐标.y + 垂直偏移,
        }));
      } else if (新形状.形状 === "图像") {
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

      // 清除新形状的所有预览和选中状态，确保不会绘制预览交互框
      新形状.已选中 = false;
      新形状.已悬停 = false;
      新形状.已多选 = false;
      新形状.Alt预览中 = false;
      新形状.框选预览中 = false;

      // 添加到形状组
      this.数据集.基础形状对象组.push(新形状);
      新形状数组.push(新形状);
    });

    // 检查原组已编组：如果多选组内所有形状属于同一个组，则新形状也编成一组
    const 第一个原形状 = 形状对象数组[0];
    let 新组ID = null;

    if (第一个原形状 && 第一个原形状.所属组ID !== undefined) {
      // 检查所有形状是否属于同一个组
      const 在同一组 = 形状对象数组.every((形状) => 形状.所属组ID === 第一个原形状.所属组ID);

      if (在同一组) {
        // 原组已编组，新形状也编成一组
        新组ID = this.创建组(新形状数组);
      }
      // 否则不编组
    }
    // 如果原组未编组，新形状也不编组

    // 记录操作以便撤销
    this.数据集.操作记录.push({
      操作类型: "复制组",
      原形状数组: [...形状对象数组],
      新形状索引数组: 新形状数组.map((形状, 索引) => 起始索引 + 索引),
      新组ID: 新组ID, // 如果未编组则为null
    });

    // 重新绘制
    this.清空画布();
    this.绘制基础形状对象组();

    // 启用撤销按钮
    this.撤销按钮.classList.remove("禁用");

    return 新形状数组;
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

    // 安全检查：如果操作记录为空，直接返回（虽然前面有检查，但为安全起见再次检查）
    if (!最后操作) {
      return;
    }

    if (最后操作.操作类型 === "添加基础形状") {
      if (!this.当前形状对象.形状 || this.当前形状对象.顶点坐标组.length <= 0) {
        if (最后形状.形状 === "直线") {
          最后形状.顶点坐标组.pop();
          if (最后形状.顶点坐标组.length <= 1) {
            // 检查被删除的形状是否在多选组中
            if (最后形状.已多选) {
              this.从多选组移除(最后形状);
            }

            this.数据集.基础形状对象组.pop();
            this.数据集.操作记录.pop();

            // 如果撤销后多选组只剩一个形状，转换为单选模式
            if (this.全局属性.多选形状组.length === 1) {
              const 单个形状 = this.全局属性.多选形状组[0];
              this.清空多选组();
              this.全局属性.选中形状 = 单个形状;
              单个形状.已选中 = true;
              this.更新描边宽度滑块(单个形状);
              this.应用选中形状的颜色到拾色器(单个形状);
            }

            // 更新按钮状态（包括编组按钮）
            this.根据选中形状索引修改处理按钮状态();
          } else {
            this.更新路径(最后形状);
          }
          this.全局属性.选中形状 = null;
          this.恢复用户全局颜色到拾色器();
          this.清空画布();
          this.绘制基础形状对象组();
          if (this.数据集.操作记录.length <= 0) {
            this.撤销按钮.classList.add("禁用");
          }
          return;
        } else {
          // 检查被删除的形状是否在多选组中
          if (最后形状.已多选) {
            this.从多选组移除(最后形状);
          }

          if (最后形状 === this.全局属性.选中形状) {
            this.全局属性.选中形状 = null;
            this.恢复用户全局颜色到拾色器();
            this.重置当前形状对象();
          }
          this.数据集.基础形状对象组.pop();
        }

        // 如果撤销后多选组只剩一个形状，转换为单选模式
        if (this.全局属性.多选形状组.length === 1) {
          const 单个形状 = this.全局属性.多选形状组[0];
          this.清空多选组();
          this.全局属性.选中形状 = 单个形状;
          单个形状.已选中 = true;
          this.更新描边宽度滑块(单个形状);
          this.应用选中形状的颜色到拾色器(单个形状);
        }

        if (this.数据集.基础形状对象组.length <= 1) {
          this.图层处理按钮组.向上一层.parentElement.classList.add("禁用");
          this.图层处理按钮组.向下一层.parentElement.classList.add("禁用");
          this.图层处理按钮组.置于底层.parentElement.classList.add("禁用");
          this.图层处理按钮组.置于顶层.parentElement.classList.add("禁用");
        }

        // 更新按钮状态（包括编组按钮）
        this.根据选中形状索引修改处理按钮状态();

        // 重新绘制以更新交互框
        this.清空画布();
        this.绘制基础形状对象组();
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
    } else if (最后操作.操作类型 === "删除多个形状") {
      // 恢复多个被删除的形状（按删除顺序反向恢复）
      if (最后操作.删除操作数组 && 最后操作.删除操作数组.length > 0) {
        最后操作.删除操作数组.forEach((删除操作) => {
          this.数据集.基础形状对象组.splice(删除操作.操作数据, 0, 删除操作.被删除形状对象);
          删除操作.被删除形状对象.已悬停 = false;
          删除操作.被删除形状对象.已选中 = false;
        });

        // 恢复编组信息（如果存在）
        if (最后操作.编组信息 && Object.keys(最后操作.编组信息).length > 0) {
          Object.entries(最后操作.编组信息).forEach(([组ID, 组内形状数组]) => {
            // 检查组内的形状是否都已经恢复（都在基础形状对象组中）
            const 已恢复的形状 = 组内形状数组.filter((形状) => this.数据集.基础形状对象组.includes(形状));

            // 只有当组内所有形状都已恢复时，才恢复编组
            if (已恢复的形状.length === 组内形状数组.length && 已恢复的形状.length >= 2) {
              // 恢复组
              this.数据集.形状组[组ID] = [...已恢复的形状];
              // 恢复每个形状的所属组ID
              已恢复的形状.forEach((形状) => {
                形状.所属组ID = 组ID;
              });
            }
          });
        }

        // 清空多选组
        this.清空多选组();

        // 清除选中状态
        this.全局属性.选中形状 = null;
        this.恢复用户全局颜色到拾色器();

        // 检测悬停状态
        const 悬停形状 = this.鼠标位于形状内();
        if (悬停形状) {
          悬停形状.已悬停 = true;
        }
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
        } else if (最后操作.形状.形状 === "文本") {
          // 文本形状需要重新计算顶点坐标组
          this.更新文本形状(最后操作.形状);
        }
        this.更新路径(最后操作.形状);
      } else if (最后操作.顶点坐标组) {
        最后操作.形状.顶点坐标组 = [...最后操作.顶点坐标组];
        // 对于图像，还需要更新坐标和中心
        if (最后操作.形状.形状 === "图像") {
          最后操作.形状.坐标.x = 最后操作.形状.顶点坐标组[0].x;
          最后操作.形状.坐标.y = 最后操作.形状.顶点坐标组[0].y;
        }
        // 对于箭头，还需要更新起点和终点
        if (最后操作.形状.形状 === "箭头") {
          this.更新箭头起点终点(最后操作.形状);
        }
        this.更新路径(最后操作.形状);
      }
      if (
        最后操作.形状.形状 === "圆" ||
        最后操作.形状.形状 === "文本" ||
        最后操作.形状.形状 === "多边形" ||
        最后操作.形状.形状 === "多角星" ||
        最后操作.形状.形状 === "直线" ||
        最后操作.形状.形状 === "自由" ||
        最后操作.形状.形状 === "矩形" ||
        最后操作.形状.形状 === "图像" ||
        最后操作.形状.形状 === "箭头"
      ) {
        最后操作.形状.极值坐标 = this.获取极值坐标(最后操作.形状);
        // 对于图像，更新中心坐标
        if (最后操作.形状.形状 === "图像") {
          最后操作.形状.中心 = 最后操作.形状.极值坐标.中心;
        }
      }
    } else if (最后操作.操作类型 === "移动多个形状") {
      // 撤销移动多个形状操作：恢复所有形状的原始位置
      if (最后操作.移动操作数组 && 最后操作.移动操作数组.length > 0) {
        最后操作.移动操作数组.forEach((移动操作) => {
          const 形状 = 移动操作.形状;

          if (移动操作.坐标) {
            // 使用坐标恢复
            形状.坐标 = 移动操作.坐标;
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
            } else if (形状.形状 === "文本") {
              // 文本形状需要重新计算顶点坐标组
              this.更新文本形状(形状);
            }
            this.更新路径(形状);
          } else if (移动操作.顶点坐标组) {
            // 使用顶点坐标组恢复
            形状.顶点坐标组 = [...移动操作.顶点坐标组];
            // 对于图像，还需要更新坐标和中心
            if (形状.形状 === "图像") {
              形状.坐标.x = 形状.顶点坐标组[0].x;
              形状.坐标.y = 形状.顶点坐标组[0].y;
            }
            // 对于矩形，也需要更新坐标（矩形的坐标是左上角顶点）
            if (形状.形状 === "矩形") {
              形状.坐标.x = 形状.顶点坐标组[0].x;
              形状.坐标.y = 形状.顶点坐标组[0].y;
            }
            // 对于箭头，还需要更新起点和终点
            if (形状.形状 === "箭头") {
              this.更新箭头起点终点(形状);
            }
            this.更新路径(形状);
          }

          // 更新极值坐标
          if (
            形状.形状 === "圆" ||
            形状.形状 === "文本" ||
            形状.形状 === "多边形" ||
            形状.形状 === "多角星" ||
            形状.形状 === "直线" ||
            形状.形状 === "自由" ||
            形状.形状 === "矩形" ||
            形状.形状 === "图像" ||
            形状.形状 === "箭头"
          ) {
            形状.极值坐标 = this.获取极值坐标(形状);
            // 对于图像，更新中心坐标
            if (形状.形状 === "图像") {
              形状.中心 = 形状.极值坐标.中心;
            }
            // 对于文本，更新中心坐标
            if (形状.形状 === "文本") {
              形状.中心 = 形状.极值坐标.中心;
            }
          }
        });

        // 如果多选组中还有这些形状，保持多选状态
        // 清空画布并重新绘制
        this.清空画布();
        this.绘制基础形状对象组();
      }
    } else if (最后操作.操作类型 === "旋转") {
      const 形状 = 最后操作.形状;
      const 旋转前数据 = 最后操作.旋转前数据;

      if (形状.形状 === "圆" || 形状.形状 === "文本") {
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
      } else if (
        形状.形状 === "矩形" ||
        形状.形状 === "图像" ||
        形状.形状 === "直线" ||
        形状.形状 === "自由" ||
        形状.形状 === "箭头"
      ) {
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
        // 对于箭头，更新起点和终点
        if (形状.形状 === "箭头") {
          this.更新箭头起点终点(形状);
        }
      }
      this.更新路径(形状);
    } else if (最后操作.操作类型 === "缩放") {
      this.撤销缩放(最后操作);
    } else if (最后操作.操作类型 === "旋转多个形状") {
      // 撤销旋转多个形状操作：恢复所有形状的初始状态
      const 旋转操作数组 = 最后操作.旋转操作数组;

      if (旋转操作数组 && 旋转操作数组.length > 0) {
        旋转操作数组.forEach((旋转操作) => {
          const 形状 = 旋转操作.形状;

          // 根据形状类型恢复不同的属性
          if (形状.形状 === "圆" || 形状.形状 === "多边形" || 形状.形状 === "多角星") {
            // 恢复坐标和旋转弧度
            if (旋转操作.坐标) {
              形状.坐标.x = 旋转操作.坐标.x;
              形状.坐标.y = 旋转操作.坐标.y;
            }
            if (旋转操作.旋转弧度 !== undefined) {
              形状.旋转弧度 = 旋转操作.旋转弧度;
            }

            // 重新计算顶点坐标组
            if (形状.形状 === "圆") {
              形状.顶点坐标组 = this.获取多边形顶点坐标组(
                形状.坐标.x,
                形状.坐标.y,
                形状.尺寸.水平半径,
                形状.尺寸.垂直半径,
                8,
                0,
                形状.旋转弧度 || 0
              );
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
            } else if (形状.形状 === "多角星") {
              形状.外顶点坐标组 = this.获取多边形顶点坐标组(
                形状.坐标.x,
                形状.坐标.y,
                形状.尺寸.外半径.水平,
                形状.尺寸.外半径.垂直,
                形状.边数,
                形状.起始弧度,
                形状.旋转弧度 || 0
              );
              形状.内顶点坐标组 = this.获取多边形顶点坐标组(
                形状.坐标.x,
                形状.坐标.y,
                形状.尺寸.内半径.水平,
                形状.尺寸.内半径.垂直,
                形状.边数,
                形状.起始弧度 + Math.PI / 形状.边数,
                形状.旋转弧度 || 0
              );
            }

            形状.极值坐标 = this.获取极值坐标(形状);
          } else if (形状.形状 === "文本") {
            // 恢复坐标和旋转弧度
            if (旋转操作.坐标) {
              形状.坐标.x = 旋转操作.坐标.x;
              形状.坐标.y = 旋转操作.坐标.y;
            }
            if (旋转操作.旋转弧度 !== undefined) {
              形状.旋转弧度 = 旋转操作.旋转弧度;
            }

            // 如果有顶点坐标组，恢复顶点坐标组
            if (旋转操作.顶点坐标组 && 旋转操作.顶点坐标组.length > 0) {
              形状.顶点坐标组 = 旋转操作.顶点坐标组.map((坐标) => ({ ...坐标 }));
            }

            // 更新文本形状
            this.更新文本形状(形状);
            形状.极值坐标 = this.获取极值坐标(形状);
            形状.中心 = 形状.极值坐标.中心;
          } else if (
            形状.形状 === "直线" ||
            形状.形状 === "自由" ||
            形状.形状 === "矩形" ||
            形状.形状 === "图像" ||
            形状.形状 === "箭头"
          ) {
            // 恢复顶点坐标组和旋转弧度
            if (旋转操作.顶点坐标组 && 旋转操作.顶点坐标组.length > 0) {
              形状.顶点坐标组 = 旋转操作.顶点坐标组.map((坐标) => ({ ...坐标 }));
            }
            if (旋转操作.旋转弧度 !== undefined) {
              形状.旋转弧度 = 旋转操作.旋转弧度;
            }

            // 对于图像，更新坐标和中心
            if (形状.形状 === "图像") {
              形状.坐标.x = 形状.顶点坐标组[0].x;
              形状.坐标.y = 形状.顶点坐标组[0].y;
              形状.极值坐标 = this.获取极值坐标(形状);
              形状.中心 = 形状.极值坐标.中心;
            }

            // 对于箭头，更新起点和终点
            if (形状.形状 === "箭头") {
              this.更新箭头起点终点(形状);
            }

            形状.极值坐标 = this.获取极值坐标(形状);
          }

          // 更新路径
          this.更新路径(形状);
        });

        // 恢复整体旋转状态（用于恢复整体交互框的旋转）
        if (最后操作.整体旋转状态) {
          const 整体旋转状态 = 最后操作.整体旋转状态;

          if (整体旋转状态.是编组) {
            // 恢复编组的旋转状态
            const 组ID = 整体旋转状态.组ID;
            if (整体旋转状态.之前的旋转弧度 !== undefined) {
              this.全局属性.编组旋转弧度映射[组ID] = 整体旋转状态.之前的旋转弧度;
            }
            if (整体旋转状态.之前的边界) {
              this.全局属性.编组旋转边界映射[组ID] = structuredClone(整体旋转状态.之前的边界);
            } else if (this.全局属性.编组旋转边界映射[组ID]) {
              // 如果没有之前的边界，但有当前的边界，删除当前的边界（表示回到未旋转状态）
              delete this.全局属性.编组旋转边界映射[组ID];
            }
          } else {
            // 恢复多选的旋转状态
            const 多选标识 = 整体旋转状态.多选标识;
            if (多选标识) {
              if (整体旋转状态.之前的旋转弧度 !== undefined) {
                this.全局属性.多选旋转弧度映射[多选标识] = 整体旋转状态.之前的旋转弧度;
              }
              if (整体旋转状态.之前的边界) {
                this.全局属性.多选旋转边界映射[多选标识] = structuredClone(整体旋转状态.之前的边界);
              } else if (this.全局属性.多选旋转边界映射[多选标识]) {
                // 如果没有之前的边界，但有当前的边界，删除当前的边界（表示回到未旋转状态）
                delete this.全局属性.多选旋转边界映射[多选标识];
              }
            }
          }
        }

        // 如果多选组中还有这些形状，保持多选状态
        // 清空画布并重新绘制
        this.清空画布();
        this.绘制基础形状对象组();
      }
    } else if (最后操作.操作类型 === "顺时针旋转90度多个形状" || 最后操作.操作类型 === "逆时针旋转90度多个形状") {
      // 撤销多选/编组旋转90度操作
      const 旋转操作数组 = 最后操作.旋转操作数组;

      if (旋转操作数组 && 旋转操作数组.length > 0) {
        旋转操作数组.forEach((旋转操作) => {
          const 形状 = 旋转操作.形状;

          // 根据形状类型恢复不同的属性
          if (形状.形状 === "圆" || 形状.形状 === "多边形" || 形状.形状 === "多角星") {
            if (旋转操作.坐标) {
              形状.坐标.x = 旋转操作.坐标.x;
              形状.坐标.y = 旋转操作.坐标.y;
            }
            if (旋转操作.旋转弧度 !== undefined) {
              形状.旋转弧度 = 旋转操作.旋转弧度;
            }

            // 重新计算顶点坐标组
            if (形状.形状 === "圆") {
              形状.顶点坐标组 = this.获取多边形顶点坐标组(
                形状.坐标.x,
                形状.坐标.y,
                形状.尺寸.水平半径,
                形状.尺寸.垂直半径,
                8,
                0,
                形状.旋转弧度 || 0
              );
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
            } else if (形状.形状 === "多角星") {
              形状.外顶点坐标组 = this.获取多边形顶点坐标组(
                形状.坐标.x,
                形状.坐标.y,
                形状.尺寸.外半径.水平,
                形状.尺寸.外半径.垂直,
                形状.边数,
                形状.起始弧度,
                形状.旋转弧度 || 0
              );
              形状.内顶点坐标组 = this.获取多边形顶点坐标组(
                形状.坐标.x,
                形状.坐标.y,
                形状.尺寸.内半径.水平,
                形状.尺寸.内半径.垂直,
                形状.边数,
                形状.起始弧度 + Math.PI / 形状.边数,
                形状.旋转弧度 || 0
              );
            }

            形状.极值坐标 = this.获取极值坐标(形状);
          } else if (形状.形状 === "文本") {
            if (旋转操作.坐标) {
              形状.坐标.x = 旋转操作.坐标.x;
              形状.坐标.y = 旋转操作.坐标.y;
            }
            if (旋转操作.旋转弧度 !== undefined) {
              形状.旋转弧度 = 旋转操作.旋转弧度;
            }

            if (旋转操作.顶点坐标组 && 旋转操作.顶点坐标组.length > 0) {
              形状.顶点坐标组 = 旋转操作.顶点坐标组.map((坐标) => ({ ...坐标 }));
            }

            this.更新文本形状(形状);
            形状.极值坐标 = this.获取极值坐标(形状);
            形状.中心 = 形状.极值坐标.中心;
          } else if (
            形状.形状 === "直线" ||
            形状.形状 === "自由" ||
            形状.形状 === "矩形" ||
            形状.形状 === "图像" ||
            形状.形状 === "箭头"
          ) {
            if (旋转操作.顶点坐标组 && 旋转操作.顶点坐标组.length > 0) {
              形状.顶点坐标组 = 旋转操作.顶点坐标组.map((坐标) => ({ ...坐标 }));
            }
            if (旋转操作.旋转弧度 !== undefined) {
              形状.旋转弧度 = 旋转操作.旋转弧度;
            }

            if (形状.形状 === "图像") {
              形状.坐标.x = 形状.顶点坐标组[0].x;
              形状.坐标.y = 形状.顶点坐标组[0].y;
              形状.极值坐标 = this.获取极值坐标(形状);
              形状.中心 = 形状.极值坐标.中心;
            }

            if (形状.形状 === "箭头") {
              this.更新箭头起点终点(形状);
            }

            形状.极值坐标 = this.获取极值坐标(形状);
          }

          this.更新路径(形状);
        });

        // 恢复整体旋转状态
        if (最后操作.整体旋转状态) {
          const 整体旋转状态 = 最后操作.整体旋转状态;

          if (整体旋转状态.是编组) {
            const 组ID = 整体旋转状态.组ID;
            if (整体旋转状态.之前的旋转弧度 !== undefined) {
              this.全局属性.编组旋转弧度映射[组ID] = 整体旋转状态.之前的旋转弧度;
            }
            if (整体旋转状态.之前的边界) {
              this.全局属性.编组旋转边界映射[组ID] = structuredClone(整体旋转状态.之前的边界);
            } else if (this.全局属性.编组旋转边界映射[组ID]) {
              delete this.全局属性.编组旋转边界映射[组ID];
            }
          } else {
            const 多选标识 = 整体旋转状态.多选标识;
            if (多选标识) {
              if (整体旋转状态.之前的旋转弧度 !== undefined) {
                this.全局属性.多选旋转弧度映射[多选标识] = 整体旋转状态.之前的旋转弧度;
              }
              if (整体旋转状态.之前的边界) {
                this.全局属性.多选旋转边界映射[多选标识] = structuredClone(整体旋转状态.之前的边界);
              } else if (this.全局属性.多选旋转边界映射[多选标识]) {
                delete this.全局属性.多选旋转边界映射[多选标识];
              }
            }
          }
        }

        // 清空画布并重新绘制
        this.清空画布();
        this.绘制基础形状对象组();
      }
    } else if (最后操作.操作类型 === "缩放多个形状") {
      // 撤销缩放多个形状操作：恢复所有形状的初始状态
      const 缩放操作数组 = 最后操作.缩放操作数组;

      if (缩放操作数组 && 缩放操作数组.length > 0) {
        缩放操作数组.forEach((缩放操作) => {
          const 形状 = 缩放操作.形状;

          // 根据形状类型恢复不同的属性
          if (形状.形状 === "圆" || 形状.形状 === "多边形" || 形状.形状 === "多角星") {
            // 恢复坐标
            if (缩放操作.坐标) {
              形状.坐标.x = 缩放操作.坐标.x;
              形状.坐标.y = 缩放操作.坐标.y;
            }
            // 恢复尺寸
            if (缩放操作.尺寸) {
              if (形状.形状 === "圆" || 形状.形状 === "多边形") {
                形状.尺寸.水平半径 = 缩放操作.尺寸.水平半径;
                形状.尺寸.垂直半径 = 缩放操作.尺寸.垂直半径;
              } else if (形状.形状 === "多角星") {
                形状.尺寸.外半径.水平 = 缩放操作.尺寸.外半径.水平;
                形状.尺寸.外半径.垂直 = 缩放操作.尺寸.外半径.垂直;
                形状.尺寸.内半径.水平 = 缩放操作.尺寸.内半径.水平;
                形状.尺寸.内半径.垂直 = 缩放操作.尺寸.内半径.垂直;
              }
            }
            // 恢复旋转弧度
            if (缩放操作.旋转弧度 !== undefined) {
              形状.旋转弧度 = 缩放操作.旋转弧度;
            }

            // 重新计算顶点坐标组
            if (形状.形状 === "多边形") {
              形状.顶点坐标组 = this.获取多边形顶点坐标组(
                形状.坐标.x,
                形状.坐标.y,
                形状.尺寸.水平半径,
                形状.尺寸.垂直半径,
                形状.边数,
                形状.起始弧度,
                形状.旋转弧度 || 0
              );
            } else if (形状.形状 === "多角星") {
              形状.外顶点坐标组 = this.获取多边形顶点坐标组(
                形状.坐标.x,
                形状.坐标.y,
                形状.尺寸.外半径.水平,
                形状.尺寸.外半径.垂直,
                形状.边数,
                形状.起始弧度,
                形状.旋转弧度 || 0
              );
              形状.内顶点坐标组 = this.获取多边形顶点坐标组(
                形状.坐标.x,
                形状.坐标.y,
                形状.尺寸.内半径.水平,
                形状.尺寸.内半径.垂直,
                形状.边数,
                形状.起始弧度 + Math.PI / 形状.边数,
                形状.旋转弧度 || 0
              );
            }

            // 更新极值坐标
            形状.极值坐标 = this.获取极值坐标(形状);
          } else if (形状.形状 === "文本") {
            // 恢复文本的字号
            if (缩放操作.字号 !== undefined) {
              形状.字号 = 缩放操作.字号;
            }
            // 恢复文本的坐标
            if (缩放操作.坐标) {
              形状.坐标.x = 缩放操作.坐标.x;
              形状.坐标.y = 缩放操作.坐标.y;
            }
            // 恢复旋转弧度
            if (缩放操作.旋转弧度 !== undefined) {
              形状.旋转弧度 = 缩放操作.旋转弧度;
            }
            // 恢复顶点坐标组
            if (缩放操作.顶点坐标组) {
              形状.顶点坐标组 = 缩放操作.顶点坐标组.map((坐标) => ({ ...坐标 }));
            }
            // 根据恢复的字号重新计算文本尺寸
            this.更新文本形状(形状);
          } else if (
            形状.形状 === "直线" ||
            形状.形状 === "自由" ||
            形状.形状 === "矩形" ||
            形状.形状 === "图像" ||
            形状.形状 === "箭头"
          ) {
            // 恢复顶点坐标组
            if (缩放操作.顶点坐标组) {
              形状.顶点坐标组 = 缩放操作.顶点坐标组.map((坐标) => ({ ...坐标 }));
            }
            // 恢复旋转弧度
            if (缩放操作.旋转弧度 !== undefined && (形状.形状 === "矩形" || 形状.形状 === "箭头")) {
              形状.旋转弧度 = 缩放操作.旋转弧度;
            }
            // 更新极值坐标
            形状.极值坐标 = this.获取极值坐标(形状);

            // 对于箭头，更新起点和终点
            if (形状.形状 === "箭头" && 形状.顶点坐标组.length >= 2) {
              形状.起点 = { ...形状.顶点坐标组[0] };
              形状.终点 = { ...形状.顶点坐标组[1] };
              this.更新箭头起点终点(形状);
            }

            // 对于图像，更新坐标和中心
            if (形状.形状 === "图像" && 形状.顶点坐标组.length >= 4) {
              形状.坐标.x = 形状.顶点坐标组[0].x;
              形状.坐标.y = 形状.顶点坐标组[0].y;
              形状.尺寸.宽 = Math.sqrt(
                Math.pow(形状.顶点坐标组[1].x - 形状.顶点坐标组[0].x, 2) +
                  Math.pow(形状.顶点坐标组[1].y - 形状.顶点坐标组[0].y, 2)
              );
              形状.尺寸.高 = Math.sqrt(
                Math.pow(形状.顶点坐标组[3].x - 形状.顶点坐标组[0].x, 2) +
                  Math.pow(形状.顶点坐标组[3].y - 形状.顶点坐标组[0].y, 2)
              );
              形状.中心 = 形状.极值坐标.中心;
            }
          }

          // 更新路径
          this.更新路径(形状);
        });
      }

      // 重新绘制
      this.清空画布();
      this.绘制基础形状对象组();
    } else if (
      最后操作.操作类型 === "水平翻转" ||
      最后操作.操作类型 === "垂直翻转" ||
      最后操作.操作类型 === "顺时针旋转90度" ||
      最后操作.操作类型 === "逆时针旋转90度"
    ) {
      this.撤销变换(最后操作);
    } else if (
      最后操作.操作类型 === "水平翻转多个形状" ||
      最后操作.操作类型 === "垂直翻转多个形状" ||
      最后操作.操作类型 === "水平垂直翻转多个形状"
    ) {
      // 撤销多选/编组翻转操作
      const 翻转操作数组 = 最后操作.翻转操作数组;

      if (翻转操作数组 && 翻转操作数组.length > 0) {
        翻转操作数组.forEach((翻转操作) => {
          const 形状 = 翻转操作.形状;
          const 变换前数据 = 翻转操作.变换前数据;

          // 恢复坐标
          if (变换前数据.坐标) {
            形状.坐标.x = 变换前数据.坐标.x;
            形状.坐标.y = 变换前数据.坐标.y;
          }

          // 恢复旋转弧度
          if (变换前数据.旋转弧度 !== undefined) {
            形状.旋转弧度 = 变换前数据.旋转弧度;
          }

          // 恢复起始弧度
          if (变换前数据.起始弧度 !== undefined) {
            形状.起始弧度 = 变换前数据.起始弧度;
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

          // 恢复起点和终点（箭头）
          if (变换前数据.起点) {
            形状.起点 = { ...变换前数据.起点 };
          }
          if (变换前数据.终点) {
            形状.终点 = { ...变换前数据.终点 };
          }

          // 恢复缩放比例（用于文本形状的翻转）
          if (变换前数据.缩放比例) {
            形状.缩放比例 = { ...变换前数据.缩放比例 };
          } else if (形状.形状 === "文本") {
            // 如果没有保存的缩放比例，但形状是文本，则重置为默认值
            形状.缩放比例 = { x: 1, y: 1 };
          }

          // 根据形状类型重新计算顶点坐标组
          if (形状.形状 === "圆") {
            if (形状.边数 !== undefined) {
              形状.顶点坐标组 = this.获取多边形顶点坐标组(
                形状.坐标.x,
                形状.坐标.y,
                形状.尺寸.水平半径,
                形状.尺寸.垂直半径,
                8,
                0,
                形状.旋转弧度 || 0
              );
            }
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
          } else if (形状.形状 === "多角星") {
            形状.外顶点坐标组 = this.获取多边形顶点坐标组(
              形状.坐标.x,
              形状.坐标.y,
              形状.尺寸.外半径.水平,
              形状.尺寸.外半径.垂直,
              形状.边数,
              形状.起始弧度,
              形状.旋转弧度 || 0
            );
            形状.内顶点坐标组 = this.获取多边形顶点坐标组(
              形状.坐标.x,
              形状.坐标.y,
              形状.尺寸.内半径.水平,
              形状.尺寸.内半径.垂直,
              形状.边数,
              形状.起始弧度 + Math.PI / 形状.边数,
              形状.旋转弧度 || 0
            );
          } else if (形状.形状 === "文本") {
            // 更新文本形状
            this.更新文本形状(形状);
          } else if (形状.形状 === "箭头") {
            // 更新箭头起点和终点
            this.更新箭头起点终点(形状);
          }

          // 更新极值坐标和路径
          形状.极值坐标 = this.获取极值坐标(形状);

          // 对于图像，更新中心
          if (形状.形状 === "图像") {
            形状.中心 = 形状.极值坐标.中心;
          }

          this.更新路径(形状);
        });

        // 清空画布并重新绘制
        this.清空画布();
        this.绘制基础形状对象组();
      }
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
    } else if (最后操作.操作类型 === "复制组") {
      // 撤销复制组操作：删除所有复制的形状，如果复制了编组则删除编组
      const 新形状索引数组 = 最后操作.新形状索引数组;
      const 新组ID = 最后操作.新组ID;

      // 如果复制了编组，先删除编组
      if (新组ID && this.数据集.形状组[新组ID]) {
        // 清除组内所有形状的所属组ID
        const 组内形状 = this.数据集.形状组[新组ID];
        组内形状.forEach((形状) => {
          if (形状 && 形状.所属组ID === 新组ID) {
            形状.所属组ID = undefined;
          }
        });
        // 删除组
        delete this.数据集.形状组[新组ID];
      }

      // 按照索引从大到小的顺序删除形状，避免索引变化影响
      const 按索引降序排列 = [...新形状索引数组].sort((a, b) => b - a);
      for (const 形状索引 of 按索引降序排列) {
        // 检查索引是否有效
        if (形状索引 < 0 || 形状索引 >= this.数据集.基础形状对象组.length) {
          continue;
        }

        const 被复制形状 = this.数据集.基础形状对象组[形状索引];

        // 检查是否是多选形状
        if (被复制形状 && 被复制形状.已多选) {
          this.从多选组移除(被复制形状);
        }

        // 检查是否是选中形状
        if (被复制形状 === this.全局属性.选中形状) {
          this.全局属性.选中形状 = null;
          this.恢复用户全局颜色到拾色器();
          this.重置当前形状对象();
        }

        // 从基础形状对象组中删除
        this.数据集.基础形状对象组.splice(形状索引, 1);
      }

      // 更新按钮状态
      this.根据选中形状索引修改处理按钮状态();

      // 更新图层按钮状态
      if (this.数据集.基础形状对象组.length <= 1) {
        this.图层处理按钮组.向上一层.parentElement.classList.add("禁用");
        this.图层处理按钮组.向下一层.parentElement.classList.add("禁用");
        this.图层处理按钮组.置于底层.parentElement.classList.add("禁用");
        this.图层处理按钮组.置于顶层.parentElement.classList.add("禁用");
      }

      // 重新绘制
      this.清空画布();
      this.绘制基础形状对象组();
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
    } else if (最后操作.操作类型 === "编组") {
      // 撤销编组操作：删除组，恢复形状的所属组ID，并保持多选状态
      const 组ID = 最后操作.组ID;
      const 形状数组 = 最后操作.形状数组;

      if (组ID && this.数据集.形状组[组ID]) {
        // 清除每个形状的所属组ID
        const 组内形状 = this.数据集.形状组[组ID];
        组内形状.forEach((形状) => {
          if (形状.所属组ID === 组ID) {
            形状.所属组ID = undefined;
          }
        });
        // 删除组
        delete this.数据集.形状组[组ID];
      }

      // 如果形状数组存在，将这些形状添加到多选组，保持多选状态
      if (形状数组 && 形状数组.length >= 2) {
        // 先清空多选组（如果有其他多选）
        this.清空多选组();
        // 将撤销前的形状添加到多选组
        形状数组.forEach((形状) => {
          // 检查形状是否仍然存在（在基础形状对象组中）
          if (this.数据集.基础形状对象组.includes(形状)) {
            this.添加到多选组(形状);
          }
        });
      }

      // 更新按钮状态
      this.根据选中形状索引修改处理按钮状态();

      // 清空画布并重新绘制
      this.清空画布();
      this.绘制基础形状对象组();
    } else if (最后操作.操作类型 === "取消编组") {
      // 撤销取消编组操作：恢复组，恢复形状的所属组ID
      const 组ID = 最后操作.组ID;
      const 形状数组 = 最后操作.形状数组;

      if (组ID && 形状数组 && 形状数组.length >= 2) {
        // 检查组内的形状是否都存在（都在基础形状对象组中）
        const 有效的形状数组 = 形状数组.filter((形状) => this.数据集.基础形状对象组.includes(形状));

        // 只有当所有形状都存在时，才恢复编组
        if (有效的形状数组.length === 形状数组.length) {
          // 恢复组
          this.数据集.形状组[组ID] = [...有效的形状数组];
          // 恢复每个形状的所属组ID
          有效的形状数组.forEach((形状) => {
            形状.所属组ID = 组ID;
          });
        }
      }

      // 更新按钮状态
      this.根据选中形状索引修改处理按钮状态();

      // 清空画布并重新绘制
      this.清空画布();
      this.绘制基础形状对象组();
    } else if (
      最后操作.操作类型 === "水平居中对齐" ||
      最后操作.操作类型 === "垂直居中对齐" ||
      最后操作.操作类型 === "水平均匀分布" ||
      最后操作.操作类型 === "垂直均匀分布"
    ) {
      // 撤销对齐或分布操作：恢复所有形状的初始状态
      const 状态组 = 最后操作.对齐前状态组 || 最后操作.分布前状态组;

      if (状态组 && 状态组.length > 0) {
        状态组.forEach((状态) => {
          const 形状 = 状态.形状;
          if (!形状) return;

          // 使用统一的恢复函数
          this.恢复形状状态(形状, 状态);
        });
      }

      // 重新绘制
      this.清空画布();
      this.绘制基础形状对象组();
    } else if (最后操作.操作类型 === "合并编组") {
      // 撤销合并编组操作：恢复两个组
      const 目标组ID = 最后操作.目标组ID;
      const 源组ID = 最后操作.源组ID;
      const 操作前当前组形状 = 最后操作.操作前当前组形状;
      const 操作前源组形状 = 最后操作.操作前源组形状;

      if (目标组ID && 源组ID && 操作前当前组形状 && 操作前源组形状 && this.数据集.形状组[目标组ID]) {
        // 先将属于源组的形状的所属组ID清除
        const 源组形状数组 = 操作前源组形状;
        源组形状数组.forEach((源组形状) => {
          if (源组形状.所属组ID === 目标组ID) {
            源组形状.所属组ID = undefined;
          }
        });

        // 恢复目标组为操作前的状态
        const 有效的当前组形状 = 操作前当前组形状.filter((形状) => this.数据集.基础形状对象组.includes(形状));
        if (有效的当前组形状.length === 操作前当前组形状.length && 有效的当前组形状.length >= 2) {
          this.数据集.形状组[目标组ID] = [...有效的当前组形状];
          有效的当前组形状.forEach((形状) => {
            形状.所属组ID = 目标组ID;
          });

          // 清空多选组，然后将目标组的所有形状添加到多选组（这样整体交互框就只显示目标组）
          this.清空多选组();
          有效的当前组形状.forEach((形状) => {
            this.添加到多选组(形状);
          });
        } else {
          // 如果目标组变空了，删除组
          delete this.数据集.形状组[目标组ID];
          // 清空多选组
          this.清空多选组();
        }

        // 恢复源组的原始状态
        const 有效的源组形状 = 操作前源组形状.filter((形状) => this.数据集.基础形状对象组.includes(形状));
        if (有效的源组形状.length === 操作前源组形状.length && 有效的源组形状.length >= 2) {
          this.数据集.形状组[源组ID] = [...有效的源组形状];
          有效的源组形状.forEach((形状) => {
            形状.所属组ID = 源组ID;
          });
        }
      }

      // 更新按钮状态
      this.根据选中形状索引修改处理按钮状态();

      // 清空画布并重新绘制
      this.清空画布();
      this.绘制基础形状对象组();
    } else if (最后操作.操作类型 === "添加形状到编组") {
      // 撤销添加形状到编组操作：从组中移除该形状，恢复组的原始状态
      const 组ID = 最后操作.组ID;
      const 添加的形状 = 最后操作.添加的形状;
      const 操作前组形状 = 最后操作.操作前组形状;
      const 操作前选中形状 = 最后操作.操作前选中形状;
      const 操作前多选形状组 = 最后操作.操作前多选形状组;

      if (组ID && 添加的形状 && 操作前组形状 && this.数据集.形状组[组ID]) {
        // 从组中移除该形状
        const 组 = this.数据集.形状组[组ID];
        const 索引 = 组.indexOf(添加的形状);
        if (索引 !== -1) {
          组.splice(索引, 1);
        }

        // 清除形状的所属组ID
        if (添加的形状.所属组ID === 组ID) {
          添加的形状.所属组ID = undefined;
        }

        // 恢复组的原始状态
        const 有效的组形状 = 操作前组形状.filter((形状) => this.数据集.基础形状对象组.includes(形状));
        if (有效的组形状.length === 操作前组形状.length && 有效的组形状.length >= 2) {
          this.数据集.形状组[组ID] = [...有效的组形状];
          有效的组形状.forEach((形状) => {
            形状.所属组ID = 组ID;
          });
        } else {
          // 如果组变空了，删除组
          if (组.length === 0) {
            delete this.数据集.形状组[组ID];
          } else if (组.length < 2) {
            // 如果组内形状少于2个，取消编组
            const 组内形状 = [...this.数据集.形状组[组ID]];
            组内形状.forEach((形状) => {
              if (形状) {
                形状.所属组ID = undefined;
              }
            });
            delete this.数据集.形状组[组ID];
          }
        }

        // 恢复选中状态：如果有操作前的选中状态（未编组形状），恢复选中那些未编组形状；否则恢复选中编组
        this.清空多选组();
        if (this.全局属性.选中形状) {
          this.全局属性.选中形状.已选中 = false;
        }
        this.全局属性.选中形状 = null;

        // 检查是否有操作前的选中状态（未编组形状）
        if (操作前选中形状 && !this.形状已编组(操作前选中形状) && this.数据集.基础形状对象组.includes(操作前选中形状)) {
          // 恢复选中单个未编组形状
          this.全局属性.选中形状 = 操作前选中形状;
          操作前选中形状.已选中 = true;
          this.更新描边宽度滑块(操作前选中形状);
          this.应用选中形状的颜色到拾色器(操作前选中形状);
          this.删除按钮.classList.remove("禁用");
        } else if (操作前多选形状组 && 操作前多选形状组.length > 0) {
          // 检查操作前多选形状组中是否有未编组的形状
          const 有效的未编组形状 = 操作前多选形状组.filter(
            (形状) => this.数据集.基础形状对象组.includes(形状) && !形状.所属组ID
          );

          if (有效的未编组形状.length > 0) {
            // 恢复选中未编组的多选形状
            有效的未编组形状.forEach((形状) => {
              this.添加到多选组(形状);
            });

            if (有效的未编组形状.length === 1) {
              // 如果只有一个形状，转换为单选
              const 单个形状 = 有效的未编组形状[0];
              this.清空多选组();
              this.全局属性.选中形状 = 单个形状;
              单个形状.已选中 = true;
              this.更新描边宽度滑块(单个形状);
              this.应用选中形状的颜色到拾色器(单个形状);
              this.删除按钮.classList.remove("禁用");
            } else {
              // 如果有多选，更新删除按钮状态
              this.删除按钮.classList.remove("禁用");
            }
          } else if (有效的组形状.length === 操作前组形状.length && 有效的组形状.length >= 2) {
            // 如果没有未编组形状，恢复选中编组
            有效的组形状.forEach((形状) => {
              this.添加到多选组(形状);
            });
            this.删除按钮.classList.remove("禁用");
          }
        } else if (有效的组形状.length === 操作前组形状.length && 有效的组形状.length >= 2) {
          // 如果没有操作前的选中状态，恢复选中编组
          有效的组形状.forEach((形状) => {
            this.添加到多选组(形状);
          });
          this.删除按钮.classList.remove("禁用");
        } else {
          // 如果组变空了，清除选中状态
          this.删除按钮.classList.add("禁用");
          this.恢复用户全局颜色到拾色器();
        }
      }

      // 更新按钮状态
      this.根据选中形状索引修改处理按钮状态();

      // 清空画布并重新绘制
      this.清空画布();
      this.绘制基础形状对象组();
    } else if (最后操作.操作类型 === "双击添加文本并编组") {
      // 撤销双击添加文本并编组操作：先撤销编组，再删除文本形状
      const 文本形状 = 最后操作.文本形状;
      const 编组操作信息 = 最后操作.编组操作信息;

      // 第一步：撤销编组操作
      if (编组操作信息) {
        if (编组操作信息.操作类型 === "编组") {
          // 撤销编组：删除组，恢复形状的所属组ID
          const 组ID = 编组操作信息.组ID;
          const 形状数组 = 编组操作信息.形状数组;

          if (组ID && this.数据集.形状组[组ID]) {
            // 清除每个形状的所属组ID
            const 组内形状 = this.数据集.形状组[组ID];
            组内形状.forEach((形状) => {
              if (形状.所属组ID === 组ID) {
                形状.所属组ID = undefined;
              }
            });
            // 删除组
            delete this.数据集.形状组[组ID];
          }
        } else if (编组操作信息.操作类型 === "添加形状到编组") {
          // 撤销添加形状到编组：从组中移除该形状，恢复组的原始状态
          const 组ID = 编组操作信息.组ID;
          const 添加的形状 = 编组操作信息.添加的形状;
          const 操作前组形状 = 编组操作信息.操作前组形状;

          if (组ID && 添加的形状 && 操作前组形状 && this.数据集.形状组[组ID]) {
            // 从组中移除该形状
            const 组 = this.数据集.形状组[组ID];
            const 索引 = 组.indexOf(添加的形状);
            if (索引 !== -1) {
              组.splice(索引, 1);
            }

            // 清除形状的所属组ID
            if (添加的形状.所属组ID === 组ID) {
              添加的形状.所属组ID = undefined;
            }

            // 恢复组的原始状态
            const 有效的组形状 = 操作前组形状.filter((形状) => this.数据集.基础形状对象组.includes(形状));
            if (有效的组形状.length === 操作前组形状.length && 有效的组形状.length >= 2) {
              this.数据集.形状组[组ID] = [...有效的组形状];
              有效的组形状.forEach((形状) => {
                形状.所属组ID = 组ID;
              });
            } else {
              // 如果组变空了或少于2个形状，删除组
              if (组.length === 0 || 组.length < 2) {
                const 组内形状 = [...this.数据集.形状组[组ID]];
                组内形状.forEach((形状) => {
                  if (形状) {
                    形状.所属组ID = undefined;
                  }
                });
                delete this.数据集.形状组[组ID];
              }
            }
          }
        }
      }

      // 第二步：删除文本形状
      if (文本形状) {
        // 检查文本形状是否在多选组中
        if (文本形状.已多选) {
          this.从多选组移除(文本形状);
        }

        // 如果文本形状是选中形状，清除选中状态
        if (文本形状 === this.全局属性.选中形状) {
          this.全局属性.选中形状 = null;
        }

        // 从基础形状对象组中移除文本形状
        const 文本形状索引 = this.数据集.基础形状对象组.indexOf(文本形状);
        if (文本形状索引 !== -1) {
          this.数据集.基础形状对象组.splice(文本形状索引, 1);
        }
      }

      // 第三步：检查撤销后的状态并调整选中状态
      // 如果撤销后多选组只剩一个形状，转换为单选模式
      if (this.全局属性.多选形状组.length === 1) {
        const 单个形状 = this.全局属性.多选形状组[0];
        this.清空多选组();
        this.全局属性.选中形状 = 单个形状;
        单个形状.已选中 = true;
        this.更新描边宽度滑块(单个形状);
        this.应用选中形状的颜色到拾色器(单个形状);
      } else if (this.全局属性.多选形状组.length === 0) {
        // 如果多选组为空，清除选中状态
        if (this.全局属性.选中形状) {
          this.全局属性.选中形状.已选中 = false;
        }
        this.全局属性.选中形状 = null;
        this.恢复用户全局颜色到拾色器();
      }

      // 更新按钮状态
      this.根据选中形状索引修改处理按钮状态();

      // 清空画布并重新绘制
      this.清空画布();
      this.绘制基础形状对象组();
    } else if (最后操作.操作类型 === "从编组移除形状") {
      // 撤销从编组移除形状操作：恢复组的原始状态（包括移除的形状）
      const 组ID = 最后操作.组ID;
      const 操作前组形状 = 最后操作.操作前组形状;

      if (组ID && 操作前组形状) {
        // 获取仍然存在的所有形状（包括被移除的形状）
        const 有效的组形状 = 操作前组形状.filter((形状) => this.数据集.基础形状对象组.includes(形状));

        if (有效的组形状.length >= 2) {
          // 如果有效的形状数量>=2，恢复组的原始状态
          this.数据集.形状组[组ID] = [...有效的组形状];
          有效的组形状.forEach((形状) => {
            形状.所属组ID = 组ID;
          });

          // 将组内所有形状添加到多选组，保持多选状态（这样交互框才会正确显示）
          this.清空多选组();
          有效的组形状.forEach((形状) => {
            this.添加到多选组(形状);
          });
        } else {
          // 如果有效的形状数量<2，取消编组
          if (this.数据集.形状组[组ID]) {
            const 组内形状 = [...this.数据集.形状组[组ID]];
            组内形状.forEach((形状) => {
              if (形状) {
                形状.所属组ID = undefined;
              }
            });
            delete this.数据集.形状组[组ID];
          }
        }
      }

      // 更新按钮状态
      this.根据选中形状索引修改处理按钮状态();

      // 清空画布并重新绘制
      this.清空画布();
      this.绘制基础形状对象组();
    } else if (最后操作.操作类型 === "编辑文本") {
      // 撤销文本编辑操作：恢复旧的文本内容和坐标
      const 形状 = 最后操作.形状;
      形状.文本内容 = 最后操作.旧文本;
      形状.坐标.x = 最后操作.旧坐标.x;
      形状.坐标.y = 最后操作.旧坐标.y;
      this.更新文本形状(形状);
      this.更新路径(形状);

      // 清除该形状的选中和悬停状态
      形状.已选中 = false;
      形状.已悬停 = false;

      // 如果该形状是当前选中的形状，清除选中状态
      if (this.全局属性.选中形状 === 形状) {
        this.全局属性.选中形状 = null;
        this.恢复用户全局颜色到拾色器();
      }
    }
    this.数据集.操作记录.pop();
    if (this.数据集.操作记录.length <= 0) {
      this.撤销按钮.classList.add("禁用");
    }

    // 检查是否有选中或多选状态（如果有多选，不应该禁用按钮）
    const 有选中或多选 = this.全局属性.选中形状 || this.全局属性.多选形状组.length > 0;

    if (this.数据集.基础形状对象组.length <= 0 || (!this.全局属性.选中形状 && this.全局属性.多选形状组.length === 0)) {
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

    // 只有在没有选中且没有多选时才禁用所有图形控制按钮
    if (!有选中或多选) {
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
      旋转弧度: 0, // 初始化旋转弧度为0
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
    this.撤销按钮.classList.remove("禁用");
  }

  // 删除多选的所有形状
  删除多选形状() {
    if (this.全局属性.多选形状组.length === 0) return;

    // 从后往前删除，避免索引变化问题
    const 要删除的形状数组 = [...this.全局属性.多选形状组];

    // 记录删除操作（用于撤销）
    const 删除操作数组 = [];
    // 保存编组信息（组ID -> 组内所有形状数组），用于撤销时恢复编组
    const 编组信息 = {};

    要删除的形状数组.forEach((形状) => {
      const 选中索引 = this.数据集.基础形状对象组.indexOf(形状);
      if (选中索引 !== -1) {
        // 保存编组信息（如果形状属于某个组）
        if (形状.所属组ID) {
          if (!编组信息[形状.所属组ID]) {
            // 保存完整的组信息（组内所有形状）
            编组信息[形状.所属组ID] = [...this.数据集.形状组[形状.所属组ID]];
          }
        }

        this.数据集.基础形状对象组.splice(选中索引, 1);
        删除操作数组.push({
          操作类型: "删除基础形状",
          操作数据: 选中索引,
          被删除形状对象: 形状,
        });

        // 如果形状属于某个组，需要从组中移除
        if (形状.所属组ID) {
          const 组 = this.数据集.形状组[形状.所属组ID];
          if (组) {
            const 组内索引 = 组.indexOf(形状);
            if (组内索引 !== -1) {
              组.splice(组内索引, 1);
            }
            // 如果组变空了，删除组
            if (组.length === 0) {
              delete this.数据集.形状组[形状.所属组ID];
            }
          }
        }
      }
    });

    // 记录操作以便撤销（按删除顺序反向记录，便于撤销时恢复顺序）
    this.数据集.操作记录.push({
      操作类型: "删除多个形状",
      删除操作数组: 删除操作数组.reverse(),
      编组信息: 编组信息, // 保存编组信息以便撤销时恢复
    });

    // 清空多选组
    this.清空多选组();

    // 清除选中状态
    this.全局属性.选中形状 = null;
    this.恢复用户全局颜色到拾色器();

    // 更新按钮状态
    this.根据选中形状索引修改处理按钮状态();
    this.删除按钮.classList.add("禁用");

    // 重新绘制
    this.清空画布();
    this.绘制基础形状对象组();

    // 启用撤销按钮
    this.撤销按钮.classList.remove("禁用");
  }

  绘制单个形状(形状对象) {
    if (!形状对象) return;

    // 特殊处理：文本类型直接绘制文本
    if (形状对象.形状 === "文本") {
      this.绘制文本(形状对象);

      // 选中时绘制完整交互框，悬停时绘制半透明无句柄交互框，Alt预览时也绘制半透明交互框
      if (形状对象.已选中) {
        this.绘制交互框(形状对象, 1.0, true);
      } else if (形状对象.已悬停) {
        this.绘制交互框(形状对象, 0.4, false);
      } else if (形状对象.Alt预览中) {
        this.绘制交互框(形状对象, 0.4, false);
      } else {
        // 如果悬停的形状已编组，且当前形状和悬停的形状在同一组内，也用0.4的不透明度绘制预览交互框
        const 悬停形状 = this.全局属性.悬停形状;
        if (悬停形状 && 悬停形状.已悬停 && 悬停形状 !== 形状对象) {
          if (this.形状已编组(悬停形状) && 形状对象.所属组ID === 悬停形状.所属组ID) {
            this.绘制交互框(形状对象, 0.4, false);
          }
        }
      }
      return;
    }

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
      this.ctx.save();
      this.ctx.strokeStyle = 形状对象.描边色;
      this.ctx.fillStyle = 形状对象.填充色;
      this.ctx.lineWidth = 形状对象.描边宽度;

      // 为自由路径和箭头设置圆角
      if (形状对象.形状 === "自由" || 形状对象.形状 === "箭头") {
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
      }

      this.ctx.stroke(形状对象.路径);
      if (形状对象.形状 !== "直线" && 形状对象.形状 !== "自由" && 形状对象.形状 !== "箭头") {
        this.ctx.fill(形状对象.路径);
      }
      this.ctx.restore();
    }

    // 选中时绘制完整交互框，悬停时绘制半透明无句柄交互框，Alt预览时也绘制半透明交互框
    if (形状对象.已选中) {
      this.绘制交互框(形状对象, 1.0, true);
    } else if (形状对象.已悬停) {
      this.绘制交互框(形状对象, 0.4, false);
    } else if (形状对象.Alt预览中) {
      this.绘制交互框(形状对象, 0.4, false);
    } else {
      // 如果悬停的形状已编组，且当前形状和悬停的形状在同一组内，也用0.4的不透明度绘制预览交互框
      const 悬停形状 = this.全局属性.悬停形状;
      if (悬停形状 && 悬停形状.已悬停 && 悬停形状 !== 形状对象) {
        if (this.形状已编组(悬停形状) && 形状对象.所属组ID === 悬停形状.所属组ID) {
          this.绘制交互框(形状对象, 0.4, false);
        }
      }
    }
  }

  绘制基础形状对象组() {
    if (this.数据集.基础形状对象组.length <= 0) return;
    for (const 形状对象 of this.数据集.基础形状对象组) {
      // 特殊处理：文本类型直接绘制文本
      if (形状对象.形状 === "文本") {
        this.绘制文本(形状对象);

        // 选中时绘制完整交互框，悬停时绘制半透明无句柄交互框
        if (形状对象.已选中) {
          this.绘制交互框(形状对象, 1.0, true);
        } else if (形状对象.已悬停) {
          this.绘制交互框(形状对象, 0.75, false);
        } else if (形状对象.已多选) {
          // 多选形状：绘制半透明无句柄的个体交互框
          this.绘制交互框(形状对象, 0.4, false);
        } else if (形状对象.框选预览中) {
          // 框选预览中的形状：绘制半透明无句柄的预览交互框（与悬停时相同）
          this.绘制交互框(形状对象, 0.4, false);
        } else {
          // 如果悬停的形状已编组，且当前形状和悬停的形状在同一组内，也用0.4的不透明度绘制预览交互框
          const 悬停形状 = this.全局属性.悬停形状;
          if (悬停形状 && 悬停形状.已悬停 && 悬停形状 !== 形状对象) {
            if (this.形状已编组(悬停形状) && 形状对象.所属组ID === 悬停形状.所属组ID) {
              this.绘制交互框(形状对象, 0.4, false);
            }
          }
        }
        continue;
      }

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
        this.ctx.save();
        this.ctx.strokeStyle = 形状对象.描边色;
        this.ctx.fillStyle = 形状对象.填充色;
        this.ctx.lineWidth = 形状对象.描边宽度;

        // 为自由路径和箭头设置圆角
        if (形状对象.形状 === "自由" || 形状对象.形状 === "箭头") {
          this.ctx.lineCap = "round";
          this.ctx.lineJoin = "round";
        }

        this.ctx.stroke(形状对象.路径);
        if (形状对象.形状 !== "直线" && 形状对象.形状 !== "自由" && 形状对象.形状 !== "箭头") {
          this.ctx.fill(形状对象.路径);
        }
        this.ctx.restore();
      }

      // 选中时绘制完整交互框，悬停时绘制半透明无句柄交互框
      if (形状对象.已选中) {
        this.绘制交互框(形状对象, 1.0, true);
      } else if (形状对象.已悬停) {
        this.绘制交互框(形状对象, 0.75, false);
      } else if (形状对象.已多选) {
        // 多选形状：绘制半透明无句柄的个体交互框
        this.绘制交互框(形状对象, 0.4, false);
      } else if (形状对象.框选预览中) {
        // 框选预览中的形状：绘制半透明无句柄的预览交互框（与悬停时相同）
        this.绘制交互框(形状对象, 0.4, false);
      } else {
        // 如果悬停的形状已编组，且当前形状和悬停的形状在同一组内，也用0.4的不透明度绘制预览交互框
        const 悬停形状 = this.全局属性.悬停形状;
        if (悬停形状 && 悬停形状.已悬停 && 悬停形状 !== 形状对象) {
          if (this.形状已编组(悬停形状) && 形状对象.所属组ID === 悬停形状.所属组ID) {
            this.绘制交互框(形状对象, 0.4, false);
          }
        }
      }
    }

    // 绘制多选的整体交互框
    if (this.全局属性.多选形状组.length > 0) {
      const 边界 = this.获取多选形状的边界();
      if (边界) {
        this.绘制多选整体交互框(边界);
      }
    }

    if (
      this.全局属性.悬停形状 &&
      !this.全局属性.悬停形状.已选中 &&
      !this.全局属性.悬停形状.已多选 &&
      this.形状已编组(this.全局属性.悬停形状) &&
      this.全局属性.已选中基础形状 === "选择路径"
    ) {
      // 获取组内所有形状
      const 组内形状 = this.获取组内所有形状(this.全局属性.悬停形状);
      if (组内形状 && 组内形状.length >= 2) {
        // 临时将组内形状设置为多选形状组，以便计算边界和绘制交互框
        const 原多选形状组 = this.全局属性.多选形状组;

        // 在修改多选形状组之前，先判断是否进行了多选
        const 进行了多选 = 原多选形状组.length > 0;

        this.全局属性.多选形状组 = [...组内形状];

        // 计算组内所有形状的边界
        const 边界 = this.获取多选形状的边界();
        if (边界 && 边界.width > 0 && 边界.height > 0) {
          // 判断特殊情况：如果"未选中编组"且选中了不在编组内的形状（或者选中了其它编组，或者进行了多选）时，
          // 鼠标悬停到编组内任意一个形状上，此时如果Shift键也按下了，则编组的预览交互框用[10, 5]的虚线
          let 虚线模式 = null; // 默认为null，使用默认逻辑（实线）

          if (this.全局标志.Shift已按下) {
            // 判断是否选中了不在编组内的形状
            const 选中了不在编组内的形状 = this.全局属性.选中形状 && !this.形状已编组(this.全局属性.选中形状);

            // 判断是否选中了其它编组
            const 选中了其它编组 =
              this.全局属性.选中形状 &&
              this.形状已编组(this.全局属性.选中形状) &&
              this.全局属性.选中形状.所属组ID !== this.全局属性.悬停形状.所属组ID;

            // 如果满足任一条件，使用[10, 5]虚线
            if (选中了不在编组内的形状 || 选中了其它编组 || 进行了多选) {
              虚线模式 = [10, 5];
            }
          }

          // 绘制整体预览交互框（不透明度35%，强制已编组为true，自定义虚线模式）
          this.绘制多选整体交互框(边界, 0.35, true, 虚线模式);
        }

        // 恢复原多选形状组
        this.全局属性.多选形状组 = 原多选形状组;
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
      // 多边形和多角星在旋转时会使用旋转弧度（用于交互框）
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
    } else if (形状对象.形状 === "矩形" || 形状对象.形状 === "图像" || 形状对象.形状 === "文本") {
      // 矩形、图像和文本如果有旋转弧度，需要特殊处理
      旋转弧度 = 形状对象.旋转弧度 || 0;

      // 计算未旋转时的原始尺寸（通过顶点计算）
      // 假设矩形/图像/文本有4个顶点，计算第一条边的长度作为宽，第二条边的长度作为高
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
    } else if (形状对象.形状 === "箭头") {
      // 箭头如果有旋转弧度，需要特殊处理（类似矩形和图像）
      旋转弧度 = 形状对象.旋转弧度 || 0;

      // 计算箭头的原始尺寸（通过顶点计算）
      if (形状对象.顶点坐标组 && 形状对象.顶点坐标组.length >= 2) {
        // 使用极值坐标的中心作为旋转中心
        const 中心 = 形状对象.极值坐标.中心;

        // 计算箭头的原始边界（在未旋转状态下）
        let 最左 = Infinity;
        let 最右 = -Infinity;
        let 最上 = Infinity;
        let 最下 = -Infinity;

        // 如果有旋转，需要将顶点转换回未旋转状态
        if (旋转弧度 !== 0) {
          const cos = Math.cos(-旋转弧度);
          const sin = Math.sin(-旋转弧度);
          for (const 顶点 of 形状对象.顶点坐标组) {
            const dx = 顶点.x - 中心.x;
            const dy = 顶点.y - 中心.y;
            const 局部x = dx * cos - dy * sin;
            const 局部y = dx * sin + dy * cos;
            最左 = Math.min(最左, 局部x);
            最右 = Math.max(最右, 局部x);
            最上 = Math.min(最上, 局部y);
            最下 = Math.max(最下, 局部y);
          }
        } else {
          for (const 顶点 of 形状对象.顶点坐标组) {
            最左 = Math.min(最左, 顶点.x - 中心.x);
            最右 = Math.max(最右, 顶点.x - 中心.x);
            最上 = Math.min(最上, 顶点.y - 中心.y);
            最下 = Math.max(最下, 顶点.y - 中心.y);
          }
        }

        const 宽度 = 最右 - 最左;
        const 高度 = 最下 - 最上;

        // 交互框的左上角（相对于中心点的局部坐标）
        坐标.x = 中心.x + 最左 - 外边距;
        坐标.y = 中心.y + 最上 - 外边距;
        尺寸.width = 宽度 + 外边距 * 2;
        尺寸.height = 高度 + 外边距 * 2;
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

    // 判断是否在多选或编组状态
    const 已多选 = this.全局属性.多选形状组.length > 0;
    const 选中编组 = this.全局属性.选中形状 && this.形状已编组(this.全局属性.选中形状);
    const 多选或编组状态 = 已多选 || 选中编组;

    // 虚线长度逻辑：
    // - 只有在多选或编组状态下，悬停且Shift已按下时才使用虚线长度5
    // - 否则：使用虚线长度10（默认）
    const 虚线长度 = 形状对象.已悬停 && this.全局标志.Shift已按下 && 多选或编组状态 ? 5 : 10;
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
        形状对象.形状 === "自由" ||
        形状对象.形状 === "箭头" ||
        形状对象.形状 === "文本"
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
    const 特殊名词组 = ["↑", "↓", "←", "→", "[", "]", "Shift", "Enter", "ESC", "空格"];
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
    // 如果没有定义操作说明，直接返回
    if (!操作说明组) {
      this.ctx.closePath();
      this.ctx.restore();
      return;
    }
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
