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
