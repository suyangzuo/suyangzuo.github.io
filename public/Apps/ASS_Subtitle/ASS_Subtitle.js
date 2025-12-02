// ASS字幕解析器
class ASSParser {
  constructor() {
    this.当前文件 = null;
    this.文件句柄 = null; // File System Access API的文件句柄
    this.文件数据 = null;
    this.原始文件内容 = null; // 保存原始文件内容，用于检测变化
    this.自动保存 = false;
    this.保存定时器 = null;
    this.文件已修改 = false;
    this.初始化();
  }

  初始化() {
    const 文件选择 = document.getElementById("文件选择");
    const 文件选择按钮 = document.querySelector(".文件选择按钮");
    const 自动保存复选框 = document.getElementById("自动保存复选框");
    const 保存按钮 = document.getElementById("保存按钮");

    // 优先使用File System Access API打开文件
    if (文件选择按钮) {
      文件选择按钮.addEventListener("click", (e) => {
        e.preventDefault();
        this.打开文件();
      });
    }
    
    // 保留传统的input方式作为后备
    文件选择.addEventListener("change", (e) => this.处理文件选择(e));
    
    自动保存复选框.addEventListener("change", (e) => {
      this.自动保存 = e.target.checked;
      this.更新保存按钮状态();
    });
    保存按钮.addEventListener("click", async () => {
      if (!保存按钮.classList.contains("禁用")) {
        await this.执行保存();
        this.文件已修改 = false;
        this.更新保存按钮状态();
      }
    });
  }

  处理文件选择(event) {
    const 文件 = event.target.files[0];
    if (!文件) return;

    this.当前文件 = 文件;
    this.文件句柄 = null; // 重置文件句柄，因为通过input选择的文件无法获取句柄
    document.getElementById("文件名").textContent = 文件.name;

    const 读取器 = new FileReader();
    读取器.onload = (e) => {
      const 内容 = e.target.result;
      this.解析ASS文件(内容);
    };
    读取器.readAsText(文件, "UTF-8");
  }

