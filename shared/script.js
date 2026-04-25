const sections = document.querySelectorAll(".reveal");
const rootBody = document.body;

requestAnimationFrame(() => {
  rootBody.classList.add("is-ready");
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -6% 0px",
  },
);

sections.forEach((section) => revealObserver.observe(section));

const navLinks = Array.from(document.querySelectorAll(".topnav a")).filter((link) =>
  (link.getAttribute("href") || "").startsWith("#"),
);
const trackedSections = navLinks
  .map((link) => {
    const targetId = link.getAttribute("href");
    return targetId ? document.querySelector(targetId) : null;
  })
  .filter(Boolean);

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("is-active", active);
      });
    });
  },
  {
    threshold: 0.38,
    rootMargin: "-18% 0px -44% 0px",
  },
);

trackedSections.forEach((section) => navObserver.observe(section));

const interactivePanels = document.querySelectorAll(".interactive-panel");

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
