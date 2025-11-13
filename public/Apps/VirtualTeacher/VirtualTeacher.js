const chatLog = document.getElementById("chatLog");
const messageTemplate = document.getElementById("messageTemplate");
const chatForm = document.getElementById("chatForm");
const userMessageInput = document.getElementById("userMessage");
const statusBadge = document.getElementById("sessionStatus");
const resetButton = document.getElementById("resetChat");
const includeReasoningCheckbox = document.getElementById("includeReasoning");

const API_ENDPOINT = "https://api.siliconflow.cn/v1/chat/completions";
const MODEL_ID = "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B";

const KEY_VECTOR = Object.freeze([
  118, 96, 62, 110, 112, 121, 96, 116, 104, 103, 126, 114, 116, 125, 103, 100, 119, 101, 126,
  114, 125, 102, 120, 109, 117, 103, 127, 100, 107, 124, 107, 115, 117, 97, 99, 99, 115, 108, 
  101, 113, 117, 105, 105, 125, 108, 108, 124, 119, 124, 110, 101,                                 // 无奈之举啊，后期再说吧
]);
const KEY_MASK = [5, 11, 19, 7];

const resolveApiKey = (() => {
  let cached;
  return () => {
    if (cached) return cached;
    cached = KEY_VECTOR.map((value, index) => {
      const salt = KEY_MASK[index % KEY_MASK.length];
      return String.fromCharCode(value ^ salt);
    }).join("");
    return cached;
  };
})();

const buildAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${resolveApiKey()}`,
});

const SYSTEM_PROMPT = {
  role: "system",         //系统提示词
  content:
    "你是一位名为“虚拟老师”的中文虚拟老师 你叫“杨佐”，会以严谨认真却又风趣幽默的方式与用户对话。始终保持积极、共情、尊重，在用畅聊生活和情感问题时温柔解答，在用户探讨技术问题时请严谨认真的回答。回复以中文为主，可根据语境穿插 emoji / 表情"
};

let conversation = [SYSTEM_PROMPT];
const initialLogMarkup = chatLog?.innerHTML ?? "";

const formatTimestamp = () =>
  new Date().toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const normalizeContent = (raw) => {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          return item.text || item.content || "";
        }
        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  }
  if (typeof raw === "object") {
    return raw.text || raw.content || "";
  }
  return "";
};

let markedConfigured = false;

const ensureMarkedOptions = () => {
  if (markedConfigured) return;
  if (typeof window !== "undefined" && window.marked) {
    window.marked.setOptions({
      breaks: true,
      gfm: true,
    });
    markedConfigured = true;
  }
};

const renderMarkdownInto = (target, markdown, fallback = "（无内容）") => {
  if (!target) return;
  const content = markdown && markdown.trim() ? markdown : fallback;
  if (typeof window !== "undefined" && window.marked && window.DOMPurify) {
    ensureMarkedOptions();
    const rawHtml = window.marked.parse(content);
    const safeHtml = window.DOMPurify.sanitize(rawHtml);
    target.innerHTML = safeHtml;
    target.classList.add("markdown-body");
  } else {
    target.textContent = content;
    target.classList.remove("markdown-body");
  }
};

const appendMessage = ({ role, content, reasoning }, options = {}) => {
  const {
    returnNode = false,
    forceReasoningVisible = false,
    reasoningInitiallyOpen = false,
  } = options;
  if (!messageTemplate || !chatLog) return;
  const node = messageTemplate.content.cloneNode(true);
  const article = node.querySelector("article");
  const nameEl = node.querySelector(".名称");
  const timestampEl = node.querySelector(".时间戳");
  const contentEl = node.querySelector(".正文");
  const toggleButton = node.querySelector(".推理切换按钮");
  const reasoningBlock = node.querySelector(".推理块");
  const reasoningContent = node.querySelector(".推理内容");

  article.dataset.role = role;

  nameEl.textContent = role === "user" ? "你" : "虚拟老师";

  timestampEl.textContent = formatTimestamp();
  renderMarkdownInto(contentEl, content || "[无内容]");

  if (role !== "assistant" || !reasoning || !reasoning.trim()) {
    toggleButton?.remove();
    reasoningBlock?.remove();
  } else {
    toggleButton.textContent = "思维链";
    toggleButton.addEventListener("click", () => {
      reasoningBlock.open = !reasoningBlock.open;
    });
    reasoningContent.textContent = reasoning.trim();
    if (reasoningBlock) {
      reasoningBlock.dataset.forceVisible = forceReasoningVisible ? "true" : "false";
      const shouldShow = forceReasoningVisible || includeReasoningCheckbox?.checked;
      reasoningBlock.style.display = shouldShow ? "" : "none";
      reasoningBlock.open = shouldShow || reasoningInitiallyOpen;
    }
  }

  chatLog.appendChild(node);
  chatLog.scrollTop = chatLog.scrollHeight;
  if (returnNode) {
    return chatLog.lastElementChild;
  }
};

const updateAssistantMessage = (article, { content, reasoning, forceReasoningVisible = false }) => {
  if (!article) return;
  const contentEl = article.querySelector(".正文");
  const toggleButton = article.querySelector(".推理切换按钮");
  const reasoningBlock = article.querySelector(".推理块");
  const reasoningContent = article.querySelector(".推理内容");

  if (contentEl && content !== undefined) {
    renderMarkdownInto(contentEl, content || "（模型未返回内容）");
  }

  if (!reasoningBlock || !reasoningContent || !toggleButton) {
    return;
  }

  if (reasoning && reasoning.trim()) {
    reasoningContent.textContent = reasoning;
    reasoningBlock.dataset.forceVisible = forceReasoningVisible ? "true" : "false";
    const shouldShow = forceReasoningVisible || includeReasoningCheckbox?.checked;
    reasoningBlock.style.display = shouldShow ? "" : "none";
    if (shouldShow) {
      reasoningBlock.open = true;
    }
  } else {
    toggleButton.remove();
    reasoningBlock.remove();
  }
};

const setStatus = (text, tone = "idle") => {
  if (!statusBadge) return;
  statusBadge.textContent = text;
  statusBadge.dataset.tone = tone;
};

const setFormDisabled = (disabled) => {
  if (!userMessageInput) return;
  userMessageInput.disabled = disabled;
  const submitButton = chatForm?.querySelector("button[type='submit']");
  if (submitButton) {
    submitButton.disabled = disabled;
  }
};

const syncReasoningVisibility = () => {
  if (!chatLog || !includeReasoningCheckbox) return;
  const display = includeReasoningCheckbox.checked ? "" : "none";
  chatLog.querySelectorAll(".推理块").forEach((node) => {
    if (node.dataset.forceVisible === "true") {
      node.style.display = "";
      node.open = true;
    } else {
      node.style.display = display;
      if (!includeReasoningCheckbox.checked) {
        node.open = false;
      }
    }
  });
};

const resetConversation = () => {
  conversation = [SYSTEM_PROMPT];
  if (chatLog) {
    chatLog.innerHTML = initialLogMarkup;
    syncReasoningVisibility();
  }
  setStatus("待命", "idle");
};

const streamChatCompletion = async (messages, handlers = {}) => {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      model: MODEL_ID,
      messages,
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      frequency_penalty: 0.5,
      min_p: 0.05,
      response_format: { type: "text" },
    }),
  });

  if (!response.ok || !response.body) {
    let errorText = "";
    try {
      const data = await response.json();
      errorText = data?.message || data?.error || JSON.stringify(data);
    } catch {
      errorText = await response.text();
    }
    throw new Error(errorText || "调用流式接口失败");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let finished = false;

  const processSegment = (segment) => {
    const line = segment.trim();
    if (!line || !line.startsWith("data:")) {
      return;
    }
    const payload = line.slice(5).trim();
    if (payload === "[DONE]") {
      if (!finished) {
        finished = true;
        handlers.onFinish?.();
      }
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(payload);
    } catch (error) {
      console.warn("解析流式分片失败", payload, error);
      return;
    }
    const choice = parsed?.choices?.[0];
    const delta = choice?.delta || {};
    if (delta.reasoning_content !== undefined && delta.reasoning_content !== null) {
      handlers.onReasoningDelta?.(delta.reasoning_content);
    }
    if (delta.content) {
      handlers.onContentDelta?.(delta.content);
    }
    if (choice?.finish_reason && !finished) {
      finished = true;
      handlers.onFinish?.();
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    buffer = buffer.replace(/\r/g, "");
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";
    parts.forEach(processSegment);
    if (finished) {
      return;
    }
  }

  if (buffer.trim()) {
    processSegment(buffer);
  }

  if (!finished) {
    handlers.onFinish?.();
  }
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!userMessageInput) return;

  const content = userMessageInput.value.trim();
  if (!content) {
    userMessageInput.focus();
    return;
  }

  appendMessage({ role: "user", content });
  conversation.push({ role: "user", content });
  userMessageInput.value = "";
  setFormDisabled(true);
  setStatus("思考中...", "busy");

  const pendingArticle = appendMessage(
    {
      role: "assistant",
      content: "思考中……",
      reasoning: "模型正在生成链式思维，请稍候。",
    },
    { returnNode: true, forceReasoningVisible: true, reasoningInitiallyOpen: true },
  );
  if (!pendingArticle) {
    throw new Error("未能创建助手消息容器。");
  }
  pendingArticle.dataset.state = "thinking";

  try {
    const payloadMessages = conversation.map((msg) => ({ role: msg.role, content: msg.content }));

    const reasoningBlock = pendingArticle?.querySelector(".推理块");
    const reasoningContent = pendingArticle?.querySelector(".推理内容");
    const contentEl = pendingArticle?.querySelector(".正文");

    const forceReasoning = (force) => {
      if (!reasoningBlock) return;
      reasoningBlock.dataset.forceVisible = force ? "true" : "false";
      const shouldShow = force || !!includeReasoningCheckbox?.checked;
      reasoningBlock.style.display = shouldShow ? "" : "none";
      if (shouldShow) {
        reasoningBlock.open = true;
      } else {
        reasoningBlock.open = false;
      }
    };

    const updateReasoningText = (text) => {
      if (reasoningContent) {
        reasoningContent.textContent = text || "";
      }
    };

    const updateContentText = (text) => {
      renderMarkdownInto(contentEl, text && text.trim() ? text : "正在整理回答……", "正在整理回答……");
    };

    let reasoningBuffer = "";
    let answerBuffer = "";
    forceReasoning(true);
    updateContentText("思考中……");

    await streamChatCompletion(payloadMessages, {
      onReasoningDelta(delta) {
        reasoningBuffer += delta;
        pendingArticle.dataset.state = "thinking";
        updateReasoningText(reasoningBuffer);
      },
      onContentDelta(delta) {
        if (!answerBuffer) {
          pendingArticle.dataset.state = "answering";
          forceReasoning(false);
        }
        answerBuffer += delta;
        updateContentText(answerBuffer);
      },
      onFinish() {
        pendingArticle.dataset.state = "answered";
      },
    });

    updateAssistantMessage(pendingArticle, {
      content: answerBuffer || "（模型未返回内容）",
      reasoning: reasoningBuffer || "",
    });
    pendingArticle?.querySelector(".推理块")?.setAttribute("data-force-visible", "false");
    conversation.push({ role: "assistant", content: answerBuffer || "" });
    setStatus("完成", "idle");
  } catch (error) {
    console.error(error);
    updateAssistantMessage(pendingArticle, {
      content: `抱歉，暂时无法连接后端模型接口。错误信息：${error.message}`,
      reasoning: "",
    });
    if (pendingArticle) {
      pendingArticle.dataset.state = "error";
    }
    setStatus("异常", "error");
  } finally {
    setFormDisabled(false);
    userMessageInput.focus();
  }
};

chatForm?.addEventListener("submit", handleSubmit);
resetButton?.addEventListener("click", resetConversation);
includeReasoningCheckbox?.addEventListener("change", syncReasoningVisibility);
userMessageInput?.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    chatForm?.requestSubmit();
  }
});

syncReasoningVisibility();
