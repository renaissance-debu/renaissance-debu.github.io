// Apply the saved palette before the stylesheet paints. Storage may be blocked.
(() => {
  try {
    const saved = localStorage.getItem("theme");
    document.documentElement.dataset.theme =
      saved === "light" ? "light" : "dark";
  } catch {
    document.documentElement.dataset.theme = "dark";
  }
})();
