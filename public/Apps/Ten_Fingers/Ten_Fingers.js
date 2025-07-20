// 打字练习应用
class TypingApp {
  constructor() {
    this.articles = [];
    this.currentArticle = null;
    this.currentText = "";
    this.userInput = "";
    this.currentIndex = 0;
    this.startTime = null;
    this.endTime = null;
    this.backspaceCount = 0;
    this.correctChars = 0;
    this.errorChars = 0;
    this.errorCharMap = new Map();
    this.isTyping = false;
    this.countdownInterval = null;
    this.remainingTime = 0;
    this.settings = {
      timeLimit: 300, // 5分钟
      useCountdown: false, // 默认不使用倒计时
      selectedArticle: 0,
      userName: "陌生人",
      correctSound: true,
      errorSound: true,
      fontSize: 16,
    };

    this.correctAudio = null;
    this.errorAudio = null;
    this.statsInterval = null;
    this.resizeObserver = null;
    this.isComposing = false; // 中文输入法合成状态

    this.init();
  }

  async init() {
    await this.loadArticles();
    this.loadAudio();
    this.createUI();
    this.bindEvents();
    this.updateUI();
  }

  async loadArticles() {
    const articleFiles = [
      "01_JavaScript基础.txt",
      "02_Python编程.txt",
      "03_Linux系统管理.txt",
      "04_Docker容器化.txt",
      "05_Git版本控制.txt",
      "06_数据库设计.txt",
      "07_网络协议.txt",
      "08_云计算架构.txt",
      "09_人工智能基础.txt",
      "10_Web开发技术.txt",
      "11_移动应用开发.txt",
      "12_DevOps实践.txt",
      "13_数据结构算法.txt",
      "14_软件测试方法.txt",
      "15_网络安全基础.txt",
      "16_大数据处理.txt",
      "17_微服务架构.txt",
      "18_区块链技术.txt",
      "19_物联网技术.txt",
      "20_软件架构设计.txt",
    ];

    const articleTitles = [
      "JavaScript基础",
      "Python编程",
      "Linux系统管理",
      "Docker容器化",
      "Git版本控制",
      "数据库设计",
      "网络协议",
      "云计算架构",
      "人工智能基础",
      "Web开发技术",
      "移动应用开发",
      "DevOps实践",
      "数据结构算法",
      "软件测试方法",
      "网络安全基础",
      "大数据处理",
      "微服务架构",
      "区块链技术",
      "物联网技术",
      "软件架构设计",
    ];

    for (let i = 0; i < articleFiles.length; i++) {
      try {
        const response = await fetch(`Texts/${articleFiles[i]}`);
        const text = await response.text();
        this.articles.push({
          title: articleTitles[i],
          content: text.trim(),
          filename: articleFiles[i],
        });
      } catch (error) {
        console.error(`Failed to load article: ${articleFiles[i]}`, error);
      }
    }
  }

  loadAudio() {
    this.correctAudio = new Audio("Audios/correct.mp3");
    this.errorAudio = new Audio("Audios/error.mp3");
    
    // 设置音频属性，允许快速重播
    this.correctAudio.preload = 'auto';
    this.errorAudio.preload = 'auto';
  }

