(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById("themeToggle");
  const motionButton = document.getElementById("motionToggle");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = reducedMotion.matches;
  let manualMotion = false;
  try {
    const saved = localStorage.getItem("garden-motion");
    if (saved !== null) {
      paused = saved === "paused";
      manualMotion = true;
    }
  } catch {
    /* Optional persistence. */
  }
  const syncTheme = () => {
    const dark = root.dataset.theme !== "light";
    themeButton.textContent = dark ? "☼" : "☾";
    themeButton.setAttribute(
      "aria-label",
      dark ? "切换到晨光主题" : "切换到星夜主题",
    );
    themeButton.title = dark ? "晨光主题" : "星夜主题";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? "#0b111b" : "#f6f4ee";
  };
  if (themeButton) {
    syncTheme();
    themeButton.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
      try {
        localStorage.setItem("theme", root.dataset.theme);
      } catch {
        /* Still works without storage. */
      }
      syncTheme();
    });
  }
  const canvas = document.getElementById("starfield");
  const context = canvas?.getContext("2d");
  let width = 0,
    height = 0,
    stars = [],
    frame = 0,
    previousTime = 0,
    elapsed = 0;
  const syncMotion = () => {
    root.dataset.motion = paused ? "paused" : "running";
    if (motionButton) {
      motionButton.textContent = paused ? "▷" : "Ⅱ";
      motionButton.setAttribute(
        "aria-label",
        paused ? "播放星空动画" : "暂停星空动画",
      );
      motionButton.setAttribute("aria-pressed", String(paused));
      motionButton.title = paused ? "播放动画" : "暂停动画";
    }
  };
  const draw = () => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    for (const star of stars) {
      const alpha =
        0.25 + (Math.sin(elapsed * star.speed + star.phase) + 1) * 0.27;
      context.fillStyle = `rgba(237,225,192,${alpha})`;
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    }
    // A quiet shooting star roughly every 16 seconds, only in the hero sky.
    const cycle = elapsed % 16000;
    if (!paused && cycle > 12500 && cycle < 13700) {
      const progress = (cycle - 12500) / 1200;
      const x = width * (0.64 + progress * 0.18),
        y = height * (0.1 + progress * 0.23);
      const gradient = context.createLinearGradient(x - 65, y - 30, x, y);
      gradient.addColorStop(0, "rgba(237,225,192,0)");
      gradient.addColorStop(
        1,
        `rgba(237,225,192,${Math.sin(progress * Math.PI) * 0.65})`,
      );
      context.strokeStyle = gradient;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(x - 65, y - 30);
      context.lineTo(x, y);
      context.stroke();
    }
  };
  const tick = (time) => {
    if (paused || document.hidden || !visible) {
      frame = 0;
      previousTime = 0;
      return;
    }
    if (time - previousTime > 40) {
      elapsed += previousTime ? Math.min(time - previousTime, 100) : 40;
      previousTime = time;
      draw();
    }
    frame = requestAnimationFrame(tick);
  };
  let visible = true;
  const restart = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    draw();
    if (context && !paused && !document.hidden && visible)
      frame = requestAnimationFrame(tick);
  };
  const resize = () => {
    if (!context) return;
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const scale = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    let seed = 2026;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    stars = Array.from(
      { length: Math.min(110, Math.round(width / 10)) },
      () => ({
        x: random() * width,
        y: random() * height * 0.84,
        radius: random() * 1.05 + 0.35,
        phase: random() * Math.PI * 2,
        speed: 0.0005 + random() * 0.0005,
      }),
    );
    restart();
  };
  motionButton?.addEventListener("click", () => {
    paused = !paused;
    manualMotion = true;
    try {
      localStorage.setItem("garden-motion", paused ? "paused" : "running");
    } catch {
      /* Optional. */
    }
    syncMotion();
    restart();
  });
  reducedMotion.addEventListener("change", () => {
    if (!manualMotion) {
      paused = reducedMotion.matches;
      syncMotion();
      restart();
    }
  });
  syncMotion();
  if (context) {
    new ResizeObserver(resize).observe(canvas.parentElement);
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      restart();
    }).observe(canvas);
    document.addEventListener("visibilitychange", restart);
    resize();
  }
})();