  // 使用File System Access API打开文件
  async 打开文件() {
    try {
      // 检查浏览器是否支持File System Access API
      if (!window.showOpenFilePicker) {
        // 如果不支持，回退到传统的input方式
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
      // 用户取消选择文件
      if (error.name !== "AbortError") {
        console.error("打开文件失败:", error);
        // 回退到传统的input方式
        document.getElementById("文件选择").click();
      }
    }
  }

  解析ASS文件(内容) {
    // 保存原始文件内容
    this.原始文件内容 = 内容;
    this.文件已修改 = false;
    
    const 行 = 内容.split(/\r?\n/);
    const 部分 = {};
    let 当前部分 = null;
    let 当前部分内容 = [];

    for (let i = 0; i < 行.length; i++) {
      const 行内容 = 行[i].trim();

      // 检测部分标题
      if (行内容.startsWith("[") && 行内容.endsWith("]")) {
        // 保存上一个部分
        if (当前部分) {
          部分[当前部分] = 当前部分内容;
        }
        // 开始新部分
        当前部分 = 行内容;
        当前部分内容 = [];
        continue;
      }

      // 跳过空行和注释
      if (!行内容 || 行内容.startsWith(";") || 行内容.startsWith("!")) {
        continue;
      }

      // 添加到当前部分
      if (当前部分) {
        当前部分内容.push(行内容);
      }
    }

    // 保存最后一个部分
    if (当前部分) {
      部分[当前部分] = 当前部分内容;
    }

    this.文件数据 = 部分;
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

    // 渲染 [Script Info]
    if (this.文件数据["[Script Info]"]) {
      this.渲染ScriptInfo(ASS区);
    }

    // 渲染 [Aegisub Project Garbage]
    if (this.文件数据["[Aegisub Project Garbage]"]) {
      this.渲染AegisubProjectGarbage(ASS区);
    }

    // 渲染 [V4+ Styles]
    if (this.文件数据["[V4+ Styles]"]) {
      this.渲染V4Styles(ASS区);
    }
  }

  渲染ScriptInfo(容器) {
    const 部分区 = document.createElement("div");
    部分区.className = "部分区";

    const 标题 = document.createElement("div");
    标题.className = "部分标题";
    标题.textContent = "[Script Info]";
    部分区.appendChild(标题);

    const 属性组 = document.createElement("div");
    属性组.className = "属性组";

    const 属性映射 = this.解析部分属性(this.文件数据["[Script Info]"]);

    // 特殊处理 ScaledBorderAndShadow
    const 需要显示的属性 = { ...属性映射 };
    if (!需要显示的属性["ScaledBorderAndShadow"]) {
      需要显示的属性["ScaledBorderAndShadow"] = "";
    }

    // 定义属性信息
    const 属性信息 = {
      Title: { 中文: "标题", 类型: "文本" },
      ScriptType: { 中文: "脚本类型", 类型: "文本" },
      ScaledBorderAndShadow: { 中文: "缩放边框和阴影", 类型: "枚举", 选项: ["yes", "no"] },
      Collisions: { 中文: "碰撞", 类型: "枚举", 选项: ["Normal", "Reverse"] },
      PlayResX: { 中文: "播放分辨率X", 类型: "数字" },
      PlayResY: { 中文: "播放分辨率Y", 类型: "数字" },
      Timer: { 中文: "计时器", 类型: "数字" },
      WrapStyle: { 中文: "换行样式", 类型: "数字" },
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
    部分区.className = "部分区";

    const 标题 = document.createElement("div");
    标题.className = "部分标题";
    标题.textContent = "[Aegisub Project Garbage]";
    部分区.appendChild(标题);

    const 属性组 = document.createElement("div");
    属性组.className = "属性组";

    const 属性映射 = this.解析部分属性(this.文件数据["[Aegisub Project Garbage]"]);

    for (const [键, 值] of Object.entries(属性映射)) {
      this.创建属性项(属性组, 键, 值, { 中文: 键, 类型: "文本" }, "[Aegisub Project Garbage]");
    }

    部分区.appendChild(属性组);
    容器.appendChild(部分区);
  }

  渲染V4Styles(容器) {
    const 部分区 = document.createElement("div");
    部分区.className = "部分区";

    const 标题 = document.createElement("div");
    标题.className = "部分标题";
    标题.textContent = "[V4+ Styles]";
    部分区.appendChild(标题);

    const 行 = this.文件数据["[V4+ Styles]"];
    let 格式行 = null;
    const 样式行 = [];

    // 分离格式行和样式行
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

    // 解析Format行，获取字段列表
    const 格式属性 = this.解析属性行(格式行);
    if (!格式属性) {
      部分区.appendChild(document.createTextNode("格式解析失败"));
      容器.appendChild(部分区);
      return;
    }

    const 字段列表 = 格式属性.值.split(",").map((字段) => 字段.trim());
    
    // 缓存字段列表，供更新样式单元格时使用
    this.V4Styles字段列表 = 字段列表;

    // 字段中英文映射
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
      Alignment: "对齐方式",
      MarginL: "左边距",
      MarginR: "右边距",
      MarginV: "垂直边距",
      Encoding: "编码",
    };

    // 判断字段是否为数字类型
    const 数字字段 = new Set([
      "Fontsize",
      "Bold",
      "Italic",
      "Underline",
      "StrikeOut",
      "ScaleX",
      "ScaleY",
      "Spacing",
      "Angle",
      "BorderStyle",
      "Outline",
      "Shadow",
      "Alignment",
      "MarginL",
      "MarginR",
      "MarginV",
      "Encoding",
    ]);

    // 解析所有Style行，获取每个Style的值
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

    // 创建表格
    const 表格容器 = document.createElement("div");
    表格容器.className = "样式表格容器";

    const 表格 = document.createElement("table");
    表格.className = "样式表格";

    // 创建表头：每列是Format字段（中英文）
    const 表头行 = document.createElement("tr");
    表头行.className = "表头行";

    // 每列是Format字段
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

    // 创建表身：每行对应一个Style
    for (let i = 0; i < 样式数据.length; i++) {
      const 样式 = 样式数据[i];
      const 数据行 = document.createElement("tr");
      数据行.className = `数据行 ${i % 2 === 0 ? "偶数行" : "奇数行"}`;
      数据行.dataset.样式索引 = i;

      // 每列是该Style在不同字段中的值
      for (let j = 0; j < 字段列表.length; j++) {
        const 字段 = 字段列表[j];
        const 值 = 样式.值列表[j] ? 样式.值列表[j].trim() : "";

        const 单元格 = document.createElement("td");
        单元格.className = "数据单元格 单元格";

        // 如果是"名称"列（Name字段），直接显示文本，不允许编辑
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
          // 颜色字段：先创建显示元素，稍后初始化Pickr
          this.创建颜色选择器占位(单元格, 字段, 值, i, j);
        } else {
          const 是数字 = 数字字段.has(字段);
          if (是数字) {
            this.创建表格数字框(单元格, 字段, 值, i, j);
          } else {
            this.创建表格文本框(单元格, 字段, 值, i, j);
          }
        }

        数据行.appendChild(单元格);
      }

      表格.appendChild(数据行);
    }

    表格容器.appendChild(表格);
    部分区.appendChild(表格容器);
    容器.appendChild(部分区);

    // 等待DOM渲染完成后，初始化所有颜色选择器
    setTimeout(() => {
      this.初始化所有颜色选择器(表格);
    }, 0);
  }

