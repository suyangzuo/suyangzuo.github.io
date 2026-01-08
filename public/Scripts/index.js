document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("liveChart");
  const modeButtons = document.querySelectorAll(".chart-controls [data-mode]");
  const toggleButton = document.getElementById("chartToggle");
  const modeLabel = document.getElementById("chartMode");
  const statusLabel = document.getElementById("chartStatus");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canvas || !canvas.getContext) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const state = {
    mode: "pulse",
    running: !prefersReducedMotion,
    points: Array.from({ length: 80 }, () => 0.5),
    lastUpdate: 0,
    interval: 500,
  };

  const setCanvasSize = () => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    ctx.scale(ratio, ratio);
  };

  const nextValue = () => {
    const base = state.mode === "steady" ? 0.55 : 0.5;
    const variance = state.mode === "steady" ? 0.08 : 0.18;
    const drift = (Math.sin(Date.now() / 1800) + 1) * 0.08;
    const value = base + drift + (Math.random() - 0.5) * variance;
    return Math.min(1, Math.max(0, value));
  };

  const draw = (timestamp) => {
    if (!state.running) {
      return;
    }

    if (!state.lastUpdate || timestamp - state.lastUpdate >= state.interval) {
      state.points.shift();
      state.points.push(nextValue());
      state.lastUpdate = timestamp;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const step = width / (state.points.length - 1);

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    for (let x = 0; x <= width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#00ffff");
    gradient.addColorStop(1, "#7b61ff");
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    state.points.forEach((value, index) => {
      const x = index * step;
      const y = height - value * height * 0.92 - height * 0.04;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.restore();

    ctx.save();
    const fill = ctx.createLinearGradient(0, 0, 0, height);
    fill.addColorStop(0, "rgba(0, 255, 255, 0.18)");
    fill.addColorStop(1, "rgba(123, 97, 255, 0)");
    ctx.fillStyle = fill;
    ctx.beginPath();
    state.points.forEach((value, index) => {
      const x = index * step;
      const y = height - value * height * 0.92 - height * 0.04;
      if (index === 0) {
        ctx.moveTo(x, height);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    requestAnimationFrame(draw);
  };

  setCanvasSize();
  state.running && requestAnimationFrame(draw);

  window.addEventListener("resize", () => {
    setCanvasSize();
    if (!state.running) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      state.mode = mode;
      modeLabel.textContent = mode === "steady" ? "稳态" : "脉冲";
      modeButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
    });
  });

  toggleButton?.addEventListener("click", () => {
    state.running = !state.running;
    toggleButton.textContent = state.running ? "暂停" : "继续";
    statusLabel.textContent = state.running ? "实时更新" : "已暂停";
    if (state.running) {
      state.lastUpdate = 0;
      requestAnimationFrame(draw);
    }
  });

  if (prefersReducedMotion) {
    statusLabel.textContent = "静止模式";
    toggleButton.textContent = "继续";
  }
});