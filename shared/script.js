const rootBody = document.body;
const revealSections = document.querySelectorAll(".reveal");
const interactivePanels = document.querySelectorAll(".interactive-panel");
const navLinks = document.querySelectorAll("[data-nav]");

requestAnimationFrame(() => {
  rootBody.classList.add("is-ready");
});

navLinks.forEach((link) => {
  const isActive = link.dataset.nav === rootBody.dataset.page;
  link.classList.toggle("is-active", isActive);
  if (isActive) {
    link.setAttribute("aria-current", "page");
  }
});

if (revealSections.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealSections.forEach((section) => revealObserver.observe(section));
}

interactivePanels.forEach((panel) => {
  panel.addEventListener("pointermove", (event) => {
    const rect = panel.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    panel.style.setProperty("--spot-x", `${x}%`);
    panel.style.setProperty("--spot-y", `${y}%`);
  });

  panel.addEventListener("pointerleave", () => {
    panel.style.removeProperty("--spot-x");
    panel.style.removeProperty("--spot-y");
  });
});

const chatForm = document.getElementById("xulan-chat-form");

if (chatForm) {
  const chatWidget = document.getElementById("xulan-chat-widget");
  const chatLauncher = document.getElementById("xulan-chat-launcher");
  const chatCloseButton = document.getElementById("xulan-chat-close");
  const chatThread = document.getElementById("xulan-chat-thread");
  const chatInput = document.getElementById("xulan-chat-input");
  const chatSendButton = document.getElementById("xulan-chat-send");
  const chatResetButton = document.getElementById("xulan-chat-reset");
  const chatPromptToggle = document.getElementById("xulan-chat-toggle-prompts");
  const chatPrompts = document.getElementById("xulan-chat-prompts");
  const chatPromptButtons = Array.from(document.querySelectorAll(".chat-prompt"));
  const initialThreadMarkup = chatThread ? chatThread.innerHTML : "";
  const chatSessionKey = "xulan-chat-user-id";
  const safeStorage = (() => {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  })();

  const createSessionId = () =>
    `xulan-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

  let sessionUserId = safeStorage?.getItem(chatSessionKey);

  if (!sessionUserId) {
    sessionUserId = createSessionId();
    safeStorage?.setItem(chatSessionKey, sessionUserId);
  }

  let isSending = false;
  let isWidgetOpen = false;

  const setWidgetState = (open) => {
    isWidgetOpen = open;

    chatWidget?.classList.toggle("is-open", open);
    chatWidget?.setAttribute("aria-hidden", open ? "false" : "true");
    chatLauncher?.setAttribute("aria-expanded", open ? "true" : "false");
    chatLauncher?.classList.toggle("is-hidden", open);

    if (open) {
      requestAnimationFrame(() => {
        chatInput?.focus();
        scrollThreadToBottom();
      });
    }
  };

  const scrollThreadToBottom = () => {
    if (!chatThread) return;
    chatThread.scrollTop = chatThread.scrollHeight;
  };

  const setSendingState = (value) => {
    isSending = value;
    chatInput.disabled = value;
    chatSendButton.disabled = value;
    chatResetButton.disabled = value;
    chatPromptToggle.disabled = value;

    chatPromptButtons.forEach((button) => {
      button.disabled = value;
    });
  };

  const createMessage = (role, text, options = {}) => {
    const article = document.createElement("article");
    article.className = `chat-message chat-message--${role}`;

    if (options.variant) {
      article.classList.add(`chat-message--${options.variant}`);
    }

    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    article.appendChild(paragraph);
    chatThread.appendChild(article);
    scrollThreadToBottom();
    return article;
  };

  const submitMessage = async (rawMessage) => {
    const message = rawMessage.trim();

    if (!message || isSending) {
      return;
    }

    createMessage("user", message);
    chatInput.value = "";
    setSendingState(true);

    const typingMessage = createMessage(
      "assistant",
      "序蓝酱正在整理答案，请稍等一下。",
      { variant: "typing" },
    );

    try {
      const response = await fetch("/api/coze-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          userId: sessionUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || "请求失败，请稍后再试。");
      }

      typingMessage.classList.remove("chat-message--typing");
      typingMessage.querySelector("p").textContent =
        data.answer || "现在还没有拿到回复，请稍后再试。";
    } catch (error) {
      typingMessage.classList.remove("chat-message--typing");
      typingMessage.classList.add("chat-message--error");
      typingMessage.querySelector("p").textContent =
        error.message || "暂时无法连接产品助理，请稍后重试。";
    } finally {
      setSendingState(false);
      chatInput.focus();
      scrollThreadToBottom();
    }
  };

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitMessage(chatInput.value);
  });

  chatPromptButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = button.dataset.prompt || button.textContent || "";
      submitMessage(prompt);
    });
  });

  chatPromptToggle?.addEventListener("click", () => {
    chatPrompts?.classList.toggle("is-collapsed");
  });

  chatLauncher?.addEventListener("click", () => {
    setWidgetState(true);
  });

  chatCloseButton?.addEventListener("click", () => {
    setWidgetState(false);
  });

  chatResetButton?.addEventListener("click", () => {
    if (isSending || !chatThread) {
      return;
    }

    chatThread.innerHTML = initialThreadMarkup;
    scrollThreadToBottom();
    chatInput.focus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isWidgetOpen) {
      setWidgetState(false);
      chatLauncher?.focus();
    }
  });

  scrollThreadToBottom();
  setWidgetState(false);
}
