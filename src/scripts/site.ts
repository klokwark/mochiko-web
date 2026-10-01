export {};
const root = document.documentElement;
const header = document.querySelector<HTMLElement>("[data-site-header]");
const menu = document.querySelector<HTMLButtonElement>("[data-toggle-menu]");
const nav = document.querySelector<HTMLElement>("#main-navigation");
const closeMenu = () => {
  header?.classList.remove("menu-open");
  nav?.classList.remove("expanded");
  menu?.setAttribute("aria-expanded", "false");
  menu?.setAttribute("aria-label", "Open menu");
};
menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  header?.classList.toggle("menu-open", open);
  nav?.classList.toggle("expanded", open);
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  if (!event.target.closest("[data-site-header]")) closeMenu();
});
window.addEventListener("keydown", event => {
  if (event.key === "Escape" && menu?.getAttribute("aria-expanded") === "true") { closeMenu(); menu.focus(); }
});
const topButton = document.querySelector<HTMLButtonElement>("#back-top");
const scrollState = () => {
  header?.classList.toggle("scrolled", scrollY > 48);
  if (topButton) topButton.hidden = scrollY < 500;
};
window.addEventListener("scroll", scrollState, { passive: true });
topButton?.addEventListener("click", () => scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }));
scrollState();

const themeButton = document.querySelector<HTMLButtonElement>("[data-toggle-theme]");
const syncTheme = () => {
  const dark = root.classList.contains("dark");
  themeButton?.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  const icon = themeButton?.querySelector("i");
  if (icon) icon.className = dark ? "ph ph-moon" : "ph ph-sun";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#111520" : "#fff1f1");
};
themeButton?.addEventListener("click", () => {
  root.classList.toggle("dark");
  try { localStorage.setItem("mochiko_theme", root.classList.contains("dark") ? "dark" : "light"); } catch {}
  syncTheme();
});
syncTheme();

const dialog = document.querySelector<HTMLDialogElement>("[data-search-dialog]");
const searchInput = document.querySelector<HTMLInputElement>("[data-search-input]");
const results = [...document.querySelectorAll<HTMLElement>("[data-search-result]")];
const filterSearch = () => {
  const terms = (searchInput?.value || "").trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  let count = 0;
  results.forEach(result => {
    result.hidden = !terms.every(term => result.dataset.searchText?.includes(term));
    if (!result.hidden) count++;
  });
  const empty = document.querySelector<HTMLElement>("[data-search-empty]");
  if (empty) empty.hidden = count > 0;
};
const openSearch = () => {
  closeMenu();
  if (!dialog?.open) dialog?.showModal();
  searchInput?.focus();
};
document.querySelector("[data-open-search]")?.addEventListener("click", openSearch);
document.querySelector("[data-close-search]")?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
searchInput?.addEventListener("input", filterSearch);
window.addEventListener("keydown", event => {
  if (event.key === "Escape" && dialog?.open) { event.preventDefault(); dialog.close(); return; }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (dialog?.open) dialog.close(); else openSearch();
  }
});

let privacyOpener: HTMLElement | null = null;
const applyChoice = (choice: string) => {
  root.dataset.privacyChoice = ["accepted", "declined"].includes(choice) ? choice : "unset";
  document.querySelector("[data-privacy-consent]")?.removeAttribute("data-open");
  window.dispatchEvent(new CustomEvent("mochiko:privacy-choice"));
};
document.addEventListener("click", event => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const choice = target.closest("[data-privacy-accept]") ? "accepted" : target.closest("[data-privacy-decline]") ? "declined" : null;
  if (choice) {
    try { localStorage.setItem("mochiko_privacy_choice", choice); } catch {}
    applyChoice(choice);
    const returnFocus = privacyOpener?.isConnected ? privacyOpener : document.querySelector<HTMLElement>(".footer-legal [data-open-privacy]") ?? document.querySelector<HTMLElement>("#main-content");
    returnFocus?.focus({ preventScroll: true });
    privacyOpener = null;
  } else if (target.closest("[data-open-privacy]")) {
    event.preventDefault();
    privacyOpener = target.closest<HTMLElement>("[data-open-privacy]");
    document.querySelector("[data-privacy-consent]")?.setAttribute("data-open", "true");
    document.querySelector<HTMLElement>("[data-privacy-accept]")?.focus();
  }
});
window.addEventListener("storage", event => {
  if (event.key === "mochiko_privacy_choice" || event.key === null) applyChoice(event.newValue || "unset");
  if (event.key === "mochiko_theme") {
    root.classList.toggle("dark", event.newValue === "dark");
    syncTheme();
  }
});
