class ASSParser {
  constructor() {
    this.当前文件 = null;
    this.文件句柄 = null;
    this.文件数据 = null;
    this.原始文件内容 = null;
    this.原始文件数据 = null;
    this.自动保存 = false;
    this.保存定时器 = null;
    this.保存提示元素 = null;
    this.保存提示隐藏定时器 = null;
    this.保存提示显示动画 = null;
    this.保存提示隐藏动画 = null;
    this.文件已修改 = false;
    this.ASS标准默认样式 = this.创建ASS标准默认样式();
    this.副字幕统一样式 = null;
    this.副字幕统一样式基线 = null;
    this.副字幕已编辑字段 = new Set();
    this.主字幕分组列表 = [];
    this.初始化();
  }

  初始化() {
    const 文件选择 = document.getElementById("文件选择");
    const 文件选择按钮 = document.querySelector(".文件选择按钮");
    const 自动保存复选框 = document.getElementById("自动保存复选框");
    const 保存按钮 = document.getElementById("保存按钮");
    const 全部撤销按钮 = document.getElementById("全部撤销按钮");
    const 关闭文件按钮 = document.getElementById("关闭文件按钮");

    保存按钮.classList.add("禁用");
    全部撤销按钮.classList.add("禁用");

    const 保存的自动保存状态 = localStorage.getItem("ASS_Subtitle_自动保存");
    if (保存的自动保存状态 !== null) {
      this.自动保存 = 保存的自动保存状态 === "true";
      自动保存复选框.checked = this.自动保存;
    } else {
      this.自动保存 = false;
      自动保存复选框.checked = false;
    }
    this.更新保存按钮状态();

    if (文件选择按钮) {
      文件选择按钮.addEventListener("click", (e) => {
        e.preventDefault();
        this.打开文件();
      });
    }

    文件选择.addEventListener("change", (e) => this.处理文件选择(e));

    自动保存复选框.addEventListener("change", (e) => {
      this.自动保存 = e.target.checked;
      localStorage.setItem("ASS_Subtitle_自动保存", this.自动保存.toString());
      this.更新保存按钮状态();
    });
    保存按钮.addEventListener("click", async () => {
      if (!保存按钮.classList.contains("禁用")) {
        const 保存成功 = await this.执行保存();
        if (保存成功) {
          this.原始文件数据 = this.深拷贝文件数据(this.文件数据);
          this.文件已修改 = false;
        }
        this.更新保存按钮状态();
      }
    });

    关闭文件按钮.addEventListener("click", () => {
      this.关闭文件();
    });

    全部撤销按钮.addEventListener("click", () => {
      this.全部撤销();
    });
  }

  处理文件选择(event) {
    const 文件 = event.target.files[0];
    if (!文件) return;

    this.当前文件 = 文件;
    this.文件句柄 = null;
    document.getElementById("文件名").textContent = 文件.name;

    const 读取器 = new FileReader();
    读取器.onload = (e) => {
      const 内容 = e.target.result;
      this.解析ASS文件(内容);
    };
    读取器.readAsText(文件, "UTF-8");
  }

