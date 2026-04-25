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

const progressBar = document.querySelector(".reading-progress-bar");

if (progressBar) {
  const updateReadingProgress = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  updateReadingProgress();
  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", updateReadingProgress);
}

const chapterRailLinks = Array.from(document.querySelectorAll(".chapter-link"));

if (chapterRailLinks.length) {
  const chapterTargets = chapterRailLinks
    .map((link) => {
      const targetId = link.getAttribute("href");
      const target = targetId ? document.querySelector(targetId) : null;
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  const chapterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        chapterTargets.forEach(({ link, target }) => {
          link.classList.toggle("is-current", target === entry.target);
        });
      });
    },
    {
      threshold: 0.24,
      rootMargin: "-16% 0px -56% 0px",
    },
  );

  chapterTargets.forEach(({ target }) => chapterObserver.observe(target));
}

const dependencyTabs = Array.from(document.querySelectorAll(".dependency-tab"));
const dependencyPanels = Array.from(document.querySelectorAll(".dependency-panel"));
const dependencyMeterSegments = Array.from(document.querySelectorAll(".dependency-meter span"));

if (dependencyTabs.length && dependencyPanels.length) {
  const activateDependencyPanel = (nextTab) => {
    const panelId = nextTab.dataset.panel;
    const meterCount = Number(nextTab.dataset.meter || "0");

    dependencyTabs.forEach((tab) => {
      const isActive = tab === nextTab;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    dependencyPanels.forEach((panel) => {
      const isActive = panel.id === panelId;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });

    dependencyMeterSegments.forEach((segment, index) => {
      segment.classList.toggle("is-on", index < meterCount);
    });
  };

  dependencyTabs.forEach((tab, index) => {
    tab.tabIndex = tab.classList.contains("is-active") ? 0 : -1;

    tab.addEventListener("click", () => {
      activateDependencyPanel(tab);
    });

    tab.addEventListener("keydown", (event) => {
      const navigationKeys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];

      if (!navigationKeys.includes(event.key)) {
        return;
      }

      event.preventDefault();

      let nextIndex = index;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % dependencyTabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + dependencyTabs.length) % dependencyTabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = dependencyTabs.length - 1;
      }

      const nextTab = dependencyTabs[nextIndex];
      activateDependencyPanel(nextTab);
      nextTab.focus();
    });
  });

  const initialTab = dependencyTabs.find((tab) => tab.classList.contains("is-active")) || dependencyTabs[0];
  activateDependencyPanel(initialTab);
}
