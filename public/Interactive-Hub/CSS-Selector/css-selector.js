class CSSSelectorTutorial {
  constructor() {
    this.selectorInput = document.getElementById("selectorInput");
    this.clearBtn = document.getElementById("clearBtn");
    this.matchCountElement = document.getElementById("matchCount");
    this.selectorTypeElement = document.getElementById("selectorType");
    this.htmlCode = document.getElementById("htmlCode");

    // 初始化高亮元素数组
    this.highlightElements = [];

    // 防抖定时器
    this.debounceTimer = null;

    // 初始化
    this.init();
  }

  init() {
    this.initializePrism();
    this.setupEventListeners();
    this.setupStrongElementColors();
  }

  initializePrism() {
    // 确保Prism.js已经加载
    if (typeof Prism !== "undefined") {
      // 手动触发Prism.js高亮
      Prism.highlightElement(this.htmlCode);
      // 在Prism.js处理完成后获取原始HTML
      this.extractOriginalHTML();
    } else {
      // 如果Prism.js还没加载完成，等待一下再初始化
      setTimeout(() => {
        if (typeof Prism !== "undefined") {
          Prism.highlightElement(this.htmlCode);
          this.extractOriginalHTML();
        }
      }, 100);
    }
  }

  extractOriginalHTML() {
    // 直接从HTML文件中获取原始代码
    // 这是HTML文件中<code>标签内的原始内容
    const originalCode = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <title>示例页面</title>
  </head>
  <body>
    <header class="header" id="main-header">
      <h1 class="title">欢迎来到我的网站</h1>
      <nav class="navigation">
        <ul class="nav-list">
          <li class="nav-item"><a href="#" class="nav-link">首页</a></li>
          <li class="nav-item"><a href="#" class="nav-link">关于</a></li>
          <li class="nav-item"><a href="#" class="nav-link">联系</a></li>
        </ul>
      </nav>
    </header>
    
    <main class="main-content">
      <article class="article">
        <h2 class="article-title">文章标题</h2>
        <p class="paragraph">
          这是一段<span class="highlight">重要的</span>文字内容，
          包含了<em class="emphasis">强调</em>和<strong class="bold">粗体</strong>元素。
        </p>
        <div class="container">
          <div class="box">盒子1</div>
          <div class="box">盒子2</div>
          <div class="box special">特殊盒子</div>
        </div>
      </article>
      
      <aside class="sidebar">
        <div class="widget">
          <h3 class="widget-title">侧边栏</h3>
          <p class="widget-content">侧边栏内容</p>
        </div>
      </aside>
    </main>
    
    <footer class="footer">
      <p class="copyright">&copy; 2024 我的网站</p>
    </footer>
  </body>
</html>`;

    this.originalHTML = originalCode;
    console.log("提取的原始HTML:", this.originalHTML);
  }

  setupEventListeners() {
    // 选择器输入事件 - 添加防抖
    this.selectorInput.addEventListener("input", () => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.handleSelectorInput();
      }, 300); // 300ms防抖
    });

    this.selectorInput.addEventListener("keydown", this.handleKeyDown.bind(this));

    // 清除按钮事件
    this.clearBtn.addEventListener("click", this.clearSelector.bind(this));
  }

  handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.handleSelectorInput();
    } else if (e.key === "Escape") {
      this.clearSelector();
    }
  }

  handleSelectorInput() {
    const selector = this.selectorInput.value.trim();

    // 清除之前的高亮
    this.clearHighlights();

    if (!selector) {
      this.updateInfo(0, "-");
      this.hideNoMatchesMessage();
      this.hideErrorMessage();
      return;
    }

    // 检查是否为不完整的选择器
    if (selector === "." || selector === "#" || selector === ":" || selector === ">" || selector === "+") {
      this.clearHighlights();
      this.updateInfo(0, "不完整选择器");
      this.selectorInput.classList.remove("error");
      this.hideNoMatchesMessage();
      this.hideErrorMessage();
      return;
    }

    // 确保originalHTML已经被设置
    if (!this.originalHTML) {
      this.extractOriginalHTML();
    }

    try {
      const matches = this.findMatches(selector);
      const count = matches.length;
      const type = this.getSelectorType(selector);

      this.updateInfo(count, type);

      if (count > 0) {
        this.hideNoMatchesMessage();
        this.hideErrorMessage();
        this.highlightMatches(matches);
      } else {
        this.showNoMatchesMessage();
      }
    } catch (error) {
      console.error("选择器处理错误:", error);
      this.showErrorMessage(error.message);
      this.updateInfo(0, "错误");
    }
  }

  clearSelector() {
    this.selectorInput.value = "";
    this.updateInfo(0, "-");
    this.clearHighlights();
    this.hideNoMatchesMessage();
    this.hideErrorMessage();
  }

  hideErrorMessage() {
    const message = document.getElementById("errorMessage");
    if (message) {
      message.style.display = "none";
    }
  }

  findMatches(selector) {
    console.log("查找选择器:", selector);
    console.log("原始HTML:", this.originalHTML);

    // 检查是否是根级元素选择器
    const rootElements = ["html", "body", "head"];
    if (rootElements.includes(selector)) {
      return this.findRootElementMatches(selector);
    }

    // 创建一个临时的DOM来测试选择器
    const tempDiv = document.createElement("div");

    // 直接使用原始HTML，不需要解码
    tempDiv.innerHTML = this.originalHTML;

    console.log("解析后的HTML:", tempDiv.innerHTML);

    const matches = [];

    try {
      // 使用querySelectorAll进行选择器匹配
      const elements = tempDiv.querySelectorAll(selector);
      console.log("querySelectorAll结果:", elements.length, elements);

      // 限制匹配数量，避免性能问题
      const maxMatches = 50;
      let count = 0;

      for (const element of elements) {
        if (count >= maxMatches) {
          console.warn(`匹配元素过多，已限制为${maxMatches}个`);
          break;
        }

        console.log("处理元素:", element.outerHTML);
        const elementInfo = this.getElementInfo(element);
        if (elementInfo) {
          matches.push(elementInfo);
          count++;
        }
      }
    } catch (error) {
      console.warn("querySelectorAll失败，尝试自定义解析:", error);
      // 如果querySelectorAll失败，尝试自定义解析
      const customMatches = this.customSelectorMatch(selector, tempDiv);
      matches.push(...customMatches.slice(0, 50)); // 限制自定义匹配数量
    }

    console.log("最终匹配结果:", matches);
    return matches;
  }

  findRootElementMatches(selector) {
    console.log("查找根级元素:", selector);

    // 从原始HTML中提取根级元素信息
    const matches = [];

    // 使用正则表达式查找根级元素
    const tagPattern = new RegExp(`<${selector}([^>]*)>`, "i");
    const match = this.originalHTML.match(tagPattern);

    if (match) {
      console.log("找到根级元素:", match[0]);

      // 提取属性
      const attributes = match[1] || "";
      const idMatch = attributes.match(/id\s*=\s*["']([^"']+)["']/);
      const classMatch = attributes.match(/class\s*=\s*["']([^"']+)["']/);

      const elementInfo = {
        tagName: selector.toUpperCase(),
        className: classMatch ? classMatch[1] : "",
        id: idMatch ? idMatch[1] : "",
        outerHTML: match[0],
        element: null,
      };

      matches.push(elementInfo);
    }

    console.log("根级元素匹配结果:", matches);
    return matches;
  }

  getElementInfo(element) {
    const tagName = element.tagName.toLowerCase();
    const className = element.className;
    const id = element.id;

    // 生成元素的HTML表示
    const outerHTML = element.outerHTML;

    // 获取元素在DOM中的位置信息
    const rect = element.getBoundingClientRect();

    return {
      tagName,
      className,
      id,
      outerHTML,
      element,
      // 添加位置信息，帮助找到正确的token
      position: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
    };
  }

  customSelectorMatch(selector, container) {
    const matches = [];
    const elements = container.querySelectorAll("*");

    elements.forEach((element) => {
      if (this.matchesCustomSelector(element, selector)) {
        const elementInfo = this.getElementInfo(element);
        matches.push(elementInfo);
      }
    });

    return matches;
  }

  matchesCustomSelector(element, selector) {
    // 简单的自定义选择器匹配逻辑
    const tagName = element.tagName.toLowerCase();
    const className = element.className;
    const id = element.id;

    // 元素选择器
    if (selector === tagName) {
      return true;
    }

    // ID选择器
    if (selector.startsWith("#") && selector.length > 1) {
      const idValue = selector.slice(1);
      if (idValue && id === idValue) {
        return true;
      }
    }

    // 类选择器
    if (selector.startsWith(".") && selector.length > 1) {
      const classValue = selector.slice(1);
      if (classValue && className.includes(classValue)) {
        return true;
      }
    }

    // 组合选择器 (如 .box.special)
    if (selector.includes(".") && !selector.startsWith(".")) {
      const parts = selector.split(".");
      const tagPart = parts[0];
      const classParts = parts.slice(1);

      if (tagPart && tagName !== tagPart) {
        return false;
      }

      return classParts.every((cls) => cls && className.includes(cls));
    }

    return false;
  }

  highlightMatches(matches) {
    this.clearHighlights();

    if (!matches || matches.length === 0) {
      this.showNoMatchesMessage();
      return;
    }

    this.hideNoMatchesMessage();

    const tokens = Array.from(document.querySelectorAll("#htmlCode .token"));
    const processedPositions = new Set();

    matches.forEach((match, index) => {
      console.log(`处理匹配元素 ${index + 1}:`, match);
      
      const range = this.findElementTokenRange(match, tokens, processedPositions);
      if (!range) {
        console.log(`未找到元素token范围，跳过`);
        return;
      }

      console.log("开始计算高亮范围...");
      const startToken = range.startToken;
      const endToken = range.endToken;
      console.log("开始token:", startToken.textContent, "位置:", range.startIndex);
      console.log("结束token:", endToken.textContent, "位置:", range.endIndex);

      // 使用新的高亮逻辑
      const highlightRanges = this.calculateHighlightRange(startToken, endToken, tokens);

      if (Array.isArray(highlightRanges)) {
        // 不同行：分别高亮开始标签和结束标签
        highlightRanges.forEach((range, i) => {
          this.createHighlightElement(range, i === 0 ? "start" : "end");
        });
      } else {
        // 同一行：高亮整个元素
        this.createHighlightElement(highlightRanges, "full");
      }
    });
  }

  createHighlightElement(range, type) {
    console.log(`创建高亮元素:`, { range, type });
    
    const highlight = document.createElement("div");
    highlight.className = `match-highlight match-highlight-${type}`;
    highlight.style.position = "absolute";
    highlight.style.left = `${range.left}px`;
    highlight.style.top = `${range.top}px`;
    highlight.style.width = `${range.width}px`;
    highlight.style.height = `${range.height}px`;
    highlight.style.backgroundColor = "rgba(0, 255, 0, 0.1)"; // 透明度10%的绿色背景
    highlight.style.border = "2px solid #00FF00"; // 绿色外框
    highlight.style.pointerEvents = "none";
    highlight.style.zIndex = "1000";

    const codeContainer = document.querySelector(".code-content");
    codeContainer.appendChild(highlight);
    this.highlightElements.push(highlight);
    
    console.log(`高亮元素已创建:`, highlight);
  }

  findCompleteElementRange(range, tokens, match) {
    const tagName = match.tagName.toLowerCase();
    let startIndex = range.start;
    let endIndex = range.end;

    console.log("查找完整元素范围:", { tagName, startIndex, endIndex });

    // 查找完整的开始标签范围
    let startTagStart = startIndex;
    let startTagEnd = startIndex;

    // 向前查找开始标签的开始
    for (let i = startIndex; i >= 0; i--) {
      const tokenText = tokens[i].textContent;
      if (tokenText.includes("&lt;") || tokenText.includes("<")) {
        startTagStart = i;
        console.log("找到开始标签开始:", tokenText, "位置:", i);
        break;
      }
    }

    // 向后查找开始标签的结束
    for (let i = startIndex; i < tokens.length; i++) {
      const tokenText = tokens[i].textContent;
      if (tokenText.includes("&gt;") || tokenText.includes(">")) {
        startTagEnd = i;
        console.log("找到开始标签结束:", tokenText, "位置:", i);
        break;
      }
    }

    // 查找对应的结束标签
    let endTagStart = -1;
    let endTagEnd = -1;

    // 查找结束标签 - 改进的逻辑
    let depth = 0;
    let foundStart = false;

    console.log("开始查找结束标签，从位置:", startIndex);
    console.log("开始标签内容:", tokens[startIndex].textContent);

    for (let i = startIndex; i < tokens.length; i++) {
      const tokenText = tokens[i].textContent;

      // 检查是否是开始标签
      if (
        (tokenText.includes(`&lt;${tagName}`) || tokenText.includes(`<${tagName}`)) &&
        !tokenText.includes("&lt;/") &&
        !tokenText.includes("</")
      ) {
        depth++;
        if (i === startIndex) {
          foundStart = true;
        }
        console.log(`位置 ${i}: 找到开始标签 "${tokenText}", depth: ${depth}, foundStart: ${foundStart}`);
      }

      // 检查是否是结束标签
      if (tokenText.includes(`&lt;/${tagName}&gt;`) || tokenText.includes(`</${tagName}>`)) {
        depth--;
        console.log(`位置 ${i}: 找到结束标签 "${tokenText}", depth: ${depth}, foundStart: ${foundStart}`);
        if (depth === 0 && foundStart) {
          endTagStart = i;
          endTagEnd = i;
          console.log("找到结束标签:", tokenText, "位置:", i);
          break;
        }
      }

      // 检查是否是自闭合标签
      if ((tokenText.includes("/&gt;") || tokenText.includes("/>")) && i === startIndex) {
        endTagStart = i;
        endTagEnd = i;
        console.log("找到自闭合标签:", tokenText, "位置:", i);
        break;
      }
    }

    // 如果没有找到结束标签，可能元素没有结束标签（自闭合标签）
    if (endTagStart === -1) {
      console.log("未找到结束标签，使用开始标签范围");
      return { start: startTagStart, end: startTagEnd };
    }

    console.log("完整元素范围:", { start: startTagStart, end: endTagEnd });
    return { start: startTagStart, end: endTagEnd };
  }

  findElementTokenRange(match, tokens, processedPositions) {
    const { tagName, className, id, outerHTML, element } = match;

    // 对于根元素（element为null），使用特殊处理
    if (!element) {
      return this.findRootElementTokenRange(match, tokens, processedPositions);
    }

    // 查找开始标签
    let startIndex = -1;
    let endIndex = -1;

    console.log(`开始查找元素: ${tagName}${className ? '.' + className : ''}${id ? '#' + id : ''}`);
    console.log(`已处理的位置数量: ${processedPositions.size}`);

    // 确定搜索起始位置：从上一个已处理元素的结束位置之后开始
    let searchStartIndex = 0;
    if (processedPositions.size > 0) {
      // 找到最大的已处理位置（通常是上一个元素的结束位置）
      const maxProcessedPosition = Math.max(...Array.from(processedPositions));
      searchStartIndex = maxProcessedPosition + 1;
      console.log(`从位置 ${searchStartIndex} 开始搜索（上一个已处理位置: ${maxProcessedPosition}）`);
    }

    for (let i = searchStartIndex; i < tokens.length; i++) {
      const tokenText = tokens[i].textContent;

      // 检查是否是开始标签
      if (
        (tokenText.includes(`&lt;${tagName}`) || tokenText.includes(`<${tagName}`)) &&
        !tokenText.includes("&lt;/") &&
        !tokenText.includes("</")
      ) {
        // 验证属性匹配
        let attributesMatch = true;

        if (className) {
          const classPattern = `class="${this.escapeRegex(className)}"`;
          console.log(`检查类名匹配: ${classPattern}`);
          if (!this.findAttributeInTokens(classPattern, tokens, i)) {
            console.log(`类名匹配失败: ${classPattern}`);
            attributesMatch = false;
          }
        }

        if (id) {
          const idPattern = `id="${this.escapeRegex(id)}"`;
          if (!this.findAttributeInTokens(idPattern, tokens, i)) {
            attributesMatch = false;
          }
        }

        console.log(`属性匹配结果: ${attributesMatch}`);

        if (attributesMatch) {
          startIndex = i;
          console.log(`找到开始标签: ${tagName} 在位置 ${i}, 内容: ${tokenText}`);
          break;
        }
      }
    }

    if (startIndex === -1) {
      console.log(`未找到开始标签`);
      return null;
    }

    // 查找结束标签
    console.log(`开始查找 ${tagName} 标签的结束标签，从位置 ${startIndex} 开始`);
    
    // 对于div元素，使用深度计数逻辑
    if (tagName.toLowerCase() === 'div') {
      console.log(`检测到div元素，使用深度计数逻辑`);
      endIndex = this.findMatchingEndTagWithDepth(tagName, startIndex, tokens);
    } else {
      endIndex = this.findMatchingEndTag(tagName, startIndex, tokens);
    }

    if (endIndex === -1) {
      console.log(`未找到结束标签`);
      return null;
    }

    console.log(`找到匹配的结束标签在位置 ${endIndex}`);

    // 标记位置为已处理（不标记子元素位置）
    processedPositions.add(startIndex);
    processedPositions.add(endIndex);
    console.log(`标记位置 ${startIndex} 和 ${endIndex} 为已处理（不标记子元素位置）`);

    return {
      startToken: tokens[startIndex],
      endToken: tokens[endIndex],
      startIndex: startIndex,
      endIndex: endIndex
    };
  }

  findRootElementTokenRange(match, tokens, processedPositions) {
    const { tagName, className, id, outerHTML } = match;

    // 将tagName转换为小写以匹配HTML代码
    const lowerTagName = tagName.toLowerCase();

    // 查找开始标签
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < tokens.length; i++) {
      if (processedPositions.has(i)) continue;

      const tokenText = tokens[i].textContent;

      // 检查是否是开始标签
      if (
        (tokenText.includes(`&lt;${lowerTagName}`) || tokenText.includes(`<${lowerTagName}`)) &&
        !tokenText.includes("&lt;/") &&
        !tokenText.includes("</")
      ) {
        // 验证属性匹配
        let attributesMatch = true;

        if (className) {
          const classPattern = `class="${this.escapeRegex(className)}"`;
          console.log(`检查类名匹配: ${classPattern}`);
          if (!this.findAttributeInTokens(classPattern, tokens, i)) {
            console.log(`类名匹配失败: ${classPattern}`);
            attributesMatch = false;
          }
        }

        if (id) {
          const idPattern = `id="${this.escapeRegex(id)}"`;
          console.log(`检查ID匹配: ${idPattern}`);
          if (!this.findAttributeInTokens(idPattern, tokens, i)) {
            console.log(`ID匹配失败: ${idPattern}`);
            attributesMatch = false;
          }
        }

        console.log(`属性匹配结果: ${attributesMatch}`);

        if (attributesMatch) {
          startIndex = i;
          console.log(`找到根元素开始标签: ${lowerTagName} 在位置 ${i}, 内容: ${tokenText}`);

          // 使用栈来查找正确的结束标签
          endIndex = this.findMatchingEndTag(lowerTagName, i, tokens);

          if (endIndex !== -1) {
            console.log(`找到根元素匹配的结束标签在位置 ${endIndex}`);
          } else {
            console.log(`未找到根元素匹配的结束标签，使用开始位置: ${i}`);
            endIndex = i;
          }

          // 标记整个元素范围为已处理，避免重复处理
          processedPositions.add(startIndex);
          processedPositions.add(endIndex);

          break;
        }
      }
    }

    if (startIndex === -1) {
      return null;
    }

    return {
      startToken: tokens[startIndex],
      endToken: tokens[endIndex],
      startIndex: startIndex,
      endIndex: endIndex
    };
  }

  findMatchingEndTag(tagName, startIndex, tokens) {
    console.log(`开始查找 ${tagName} 标签的结束标签，从位置 ${startIndex} 开始`);

    // 检查是否是可能有嵌套的元素（div、li等）
    if (tagName.toLowerCase() === "div" || tagName.toLowerCase() === "li") {
      console.log(`检测到${tagName}元素，使用深度计数逻辑`);
      return this.findMatchingEndTagWithDepth(tagName, startIndex, tokens);
    } else {
      console.log(`使用简单匹配逻辑`);
      return this.findMatchingEndTagSimple(tagName, startIndex, tokens);
    }
  }

  findMatchingEndTagSimple(tagName, startIndex, tokens) {
    // 简单的结束标签查找逻辑（用于没有嵌套的情况）
    let depth = 0;
    
    for (let i = startIndex + 1; i < tokens.length; i++) {
      const tokenText = tokens[i].textContent;

      // 检查是否是开始标签
      if (
        (tokenText.includes(`&lt;${tagName}`) || tokenText.includes(`<${tagName}`)) &&
        !tokenText.includes("&lt;/") &&
        !tokenText.includes("</") &&
        (tokenText.includes("&gt;") || tokenText.includes(">"))
      ) {
        depth++;
      }
      
      // 检查是否是结束标签（必须包含/字符）
      if (
        (tokenText.includes(`&lt;/${tagName}&gt;`) || tokenText.includes(`</${tagName}>`)) &&
        (tokenText.includes("&lt;/") || tokenText.includes("</"))
      ) {
        if (depth === 0) {
          // 找到当前元素的结束标签
          console.log(`找到匹配的结束标签在位置 ${i}: ${tokenText}`);
          return i;
        } else {
          depth--;
        }
      }
    }

    console.log(`未找到匹配的结束标签`);
    return -1;
  }

  findMatchingEndTagWithDepth(tagName, startIndex, tokens) {
    let depth = 0;
    
    console.log(`开始深度计数搜索，从位置 ${startIndex} 开始`);
    console.log(`搜索标签: ${tagName}`);
    
    // 从开始标签的下一个token开始搜索
    for (let i = startIndex + 1; i < tokens.length; i++) {
      const tokenText = tokens[i].textContent;
      
      // 调试：打印前几个token的内容
      if (i < startIndex + 10) {
        console.log(`Token ${i}: "${tokenText}"`);
      }
      
      // 检查是否是完整的开始标签（必须包含>符号）
      if (
        (tokenText.includes(`&lt;${tagName}`) || tokenText.includes(`<${tagName}`)) &&
        !tokenText.includes("&lt;/") &&
        !tokenText.includes("</") &&
        (tokenText.includes("&gt;") || tokenText.includes(">"))
      ) {
        depth++;
        console.log(`找到嵌套的 ${tagName} 开始标签，深度增加到 ${depth}: ${tokenText}`);
      }
      
      // 检查是否是完整的结束标签（必须包含/和>符号）
      if (
        (tokenText.includes(`&lt;/${tagName}&gt;`) || tokenText.includes(`</${tagName}>`)) &&
        (tokenText.includes("&lt;/") || tokenText.includes("</")) &&
        (tokenText.includes("&gt;") || tokenText.includes(">"))
      ) {
        if (depth === 0) {
          // 找到当前元素的结束标签
          console.log(`找到匹配的结束标签在位置 ${i}: ${tokenText}`);
          return i;
        } else {
          depth--;
          console.log(`找到嵌套的 ${tagName} 结束标签，深度减少到 ${depth}: ${tokenText}`);
        }
      }
    }
    
    console.log(`未找到匹配的结束标签`);
    return -1;
  }

  findSearchEnd(tagName, startIndex, tokens) {
    // 查找下一个同级元素的开始标签位置
    for (let i = startIndex + 1; i < tokens.length; i++) {
      const tokenText = tokens[i].textContent;

      // 检查是否是相同标签的开始标签，并且是完整的开始标签
      if (
        (tokenText.includes(`&lt;${tagName}`) || tokenText.includes(`<${tagName}`)) &&
        !tokenText.includes("&lt;/") &&
        !tokenText.includes("</")
      ) {
        // 检查是否是完整的开始标签（包含>符号）
        if (tokenText.includes("&gt;") || tokenText.includes(">")) {
          console.log(`找到下一个同级元素开始标签在位置 ${i}: ${tokenText}`);
          return i;
        }
      }
    }

    // 如果没有找到下一个同级元素，搜索到末尾
    return tokens.length;
  }

  findAttributeInTokens(attributePattern, tokens, startIndex) {
    // 在指定位置附近查找属性
    const searchRange = 20; // 增加搜索范围到20个token
    const start = Math.max(0, startIndex - searchRange);
    const end = Math.min(tokens.length, startIndex + searchRange);

    console.log(`在位置 ${startIndex} 附近查找属性: ${attributePattern}`);
    console.log(`搜索范围: ${start} 到 ${end}`);

    for (let i = start; i < end; i++) {
      const tokenText = tokens[i].textContent;
      if (tokenText.includes(attributePattern)) {
        console.log(`在位置 ${i} 找到属性: ${tokenText}`);
        return true;
      }
    }

    console.log(`未找到属性: ${attributePattern}`);
    return false;
  }

  clearHighlights() {
    // 移除所有高亮元素
    const highlights = document.querySelectorAll(".match-highlight");
    highlights.forEach((highlight) => {
      highlight.remove();
    });
    this.highlightElements = [];
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  updateInfo(count, type) {
    this.matchCountElement.textContent = `匹配数量: ${count}`;
    this.selectorTypeElement.textContent = `选择器类型: ${type}`;
  }

  getSelectorType(selector) {
    if (selector.startsWith("#")) {
      return "ID选择器";
    } else if (selector.startsWith(".")) {
      return "类选择器";
    } else if (selector.includes(">")) {
      return "子元素选择器";
    } else if (selector.includes("+")) {
      return "相邻兄弟选择器";
    } else if (selector.includes(":")) {
      return "伪类选择器";
    } else if (selector.includes(" ")) {
      return "后代选择器";
    } else {
      return "元素选择器";
    }
  }

  showNoMatchesMessage() {
    let message = document.getElementById("noMatchesMessage");
    if (!message) {
      message = document.createElement("div");
      message.id = "noMatchesMessage";
      message.className = "no-matches-message";
      message.textContent = "没有找到匹配的元素";
      this.selectorInput.closest(".selector-input-container").appendChild(message);
    }
    message.style.display = "block";
  }

  hideNoMatchesMessage() {
    const message = document.getElementById("noMatchesMessage");
    if (message) {
      message.style.display = "none";
    }
  }

  showErrorMessage(errorMsg) {
    let message = document.getElementById("errorMessage");
    if (!message) {
      message = document.createElement("div");
      message.id = "errorMessage";
      message.className = "error-message";
      this.selectorInput.closest(".selector-input-container").appendChild(message);
    }
    message.textContent = `错误: ${errorMsg}`;
    message.style.display = "block";
  }

  calculateHighlightRange(startToken, endToken, tokens) {
    console.log("开始计算高亮范围...");

    const startIndex = tokens.indexOf(startToken);
    const endIndex = tokens.indexOf(endToken);

    console.log("开始token:", startToken.textContent, "位置:", startIndex);
    console.log("结束token:", endToken.textContent, "位置:", endIndex);

    // 获取开始标签和结束标签的行号
    const startLine = this.getTokenLineNumber(startToken);
    const endLine = this.getTokenLineNumber(endToken);

    console.log("开始标签行号:", startLine, "结束标签行号:", endLine);

    // 检查开始标签和结束标签是否在同一行
    if (startLine === endLine) {
      // 同一行：高亮整个元素（开始标签、内容、结束标签）
      console.log("开始标签和结束标签在同一行，高亮整个元素");
      return this.highlightFullElement(startIndex, endIndex, tokens);
    } else {
      // 不同行：分别高亮开始标签和结束标签
      console.log("开始标签和结束标签在不同行，分别高亮");
      return this.highlightSeparateTags(startIndex, endIndex, tokens);
    }
  }

  getTokenLineNumber(token) {
    // 获取token所在的行号
    const preElement = token.closest("pre");
    if (!preElement) return 1;

    // 获取所有行
    const lines = preElement.querySelectorAll(".line-numbers-rows span");
    if (lines.length === 0) return 1;

    // 计算token在第几行
    const tokenTop = token.getBoundingClientRect().top;
    const preTop = preElement.getBoundingClientRect().top;

    for (let i = 0; i < lines.length; i++) {
      const lineTop = lines[i].getBoundingClientRect().top;
      if (Math.abs(tokenTop - lineTop) < 5) {
        // 5px的容差
        return i + 1;
      }
    }

    // 如果无法通过位置确定，通过文本内容计算
    const codeElement = document.querySelector("#htmlCode");
    const allTokens = Array.from(codeElement.querySelectorAll(".token"));
    const tokenIndex = allTokens.indexOf(token);

    let lineNumber = 1;
    let currentLine = 1;

    for (let i = 0; i < tokenIndex; i++) {
      const tokenText = allTokens[i].textContent;
      if (tokenText.includes("\n")) {
        lineNumber += tokenText.split("\n").length - 1;
      }
    }

    return lineNumber;
  }

  highlightFullElement(startIndex, endIndex, tokens) {
    // 高亮整个元素（开始标签、内容、结束标签）
    const startToken = tokens[startIndex];
    const endToken = tokens[endIndex];

    const startRect = startToken.getBoundingClientRect();
    const endRect = endToken.getBoundingClientRect();

    const codeContainer = document.querySelector(".code-content");
    const containerRect = codeContainer.getBoundingClientRect();

    const left = startRect.left - containerRect.left;
    const top = startRect.top - containerRect.top;
    const width = endRect.left + endRect.width - startRect.left;
    // 使用结束标签的底部位置减去开始标签的顶部位置，确保覆盖整个元素
    const height = (endRect.top + endRect.height) - startRect.top;

    console.log(`高亮范围计算:`, {
      startToken: startToken.textContent,
      endToken: endToken.textContent,
      startRect: { left: startRect.left, top: startRect.top, width: startRect.width, height: startRect.height },
      endRect: { left: endRect.left, top: endRect.top, width: endRect.width, height: endRect.height },
      containerRect: { left: containerRect.left, top: containerRect.top },
      result: { left, top, width, height }
    });

    return {
      left: left,
      top: top,
      width: width,
      height: height,
      type: "full",
    };
  }

  highlightSeparateTags(startIndex, endIndex, tokens) {
    // 分别高亮开始标签和结束标签
    const startToken = tokens[startIndex];
    const endToken = tokens[endIndex];

    const startRect = startToken.getBoundingClientRect();
    const endRect = endToken.getBoundingClientRect();

    const codeContainer = document.querySelector(".code-content");
    const containerRect = codeContainer.getBoundingClientRect();

    const startHighlight = {
      left: startRect.left - containerRect.left,
      top: startRect.top - containerRect.top,
      width: startRect.width,
      height: startRect.height,
      type: "start",
    };

    const endHighlight = {
      left: endRect.left - containerRect.left,
      top: endRect.top - containerRect.top,
      width: endRect.width,
      height: endRect.height,
      type: "end",
    };

    return [startHighlight, endHighlight];
  }

  setupStrongElementColors() {
    // 处理选择器说明中strong元素的文本颜色
    const strongElements = document.querySelectorAll(".help-content strong");
    strongElements.forEach((strong) => {
      const text = strong.textContent;
      if (text.includes("选择器")) {
        // 将文本分割为"选择器"和其他部分
        const parts = text.split("选择器");
        if (parts.length === 2) {
          const beforeSelector = parts[0];
          const afterSelector = parts[1];

          // 清空原内容
          strong.innerHTML = "";

          // 添加其他文字（使用默认颜色）
          if (beforeSelector) {
            const beforeSpan = document.createElement("span");
            beforeSpan.textContent = beforeSelector;
            beforeSpan.style.color = "var(--code-keyword)";
            strong.appendChild(beforeSpan);
          }

          // 添加"选择器"文字（使用特殊颜色）
          const selectorSpan = document.createElement("span");
          selectorSpan.textContent = "选择器";
          selectorSpan.style.color = "var(--code-string)";
          strong.appendChild(selectorSpan);

          // 添加后面的文字（使用默认颜色）
          if (afterSelector) {
            const afterSpan = document.createElement("span");
            afterSpan.textContent = afterSelector;
            afterSpan.style.color = "#888"; // 冒号使用灰色
            strong.appendChild(afterSpan);
          }
        }
      } else {
        // 处理不包含"选择器"的strong元素（如"伪类选择器:"）
        const text = strong.textContent;
        if (text.includes(":")) {
          const parts = text.split(":");
          if (parts.length === 2) {
            const beforeColon = parts[0];
            const colon = ":";

            // 清空原内容
            strong.innerHTML = "";

            // 添加冒号前的文字
            if (beforeColon) {
              const beforeSpan = document.createElement("span");
              beforeSpan.textContent = beforeColon;
              beforeSpan.style.color = "var(--code-keyword)";
              strong.appendChild(beforeSpan);
            }

            // 添加冒号（使用不太显眼的颜色）
            const colonSpan = document.createElement("span");
            colonSpan.textContent = colon;
            colonSpan.style.color = "#888"; // 使用灰色，不太显眼
            strong.appendChild(colonSpan);
          }
        }
      }
    });
  }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  new CSSSelectorTutorial();
});