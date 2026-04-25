const sections = document.querySelectorAll(".reveal");

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