  createUI() {
    const app = document.createElement("div");
    app.className = "typing-app";
    app.innerHTML = `
      <div class="settings-panel">
        <h2>打字练习设置</h2>
        <div class="settings-grid">
          <div class="setting-group">
            <label>时间设置</label>
            <div class="time-setting-container">
              <label class="countdown-toggle">
                <input type="checkbox" id="useCountdown">
                <span class="toggle-text">倒计时</span>
              </label>
            </div>
            <div class="time-input-container hidden" id="timeInputContainer">
              <input type="number" id="timeLimit" min="30" max="1800" value="300" placeholder="输入秒数">
              <span class="time-unit">秒</span>
            </div>
          </div>
          <div class="setting-group">
            <label for="articleSelect">选择文章</label>
            <button id="articleSelect" class="start-button">选择文章</button>
          </div>
          <div class="setting-group">
            <label for="userName">测试者姓名</label>
            <input type="text" id="userName" placeholder="陌生人">
          </div>
          <div class="setting-group">
            <label>音效设置</label>
            <div class="checkbox-group">
              <input type="checkbox" id="correctSound" checked>
              <label for="correctSound">正确音效</label>
            </div>
            <div class="checkbox-group">
              <input type="checkbox" id="errorSound" checked>
              <label for="errorSound">错误音效</label>
            </div>
          </div>
          <div class="setting-group">
            <label for="fontSize">字体大小：<span id="fontSizeValue"><span class="font-size-number">18</span><span class="font-size-unit">px</span></span></label>
            <div class="font-size-container">
              <input type="range" id="fontSize" min="14" max="24" value="18">
            </div>
          </div>
        </div>
        <button id="startButton" class="start-button">开始打字</button>
      </div>
      
      <div class="typing-area hidden" id="typingArea">
        <div class="typing-lines" id="typingLines"></div>
      </div>
      
      <div class="stats-panel hidden" id="statsPanel">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value" id="timeElapsed">00:00</div>
            <div class="stat-label">用时</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="backspaceCount">0</div>
            <div class="stat-label">退格次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="correctCount">0</div>
            <div class="stat-label">正确字符</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="errorCount">0</div>
            <div class="stat-label">错误字符</div>
          </div>
        </div>
      </div>
      
      <div class="countdown hidden" id="countdown"></div>
      
      <!-- 隐藏的输入框用于中文输入法 -->
      <input type="text" id="hiddenInput" style="position: absolute; left: -9999px; opacity: 0; font-size: 16px;" />
    `;

    document.body.appendChild(app);
  }

  bindEvents() {
    // 设置相关事件
    document.getElementById("timeLimit").addEventListener("input", (e) => {
      this.settings.timeLimit = parseInt(e.target.value);
    });
    
    // 倒计时模式切换
    document.getElementById("useCountdown").addEventListener("change", (e) => {
      this.settings.useCountdown = e.target.checked;
      const timeInputContainer = document.getElementById("timeInputContainer");
      if (e.target.checked) {
        timeInputContainer.classList.remove("hidden");
      } else {
        timeInputContainer.classList.add("hidden");
      }
    });

    document.getElementById("userName").addEventListener("input", (e) => {
      this.settings.userName = e.target.value || "陌生人";
    });

    document.getElementById("correctSound").addEventListener("change", (e) => {
      this.settings.correctSound = e.target.checked;
    });

    document.getElementById("errorSound").addEventListener("change", (e) => {
      this.settings.errorSound = e.target.checked;
    });

    document.getElementById("fontSize").addEventListener("input", (e) => {
      this.settings.fontSize = parseInt(e.target.value);
      document.querySelector(".font-size-number").textContent = this.settings.fontSize;
      this.updateFontSize();
      if (this.isTyping) {
        this.updateTypingDisplay();
      }
    });

    // 文章选择
    document.getElementById("articleSelect").addEventListener("click", () => {
      this.showArticleDialog();
    });

    // 开始打字
    document.getElementById("startButton").addEventListener("click", () => {
      this.startTyping();
    });

    // 键盘事件
    document.addEventListener("keydown", (e) => {
      if (!this.isTyping) return;

      if (e.key === "Backspace") {
        this.handleBackspace();
        e.preventDefault();
      } else if (e.key.length === 1 && !this.isComposing) {
        // 处理单字符输入（英文和中文标点符号）
        this.handleCharInput(e.key);
        e.preventDefault();
      }
    });
    

    

    

    
    // 当页面获得焦点时，聚焦到浮动输入框
    document.addEventListener("click", () => {
      if (this.isTyping) {
        setTimeout(() => {
          const floatingInput = document.getElementById("floatingInput");
          if (floatingInput) {
            floatingInput.focus();
          }
        }, 10);
      }
    });

    // 监听窗口大小变化
    window.addEventListener("resize", () => {
      if (this.isTyping) {
        this.updateTypingDisplay();
      }
    });

    // 使用 ResizeObserver 监听 typing-app 尺寸变化
    this.setupResizeObserver();
  }

