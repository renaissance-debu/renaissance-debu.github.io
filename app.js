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
      paused = reducedMotion.matches || saved === "paused";
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
  const showerButton = document.getElementById("starShower");
  const skyStatus = document.getElementById("skyStatus");
  let fireflies = [],
    meteors = [],
    nextMeteor = 2400;
  let pointer = { x: 0, y: 0 },
    breeze = { x: 0, y: 0 };
  let showerUntil = 0,
    visible = true;
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
        paused ? "播放星空与花海动画" : "暂停星空与花海动画",
      );
      motionButton.setAttribute("aria-pressed", String(paused));
      motionButton.title = paused ? "播放动画" : "暂停动画";
    }
    if (showerButton) {
      showerButton.disabled = paused || !context || showerUntil > 0;
      showerButton.title = paused
        ? "先开启页面右上角的动画播放"
        : "让星雨划过这片夜空";
    }
  };
  const spawnMeteor = (delay = 0, celebration = false) => {
    meteors.push({
      start: elapsed + delay,
      duration: celebration ? 1500 : 1900,
      x: width * (0.48 + Math.random() * 0.42),
      y: height * (0.04 + Math.random() * 0.25),
      length: celebration ? 100 : 75,
      distance: width * (0.14 + Math.random() * 0.1),
    });
  };
  const draw = () => {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    const daylight = root.dataset.theme === "light";
    for (const star of stars) {
      const alpha =
        0.2 + (Math.sin(elapsed * star.speed + star.phase) + 1) * 0.36;
      const x =
        star.x +
        Math.sin(elapsed * 0.00005 + star.phase) * 4 +
        breeze.x * star.radius;
      const y =
        star.y +
        Math.cos(elapsed * 0.00006 + star.phase) * 3 +
        breeze.y * star.radius;
      context.fillStyle = `rgba(248,233,195,${alpha * (daylight ? 0.6 : 1)})`;
      context.beginPath();
      context.arc(x, y, star.radius, 0, Math.PI * 2);
      context.fill();
      if (star.radius > 1.25) {
        context.strokeStyle = `rgba(246,228,183,${alpha * 0.35})`;
        context.lineWidth = 0.7;
        context.beginPath();
        context.moveTo(x - 4, y);
        context.lineTo(x + 4, y);
        context.moveTo(x, y - 4);
        context.lineTo(x, y + 4);
        context.stroke();
      }
    }
    for (const light of fireflies) {
      const glow =
        (0.35 + Math.sin(elapsed * 0.0011 + light.phase) * 0.3) *
        (daylight ? 0.5 : 1);
      const x =
        light.x + Math.sin(elapsed * 0.0004 + light.phase) * light.drift;
      const y = light.y + Math.cos(elapsed * 0.0003 + light.phase) * 19;
      const halo = context.createRadialGradient(x, y, 0, x, y, light.size * 6);
      halo.addColorStop(0, `rgba(236,225,153,${glow})`);
      halo.addColorStop(0.2, `rgba(218,223,156,${glow * 0.3})`);
      halo.addColorStop(1, "rgba(218,223,156,0)");
      context.fillStyle = halo;
      context.beginPath();
      context.arc(x, y, light.size * 6, 0, Math.PI * 2);
      context.fill();
    }
    // Active-time scheduling avoids bursts after returning from a background tab.
    meteors = meteors.filter(
      (meteor) => elapsed - meteor.start < meteor.duration,
    );
    for (const meteor of meteors) {
      const progress = (elapsed - meteor.start) / meteor.duration;
      if (progress < 0) continue;
      const x = meteor.x + progress * meteor.distance,
        y = meteor.y + progress * meteor.distance * 0.52;
      const opacity = Math.sin(progress * Math.PI) * 0.9;
      const gradient = context.createLinearGradient(
        x - meteor.length,
        y - meteor.length * 0.52,
        x,
        y,
      );
      gradient.addColorStop(0, "rgba(246,230,191,0)");
      gradient.addColorStop(1, `rgba(246,230,191,${opacity})`);
      context.strokeStyle = gradient;
      context.lineWidth = 1.4;
      context.beginPath();
      context.moveTo(x - meteor.length, y - meteor.length * 0.52);
      context.lineTo(x, y);
      context.stroke();
      context.fillStyle = `rgba(255,245,216,${opacity})`;
      context.beginPath();
      context.arc(x, y, 1.8, 0, Math.PI * 2);
      context.fill();
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
      breeze.x += (pointer.x - breeze.x) * 0.035;
      breeze.y += (pointer.y - breeze.y) * 0.035;
      if (elapsed >= nextMeteor) {
        spawnMeteor();
        nextMeteor = elapsed + 9000 + Math.random() * 4000;
      }
      if (showerUntil && elapsed >= showerUntil) {
        showerUntil = 0;
        showerButton.disabled = false;
        showerButton.setAttribute("aria-busy", "false");
        if (skyStatus) skyStatus.textContent = "星雨已落下，可以再许一次心愿。";
      }
      draw();
    }
    frame = requestAnimationFrame(tick);
  };
  const restart = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    root.dataset.sceneActive = !document.hidden && visible ? "true" : "false";
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
      { length: Math.min(150, Math.round(width / 6)) },
      () => ({
        x: random() * width,
        y: random() * height * 0.84,
        radius: random() * 1.25 + 0.35,
        phase: random() * Math.PI * 2,
        speed: 0.0005 + random() * 0.0005,
      }),
    );
    fireflies = Array.from({ length: width < 760 ? 12 : 26 }, () => ({
      x: width * (0.3 + random() * 0.68),
      y: height * (0.64 + random() * 0.29),
      phase: random() * Math.PI * 2,
      size: 0.8 + random() * 0.8,
      drift: 8 + random() * 18,
    }));
    meteors = [];
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
  showerButton?.addEventListener("click", () => {
    if (paused || !context || showerUntil) return;
    const count = width < 760 ? 4 : 7;
    for (let index = 0; index < count; index++) spawnMeteor(index * 230, true);
    showerUntil = elapsed + 3400;
    showerButton.disabled = true;
    showerButton.setAttribute("aria-busy", "true");
    if (skyStatus) skyStatus.textContent = "星雨正在划过夜空。";
    restart();
  });
  if (context) {
    const hero = canvas.closest(".hero");
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      hero.addEventListener(
        "pointermove",
        (event) => {
          if (paused || !visible) return;
          const bounds = hero.getBoundingClientRect();
          pointer = {
            x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 7,
            y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 5,
          };
        },
        { passive: true },
      );
      hero.addEventListener("pointerleave", () => {
        pointer = { x: 0, y: 0 };
      });
    }
    new ResizeObserver(resize).observe(canvas.parentElement);
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      restart();
    }).observe(canvas);
    document.addEventListener("visibilitychange", restart);
    resize();
  }
})();