  初始化所有颜色选择器(表格) {
    const 所有颜色显示元素 = 表格.querySelectorAll(".颜色显示文本");

    所有颜色显示元素.forEach((颜色显示div) => {
      const 字段 = 颜色显示div.dataset.字段;
      const 样式索引 = parseInt(颜色显示div.dataset.样式索引);
      const 字段索引 = parseInt(颜色显示div.dataset.字段索引);
      // 从dataset获取原始值，如果不存在则从textContent提取
      let 当前值 = 颜色显示div.dataset.原始值 || "";
      if (!当前值) {
        // 如果dataset中没有，尝试从textContent提取（移除所有span标签）
        当前值 = 颜色显示div.textContent || "";
      }

      // 创建隐藏的按钮用于Pickr（不占用布局空间）
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

      // 将按钮添加到body中，不占用表格布局
      document.body.appendChild(颜色按钮);

      // 将ASS颜色格式转换为RGBA字符串
      const rgba对象 = this.ASS颜色转RGBA(当前值);
      const rgba颜色字符串 = `rgba(${rgba对象.r}, ${rgba对象.g}, ${rgba对象.b}, ${rgba对象.a})`;

      // 初始化Pickr
      const pickr = Pickr.create({
        el: 颜色按钮,
        theme: "monolith",
        default: rgba颜色字符串,
        swatches: null,
        components: {
          preview: true,
          opacity: true,
          hue: true,
          interaction: {
            hex: false,
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

      // 监听颜色变化
      pickr.on("change", (color) => {
        try {
          // Pickr的toRGBA()返回的是数组 [r, g, b, a]
          const rgba数组 = color.toRGBA();
          const rgba = {
            r: rgba数组[0] || 0,
            g: rgba数组[1] || 0,
            b: rgba数组[2] || 0,
            a: rgba数组[3] !== undefined ? rgba数组[3] : 1,
          };

          // 验证值是否有效
          if (isNaN(rgba.r) || isNaN(rgba.g) || isNaN(rgba.b) || isNaN(rgba.a)) {
            console.error("颜色值无效:", rgba);
            return;
          }

          const ass颜色 = this.RGBA转ASS颜色(rgba);
          颜色显示div.innerHTML = "";
          this.渲染颜色文本(颜色显示div, ass颜色);
          颜色显示div.dataset.原始值 = ass颜色; // 更新原始值
          this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, ass颜色);
          // 颜色字段不是"Name"，所以直接触发保存（如果自动保存已选中）
          if (this.自动保存) {
            this.保存文件();
          }
        } catch (error) {
          console.error("颜色转换错误:", error);
        }
      });

      // 创建遮罩层容器
      const 遮罩容器 = document.createElement("div");
      遮罩容器.className = "颜色选择器遮罩容器";
      遮罩容器.style.display = "none";
      document.body.appendChild(遮罩容器);

      // 创建四个遮罩div（上、下、左、右）来包围单元格
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

      // 点击遮罩层关闭颜色选择器
      const 关闭颜色选择器 = () => {
        pickr.hide();
      };
      遮罩上.addEventListener("click", 关闭颜色选择器);
      遮罩下.addEventListener("click", 关闭颜色选择器);
      遮罩左.addEventListener("click", 关闭颜色选择器);
      遮罩右.addEventListener("click", 关闭颜色选择器);

      // 创建单元格遮罩层（透明，用于阻止交互）
      const 单元格遮罩 = document.createElement("div");
      单元格遮罩.className = "单元格遮罩";
      单元格遮罩.style.display = "none";
      document.body.appendChild(单元格遮罩);

      // 监听Pickr显示和隐藏事件
      pickr.on("show", () => {
        遮罩容器.style.display = "block";
        // 计算单元格位置，调整四个遮罩div的位置和大小
        const 单元格 = 颜色显示div.closest(".数据单元格");
        if (单元格) {
          const 单元格Rect = 单元格.getBoundingClientRect();
          const 视口宽度 = window.innerWidth;
          const 视口高度 = window.innerHeight;
          
          // 上方遮罩：从顶部到单元格顶部
          遮罩上.style.top = "0";
          遮罩上.style.left = "0";
          遮罩上.style.width = "100vw";
          遮罩上.style.height = `${单元格Rect.top}px`;
          
          // 下方遮罩：从单元格底部到底部
          遮罩下.style.top = `${单元格Rect.bottom}px`;
          遮罩下.style.left = "0";
          遮罩下.style.width = "100vw";
          遮罩下.style.height = `${视口高度 - 单元格Rect.bottom}px`;
          
          // 左侧遮罩：从单元格左侧到右侧，高度为单元格高度（向左扩展1px，所以宽度减少1px）
          遮罩左.style.top = `${单元格Rect.top}px`;
          遮罩左.style.left = "0";
          遮罩左.style.width = `${单元格Rect.left - 1}px`;
          遮罩左.style.height = `${单元格Rect.height}px`;
          
          // 右侧遮罩：从单元格右侧到视口右侧，高度为单元格高度
          遮罩右.style.top = `${单元格Rect.top}px`;
          遮罩右.style.left = `${单元格Rect.right + 1}px`;
          遮罩右.style.width = `${视口宽度 - 单元格Rect.right}px`;
          遮罩右.style.height = `${单元格Rect.height}px`;
          
          // 单元格遮罩：覆盖单元格区域，透明但阻止交互（向左扩展1px）
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

      // 点击颜色显示区域时打开颜色选择器，并调整位置
      颜色显示div.parentElement.addEventListener("click", (e) => {
        // 先显示，然后调整位置
        颜色显示div.parentElement.classList.add("当前");
        pickr.show();

        // 使用requestAnimationFrame确保面板已渲染
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

          // 计算理想位置：默认在单元格右下方
          let 新Left = 单元格Rect.right + 间距;
          let 新Top = 单元格Rect.top;

          // 检查右侧空间
          if (新Left + 面板Rect.width > 视口宽度 - 间距) {
            // 右侧空间不足，尝试左侧
            const 左侧位置 = 单元格Rect.left - 面板Rect.width - 间距;
            if (左侧位置 >= 间距) {
              新Left = 左侧位置;
            } else {
              // 左右都不够，居中显示在单元格上方或下方
              新Left = Math.max(间距, 单元格Rect.left + (单元格Rect.width - 面板Rect.width) / 2);
            }
          }

          // 检查下方空间
          if (新Top + 面板Rect.height > 视口高度 - 间距) {
            // 下方空间不足，尝试上方
            const 上方位置 = 单元格Rect.bottom - 面板Rect.height - 间距;
            if (上方位置 >= 间距) {
              新Top = 上方位置;
            } else {
              // 上下都不够，显示在视口内
              新Top = Math.max(间距, 视口高度 - 面板Rect.height - 间距);
            }
          }

          // 确保不超出视口
          新Left = Math.max(间距, Math.min(新Left, 视口宽度 - 面板Rect.width - 间距));
          新Top = Math.max(间距, Math.min(新Top, 视口高度 - 面板Rect.height - 间距));

          // 应用位置
          面板.style.position = "fixed";
          面板.style.left = `${新Left}px`;
          面板.style.top = `${新Top}px`;
          面板.style.zIndex = "10001";
        });
      });
    });
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

    // 判断是颜色字段
    const 是颜色字段 =
      字段 === "PrimaryColour" || 字段 === "SecondaryColour" || 字段 === "OutlineColour" || 字段 === "BackColour";

    if (是颜色字段) {
      this.渲染颜色文本(可编辑div, 值);
    } else {
      可编辑div.textContent = 值;
    }

    可编辑div.addEventListener("input", () => {
      const 文本内容 = 可编辑div.textContent || "";
      this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, 文本内容);
      // 只有当字段不是"Name"时，才触发保存（从"字体名称"到"编码"的列）
      if (字段 !== "Name" && this.自动保存) {
        this.保存文件();
      }
      // 如果是颜色字段，在输入时移除所有span，只保留文本
      if (是颜色字段) {
        const 纯文本 = 可编辑div.textContent || "";
        可编辑div.textContent = 纯文本;
      }
    });

    // 如果是颜色字段，失焦时重新渲染颜色
    if (是颜色字段) {
      可编辑div.addEventListener("blur", () => {
        const 文本内容 = 可编辑div.textContent || "";
        this.渲染颜色文本(可编辑div, 文本内容);
      });
    }

    可编辑div.addEventListener("paste", (e) => {
      e.preventDefault();
      const 文本 = (e.clipboardData || window.clipboardData).getData("text");
      document.execCommand("insertText", false, 文本);
    });

    // 键盘事件：阻止回车换行、阻止空格、ESC失焦
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
    });

    包装div.appendChild(可编辑div);
    容器.appendChild(包装div);
  }

  渲染颜色文本(容器, 文本) {
    // 清空容器
    容器.innerHTML = "";

    if (!文本) {
      容器.textContent = "";
      return;
    }

    // 遍历每个字符，按索引位置设置颜色
    for (let i = 0; i < 文本.length; i++) {
      const 字符 = 文本[i];
      const span = document.createElement("span");

      if (i === 0) {
        // 索引0: "&"
        span.style.color = "#777";
        span.textContent = 字符;
      } else if (i === 1) {
        // 索引1: "H"
        span.style.color = "#777";
        span.textContent = 字符;
      } else if (i >= 2 && i <= 3) {
        // 索引2-3: 不透明度（Alpha）
        span.style.color = "silver";
        span.textContent = 字符;
      } else if (i >= 4 && i <= 5) {
        // 索引4-5: R（红色）
        span.style.color = "lightcoral";
        span.textContent = 字符;
      } else if (i >= 6 && i <= 7) {
        // 索引6-7: G（绿色）
        span.style.color = "lightgreen";
        span.textContent = 字符;
      } else if (i >= 8 && i <= 9) {
        // 索引8-9: B（蓝色）
        span.style.color = "lightskyblue";
        span.textContent = 字符;
      } else {
        // 其他位置：默认颜色
        span.textContent = 字符;
      }

      容器.appendChild(span);
    }
  }

  创建颜色选择器占位(容器, 字段, 值, 样式索引, 字段索引) {
    const 包装div = document.createElement("div");
    包装div.className = "颜色选择器包装";

    // 创建显示颜色文本的div（占位，稍后初始化Pickr）
    const 颜色显示div = document.createElement("div");
    颜色显示div.className = "颜色显示文本";
    颜色显示div.dataset.字段 = 字段;
    颜色显示div.dataset.样式索引 = 样式索引;
    颜色显示div.dataset.字段索引 = 字段索引;
    颜色显示div.dataset.原始值 = 值; // 保存原始值，供Pickr初始化使用

    // 渲染颜色文本
    this.渲染颜色文本(颜色显示div, 值);

    包装div.appendChild(颜色显示div);
    容器.appendChild(包装div);
  }

  ASS颜色转RGBA(ass颜色) {
    if (!ass颜色 || !ass颜色.startsWith("&H")) {
      return { r: 255, g: 255, b: 255, a: 1 };
    }

    // 移除&H前缀
    const 十六进制 = ass颜色.substring(2);

    if (十六进制.length < 8) {
      return { r: 255, g: 255, b: 255, a: 1 };
    }

    // 解析：AABBGGRR
    // 注意：ASS中不透明度是反向的，00=完全不透明，FF=完全透明
    const AA = parseInt(十六进制.substring(0, 2), 16);
    const BB = parseInt(十六进制.substring(2, 4), 16);
    const GG = parseInt(十六进制.substring(4, 6), 16);
    const RR = parseInt(十六进制.substring(6, 8), 16);

    // 将ASS的不透明度反向转换为RGBA的不透明度
    // ASS: 00(完全不透明) -> RGBA: 1.0, FF(完全透明) -> RGBA: 0.0
    const 反向Alpha = (255 - AA) / 255;

    return {
      r: RR,
      g: GG,
      b: BB,
      a: 反向Alpha,
    };
  }

  RGBA转ASS颜色(rgba) {
    // 确保所有值都是有效数字，并限制范围
    const r = Math.max(0, Math.min(255, Math.round(Number(rgba.r) || 0)));
    const g = Math.max(0, Math.min(255, Math.round(Number(rgba.g) || 0)));
    const b = Math.max(0, Math.min(255, Math.round(Number(rgba.b) || 0)));
    const a = Math.max(0, Math.min(1, Number(rgba.a) !== undefined ? Number(rgba.a) : 1));

    const RR = r.toString(16).padStart(2, "0").toUpperCase();
    const GG = g.toString(16).padStart(2, "0").toUpperCase();
    const BB = b.toString(16).padStart(2, "0").toUpperCase();
    
    // 注意：ASS中不透明度是反向的，需要将RGBA的Alpha反向转换
    // RGBA: 1.0(完全不透明) -> ASS: 00, RGBA: 0.0(完全透明) -> ASS: FF
    const 反向Alpha = Math.round((1 - a) * 255);
    const AA = 反向Alpha.toString(16).padStart(2, "0").toUpperCase();

    return `&H${AA}${BB}${GG}${RR}`;
  }

  创建表格数字框(容器, 字段, 值, 样式索引, 字段索引) {
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

    const 按钮组 = document.createElement("div");
    按钮组.className = "表格数字增减按钮组";

    const 增加按钮 = document.createElement("div");
    增加按钮.className = "表格数字增减按钮";
    增加按钮.textContent = "+";
    增加按钮.addEventListener("click", () => {
      const 当前值 = parseFloat(可编辑div.textContent) || 0;
      可编辑div.textContent = 当前值 + 1;
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
      可编辑div.textContent = 当前值 - 1;
      this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, 可编辑div.textContent);
      if (this.自动保存) {
        this.保存文件();
      }
    });

    // 输入验证：只允许数字和负号（负号必须在开头）
    const 处理输入 = () => {
      let 文本内容 = 可编辑div.textContent || "";
      // 移除非数字和非负号字符
      文本内容 = 文本内容.replace(/[^\d-]/g, "");
      // 确保只有一个负号，且必须在开头
      if (文本内容.includes("-")) {
        const 负号位置 = 文本内容.indexOf("-");
        if (负号位置 !== 0) {
          // 如果负号不在开头，移除所有负号，然后在开头添加一个
          文本内容 = "-" + 文本内容.replace(/-/g, "");
        } else {
          // 如果负号在开头，移除其他位置的负号
          const 负号后内容 = 文本内容.substring(1).replace(/-/g, "");
          文本内容 = "-" + 负号后内容;
        }
      }

      if (可编辑div.textContent !== 文本内容) {
        可编辑div.textContent = 文本内容;
        // 移动光标到末尾
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
      // 只保留数字和负号
      let 数字文本 = 文本.replace(/[^\d-]/g, "");
      // 确保负号在开头
      if (数字文本.includes("-")) {
        const 负号位置 = 数字文本.indexOf("-");
        if (负号位置 !== 0) {
          数字文本 = "-" + 数字文本.replace(/-/g, "");
        } else {
          数字文本 = "-" + 数字文本.substring(1).replace(/-/g, "");
        }
      }
      document.execCommand("insertText", false, 数字文本);
    });

    // 键盘事件：阻止非数字和非负号字符的输入
    可编辑div.addEventListener("keydown", (e) => {
      // 阻止回车换行
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        return;
      }
      // ESC失焦
      if (e.key === "Escape") {
        e.preventDefault();
        可编辑div.blur();
        return;
      }
      // 允许控制键（退格、删除、方向键等）
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

      // 允许数字
      if (/^\d$/.test(e.key)) {
        return;
      }

      // 允许负号，但只能在开头
      if (e.key === "-") {
        const 当前文本 = 可编辑div.textContent || "";
        const 选择 = window.getSelection();
        if (选择.rangeCount > 0) {
          const range = 选择.getRangeAt(0);
          // 如果选中的是整个内容，允许输入负号（会替换）
          if (range.startOffset === 0 && range.endOffset === 可编辑div.textContent.length) {
            return;
          }
          // 如果光标在开头且当前没有负号，允许输入负号
          if (range.startOffset === 0 && range.endOffset === 0 && !当前文本.startsWith("-")) {
            return;
          }
        }
        e.preventDefault();
        return;
      }

      // 阻止其他字符
      e.preventDefault();
    });