  async 打开文件() {
    try {
      if (!window.showOpenFilePicker) {
        document.getElementById("文件选择").click();
        return;
      }

      const [文件句柄] = await window.showOpenFilePicker({
        types: [
          {
            description: "ASS字幕文件",
            accept: {
              "text/plain": [".ass"],
            },
          },
        ],
      });

      this.文件句柄 = 文件句柄;
      const 文件 = await 文件句柄.getFile();
      this.当前文件 = 文件;
      document.getElementById("文件名").textContent = 文件.name;

      const 读取器 = new FileReader();
      读取器.onload = (e) => {
        const 内容 = e.target.result;
        this.解析ASS文件(内容);
      };
      读取器.readAsText(文件, "UTF-8");
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("打开文件失败:", error);
        document.getElementById("文件选择").click();
      }
    }
  }

  解析ASS文件(内容) {
    this.原始文件内容 = 内容;
    this.文件已修改 = false;

    const 文件名显示区 = document.querySelector(".文件名显示区");
    if (文件名显示区) {
      文件名显示区.classList.remove("隐藏");
    }
    const 关闭文件按钮 = document.getElementById("关闭文件按钮");
    if (关闭文件按钮) {
      关闭文件按钮.classList.remove("禁用");
    }

    const 行 = 内容.split(/\r?\n/);
    const 部分 = {};
    let 当前部分 = null;
    let 当前部分内容 = [];

    for (let i = 0; i < 行.length; i++) {
      const 行内容 = 行[i].trim();

      if (行内容.startsWith("[") && 行内容.endsWith("]")) {
        if (当前部分) {
          部分[当前部分] = 当前部分内容;
        }
        当前部分 = 行内容;
        当前部分内容 = [];
        continue;
      }

      if (!行内容 || 行内容.startsWith(";") || 行内容.startsWith("!")) {
        continue;
      }

      if (当前部分) {
        当前部分内容.push(行内容);
      }
    }

    if (当前部分) {
      部分[当前部分] = 当前部分内容;
    }

    this.文件数据 = 部分;
    this.原始文件数据 = this.深拷贝文件数据(部分);
    this.渲染UI();
    this.更新保存按钮状态();
  }

  解析属性行(行) {
    const 冒号索引 = 行.indexOf(":");
    if (冒号索引 === -1) return null;

    const 键 = 行.substring(0, 冒号索引).trim();
    const 值 = 行.substring(冒号索引 + 1).trim();
    return { 键, 值 };
  }

  渲染UI() {
    const ASS区 = document.getElementById("ASS区");
    ASS区.innerHTML = "";

    if (this.文件数据["[Script Info]"]) {
      this.渲染ScriptInfo(ASS区);
    }

    if (this.文件数据["[Aegisub Project Garbage]"]) {
      this.渲染AegisubProjectGarbage(ASS区);
    }

    if (this.文件数据["[V4+ Styles]"]) {
      this.渲染V4Styles(ASS区);
    }

    if (this.文件数据["[Events]"]) {
      this.渲染主字幕(ASS区);
      this.渲染副字幕(ASS区);
    }
  }

  渲染ScriptInfo(容器) {
    const 部分区 = document.createElement("div");
    部分区.className = "部分区 部分区-Script-Info";

    const 标题 = document.createElement("div");
    标题.className = "部分标题";
    标题.textContent = "[Script Info]";
    部分区.appendChild(标题);

    const 属性组 = document.createElement("div");
    属性组.className = "属性组";

    const 属性映射 = this.解析部分属性(this.文件数据["[Script Info]"]);

    const 需要显示的属性 = { ...属性映射 };
    if (!需要显示的属性["ScaledBorderAndShadow"]) {
      需要显示的属性["ScaledBorderAndShadow"] = "";
    }

    const 属性信息 = {
      Title: { 中文: "标题", 类型: "文本" },
      ScriptType: { 中文: "脚本类型", 类型: "文本" },
      ScaledBorderAndShadow: { 中文: "缩放边框和阴影", 类型: "枚举", 选项: ["yes", "no"] },
      Collisions: { 中文: "行碰撞", 类型: "枚举", 选项: ["Normal", "Reverse"] },
      PlayResX: { 中文: "播放分辨率X", 类型: "数字" },
      PlayResY: { 中文: "播放分辨率Y", 类型: "数字" },
      Timer: { 中文: "字幕速率", 类型: "数字" },
      WrapStyle: { 中文: "换行样式", 类型: "数字" },
      "Synch Point": { 中文: "速率缩放锚点", 类型: "文本" },
      "YCbCr Matrix": { 中文: "色彩空间", 类型: "文本" },
      "Video Aspect Ratio": { 中文: "视频宽高比", 类型: "文本" },
      "Video Zoom": { 中文: "视频缩放", 类型: "数字" },
      "Original Script": { 中文: "作者", 类型: "文本" },
      "Original Translation": { 中文: "原始翻译", 类型: "文本" },
      "Original Timing": { 中文: "原始时间轴", 类型: "文本" },
      "Original Editing": { 中文: "原始编辑/校对", 类型: "文本" },
      "Script Updated By": { 中文: "脚本更新者", 类型: "文本" },
      "Update Details": { 中文: "更新详情", 类型: "文本" },
    };

    for (const [键, 值] of Object.entries(需要显示的属性)) {
      const 信息 = 属性信息[键] || { 中文: 键, 类型: "文本" };
      this.创建属性项(属性组, 键, 值, 信息, "[Script Info]");
    }

    部分区.appendChild(属性组);
    容器.appendChild(部分区);
  }

  渲染AegisubProjectGarbage(容器) {
    const 部分区 = document.createElement("div");
    部分区.className = "部分区 部分区-Aegisub-Project-Garbage";

    const 标题 = document.createElement("div");
    标题.className = "部分标题";
    标题.textContent = "[Aegisub Project Garbage]";
    部分区.appendChild(标题);

    const 属性组 = document.createElement("div");
    属性组.className = "属性组";

    const 属性映射 = this.解析部分属性(this.文件数据["[Aegisub Project Garbage]"]);

    const 属性信息 = {
      "Last Style Storage": { 中文: "样式库", 类型: "文本" },
      "Audio File": { 中文: "编辑时音频文件", 类型: "文本" },
      "Video File": { 中文: "编辑时视频文件", 类型: "文本" },
      "Video AR Mode": { 中文: "视频宽高比模式", 类型: "文本" },
      "Video AR Value": { 中文: "视频宽高比值", 类型: "数字" },
      "Video Zoom Percent": { 中文: "视频缩放百分比", 类型: "数字" },
      "Scroll Position": { 中文: "滚动位置", 类型: "数字" },
      "Active Line": { 中文: "活动行", 类型: "数字" },
      "Video Position": { 中文: "上次视频播放位置", 类型: "数字" },
      "Keyframes File": { 中文: "关键帧文件", 类型: "文本" },
      "Aegisub Project Garbage": { 中文: "Aegisub项目垃圾数据", 类型: "文本" },
      "Aegisub Scroll Position": { 中文: "Aegisub滚动位置", 类型: "数字" },
      "Aegisub Active Line": { 中文: "Aegisub活动行", 类型: "数字" },
      "Aegisub Video Zoom Percent": { 中文: "Aegisub视频缩放百分比", 类型: "数字" },
      "Aegisub Video Position": { 中文: "Aegisub视频位置", 类型: "数字" },
    };

    for (const [键, 值] of Object.entries(属性映射)) {
      const 信息 = 属性信息[键] || { 中文: 键, 类型: "文本" };
      this.创建属性项(属性组, 键, 值, 信息, "[Aegisub Project Garbage]");
    }

    部分区.appendChild(属性组);
    容器.appendChild(部分区);
  }

  渲染V4Styles(容器) {
    const 部分区 = document.createElement("div");
    部分区.className = "部分区 部分区-V4-Styles";

    const 标题 = document.createElement("div");
    标题.className = "部分标题";
    标题.textContent = "[V4+ Styles]";
    部分区.appendChild(标题);

    const 行 = this.文件数据["[V4+ Styles]"];
    let 格式行 = null;
    const 样式行 = [];

    for (const 行内容 of 行) {
      if (行内容.startsWith("Format:")) {
        格式行 = 行内容;
      } else if (行内容.startsWith("Style:")) {
        样式行.push(行内容);
      }
    }

    if (!格式行 || 样式行.length === 0) {
      部分区.appendChild(document.createTextNode("无样式数据"));
      容器.appendChild(部分区);
      return;
    }

    const 格式属性 = this.解析属性行(格式行);
    if (!格式属性) {
      部分区.appendChild(document.createTextNode("格式解析失败"));
      容器.appendChild(部分区);
      return;
    }

    const 字段列表 = 格式属性.值.split(",").map((字段) => 字段.trim());

    this.V4Styles字段列表 = 字段列表;

    const 字段映射 = {
      Name: "名称",
      Fontname: "字体名称",
      Fontsize: "字体大小",
      PrimaryColour: "主要颜色",
      SecondaryColour: "次要颜色",
      OutlineColour: "轮廓颜色",
      BackColour: "背景颜色",
      Bold: "粗体",
      Italic: "斜体",
      Underline: "下划线",
      StrikeOut: "删除线",
      ScaleX: "横向缩放",
      ScaleY: "纵向缩放",
      Spacing: "间距",
      Angle: "角度",
      BorderStyle: "边框样式",
      Outline: "轮廓宽度",
        Shadow: "阴影深度",
        Blur: "模糊",
      Alignment: "对齐方式",
      MarginL: "左边距",
      MarginR: "右边距",
      MarginV: "垂直边距",
      Encoding: "编码",
    };

    const 浮点数字段 = new Set(["Spacing", "Angle", "Outline", "Shadow"]);

    const 整数字段 = new Set(["Fontsize", "ScaleX", "ScaleY", "MarginL", "MarginR", "MarginV"]);

    const 选项字段 = {
      Bold: { 选项: ["0", "-1"], 标签: ["关闭", "开启"] },
      Italic: { 选项: ["0", "-1"], 标签: ["关闭", "开启"] },
      Underline: { 选项: ["0", "-1"], 标签: ["关闭", "开启"] },
      StrikeOut: { 选项: ["0", "-1"], 标签: ["关闭", "开启"] },
      BorderStyle: { 选项: ["1", "3"], 标签: ["正常边框", "不透明背景"] },
      Alignment: {
        选项: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
        标签: ["左下", "中下", "右下", "左中", "中中", "右中", "左上", "中上", "右上"],
      },
      Encoding: {
        选项: ["0", "1", "2", "3", "77", "128", "129", "130", "134", "136", "255"],
        标签: [
          "ANSI",
          "默认",
          "符号",
          "Shift JIS",
          "Hangeul",
          "GB2312",
          "中文简体",
          "中文繁体",
          "中文繁体",
          "中文繁体",
          "OEM",
        ],
      },
    };

    const 样式数据 = [];
    for (let i = 0; i < 样式行.length; i++) {
      const 样式属性 = this.解析属性行(样式行[i]);
      if (!样式属性) continue;

      const 值列表 = 样式属性.值.split(",");
      const 样式名称 = 值列表[0] ? 值列表[0].trim() : `Style ${i + 1}`;
      样式数据.push({
        名称: 样式名称,
        值列表: 值列表,
        原始索引: i,
      });
    }

    const 表格容器 = document.createElement("div");
    表格容器.className = "样式表格容器";

    const 表格 = document.createElement("table");
    表格.className = "样式表格";

    const 表头行 = document.createElement("tr");
    表头行.className = "表头行";

    for (const 字段 of 字段列表) {
      const 字段表头 = document.createElement("th");
      字段表头.className = "表头单元格 单元格";
      const 字段中文 = document.createElement("div");
      字段中文.className = "表头中文";
      字段中文.textContent = 字段映射[字段] || 字段;
      const 字段英文 = document.createElement("div");
      字段英文.className = "表头英文";
      字段英文.textContent = 字段;
      字段表头.appendChild(字段中文);
      字段表头.appendChild(字段英文);
      表头行.appendChild(字段表头);
    }
    表格.appendChild(表头行);

    for (let i = 0; i < 样式数据.length; i++) {
      const 样式 = 样式数据[i];
      const 数据行 = document.createElement("tr");
      数据行.className = `数据行 ${i % 2 === 0 ? "偶数行" : "奇数行"}`;
      数据行.dataset.样式索引 = i;

      for (let j = 0; j < 字段列表.length; j++) {
        const 字段 = 字段列表[j];
        const 值 = 样式.值列表[j] ? 样式.值列表[j].trim() : "";

        const 单元格 = document.createElement("td");
        单元格.className = "数据单元格 单元格";

        if (字段 === "Name") {
          单元格.textContent = 值;
          单元格.style.color = "#4a8";
          单元格.style.padding = "12px 8px";
        } else if (
          字段 === "PrimaryColour" ||
          字段 === "SecondaryColour" ||
          字段 === "OutlineColour" ||
          字段 === "BackColour"
        ) {
          this.创建颜色选择器占位(单元格, 字段, 值, i, j);
        } else if (选项字段[字段]) {
          this.创建表格选项控件(单元格, 字段, 值, i, j, 选项字段[字段]);
        } else if (浮点数字段.has(字段)) {
          this.创建表格数字框(单元格, 字段, 值, i, j, 0.1);
        } else if (整数字段.has(字段)) {
          this.创建表格数字框(单元格, 字段, 值, i, j, 1);
        } else {
          this.创建表格文本框(单元格, 字段, 值, i, j);
        }

        数据行.appendChild(单元格);
      }

      表格.appendChild(数据行);
    }

    表格容器.appendChild(表格);
    部分区.appendChild(表格容器);
    容器.appendChild(部分区);

    this.初始化表头固定(表格);
    this.初始化列高亮(表格);

    setTimeout(() => {
      this.初始化所有颜色选择器(表格);
    }, 0);
  }

  渲染副字幕(容器) {
    const 部分区 = document.createElement("div");
    部分区.className = "部分区 部分区-副字幕";

    const 标题 = document.createElement("div");
    标题.className = "部分标题";
    标题.textContent = "[Events] 副字幕样式";
    部分区.appendChild(标题);

    const 行 = this.文件数据["[Events]"];
    if (!行 || 行.length === 0) {
      部分区.appendChild(document.createTextNode("未找到事件数据"));
      容器.appendChild(部分区);
      return;
    }

    const 格式行 = 行.find((内容) => 内容.startsWith("Format:"));
    if (!格式行) {
      部分区.appendChild(document.createTextNode("缺少 Format 行，无法解析 Events 部分"));
      容器.appendChild(部分区);
      return;
    }

    const 字段列表 = 格式行
      .replace(/^Format:/i, "")
      .split(",")
      .map((字段) => 字段.trim())
      .filter((字段) => 字段);

    const 文本索引 = 字段列表.findIndex((字段) => 字段.toLowerCase() === "text");
    if (文本索引 === -1) {
      部分区.appendChild(document.createTextNode("Format 中缺少 Text 字段"));
      容器.appendChild(部分区);
      return;
    }

    const 样式索引 = 字段列表.findIndex((字段) => 字段.toLowerCase() === "style");
    const 开始索引 = 字段列表.findIndex((字段) => 字段.toLowerCase() === "start");
    const 结束索引 = 字段列表.findIndex((字段) => 字段.toLowerCase() === "end");

    const 样式映射 = this.构建样式映射();
    const 副字幕字段默认样式 = this.获取副字幕字段标准默认样式();
    const 默认样式 = this.ASS标准默认样式 || this.创建ASS标准默认样式();

    const 副字幕列表 = [];

    for (const 行内容 of 行) {
      if (!行内容.startsWith("Dialogue:")) continue;

      const 事件字段 = this.解析事件行(行内容, 字段列表, 文本索引);
      if (!事件字段) continue;

      const 文本值 = 事件字段[字段列表[文本索引]] || "";
      const 行拆分 = 文本值.split(/\\[Nn]/);
      if (行拆分.length < 2) continue;

      const 副文本原始 = 行拆分.slice(1).join("\\N").trim();
      const 副文本净化 = 副文本原始.replace(/^\{[^}]*\}/, "").trim();

      const 样式名 = 样式索引 !== -1 ? 事件字段[字段列表[样式索引]] || "Default" : "Default";
      const 基础样式 = { ...副字幕字段默认样式 };
      const 副字幕样式 = this.解析副字幕样式(副文本原始, 基础样式);
      const 引用样式名 = this.提取副字幕样式引用(副文本原始);
      const 覆盖字段集合 = this.提取副字幕覆盖字段集合(副文本原始);

      副字幕列表.push({
        序号: 副字幕列表.length + 1,
        开始: 开始索引 !== -1 ? 事件字段[字段列表[开始索引]] || "" : "",
        结束: 结束索引 !== -1 ? 事件字段[字段列表[结束索引]] || "" : "",
        样式名,
        副文本: 副文本净化 || "(空)",
        原始副文本: 副文本原始,
        样式: 副字幕样式,
        引用样式名,
        覆盖字段集合,
      });
    }

    if (副字幕列表.length === 0) {
      部分区.appendChild(document.createTextNode("未找到包含 \\N 的副字幕行"));
      容器.appendChild(部分区);
      return;
    }

    const 引用样式计数 = new Map();
    const 自定义列表 = [];
    const 自定义字段集合 = new Set();

    副字幕列表.forEach((项) => {
      if (项.引用样式名) {
        引用样式计数.set(项.引用样式名, (引用样式计数.get(项.引用样式名) || 0) + 1);
      } else {
        自定义列表.push(项);
        if (项.覆盖字段集合 && 项.覆盖字段集合.size > 0) {
          项.覆盖字段集合.forEach((f) => 自定义字段集合.add(f));
        }
      }
    });

    // 频率阈值：字段在所有自定义副字幕行中的出现率需达到 90% 才显示
    if (自定义列表.length > 0 && 自定义字段集合.size > 0) {
      const 字段出现计数 = new Map();
      自定义列表.forEach((项) => {
        if (!项.覆盖字段集合) return;
        项.覆盖字段集合.forEach((f) => {
          字段出现计数.set(f, (字段出现计数.get(f) || 0) + 1);
        });
      });

      const 阈值行数 = Math.ceil(自定义列表.length * 0.9);
      const 满足阈值字段 = new Set();
      字段出现计数.forEach((计数, 字段) => {
        if (计数 >= 阈值行数) {
          满足阈值字段.add(字段);
        }
      });

      自定义字段集合.clear();
      满足阈值字段.forEach((f) => 自定义字段集合.add(f));
    }

    ["PrimaryColour", "OutlineColour", "Outline", "Shadow"].forEach((字段) => 自定义字段集合.add(字段));

    const 总引用数 = Array.from(引用样式计数.values()).reduce((a, b) => a + b, 0);

    if (总引用数 > 0) {
      const 提示 = document.createElement("div");
      提示.className = "副字幕引用提示";

      const 样式串 = Array.from(引用样式计数.entries())
        .map(([样式名, 行数]) => `<span class="副字幕引用提示-样式名">${样式名}</span>`)
        .join(" / ");

      提示.innerHTML = `有 <span class="副字幕引用提示-数量">${总引用数}</span> 行副字幕引用了 <span class="副字幕引用提示-标签">[V4+ Styles]</span> 中的样式：${样式串}`;

      部分区.appendChild(提示);
    }

    if (自定义列表.length > 0) {
      const 计数 = document.createElement("div");
      计数.className = "副字幕计数";
      计数.innerHTML = `有 <span class="副字幕计数数字">${自定义列表.length}</span> 行副字幕使用自定义样式，以下表格内样式会应用到这些行。`;
      部分区.appendChild(计数);

      const 基线样式 = 自定义列表[0]?.样式 ? { ...自定义列表[0].样式 } : { ...默认样式 };
      this.副字幕统一样式基线 = { ...基线样式 };
      this.副字幕统一样式 = { ...基线样式 };
      this.副字幕已编辑字段 = new Set();

      const 副字幕字段顺序 = this.获取副字幕字段顺序();
      const 自定义字段列表 = 副字幕字段顺序.filter((字段) => 自定义字段集合.has(字段));

      if (自定义字段列表.length === 0) {
        const 无字段提示 = document.createElement("div");
        无字段提示.className = "副字幕计数";
        无字段提示.textContent = "未检测到副字幕自定义样式中的代码字段。";
        部分区.appendChild(无字段提示);
      } else {
        const 样式表 = this.创建副字幕样式表(this.副字幕统一样式, 自定义字段列表);
        部分区.appendChild(样式表);

        setTimeout(() => {
          this.初始化所有颜色选择器(样式表);
        }, 0);
      }
    } else {
      // 没有自定义样式行时，不需要可编辑表
      this.副字幕统一样式 = null;
      this.副字幕统一样式基线 = null;
    }

    容器.appendChild(部分区);
  }

  渲染主字幕(容器) {
    const 部分区 = document.createElement("div");
    部分区.className = "部分区 部分区-主字幕";

    const 标题 = document.createElement("div");
    标题.className = "部分标题";
    标题.textContent = "[Events] 主字幕样式";
    部分区.appendChild(标题);

    const 行 = this.文件数据["[Events]"];
    if (!行 || 行.length === 0) {
      部分区.appendChild(document.createTextNode("未找到事件数据"));
      容器.appendChild(部分区);
      return;
    }

    const 格式行 = 行.find((内容) => 内容.startsWith("Format:"));
    if (!格式行) {
      部分区.appendChild(document.createTextNode("缺少 Format 行，无法解析 Events 部分"));
      容器.appendChild(部分区);
      return;
    }

    const 字段列表 = 格式行
      .replace(/^Format:/i, "")
      .split(",")
      .map((字段) => 字段.trim())
      .filter((字段) => 字段);

    const 文本索引 = 字段列表.findIndex((字段) => 字段.toLowerCase() === "text");
    if (文本索引 === -1) {
      部分区.appendChild(document.createTextNode("Format 中缺少 Text 字段"));
      容器.appendChild(部分区);
      return;
    }

    const 样式索引 = 字段列表.findIndex((字段) => 字段.toLowerCase() === "style");

    const 样式映射 = this.构建样式映射();
    const 默认样式 = this.ASS标准默认样式 || this.创建ASS标准默认样式();

    const 主字幕自定义列表 = [];
    const 主字幕引用计数 = new Map();

    for (let 行索引值 = 0; 行索引值 < 行.length; 行索引值++) {
      const 行内容 = 行[行索引值];
      if (!行内容.startsWith("Dialogue:")) continue;

      const 事件字段 = this.解析事件行(行内容, 字段列表, 文本索引);
      if (!事件字段) continue;

      const 文本值 = 事件字段[字段列表[文本索引]] || "";
      const 行拆分 = 文本值.split(/\\[Nn]/);
      const 主文本原始 = 行拆分[0] || "";
      const 主文本净化 = 主文本原始.replace(/^\{[^}]*\}/, "").trim();

      const 样式名 = 样式索引 !== -1 ? 事件字段[字段列表[样式索引]] || "Default" : "Default";
      const 有覆盖 = /^\{[^}]*\}/.test(主文本原始);

      if (!有覆盖) {
        主字幕引用计数.set(样式名, (主字幕引用计数.get(样式名) || 0) + 1);
        continue;
      }

      const 覆盖串 = (主文本原始.match(/^\{[^}]*\}/) || [""])[0];
      const 覆盖字段集合 = this.提取覆盖字段集合(覆盖串);

      const 基础样式 = this.构建基础样式(样式名, 样式映射, 默认样式);
      const 主字幕样式 = this.解析副字幕样式(主文本原始, 基础样式);

      主字幕自定义列表.push({
        样式: 主字幕样式,
        样式名,
        主文本: 主文本净化 || "(空)",
        原始主文本: 主文本原始,
        覆盖字段集合,
        行索引: 行索引值,
        基础样式,
      });
    }

    const 引用总数 = Array.from(主字幕引用计数.values()).reduce((a, b) => a + b, 0);

    if (引用总数 === 0 && 主字幕自定义列表.length === 0) {
      return; // 无引用且无自定义，无需渲染
    }

    if (引用总数 > 0) {
      const 提示 = document.createElement("div");
      提示.className = "样式引用提示 样式引用提示-主 副字幕引用提示";

      const 样式串 = Array.from(主字幕引用计数.entries())
        .map(([样式名]) => {
          const 显示名 = 样式名.startsWith("*") ? 样式名.slice(1) : 样式名;
          return `<span class="样式引用提示-样式名">${显示名}</span>`;
        })
        .join(" / ");

      提示.innerHTML = `有 <span class="样式引用提示-数量">${引用总数}</span> 行主字幕引用了 <span class="样式引用提示-标签">[V4+ Styles]</span> 中的样式：${样式串}`;

      部分区.appendChild(提示);
    }

    if (主字幕自定义列表.length > 0) {
      const 分组映射 = new Map();
      this.主字幕分组列表 = [];

      主字幕自定义列表.forEach((项) => {
        const 字段列表 = this.构建覆盖字段列表(项.覆盖字段集合);
        if (字段列表.length === 0) return;
        const 键对象 = {};
        字段列表.forEach((f) => {
          if (f === "Pos") {
            键对象.PosX = 项.样式.PosX || "";
            键对象.PosY = 项.样式.PosY || "";
          } else {
            键对象[f] = 项.样式[f] || "";
          }
        });
        const 键 = JSON.stringify({ 字段: 字段列表, 值: 键对象, 样式名: 项.样式名 });
        if (!分组映射.has(键)) {
          分组映射.set(键, {
            样式: { ...项.样式 },
            字段列表,
            行数: 0,
            行索引列表: [],
            基础样式: { ...项.基础样式 },
            样式名: 项.样式名,
          });
        }
        const 组 = 分组映射.get(键);
        组.行数 += 1;
        组.行索引列表.push(项.行索引);
      });

      this.主字幕分组列表 = Array.from(分组映射.values());

      this.主字幕分组列表.forEach((组, 索引) => {
        const 字段列表 = 组.字段列表;
        if (字段列表.length === 0) return;

        const 计数 = document.createElement("div");
        计数.className = "样式计数 样式计数-主 副字幕计数";
        计数.innerHTML = `有 <span class="样式计数数字">${组.行数}</span> 行主字幕使用自定义样式，以下表格中的样式会应用于这些行。`;
        部分区.appendChild(计数);

        const 样式表 = this.创建主字幕样式表(组.样式, 字段列表, 索引);
        部分区.appendChild(样式表);

        setTimeout(() => {
          this.初始化所有颜色选择器(样式表);
        }, 0);
      });
    }

    容器.appendChild(部分区);
  }

  获取副字幕字段顺序() {
    return [
      "Fontname",
      "Fontsize",
      "PrimaryColour",
      "SecondaryColour",
      "OutlineColour",
      "BackColour",
      "Bold",
      "Italic",
      "Underline",
      "StrikeOut",
      "BorderStyle",
      "Outline",
      "Shadow",
      "Blur",
      "Alignment",
      "ScaleX",
      "ScaleY",
      "Spacing",
      "Angle",
      "Fade",
    ];
  }

  创建副字幕样式表(样式, 指定字段列表 = []) {
    const 表格容器 = document.createElement("div");
    表格容器.className = "样式表格容器 副字幕样式表格容器";

    const 表格 = document.createElement("table");
    表格.className = "样式表格 副字幕样式表";

    const 默认字段列表 = this.获取副字幕字段顺序();
    const 字段列表 = 指定字段列表.length > 0 ? 指定字段列表 : 默认字段列表;

    if (字段列表.length === 0) {
      const 提示 = document.createElement("div");
      提示.className = "副字幕空字段提示";
      提示.textContent = "未检测到可编辑的副字幕样式字段。";
      表格容器.appendChild(提示);
      return 表格容器;
    }

    const 字段映射 = {
      Fontname: "字体名称",
      Fontsize: "字体大小",
      PrimaryColour: "主要颜色",
      SecondaryColour: "次要颜色",
      OutlineColour: "轮廓颜色",
      BackColour: "阴影颜色",
      Bold: "粗体",
      Italic: "斜体",
      Underline: "下划线",
      StrikeOut: "删除线",
      ScaleX: "横向缩放",
      ScaleY: "纵向缩放",
      Spacing: "间距",
      Angle: "角度",
      BorderStyle: "边框样式",
      Outline: "轮廓宽度",
      Shadow: "阴影深度",
      Blur: "模糊",
      Alignment: "对齐方式",
      Fade: "淡入淡出",
    };

    const 浮点数字段 = new Set(["Spacing", "Angle", "Outline", "Shadow"]);
    const 整数字段 = new Set(["Fontsize", "ScaleX", "ScaleY", "Blur"]);

    const 选项字段 = {
      Bold: { 选项: ["0", "-1"], 标签: ["关闭", "开启"] },
      Italic: { 选项: ["0", "-1"], 标签: ["关闭", "开启"] },
      Underline: { 选项: ["0", "-1"], 标签: ["关闭", "开启"] },
      StrikeOut: { 选项: ["0", "-1"], 标签: ["关闭", "开启"] },
      BorderStyle: { 选项: ["1", "3"], 标签: ["正常边框", "不透明背景"] },
      Alignment: {
        选项: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
        标签: ["左下", "中下", "右下", "左中", "中中", "右中", "左上", "中上", "右上"],
      },
    };

    const 表头行 = document.createElement("tr");
    表头行.className = "表头行";
    字段列表.forEach((字段) => {
      const 字段表头 = document.createElement("th");
      字段表头.className = "表头单元格 单元格";
      const 字段中文 = document.createElement("div");
      字段中文.className = "表头中文";
      字段中文.textContent = 字段映射[字段] || 字段;
      const 字段英文 = document.createElement("div");
      字段英文.className = "表头英文";
      字段英文.textContent = 字段 === "BackColour" ? "ShadowColour" : 字段;
      字段表头.appendChild(字段中文);
      字段表头.appendChild(字段英文);
      表头行.appendChild(字段表头);
    });
    表格.appendChild(表头行);

    const 数据行 = document.createElement("tr");
    数据行.className = "数据行 副字幕数据行";

    字段列表.forEach((字段) => {
      const 值 = 样式 && 样式[字段] !== undefined ? 样式[字段] : "";
      const 单元格 = document.createElement("td");
      单元格.className = "数据单元格 单元格";

      if (字段 === "PrimaryColour" || 字段 === "SecondaryColour" || 字段 === "OutlineColour" || 字段 === "BackColour") {
        const 包装div = document.createElement("div");
        包装div.className = "颜色选择器包装";

        const 颜色显示div = document.createElement("div");
        颜色显示div.className = "颜色显示文本";
        颜色显示div.dataset.字段 = 字段;
        颜色显示div.dataset.原始值 = 值;
        颜色显示div.dataset.副字幕 = "true";
        this.渲染颜色文本(颜色显示div, 值);

        包装div.appendChild(颜色显示div);
        单元格.appendChild(包装div);
      } else if (字段 === "Fade") {
        const 创建淡入淡出输入 = (默认值, 目标字段) => {
          const 包装div = document.createElement("div");
          包装div.className = "表格数字框包装";

          const 数字框容器 = document.createElement("div");
          数字框容器.className = "表格数字框容器";

          const 可编辑div = document.createElement("div");
          可编辑div.className = "表格数字框";
          可编辑div.contentEditable = "true";
          可编辑div.textContent = 默认值 ?? "0";
          可编辑div.dataset.字段 = 目标字段;
          可编辑div.dataset.副字幕 = "true";

          const 按钮组 = document.createElement("div");
          按钮组.className = "表格数字增减按钮组";

          const 更新值 = (增量) => {
            const 当前值 = parseInt(可编辑div.textContent) || 0;
            const 新值 = Math.max(0, 当前值 + 增量);
            可编辑div.textContent = 新值.toString();
            this.更新副字幕样式字段(目标字段, 新值.toString());
            if (this.自动保存) {
              this.保存文件();
            } else {
              this.文件已修改 = true;
              this.更新保存按钮状态();
            }
          };

          const 增加按钮 = document.createElement("div");
          增加按钮.className = "表格数字增减按钮";
          增加按钮.textContent = "+";
          增加按钮.addEventListener("click", () => 更新值(1));

          const 减少按钮 = document.createElement("div");
          减少按钮.className = "表格数字增减按钮";
          减少按钮.textContent = "-";
          减少按钮.addEventListener("click", () => 更新值(-1));

          const 处理输入 = () => {
            let 文本内容 = 可编辑div.textContent || "0";
            文本内容 = 文本内容.replace(/[^\d]/g, "");
            if (文本内容 === "") 文本内容 = "0";

            if (可编辑div.textContent !== 文本内容) {
              可编辑div.textContent = 文本内容;
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(可编辑div);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }

            this.更新副字幕样式字段(目标字段, 文本内容);
            if (this.自动保存) {
              this.保存文件();
            } else {
              this.文件已修改 = true;
              this.更新保存按钮状态();
            }
          };

          可编辑div.addEventListener("input", 处理输入);
          可编辑div.addEventListener("paste", (e) => {
            e.preventDefault();
            const 文本 = (e.clipboardData || window.clipboardData).getData("text") || "";
            const 过滤后 = 文本.replace(/[^\d]/g, "");
            this.插入文本到可编辑元素(可编辑div, 过滤后);
            处理输入();
          });

          可编辑div.addEventListener("blur", () => {
            if (!可编辑div.textContent || 可编辑div.textContent === "") {
              可编辑div.textContent = "0";
              this.更新副字幕样式字段(目标字段, "0");
            }
          });

          按钮组.appendChild(增加按钮);
          按钮组.appendChild(减少按钮);
          数字框容器.appendChild(可编辑div);
          数字框容器.appendChild(按钮组);
          包装div.appendChild(数字框容器);
          return 包装div;
        };

        const 淡入淡出容器 = document.createElement("div");
        淡入淡出容器.style.display = "flex";
        淡入淡出容器.style.gap = "8px";

        const 淡入 = 样式 && 样式.FadeIn !== undefined ? 样式.FadeIn : "0";
        const 淡出 = 样式 && 样式.FadeOut !== undefined ? 样式.FadeOut : "0";

        淡入淡出容器.appendChild(创建淡入淡出输入(淡入, "FadeIn"));
        淡入淡出容器.appendChild(创建淡入淡出输入(淡出, "FadeOut"));

        单元格.appendChild(淡入淡出容器);
      } else if (选项字段[字段]) {
        this.创建副字幕表格选项控件(单元格, 字段, 值, 选项字段[字段]);
      } else if (浮点数字段.has(字段)) {
        this.创建副字幕表格数字框(单元格, 字段, 值, 0.1);
      } else if (整数字段.has(字段)) {
        this.创建副字幕表格数字框(单元格, 字段, 值, 1);
      } else {
        this.创建副字幕表格文本框(单元格, 字段, 值);
      }

      数据行.appendChild(单元格);
    });

    表格.appendChild(数据行);
    表格容器.appendChild(表格);
    this.初始化列高亮(表格);
    return 表格容器;
  }

  构建覆盖字段列表(集合) {
    if (!集合 || 集合.size === 0) return [];
    const 顺序字段 = [
      "Fontname",
      "Fontsize",
      "PrimaryColour",
      "SecondaryColour",
      "OutlineColour",
      "BackColour",
      "Bold",
      "Italic",
      "Underline",
      "StrikeOut",
      "BorderStyle",
      "Outline",
      "Shadow",
      "Blur",
      "Alignment",
      "Pos",
      "Fade",
      "ScaleX",
      "ScaleY",
      "Spacing",
      "Angle",
      "MarginL",
      "MarginR",
      "MarginV",
    ];
    return 顺序字段.filter((f) => 集合.has(f));
  }

  创建主字幕样式表(样式, 字段列表, 分组索引) {
    const 表格容器 = document.createElement("div");
    表格容器.className = "样式表格容器 样式表格容器-主 副字幕样式表格容器";

    const 表格 = document.createElement("table");
    表格.className = "样式表格 主字幕样式表 副字幕样式表";

    const 字段映射 = {
      Fontname: "字体名称",
      Fontsize: "字体大小",
      PrimaryColour: "主要颜色",
      SecondaryColour: "次要颜色",
      OutlineColour: "轮廓颜色",
      BackColour: "背景颜色",
      Bold: "粗体",
      Italic: "斜体",
      Underline: "下划线",
      StrikeOut: "删除线",
      ScaleX: "横向缩放",
      ScaleY: "纵向缩放",
      Spacing: "间距",
      Angle: "角度",
      BorderStyle: "边框样式",
      Outline: "轮廓宽度",
      Shadow: "阴影深度",
      Blur: "模糊",
      Alignment: "对齐方式",
      MarginL: "左边距",
      MarginR: "右边距",
      MarginV: "垂直边距",
      Fade: "淡入淡出",
      Pos: "位置",
    };

    const 选项字段 = {
      Bold: { 选项: ["0", "-1"], 标签: ["关闭", "开启"] },
      Italic: { 选项: ["0", "-1"], 标签: ["关闭", "开启"] },
      Underline: { 选项: ["0", "-1"], 标签: ["关闭", "开启"] },
      StrikeOut: { 选项: ["0", "-1"], 标签: ["关闭", "开启"] },
      BorderStyle: { 选项: ["1", "3"], 标签: ["正常边框", "不透明背景"] },
      Alignment: {
        选项: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
        标签: ["左下", "中下", "右下", "左中", "中中", "右中", "左上", "中上", "右上"],
      },
    };

    const 浮点数字段 = new Set(["Spacing", "Angle", "Outline", "Shadow"]);
    const 整数字段 = new Set(["Fontsize", "ScaleX", "ScaleY", "MarginL", "MarginR", "MarginV", "Blur"]);

    const 表头行 = document.createElement("tr");
    表头行.className = "表头行";
    字段列表.forEach((字段) => {
      const th = document.createElement("th");
      th.className = "表头单元格 单元格";
      const 字段中文 = document.createElement("div");
      字段中文.className = "表头中文";
      字段中文.textContent = 字段映射[字段] || 字段;
      const 字段英文 = document.createElement("div");
      字段英文.className = "表头英文";
      字段英文.textContent = 字段;
      th.appendChild(字段中文);
      th.appendChild(字段英文);
      表头行.appendChild(th);
    });
    表格.appendChild(表头行);

    const 数据行 = document.createElement("tr");
    数据行.className = "数据行 主字幕数据行";

    字段列表.forEach((字段) => {
      const 值 = 样式 && 样式[字段] !== undefined ? 样式[字段] : "";
      const 单元格 = document.createElement("td");
      单元格.className = "数据单元格 单元格";

      if (字段 === "PrimaryColour" || 字段 === "SecondaryColour" || 字段 === "OutlineColour" || 字段 === "BackColour") {
        const 包装div = document.createElement("div");
        包装div.className = "颜色选择器包装";

        const 颜色显示div = document.createElement("div");
        颜色显示div.className = "颜色显示文本";
        颜色显示div.dataset.字段 = 字段;
        颜色显示div.dataset.原始值 = 值;
        颜色显示div.dataset.主字幕组 = 分组索引.toString();
        this.渲染颜色文本(颜色显示div, 值);

        包装div.appendChild(颜色显示div);
        单元格.appendChild(包装div);
      } else if (字段 === "Pos") {
        const 创建Pos输入 = (默认值, 轴字段) => {
          const 包装div = document.createElement("div");
          包装div.className = "表格数字框包装";

          const 容器 = document.createElement("div");
          容器.className = "表格数字框容器";

          const 可编辑 = document.createElement("div");
          可编辑.className = "表格数字框";
          可编辑.contentEditable = "true";
          可编辑.textContent = 默认值 || "";
          可编辑.dataset.字段 = 轴字段;

          const 按钮组 = document.createElement("div");
          按钮组.className = "表格数字增减按钮组";

          const 更新值 = (增量) => {
            const 当前值 = parseFloat(可编辑.textContent) || 0;
            const 新值 = (当前值 + 增量).toString();
            可编辑.textContent = 新值;
            this.更新主字幕样式字段(分组索引, 轴字段, 新值);
          };

          const 增加按钮 = document.createElement("div");
          增加按钮.className = "表格数字增减按钮";
          增加按钮.textContent = "+";
          增加按钮.addEventListener("click", () => 更新值(1));

          const 减少按钮 = document.createElement("div");
          减少按钮.className = "表格数字增减按钮";
          减少按钮.textContent = "-";
          减少按钮.addEventListener("click", () => 更新值(-1));

          const 处理输入 = () => {
            let 文本内容 = 可编辑.textContent || "";
            文本内容 = 文本内容.replace(/[^\d.-]/g, "");

            const 小数点索引 = 文本内容.indexOf(".");
            if (小数点索引 !== -1) {
              文本内容 = 文本内容.substring(0, 小数点索引 + 1) + 文本内容.substring(小数点索引 + 1).replace(/\./g, "");
            }

            if (文本内容.includes("-")) {
              const 负号位置 = 文本内容.indexOf("-");
              if (负号位置 !== 0) {
                文本内容 = "-" + 文本内容.replace(/-/g, "");
              } else {
                const 负号后内容 = 文本内容.substring(1).replace(/-/g, "");
                文本内容 = "-" + 负号后内容;
              }
            }

            if (可编辑.textContent !== 文本内容) {
              可编辑.textContent = 文本内容;
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(可编辑);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }

            this.更新主字幕样式字段(分组索引, 轴字段, 文本内容);
          };

          可编辑.addEventListener("input", 处理输入);
          可编辑.addEventListener("paste", (e) => {
            e.preventDefault();
            const 文本 = (e.clipboardData || window.clipboardData).getData("text");
            const 过滤后 = (文本 || "").replace(/[^\d.-]/g, "");
            this.插入文本到可编辑元素(可编辑, 过滤后);
            处理输入();
          });

          可编辑.addEventListener("blur", () => {
            const 文本内容 = 可编辑.textContent || "";
            if (!文本内容 || 文本内容 === "-") {
              可编辑.textContent = "0";
              this.更新主字幕样式字段(分组索引, 轴字段, "0");
            }
          });

          按钮组.appendChild(增加按钮);
          按钮组.appendChild(减少按钮);
          容器.appendChild(可编辑);
          容器.appendChild(按钮组);
          包装div.appendChild(容器);
          return 包装div;
        };

        const 数字框容器X = 创建Pos输入(样式.PosX, "PosX");
        const 数字框容器Y = 创建Pos输入(样式.PosY, "PosY");

        const pos包装 = document.createElement("div");
        pos包装.style.display = "flex";
        pos包装.style.gap = "8px";
        pos包装.appendChild(数字框容器X);
        pos包装.appendChild(数字框容器Y);

        单元格.appendChild(pos包装);
      } else if (字段 === "Fade") {
        const 创建淡入淡出输入 = (默认值, 目标字段) => {
          const 包装div = document.createElement("div");
          包装div.className = "表格数字框包装";

          const 容器 = document.createElement("div");
          容器.className = "表格数字框容器";

          const 可编辑 = document.createElement("div");
          可编辑.className = "表格数字框";
          可编辑.contentEditable = "true";
          可编辑.textContent = 默认值 ?? "0";
          可编辑.dataset.字段 = 目标字段;

          const 按钮组 = document.createElement("div");
          按钮组.className = "表格数字增减按钮组";

          const 更新值 = (增量) => {
            const 当前值 = parseInt(可编辑.textContent) || 0;
            const 新值 = Math.max(0, 当前值 + 增量);
            可编辑.textContent = 新值.toString();
            this.更新主字幕样式字段(分组索引, 目标字段, 新值.toString());
          };

          const 增加按钮 = document.createElement("div");
          增加按钮.className = "表格数字增减按钮";
          增加按钮.textContent = "+";
          增加按钮.addEventListener("click", () => 更新值(1));

          const 减少按钮 = document.createElement("div");
          减少按钮.className = "表格数字增减按钮";
          减少按钮.textContent = "-";
          减少按钮.addEventListener("click", () => 更新值(-1));

          const 处理输入 = () => {
            let 文本内容 = 可编辑.textContent || "0";
            文本内容 = 文本内容.replace(/[^\d]/g, "");
            if (文本内容 === "") 文本内容 = "0";

            if (可编辑.textContent !== 文本内容) {
              可编辑.textContent = 文本内容;
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(可编辑);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }

            this.更新主字幕样式字段(分组索引, 目标字段, 文本内容);
          };

          可编辑.addEventListener("input", 处理输入);
          可编辑.addEventListener("paste", (e) => {
            e.preventDefault();
            const 文本 = (e.clipboardData || window.clipboardData).getData("text") || "";
            const 过滤后 = 文本.replace(/[^\d]/g, "");
            this.插入文本到可编辑元素(可编辑, 过滤后);
            处理输入();
          });

          可编辑.addEventListener("blur", () => {
            if (!可编辑.textContent || 可编辑.textContent === "") {
              可编辑.textContent = "0";
              this.更新主字幕样式字段(分组索引, 目标字段, "0");
            }
          });

          按钮组.appendChild(增加按钮);
          按钮组.appendChild(减少按钮);
          容器.appendChild(可编辑);
          容器.appendChild(按钮组);
          包装div.appendChild(容器);
          return 包装div;
        };

        const 淡入淡出容器 = document.createElement("div");
        淡入淡出容器.style.display = "flex";
        淡入淡出容器.style.gap = "8px";

        const 淡入 = 样式 && 样式.FadeIn !== undefined ? 样式.FadeIn : "0";
        const 淡出 = 样式 && 样式.FadeOut !== undefined ? 样式.FadeOut : "0";

        淡入淡出容器.appendChild(创建淡入淡出输入(淡入, "FadeIn"));
        淡入淡出容器.appendChild(创建淡入淡出输入(淡出, "FadeOut"));

        单元格.appendChild(淡入淡出容器);
      } else if (选项字段[字段]) {
        const 配置 = 选项字段[字段];
        const 选项 = 配置.选项 || [];
        const 标签 = 配置.标签 || [];
        const 是双选 = 选项.length === 2;

        if (是双选) {
          const [关闭值, 开启值] = 选项;
          let 开启 = (值 || "").toString() === 开启值;

          const 滑块容器 = document.createElement("div");
          滑块容器.className = 字段 === "BorderStyle" ? "表格滑块容器 表格滑块容器-边框样式" : "表格滑块容器";

          const 滑块轨道 = document.createElement("div");
          滑块轨道.className = "表格滑块轨道";

          const 状态标签 = document.createElement("span");
          状态标签.className = "表格滑块标签";

          const 滑块按钮 = document.createElement("div");
          滑块按钮.className = "表格滑块按钮";

          const 更新滑块状态 = (新状态) => {
            开启 = 新状态;
            if (开启) {
              滑块轨道.classList.add("表格滑块轨道-开启");
              滑块轨道.classList.remove("表格滑块轨道-关闭");
              滑块按钮.classList.add("表格滑块按钮-开启");
              滑块按钮.classList.remove("表格滑块按钮-关闭");
              状态标签.classList.add("表格滑块标签-开启");
              状态标签.classList.remove("表格滑块标签-关闭");
            } else {
              滑块轨道.classList.add("表格滑块轨道-关闭");
              滑块轨道.classList.remove("表格滑块轨道-开启");
              滑块按钮.classList.add("表格滑块按钮-关闭");
              滑块按钮.classList.remove("表格滑块按钮-开启");
              状态标签.classList.add("表格滑块标签-关闭");
              状态标签.classList.remove("表格滑块标签-开启");
            }

            if (字段 === "BorderStyle") {
              const 当前值 = 开启 ? 开启值 : 关闭值;
              const 索引 = 选项.indexOf(当前值);
              状态标签.textContent = 标签 && 标签[索引] ? 标签[索引] : 当前值;
            } else {
              状态标签.textContent = 开启 ? "ON" : "OFF";
            }
          };

          滑块轨道.addEventListener("click", () => {
            const 新状态 = !开启;
            更新滑块状态(新状态);
            this.更新主字幕样式字段(分组索引, 字段, 新状态 ? 开启值 : 关闭值);
          });

          更新滑块状态(开启);

          滑块轨道.appendChild(状态标签);
          滑块轨道.appendChild(滑块按钮);
          滑块容器.appendChild(滑块轨道);
          单元格.appendChild(滑块容器);
        } else {
          const 下拉框 = document.createElement("select");
          下拉框.className = "表格下拉框";
          选项.forEach((opt, idx) => {
            const option元素 = document.createElement("option");
            option元素.value = opt;
            option元素.textContent = `${opt} (${标签[idx]})`;
            if (opt === (值 || "").toString()) option元素.selected = true;
            下拉框.appendChild(option元素);
          });
          下拉框.addEventListener("change", () => {
            this.更新主字幕样式字段(分组索引, 字段, 下拉框.value);
          });
          单元格.appendChild(下拉框);
        }
      } else if (浮点数字段.has(字段) || 整数字段.has(字段)) {
        const 包装div = document.createElement("div");
        包装div.className = "表格数字框包装";

        const 外容器 = document.createElement("div");
        外容器.className = "表格数字框容器";

        const div = document.createElement("div");
        div.className = "表格数字框";
        div.textContent = 值;
        div.contentEditable = "true";
        div.dataset.字段 = 字段;

        const 处理输入 = () => {
          let 文本内容 = div.textContent || "";
          文本内容 = 文本内容.replace(浮点数字段.has(字段) ? /[^\d.-]/g : /[^\d-]/g, "");

          if (浮点数字段.has(字段)) {
            const 小数点索引 = 文本内容.indexOf(".");
            if (小数点索引 !== -1) {
              文本内容 = 文本内容.substring(0, 小数点索引 + 1) + 文本内容.substring(小数点索引 + 1).replace(/\./g, "");
            }
          }

          if (文本内容.includes("-")) {
            const 负号位置 = 文本内容.indexOf("-");
            if (负号位置 !== 0) {
              文本内容 = "-" + 文本内容.replace(/-/g, "");
            } else {
              const 负号后内容 = 文本内容.substring(1).replace(/-/g, "");
              文本内容 = "-" + 负号后内容;
            }
          }

          if (div.textContent !== 文本内容) {
            div.textContent = 文本内容;
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(div);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          }

          this.更新主字幕样式字段(分组索引, 字段, 文本内容);
        };

        div.addEventListener("input", 处理输入);
        div.addEventListener("paste", (e) => {
          e.preventDefault();
          const 文本 = (e.clipboardData || window.clipboardData).getData("text");
          const 过滤后 = 文本.replace(浮点数字段.has(字段) ? /[^\d.-]/g : /[^\d-]/g, "");
          this.插入文本到可编辑元素(div, 过滤后);
          处理输入();
        });

        div.addEventListener("blur", () => {
          const 文本内容 = div.textContent || "";
          if (!文本内容 || 文本内容 === "-") {
            div.textContent = "0";
            this.更新主字幕样式字段(分组索引, 字段, "0");
          }
        });

        const 按钮组 = document.createElement("div");
        按钮组.className = "表格数字增减按钮组";

        const 更新值 = (增量) => {
          const 当前值 = parseFloat(div.textContent) || 0;
          const 新值 = (当前值 + 增量).toString();
          div.textContent = 新值;
          处理输入();
        };

        const 增加按钮 = document.createElement("div");
        增加按钮.className = "表格数字增减按钮";
        增加按钮.textContent = "+";
        增加按钮.addEventListener("click", () => 更新值(1));

        const 减少按钮 = document.createElement("div");
        减少按钮.className = "表格数字增减按钮";
        减少按钮.textContent = "-";
        减少按钮.addEventListener("click", () => 更新值(-1));

        按钮组.appendChild(增加按钮);
        按钮组.appendChild(减少按钮);

        外容器.appendChild(div);
        外容器.appendChild(按钮组);
        包装div.appendChild(外容器);
        单元格.appendChild(包装div);
      } else {
        const div = document.createElement("div");
        div.className = "表格输入框";
        div.textContent = 值;
        div.contentEditable = "true";
        div.dataset.字段 = 字段;

        const 处理输入 = () => {
          const 文本内容 = div.textContent || "";
          this.更新主字幕样式字段(分组索引, 字段, 文本内容);
        };

        div.addEventListener("input", 处理输入);
        div.addEventListener("paste", (e) => {
          e.preventDefault();
          const 文本 = (e.clipboardData || window.clipboardData).getData("text");
          if (文本 !== undefined && 文本 !== null) {
            div.textContent = 文本;
          }
          处理输入();
        });
        div.addEventListener("blur", () => {
          if (div.textContent === null) {
            div.textContent = "";
          }
          处理输入();
        });

        单元格.appendChild(div);
      }

      数据行.appendChild(单元格);
    });

    表格.appendChild(数据行);
    表格容器.appendChild(表格);
    this.初始化列高亮(表格);
    return 表格容器;
  }

  创建副字幕表格文本框(容器, 字段, 值) {
    const 包装div = document.createElement("div");
    包装div.className = "表格输入框包装";

    const 可编辑div = document.createElement("div");
    可编辑div.className = "表格输入框";
    可编辑div.contentEditable = "true";
    可编辑div.textContent = 值 || "";
    可编辑div.dataset.字段 = 字段;
    可编辑div.dataset.副字幕 = "true";

    const 处理输入 = () => {
      this.更新副字幕样式字段(字段, 可编辑div.textContent || "");
      if (this.自动保存) {
        this.保存文件();
      } else {
        this.文件已修改 = true;
        this.更新保存按钮状态();
      }
    };

    可编辑div.addEventListener("input", 处理输入);
    可编辑div.addEventListener("paste", (e) => {
      e.preventDefault();
      const 文本 = (e.clipboardData || window.clipboardData).getData("text");
      if (文本 !== undefined && 文本 !== null) {
        可编辑div.textContent = 文本;
      }
      处理输入();
    });

    可编辑div.addEventListener("blur", () => {
      if (可编辑div.textContent === null || 可编辑div.textContent === "") {
        可编辑div.textContent = "";
        处理输入();
      }
    });

    包装div.appendChild(可编辑div);
    容器.appendChild(包装div);
  }

  创建副字幕表格数字框(容器, 字段, 值, 步进值 = 1) {
    const 包装div = document.createElement("div");
    包装div.className = "表格数字框包装";

    const 数字框容器 = document.createElement("div");
    数字框容器.className = "表格数字框容器";

    const 可编辑div = document.createElement("div");
    可编辑div.className = "表格数字框";
    可编辑div.contentEditable = "true";
    可编辑div.textContent = 值 || "0";
    可编辑div.dataset.字段 = 字段;
    可编辑div.dataset.副字幕 = "true";

    const 按钮组 = document.createElement("div");
    按钮组.className = "表格数字增减按钮组";

    const 更新数值 = (新值) => {
      const 显示值 = 步进值 >= 1 ? Math.round(新值) : parseFloat(新值.toFixed(1));
      可编辑div.textContent = 显示值.toString();
      处理输入();
    };

    const 增加按钮 = document.createElement("div");
    增加按钮.className = "表格数字增减按钮";
    增加按钮.textContent = "+";
    增加按钮.addEventListener("click", () => {
      const 当前值 = parseFloat(可编辑div.textContent) || 0;
      更新数值(当前值 + 步进值);
    });

    const 减少按钮 = document.createElement("div");
    减少按钮.className = "表格数字增减按钮";
    减少按钮.textContent = "-";
    减少按钮.addEventListener("click", () => {
      const 当前值 = parseFloat(可编辑div.textContent) || 0;
      更新数值(当前值 - 步进值);
    });

    const 处理输入 = () => {
      let 文本内容 = 可编辑div.textContent || "";

      if (步进值 < 1) {
        文本内容 = 文本内容.replace(/[^\d.-]/g, "");

        const 小数点索引 = 文本内容.indexOf(".");
        if (小数点索引 !== -1) {
          文本内容 = 文本内容.substring(0, 小数点索引 + 1) + 文本内容.substring(小数点索引 + 1).replace(/\./g, "");
        }
      } else {
        文本内容 = 文本内容.replace(/[^\d-]/g, "");
      }

      if (文本内容.includes("-")) {
        const 负号位置 = 文本内容.indexOf("-");
        if (负号位置 !== 0) {
          文本内容 = "-" + 文本内容.replace(/-/g, "");
        } else {
          const 负号后内容 = 文本内容.substring(1).replace(/-/g, "");
          文本内容 = "-" + 负号后内容;
        }
      }

      if (可编辑div.textContent !== 文本内容) {
        可编辑div.textContent = 文本内容;
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(可编辑div);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      this.更新副字幕样式字段(字段, 文本内容);
      if (this.自动保存) {
        this.保存文件();
      } else {
        this.文件已修改 = true;
        this.更新保存按钮状态();
      }
    };

    可编辑div.addEventListener("input", 处理输入);
    可编辑div.addEventListener("paste", (e) => {
      e.preventDefault();
      const 文本 = (e.clipboardData || window.clipboardData).getData("text");

      let 数字文本;
      if (步进值 < 1) {
        数字文本 = 文本.replace(/[^\d.-]/g, "");

        const 小数点索引 = 数字文本.indexOf(".");
        if (小数点索引 !== -1) {
          数字文本 = 数字文本.substring(0, 小数点索引 + 1) + 数字文本.substring(小数点索引 + 1).replace(/\./g, "");
        }
      } else {
        数字文本 = 文本.replace(/[^\d-]/g, "");
      }

      if (数字文本.includes("-")) {
        const 负号位置 = 数字文本.indexOf("-");
        if (负号位置 !== 0) {
          数字文本 = "-" + 数字文本.replace(/-/g, "");
        } else {
          数字文本 = "-" + 数字文本.substring(1).replace(/-/g, "");
        }
      }
      this.插入文本到可编辑元素(可编辑div, 数字文本);
    });

    可编辑div.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        可编辑div.blur();
        return;
      }
      if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "Tab" ||
        (e.ctrlKey && (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x"))
      ) {
        return;
      }

      if (/^\d$/.test(e.key)) {
        return;
      }

      if (步进值 < 1 && e.key === ".") {
        const 当前文本 = 可编辑div.textContent || "";
        if (!当前文本.includes(".")) {
          return;
        }
        e.preventDefault();
        return;
      }

      if (e.key === "-") {
        const 当前文本 = 可编辑div.textContent || "";
        const 选择 = window.getSelection();
        if (选择.rangeCount > 0) {
          const range = 选择.getRangeAt(0);
          if (range.startOffset === 0 && range.endOffset === 可编辑div.textContent.length) {
            return;
          }
          if (range.startOffset === 0 && range.endOffset === 0 && !当前文本.startsWith("-")) {
            return;
          }
        }
        e.preventDefault();
        return;
      }

      e.preventDefault();
    });

    可编辑div.addEventListener("blur", () => {
      const 文本内容 = 可编辑div.textContent.trim();
      if (!文本内容 || 文本内容 === "" || 文本内容 === "-") {
        可编辑div.textContent = "0";
        this.更新副字幕样式字段(字段, "0");
        if (this.自动保存) {
          this.保存文件();
        } else {
          this.文件已修改 = true;
          this.更新保存按钮状态();
        }
      }
    });

    按钮组.appendChild(增加按钮);
    按钮组.appendChild(减少按钮);
    数字框容器.appendChild(可编辑div);
    数字框容器.appendChild(按钮组);
    包装div.appendChild(数字框容器);
    容器.appendChild(包装div);
  }

  创建副字幕表格选项控件(容器, 字段, 值, 选项配置) {
    const 包装div = document.createElement("div");
    包装div.className = "表格输入框包装";

    const { 选项, 标签 } = 选项配置;
    const 当前值原始 = 值 !== undefined && 值 !== null ? 值.toString().trim() : "";
    const 当前值 = 当前值原始 === "" ? "" : Number(当前值原始) === 0 ? "0" : "1";

    const 是开关类型 =
      选项.length === 2 &&
      选项.includes("0") &&
      (选项.includes("-1") || 选项.includes("1")) &&
      标签 &&
      标签.includes("关闭") &&
      标签.includes("开启");
    const 是边框样式类型 = 选项.length === 2 && 选项.includes("1") && 选项.includes("3") && 字段 === "BorderStyle";
    const 使用滑块 = 是开关类型 || 是边框样式类型;

    if (选项.length > 2) {
      const 下拉框 = document.createElement("select");
      下拉框.className = "表格下拉框";
      下拉框.dataset.字段 = 字段;
      下拉框.dataset.副字幕 = "true";

      for (let i = 0; i < 选项.length; i++) {
        const 选项值 = 选项[i];
        const 选项标签 = 标签 && 标签[i] ? 标签[i] : 选项值;
        const option元素 = document.createElement("option");
        option元素.value = 选项值;
        option元素.textContent = `${选项值} (${选项标签})`;
        if (当前值 === 选项值) {
          option元素.selected = true;
        }
        下拉框.appendChild(option元素);
      }

      下拉框.addEventListener("change", () => {
        const 选中值 = 下拉框.value;
        this.更新副字幕样式字段(字段, 选中值);
        if (this.自动保存) {
          this.保存文件();
        } else {
          this.文件已修改 = true;
          this.更新保存按钮状态();
        }
      });

      包装div.appendChild(下拉框);
    } else if (使用滑块) {
      const 滑块容器 = document.createElement("div");
      滑块容器.className = 是边框样式类型 ? "表格滑块容器 表格滑块容器-边框样式" : "表格滑块容器";

      const 滑块轨道 = document.createElement("div");
      滑块轨道.className = "表格滑块轨道";

      let 关闭值, 开启值;
      if (是开关类型) {
        关闭值 = "0";
        开启值 = "1";
      } else if (是边框样式类型) {
        关闭值 = "1";
        开启值 = "3";
      }
      let 开启 = 当前值 === 开启值;

      const 滑块按钮 = document.createElement("div");
      滑块按钮.className = "表格滑块按钮";

      const 状态标签 = document.createElement("span");
      状态标签.className = "表格滑块标签";

      const 更新滑块状态 = (新状态) => {
        开启 = 新状态;

        if (开启) {
          滑块轨道.classList.add("表格滑块轨道-开启");
          滑块轨道.classList.remove("表格滑块轨道-关闭");
          滑块按钮.classList.add("表格滑块按钮-开启");
          滑块按钮.classList.remove("表格滑块按钮-关闭");
          状态标签.classList.add("表格滑块标签-开启");
          状态标签.classList.remove("表格滑块标签-关闭");
        } else {
          滑块轨道.classList.add("表格滑块轨道-关闭");
          滑块轨道.classList.remove("表格滑块轨道-开启");
          滑块按钮.classList.add("表格滑块按钮-关闭");
          滑块按钮.classList.remove("表格滑块按钮-开启");
          状态标签.classList.add("表格滑块标签-关闭");
          状态标签.classList.remove("表格滑块标签-开启");
        }

        if (是开关类型) {
          状态标签.textContent = 开启 ? "ON" : "OFF";
        } else if (是边框样式类型) {
          const 当前值 = 开启 ? "3" : "1";
          const 当前值索引 = 选项.indexOf(当前值);
          状态标签.textContent = 标签 && 标签[当前值索引] ? 标签[当前值索引] : 当前值;
        }
      };

      更新滑块状态(当前值 === 开启值);

      滑块轨道.appendChild(状态标签);
      滑块轨道.appendChild(滑块按钮);

      滑块轨道.addEventListener("click", () => {
        const 新状态 = !开启;
        更新滑块状态(新状态);
        const 新值 = 新状态 ? 开启值 : 关闭值;
        this.更新副字幕样式字段(字段, 新值);
        if (this.自动保存) {
          this.保存文件();
        } else {
          this.文件已修改 = true;
          this.更新保存按钮状态();
        }
      });

      滑块容器.appendChild(滑块轨道);
      包装div.appendChild(滑块容器);
    } else {
      const 选项组 = document.createElement("div");
      选项组.className = "单选框组";

      for (let i = 0; i < 选项.length; i++) {
        const 选项值 = 选项[i];
        const 选项标签 = 标签 && 标签[i] ? 标签[i] : 选项值;

        const 选项项 = document.createElement("div");
        选项项.className = "单选框项";

        const 单选框 = document.createElement("input");
        单选框.type = "radio";
        单选框.name = `副字幕_${字段}`;
        单选框.value = 选项值;
        单选框.checked = 当前值 === 选项值;
        单选框.dataset.字段 = 字段;
        单选框.dataset.副字幕 = "true";

        单选框.addEventListener("change", () => {
          if (单选框.checked) {
            this.更新副字幕样式字段(字段, 选项值);
            if (this.自动保存) {
              this.保存文件();
            } else {
              this.文件已修改 = true;
              this.更新保存按钮状态();
            }
          }
        });

        const 标签元素 = document.createElement("label");
        标签元素.textContent = 选项标签;

        选项项.appendChild(单选框);
        选项项.appendChild(标签元素);
        选项组.appendChild(选项项);
      }

      包装div.appendChild(选项组);
    }

    容器.appendChild(包装div);
  }

  构建基础样式(样式名, 样式映射, 默认样式) {
    const 基础 = { ...默认样式 };
    if (样式名 && 样式映射[样式名]) {
      Object.assign(基础, 样式映射[样式名]);
    }
    return 基础;
  }

  更新副字幕样式字段(字段, 新值) {
    if (!this.副字幕统一样式) return;
    this.副字幕统一样式[字段] = 新值;
    if (this.副字幕已编辑字段) {
      this.副字幕已编辑字段.add(字段);
    }
    this.应用副字幕样式到文件();
  }

  更新主字幕样式字段(分组索引, 字段, 新值) {
    if (!this.主字幕分组列表 || !this.主字幕分组列表[分组索引]) return;
    const 组 = this.主字幕分组列表[分组索引];
    if (!组.样式) {
      组.样式 = {};
    }

    if (字段 === "PosX" || 字段 === "PosY") {
      组.样式[字段] = 新值;
    } else {
      组.样式[字段] = 新值;
    }

    this.应用主字幕样式组到文件(分组索引);

    if (this.自动保存) {
      this.保存文件();
    } else {
      this.文件已修改 = true;
      this.更新保存按钮状态();
    }
  }

  构建样式映射() {
    const 映射 = {};
    const 行 = this.文件数据["[V4+ Styles]"];
    if (!行 || 行.length === 0) return 映射;

    const 格式行 = 行.find((内容) => 内容.startsWith("Format:"));
    if (!格式行) return 映射;

    const 字段列表 = 格式行
      .replace(/^Format:/i, "")
      .split(",")
      .map((字段) => 字段.trim());

    const 样式行 = 行.filter((内容) => 内容.startsWith("Style:"));
    样式行.forEach((样式内容, 索引) => {
      const 属性 = this.解析属性行(样式内容);
      if (!属性) return;

      const 值列表 = 属性.值.split(",");
      const 样式数据 = {};
      字段列表.forEach((字段, 字段索引) => {
        样式数据[字段] = 值列表[字段索引] ? 值列表[字段索引].trim() : "";
      });

      const 样式名 = 样式数据.Name || `Style ${索引 + 1}`;
      映射[样式名] = 样式数据;
    });

    return 映射;
  }

  解析事件行(行内容, 字段列表, 文本索引) {
    const 冒号索引 = 行内容.indexOf(":");
    if (冒号索引 === -1) return null;

    const 值串 = 行内容.substring(冒号索引 + 1).trim();
    const 分段 = 值串.split(",");

    if (分段.length < 字段列表.length) {
      return null;
    }

    const 值列表 = [];
    for (let i = 0; i < 字段列表.length; i++) {
      if (i === 文本索引) {
        值列表.push(分段.slice(i).join(",").trim());
        break;
      } else {
        值列表.push((分段[i] || "").trim());
      }
    }

    const 映射 = {};
    for (let i = 0; i < 字段列表.length && i < 值列表.length; i++) {
      映射[字段列表[i]] = 值列表[i];
    }

    return 映射;
  }

  解析副字幕样式(副文本, 基础样式) {
    const 样式 = { ...基础样式 };
    if (!副文本) return 样式;

    // 支持连续多个覆盖块（{...}{...}），逐一拆解后再解析所有标签
    let 副剩余 = 副文本;
    const 标签列表 = [];
    while (true) {
      const 覆盖匹配 = 副剩余.match(/^\{([^}]*)\}/);
      if (!覆盖匹配) break;
      const 覆盖块 = 覆盖匹配[0];
      const 块标签 = this.拆分覆盖标签(覆盖块);
      块标签.forEach((片段) => {
        const 去除反斜杠 = 片段.startsWith("\\") ? 片段.substring(1) : 片段;
        if (去除反斜杠) {
          标签列表.push(去除反斜杠);
        }
      });
      副剩余 = 副剩余.substring(覆盖块.length);
    }

    if (标签列表.length === 0) return 样式;

    let 全局Alpha = null;
    const 局部Alpha = {};
    const 颜色通道映射 = { 1: "PrimaryColour", 2: "SecondaryColour", 3: "OutlineColour", 4: "BackColour" };

    const 设置粗细标记 = (键, 值) => {
      const 数值 = Number(值);
      样式[键] = 数值 === 0 ? "0" : "1";
    };

    标签列表.forEach((标签) => {
      const 标签小写 = 标签.toLowerCase();

      if (标签小写.startsWith("t(")) {
        return; // 时间函数暂不处理
      }

      if (标签小写.startsWith("fad(")) {
        const 淡入淡出匹配 = 标签.match(/^fad\(([^,]*),([^)]+)\)/i);
        if (淡入淡出匹配) {
          样式.FadeIn = (淡入淡出匹配[1] || "0").trim();
          样式.FadeOut = (淡入淡出匹配[2] || "0").trim();
        }
        return;
      }

      if (标签.startsWith("fn")) {
        const 字体 = 标签.substring(2).trim();
        if (字体) {
          样式.Fontname = 字体;
        }
        return;
      }

      if (标签.startsWith("fscx")) {
        const 值 = 标签.substring(4).trim();
        if (值) {
          样式.ScaleX = 值;
        }
        return;
      }

      if (标签.startsWith("fscy")) {
        const 值 = 标签.substring(4).trim();
        if (值) {
          样式.ScaleY = 值;
        }
        return;
      }

      if (标签.startsWith("fs") && !标签.startsWith("fsc")) {
        const 字号 = 标签.substring(2).trim();
        if (字号) {
          样式.Fontsize = 字号;
        }
        return;
      }

      const 色匹配 = 标签.match(/^(?:([1234])c|c)&H([0-9A-Fa-f]{6,8})/);
      if (色匹配) {
        const 通道 = 色匹配[1] || "1";
        const 颜色键 = 颜色通道映射[通道];
        if (颜色键) {
          样式[颜色键] = this.标准化ASS颜色值(色匹配[2], 样式[颜色键]);
        }
        return;
      }

      const 局部透明匹配 = 标签.match(/^([1234])a&H([0-9A-Fa-f]{2})/);
      if (局部透明匹配) {
        const 颜色键 = 颜色通道映射[局部透明匹配[1]];
        if (颜色键) {
          局部Alpha[颜色键] = 局部透明匹配[2];
        }
        return;
      }

      const 主通道透明匹配 = 标签.match(/^ca&H([0-9A-Fa-f]{2})/);
      if (主通道透明匹配) {
        局部Alpha.PrimaryColour = 主通道透明匹配[1];
        return;
      }

      const 全局透明匹配 = 标签.match(/^alpha&H([0-9A-Fa-f]{2})/);
      if (全局透明匹配) {
        全局Alpha = 全局透明匹配[1];
        return;
      }

      if (标签.startsWith("pos")) {
        const 坐标匹配 = 标签.match(/^pos\(([^,]+),([^\)]+)\)/i);
        if (坐标匹配) {
          样式.PosX = 坐标匹配[1].trim();
          样式.PosY = 坐标匹配[2].trim();
        }
        return;
      }

      if (标签.startsWith("fsp")) {
        const 值 = 标签.substring(3).trim();
        if (值) {
          样式.Spacing = 值;
        }
        return;
      }

      if (标签.startsWith("frz")) {
        const 值 = 标签.substring(3).trim();
        if (值) {
          样式.Angle = 值;
        }
        return;
      }

      if (标签.startsWith("bord")) {
        const 值 = 标签.substring(4).trim();
        if (值) {
          样式.Outline = 值;
        }
        return;
      }

      if (标签.startsWith("shad")) {
        const 值 = 标签.substring(4).trim();
        if (值) {
          样式.Shadow = 值;
        }
        return;
      }

      if (标签.startsWith("blur")) {
        const 值 = 标签.substring(4).trim();
        if (值) {
          样式.Blur = 值;
        }
        return;
      }

      if (标签.startsWith("an")) {
        const 值 = Number(标签.substring(2));
        if (!Number.isNaN(值)) {
          样式.Alignment = 值.toString();
        }
        return;
      }

      if (标签.startsWith("a") && !标签.startsWith("alpha")) {
        const 旧对齐 = Number(标签.substring(1));
        if (!Number.isNaN(旧对齐)) {
          样式.Alignment = this.转换SSA对齐到ASS(旧对齐).toString();
        }
        return;
      }

      const 粗体匹配 = 标签.match(/^b(-?\d+)/);
      if (粗体匹配 && !标签.startsWith("blur")) {
        设置粗细标记("Bold", 粗体匹配[1]);
        return;
      }

      const 斜体匹配 = 标签.match(/^i(-?\d+)/);
      if (斜体匹配) {
        设置粗细标记("Italic", 斜体匹配[1]);
        return;
      }

      const 下划线匹配 = 标签.match(/^u(-?\d+)/);
      if (下划线匹配) {
        设置粗细标记("Underline", 下划线匹配[1]);
        return;
      }

      const 删除线匹配 = 标签.match(/^s(-?\d+)/);
      if (删除线匹配) {
        设置粗细标记("StrikeOut", 删除线匹配[1]);
      }
    });

    if (全局Alpha) {
      样式.PrimaryColour = this.更新颜色Alpha(样式.PrimaryColour, 全局Alpha);
      样式.SecondaryColour = this.更新颜色Alpha(样式.SecondaryColour, 全局Alpha);
      样式.OutlineColour = this.更新颜色Alpha(样式.OutlineColour, 全局Alpha);
      样式.BackColour = this.更新颜色Alpha(样式.BackColour, 全局Alpha);
    } else {
      for (const [键, 值] of Object.entries(局部Alpha)) {
        样式[键] = this.更新颜色Alpha(样式[键], 值);
      }
    }

    return 样式;
  }

  提取副字幕样式引用(副文本) {
    if (!副文本) return null;
    // 仅包含一个 \r 样式引用且无其它覆盖标签时，认定为纯样式引用
    const 覆盖匹配 = 副文本.match(/^\{\s*\\r\s*([^\\}]*?)\s*\}([\s\S]*)$/i);
    if (!覆盖匹配) return null;

    const 样式名 = (覆盖匹配[1] || "").trim();
    if (!样式名) return null;

    const 覆盖内容 = 覆盖匹配[0].replace(/[{}]/g, "");
    const 剩余覆盖 = 覆盖内容.replace(/^\s*\\r[^\\]*/i, "");
    if (/\\/.test(剩余覆盖)) return null;

    const 剩余文本 = (覆盖匹配[2] || "").trim();
    if (/\{\s*\\/.test(剩余文本)) return null;

    return 样式名;
  }

  提取副字幕覆盖字段集合(副文本) {
    const 集合 = new Set();
    if (!副文本) return 集合;

    let 剩余 = 副文本;
    while (true) {
      const 匹配 = 剩余.match(/^\{[^}]*\}/);
      if (!匹配) break;
      const 覆盖块 = 匹配[0];
      this.提取覆盖字段集合(覆盖块).forEach((f) => 集合.add(f));
      剩余 = 剩余.substring(覆盖块.length);
    }

    return 集合;
  }

  标准化ASS颜色值(颜色值, 默认值) {
    const 默认颜色 = 默认值 || "&H00FFFFFF";
    if (!颜色值) return 默认颜色;

    const 提取 = 颜色值
      .replace(/^&H/i, "")
      .replace(/[^0-9A-Fa-f]/g, "")
      .toUpperCase();
    if (提取.length === 6) {
      return `&H00${提取}`;
    }
    if (提取.length === 8) {
      return `&H${提取}`;
    }
    return 默认颜色;
  }

  更新颜色Alpha(颜色值, alphaHex) {
    const 基础色 = this.标准化ASS颜色值(颜色值, this.ASS标准默认样式.PrimaryColour);
    const 有效Alpha = (alphaHex || "00")
      .replace(/[^0-9A-Fa-f]/g, "")
      .toUpperCase()
      .padStart(2, "0")
      .slice(-2);
    const 色值 = 基础色.replace(/^&H/i, "");
    const 颜色部分 = 色值.substring(2);
    return `&H${有效Alpha}${颜色部分}`;
  }

  提取Alpha(颜色值) {
    const 规范 = this.标准化ASS颜色值(颜色值, this.ASS标准默认样式.PrimaryColour);
    const 色值 = 规范.replace(/^&H/i, "");
    return 色值.substring(0, 2).toUpperCase();
  }

  提取色RGB部分(颜色值) {
    const 规范 = this.标准化ASS颜色值(颜色值, this.ASS标准默认样式.PrimaryColour);
    const 色值 = 规范.replace(/^&H/i, "");
    return 色值.substring(2).toUpperCase();
  }

  转换SSA对齐到ASS(旧对齐) {
    const 映射 = {
      1: 1,
      2: 2,
      3: 3,
      5: 7,
      6: 8,
      7: 9,
      9: 4,
      10: 5,
      11: 6,
    };
    return 映射[旧对齐] || 2;
  }

  创建ASS标准默认样式() {
    return {
      Name: "Default",
      Fontname: "Arial",
      Fontsize: "20",
      PrimaryColour: "&H00FFFFFF",
      SecondaryColour: "&H000000FF",
      OutlineColour: "&H00000000",
      BackColour: "&H00000000",
      Bold: "0",
      Italic: "0",
      Underline: "0",
      StrikeOut: "0",
      ScaleX: "100",
      ScaleY: "100",
      Spacing: "0",
      Angle: "0",
      BorderStyle: "1",
      Outline: "2",
      Shadow: "2",
      Blur: "0",
      Alignment: "2",
      MarginL: "10",
      MarginR: "10",
      MarginV: "10",
      Encoding: "1",
      FadeIn: "0",
      FadeOut: "0",
    };
  }

  获取副字幕字段标准默认样式() {
    const 基线 = this.ASS标准默认样式 || this.创建ASS标准默认样式();
    const 目标字段 = [
      "Fontname",
      "Fontsize",
      "PrimaryColour",
      "SecondaryColour",
      "OutlineColour",
      "BackColour",
      "Bold",
      "Italic",
      "Underline",
      "StrikeOut",
      "BorderStyle",
      "Outline",
      "Shadow",
      "Blur",
      "Alignment",
      "FadeIn",
      "FadeOut",
      "ScaleX",
      "ScaleY",
      "Spacing",
      "Angle",
    ];

    const 样式 = {};
    目标字段.forEach((字段) => {
      样式[字段] = 基线[字段] !== undefined ? 基线[字段] : "";
    });

    return 样式;
  }

  生成副字幕覆盖标签(当前样式, 基线样式, 强制字段集 = new Set()) {
    const 基线 = 基线样式 || this.ASS标准默认样式;
    const 当前 = 当前样式 || {};
    const 标签 = [];

    const 应输出 = (键, 判定 = () => 当前[键] !== 基线[键]) => {
      return (强制字段集 && 强制字段集.has(键)) || 判定();
    };

    const 追加 = (值, 构造, 键) => {
      if (值 === undefined || 值 === null) return;
      if (!应输出(键, () => 构造 === 构造 && 当前[键] !== 基线[键])) return;
      const 结果 = 构造(值);
      if (结果) 标签.push(结果);
    };

    if (应输出("Fontname")) 追加(当前.Fontname, (v) => `\\fn${v}`, "Fontname");
    if (应输出("Fontsize")) 追加(当前.Fontsize, (v) => `\\fs${v}`, "Fontsize");

    const 色键 = [
      ["PrimaryColour", "c"],
      ["SecondaryColour", "2c"],
      ["OutlineColour", "3c"],
      ["BackColour", "4c"],
    ];

    色键.forEach(([键, 标记]) => {
      const 当前色 = this.标准化ASS颜色值(当前[键], 基线[键]);
      const 基线色 = this.标准化ASS颜色值(基线[键], 基线[键]);
      if (!应输出(键, () => 当前色 !== 基线色)) return;
      const rgb = this.提取色RGB部分(当前色);
      标签.push(`\\${标记}&H${rgb}`);

      const 当前Alpha = this.提取Alpha(当前色);
      const 基线Alpha = this.提取Alpha(基线色);
      const 需要输出Alpha = 当前Alpha !== 基线Alpha; // 仅在透明度实际不同才输出，避免无谓的 \ca/\3a/\4a
      if (需要输出Alpha) {
        标签.push(`\\${标记[0]}a&H${当前Alpha}`);
      }
    });

    const 规范开关值 = (值) => (Number(值) === 0 ? "0" : "1");

    const 简单双态 = [
      ["Bold", "b"],
      ["Italic", "i"],
      ["Underline", "u"],
      ["StrikeOut", "s"],
    ];

    简单双态.forEach(([键, 标记]) => {
      if (!应输出(键)) return;
      标签.push(`\\${标记}${规范开关值(当前[键])}`);
    });

    if (应输出("ScaleX")) 追加(当前.ScaleX, (v) => `\\fscx${v}`, "ScaleX");
    if (应输出("ScaleY")) 追加(当前.ScaleY, (v) => `\\fscy${v}`, "ScaleY");
    if (应输出("Spacing")) 追加(当前.Spacing, (v) => `\\fsp${v}`, "Spacing");
    if (应输出("Angle")) 追加(当前.Angle, (v) => `\\frz${v}`, "Angle");
    if (应输出("Outline")) 追加(当前.Outline, (v) => `\\bord${v}`, "Outline");
    if (应输出("Shadow")) 追加(当前.Shadow, (v) => `\\shad${v}`, "Shadow");
    if (应输出("Blur")) 追加(当前.Blur, (v) => `\\blur${v}`, "Blur");
    if (应输出("Alignment")) 追加(当前.Alignment, (v) => `\\an${v}`, "Alignment");

    const 淡入基线 = 基线.FadeIn ?? "0";
    const 淡出基线 = 基线.FadeOut ?? "0";
    const 淡入当前 = 当前.FadeIn ?? 淡入基线;
    const 淡出当前 = 当前.FadeOut ?? 淡出基线;
    const fade已编辑 =
      (强制字段集 && (强制字段集.has("Fade") || 强制字段集.has("FadeIn") || 强制字段集.has("FadeOut"))) || false;
    const fade不同 = 淡入当前 !== 淡入基线 || 淡出当前 !== 淡出基线;
    if (fade不同 || fade已编辑) {
      标签.push(`\\fad(${淡入当前 || 0},${淡出当前 || 0})`);
    }

    return 标签.length > 0 ? `{${标签.join("")}}` : "";
  }

  生成主字幕覆盖标签(当前样式, 基线样式, 字段列表) {
    const 基线 = 基线样式 || this.ASS标准默认样式;
    const 当前 = 当前样式 || {};
    const 标签 = [];
    const 字段集 = new Set(字段列表 || []);

    const 有字段 = (键) => 字段集.has(键);

    if (有字段("Fontname") && 当前.Fontname !== undefined && 当前.Fontname !== 基线.Fontname) {
      标签.push(`\\fn${当前.Fontname}`);
    }

    if (有字段("Fontsize") && 当前.Fontsize !== undefined && 当前.Fontsize !== 基线.Fontsize) {
      标签.push(`\\fs${当前.Fontsize}`);
    }

    const 处理颜色 = (键, 标记) => {
      if (!有字段(键)) return;
      const 当前色 = this.标准化ASS颜色值(当前[键], 基线[键]);
      const 基线色 = this.标准化ASS颜色值(基线[键], 基线[键]);
      if (当前色 !== 基线色) {
        const rgb = this.提取色RGB部分(当前色);
        标签.push(`\\${标记}&H${rgb}`);

        const 当前Alpha = this.提取Alpha(当前色);
        const 基线Alpha = this.提取Alpha(基线色);
        if (当前Alpha !== 基线Alpha) {
          标签.push(`\\${标记[0]}a&H${当前Alpha}`);
        }
      }
    };

    处理颜色("PrimaryColour", "c");
    处理颜色("SecondaryColour", "2c");
    处理颜色("OutlineColour", "3c");
    处理颜色("BackColour", "4c");

    const 规范开关值 = (值) => (Number(值) === 0 ? "0" : "1");

    const 简单双态 = [
      ["Bold", "b"],
      ["Italic", "i"],
      ["Underline", "u"],
      ["StrikeOut", "s"],
    ];

    简单双态.forEach(([键, 标记]) => {
      if (!有字段(键)) return;
      if (当前[键] !== undefined && 当前[键] !== 基线[键]) {
        标签.push(`\\${标记}${规范开关值(当前[键])}`);
      }
    });

    const 处理差异 = (键, 构造) => {
      if (!有字段(键)) return;
      const 当前值 = 当前[键];
      const 基线值 = 基线[键];
      if (当前值 === undefined) return;
      if (当前值 === 基线值) return;
      const 结果 = 构造(当前值);
      if (结果) 标签.push(结果);
    };

    处理差异("ScaleX", (v) => `\\fscx${v}`);
    处理差异("ScaleY", (v) => `\\fscy${v}`);
    处理差异("Spacing", (v) => `\\fsp${v}`);
    处理差异("Angle", (v) => `\\frz${v}`);
    处理差异("Outline", (v) => `\\bord${v}`);
    处理差异("Shadow", (v) => `\\shad${v}`);
    处理差异("Blur", (v) => `\\blur${v}`);
    处理差异("Alignment", (v) => `\\an${v}`);
    处理差异("MarginL", (v) => `\\margl${v}`);
    处理差异("MarginR", (v) => `\\margr${v}`);
    处理差异("MarginV", (v) => `\\margv${v}`);

    if (有字段("Fade")) {
      const 淡入基线 = 基线.FadeIn ?? "0";
      const 淡出基线 = 基线.FadeOut ?? "0";
      const 淡入当前 = 当前.FadeIn ?? 淡入基线;
      const 淡出当前 = 当前.FadeOut ?? 淡出基线;
      if (淡入当前 !== 淡入基线 || 淡出当前 !== 淡出基线) {
        标签.push(`\\fad(${淡入当前 || 0},${淡出当前 || 0})`);
      }
    }

    if (有字段("Pos")) {
      const 基线X = 基线.PosX ?? "";
      const 基线Y = 基线.PosY ?? "";
      const 当前X = 当前.PosX ?? "";
      const 当前Y = 当前.PosY ?? "";
      const 坐标为空 = !当前X && 当前X !== "0" && !当前Y && 当前Y !== "0";
      const 与基线相同 = 当前X === 基线X && 当前Y === 基线Y;
      if (!坐标为空 && !与基线相同) {
        标签.push(`\\pos(${当前X || 0},${当前Y || 0})`);
      }
    }

    return 标签.length > 0 ? `{${标签.join("")}}` : "";
  }

  应用主字幕样式组到文件(分组索引) {
    if (!this.主字幕分组列表 || !this.主字幕分组列表[分组索引]) return;
    if (!this.文件数据 || !this.文件数据["[Events]"]) return;

    const 行 = this.文件数据["[Events]"];
    if (!行 || 行.length === 0) return;

    const 格式行 = 行.find((内容) => 内容.startsWith("Format:"));
    if (!格式行) return;

    const 字段列表 = 格式行
      .replace(/^Format:/i, "")
      .split(",")
      .map((字段) => 字段.trim())
      .filter((字段) => 字段);

    const 文本索引 = 字段列表.findIndex((字段) => 字段.toLowerCase() === "text");
    if (文本索引 === -1) return;

    const 组 = this.主字幕分组列表[分组索引];
    const 目标字段集 = new Set((组.字段列表 || []).map((f) => (f === "PosX" || f === "PosY" ? "Pos" : f)));
    const 颜色字段映射 = { 1: "PrimaryColour", 2: "SecondaryColour", 3: "OutlineColour", 4: "BackColour" };

    const 构造标签 = (字段, 原标签 = "") => {
      const 样式值 = 组.样式 || {};
      const 默认 = this.ASS标准默认样式 || {};

      if (字段 === "Fontname") return `\\fn${样式值.Fontname ?? ""}`;
      if (字段 === "Fontsize") return `\\fs${样式值.Fontsize ?? ""}`;

      if (字段 === "PrimaryColour" || 字段 === "SecondaryColour" || 字段 === "OutlineColour" || 字段 === "BackColour") {
        const 前缀匹配 = 原标签.match(/^\\([1234]?)(c|a)/i);
        const 通道 =
          前缀匹配?.[1] ||
          (字段 === "PrimaryColour" ? "" : Object.entries(颜色字段映射).find(([, v]) => v === 字段)?.[0] || "");
        const 是Alpha = /^\\[1234]?a/i.test(原标签);
        const 键 = 通道 ? 颜色字段映射[通道] || 字段 : 字段;
        const 颜色 = this.标准化ASS颜色值(样式值[键], 默认[键]);
        if (是Alpha) {
          const alpha = this.提取Alpha(颜色);
          return `\\${通道 || "1"}a&H${alpha}`;
        }
        const rgb = this.提取色RGB部分(颜色);
        const 标记 = 通道 ? `${通道}c` : "c";
        return `\\${标记}&H${rgb}`;
      }

      if (字段 === "Bold") {
        const 值 = 样式值.Bold;
        if (值 === "-1") return "\\b1";
        if (值 === "0") return "\\b0";
        return `\\b${值 ?? ""}`;
      }
      if (字段 === "Italic") return `\\i${样式值.Italic ?? ""}`;
      if (字段 === "Underline") return `\\u${样式值.Underline ?? ""}`;
      if (字段 === "StrikeOut") return `\\s${样式值.StrikeOut ?? ""}`;
      if (字段 === "BorderStyle") return `\\bord${样式值.Outline ?? ""}`; // 兼容未直接编辑的边框样式
      if (字段 === "Outline") return `\\bord${样式值.Outline ?? ""}`;
      if (字段 === "Shadow") return `\\shad${样式值.Shadow ?? ""}`;
      if (字段 === "Blur") return `\\blur${样式值.Blur ?? ""}`;
      if (字段 === "ScaleX") return `\\fscx${样式值.ScaleX ?? ""}`;
      if (字段 === "ScaleY") return `\\fscy${样式值.ScaleY ?? ""}`;
      if (字段 === "Spacing") return `\\fsp${样式值.Spacing ?? ""}`;
      if (字段 === "Angle") return `\\frz${样式值.Angle ?? ""}`;
      if (字段 === "Alignment") return `\\an${样式值.Alignment ?? ""}`;
      if (字段 === "MarginL") return `\\margl${样式值.MarginL ?? ""}`;
      if (字段 === "MarginR") return `\\margr${样式值.MarginR ?? ""}`;
      if (字段 === "MarginV") return `\\margv${样式值.MarginV ?? ""}`;
      if (字段 === "Fade") {
        const 淡入 = 样式值.FadeIn ?? "";
        const 淡出 = 样式值.FadeOut ?? "";
        if (淡入 === "" && 淡出 === "") return "";
        return `\\fad(${淡入 || 0},${淡出 || 0})`;
      }
      if (字段 === "Pos") {
        const x = 样式值.PosX ?? "";
        const y = 样式值.PosY ?? "";
        if (x === "" && y === "") return "";
        return `\\pos(${x || 0},${y || 0})`;
      }

      return 原标签 || "";
    };

    组.行索引列表.forEach((行索引) => {
      const 行内容 = 行[行索引];
      if (!行内容 || !行内容.startsWith("Dialogue:")) return;

      const 事件字段 = this.解析事件行(行内容, 字段列表, 文本索引);
      if (!事件字段) return;

      const 文本值 = 事件字段[字段列表[文本索引]] || "";
      const 拆分 = 文本值.split(/\\[Nn]/);
      const 主原始 = 拆分[0] || "";
      const 原覆盖 = 主原始.match(/^\{[^}]*\}/)?.[0] || "";
      const 主正文 = 主原始.replace(/^\{[^}]*\}/, "");
      const 剩余文本 = 拆分.slice(1).join("\\N");

      const 原标签列表 = this.拆分覆盖标签(原覆盖);
      const 新标签列表 = [];
      const 已处理字段 = new Set();

      原标签列表.forEach((tag) => {
        const 字段 = this.识别标签字段(tag);
        const 标准字段 = 字段 === "PosX" || 字段 === "PosY" ? "Pos" : 字段;
        if (标准字段 && 目标字段集.has(标准字段)) {
          const 新标签 = 构造标签(标准字段, tag);
          if (新标签) {
            新标签列表.push(新标签);
          }
          已处理字段.add(标准字段);
        } else {
          新标签列表.push(tag);
        }
      });

      目标字段集.forEach((字段) => {
        if (已处理字段.has(字段)) return;
        const 新标签 = 构造标签(字段, "");
        if (新标签) {
          新标签列表.push(新标签);
        }
      });

      const 最终覆盖 = 新标签列表.length > 0 ? `{${新标签列表.join("")}}` : "";
      const 新主文本 = 最终覆盖 ? `${最终覆盖}${主正文}` : 主正文;
      const 新文本值 = 剩余文本 ? `${新主文本}\\N${剩余文本}` : 新主文本;

      const 新字段列表 = [];
      for (let i = 0; i < 字段列表.length; i++) {
        if (i === 文本索引) {
          新字段列表.push(新文本值);
        } else {
          新字段列表.push(事件字段[字段列表[i]] || "");
        }
      }

      行[行索引] = `Dialogue: ${新字段列表.join(",")}`;
    });
  }

  拆分覆盖标签(覆盖串) {
    if (!覆盖串) return [];
    const 内容 = 覆盖串.replace(/^\{/, "").replace(/\}$/, "");
    const 标签列表 = 内容.match(/\\t\([^)]*\)|\\[^\\]+/g);
    if (!标签列表) return [];
    return 标签列表.map((标签) => 标签.trim()).filter((标签) => 标签);
  }

  识别标签字段(标签) {
    if (!标签) return null;
    const t = 标签.startsWith("\\") ? 标签.substring(1) : 标签;
    if (t.startsWith("t(")) return null;
    if (t.startsWith("fn")) return "Fontname";
    if (t.startsWith("fscx")) return "ScaleX";
    if (t.startsWith("fscy")) return "ScaleY";
    if (t.startsWith("fs")) return "Fontsize";
    if (/^(?:1c|c)/.test(t)) return "PrimaryColour";
    if (/^2c/.test(t)) return "SecondaryColour";
    if (/^3c/.test(t)) return "OutlineColour";
    if (/^4c/.test(t)) return "BackColour";
    if (/^ca/.test(t)) return "PrimaryColour";
    if (/^1a/.test(t)) return "PrimaryColour";
    if (/^2a/.test(t)) return "SecondaryColour";
    if (/^3a/.test(t)) return "OutlineColour";
    if (/^4a/.test(t)) return "BackColour";
    if (t.startsWith("bord")) return "Outline";
    if (t.startsWith("shad")) return "Shadow";
    if (t.startsWith("blur")) return "Blur";
    if (t.startsWith("pos")) return "Pos";
    if (t.startsWith("fad")) return "Fade";
    if (t.startsWith("fsp")) return "Spacing";
    if (t.startsWith("frz")) return "Angle";
    if (t.startsWith("an")) return "Alignment";
    if (t.startsWith("a") && !t.startsWith("alpha")) return "Alignment";
    if (t.startsWith("b") && !t.startsWith("blur")) return "Bold";
    if (t.startsWith("i")) return "Italic";
    if (t.startsWith("u")) return "Underline";
    if (t.startsWith("s") && !t.startsWith("shad")) return "StrikeOut";
    return null;
  }

  提取覆盖字段集合(覆盖串) {
    const 集合 = new Set();
    const 标签列表 = this.拆分覆盖标签(覆盖串);
    标签列表.forEach((t) => {
      const 字段 = this.识别标签字段(t);
      if (字段) 集合.add(字段);
    });
    return 集合;
  }

  应用副字幕样式到文件() {
    if (!this.文件数据 || !this.文件数据["[Events]"]) return;
    const 行 = this.文件数据["[Events]"];
    if (!行 || 行.length === 0) return;

    const 格式行 = 行.find((内容) => 内容.startsWith("Format:"));
    if (!格式行) return;

    const 字段列表 = 格式行
      .replace(/^Format:/i, "")
      .split(",")
      .map((字段) => 字段.trim())
      .filter((字段) => 字段);

    const 文本索引 = 字段列表.findIndex((字段) => 字段.toLowerCase() === "text");
    if (文本索引 === -1) return;

    const 覆盖标签 = this.生成副字幕覆盖标签(
      this.副字幕统一样式,
      this.副字幕统一样式基线 || this.ASS标准默认样式,
      this.副字幕已编辑字段 || new Set()
    );

    const 新事件行 = [];
    for (const 行内容 of 行) {
      if (!行内容.startsWith("Dialogue:")) {
        新事件行.push(行内容);
        continue;
      }

      const 事件字段 = this.解析事件行(行内容, 字段列表, 文本索引);
      if (!事件字段) {
        新事件行.push(行内容);
        continue;
      }

      const 文本值 = 事件字段[字段列表[文本索引]] || "";
      const 拆分 = 文本值.split(/\\[Nn]/);
      if (拆分.length < 2) {
        新事件行.push(行内容);
        continue;
      }

      const 主文本 = 拆分[0];
      const 副原始 = 拆分.slice(1).join("\\N");

      // 收集位于副字幕文本开头的所有覆盖块，避免只处理第一个 {…}
      const 原覆盖块 = [];
      let 副剩余 = 副原始;
      while (true) {
        const 匹配 = 副剩余.match(/^\{[^}]*\}/);
        if (!匹配) break;
        原覆盖块.push(匹配[0]);
        副剩余 = 副剩余.substring(匹配[0].length);
      }

      let 最终覆盖 = "";
      if (覆盖标签) {
        const 新标签列表 = this.拆分覆盖标签(覆盖标签);
        const 原标签列表 = 原覆盖块.flatMap((块) => this.拆分覆盖标签(块));

        const 获取合并键 = (tag) => {
          const 字段 = this.识别标签字段(tag);
          if (!字段) return null;
          const 内容 = tag.startsWith("\\") ? tag.substring(1) : tag;
          const 是颜色字段 =
            字段 === "PrimaryColour" || 字段 === "SecondaryColour" || 字段 === "OutlineColour" || 字段 === "BackColour";
          if (是颜色字段) {
            const 是Alpha = /^([1234]?a)/i.test(内容);
            return `${字段}-${是Alpha ? "alpha" : "color"}`;
          }
          return 字段;
        };

        // 以原标签顺序为基准，按字段替换，未出现的新字段追加到末尾
        const 新标签映射 = new Map();
        const 新无字段标签 = [];
        新标签列表.forEach((tag) => {
          const 键 = 获取合并键(tag);
          if (键) {
            新标签映射.set(键, tag);
          } else {
            新无字段标签.push(tag);
          }
        });

        const 合并标签 = [];
        原标签列表.forEach((tag) => {
          const 键 = 获取合并键(tag);
          if (键 && 新标签映射.has(键)) {
            合并标签.push(新标签映射.get(键));
            新标签映射.delete(键);
          } else {
            合并标签.push(tag);
          }
        });

        // 追加新增的字段标签与无字段标签，保持新标签自身顺序
        合并标签.push(...新标签映射.values(), ...新无字段标签);

        最终覆盖 = 合并标签.length > 0 ? `{${合并标签.join("")}}` : "";
      } else {
        // 未生成新覆盖时，保留原有覆盖（已拆分后再组装）
        const 原标签列表 = 原覆盖块.flatMap((块) => this.拆分覆盖标签(块));
        最终覆盖 = 原标签列表.length > 0 ? `{${原标签列表.join("")}}` : "";
      }

      const 新副文本 = 最终覆盖 ? `${最终覆盖}${副剩余}` : 副剩余;
      const 新文本值 = `${主文本}\\N${新副文本}`;

      const 新字段列表 = [];
      for (let i = 0; i < 字段列表.length; i++) {
        if (i === 文本索引) {
          新字段列表.push(新文本值);
        } else {
          新字段列表.push(事件字段[字段列表[i]] || "");
        }
      }

      const 新行文本 = `Dialogue: ${新字段列表.join(",")}`;
      新事件行.push(新行文本);
    }

    this.文件数据["[Events]"] = 新事件行;
    if (!this.自动保存) {
      this.文件已修改 = true;
      this.更新保存按钮状态();
    }
  }

  初始化列高亮(表格) {
    const 所有单元格 = 表格.querySelectorAll(".单元格");
    const 高亮背景色 = "rgb(16, 51, 91)";
    const 表头行 = 表格.querySelector(".表头行");

    const 表格容器 = 表格.closest(".样式表格容器");
    const 固定表头行 = 表格容器 ? 表格容器.querySelector(".固定表头行") : null;
    const 高亮表头单元格 = (表头单元格) => {
      if (表头单元格) {
        if (!表头单元格.dataset.原始背景色已保存) {
          const 计算样式 = window.getComputedStyle(表头单元格);
          const 原始背景色 = 计算样式.backgroundColor;
          表头单元格.dataset.原始背景色 = 原始背景色;
          表头单元格.dataset.原始背景色已保存 = "true";
        }
        表头单元格.style.backgroundColor = 高亮背景色;
      }
    };

    const 取消高亮表头单元格 = (表头单元格) => {
      if (表头单元格 && 表头单元格.dataset.原始背景色已保存) {
        const 原始背景色 = 表头单元格.dataset.原始背景色;
        if (原始背景色 === "rgba(0, 0, 0, 0)" || 原始背景色 === "transparent") {
          表头单元格.style.backgroundColor = "";
        } else {
          表头单元格.style.backgroundColor = 原始背景色;
        }
      }
    };

    所有单元格.forEach((单元格) => {
      单元格.addEventListener("mouseenter", () => {
        const 单元格索引 = Array.from(单元格.parentElement.children).indexOf(单元格);
        const 原始表头单元格 = 表头行.children[单元格索引];
        const 固定表头单元格 = 固定表头行 ? 固定表头行.children[单元格索引] : null;

        高亮表头单元格(原始表头单元格);

        if (固定表头单元格) {
          高亮表头单元格(固定表头单元格);
        }
      });

      单元格.addEventListener("mouseleave", () => {
        const 单元格索引 = Array.from(单元格.parentElement.children).indexOf(单元格);
        const 原始表头单元格 = 表头行.children[单元格索引];
        const 固定表头单元格 = 固定表头行 ? 固定表头行.children[单元格索引] : null;

        取消高亮表头单元格(原始表头单元格);

        if (固定表头单元格) {
          取消高亮表头单元格(固定表头单元格);
        }
      });
    });
  }

  初始化表头固定(表格) {
    const 表头行 = 表格.querySelector(".表头行");
    if (!表头行) return;

    const 表格容器 = 表格.closest(".样式表格容器");
    if (!表格容器) return;

    const 固定表头容器 = document.createElement("div");
    固定表头容器.className = "固定表头容器";
    固定表头容器.style.display = "none";
    表格容器.appendChild(固定表头容器);

    const 固定表格 = document.createElement("table");
    固定表格.className = "样式表格 固定表头表格";
    固定表头容器.appendChild(固定表格);

    const 固定表头行 = 表头行.cloneNode(true);
    固定表头行.className = "表头行 固定表头行";
    固定表格.appendChild(固定表头行);

    const 第一个单元格 = 固定表头行.querySelector(".单元格:first-child");

    const 固定第一个单元格Div = document.createElement("div");
    固定第一个单元格Div.className = "固定表头第一格";
    if (第一个单元格) {
      固定第一个单元格Div.innerHTML = 第一个单元格.innerHTML;
      const 计算样式 = window.getComputedStyle(第一个单元格);
      const 样式属性 = [
        "padding",
        "textAlign",
        "fontSize",
        "fontWeight",
        "color",
        "backgroundColor",
        "borderRight",
        "whiteSpace",
        "display",
        "flexDirection",
        "alignItems",
        "justifyContent",
        "gap",
      ];
      样式属性.forEach((属性) => {
        const 值 = 计算样式.getPropertyValue(属性);
        if (值) {
          固定第一个单元格Div.style.setProperty(属性, 值);
        }
      });
      固定第一个单元格Div.style.position = "absolute";
      固定第一个单元格Div.style.top = "0";
      固定第一个单元格Div.style.left = "0";
      固定第一个单元格Div.style.zIndex = "1004";
    }
    固定表头容器.appendChild(固定第一个单元格Div);
    const 固定表头数据 = {
      容器: 固定表头容器,
      表格: 固定表格,
      表头行: 固定表头行,
      原始表头行: 表头行,
      表格容器: 表格容器,
      固定距离: 50,
      固定第一个单元格Div: 固定第一个单元格Div,
    };

    const 同步宽度 = () => {
      const 原始单元格 = 固定表头数据.原始表头行.querySelectorAll(".单元格");
      const 固定单元格 = 固定表头数据.表头行.querySelectorAll(".单元格");

      原始单元格.forEach((原始单元格, 索引) => {
        if (固定单元格[索引]) {
          const 宽度 = 原始单元格.getBoundingClientRect().width;
          固定单元格[索引].style.width = `${宽度}px`;
          固定单元格[索引].style.minWidth = `${宽度}px`;
          固定单元格[索引].style.maxWidth = `${宽度}px`;
        }
      });

      if (固定表头数据.固定第一个单元格Div && 原始单元格[0]) {
        const 第一个单元格宽度 = 原始单元格[0].getBoundingClientRect().width;
        const 第一个单元格高度 = 原始单元格[0].getBoundingClientRect().height;
        固定表头数据.固定第一个单元格Div.style.width = `${第一个单元格宽度}px`;
        固定表头数据.固定第一个单元格Div.style.height = `${第一个单元格高度}px`;
        固定表头数据.固定第一个单元格Div.innerHTML = 原始单元格[0].innerHTML;
      }

      const 表格实际宽度 = 固定表头数据.表格容器.scrollWidth - 13;
      固定表头数据.容器.style.width = `${表格实际宽度}px`;
    };

    const 部分区 = 表格容器.closest(".部分区-V4-Styles");

    let 初始表格容器Left = null;

    const 处理滚动 = () => {
      const 原始表头Rect = 固定表头数据.原始表头行.getBoundingClientRect();
      const 表格容器Rect = 固定表头数据.表格容器.getBoundingClientRect();

      if (初始表格容器Left === null && 部分区) {
        const 当前滚动位置 = 部分区.scrollLeft;
        部分区.scrollLeft = 0;
        const 临时Rect = 固定表头数据.表格容器.getBoundingClientRect();
        初始表格容器Left = 临时Rect.left;
        部分区.scrollLeft = 当前滚动位置;
      }

      const 仍在视口内 = 表格容器Rect.bottom > 155 && 表格容器Rect.top < window.innerHeight;

      if (仍在视口内 && 原始表头Rect.top <= 固定表头数据.固定距离) {
        if (固定表头数据.容器.style.display === "none") {
          固定表头数据.容器.style.display = "block";
          同步宽度();
          初始表格容器Left = null;
        }

        const 横向滚动距离 = 部分区 ? 部分区.scrollLeft : 0;

        if (初始表格容器Left === null) {
          初始表格容器Left = 表格容器Rect.left + 横向滚动距离;
        }

        固定表头数据.容器.style.position = "fixed";
        固定表头数据.容器.style.top = `${固定表头数据.固定距离}px`;
        固定表头数据.容器.style.left = `${初始表格容器Left}px`;
        固定表头数据.容器.style.zIndex = "1003";

        固定表头数据.表头行.style.transform = `translateX(-${横向滚动距离}px)`;

        同步宽度();
      } else {
        if (固定表头数据.容器.style.display !== "none") {
          固定表头数据.容器.style.display = "none";
        }
        初始表格容器Left = null;
      }

      const 文件名显示区 = document.querySelector(".文件名显示区");
      if (文件名显示区) {
        const 表格容器顶部距离 = 表格容器Rect.top;
        if (表格容器顶部距离 <= 90) {
          文件名显示区.classList.add("隐藏");
        } else {
          文件名显示区.classList.remove("隐藏");
        }
      }
    };

    let 滚动定时器 = null;
    const 防抖处理滚动 = () => {
      if (滚动定时器) {
        cancelAnimationFrame(滚动定时器);
      }
      滚动定时器 = requestAnimationFrame(() => {
        处理滚动();
      });
    };

    window.addEventListener("scroll", 防抖处理滚动, { passive: true });
    window.addEventListener("resize", 防抖处理滚动, { passive: true });

    if (部分区) {
      部分区.addEventListener(
        "scroll",
        () => {
          if (固定表头数据.容器.style.display !== "none") {
            const 横向滚动距离 = 部分区.scrollLeft;
            固定表头数据.表头行.style.transform = `translateX(-${横向滚动距离}px)`;
          }
        },
        { passive: true }
      );
    }

    处理滚动();
    if (!this.表头固定清理函数) {
      this.表头固定清理函数 = [];
    }
    const 清理函数 = () => {
      window.removeEventListener("scroll", 防抖处理滚动);
      window.removeEventListener("resize", 防抖处理滚动);
      if (滚动定时器) {
        cancelAnimationFrame(滚动定时器);
      }
    };
    this.表头固定清理函数.push(清理函数);
  }

  初始化所有颜色选择器(表格) {
    const 所有颜色显示元素 = 表格.querySelectorAll(".颜色显示文本");

    所有颜色显示元素.forEach((颜色显示div) => {
      const 字段 = 颜色显示div.dataset.字段;
      const 样式索引 = parseInt(颜色显示div.dataset.样式索引);
      const 字段索引 = parseInt(颜色显示div.dataset.字段索引);
      let 当前值 = 颜色显示div.dataset.原始值 || "";
      if (!当前值) {
        当前值 = 颜色显示div.textContent || "";
      }

      const 颜色按钮 = document.createElement("button");
      颜色按钮.className = "颜色选择按钮";
      颜色按钮.type = "button";
      颜色按钮.style.position = "absolute";
      颜色按钮.style.left = "-9999px";
      颜色按钮.style.width = "0";
      颜色按钮.style.height = "0";
      颜色按钮.style.padding = "0";
      颜色按钮.style.border = "none";
      颜色按钮.style.opacity = "0";
      颜色按钮.style.pointerEvents = "none";

      document.body.appendChild(颜色按钮);

      const rgba对象 = this.ASS颜色转RGBA(当前值);
      const rgba颜色字符串 = `rgba(${rgba对象.r}, ${rgba对象.g}, ${rgba对象.b}, ${rgba对象.a})`;

      const pickr = Pickr.create({
        el: 颜色按钮,
        theme: "monolith",
        default: rgba颜色字符串,
        swatches: null,
        defaultRepresentation: "HEX",
        components: {
          preview: true,
          opacity: true,
          hue: true,
          interaction: {
            hex: true,
            rgba: true,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: true,
            clear: false,
            save: true,
          },
        },
      });

      pickr.on("change", (color) => {
        try {
          const rgba数组 = color.toRGBA();
          const rgba = {
            r: rgba数组[0] || 0,
            g: rgba数组[1] || 0,
            b: rgba数组[2] || 0,
            a: rgba数组[3] !== undefined ? rgba数组[3] : 1,
          };

          if (isNaN(rgba.r) || isNaN(rgba.g) || isNaN(rgba.b) || isNaN(rgba.a)) {
            console.error("颜色值无效:", rgba);
            return;
          }
          const ass颜色 = this.RGBA转ASS颜色(rgba);
          const 原始值 = 颜色显示div.dataset.原始值 || "";
          if (ass颜色 === 原始值) {
            return; // 仅切换表示方式不保存
          }
          颜色显示div.innerHTML = "";
          this.渲染颜色文本(颜色显示div, ass颜色);
          颜色显示div.dataset.原始值 = ass颜色;

          if (颜色显示div.dataset.副字幕 === "true") {
            this.更新副字幕样式字段(字段, ass颜色);
            if (this.自动保存) {
              this.保存文件();
            } else {
              this.文件已修改 = true;
              this.更新保存按钮状态();
            }
          } else if (颜色显示div.dataset.主字幕组 !== undefined) {
            const 分组索引 = Number(颜色显示div.dataset.主字幕组);
            this.更新主字幕样式字段(分组索引, 字段, ass颜色);
          } else {
            this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, ass颜色);
            if (this.自动保存) {
              this.保存文件();
            }
          }
        } catch (error) {
          console.error("颜色转换错误:", error);
        }
      });

      const 遮罩容器 = document.createElement("div");
      遮罩容器.className = "颜色选择器遮罩容器";
      遮罩容器.style.display = "none";
      document.body.appendChild(遮罩容器);

      const 遮罩上 = document.createElement("div");
      遮罩上.className = "颜色选择器遮罩 遮罩上";
      遮罩容器.appendChild(遮罩上);

      const 遮罩下 = document.createElement("div");
      遮罩下.className = "颜色选择器遮罩 遮罩下";
      遮罩容器.appendChild(遮罩下);

      const 遮罩左 = document.createElement("div");
      遮罩左.className = "颜色选择器遮罩 遮罩左";
      遮罩容器.appendChild(遮罩左);

      const 遮罩右 = document.createElement("div");
      遮罩右.className = "颜色选择器遮罩 遮罩右";
      遮罩容器.appendChild(遮罩右);

      const 关闭颜色选择器 = () => {
        pickr.hide();
      };
      遮罩上.addEventListener("click", 关闭颜色选择器);
      遮罩下.addEventListener("click", 关闭颜色选择器);
      遮罩左.addEventListener("click", 关闭颜色选择器);
      遮罩右.addEventListener("click", 关闭颜色选择器);

      const 单元格遮罩 = document.createElement("div");
      单元格遮罩.className = "单元格遮罩";
      单元格遮罩.style.display = "none";
      document.body.appendChild(单元格遮罩);

      pickr.on("show", () => {
        遮罩容器.style.display = "block";
        const 单元格 = 颜色显示div.closest(".数据单元格");
        if (单元格) {
          const 单元格Rect = 单元格.getBoundingClientRect();
          const 视口宽度 = window.innerWidth;
          const 视口高度 = window.innerHeight;

          遮罩上.style.top = "0";
          遮罩上.style.left = "0";
          遮罩上.style.width = "100vw";
          遮罩上.style.height = `${单元格Rect.top}px`;

          遮罩下.style.top = `${单元格Rect.bottom}px`;
          遮罩下.style.left = "0";
          遮罩下.style.width = "100vw";
          遮罩下.style.height = `${视口高度 - 单元格Rect.bottom}px`;

          遮罩左.style.top = `${单元格Rect.top}px`;
          遮罩左.style.left = "0";
          遮罩左.style.width = `${单元格Rect.left - 1}px`;
          遮罩左.style.height = `${单元格Rect.height}px`;

          遮罩右.style.top = `${单元格Rect.top}px`;
          遮罩右.style.left = `${单元格Rect.right + 1}px`;
          遮罩右.style.width = `${视口宽度 - 单元格Rect.right}px`;
          遮罩右.style.height = `${单元格Rect.height}px`;

          单元格遮罩.style.top = `${单元格Rect.top}px`;
          单元格遮罩.style.left = `${单元格Rect.left - 1}px`;
          单元格遮罩.style.width = `${单元格Rect.width + 2}px`;
          单元格遮罩.style.height = `${单元格Rect.height}px`;
          单元格遮罩.style.display = "block";
        }
      });

      pickr.on("hide", () => {
        遮罩容器.style.display = "none";
        单元格遮罩.style.display = "none";
        颜色显示div.parentElement.classList.remove("当前");
      });

      颜色显示div.parentElement.addEventListener("click", (e) => {
        颜色显示div.parentElement.classList.add("当前");
        pickr.show();

        requestAnimationFrame(() => {
          const 面板 = pickr.getRoot().app;
          if (!面板) return;

          const 单元格 = 颜色显示div.closest(".数据单元格");
          if (!单元格) return;

          const 单元格Rect = 单元格.getBoundingClientRect();
          const 面板Rect = 面板.getBoundingClientRect();
          const 视口宽度 = window.innerWidth;
          const 视口高度 = window.innerHeight;
          const 间距 = 10;
          const 底部预留空间 = 75;

          let 新Left = 单元格Rect.right + 间距;
          let 新Top = 单元格Rect.top;

          if (新Left + 面板Rect.width > 视口宽度 - 间距) {
            const 左侧位置 = 单元格Rect.left - 面板Rect.width - 间距;
            if (左侧位置 >= 间距) {
              新Left = 左侧位置;
            } else {
              新Left = Math.max(间距, 单元格Rect.left + (单元格Rect.width - 面板Rect.width) / 2);
            }
          }

          const 需要显示在上方 = 新Top + 面板Rect.height > 视口高度 - 底部预留空间;

          if (需要显示在上方) {
            新Top = 单元格Rect.bottom - 面板Rect.height;
            if (新Top < 间距) {
              新Top = 间距;
            }
          }

          新Left = Math.max(间距, Math.min(新Left, 视口宽度 - 面板Rect.width - 间距));
          if (需要显示在上方) {
            新Top = Math.max(间距, 单元格Rect.bottom - 面板Rect.height);
          } else {
            新Top = Math.max(间距, Math.min(新Top, 视口高度 - 面板Rect.height - 底部预留空间));
          }

          面板.style.position = "fixed";
          面板.style.left = `${新Left}px`;
          面板.style.top = `${新Top}px`;
          面板.style.zIndex = "10001";
        });
      });
    });
  }

  // 辅助函数：在 contentEditable 元素中插入文本（替代已弃用的 execCommand）
  插入文本到可编辑元素(元素, 文本) {
    const 选择 = window.getSelection();
    if (选择.rangeCount > 0) {
      const 范围 = 选择.getRangeAt(0);
      范围.deleteContents();
      const 文本节点 = document.createTextNode(文本);
      范围.insertNode(文本节点);
      // 移动光标到插入文本的末尾
      范围.setStartAfter(文本节点);
      范围.collapse(true);
      选择.removeAllRanges();
      选择.addRange(范围);
    } else {
      // 如果没有选择范围，直接追加文本
      元素.textContent = (元素.textContent || "") + 文本;
    }
  }

  创建表格文本框(容器, 字段, 值, 样式索引, 字段索引) {
    const 包装div = document.createElement("div");
    包装div.className = "表格输入框包装";

    const 可编辑div = document.createElement("div");
    可编辑div.className = "表格输入框";
    可编辑div.contentEditable = "true";
    可编辑div.dataset.字段 = 字段;
    可编辑div.dataset.样式索引 = 样式索引;
    可编辑div.dataset.字段索引 = 字段索引;

    const 是颜色字段 =
      字段 === "PrimaryColour" || 字段 === "SecondaryColour" || 字段 === "OutlineColour" || 字段 === "BackColour";

    if (是颜色字段) {
      this.渲染颜色文本(可编辑div, 值);
    } else {
      可编辑div.textContent = 值;
    }

    // 字体名称字段的特殊处理：不能在开头输入空白字符
    const 是字体名称字段 = 字段 === "Fontname";

    if (是字体名称字段) {
      // 使用 beforeinput 事件阻止在开头输入空白字符
      可编辑div.addEventListener("beforeinput", (e) => {
        const 选择 = window.getSelection();
        if (选择.rangeCount > 0) {
          const 范围 = 选择.getRangeAt(0);
          const 光标位置 = 范围.startOffset;
          const 当前文本 = 可编辑div.textContent || "";

          // 如果光标在开头（位置为0），且输入的是空白字符，则阻止
          if (光标位置 === 0 && e.inputType === "insertText") {
            const 输入字符 = e.data;
            if (输入字符 && /^\s+$/.test(输入字符)) {
              e.preventDefault();
              return;
            }
          }

          // 处理粘贴：如果粘贴的内容在开头位置且以空白字符开头，则去除开头的空白字符
          if (e.inputType === "insertFromPaste" && 光标位置 === 0) {
            const 粘贴文本 = e.dataTransfer?.getData("text/plain") || "";
            if (粘贴文本 && /^\s+/.test(粘贴文本)) {
              e.preventDefault();
              const 去除开头空白 = 粘贴文本.replace(/^\s+/, "");
              this.插入文本到可编辑元素(可编辑div, 去除开头空白);
              return;
            }
          }
        }
      });
    }

    可编辑div.addEventListener("input", () => {
      const 文本内容 = 可编辑div.textContent || "";
      this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, 文本内容);
      if (字段 !== "Name" && this.自动保存) {
        this.保存文件();
      } else if (!this.自动保存) {
        this.检查文件是否已修改();
      }
      if (是颜色字段) {
        const 纯文本 = 可编辑div.textContent || "";
        可编辑div.textContent = 纯文本;
      }
    });

    // blur 事件处理：字体名称字段失焦时修剪两端空白字符
    if (是颜色字段) {
      可编辑div.addEventListener("blur", () => {
        const 文本内容 = 可编辑div.textContent || "";
        this.渲染颜色文本(可编辑div, 文本内容);
      });
    } else if (是字体名称字段) {
      可编辑div.addEventListener("blur", () => {
        const 文本内容 = 可编辑div.textContent || "";
        const 修剪后的文本 = 文本内容.trim();
        if (文本内容 !== 修剪后的文本) {
          可编辑div.textContent = 修剪后的文本;
          this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, 修剪后的文本);
          if (字段 !== "Name" && this.自动保存) {
            this.保存文件();
          }
        }
      });
    }

    可编辑div.addEventListener("paste", (e) => {
      e.preventDefault();
      const 文本 = (e.clipboardData || window.clipboardData).getData("text");
      const 新文本 = 文本 ?? "";
      // 直接写入并复用同样的更新/保存逻辑
      可编辑div.textContent = 新文本;
      this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, 新文本);
      if (字段 !== "Name" && this.自动保存) {
        this.保存文件();
      } else {
        this.检查文件是否已修改();
      }
      if (是颜色字段) {
        this.渲染颜色文本(可编辑div, 新文本);
      }
    });

    可编辑div.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        return;
      }
      // 字体名称字段：只在开头时阻止空格，中间和尾部允许空格
      if (e.key === " ") {
        if (是字体名称字段) {
          const 选择 = window.getSelection();
          if (选择.rangeCount > 0) {
            const 范围 = 选择.getRangeAt(0);
            const 光标位置 = 范围.startOffset;
            // 只在光标在开头（位置为0）时阻止空格
            if (光标位置 === 0) {
              e.preventDefault();
              return;
            }
          }
        } else {
          // 其他字段：完全阻止空格
          e.preventDefault();
          return;
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        可编辑div.blur();
        return;
      }
    });

    包装div.appendChild(可编辑div);
    容器.appendChild(包装div);
  }

  渲染颜色文本(容器, 文本) {
    容器.innerHTML = "";

    if (!文本) {
      容器.textContent = "";
      return;
    }

    for (let i = 0; i < 文本.length; i++) {
      const 字符 = 文本[i];
      const span = document.createElement("span");

      if (i === 0) {
        span.style.color = "#777";
        span.textContent = 字符;
      } else if (i === 1) {
        span.style.color = "#777";
        span.textContent = 字符;
      } else if (i >= 2 && i <= 3) {
        span.style.color = "silver";
        span.textContent = 字符;
      } else if (i >= 4 && i <= 5) {
        span.style.color = "lightcoral";
        span.textContent = 字符;
      } else if (i >= 6 && i <= 7) {
        span.style.color = "lightgreen";
        span.textContent = 字符;
      } else if (i >= 8 && i <= 9) {
        span.style.color = "lightskyblue";
        span.textContent = 字符;
      } else {
        span.textContent = 字符;
      }

      容器.appendChild(span);
    }
  }

  创建颜色选择器占位(容器, 字段, 值, 样式索引, 字段索引) {
    const 包装div = document.createElement("div");
    包装div.className = "颜色选择器包装";

    const 颜色显示div = document.createElement("div");
    颜色显示div.className = "颜色显示文本";
    颜色显示div.dataset.字段 = 字段;
    颜色显示div.dataset.样式索引 = 样式索引;
    颜色显示div.dataset.字段索引 = 字段索引;
    颜色显示div.dataset.原始值 = 值;

    this.渲染颜色文本(颜色显示div, 值);

    包装div.appendChild(颜色显示div);
    容器.appendChild(包装div);
  }

  ASS颜色转RGBA(ass颜色) {
    if (!ass颜色 || !ass颜色.startsWith("&H")) {
      return { r: 255, g: 255, b: 255, a: 1 };
    }

    const 十六进制 = ass颜色.substring(2);

    if (十六进制.length < 8) {
      return { r: 255, g: 255, b: 255, a: 1 };
    }

    const AA = parseInt(十六进制.substring(0, 2), 16);
    const BB = parseInt(十六进制.substring(2, 4), 16);
    const GG = parseInt(十六进制.substring(4, 6), 16);
    const RR = parseInt(十六进制.substring(6, 8), 16);

    const 反向Alpha = (255 - AA) / 255;

    return {
      r: RR,
      g: GG,
      b: BB,
      a: 反向Alpha,
    };
  }

  RGBA转ASS颜色(rgba) {
    const r = Math.max(0, Math.min(255, Math.round(Number(rgba.r) || 0)));
    const g = Math.max(0, Math.min(255, Math.round(Number(rgba.g) || 0)));
    const b = Math.max(0, Math.min(255, Math.round(Number(rgba.b) || 0)));
    const a = Math.max(0, Math.min(1, Number(rgba.a) !== undefined ? Number(rgba.a) : 1));

    const RR = r.toString(16).padStart(2, "0").toUpperCase();
    const GG = g.toString(16).padStart(2, "0").toUpperCase();
    const BB = b.toString(16).padStart(2, "0").toUpperCase();

    const 反向Alpha = Math.round((1 - a) * 255);
    const AA = 反向Alpha.toString(16).padStart(2, "0").toUpperCase();

    return `&H${AA}${BB}${GG}${RR}`;
  }

  创建表格数字框(容器, 字段, 值, 样式索引, 字段索引, 步进值 = 1) {
    const 包装div = document.createElement("div");
    包装div.className = "表格数字框包装";

    const 数字框容器 = document.createElement("div");
    数字框容器.className = "表格数字框容器";

    const 可编辑div = document.createElement("div");
    可编辑div.className = "表格数字框";
    可编辑div.contentEditable = "true";
    可编辑div.textContent = 值;
    可编辑div.dataset.字段 = 字段;
    可编辑div.dataset.样式索引 = 样式索引;
    可编辑div.dataset.字段索引 = 字段索引;
    可编辑div.dataset.步进值 = 步进值.toString();

    const 按钮组 = document.createElement("div");
    按钮组.className = "表格数字增减按钮组";

    const 增加按钮 = document.createElement("div");
    增加按钮.className = "表格数字增减按钮";
    增加按钮.textContent = "+";
    增加按钮.addEventListener("click", () => {
      const 当前值 = parseFloat(可编辑div.textContent) || 0;
      const 新值 = 当前值 + 步进值;

      const 显示值 = 步进值 >= 1 ? Math.round(新值) : parseFloat(新值.toFixed(1));
      可编辑div.textContent = 显示值.toString();
      this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, 可编辑div.textContent);
      if (this.自动保存) {
        this.保存文件();
      }
    });

    const 减少按钮 = document.createElement("div");
    减少按钮.className = "表格数字增减按钮";
    减少按钮.textContent = "-";
    减少按钮.addEventListener("click", () => {
      const 当前值 = parseFloat(可编辑div.textContent) || 0;
      const 新值 = 当前值 - 步进值;

      const 显示值 = 步进值 >= 1 ? Math.round(新值) : parseFloat(新值.toFixed(1));
      可编辑div.textContent = 显示值.toString();
      this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, 可编辑div.textContent);
      if (this.自动保存) {
        this.保存文件();
      }
    });

    const 处理输入 = () => {
      let 文本内容 = 可编辑div.textContent || "";

      if (步进值 < 1) {
        文本内容 = 文本内容.replace(/[^\d.-]/g, "");

        const 小数点索引 = 文本内容.indexOf(".");
        if (小数点索引 !== -1) {
          文本内容 = 文本内容.substring(0, 小数点索引 + 1) + 文本内容.substring(小数点索引 + 1).replace(/\./g, "");
        }
      } else {
        文本内容 = 文本内容.replace(/[^\d-]/g, "");
      }

      if (文本内容.includes("-")) {
        const 负号位置 = 文本内容.indexOf("-");
        if (负号位置 !== 0) {
          文本内容 = "-" + 文本内容.replace(/-/g, "");
        } else {
          const 负号后内容 = 文本内容.substring(1).replace(/-/g, "");
          文本内容 = "-" + 负号后内容;
        }
      }

      if (可编辑div.textContent !== 文本内容) {
        可编辑div.textContent = 文本内容;
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(可编辑div);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, 文本内容);
      if (this.自动保存) {
        this.保存文件();
      }
    };

    可编辑div.addEventListener("input", 处理输入);
    可编辑div.addEventListener("paste", (e) => {
      e.preventDefault();
      const 文本 = (e.clipboardData || window.clipboardData).getData("text");

      let 数字文本;
      if (步进值 < 1) {
        数字文本 = 文本.replace(/[^\d.-]/g, "");

        const 小数点索引 = 数字文本.indexOf(".");
        if (小数点索引 !== -1) {
          数字文本 = 数字文本.substring(0, 小数点索引 + 1) + 数字文本.substring(小数点索引 + 1).replace(/\./g, "");
        }
      } else {
        数字文本 = 文本.replace(/[^\d-]/g, "");
      }

      if (数字文本.includes("-")) {
        const 负号位置 = 数字文本.indexOf("-");
        if (负号位置 !== 0) {
          数字文本 = "-" + 数字文本.replace(/-/g, "");
        } else {
          数字文本 = "-" + 数字文本.substring(1).replace(/-/g, "");
        }
      }
      this.插入文本到可编辑元素(可编辑div, 数字文本);
    });

    可编辑div.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        可编辑div.blur();
        return;
      }
      if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "Tab" ||
        (e.ctrlKey && (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x"))
      ) {
        return;
      }

      if (/^\d$/.test(e.key)) {
        return;
      }

      if (步进值 < 1 && e.key === ".") {
        const 当前文本 = 可编辑div.textContent || "";
        if (!当前文本.includes(".")) {
          return;
        }
        e.preventDefault();
        return;
      }

      if (e.key === "-") {
        const 当前文本 = 可编辑div.textContent || "";
        const 选择 = window.getSelection();
        if (选择.rangeCount > 0) {
          const range = 选择.getRangeAt(0);
          if (range.startOffset === 0 && range.endOffset === 可编辑div.textContent.length) {
            return;
          }
          if (range.startOffset === 0 && range.endOffset === 0 && !当前文本.startsWith("-")) {
            return;
          }
        }
        e.preventDefault();
        return;
      }

      e.preventDefault();
    });

    可编辑div.addEventListener("blur", () => {
      const 文本内容 = 可编辑div.textContent.trim();
      if (!文本内容 || 文本内容 === "" || 文本内容 === "-") {
        可编辑div.textContent = "0";
        this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, "0");
        if (字段 !== "Name" && this.自动保存) {
          this.保存文件();
        }
      }
    });

    按钮组.appendChild(增加按钮);
    按钮组.appendChild(减少按钮);
    数字框容器.appendChild(可编辑div);
    数字框容器.appendChild(按钮组);
    包装div.appendChild(数字框容器);
    容器.appendChild(包装div);
  }

  创建表格选项控件(容器, 字段, 值, 样式索引, 字段索引, 选项配置) {
    const 包装div = document.createElement("div");
    包装div.className = "表格输入框包装";

    const { 选项, 标签 } = 选项配置;
    const 当前值 = 值.trim();

    const 是开关类型 =
      选项.length === 2 &&
      选项.includes("0") &&
      选项.includes("-1") &&
      标签 &&
      标签.includes("关闭") &&
      标签.includes("开启");

    const 是边框样式类型 = 选项.length === 2 && 选项.includes("1") && 选项.includes("3") && 字段 === "BorderStyle";

    const 使用滑块 = 是开关类型 || 是边框样式类型;

    if (选项.length > 2) {
      const 下拉框 = document.createElement("select");
      下拉框.className = "表格下拉框";
      下拉框.dataset.字段 = 字段;
      下拉框.dataset.样式索引 = 样式索引;
      下拉框.dataset.字段索引 = 字段索引;

      for (let i = 0; i < 选项.length; i++) {
        const 选项值 = 选项[i];
        const 选项标签 = 标签 && 标签[i] ? 标签[i] : 选项值;
        const option元素 = document.createElement("option");
        option元素.value = 选项值;
        option元素.textContent = `${选项值} (${选项标签})`;
        if (当前值 === 选项值) {
          option元素.selected = true;
        }
        下拉框.appendChild(option元素);
      }

      下拉框.addEventListener("change", () => {
        const 选中值 = 下拉框.value;
        this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, 选中值);
        if (this.自动保存) {
          this.保存文件();
        }
      });

      下拉框.addEventListener("mouseenter", () => {
        下拉框.classList.add("表格下拉框-hover");
      });

      下拉框.addEventListener("mouseleave", () => {
        if (document.activeElement !== 下拉框) {
          下拉框.classList.remove("表格下拉框-hover");
        }
      });

      下拉框.addEventListener("focus", () => {
        下拉框.classList.add("表格下拉框-focus");
      });

      下拉框.addEventListener("blur", () => {
        下拉框.classList.remove("表格下拉框-focus", "表格下拉框-hover");
      });

      包装div.appendChild(下拉框);
    } else if (使用滑块) {
      const 滑块容器 = document.createElement("div");
      滑块容器.className = 是边框样式类型 ? "表格滑块容器 表格滑块容器-边框样式" : "表格滑块容器";

      const 滑块轨道 = document.createElement("div");
      滑块轨道.className = "表格滑块轨道";

      let 关闭值, 开启值;
      if (是开关类型) {
        关闭值 = "0";
        开启值 = "-1";
      } else if (是边框样式类型) {
        关闭值 = "1";
        开启值 = "3";
      }
      let 开启 = 当前值 === 开启值;

      const 滑块按钮 = document.createElement("div");
      滑块按钮.className = "表格滑块按钮";

      const 状态标签 = document.createElement("span");
      状态标签.className = "表格滑块标签";

      const 更新滑块状态 = (新状态) => {
        开启 = 新状态;

        if (开启) {
          滑块轨道.classList.add("表格滑块轨道-开启");
          滑块轨道.classList.remove("表格滑块轨道-关闭");
          滑块按钮.classList.add("表格滑块按钮-开启");
          滑块按钮.classList.remove("表格滑块按钮-关闭");
          状态标签.classList.add("表格滑块标签-开启");
          状态标签.classList.remove("表格滑块标签-关闭");
        } else {
          滑块轨道.classList.add("表格滑块轨道-关闭");
          滑块轨道.classList.remove("表格滑块轨道-开启");
          滑块按钮.classList.add("表格滑块按钮-关闭");
          滑块按钮.classList.remove("表格滑块按钮-开启");
          状态标签.classList.add("表格滑块标签-关闭");
          状态标签.classList.remove("表格滑块标签-开启");
        }

        if (是开关类型) {
          状态标签.textContent = 开启 ? "ON" : "OFF";
        } else if (是边框样式类型) {
          const 当前值 = 开启 ? "3" : "1";
          const 当前值索引 = 选项.indexOf(当前值);
          状态标签.textContent = 标签 && 标签[当前值索引] ? 标签[当前值索引] : 当前值;
        }
      };

      更新滑块状态(当前值 === 开启值);

      滑块轨道.appendChild(状态标签);
      滑块轨道.appendChild(滑块按钮);

      滑块轨道.addEventListener("click", () => {
        const 新状态 = !开启;
        更新滑块状态(新状态);
        const 新值 = 新状态 ? 开启值 : 关闭值;
        this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, 新值);
        if (this.自动保存) {
          this.保存文件();
        }
      });

      滑块容器.appendChild(滑块轨道);
      包装div.appendChild(滑块容器);
    } else {
      const 选项组 = document.createElement("div");
      选项组.className = "单选框组";

      for (let i = 0; i < 选项.length; i++) {
        const 选项值 = 选项[i];
        const 选项标签 = 标签 && 标签[i] ? 标签[i] : 选项值;

        const 选项项 = document.createElement("div");
        选项项.className = "单选框项";

        const 单选框 = document.createElement("input");
        单选框.type = "radio";
        单选框.name = `样式${样式索引}_${字段}`;
        单选框.value = 选项值;
        单选框.checked = 当前值 === 选项值;
        单选框.dataset.字段 = 字段;
        单选框.dataset.样式索引 = 样式索引;
        单选框.dataset.字段索引 = 字段索引;

        单选框.addEventListener("change", () => {
          if (单选框.checked) {
            this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, 选项值);
            if (this.自动保存) {
              this.保存文件();
            }
          }
        });

        const 标签元素 = document.createElement("label");
        标签元素.textContent = 选项标签;

        选项项.appendChild(单选框);
        选项项.appendChild(标签元素);
        选项组.appendChild(选项项);
      }

      包装div.appendChild(选项组);
    }

    容器.appendChild(包装div);
  }

  更新样式单元格(部分名, 样式索引, 字段索引, 值) {
    if (!this.文件数据[部分名]) return;

    const 样式行索引 = [];
    for (let i = 0; i < this.文件数据[部分名].length; i++) {
      if (this.文件数据[部分名][i].startsWith("Style:")) {
        样式行索引.push(i);
      }
    }

    if (样式索引 >= 样式行索引.length) return;

    const 实际行索引 = 样式行索引[样式索引];
    const 原始行 = this.文件数据[部分名][实际行索引];
    const 样式属性 = this.解析属性行(原始行);
    if (!样式属性) return;

    const 值列表 = 样式属性.值.split(",");
    if (字段索引 < 值列表.length) {
      值列表[字段索引] = 值;
      const 新值 = 值列表.join(",");
      this.文件数据[部分名][实际行索引] = `Style: ${新值}`;

      if (部分名 === "[V4+ Styles]" && this.V4Styles字段列表) {
        const 当前字段 = this.V4Styles字段列表[字段索引];
        if (当前字段 && 当前字段 !== "Name") {
          if (!this.自动保存) {
            this.检查文件是否已修改();
          }
        }
      }
    }
  }

  深拷贝文件数据(文件数据) {
    const 副本 = {};
    for (const [键, 值] of Object.entries(文件数据)) {
      副本[键] = Array.isArray(值) ? [...值] : 值;
    }
    return 副本;
  }

  检查文件是否已修改() {
    const 已修改 = !this.文件数据是否相同(this.文件数据, this.原始文件数据);
    if (this.文件已修改 !== 已修改) {
      this.文件已修改 = 已修改;
      this.更新保存按钮状态();
    }
  }

  文件数据是否相同(数据1, 数据2) {
    if (!数据1 || !数据2) return 数据1 === 数据2;

    const 键1 = Object.keys(数据1).sort();
    const 键2 = Object.keys(数据2).sort();

    if (键1.length !== 键2.length) return false;

    for (const 键 of 键1) {
      if (!键2.includes(键)) return false;

      const 值1 = 数据1[键];
      const 值2 = 数据2[键];

      if (Array.isArray(值1) && Array.isArray(值2)) {
        if (值1.length !== 值2.length) return false;
        for (let i = 0; i < 值1.length; i++) {
          if (值1[i] !== 值2[i]) return false;
        }
      } else if (值1 !== 值2) {
        return false;
      }
    }

    return true;
  }

  解析部分属性(行数组) {
    const 属性映射 = {};
    for (const 行 of 行数组) {
      const 属性 = this.解析属性行(行);
      if (属性) {
        属性映射[属性.键] = 属性.值;
      }
    }
    return 属性映射;
  }

  创建属性项(容器, 键, 值, 信息, 部分名) {
    const 属性项 = document.createElement("div");
    属性项.className = "属性项";

    const 属性标签 = document.createElement("div");
    属性标签.className = "属性标签";

    const 属性中文 = document.createElement("div");
    属性中文.className = "属性中文";
    属性中文.textContent = 信息.中文;

    const 属性英文 = document.createElement("div");
    属性英文.className = "属性英文";
    属性英文.textContent = 键;

    属性标签.appendChild(属性中文);
    属性标签.appendChild(属性英文);
    属性项.appendChild(属性标签);

    const 属性值区 = document.createElement("div");
    属性值区.className = "属性值区";

    if (信息.类型 === "枚举" && 信息.选项) {
      this.创建单选框组(属性值区, 键, 值, 信息.选项, 部分名);
    } else if (信息.类型 === "数字") {
      this.创建数字框(属性值区, 键, 值, 部分名);
    } else {
      this.创建文本框(属性值区, 键, 值, 部分名);
    }

    属性项.appendChild(属性值区);
    容器.appendChild(属性项);
  }

  创建文本框(容器, 键, 值, 部分名) {
    const 输入框 = document.createElement("input");
    输入框.type = "text";
    输入框.className = "属性文本框";
    输入框.value = 值;
    输入框.dataset.键 = 键;
    输入框.dataset.部分 = 部分名;

    输入框.addEventListener("input", () => {
      this.更新文件数据(部分名, 键, 输入框.value);
      if (this.自动保存) {
        this.保存文件();
      }
    });

    容器.appendChild(输入框);
  }

  创建数字框(容器, 键, 值, 部分名) {
    const 数字框容器 = document.createElement("div");
    数字框容器.className = "数字框容器";

    const 输入框 = document.createElement("input");
    输入框.type = "number";
    输入框.className = "属性数字框";
    输入框.value = 值;
    输入框.dataset.键 = 键;
    输入框.dataset.部分 = 部分名;

    const 按钮组 = document.createElement("div");
    按钮组.className = "数字增减按钮组";

    const 增加按钮 = document.createElement("div");
    增加按钮.className = "数字增减按钮";
    增加按钮.textContent = "+";
    增加按钮.addEventListener("click", () => {
      const 当前值 = parseFloat(输入框.value) || 0;
      输入框.value = 当前值 + 1;
      this.更新文件数据(部分名, 键, 输入框.value);
      if (this.自动保存) {
        this.保存文件();
      }
    });

    const 减少按钮 = document.createElement("div");
    减少按钮.className = "数字增减按钮";
    减少按钮.textContent = "-";
    减少按钮.addEventListener("click", () => {
      const 当前值 = parseFloat(输入框.value) || 0;
      输入框.value = 当前值 - 1;
      this.更新文件数据(部分名, 键, 输入框.value);
      if (this.自动保存) {
        this.保存文件();
      }
    });

    输入框.addEventListener("input", () => {
      this.更新文件数据(部分名, 键, 输入框.value);
      if (this.自动保存) {
        this.保存文件();
      }
    });

    按钮组.appendChild(增加按钮);
    按钮组.appendChild(减少按钮);
    数字框容器.appendChild(输入框);
    数字框容器.appendChild(按钮组);
    容器.appendChild(数字框容器);
  }

  创建单选框组(容器, 键, 值, 选项, 部分名) {
    const 单选框组 = document.createElement("div");
    单选框组.className = "单选框组";

    for (const 选项值 of 选项) {
      const 单选框项 = document.createElement("div");
      单选框项.className = "单选框项";

      const 单选框 = document.createElement("input");
      单选框.type = "radio";
      单选框.name = `${部分名}_${键}`;
      单选框.value = 选项值;
      单选框.id = `${部分名}_${键}_${选项值}`;
      单选框.dataset.键 = 键;
      单选框.dataset.部分 = 部分名;

      if (值 && 值 === 选项值) {
        单选框.checked = true;
      }

      const 处理改变 = () => {
        if (单选框.checked) {
          this.更新文件数据(部分名, 键, 选项值);
          if (this.自动保存) {
            this.保存文件();
          }
        }
      };

      单选框.addEventListener("change", 处理改变);

      单选框项.addEventListener("click", (e) => {
        if (e.target !== 单选框 && e.target !== 标签) {
          e.preventDefault();
          e.stopPropagation();
          单选框.checked = true;
          单选框.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });

      const 标签 = document.createElement("label");
      标签.htmlFor = 单选框.id;
      标签.textContent = 选项值;

      单选框项.appendChild(单选框);
      单选框项.appendChild(标签);
      单选框组.appendChild(单选框项);
    }

    容器.appendChild(单选框组);
  }

  更新文件数据(部分名, 键, 值) {
    if (!this.文件数据[部分名]) {
      this.文件数据[部分名] = [];
    }

    let 已找到 = false;
    for (let i = 0; i < this.文件数据[部分名].length; i++) {
      const 属性 = this.解析属性行(this.文件数据[部分名][i]);
      if (属性 && 属性.键 === 键) {
        this.文件数据[部分名][i] = `${键}: ${值}`;
        已找到 = true;
        break;
      }
    }

    if (!已找到) {
      this.文件数据[部分名].push(`${键}: ${值}`);
    }

    if (部分名 !== "[V4+ Styles]") {
      if (!this.自动保存) {
        this.检查文件是否已修改();
      }
    }
  }

  保存文件() {
    if (!this.当前文件 || !this.文件数据) return;

    if (!this.自动保存) {
      this.文件已修改 = true;
      this.更新保存按钮状态();
      return;
    }

    if (this.保存定时器) {
      clearTimeout(this.保存定时器);
    }

    this.保存定时器 = setTimeout(async () => {
      const 保存成功 = await this.执行保存();
      if (保存成功) {
        this.原始文件数据 = this.深拷贝文件数据(this.文件数据);
        this.文件已修改 = false;
        this.更新保存按钮状态();
      }
    }, 500);
  }

  更新保存按钮状态() {
    const 保存按钮 = document.getElementById("保存按钮");
    if (!保存按钮) return;

    if (this.自动保存) {
      保存按钮.classList.add("禁用");
      return;
    }

    if (this.文件已修改) {
      保存按钮.classList.remove("禁用");
    } else {
      保存按钮.classList.add("禁用");
    }

    // 更新全部撤销按钮状态
    const 全部撤销按钮 = document.getElementById("全部撤销按钮");
    if (全部撤销按钮) {
      if (this.文件已修改) {
        全部撤销按钮.classList.remove("禁用");
      } else {
        全部撤销按钮.classList.add("禁用");
      }
    }
  }

  显示保存成功提示(文本 = "保存成功") {
    if (typeof document === "undefined") return;

    if (!this.保存提示元素) {
      const 提示 = document.createElement("div");
      提示.className = "保存成功提示";
      提示.textContent = 文本;
      document.body.appendChild(提示);
      this.保存提示元素 = 提示;
    } else {
      this.保存提示元素.textContent = 文本;
    }

    if (this.保存提示隐藏定时器) {
      clearTimeout(this.保存提示隐藏定时器);
    }

    if (this.保存提示隐藏动画) {
      this.保存提示隐藏动画.cancel();
      this.保存提示隐藏动画 = null;
    }

    if (this.保存提示显示动画) {
      this.保存提示显示动画.cancel();
      this.保存提示显示动画 = null;
    }

    // 使用 Web Animation API 播放弹出动画
    const 显示关键帧 = [
      { opacity: 0, transform: "translate(-50%, 12px)" },
      { opacity: 1, transform: "translate(-50%, 0)" },
    ];

    this.保存提示显示动画 = this.保存提示元素.animate(显示关键帧, {
      duration: 250,
      easing: "ease-out",
      fill: "forwards",
    });

    this.保存提示显示动画.onfinish = () => {
      this.保存提示显示动画 = null;
    };

    this.保存提示隐藏定时器 = setTimeout(() => {
      if (this.保存提示显示动画) {
        this.保存提示显示动画.finish();
      }

      const 隐藏关键帧 = [
        { opacity: 1, transform: "translate(-50%, 0)" },
        { opacity: 0, transform: "translate(-50%, 12px)" },
      ];

      this.保存提示隐藏动画 = this.保存提示元素.animate(隐藏关键帧, {
        duration: 200,
        easing: "ease-in",
        fill: "forwards",
      });

      this.保存提示隐藏动画.onfinish = () => {
        this.保存提示隐藏动画 = null;
        this.保存提示元素.classList.remove("保存成功提示-显示");
      };
    }, 1600);
  }

  全部撤销() {
    if (!this.原始文件数据 || !this.文件数据) return;

    this.文件数据 = this.深拷贝文件数据(this.原始文件数据);

    this.渲染UI();

    this.文件已修改 = false;
    this.更新保存按钮状态();
  }

  async 执行保存() {
    if (!this.当前文件 || !this.文件数据) return false;

    let 内容 = "";
    const 部分顺序 = ["[Script Info]", "[Aegisub Project Garbage]", "[V4+ Styles]", "[Events]"];

    for (const 部分名 of 部分顺序) {
      if (this.文件数据[部分名] && this.文件数据[部分名].length > 0) {
        内容 += 部分名 + "\n";
        for (const 行 of this.文件数据[部分名]) {
          内容 += 行 + "\n";
        }
        内容 += "\n";
      }
    }

    if (this.文件句柄) {
      try {
        const 可写流 = await this.文件句柄.createWritable();
        await 可写流.write(内容);
        await 可写流.close();
        this.显示保存成功提示();
        return true;
      } catch (error) {
        if (error.name === "AbortError") {
          return false;
        }
        console.error("写入文件失败:", error);
        return false;
      }
    }

    if (window.showSaveFilePicker) {
      try {
        const 文件句柄 = await window.showSaveFilePicker({
          suggestedName: this.当前文件.name,
          types: [
            {
              description: "ASS字幕文件",
              accept: {
                "text/plain": [".ass"],
              },
            },
          ],
        });
        const 可写流 = await 文件句柄.createWritable();
        await 可写流.write(内容);
        await 可写流.close();
        this.文件句柄 = 文件句柄;
        this.当前文件 = await 文件句柄.getFile();
        document.getElementById("文件名").textContent = this.当前文件.name;
        this.显示保存成功提示();
        return true;
      } catch (error) {
        if (error.name === "AbortError") {
          return false;
        }
        console.error("保存文件失败:", error);
        const blob = new Blob([内容], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = this.当前文件.name;
        a.click();
        URL.revokeObjectURL(url);
        this.显示保存成功提示();
        return true;
      }
    } else {
      const blob = new Blob([内容], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = this.当前文件.name;
      a.click();
      URL.revokeObjectURL(url);
      this.显示保存成功提示();
      return true;
    }
  }

  关闭文件() {
    if (this.表头固定清理函数) {
      this.表头固定清理函数.forEach((清理函数) => 清理函数());
      this.表头固定清理函数 = [];
    }

    this.当前文件 = null;
    this.文件句柄 = null;
    this.文件数据 = null;
    this.原始文件内容 = null;
    this.原始文件数据 = null;
    this.文件已修改 = false;

    const ASS区 = document.getElementById("ASS区");
    if (ASS区) {
      ASS区.innerHTML = "";
    }

    const 文件名显示区 = document.querySelector(".文件名显示区");
    if (文件名显示区) {
      文件名显示区.classList.add("隐藏");
    }

    const 关闭文件按钮 = document.getElementById("关闭文件按钮");
    if (关闭文件按钮) {
      关闭文件按钮.classList.add("禁用");
    }

    const 文件选择 = document.getElementById("文件选择");
    if (文件选择) {
      文件选择.value = "";
    }

    this.更新保存按钮状态();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ASSParser();
});
