const rootBody = document.body;
const revealSections = document.querySelectorAll(".reveal");
const interactivePanels = document.querySelectorAll(".interactive-panel");
const navLinks = document.querySelectorAll("[data-nav]");
const storySteps = Array.from(document.querySelectorAll(".story-step"));

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

const storyMonitor = {
  kicker: document.getElementById("story-monitor-kicker"),
  title: document.getElementById("story-monitor-title"),
  copy: document.getElementById("story-monitor-copy"),
  label: document.getElementById("story-monitor-metric-label"),
  value: document.getElementById("story-monitor-metric-value"),
};

const setActiveStory = (step) => {
  storySteps.forEach((item) => {
    item.classList.toggle("is-active", item === step);
  });

  if (!step || !storyMonitor.title) {
    return;
  }

  storyMonitor.kicker.textContent = step.dataset.storyKicker || "";
  storyMonitor.title.textContent = step.dataset.storyTitle || "";
  storyMonitor.copy.textContent = step.dataset.storyCopy || "";
  storyMonitor.label.textContent = step.dataset.storyMetricLabel || "";
  storyMonitor.value.textContent = step.dataset.storyMetricValue || "";
};

if (storySteps.length && storyMonitor.title) {
  setActiveStory(storySteps[0]);

  const storyObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

      if (visibleEntries.length) {
        setActiveStory(visibleEntries[0].target);
      }
    },
    {
      threshold: [0.3, 0.5, 0.7],
      rootMargin: "-8% 0px -18% 0px",
    },
  );

  storySteps.forEach((step) => storyObserver.observe(step));
}

const updateScrollProgress = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  rootBody.style.setProperty("--scroll-progress", progress.toFixed(4));
};

let pendingFrame = null;

const requestScrollUpdate = () => {
  if (pendingFrame) {
    return;
  }

  pendingFrame = requestAnimationFrame(() => {
    updateScrollProgress();
    pendingFrame = null;
  });
};

updateScrollProgress();
window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
