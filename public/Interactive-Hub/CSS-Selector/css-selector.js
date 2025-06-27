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
    this.setupRandomHtmlBtn();
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

    // 重置按钮事件
    const resetButton = document.querySelector(".重置按钮");
    if (resetButton) {
      resetButton.addEventListener("click", this.resetAll.bind(this));
    }
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

  resetAll() {
    // 1. 清空选择器输入框
    this.selectorInput.value = "";
    
    // 2. 隐藏"#noMatchesMessage"
    this.hideNoMatchesMessage();
    
    // 3. 重置匹配数量和选择器类型
    this.updateInfo(0, "-");
    
    // 4. 删除一切高亮框
    this.clearHighlights();
    
    // 5. 重置展示区里的代码为HTML初始的"pre"元素里的HTML
    this.resetCodeToOriginal();
    
    // 6. 隐藏错误消息
    this.hideErrorMessage();
    
    // 7. 移除输入框的错误状态
    this.selectorInput.classList.remove("error");
    
    // 8. 清除防抖定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  resetCodeToOriginal() {
    // 获取代码元素
    const codeElement = document.getElementById("htmlCode");
    if (!codeElement) return;
    
    // 重置为指定的HTML内容
    const resetHTML = `<!DOCTYPE html>
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
    
    // 重新设置HTML内容
    codeElement.textContent = resetHTML;
    
    // 更新originalHTML为重置后的内容
    this.originalHTML = resetHTML;
    
    // 重新应用Prism.js高亮
    Prism.highlightElement(codeElement);
  }

  hideErrorMessage() {
    const message = document.getElementById("errorMessage");
    if (message) {
      message.style.display = "none";
    }
  }

  findMatches(selector) {
    // 检查是否是根级元素选择器
    const rootElements = ["html", "body", "head"];
    if (rootElements.includes(selector)) {
      return this.findRootElementMatches(selector);
    }

    // 创建一个临时的DOM来测试选择器
    const tempDiv = document.createElement("div");

    // 直接使用原始HTML，不需要解码
    tempDiv.innerHTML = this.originalHTML;

    const matches = [];

    try {
      // 使用querySelectorAll进行选择器匹配
      const elements = tempDiv.querySelectorAll(selector);

      // 限制匹配数量，避免性能问题
      const maxMatches = 50;
      let count = 0;

      for (const element of elements) {
        if (count >= maxMatches) {
          console.warn(`匹配元素过多，已限制为${maxMatches}个`);
          break;
        }

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

    return matches;
  }

  findRootElementMatches(selector) {
    // 从原始HTML中提取根级元素信息
    const matches = [];

    // 使用正则表达式查找根级元素
    const tagPattern = new RegExp(`<${selector}([^>]*)>`, "i");
    const match = this.originalHTML.match(tagPattern);

    if (match) {
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
    highlight.style.height = `${range.height + 1}px`;
    highlight.style.backgroundColor = "rgba(0, 255, 0, 0.1)"; // 透明度10%的绿色背景
    highlight.style.border = "1px solid #00FF00"; // 绿色外框
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

    // 检查是否是自闭合标签
    const selfClosingTags = [
      "input",
      "img",
      "br",
      "hr",
      "meta",
      "link",
      "area",
      "base",
      "col",
      "embed",
      "source",
      "track",
      "wbr",
    ];
    const isSelfClosing = selfClosingTags.includes(tagName.toLowerCase());

    // 查找开始标签
    let startIndex = -1;
    let endIndex = -1;

    console.log(
      `开始查找元素: ${tagName}${className ? "." + className : ""}${id ? "#" + id : ""}${
        isSelfClosing ? " (自闭合标签)" : ""
      }`
    );
    console.log(`已处理的位置数量: ${processedPositions.size}`);

    // 生成当前元素的特征签名
    const currentElementSignature = this.getElementSignature(tagName, className, id);

    // 确定搜索起始位置：使用基于DOM层级关系的搜索策略
    let searchStartIndex = this.determineSearchStartIndexByDOM(
      tokens,
      processedPositions,
      currentElementSignature,
      element
    );

    // 从搜索起始位置开始搜索
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
          // 检查这个位置是否已经被相同特征的元素处理过
          const positionSignature = `${currentElementSignature}:${i}`;
          if (processedPositions.has(positionSignature)) {
            console.log(`位置 ${i} 已被相同特征元素处理，跳过`);
            continue;
          }

          startIndex = i;
          console.log(`找到开始标签: ${tagName} 在位置 ${i}, 内容: ${tokenText}`);

          // 对于自闭合标签，结束位置就是开始位置
          if (isSelfClosing) {
            endIndex = i;
            console.log(`自闭合标签 ${tagName}，结束位置与开始位置相同: ${endIndex}`);
          } else {
            // 查找结束标签
            console.log(`开始查找 ${tagName} 标签的结束标签，从位置 ${startIndex} 开始`);

            // 对所有可能嵌套的标签都使用深度计数逻辑
            const nestedTags = [
              "div",
              "li",
              "span",
              "p",
              "article",
              "section",
              "header",
              "footer",
              "nav",
              "aside",
              "main",
              "ul",
              "ol",
            ];
            if (nestedTags.includes(tagName.toLowerCase())) {
              console.log(`检测到可能嵌套的${tagName}元素，使用深度计数逻辑`);
              endIndex = this.findMatchingEndTagWithDepth(tagName, startIndex, tokens);
            } else {
              endIndex = this.findMatchingEndTag(tagName, startIndex, tokens);
            }
          }

          if (endIndex === -1) {
            console.log(`未找到结束标签，使用开始位置作为结束位置`);
            endIndex = startIndex;
          }

          console.log(`找到匹配的结束标签在位置 ${endIndex}`);

          // 标记开始和结束位置为已处理，使用位置签名避免重复
          const startPositionSignature = `${currentElementSignature}:${startIndex}`;
          const endPositionSignature = `${currentElementSignature}:${endIndex}`;
          processedPositions.add(startPositionSignature);
          processedPositions.add(endPositionSignature);
          console.log(`标记位置签名 ${startPositionSignature} 和 ${endPositionSignature} 为已处理`);

          break;
        }
      }
    }

    if (startIndex === -1) {
      console.log(`未找到开始标签`);
      return null;
    }

    return {
      startToken: tokens[startIndex],
      endToken: tokens[endIndex],
      startIndex: startIndex,
      endIndex: endIndex,
    };
  }

  // 新增：基于DOM层级关系确定搜索起始位置
  determineSearchStartIndexByDOM(tokens, processedPositions, currentElementSignature, element) {
    if (processedPositions.size === 0) {
      return 0; // 第一个元素从位置0开始
    }

    // 获取所有已处理的位置
    const processedPositionsArray = Array.from(processedPositions);

    // 找到当前元素特征的所有已处理位置
    const currentElementPositions = processedPositionsArray.filter((pos) =>
      pos.startsWith(currentElementSignature + ":")
    );

    if (currentElementPositions.length === 0) {
      // 如果当前元素特征还没有处理过，需要根据DOM层级关系确定搜索位置
      return this.findSearchStartByDOMHierarchy(tokens, processedPositions, element);
    } else {
      // 如果当前元素特征已经处理过，从最后一个已处理位置之后开始
      const lastProcessedPosition = Math.max(
        ...currentElementPositions.map((pos) => {
          const parts = pos.split(":");
          return parseInt(parts[parts.length - 1]) || 0;
        })
      );
      console.log(`当前元素特征已处理过，从位置 ${lastProcessedPosition + 1} 开始搜索`);
      return lastProcessedPosition + 1;
    }
  }

  // 新增：根据DOM层级关系确定搜索起始位置
  findSearchStartByDOMHierarchy(tokens, processedPositions, element) {
    // 获取元素的父元素
    const parentElement = element.parentElement;

    if (!parentElement || parentElement.tagName === "BODY" || parentElement.tagName === "HTML") {
      // 如果没有父元素或父元素是body/html，从最大的已处理位置之后开始
      const processedPositionsArray = Array.from(processedPositions);
      const maxProcessedPosition = Math.max(
        ...processedPositionsArray.map((pos) => {
          const parts = pos.split(":");
          return parseInt(parts[parts.length - 1]) || 0;
        })
      );
      console.log(`元素没有有效父元素，从位置 ${maxProcessedPosition + 1} 开始搜索`);
      return maxProcessedPosition + 1;
    }

    // 查找父元素在已处理位置中的信息
    const parentSignature = this.getElementSignature(
      parentElement.tagName.toLowerCase(),
      parentElement.className,
      parentElement.id
    );

    // 找到父元素的所有已处理位置
    const processedPositionsArray = Array.from(processedPositions);
    const parentPositions = processedPositionsArray.filter((pos) => pos.startsWith(parentSignature + ":"));

    if (parentPositions.length > 0) {
      // 如果父元素已经处理过，从父元素的开始位置之后开始搜索
      const parentStartPosition = Math.min(
        ...parentPositions.map((pos) => {
          const parts = pos.split(":");
          return parseInt(parts[parts.length - 1]) || 0;
        })
      );
      console.log(`父元素已处理过，从父元素开始位置 ${parentStartPosition + 1} 之后开始搜索`);
      return parentStartPosition + 1;
    } else {
      // 如果父元素还没有处理过，从位置0开始搜索
      console.log(`父元素未处理过，从位置 0 开始搜索`);
      return 0;
    }
  }

  findRootElementTokenRange(match, tokens, processedPositions) {
    const { tagName, className, id, outerHTML } = match;

    // 将tagName转换为小写以匹配HTML代码
    const lowerTagName = tagName.toLowerCase();

    // 检查是否是自闭合标签
    const selfClosingTags = [
      "input",
      "img",
      "br",
      "hr",
      "meta",
      "link",
      "area",
      "base",
      "col",
      "embed",
      "source",
      "track",
      "wbr",
    ];
    const isSelfClosing = selfClosingTags.includes(lowerTagName);

    // 查找开始标签
    let startIndex = -1;
    let endIndex = -1;

    // 生成当前元素的特征签名
    const currentElementSignature = this.getElementSignature(lowerTagName, className, id);

    // 确定搜索起始位置：使用基于DOM层级关系的搜索策略
    let searchStartIndex = this.determineSearchStartIndexByDOM(
      tokens,
      processedPositions,
      currentElementSignature,
      null
    );

    // 从搜索起始位置开始搜索
    for (let i = searchStartIndex; i < tokens.length; i++) {
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
          // 检查这个位置是否已经被相同特征的元素处理过
          const positionSignature = `${currentElementSignature}:${i}`;
          if (processedPositions.has(positionSignature)) {
            console.log(`根元素位置 ${i} 已被相同特征元素处理，跳过`);
            continue;
          }

          startIndex = i;
          console.log(
            `找到根元素开始标签: ${lowerTagName} 在位置 ${i}, 内容: ${tokenText}${isSelfClosing ? " (自闭合标签)" : ""}`
          );

          // 对于自闭合标签，结束位置就是开始位置
          if (isSelfClosing) {
            endIndex = i;
            console.log(`根元素自闭合标签 ${lowerTagName}，结束位置与开始位置相同: ${endIndex}`);
          } else {
            // 使用栈来查找正确的结束标签
            endIndex = this.findMatchingEndTag(lowerTagName, i, tokens);

            if (endIndex !== -1) {
              console.log(`找到根元素匹配的结束标签在位置 ${endIndex}`);
            } else {
              console.log(`未找到根元素匹配的结束标签，使用开始位置: ${i}`);
              endIndex = i;
            }
          }

          // 标记开始和结束位置为已处理，使用位置签名避免重复
          const startPositionSignature = `${currentElementSignature}:${startIndex}`;
          const endPositionSignature = `${currentElementSignature}:${endIndex}`;
          processedPositions.add(startPositionSignature);
          processedPositions.add(endPositionSignature);
          console.log(`标记根元素位置签名 ${startPositionSignature} 和 ${endPositionSignature} 为已处理`);

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
      endIndex: endIndex,
    };
  }

  findMatchingEndTag(tagName, startIndex, tokens) {
    console.log(`开始查找 ${tagName} 标签的结束标签，从位置 ${startIndex} 开始`);

    // 检查是否是可能有嵌套的元素
    const nestedTags = [
      "div",
      "li",
      "span",
      "p",
      "article",
      "section",
      "header",
      "footer",
      "nav",
      "aside",
      "main",
      "ul",
      "ol",
    ];
    if (nestedTags.includes(tagName.toLowerCase())) {
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
    // 更新匹配数量数字
    const matchCountNumber = this.matchCountElement.querySelector(".match-count-number");
    if (matchCountNumber) {
      matchCountNumber.textContent = count;
    }

    // 更新选择器类型文本
    const selectorTypeText = this.selectorTypeElement.querySelector(".selector-type-text");
    if (selectorTypeText) {
      selectorTypeText.textContent = type;
    }
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
    } else if (selector.includes("()")) {
      return "函数式伪类选择器";
    } else if (selector.includes(":")) {
      return "伪类选择器";
    } else if (selector.includes(" ")) {
      return "后代选择器";
    } else if (selector.includes("*")) {
      return "通用选择器";
    } else {
      return "元素选择器";
    }
  }

  showNoMatchesMessage() {
    const message = document.getElementById("noMatchesMessage");
    if (message) {
      message.style.visibility = "visible";
    }
  }

  hideNoMatchesMessage() {
    const message = document.getElementById("noMatchesMessage");
    if (message) {
      message.style.visibility = "hidden";
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
    const height = endRect.top + endRect.height - startRect.top;

    console.log(`高亮范围计算:`, {
      startToken: startToken.textContent,
      endToken: endToken.textContent,
      startRect: { left: startRect.left, top: startRect.top, width: startRect.width, height: startRect.height },
      endRect: { left: endRect.left, top: endRect.top, width: endRect.width, height: endRect.height },
      containerRect: { left: containerRect.left, top: containerRect.top },
      result: { left, top, width, height },
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

    // 为选择器符号添加颜色样式
    this.setupSelectorSymbolColors();
  }

  setupSelectorSymbolColors() {
    // 获取所有帮助内容段落
    const helpParagraphs = document.querySelectorAll(".help-content p");

    helpParagraphs.forEach((paragraph) => {
      // 找到strong元素
      const strongElement = paragraph.querySelector("strong");
      if (!strongElement) return;

      // 检查是否已经处理过（避免重复处理）
      if (paragraph.dataset.processed === "true") return;

      // 检查strong元素后面是否已经包含HTML标签（如span元素）
      let hasHtmlElements = false;
      let currentNode = strongElement.nextSibling;
      while (currentNode) {
        if (currentNode.nodeType === Node.ELEMENT_NODE && currentNode.tagName !== "BR") {
          hasHtmlElements = true;
          break;
        }
        currentNode = currentNode.nextSibling;
      }

      // 如果已经包含HTML元素，跳过处理
      if (hasHtmlElements) {
        console.log("段落已包含HTML元素，跳过处理:", paragraph.textContent);
        paragraph.dataset.processed = "true";
        return;
      }

      // 获取strong元素后面的所有文本节点和元素
      currentNode = strongElement.nextSibling;
      let processedContent = "";

      // 收集strong元素后面的所有内容
      while (currentNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
          processedContent += currentNode.textContent;
        } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
          // 对于已经存在的HTML元素，保留其outerHTML
          processedContent += currentNode.outerHTML;
        }
        currentNode = currentNode.nextSibling;
      }

      // 处理选择器符号颜色（只处理纯文本部分）
      let processedText = this.processSelectorSymbols(processedContent);

      // 移除strong元素后面的所有内容
      currentNode = strongElement.nextSibling;
      while (currentNode) {
        const nextNode = currentNode.nextSibling;
        currentNode.remove();
        currentNode = nextNode;
      }

      // 在strong元素后面插入处理后的内容
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = processedText;
      while (tempDiv.firstChild) {
        strongElement.parentNode.insertBefore(tempDiv.firstChild, strongElement.nextSibling);
      }

      // 标记为已处理
      paragraph.dataset.processed = "true";
    });
  }

  processSelectorSymbols(text) {
    // 首先检查是否已经包含HTML标签，如果有则不处理
    if (text.includes("<span class=")) {
      return text; // 如果已经包含span标签，直接返回，避免重复处理
    }

    // 处理 "." 和 "#" 符号（紫色）- 类选择器、ID选择器、交集选择器、并集选择器
    let processedText = text
      .replace(/(\s|^)(\.)(\w+)/g, '$1<span class="selector-class-id">$2</span>$3')
      .replace(/(\s|^)(#)(\w+)/g, '$1<span class="selector-class-id">$2</span>$3');

    // 处理 ">"、"+"、"~" 符号（绿色）- 子元素选择器、接续兄弟选择器、后续兄弟选择器
    processedText = processedText
      .replace(/(\s|^)(>)(\s|$)/g, '$1<span class="selector-child">$2</span>$3')
      .replace(/(\s|^)(\+)(\s|$)/g, '$1<span class="selector-adjacent">$2</span>$3')
      .replace(/(\s|^)(~)(\s|$)/g, '$1<span class="selector-sibling">$2</span>$3');

    // 处理 "::" 符号（橙色）- 伪元素选择器（必须先处理双冒号，避免被单冒号正则匹配）
    processedText = processedText.replace(/(\s|^)(::)(\w+)/g, '$1<span class="selector-pseudo">$2</span>$3');

    // 处理 ":" 符号（橙色）- 伪类选择器（后处理单冒号）
    processedText = processedText.replace(/(\s|^)(:)(\w+)/g, '$1<span class="selector-pseudo">$2</span>$3');

    return processedText;
  }

  // 新增：生成元素特征签名（不包含位置信息）
  getElementSignature(tagName, className, id) {
    return `${tagName}:${className || ""}:${id || ""}`;
  }

  setupRandomHtmlBtn() {
    const btn = document.getElementById("randomHtmlBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const html = this.generateRandomHtmlCode();
      const pre = document.querySelector(".code-content pre.line-numbers");
      const code = document.getElementById("htmlCode");
      if (pre && code) {
        code.textContent = html;
        Prism.highlightElement(code);
        this.originalHTML = html;
        this.handleSelectorInput(); // 自动刷新高亮
      }
    });
  }

  generateRandomHtmlCode() {
    // 随机生成一段包含多种选择器的HTML代码，行数35~45
    const tags = [
      "div",
      "span",
      "ul",
      "li",
      "section",
      "article",
      "nav",
      "header",
      "footer",
      "main",
      "aside",
      "p",
      "h1",
      "h2",
      "h3",
      "a",
      "button",
      "input",
    ];
    const classes = [
      "box",
      "item",
      "highlight",
      "special",
      "active",
      "disabled",
      "container",
      "wrapper",
      "main",
      "sidebar",
      "title",
      "desc",
      "note",
      "btn",
      "link",
      "card",
      "row",
      "col",
    ];
    const ids = [
      "main",
      "sidebar",
      "footer",
      "header",
      "nav",
      "content",
      "section1",
      "section2",
      "item1",
      "item2",
      "unique",
      "special",
    ];
    const attrs = [
      () => `type="button"`,
      () => `href="#"`,
      () => `placeholder="输入内容"`,
      () => `disabled`,
      () => `checked`,
      () => `data-random="${Math.floor(Math.random() * 100)}"`,
    ];
    const textPool = [
      "你好世界",
      "Hello World",
      "测试文本",
      "随机内容",
      "示例",
      "内容",
      "按钮",
      "链接",
      "段落",
      "标题",
      "注释",
      "项目",
      "更多...",
      "选择器",
      "样式",
      "高亮",
      "演示",
      "行内元素",
      "块级元素",
      "嵌套",
      "组合",
      "ID",
      "Class",
    ];

    // 生成结构
    let lines = [];
    lines.push("<!DOCTYPE html>");
    lines.push('<html lang="zh-CN">\n  <head>\n    <title>随机HTML示例</title>\n  </head>\n  <body>');

    // 随机生成若干块级结构
    const blockCount = Math.floor(Math.random() * 3) + 2; // 2~4个主块
    for (let b = 0; b < blockCount; b++) {
      const blockTag = this.pick(tags, ["section", "article", "div", "main", "aside", "nav", "header", "footer"]);
      const blockClassArr = this.pickSome(classes, 1, 2);
      const blockClass = blockClassArr.length ? ` class="${blockClassArr.join(" ")}"` : "";
      const blockId = Math.random() < 0.3 ? ` id="${this.pick(ids)}"` : "";
      const blockData = this.randomCustomAttrs();
      lines.push(`    <${blockTag}${blockClass}${blockId}${blockData}>`);

      // 随机生成若干行内容
      const rowCount = Math.floor(Math.random() * 4) + 2; // 2~5行
      for (let r = 0; r < rowCount; r++) {
        // 随机选择内容类型
        const t = Math.random();
        if (t < 0.2) {
          // 列表
          const ulClassArr = this.pickSome(classes, 0, 1);
          const ulClass = ulClassArr.length ? ` class="${ulClassArr.join(" ")}"` : "";
          const ulData = this.randomCustomAttrs();
          lines.push(`      <ul${ulClass}${ulData}>`);
          const liCount = Math.floor(Math.random() * 3) + 2;
          for (let l = 0; l < liCount; l++) {
            const liClassArr = this.pickSome(classes, 0, 2);
            const liClass = liClassArr.length ? ` class="${liClassArr.join(" ")}"` : "";
            const liId = Math.random() < 0.2 ? ` id="${this.pick(ids)}"` : "";
            const liData = this.randomCustomAttrs();
            lines.push(`        <li${liClass}${liId}${liData}>${this.pick(textPool)}</li>`);
          }
          lines.push("      </ul>");
        } else if (t < 0.4) {
          // 段落/标题
          const tag = this.pick(["p", "h2", "h3"]);
          const clsArr = this.pickSome(classes, 0, 2);
          const cls = clsArr.length ? ` class="${clsArr.join(" ")}"` : "";
          const id = Math.random() < 0.15 ? ` id="${this.pick(ids)}"` : "";
          const data = this.randomCustomAttrs();
          let inner = `${this.pick(textPool)}`;
          if (Math.random() < 0.3) {
            // 内部span单独换行
            const spanClass = this.pick(classes);
            const spanData = this.randomCustomAttrs();
            inner += `\n        <span class="${spanClass}"${spanData}>${this.pick(textPool)}</span>`;
          }
          // 如果内容包含换行符，需要特殊处理
          if (inner.includes("\n")) {
            // 分别添加开始标签、内容和结束标签
            lines.push(`      <${tag}${cls}${id}${data}>`);
            const contentLines = inner.split("\n");
            contentLines.forEach((contentLine) => {
              if (contentLine.trim()) {
                lines.push(`        ${contentLine.trim()}`);
              }
            });
            lines.push(`      </${tag}>`);
          } else {
            lines.push(`      <${tag}${cls}${id}${data}>${inner}</${tag}>`);
          }
        } else if (t < 0.6) {
          // 按钮/链接
          if (Math.random() < 0.5) {
            const btnClassArr = this.pickSome(classes, 0, 2);
            const btnClass = btnClassArr.length ? ` class="${btnClassArr.join(" ")}"` : "";
            const btnData = this.randomCustomAttrs();
            lines.push(`      <button${btnClass} ${this.pick(attrs)()}${btnData}>${this.pick(textPool)}</button>`);
          } else {
            const aClassArr = this.pickSome(classes, 0, 2);
            const aClass = aClassArr.length ? ` class="${aClassArr.join(" ")}"` : "";
            const aData = this.randomCustomAttrs();
            lines.push(`      <a${aClass} href="#"${aData}>${this.pick(textPool)}</a>`);
          }
        } else if (t < 0.8) {
          // 嵌套div/span
          if (Math.random() < 0.5) {
            const divClassArr = this.pickSome(classes, 1, 2);
            const divClass = divClassArr.length ? ` class="${divClassArr.join(" ")}"` : "";
            const divData = this.randomCustomAttrs();
            let inner = `${this.pick(textPool)}`;
            if (Math.random() < 0.4) {
              // 内部span单独换行
              const spanClass = this.pick(classes);
              const spanData = this.randomCustomAttrs();
              inner += `\n        <span class="${spanClass}"${spanData}>${this.pick(textPool)}</span>`;
            }
            // 如果内容包含换行符，需要特殊处理
            if (inner.includes("\n")) {
              // 分别添加开始标签、内容和结束标签
              lines.push(`      <div${divClass}${divData}>`);
              const contentLines = inner.split("\n");
              contentLines.forEach((contentLine) => {
                if (contentLine.trim()) {
                  lines.push(`        ${contentLine.trim()}`);
                }
              });
              lines.push(`      </div>`);
            } else {
              lines.push(`      <div${divClass}${divData}>${inner}</div>`);
            }
          } else {
            const spanClassArr = this.pickSome(classes, 1, 2);
            const spanClass = spanClassArr.length ? ` class="${spanClassArr.join(" ")}"` : "";
            const spanData = this.randomCustomAttrs();
            lines.push(`      <span${spanClass}${spanData}>${this.pick(textPool)}</span>`);
          }
        } else {
          // 输入框
          const inputClassArr = this.pickSome(classes, 0, 2);
          const inputClass = inputClassArr.length ? ` class="${inputClassArr.join(" ")}"` : "";
          const inputData = this.randomCustomAttrs();
          lines.push(`      <input${inputClass} ${this.pick(attrs)()}${inputData}/>`);
        }
      }
      lines.push(`    </${blockTag}>`);
    }
    lines.push("  </body>\n</html>");

    // 限制行数
    if (lines.length > 45) lines = lines.slice(0, 45);
    if (lines.length < 35) {
      // 补充空行到35行
      while (lines.length < 35) lines.splice(lines.length - 2, 0, '      <div class="filler"></div>');
    }

    // 行长处理：如超80字符，将内部元素换行
    lines = lines.flatMap((line) => {
      if (line.length <= 80) return [line];
      // 只对含有span、a、button、input等内部元素的行处理
      if (/[ ]<(span|a|button|input)[ >]/.test(line)) {
        // 分析行结构，确保开始标签和结束标签对齐
        const processedLines = this.processLongLine(line);
        return processedLines;
      }
      return [line];
    });
    return lines.join("\n");
  }

  processLongLine(line) {
    // 处理超长行，确保标签对齐
    const lines = [];

    // 匹配开始标签和结束标签
    const tagMatch = line.match(/^(\s*<[^>]+>)(.*?)(<\/[^>]+>\s*)$/);
    if (!tagMatch) {
      // 如果没有匹配到开始和结束标签，使用原来的逻辑
      return line
        .replace(/(>)(\s*<)(span|a|button|input)([\s>])/g, "$1\n        <$3$4")
        .replace(/(<\/span>|<\/a>|<\/button>)/g, "$1\n")
        .split(/\n/)
        .map((l) => l.trimEnd());
    }

    const [, startTag, content, endTag] = tagMatch;
    const indent = startTag.match(/^(\s*)/)[1];
    const baseIndent = indent.length;

    console.log("处理长行:", {
      originalLine: line,
      startTag: startTag,
      content: content,
      endTag: endTag,
      baseIndent: baseIndent,
    });

    // 检查内容是否包含换行符（表示内部元素已经换行）
    const hasInternalNewlines = content.includes("\n");

    if (hasInternalNewlines) {
      // 如果内容已经包含换行符，说明内部元素已经换行
      // 需要特殊处理，确保结束标签与开始标签对齐
      console.log("检测到内容包含换行符，使用特殊处理逻辑");

      // 分割内容为行
      const contentLines = content.split("\n");

      // 构建新的行结构
      lines.push(startTag); // 开始标签单独一行

      // 处理每一行内容
      contentLines.forEach((contentLine, index) => {
        if (contentLine.trim()) {
          // 计算当前行的缩进
          const partIndent = " ".repeat(baseIndent + 2);
          const processedLine = partIndent + contentLine.trim();
          lines.push(processedLine);
          console.log(`内容行 ${index}: "${processedLine}"`);
        }
      });

      // 结束标签与开始标签对齐
      const endTagIndent = " ".repeat(baseIndent);
      const trimmedEndTag = endTag.trim();
      const processedEndTag = endTagIndent + trimmedEndTag;
      lines.push(processedEndTag);

      console.log("最终结果（换行内容）:", {
        endTagIndent: endTagIndent,
        trimmedEndTag: trimmedEndTag,
        processedEndTag: processedEndTag,
        allLines: lines,
      });

      return lines;
    } else {
      // 内容不包含换行符，使用原来的逻辑
      const contentParts = this.splitContentByElements(content);

      console.log("内容分割结果:", contentParts);

      if (contentParts.length === 1) {
        // 只有一个内容部分，不需要换行
        console.log("只有一个内容部分，不换行");
        return [line];
      }

      // 构建新的行结构
      lines.push(startTag); // 开始标签单独一行

      // 处理内容部分
      contentParts.forEach((part, index) => {
        if (part.trim()) {
          // 计算当前部分的缩进
          const partIndent = " ".repeat(baseIndent + 2);
          const processedPart = partIndent + part.trim();
          lines.push(processedPart);
          console.log(`内容部分 ${index}: "${processedPart}"`);
        }
      });

      // 结束标签与开始标签对齐
      const endTagIndent = " ".repeat(baseIndent);
      const trimmedEndTag = endTag.trim();
      const processedEndTag = endTagIndent + trimmedEndTag;
      lines.push(processedEndTag);

      console.log("最终结果（普通内容）:", {
        endTagIndent: endTagIndent,
        trimmedEndTag: trimmedEndTag,
        processedEndTag: processedEndTag,
        allLines: lines,
      });

      return lines;
    }
  }

  splitContentByElements(content) {
    // 将内容按内部元素分割，正确处理混合内容
    const parts = [];
    let currentPart = "";
    let inTag = false;
    let tagBuffer = "";

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (char === "<") {
        // 如果当前有文本内容，先保存
        if (currentPart.trim()) {
          parts.push(currentPart);
          currentPart = "";
        }
        inTag = true;
        tagBuffer = char;
      } else if (char === ">") {
        tagBuffer += char;
        if (inTag) {
          // 检查是否是结束标签
          if (tagBuffer.includes("</")) {
            // 结束标签，添加到当前部分并结束当前部分
            currentPart += tagBuffer;
            parts.push(currentPart);
            currentPart = "";
          } else {
            // 开始标签，开始新部分
            currentPart = tagBuffer;
          }
        }
        inTag = false;
        tagBuffer = "";
      } else if (inTag) {
        tagBuffer += char;
      } else {
        currentPart += char;
      }
    }

    // 添加剩余内容
    if (currentPart.trim()) {
      parts.push(currentPart);
    }

    // 过滤空内容并合并相邻的文本部分
    const filteredParts = parts.filter((part) => part.trim());
    const mergedParts = [];
    let textBuffer = "";

    for (const part of filteredParts) {
      if (part.startsWith("<") && part.endsWith(">")) {
        // 这是一个标签，先保存之前的文本缓冲
        if (textBuffer.trim()) {
          mergedParts.push(textBuffer.trim());
          textBuffer = "";
        }
        // 添加标签
        mergedParts.push(part);
      } else {
        // 这是文本内容，累积到缓冲中
        textBuffer += part;
      }
    }

    // 保存最后的文本缓冲
    if (textBuffer.trim()) {
      mergedParts.push(textBuffer.trim());
    }

    return mergedParts;
  }

  randomCustomAttrs() {
    // 随机生成1~2个自定义属性，支持中英文、非data-前缀
    const n = Math.floor(Math.random() * 2) + 1;
    let attrs = [];

    // 定义属性名和对应的值生成规则
    const attrValueRules = {
      作者: () => this.pick(["张三", "李四", "王五", "赵六", "Alice", "Bob", "Charlie", "David"]),
      编号: () => this.pick(["ISBN-978-0-123456-78-9", "SN-2024-001", "ID-2024-03-15", "REF-2024-001"]),
      状态: () => this.pick(["active", "inactive", "pending", "completed", "draft", "published"]),
      类型: () => this.pick(["primary", "secondary", "success", "warning", "danger", "info"]),
      模式: () => this.pick(["light", "dark", "auto", "compact", "wide", "narrow"]),
      版本: () => this.pick(["v1.0", "v2.1", "beta", "alpha", "rc1", "stable"]),
      标签: () => this.pick(["重要", "紧急", "普通", "高亮", "默认", "特殊"]),
      来源: () => this.pick(["用户", "系统", "API", "数据库", "缓存", "外部"]),
      级别: () => this.pick(["low", "medium", "high", "critical", "info", "debug"]),
      分类: () => this.pick(["技术", "设计", "内容", "功能", "样式", "交互"]),
      主题: () => this.pick(["科技", "自然", "商务", "艺术", "简约", "复古"]),
      区域: () => this.pick(["header", "main", "sidebar", "footer", "nav", "content"]),
      角色: () => this.pick(["admin", "user", "guest", "moderator", "editor", "viewer"]),
      权限: () => this.pick(["read", "write", "delete", "admin", "public", "private"]),
      时间: () => this.pick(["2024-03-15", "2024-01-01", "2023-12-31", "2024-06-01"]),
      位置: () => this.pick(["top", "bottom", "left", "right", "center", "auto"]),
      大小: () => this.pick(["small", "medium", "large", "xl", "xs", "xxl"]),
      颜色: () => this.pick(["red", "blue", "green", "yellow", "purple", "orange"]),
      语言: () => this.pick(["zh-CN", "en-US", "ja-JP", "ko-KR", "fr-FR", "de-DE"]),
      设备: () => this.pick(["desktop", "mobile", "tablet", "tv", "watch", "car"]),
    };

    // 简化的属性名列表，避免过长
    const simpleNames = [
      "作者",
      "编号",
      "状态",
      "类型",
      "模式",
      "版本",
      "标签",
      "来源",
      "级别",
      "分类",
      "主题",
      "区域",
      "角色",
      "权限",
      "时间",
      "位置",
      "大小",
      "颜色",
      "语言",
      "设备",
    ];

    for (let i = 0; i < n; i++) {
      let name = this.pick(simpleNames);

      // 随机决定是否加前缀，但确保只有一个"-"
      if (Math.random() < 0.3) {
        const prefixes = ["data", "x", "my", "is", "has", "can"];
        name = this.pick(prefixes) + "-" + name;
      } else if (Math.random() < 0.2) {
        const cnPrefixes = ["自定义", "属性", "扩展"];
        name = this.pick(cnPrefixes) + "-" + name;
      }

      // 根据属性名生成合适的值
      let val;
      if (attrValueRules[name.split("-").pop()]) {
        val = attrValueRules[name.split("-").pop()]();
      } else {
        // 默认值生成
        val =
          Math.random() < 0.5
            ? this.pick(["true", "false", "yes", "no", "on", "off"])
            : Math.floor(Math.random() * 100);
      }

      attrs.push(` ${name}="${val}"`);
    }
    return attrs.join("");
  }

  pick(arr, restrict) {
    if (restrict) arr = arr.filter((x) => restrict.includes(x));
    return arr[Math.floor(Math.random() * arr.length)];
  }
  pickSome(arr, min = 1, max = 2) {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    const copy = arr.slice();
    const res = [];
    for (let i = 0; i < n && copy.length; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      res.push(copy[idx]);
      copy.splice(idx, 1);
    }
    return res;
  }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", () => {
  new CSSSelectorTutorial();
});