  showArticleDialog() {
    const overlay = document.createElement("div");
    overlay.className = "dialog-overlay";

    const dialog = document.createElement("div");
    dialog.className = "article-dialog fade-in";
    dialog.innerHTML = `
      <h3>选择文章</h3>
      <div class="article-list">
        ${this.articles
          .map(
            (article, index) => `
          <div class="article-item" data-index="${index}">
            <div class="article-title">${article.title}</div>
            <div class="article-preview">${article.content.substring(0, 50)}...</div>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // 绑定选择事件
    dialog.querySelectorAll(".article-item").forEach((item) => {
      item.addEventListener("click", () => {
        const index = parseInt(item.dataset.index);
        this.settings.selectedArticle = index;
        document.getElementById("articleSelect").textContent = this.articles[index].title;
        this.closeDialog(overlay);
      });
    });

    // 点击遮罩关闭
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        this.closeDialog(overlay);
      }
    });
  }

  closeDialog(overlay) {
    overlay.remove();
  }

  startTyping() {
    if (this.articles.length === 0) {
      alert("请先加载文章");
      return;
    }

    this.currentArticle = this.articles[this.settings.selectedArticle];
    this.currentText = this.currentArticle.content;
    this.userInput = "";
    this.currentIndex = 0;
    this.backspaceCount = 0;
    this.correctChars = 0;
    this.errorChars = 0;
    this.errorCharMap.clear();
    this.isTyping = true;
    this.remainingTime = this.settings.timeLimit;

    // 显示打字区域
    document.querySelector(".settings-panel").classList.add("hidden");
    document.getElementById("typingArea").classList.remove("hidden");
    document.getElementById("statsPanel").classList.remove("hidden");
    
    // 根据是否使用倒计时显示倒计时
    if (this.settings.useCountdown) {
      document.getElementById("countdown").classList.remove("hidden");
      // 立即更新倒计时显示
      this.updateCountdown();
      // 开始倒计时
      this.startCountdown();
    }

    // 开始计时
    this.startTime = Date.now();
    this.startStatsUpdate();

    // 更新显示
    this.updateTypingDisplay();
    this.updateStats();
    this.updateFontSize();

    // 创建跟随光标的输入框
    this.createFloatingInput();
    
    // 聚焦到浮动输入框以支持中文输入法
    setTimeout(() => {
      const floatingInput = document.getElementById("floatingInput");
      if (floatingInput) {
        floatingInput.focus();
        
        // 设置输入法为中文模式
        try {
          floatingInput.setAttribute('lang', 'zh-CN');
          floatingInput.setAttribute('inputmode', 'text');
        } catch (e) {
          // 忽略错误
        }
      }
    }, 100);
  }

  startCountdown() {
    // 立即更新一次倒计时
    this.updateCountdown();

    this.countdownInterval = setInterval(() => {
      this.remainingTime--;
      this.updateCountdown();

      if (this.remainingTime <= 0) {
        this.endTyping();
      }
    }, 1000);
  }

  updateCountdown() {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    document.getElementById("countdown").textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  handleCharInput(char) {
    // 调试：输出接收到的字符
    if (this.currentIndex >= this.currentText.length) {
      return; // 已经打完了
    }

    const expectedChar = this.currentText[this.currentIndex];

    if (char === expectedChar) {
      // 正确输入
      this.correctChars++;
      if (this.settings.correctSound && this.correctAudio) {
        // 立即停止当前播放并重新开始
        this.correctAudio.pause();
        this.correctAudio.currentTime = 0;
        this.correctAudio.play().catch(() => {});
      }
    } else {
      // 错误输入
      this.errorChars++;
      this.recordErrorChar(expectedChar);
      if (this.settings.errorSound && this.errorAudio) {
        // 立即停止当前播放并重新开始
        this.errorAudio.pause();
        this.errorAudio.currentTime = 0;
        this.errorAudio.play().catch(() => {});
      }
    }

    this.userInput += char;
    this.currentIndex++;

    this.updateTypingDisplay();
    this.updateStats();

    // 检查是否完成
    if (this.currentIndex >= this.currentText.length) {
      this.endTyping();
    }
  }

  handleBackspace() {
    if (this.userInput.length > 0) {
      this.userInput = this.userInput.slice(0, -1);
      this.currentIndex--;
      this.backspaceCount++;
      this.updateTypingDisplay();
      this.updateStats();
    }
  }

  recordErrorChar(char) {
    this.errorCharMap.set(char, (this.errorCharMap.get(char) || 0) + 1);
  }

  updateTypingDisplay() {
    const typingLines = document.getElementById("typingLines");
    const lines = this.getTypingLines();

    typingLines.innerHTML = lines
      .map(
        (line) => `
      <div class="typing-line">
        <div class="target-text">${line.target}</div>
        <div class="user-input">${line.input}</div>
      </div>
    `
      )
      .join("");
    
    // 更新浮动输入框位置
    this.updateFloatingInputPosition();
  }

  getTypingLines() {
    const lines = [];
    const maxWidth = 960; // 固定宽度960px
    
    // 创建临时元素来测量文本宽度
    const tempElement = document.createElement('span');
    tempElement.style.fontSize = `${this.settings.fontSize}px`;
    tempElement.style.fontFamily = 'JetBrains Mono, Noto Sans Mono, monospace';
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.style.letterSpacing = '0px';
    tempElement.style.wordSpacing = '0px';
    document.body.appendChild(tempElement);

    // 初始化3行
    for (let i = 0; i < 3; i++) {
      lines.push({ target: "", input: "", startIndex: -1, endIndex: -1 });
    }

    let currentLineIndex = 0;
    let currentWidth = 0;

    // 计算当前应该显示哪一页的文本
    // 根据当前光标位置计算页面
    const avgCharWidth = this.settings.fontSize * 0.6; // 英文字符平均宽度
    const estimatedCharsPerLine = Math.floor(maxWidth / avgCharWidth);
    const estimatedCharsPerPage = estimatedCharsPerLine * 3;
    const currentPage = Math.floor(this.currentIndex / estimatedCharsPerPage);
    const startCharIndex = currentPage * estimatedCharsPerPage;
    const endCharIndex = Math.min(startCharIndex + estimatedCharsPerPage * 2, this.currentText.length);
    
    // 处理当前页面的字符，精确分行
    for (let i = startCharIndex; i < endCharIndex && currentLineIndex < 3; i++) {
      const char = this.currentText[i];
      
      // 精确测量当前字符的宽度
      tempElement.textContent = char;
      const charWidth = tempElement.offsetWidth;
      
      // 调试字符宽度信息
      if (i < startCharIndex + 10) {
        const isChinese = /[\u4e00-\u9fff]/.test(char);
      }

      // 检查添加当前字符是否会超出宽度
      if (currentWidth + charWidth > maxWidth && currentWidth > 0) {        
        // 当前行已满，记录当前行的结束位置
        lines[currentLineIndex].endIndex = i - 1;
        
        // 移动到下一行
        currentLineIndex++;
        currentWidth = 0;
        
        // 如果已经超过3行，停止处理
        if (currentLineIndex >= 3) {
          break;
        }
      }

      // 记录当前行的开始位置
      if (currentWidth === 0) {
        lines[currentLineIndex].startIndex = i;
      }

      currentWidth += charWidth;
    }

    // 处理最后一行
    if (currentLineIndex < 3 && currentWidth > 0) {
      lines[currentLineIndex].endIndex = endCharIndex - 1;
    }

    // 为每行生成HTML内容
    for (let lineIndex = 0; lineIndex < 3; lineIndex++) {
      const line = lines[lineIndex];
      
      if (line.startIndex !== -1 && line.endIndex !== -1) {
        // 生成目标文本
        for (let i = line.startIndex; i <= line.endIndex; i++) {
          const char = this.currentText[i];
          const isCurrent = i === this.currentIndex;
          
          if (isCurrent) {
            line.target += `<span class="current">${char}</span>`;
          } else {
            line.target += char;
          }
        }

        // 生成用户输入
        for (let i = line.startIndex; i <= line.endIndex; i++) {
          const userChar = i < this.userInput.length ? this.userInput[i] : "";
          if (userChar) {
            const expectedChar = this.currentText[i];
            const isCorrect = userChar === expectedChar;
            
            if (isCorrect) {
              line.input += `<span class="correct">${userChar}</span>`;
            } else {
              line.input += `<span class="error">${userChar}</span>`;
            }
          }
        }
      }
    }

    // 清理临时元素
    document.body.removeChild(tempElement);

    // 在用户输入行末尾添加光标
    if (this.isTyping) {
      // 找到当前光标所在的行
      let cursorLineIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startIndex <= this.currentIndex && this.currentIndex <= line.endIndex) {
          cursorLineIndex = i;
          break;
        }
      }
      
      // 在光标所在行添加光标
      if (cursorLineIndex < 3) {
        lines[cursorLineIndex].input += '<span class="cursor">|</span>';
      }
    }

    return lines;
  }

  updateStats() {
    document.getElementById("timeElapsed").textContent = this.getTimeElapsed();
    document.getElementById("backspaceCount").textContent = this.backspaceCount;
    document.getElementById("correctCount").textContent = this.correctChars;
    document.getElementById("errorCount").textContent = this.errorChars;
  }

  startStatsUpdate() {
    // 实时更新用时统计
    this.statsInterval = setInterval(() => {
      if (this.isTyping) {
        document.getElementById("timeElapsed").textContent = this.getTimeElapsed();
      }
    }, 100);
  }

  getTimeElapsed() {
    if (!this.startTime) return "00:00";

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  updateFontSize() {
    const fontSize = this.settings.fontSize;
    document.documentElement.style.setProperty("--typing-font-size", `${fontSize}px`);
  }

  endTyping() {
    this.isTyping = false;
    this.endTime = Date.now();

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    // 隐藏倒计时
    document.getElementById("countdown").classList.add("hidden");

    // 显示结果
    this.showResult();
  }

  showResult() {
    const totalTime = Math.floor((this.endTime - this.startTime) / 1000);
    const totalChars = this.correctChars + this.errorChars;
    const accuracy = totalChars > 0 ? Math.round((this.correctChars / totalChars) * 100) : 0;

    // 获取错误最多的字符
    const topErrors = Array.from(this.errorCharMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const overlay = document.createElement("div");
    overlay.className = "dialog-overlay";

    const dialog = document.createElement("div");
    dialog.className = "result-dialog fade-in";
    dialog.innerHTML = `
      <div class="result-header">
        <div class="result-title">打字测试结果</div>
        <div class="result-subtitle">${this.settings.userName}</div>
      </div>
      
      <div class="result-stats">
        <div class="result-stat">
          <div class="result-stat-value">${Math.floor(totalTime / 60)}:${(totalTime % 60)
      .toString()
      .padStart(2, "0")}</div>
          <div class="result-stat-label">总用时</div>
        </div>
        <div class="result-stat">
          <div class="result-stat-value">${this.backspaceCount}</div>
          <div class="result-stat-label">退格次数</div>
        </div>
        <div class="result-stat">
          <div class="result-stat-value">${this.correctChars}</div>
          <div class="result-stat-label">正确字符</div>
        </div>
        <div class="result-stat">
          <div class="result-stat-value">${this.errorChars}</div>
          <div class="result-stat-label">错误字符</div>
        </div>
      </div>
      
      <div class="result-stats">
        <div class="result-stat">
          <div class="result-stat-value">${accuracy}<span style="font-size: 14px;">%</span></div>
          <div class="result-stat-label">正确率</div>
        </div>
        <div class="result-stat">
          <div class="result-stat-value">${Math.round(this.correctChars / (totalTime / 60))}</div>
          <div class="result-stat-label">每分钟正确字符</div>
        </div>
      </div>
      
      ${
        topErrors.length > 0
          ? `
        <div class="error-chars">
          <div class="error-chars-title">错误最多的字符</div>
          <div class="error-chars-list">
            ${topErrors
              .map(
                ([char, count]) => `
              <div class="error-char">${char}: ${count}</div>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }
      
      <div class="result-actions">
        <button class="result-button retry-button" id="retryButton">重新开始</button>
        <button class="result-button close-button" id="closeButton">关闭</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // 绑定按钮事件
    document.getElementById("retryButton").addEventListener("click", () => {
      this.closeDialog(overlay);
      this.resetToSettings();
    });

    document.getElementById("closeButton").addEventListener("click", () => {
      this.closeDialog(overlay);
      this.resetToSettings();
    });

    // 点击遮罩关闭
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        this.closeDialog(overlay);
        this.resetToSettings();
      }
    });
  }

  resetToSettings() {
    // 隐藏打字区域和统计
    document.getElementById("typingArea").classList.add("hidden");
    document.getElementById("statsPanel").classList.add("hidden");

    // 显示设置面板
    document.querySelector(".settings-panel").classList.remove("hidden");

    // 重置状态
    this.isTyping = false;
    this.currentIndex = 0;
    this.userInput = "";
    this.startTime = null;
    this.endTime = null;

    // 清理浮动输入框
    const floatingInput = document.getElementById("floatingInput");
    if (floatingInput) {
      floatingInput.remove();
    }

    // 清理 ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  setupResizeObserver() {
    // 等待 DOM 加载完成后再设置 ResizeObserver
    setTimeout(() => {
      const typingApp = document.querySelector(".typing-app");
      if (typingApp && window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(() => {
          if (this.isTyping) {
            this.updateTypingDisplay();
          }
        });
        this.resizeObserver.observe(typingApp);
      }
    }, 100);
  }

  createFloatingInput() {
    // 移除旧的浮动输入框
    const oldInput = document.getElementById("floatingInput");
    if (oldInput) {
      oldInput.remove();
    }
    
    // 创建新的浮动输入框
    const floatingInput = document.createElement("input");
    floatingInput.id = "floatingInput";
    floatingInput.type = "text";
    floatingInput.style.cssText = `
      position: absolute;
      opacity: 0;
      font-size: ${this.settings.fontSize}px;
      font-family: 'JetBrains Mono', 'Noto Sans Mono', monospace;
      pointer-events: auto;
      z-index: 1000;
      width: 1px;
      height: 1px;
      border: none;
      outline: none;
      background: transparent;
    `;
    
    // 设置输入法相关属性
    floatingInput.setAttribute('lang', 'zh-CN');
    floatingInput.setAttribute('inputmode', 'text');
    floatingInput.setAttribute('autocomplete', 'off');
    floatingInput.setAttribute('autocorrect', 'off');
    floatingInput.setAttribute('autocapitalize', 'off');
    floatingInput.setAttribute('spellcheck', 'false');
    
    document.body.appendChild(floatingInput);
    
    // 绑定事件
    this.bindFloatingInputEvents(floatingInput);
    
    // 初始定位
    this.updateFloatingInputPosition();
  }
  
  updateFloatingInputPosition() {
    const floatingInput = document.getElementById("floatingInput");
    if (!floatingInput || !this.isTyping) return;
    
    // 获取当前光标位置
    const cursorElement = document.querySelector(".cursor");
    if (cursorElement) {
      const rect = cursorElement.getBoundingClientRect();
      floatingInput.style.left = `${rect.left}px`;
      floatingInput.style.top = `${rect.top}px`;
      floatingInput.style.width = `${rect.width}px`;
      floatingInput.style.height = `${rect.height}px`;
    }
  }
  
  bindFloatingInputEvents(floatingInput) {
    floatingInput.addEventListener("compositionstart", (e) => {
      if (!this.isTyping) return;
      this.isComposing = true;
    });
    
    floatingInput.addEventListener("compositionupdate", (e) => {
      if (!this.isTyping) return;
    });
    
    floatingInput.addEventListener("compositionend", (e) => {
      if (!this.isTyping) return;
      this.isComposing = false;
      
      // 合成结束后处理输入的字符
      if (e.data) {
        // 处理多个字符的情况
        for (let i = 0; i < e.data.length; i++) {
          this.handleCharInput(e.data[i]);
        }
        floatingInput.value = ""; // 清空输入框
      }
    });
    
    floatingInput.addEventListener("input", (e) => {
      if (!this.isTyping) return;
      
      // 获取输入的内容
      const input = e.target.value;
      if (input && !this.isComposing) {
        // 处理多个字符的情况
        for (let i = 0; i < input.length; i++) {
          this.handleCharInput(input[i]);
        }
        floatingInput.value = ""; // 清空输入框
      }
    });
    
    // 添加 keydown 事件处理中文输入法的标点符号
    floatingInput.addEventListener("keydown", (e) => {
      if (!this.isTyping || this.isComposing) return;
      
      // 处理中文输入法的标点符号
      if (e.key && e.key.length === 1) {
        // 检查是否是标点符号
        const isPunctuation = /[，。！？；：""''（）【】《》、]/.test(e.key);
        if (isPunctuation) {
          this.handleCharInput(e.key);
          e.preventDefault();
        }
      }
    });
    
    // 添加 keypress 事件处理中文输入法的标点符号
    floatingInput.addEventListener("keypress", (e) => {
      if (!this.isTyping || this.isComposing) return;
      
      // 处理标点符号输入
      if (e.charCode > 0) {
        const char = String.fromCharCode(e.charCode);
        this.handleCharInput(char);
        e.preventDefault();
      }
    });
    
    // 添加 beforeinput 事件处理中文输入法的标点符号
    floatingInput.addEventListener("beforeinput", (e) => {
      if (!this.isTyping) return;
      
      // 处理中文输入法的标点符号
      if (e.data && e.data.length === 1 && !this.isComposing) {
        this.handleCharInput(e.data);
        e.preventDefault();
      }
    });
  }

  updateUI() {
    // 更新文章选择按钮
    if (this.articles.length > 0) {
      document.getElementById("articleSelect").textContent = this.articles[this.settings.selectedArticle].title;
    }

    // 更新字体大小显示
    document.querySelector(".font-size-number").textContent = this.settings.fontSize;
  }
}

// 初始化应用
document.addEventListener("DOMContentLoaded", () => {
  new TypingApp();
});