    // 失焦时，如果文本为空，自动设置为0
    可编辑div.addEventListener("blur", () => {
      const 文本内容 = 可编辑div.textContent.trim();
      if (!文本内容 || 文本内容 === "" || 文本内容 === "-") {
        可编辑div.textContent = "0";
        this.更新样式单元格("[V4+ Styles]", 样式索引, 字段索引, "0");
        // 只有当字段不是"Name"时，才触发保存（从"字体名称"到"编码"的列）
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

  更新样式单元格(部分名, 样式索引, 字段索引, 值) {
    if (!this.文件数据[部分名]) return;

    // 找到所有Style行的索引
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

    // 保留原始的分隔符格式（可能有空格）
    const 值列表 = 样式属性.值.split(",");
    if (字段索引 < 值列表.length) {
      值列表[字段索引] = 值;
      // 重新组合，保留原始格式
      const 新值 = 值列表.join(",");
      this.文件数据[部分名][实际行索引] = `Style: ${新值}`;
      
      // 只有当字段不是"Name"时，才标记文件已修改（从"字体名称"到"编码"的列）
      if (部分名 === "[V4+ Styles]" && this.V4Styles字段列表) {
        const 当前字段 = this.V4Styles字段列表[字段索引];
        if (当前字段 && 当前字段 !== "Name") {
          // 如果自动保存未选中，标记文件已修改
          if (!this.自动保存) {
            this.文件已修改 = true;
            this.更新保存按钮状态();
          }
        }
      }
    }
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

    // 根据类型创建不同的输入控件
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
    增加按钮.textContent = "▲";
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
    减少按钮.textContent = "▼";
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

      // 特殊处理：如果值为空（ScaledBorderAndShadow不存在时），都不选中
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

      // 让整个单选框项可以点击
      单选框项.addEventListener("click", (e) => {
        // 如果点击的不是单选框本身和label，则触发单选框的点击
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

    // 查找并更新对应的行
    let 已找到 = false;
    for (let i = 0; i < this.文件数据[部分名].length; i++) {
      const 属性 = this.解析属性行(this.文件数据[部分名][i]);
      if (属性 && 属性.键 === 键) {
        this.文件数据[部分名][i] = `${键}: ${值}`;
        已找到 = true;
        break;
      }
    }

    // 如果没找到，添加新行
    if (!已找到) {
      this.文件数据[部分名].push(`${键}: ${值}`);
    }

    // 对于非[V4+ Styles]的部分，任何值改变都标记文件已修改
    if (部分名 !== "[V4+ Styles]") {
      // 如果自动保存未选中，标记文件已修改
      if (!this.自动保存) {
        this.文件已修改 = true;
        this.更新保存按钮状态();
      }
    }
  }

  保存文件() {
    if (!this.当前文件 || !this.文件数据) return;

    // 如果自动保存未选中，只标记为已修改，不执行保存
    if (!this.自动保存) {
      this.文件已修改 = true;
      this.更新保存按钮状态();
      return;
    }

    // 清除之前的定时器
    if (this.保存定时器) {
      clearTimeout(this.保存定时器);
    }

    // 使用防抖，延迟500ms后保存
    this.保存定时器 = setTimeout(() => {
      this.执行保存();
      this.文件已修改 = false;
      this.更新保存按钮状态();
    }, 500);
  }

  更新保存按钮状态() {
    const 保存按钮 = document.getElementById("保存按钮");
    if (!保存按钮) return;

    // 如果自动保存已选中，禁用保存按钮
    if (this.自动保存) {
      保存按钮.classList.add("禁用");
      return;
    }

    // 如果自动保存未选中
    if (this.文件已修改) {
      // 文件已修改，启用保存按钮
      保存按钮.classList.remove("禁用");
    } else {
      // 文件未修改，禁用保存按钮
      保存按钮.classList.add("禁用");
    }
  }

  async 执行保存() {
    if (!this.当前文件 || !this.文件数据) return;

    // 构建文件内容
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

    // 如果使用File System Access API打开的文件，直接写入
    if (this.文件句柄) {
      try {
        const 可写流 = await this.文件句柄.createWritable();
        await 可写流.write(内容);
        await 可写流.close();
        return; // 成功保存，直接返回
      } catch (error) {
        console.error("写入文件失败:", error);
        // 如果写入失败，回退到下载方式
      }
    }

    // 如果没有文件句柄（通过传统input打开的文件），使用下载方式
    const blob = new Blob([内容], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = this.当前文件.name;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  new ASSParser();
});
