// 字体教程交互功能
class FontTutorial {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.fontFamilies = ["Noto Sans SC", "微软雅黑", "Arial", "Consolas", "sans-serif"];
    this.fontSize = 18;
    this.fontSizeUnit = "px";
    this.fontWeight = "normal";
    this.fontStyle = "normal";

    this.chineseText =
      "三体是刘慈欣创作的科幻小说，讲述了地球文明与三体文明的接触与冲突。小说以宏大的宇宙观和深刻的哲学思考著称，被誉为中国科幻文学的里程碑之作。";
    this.englishText =
      "The Three-Body Problem is a science fiction novel by Liu Cixin that tells the story of contact and conflict between Earth civilization and the Trisolaran civilization. The novel is known for its grand cosmic perspective and profound philosophical reflections, and is considered a milestone in Chinese science fiction literature.";

    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupControls();
    this.render();
  }

  setupCanvas() {
    const canvasContainer = document.querySelector(".展示区");
    canvasContainer.innerHTML = `
      <div class="canvas容器">
        <div id="textContainer"></div>
      </div>
    `;

    this.textContainer = document.getElementById("textContainer");
    this.render();
  }

  setupControls() {
    this.bindEvents();
    this.updateFontSizeConstraints();
    this.updateFontPreview();
  }

  bindEvents() {
    // 字体输入框事件
    const fontInputs = document.querySelectorAll(".字体输入框");
    fontInputs.forEach((input) => {
      input.addEventListener("input", () => this.updateFontFamilies());
    });

    // 添加字体按钮
    document.getElementById("addFontBtn").addEventListener("click", () => this.addFontInput());

    // 为现有的删除按钮添加事件
    document.querySelectorAll(".删除字体按钮").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const inputGroup = btn.parentElement;
        const container = document.getElementById("fontFamilyInputs");
        const remainingInputs = container.querySelectorAll(".字体输入框");

        if (remainingInputs.length > 1) {
          container.removeChild(inputGroup);
          this.updateFontFamilies();
        }
      });
    });

    // 字体大小事件
    document.getElementById("fontSizeInput").addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      this.fontSize = value;
      
      // 格式化显示，浮点数保留一位小数
      if (!Number.isInteger(value)) {
        e.target.value = value.toFixed(1);
      }
      
      this.render();
    });

    // 增减按钮事件
    this.setupAutoIncrementButtons();

    document.getElementById("fontSizeUnit").addEventListener("change", (e) => {
      this.fontSizeUnit = e.target.value;
      this.updateFontSizeConstraints();
      this.render();
    });

    // 字体粗细事件
    document.querySelectorAll('input[name="fontWeight"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.fontWeight = e.target.value;
        this.render();
      });
    });

    // 字体样式事件
    document.querySelectorAll('input[name="fontStyle"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.fontStyle = e.target.value;
        this.render();
      });
    });
  }

  updateFontFamilies() {
    const inputs = document.querySelectorAll(".字体输入框");
    this.fontFamilies = Array.from(inputs)
      .map((input) => input.value.trim())
      .filter((value) => value.length > 0);

    // 确保至少有一个字体
    if (this.fontFamilies.length === 0) {
      this.fontFamilies = ["sans-serif"];
    }

    this.updateFontPreview();
    this.render();
  }

  addFontInput() {
    const container = document.getElementById("fontFamilyInputs");
    const inputGroup = document.createElement("div");
    inputGroup.className = "字体输入分组";

    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.className = "字体输入框";
    newInput.placeholder = "输入字体名称";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "删除字体按钮";
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.addEventListener("click", () => {
      container.removeChild(inputGroup);
      this.updateFontFamilies();
    });

    inputGroup.appendChild(newInput);
    inputGroup.appendChild(deleteBtn);

    // 在添加按钮之前插入新输入框组
    const addBtn = document.getElementById("addFontBtn");
    container.insertBefore(inputGroup, addBtn);

    newInput.addEventListener("input", () => this.updateFontFamilies());
    newInput.focus();
  }

  setupAutoIncrementButtons() {
    const decreaseBtn = document.getElementById("decreaseBtn");
    const increaseBtn = document.getElementById("increaseBtn");
    
    // 自动增减的配置
    const config = {
      initialDelay: 500, // 初始延迟750ms
      interval: 100,     // 自动增减间隔100ms
      autoIncrementTimer: null,
      holdTimer: null
    };
    
    // 格式化数值，浮点数保留一位小数
    const formatValue = (value) => {
      if (Number.isInteger(value)) {
        return value.toString();
      } else {
        return value.toFixed(1);
      }
    };
    
    // 更新字体大小
    const updateFontSize = (newValue) => {
      const input = document.getElementById("fontSizeInput");
      input.value = formatValue(newValue);
      this.fontSize = newValue;
      this.render();
    };
    
    // 减少按钮逻辑
    const decreaseValue = () => {
      const input = document.getElementById("fontSizeInput");
      const currentValue = parseFloat(input.value);
      const step = parseFloat(input.step);
      const minValue = parseFloat(input.min);
      
      if (currentValue > minValue) {
        const newValue = Math.max(minValue, currentValue - step);
        updateFontSize(newValue);
      }
    };
    
    // 增加按钮逻辑
    const increaseValue = () => {
      const input = document.getElementById("fontSizeInput");
      const currentValue = parseFloat(input.value);
      const step = parseFloat(input.step);
      const maxValue = parseFloat(input.max);
      
      if (currentValue < maxValue) {
        const newValue = Math.min(maxValue, currentValue + step);
        updateFontSize(newValue);
      }
    };
    
    // 停止自动增减
    const stopAutoIncrement = () => {
      if (config.autoIncrementTimer) {
        clearInterval(config.autoIncrementTimer);
        config.autoIncrementTimer = null;
      }
      if (config.holdTimer) {
        clearTimeout(config.holdTimer);
        config.holdTimer = null;
      }
    };
    
    // 开始自动增减
    const startAutoIncrement = (incrementFunc) => {
      // 立即执行一次
      incrementFunc();
      
      // 设置延迟后开始自动增减
      config.holdTimer = setTimeout(() => {
        config.autoIncrementTimer = setInterval(incrementFunc, config.interval);
      }, config.initialDelay);
    };
    
    // 减少按钮事件
    decreaseBtn.addEventListener("mousedown", () => {
      startAutoIncrement(decreaseValue);
    });
    
    decreaseBtn.addEventListener("click", (e) => {
      // 防止重复触发
      e.preventDefault();
    });
    
    // 增加按钮事件
    increaseBtn.addEventListener("mousedown", () => {
      startAutoIncrement(increaseValue);
    });
    
    increaseBtn.addEventListener("click", (e) => {
      // 防止重复触发
      e.preventDefault();
    });
    
    // 全局鼠标松开事件
    document.addEventListener("mouseup", stopAutoIncrement);
    document.addEventListener("mouseleave", stopAutoIncrement);
  }

  updateFontSizeConstraints() {
    const input = document.getElementById("fontSizeInput");
    const unit = this.fontSizeUnit;
    
    // 根据单位设置不同的约束
    switch (unit) {
      case "px":
        input.min = "12";
        input.max = "100";
        input.step = "1";
        break;
      case "em":
        input.min = "0.5";
        input.max = "10";
        input.step = "0.1";
        break;
      case "rem":
        input.min = "0.5";
        input.max = "10";
        input.step = "0.1";
        break;
      case "ch":
        input.min = "1";
        input.max = "10";
        input.step = "1";
        break;
      case "vw":
        input.min = "1";
        input.max = "100";
        input.step = "1";
        break;
    }
    
    // 确保当前值在范围内
    const currentValue = parseFloat(input.value);
    const minValue = parseFloat(input.min);
    const maxValue = parseFloat(input.max);
    
    if (currentValue < minValue) {
      input.value = minValue;
      this.fontSize = minValue;
    } else if (currentValue > maxValue) {
      input.value = maxValue;
      this.fontSize = maxValue;
    } else {
      // 格式化当前值，浮点数保留一位小数
      if (!Number.isInteger(currentValue)) {
        input.value = currentValue.toFixed(1);
      }
    }
  }

  updateFontPreview() {
    // 渲染带有彩色逗号和高亮的font-family
    const preview = document.getElementById("fontFamilyPreviewWrap");

    // 从实际的字体输入分组中获取字体列表
    const fontInputs = document.querySelectorAll("#fontFamilyInputs .字体输入框");
    const fonts = Array.from(fontInputs)
      .map((input) => input.value.trim())
      .filter((value) => value.length > 0);

    // 如果没有有效字体，使用默认值
    if (fonts.length === 0) {
      fonts.push("sans-serif");
    }

    // 检测中文和英文文本实际应用的字体
    const chineseFont = this.detectActualFont(this.chineseText);
    const englishFont = this.detectActualFont(this.englishText);

    // 更新字体输入框的背景色
    fontInputs.forEach((input) => {
      const font = input.value.trim();
      
      // 移除所有高亮类
      input.classList.remove("应用于中文", "应用于英文", "应用于混合", "应用于无");
      
      if (font === chineseFont && font === englishFont) {
        // 如果中英文都使用这个字体，使用混合背景
        input.classList.add("应用于混合");
      } else if (font === chineseFont) {
        // 如果只有中文使用这个字体，用绿色背景
        input.classList.add("应用于中文");
      } else if (font === englishFont) {
        // 如果只有英文使用这个字体，用金色背景
        input.classList.add("应用于英文");
      } else {
        // 如果这个字体没有被应用，不添加背景色
        input.classList.add("应用于无");
      }
    });

    preview.innerHTML =
      '<span class="属性名">font-family:</span> ' +
      fonts
        .map((font) => {
          let style = "";
          if (font === chineseFont && font === englishFont) {
            // 如果中英文都使用同一个字体，使用混合背景
            style = `
              background: linear-gradient(
                to bottom,
                rgba(41,200,78,0.25) 50%,
                rgba(255,200,41,0.25) 50%
              );
              border-radius: 4px;
              padding: 2px 4px;
            `;
          } else if (font === chineseFont) {
            // 如果只有中文使用这个字体，用绿色背景
            style = "background:rgba(41,200,78,0.25);border-radius:4px;padding:2px 4px;";
          } else if (font === englishFont) {
            // 如果只有英文使用这个字体，用金色背景
            style = "background:rgba(255,200,41,0.25);border-radius:4px;padding:2px 4px;";
          }
          return `<span style="${style}">${font}</span>`;
        })
        .join('<span style="color:#888">, </span>') +
      ";";
  }

  render() {
    if (!this.textContainer) return;

    // 清空容器
    this.textContainer.innerHTML = "";

    // 渲染中文文本
    this.renderText(this.chineseText, "chinese");

    // 渲染英文文本
    this.renderText(this.englishText, "english");
    
    // 更新字体预览和输入框高亮
    this.updateFontPreview();
  }

  renderText(text, type) {
    // 将文本分割成中文和英文片段
    const segments = this.splitTextByLanguage(text);

    // 创建段落容器
    const paragraph = document.createElement("div");
    paragraph.style.cssText = `
      font-family: ${this.fontFamilies.join(", ")};
      font-size: ${this.fontSize}${this.fontSizeUnit};
      font-weight: ${this.fontWeight};
      font-style: ${this.fontStyle};
      color: #e0e0e0;
      line-height: 1.6;
      margin-bottom: 20px;
      padding: 20px;
    `;

    // 为每个片段创建span
    segments.forEach((segment) => {
      const span = document.createElement("span");
      span.textContent = segment.text;

      // 设置字体
      const actualFont = this.detectActualFont(segment.text);
      span.style.fontFamily = `"${actualFont}", ${this.fontFamilies.slice(1).join(", ")}`;

      // 设置背景色
      if (segment.language === "chinese") {
        span.style.backgroundColor = "rgba(41,200,78,0.25)";
        span.style.padding = "2px 4px";
        span.style.borderRadius = "4px";
      } else {
        span.style.backgroundColor = "rgba(255,200,41,0.25)";
        span.style.padding = "2px 4px";
        span.style.borderRadius = "4px";
      }

      paragraph.appendChild(span);
    });

    this.textContainer.appendChild(paragraph);
  }

  // 将文本按语言分割
  splitTextByLanguage(text) {
    const segments = [];
    let currentSegment = "";
    let currentLanguage = null;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const isChinese = this.isChineseCharacter(char);
      const language = isChinese ? "chinese" : "english";

      if (currentLanguage === null) {
        currentLanguage = language;
        currentSegment = char;
      } else if (currentLanguage === language) {
        currentSegment += char;
      } else {
        // 语言切换，保存当前片段
        if (currentSegment) {
          segments.push({
            text: currentSegment,
            language: currentLanguage,
          });
        }
        currentSegment = char;
        currentLanguage = language;
      }
    }

    // 添加最后一个片段
    if (currentSegment) {
      segments.push({
        text: currentSegment,
        language: currentLanguage,
      });
    }

    return segments;
  }

  // 判断字符是否为中文字符（包括中文标点符号）
  isChineseCharacter(char) {
    // 中文字符范围：包括汉字、中文标点符号等
    const chineseRanges = [
      [0x4e00, 0x9fff], // 基本汉字
      [0x3400, 0x4dbf], // 扩展A
      [0x20000, 0x2a6df], // 扩展B
      [0x2a700, 0x2b73f], // 扩展C
      [0x2b740, 0x2b81f], // 扩展D
      [0x2b820, 0x2ceaf], // 扩展E
      [0xf900, 0xfaff], // 兼容汉字
      [0x3300, 0x33ff], // CJK兼容
      [0xfe30, 0xfe4f], // CJK兼容形式
      [0xff00, 0xffef], // 全角ASCII、全角标点
      [0x3000, 0x303f], // CJK符号和标点
      [0xff00, 0xffef], // 全角字符
    ];

    const code = char.charCodeAt(0);

    // 检查是否在中文范围内
    for (const [start, end] of chineseRanges) {
      if (code >= start && code <= end) {
        return true;
      }
    }

    // 特殊的中文标点符号
    const chinesePunctuation = [
      "，",
      "。",
      "、",
      "；",
      "：",
      "！",
      "？",
      "…",
      "—",
      "～",
      "（",
      "）",
      "【",
      "】",
      "《",
      "》",
      "「",
      "」",
      "『",
      "』",
      "〈",
      "〉",
      "〔",
      "〕",
      "［",
      "］",
      "｛",
      "｝",
      "｢",
      "｣",
      "〝",
      "〞",
      "〟",
      "〰",
      "〾",
      "〿",
      "–",
      "—",
      "‒",
      "–",
      "—",
      "―",
      "‖",
      "‗",
      "‛",
      "‟",
      "…",
      "‧",
      "﹏",
      "。",
      "、",
      "〃",
      "《",
      "》",
      "「",
      "」",
      "『",
      "』",
      "【",
      "】",
      "〔",
      "〕",
      "〖",
      "〗",
      "〘",
      "〙",
      "〚",
      "〛",
      "〜",
      "〝",
      "〞",
      "〟",
      "〰",
      "〾",
      "〿",
      "–",
      "—",
      "‒",
      "–",
      "—",
      "―",
      "‖",
      "‗",
      "‛",
      "‟",
      "…",
      "‧",
      "﹏",
    ];

    return chinesePunctuation.includes(char);
  }

  // 检测文本实际应用的字体
  detectActualFont(text) {
    // 检查文本是否包含中文字符
    const hasChinese = text.split("").some((char) => this.isChineseCharacter(char));

    // 遍历字体列表，找到第一个支持该文本的字体
    for (let i = 0; i < this.fontFamilies.length; i++) {
      const font = this.fontFamilies[i];

      // 通过关键词判断字体是否支持该语言
      if (hasChinese) {
        // 中文文本：检查字体是否支持中文
        if (this.fontSupportsChinese(font)) {
          return font;
        }
      } else {
        // 英文文本：优先选择不支持中文的字体，如果没有则使用第一个
        if (!this.fontSupportsChinese(font)) {
          return font;
        }
      }
    }

    // 如果没有找到合适的字体，返回最后一个字体（通常是通用字体）
    return this.fontFamilies[this.fontFamilies.length - 1] || "sans-serif";
  }

  // 检查字体是否支持中文字符
  fontSupportsChinese(fontName) {
    // 常见的支持中文的字体关键词
    const chineseFontKeywords = [
      "Noto Sans SC",
      "思源黑体",
      "pingfang",
      "苹方",
      "microsoft yahei",
      "微软雅黑",
      "simsun",
      "宋体",
      "simhei",
      "黑体",
      "kaiti",
      "楷体",
      "fangsong",
      "仿宋",
      "lishu",
      "隶书",
      "youyuan",
      "幼圆",
    ];

    const lowerFont = fontName.toLowerCase();
    return chineseFontKeywords.some((keyword) => lowerFont.includes(keyword));
  }

  // 删除updateFontLabels方法
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  new FontTutorial();
});
