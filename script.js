/*
  QUICK SETTINGS
  Set isLive to true while Mochiko is streaming.
  Replace [YOUTUBE VIDEO ID] in index.html to enable the lightweight video dialog.
*/
const SITE_SETTINGS = {
  isLive: false,
  liveLabel: "Live now",
  offlineLabel: "Offline"
};

const menuButton = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");

function setMenu(open) {
  if (!menuButton || !nav) return;
  menuButton.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

document.addEventListener("click", (event) => {
  if (!nav?.classList.contains("is-open")) return;
  if (!header?.contains(event.target)) setMenu(false);
});

const liveLink = document.querySelector(".nav-live");
const liveLabel = document.querySelector("[data-live-label]");

if (liveLink && liveLabel) {
  liveLink.classList.toggle("is-live", SITE_SETTINGS.isLive);
  liveLabel.textContent = SITE_SETTINGS.isLive
    ? SITE_SETTINGS.liveLabel
    : SITE_SETTINGS.offlineLabel;
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

let scrollQueued = false;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const parallaxArt = document.querySelector("[data-parallax]");

function updateScrollDetails() {
  const scrollY = window.scrollY;
  header?.classList.toggle("is-compact", scrollY > 24);

  if (parallaxArt && !prefersReducedMotion.matches && scrollY < window.innerHeight * 1.25) {
    const shift = Math.min(10, scrollY * 0.018);
    parallaxArt.style.setProperty("--parallax-y", `${shift}px`);
  }

  scrollQueued = false;
}

window.addEventListener("scroll", () => {
  if (scrollQueued) return;
  scrollQueued = true;
  window.requestAnimationFrame(updateScrollDetails);
}, { passive: true });

updateScrollDetails();

const videoDialog = document.querySelector("[data-video-dialog]");
const videoFrame = document.querySelector("[data-video-frame]");
const videoClose = document.querySelector("[data-video-close]");

document.querySelectorAll("[data-video-id]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const videoId = link.dataset.videoId?.trim();

    // A normal link remains the fallback until a real 11-character YouTube ID is added.
    if (!videoId || videoId.startsWith("[") || videoId.length !== 11 || !videoDialog || !videoFrame) {
      return;
    }

    event.preventDefault();
    const title = link.dataset.videoTitle || "Mochiko video";
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1`;
    iframe.title = title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    videoFrame.replaceChildren(iframe);
    videoDialog.showModal();
  });
});

function closeVideo() {
  if (!videoDialog?.open) return;
  videoDialog.close();
  videoFrame?.replaceChildren();
}

videoClose?.addEventListener("click", closeVideo);
videoDialog?.addEventListener("click", (event) => {
  if (event.target === videoDialog) closeVideo();
});

videoDialog?.addEventListener("close", () => {
  videoFrame?.replaceChildren();
});
